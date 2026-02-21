import { test, expect } from "@playwright/test";

function makeField(value: number) {
  return {
    currentValue: value,
    brandDefault: value,
    source: "brand_default" as const,
    isCustom: false,
    lastModifiedAt: null,
    item7Range: null,
  };
}

function makeFieldArray5(value: number) {
  return Array.from({ length: 5 }, () => makeField(value));
}

function buildFinancialInputs() {
  const facilitiesDecomposition = {
    rent: makeFieldArray5(6000000),
    utilities: makeFieldArray5(960000),
    telecomIt: makeFieldArray5(0),
    vehicleFleet: makeFieldArray5(0),
    insurance: makeFieldArray5(600000),
  };
  const facilitiesAnnual = Array.from({ length: 5 }, (_, i) => {
    const total =
      facilitiesDecomposition.rent[i].currentValue +
      facilitiesDecomposition.utilities[i].currentValue +
      facilitiesDecomposition.telecomIt[i].currentValue +
      facilitiesDecomposition.vehicleFleet[i].currentValue +
      facilitiesDecomposition.insurance[i].currentValue;
    return makeField(total);
  });

  return {
    revenue: {
      monthlyAuv: makeField(2686700),
      growthRates: [
        makeField(0.13),
        makeField(0.13),
        makeField(0.13),
        makeField(0.13),
        makeField(0.13),
      ],
      startingMonthAuvPct: makeField(0.08),
    },
    operatingCosts: {
      royaltyPct: makeFieldArray5(0.05),
      adFundPct: makeFieldArray5(0.02),
      cogsPct: makeFieldArray5(0.3),
      laborPct: makeFieldArray5(0.17),
      facilitiesAnnual,
      facilitiesDecomposition,
      marketingPct: makeFieldArray5(0.05),
      managementSalariesAnnual: makeFieldArray5(0),
      payrollTaxPct: makeFieldArray5(0.2),
      otherOpexPct: makeFieldArray5(0.03),
    },
    profitabilityAndDistributions: {
      targetPreTaxProfitPct: makeFieldArray5(0),
      shareholderSalaryAdj: makeFieldArray5(0),
      distributions: makeFieldArray5(0),
      nonCapexInvestment: makeFieldArray5(0),
    },
    workingCapitalAndValuation: {
      arDays: makeField(30),
      apDays: makeField(60),
      inventoryDays: makeField(60),
      taxPaymentDelayMonths: makeField(0),
      ebitdaMultiple: makeField(3.0),
    },
    financing: {
      loanAmount: makeField(20000000),
      interestRate: makeField(0.105),
      loanTermMonths: makeField(144),
      downPaymentPct: makeField(0.2),
    },
    startupCapital: {
      workingCapitalMonths: makeField(3),
      depreciationYears: makeField(4),
    },
  };
}

test.describe("Story 7.1b: Reports Per-Year Editing", () => {
  let planId: string;

  test.beforeEach(async ({ request }) => {
    await request.post("/api/auth/dev-login");
    const meRes = await request.get("/api/auth/me");
    const me = await meRes.json();

    const brandName = `71bBrand-${Date.now()}`;
    const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const brandRes = await request.post("/api/brands", {
      data: { name: brandName, slug },
    });
    const brand = await brandRes.json();

    const planRes = await request.post("/api/plans", {
      data: {
        userId: me.id,
        brandId: brand.id,
        name: `71b-Test-${Date.now()}`,
        status: "draft",
      },
    });
    const plan = await planRes.json();
    planId = plan.id;

    await request.patch(`/api/plans/${planId}`, {
      data: { quickStartCompleted: true, financialInputs: buildFinancialInputs() },
    });
  });

  async function loginAndGoToReports(page: any) {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login-admin']");
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
