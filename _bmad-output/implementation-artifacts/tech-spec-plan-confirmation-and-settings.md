---
title: 'Plan Confirmation Model & Franchisee Plan Settings'
slug: 'plan-confirmation-and-settings'
created: '2026-02-23'
status: 'ready-for-dev'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['React 18.3', 'TypeScript 5.6', 'Tailwind CSS 3.4', 'shadcn/ui (Radix)', 'Wouter 3.3', 'TanStack Query v5', 'Lucide React', 'Express 5', 'Drizzle ORM 0.39', 'PostgreSQL', 'Drizzle-Zod 0.7', 'Zod 3.24', 'Framer Motion 11.13']
files_to_modify: ['shared/financial-engine.ts', 'shared/schema.ts', 'shared/plan-initialization.ts', 'client/src/lib/plan-completeness.ts', 'client/src/components/planning/plan-completeness-bar.tsx', 'client/src/components/shared/financial-input-editor.tsx', 'client/src/hooks/use-field-editing.ts', 'client/src/components/shared/source-badge.tsx', 'client/src/components/planning/document-preview-widget.tsx', 'client/src/components/planning/financial-statements.tsx', 'client/src/pages/dashboard.tsx', 'client/src/pages/planning-workspace.tsx', 'client/src/components/planning/data-sharing-settings.tsx', 'server/routes/plans.ts', 'server/storage.ts']
code_patterns: ['FinancialFieldValue wrapper pattern', 'updateFieldValue/resetFieldToDefault helpers', 'makeField/makeFieldArray5/makeFieldArray60 factories', 'WorkspaceView state machine (my-plan|reports|scenarios|settings)', 'queueSave auto-save pipeline', 'useFieldEditing hook', 'SectionProgress completeness tracking', 'PATCH /api/plans/:planId with updatePlanSchema', 'CategorySection/FieldRow component hierarchy', 'TanStack Query v5 object-form with staleTime: Infinity']
test_patterns: ['Vitest for shared/ and server/ unit tests', 'Playwright E2E in e2e/ directory', 'run_test tool for browser interaction validation']
party_mode_recommendations_accepted: [1, 2, 3, 4, 5, 6, 7, 8]
---

# Tech-Spec: Plan Confirmation Model & Franchisee Plan Settings

**Created:** 2026-02-23
**Party Mode Review:** 2026-02-23 (5 agents, all PASS, 8 recommendations accepted)

## Overview

### Problem Statement

Two related gaps prevent franchisees from communicating their plan readiness and franchise journey status:

1. **Completeness tracking measures the wrong thing.** The plan progress bars track "fields customized" (`source !== "brand_default"`), penalizing franchisees who accept correct brand defaults. A franchisee whose royalty, ad fund, and other brand-set numbers are already correct shows 0% progress. The document preview DRAFT watermark persists even when the plan is genuinely ready. The right metric is "fields the franchisee has reviewed and committed to" — regardless of whether they changed the value.

2. **No franchisee UI for plan settings.** The `pipelineStage`, `targetMarket`, and `targetOpenQuarter` database columns exist but have no franchisee-facing UI. The franchisor Pipeline Dashboard reads `pipelineStage` but every franchisee is stuck at "Planning" because there's no input mechanism. Franchisees have no way to communicate milestones (financing approved, site found, on track to open) or provide location details.

### Solution

**Feature A — Field Confirmation Model:** Add a `confirmed` boolean to `FinancialFieldValue`. Completeness is driven by confirmed fields, not edited fields. Confirmation and editing are always separate explicit actions. Three visual states for the lock icon: outline (unconfirmed default), pulsing (edited but not confirmed — the nudge), filled with checkmark (confirmed). Forms view supports per-field confirmation. Reports view supports section-level batch confirmation with remaining count (v1). Royalty and marketing % (almost always brand defaults) serve as a built-in tutorial for the confirmation pattern.

