# Story 1.6: Franchisee Onboarding & Tier Recommendation

Status: ready-for-dev

## Story

As a new franchisee,
I want to complete a guided onboarding experience after account creation,
So that the platform recommends a planning approach that fits my experience level (FR14, FR29).

## Acceptance Criteria

1. **Given** I have just created my account via invitation acceptance **When** I am redirected to the dashboard **Then** I am automatically redirected to the onboarding page instead (because `onboardingCompleted` is false)
2. **Given** I am on the onboarding page **When** I view the questionnaire **Then** I see 2-3 simple, jargon-free questions about my franchise experience, financial literacy, and planning familiarity **And** the tone is warm and approachable — low-commitment language matching the "cautious hope" emotional state of a new franchisee
3. **Given** I am answering the onboarding questions **When** I complete all questions and click Continue **Then** the system recommends an initial experience tier (Planning Assistant, Forms, or Quick Entry) **And** I see a clear explanation of why this tier was recommended and what it means **And** the recommendation is presented as a suggestion, not a restriction — I can see that all three tiers remain accessible
4. **Given** I see the tier recommendation **When** I accept the recommendation or choose a different tier **Then** my selected tier is saved to my user profile as `preferredTier` **And** my `onboardingCompleted` flag is set to true **And** I am redirected to the dashboard
5. **Given** I am on the onboarding page **When** I click "Skip" **Then** my `onboardingCompleted` flag is set to true **And** no specific tier is recommended (all tiers remain equally available) **And** I am redirected to the dashboard
6. **Given** I am a returning franchisee with `onboardingCompleted` set to true **When** I log in and navigate to the dashboard **Then** I am NOT redirected to onboarding — I go directly to the dashboard
7. **Given** I am a Katalyst admin or franchisor admin **When** I log in **Then** I am never redirected to onboarding (onboarding is only for franchisees)

## Dev Notes

### Architecture Patterns to Follow

**Onboarding API Endpoint:**
```
POST /api/onboarding/complete
Body: {
  franchise_experience: "none" | "some" | "experienced",
  financial_literacy: "basic" | "comfortable" | "advanced",
  planning_experience: "first_time" | "done_before" | "frequent"
}
Response: {
  recommendedTier: "planning_assistant" | "forms" | "quick_entry",
  tierDescription: string
}
```

```
POST /api/onboarding/select-tier
Body: {
  preferred_tier: "planning_assistant" | "forms" | "quick_entry" | null
}
Response: { success: true }
```

```
POST /api/onboarding/skip
Body: (none)
Response: { success: true }
```

**Tier Recommendation Algorithm:**
Simple scoring system based on onboarding answers:

| Score Range | Recommended Tier |
|-------------|-----------------|
| 0-3 (low experience) | Planning Assistant (AI-guided conversation) |
| 4-6 (moderate experience) | Forms (structured sections) |
| 7-9 (high experience) | Quick Entry (spreadsheet-style) |

Scoring:
- franchise_experience: none=0, some=1, experienced=3
- financial_literacy: basic=0, comfortable=1, advanced=3
- planning_experience: first_time=0, done_before=1, frequent=3

This is a simple heuristic — the exact scoring can be tuned. The key principle is that the recommendation is a suggestion, not a gate.

**Storage Interface Additions:**
```typescript
updateUserOnboarding(userId: string, data: {
  onboardingCompleted: boolean;
  preferredTier?: "planning_assistant" | "forms" | "quick_entry" | null;
}): Promise<User>;
```

**Frontend Onboarding Redirect Logic:**
- The onboarding redirect should live in the **Dashboard page** (or a wrapper around it), NOT in `ProtectedRoute`. Placing it in `ProtectedRoute` would cause an infinite redirect loop because the onboarding page itself is also a protected route.
- Implementation approach: In `client/src/App.tsx`, create a `FranchiseeOnboardingGuard` wrapper that checks `user.role === "franchisee" && !user.onboardingCompleted` and redirects to `/onboarding`. Apply this wrapper to the dashboard route and any franchisee-facing pages, but NOT to the `/onboarding` route itself.
- The `/onboarding` route should use `ProtectedRoute` (requires auth) but should NOT check the onboarding flag — it renders the questionnaire regardless
- The onboarding page checks if `onboardingCompleted === true` on mount — if so, redirect to `/` (user navigated here manually after completing onboarding)
- After onboarding completes, invalidate the `/api/auth/me` query cache so `useAuth()` re-fetches the updated user (with `onboardingCompleted: true` and `preferredTier` set)

**Experience Tier Persistence (from PRD — Experience Tier Persistence):**
- Experience tier is a persistent user preference stored on the user profile
- Onboarding sets the initial recommendation
- User can change their tier anytime from profile/settings (future story)
- Tier persists across sessions — no re-answering onboarding questions on every login

**Database Naming (from architecture.md — Naming Patterns):**
- API request bodies: snake_case
- API response bodies: camelCase

### UI/UX Deliverables

- **Onboarding Page** (`/onboarding` route):
  - Warm, welcoming design — the franchisee's first real interaction with the platform
  - Progress indicator showing which question they're on (e.g., "Step 1 of 3")
  - Question 1: "How familiar are you with franchising?" — Options: "This is my first franchise" / "I have some franchise experience" / "I'm an experienced franchise operator"
  - Question 2: "How comfortable are you with financial planning?" — Options: "I'm learning as I go" / "I'm comfortable with basic financials" / "I work with financial data regularly"
  - Question 3: "Have you built a business plan before?" — Options: "This will be my first" / "I've done this once or twice" / "I build plans frequently"
  - Each question displayed one at a time or all at once in a simple card layout
  - "Skip onboarding" link at the top or bottom for users who want to dive right in
  - After answering: Recommendation screen showing the recommended tier with a friendly description
  - Three tier option cards (Planning Assistant, Forms, Quick Entry) with the recommended one highlighted
  - "Get Started" button to confirm selection and proceed to dashboard

