# Sprint Change Proposal: Katalyst Admin Authentication — Google OAuth

**Date:** 2026-02-09
**Trigger Story:** Story 1.1 — Project Initialization & Auth Database Schema
**Change Scope:** Moderate — Direct Adjustment
**Proposed By:** Scrum Master (Bob) via Correct Course workflow

---

## Section 1: Issue Summary

**Problem Statement:**
During Story 1.1 contexting, the user identified that Katalyst admin authentication should use Google OAuth (restricted to @katgroupinc.com Google Workspace domain) instead of the originally planned custom email/password approach with Passport.js LocalStrategy + bcrypt.

**Rationale:**
- Katalyst team members already have @katgroupinc.com Google Workspace accounts — SSO eliminates password management overhead
- No custom login forms needed for internal admin users — simpler UX, fewer security surfaces
- No seed script needed — admin users self-register via Google OAuth on first login
- Replit Auth was evaluated and rejected because it requires users to have Replit accounts

**Impact Classification:**
- The core MVP is NOT affected — this is a simplification of one auth pathway
- Franchisee/franchisor invitation-based auth remains conceptually unchanged (to be detailed in Stories 1.2-1.4)
- No new epics, no removed epics, no resequencing needed
- NFR7 (password hashing) still applies to future franchisee accounts — scope narrows, not eliminates

---

## Section 2: Impact Analysis

### Epic Impact

| Epic | Impact | Details |
|------|--------|---------|
| Epic 1 (Auth, Onboarding & User Mgmt) | **MODERATE** | Stories 1.1, 1.3, 1.4 need AC updates. FR31 scope changes. |
| Epics 2-8 | **NONE** | No downstream impact — auth model change is contained within Epic 1 |

### Story Impact

| Story | Impact | Details |
|-------|--------|---------|
| 1.1 | **ALREADY UPDATED** | Implementation artifact updated with Google OAuth approach |
| 1.2 (Invitation Creation) | **NONE** | Admin creating invitations is unchanged — admin is now Google OAuth-authenticated instead of password-authenticated, but the invitation creation API is the same |
| 1.3 (Invitation Acceptance) | **MINOR** | ACs reference bcrypt — need qualifier "for franchisee accounts". Auth approach for franchisee invitation acceptance is TBD |
| 1.4 (Login/Logout/Session) | **MINOR** | ACs reference "email and password" and POST /api/auth/login — need to distinguish Katalyst admin (Google OAuth) from franchisee (TBD) login paths |
| 1.5 (RBAC Middleware) | **NONE** | Role-based access control is independent of auth method |
| 1.6 (Onboarding) | **NONE** | Onboarding questionnaire is post-auth, independent of auth method |

### Artifact Conflicts

| Artifact | Impact | Sections Affected |
|----------|--------|------------------|
| **architecture.md** | **HIGH** | Decision 3 (full rewrite), API endpoints, file tree, auth flow, page access matrix, FR28-32 coverage, multiple scattered references |
| **epics.md** | **MODERATE** | NFR7, FR31, Story 1.1/1.3/1.4 ACs, Additional Requirements |
| **prd.md** | **MODERATE** | Auth & Invitation Model section, NFR7, Integration List |
| **prd-validation-report.md** | **LOW** | NFR7 references — informational only |
| **ux-design-specification.md** | **NONE** | Only high-level login branding references — no prescriptive auth mechanism |
| **product-brief.md** | **NONE** | No auth-specific content |

---

## Section 3: Recommended Approach

**Selected Path:** Option 1 — Direct Adjustment

**Justification:**
- The change is scoped to one authentication pathway (Katalyst admin)
- No completed stories need to be rolled back
- MVP goals are unchanged — this is a simplification
- All changes are qualifier-based (adding "for Katalyst admins, Google OAuth; for franchisees, invitation-based — TBD") rather than structural

**Effort Estimate:** Low — text edits across 3 planning artifacts
**Risk Level:** Low — no architectural structure changes, no new dependencies beyond passport-google-oauth20
**Timeline Impact:** None — this streamlines Story 1.1 implementation

---

## Section 4: Detailed Change Proposals

### 4.1 architecture.md Changes

#### Change A3-1: Security row in Scale & Complexity table (line 48)

**OLD:**
```
| Security | HTTPS, bcrypt passwords, session expiry, API-level RBAC, single-use invitation tokens, no financial data in logs |
```

**NEW:**
```
| Security | HTTPS, Google OAuth for Katalyst admins, bcrypt passwords for franchisee accounts, session expiry, API-level RBAC, single-use invitation tokens, no financial data in logs |
```

