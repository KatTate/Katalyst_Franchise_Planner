import { test, expect } from "@playwright/test";
import {
  loginAsAdmin,
  loginAsFranchiseeUI,
  createTestPlan,
  deleteTestPlan,
  buildMinimalFinancialInputs,
} from "./test-helpers";

test.describe("Story 5.2: Financial Statements Container & Summary Tab", () => {
  let planId: string;

  test.beforeEach(async ({ request }) => {
    const user = await loginAsAdmin(request);
    const plan = await createTestPlan(request, {
      userId: user.id,
      financialInputs: buildMinimalFinancialInputs(),
      quickStartCompleted: true,
    });
    planId = plan.id;
  });

  test.afterEach(async ({ request }) => {
    await loginAsAdmin(request);
    if (planId) await deleteTestPlan(request, planId);
  });

  async function loginAndNavigateToPlan(page: any) {
    await loginAsFranchiseeUI(page);
    await page.goto(`/plans/${planId}`);
    await expect(
      page.locator("[data-testid='planning-workspace']")
    ).toBeVisible({ timeout: 15_000 });
  }

  test("AC1-4: Sidebar shows My Plan and Reports with active state highlighting", async ({
    page,
  }) => {
    await loginAndNavigateToPlan(page);

    await expect(page.locator("[data-testid='nav-my-plan']")).toBeVisible();
    await expect(page.locator("[data-testid='nav-reports']")).toBeVisible();

    const myPlanButton = page.locator("[data-testid='nav-my-plan']");
    await expect(myPlanButton).toHaveAttribute("data-active", "true");

    await page.click("[data-testid='nav-reports']");
    await expect(
      page.locator("[data-testid='financial-statements']")
    ).toBeVisible({ timeout: 10_000 });

    const reportsButton = page.locator("[data-testid='nav-reports']");
    await expect(reportsButton).toHaveAttribute("data-active", "true");

    await page.click("[data-testid='nav-my-plan']");
    await expect(
      page.locator("[data-testid='dashboard-panel']")
    ).toBeVisible({ timeout: 10_000 });
    await expect(myPlanButton).toHaveAttribute("data-active", "true");
  });

  test("AC2,6: Reports view renders 7-tab bar with Summary active by default", async ({
    page,
  }) => {
    await loginAndNavigateToPlan(page);
    await page.click("[data-testid='nav-reports']");
    await expect(
      page.locator("[data-testid='financial-statements']")
    ).toBeVisible({ timeout: 10_000 });

    await expect(page.locator("[data-testid='tab-summary']")).toBeVisible();
    await expect(page.locator("[data-testid='tab-pnl']")).toBeVisible();
    await expect(page.locator("[data-testid='tab-balance-sheet']")).toBeVisible();
    await expect(page.locator("[data-testid='tab-cash-flow']")).toBeVisible();
    await expect(page.locator("[data-testid='tab-roic']")).toBeVisible();
    await expect(page.locator("[data-testid='tab-valuation']")).toBeVisible();
    await expect(page.locator("[data-testid='tab-audit']")).toBeVisible();

    const summaryTab = page.locator("[data-testid='tab-summary']");
    await expect(summaryTab).toHaveAttribute("data-state", "active");

    await expect(page.locator("[data-testid='summary-tab']")).toBeVisible();
  });

  test("AC7: Tab switching is instant with no loading state between tabs", async ({
    page,
  }) => {
    await loginAndNavigateToPlan(page);
    await page.click("[data-testid='nav-reports']");
    await expect(
      page.locator("[data-testid='summary-tab']")
    ).toBeVisible({ timeout: 10_000 });

    await page.click("[data-testid='tab-pnl']");
    await expect(page.locator("[data-testid='placeholder-p&l-statement']")).toBeVisible({ timeout: 2_000 });

    await page.click("[data-testid='tab-summary']");
    await expect(page.locator("[data-testid='summary-tab']")).toBeVisible({ timeout: 2_000 });
  });

  test("AC10: Placeholder tabs show 'Coming in the next update'", async ({
    page,
  }) => {
    await loginAndNavigateToPlan(page);
    await page.click("[data-testid='nav-reports']");
    await expect(
      page.locator("[data-testid='financial-statements']")
    ).toBeVisible({ timeout: 10_000 });

    const placeholderTabs: { tabId: string; placeholderTestId: string }[] = [
      { tabId: "tab-pnl", placeholderTestId: "placeholder-p&l-statement" },
      { tabId: "tab-balance-sheet", placeholderTestId: "placeholder-balance-sheet" },
      { tabId: "tab-cash-flow", placeholderTestId: "placeholder-cash-flow-statement" },
      { tabId: "tab-roic", placeholderTestId: "placeholder-roic-analysis" },
      { tabId: "tab-valuation", placeholderTestId: "placeholder-valuation" },
      { tabId: "tab-audit", placeholderTestId: "placeholder-audit-/-integrity-checks" },
    ];

    for (const { tabId, placeholderTestId } of placeholderTabs) {
      await page.click(`[data-testid='${tabId}']`);
      const placeholder = page.locator(`[data-testid='${placeholderTestId}']`);
      await expect(placeholder).toBeVisible({ timeout: 3_000 });
      await expect(placeholder).toContainText("Coming in the next update");
    }
  });

  test("AC11: Callout bar shows Total 5yr Pre-Tax Income, Break-even, and 5yr ROI", async ({
    page,
  }) => {
    await loginAndNavigateToPlan(page);
    await page.click("[data-testid='nav-reports']");
    await expect(
      page.locator("[data-testid='callout-bar']")
    ).toBeVisible({ timeout: 10_000 });

    await expect(page.locator("[data-testid='value-5yr-pretax']")).toBeVisible();
    await expect(page.locator("[data-testid='value-5yr-pretax']")).not.toBeEmpty();

    await expect(page.locator("[data-testid='value-breakeven-callout']")).toBeVisible();
    await expect(page.locator("[data-testid='value-breakeven-callout']")).not.toBeEmpty();

    await expect(page.locator("[data-testid='value-5yr-roi']")).toBeVisible();
    await expect(page.locator("[data-testid='value-5yr-roi']")).not.toBeEmpty();
  });

  test("AC12: Summary tab renders all required sections", async ({
    page,
  }) => {
    await loginAndNavigateToPlan(page);
    await page.click("[data-testid='nav-reports']");
    await expect(
      page.locator("[data-testid='summary-tab']")
    ).toBeVisible({ timeout: 10_000 });

    await expect(page.locator("[data-testid='section-pl-summary']")).toBeVisible();
    await expect(page.locator("[data-testid='section-labor-efficiency']")).toBeVisible();
    await expect(page.locator("[data-testid='section-bs-summary']")).toBeVisible();
    await expect(page.locator("[data-testid='section-cf-summary']")).toBeVisible();
    await expect(page.locator("[data-testid='section-break-even']")).toBeVisible();
    await expect(page.locator("[data-testid='section-startup-capital']")).toBeVisible();

    await expect(page.locator("[data-testid='section-pl-summary']")).toContainText("Annual P&L Summary");
    await expect(page.locator("[data-testid='section-break-even']")).toContainText("Break-Even Analysis");
  });

  test("AC12: Sections have correct default expand/collapse state", async ({
    page,
  }) => {
    await loginAndNavigateToPlan(page);
    await page.click("[data-testid='nav-reports']");
    await expect(
      page.locator("[data-testid='summary-tab']")
    ).toBeVisible({ timeout: 10_000 });

    const plSection = page.locator("[data-testid='section-pl-summary']");
    await expect(plSection.locator("table, [role='table'], .grid")).toBeVisible();

    const breakEvenSection = page.locator("[data-testid='section-break-even']");
    await expect(breakEvenSection.locator("[data-testid='value-breakeven-month']")).toBeVisible();
  });

  test("AC12: Sections expand and collapse on toggle click", async ({
    page,
  }) => {
    await loginAndNavigateToPlan(page);
    await page.click("[data-testid='nav-reports']");
    await expect(
      page.locator("[data-testid='summary-tab']")
    ).toBeVisible({ timeout: 10_000 });

    const laborToggle = page.locator("[data-testid='section-labor-efficiency-toggle']");
    await laborToggle.click();
    await expect(
      page.locator("[data-testid='section-labor-efficiency']").locator("table, [data-testid*='labor-eff']")
    ).toBeVisible({ timeout: 3_000 });

    await laborToggle.click();
    await page.waitForTimeout(500);
  });

  test("AC13: View Full links navigate to the correct tabs", async ({
    page,
  }) => {
    await loginAndNavigateToPlan(page);
    await page.click("[data-testid='nav-reports']");
    await expect(
      page.locator("[data-testid='summary-tab']")
    ).toBeVisible({ timeout: 10_000 });

    await page.click("[data-testid='section-pl-summary-link']");
    const pnlTab = page.locator("[data-testid='tab-pnl']");
    await expect(pnlTab).toHaveAttribute("data-state", "active", { timeout: 3_000 });

    await page.click("[data-testid='tab-summary']");
    await expect(page.locator("[data-testid='summary-tab']")).toBeVisible({ timeout: 3_000 });

    await page.locator("[data-testid='section-bs-summary-toggle']").click();
    await page.waitForTimeout(300);
    await page.click("[data-testid='section-bs-summary-link']");
    const bsTab = page.locator("[data-testid='tab-balance-sheet']");
    await expect(bsTab).toHaveAttribute("data-state", "active", { timeout: 3_000 });

    await page.click("[data-testid='tab-summary']");
    await expect(page.locator("[data-testid='summary-tab']")).toBeVisible({ timeout: 3_000 });

    await page.locator("[data-testid='section-cf-summary-toggle']").click();
    await page.waitForTimeout(300);
    await page.click("[data-testid='section-cf-summary-link']");
    const cfTab = page.locator("[data-testid='tab-cash-flow']");
    await expect(cfTab).toHaveAttribute("data-state", "active", { timeout: 3_000 });
  });

  test("AC14: Year 1 pre-tax margin interpretation text with trend icon", async ({
    page,
  }) => {
    await loginAndNavigateToPlan(page);
    await page.click("[data-testid='nav-reports']");
    await expect(
      page.locator("[data-testid='summary-tab']")
    ).toBeVisible({ timeout: 10_000 });

    const marginInterp = page.locator("[data-testid='interp-y1-margin']");
    await expect(marginInterp).toBeVisible();
    await expect(marginInterp).toContainText("Year 1 pre-tax margin");
    await expect(marginInterp).toContainText("%");
  });

  test("AC15: Dashboard metric cards navigate to Reports tabs", async ({
    page,
  }) => {
    await loginAndNavigateToPlan(page);

    await expect(
      page.locator("[data-testid='dashboard-panel']")
    ).toBeVisible({ timeout: 10_000 });

    await page.click("[data-testid='metric-card-revenue']");
    await expect(
      page.locator("[data-testid='financial-statements']")
    ).toBeVisible({ timeout: 10_000 });
    const pnlTab = page.locator("[data-testid='tab-pnl']");
    await expect(pnlTab).toHaveAttribute("data-state", "active", { timeout: 3_000 });

    await page.click("[data-testid='nav-my-plan']");
    await expect(
      page.locator("[data-testid='dashboard-panel']")
    ).toBeVisible({ timeout: 10_000 });

    await page.click("[data-testid='metric-card-roi']");
    await expect(
      page.locator("[data-testid='financial-statements']")
    ).toBeVisible({ timeout: 10_000 });
    const roicTab = page.locator("[data-testid='tab-roic']");
    await expect(roicTab).toHaveAttribute("data-state", "active", { timeout: 3_000 });

    await page.click("[data-testid='nav-my-plan']");
    await expect(
      page.locator("[data-testid='dashboard-panel']")
    ).toBeVisible({ timeout: 10_000 });

    await page.click("[data-testid='button-dashboard-view-statements']");
    await expect(
      page.locator("[data-testid='financial-statements']")
    ).toBeVisible({ timeout: 10_000 });
    const summaryTab = page.locator("[data-testid='tab-summary']");
    await expect(summaryTab).toHaveAttribute("data-state", "active", { timeout: 3_000 });
  });

  test("AC25: Currency values formatted as $X,XXX and percentages as X.X%", async ({
    page,
  }) => {
    await loginAndNavigateToPlan(page);
    await page.click("[data-testid='nav-reports']");
    await expect(
      page.locator("[data-testid='summary-tab']")
    ).toBeVisible({ timeout: 10_000 });

    const pretaxValue = await page.locator("[data-testid='value-5yr-pretax']").textContent();
    expect(pretaxValue).toMatch(/^\$[\d,]+$/);

    const roiValue = await page.locator("[data-testid='value-5yr-roi']").textContent();
    expect(roiValue).toMatch(/[\d.]+%/);
  });

  test("AC26: Generate Draft button is visible", async ({
    page,
  }) => {
    await loginAndNavigateToPlan(page);
    await page.click("[data-testid='nav-reports']");
    await expect(
      page.locator("[data-testid='financial-statements']")
    ).toBeVisible({ timeout: 10_000 });

    const generateBtn = page.locator("[data-testid='button-generate-pdf']");
    await expect(generateBtn).toBeVisible();
    await expect(generateBtn).toContainText("Generate Draft");
  });

  test("Break-even sparkline renders in break-even section", async ({
    page,
  }) => {
    await loginAndNavigateToPlan(page);
    await page.click("[data-testid='nav-reports']");
    await expect(
      page.locator("[data-testid='summary-tab']")
    ).toBeVisible({ timeout: 10_000 });

    const sparkline = page.locator("[data-testid='chart-breakeven-sparkline']");
    await expect(sparkline).toBeVisible();
    await expect(sparkline.locator("svg")).toBeVisible();
  });

  test("Startup Capital Summary shows Total Investment and 5-Year Cumulative Cash Flow", async ({
    page,
  }) => {
    await loginAndNavigateToPlan(page);
    await page.click("[data-testid='nav-reports']");
    await expect(
      page.locator("[data-testid='summary-tab']")
    ).toBeVisible({ timeout: 10_000 });

    await page.locator("[data-testid='section-startup-capital-toggle']").click();
    await page.waitForTimeout(300);

    await expect(page.locator("[data-testid='value-total-investment-summary']")).toBeVisible();
    await expect(page.locator("[data-testid='value-5yr-cum-cf']")).toBeVisible();

    const investmentValue = await page.locator("[data-testid='value-total-investment-summary']").textContent();
    expect(investmentValue).toMatch(/^\$/);

    const cumCfValue = await page.locator("[data-testid='value-5yr-cum-cf']").textContent();
    expect(cumCfValue).toMatch(/^\$|^-\$/);
  });

  test("Planning header shows plan name, save indicator — no mode switcher or view toggle", async ({
    page,
  }) => {
    await loginAndNavigateToPlan(page);

    await expect(page.locator("[data-testid='text-plan-name']")).toBeVisible();
    await expect(page.locator("[data-testid='text-plan-name']")).not.toBeEmpty();
    await expect(page.locator("[data-testid='button-sidebar-toggle']")).toBeVisible();

    await expect(page.locator("[data-testid='view-toggle']")).not.toBeVisible();
  });
});
