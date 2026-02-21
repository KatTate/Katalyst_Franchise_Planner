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

5. Given `ScenarioOutputs` are available, when Chart 2 renders, then it shows a 5-year line chart with three scenario curves for each of the following three series from `annualSummaries`: **Net Operating Cash Flow** (`operatingCashFlow`), **Net Cash Flow** (`netCashFlow`), and **Ending Cash Balance** (`endingCash`). The X-axis shows Year 1 through Year 5.
   - Source: `_bmad-output/planning-artifacts/epics.md` line 2138

6. Given Chart 2 renders, when any scenario has at least one month where `monthlyProjections[m].endingCash < 0` (m = 0–59, checked across all 60 months — not just year-end values), then an amber advisory zone (`hsl(var(--chart-5))` at 15% opacity as a background band, or a `ReferenceLine y={0}` with amber fill below) highlights the cash-negative region. A scenario that dips negative mid-year but recovers by year-end must still trigger the advisory zone — checking `annualSummaries[].endingCash` alone is insufficient. This advisory coloring follows the UX spec's amber advisory language — it is not a red error state.
   - Source: `_bmad-output/planning-artifacts/epics.md` line 2138 ("Months where any scenario goes cash-negative")

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
    - **Outstanding Debt**: year-end `monthlyProjections[(year*12)-1].loanClosingBalance` (indices 11, 23, 35, 47, 59 for years 1–5). Do NOT use `annualSummaries[].totalLiabilities` — that value includes operating liabilities (accounts payable, tax payable) in addition to the loan balance (`totalLiabilities = loanBalance + accountsPayable + taxPayable + lineOfCredit` per `financial-engine.ts` line 572), making it unsuitable as a debt-paydown series.
    - **Working Capital**: computed as `totalCurrentAssets - totalCurrentLiabilities` from `monthlyProjections[(year*12)-1]` (year-end month for each year 1-5)

    Three scenario curves are displayed for each series using the standard chart color conventions. The X-axis shows Year 1 through Year 5.

### Key Metric Delta Cards

13. Given `ScenarioOutputs` are available, when the metric delta card strip renders (above or between charts), then 4 key metric cards are displayed showing the impact of current slider adjustments vs. the base case:
    - **Break-Even**: "Mo 14 → Mo 18 (+4 mo)" — shows base case month vs. conservative case month. If either scenario's `breakEvenMonth` is `null` (break-even not reached in 60 months), display "—" for that value and "N/A" for the delta (e.g., "Mo 14 → —" or "— → —").
    - **Year 1 Revenue**: "$142K → $121K (-$21K)" — base vs conservative
    - **5-Year ROI**: "127% → 98% (-29%)" — base vs conservative `fiveYearROIPct` from `roiMetrics` (multiply by 100 to display as percentage)
    - **Year 5 Cash**: "$68K → $32K (-$36K)" — base vs conservative `endingCash` at Year 5 (`annualSummaries[4].endingCash`)

    Delta color rules — color by **desirability**, not raw sign:
    - **Revenue, ROI, Cash** (higher = better): positive delta → green; negative delta → amber
    - **Break-Even** (lower month = better, so a positive delta means worse): positive delta → amber; negative delta → green
    - Null Break-Even deltas ("N/A") are rendered in muted/neutral color — not amber or green

14. Given the metric delta cards render on initial page load (before the user has interacted with any slider), then a contextual note reads: "Adjust sliders above to see impact on your business." The delta cards still display their non-zero base vs. conservative values — Conservative is always computed from the negative slider extremes (per epics Story 10.1 line 2116) and will never equal Base Case even before slider interaction. The note is an encouragement to engage, not a condition that suppresses deltas.
    - Source: `_bmad-output/planning-artifacts/epics.md` Story 10.1 line 2116 ("Conservative (negative slider extremes)")

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
So that I can understand the full impact of changing assumptions across every dimension of my business.

## Acceptance Criteria

**AC-1: Six charts render below the sensitivity controls**
**Given** I am on the What-If Playground with sensitivity sliders (Story 10-1)
**When** the page loads with plan data
**Then** six chart cards are displayed below the Sensitivity Controls panel and key metric cards, arranged in a responsive 2-column grid on viewports ≥ 1024 px (stacked single-column below)

**AC-2: Charts react to slider adjustments**
**Given** I am viewing the What-If Playground
**When** I adjust any slider
**Then** all 6 charts update simultaneously showing three scenario curves per chart:
  - **Current** (solid line) — reflects the plan with my current slider positions applied
  - **Conservative** (dashed line) — reflects the plan with all sliders at their negative extremes
  - **Optimistic** (light dashed line) — reflects the plan with all sliders at their positive extremes
**And** the charts animate smoothly on data change (≤ 300ms transition)

