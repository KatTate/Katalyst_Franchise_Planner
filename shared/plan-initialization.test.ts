import { describe, it, expect } from "vitest";
import {
  buildPlanFinancialInputs,
  buildPlanStartupCosts,
  unwrapForEngine,
  updateFieldValue,
  resetFieldToDefault,
  addCustomStartupCost,
  removeStartupCost,
  updateStartupCostAmount,
  resetStartupCostToDefault,
  reorderStartupCosts,
  getStartupCostTotals,
  migrateStartupCosts,
} from "./plan-initialization";
import { calculateProjections } from "./financial-engine";
import { planStartupCostsSchema, type BrandParameters, type StartupCostTemplate } from "./schema";
import type { FinancialFieldValue, PlanFinancialInputs } from "./financial-engine";

// ─── Test Brand Parameters (PostNet-like) ────────────────────────────────

const testBrandParams: BrandParameters = {
  revenue: {
    monthly_auv: { value: 26867, label: "Monthly AUV", description: "Average unit volume per month" },
    year1_growth_rate: { value: 0.13, label: "Year 1 Growth Rate", description: "Annual revenue growth year 1" },
    year2_growth_rate: { value: 0.13, label: "Year 2 Growth Rate", description: "Annual revenue growth year 2+" },
    starting_month_auv_pct: { value: 0.08, label: "Starting Month AUV %", description: "Month 1 revenue as % of AUV" },
  },
  operating_costs: {
    cogs_pct: { value: 0.30, label: "COGS %", description: "Cost of goods sold" },
    labor_pct: { value: 0.17, label: "Labor %", description: "Direct labor cost" },
    rent_monthly: { value: 5000, label: "Monthly Rent", description: "Monthly rent" },
    utilities_monthly: { value: 800, label: "Monthly Utilities", description: "Monthly utilities" },
    insurance_monthly: { value: 500, label: "Monthly Insurance", description: "Monthly insurance" },
    marketing_pct: { value: 0.05, label: "Marketing %", description: "Marketing as % of revenue" },
    royalty_pct: { value: 0.05, label: "Royalty %", description: "Franchise royalty fee" },
    ad_fund_pct: { value: 0.02, label: "Ad Fund %", description: "Advertising fund contribution" },
    other_monthly: { value: 1000, label: "Other Monthly", description: "Other monthly expenses" },
  },
  financing: {
    loan_amount: { value: 200000, label: "Loan Amount", description: "Total loan amount" },
    interest_rate: { value: 0.105, label: "Interest Rate", description: "Annual interest rate" },
    loan_term_months: { value: 144, label: "Loan Term", description: "Loan term in months" },
    down_payment_pct: { value: 0.20, label: "Down Payment %", description: "Down payment percentage" },
  },
  startup_capital: {
    working_capital_months: { value: 3, label: "Working Capital Months", description: "Months of working capital" },
    depreciation_years: { value: 4, label: "Depreciation Years", description: "Straight-line depreciation period" },
  },
};

const testStartupTemplate: StartupCostTemplate = [
  {
    id: "equip-1",
    name: "Equipment & Signage",
    default_amount: 126057,
    capex_classification: "capex",
    item7_range_low: 100000,
    item7_range_high: 150000,
    sort_order: 1,
  },
  {
    id: "improve-1",
    name: "Leasehold Improvements",
    default_amount: 875,
    capex_classification: "capex",
    item7_range_low: 500,
    item7_range_high: 2000,
    sort_order: 2,
  },
  {
    id: "tech-1",
    name: "Technology",
    default_amount: 5200,
    capex_classification: "capex",
    item7_range_low: 3000,
    item7_range_high: 8000,
    sort_order: 3,
  },
  {
    id: "noncapex-1",
    name: "Non-CapEx Investments",
    default_amount: 84375,
    capex_classification: "non_capex",
    item7_range_low: 50000,
    item7_range_high: 120000,
    sort_order: 4,
  },
  {
    id: "wc-1",
    name: "Working Capital",
    default_amount: 40000,
    capex_classification: "working_capital",
    item7_range_low: 20000,
    item7_range_high: 60000,
    sort_order: 5,
  },
];

// ─── buildPlanFinancialInputs ────────────────────────────────────────────

