import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { computePlanOutputs } from "./financial-service";
import type { IStorage } from "../storage";
import type { Plan, BrandParameters, StartupCostTemplate } from "@shared/schema";
import type { StartupCostLineItem } from "@shared/financial-engine";
import { buildPlanFinancialInputs, buildPlanStartupCosts } from "@shared/plan-initialization";

// ─── Test Brand Parameters (PostNet-like) ─────────────────────────────

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
  { id: "equip-1", name: "Equipment & Signage", default_amount: 126057, capex_classification: "capex", item7_range_low: 100000, item7_range_high: 150000, sort_order: 1 },
  { id: "improve-1", name: "Leasehold Improvements", default_amount: 875, capex_classification: "capex", item7_range_low: 500, item7_range_high: 2000, sort_order: 2 },
  { id: "tech-1", name: "Technology", default_amount: 5200, capex_classification: "capex", item7_range_low: 3000, item7_range_high: 8000, sort_order: 3 },
  { id: "noncapex-1", name: "Non-CapEx Investments", default_amount: 84375, capex_classification: "non_capex", item7_range_low: 50000, item7_range_high: 120000, sort_order: 4 },
  { id: "wc-1", name: "Working Capital", default_amount: 40000, capex_classification: "working_capital", item7_range_low: 20000, item7_range_high: 60000, sort_order: 5 },
];

// ─── Test Helpers ───────────────────────────────────────────────────────

function makeTestPlan(overrides: Partial<Plan> = {}): Plan {
  const planInputs = buildPlanFinancialInputs(testBrandParams);
  return {
    id: "test-plan-1",
    userId: "user-1",
    brandId: "brand-1",
    name: "Test PostNet Plan",
    financialInputs: planInputs as any,
    startupCosts: null,
    status: "in_progress",
    pipelineStage: "planning",
    targetMarket: null,
    targetOpenQuarter: null,
    lastAutoSave: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Plan;
}

function makeTestStartupCosts(): StartupCostLineItem[] {
  return buildPlanStartupCosts(testStartupTemplate);
}

function makeMockStorage(startupCosts: StartupCostLineItem[] = makeTestStartupCosts()): IStorage {
  return {
    getStartupCosts: vi.fn().mockResolvedValue(startupCosts),
  } as unknown as IStorage;
}

// ─── Test Suite ─────────────────────────────────────────────────────────

describe("Financial Service — computePlanOutputs", () => {
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    stderrSpy.mockRestore();
  });

  it("returns complete EngineOutput for a valid plan", async () => {
    const plan = makeTestPlan();
    const mockStorage = makeMockStorage();

    const output = await computePlanOutputs(plan, mockStorage);

    expect(output).toBeDefined();
    expect(output.monthlyProjections).toHaveLength(60);
    expect(output.annualSummaries).toHaveLength(5);
    expect(output.roiMetrics).toBeDefined();
    expect(output.roiMetrics.totalStartupInvestment).toBeGreaterThan(0);
    expect(output.identityChecks).toBeDefined();
    expect(output.identityChecks.length).toBeGreaterThan(0);
  });

  it("throws if plan.financialInputs is null", async () => {
    const plan = makeTestPlan({ financialInputs: null });
    const mockStorage = makeMockStorage();

    await expect(computePlanOutputs(plan, mockStorage)).rejects.toThrow(
      "Plan has no financial inputs configured"
    );
  });

  it("loads startup costs via storage.getStartupCosts (not plan.startupCosts)", async () => {
    const plan = makeTestPlan();
    const mockStorage = makeMockStorage();

    await computePlanOutputs(plan, mockStorage);

    expect(mockStorage.getStartupCosts).toHaveBeenCalledWith("test-plan-1");
  });

  it("handles empty startup costs (zero investment)", async () => {
    const plan = makeTestPlan();
    const mockStorage = makeMockStorage([]);

    const output = await computePlanOutputs(plan, mockStorage);

    expect(output.roiMetrics.totalStartupInvestment).toBe(0);
    expect(output.roiMetrics.fiveYearROIPct).toBe(0);
  });

  it("produces deterministic outputs (identical inputs → identical outputs)", async () => {
    const plan = makeTestPlan();
    const mockStorage1 = makeMockStorage();
    const mockStorage2 = makeMockStorage();

    const output1 = await computePlanOutputs(plan, mockStorage1);
    const output2 = await computePlanOutputs(plan, mockStorage2);

    expect(output1.roiMetrics).toEqual(output2.roiMetrics);
    expect(output1.annualSummaries).toEqual(output2.annualSummaries);
    expect(output1.monthlyProjections).toEqual(output2.monthlyProjections);
  });

  it("all identity checks pass for valid PostNet reference data", async () => {
    const plan = makeTestPlan();
    const mockStorage = makeMockStorage();

    const output = await computePlanOutputs(plan, mockStorage);

    for (const check of output.identityChecks) {
      expect(check.passed).toBe(true);
    }
    // No warnings logged when all checks pass
    expect(stderrSpy).not.toHaveBeenCalled();
  });

  it("returns Year 1 revenue in annual summaries", async () => {
    const plan = makeTestPlan();
    const mockStorage = makeMockStorage();

    const output = await computePlanOutputs(plan, mockStorage);

    expect(output.annualSummaries[0].revenue).toBeGreaterThan(0);
    expect(output.annualSummaries[0].year).toBe(1);
  });

  it("returns ROI metrics with breakEvenMonth (number or null)", async () => {
    const plan = makeTestPlan();
    const mockStorage = makeMockStorage();

    const output = await computePlanOutputs(plan, mockStorage);

    // breakEvenMonth is null if cumulative cash flow never turns positive within 60 months
    // (valid for some brand parameter combinations), or a positive integer 1-60
    if (output.roiMetrics.breakEvenMonth !== null) {
      expect(output.roiMetrics.breakEvenMonth).toBeGreaterThan(0);
      expect(output.roiMetrics.breakEvenMonth).toBeLessThanOrEqual(60);
    }
  });

  it("returns five-year cumulative cash flow and ROI percentage", async () => {
    const plan = makeTestPlan();
    const mockStorage = makeMockStorage();

    const output = await computePlanOutputs(plan, mockStorage);

    expect(typeof output.roiMetrics.fiveYearCumulativeCashFlow).toBe("number");
    expect(typeof output.roiMetrics.fiveYearROIPct).toBe("number");
  });
});
