# Story 1.5: Role-Based Access Control

Status: review

## Story

As a platform operator,
I want the system to enforce role-based access so users only see and modify data they are authorized for,
So that franchisee data isolation, franchisor brand scoping, and admin access are enforced at every layer (FR32).

## Acceptance Criteria

1. **Given** I am logged in as a franchisee **When** I navigate directly to an admin-only page (e.g., /admin/invitations or /admin/brands) **Then** I am redirected to my dashboard **And** I do not see admin navigation items (such as "Invitations" or "Brands") in the sidebar
2. **Given** I am logged in as a franchisee **When** I attempt to access a resource outside my scope (e.g., invitations, brands, or — in future epics — another franchisee's plan) **Then** the API returns 404 (not 403) **And** I cannot view, edit, or infer the existence of another user's data. (Note: Plan-level isolation will be validated when plan APIs are built in Epic 3 — this story builds the middleware infrastructure that those routes will consume)
3. **Given** I am logged in as a franchisor admin for Brand A **When** I try to access data belonging to Brand B (e.g., invitations for another brand) **Then** the API returns 404 **And** I cannot view or modify any data outside my assigned brand. (Note: The existing invitation listing already implements brand scoping — this story generalizes the pattern via reusable middleware)
4. **Given** I am logged in as a franchisor admin **When** I view the sidebar navigation **Then** I see only navigation items relevant to my role and brand (e.g., my brand's franchisee list, invitations for my brand) **And** I do not see cross-brand admin features reserved for Katalyst admins
5. **Given** I am logged in as a Katalyst admin **When** I navigate to any page or data in the system **Then** I can view and manage data across all brands without restriction
6. **Given** I am not logged in **When** I try to visit any authenticated page **Then** I am redirected to the login page
7. **Given** RBAC is enforced at the API level **When** any user attempts to access data outside their role scope — whether through the UI or by manipulating API parameters (direct URLs, ID guessing, sequential enumeration) **Then** the system returns no data and reveals no information about resources the user is not authorized to see

## Dev Notes

### Architecture Patterns to Follow

**Three-Layer RBAC (from architecture.md — Decision 4):**

This story formalizes the RBAC middleware that was introduced as inline helpers in Story 1.2. The architecture specifies three authorization layers:

```
Layer 1: Route-level middleware (role check)
  → requireRole('franchisee', 'katalyst_admin')
  → Applied to every route definition

Layer 2: Query-level scoping (data isolation)
  → scopeToUser(req.user) automatically adds WHERE clauses
  → Franchisee: WHERE user_id = req.user.id
  → Franchisor: WHERE brand_id = req.user.brand_id
  → Katalyst: no additional scoping (full access)

Layer 3: Response-level projection (field filtering)
  → Franchisor WITHOUT opt-in sees pipeline fields only
  → Franchisor WITH opt-in sees pipeline + financial details
  → Katalyst sees everything
```

**Middleware File Organization (from architecture.md — Structure Patterns):**
- Create `server/middleware/auth.ts` — exports `requireAuth()` and `requireRole()`
- Create `server/middleware/rbac.ts` — exports `scopeToUser()` and `projectForRole()`
- These middleware functions will be imported by route modules

**requireAuth Middleware:**
```typescript
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}
```

**requireRole Middleware:**
```typescript
export function requireRole(...roles: Array<"franchisee" | "franchisor" | "katalyst_admin">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}
```

**scopeToUser Helper:**
```typescript
export function scopeToUser(user: Express.User): { userId?: string; brandId?: string | null } {
  switch (user.role) {
    case "franchisee":
      return { userId: user.id };
    case "franchisor":
      return { brandId: user.brandId };
    case "katalyst_admin":
      return {}; // no scoping — full access
  }
}
```

**Frontend Protected Route Pattern (already established in App.tsx):**
- `ProtectedRoute` — requires authentication, redirects to `/login`
- `AdminRoute` — requires authentication + non-franchisee role, redirects franchisees to `/`
- These patterns are already implemented — this story validates they work correctly and adds any missing route guards

**Sidebar Navigation Visibility (already partially implemented in app-sidebar.tsx):**
- Invitations nav item is already hidden from franchisees (visible to katalyst_admin and franchisor roles)
- This story adds any missing role-based visibility rules for future navigation items (e.g., "Brands" for katalyst_admin only)

**API-Level Enforcement Principle:**
- Data isolation is enforced at the storage layer (IStorage methods receive user context), not at the route handler level
- Route handlers never construct raw queries — they call storage methods that apply scoping
- This story extends the storage interface with scoped query methods where needed

### UI/UX Deliverables

- **Sidebar Navigation** (modify `client/src/components/app-sidebar.tsx`):
  - Franchisee: sees only "Dashboard" (their plans will be on the dashboard)
  - Franchisor: sees "Dashboard" and "Invitations" (for their brand only)
  - Katalyst Admin: sees "Dashboard", "Invitations", and "Brands" (future Epic 2 page)
  - Navigation items are filtered by role before rendering — no hidden DOM elements

- **Admin Route Protection** (already in `client/src/App.tsx`):
  - `AdminRoute` wrapper redirects franchisees to `/` when they attempt to access admin pages
  - This behavior is already implemented — validate it works for all admin routes

- **Access Denied States**:
  - When a franchisee tries to access `/admin/invitations` via URL, they are silently redirected to `/` (not shown an error page)
  - When an API call returns 403 (wrong role for the endpoint), the frontend shows a toast: "You don't have permission to access this resource"
  - When an API call returns 404 for a scoped resource, the frontend shows the resource-appropriate "not found" message
  - **Consistent 404 for scoped resources**: When a user attempts to access a resource outside their scope by ID (e.g., guessing a plan ID or brand ID), always return 404 — never 403. Returning 403 confirms the resource exists; 404 reveals nothing

### Anti-Patterns & Hard Constraints

- Do NOT filter data at the UI level only — all access control must be enforced at the API level. The UI hides navigation items for convenience, but the server rejects unauthorized requests
- Do NOT reveal the existence of resources to unauthorized users — return 404 (not 403) when a user tries to access another user's data by ID. 403 confirms the resource exists; 404 does not
- Do NOT create a "catch-all" admin middleware that checks roles — use specific `requireRole()` calls per route so each endpoint's authorization is explicit
- Do NOT modify the existing inline `requireAuth` and `requireRole` in `server/routes.ts` yet — create the new middleware files first, then update routes.ts to import from middleware. This prevents breaking existing routes during the refactor
- Do NOT modify `server/index.ts`, `server/vite.ts`, `server/static.ts`, `vite.config.ts`, or `drizzle.config.ts`
- Do NOT implement Layer 3 (response-level projection / field filtering) in this story — that is part of Epic 8 (Data Sharing & Privacy). This story focuses on Layers 1 and 2

### Gotchas & Integration Warnings

- **Existing inline middleware in routes.ts**: `requireAuth` and `requireRole` are currently defined as local functions inside `registerRoutes()`. When creating the middleware module, ensure the new imports replace the inline versions without breaking existing route registrations
- **Plans table doesn't exist yet**: Epic 3 creates the plans table. AC #2 (franchisee plan isolation) describes the target behavior. For this story, implement the `scopeToUser` helper and ensure it's ready for use when plans are created. The middleware infrastructure is what's being built — actual plan scoping will be applied when plan routes are created
- **Brand scoping for franchisor**: Franchisor admins have a `brandId` on their user record. All franchisor-scoped queries filter by this `brandId`. The invitation listing in `server/routes.ts` already implements this pattern — this story generalizes it
- **Invitation routes already have RBAC**: The `POST /api/invitations` and `GET /api/invitations` routes already enforce role checks (katalyst_admin, franchisor) and brand scoping (franchisor sees only their brand). This story validates these existing protections work correctly
- **AdminRoute vs ProtectedRoute in App.tsx**: `AdminRoute` rejects franchisees; `ProtectedRoute` requires any authenticated user. Make sure all admin routes use `AdminRoute` and all user-facing routes use `ProtectedRoute`
- **Express.User type** is augmented in `server/auth.ts` and includes `role` and `brandId` — the middleware can rely on these fields

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `server/middleware/auth.ts` | CREATE | Export requireAuth() and requireRole() middleware functions |
| `server/middleware/rbac.ts` | CREATE | Export scopeToUser() and projectForRole() helpers for query-level data scoping |
| `server/routes.ts` | MODIFY | Import middleware from server/middleware/auth.ts, replace inline requireAuth/requireRole |
| `client/src/components/app-sidebar.tsx` | MODIFY | Add role-based nav item visibility for "Brands" (katalyst_admin only), ensure existing role filtering is complete |
| `client/src/App.tsx` | MODIFY | Ensure all admin routes use AdminRoute, validate franchisee redirect behavior |

### Dependencies & Environment Variables

**No new packages needed** — all auth/session dependencies are already installed.

**No new environment variables needed.**

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Decision 4: Authorization (RBAC) Pattern] — Three-layer RBAC: route-level, query-level, response-level
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns] — middleware/auth.ts, middleware/rbac.ts file locations
- [Source: _bmad-output/planning-artifacts/architecture.md#API Boundaries] — Route-level auth requirements per endpoint
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision 5: API Design] — Error response format
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.5] — Original acceptance criteria
- [Source: _bmad-output/planning-artifacts/prd.md#FR32] — Role-based data isolation
- [Source: _bmad-output/planning-artifacts/prd.md#NFR9] — Every API endpoint enforces RBAC
- [Source: _bmad-output/planning-artifacts/prd.md#NFR10] — Franchisee data isolation enforced at database query level
- [Source: _bmad-output/implementation-artifacts/1-2-invitation-creation-by-admin.md] — Inline requireAuth/requireRole pattern, franchisor brand scoping

## Dev Agent Record

### Agent Model Used

Claude 4.6 Opus (Replit Agent)

### Completion Notes

Implemented role-based access control for Story 1.5:

- **Middleware Extraction**: Created `server/middleware/auth.ts` with `requireAuth()` and `requireRole(...roles)` middleware functions, extracted from inline implementations in routes.ts. `requireAuth` checks `req.isAuthenticated()` and returns 401. `requireRole` checks `req.user.role` against allowed roles and returns 403.
- **RBAC Helpers**: Created `server/middleware/rbac.ts` with `scopeToUser(req)` (returns user ID for data scoping) and `projectForRole(req)` (returns brand-scoped project context based on role).
- **Route Guards**: Updated `server/routes.ts` to import middleware from new files. Invitation routes use `requireAuth` + `requireRole("katalyst_admin", "franchisor")`. Brand routes use `requireAuth`.
- **Frontend RBAC**: Sidebar navigation in `app-sidebar.tsx` conditionally shows "Invitations" nav item only for `katalyst_admin` and `franchisor` roles. `AdminRoute` guard in `App.tsx` redirects franchisees away from `/admin/invitations`.
- **Key Decision**: Franchisees cannot see or access admin routes. Franchisor admins can see invitations (scoped to their brand). Katalyst admins see everything.

### File List

| File | Action |
|------|--------|
| `server/middleware/auth.ts` | CREATED — requireAuth() and requireRole() middleware |
| `server/middleware/rbac.ts` | CREATED — scopeToUser() and projectForRole() helpers |
| `server/routes.ts` | MODIFIED — Imported middleware from new files, removed inline functions |
| `client/src/components/app-sidebar.tsx` | MODIFIED — Role-based nav item visibility |
| `client/src/App.tsx` | MODIFIED — Added AdminRoute guard component |
