---
title: 'Onboarding Copy Refresh'
slug: 'onboarding-copy-refresh'
created: '2026-02-23'
status: 'ready-for-dev'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['React 18.3', 'TypeScript 5.6', 'Tailwind CSS 3.4', 'shadcn/ui (Radix)', 'Wouter 3.3', 'TanStack Query v5', 'Lucide React']
files_to_modify: ['client/src/pages/onboarding.tsx']
code_patterns: ['TIER_INFO static Record constant', 'isRecommended boolean conditional rendering', 'data-testid on all interactive/display elements', 'JSX auto-transform (no React import)']
test_patterns: ['Playwright E2E in e2e/onboarding.spec.ts', 'data-testid selectors for assertions', 'Dev-login auth in beforeEach', 'Unique test data via Date.now()']
---

# Tech-Spec: Onboarding Copy Refresh

**Created:** 2026-02-23

## Overview

### Problem Statement

The onboarding flow uses generic tier descriptions for all users regardless of their answers. The UX gap analysis (Group A) calls for persona-specific recommendation copy that frames tiers as guidance ("We suggest...") rather than a mode picker, matching the three user personas (Sam — new to this, Chris — knows their numbers, Maria — veteran).

### Solution

Update `TIER_INFO` in the frontend with per-persona recommendation copy. The recommended tier's description dynamically shows the persona-appropriate message based on which tier the backend recommends. Frontend-only change — the backend continues to return just the tier key. Keep existing "approach" language (already reads well). Remove any "mode" language if found.

### Scope

**In Scope:**
- Update `TIER_INFO` labels and descriptions with persona-specific recommendation copy per the UX gap analysis
- Update the recommendation step to frame as guidance rather than selection
- Remove any remaining "mode" language — use "starting point" or "recommended path" where "mode" appears
- Keep user ability to override the recommendation

**Out of Scope:**
- Backend changes (persona copy lives in frontend only)
- Structural/layout changes to onboarding
- Changes to the scoring logic or question flow
- Other gap groups (B, C, D, E)

## Context for Development

### Codebase Patterns

- `TIER_INFO` is a `Record<string, { label: string; description: string; icon: typeof MessageSquare }>` constant at lines 20-36 of `onboarding.tsx`
- The recommendation step (lines 148-216) renders all three tiers in a list, using `isRecommended` boolean (line 165) to show a "Recommended" badge and `isSelected` boolean (line 166) for the selected state
- Each tier card renders `tier.description` (line 190) — this is where the conditional `recommendedCopy` vs `shortDescription` logic will go
- The user can click any tier to override via `setSelectedTier(tierKey)` (line 171) before clicking "Get Started"
- The backend returns `{ recommendedTier, tierDescription }` but the frontend only uses `recommendedTier` — `tierDescription` is not displayed
- No "mode" language exists in the file — already clean
- JSX auto-transform is active — no explicit React import needed
- All interactive and display elements already have `data-testid` attributes

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `client/src/pages/onboarding.tsx` | Onboarding page — the only file to modify (302 lines) |
| `server/routes/onboarding.ts` | Backend routes — read-only reference. Scoring: ≤3 → planning_assistant, 4-6 → forms, 7+ → quick_entry |
| `e2e/onboarding.spec.ts` | Existing E2E tests — navigate through questions, verify recommendation title. Tests do NOT assert on copy content — will pass without changes |
| `server/routes/onboarding.test.ts` | Backend unit tests — not affected by this change |
| `_bmad-output/planning-artifacts/ux-gap-analysis-2026-02-23.md` | Source of truth for desired copy |

### Technical Decisions