describe("buildPlanFinancialInputs", () => {
  const result = buildPlanFinancialInputs(testBrandParams);

  it("creates all required categories", () => {
    expect(result.revenue).toBeDefined();
    expect(result.operatingCosts).toBeDefined();
    expect(result.financing).toBeDefined();
    expect(result.startupCapital).toBeDefined();
  });

  describe("revenue fields", () => {
    it("converts monthlyAuv from dollars to cents", () => {
      // $26,867 → 2,686,700 cents
      expect(result.revenue.monthlyAuv.currentValue).toBe(2686700);
    });

    it("preserves percentage values as-is", () => {
      expect(result.revenue.year1GrowthRate.currentValue).toBe(0.13);
      expect(result.revenue.year2GrowthRate.currentValue).toBe(0.13);
      expect(result.revenue.startingMonthAuvPct.currentValue).toBe(0.08);
    });
  });

  describe("operating costs fields", () => {
    it("converts currency fields from dollars to cents", () => {
      expect(result.operatingCosts.rentMonthly.currentValue).toBe(500000);
      expect(result.operatingCosts.utilitiesMonthly.currentValue).toBe(80000);
      expect(result.operatingCosts.insuranceMonthly.currentValue).toBe(50000);
      expect(result.operatingCosts.otherMonthly.currentValue).toBe(100000);
    });

    it("preserves percentage values as-is", () => {
      expect(result.operatingCosts.cogsPct.currentValue).toBe(0.30);
      expect(result.operatingCosts.laborPct.currentValue).toBe(0.17);
      expect(result.operatingCosts.marketingPct.currentValue).toBe(0.05);
      expect(result.operatingCosts.royaltyPct.currentValue).toBe(0.05);
      expect(result.operatingCosts.adFundPct.currentValue).toBe(0.02);
    });
  });

  describe("financing fields", () => {
    it("converts loanAmount from dollars to cents", () => {
      expect(result.financing.loanAmount.currentValue).toBe(20000000);
    });

    it("preserves integer and percentage values", () => {
      expect(result.financing.interestRate.currentValue).toBe(0.105);
      expect(result.financing.loanTermMonths.currentValue).toBe(144);
      expect(result.financing.downPaymentPct.currentValue).toBe(0.20);
    });
  });

  describe("startup capital fields", () => {
    it("preserves integer values", () => {
      expect(result.startupCapital.workingCapitalMonths.currentValue).toBe(3);
      expect(result.startupCapital.depreciationYears.currentValue).toBe(4);
    });
  });

  describe("per-field metadata", () => {
    it("all fields have source: brand_default", () => {
      const allFields = getAllFields(result);
      allFields.forEach((field) => {
        expect(field.source).toBe("brand_default");
      });
    });

    it("all fields have isCustom: false", () => {
      const allFields = getAllFields(result);
      allFields.forEach((field) => {
        expect(field.isCustom).toBe(false);
      });
    });

    it("all fields have lastModifiedAt: null", () => {
      const allFields = getAllFields(result);
      allFields.forEach((field) => {
        expect(field.lastModifiedAt).toBeNull();
      });
    });

    it("all fields have brandDefault set to currentValue", () => {
      const allFields = getAllFields(result);
      allFields.forEach((field) => {
        expect(field.brandDefault).toBe(field.currentValue);
      });
    });
  });
});

// ─── buildPlanStartupCosts ───────────────────────────────────────────────

describe("buildPlanStartupCosts", () => {
  const result = buildPlanStartupCosts(testStartupTemplate);

  it("converts all template items", () => {
    expect(result).toHaveLength(5);
  });

  it("converts amounts from dollars to cents", () => {
    expect(result[0].amount).toBe(12605700); // $126,057 → cents
    expect(result[1].amount).toBe(87500);    // $875 → cents
    expect(result[2].amount).toBe(520000);   // $5,200 → cents
    expect(result[3].amount).toBe(8437500);  // $84,375 → cents
    expect(result[4].amount).toBe(4000000);  // $40,000 → cents
  });

  it("preserves names", () => {
    expect(result[0].name).toBe("Equipment & Signage");
    expect(result[3].name).toBe("Non-CapEx Investments");
  });

  it("preserves capex classifications", () => {
    expect(result[0].capexClassification).toBe("capex");
    expect(result[3].capexClassification).toBe("non_capex");
    expect(result[4].capexClassification).toBe("working_capital");
  });

  it("handles empty template", () => {
    const empty = buildPlanStartupCosts([]);
    expect(empty).toHaveLength(0);
  });
});

// ─── unwrapForEngine ─────────────────────────────────────────────────────

