import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import {
  requireAuth,
  requireRole,
  getEffectiveUser,
  isImpersonating,
  requireReadOnlyImpersonation,
  IMPERSONATION_MAX_MINUTES,
} from "./auth";

vi.mock("../storage", () => ({
  storage: {
    getUser: vi.fn(),
  },
}));

import { storage } from "../storage";

function mockReq(overrides: Record<string, any> = {}): Request {
  return {
    isAuthenticated: () => true,
    user: { id: "u1", role: "katalyst_admin" },
    session: {},
    method: "GET",
    ...overrides,
  } as any;
}

function mockRes(): Response & { _status: number; _json: any } {
  const res: any = {
    _status: 0,
    _json: null,
    status(code: number) {
      res._status = code;
      return res;
    },
    json(body: any) {
      res._json = body;
      return res;
    },
  };
  return res;
}

describe("requireAuth middleware", () => {
  it("returns 401 when not authenticated", () => {
    const req = mockReq({ isAuthenticated: () => false, user: undefined });
    const res = mockRes();
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(res._status).toBe(401);
    expect(res._json).toEqual({ message: "Authentication required" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when user is missing", () => {
    const req = mockReq({ isAuthenticated: () => true, user: undefined });
    const res = mockRes();
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(res._status).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next when authenticated", () => {
    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res._status).toBe(0);
  });
});

describe("requireRole middleware", () => {
  it("allows user with matching role", () => {
    const middleware = requireRole("katalyst_admin");
    const req = mockReq({ user: { id: "u1", role: "katalyst_admin" } });
    const res = mockRes();
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("allows user when multiple roles specified", () => {
    const middleware = requireRole("katalyst_admin", "franchisor");
    const req = mockReq({ user: { id: "u1", role: "franchisor" } });
    const res = mockRes();
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("returns 403 when role does not match", () => {
    const middleware = requireRole("katalyst_admin");
    const req = mockReq({ user: { id: "u1", role: "franchisee" } });
    const res = mockRes();
    const next = vi.fn();

    middleware(req, res, next);

    expect(res._status).toBe(403);
    expect(res._json).toEqual({ message: "Insufficient permissions" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 when user is missing", () => {
    const middleware = requireRole("katalyst_admin");
    const req = mockReq({ user: undefined });
    const res = mockRes();
    const next = vi.fn();

    middleware(req, res, next);

    expect(res._status).toBe(403);
  });
});

describe("getEffectiveUser", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns req.user when not impersonating", async () => {
    const user = { id: "u1", role: "katalyst_admin" };
    const req = mockReq({ user, session: {} });

    const result = await getEffectiveUser(req);
    expect(result).toEqual(user);
  });

  it("throws when no user on request", async () => {
    const req = mockReq({ user: undefined });
    await expect(getEffectiveUser(req)).rejects.toThrow("getEffectiveUser called without authenticated user");
  });

  it("returns impersonated user when active", async () => {
    const impersonatedUser = {
      id: "target-1",
      email: "target@test.com",
      role: "franchisee",
      brandId: "b1",
      displayName: "Target",
      profileImageUrl: null,
      onboardingCompleted: true,
      preferredTier: null,
    };
    (storage.getUser as any).mockResolvedValue(impersonatedUser);

    const req = mockReq({
      user: { id: "admin1", role: "katalyst_admin" },
      session: {
        impersonating_user_id: "target-1",
        impersonation_started_at: new Date().toISOString(),
      },
    });

    const result = await getEffectiveUser(req);
    expect(result.id).toBe("target-1");
    expect(result.role).toBe("franchisee");
    expect(storage.getUser).toHaveBeenCalledWith("target-1");
  });

  it("auto-reverts expired impersonation and returns req.user", async () => {
    const req = mockReq({
      user: { id: "admin1", role: "katalyst_admin" },
      session: {
        impersonating_user_id: "target-1",
        impersonation_started_at: new Date(Date.now() - 61 * 60 * 1000).toISOString(),
        return_brand_id: "b1",
      },
    });

    const result = await getEffectiveUser(req);
    expect(result.id).toBe("admin1");
    expect(req.session.impersonating_user_id).toBeUndefined();
    expect(storage.getUser).not.toHaveBeenCalled();
  });

  it("clears impersonation when target user no longer exists", async () => {
    (storage.getUser as any).mockResolvedValue(undefined);
    const req = mockReq({
      user: { id: "admin1", role: "katalyst_admin" },
      session: {
        impersonating_user_id: "deleted-user",
        impersonation_started_at: new Date().toISOString(),
      },
    });

    const result = await getEffectiveUser(req);
    expect(result.id).toBe("admin1");
    expect(req.session.impersonating_user_id).toBeUndefined();
  });

  it("caches effective user on request object", async () => {
    const impersonatedUser = {
      id: "target-1",
      email: "target@test.com",
      role: "franchisee",
      brandId: "b1",
      displayName: "Target",
      profileImageUrl: null,
      onboardingCompleted: true,
      preferredTier: null,
    };
    (storage.getUser as any).mockResolvedValue(impersonatedUser);

    const req = mockReq({
      user: { id: "admin1", role: "katalyst_admin" },
      session: {
        impersonating_user_id: "target-1",
        impersonation_started_at: new Date().toISOString(),
      },
    });

    await getEffectiveUser(req);
    await getEffectiveUser(req);

    expect(storage.getUser).toHaveBeenCalledTimes(1);
  });
});

describe("isImpersonating", () => {
  it("returns true when impersonating", () => {
    const req = mockReq({ session: { impersonating_user_id: "u1" } });
    expect(isImpersonating(req)).toBe(true);
  });

  it("returns false when not impersonating", () => {
    const req = mockReq({ session: {} });
    expect(isImpersonating(req)).toBe(false);
  });
});

describe("requireReadOnlyImpersonation middleware", () => {
  it("passes through when not impersonating", () => {
    const req = mockReq({ session: {}, method: "POST" });
    const res = mockRes();
    const next = vi.fn();

    requireReadOnlyImpersonation(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("blocks POST during active impersonation", () => {
    const req = mockReq({
      session: {
        impersonating_user_id: "u1",
        impersonation_started_at: new Date().toISOString(),
      },
      method: "POST",
    });
    const res = mockRes();
    const next = vi.fn();

    requireReadOnlyImpersonation(req, res, next);
    expect(res._status).toBe(403);
    expect(res._json.message).toContain("read-only");
    expect(next).not.toHaveBeenCalled();
  });

  it("blocks PATCH during active impersonation", () => {
    const req = mockReq({
      session: {
        impersonating_user_id: "u1",
        impersonation_started_at: new Date().toISOString(),
      },
      method: "PATCH",
    });
    const res = mockRes();
    const next = vi.fn();

    requireReadOnlyImpersonation(req, res, next);
    expect(res._status).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("blocks PUT during active impersonation", () => {
    const req = mockReq({
      session: {
        impersonating_user_id: "u1",
        impersonation_started_at: new Date().toISOString(),
      },
      method: "PUT",
    });
    const res = mockRes();
    const next = vi.fn();

    requireReadOnlyImpersonation(req, res, next);
    expect(res._status).toBe(403);
  });

  it("blocks DELETE during active impersonation", () => {
    const req = mockReq({
      session: {
        impersonating_user_id: "u1",
        impersonation_started_at: new Date().toISOString(),
      },
      method: "DELETE",
    });
    const res = mockRes();
    const next = vi.fn();

    requireReadOnlyImpersonation(req, res, next);
    expect(res._status).toBe(403);
  });

  it("allows GET during active impersonation", () => {
    const req = mockReq({
      session: {
        impersonating_user_id: "u1",
        impersonation_started_at: new Date().toISOString(),
      },
      method: "GET",
    });
    const res = mockRes();
    const next = vi.fn();

    requireReadOnlyImpersonation(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("auto-reverts expired impersonation and allows mutation", () => {
    const req = mockReq({
      session: {
        impersonating_user_id: "u1",
        impersonation_started_at: new Date(Date.now() - 61 * 60 * 1000).toISOString(),
        return_brand_id: "b1",
      },
      method: "POST",
    });
    const res = mockRes();
    const next = vi.fn();

    requireReadOnlyImpersonation(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.session.impersonating_user_id).toBeUndefined();
  });
});
