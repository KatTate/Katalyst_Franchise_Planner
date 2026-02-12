import { Router, Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { brandParameterSchema, startupCostTemplateSchema } from "@shared/schema";
import { requireAuth, requireRole } from "../middleware/auth";
import { runBrandValidation, type ValidationTestInputs, type ValidationExpectedOutputs } from "../services/brand-validation-service";
import type { ValidationToleranceConfig } from "@shared/schema";

const router = Router();

const createBrandSchema = z.object({
  name: z.string().min(1, "Brand name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  display_name: z.string().max(100).optional(),
});

router.get(
  "/",
  requireAuth,
  requireRole("katalyst_admin", "franchisor"),
  async (req: Request, res: Response) => {
    const user = req.user!;
    if (user.role === "franchisor" && user.brandId) {
      const brand = await storage.getBrand(user.brandId);
      return res.json(brand ? [brand] : []);
    }
    const allBrands = await storage.getBrands();
    return res.json(allBrands);
  }
);

router.post(
  "/",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request, res: Response) => {
    const parsed = createBrandSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors.map((e) => ({ path: e.path.map(String), message: e.message })),
      });
    }

    const existingSlug = await storage.getBrandBySlug(parsed.data.slug);
    if (existingSlug) {
      return res.status(409).json({ message: "A brand with this slug already exists" });
    }

    const existingName = await storage.getBrandByName(parsed.data.name);
    if (existingName) {
      return res.status(409).json({ message: "A brand with this name already exists" });
    }

    const brand = await storage.createBrand({
      name: parsed.data.name,
      slug: parsed.data.slug,
      displayName: parsed.data.display_name || parsed.data.name,
    });

    return res.status(201).json(brand);
  }
);

router.get(
  "/:brandId",
  requireAuth,
  requireRole("katalyst_admin", "franchisor", "franchisee"),
  async (req: Request<{ brandId: string }>, res: Response) => {
    const { brandId } = req.params;
    const user = req.user!;
    if ((user.role === "franchisor" || user.role === "franchisee") && user.brandId && user.brandId !== brandId) {
      return res.status(403).json({ message: "Access denied — you can only view your own brand" });
    }
    const brand = await storage.getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    return res.json(brand);
  }
);

router.put(
  "/:brandId",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string }>, res: Response) => {
    const { brandId } = req.params;
    const brand = await storage.getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const updateSchema = z.object({
      name: z.string().min(1).max(100).optional(),
      display_name: z.string().max(100).optional(),
    });

    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors.map((e) => ({ path: e.path.map(String), message: e.message })),
      });
    }

    const updateData: Record<string, any> = {};
    if (parsed.data.name) updateData.name = parsed.data.name;
    if (parsed.data.display_name !== undefined) updateData.displayName = parsed.data.display_name;

    const updated = await storage.updateBrand(brandId, updateData);
    return res.json(updated);
  }
);

router.get(
  "/:brandId/parameters",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string }>, res: Response) => {
    const { brandId } = req.params;
    const brand = await storage.getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    return res.json(brand.brandParameters || null);
  }
);

router.put(
  "/:brandId/parameters",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string }>, res: Response) => {
    const { brandId } = req.params;
    const brand = await storage.getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const parsed = brandParameterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors.map((e) => ({ path: e.path.map(String), message: e.message })),
      });
    }

    const updated = await storage.updateBrandParameters(brandId, parsed.data);
    return res.json(updated.brandParameters);
  }
);

router.get(
  "/:brandId/startup-cost-template",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string }>, res: Response) => {
    const { brandId } = req.params;
    const brand = await storage.getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    return res.json(brand.startupCostTemplate || []);
  }
);

router.put(
  "/:brandId/startup-cost-template",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string }>, res: Response) => {
    const { brandId } = req.params;
    const brand = await storage.getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const parsed = startupCostTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors.map((e) => ({ path: e.path.map(String), message: e.message })),
      });
    }

    const updated = await storage.updateStartupCostTemplate(brandId, parsed.data);
    return res.json(updated.startupCostTemplate);
  }
);

