import { test, expect } from "@playwright/test";

test.describe("Story 7H.3: Brand CRUD Completion", () => {
  let brandId: string;
  let brandName: string;
  let brandSlug: string;

  test.beforeEach(async ({ page, request }) => {
    await request.post("/api/auth/dev-login");

    brandName = `QA-Brand-${Date.now()}`;
    brandSlug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const res = await request.post("/api/brands", {
      data: { name: brandName, slug: brandSlug },
    });
    const brand = await res.json();
    brandId = brand.id;

    await page.goto(`/admin/brands/${brandId}`);
    await page.waitForSelector("[data-testid='text-brand-detail-title']", { timeout: 10_000 });
  });

  test.describe("AC1: Brand Metadata section in Settings tab", () => {
    test("Settings tab shows Brand Metadata fields pre-populated with current values", async ({ page }) => {
      await page.locator("[data-testid='tab-identity']").click();
      await expect(page.locator("[data-testid='input-meta-brand-name']")).toBeVisible({ timeout: 5_000 });
      await expect(page.locator("[data-testid='input-meta-display-name']")).toBeVisible();
      await expect(page.locator("[data-testid='input-meta-slug']")).toBeVisible();

      const nameValue = await page.locator("[data-testid='input-meta-brand-name']").inputValue();
      expect(nameValue).toBe(brandName);

      const slugValue = await page.locator("[data-testid='input-meta-slug']").inputValue();
      expect(slugValue).toBe(brandSlug);

      await expect(page.locator("[data-testid='button-save-metadata']")).toBeVisible();
    });
  });

  test.describe("AC2: Edit brand metadata with success toast and header update", () => {
    test("editing name and slug updates header and shows toast", async ({ page }) => {
      await page.locator("[data-testid='tab-identity']").click();
      await page.waitForSelector("[data-testid='input-meta-brand-name']", { timeout: 5_000 });

      const newName = `Updated-Brand-${Date.now()}`;
      const newSlug = `updated-slug-${Date.now()}`;

      await page.locator("[data-testid='input-meta-brand-name']").fill(newName);
      await page.locator("[data-testid='input-meta-slug']").fill(newSlug);
      await page.locator("[data-testid='button-save-metadata']").click();

      await expect(page.locator("text=Metadata saved")).toBeVisible({ timeout: 5_000 });

      await expect(page.locator("[data-testid='text-brand-detail-title']")).toHaveText(newName, { timeout: 5_000 });
    });
  });

  test.describe("AC3: Slug field format validation", () => {
    test("shows error for invalid slug characters", async ({ page }) => {
      await page.locator("[data-testid='tab-identity']").click();
      await page.waitForSelector("[data-testid='input-meta-slug']", { timeout: 5_000 });

      await page.locator("[data-testid='input-meta-slug']").fill("Invalid Slug!");
      await expect(page.locator("[data-testid='text-slug-error']")).toBeVisible();
      await expect(page.locator("[data-testid='text-slug-error']")).toContainText("Lowercase letters, numbers, and hyphens only");
    });

    test("accepts valid slug format", async ({ page }) => {
      await page.locator("[data-testid='tab-identity']").click();
      await page.waitForSelector("[data-testid='input-meta-slug']", { timeout: 5_000 });

      await page.locator("[data-testid='input-meta-slug']").fill("valid-slug-123");
      await expect(page.locator("[data-testid='text-slug-error']")).not.toBeVisible();
    });
  });

  test.describe("AC4: Danger Zone section at bottom of Settings tab", () => {
    test("Danger Zone card with Delete Brand button is visible", async ({ page }) => {
      await page.locator("[data-testid='tab-identity']").click();
      await expect(page.locator("[data-testid='button-delete-brand']")).toBeVisible({ timeout: 5_000 });
      await expect(page.locator("text=Danger Zone")).toBeVisible();
      await expect(page.locator("text=Delete this brand")).toBeVisible();
    });
  });

  test.describe("AC5: Delete dialog shows brand name, warning, affected counts, type-to-confirm", () => {
    test("delete dialog displays brand name, warning, stats, and type-to-confirm", async ({ page }) => {
      await page.locator("[data-testid='tab-identity']").click();
      await page.locator("[data-testid='button-delete-brand']").click();

      await expect(page.locator("[data-testid='dialog-delete-brand']")).toBeVisible({ timeout: 5_000 });
      await expect(page.locator("[data-testid='text-delete-brand-title']")).toContainText(brandName);
      await expect(page.locator("[data-testid='text-delete-brand-description']")).toContainText("permanently deleted");

      await expect(page.locator("[data-testid='text-brand-affected-counts']")).toBeVisible({ timeout: 5_000 });
      await expect(page.locator("[data-testid='text-brand-affected-counts']")).toContainText("plan(s)");
      await expect(page.locator("[data-testid='text-brand-affected-counts']")).toContainText("user(s)");

      await expect(page.locator("[data-testid='input-confirm-delete-brand']")).toBeVisible();

      await expect(page.locator("[data-testid='button-confirm-delete-brand']")).toBeDisabled();
    });

    test("typing wrong name keeps delete button disabled", async ({ page }) => {
      await page.locator("[data-testid='tab-identity']").click();
      await page.locator("[data-testid='button-delete-brand']").click();
      await page.waitForSelector("[data-testid='dialog-delete-brand']", { timeout: 5_000 });

      await page.locator("[data-testid='input-confirm-delete-brand']").fill("wrong-name");
      await expect(page.locator("[data-testid='button-confirm-delete-brand']")).toBeDisabled();
    });

    test("typing correct brand name enables delete button", async ({ page }) => {
      await page.locator("[data-testid='tab-identity']").click();
      await page.locator("[data-testid='button-delete-brand']").click();
      await page.waitForSelector("[data-testid='dialog-delete-brand']", { timeout: 5_000 });

      await page.locator("[data-testid='input-confirm-delete-brand']").fill(brandName);
      await expect(page.locator("[data-testid='button-confirm-delete-brand']")).toBeEnabled();
    });
  });

  test.describe("AC6: Confirmed deletion removes brand, shows toast, redirects", () => {
    test("deleting brand shows toast and redirects to brands list", async ({ page, request }) => {
      await page.locator("[data-testid='tab-identity']").click();
      await page.locator("[data-testid='button-delete-brand']").click();
      await page.waitForSelector("[data-testid='dialog-delete-brand']", { timeout: 5_000 });

      await page.locator("[data-testid='input-confirm-delete-brand']").fill(brandName);
      await page.locator("[data-testid='button-confirm-delete-brand']").click();

      await expect(page.locator("text=Brand deleted")).toBeVisible({ timeout: 10_000 });

      await expect(page.locator("[data-testid='text-brands-title']")).toBeVisible({ timeout: 10_000 });
      expect(page.url()).toContain("/admin/brands");

      const getRes = await request.get(`/api/brands/${brandId}`);
      expect(getRes.status()).toBe(404);
    });
  });

  test.describe("AC8: DELETE RBAC enforcement — covered by API unit tests", () => {
    test("stats endpoint requires admin auth (403 without login)", async ({ browser }) => {
      const ctx = await browser.newContext();
      const res = await ctx.request.get(`http://localhost:5000/api/brands/${brandId}/stats`);
      expect(res.status()).toBe(401);
      await ctx.close();
    });
  });

  test.describe("AC9: Brand list page has no delete button", () => {
    test("brand cards on list page have no delete button", async ({ page }) => {
      await page.goto("/admin/brands");
      await page.waitForSelector("[data-testid='text-brands-title']", { timeout: 10_000 });

      const deleteButtons = page.locator("[data-testid='button-delete-brand']");
      await expect(deleteButtons).toHaveCount(0);
    });
  });
});
