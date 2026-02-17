# Story 5.2: Financial Statements Container & Summary Tab

Status: done

## Story

As a franchisee (any persona),
I want a unified Financial Statements view accessible as "Reports" in the sidebar with tabbed navigation and an annual Summary as the landing tab,
So that I can quickly assess my business plan across all 5 years and drill into detail when I need it (FR7d).

## Acceptance Criteria

**Sidebar Navigation — Two-Door Architecture:**

1. The application sidebar includes a "Reports" navigation item (under the active plan section) that navigates to the Financial Statements view. "My Plan" remains the structured-forms workspace (existing input panel + dashboard). These are two sidebar destinations, not a view toggle or mode switch.
2. When I click "Reports" in the sidebar, the Financial Statements container renders with a horizontal tab bar showing: Summary | P&L | Balance Sheet | Cash Flow | ROIC | Valuation | Audit
3. When I click "My Plan" in the sidebar, I return to the existing input panel + dashboard workspace.
4. The sidebar clearly indicates which destination is active (Reports vs My Plan) using the standard sidebar active-item styling.
5. No mode switcher exists anywhere in the UI. The "Planning Assistant | Forms | Quick Entry" segmented control from Epic 4 is removed from the planning header. Experience tier preferences are preserved in user settings but no longer drive any visible UI toggle.

**Tab Navigation:**

6. The Summary tab is active by default when entering Reports.
7. Tab switching is instant with no loading state — all data comes from the cached engine computation already fetched by `usePlanOutputs`.
8. Each tab remembers its scroll position and drill-down state within the session (React state, not persisted).
9. On viewports below 1024px, tabs convert to a dropdown selector.
10. Tabs that are not yet implemented (P&L, Balance Sheet, Cash Flow, ROIC, Valuation, Audit) render placeholder content indicating "Coming in the next update" — the container does not crash or show broken UI for these tabs.

**Summary Tab Content:**

11. A sticky Key Metrics Callout Bar appears at the top showing: Total 5yr Pre-Tax Income, Break-even Month (with estimated calendar date), and 5yr ROI %.
12. Below the callout bar, collapsible sections render:
    - Annual P&L Summary (expanded by default) — rows: Revenue, Cost of Sales, COGS %, Gross Profit, GP %, Direct Labor, DL %, Contribution Margin %, Total OpEx, OpEx %, EBITDA, EBITDA %, D&A, Interest, Net PBT, Net PBT %
    - Labor Efficiency subsection (collapsed by default) — rows: Labor Efficiency Ratio, Adj. Labor Efficiency, Salary Cap at Target, Over/Under Cap
    - Balance Sheet Summary (collapsed by default) — rows: Total Assets, (of which Cash), Total Liabilities, Total Net Assets
    - Cash Flow Summary (collapsed by default) — rows: Closing Cash Balance, Operating Cash Flow, Net Cash Flow
    - Break-Even Analysis (expanded by default) — break-even month, estimated calendar date, cumulative cash flow sparkline, plain-language interpretation ("You'd start making money by [date]")
    - Startup Capital Summary (collapsed by default) — Total investment, 5-Year Cumulative Cash Flow
13. Each section header that has a corresponding detail tab includes a link ("View Full P&L", "View Full Balance Sheet", "View Full Cash Flow") that navigates to that tab.
14. Year 1 pre-tax margin interpretation text appears below the P&L Summary section with a trend icon (up/down arrow).

**My Plan Deep Links to Reports:**

15. On the existing Dashboard Panel (within My Plan), summary metric cards become clickable links that navigate to the Reports view at the relevant tab (e.g., clicking a pre-tax income metric sets the sidebar to Reports and opens the P&L tab).

**Progressive Disclosure Infrastructure:**

16. A `useColumnManager` hook manages drill-down state: clicking a year column header in any statement tab expands that year to show 4 quarterly columns (Q1-Q4) plus the annual total; clicking a quarter expands to 3 monthly columns.
17. Other years remain collapsed as annual totals when one year is drilled down.
18. "Expand All" / "Collapse All" controls are available in the column header area.
19. Keyboard: Enter on a focused column header drills down; Escape goes up a level.
20. `getAnnualValue`, `getQuarterlyValue`, and `getMonthlyValue` helper functions resolve cell values from the correct data source (annual summaries, monthly projections, or P&L analysis arrays).

**Linked-Column Indicators (Pre-Epic-7):**

