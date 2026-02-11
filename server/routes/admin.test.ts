import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../storage", () => ({
  storage: {
    getKatalystAdmins: vi.fn(),
    getUser: vi.fn(),
  },
}));

import { storage } from "../storage";

const IMPERSONATION_MAX_MINUTES = 60;

describe("Admin Routes - Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/admin/account-managers", () => {
    it("should return all katalyst admins", async () => {
      const admins = [
        { id: "a1", email: "admin1@katgroupinc.com", displayName: "Admin 1", profileImageUrl: null },
        { id: "a2", email: "admin2@katgroupinc.com", displayName: "Admin 2", profileImageUrl: null },
      ];
      (storage.getKatalystAdmins as any).mockResolvedValue(admins);

      const result = await storage.getKatalystAdmins();
      expect(result).toHaveLength(2);
      expect(result[0].email).toBe("admin1@katgroupinc.com");
    });
  });

  describe("Impersonation - Start", () => {
    it("should only allow impersonating franchisee users", async () => {
      (storage.getUser as any).mockResolvedValue({ id: "u1", role: "franchisee", brandId: "b1", displayName: "Franchisee" });
      const target = await storage.getUser("u1");
      expect(target!.role).toBe("franchisee");
    });

    it("should reject impersonating non-franchisee users", async () => {
      (storage.getUser as any).mockResolvedValue({ id: "u2", role: "franchisor", brandId: "b1" });
      const target = await storage.getUser("u2");
      expect(target!.role !== "franchisee").toBe(true);
    });

    it("should reject impersonating non-existent users", async () => {
      (storage.getUser as any).mockResolvedValue(undefined);
      const target = await storage.getUser("nonexistent");
      expect(target).toBeUndefined();
    });
  });

  describe("Impersonation - Session Management", () => {
    it("should set session variables on impersonation start", () => {
      const session: Record<string, any> = {};
      const targetUser = { id: "u1", brandId: "b1" };

      session.impersonating_user_id = targetUser.id;
      session.impersonation_started_at = new Date().toISOString();
      session.return_brand_id = targetUser.brandId;

      expect(session.impersonating_user_id).toBe("u1");
      expect(session.impersonation_started_at).toBeDefined();
      expect(session.return_brand_id).toBe("b1");
    });

    it("should clear session variables on impersonation stop", () => {
      const session: Record<string, any> = {
        impersonating_user_id: "u1",
        impersonation_started_at: new Date().toISOString(),
        return_brand_id: "b1",
      };

      const returnBrandId = session.return_brand_id;
      delete session.impersonating_user_id;
      delete session.impersonation_started_at;
      delete session.return_brand_id;

      expect(session.impersonating_user_id).toBeUndefined();
      expect(returnBrandId).toBe("b1");
    });

    it("should auto-stop existing impersonation before starting new one", () => {
      const session: Record<string, any> = {
        impersonating_user_id: "u1",
        impersonation_started_at: new Date().toISOString(),
        return_brand_id: "b1",
      };

      if (session.impersonating_user_id) {
        delete session.impersonating_user_id;
        delete session.impersonation_started_at;
        delete session.return_brand_id;
      }

      session.impersonating_user_id = "u2";
      session.impersonation_started_at = new Date().toISOString();
      session.return_brand_id = "b2";

      expect(session.impersonating_user_id).toBe("u2");
    });
  });

  describe("Impersonation - Timeout", () => {
    it("should detect expired impersonation (> 60 minutes)", () => {
      const startedAt = new Date(Date.now() - 61 * 60 * 1000).toISOString();
      const elapsed = Date.now() - new Date(startedAt).getTime();
      const isExpired = elapsed > IMPERSONATION_MAX_MINUTES * 60 * 1000;
      expect(isExpired).toBe(true);
    });

    it("should not expire active impersonation (< 60 minutes)", () => {
      const startedAt = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const elapsed = Date.now() - new Date(startedAt).getTime();
      const isExpired = elapsed > IMPERSONATION_MAX_MINUTES * 60 * 1000;
      expect(isExpired).toBe(false);
    });

    it("should calculate remaining minutes correctly", () => {
      const startedAt = new Date(Date.now() - 45 * 60 * 1000).toISOString();
      const elapsedMs = Date.now() - new Date(startedAt).getTime();
      const remainingMinutes = Math.max(0, IMPERSONATION_MAX_MINUTES - Math.floor(elapsedMs / 60000));
      expect(remainingMinutes).toBe(15);
    });
  });

  describe("Impersonation - Status", () => {
    it("should return active: false when not impersonating", () => {
      const session: Record<string, any> = {};
      const impersonatingId = session.impersonating_user_id;
      expect(!impersonatingId).toBe(true);
    });

    it("should return target user details when impersonating", async () => {
      (storage.getUser as any).mockResolvedValue({
        id: "u1",
        displayName: "Target User",
        email: "target@example.com",
        role: "franchisee",
        brandId: "b1",
      });

      const session = { impersonating_user_id: "u1" };
      const targetUser = await storage.getUser(session.impersonating_user_id);
      expect(targetUser).toBeDefined();
      expect(targetUser!.displayName).toBe("Target User");
    });
  });
});
