import { test, expect } from "@playwright/test";

function makeField(value: number) {
  return {
    currentValue: value,
    brandDefault: value,
    source: "brand_default" as const,
    isCustom: false,
    lastModifiedAt: null,
    item7Range: null,
  };
}

function makeFieldArray5(value: number) {
  return Array.from({ length: 5 }, () => makeField(value));
}

function buildNewFormatFinancialInputs() {
  const facilitiesDecomposition = {
    rent: makeFieldArray5(6000000),
    utilities: makeFieldArray5(960000),
    telecomIt: makeFieldArray5(0),
    vehicleFleet: makeFieldArray5(0),
    insurance: makeFieldArray5(600000),
  };
  const facilitiesAnnual = Array.from({ length: 5 }, (_, i) => {
    const total =
      facilitiesDecomposition.rent[i].currentValue +
      facilitiesDecomposition.utilities[i].currentValue +
      facilitiesDecomposition.telecomIt[i].currentValue +
      facilitiesDecomposition.vehicleFleet[i].currentValue +
      facilitiesDecomposition.insurance[i].currentValue;
    return makeField(total);
  });

  return {
    revenue: {
      monthlyAuv: makeField(2686700),
      growthRates: [
        makeField(0.13),
        makeField(0.13),
        makeField(0.13),
        makeField(0.13),
        makeField(0.13),
      ],
      startingMonthAuvPct: makeField(0.08),
    },
    operatingCosts: {
      royaltyPct: makeFieldArray5(0.05),
      adFundPct: makeFieldArray5(0.02),
      cogsPct: makeFieldArray5(0.3),
      laborPct: makeFieldArray5(0.17),
      facilitiesAnnual,
      facilitiesDecomposition,
      marketingPct: makeFieldArray5(0.05),
      managementSalariesAnnual: makeFieldArray5(0),
      payrollTaxPct: makeFieldArray5(0.2),
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
      downPaymentPct: makeField(0.2),
    },
    startupCapital: {
      workingCapitalMonths: makeField(3),
      depreciationYears: makeField(4),
    },
  };
}