**Feature B — Plan Settings:** Add a "My Status" section to the existing Plan Settings workspace view exposing: pipeline stage (dropdown), target opening date (month/year precision), market area (text), location address (new DB field), and financing status (new DB field with 6-stage enum). Market and address are connected — market is known early, specific address comes later. Add a dashboard plan card CTA ("Update") that navigates franchisees to Plan Settings for discoverability.

### Scope

**In Scope:**
- `confirmed: boolean` field on `FinancialFieldValue` interface (required in TS, `optional().default(false)` in Zod for backward compat)
- Migration strategy for existing data (`confirmed: false` for all existing fields via Zod default)
- Updated completeness engine: `isConfirmed()` replaces `isEdited()` as the driver
- Forms view: per-field confirm/lock action with three visual states (outline → pulsing → filled+check)
- Reports view: section-level batch confirmation with "Confirm N remaining" count; checkmark when section fully confirmed
- Progress bar UI reframed: "fields confirmed" instead of "fields customized"
- Document preview DRAFT watermark driven by confirmed-field completeness
- Plan Settings UI in workspace settings: pipeline stage dropdown, target opening date (month/year), market area (text), location address (new column), financing status (new column, 6-stage enum)
- New DB columns: `targetOpenDate` (text, "YYYY-MM"), `locationAddress` (text), `financingStatus` (text enum)
- Migration: existing `targetOpenQuarter` values → `targetOpenDate` (Q1→01, Q2→04, Q3→07, Q4→10); keep old column as deprecated
- Dashboard plan card CTA: "Update" button with tooltip "Need to update the status or details of your plan?" linking to Plan Settings
- Royalty/marketing % confirmation as built-in tutorial flow for teaching the lock-in pattern
- Schema additions and `db:push` for new columns

**Out of Scope:**
- Inline cell-level lock toggles on individual cells in Reports view (future enhancement)
- Auto-inference of pipeline stage from data patterns
- Franchisor-side changes to Pipeline Dashboard (already reads `pipelineStage`)
- Changes to the financial engine calculation logic
- Changes to the What-If Scenario system
- Notifications or alerts when pipeline stage changes

## Context for Development

### Codebase Patterns