const brandIdentitySchema = z.object({
  display_name: z.string().max(100).nullable().optional(),
  logo_url: z.string().url().nullable().optional(),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color").nullable().optional(),
  default_booking_url: z.string().url().nullable().optional(),
  franchisor_acknowledgment_enabled: z.boolean().optional(),
});

router.put(
  "/:brandId/identity",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string }>, res: Response) => {
    const { brandId } = req.params;
    const brand = await storage.getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const parsed = brandIdentitySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors.map((e) => ({ path: e.path.map(String), message: e.message })),
      });
    }

    const updateData: Record<string, any> = {};
    if (parsed.data.display_name !== undefined) updateData.displayName = parsed.data.display_name;
    if (parsed.data.logo_url !== undefined) updateData.logoUrl = parsed.data.logo_url;
    if (parsed.data.primary_color !== undefined) updateData.primaryColor = parsed.data.primary_color;
    if (parsed.data.default_booking_url !== undefined) updateData.defaultBookingUrl = parsed.data.default_booking_url;
    if (parsed.data.franchisor_acknowledgment_enabled !== undefined) updateData.franchisorAcknowledgmentEnabled = parsed.data.franchisor_acknowledgment_enabled;

    const updated = await storage.updateBrandIdentity(brandId, updateData);
    return res.json(updated);
  }
);

router.get(
  "/:brandId/franchisees",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string }>, res: Response) => {
    const { brandId } = req.params;
    const brand = await storage.getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const franchisees = await storage.getFranchiseesByBrand(brandId);
    return res.json(franchisees.map((f) => ({
      id: f.id,
      email: f.email,
      displayName: f.displayName,
      accountManagerId: f.accountManagerId,
      bookingUrl: f.bookingUrl,
    })));
  }
);

router.get(
  "/:brandId/account-managers",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string }>, res: Response) => {
    const { brandId } = req.params;
    const brand = await storage.getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    const brandManagers = await storage.getBrandAccountManagers(brandId);
    return res.json(brandManagers);
  }
);

const upsertBrandAccountManagerSchema = z.object({
  account_manager_id: z.string().min(1, "Account manager is required"),
  booking_url: z.string().url("Must be a valid URL").nullable().optional(),
});

router.put(
  "/:brandId/account-managers",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string }>, res: Response) => {
    const { brandId } = req.params;
    const brand = await storage.getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const parsed = upsertBrandAccountManagerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors.map((e) => ({ path: e.path.map(String), message: e.message })),
      });
    }

    const manager = await storage.getUser(parsed.data.account_manager_id);
    if (!manager || manager.role !== "katalyst_admin") {
      return res.status(404).json({ message: "Account manager not found or not a Katalyst admin" });
    }

    const result = await storage.upsertBrandAccountManager(
      brandId,
      parsed.data.account_manager_id,
      parsed.data.booking_url ?? null,
    );
    return res.json(result);
  }
);

router.delete(
  "/:brandId/account-managers/:managerId",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string; managerId: string }>, res: Response) => {
    const { brandId, managerId } = req.params;

    const brand = await storage.getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    if (brand.defaultAccountManagerId === managerId) {
      await storage.setDefaultAccountManager(brandId, null);
    }

    await storage.removeBrandAccountManager(brandId, managerId);
    return res.json({ success: true });
  }
);

const setDefaultManagerSchema = z.object({
  account_manager_id: z.string().min(1).nullable(),
});

router.put(
  "/:brandId/default-account-manager",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string }>, res: Response) => {
    const { brandId } = req.params;
    const brand = await storage.getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const parsed = setDefaultManagerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors.map((e) => ({ path: e.path.map(String), message: e.message })),
      });
    }

    if (parsed.data.account_manager_id) {
      const existing = await storage.getBrandAccountManager(brandId, parsed.data.account_manager_id);
      if (!existing) {
        return res.status(400).json({ message: "This account manager is not associated with this brand. Add them first." });
      }
    }

    const updated = await storage.setDefaultAccountManager(brandId, parsed.data.account_manager_id);
    return res.json(updated);
  }
);

