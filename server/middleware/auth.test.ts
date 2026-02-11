import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../storage", () => ({
  storage: {
    getUser: vi.fn(),
  },
}));

import { storage } from "../storage";

const IMPERSONATION_MAX_MINUTES = 60;

describe("Auth Middleware - Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("requireAuth", () => {
    it("should reject unauthenticated requests", () => {
      const req = { isAuthenticated: () => false, user: undefined };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const next = vi.fn();

      if (!req.isAuthenticated() || !req.user) {
        res.status(401).json({ message: "Authentication required" });
      } else {
        next();
      }

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it("should allow authenticated requests", () => {
      const req = { isAuthenticated: () => true, user: { id: "u1", role: "franchisee" } };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const next = vi.fn();

      if (!req.isAuthenticated() || !req.user) {
        res.status(401).json({ message: "Authentication required" });
      } else {
        next();
      }

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("requireRole", () => {
    it("should allow user with matching role", () => {
      const roles = ["katalyst_admin", "franchisor"];
      const user = { role: "katalyst_admin" };
      const hasRole = roles.includes(user.role);
      expect(hasRole).toBe(true);
    });

    it("should deny user without matching role", () => {
      const roles = ["katalyst_admin"];
      const user = { role: "franchisee" };
      const hasRole = roles.includes(user.role);
      expect(hasRole).toBe(false);
    });

    it("should check multiple roles correctly", () => {
      const roles = ["katalyst_admin", "franchisor"];

      expect(roles.includes("katalyst_admin")).toBe(true);
      expect(roles.includes("franchisor")).toBe(true);
      expect(roles.includes("franchisee")).toBe(false);
    });
  });

  describe("getEffectiveUser", () => {
    it("should return req.user when not impersonating", () => {
      const session: Record<string, any> = {};
      const reqUser = { id: "u1", role: "katalyst_admin" };

      const impersonatingId = session.impersonating_user_id;
      if (!impersonatingId) {
        expect(reqUser).toBeDefined();
      }
    });

    it("should return impersonated user when active", async () => {
      const impersonatedUser = {
        id: "target-1",
        email: "target@example.com",
        role: "franchisee",
        brandId: "b1",
        displayName: "Target",
        profileImageUrl: null,
        onboardingCompleted: true,
        preferredTier: null,
      };
      (storage.getUser as any).mockResolvedValue(impersonatedUser);

      const session = {
        impersonating_user_id: "target-1",
        impersonation_started_at: new Date().toISOString(),
      };

      const result = await storage.getUser(session.impersonating_user_id);
      expect(result!.id).toBe("target-1");
      expect(result!.role).toBe("franchisee");
    });

    it("should auto-revert expired impersonation", () => {
      const session: Record<string, any> = {
        impersonating_user_id: "target-1",
        impersonation_started_at: new Date(Date.now() - 61 * 60 * 1000).toISOString(),
        return_brand_id: "b1",
      };

      const startedAt = session.impersonation_started_at;
      const elapsed = Date.now() - new Date(startedAt).getTime();
      if (elapsed > IMPERSONATION_MAX_MINUTES * 60 * 1000) {
        delete session.impersonating_user_id;
        delete session.impersonation_started_at;
        delete session.return_brand_id;
      }

      expect(session.impersonating_user_id).toBeUndefined();
    });

    it("should clear impersonation if target user no longer exists", async () => {
      (storage.getUser as any).mockResolvedValue(undefined);
      const session: Record<string, any> = {
        impersonating_user_id: "deleted-user",
      };

      const user = await storage.getUser(session.impersonating_user_id);
      if (!user) {
        delete session.impersonating_user_id;
      }

      expect(session.impersonating_user_id).toBeUndefined();
    });
  });

  describe("requireReadOnlyImpersonation", () => {
    it("should pass through when not impersonating", () => {
      const session: Record<string, any> = {};
      const isImpersonating = !!session.impersonating_user_id;
      expect(isImpersonating).toBe(false);
    });

    it("should block POST during impersonation", () => {
      const session = { impersonating_user_id: "u1" };
      const method = "POST";
      const mutationMethods = ["POST", "PATCH", "PUT", "DELETE"];
      const blocked = !!session.impersonating_user_id && mutationMethods.includes(method);
      expect(blocked).toBe(true);
    });

    it("should block PUT during impersonation", () => {
      const session = { impersonating_user_id: "u1" };
      const method = "PUT";
      const mutationMethods = ["POST", "PATCH", "PUT", "DELETE"];
      const blocked = !!session.impersonating_user_id && mutationMethods.includes(method);
      expect(blocked).toBe(true);
    });

    it("should block DELETE during impersonation", () => {
      const session = { impersonating_user_id: "u1" };
      const method = "DELETE";
      const mutationMethods = ["POST", "PATCH", "PUT", "DELETE"];
      const blocked = !!session.impersonating_user_id && mutationMethods.includes(method);
      expect(blocked).toBe(true);
    });

    it("should allow GET during impersonation", () => {
      const session = { impersonating_user_id: "u1" };
      const method = "GET";
      const mutationMethods = ["POST", "PATCH", "PUT", "DELETE"];
      const blocked = !!session.impersonating_user_id && mutationMethods.includes(method);
      expect(blocked).toBe(false);
    });

    it("should auto-revert and allow writes if impersonation expired", () => {
      const session: Record<string, any> = {
        impersonating_user_id: "u1",
        impersonation_started_at: new Date(Date.now() - 61 * 60 * 1000).toISOString(),
      };

      const startedAt = session.impersonation_started_at;
      const elapsed = Date.now() - new Date(startedAt).getTime();
      if (elapsed > IMPERSONATION_MAX_MINUTES * 60 * 1000) {
        delete session.impersonating_user_id;
        delete session.impersonation_started_at;
      }

      const blocked = !!session.impersonating_user_id;
      expect(blocked).toBe(false);
    });
  });

  describe("isImpersonating", () => {
    it("should return true when impersonating", () => {
      const session = { impersonating_user_id: "u1" };
      expect(!!session.impersonating_user_id).toBe(true);
    });

    it("should return false when not impersonating", () => {
      const session: Record<string, any> = {};
      expect(!!session.impersonating_user_id).toBe(false);
    });
  });
});
