import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import session from "express-session";
import request from "supertest";

vi.mock("../storage", () => ({
  storage: {
    upsertUserFromGoogle: vi.fn(),
    getUserByEmail: vi.fn(),
    getUser: vi.fn(),
    getBrands: vi.fn(),
    getBrand: vi.fn(),
    upsertDevUser: vi.fn(),
    getPlansByUser: vi.fn(),
    createDemoPlan: vi.fn(),
  },
}));

vi.mock("../auth", () => {
  const realPassport = require("passport");
  realPassport.serializeUser((user: any, done: any) => done(null, user.id));
  realPassport.deserializeUser((id: string, done: any) => done(null, { id }));
  return { default: realPassport };
});

import { storage } from "../storage";
import authRouter from "./auth";

function createApp(authenticatedUser?: Express.User) {
  const app = express();
  app.use(express.json());
  app.use(session({ secret: "test", resave: false, saveUninitialized: false }));

  const passport = require("passport");
  app.use(passport.initialize());
  app.use(passport.session());

  if (authenticatedUser) {
    app.use((req: any, _res: any, next: any) => {
      req.user = authenticatedUser;
      req.isAuthenticated = () => true;
      next();
    });
  }

  app.use("/api/auth", authRouter);
  return app;
}

const adminUser: Express.User = {
  id: "u1",
  email: "dev@katgroupinc.com",
  role: "katalyst_admin",
  brandId: null,
  displayName: "Dev Admin",
  profileImageUrl: null,
  onboardingCompleted: true,
  preferredTier: null,
};

