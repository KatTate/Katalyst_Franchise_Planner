# Story 5.3: P&L Statement Tab

Status: review

## Story

As a franchisee,
I want to see my complete Profit & Loss statement matching the reference spreadsheet,
So that I can understand how my assumptions flow through to profitability (FR7a).

## Acceptance Criteria

**P&L Tab Structure and Layout:**

1. Given I navigate to the P&L tab within Financial Statements, when the tab renders, then a sticky Key Metrics Callout Bar shows: Annual Revenue (Y1), Pre-Tax Income (Y1), and Pre-Tax Margin %.

2. Given the P&L tab renders, then it displays as a tabular financial document with progressive disclosure — annual view by default, with drill-down to quarterly and monthly columns via the `useColumnManager` hook built in Story 5.2.

3. Given the P&L tab renders, then row sections match the reference spreadsheet structure:
   - **Revenue:** Monthly Revenue, Annual Revenue
   - **COGS:** COGS %, Materials / COGS, Royalties, Ad Fund, Total Cost of Sales
   - **Gross Profit:** Gross Profit $, Gross Margin %
   - **Operating Expenses:** Direct Labor ($ and %), Management Salaries, Payroll Tax & Benefits, Facilities, Marketing/Advertising, Discretionary Marketing, Other OpEx, Total Operating Expenses
   - **EBITDA:** EBITDA $, EBITDA Margin %
   - **Below EBITDA:** Depreciation & Amortization, Interest Expense
   - **Pre-Tax Income:** Pre-Tax Income $, Pre-Tax Margin %
   - **P&L Analysis:** Adjusted Pre-Tax Profit, Target Pre-Tax Profit, Above/Below Target, Salary Cap at Target, (Over)/Under Cap, Labor Efficiency, Adjusted Labor Efficiency, Discretionary Marketing %, PR Taxes & Benefits % of Wages, Other OpEx % of Revenue

**Collapsible Sections:**

4. Given the P&L tab renders, then each row section (Revenue, COGS, Gross Profit, etc.) has a clickable section header that collapses or expands its child rows with a chevron icon (ChevronDown when expanded, ChevronRight when collapsed).

5. Given the P&L tab renders initially, then all sections are expanded by default except P&L Analysis (which is collapsed by default, since it contains advanced ratio analysis).

**Visual Distinction — Input vs Computed Cells:**

6. Given the P&L tab renders, then input-driven rows (Monthly Revenue, COGS %, Direct Labor %, Management Salaries, Facilities, Marketing, Other OpEx) are visually distinguished from computed rows using three non-color indicators:
   - A subtle tinted background (`primary/5`)
   - A thin dashed left border (`primary/20`)
   - A small pencil icon visible on hover (hidden by default using `invisible`/`visible` toggle)

