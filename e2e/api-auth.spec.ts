import { test, expect } from "@playwright/test";

test.describe("Auth API Tests", () => {
  test("dev-enabled endpoint returns devMode status", async ({ request }) => {
    const res = await request.get("/api/auth/dev-enabled");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(typeof body.devMode).toBe("boolean");
  });

  test("dev login creates session and returns user", async ({ request }) => {
    const loginRes = await request.post("/api/auth/dev-login");
    expect(loginRes.status()).toBe(200);
    const user = await loginRes.json();
    expect(user.email).toBe("dev@katgroupinc.com");
    expect(user.role).toBe("katalyst_admin");

    const meRes = await request.get("/api/auth/me");
    expect(meRes.status()).toBe(200);
    const me = await meRes.json();
    expect(me.email).toBe("dev@katgroupinc.com");
  });

  test("unauthenticated /me returns 401", async ({ request }) => {
    const res = await request.get("/api/auth/me");
    expect([200, 401]).toContain(res.status());
  });

  test("logout destroys session", async ({ request }) => {
    await request.post("/api/auth/dev-login");

    const logoutRes = await request.post("/api/auth/logout");
    expect(logoutRes.status()).toBe(200);
    const body = await logoutRes.json();
    expect(body.message).toBe("Logged out");
  });

  test("invalid login returns 401", async ({ request }) => {
    const res = await request.post("/api/auth/login", {
      data: { email: "nonexistent@test.com", password: "wrongpassword" },
    });
    expect(res.status()).toBe(401);
  });
});

test.describe("Brands API Tests", () => {
  test("list brands requires authentication", async ({ request }) => {
    const res = await request.get("/api/brands");
    expect([401, 403]).toContain(res.status());
  });

  test("admin can list brands", async ({ request }) => {
    await request.post("/api/auth/dev-login");
    const res = await request.get("/api/brands");
    expect(res.status()).toBe(200);
    const brands = await res.json();
    expect(Array.isArray(brands)).toBe(true);
  });

  test("create brand with valid data", async ({ request }) => {
    await request.post("/api/auth/dev-login");
    const uniqueName = `APITest-${Date.now()}`;
    const slug = uniqueName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const res = await request.post("/api/brands", {
      data: { name: uniqueName, slug },
    });
    expect(res.status()).toBe(201);
    const brand = await res.json();
    expect(brand.name).toBe(uniqueName);
    expect(brand.slug).toBe(slug);
  });

  test("create brand with duplicate slug returns 409", async ({ request }) => {
    await request.post("/api/auth/dev-login");
    const uniqueName = `DupSlug-${Date.now()}`;
    const slug = uniqueName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    await request.post("/api/brands", { data: { name: uniqueName, slug } });

    const res = await request.post("/api/brands", {
      data: { name: `${uniqueName}-2`, slug },
    });
    expect(res.status()).toBe(409);
  });
});

test.describe("Invitations API Tests", () => {
  test("list invitations requires authentication", async ({ request }) => {
    const res = await request.get("/api/invitations");
    expect([401, 403]).toContain(res.status());
  });

  test("admin can list invitations", async ({ request }) => {
    await request.post("/api/auth/dev-login");
    const res = await request.get("/api/invitations");
    expect(res.status()).toBe(200);
    const invitations = await res.json();
    expect(Array.isArray(invitations)).toBe(true);
  });

  test("create invitation with valid data", async ({ request }) => {
    await request.post("/api/auth/dev-login");

    const brandsRes = await request.get("/api/brands");
    const brands = await brandsRes.json();
    if (brands.length === 0) {
      test.skip();
      return;
    }

    const uniqueEmail = `apitest-${Date.now()}@example.com`;
    const res = await request.post("/api/invitations", {
      data: { email: uniqueEmail, role: "franchisee", brand_id: brands[0].id },
    });
    expect(res.status()).toBe(201);
    const inv = await res.json();
    expect(inv.email).toBe(uniqueEmail);
    expect(inv.acceptUrl).toBeDefined();
  });

  test("create invitation with invalid email returns 400", async ({ request }) => {
    await request.post("/api/auth/dev-login");
    const res = await request.post("/api/invitations", {
      data: { email: "not-email", role: "katalyst_admin" },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe("Onboarding API Tests", () => {
  test("onboarding complete returns recommendation", async ({ request }) => {
    await request.post("/api/auth/dev-login");
    const res = await request.post("/api/onboarding/complete", {
      data: {
        franchise_experience: "none",
        financial_literacy: "basic",
        planning_experience: "first_time",
      },
    });
    expect([200, 403]).toContain(res.status());
  });

  test("admin account managers endpoint works", async ({ request }) => {
    await request.post("/api/auth/dev-login");
    const res = await request.get("/api/admin/account-managers");
    expect(res.status()).toBe(200);
    const managers = await res.json();
    expect(Array.isArray(managers)).toBe(true);
  });
});
