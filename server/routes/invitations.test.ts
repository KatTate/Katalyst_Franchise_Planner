import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../storage", () => ({
  storage: {
    getPendingInvitation: vi.fn(),
    createInvitation: vi.fn(),
    getInvitations: vi.fn(),
    getInvitationsByBrand: vi.fn(),
    getInvitationByToken: vi.fn(),
    getBrand: vi.fn(),
    getUserByEmail: vi.fn(),
    createUser: vi.fn(),
    markInvitationAccepted: vi.fn(),
    getBrandAccountManager: vi.fn(),
  },
}));

import { storage } from "../storage";
import invitationsRouter from "./invitations";

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
    req.login = (u: any, cb: any) => {
      req.user = u;
      cb(null);
    };
    next();
  });
  app.use("/api/invitations", invitationsRouter);
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

describe("Invitations Routes", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("POST /api/invitations", () => {
    it("returns 401 when not authenticated", async () => {
      const app = createApp();
      const res = await request(app).post("/api/invitations").send({
        email: "new@test.com",
        role: "franchisee",
        brand_id: "b1",
      });
      expect(res.status).toBe(401);
    });

    it("creates invitation as admin", async () => {
      (storage.getPendingInvitation as any).mockResolvedValue(null);
      (storage.getBrand as any).mockResolvedValue({ id: "b1", name: "PostNet" });
      (storage.createInvitation as any).mockResolvedValue({
        id: "inv-1",
        email: "new@test.com",
        role: "franchisee",
        brandId: "b1",
        token: "token-123",
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        acceptedAt: null,
        createdBy: "a1",
      });

      const app = createApp(adminUser);
      const res = await request(app).post("/api/invitations").send({
        email: "new@test.com",
        role: "franchisee",
        brand_id: "b1",
      });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe("new@test.com");
      expect(res.body.acceptUrl).toBeDefined();
    });

    it("returns 400 for franchisee without brand_id", async () => {
      const app = createApp(adminUser);
      const res = await request(app).post("/api/invitations").send({
        email: "new@test.com",
        role: "franchisee",
      });
      expect(res.status).toBe(400);
    });

    it("returns 400 for invalid email", async () => {
      const app = createApp(adminUser);
      const res = await request(app).post("/api/invitations").send({
        email: "not-email",
        role: "katalyst_admin",
      });
      expect(res.status).toBe(400);
    });

    it("restricts franchisor to only invite franchisees", async () => {
      const app = createApp(franchisorUser);
      const res = await request(app).post("/api/invitations").send({
        email: "new@test.com",
        role: "katalyst_admin",
      });
      expect(res.status).toBe(403);
      expect(res.body.message).toContain("Franchisor");
    });

    it("restricts franchisor to own brand", async () => {
      const app = createApp(franchisorUser);
      const res = await request(app).post("/api/invitations").send({
        email: "new@test.com",
        role: "franchisee",
        brand_id: "other-brand",
      });
      expect(res.status).toBe(403);
    });

    it("returns existing invitation instead of creating duplicate", async () => {
      const existing = {
        id: "inv-1",
        email: "existing@test.com",
        role: "franchisee",
        brandId: "b1",
        token: "existing-token",
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        acceptedAt: null,
      };
      (storage.getPendingInvitation as any).mockResolvedValue(existing);

      const app = createApp(adminUser);
      const res = await request(app).post("/api/invitations").send({
        email: "existing@test.com",
        role: "franchisee",
        brand_id: "b1",
      });

      expect(res.status).toBe(200);
      expect(storage.createInvitation).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/invitations", () => {
    it("returns all invitations for admin", async () => {
      (storage.getInvitations as any).mockResolvedValue([
        { id: "i1", email: "a@test.com", acceptedAt: null, expiresAt: new Date(Date.now() + 86400000).toISOString() },
      ]);
      const app = createApp(adminUser);
      const res = await request(app).get("/api/invitations");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].status).toBe("pending");
    });

    it("returns brand-scoped invitations for franchisor", async () => {
      (storage.getInvitationsByBrand as any).mockResolvedValue([]);
      const app = createApp(franchisorUser);
      const res = await request(app).get("/api/invitations");
      expect(res.status).toBe(200);
      expect(storage.getInvitationsByBrand).toHaveBeenCalledWith("b1");
    });
  });

  describe("GET /api/invitations/validate/:token", () => {
    it("returns invitation details for valid token", async () => {
      (storage.getInvitationByToken as any).mockResolvedValue({
        email: "invited@test.com",
        role: "franchisee",
        brandId: "b1",
        acceptedAt: null,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });
      (storage.getBrand as any).mockResolvedValue({ name: "PostNet" });

      const app = createApp();
      const res = await request(app).get("/api/invitations/validate/some-token");
      expect(res.status).toBe(200);
      expect(res.body.email).toBe("invited@test.com");
      expect(res.body.brandName).toBe("PostNet");
    });

    it("returns 404 for invalid token", async () => {
      (storage.getInvitationByToken as any).mockResolvedValue(null);
      const app = createApp();
      const res = await request(app).get("/api/invitations/validate/bad-token");
      expect(res.status).toBe(404);
    });

    it("returns 410 for already accepted invitation", async () => {
      (storage.getInvitationByToken as any).mockResolvedValue({
        acceptedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });
      const app = createApp();
      const res = await request(app).get("/api/invitations/validate/accepted-token");
      expect(res.status).toBe(410);
      expect(res.body.code).toBe("ALREADY_ACCEPTED");
    });

    it("returns 410 for expired invitation", async () => {
      (storage.getInvitationByToken as any).mockResolvedValue({
        acceptedAt: null,
        expiresAt: new Date(Date.now() - 86400000).toISOString(),
      });
      const app = createApp();
      const res = await request(app).get("/api/invitations/validate/expired-token");
      expect(res.status).toBe(410);
      expect(res.body.code).toBe("EXPIRED");
    });
  });

  describe("POST /api/invitations/accept", () => {
    it("returns 400 for short password", async () => {
      const app = createApp();
      const res = await request(app).post("/api/invitations/accept").send({
        token: "valid-token",
        display_name: "New User",
        password: "short",
      });
      expect(res.status).toBe(400);
    });

    it("returns 404 for non-existent invitation", async () => {
      (storage.getInvitationByToken as any).mockResolvedValue(null);
      const app = createApp();
      const res = await request(app).post("/api/invitations/accept").send({
        token: "nonexistent",
        display_name: "New User",
        password: "securepass123",
      });
      expect(res.status).toBe(404);
    });

    it("returns 409 when user already exists", async () => {
      (storage.getInvitationByToken as any).mockResolvedValue({
        id: "inv-1",
        email: "existing@test.com",
        role: "franchisee",
        brandId: "b1",
        acceptedAt: null,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });
      (storage.getUserByEmail as any).mockResolvedValue({ id: "u1", email: "existing@test.com" });

      const app = createApp();
      const res = await request(app).post("/api/invitations/accept").send({
        token: "valid-token",
        display_name: "New User",
        password: "securepass123",
      });
      expect(res.status).toBe(409);
      expect(res.body.code).toBe("USER_EXISTS");
    });

    it("creates user and accepts invitation", async () => {
      (storage.getInvitationByToken as any).mockResolvedValue({
        id: "inv-1",
        email: "new@test.com",
        role: "franchisee",
        brandId: "b1",
        acceptedAt: null,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });
      (storage.getUserByEmail as any).mockResolvedValue(null);
      (storage.getBrand as any).mockResolvedValue({ id: "b1", defaultAccountManagerId: null });
      (storage.createUser as any).mockResolvedValue({
        id: "new-user-1",
        email: "new@test.com",
        role: "franchisee",
        brandId: "b1",
        displayName: "New User",
        profileImageUrl: null,
        onboardingCompleted: false,
        preferredTier: null,
      });
      (storage.markInvitationAccepted as any).mockResolvedValue(undefined);

      const app = createApp();
      const res = await request(app).post("/api/invitations/accept").send({
        token: "valid-token",
        display_name: "New User",
        password: "securepass123",
      });
      expect(res.status).toBe(201);
      expect(res.body.email).toBe("new@test.com");
      expect(storage.createUser).toHaveBeenCalled();
      expect(storage.markInvitationAccepted).toHaveBeenCalledWith("inv-1");
    });
  });
});