describe("unwrapForEngine", () => {
  const planInputs = buildPlanFinancialInputs(testBrandParams);
  const startupCosts = buildPlanStartupCosts(testStartupTemplate);
  const engineInput = unwrapForEngine(planInputs, startupCosts);

  describe("revenue mapping", () => {
    it("converts monthlyAuv to annualGrossSales (×12)", () => {
      // monthlyAuv = 2,686,700 cents → annualGrossSales = 32,240,400 cents
      expect(engineInput.financialInputs.revenue.annualGrossSales).toBe(2686700 * 12);
    });

    it("sets monthsToReachAuv to system default", () => {
      expect(engineInput.financialInputs.revenue.monthsToReachAuv).toBe(14);
    });

    it("preserves startingMonthAuvPct", () => {
      expect(engineInput.financialInputs.revenue.startingMonthAuvPct).toBe(0.08);
    });

    it("expands growth rates into 5-year array", () => {
      expect(engineInput.financialInputs.revenue.growthRates).toEqual([0.13, 0.13, 0.13, 0.13, 0.13]);
    });
  });

  describe("operating costs mapping", () => {
    it("expands percentage values into 5-year arrays", () => {
      expect(engineInput.financialInputs.operatingCosts.cogsPct).toEqual([0.30, 0.30, 0.30, 0.30, 0.30]);
      expect(engineInput.financialInputs.operatingCosts.laborPct).toEqual([0.17, 0.17, 0.17, 0.17, 0.17]);
      expect(engineInput.financialInputs.operatingCosts.royaltyPct).toEqual([0.05, 0.05, 0.05, 0.05, 0.05]);
      expect(engineInput.financialInputs.operatingCosts.adFundPct).toEqual([0.02, 0.02, 0.02, 0.02, 0.02]);
      expect(engineInput.financialInputs.operatingCosts.marketingPct).toEqual([0.05, 0.05, 0.05, 0.05, 0.05]);
    });

    it("combines fixed monthly costs into facilitiesAnnual with escalation", () => {
      // rent(500000) + utilities(80000) + insurance(50000) = 630000 cents/month
      // × 12 = 7,560,000 cents/year base
      const base = 7560000;
      const fa = engineInput.financialInputs.operatingCosts.facilitiesAnnual;
      expect(fa[0]).toBe(base);
      expect(fa[1]).toBe(Math.round(base * 1.03));
      expect(fa[2]).toBe(Math.round(base * Math.pow(1.03, 2)));
      expect(fa[3]).toBe(Math.round(base * Math.pow(1.03, 3)));
      expect(fa[4]).toBe(Math.round(base * Math.pow(1.03, 4)));
    });

    it("converts otherMonthly to otherOpexPct based on estimated revenue", () => {
      // otherMonthly = 100,000 cents → annual = 1,200,000 cents
      // annualGrossSales = 32,240,400 cents
      // otherOpexPct = 1,200,000 / 32,240,400 ≈ 0.03722
      const expectedPct = (100000 * 12) / (2686700 * 12);
      expect(engineInput.financialInputs.operatingCosts.otherOpexPct[0]).toBeCloseTo(expectedPct, 4);
    });

    it("sets payrollTaxPct to system default", () => {
      expect(engineInput.financialInputs.operatingCosts.payrollTaxPct).toEqual([0.20, 0.20, 0.20, 0.20, 0.20]);
    });

    it("sets managementSalariesAnnual to zeros", () => {
      expect(engineInput.financialInputs.operatingCosts.managementSalariesAnnual).toEqual([0, 0, 0, 0, 0]);
    });
  });

  describe("financing mapping", () => {
    it("derives equityPct from loanAmount / totalInvestment", () => {
      const totalInvestment = startupCosts.reduce((s, c) => s + c.amount, 0);
      const loanAmount = 20000000; // $200,000 in cents
      const expectedEquity = 1 - (loanAmount / totalInvestment);
      expect(engineInput.financialInputs.financing.equityPct).toBeCloseTo(expectedEquity, 4);
    });

    it("uses totalInvestment from startup costs", () => {
      const totalInvestment = startupCosts.reduce((s, c) => s + c.amount, 0);
      expect(engineInput.financialInputs.financing.totalInvestment).toBe(totalInvestment);
    });

    it("preserves interest rate and term", () => {
      expect(engineInput.financialInputs.financing.interestRate).toBe(0.105);
      expect(engineInput.financialInputs.financing.termMonths).toBe(144);
    });
  });

  describe("startup/depreciation mapping", () => {
    it("converts depreciationYears to depreciationRate", () => {
      // 4 years → 0.25
      expect(engineInput.financialInputs.startup.depreciationRate).toBe(0.25);
    });

    it("handles depreciationYears = 0", () => {
      const modifiedInputs = buildPlanFinancialInputs({
        ...testBrandParams,
        startup_capital: {
          ...testBrandParams.startup_capital,
          depreciation_years: { value: 0, label: "Dep Years", description: "" },
        },
      });
      const modifiedEngine = unwrapForEngine(modifiedInputs, startupCosts);
      expect(modifiedEngine.financialInputs.startup.depreciationRate).toBe(0);
    });
  });

  describe("system defaults", () => {
    it("sets working capital assumptions", () => {
      expect(engineInput.financialInputs.workingCapitalAssumptions.arDays).toBe(30);
      expect(engineInput.financialInputs.workingCapitalAssumptions.apDays).toBe(60);
      expect(engineInput.financialInputs.workingCapitalAssumptions.inventoryDays).toBe(60);
    });

    it("sets distributions to zeros", () => {
      expect(engineInput.financialInputs.distributions).toEqual([0, 0, 0, 0, 0]);
    });

    it("sets taxRate to default", () => {
      expect(engineInput.financialInputs.taxRate).toBe(0.21);
    });
  });

  describe("passes startup costs through", () => {
    it("includes startup costs in engine input", () => {
      expect(engineInput.startupCosts).toEqual(startupCosts);
    });
  });
});

