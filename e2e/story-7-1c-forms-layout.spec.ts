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

test.describe("Story 7.1c: Forms Onboarding — New Field Sections", () => {
  let planId: string;

  test.beforeEach(async ({ request }) => {
    await request.post("/api/auth/dev-login");
    const meRes = await request.get("/api/auth/me");
    const me = await meRes.json();

    const brandName = `71cBrand-${Date.now()}`;
    const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const brandRes = await request.post("/api/brands", {
      data: { name: brandName, slug },
    });
    const brand = await brandRes.json();

    const planRes = await request.post("/api/plans", {
      data: {
        userId: me.id,
        brandId: brand.id,
        name: `71c-Test-${Date.now()}`,
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

  test("AC-1: All form sections render with expected fields", async ({
    page,
  }) => {
    await loginAndGoToForms(page);

    await expect(
      page.locator("[data-testid='section-revenue']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='section-operatingCosts']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='section-profitabilityAndDistributions']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='section-workingCapitalAndValuation']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='section-financing']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='section-startupCapital']")
    ).toBeVisible();
  });

  test("AC-1: Revenue section shows Monthly AUV and Growth Rate fields", async ({
    page,
  }) => {
    await loginAndGoToForms(page);

    await expect(
      page.locator("[data-testid='field-input-monthlyAuv']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='field-input-growthRates']")
    ).toBeVisible();
  });

  test("AC-1: Operating Costs section shows all fields", async ({ page }) => {
    await loginAndGoToForms(page);

    const opCosts = page.locator("[data-testid='section-operatingCosts']");
    await expect(opCosts).toBeVisible();

    const trigger = opCosts.locator("button").first();
    const isExpanded = await opCosts.locator("[data-testid='field-input-cogsPct']").isVisible().catch(() => false);
    if (!isExpanded) {
      await trigger.click();
    }

    await expect(
      page.locator("[data-testid='field-input-cogsPct']")
    ).toBeVisible({ timeout: 5_000 });
    await expect(
      page.locator("[data-testid='field-input-laborPct']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='field-input-marketingPct']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='field-input-royaltyPct']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='field-input-adFundPct']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='field-input-payrollTaxPct']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='field-input-managementSalariesAnnual']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='field-input-otherOpexPct']")
    ).toBeVisible();
  });

  test("AC-1: Per-year fields show 'Fine-tune per year in Reports' hint", async ({
    page,
  }) => {
    await loginAndGoToForms(page);

    const hint = page.locator("[data-testid='hint-fine-tune-cogsPct']");
    await expect(hint).toBeVisible({ timeout: 5_000 });
    await expect(hint).toContainText("Reports");
  });

  test("AC-1: Working Capital & Valuation section shows all fields", async ({
    page,
  }) => {
    await loginAndGoToForms(page);

    const wcSection = page.locator(
      "[data-testid='section-workingCapitalAndValuation']"
    );
    await expect(wcSection).toBeVisible();

    const trigger = wcSection.locator("button").first();
    const isExpanded = await wcSection.locator("[data-testid='field-input-arDays']").isVisible().catch(() => false);
    if (!isExpanded) {
      await trigger.click();
    }

    await expect(
      page.locator("[data-testid='field-input-arDays']")
    ).toBeVisible({ timeout: 5_000 });
    await expect(
      page.locator("[data-testid='field-input-apDays']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='field-input-inventoryDays']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='field-input-taxPaymentDelayMonths']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='field-input-ebitdaMultiple']")
    ).toBeVisible();
  });

  test("AC-2: Editing a field in Forms saves to PlanFinancialInputs", async ({
    page,
    request,
  }) => {
    await loginAndGoToForms(page);

    const wcSection = page.locator(
      "[data-testid='section-workingCapitalAndValuation']"
    );
    const trigger = wcSection.locator("button").first();
    const isExpanded = await wcSection.locator("[data-testid='field-input-arDays']").isVisible().catch(() => false);
    if (!isExpanded) {
      await trigger.click();
    }

    const arInput = page.locator("[data-testid='field-input-arDays']");
    await expect(arInput).toBeVisible({ timeout: 5_000 });
    await arInput.click();

    const editInput = arInput.locator("xpath=self::input");
    await expect(editInput).toBeVisible({ timeout: 3_000 });
    await editInput.fill("45");
    await editInput.press("Enter");

    await page.waitForTimeout(3000);

    const getRes = await request.get(`/api/plans/${planId}`);
    const plan = (await getRes.json()).data;
    expect(plan.financialInputs.workingCapitalAndValuation.arDays.currentValue).toBe(45);
  });

  test("AC-3: 'Set for all years' checkbox appears on per-year fields", async ({
    page,
  }) => {
    await loginAndGoToForms(page);

    const checkbox = page.locator(
      "[data-testid='checkbox-set-all-years-cogsPct']"
    );
    await expect(checkbox).toBeVisible({ timeout: 5_000 });
  });

  test("AC-4: Brand default labels visible for fields", async ({ page }) => {
    await loginAndGoToForms(page);

    const defaultLabel = page.locator(
      "[data-testid='field-brand-default-monthlyAuv']"
    );
    await expect(defaultLabel).toBeVisible({ timeout: 5_000 });
    await expect(defaultLabel).toContainText("Brand default");
  });

  test("AC-4: Reset to brand default restores value", async ({ page }) => {
    await loginAndGoToForms(page);

    const monthlyAuvInput = page.locator(
      "[data-testid='field-input-monthlyAuv']"
    );
    await monthlyAuvInput.click();
    const editInput = monthlyAuvInput.locator("xpath=self::input");
    await expect(editInput).toBeVisible({ timeout: 5_000 });
    await editInput.fill("9999");
    await editInput.press("Enter");

    await expect(
      page.locator("[data-testid='badge-source-monthlyAuv']")
    ).toContainText("Your Entry", { timeout: 5_000 });

    const resetBtn = page.locator("[data-testid='button-reset-monthlyAuv']");
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    await expect(
      page.locator("[data-testid='badge-source-monthlyAuv']")
    ).toContainText("Brand Default", { timeout: 5_000 });
  });
});
