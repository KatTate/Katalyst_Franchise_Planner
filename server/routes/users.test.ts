import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../storage", () => ({
  storage: {
    getUser: vi.fn(),
    assignAccountManager: vi.fn(),
  },
}));

import { storage } from "../storage";
import usersRouter from "./users";

function createApp(user?: Express.User) {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res: any, next: any) => {
    if (user) {
      req.user = user;
      req.isAuthenticated = () => true;
    }
    next();
  });
  app.use("/api/users", usersRouter);
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

const franchiseeUser: Express.User = {
  id: "f1",
  email: "franchisee@example.com",
  role: "franchisee",
  brandId: "b1",
  displayName: "Franchisee",
  profileImageUrl: null,
  onboardingCompleted: true,
  preferredTier: null,
};

describe("Users Routes", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("PUT /api/users/:userId/account-manager", () => {
    const validBody = {
      account_manager_id: "a1",
      booking_url: "https://calendly.com/admin",
    };

    it("assigns account manager to franchisee", async () => {
      (storage.getUser as any)
        .mockResolvedValueOnce({ id: "f1", role: "franchisee" })
        .mockResolvedValueOnce({ id: "a1", role: "katalyst_admin" });
      (storage.assignAccountManager as any).mockResolvedValue({
        id: "f1",
        email: "franchisee@example.com",
        displayName: "Franchisee",
        accountManagerId: "a1",
        bookingUrl: "https://calendly.com/admin",
      });

      const app = createApp(adminUser);
      const res = await request(app)
        .put("/api/users/f1/account-manager")
        .send(validBody);

      expect(res.status).toBe(200);
      expect(res.body.accountManagerId).toBe("a1");
      expect(res.body.bookingUrl).toBe("https://calendly.com/admin");
      expect(storage.assignAccountManager).toHaveBeenCalledWith(
        "f1",
        "a1",
        "https://calendly.com/admin",
      );
    });

    it("returns 401 for unauthenticated request", async () => {
      const app = express();
      app.use(express.json());
      app.use((req: any, _res: any, next: any) => {
        req.isAuthenticated = () => false;
        req.session = {};
        next();
      });
      app.use("/api/users", usersRouter);
      const res = await request(app)
        .put("/api/users/f1/account-manager")
        .send(validBody);
      expect(res.status).toBe(401);
    });

    it("returns 403 for non-admin user", async () => {
      const app = createApp(franchiseeUser);
      const res = await request(app)
        .put("/api/users/f1/account-manager")
        .send(validBody);
      expect(res.status).toBe(403);
    });

    it("returns 404 when target user not found", async () => {
      (storage.getUser as any).mockResolvedValueOnce(undefined);

      const app = createApp(adminUser);
      const res = await request(app)
        .put("/api/users/unknown/account-manager")
        .send(validBody);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("User not found");
    });

    it("returns 400 when target user is not a franchisee", async () => {
      (storage.getUser as any).mockResolvedValueOnce({
        id: "a2",
        role: "katalyst_admin",
      });

      const app = createApp(adminUser);
      const res = await request(app)
        .put("/api/users/a2/account-manager")
        .send(validBody);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("franchisees");
    });

    it("returns 400 for invalid body (missing fields)", async () => {
      (storage.getUser as any).mockResolvedValueOnce({
        id: "f1",
        role: "franchisee",
      });

      const app = createApp(adminUser);
      const res = await request(app)
        .put("/api/users/f1/account-manager")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
    });

    it("returns 400 for invalid booking URL", async () => {
      (storage.getUser as any).mockResolvedValueOnce({
        id: "f1",
        role: "franchisee",
      });

      const app = createApp(adminUser);
      const res = await request(app)
        .put("/api/users/f1/account-manager")
        .send({ account_manager_id: "a1", booking_url: "not-a-url" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
    });

    it("returns 404 when account manager not found", async () => {
      (storage.getUser as any)
        .mockResolvedValueOnce({ id: "f1", role: "franchisee" })
        .mockResolvedValueOnce(undefined);

      const app = createApp(adminUser);
      const res = await request(app)
        .put("/api/users/f1/account-manager")
        .send(validBody);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Account manager not found");
    });
  });
});