const validationRequestSchema = z.object({
  inputs: z.object({
    revenue: z.object({
      monthlyAuv: z.number().optional(),
      year1GrowthRate: z.number().optional(),
      year2GrowthRate: z.number().optional(),
      startingMonthAuvPct: z.number().optional(),
    }).optional(),
    operatingCosts: z.object({
      cogsPct: z.number().optional(),
      laborPct: z.number().optional(),
      rentMonthly: z.number().optional(),
      utilitiesMonthly: z.number().optional(),
      insuranceMonthly: z.number().optional(),
      marketingPct: z.number().optional(),
      royaltyPct: z.number().optional(),
      adFundPct: z.number().optional(),
      otherMonthly: z.number().optional(),
    }).optional(),
    financing: z.object({
      loanAmount: z.number().optional(),
      interestRate: z.number().optional(),
      loanTermMonths: z.number().optional(),
      downPaymentPct: z.number().optional(),
    }).optional(),
    startupCapital: z.object({
      workingCapitalMonths: z.number().optional(),
      depreciationYears: z.number().optional(),
    }).optional(),
    startupCosts: z.array(z.object({
      name: z.string(),
      amount: z.number(),
    })).optional(),
  }).default({}),
  expectedOutputs: z.object({
    roiMetrics: z.object({
      totalStartupInvestment: z.number().optional(),
      fiveYearCumulativeCashFlow: z.number().optional(),
      fiveYearROIPct: z.number().optional(),
      breakEvenMonth: z.number().nullable().optional(),
    }).optional(),
    annualSummaries: z.array(z.object({
      year: z.number(),
      revenue: z.number().optional(),
      totalCogs: z.number().optional(),
      grossProfit: z.number().optional(),
      totalOpex: z.number().optional(),
      ebitda: z.number().optional(),
      preTaxIncome: z.number().optional(),
      endingCash: z.number().optional(),
    })).optional(),
    identityChecks: z.boolean().optional(),
  }),
  tolerances: z.object({
    currency: z.number().min(0).optional(),
    percentage: z.number().min(0).optional(),
    months: z.number().min(0).optional(),
  }).optional(),
  notes: z.string().max(500).optional(),
});

router.post(
  "/:brandId/validate",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string }>, res: Response) => {
    const { brandId } = req.params;
    const brand = await storage.getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    if (!brand.brandParameters) {
      return res.status(400).json({ message: "Brand does not have financial parameters configured. Please configure parameters first." });
    }

    const parsed = validationRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation request failed",
        errors: parsed.error.errors.map((e) => ({ path: e.path.map(String), message: e.message })),
      });
    }

    try {
      const result = runBrandValidation(
        brand,
        parsed.data.inputs as ValidationTestInputs,
        parsed.data.expectedOutputs as ValidationExpectedOutputs,
        parsed.data.tolerances as Partial<ValidationToleranceConfig> | undefined,
      );

      const savedRun = await storage.createBrandValidationRun({
        brandId,
        runAt: new Date(),
        status: result.status,
        testInputs: result.testInputs,
        expectedOutputs: result.expectedOutputs,
        actualOutputs: result.actualOutputs,
        comparisonResults: result.comparisonResults,
        toleranceConfig: result.toleranceConfig,
        runBy: req.user!.id,
        notes: parsed.data.notes ?? null,
      });

      return res.json({
        ...result,
        runId: savedRun.id,
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || "Validation engine error" });
    }
  }
);

router.get(
  "/:brandId/validation-runs",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string }>, res: Response) => {
    const { brandId } = req.params;
    const brand = await storage.getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const runs = await storage.getBrandValidationRuns(brandId);
    return res.json(runs);
  }
);

router.get(
  "/:brandId/validation-runs/:runId",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string; runId: string }>, res: Response) => {
    const { runId } = req.params;
    const run = await storage.getBrandValidationRun(runId);
    if (!run) {
      return res.status(404).json({ message: "Validation run not found" });
    }
    return res.json(run);
  }
);

export default router;