**AC-3: Profitability (P&L Summary) chart**
**Given** the charts are visible
**Then** Chart 1 displays a 5-year line/area chart showing Annual Revenue, COGS, Gross Profit, EBITDA, and Pre-Tax Income for each scenario
**And** the X-axis shows Year 1 through Year 5
**And** the Y-axis shows dollar amounts formatted as `$XXK` or `$X.XM`

**AC-4: Cash Flow chart**
**Given** the charts are visible
**Then** Chart 2 displays a line chart showing Ending Cash Balance over 60 months (monthly granularity from `monthlyProjections`) for each scenario
**And** months where any scenario's ending cash balance goes negative are highlighted with an amber advisory zone (not error-red)
**And** monthly granularity is required so amber zones can identify specific months, not just years

**AC-5: Break-Even Analysis chart**
**Given** the charts are visible
**Then** Chart 3 displays a visual showing months to break-even for each of the 3 scenarios
**And** if break-even is null for any scenario, the chart shows "60+ mo" or an indicator that break-even was not reached within 60 months

**AC-6: ROI & Returns chart**
**Given** the charts are visible
**Then** Chart 4 displays a 5-year ROIC chart with three scenario curves
**And** a callout card is displayed with a plain-language interpretation (e.g., "Your conservative case still shows positive ROI by month 18")

**AC-7: Balance Sheet Health chart**
**Given** the charts are visible
**Then** Chart 5 displays Total Assets vs Total Liabilities over 5 years for each scenario
**And** the equity growth is visible as the gap between the asset and liability lines

**AC-8: Debt & Working Capital chart**
**Given** the charts are visible
**Then** Chart 6 displays the outstanding debt paydown trajectory and working capital position over 5 years for each scenario

**AC-9: Key metric cards show delta indicators**
**Given** I have adjusted sliders away from their default (0%) positions
**When** the Current scenario differs from the saved plan
**Then** all 5 key metric cards (Break-Even Month, 5-Year ROI %, Year-1 Revenue, Year-1 EBITDA, Year-1 Pre-Tax Income) display delta indicators showing the impact of slider changes vs. the base saved plan (e.g., "Break-Even: 14 mo → 18 mo (+4 mo)")

**AC-10: Chart color tokens and advisory colors**
**Given** the charts are rendered
**Then** charts use the application's CSS chart color tokens (`--chart-1` through `--chart-5`) for distinct data series within each chart
**And** scenario curves use consistent colors: green-family for Current/Base, orange-family for Conservative, blue-family for Optimistic (matching the existing `SCENARIO_COLORS` from `scenario-engine.ts`)
**And** advisory zones (cash-negative) use amber advisory color (never error-red), consistent with the Guardian Bar visual language (FR88–FR89)

**AC-11: Sandbox invariant preserved**
**Given** I interact with the charts and sliders
**Then** no `PATCH /api/plans/:planId` request is sent — all computation is client-side sandbox-only

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
  - Chart 2 (Cash Flow): `output.annualSummaries[y].operatingCashFlow`, `.netCashFlow`, `.endingCash` — 5 values per series (years 1–5); all are in cents
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
- Delta coloring is desirability-based (per AC 13), not raw-sign-based:
  - Revenue, ROI, Cash (higher = better): positive delta → green; negative delta → amber
  - Break-Even (lower month = better): positive delta → amber; negative delta → green
  - Null Break-Even deltas ("N/A") → muted/neutral
- On initial page load (before user slider interaction): show helper text "Adjust sliders above to see impact on your business" alongside the delta cards (per AC 14)

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

- **`roicExtended` array has 5 entries (index 0-4 for years 1-5).** When mapping to chart data, use `output.roicExtended[i]` where `i` is 0-4, not `roiMetrics` (which has break-even data). `roicExtended[i].roicPct` is the ROIC as a **decimal fraction** (e.g., `0.127` = 12.7%) — it is computed as `afterTaxNetIncome / totalInvestedCapital` (engine line 771). **Multiply by 100** to display as a percentage: `(roicPct * 100).toFixed(1) + "%"`. Do NOT treat this as cents (no `/100`). The correct pattern is confirmed by `callout-bar.tsx` line 105 (`roic5yr.roicPct * 100`) and `roic-tab.tsx` line 212 (`roicPct * 100`). The same decimal-fraction convention applies to `roiMetrics.fiveYearROIPct` used in the AC 13 delta cards.
  - Source: `shared/financial-engine.ts` lines 302–315 (`ROICExtendedOutput` interface), line 771 (computation); `client/src/components/planning/statements/callout-bar.tsx` line 105; `client/src/components/planning/statements/roic-tab.tsx` line 212

