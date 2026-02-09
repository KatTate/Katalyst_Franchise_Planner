import type { Express, Request, Response, NextFunction } from "express";
import { type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcrypt";
import type { Invitation } from "@shared/schema";
import { requireAuth, requireRole } from "./middleware/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const PgSession = connectPgSimple(session);

  app.use(
    session({
      store: new PgSession({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "dev-secret-change-me",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.get(
    "/api/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
      hd: "katgroupinc.com",
    } as any)
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/login?error=domain_restricted",
    }),
    (_req, res) => {
      res.redirect("/");
    }
  );

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      req.session.destroy((sessionErr) => {
        if (sessionErr) {
          return res.status(500).json({ message: "Session destruction failed" });
        }
        res.clearCookie("connect.sid");
        return res.json({ message: "Logged out" });
      });
    });
  });

  app.get("/api/auth/dev-enabled", (_req, res) => {
    const devMode = !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET;
    return res.json({ devMode });
  });

  app.post("/api/auth/dev-login", async (req, res) => {
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(403).json({ message: "Dev login disabled when Google OAuth is configured" });
    }

    try {
      const user = await (await import("./storage")).storage.upsertUserFromGoogle({
        email: "dev@katgroupinc.com",
        displayName: "Dev Admin",
        profileImageUrl: null,
      });

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
          return res.status(500).json({ message: "Login failed" });
        }
        return res.json(sessionUser);
      });
    } catch (err) {
      return res.status(500).json({ message: "Dev login failed" });
    }
  });

  app.post("/api/auth/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) {
        return res.status(500).json({ message: "Login failed" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid email or password" });
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ message: "Login failed" });
        }
        return res.json(user);
      });
    })(req, res, next);
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    return res.json(req.user);
  });

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

  app.post(
    "/api/invitations",
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

  app.get(
    "/api/invitations",
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

  app.get(
    "/api/brands",
    requireAuth,
    requireRole("katalyst_admin", "franchisor"),
    async (req: Request, res: Response) => {
      const user = req.user!;
      if (user.role === "franchisor" && user.brandId) {
        const brand = await storage.getBrand(user.brandId);
        return res.json(brand ? [brand] : []);
      }
      const allBrands = await storage.getBrands();
      return res.json(allBrands);
    }
  );

  app.get("/api/invitations/validate/:token", async (req: Request, res: Response) => {
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

  app.post("/api/invitations/accept", async (req: Request, res: Response) => {
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

    const user = await storage.createUser({
      email: invitation.email,
      passwordHash,
      displayName: display_name,
      role: invitation.role,
      brandId: invitation.brandId,
      onboardingCompleted: false,
    });

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

  const TIER_DESCRIPTIONS: Record<string, string> = {
    planning_assistant: "We'll guide you through your plan with a conversational advisor. Perfect for first-time planners.",
    forms: "Build your plan section by section with structured input forms. Great for people who know their numbers.",
    quick_entry: "Jump right into a spreadsheet-style view for maximum speed. Ideal for experienced planners.",
  };

  const onboardingCompleteSchema = z.object({
    franchise_experience: z.enum(["none", "some", "experienced"]),
    financial_literacy: z.enum(["basic", "comfortable", "advanced"]),
    planning_experience: z.enum(["first_time", "done_before", "frequent"]),
  });

  app.post(
    "/api/onboarding/complete",
    requireAuth,
    async (req: Request, res: Response) => {
      if (req.user!.role !== "franchisee") {
        return res.status(403).json({ message: "Onboarding is only for franchisees" });
      }

      const parsed = onboardingCompleteSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.errors.map((e) => ({ path: e.path.map(String), message: e.message })),
        });
      }

      const { franchise_experience, financial_literacy, planning_experience } = parsed.data;

      const experienceScores: Record<string, number> = { none: 0, some: 1, experienced: 3 };
      const literacyScores: Record<string, number> = { basic: 0, comfortable: 1, advanced: 3 };
      const planningScores: Record<string, number> = { first_time: 0, done_before: 1, frequent: 3 };

      const totalScore =
        experienceScores[franchise_experience] +
        literacyScores[financial_literacy] +
        planningScores[planning_experience];

      let recommendedTier: "planning_assistant" | "forms" | "quick_entry";
      if (totalScore <= 3) {
        recommendedTier = "planning_assistant";
      } else if (totalScore <= 6) {
        recommendedTier = "forms";
      } else {
        recommendedTier = "quick_entry";
      }

      return res.json({
        recommendedTier,
        tierDescription: TIER_DESCRIPTIONS[recommendedTier],
      });
    }
  );

  const selectTierSchema = z.object({
    preferred_tier: z.enum(["planning_assistant", "forms", "quick_entry"]),
  });

  app.post(
    "/api/onboarding/select-tier",
    requireAuth,
    async (req: Request, res: Response) => {
      if (req.user!.role !== "franchisee") {
        return res.status(403).json({ message: "Onboarding is only for franchisees" });
      }

      const parsed = selectTierSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.errors.map((e) => ({ path: e.path.map(String), message: e.message })),
        });
      }

      await storage.updateUserOnboarding(req.user!.id, {
        onboardingCompleted: true,
        preferredTier: parsed.data.preferred_tier,
      });

      return res.json({ success: true });
    }
  );

  app.post(
    "/api/onboarding/skip",
    requireAuth,
    async (req: Request, res: Response) => {
      if (req.user!.role !== "franchisee") {
        return res.status(403).json({ message: "Onboarding is only for franchisees" });
      }

      await storage.updateUserOnboarding(req.user!.id, {
        onboardingCompleted: true,
      });

      return res.json({ success: true });
    }
  );

  return httpServer;
}
