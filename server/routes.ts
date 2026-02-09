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

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    return res.json(req.user);
  });

  function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  }

  function requireRole(...roles: Array<"franchisee" | "franchisor" | "katalyst_admin">) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      next();
    };
  }

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

  return httpServer;
}
