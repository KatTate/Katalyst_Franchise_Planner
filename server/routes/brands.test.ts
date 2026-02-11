import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../storage", () => ({
  storage: {
    getBrands: vi.fn(),
    getBrand: vi.fn(),
    getBrandBySlug: vi.fn(),
    getBrandByName: vi.fn(),
    createBrand: vi.fn(),
    updateBrand: vi.fn(),
    updateBrandParameters: vi.fn(),
    updateStartupCostTemplate: vi.fn(),
    updateBrandIdentity: vi.fn(),
    getFranchiseesByBrand: vi.fn(),
    getBrandAccountManagers: vi.fn(),
    upsertBrandAccountManager: vi.fn(),
    removeBrandAccountManager: vi.fn(),
    setDefaultAccountManager: vi.fn(),
    getUser: vi.fn(),
    getKatalystAdmins: vi.fn(),
    getBrandAccountManager: vi.fn(),
  },
}));

import { storage } from "../storage";
import brandsRouter from "./brands";

function createApp(user?: Express.User) {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res: any, next: any) => {
    if (user) {
      req.user = user;
      req.isAuthenticated = () => true;
    } else {
      req.isAuthenticated = () => false;
    }
    next();
  });
  app.use("/api/brands", brandsRouter);
  return app;
}

const adminUser: Express.User = {
  id: "a1",
  email: "admin@katgroupinc.com",
  role: "katalyst_admin",
  brandId: null,
  displayName: "Admin",
  profileImageUrl: null,
  onboardingCompleted: true,
  preferredTier: null,
};

const franchisorUser: Express.User = {
  id: "fr1",
  email: "franchisor@test.com",
  role: "franchisor",
  brandId: "b1",
  displayName: "Franchisor",
  profileImageUrl: null,
  onboardingCompleted: true,
  preferredTier: null,
};

describe("Brands Routes", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("GET /api/brands", () => {
    it("returns 401 when not authenticated", async () => {
      const app = createApp();
      const res = await request(app).get("/api/brands");
      expect(res.status).toBe(401);
    });

    it("returns all brands for admin", async () => {
      (storage.getBrands as any).mockResolvedValue([
        { id: "b1", name: "PostNet" },
        { id: "b2", name: "Brand2" },
      ]);
      const app = createApp(adminUser);
      const res = await request(app).get("/api/brands");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it("returns only own brand for franchisor", async () => {
      (storage.getBrand as any).mockResolvedValue({ id: "b1", name: "PostNet" });
      const app = createApp(franchisorUser);
      const res = await request(app).get("/api/brands");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(storage.getBrand).toHaveBeenCalledWith("b1");
    });

    it("returns 403 for franchisee", async () => {
      const app = createApp({
        ...adminUser,
        id: "f1",
        role: "franchisee",
        brandId: "b1",
      });
      const res = await request(app).get("/api/brands");
      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/brands", () => {
    it("creates brand with valid data", async () => {
      (storage.getBrandBySlug as any).mockResolvedValue(null);
      (storage.getBrandByName as any).mockResolvedValue(null);
      (storage.createBrand as any).mockResolvedValue({
        id: "new-b1",
        name: "NewBrand",
        slug: "newbrand",
        displayName: "NewBrand",
      });

      const app = createApp(adminUser);
      const res = await request(app).post("/api/brands").send({
        name: "NewBrand",
        slug: "newbrand",
      });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe("NewBrand");
    });

    it("returns 409 for duplicate slug", async () => {
      (storage.getBrandBySlug as any).mockResolvedValue({ id: "b1" });
      const app = createApp(adminUser);
      const res = await request(app).post("/api/brands").send({
        name: "NewBrand",
        slug: "existing-slug",
      });
      expect(res.status).toBe(409);
    });

    it("returns 409 for duplicate name", async () => {
      (storage.getBrandBySlug as any).mockResolvedValue(null);
      (storage.getBrandByName as any).mockResolvedValue({ id: "b1" });
      const app = createApp(adminUser);
      const res = await request(app).post("/api/brands").send({
        name: "ExistingBrand",
        slug: "new-slug",
      });
      expect(res.status).toBe(409);
    });

    it("returns 400 for invalid slug format", async () => {
      const app = createApp(adminUser);
      const res = await request(app).post("/api/brands").send({
        name: "Brand",
        slug: "Invalid Slug!",
      });
      expect(res.status).toBe(400);
    });

    it("returns 403 for franchisor", async () => {
      const app = createApp(franchisorUser);
      const res = await request(app).post("/api/brands").send({
        name: "Brand",
        slug: "brand",
      });
      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/brands/:brandId", () => {
    it("returns brand for admin", async () => {
      (storage.getBrand as any).mockResolvedValue({ id: "b1", name: "PostNet" });
      const app = createApp(adminUser);
      const res = await request(app).get("/api/brands/b1");
      expect(res.status).toBe(200);
      expect(res.body.name).toBe("PostNet");
    });

    it("returns 404 for non-existent brand", async () => {
      (storage.getBrand as any).mockResolvedValue(undefined);
      const app = createApp(adminUser);
      const res = await request(app).get("/api/brands/nonexistent");
      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/brands/:brandId/identity", () => {
    it("updates identity with valid data", async () => {
      (storage.getBrand as any).mockResolvedValue({ id: "b1" });
      (storage.updateBrandIdentity as any).mockResolvedValue({ id: "b1", displayName: "Updated" });

      const app = createApp(adminUser);
      const res = await request(app).put("/api/brands/b1/identity").send({
        display_name: "Updated",
        primary_color: "#FF5733",
      });
      expect(res.status).toBe(200);
    });

    it("returns 400 for invalid hex color", async () => {
      (storage.getBrand as any).mockResolvedValue({ id: "b1" });
      const app = createApp(adminUser);
      const res = await request(app).put("/api/brands/b1/identity").send({
        primary_color: "red",
      });
      expect(res.status).toBe(400);
    });
  });

  describe("Brand Account Managers", () => {
    it("lists brand account managers", async () => {
      (storage.getBrand as any).mockResolvedValue({ id: "b1" });
      (storage.getBrandAccountManagers as any).mockResolvedValue([
        { brandId: "b1", accountManagerId: "m1", bookingUrl: "https://cal.com/m1" },
      ]);

      const app = createApp(adminUser);
      const res = await request(app).get("/api/brands/b1/account-managers");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it("verifies manager is katalyst_admin before assigning", async () => {
      (storage.getBrand as any).mockResolvedValue({ id: "b1" });
      (storage.getUser as any).mockResolvedValue({ id: "m1", role: "franchisee" });

      const app = createApp(adminUser);
      const res = await request(app).put("/api/brands/b1/account-managers").send({
        account_manager_id: "m1",
        booking_url: "https://cal.com/m1",
      });
      expect(res.status).toBe(404);
      expect(res.body.message).toContain("not a Katalyst admin");
    });

    it("clears default when deleting that manager", async () => {
      (storage.getBrand as any).mockResolvedValue({ id: "b1", defaultAccountManagerId: "m1" });
      (storage.setDefaultAccountManager as any).mockResolvedValue({});
      (storage.removeBrandAccountManager as any).mockResolvedValue(undefined);

      const app = createApp(adminUser);
      const res = await request(app).delete("/api/brands/b1/account-managers/m1");
      expect(res.status).toBe(200);
      expect(storage.setDefaultAccountManager).toHaveBeenCalledWith("b1", null);
    });
  });
});
