---
title: 'UI Navigation Alignment — Sidebar Restructure & Plan Layout'
slug: 'ui-navigation-alignment'
created: '2026-02-16'
status: 'in-progress'
stepsCompleted: [1, 2]
tech_stack: ['React 18', 'TypeScript', 'Vite', 'wouter', 'TanStack Query v5', 'Tailwind CSS', 'shadcn/ui', 'Drizzle ORM', 'Express']
files_to_modify: ['client/src/components/app-sidebar.tsx', 'client/src/pages/planning-workspace.tsx', 'client/src/contexts/WorkspaceViewContext.tsx', 'client/src/components/planning/planning-header.tsx']
code_patterns: ['WorkspaceViewContext for sidebar/workspace state sync', 'SidebarGroup/SidebarGroupLabel for section grouping', 'Collapsible sections in forms-mode.tsx', 'usePlanOutputs hook for summary metrics', 'data-testid attributes on all interactive/display elements']
test_patterns: ['Vitest for unit tests', 'Playwright via run_test for e2e', 'No existing sidebar or workspace layout tests']
---

# Tech-Spec: UI Navigation Alignment — Sidebar Restructure & Plan Layout

**Created:** 2026-02-16

## Overview

### Problem Statement

The current sidebar navigation and My Plan workspace layout diverge from the v3 UX financial statements spec (two-door architecture). The sidebar labels, section grouping, and item placement don't match the spec — missing destinations (Scenarios, Settings), misplaced elements (booking link in footer instead of Help section), and generic labels ("Plan" instead of the active plan name). The My Plan workspace uses a split-panel layout (InputPanel | DashboardPanel) that doesn't match the v3 spec's single-column form workspace with summary metrics at top.

### Solution

Restructure the sidebar to match the v3 UX spec's navigation model. Collapse the My Plan split-panel layout into a single-column view: summary metrics bar at top, collapsible form sections below. Add placeholder destinations for Scenarios and Settings. Move the booking link into a proper Help section group.

### Scope

**In Scope:**
- Sidebar restructure: section grouping (MY LOCATIONS, [Active Plan Name], HELP)
- Plan section label shows active plan name instead of generic "Plan"
- Add "Scenarios" sidebar item with placeholder page/view
- Add "Settings" sidebar item with placeholder page/view
- Move "Talk to [Manager Name]" from footer into a HELP section group
- My Plan layout: collapse split-panel into single-column (summary metrics bar at top, forms below)
- Summary metric cards move from DashboardPanel into the top of the My Plan forms view
- Dashboard charts (break-even, revenue vs expenses) remain accessible via Reports; removed from My Plan
- Label corrections throughout

**Out of Scope:**
- Mode-switcher code cleanup / ExperienceTier state removal (deferred)
- Impact Strip (Story 5.9)
- Guardian Bar (Story 5.8)
- Inline editing in Reports (Story 5.6)
- Actual Scenarios content (Story 5.7)
- Actual Settings content (future story)
- Glossary/Help content (Story 5.10)

## Context for Development

### Codebase Patterns

1. **Sidebar structure:** Uses shadcn `SidebarGroup` / `SidebarGroupLabel` / `SidebarMenu` / `SidebarMenuButton` for section grouping. Two SidebarGroups exist today: one for nav items (Dashboard, Brands, Invitations) and one for plan items (My Plan, Reports) that appears conditionally when `isInPlanWorkspace` is true.

2. **WorkspaceViewContext:** Manages `workspaceView: "dashboard" | "statements"` state. Both the sidebar and planning-workspace consume this. The context provides `navigateToStatements(tab?)` and `navigateToMyPlan()` methods. The sidebar uses `workspaceView` to highlight the active item. The planning-workspace conditionally renders `FinancialStatements` or the `ResizablePanelGroup` based on this state.

3. **Plan workspace layout:** `planning-workspace.tsx` renders a `ResizablePanelGroup` with `InputPanel` (40%) and `DashboardPanel` (60%) side by side. The `InputPanel` delegates to `FormsMode` or `QuickEntryMode` based on `activeMode` (ExperienceTier). The `DashboardPanel` contains 5 metric cards and 2 charts (break-even, revenue vs expenses).