- **`roiMetrics.breakEvenMonth` can be `null` if break-even is not reached in 60 months.** Always handle the null case in Chart 3. Display "No break-even in 5 years" rather than crashing on `null.toString()`.
  - Source: `shared/financial-engine.ts` line 271 (`breakEvenMonth: number | null`)

- **Year-end monthly projections for Chart 6:** `monthlyProjections` has 60 entries (months 1-60). Year-end months are indices 11, 23, 35, 47, 59 (i.e., month 12, 24, 36, 48, 60). Use `output.monthlyProjections[11]` for Year 1 end, `output.monthlyProjections[23]` for Year 2 end, etc. Always check the array length before indexing.
  - Source: `shared/financial-engine.ts` line 157 (`MonthlyProjection.month: 1-60`)

- **Working Capital formula:** Working capital = `totalCurrentAssets - totalCurrentLiabilities`. Both fields exist on `MonthlyProjection` (lines 213, 215). The result can be negative (current liabilities exceed current assets) — this is a valid data state, not an error.
  - Source: `shared/financial-engine.ts` lines 213–215

- **Story 10.1 passes the UNMODIFIED saved plan inputs to `computeScenarioOutputs` — do NOT apply slider state to `PlanFinancialInputs` before calling it.** The `Base` scenario always reflects the user's saved plan as-is (epics 10.1 lines 2115, 2123). Slider percentage values influence the Conservative/Optimistic scenario factors applied *internally* within `computeScenarioOutputs` (or a Story 10.1 wrapper that replaces the static `CONSERVATIVE_*` / `OPTIMISTIC_*` constants with slider-derived values). Story 10.2 only consumes the resulting `ScenarioOutputs` prop — it does not touch slider state or plan inputs.
  - Source: `_bmad-output/planning-artifacts/epics.md` Story 10.1 line 2115 ("slider adjustments do NOT modify the user's actual plan"), line 2123 ("Base case always reflects the user's actual saved plan inputs — not slider-modified values")

- **`annualSummaries` has exactly 5 entries (index 0-4).** Do not assume more or fewer. Map over all 5 for year labels "Year 1" through "Year 5".

- **`ChartContainer` requires both a `config: ChartConfig` prop and a `className`.** Always pass `className="h-[220px] w-full"` or similar. Without a height class, the chart will collapse to 0px. Confirmed from `dashboard-charts.tsx` pattern (line 49).
  - Source: `client/src/components/planning/dashboard-charts.tsx` line 49

- **Conservative and Optimistic are computed from slider extremes, not fixed constants.** Per epics.md Story 10.1 (lines 2116, 2124): Conservative = base case inputs with each slider at its negative extreme; Optimistic = base case inputs with each slider at its positive extreme. The `CONSERVATIVE_*` / `OPTIMISTIC_*` constants in `scenario-engine.ts` are the current pre-Story-10.1 defaults — Story 10.1 will wire the actual slider range values into scenario computation. Story 10.2's delta cards (AC 13) always show base vs. conservative from the current `ScenarioOutputs` prop — the computation source is Story 10.1's responsibility.
  - Source: `_bmad-output/planning-artifacts/epics.md` Story 10.1 line 2116 ("Conservative (negative slider extremes)"), line 2124 ("Conservative/Optimistic are computed by applying slider percentage multipliers to base case inputs")

- **`LineChart` vs `ComposedChart`:** For Chart 5 (Balance Sheet) showing both Assets and Liabilities as lines, use `LineChart` with two `<Line>` data keys, or `ComposedChart` with `<Line>` for both. Both work with `ChartContainer`. `LineChart` is simpler for this use case.

- **Dark mode:** All chart colors use CSS variables which have dark-mode overrides in `index.css` (lines 139–143). No explicit dark mode handling needed in chart code — `ChartContainer` wraps in the CSS scope.
- **4 engine calls total, but only 1 recomputes per slider change:** Story 10-1 limits to 3 `calculateProjections()` calls (base, conservative-extreme, optimistic-extreme). Story 10-2 adds a 4th "Current" call using the actual slider positions. This was explicitly deferred from Story 10-1: "No fourth 'current slider position' run in Story 10-1 (that is Story 10-2 territory for the chart updates)."
  - **Call 1 — Base:** `calculateProjections(unwrapForEngine(planInputs, startupCosts))` — the unmodified saved plan. Used as the reference for metric card delta indicators.
  - **Call 2 — Current:** Apply the current slider percentage values to a cloned `FinancialInputs`, then `calculateProjections()`. This is the solid "Base Case" line on charts. **This is the only call that changes when sliders move.**
  - **Call 3 — Conservative:** Apply all sliders at their negative extremes (same as Story 10-1). Dashed line on charts.
  - **Call 4 — Optimistic:** Apply all sliders at their positive extremes (same as Story 10-1). Light dashed line on charts.
  - **Performance-critical caching:** Calls 1, 3, and 4 are STATIC — they depend only on the saved plan data, not on slider positions. These MUST be computed in a separate `useMemo` keyed on `planInputs` / `startupCosts` (recomputed only when the plan loads or changes). Only Call 2 (Current) should be in a `useMemo` keyed on the debounced slider values. This reduces per-slider-change computation from 4 engine calls to 1, which is critical for meeting the <2s recalculation NFR.
  - When all sliders are at 0% (default), the Current output equals the Base output — no delta indicators shown.
  - **Chart label note:** The chart legend label for Call 2 should display as "Base Case" (matching the epics AC terminology). Internally in code, this scenario is named `current` because it reflects the current slider configuration. When all sliders are at 0%, "current" equals the saved plan — the labels are semantically equivalent.
  - Source: `_bmad-output/implementation-artifacts/10-1-sensitivity-controls-sandbox-engine.md` lines 113, 64

