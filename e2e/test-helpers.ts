import { type Page, type APIRequestContext, expect } from "@playwright/test";

export const PAYMORE_BRAND_ID = "038be465-5c39-4829-ad1a-158acad75cc8";
export const POSTNET_BRAND_ID = "b6d1a90e-8055-455b-8f6d-bdb079efb331";

export async function loginAsAdmin(request: APIRequestContext) {
  const res = await request.post("/api/auth/dev-login");
  expect(res.status()).toBe(200);
  const user = await res.json();
  return user;
}

export async function loginAsFranchisee(
  request: APIRequestContext,
  brandId: string = PAYMORE_BRAND_ID,
) {
  const res = await request.post("/api/auth/dev-login", {
    data: { role: "franchisee", brandId },
  });
  expect(res.status()).toBe(200);
  const user = await res.json();
  return user;
}

export async function loginAsFranchiseeUI(
  page: Page,
  brandId: string = PAYMORE_BRAND_ID,
) {
  await page.goto("/login");
  const brandTrigger = page.locator("[data-testid='select-dev-brand-trigger']");
  await expect(brandTrigger).toBeVisible({ timeout: 10_000 });
  await brandTrigger.click();
  const brandOption = page.locator(
    `[data-testid='select-dev-brand-option-${brandId}']`,
  );
  await expect(brandOption).toBeVisible({ timeout: 5_000 });
  await brandOption.click();
  await page.click("[data-testid='button-dev-login-franchisee']");
  await page.waitForURL("/", { timeout: 10_000 });
}

export async function loginAsAdminUI(page: Page) {
  await page.goto("/login");
  await page.click("[data-testid='button-dev-login-admin']");
  await page.waitForURL("/", { timeout: 10_000 });
}

export async function createTestPlan(
  request: APIRequestContext,
  opts: {
    userId: string;
    brandId?: string;
    name?: string;
    financialInputs?: any;
    quickStartCompleted?: boolean;
  },
) {
  const planRes = await request.post("/api/plans", {
    data: {
      userId: opts.userId,
      brandId: opts.brandId ?? PAYMORE_BRAND_ID,
      name: opts.name ?? `Test Plan ${Date.now()}`,
      status: "draft",
    },
  });
  expect(planRes.status()).toBe(201);
  const plan = await planRes.json();

  if (opts.financialInputs || opts.quickStartCompleted) {
    const patchData: any = {};
    if (opts.quickStartCompleted) patchData.quickStartCompleted = true;
    if (opts.financialInputs) patchData.financialInputs = opts.financialInputs;
    await request.patch(`/api/plans/${plan.id}`, { data: patchData });
  }

  return plan;
}

export async function deleteTestPlan(
  request: APIRequestContext,
  planId: string,
) {
  await request.delete(`/api/plans/${planId}`);
}

export async function deleteTestBrand(
  request: APIRequestContext,
  brandId: string,
) {
  const plansRes = await request.get("/api/plans");
  if (plansRes.ok()) {
    const plans = await plansRes.json();
    for (const plan of plans) {
      if (plan.brandId === brandId) {
        await request.delete(`/api/plans/${plan.id}`);
      }
    }
  }
}

export function makeField(
  value: number,
  item7Range?: { min: number; max: number } | null,
) {
  return {
    currentValue: value,
    brandDefault: value,
    source: "brand_default" as const,
    isCustom: false,
    lastModifiedAt: null,
    item7Range: item7Range ?? null,
  };
}

export function makeFieldArray5(value: number) {
  return Array.from({ length: 5 }, () => makeField(value));
}

export function buildMinimalFinancialInputs() {
  return {
    revenue: {
      monthlyAuv: makeField(5000_00),
      year1GrowthRate: makeField(0.05),
      year2GrowthRate: makeField(0.03),
      startingMonthAuvPct: makeField(0.6),
    },
    operatingCosts: {
      cogsPct: makeField(0.3),
      laborPct: makeField(0.25),
      rentMonthly: makeField(3000_00),
      utilitiesMonthly: makeField(500_00),
      insuranceMonthly: makeField(200_00),
      marketingPct: makeField(0.02),
      royaltyPct: makeField(0.06),
      adFundPct: makeField(0.02),
      otherMonthly: makeField(300_00),
    },
    financing: {
      loanAmount: makeField(150000_00),
      interestRate: makeField(0.065),
      loanTermMonths: makeField(84),
      downPaymentPct: makeField(0.2),
    },
    startupCapital: {
      workingCapitalMonths: makeField(3),
      depreciationYears: makeField(10),
    },
  };
}

export function buildNewFormatFinancialInputs() {
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
