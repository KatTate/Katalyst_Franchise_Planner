import { Router, type Request, type Response } from "express";
import { requireAuth, requireRole, getEffectiveUser } from "../middleware/auth";
import { storage } from "../storage";
import type { Plan, User, ConsentStatus, PlanAcknowledgment, Brand } from "@shared/schema";
import { unwrapForEngine } from "@shared/plan-initialization";
import { calculateProjections, type EngineOutput, type StartupCostLineItem } from "@shared/financial-engine";

const router = Router();

const STALLED_DAYS = 30;

interface PipelineFranchisee {
  franchiseeId: string;
  displayName: string | null;
  planId: string;
  planName: string;
  planStatus: string;
  pipelineStage: string;
  targetMarket: string | null;
  targetOpenQuarter: string | null;
  lastActivityDate: string;
  isStalled: boolean;
  hasConsentedFinancials: boolean;
  financialSummary: FinancialSummary | null;
  acknowledgment: AcknowledgmentState | null;
}

interface FinancialSummary {
  projectedAnnualRevenue: number;
  totalStartupInvestment: number;
  breakEvenMonth: number | null;
  roiPct: number;
}

interface AcknowledgmentState {
  acknowledgedAt: string;
  isStale: boolean;
}

interface PipelineResponse {
  franchisees: PipelineFranchisee[];
  summary: PipelineSummary;
  lastUpdated: string;
  acknowledgmentEnabled: boolean;
}

interface PipelineSummary {
  planning: number;
  site_evaluation: number;
  financing: number;
  construction: number;
  open: number;
  stalled: number;
  total: number;
}

function extractFinancialSummary(plan: Plan): FinancialSummary | null {
  if (!plan.financialInputs || !plan.startupCosts) return null;

  try {
    const engineInput = unwrapForEngine(
      plan.financialInputs as any,
      plan.startupCosts as StartupCostLineItem[]
    );
    const output = calculateProjections(engineInput);

    return {
      projectedAnnualRevenue: output.roiMetrics.projectedAnnualRevenueYear1,
      totalStartupInvestment: output.roiMetrics.totalStartupInvestment,
      breakEvenMonth: output.roiMetrics.breakEvenMonth,
      roiPct: output.roiMetrics.fiveYearROIPct,
    };
  } catch {
    return null;
  }
}

function isStalled(updatedAt: Date): boolean {
  const now = new Date();
  const diffMs = now.getTime() - updatedAt.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= STALLED_DAYS;
}

router.get(
  "/",
  requireAuth,
  requireRole("franchisor"),
  async (req: Request, res: Response) => {
    const effectiveUser = await getEffectiveUser(req);
    const brandId = effectiveUser.brandId;

    if (!brandId) {
      return res.status(400).json({ message: "No brand associated with this user" });
    }

    if (effectiveUser.role !== "franchisor") {
      return res.status(403).json({ message: "This page is for franchisor admins. Please use the admin dashboard." });
    }

    const [franchiseeUsers, allPlans, brand] = await Promise.all([
      storage.getFranchiseesByBrand(brandId),
      storage.getPlansByBrand(brandId),
      storage.getBrand(brandId),
    ]);

    const planIds = allPlans.map((p) => p.id);
    const [consentMap, acknowledgmentMap] = await Promise.all([
      storage.getConsentStatusBatch(planIds),
      storage.getAcknowledgmentsByPlanIds(planIds, effectiveUser.id),
    ]);

    const franchiseeMap = new Map<string, User>();
    for (const u of franchiseeUsers) {
      franchiseeMap.set(u.id, u);
    }

    const franchiseeIds = new Set(franchiseeUsers.map((u) => u.id));
    const franchiseePlans = allPlans.filter((p) => franchiseeIds.has(p.userId));

    const summary: PipelineSummary = {
      planning: 0,
      site_evaluation: 0,
      financing: 0,
      construction: 0,
      open: 0,
      stalled: 0,
      total: 0,
    };

    const pipelineData: PipelineFranchisee[] = [];

    for (const plan of franchiseePlans) {
      const user = franchiseeMap.get(plan.userId);
      if (!user) continue;

      const consent = consentMap.get(plan.id) ?? { hasConsent: false, grantedAt: null };
      const ack = acknowledgmentMap.get(plan.id);
      const stalled = isStalled(plan.updatedAt);
      const stage = plan.pipelineStage || "planning";

      if (stage in summary) {
        (summary as any)[stage]++;
      }
      if (stalled) {
        summary.stalled++;
      }
      summary.total++;

      let financialSummary: FinancialSummary | null = null;
      if (consent.hasConsent) {
        financialSummary = extractFinancialSummary(plan);
      }

      let acknowledgment: AcknowledgmentState | null = null;
      if (ack) {
        const isStale = plan.updatedAt > ack.planUpdatedAtSnapshot;
        acknowledgment = {
          acknowledgedAt: ack.acknowledgedAt.toISOString(),
          isStale,
        };
      }

      pipelineData.push({
        franchiseeId: user.id,
        displayName: user.displayName || user.email,
        planId: plan.id,
        planName: plan.name,
        planStatus: plan.status,
        pipelineStage: stage,
        targetMarket: plan.targetMarket,
        targetOpenQuarter: plan.targetOpenQuarter,
        lastActivityDate: plan.updatedAt.toISOString(),
        isStalled: stalled,
        hasConsentedFinancials: consent.hasConsent,
        financialSummary,
        acknowledgment,
      });
    }

    const response: PipelineResponse = {
      franchisees: pipelineData,
      summary,
      lastUpdated: new Date().toISOString(),
      acknowledgmentEnabled: brand?.franchisorAcknowledgmentEnabled ?? false,
    };

    return res.json(response);
  }
);

router.post(
  "/:planId/acknowledge",
  requireAuth,
  requireRole("franchisor"),
  async (req: Request<{ planId: string }>, res: Response) => {
    const effectiveUser = await getEffectiveUser(req);
    const plan = await storage.getPlan(req.params.planId);

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    if (plan.brandId !== effectiveUser.brandId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const brand = await storage.getBrand(plan.brandId);
    if (!brand?.franchisorAcknowledgmentEnabled) {
      return res.status(400).json({ message: "Acknowledgment is not enabled for this brand" });
    }

    const ack = await storage.acknowledgePlan(plan.id, effectiveUser.id, plan.updatedAt);
    return res.json(ack);
  }
);

router.delete(
  "/:planId/acknowledge",
  requireAuth,
  requireRole("franchisor"),
  async (req: Request<{ planId: string }>, res: Response) => {
    const effectiveUser = await getEffectiveUser(req);
    const plan = await storage.getPlan(req.params.planId);

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    if (plan.brandId !== effectiveUser.brandId) {
      return res.status(403).json({ message: "Access denied" });
    }

    await storage.removeAcknowledgment(plan.id, effectiveUser.id);
    return res.json({ success: true });
  }
);

export default router;
