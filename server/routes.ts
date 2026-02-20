import type { Express } from "express";
import type { Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "./auth";
import { requireReadOnlyImpersonation } from "./middleware/auth";

import authRoutes from "./routes/auth";
import brandRoutes from "./routes/brands";
import planRoutes from "./routes/plans";
import adminRoutes from "./routes/admin";
import invitationRoutes from "./routes/invitations";
import onboardingRoutes from "./routes/onboarding";
import userRoutes from "./routes/users";
import helpRoutes from "./routes/help";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const PgStore = connectPgSimple(session);

  app.use(
    session({
      store: new PgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "katalyst-dev-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use("/api/auth", authRoutes);
  app.use("/api/brands", brandRoutes);
  app.use("/api/plans", requireReadOnlyImpersonation, planRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/invitations", invitationRoutes);
  app.use("/api/onboarding", onboardingRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/help", helpRoutes);

  return httpServer;
}
