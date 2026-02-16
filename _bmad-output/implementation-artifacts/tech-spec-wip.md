---
title: 'UI Navigation Alignment — Sidebar Restructure & Plan Layout'
slug: 'ui-navigation-alignment'
created: '2026-02-16'
status: 'review'
stepsCompleted: [1, 2, 3]
tech_stack: ['React 18', 'TypeScript', 'Vite', 'wouter', 'TanStack Query v5', 'Tailwind CSS', 'shadcn/ui', 'Drizzle ORM', 'Express']
files_to_modify: ['client/src/components/app-sidebar.tsx', 'client/src/pages/planning-workspace.tsx', 'client/src/contexts/WorkspaceViewContext.tsx', 'client/src/components/planning/forms-mode.tsx', 'client/src/components/planning/input-panel.tsx']
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
| `client/src/contexts/WorkspaceViewContext.tsx` | Context — extend with `activePlanName`, add `scenarios` and `settings` view states |
| `client/src/components/planning/input-panel.tsx` | Thin wrapper — may be simplified or bypassed |
| `client/src/components/planning/dashboard-panel.tsx` | Dashboard panel — metric cards move out; charts stay for Reports; component retired from My Plan |
| `client/src/components/planning/forms-mode.tsx` | Forms — already correct structure; will receive summary metrics bar at top |
| `client/src/components/planning/planning-header.tsx` | Header — booking icon button stays; plan name display stays |
| `client/src/components/shared/summary-metrics.tsx` | Reusable metric cards — `MetricCard`, `SummaryMetrics` components |
| `client/src/components/planning/mode-switcher.tsx` | Mode switcher — NOT touched (deferred) but `ExperienceTier` type still referenced |
| `client/src/components/planning/financial-statements.tsx` | Reports view — no changes in this spec |
| `_bmad-output/planning-artifacts/ux-financial-statements-spec.md` | V3 UX spec — authoritative source for navigation model and layout |

### Technical Decisions

1. **Plan name in sidebar → extend WorkspaceViewContext.** Add `activePlanName: string | null` to the context. The `planning-workspace.tsx` calls `setActivePlanName(plan.name)` when plan data loads. The sidebar reads it for the section label. This avoids fetching plan data twice.

2. **Scenarios/Settings → workspace view states, not routes.** Add `"scenarios"` and `"settings"` to the `WorkspaceView` union type. The sidebar switches between them like it does for My Plan / Reports today. The planning-workspace renders placeholder content for these views. This keeps the URL at `/plans/:planId` and avoids adding new routes.

3. **Summary metrics in My Plan → reuse SummaryMetrics component.** The existing `SummaryMetrics` from `shared/summary-metrics.tsx` already renders 4 metric cards with loading/error states. Embed it at the top of the FormsMode component (above the PlanCompleteness bar). This replaces the DashboardPanel's metric cards for the My Plan view.

4. **DashboardPanel retirement from My Plan.** The `DashboardPanel` component is no longer rendered in the My Plan view. Its charts (`BreakEvenChart`, `RevenueExpensesChart`) remain available in the Reports view (they could be integrated into the Summary tab or kept as-is). The `ClickableMetricCard` pattern in DashboardPanel is not needed once `SummaryMetrics` is embedded directly.

5. **ResizablePanelGroup removal.** The `ResizablePanelGroup`, `ResizablePanel`, and `ResizableHandle` imports and usage in `planning-workspace.tsx` are removed for the My Plan view. My Plan now renders as a single full-width column.

