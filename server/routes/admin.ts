import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { requireAuth, requireRole, IMPERSONATION_MAX_MINUTES } from "../middleware/auth";

const router = Router();

router.get(
  "/account-managers",
  requireAuth,
  requireRole("katalyst_admin"),
  async (_req: Request, res: Response) => {
    const admins = await storage.getKatalystAdmins();
    return res.json(admins);
  }
);

// POST /api/admin/impersonate/stop — End impersonation
// NOTE: Must be registered BEFORE /impersonate/:userId to avoid route shadowing
router.post(
  "/impersonate/stop",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request, res: Response) => {
    const returnBrandId = req.session.return_brand_id;

    delete req.session.impersonating_user_id;
    delete req.session.impersonation_started_at;
    delete req.session.return_brand_id;

    return res.json({
      active: false,
      returnBrandId: returnBrandId ?? null,
    });
  }
);

// GET /api/admin/impersonate/status — Check current impersonation state
router.get(
  "/impersonate/status",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request, res: Response) => {
    const impersonatingId = req.session?.impersonating_user_id;

    if (!impersonatingId) {
      return res.json({ active: false });
    }

    // Check 60-minute timeout and auto-revert if expired
    const startedAt = req.session.impersonation_started_at;
    if (startedAt) {
      const elapsed = Date.now() - new Date(startedAt).getTime();
      if (elapsed > IMPERSONATION_MAX_MINUTES * 60 * 1000) {
        const returnBrandId = req.session.return_brand_id;
        delete req.session.impersonating_user_id;
        delete req.session.impersonation_started_at;
        delete req.session.return_brand_id;
        return res.json({ active: false, expired: true, returnBrandId: returnBrandId ?? null });
      }
    }

    // Fetch target user details
    const targetUser = await storage.getUser(impersonatingId);
    if (!targetUser) {
      delete req.session.impersonating_user_id;
      delete req.session.impersonation_started_at;
      delete req.session.return_brand_id;
      return res.json({ active: false });
    }

    const elapsedMs = startedAt ? Date.now() - new Date(startedAt).getTime() : 0;
    const remainingMinutes = Math.max(0, IMPERSONATION_MAX_MINUTES - Math.floor(elapsedMs / 60000));

    return res.json({
      active: true,
      targetUser: {
        id: targetUser.id,
        displayName: targetUser.displayName,
        email: targetUser.email,
        role: targetUser.role,
        brandId: targetUser.brandId,
      },
      readOnly: true,
      remainingMinutes,
      returnBrandId: req.session.return_brand_id ?? null,
    });
  }
);

// POST /api/admin/impersonate/:userId — Start impersonation
router.post(
  "/impersonate/:userId",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ userId: string }>, res: Response) => {
    const targetUserId = req.params.userId;

    // Verify target user exists and is a franchisee
    const targetUser = await storage.getUser(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (targetUser.role !== "franchisee") {
      return res.status(400).json({ message: "Can only impersonate franchisee users" });
    }

    // Auto-stop any existing impersonation before starting a new one
    if (req.session.impersonating_user_id) {
      delete req.session.impersonating_user_id;
      delete req.session.impersonation_started_at;
      delete req.session.return_brand_id;
    }

    // Store impersonation state on session
    req.session.impersonating_user_id = targetUserId;
    req.session.impersonation_started_at = new Date().toISOString();
    req.session.return_brand_id = targetUser.brandId ?? undefined;

    return res.json({
      active: true,
      targetUser: {
        id: targetUser.id,
        displayName: targetUser.displayName,
        email: targetUser.email,
        role: targetUser.role,
        brandId: targetUser.brandId,
      },
      readOnly: true,
      remainingMinutes: IMPERSONATION_MAX_MINUTES,
      returnBrandId: targetUser.brandId,
    });
  }
);

export default router;
