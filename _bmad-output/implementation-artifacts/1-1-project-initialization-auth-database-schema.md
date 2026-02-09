# Story 1.1: Project Initialization & Auth Database Schema

Status: ready-for-dev

## Story

As a developer,
I want the project foundation set up with database tables for users, sessions, brands, and invitations, and authentication powered by Replit Auth (supporting Google, GitHub, and other OAuth providers),
So that Katalyst admin users can log in immediately via OAuth and the data layer is ready for all user management features.

## Acceptance Criteria

1. **Given** the Replit full-stack JS template is in place **When** the database schema is pushed **Then** the following tables exist:
   - `users` — Replit Auth managed table extended with app columns: `role` ('franchisee' | 'franchisor' | 'katalyst_admin'), `brand_id` (nullable FK to brands), `onboarding_completed` (boolean), `preferred_tier` (nullable)
   - `sessions` — Replit Auth managed session store (auto-created, not defined manually)
   - `brands` (id, name, slug, created_at) — minimal stub for FK reference; full brand config comes in Epic 2
   - `invitations` (id, email, role, brand_id, token, expires_at, accepted_at, created_by, created_at) — for future invitation-based franchisee/franchisor onboarding
2. **Given** the schema is defined **When** Drizzle schemas are created **Then** all insert schemas, insert types, and select types for users, brands, and invitations are exported from `shared/schema.ts`
3. **Given** Replit Auth is installed **When** a Katalyst admin visits the app **Then** they can authenticate via Google OAuth (or other supported providers) without any custom login form — authentication is handled entirely by Replit Auth's OpenID Connect flow
4. **Given** the auth module is wired up **When** the Express app starts **Then** session middleware and auth routes (`/api/login`, `/api/logout`, `/api/auth/user`) are registered, and sessions are stored in PostgreSQL
5. **Given** a user logs in via Replit Auth for the first time **When** they have no existing role **Then** they are assigned the `katalyst_admin` role by default (first users are platform admins; invitation-based role assignment comes in later stories)

## Dev Notes

### Architecture Patterns to Follow

**Authentication Model Change (deviation from original architecture.md — Decision 3):**
- Original plan: Custom Passport.js LocalStrategy with email/password and bcrypt
- New approach: Replit Auth (OpenID Connect) for Katalyst admin users — no custom auth system needed
- Replit Auth provides: Google, GitHub, X, Apple, and email/password login via OIDC
- The Replit Auth module manages its own users and sessions tables via `server/replit_integrations/auth/`
- Franchisee/franchisor invitation-based onboarding will be built in Stories 1.2-1.4, potentially as a separate flow layered on top

**Database Naming (from architecture.md — Naming Patterns):**
- Tables: lowercase plural — `users`, `brands`, `invitations`
- Columns: snake_case — `brand_id`, `created_at`
- Foreign keys: `{referenced_table_singular}_id` — `brand_id`, `user_id`
- Indexes: `idx_{table}_{column}` — `idx_invitations_token`, `idx_invitations_email`

**Schema Pattern (from architecture.md — Schema Patterns):**
```typescript
export const brands = pgTable("brands", { ... });
export const insertBrandSchema = createInsertSchema(brands).omit({ id: true, createdAt: true });
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type Brand = typeof brands.$inferSelect;
```

**Storage Pattern (from architecture.md — Decision 1):**
- All DB operations go through `IStorage` interface — never raw Drizzle in route handlers
- `DatabaseStorage` class implements `IStorage` using Drizzle ORM queries
- Replit Auth has its own `authStorage` for user upsert — app storage handles app-specific operations (brands, invitations, user role lookups)

**Replit Auth Integration Pattern:**
- Auth module lives at `server/replit_integrations/auth/` — do NOT modify these files
- Auth schema exported from `shared/models/auth.ts` — must be re-exported from `shared/schema.ts`
- Wire up in routes: `setupAuth(app)` then `registerAuthRoutes(app)` BEFORE other routes
- Protected routes use `isAuthenticated` middleware from the auth module
- Frontend uses `useAuth()` hook for auth state — no custom login forms
- User claims available: `sub` (stable user ID), `email`, `first_name`, `last_name`, `profile_image_url`

### Anti-Patterns & Hard Constraints

- Do NOT build custom login/signup forms — Replit Auth handles all authentication UI
- Do NOT modify files in `server/replit_integrations/auth/` — managed by the integration
- Do NOT define the session table in Drizzle schema — Replit Auth manages it
- Do NOT use bcrypt or password hashing — OAuth handles authentication
- Do NOT create a seed script for admin users — first users self-register via OAuth and get assigned katalyst_admin role
- Do NOT put business logic in route handlers — use storage interface
- Do NOT use MemStorage — must use DatabaseStorage with real PostgreSQL
- Do NOT modify `server/index.ts`, `server/vite.ts`, `server/static.ts` — template files
- Do NOT modify `vite.config.ts` or `drizzle.config.ts` — template files
- Do NOT create a separate `shared/types.ts` — app types stay in `shared/schema.ts`

