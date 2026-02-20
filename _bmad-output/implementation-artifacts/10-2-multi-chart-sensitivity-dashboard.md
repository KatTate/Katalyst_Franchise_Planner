# Story 10.2: Multi-Chart Sensitivity Dashboard

Status: ready-for-dev

## Story

As a franchisee,
I want to see 6 simultaneous charts in the What-If Playground that all react to my slider adjustments,
so that I can understand the full impact of changing assumptions across every dimension of my business.

## Acceptance Criteria

### Chart Dashboard Layout

1. Given I am on the What-If Playground (the "scenarios" workspace view) with sensitivity sliders visible, when the chart dashboard renders below the sliders panel, then 6 chart cards are displayed in a responsive 2-column grid (2×3 on desktop ≥1024px, 1-column stack on mobile <768px). The chart area is labeled "Your Business — Three Scenarios" or similar contextual heading.

2. Given the What-If Playground has loaded and `ScenarioOutputs` (base, conservative, optimistic) are computed, when any slider value changes and new `ScenarioOutputs` are recomputed (debounced by Story 10.1), then all 6 charts update simultaneously — no chart may be stale relative to another.

### Chart 1 — Profitability (P&L Summary)

3. Given `ScenarioOutputs` are available, when Chart 1 renders, then it shows a 5-year line/area chart (one set of lines per scenario) for all five P&L metrics from `annualSummaries`: **Annual Revenue** (`revenue`, primary area), **COGS** (`totalCogs`), **Gross Profit** (`grossProfit`), **EBITDA** (`ebitda`), and **Pre-Tax Income** (`preTaxIncome`) — all rendered as overlaid lines. The chart X-axis shows Year 1 through Year 5; Y-axis shows dollar amounts. The three scenario curves use the application's CSS chart color tokens: Base Case uses `hsl(var(--chart-1))` as a solid line, Conservative uses `hsl(var(--chart-5))` as a dashed line, Optimistic uses `hsl(var(--chart-2))` as a lighter dashed line.
   - Source: `_bmad-output/planning-artifacts/epics.md` line 2137; `ux-design-specification-consolidated.md` Journey 4 line 1099

4. Given Chart 1 renders, when I hover over any data point, then a tooltip displays the year, scenario name, and all five series values — Revenue, COGS, Gross Profit, EBITDA, and Pre-Tax Income — each formatted as a dollar value (e.g., "$142,000").

### Chart 2 — Cash Flow

5. Given `ScenarioOutputs` are available, when Chart 2 renders, then it shows a 5-year line chart with three scenario curves representing **Net Operating Cash Flow** (`annualSummaries[].operatingCashFlow`) and **Ending Cash Balance** (`annualSummaries[].endingCash`). The X-axis shows Year 1 through Year 5.

6. Given Chart 2 renders, when any scenario's `endingCash` value for any year is negative (< 0), then an amber advisory zone (`hsl(var(--chart-5))` at 15% opacity as a background band, or a `ReferenceLine y={0}` with amber fill below) highlights the cash-negative region. This advisory coloring follows the UX spec's amber advisory language — it is not a red error state.

### Chart 3 — Break-Even Analysis

7. Given `ScenarioOutputs` are available, when Chart 3 renders, then it shows the months-to-break-even for each scenario as a horizontal bar chart (or annotated timeline visualization). Each scenario bar shows:
   - **Base Case**: `roiMetrics.breakEvenMonth` from `ScenarioOutputs.base`
   - **Conservative**: `roiMetrics.breakEvenMonth` from `ScenarioOutputs.conservative`
   - **Optimistic**: `roiMetrics.breakEvenMonth` from `ScenarioOutputs.optimistic`

   If `roiMetrics.breakEvenMonth` is `null` for a scenario (break-even not reached in 60 months), the bar displays "No break-even in 5 years" with a muted style.

