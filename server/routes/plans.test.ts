import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../storage", () => ({
  storage: {
    getPlan: vi.fn(),
    updatePlan: vi.fn(),
    getStartupCosts: vi.fn(),
    updateStartupCosts: vi.fn(),
    resetStartupCostsToDefaults: vi.fn(),
    getUser: vi.fn(),
  },
}));

vi.mock("../services/financial-service", () => ({
  computePlanOutputs: vi.fn(),
}));

import { storage } from "../storage";
import { computePlanOutputs } from "../services/financial-service";
import plansRouter from "./plans";

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
    if (!req.session) req.session = {};
    next();
  });
  app.use("/api/plans", plansRouter);
  return app;
}

const franchiseeUser: Express.User = {
  id: "f1",
  email: "franchisee@test.com",
  role: "franchisee",
  brandId: "b1",
  displayName: "Franchisee",
  profileImageUrl: null,
  onboardingCompleted: true,
  preferredTier: "forms",
};

const otherFranchisee: Express.User = {
  id: "f2",
  email: "other@test.com",
  role: "franchisee",
  brandId: "b1",
  displayName: "Other",
  profileImageUrl: null,
  onboardingCompleted: true,
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

const mockPlan = {
  id: "p1",
  userId: "f1",
  brandId: "b1",
  name: "Test Plan",
  financialInputs: { revenue: { monthly_auv: 50000 } },
  startupCosts: [],
};

describe("Plans Routes", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("GET /api/plans/:planId", () => {
    it("returns 401 when not authenticated", async () => {
      const app = createApp();
      const res = await request(app).get("/api/plans/p1");
      expect(res.status).toBe(401);
    });

    it("returns plan for owner", async () => {
      (storage.getPlan as any).mockResolvedValue(mockPlan);
      const app = createApp(franchiseeUser);
      const res = await request(app).get("/api/plans/p1");
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe("p1");
    });

    it("returns 403 for non-owner franchisee", async () => {
      (storage.getPlan as any).mockResolvedValue(mockPlan);
      const app = createApp(otherFranchisee);
      const res = await request(app).get("/api/plans/p1");
      expect(res.status).toBe(403);
    });

    it("returns plan for admin (any plan)", async () => {
      (storage.getPlan as any).mockResolvedValue(mockPlan);
      const app = createApp(adminUser);
      const res = await request(app).get("/api/plans/p1");
      expect(res.status).toBe(200);
    });

    it("returns 404 for non-existent plan", async () => {
      (storage.getPlan as any).mockResolvedValue(undefined);
      const app = createApp(franchiseeUser);
      const res = await request(app).get("/api/plans/nonexistent");
      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/plans/:planId", () => {
    it("updates plan name for owner", async () => {
      (storage.getPlan as any).mockResolvedValue(mockPlan);
      (storage.updatePlan as any).mockResolvedValue({ ...mockPlan, name: "Updated" });

      const app = createApp(franchiseeUser);
      const res = await request(app).patch("/api/plans/p1").send({ name: "Updated" });
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("Updated");
    });

    it("strips userId and brandId from update payload", async () => {
      (storage.getPlan as any).mockResolvedValue(mockPlan);
      (storage.updatePlan as any).mockImplementation((_id: string, data: any) => {
        expect(data).not.toHaveProperty("userId");
        expect(data).not.toHaveProperty("brandId");
        return { ...mockPlan, ...data };
      });

      const app = createApp(franchiseeUser);
      await request(app).patch("/api/plans/p1").send({
        name: "Updated",
        userId: "hacker",
        brandId: "hacker-brand",
      });

      expect(storage.updatePlan).toHaveBeenCalled();
    });

    it("returns 403 for non-owner", async () => {
      (storage.getPlan as any).mockResolvedValue(mockPlan);
      const app = createApp(otherFranchisee);
      const res = await request(app).patch("/api/plans/p1").send({ name: "Hacked" });
      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/plans/:planId/startup-costs", () => {
    it("returns startup costs for plan owner", async () => {
      (storage.getPlan as any).mockResolvedValue(mockPlan);
      (storage.getStartupCosts as any).mockResolvedValue([
        { id: "c1", name: "Franchise Fee", amount: 35000 },
      ]);

      const app = createApp(franchiseeUser);
      const res = await request(app).get("/api/plans/p1/startup-costs");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe("POST /api/plans/:planId/startup-costs/reset", () => {
    it("resets startup costs to brand defaults", async () => {
      (storage.getPlan as any).mockResolvedValue(mockPlan);
      (storage.resetStartupCostsToDefaults as any).mockResolvedValue([
        { id: "c1", name: "Default Fee", amount: 30000 },
      ]);

      const app = createApp(franchiseeUser);
      const res = await request(app).post("/api/plans/p1/startup-costs/reset");
      expect(res.status).toBe(200);
      expect(storage.resetStartupCostsToDefaults).toHaveBeenCalledWith("p1", "b1");
    });
  });

  describe("GET /api/plans/:planId/outputs", () => {
    it("returns financial projections", async () => {
      (storage.getPlan as any).mockResolvedValue(mockPlan);
      (computePlanOutputs as any).mockResolvedValue({
        projections: [],
        summary: { totalRevenue: 500000 },
      });

      const app = createApp(franchiseeUser);
      const res = await request(app).get("/api/plans/p1/outputs");
      expect(res.status).toBe(200);
      expect(res.body.data.summary.totalRevenue).toBe(500000);
    });

    it("returns 400 when plan has no financial inputs", async () => {
      (storage.getPlan as any).mockResolvedValue({ ...mockPlan, financialInputs: null });
      const app = createApp(franchiseeUser);
      const res = await request(app).get("/api/plans/p1/outputs");
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("MISSING_FINANCIAL_INPUTS");
    });

    it("returns 500 when engine fails", async () => {
      (storage.getPlan as any).mockResolvedValue(mockPlan);
      (computePlanOutputs as any).mockRejectedValue(new Error("Engine crash"));

      const app = createApp(franchiseeUser);
      const res = await request(app).get("/api/plans/p1/outputs");
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe("ENGINE_ERROR");
    });
  });
});
