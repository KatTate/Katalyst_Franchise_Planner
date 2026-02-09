# Story 1.3: Invitation Acceptance & Account Creation

Status: review

## Story

As an invited user,
I want to accept my invitation and set up my account,
So that I can access the Katalyst Growth Planner.

## Acceptance Criteria

1. **Given** I have a valid, unexpired invitation link **When** I visit the invitation URL and complete account setup **Then** my user account is created with the role and brand specified in the invitation
2. **And** my password is hashed with bcrypt (cost factor 12)
3. **And** the invitation token is marked as accepted and cannot be reused
4. **And** I am automatically logged in after account creation
5. **And** expired invitation tokens display a clear error message
6. **And** already-accepted tokens display a message directing to login

## Dev Notes

### Technical Decisions Made
- **Auth mechanism for franchisees/franchisors: Password-based with bcrypt** — resolved TBD from architecture.md. Password-based auth chosen over universal Google OAuth because: (1) franchisees may not have Google accounts, (2) simpler for invitation-based onboarding flow, (3) architecture doc listed bcrypt as primary option
- **password_hash column**: Added as nullable to users table (Katalyst admins use Google OAuth, no password needed)
- **Validation endpoint (GET /api/invitations/validate/:token)**: Public endpoint (no auth required) that returns invitation details or error codes (INVALID_TOKEN, ALREADY_ACCEPTED, EXPIRED)
- **Accept endpoint (POST /api/invitations/accept)**: Public endpoint that creates user, hashes password, marks token accepted, auto-logs in via Passport session
- **Error codes**: Used machine-readable `code` field alongside `message` for frontend error state differentiation

### Constraints Followed
- Storage interface pattern (all DB operations through IStorage)
- bcrypt cost factor 12 as specified in architecture.md
- Token single-use enforcement via accepted_at column
- No email sending (invitation acceptance link provided in API response from Story 1.2)
- Existing user check prevents duplicate accounts

### Anti-Patterns Avoided
- No business logic in route handlers beyond validation
- No raw SQL — all operations through Drizzle ORM via storage interface
- No password stored in plain text

## Dev Agent Record

### Agent Model Used

Claude 4.6 Opus (Replit Agent)

### Completion Notes

Implemented invitation acceptance flow for Story 1.3:

- **Schema**: Added nullable `password_hash` column to users table for password-based auth (Katalyst admins use Google OAuth, franchisees/franchisors use passwords)
- **GET /api/invitations/validate/:token**: Public endpoint returns invitation details (email, role, brandId, brandName) or error codes (INVALID_TOKEN/ALREADY_ACCEPTED/EXPIRED)
- **POST /api/invitations/accept**: Validates token, checks for existing user (409), hashes password with bcrypt cost 12, creates user account with invitation's role/brand, marks token accepted, auto-logs in via Passport session
- **Frontend /invite/:token page**: Shows loading state, error states (invalid/expired/accepted with appropriate messaging), account setup form (display name, password, confirm password), client-side validation, success confirmation with auto-redirect to dashboard
- **Security**: bcrypt cost 12, min 8 char password, token single-use enforcement, existing user check

### File List

| File | Action |
|------|--------|
| `shared/schema.ts` | MODIFIED — added nullable `password_hash` column to users table |
| `server/routes.ts` | MODIFIED — added bcrypt import, GET /api/invitations/validate/:token, POST /api/invitations/accept with full validation and auto-login |
| `client/src/pages/accept-invitation.tsx` | CREATED — invitation acceptance page with form validation and error/success states |
| `client/src/App.tsx` | MODIFIED — added /invite/:token route |

### Dependencies Added

| Package | Purpose |
|---------|---------|
| `bcrypt` | Password hashing with configurable cost factor |
| `@types/bcrypt` | TypeScript type definitions for bcrypt |