### Gotchas & Integration Warnings

- **Replit Auth users table**: The auth module creates its own `users` table with columns for OIDC claims. App-specific columns (role, brand_id, onboarding_completed, preferred_tier) need to be added to this table schema in `shared/models/auth.ts` or the app needs to extend the user record after auth
- **User ID format**: Replit Auth uses the OIDC `sub` claim as the user ID — this is a string, not a UUID. Ensure FK references to users use the correct type
- **First user bootstrapping**: Without a seed script, the first user who logs in via Replit Auth should be auto-assigned `katalyst_admin` role. Consider: if no users exist yet, the first login creates an admin
- **Schema re-export required**: `shared/schema.ts` MUST include `export * from "./models/auth"` for Replit Auth tables to be included in database migrations
- **Auth route order**: `setupAuth(app)` and `registerAuthRoutes(app)` must be called BEFORE any other route registration in `server/routes.ts`
- `brands` table is a minimal stub in this story — full brand configuration comes in Epic 2
- `invitations` table is defined here for schema completeness but not actively used until Stories 1.2-1.3
- The existing custom `server/auth.ts`, `server/seed.ts`, and `server/db.ts` files from the previous implementation attempt should be replaced/removed in favor of the Replit Auth module

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `shared/schema.ts` | MODIFY | Re-export auth models, add brands + invitations tables with types |
| `shared/models/auth.ts` | CREATED BY INTEGRATION | Replit Auth users + sessions schema — may need app column extensions |
| `server/replit_integrations/auth/*` | CREATED BY INTEGRATION | Auth module (do not modify) |
| `server/storage.ts` | REPLACE | IStorage interface + DatabaseStorage for brands, invitations, user role operations |
| `server/db.ts` | KEEP or REPLACE | Drizzle client — may be superseded by auth module's DB setup |
| `server/routes.ts` | MODIFY | Wire up Replit Auth (setupAuth + registerAuthRoutes), remove old Passport/session setup |
| `server/auth.ts` | REMOVE | Replaced by Replit Auth module |
| `server/seed.ts` | REMOVE | No longer needed — admin bootstraps via OAuth login |
| `client/src/hooks/use-auth.ts` | CREATED BY INTEGRATION | React hook for auth state |
| `client/src/lib/auth-utils.ts` | CREATED BY INTEGRATION | Auth error handling utilities |

### Dependencies & Environment Variables

**Packages to install:**
- None — Replit Auth integration handles its own dependencies

**Packages no longer needed (can be removed):**
- `bcrypt`, `@types/bcrypt` — no password hashing needed
- `passport-local`, `@types/passport-local` — no LocalStrategy needed

**Packages already in template (DO NOT reinstall):**
- `express-session`, `@types/express-session` — session middleware (used by Replit Auth)
- `passport`, `@types/passport` — authentication framework (used by Replit Auth internally)
- `connect-pg-simple`, `@types/connect-pg-simple` — PostgreSQL session store (used by Replit Auth)
- `drizzle-orm`, `drizzle-kit`, `drizzle-zod` — ORM
- `pg`, `@types/pg` — PostgreSQL client
- `zod` — validation

**Environment variables:**
- `DATABASE_URL` — auto-provided by Replit when PostgreSQL is created
- `SESSION_SECRET` — for session signing (auto-provided by Replit Auth, available in dev and prod)
- `REPLIT_DOMAINS` — auto-provided, used by Replit Auth for OIDC callback URLs
- ~~`ADMIN_EMAIL`~~ — no longer needed (removed)
- ~~`ADMIN_PASSWORD`~~ — no longer needed (removed)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Decision 1: Data Model Design] — Table definitions, entity model
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision 3: Authentication Model] — Original auth design (now modified to use Replit Auth for admin users)
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision 4: Authorization (RBAC) Pattern] — Three-layer RBAC (context for later stories)
- [Source: _bmad-output/planning-artifacts/architecture.md#Schema Patterns] — Insert/update schema conventions
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns] — Database and code naming conventions
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns] — Project file organization
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1] — Original acceptance criteria and epic context
- [Source: Replit Auth Blueprint] — OpenID Connect auth module, session management, user claims

## Dev Agent Record

### Agent Model Used

Claude 4.6 Opus (Replit Agent)

### Completion Notes

### File List