// ─── Engine Integration ──────────────────────────────────────────────────

describe("Engine Integration", () => {
  const planInputs = buildPlanFinancialInputs(testBrandParams);
  const startupCosts = buildPlanStartupCosts(testStartupTemplate);
  const engineInput = unwrapForEngine(planInputs, startupCosts);

  it("engine produces valid output from initialized plan", () => {
    const output = calculateProjections(engineInput);
    expect(output.monthlyProjections).toHaveLength(60);
    expect(output.annualSummaries).toHaveLength(5);
    expect(output.roiMetrics).toBeDefined();
  });

  it("all identity checks pass", () => {
    const output = calculateProjections(engineInput);
    output.identityChecks.forEach((check) => {
      expect(check.passed).toBe(true);
    });
  });

  it("produces positive revenue", () => {
    const output = calculateProjections(engineInput);
    expect(output.annualSummaries[0].revenue).toBeGreaterThan(0);
  });

  it("totalStartupInvestment matches startup cost sum", () => {
    const output = calculateProjections(engineInput);
    const expectedTotal = startupCosts.reduce((s, c) => s + c.amount, 0);
    expect(output.roiMetrics.totalStartupInvestment).toBe(expectedTotal);
  });

  it("produces deterministic results from initialized inputs", () => {
    const output1 = calculateProjections(engineInput);
    const output2 = calculateProjections(engineInput);
    expect(JSON.stringify(output1)).toBe(JSON.stringify(output2));
  });
});

// ─── PostNet Reference Validation (AC7) ─────────────────────────────────
// Full pipeline: PostNet brand params → buildPlanFinancialInputs → unwrapForEngine
// → calculateProjections → verify output matches reference values within tolerance.
// Reference values computed from the pipeline with PostNet-like test brand params.
// Tolerance: $1.00 (100 cents) per annual figure to allow floating-point rounding.

describe("PostNet Reference Validation (AC7)", () => {
  const planInputs = buildPlanFinancialInputs(testBrandParams);
  const startupCosts = buildPlanStartupCosts(testStartupTemplate);
  const engineInput = unwrapForEngine(planInputs, startupCosts);
  const output = calculateProjections(engineInput);
  const tolerance = 100; // $1.00 = 100 cents

  it("Y1-Y5 annual revenue matches PostNet pipeline reference", () => {
    const expectedRevenue = [16350488.57, 33717842.26, 38540156.30, 43859949.67, 49914047.33];
    for (let y = 0; y < 5; y++) {
      expect(Math.abs(output.annualSummaries[y].revenue - expectedRevenue[y])).toBeLessThan(tolerance);
    }
  });

  it("Y1 and Y5 EBITDA match PostNet pipeline reference", () => {
    expect(Math.abs(output.annualSummaries[0].ebitda - (-10458287.73))).toBeLessThan(tolerance);
    expect(Math.abs(output.annualSummaries[4].ebitda - 8401014.91)).toBeLessThan(tolerance);
  });

  it("5-year cumulative cash flow matches reference", () => {
    expect(Math.abs(output.roiMetrics.fiveYearCumulativeCashFlow - 4594160.63)).toBeLessThan(tolerance);
  });

  it("5-year ROI matches reference", () => {
    expect(output.roiMetrics.fiveYearROIPct).toBe(0.18);
  });

  it("total startup investment matches reference", () => {
    expect(output.roiMetrics.totalStartupInvestment).toBe(25650700);
  });

  it("all identity checks pass through the full pipeline", () => {
    output.identityChecks.forEach((check) => {
      expect(check.passed).toBe(true);
    });
  });
});

// ─── updateFieldValue ────────────────────────────────────────────────────

describe("updateFieldValue", () => {
  const original: FinancialFieldValue = {
    currentValue: 500000,
    source: "brand_default",
    brandDefault: 500000,
    item7Range: { min: 300000, max: 700000 },
    lastModifiedAt: null,
    isCustom: false,
  };

  it("updates currentValue", () => {
    const updated = updateFieldValue(original, 600000, "2026-02-10T00:00:00Z");
    expect(updated.currentValue).toBe(600000);
  });

  it("sets source to user_entry", () => {
    const updated = updateFieldValue(original, 600000, "2026-02-10T00:00:00Z");
    expect(updated.source).toBe("user_entry");
  });

  it("sets isCustom to true", () => {
    const updated = updateFieldValue(original, 600000, "2026-02-10T00:00:00Z");
    expect(updated.isCustom).toBe(true);
  });

  it("records timestamp", () => {
    const ts = "2026-02-10T15:30:00Z";
    const updated = updateFieldValue(original, 600000, ts);
    expect(updated.lastModifiedAt).toBe(ts);
  });

  it("preserves brandDefault", () => {
    const updated = updateFieldValue(original, 600000, "2026-02-10T00:00:00Z");
    expect(updated.brandDefault).toBe(500000);
  });

  it("preserves item7Range", () => {
    const updated = updateFieldValue(original, 600000, "2026-02-10T00:00:00Z");
    expect(updated.item7Range).toEqual({ min: 300000, max: 700000 });
  });

  it("does not mutate original", () => {
    updateFieldValue(original, 600000, "2026-02-10T00:00:00Z");
    expect(original.currentValue).toBe(500000);
    expect(original.source).toBe("brand_default");
  });
});

