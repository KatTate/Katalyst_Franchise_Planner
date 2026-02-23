import { Router, type Request, type Response } from "express";
import { requireAuth, getEffectiveUser } from "../middleware/auth";
import { storage } from "../storage";

const router = Router();

// GET /api/plans/:planId/consent — get consent status for current plan
router.get(
  "/:planId/consent",
  requireAuth,
  async (req: Request<{ planId: string }>, res: Response) => {
    const effectiveUser = await getEffectiveUser(req);
    const plan = await storage.getPlan(req.params.planId);
    if (!plan) {
      return res.status(404).json({ error: { message: "Plan not found", code: "NOT_FOUND" } });
    }

    // Only the plan owner (franchisee) or admins can view consent status
    if (effectiveUser.role === "franchisee" && plan.userId !== effectiveUser.id) {
      return res.status(403).json({ error: { message: "Access denied", code: "FORBIDDEN" } });
    }
    if (effectiveUser.role === "franchisor" && plan.brandId !== effectiveUser.brandId) {
      return res.status(403).json({ error: { message: "Access denied", code: "FORBIDDEN" } });
    }

    const status = await storage.getConsentStatus(plan.id, plan.userId);
    return res.json({ data: status });
  }
);

// POST /api/plans/:planId/consent/grant — grant data sharing consent
router.post(
  "/:planId/consent/grant",
  requireAuth,
  async (req: Request<{ planId: string }>, res: Response) => {
    const effectiveUser = await getEffectiveUser(req);
    const plan = await storage.getPlan(req.params.planId);
    if (!plan) {
      return res.status(404).json({ error: { message: "Plan not found", code: "NOT_FOUND" } });
    }

    // Only the plan owner (franchisee) can grant consent
    if (effectiveUser.role !== "franchisee" || plan.userId !== effectiveUser.id) {
      return res.status(403).json({ error: { message: "Only the plan owner can grant data sharing consent", code: "FORBIDDEN" } });
    }

    const consent = await storage.grantConsent(plan.id, effectiveUser.id);
    return res.json({ data: consent });
  }
);

// POST /api/plans/:planId/consent/revoke — revoke data sharing consent
router.post(
  "/:planId/consent/revoke",
  requireAuth,
  async (req: Request<{ planId: string }>, res: Response) => {
    const effectiveUser = await getEffectiveUser(req);
    const plan = await storage.getPlan(req.params.planId);
    if (!plan) {
      return res.status(404).json({ error: { message: "Plan not found", code: "NOT_FOUND" } });
    }

    // Only the plan owner (franchisee) can revoke consent
    if (effectiveUser.role !== "franchisee" || plan.userId !== effectiveUser.id) {
      return res.status(403).json({ error: { message: "Only the plan owner can revoke data sharing consent", code: "FORBIDDEN" } });
    }

    const consent = await storage.revokeConsent(plan.id, effectiveUser.id);
    return res.json({ data: consent });
  }
);

export default router;
