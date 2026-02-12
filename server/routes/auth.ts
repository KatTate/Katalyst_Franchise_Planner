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

router.get("/dev-enabled", (_req, res) => {
  const devMode = !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET;
  return res.json({ devMode });
});

router.post("/dev-login", async (req, res) => {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(403).json({ message: "Dev login disabled when Google OAuth is configured" });
  }

  try {
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

router.get("/me", (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  return res.json(req.user);
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
    const updated = await storage.updateUserPreferredTier(req.user.id, parsed.data.preferredTier);

    // Update session with new preference
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
  } catch {
    return res.status(500).json({ error: { message: "Failed to update preferences" } });
  }
});

export default router;
