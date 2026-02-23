---
title: 'Plan Confirmation Model & Franchisee Plan Settings'
slug: 'plan-confirmation-and-settings'
created: '2026-02-23'
status: 'in-progress'
stepsCompleted: [1, 2]
tech_stack: ['React 18.3', 'TypeScript 5.6', 'Tailwind CSS 3.4', 'shadcn/ui (Radix)', 'Wouter 3.3', 'TanStack Query v5', 'Lucide React', 'Express 5', 'Drizzle ORM 0.39', 'PostgreSQL', 'Drizzle-Zod 0.7', 'Zod 3.24', 'Framer Motion 11.13']
files_to_modify: ['shared/financial-engine.ts', 'shared/schema.ts', 'shared/plan-initialization.ts', 'client/src/lib/plan-completeness.ts', 'client/src/components/planning/plan-completeness-bar.tsx', 'client/src/components/shared/financial-input-editor.tsx', 'client/src/hooks/use-field-editing.ts', 'client/src/components/shared/source-badge.tsx', 'client/src/components/planning/document-preview-widget.tsx', 'client/src/components/planning/financial-statements.tsx', 'client/src/pages/dashboard.tsx', 'client/src/pages/planning-workspace.tsx', 'client/src/components/planning/data-sharing-settings.tsx', 'server/routes/plans.ts', 'server/storage.ts']
code_patterns: ['FinancialFieldValue wrapper pattern', 'updateFieldValue/resetFieldToDefault helpers', 'makeField/makeFieldArray5/makeFieldArray60 factories', 'WorkspaceView state machine (my-plan|reports|scenarios|settings)', 'queueSave auto-save pipeline', 'useFieldEditing hook with handleEditStart/handleEditCommit/handleEditCancel', 'SectionProgress completeness tracking', 'PATCH /api/plans/:planId with updatePlanSchema validation', 'CategorySection/FieldRow component hierarchy in Forms', 'TanStack Query v5 object-form with staleTime: Infinity']
test_patterns: ['Vitest for shared/ and server/ unit tests', 'Playwright E2E in e2e/ directory', 'Mock-based route tests with vi.mock and supertest', 'run_test tool for browser interaction validation']
---

# Tech-Spec: Plan Confirmation Model & Franchisee Plan Settings

**Created:** 2026-02-23

## Overview

### Problem Statement

Two related gaps prevent franchisees from communicating their plan readiness and franchise journey status:

1. **Completeness tracking measures the wrong thing.** The plan progress bars track "fields customized" (source !== brand_default), penalizing franchisees who accept correct brand defaults. A franchisee whose royalty, ad fund, and other brand-set numbers are already correct shows 0% progress. The document preview DRAFT watermark persists even when the plan is genuinely ready. The right metric is "fields the franchisee has reviewed and committed to" — regardless of whether they changed the value.

2. **No franchisee UI for plan settings.** The `pipelineStage`, `targetMarket`, and `targetOpenQuarter` database columns exist but have no franchisee-facing UI. The franchisor Pipeline Dashboard reads `pipelineStage` but every franchisee is stuck at "Planning" because there's no input mechanism. Franchisees have no way to communicate milestones (financing approved, site found, on track to open) or provide location details.

### Solution

**Feature A — Field Confirmation Model:** Add a `confirmed` boolean to `FinancialFieldValue`. Completeness is driven by confirmed fields, not edited fields. Confirmation and editing are always separate explicit actions. A pulsing lock icon nudges users to confirm after editing. Forms view supports per-field confirmation. Reports view supports section-level batch confirmation (v1). Royalty and marketing % (almost always brand defaults) serve as a built-in tutorial for the confirmation pattern.

**Feature B — Plan Settings:** Add a "My Status" section to the existing Plan Settings workspace view exposing: pipeline stage (dropdown), target opening date (month/year precision), market area (text), location address (new DB field), and financing status (new DB field). Market and address are connected — market is known early, specific address comes later. Add a dashboard plan card CTA ("Update") that navigates franchisees to Plan Settings for discoverability.

### Scope

