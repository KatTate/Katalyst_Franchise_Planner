import { test, expect } from "@playwright/test";
import {
  loginAsAdmin,
  loginAsFranchiseeUI,
  createTestPlan,
  deleteTestPlan,
  buildMinimalFinancialInputs,
} from "./test-helpers";

test.describe("Story 4.2: Forms Mode — Section-Based Input", () => {
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

  test("forms mode renders with completeness dashboard and four sections", async ({
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
    await loginAsFranchiseeUI(page);
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
    await loginAsFranchiseeUI(page);
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
    await loginAsFranchiseeUI(page);
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
    await loginAsFranchiseeUI(page);
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
    await loginAsFranchiseeUI(page);
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

  test("completeness dashboard updates when fields are edited", async ({
    page,
  }) => {
    await loginAsFranchiseeUI(page);
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
    await loginAsFranchiseeUI(page);
    await page.goto(`/plans/${planId}`);

    await expect(
      page.locator("[data-testid='forms-mode-container']")
    ).toBeVisible({ timeout: 15_000 });

    const revenueSection = page.locator("[data-testid='section-revenue']");
    await expect(revenueSection).toContainText("Start here");
  });
});
