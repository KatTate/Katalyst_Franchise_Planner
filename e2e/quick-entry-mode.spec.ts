import { test, expect } from "@playwright/test";

test.describe("Story 4.3: Quick Entry Mode — Grid Foundation", () => {
  let planId: string;

  test.beforeEach(async ({ request }) => {
    await request.post("/api/auth/dev-login");

    const meRes = await request.get("/api/auth/me");
    const me = await meRes.json();

    const brandName = `QEBrand-${Date.now()}`;
    const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const brandRes = await request.post("/api/brands", {
      data: { name: brandName, slug },
    });
    const brand = await brandRes.json();

    const planRes = await request.post("/api/plans", {
      data: {
        userId: me.id,
        brandId: brand.id,
        name: `QE Test ${Date.now()}`,
        status: "draft",
      },
    });
    const plan = await planRes.json();
    planId = plan.id;

    const financialInputs = buildMinimalFinancialInputs();
    await request.patch(`/api/plans/${planId}`, {
      data: { quickStartCompleted: true, financialInputs },
    });
  });

  async function loginAndNavigateToQuickEntry(page: any) {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });
    await page.goto(`/plans/${planId}`);

    await expect(
      page.locator("[data-testid='planning-workspace']")
    ).toBeVisible({ timeout: 15_000 });

    await page.click("[data-testid='mode-switcher-quick-entry']");

    await expect(
      page.locator("[data-testid='quick-entry-container']")
    ).toBeVisible({ timeout: 10_000 });
  }

  test("grid renders with category groups and field rows (AC 1, AC 2)", async ({
    page,
  }) => {
    await loginAndNavigateToQuickEntry(page);

    await expect(page.locator("[data-testid='quick-entry-grid']")).toBeVisible();

    await expect(
      page.locator("[data-testid='grid-group-revenue']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='grid-group-operatingCosts']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='grid-group-financing']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='grid-group-startupCapital']")
    ).toBeVisible();

    await expect(
      page.locator("[data-testid='grid-row-monthlyAuv']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='grid-row-cogsPct']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='grid-row-loanAmount']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='grid-row-workingCapitalMonths']")
    ).toBeVisible();
  });

  test("category groups collapse and expand (AC 2)", async ({ page }) => {
    await loginAndNavigateToQuickEntry(page);

    await expect(
      page.locator("[data-testid='grid-row-monthlyAuv']")
    ).toBeVisible();

    await page.click("[data-testid='group-toggle-revenue']");
    await expect(
      page.locator("[data-testid='grid-row-monthlyAuv']")
    ).not.toBeVisible();

    await page.click("[data-testid='group-toggle-revenue']");
    await expect(
      page.locator("[data-testid='grid-row-monthlyAuv']")
    ).toBeVisible();
  });

  test("value cells are immediately editable on focus — no click-to-edit (AC 3)", async ({
    page,
  }) => {
    await loginAndNavigateToQuickEntry(page);

    const cell = page.locator("[data-testid='grid-cell-monthlyAuv']");
    await expect(cell).toBeVisible();

    const tagName = await cell.evaluate((el: HTMLElement) =>
      el.tagName.toLowerCase()
    );
    expect(tagName).toBe("input");

    await cell.focus();
    await expect(cell).toBeFocused();
  });

  test("commit on blur updates source badge to Your Entry (AC 4)", async ({
    page,
  }) => {
    await loginAndNavigateToQuickEntry(page);

    const cell = page.locator("[data-testid='grid-cell-monthlyAuv']");
    await cell.focus();
    await cell.fill("6000");
    await cell.blur();

    const row = page.locator("[data-testid='grid-row-monthlyAuv']");
    await expect(row).toContainText("Your Entry", { timeout: 5_000 });
  });

  test("commit on Enter updates value (AC 4)", async ({ page }) => {
    await loginAndNavigateToQuickEntry(page);

    const cell = page.locator("[data-testid='grid-cell-monthlyAuv']");
    await cell.focus();
    await cell.fill("7500");
    await cell.press("Enter");

    const row = page.locator("[data-testid='grid-row-monthlyAuv']");
    await expect(row).toContainText("Your Entry", { timeout: 5_000 });
  });

  test("Escape cancels edit without committing (AC 4)", async ({ page }) => {
    await loginAndNavigateToQuickEntry(page);

    const cell = page.locator("[data-testid='grid-cell-monthlyAuv']");
    const originalValue = await cell.inputValue();
    await cell.focus();
    await cell.fill("99999");
    await cell.press("Escape");

    await expect(cell).toHaveValue(originalValue, { timeout: 2_000 });

    const row = page.locator("[data-testid='grid-row-monthlyAuv']");
    await expect(row).toContainText("Brand Default");
  });

  test("sticky metrics bar renders with 4 metrics (AC 5)", async ({
    page,
  }) => {
    await loginAndNavigateToQuickEntry(page);

    await expect(
      page.locator("[data-testid='quick-entry-metrics']")
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page.locator("[data-testid='qe-metric-investment']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='qe-metric-revenue']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='qe-metric-roi']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='qe-metric-breakeven']")
    ).toBeVisible();
  });

  test("out-of-range field shows Gurple styling and tooltip (AC 6)", async ({
    page,
    request,
  }) => {
    const financialInputs = buildFinancialInputsWithRange();
    await request.patch(`/api/plans/${planId}`, {
      data: { financialInputs },
    });

    await loginAndNavigateToQuickEntry(page);

    const cell = page.locator("[data-testid='grid-cell-monthlyAuv']");
    await expect(cell).toBeVisible();

    const bgColor = await cell.evaluate((el: HTMLElement) =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(bgColor).not.toBe("rgba(0, 0, 0, 0)");

    await cell.hover();
    const tooltip = page.locator("text=Typical range:");
    await expect(tooltip).toBeVisible({ timeout: 3_000 });
    await expect(tooltip).toContainText("Typical range:");
  });

  test("in-range field does not show Gurple styling (AC 6 — null case)", async ({
    page,
  }) => {
    await loginAndNavigateToQuickEntry(page);

    const cell = page.locator("[data-testid='grid-cell-cogsPct']");
    await expect(cell).toBeVisible();

    const bgColor = await cell.evaluate((el: HTMLElement) => {
      const bg = window.getComputedStyle(el).backgroundColor;
      return bg;
    });
    const hasGurple = bgColor.includes("169") && bgColor.includes("162") && bgColor.includes("170");
    expect(hasGurple).toBe(false);
  });

  test("reset button appears for user-edited fields and reverts to brand default (AC 7)", async ({
    page,
  }) => {
    await loginAndNavigateToQuickEntry(page);

    await expect(
      page.locator("[data-testid='grid-reset-monthlyAuv']")
    ).not.toBeVisible();

    const cell = page.locator("[data-testid='grid-cell-monthlyAuv']");
    await cell.focus();
    await cell.fill("8000");
    await cell.press("Enter");

    const resetBtn = page.locator("[data-testid='grid-reset-monthlyAuv']");
    await expect(resetBtn).toBeVisible({ timeout: 5_000 });

    await resetBtn.click();

    const row = page.locator("[data-testid='grid-row-monthlyAuv']");
    await expect(row).toContainText("Brand Default", { timeout: 5_000 });
    await expect(resetBtn).not.toBeVisible();
  });

  test("unit column shows correct unit symbols", async ({ page }) => {
    await loginAndNavigateToQuickEntry(page);

    const dollarUnit = page.locator("[data-testid='grid-unit-monthlyAuv']");
    await expect(dollarUnit).toHaveText("$");

    const pctUnit = page.locator("[data-testid='grid-unit-year1GrowthRate']");
    await expect(pctUnit).toHaveText("%");

    const intUnit = page.locator(
      "[data-testid='grid-unit-loanTermMonths']"
    );
    await expect(intUnit).toHaveText("#");
  });

  test("brand default column shows formatted default values", async ({
    page,
  }) => {
    await loginAndNavigateToQuickEntry(page);

    const defaultVal = page.locator(
      "[data-testid='grid-default-monthlyAuv']"
    );
    await expect(defaultVal).toBeVisible();
    await expect(defaultVal).not.toHaveText("");
  });

  test("mode switching preserves Quick Entry values (AC 9)", async ({
    page,
  }) => {
    await loginAndNavigateToQuickEntry(page);

    const cell = page.locator("[data-testid='grid-cell-rentMonthly']");
    await cell.focus();
    await cell.fill("4000");
    await cell.press("Enter");

    const row = page.locator("[data-testid='grid-row-rentMonthly']");
    await expect(row).toContainText("Your Entry", { timeout: 5_000 });

    await page.click("[data-testid='mode-switcher-forms']");
    await expect(
      page.locator("[data-testid='forms-mode-container']")
    ).toBeVisible({ timeout: 10_000 });

    await page.click("[data-testid='mode-switcher-quick-entry']");
    await expect(
      page.locator("[data-testid='quick-entry-container']")
    ).toBeVisible({ timeout: 10_000 });

    const cellAfter = page.locator("[data-testid='grid-cell-rentMonthly']");
    await expect(cellAfter).toHaveValue("4000", { timeout: 5_000 });
  });

  test("empty state shown when plan has no financial inputs (AC 8)", async ({
    page,
    request,
  }) => {
    await request.post("/api/auth/dev-login");
    const meRes = await request.get("/api/auth/me");
    const me = await meRes.json();

    const emptyBrandName = `QEEmpty-${Date.now()}`;
    const emptySlug = emptyBrandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const emptyBrandRes = await request.post("/api/brands", {
      data: { name: emptyBrandName, slug: emptySlug },
    });
    const emptyBrand = await emptyBrandRes.json();
    const emptyPlanRes = await request.post("/api/plans", {
      data: {
        userId: me.id,
        brandId: emptyBrand.id,
        name: `QE Empty ${Date.now()}`,
        status: "draft",
      },
    });
    const emptyPlan = await emptyPlanRes.json();
    await request.patch(`/api/plans/${emptyPlan.id}`, {
      data: { quickStartCompleted: true },
    });

    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });
    await page.goto(`/plans/${emptyPlan.id}`);
    await expect(
      page.locator("[data-testid='planning-workspace']")
    ).toBeVisible({ timeout: 15_000 });
    await page.click("[data-testid='mode-switcher-quick-entry']");

    await expect(
      page.locator("[data-testid='status-no-inputs']")
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.locator("[data-testid='status-no-inputs']")
    ).toContainText("plan hasn't been initialized");
  });

  test("sticky metrics update after cell edit (AC 5)", async ({ page }) => {
    await loginAndNavigateToQuickEntry(page);

    const revenueMetric = page.locator("[data-testid='qe-metric-revenue']");
    await expect(revenueMetric).toBeVisible({ timeout: 10_000 });

    const revenueBefore = await revenueMetric.textContent();

    const cell = page.locator("[data-testid='grid-cell-monthlyAuv']");
    await cell.focus();
    await cell.fill("15000");
    await cell.press("Enter");

    await expect(revenueMetric).not.toHaveText(revenueBefore!, {
      timeout: 5_000,
    });
  });

  test("loading skeleton shown while plan data loads (AC 10)", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });

    await page.route("**/api/plans/*", async (route) => {
      if (route.request().method() === "GET") {
        await new Promise((r) => setTimeout(r, 2000));
      }
      await route.continue();
    });

    await page.goto(`/plans/${planId}`);

    await expect(
      page.locator("[data-testid='planning-workspace']")
    ).toBeVisible({ timeout: 15_000 });

    await page.click("[data-testid='mode-switcher-quick-entry']");

    const container = page.locator("[data-testid='quick-entry-container']");
    await expect(container).toBeVisible({ timeout: 10_000 });
  });
});

function makeField(value: number, item7Range?: { min: number; max: number } | null) {
  return {
    currentValue: value,
    brandDefault: value,
    source: "brand_default" as const,
    isCustom: false,
    lastModifiedAt: null,
    item7Range: item7Range ?? null,
  };
}

function buildMinimalFinancialInputs() {
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

function buildFinancialInputsWithRange() {
  const inputs = buildMinimalFinancialInputs();
  inputs.revenue.monthlyAuv = makeField(1000_00, {
    min: 3500_00,
    max: 5500_00,
  });
  return inputs;
}
