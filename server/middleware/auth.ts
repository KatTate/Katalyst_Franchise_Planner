import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

export const IMPERSONATION_MAX_MINUTES = 60;

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

export function requireRole(...roles: Array<"franchisee" | "franchisor" | "katalyst_admin">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}

/**
 * Returns the impersonated user when impersonation is active, or req.user when not.
 * Caches the result on the request object to avoid redundant DB lookups within a single request.
 */
export async function getEffectiveUser(req: Request): Promise<Express.User> {
  if (!req.user) {
    throw new Error("getEffectiveUser called without authenticated user");
  }

  const impersonatingId = req.session?.impersonating_user_id;
  if (!impersonatingId) {
    return req.user;
  }

  // Check 60-minute timeout
  const startedAt = req.session.impersonation_started_at;
  if (startedAt) {
    const elapsed = Date.now() - new Date(startedAt).getTime();
    if (elapsed > IMPERSONATION_MAX_MINUTES * 60 * 1000) {
      // Auto-revert expired impersonation
      delete req.session.impersonating_user_id;
      delete req.session.impersonation_started_at;
      delete req.session.return_brand_id;
      return req.user;
    }
  }

  // Use cached effective user if available on this request
  const cached = (req as any)._effectiveUser as Express.User | undefined;
  if (cached) {
    return cached;
  }

  const impersonatedUser = await storage.getUser(impersonatingId);
  if (!impersonatedUser) {
    // Target user no longer exists — clear impersonation
    delete req.session.impersonating_user_id;
    delete req.session.impersonation_started_at;
    delete req.session.return_brand_id;
    return req.user;
  }

  const effectiveUser: Express.User = {
    id: impersonatedUser.id,
    email: impersonatedUser.email,
    role: impersonatedUser.role,
    brandId: impersonatedUser.brandId,
    displayName: impersonatedUser.displayName,
    profileImageUrl: impersonatedUser.profileImageUrl,
    onboardingCompleted: impersonatedUser.onboardingCompleted,
    preferredTier: impersonatedUser.preferredTier,
  };

  // Cache on request object
  (req as any)._effectiveUser = effectiveUser;
  return effectiveUser;
}

/**
 * Returns true if impersonation is currently active on this request's session.
 */
export function isImpersonating(req: Request): boolean {
  return !!req.session?.impersonating_user_id;
}

/**
 * Middleware that rejects mutation requests (POST/PATCH/PUT/DELETE) when
 * read-only impersonation is active. This is the server-side enforcement
 * layer that prevents bypassing the disabled UI.
 */
export function requireReadOnlyImpersonation(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.impersonating_user_id) {
    return next();
  }

  // Check if the impersonation has expired — if so, auto-revert and allow the write
  const startedAt = req.session.impersonation_started_at;
  if (startedAt) {
    const elapsed = Date.now() - new Date(startedAt).getTime();
    if (elapsed > IMPERSONATION_MAX_MINUTES * 60 * 1000) {
      delete req.session.impersonating_user_id;
      delete req.session.impersonation_started_at;
      delete req.session.return_brand_id;
      return next();
    }
  }

  const mutationMethods = ["POST", "PATCH", "PUT", "DELETE"];
  if (mutationMethods.includes(req.method)) {
    return res.status(403).json({
      message: "Modifications are not allowed in read-only impersonation mode",
    });
  }

  next();
}