- **Extend `computeSensitivityOutputs` in `sensitivity-engine.ts`:** Story 10-1 creates `client/src/lib/sensitivity-engine.ts` with `computeSensitivityOutputs(planInputs, startupCosts, sliderExtremes)` returning `ScenarioOutputs { base, conservative, optimistic }`. Story 10-2 must extend this function (or create a companion function) to accept the current slider values and return an extended result including the 4th "current" output. Ensure backward compatibility with Story 10-1's WhatIfPlayground component.
  - Source: `client/src/lib/scenario-engine.ts` — the pattern to follow

- **Reuse `cloneFinancialInputs` and `applyScenarioFactors` pattern:** The existing `scenario-engine.ts` at lines 25-73 demonstrates the exact deep-clone + apply-factors pattern. The sensitivity engine should reuse or mirror this pattern. Key transformations:
  - Revenue slider: `fi.revenue.annualGrossSales = Math.round(fi.revenue.annualGrossSales * (1 + pct/100))`
  - COGS slider: `fi.operatingCosts.cogsPct[i] += pctPoints/100` then `clamp01()`
  - Labor slider: `fi.operatingCosts.laborPct[i] *= (1 + pct/100)` then `clamp01()`
  - Marketing slider: `fi.operatingCosts.marketingPct[i] *= (1 + pct/100)` then `clamp01()`
  - Facilities slider: `fi.operatingCosts.facilitiesAnnual[i] = Math.round(fi.operatingCosts.facilitiesAnnual[i] * (1 + pct/100))`
  - Source: `client/src/lib/scenario-engine.ts:52-73`

- **React.useMemo for all chart data transforms:** Each chart transforms `EngineOutput` arrays into Recharts-compatible data arrays. All transforms must be wrapped in `useMemo` keyed on the 4 engine outputs. This prevents redundant chart re-renders.
  - Source: `_bmad-output/planning-artifacts/architecture.md` — performance requirements

- **Recharts via shadcn/ui ChartContainer:** Use `ChartContainer` from `@/components/ui/chart` for all charts. This component wraps Recharts `ResponsiveContainer` and applies consistent theme styling. Import `ChartConfig`, `ChartTooltip`, `ChartTooltipContent` as needed. The existing `dashboard-charts.tsx` demonstrates the exact pattern (Card + CardHeader + CardContent + ChartContainer).
  - Source: `client/src/components/ui/chart.tsx`, `client/src/components/planning/dashboard-charts.tsx`

- **Chart data from EngineOutput types:** All data comes from the `EngineOutput` interface fields:
  - `annualSummaries: AnnualSummary[]` — 5-year annual data (revenue, totalCogs, grossProfit, ebitda, preTaxIncome, totalAssets, totalLiabilities, totalEquity, operatingCashFlow, netCashFlow, endingCash)
  - `monthlyProjections: MonthlyProjection[]` — 60 monthly data points (cumulativeNetCashFlow, loanClosingBalance, totalCurrentAssets, totalCurrentLiabilities, endingCash, etc.)
  - `roiMetrics: ROIMetrics` — breakEvenMonth (number|null), fiveYearROIPct, totalStartupInvestment
  - `roicExtended: ROICExtendedOutput[]` — 5-year ROIC with roicPct per year
  - Source: `shared/financial-engine.ts:157-346`

- **Currency values are in cents:** All monetary amounts from `EngineOutput` are in integer cents. Divide by 100 for display. Use `formatCents()` from `client/src/lib/format-currency.ts` for formatted strings. For chart axis labels, use compact format: `$XXK` or `$X.XM` (matching existing `dashboard-charts.tsx` tickFormatter pattern).
  - Source: `client/src/lib/format-currency.ts`, `client/src/components/planning/dashboard-charts.tsx:69-71`