- Persona-specific copy lives in the frontend only (user's choice) — backend returns the tier key, frontend maps to copy
- Keep "approach" language — no need to change to "starting point" / "recommended path" (user's choice)
- No structural or layout changes — copy/language only
- `TIER_INFO` structure changes from `{ label, description, icon }` to `{ label, shortDescription, recommendedCopy, icon }` — `recommendedCopy` shown when tier is the recommended one, `shortDescription` shown for non-recommended tiers
- Tier-to-persona mapping is 1:1 via the `recommendedTier` key from the backend: `planning_assistant` → Sam copy, `forms` → Chris copy, `quick_entry` → Maria copy

### Finalized Copy (Party Mode — Sally, John, Amelia)

**Planning Assistant (recommended for Sam — score ≤3):**
- **Recommended copy:** "We recommend starting with the **Planning Assistant** — it'll guide you through your plan conversationally, explaining things as you go. You can always switch to forms anytime."
- **Short description (non-recommended):** "A conversational guide that walks you through your plan step by step."

**Forms (recommended for Chris — score 4-6):**
- **Recommended copy:** "You're in good shape to dive into **My Plan** forms. Fill in your numbers section by section. The Planning Assistant is always available if you want a second opinion."
- **Short description (non-recommended):** "Build your plan section by section with structured input forms."

**Quick Entry (recommended for Maria — score 7+):**
- **Recommended copy:** "You've got this. Head straight to **Reports** and build your plan inline — everything's editable. No hand-holding required."
- **Short description (non-recommended):** "Jump right into the data. Everything's editable inline."

## Acceptance Criteria

- **AC 1:** Given a new franchisee completes onboarding with beginner answers (score ≤3), when the recommendation step renders, then the Planning Assistant tier card displays the recommended copy: "We recommend starting with the **Planning Assistant** — it'll guide you through your plan conversationally, explaining things as you go. You can always switch to forms anytime."

- **AC 2:** Given a new franchisee completes onboarding with intermediate answers (score 4-6), when the recommendation step renders, then the Forms tier card displays the recommended copy: "You're in good shape to dive into **My Plan** forms. Fill in your numbers section by section. The Planning Assistant is always available if you want a second opinion."

- **AC 3:** Given a new franchisee completes onboarding with expert answers (score 7+), when the recommendation step renders, then the Quick Entry tier card displays the recommended copy: "You've got this. Head straight to **Reports** and build your plan inline — everything's editable. No hand-holding required."

- **AC 4:** Given any recommendation is shown, when a tier is NOT the recommended one, then it displays its short description instead of the recommended copy. Specifically:
  - Planning Assistant (non-recommended): "A conversational guide that walks you through your plan step by step."
  - Forms (non-recommended): "Build your plan section by section with structured input forms."
  - Quick Entry (non-recommended): "Jump right into the data. Everything's editable inline."

- **AC 5:** Given the recommendation step is displayed, when the user clicks a non-recommended tier, then that tier becomes selected (checkmark, primary border) but the copy does NOT change — the recommended tier still shows its `recommendedCopy` and non-recommended tiers still show their `shortDescription`. The override is a selection action, not a copy swap.

- **AC 6:** Given the recommendation step is displayed, when the user clicks "Get Started" with any tier selected (recommended or overridden), then the selected tier is persisted via `/api/onboarding/select-tier` and the user is redirected to the dashboard. No change to this existing behavior.

- **AC 7:** Given the `TIER_INFO` constant is updated, when TypeScript compiles, then there are no type errors. The `description` field is replaced by `shortDescription` and `recommendedCopy` fields, and all references in JSX are updated accordingly.

- **AC 8:** Given the existing E2E tests in `e2e/onboarding.spec.ts`, when the test suite runs after changes, then all existing tests pass without modification.

## Implementation Guidance

### Architecture Patterns to Follow

- Extend the existing `TIER_INFO` constant pattern — keep it as a static `Record<string, {...}>` at the top of the file
- Use the existing `isRecommended` boolean (already computed at line 165) to conditionally render `tier.recommendedCopy` vs `tier.shortDescription`
- Bold text in recommended copy (e.g., "**Planning Assistant**") should render as `<strong>` tags or use Tailwind `font-semibold` on a `<span>`. Since this is JSX, use inline JSX elements rather than markdown parsing
- Maintain all existing `data-testid` attributes unchanged

### Anti-Patterns and Constraints

- Do NOT modify `server/routes/onboarding.ts` — this is a frontend-only change
- Do NOT change the scoring logic, question flow, or tier selection mechanism
- Do NOT add new dependencies or libraries — this is a copy change within existing patterns
- Do NOT remove or rename existing `data-testid` attributes
- Do NOT use markdown-to-JSX parsing for the bold text in recommended copy — use native JSX `<strong>` elements
- Do NOT change the "Your Recommended Approach" heading or the "You can change your preferred approach anytime" footer text — "approach" language is approved

### File Change Summary

| File | Change |
| ---- | ------ |
| `client/src/pages/onboarding.tsx` | Update `TIER_INFO` type and values: replace `description: string` with `shortDescription: string` and `recommendedCopy: JSX.Element \| string`. Update the JSX in the recommendation step to conditionally render `tier.recommendedCopy` when `isRecommended` is true, `tier.shortDescription` otherwise. |

### Dependencies

- None. No new libraries, no backend changes, no API changes. Purely a frontend copy update within existing patterns.

### Testing Guidance

- **Existing E2E tests:** Run `e2e/onboarding.spec.ts` to verify no regressions. These tests navigate through questions and verify the recommendation title appears, but do not assert on copy content — they should pass without changes.
- **Manual verification:** Navigate through onboarding with three different answer profiles to verify each persona's recommended copy appears correctly:
  1. All beginner answers → Planning Assistant recommended with Sam copy
  2. All intermediate answers → Forms recommended with Chris copy
  3. All expert answers → Quick Entry recommended with Maria copy
- **Override verification:** On any recommendation screen, click a non-recommended tier and verify the copy does NOT swap — only the selection state changes.
- **TypeScript compilation:** Ensure `tsc` passes with no errors after updating the `TIER_INFO` type.

### Notes

- The `tierDescription` field returned by the backend (`server/routes/onboarding.ts`) is now orphaned — it's computed but never used by the frontend. This is a minor cleanup opportunity for a future task but is explicitly out of scope for this spec.
- The recommended copy contains bold text (e.g., "**Planning Assistant**"). Since this is JSX, the implementer should use `<strong>` elements inline in the copy strings, which means `recommendedCopy` will be typed as `JSX.Element` rather than `string`. Alternatively, the copy can remain as plain strings with the bold tier name handled separately in the JSX template — either approach is acceptable as long as the bold rendering is preserved.
- This is the first item in the UX Gap Analysis implementation order. After completion, the next recommended item is B.3 (Dashboard Empty State Copy).
