import { test, expect } from "@playwright/test";

test.describe("Admin Brands Management", () => {
  test.beforeEach(async ({ page, request }) => {
    await request.post("/api/auth/dev-login");
    await page.goto("/admin/brands");
    await page.waitForSelector("[data-testid='text-brands-title']", { timeout: 10_000 });
  });

  test("displays brand management page title", async ({ page }) => {
    await expect(page.locator("[data-testid='text-brands-title']")).toHaveText("Brand Management");
  });

  test("shows create brand button", async ({ page }) => {
    await expect(page.locator("[data-testid='button-create-brand']")).toBeVisible();
  });

  test("opens create brand dialog when button is clicked", async ({ page }) => {
    await page.locator("[data-testid='button-create-brand']").click();
    await expect(page.locator("[data-testid='input-brand-name']")).toBeVisible({ timeout: 5_000 });
    await expect(page.locator("[data-testid='input-brand-slug']")).toBeVisible();
    await expect(page.locator("[data-testid='button-submit-create-brand']")).toBeVisible();
  });

  test("auto-generates slug from brand name", async ({ page }) => {
    await page.locator("[data-testid='button-create-brand']").click();
    await page.waitForSelector("[data-testid='input-brand-name']", { timeout: 5_000 });

    await page.fill("[data-testid='input-brand-name']", "My Test Brand");
    const slugValue = await page.locator("[data-testid='input-brand-slug']").inputValue();
    expect(slugValue).toBe("my-test-brand");
  });

  test("creates a new brand successfully", async ({ page }) => {
    const uniqueName = `E2E-Brand-${Date.now()}`;
    const uniqueSlug = uniqueName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    await page.locator("[data-testid='button-create-brand']").click();
    await page.waitForSelector("[data-testid='input-brand-name']", { timeout: 5_000 });

    await page.fill("[data-testid='input-brand-name']", uniqueName);
    await page.fill("[data-testid='input-brand-slug']", uniqueSlug);

    await page.locator("[data-testid='button-submit-create-brand']").click();

    await expect(page.locator("[data-testid='text-brand-detail-title']")).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("[data-testid='text-brand-detail-title']")).toHaveText(uniqueName);
  });

  test("cancel button closes create dialog", async ({ page }) => {
    await page.locator("[data-testid='button-create-brand']").click();
    await page.waitForSelector("[data-testid='input-brand-name']", { timeout: 5_000 });

    await page.locator("[data-testid='button-cancel-create-brand']").click();
    await expect(page.locator("[data-testid='input-brand-name']")).not.toBeVisible({ timeout: 5_000 });
  });
});

test.describe("Admin Brand Detail", () => {
  let brandId: string;
  let brandName: string;

  test.beforeEach(async ({ page, request }) => {
    await request.post("/api/auth/dev-login");

    brandName = `Detail-Brand-${Date.now()}`;
    const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const res = await request.post("/api/brands", {
      data: { name: brandName, slug },
    });
    const brand = await res.json();
    brandId = brand.id;

    await page.goto(`/admin/brands/${brandId}`);
    await page.waitForSelector("[data-testid='text-brand-detail-title']", { timeout: 10_000 });
  });

  test("displays brand name as page title", async ({ page }) => {
    await expect(page.locator("[data-testid='text-brand-detail-title']")).toHaveText(brandName);
  });

  test("shows tabs for brand sections", async ({ page }) => {
    await expect(page.locator("[data-testid='tab-parameters']")).toBeVisible();
    await expect(page.locator("[data-testid='tab-startup-costs']")).toBeVisible();
    await expect(page.locator("[data-testid='tab-identity']")).toBeVisible();
    await expect(page.locator("[data-testid='tab-account-manager']")).toBeVisible();
  });

  test("back button navigates to brands list", async ({ page }) => {
    await page.locator("[data-testid='button-back-to-brands']").first().click();
    await expect(page.locator("[data-testid='text-brands-title']")).toBeVisible({ timeout: 10_000 });
  });

  test("can switch between tabs", async ({ page }) => {
    await page.locator("[data-testid='tab-identity']").click();
    await page.waitForTimeout(500);

    await page.locator("[data-testid='tab-startup-costs']").click();
    await page.waitForTimeout(500);

    await page.locator("[data-testid='tab-parameters']").click();
    await page.waitForTimeout(500);
  });
});
