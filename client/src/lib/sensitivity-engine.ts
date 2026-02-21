import { calculateProjections, type EngineInput, type FinancialInputs } from "@shared/financial-engine";
import { unwrapForEngine } from "@shared/plan-initialization";
import type { PlanFinancialInputs, StartupCostLineItem } from "@shared/financial-engine";
import type { ScenarioOutputs } from "./scenario-engine";

export interface SliderValues {
  revenue: number;
  cogs: number;
  labor: number;
  marketing: number;
  facilities: number;
}

export interface SliderConfig {
  key: keyof SliderValues;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}

export const SLIDER_CONFIGS: SliderConfig[] = [
  { key: "revenue", label: "Revenue", min: -15, max: 15, step: 1, unit: "%" },
  { key: "cogs", label: "COGS", min: -5, max: 5, step: 0.5, unit: "pp" },
  { key: "labor", label: "Payroll / Labor", min: -10, max: 10, step: 1, unit: "%" },
  { key: "marketing", label: "Marketing", min: -10, max: 10, step: 1, unit: "%" },
  { key: "facilities", label: "Facilities", min: -10, max: 10, step: 1, unit: "%" },
];

export const DEFAULT_SLIDER_VALUES: SliderValues = {
  revenue: 0,
  cogs: 0,
  labor: 0,
  marketing: 0,
  facilities: 0,
};

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function cloneFinancialInputs(fi: FinancialInputs): FinancialInputs {
  return {
    revenue: { ...fi.revenue, growthRates: [...fi.revenue.growthRates] as [number, number, number, number, number] },
    operatingCosts: {
      cogsPct: [...fi.operatingCosts.cogsPct] as [number, number, number, number, number],
      laborPct: [...fi.operatingCosts.laborPct] as [number, number, number, number, number],
      royaltyPct: [...fi.operatingCosts.royaltyPct] as [number, number, number, number, number],
      adFundPct: [...fi.operatingCosts.adFundPct] as [number, number, number, number, number],
      marketingPct: [...fi.operatingCosts.marketingPct] as [number, number, number, number, number],
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

function applySensitivityFactors(
  fi: FinancialInputs,
  sliders: SliderValues,
): FinancialInputs {
  fi.revenue.annualGrossSales = Math.round(fi.revenue.annualGrossSales * (1 + sliders.revenue / 100));

  for (let i = 0; i < 5; i++) {
    fi.operatingCosts.cogsPct[i] = clamp01(fi.operatingCosts.cogsPct[i] + sliders.cogs / 100);
  }

  for (let i = 0; i < 5; i++) {
    fi.operatingCosts.laborPct[i] = clamp01(fi.operatingCosts.laborPct[i] * (1 + sliders.labor / 100));
  }

  for (let i = 0; i < 5; i++) {
    fi.operatingCosts.marketingPct[i] = clamp01(fi.operatingCosts.marketingPct[i] * (1 + sliders.marketing / 100));
  }

  for (let i = 0; i < 5; i++) {
    fi.operatingCosts.facilitiesAnnual[i] = Math.round(fi.operatingCosts.facilitiesAnnual[i] * (1 + sliders.facilities / 100));
  }

  return fi;
}

export function computeSensitivityOutputs(
  planInputs: PlanFinancialInputs,
  startupCosts: StartupCostLineItem[],
): ScenarioOutputs {
  const baseEngineInput: EngineInput = unwrapForEngine(planInputs, startupCosts);
  const baseOutput = calculateProjections(baseEngineInput);

  const conservativeSliders: SliderValues = {
    revenue: -15,
    cogs: 5,
    labor: 10,
    marketing: 10,
    facilities: 10,
  };
  const conservativeInputs = applySensitivityFactors(
    cloneFinancialInputs(baseEngineInput.financialInputs),
    conservativeSliders,
  );
  const conservativeOutput = calculateProjections({
    financialInputs: conservativeInputs,
    startupCosts: baseEngineInput.startupCosts,
  });

  const optimisticSliders: SliderValues = {
    revenue: 15,
    cogs: -5,
    labor: -10,
    marketing: -10,
    facilities: -10,
  };
  const optimisticInputs = applySensitivityFactors(
    cloneFinancialInputs(baseEngineInput.financialInputs),
    optimisticSliders,
  );
  const optimisticOutput = calculateProjections({
    financialInputs: optimisticInputs,
    startupCosts: baseEngineInput.startupCosts,
  });

  return { base: baseOutput, conservative: conservativeOutput, optimistic: optimisticOutput };
}
