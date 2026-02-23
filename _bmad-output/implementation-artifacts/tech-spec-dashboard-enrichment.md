---
title: 'Dashboard Enrichment — Completeness, Document Preview, and Empty State'
slug: 'dashboard-enrichment'
created: '2026-02-23'
status: 'ready-for-dev'
stepsCompleted: [1, 2, 3, 4]
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

### B.1: Plan Completeness on Every Plan Card

- **AC-1:** Given a franchisee with one or more plans, when they view the Dashboard, then each plan card displays a `PlanCompletenessBar` showing section-by-section progress bars with edited/total field counts.
- **AC-2:** Given a plan where some sections have been customized and others are at brand defaults, when the Dashboard renders, then the completeness bar accurately reflects the per-section edit counts (matching what `computeSectionProgress()` returns for that plan's `financialInputs`).
- **AC-3:** Given a plan with no customized fields (all brand defaults), when the Dashboard renders, then the completeness bar shows 0/N for each section with empty progress bars.

### B.2: Document Preview Widget on Dashboard

- **AC-4:** Given a franchisee with one or more plans, when they view the Dashboard, then each plan displays a `DocumentPreviewWidget` showing the plan name, brand name, and a miniature business plan preview.
- **AC-5:** Given a plan with completeness below 50%, when the Dashboard renders, then the document preview widget displays a "DRAFT" watermark over the preview.
- **AC-6:** Given a plan with completeness above 90%, when the Dashboard renders, then the document preview widget shows a "Ready" badge.
- **AC-7:** Given a plan with financial projections computed (engine outputs available), when the Dashboard renders, then the document preview widget displays Pre-Tax Income, Break-even, and 5yr ROI metrics.
- **AC-8:** Given a user clicks "View Full Preview" on a dashboard document preview widget, when the button is clicked, then the `DocumentPreviewModal` opens showing the full business plan preview for that specific plan.
- **AC-9:** Given a user clicks "Generate PDF" on a dashboard document preview widget, when the button is clicked, then a toast displays "PDF generation coming soon."

### B.3: Dashboard Empty State Copy

- **AC-10:** Given a franchisee with no plans, when they view the Dashboard, then the empty state message reads "Ready to plan your next location? Let's build something great." instead of "No plans yet. Create your first plan to get started."
- **AC-11:** Given a franchisee with no plans, when they view the Dashboard, then the CTA button reads "Create Your First Plan" (already correct — verify preserved).

### Layout and Responsiveness

- **AC-12:** Given a desktop viewport (md breakpoint and above), when the Dashboard renders plans, then the plan info card (with completeness bar) and the document preview widget appear side-by-side for each plan.
- **AC-13:** Given a mobile viewport (below md breakpoint), when the Dashboard renders plans, then the plan info card and document preview widget stack vertically.
- **AC-14:** Given a franchisor or katalyst_admin user, when they view the Dashboard, then no completeness bars or document preview widgets appear (these widgets only show within the `showPlans` guard for roles that have plans).

### Data Loading

- **AC-15:** Given the Dashboard page loads, when the plans query executes, then the response is typed to include `financialInputs`, `startupCosts`, and `brandId` from the full `Plan` type — no backend API changes required.
- **AC-16:** Given plans have loaded with a `brandId`, when the brand query executes, then the brand name (using `displayName || name`) is available for the document preview widgets.

## Implementation Guidance

### Architecture Patterns to Follow

1. **Expand `PlanSummary` to `Plan` type.** Replace the local `PlanSummary` interface in `dashboard.tsx` with the `Plan` type imported from `@shared/schema`. The API already returns full plan objects — the narrow interface was just discarding data.
2. **Brand resolution via `useQuery`.** Add a `useQuery` for `/api/brands/{brandId}` using the first plan's `brandId` (all plans for a franchisee share the same brand). Follow the same pattern used in `client/src/pages/planning-workspace.tsx` line 54. The brand query should be `enabled` only when plans exist and `brandId` is available.
3. **Plan station layout.** For each plan, render a container div with two children:
   - A `Card` containing the plan link, name, status, context menu, AND the `PlanCompletenessBar` component (embedded inside the card).
   - The `DocumentPreviewWidget` component (renders its own `Card`).
   - Use `grid grid-cols-1 md:grid-cols-2 gap-3` for side-by-side on desktop, stacked on mobile.
4. **Component wiring.** Pass props to existing components:
   - `PlanCompletenessBar`: `financialInputs={plan.financialInputs}` and `startupCostCount={plan.startupCosts?.length ?? 0}`
   - `DocumentPreviewWidget`: `planId={plan.id}`, `planName={plan.name}`, `brandName={brand?.displayName || brand?.name}`, `financialInputs={plan.financialInputs}`, `startupCosts={plan.startupCosts}`, `startupCostCount={plan.startupCosts?.length ?? 0}`
5. **Loading state.** Show skeleton cards while plans or brand data is loading.

### Anti-Patterns and Constraints

- **DO NOT modify `server/routes/plans.ts`** — the API already returns full plan data. No backend changes.
- **DO NOT modify `plan-completeness-bar.tsx` or `document-preview-widget.tsx`** — reuse as-is.
- **DO NOT create a new API endpoint** for dashboard-specific plan summaries or completeness data.
- **DO NOT compute completeness server-side** — the existing client-side `computeSectionProgress()` is the single source of truth.
- **DO NOT nest a `<Card>` inside another `<Card>`** — the `DocumentPreviewWidget` renders its own `<Card>`, so place it as a sibling, not a child of the plan card.
- **DO NOT use template literals in queryKey** — use array segments: `["/api/brands", brandId]` not `[`/api/brands/${brandId}`]`.
- **DO NOT import React explicitly** — the Vite JSX transform handles it.

### File Change Summary

| File | Change |
| ---- | ------ |
| `client/src/pages/dashboard.tsx` | Replace `PlanSummary` interface with `Plan` import from `@shared/schema`. Add `Brand` import. Add brand `useQuery`. Restructure plan card rendering to include `PlanCompletenessBar` and `DocumentPreviewWidget`. Update empty state copy. |

### Dependencies

- **No new packages required.** All components and utilities already exist in the codebase.
- **Existing component dependencies (already installed):**
  - `PlanCompletenessBar` from `@/components/planning/plan-completeness-bar`
  - `DocumentPreviewWidget` from `@/components/planning/document-preview-widget`
- **API dependencies (already working):**
  - `GET /api/plans` — returns full `Plan[]` for franchisees
  - `GET /api/brands/:brandId` — returns `Brand` with `name` and `displayName`
  - `GET /api/plans/:planId/outputs` — returns engine outputs (called by `DocumentPreviewWidget` internally)

### Testing Guidance

- **Primary test approach:** Playwright E2E testing via the Dashboard page.
- **Auth:** Use `POST /api/auth/dev-login` to authenticate as a franchisee user.
- **Key scenarios to verify:**
  1. Dashboard with plans: verify completeness bar renders for each plan card (`data-testid="plan-completeness-dashboard"` inside each plan group).
  2. Dashboard with plans: verify document preview widget renders for each plan (`data-testid="document-preview-widget"` inside each plan group).
  3. Document preview widget interaction: click "View Full Preview" button (`data-testid="button-view-full-preview"`) and verify the modal opens (`data-testid="document-preview-modal"`).
  4. Empty state: verify updated copy text when no plans exist.
  5. Responsive layout: verify side-by-side at desktop width and stacked at mobile width.
- **Note:** The testing agent should create test plans via `POST /api/plans` to ensure data exists, using unique plan names to avoid conflicts.

### Notes

- **Future consideration:** If users accumulate many plans (5+), the Dashboard could become visually dense. Sally (UX) flagged this as a potential future issue — consider collapsing document previews to thumbnails if density becomes a problem. Not in scope for this spec.
- **Engine performance:** Each `DocumentPreviewWidget` triggers `calculateProjections()` per plan via `usePlanOutputs`. For 1-3 plans this is negligible. Monitor if plan counts grow significantly.
- **Franchisor view:** Franchisors with plans also see these widgets (gated by existing `showPlans` logic). If a franchisor's plan data was projected (consent-stripped), the `financialInputs` field will be `null/undefined`, and both widgets gracefully handle this (completeness bar returns null, document preview shows empty state).
- **Brand query deduplication:** TanStack Query deduplicates — if the sidebar or other components already query the same brand, no additional network request is made.
