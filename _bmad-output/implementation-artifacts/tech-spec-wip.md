---
title: 'Dev Role Switcher — One-Click Dev Login by Role'
slug: 'dev-role-switcher'
created: '2026-02-15'
status: 'in-progress'
stepsCompleted: [1, 2]
tech_stack: ['React', 'Express', 'PostgreSQL', 'Passport.js', 'Drizzle ORM', 'Vitest', 'Supertest', 'TanStack Query', 'wouter', 'shadcn/ui']
files_to_modify: ['server/routes/auth.ts', 'server/storage.ts', 'client/src/pages/login.tsx', 'server/routes/auth.test.ts']
code_patterns: ['upsert-by-email for synthetic users', 'isDemo flag on demo users', 'dev mode guard via missing Google OAuth env vars', 'IStorage interface + DatabaseStorage class', 'session user shape: {id, email, role, brandId, displayName, profileImageUrl, onboardingCompleted, preferredTier}']
test_patterns: ['vitest + supertest', 'mocked storage via vi.mock', 'createApp() helper with optional authenticated user injection', 'describe/it blocks grouped by endpoint']
---

# Tech-Spec: Dev Role Switcher — One-Click Dev Login by Role

**Created:** 2026-02-15

## Overview

### Problem Statement

During development, there's no quick way to log in as a franchisee or franchisor user. The only dev login creates a katalyst_admin, and testing other roles requires multiple steps (admin login → navigate to brand → enter demo mode). There's no franchisor dev login path at all.

### Solution

Add role-specific dev login buttons directly on the login page (Franchisee, Franchisor, and the existing Admin). Each creates/reuses a synthetic dev user for that role, tied to a brand. Auto-picks the first available brand by default but allows selecting a specific brand from a dropdown.

### Scope

**In Scope:**
- Dev login buttons on the login page for Franchisee and Franchisor roles (alongside existing Admin)
- Backend endpoints to create/reuse synthetic dev users per role + brand
- Brand selector dropdown (auto-picks first brand, overridable)
- Only available when Google OAuth is not configured (same guard as current dev login)

**Out of Scope:**
- Dev toolbar/role-switcher panel
- Changes to the existing Demo Mode or Impersonation systems
- Any production auth changes
- Franchisor-specific pages/features (just the login-as mechanism)

## Context for Development

### Codebase Patterns

- **Dev mode guard:** `!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET` — used in both `GET /api/auth/dev-enabled` and `POST /api/auth/dev-login`
- **Existing dev login:** `POST /api/auth/dev-login` (no body) upserts `dev@katgroupinc.com` as `katalyst_admin` via `storage.upsertUserFromGoogle()`, then calls `req.login()` with session user shape
- **Demo mode synthetic users:** `storage.getDemoUserForBrand(brandId)` queries `users` where `isDemo=true AND role='franchisee' AND brandId=X`. `storage.createDemoUser()` creates with email `demo-franchisee@{brandSlug}.katalyst.internal`
- **Demo plan auto-creation:** `storage.createDemoPlan()` creates a plan pre-populated with brand defaults (financialInputs + startupCosts from brand parameters)
- **Session user shape:** `{ id, email, role, brandId, displayName, profileImageUrl, onboardingCompleted, preferredTier }`
- **IStorage pattern:** Interface defines method signatures, `DatabaseStorage` class implements. All CRUD through this layer.
- **Brand listing:** `storage.getBrands()` returns all brands, sorted by query order

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `server/routes/auth.ts` | Current dev-login endpoint (`POST /dev-login`), dev-enabled check (`GET /dev-enabled`), session login/logout |
| `client/src/pages/login.tsx` | Login page UI — dev login button, email/password form, Google OAuth button |
| `server/storage.ts` | IStorage interface (lines 32-106) + DatabaseStorage class. Demo user methods at lines 462-527 |
| `shared/schema.ts` | User table schema — `role` field is `"franchisee" | "franchisor" | "katalyst_admin"`, `brandId` nullable FK, `isDemo` boolean |
| `server/routes/auth.test.ts` | Test suite — vitest + supertest, mocked storage, `createApp()` helper pattern |
| `server/routes/admin.ts` | Demo mode endpoints — pattern reference for synthetic user creation + plan initialization |

### Technical Decisions

1. **Single endpoint, optional body:** Extend `POST /api/auth/dev-login` to accept optional `{ role?, brandId? }`. When omitted, defaults to `katalyst_admin` (backward compatible with existing button).
2. **New brands endpoint:** `GET /api/auth/dev-brands` — returns list of brands (id, name, displayName) for the dropdown. Same dev-mode guard.
3. **Dev user email convention:** `dev-{role}-{brandSlug}@katgroupinc.com` for brand-scoped roles. `dev@katgroupinc.com` for admin (unchanged).
4. **Dev user display name:** `"Dev Franchisee ({brandDisplayName})"` / `"Dev Franchisor ({brandDisplayName})"`.
5. **Upsert by email:** Find existing user by email, return if found. Create if not. Simpler than the demo mode `isDemo` flag approach — dev users are identified purely by their email pattern.
6. **Auto-create plan for franchisee:** Same pattern as demo mode — call `storage.createDemoPlan()` when franchisee dev user has no plans.
7. **Franchisor users are brand-scoped:** `brandId` set on user, same as franchisee. Franchisor role already exists in schema.
8. **No new DB columns or migrations:** Dev users are regular users with distinctive email patterns. No `isDev` flag needed.
9. **Disable buttons when no brands:** Frontend disables franchisee/franchisor buttons when brand list is empty, with tooltip "Create a brand first."

### Party Mode Insights (Captured)

- Winston: Single endpoint with optional body for backward compatibility
- Sally: Group dev buttons in "Development Mode" section; brand dropdown above role buttons; visual role differentiation with icons; disable (don't hide) buttons when no brands
- Amelia: Use email pattern matching for dev users; auto-create plan for franchisee; reuse storage patterns from demo mode
- Quinn: Test idempotency (same role+brand = same user); backward compatibility (no body = admin); edge cases (no brands, invalid role); E2E flow verification

## Acceptance Criteria

(To be filled in Step 3)

## Implementation Guidance

### Architecture Patterns to Follow

(To be filled in Step 3)

### Anti-Patterns and Constraints

(To be filled in Step 3)

### File Change Summary

(To be filled in Step 3)

### Dependencies

(To be filled in Step 3)

### Testing Guidance

(To be filled in Step 3)

### Notes

(To be filled in Step 3)
