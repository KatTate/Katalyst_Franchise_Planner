import type { Brand } from "@shared/schema";
import type { ValidationMetricComparison, ValidationToleranceConfig } from "@shared/schema";
import type { EngineOutput, PlanFinancialInputs, StartupCostLineItem } from "@shared/financial-engine";
import { buildPlanFinancialInputs, buildPlanStartupCosts, unwrapForEngine } from "@shared/plan-initialization";
import { calculateProjections } from "@shared/financial-engine";

const DEFAULT_TOLERANCES: ValidationToleranceConfig = {
  currency: 100,
  percentage: 0.001,
  months: 1,
};

export interface ValidationTestInputs {
  revenue?: {
    monthlyAuv?: number;
    growthRates?: number[];
    startingMonthAuvPct?: number;
  };
  operatingCosts?: {
    cogsPct?: number;
    laborPct?: number;
    facilitiesAnnual?: number;
    marketingPct?: number;
    royaltyPct?: number;
    adFundPct?: number;
    otherOpexPct?: number;
  };
  financing?: {
    loanAmount?: number;
    interestRate?: number;
    loanTermMonths?: number;
    downPaymentPct?: number;
  };
  startupCapital?: {
    workingCapitalMonths?: number;
    depreciationYears?: number;
  };
  startupCosts?: Array<{ name: string; amount: number }>;
}

export interface ValidationExpectedOutputs {
  roiMetrics?: {
    totalStartupInvestment?: number;
    fiveYearCumulativeCashFlow?: number;
    fiveYearROIPct?: number;
    breakEvenMonth?: number | null;
  };
  annualSummaries?: Array<{
    year: number;
    revenue?: number;
    totalCogs?: number;
    grossProfit?: number;
    totalOpex?: number;
    ebitda?: number;
    preTaxIncome?: number;
    endingCash?: number;
  }>;
  identityChecks?: boolean;
}

function applyTestInputOverrides(
  planInputs: PlanFinancialInputs,
  testInputs: ValidationTestInputs
): void {
  if (testInputs.revenue) {
    if (testInputs.revenue.monthlyAuv !== undefined)
      planInputs.revenue.monthlyAuv.currentValue = testInputs.revenue.monthlyAuv;
    if (testInputs.revenue.growthRates !== undefined) {
      for (let i = 0; i < Math.min(testInputs.revenue.growthRates.length, 5); i++) {
        planInputs.revenue.growthRates[i].currentValue = testInputs.revenue.growthRates[i];
      }
    }
    if (testInputs.revenue.startingMonthAuvPct !== undefined)
      planInputs.revenue.startingMonthAuvPct.currentValue = testInputs.revenue.startingMonthAuvPct;
  }
  if (testInputs.operatingCosts) {
    const oc = testInputs.operatingCosts;
    if (oc.cogsPct !== undefined) planInputs.operatingCosts.cogsPct.forEach((f) => { f.currentValue = oc.cogsPct!; });
    if (oc.laborPct !== undefined) planInputs.operatingCosts.laborPct.forEach((f) => { f.currentValue = oc.laborPct!; });
    if (oc.facilitiesAnnual !== undefined) planInputs.operatingCosts.facilitiesAnnual.forEach((f) => { f.currentValue = oc.facilitiesAnnual!; });
    if (oc.marketingPct !== undefined) planInputs.operatingCosts.marketingPct.forEach((f) => { f.currentValue = oc.marketingPct!; });
    if (oc.royaltyPct !== undefined) planInputs.operatingCosts.royaltyPct.forEach((f) => { f.currentValue = oc.royaltyPct!; });
    if (oc.adFundPct !== undefined) planInputs.operatingCosts.adFundPct.forEach((f) => { f.currentValue = oc.adFundPct!; });
    if (oc.otherOpexPct !== undefined) planInputs.operatingCosts.otherOpexPct.forEach((f) => { f.currentValue = oc.otherOpexPct!; });
  }
  if (testInputs.financing) {
    const f = testInputs.financing;
    if (f.loanAmount !== undefined) planInputs.financing.loanAmount.currentValue = f.loanAmount;
    if (f.interestRate !== undefined) planInputs.financing.interestRate.currentValue = f.interestRate;
    if (f.loanTermMonths !== undefined) planInputs.financing.loanTermMonths.currentValue = f.loanTermMonths;
    if (f.downPaymentPct !== undefined) planInputs.financing.downPaymentPct.currentValue = f.downPaymentPct;
  }
  if (testInputs.startupCapital) {
    const sc = testInputs.startupCapital;
    if (sc.workingCapitalMonths !== undefined)
      planInputs.startupCapital.workingCapitalMonths.currentValue = sc.workingCapitalMonths;
    if (sc.depreciationYears !== undefined)
      planInputs.startupCapital.depreciationYears.currentValue = sc.depreciationYears;
  }
}

function applyStartupCostOverrides(
  costs: StartupCostLineItem[],
  overrides: Array<{ name: string; amount: number }>
): void {
  for (const override of overrides) {
    const match = costs.find((c) => c.name.toLowerCase() === override.name.toLowerCase());
    if (match) {
      match.amount = override.amount;
    }
  }
}

function getMetricType(category: string, metric: string): "currency" | "percentage" | "months" {
  if (metric === "breakEvenMonth") return "months";
  if (
    metric.includes("Pct") ||
    metric.includes("Rate") ||
    metric === "fiveYearROIPct" ||
    metric === "grossProfitPct" ||
    metric === "ebitdaPct" ||
    metric === "contributionMarginPct" ||
    metric === "preTaxIncomePct"
  ) {
    return "percentage";
  }
  return "currency";
}

