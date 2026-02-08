# Story 1.1: Project Initialization & Auth Database Schema

Status: ready-for-dev

## Story

As a developer,
I want the project foundation set up with database tables for users, sessions, and invitations,
So that all authentication and user management features have the data layer they need.

## Acceptance Criteria

1. **Given** the Replit full-stack JS template is in place **When** the database schema is pushed **Then** the following tables exist:
   - `users` (id, email, password_hash, role, brand_id, display_name, onboarding_completed, preferred_tier, created_at)
   - `sessions` (connect-pg-simple session store — auto-managed, not defined in Drizzle)
   - `invitations` (id, email, role, brand_id, token, expires_at, accepted_at, created_by)
2. Drizzle insert schemas and types are exported from `shared/schema.ts`
3. Passport.js is configured with local strategy (email + password) and session serialization
4. The Express app uses session middleware backed by PostgreSQL via connect-pg-simple
5. A seed script creates the initial Katalyst admin account (email from environment variable `ADMIN_EMAIL`, password from `ADMIN_PASSWORD`) for platform bootstrap — this is the entry point for the entire invitation chain

## Tasks / Subtasks

- [ ] Task 1: Replace existing `shared/schema.ts` with full auth schema (AC: 1, 2)
  - [ ] 1.1 Replace template `users` table: id (uuid, PK, gen_random_uuid), email (text, unique, not null), password_hash (text, not null), role (text, not null — 'franchisee' | 'franchisor' | 'katalyst_admin'), brand_id (text, nullable FK → brands), display_name (text, nullable), onboarding_completed (boolean, default false), preferred_tier (text, nullable — 'story' | 'normal' | 'expert'), created_at (timestamp, default now)
  - [ ] 1.2 Create `brands` table stub: id (uuid, PK), name (text, not null), slug (text, unique, not null), created_at (timestamp) — minimal for FK reference; full brand config comes in Epic 2
  - [ ] 1.3 Create `invitations` table: id (uuid, PK), email (text, not null), role (text, not null), brand_id (text, FK → brands), token (text, unique, not null), expires_at (timestamp, not null), accepted_at (timestamp, nullable), created_by (text, FK → users), created_at (timestamp, default now)
  - [ ] 1.4 Export insertUserSchema (omit id, created_at), InsertUser, User types
  - [ ] 1.5 Export insertInvitationSchema (omit id, created_at, accepted_at), InsertInvitation, Invitation types
  - [ ] 1.6 Export insertBrandSchema (omit id, created_at), InsertBrand, Brand types
  - [ ] 1.7 Add database indexes: idx_users_email, idx_users_brand_id, idx_invitations_token, idx_invitations_email

- [ ] Task 2: Replace `server/storage.ts` with DatabaseStorage (AC: 1, 2)
  - [ ] 2.1 Update IStorage interface: getUser(id), getUserByEmail(email), createUser(user), getInvitationByToken(token), createInvitation(invitation), markInvitationAccepted(id)
  - [ ] 2.2 Implement DatabaseStorage class using Drizzle ORM (import `db` from drizzle setup)
  - [ ] 2.3 Create `server/db.ts` — Drizzle client initialization using DATABASE_URL
  - [ ] 2.4 Replace MemStorage with DatabaseStorage as the exported `storage` instance

- [ ] Task 3: Configure Passport.js + session middleware (AC: 3, 4)
  - [ ] 3.1 Create `server/auth.ts` — configure Passport with LocalStrategy (email lookup, bcrypt compare), serialize/deserialize by user.id
  - [ ] 3.2 In `server/routes.ts`, add express-session middleware with connect-pg-simple store (use DATABASE_URL, session table auto-created), SESSION_SECRET from env
  - [ ] 3.3 Initialize passport and passport.session() middleware
  - [ ] 3.4 Add session cookie config: httpOnly, secure in production, sameSite 'lax', maxAge configurable
  - [ ] 3.5 Install bcrypt package for password hashing

- [ ] Task 4: Create seed script (AC: 5)
  - [ ] 4.1 Create `server/seed.ts` — reads ADMIN_EMAIL and ADMIN_PASSWORD from env, hashes password with bcrypt cost factor 12, upserts katalyst_admin user
  - [ ] 4.2 Add idempotency: if admin user with that email already exists, skip creation
  - [ ] 4.3 Call seed function from server startup (after db:push, before listen) or as standalone script

- [ ] Task 5: Database push and verification
  - [ ] 5.1 Create PostgreSQL database if not exists
  - [ ] 5.2 Run `npm run db:push` to create tables
  - [ ] 5.3 Verify tables exist via SQL query
  - [ ] 5.4 Verify seed admin is created