4. **FormsMode:** Already has the correct single-column layout structure — sticky `PlanCompleteness` bar at top, scrollable collapsible `FormSection` components below. This is essentially the v3 My Plan layout, just without summary metrics at the top and without the Impact Strip at the bottom.

5. **Summary metrics:** Two implementations exist:
   - `shared/summary-metrics.tsx` — standalone `SummaryMetrics` component with 4 metric cards (used in quick-entry-mode)
   - `dashboard-panel.tsx` — `ClickableMetricCard` components with 5 metric cards + "View Financial Statements" button + 2 charts

6. **Plan name access:** The sidebar does NOT currently have access to the plan name. It detects `isInPlanWorkspace` via URL regex but doesn't fetch plan data. The plan name is only available in `planning-workspace.tsx` via `usePlanAutoSave(planId)` → `plan.name`. To show the plan name as a sidebar section label, we need to extend `WorkspaceViewContext` to carry `activePlanName`.

7. **Booking link:** Currently in `SidebarFooter` as a ghost button. Also duplicated in `PlanningHeader` as an icon button with tooltip. The v3 spec puts it in a HELP section group in the sidebar.

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `client/src/components/app-sidebar.tsx` | Sidebar — complete restructure needed |
| `client/src/pages/planning-workspace.tsx` | Plan workspace — remove split-panel, replace with single-column + summary metrics |
| `client/src/contexts/WorkspaceViewContext.tsx` | Context — extend with `activePlanName`, possibly `activeWorkspaceView` for Scenarios/Settings |
| `client/src/components/planning/input-panel.tsx` | Thin wrapper — may be simplified or removed |
| `client/src/components/planning/dashboard-panel.tsx` | Dashboard panel — metric cards move out; charts stay for Reports; component may be retired from My Plan |
| `client/src/components/planning/forms-mode.tsx` | Forms — already correct structure; will receive summary metrics bar at top |
| `client/src/components/planning/planning-header.tsx` | Header — booking icon button can stay (duplicate is fine); plan name already displayed here |
| `client/src/components/shared/summary-metrics.tsx` | Reusable metric cards — `MetricCard`, `SummaryMetrics` components |
| `client/src/components/planning/mode-switcher.tsx` | Mode switcher — NOT touched in this spec (deferred) but `ExperienceTier` type still referenced |
| `client/src/components/planning/financial-statements.tsx` | Reports view — no changes needed in this spec |
| `_bmad-output/planning-artifacts/ux-financial-statements-spec.md` | V3 UX spec — authoritative source for navigation model and layout |

### Technical Decisions

1. **Plan name in sidebar → extend WorkspaceViewContext.** Add `activePlanName: string | null` to the context. The `planning-workspace.tsx` calls `setActivePlanName(plan.name)` when plan data loads. The sidebar reads it for the section label. This avoids fetching plan data twice.

2. **Scenarios/Settings → workspace view states, not routes.** Add `"scenarios"` and `"settings"` to the `WorkspaceView` union type. The sidebar switches between them like it does for My Plan / Reports today. The planning-workspace renders placeholder content for these views. This keeps the URL at `/plans/:planId` and avoids adding new routes.

3. **Summary metrics in My Plan → reuse SummaryMetrics component.** The existing `SummaryMetrics` from `shared/summary-metrics.tsx` already renders 4 metric cards with loading/error states. Embed it at the top of the FormsMode component (above the PlanCompleteness bar). This replaces the DashboardPanel's metric cards for the My Plan view.

4. **DashboardPanel retirement from My Plan.** The `DashboardPanel` component is no longer rendered in the My Plan view. Its charts (`BreakEvenChart`, `RevenueExpensesChart`) remain available in the Reports view (they could be integrated into the Summary tab or kept as-is). The `ClickableMetricCard` pattern in DashboardPanel is not needed once `SummaryMetrics` is embedded directly.

5. **ResizablePanelGroup removal.** The `ResizablePanelGroup`, `ResizablePanel`, and `ResizableHandle` imports and usage in `planning-workspace.tsx` are removed for the My Plan view. My Plan now renders as a single full-width column.

6. **Booking link → HELP section.** Move from `SidebarFooter` into a new `SidebarGroup` with label "HELP". Keep the header icon button as-is (it's a convenience duplicate). The SidebarFooter retains only the user avatar/logout and "Powered by Katalyst" branding.

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
