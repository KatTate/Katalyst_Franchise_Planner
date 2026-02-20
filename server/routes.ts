import type { Express } from "express";
import { createServer, type Server } from "http";
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
