import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../storage", () => ({
  storage: {
    getKatalystAdmins: vi.fn(),
    getUser: vi.fn(),
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
});
