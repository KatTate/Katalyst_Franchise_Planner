import { test, expect } from "@playwright/test";

test.describe("Invitation Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });
    await page.goto("/admin/invitations");
    await page.waitForURL("/admin/invitations", { timeout: 10_000 });
  });

  test("invitations page loads with form and list", async ({ page }) => {
    await expect(page.locator("[data-testid='text-page-title']")).toBeVisible();
    await expect(page.locator("[data-testid='input-invite-email']")).toBeVisible();
    await expect(page.locator("[data-testid='button-send-invitation']")).toBeVisible();
  });

  test("shows validation error for empty form submission", async ({ page }) => {
    await page.locator("[data-testid='button-send-invitation']").click();
    await expect(page.locator("[data-testid='text-form-errors']")).toBeVisible({ timeout: 5_000 });
  });

  test("role select shows role options", async ({ page }) => {
    const roleSelect = page.locator("[data-testid='select-invite-role']");
    await roleSelect.click();
    await expect(page.locator("[data-testid='option-role-franchisee']")).toBeVisible({ timeout: 5_000 });
    await expect(page.locator("[data-testid='option-role-franchisor']")).toBeVisible();
    await expect(page.locator("[data-testid='option-role-katalyst_admin']")).toBeVisible();
  });

  test("brand select appears when franchisee role is selected", async ({ page }) => {
    const roleSelect = page.locator("[data-testid='select-invite-role']");
    await roleSelect.click();
    await page.locator("[data-testid='option-role-franchisee']").click();
    await expect(page.locator("[data-testid='select-invite-brand']")).toBeVisible({ timeout: 5_000 });
  });

  test("creates an invitation successfully", async ({ page }) => {
    const uniqueEmail = `test-${Date.now()}@example.com`;

    await page.fill("[data-testid='input-invite-email']", uniqueEmail);

    const roleSelect = page.locator("[data-testid='select-invite-role']");
    await roleSelect.click();
    await page.locator("[data-testid='option-role-katalyst_admin']").click();

    await page.locator("[data-testid='button-send-invitation']").click();

    await expect(page.locator(`text=${uniqueEmail}`)).toBeVisible({ timeout: 10_000 });
  });

  test("invitation list shows status badges", async ({ page }) => {
    const rows = page.locator("table tbody tr");
    const count = await rows.count();
    if (count > 0) {
      const firstBadge = rows.first().locator("[data-testid^='badge-invitation-status']");
      await expect(firstBadge).toBeVisible();
    }
  });
});