**Data Layer — FinancialFieldValue Wrapper Pattern:**
- `FinancialFieldValue` (shared/financial-engine.ts:25-32) wraps every user-editable financial number with metadata. The new `confirmed: boolean` will be the 7th field. **Required in TypeScript interface** (not optional) — the Zod schema handles `optional().default(false)` at the API boundary for backward compat with stored data (Party Mode Rec #5).
- Factory functions `makeField()`, `makeFieldArray5()`, `makeFieldArray60()` in shared/plan-initialization.ts — all must emit `confirmed: false`.
- `updateFieldValue()` stamps `source: "user_entry"`, `isCustom: true` — must NOT set `confirmed: true` (editing ≠ confirming).
- `resetFieldToDefault()` returns to brand default — must reset `confirmed: false`.
- For array fields (5-element or 60-element), confirming sets `confirmed: true` on ALL elements in the array, not just element [0] (Party Mode Rec #7).

**Completeness Engine:**
- `plan-completeness.ts` has `isEdited()` → replace with `isConfirmed()` checking `field.confirmed === true`.
- `SectionProgress` interface: rename `edited` to `confirmed`.
- `computeCompleteness()` automatically shifts when `isEdited` becomes `isConfirmed`.
- `hasAnyUserEdits()` is a separate concern — keep as-is.

**Forms View — Field Editing Pipeline:**
- `FinancialInputEditor` renders `CategorySection` → `FieldRow` hierarchy.
- `FieldRow` currently has: display value (click to edit), `SourceBadge`, and reset button.
- New: lock/confirm icon button with three visual states (Party Mode Rec #1):
  - `brand_default + not confirmed` → outline lock icon (Lock from lucide), subtle, always available
  - `user_entry/ai_populated + not confirmed` → pulsing lock icon with accent color (the nudge, Framer Motion `animate`)
  - `any source + confirmed` → filled lock icon with green check overlay (LockKeyhole or Lock with Check)
- `useFieldEditing` hook needs new `handleConfirmField(category, fieldName)`.

**Reports View — Section-Level Batch Confirm:**
- `FinancialStatements` component receives `plan`, `queueSave`, `isSaving`.
- Batch confirm shows "Confirm N remaining fields" count; zero-count sections show checkmark (Party Mode Rec #2).
- Batch confirm iterates `FIELD_METADATA` categories (same path as `computeSectionProgress()`) for consistency (Party Mode Rec #8).

**Workspace & Navigation:**
- `WorkspaceViewContext` manages views: `my-plan | reports | scenarios | settings`.
- Settings view currently renders only `DataSharingSettings`. Plan Status settings added alongside.
- Dashboard CTA uses `Link` to `/plans/{planId}` with a query param or similar mechanism to activate settings view.

**Plans API & Schema:**
- `PATCH /api/plans/:planId` via `updatePlanSchema` — new columns flow through automatically.
- `projectPlanForFranchisor()` projection needs new fields: `targetOpenDate`, `locationAddress`, `financingStatus`.
- Keep `targetOpenQuarter` column as deprecated — don't delete (Party Mode Rec #6). New code reads `targetOpenDate` only.

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `shared/financial-engine.ts` | `FinancialFieldValue` interface (lines 25-32), `PlanFinancialInputs` |
| `shared/schema.ts` | `financialFieldValueSchema` (line 228), `plans` table, `updatePlanSchema` |
| `shared/plan-initialization.ts` | `makeField()` factories, `updateFieldValue()`, `resetFieldToDefault()`, `migratePlanFinancialInputs()` |
| `client/src/lib/plan-completeness.ts` | `isEdited()` → `isConfirmed()`, `SectionProgress`, `computeCompleteness()` |
| `client/src/components/planning/plan-completeness-bar.tsx` | Progress bar — "fields customized" → "fields confirmed" |
| `client/src/components/shared/financial-input-editor.tsx` | `CategorySection`, `FieldRow` — per-field confirm button |
| `client/src/hooks/use-field-editing.ts` | Edit state — needs `handleConfirmField()` |
| `client/src/components/shared/source-badge.tsx` | Source badges |
| `client/src/components/planning/document-preview-widget.tsx` | DRAFT watermark (`completeness < 50`) |
| `client/src/components/planning/financial-statements.tsx` | Reports view — batch confirm integration |
| `client/src/pages/dashboard.tsx` | Plan cards — "Update" CTA |
| `client/src/pages/planning-workspace.tsx` | Settings view routing |
| `client/src/components/planning/data-sharing-settings.tsx` | Current settings component |
| `server/routes/plans.ts` | PATCH endpoint, `projectPlanForFranchisor()` |
| `server/storage.ts` | `updatePlan()` |
| `client/src/contexts/WorkspaceViewContext.tsx` | `navigateToSettings()` |
| `_bmad-output/project-context.md` | AI agent rules: auto-save, field editing, query keys |

### Technical Decisions

1. **Editing ≠ confirming.** Editing a field changes its value but does not set `confirmed: true`. The user must explicitly click the lock icon.
2. **Three visual states for lock icon.** Outline (unconfirmed brand default), pulsing accent (edited but unconfirmed — the nudge), filled+check (confirmed).
3. **`confirmed` is required in TS, optional in Zod.** `FinancialFieldValue.confirmed: boolean` in the interface. `financialFieldValueSchema` uses `z.boolean().optional().default(false)` so existing stored data without the field deserializes as `false`.
4. **Array fields confirm entirely.** Confirming a 5-element or 60-element array sets `confirmed: true` on ALL elements, not just [0].
5. **`targetOpenQuarter` → `targetOpenDate` migration.** Existing values mapped: Q1→`YYYY-01`, Q2→`YYYY-04`, Q3→`YYYY-07`, Q4→`YYYY-10`. Old column kept as deprecated, not deleted.
6. **Financing status enum.** 6 stages: `not_started | exploring | applied | pre_approved | approved | funded` (includes "applied" per Party Mode Rec #3).
7. **Batch confirm in Reports iterates `FIELD_METADATA` categories.** Same iteration path as `computeSectionProgress()` for consistency.
8. **Batch confirm shows count.** "Confirm N remaining fields" when N > 0; checkmark icon when N = 0.
9. **`resetFieldToDefault()` clears `confirmed`.** A reset field must be re-confirmed.

## Acceptance Criteria

### Feature A — Field Confirmation Model

**AC-A1: Data model.** Given the `FinancialFieldValue` interface in `shared/financial-engine.ts`, when a developer inspects the type, then it includes `confirmed: boolean` as a required field. The Zod schema `financialFieldValueSchema` includes `confirmed` as `z.boolean().optional().default(false)`.

**AC-A2: Field factories emit `confirmed: false`.** Given `makeField()`, `makeFieldArray5()`, `makeFieldArray60()` in `shared/plan-initialization.ts`, when a new field is created (including via `buildPlanFinancialInputs()`), then `confirmed` is `false`.

**AC-A3: `updateFieldValue()` preserves confirmation state.** Given a field with `confirmed: true`, when `updateFieldValue()` is called (user edits the value), then the returned field still has `confirmed: true`. Editing does not reset confirmation.

**AC-A4: `resetFieldToDefault()` clears confirmation.** Given a confirmed field, when `resetFieldToDefault()` is called, then the returned field has `confirmed: false` and `source: "brand_default"`.

**AC-A5: Completeness engine uses confirmation.** Given `plan-completeness.ts`, when `computeSectionProgress()` runs, then it counts fields where `confirmed === true` (not `source !== "brand_default"`). The `SectionProgress` interface uses `confirmed: number` instead of `edited: number`.

**AC-A6: Progress bar shows confirmed count.** Given the `PlanCompletenessBar` component, when rendered, then it displays "{confirmed}/{total} fields confirmed" (not "customized"). Section bars reflect confirmed field counts.

**AC-A7: Forms view — lock icon three states.** Given a `FieldRow` in the Forms view:
- When field is `brand_default` and `confirmed: false`, then an outline lock icon is visible (clickable to confirm).
- When field is `user_entry` or `ai_populated` and `confirmed: false`, then a pulsing lock icon with accent color is visible (the nudge).
- When field has `confirmed: true` (any source), then a filled lock icon with green check overlay is visible.

**AC-A8: Forms view — confirm action.** Given a `FieldRow` with an unconfirmed field, when the user clicks the lock icon, then the field's `confirmed` is set to `true`, the icon transitions to the filled+check state, and the change is persisted via `queueSave()`.

**AC-A9: Forms view — confirm array fields entirely.** Given a field backed by a 5-element or 60-element array (e.g., `royaltyPct`, `monthlyAuv`), when the user clicks the lock icon, then ALL elements in the array have `confirmed` set to `true`.

**AC-A10: Reports view — section batch confirm.** Given the Reports view (financial statements), when a section has unconfirmed fields, then a "Confirm N remaining fields" button is visible for that section. Clicking it sets `confirmed: true` on all unconfirmed fields in that section and persists via `queueSave()`.

**AC-A11: Reports view — section fully confirmed.** Given a section where all fields are confirmed, then the batch confirm button is replaced with a checkmark icon indicating full confirmation.

**AC-A12: DRAFT watermark unchanged behavior.** Given the `DocumentPreviewWidget`, the DRAFT watermark logic (`completeness < 50`) continues to work correctly, but now driven by confirmed-field completeness instead of edited-field completeness.

**AC-A13: Backward compatibility.** Given an existing plan stored without `confirmed` fields in its JSONB, when loaded via the API, then all fields default to `confirmed: false`. No migration script needed — Zod `default(false)` handles it at deserialization.

### Feature B — Plan Settings

**AC-B1: New DB columns.** Given the `plans` table in `shared/schema.ts`, when inspected, then it includes: `targetOpenDate` (text, nullable), `locationAddress` (text, nullable), `financingStatus` (text, nullable, typed as `"not_started" | "exploring" | "applied" | "pre_approved" | "approved" | "funded"`). The existing `targetOpenQuarter` column remains (deprecated).

**AC-B2: Migration of targetOpenQuarter.** Given existing plans with `targetOpenQuarter` values (e.g., "Q3 2026"), when the migration/data-fix runs, then `targetOpenDate` is populated with "2026-07" format (Q1→01, Q2→04, Q3→07, Q4→10). Plans without `targetOpenQuarter` have `targetOpenDate` as null.

**AC-B3: Plan Settings UI.** Given a franchisee navigating to the Settings workspace view, when the page loads, then they see a "My Status" card (above the Data Sharing card) with:
- Pipeline stage dropdown (Planning, Site Evaluation, Financing, Construction, Open)
- Target opening date (month/year picker or two dropdowns for month and year)
- Market area (text input)
- Location address (text input, labeled "Location Address (when known)")
- Financing status dropdown (Not Started, Exploring, Applied, Pre-Approved, Approved, Funded)

**AC-B4: Plan Settings save.** Given changes to any plan settings field, when the user modifies a value, then the change is saved via `PATCH /api/plans/:planId` with debounce or explicit save button. Toast confirms "Plan status updated."

**AC-B5: Pipeline projection includes new fields.** Given `projectPlanForFranchisor()` in `server/routes/plans.ts`, when a plan is projected for franchisor view, then the projection includes `targetOpenDate`, `locationAddress`, and `financingStatus` alongside existing `pipelineStage` and `targetMarket`.

**AC-B6: Dashboard "Update" CTA.** Given a franchisee viewing the Dashboard, when they see a plan card, then an "Update" button/link is visible (not inside the card's main clickable area). Hovering shows tooltip "Need to update the status or details of your plan?" Clicking navigates to the plan's Settings workspace view.

**AC-B7: Settings view composition.** Given the `planning-workspace.tsx` settings case, when rendered, then it shows the Plan Status settings component AND the Data Sharing settings component, in that order (status first, sharing second).

### Edge Cases

**AC-E1: Confirm then reset.** Given a confirmed field, when the user resets it to brand default, then `confirmed` becomes `false`. The field returns to "outline lock" state.

**AC-E2: Confirm then edit.** Given a confirmed field, when the user edits its value, then `confirmed` remains `true` (they already committed to this field — changing the value doesn't un-commit).

**AC-E3: Empty plan settings.** Given a plan with no `targetOpenDate`, `locationAddress`, or `financingStatus`, when the Settings UI loads, then fields show empty/placeholder states. Pipeline stage defaults to "Planning" (existing default).

**AC-E4: All fields confirmed.** Given a plan where every field is confirmed, then the overall completeness is 100% and the DRAFT watermark does not appear.

## Implementation Guidance

### Architecture Patterns to Follow

1. **Extend `FinancialFieldValue` interface** — add `confirmed: boolean` as the 7th field. Follow the existing pattern of required fields in the TS interface.
2. **Factory pattern** — `makeField()` already creates a complete `FinancialFieldValue`. Add `confirmed: false` to the return object. All callers inherit the change.
3. **`useFieldEditing` hook extension** — add `handleConfirmField(category: string, fieldName: string)` following the same pattern as `handleReset`. It should resolve the category object, find the field, clone with `confirmed: true`, build updated inputs, and call `onSave()`. For array fields, map ALL elements.
4. **Component composition** — the Plan Status settings component should be a new component (e.g., `PlanStatusSettings`) colocated with `DataSharingSettings`. Both render inside the settings case in `planning-workspace.tsx`.
5. **Auto-save for plan settings** — plan settings changes (pipeline stage, etc.) should use `PATCH /api/plans/:planId` directly via a mutation (not the financial inputs auto-save pipeline). These are top-level plan columns, not nested JSONB.
6. **Dashboard CTA** — add below the plan card's main content area (inside `<Card>` but outside the `<Link>` to the plan). Use `Link` from wouter to `/plans/{planId}?view=settings` or similar mechanism to trigger settings view on load.
7. **Batch confirm iteration** — use `CATEGORY_ORDER` × `FIELD_METADATA[category]` (same as `computeSectionProgress()`) to find unconfirmed fields. Build a single updated `financialInputs` object with all fields in the section confirmed, then call `queueSave()` once.

### Anti-Patterns and Constraints

1. **DO NOT auto-confirm on edit.** `updateFieldValue()` must preserve the existing `confirmed` value. This is the core design decision.
2. **DO NOT delete `targetOpenQuarter` column.** Keep it deprecated but present. Existing data should not be lost. New code reads only `targetOpenDate`.
3. **DO NOT modify `calculateProjections()` or the financial engine.** The `confirmed` field is UI/metadata — the engine never sees it. `unwrapForEngine()` strips all metadata.
4. **DO NOT use separate API endpoints for confirmation.** Confirmation changes flow through the existing `PATCH /api/plans/:planId` → `financialInputs` JSONB update path, via the auto-save pipeline (`queueSave()`).
5. **DO NOT make `confirmed` optional in the TypeScript interface.** It's optional only in the Zod schema for backward compat. All TypeScript code should treat it as `boolean`, never `boolean | undefined`.
6. **DO NOT modify `hasAnyUserEdits()`.** It serves a different purpose (guardian engine) and should continue checking `source !== "brand_default"`.
7. **DO NOT use a new workspace view.** Plan Status settings go inside the existing `settings` workspace view, not a new view type.

### File Change Summary

**Shared Layer (3 files):**
| File | Changes |
|------|---------|
| `shared/financial-engine.ts` | Add `confirmed: boolean` to `FinancialFieldValue` interface |
| `shared/schema.ts` | Add `confirmed` to `financialFieldValueSchema`; add `targetOpenDate`, `locationAddress`, `financingStatus` columns to `plans` table; update `insertPlanSchema` and `updatePlanSchema` |
| `shared/plan-initialization.ts` | Add `confirmed: false` to `makeField()`; ensure `updateFieldValue()` preserves `confirmed`; ensure `resetFieldToDefault()` sets `confirmed: false`; add `confirmFieldValue()` helper |

**Client Layer (9 files):**
| File | Changes |
|------|---------|
| `client/src/lib/plan-completeness.ts` | Replace `isEdited()` with `isConfirmed()`; rename `SectionProgress.edited` → `.confirmed` |
| `client/src/components/planning/plan-completeness-bar.tsx` | Update labels: "fields confirmed"; section names and counts |
| `client/src/components/shared/financial-input-editor.tsx` | Add lock/confirm icon to `FieldRow` with three visual states; wire `handleConfirmField` |
| `client/src/hooks/use-field-editing.ts` | Add `handleConfirmField(category, fieldName)` for single-field and array-field confirmation |
| `client/src/components/shared/source-badge.tsx` | No changes expected (confirmation is separate visual from source) |
| `client/src/components/planning/financial-statements.tsx` | Add section-level batch confirm UI with "Confirm N remaining" / checkmark |
| `client/src/pages/dashboard.tsx` | Add "Update" CTA button on plan cards linking to settings view |
| `client/src/pages/planning-workspace.tsx` | Compose Plan Status settings + Data Sharing settings in the settings case |
| `client/src/components/planning/data-sharing-settings.tsx` | Minor: may need layout adjustment to coexist with Plan Status settings above it |

**New Components (1 file):**
| File | Purpose |
|------|---------|
| `client/src/components/planning/plan-status-settings.tsx` | Plan Status form: pipeline stage, target opening date, market area, location address, financing status |

**Server Layer (2 files):**
| File | Changes |
|------|---------|
| `server/routes/plans.ts` | Update `projectPlanForFranchisor()` to include new fields; migration script for `targetOpenQuarter` → `targetOpenDate` |
| `server/storage.ts` | No interface changes needed — `updatePlan()` already accepts partial plan updates |

### Dependencies

- **No new external libraries required.** Framer Motion (already installed) handles the pulsing animation. Lucide React (already installed) provides `Lock`, `LockKeyhole`, `Check` icons.
- **Database schema change:** `db:push` required after adding `targetOpenDate`, `locationAddress`, `financingStatus` columns.
- **No backend service dependencies.** All changes are within the existing Express + Drizzle stack.
- **Depends on:** existing auto-save pipeline (`usePlanAutoSave.queueSave()`), existing `PATCH /api/plans/:planId` endpoint, existing `WorkspaceViewContext`.

### Testing Guidance

**Unit Tests (Vitest):**
- `shared/plan-initialization.test.ts`: Verify `makeField()` emits `confirmed: false`; `updateFieldValue()` preserves `confirmed`; `resetFieldToDefault()` sets `confirmed: false`; new `confirmFieldValue()` sets `confirmed: true`.
- `client/src/lib/plan-completeness.test.ts` (if exists, or create): Verify `isConfirmed()` returns true only when `confirmed === true`; verify `computeSectionProgress()` counts confirmed fields correctly; verify backward compat (field without `confirmed` property treated as unconfirmed).

**E2E Tests (Playwright / run_test):**
- Navigate to a plan's Forms view. Verify lock icons appear on fields. Click a lock icon. Verify it transitions to confirmed state. Verify progress bar count increases.
- Navigate to Reports view. Verify section batch confirm buttons with counts. Click "Confirm N remaining." Verify count drops to 0 and checkmark appears.
- Navigate to Dashboard. Verify "Update" CTA on plan card. Click it. Verify navigation to Settings view.
- In Settings view, verify Plan Status form renders with pipeline stage dropdown, target opening date, market area, location address, financing status. Change pipeline stage. Verify save toast. Reload. Verify persisted value.

**Manual Verification:**
- Load an existing plan (pre-`confirmed` field). Verify all fields show as unconfirmed (0% progress). Edit a field — verify lock pulses. Click lock — verify fills. Reset field — verify lock returns to outline.
- Confirm royalty % and ad fund % without changing their values (brand default confirmation tutorial flow).

### Notes

**High-Risk Items:**
1. **Backward compatibility of JSONB.** Existing plans stored without `confirmed` field. Mitigated by `z.boolean().optional().default(false)` in Zod. Risk: if any code path bypasses Zod validation when reading JSONB, `confirmed` could be `undefined`. Mitigation: TypeScript's required field + strict mode will catch these at compile time.
2. **Progress bar regression.** Changing from "edited" to "confirmed" will show 0% for ALL existing plans. This is intentional and correct — but may surprise users who previously saw progress. Consider a one-time toast or callout explaining the change.
3. **`targetOpenQuarter` → `targetOpenDate` migration.** Parsing existing values could fail if format is inconsistent. Write defensive parsing with fallback to null.

**Future Considerations (Out of Scope):**
- Inline cell-level lock toggles in Reports (per-cell confirmation for Maria)
- Auto-suggest pipeline stage based on plan completion patterns
- Confirmation analytics: track which fields users confirm fastest/slowest
- Bulk confirm entire plan ("I've reviewed everything") shortcut
- Location address geocoding / map integration
- Notification to franchisor when pipeline stage changes