8. Given Chart 3 renders, when I view the chart, then each bar is labeled with its scenario name and the break-even month value (e.g., "Base: Month 14", "Conservative: Month 22", "Optimistic: Month 9"). The bars use the scenario color conventions (chart-1/chart-5/chart-2).

### Chart 4 — ROI & Returns

9. Given `ScenarioOutputs` are available, when Chart 4 renders, then it shows a 5-year cumulative ROIC line chart. The Y-axis shows ROIC percentage; the X-axis shows Year 1 through Year 5. Three scenario curves display `roicExtended[].roicPct` for years 1-5 using the standard scenario color tokens (chart-1/chart-5/chart-2 with solid/dashed/lighter-dashed strokes).

10. Given Chart 4 renders, then a plain-language callout card appears below or beside the chart summarizing the conservative case, e.g.: "Even in the conservative scenario, your 5-year cumulative return is X%." The specific phrasing is: "Conservative case: [X]% ROIC at Year 5." Do NOT say "Even in the conservative scenario..." (per UX spec advisory language constraint) — use "Conservative case: [X]% ROIC at Year 5."

### Chart 5 — Balance Sheet Health

11. Given `ScenarioOutputs` are available, when Chart 5 renders, then it shows a 5-year dual-line chart for **Total Assets** (`annualSummaries[].totalAssets`) vs **Total Liabilities** (`annualSummaries[].totalLiabilities`) for all three scenarios. The growing gap between assets and liabilities lines represents equity growth. Each scenario's asset line uses the chart color token, with liabilities as a lighter/muted variant. The X-axis shows Year 1 through Year 5; the Y-axis shows dollar amounts.

### Chart 6 — Debt & Working Capital

12. Given `ScenarioOutputs` are available, when Chart 6 renders, then it shows a 5-year chart with two data series:
    - **Outstanding Debt**: `annualSummaries[].totalLiabilities` as a declining line (or use year-end `monthlyProjections[(year*12)-1].loanClosingBalance` for the loan paydown trajectory)
    - **Working Capital**: computed as `totalCurrentAssets - totalCurrentLiabilities` from `monthlyProjections[(year*12)-1]` (year-end month for each year 1-5)

    Three scenario curves are displayed for each series using the standard chart color conventions. The X-axis shows Year 1 through Year 5.

### Key Metric Delta Cards

13. Given `ScenarioOutputs` are available, when the metric delta card strip renders (above or between charts), then 4 key metric cards are displayed showing the impact of current slider adjustments vs. the base case:
    - **Break-Even**: "Mo 14 → Mo 18 (+4 mo)" — shows base case month vs. conservative case month
    - **Year 1 Revenue**: "$142K → $121K (-$21K)" — base vs conservative
    - **5-Year ROI**: "127% → 98% (-29%)" — base vs conservative `fiveYearROIPct` from `roiMetrics`
    - **Year 5 Cash**: "$68K → $32K (-$36K)" — base vs conservative `endingCash` at Year 5

    Delta values are formatted with a `+` or `-` prefix and displayed with muted/colored text (negative deltas in amber, positive in green).

14. Given the metric delta cards render and no slider has been adjusted (all adjustments at 0%, i.e., base case = conservative = optimistic), then delta indicators show "0" or are hidden, and a contextual note reads: "Adjust sliders above to see impact on your business."

### data-testid Coverage

15. Given the chart dashboard renders, then it includes:
    - `data-testid="what-if-charts-container"` on the outer chart grid container
    - `data-testid="chart-profitability"` on Chart 1 card
    - `data-testid="chart-cash-flow"` on Chart 2 card
    - `data-testid="chart-break-even"` on Chart 3 card
    - `data-testid="chart-roi-returns"` on Chart 4 card
    - `data-testid="chart-balance-sheet"` on Chart 5 card
    - `data-testid="chart-debt-working-capital"` on Chart 6 card
    - `data-testid="metric-card-break-even"` on the Break-Even metric delta card
    - `data-testid="metric-card-revenue"` on the Revenue delta card
    - `data-testid="metric-card-roi"` on the ROI delta card
    - `data-testid="metric-card-cash"` on the Cash delta card
    - `data-testid="roi-callout"` on the Chart 4 plain-language callout card

