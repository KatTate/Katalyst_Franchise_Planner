import { Router, type Request, type Response } from "express";
import { requireAuth } from "../middleware/auth";
import { storage } from "../storage";
import { planStartupCostsSchema } from "@shared/schema";

const router = Router();

/** Ownership check: franchisee can only access their own plans. */
async function requirePlanAccess(req: Request, res: Response): Promise<string | null> {
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
  return plan.brandId;
}

// GET /api/plans/:planId/startup-costs
router.get(
  "/:planId/startup-costs",
  requireAuth,
  async (req: Request<{ planId: string }>, res: Response) => {
    const brandId = await requirePlanAccess(req, res);
    if (brandId === null) return;

    const costs = await storage.getStartupCosts(req.params.planId);
    return res.json(costs);
  }
);

// PUT /api/plans/:planId/startup-costs
router.put(
  "/:planId/startup-costs",
  requireAuth,
  async (req: Request<{ planId: string }>, res: Response) => {
    const brandId = await requirePlanAccess(req, res);
    if (brandId === null) return;

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
    const brandId = await requirePlanAccess(req, res);
    if (brandId === null) return;

    const defaults = await storage.resetStartupCostsToDefaults(req.params.planId, brandId);
    return res.json(defaults);
  }
);

export default router;
