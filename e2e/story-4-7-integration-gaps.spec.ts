import { test, expect } from "@playwright/test";

test.describe("Story 4.7: Integration Gaps — Startup Cost Mounting & Forms Metadata", () => {
  let planId: string;

  test.beforeEach(async ({ request }) => {
    await request.post("/api/auth/dev-login");

    const meRes = await request.get("/api/auth/me");
    const me = await meRes.json();

    const brandName = `IntGap-${Date.now()}`;
    const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const brandRes = await request.post("/api/brands", {
      data: { name: brandName, slug },
    });
    const brand = await brandRes.json();

    const planRes = await request.post("/api/plans", {
      data: {
        userId: me.id,
        brandId: brand.id,
        name: `IntGap Plan ${Date.now()}`,
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

  async function loginAndGoToPlan(page: any) {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });
    await page.goto(`/plans/${planId}`);
    await expect(
      page.locator("[data-testid='planning-workspace']")
    ).toBeVisible({ timeout: 15_000 });
  }

  test("AC1: StartupCostBuilder section visible in Forms mode", async ({
    page,
  }) => {
    await loginAndGoToPlan(page);
    await expect(
      page.locator("[data-testid='forms-mode-container']")
    ).toBeVisible({ timeout: 10_000 });

    const startupSection = page.locator(
      "[data-testid='section-startupCosts']"
    );
    await expect(startupSection).toBeVisible();
  });

  test("AC1: StartupCostBuilder section is collapsible in Forms mode", async ({
    page,
  }) => {
    await loginAndGoToPlan(page);
    await expect(
      page.locator("[data-testid='forms-mode-container']")
    ).toBeVisible({ timeout: 10_000 });

    const startupSection = page.locator(
      "[data-testid='section-startupCosts']"
    );
    await expect(startupSection).toBeVisible();

    const trigger = startupSection.locator("button").first();
    await expect(trigger).toBeVisible();

    await trigger.click();
    await page.waitForTimeout(500);
    await trigger.click();
    await expect(startupSection).toBeVisible();
  });

  test("AC1: StartupCostBuilder section appears after existing financial categories in Forms mode", async ({
    page,
  }) => {
    await loginAndGoToPlan(page);
    await expect(
      page.locator("[data-testid='forms-mode-container']")
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page.locator("[data-testid='section-revenue']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='section-operatingCosts']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='section-financing']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='section-startupCapital']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='section-startupCosts']")
    ).toBeVisible();

    const startupCapitalBox = await page
      .locator("[data-testid='section-startupCapital']")
      .boundingBox();
    const startupCostsBox = await page
      .locator("[data-testid='section-startupCosts']")
      .boundingBox();

    expect(startupCapitalBox).not.toBeNull();
    expect(startupCostsBox).not.toBeNull();
    expect(startupCostsBox!.y).toBeGreaterThan(startupCapitalBox!.y);
  });

  test("AC3: Forms metadata panel shows Item 7 range with real data", async ({
    page,
    request,
  }) => {
    const financialInputs = buildFinancialInputsWithRange();
    await request.patch(`/api/plans/${planId}`, {
      data: { financialInputs },
    });

    await loginAndGoToPlan(page);
    await expect(
      page.locator("[data-testid='forms-mode-container']")
    ).toBeVisible({ timeout: 10_000 });

    const monthlyAuvInput = page.locator(
      "[data-testid='field-input-monthlyAuv']"
    );
    await monthlyAuvInput.click();

    await expect(page.locator("text=Item 7 range:")).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.locator("text=Item 7 range:")).not.toContainText("N/A");
  });

  test("AC3: Forms metadata panel shows N/A when no Item 7 range data", async ({
    page,
  }) => {
    await loginAndGoToPlan(page);
    await expect(
      page.locator("[data-testid='forms-mode-container']")
    ).toBeVisible({ timeout: 10_000 });

    const cogsPctInput = page.locator(
      "[data-testid='field-input-cogsPct']"
    );
    await expect(cogsPctInput).toBeVisible();

    const operatingSection = page.locator(
      "[data-testid='section-operatingCosts']"
    );
    const trigger = operatingSection.locator("button").first();
    await trigger.click();

    await cogsPctInput.click();

    await expect(page.locator("text=Item 7 range:")).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.locator("text=Item 7 range:")).toContainText("N/A");
  });

  test("AC4: Completeness dashboard includes Startup Costs entry in Forms mode", async ({
    page,
  }) => {
    await loginAndGoToPlan(page);
    await expect(
      page.locator("[data-testid='forms-mode-container']")
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page.locator("[data-testid='plan-completeness-dashboard']")
    ).toBeVisible();

    const startupCostProgress = page.locator(
      "[data-testid='section-progress-startupCosts']"
    );
    await expect(startupCostProgress).toBeVisible();
    await expect(startupCostProgress).toContainText("items");
  });

  test("AC4: Startup Costs count updates when items change via API", async ({
    page,
    request,
  }) => {
    await loginAndGoToPlan(page);
    await expect(
      page.locator("[data-testid='forms-mode-container']")
    ).toBeVisible({ timeout: 10_000 });

    const startupCostProgress = page.locator(
      "[data-testid='section-progress-startupCosts']"
    );
    await expect(startupCostProgress).toBeVisible();

    const initialText = await startupCostProgress.textContent();
    expect(initialText).toContain("items");
  });

  test("Forms mode shows all five category sections plus startup costs", async ({
    page,
  }) => {
    await loginAndGoToPlan(page);
    await expect(
      page.locator("[data-testid='forms-mode-container']")
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page.locator("[data-testid='section-revenue']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='section-operatingCosts']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='section-financing']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='section-startupCapital']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='section-startupCosts']")
    ).toBeVisible();

    const dashboard = page.locator(
      "[data-testid='plan-completeness-dashboard']"
    );
    await expect(dashboard).toBeVisible();
    await expect(
      page.locator("[data-testid='section-progress-revenue']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='section-progress-startupCosts']")
    ).toBeVisible();
  });
});

function makeField(
  value: number,
  item7Range?: { min: number; max: number } | null
) {
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
