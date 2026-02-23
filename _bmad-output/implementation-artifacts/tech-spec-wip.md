---
title: 'Onboarding Copy Refresh'
slug: 'onboarding-copy-refresh'
created: '2026-02-23'
status: 'in-progress'
stepsCompleted: [1]
tech_stack: ['React 18', 'TypeScript', 'Tailwind CSS', 'shadcn/ui']
files_to_modify: ['client/src/pages/onboarding.tsx']
code_patterns: ['TIER_INFO constant', 'recommendation step conditional rendering']
test_patterns: ['Playwright E2E via data-testid selectors']
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

- `TIER_INFO` is a `Record<string, { label, description, icon }>` constant at the top of `onboarding.tsx`
- The recommendation step renders all three tiers in a list, highlighting the recommended one with a "Recommended" badge
- The user can click any tier to override the recommendation before clicking "Get Started"
- The backend returns `{ recommendedTier, tierDescription }` but the frontend only uses `recommendedTier` — `tierDescription` is not displayed

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `client/src/pages/onboarding.tsx` | Onboarding page — the only file to modify |
| `server/routes/onboarding.ts` | Backend onboarding routes — read-only reference for scoring logic |
| `_bmad-output/planning-artifacts/ux-gap-analysis-2026-02-23.md` | Source of truth for desired copy |

### Technical Decisions

- Persona-specific copy lives in the frontend only (user's choice) — backend returns the tier key, frontend maps to copy
- Keep "approach" language — no need to change to "starting point" / "recommended path" (user's choice)
- No structural or layout changes — copy/language only

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
