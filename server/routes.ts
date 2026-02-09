import type { Express } from "express";
import { type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "./auth";

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

  return httpServer;
}
