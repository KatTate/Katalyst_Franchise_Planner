---
title: 'Dev Role Switcher — One-Click Dev Login by Role'
slug: 'dev-role-switcher'
created: '2026-02-15'
status: 'ready-for-dev'
stepsCompleted: [1, 2, 3, 4]
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

### AC-1: Admin dev login backward compatibility
- **Given** Google OAuth is not configured and no request body is sent
- **When** `POST /api/auth/dev-login` is called with no body
- **Then** a `katalyst_admin` dev user (`dev@katgroupinc.com`) is created/returned and the session is established with `role: "katalyst_admin"` and `brandId: null`

### AC-2: Franchisee dev login creates brand-scoped user
- **Given** Google OAuth is not configured and at least one brand exists
- **When** `POST /api/auth/dev-login` is called with `{ role: "franchisee", brandId: "<valid-brand-id>" }`
- **Then** a franchisee dev user is upserted with email `dev-franchisee-{brandSlug}@katgroupinc.com`, `role: "franchisee"`, `brandId` set to the requested brand, `displayName: "Dev Franchisee ({brandDisplayName})"`, `onboardingCompleted: true`, and the session is established

### AC-3: Franchisor dev login creates brand-scoped user
- **Given** Google OAuth is not configured and at least one brand exists
- **When** `POST /api/auth/dev-login` is called with `{ role: "franchisor", brandId: "<valid-brand-id>" }`
- **Then** a franchisor dev user is upserted with email `dev-franchisor-{brandSlug}@katgroupinc.com`, `role: "franchisor"`, `brandId` set to the requested brand, `displayName: "Dev Franchisor ({brandDisplayName})"`, `onboardingCompleted: true`, and the session is established

### AC-4: Franchisee dev login auto-creates plan
- **Given** a franchisee dev user is created or returned with no existing plans
- **When** the dev login completes
- **Then** a plan is automatically created for that user using `storage.createDemoPlan()`, pre-populated with brand default financial inputs and startup costs

### AC-5: Dev login is idempotent
- **Given** a dev user already exists for a specific role + brand combination
- **When** `POST /api/auth/dev-login` is called again with the same role and brandId
- **Then** the existing user is returned (not duplicated) and the session is established

### AC-6: Dev login rejects invalid role
- **Given** Google OAuth is not configured
- **When** `POST /api/auth/dev-login` is called with `{ role: "invalid_role" }`
- **Then** a 400 response is returned with an appropriate error message

### AC-7: Dev login rejects missing brand for brand-scoped roles
- **Given** Google OAuth is not configured
- **When** `POST /api/auth/dev-login` is called with `{ role: "franchisee" }` and no `brandId`
- **Then** a 400 response is returned indicating a brand must be selected

### AC-8: Dev login rejects invalid brandId
- **Given** Google OAuth is not configured
- **When** `POST /api/auth/dev-login` is called with `{ role: "franchisee", brandId: "nonexistent" }`
- **Then** a 404 response is returned indicating the brand was not found

### AC-9: Dev brands endpoint returns brand list
- **Given** Google OAuth is not configured
- **When** `GET /api/auth/dev-brands` is called
- **Then** a JSON array of brands is returned, each containing `{ id, name, displayName }`, sorted alphabetically by name

### AC-10: Dev brands endpoint blocked when OAuth configured
- **Given** Google OAuth IS configured (both env vars present)
- **When** `GET /api/auth/dev-brands` is called
- **Then** a 403 response is returned

### AC-11: Login page shows dev mode section with role buttons
- **Given** Google OAuth is not configured (`devMode: true`)
- **When** the login page loads
- **Then** a "Development Mode" section is visible containing three buttons: "Dev Login (Admin)", "Dev Login (Franchisee)", "Dev Login (Franchisor)", each with a distinct icon

### AC-12: Login page shows brand selector dropdown
- **Given** Google OAuth is not configured and at least one brand exists
- **When** the login page loads
- **Then** a brand selector dropdown is visible above the franchisee/franchisor buttons, defaulting to the first brand alphabetically, showing brand display names

### AC-13: Franchisee/franchisor buttons disabled when no brands
- **Given** Google OAuth is not configured and no brands exist in the database
- **When** the login page loads
- **Then** the franchisee and franchisor dev login buttons are visually disabled and display a tooltip "Create a brand first" on hover. The admin button remains enabled.

