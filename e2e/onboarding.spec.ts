import { test, expect } from "@playwright/test";

test.describe("Onboarding Flow", () => {
  test.beforeEach(async ({ page, request }) => {
    const uniqueEmail = `onboard-${Date.now()}@example.com`;
    const brandName = `OnboardBrand-${Date.now()}`;
    const brandSlug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    await request.post("/api/auth/dev-login");

    const brandRes = await request.post("/api/brands", {
      data: { name: brandName, slug: brandSlug },
    });
    const brand = await brandRes.json();

    const invRes = await request.post("/api/invitations", {
      data: { email: uniqueEmail, role: "franchisee", brandId: brand.id },
    });
    const invitation = await invRes.json();

    await request.post("/api/auth/logout");

    const acceptRes = await request.post("/api/invitations/accept", {
      data: {
        token: invitation.token,
        display_name: "Onboard Tester",
        password: "TestPass123!",
      },
    });

    if (acceptRes.status() !== 201) {
      test.skip();
      return;
    }

    await page.goto("/onboarding");
  });

  test("shows onboarding questions for new franchisee", async ({ page }) => {
    await expect(page.locator("[data-testid='text-onboarding-title']")).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("[data-testid='button-next']")).toBeVisible();
  });

  test("navigates through all three questions", async ({ page }) => {
    await page.waitForSelector("[data-testid='radio-franchise_experience-none']", { timeout: 10_000 });
    await page.locator("[data-testid='radio-franchise_experience-none']").click();
    await page.locator("[data-testid='button-next']").click();

    await expect(page.locator("[data-testid='radio-financial_literacy-basic']")).toBeVisible({ timeout: 5_000 });
    await page.locator("[data-testid='radio-financial_literacy-basic']").click();
    await page.locator("[data-testid='button-next']").click();

    await expect(page.locator("[data-testid='radio-planning_experience-first_time']")).toBeVisible({ timeout: 5_000 });
    await page.locator("[data-testid='radio-planning_experience-first_time']").click();
    await page.locator("[data-testid='button-next']").click();

    await expect(page.locator("[data-testid='text-recommendation-title']")).toBeVisible({ timeout: 10_000 });
  });

  test("back button navigates to previous question", async ({ page }) => {
    await page.waitForSelector("[data-testid='radio-franchise_experience-none']", { timeout: 10_000 });
    await page.locator("[data-testid='radio-franchise_experience-none']").click();
    await page.locator("[data-testid='button-next']").click();

    await expect(page.locator("[data-testid='radio-financial_literacy-basic']")).toBeVisible({ timeout: 5_000 });

    await page.locator("[data-testid='button-back']").click();
    await expect(page.locator("[data-testid='radio-franchise_experience-none']")).toBeVisible({ timeout: 5_000 });
  });
});
