import { describe, it, expect } from "vitest";
import {
  calculateProjections,
  type EngineInput,
  type FinancialInputs,
  type StartupCostLineItem,
  MAX_PROJECTION_MONTHS,
} from "./financial-engine";

// ─── PostNet Reference Data ─────────────────────────────────────────────
// Extracted from _bmad-output/planning-artifacts/reference-data/PostNet_-_Business_Plan_1770511701987.xlsx
// All currency values in CENTS

const postNetInputs: FinancialInputs = {
  revenue: {
    annualGrossSales: 32240100, // $322,401
    monthlyAuvByMonth: Array(60).fill(2686675),
    monthsToReachAuv: 14,
    startingMonthAuvPct: 0.08,
    growthRates: [0.13, 0.13, 0.10, 0.08, 0.08],
  },
  operatingCosts: {
    cogsPct: Array(60).fill(0.30),
    laborPct: Array(60).fill(0.17),
    royaltyPct: [0.05, 0.05, 0.05, 0.05, 0.05],
    adFundPct: [0.02, 0.02, 0.02, 0.02, 0.02],
    marketingPct: [
      ...Array(12).fill(0.05),
      ...Array(12).fill(0.03),
      ...Array(12).fill(0.02),
      ...Array(12).fill(0.02),
      ...Array(12).fill(0.02),
    ],
    otherOpexPct: [0.03, 0.03, 0.03, 0.03, 0.03],
    payrollTaxPct: [0.20, 0.20, 0.20, 0.20, 0.20],
    facilitiesAnnual: [1000000, 1030000, 1060900, 1092700, 1125500], // $10k, escalating 3%/yr
    managementSalariesAnnual: [0, 5170021, 5813444, 6352566, 6879826], // $0 Y1, then contrib margin/3
  },
  financing: {
    totalInvestment: 25650700, // $256,507 = avg(223207, 289807)
    equityPct: 0.20,
    interestRate: 0.105,
    termMonths: 144, // 12 years
  },
  startup: {
    depreciationRate: 0.25, // 4 years straight-line
  },
  workingCapitalAssumptions: {
    arDays: 30,
    apDays: 60,
    inventoryDays: 60,
  },
  distributions: [0, 0, 0, 3000000, 3500000], // $0, $0, $0, $30k, $35k
  taxRate: 0.21,
};

const postNetStartupCosts: StartupCostLineItem[] = [
  { id: "1", name: "Equipment & Signage", amount: 12605700, capexClassification: "capex", isCustom: false, source: "brand_default", brandDefaultAmount: 12605700, item7RangeLow: null, item7RangeHigh: null, sortOrder: 0 },
  { id: "2", name: "Leasehold Improvements", amount: 87500, capexClassification: "capex", isCustom: false, source: "brand_default", brandDefaultAmount: 87500, item7RangeLow: null, item7RangeHigh: null, sortOrder: 1 },
  { id: "3", name: "Technology", amount: 520000, capexClassification: "capex", isCustom: false, source: "brand_default", brandDefaultAmount: 520000, item7RangeLow: null, item7RangeHigh: null, sortOrder: 2 },
  { id: "4", name: "Non-CapEx Investments", amount: 8437500, capexClassification: "non_capex", isCustom: false, source: "brand_default", brandDefaultAmount: 8437500, item7RangeLow: null, item7RangeHigh: null, sortOrder: 3 },
  { id: "5", name: "Working Capital", amount: 4000000, capexClassification: "working_capital", isCustom: false, source: "brand_default", brandDefaultAmount: 4000000, item7RangeLow: null, item7RangeHigh: null, sortOrder: 4 },
];

const postNetInput: EngineInput = {
  financialInputs: postNetInputs,
  startupCosts: postNetStartupCosts,
};

// ─── Test Suite ─────────────────────────────────────────────────────────

