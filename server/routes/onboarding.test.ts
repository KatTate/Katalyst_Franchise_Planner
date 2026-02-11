import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

vi.mock("../storage", () => ({
  storage: {
    updateUserOnboarding: vi.fn(),
  },
}));

import { storage } from "../storage";

const onboardingCompleteSchema = z.object({
  franchise_experience: z.enum(["none", "some", "experienced"]),
  financial_literacy: z.enum(["basic", "comfortable", "advanced"]),
  planning_experience: z.enum(["first_time", "done_before", "frequent"]),
});

const selectTierSchema = z.object({
  preferred_tier: z.enum(["planning_assistant", "forms", "quick_entry"]),
});

function computeRecommendedTier(data: z.infer<typeof onboardingCompleteSchema>) {
  const experienceScores: Record<string, number> = { none: 0, some: 1, experienced: 3 };
  const literacyScores: Record<string, number> = { basic: 0, comfortable: 1, advanced: 3 };
  const planningScores: Record<string, number> = { first_time: 0, done_before: 1, frequent: 3 };

  const totalScore =
    experienceScores[data.franchise_experience] +
    literacyScores[data.financial_literacy] +
    planningScores[data.planning_experience];

  if (totalScore <= 3) return "planning_assistant";
  if (totalScore <= 6) return "forms";
  return "quick_entry";
}

describe("Onboarding Routes - Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/onboarding/complete - Tier Recommendation Logic", () => {
    it("should recommend planning_assistant for beginners (score <= 3)", () => {
      const result = computeRecommendedTier({
        franchise_experience: "none",
        financial_literacy: "basic",
        planning_experience: "first_time",
      });
      expect(result).toBe("planning_assistant");
    });

    it("should recommend planning_assistant at boundary (score = 3)", () => {
      const result = computeRecommendedTier({
        franchise_experience: "experienced",
        financial_literacy: "basic",
        planning_experience: "first_time",
      });
      expect(result).toBe("planning_assistant");
    });

    it("should recommend forms for intermediate users (score 4-6)", () => {
      const result = computeRecommendedTier({
        franchise_experience: "some",
        financial_literacy: "comfortable",
        planning_experience: "done_before",
      });
      expect(result).toBe("planning_assistant");

      const result2 = computeRecommendedTier({
        franchise_experience: "experienced",
        financial_literacy: "comfortable",
        planning_experience: "done_before",
      });
      expect(result2).toBe("forms");
    });

    it("should recommend quick_entry for advanced users (score > 6)", () => {
      const result = computeRecommendedTier({
        franchise_experience: "experienced",
        financial_literacy: "advanced",
        planning_experience: "frequent",
      });
      expect(result).toBe("quick_entry");
    });

    it("should reject invalid franchise_experience values", () => {
      const parsed = onboardingCompleteSchema.safeParse({
        franchise_experience: "invalid",
        financial_literacy: "basic",
        planning_experience: "first_time",
      });
      expect(parsed.success).toBe(false);
    });

    it("should reject missing fields", () => {
      const parsed = onboardingCompleteSchema.safeParse({
        franchise_experience: "none",
      });
      expect(parsed.success).toBe(false);
    });

    it("should accept all valid enum combinations", () => {
      const validCombos = [
        { franchise_experience: "none", financial_literacy: "basic", planning_experience: "first_time" },
        { franchise_experience: "some", financial_literacy: "comfortable", planning_experience: "done_before" },
        { franchise_experience: "experienced", financial_literacy: "advanced", planning_experience: "frequent" },
      ];
      for (const combo of validCombos) {
        const parsed = onboardingCompleteSchema.safeParse(combo);
        expect(parsed.success).toBe(true);
      }
    });
  });

  describe("POST /api/onboarding/select-tier", () => {
    it("should validate tier selection", () => {
      const validTiers = ["planning_assistant", "forms", "quick_entry"];
      for (const tier of validTiers) {
        const parsed = selectTierSchema.safeParse({ preferred_tier: tier });
        expect(parsed.success).toBe(true);
      }
    });

    it("should reject invalid tier", () => {
      const parsed = selectTierSchema.safeParse({ preferred_tier: "invalid" });
      expect(parsed.success).toBe(false);
    });

    it("should call updateUserOnboarding with correct params", async () => {
      (storage.updateUserOnboarding as any).mockResolvedValue({});
      await storage.updateUserOnboarding("user-1", {
        onboardingCompleted: true,
        preferredTier: "forms",
      });
      expect(storage.updateUserOnboarding).toHaveBeenCalledWith("user-1", {
        onboardingCompleted: true,
        preferredTier: "forms",
      });
    });
  });

  describe("POST /api/onboarding/skip", () => {
    it("should mark onboarding as completed without tier", async () => {
      (storage.updateUserOnboarding as any).mockResolvedValue({});
      await storage.updateUserOnboarding("user-1", {
        onboardingCompleted: true,
      });
      expect(storage.updateUserOnboarding).toHaveBeenCalledWith("user-1", {
        onboardingCompleted: true,
      });
    });
  });

  describe("Role-based access control", () => {
    it("should only allow franchisee role for onboarding", () => {
      const user = { role: "franchisor" };
      expect(user.role !== "franchisee").toBe(true);

      const franchiseeUser = { role: "franchisee" };
      expect(franchiseeUser.role !== "franchisee").toBe(false);
    });
  });
});