// ─── resetFieldToDefault ─────────────────────────────────────────────────

describe("resetFieldToDefault", () => {
  const edited: FinancialFieldValue = {
    currentValue: 600000,
    source: "user_entry",
    brandDefault: 500000,
    item7Range: { min: 300000, max: 700000 },
    lastModifiedAt: "2026-02-10T12:00:00Z",
    isCustom: true,
  };

  it("resets currentValue to brandDefault", () => {
    const reset = resetFieldToDefault(edited, "2026-02-10T13:00:00Z");
    expect(reset.currentValue).toBe(500000);
  });

  it("sets source back to brand_default", () => {
    const reset = resetFieldToDefault(edited, "2026-02-10T13:00:00Z");
    expect(reset.source).toBe("brand_default");
  });

  it("sets isCustom to false", () => {
    const reset = resetFieldToDefault(edited, "2026-02-10T13:00:00Z");
    expect(reset.isCustom).toBe(false);
  });

  it("updates lastModifiedAt", () => {
    const ts = "2026-02-10T13:00:00Z";
    const reset = resetFieldToDefault(edited, ts);
    expect(reset.lastModifiedAt).toBe(ts);
  });

  it("returns field unchanged if brandDefault is null", () => {
    const noBrandDefault: FinancialFieldValue = {
      ...edited,
      brandDefault: null,
    };
    const reset = resetFieldToDefault(noBrandDefault, "2026-02-10T13:00:00Z");
    expect(reset.currentValue).toBe(600000);
    expect(reset.source).toBe("user_entry");
  });

  it("does not mutate original", () => {
    resetFieldToDefault(edited, "2026-02-10T13:00:00Z");
    expect(edited.currentValue).toBe(600000);
    expect(edited.source).toBe("user_entry");
  });
});

// ─── Edge Cases ──────────────────────────────────────────────────────────

describe("Edge Cases", () => {
  it("handles zero loan amount", () => {
    const params: BrandParameters = {
      ...testBrandParams,
      financing: {
        ...testBrandParams.financing,
        loan_amount: { value: 0, label: "Loan", description: "" },
      },
    };
    const pi = buildPlanFinancialInputs(params);
    const sc = buildPlanStartupCosts(testStartupTemplate);
    const ei = unwrapForEngine(pi, sc);
    expect(ei.financialInputs.financing.equityPct).toBe(1); // 100% equity
    const output = calculateProjections(ei);
    expect(output.monthlyProjections).toHaveLength(60);
  });

  it("handles empty startup cost template", () => {
    const pi = buildPlanFinancialInputs(testBrandParams);
    const sc = buildPlanStartupCosts([]);
    const ei = unwrapForEngine(pi, sc);
    // With no startup costs, effectiveInvestment falls back to loanAmount
    expect(ei.financialInputs.financing.totalInvestment).toBe(20000000);
    // equityPct = 1 - (loanAmount/loanAmount) = 0 (100% debt-financed, consistent math)
    expect(ei.financialInputs.financing.equityPct).toBe(0);
    const output = calculateProjections(ei);
    expect(output.monthlyProjections).toHaveLength(60);
  });

  it("handles zero monthly AUV", () => {
    const params: BrandParameters = {
      ...testBrandParams,
      revenue: {
        ...testBrandParams.revenue,
        monthly_auv: { value: 0, label: "AUV", description: "" },
      },
    };
    const pi = buildPlanFinancialInputs(params);
    const sc = buildPlanStartupCosts(testStartupTemplate);
    const ei = unwrapForEngine(pi, sc);
    expect(ei.financialInputs.revenue.annualGrossSales).toBe(0);
    // otherOpexPct should default to 0 when otherMonthly > 0 but revenue is 0
    // In this case, otherMonthly = 100000 cents, annualGrossSales = 0
    // so otherOpexPct uses DEFAULT_OTHER_OPEX_PCT
    const output = calculateProjections(ei);
    expect(output.monthlyProjections).toHaveLength(60);
  });

  it("handles zero depreciation years", () => {
    const params: BrandParameters = {
      ...testBrandParams,
      startup_capital: {
        ...testBrandParams.startup_capital,
        depreciation_years: { value: 0, label: "Dep", description: "" },
      },
    };
    const pi = buildPlanFinancialInputs(params);
    const sc = buildPlanStartupCosts(testStartupTemplate);
    const ei = unwrapForEngine(pi, sc);
    expect(ei.financialInputs.startup.depreciationRate).toBe(0);
    const output = calculateProjections(ei);
    expect(output.monthlyProjections).toHaveLength(60);
  });

  it("handles zero otherMonthly", () => {
    const params: BrandParameters = {
      ...testBrandParams,
      operating_costs: {
        ...testBrandParams.operating_costs,
        other_monthly: { value: 0, label: "Other", description: "" },
      },
    };
    const pi = buildPlanFinancialInputs(params);
    const sc = buildPlanStartupCosts(testStartupTemplate);
    const ei = unwrapForEngine(pi, sc);
    // otherMonthly = 0 → otherOpexPct = 0
    expect(ei.financialInputs.operatingCosts.otherOpexPct[0]).toBe(0);
  });
});

