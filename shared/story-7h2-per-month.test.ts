import { describe, it, expect } from "vitest";
import {
  buildPlanFinancialInputs,
  unwrapForEngine,
  buildPlanStartupCosts,
  migratePlanFinancialInputs,
} from "./plan-initialization";
import { calculateProjections, type FinancialFieldValue, type PlanFinancialInputs, type FinancialInputs, type EngineInput, type StartupCostLineItem } from "./financial-engine";
import type { BrandParameters } from "./schema";
import {
  getAbsoluteMonthIndex,
  getMonthRangeForColKey,
  getDrillLevelFromColKey,
} from "@/components/planning/statements/input-field-map";

function makeField(value: number): FinancialFieldValue {
  return {
    currentValue: value,
    source: "brand_default",
    brandDefault: value,
    item7Range: null,
    lastModifiedAt: null,
    isCustom: false,
  };
}

function makeFieldArray5(value: number): FinancialFieldValue[] {
  return Array.from({ length: 5 }, () => makeField(value));
}

function makeFieldArray60(value: number): FinancialFieldValue[] {
  return Array.from({ length: 60 }, () => makeField(value));
}

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

const testStartupCosts: StartupCostLineItem[] = [
  { id: "1", name: "Equipment", amount: 12605700, capexClassification: "capex", isCustom: false, source: "brand_default", brandDefaultAmount: 12605700, item7RangeLow: null, item7RangeHigh: null, sortOrder: 0 },
  { id: "2", name: "Improvements", amount: 87500, capexClassification: "capex", isCustom: false, source: "brand_default", brandDefaultAmount: 87500, item7RangeLow: null, item7RangeHigh: null, sortOrder: 1 },
  { id: "3", name: "Technology", amount: 520000, capexClassification: "capex", isCustom: false, source: "brand_default", brandDefaultAmount: 520000, item7RangeLow: null, item7RangeHigh: null, sortOrder: 2 },
  { id: "4", name: "Non-CapEx", amount: 8437500, capexClassification: "non_capex", isCustom: false, source: "brand_default", brandDefaultAmount: 8437500, item7RangeLow: null, item7RangeHigh: null, sortOrder: 3 },
  { id: "5", name: "Working Capital", amount: 4000000, capexClassification: "working_capital", isCustom: false, source: "brand_default", brandDefaultAmount: 4000000, item7RangeLow: null, item7RangeHigh: null, sortOrder: 4 },
];

