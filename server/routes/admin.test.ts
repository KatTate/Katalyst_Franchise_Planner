import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../storage", () => ({
  storage: {
    getKatalystAdmins: vi.fn(),
    getUser: vi.fn(),
    getBrand: vi.fn(),
    getDemoUserForBrand: vi.fn(),
    createDemoUser: vi.fn(),
    createDemoPlan: vi.fn(),
    resetDemoPlan: vi.fn(),
    getPlansByUser: vi.fn(),
    endAuditLog: vi.fn(),
  },
}));

import { storage } from "../storage";
import adminRouter from "./admin";

function createApp(user?: Express.User) {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res: any, next: any) => {
    if (user) {
      req.user = user;
      req.isAuthenticated = () => true;
    }
    if (!req.session) req.session = {};
    next();
  });
  app.use("/api/admin", adminRouter);
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

describe("Admin Routes", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("GET /api/admin/account-managers", () => {
    it("returns all katalyst admins", async () => {
      (storage.getKatalystAdmins as any).mockResolvedValue([
        { id: "a1", email: "admin1@katgroupinc.com", displayName: "Admin 1", profileImageUrl: null },
      ]);
      const app = createApp(adminUser);
      const res = await request(app).get("/api/admin/account-managers");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it("returns 403 for non-admin", async () => {
      const app = createApp({ ...adminUser, role: "franchisee" });
      const res = await request(app).get("/api/admin/account-managers");
      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/admin/impersonate/:userId", () => {
    it("starts impersonation of franchisee", async () => {
      (storage.getUser as any).mockResolvedValue({
        id: "f1",
        role: "franchisee",
        brandId: "b1",
        displayName: "Franchisee",
        email: "f@test.com",
      });
      const app = createApp(adminUser);
      const res = await request(app).post("/api/admin/impersonate/f1");
      expect(res.status).toBe(200);
      expect(res.body.active).toBe(true);
      expect(res.body.targetUser.id).toBe("f1");
      expect(res.body.readOnly).toBe(true);
    });

    it("returns 404 for non-existent user", async () => {
      (storage.getUser as any).mockResolvedValue(undefined);
      const app = createApp(adminUser);
      const res = await request(app).post("/api/admin/impersonate/nonexistent");
      expect(res.status).toBe(404);
    });

    it("returns 400 for non-franchisee target", async () => {
      (storage.getUser as any).mockResolvedValue({
        id: "fr1",
        role: "franchisor",
        brandId: "b1",
      });
      const app = createApp(adminUser);
      const res = await request(app).post("/api/admin/impersonate/fr1");
      expect(res.status).toBe(400);
      expect(res.body.message).toContain("franchisee");
    });

    it("returns 403 for non-admin", async () => {
      const app = createApp({ ...adminUser, role: "franchisee" });
      const res = await request(app).post("/api/admin/impersonate/f1");
      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/admin/impersonate/stop", () => {
    it("stops impersonation and returns brand context", async () => {
      const app = createApp(adminUser);
      app.use((req: any, _res: any, next: any) => {
        req.session.return_brand_id = "b1";
        next();
      });

      const res = await request(app).post("/api/admin/impersonate/stop");
      expect(res.status).toBe(200);
      expect(res.body.active).toBe(false);
    });
  });

  describe("GET /api/admin/impersonate/status", () => {
    it("returns active: false when not impersonating", async () => {
      const app = createApp(adminUser);
      const res = await request(app).get("/api/admin/impersonate/status");
      expect(res.status).toBe(200);
      expect(res.body.active).toBe(false);
    });
  });

  describe("POST /api/admin/demo/franchisee/:brandId", () => {
    const brand = { id: "b1", name: "PostNet", slug: "postnet", displayName: "PostNet Franchise" };
    const demoUser = { id: "d1", email: "demo-franchisee@postnet.katalyst.internal", role: "franchisee", brandId: "b1", displayName: "PostNet Demo Franchisee", isDemo: true };

    it("enters demo mode for an existing brand (creates demo user on first entry)", async () => {
      (storage.getBrand as any).mockResolvedValue(brand);
      (storage.getDemoUserForBrand as any).mockResolvedValue(undefined);
      (storage.createDemoUser as any).mockResolvedValue(demoUser);
      (storage.getPlansByUser as any).mockResolvedValue([]);
      (storage.createDemoPlan as any).mockResolvedValue({ id: "p1" });

      const app = createApp(adminUser);
      const res = await request(app).post("/api/admin/demo/franchisee/b1");
      expect(res.status).toBe(200);
      expect(res.body.active).toBe(true);
      expect(res.body.brandId).toBe("b1");
      expect(res.body.brandName).toBe("PostNet Franchise");
      expect(res.body.demoUserId).toBe("d1");
      expect(storage.createDemoUser).toHaveBeenCalledWith("b1", "PostNet", "postnet");
      expect(storage.createDemoPlan).toHaveBeenCalled();
    });

    it("reuses existing demo user and plan on subsequent entries", async () => {
      (storage.getBrand as any).mockResolvedValue(brand);
      (storage.getDemoUserForBrand as any).mockResolvedValue(demoUser);
      (storage.getPlansByUser as any).mockResolvedValue([{ id: "p1" }]);

      const app = createApp(adminUser);
      const res = await request(app).post("/api/admin/demo/franchisee/b1");
      expect(res.status).toBe(200);
      expect(res.body.active).toBe(true);
      expect(storage.createDemoUser).not.toHaveBeenCalled();
      expect(storage.createDemoPlan).not.toHaveBeenCalled();
    });

    it("returns 404 for non-existent brand", async () => {
      (storage.getBrand as any).mockResolvedValue(undefined);
      const app = createApp(adminUser);
      const res = await request(app).post("/api/admin/demo/franchisee/nonexistent");
      expect(res.status).toBe(404);
    });

    it("returns 403 for non-admin", async () => {
      const app = createApp({ ...adminUser, role: "franchisee" });
      const res = await request(app).post("/api/admin/demo/franchisee/b1");
      expect(res.status).toBe(403);
    });

    it("auto-stops impersonation when entering demo mode", async () => {
      (storage.getBrand as any).mockResolvedValue(brand);
      (storage.getDemoUserForBrand as any).mockResolvedValue(demoUser);
      (storage.getPlansByUser as any).mockResolvedValue([{ id: "p1" }]);

      const app = express();
      app.use(express.json());
      app.use((req: any, _res: any, next: any) => {
        req.user = adminUser;
        req.isAuthenticated = () => true;
        req.session = {
          impersonating_user_id: "f1",
          impersonation_started_at: new Date().toISOString(),
        };
        next();
      });
      app.use("/api/admin", adminRouter);

      const res = await request(app).post("/api/admin/demo/franchisee/b1");
      expect(res.status).toBe(200);
      expect(res.body.active).toBe(true);
    });
  });

  describe("POST /api/admin/demo/exit", () => {
    it("exits demo mode", async () => {
      const app = express();
      app.use(express.json());
      app.use((req: any, _res: any, next: any) => {
        req.user = adminUser;
        req.isAuthenticated = () => true;
        req.session = {
          demo_mode_brand_id: "b1",
          demo_mode_user_id: "d1",
        };
        next();
      });
      app.use("/api/admin", adminRouter);

      const res = await request(app).post("/api/admin/demo/exit");
      expect(res.status).toBe(200);
      expect(res.body.active).toBe(false);
    });
  });

  describe("POST /api/admin/demo/reset/:brandId", () => {
    it("resets demo data to brand defaults", async () => {
      const brand = { id: "b1", name: "PostNet", displayName: "PostNet Franchise" };
      const demoUser = { id: "d1" };
      (storage.getBrand as any).mockResolvedValue(brand);
      (storage.getDemoUserForBrand as any).mockResolvedValue(demoUser);
      (storage.getPlansByUser as any).mockResolvedValue([{ id: "p1" }]);
      (storage.resetDemoPlan as any).mockResolvedValue({ id: "p1" });

      const app = createApp(adminUser);
      const res = await request(app).post("/api/admin/demo/reset/b1");
      expect(res.status).toBe(200);
      expect(res.body.message).toContain("PostNet Franchise");
      expect(storage.resetDemoPlan).toHaveBeenCalledWith("p1", "b1");
    });

    it("returns 404 when no demo account exists", async () => {
      (storage.getBrand as any).mockResolvedValue({ id: "b1", name: "PostNet" });
      (storage.getDemoUserForBrand as any).mockResolvedValue(undefined);

      const app = createApp(adminUser);
      const res = await request(app).post("/api/admin/demo/reset/b1");
      expect(res.status).toBe(404);
    });

    it("creates plan if none exists during reset", async () => {
      const brand = { id: "b1", name: "PostNet", displayName: "PostNet Franchise" };
      const demoUser = { id: "d1" };
      (storage.getBrand as any).mockResolvedValue(brand);
      (storage.getDemoUserForBrand as any).mockResolvedValue(demoUser);
      (storage.getPlansByUser as any).mockResolvedValue([]);
      (storage.createDemoPlan as any).mockResolvedValue({ id: "p2" });

      const app = createApp(adminUser);
      const res = await request(app).post("/api/admin/demo/reset/b1");
      expect(res.status).toBe(200);
      expect(storage.createDemoPlan).toHaveBeenCalledWith("d1", "b1", brand);
    });
  });

  describe("GET /api/admin/demo/status", () => {
    it("returns active: false when not in demo mode", async () => {
      const app = createApp(adminUser);
      const res = await request(app).get("/api/admin/demo/status");
      expect(res.status).toBe(200);
      expect(res.body.active).toBe(false);
    });

    it("returns active status with brand info when in demo mode", async () => {
      const brand = { id: "b1", name: "PostNet", displayName: "PostNet Franchise" };
      (storage.getBrand as any).mockResolvedValue(brand);
      (storage.getUser as any).mockResolvedValue({ id: "d1" });

      const app = express();
      app.use(express.json());
      app.use((req: any, _res: any, next: any) => {
        req.user = adminUser;
        req.isAuthenticated = () => true;
        req.session = {
          demo_mode_brand_id: "b1",
          demo_mode_user_id: "d1",
        };
        next();
      });
      app.use("/api/admin", adminRouter);

      const res = await request(app).get("/api/admin/demo/status");
      expect(res.status).toBe(200);
      expect(res.body.active).toBe(true);
      expect(res.body.brandName).toBe("PostNet Franchise");
      expect(res.body.demoUserId).toBe("d1");
    });

    it("clears session and returns inactive if brand no longer exists", async () => {
      (storage.getBrand as any).mockResolvedValue(undefined);

      const app = express();
      app.use(express.json());
      app.use((req: any, _res: any, next: any) => {
        req.user = adminUser;
        req.isAuthenticated = () => true;
        req.session = {
          demo_mode_brand_id: "b1",
          demo_mode_user_id: "d1",
        };
        next();
      });
      app.use("/api/admin", adminRouter);

      const res = await request(app).get("/api/admin/demo/status");
      expect(res.status).toBe(200);
      expect(res.body.active).toBe(false);
    });
  });
});