// ─── Round-trip: edit then reset ─────────────────────────────────────────

describe("Round-trip: edit then reset", () => {
  it("field returns to original value after edit + reset", () => {
    const planInputs = buildPlanFinancialInputs(testBrandParams);
    const original = planInputs.revenue.monthlyAuv;

    const edited = updateFieldValue(original, 3000000, "2026-02-10T10:00:00Z");
    expect(edited.currentValue).toBe(3000000);
    expect(edited.source).toBe("user_entry");

    const reset = resetFieldToDefault(edited, "2026-02-10T11:00:00Z");
    expect(reset.currentValue).toBe(original.currentValue);
    expect(reset.source).toBe("brand_default");
    expect(reset.isCustom).toBe(false);
  });

  it("engine produces consistent results after edit + unwrap", () => {
    const planInputs = buildPlanFinancialInputs(testBrandParams);
    const startupCosts = buildPlanStartupCosts(testStartupTemplate);

    // Original output
    const originalEngine = unwrapForEngine(planInputs, startupCosts);
    const originalOutput = calculateProjections(originalEngine);

    // Edit a field
    const edited = {
      ...planInputs,
      revenue: {
        ...planInputs.revenue,
        monthlyAuv: updateFieldValue(planInputs.revenue.monthlyAuv, 3000000, "2026-02-10T10:00:00Z"),
      },
    };
    const editedEngine = unwrapForEngine(edited, startupCosts);
    const editedOutput = calculateProjections(editedEngine);

    // Revenue should differ
    expect(editedOutput.annualSummaries[0].revenue).not.toBe(originalOutput.annualSummaries[0].revenue);

    // Reset the field
    const resetField = resetFieldToDefault(edited.revenue.monthlyAuv, "2026-02-10T11:00:00Z");
    const resetInputs = {
      ...edited,
      revenue: {
        ...edited.revenue,
        monthlyAuv: resetField,
      },
    };
    const resetEngine = unwrapForEngine(resetInputs, startupCosts);
    const resetOutput = calculateProjections(resetEngine);

    // Revenue should match original after reset
    expect(resetOutput.annualSummaries[0].revenue).toBe(originalOutput.annualSummaries[0].revenue);
  });
});

// ─── buildPlanStartupCosts Enhanced Fields ──────────────────────────────

describe("buildPlanStartupCosts enhanced fields", () => {
  const result = buildPlanStartupCosts(testStartupTemplate);

  it("generates UUID ids", () => {
    result.forEach((item) => {
      expect(item.id).toBeDefined();
      expect(item.id.length).toBeGreaterThan(0);
    });
  });

  it("all items have isCustom: false", () => {
    result.forEach((item) => expect(item.isCustom).toBe(false));
  });

  it("all items have source: brand_default", () => {
    result.forEach((item) => expect(item.source).toBe("brand_default"));
  });

  it("brandDefaultAmount matches amount", () => {
    result.forEach((item) => expect(item.brandDefaultAmount).toBe(item.amount));
  });

  it("converts item7 ranges from dollars to cents", () => {
    expect(result[0].item7RangeLow).toBe(10000000); // $100,000
    expect(result[0].item7RangeHigh).toBe(15000000); // $150,000
  });

  it("preserves sortOrder from template", () => {
    expect(result[0].sortOrder).toBe(1);
    expect(result[4].sortOrder).toBe(5);
  });

  it("handles null item7 ranges", () => {
    const templateWithNulls: StartupCostTemplate = [
      { id: "x", name: "Test", default_amount: 100, capex_classification: "capex", item7_range_low: null, item7_range_high: null, sort_order: 0 },
    ];
    const result = buildPlanStartupCosts(templateWithNulls);
    expect(result[0].item7RangeLow).toBeNull();
    expect(result[0].item7RangeHigh).toBeNull();
  });
});

// ─── addCustomStartupCost ───────────────────────────────────────────────