- **Tier Recommendation Display:**
  - Planning Assistant: "We'll guide you through your plan with a conversational advisor. Perfect for first-time planners."
  - Forms: "Build your plan section by section with structured input forms. Great for people who know their numbers."
  - Quick Entry: "Jump right into a spreadsheet-style view for maximum speed. Ideal for experienced planners."

- **UI States:**
  - Loading: Skeleton while checking onboarding status
  - Questionnaire: Interactive question cards
  - Recommendation: Tier recommendation with option to change
  - Redirect: Brief loading state while navigating to dashboard after completion

### Anti-Patterns & Hard Constraints

- Do NOT block the user from proceeding — onboarding must be skippable
- Do NOT present the tier recommendation as a permanent choice — the user can change it later (from profile settings in a future story)
- Do NOT use technical jargon in questions — language should be approachable for someone like "Sam" (first-time franchisee)
- Do NOT require more than 3 questions — minimize friction
- Do NOT store onboarding responses in a separate table — the responses are used to compute the recommendation and the result (preferredTier) is stored on the user record. The individual answers do not need persistence
- Do NOT redirect Katalyst admin or franchisor admin users to onboarding — onboarding is franchisee-only
- Do NOT create a separate onboarding database table — use the existing `preferredTier` and `onboardingCompleted` columns on the `users` table
- Do NOT modify `server/index.ts`, `server/vite.ts`, `server/static.ts`, `vite.config.ts`, or `drizzle.config.ts`
- Do NOT modify the existing schema in `shared/schema.ts` — `onboardingCompleted` and `preferredTier` columns already exist on the users table

### Gotchas & Integration Warnings

- **Schema already supports this**: The `users` table already has `onboardingCompleted` (boolean, default false) and `preferredTier` (nullable text) columns from Story 1.1. No schema migration needed
- **Invitation acceptance sets onboardingCompleted to false**: Story 1.3 creates users with `onboardingCompleted: false` — so new franchisees will always hit the onboarding redirect
- **Katalyst admins created via Google OAuth**: The `upsertUserFromGoogle` method sets `onboardingCompleted: false` but this doesn't matter because the redirect logic only triggers for franchisee role
- **Auth session must be updated after onboarding**: After setting `onboardingCompleted` and `preferredTier` on the database, the session's `req.user` object is stale. The client should invalidate the `/api/auth/me` query cache so the `useAuth()` hook re-fetches the updated user
- **The `ProtectedRoute` redirect must not create a loop**: If the onboarding page is itself protected, ensure the redirect logic distinguishes between "not authenticated" (→ /login) and "not onboarded" (→ /onboarding). The onboarding page should use `ProtectedRoute` (requires auth) but NOT check onboarding status
- **Testing with dev login**: The dev login creates a katalyst_admin user who should NOT be redirected to onboarding. Test with a franchisee user created via the invitation acceptance flow

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `server/routes.ts` | MODIFY | Add POST /api/onboarding/complete, POST /api/onboarding/select-tier, POST /api/onboarding/skip endpoints |
| `server/storage.ts` | MODIFY | Add updateUserOnboarding() method to IStorage and DatabaseStorage |
| `client/src/pages/onboarding.tsx` | CREATE | Onboarding questionnaire page with tier recommendation |
| `client/src/App.tsx` | MODIFY | Add /onboarding route, add onboarding redirect logic for franchisees |
| `client/src/hooks/use-auth.ts` | NO CHANGE | Already provides user.onboardingCompleted and preferredTier — frontend redirect logic uses this |

**API Response Detail:**
- `POST /api/onboarding/complete` returns `recommendedTier` and `tierDescription` — these are computed server-side and returned in the response. They are NOT stored separately; the client uses them to display the recommendation UI. Only the final `preferredTier` selection (via `/api/onboarding/select-tier`) is persisted to the database.
- The tier descriptions are hardcoded strings in the route handler (or a shared constants file):
  - planning_assistant: "We'll guide you through your plan with a conversational advisor."
  - forms: "Build your plan section by section with structured input forms."
  - quick_entry: "Jump right into a spreadsheet-style view for maximum speed."

### Dependencies & Environment Variables

**No new packages needed** — all dependencies are already installed.

**No new environment variables needed.**

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Decision 3: Authentication Model] — Onboarding flow for franchisees
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision 10: Routing Strategy] — /onboarding route
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.6] — Original acceptance criteria
- [Source: _bmad-output/planning-artifacts/prd.md#FR14] — System recommends initial tier based on onboarding
- [Source: _bmad-output/planning-artifacts/prd.md#FR29] — Guided onboarding with experience assessment
- [Source: _bmad-output/planning-artifacts/prd.md#Experience Tier Persistence] — Tier is a persistent user preference, changeable anytime
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] — Onboarding UX with 3 questions, low-friction, warm tone
- [Source: _bmad-output/implementation-artifacts/1-3-invitation-acceptance-account-creation.md] — User created with onboardingCompleted: false
- [Source: _bmad-output/implementation-artifacts/1-1-project-initialization-auth-database-schema.md] — Users table schema with preferredTier and onboardingCompleted columns

## Dev Agent Record

### Agent Model Used

### Completion Notes

### File List
