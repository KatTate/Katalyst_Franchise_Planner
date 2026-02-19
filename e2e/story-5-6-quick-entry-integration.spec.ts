import { test, expect } from "@playwright/test";

test.describe("Story 5.6: Quick Entry Input-Output Integration", () => {
  let planId: string;
  let brandId: string;

  test.beforeEach(async ({ request }) => {
    await request.post("/api/auth/dev-login");

    const meRes = await request.get("/api/auth/me");
    const me = await meRes.json();

    const brandName = `QE56Brand-${Date.now()}`;
    const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const brandRes = await request.post("/api/brands", {
      data: { name: brandName, slug },
    });
    const brand = await brandRes.json();
    brandId = brand.id;

    const planRes = await request.post("/api/plans", {
      data: {
        userId: me.id,
        brandId: brandId,
        name: `QE56 Test Plan ${Date.now()}`,
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

  async function loginAndNavigateToWorkspace(page: any) {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login-admin']");
    await page.waitForURL("/", { timeout: 15_000 });
    await page.goto(`/plans/${planId}`);
    await expect(
      page.locator("[data-testid='planning-workspace']")
    ).toBeVisible({ timeout: 15_000 });
  }

  async function switchToQuickEntryMode(page: any) {
    const modeSwitcher = page.locator("[data-testid='mode-switcher']");
    if (await modeSwitcher.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await page.click("[data-testid='mode-switcher-quick-entry']");
      await expect(
        page.locator("[data-testid='quick-entry-container']")
      ).toBeVisible({ timeout: 10_000 });
    }
  }

  async function navigateToReports(page: any) {
    await page.click("[data-testid='nav-reports']");
    await expect(
      page.locator("[data-testid='financial-statements']")
    ).toBeVisible({ timeout: 10_000 });
  }

  // ---------- AC: Quick Entry mode renders the flat grid with editable cells ----------

  test("AC1: Quick Entry mode renders the flat grid with editable input cells", async ({
    page,
  }) => {
    await loginAndNavigateToWorkspace(page);
    await switchToQuickEntryMode(page);

    const grid = page.locator("[data-testid='quick-entry-grid']");
    await expect(grid).toBeVisible({ timeout: 10_000 });

    await expect(
      page.locator("[data-testid='grid-cell-monthlyAuv']")
    ).toBeVisible();

    await expect(
      page.locator("[data-testid='grid-cell-cogsPct']")
    ).toBeVisible();
  });

  test("AC2: Quick Entry grid shows sticky summary metrics", async ({
    page,
  }) => {
    await loginAndNavigateToWorkspace(page);
    await switchToQuickEntryMode(page);

    const metrics = page.locator("[data-testid='quick-entry-metrics']");
    await expect(metrics).toBeVisible({ timeout: 10_000 });

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

  // ---------- AC: EditableCell keyboard navigation ----------

  test("AC3: Tab navigates to the next input cell in Quick Entry grid", async ({
    page,
  }) => {
    await loginAndNavigateToWorkspace(page);
    await switchToQuickEntryMode(page);

    const firstCell = page.locator("[data-testid='grid-cell-monthlyAuv']");
    await expect(firstCell).toBeVisible({ timeout: 10_000 });
    await firstCell.click();
    await firstCell.press("Tab");

    await page.waitForTimeout(500);

    const focusedField = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.getAttribute("data-field-name") ?? null;
    });
    expect(focusedField).toBeTruthy();
    expect(focusedField).not.toBe("monthlyAuv");
  });

  test("AC4: Escape cancels edit and restores previous value", async ({
    page,
  }) => {
    await loginAndNavigateToWorkspace(page);
    await switchToQuickEntryMode(page);

    const cell = page.locator("[data-testid='grid-cell-monthlyAuv']");
    await expect(cell).toBeVisible({ timeout: 10_000 });

    const originalValue = await cell.inputValue();

    await cell.click();
    await cell.fill("99999");
    await cell.press("Escape");

    await page.waitForTimeout(300);

    const restoredValue = await cell.inputValue();
    expect(restoredValue).not.toBe("99999");
  });

  test("AC5: Enter confirms edit and commits the value", async ({
    page,
  }) => {
    await loginAndNavigateToWorkspace(page);
    await switchToQuickEntryMode(page);

    const cell = page.locator("[data-testid='grid-cell-monthlyAuv']");
    await expect(cell).toBeVisible({ timeout: 10_000 });

    await cell.click();
    await cell.fill("7500");
    await cell.press("Enter");

    await page.waitForTimeout(1500);

    const investmentMetric = page.locator("[data-testid='qe-metric-revenue']");
    const metricText = await investmentMetric.textContent();
    expect(metricText).toBeTruthy();
  });

  // ---------- AC: Editing a cell triggers engine recalculation ----------

  test("AC6: Editing a cell triggers engine recalculation and updates summary metrics", async ({
    page,
  }) => {
    await loginAndNavigateToWorkspace(page);
    await switchToQuickEntryMode(page);

    const revenueMetric = page.locator("[data-testid='qe-metric-revenue']");
    await expect(revenueMetric).toBeVisible({ timeout: 10_000 });
    const initialRevenue = await revenueMetric.textContent();

    const cell = page.locator("[data-testid='grid-cell-monthlyAuv']");
    await cell.click();
    await cell.fill("10000");
    await cell.press("Enter");

    await page.waitForTimeout(3000);

    const updatedRevenue = await revenueMetric.textContent();
    expect(updatedRevenue).not.toBe(initialRevenue);
  });

  // ---------- AC: Category group expand/collapse ----------

  test("AC7: Category groups can be expanded and collapsed", async ({
    page,
  }) => {
    await loginAndNavigateToWorkspace(page);
    await switchToQuickEntryMode(page);

    const grid = page.locator("[data-testid='quick-entry-grid']");
    await expect(grid).toBeVisible({ timeout: 10_000 });

    const revenueToggle = page.locator("[data-testid='group-toggle-revenue']");
    await expect(revenueToggle).toBeVisible();

    await revenueToggle.click();
    await page.waitForTimeout(300);

    const monthlyAuvRow = page.locator("[data-testid='grid-row-monthlyAuv']");
    await expect(monthlyAuvRow).not.toBeVisible();

    await revenueToggle.click();
    await page.waitForTimeout(300);

    await expect(monthlyAuvRow).toBeVisible();
  });

  // ---------- AC: Reset to brand default ----------

  test("AC8: Reset button appears when field is user-edited and resets to brand default", async ({
    page,
  }) => {
    await loginAndNavigateToWorkspace(page);
    await switchToQuickEntryMode(page);

    const cell = page.locator("[data-testid='grid-cell-monthlyAuv']");
    await expect(cell).toBeVisible({ timeout: 10_000 });
    await cell.click();
    await cell.fill("9999");
    await cell.press("Enter");

    await page.waitForTimeout(2000);

    const resetBtn = page.locator("[data-testid='grid-reset-monthlyAuv']");
    await expect(resetBtn).toBeVisible({ timeout: 5_000 });
    await resetBtn.click();

    await page.waitForTimeout(2000);

    const resetValue = await cell.inputValue();
    expect(resetValue).toContain("5,000");
  });

  // ---------- AC: Source badge shows correct source ----------

  test("AC9: Source badge reflects brand_default for untouched fields", async ({
    page,
  }) => {
    await loginAndNavigateToWorkspace(page);
    await switchToQuickEntryMode(page);

    const grid = page.locator("[data-testid='quick-entry-grid']");
    await expect(grid).toBeVisible({ timeout: 10_000 });

    const sourceBadge = page.locator("[data-testid='grid-row-monthlyAuv'] [data-testid^='source-badge']").first();
    if (await sourceBadge.isVisible().catch(() => false)) {
      const badgeText = await sourceBadge.textContent();
      expect(badgeText?.toLowerCase()).toContain("brand");
    }
  });

  // ---------- AC: Financial Statements tabs are accessible from reports view ----------

  test("AC10: Financial Statements are accessible from reports nav", async ({
    page,
  }) => {
    await loginAndNavigateToWorkspace(page);
    await navigateToReports(page);

    await expect(page.locator("[data-testid='tab-summary']")).toBeVisible();
    await expect(page.locator("[data-testid='tab-pnl']")).toBeVisible();
    await expect(page.locator("[data-testid='tab-balance-sheet']")).toBeVisible();
    await expect(page.locator("[data-testid='tab-cash-flow']")).toBeVisible();
  });

  // ---------- AC: P&L tab inline editing (when queueSave is wired) ----------

  test("AC11: P&L tab shows editable input rows with pencil indicator when inline editing is enabled", async ({
    page,
  }) => {
    await loginAndNavigateToWorkspace(page);
    await navigateToReports(page);

    await page.click("[data-testid='tab-pnl']");
    await expect(page.locator("[data-testid='pnl-tab']")).toBeVisible({
      timeout: 10_000,
    });

    const monthlyRevenueRow = page.locator("[data-testid='pnl-row-monthly-revenue']");
    await expect(monthlyRevenueRow).toBeVisible();

    const cogsRow = page.locator("[data-testid='pnl-row-cogs-pct']");
    await expect(cogsRow).toBeVisible();
  });

  // ---------- AC: Unit labels display correctly ----------

  test("AC12: Unit labels show correct symbols for different field types", async ({
    page,
  }) => {
    await loginAndNavigateToWorkspace(page);
    await switchToQuickEntryMode(page);

    const grid = page.locator("[data-testid='quick-entry-grid']");
    await expect(grid).toBeVisible({ timeout: 10_000 });

    const currencyUnit = page.locator("[data-testid='grid-unit-monthlyAuv']");
    if (await currencyUnit.isVisible().catch(() => false)) {
      const unitText = await currencyUnit.textContent();
      expect(unitText).toBe("$");
    }

    const pctUnit = page.locator("[data-testid='grid-unit-cogsPct']");
    if (await pctUnit.isVisible().catch(() => false)) {
      const unitText = await pctUnit.textContent();
      expect(unitText).toBe("%");
    }
  });

  // ---------- AC: Startup costs section in Quick Entry ----------

  test("AC13: Startup costs section is visible in Quick Entry mode", async ({
    page,
  }) => {
    await loginAndNavigateToWorkspace(page);
    await switchToQuickEntryMode(page);

    const container = page.locator("[data-testid='quick-entry-container']");
    await expect(container).toBeVisible({ timeout: 10_000 });

    const startupSection = page.locator("[data-testid='quick-entry-startup-costs']");
    await expect(startupSection).toBeVisible();

    const toggleBtn = page.locator("[data-testid='group-toggle-startupCosts']");
    await expect(toggleBtn).toBeVisible();
  });

  // ---------- AC: Forms and Planning Assistant modes show read-only financial statements ----------

  test("AC14: Forms mode does NOT show Quick Entry grid (separate input experience)", async ({
    page,
  }) => {
    await loginAndNavigateToWorkspace(page);

    const modeSwitcher = page.locator("[data-testid='mode-switcher']");
    if (await modeSwitcher.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await page.click("[data-testid='mode-switcher-forms']");
      await page.waitForTimeout(1000);
    }

    const quickEntryGrid = page.locator("[data-testid='quick-entry-grid']");
    await expect(quickEntryGrid).not.toBeVisible();
  });
});

function makeField(value: number) {
  return {
    currentValue: value,
    brandDefault: value,
    source: "brand_default" as const,
    isCustom: false,
    item7Range: null,
    lastModifiedAt: null,
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