### AC-14: Dev login guard blocks all dev endpoints when OAuth configured
- **Given** Google OAuth IS configured (both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` env vars are set)
- **When** `POST /api/auth/dev-login` is called with any body
- **Then** a 403 response is returned with message "Dev login disabled when Google OAuth is configured"

## Implementation Guidance

### Architecture Patterns to Follow

- **Extend existing endpoint:** Modify the existing `POST /api/auth/dev-login` handler in `server/routes/auth.ts` to parse an optional body. Do not create separate endpoints per role.
- **Storage layer pattern:** Add `upsertDevUser` method to `IStorage` interface and `DatabaseStorage` class, following the same upsert-by-email pattern used by `upsertUserFromGoogle()`. Query by email first, return if found, create if not.
- **Reuse `createDemoPlan`:** For franchisee auto-plan creation, reuse the existing `storage.createDemoPlan()` and `storage.getPlansByUser()` methods — identical to demo mode logic in `server/routes/admin.ts` lines 227-229.
- **Zod validation:** Use Zod schema to validate the optional request body, matching the pattern used by other endpoints in the codebase (e.g., `updateMeSchema` in `auth.ts`).
- **Frontend query pattern:** Use `useQuery` for fetching brands (with `enabled: !!devStatus?.devMode`). Use `useMutation` for the dev login calls, matching the existing `devLoginMutation` pattern.
- **Shadcn Select component:** Use `<Select>` from shadcn for the brand dropdown, consistent with other dropdowns in the app.

### Anti-Patterns and Constraints

- **Do NOT create separate endpoints** per role (e.g., `/dev-login/franchisee`). A single endpoint with body params keeps the API surface clean.
- **Do NOT modify the existing admin dev login behavior.** When no body is sent, the endpoint must behave exactly as it does today.
- **Do NOT add database migrations.** Dev users are regular users with distinctive email patterns — no new columns needed.
- **Do NOT touch Demo Mode or Impersonation systems.** This is an independent dev convenience feature.
- **Do NOT store dev user passwords.** `passwordHash` should be null — these users are only accessible via the dev login endpoint.
- **Do NOT use the `isDemo` flag** for dev users. That flag is reserved for demo mode synthetic users. Dev users are identified by their email pattern.

### File Change Summary

| File | Change Type | Description |
| ---- | ----------- | ----------- |
| `server/routes/auth.ts` | Modify | Extend `POST /dev-login` to accept optional `{ role, brandId }` body. Add `GET /dev-brands` endpoint. Add Zod validation schema for the body. |
| `server/storage.ts` | Modify | Add `upsertDevUser(role, brandSlug, brandId, brandDisplayName)` to `IStorage` interface and `DatabaseStorage` implementation. |
| `client/src/pages/login.tsx` | Modify | Add brand selector dropdown (via `useQuery` to `/api/auth/dev-brands`). Replace single dev login button with three role-specific buttons. Add disabled state + tooltip when no brands. |
| `server/routes/auth.test.ts` | Modify | Add test cases for: franchisee dev login, franchisor dev login, backward compatibility (no body), invalid role, missing brandId, idempotency, dev-brands endpoint. |

### Dependencies

- No new external libraries required.
- Depends on at least one brand existing in the database for franchisee/franchisor dev login to work (handled via disabled state when no brands).
- Reuses existing `storage.createDemoPlan()` — no changes to that method needed.
- Reuses existing `storage.getBrands()` — no changes needed.

### Testing Guidance

**Unit tests (vitest + supertest):**
- Extend `server/routes/auth.test.ts` following the existing `createApp()` + mocked storage pattern.
- Key scenarios: AC-1 through AC-10 (all backend ACs map directly to test cases).
- Mock `storage.getUserByEmail`, `storage.createUser`, `storage.getBrands`, `storage.getPlansByUser`, `storage.createDemoPlan` as needed.

**E2E tests (Playwright):**
- Navigate to login page → verify brand dropdown loads with brands → select a brand → click "Dev Login (Franchisee)" → verify redirect to dashboard → verify user displays as franchisee with correct brand.
- Repeat for franchisor role.
- Verify admin button still works without brand selection.
- Verify disabled state when no brands exist (if testable — may require empty DB state).

### Notes

**Risks:**
- If `storage.getBrands()` returns an empty list, franchisee/franchisor dev login is impossible. This is by design (you need to create a brand first), but could confuse a developer on first setup. The disabled buttons with tooltip mitigate this.

**Future considerations:**
- A dev toolbar/role-switcher that allows switching roles without logging out could build on this foundation — the backend endpoint already supports any role.
- If franchisor-specific pages/features are added later, the franchisor dev login created here will be immediately useful for testing them.
- Could extend with `onboardingCompleted: false` option to test the onboarding flow as different roles.
