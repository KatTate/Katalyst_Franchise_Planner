---
title: 'Story 5.2 Progressive Disclosure & Infrastructure Gaps'
slug: '5-2-progressive-disclosure-gaps'
created: '2026-02-17'
status: 'in-progress'
stepsCompleted: []
tech_stack: ['react', 'typescript', 'tailwindcss', 'shadcn-ui', 'lucide-react']
files_to_modify:
  - 'client/src/components/planning/statements/column-manager.tsx'
  - 'client/src/components/planning/statements/pnl-tab.tsx'
  - 'client/src/components/planning/financial-statements.tsx'
  - 'client/src/components/planning/statements/summary-tab.tsx'
  - 'client/src/components/planning/statements/statement-table.tsx'
code_patterns:
  - 'useColumnManager hook for drill-down state'
  - 'ColumnDef/DrillState types for column generation'
  - 'PascalCase components with kebab-case filenames'
  - 'data-testid on all interactive/meaningful elements'
test_patterns:
  - 'Playwright e2e for drill-down interactions'
  - 'Visual verification of column hierarchy'
---

# Tech-Spec: Story 5.2 Progressive Disclosure & Infrastructure Gaps

**Created:** 2026-02-17

## Overview

### Problem Statement

Story 5.2 delivered the functional mechanism for progressive disclosure (annual → quarterly → monthly drill-down) but did not deliver the visual and interaction design specified in the UX Financial Statements Spec (v2, 2026-02-16) and Epic 5 acceptance criteria. Six gaps have been identified where the spec defines behaviour or visual treatment that is absent from the implementation:

1. **No visual hierarchy in column headers** — Year, quarter, and month columns render with identical styling. Users cannot distinguish which level a column belongs to, especially after drilling into multiple years simultaneously.
2. **No per-year collapse control** — Users can only collapse via the global "Collapse All" button or the undiscoverable Escape key. There is no visible UI affordance to collapse a single expanded year back to annual.
3. **No breadcrumb/drill-level indicator** — The spec requires "Year 2 → Quarterly View" style indicators. None exist.
4. **Quarter headers are not clickable** — The spec says clicking a quarter header drills to monthly. Only year headers have click handlers; quarter headers are inert.
5. **No scroll position preservation per tab** — Switching tabs and returning resets scroll to top. Spec says "each tab remembers its scroll position and drill-down state within the session."
6. **No scroll-to on tab navigation** — Dashboard metric card deep links navigate to the correct tab but ignore the `scrollTo` parameter. Spec says clicking a metric card should scroll to the relevant row.

### Solution

Fix all six gaps in the shared column infrastructure so all current and future statement tabs (P&L, Balance Sheet, Cash Flow, ROIC, Valuation, Audit) benefit automatically. The fixes are localised to 3–4 files and do not change data flow, API routes, or the financial engine.

### Scope

**In Scope:**
- Gap 1: Multi-row grouped column headers with visual level distinction (background tinting, borders, spanning)
- Gap 2: Per-year collapse chevron/button on expanded year headers
- Gap 3: Drill-level breadcrumb text on expanded year headers
- Gap 4: Quarter header click-to-drill and keyboard handlers
- Gap 5: Scroll position preservation when switching tabs (session-only, not persisted)
- Gap 6: `scrollTo` implementation — scroll to a specific row when navigating to a tab via deep link

**Out of Scope:**
- Tab completeness badges (requires brand-defaults tracking infrastructure not yet built; deferred to Story 5.8 or Epic 7)
- Linked-column flash animation on edit propagation (cosmetic; deferred to Story 5.6 when inline editing is wired)
- Scenario comparison column constraints (Story 5.7)
- Per-year independent input values (Epic 7)
- Inline editing activation (Story 5.6)

## Context for Development

### Codebase Patterns

- **Column generation:** `useColumnManager()` hook in `column-manager.tsx` manages `DrillState` (a map of `year → DrillLevel`). The `getColumns()` function generates a flat `ColumnDef[]` array. Each column knows its `level` ("annual" | "quarterly" | "monthly"), `year`, optional `quarter`, and optional `month`.
- **Column header rendering:** Currently done inline in each tab (e.g., `pnl-tab.tsx` lines 337–361) as a single `<thead><tr>` with one `<th>` per column. No grouping row.
- **The `ColumnHeaders` component** in `column-manager.tsx` exists but only renders the "Linked" indicator and "Expand All / Collapse All" button — it does NOT render the actual `<th>` elements. Those are in each tab's own `<thead>`.
- **Drill functions:** `drillDown(year)` and `drillUp(year)` already exist and work correctly. `drillDown` cycles annual→quarterly→monthly. `drillUp` cycles monthly→quarterly→annual.
- **Tab container:** `financial-statements.tsx` uses Shadcn `<Tabs>` with `<TabsContent>` per tab. The scroll container is `<div className="flex-1 overflow-auto">` wrapping all tab content.
- **Navigation:** `handleNavigateToTab(tab, scrollTo?)` in `financial-statements.tsx` currently sets `activeTab` but ignores `scrollTo`.

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `client/src/components/planning/statements/column-manager.tsx` | Column generation, drill state, `ColumnHeaders` component, value resolver functions |
| `client/src/components/planning/statements/pnl-tab.tsx` | P&L tab — primary consumer of column infrastructure, has inline `<thead>` rendering |
| `client/src/components/planning/financial-statements.tsx` | Tab container, tab switching, scroll container, `handleNavigateToTab` |
| `client/src/components/planning/statements/summary-tab.tsx` | Summary tab — uses `StatementTable` with different column rendering (no drill-down) |
| `client/src/components/planning/statements/statement-table.tsx` | Shared table component used by Summary tab sections |
| `_bmad-output/planning-artifacts/ux-financial-statements-spec.md` | UX spec Part 2 (Progressive Disclosure), Part 10 (Component Architecture) |
| `_bmad-output/planning-artifacts/epics.md` | Story 5.2 acceptance criteria (lines 976–997) |

