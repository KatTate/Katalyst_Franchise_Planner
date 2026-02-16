import { Router, Request, Response } from "express";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { storage } from "../storage";
import type { Invitation, InsertUser } from "@shared/schema";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

function computeInvitationStatus(invitation: Invitation): "pending" | "accepted" | "expired" {
  if (invitation.acceptedAt) return "accepted";
  if (new Date(invitation.expiresAt) < new Date()) return "expired";
  return "pending";
}

const createInvitationSchema = z.object({
  email: z.string().email("Invalid email format"),
  role: z.enum(["franchisee", "franchisor", "katalyst_admin"]),
  brand_id: z.string().optional(),
}).refine(
  (data) => {
    if (data.role === "franchisee" || data.role === "franchisor") {
      return !!data.brand_id;
    }
    return true;
  },
  { message: "brand_id is required for franchisee and franchisor roles", path: ["brand_id"] }
);

router.post(
  "/",
  requireAuth,
  requireRole("katalyst_admin", "franchisor"),
  async (req: Request, res: Response) => {
    const parsed = createInvitationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors.map((e) => ({ path: e.path.map(String), message: e.message })),
      });
    }

    const { email, role, brand_id } = parsed.data;
    const user = req.user!;

    if (user.role === "franchisor") {
      if (role !== "franchisee") {
        return res.status(403).json({ message: "Franchisor admins can only invite franchisees" });
      }
      if (brand_id !== user.brandId) {
        return res.status(403).json({ message: "Franchisor admins can only invite to their own brand" });
      }
    }

    if (brand_id) {
      const brand = await storage.getBrand(brand_id);
      if (!brand) {
        return res.status(400).json({ message: "Brand not found" });
      }
    }

    const existing = await storage.getPendingInvitation(email, role, brand_id || null);
    if (existing) {
      const acceptUrl = `${req.protocol}://${req.get("host")}/invite/${existing.token}`;
      return res.json({ ...existing, acceptUrl, status: computeInvitationStatus(existing) });
    }

    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await storage.createInvitation({
      email,
      role,
      brandId: brand_id || null,
      token,
      expiresAt,
      createdBy: user.id,
    });

    const acceptUrl = `${req.protocol}://${req.get("host")}/invite/${invitation.token}`;
    return res.status(201).json({ ...invitation, acceptUrl });
  }
);

router.get(
  "/",
  requireAuth,
  requireRole("katalyst_admin", "franchisor"),
  async (req: Request, res: Response) => {
    const user = req.user!;

    let invitationList: Invitation[];
    if (user.role === "franchisor" && user.brandId) {
      invitationList = await storage.getInvitationsByBrand(user.brandId);
    } else {
      invitationList = await storage.getInvitations();
    }

    const result = invitationList.map((inv) => ({
      ...inv,
      status: computeInvitationStatus(inv),
    }));

    return res.json(result);
  }
);

router.get("/validate/:token", async (req: Request<{ token: string }>, res: Response) => {
  const { token } = req.params;

  const invitation = await storage.getInvitationByToken(token);
  if (!invitation) {
    return res.status(404).json({ message: "Invitation not found", code: "INVALID_TOKEN" });
  }

  if (invitation.acceptedAt) {
    return res.status(410).json({ message: "This invitation has already been accepted. Please log in instead.", code: "ALREADY_ACCEPTED" });
  }

  if (new Date(invitation.expiresAt) < new Date()) {
    return res.status(410).json({ message: "This invitation has expired. Please contact your administrator for a new invitation.", code: "EXPIRED" });
  }

  let brandName: string | null = null;
  if (invitation.brandId) {
    const brand = await storage.getBrand(invitation.brandId);
    brandName = brand?.name || null;
  }

  return res.json({
    email: invitation.email,
    role: invitation.role,
    brandId: invitation.brandId,
    brandName,
  });
});

const acceptInvitationSchema = z.object({
  token: z.string().min(1, "Token is required"),
  display_name: z.string().min(1, "Display name is required").max(100, "Display name too long"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

router.post("/accept", async (req: Request, res: Response) => {
  const parsed = acceptInvitationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.errors.map((e) => ({ path: e.path.map(String), message: e.message })),
    });
  }

  const { token, display_name, password } = parsed.data;

  const invitation = await storage.getInvitationByToken(token);
  if (!invitation) {
    return res.status(404).json({ message: "Invitation not found", code: "INVALID_TOKEN" });
  }

  if (invitation.acceptedAt) {
    return res.status(410).json({ message: "This invitation has already been accepted. Please log in instead.", code: "ALREADY_ACCEPTED" });
  }

  if (new Date(invitation.expiresAt) < new Date()) {
    return res.status(410).json({ message: "This invitation has expired. Please contact your administrator for a new invitation.", code: "EXPIRED" });
  }

  const existingUser = await storage.getUserByEmail(invitation.email);
  if (existingUser) {
    return res.status(409).json({ message: "An account with this email already exists. Please log in instead.", code: "USER_EXISTS" });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  let accountManagerId: string | undefined;
  let bookingUrl: string | undefined;

  if (invitation.brandId && (invitation.role === "franchisee")) {
    const brand = await storage.getBrand(invitation.brandId);
    if (brand?.defaultAccountManagerId) {
      accountManagerId = brand.defaultAccountManagerId;
      const brandManager = await storage.getBrandAccountManager(
        invitation.brandId,
        brand.defaultAccountManagerId
      );
      if (brandManager?.bookingUrl) {
        bookingUrl = brandManager.bookingUrl;
      } else if (brand.defaultBookingUrl) {
        bookingUrl = brand.defaultBookingUrl;
      }
    }
  }

  const createData = {
    email: invitation.email,
    passwordHash,
    displayName: display_name,
    role: invitation.role as "franchisee" | "franchisor" | "katalyst_admin",
    brandId: invitation.brandId,
    onboardingCompleted: false,
    ...(accountManagerId && { accountManagerId }),
    ...(bookingUrl && { bookingUrl }),
  };

  const user = await storage.createUser(createData as InsertUser);

  await storage.markInvitationAccepted(invitation.id);

  const sessionUser: Express.User = {
    id: user.id,
    email: user.email,
    role: user.role,
    brandId: user.brandId,
    displayName: user.displayName,
    profileImageUrl: user.profileImageUrl,
    onboardingCompleted: user.onboardingCompleted,
    preferredTier: user.preferredTier,
  };

  req.login(sessionUser, (err) => {
    if (err) {
      return res.status(500).json({ message: "Account created but auto-login failed. Please log in manually." });
    }
    return res.status(201).json(sessionUser);
  });
});

export default router;
