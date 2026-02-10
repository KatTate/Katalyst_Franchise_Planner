import type { Express } from "express";
import { type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "./auth";
import authRouter from "./routes/auth";
import invitationsRouter from "./routes/invitations";
import onboardingRouter from "./routes/onboarding";
import brandsRouter from "./routes/brands";
import adminRouter from "./routes/admin";
import usersRouter from "./routes/users";
import financialEngineRouter from "./routes/financial-engine";
import plansRouter from "./routes/plans";

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

  app.use("/api/auth", authRouter);
  app.use("/api/invitations", invitationsRouter);
  app.use("/api/onboarding", onboardingRouter);
  app.use("/api/brands", brandsRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/financial-engine", financialEngineRouter);
  app.use("/api/plans", plansRouter);

  return httpServer;
}
