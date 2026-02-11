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

async function endActiveEditSession(req: Request): Promise<void> {
  const auditLogId = req.session.impersonation_audit_log_id;
  if (auditLogId) {
    await storage.endAuditLog(auditLogId);
  }
  delete req.session.impersonation_edit_enabled;
  delete req.session.impersonation_audit_log_id;
}

router.post(
  "/impersonate/stop",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request, res: Response) => {
    const returnBrandId = req.session.return_brand_id;

    await endActiveEditSession(req);

    delete req.session.impersonating_user_id;
    delete req.session.impersonation_started_at;
    delete req.session.return_brand_id;

    return res.json({
      active: false,
      returnBrandId: returnBrandId ?? null,
    });
  }
);

router.post(
  "/impersonate/edit-mode",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request, res: Response) => {
    if (!req.session?.impersonating_user_id) {
      return res.status(400).json({ message: "No active impersonation session" });
    }

    const { enabled } = req.body as { enabled: boolean };
    if (typeof enabled !== "boolean") {
      return res.status(400).json({ message: "enabled must be a boolean" });
    }

    if (enabled) {
      req.session.impersonation_edit_enabled = true;

      const auditLog = await storage.createAuditLog({
        adminUserId: req.user!.id,
        impersonatedUserId: req.session.impersonating_user_id,
        editSessionStartedAt: new Date(),
        editSessionEndedAt: null,
        actionsSummary: ["Enabled edit mode"],
      });
      req.session.impersonation_audit_log_id = auditLog.id;
    } else {
      await endActiveEditSession(req);
    }

    return res.json({ editingEnabled: !!req.session.impersonation_edit_enabled });
  }
);

router.get(
  "/impersonate/status",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request, res: Response) => {
    const impersonatingId = req.session?.impersonating_user_id;

    if (!impersonatingId) {
      return res.json({ active: false });
    }

    const startedAt = req.session.impersonation_started_at;
    if (startedAt) {
      const elapsed = Date.now() - new Date(startedAt).getTime();
      if (elapsed > IMPERSONATION_MAX_MINUTES * 60 * 1000) {
        const returnBrandId = req.session.return_brand_id;
        await endActiveEditSession(req);
        delete req.session.impersonating_user_id;
        delete req.session.impersonation_started_at;
        delete req.session.return_brand_id;
        return res.json({ active: false, expired: true, returnBrandId: returnBrandId ?? null });
      }
    }

    const targetUser = await storage.getUser(impersonatingId);
    if (!targetUser) {
      await endActiveEditSession(req);
      delete req.session.impersonating_user_id;
      delete req.session.impersonation_started_at;
      delete req.session.return_brand_id;
      return res.json({ active: false });
    }

    const elapsedMs = startedAt ? Date.now() - new Date(startedAt).getTime() : 0;
    const remainingMinutes = Math.max(0, IMPERSONATION_MAX_MINUTES - Math.floor(elapsedMs / 60000));
    const editingEnabled = !!req.session.impersonation_edit_enabled;

    return res.json({
      active: true,
      targetUser: {
        id: targetUser.id,
        displayName: targetUser.displayName,
        email: targetUser.email,
        role: targetUser.role,
        brandId: targetUser.brandId,
      },
      readOnly: !editingEnabled,
      editingEnabled,
      remainingMinutes,
      returnBrandId: req.session.return_brand_id ?? null,
    });
  }
);

router.post(
  "/impersonate/:userId",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ userId: string }>, res: Response) => {
    const targetUserId = req.params.userId;

    const targetUser = await storage.getUser(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (targetUser.role !== "franchisee") {
      return res.status(400).json({ message: "Can only impersonate franchisee users" });
    }

    if (req.session.impersonating_user_id) {
      await endActiveEditSession(req);
      delete req.session.impersonating_user_id;
      delete req.session.impersonation_started_at;
      delete req.session.return_brand_id;
    }

    req.session.impersonating_user_id = targetUserId;
    req.session.impersonation_started_at = new Date().toISOString();
    req.session.return_brand_id = targetUser.brandId ?? undefined;
    req.session.impersonation_edit_enabled = false;

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
      editingEnabled: false,
      remainingMinutes: IMPERSONATION_MAX_MINUTES,
      returnBrandId: targetUser.brandId,
    });
  }
);

router.get(
  "/audit-logs",
  requireAuth,
  requireRole("katalyst_admin"),
  async (_req: Request, res: Response) => {
    const logs = await storage.getAuditLogs();
    return res.json(logs);
  }
);

export default router;
