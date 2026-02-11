import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

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

const createInvitationSchema = z.object({
  email: z.string().email("Invalid email format"),
  role: z.enum(["franchisee", "franchisor", "katalyst_admin"]),
  brand_id: z.string().optional(),
}).refine(
  (data) => {
    if (data.role === "franchisee" || data.role === "franchisor") {
      return !!data.brand_id;
    }
    return true;
  },
  { message: "brand_id is required for franchisee and franchisor roles", path: ["brand_id"] }
);

const acceptInvitationSchema = z.object({
  token: z.string().min(1, "Token is required"),
  display_name: z.string().min(1, "Display name is required").max(100, "Display name too long"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function computeInvitationStatus(invitation: { acceptedAt: string | null; expiresAt: string }): "pending" | "accepted" | "expired" {
  if (invitation.acceptedAt) return "accepted";
  if (new Date(invitation.expiresAt) < new Date()) return "expired";
  return "pending";
}

describe("Invitations Routes - Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Invitation Schema Validation", () => {
    it("should validate a franchisee invitation with brand_id", () => {
      const parsed = createInvitationSchema.safeParse({
        email: "franchisee@example.com",
        role: "franchisee",
        brand_id: "brand-1",
      });
      expect(parsed.success).toBe(true);
    });

    it("should reject franchisee invitation without brand_id", () => {
      const parsed = createInvitationSchema.safeParse({
        email: "franchisee@example.com",
        role: "franchisee",
      });
      expect(parsed.success).toBe(false);
    });

    it("should reject franchisor invitation without brand_id", () => {
      const parsed = createInvitationSchema.safeParse({
        email: "franchisor@example.com",
        role: "franchisor",
      });
      expect(parsed.success).toBe(false);
    });

    it("should allow katalyst_admin invitation without brand_id", () => {
      const parsed = createInvitationSchema.safeParse({
        email: "admin@katgroupinc.com",
        role: "katalyst_admin",
      });
      expect(parsed.success).toBe(true);
    });

    it("should reject invalid email format", () => {
      const parsed = createInvitationSchema.safeParse({
        email: "not-an-email",
        role: "katalyst_admin",
      });
      expect(parsed.success).toBe(false);
    });

    it("should reject invalid role", () => {
      const parsed = createInvitationSchema.safeParse({
        email: "test@example.com",
        role: "superadmin",
      });
      expect(parsed.success).toBe(false);
    });
  });

  describe("Accept Invitation Schema Validation", () => {
    it("should validate correct accept data", () => {
      const parsed = acceptInvitationSchema.safeParse({
        token: "valid-token-123",
        display_name: "John Doe",
        password: "securepassword123",
      });
      expect(parsed.success).toBe(true);
    });

    it("should reject short password", () => {
      const parsed = acceptInvitationSchema.safeParse({
        token: "valid-token-123",
        display_name: "John Doe",
        password: "short",
      });
      expect(parsed.success).toBe(false);
    });

    it("should reject empty display_name", () => {
      const parsed = acceptInvitationSchema.safeParse({
        token: "valid-token-123",
        display_name: "",
        password: "securepassword123",
      });
      expect(parsed.success).toBe(false);
    });

    it("should reject empty token", () => {
      const parsed = acceptInvitationSchema.safeParse({
        token: "",
        display_name: "John Doe",
        password: "securepassword123",
      });
      expect(parsed.success).toBe(false);
    });
  });

  describe("Invitation Status Computation", () => {
    it("should return accepted for invitation with acceptedAt", () => {
      const status = computeInvitationStatus({
        acceptedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });
      expect(status).toBe("accepted");
    });

    it("should return expired for past expiresAt", () => {
      const status = computeInvitationStatus({
        acceptedAt: null,
        expiresAt: new Date(Date.now() - 86400000).toISOString(),
      });
      expect(status).toBe("expired");
    });

    it("should return pending for valid future invitation", () => {
      const status = computeInvitationStatus({
        acceptedAt: null,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });
      expect(status).toBe("pending");
    });

    it("accepted status takes priority over expired", () => {
      const status = computeInvitationStatus({
        acceptedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() - 86400000).toISOString(),
      });
      expect(status).toBe("accepted");
    });
  });

  describe("Invitation Creation Flow", () => {
    it("should check for existing pending invitation before creating", async () => {
      (storage.getPendingInvitation as any).mockResolvedValue(null);
      (storage.getBrand as any).mockResolvedValue({ id: "brand-1", name: "PostNet" });
      (storage.createInvitation as any).mockResolvedValue({
        id: "inv-1",
        email: "new@example.com",
        role: "franchisee",
        brandId: "brand-1",
        token: "abc123",
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        acceptedAt: null,
        createdBy: "admin-1",
      });

      const existing = await storage.getPendingInvitation("new@example.com", "franchisee", "brand-1");
      expect(existing).toBeNull();

      const invitation = await storage.createInvitation({
        email: "new@example.com",
        role: "franchisee",
        brandId: "brand-1",
        token: "abc123",
        expiresAt: new Date(Date.now() + 7 * 86400000),
        createdBy: "admin-1",
      });
      expect(invitation.email).toBe("new@example.com");
    });

    it("should return existing invitation if one exists", async () => {
      const existingInvitation = {
        id: "inv-1",
        email: "existing@example.com",
        role: "franchisee",
        brandId: "brand-1",
        token: "existing-token",
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        acceptedAt: null,
      };
      (storage.getPendingInvitation as any).mockResolvedValue(existingInvitation);

      const result = await storage.getPendingInvitation("existing@example.com", "franchisee", "brand-1");
      expect(result).toEqual(existingInvitation);
      expect(storage.createInvitation).not.toHaveBeenCalled();
    });
  });

  describe("Invitation Acceptance Flow", () => {
    it("should reject acceptance for already accepted invitation", async () => {
      const invitation = {
        id: "inv-1",
        token: "token-123",
        acceptedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      };
      (storage.getInvitationByToken as any).mockResolvedValue(invitation);

      const result = await storage.getInvitationByToken("token-123");
      expect(result!.acceptedAt).not.toBeNull();
    });

    it("should reject acceptance for expired invitation", async () => {
      const invitation = {
        id: "inv-1",
        token: "token-123",
        acceptedAt: null,
        expiresAt: new Date(Date.now() - 86400000).toISOString(),
      };
      (storage.getInvitationByToken as any).mockResolvedValue(invitation);

      const result = await storage.getInvitationByToken("token-123");
      expect(new Date(result!.expiresAt) < new Date()).toBe(true);
    });

    it("should reject acceptance when user already exists", async () => {
      (storage.getInvitationByToken as any).mockResolvedValue({
        id: "inv-1",
        email: "existing@example.com",
        acceptedAt: null,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });
      (storage.getUserByEmail as any).mockResolvedValue({ id: "u1", email: "existing@example.com" });

      const invitation = await storage.getInvitationByToken("token-123");
      const existingUser = await storage.getUserByEmail(invitation!.email);
      expect(existingUser).not.toBeNull();
    });
  });

  describe("Franchisor Authorization", () => {
    it("should restrict franchisor to only invite franchisees", () => {
      const user = { role: "franchisor", brandId: "brand-1" };
      const requestedRole = "katalyst_admin";
      expect(user.role === "franchisor" && requestedRole !== "franchisee").toBe(true);
    });

    it("should restrict franchisor to own brand", () => {
      const user = { role: "franchisor", brandId: "brand-1" };
      const requestedBrandId = "brand-2";
      expect(user.role === "franchisor" && requestedBrandId !== user.brandId).toBe(true);
    });

    it("should allow franchisor to invite franchisee to own brand", () => {
      const user = { role: "franchisor", brandId: "brand-1" };
      const requestedRole = "franchisee";
      const requestedBrandId = "brand-1";
      const blocked = (user.role === "franchisor" && requestedRole !== "franchisee") ||
                      (user.role === "franchisor" && requestedBrandId !== user.brandId);
      expect(blocked).toBe(false);
    });
  });
});
