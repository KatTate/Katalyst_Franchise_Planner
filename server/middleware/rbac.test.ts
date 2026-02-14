import { describe, it, expect } from "vitest";
import { scopeToUser, projectForRole } from "./rbac";

describe("scopeToUser", () => {
  it("returns userId for franchisee", () => {
    const user: Express.User = {
      id: "u1",
      email: "f@test.com",
      role: "franchisee",
      brandId: "b1",
      displayName: "Test",
      profileImageUrl: null,
      onboardingCompleted: true,
      preferredTier: "forms",
    };
    expect(scopeToUser(user)).toEqual({ userId: "u1" });
  });

  it("returns brandId for franchisor", () => {
    const user: Express.User = {
      id: "u2",
      email: "fr@test.com",
      role: "franchisor",
      brandId: "b1",
      displayName: "Test",
      profileImageUrl: null,
      onboardingCompleted: true,
      preferredTier: null,
    };
    expect(scopeToUser(user)).toEqual({ brandId: "b1" });
  });

  it("returns empty object for katalyst_admin", () => {
    const user: Express.User = {
      id: "u3",
      email: "a@katgroupinc.com",
      role: "katalyst_admin",
      brandId: null,
      displayName: "Admin",
      profileImageUrl: null,
      onboardingCompleted: true,
      preferredTier: null,
    };
    expect(scopeToUser(user)).toEqual({});
  });

  it("returns null brandId for franchisor without brand", () => {
    const user: Express.User = {
      id: "u4",
      email: "fr2@test.com",
      role: "franchisor",
      brandId: null,
      displayName: "Test",
      profileImageUrl: null,
      onboardingCompleted: true,
      preferredTier: null,
    };
    expect(scopeToUser(user)).toEqual({ brandId: null });
  });
});

describe("projectForRole", () => {
  it("returns 'own' for franchisee", () => {
    const user: Express.User = {
      id: "u1",
      email: "f@test.com",
      role: "franchisee",
      brandId: "b1",
      displayName: "Test",
      profileImageUrl: null,
      onboardingCompleted: true,
      preferredTier: "forms",
    };
    expect(projectForRole(user)).toEqual({ level: "own" });
  });

  it("returns 'brand' for franchisor", () => {
    const user: Express.User = {
      id: "u2",
      email: "fr@test.com",
      role: "franchisor",
      brandId: "b1",
      displayName: "Test",
      profileImageUrl: null,
      onboardingCompleted: true,
      preferredTier: null,
    };
    expect(projectForRole(user)).toEqual({ level: "brand" });
  });

  it("returns 'all' for katalyst_admin", () => {
    const user: Express.User = {
      id: "u3",
      email: "a@katgroupinc.com",
      role: "katalyst_admin",
      brandId: null,
      displayName: "Admin",
      profileImageUrl: null,
      onboardingCompleted: true,
      preferredTier: null,
    };
    expect(projectForRole(user)).toEqual({ level: "all" });
  });
});
