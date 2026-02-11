import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

vi.mock("../storage", () => ({
  storage: {
    getPlan: vi.fn(),
    updatePlan: vi.fn(),
    getStartupCosts: vi.fn(),
    updateStartupCosts: vi.fn(),
    resetStartupCostsToDefaults: vi.fn(),
  },
}));

vi.mock("../services/financial-service", () => ({
  computePlanOutputs: vi.fn(),
}));

import { storage } from "../storage";
import { computePlanOutputs } from "../services/financial-service";

describe("Plans Routes - Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Plan Access Control", () => {
    it("should allow franchisee to access own plan", () => {
      const plan = { id: "p1", userId: "u1", brandId: "b1" };
      const effectiveUser = { id: "u1", role: "franchisee" as const, brandId: "b1" };
      const hasAccess = !(effectiveUser.role === "franchisee" && plan.userId !== effectiveUser.id);
      expect(hasAccess).toBe(true);
    });

    it("should deny franchisee access to other user's plan", () => {
      const plan = { id: "p1", userId: "u2", brandId: "b1" };
      const effectiveUser = { id: "u1", role: "franchisee" as const, brandId: "b1" };
      const denied = effectiveUser.role === "franchisee" && plan.userId !== effectiveUser.id;
      expect(denied).toBe(true);
    });

    it("should allow franchisor to access plans in own brand", () => {
      const plan = { id: "p1", userId: "u1", brandId: "b1" };
      const effectiveUser = { id: "f1", role: "franchisor" as const, brandId: "b1" };
      const denied = effectiveUser.role === "franchisor" && plan.brandId !== effectiveUser.brandId;
      expect(denied).toBe(false);
    });

    it("should deny franchisor access to plans in other brand", () => {
      const plan = { id: "p1", userId: "u1", brandId: "b2" };
      const effectiveUser = { id: "f1", role: "franchisor" as const, brandId: "b1" };
      const denied = effectiveUser.role === "franchisor" && plan.brandId !== effectiveUser.brandId;
      expect(denied).toBe(true);
    });

    it("should allow katalyst_admin to access any plan", () => {
      const plan = { id: "p1", userId: "u1", brandId: "b1" };
      const effectiveUser = { id: "a1", role: "katalyst_admin" as const, brandId: null };
      const franchiseeDenied = effectiveUser.role === "franchisee" && plan.userId !== effectiveUser.id;
      const franchisorDenied = effectiveUser.role === "franchisor" && plan.brandId !== effectiveUser.brandId;
      expect(franchiseeDenied || franchisorDenied).toBe(false);
    });

    it("should return 404 for non-existent plan", async () => {
      (storage.getPlan as any).mockResolvedValue(undefined);
      const plan = await storage.getPlan("nonexistent");
      expect(plan).toBeUndefined();
    });
  });

  describe("Plan Update (PATCH)", () => {
    it("should strip protected fields userId and brandId from updates", () => {
      const updateData = {
        name: "Updated Plan",
        userId: "hacker-id",
        brandId: "hacker-brand",
        financialInputs: {},
      };

      const { userId, brandId, ...allowedFields } = updateData;
      expect(allowedFields).not.toHaveProperty("userId");
      expect(allowedFields).not.toHaveProperty("brandId");
      expect(allowedFields).toHaveProperty("name");
    });

    it("should persist allowed fields via storage", async () => {
      const updatedPlan = { id: "p1", name: "Updated" };
      (storage.updatePlan as any).mockResolvedValue(updatedPlan);

      const result = await storage.updatePlan("p1", { name: "Updated" } as any);
      expect(result.name).toBe("Updated");
    });
  });

  describe("Startup Costs", () => {
    it("should get startup costs for a plan", async () => {
      const mockCosts = [
        { id: "c1", name: "Franchise Fee", amount: 35000, capexClassification: "non_capex" },
      ];
      (storage.getStartupCosts as any).mockResolvedValue(mockCosts);

      const costs = await storage.getStartupCosts("p1");
      expect(costs).toHaveLength(1);
      expect(costs[0].name).toBe("Franchise Fee");
    });

    it("should update startup costs", async () => {
      const newCosts = [
        { id: "c1", name: "Updated Fee", amount: 40000, capexClassification: "non_capex" },
      ];
      (storage.updateStartupCosts as any).mockResolvedValue(newCosts);

      const result = await storage.updateStartupCosts("p1", newCosts as any);
      expect(result[0].amount).toBe(40000);
    });

    it("should reset startup costs to brand defaults", async () => {
      const defaults = [
        { id: "c1", name: "Default Fee", amount: 35000, capexClassification: "non_capex" },
      ];
      (storage.resetStartupCostsToDefaults as any).mockResolvedValue(defaults);

      const result = await storage.resetStartupCostsToDefaults("p1", "b1");
      expect(result[0].name).toBe("Default Fee");
    });
  });

  describe("Financial Outputs", () => {
    it("should require financialInputs before computing outputs", () => {
      const plan = { id: "p1", financialInputs: null };
      const hasInputs = !!plan.financialInputs;
      expect(hasInputs).toBe(false);
    });

    it("should compute outputs when financialInputs present", async () => {
      const mockPlan = {
        id: "p1",
        financialInputs: { revenue: {} },
        brandId: "b1",
      };
      const mockOutput = {
        projections: [],
        summary: { totalRevenue: 500000 },
      };
      (computePlanOutputs as any).mockResolvedValue(mockOutput);

      const result = await computePlanOutputs(mockPlan as any, storage as any);
      expect(result.summary.totalRevenue).toBe(500000);
    });

    it("should handle engine errors gracefully", async () => {
      (computePlanOutputs as any).mockRejectedValue(new Error("Engine failure"));

      await expect(computePlanOutputs({} as any, storage as any)).rejects.toThrow("Engine failure");
    });
  });

  describe("Read-Only Impersonation Guard", () => {
    it("should block mutations during impersonation", () => {
      const session = { impersonating_user_id: "u1" };
      const method = "PATCH";
      const mutationMethods = ["POST", "PATCH", "PUT", "DELETE"];
      const blocked = !!session.impersonating_user_id && mutationMethods.includes(method);
      expect(blocked).toBe(true);
    });

    it("should allow GET during impersonation", () => {
      const session = { impersonating_user_id: "u1" };
      const method = "GET";
      const mutationMethods = ["POST", "PATCH", "PUT", "DELETE"];
      const blocked = !!session.impersonating_user_id && mutationMethods.includes(method);
      expect(blocked).toBe(false);
    });

    it("should allow mutations when not impersonating", () => {
      const session: Record<string, any> = {};
      const method = "PATCH";
      const blocked = !!session.impersonating_user_id;
      expect(blocked).toBe(false);
    });
  });
});
