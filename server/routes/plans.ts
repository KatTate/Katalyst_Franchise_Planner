import { Router, type Request, type Response } from "express";
import { requireAuth } from "../middleware/auth";
import { storage } from "../storage";
import { planStartupCostsSchema } from "@shared/schema";
import { computePlanOutputs } from "../services/financial-service";

const router = Router();

import type { Plan } from "@shared/schema";

/** Ownership check: franchisee can only access own plans; franchisor scoped to own brand. */
async function requirePlanAccess(req: Request, res: Response): Promise<Plan | null> {
  const planId = req.params.planId as string;
  const plan = await storage.getPlan(planId);
  if (!plan) {
    res.status(404).json({ message: "Plan not found" });
    return null;
  }
  if (req.user!.role === "franchisee" && plan.userId !== req.user!.id) {
    res.status(403).json({ message: "Access denied" });
    return null;
  }
  if (req.user!.role === "franchisor" && plan.brandId !== req.user!.brandId) {
    res.status(403).json({ message: "Access denied" });
    return null;
  }
  return plan;
}

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

    const updated = await storage.updateStartupCosts(req.params.planId, parsed.data);
    return res.json(updated);
  }
);

// POST /api/plans/:planId/startup-costs/reset
router.post(
  "/:planId/startup-costs/reset",
  requireAuth,
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

export default router;