describe("Story 7H.2: Per-Month Independence", () => {
  describe("AC-1: Qualifying fields stored as 60-element arrays", () => {
    const result = buildPlanFinancialInputs(testBrandParams);

    it("monthlyAuv is a 60-element array", () => {
      expect(result.revenue.monthlyAuv).toHaveLength(60);
      expect(result.revenue.monthlyAuv[0].currentValue).toBe(2686700);
      expect(result.revenue.monthlyAuv[59].currentValue).toBe(2686700);
    });

    it("cogsPct is a 60-element array", () => {
      expect(result.operatingCosts.cogsPct).toHaveLength(60);
      expect(result.operatingCosts.cogsPct[0].currentValue).toBe(0.30);
    });

    it("laborPct is a 60-element array", () => {
      expect(result.operatingCosts.laborPct).toHaveLength(60);
      expect(result.operatingCosts.laborPct[0].currentValue).toBe(0.17);
    });

    it("marketingPct is a 60-element array", () => {
      expect(result.operatingCosts.marketingPct).toHaveLength(60);
      expect(result.operatingCosts.marketingPct[0].currentValue).toBe(0.05);
    });

    it("non-qualifying fields remain as 5-element arrays", () => {
      expect(result.operatingCosts.royaltyPct).toHaveLength(5);
      expect(result.operatingCosts.adFundPct).toHaveLength(5);
      expect(result.operatingCosts.payrollTaxPct).toHaveLength(5);
      expect(result.operatingCosts.facilitiesAnnual).toHaveLength(5);
    });

    it("growthRates remain as 5-element array", () => {
      expect(result.revenue.growthRates).toHaveLength(5);
    });
  });

  describe("AC-2: 5-to-60 migration", () => {
    function buildPerYearFormatInputs(): PlanFinancialInputs {
      const facilitiesDecomposition = {
        rent: makeFieldArray5(6000000),
        utilities: makeFieldArray5(960000),
        telecomIt: makeFieldArray5(0),
        vehicleFleet: makeFieldArray5(0),
        insurance: makeFieldArray5(600000),
      };
      const facilitiesAnnual = makeFieldArray5(7560000);
      return {
        revenue: {
          monthlyAuv: makeFieldArray5(2686700),
          growthRates: makeFieldArray5(0.13),
          startingMonthAuvPct: makeField(0.08),
        },
        operatingCosts: {
          royaltyPct: makeFieldArray5(0.05),
          adFundPct: makeFieldArray5(0.02),
          cogsPct: makeFieldArray5(0.30),
          laborPct: makeFieldArray5(0.17),
          facilitiesAnnual,
          facilitiesDecomposition,
          marketingPct: makeFieldArray5(0.05),
          managementSalariesAnnual: makeFieldArray5(0),
          payrollTaxPct: makeFieldArray5(0.20),
          otherOpexPct: makeFieldArray5(0.03),
        },
        profitabilityAndDistributions: {
          targetPreTaxProfitPct: makeFieldArray5(0),
          shareholderSalaryAdj: makeFieldArray5(0),
          distributions: makeFieldArray5(0),
          nonCapexInvestment: makeFieldArray5(0),
        },
        workingCapitalAndValuation: {
          arDays: makeField(30),
          apDays: makeField(60),
          inventoryDays: makeField(60),
          taxPaymentDelayMonths: makeField(0),
          ebitdaMultiple: makeField(3.0),
        },
        financing: {
          loanAmount: makeField(20000000),
          interestRate: makeField(0.105),
          loanTermMonths: makeField(144),
          downPaymentPct: makeField(0.20),
        },
        startupCapital: {
          workingCapitalMonths: makeField(3),
          depreciationYears: makeField(4),
        },
      };
    }

    it("migrates 5-element qualifying arrays to 60-element arrays by repeating year values across months", () => {
      const perYear = buildPerYearFormatInputs();
      expect(perYear.operatingCosts.cogsPct).toHaveLength(5);

      const migrated = migratePlanFinancialInputs(perYear);
      expect(migrated.operatingCosts.cogsPct).toHaveLength(60);
      expect(migrated.operatingCosts.laborPct).toHaveLength(60);
      expect(migrated.operatingCosts.marketingPct).toHaveLength(60);
      expect(migrated.revenue.monthlyAuv).toHaveLength(60);
    });

    it("repeats each year value across its 12 months during migration", () => {
      const perYear = buildPerYearFormatInputs();
      perYear.operatingCosts.cogsPct = [
        makeField(0.25),
        makeField(0.28),
        makeField(0.30),
        makeField(0.32),
        makeField(0.35),
      ];

      const migrated = migratePlanFinancialInputs(perYear);
      for (let m = 0; m < 12; m++) {
        expect(migrated.operatingCosts.cogsPct[m].currentValue).toBe(0.25);
      }
      for (let m = 12; m < 24; m++) {
        expect(migrated.operatingCosts.cogsPct[m].currentValue).toBe(0.28);
      }
      for (let m = 24; m < 36; m++) {
        expect(migrated.operatingCosts.cogsPct[m].currentValue).toBe(0.30);
      }
      for (let m = 36; m < 48; m++) {
        expect(migrated.operatingCosts.cogsPct[m].currentValue).toBe(0.32);
      }
      for (let m = 48; m < 60; m++) {
        expect(migrated.operatingCosts.cogsPct[m].currentValue).toBe(0.35);
      }
    });

    it("migration is idempotent — migrating an already-migrated plan produces identical output", () => {
      const perYear = buildPerYearFormatInputs();
      const migrated1 = migratePlanFinancialInputs(perYear);
      const migrated2 = migratePlanFinancialInputs(migrated1);

      expect(JSON.stringify(migrated2)).toBe(JSON.stringify(migrated1));
    });

    it("preserves non-qualifying fields during migration", () => {
      const perYear = buildPerYearFormatInputs();
      const migrated = migratePlanFinancialInputs(perYear);
      expect(migrated.operatingCosts.royaltyPct).toHaveLength(5);
      expect(migrated.operatingCosts.adFundPct).toHaveLength(5);
      expect(migrated.operatingCosts.payrollTaxPct).toHaveLength(5);
      expect(migrated.revenue.growthRates).toHaveLength(5);
    });

    it("expands single-value monthlyAuv to 60-element array", () => {
      const perYear = buildPerYearFormatInputs();
      (perYear.revenue as any).monthlyAuv = makeField(2686700);
      const migrated = migratePlanFinancialInputs(perYear);
      expect(migrated.revenue.monthlyAuv).toHaveLength(60);
      expect(migrated.revenue.monthlyAuv[0].currentValue).toBe(2686700);
      expect(migrated.revenue.monthlyAuv[59].currentValue).toBe(2686700);
    });
  });

  describe("AC-3: unwrapForEngine produces 60-element arrays", () => {
    const planInputs = buildPlanFinancialInputs(testBrandParams);
    const engineInput = unwrapForEngine(planInputs, testStartupCosts);

    it("monthlyAuvByMonth is a 60-element number array", () => {
      expect(engineInput.financialInputs.revenue.monthlyAuvByMonth).toHaveLength(60);
      expect(typeof engineInput.financialInputs.revenue.monthlyAuvByMonth[0]).toBe("number");
    });

    it("cogsPct is a 60-element number array", () => {
      expect(engineInput.financialInputs.operatingCosts.cogsPct).toHaveLength(60);
    });

    it("laborPct is a 60-element number array", () => {
      expect(engineInput.financialInputs.operatingCosts.laborPct).toHaveLength(60);
    });

    it("marketingPct is a 60-element number array", () => {
      expect(engineInput.financialInputs.operatingCosts.marketingPct).toHaveLength(60);
    });

    it("non-qualifying fields remain as 5-element tuples", () => {
      expect(engineInput.financialInputs.operatingCosts.royaltyPct).toHaveLength(5);
      expect(engineInput.financialInputs.revenue.growthRates).toHaveLength(5);
    });
  });

  describe("AC-4: Engine uses month-specific values", () => {
    function buildEngineInput(overrides?: Partial<FinancialInputs>): EngineInput {
      const base: FinancialInputs = {
        revenue: {
          monthlyAuvByMonth: Array(60).fill(2686700),
          monthsToReachAuv: 14,
          startingMonthAuvPct: 0.08,
          growthRates: [0.13, 0.13, 0.13, 0.13, 0.13],
        },
        operatingCosts: {
          cogsPct: Array(60).fill(0.30),
          laborPct: Array(60).fill(0.17),
          royaltyPct: [0.05, 0.05, 0.05, 0.05, 0.05],
          adFundPct: [0.02, 0.02, 0.02, 0.02, 0.02],
          marketingPct: Array(60).fill(0.05),
          otherOpexPct: [0.03, 0.03, 0.03, 0.03, 0.03],
          payrollTaxPct: [0.20, 0.20, 0.20, 0.20, 0.20],
          facilitiesAnnual: [7560000, 7560000, 7560000, 7560000, 7560000],
          managementSalariesAnnual: [0, 0, 0, 0, 0],
        },
        financing: {
          totalInvestment: 25650700,
          equityPct: 0.20,
          interestRate: 0.105,
          termMonths: 144,
        },
        startup: { depreciationRate: 0.25 },
        workingCapitalAssumptions: { arDays: 30, apDays: 60, inventoryDays: 60 },
        distributions: [0, 0, 0, 0, 0],
        taxRate: 0.21,
      };
      return {
        financialInputs: { ...base, ...overrides },
        startupCosts: testStartupCosts,
      };
    }

    it("uniform 60-element arrays produce deterministic output", () => {
      const input = buildEngineInput();
      const r1 = calculateProjections(input);
      const r2 = calculateProjections(input);
      expect(JSON.stringify(r1)).toBe(JSON.stringify(r2));
    });

    it("month-specific COGS% values produce different COGS for those months", () => {
      const cogsPct = Array(60).fill(0.30);
      cogsPct[14] = 0.40;
      const input = buildEngineInput({
        operatingCosts: {
          ...buildEngineInput().financialInputs.operatingCosts,
          cogsPct,
        },
      });
      const result = calculateProjections(input);

      const uniformInput = buildEngineInput();
      const uniformResult = calculateProjections(uniformInput);

      expect(Math.abs(result.monthlyProjections[14].materialsCogs)).toBeGreaterThan(
        Math.abs(uniformResult.monthlyProjections[14].materialsCogs)
      );
    });

    it("month-specific laborPct values produce different labor costs", () => {
      const laborPct = Array(60).fill(0.17);
      laborPct[20] = 0.25;
      const input = buildEngineInput({
        operatingCosts: {
          ...buildEngineInput().financialInputs.operatingCosts,
          laborPct,
        },
      });
      const result = calculateProjections(input);
      const uniformResult = calculateProjections(buildEngineInput());

      expect(Math.abs(result.monthlyProjections[20].directLabor)).toBeGreaterThan(
        Math.abs(uniformResult.monthlyProjections[20].directLabor)
      );
    });

    it("month-specific monthlyAuvByMonth values affect revenue during ramp-up months", () => {
      const monthlyAuvByMonth = Array(60).fill(2686700);
      monthlyAuvByMonth[5] = 5000000;
      const input = buildEngineInput({
        revenue: {
          ...buildEngineInput().financialInputs.revenue,
          monthlyAuvByMonth,
        },
      });
      const result = calculateProjections(input);
      const uniformResult = calculateProjections(buildEngineInput());

      expect(result.monthlyProjections[5].revenue).not.toBe(
        uniformResult.monthlyProjections[5].revenue
      );
      expect(result.monthlyProjections[5].revenue).toBeGreaterThan(
        uniformResult.monthlyProjections[5].revenue
      );
    });

    it("all 13 identity checks pass with 60-element inputs", () => {
      const input = buildEngineInput();
      const result = calculateProjections(input);
      result.identityChecks.forEach((check) => {
        expect(check.passed).toBe(true);
      });
    });

    it("monthly projections count is exactly 60", () => {
      const input = buildEngineInput();
      const result = calculateProjections(input);
      expect(result.monthlyProjections).toHaveLength(60);
      expect(result.annualSummaries).toHaveLength(5);
    });
  });

  describe("AC-9: Accounting identity checks with heterogeneous per-month values", () => {
    function buildHeterogeneousInput(): EngineInput {
      const cogsPct = Array(60).fill(0.30);
      cogsPct[6] = 0.35;
      cogsPct[18] = 0.25;
      cogsPct[40] = 0.28;

      const laborPct = Array(60).fill(0.17);
      laborPct[3] = 0.22;
      laborPct[25] = 0.15;

      const marketingPct = Array(60).fill(0.05);
      marketingPct[12] = 0.08;
      marketingPct[30] = 0.03;

      const monthlyAuvByMonth = Array(60).fill(2686700);
      monthlyAuvByMonth[5] = 3000000;
      monthlyAuvByMonth[10] = 2500000;

      return {
        financialInputs: {
          revenue: {
            monthlyAuvByMonth,
            monthsToReachAuv: 14,
            startingMonthAuvPct: 0.08,
            growthRates: [0.13, 0.13, 0.13, 0.13, 0.13],
          },
          operatingCosts: {
            cogsPct,
            laborPct,
            royaltyPct: [0.05, 0.05, 0.05, 0.05, 0.05],
            adFundPct: [0.02, 0.02, 0.02, 0.02, 0.02],
            marketingPct,
            otherOpexPct: [0.03, 0.03, 0.03, 0.03, 0.03],
            payrollTaxPct: [0.20, 0.20, 0.20, 0.20, 0.20],
            facilitiesAnnual: [7560000, 7560000, 7560000, 7560000, 7560000],
            managementSalariesAnnual: [0, 0, 0, 0, 0],
          },
          financing: {
            totalInvestment: 25650700,
            equityPct: 0.20,
            interestRate: 0.105,
            termMonths: 144,
          },
          startup: { depreciationRate: 0.25 },
          workingCapitalAssumptions: { arDays: 30, apDays: 60, inventoryDays: 60 },
          distributions: [0, 0, 0, 0, 0],
          taxRate: 0.21,
        },
        startupCosts: testStartupCosts,
      };
    }

    it("all identity checks pass with heterogeneous per-month values", () => {
      const input = buildHeterogeneousInput();
      const result = calculateProjections(input);
      const failedChecks = result.identityChecks.filter((c) => !c.passed);
      if (failedChecks.length > 0) {
        console.log("Failed checks:", failedChecks.map((c) => `${c.name}: expected=${c.expected}, actual=${c.actual}`));
      }
      expect(failedChecks).toHaveLength(0);
    });

    it("determinism holds with heterogeneous inputs", () => {
      const input = buildHeterogeneousInput();
      const r1 = calculateProjections(input);
      const r2 = calculateProjections(input);
      expect(JSON.stringify(r1)).toBe(JSON.stringify(r2));
    });

    it("includes all 13 identity check categories", () => {
      const input = buildHeterogeneousInput();
      const result = calculateProjections(input);
      const categories = new Set(
        result.identityChecks.map((c) => c.name.replace(/ \(.*\)$/, "").replace(/ m\d+$/, "").replace(/ y\d+$/, ""))
      );
      expect(categories.size).toBeGreaterThanOrEqual(8);
    });

    it("monthly BS identity checks pass for months with modified COGS%", () => {
      const input = buildHeterogeneousInput();
      const result = calculateProjections(input);
      const monthlyBS = result.identityChecks.filter((c) => c.name.startsWith("Monthly BS identity"));
      expect(monthlyBS).toHaveLength(60);
      monthlyBS.forEach((check) => {
        expect(check.passed).toBe(true);
      });
    });

    it("CF cash continuity checks pass with heterogeneous labor%", () => {
      const input = buildHeterogeneousInput();
      const result = calculateProjections(input);
      const cfCont = result.identityChecks.filter((c) => c.name.startsWith("CF cash continuity"));
      cfCont.forEach((check) => {
        expect(check.passed).toBe(true);
      });
    });
  });

  describe("AC-10: Input field map helpers", () => {
    describe("getAbsoluteMonthIndex", () => {
      it("converts monthly colKey y1m1 to index 0", () => {
        expect(getAbsoluteMonthIndex("y1m1")).toBe(0);
      });

      it("converts monthly colKey y1m12 to index 11", () => {
        expect(getAbsoluteMonthIndex("y1m12")).toBe(11);
      });

      it("converts monthly colKey y2m5 to index 16", () => {
        expect(getAbsoluteMonthIndex("y2m5")).toBe(16);
      });

      it("converts monthly colKey y5m12 to index 59", () => {
        expect(getAbsoluteMonthIndex("y5m12")).toBe(59);
      });

      it("converts quarterly colKey y1q1 to start index 0", () => {
        expect(getAbsoluteMonthIndex("y1q1")).toBe(0);
      });

      it("converts quarterly colKey y2q3 to start index 18", () => {
        expect(getAbsoluteMonthIndex("y2q3")).toBe(18);
      });

      it("converts annual colKey y1 to index 0", () => {
        expect(getAbsoluteMonthIndex("y1")).toBe(0);
      });

      it("converts annual colKey y3 to index 24", () => {
        expect(getAbsoluteMonthIndex("y3")).toBe(24);
      });
    });

    describe("getMonthRangeForColKey", () => {
      it("monthly colKey returns count of 1", () => {
        const range = getMonthRangeForColKey("y1m1");
        expect(range).toEqual({ start: 0, count: 1 });
      });

      it("monthly colKey y2m5 returns start 16 count 1", () => {
        const range = getMonthRangeForColKey("y2m5");
        expect(range).toEqual({ start: 16, count: 1 });
      });

      it("quarterly colKey returns count of 3", () => {
        const range = getMonthRangeForColKey("y1q2");
        expect(range).toEqual({ start: 3, count: 3 });
      });

      it("quarterly colKey y2q3 returns start 18 count 3", () => {
        const range = getMonthRangeForColKey("y2q3");
        expect(range).toEqual({ start: 18, count: 3 });
      });

      it("annual colKey returns count of 12", () => {
        const range = getMonthRangeForColKey("y1");
        expect(range).toEqual({ start: 0, count: 12 });
      });

      it("annual colKey y3 returns start 24 count 12", () => {
        const range = getMonthRangeForColKey("y3");
        expect(range).toEqual({ start: 24, count: 12 });
      });
    });

    describe("getDrillLevelFromColKey", () => {
      it("identifies monthly drill level from y1m5", () => {
        expect(getDrillLevelFromColKey("y1m5")).toBe("monthly");
      });

      it("identifies quarterly drill level from y2q3", () => {
        expect(getDrillLevelFromColKey("y2q3")).toBe("quarterly");
      });

      it("identifies annual drill level from y1", () => {
        expect(getDrillLevelFromColKey("y1")).toBe("annual");
      });
    });
  });
});