21. A small link icon with "Linked" label appears in the column header area with a tooltip: "All years share the same input value. Per-year values will be available in a future update."

**Sticky Elements & Formatting:**

22. Row labels (leftmost column) are sticky horizontally — always visible during horizontal scroll.
23. Section headers are sticky vertically — always visible during vertical scroll.
24. Sticky elements have a high z-index and subtle shadow to indicate floating.
25. Currency values format as $X,XXX using the existing `formatCents` utility; percentages display as X.X%.

**Generate PDF Button:**

26. A "Generate Draft" button appears in the Financial Statements header area (non-functional placeholder — PDF generation is Story 6.1).

## Dev Notes

### Architecture Patterns to Follow

- **Component naming:** PascalCase components, kebab-case files — `FinancialStatements` in `financial-statements.tsx`, `SummaryTab` in `summary-tab.tsx`, `StatementTable` in `statement-table.tsx` (Source: architecture.md § Code Naming)
- **State management:** TanStack Query for all server data via the existing `usePlanOutputs` hook. Local UI state (active tab, drill-down state, expanded sections) uses React `useState`. No Redux, Zustand, or Context for fetched data. (Source: architecture.md § Communication Patterns)
- **Query key pattern:** `['plans', planId, 'outputs']` — already established by `usePlanOutputs` hook. Tab switching reads from the same cached `EngineOutput` — no additional API calls. (Source: architecture.md § State Management)
- **Currency formatting:** Use `formatCents` from `@/lib/format-currency` for all currency display. Engine stores currency as cents (integers). Never format in server code or engine. (Source: architecture.md § Number Format Rules)
- **data-testid convention:** Interactive elements: `{action}-{target}` (e.g., `tab-summary`, `button-generate-pdf`). Display elements: `{type}-{content}` (e.g., `value-breakeven-month`). Financial values: `value-{metric}-{period}` (e.g., `value-revenue-y1`). Dynamic elements: `{type}-{description}-{id}` (e.g., `section-pl-summary`). (Source: architecture.md § data-testid Naming Convention)
- **Component file size:** Target ~80-150 lines per component file. The UX spec's component architecture calls for 9 components averaging ~80 lines. No single file should exceed ~300 lines. (Source: ux-financial-statements-spec.md Part 10)
- **Shadcn components:** Use existing `<Tabs>`, `<TabsList>`, `<TabsTrigger>`, `<TabsContent>`, `<Select>`, `<Button>`, `<Skeleton>`, `<Tooltip>`, `<Card>` from `@/components/ui/`. Never modify files in `components/ui/`. (Source: architecture.md § Structure Patterns)
- **Sidebar navigation:** Use the existing Shadcn sidebar primitives from `@/components/ui/sidebar`. The `AppSidebar` component (`app-sidebar.tsx`) is modified to add "My Plan" and "Reports" as plan-context navigation items. Use `wouter`'s `useLocation` for active-item detection. (Source: ux-financial-statements-spec.md Part 1, development guidelines § shadcn_sidebar)
- **Icons:** Use `lucide-react` for all icons. (Source: architecture.md implicit, project convention)

### UI/UX Deliverables

**Screens/Pages:**

- **Financial Statements Container** (`financial-statements.tsx`) — The main tabbed container visible when the user clicks "Reports" in the sidebar. Renders tab bar, callout bar, and active tab content.
- **Summary Tab** (`summary-tab.tsx`) — The default landing tab with collapsible sections showing annual summaries across P&L, Balance Sheet, Cash Flow, Break-Even, and Startup Capital.
- **App Sidebar** (`app-sidebar.tsx`) — Modified to add "My Plan" and "Reports" sidebar items under the active plan section. "My Plan" routes to the existing input panel + dashboard. "Reports" routes to Financial Statements.
- **Planning Workspace** (`planning-workspace.tsx`) — Refactored to render based on a route parameter or sidebar-driven state rather than a view toggle. The workspace view (My Plan vs Reports) is determined by the sidebar navigation path or a workspace-level state, not a header toggle.
- **Planning Header** (`planning-header.tsx`) — Simplified: the mode switcher (Planning Assistant | Forms | Quick Entry) is removed. The header retains plan name, save indicator, and consultant booking link.
- **Dashboard Panel** (`dashboard-panel.tsx`) — Modified to add clickable summary metric cards that navigate to Reports tabs via sidebar state change or programmatic navigation.