### Technical Decisions

1. **Grouped header approach:** Use a 2-row `<thead>` when any year is drilled down. Row 1 contains year-level headers with `colSpan` spanning their sub-columns. Row 2 contains quarter/month sub-headers. When no drill-down is active, render the standard single-row header.
2. **Visual distinction:** Year headers get standard `bg-muted/40` background. Quarter headers get a subtly lighter tint. Month headers use standard background with slightly smaller/lighter text. Vertical separator borders between year groups.
3. **Collapse affordance:** Add a small chevron-up icon button inside expanded year header cells. Clicking it calls `drillUp(year)`. This is in addition to the existing Escape keyboard shortcut.
4. **Breadcrumb:** Render as inline text within the year header cell: "Year 2 ▸ Quarterly" or "Year 2 ▸ Monthly". Concise, no separate breadcrumb bar needed.
5. **Scroll preservation:** Use a `useRef` map keyed by tab ID to store `scrollTop` values. On tab switch, save current scroll position; on tab enter, restore saved position. Session-only (no localStorage).
6. **ScrollTo implementation:** After tab switch + render, use `document.querySelector('[data-testid="pnl-section-pretax"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' })` keyed off the `scrollTo` parameter mapped to `data-testid` values.

## Acceptance Criteria

### AC1: Grouped Column Headers with Visual Hierarchy
**Given** a user has drilled down Year 2 to quarterly view
**When** the table header renders
**Then** a top header row shows "Year 1", "Year 2" (spanning 5 columns: Y2 + Q1-Q4), "Year 3", "Year 4", "Year 5"
**And** a second header row shows "Total", "Q1", "Q2", "Q3", "Q4" under Year 2
**And** year headers have a visually distinct background (e.g., `bg-muted/40`) from quarter/month sub-headers
**And** vertical separator borders appear between year groups
**And** non-drilled years span both header rows with `rowSpan={2}`

### AC2: Monthly Drill-Down Grouped Headers
**Given** a user has drilled Year 2 to monthly
**When** the table header renders
**Then** the top row shows year-level groups
**And** the second row shows Q1, Q2, Q3, Q4 under Year 2
**And** a third row shows month abbreviations (Jan, Feb, Mar, etc.) under each quarter
**And** month headers use slightly smaller/lighter text than quarter headers

### AC3: Per-Year Collapse Control
**Given** Year 2 is expanded to quarterly or monthly
**When** the user looks at the Year 2 header
**Then** a collapse chevron/button is visible inside the Year 2 header cell
**And** clicking it collapses Year 2 back one level (monthly → quarterly, or quarterly → annual)
**And** the collapse button has `data-testid="button-collapse-year-2"`
**And** the collapse button has accessible label text

### AC4: Drill-Level Breadcrumb Indicator
**Given** Year 2 is expanded to quarterly
**When** the Year 2 header renders
**Then** it displays "Year 2 ▸ Quarterly" (or similar compact indicator)
**Given** Year 2 is expanded to monthly
**Then** it displays "Year 2 ▸ Monthly"

### AC5: Quarter Header Click-to-Drill
**Given** Year 2 is expanded to quarterly view
**When** the user clicks on the Q2 column header
**Then** Year 2 expands from quarterly to monthly view showing M4, M5, M6 under Q2
**And** quarter headers have `cursor-pointer` styling
**And** quarter headers support keyboard interaction (Enter to drill down)

### AC6: Scroll Position Preservation
**Given** the user is on the P&L tab and has scrolled down 500px
**When** the user switches to the Balance Sheet tab
**And** then switches back to the P&L tab
**Then** the P&L tab restores to approximately 500px scroll position
**And** this works for all 7 tabs independently

### AC7: Scroll-To on Tab Navigation
**Given** the user is on the Dashboard and clicks the "Pre-Tax Income" metric card
**When** the system navigates to the P&L tab
**Then** the P&L tab scrolls to the Pre-Tax Income section row
**And** the scroll uses smooth animation
**And** the target row is positioned near the top of the visible area