**Rationale:** Reflects dual auth model — Google OAuth for internal users, password-based for external users (franchisees).

#### Change A3-2: Invitation-only auth model note (line 110)

**OLD:**
```
6. **Invitation-only auth model:** Simplifies auth architecture significantly — no self-registration, no email verification flows, no public endpoints for account creation.
```

**NEW:**
```
6. **Dual auth model:** Katalyst admin users authenticate via Google OAuth (restricted to @katgroupinc.com domain) — no invitation needed, no password management. Franchisees and franchisor admins use invitation-only auth — no self-registration, no email verification flows, no public endpoints for account creation.
```

**Rationale:** Distinguishes the two auth pathways.

#### Change A3-3: Backend libraries (line 204)

**OLD:**
```
- Passport + passport-local for authentication
```

**NEW:**
```
- Passport + passport-google-oauth20 for Katalyst admin authentication (Google OAuth)
- Passport local strategy may be added in Stories 1.2-1.4 for franchisee invitation-based auth (TBD)
```

**Rationale:** Reflects actual package dependency.

#### Change A3-4: Email/Invitations gap row (line 252)

**OLD:**
```
| **Email/Invitations** | Invitation-only auth flow (FR28) | Resend, SendGrid, or Nodemailer |
```

**NEW:**
```
| **Email/Invitations** | Invitation auth flow for franchisees/franchisors (FR28) | Resend, SendGrid, or Nodemailer |
```

**Rationale:** Clarifies that invitation flow is for franchisees/franchisors, not Katalyst admins.

#### Change A3-5: Decision 3 — Authentication Model (lines 444-457) — FULL REWRITE

**OLD:**
```
### Authentication & Security

#### Decision 3: Authentication Model

**Decision:** Invitation-only, session-based authentication using Passport.js (already in starter) with custom invitation flow.

**Architecture:**
- No self-registration. Users are created by Katalyst admins or franchisor users with appropriate permissions.
- Invitation tokens are single-use, time-limited (configurable, default 7 days).
- Invitation email contains a link with the token. First visit sets password.
- Sessions stored in PostgreSQL via connect-pg-simple (already in starter).
- Session expiry: configurable per role (longer for franchisees, shorter for admins).

**Password Security:** bcrypt with cost factor 12.
```

**NEW:**
```
### Authentication & Security

#### Decision 3: Authentication Model

**Decision:** Dual authentication model — Google OAuth for Katalyst admin users, invitation-based auth for franchisees and franchisor admins. Session-based with PostgreSQL session store.

**Architecture — Katalyst Admin Auth (Google OAuth):**
- Katalyst team members authenticate via Google OAuth restricted to @katgroupinc.com domain
- Uses `passport-google-oauth20` strategy with domain enforcement:
  - Google OAuth `hd` parameter hints account chooser to show only @katgroupinc.com accounts
  - Server-side callback validates both the `hd` claim AND email suffix — `hd` hint alone is advisory and bypassable
- No seed script — admin users self-register on first Google OAuth login with `katalyst_admin` role
- User profile (display_name, profile_image_url) populated from Google profile data
- Google OAuth tokens (access_token, refresh_token) are NOT stored — only user profile data
- Google Cloud Console setup: OAuth 2.0 credentials with Internal app type (Workspace-only consent screen)

**Architecture — Franchisee/Franchisor Auth (Invitation-based):**
- No self-registration. Users are created by Katalyst admins or franchisor users with appropriate permissions.
- Invitation tokens are single-use, time-limited (configurable, default 7 days).
- Invitation email contains a link with the token. Auth mechanism for invitation acceptance TBD in Stories 1.2-1.4 (options: password-based with bcrypt, or Google OAuth for all users).
- Sessions stored in PostgreSQL via connect-pg-simple (already in starter).
- Session expiry: configurable per role (longer for franchisees, shorter for admins).

**Password Security (if used for franchisee accounts):** bcrypt with cost factor 12.
```

**Rationale:** Core authentication decision rewritten to reflect dual auth model.

#### Change A3-6: API Endpoints — Auth section (lines 498-503)

**OLD:**
```
Auth:
  POST   /api/auth/login
  POST   /api/auth/logout
  GET    /api/auth/me
  POST   /api/invitations              (Katalyst/Franchisor creates invitation)
  POST   /api/invitations/:token/accept (Franchisee accepts, sets password)
```

