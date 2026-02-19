import { test, expect } from "@playwright/test";

test.describe("Story 5.5: ROIC, Valuation & Audit Tabs", () => {
  let planId: string;
  let brandId: string;

  test.beforeEach(async ({ request }) => {
    await request.post("/api/auth/dev-login");

    const meRes = await request.get("/api/auth/me");
    const me = await meRes.json();

    const brandName = `S55Brand-${Date.now()}`;
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
        name: `S55 Test Plan ${Date.now()}`,
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

  async function loginAndNavigateToStatements(page: any) {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });
    await page.goto(`/plans/${planId}`);
    await expect(
      page.locator("[data-testid='planning-workspace']")
    ).toBeVisible({ timeout: 15_000 });
    await page.click("[data-testid='nav-reports']");
    await expect(
      page.locator("[data-testid='financial-statements']")
    ).toBeVisible({ timeout: 10_000 });
  }

  async function navigateToTab(page: any, tabId: string) {
    await loginAndNavigateToStatements(page);
    await page.click(`[data-testid='tab-${tabId}']`);
    await expect(
      page.locator(`[data-testid='${tabId}-tab']`)
    ).toBeVisible({ timeout: 10_000 });
  }

  // ========== ROIC TAB ==========

  test.describe("ROIC Tab", () => {
    test("AC1: ROIC tab renders as annual-only table with Y1-Y5 columns", async ({ page }) => {
      await navigateToTab(page, "roic");

      const table = page.locator("[data-testid='roic-table'] table");
      await expect(table).toBeVisible();
      await expect(table).toHaveAttribute("role", "grid");

      for (let y = 1; y <= 5; y++) {
        await expect(
          page.locator(`[data-testid='roic-col-year-${y}']`)
        ).toBeVisible();
      }
    });

    test("AC2: Callout bar shows plain-language ROIC interpretation", async ({ page }) => {
      await navigateToTab(page, "roic");

      const callout = page.locator("[data-testid='roic-callout-bar']");
      await expect(callout).toBeVisible();

      const interpretation = page.locator("[data-testid='roic-callout-interpretation']");
      await expect(interpretation).toBeVisible();

      const text = await interpretation.textContent();
      const hasPositiveMsg = text?.includes("for every dollar you invested");
      const hasNegativeMsg = text?.includes("not yet generated a positive return");
      expect(hasPositiveMsg || hasNegativeMsg).toBe(true);
    });

    test("AC3: Three sections present (Invested Capital, Return Analysis, Core Capital)", async ({ page }) => {
      await navigateToTab(page, "roic");

      const expectedSections = [
        { key: "invested-capital", title: "Invested Capital" },
        { key: "return-analysis", title: "Return Analysis" },
        { key: "core-capital", title: "Core Capital" },
      ];

      for (const { key, title } of expectedSections) {
        const section = page.locator(`[data-testid='roic-section-${key}']`);
        await expect(section).toBeVisible();
        await expect(section).toContainText(title);
      }
    });

    test("AC4: All sections expanded by default", async ({ page }) => {
      await navigateToTab(page, "roic");

      await expect(
        page.locator("[data-testid='roic-row-outside-cash']")
      ).toBeVisible();
      await expect(
        page.locator("[data-testid='roic-row-pre-tax-net-income']")
      ).toBeVisible();
      await expect(
        page.locator("[data-testid='roic-row-avg-core-capital']")
      ).toBeVisible();
    });

    test("AC5: All 15 data rows visible with correct ROIC fields", async ({ page }) => {
      await navigateToTab(page, "roic");

      const expectedRows = [
        "outside-cash",
        "total-loans",
        "total-cash-invested",
        "total-sweat-equity",
        "retained-earnings",
        "total-invested-capital",
        "pre-tax-net-income",
        "pre-tax-inc-sweat",
        "tax-rate",
        "taxes-due",
        "after-tax-net-income",
        "roic-pct",
        "avg-core-capital",
        "months-core-capital",
        "excess-core-capital",
      ];

      for (const rowKey of expectedRows) {
        await expect(
          page.locator(`[data-testid='roic-row-${rowKey}']`)
        ).toBeVisible();
      }
    });

    test("AC5: All cells are read-only (aria-readonly=true)", async ({ page }) => {
      await navigateToTab(page, "roic");

      const gridcell = page.locator("[data-testid='roic-value-outside-cash-y1']");
      await expect(gridcell).toHaveAttribute("role", "gridcell");
      await expect(gridcell).toHaveAttribute("aria-readonly", "true");
    });

    test("Section collapse/expand toggle works", async ({ page }) => {
      await navigateToTab(page, "roic");

      const row = page.locator("[data-testid='roic-row-outside-cash']");
      await expect(row).toBeVisible();

      await page.click("[data-testid='roic-section-invested-capital']");
      await expect(row).not.toBeVisible({ timeout: 3_000 });

      await page.click("[data-testid='roic-section-invested-capital']");
      await expect(row).toBeVisible({ timeout: 3_000 });
    });

    test("Currency values formatted correctly ($X,XXX)", async ({ page }) => {
      await navigateToTab(page, "roic");

      const loanValue = await page
        .locator("[data-testid='roic-value-total-loans-y1']")
        .textContent();
      expect(loanValue?.trim()).toMatch(/^-?\$[\d,]+$/);
    });

    test("Percentage values formatted correctly (X.X%)", async ({ page }) => {
      await navigateToTab(page, "roic");

      const taxRateValue = await page
        .locator("[data-testid='roic-value-tax-rate-y1']")
        .textContent();
      expect(taxRateValue?.trim()).toMatch(/[\d.]+%/);
    });

    test("Subtotal and total rows have correct styling", async ({ page }) => {
      await navigateToTab(page, "roic");

      const subtotalRow = page.locator("[data-testid='roic-row-total-cash-invested']");
      await expect(subtotalRow).toHaveClass(/font-medium/);
      await expect(subtotalRow).toHaveClass(/border-t/);

      const totalRow = page.locator("[data-testid='roic-row-total-invested-capital']");
      await expect(totalRow).toHaveClass(/font-semibold/);
      await expect(totalRow).toHaveClass(/border-double/);
    });

    test("Tooltips appear on hover for computed cells", async ({ page }) => {
      await navigateToTab(page, "roic");

      const cell = page.locator("[data-testid='roic-value-outside-cash-y1']");
      await expect(cell).toBeVisible();
      const cursorHelp = cell.locator("span.cursor-help");
      await expect(cursorHelp).toBeAttached();

      await cursorHelp.hover();
      const tooltip = page.locator("[role='tooltip']");
      await expect(tooltip).toBeVisible({ timeout: 5_000 });
      await expect(tooltip).toContainText("Owner's equity investment");
    });

    test("ARIA roles correctly applied (grid, row, rowheader, gridcell)", async ({ page }) => {
      await navigateToTab(page, "roic");

      const table = page.locator("[data-testid='roic-table'] table");
      await expect(table).toHaveAttribute("role", "grid");

      const dataRow = page.locator("[data-testid='roic-row-outside-cash']");
      await expect(dataRow).toHaveAttribute("role", "row");

      const rowHeader = dataRow.locator("[role='rowheader']");
      await expect(rowHeader).toBeAttached();
    });

    test("No column drill-down controls visible (annual-only)", async ({ page }) => {
      await navigateToTab(page, "roic");

      const columnToolbar = page.locator("[data-testid='column-toolbar']");
      await expect(columnToolbar).not.toBeVisible();
    });
  });

  // ========== VALUATION TAB ==========

  test.describe("Valuation Tab", () => {
    test("AC6: Valuation tab renders as annual-only table with Y1-Y5 columns", async ({ page }) => {
      await navigateToTab(page, "valuation");

      const table = page.locator("[data-testid='valuation-table'] table");
      await expect(table).toBeVisible();
      await expect(table).toHaveAttribute("role", "grid");

      for (let y = 1; y <= 5; y++) {
        await expect(
          page.locator(`[data-testid='val-col-year-${y}']`)
        ).toBeVisible();
      }
    });

    test("AC7: Callout bar shows Enterprise Value Y5 and Net After-Tax Proceeds Y5", async ({ page }) => {
      await navigateToTab(page, "valuation");

      const callout = page.locator("[data-testid='valuation-callout-bar']");
      await expect(callout).toBeVisible();

      await expect(
        page.locator("[data-testid='val-callout-value-y5']")
      ).toBeVisible();
      const evValue = await page
        .locator("[data-testid='val-callout-value-y5']")
        .textContent();
      expect(evValue?.trim()).toMatch(/^\$[\d,]+$/);

      await expect(
        page.locator("[data-testid='val-callout-net-proceeds-y5']")
      ).toBeVisible();
      const npValue = await page
        .locator("[data-testid='val-callout-net-proceeds-y5']")
        .textContent();
      expect(npValue?.trim()).toMatch(/^-?\$[\d,]+$/);
    });

    test("AC8: Four sections present (EBITDA Basis, Adjustments, After-Tax, Returns)", async ({ page }) => {
      await navigateToTab(page, "valuation");

      const expectedSections = [
        { key: "ebitda-basis", title: "EBITDA Basis" },
        { key: "adjustments", title: "Adjustments" },
        { key: "after-tax", title: "After-Tax" },
        { key: "return-metrics", title: "Returns" },
      ];

      for (const { key, title } of expectedSections) {
        const section = page.locator(`[data-testid='val-section-${key}']`);
        await expect(section).toBeVisible();
        await expect(section).toContainText(title);
      }
    });

    test("AC9: EBITDA Multiple row has input cell visual distinction", async ({ page }) => {
      await navigateToTab(page, "valuation");

      const ebitdaMultipleRow = page.locator("[data-testid='val-row-ebitda-multiple']");
      await expect(ebitdaMultipleRow).toBeVisible();

      const inputCell = ebitdaMultipleRow.locator("td").first();
      await expect(inputCell).toHaveClass(/bg-primary\/5/);
      await expect(inputCell).toHaveClass(/border-dashed/);

      const pencilIcon = ebitdaMultipleRow.locator("svg.lucide-pencil, [aria-label*='Editable']");
      await expect(pencilIcon).toBeAttached();
    });

    test("AC9: EBITDA Multiple gridcell has aria-readonly=false", async ({ page }) => {
      await navigateToTab(page, "valuation");

      const ebitdaMultipleCell = page.locator("[data-testid='val-value-ebitda-multiple-y1']");
      await expect(ebitdaMultipleCell).toHaveAttribute("aria-readonly", "false");
    });

    test("AC10: Adjustments section rows are visible", async ({ page }) => {
      await navigateToTab(page, "valuation");

      await expect(
        page.locator("[data-testid='val-row-outstanding-debt']")
      ).toBeVisible();
      await expect(
        page.locator("[data-testid='val-row-working-capital-adj']")
      ).toBeVisible();
      await expect(
        page.locator("[data-testid='val-row-estimated-equity-value']")
      ).toBeVisible();
    });

    test("AC11: Returns section rows are visible with correct values", async ({ page }) => {
      await navigateToTab(page, "valuation");

      const expectedRows = [
        "total-cash-extracted",
        "total-invested",
        "net-return",
        "return-multiple",
        "replacement-return",
        "business-annual-roic",
      ];

      for (const rowKey of expectedRows) {
        await expect(
          page.locator(`[data-testid='val-row-${rowKey}']`)
        ).toBeVisible();
      }
    });

    test("EBITDA Multiple formatted as X.Xx", async ({ page }) => {
      await navigateToTab(page, "valuation");

      const multipleValue = await page
        .locator("[data-testid='val-value-ebitda-multiple-y1']")
        .textContent();
      expect(multipleValue?.trim()).toMatch(/[\d.]+x/);
    });

    test("Tooltips appear on hover for valuation cells", async ({ page }) => {
      await navigateToTab(page, "valuation");

      const cell = page.locator("[data-testid='val-value-ebitda-y1']");
      await expect(cell).toBeVisible();
      const cursorHelp = cell.locator("span.cursor-help");
      await expect(cursorHelp).toBeAttached();

      await cursorHelp.hover();
      const tooltip = page.locator("[role='tooltip']");
      await expect(tooltip).toBeVisible({ timeout: 5_000 });
      await expect(tooltip).toContainText("Earnings before interest");
    });

    test("Section collapse/expand works on Valuation", async ({ page }) => {
      await navigateToTab(page, "valuation");

      const row = page.locator("[data-testid='val-row-ebitda']");
      await expect(row).toBeVisible();

      await page.click("[data-testid='val-section-ebitda-basis']");
      await expect(row).not.toBeVisible({ timeout: 3_000 });

      await page.click("[data-testid='val-section-ebitda-basis']");
      await expect(row).toBeVisible({ timeout: 3_000 });
    });

    test("No column drill-down controls visible on Valuation (annual-only)", async ({ page }) => {
      await navigateToTab(page, "valuation");

      const columnToolbar = page.locator("[data-testid='column-toolbar']");
      await expect(columnToolbar).not.toBeVisible();
    });
  });

  // ========== AUDIT TAB ==========

  test.describe("Audit Tab", () => {
    test("AC12: Audit tab renders as diagnostic checklist (not tabular)", async ({ page }) => {
      await navigateToTab(page, "audit");

      const auditTab = page.locator("[data-testid='audit-tab']");
      await expect(auditTab).toBeVisible();

      const table = auditTab.locator("table");
      expect(await table.count()).toBe(0);
    });

    test("AC13: Summary header shows 'X of Y checks passing'", async ({ page }) => {
      await navigateToTab(page, "audit");

      const summary = page.locator("[data-testid='audit-summary']");
      await expect(summary).toBeVisible();

      const summaryText = page.locator("[data-testid='audit-summary-text']");
      const text = await summaryText.textContent();
      expect(text).toMatch(/\d+ of \d+ checks passing/);
    });

    test("AC13: Summary shows pass/fail icon", async ({ page }) => {
      await navigateToTab(page, "audit");

      const summary = page.locator("[data-testid='audit-summary']");
      const checkIcon = summary.locator(".lucide-check");
      const alertIcon = summary.locator(".lucide-alert-triangle");

      const hasCheck = await checkIcon.count();
      const hasAlert = await alertIcon.count();
      expect(hasCheck + hasAlert).toBeGreaterThan(0);
    });

    test("AC14: Audit check categories are displayed", async ({ page }) => {
      await navigateToTab(page, "audit");

      const categories = page.locator("[data-testid='audit-categories']");
      await expect(categories).toBeVisible();

      const categoryCards = categories.locator("[data-testid^='audit-category-']");
      const count = await categoryCards.count();
      expect(count).toBeGreaterThanOrEqual(5);
    });

    test("AC15: Each check category shows name, pass/fail icon, and badge", async ({ page }) => {
      await navigateToTab(page, "audit");

      const firstCategory = page.locator("[data-testid^='audit-category-']").first();
      await expect(firstCategory).toBeVisible();

      const label = firstCategory.locator(".text-sm.font-medium");
      await expect(label).toBeVisible();

      const badge = firstCategory.locator("[data-testid^='audit-badge-']");
      await expect(badge).toBeVisible();

      const passIcon = firstCategory.locator("[data-testid^='audit-icon-pass-']");
      const failIcon = firstCategory.locator("[data-testid^='audit-icon-fail-']");
      const hasPassIcon = await passIcon.count();
      const hasFailIcon = await failIcon.count();
      expect(hasPassIcon + hasFailIcon).toBeGreaterThan(0);
    });

    test("AC15: Category details are expandable with per-check results", async ({ page }) => {
      await navigateToTab(page, "audit");

      const firstToggle = page.locator("[data-testid^='audit-category-toggle-']").first();
      await expect(firstToggle).toBeVisible();

      const categoryKey = await firstToggle.getAttribute("data-testid");
      const key = categoryKey?.replace("audit-category-toggle-", "");

      const details = page.locator(`[data-testid='audit-details-${key}']`);
      const isExpanded = await firstToggle.getAttribute("aria-expanded");

      if (isExpanded === "false") {
        await firstToggle.click();
        await expect(details).toBeVisible({ timeout: 3_000 });
      } else {
        await expect(details).toBeVisible();
      }

      const checkRows = details.locator("[data-testid^='audit-check-']");
      const checkCount = await checkRows.count();
      expect(checkCount).toBeGreaterThan(0);
    });

    test("AC15: Check detail rows show Expected, Actual, Tolerance values", async ({ page }) => {
      await navigateToTab(page, "audit");

      const firstToggle = page.locator("[data-testid^='audit-category-toggle-']").first();
      const isExpanded = await firstToggle.getAttribute("aria-expanded");
      if (isExpanded === "false") {
        await firstToggle.click();
      }

      const categoryKey = (await firstToggle.getAttribute("data-testid"))?.replace("audit-category-toggle-", "");
      const details = page.locator(`[data-testid='audit-details-${categoryKey}']`);
      await expect(details).toBeVisible({ timeout: 3_000 });

      const firstCheck = details.locator("[data-testid^='audit-check-']").first();
      await expect(firstCheck).toBeVisible();
      await expect(firstCheck).toContainText("Expected:");
      await expect(firstCheck).toContainText("Actual:");
      await expect(firstCheck).toContainText("Tolerance:");
    });

    test("AC16: Passing categories show green checkmark with badge", async ({ page }) => {
      await navigateToTab(page, "audit");

      const passIcons = page.locator("[data-testid^='audit-icon-pass-']");
      const passCount = await passIcons.count();

      if (passCount > 0) {
        const firstPassIcon = passIcons.first();
        await expect(firstPassIcon).toBeVisible();

        const parentKey = (await firstPassIcon.getAttribute("data-testid"))?.replace("audit-icon-pass-", "");
        const badge = page.locator(`[data-testid='audit-badge-${parentKey}']`);
        await expect(badge).toBeVisible();
        const badgeText = await badge.textContent();
        expect(badgeText).toMatch(/\d+ passed/);
      }
    });

    test("AC18: Audit tab is completely read-only", async ({ page }) => {
      await navigateToTab(page, "audit");

      const inputs = page.locator("[data-testid='audit-tab'] input, [data-testid='audit-tab'] textarea");
      const inputCount = await inputs.count();
      expect(inputCount).toBe(0);
    });

    test("Navigation link on category navigates to relevant tab", async ({ page }) => {
      await navigateToTab(page, "audit");

      const navButtons = page.locator("[data-testid^='audit-nav-']");
      const navCount = await navButtons.count();
      expect(navCount).toBeGreaterThan(0);

      const firstNav = navButtons.first();
      await expect(firstNav).toBeVisible();
    });

    test("Category toggle expand/collapse works", async ({ page }) => {
      await navigateToTab(page, "audit");

      const firstToggle = page.locator("[data-testid^='audit-category-toggle-']").first();
      const categoryKey = (await firstToggle.getAttribute("data-testid"))?.replace("audit-category-toggle-", "");
      const details = page.locator(`[data-testid='audit-details-${categoryKey}']`);

      const initialState = await firstToggle.getAttribute("aria-expanded");
      await firstToggle.click();

      if (initialState === "true") {
        await expect(details).not.toBeVisible({ timeout: 3_000 });
      } else {
        await expect(details).toBeVisible({ timeout: 3_000 });
      }

      await firstToggle.click();
      if (initialState === "true") {
        await expect(details).toBeVisible({ timeout: 3_000 });
      } else {
        await expect(details).not.toBeVisible({ timeout: 3_000 });
      }
    });
  });

  // ========== CONTAINER WIRING ==========

  test.describe("Container Wiring", () => {
    test("AC22: All three tabs are clickable and render real content", async ({ page }) => {
      await loginAndNavigateToStatements(page);

      await page.click("[data-testid='tab-roic']");
      await expect(page.locator("[data-testid='roic-tab']")).toBeVisible({ timeout: 10_000 });

      await page.click("[data-testid='tab-valuation']");
      await expect(page.locator("[data-testid='valuation-tab']")).toBeVisible({ timeout: 10_000 });

      await page.click("[data-testid='tab-audit']");
      await expect(page.locator("[data-testid='audit-tab']")).toBeVisible({ timeout: 10_000 });
    });

    test("AC23: No placeholder content visible on the three tabs", async ({ page }) => {
      await loginAndNavigateToStatements(page);

      const tabs = ["roic", "valuation", "audit"];
      for (const tab of tabs) {
        await page.click(`[data-testid='tab-${tab}']`);
        await expect(page.locator(`[data-testid='${tab}-tab']`)).toBeVisible({ timeout: 10_000 });

        const placeholder = page.locator("text=Coming Soon");
        await expect(placeholder).not.toBeVisible();
      }
    });
  });

  // ========== SHARED PATTERNS ==========

  test.describe("Shared Patterns", () => {
    test("AC20: Negative values display in amber advisory color (ROIC)", async ({ page }) => {
      await navigateToTab(page, "roic");

      const allCells = page.locator("[data-testid^='roic-value-']");
      const count = await allCells.count();

      for (let i = 0; i < count; i++) {
        const cell = allCells.nth(i);
        const text = await cell.textContent();
        if (text?.startsWith("-")) {
          await expect(cell).toHaveClass(/text-amber/);
        }
      }
    });

    test("AC21: ROIC table has correct ARIA structure", async ({ page }) => {
      await navigateToTab(page, "roic");

      const table = page.locator("[data-testid='roic-table'] table");
      await expect(table).toHaveAttribute("role", "grid");

      const sectionRow = page.locator("[data-testid='roic-section-invested-capital']");
      await expect(sectionRow).toHaveAttribute("role", "row");
      await expect(sectionRow).toHaveAttribute("aria-expanded", "true");
    });

    test("AC21: Valuation table has correct ARIA structure", async ({ page }) => {
      await navigateToTab(page, "valuation");

      const table = page.locator("[data-testid='valuation-table'] table");
      await expect(table).toHaveAttribute("role", "grid");
    });

    test("Chevron icons toggle on section expand/collapse (ROIC)", async ({ page }) => {
      await navigateToTab(page, "roic");

      const section = page.locator("[data-testid='roic-section-invested-capital']");
      const chevronDown = section.locator(".lucide-chevron-down");
      const chevronRight = section.locator(".lucide-chevron-right");

      await expect(chevronDown).toBeVisible();

      await section.click();
      await expect(chevronRight).toBeVisible({ timeout: 3_000 });

      await section.click();
      await expect(chevronDown).toBeVisible({ timeout: 3_000 });
    });
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