## Dev Notes

### Architecture Patterns to Follow

- **Epic 10 is the sole scenario analysis surface (SCP-2026-02-20 D5/D6):** The column-splitting scenario comparison was retired from Reports. Epic 10 (What-If Playground) is now the **canonical and only** home for scenario analysis in the product. The dev agent is building the definitive feature, not a parallel one. `ScenarioBar`, `ComparisonTableHead`, and `ScenarioSummaryCard` remain in the codebase as dead code pending cleanup — do not integrate them.
  - Source: `_bmad-output/planning-artifacts/prd.md` (SCP-2026-02-20 entry), `_bmad-output/planning-artifacts/architecture.md` lines 727–728

- **Workspace view integration:** The What-If Playground lives at `workspaceView === "scenarios"` in `WorkspaceViewContext`. Story 10.1 replaces the placeholder `<div data-testid="placeholder-scenarios">` in `planning-workspace.tsx` `case "scenarios"` with a `<WhatIfPlayground>` component. Story 10.2 adds a `<SensitivityCharts>` component INSIDE `what-if-playground.tsx` — it does NOT modify `planning-workspace.tsx` independently.
  - Source: `client/src/pages/planning-workspace.tsx` lines 127–142 (placeholder), `client/src/contexts/WorkspaceViewContext.tsx` line 4 (`WorkspaceView` type)

- **Scenario computation (ALREADY EXISTS — DO NOT REIMPLEMENT):** `computeScenarioOutputs()` in `client/src/lib/scenario-engine.ts` accepts `(planInputs: PlanFinancialInputs, startupCosts: StartupCostLineItem[])` and returns `ScenarioOutputs { base, conservative, optimistic }` — each being a full `EngineOutput`. Story 10.1 calls this function and passes the results down. Story 10.2 receives `ScenarioOutputs` as a prop.
  - Source: `client/src/lib/scenario-engine.ts` → `computeScenarioOutputs()`, `ScenarioOutputs`, `ScenarioId`

- **Chart rendering pattern (FOLLOW dashboard-charts.tsx):** Use `recharts` components (`LineChart`, `AreaChart`, `BarChart`) wrapped with `ChartContainer` from `@/components/ui/chart`. `ChartContainer` handles responsive sizing; always pass a `ChartConfig` object. Use `ChartTooltip` + `ChartTooltipContent` for tooltips. All chart implementations in this project follow this pattern.
  - Source: `client/src/components/planning/dashboard-charts.tsx` → `BreakEvenChart`, `RevenueExpensesChart` (both show the exact pattern to follow)

- **Chart color tokens (CSS variables — use these, do not hardcode hex):**
  - Base Case (solid line): `hsl(var(--chart-1))` — Katalyst green
  - Conservative (dashed line, `strokeDasharray="5 3"`): `hsl(var(--chart-5))` — amber
  - Optimistic (lighter dashed, `strokeDasharray="2 4"`): `hsl(var(--chart-2))` — blue/cyan
  - Amber advisory zone (cash-negative): `hsl(var(--chart-5))` at 15% opacity as reference area or gradient
  - Source: `client/src/index.css` lines 48–52 (light) and 139–143 (dark)

- **Currency values are stored in CENTS:** All `EngineOutput` numeric values (revenue, cash, assets, liabilities) are in cents. Divide by 100 before displaying in charts. Use `$${(v / 1000).toFixed(0)}K` for Y-axis tick labels (see `dashboard-charts.tsx` line 70 for the pattern). Full tooltip values: `$${num.toLocaleString("en-US", { maximumFractionDigits: 0 })}`.
  - Source: `shared/financial-engine.ts`, `client/src/components/planning/dashboard-charts.tsx` lines 70, 79

