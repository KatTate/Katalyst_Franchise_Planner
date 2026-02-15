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

const franchisorUser: Express.User = {
  id: "fr1",
  email: "franchisor@test.com",
  role: "franchisor",
  brandId: "b1",
  displayName: "Franchisor",
  profileImageUrl: null,
  onboardingCompleted: true,
  preferredTier: null,
};

const otherBrandFranchisor: Express.User = {
  id: "fr2",
  email: "other-franchisor@test.com",
  role: "franchisor",
  brandId: "b2",
  displayName: "Other Franchisor",
  profileImageUrl: null,
  onboardingCompleted: true,
  preferredTier: null,
};

function makeFieldValue(currentValue: number, source = "brand_default" as string, isCustom = false) {
  return {
    currentValue,
    source,
    brandDefault: currentValue,
    item7Range: null,
    lastModifiedAt: null,
    isCustom,
  };
}

const validFinancialInputs = {
  revenue: {
    monthlyAuv: makeFieldValue(2686700),
    year1GrowthRate: makeFieldValue(0.13),
    year2GrowthRate: makeFieldValue(0.13),
    startingMonthAuvPct: makeFieldValue(0.08),
  },
  operatingCosts: {
    cogsPct: makeFieldValue(0.30),
    laborPct: makeFieldValue(0.17),
    rentMonthly: makeFieldValue(500000),
    utilitiesMonthly: makeFieldValue(80000),
    insuranceMonthly: makeFieldValue(50000),
    marketingPct: makeFieldValue(0.05),
    royaltyPct: makeFieldValue(0.05),
    adFundPct: makeFieldValue(0.02),
    otherMonthly: makeFieldValue(100000),
  },
  financing: {
    loanAmount: makeFieldValue(20000000),
    interestRate: makeFieldValue(0.105),
    loanTermMonths: makeFieldValue(144),
    downPaymentPct: makeFieldValue(0.20),
  },
  startupCapital: {
    workingCapitalMonths: makeFieldValue(3),
    depreciationYears: makeFieldValue(4),
  },
};

