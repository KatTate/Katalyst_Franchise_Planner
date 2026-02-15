import { test, expect } from "@playwright/test";

test.describe("Story 3.3 — Startup Cost Customization E2E API", () => {
  let brandId: string;
  let planId: string;

  test.beforeEach(async ({ request }) => {
    await request.post("/api/auth/dev-login");

    const brandName = `SC-Brand-${Date.now()}`;
    const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const brandRes = await request.post("/api/brands", {
      data: { name: brandName, slug },
    });
    const brand = await brandRes.json();
    brandId = brand.id;

    const meRes = await request.get("/api/auth/me");
    const me = await meRes.json();

    const planRes = await request.post("/api/plans", {
      data: {
        userId: me.id,
        brandId,
        name: `SC-Plan-${Date.now()}`,
        status: "draft",
      },
    });
    const plan = await planRes.json();
    planId = plan.id;
  });

  test("GET startup costs returns array", async ({ request }) => {
    const res = await request.get(`/api/plans/${planId}/startup-costs`);
    expect(res.status()).toBe(200);
    const costs = await res.json();
    expect(Array.isArray(costs)).toBe(true);
  });

  test("PUT startup costs saves and returns updated array", async ({ request }) => {
    const items = [
      {
        id: "00000000-0000-4000-8000-000000000001",
        name: "Equipment",
        amount: 5000000,
        capexClassification: "capex",
        isCustom: false,
        source: "brand_default",
        brandDefaultAmount: 5000000,
        item7RangeLow: 4000000,
        item7RangeHigh: 6000000,
        sortOrder: 0,
      },
    ];

    const res = await request.put(`/api/plans/${planId}/startup-costs`, {
      data: items,
    });
    expect(res.status()).toBe(200);
    const saved = await res.json();
    expect(saved).toHaveLength(1);
    expect(saved[0].name).toBe("Equipment");
    expect(saved[0].amount).toBe(5000000);
  });

  test("PUT followed by GET returns consistent data", async ({ request }) => {
    const items = [
      {
        id: "00000000-0000-4000-8000-000000000010",
        name: "Franchise Fee",
        amount: 3500000,
        capexClassification: "non_capex",
        isCustom: false,
        source: "brand_default",
        brandDefaultAmount: 3500000,
        item7RangeLow: null,
        item7RangeHigh: null,
        sortOrder: 0,
      },
    ];

    await request.put(`/api/plans/${planId}/startup-costs`, { data: items });

    const res = await request.get(`/api/plans/${planId}/startup-costs`);
    expect(res.status()).toBe(200);
    const costs = await res.json();
    expect(costs).toHaveLength(1);
    expect(costs[0].name).toBe("Franchise Fee");
    expect(costs[0].amount).toBe(3500000);
  });

  test("add custom item via PUT preserves metadata", async ({ request }) => {
    const templateItem = {
      id: "00000000-0000-4000-8000-000000000020",
      name: "Equipment",
      amount: 5000000,
      capexClassification: "capex",
      isCustom: false,
      source: "brand_default",
      brandDefaultAmount: 5000000,
      item7RangeLow: 4000000,
      item7RangeHigh: 6000000,
      sortOrder: 0,
    };

    const customItem = {
      id: "00000000-0000-4000-8000-000000000021",
      name: `Custom-${Date.now()}`,
      amount: 250000,
      capexClassification: "non_capex",
      isCustom: true,
      source: "user_entry",
      brandDefaultAmount: null,
      item7RangeLow: null,
      item7RangeHigh: null,
      sortOrder: 1,
    };

    const res = await request.put(`/api/plans/${planId}/startup-costs`, {
      data: [templateItem, customItem],
    });
    expect(res.status()).toBe(200);
    const costs = await res.json();
    expect(costs).toHaveLength(2);

    const custom = costs.find((c: any) => c.isCustom);
    expect(custom).toBeDefined();
    expect(custom.source).toBe("user_entry");
    expect(custom.brandDefaultAmount).toBeNull();
  });

  test("edit template item amount sets user_entry source", async ({ request }) => {
    const item = {
      id: "00000000-0000-4000-8000-000000000030",
      name: "Signage",
      amount: 2000000,
      capexClassification: "capex",
      isCustom: false,
      source: "brand_default",
      brandDefaultAmount: 2000000,
      item7RangeLow: null,
      item7RangeHigh: null,
      sortOrder: 0,
    };

    await request.put(`/api/plans/${planId}/startup-costs`, { data: [item] });

    const edited = { ...item, amount: 3000000, source: "user_entry" };
    const res = await request.put(`/api/plans/${planId}/startup-costs`, {
      data: [edited],
    });
    expect(res.status()).toBe(200);
    const costs = await res.json();
    expect(costs[0].amount).toBe(3000000);
    expect(costs[0].source).toBe("user_entry");
    expect(costs[0].brandDefaultAmount).toBe(2000000);
  });

  test("remove custom item via PUT (omit from array)", async ({ request }) => {
    const templateItem = {
      id: "00000000-0000-4000-8000-000000000040",
      name: "Equipment",
      amount: 5000000,
      capexClassification: "capex",
      isCustom: false,
      source: "brand_default",
      brandDefaultAmount: 5000000,
      item7RangeLow: null,
      item7RangeHigh: null,
      sortOrder: 0,
    };

    const customItem = {
      id: "00000000-0000-4000-8000-000000000041",
      name: "Custom Deposit",
      amount: 100000,
      capexClassification: "non_capex",
      isCustom: true,
      source: "user_entry",
      brandDefaultAmount: null,
      item7RangeLow: null,
      item7RangeHigh: null,
      sortOrder: 1,
    };

    await request.put(`/api/plans/${planId}/startup-costs`, {
      data: [templateItem, customItem],
    });

    const res = await request.put(`/api/plans/${planId}/startup-costs`, {
      data: [templateItem],
    });
    expect(res.status()).toBe(200);
    const costs = await res.json();
    expect(costs).toHaveLength(1);
    expect(costs[0].name).toBe("Equipment");
  });

  test("reorder items via PUT", async ({ request }) => {
    const item1 = {
      id: "00000000-0000-4000-8000-000000000050",
      name: "First Item",
      amount: 1000000,
      capexClassification: "capex",
      isCustom: false,
      source: "brand_default",
      brandDefaultAmount: 1000000,
      item7RangeLow: null,
      item7RangeHigh: null,
      sortOrder: 0,
    };

    const item2 = {
      id: "00000000-0000-4000-8000-000000000051",
      name: "Second Item",
      amount: 2000000,
      capexClassification: "non_capex",
      isCustom: false,
      source: "brand_default",
      brandDefaultAmount: 2000000,
      item7RangeLow: null,
      item7RangeHigh: null,
      sortOrder: 1,
    };

    await request.put(`/api/plans/${planId}/startup-costs`, { data: [item1, item2] });

    const reordered = [
      { ...item2, sortOrder: 0 },
      { ...item1, sortOrder: 1 },
    ];
    const res = await request.put(`/api/plans/${planId}/startup-costs`, {
      data: reordered,
    });
    expect(res.status()).toBe(200);
    const costs = await res.json();
    expect(costs[0].name).toBe("Second Item");
    expect(costs[0].sortOrder).toBe(0);
    expect(costs[1].name).toBe("First Item");
    expect(costs[1].sortOrder).toBe(1);
  });

  test("POST reset restores brand defaults", async ({ request }) => {
    const res = await request.post(`/api/plans/${planId}/startup-costs/reset`);
    expect(res.status()).toBe(200);
    const costs = await res.json();
    expect(Array.isArray(costs)).toBe(true);
  });

  test("PUT rejects invalid data (missing required fields)", async ({ request }) => {
    const res = await request.put(`/api/plans/${planId}/startup-costs`, {
      data: [{ name: "Bad" }],
    });
    expect(res.status()).toBe(400);
  });

  test("PUT rejects item7RangeLow > item7RangeHigh", async ({ request }) => {
    const bad = {
      id: "00000000-0000-4000-8000-000000000060",
      name: "Bad Range",
      amount: 1000000,
      capexClassification: "capex",
      isCustom: false,
      source: "brand_default",
      brandDefaultAmount: 1000000,
      item7RangeLow: 5000000,
      item7RangeHigh: 3000000,
      sortOrder: 0,
    };

    const res = await request.put(`/api/plans/${planId}/startup-costs`, {
      data: [bad],
    });
    expect(res.status()).toBe(400);
  });

  test("startup costs require authentication", async ({ request }) => {
    await request.post("/api/auth/logout");

    const getRes = await request.get(`/api/plans/${planId}/startup-costs`);
    expect([401, 403]).toContain(getRes.status());

    const putRes = await request.put(`/api/plans/${planId}/startup-costs`, {
      data: [],
    });
    expect([401, 403]).toContain(putRes.status());

    const resetRes = await request.post(`/api/plans/${planId}/startup-costs/reset`);
    expect([401, 403]).toContain(resetRes.status());
  });
});