- **Data memoization:** Chart data transforms (mapping `annualSummaries` or `monthlyProjections` to chart data arrays) MUST be wrapped in `useMemo`. Each of the 6 charts should memoize its data transform independently, keyed on the `ScenarioOutputs` prop. This prevents unnecessary recalculations on unrelated re-renders.
  - Source: `_bmad-output/planning-artifacts/epics.md` Story 10.2 Dev Notes

- **EngineOutput data fields for each chart:**
  - Chart 1 (Profitability): `output.annualSummaries[y].revenue`, `.totalCogs`, `.grossProfit`, `.ebitda`, `.preTaxIncome` — 5 values per series (years 1–5); all are in cents
  - Chart 2 (Cash Flow): `output.annualSummaries[y].operatingCashFlow`, `.endingCash` — 5 values
  - Chart 3 (Break-Even): `output.roiMetrics.breakEvenMonth` — single number per scenario
  - Chart 4 (ROI): `output.roicExtended[y].roicPct` — 5 values (year 1-5)
  - Chart 5 (Balance Sheet): `output.annualSummaries[y].totalAssets`, `.totalLiabilities` — 5 values
  - Chart 6 (Debt & Working Capital): Year-end values from `output.monthlyProjections[(y*12)-1].loanClosingBalance` for debt; `.totalCurrentAssets - .totalCurrentLiabilities` for working capital
  - Source: `shared/financial-engine.ts` → `EngineOutput`, `AnnualSummary`, `MonthlyProjection`, `ROIMetrics`, `ROICExtendedOutput`

- **Naming conventions (architecture.md):** Components: PascalCase. Files: kebab-case. data-testid: `{type}-{content}` for display elements, `{action}-{target}` for interactive. Hooks: `use` prefix + camelCase.
  - Source: `_bmad-output/planning-artifacts/architecture.md` → Naming Patterns

- **Plan data access:** The `WhatIfPlayground` component (created in 10.1) receives `planId`, `financialInputs: PlanFinancialInputs`, and `startupCosts: StartupCostLineItem[]` from `planning-workspace.tsx`. These are passed through to `computeScenarioOutputs()`. Story 10.2's `SensitivityCharts` component receives the computed `ScenarioOutputs` as a prop — it does NOT access plan data directly.
  - Source: `client/src/pages/planning-workspace.tsx` lines 110–111 (data shape)

### UI/UX Deliverables

**Chart Dashboard (below slider panel in What-If Playground):**
- Heading: e.g., "Business Impact — Three Scenarios" (contextual label, not prescriptive)
- 2×3 grid of `Card` components on desktop (≥1024px); single-column stack on mobile
- Each card: `CardHeader` with chart title (e.g., "Profitability"), `CardContent` with `ChartContainer` at `h-[200px]` or `h-[220px]`
- Chart legend: inline or below chart — scenario labels: "Base Case" / "Conservative" / "Optimistic" with color dots matching line colors

**Metric Delta Card Strip (above or between chart grid):**
- 4 metric delta cards in a horizontal row (or 2×2 grid on mobile)
- Each card shows: metric name, base case value, arrow, conservative case value, delta in parentheses
- Positive deltas (optimistic better than base) use green text; negative deltas use amber text
- When sliders are all at zero: show neutral state with helper text

**Responsive behavior:**
- Desktop (≥1024px): 2-column chart grid, 4-column metric strip
- Tablet (768–1023px): 2-column chart grid, 2×2 metric grid
- Mobile (<768px): 1-column chart stack, 2×2 metric grid

**Visual style:**
- Charts use `Card` component with `CardHeader` + `CardTitle` at `text-sm font-medium text-muted-foreground`
- Chart card height: charts at `h-[200px]` or `h-[220px]` within `ChartContainer`
- Amber advisory zone on Chart 2: subtle background band below zero, NOT destructive red
- All styling follows existing `dashboard-charts.tsx` card patterns

