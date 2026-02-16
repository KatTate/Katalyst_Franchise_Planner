# Story 5.2: Financial Statements Container & Summary Tab

Status: ready-for-dev

## Story

As a franchisee (any persona),
I want a unified Financial Statements view with tabbed navigation and an annual Summary as the landing tab,
So that I can quickly assess my business plan across all 5 years and drill into detail when I need it (FR7d).

## Acceptance Criteria

**Container & Tab Navigation:**

1. When I click "Financial Statements" in the sidebar navigation or the dashboard's "View Financial Statements" link, the Financial Statements container renders with a horizontal tab bar showing: Summary | P&L | Balance Sheet | Cash Flow | ROIC | Valuation | Audit
2. The Summary tab is active by default (except in Quick Entry mode where P&L is default — deferred to Story 5.6)
3. Tab switching is instant with no loading state — all data comes from the cached engine computation already fetched by `usePlanOutputs`
4. Each tab remembers its scroll position and drill-down state within the session (React state, not persisted)
5. On viewports below 1024px, tabs convert to a dropdown selector
6. Tabs that are not yet implemented (P&L, Balance Sheet, Cash Flow, ROIC, Valuation, Audit) render placeholder content indicating "Coming in the next update" — the container must NOT crash or show broken UI for these tabs

**Summary Tab Content:**

7. A sticky Key Metrics Callout Bar appears at the top showing: Total 5yr Pre-Tax Income, Break-even Month (with estimated calendar date), and 5yr ROI %
8. Below the callout bar, collapsible sections render:
   - Annual P&L Summary (expanded by default) — rows: Revenue, Cost of Sales, COGS %, Gross Profit, GP %, Direct Labor, DL %, Contribution Margin %, Total OpEx, OpEx %, EBITDA, EBITDA %, D&A, Interest, Net PBT, Net PBT %
   - Labor Efficiency subsection (collapsed by default) — rows: Labor Efficiency Ratio, Adj. Labor Efficiency, Salary Cap at Target, Over/Under Cap
   - Balance Sheet Summary (collapsed by default) — rows: Total Assets, (of which Cash), Total Liabilities, Total Net Assets
   - Cash Flow Summary (collapsed by default) — rows: Closing Cash Balance, Operating Cash Flow, Net Cash Flow
   - Break-Even Analysis (expanded by default) — break-even month, estimated calendar date, cumulative cash flow sparkline, plain-language interpretation ("You'd start making money by [date]")
   - Startup Capital Summary (collapsed by default) — Total investment, 5-Year Cumulative Cash Flow
9. Each section header that has a corresponding detail tab includes a link ("View Full P&L", "View Full Balance Sheet", "View Full Cash Flow") that navigates to that tab
10. Year 1 pre-tax margin interpretation text appears below the P&L Summary section with a trend icon (up/down arrow)

**Dashboard Drill-Down Integration:**

11. On the existing Dashboard Panel, summary metric cards become clickable links that navigate to the Financial Statements view at the relevant tab (e.g., clicking a pre-tax income metric navigates to the P&L tab)
12. The planning workspace supports a "dashboard" vs "statements" view toggle, managed by workspace-level state

**Progressive Disclosure Infrastructure:**

13. A `useColumnManager` hook manages drill-down state: clicking a year column header in any statement tab expands that year to show 4 quarterly columns (Q1-Q4) plus the annual total; clicking a quarter expands to 3 monthly columns
14. Other years remain collapsed as annual totals when one year is drilled down
15. "Expand All" / "Collapse All" controls are available in the column header area
16. Keyboard: Enter on a focused column header drills down; Escape goes up a level
17. `getAnnualValue`, `getQuarterlyValue`, and `getMonthlyValue` helper functions resolve cell values from the correct data source (annual summaries, monthly projections, or P&L analysis arrays)

**Linked-Column Indicators (Pre-Epic-7):**

18. A small link icon with "Linked" label appears in the column header area with a tooltip: "All years share the same input value. Per-year values will be available in a future update."

**Completeness Indicators:**

19. Each tab in the tab bar shows a completeness badge: tabs with editable inputs show "X of Y inputs customized" or a visual indicator; tabs with no editable inputs show no indicator. (Visual structure only — actual completeness tracking wired in Story 5.6 when inline editing is enabled)

**Sticky Elements & Formatting:**

