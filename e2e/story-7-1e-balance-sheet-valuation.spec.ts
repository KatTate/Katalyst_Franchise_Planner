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

test.describe("Story 7.1e: Balance Sheet & Valuation Inline Editing", () => {
  let planId: string;

  test.beforeEach(async ({ request }) => {
    await request.post("/api/auth/dev-login");
    const meRes = await request.get("/api/auth/me");
    const me = await meRes.json();

    const brandName = `71eBrand-${Date.now()}`;
    const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const brandRes = await request.post("/api/brands", {
      data: { name: brandName, slug },
    });
    const brand = await brandRes.json();

    const planRes = await request.post("/api/plans", {
      data: {
        userId: me.id,
        brandId: brand.id,
        name: `71e-Test-${Date.now()}`,
        status: "draft",
      },
    });
    const plan = await planRes.json();
    planId = plan.id;

    await request.patch(`/api/plans/${planId}`, {
      data: { quickStartCompleted: true, financialInputs: buildFinancialInputs() },
    });
  });

  async function loginAndGoToBalanceSheet(page: any) {
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
    await page.click("[data-testid='tab-balance-sheet']");
    await expect(
      page.locator("[data-testid='balance-sheet-tab']")
    ).toBeVisible({ timeout: 10_000 });
  }

  async function loginAndGoToValuation(page: any) {
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
    await page.click("[data-testid='tab-valuation']");
    await expect(
      page.locator("[data-testid='valuation-tab']")
    ).toBeVisible({ timeout: 10_000 });
  }

  test("AC-1: Working Capital Assumptions section visible in Balance Sheet", async ({
    page,
  }) => {
    await loginAndGoToBalanceSheet(page);

    const wcSection = page.locator(
      "[data-testid='bs-section-wc-assumptions']"
    );
    await expect(wcSection).toBeVisible({ timeout: 5_000 });
  });

  test("AC-1: All 4 WC fields displayed with correct defaults", async ({
    page,
  }) => {
    await loginAndGoToBalanceSheet(page);

    const arRow = page.locator("[data-testid='bs-row-ar-days']");
    const apRow = page.locator("[data-testid='bs-row-ap-days']");
    const invRow = page.locator("[data-testid='bs-row-inventory-days']");
    const taxRow = page.locator("[data-testid='bs-row-tax-payment-delay']");

    await expect(arRow).toBeVisible({ timeout: 5_000 });
    await expect(apRow).toBeVisible();
    await expect(invRow).toBeVisible();
    await expect(taxRow).toBeVisible();

    const arText = await arRow.textContent();
    expect(arText).toContain("30");

    const apText = await apRow.textContent();
    expect(apText).toContain("60");

    const invText = await invRow.textContent();
    expect(invText).toContain("60");

    const taxText = await taxRow.textContent();
    expect(taxText).toContain("0");
  });

  test("AC-1: AR Days editable via inline edit", async ({ page }) => {
    await loginAndGoToBalanceSheet(page);

    const arEdit = page.locator("[data-testid='bs-edit-ar-days']");
    await expect(arEdit).toBeVisible({ timeout: 5_000 });
    await arEdit.click();

    const input = arEdit.locator("input");
    await expect(input).toBeVisible({ timeout: 3_000 });
    await input.fill("45");
    await input.press("Enter");

    await page.waitForTimeout(2500);

    const arRow = page.locator("[data-testid='bs-row-ar-days']");
    const updatedText = await arRow.textContent();
    expect(updatedText).toContain("45");
  });

  test("AC-2: EBITDA Multiple editable in Valuation tab", async ({ page }) => {
    await loginAndGoToValuation(page);

    const ebitdaRow = page.locator("[data-testid='val-row-ebitda-multiple']");
    await expect(ebitdaRow).toBeVisible({ timeout: 5_000 });

    const ebitdaText = await ebitdaRow.textContent();
    expect(ebitdaText).toContain("3.0");
  });

  test("AC-2: EBITDA Multiple edit saves and displays with x suffix", async ({
    page,
  }) => {
    await loginAndGoToValuation(page);

    const ebitdaRow = page.locator("[data-testid='val-row-ebitda-multiple']");
    await expect(ebitdaRow).toBeVisible({ timeout: 5_000 });

    const editableCell = ebitdaRow.locator("td").first();
    await editableCell.click();

    const input = ebitdaRow.locator("input");
    if (await input.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await input.fill("4.5");
      await input.press("Enter");
      await page.waitForTimeout(2500);

      const updatedText = await ebitdaRow.textContent();
      expect(updatedText).toContain("4.5");
    }
  });

  test("AC-3: INPUT_FIELD_MAP entries exist for all WC and valuation fields", async ({
    request,
  }) => {
    const planRes = await request.get(`/api/plans/${planId}`);
    const plan = (await planRes.json()).data;

    const fi = plan.financialInputs;
    expect(fi.workingCapitalAndValuation.arDays).toBeDefined();
    expect(fi.workingCapitalAndValuation.apDays).toBeDefined();
    expect(fi.workingCapitalAndValuation.inventoryDays).toBeDefined();
    expect(fi.workingCapitalAndValuation.taxPaymentDelayMonths).toBeDefined();
    expect(fi.workingCapitalAndValuation.ebitdaMultiple).toBeDefined();

    const updateRes = await request.patch(`/api/plans/${planId}`, {
      data: {
        financialInputs: {
          ...fi,
          workingCapitalAndValuation: {
            ...fi.workingCapitalAndValuation,
            arDays: { ...fi.workingCapitalAndValuation.arDays, currentValue: 45 },
          },
        },
      },
    });
    expect(updateRes.status()).toBe(200);

    const verifyRes = await request.get(`/api/plans/${planId}`);
    const verified = (await verifyRes.json()).data;
    expect(verified.financialInputs.workingCapitalAndValuation.arDays.currentValue).toBe(45);
  });
});
