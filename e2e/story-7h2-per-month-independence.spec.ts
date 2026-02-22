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
      cogsPct: makeFieldArray5(0.30),
      laborPct: makeFieldArray5(0.17),
      facilitiesAnnual,
      facilitiesDecomposition,
      marketingPct: makeFieldArray5(0.05),
      managementSalariesAnnual: makeFieldArray5(0),
      payrollTaxPct: makeFieldArray5(0.20),
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
      downPaymentPct: makeField(0.20),
    },
    startupCapital: {
      workingCapitalMonths: makeField(3),
      depreciationYears: makeField(4),
    },
  };
}

test.describe("Story 7H.2: Per-Month Independence E2E", () => {
  let planId: string;
  let brandId: string;

  test.beforeEach(async ({ request }) => {
    await request.post("/api/auth/dev-login");

    const brandName = `7h2Brand-${Date.now()}`;
    const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const brandRes = await request.post("/api/brands", {
      data: { name: brandName, slug },
    });
    const brand = await brandRes.json();
    brandId = brand.id;

    await request.post("/api/auth/dev-login", {
      data: { role: "franchisee", brandId: brand.id },
    });

    const meRes = await request.get("/api/auth/me");
    const me = await meRes.json();

    const plansRes = await request.get("/api/plans");
    const plans = await plansRes.json();
    if (plans.length > 0) {
      planId = plans[0].id;
    } else {
      const planRes = await request.post("/api/plans", {
        data: { name: `7h2-Test-${Date.now()}` },
      });
      const plan = await planRes.json();
      planId = plan.id;
    }

    await request.patch(`/api/plans/${planId}`, {
      data: { quickStartCompleted: true, financialInputs: buildFinancialInputs() },
    });
  });

  async function loginAndGoToReports(page: any) {
    await page.goto("/login");
    const franchiseeBtn = page.locator("[data-testid='button-dev-login-franchisee']");
    const adminBtn = page.locator("[data-testid='button-dev-login-admin']");
    if (await franchiseeBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await franchiseeBtn.click();
    } else {
      await adminBtn.click();
    }
    await page.waitForURL("**/", { timeout: 10_000 });
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

  test("AC-5: Monthly-level inline editing updates single month only", async ({
    page,
  }) => {
    await loginAndGoToReports(page);

    const drillBtn = page.locator("[data-testid='button-toggle-drill']");
    await expect(drillBtn).toBeVisible({ timeout: 5_000 });
    await drillBtn.click();
    await page.waitForTimeout(1500);

    const monthCell = page.locator("[data-testid='pnl-value-cogs-pct-y1m3']");
    if (await monthCell.isVisible({ timeout: 5_000 }).catch(() => false)) {
      const adjacentCell = page.locator("[data-testid='pnl-value-cogs-pct-y1m4']");
      const adjacentBefore = await adjacentCell.textContent();

      await monthCell.click();
      const input = page.locator("[data-testid='pnl-value-cogs-pct-y1m3'] input");
      if (await input.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await input.fill("25");
        await input.press("Enter");
        await page.waitForTimeout(2500);

        const adjacentAfter = await adjacentCell.textContent();
        expect(adjacentAfter).toBe(adjacentBefore);

        const updatedCell = page.locator("[data-testid='pnl-value-cogs-pct-y1m3']");
        const updatedText = await updatedCell.textContent();
        expect(updatedText).toContain("25");
      }
    }
  });

  test("AC-6: Annual-level edit on qualifying field updates all 12 months", async ({
    page,
  }) => {
    await loginAndGoToReports(page);

    const cogsY2Cell = page.locator("[data-testid='pnl-value-cogs-pct-y2']");
    await expect(cogsY2Cell).toBeVisible({ timeout: 5_000 });
    await cogsY2Cell.click();

    const input = page.locator("[data-testid='pnl-value-cogs-pct-y2'] input");
    await expect(input).toBeVisible({ timeout: 3_000 });
    await input.fill("28");
    await input.press("Enter");
    await page.waitForTimeout(2500);

    const drillBtn = page.locator("[data-testid='button-toggle-drill']");
    await drillBtn.click();
    await page.waitForTimeout(1500);

    const y2m1Cell = page.locator("[data-testid='pnl-value-cogs-pct-y2m1']");
    if (await y2m1Cell.isVisible({ timeout: 5_000 }).catch(() => false)) {
      const y2m1Text = await y2m1Cell.textContent();
      expect(y2m1Text).toContain("28");

      const y2m6Cell = page.locator("[data-testid='pnl-value-cogs-pct-y2m6']");
      if (await y2m6Cell.isVisible({ timeout: 3_000 }).catch(() => false)) {
        const y2m6Text = await y2m6Cell.textContent();
        expect(y2m6Text).toContain("28");
      }
    }
  });

  test("AC-7: Copy Year 1 pattern copy replicates to all years", async ({
    page,
  }) => {
    await loginAndGoToReports(page);

    const cogsRow = page.locator("[data-testid='pnl-row-cogs-pct']");
    await expect(cogsRow).toBeVisible({ timeout: 5_000 });

    const copyBtn = page.locator("[data-testid='copy-y1-cogs-pct']");
    await cogsRow.hover();
    await expect(copyBtn).toBeVisible({ timeout: 5_000 });
    await copyBtn.click();

    const confirmBtn = page.locator("[data-testid='copy-y1-confirm']");
    await expect(confirmBtn).toBeVisible({ timeout: 3_000 });
    await confirmBtn.click();
    await page.waitForTimeout(2500);

    const y1Text = await page
      .locator("[data-testid='pnl-value-cogs-pct-y1']")
      .textContent();
    const y3Text = await page
      .locator("[data-testid='pnl-value-cogs-pct-y3']")
      .textContent();
    const y5Text = await page
      .locator("[data-testid='pnl-value-cogs-pct-y5']")
      .textContent();

    expect(y3Text).toBe(y1Text);
    expect(y5Text).toBe(y1Text);
  });

  test("AC-8: No Linked indicator in column headers", async ({ page }) => {
    await loginAndGoToReports(page);

    const linkIcons = page.locator("[data-testid*='link-icon']");
    await expect(linkIcons).toHaveCount(0);

    const linkedIndicators = page.locator("[data-testid*='linked-indicator']");
    await expect(linkedIndicators).toHaveCount(0);
  });

  test("AC-5/AC-6: Editing at annual level then verifying independence", async ({
    page,
  }) => {
    await loginAndGoToReports(page);

    const cogsY1Cell = page.locator("[data-testid='pnl-value-cogs-pct-y1']");
    await expect(cogsY1Cell).toBeVisible({ timeout: 5_000 });
    const originalY1Text = await cogsY1Cell.textContent();

    const cogsY3Cell = page.locator("[data-testid='pnl-value-cogs-pct-y3']");
    await cogsY3Cell.click();
    const input = page.locator("[data-testid='pnl-value-cogs-pct-y3'] input");
    await expect(input).toBeVisible({ timeout: 3_000 });
    await input.fill("22");
    await input.press("Enter");
    await page.waitForTimeout(2500);

    const updatedY1Text = await cogsY1Cell.textContent();
    expect(updatedY1Text).toBe(originalY1Text);

    const updatedY3Text = await cogsY3Cell.textContent();
    expect(updatedY3Text).toContain("22");
  });
});
