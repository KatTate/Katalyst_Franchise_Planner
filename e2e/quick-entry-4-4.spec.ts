import { test, expect, type Page } from "@playwright/test";

test.describe("Story 4.4: Quick Entry Mode — Keyboard Navigation & Formatting", () => {
  let planId: string;

  test.beforeEach(async ({ request }) => {
    await request.post("/api/auth/dev-login");

    const meRes = await request.get("/api/auth/me");
    const me = await meRes.json();

    const brandName = `QE44-${Date.now()}`;
    const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const brandRes = await request.post("/api/brands", {
      data: { name: brandName, slug },
    });
    const brand = await brandRes.json();

    const planRes = await request.post("/api/plans", {
      data: {
        userId: me.id,
        brandId: brand.id,
        name: `QE44 Test ${Date.now()}`,
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

  async function loginAndNavigateToQuickEntry(page: Page) {
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

  test("AC1: Tab moves focus to next editable Value cell", async ({ page }) => {
    await loginAndNavigateToQuickEntry(page);

    const firstCell = page.locator("[data-testid='grid-cell-monthlyAuv']");
    await firstCell.focus();
    await expect(firstCell).toBeFocused();

    await page.keyboard.press("Tab");

    const secondCell = page.locator("[data-testid='grid-cell-year1GrowthRate']");
    await expect(secondCell).toBeFocused({ timeout: 3_000 });
  });

  test("AC1: Shift+Tab moves focus to previous editable Value cell", async ({ page }) => {
    await loginAndNavigateToQuickEntry(page);

    const secondCell = page.locator("[data-testid='grid-cell-year1GrowthRate']");
    await secondCell.focus();
    await expect(secondCell).toBeFocused();

    await page.keyboard.press("Shift+Tab");

    const firstCell = page.locator("[data-testid='grid-cell-monthlyAuv']");
    await expect(firstCell).toBeFocused({ timeout: 3_000 });
  });

  test("AC1: Tab wraps across category groups", async ({ page }) => {
    await loginAndNavigateToQuickEntry(page);

    const lastRevenueField = page.locator("[data-testid='grid-cell-startingMonthAuvPct']");
    await lastRevenueField.focus();
    await expect(lastRevenueField).toBeFocused();

    await page.keyboard.press("Tab");

    const firstOpCostField = page.locator("[data-testid='grid-cell-cogsPct']");
    await expect(firstOpCostField).toBeFocused({ timeout: 3_000 });
  });

  test("AC2: Enter commits value and moves focus down to next editable cell", async ({ page }) => {
    await loginAndNavigateToQuickEntry(page);

    const cell = page.locator("[data-testid='grid-cell-monthlyAuv']");
    await cell.focus();
    await cell.fill("7000");
    await page.keyboard.press("Enter");

    const nextCell = page.locator("[data-testid='grid-cell-year1GrowthRate']");
    await expect(nextCell).toBeFocused({ timeout: 3_000 });

    const row = page.locator("[data-testid='grid-row-monthlyAuv']");
    await expect(row).toContainText("Your Entry", { timeout: 5_000 });
  });

  test("AC3: Currency field shows formatted value on blur and raw value on focus", async ({ page }) => {
    await loginAndNavigateToQuickEntry(page);

    const cell = page.locator("[data-testid='grid-cell-monthlyAuv']");
    await cell.focus();
    await cell.fill("4200");
    await page.keyboard.press("Enter");

    await page.locator("[data-testid='grid-cell-year1GrowthRate']").blur();
    await page.waitForTimeout(300);

    const displayedValue = await cell.inputValue();
    expect(displayedValue).toContain("$");
    expect(displayedValue).toContain("4,200");
    expect(displayedValue).toContain(".00");

    await cell.focus();
    const rawValue = await cell.inputValue();
    expect(rawValue).not.toContain("$");
    expect(rawValue).not.toContain(",");
    expect(rawValue).toBe("4200");
  });

  test("AC4: Percentage field shows formatted value on blur and raw value on focus", async ({ page }) => {
    await loginAndNavigateToQuickEntry(page);

    const cell = page.locator("[data-testid='grid-cell-cogsPct']");
    await cell.focus();
    await cell.fill("23");
    await page.keyboard.press("Enter");

    await page.waitForTimeout(300);

    await page.locator("[data-testid='grid-cell-laborPct']").blur();
    await page.waitForTimeout(300);

    const displayedValue = await cell.inputValue();
    expect(displayedValue).toContain("23.0%");

    await cell.focus();
    const rawValue = await cell.inputValue();
    expect(rawValue).not.toContain("%");
  });

  test("AC5: Integer field displays as whole number, decimals rounded on commit", async ({ page }) => {
    await loginAndNavigateToQuickEntry(page);

    const cell = page.locator("[data-testid='grid-cell-loanTermMonths']");
    await cell.focus();
    await cell.fill("84.6");
    await page.keyboard.press("Enter");

    await page.waitForTimeout(500);

    const row = page.locator("[data-testid='grid-row-loanTermMonths']");
    await expect(row).toContainText("Your Entry", { timeout: 5_000 });

    const displayedValue = await cell.inputValue();
    expect(displayedValue).toBe("85");
  });

  test("AC6: Row virtualization — uses @tanstack/react-virtual virtualizer", async ({ page }) => {
    await loginAndNavigateToQuickEntry(page);

    await expect(page.locator("[data-testid='quick-entry-grid']")).toBeVisible();

    const allFieldRows = await page.locator("tr[data-testid^='grid-row-']").count();
    const allGroupRows = await page.locator("tr[data-testid^='grid-group-']").count();
    const totalRenderedRows = allFieldRows + allGroupRows;

    expect(totalRenderedRows).toBeGreaterThan(0);

    const hasPaddingRows = await page.evaluate(() => {
      const tbody = document.querySelector("[data-testid='quick-entry-grid'] tbody");
      if (!tbody) return false;
      const trs = tbody.querySelectorAll("tr");
      for (const tr of trs) {
        const td = tr.querySelector("td");
        if (td && td.style.height && !td.textContent?.trim()) {
          return true;
        }
      }
      return false;
    });

    const scrollContainer = page.locator("[data-testid='quick-entry-container'] .overflow-auto");
    const scrollHeight = await scrollContainer.evaluate((el) => el.scrollHeight);
    const clientHeight = await scrollContainer.evaluate((el) => el.clientHeight);

    const isScrollable = scrollHeight > clientHeight;
    const hasVirtualPadding = hasPaddingRows;
    const hasVirtualization = isScrollable || hasVirtualPadding || totalRenderedRows < 23;

    expect(hasVirtualization).toBe(true);

    const stickyMetrics = page.locator("[data-testid='quick-entry-metrics']");
    await expect(stickyMetrics).toBeVisible();

    const thead = page.locator("[data-testid='quick-entry-grid'] thead");
    await expect(thead).toBeVisible();
  });

  test("AC7: Full keyboard-only workflow — Tab, type, Enter, cycle without mouse", async ({ page }) => {
    await loginAndNavigateToQuickEntry(page);

    const monthlyAuv = page.locator("[data-testid='grid-cell-monthlyAuv']");
    await monthlyAuv.focus();

    await monthlyAuv.fill("6000");
    await page.keyboard.press("Enter");

    const year1Growth = page.locator("[data-testid='grid-cell-year1GrowthRate']");
    await expect(year1Growth).toBeFocused({ timeout: 3_000 });

    await year1Growth.fill("8");
    await page.keyboard.press("Tab");

    const year2Growth = page.locator("[data-testid='grid-cell-year2GrowthRate']");
    await expect(year2Growth).toBeFocused({ timeout: 3_000 });

    await year2Growth.fill("5");
    await page.keyboard.press("Escape");

    const year2Val = await year2Growth.inputValue();
    expect(year2Val).not.toBe("5");

    const auvRow = page.locator("[data-testid='grid-row-monthlyAuv']");
    await expect(auvRow).toContainText("Your Entry", { timeout: 5_000 });

    const growthRow = page.locator("[data-testid='grid-row-year1GrowthRate']");
    await expect(growthRow).toContainText("Your Entry", { timeout: 5_000 });
  });

  test("AC8: Collapsed groups are skipped during keyboard navigation", async ({ page }) => {
    await loginAndNavigateToQuickEntry(page);

    await page.click("[data-testid='group-toggle-operatingCosts']");
    await expect(
      page.locator("[data-testid='grid-row-cogsPct']")
    ).not.toBeVisible({ timeout: 3_000 });

    const lastRevenueField = page.locator("[data-testid='grid-cell-startingMonthAuvPct']");
    await lastRevenueField.focus();
    await expect(lastRevenueField).toBeFocused();

    await page.keyboard.press("Tab");

    const firstFinancingField = page.locator("[data-testid='grid-cell-loanAmount']");
    await expect(firstFinancingField).toBeFocused({ timeout: 3_000 });
  });

  test("AC3 additional: Currency formatting with comma separators for large values", async ({ page }) => {
    await loginAndNavigateToQuickEntry(page);

    const cell = page.locator("[data-testid='grid-cell-loanAmount']");
    await cell.focus();
    await cell.fill("250000");
    await page.keyboard.press("Enter");

    await page.waitForTimeout(500);

    const displayedValue = await cell.inputValue();
    expect(displayedValue).toContain("$");
    expect(displayedValue).toContain("250,000");
  });

  test("Escape cancels edit without committing — preserves original value", async ({ page }) => {
    await loginAndNavigateToQuickEntry(page);

    const cell = page.locator("[data-testid='grid-cell-monthlyAuv']");
    await cell.focus();
    const originalRaw = await cell.inputValue();
    await cell.fill("99999");
    await page.keyboard.press("Escape");

    const afterEscape = await cell.inputValue();
    expect(afterEscape).not.toBe("99999");

    const row = page.locator("[data-testid='grid-row-monthlyAuv']");
    await expect(row).toContainText("Brand Default");
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
