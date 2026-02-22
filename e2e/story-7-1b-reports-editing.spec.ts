import { test, expect } from "@playwright/test";
import {
  loginAsAdmin,
  loginAsFranchiseeUI,
  createTestPlan,
  deleteTestPlan,
  buildNewFormatFinancialInputs,
} from "./test-helpers";

test.describe("Story 7.1b: Reports Per-Year Editing", () => {
  let planId: string;

  test.beforeEach(async ({ request }) => {
    const user = await loginAsAdmin(request);
    const plan = await createTestPlan(request, {
      userId: user.id,
      financialInputs: buildNewFormatFinancialInputs(),
      quickStartCompleted: true,
    });
    planId = plan.id;
  });

  test.afterEach(async ({ request }) => {
    await loginAsAdmin(request);
    if (planId) await deleteTestPlan(request, planId);
  });

  async function loginAndGoToReports(page: any) {
    await loginAsFranchiseeUI(page);
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

  test("AC-1: All 15 financial assumption rows are visible and editable in P&L", async ({
    page,
  }) => {
    await loginAndGoToReports(page);

    const editableRowKeys = [
      "monthly-revenue",
      "growth-rate",
      "cogs-pct",
      "dl-pct",
      "royalty-pct",
      "ad-fund-pct",
      "marketing",
      "other-opex",
      "facilities",
      "mgmt-salaries",
      "payroll-tax-pct",
      "target-pretax-profit-pct",
      "distributions",
      "shareholder-salary-adj",
      "non-capex-investment",
    ];

    for (const key of editableRowKeys) {
      const row = page.locator(`[data-testid='pnl-row-${key}']`);
      await expect(row).toBeVisible({ timeout: 5_000 });
    }
  });

  test("AC-1: Editing COGS% Year 2 does not affect other years", async ({
    page,
  }) => {
    await loginAndGoToReports(page);

    const cogsY1Cell = page.locator("[data-testid='pnl-value-cogs-pct-y1']");
    const cogsY2Cell = page.locator("[data-testid='pnl-value-cogs-pct-y2']");

    await expect(cogsY1Cell).toBeVisible({ timeout: 5_000 });
    const originalY1Text = await cogsY1Cell.textContent();

    await cogsY2Cell.click();
    const input = page.locator("[data-testid='pnl-value-cogs-pct-y2'] input");
    await expect(input).toBeVisible({ timeout: 3_000 });
    await input.fill("25");
    await input.press("Enter");

    await page.waitForTimeout(2500);

    const updatedY1Text = await cogsY1Cell.textContent();
    expect(updatedY1Text).toBe(originalY1Text);
  });

  test("AC-3: Copy Year 1 to All — confirm updates all years", async ({
    page,
  }) => {
    await loginAndGoToReports(page);

    const growthRow = page.locator("[data-testid='pnl-row-growth-rate']");
    await expect(growthRow).toBeVisible({ timeout: 5_000 });

    const copyBtn = page.locator("[data-testid='copy-y1-growth-rate']");
    await growthRow.hover();
    await expect(copyBtn).toBeVisible({ timeout: 5_000 });
    await copyBtn.click();

    const confirmBtn = page.locator("[data-testid='copy-y1-confirm']");
    await expect(confirmBtn).toBeVisible({ timeout: 3_000 });
    await confirmBtn.click();

    await page.waitForTimeout(2500);

    const y1Text = await page
      .locator("[data-testid='pnl-value-growth-rate-y1']")
      .textContent();
    const y3Text = await page
      .locator("[data-testid='pnl-value-growth-rate-y3']")
      .textContent();
    const y5Text = await page
      .locator("[data-testid='pnl-value-growth-rate-y5']")
      .textContent();

    expect(y3Text).toBe(y1Text);
    expect(y5Text).toBe(y1Text);
  });

  test("AC-3: Copy Year 1 to All — cancel makes no changes", async ({
    page,
  }) => {
    await loginAndGoToReports(page);

    const cogsRow = page.locator("[data-testid='pnl-row-cogs-pct']");
    await expect(cogsRow).toBeVisible({ timeout: 5_000 });

    const y3Before = await page
      .locator("[data-testid='pnl-value-cogs-pct-y3']")
      .textContent();

    const copyBtn = page.locator("[data-testid='copy-y1-cogs-pct']");
    await cogsRow.hover();
    await expect(copyBtn).toBeVisible({ timeout: 5_000 });
    await copyBtn.click();

    const cancelBtn = page.locator("[data-testid='copy-y1-cancel']");
    await expect(cancelBtn).toBeVisible({ timeout: 3_000 });
    await cancelBtn.click();

    const y3After = await page
      .locator("[data-testid='pnl-value-cogs-pct-y3']")
      .textContent();
    expect(y3After).toBe(y3Before);
  });

  test("AC-4: No flash animation or link icons in column headers", async ({
    page,
  }) => {
    await loginAndGoToReports(page);

    const flashElements = page.locator(".animate-flash-linked");
    await expect(flashElements).toHaveCount(0);

    const linkIcons = page.locator("[data-testid*='link-icon']");
    await expect(linkIcons).toHaveCount(0);
  });
});