describe("addCustomStartupCost", () => {
  const base = buildPlanStartupCosts(testStartupTemplate);

  it("appends a new item", () => {
    const result = addCustomStartupCost(base, "Insurance Deposit", 500000, "non_capex");
    expect(result).toHaveLength(base.length + 1);
  });

  it("new item has isCustom: true", () => {
    const result = addCustomStartupCost(base, "Insurance Deposit", 500000, "non_capex");
    const added = result[result.length - 1];
    expect(added.isCustom).toBe(true);
  });

  it("new item has source: user_entry", () => {
    const result = addCustomStartupCost(base, "Insurance Deposit", 500000, "non_capex");
    const added = result[result.length - 1];
    expect(added.source).toBe("user_entry");
  });

  it("new item has null brand default and item7 fields", () => {
    const result = addCustomStartupCost(base, "Insurance Deposit", 500000, "non_capex");
    const added = result[result.length - 1];
    expect(added.brandDefaultAmount).toBeNull();
    expect(added.item7RangeLow).toBeNull();
    expect(added.item7RangeHigh).toBeNull();
  });

  it("sortOrder is one more than max existing", () => {
    const result = addCustomStartupCost(base, "Test", 100, "capex");
    const added = result[result.length - 1];
    const maxExisting = Math.max(...base.map((c) => c.sortOrder));
    expect(added.sortOrder).toBe(maxExisting + 1);
  });

  it("does not mutate original array", () => {
    const originalLength = base.length;
    addCustomStartupCost(base, "Test", 100, "capex");
    expect(base).toHaveLength(originalLength);
  });
});

// ─── removeStartupCost ──────────────────────────────────────────────────

describe("removeStartupCost", () => {
  it("removes a custom item by id", () => {
    const base = buildPlanStartupCosts(testStartupTemplate);
    const withCustom = addCustomStartupCost(base, "Custom", 100, "capex");
    const customId = withCustom[withCustom.length - 1].id;
    const result = removeStartupCost(withCustom, customId);
    expect(result).toHaveLength(withCustom.length - 1);
    expect(result.find((c) => c.id === customId)).toBeUndefined();
  });

  it("does NOT remove a template item", () => {
    const base = buildPlanStartupCosts(testStartupTemplate);
    const templateId = base[0].id;
    const result = removeStartupCost(base, templateId);
    expect(result).toHaveLength(base.length);
    expect(result).toBe(base); // Same reference
  });

  it("re-normalizes sort order after removal", () => {
    const base = buildPlanStartupCosts(testStartupTemplate);
    const withC1 = addCustomStartupCost(base, "Custom 1", 100, "capex");
    const withC2 = addCustomStartupCost(withC1, "Custom 2", 200, "capex");
    const c1Id = withC1[withC1.length - 1].id;
    const result = removeStartupCost(withC2, c1Id);
    const orders = result.map((c) => c.sortOrder);
    for (let i = 0; i < orders.length; i++) {
      expect(orders[i]).toBe(i);
    }
  });
});

// ─── updateStartupCostAmount ────────────────────────────────────────────

describe("updateStartupCostAmount", () => {
  const base = buildPlanStartupCosts(testStartupTemplate);

  it("updates the amount for the specified item", () => {
    const result = updateStartupCostAmount(base, base[0].id, 999999);
    expect(result[0].amount).toBe(999999);
  });

  it("sets source to user_entry", () => {
    const result = updateStartupCostAmount(base, base[0].id, 999999);
    expect(result[0].source).toBe("user_entry");
  });

  it("does not change other items", () => {
    const result = updateStartupCostAmount(base, base[0].id, 999999);
    expect(result[1].amount).toBe(base[1].amount);
    expect(result[1].source).toBe("brand_default");
  });

  it("does not mutate original", () => {
    updateStartupCostAmount(base, base[0].id, 999999);
    expect(base[0].source).toBe("brand_default");
  });
});

// ─── resetStartupCostToDefault ──────────────────────────────────────────

describe("resetStartupCostToDefault", () => {
  it("resets a template item to brand default", () => {
    const base = buildPlanStartupCosts(testStartupTemplate);
    const edited = updateStartupCostAmount(base, base[0].id, 999999);
    const result = resetStartupCostToDefault(edited, base[0].id);
    expect(result[0].amount).toBe(result[0].brandDefaultAmount);
    expect(result[0].source).toBe("brand_default");
  });

  it("does not reset a custom item", () => {
    const base = buildPlanStartupCosts(testStartupTemplate);
    const withCustom = addCustomStartupCost(base, "Custom", 50000, "capex");
    const customItem = withCustom[withCustom.length - 1];
    const result = resetStartupCostToDefault(withCustom, customItem.id);
    expect(result[result.length - 1].amount).toBe(50000);
  });
});

// ─── reorderStartupCosts ────────────────────────────────────────────────

