import { test, expect } from "@playwright/test";

const testBrandParams = {
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

const testStartupTemplate = [
  { id: "equip-1", name: "Equipment & Signage", default_amount: 126057, capex_classification: "capex", item7_range_low: 100000, item7_range_high: 150000, sort_order: 1 },
  { id: "noncapex-1", name: "Non-CapEx Investments", default_amount: 84375, capex_classification: "non_capex", item7_range_low: 50000, item7_range_high: 120000, sort_order: 2 },
  { id: "wc-1", name: "Working Capital", default_amount: 40000, capex_classification: "working_capital", item7_range_low: 20000, item7_range_high: 60000, sort_order: 3 },
];

function makeFieldValue(currentValue: number, source = "brand_default", isCustom = false) {
  return {
    currentValue,
    source,
    brandDefault: currentValue,
    item7Range: null,
    lastModifiedAt: null,
    isCustom,
  };
}

test.describe("Story 3.2: Brand Default Integration & Per-Field Metadata (E2E)", () => {
  let brandId: string;
  let userId: string;

  test.beforeEach(async ({ request }) => {
    await request.post("/api/auth/dev-login");

    const meRes = await request.get("/api/auth/me");
    const me = await meRes.json();
    userId = me.id;

    const brandName = `S32-Brand-${Date.now()}`;
    const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const brandRes = await request.post("/api/brands", {
      data: { name: brandName, slug },
    });
    const brand = await brandRes.json();
    brandId = brand.id;

    await request.put(`/api/brands/${brandId}/parameters`, {
      data: testBrandParams,
    });

    await request.put(`/api/brands/${brandId}/startup-cost-template`, {
      data: testStartupTemplate,
    });
  });

  test("plan created with financialInputs preserves per-field metadata through API round-trip", async ({ request }) => {
    const financialInputs = {
      revenue: {
        monthlyAuv: makeFieldValue(2686700),
        year1GrowthRate: makeFieldValue(0.13),
        year2GrowthRate: makeFieldValue(0.13),
        startingMonthAuvPct: makeFieldValue(0.08),
      },
      operatingCosts: {
        cogsPct: makeFieldValue(0.30),
        laborPct: makeFieldValue(0.17),
        rentMonthly: makeFieldValue(500000),
        utilitiesMonthly: makeFieldValue(80000),
        insuranceMonthly: makeFieldValue(50000),
        marketingPct: makeFieldValue(0.05),
        royaltyPct: makeFieldValue(0.05),
        adFundPct: makeFieldValue(0.02),
        otherMonthly: makeFieldValue(100000),
      },
      financing: {
        loanAmount: makeFieldValue(20000000),
        interestRate: makeFieldValue(0.105),
        loanTermMonths: makeFieldValue(144),
        downPaymentPct: makeFieldValue(0.20),
      },
      startupCapital: {
        workingCapitalMonths: makeFieldValue(3),
        depreciationYears: makeFieldValue(4),
      },
    };

    const createRes = await request.post("/api/plans", {
      data: {
        userId,
        brandId,
        name: `Metadata Test ${Date.now()}`,
        status: "draft",
        financialInputs,
      },
    });
    expect(createRes.status()).toBe(201);
    const plan = await createRes.json();

    const getRes = await request.get(`/api/plans/${plan.id}`);
    expect(getRes.status()).toBe(200);
    const fetched = await getRes.json();
    const fi = fetched.data.financialInputs;

    expect(fi.revenue.monthlyAuv.currentValue).toBe(2686700);
    expect(fi.revenue.monthlyAuv.source).toBe("brand_default");
    expect(fi.revenue.monthlyAuv.isCustom).toBe(false);
    expect(fi.revenue.monthlyAuv.brandDefault).toBe(2686700);
    expect(fi.operatingCosts.cogsPct.source).toBe("brand_default");
    expect(fi.financing.loanAmount.currentValue).toBe(20000000);
  });

  test("PATCH financialInputs with user_entry source persists metadata correctly", async ({ request }) => {
    const financialInputs = {
      revenue: {
        monthlyAuv: makeFieldValue(2686700),
        year1GrowthRate: makeFieldValue(0.13),
        year2GrowthRate: makeFieldValue(0.13),
        startingMonthAuvPct: makeFieldValue(0.08),
      },
      operatingCosts: {
        cogsPct: makeFieldValue(0.30),
        laborPct: makeFieldValue(0.17),
        rentMonthly: makeFieldValue(500000),
        utilitiesMonthly: makeFieldValue(80000),
        insuranceMonthly: makeFieldValue(50000),
        marketingPct: makeFieldValue(0.05),
        royaltyPct: makeFieldValue(0.05),
        adFundPct: makeFieldValue(0.02),
        otherMonthly: makeFieldValue(100000),
      },
      financing: {
        loanAmount: makeFieldValue(20000000),
        interestRate: makeFieldValue(0.105),
        loanTermMonths: makeFieldValue(144),
        downPaymentPct: makeFieldValue(0.20),
      },
      startupCapital: {
        workingCapitalMonths: makeFieldValue(3),
        depreciationYears: makeFieldValue(4),
      },
    };

    const createRes = await request.post("/api/plans", {
      data: { userId, brandId, name: `Edit Test ${Date.now()}`, status: "draft", financialInputs },
    });
    const plan = await createRes.json();

    const editedInputs = {
      ...financialInputs,
      revenue: {
        ...financialInputs.revenue,
        monthlyAuv: {
          currentValue: 3500000,
          source: "user_entry",
          brandDefault: 2686700,
          item7Range: null,
          lastModifiedAt: new Date().toISOString(),
          isCustom: true,
        },
      },
    };

    const patchRes = await request.patch(`/api/plans/${plan.id}`, {
      data: { financialInputs: editedInputs },
    });
    expect(patchRes.status()).toBe(200);
    const updated = await patchRes.json();
    const auv = updated.data.financialInputs.revenue.monthlyAuv;

    expect(auv.currentValue).toBe(3500000);
    expect(auv.source).toBe("user_entry");
    expect(auv.isCustom).toBe(true);
    expect(auv.brandDefault).toBe(2686700);
    expect(auv.lastModifiedAt).toBeDefined();
  });

  test("startup costs preserve brand defaults and support user edits", async ({ request }) => {
    const createRes = await request.post("/api/plans", {
      data: { userId, brandId, name: `SC Test ${Date.now()}`, status: "draft" },
    });
    const plan = await createRes.json();

    const resetRes = await request.post(`/api/plans/${plan.id}/startup-costs/reset`);
    expect(resetRes.status()).toBe(200);
    const defaults = await resetRes.json();

    expect(defaults.length).toBe(testStartupTemplate.length);
    for (const item of defaults) {
      expect(item.source).toBe("brand_default");
      expect(item.isCustom).toBe(false);
      expect(item.brandDefaultAmount).toBe(item.amount);
    }

    const editedCosts = defaults.map((c: any, i: number) =>
      i === 0
        ? { ...c, amount: 15000000, source: "user_entry" }
        : c
    );

    const putRes = await request.put(`/api/plans/${plan.id}/startup-costs`, {
      data: editedCosts,
    });
    expect(putRes.status()).toBe(200);
    const updatedCosts = await putRes.json();

    expect(updatedCosts[0].amount).toBe(15000000);
    expect(updatedCosts[0].source).toBe("user_entry");
    expect(updatedCosts[0].brandDefaultAmount).toBe(defaults[0].brandDefaultAmount);
    expect(updatedCosts[1].source).toBe("brand_default");
  });

  test("startup cost reset restores brand defaults after user edits", async ({ request }) => {
    const createRes = await request.post("/api/plans", {
      data: { userId, brandId, name: `Reset Test ${Date.now()}`, status: "draft" },
    });
    const plan = await createRes.json();

    const firstReset = await request.post(`/api/plans/${plan.id}/startup-costs/reset`);
    const defaults = await firstReset.json();

    const editedCosts = defaults.map((c: any) => ({
      ...c,
      amount: c.amount + 100000,
      source: "user_entry",
    }));
    await request.put(`/api/plans/${plan.id}/startup-costs`, { data: editedCosts });

    const secondReset = await request.post(`/api/plans/${plan.id}/startup-costs/reset`);
    expect(secondReset.status()).toBe(200);
    const restored = await secondReset.json();

    for (let i = 0; i < restored.length; i++) {
      expect(restored[i].source).toBe("brand_default");
      expect(restored[i].amount).toBe(restored[i].brandDefaultAmount);
    }
  });

  test("plan with financial inputs can compute financial outputs", async ({ request }) => {
    const financialInputs = {
      revenue: {
        monthlyAuv: makeFieldValue(2686700),
        year1GrowthRate: makeFieldValue(0.13),
        year2GrowthRate: makeFieldValue(0.13),
        startingMonthAuvPct: makeFieldValue(0.08),
      },
      operatingCosts: {
        cogsPct: makeFieldValue(0.30),
        laborPct: makeFieldValue(0.17),
        rentMonthly: makeFieldValue(500000),
        utilitiesMonthly: makeFieldValue(80000),
        insuranceMonthly: makeFieldValue(50000),
        marketingPct: makeFieldValue(0.05),
        royaltyPct: makeFieldValue(0.05),
        adFundPct: makeFieldValue(0.02),
        otherMonthly: makeFieldValue(100000),
      },
      financing: {
        loanAmount: makeFieldValue(20000000),
        interestRate: makeFieldValue(0.105),
        loanTermMonths: makeFieldValue(144),
        downPaymentPct: makeFieldValue(0.20),
      },
      startupCapital: {
        workingCapitalMonths: makeFieldValue(3),
        depreciationYears: makeFieldValue(4),
      },
    };

    const createRes = await request.post("/api/plans", {
      data: { userId, brandId, name: `Output Test ${Date.now()}`, status: "draft", financialInputs },
    });
    const plan = await createRes.json();

    await request.post(`/api/plans/${plan.id}/startup-costs/reset`);

    const outputRes = await request.get(`/api/plans/${plan.id}/outputs`);
    expect(outputRes.status()).toBe(200);
    const output = await outputRes.json();

    expect(output.data.monthlyProjections).toHaveLength(60);
    expect(output.data.annualSummaries).toHaveLength(5);
    expect(output.data.roiMetrics).toBeDefined();
    expect(output.data.roiMetrics.totalStartupInvestment).toBeGreaterThan(0);
    expect(output.data.annualSummaries[0].revenue).toBeGreaterThan(0);
  });
});
