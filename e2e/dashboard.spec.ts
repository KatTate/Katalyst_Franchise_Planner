import { test, expect } from "@playwright/test";

test.describe("Dashboard & Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });
  });

  test("dashboard renders welcome message and getting started", async ({ page }) => {
    await expect(page.locator("[data-testid='text-welcome']")).toBeVisible();
    await expect(page.locator("[data-testid='text-welcome']")).toContainText("Welcome");
    await expect(page.locator("[data-testid='text-dashboard-heading']")).toContainText("Getting Started");
    await expect(page.locator("[data-testid='text-dashboard-info']")).toContainText("katalyst admin");
  });

  test("sidebar is visible and toggle works", async ({ page }) => {
    const trigger = page.locator("[data-testid='button-sidebar-toggle']");
    await expect(trigger).toBeVisible();
    await trigger.click();
    await page.waitForTimeout(500);
    await trigger.click();
  });

  test("sidebar shows user info", async ({ page }) => {
    await expect(page.locator("[data-testid='text-sidebar-user-name']")).toBeVisible();
    await expect(page.locator("[data-testid='text-sidebar-user-role']")).toBeVisible();
  });

  test("sidebar navigation to invitations page", async ({ page }) => {
    const invLink = page.locator("[data-testid='nav-invitations']");
    await expect(invLink).toBeVisible();
    await invLink.click();
    await page.waitForURL("/admin/invitations", { timeout: 10_000 });
    await expect(page.locator("[data-testid='text-page-title']")).toBeVisible();
  });

  test("sidebar navigation to brands page", async ({ page }) => {
    const brandsLink = page.locator("[data-testid='nav-brands']");
    await expect(brandsLink).toBeVisible();
    await brandsLink.click();
    await page.waitForURL("/admin/brands", { timeout: 10_000 });
    await expect(page.locator("[data-testid='text-brands-title']")).toBeVisible();
  });

  test("logout flow shows confirmation dialog", async ({ page }) => {
    await page.click("[data-testid='button-sidebar-logout']");
    await expect(page.locator("[data-testid='text-logout-title']")).toBeVisible({ timeout: 5_000 });
    await expect(page.locator("[data-testid='text-logout-description']")).toBeVisible();
    await page.click("[data-testid='button-logout-cancel']");
    await expect(page.locator("[data-testid='text-logout-title']")).not.toBeVisible({ timeout: 5_000 });
  });

  test("logout confirmation redirects to login", async ({ page }) => {
    await page.click("[data-testid='button-sidebar-logout']");
    await expect(page.locator("[data-testid='text-logout-title']")).toBeVisible({ timeout: 5_000 });
    await page.click("[data-testid='button-logout-confirm']");
    await page.waitForURL(/\/login/, { timeout: 10_000 });
    await expect(page.locator("[data-testid='button-dev-login']")).toBeVisible();
  });
});