20. Row labels (leftmost column) are sticky horizontally — always visible during horizontal scroll
21. Section headers are sticky vertically — always visible during vertical scroll
22. Sticky elements have a high z-index and subtle shadow to indicate floating
23. Currency values format as $X,XXX using the existing `formatCents` utility; percentages display as X.X%

**Generate PDF Button:**

24. A "Generate Draft" button appears in the Financial Statements header area (non-functional placeholder — PDF generation is Story 6.1)

**Planning Header Integration:**

25. The planning header includes a view toggle (Dashboard / Statements) so the user can switch between the dashboard panel and the financial statements view within the workspace

## Dev Notes

### Architecture Patterns to Follow

- **Component naming:** PascalCase components, kebab-case files — `FinancialStatements` in `financial-statements.tsx`, `SummaryTab` in `summary-tab.tsx`, `StatementTable` in `statement-table.tsx` (Source: architecture.md § Code Naming)
- **State management:** TanStack Query for all server data via the existing `usePlanOutputs` hook. Local UI state (active tab, drill-down state, expanded sections) uses React `useState`. No Redux, Zustand, or Context for fetched data. (Source: architecture.md § Communication Patterns)
- **Query key pattern:** `['plans', planId, 'outputs']` — already established by `usePlanOutputs` hook. Tab switching reads from the same cached `EngineOutput` — no additional API calls. (Source: architecture.md § State Management)
- **Currency formatting:** Use `formatCents` from `@/lib/format-currency` for all currency display. Engine stores currency as cents (integers). Never format in server code or engine. (Source: architecture.md § Number Format Rules)
- **data-testid convention:** Interactive elements: `{action}-{target}` (e.g., `tab-summary`, `button-generate-pdf`). Display elements: `{type}-{content}` (e.g., `value-breakeven-month`). Financial values: `value-{metric}-{period}` (e.g., `value-revenue-y1`). Dynamic elements: `{type}-{description}-{id}` (e.g., `section-pl-summary`). (Source: architecture.md § data-testid Naming Convention)
- **Component file size:** Target ~80-150 lines per component file. The UX spec's component architecture calls for 9 components averaging ~80 lines. No single file should exceed ~300 lines. (Source: ux-financial-statements-spec.md Part 10)
- **Shadcn components:** Use existing `<Tabs>`, `<TabsList>`, `<TabsTrigger>`, `<TabsContent>`, `<Select>`, `<Button>`, `<Skeleton>`, `<Tooltip>`, `<Card>` from `@/components/ui/`. Never modify files in `components/ui/`. (Source: architecture.md § Structure Patterns)
- **Icons:** Use `lucide-react` for all icons. (Source: architecture.md implicit, project convention)

### UI/UX Deliverables

**Screens/Pages:**

- **Financial Statements Container** (`financial-statements.tsx`) — The main tabbed container visible when the user navigates to Financial Statements. Renders tab bar, callout bar, and active tab content.
- **Summary Tab** (`summary-tab.tsx`) — The default landing tab with collapsible sections showing annual summaries across P&L, Balance Sheet, Cash Flow, Break-Even, and Startup Capital.
- **Planning Workspace** (`planning-workspace.tsx`) — Modified to support "dashboard" vs "statements" view toggle.
- **Planning Header** (`planning-header.tsx`) — Modified to include Dashboard/Statements view toggle.
- **Dashboard Panel** (`dashboard-panel.tsx`) — Modified to add clickable links that navigate to Financial Statements tabs.

**Key UI Elements:**

- Tab bar with 7 tabs (horizontal on desktop, dropdown on mobile)
- Sticky callout bar with 3 key metrics
- Collapsible sections with chevron expand/collapse toggle
- Data tables with sticky row labels and formatted financial values
- Break-even sparkline (SVG cumulative cash flow chart)
- "View Full [Statement]" navigation links within section headers
- "Generate Draft" button (placeholder)
- Linked-column indicator with tooltip
- View toggle in planning header (Dashboard / Statements)

**UI States:**

- **Loading:** Skeleton placeholders for tab bar and content areas while `usePlanOutputs` is loading
- **Error (400 — no inputs):** Friendly message "Enter your first values to see your financial statements" — no retry button
- **Error (server):** "We couldn't load your projections. Your data is safe — please try refreshing." with Retry button
- **Empty output:** Same message as 400 error — prompts user to enter values
- **Placeholder tabs:** P&L through Audit show placeholder content with icon and description text indicating future availability
- **Mobile (<1024px):** Tab bar converts to dropdown; all content still renders

