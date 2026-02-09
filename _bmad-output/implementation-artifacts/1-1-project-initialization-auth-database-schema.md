# Story 1.1: Project Initialization & Auth Database Schema

Status: ready-for-dev

## Story

As a developer,
I want the project foundation set up with database tables for users, sessions, brands, and invitations, and Google OAuth authentication for Katalyst admin users (restricted to @katgroupinc.com domain),
So that Katalyst team members can log in immediately via their Google Workspace accounts and the data layer is ready for all user management features.

## Acceptance Criteria

1. **Given** the Replit full-stack JS template is in place **When** the database schema is pushed **Then** the following tables exist:
   - `users` (id, email, display_name, profile_image_url, role, brand_id, onboarding_completed, preferred_tier, created_at)
   - `sessions` (connect-pg-simple session store — auto-managed via `createTableIfMissing`, not defined in Drizzle)
   - `brands` (id, name, slug, created_at) — minimal stub for FK reference; full brand config comes in Epic 2
   - `invitations` (id, email, role, brand_id, token, expires_at, accepted_at, created_by, created_at) — for future invitation-based franchisee/franchisor onboarding
2. **Given** the schema is defined **When** Drizzle schemas are created **Then** all insert schemas, insert types, and select types for users, brands, and invitations are exported from `shared/schema.ts`
3. **Given** the auth layer is configured **When** a Katalyst team member visits the app **Then** they can authenticate via Google OAuth using their @katgroupinc.com Google Workspace account — the OAuth callback verifies the email domain and rejects non-@katgroupinc.com accounts with a clear error
4. **Given** the Express app is running **When** session middleware initializes **Then** sessions are stored in PostgreSQL via connect-pg-simple, and the app exposes `/api/auth/google` (initiate login), `/api/auth/google/callback` (OAuth callback), `/api/auth/logout` (destroy session), and `GET /api/auth/me` (current user)
5. **Given** a @katgroupinc.com user logs in via Google OAuth for the first time **When** their account is created **Then** they are assigned the `katalyst_admin` role automatically, and their display name and profile image are populated from Google profile data

## Dev Notes

### Architecture Patterns to Follow

**Authentication Model Change (deviation from original architecture.md — Decision 3):**
- Original plan: Custom Passport.js LocalStrategy with email/password and bcrypt
- New approach: Google OAuth via `passport-google-oauth20` for Katalyst admin users
- Domain restriction: Only @katgroupinc.com Google Workspace emails are allowed to log in
- No custom login forms needed — just a "Sign in with Google" button
- No password hashing, no seed script — admin users self-register via Google OAuth
- Franchisee/franchisor invitation-based onboarding will be built in Stories 1.2-1.4 as a separate auth flow (potentially email/password via invitation link, or also OAuth — to be decided in those stories)

**Passport.js Google OAuth Strategy:**
```typescript
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
  const email = profile.emails?.[0]?.value;
  // Double-check: verify both the hosted domain (hd) claim AND email suffix
  const hd = (profile as any)._json?.hd;
  if (hd !== "katgroupinc.com" || !email?.endsWith("@katgroupinc.com")) {
    return done(null, false, { message: "Only @katgroupinc.com accounts are allowed" });
  }
  // Upsert user in database with katalyst_admin role
}));
```

**Google OAuth `hd` parameter (hosted domain):**
- When initiating the Google OAuth flow, pass `hd: "katgroupinc.com"` in the strategy options to hint Google to show only @katgroupinc.com accounts in the account chooser
- In the callback, verify BOTH the `hd` claim from Google's response AND the email suffix — the `hd` hint is advisory (users can bypass it), so the callback must enforce it
- This is a two-layer domain check: UI hint + server-side enforcement

**Passport serialize/deserialize:**
- `serializeUser`: Store `user.id` in the session
- `deserializeUser`: Load full user record from database by `user.id`, pass to `req.user`
- `Express.User` interface must be augmented with app fields (id, email, role, brandId, displayName, profileImageUrl, onboardingCompleted, preferredTier)

**Frontend login UX:**
- The frontend shows a "Sign in with Google" button that links to `/api/auth/google`
- No custom login form — the button navigates to the Express route which redirects to Google
- On successful login, redirect to the app home page
- On domain rejection, redirect to a login page with an error query param (e.g., `/?error=domain_restricted`) and display: "Access is restricted to @katgroupinc.com accounts"
- Use the `useAuth()` pattern: a React hook that calls `GET /api/auth/me` to check auth state

**Database Naming (from architecture.md — Naming Patterns):**
- Tables: lowercase plural — `users`, `brands`, `invitations`
- Columns: snake_case — `brand_id`, `created_at`, `profile_image_url`
- Foreign keys: `{referenced_table_singular}_id` — `brand_id`, `user_id`
- Indexes: `idx_{table}_{column}` — `idx_users_email`, `idx_invitations_token`, `idx_invitations_email`

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
- Storage methods: `getUser(id)`, `getUserByEmail(email)`, `upsertUserFromGoogle(profile)`, `getInvitationByToken(token)`, `createInvitation(invitation)`, `markInvitationAccepted(id)`, `getBrand(id)`, `createBrand(brand)`

**Session Configuration:**
- connect-pg-simple with `createTableIfMissing: true` — auto-creates session table
- Session secret from `SESSION_SECRET` env var
- Cookie config: httpOnly, secure in production, sameSite 'lax', maxAge 24 hours

### Anti-Patterns & Hard Constraints

