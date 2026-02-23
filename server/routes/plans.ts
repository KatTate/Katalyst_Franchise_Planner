import { Router, type Request, type Response } from "express";
import { requireAuth, getEffectiveUser, requireReadOnlyImpersonation, isImpersonating } from "../middleware/auth";
import { storage } from "../storage";
import {
  insertPlanSchema,
  planStartupCostsSchema,
  planFinancialInputsSchema,
  updatePlanSchema,
  type Plan,
  type WhatIfScenario,
} from "@shared/schema";
import { z } from "zod";
import { randomUUID } from "crypto";
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

type PipelinePlan = Pick<Plan, "id" | "userId" | "brandId" | "name" | "status" | "pipelineStage" | "targetMarket" | "targetOpenQuarter" | "targetOpenDate" | "locationAddress" | "financingStatus" | "quickStartCompleted" | "createdAt" | "updatedAt" | "lastAutoSave">;

/** Pipeline-only projection: strips financial details for non-opted-in franchisor access */
function projectPlanForFranchisor(plan: Plan): PipelinePlan {
  return {
    id: plan.id,
    userId: plan.userId,
    brandId: plan.brandId,
    name: plan.name,
    status: plan.status,
    pipelineStage: plan.pipelineStage,
    targetMarket: plan.targetMarket,
    targetOpenQuarter: plan.targetOpenQuarter,
    targetOpenDate: plan.targetOpenDate,
    locationAddress: plan.locationAddress,
    financingStatus: plan.financingStatus,
    quickStartCompleted: plan.quickStartCompleted,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
    lastAutoSave: plan.lastAutoSave,
  };
}

// GET /api/plans — list plans for current effective user
router.get(
  "/",
  requireAuth,
  async (req: Request, res: Response) => {
    const effectiveUser = await getEffectiveUser(req);
    let plans: Array<Plan | PipelinePlan>;
    if (effectiveUser.role === "katalyst_admin") {
      plans = [];
    } else if (effectiveUser.role === "franchisor") {
      if (effectiveUser.brandId) {
        const allPlans = await storage.getPlansByBrand(effectiveUser.brandId);
        const planIds = allPlans.map((p) => p.id);
        const consentMap = await storage.getConsentStatusBatch(planIds);
        const projectedPlans: Array<Plan | PipelinePlan> = allPlans.map((plan) => {
          const consent = consentMap.get(plan.id);
          if (consent?.hasConsent) {
            return plan;
          }
          return projectPlanForFranchisor(plan);
        });
        plans = projectedPlans;
      } else {
        plans = [];
      }
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

    const effectiveUser = await getEffectiveUser(req);
    if (effectiveUser.role === "franchisor") {
      const consent = await storage.getConsentStatus(plan.id, plan.userId);
      if (!consent.hasConsent) {
        return res.json({ data: projectPlanForFranchisor(plan) });
      }
    }

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

    const effectiveUser = await getEffectiveUser(req);
    if (effectiveUser.role === "franchisor") {
      const consent = await storage.getConsentStatus(plan.id, plan.userId);
      if (!consent.hasConsent) {
        return res.status(403).json({ error: { message: "Financial details require data sharing consent", code: "CONSENT_REQUIRED" } });
      }
    }

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

    const effectiveUser = await getEffectiveUser(req);
    if (effectiveUser.role === "franchisor") {
      const consent = await storage.getConsentStatus(plan.id, plan.userId);
      if (!consent.hasConsent) {
        return res.status(403).json({ error: { message: "Financial details require data sharing consent", code: "CONSENT_REQUIRED" } });
      }
    }

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

// ─── Scenario CRUD (Story 10.3) ──────────────────────────────────────────

const sliderValuesSchema = z.object({
  revenue: z.number(),
  cogs: z.number(),
  labor: z.number(),
  marketing: z.number(),
  facilities: z.number(),
});

const createScenarioSchema = z.object({
  name: z.string().trim().min(1).max(60),
  sliderValues: sliderValuesSchema,
});

const updateScenarioSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  sliderValues: sliderValuesSchema.optional(),
});

// POST /api/plans/:planId/scenarios — create a saved scenario
router.post(
  "/:planId/scenarios",
  requireAuth,
  requireReadOnlyImpersonation,
  async (req: Request<{ planId: string }>, res: Response) => {
    const plan = await requirePlanAccess(req, res);
    if (plan === null) return;

    const parsed = createScenarioSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors.map((e) => ({
          path: e.path.map(String),
          message: e.message,
        })),
      });
    }

    const scenarios: WhatIfScenario[] = (plan.whatIfScenarios as WhatIfScenario[] | null) ?? [];

    if (scenarios.length >= 10) {
      return res.status(400).json({
        message: "Maximum 10 scenarios per plan reached — delete one to save a new one",
      });
    }

    const nameExists = scenarios.some((s) => s.name === parsed.data.name);
    if (nameExists) {
      return res.status(400).json({
        message: "A scenario with this name already exists",
      });
    }

    const allZero = Object.values(parsed.data.sliderValues).every((v) => v === 0);
    if (allZero) {
      return res.status(400).json({
        message: "Cannot save a scenario with all sliders at zero",
      });
    }

    const newScenario: WhatIfScenario = {
      id: randomUUID(),
      name: parsed.data.name,
      sliderValues: parsed.data.sliderValues,
      createdAt: new Date().toISOString(),
    };

    const updatedScenarios = [...scenarios, newScenario];
    await storage.updatePlan(req.params.planId, { whatIfScenarios: updatedScenarios } as any);

    return res.status(201).json(newScenario);
  }
);

