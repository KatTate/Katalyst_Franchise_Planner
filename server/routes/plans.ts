import { Router, type Request, type Response } from "express";
import { requireAuth, getEffectiveUser, requireReadOnlyImpersonation, isImpersonating } from "../middleware/auth";
import { storage } from "../storage";
import {
  insertPlanSchema,
  planStartupCostsSchema,
  planFinancialInputsSchema,
  updatePlanSchema,
  type Plan,
} from "@shared/schema";
import { z } from "zod";
import { computePlanOutputs } from "../services/financial-service";
import { buildPlanFinancialInputs, buildPlanStartupCosts } from "@shared/plan-initialization";

const createPlanRequestSchema = z.object({
  name: z.string().min(1, "Plan name is required").max(100, "Plan name must be 100 characters or less"),
});

const router = Router();

function getAdminSourceTag(req: Request): string | null {
  if (!isImpersonating(req) || !req.session?.impersonation_edit_enabled) {
    return null;
  }
  const admin = req.user!;
  return `admin:${(admin as any).displayName || (admin as any).email}`;
}

function stampAdminSource(financialInputs: any, sourceTag: string): void {
  for (const section of Object.values(financialInputs) as any[]) {
    if (section && typeof section === "object") {
      for (const field of Object.values(section) as any[]) {
        if (field && typeof field === "object" && "source" in field) {
          field.source = sourceTag;
          field.lastModifiedAt = new Date().toISOString();
        }
      }
    }
  }
}

/** Ownership check using effective user: franchisee can only access own plans; franchisor scoped to own brand. */
async function requirePlanAccess(req: Request, res: Response): Promise<Plan | null> {
  const planId = req.params.planId as string;
  const plan = await storage.getPlan(planId);
  if (!plan) {
    res.status(404).json({ message: "Plan not found" });
    return null;
  }
  const effectiveUser = await getEffectiveUser(req);
  if (effectiveUser.role === "franchisee" && plan.userId !== effectiveUser.id) {
    res.status(403).json({ message: "Access denied" });
    return null;
  }
  if (effectiveUser.role === "franchisor" && plan.brandId !== effectiveUser.brandId) {
    res.status(403).json({ message: "Access denied" });
    return null;
  }
  return plan;
}

// GET /api/plans — list plans for current effective user
router.get(
  "/",
  requireAuth,
  async (req: Request, res: Response) => {
    const effectiveUser = await getEffectiveUser(req);
    let plans;
    if (effectiveUser.role === "katalyst_admin") {
      plans = [];
    } else if (effectiveUser.role === "franchisor") {
      plans = effectiveUser.brandId
        ? await storage.getPlansByBrand(effectiveUser.brandId)
        : [];
    } else {
      plans = await storage.getPlansByUser(effectiveUser.id);
    }
    return res.json(plans);
  }
);

// POST /api/plans — create a new plan with brand defaults
router.post(
  "/",
  requireAuth,
  async (req: Request, res: Response) => {
    const parsed = createPlanRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors.map((e) => ({
          path: e.path.map(String),
          message: e.message,
        })),
      });
    }

    const effectiveUser = await getEffectiveUser(req);
    if (!effectiveUser.brandId) {
      return res.status(400).json({ message: "No brand associated with this user" });
    }

    const brand = await storage.getBrand(effectiveUser.brandId);
    if (!brand) {
      return res.status(400).json({ message: "Brand not found" });
    }

    const financialInputs = brand.brandParameters
      ? buildPlanFinancialInputs(brand.brandParameters as any)
      : null;
    const startupCosts = brand.startupCostTemplate
      ? buildPlanStartupCosts(brand.startupCostTemplate as any)
      : null;

    const plan = await storage.createPlan({
      userId: effectiveUser.id,
      brandId: effectiveUser.brandId,
      name: parsed.data.name,
      financialInputs: financialInputs as any,
      startupCosts: startupCosts as any,
      status: "draft",
    } as any);
    return res.status(201).json(plan);
  }
);

// GET /api/plans/:planId — return complete plan object
router.get(
  "/:planId",
  requireAuth,
  async (req: Request<{ planId: string }>, res: Response) => {
    const plan = await requirePlanAccess(req, res);
    if (plan === null) return;

    return res.json({ data: plan });
  }
);

