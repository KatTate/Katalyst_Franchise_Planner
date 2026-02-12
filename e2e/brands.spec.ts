import { test, expect } from "@playwright/test";

test.describe("Brand Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.click("[data-testid='button-dev-login']");
    await page.waitForURL("/", { timeout: 10_000 });
    await page.goto("/admin/brands");
    await page.waitForURL("/admin/brands", { timeout: 10_000 });
  });

  test("brands page loads with title and create button", async ({ page }) => {
    await expect(page.locator("[data-testid='text-brands-title']")).toBeVisible();
    await expect(page.locator("[data-testid='text-brands-title']")).toContainText("Brand Management");
    await expect(page.locator("[data-testid='button-create-brand']")).toBeVisible();
  });

  test("create brand dialog opens and closes", async ({ page }) => {
    await page.click("[data-testid='button-create-brand']");
    await expect(page.locator("[data-testid='input-brand-name']")).toBeVisible({ timeout: 5_000 });
    await expect(page.locator("[data-testid='input-brand-slug']")).toBeVisible();
    await expect(page.locator("[data-testid='button-submit-create-brand']")).toBeVisible();

    await page.click("[data-testid='button-cancel-create-brand']");
    await expect(page.locator("[data-testid='input-brand-name']")).not.toBeVisible({ timeout: 5_000 });
  });

  test("create brand with auto-generated slug", async ({ page }) => {
    const uniqueName = `TestBrand${Date.now()}`;
    const expectedSlug = uniqueName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    await page.click("[data-testid='button-create-brand']");
    await page.fill("[data-testid='input-brand-name']", uniqueName);

    const slugValue = await page.locator("[data-testid='input-brand-slug']").inputValue();
    expect(slugValue).toBe(expectedSlug);

    await page.click("[data-testid='button-submit-create-brand']");

    await page.waitForURL(/\/admin\/brands\//, { timeout: 10_000 });
  });

  test("brand cards are clickable and navigate to detail", async ({ page }) => {
    const brandCards = page.locator("[data-testid^='card-brand-']");
    const count = await brandCards.count();
    if (count > 0) {
      await brandCards.first().click();
      await page.waitForURL(/\/admin\/brands\//, { timeout: 10_000 });
    }
  });
});