**In Scope:**
- `confirmed` field on `FinancialFieldValue` interface and Zod schema (default `false`)
- Migration strategy for existing data (`confirmed: false` for all existing fields)
- Updated completeness engine: `isConfirmed()` replaces `isEdited()` as the driver
- Forms view: per-field confirm/lock action with pulsing lock icon nudge after editing
- Reports view: section-level batch confirmation accessible from progress bar (v1)
- Progress bar UI reframed: "fields confirmed" instead of "fields customized"
- Document preview DRAFT watermark driven by confirmed-field completeness
- Plan Settings UI in workspace settings: pipeline stage dropdown, target opening date (month/year), market area (text), location address (new column), financing status (new column or JSONB)
- New DB columns for location address and financing status
- Dashboard plan card CTA: "Update" button with tooltip "Need to update the status or details of your plan?" linking to Plan Settings
- Royalty/marketing % confirmation as built-in tutorial flow for teaching the lock-in pattern
- Schema additions and `db:push` for new columns

**Out of Scope:**
- Inline cell-level lock toggles on individual cells in Reports view (future enhancement)
- Auto-inference of pipeline stage from data patterns
- Franchisor-side changes to Pipeline Dashboard (already reads `pipelineStage`)
- Changes to the financial engine or calculation logic
- Changes to the What-If Scenario system
- Notifications or alerts when pipeline stage changes

## Context for Development

### Codebase Patterns

**Data Layer — FinancialFieldValue Wrapper Pattern:**
- `FinancialFieldValue` (shared/financial-engine.ts:25-32) wraps every user-editable financial number with 6 metadata fields: `currentValue`, `source`, `brandDefault`, `item7Range`, `lastModifiedAt`, `isCustom`. The new `confirmed` boolean will be the 7th.
- Factory functions `makeField()`, `makeFieldArray5()`, `makeFieldArray60()` in shared/plan-initialization.ts create new fields — all must emit `confirmed: false`.
- `updateFieldValue()` stamps `source: "user_entry"`, `isCustom: true` — must NOT auto-set `confirmed: true` (per user decision: editing and confirming are separate).
- `resetFieldToDefault()` returns to brand default — must reset `confirmed: false` (field was un-confirmed by resetting).
- Zod schema `financialFieldValueSchema` in shared/schema.ts validates at API boundary — needs `confirmed: z.boolean().optional().default(false)` for backward compatibility with existing stored data.

**Completeness Engine:**
- `plan-completeness.ts` has `isEdited()` → checks `source !== "brand_default"`. Replace with `isConfirmed()` → checks `field.confirmed === true`.
- `SectionProgress` interface has `edited: number` → rename to `confirmed: number`.
- `computeCompleteness()` aggregates across sections → automatically shifts when `isEdited()` becomes `isConfirmed()`.
- `hasAnyUserEdits()` used by guardian engine — keep as-is (separate concern from confirmation).
- `PlanCompletenessBar` shows "{edited}/{total} fields customized" → "{confirmed}/{total} fields confirmed".

**Forms View — Field Editing Pipeline:**
- `FinancialInputEditor` renders `CategorySection` → `FieldRow` hierarchy.
- `FieldRow` currently has: display value (click to edit), `SourceBadge`, and reset button (for user_entry only).
- New: Add lock/confirm icon button in the action column. After editing (source changes to user_entry), lock icon pulses as a nudge. For brand_default fields, lock icon is always available (confirm without changing value). For already-confirmed fields, show filled lock.
- `useFieldEditing` hook manages edit state — needs new `handleConfirmField(category, fieldName)` that sets `confirmed: true` on the field and triggers `onSave`.

**Reports View — Section-Level Batch Confirm:**
- `FinancialStatements` component (financial-statements.tsx) receives `plan`, `queueSave`, `isSaving`.
- Currently has `PlanCompletenessBar` integration via imports. Add section-level "Confirm All" buttons to the progress bar or as a new strip below the tab header.
- Batch confirm iterates all fields in a section, sets `confirmed: true`, and calls `queueSave`.

**Workspace View State Machine:**
- `WorkspaceViewContext` manages 4 views: `my-plan | reports | scenarios | settings`. Settings view currently renders only `DataSharingSettings`.
- Plan Settings ("My Status") will be a new component rendered alongside `DataSharingSettings` in the settings workspace view.
- `navigateToSettings()` already exists — dashboard CTA can use it via plan link + context.

**Auto-Save Pipeline:**
- All plan modifications go through `usePlanAutoSave.queueSave()` — field confirmation saves follow this path.
- `queueSave({ financialInputs: updatedInputs })` triggers debounced PATCH.

