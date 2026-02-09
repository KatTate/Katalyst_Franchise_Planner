# Story 1.4: Login, Logout & Session Management

Status: review

## Story

As a registered user,
I want to log in and maintain my session,
So that I can securely access the platform across visits.

## Acceptance Criteria

1. **Given** I am a Katalyst admin on the login page **When** I click the "Sign in with Google" button and complete the Google OAuth flow with a @katgroupinc.com account **Then** I am redirected to the dashboard **And** I see my display name and profile picture in the sidebar header area
2. **Given** I am on the login page **When** I complete Google OAuth with a non-@katgroupinc.com account (e.g., a personal Gmail) **Then** I see a clear error message on the login page: "Only @katgroupinc.com accounts are authorized" **And** I remain on the login page, not logged in
3. **Given** I am a franchisee or franchisor admin who has already created my account (via invitation acceptance in Story 1.3) **When** I visit the login page **Then** I see an email and password login form **And** I can enter my email and password and click "Sign In" to access the platform
4. **Given** I am on the login page with the email/password form **When** I enter incorrect credentials and click "Sign In" **Then** I see an error message: "Invalid email or password" **And** I remain on the login page
5. **Given** I am logged in **When** I click "Sign Out" in the sidebar **Then** I see a confirmation dialog: "You'll be signed out. Your plan is always saved." **And** upon confirming, I am redirected to the login page **And** I can no longer access any authenticated pages — navigating to a protected URL returns me to the login page
6. **Given** I have been inactive for the configured session timeout period **When** I attempt any action or page navigation **Then** I see a message explaining that my session has expired for security **And** I am redirected to the login page where I can sign in again **And** after signing in, my previously saved plan data is intact (auto-save ensures no data loss)

## Dev Notes

### Architecture Patterns to Follow

**Dual Auth Model (from architecture.md — Decision 3):**
- Google OAuth for Katalyst admin users is already implemented in Story 1.1 via `passport-google-oauth20` strategy in `server/auth.ts`
- This story adds Passport LocalStrategy for franchisee/franchisor email+password login
- Both strategies coexist — Passport supports multiple strategies simultaneously
- Sessions are shared — both auth flows produce the same `Express.User` session object

**Passport LocalStrategy for Email/Password:**
```typescript
// In server/auth.ts — add alongside existing GoogleStrategy
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";

passport.use(new LocalStrategy(
  { usernameField: "email" },
  async (email, password, done) => {
    const user = await storage.getUserByEmail(email);
    if (!user || !user.passwordHash) {
      return done(null, false, { message: "Invalid email or password" });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return done(null, false, { message: "Invalid email or password" });
    }
    // IMPORTANT: Session user shape must match Express.User exactly (including onboardingCompleted, preferredTier)
    return done(null, {
      id: user.id,
      email: user.email,
      role: user.role,
      brandId: user.brandId,
      displayName: user.displayName,
      profileImageUrl: user.profileImageUrl,
      onboardingCompleted: user.onboardingCompleted,
      preferredTier: user.preferredTier,
    });
  }
));
```

**IMPORTANT — LocalStrategy initialization location:**
- The LocalStrategy must be registered in `server/auth.ts` (NOT in routes.ts)
- It must be registered unconditionally (not behind an env-var check like GoogleStrategy)
- The `storage` import already exists in auth.ts — bcrypt must also be imported there

**Login API Endpoint:**
```
POST /api/auth/login
Body: { email: string, password: string }
Success: 200 with user object (same shape as GET /api/auth/me)
Failure: 401 with { message: "Invalid email or password" }
```

The route handler must use `passport.authenticate('local')` to invoke the LocalStrategy. On success, call `req.login(user, ...)` to establish the session and return the user object in the same shape as `GET /api/auth/me` (matching `Express.User`).

**Security — Timing-safe comparison:**
- bcrypt.compare is already timing-safe against timing attacks
- Do NOT reveal whether the email exists or the password is wrong — always return "Invalid email or password"
- Do NOT log the attempted password or email in error messages

**Session Configuration (from architecture.md — Decision 3):**
- Sessions stored in PostgreSQL via connect-pg-simple (already configured in `server/routes.ts`)
- Session cookie: httpOnly, secure in production, sameSite 'lax'
- maxAge: 24 hours (already configured — 86,400,000ms)
- Session expiry handling: when `GET /api/auth/me` returns 401, the frontend redirects to `/login`