6. **Booking link → HELP section.** Move from `SidebarFooter` into a new `SidebarGroup` with label "HELP". Keep the header icon button as-is (it's a convenience duplicate). The SidebarFooter retains only the user avatar/logout and "Powered by Katalyst" branding.

## Acceptance Criteria

### Sidebar Structure

- AC 1: Given the user is on the home dashboard (not inside a plan), the sidebar shows only the MY LOCATIONS section group with items: "All Plans" (previously "Dashboard"), plus admin items (Brands, Invitations) if applicable. No plan-specific section or HELP section appears.

- AC 2: Given the user is inside a plan workspace (`/plans/:planId`), the sidebar shows three section groups in order: MY LOCATIONS, [Active Plan Name], and HELP.

- AC 3: Given the user is inside a plan workspace, the second section group label displays the plan's actual name (e.g., "Sam's Pizza Shop") instead of the generic label "Plan".

- AC 4: Given the user is inside a plan workspace, the plan section contains exactly four items: My Plan, Reports, Scenarios, Settings — in that order.

- AC 5: Given the user clicks "Scenarios" in the sidebar, a placeholder view renders in the workspace area with a message indicating scenarios are coming soon. The sidebar item highlights as active.

- AC 6: Given the user clicks "Settings" in the sidebar, a placeholder view renders in the workspace area with a message indicating settings are coming soon. The sidebar item highlights as active.

- AC 7: Given the user has a booking URL and account manager assigned, the HELP section group appears in the sidebar with a "Talk to [Manager Name]" item. Clicking it opens the booking URL in a new tab.

- AC 8: Given the user does NOT have a booking URL, the HELP section group does not appear in the sidebar.

- AC 9: The booking link is no longer in the SidebarFooter. The footer contains only the user avatar/name/role, logout button, and "Powered by Katalyst" branding (when applicable).

### Sidebar Label Updates

- AC 10: The first section group label reads the brand display name (or "Katalyst Growth Planner" for Katalyst admins) — no change from current behavior.

- AC 11: The "Dashboard" nav item is renamed to "All Plans" with the same icon and route (`/`).

### My Plan Layout

- AC 12: Given the user is on the My Plan view, the workspace renders a single-column layout (no split panel, no resize handle, no side-by-side dashboard).

- AC 13: Given the user is on the My Plan view and plan outputs are available, a summary metrics bar appears at the top of the forms area showing at minimum: Total Startup Investment, Projected Annual Revenue, ROI (5-Year), and Break-Even.

- AC 14: Given the user is on the My Plan view, the collapsible form sections (Revenue, COGS, Labor, Facilities, Startup Costs) render below the summary metrics bar, occupying the full width of the content area.

- AC 15: Given the user is on the My Plan view, the break-even chart and revenue vs expenses chart (previously in the DashboardPanel) do NOT appear.

- AC 16: Given the user switches from My Plan to Reports via the sidebar, the Financial Statements container renders correctly (no regression from current behavior).

### WorkspaceViewContext

- AC 17: The `WorkspaceView` type includes at least four states: `"dashboard"` (My Plan), `"statements"` (Reports), `"scenarios"`, and `"settings"`.

- AC 18: The context exposes `activePlanName: string | null` and `setActivePlanName: (name: string | null) => void`. The planning-workspace sets it when plan data loads.

- AC 19: Navigating between all four workspace views (My Plan, Reports, Scenarios, Settings) via the sidebar works correctly — the sidebar highlights the active item and the workspace renders the correct content.

### Data-testid Coverage

- AC 20: All new sidebar items have `data-testid` attributes following existing conventions: `nav-scenarios`, `nav-settings`, `nav-all-plans`, `nav-help-booking`.

- AC 21: All new placeholder views have `data-testid` attributes: `placeholder-scenarios`, `placeholder-settings`.

- AC 22: The summary metrics bar in My Plan has `data-testid="my-plan-summary-metrics"`.

## Implementation Guidance

### Architecture Patterns to Follow

1. **Extend WorkspaceViewContext, don't replace it.** Add new view states and `activePlanName` to the existing context. Keep backward compatibility — `"dashboard"` still means My Plan, `"statements"` still means Reports. The sidebar and workspace already consume this context, so extending it is the natural path.

2. **Sidebar restructure follows existing SidebarGroup patterns.** The current sidebar already uses `SidebarGroup` / `SidebarGroupLabel` / `SidebarMenu` / `SidebarMenuButton`. The restructure adds a third group (HELP) and reorganizes items within existing groups. Follow the exact same component composition.

3. **Reuse existing SummaryMetrics component.** `shared/summary-metrics.tsx` exports `SummaryMetrics` which takes a `planId` and renders metric cards with loading/error/empty states. Embed this directly — don't create a new metrics component.

4. **FormsMode receives the metrics bar.** The `SummaryMetrics` component should be embedded inside the FormsMode component's layout, above the `PlanCompleteness` sticky bar. Alternatively, it can be placed in the planning-workspace itself above the FormsMode. Choose whichever keeps the scroll behavior correct — the metrics bar should scroll with the form content, not be sticky.

5. **Placeholder views are simple.** For Scenarios and Settings, render a centered card with an icon, a title ("Scenarios" / "Settings"), and a one-line description ("Coming soon — scenario comparison will appear here."). Follow the same pattern used in `input-panel.tsx` for the Planning Assistant placeholder (lines 30-44).

### Anti-Patterns and Constraints

1. **Do NOT remove or modify the mode-switcher.** The `ExperienceTier` type and `mode-switcher.tsx` component are explicitly out of scope. The `activeMode` state in `planning-workspace.tsx` still drives which input component renders (FormsMode vs QuickEntryMode). This cleanup is deferred.

2. **Do NOT modify financial-statements.tsx.** The Reports view (Financial Statements container) is unchanged in this spec. No tabs, no content, no behavior changes.

3. **Do NOT create new routes.** Scenarios and Settings are workspace view states, not new wouter routes. The URL stays at `/plans/:planId` for all four views.

4. **Do NOT delete dashboard-panel.tsx.** It may still be useful for the Reports Summary tab or future integration. Just stop rendering it in the My Plan view within `planning-workspace.tsx`.

5. **Do NOT add mode-switcher to the header or sidebar.** The v3 spec explicitly eliminates mode switching from the UI. Even though the code still uses `activeMode` internally, no UI control for switching modes should be added or retained.

6. **Keep the booking link in PlanningHeader.** The header icon button for booking is a useful duplication — don't remove it. The sidebar HELP section is the primary location per v3 spec, the header button is a convenience shortcut.

### File Change Summary

| File | Change Type | Description |
| ---- | ----------- | ----------- |
| `client/src/contexts/WorkspaceViewContext.tsx` | Modify | Add `"scenarios"` and `"settings"` to `WorkspaceView` union. Add `activePlanName` / `setActivePlanName` state. Add `navigateToScenarios()` and `navigateToSettings()` methods. |
| `client/src/components/app-sidebar.tsx` | Modify | Restructure into 3 section groups (MY LOCATIONS, [Plan Name], HELP). Rename "Dashboard" to "All Plans". Add Scenarios and Settings items. Move booking link from footer to HELP group. |
| `client/src/pages/planning-workspace.tsx` | Modify | Remove `ResizablePanelGroup` / `DashboardPanel` from My Plan view. Render FormsMode (or QuickEntryMode) as single-column with `SummaryMetrics` above. Add conditional rendering for `"scenarios"` and `"settings"` views. Call `setActivePlanName` on plan load. |
| `client/src/components/planning/forms-mode.tsx` | Modify (minor) | Accept optional `planId` prop for `SummaryMetrics` embedding (if metrics are placed inside FormsMode rather than above it in the workspace). |
| `client/src/components/planning/input-panel.tsx` | Possibly modify | May need to pass through `planId` for metrics, or may be bypassed entirely if workspace renders FormsMode directly. |

### Dependencies

- No new external libraries required.
- No new API endpoints needed — `SummaryMetrics` already uses `usePlanOutputs(planId)`.
- No database schema changes.
- Depends on existing `SummaryMetrics` component from `shared/summary-metrics.tsx`.
- Depends on existing `WorkspaceViewContext` from `contexts/WorkspaceViewContext.tsx`.

### Testing Guidance

**E2E testing (Playwright via run_test) is the primary verification method:**

1. **Sidebar structure when outside a plan:** Navigate to `/` — verify "All Plans" item appears, no plan section or HELP section visible.

2. **Sidebar structure when inside a plan:** Navigate to a plan — verify three section groups appear. Verify plan section label shows the plan name (not "Plan"). Verify My Plan, Reports, Scenarios, Settings items are present.

3. **Sidebar navigation:** Click each plan section item in sequence (My Plan → Reports → Scenarios → Settings) — verify the workspace content changes and the sidebar highlights the correct active item.

4. **Scenarios placeholder:** Click Scenarios — verify placeholder content renders with appropriate message.

5. **Settings placeholder:** Click Settings — verify placeholder content renders with appropriate message.

6. **HELP section (if booking URL exists):** Verify the booking link appears in the HELP section, not in the footer.

7. **My Plan single-column layout:** When on My Plan, verify no resize handle is visible. Verify summary metrics appear. Verify form sections render full-width.

8. **Reports regression:** After visiting My Plan, click Reports — verify Financial Statements render correctly with all tabs functional.

**Unit testing is NOT required for this change** — the changes are structural/layout and best verified visually and interactively.

### Notes

**High-risk items:**
- The `activePlanName` context value depends on `planning-workspace.tsx` setting it when plan data loads. If the plan takes time to load, the sidebar section label may briefly show a fallback (e.g., "My Plan" or a generic label). Use a sensible fallback like the plan name from the URL or a loading state.
- Removing the `DashboardPanel` from My Plan removes the "View Financial Statements" button that some users may rely on for navigating to Reports. The sidebar now serves this purpose, but ensure the transition feels natural.

**Known limitations:**
- The mode-switcher (`ExperienceTier`) state still exists internally. If the user was in "quick_entry" mode, the single-column layout will render `QuickEntryMode` instead of `FormsMode`. The `SummaryMetrics` bar should appear regardless of which mode is active. This is fine — both modes still work, they just don't have a visible switcher.
- The `QuickEntryMode` component renders its own summary metrics row internally. When `SummaryMetrics` is added above the input panel, there may be duplicate metrics visible in quick entry mode. The dev should check for this and conditionally suppress the embedded metrics in `QuickEntryMode` or skip the external `SummaryMetrics` when in quick entry mode.

**Future considerations (out of scope):**
- Impact Strip (Story 5.9) will be added below the forms in My Plan. The single-column layout created here provides the correct container for it.
- Guardian Bar (Story 5.8) will integrate with the Impact Strip.
- Mode-switcher cleanup will eventually remove the `ExperienceTier` state, `InputPanel` wrapper, and `QuickEntryMode` component. The layout created here is designed to survive that cleanup.
- The "All Plans" label (renamed from "Dashboard") is an interim label. When the portfolio view (multi-plan management) is built, this item's destination and behavior may evolve.