// PUT /api/plans/:planId/scenarios/:scenarioId — update a saved scenario
router.put(
  "/:planId/scenarios/:scenarioId",
  requireAuth,
  requireReadOnlyImpersonation,
  async (req: Request<{ planId: string; scenarioId: string }>, res: Response) => {
    const plan = await requirePlanAccess(req, res);
    if (plan === null) return;

    const parsed = updateScenarioSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors.map((e) => ({
          path: e.path.map(String),
          message: e.message,
        })),
      });
    }

    const scenarios: WhatIfScenario[] = (plan.whatIfScenarios as WhatIfScenario[] | null) ?? [];
    const idx = scenarios.findIndex((s) => s.id === req.params.scenarioId);
    if (idx === -1) {
      return res.status(404).json({ message: "Scenario not found" });
    }

    if (parsed.data.name !== undefined) {
      const nameExists = scenarios.some(
        (s, i) => i !== idx && s.name === parsed.data.name
      );
      if (nameExists) {
        return res.status(400).json({
          message: "A scenario with this name already exists",
        });
      }
    }

    const updated: WhatIfScenario = {
      ...scenarios[idx],
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.sliderValues !== undefined ? { sliderValues: parsed.data.sliderValues } : {}),
    };

    const updatedScenarios = [...scenarios];
    updatedScenarios[idx] = updated;
    await storage.updatePlan(req.params.planId, { whatIfScenarios: updatedScenarios } as any);

    return res.json(updated);
  }
);

// DELETE /api/plans/:planId/scenarios/:scenarioId — delete a saved scenario
router.delete(
  "/:planId/scenarios/:scenarioId",
  requireAuth,
  requireReadOnlyImpersonation,
  async (req: Request<{ planId: string; scenarioId: string }>, res: Response) => {
    const plan = await requirePlanAccess(req, res);
    if (plan === null) return;

    const scenarios: WhatIfScenario[] = (plan.whatIfScenarios as WhatIfScenario[] | null) ?? [];
    const idx = scenarios.findIndex((s) => s.id === req.params.scenarioId);
    if (idx === -1) {
      return res.status(404).json({ message: "Scenario not found" });
    }

    const updatedScenarios = scenarios.filter((s) => s.id !== req.params.scenarioId);
    await storage.updatePlan(req.params.planId, { whatIfScenarios: updatedScenarios } as any);

    return res.json({ deleted: true });
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