const validStartupCostItem = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Equipment & Signage",
  amount: 12605700,
  capexClassification: "capex",
  isCustom: false,
  source: "brand_default",
  brandDefaultAmount: 12605700,
  item7RangeLow: 10000000,
  item7RangeHigh: 15000000,
  sortOrder: 0,
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

  describe("PATCH /api/plans/:planId — financialInputs with per-field metadata (Story 3.2)", () => {
    it("accepts valid financialInputs with full per-field metadata", async () => {
      (storage.getPlan as any).mockResolvedValue(mockPlan);
      (storage.updatePlan as any).mockImplementation((_id: string, data: any) => ({
        ...mockPlan,
        ...data,
      }));

      const app = createApp(franchiseeUser);
      const res = await request(app).patch("/api/plans/p1").send({
        financialInputs: validFinancialInputs,
      });
      expect(res.status).toBe(200);
      expect(res.body.data.financialInputs.revenue.monthlyAuv.currentValue).toBe(2686700);
      expect(res.body.data.financialInputs.revenue.monthlyAuv.source).toBe("brand_default");
    });

    it("persists user_entry source when franchisee edits a field", async () => {
      const editedInputs = {
        ...validFinancialInputs,
        revenue: {
          ...validFinancialInputs.revenue,
          monthlyAuv: {
            ...validFinancialInputs.revenue.monthlyAuv,
            currentValue: 3000000,
            source: "user_entry",
            isCustom: true,
            lastModifiedAt: "2026-02-15T10:00:00Z",
          },
        },
      };

      (storage.getPlan as any).mockResolvedValue(mockPlan);
      (storage.updatePlan as any).mockImplementation((_id: string, data: any) => ({
        ...mockPlan,
        ...data,
      }));

      const app = createApp(franchiseeUser);
      const res = await request(app).patch("/api/plans/p1").send({
        financialInputs: editedInputs,
      });
      expect(res.status).toBe(200);
      expect(res.body.data.financialInputs.revenue.monthlyAuv.source).toBe("user_entry");
      expect(res.body.data.financialInputs.revenue.monthlyAuv.isCustom).toBe(true);
      expect(res.body.data.financialInputs.revenue.monthlyAuv.brandDefault).toBe(2686700);
    });

    it("preserves brandDefault when user edits currentValue", async () => {
      const editedInputs = {
        ...validFinancialInputs,
        operatingCosts: {
          ...validFinancialInputs.operatingCosts,
          cogsPct: {
            ...validFinancialInputs.operatingCosts.cogsPct,
            currentValue: 0.35,
            source: "user_entry",
            isCustom: true,
            lastModifiedAt: "2026-02-15T12:00:00Z",
          },
        },
      };

      (storage.getPlan as any).mockResolvedValue(mockPlan);
      (storage.updatePlan as any).mockImplementation((_id: string, data: any) => ({
        ...mockPlan,
        ...data,
      }));

      const app = createApp(franchiseeUser);
      const res = await request(app).patch("/api/plans/p1").send({
        financialInputs: editedInputs,
      });
      expect(res.status).toBe(200);
      expect(res.body.data.financialInputs.operatingCosts.cogsPct.brandDefault).toBe(0.30);
    });

    it("rejects financialInputs with invalid source value", async () => {
      const invalidInputs = {
        ...validFinancialInputs,
        revenue: {
          ...validFinancialInputs.revenue,
          monthlyAuv: {
            ...validFinancialInputs.revenue.monthlyAuv,
            source: "invalid_source",
          },
        },
      };

      (storage.getPlan as any).mockResolvedValue(mockPlan);
      const app = createApp(franchiseeUser);
      const res = await request(app).patch("/api/plans/p1").send({
        financialInputs: invalidInputs,
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Financial inputs validation failed");
    });

    it("rejects financialInputs missing required metadata fields", async () => {
      const incompleteInputs = {
        revenue: {
          monthlyAuv: { currentValue: 2686700 },
        },
      };

      (storage.getPlan as any).mockResolvedValue(mockPlan);
      const app = createApp(franchiseeUser);
      const res = await request(app).patch("/api/plans/p1").send({
        financialInputs: incompleteInputs,
      });
      expect(res.status).toBe(400);
    });
  });

  describe("PUT /api/plans/:planId/startup-costs (Story 3.2)", () => {
    it("accepts valid startup costs with per-field metadata", async () => {
      (storage.getPlan as any).mockResolvedValue(mockPlan);
      (storage.updateStartupCosts as any).mockResolvedValue([validStartupCostItem]);

      const app = createApp(franchiseeUser);
      const res = await request(app)
        .put("/api/plans/p1/startup-costs")
        .send([validStartupCostItem]);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].source).toBe("brand_default");
    });

    it("accepts custom startup cost items with user_entry source", async () => {
      const customItem = {
        id: "00000000-0000-4000-8000-000000000002",
        name: "Insurance Deposit",
        amount: 500000,
        capexClassification: "non_capex",
        isCustom: true,
        source: "user_entry",
        brandDefaultAmount: null,
        item7RangeLow: null,
        item7RangeHigh: null,
        sortOrder: 1,
      };

      (storage.getPlan as any).mockResolvedValue(mockPlan);
      (storage.updateStartupCosts as any).mockResolvedValue([validStartupCostItem, customItem]);

      const app = createApp(franchiseeUser);
      const res = await request(app)
        .put("/api/plans/p1/startup-costs")
        .send([validStartupCostItem, customItem]);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it("rejects startup costs with invalid data", async () => {
      const invalidItem = {
        id: "bad-1",
        name: "",
        amount: -100,
        capexClassification: "invalid_type",
      };

      (storage.getPlan as any).mockResolvedValue(mockPlan);
      const app = createApp(franchiseeUser);
      const res = await request(app)
        .put("/api/plans/p1/startup-costs")
        .send([invalidItem]);
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
    });

    it("returns 401 when not authenticated", async () => {
      const app = createApp();
      const res = await request(app)
        .put("/api/plans/p1/startup-costs")
        .send([validStartupCostItem]);
      expect(res.status).toBe(401);
    });
  });

  describe("Franchisor access scoping (Story 3.2)", () => {
    it("allows franchisor to view plan within their brand", async () => {
      (storage.getPlan as any).mockResolvedValue(mockPlan);
      const app = createApp(franchisorUser);
      const res = await request(app).get("/api/plans/p1");
      expect(res.status).toBe(200);
    });

    it("denies franchisor access to plan from a different brand", async () => {
      (storage.getPlan as any).mockResolvedValue(mockPlan);
      const app = createApp(otherBrandFranchisor);
      const res = await request(app).get("/api/plans/p1");
      expect(res.status).toBe(403);
    });

    it("allows admin access to any plan regardless of brand", async () => {
      (storage.getPlan as any).mockResolvedValue(mockPlan);
      const app = createApp(adminUser);
      const res = await request(app).get("/api/plans/p1");
      expect(res.status).toBe(200);
    });
  });
});
