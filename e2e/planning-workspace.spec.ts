import { test, expect } from "@playwright/test";
import {
  PAYMORE_BRAND_ID,
  loginAsAdmin,
  loginAsFranchiseeUI,
  createTestPlan,
  deleteTestPlan,
  buildMinimalFinancialInputs,
} from "./test-helpers";

test.describe("Story 4.1: Planning Workspace & Dashboard", () => {
  let planId: string;
  let extraPlanId: string | null = null;

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
    if (extraPlanId) await deleteTestPlan(request, extraPlanId);
    extraPlanId = null;
  });

  test("workspace renders with planning header and forms mode", async ({
    page,
  }) => {
    await loginAsFranchiseeUI(page);
    await page.goto(`/plans/${planId}`);

    await expect(
      page.locator("[data-testid='planning-workspace']")
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.locator("[data-testid='forms-mode-container']")
    ).toBeVisible({ timeout: 10_000 });
  });

  test("split view renders input panel and dashboard panel", async ({
    page,
  }) => {
    await loginAsFranchiseeUI(page);
    await page.goto(`/plans/${planId}`);

    await expect(
      page.locator("[data-testid='planning-workspace']")
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("[data-testid='input-panel']")).toBeVisible();
    await expect(page.locator("[data-testid='dashboard-panel']")).toBeVisible();
  });

  test("dashboard panel shows 5 summary metric cards", async ({ page }) => {
    await loginAsFranchiseeUI(page);
    await page.goto(`/plans/${planId}`);

    await expect(
      page.locator("[data-testid='planning-workspace']")
    ).toBeVisible({ timeout: 15_000 });

    const dashboardPanel = page.locator("[data-testid='dashboard-panel']");
    await expect(dashboardPanel).toBeVisible();

    await expect(
      page.locator("[data-testid='metric-card-investment']")
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.locator("[data-testid='metric-card-revenue']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='metric-card-roi']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='metric-card-breakeven']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='metric-card-cashflow']")
    ).toBeVisible();
  });

  test("dashboard panel renders break-even and revenue vs expenses charts", async ({
    page,
  }) => {
    await loginAsFranchiseeUI(page);
    await page.goto(`/plans/${planId}`);

    await expect(
      page.locator("[data-testid='planning-workspace']")
    ).toBeVisible({ timeout: 15_000 });

    await expect(
      page.locator("[data-testid='metric-card-investment']")
    ).toBeVisible({ timeout: 10_000 });

    const dashboard = page.locator("[data-testid='dashboard-panel']");
    await dashboard.evaluate((el) => (el.scrollTop = el.scrollHeight));
    await page.waitForTimeout(500);

    await expect(
      page.locator("[data-testid='chart-breakeven-timeline']")
    ).toBeVisible({ timeout: 5_000 });
    await expect(
      page.locator("[data-testid='chart-revenue-expenses']")
    ).toBeVisible();
  });

  test("quick start overlay shown when quickStartCompleted is false", async ({
    page,
    request,
  }) => {
    const meRes = await request.get("/api/auth/me");
    const me = await meRes.json();
    const freshPlanRes = await request.post("/api/plans", {
      data: {
        userId: me.id,
        brandId: PAYMORE_BRAND_ID,
        name: `Fresh Plan ${Date.now()}`,
        status: "draft",
      },
    });
    const freshPlan = await freshPlanRes.json();
    extraPlanId = freshPlan.id;

    await loginAsFranchiseeUI(page);
    await page.goto(`/plans/${freshPlan.id}`);

    await expect(
      page.locator("[data-testid='planning-workspace']")
    ).toBeVisible({ timeout: 15_000 });

    await expect(
      page.locator("[data-testid='quick-start-overlay']")
    ).toBeVisible({ timeout: 10_000 });
  });
});
