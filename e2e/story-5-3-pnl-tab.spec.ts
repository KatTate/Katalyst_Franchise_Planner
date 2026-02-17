import { test, expect } from "@playwright/test";

test.describe("Story 5.3: P&L Statement Tab", () => {
  let planId: string;
  let brandId: string;

  test.beforeEach(async ({ request }) => {
    await request.post("/api/auth/dev-login");

    const meRes = await request.get("/api/auth/me");
    const me = await meRes.json();

    const brandName = `PnlBrand-${Date.now()}`;
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
        name: `PnL Test Plan ${Date.now()}`,
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

  async function loginAndNavigateToPnl(page: any) {
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
    await page.click("[data-testid='tab-pnl']");
    await expect(page.locator("[data-testid='pnl-tab']")).toBeVisible({
      timeout: 10_000,
    });
  }

  test("AC1: Callout bar shows Annual Revenue Y1, Pre-Tax Income Y1, and Pre-Tax Margin %", async ({
    page,
  }) => {
    await loginAndNavigateToPnl(page);

    const calloutBar = page.locator("[data-testid='pnl-callout-bar']");
    await expect(calloutBar).toBeVisible();

    await expect(
      page.locator("[data-testid='pnl-callout-revenue-y1']")
    ).toBeVisible();
    const revenueValue = await page
      .locator("[data-testid='pnl-callout-revenue-y1']")
      .textContent();
    expect(revenueValue).toMatch(/^\$[\d,]+$/);

    await expect(
      page.locator("[data-testid='pnl-callout-pretax-y1']")
    ).toBeVisible();
    const pretaxValue = await page
      .locator("[data-testid='pnl-callout-pretax-y1']")
      .textContent();
    expect(pretaxValue).toMatch(/^-?\$[\d,]+$/);

    await expect(
      page.locator("[data-testid='pnl-callout-margin-y1']")
    ).toBeVisible();
    const marginValue = await page
      .locator("[data-testid='pnl-callout-margin-y1']")
      .textContent();
    expect(marginValue).toMatch(/-?[\d.]+%/);

    await expect(calloutBar).toContainText("Annual Revenue (Y1)");
    await expect(calloutBar).toContainText("Pre-Tax Income (Y1)");
    await expect(calloutBar).toContainText("Pre-Tax Margin %");
  });

  test("AC3: All 8 row sections are present with correct titles", async ({
    page,
  }) => {
    await loginAndNavigateToPnl(page);

    const expectedSections = [
      { key: "revenue", title: "Revenue" },
      { key: "cogs", title: "Cost of Sales" },
      { key: "gross-profit", title: "Gross Profit" },
      { key: "opex", title: "Operating Expenses" },
      { key: "ebitda", title: "EBITDA" },
      { key: "below-ebitda", title: "Below EBITDA" },
      { key: "pretax", title: "Pre-Tax Income" },
      { key: "pl-analysis", title: "P&L Analysis" },
    ];

    for (const { key, title } of expectedSections) {
      const section = page.locator(`[data-testid='pnl-section-${key}']`);
      await expect(section).toBeVisible();
      await expect(section).toContainText(title);
    }
  });

  test("AC4-5: Sections collapse/expand, P&L Analysis starts collapsed", async ({
    page,
  }) => {
    await loginAndNavigateToPnl(page);

    const revenueRows = page.locator("[data-testid='pnl-row-monthly-revenue']");
    await expect(revenueRows).toBeVisible();

    const plAnalysisRow = page.locator("[data-testid='pnl-row-adj-pretax']");
    await expect(plAnalysisRow).not.toBeVisible();

    await page.click("[data-testid='pnl-section-pl-analysis']");
    await expect(plAnalysisRow).toBeVisible({ timeout: 3_000 });

    await page.click("[data-testid='pnl-section-pl-analysis']");
    await expect(plAnalysisRow).not.toBeVisible({ timeout: 3_000 });

    await page.click("[data-testid='pnl-section-revenue']");
    await expect(revenueRows).not.toBeVisible({ timeout: 3_000 });

    await page.click("[data-testid='pnl-section-revenue']");
    await expect(revenueRows).toBeVisible({ timeout: 3_000 });
  });

  test("AC3: Key rows are present in each section", async ({ page }) => {
    await loginAndNavigateToPnl(page);

    const revenueRows = [
      "pnl-row-monthly-revenue",
      "pnl-row-annual-revenue",
    ];
    for (const testId of revenueRows) {
      await expect(page.locator(`[data-testid='${testId}']`)).toBeVisible();
    }

    const cogsRows = [
      "pnl-row-cogs-pct",
      "pnl-row-materials-cogs",
      "pnl-row-royalties",
      "pnl-row-ad-fund",
      "pnl-row-total-cogs",
    ];
    for (const testId of cogsRows) {
      await expect(page.locator(`[data-testid='${testId}']`)).toBeVisible();
    }

    const gpRows = ["pnl-row-gross-profit", "pnl-row-gp-pct"];
    for (const testId of gpRows) {
      await expect(page.locator(`[data-testid='${testId}']`)).toBeVisible();
    }

    const opexRows = [
      "pnl-row-direct-labor",
      "pnl-row-dl-pct",
      "pnl-row-mgmt-salaries",
      "pnl-row-payroll-tax",
      "pnl-row-facilities",
      "pnl-row-marketing",
      "pnl-row-disc-marketing",
      "pnl-row-other-opex",
      "pnl-row-total-opex",
    ];
    for (const testId of opexRows) {
      await expect(page.locator(`[data-testid='${testId}']`)).toBeVisible();
    }

    const ebitdaRows = ["pnl-row-ebitda", "pnl-row-ebitda-pct"];
    for (const testId of ebitdaRows) {
      await expect(page.locator(`[data-testid='${testId}']`)).toBeVisible();
    }

    const belowEbitdaRows = ["pnl-row-depreciation", "pnl-row-interest"];
    for (const testId of belowEbitdaRows) {
      await expect(page.locator(`[data-testid='${testId}']`)).toBeVisible();
    }

    const pretaxRows = ["pnl-row-pretax-income", "pnl-row-pretax-pct"];
    for (const testId of pretaxRows) {
      await expect(page.locator(`[data-testid='${testId}']`)).toBeVisible();
    }

    await page.click("[data-testid='pnl-section-pl-analysis']");
    const plAnalysisRows = [
      "pnl-row-adj-pretax",
      "pnl-row-target-pretax",
      "pnl-row-above-below-target",
      "pnl-row-salary-cap",
      "pnl-row-over-under-cap",
      "pnl-row-labor-eff",
      "pnl-row-adj-labor-eff",
      "pnl-row-disc-mktg-pct",
      "pnl-row-pr-tax-ben-pct",
      "pnl-row-other-opex-pct-rev",
    ];
    for (const testId of plAnalysisRows) {
      await expect(page.locator(`[data-testid='${testId}']`)).toBeVisible({
        timeout: 3_000,
      });
    }
  });

  test("AC6-7: Input rows have visual distinction (tinted background, dashed border)", async ({
    page,
  }) => {
    await loginAndNavigateToPnl(page);

    const inputRow = page.locator("[data-testid='pnl-row-monthly-revenue']");
    await expect(inputRow).toBeVisible();
    const inputCell = inputRow.locator("td").first();
    await expect(inputCell).toHaveClass(/bg-primary\/5/);
    await expect(inputCell).toHaveClass(/border-dashed/);

    const pencilIcon = inputRow.locator("svg.lucide-pencil, [aria-label='Editable field']");
    await expect(pencilIcon).toBeAttached();

    const computedRow = page.locator("[data-testid='pnl-row-annual-revenue']");
    const computedCell = computedRow.locator("td").first();
    await expect(computedCell).not.toHaveClass(/bg-primary\/5/);
  });

  test("AC8: Subtotal rows have top border, total rows have double top border", async ({
    page,
  }) => {
    await loginAndNavigateToPnl(page);

    const subtotalRow = page.locator("[data-testid='pnl-row-annual-revenue']");
    await expect(subtotalRow).toHaveClass(/font-medium/);
    await expect(subtotalRow).toHaveClass(/border-t/);

    const totalRow = page.locator("[data-testid='pnl-row-pretax-income']");
    await expect(totalRow).toHaveClass(/font-semibold/);
    await expect(totalRow).toHaveClass(/border-double/);
  });

  test("AC9-10: Interpretation rows below key metrics with neutral language", async ({
    page,
  }) => {
    await loginAndNavigateToPnl(page);

    const grossProfitInterp = page.locator("[data-testid='pnl-interp-gross-profit']");
    await expect(grossProfitInterp).toBeVisible();
    const gpText = await grossProfitInterp.textContent();
    expect(gpText).toMatch(/[\d.]+% gross margin in Year 1/);
    expect(gpText).not.toMatch(/good|bad|poor|excellent/i);

    const pretaxInterp = page.locator("[data-testid='pnl-interp-pretax-income']");
    await expect(pretaxInterp).toBeVisible();
    const ptText = await pretaxInterp.textContent();
    expect(ptText).toMatch(/[\d.]+% pre-tax margin in Year 1/);
    expect(ptText).not.toMatch(/good|bad|poor|excellent/i);

    await page.click("[data-testid='pnl-section-pl-analysis']");
    const laborInterp = page.locator("[data-testid='pnl-interp-labor-eff']");
    await expect(laborInterp).toBeVisible({ timeout: 3_000 });
    const laborText = await laborInterp.textContent();
    expect(laborText).toContain("Ratio of gross profit consumed by all wages");
  });

  test("AC11: Interpretation rows linked via aria-describedby", async ({
    page,
  }) => {
    await loginAndNavigateToPnl(page);

    const grossProfitRow = page.locator("[data-testid='pnl-row-gross-profit']");
    const ariaDescribedBy = await grossProfitRow.getAttribute("aria-describedby");
    expect(ariaDescribedBy).toBe("interp-gross-profit");

    const interpRow = page.locator("#interp-gross-profit, [id='interp-gross-profit']");
    await expect(interpRow).toBeAttached();
  });

  test("AC12-13: Computed cell tooltips with explanation, formula, and glossary link", async ({
    page,
  }) => {
    await loginAndNavigateToPnl(page);

    const annualRevenueCell = page.locator(
      "[data-testid='pnl-value-annual-revenue-y1']"
    );
    await expect(annualRevenueCell).toBeVisible();
    await annualRevenueCell.locator("span").hover();

    const tooltipContent = page.locator("[role='tooltip']");
    await expect(tooltipContent).toBeVisible({ timeout: 5_000 });

    await expect(tooltipContent).toContainText("Total revenue earned during the year");
    await expect(tooltipContent).toContainText("Sum of monthly revenue");

    const glossaryLink = page.locator("[data-testid='glossary-link-annual-revenue']");
    await expect(glossaryLink).toBeVisible();
    await expect(glossaryLink).toContainText("View in glossary");
  });

  test("AC14-15: ARIA grid roles are correctly applied", async ({ page }) => {
    await loginAndNavigateToPnl(page);

    const table = page.locator("[data-testid='pnl-table'] table");
    await expect(table).toHaveAttribute("role", "grid");

    const dataRow = page.locator("[data-testid='pnl-row-monthly-revenue']");
    await expect(dataRow).toHaveAttribute("role", "row");

    const rowHeader = dataRow.locator("[role='rowheader']");
    await expect(rowHeader).toBeAttached();

    const inputGridcell = dataRow.locator("[role='gridcell']").first();
    await expect(inputGridcell).toHaveAttribute("aria-readonly", "false");

    const computedRow = page.locator("[data-testid='pnl-row-total-cogs']");
    const computedGridcell = computedRow.locator("[role='gridcell']").first();
    await expect(computedGridcell).toHaveAttribute("aria-readonly", "true");
  });

  test("AC2,17: Progressive disclosure — year column header click expands to quarterly", async ({
    page,
  }) => {
    await loginAndNavigateToPnl(page);

    await expect(page.locator("[data-testid='pnl-header-y1']")).toBeVisible();
    await expect(page.locator("[data-testid='pnl-header-y2']")).toBeVisible();
    await expect(page.locator("[data-testid='pnl-header-y3']")).toBeVisible();

    await page.click("[data-testid='pnl-header-y1']");

    await expect(
      page.locator("[data-testid='pnl-header-y1-q1'], [data-testid^='pnl-header-y1-q']").first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test("AC13: Multiple computed rows have tooltips", async ({ page }) => {
    await loginAndNavigateToPnl(page);

    const computedRowsWithTooltips = [
      "pnl-value-annual-revenue-y1",
      "pnl-value-total-cogs-y1",
      "pnl-value-gross-profit-y1",
      "pnl-value-gp-pct-y1",
      "pnl-value-total-opex-y1",
      "pnl-value-ebitda-y1",
      "pnl-value-pretax-income-y1",
    ];

    for (const testId of computedRowsWithTooltips) {
      const cell = page.locator(`[data-testid='${testId}']`);
      await expect(cell).toBeVisible();
      const cursorHelp = cell.locator("span.cursor-help");
      await expect(cursorHelp).toBeAttached();
    }
  });

  test("AC16: Monthly Revenue shows average at annual level", async ({
    page,
  }) => {
    await loginAndNavigateToPnl(page);

    const monthlyRevText = await page
      .locator("[data-testid='pnl-value-monthly-revenue-y1']")
      .textContent();
    const annualRevText = await page
      .locator("[data-testid='pnl-value-annual-revenue-y1']")
      .textContent();

    const parseCurrency = (s: string | null) =>
      parseInt((s || "").replace(/[$,]/g, ""), 10);
    const monthlyRevValue = parseCurrency(monthlyRevText);
    const annualRevValue = parseCurrency(annualRevText);

    expect(monthlyRevValue).toBeGreaterThan(0);
    expect(annualRevValue).toBeGreaterThan(0);

    const expectedAverage = Math.round(annualRevValue / 12);
    expect(Math.abs(monthlyRevValue - expectedAverage)).toBeLessThanOrEqual(1);
  });

  test("Currency values formatted as $X,XXX and percentages as X.X%", async ({
    page,
  }) => {
    await loginAndNavigateToPnl(page);

    const revenueValue = await page
      .locator("[data-testid='pnl-value-annual-revenue-y1']")
      .textContent();
    expect(revenueValue?.trim()).toMatch(/^\$[\d,]+$/);

    const cogsPctValue = await page
      .locator("[data-testid='pnl-value-cogs-pct-y1']")
      .textContent();
    expect(cogsPctValue?.trim()).toMatch(/[\d.]+%/);
  });

  test("Chevron icons toggle with expand/collapse state", async ({ page }) => {
    await loginAndNavigateToPnl(page);

    const revenueSection = page.locator("[data-testid='pnl-section-revenue']");
    const chevronDown = revenueSection.locator(".lucide-chevron-down");
    const chevronRight = revenueSection.locator(".lucide-chevron-right");

    await expect(chevronDown).toBeVisible();

    await revenueSection.click();
    await expect(chevronRight).toBeVisible({ timeout: 3_000 });

    await revenueSection.click();
    await expect(chevronDown).toBeVisible({ timeout: 3_000 });
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