function getTolerance(tolerances: ValidationToleranceConfig, type: "currency" | "percentage" | "months"): number {
  switch (type) {
    case "currency": return tolerances.currency;
    case "percentage": return tolerances.percentage;
    case "months": return tolerances.months;
  }
}

export function compareMetrics(
  actual: EngineOutput,
  expected: ValidationExpectedOutputs,
  tolerances: ValidationToleranceConfig
): ValidationMetricComparison[] {
  const results: ValidationMetricComparison[] = [];

  if (expected.roiMetrics) {
    const roi = expected.roiMetrics;
    const actualRoi = actual.roiMetrics;

    const roiFields: Array<{ key: keyof typeof actualRoi; expected: number | null | undefined }> = [
      { key: "totalStartupInvestment", expected: roi.totalStartupInvestment },
      { key: "fiveYearCumulativeCashFlow", expected: roi.fiveYearCumulativeCashFlow },
      { key: "fiveYearROIPct", expected: roi.fiveYearROIPct },
      { key: "breakEvenMonth", expected: roi.breakEvenMonth },
    ];

    for (const field of roiFields) {
      if (field.expected === undefined) continue;
      const actualVal = actualRoi[field.key] ?? 0;
      const expectedVal = field.expected ?? 0;
      const diff = Math.abs(actualVal - expectedVal);
      const mType = getMetricType("roiMetrics", field.key);
      const tol = getTolerance(tolerances, mType);

      results.push({
        metric: field.key,
        category: "ROI Metrics",
        expected: expectedVal,
        actual: actualVal,
        difference: diff,
        toleranceUsed: tol,
        passed: diff <= tol,
      });
    }
  }

  if (expected.annualSummaries) {
    for (const expectedYear of expected.annualSummaries) {
      const actualYear = actual.annualSummaries.find((a) => a.year === expectedYear.year);
      if (!actualYear) continue;

      const yearFields: Array<{ key: string; expected: number | undefined; actual: number }> = [
        { key: "revenue", expected: expectedYear.revenue, actual: actualYear.revenue },
        { key: "totalCogs", expected: expectedYear.totalCogs, actual: actualYear.totalCogs },
        { key: "grossProfit", expected: expectedYear.grossProfit, actual: actualYear.grossProfit },
        { key: "totalOpex", expected: expectedYear.totalOpex, actual: actualYear.totalOpex },
        { key: "ebitda", expected: expectedYear.ebitda, actual: actualYear.ebitda },
        { key: "preTaxIncome", expected: expectedYear.preTaxIncome, actual: actualYear.preTaxIncome },
        { key: "endingCash", expected: expectedYear.endingCash, actual: actualYear.endingCash },
      ];

      for (const field of yearFields) {
        if (field.expected === undefined) continue;
        const diff = Math.abs(field.actual - field.expected);
        const mType = getMetricType("annualSummaries", field.key);
        const tol = getTolerance(tolerances, mType);

        results.push({
          metric: `Year ${expectedYear.year} ${field.key}`,
          category: `Year ${expectedYear.year}`,
          expected: field.expected,
          actual: field.actual,
          difference: diff,
          toleranceUsed: tol,
          passed: diff <= tol,
        });
      }
    }
  }

  if (expected.identityChecks) {
    for (const check of actual.identityChecks) {
      results.push({
        metric: check.name,
        category: "Identity Checks",
        expected: check.expected,
        actual: check.actual,
        difference: Math.abs(check.actual - check.expected),
        toleranceUsed: check.tolerance,
        passed: check.passed,
      });
    }
  }

  return results;
}

export interface ValidationResult {
  status: "pass" | "fail";
  testInputs: ValidationTestInputs;
  expectedOutputs: ValidationExpectedOutputs;
  actualOutputs: {
    roiMetrics: EngineOutput["roiMetrics"];
    annualSummaries: EngineOutput["annualSummaries"];
    identityChecks: EngineOutput["identityChecks"];
  };
  comparisonResults: ValidationMetricComparison[];
  toleranceConfig: ValidationToleranceConfig;
}

export function runBrandValidation(
  brand: Brand,
  testInputs: ValidationTestInputs,
  expectedOutputs: ValidationExpectedOutputs,
  tolerances?: Partial<ValidationToleranceConfig>
): ValidationResult {
  if (!brand.brandParameters) {
    throw new Error("Brand does not have financial parameters configured");
  }

  const mergedTolerances: ValidationToleranceConfig = {
    ...DEFAULT_TOLERANCES,
    ...tolerances,
  };

  const planInputs = buildPlanFinancialInputs(brand.brandParameters);

  applyTestInputOverrides(planInputs, testInputs);

  const startupCosts = brand.startupCostTemplate
    ? buildPlanStartupCosts(brand.startupCostTemplate)
    : [];

  if (testInputs.startupCosts) {
    applyStartupCostOverrides(startupCosts, testInputs.startupCosts);
  }

  const engineInput = unwrapForEngine(planInputs, startupCosts);

  const engineOutput = calculateProjections(engineInput);

  const comparisonResults = compareMetrics(engineOutput, expectedOutputs, mergedTolerances);

  const allPassed = comparisonResults.every((r) => r.passed);

  return {
    status: allPassed ? "pass" : "fail",
    testInputs,
    expectedOutputs,
    actualOutputs: {
      roiMetrics: engineOutput.roiMetrics,
      annualSummaries: engineOutput.annualSummaries,
      identityChecks: engineOutput.identityChecks,
    },
    comparisonResults,
    toleranceConfig: mergedTolerances,
  };
}
