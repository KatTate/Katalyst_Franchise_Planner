# Story 10.2: Multi-Chart Sensitivity Dashboard

Status: ready-for-dev

## Story

As a franchisee,
I want to see 6 simultaneous charts in the What-If Playground that all react to my slider adjustments,
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
**Then** Chart 2 displays a line chart showing Net Operating Cash Flow, Net Cash Flow, and Ending Cash Balance over 5 years for each scenario
**And** months where any scenario's ending cash balance goes negative are highlighted with an amber advisory zone (not error-red)

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
**Then** key metric cards display delta indicators showing the impact of slider changes vs. the base saved plan (e.g., "Break-Even: 14 mo → 18 mo (+4 mo)")

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

- **4 engine calls per computation cycle (extends Story 10-1's 3-call model):** Story 10-1 limits to 3 `calculateProjections()` calls (base, conservative-extreme, optimistic-extreme). Story 10-2 adds a 4th "Current" call using the actual slider positions. This was explicitly deferred from Story 10-1: "No fourth 'current slider position' run in Story 10-1 (that is Story 10-2 territory for the chart updates)."
  - **Call 1 — Base:** `calculateProjections(unwrapForEngine(planInputs, startupCosts))` — the unmodified saved plan. Used as the reference for metric card delta indicators.
  - **Call 2 — Current:** Apply the current slider percentage values to a cloned `FinancialInputs`, then `calculateProjections()`. This is the solid "Base Case" line on charts.
  - **Call 3 — Conservative:** Apply all sliders at their negative extremes (same as Story 10-1). Dashed line on charts.
  - **Call 4 — Optimistic:** Apply all sliders at their positive extremes (same as Story 10-1). Light dashed line on charts.
  - When all sliders are at 0% (default), the Current output equals the Base output — no delta indicators shown.
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
  - Consider showing only the primary metric (e.g., EBITDA) with 3 scenario lines, with a toggle or simplified view to avoid overwhelming 15 lines on one chart

- **Chart 2 — Cash Flow:**
  - Type: Line chart
  - Data: `annualSummaries[0..4]` for annual view, or `monthlyProjections` for monthly granularity
  - Series: Net Operating Cash Flow, Net Cash Flow, Ending Cash Balance (per scenario)
  - Amber advisory zone: Use `ReferenceArea` from Recharts with amber fill (hsl(35, 80%, 50%, 0.15)) where any scenario's ending cash < 0
  - Source hint: existing `BreakEvenChart` uses `ReferenceLine y={0}` — extend pattern for area zones

- **Chart 3 — Break-Even Analysis:**
  - Type: Horizontal bar chart, timeline visualization, or annotated cumulative cash flow chart
  - Data: `roiMetrics.breakEvenMonth` per scenario, or `monthlyProjections.cumulativeNetCashFlow` for curve visualization
  - Show months-to-break-even for each scenario with clear labeling
  - Handle null break-even (60+ months) with visual indicator
  - Existing `BreakEvenChart` in `dashboard-charts.tsx` shows a single-scenario cumulative cash flow area chart — consider extending to 3 scenario overlay lines

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

- **Profitability chart complexity — consider simplification.** The AC specifies 5 financial metrics × 3 scenarios = 15 potential lines on Chart 1. This risks visual overload. The dev agent should consider: (1) showing only the key metric (EBITDA) with 3 scenario lines as the default, with expandable detail, OR (2) using area bands for conservative-to-optimistic range with EBITDA as the primary line, OR (3) showing all 5 metrics but only the Current scenario with toggleable Conservative/Optimistic. Use judgment to balance completeness with readability.

- **ImpactStrip renders below the workspace content.** The What-If Playground component renders within the `flex-1` content area. The ImpactStrip is a sibling at the bottom. Design the chart grid to scroll independently within its container. Carried from Story 10-1.

- **The ROI callout card content must be computed, not hardcoded.** The plain-language interpretation (e.g., "Your conservative case still shows positive ROI by month 18") should be derived from the scenario data. Compare `roiMetrics.breakEvenMonth` and `roiMetrics.fiveYearROIPct` across scenarios to generate a meaningful sentence.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
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

_to be filled by dev agent_

### Completion Notes

_to be filled by dev agent_

### File List

_to be filled by dev agent_

### Testing Summary

_to be filled by dev agent_