**Session Expiry Redirect Implementation:**
- The `useAuth()` hook already returns `user: null` when `/api/auth/me` returns 401 (via `getQueryFn({ on401: "returnNull" })`)
- The `ProtectedRoute` component already redirects to `/login` when `isAuthenticated` is false
- To detect session expiry specifically (vs. never-logged-in), track a `wasAuthenticated` ref in `useAuth()` or `ProtectedRoute`:
  - If user was previously non-null and becomes null → session expired → redirect to `/login?expired=true`
  - If user was always null → never logged in → redirect to `/login` (no expired param)
- The login page reads the `expired` query param and displays the expiry message
- This detection runs in the `ProtectedRoute` component using a `useRef` to track previous auth state

**Logout Confirmation Dialog:**
- The sidebar logout button currently calls `logout()` directly
- This story adds a confirmation dialog before logout: "You'll be signed out. Your plan is always saved."
- Use shadcn AlertDialog component for the confirmation

**Error Response Format (from architecture.md — Decision 5):**
```typescript
{ message: string }  // e.g., { message: "Invalid email or password" }
```

**Database Naming (from architecture.md — Naming Patterns):**
- API request bodies: snake_case (email, password — already lowercase)
- API response bodies: camelCase (matching Drizzle ORM output and Express.User shape)

### UI/UX Deliverables

- **Login Page** (`/login` route — already exists in `client/src/pages/login.tsx`):
  - Currently shows only Google OAuth button (or dev login). Must be updated to ALSO show email/password form for franchisee/franchisor login
  - Layout: Both login options on the same page — "Sign in with Google" button for Katalyst admins AND email/password form below a divider for franchisee/franchisor users
  - Email input field with label
  - Password input field with label  
  - "Sign In" button (disabled while submitting, shows "Signing in..." text)
  - Error message display area (for "Invalid email or password" or session expired messages)
  - If redirected from session expiry, show message: "Your session has expired. Please sign in again."
  - Visual separator between Google OAuth and email/password sections (e.g., "or" divider)

- **Logout Confirmation Dialog** (in `client/src/components/app-sidebar.tsx`):
  - Triggered by clicking the existing logout button in sidebar footer
  - AlertDialog with title: "Sign Out"
  - Description: "You'll be signed out. Your plan is always saved."
  - Confirm button: "Sign Out" (destructive variant)
  - Cancel button: "Cancel"
  - On confirm: calls POST /api/auth/logout, clears auth cache, redirects to /login

- **Session Expiry Handling**:
  - When `GET /api/auth/me` returns 401 for an authenticated user (session expired), redirect to `/login?expired=true`
  - Login page checks for `expired` query param and shows: "Your session has expired. Please sign in again."

### Anti-Patterns & Hard Constraints

- Do NOT remove the existing Google OAuth login flow — it must coexist with email/password
- Do NOT remove the dev-login bypass — it remains for development without Google OAuth credentials
- Do NOT reveal whether an email exists in the system — always return "Invalid email or password" for any login failure
- Do NOT store passwords in plain text — bcrypt with cost factor 12 (already established in Story 1.3)
- Do NOT create a separate auth route file yet — keep in `server/routes.ts` for now (route module refactor is a future task)
- Do NOT modify `server/auth.ts` Passport serialize/deserialize — they already handle both auth flows since they work with user IDs
- Do NOT allow users with no `passwordHash` (Katalyst admins who only use Google OAuth) to log in via email/password
- Do NOT modify `server/index.ts`, `server/vite.ts`, `server/static.ts`, `vite.config.ts`, or `drizzle.config.ts`

### Gotchas & Integration Warnings