- **Chart axis formatting pattern (from existing codebase):**
  ```
  tickFormatter={(v: number) =>
    v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v.toFixed(0)}`
  }
  ```
  Extend for millions: `v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : ...`
  - Source: `client/src/components/planning/dashboard-charts.tsx:69-71, 146-149`

- **Debounce slider changes for chart updates:** Story 10-1 already debounces slider input (350ms). Chart updates should piggyback on the same debounced slider values. The 4th engine call (Current) should be triggered by the debounced slider state, NOT the raw slider state.

- **Component organization:** Place chart components in `client/src/components/planning/` alongside the existing `dashboard-charts.tsx`. Either:
  - Add new chart components to a new file `sensitivity-charts.tsx` (preferred — keeps dashboard and sensitivity charts separate), OR
  - Create individual chart files in a `what-if/` subdirectory if the combined file exceeds ~400 lines.
  - The orchestrating component that wires data to charts should live inside `what-if-playground.tsx` or be imported by it.

### UI/UX Deliverables

- **Chart dashboard below sliders and metric cards:** The 6 charts are arranged in a responsive grid below the existing Sensitivity Controls panel and key metric cards from Story 10-1. Layout: `grid grid-cols-1 lg:grid-cols-2 gap-4`.

- **Each chart is a Card component:** Wrap each chart in `Card > CardHeader > CardTitle + CardContent > ChartContainer`, matching the existing `BreakEvenChart` and `RevenueExpensesChart` pattern in `dashboard-charts.tsx`.

- **Chart 1 — Profitability (P&L Summary):**
  - Type: Multi-line chart (LineChart or AreaChart)
  - Data: `annualSummaries[0..4]` per scenario
  - Series: Revenue, COGS, Gross Profit, EBITDA, Pre-Tax Income
  - For each series, show 3 scenario lines (Current: solid, Conservative: dashed, Optimistic: light dashed)
  - Use different `--chart-N` colors for each financial metric; vary line style (solid/dashed) for scenarios
  - All 5 metrics are REQUIRED per AC-3. Use reduced opacity (`opacity={0.35}`) on Conservative/Optimistic lines and an interactive legend toggle to manage visual density. See "Profitability chart complexity" gotcha.

- **Chart 2 — Cash Flow:**
  - Type: Line chart
  - Data: `monthlyProjections` (60 months) — monthly granularity is REQUIRED per AC-4 so amber zones can identify specific months. Do NOT use `annualSummaries` for this chart.
  - Series: Ending Cash Balance (per scenario). Show 3 scenario lines (Current solid, Conservative dashed, Optimistic light dashed).
  - Amber advisory zone: Use `ReferenceArea` from Recharts with amber fill (hsl(35, 80%, 50%, 0.15)) for month ranges where any scenario's ending cash < 0
  - Source hint: existing `BreakEvenChart` uses `ReferenceLine y={0}` — extend pattern for area zones

- **Chart 3 — Break-Even Analysis:**
  - Type: Horizontal bar chart, timeline visualization, or annotated cumulative cash flow chart
  - Data: `roiMetrics.breakEvenMonth` per scenario, or `monthlyProjections.cumulativeNetCashFlow` for curve visualization
  - Show months-to-break-even for each scenario with clear labeling
  - Handle null break-even (60+ months) with visual indicator
  - **Do NOT reuse or extend the dashboard's `BreakEvenChart`** from `dashboard-charts.tsx` — that is a single-scenario component for the My Plan dashboard. Create a new `BreakEvenSensitivityChart` component for multi-scenario comparison. See Gotchas section.

- **Chart 4 — ROI & Returns:**
  - Type: Line chart with callout card
  - Data: `roicExtended[0..4].roicPct` per scenario
  - Callout card: plain-language sentence summarizing ROI impact (e.g., "Your conservative case still shows positive ROI by month 18")
  - Callout should be computed from the scenario data — compare break-even months and ROI percentages

- **Chart 5 — Balance Sheet Health:**
  - Type: Line chart or area chart
  - Data: `annualSummaries[0..4].totalAssets`, `totalLiabilities` per scenario
  - Equity gap = totalAssets − totalLiabilities, visible as the space between lines
  - Use distinct colors for Assets vs Liabilities lines, and solid/dashed for scenario variants

- **Chart 6 — Debt & Working Capital:**
  - Type: Line chart
  - Data: For debt paydown — `monthlyProjections.loanClosingBalance` or `annualSummaries` extrapolated
  - Working capital = `monthlyProjections.totalCurrentAssets - monthlyProjections.totalCurrentLiabilities` (per month) or from annual summaries
  - Show per-scenario lines for both debt and working capital trajectories

- **Scenario line styles (consistent across all charts):**
  - Current/Base: solid line, `strokeWidth={2}`
  - Conservative: dashed line (`strokeDasharray="5 5"`), slightly transparent
  - Optimistic: light dashed line (`strokeDasharray="3 3"`), slightly transparent
  - Source: UX spec Part 5 — "Edamame (conservative), Green (base), Basque (optimistic)"

- **Chart legend:** Each chart should include a compact legend identifying the 3 scenarios. Use `ChartLegend` / `ChartLegendContent` from `@/components/ui/chart`.

- **Tooltip:** Each chart should show a tooltip on hover with formatted values for all visible series at the hovered data point. Use `ChartTooltip` + `ChartTooltipContent` from `@/components/ui/chart`.

- **UI states:**
  - Loading: Show skeleton chart cards while plan data loads or engine computes
  - Computed: Show all 6 charts with scenario data
  - Error: If plan data is unavailable, show error message consistent with existing `planning-workspace.tsx` error pattern
  - Empty/default: When all sliders are at 0%, Current = Base — charts show the saved plan with Conservative and Optimistic bounds

- **Scrolling:** The chart dashboard should scroll within the What-If Playground container (`overflow-y-auto` on the playground's content area). The Sensitivity Controls panel at the top should remain visible (sticky or in a separate scroll region) while charts scroll below.

- **`data-testid` attributes (mandatory per architecture):**
  - `data-testid="sensitivity-chart-profitability"` — Chart 1
  - `data-testid="sensitivity-chart-cash-flow"` — Chart 2
  - `data-testid="sensitivity-chart-break-even"` — Chart 3
  - `data-testid="sensitivity-chart-roi"` — Chart 4
  - `data-testid="sensitivity-chart-balance-sheet"` — Chart 5
  - `data-testid="sensitivity-chart-debt-working-capital"` — Chart 6
  - `data-testid="sensitivity-charts-grid"` — the 6-chart grid container
  - `data-testid="sensitivity-metric-delta-*"` — delta indicator on metric cards

### Anti-Patterns & Hard Constraints

- **NEVER call `PATCH /api/plans/:planId` from the What-If Playground.** This is a sandbox. Any API mutation would corrupt the user's actual plan. Carried from Story 10-1 — same constraint applies.

- **NEVER add new API endpoints or server routes.** All 4 engine calls happen client-side using `calculateProjections()` from `shared/financial-engine.ts`. There are no new server changes in Story 10-2.

- **Do NOT modify `shared/financial-engine.ts` or `shared/plan-initialization.ts`.** These are authoritative and stable with 399+ passing tests. Do not modify the engine or unwrap functions.

- **Do NOT modify `client/src/lib/scenario-engine.ts`.** The existing Summary tab uses `computeScenarioOutputs()`. Create or extend the sensitivity engine separately.

- **Do NOT run more than 4 `calculateProjections()` calls per render cycle.** One for base (saved plan), one for current (slider positions), one for conservative extremes, one for optimistic extremes. Wrap in `useMemo` to prevent redundant calls.

- **Do NOT create new chart primitives.** Use the existing shadcn/ui `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent` from `@/components/ui/chart`. Do NOT create custom tooltip or legend components — reuse the existing ones.

- **Do NOT add new URL routes.** The What-If Playground uses `WorkspaceViewContext` "scenarios" view, not a new route. Carried from Story 10-1.

- **Do NOT use error-red for advisory zones.** Cash-negative amber zones use advisory colors (amber/orange family), never `destructive` or error-red. The advisory vs error visual language distinction is a product-wide UX requirement (FR88–FR89).

- **Do NOT duplicate chart formatting utilities.** Use the existing `formatCents()` from `client/src/lib/format-currency.ts` and the tickFormatter pattern from `dashboard-charts.tsx`. Do NOT create new currency formatting functions.

- **Files that MUST NOT be modified in this story:**
  - `shared/financial-engine.ts` — authoritative financial engine, 399+ tests
  - `shared/plan-initialization.ts` — engine input preparation, tested
  - `client/src/lib/scenario-engine.ts` — used by existing Reports statements views
  - `client/src/contexts/WorkspaceViewContext.tsx` — no new views needed
  - `client/src/components/ui/chart.tsx` — shadcn/ui primitive, never modify

### Gotchas & Integration Warnings

- **Story 10-1 must be implemented first.** Story 10-2 depends on: `client/src/lib/sensitivity-engine.ts` (the computation engine), `client/src/components/planning/what-if-playground.tsx` (the parent component), and the `case "scenarios":` replacement in `planning-workspace.tsx`. If Story 10-1 is not yet implemented, the dev agent must implement it first or stub the required interfaces.

- **`annualSummaries` has annual granularity, `monthlyProjections` has monthly.** For 5-year trend charts (Profitability, Balance Sheet), use `annualSummaries[0..4]` (5 data points). For charts needing finer granularity (Cash Flow amber zones, Debt paydown, Break-Even timeline), use `monthlyProjections` (60 data points). Choose appropriate granularity per chart — don't force monthly data onto all charts or annual data where monthly precision matters.

- **`roiMetrics.breakEvenMonth` can be null.** If the plan doesn't break even within 60 months, `breakEvenMonth` is `null`. Handle this in Chart 3 (Break-Even) and in metric card deltas. Display "60+ mo" or "N/A" — never show `null` or crash.

- **4 engine calls × 60 months = significant data volume.** Each `EngineOutput` contains 60 `MonthlyProjection` objects + 5 `AnnualSummary` objects + multiple sub-arrays. Memoize chart data transforms aggressively. Do NOT recompute chart data on every render — only when engine outputs change.

- **Recharts `Line` strokeDasharray for scenario differentiation:** To achieve solid vs dashed vs light-dashed lines, use `strokeDasharray` prop on Recharts `<Line>` components. Solid = no strokeDasharray. Conservative dashed = `strokeDasharray="5 5"`. Optimistic light dashed = `strokeDasharray="3 3"` with reduced opacity.

- **Recharts `ResponsiveContainer` requires a parent with defined height.** The `ChartContainer` wrapper handles this, but ensure each chart card has a fixed or min-height for the chart content area (e.g., `className="h-[220px] w-full"` matching existing dashboard charts).

- **Scenario colors — UX spec vs codebase divergence:** The UX spec (Part 5, Data Visualization) specifies scenario overlay colors as green-family tones: **Edamame Sage `#96A487`** (conservative), **Katalyst Green `#78BF26`** (base/current), **Basque `#676F13`** (optimistic). However, the existing `SCENARIO_COLORS` in `scenario-engine.ts` uses orange for conservative and blue for optimistic. For the sensitivity charts, prefer the **codebase convention** (orange/blue) to maintain visual consistency with the existing Summary tab's scenario dots and backgrounds. If the UX spec colors are preferred, all scenario indicators across the app should be updated together in a separate pass. Recommended chart line colors:
  - Base/Current: `hsl(var(--primary))` (Katalyst Green, solid line)
  - Conservative: `hsl(25, 95%, 53%)` (orange-family, matching `SCENARIO_COLORS.conservative.dot: bg-orange-500`)
  - Optimistic: `hsl(210, 85%, 55%)` (blue-family, matching `SCENARIO_COLORS.optimistic.dot: bg-blue-500`)
  - These must be consistent across ALL 6 charts.
  - Source: `client/src/lib/scenario-engine.ts:113-117`, `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` Part 5