**Navigation:**

- User reaches Financial Statements via: (1) sidebar nav item "Financial Statements", (2) dashboard metric card click, (3) view toggle in planning header
- User returns to Dashboard via: view toggle in planning header

### Anti-Patterns & Hard Constraints

- **DO NOT install new packages.** All required dependencies (Shadcn, TanStack Query, lucide-react, wouter) are already present. Do not add charting libraries — the sparkline is hand-drawn SVG.
- **DO NOT modify `components/ui/` files.** These are Shadcn-managed primitives.
- **DO NOT modify `vite.config.ts`, `server/vite.ts`, `drizzle.config.ts`, or `package.json` scripts.** (Source: development guidelines § Forbidden Changes)
- **DO NOT create new API endpoints.** This story is pure frontend — all data comes from the existing `usePlanOutputs` hook which calls `GET /api/plans/:planId/outputs`.
- **DO NOT use `useState` for engine output data.** Use TanStack Query exclusively via `usePlanOutputs`. Local state is only for UI state (active tab, expanded sections, drill-down level).
- **DO NOT create separate routes for Financial Statements.** The statements view lives WITHIN the planning workspace page, toggled by workspace-level state — not a separate route.
- **DO NOT use floating point for currency display.** Always use `formatCents` which converts cents integers to formatted dollar strings.
- **DO NOT apply custom hover/active styles to `<Button>` or `<Badge>`.** Built-in elevation handles this. (Source: development guidelines § Interactions)
- **DO NOT nest `<Card>` inside `<Card>`.** (Source: development guidelines § Component Use)
- **DO NOT use `display:table`** — causes width overflow issues. Use CSS flexbox or grid for table-like layouts. If using an HTML `<table>`, that's fine — the restriction is on the CSS `display:table` property on non-table elements. (Source: development guidelines § Layout)
- **DO NOT use emojis anywhere** in the UI. Use lucide-react icons instead. (Source: development guidelines § Emoji)

### Gotchas & Integration Warnings

**Existing Code Awareness — CRITICAL:**

This story has EXISTING partial implementations from a previous dev session (commit `34b78bb`). The following files already exist and must be evaluated, corrected, and completed — not rewritten from scratch unless they are fundamentally broken:

| File | Status | Notes |
|------|--------|-------|
| `client/src/components/planning/financial-statements.tsx` | EXISTS (~203 lines) | Tab container with placeholder tabs, responsive dropdown, loading/error states, callout bar integration. Review for AC compliance. |
| `client/src/components/planning/statements/summary-tab.tsx` | EXISTS (~323 lines) | P&L summary, labor efficiency, BS/CF summaries, break-even analysis, startup capital. Review section completeness against AC8. |
| `client/src/components/planning/statements/statement-table.tsx` | EXISTS (~280 lines) | Table component with sections, data rows, cell value resolution, format functions. Review sticky behavior and drill-down integration. |
| `client/src/components/planning/statements/column-manager.tsx` | EXISTS (~232 lines) | `useColumnManager` hook, `ColumnHeaders`, drill-down state management, value resolver functions. Review for AC13-16. |
| `client/src/components/planning/statements/callout-bar.tsx` | EXISTS (~79 lines) | Key metrics display. Review for AC7 compliance. |
| `client/src/components/planning/statements/statement-section.tsx` | EXISTS (~64 lines) | Collapsible section with header link. Review for AC8-9 compliance. |
| `client/src/components/planning/dashboard-panel.tsx` | EXISTS (modified) | Dashboard with "View Financial Statements" link. Review for AC11. |
| `client/src/components/planning/planning-header.tsx` | EXISTS (modified) | Header with view toggle. Review for AC25. |
| `client/src/pages/planning-workspace.tsx` | EXISTS (modified) | Workspace with dashboard/statements view switching. Review for AC12. |

