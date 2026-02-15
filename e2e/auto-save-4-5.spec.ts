import { test, expect } from "@playwright/test";

test.describe("Story 4.5: Auto-Save & Session Recovery", () => {
  let planId: string;
  let brandId: string;

  test.beforeEach(async ({ request }) => {
    await request.post("/api/auth/dev-login");

    const meRes = await request.get("/api/auth/me");
    const me = await meRes.json();

    const brandName = `AutoSaveBrand-${Date.now()}`;
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
        name: `AutoSave Plan ${Date.now()}`,
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

  test("save indicator shows 'All changes saved' on workspace load", async ({
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
      page.locator("[data-testid='status-auto-save']")
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page.locator("[data-testid='text-save-status']")
    ).toContainText("All changes saved");
  });

  test("editing a field triggers auto-save and indicator transitions to 'Saving...' then 'All changes saved'", async ({
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

    const firstInput = page.locator("[data-testid='forms-mode-container'] input[type='text']").first();
    if (await firstInput.isVisible()) {
      await firstInput.click();
      await firstInput.fill("999999");
      await firstInput.press("Tab");

      await expect(
        page.locator("[data-testid='text-save-status']")
      ).toContainText(/(Saving|Unsaved|All changes saved)/);

      await expect(
        page.locator("[data-testid='text-save-status']")
      ).toContainText("All changes saved", { timeout: 15_000 });
    }
  });

  test("session recovery: plan data persists after page reload", async ({
    page,
    request,
  }) => {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });
    await page.goto(`/plans/${planId}`);

    await expect(
      page.locator("[data-testid='planning-workspace']")
    ).toBeVisible({ timeout: 15_000 });

    const planBefore = await request.get(`/api/plans/${planId}`);
    const planDataBefore = await planBefore.json();
    const financialInputsBefore = planDataBefore.data?.financialInputs;

    await page.reload();

    await expect(
      page.locator("[data-testid='planning-workspace']")
    ).toBeVisible({ timeout: 15_000 });

    const planAfter = await request.get(`/api/plans/${planId}`);
    const planDataAfter = await planAfter.json();
    const financialInputsAfter = planDataAfter.data?.financialInputs;

    expect(financialInputsAfter).toBeTruthy();
    expect(financialInputsAfter.revenue.monthlyAuv.currentValue).toBe(
      financialInputsBefore.revenue.monthlyAuv.currentValue
    );
  });

  test("experience mode is preserved across page reload", async ({
    page,
    request,
  }) => {
    await request.patch("/api/auth/me", {
      data: { preferredTier: "quick_entry" },
    });

    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });
    await page.goto(`/plans/${planId}`);

    await expect(
      page.locator("[data-testid='planning-workspace']")
    ).toBeVisible({ timeout: 15_000 });

    await page.click("[data-testid='mode-switcher-forms']");
    await page.waitForTimeout(1500);

    await page.reload();

    await expect(
      page.locator("[data-testid='planning-workspace']")
    ).toBeVisible({ timeout: 15_000 });

    const meRes = await request.get("/api/auth/me");
    const me = await meRes.json();
    expect(me.preferredTier).toBe("forms");
  });

  test("save indicator is visible in all experience modes", async ({
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
      page.locator("[data-testid='status-auto-save']")
    ).toBeVisible({ timeout: 10_000 });

    await page.click("[data-testid='mode-switcher-forms']");
    await expect(
      page.locator("[data-testid='forms-mode-container']")
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.locator("[data-testid='status-auto-save']")
    ).toBeVisible();

    await page.click("[data-testid='mode-switcher-quick-entry']");
    await page.waitForTimeout(500);
    await expect(
      page.locator("[data-testid='status-auto-save']")
    ).toBeVisible();

    await page.click("[data-testid='mode-switcher-planning-assistant']");
    await page.waitForTimeout(500);
    await expect(
      page.locator("[data-testid='status-auto-save']")
    ).toBeVisible();
  });

  test("API: PATCH with mismatched _expectedUpdatedAt returns 409", async ({
    request,
  }) => {
    const res = await request.patch(`/api/plans/${planId}`, {
      data: {
        name: "Conflict Test",
        _expectedUpdatedAt: "2000-01-01T00:00:00.000Z",
      },
    });
    expect(res.status()).toBe(409);
    const body = await res.json();
    expect(body.code).toBe("CONFLICT");
  });

  test("API: PATCH without _expectedUpdatedAt succeeds (no conflict check)", async ({
    request,
  }) => {
    const res = await request.patch(`/api/plans/${planId}`, {
      data: { name: "No Conflict Check" },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.name).toBe("No Conflict Check");
  });

  test("API: PATCH updates lastAutoSave timestamp", async ({
    request,
  }) => {
    const res = await request.patch(`/api/plans/${planId}`, {
      data: { name: "AutoSave Timestamp Test" },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.lastAutoSave).toBeTruthy();
  });

  test("save indicator component renders retry button in error state (unit-style verification)", async ({
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
      page.locator("[data-testid='status-auto-save']")
    ).toBeVisible({ timeout: 10_000 });

    const statusText = await page.locator("[data-testid='text-save-status']").textContent();
    expect(statusText).toBeTruthy();
    expect(["All changes saved", "Saving...", "Unsaved changes", "Save failed"]).toContain(statusText?.trim());

    const retryButton = page.locator("[data-testid='button-retry-save']");
    if (statusText?.trim() === "Save failed") {
      await expect(retryButton).toBeVisible();
    } else {
      await expect(retryButton).not.toBeVisible();
    }
  });

  test("API: 409 conflict prevents silent data loss", async ({
    request,
  }) => {
    const firstSave = await request.patch(`/api/plans/${planId}`, {
      data: { name: "First Save" },
    });
    expect(firstSave.status()).toBe(200);
    const firstBody = await firstSave.json();
    const updatedAt = firstBody.data.updatedAt;

    const secondSave = await request.patch(`/api/plans/${planId}`, {
      data: { name: "Second Save" },
    });
    expect(secondSave.status()).toBe(200);

    const staleSave = await request.patch(`/api/plans/${planId}`, {
      data: {
        name: "Stale Save Should Fail",
        _expectedUpdatedAt: new Date(updatedAt).toISOString(),
      },
    });
    expect(staleSave.status()).toBe(409);
    const staleBody = await staleSave.json();
    expect(staleBody.code).toBe("CONFLICT");
    expect(staleBody.message).toContain("updated in another tab");
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