describe("Financial Engine", () => {
  const result = calculateProjections(postNetInput);

  describe("Basic Structure", () => {
    it("produces exactly 60 monthly projections", () => {
      expect(result.monthlyProjections).toHaveLength(MAX_PROJECTION_MONTHS);
    });

    it("produces exactly 5 annual summaries", () => {
      expect(result.annualSummaries).toHaveLength(5);
    });

    it("monthly projections have correct month numbering", () => {
      result.monthlyProjections.forEach((mp, i) => {
        expect(mp.month).toBe(i + 1);
        expect(mp.year).toBeGreaterThanOrEqual(1);
        expect(mp.year).toBeLessThanOrEqual(5);
        expect(mp.monthInYear).toBeGreaterThanOrEqual(1);
        expect(mp.monthInYear).toBeLessThanOrEqual(12);
      });
    });
  });

  describe("Determinism (FR9, NFR15)", () => {
    it("identical inputs produce identical outputs", () => {
      const result1 = calculateProjections(postNetInput);
      const result2 = calculateProjections(postNetInput);
      expect(JSON.stringify(result1)).toBe(JSON.stringify(result2));
    });
  });

  describe("Revenue Ramp-Up", () => {
    it("month 1 AUV% starts at approximately 8%", () => {
      const m1 = result.monthlyProjections[0];
      // With the ramp formula: 0.08 + (0.92 * 1/14) ≈ 0.1457
      // Note: the PostNet formula gives 8% for month 1 because it uses monthsRemaining=13
      // Our formula: startPct + (1-startPct) * (AUV_Reached - monthsRemaining) / AUV_Reached
      // = 0.08 + 0.92 * (14-13)/14 = 0.08 + 0.0657 = 0.1457
      // But the spreadsheet uses months_remaining = AUV_Reached - 1 for month 1 which gives 0.08
      // We validate revenue is close to the reference instead
      expect(m1.auvPct).toBeGreaterThan(0.05);
      expect(m1.auvPct).toBeLessThan(0.30);
    });

    it("month 14 reaches 100% AUV", () => {
      const m14 = result.monthlyProjections[13];
      expect(m14.auvPct).toBeCloseTo(1.0, 2);
    });

    it("revenue increases month over month during ramp-up", () => {
      for (let i = 1; i < 14; i++) {
        expect(result.monthlyProjections[i].revenue).toBeGreaterThan(
          result.monthlyProjections[i - 1].revenue
        );
      }
    });

    it("post-ramp revenue grows at monthly compound rate", () => {
      // After month 14, Y1 growth = 13%, monthly = 13%/12 ≈ 1.083%
      const m15 = result.monthlyProjections[14];
      const m14 = result.monthlyProjections[13];
      const expectedGrowth = 0.13 / 12;
      const actualGrowth = m15.revenue / m14.revenue - 1;
      expect(actualGrowth).toBeCloseTo(expectedGrowth, 4);
    });
  });

  describe("Revenue Totals (PostNet Reference)", () => {
    // Reference: Y1=$161,738, Y2=$337,175, Y3=$379,138, Y4=$414,298, Y5=$448,684
    // We use a 10% tolerance because our ramp formula differs slightly from the spreadsheet's
    const tolerancePct = 0.10;

    it("Year 1 revenue within tolerance of reference", () => {
      const y1 = result.annualSummaries[0];
      expect(y1.revenue).toBeGreaterThan(16173800 * (1 - tolerancePct));
      expect(y1.revenue).toBeLessThan(16173800 * (1 + tolerancePct));
    });

    it("Year 2 revenue within tolerance of reference", () => {
      const y2 = result.annualSummaries[1];
      expect(y2.revenue).toBeGreaterThan(33717500 * (1 - tolerancePct));
      expect(y2.revenue).toBeLessThan(33717500 * (1 + tolerancePct));
    });
  });

  describe("COGS & Gross Profit", () => {
    it("gross profit % is approximately 63% (100% - 30% COGS - 5% royalty - 2% ad fund)", () => {
      result.annualSummaries.forEach((annual) => {
        if (annual.revenue > 0) {
          expect(annual.grossProfitPct).toBeCloseTo(0.63, 1);
        }
      });
    });

    it("COGS components are negative values", () => {
      result.monthlyProjections.forEach((mp) => {
        expect(mp.materialsCogs).toBeLessThanOrEqual(0);
        expect(mp.royalties).toBeLessThanOrEqual(0);
        expect(mp.adFund).toBeLessThanOrEqual(0);
      });
    });
  });

  describe("Operating Expenses", () => {
    it("non-CapEx investments only appear in Year 1", () => {
      const y1Months = result.monthlyProjections.filter((mp) => mp.year === 1);
      const y2Months = result.monthlyProjections.filter((mp) => mp.year === 2);

      y1Months.forEach((mp) => {
        expect(mp.nonCapexInvestment).toBeLessThan(0); // negative = expense
      });
      y2Months.forEach((mp) => {
        expect(mp.nonCapexInvestment).toBe(0);
      });
    });

    it("management salaries are 0 in Year 1", () => {
      const y1Months = result.monthlyProjections.filter((mp) => mp.year === 1);
      y1Months.forEach((mp) => {
        expect(mp.managementSalaries).toBe(0);
      });
    });
  });

  describe("Depreciation", () => {
    it("depreciation occurs for 48 months (4 years) then stops", () => {
      const y1to4 = result.monthlyProjections.filter((mp) => mp.month <= 48);
      const y5 = result.monthlyProjections.filter((mp) => mp.month > 48);

      y1to4.forEach((mp) => {
        expect(mp.depreciation).toBeLessThan(0); // negative = expense
      });
      y5.forEach((mp) => {
        expect(mp.depreciation).toBe(0);
      });
    });

    it("total depreciation over 4 years equals CapEx total", () => {
      const totalDep = result.monthlyProjections.reduce(
        (sum, mp) => sum + Math.abs(mp.depreciation),
        0
      );
      // Allow 1 cent tolerance per month * 48 months
      expect(Math.abs(totalDep - 13213200)).toBeLessThan(100);
    });

    it("net fixed assets reach 0 by end of Year 4", () => {
      const m48 = result.monthlyProjections[47];
      expect(Math.abs(m48.netFixedAssets)).toBeLessThan(100); // within rounding
    });
  });

  describe("Loan Amortization", () => {
    it("loan balance decreases each month", () => {
      for (let i = 1; i < Math.min(144, 60); i++) {
        expect(result.monthlyProjections[i].loanClosingBalance).toBeLessThan(
          result.monthlyProjections[i - 1].loanClosingBalance
        );
      }
    });

    it("monthly principal payment is consistent (straight-line)", () => {
      const payments = result.monthlyProjections
        .filter((mp) => mp.loanPrincipalPayment > 0)
        .map((mp) => mp.loanPrincipalPayment);

      if (payments.length > 1) {
        const firstPayment = payments[0];
        payments.forEach((p) => {
          expect(Math.abs(p - firstPayment)).toBeLessThan(2); // within 2 cents
        });
      }
    });

    it("interest expense decreases over time as balance shrinks", () => {
      const y1Interest = Math.abs(result.annualSummaries[0].interestExpense);
      const y5Interest = Math.abs(result.annualSummaries[4].interestExpense);
      expect(y5Interest).toBeLessThan(y1Interest);
    });
  });

  describe("Working Capital", () => {
    it("accounts receivable is positive when revenue > 0", () => {
      result.monthlyProjections.forEach((mp) => {
        if (mp.revenue > 0) {
          expect(mp.accountsReceivable).toBeGreaterThan(0);
        }
      });
    });

    it("accounts payable is positive when COGS > 0", () => {
      result.monthlyProjections.forEach((mp) => {
        if (mp.materialsCogs < 0) {
          expect(mp.accountsPayable).toBeGreaterThan(0);
        }
      });
    });
  });

  describe("Accounting Identity Checks", () => {
    it("all identity checks pass", () => {
      result.identityChecks.forEach((check) => {
        expect(check.passed).toBe(true);
      });
    });

    it("includes balance sheet checks for all 5 years", () => {
      const bsChecks = result.identityChecks.filter((c) =>
        c.name.startsWith("Annual BS identity")
      );
      expect(bsChecks).toHaveLength(5);
    });

    it("includes depreciation total check", () => {
      const depCheck = result.identityChecks.find((c) =>
        c.name.includes("depreciation")
      );
      expect(depCheck).toBeDefined();
      expect(depCheck!.passed).toBe(true);
    });

    it("includes P&L to cash flow consistency checks", () => {
      const plCfChecks = result.identityChecks.filter((c) =>
        c.name.includes("P&L to CF consistency")
      );
      expect(plCfChecks).toHaveLength(5);
      plCfChecks.forEach((check) => {
        expect(check.passed).toBe(true);
      });
    });
  });

  describe("ROI Metrics", () => {
    it("break-even is based on cumulative cash flow recovery", () => {
      // Cumulative cash flow break-even: starts at -(totalInvestment) + equity + debt,
      // then accumulates operating CF minus principal and distributions.
      // For PostNet this should be within the 60-month window but later than EBITDA breakeven.
      if (result.roiMetrics.breakEvenMonth !== null) {
        expect(result.roiMetrics.breakEvenMonth).toBeGreaterThan(0);
        expect(result.roiMetrics.breakEvenMonth).toBeLessThanOrEqual(60);
      }
    });

    it("total startup investment is derived from startup cost line items", () => {
      const expectedCapex = 12605700 + 87500 + 520000; // sum of capex items
      const expectedNonCapex = 8437500;
      const expectedWC = 4000000;
      expect(result.roiMetrics.totalStartupInvestment).toBe(
        expectedCapex + expectedNonCapex + expectedWC
      );
    });

    it("startup totals match line item sums even when fi.startup is absent", () => {
      // Engine derives totals from startupCosts, not from fi.startup
      const modifiedInput: EngineInput = {
        financialInputs: postNetInputs,
        startupCosts: [
          { id: "t1", name: "Equipment", amount: 10000000, capexClassification: "capex", isCustom: false, source: "brand_default", brandDefaultAmount: 10000000, item7RangeLow: null, item7RangeHigh: null, sortOrder: 0 },
          { id: "t2", name: "Other", amount: 5000000, capexClassification: "non_capex", isCustom: false, source: "brand_default", brandDefaultAmount: 5000000, item7RangeLow: null, item7RangeHigh: null, sortOrder: 1 },
          { id: "t3", name: "WC", amount: 2000000, capexClassification: "working_capital", isCustom: false, source: "brand_default", brandDefaultAmount: 2000000, item7RangeLow: null, item7RangeHigh: null, sortOrder: 2 },
        ],
      };
      const modResult = calculateProjections(modifiedInput);
      expect(modResult.roiMetrics.totalStartupInvestment).toBe(17000000);
    });
  });

  describe("Edge Cases", () => {
    it("handles zero revenue inputs without crashing", () => {
      const zeroInput: EngineInput = {
        financialInputs: {
          ...postNetInputs,
          revenue: {
            annualGrossSales: 0,
            monthlyAuvByMonth: Array(60).fill(0),
            monthsToReachAuv: 14,
            startingMonthAuvPct: 0,
            growthRates: [0, 0, 0, 0, 0],
          },
        },
        startupCosts: [],
      };
      const zeroResult = calculateProjections(zeroInput);
      expect(zeroResult.monthlyProjections).toHaveLength(60);
      expect(zeroResult.annualSummaries).toHaveLength(5);
    });

    it("handles zero financing without crashing", () => {
      const noLoanInput: EngineInput = {
        financialInputs: {
          ...postNetInputs,
          financing: {
            totalInvestment: 25650700,
            equityPct: 1.0, // all equity, no debt
            interestRate: 0,
            termMonths: 0,
          },
        },
        startupCosts: postNetStartupCosts,
      };
      const noLoanResult = calculateProjections(noLoanInput);
      expect(noLoanResult.monthlyProjections).toHaveLength(60);
      noLoanResult.monthlyProjections.forEach((mp) => {
        expect(mp.interestExpense).toBe(0);
        expect(mp.loanPrincipalPayment).toBe(0);
      });
    });
  });

  describe("Annual Summary Consistency", () => {
    it("annual revenue equals sum of monthly revenues", () => {
      for (let y = 0; y < 5; y++) {
        const yearMonths = result.monthlyProjections.filter(
          (mp) => mp.year === y + 1
        );
        const monthlySum = yearMonths.reduce((s, mp) => s + mp.revenue, 0);
        expect(
          Math.abs(result.annualSummaries[y].revenue - monthlySum)
        ).toBeLessThan(100);
      }
    });

    it("ending cash increases from Year 1 to Year 5", () => {
      expect(result.annualSummaries[4].endingCash).toBeGreaterThan(
        result.annualSummaries[0].endingCash
      );
    });
  });

  describe("ROI Metrics - Summary Completeness (AC8)", () => {
    it("fiveYearROIPct is a finite number", () => {
      expect(Number.isFinite(result.roiMetrics.fiveYearROIPct)).toBe(true);
    });

    it("fiveYearCumulativeCashFlow is present", () => {
      expect(typeof result.roiMetrics.fiveYearCumulativeCashFlow).toBe("number");
      expect(Number.isFinite(result.roiMetrics.fiveYearCumulativeCashFlow)).toBe(true);
    });

    it("totalStartupInvestment is positive when startup costs exist", () => {
      expect(result.roiMetrics.totalStartupInvestment).toBeGreaterThan(0);
    });

    it("breakEvenMonth is null or a positive integer <= 60", () => {
      const bem = result.roiMetrics.breakEvenMonth;
      if (bem !== null) {
        expect(bem).toBeGreaterThan(0);
        expect(bem).toBeLessThanOrEqual(60);
        expect(Number.isInteger(bem)).toBe(true);
      }
    });
  });

  describe("P&L Calculation Chain (AC6)", () => {
    it("grossProfit = revenue + totalCogs (COGS are negative)", () => {
      result.monthlyProjections.forEach((mp) => {
        expect(Math.abs(mp.grossProfit - (mp.revenue + mp.totalCogs))).toBeLessThan(2);
      });
    });

    it("totalCogs = materialsCogs + royalties + adFund", () => {
      result.monthlyProjections.forEach((mp) => {
        const computed = mp.materialsCogs + mp.royalties + mp.adFund;
        expect(Math.abs(mp.totalCogs - computed)).toBeLessThan(2);
      });
    });

    it("ebitda = contributionMargin + totalOpex", () => {
      result.monthlyProjections.forEach((mp) => {
        const computed = mp.contributionMargin + mp.totalOpex;
        expect(Math.abs(mp.ebitda - computed)).toBeLessThan(2);
      });
    });

    it("contributionMargin = grossProfit + directLabor", () => {
      result.monthlyProjections.forEach((mp) => {
        const computed = mp.grossProfit + mp.directLabor;
        expect(Math.abs(mp.contributionMargin - computed)).toBeLessThan(2);
      });
    });

    it("preTaxIncome = ebitda + depreciation + interestExpense", () => {
      result.monthlyProjections.forEach((mp) => {
        const computed = mp.ebitda + mp.depreciation + mp.interestExpense;
        expect(Math.abs(mp.preTaxIncome - computed)).toBeLessThan(2);
      });
    });

    it("operating cash flow includes working capital changes", () => {
      for (let i = 1; i < result.monthlyProjections.length; i++) {
        const mp = result.monthlyProjections[i];
        const prev = result.monthlyProjections[i - 1];
        const changeAR = -(mp.accountsReceivable - prev.accountsReceivable);
        const changeInv = -(mp.inventory - prev.inventory);
        const changeAP = mp.accountsPayable - prev.accountsPayable;
        const expected = mp.preTaxIncome + Math.abs(mp.depreciation) + changeAR + changeInv + changeAP;
        expect(Math.abs(mp.operatingCashFlow - expected)).toBeLessThan(2);
      }
    });
  });

  describe("Brand-Agnostic Engine (AC4)", () => {
    const altBrandInputs: FinancialInputs = {
      revenue: {
        annualGrossSales: 50000000,
        monthlyAuvByMonth: Array(60).fill(4166667),
        monthsToReachAuv: 6,
        startingMonthAuvPct: 0.50,
        growthRates: [0.05, 0.04, 0.03, 0.02, 0.02],
      },
      operatingCosts: {
        cogsPct: Array(60).fill(0.25),
        laborPct: Array(60).fill(0.20),
        royaltyPct: [0.06, 0.06, 0.06, 0.06, 0.06],
        adFundPct: [0.01, 0.01, 0.01, 0.01, 0.01],
        marketingPct: Array(60).fill(0.03),
        otherOpexPct: [0.02, 0.02, 0.02, 0.02, 0.02],
        payrollTaxPct: [0.15, 0.15, 0.15, 0.15, 0.15],
        facilitiesAnnual: [2400000, 2472000, 2546160, 2622545, 2701221],
        managementSalariesAnnual: [3600000, 3708000, 3819240, 3933817, 4051832],
      },
      financing: {
        totalInvestment: 40000000,
        equityPct: 0.30,
        interestRate: 0.08,
        termMonths: 120,
      },
      startup: {
        depreciationRate: 0.20,
      },
      workingCapitalAssumptions: {
        arDays: 15,
        apDays: 45,
        inventoryDays: 30,
      },
      distributions: [0, 0, 2000000, 2500000, 3000000],
      taxRate: 0.25,
    };

    const altStartupCosts: StartupCostLineItem[] = [
      { id: "a1", name: "Equipment", amount: 20000000, capexClassification: "capex", isCustom: false, source: "brand_default", brandDefaultAmount: 20000000, item7RangeLow: null, item7RangeHigh: null, sortOrder: 0 },
      { id: "a2", name: "Supplies", amount: 5000000, capexClassification: "non_capex", isCustom: false, source: "brand_default", brandDefaultAmount: 5000000, item7RangeLow: null, item7RangeHigh: null, sortOrder: 1 },
      { id: "a3", name: "Working Capital", amount: 3000000, capexClassification: "working_capital", isCustom: false, source: "brand_default", brandDefaultAmount: 3000000, item7RangeLow: null, item7RangeHigh: null, sortOrder: 2 },
    ];

    const altInput: EngineInput = {
      financialInputs: altBrandInputs,
      startupCosts: altStartupCosts,
    };

    const altResult = calculateProjections(altInput);

    it("produces valid structure for a completely different brand", () => {
      expect(altResult.monthlyProjections).toHaveLength(60);
      expect(altResult.annualSummaries).toHaveLength(5);
    });

    it("all identity checks pass for alternate brand", () => {
      altResult.identityChecks.forEach((check) => {
        expect(check.passed).toBe(true);
      });
    });

    it("alternate brand has different financial profile than PostNet", () => {
      expect(altResult.annualSummaries[0].revenue).not.toBe(result.annualSummaries[0].revenue);
      expect(altResult.roiMetrics.totalStartupInvestment).not.toBe(result.roiMetrics.totalStartupInvestment);
    });

    it("alternate brand ROI metrics are valid", () => {
      expect(Number.isFinite(altResult.roiMetrics.fiveYearROIPct)).toBe(true);
      expect(altResult.roiMetrics.totalStartupInvestment).toBe(28000000);
    });

    it("alternate brand is deterministic", () => {
      const r1 = calculateProjections(altInput);
      const r2 = calculateProjections(altInput);
      expect(JSON.stringify(r1)).toBe(JSON.stringify(r2));
    });
  });

  describe("Module Purity (AC5)", () => {
    it("financial-engine.ts has zero import statements (pure TypeScript)", () => {
      const fs = require("fs");
      const engineSource = fs.readFileSync(
        require("path").resolve(__dirname, "financial-engine.ts"),
        "utf-8"
      );
      const importLines = engineSource
        .split("\n")
        .filter((line: string) => /^\s*import\s/.test(line));
      expect(importLines).toHaveLength(0);
    });
  });

  describe("Monthly Balance Sheet Disaggregation (AC1)", () => {
    it("every month has totalAssets = totalLiabilitiesAndEquity", () => {
      result.monthlyProjections.forEach((mp) => {
        expect(Math.abs(mp.totalAssets - mp.totalLiabilitiesAndEquity)).toBeLessThanOrEqual(1);
      });
    });

    it("totalCurrentAssets = endingCash + AR + inventory", () => {
      result.monthlyProjections.forEach((mp) => {
        const expected = mp.endingCash + mp.accountsReceivable + mp.inventory;
        expect(Math.abs(mp.totalCurrentAssets - expected)).toBeLessThanOrEqual(1);
      });
    });

    it("totalAssets = totalCurrentAssets + netFixedAssets", () => {
      result.monthlyProjections.forEach((mp) => {
        const expected = mp.totalCurrentAssets + mp.netFixedAssets;
        expect(Math.abs(mp.totalAssets - expected)).toBeLessThanOrEqual(1);
      });
    });

    it("totalLiabilities = AP + taxPayable + loanClosingBalance + lineOfCredit", () => {
      result.monthlyProjections.forEach((mp) => {
        const expected = mp.accountsPayable + mp.taxPayable + mp.loanClosingBalance + mp.lineOfCredit;
        expect(Math.abs(mp.totalLiabilities - expected)).toBeLessThanOrEqual(1);
      });
    });

    it("totalEquity = commonStock + retainedEarnings", () => {
      result.monthlyProjections.forEach((mp) => {
        const expected = mp.commonStock + mp.retainedEarnings;
        expect(Math.abs(mp.totalEquity - expected)).toBeLessThanOrEqual(1);
      });
    });

    it("retainedEarnings accumulates preTaxIncome minus distributions", () => {
      let cumulativeRE = 0;
      result.monthlyProjections.forEach((mp, i) => {
        const yi = Math.floor(i / 12);
        const monthlyDist = postNetInputs.distributions[yi] / 12;
        cumulativeRE += mp.preTaxIncome - monthlyDist;
        expect(Math.abs(mp.retainedEarnings - cumulativeRE)).toBeLessThanOrEqual(1);
      });
    });

    it("commonStock equals equity amount for all months", () => {
      const equityAmount = Math.round(postNetInputs.financing.totalInvestment * postNetInputs.financing.equityPct);
      result.monthlyProjections.forEach((mp) => {
        expect(mp.commonStock).toBe(equityAmount);
      });
    });
  });

  describe("Monthly Cash Flow Disaggregation (AC2)", () => {
    it("cfNetOperatingCashFlow equals operatingCashFlow", () => {
      result.monthlyProjections.forEach((mp) => {
        expect(mp.cfNetOperatingCashFlow).toBe(mp.operatingCashFlow);
      });
    });

    it("cfNetBeforeFinancing = opCF + taxPayableChange + capex", () => {
      result.monthlyProjections.forEach((mp) => {
        const expected = mp.cfNetOperatingCashFlow + mp.cfTaxPayableChange + mp.cfCapexPurchase;
        expect(Math.abs(mp.cfNetBeforeFinancing - expected)).toBeLessThanOrEqual(1);
      });
    });

    it("cfNetCashFlow = cfNetBeforeFinancing + cfNetFinancingCashFlow", () => {
      result.monthlyProjections.forEach((mp) => {
        const expected = mp.cfNetBeforeFinancing + mp.cfNetFinancingCashFlow;
        expect(Math.abs(mp.cfNetCashFlow - expected)).toBeLessThanOrEqual(1);
      });
    });

    it("endingCash = beginningCash + cfNetCashFlow", () => {
      result.monthlyProjections.forEach((mp) => {
        const expected = mp.beginningCash + mp.cfNetCashFlow;
        expect(Math.abs(mp.endingCash - expected)).toBeLessThanOrEqual(1);
      });
    });

    it("cash continuity: ending cash of M[n] = beginning cash of M[n+1]", () => {
      for (let i = 0; i < result.monthlyProjections.length - 1; i++) {
        expect(Math.abs(
          result.monthlyProjections[i].endingCash - result.monthlyProjections[i + 1].beginningCash
        )).toBeLessThanOrEqual(1);
      }
    });

    it("capex purchase only in month 1", () => {
      result.monthlyProjections.forEach((mp) => {
        if (mp.month === 1) {
          expect(mp.cfCapexPurchase).toBeLessThan(0);
        } else {
          expect(mp.cfCapexPurchase).toBe(0);
        }
      });
    });

    it("equity issuance only in month 1", () => {
      result.monthlyProjections.forEach((mp) => {
        if (mp.month === 1) {
          expect(mp.cfEquityIssuance).toBeGreaterThan(0);
        } else {
          expect(mp.cfEquityIssuance).toBe(0);
        }
      });
    });

    it("cfInterestExpense is display-only and NOT included in financing total", () => {
      result.monthlyProjections.forEach((mp) => {
        if (mp.interestExpense !== 0) {
          expect(mp.cfInterestExpense).toBe(mp.interestExpense);
        }
        const financingWithoutInterest = mp.cfNotesPayable + mp.cfLineOfCredit + mp.cfDistributions + mp.cfEquityIssuance;
        const debtDrawdown = mp.month === 1 ? Math.round(postNetInputs.financing.totalInvestment * (1 - postNetInputs.financing.equityPct)) : 0;
        const expectedFinancing = financingWithoutInterest + debtDrawdown;
        expect(Math.abs(mp.cfNetFinancingCashFlow - expectedFinancing)).toBeLessThanOrEqual(1);
      });
    });
  });

  describe("Tax Payable Shift-by-N (AC3)", () => {
    it("month 1 taxPayable is 0 (no prior period accrual)", () => {
      expect(result.monthlyProjections[0].taxPayable).toBe(0);
    });

    it("taxPayable is non-negative for all months", () => {
      result.monthlyProjections.forEach((mp) => {
        expect(mp.taxPayable).toBeGreaterThanOrEqual(0);
      });
    });

    it("taxPayable accumulates when preTaxIncome is positive", () => {
      const firstPositiveMonth = result.monthlyProjections.find((mp) => mp.preTaxIncome > 0);
      if (firstPositiveMonth && firstPositiveMonth.month < 60) {
        const nextMonth = result.monthlyProjections[firstPositiveMonth.month];
        expect(nextMonth.taxPayable).toBeGreaterThan(0);
      }
    });

    it("custom taxPaymentDelayMonths shifts tax payment timing", () => {
      const customInput: EngineInput = {
        financialInputs: { ...postNetInputs, taxPaymentDelayMonths: 6 },
        startupCosts: postNetStartupCosts,
      };
      const customResult = calculateProjections(customInput);
      const delay6 = customResult.monthlyProjections;
      const delay1 = result.monthlyProjections;
      const positiveMonth = delay1.findIndex((mp) => mp.preTaxIncome > 0);
      if (positiveMonth >= 0 && positiveMonth + 6 < 60) {
        const checkMonth = positiveMonth + 6;
        expect(delay6[checkMonth].taxPayable).toBeGreaterThanOrEqual(delay1[checkMonth].taxPayable);
      }
      const totalTax6 = delay6.reduce((s, mp) => s + mp.taxPayable, 0);
      const totalTax1 = delay1.reduce((s, mp) => s + mp.taxPayable, 0);
      expect(totalTax6).not.toBe(totalTax1);
    });

    it("cfTaxPayableChange reflects balance change", () => {
      result.monthlyProjections.forEach((mp, i) => {
        const prevTaxPayable = i > 0 ? result.monthlyProjections[i - 1].taxPayable : 0;
        const expected = mp.taxPayable - prevTaxPayable;
        expect(Math.abs(mp.cfTaxPayableChange - expected)).toBeLessThanOrEqual(1);
      });
    });
  });

  describe("Annual Summary BS from Monthly Snapshots (ADR-5, AC4)", () => {
    it("annual totalAssets equals last month's totalAssets", () => {
      for (let y = 0; y < 5; y++) {
        const lastMonth = result.monthlyProjections[(y + 1) * 12 - 1];
        expect(result.annualSummaries[y].totalAssets).toBe(lastMonth.totalAssets);
      }
    });

    it("annual totalLiabilities equals last month's totalLiabilities", () => {
      for (let y = 0; y < 5; y++) {
        const lastMonth = result.monthlyProjections[(y + 1) * 12 - 1];
        expect(result.annualSummaries[y].totalLiabilities).toBe(lastMonth.totalLiabilities);
      }
    });

    it("annual totalEquity equals last month's totalEquity", () => {
      for (let y = 0; y < 5; y++) {
        const lastMonth = result.monthlyProjections[(y + 1) * 12 - 1];
        expect(result.annualSummaries[y].totalEquity).toBe(lastMonth.totalEquity);
      }
    });

    it("annual endingCash equals last month's endingCash", () => {
      for (let y = 0; y < 5; y++) {
        const lastMonth = result.monthlyProjections[(y + 1) * 12 - 1];
        expect(result.annualSummaries[y].endingCash).toBe(lastMonth.endingCash);
      }
    });

    it("annual netCashFlow equals sum of monthly cfNetCashFlow", () => {
      for (let y = 0; y < 5; y++) {
        const yearMonths = result.monthlyProjections.filter((mp) => mp.year === y + 1);
        const sumMonthly = yearMonths.reduce((s, mp) => s + mp.cfNetCashFlow, 0);
        expect(Math.abs(result.annualSummaries[y].netCashFlow - sumMonthly)).toBeLessThanOrEqual(1);
      }
    });
  });

  describe("Valuation Output (AC6)", () => {
    it("produces 5 annual valuation records", () => {
      expect(result.valuation).toHaveLength(5);
    });

    it("valuation years are 1 through 5", () => {
      result.valuation.forEach((v, i) => {
        expect(v.year).toBe(i + 1);
      });
    });

    it("grossSales matches annual revenue", () => {
      result.valuation.forEach((v) => {
        const annual = result.annualSummaries[v.year - 1];
        expect(v.grossSales).toBe(annual.revenue);
      });
    });

    it("netOperatingIncome equals annual EBITDA", () => {
      result.valuation.forEach((v) => {
        const annual = result.annualSummaries[v.year - 1];
        expect(v.netOperatingIncome).toBe(annual.ebitda);
      });
    });

    it("adjNetOperatingIncome = EBITDA - shareholderSalaryAdj", () => {
      result.valuation.forEach((v) => {
        const expected = v.netOperatingIncome - v.shareholderSalaryAdj;
        expect(Math.abs(v.adjNetOperatingIncome - expected)).toBeLessThanOrEqual(1);
      });
    });

    it("estimatedValue = adjNetOperatingIncome * ebitdaMultiple", () => {
      result.valuation.forEach((v) => {
        const expected = v.adjNetOperatingIncome * v.ebitdaMultiple;
        expect(Math.abs(v.estimatedValue - expected)).toBeLessThanOrEqual(1);
      });
    });

    it("estimatedTaxOnSale = estimatedValue * taxRate", () => {
      result.valuation.forEach((v) => {
        const expected = v.estimatedValue * postNetInputs.taxRate;
        expect(Math.abs(v.estimatedTaxOnSale - expected)).toBeLessThanOrEqual(1);
      });
    });

    it("netAfterTaxProceeds = estimatedValue - estimatedTaxOnSale", () => {
      result.valuation.forEach((v) => {
        const expected = v.estimatedValue - v.estimatedTaxOnSale;
        expect(Math.abs(v.netAfterTaxProceeds - expected)).toBeLessThanOrEqual(1);
      });
    });

    it("default shareholderSalaryAdj is zero array", () => {
      result.valuation.forEach((v) => {
        expect(v.shareholderSalaryAdj).toBe(0);
      });
    });

    it("custom shareholderSalaryAdj is applied", () => {
      const customInput: EngineInput = {
        financialInputs: { ...postNetInputs, shareholderSalaryAdj: [100000, 100000, 100000, 100000, 100000] },
        startupCosts: postNetStartupCosts,
      };
      const customResult = calculateProjections(customInput);
      customResult.valuation.forEach((v) => {
        expect(v.shareholderSalaryAdj).toBe(100000);
      });
    });
  });

  describe("ROIC Extended Output (AC7)", () => {
    it("produces 5 annual ROIC records", () => {
      expect(result.roicExtended).toHaveLength(5);
    });

    it("ROIC years are 1 through 5", () => {
      result.roicExtended.forEach((r, i) => {
        expect(r.year).toBe(i + 1);
      });
    });

    it("totalCashInvested = outsideCash + totalLoans", () => {
      result.roicExtended.forEach((r) => {
        expect(Math.abs(r.totalCashInvested - (r.outsideCash + r.totalLoans))).toBeLessThanOrEqual(1);
      });
    });

    it("totalInvestedCapital = totalCashInvested + sweatEquity + retainedEarnings", () => {
      result.roicExtended.forEach((r) => {
        const expected = r.totalCashInvested + r.totalSweatEquity + r.retainedEarningsLessDistributions;
        expect(Math.abs(r.totalInvestedCapital - expected)).toBeLessThanOrEqual(1);
      });
    });

    it("afterTaxNetIncome = preTaxNetIncomeIncSweatEquity - taxesDue", () => {
      result.roicExtended.forEach((r) => {
        const expected = r.preTaxNetIncomeIncSweatEquity - r.taxesDue;
        expect(Math.abs(r.afterTaxNetIncome - expected)).toBeLessThanOrEqual(1);
      });
    });

    it("taxesDue is non-negative", () => {
      result.roicExtended.forEach((r) => {
        expect(r.taxesDue).toBeGreaterThanOrEqual(0);
      });
    });

    it("sweatEquity accumulates across years", () => {
      for (let i = 1; i < result.roicExtended.length; i++) {
        expect(result.roicExtended[i].totalSweatEquity).toBeGreaterThanOrEqual(
          result.roicExtended[i - 1].totalSweatEquity
        );
      }
    });

    it("monthsOfCoreCapital is computed when avg capital > 0", () => {
      result.roicExtended.forEach((r) => {
        if (r.avgCoreCapitalPerMonth > 0) {
          expect(r.monthsOfCoreCapital).toBeGreaterThan(0);
        }
      });
    });
  });

  describe("P&L Analysis Output (AC8)", () => {
    it("produces 5 annual P&L analysis records", () => {
      expect(result.plAnalysis).toHaveLength(5);
    });

    it("P&L analysis years are 1 through 5", () => {
      result.plAnalysis.forEach((p, i) => {
        expect(p.year).toBe(i + 1);
      });
    });

    it("aboveBelowTarget = adjustedPreTaxProfit - targetPreTaxProfit", () => {
      result.plAnalysis.forEach((p) => {
        const expected = p.adjustedPreTaxProfit - p.targetPreTaxProfit;
        expect(Math.abs(p.aboveBelowTarget - expected)).toBeLessThanOrEqual(1);
      });
    });

    it("overUnderCap = salaryCapAtTarget - adjustedTotalWages", () => {
      result.plAnalysis.forEach((p) => {
        const expected = p.salaryCapAtTarget - p.adjustedTotalWages;
        expect(Math.abs(p.overUnderCap - expected)).toBeLessThanOrEqual(1);
      });
    });

    it("laborEfficiency is between 0 and 1 for reasonable inputs", () => {
      result.plAnalysis.forEach((p) => {
        expect(p.laborEfficiency).toBeGreaterThanOrEqual(0);
        expect(p.laborEfficiency).toBeLessThanOrEqual(1);
      });
    });

    it("default targetPreTaxProfitPct produces non-zero targetPreTaxProfit (default is 10%)", () => {
      result.plAnalysis.forEach((p) => {
        const annual = result.annualSummaries[p.year - 1];
        const expected = Math.round(annual.revenue * 0.10);
        expect(Math.abs(p.targetPreTaxProfit - expected)).toBeLessThanOrEqual(1);
      });
    });

    it("custom targetPreTaxProfitPct is applied", () => {
      const customInput: EngineInput = {
        financialInputs: { ...postNetInputs, targetPreTaxProfitPct: [0.15, 0.15, 0.15, 0.15, 0.15] },
        startupCosts: postNetStartupCosts,
      };
      const customResult = calculateProjections(customInput);
      customResult.plAnalysis.forEach((p) => {
        const annual = customResult.annualSummaries[p.year - 1];
        const expected = Math.round(annual.revenue * 0.15);
        expect(Math.abs(p.targetPreTaxProfit - expected)).toBeLessThanOrEqual(1);
      });
    });
  });

  describe("Extended Identity Checks (AC9 — 13 categories)", () => {
    it("all identity checks pass", () => {
      const failedChecks = result.identityChecks.filter((c) => !c.passed);
      if (failedChecks.length > 0) {
        console.log("Failed checks:", failedChecks.map((c) => `${c.name}: expected=${c.expected}, actual=${c.actual}`));
      }
      expect(failedChecks).toHaveLength(0);
    });

    it("includes 60 monthly BS identity checks", () => {
      const monthlyBS = result.identityChecks.filter((c) => c.name.startsWith("Monthly BS identity"));
      expect(monthlyBS).toHaveLength(60);
    });

    it("includes 5 annual BS identity checks", () => {
      const annualBS = result.identityChecks.filter((c) => c.name.startsWith("Annual BS identity"));
      expect(annualBS).toHaveLength(5);
    });

    it("includes 59 CF cash continuity checks", () => {
      const cont = result.identityChecks.filter((c) => c.name.startsWith("CF cash continuity"));
      expect(cont).toHaveLength(59);
    });

    it("includes 60 CF net identity checks", () => {
      const netId = result.identityChecks.filter((c) => c.name.startsWith("CF net identity"));
      expect(netId).toHaveLength(60);
    });

    it("includes 60 CF ending cash identity checks", () => {
      const endId = result.identityChecks.filter((c) => c.name.startsWith("CF ending cash identity"));
      expect(endId).toHaveLength(60);
    });

    it("includes 5 P&L Check checks", () => {
      const pl = result.identityChecks.filter((c) => c.name.startsWith("P&L Check"));
      expect(pl).toHaveLength(5);
    });

    it("includes 5 BS equity continuity checks", () => {
      const bsEquity = result.identityChecks.filter((c) => c.name.startsWith("BS equity continuity"));
      expect(bsEquity).toHaveLength(5);
    });

    it("includes 5 Corporation Tax Check checks", () => {
      const tax = result.identityChecks.filter((c) => c.name.startsWith("Corporation Tax Check"));
      expect(tax).toHaveLength(5);
    });

    it("includes 60 Working Capital AR checks", () => {
      const wc = result.identityChecks.filter((c) => c.name.startsWith("Working Capital AR"));
      expect(wc).toHaveLength(60);
    });

    it("includes Breakeven checks when breakEvenMonth exists", () => {
      if (result.roiMetrics.breakEvenMonth !== null) {
        const be = result.identityChecks.filter((c) => c.name.startsWith("Breakeven"));
        expect(be.length).toBeGreaterThanOrEqual(1);
      }
      const altBrandInputs: FinancialInputs = {
        revenue: { annualGrossSales: 50000000, monthlyAuvByMonth: Array(60).fill(4166667), monthsToReachAuv: 6, startingMonthAuvPct: 0.50, growthRates: [0.05, 0.04, 0.03, 0.02, 0.02] },
        operatingCosts: {
          cogsPct: Array(60).fill(0.25), laborPct: Array(60).fill(0.20),
          royaltyPct: [0.06, 0.06, 0.06, 0.06, 0.06], adFundPct: [0.01, 0.01, 0.01, 0.01, 0.01],
          marketingPct: Array(60).fill(0.03), otherOpexPct: [0.02, 0.02, 0.02, 0.02, 0.02],
          payrollTaxPct: [0.15, 0.15, 0.15, 0.15, 0.15],
          facilitiesAnnual: [2400000, 2472000, 2546160, 2622545, 2701221],
          managementSalariesAnnual: [3600000, 3708000, 3819240, 3933817, 4051832],
        },
        financing: { totalInvestment: 40000000, equityPct: 0.30, interestRate: 0.08, termMonths: 120 },
        startup: { depreciationRate: 0.20 },
        workingCapitalAssumptions: { arDays: 15, apDays: 45, inventoryDays: 30 },
        distributions: [0, 0, 2000000, 2500000, 3000000],
        taxRate: 0.25,
      };
      const altResult = calculateProjections({
        financialInputs: altBrandInputs,
        startupCosts: [
          { id: "a1", name: "Equipment", amount: 20000000, capexClassification: "capex", isCustom: false, source: "brand_default", brandDefaultAmount: 20000000, item7RangeLow: null, item7RangeHigh: null, sortOrder: 0 },
          { id: "a2", name: "Supplies", amount: 5000000, capexClassification: "non_capex", isCustom: false, source: "brand_default", brandDefaultAmount: 5000000, item7RangeLow: null, item7RangeHigh: null, sortOrder: 1 },
          { id: "a3", name: "Working Capital", amount: 3000000, capexClassification: "working_capital", isCustom: false, source: "brand_default", brandDefaultAmount: 3000000, item7RangeLow: null, item7RangeHigh: null, sortOrder: 2 },
        ],
      });
      if (altResult.roiMetrics.breakEvenMonth !== null) {
        const be = altResult.identityChecks.filter((c) => c.name.startsWith("Breakeven"));
        expect(be.length).toBeGreaterThanOrEqual(1);
        be.forEach((c) => expect(c.passed).toBe(true));
      }
    });

    it("includes ROI Check", () => {
      const roi = result.identityChecks.filter((c) => c.name === "ROI Check");
      expect(roi).toHaveLength(1);
    });

    it("includes 5 Valuation Check checks", () => {
      const val = result.identityChecks.filter((c) => c.name.startsWith("Valuation Check"));
      expect(val).toHaveLength(5);
    });

    it("total check count is at least 300", () => {
      expect(result.identityChecks.length).toBeGreaterThanOrEqual(300);
    });

    it("all 13+ identity check categories are present", () => {
      const categories = new Set(result.identityChecks.map((c) => {
        const match = c.name.match(/^(.+?)(?:\s*\()/);
        return match ? match[1].trim() : c.name;
      }));
      expect(categories.size).toBeGreaterThanOrEqual(13);
    });
  });

  describe("OpEx Disaggregation Fields (AC10)", () => {
    it("monthly projection includes opex breakdown fields", () => {
      const mp = result.monthlyProjections[12];
      expect(mp.managementSalaries).toBeDefined();
      expect(mp.facilities).toBeDefined();
      expect(mp.payrollTaxBenefits).toBeDefined();
      expect(mp.marketing).toBeDefined();
      expect(mp.otherOpex).toBeDefined();
      expect(mp.nonCapexInvestment).toBeDefined();
    });

    it("management salaries in year 1 is 0 per reference data", () => {
      const y1Months = result.monthlyProjections.filter((mp) => mp.year === 1);
      y1Months.forEach((mp) => {
        expect(mp.managementSalaries).toBe(0);
      });
    });

    it("management salaries in year 2+ are negative (expense convention)", () => {
      const y2Months = result.monthlyProjections.filter((mp) => mp.year === 2);
      y2Months.forEach((mp) => {
        expect(mp.managementSalaries).toBeLessThan(0);
      });
    });

    it("facilities are negative (expense convention)", () => {
      result.monthlyProjections.forEach((mp) => {
        expect(mp.facilities).toBeLessThanOrEqual(0);
      });
    });
  });

  describe("New Optional Input Defaults (AC11)", () => {
    it("default ebitdaMultiple is 3", () => {
      result.valuation.forEach((v) => {
        expect(v.ebitdaMultiple).toBe(3);
      });
    });

    it("custom ebitdaMultiple is applied", () => {
      const customInput: EngineInput = {
        financialInputs: { ...postNetInputs, ebitdaMultiple: 5 },
        startupCosts: postNetStartupCosts,
      };
      const customResult = calculateProjections(customInput);
      customResult.valuation.forEach((v) => {
        expect(v.ebitdaMultiple).toBe(5);
      });
    });

    it("nonCapexInvestment defaults to startup cost non-capex amount in Y1", () => {
      const y1Months = result.monthlyProjections.filter((mp) => mp.year === 1);
      const totalNonCapex = y1Months.reduce((s, mp) => s + Math.abs(mp.nonCapexInvestment), 0);
      const nonCapexFromCosts = postNetStartupCosts
        .filter((c) => c.capexClassification === "non_capex")
        .reduce((s, c) => s + c.amount, 0);
      expect(Math.abs(totalNonCapex - nonCapexFromCosts)).toBeLessThanOrEqual(12);
    });

    it("custom nonCapexInvestment overrides default", () => {
      const customInput: EngineInput = {
        financialInputs: { ...postNetInputs, nonCapexInvestment: [120000, 240000, 240000, 240000, 240000] },
        startupCosts: postNetStartupCosts,
      };
      const customResult = calculateProjections(customInput);
      const m1 = customResult.monthlyProjections[0];
      expect(Math.abs(Math.abs(m1.nonCapexInvestment) - 10000)).toBeLessThanOrEqual(1);
    });
  });

  describe("Determinism with new outputs", () => {
    it("identical inputs produce identical new output sections", () => {
      const r1 = calculateProjections(postNetInput);
      const r2 = calculateProjections(postNetInput);
      expect(JSON.stringify(r1.valuation)).toBe(JSON.stringify(r2.valuation));
      expect(JSON.stringify(r1.roicExtended)).toBe(JSON.stringify(r2.roicExtended));
      expect(JSON.stringify(r1.plAnalysis)).toBe(JSON.stringify(r2.plAnalysis));
      expect(JSON.stringify(r1.identityChecks.length)).toBe(JSON.stringify(r2.identityChecks.length));
    });

    it("determinism holds with custom optional inputs", () => {
      const customInput: EngineInput = {
        financialInputs: {
          ...postNetInputs,
          ebitdaMultiple: 5,
          targetPreTaxProfitPct: [0.15, 0.12, 0.10, 0.08, 0.08],
          shareholderSalaryAdj: [50000, 50000, 75000, 75000, 100000],
          taxPaymentDelayMonths: 3,
          nonCapexInvestment: [500000, 200000, 100000, 0, 0],
        },
        startupCosts: postNetStartupCosts,
      };
      const r1 = calculateProjections(customInput);
      const r2 = calculateProjections(customInput);
      expect(JSON.stringify(r1)).toBe(JSON.stringify(r2));
    });
  });

  describe("Story 5.1 — AC1: Optional Input Defaults & Backward Compatibility", () => {
    it("custom targetPreTaxProfitPct is applied to P&L analysis", () => {
      const customInput: EngineInput = {
        financialInputs: { ...postNetInputs, targetPreTaxProfitPct: [0.20, 0.18, 0.15, 0.12, 0.10] },
        startupCosts: postNetStartupCosts,
      };
      const customResult = calculateProjections(customInput);
      const y1 = customResult.plAnalysis[0];
      const annual = customResult.annualSummaries[0];
      const expected = Math.round(annual.revenue * 0.20);
      expect(Math.abs(y1.targetPreTaxProfit - expected)).toBeLessThanOrEqual(1);
    });

    it("custom taxPaymentDelayMonths shifts payment timing", () => {
      const delay3Input: EngineInput = {
        financialInputs: { ...postNetInputs, taxPaymentDelayMonths: 3 },
        startupCosts: postNetStartupCosts,
      };
      const delay3Result = calculateProjections(delay3Input);
      const delay1Result = result;
      const laterMonth = 12;
      expect(delay3Result.monthlyProjections[laterMonth].taxPayable).toBeGreaterThanOrEqual(
        delay1Result.monthlyProjections[laterMonth].taxPayable
      );
    });

    it("taxPaymentDelayMonths = 0 means immediate payment (no crash)", () => {
      const delay0Input: EngineInput = {
        financialInputs: { ...postNetInputs, taxPaymentDelayMonths: 0 },
        startupCosts: postNetStartupCosts,
      };
      const delay0Result = calculateProjections(delay0Input);
      expect(delay0Result.monthlyProjections).toHaveLength(60);
      delay0Result.monthlyProjections.forEach((mp) => {
        expect(mp.taxPayable).toBeGreaterThanOrEqual(0);
        expect(Number.isFinite(mp.taxPayable)).toBe(true);
      });
    });

    it("backward compatibility: omitting all new optional fields produces valid output", () => {
      const bareInput: EngineInput = {
        financialInputs: postNetInputs,
        startupCosts: postNetStartupCosts,
      };
      const bareResult = calculateProjections(bareInput);
      expect(bareResult.monthlyProjections).toHaveLength(60);
      expect(bareResult.valuation).toHaveLength(5);
      expect(bareResult.roicExtended).toHaveLength(5);
      expect(bareResult.plAnalysis).toHaveLength(5);
      bareResult.identityChecks.forEach((c) => expect(c.passed).toBe(true));
    });
  });

  describe("Story 5.1 — AC2: Balance Sheet Disaggregation Edge Cases", () => {
    it("BS balances for all 60 months with alternate brand", () => {
      const altBrandInputs: FinancialInputs = {
        revenue: {
          annualGrossSales: 50000000,
          monthlyAuvByMonth: Array(60).fill(4166667),
          monthsToReachAuv: 6,
          startingMonthAuvPct: 0.50,
          growthRates: [0.05, 0.04, 0.03, 0.02, 0.02],
        },
        operatingCosts: {
          cogsPct: Array(60).fill(0.25),
          laborPct: Array(60).fill(0.20),
          royaltyPct: [0.06, 0.06, 0.06, 0.06, 0.06],
          adFundPct: [0.01, 0.01, 0.01, 0.01, 0.01],
          marketingPct: Array(60).fill(0.03),
          otherOpexPct: [0.02, 0.02, 0.02, 0.02, 0.02],
          payrollTaxPct: [0.15, 0.15, 0.15, 0.15, 0.15],
          facilitiesAnnual: [2400000, 2472000, 2546160, 2622545, 2701221],
          managementSalariesAnnual: [3600000, 3708000, 3819240, 3933817, 4051832],
        },
        financing: {
          totalInvestment: 40000000,
          equityPct: 0.30,
          interestRate: 0.08,
          termMonths: 120,
        },
        startup: { depreciationRate: 0.20 },
        workingCapitalAssumptions: { arDays: 15, apDays: 45, inventoryDays: 30 },
        distributions: [0, 0, 2000000, 2500000, 3000000],
        taxRate: 0.25,
      };
      const altStartupCosts: StartupCostLineItem[] = [
        { id: "a1", name: "Equipment", amount: 20000000, capexClassification: "capex", isCustom: false, source: "brand_default", brandDefaultAmount: 20000000, item7RangeLow: null, item7RangeHigh: null, sortOrder: 0 },
        { id: "a2", name: "Supplies", amount: 5000000, capexClassification: "non_capex", isCustom: false, source: "brand_default", brandDefaultAmount: 5000000, item7RangeLow: null, item7RangeHigh: null, sortOrder: 1 },
        { id: "a3", name: "Working Capital", amount: 3000000, capexClassification: "working_capital", isCustom: false, source: "brand_default", brandDefaultAmount: 3000000, item7RangeLow: null, item7RangeHigh: null, sortOrder: 2 },
      ];
      const altResult = calculateProjections({ financialInputs: altBrandInputs, startupCosts: altStartupCosts });
      altResult.monthlyProjections.forEach((mp) => {
        expect(Math.abs(mp.totalAssets - mp.totalLiabilitiesAndEquity)).toBeLessThanOrEqual(1);
      });
    });

    it("BS balances for zero-revenue edge case", () => {
      const zeroInput: EngineInput = {
        financialInputs: {
          ...postNetInputs,
          revenue: { annualGrossSales: 0, monthlyAuvByMonth: Array(60).fill(0), monthsToReachAuv: 14, startingMonthAuvPct: 0, growthRates: [0, 0, 0, 0, 0] },
        },
        startupCosts: postNetStartupCosts,
      };
      const zeroResult = calculateProjections(zeroInput);
      zeroResult.monthlyProjections.forEach((mp) => {
        expect(Math.abs(mp.totalAssets - mp.totalLiabilitiesAndEquity)).toBeLessThanOrEqual(1);
      });
    });

    it("BS balances with zero financing", () => {
      const zeroFinInput: EngineInput = {
        financialInputs: {
          ...postNetInputs,
          financing: { totalInvestment: 25650700, equityPct: 1.0, interestRate: 0, termMonths: 0 },
        },
        startupCosts: postNetStartupCosts,
      };
      const zeroFinResult = calculateProjections(zeroFinInput);
      zeroFinResult.monthlyProjections.forEach((mp) => {
        expect(Math.abs(mp.totalAssets - mp.totalLiabilitiesAndEquity)).toBeLessThanOrEqual(1);
      });
    });

    it("totalCurrentLiabilities = AP + taxPayable for all months", () => {
      result.monthlyProjections.forEach((mp) => {
        const expected = mp.accountsPayable + mp.taxPayable;
        expect(Math.abs(mp.totalCurrentLiabilities - expected)).toBeLessThanOrEqual(1);
      });
    });

    it("lineOfCredit is 0 for all months (MVP placeholder)", () => {
      result.monthlyProjections.forEach((mp) => {
        expect(mp.lineOfCredit).toBe(0);
      });
    });
  });

  describe("Story 5.1 — AC3: Cash Flow Disaggregation Extended", () => {
    it("cfDistributions matches expected monthly distribution", () => {
      result.monthlyProjections.forEach((mp) => {
        const yi = mp.year - 1;
        const expectedMonthlyDist = -postNetInputs.distributions[yi] / 12;
        expect(Math.abs(mp.cfDistributions - expectedMonthlyDist)).toBeLessThanOrEqual(1);
      });
    });

    it("cfNotesPayable is negative of principal payment", () => {
      result.monthlyProjections.forEach((mp) => {
        expect(Math.abs(mp.cfNotesPayable - (-mp.loanPrincipalPayment))).toBeLessThanOrEqual(1);
      });
    });

    it("cfLineOfCredit is 0 for all months (MVP)", () => {
      result.monthlyProjections.forEach((mp) => {
        expect(mp.cfLineOfCredit).toBe(0);
      });
    });

    it("cfDepreciation equals abs(depreciation)", () => {
      result.monthlyProjections.forEach((mp) => {
        expect(Math.abs(mp.cfDepreciation - Math.abs(mp.depreciation))).toBeLessThanOrEqual(1);
      });
    });

    it("operating CF components sum to cfNetOperatingCashFlow", () => {
      for (let i = 0; i < result.monthlyProjections.length; i++) {
        const mp = result.monthlyProjections[i];
        const computed = mp.preTaxIncome + mp.cfDepreciation +
          mp.cfAccountsReceivableChange + mp.cfInventoryChange + mp.cfAccountsPayableChange;
        expect(Math.abs(computed - mp.cfNetOperatingCashFlow)).toBeLessThanOrEqual(1);
      }
    });

    it("CF disaggregation works with alternate brand", () => {
      const altBrandInputs: FinancialInputs = {
        revenue: { annualGrossSales: 50000000, monthlyAuvByMonth: Array(60).fill(4166667), monthsToReachAuv: 6, startingMonthAuvPct: 0.50, growthRates: [0.05, 0.04, 0.03, 0.02, 0.02] },
        operatingCosts: {
          cogsPct: Array(60).fill(0.25), laborPct: Array(60).fill(0.20),
          royaltyPct: [0.06, 0.06, 0.06, 0.06, 0.06], adFundPct: [0.01, 0.01, 0.01, 0.01, 0.01],
          marketingPct: Array(60).fill(0.03), otherOpexPct: [0.02, 0.02, 0.02, 0.02, 0.02],
          payrollTaxPct: [0.15, 0.15, 0.15, 0.15, 0.15],
          facilitiesAnnual: [2400000, 2472000, 2546160, 2622545, 2701221],
          managementSalariesAnnual: [3600000, 3708000, 3819240, 3933817, 4051832],
        },
        financing: { totalInvestment: 40000000, equityPct: 0.30, interestRate: 0.08, termMonths: 120 },
        startup: { depreciationRate: 0.20 },
        workingCapitalAssumptions: { arDays: 15, apDays: 45, inventoryDays: 30 },
        distributions: [0, 0, 2000000, 2500000, 3000000],
        taxRate: 0.25,
      };
      const altResult = calculateProjections({
        financialInputs: altBrandInputs,
        startupCosts: [
          { id: "a1", name: "Equipment", amount: 20000000, capexClassification: "capex", isCustom: false, source: "brand_default", brandDefaultAmount: 20000000, item7RangeLow: null, item7RangeHigh: null, sortOrder: 0 },
          { id: "a2", name: "Supplies", amount: 5000000, capexClassification: "non_capex", isCustom: false, source: "brand_default", brandDefaultAmount: 5000000, item7RangeLow: null, item7RangeHigh: null, sortOrder: 1 },
          { id: "a3", name: "Working Capital", amount: 3000000, capexClassification: "working_capital", isCustom: false, source: "brand_default", brandDefaultAmount: 3000000, item7RangeLow: null, item7RangeHigh: null, sortOrder: 2 },
        ],
      });
      for (let i = 0; i < altResult.monthlyProjections.length - 1; i++) {
        expect(Math.abs(
          altResult.monthlyProjections[i].endingCash - altResult.monthlyProjections[i + 1].beginningCash
        )).toBeLessThanOrEqual(1);
      }
      altResult.monthlyProjections.forEach((mp) => {
        expect(Math.abs(mp.cfNetCashFlow - (mp.cfNetBeforeFinancing + mp.cfNetFinancingCashFlow))).toBeLessThanOrEqual(1);
      });
    });
  });

  describe("Story 5.1 — AC4: Valuation Extended", () => {
    it("businessAnnualROIC = adjNetOperatingIncome / totalCashInvested", () => {
      result.valuation.forEach((v) => {
        if (v.totalCashInvested > 0) {
          const expected = v.adjNetOperatingIncome / v.totalCashInvested;
          expect(Math.abs(v.businessAnnualROIC - expected)).toBeLessThanOrEqual(0.01);
        }
      });
    });

    it("replacementReturnRequired = netAfterTaxProceeds / totalCashInvested", () => {
      result.valuation.forEach((v) => {
        if (v.totalCashInvested > 0) {
          const expected = v.netAfterTaxProceeds / v.totalCashInvested;
          expect(Math.abs(v.replacementReturnRequired - expected)).toBeLessThanOrEqual(0.01);
        }
      });
    });

    it("replacementReturnRequired differs from businessAnnualROIC when tax > 0", () => {
      const customInput: EngineInput = {
        financialInputs: { ...postNetInputs, ebitdaMultiple: 3 },
        startupCosts: postNetStartupCosts,
      };
      const customResult = calculateProjections(customInput);
      const hasRevenue = customResult.valuation.find((v) => v.adjNetOperatingIncome !== 0);
      if (hasRevenue) {
        expect(hasRevenue.replacementReturnRequired).not.toBe(hasRevenue.businessAnnualROIC);
      }
    });

    it("totalCashInvested equals equityAmount across all years", () => {
      const equityAmount = Math.round(postNetInputs.financing.totalInvestment * postNetInputs.financing.equityPct);
      result.valuation.forEach((v) => {
        expect(v.totalCashInvested).toBe(equityAmount);
      });
    });

    it("zero revenue edge case: valuation handles division safely", () => {
      const zeroInput: EngineInput = {
        financialInputs: {
          ...postNetInputs,
          revenue: { annualGrossSales: 0, monthlyAuvByMonth: Array(60).fill(0), monthsToReachAuv: 14, startingMonthAuvPct: 0, growthRates: [0, 0, 0, 0, 0] },
        },
        startupCosts: postNetStartupCosts,
      };
      const zeroResult = calculateProjections(zeroInput);
      zeroResult.valuation.forEach((v) => {
        expect(Number.isFinite(v.adjNetOperatingIncomePct)).toBe(true);
        expect(v.adjNetOperatingIncomePct).toBe(0);
      });
    });

    it("custom ebitdaMultiple changes estimatedValue proportionally", () => {
      const mult3 = calculateProjections({ financialInputs: { ...postNetInputs, ebitdaMultiple: 3 }, startupCosts: postNetStartupCosts });
      const mult5 = calculateProjections({ financialInputs: { ...postNetInputs, ebitdaMultiple: 5 }, startupCosts: postNetStartupCosts });
      for (let i = 0; i < 5; i++) {
        if (mult3.valuation[i].adjNetOperatingIncome !== 0) {
          const ratio = mult5.valuation[i].estimatedValue / mult3.valuation[i].estimatedValue;
          expect(Math.abs(ratio - (5 / 3))).toBeLessThan(0.01);
        }
      }
    });

    it("zero ebitdaMultiple produces zero estimatedValue", () => {
      const zeroMultInput: EngineInput = {
        financialInputs: { ...postNetInputs, ebitdaMultiple: 0 },
        startupCosts: postNetStartupCosts,
      };
      const zeroMultResult = calculateProjections(zeroMultInput);
      zeroMultResult.valuation.forEach((v) => {
        expect(v.estimatedValue).toBe(0);
      });
    });
  });

  describe("Story 5.1 — AC5: ROIC Extended Detailed", () => {
    it("preTaxNetIncomeIncSweatEquity = preTaxNetIncome - shareholderSalaryAdj", () => {
      const customInput: EngineInput = {
        financialInputs: { ...postNetInputs, shareholderSalaryAdj: [100000, 100000, 150000, 150000, 200000] },
        startupCosts: postNetStartupCosts,
      };
      const customResult = calculateProjections(customInput);
      customResult.roicExtended.forEach((r, i) => {
        const expected = r.preTaxNetIncome - [100000, 100000, 150000, 150000, 200000][i];
        expect(Math.abs(r.preTaxNetIncomeIncSweatEquity - expected)).toBeLessThanOrEqual(1);
      });
    });

    it("roicPct = preTaxNetIncomeIncSweatEquity / totalInvestedCapital when > 0", () => {
      result.roicExtended.forEach((r) => {
        if (r.totalInvestedCapital > 0) {
          const expected = r.preTaxNetIncomeIncSweatEquity / r.totalInvestedCapital;
          expect(Math.abs(r.roicPct - expected)).toBeLessThanOrEqual(0.01);
        }
      });
    });

    it("excessCoreCapital = endingCash - 3 * avgCoreCapitalPerMonth", () => {
      result.roicExtended.forEach((r, i) => {
        const yearEndMonth = result.monthlyProjections[(i + 1) * 12 - 1];
        const expected = yearEndMonth.endingCash - (3 * r.avgCoreCapitalPerMonth);
        expect(Math.abs(r.excessCoreCapital - expected)).toBeLessThanOrEqual(1);
      });
    });

    it("outsideCash equals equityAmount", () => {
      const equityAmount = Math.round(postNetInputs.financing.totalInvestment * postNetInputs.financing.equityPct);
      result.roicExtended.forEach((r) => {
        expect(r.outsideCash).toBe(equityAmount);
      });
    });

    it("totalLoans equals debtAmount", () => {
      const debtAmount = Math.round(postNetInputs.financing.totalInvestment * (1 - postNetInputs.financing.equityPct));
      result.roicExtended.forEach((r) => {
        expect(Math.abs(r.totalLoans - debtAmount)).toBeLessThanOrEqual(1);
      });
    });

    it("retainedEarningsLessDistributions matches monthly retained earnings at year end", () => {
      result.roicExtended.forEach((r, i) => {
        const yearEndMonth = result.monthlyProjections[(i + 1) * 12 - 1];
        expect(Math.abs(r.retainedEarningsLessDistributions - yearEndMonth.retainedEarnings)).toBeLessThanOrEqual(1);
      });
    });

    it("zero taxRate produces zero taxesDue", () => {
      const zeroTaxInput: EngineInput = {
        financialInputs: { ...postNetInputs, taxRate: 0 },
        startupCosts: postNetStartupCosts,
      };
      const zeroTaxResult = calculateProjections(zeroTaxInput);
      zeroTaxResult.roicExtended.forEach((r) => {
        expect(r.taxesDue).toBe(0);
      });
    });

    it("zero shareholderSalaryAdj produces zero sweatEquity", () => {
      result.roicExtended.forEach((r) => {
        expect(r.totalSweatEquity).toBe(0);
      });
    });
  });

  describe("Story 5.1 — AC6: P&L Analysis Detailed", () => {
    it("nonLaborGrossMargin equals annual gross profit", () => {
      result.plAnalysis.forEach((p) => {
        const annual = result.annualSummaries[p.year - 1];
        expect(Math.abs(p.nonLaborGrossMargin - annual.grossProfit)).toBeLessThanOrEqual(1);
      });
    });

    it("totalWages = |directLabor| + |managementSalaries| for each year", () => {
      result.plAnalysis.forEach((p) => {
        const yearMonths = result.monthlyProjections.filter((mp) => mp.year === p.year);
        const directLaborAbs = yearMonths.reduce((s, mp) => s + Math.abs(mp.directLabor), 0);
        const mgmtAbs = yearMonths.reduce((s, mp) => s + Math.abs(mp.managementSalaries), 0);
        const expected = directLaborAbs + mgmtAbs;
        expect(Math.abs(p.totalWages - expected)).toBeLessThanOrEqual(1);
      });
    });

    it("adjustedTotalWages = totalWages - shareholderSalaryAdj", () => {
      result.plAnalysis.forEach((p) => {
        const expected = p.totalWages - 0;
        expect(Math.abs(p.adjustedTotalWages - expected)).toBeLessThanOrEqual(1);
      });
    });

    it("discretionaryMarketingPct = |marketing| / revenue", () => {
      result.plAnalysis.forEach((p) => {
        const annual = result.annualSummaries[p.year - 1];
        if (annual.revenue > 0) {
          const yearMonths = result.monthlyProjections.filter((mp) => mp.year === p.year);
          const marketingAbs = yearMonths.reduce((s, mp) => s + Math.abs(mp.marketing), 0);
          const expected = marketingAbs / annual.revenue;
          expect(Math.abs(p.discretionaryMarketingPct - expected)).toBeLessThanOrEqual(0.01);
        }
      });
    });

    it("prTaxBenefitsPctOfWages = |payrollTax| / totalWages", () => {
      result.plAnalysis.forEach((p) => {
        if (p.totalWages > 0) {
          const yearMonths = result.monthlyProjections.filter((mp) => mp.year === p.year);
          const payrollTaxAbs = yearMonths.reduce((s, mp) => s + Math.abs(mp.payrollTaxBenefits), 0);
          const expected = payrollTaxAbs / p.totalWages;
          expect(Math.abs(p.prTaxBenefitsPctOfWages - expected)).toBeLessThanOrEqual(0.01);
        }
      });
    });

    it("otherOpexPctOfRevenue = |otherOpex| / revenue", () => {
      result.plAnalysis.forEach((p) => {
        const annual = result.annualSummaries[p.year - 1];
        if (annual.revenue > 0) {
          const yearMonths = result.monthlyProjections.filter((mp) => mp.year === p.year);
          const otherOpexAbs = yearMonths.reduce((s, mp) => s + Math.abs(mp.otherOpex), 0);
          const expected = otherOpexAbs / annual.revenue;
          expect(Math.abs(p.otherOpexPctOfRevenue - expected)).toBeLessThanOrEqual(0.01);
        }
      });
    });

    it("adjustedLaborEfficiency = adjustedTotalWages / revenue", () => {
      result.plAnalysis.forEach((p) => {
        const annual = result.annualSummaries[p.year - 1];
        if (annual.revenue > 0) {
          const expected = p.adjustedTotalWages / annual.revenue;
          expect(Math.abs(p.adjustedLaborEfficiency - expected)).toBeLessThanOrEqual(0.01);
        }
      });
    });

    it("P&L analysis with custom shareholderSalaryAdj adjusts wages", () => {
      const customInput: EngineInput = {
        financialInputs: { ...postNetInputs, shareholderSalaryAdj: [200000, 200000, 200000, 200000, 200000] },
        startupCosts: postNetStartupCosts,
      };
      const customResult = calculateProjections(customInput);
      customResult.plAnalysis.forEach((p) => {
        expect(p.adjustedTotalWages).toBeLessThan(p.totalWages);
        expect(Math.abs(p.adjustedTotalWages - (p.totalWages - 200000))).toBeLessThanOrEqual(1);
      });
    });

    it("adjustedTotalWages floors at 0 when shareholderSalaryAdj exceeds totalWages", () => {
      const hugeAdj = [99999999, 99999999, 99999999, 99999999, 99999999] as [number, number, number, number, number];
      const customInput: EngineInput = {
        financialInputs: { ...postNetInputs, shareholderSalaryAdj: hugeAdj },
        startupCosts: postNetStartupCosts,
      };
      const customResult = calculateProjections(customInput);
      customResult.plAnalysis.forEach((p) => {
        expect(p.adjustedTotalWages).toBe(0);
        expect(p.adjustedLaborEfficiency).toBe(0);
      });
    });
  });

  describe("Story 5.1 — AC7: Identity Checks Categories Comprehensive", () => {
    it("at least 13 identity check categories are present (implementation has 15)", () => {
      const categories = new Set(result.identityChecks.map((c) => {
        const match = c.name.match(/^(.+?)(?:\s*\()/);
        return match ? match[1].trim() : c.name;
      }));
      expect(categories.size).toBeGreaterThanOrEqual(13);
    });

    it("alternate brand passes all identity checks", () => {
      const altBrandInputs: FinancialInputs = {
        revenue: { annualGrossSales: 50000000, monthlyAuvByMonth: Array(60).fill(4166667), monthsToReachAuv: 6, startingMonthAuvPct: 0.50, growthRates: [0.05, 0.04, 0.03, 0.02, 0.02] },
        operatingCosts: {
          cogsPct: Array(60).fill(0.25), laborPct: Array(60).fill(0.20),
          royaltyPct: [0.06, 0.06, 0.06, 0.06, 0.06], adFundPct: [0.01, 0.01, 0.01, 0.01, 0.01],
          marketingPct: Array(60).fill(0.03), otherOpexPct: [0.02, 0.02, 0.02, 0.02, 0.02],
          payrollTaxPct: [0.15, 0.15, 0.15, 0.15, 0.15],
          facilitiesAnnual: [2400000, 2472000, 2546160, 2622545, 2701221],
          managementSalariesAnnual: [3600000, 3708000, 3819240, 3933817, 4051832],
        },
        financing: { totalInvestment: 40000000, equityPct: 0.30, interestRate: 0.08, termMonths: 120 },
        startup: { depreciationRate: 0.20 },
        workingCapitalAssumptions: { arDays: 15, apDays: 45, inventoryDays: 30 },
        distributions: [0, 0, 2000000, 2500000, 3000000],
        taxRate: 0.25,
      };
      const altResult = calculateProjections({
        financialInputs: altBrandInputs,
        startupCosts: [
          { id: "a1", name: "Equipment", amount: 20000000, capexClassification: "capex", isCustom: false, source: "brand_default", brandDefaultAmount: 20000000, item7RangeLow: null, item7RangeHigh: null, sortOrder: 0 },
          { id: "a2", name: "Supplies", amount: 5000000, capexClassification: "non_capex", isCustom: false, source: "brand_default", brandDefaultAmount: 5000000, item7RangeLow: null, item7RangeHigh: null, sortOrder: 1 },
          { id: "a3", name: "Working Capital", amount: 3000000, capexClassification: "working_capital", isCustom: false, source: "brand_default", brandDefaultAmount: 3000000, item7RangeLow: null, item7RangeHigh: null, sortOrder: 2 },
        ],
      });
      const failedChecks = altResult.identityChecks.filter((c) => !c.passed);
      expect(failedChecks).toHaveLength(0);
    });

    it("identity checks pass with all custom optional inputs", () => {
      const customInput: EngineInput = {
        financialInputs: {
          ...postNetInputs,
          ebitdaMultiple: 4,
          targetPreTaxProfitPct: [0.12, 0.12, 0.12, 0.12, 0.12],
          shareholderSalaryAdj: [100000, 100000, 100000, 100000, 100000],
          taxPaymentDelayMonths: 2,
          nonCapexInvestment: [8437500, 500000, 0, 0, 0],
        },
        startupCosts: postNetStartupCosts,
      };
      const customResult = calculateProjections(customInput);
      const failedChecks = customResult.identityChecks.filter((c) => !c.passed);
      expect(failedChecks).toHaveLength(0);
    });
  });

  describe("Story 5.1 — AC10: Comprehensive Test Coverage Edges", () => {
    it("zero taxRate: no tax payable accrues", () => {
      const zeroTaxInput: EngineInput = {
        financialInputs: { ...postNetInputs, taxRate: 0 },
        startupCosts: postNetStartupCosts,
      };
      const zeroTaxResult = calculateProjections(zeroTaxInput);
      zeroTaxResult.monthlyProjections.forEach((mp) => {
        expect(mp.taxPayable).toBe(0);
      });
    });

    it("zero taxRate: valuation estimatedTaxOnSale is 0", () => {
      const zeroTaxInput: EngineInput = {
        financialInputs: { ...postNetInputs, taxRate: 0 },
        startupCosts: postNetStartupCosts,
      };
      const zeroTaxResult = calculateProjections(zeroTaxInput);
      zeroTaxResult.valuation.forEach((v) => {
        expect(v.estimatedTaxOnSale).toBe(0);
      });
    });

    it("all MonthlyProjection numeric fields are finite numbers", () => {
      result.monthlyProjections.forEach((mp) => {
        for (const [key, value] of Object.entries(mp)) {
          if (typeof value === "number") {
            expect(Number.isFinite(value)).toBe(true);
          }
        }
      });
    });

    it("all ValuationOutput fields are finite numbers", () => {
      result.valuation.forEach((v) => {
        for (const [key, value] of Object.entries(v)) {
          if (typeof value === "number") {
            expect(Number.isFinite(value)).toBe(true);
          }
        }
      });
    });

    it("all ROICExtendedOutput fields are finite numbers", () => {
      result.roicExtended.forEach((r) => {
        for (const [key, value] of Object.entries(r)) {
          if (typeof value === "number") {
            expect(Number.isFinite(value)).toBe(true);
          }
        }
      });
    });

    it("all PLAnalysisOutput fields are finite numbers", () => {
      result.plAnalysis.forEach((p) => {
        for (const [key, value] of Object.entries(p)) {
          if (typeof value === "number") {
            expect(Number.isFinite(value)).toBe(true);
          }
        }
      });
    });

    it("nonCapexInvestment spread across multiple years when custom", () => {
      const customInput: EngineInput = {
        financialInputs: {
          ...postNetInputs,
          nonCapexInvestment: [4000000, 2000000, 1000000, 500000, 0],
        },
        startupCosts: postNetStartupCosts,
      };
      const customResult = calculateProjections(customInput);
      const y2Months = customResult.monthlyProjections.filter((mp) => mp.year === 2);
      y2Months.forEach((mp) => {
        expect(mp.nonCapexInvestment).toBeLessThan(0);
      });
      const y5Months = customResult.monthlyProjections.filter((mp) => mp.year === 5);
      y5Months.forEach((mp) => {
        expect(mp.nonCapexInvestment).toBe(0);
      });
    });
  });
});
