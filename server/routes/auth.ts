import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import passport from "../auth";
import { storage } from "../storage";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    hd: "katgroupinc.com",
  } as any)
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login?error=domain_restricted",
  }),
  (_req, res) => {
    res.redirect("/");
  }
);

router.post("/logout", (req, res) => {
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

function isDevMode(): boolean {
  return !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET;
}

router.get("/dev-enabled", (_req, res) => {
  return res.json({ devMode: isDevMode() });
});

router.get("/dev-brands", async (_req, res) => {
  if (!isDevMode()) {
    return res.status(403).json({ message: "Dev brands disabled when Google OAuth is configured" });
  }
  const allBrands = await storage.getBrands();
  const sorted = allBrands
    .map((b) => ({ id: b.id, name: b.name, displayName: b.displayName }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return res.json(sorted);
});

const devLoginSchema = z.object({
  role: z.enum(["katalyst_admin", "franchisee", "franchisor"]).optional(),
  brandId: z.string().optional(),
}).optional();

router.post("/dev-login", async (req, res) => {
  if (!isDevMode()) {
    return res.status(403).json({ message: "Dev login disabled when Google OAuth is configured" });
  }

  try {
    const parsed = devLoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid request body", errors: parsed.error.flatten().fieldErrors });
    }

    const body = parsed.data;
    const role = body?.role || "katalyst_admin";

    if (role === "katalyst_admin") {
      const user = await storage.upsertUserFromGoogle({
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

      return req.login(sessionUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }
        return res.json(sessionUser);
      });
    }

    if (!body?.brandId) {
      return res.status(400).json({ message: "brandId is required for franchisee and franchisor roles" });
    }

    const brand = await storage.getBrand(body.brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const user = await storage.upsertDevUser({
      role,
      brandSlug: brand.slug,
      brandId: brand.id,
      brandDisplayName: brand.displayName || brand.name,
    });

    if (role === "franchisee") {
      const existingPlans = await storage.getPlansByUser(user.id);
      if (existingPlans.length === 0) {
        await storage.createDemoPlan(user.id, brand.id, brand);
      }
    }

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

router.post("/login", (req: Request, res: Response, next: NextFunction) => {
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

router.get("/me", async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const { getEffectiveUser, isDemoMode, isImpersonating } = await import("../middleware/auth");
  const effectiveUser = await getEffectiveUser(req);
  const inDemoMode = isDemoMode(req);
  const inImpersonation = isImpersonating(req);

  const response: Record<string, any> = { ...effectiveUser };

  const fullUser = await storage.getUser(effectiveUser.id);
  if (fullUser) {
    if (fullUser.bookingUrl) {
      response.bookingUrl = fullUser.bookingUrl;
    }
    if (fullUser.accountManagerId) {
      response.accountManagerId = fullUser.accountManagerId;
      const manager = await storage.getUser(fullUser.accountManagerId);
      response.accountManagerName = manager?.displayName ?? null;
    }
  }

  if (inDemoMode || inImpersonation) {
    response._mode = {
      demo: inDemoMode,
      impersonating: inImpersonation,
      demoBrandId: inDemoMode ? req.session.demo_mode_brand_id : undefined,
      editEnabled: inImpersonation ? !!req.session.impersonation_edit_enabled : undefined,
    };
    response._realUser = {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      displayName: req.user.displayName,
    };
  }

  return res.json(response);
});

const updateMeSchema = z.object({
  preferredTier: z.enum(["planning_assistant", "forms", "quick_entry"]),
});

router.patch("/me", async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const parsed = updateMeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: { message: "Validation failed", code: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors },
    });
  }

  try {
    const { getEffectiveUser } = await import("../middleware/auth");
    const effectiveUser = await getEffectiveUser(req);
    const updated = await storage.updateUserPreferredTier(effectiveUser.id, parsed.data.preferredTier);

    // Update session with new preference (only if not in demo/impersonation mode)
    if (effectiveUser.id === req.user.id) {
      const sessionUser: Express.User = {
        ...req.user,
        preferredTier: updated.preferredTier,
      };
      req.login(sessionUser, (err) => {
        if (err) {
          return res.status(500).json({ error: { message: "Session update failed" } });
        }
        return res.json(sessionUser);
      });
    } else {
      return res.json({ ...effectiveUser, preferredTier: updated.preferredTier });
    }
  } catch {
    return res.status(500).json({ error: { message: "Failed to update preferences" } });
  }
});

export default router;