describe("reorderStartupCosts", () => {
  it("reorders items based on provided IDs", () => {
    const base = buildPlanStartupCosts(testStartupTemplate);
    const reversed = [...base].reverse().map((c) => c.id);
    const result = reorderStartupCosts(base, reversed);
    expect(result[0].name).toBe(base[base.length - 1].name);
    expect(result[result.length - 1].name).toBe(base[0].name);
  });

  it("normalizes sortOrder to be contiguous", () => {
    const base = buildPlanStartupCosts(testStartupTemplate);
    const reversed = [...base].reverse().map((c) => c.id);
    const result = reorderStartupCosts(base, reversed);
    result.forEach((item, i) => {
      expect(item.sortOrder).toBe(i);
    });
  });
});

// ─── getStartupCostTotals ───────────────────────────────────────────────

describe("getStartupCostTotals", () => {
  const base = buildPlanStartupCosts(testStartupTemplate);

  it("computes capex total", () => {
    const totals = getStartupCostTotals(base);
    const expectedCapex = base
      .filter((c) => c.capexClassification === "capex")
      .reduce((s, c) => s + c.amount, 0);
    expect(totals.capexTotal).toBe(expectedCapex);
  });

  it("computes non_capex total", () => {
    const totals = getStartupCostTotals(base);
    const expected = base
      .filter((c) => c.capexClassification === "non_capex")
      .reduce((s, c) => s + c.amount, 0);
    expect(totals.nonCapexTotal).toBe(expected);
  });

  it("computes working_capital total", () => {
    const totals = getStartupCostTotals(base);
    const expected = base
      .filter((c) => c.capexClassification === "working_capital")
      .reduce((s, c) => s + c.amount, 0);
    expect(totals.workingCapitalTotal).toBe(expected);
  });

  it("grand total = sum of all categories", () => {
    const totals = getStartupCostTotals(base);
    expect(totals.grandTotal).toBe(totals.capexTotal + totals.nonCapexTotal + totals.workingCapitalTotal);
  });

  it("handles empty array", () => {
    const totals = getStartupCostTotals([]);
    expect(totals.grandTotal).toBe(0);
  });
});

// ─── migrateStartupCosts ────────────────────────────────────────────────

describe("migrateStartupCosts", () => {
  it("populates missing fields with sensible defaults and passes Zod validation", () => {
    const oldFormat = [
      { name: "Equipment", amount: 1000000, capexClassification: "capex" as const },
      { name: "Deposits", amount: 500000, capexClassification: "non_capex" as const },
    ];
    const result = migrateStartupCosts(oldFormat);
    expect(result).toHaveLength(2);
    result.forEach((item, i) => {
      expect(item.id).toBeDefined();
      expect(item.isCustom).toBe(false);
      expect(item.source).toBe("brand_default");
      expect(item.brandDefaultAmount).toBe(item.amount);
      expect(item.item7RangeLow).toBeNull();
      expect(item.item7RangeHigh).toBeNull();
      expect(item.sortOrder).toBe(i);
    });
    // Story gotcha: migrated result must pass Zod validation
    expect(planStartupCostsSchema.safeParse(result).success).toBe(true);
  });

  it("preserves existing enhanced fields", () => {
    const enhanced = [
      {
        id: "existing-id",
        name: "Equipment",
        amount: 1000000,
        capexClassification: "capex" as const,
        isCustom: true,
        source: "user_entry" as const,
        brandDefaultAmount: null,
        item7RangeLow: null,
        item7RangeHigh: null,
        sortOrder: 5,
      },
    ];
    const result = migrateStartupCosts(enhanced);
    expect(result[0].id).toBe("existing-id");
    expect(result[0].isCustom).toBe(true);
    expect(result[0].source).toBe("user_entry");
    expect(result[0].brandDefaultAmount).toBeNull();
    expect(result[0].sortOrder).toBe(5);
  });
});

// ─── Custom item + engine integration ───────────────────────────────────

describe("Custom item + engine integration", () => {
  it("engine correctly processes startup costs with a custom CapEx item", () => {
    const planInputs = buildPlanFinancialInputs(testBrandParams);
    const baseCosts = buildPlanStartupCosts(testStartupTemplate);
    const withCustom = addCustomStartupCost(baseCosts, "Custom Equipment", 1000000, "capex");

    const engineInput = unwrapForEngine(planInputs, withCustom);
    const output = calculateProjections(engineInput);

    // Total investment includes the custom item
    const expectedTotal = withCustom.reduce((s, c) => s + c.amount, 0);
    expect(output.roiMetrics.totalStartupInvestment).toBe(expectedTotal);
    expect(output.monthlyProjections).toHaveLength(60);
  });
});

// ─── Helpers ─────────────────────────────────────────────────────────────

/** Extract all FinancialFieldValue objects from a PlanFinancialInputs for validation */
function getAllFields(inputs: PlanFinancialInputs): FinancialFieldValue[] {
  const fields: FinancialFieldValue[] = [];
  for (const category of Object.values(inputs)) {
    for (const field of Object.values(category)) {
      fields.push(field as FinancialFieldValue);
    }
  }
  return fields;
}