The dev agent MUST read all existing files first, compare against acceptance criteria, and fix/enhance rather than recreate. Deleting and rewriting would lose existing work that may be largely correct.

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

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/components/planning/financial-statements.tsx` | MODIFY | Review and fix tab container against AC1-6, AC24. Verify loading/error states, responsive dropdown, placeholder tabs. |
| `client/src/components/planning/statements/summary-tab.tsx` | MODIFY | Review and fix section content against AC7-10. Ensure all required rows are present per AC8. |
| `client/src/components/planning/statements/statement-table.tsx` | MODIFY | Review sticky behavior (AC20-22), formatting (AC23), and data-testid conventions. |
| `client/src/components/planning/statements/column-manager.tsx` | MODIFY | Review drill-down infrastructure (AC13-16), linked-column indicator (AC18), expand/collapse controls. |
| `client/src/components/planning/statements/callout-bar.tsx` | MODIFY | Review key metrics display (AC7) — verify Total 5yr Pre-Tax Income, Break-even Month, 5yr ROI. |
| `client/src/components/planning/statements/statement-section.tsx` | MODIFY | Review collapsible section with navigation links (AC8-9). |
| `client/src/components/planning/dashboard-panel.tsx` | MODIFY | Add clickable metric cards that navigate to Financial Statements tabs (AC11). |
| `client/src/components/planning/planning-header.tsx` | MODIFY | Add/verify Dashboard vs Statements view toggle (AC25). |
| `client/src/pages/planning-workspace.tsx` | MODIFY | Verify dashboard/statements view switching (AC12), statement tab routing, back-to-dashboard flow. |

### Testing Expectations

- **Primary testing method:** Playwright E2E via `run_test` tool.
- **Key scenarios to verify:**
  - Navigate to Financial Statements from sidebar or dashboard link
  - Summary tab renders with all required sections (P&L, Labor, BS, CF, Break-Even, Startup Capital)
  - Sections expand/collapse correctly
  - "View Full P&L" / "View Full Balance Sheet" / "View Full Cash Flow" links switch to the correct tab
  - Tab switching is instant (no loading spinner between tabs)
  - Responsive: below 1024px, tabs convert to dropdown
  - Financial values display correctly formatted (currency as $X,XXX, percentages as X.X%)
  - Break-even sparkline renders
  - Dashboard drill-down links navigate to correct statement tabs
  - View toggle in planning header switches between dashboard and statements
- **No unit tests needed** — this story is pure UI with no new business logic. The engine output is already validated by Story 5.1's 173 tests.
- **Visual verification:** Sticky headers/labels should remain visible during scroll. Collapsible sections should animate smoothly.

### Dependencies & Environment Variables

- **No new packages needed.** All dependencies are already installed.
- **No new environment variables.** This is a frontend-only story.
- **Dependencies on completed work:**
  - Story 5.1 (done) — engine extension providing `plAnalysis`, `valuation`, `roicExtended`, and extended `identityChecks` in `EngineOutput`
  - Epic 4 (done) — planning workspace layout, `usePlanOutputs` hook, `usePlanAutoSave` hook, dashboard panel, mode switcher
  - Epic 3 (done) — financial engine core, `formatCents` utility, plan schema
- **Stories that depend on THIS story:**
  - Stories 5.3-5.5 (detail tabs) — consume the tab container, `StatementTable`, `ColumnManager`, and progressive disclosure infrastructure built here
  - Story 5.6 (Quick Entry integration) — adds inline editing to the statement tables
  - Story 5.7 (Scenario Comparison) — adds `ScenarioBar` to the container
  - Story 5.8 (Guardian Bar) — adds `GuardianBar` to the container
  - Story 5.9 (Impact Strip) — adds `ImpactStrip` and `DocumentPreviewModal`

### References

- `_bmad-output/planning-artifacts/ux-financial-statements-spec.md` Part 1 (Navigation Model), Part 2 (Progressive Disclosure), Part 8.1 (Summary Financials), Part 9 (Responsive Strategy), Part 10 (Component Architecture), Part 12 (Empty & Incomplete States)
- `_bmad-output/planning-artifacts/architecture.md` § Implementation Patterns & Consistency Rules — naming, state management, data-testid, number formatting
- `_bmad-output/planning-artifacts/epics.md` § Story 5.2 — acceptance criteria and dev notes
- `_bmad-output/implementation-artifacts/5-1-financial-engine-extension.md` — engine output structure, field naming, computation sections
- `_bmad-output/implementation-artifacts/epic-4-retrospective.md` — codebase health baseline, component patterns, hooks
- `shared/financial-engine.ts` — `EngineOutput`, `AnnualSummary`, `MonthlyProjection`, `PLAnalysisOutput`, `ROICExtendedOutput`, `ValuationOutput` type definitions
- `client/src/hooks/use-plan-outputs.ts` — existing hook for fetching engine output

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Completion Notes

### File List

### Testing Summary
