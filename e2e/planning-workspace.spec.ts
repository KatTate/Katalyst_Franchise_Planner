import { test, expect } from "@playwright/test";

test.describe("Story 4.1: Planning Workspace & Dashboard", () => {
  let planId: string;
  let brandId: string;

  test.beforeEach(async ({ request }) => {
    await request.post("/api/auth/dev-login");

    const meRes = await request.get("/api/auth/me");
    const me = await meRes.json();

    const brandName = `WSBrand-${Date.now()}`;
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
        name: `Test Plan ${Date.now()}`,
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

  test("workspace renders with planning header and forms mode", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });
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
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });
    await page.goto(`/plans/${planId}`);

    await expect(
      page.locator("[data-testid='planning-workspace']")
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("[data-testid='input-panel']")).toBeVisible();
    await expect(page.locator("[data-testid='dashboard-panel']")).toBeVisible();
  });

  test("dashboard panel shows 5 summary metric cards", async ({ page }) => {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });
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
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });
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
        brandId: brandId,
        name: `Fresh Plan ${Date.now()}`,
        status: "draft",
      },
    });
    const freshPlan = await freshPlanRes.json();

    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });
    await page.goto(`/plans/${freshPlan.id}`);

    await expect(
      page.locator("[data-testid='planning-workspace']")
    ).toBeVisible({ timeout: 15_000 });

    await expect(
      page.locator("[data-testid='quick-start-overlay']")
    ).toBeVisible({ timeout: 10_000 });
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