**NEW:**
```
Auth:
  GET    /api/auth/google              (Initiate Google OAuth for Katalyst admins)
  GET    /api/auth/google/callback     (Google OAuth callback — domain validation)
  POST   /api/auth/logout
  GET    /api/auth/me
  POST   /api/invitations              (Katalyst/Franchisor creates invitation)
  POST   /api/invitations/:token/accept (Franchisee accepts — auth mechanism TBD)
```

**Rationale:** Reflects Google OAuth routes replacing POST login; invitation acceptance auth mechanism TBD.

#### Change A3-7: Authentication Flow pattern (lines 1139-1144)

**OLD:**
```
**Authentication Flow:**
- Session-based (express-session + connect-pg-simple)
- Login: `POST /api/auth/login` → sets session cookie → redirect to plans list
- Protected routes: `requireRole()` middleware checks session, returns 401/403
- Frontend: `useQuery({ queryKey: ['/api/auth/me'] })` for current user — redirects to login on 401
- Invitation flow: Token in URL → registration form → `POST /api/auth/register` with token → auto-login
```

**NEW:**
```
**Authentication Flow:**
- Session-based (express-session + connect-pg-simple)
- Katalyst admin login: `GET /api/auth/google` → Google OAuth consent → `GET /api/auth/google/callback` → domain validation → session cookie → redirect to app
- Franchisee login: Invitation-based — auth mechanism TBD in Stories 1.2-1.4
- Protected routes: `requireRole()` middleware checks session, returns 401/403
- Frontend: `useQuery({ queryKey: ['/api/auth/me'] })` for current user — redirects to login on 401
- Login page: "Sign in with Google" button navigates to `/api/auth/google`; domain rejection shows error message
```

**Rationale:** Describes actual auth flows.

#### Change A3-8: Route module file tree — auth.ts description (line 1294)

**OLD:**
```
│   │   ├── auth.ts                       # POST login, POST register, GET me, POST logout
```

**NEW:**
```
│   │   ├── auth.ts                       # GET google, GET google/callback, GET me, POST logout
```

**Rationale:** Reflects Google OAuth routes.

#### Change A3-9: Login page in file tree (line 1372)

**OLD:**
```
│       │   ├── login.tsx                  # Login page [PUBLIC]
│       │   ├── register.tsx               # Invitation-based registration [PUBLIC — token required]
```

**NEW:**
```
│       │   ├── login.tsx                  # Login page — "Sign in with Google" for Katalyst admins [PUBLIC]
│       │   ├── register.tsx               # Invitation-based registration for franchisees [PUBLIC — token required]
```

**Rationale:** Clarifies login page content and register page audience.

#### Change A3-10: use-auth.ts hook description (line 1383)

**OLD:**
```
│       │   ├── [C] use-auth.ts           # Current user, login/logout, role checks
```

**NEW:**
```
│       │   ├── [C] use-auth.ts           # Current user, Google OAuth redirect, logout, role checks
```

**Rationale:** Hook triggers Google OAuth redirect, not form-based login.

#### Change A3-11: Route boundary table — auth row (line 1409)