**Plans API:**
- `PATCH /api/plans/:planId` accepts partial updates via `updatePlanSchema`. New plan settings fields (pipelineStage, targetOpenDate, targetMarket, locationAddress, financingStatus) flow through this endpoint.
- Pipeline projection `projectPlanForFranchisor()` already includes `pipelineStage`, `targetMarket`, `targetOpenQuarter` — will need to include new fields.

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `shared/financial-engine.ts` | `FinancialFieldValue` interface definition (lines 25-32), `PlanFinancialInputs` interface |
| `shared/schema.ts` | `financialFieldValueSchema` Zod schema (line 228), `plans` table definition (pipelineStage, targetMarket, targetOpenQuarter columns), `updatePlanSchema` |
| `shared/plan-initialization.ts` | `makeField()`, `makeFieldArray5()`, `makeFieldArray60()` factories; `updateFieldValue()`, `resetFieldToDefault()` helpers; `migratePlanFinancialInputs()` |
| `client/src/lib/plan-completeness.ts` | `isEdited()` → must become `isConfirmed()`, `SectionProgress`, `computeCompleteness()`, `computeSectionProgress()` |
| `client/src/components/planning/plan-completeness-bar.tsx` | Progress bar UI showing "fields customized" → "fields confirmed" |
| `client/src/components/shared/financial-input-editor.tsx` | `CategorySection`, `FieldRow` — where per-field confirm button lives |
| `client/src/hooks/use-field-editing.ts` | Edit state management — needs `handleConfirmField()` |
| `client/src/components/shared/source-badge.tsx` | Source indicator badges — may need "Confirmed" visual state |
| `client/src/components/planning/document-preview-widget.tsx` | DRAFT watermark logic (`completeness < 50`) — automatically shifts with engine change |
| `client/src/components/planning/financial-statements.tsx` | Reports view — needs section-level batch confirm integration |
| `client/src/pages/dashboard.tsx` | Plan cards — needs "Update" CTA button |
| `client/src/pages/planning-workspace.tsx` | Settings workspace view routing — renders `DataSharingSettings`, will add Plan Status section |
| `client/src/components/planning/data-sharing-settings.tsx` | Current settings component — Plan Status settings will be added alongside |
| `server/routes/plans.ts` | PATCH endpoint, `projectPlanForFranchisor()` — needs new fields in projection |
| `server/storage.ts` | Storage interface — `updatePlan()` already handles partial updates |
| `client/src/contexts/WorkspaceViewContext.tsx` | `navigateToSettings()` function for dashboard CTA |
| `_bmad-output/project-context.md` | AI agent rules: auto-save pipeline, field editing patterns, query key conventions |

### Technical Decisions

- Confirmation and editing are always separate explicit actions — editing does NOT auto-confirm
- A pulsing lock icon after editing provides a subtle nudge to confirm (Framer Motion `animate` pulse on the lock icon when field is edited but not yet confirmed)
- `confirmed` field uses `z.boolean().optional().default(false)` in Zod for backward compatibility — existing stored plans without `confirmed` will deserialize as `confirmed: false`
- Target opening date uses month/year precision (not just quarter) — existing `targetOpenQuarter` text column will be replaced/renamed to `targetOpenDate` (text, format "YYYY-MM")
- Market area and location address are connected but separate fields — market is known early, address comes later
- Section-level batch confirmation in Reports (v1) — inline cell locks deferred
- Brand default fields that haven't been touched start as `confirmed: false`
- New DB columns: `locationAddress` (text, nullable), `financingStatus` (text, nullable, enum: "not_started" | "exploring" | "pre_approved" | "approved" | "funded")
- Dashboard CTA navigates to `/plans/{planId}` with settings view active — uses `Link` to plan + workspace view context

## Acceptance Criteria

{acceptance_criteria — to be filled in Step 3}

## Implementation Guidance

### Architecture Patterns to Follow

{architecture_patterns — to be filled in Step 3}

### Anti-Patterns and Constraints

{anti_patterns — to be filled in Step 3}

### File Change Summary

{file_change_summary — to be filled in Step 3}

### Dependencies

{dependencies — to be filled in Step 3}

### Testing Guidance

{testing_guidance — to be filled in Step 3}

### Notes

{notes — to be filled in Step 3}