## Implementation Guidance

### Architecture Patterns to Follow

1. **Centralise header rendering in `ColumnHeaders`** — Move the `<thead>` rendering out of individual tabs (currently inline in `pnl-tab.tsx`) into the shared `ColumnHeaders` component in `column-manager.tsx`. This prevents every future tab from reimplementing grouped headers.
2. **Extend `ColumnDef` metadata** — The `ColumnDef` type already has `level`, `year`, `quarter`, `month`. Add a `parentKey` or use existing fields to determine grouping spans at render time.
3. **Preserve existing drill state contract** — `useColumnManager` already returns `drillDown`, `drillUp`, `getDrillLevel`, `expandAll`, `collapseAll`. The quarter-click feature just needs to add a new function `drillQuarterToMonthly(year)` or reuse `drillDown(year)` since it already cycles quarterly → monthly.
4. **Scroll ref pattern** — Use `useRef<Record<string, number>>({})` in `financial-statements.tsx` to store scroll positions. The scroll container already has a `ref`-able div (`<div className="flex-1 overflow-auto">`).

### Anti-Patterns and Constraints

- **Do NOT add fixed heights or widths to header cells** — let content determine sizing.
- **Do NOT use `position: sticky` on grouped header rows** — Story 5.3 already removed sticky section headers due to z-index conflicts with the callout bar. The callout bar is the only sticky element above the table.
- **Do NOT break the existing single-row header for non-drilled views** — when no year is expanded, the header should remain a clean single row. The multi-row grouping only appears when drill-down is active.
- **Do NOT change the `ColumnDef` type shape** in breaking ways — other tabs (`summary-tab.tsx`, `statement-table.tsx`) consume it. Additive changes only.
- **Do NOT use `display: table`** — per project design guidelines.
- **Do NOT manually style hover/active states** — use `hover-elevate` / `active-elevate-2` utilities or built-in component variants per design guidelines.

### File Change Summary

| File | Action | Changes |
|------|--------|---------|
| `client/src/components/planning/statements/column-manager.tsx` | MODIFY | Expand `ColumnHeaders` to render actual `<thead>` with grouped rows. Add per-year collapse button. Add breadcrumb text. Add quarter click handlers. Add `drillToMonthly(year)` or modify `drillDown` to accept quarter-level triggers. |
| `client/src/components/planning/statements/pnl-tab.tsx` | MODIFY | Remove inline `<thead>` rendering (lines 330–362). Replace with `<ColumnHeaders>` component that renders the full `<thead>`. |
| `client/src/components/planning/financial-statements.tsx` | MODIFY | Add scroll position preservation via `useRef`. Implement `scrollTo` logic in `handleNavigateToTab`. Add `ref` to scroll container div. |
| `client/src/components/planning/statements/statement-table.tsx` | VERIFY | Ensure it still works with updated `ColumnHeaders` for Summary tab tables (which don't use drill-down). |

### Dependencies

- No new npm packages required.
- No API changes.
- No database changes.
- No new environment variables.
- Depends on existing `useColumnManager` hook, `ColumnDef`/`DrillState` types, and `Tooltip`/`Button` Shadcn components already in the project.

### Testing Guidance

**Playwright e2e tests should verify:**
1. Click Year 2 header → quarterly columns appear with visual grouping (top row spans, sub-row with Q1-Q4).
2. Click Q2 header → monthly columns appear (M4, M5, M6) with three-row header grouping.
3. Click collapse button on Year 2 → collapses back one level. Click again → collapses fully.
4. Breadcrumb text appears on expanded year headers showing current drill level.
5. Switch from P&L tab to Balance Sheet and back — scroll position is restored.
6. Click a dashboard metric card → navigates to correct tab and scrolls to the relevant section.
7. All `data-testid` attributes present on new interactive elements.
8. Keyboard: Enter on quarter header drills to monthly. Escape on year header collapses.
9. Visual check: year/quarter/month headers have distinguishable styling (background tint, text size, borders).

### Notes

- This tech spec addresses gaps that were part of Story 5.2's original acceptance criteria but were not implemented. The fixes are infrastructure-level and will automatically benefit Stories 5.4 (Balance Sheet + Cash Flow) and 5.5 (ROIC + Valuation + Audit) when those tabs are built.
- Tab completeness badges (filled/half/empty circles) are intentionally excluded — they require tracking which inputs have been user-edited vs. brand defaults, which is data infrastructure not yet available. This should be revisited when Story 5.8 (Guardian Bar) or Epic 7 (per-year inputs) is implemented.
- Linked-column flash animation is excluded — it's a polish feature best implemented alongside Story 5.6 (inline editing integration) when the edit-propagation event is available to trigger the animation.
- The UX spec references from Part 2 (Progressive Disclosure, lines 180–227) and Part 10 (Component Architecture, lines 851–867) are the authoritative design source for these gaps.
