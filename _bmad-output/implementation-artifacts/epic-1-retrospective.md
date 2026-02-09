# Epic 1 Retrospective: Auth, Onboarding & User Management

**Date:** 2026-02-09
**Epic Status:** Done
**Stories Completed:** 6/6

---

## Summary

Epic 1 established the full authentication, authorization, and onboarding foundation for the Katalyst Growth Planner. All six stories were implemented, reviewed, and delivered successfully.

## What Went Well

### Architecture & Design Decisions
- **Dual authentication model** (Google OAuth for Katalyst admins, invitation-based email/password for franchisees/franchisors) cleanly separates concerns and leverages existing Google Workspace accounts for internal users.
- **Sprint Change Proposal (2026-02-09):** Pivoting from custom auth to Google OAuth for admins was the right call — eliminated password management overhead, seed scripts, and custom login forms for internal users.
- **Storage abstraction pattern** (`IStorage` interface) kept all database operations centralized and testable from day one.
- **RBAC middleware extraction** (Stories 1.5) into dedicated `server/middleware/auth.ts` and `server/middleware/rbac.ts` files created a clean, reusable pattern for all future routes.

### Implementation Quality
- **Three-layer RBAC approach** (route-level middleware, query-level scoping, response-level projection) provides defense-in-depth for data isolation.
- **Session expiry detection** using `useRef` (wasAuthenticated pattern) in ProtectedRoute avoids false redirect-to-login on initial page load while correctly catching expired sessions.
- **Dev login bypass** enables local development without Google OAuth credentials configured — practical for development workflow.
- **Onboarding guard pattern** (`FranchiseeOnboardingGuard`) ensures new franchisees complete onboarding before accessing the app, with role protection preventing non-franchisees from accessing the onboarding flow.

### Process
- All stories followed the BMad dev workflow: status transitions, dev agent records, file lists, and architect code reviews.
- Code reviews caught real issues (onboarding render side-effects, missing role guard on onboarding page) that were fixed before completion.

## What Could Be Improved

### Process Gaps
- **BMad workflow compliance:** Early stories initially skipped workflow steps (didn't update story status to "in-progress" at start, didn't fill Dev Agent Record at completion). This was corrected in later stories but should be followed from the start going forward.
- **Story status inconsistency:** Story 1.3 used "complete" instead of "review" — minor but the sprint-status.yaml definitions should be followed precisely.

### Technical Debt Identified
- **RBAC Layer 3 (response-level projection)** was designed but not fully implemented — `projectForRole()` middleware exists as a pattern but needs per-endpoint field filtering in Epic 2+.
- **Google OAuth error handling:** Domain restriction errors from Google OAuth are caught but the user experience for rejected domains could be more informative.
- **Test coverage:** No automated tests were written. End-to-end testing via Playwright validated the flows, but unit tests for middleware and storage operations would improve confidence for future changes.

### Architecture Notes
- **Onboarding redirect logic** required careful coordination between multiple guard components (`ProtectedRoute`, `FranchiseeOnboardingGuard`, `AdminRoute`). This works but adds complexity that could trip up future developers.
- **Session store:** Using `connect-pg-simple` for PostgreSQL-backed sessions works well, but session cleanup (expired session pruning) should be configured for production.

## Lessons Learned

1. **Follow the full BMad workflow from step 1** — skipping status updates and dev records creates tracking gaps.
2. **Guard component ordering matters** — authentication checks must complete before role-based redirects to avoid render side-effects.
3. **Sprint change proposals are valuable** — the Google OAuth pivot was documented cleanly and kept all artifacts in sync.
4. **Code reviews catch real bugs** — the architect review identified the onboarding `useEffect` issue that would have caused redirect loops.

## Metrics

| Metric | Value |
|--------|-------|
| Stories completed | 6/6 |
| Sprint change proposals | 1 (Google OAuth pivot) |
| Key files created/modified | ~15 |
| Database tables | 3 (users, brands, invitations) |
| Auth strategies | 2 (Google OAuth, Local) |
| User roles | 3 (katalyst_admin, franchisor, franchisee) |
| Experience tiers | 3 (Planning Assistant, Forms, Quick Entry) |

## Recommendations for Epic 2

1. **Follow BMad workflow precisely** from story creation through completion.
2. **Add unit tests** for critical middleware (`requireAuth`, `requireRole`, `scopeToUser`) before building more routes on top of them.
3. **Plan for RBAC Layer 3** (response projection) as brand configuration introduces role-specific data views.
4. **Configure session cleanup** before any production deployment.

---

**Retrospective completed by:** Dev Agent (Claude Opus 4.6)
**Date:** 2026-02-09
