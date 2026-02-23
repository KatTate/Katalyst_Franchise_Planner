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

function buildFinancialInputs() {
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

test.describe("Story 7.1d: Facilities Guided Decomposition & Other OpEx", () => {
  let planId: string;

  test.beforeEach(async ({ request }) => {
    await request.post("/api/auth/dev-login");
    const meRes = await request.get("/api/auth/me");
    const me = await meRes.json();

    const brandName = `71dBrand-${Date.now()}`;
    const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const brandRes = await request.post("/api/brands", {
      data: { name: brandName, slug },
    });
    const brand = await brandRes.json();

    const planRes = await request.post("/api/plans", {
      data: {
        userId: me.id,
        brandId: brand.id,
        name: `71d-Test-${Date.now()}`,
        status: "draft",
      },
    });
    const plan = await planRes.json();
    planId = plan.id;

    await request.patch(`/api/plans/${planId}`, {
      data: { quickStartCompleted: true, financialInputs: buildFinancialInputs() },
    });
  });

  async function loginAndGoToForms(page: any) {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login-admin']");
    await page.waitForURL("/", { timeout: 10_000 });
    await page.goto(`/plans/${planId}`);
    await expect(
      page.locator("[data-testid='planning-workspace']")
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.locator("[data-testid='forms-mode-container']")
    ).toBeVisible({ timeout: 10_000 });
  }

  async function loginAndGoToReports(page: any) {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login-admin']");
    await page.waitForURL("/", { timeout: 10_000 });
    await page.goto(`/plans/${planId}`);
    await expect(
      page.locator("[data-testid='planning-workspace']")
    ).toBeVisible({ timeout: 15_000 });
    await page.click("[data-testid='nav-reports']");
    await expect(
      page.locator("[data-testid='financial-statements']")
    ).toBeVisible({ timeout: 10_000 });
    await page.click("[data-testid='tab-pnl']");
    await expect(page.locator("[data-testid='pnl-tab']")).toBeVisible({
      timeout: 10_000,
    });
  }

  test("AC-1: Facilities decomposition sub-fields visible in Forms", async ({
    page,
  }) => {
    await loginAndGoToForms(page);

    const opCosts = page.locator("[data-testid='section-operatingCosts']");
    const trigger = opCosts.locator("button").first();
    const isExpanded = await opCosts.locator("[data-testid='facilities-total']").isVisible().catch(() => false);
    if (!isExpanded) {
      await trigger.click();
    }

    await expect(
      page.locator("[data-testid='field-input-rent']")
    ).toBeVisible({ timeout: 5_000 });
    await expect(
      page.locator("[data-testid='field-input-utilities']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='field-input-telecomIt']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='field-input-vehicleFleet']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='field-input-insurance']")
    ).toBeVisible();

    await expect(
      page.locator("[data-testid='facilities-total']")
    ).toBeVisible();
  });

  test("AC-1: Facilities Total computed from sub-fields", async ({ page }) => {
    await loginAndGoToForms(page);

    const opCosts = page.locator("[data-testid='section-operatingCosts']");
    const trigger = opCosts.locator("button").first();
    const isExpanded = await opCosts.locator("[data-testid='facilities-total']").isVisible().catch(() => false);
    if (!isExpanded) {
      await trigger.click();
    }

    const totalValue = page.locator("[data-testid='facilities-total-value']");
    await expect(totalValue).toBeVisible({ timeout: 5_000 });
    const totalText = await totalValue.textContent();
    expect(totalText).toBeTruthy();
    expect(totalText!.replace(/[^0-9.]/g, "")).not.toBe("0");
  });

  test("AC-2: Reports P&L shows single Facilities row, no separate rent/utilities/insurance", async ({
    page,
  }) => {
    await loginAndGoToReports(page);

    const facilitiesRow = page.locator("[data-testid='pnl-row-facilities']");
    await expect(facilitiesRow).toBeVisible({ timeout: 5_000 });

    const pnlContent = await page.locator("[data-testid='pnl-tab']").textContent();
    expect(pnlContent).not.toContain("Utilities Monthly");
    expect(pnlContent).not.toContain("Insurance Monthly");
  });

  test("AC-4: Other OpEx shows as percentage in Reports P&L", async ({
    page,
  }) => {
    await loginAndGoToReports(page);

    const otherOpexRow = page.locator("[data-testid='pnl-row-other-opex']");
    await expect(otherOpexRow).toBeVisible({ timeout: 5_000 });

    const rowText = await otherOpexRow.textContent();
    expect(rowText).toContain("%");
  });

  test("AC-4: Other OpEx shows as percentage in Forms", async ({ page }) => {
    await loginAndGoToForms(page);

    const opCosts = page.locator("[data-testid='section-operatingCosts']");
    const trigger = opCosts.locator("button").first();
    const isExpanded = await opCosts.locator("[data-testid='field-input-otherOpexPct']").isVisible().catch(() => false);
    if (!isExpanded) {
      await trigger.click();
    }

    const otherOpexField = page.locator(
      "[data-testid='field-row-otherOpexPct']"
    );
    await expect(otherOpexField).toBeVisible({ timeout: 5_000 });
    const fieldText = await otherOpexField.textContent();
    expect(fieldText).toContain("%");
  });
});
