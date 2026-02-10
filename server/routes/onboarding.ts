import { Router, Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";

const router = Router();

const TIER_DESCRIPTIONS: Record<string, string> = {
  planning_assistant: "We'll guide you through your plan with a conversational advisor. Perfect for first-time planners.",
  forms: "Build your plan section by section with structured input forms. Great for people who know their numbers.",
  quick_entry: "Jump right into a spreadsheet-style view for maximum speed. Ideal for experienced planners.",
};

const onboardingCompleteSchema = z.object({
  franchise_experience: z.enum(["none", "some", "experienced"]),
  financial_literacy: z.enum(["basic", "comfortable", "advanced"]),
  planning_experience: z.enum(["first_time", "done_before", "frequent"]),
});

router.post(
  "/complete",
  requireAuth,
  async (req: Request, res: Response) => {
    if (req.user!.role !== "franchisee") {
      return res.status(403).json({ message: "Onboarding is only for franchisees" });
    }

    const parsed = onboardingCompleteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors.map((e) => ({ path: e.path.map(String), message: e.message })),
      });
    }

    const { franchise_experience, financial_literacy, planning_experience } = parsed.data;

    const experienceScores: Record<string, number> = { none: 0, some: 1, experienced: 3 };
    const literacyScores: Record<string, number> = { basic: 0, comfortable: 1, advanced: 3 };
    const planningScores: Record<string, number> = { first_time: 0, done_before: 1, frequent: 3 };

    const totalScore =
      experienceScores[franchise_experience] +
      literacyScores[financial_literacy] +
      planningScores[planning_experience];

    let recommendedTier: "planning_assistant" | "forms" | "quick_entry";
    if (totalScore <= 3) {
      recommendedTier = "planning_assistant";
    } else if (totalScore <= 6) {
      recommendedTier = "forms";
    } else {
      recommendedTier = "quick_entry";
    }

    return res.json({
      recommendedTier,
      tierDescription: TIER_DESCRIPTIONS[recommendedTier],
    });
  }
);

const selectTierSchema = z.object({
  preferred_tier: z.enum(["planning_assistant", "forms", "quick_entry"]),
});

router.post(
  "/select-tier",
  requireAuth,
  async (req: Request, res: Response) => {
    if (req.user!.role !== "franchisee") {
      return res.status(403).json({ message: "Onboarding is only for franchisees" });
    }

    const parsed = selectTierSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors.map((e) => ({ path: e.path.map(String), message: e.message })),
      });
    }

    await storage.updateUserOnboarding(req.user!.id, {
      onboardingCompleted: true,
      preferredTier: parsed.data.preferred_tier,
    });

    return res.json({ success: true });
  }
);

router.post(
  "/skip",
  requireAuth,
  async (req: Request, res: Response) => {
    if (req.user!.role !== "franchisee") {
      return res.status(403).json({ message: "Onboarding is only for franchisees" });
    }

    await storage.updateUserOnboarding(req.user!.id, {
      onboardingCompleted: true,
    });

    return res.json({ success: true });
  }
);

export default router;
