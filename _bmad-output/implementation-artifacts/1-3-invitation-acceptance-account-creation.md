# Story 1.3: Invitation Acceptance & Account Creation

Status: complete

## Story

As an invited user,
I want to accept my invitation and set up my account,
So that I can access the Katalyst Growth Planner.

## Acceptance Criteria

1. **Given** I have a valid, unexpired invitation link **When** I visit the invitation URL **Then** I see the Invitation Acceptance page showing the brand name and my invited email address
2. **Given** I am on the Invitation Acceptance page with a valid invitation **When** I fill in my display name, password, and password confirmation and click Create Account **Then** my user account is created with the role and brand specified in the invitation **And** I am automatically logged in and redirected to the dashboard
3. **Given** I visit an invitation link with an expired token **When** the page loads **Then** I see a clear message that the invitation has expired and should contact their admin for a new one
4. **Given** I visit an invitation link that has already been accepted **When** the page loads **Then** I see a message that this invitation was already used, with a link to log in instead
5. **Given** I visit an invitation link with an invalid or nonexistent token **When** the page loads **Then** I see a clear error message that the invitation is invalid
6. **Given** I submit the account creation form with a password shorter than 8 characters or mismatched confirmation **When** I click Create Account **Then** I see inline validation errors and my account is not created

## Dev Notes

### Technical Decisions Made
- **Auth mechanism for franchisees/franchisors: Password-based with bcrypt** — resolved TBD from architecture.md. Password-based auth chosen over universal Google OAuth because: (1) franchisees may not have Google accounts, (2) simpler for invitation-based onboarding flow, (3) architecture doc listed bcrypt as primary option
- **password_hash column**: Added as nullable to users table (Katalyst admins use Google OAuth, no password needed)
- **Validation endpoint (GET /api/invitations/validate/:token)**: Public endpoint (no auth required) that returns invitation details or error codes (INVALID_TOKEN, ALREADY_ACCEPTED, EXPIRED)
- **Accept endpoint (POST /api/invitations/accept)**: Public endpoint that creates user, hashes password, marks token accepted, auto-logs in via Passport session
- **Error codes**: Used machine-readable `code` field alongside `message` for frontend error state differentiation

### UI/UX Deliverables

- **Invitation Acceptance Page** (`/invite/:token` route — already built in `client/src/pages/accept-invitation.tsx`):
  - Loading state while token is validated via GET /api/invitations/validate/:token
  - Valid invitation: shows brand name, invited email, account setup form (display name, password, confirm password, Create Account button)
  - Expired invitation: clear message with guidance to contact admin for a new invitation
  - Already-accepted invitation: message with link to login page
  - Invalid/nonexistent token: error message
  - Form validation: inline errors for short password (<8 chars), mismatched confirmation
  - Success: confirmation message with auto-redirect to dashboard

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
