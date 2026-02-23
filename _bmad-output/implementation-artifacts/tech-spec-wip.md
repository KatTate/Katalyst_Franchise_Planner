---
title: 'Onboarding Copy Refresh'
slug: 'onboarding-copy-refresh'
created: '2026-02-23'
status: 'in-progress'
stepsCompleted: [1, 2]
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

{acceptance_criteria}

## Implementation Guidance

### Architecture Patterns to Follow

{architecture_patterns}

### Anti-Patterns and Constraints

{anti_patterns}

### File Change Summary

{file_change_summary}

### Dependencies

{dependencies}

### Testing Guidance

{testing_guidance}

### Notes

{notes}