**OLD:**
```
| `/api/auth/*` | `routes/auth.ts` | Client login/register | No (public) |
```

**NEW:**
```
| `/api/auth/*` | `routes/auth.ts` | Google OAuth + session management | Mixed (OAuth routes public, /me protected) |
```

**Rationale:** More accurate description.

#### Change A3-12: FR Category mapping — Auth & Access (line 1544)

**OLD:**
```
| **Auth & Access (FR28-32)** | `server/middleware/auth.ts`, `server/routes/auth.ts`, `client/pages/login.tsx`, `client/pages/register.tsx` | `client/hooks/use-auth.ts`, `client/lib/protected-route.tsx` |
```

**NEW:**
```
| **Auth & Access (FR28-32)** | `server/middleware/auth.ts`, `server/routes/auth.ts`, `client/pages/login.tsx`, `client/pages/register.tsx` | `client/hooks/use-auth.ts`, `client/lib/protected-route.tsx` (Katalyst admin: Google OAuth; franchisee: invitation-based, TBD) |
```

**Rationale:** Adds qualifier about dual auth model.

#### Change A3-13: Page access matrix — Login row (line 1571)

**OLD:**
```
| Login | `/login` | PUBLIC | — |
```

**NEW:**
```
| Login | `/login` | PUBLIC | — (Google OAuth for Katalyst admins) |
```

**Rationale:** Clarifies login mechanism.

#### Change A3-14: FR28-32 coverage (line 1677)

**OLD:**
```
| FR28-32 | Auth & Access | `auth.ts` middleware (session + requireRole), `use-auth.ts` hook, `protected-route.tsx`, invitation token flow | COVERED |
```

**NEW:**
```
| FR28-32 | Auth & Access | `auth.ts` middleware (session + requireRole), `use-auth.ts` hook, `protected-route.tsx`, Google OAuth for Katalyst admins + invitation token flow for franchisees | COVERED |
```

**Rationale:** Reflects dual auth model in coverage.

### 4.2 epics.md Changes

#### Change E-1: NFR7 (line 110)

**OLD:**
```
- NFR7: Passwords hashed using bcrypt — never stored in plaintext
```

**NEW:**
```
- NFR7: Passwords hashed using bcrypt — never stored in plaintext (applies to franchisee accounts; Katalyst admins use Google OAuth)
```

**Rationale:** Scopes NFR7 to accounts that use passwords.

#### Change E-2: Additional Requirements — auth line (line 147)

**OLD:**
```
- Invitation-only auth via Passport.js with session stored in PostgreSQL (connect-pg-simple)
```

**NEW:**
```
- Dual auth: Google OAuth (passport-google-oauth20) for Katalyst admins (@katgroupinc.com domain); invitation-based auth for franchisees/franchisors. Sessions stored in PostgreSQL (connect-pg-simple)
```

**Rationale:** Reflects dual auth architecture.

#### Change E-3: FR Coverage Map — FR31 (line 218)

**OLD:**
```
| FR31 | Epic 1 | Email/password authentication |
```

**NEW:**
```
| FR31 | Epic 1 | Authentication (Google OAuth for Katalyst admins; method TBD for franchisees) |
```

**Rationale:** FR31 is about authentication broadly, not specifically email/password for all users.

#### Change E-4: Story 1.1 Acceptance Criteria (lines 308-316)

**OLD:**
```
**Acceptance Criteria:**

**Given** the Replit full-stack JS template is in place
**When** the database schema is pushed
**Then** the following tables exist: `users` (id, email, password_hash, role, brand_id, display_name, onboarding_completed, preferred_tier, created_at), `sessions` (connect-pg-simple session store), `invitations` (id, email, role, brand_id, token, expires_at, accepted_at, created_by)
**And** Drizzle insert schemas and types are exported from `shared/schema.ts`
**And** Passport.js is configured with local strategy and session serialization
**And** the Express app uses session middleware backed by PostgreSQL
**And** a seed script creates the initial Katalyst admin account (email from environment variable) for platform bootstrap — this is the entry point for the entire invitation chain
```

**NEW:**
```
**Acceptance Criteria:**

**Given** the Replit full-stack JS template is in place
**When** the database schema is pushed
**Then** the following tables exist: `users` (id, email, display_name, profile_image_url, role, brand_id, onboarding_completed, preferred_tier, created_at), `sessions` (connect-pg-simple session store), `brands` (id, name, slug, created_at), `invitations` (id, email, role, brand_id, token, expires_at, accepted_at, created_by, created_at)
**And** Drizzle insert schemas and types are exported from `shared/schema.ts`
**And** Passport.js is configured with Google OAuth strategy (passport-google-oauth20) restricted to @katgroupinc.com domain, with session serialization
**And** the Express app uses session middleware backed by PostgreSQL
**And** Katalyst admin users can authenticate via Google OAuth — first login auto-creates their account with `katalyst_admin` role
```

**Rationale:** Reflects Google OAuth, drops password_hash, adds brands table, removes seed script.

#### Change E-5: Story 1.3 AC — bcrypt reference (line 345)

**OLD:**
```
**And** my password is hashed with bcrypt (cost factor 12)
```

**NEW:**
```
**And** my password is hashed with bcrypt (cost factor 12) _(if password-based auth is chosen for franchisee accounts — auth mechanism TBD)_
```

**Rationale:** Preserves bcrypt requirement but qualifies it as conditional on auth mechanism decision.

#### Change E-6: Story 1.4 ACs (lines 351-366)

**OLD:**
```
### Story 1.4: Login, Logout & Session Management

As a registered user,
I want to log in with my email and password and maintain my session,
So that I can securely access the platform across visits.

**Acceptance Criteria:**

**Given** I have a registered account
**When** I submit valid credentials to POST `/api/auth/login`
**Then** a session is created and a session cookie is set
**And** GET `/api/auth/me` returns my user profile (id, email, role, brand_id, display_name)
**And** invalid credentials return 401 with a plain-language error message
**And** POST `/api/auth/logout` destroys the session
**And** sessions expire after configurable inactivity period (NFR8)
**And** the login page is styled with brand theming if a brand context is available
```

**NEW:**
```
### Story 1.4: Login, Logout & Session Management

As a registered user,
I want to log in and maintain my session,
So that I can securely access the platform across visits.

**Acceptance Criteria:**

**Given** I am a Katalyst admin with a @katgroupinc.com Google account
**When** I click "Sign in with Google" and complete Google OAuth
**Then** a session is created and a session cookie is set
**And** GET `/api/auth/me` returns my user profile (id, email, role, brand_id, display_name, profile_image_url)
**And** non-@katgroupinc.com accounts are rejected with a clear error message
**And** POST `/api/auth/logout` destroys the session
**And** sessions expire after configurable inactivity period (NFR8)
**And** the login page is styled with brand theming if a brand context is available
**And** franchisee/franchisor login flow is defined in Stories 1.2-1.3 (auth mechanism TBD)
```

**Rationale:** Reflects Google OAuth for Katalyst admins; defers franchisee login to later stories.

### 4.3 prd.md Changes

#### Change P-1: Authentication & Invitation Model section (lines 472-484)

**OLD:**
```
### Authentication & Invitation Model

**Invitation-only — no self-registration.**

Franchisee onboarding flow:
1. Katalyst account manager creates a franchisee record in the admin dashboard
2. System sends invitation email with a secure link
3. Franchisee clicks link, sets password, completes onboarding questions (experience tier detection)
4. Franchisee is now active with their recommended experience tier

Franchisor admins are also invited by Katalyst. Only Katalyst super-admins provision other Katalyst admins.

This simplifies authentication significantly — no spam accounts, no "which email did I use" problem, no email verification flows needed. The invitation IS the verification. It also reinforces FTC compliance: the tool is only available to post-agreement franchisees, and access is explicitly granted.
```

**NEW:**
```
### Authentication & Invitation Model

**Dual auth model — Google OAuth for Katalyst admins, invitation-only for franchisees/franchisors.**

**Katalyst admin auth:**
- Katalyst team members authenticate via Google OAuth, restricted to @katgroupinc.com Google Workspace domain
- No invitation needed — first Google OAuth login auto-creates the admin account
- Domain restriction enforced server-side (hosted domain claim + email suffix validation)

**Franchisee onboarding flow (invitation-only — no self-registration):**
1. Katalyst account manager creates a franchisee record in the admin dashboard
2. System sends invitation email with a secure link
3. Franchisee clicks link, completes account setup and onboarding questions (experience tier detection)
4. Franchisee is now active with their recommended experience tier

Franchisor admins are also invited by Katalyst.

This simplifies authentication significantly — Katalyst admins use existing Google Workspace accounts (no password management), and franchisees are invitation-only (no spam accounts, no "which email did I use" problem). The invitation IS the verification for franchisees. It also reinforces FTC compliance: the tool is only available to post-agreement franchisees, and access is explicitly granted.
```

**Rationale:** Establishes dual auth model upfront while preserving franchisee invitation flow.

#### Change P-2: Integration List — Authentication line (line 516)

**OLD:**
```
- Authentication: Invitation-based with secure link + password setup
```

**NEW:**
```
- Authentication: Google OAuth for Katalyst admins (passport-google-oauth20); invitation-based for franchisees/franchisors
```

**Rationale:** Reflects dual auth model.

#### Change P-3: NFR7 (line 751)

**OLD:**
```
- **NFR7:** Passwords hashed using industry-standard algorithms (bcrypt or equivalent) — never stored in plaintext
```

**NEW:**
```
- **NFR7:** Passwords hashed using industry-standard algorithms (bcrypt or equivalent) — never stored in plaintext (applies to franchisee accounts if password-based auth is used; Katalyst admins authenticate via Google OAuth)
```

**Rationale:** Scopes NFR7; Katalyst admins have no passwords to hash.

---

## Section 5: Implementation Handoff

**Change Scope:** Moderate — Direct Adjustment
**Handoff:** Development team (Amelia) for direct implementation

**Action Plan:**
1. Apply all text edits from Section 4 to the three planning artifacts
2. Update `replit.md` with the auth decision in Key Design Decisions and Recent Changes
3. Story 1.1 implementation artifact is already updated — proceed to DS (Dev Story) workflow
4. Stories 1.3 and 1.4 will be re-contexted when they come up for implementation — the TBD markers serve as reminders

**Success Criteria:**
- All planning artifacts consistently describe the dual auth model
- No remaining references to "password_hash" in the users table for Story 1.1
- No remaining references to "seed script" for Katalyst admin bootstrap
- FR31 correctly described as authentication (not specifically email/password for all users)
- Stories 1.3 and 1.4 have TBD markers for franchisee auth mechanism

---

## Approval

**Status:** Pending user approval
