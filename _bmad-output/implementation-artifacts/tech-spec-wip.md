---
title: 'Dashboard Enrichment — Completeness, Document Preview, and Empty State'
slug: 'dashboard-enrichment'
created: '2026-02-23'
status: 'in-progress'
stepsCompleted: [1, 2]
tech_stack: ['React 18', 'TypeScript', 'TanStack Query v5', 'shadcn/ui', 'Express 5', 'PostgreSQL', 'Drizzle ORM']
files_to_modify: ['client/src/pages/dashboard.tsx']
code_patterns: ['TanStack Query v5 object-form', 'existing component reuse', 'data-testid convention', 'useQuery for brand resolution', 'Plan type from @shared/schema']
test_patterns: ['Playwright E2E', 'data-testid selectors', 'dev-login auth in tests']
---

# Tech-Spec: Dashboard Enrichment — Completeness, Document Preview, and Empty State

**Created:** 2026-02-23

## Overview

### Problem Statement

The Dashboard is a bare plan list with no visual feedback on plan progress, no document preview, and generic empty-state copy. Returning users (especially Sam persona) have no "home base" showing how their plan is progressing or what their lender document looks like.

### Solution

Enrich the Dashboard by (1) adding completeness progress bars to every plan card using the existing `PlanCompletenessBar` component, (2) adding the existing `DocumentPreviewWidget` for each plan, and (3) updating the empty-state copy to warmer brand-voice language per the UX spec.

### Scope

**In Scope:**
- B.1: Plan completeness on every plan card (reuse existing `PlanCompletenessBar`)
- B.2: Document preview widget on Dashboard (reuse existing `DocumentPreviewWidget` as-is)
- B.3: Dashboard empty state copy update
- API enrichment: Dashboard needs full plan data (`financialInputs`, `startupCosts`) — currently only gets lightweight summaries

**Out of Scope:**
- New checkmark/BD visual style (sticking with existing progress bar style)
- Custom/slimmed-down document preview widget
- PDF generation functionality (button exists but shows "coming soon" toast)

## Context for Development

### Codebase Patterns

- **TanStack Query v5 object-form only:** `useQuery({ queryKey: ['/api/plans'] })`. Default fetcher constructs URLs via `queryKey.join('/')`.
- **Plan type from schema:** `Plan` from `@shared/schema` includes `financialInputs` (JSONB) and `startupCosts` (JSONB). The `GET /api/plans` endpoint already returns full `Plan` objects for franchisees — the Dashboard's `PlanSummary` interface is a narrow client-side type that discards this data.
- **Brand resolution pattern:** `useQuery({ queryKey: ["/api/brands", brandId] })` returns `Brand` with `name` and `displayName`. All plans for a franchisee share the same brand, so one query suffices.
- **Component reuse:** `PlanCompletenessBar` and `DocumentPreviewWidget` are existing, tested components. No modifications needed — just wire them with the right props.
- **`usePlanOutputs(planId)`** is called internally by `DocumentPreviewWidget`. It hits `GET /api/plans/:planId/outputs` to compute engine outputs. This will fire once per plan on Dashboard load — acceptable performance for 1-3 plans.
- **`data-testid` convention:** Interactive elements use `{action}-{target}`, display elements use `{type}-{description}`, dynamic items append unique ID.
- **Role-based display:** The existing `showPlans` guard (`user.role === "franchisee" || user.role === "franchisor"`) gates the plan section. New widgets live inside the same block.

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `client/src/pages/dashboard.tsx` | Primary file to modify — Dashboard page |
| `client/src/components/planning/plan-completeness-bar.tsx` | Existing completeness bar component (reuse) |
| `client/src/components/planning/document-preview-widget.tsx` | Existing document preview widget (reuse) |
| `client/src/lib/plan-completeness.ts` | `computeSectionProgress()`, `computeCompleteness()` logic |
| `client/src/hooks/use-plan-outputs.ts` | `usePlanOutputs(planId)` — fetches engine outputs |
| `client/src/components/planning/document-preview-modal.tsx` | Full preview modal (opened by widget) |
| `shared/schema.ts` | `Plan` type with `financialInputs`, `startupCosts` fields |
| `server/routes/plans.ts` | `GET /api/plans` handler — already returns full Plan objects |

### Technical Decisions

1. **No backend changes needed.** `GET /api/plans` already returns full `Plan` objects (including `financialInputs` and `startupCosts`) for franchisees. The Dashboard just needs to type its query correctly.
2. **Brand name via separate query.** Plan objects have `brandId` but not `brandName`. Dashboard will query `/api/brands/{brandId}` (same pattern as `planning-workspace.tsx`). Single query since all plans share the same brand.
3. **Reuse existing components as-is.** `PlanCompletenessBar` and `DocumentPreviewWidget` are used without modification.
4. **Layout: plan station grouping.** Each plan gets a grouped section — plan info card with embedded completeness bar, plus `DocumentPreviewWidget` as a sibling card. Side-by-side on desktop (md+), stacked on mobile.
5. **Engine runs per plan are acceptable.** `DocumentPreviewWidget` calls `usePlanOutputs(planId)` internally, triggering `calculateProjections()` per plan. The engine is pure and fast. For 1-3 plans, this is fine.

### Party Mode Recommendations (Accepted)

- Sally: Group plans as "plan stations" — plan card + completeness bar together, document preview as sibling card. Side-by-side on desktop, stacked on mobile.
- Winston: Enrich client-side interface, don't add server endpoints. No server-side completeness computation — keep it client-side.
- Barry: Task order is API interface expansion → layout restructure → empty state copy → test.
- Sally: Only show widgets for franchisee/franchisor roles (existing `showPlans` guard covers this). Admin dashboard untouched.

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