- **Existing `BreakEvenChart` in `dashboard-charts.tsx` is a DIFFERENT component.** That chart shows a single-scenario cumulative cash flow for the My Plan dashboard. The What-If Playground Break-Even chart (Chart 3) shows multi-scenario break-even comparison. Do NOT reuse the dashboard's `BreakEvenChart` — create a new component for the sensitivity dashboard.

- **`totalCurrentAssets` and `totalCurrentLiabilities` for working capital.** These fields exist on `MonthlyProjection` (not `AnnualSummary`). Working capital = `totalCurrentAssets - totalCurrentLiabilities`. For annual charting, use the month-12 value of each year (i.e., months 12, 24, 36, 48, 60) as end-of-year working capital.

- **Profitability chart complexity — visual management required.** AC-3 requires all 5 financial metrics (Revenue, COGS, Gross Profit, EBITDA, Pre-Tax Income) × 3 scenarios = 15 lines. All 5 metrics MUST be present to satisfy AC-3, but visual techniques are required to prevent overload: (1) show all 5 metrics for the Current scenario as solid lines at full opacity, (2) show Conservative and Optimistic scenario lines at reduced opacity (`opacity={0.35}`) so they recede visually, (3) use the Recharts interactive legend (`ChartLegend`) so users can click to toggle individual metric series on/off. This approach satisfies AC-3's requirement for all 5 metrics while keeping the chart readable by default. Do NOT omit metrics or show only EBITDA — that would violate AC-3.

