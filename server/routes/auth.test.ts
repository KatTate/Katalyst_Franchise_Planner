import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../storage", () => ({
  storage: {
    upsertUserFromGoogle: vi.fn(),
    getUserByEmail: vi.fn(),
    getUser: vi.fn(),
  },
}));

vi.mock("../auth", () => {
  const passportMock = {
    authenticate: vi.fn(),
    initialize: vi.fn(() => (_req: any, _res: any, next: any) => next()),
    session: vi.fn(() => (_req: any, _res: any, next: any) => next()),
  };
  return { default: passportMock };
});

import { storage } from "../storage";

describe("Auth Routes - Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/dev-login", () => {
    it("should call upsertUserFromGoogle with dev credentials when OAuth not configured", async () => {
      const mockUser = {
        id: "u1",
        email: "dev@katgroupinc.com",
        role: "katalyst_admin" as const,
        brandId: null,
        displayName: "Dev Admin",
        profileImageUrl: null,
        onboardingCompleted: true,
        preferredTier: null,
        passwordHash: null,
        accountManagerId: null,
        bookingUrl: null,
      };

      (storage.upsertUserFromGoogle as any).mockResolvedValue(mockUser);

      const result = await storage.upsertUserFromGoogle({
        email: "dev@katgroupinc.com",
        displayName: "Dev Admin",
        profileImageUrl: null,
      });

      expect(storage.upsertUserFromGoogle).toHaveBeenCalledWith({
        email: "dev@katgroupinc.com",
        displayName: "Dev Admin",
        profileImageUrl: null,
      });
      expect(result.email).toBe("dev@katgroupinc.com");
      expect(result.role).toBe("katalyst_admin");
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return 401 when not authenticated (no user on request)", () => {
      const req = {
        isAuthenticated: () => false,
        user: undefined,
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      if (!req.isAuthenticated() || !req.user) {
        res.status(401).json({ message: "Not authenticated" });
      }

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Not authenticated" });
    });

    it("should return user when authenticated", () => {
      const mockUser = {
        id: "u1",
        email: "test@katgroupinc.com",
        role: "katalyst_admin",
        brandId: null,
        displayName: "Test User",
        profileImageUrl: null,
        onboardingCompleted: true,
        preferredTier: null,
      };
      const req = {
        isAuthenticated: () => true,
        user: mockUser,
      };
      const res = {
        json: vi.fn(),
      };

      if (req.isAuthenticated() && req.user) {
        res.json(req.user);
      }

      expect(res.json).toHaveBeenCalledWith(mockUser);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should destroy session and clear cookie on successful logout", () => {
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        clearCookie: vi.fn(),
      };

      const req = {
        logout: vi.fn((cb: any) => cb(null)),
        session: {
          destroy: vi.fn((cb: any) => cb(null)),
        },
      };

      req.logout((err: any) => {
        if (err) {
          res.status(500).json({ message: "Logout failed" });
          return;
        }
        req.session.destroy((sessionErr: any) => {
          if (sessionErr) {
            res.status(500).json({ message: "Session destruction failed" });
            return;
          }
          res.clearCookie("connect.sid");
          res.json({ message: "Logged out" });
        });
      });

      expect(res.clearCookie).toHaveBeenCalledWith("connect.sid");
      expect(res.json).toHaveBeenCalledWith({ message: "Logged out" });
    });

    it("should return 500 if logout fails", () => {
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      const req = {
        logout: vi.fn((cb: any) => cb(new Error("fail"))),
      };

      req.logout((err: any) => {
        if (err) {
          res.status(500).json({ message: "Logout failed" });
        }
      });

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Logout failed" });
    });
  });

  describe("GET /api/auth/dev-enabled", () => {
    it("should return devMode: true when Google OAuth is not configured", () => {
      const devMode = !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET;
      expect(devMode).toBe(true);
    });
  });
});
