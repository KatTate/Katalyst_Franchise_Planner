# Story 1.2: Invitation Creation by Admin

Status: ready-for-dev

## Story

As a Katalyst admin,
I want to create invitations for franchisees and franchisor admins,
So that I can onboard new users to the platform in a controlled way.

## Acceptance Criteria

1. **Given** I am logged in as a Katalyst admin and on the dashboard **When** I navigate to the Invitation Management page **Then** I see a table of all invitations showing email, role, brand, status (pending/accepted/expired), and expiry date
2. **Given** I am on the Invitation Management page **When** I fill out the new invitation form with email, role, and brand and click Send **Then** a new invitation is created and appears in my invitation list with a "pending" status **And** I can copy the invitation acceptance link to share with the invitee
3. **Given** I am logged in as a franchisor admin **When** I access the Invitation Management page **Then** I can only create franchisee invitations for my own brand **And** I can only see invitations for my own brand
4. **Given** I am logged in as a franchisee **When** I try to access the Invitation Management page **Then** I am not able to see or access invitation management features
5. **Given** I fill out the invitation form with an invalid email or missing fields **When** I click Send **Then** I see clear validation error messages explaining what needs to be corrected

## Dev Notes

### Architecture Patterns to Follow

**API Route (from architecture.md — API Endpoints):**
```
POST   /api/invitations              (Katalyst admin or franchisor creates invitation)
```

**RBAC Enforcement — Route-Level Middleware:**
- This story introduces the first `requireAuth` and `requireRole` middleware helpers
- These will be reused across all protected routes in later stories (Story 1.5 formalizes the full RBAC middleware)
- For this story, implement lightweight versions directly in the route module:

```typescript
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

function requireRole(...roles: Array<"franchisee" | "franchisor" | "katalyst_admin">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}
```

**Token Generation:**
```typescript
import crypto from "crypto";

function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}
```

**Invitation Creation Request Body:**
```typescript
{
  email: string;      // required, valid email format
  role: "franchisee" | "franchisor" | "katalyst_admin";  // required
  brand_id?: string;  // required for franchisee/franchisor roles; must reference existing brand
}
```

**Invitation Creation Response:**
```typescript
{
  id: string;
  email: string;
  role: string;
  brandId: string | null;
  token: string;
  expiresAt: string;        // ISO 8601 timestamp
  acceptedAt: string | null;
  createdBy: string;
  createdAt: string;
  acceptUrl: string;         // full URL for the invitation acceptance page
}
```

**Invitation List Response (GET /api/invitations):**
```typescript
{
  id: string;
  email: string;
  role: string;
  brandId: string | null;
  token: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdBy: string;
  createdAt: string;
  status: "pending" | "accepted" | "expired";  // computed from acceptedAt and expiresAt
}[]
```

**Validation Rules (Zod):**
```typescript
import { z } from "zod";

const createInvitationSchema = z.object({
  email: z.string().email("Invalid email format"),
  role: z.enum(["franchisee", "franchisor", "katalyst_admin"]),
  brand_id: z.string().optional(),
}).refine(
  (data) => {
    // brand_id required for franchisee and franchisor roles
    if (data.role === "franchisee" || data.role === "franchisor") {
      return !!data.brand_id;
    }
    return true;
  },
  { message: "brand_id is required for franchisee and franchisor roles", path: ["brand_id"] }
);
```

**Franchisor Admin Scoping Logic:**
- Franchisor admins can ONLY create invitations with `role: "franchisee"`
- Franchisor admins can ONLY create invitations with `brand_id` matching their own `req.user.brandId`
- Katalyst admins have no brand restrictions — can invite any role for any brand

**Storage Interface Additions:**
- Add `getInvitations()` method to `IStorage` — returns all invitations (for Katalyst admin listing)
- Add `getInvitationsByBrand(brandId: string)` method — returns invitations for a specific brand (for franchisor admin listing)
- The existing `createInvitation(invitation)` method in storage is already implemented and sufficient

**Database Naming (from architecture.md — Naming Patterns):**
- Tables: lowercase plural — `invitations`
- Columns: snake_case — `brand_id`, `created_at`, `created_by`
- API request bodies: snake_case to match DB convention
- API response bodies: camelCase (matching Drizzle ORM output)

**Error Response Format (from architecture.md — API Design):**
```typescript
{
  message: string;       // human-readable error description
  errors?: Array<{       // optional field-level validation errors
    path: string[];
    message: string;
  }>;
}
```

### UI/UX Deliverables

- **Invitation Management Page** (`/admin/invitations` route):
  - Table showing all invitations: email, role, brand name, status badge (pending/accepted/expired), expiry date
  - "New Invitation" form: email input, role selector (franchisee/franchisor/katalyst_admin), brand selector (populated from brands table), Send button
  - "Copy Link" action button on each pending invitation row
  - Toast notification on successful invitation creation
  - Toast notification on successful link copy
- **Navigation**: Sidebar menu item "Invitations" visible to katalyst_admin and franchisor roles only
- **Empty state**: Message when no invitations exist yet ("No invitations yet. Create one to get started.")
- **Loading state**: Skeleton/spinner while invitation list loads
- **Error state**: Error message if invitation list fails to load
- **Role-based visibility**: Franchisor admins see only their brand's invitations; brand selector is hidden/pre-filled for franchisor admins; role selector limited to "franchisee" for franchisor admins