## Dev Notes

### Critical Architecture Patterns to Follow

**Database Naming (from architecture.md — Implementation Patterns):**
- Tables: lowercase plural — `users`, `brands`, `invitations`
- Columns: snake_case — `password_hash`, `brand_id`, `created_at`
- Foreign keys: `{referenced_table_singular}_id` — `brand_id`, `user_id`
- Indexes: `idx_{table}_{column}` — `idx_users_email`, `idx_invitations_token`

**Schema Pattern (from architecture.md — Schema Patterns):**
```typescript
export const users = pgTable("users", { ... });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
```

**Storage Pattern:**
- All DB operations go through IStorage — never raw Drizzle in route handlers
- Storage methods receive user context for RBAC scoping (relevant for later stories)
- Use typed methods matching the interface

**Number Storage:**
- Currency as cents (integers), rates as decimals — but not relevant to this story yet

**Session Configuration:**
- connect-pg-simple auto-creates its own `session` table — do NOT define it in Drizzle schema
- The session table is managed by the connect-pg-simple package itself
- Session secret from `SESSION_SECRET` env var (already exists in secrets)

**Password Hashing:**
- bcrypt with cost factor 12
- Never store plaintext passwords
- Never log passwords or password hashes

### Existing Template Code to Replace

The current `shared/schema.ts` has a basic `users` table with `username` and `password` columns. This MUST be entirely replaced — the new schema uses `email` instead of `username` and `password_hash` instead of `password`.

The current `server/storage.ts` uses MemStorage (in-memory Map). This MUST be replaced with DatabaseStorage using Drizzle ORM queries.

The current `server/routes.ts` is nearly empty (just a static file route). Session and passport middleware should be added here.

The current `server/index.ts` MUST NOT be modified — it's a template file.

### File Changes Summary

| File | Action | Notes |
|------|--------|-------|
| `shared/schema.ts` | REPLACE | New users, brands, invitations tables |
| `server/storage.ts` | REPLACE | DatabaseStorage with Drizzle |
| `server/db.ts` | CREATE | Drizzle client setup |
| `server/auth.ts` | CREATE | Passport config + bcrypt |
| `server/seed.ts` | CREATE | Admin seed script |
| `server/routes.ts` | MODIFY | Add session + passport middleware |

### Dependencies to Install

- `bcrypt` — password hashing (npm package)
- `@types/bcrypt` — TypeScript types for bcrypt

Packages already in template (DO NOT reinstall):
- `express-session`, `@types/express-session` — session middleware
- `connect-pg-simple`, `@types/connect-pg-simple` — PostgreSQL session store
- `passport`, `@types/passport` — authentication framework
- `passport-local`, `@types/passport-local` — local strategy
- `drizzle-orm`, `drizzle-kit`, `drizzle-zod` — ORM
- `pg` — PostgreSQL client
- `zod` — validation

### Environment Variables Needed

- `DATABASE_URL` — auto-provided by Replit when PostgreSQL is created
- `SESSION_SECRET` — already exists in Replit secrets
- `ADMIN_EMAIL` — needed for seed script (set as env var)
- `ADMIN_PASSWORD` — needed for seed script (set as secret)

### Anti-Patterns to Avoid

- Do NOT define the session table in Drizzle schema — connect-pg-simple manages it
- Do NOT use `username` field — the app uses `email` for authentication
- Do NOT store passwords as plaintext — always bcrypt hash
- Do NOT put business logic in route handlers
- Do NOT use MemStorage — must use DatabaseStorage with real PostgreSQL
- Do NOT modify `server/index.ts`, `server/vite.ts`, `server/static.ts` — template files
- Do NOT modify `vite.config.ts` or `drizzle.config.ts` — template files

### Project Structure Notes

- `shared/schema.ts` is the single source of truth for all Drizzle tables — never split across files
- `server/db.ts` creates the Drizzle client instance — imported by storage.ts
- `server/auth.ts` configures Passport — imported by routes.ts
- `server/seed.ts` is called at startup — imported by routes.ts or index entry point
- Route modules pattern: `server/routes/*.ts` files will come in later stories — for now routes.ts handles middleware setup

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Decision 1: Data Model Design] — Table definitions and column specs
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision 3: Authentication Model] — Invitation-only, session-based auth
- [Source: _bmad-output/planning-artifacts/architecture.md#Schema Patterns] — Insert/update schema conventions
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns] — Database and code naming conventions
- [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns — Authentication Flow] — Session, Passport, login/register flow
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1] — Acceptance criteria

## Dev Agent Record

### Agent Model Used

Claude 4.6 Opus (Replit Agent)

### Debug Log References

### Completion Notes List

### File List
