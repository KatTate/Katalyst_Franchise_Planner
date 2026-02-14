import { describe, it, expect } from "vitest";
import { compareMetrics, runBrandValidation } from "./brand-validation-service";
import type { EngineOutput } from "@shared/financial-engine";
import type { ValidationToleranceConfig } from "@shared/schema";
import type { Brand, BrandParameters } from "@shared/schema";

function makeParam(value: number, label = "Test", description = "Test") {
  return { value, label, description };
}

function makeBrandParameters(): BrandParameters {
  return {
    revenue: {
      monthly_auv: makeParam(15000),
      year1_growth_rate: makeParam(0.05),
      year2_growth_rate: makeParam(0.03),
      starting_month_auv_pct: makeParam(0.08),
    },
    operating_costs: {
      cogs_pct: makeParam(0.30),
      labor_pct: makeParam(0.25),
      rent_monthly: makeParam(3000),
      utilities_monthly: makeParam(500),
      insurance_monthly: makeParam(200),
      marketing_pct: makeParam(0.05),
      royalty_pct: makeParam(0.065),
      ad_fund_pct: makeParam(0.02),
      other_monthly: makeParam(300),
    },
    financing: {
      loan_amount: makeParam(150000),
      interest_rate: makeParam(0.105),
      loan_term_months: makeParam(84),
      down_payment_pct: makeParam(0.20),
    },
    startup_capital: {
      working_capital_months: makeParam(3),
      depreciation_years: makeParam(4),
    },
  };
}

function makeBrand(overrides: Partial<Brand> = {}): Brand {
  return {
    id: "brand-1",
    name: "TestBrand",
    slug: "testbrand",
    displayName: null,
    brandParameters: makeBrandParameters(),
    startupCostTemplate: [
      {
        id: "sc-1",
        name: "Franchise Fee",
        default_amount: 25000,
        capex_classification: "capex",
        item7_range_low: 20000,
        item7_range_high: 30000,
        sort_order: 1,
      },
    ],
    logoUrl: null,
    primaryColor: null,
    defaultBookingUrl: null,
    defaultAccountManagerId: null,
    franchisorAcknowledgmentEnabled: false,
    createdAt: new Date(),
    ...overrides,
  };
}

describe("compareMetrics", () => {
  const tolerances: ValidationToleranceConfig = {
    currency: 100,
    percentage: 0.001,
    months: 1,
  };

  it("returns passing results when actual matches expected within tolerance", () => {
    const actual: Partial<EngineOutput> = {
      roiMetrics: {
        totalStartupInvestment: 10000,
        fiveYearCumulativeCashFlow: 50000,
        fiveYearROIPct: 0.25,
        breakEvenMonth: 18,
      },
      annualSummaries: [],
      identityChecks: [],
    };

    const expected = {
      roiMetrics: {
        totalStartupInvestment: 10050,
        fiveYearCumulativeCashFlow: 50000,
        fiveYearROIPct: 0.2505,
        breakEvenMonth: 18,
      },
    };

    const results = compareMetrics(actual as EngineOutput, expected, tolerances);
    expect(results.every((r) => r.passed)).toBe(true);
    expect(results).toHaveLength(4);
  });

  it("returns failing result when actual exceeds tolerance", () => {
    const actual: Partial<EngineOutput> = {
      roiMetrics: {
        totalStartupInvestment: 10000,
        fiveYearCumulativeCashFlow: 50000,
        fiveYearROIPct: 0.25,
        breakEvenMonth: 18,
      },
      annualSummaries: [],
      identityChecks: [],
    };

    const expected = {
      roiMetrics: {
        totalStartupInvestment: 10500,
      },
    };

    const results = compareMetrics(actual as EngineOutput, expected, tolerances);
    const investmentResult = results.find((r) => r.metric === "totalStartupInvestment");
    expect(investmentResult?.passed).toBe(false);
    expect(investmentResult?.difference).toBe(500);
  });

  it("compares annual summary metrics", () => {
    const actual: Partial<EngineOutput> = {
      roiMetrics: {
        totalStartupInvestment: 0,
        fiveYearCumulativeCashFlow: 0,
        fiveYearROIPct: 0,
        breakEvenMonth: null,
      },
      annualSummaries: [
        { year: 1, revenue: 180000, totalCogs: 54000, grossProfit: 126000, totalOpex: 90000, ebitda: 36000, preTaxIncome: 30000, endingCash: 25000 },
      ],
      identityChecks: [],
    };

    const expected = {
      annualSummaries: [
        { year: 1, revenue: 180050 },
      ],
    };

    const results = compareMetrics(actual as EngineOutput, expected, tolerances);
    expect(results).toHaveLength(1);
    expect(results[0].passed).toBe(true);
    expect(results[0].metric).toBe("Year 1 revenue");
  });

  it("handles identity checks", () => {
    const actual: Partial<EngineOutput> = {
      roiMetrics: {
        totalStartupInvestment: 0,
        fiveYearCumulativeCashFlow: 0,
        fiveYearROIPct: 0,
        breakEvenMonth: null,
      },
      annualSummaries: [],
      identityChecks: [
        { name: "Revenue = COGS + Gross Profit", expected: 100, actual: 100, tolerance: 1, passed: true },
        { name: "Failing Check", expected: 100, actual: 200, tolerance: 1, passed: false },
      ],
    };

    const expected = { identityChecks: true };

    const results = compareMetrics(actual as EngineOutput, expected, tolerances);
    expect(results).toHaveLength(2);
    expect(results[0].passed).toBe(true);
    expect(results[1].passed).toBe(false);
  });

  it("returns empty results when no expected values provided", () => {
    const actual: Partial<EngineOutput> = {
      roiMetrics: {
        totalStartupInvestment: 10000,
        fiveYearCumulativeCashFlow: 50000,
        fiveYearROIPct: 0.25,
        breakEvenMonth: 18,
      },
      annualSummaries: [],
      identityChecks: [],
    };

    const results = compareMetrics(actual as EngineOutput, {}, tolerances);
    expect(results).toHaveLength(0);
  });
});