**Key UI Elements:**

- Tab bar with 7 tabs (horizontal on desktop, dropdown on mobile)
- Sticky callout bar with 3 key metrics
- Collapsible sections with chevron expand/collapse toggle
- Data tables with sticky row labels and formatted financial values
- Break-even sparkline (SVG cumulative cash flow chart)
- "View Full [Statement]" navigation links within section headers
- "Generate Draft" button (placeholder)
- Linked-column indicator with tooltip
- "My Plan" and "Reports" sidebar navigation items

**UI States:**

- **Loading:** Skeleton placeholders for tab bar and content areas while `usePlanOutputs` is loading
- **Error (400 — no inputs):** Friendly message "Enter your first values to see your financial statements" — no retry button
- **Error (server):** "We couldn't load your projections. Your data is safe — please try refreshing." with Retry button
- **Empty output:** Same message as 400 error — prompts user to enter values
- **Placeholder tabs:** P&L through Audit show placeholder content with icon and description text indicating future availability
- **Mobile (<1024px):** Tab bar converts to dropdown; all content still renders

**Navigation:**

- User reaches Reports (Financial Statements) via: (1) "Reports" sidebar item, (2) Dashboard metric card click within My Plan, (3) "View Full [Statement]" links from within My Plan's Impact Strip (future — Story 5.9)
- User returns to My Plan via: "My Plan" sidebar item
- Both sidebar items appear under the active plan context section (e.g., under the plan name)

### Anti-Patterns & Hard Constraints

- **DO NOT install new packages.** All required dependencies (Shadcn, TanStack Query, lucide-react, wouter) are already present. Do not add charting libraries — the sparkline is hand-drawn SVG.
- **DO NOT modify `components/ui/` files.** These are Shadcn-managed primitives.
- **DO NOT modify `vite.config.ts`, `server/vite.ts`, `drizzle.config.ts`, or `package.json` scripts.** (Source: development guidelines § Forbidden Changes)
- **DO NOT create new API endpoints.** This story is pure frontend — all data comes from the existing `usePlanOutputs` hook which calls `GET /api/plans/:planId/outputs`.
- **DO NOT use `useState` for engine output data.** Use TanStack Query exclusively via `usePlanOutputs`. Local state is only for UI state (active tab, expanded sections, drill-down level).
- **DO NOT use floating point for currency display.** Always use `formatCents` which converts cents integers to formatted dollar strings.
- **DO NOT apply custom hover/active styles to `<Button>` or `<Badge>`.** Built-in elevation handles this. (Source: development guidelines § Interactions)
- **DO NOT nest `<Card>` inside `<Card>`.** (Source: development guidelines § Component Use)
- **DO NOT use `display:table`** — causes width overflow issues. Use CSS flexbox or grid for table-like layouts. If using an HTML `<table>`, that's fine — the restriction is on the CSS `display:table` property on non-table elements. (Source: development guidelines § Layout)
- **DO NOT use emojis anywhere** in the UI. Use lucide-react icons instead. (Source: development guidelines § Emoji)
- **DO NOT add a mode switcher, mode toggle, or any UI element that switches between "Planning Assistant," "Forms," and "Quick Entry."** These concepts are retired in v3. The user navigates between "My Plan" and "Reports" via sidebar — that is not a mode switch, it's navigation between two destinations.
- **DO NOT create a view toggle in the planning header** (e.g., "Dashboard | Statements"). v3 uses sidebar navigation exclusively. The planning header should be simplified to remove the mode switcher and any view toggle.
- **DO NOT create separate wouter routes for Reports.** Reports lives within the planning workspace, driven by workspace-level state that the sidebar controls. The URL remains `/plans/:planId` — the sidebar selection (My Plan vs Reports) is local state, not a URL route.

### Gotchas & Integration Warnings

**Existing Code Awareness — CRITICAL:**

This story has EXISTING partial implementations from a previous dev session (commit `34b78bb`). The following files already exist and must be evaluated, corrected, and completed — not rewritten from scratch unless they are fundamentally broken:

