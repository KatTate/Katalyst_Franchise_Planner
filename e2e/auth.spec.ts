import { test, expect } from "@playwright/test";

test.describe("Authentication Flows", () => {
  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("[data-testid='button-dev-login']")).toBeVisible();
    await expect(page.locator("input[type='email'], input[name='email']")).toBeVisible();
    await expect(page.locator("input[type='password'], input[name='password']")).toBeVisible();
  });

  test("dev login redirects to dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });
    await expect(page.locator("[data-testid='text-welcome']")).toBeVisible();
    await expect(page.locator("[data-testid='text-welcome']")).toContainText("Welcome");
  });

  test("dashboard shows correct content after login", async ({ page }) => {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });
    await expect(page.locator("[data-testid='text-dashboard-heading']")).toContainText("Getting Started");
    await expect(page.locator("[data-testid='text-dashboard-info']")).toContainText("katalyst admin");
  });

  test("sidebar toggle is functional", async ({ page }) => {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });
    const trigger = page.locator("[data-testid='button-sidebar-toggle']");
    await expect(trigger).toBeVisible();
    await trigger.click();
  });

  test("auth session is valid after login", async ({ request }) => {
    const loginRes = await request.post("/api/auth/dev-login");
    expect(loginRes.status()).toBe(200);

    const meRes = await request.get("/api/auth/me");
    expect(meRes.status()).toBe(200);
    const me = await meRes.json();
    expect(me.email).toBe("dev@katgroupinc.com");
    expect(me.role).toBe("katalyst_admin");
  });

  test("logout destroys session", async ({ page }) => {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });

    await page.request.post("/api/auth/logout");

    await page.goto("/");
    await page.waitForURL(/\/login/, { timeout: 10_000 });
    await expect(page.locator("[data-testid='button-dev-login']")).toBeVisible();
  });

  test("invalid credentials show error", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[name='email']", "nonexistent@test.com");
    await page.fill("input[name='password']", "wrongpassword");
    await page.click("[data-testid='button-login']");
    await expect(page.locator("[data-testid='text-error-login']")).toBeVisible({ timeout: 10_000 });
    expect(page.url()).toContain("/login");
  });
});
