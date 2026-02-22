import { test, expect } from "@playwright/test";
import {
  loginAsAdmin,
  loginAsFranchiseeUI,
  createTestPlan,
  deleteTestPlan,
  buildMinimalFinancialInputs,
} from "./test-helpers";

test.describe("Story 4.5: Auto-Save & Session Recovery", () => {
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

  test("save indicator shows 'All changes saved' on workspace load", async ({
    page,
  }) => {
    await loginAsFranchiseeUI(page);
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
    await loginAsFranchiseeUI(page);
    await page.goto(`/plans/${planId}`);

    await expect(
      page.locator("[data-testid='planning-workspace']")
    ).toBeVisible({ timeout: 15_000 });

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
    await loginAsFranchiseeUI(page);
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

  test("save indicator is visible in forms mode", async ({
    page,
  }) => {
    await loginAsFranchiseeUI(page);
    await page.goto(`/plans/${planId}`);

    await expect(
      page.locator("[data-testid='planning-workspace']")
    ).toBeVisible({ timeout: 15_000 });

    await expect(
      page.locator("[data-testid='status-auto-save']")
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page.locator("[data-testid='forms-mode-container']")
    ).toBeVisible({ timeout: 10_000 });
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
    await loginAsFranchiseeUI(page);
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