| File | Status | Notes |
|------|--------|-------|
| `client/src/components/planning/financial-statements.tsx` | EXISTS (~203 lines) | Tab container with placeholder tabs, responsive dropdown, loading/error states, callout bar integration. Review for AC compliance. |
| `client/src/components/planning/statements/summary-tab.tsx` | EXISTS (~323 lines) | P&L summary, labor efficiency, BS/CF summaries, break-even analysis, startup capital. Review section completeness against AC12. |
| `client/src/components/planning/statements/statement-table.tsx` | EXISTS (~280 lines) | Table component with sections, data rows, cell value resolution, format functions. Review sticky behavior and drill-down integration. |
| `client/src/components/planning/statements/column-manager.tsx` | EXISTS (~232 lines) | `useColumnManager` hook, `ColumnHeaders`, drill-down state management, value resolver functions. Review for AC16-19. |
| `client/src/components/planning/statements/callout-bar.tsx` | EXISTS (~79 lines) | Key metrics display. Review for AC11 compliance. |
| `client/src/components/planning/statements/statement-section.tsx` | EXISTS (~64 lines) | Collapsible section with header link. Review for AC12-13 compliance. |
| `client/src/components/planning/dashboard-panel.tsx` | EXISTS (modified) | Dashboard with "View Financial Statements" link. Review for AC15 — metric cards should navigate to Reports. |
| `client/src/components/planning/planning-header.tsx` | EXISTS (modified) | Currently includes mode switcher and view toggle. **Mode switcher must be removed.** View toggle must be removed (sidebar handles this). |
| `client/src/pages/planning-workspace.tsx` | EXISTS (modified) | Currently manages `workspaceView` state for dashboard/statements toggle. **Refactor to use sidebar-driven state** instead of header-driven toggle. The workspace still manages the My Plan vs Reports view state, but it's set by sidebar navigation, not a header button. |
| `client/src/components/app-sidebar.tsx` | EXISTS | Currently has plan-level navigation. **Add "My Plan" and "Reports" items** under the active plan section. |
| `client/src/components/planning/mode-switcher.tsx` | EXISTS | **This component is retired.** It should no longer be imported or rendered anywhere. Do NOT delete the file (other stories may reference it for migration), but remove all imports and usage. |

The dev agent MUST read all existing files first, compare against acceptance criteria, and fix/enhance rather than recreate. Deleting and rewriting would lose existing work that may be largely correct.

**v3 Architecture Change — Mode Switcher Retirement:**

The v3 UX spec eliminates the "Planning Assistant | Forms | Quick Entry" mode switcher entirely. The key insight is "Quick Entry IS Reports" — Maria edits directly in financial statements (Reports), not in a separate input grid. Sam edits through structured forms (My Plan). These are two sidebar destinations, not three modes.

Implications for this story:
- The `mode-switcher.tsx` component is no longer rendered anywhere.
- The `ExperienceTier` type and `activeMode` state in the planning workspace may still be used internally (for API persistence of user preference) but should NOT drive any visible UI toggle.
- The planning header is simplified — it shows plan name, save indicator, and consultant booking. No mode selector.
- The planning workspace renders My Plan (input panel + dashboard) or Reports (financial statements) based on sidebar selection, not mode.

**Engine Output Structure:**

The `EngineOutput` type from `shared/financial-engine.ts` contains:
- `annualSummaries: AnnualSummary[]` (5 elements, one per year) — primary source for annual-view data
- `monthlyProjections: MonthlyProjection[]` (60 elements) — source for quarterly/monthly drill-down
- `roiMetrics: ROIMetrics` — break-even month, total startup investment, ROI, cumulative cash flow
- `plAnalysis: PLAnalysisOutput[]` (5 elements) — labor efficiency, salary cap, P&L analysis ratios
- `identityChecks: IdentityCheck[]` — audit check results
- `valuation: ValuationOutput[]` (5 elements) — business valuation
- `roicExtended: ROICExtendedOutput[]` (5 elements) — ROIC detail

All these are already returned by `usePlanOutputs` hook. No new data fetching needed.

**Quarterly Value Aggregation:**

When drilling down to quarterly view, values must be aggregated from monthly projections. Currency amounts should sum across months. Percentage fields (like COGS %, GP %) should NOT be summed — they should be recalculated from the summed numerator and denominator, OR the annual value should be displayed as the quarter "total." The existing `getQuarterlyValue` function in `column-manager.tsx` sums all fields — this is correct for currency but produces nonsensical results for percentage fields. The dev agent should verify percentage display at quarterly/monthly levels makes sense.

**Break-Even Calendar Date:**

The break-even month is relative to plan start. The current implementation uses `new Date()` to estimate the calendar date. This is an approximation — it assumes the plan starts "now." This is acceptable for MVP.