test.describe("Story 7.1a: Data Model Restructuring & Migration", () => {
  let brandId: string;
  let userId: string;

  test.beforeEach(async ({ request }) => {
    await request.post("/api/auth/dev-login");
    const meRes = await request.get("/api/auth/me");
    const me = await meRes.json();
    userId = me.id;

    const brandName = `71aBrand-${Date.now()}`;
    const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const brandRes = await request.post("/api/brands", {
      data: { name: brandName, slug },
    });
    const brand = await brandRes.json();
    brandId = brand.id;
  });

  test("AC-1: PlanFinancialInputs stores per-year arrays correctly via API", async ({
    request,
  }) => {
    const planRes = await request.post("/api/plans", {
      data: {
        userId,
        brandId,
        name: `AC1-PerYear-${Date.now()}`,
        status: "draft",
      },
    });
    const plan = await planRes.json();

    const financialInputs = buildNewFormatFinancialInputs();
    financialInputs.operatingCosts.cogsPct[2].currentValue = 0.28;

    const patchRes = await request.patch(`/api/plans/${plan.id}`, {
      data: { quickStartCompleted: true, financialInputs },
    });
    expect(patchRes.status()).toBe(200);

    const getRes = await request.get(`/api/plans/${plan.id}`);
    expect(getRes.status()).toBe(200);
    const fetched = (await getRes.json()).data;

    expect(fetched.financialInputs.operatingCosts.cogsPct).toHaveLength(5);
    expect(fetched.financialInputs.operatingCosts.cogsPct[0].currentValue).toBe(0.3);
    expect(fetched.financialInputs.operatingCosts.cogsPct[2].currentValue).toBe(0.28);

    expect(fetched.financialInputs.revenue.growthRates).toHaveLength(5);

    expect(fetched.financialInputs.operatingCosts.facilitiesAnnual).toHaveLength(5);
    expect(fetched.financialInputs.operatingCosts.facilitiesDecomposition.rent).toHaveLength(5);
    expect(fetched.financialInputs.operatingCosts.facilitiesDecomposition.utilities).toHaveLength(5);
    expect(fetched.financialInputs.operatingCosts.facilitiesDecomposition.telecomIt).toHaveLength(5);
    expect(fetched.financialInputs.operatingCosts.facilitiesDecomposition.vehicleFleet).toHaveLength(5);
    expect(fetched.financialInputs.operatingCosts.facilitiesDecomposition.insurance).toHaveLength(5);
  });

  test("AC-1: New field categories exist in persisted data", async ({
    request,
  }) => {
    const planRes = await request.post("/api/plans", {
      data: {
        userId,
        brandId,
        name: `AC1-NewFields-${Date.now()}`,
        status: "draft",
      },
    });
    const plan = await planRes.json();

    const financialInputs = buildNewFormatFinancialInputs();
    await request.patch(`/api/plans/${plan.id}`, {
      data: { quickStartCompleted: true, financialInputs },
    });

    const getRes = await request.get(`/api/plans/${plan.id}`);
    const fetched = (await getRes.json()).data;
    const fi = fetched.financialInputs;

    expect(fi.profitabilityAndDistributions).toBeDefined();
    expect(fi.profitabilityAndDistributions.targetPreTaxProfitPct).toHaveLength(5);
    expect(fi.profitabilityAndDistributions.shareholderSalaryAdj).toHaveLength(5);
    expect(fi.profitabilityAndDistributions.distributions).toHaveLength(5);
    expect(fi.profitabilityAndDistributions.nonCapexInvestment).toHaveLength(5);

    expect(fi.workingCapitalAndValuation).toBeDefined();
    expect(fi.workingCapitalAndValuation.arDays.currentValue).toBe(30);
    expect(fi.workingCapitalAndValuation.apDays.currentValue).toBe(60);
    expect(fi.workingCapitalAndValuation.inventoryDays.currentValue).toBe(60);
    expect(fi.workingCapitalAndValuation.taxPaymentDelayMonths.currentValue).toBe(0);
    expect(fi.workingCapitalAndValuation.ebitdaMultiple.currentValue).toBe(3.0);
  });

  test("AC-2: Migration is idempotent — re-saving new format data produces no changes", async ({
    request,
  }) => {
    const planRes = await request.post("/api/plans", {
      data: {
        userId,
        brandId,
        name: `AC2-Idempotent-${Date.now()}`,
        status: "draft",
      },
    });
    const plan = await planRes.json();

    const financialInputs = buildNewFormatFinancialInputs();
    await request.patch(`/api/plans/${plan.id}`, {
      data: { quickStartCompleted: true, financialInputs },
    });

    const get1 = await request.get(`/api/plans/${plan.id}`);
    const data1 = (await get1.json()).data;

    const get2 = await request.get(`/api/plans/${plan.id}`);
    const data2 = (await get2.json()).data;

    expect(data1.financialInputs.operatingCosts.cogsPct[0].currentValue)
      .toBe(data2.financialInputs.operatingCosts.cogsPct[0].currentValue);
    expect(data1.financialInputs.revenue.growthRates[0].currentValue)
      .toBe(data2.financialInputs.revenue.growthRates[0].currentValue);
  });

  test("AC-3: Per-year values round-trip through API correctly", async ({
    request,
  }) => {
    const planRes = await request.post("/api/plans", {
      data: {
        userId,
        brandId,
        name: `AC3-Roundtrip-${Date.now()}`,
        status: "draft",
      },
    });
    const plan = await planRes.json();

    const financialInputs = buildNewFormatFinancialInputs();
    financialInputs.revenue.growthRates[0].currentValue = 0.10;
    financialInputs.revenue.growthRates[1].currentValue = 0.08;
    financialInputs.revenue.growthRates[2].currentValue = 0.06;
    financialInputs.revenue.growthRates[3].currentValue = 0.04;
    financialInputs.revenue.growthRates[4].currentValue = 0.02;

    await request.patch(`/api/plans/${plan.id}`, {
      data: { quickStartCompleted: true, financialInputs },
    });

    const getRes = await request.get(`/api/plans/${plan.id}`);
    const fetched = (await getRes.json()).data;
    const gr = fetched.financialInputs.revenue.growthRates;

    expect(gr[0].currentValue).toBe(0.10);
    expect(gr[1].currentValue).toBe(0.08);
    expect(gr[2].currentValue).toBe(0.06);
    expect(gr[3].currentValue).toBe(0.04);
    expect(gr[4].currentValue).toBe(0.02);
  });

  test("AC-4: Sensitivity and scenario data survives per-year structure", async ({
    request,
  }) => {
    const planRes = await request.post("/api/plans", {
      data: {
        userId,
        brandId,
        name: `AC4-Sensitivity-${Date.now()}`,
        status: "draft",
      },
    });
    const plan = await planRes.json();

    const financialInputs = buildNewFormatFinancialInputs();
    financialInputs.operatingCosts.cogsPct[0].currentValue = 0.30;
    financialInputs.operatingCosts.cogsPct[1].currentValue = 0.28;
    financialInputs.operatingCosts.cogsPct[2].currentValue = 0.27;
    financialInputs.operatingCosts.cogsPct[3].currentValue = 0.26;
    financialInputs.operatingCosts.cogsPct[4].currentValue = 0.25;

    await request.patch(`/api/plans/${plan.id}`, {
      data: { quickStartCompleted: true, financialInputs },
    });

    const getRes = await request.get(`/api/plans/${plan.id}`);
    expect(getRes.status()).toBe(200);
    const fetched = (await getRes.json()).data;
    expect(fetched.financialInputs.operatingCosts.cogsPct[4].currentValue).toBe(0.25);
  });

  test("AC-5: New field defaults have correct initial values", async ({
    request,
  }) => {
    const planRes = await request.post("/api/plans", {
      data: {
        userId,
        brandId,
        name: `AC5-Defaults-${Date.now()}`,
        status: "draft",
      },
    });
    const plan = await planRes.json();

    const financialInputs = buildNewFormatFinancialInputs();
    await request.patch(`/api/plans/${plan.id}`, {
      data: { quickStartCompleted: true, financialInputs },
    });

    const getRes = await request.get(`/api/plans/${plan.id}`);
    const fetched = (await getRes.json()).data;
    const fi = fetched.financialInputs;

    for (let i = 0; i < 5; i++) {
      expect(fi.operatingCosts.managementSalariesAnnual[i].currentValue).toBe(0);
      expect(fi.profitabilityAndDistributions.targetPreTaxProfitPct[i].currentValue).toBe(0);
      expect(fi.profitabilityAndDistributions.shareholderSalaryAdj[i].currentValue).toBe(0);
      expect(fi.profitabilityAndDistributions.distributions[i].currentValue).toBe(0);
      expect(fi.profitabilityAndDistributions.nonCapexInvestment[i].currentValue).toBe(0);
    }
    expect(fi.operatingCosts.payrollTaxPct[0].currentValue).toBe(0.2);
    expect(fi.workingCapitalAndValuation.arDays.currentValue).toBe(30);
    expect(fi.workingCapitalAndValuation.apDays.currentValue).toBe(60);
    expect(fi.workingCapitalAndValuation.inventoryDays.currentValue).toBe(60);
  });
});