7. Given the visual distinction, then it does NOT rely solely on color — the dashed border and pencil icon provide non-color indicators for accessibility (UX Critique Issue #7).

8. Given the P&L tab renders, then computed rows use standard background, medium weight text, no border decoration. Subtotal rows use `font-medium` with a top border. Total rows (Pre-Tax Income) use `font-semibold` with a double top border.

**Interpretation Rows:**

9. Given the P&L tab renders, then key computed rows include an interpretation row below them showing contextual "so what" text:
   - **Gross Profit:** Shows Year 1 gross margin percentage (e.g., "42.5% gross margin in Year 1")
   - **Pre-Tax Income:** Shows Year 1 pre-tax margin percentage (e.g., "11.7% pre-tax margin in Year 1")
   - **Labor Efficiency:** Shows a ratio context description ("Ratio of gross profit consumed by all wages")

10. Given interpretation rows render, then interpretations use neutral language — never "good" or "bad." If no brand benchmark exists, the interpretation shows only the percentage/ratio without benchmark context.

11. Given interpretation rows render, then each interpretation row is associated with its parent data row via `aria-describedby` linking the parent `tr` to the interpretation `tr`'s `id`.

**Computed Cell Tooltips:**

12. Given the P&L tab renders, then hovering over any computed (non-input) cell shows a tooltip with three elements:
    - **Plain-language explanation** of what the number means (bold text)
    - **Calculation formula** showing how it's derived (muted text)
    - **"View in glossary" link** pointing to the glossary (Story 5.10)

13. Given a computed cell tooltip renders, then every computed row in the P&L tab has a tooltip defined — no computed cell is left without explanation.

**Accessibility:**

14. Given the P&L tab renders, then the table uses ARIA grid roles: `role="grid"` on the table, `role="row"` on rows, `role="rowheader"` on label cells, `role="gridcell"` on data cells.

15. Given the P&L tab renders, then input cells use `aria-readonly="false"` and computed cells use `aria-readonly="true"` on their `gridcell` elements.

**Data Mapping — Monthly Revenue:**

16. Given the P&L tab renders at the annual level, then the "Monthly Revenue" row shows the average monthly revenue for each year (annual revenue / 12), not the sum. At monthly drill-down, it shows the actual monthly projection value.

**Progressive Disclosure:**

17. Given I click on a year column header, then that year expands to show quarterly or monthly columns using the `useColumnManager` drill-down infrastructure from Story 5.2. The P&L table correctly renders data for all visible columns.

## Dev Notes

### Architecture Patterns to Follow

- **Component naming:** PascalCase components, kebab-case files — `PnlTab` in `pnl-tab.tsx` (Source: architecture.md § Code Naming)
- **State management:** No new API calls. All data comes from `EngineOutput` passed as a prop from `FinancialStatements` container, which uses `usePlanOutputs` hook. Local state only for UI (expanded/collapsed sections, drill-down state). (Source: architecture.md § Communication Patterns)
- **Currency formatting:** Use `formatCents` from `@/lib/format-currency` for all currency display. Engine stores currency as cents (integers). Never format in server code or engine. (Source: architecture.md § Number Format Rules)
- **Percentage formatting:** Percentages are stored as decimals (e.g., 0.065 = 6.5%). Display as `(value * 100).toFixed(1) + "%"`. (Source: architecture.md § Number Format Rules)
- **data-testid convention:** Rows: `pnl-row-{key}`, values: `pnl-value-{row-key}-{col-key}`, sections: `pnl-section-{key}`, interpretation: `pnl-interp-{key}`, glossary links: `glossary-link-{key}`. (Source: architecture.md § data-testid Naming Convention)
- **Expenses are negative values.** The engine uses a sign convention where revenue is positive, all expenses are negative. The P&L tab should display absolute values for expense rows (using `Math.abs()` or handling sign in the formatting layer). (Source: 5-1-financial-engine-extension.md)
- **Shadcn components:** Use existing `<Tooltip>`, `<TooltipContent>`, `<TooltipTrigger>` from `@/components/ui/tooltip`. Use `lucide-react` icons (Pencil, ChevronDown, ChevronRight). (Source: architecture.md § Structure Patterns)
- **Reuse Story 5.2 infrastructure:** `useColumnManager` hook for drill-down state, `ColumnHeaders` component for column header rendering, `getAnnualValue`/`getQuarterlyValue`/`getMonthlyValue` helpers for cell value resolution. (Source: 5-2-financial-statements-container-summary-tab.md)
- **Component file size target:** ~150-300 lines for the P&L tab. The existing implementation is ~570 lines which is within acceptable range given the 8 sections and ~30 rows. (Source: ux-financial-statements-spec.md Part 10)

### UI/UX Deliverables

**Screens/Pages:**

- **P&L Tab** (`pnl-tab.tsx`) — The complete P&L statement view rendered within the `<TabsContent value="pnl">` of the Financial Statements container. Receives `EngineOutput` as a prop.

**Key UI Elements:**

- Sticky callout bar with 3 key metrics (Annual Revenue Y1, Pre-Tax Income Y1, Pre-Tax Margin %)
- 8 collapsible row sections with chevron expand/collapse toggles
- Data table with sticky row labels (leftmost column) and formatted financial values
- Input cell visual distinction: tinted background + dashed border + pencil icon on hover
- Computed cell tooltips with explanation + formula + glossary link
- Interpretation rows beneath key metric rows (Gross Profit, Pre-Tax Income, Labor Efficiency)
- Progressive disclosure columns (annual default, drill to quarterly/monthly)

**UI States:**

- **Section collapsed:** Only section header visible with ChevronRight icon
- **Section expanded:** All child rows visible with ChevronDown icon
- **Input cell hover:** Pencil icon becomes visible (using CSS `invisible` → `visible` on group hover)
- **Computed cell hover:** Tooltip appears with explanation, formula, and glossary link
- **Negative values:** Displayed in amber color (`text-amber-700 dark:text-amber-400`) for advisory visibility
- **Drill-down active:** Additional quarterly/monthly columns appear for the drilled-down year

### Anti-Patterns & Hard Constraints

- **DO NOT install new packages.** All dependencies are already present (Shadcn tooltips, lucide-react icons, column-manager).
- **DO NOT modify `components/ui/` files.** These are Shadcn-managed primitives.
- **DO NOT modify `vite.config.ts`, `server/vite.ts`, `drizzle.config.ts`, or `package.json` scripts.** (Source: development guidelines § Forbidden Changes)
- **DO NOT create new API endpoints.** This story is pure frontend — all data comes from the `EngineOutput` prop passed by `FinancialStatements`.
- **DO NOT make input cells actually editable in this story.** Input cell highlighting is visual-only. Actual inline editing is enabled in Story 5.6 (Quick Entry Integration). The pencil icon and tinted background indicate "this is an input" but clicking does not open an editor.
- **DO NOT implement benchmark-based interpretation text.** Story 5.8 (Guardian Bar & Dynamic Interpretation) wires brand benchmark comparisons into interpretation rows. For now, interpretations show percentage values only without "within/above/below typical range" language.
- **DO NOT use `display:table` CSS property.** HTML `<table>` elements are fine. (Source: development guidelines § Layout)
- **DO NOT apply custom hover/active styles to `<Button>` or `<Badge>`.** Built-in elevation handles this. (Source: development guidelines § Interactions)
- **DO NOT use emojis anywhere** in the UI. Use lucide-react icons instead. (Source: development guidelines § Emoji)
- **DO NOT create a separate data fetching layer.** The `EngineOutput` is already fetched and cached by the parent container. The P&L tab is a pure presentational component that receives data as props.
- **DO NOT render percentage fields by summing them across quarters.** Percentage values at quarterly/monthly drill-down should use the value from the monthly projection, NOT be summed. The existing `getQuarterlyValue` sums all fields — this is correct for currency but produces nonsensical results for percentage fields. Use monthly values directly for percentage display at sub-annual levels. (Source: 5-2-financial-statements-container-summary-tab.md § Gotchas)

### Gotchas & Integration Warnings

**Existing Implementation — CRITICAL:**

This story has an EXISTING implementation in `client/src/components/planning/statements/pnl-tab.tsx` (~570 lines). The file already contains:
- `PnlTab` component with callout bar, collapsible sections, data rendering
- `PnlSectionDef` and `PnlRowDef` interfaces with tooltip support
- `computeEnrichedAnnuals` function mapping monthly projections to enriched annual data
- 8 section definitions with ~30 row definitions
- `PnlSection` component with expand/collapse using `useState`
- `PnlRow` component with input vs computed visual distinction
- Tooltip rendering with structured `CellTooltip` (explanation + formula + glossary link)
- Interpretation rows with `aria-describedby` linkage
- Negative value highlighting in amber
- Integration with `useColumnManager` for progressive disclosure columns

The dev agent MUST read the existing file, compare against acceptance criteria, and fix/enhance rather than rewrite. Key areas that may need verification:
- Callout bar content matches AC1 (Annual Revenue Y1, Pre-Tax Income Y1, Pre-Tax Margin %)
- All 30+ rows are present per AC3 section structure
- P&L Analysis section defaults to collapsed (AC5)
- Tooltip glossary links are present and functional (AC12)
- All computed rows have tooltips defined (AC13)
- ARIA roles are correctly applied (AC14-15)

**EnrichedAnnual Data Mapping:**

The P&L tab uses `computeEnrichedAnnuals()` to extend `AnnualSummary` with additional fields not directly on the annual summary (e.g., `monthlyRevenue`, `cogsPct`, `materialsCogs`, `discretionaryMarketing`). These are computed from monthly projections. The enriched data is used for annual-level display. For quarterly/monthly drill-down, values come directly from `MonthlyProjection` via the `getMonthlyValue`/`getQuarterlyValue` helpers.

**Monthly Revenue Mapping:**

At the annual level, "Monthly Revenue" shows `revenue / 12` (average monthly). At the monthly level, it should show the actual `revenue` field from the monthly projection. The `getCellValue` function in the existing implementation handles this mapping based on column level.

**P&L Analysis Data Source:**

The P&L Analysis section (Adjusted Pre-Tax Profit, Target Pre-Tax Profit, Labor Efficiency, etc.) pulls from `EngineOutput.plAnalysis[]` (5-element array, one per year). These are NOT on `AnnualSummary` or `MonthlyProjection`. The `getCellValue` function must special-case P&L Analysis fields to read from the correct data source.

**Percentage Display at Sub-Annual Levels:**

When drilling down to quarterly or monthly view, percentage values (COGS %, Gross Margin %, EBITDA Margin %, etc.) should display the value for that specific period — NOT be summed across months. The `getQuarterlyValue` helper sums all fields by default, which is correct for currency but wrong for percentages. The P&L tab's `getCellValue` should handle this by using period-specific percentage values from monthly projections rather than aggregated sums.

**Discretionary Marketing = Marketing:**

In the current financial model, Discretionary Marketing is equivalent to Marketing (the same value). This is correct for MVP. The field exists as a separate row to support future differentiation between required brand marketing contributions and owner-directed discretionary marketing spend.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/components/planning/statements/pnl-tab.tsx` | MODIFY | Verify all 30+ rows present, collapsible sections work, tooltips have explanation + formula + glossary link, ARIA roles correct, interpretation rows linked via aria-describedby, callout bar matches AC1 |
| `client/src/components/planning/financial-statements.tsx` | VERIFY | Confirm P&L tab is rendered in `<TabsContent value="pnl">` with `<PnlTab output={output} />` — should already be wired from Story 5.2 |

### Testing Expectations

- **Primary testing method:** Playwright E2E via `run_test` tool.
- **Key scenarios to verify:**
  - Navigate to Reports > P&L tab
  - Callout bar shows Annual Revenue, Pre-Tax Income, Pre-Tax Margin %
  - All 8 sections are present with correct row counts
  - Sections expand/collapse when section header is clicked
  - P&L Analysis section starts collapsed
  - Input rows show tinted background and pencil icon on hover
  - Computed cells show tooltip on hover with explanation, formula, and glossary link
  - Interpretation rows appear below Gross Profit and Pre-Tax Income
  - Year column header click triggers drill-down to quarterly columns
  - Financial values are properly formatted (currency as $X,XXX, percentages as X.X%)
  - Negative values display in amber color
- **No unit tests needed** — pure UI presentation with no new business logic.

### Dependencies & Environment Variables

- **No new packages needed.** All dependencies are already installed.
- **No new environment variables.** This is a frontend-only story.
- **Dependencies on completed work:**
  - Story 5.1 (done) — engine extension providing `plAnalysis` in `EngineOutput`
  - Story 5.2 (done) — Financial Statements container, `useColumnManager`, `ColumnHeaders`, `getAnnualValue`/`getQuarterlyValue`/`getMonthlyValue`, `CalloutBar`, `StatementTable`, `StatementSection`
- **Stories that depend on THIS story:**
  - Story 5.4 (Balance Sheet & Cash Flow) — reuses same component patterns (section structure, row definitions, tooltip format, interpretation rows)
  - Story 5.6 (Quick Entry Integration) — adds actual inline editing to the input cells that this story visually marks
  - Story 5.8 (Guardian Bar & Interpretation) — enhances interpretation rows with brand benchmark comparisons
  - Story 5.10 (Glossary & Help) — provides the glossary page that tooltip "View in glossary" links navigate to

### References

- `_bmad-output/planning-artifacts/ux-financial-statements-spec.md` Part 5 (Dynamic Interpretation — tooltips, interpretations), Part 8.2 (P&L Statement row structure), Part 10 (Component Architecture)
- `_bmad-output/planning-artifacts/architecture.md` § Number Format Rules, § data-testid Naming Convention, § Communication Patterns
- `_bmad-output/planning-artifacts/epics.md` § Story 5.3 — acceptance criteria and dev notes
- `_bmad-output/implementation-artifacts/5-1-financial-engine-extension.md` — engine output structure, P&L Analysis fields
- `_bmad-output/implementation-artifacts/5-2-financial-statements-container-summary-tab.md` — container architecture, column manager, progressive disclosure infrastructure
- `shared/financial-engine.ts` — `EngineOutput`, `AnnualSummary`, `MonthlyProjection`, `PLAnalysisOutput` type definitions
- `client/src/components/planning/statements/pnl-tab.tsx` — existing implementation (~570 lines)
- `client/src/components/planning/statements/column-manager.tsx` — `useColumnManager`, `ColumnHeaders`, value resolver functions

## Dev Agent Record

### Agent Model Used
Claude 4.6 Opus (Replit Agent)

### Completion Notes
The existing implementation (~570 lines) was already comprehensive. Three targeted enhancements were made:
1. Made P&L callout bar sticky (AC1) — added `sticky top-0 z-30` class
2. Fixed total row double top border (AC8) — changed from `border-t-2` to `border-t-[3px] border-double`
3. Added P&L Analysis field handling for sub-annual drill-down — created `PL_ANALYSIS_FIELDS` Set to route these annual-only fields to `getAnnualValue` regardless of drill-down level, preventing zero-value display at quarterly/monthly granularity

All 17 acceptance criteria verified as met. No new packages, API endpoints, or UI component files added.

### File List
- `client/src/components/planning/statements/pnl-tab.tsx` — MODIFIED (sticky callout bar, double border for total rows, P&L Analysis field sub-annual handling)

### Testing Summary
E2E Playwright test passed all 21 steps: dev login, navigate to P&L tab, verify callout bar metrics, all 8 sections present, P&L Analysis collapsed by default, section expand/collapse toggle, interpretation rows with correct text, computed cell tooltip with explanation/formula/glossary link, Pre-Tax Income total row styling.