- **Zero-debt plans in Chart 6.** Plans with no financing (no SBA loan, no line of credit) will have `loanClosingBalance = 0` for all months. If debt is zero across all scenarios, Chart 6 should still render showing only the Working Capital trajectory lines. Include a subtle annotation ("No debt in this plan") in the chart header or legend rather than showing an empty or flat-at-zero debt line.

- **ImpactStrip renders below the workspace content.** The What-If Playground component renders within the `flex-1` content area. The ImpactStrip is a sibling at the bottom. Design the chart grid to scroll independently within its container. Carried from Story 10-1.

- **The ROI callout card content must be computed, not hardcoded.** The plain-language interpretation (e.g., "Your conservative case still shows positive ROI by month 18") should be derived from the scenario data. Compare `roiMetrics.breakEvenMonth` and `roiMetrics.fiveYearROIPct` across scenarios to generate a meaningful sentence.

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
  - AC 6: Verify amber advisory zone appears for Chart 2 when any scenario has a month where `monthlyProjections[m].endingCash < 0` — including mid-year dips that recover by year-end (year-end `endingCash` alone is insufficient)
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
| `client/src/lib/sensitivity-engine.ts` | MODIFY | Extend to support 4th "current" engine call. Add `computeSensitivityOutputsWithCurrent(planInputs, startupCosts, currentSliderValues, extremes)` or extend existing function signature. Return type must include `current: EngineOutput` alongside `base`, `conservative`, `optimistic`. |
| `client/src/components/planning/sensitivity-charts.tsx` | CREATE | New file containing all 6 chart components: `ProfitabilityChart`, `CashFlowChart`, `BreakEvenSensitivityChart`, `ROIChart`, `BalanceSheetChart`, `DebtWorkingCapitalChart`. Each accepts the 4 engine outputs and renders a Recharts chart inside a Card. |
| `client/src/components/planning/what-if-playground.tsx` | MODIFY | Add the sensitivity chart grid below the existing Sensitivity Controls panel and metric cards. Import and render the 6 chart components. Wire debounced slider values to the extended engine function. Add delta indicator logic to metric cards. |