**Loading state:**
- If `ScenarioOutputs` is `null` or still computing, chart cards show skeleton placeholders at the same height as the charts (`Skeleton className="h-[220px] w-full"`)

### Anti-Patterns & Hard Constraints

- **DO NOT call `computeScenarioOutputs()` inside `SensitivityCharts`.** Scenario computation belongs in `WhatIfPlayground` (10.1's domain). `SensitivityCharts` is a pure presentational component — it receives `ScenarioOutputs` as a prop and renders charts. Calling the engine inside a chart component would re-compute on every render.
  - Source: `client/src/lib/scenario-engine.ts` — `computeScenarioOutputs` is called once in WhatIfPlayground, not per-chart

- **DO NOT use red/destructive colors for the cash-negative advisory zone on Chart 2.** The cash-negative zone uses amber advisory coloring (`hsl(var(--chart-5))` at 15% opacity). Red is reserved for actual system errors. This is an advisory/warning, not a failure state.
  - Source: UX spec Part 12 (Guardian advisory language), `client/src/index.css` (guardian tokens)

- **DO NOT import or use `ScenarioBar` or `ScenarioSummaryCard` from Epic 5 statements.** Those components are officially marked `[DEAD CODE]` in `architecture.md` per SCP-2026-02-20 D5/D6 — they are the retired column-splitting comparison UI from Reports. The What-If Playground uses a fresh chart-based approach. Importing dead code would bring in column-switching logic that has no place here and is pending removal.
  - Source: `_bmad-output/planning-artifacts/architecture.md` lines 1577–1580 (`scenario-bar.tsx`, `scenario-summary-card.tsx`, `comparison-table-head.tsx` all tagged `[DEAD CODE — retired per SCP-2026-02-20 D5/D6]`)

- **DO NOT hardcode hex color values for scenario lines.** Use CSS variables: `hsl(var(--chart-1))`, `hsl(var(--chart-2))`, `hsl(var(--chart-5))`. This ensures dark mode works correctly.
  - Source: `client/src/index.css` lines 48–52 (light mode chart vars), 139–143 (dark mode chart vars)

- **DO NOT add new API endpoints or server-side calls.** All scenario computation is client-side (`calculateProjections` imported from `shared/financial-engine.ts`). Chart data is derived from `ScenarioOutputs` in-memory. No server fetching for charts.
  - Source: Architecture Decision 8; `client/src/lib/scenario-engine.ts` imports `calculateProjections` directly

- **DO NOT modify `vite.config.ts`, `server/vite.ts`, `package.json`, or `drizzle.config.ts`.** These are protected project files.

- **DO NOT skip memoization for chart data transforms.** Without `useMemo`, slider input events will trigger expensive array transforms on every keystroke. Each chart's data transform MUST be in `useMemo`.

- **DO NOT add a Tasks/Subtasks section to this story file.** The dev agent plans its own implementation.

### Gotchas & Integration Warnings

- **Story 10.1 must complete before 10.2 can begin.** Story 10.2's `SensitivityCharts` component is rendered inside `WhatIfPlayground` created in Story 10.1. The interface contract: `WhatIfPlayground` computes `ScenarioOutputs` (from `computeScenarioOutputs`) and passes them to `SensitivityCharts` as a prop. If 10.1 is not done, there is no host component for 10.2's charts.

- **`roicExtended` array has 5 entries (index 0-4 for years 1-5).** When mapping to chart data, use `output.roicExtended[i]` where `i` is 0-4, not `roiMetrics` (which has break-even data). `roicExtended[i].roicPct` is the ROIC percentage for year `i+1`. This is already a percentage (not cents), so do NOT divide by 100.
  - Source: `shared/financial-engine.ts` lines 302–315 (`ROICExtendedOutput` interface), line 754 (computation)

- **`roiMetrics.breakEvenMonth` can be `null` if break-even is not reached in 60 months.** Always handle the null case in Chart 3. Display "No break-even in 5 years" rather than crashing on `null.toString()`.
  - Source: `shared/financial-engine.ts` line 271 (`breakEvenMonth: number | null`)

- **Year-end monthly projections for Chart 6:** `monthlyProjections` has 60 entries (months 1-60). Year-end months are indices 11, 23, 35, 47, 59 (i.e., month 12, 24, 36, 48, 60). Use `output.monthlyProjections[11]` for Year 1 end, `output.monthlyProjections[23]` for Year 2 end, etc. Always check the array length before indexing.
  - Source: `shared/financial-engine.ts` line 157 (`MonthlyProjection.month: 1-60`)

- **Working Capital formula:** Working capital = `totalCurrentAssets - totalCurrentLiabilities`. Both fields exist on `MonthlyProjection` (lines 213, 215). The result can be negative (current liabilities exceed current assets) — this is a valid data state, not an error.
  - Source: `shared/financial-engine.ts` lines 213–215

- **Slider state in 10.1 modifies `PlanFinancialInputs` before passing to `computeScenarioOutputs`.** Story 10.2 does not need to know about slider percentage values — it only consumes the resulting `ScenarioOutputs`. The delta cards (AC 13) show "base vs conservative" differences, which are always derived from the current `ScenarioOutputs.base` vs `ScenarioOutputs.conservative` outputs.

- **`annualSummaries` has exactly 5 entries (index 0-4).** Do not assume more or fewer. Map over all 5 for year labels "Year 1" through "Year 5".

- **`ChartContainer` requires both a `config: ChartConfig` prop and a `className`.** Always pass `className="h-[220px] w-full"` or similar. Without a height class, the chart will collapse to 0px. Confirmed from `dashboard-charts.tsx` pattern (line 49).
  - Source: `client/src/components/planning/dashboard-charts.tsx` line 49

- **Conservative case for metric delta cards is ALWAYS computed with the fixed scenario factors** (`CONSERVATIVE_REVENUE_FACTOR = -0.15`, `CONSERVATIVE_COGS_PP = 0.02`, `CONSERVATIVE_OPEX_FACTOR = 0.10` from `scenario-engine.ts`). These are NOT user-adjustable in Story 10.1 — the sliders in 10.1 adjust a **sandbox** (preview) scenario, not the Conservative/Optimistic definitions. Clarify with Story 10.1 author if the `ScenarioOutputs` interface uses slider-modified inputs for all three scenarios, or only for the sandbox.

  **Note:** This is a potential design ambiguity that the dev agent should verify: Does Story 10.1's slider state modify the Base/Conservative/Optimistic factors (the slider percentages replace the static factors), or does it create a 4th scenario? Per the epics spec, sliders modify the Base Case inputs and Conservative/Optimistic are computed from the modified base. The `scenario-engine.ts` static factors may need to be replaced by user-controlled slider values. The dev agent implementing 10.1 should document how `ScenarioOutputs` is computed from slider state so 10.2 can consume it correctly.

- **`LineChart` vs `ComposedChart`:** For Chart 5 (Balance Sheet) showing both Assets and Liabilities as lines, use `LineChart` with two `<Line>` data keys, or `ComposedChart` with `<Line>` for both. Both work with `ChartContainer`. `LineChart` is simpler for this use case.

- **Dark mode:** All chart colors use CSS variables which have dark-mode overrides in `index.css` (lines 139–143). No explicit dark mode handling needed in chart code — `ChartContainer` wraps in the CSS scope.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/components/planning/what-if/sensitivity-charts.tsx` | CREATE | `<SensitivityCharts>` component. Props: `{ scenarios: ScenarioOutputs }`. Contains all 6 chart implementations and the metric delta card strip. Approximately 350-450 lines. |
| `client/src/components/planning/what-if/what-if-playground.tsx` | MODIFY | Add `<SensitivityCharts scenarios={scenarioOutputs} />` below the slider controls panel. Created in Story 10.1. |

**Note on directory:** The `client/src/components/planning/what-if/` directory is created in Story 10.1. If 10.1 places `WhatIfPlayground` at a different path, adjust accordingly.

### Testing Expectations

- **Playwright e2e (primary test framework):** No unit test framework is established for frontend components in this project. Testing is via Playwright.
- **Critical ACs for e2e coverage:**
  - AC 1: Navigate to Scenarios view → verify `data-testid="what-if-charts-container"` is visible
  - AC 2: Trigger slider change → verify all 6 chart `data-testid` containers update (check for re-render or data change)
  - AC 3/5/7/9/11/12: Each chart card renders with its `data-testid`
  - AC 6: Verify amber advisory zone appears for Chart 2 when a scenario has negative ending cash
  - AC 13: Verify 4 metric delta cards render with `data-testid="metric-card-*"`
  - AC 14: Verify neutral state message when sliders are at zero
  - AC 15: Verify all `data-testid` attributes are present

### Dependencies & Environment Variables

- **No new packages required.** `recharts` and `@/components/ui/chart` (`ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartConfig`) are already installed via shadcn/ui. Confirmed by `architecture.md` ("Recharts 2.15 for charting/visualization") and existing `dashboard-charts.tsx`.
- **No new environment variables required.** All data is client-side from `ScenarioOutputs`.
- **Story 10.1 prerequisite:** `what-if-playground.tsx` must exist with:
  - Slider state management
  - `computeScenarioOutputs()` called with plan inputs
  - A mounting point for `<SensitivityCharts>` below sliders
  - `ScenarioOutputs` result available as local state

### References

- `_bmad-output/planning-artifacts/epics.md` → Epic 10, Story 10.2 (lines 2126–2150) — user story, acceptance criteria, dev notes
- `_bmad-output/planning-artifacts/epics.md` → Epic 10, Story 10.1 (lines 2095–2125) — prerequisite story context
- `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` → Part 12 (Guardian Bar + Dynamic Interpretation) — advisory color language ("Guardian speaks in amber, not red"); amber is a caution, not an error state
- `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` → Part 5 Color Palette — advisory color tokens (amber = caution, red = destructive error)
- ~~Part 11 (Scenario Comparison)~~ **RETIRED (SCP-2026-02-20 D5/D6)** — no longer design authority; do not reference
- `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` → Journey 4 (lines 1086–1108) — Chris's What-If Playground experience (target UX)
- `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` → Part 5 Color Palette (lines 327–331) — advisory color language
- `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` → Part 7 Charting (lines 440–447) — Recharts, chart type guidance, scenario overlay
- `_bmad-output/planning-artifacts/architecture.md` → Financial Engine Architecture (lines 872–1055) — `EngineOutput`, `AnnualSummary`, `MonthlyProjection`, `ROICExtendedOutput` interfaces
- `_bmad-output/planning-artifacts/architecture.md` → Naming Patterns (lines 1133–1136)
- `_bmad-output/planning-artifacts/architecture.md` → Decision 8 (State Management — client-side computation pattern)
- `client/src/lib/scenario-engine.ts` → `computeScenarioOutputs()`, `ScenarioOutputs`, `SCENARIO_LABELS`, `CONSERVATIVE_*` / `OPTIMISTIC_*` constants
- `client/src/components/planning/dashboard-charts.tsx` → `BreakEvenChart`, `RevenueExpensesChart` (Recharts + ChartContainer pattern)
- `shared/financial-engine.ts` → `EngineOutput`, `AnnualSummary` (line 243), `MonthlyProjection` (line 157), `ROIMetrics` (line 269), `ROICExtendedOutput` (line 302)
- `client/src/index.css` → lines 48–52 (chart-1 through chart-5 light mode), lines 139–143 (dark mode)
- `client/src/contexts/WorkspaceViewContext.tsx` → `WorkspaceView`, `navigateToScenarios()`
- `client/src/pages/planning-workspace.tsx` → `case "scenarios"` placeholder (lines 127–142)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Completion Notes

### File List

### Testing Summary