- Do NOT build custom login/signup forms for Katalyst admin users — Google OAuth only
- Do NOT use bcrypt or password hashing for this story — Google OAuth handles authentication
- Do NOT create a seed script for admin users — they self-register via Google OAuth
- Do NOT allow non-@katgroupinc.com email addresses to authenticate — enforce domain check in OAuth callback
- Do NOT store Google OAuth tokens (access_token, refresh_token) — only store user profile data (email, name, image)
- Do NOT put business logic in route handlers — use storage interface
- Do NOT use MemStorage — must use DatabaseStorage with real PostgreSQL
- Do NOT modify `server/index.ts`, `server/vite.ts`, `server/static.ts` — template files
- Do NOT modify `vite.config.ts` or `drizzle.config.ts` — template files
- Do NOT create a separate `shared/types.ts` — app types stay in `shared/schema.ts`

### Gotchas & Integration Warnings

- **Google Cloud Console setup required**: A Google Cloud project with OAuth 2.0 credentials (Client ID + Client Secret) must be created:
  - Create OAuth 2.0 Client ID (Web application type)
  - Set **Authorized JavaScript origins** to `https://<replit-domain>`
  - Set **Authorized redirect URIs** to `https://<replit-domain>/api/auth/google/callback`
  - On the OAuth consent screen, set the app to **Internal** (Google Workspace only) — this restricts the consent screen to @katgroupinc.com users at the Google level, providing a first layer of defense before the server-side domain check
  - If the app needs to be "External" (e.g., for testing), the server-side `hd` + email domain check is the enforcing layer
- **Users table no longer has password_hash**: The `users` table schema drops `password_hash` since Katalyst admins use OAuth
- **Schema evolution note for franchisee auth (Stories 1.2-1.4)**: The franchisee/franchisor authentication approach is TBD in later stories. Options include: (a) adding a nullable `password_hash` column to the existing `users` table for invitation-based email/password auth, or (b) using Google OAuth for all user types. The `invitations` table is defined now for schema completeness, but the actual auth flow for non-Katalyst users will be decided when those stories are contexted. The current schema is designed to be additive — no breaking changes needed either way
- **Profile image URL**: Google provides a profile image URL via the OAuth profile — store it for avatar display
- **User upsert pattern**: On each Google login, upsert the user (update display_name and profile_image_url from Google, keep role and app-specific fields)
- `brands` table is a minimal stub in this story — full brand configuration comes in Epic 2
- `invitations` table is defined here for schema completeness but not actively used until Stories 1.2-1.3
- The existing custom `server/auth.ts` (Passport LocalStrategy), `server/seed.ts`, and related code from the previous implementation attempt must be replaced with the new Google OAuth approach
- **Express.User type augmentation**: Passport's `Express.User` interface must be augmented to include app-specific fields (role, brandId, etc.) for TypeScript support

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `shared/schema.ts` | REPLACE | users (without password_hash, with profile_image_url), brands, invitations tables + all types |
| `server/storage.ts` | REPLACE | IStorage interface + DatabaseStorage with upsertUserFromGoogle |
| `server/db.ts` | KEEP | Drizzle client initialization — already correct |
| `server/auth.ts` | REPLACE | Google OAuth strategy via passport-google-oauth20, domain restriction, serialize/deserialize |
| `server/routes.ts` | REPLACE | Session middleware + Google OAuth routes (/api/auth/google, callback, logout, me) |
| `server/seed.ts` | REMOVE | No longer needed — admin bootstraps via Google OAuth |

### Dependencies & Environment Variables

**Packages to install:**
- `passport-google-oauth20` — Google OAuth 2.0 strategy for Passport.js
- `@types/passport-google-oauth20` — TypeScript types

**Packages no longer needed (can be removed):**
- `bcrypt`, `@types/bcrypt` — no password hashing needed
- `passport-local`, `@types/passport-local` — no LocalStrategy needed

**Packages already in template (DO NOT reinstall):**
- `express-session`, `@types/express-session` — session middleware
- `passport`, `@types/passport` — authentication framework
- `connect-pg-simple`, `@types/connect-pg-simple` — PostgreSQL session store
- `drizzle-orm`, `drizzle-kit`, `drizzle-zod` — ORM
- `pg`, `@types/pg` — PostgreSQL client
- `zod` — validation

**Environment variables (secrets):**
- `DATABASE_URL` — auto-provided by Replit when PostgreSQL is created
- `SESSION_SECRET` — for session signing
- `GOOGLE_CLIENT_ID` — from Google Cloud Console OAuth 2.0 credentials
- `GOOGLE_CLIENT_SECRET` — from Google Cloud Console OAuth 2.0 credentials
- ~~`ADMIN_EMAIL`~~ — no longer needed (removed)
- ~~`ADMIN_PASSWORD`~~ — no longer needed (removed)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Decision 1: Data Model Design] — Table definitions, entity model
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision 3: Authentication Model] — Original auth design (now modified to use Google OAuth for Katalyst admin users)
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision 4: Authorization (RBAC) Pattern] — Three-layer RBAC (context for later stories)
- [Source: _bmad-output/planning-artifacts/architecture.md#Schema Patterns] — Insert/update schema conventions
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns] — Database and code naming conventions
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns] — Project file organization
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1] — Original acceptance criteria and epic context
- [Source: Google OAuth 2.0 / passport-google-oauth20] — Google OAuth strategy for Passport.js

## Dev Agent Record

### Agent Model Used

Claude 4.6 Opus (Replit Agent)

### Completion Notes

### File List
