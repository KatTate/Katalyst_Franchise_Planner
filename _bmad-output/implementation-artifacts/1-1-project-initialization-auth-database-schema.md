# Story 1.1: Project Initialization & Auth Database Schema

Status: in-progress

## Story

As a developer,
I want the project foundation set up with database tables for users, sessions, and invitations,
So that all authentication and user management features have the data layer they need.

## Acceptance Criteria

1. **Given** the Replit full-stack JS template is in place **When** the database schema is pushed **Then** the following tables exist:
   - `users` (id, email, password_hash, role, brand_id, display_name, onboarding_completed, preferred_tier, created_at)
   - `sessions` (connect-pg-simple session store — auto-managed, not defined in Drizzle)
   - `invitations` (id, email, role, brand_id, token, expires_at, accepted_at, created_by, created_at)
2. **Given** the schema is defined **When** Drizzle insert schemas are created **Then** `insertUserSchema`, `InsertUser`, `User`, `insertInvitationSchema`, `InsertInvitation`, `Invitation`, `insertBrandSchema`, `InsertBrand`, and `Brand` types are all exported from `shared/schema.ts`
3. **Given** the auth layer is configured **When** a user submits email and password **Then** Passport.js authenticates via LocalStrategy (email lookup + bcrypt compare) with session serialization by user.id
4. **Given** the Express app is running **When** session middleware initializes **Then** sessions are stored in PostgreSQL via connect-pg-simple with `createTableIfMissing: true`, httpOnly cookies, secure in production, sameSite 'lax'
5. **Given** the environment variables `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set **When** the server starts **Then** a seed script creates the initial Katalyst admin account (role `katalyst_admin`, bcrypt cost factor 12) idempotently — skipping if the user already exists or env vars are not set

## Dev Notes

### Architecture Patterns to Follow

**Database Naming (from architecture.md — Naming Patterns):**
- Tables: lowercase plural — `users`, `brands`, `invitations`
- Columns: snake_case — `password_hash`, `brand_id`, `created_at`
- Foreign keys: `{referenced_table_singular}_id` — `brand_id`, `user_id`
- Indexes: `idx_{table}_{column}` — `idx_users_email`, `idx_users_brand_id`, `idx_invitations_token`, `idx_invitations_email`

**Schema Pattern (from architecture.md — Schema Patterns):**
```typescript
export const users = pgTable("users", { ... });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
```

**Storage Pattern (from architecture.md — Decision 1):**
- All DB operations go through `IStorage` interface — never raw Drizzle in route handlers
- `DatabaseStorage` class implements `IStorage` using Drizzle ORM queries
- Storage methods: `getUser(id)`, `getUserByEmail(email)`, `createUser(user)`, `getInvitationByToken(token)`, `createInvitation(invitation)`, `markInvitationAccepted(id)`, `getBrand(id)`, `createBrand(brand)`

**Session Configuration (from architecture.md — Decision 3):**
- connect-pg-simple auto-creates its own `session` table — do NOT define it in Drizzle schema
- Session secret from `SESSION_SECRET` env var
- Cookie config: httpOnly, secure in production, sameSite 'lax', maxAge 24 hours

**Password Hashing (from architecture.md — Decision 3):**
- bcrypt with cost factor 12
- Never store plaintext passwords
- Never log passwords or password hashes

### Anti-Patterns & Hard Constraints

- Do NOT define the session table in Drizzle schema — connect-pg-simple manages it
- Do NOT use `username` field — the app uses `email` for authentication
- Do NOT store passwords as plaintext — always bcrypt hash
- Do NOT put business logic in route handlers — use storage interface
- Do NOT use MemStorage — must use DatabaseStorage with real PostgreSQL
- Do NOT modify `server/index.ts`, `server/vite.ts`, `server/static.ts` — template files
- Do NOT modify `vite.config.ts` or `drizzle.config.ts` — template files
- Do NOT create a separate `shared/types.ts` — all types stay in `shared/schema.ts`

### Gotchas & Integration Warnings

- The template `shared/schema.ts` originally has a basic `users` table with `username` and `password` columns — this must be entirely replaced with `email` and `password_hash`
- The template `server/storage.ts` originally uses MemStorage (in-memory Map) — this must be replaced with DatabaseStorage using Drizzle ORM
- `brands` table is a minimal stub in this story (id, name, slug, created_at) — full brand configuration comes in Epic 2
- `server/db.ts` creates the Drizzle client instance — imported by storage.ts, must check for `DATABASE_URL` env var
- Seed script imports `log` from `server/index.ts` for consistent logging — check that this export exists
- The seed function must be called at server startup (in `registerRoutes`) to run after database is ready

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `shared/schema.ts` | REPLACE | users, brands, invitations tables with indexes + all insert schemas and types |
| `server/storage.ts` | REPLACE | IStorage interface + DatabaseStorage implementation |
| `server/db.ts` | CREATE | Drizzle client initialization using DATABASE_URL with pg.Pool |
| `server/auth.ts` | CREATE | Passport LocalStrategy config, bcrypt helpers, serialize/deserialize, Express.User type augmentation |
| `server/seed.ts` | CREATE | Idempotent admin seed script using ADMIN_EMAIL/ADMIN_PASSWORD env vars |
| `server/routes.ts` | MODIFY | Add express-session with connect-pg-simple, passport.initialize(), passport.session(), call seedAdminUser() |

### Dependencies & Environment Variables

**Packages to install:**
- `bcrypt` — password hashing
- `@types/bcrypt` — TypeScript types for bcrypt

**Packages already in template (DO NOT reinstall):**
- `express-session`, `@types/express-session` — session middleware
- `connect-pg-simple`, `@types/connect-pg-simple` — PostgreSQL session store
- `passport`, `@types/passport` — authentication framework
- `passport-local`, `@types/passport-local` — local strategy
- `drizzle-orm`, `drizzle-kit`, `drizzle-zod` — ORM
- `pg`, `@types/pg` — PostgreSQL client
- `zod` — validation

**Environment variables:**
- `DATABASE_URL` — auto-provided by Replit when PostgreSQL is created
- `SESSION_SECRET` — for session signing (set as secret)
- `ADMIN_EMAIL` — for seed script (set as env var)
- `ADMIN_PASSWORD` — for seed script (set as secret)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Decision 1: Data Model Design] — Table definitions, entity model, JSONB patterns
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision 3: Authentication Model] — Invitation-only, session-based auth, bcrypt cost factor
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision 4: Authorization (RBAC) Pattern] — Three-layer RBAC (context for later stories)
- [Source: _bmad-output/planning-artifacts/architecture.md#Schema Patterns] — Insert/update schema conventions
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns] — Database and code naming conventions
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns] — Project file organization
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1] — Acceptance criteria and epic context

## Dev Agent Record

### Agent Model Used

Claude 4.6 Opus (Replit Agent)

### Completion Notes

### File List