describe("runBrandValidation", () => {
  it("throws when brand has no parameters", () => {
    const brand = makeBrand({ brandParameters: null });
    expect(() =>
      runBrandValidation(brand, {}, {})
    ).toThrow("Brand does not have financial parameters configured");
  });

  it("runs validation with default tolerances and returns result structure", () => {
    const brand = makeBrand();
    const result = runBrandValidation(brand, {}, { identityChecks: true });

    expect(result.status).toMatch(/^(pass|fail)$/);
    expect(result.testInputs).toEqual({});
    expect(result.actualOutputs).toBeDefined();
    expect(result.actualOutputs.roiMetrics).toBeDefined();
    expect(result.actualOutputs.annualSummaries).toBeDefined();
    expect(result.toleranceConfig).toEqual({
      currency: 100,
      percentage: 0.001,
      months: 1,
    });
  });

  it("applies test input overrides", () => {
    const brand = makeBrand();
    const testInputs = {
      revenue: { monthlyAuv: 20000 },
    };
    const result = runBrandValidation(brand, testInputs, { identityChecks: true });

    expect(result.status).toMatch(/^(pass|fail)$/);
    expect(result.testInputs.revenue?.monthlyAuv).toBe(20000);
  });

  it("uses custom tolerances when provided", () => {
    const brand = makeBrand();
    const customTolerances = { currency: 500, percentage: 0.01 };
    const result = runBrandValidation(brand, {}, {}, customTolerances);

    expect(result.toleranceConfig.currency).toBe(500);
    expect(result.toleranceConfig.percentage).toBe(0.01);
    expect(result.toleranceConfig.months).toBe(1);
  });

  it("applies startup cost overrides", () => {
    const brand = makeBrand();
    const testInputs = {
      startupCosts: [{ name: "Franchise Fee", amount: 3000000 }],
    };
    const result = runBrandValidation(brand, testInputs, { identityChecks: true });
    expect(result.status).toMatch(/^(pass|fail)$/);
  });

  it("handles brand with no startup cost template", () => {
    const brand = makeBrand({ startupCostTemplate: null });
    const result = runBrandValidation(brand, {}, { identityChecks: true });
    expect(result.status).toMatch(/^(pass|fail)$/);
  });

  it("produces annual summaries for 5 years", () => {
    const brand = makeBrand();
    const result = runBrandValidation(brand, {}, {});
    expect(result.actualOutputs.annualSummaries.length).toBe(5);
    expect(result.actualOutputs.annualSummaries[0].year).toBe(1);
    expect(result.actualOutputs.annualSummaries[4].year).toBe(5);
  });

  it("returns pass when actual matches expected", () => {
    const brand = makeBrand();
    const firstRun = runBrandValidation(brand, {}, {});

    const expectedOutputs = {
      roiMetrics: {
        totalStartupInvestment: firstRun.actualOutputs.roiMetrics.totalStartupInvestment,
        breakEvenMonth: firstRun.actualOutputs.roiMetrics.breakEvenMonth,
      },
    };

    const secondRun = runBrandValidation(brand, {}, expectedOutputs);
    expect(secondRun.status).toBe("pass");
    expect(secondRun.comparisonResults.every((r) => r.passed)).toBe(true);
  });

  it("returns fail when actual does not match expected", () => {
    const brand = makeBrand();

    const expectedOutputs = {
      roiMetrics: {
        totalStartupInvestment: 999999999,
      },
    };

    const result = runBrandValidation(brand, {}, expectedOutputs);
    expect(result.status).toBe("fail");
    expect(result.comparisonResults.some((r) => !r.passed)).toBe(true);
  });
});
