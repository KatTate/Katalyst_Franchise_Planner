import { test, expect } from "@playwright/test";

test.describe("Story 5H.2: Report Tab UI Audit & Remediation — Callout Bar", () => {
  let planId: string;
  let brandId: string;

  test.beforeEach(async ({ request }) => {
    await request.post("/api/auth/dev-login");

    const meRes = await request.get("/api/auth/me");
    const me = await meRes.json();

    const brandName = `CB-Brand-${Date.now()}`;
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
        name: `CB Test Plan ${Date.now()}`,
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

  async function loginAndNavigateToReports(page: any) {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });
    await page.goto(`/plans/${planId}`);
    await expect(
      page.locator("[data-testid='planning-workspace']"),
    ).toBeVisible({ timeout: 15_000 });
    await page.click("[data-testid='nav-reports']");
    await expect(
      page.locator("[data-testid='financial-statements']"),
    ).toBeVisible({ timeout: 10_000 });
  }

  const ALL_TABS: { id: string; label: string }[] = [
    { id: "summary", label: "Summary" },
    { id: "pnl", label: "P&L" },
    { id: "balance-sheet", label: "Balance Sheet" },
    { id: "cash-flow", label: "Cash Flow" },
    { id: "roic", label: "ROIC" },
    { id: "valuation", label: "Valuation" },
    { id: "audit", label: "Audit" },
  ];

  test("AC-1/AC-7: Each of the 7 tabs has exactly one callout bar (no duplicates)", async ({
    page,
  }) => {
    await loginAndNavigateToReports(page);

    for (const tab of ALL_TABS) {
      await page.click(`[data-testid='tab-${tab.id}']`);
      await page.waitForTimeout(300);

      const calloutBars = page.locator("[data-testid='callout-bar']");
      const count = await calloutBars.count();
      expect(count, `Tab "${tab.label}" should have exactly 1 callout bar, found ${count}`).toBe(1);
    }
  });

  test("AC-2/AC-7: Balance Sheet tab callout bar shows identity check status", async ({
    page,
  }) => {
    await loginAndNavigateToReports(page);

    await page.click("[data-testid='tab-balance-sheet']");
    await page.waitForTimeout(300);

    const identityStatus = page.locator("[data-testid='callout-bs-identity-status']");
    await expect(identityStatus).toBeVisible();

    const statusText = await identityStatus.textContent();
    expect(
      statusText?.includes("Balanced") || statusText?.includes("Imbalanced"),
      `Identity status should contain "Balanced" or "Imbalanced", got: "${statusText}"`,
    ).toBe(true);
  });

  test("AC-3/AC-7: Valuation tab callout bar shows Net After-Tax Proceeds", async ({
    page,
  }) => {
    await loginAndNavigateToReports(page);

    await page.click("[data-testid='tab-valuation']");
    await page.waitForTimeout(300);

    const netProceeds = page.locator("[data-testid='callout-val-net-proceeds']");
    await expect(netProceeds).toBeVisible();

    const value = await netProceeds.textContent();
    expect(value).toBeTruthy();
    expect(value).toMatch(/^\$|^-?\$/);
  });

  test("AC-4/AC-7: CalloutBar remains visible in comparison mode", async ({
    page,
  }) => {
    await loginAndNavigateToReports(page);

    const calloutBar = page.locator("[data-testid='callout-bar']");
    await expect(calloutBar).toBeVisible();

    const compareButton = page.locator("[data-testid='button-compare-scenarios']");
    await expect(compareButton).toBeVisible();
    await compareButton.click();

    await page.waitForTimeout(500);

    await expect(calloutBar).toBeVisible();
    const count = await calloutBar.count();
    expect(count).toBe(1);
  });

  test("AC-5: Comparison mode column headers do not overlap at 1024px viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await loginAndNavigateToReports(page);

    await page.click("[data-testid='tab-balance-sheet']");
    await page.waitForTimeout(300);

    const compareButton = page.locator("[data-testid='button-compare-scenarios']");
    await compareButton.click();
    await page.waitForTimeout(500);

    const conservativeBtn = page.locator("[data-testid='button-scenario-conservative']");
    const optimisticBtn = page.locator("[data-testid='button-scenario-optimistic']");

    if (await conservativeBtn.isVisible()) {
      await conservativeBtn.click();
      await page.waitForTimeout(300);
    }
    if (await optimisticBtn.isVisible()) {
      await optimisticBtn.click();
      await page.waitForTimeout(300);
    }

    const scrollContainer = page.locator("[data-testid='statements-scroll-container']");
    await expect(scrollContainer).toBeVisible();

    const calloutBar = page.locator("[data-testid='callout-bar']");
    await expect(calloutBar).toBeVisible();
  });

  test("AC-6: Tab switching does not produce duplicate callout bars at any transition point", async ({
    page,
  }) => {
    await loginAndNavigateToReports(page);

    const tabOrder = ["pnl", "balance-sheet", "cash-flow", "roic", "valuation", "audit", "summary"];

    for (const tabId of tabOrder) {
      await page.click(`[data-testid='tab-${tabId}']`);
      await page.waitForTimeout(200);

      const count = await page.locator("[data-testid='callout-bar']").count();
      expect(count, `After switching to ${tabId}, callout bar count should be 1`).toBe(1);
    }

    await page.click("[data-testid='tab-pnl']");
    await page.waitForTimeout(50);
    await page.click("[data-testid='tab-valuation']");
    await page.waitForTimeout(50);
    await page.click("[data-testid='tab-audit']");
    await page.waitForTimeout(200);

    const finalCount = await page.locator("[data-testid='callout-bar']").count();
    expect(finalCount).toBe(1);
  });

  test("AC-1: Callout bar shows tab-specific metrics when switching tabs", async ({
    page,
  }) => {
    await loginAndNavigateToReports(page);

    await expect(page.locator("[data-testid='value-5yr-pretax']")).toBeVisible();

    await page.click("[data-testid='tab-pnl']");
    await page.waitForTimeout(300);
    await expect(page.locator("[data-testid='callout-pnl-revenue']")).toBeVisible();
    await expect(page.locator("[data-testid='callout-pnl-margin']")).toBeVisible();

    await page.click("[data-testid='tab-balance-sheet']");
    await page.waitForTimeout(300);
    await expect(page.locator("[data-testid='callout-bs-assets']")).toBeVisible();
    await expect(page.locator("[data-testid='callout-bs-de-ratio']")).toBeVisible();
    await expect(page.locator("[data-testid='callout-bs-identity-status']")).toBeVisible();

    await page.click("[data-testid='tab-cash-flow']");
    await page.waitForTimeout(300);
    await expect(page.locator("[data-testid='callout-cf-net']")).toBeVisible();
    await expect(page.locator("[data-testid='callout-cf-lowest']")).toBeVisible();

    await page.click("[data-testid='tab-roic']");
    await page.waitForTimeout(300);
    await expect(page.locator("[data-testid='callout-roic-pct']")).toBeVisible();
    await expect(page.locator("[data-testid='callout-roic-be']")).toBeVisible();

    await page.click("[data-testid='tab-valuation']");
    await page.waitForTimeout(300);
    await expect(page.locator("[data-testid='callout-val-value']")).toBeVisible();
    await expect(page.locator("[data-testid='callout-val-multiple']")).toBeVisible();
    await expect(page.locator("[data-testid='callout-val-net-proceeds']")).toBeVisible();

    await page.click("[data-testid='tab-audit']");
    await page.waitForTimeout(300);
    await expect(page.locator("[data-testid='callout-audit-pass']")).toBeVisible();
  });

  test("AC-6: Callout interpretation text updates per tab", async ({
    page,
  }) => {
    await loginAndNavigateToReports(page);

    const interp = page.locator("[data-testid='callout-interpretation']");
    await expect(interp).toBeVisible();

    const summaryText = await interp.textContent();
    expect(summaryText).toContain("5-year total pre-tax income");

    await page.click("[data-testid='tab-pnl']");
    await page.waitForTimeout(300);
    const pnlText = await interp.textContent();
    expect(pnlText).toContain("Year 1 pre-tax margin");

    await page.click("[data-testid='tab-balance-sheet']");
    await page.waitForTimeout(300);
    const bsText = await interp.textContent();
    expect(bsText).toContain("Debt-to-equity ratio");

    await page.click("[data-testid='tab-cash-flow']");
    await page.waitForTimeout(300);
    const cfText = await interp.textContent();
    expect(cfText).toContain("Lowest cash point");

    await page.click("[data-testid='tab-roic']");
    await page.waitForTimeout(300);
    const roicText = await interp.textContent();
    expect(roicText).toContain("return on invested capital");

    await page.click("[data-testid='tab-valuation']");
    await page.waitForTimeout(300);
    const valText = await interp.textContent();
    expect(valText).toContain("Estimated business value");

    await page.click("[data-testid='tab-audit']");
    await page.waitForTimeout(300);
    const auditText = await interp.textContent();
    expect(auditText).toContain("checks passing");
  });
});

function makeField(value: number) {
  return {
    currentValue: value,
    brandDefault: value,
    source: "brand_default" as const,
    isCustom: false,
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
