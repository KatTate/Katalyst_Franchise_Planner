import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../storage", () => ({
  storage: {
    updateUserOnboarding: vi.fn(),
  },
}));

import { storage } from "../storage";
import onboardingRouter from "./onboarding";

function createApp(user?: Express.User) {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res: any, next: any) => {
    if (user) {
      req.user = user;
      req.isAuthenticated = () => true;
    } else {
      req.isAuthenticated = () => false;
    }
    next();
  });
  app.use("/api/onboarding", onboardingRouter);
  return app;
}

const franchiseeUser: Express.User = {
  id: "f1",
  email: "franchisee@test.com",
  role: "franchisee",
  brandId: "b1",
  displayName: "Franchisee",
  profileImageUrl: null,
  onboardingCompleted: false,
  preferredTier: null,
};

const adminUser: Express.User = {
  id: "a1",
  email: "admin@katgroupinc.com",
  role: "katalyst_admin",
  brandId: null,
  displayName: "Admin",
  profileImageUrl: null,
  onboardingCompleted: true,
  preferredTier: null,
};

describe("Onboarding Routes", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("POST /api/onboarding/complete", () => {
    it("returns 401 when not authenticated", async () => {
      const app = createApp();
      const res = await request(app).post("/api/onboarding/complete").send({
        franchise_experience: "none",
        financial_literacy: "basic",
        planning_experience: "first_time",
      });
      expect(res.status).toBe(401);
    });

    it("returns 403 for non-franchisee roles", async () => {
      const app = createApp(adminUser);
      const res = await request(app).post("/api/onboarding/complete").send({
        franchise_experience: "none",
        financial_literacy: "basic",
        planning_experience: "first_time",
      });
      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Onboarding is only for franchisees");
    });

    it("recommends planning_assistant for beginners", async () => {
      const app = createApp(franchiseeUser);
      const res = await request(app).post("/api/onboarding/complete").send({
        franchise_experience: "none",
        financial_literacy: "basic",
        planning_experience: "first_time",
      });
      expect(res.status).toBe(200);
      expect(res.body.recommendedTier).toBe("planning_assistant");
      expect(res.body.tierDescription).toBeDefined();
    });

    it("recommends quick_entry for advanced users", async () => {
      const app = createApp(franchiseeUser);
      const res = await request(app).post("/api/onboarding/complete").send({
        franchise_experience: "experienced",
        financial_literacy: "advanced",
        planning_experience: "frequent",
      });
      expect(res.status).toBe(200);
      expect(res.body.recommendedTier).toBe("quick_entry");
    });

    it("returns 400 for invalid input", async () => {
      const app = createApp(franchiseeUser);
      const res = await request(app).post("/api/onboarding/complete").send({
        franchise_experience: "invalid",
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
      expect(res.body.errors).toBeDefined();
    });
  });

  describe("POST /api/onboarding/select-tier", () => {
    it("saves selected tier and marks onboarding complete", async () => {
      (storage.updateUserOnboarding as any).mockResolvedValue({});
      const app = createApp(franchiseeUser);
      const res = await request(app).post("/api/onboarding/select-tier").send({
        preferred_tier: "forms",
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(storage.updateUserOnboarding).toHaveBeenCalledWith("f1", {
        onboardingCompleted: true,
        preferredTier: "forms",
      });
    });

    it("returns 400 for invalid tier", async () => {
      const app = createApp(franchiseeUser);
      const res = await request(app).post("/api/onboarding/select-tier").send({
        preferred_tier: "invalid",
      });
      expect(res.status).toBe(400);
    });

    it("returns 403 for non-franchisee", async () => {
      const app = createApp(adminUser);
      const res = await request(app).post("/api/onboarding/select-tier").send({
        preferred_tier: "forms",
      });
      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/onboarding/skip", () => {
    it("marks onboarding complete without tier selection", async () => {
      (storage.updateUserOnboarding as any).mockResolvedValue({});
      const app = createApp(franchiseeUser);
      const res = await request(app).post("/api/onboarding/skip");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(storage.updateUserOnboarding).toHaveBeenCalledWith("f1", {
        onboardingCompleted: true,
      });
    });

    it("returns 403 for non-franchisee", async () => {
      const app = createApp(adminUser);
      const res = await request(app).post("/api/onboarding/skip");
      expect(res.status).toBe(403);
    });
  });
});