- **Passport LocalStrategy requires `passport-local` package** — must be installed. `@types/passport-local` for TypeScript types
- **bcrypt is already installed** from Story 1.3 — do NOT reinstall
- **passwordHash is nullable** on users table — Katalyst admin users created via Google OAuth have `null` passwordHash. The LocalStrategy must check for this and reject login attempts for users without a password
- **Dev login bypass** — the existing dev-login route creates a katalyst_admin user. Email/password login should NOT be available for these dev users (they don't have passwords). The dev login button handles this separately
- **Session cookie name** — connect-pg-simple uses `connect.sid` by default. The logout route already clears this cookie
- **Passport serialize/deserialize already work** — they use `user.id` to look up the user, which works regardless of how the user authenticated (Google OAuth or email/password)
- **Login page currently only shows Google OAuth or dev login** — must be restructured to show BOTH Google OAuth and email/password form on the same page
- **The `useAuth` hook** in `client/src/hooks/use-auth.ts` already handles 401 from `/api/auth/me` by returning null — the `ProtectedRoute` component then redirects to `/login`
- **Express.User type augmentation** already exists in `server/auth.ts` — no changes needed there

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `server/auth.ts` | MODIFY | Add Passport LocalStrategy for email/password authentication |
| `server/routes.ts` | MODIFY | Add POST /api/auth/login endpoint using LocalStrategy |
| `client/src/pages/login.tsx` | MODIFY | Add email/password login form alongside Google OAuth, handle expired session message |
| `client/src/components/app-sidebar.tsx` | MODIFY | Add AlertDialog confirmation before logout |

### Dependencies & Environment Variables

**Packages to install:**
- `passport-local` — Passport LocalStrategy for email/password auth
- `@types/passport-local` — TypeScript type definitions

**Packages already installed (DO NOT reinstall):**
- `passport`, `@types/passport` — authentication framework
- `bcrypt`, `@types/bcrypt` — password hashing (installed in Story 1.3)
- `express-session`, `connect-pg-simple` — session management

**No new environment variables needed** — all auth/session config is already in place from Story 1.1.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Decision 3: Authentication Model] — Dual auth model, session configuration, bcrypt cost factor
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision 4: Authorization (RBAC) Pattern] — requireAuth middleware pattern
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision 5: API Design] — Error response format
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.4] — Original acceptance criteria
- [Source: _bmad-output/planning-artifacts/prd.md#FR31] — Users can authenticate to access the system
- [Source: _bmad-output/planning-artifacts/prd.md#NFR7] — Passwords hashed using bcrypt
- [Source: _bmad-output/planning-artifacts/prd.md#NFR8] — Session tokens expire after reasonable inactivity period
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] — Login page UX with dual auth, session expiry handling
- [Source: _bmad-output/implementation-artifacts/1-1-project-initialization-auth-database-schema.md] — Google OAuth setup, session config, auth.ts patterns
- [Source: _bmad-output/implementation-artifacts/1-3-invitation-acceptance-account-creation.md] — bcrypt password hashing, auto-login pattern

## Dev Agent Record

### Agent Model Used

Claude 4.6 Opus (Replit Agent)

### Completion Notes

Implemented login, logout, and session management for Story 1.4:

- **Passport LocalStrategy**: Added `passport-local` strategy in `server/auth.ts` (registered unconditionally) for franchisee/franchisor email+password authentication. Checks for `passwordHash` existence before comparing — users without passwords (Katalyst admins via Google OAuth) are rejected. Uses bcrypt.compare (timing-safe). Never reveals whether email exists — always returns "Invalid email or password".
- **POST /api/auth/login**: Added endpoint in `server/routes.ts` using `passport.authenticate('local')` with `req.login()` to establish session. Returns user object matching `Express.User` shape on success, 401 with `{ message: "Invalid email or password" }` on failure.
- **Login Page**: Updated `client/src/pages/login.tsx` to show dual auth — dev login (or Google OAuth) at top, "or" separator, then email/password form below with react-hook-form + zod validation. Error display for invalid credentials, session expiry message (`?expired=true`), and domain restriction error.
- **Logout Confirmation**: Added AlertDialog in `client/src/components/app-sidebar.tsx` — triggered by logout icon button, shows "Sign Out" title with "You'll be signed out. Your plan is always saved." description. Cancel and destructive Sign Out buttons.
- **Session Expiry Detection**: `ProtectedRoute` in `App.tsx` uses `useRef(wasAuthenticated)` to track if user was previously authenticated. When session expires (auth state goes from true → false), redirects to `/login?expired=true` instead of plain `/login`.

### File List

| File | Action |
|------|--------|
| `server/auth.ts` | MODIFIED — Added Passport LocalStrategy for email/password auth |
| `server/routes.ts` | MODIFIED — Added POST /api/auth/login endpoint |
| `client/src/pages/login.tsx` | MODIFIED — Added email/password form, "or" divider, session expired message |
| `client/src/components/app-sidebar.tsx` | MODIFIED — Added AlertDialog logout confirmation |
| `client/src/App.tsx` | MODIFIED — Added wasAuthenticated ref for session expiry detection |