**Responsive Breakpoint:**

The UX spec defines a 1024px breakpoint. Below 1024px, tabs convert to a dropdown. The existing implementation uses a `useMediaQuery` hook for this. Verify it works correctly.

**Label Column Width:**

The sticky label column needs a minimum width (currently 180px in `statement-table.tsx`) to prevent row labels from being truncated. This is a good default but may need adjustment for longer labels.

**Statement Table Already Uses Annual-Only Columns:**

The `StatementTable` component currently only renders annual columns (Y1-Y5) even though the `ColumnManager` supports drill-down. The summary tab's tables intentionally use annual-only — they don't need drill-down. The progressive disclosure infrastructure (drill-down to quarterly/monthly) is used by the detail tabs (Stories 5.3-5.5). Story 5.2 builds the infrastructure; detail tabs consume it.

**`usePlanOutputs` Hook:**

This hook (from `@/hooks/use-plan-outputs`) wraps the TanStack Query call to `GET /api/plans/:planId/outputs`. It returns `{ output, isLoading, isFetching, error, invalidateOutputs }`. The output is the complete `EngineOutput` object. This hook is already used by the dashboard panel.

**Sidebar State and Workspace View:**

The workspace view (My Plan vs Reports) should be driven by a state variable in `planning-workspace.tsx` that the sidebar controls. When the user clicks "Reports" in the sidebar, it sets `workspaceView` to `"statements"`. When the user clicks "My Plan", it sets to `"dashboard"`. The sidebar items need access to this state — pass callbacks via props, React context, or URL search params. The simplest approach is to keep the `workspaceView` state in the workspace and pass a `setWorkspaceView` callback to the sidebar via context or a shared hook.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/components/planning/financial-statements.tsx` | MODIFY | Review and fix tab container against AC2, AC6-10, AC26. Verify loading/error states, responsive dropdown, placeholder tabs. Remove `onBack` prop (no longer needed — sidebar handles navigation back to My Plan). |
| `client/src/components/planning/statements/summary-tab.tsx` | MODIFY | Review and fix section content against AC11-14. Ensure all required rows are present per AC12. |
| `client/src/components/planning/statements/statement-table.tsx` | MODIFY | Review sticky behavior (AC22-24), formatting (AC25), and data-testid conventions. |
| `client/src/components/planning/statements/column-manager.tsx` | MODIFY | Review drill-down infrastructure (AC16-19), linked-column indicator (AC21), expand/collapse controls. |
| `client/src/components/planning/statements/callout-bar.tsx` | MODIFY | Review key metrics display (AC11) — verify Total 5yr Pre-Tax Income, Break-even Month, 5yr ROI. |
| `client/src/components/planning/statements/statement-section.tsx` | MODIFY | Review collapsible section with navigation links (AC12-13). |
| `client/src/components/planning/dashboard-panel.tsx` | MODIFY | Add clickable metric cards that navigate to Reports tabs (AC15). |
| `client/src/components/planning/planning-header.tsx` | MODIFY | Remove mode switcher. Remove view toggle. Simplify to: plan name, save indicator, consultant booking link, sidebar trigger. (AC5) |
| `client/src/pages/planning-workspace.tsx` | MODIFY | Refactor to use sidebar-driven state for My Plan vs Reports view switching. Remove mode-switcher-related state management. Keep `workspaceView` state but drive it from sidebar, not header toggle. (AC1, AC3, AC5) |
| `client/src/components/app-sidebar.tsx` | MODIFY | Add "My Plan" and "Reports" sidebar items under the active plan context section. Active item styling indicates current view. (AC1, AC4) |

### Testing Expectations

- **Primary testing method:** Playwright E2E via `run_test` tool.
- **Key scenarios to verify:**
  - Navigate to Reports from "Reports" sidebar item
  - Navigate back to My Plan from "My Plan" sidebar item
  - Sidebar correctly highlights the active destination (Reports vs My Plan)
  - Mode switcher is NOT visible anywhere in the UI
  - Summary tab renders with all required sections (P&L, Labor, BS, CF, Break-Even, Startup Capital)
  - Sections expand/collapse correctly
  - "View Full P&L" / "View Full Balance Sheet" / "View Full Cash Flow" links switch to the correct tab
  - Tab switching is instant (no loading spinner between tabs)
  - Responsive: below 1024px, tabs convert to dropdown
  - Financial values display correctly formatted (currency as $X,XXX, percentages as X.X%)
  - Break-even sparkline renders
  - Dashboard drill-down links in My Plan navigate to correct Reports tabs
- **No unit tests needed** — this story is pure UI with no new business logic. The engine output is already validated by Story 5.1's 173 tests.
- **Visual verification:** Sticky headers/labels should remain visible during scroll. Collapsible sections should animate smoothly.

### Dependencies & Environment Variables

- **No new packages needed.** All dependencies are already installed.
- **No new environment variables.** This is a frontend-only story.
- **Dependencies on completed work:**
  - Story 5.1 (done) — engine extension providing `plAnalysis`, `valuation`, `roicExtended`, and extended `identityChecks` in `EngineOutput`
  - Epic 4 (done) — planning workspace layout, `usePlanOutputs` hook, `usePlanAutoSave` hook, dashboard panel
  - Epic 3 (done) — financial engine core, `formatCents` utility, plan schema
- **Stories that depend on THIS story:**
  - Stories 5.3-5.5 (detail tabs) — consume the tab container, `StatementTable`, `ColumnManager`, and progressive disclosure infrastructure built here
  - Story 5.6 (Quick Entry integration) — adds inline editing to the statement tables within Reports; inline editing cells are always editable (no mode gating)
  - Story 5.7 (Scenario Comparison) — adds `ScenarioBar` to the container
  - Story 5.8 (Guardian Bar) — adds `GuardianBar` to the container
  - Story 5.9 (Impact Strip) — adds `ImpactStrip` to My Plan with deep links to Reports

### References

- `_bmad-output/planning-artifacts/ux-financial-statements-spec.md` Part 1 (Navigation Model — Two-Door Architecture), Part 2 (Progressive Disclosure), Part 8.1 (Summary Financials), Part 9 (Responsive Strategy), Part 10 (Component Architecture), Part 12 (Empty & Incomplete States)
- `_bmad-output/planning-artifacts/architecture.md` § Implementation Patterns & Consistency Rules — naming, state management, data-testid, number formatting
- `_bmad-output/planning-artifacts/epics.md` § Story 5.2 — acceptance criteria and dev notes
- `_bmad-output/implementation-artifacts/5-1-financial-engine-extension.md` — engine output structure, field naming, computation sections
- `_bmad-output/implementation-artifacts/epic-4-retrospective.md` — codebase health baseline, component patterns, hooks
- `shared/financial-engine.ts` — `EngineOutput`, `AnnualSummary`, `MonthlyProjection`, `PLAnalysisOutput`, `ROICExtendedOutput`, `ValuationOutput` type definitions
- `client/src/hooks/use-plan-outputs.ts` — existing hook for fetching engine output

## Dev Agent Record

### Agent Model Used

Claude 4.6 Opus (via Replit Agent)

### Completion Notes

Story 5.2 implementation was largely completed in a prior dev session (commit 34b78bb). This session reviewed all existing code against all 26 acceptance criteria, identified and fixed 3 gaps:

1. **AC23 (Sticky section headers):** Added `sticky top-0 z-20` to table section header `<tr>` elements in `statement-table.tsx` so section headers remain visible during vertical scroll.
2. **AC24 (Sticky element shadows):** Added subtle box-shadow to all sticky elements — section headers get `shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]`, sticky row labels and header cells get `shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]` to indicate floating.
3. **AC19 (Keyboard navigation):** Added `tabIndex`, `onClick`, and `onKeyDown` handlers to year column headers in `StatementTable`. Enter drills down, Escape drills up. These are optional props (`onDrillDown`/`onDrillUp`) so summary tab tables (which don't need drill-down) are unaffected.

All other ACs were already satisfied by the existing implementation:
- Sidebar "My Plan" / "Reports" navigation via WorkspaceViewContext (AC1-4)
- Mode switcher removed from planning header (AC5)
- Tab bar with 7 tabs, responsive dropdown, placeholder tabs (AC2, AC6-10)
- Callout bar with 5yr Pre-Tax, Break-even, ROI (AC11)
- All 6 summary sections with correct rows, expand/collapse, navigation links (AC12-14)
- Dashboard metric cards with deep links to Reports tabs (AC15)
- useColumnManager with drill-down state management (AC16-18)
- getAnnualValue/getQuarterlyValue/getMonthlyValue helpers (AC20)
- Linked-column indicator with tooltip (AC21)
- Sticky row labels (AC22)
- Currency formatting via formatCents, percentages as X.X% (AC25)
- "Generate Draft" placeholder button (AC26)

### File List

- `client/src/components/planning/statements/statement-table.tsx` — MODIFIED (sticky section headers, shadows, keyboard navigation props; CR: hover-elevate fix)
- `client/src/components/planning/statements/column-manager.tsx` — MODIFIED (CR: percentage field averaging in getQuarterlyValue, format parameter added)
- `client/src/components/planning/statements/summary-tab.tsx` — MODIFIED (CR: EnrichedAnnualSummary type, removed as-any cast)
- `client/src/components/planning/statements/callout-bar.tsx` — REVIEWED (no changes needed)
- `client/src/components/planning/statements/statement-section.tsx` — REVIEWED (no changes needed)
- `client/src/components/planning/financial-statements.tsx` — REVIEWED (no changes needed)
- `client/src/components/planning/dashboard-panel.tsx` — REVIEWED (no changes needed)
- `client/src/components/planning/planning-header.tsx` — REVIEWED (no changes needed)
- `client/src/pages/planning-workspace.tsx` — MODIFIED (CR: ExperienceTier type moved here from mode-switcher.tsx)
- `client/src/components/planning/input-panel.tsx` — MODIFIED (CR: ExperienceTier import updated)
- `client/src/components/app-sidebar.tsx` — REVIEWED (no changes needed)

### Adversarial Code Review (2026-02-17)

**Reviewer:** Claude 4.6 Opus (BMAD code-review workflow)

**Findings (7 total: 2 HIGH, 3 MEDIUM, 2 LOW):**

| # | Severity | File | Finding | Resolution |
|---|----------|------|---------|------------|
| H1 | HIGH | column-manager.tsx | `getQuarterlyValue` summed percentage fields (COGS%, GP%, etc.) across 3 months, producing 3x values (e.g., 90% instead of 30%) | Added `PERCENTAGE_FIELDS` set and `format` parameter; percentage fields now average instead of sum |
| H2 | HIGH | column-manager.tsx | `getAnnualValue` lacked field type classification — all fields treated as summable | Added `format` parameter propagation so percentage vs currency distinction is explicit |
| M1 | MEDIUM | planning-workspace.tsx, input-panel.tsx | `ExperienceTier` type imported from retired `mode-switcher.tsx` | Moved type to `planning-workspace.tsx`, updated imports |
| M2 | MEDIUM | summary-tab.tsx | P&L section uses 7 internal sub-groups vs AC12's flat list | No change — sub-groups are internal table formatting within one collapsible section; improves readability |
| M3 | MEDIUM | column-manager.tsx | `ColumnHeaders` component and Expand All/Collapse All controls appear unused | No change — forward infrastructure for Stories 5.3-5.5 detail tabs; summary tab intentionally uses annual-only |
| L1 | LOW | statement-table.tsx | `hover:bg-muted/30` used on table rows instead of design system elevation utilities | Replaced with `hover-elevate` class per project design guidelines |
| L2 | LOW | summary-tab.tsx | `computeCogsPct` returned `as any` cast to bypass type checking | Introduced `EnrichedAnnualSummary` type alias (`AnnualSummary & { cogsPct, directLaborPct, opexPct }`), renamed function to `computeEnrichedSummaries` |

**All findings resolved. LSP clean across all 10 implementation files.**

### Testing Summary

- **Primary method:** Playwright E2E via run_test tool
- **Scenarios verified:**
  - Navigate to Reports from sidebar, verify all 7 tabs visible
  - Summary tab active by default with callout bar metrics
  - All 6 summary sections render (P&L, Labor, BS, CF, Break-Even, Startup Capital)
  - Tab switching to P&L shows placeholder "Coming in the next update"
  - Tab switching back to Summary is instant (no loading state)
  - Navigate back to My Plan via sidebar, financial statements hidden
  - Active sidebar item styling correct for both destinations
  - Mode switcher NOT present anywhere in the UI
  - Generate Draft button visible
  - Break-even sparkline renders
- **ACs covered by tests:** AC1-11, AC12-13 (partial), AC14 (partial), AC15 (partial), AC26
- **All tests passing:** Yes
- **LSP Status:** Clean — 0 errors, 0 warnings on modified files
- **Visual Verification:** Playwright screenshots verified UI renders correctly