describe("Auth Routes", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("GET /api/auth/me", () => {
    it("returns 401 when not authenticated", async () => {
      const app = createApp();
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Not authenticated");
    });

    it("returns user when authenticated", async () => {
      const app = createApp(adminUser);
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(200);
      expect(res.body.id).toBe("u1");
      expect(res.body.email).toBe("dev@katgroupinc.com");
      expect(res.body.role).toBe("katalyst_admin");
    });
  });

  describe("GET /api/auth/dev-enabled", () => {
    it("returns devMode: true when Google OAuth not configured", async () => {
      const app = createApp();
      const res = await request(app).get("/api/auth/dev-enabled");
      expect(res.status).toBe(200);
      expect(res.body.devMode).toBe(true);
    });
  });

  describe("POST /api/auth/dev-login", () => {
    it("creates dev user and logs in when OAuth not configured", async () => {
      const mockUser = {
        id: "u1",
        email: "dev@katgroupinc.com",
        role: "katalyst_admin",
        brandId: null,
        displayName: "Dev Admin",
        profileImageUrl: null,
        onboardingCompleted: true,
        preferredTier: null,
        passwordHash: null,
      };
      (storage.upsertUserFromGoogle as any).mockResolvedValue(mockUser);

      const app = createApp();
      const res = await request(app).post("/api/auth/dev-login");

      expect(res.status).toBe(200);
      expect(res.body.email).toBe("dev@katgroupinc.com");
      expect(res.body.role).toBe("katalyst_admin");
      expect(storage.upsertUserFromGoogle).toHaveBeenCalledWith({
        email: "dev@katgroupinc.com",
        displayName: "Dev Admin",
        profileImageUrl: null,
      });
    });

    it("returns 500 when upsert fails", async () => {
      (storage.upsertUserFromGoogle as any).mockRejectedValue(new Error("DB error"));
      const app = createApp();
      const res = await request(app).post("/api/auth/dev-login");
      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Dev login failed");
    });
  });

  describe("GET /api/auth/dev-brands", () => {
    it("returns sorted brands when dev mode is enabled", async () => {
      (storage as any).getBrands.mockResolvedValue([
        { id: "b2", name: "zebra-brand", displayName: "Zebra Brand", slug: "zebra" },
        { id: "b1", name: "alpha-brand", displayName: "Alpha Brand", slug: "alpha" },
      ]);

      const app = createApp();
      const res = await request(app).get("/api/auth/dev-brands");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].name).toBe("alpha-brand");
      expect(res.body[1].name).toBe("zebra-brand");
    });

    it("returns empty array when no brands exist", async () => {
      (storage as any).getBrands.mockResolvedValue([]);

      const app = createApp();
      const res = await request(app).get("/api/auth/dev-brands");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe("POST /api/auth/dev-login (role-based)", () => {
    it("backward compat: empty body logs in as admin", async () => {
      const mockUser = {
        id: "u1",
        email: "dev@katgroupinc.com",
        role: "katalyst_admin",
        brandId: null,
        displayName: "Dev Admin",
        profileImageUrl: null,
        onboardingCompleted: true,
        preferredTier: null,
      };
      (storage.upsertUserFromGoogle as any).mockResolvedValue(mockUser);

      const app = createApp();
      const res = await request(app).post("/api/auth/dev-login").send({});
      expect(res.status).toBe(200);
      expect(res.body.role).toBe("katalyst_admin");
    });

    it("explicit admin role works without brandId", async () => {
      const mockUser = {
        id: "u1",
        email: "dev@katgroupinc.com",
        role: "katalyst_admin",
        brandId: null,
        displayName: "Dev Admin",
        profileImageUrl: null,
        onboardingCompleted: true,
        preferredTier: null,
      };
      (storage.upsertUserFromGoogle as any).mockResolvedValue(mockUser);

      const app = createApp();
      const res = await request(app).post("/api/auth/dev-login").send({ role: "katalyst_admin" });
      expect(res.status).toBe(200);
      expect(res.body.role).toBe("katalyst_admin");
    });

    it("franchisee role requires brandId", async () => {
      const app = createApp();
      const res = await request(app).post("/api/auth/dev-login").send({ role: "franchisee" });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain("brandId is required");
    });

    it("franchisor role requires brandId", async () => {
      const app = createApp();
      const res = await request(app).post("/api/auth/dev-login").send({ role: "franchisor" });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain("brandId is required");
    });

    it("returns 404 for unknown brandId", async () => {
      (storage as any).getBrand.mockResolvedValue(undefined);

      const app = createApp();
      const res = await request(app).post("/api/auth/dev-login").send({ role: "franchisee", brandId: "nonexistent" });
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Brand not found");
    });

    it("franchisee login creates user and demo plan", async () => {
      const mockBrand = { id: "b1", name: "test-brand", slug: "test-brand", displayName: "Test Brand" };
      const mockUser = {
        id: "u2",
        email: "dev-franchisee-test-brand@katgroupinc.com",
        role: "franchisee",
        brandId: "b1",
        displayName: "Dev Franchisee (Test Brand)",
        profileImageUrl: null,
        onboardingCompleted: true,
        preferredTier: null,
      };
      (storage as any).getBrand.mockResolvedValue(mockBrand);
      (storage as any).upsertDevUser.mockResolvedValue(mockUser);
      (storage as any).getPlansByUser.mockResolvedValue([]);
      (storage as any).createDemoPlan.mockResolvedValue({});

      const app = createApp();
      const res = await request(app).post("/api/auth/dev-login").send({ role: "franchisee", brandId: "b1" });
      expect(res.status).toBe(200);
      expect(res.body.role).toBe("franchisee");
      expect(res.body.brandId).toBe("b1");
      expect((storage as any).createDemoPlan).toHaveBeenCalledWith("u2", "b1", mockBrand);
    });

    it("franchisee login skips demo plan if user already has plans", async () => {
      const mockBrand = { id: "b1", name: "test-brand", slug: "test-brand", displayName: "Test Brand" };
      const mockUser = {
        id: "u2",
        email: "dev-franchisee-test-brand@katgroupinc.com",
        role: "franchisee",
        brandId: "b1",
        displayName: "Dev Franchisee (Test Brand)",
        profileImageUrl: null,
        onboardingCompleted: true,
        preferredTier: null,
      };
      (storage as any).getBrand.mockResolvedValue(mockBrand);
      (storage as any).upsertDevUser.mockResolvedValue(mockUser);
      (storage as any).getPlansByUser.mockResolvedValue([{ id: "existing-plan" }]);

      const app = createApp();
      const res = await request(app).post("/api/auth/dev-login").send({ role: "franchisee", brandId: "b1" });
      expect(res.status).toBe(200);
      expect((storage as any).createDemoPlan).not.toHaveBeenCalled();
    });

    it("franchisor login does not create demo plan", async () => {
      const mockBrand = { id: "b1", name: "test-brand", slug: "test-brand", displayName: "Test Brand" };
      const mockUser = {
        id: "u3",
        email: "dev-franchisor-test-brand@katgroupinc.com",
        role: "franchisor",
        brandId: "b1",
        displayName: "Dev Franchisor (Test Brand)",
        profileImageUrl: null,
        onboardingCompleted: true,
        preferredTier: null,
      };
      (storage as any).getBrand.mockResolvedValue(mockBrand);
      (storage as any).upsertDevUser.mockResolvedValue(mockUser);

      const app = createApp();
      const res = await request(app).post("/api/auth/dev-login").send({ role: "franchisor", brandId: "b1" });
      expect(res.status).toBe(200);
      expect(res.body.role).toBe("franchisor");
      expect((storage as any).createDemoPlan).not.toHaveBeenCalled();
    });

    it("rejects invalid role", async () => {
      const app = createApp();
      const res = await request(app).post("/api/auth/dev-login").send({ role: "superadmin" });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("logs out and destroys session", async () => {
      const app = createApp(adminUser);
      app.use((req: any, _res: any, next: any) => {
        req.logout = (cb: any) => cb(null);
        req.session.destroy = (cb: any) => cb(null);
        next();
      });

      const res = await request(app).post("/api/auth/logout");
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Logged out");
    });
  });
});
