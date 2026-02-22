import { calculateProjections, type EngineInput, type FinancialInputs } from "@shared/financial-engine";
import { unwrapForEngine } from "@shared/plan-initialization";
import type { PlanFinancialInputs, StartupCostLineItem } from "@shared/financial-engine";

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
  { key: "revenue", label: "Revenue", min: -50, max: 100, step: 5, unit: "%" },
  { key: "cogs", label: "COGS", min: -20, max: 20, step: 1, unit: "pp" },
  { key: "labor", label: "Payroll / Labor", min: -50, max: 100, step: 5, unit: "%" },
  { key: "marketing", label: "Marketing", min: -50, max: 100, step: 5, unit: "%" },
  { key: "facilities", label: "Facilities", min: -50, max: 100, step: 5, unit: "%" },
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

export function cloneFinancialInputs(fi: FinancialInputs): FinancialInputs {
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

export function applySensitivityFactors(
  fi: FinancialInputs,
  sliders: SliderValues,
): FinancialInputs {
  for (let i = 0; i < fi.revenue.monthlyAuvByMonth.length; i++) {
    fi.revenue.monthlyAuvByMonth[i] = Math.round(fi.revenue.monthlyAuvByMonth[i] * (1 + sliders.revenue / 100));
  }

  for (let i = 0; i < fi.operatingCosts.cogsPct.length; i++) {
    fi.operatingCosts.cogsPct[i] = clamp01(fi.operatingCosts.cogsPct[i] + sliders.cogs / 100);
  }

  for (let i = 0; i < fi.operatingCosts.laborPct.length; i++) {
    fi.operatingCosts.laborPct[i] = clamp01(fi.operatingCosts.laborPct[i] * (1 + sliders.labor / 100));
  }

  for (let i = 0; i < fi.operatingCosts.marketingPct.length; i++) {
    fi.operatingCosts.marketingPct[i] = clamp01(fi.operatingCosts.marketingPct[i] * (1 + sliders.marketing / 100));
  }

  for (let i = 0; i < 5; i++) {
    fi.operatingCosts.facilitiesAnnual[i] = Math.round(fi.operatingCosts.facilitiesAnnual[i] * (1 + sliders.facilities / 100));
  }

  return fi;
}

export interface SensitivityOutputs {
  base: ReturnType<typeof calculateProjections>;
  current: ReturnType<typeof calculateProjections>;
}

export function computeSensitivityOutputs(
  planInputs: PlanFinancialInputs,
  startupCosts: StartupCostLineItem[],
  currentSliders: SliderValues,
): SensitivityOutputs {
  const baseEngineInput: EngineInput = unwrapForEngine(planInputs, startupCosts);
  const baseOutput = calculateProjections(baseEngineInput);

  const hasAdjustment = Object.values(currentSliders).some((v) => v !== 0);
  let currentOutput = baseOutput;
  if (hasAdjustment) {
    const currentInputs = applySensitivityFactors(
      cloneFinancialInputs(baseEngineInput.financialInputs),
      currentSliders,
    );
    currentOutput = calculateProjections({
      financialInputs: currentInputs,
      startupCosts: baseEngineInput.startupCosts,
    });
  }

  return { base: baseOutput, current: currentOutput };
}
