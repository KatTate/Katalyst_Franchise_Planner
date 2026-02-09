import { Router, Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

const assignAccountManagerSchema = z.object({
  account_manager_id: z.string().min(1, "Account manager is required"),
  booking_url: z.string().url("Must be a valid URL"),
});

router.put(
  "/:userId/account-manager",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ userId: string }>, res: Response) => {
    const { userId } = req.params;
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role !== "franchisee") {
      return res.status(400).json({ message: "Account managers can only be assigned to franchisees" });
    }

    const parsed = assignAccountManagerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors.map((e) => ({ path: e.path.map(String), message: e.message })),
      });
    }

    const manager = await storage.getUser(parsed.data.account_manager_id);
    if (!manager) {
      return res.status(404).json({ message: "Account manager not found" });
    }

    const updated = await storage.assignAccountManager(
      userId,
      parsed.data.account_manager_id,
      parsed.data.booking_url,
    );

    return res.json({
      id: updated.id,
      email: updated.email,
      displayName: updated.displayName,
      accountManagerId: updated.accountManagerId,
      bookingUrl: updated.bookingUrl,
    });
  }
);

export default router;
