import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import session from "express-session";
import request from "supertest";

vi.mock("../storage", () => ({
  storage: {
    upsertUserFromGoogle: vi.fn(),
    getUserByEmail: vi.fn(),
    getUser: vi.fn(),
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
