import { test, expect } from "@playwright/test";

test.describe("Story 4.2: Forms Mode — Section-Based Input", () => {
  let planId: string;

  test.beforeEach(async ({ request }) => {
    await request.post("/api/auth/dev-login");

    const meRes = await request.get("/api/auth/me");
    const me = await meRes.json();

    const brandName = `FormsBrand-${Date.now()}`;
    const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const brandRes = await request.post("/api/brands", {
      data: { name: brandName, slug },
    });
    const brand = await brandRes.json();

    const planRes = await request.post("/api/plans", {
      data: {
        userId: me.id,
        brandId: brand.id,
        name: `Forms Test ${Date.now()}`,
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

  test("forms mode renders with completeness dashboard and four sections", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });
    await page.goto(`/plans/${planId}`);

    await expect(
      page.locator("[data-testid='planning-workspace']")
    ).toBeVisible({ timeout: 15_000 });

    await page.click("[data-testid='mode-switcher-forms']");

    await expect(
      page.locator("[data-testid='forms-mode-container']")
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page.locator("[data-testid='plan-completeness-dashboard']")
    ).toBeVisible();

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
  });

  test("sections show progress indicators", async ({ page }) => {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });
    await page.goto(`/plans/${planId}`);

    await expect(
      page.locator("[data-testid='forms-mode-container']")
    ).toBeVisible({ timeout: 15_000 });

    await expect(
      page.locator("[data-testid='section-progress-revenue']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='section-progress-operatingCosts']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='section-progress-financing']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='section-progress-startupCapital']")
    ).toBeVisible();

    const revenueProgress = page.locator(
      "[data-testid='section-progress-revenue']"
    );
    await expect(revenueProgress).toContainText("0/");
  });

  test("fields display brand default values with Brand Default badge", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });
    await page.goto(`/plans/${planId}`);

    await expect(
      page.locator("[data-testid='forms-mode-container']")
    ).toBeVisible({ timeout: 15_000 });

    const monthlyAuvInput = page.locator(
      "[data-testid='field-input-monthlyAuv']"
    );
    await expect(monthlyAuvInput).toBeVisible();

    const monthlyAuvBadge = page.locator(
      "[data-testid='badge-source-monthlyAuv']"
    );
    await expect(monthlyAuvBadge).toContainText("Brand Default");
  });

  test("editing a field updates source badge to Your Entry", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });
    await page.goto(`/plans/${planId}`);

    await expect(
      page.locator("[data-testid='forms-mode-container']")
    ).toBeVisible({ timeout: 15_000 });

    const monthlyAuvInput = page.locator(
      "[data-testid='field-input-monthlyAuv']"
    );
    await monthlyAuvInput.click();

    const editInput = page
      .locator("[data-testid='field-input-monthlyAuv']")
      .locator("xpath=self::input");
    await expect(editInput).toBeVisible({ timeout: 5_000 });
    await editInput.fill("7500");
    await editInput.press("Enter");

    await expect(
      page.locator("[data-testid='badge-source-monthlyAuv']")
    ).toContainText("Your Entry", { timeout: 5_000 });
  });

  test("reset button reverts field to brand default", async ({ page }) => {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });
    await page.goto(`/plans/${planId}`);

    await expect(
      page.locator("[data-testid='forms-mode-container']")
    ).toBeVisible({ timeout: 15_000 });

    const monthlyAuvInput = page.locator(
      "[data-testid='field-input-monthlyAuv']"
    );
    await monthlyAuvInput.click();
    const editInput = page
      .locator("[data-testid='field-input-monthlyAuv']")
      .locator("xpath=self::input");
    await expect(editInput).toBeVisible({ timeout: 5_000 });
    await editInput.fill("9000");
    await editInput.press("Enter");

    await expect(
      page.locator("[data-testid='badge-source-monthlyAuv']")
    ).toContainText("Your Entry", { timeout: 5_000 });

    const resetButton = page.locator(
      "[data-testid='button-reset-monthlyAuv']"
    );
    await expect(resetButton).toBeVisible();
    await resetButton.click();

    await expect(
      page.locator("[data-testid='badge-source-monthlyAuv']")
    ).toContainText("Brand Default", { timeout: 5_000 });
  });

  test("section collapse and expand preserves values", async ({ page }) => {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });
    await page.goto(`/plans/${planId}`);

    await expect(
      page.locator("[data-testid='forms-mode-container']")
    ).toBeVisible({ timeout: 15_000 });

    const monthlyAuvInput = page.locator(
      "[data-testid='field-input-monthlyAuv']"
    );
    const originalValue = await monthlyAuvInput.textContent();

    const revenueSection = page.locator("[data-testid='section-revenue']");
    const trigger = revenueSection.locator("button").first();
    await trigger.click();

    await expect(monthlyAuvInput).not.toBeVisible();

    await trigger.click();
    await expect(monthlyAuvInput).toBeVisible({ timeout: 5_000 });

    const restoredValue = await monthlyAuvInput.textContent();
    expect(restoredValue).toBe(originalValue);
  });

  test("mode switching preserves form state", async ({ page }) => {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });
    await page.goto(`/plans/${planId}`);

    await expect(
      page.locator("[data-testid='forms-mode-container']")
    ).toBeVisible({ timeout: 15_000 });

    const monthlyAuvInput = page.locator(
      "[data-testid='field-input-monthlyAuv']"
    );
    await monthlyAuvInput.click();
    const editInput = page
      .locator("[data-testid='field-input-monthlyAuv']")
      .locator("xpath=self::input");
    await expect(editInput).toBeVisible({ timeout: 5_000 });
    await editInput.fill("8000");
    await editInput.press("Enter");

    await expect(
      page.locator("[data-testid='badge-source-monthlyAuv']")
    ).toContainText("Your Entry", { timeout: 5_000 });

    await page.click("[data-testid='mode-switcher-quick-entry']");
    await expect(
      page.locator("[data-testid='input-panel']")
    ).toContainText("Quick Entry");

    await page.click("[data-testid='mode-switcher-forms']");
    await expect(
      page.locator("[data-testid='forms-mode-container']")
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page.locator("[data-testid='badge-source-monthlyAuv']")
    ).toContainText("Your Entry");
  });

  test("completeness dashboard updates when fields are edited", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });
    await page.goto(`/plans/${planId}`);

    await expect(
      page.locator("[data-testid='forms-mode-container']")
    ).toBeVisible({ timeout: 15_000 });

    const revenueProgress = page.locator(
      "[data-testid='section-progress-revenue']"
    );
    await expect(revenueProgress).toContainText("0/");

    const monthlyAuvInput = page.locator(
      "[data-testid='field-input-monthlyAuv']"
    );
    await monthlyAuvInput.click();
    const editInput = page
      .locator("[data-testid='field-input-monthlyAuv']")
      .locator("xpath=self::input");
    await expect(editInput).toBeVisible({ timeout: 5_000 });
    await editInput.fill("6000");
    await editInput.press("Enter");

    await expect(revenueProgress).toContainText("1/", { timeout: 5_000 });
  });

  test("start here indicator shows for new plans with all brand defaults", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });
    await page.goto(`/plans/${planId}`);

    await expect(
      page.locator("[data-testid='forms-mode-container']")
    ).toBeVisible({ timeout: 15_000 });

    const revenueSection = page.locator("[data-testid='section-revenue']");
    await expect(revenueSection).toContainText("Start here");
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