// PATCH /api/plans/:planId — partial plan update (financial inputs, name, etc.)
router.patch(
  "/:planId",
  requireAuth,
  requireReadOnlyImpersonation,
  async (req: Request<{ planId: string }>, res: Response) => {
    const plan = await requirePlanAccess(req, res);
    if (plan === null) return;

    // Stage 1: top-level schema validation
    const parsed = updatePlanSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors.map((e) => ({
          path: e.path.map(String),
          message: e.message,
        })),
      });
    }

    // Stage 1b: strip protected fields that clients must never mutate
    const { userId, brandId, ...allowedFields } = parsed.data;

    if (allowedFields.name !== undefined) {
      const trimmedName = String(allowedFields.name).trim();
      if (trimmedName.length === 0 || trimmedName.length > 100) {
        return res.status(400).json({ message: "Plan name must be between 1 and 100 characters" });
      }
      allowedFields.name = trimmedName;
    }

    // Stage 1c: conflict detection — compare client's expected updatedAt with current DB value
    const clientUpdatedAt = req.body._expectedUpdatedAt;
    if (clientUpdatedAt) {
      const currentUpdatedAt = plan.updatedAt ? new Date(plan.updatedAt).toISOString() : null;
      if (currentUpdatedAt && clientUpdatedAt !== currentUpdatedAt) {
        return res.status(409).json({
          message: "This plan was updated in another tab. Please reload to see the latest version.",
          code: "CONFLICT",
          serverUpdatedAt: currentUpdatedAt,
        });
      }
    }

    // Stage 2: deep validation for financialInputs when present
    if (allowedFields.financialInputs !== undefined) {
      const fiParsed = planFinancialInputsSchema.safeParse(
        allowedFields.financialInputs
      );
      if (!fiParsed.success) {
        return res.status(400).json({
          message: "Financial inputs validation failed",
          errors: fiParsed.error.errors.map((e) => ({
            path: e.path.map(String),
            message: e.message,
          })),
        });
      }
      allowedFields.financialInputs = fiParsed.data as typeof allowedFields.financialInputs;

      const adminTag = getAdminSourceTag(req);
      if (adminTag) {
        stampAdminSource(allowedFields.financialInputs, adminTag);
      }
    }

    // Stage 3: persist — also update lastAutoSave timestamp
    const dataWithTimestamp = { ...allowedFields, lastAutoSave: new Date() };
    const updated = await storage.updatePlan(req.params.planId, dataWithTimestamp as any);

    const auditLogId = req.session?.impersonation_audit_log_id;
    if (auditLogId && allowedFields.financialInputs !== undefined) {
      storage.appendAuditLogAction(auditLogId, "Modified financial inputs").catch(() => {});
    }

    return res.json({ data: updated });
  }
);

// GET /api/plans/:planId/startup-costs
router.get(
  "/:planId/startup-costs",
  requireAuth,
  async (req: Request<{ planId: string }>, res: Response) => {
    const plan = await requirePlanAccess(req, res);
    if (plan === null) return;

    const costs = await storage.getStartupCosts(req.params.planId);
    return res.json(costs);
  }
);

// PUT /api/plans/:planId/startup-costs
router.put(
  "/:planId/startup-costs",
  requireAuth,
  requireReadOnlyImpersonation,
  async (req: Request<{ planId: string }>, res: Response) => {
    const plan = await requirePlanAccess(req, res);
    if (plan === null) return;

    const parsed = planStartupCostsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors.map((e) => ({
          path: e.path.map(String),
          message: e.message,
        })),
      });
    }

    const items = parsed.data;
    const adminTag = getAdminSourceTag(req);
    if (adminTag) {
      for (const item of items) {
        (item as { source: string }).source = adminTag;
      }
    }

    const updated = await storage.updateStartupCosts(req.params.planId, items as any);

    const auditLogId = req.session?.impersonation_audit_log_id;
    if (auditLogId) {
      storage.appendAuditLogAction(auditLogId, "Updated startup costs").catch(() => {});
    }

    return res.json(updated);
  }
);

// POST /api/plans/:planId/startup-costs/reset
router.post(
  "/:planId/startup-costs/reset",
  requireAuth,
  requireReadOnlyImpersonation,
  async (req: Request<{ planId: string }>, res: Response) => {
    const plan = await requirePlanAccess(req, res);
    if (plan === null) return;

    const defaults = await storage.resetStartupCostsToDefaults(req.params.planId, plan.brandId);
    return res.json(defaults);
  }
);

// GET /api/plans/:planId/outputs — compute and return financial projections
router.get(
  "/:planId/outputs",
  requireAuth,
  async (req: Request<{ planId: string }>, res: Response) => {
    const plan = await requirePlanAccess(req, res);
    if (plan === null) return;

    if (!plan.financialInputs) {
      return res.status(400).json({
        error: {
          message: "This plan doesn't have financial inputs configured yet. Complete plan setup to see projections.",
          code: "MISSING_FINANCIAL_INPUTS",
        },
      });
    }

    try {
      const output = await computePlanOutputs(plan, storage);
      return res.json({ data: output });
    } catch (err) {
      return res.status(500).json({
        error: {
          message: "Unable to compute financial projections. Your data is safe — please try again.",
          code: "ENGINE_ERROR",
        },
      });
    }
  }
);

// POST /api/plans/:planId/clone — clone a plan
router.post(
  "/:planId/clone",
  requireAuth,
  requireReadOnlyImpersonation,
  async (req: Request<{ planId: string }>, res: Response) => {
    const plan = await requirePlanAccess(req, res);
    if (plan === null) return;

    const newName = `${plan.name} (Copy)`;
    const cloned = await storage.clonePlan(req.params.planId, newName);
    return res.status(201).json(cloned);
  }
);

// DELETE /api/plans/:planId — delete a plan
router.delete(
  "/:planId",
  requireAuth,
  requireReadOnlyImpersonation,
  async (req: Request<{ planId: string }>, res: Response) => {
    const plan = await requirePlanAccess(req, res);
    if (plan === null) return;

    const planOwner = await storage.getUser(plan.userId);
    if (planOwner?.isDemo) {
      return res.status(403).json({ message: "Demo plans cannot be deleted" });
    }

    const effectiveUser = await getEffectiveUser(req);
    const planCount = await storage.getPlanCountByUser(effectiveUser.id);
    if (planCount <= 1) {
      return res.status(400).json({ message: "You must have at least one plan" });
    }

    await storage.deletePlan(req.params.planId);
    return res.json({ message: "Plan deleted" });
  }
);

export default router;