### Anti-Patterns & Hard Constraints

- Do NOT send emails in this story — just create the invitation record and return the acceptance URL. Email delivery is a future concern
- Do NOT implement the invitation acceptance flow — that is Story 1.3
- Do NOT put business logic in route handlers — use the storage interface
- Do NOT implement full RBAC middleware as separate files yet — that is Story 1.5. Use inline helpers for now
- Do NOT allow franchisor admins to create invitations for roles other than `franchisee`
- Do NOT allow franchisor admins to create invitations for brands other than their own
- Do NOT expose the raw token in list responses to non-admin users (for this story, only admins and franchisor admins can list, so it's fine)
- Do NOT skip brand_id validation — verify the brand exists in the database before creating the invitation

### Gotchas & Integration Warnings

- **Existing schema is ready**: The `invitations` table and `insertInvitationSchema` are already defined in `shared/schema.ts` from Story 1.1 — do NOT recreate them
- **Existing storage methods**: `createInvitation`, `getInvitationByToken`, and `markInvitationAccepted` are already implemented in `server/storage.ts` — add new listing methods without modifying existing ones
- **Token in insertInvitationSchema**: The `insertInvitationSchema` does NOT omit `token` — the route handler must generate the token and include it in the insert payload
- **expiresAt in insertInvitationSchema**: The `insertInvitationSchema` does NOT omit `expiresAt` — the route handler must compute `new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)` and include it
- **createdBy in insertInvitationSchema**: The `insertInvitationSchema` does NOT omit `createdBy` — the route handler must set this to `req.user.id`
- **acceptUrl construction**: Use `${req.protocol}://${req.get("host")}/invite/${token}` to build the acceptance URL. The `/invite/:token` frontend route will be built in Story 1.3
- **Dev login bypass**: The dev login from Story 1.1 creates a `katalyst_admin` user, so this story's routes can be tested using the dev login flow without Google OAuth credentials
- **brand_id validation**: When the request includes a `brand_id`, query the `brands` table to confirm it exists before creating the invitation. Return 400 if the brand doesn't exist
- **Duplicate invitation handling**: If an invitation already exists for the same email + role + brand_id and is still pending (not accepted, not expired), return the existing invitation rather than creating a duplicate. This prevents spam
- **Express.User type**: The `Express.User` interface is already augmented in `server/auth.ts` — `req.user` has `id`, `email`, `role`, `brandId`, etc.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `server/routes.ts` | ALREADY DONE | POST/GET invitation routes already implemented |
| `server/storage.ts` | ALREADY DONE | Listing methods already implemented |
| `shared/schema.ts` | NO CHANGE | Schema already has invitations table and types from Story 1.1 |
| `client/src/pages/invitations.tsx` | CREATE | Invitation Management page with create form and invitation table |
| `client/src/App.tsx` | MODIFY | Add /admin/invitations route |
| `client/src/components/app-sidebar.tsx` | MODIFY | Add Invitations nav item for admin/franchisor roles |

### Dependencies & Environment Variables

**No new packages needed** — all dependencies are already installed:
- `crypto` — Node.js built-in for secure token generation
- `zod` — already installed for validation
- `drizzle-orm` — already installed for database operations

**No new environment variables needed** — all auth/session config is already in place from Story 1.1.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#API Endpoints] — POST /api/invitations route definition
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision 3: Authentication Model] — Invitation-based auth for franchisees
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision 4: Authorization (RBAC) Pattern] — Three-layer RBAC, requireAuth, requireRole
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns] — API and database naming conventions
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2] — Original acceptance criteria
- [Source: _bmad-output/planning-artifacts/prd.md#FR28] — Katalyst admin can create franchisee invitations
- [Source: _bmad-output/planning-artifacts/prd.md#FR30] — Katalyst admin can create franchisor admin invitations
- [Source: _bmad-output/planning-artifacts/prd.md#NFR11] — Invitation tokens are single-use, time-limited, cryptographically secure

## Dev Agent Record

### Agent Model Used

Claude 4.6 Opus (Replit Agent)

### Completion Notes

Implemented invitation creation and listing API endpoints for Story 1.2:

- **POST /api/invitations**: Creates invitations with cryptographically secure tokens (crypto.randomBytes, base64url), 7-day expiry, Zod validation, brand existence check, and duplicate prevention (returns existing pending invitation for same email+role+brand_id)
- **GET /api/invitations**: Lists invitations with computed status (pending/accepted/expired). Katalyst admins see all; franchisor admins see only their brand's invitations
- **RBAC**: Inline `requireAuth` and `requireRole` middleware. Katalyst admins can invite any role; franchisor admins can only invite franchisees to their own brand; franchisees get 403
- **Storage**: Added `getInvitations()`, `getInvitationsByBrand(brandId)`, and `getPendingInvitation(email, role, brandId)` to IStorage/DatabaseStorage
- No schema changes needed — existing invitations table from Story 1.1 was sufficient
- No new dependencies or environment variables required

### File List

| File | Action |
|------|--------|
| `server/routes.ts` | MODIFIED — added invitation routes, requireAuth/requireRole middleware, Zod validation, token generation |
| `server/storage.ts` | MODIFIED — added getInvitations(), getInvitationsByBrand(), getPendingInvitation() to interface and implementation |
