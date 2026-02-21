import { Router, Request, Response } from "express";
import multer from "multer";
import { z } from "zod";
import { storage } from "../storage";
import { brandParameterSchema, startupCostTemplateSchema } from "@shared/schema";
import { requireAuth, requireRole, getEffectiveUser } from "../middleware/auth";
import {
  runFddExtraction,
  retryFddExtraction,
  mergeExtractedParameters,
  validatePdfBuffer,
} from "../services/fdd-ingestion-service";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Only PDF files are allowed"));
      return;
    }
    cb(null, true);
  },
});

// ─── GET ingestion run history ────────────────────────────────────────────

router.get(
  "/:brandId/fdd-ingestion/runs",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string }>, res: Response) => {
    const { brandId } = req.params;
    const brand = await storage.getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    const runs = await storage.getFddIngestionRuns(brandId);
    return res.json(runs);
  }
);

// ─── POST upload & extract ────────────────────────────────────────────────

router.post(
  "/:brandId/fdd-ingestion/extract",
  requireAuth,
  requireRole("katalyst_admin"),
  (req: Request<{ brandId: string }>, res: Response, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "File size exceeds 20MB limit" });
          }
          return res.status(400).json({ message: err.message });
        }
        return res.status(400).json({ message: err.message || "File upload failed" });
      }
      next();
    });
  },
  async (req: Request<{ brandId: string }>, res: Response) => {
    try {
      const { brandId } = req.params;
      const brand = await storage.getBrand(brandId);
      if (!brand) {
        return res.status(404).json({ message: "Brand not found" });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const pdfValidation = validatePdfBuffer(file.buffer);
      if (!pdfValidation.valid) {
        return res.status(400).json({ message: pdfValidation.error });
      }

      const effectiveUser = await getEffectiveUser(req);

      const updatedRun = await runFddExtraction(
        file.buffer,
        brand,
        effectiveUser.id,
        file.originalname,
      );

      return res.json(updatedRun);
    } catch (error: any) {
      return res.status(500).json({
        message: "AI extraction failed",
        error: error.message || "Unknown error",
      });
    }
  }
);

// ─── POST retry failed extraction ─────────────────────────────────────────

router.post(
  "/:brandId/fdd-ingestion/:runId/retry",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string; runId: string }>, res: Response) => {
    try {
      const { brandId, runId } = req.params;
      const brand = await storage.getBrand(brandId);
      if (!brand) {
        return res.status(404).json({ message: "Brand not found" });
      }

      const run = await storage.getFddIngestionRun(runId);
      if (!run || run.brandId !== brandId) {
        return res.status(404).json({ message: "Ingestion run not found" });
      }

      if (run.status !== "failed") {
        return res.status(400).json({ message: "Can only retry failed extractions" });
      }

      const updatedRun = await retryFddExtraction(run, brand.name);
      return res.json(updatedRun);
    } catch (error: any) {
      return res.status(500).json({
        message: "Retry failed",
        error: error.message || "Unknown error",
      });
    }
  }
);

// ─── POST apply extracted parameters ──────────────────────────────────────

const applyParametersBodySchema = z.object({
  parameters: z.record(z.any()).optional(),
});

router.post(
  "/:brandId/fdd-ingestion/:runId/apply-parameters",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string; runId: string }>, res: Response) => {
    try {
      const { brandId, runId } = req.params;
      const brand = await storage.getBrand(brandId);
      if (!brand) {
        return res.status(404).json({ message: "Brand not found" });
      }

      const run = await storage.getFddIngestionRun(runId);
      if (!run || run.brandId !== brandId) {
        return res.status(404).json({ message: "Ingestion run not found" });
      }

      if (!run.extractedData) {
        return res.status(400).json({ message: "No extracted data available" });
      }

      const bodyParse = applyParametersBodySchema.safeParse(req.body);
      if (!bodyParse.success) {
        return res.status(400).json({
          message: "Invalid request body",
          errors: bodyParse.error.errors.map((e) => ({ path: e.path.map(String), message: e.message })),
        });
      }

      const editedParameters = bodyParse.data.parameters || run.extractedData.parameters;
      const merged = mergeExtractedParameters(editedParameters, brand.brandParameters || null);

      const validation = brandParameterSchema.safeParse(merged);
      if (!validation.success) {
        return res.status(400).json({
          message: "Merged parameters failed validation",
          errors: validation.error.errors.map((e) => ({ path: e.path.map(String), message: e.message })),
        });
      }

      await storage.updateBrandParameters(brandId, validation.data);

      const newStatus = run.status === "applied_startup_costs" ? "applied_both" : "applied_parameters";
      await storage.updateFddIngestionRun(runId, {
        status: newStatus,
        appliedAt: new Date(),
      });

      return res.json({ message: "Financial parameters applied successfully", status: newStatus });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }
);

// ─── POST apply extracted startup costs ───────────────────────────────────

const applyStartupCostsBodySchema = z.object({
  startupCosts: z.array(z.any()).optional(),
});

router.post(
  "/:brandId/fdd-ingestion/:runId/apply-startup-costs",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string; runId: string }>, res: Response) => {
    try {
      const { brandId, runId } = req.params;
      const brand = await storage.getBrand(brandId);
      if (!brand) {
        return res.status(404).json({ message: "Brand not found" });
      }

      const run = await storage.getFddIngestionRun(runId);
      if (!run || run.brandId !== brandId) {
        return res.status(404).json({ message: "Ingestion run not found" });
      }

      if (!run.extractedData) {
        return res.status(400).json({ message: "No extracted data available" });
      }

      const bodyParse = applyStartupCostsBodySchema.safeParse(req.body);
      if (!bodyParse.success) {
        return res.status(400).json({
          message: "Invalid request body",
          errors: bodyParse.error.errors.map((e) => ({ path: e.path.map(String), message: e.message })),
        });
      }

      const startupCosts = bodyParse.data.startupCosts || run.extractedData.startupCosts;

      const validation = startupCostTemplateSchema.safeParse(startupCosts);
      if (!validation.success) {
        return res.status(400).json({
          message: "Startup cost template failed validation",
          errors: validation.error.errors.map((e) => ({ path: e.path.map(String), message: e.message })),
        });
      }

      await storage.updateStartupCostTemplate(brandId, validation.data);

      const newStatus = run.status === "applied_parameters" ? "applied_both" : "applied_startup_costs";
      await storage.updateFddIngestionRun(runId, {
        status: newStatus,
        appliedAt: new Date(),
      });

      return res.json({ message: "Startup costs applied successfully", status: newStatus });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }
);

export default router;
