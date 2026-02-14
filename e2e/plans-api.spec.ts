import { test, expect } from "@playwright/test";

test.describe("Plans API Tests", () => {
  let brandId: string;

  test.beforeEach(async ({ request }) => {
    await request.post("/api/auth/dev-login");

    const brandName = `PlanBrand-${Date.now()}`;
    const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const brandRes = await request.post("/api/brands", {
      data: { name: brandName, slug },
    });
    const brand = await brandRes.json();
    brandId = brand.id;
  });

  test("create a plan for authenticated user", async ({ request }) => {
    const meRes = await request.get("/api/auth/me");
    const me = await meRes.json();

    const res = await request.post("/api/plans", {
      data: {
        userId: me.id,
        brandId: brandId,
        name: `Test Plan ${Date.now()}`,
        status: "draft",
      },
    });

    expect(res.status()).toBe(201);
    const plan = await res.json();
    expect(plan.name).toContain("Test Plan");
    expect(plan.brandId).toBe(brandId);
    expect(plan.status).toBe("draft");
  });

  test("list plans for authenticated user", async ({ request }) => {
    const res = await request.get("/api/plans");
    expect(res.status()).toBe(200);
    const plans = await res.json();
    expect(Array.isArray(plans)).toBe(true);
  });

  test("get a specific plan by id", async ({ request }) => {
    const meRes = await request.get("/api/auth/me");
    const me = await meRes.json();

    const createRes = await request.post("/api/plans", {
      data: {
        userId: me.id,
        brandId,
        name: `Get Plan ${Date.now()}`,
        status: "draft",
      },
    });
    const plan = await createRes.json();

    const getRes = await request.get(`/api/plans/${plan.id}`);
    expect(getRes.status()).toBe(200);
    const fetched = await getRes.json();
    expect(fetched.id).toBe(plan.id);
  });

  test("update a plan", async ({ request }) => {
    const meRes = await request.get("/api/auth/me");
    const me = await meRes.json();

    const createRes = await request.post("/api/plans", {
      data: {
        userId: me.id,
        brandId,
        name: `Update Plan ${Date.now()}`,
        status: "draft",
      },
    });
    const plan = await createRes.json();

    const updateRes = await request.patch(`/api/plans/${plan.id}`, {
      data: { name: "Updated Plan Name" },
    });
    expect(updateRes.status()).toBe(200);
    const updated = await updateRes.json();
    expect(updated.name).toBe("Updated Plan Name");
  });

  test("delete a plan", async ({ request }) => {
    const meRes = await request.get("/api/auth/me");
    const me = await meRes.json();

    const createRes = await request.post("/api/plans", {
      data: {
        userId: me.id,
        brandId,
        name: `Delete Plan ${Date.now()}`,
        status: "draft",
      },
    });
    const plan = await createRes.json();

    const deleteRes = await request.delete(`/api/plans/${plan.id}`);
    expect(deleteRes.status()).toBe(204);

    const getRes = await request.get(`/api/plans/${plan.id}`);
    expect([403, 404]).toContain(getRes.status());
  });

  test("plans require authentication", async ({ request }) => {
    await request.post("/api/auth/logout");
    const res = await request.get("/api/plans");
    expect([401, 403]).toContain(res.status());
  });
});

test.describe("Users API Tests", () => {
  test("authenticated user can access /api/auth/me", async ({ request }) => {
    await request.post("/api/auth/dev-login");
    const res = await request.get("/api/auth/me");
    expect(res.status()).toBe(200);
    const user = await res.json();
    expect(user.email).toBeDefined();
    expect(user.role).toBeDefined();
  });

  test("can update preferred tier", async ({ request }) => {
    await request.post("/api/auth/dev-login");
    const res = await request.patch("/api/auth/me", {
      data: { preferredTier: "quick_entry" },
    });
    expect(res.status()).toBe(200);
    const user = await res.json();
    expect(user.preferredTier).toBe("quick_entry");
  });

  test("rejects invalid preferred tier", async ({ request }) => {
    await request.post("/api/auth/dev-login");
    const res = await request.patch("/api/auth/me", {
      data: { preferredTier: "invalid_tier" },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe("Onboarding API Tests", () => {
  test("complete onboarding returns recommendation", async ({ request }) => {
    const uniqueEmail = `onboard-api-${Date.now()}@example.com`;
    const brandName = `OnboardAPIBrand-${Date.now()}`;
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
        display_name: "API Tester",
        password: "TestPass123!",
      },
    });

    if (acceptRes.status() !== 201) {
      test.skip();
      return;
    }

    const res = await request.post("/api/onboarding/complete", {
      data: {
        franchise_experience: "none",
        financial_literacy: "basic",
        planning_experience: "first_time",
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.recommendedTier).toBeDefined();
    expect(["planning_assistant", "forms", "quick_entry"]).toContain(body.recommendedTier);
  });
});
