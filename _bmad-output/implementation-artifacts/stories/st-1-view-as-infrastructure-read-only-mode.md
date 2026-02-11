# Story ST.1: View As Infrastructure & Read-Only Mode

Status: ready-for-dev

## Story

As a Katalyst admin,
I want to activate "View As" mode for any franchisee and see the platform exactly as they would see it,
so that I can validate the franchisee experience and support clients shoulder-to-shoulder.

## Acceptance Criteria

1. On the brand detail page's Franchisees tab, each franchisee row displays a "View As" button visible only to Katalyst admins.
2. Clicking "View As" on a franchisee transitions the application into impersonation mode: the franchisee's home page loads with their real data scoped to their permissions.
3. The sidebar navigation updates to show only what the impersonated franchisee would see — all admin-only navigation items are hidden.
4. The application header transforms into a high-contrast neon construction orange (#FF6D00) impersonation banner displaying: the franchisee's name, their role ("Franchisee"), "Read-Only Mode", and an "Exit View As" button.
5. While in "View As" read-only mode, all input fields, buttons, and actions that modify data are visually disabled. Any attempt to submit changes (accidentally or otherwise) is rejected by the server.
6. Clicking "Exit View As" returns the admin to the brand detail Franchisees tab they came from.
7. If the admin logs out or their session expires while impersonating, the impersonation ends and they return to the login screen.
8. The impersonation session has a maximum duration (default 60 minutes) after which the system automatically reverts to admin view and displays a notification (NFR29).
9. While impersonating, the admin sees exactly and only what the franchisee is authorized to see — no additional data is accessible beyond the franchisee's own permissions (NFR9, NFR10).
10. The admin's real identity is preserved throughout the impersonation session for audit trail purposes — it is never lost or overwritten (FR65).

## Dev Notes

### Architecture Patterns to Follow

- **Dual-identity session pattern:** `req.user` always holds the real admin. `getEffectiveUser(req)` returns the impersonated user for data scoping. All downstream code (route handlers, RBAC middleware) uses `getEffectiveUser(req)` instead of `req.user` when resolving data access.
  - Source: architecture.md — "Impersonation Session Model" section
- **Session storage:** Impersonation state lives on the PostgreSQL-backed session object (`req.session.impersonating_user_id`, `req.session.impersonation_started_at`). No new database tables needed for session data — `connect-pg-simple` already persists sessions.
  - Source: architecture.md — Decision 3, server/routes.ts session config
- **Middleware chain:** `requireAuth` → `requireRole` → route handler. The `getEffectiveUser` helper is called inside route handlers and inside `scopeToUser`/`projectForRole`, not as separate middleware.
  - Source: server/middleware/auth.ts, server/middleware/rbac.ts
- **API route organization:** Impersonation endpoints go in `server/routes/admin.ts` (existing admin route file). Register under `/api/admin` prefix.
  - Source: server/routes.ts line 46
- **Express.User type augmentation:** The session type augmentation for impersonation fields goes in `server/auth.ts` alongside the existing `Express.User` declaration (lines 7-20).
- **Frontend state:** The frontend checks impersonation status via `GET /api/admin/impersonate/status` and stores it in a React context (`ImpersonationContext`). Components read this context to render the banner and disable inputs.
- **Read-only enforcement (dual-layer):**
  - Frontend: applies `pointer-events-none opacity-60` to form containers and disables submit buttons when `impersonation.readOnly` is true.
  - Backend: a `requireReadOnlyImpersonation` middleware rejects mutation requests (POST/PATCH/PUT/DELETE on data routes) when impersonation is active and edit mode is not enabled. This prevents bypassing the UI.
  - Source: architecture.md — NFR9/NFR10 mandate that RBAC enforcement happens at the endpoint level, not just the UI.
- **API endpoints (3 new routes in `server/routes/admin.ts`):**
  - `POST /api/admin/impersonate/:userId` — initiates impersonation, stores `impersonating_user_id`, `impersonation_started_at`, and `return_brand_id` on the session.
  - `POST /api/admin/impersonate/stop` — clears impersonation fields from the session and restores admin view.
  - `GET /api/admin/impersonate/status` — returns current impersonation state (active/inactive, target user details, remaining time); also checks the 60-minute timeout server-side and auto-reverts if expired.
  - Source: architecture.md — API routes section, "Impersonation" subsection
- **`getEffectiveUser(req)` helper:** Returns the impersonated user when impersonation is active, or `req.user` when not. All existing data-scoping functions (`scopeToUser`, `projectForRole`, `requirePlanAccess`) must use this helper instead of `req.user` directly for access decisions.
- **Shared types:** `ImpersonationStatus` type exported from `shared/schema.ts` for frontend/backend contract.

### UI/UX Deliverables

- **"View As" button:** Added to each franchisee row in the `AccountManagerTab` component (brand detail Franchisees tab). Uses a ghost variant `<Button>` with an `Eye` icon from `lucide-react`. Only visible when the logged-in user is `katalyst_admin`.
- **Impersonation banner:** Replaces the standard application header when impersonation is active. Background: `#FF6D00` (neon construction orange). White text. Layout: `[Franchisee Name] — Franchisee | Read-Only Mode | [Exit View As]`. The banner uses fixed positioning or replaces the existing header bar — it does NOT add a second header bar (no layout shift).
  - Source: ux-design-specification.md — "Impersonation Banner (View As Mode)" section
- **Sidebar transformation:** When impersonation is active, the sidebar renders only franchisee-appropriate navigation items. Admin items (brand management, admin dashboard, etc.) are hidden. The sidebar component reads from `ImpersonationContext` to determine visibility.
- **Read-only visual state:** All interactive elements in the franchisee experience (form inputs, buttons, links that trigger mutations) show a disabled/muted appearance. Use `pointer-events-none` and reduced opacity on form containers.
- **UI states:**
  - Loading: Show skeleton while impersonation status is being fetched on app load
  - Error: Toast notification if impersonation start/stop fails
  - Success: Smooth transition to impersonated view; toast "Now viewing as [Name]"
  - Auto-revert: When 60-minute timeout expires, show toast "Impersonation session expired" and redirect to admin view

### Anti-Patterns & Hard Constraints

- **DO NOT overwrite `req.user`** with the impersonated user. The dual-identity pattern requires `req.user` to always be the real admin. Use `getEffectiveUser(req)` everywhere data scoping is needed.
- **DO NOT create a new database table** for impersonation sessions. The existing `connect-pg-simple` session store handles this.
- **DO NOT modify `server/vite.ts`** or `vite.config.ts` — these are forbidden per project guidelines.
- **DO NOT modify `package.json`** directly — use the packager tool for any dependency installs.
- **DO NOT modify `drizzle.config.ts`**.
- **DO NOT add a second header bar** for the impersonation banner. The banner replaces/transforms the existing header.
- **DO NOT use `localStorage`** for impersonation state. The state is server-session-only for security.
- **DO NOT allow non-katalyst_admin users** to access impersonation endpoints. The `requireRole("katalyst_admin")` middleware must gate all three endpoints.
- **DO NOT implement edit mode** in this story — that is Story ST-2. This story is strictly read-only impersonation. Do NOT render an "Enable Editing" toggle — that UI element belongs entirely to ST-2.
- **Existing code reuse:** The `scopeToUser` and `projectForRole` functions in `server/middleware/rbac.ts` already handle role-based scoping. Modify them to accept the effective user (from `getEffectiveUser`) rather than creating parallel functions.

### Gotchas & Integration Warnings

- **Session typing:** TypeScript's `express-session` types need augmentation to include `impersonating_user_id` and `impersonation_started_at`. Augment the `express-session` `SessionData` interface in the same file as the `Express.User` augmentation (`server/auth.ts`).
- **`requirePlanAccess` in plans.ts:** This function (line 15-31 in `server/routes/plans.ts`) directly uses `req.user!.role` and `req.user!.id` for ownership checks. It must be updated to use `getEffectiveUser(req)` instead, or impersonated admins will bypass plan ownership checks.
- **Timing of status check:** The frontend should poll or check impersonation status on initial app load AND on route changes. The `GET /api/admin/impersonate/status` endpoint must also check the 60-minute timeout and auto-revert if expired (returning `{ active: false }` and clearing the session fields).
- **Sidebar navigation items:** The current sidebar likely has hardcoded navigation based on role. The impersonation context must override the role used for sidebar rendering without changing `req.user.role`.
- **Return URL:** When the admin clicks "Exit View As", the system needs to know which brand detail page to return to. Store `return_brand_id` in the session alongside the impersonation state.
- **Multiple concurrent sessions:** An admin should NOT be able to impersonate from multiple browser tabs simultaneously. The impersonation state is per-session, so this is naturally handled, but the start-impersonation endpoint should check for existing active impersonation and either error or auto-stop the previous one.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `server/auth.ts` | MODIFY | Add `express-session` `SessionData` augmentation for impersonation fields |
| `server/middleware/auth.ts` | MODIFY | Add `getEffectiveUser(req)` helper, add `requireReadOnlyImpersonation` middleware |
| `server/middleware/rbac.ts` | MODIFY | Update `scopeToUser` and `projectForRole` to use `getEffectiveUser` |
| `server/routes/admin.ts` | MODIFY | Add 3 impersonation endpoints (start, stop, status) |
| `server/routes/plans.ts` | MODIFY | Update `requirePlanAccess` to use `getEffectiveUser` |
| `shared/schema.ts` | MODIFY | Add `ImpersonationStatus` type |
| `client/src/contexts/ImpersonationContext.tsx` | CREATE | React context for impersonation state |
| `client/src/components/ImpersonationBanner.tsx` | CREATE | Orange banner component for impersonation mode |
| `client/src/components/brand/AccountManagerTab.tsx` | MODIFY | Add "View As" button to franchisee rows |
| `client/src/components/app-sidebar.tsx` | MODIFY | Conditionally hide admin nav items during impersonation |
| `client/src/App.tsx` | MODIFY | Wrap with `ImpersonationProvider`, conditionally render banner |

### Dependencies & Environment Variables

- **No new packages required.** All needed libraries (`express-session`, `connect-pg-simple`, `passport`, React context) are already installed.
- **No new environment variables.** Impersonation timeout is a server-side constant (default 60 minutes), not an env var.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — "Impersonation Session Model"] — dual-identity session pattern, `getEffectiveUser` design
- [Source: _bmad-output/planning-artifacts/architecture.md — "Decision 4: Authorization (RBAC) Pattern"] — RBAC middleware chain
- [Source: _bmad-output/planning-artifacts/architecture.md — API routes section] — impersonation endpoint paths
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — "Admin Support Tools — Impersonation & Demo Mode UX"] — banner design, entry points, color choices
- [Source: _bmad-output/planning-artifacts/prd.md — FR59-FR65] — functional requirements for View As
- [Source: _bmad-output/planning-artifacts/prd.md — NFR9, NFR10, NFR29, NFR30] — security and timeout requirements
- [Source: _bmad-output/planning-artifacts/epics.md — Epic ST, Story ST-1] — acceptance criteria source
- [Source: server/middleware/rbac.ts] — existing `scopeToUser` and `projectForRole` implementations
- [Source: server/routes/admin.ts] — existing admin route structure
- [Source: server/auth.ts lines 7-20] — existing `Express.User` type augmentation
- [Source: server/routes/plans.ts lines 15-31] — `requirePlanAccess` ownership check needing update
- [Source: client/src/components/brand/AccountManagerTab.tsx] — franchisee list where "View As" button goes

## Dev Agent Record

### Agent Model Used

### Completion Notes

### File List
