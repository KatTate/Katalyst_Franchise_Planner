# Story 1.2: Invitation Creation by Admin

Status: review

## Story

As a Katalyst admin,
I want to create invitations for franchisees and franchisor admins,
So that I can onboard new users to the platform in a controlled way.

## Acceptance Criteria

1. **Given** I am logged in as a Katalyst admin **When** I submit POST `/api/invitations` with email, role, and brand_id **Then** a new invitation is created with a cryptographically secure token, expiring in 7 days **And** the API returns the invitation details including the acceptance URL
2. **Given** the invitation is created **When** I inspect the token **Then** it is cryptographically secure (generated via `crypto.randomBytes`) and URL-safe (base64url-encoded)
3. **Given** the invitation is created **When** another request tries to accept the same token after it has already been accepted **Then** the token cannot be reused (single-use enforcement via `accepted_at` column)
4. **Given** I am not authenticated **When** I submit POST `/api/invitations` **Then** I receive 401 Unauthorized
5. **Given** I am logged in as a franchisee **When** I submit POST `/api/invitations` **Then** I receive 403 Forbidden
6. **Given** I am logged in as a franchisor admin **When** I submit POST `/api/invitations` with role `franchisee` and my own brand_id **Then** the invitation is created successfully (franchisor admins can invite franchisees to their own brand only)
7. **Given** I am logged in as a franchisor admin **When** I submit POST `/api/invitations` with a brand_id that is NOT my own brand **Then** I receive 403 Forbidden
8. **Given** I am logged in as a franchisor admin **When** I submit POST `/api/invitations` with role `franchisor` or `katalyst_admin` **Then** I receive 403 Forbidden (franchisor admins can only invite franchisees)
9. **Given** I submit POST `/api/invitations` with an invalid email format or missing required fields **Then** I receive 400 Bad Request with a clear validation error message
10. **Given** I am logged in as a Katalyst admin **When** I submit POST `/api/invitations` with role `franchisee` or `franchisor` **Then** the `brand_id` field is required and validated to reference an existing brand
11. **Given** I am logged in as a Katalyst admin **When** I submit GET `/api/invitations` **Then** I receive a list of all invitations with their status (pending, accepted, expired)

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
| `server/routes.ts` | MODIFY | Add POST `/api/invitations` and GET `/api/invitations` routes with requireAuth/requireRole middleware, validation, token generation, and franchisor scoping logic |
| `server/storage.ts` | MODIFY | Add `getInvitations()` and `getInvitationsByBrand(brandId)` to IStorage interface and DatabaseStorage implementation |
| `shared/schema.ts` | NO CHANGE | Schema already has invitations table and types from Story 1.1 |

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