### Dependencies & Environment Variables

- **No new npm packages required.** Recharts 2.15 is already installed. shadcn/ui chart components are available. All Recharts primitives (LineChart, Line, AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceLine, ReferenceArea, ResponsiveContainer) are already available via the `recharts` package.
- **No new environment variables.** All computation is client-side.
- **No new API endpoints.** No server changes.
- **No database schema changes.** No persisted state in Story 10-2 (scenario persistence is Story 10-3).

### Testing Expectations

- **Component tests for each chart:** Render each chart component with mock `EngineOutput` data. Assert that `data-testid` elements render. Assert that chart SVG elements appear within the container.
- **Integration test for chart reactivity:** Render `WhatIfPlayground` with a mock plan. Adjust a slider value. Assert that chart containers re-render with updated data (verify via `data-testid` or snapshot).
- **Delta indicator tests:** Assert that metric card delta indicators appear when slider values differ from 0%. Assert that deltas are hidden when all sliders are at 0%.
- **Break-even null handling:** Provide a scenario where `roiMetrics.breakEvenMonth` is null. Assert the chart and metric cards display "60+ mo" or equivalent, not null/undefined.
- **Sandbox invariant:** Assert that no `PATCH` calls are emitted during chart interaction (same as Story 10-1).
- **Test framework:** Vitest + React Testing Library (consistent with existing project setup).
- **Critical ACs to cover:** AC-2 (reactivity), AC-5 (null break-even), AC-9 (delta indicators), AC-11 (sandbox invariant).

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` → Story 10.2] — User story, acceptance criteria, and Dev Notes for Multi-Chart Sensitivity Dashboard
- [Source: `_bmad-output/implementation-artifacts/10-1-sensitivity-controls-sandbox-engine.md`] — Story 10-1 context document; 4th engine call hint at line 113; slider ranges, engine patterns, anti-patterns
- [Source: `client/src/lib/scenario-engine.ts`] — ScenarioOutputs type, SCENARIO_COLORS, cloneFinancialInputs, applyScenarioFactors pattern
- [Source: `client/src/components/planning/dashboard-charts.tsx`] — Existing Recharts chart pattern (BreakEvenChart, RevenueExpensesChart) using ChartContainer
- [Source: `client/src/components/ui/chart.tsx`] — shadcn/ui chart primitives: ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent
- [Source: `shared/financial-engine.ts:157-346`] — EngineOutput, MonthlyProjection, AnnualSummary, ROIMetrics, ROICExtendedOutput, ValuationOutput interfaces
- [Source: `client/src/lib/format-currency.ts`] — formatCents utility for currency display
- [Source: `client/src/pages/planning-workspace.tsx:127-142`] — "scenarios" view placeholder (replaced by Story 10-1)
- [Source: `client/src/contexts/WorkspaceViewContext.tsx`] — WorkspaceView type and navigateToScenarios()
- [Source: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` → Journey 4] — Franchisee reviewing scenarios in What-If Playground; chart descriptions, slider behavior, amber zones
- [Source: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` → Part 5 Data Visualization] — Recharts as charting library; scenario overlay colors (Edamame/Green/Basque)
- [Source: `_bmad-output/planning-artifacts/architecture.md`] — Recharts 2.15, performance < 2s recalc, data-testid convention, currency in cents

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Completion Notes

### File List

### Testing Summary
_to be filled by dev agent_

### Completion Notes

_to be filled by dev agent_

### File List

_to be filled by dev agent_

### Testing Summary

_to be filled by dev agent_
