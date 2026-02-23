import { calculateProjections, type EngineInput, type EngineOutput, type FinancialInputs } from "@shared/financial-engine";
import { unwrapForEngine } from "@shared/plan-initialization";
import type { PlanFinancialInputs, StartupCostLineItem } from "@shared/financial-engine";

export type ScenarioId = "base" | "conservative" | "optimistic";

export interface ScenarioOutputs {
  base: EngineOutput;
  conservative: EngineOutput;
  optimistic: EngineOutput;
}

export const CONSERVATIVE_REVENUE_FACTOR = -0.15;
export const CONSERVATIVE_COGS_PP = 0.02;
export const CONSERVATIVE_OPEX_FACTOR = 0.10;

export const OPTIMISTIC_REVENUE_FACTOR = 0.15;
export const OPTIMISTIC_COGS_PP = -0.01;
export const OPTIMISTIC_OPEX_FACTOR = -0.05;

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function cloneFinancialInputs(fi: FinancialInputs): FinancialInputs {
  return {
    revenue: { ...fi.revenue, monthlyAuvByMonth: [...fi.revenue.monthlyAuvByMonth], growthRates: [...fi.revenue.growthRates] as [number, number, number, number, number] },
    operatingCosts: {
      cogsPct: [...fi.operatingCosts.cogsPct],
      laborPct: [...fi.operatingCosts.laborPct],
      royaltyPct: [...fi.operatingCosts.royaltyPct] as [number, number, number, number, number],
      adFundPct: [...fi.operatingCosts.adFundPct] as [number, number, number, number, number],
      marketingPct: [...fi.operatingCosts.marketingPct],
      otherOpexPct: [...fi.operatingCosts.otherOpexPct] as [number, number, number, number, number],
      payrollTaxPct: [...fi.operatingCosts.payrollTaxPct] as [number, number, number, number, number],
      facilitiesAnnual: [...fi.operatingCosts.facilitiesAnnual] as [number, number, number, number, number],
      managementSalariesAnnual: [...fi.operatingCosts.managementSalariesAnnual] as [number, number, number, number, number],
    },
    financing: { ...fi.financing },
    startup: { ...fi.startup },
    workingCapitalAssumptions: { ...fi.workingCapitalAssumptions },
    distributions: [...fi.distributions] as [number, number, number, number, number],
    taxRate: fi.taxRate,
    ebitdaMultiple: fi.ebitdaMultiple,
    targetPreTaxProfitPct: fi.targetPreTaxProfitPct ? [...fi.targetPreTaxProfitPct] as [number, number, number, number, number] : undefined,
    shareholderSalaryAdj: fi.shareholderSalaryAdj ? [...fi.shareholderSalaryAdj] as [number, number, number, number, number] : undefined,
    taxPaymentDelayMonths: fi.taxPaymentDelayMonths,
    nonCapexInvestment: fi.nonCapexInvestment ? [...fi.nonCapexInvestment] as [number, number, number, number, number] : undefined,
  };
}

function applyScenarioFactors(
  fi: FinancialInputs,
  revenueFactor: number,
  cogsPP: number,
  opexFactor: number,
): FinancialInputs {
  for (let i = 0; i < fi.revenue.monthlyAuvByMonth.length; i++) {
    fi.revenue.monthlyAuvByMonth[i] = Math.round(fi.revenue.monthlyAuvByMonth[i] * (1 + revenueFactor));
  }

  for (let i = 0; i < fi.operatingCosts.cogsPct.length; i++) {
    fi.operatingCosts.cogsPct[i] = clamp01(fi.operatingCosts.cogsPct[i] + cogsPP);
  }

  const opexMult = 1 + opexFactor;
  for (let i = 0; i < fi.operatingCosts.laborPct.length; i++) {
    fi.operatingCosts.laborPct[i] = clamp01(fi.operatingCosts.laborPct[i] * opexMult);
  }
  for (let i = 0; i < 5; i++) {
    fi.operatingCosts.facilitiesAnnual[i] = Math.round(fi.operatingCosts.facilitiesAnnual[i] * opexMult);
    fi.operatingCosts.otherOpexPct[i] = clamp01(fi.operatingCosts.otherOpexPct[i] * opexMult);
  }
  for (let i = 0; i < fi.operatingCosts.marketingPct.length; i++) {
    fi.operatingCosts.marketingPct[i] = clamp01(fi.operatingCosts.marketingPct[i] * opexMult);
  }

  return fi;
}

export function computeScenarioOutputs(
  planInputs: PlanFinancialInputs,
  startupCosts: StartupCostLineItem[],
): ScenarioOutputs {
  const baseEngineInput: EngineInput = unwrapForEngine(planInputs, startupCosts);
  const baseOutput = calculateProjections(baseEngineInput);

  const conservativeInputs = applyScenarioFactors(
    cloneFinancialInputs(baseEngineInput.financialInputs),
    CONSERVATIVE_REVENUE_FACTOR,
    CONSERVATIVE_COGS_PP,
    CONSERVATIVE_OPEX_FACTOR,
  );
  const conservativeOutput = calculateProjections({
    financialInputs: conservativeInputs,
    startupCosts: baseEngineInput.startupCosts,
  });

  const optimisticInputs = applyScenarioFactors(
    cloneFinancialInputs(baseEngineInput.financialInputs),
    OPTIMISTIC_REVENUE_FACTOR,
    OPTIMISTIC_COGS_PP,
    OPTIMISTIC_OPEX_FACTOR,
  );
  const optimisticOutput = calculateProjections({
    financialInputs: optimisticInputs,
    startupCosts: baseEngineInput.startupCosts,
  });

  return { base: baseOutput, conservative: conservativeOutput, optimistic: optimisticOutput };
}

export const SCENARIO_LABELS: Record<ScenarioId, string> = {
  base: "Base Case",
  conservative: "Conservative",
  optimistic: "Optimistic",
};

export const SCENARIO_COLORS: Record<ScenarioId, { bg: string; dot: string }> = {
  base: { bg: "", dot: "bg-foreground/60" },
  conservative: { bg: "bg-orange-50/50 dark:bg-orange-950/20", dot: "bg-orange-500" },
  optimistic: { bg: "bg-blue-50/50 dark:bg-blue-950/20", dot: "bg-blue-500" },
};
