import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { requireAuth, requireRole } from "../middleware/auth";

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

export default router;
