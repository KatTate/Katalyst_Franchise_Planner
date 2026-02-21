# Story 10.2a: Sensitivity Chart Dashboard

Status: ready-for-dev

## Story

As a franchisee,
I want to see 6 simultaneous charts in the What-If Playground that all react to my slider adjustments,
so that I can understand the full impact of changing assumptions across every dimension of my business.

## Acceptance Criteria

### Chart Dashboard Layout

1. Given I am on the What-If Playground (the "scenarios" workspace view) with sensitivity sliders visible, when the chart dashboard renders below the sliders panel, then 6 chart cards are displayed in a responsive 2-column grid (2×3 on desktop ≥1024px, 1-column stack on mobile <768px). The chart area is labeled "Your Business — Three Scenarios" or similar contextual heading.

2. Given the What-If Playground has loaded and `ScenarioOutputs` (base, conservative, optimistic) are computed, when any slider value changes and new `ScenarioOutputs` are recomputed (debounced by Story 10.1), then all 6 chart containers re-render with updated data within the same React commit cycle — no chart displays stale data from a previous computation.

### Chart 1 — "Am I Making Money?" (Profitability)

3. Given `ScenarioOutputs` are available, when Chart 1 renders, then it shows a 5-year line/area chart (one set of lines per scenario) for all five P&L metrics from `annualSummaries`: **Annual Revenue** (`revenue`, primary area), **COGS** (`totalCogs`), **Gross Profit** (`grossProfit`), **EBITDA** (`ebitda`), and **Pre-Tax Income** (`preTaxIncome`) — all rendered as overlaid lines. The chart X-axis shows Year 1 through Year 5; Y-axis shows dollar amounts. The three scenario curves use the runtime values from `SCENARIO_COLORS` in `scenario-engine.ts`: Base Case as a solid line, Conservative as a dashed line (`strokeDasharray="5 5"`), Optimistic as a lighter dashed line (`strokeDasharray="3 3"`). See "Scenario line colors" in Dev Notes for current resolved values.
   - Source: `_bmad-output/planning-artifacts/epics.md` line 2137; `ux-design-specification-consolidated.md` Journey 4 line 1099

4. Given Chart 1 renders, when I hover over any data point, then a tooltip (with `data-testid="chart-profitability-tooltip"`) displays the year, scenario name, and all five series values — Revenue, COGS, Gross Profit, EBITDA, and Pre-Tax Income — each formatted as a dollar value (e.g., "$142,000").

### Chart 2 — "Can I Pay My Bills?" (Cash Flow)

5. Given `ScenarioOutputs` are available, when Chart 2 renders, then it shows a 60-month line chart (monthly granularity from `monthlyProjections`) with three scenario curves for **Ending Cash Balance** (`endingCash`). The X-axis shows months 1–60 (with year markers); the Y-axis shows dollar amounts. Monthly granularity is required so amber advisory zones can identify specific months where cash dips negative, not just year-end snapshots.
   - Source: `_bmad-output/planning-artifacts/epics.md` line 2138

6. Given Chart 2 renders, when any scenario has at least one month where `monthlyProjections[m].endingCash < 0` (m = 0–59, checked across all 60 months — not just year-end values), then an amber advisory zone (`hsl(var(--chart-5))` at 15% opacity as a background band, or a `ReferenceLine y={0}` with amber fill below) highlights the cash-negative region. A scenario that dips negative mid-year but recovers by year-end must still trigger the advisory zone — checking `annualSummaries[].endingCash` alone is insufficient. This advisory coloring follows the UX spec's amber advisory language — it is not a red error state. When the amber advisory zone is visible, a brief inline annotation appears near the zone (e.g., "Cash dips below zero here — consider adjusting assumptions"). This is informational, not an error.
   - Source: `_bmad-output/planning-artifacts/epics.md` line 2138 ("Months where any scenario goes cash-negative")

### Chart 3 — "When Do I Break Even?" (Break-Even Timeline)

7. Given `ScenarioOutputs` are available, when Chart 3 renders, then it shows the months-to-break-even for each scenario as a horizontal bar chart (or annotated timeline visualization). Each scenario bar shows:
   - **Base Case**: `roiMetrics.breakEvenMonth` from `ScenarioOutputs.base`
   - **Conservative**: `roiMetrics.breakEvenMonth` from `ScenarioOutputs.conservative`
   - **Optimistic**: `roiMetrics.breakEvenMonth` from `ScenarioOutputs.optimistic`

   If `roiMetrics.breakEvenMonth` is `null` for a scenario (break-even not reached in 60 months), the bar displays "No break-even in 5 years" with a muted style.

8. Given Chart 3 renders, when I view the chart, then each bar is labeled with its scenario name and the break-even month value (e.g., "Base: Month 14", "Conservative: Month 22", "Optimistic: Month 9"). The bars use the runtime scenario color values from `SCENARIO_COLORS` in `scenario-engine.ts` (green-family Base, orange-family Conservative, blue-family Optimistic).

### Chart 4 — "What's My Return?" (ROI & Returns)

9. Given `ScenarioOutputs` are available, when Chart 4 renders, then it shows a 5-year cumulative ROIC line chart. The Y-axis shows ROIC percentage; the X-axis shows Year 1 through Year 5. Three scenario curves display `roicExtended[].roicPct` for years 1-5 using the runtime scenario color values from `SCENARIO_COLORS` (Base solid, Conservative dashed, Optimistic lighter-dashed).

10. Given Chart 4 renders, then a plain-language callout card appears below or beside the chart summarizing the conservative case. The specific phrasing is: "Conservative case: [X]% ROIC at Year 5." Do NOT say "Even in the conservative scenario..." (per UX spec advisory language constraint).

### Chart 5 — "Is My Business Growing?" (Balance Sheet Health)

11. Given `ScenarioOutputs` are available, when Chart 5 renders, then it shows a 5-year dual-line chart for **Total Assets** (`annualSummaries[].totalAssets`) vs **Total Liabilities** (`annualSummaries[].totalLiabilities`) for all three scenarios. The growing gap between assets and liabilities lines represents equity growth. Each scenario's asset line uses the chart color token, with liabilities as a lighter/muted variant. The X-axis shows Year 1 through Year 5; the Y-axis shows dollar amounts. Scenario line styles follow the runtime `SCENARIO_COLORS` convention.

### Chart 6 — "How's My Debt?" (Debt & Working Capital)

12. Given `ScenarioOutputs` are available, when Chart 6 renders, then it shows a 5-year chart with two data series:
    - **Outstanding Debt**: year-end `monthlyProjections[(year*12)-1].loanClosingBalance` (indices 11, 23, 35, 47, 59 for years 1–5). Do NOT use `annualSummaries[].totalLiabilities` — that value includes operating liabilities (accounts payable, tax payable) in addition to the loan balance (`totalLiabilities = loanBalance + accountsPayable + taxPayable + lineOfCredit` per `financial-engine.ts` line 572), making it unsuitable as a debt-paydown series. Always assert `monthlyProjections.length === 60` before indexing.
    - **Working Capital**: computed as `totalCurrentAssets - totalCurrentLiabilities` from `monthlyProjections[(year*12)-1]` (year-end month for each year 1-5)

    Three scenario curves are displayed for each series using the runtime `SCENARIO_COLORS` convention. The X-axis shows Year 1 through Year 5.

### Error Boundary

13. Given `ScenarioOutputs` computation throws an error or returns malformed data (e.g., `annualSummaries` has fewer than 5 entries, `roicExtended` is empty, or any required field is undefined), when the chart dashboard attempts to render, then an error boundary catches the failure and displays a user-friendly message (e.g., "Unable to generate charts. Please try adjusting your inputs.") without crashing the entire What-If Playground.

### Performance

14. Given all 6 charts are rendered with three scenarios and a slider value changes, when recomputation completes, then the full chart update completes within 500ms on a standard device (verified via Chrome DevTools Performance audit at 4x CPU throttle). Use `React.memo` on `SensitivityCharts` and `useMemo` per chart. If Chart 2 (60-month, 180 data points) causes jank, consider downsampling to monthly averages per quarter for display while keeping full data in tooltips.

### data-testid Coverage

15. Given the chart dashboard renders, then it includes:
    - `data-testid="sensitivity-charts-grid"` on the outer chart grid container
    - `data-testid="sensitivity-chart-profitability"` on Chart 1 card
    - `data-testid="sensitivity-chart-cash-flow"` on Chart 2 card
    - `data-testid="sensitivity-chart-break-even"` on Chart 3 card
    - `data-testid="sensitivity-chart-roi"` on Chart 4 card
    - `data-testid="sensitivity-chart-balance-sheet"` on Chart 5 card
    - `data-testid="sensitivity-chart-debt-working-capital"` on Chart 6 card
    - `data-testid="roi-callout"` on the Chart 4 plain-language callout card
    - `data-testid="sensitivity-charts-error"` on the error boundary fallback message
    - `data-testid="chart-profitability-tooltip"` on Chart 1's tooltip content container

### Chart Color Tokens & Advisory Colors

16. Given the charts are rendered, then scenario curves use consistent colors matching the runtime `SCENARIO_COLORS` from `scenario-engine.ts`: green-family for Base Case (solid line), orange-family for Conservative (dashed line), blue-family for Optimistic (light dashed line). Do NOT hardcode HSL values in components — always reference the runtime constants. Advisory zones (cash-negative amber on Chart 2) use amber advisory color (never error-red), consistent with the Guardian Bar visual language (FR88–FR89). Use CSS chart color tokens (`--chart-1` through `--chart-5`) for distinct data series within each chart.

### Sandbox Invariant

17. Given I interact with the charts and sliders, then no `PATCH /api/plans/:planId` request is sent — all computation is client-side sandbox-only.

## Dev Notes

### Architecture Patterns to Follow

- **Epic 10 is the sole scenario analysis surface (SCP-2026-02-20 D5/D6):** The column-splitting scenario comparison was retired from Reports. Epic 10 (What-If Playground) is now the **canonical and only** home for scenario analysis in the product. The dev agent is building the definitive feature, not a parallel one. `ScenarioBar`, `ComparisonTableHead`, and `ScenarioSummaryCard` remain in the codebase as dead code pending cleanup — do not integrate them.
  - Source: `_bmad-output/planning-artifacts/prd.md` (SCP-2026-02-20 entry), `_bmad-output/planning-artifacts/architecture.md` lines 727–728

- **Workspace view integration:** The What-If Playground lives at `workspaceView === "scenarios"` in `WorkspaceViewContext`. Story 10.1 replaces the placeholder `<div data-testid="placeholder-scenarios">` in `planning-workspace.tsx` `case "scenarios"` with a `<WhatIfPlayground>` component. Story 10.2a adds a `<SensitivityCharts>` component INSIDE `what-if-playground.tsx` — it does NOT modify `planning-workspace.tsx` independently.
  - Source: `client/src/pages/planning-workspace.tsx` lines 127–142 (placeholder), `client/src/contexts/WorkspaceViewContext.tsx` line 4 (`WorkspaceView` type)

- **Scenario computation (ALREADY EXISTS — DO NOT REIMPLEMENT):** `computeScenarioOutputs()` in `client/src/lib/scenario-engine.ts` accepts `(planInputs: PlanFinancialInputs, startupCosts: StartupCostLineItem[])` and returns `ScenarioOutputs { base, conservative, optimistic }` — each being a full `EngineOutput`. Story 10.1 calls this function and passes the results down. Story 10.2a receives `ScenarioOutputs` as a prop.
  - Source: `client/src/lib/scenario-engine.ts` → `computeScenarioOutputs()`, `ScenarioOutputs`, `ScenarioId`

- **Chart rendering pattern (FOLLOW dashboard-charts.tsx):** Use `recharts` components (`LineChart`, `AreaChart`, `BarChart`) wrapped with `ChartContainer` from `@/components/ui/chart`. `ChartContainer` handles responsive sizing; always pass a `ChartConfig` object. Use `ChartTooltip` + `ChartTooltipContent` for tooltips. All chart implementations in this project follow this pattern.
  - Source: `client/src/components/planning/dashboard-charts.tsx` → `BreakEvenChart`, `RevenueExpensesChart` (both show the exact pattern to follow)

- **Scenario line colors (use runtime constants from `SCENARIO_COLORS` in `scenario-engine.ts`):**
  - Base/Current (solid line): `SCENARIO_COLORS.base` — currently resolves to `hsl(var(--primary))` (Katalyst Green)
  - Conservative (dashed line, `strokeDasharray="5 5"`): `SCENARIO_COLORS.conservative` — currently resolves to `hsl(25, 95%, 53%)` (orange-family, `bg-orange-500`)
  - Optimistic (lighter dashed, `strokeDasharray="3 3"`): `SCENARIO_COLORS.optimistic` — currently resolves to `hsl(210, 85%, 55%)` (blue-family, `bg-blue-500`)
  - These must be consistent across ALL 6 charts. Always reference the runtime constants, not hardcoded HSL strings.
  - Use CSS chart color tokens (`--chart-1` through `--chart-5`) for distinct **data series within** each chart (e.g., Revenue vs COGS vs EBITDA in Chart 1), NOT for scenario differentiation.
  - Amber advisory zone (cash-negative on Chart 2): `hsl(var(--chart-5))` at 15% opacity as reference area or gradient
  - Source: `client/src/lib/scenario-engine.ts:113-117`, `client/src/index.css` lines 48–52 (light) and 139–143 (dark)

- **Currency values are stored in CENTS:** All `EngineOutput` numeric values (revenue, cash, assets, liabilities) are in cents. Divide by 100 before displaying in charts. Use `$${(v / 1000).toFixed(0)}K` for Y-axis tick labels (see `dashboard-charts.tsx` line 70 for the pattern). Full tooltip values: `$${num.toLocaleString("en-US", { maximumFractionDigits: 0 })}`.
  - Source: `shared/financial-engine.ts`, `client/src/components/planning/dashboard-charts.tsx` lines 70, 79

- **Data memoization:** Chart data transforms (mapping `annualSummaries` or `monthlyProjections` to chart data arrays) MUST be wrapped in `useMemo`. Each of the 6 charts should memoize its data transform independently, keyed on the `ScenarioOutputs` prop. This prevents unnecessary recalculations on unrelated re-renders.
  - Source: `_bmad-output/planning-artifacts/epics.md` Story 10.2 Dev Notes

- **EngineOutput data fields for each chart:**
  - Chart 1 (Profitability): `output.annualSummaries[y].revenue`, `.totalCogs`, `.grossProfit`, `.ebitda`, `.preTaxIncome` — 5 values per series (years 1–5); all are in cents
  - Chart 2 (Cash Flow): `output.monthlyProjections[m].endingCash` — 60 values (months 0–59); all are in cents. Monthly granularity required for amber advisory zone precision.
  - Chart 3 (Break-Even): `output.roiMetrics.breakEvenMonth` — single number per scenario
  - Chart 4 (ROI): `output.roicExtended[y].roicPct` — 5 values (year 1-5)
  - Chart 5 (Balance Sheet): `output.annualSummaries[y].totalAssets`, `.totalLiabilities` — 5 values
  - Chart 6 (Debt & Working Capital): Year-end values from `output.monthlyProjections[(y*12)-1].loanClosingBalance` for debt; `.totalCurrentAssets - .totalCurrentLiabilities` for working capital
  - Source: `shared/financial-engine.ts` → `EngineOutput`, `AnnualSummary`, `MonthlyProjection`, `ROIMetrics`, `ROICExtendedOutput`

- **Naming conventions (architecture.md):** Components: PascalCase. Files: kebab-case. data-testid: `{type}-{content}` for display elements, `{action}-{target}` for interactive. Hooks: `use` prefix + camelCase.
  - Source: `_bmad-output/planning-artifacts/architecture.md` → Naming Patterns

- **Plan data access:** The `WhatIfPlayground` component (created in 10.1) receives `planId`, `financialInputs: PlanFinancialInputs`, and `startupCosts: StartupCostLineItem[]` from `planning-workspace.tsx`. These are passed through to `computeScenarioOutputs()`. Story 10.2a's `SensitivityCharts` component receives the computed `ScenarioOutputs` as a prop — it does NOT access plan data directly.
  - Source: `client/src/pages/planning-workspace.tsx` lines 110–111 (data shape)

### UI/UX Deliverables

**Chart Titles — Human-Friendly with Technical Subtitles:**
Each chart card uses a plain-language primary title (in `CardTitle`) with the technical term as a smaller subtitle (in `text-xs text-muted-foreground`):
- Chart 1: **"Am I Making Money?"** / *Profitability*
- Chart 2: **"Can I Pay My Bills?"** / *Cash Flow*
- Chart 3: **"When Do I Break Even?"** / *Break-Even Timeline*
- Chart 4: **"What's My Return?"** / *ROI & Returns*
- Chart 5: **"Is My Business Growing?"** / *Balance Sheet Health*
- Chart 6: **"How's My Debt?"** / *Debt & Working Capital*

**Chart Dashboard (below slider panel in What-If Playground):**
- Heading: e.g., "Business Impact — Three Scenarios" (contextual label, not prescriptive)
- 2×3 grid of `Card` components on desktop (≥1024px); single-column stack on mobile
- Each card: `CardHeader` with human-friendly title + technical subtitle, `CardContent` with `ChartContainer` at `h-[200px]` or `h-[220px]`
- Chart legend: inline or below chart — scenario labels: "Base Case" / "Conservative" / "Optimistic" with color dots matching line colors

**Responsive behavior:**
- Desktop (≥1024px): 2-column chart grid
- Tablet (768–1023px): 2-column chart grid
- Mobile (<768px): 1-column chart stack
- Desktop layout (≥1024px) is the primary acceptance target for automated e2e testing. Tablet and mobile layouts are verified by visual review during story QA.

**Visual style:**
- Charts use `Card` component with `CardHeader` + `CardTitle` at `text-sm font-medium`
- Chart card height: charts at `h-[200px]` or `h-[220px]` within `ChartContainer`
- Amber advisory zone on Chart 2: subtle background band below zero, NOT destructive red. Include brief contextual annotation when visible.
- All styling follows existing `dashboard-charts.tsx` card patterns

**Loading state:**
- If `ScenarioOutputs` is `null` or still computing, chart cards show skeleton placeholders at the same height as the charts (`Skeleton className="h-[220px] w-full"`)

### Anti-Patterns & Hard Constraints

- **DO NOT call `calculateProjections()` or any engine function inside `SensitivityCharts`.** All engine computation belongs in `WhatIfPlayground` (10.1's domain). `SensitivityCharts` is a pure presentational component — it receives the engine outputs as props and renders charts. Calling the engine inside a chart component would re-compute on every render.
  - Source: `client/src/lib/scenario-engine.ts` — engine calls live in WhatIfPlayground, not per-chart

- **DO NOT use red/destructive colors for the cash-negative advisory zone on Chart 2.** The cash-negative zone uses amber advisory coloring (`hsl(var(--chart-5))` at 15% opacity). Red is reserved for actual system errors. This is an advisory/warning, not a failure state.
  - Source: UX spec Part 12 (Guardian advisory language), `client/src/index.css` (guardian tokens)

- **DO NOT import or use `ScenarioBar` or `ScenarioSummaryCard` from Epic 5 statements.** Those components are officially marked `[DEAD CODE]` in `architecture.md` per SCP-2026-02-20 D5/D6 — they are the retired column-splitting comparison UI from Reports. The What-If Playground uses a fresh chart-based approach.
  - Source: `_bmad-output/planning-artifacts/architecture.md` lines 1577–1580

- **DO NOT hardcode arbitrary hex or HSL color values for scenario lines.** Always use the runtime `SCENARIO_COLORS` constants from `scenario-engine.ts` for scenario differentiation. Use CSS chart tokens (`--chart-1` through `--chart-5`) for data series within charts. This ensures dark mode works correctly.
  - Source: `client/src/lib/scenario-engine.ts:113-117`, `client/src/index.css` lines 48–52 (light mode chart vars), 139–143 (dark mode chart vars)

- **DO NOT add new API endpoints or server-side calls.** All scenario computation is client-side (`calculateProjections` imported from `shared/financial-engine.ts`). Chart data is derived from `ScenarioOutputs` in-memory. No server fetching for charts.
  - Source: Architecture Decision 8; `client/src/lib/scenario-engine.ts` imports `calculateProjections` directly

- **DO NOT modify `vite.config.ts`, `server/vite.ts`, `package.json`, or `drizzle.config.ts`.** These are protected project files.

- **DO NOT skip memoization for chart data transforms.** Without `useMemo`, slider input events will trigger expensive array transforms on every keystroke. Each chart's data transform MUST be in `useMemo`.

- **DO NOT add a Tasks/Subtasks section to this story file.** The dev agent plans its own implementation.

### Gotchas & Integration Warnings

- **Story 10.1 must complete before 10.2a can begin.** Story 10.2a's `SensitivityCharts` component is rendered inside `WhatIfPlayground` created in Story 10.1. The interface contract: `WhatIfPlayground` computes `ScenarioOutputs` (from `computeScenarioOutputs`) and passes them to `SensitivityCharts` as a prop. If 10.1 is not done, there is no host component for 10.2a's charts.

- **`roicExtended` array has 5 entries (index 0-4 for years 1-5).** When mapping to chart data, use `output.roicExtended[i]` where `i` is 0-4, not `roiMetrics` (which has break-even data). `roicExtended[i].roicPct` is the ROIC as a **decimal fraction** (e.g., `0.127` = 12.7%) — it is computed as `afterTaxNetIncome / totalInvestedCapital` (engine line 771). **Multiply by 100** to display as a percentage: `(roicPct * 100).toFixed(1) + "%"`. Do NOT treat this as cents (no `/100`). The correct pattern is confirmed by `callout-bar.tsx` line 105 (`roic5yr.roicPct * 100`) and `roic-tab.tsx` line 212 (`roicPct * 100`).
  - Source: `shared/financial-engine.ts` lines 302–315 (`ROICExtendedOutput` interface), line 771 (computation); `client/src/components/planning/statements/callout-bar.tsx` line 105; `client/src/components/planning/statements/roic-tab.tsx` line 212

- **`roiMetrics.breakEvenMonth` can be `null` if break-even is not reached in 60 months.** Always handle the null case in Chart 3. Display "No break-even in 5 years" rather than crashing on `null.toString()`.
  - Source: `shared/financial-engine.ts` line 271 (`breakEvenMonth: number | null`)

- **Year-end monthly projections for Chart 6:** `monthlyProjections` has 60 entries (months 1-60). Year-end months are indices 11, 23, 35, 47, 59 (i.e., month 12, 24, 36, 48, 60). Use `output.monthlyProjections[11]` for Year 1 end, `output.monthlyProjections[23]` for Year 2 end, etc. Always check the array length before indexing — assert `monthlyProjections.length === 60`.
  - Source: `shared/financial-engine.ts` line 157 (`MonthlyProjection.month: 1-60`)

- **Working Capital formula:** Working capital = `totalCurrentAssets - totalCurrentLiabilities`. Both fields exist on `MonthlyProjection` (lines 213, 215). The result can be negative (current liabilities exceed current assets) — this is a valid data state, not an error.
  - Source: `shared/financial-engine.ts` lines 213–215

- **Story 10.1 passes the UNMODIFIED saved plan inputs to `computeScenarioOutputs` — do NOT apply slider state to `PlanFinancialInputs` before calling it.** The `Base` scenario always reflects the user's saved plan as-is (epics 10.1 lines 2115, 2123). Slider percentage values influence the Conservative/Optimistic scenario factors applied *internally* within `computeScenarioOutputs` (or a Story 10.1 wrapper that replaces the static `CONSERVATIVE_*` / `OPTIMISTIC_*` constants with slider-derived values). Story 10.2a only consumes the resulting `ScenarioOutputs` prop — it does not touch slider state or plan inputs.
  - Source: `_bmad-output/planning-artifacts/epics.md` Story 10.1 line 2115 ("slider adjustments do NOT modify the user's actual plan"), line 2123 ("Base case always reflects the user's actual saved plan inputs — not slider-modified values")

- **`annualSummaries` has exactly 5 entries (index 0-4).** Do not assume more or fewer. Map over all 5 for year labels "Year 1" through "Year 5".

- **`ChartContainer` requires both a `config: ChartConfig` prop and a `className`.** Always pass `className="h-[220px] w-full"` or similar. Without a height class, the chart will collapse to 0px. Confirmed from `dashboard-charts.tsx` pattern (line 49).
  - Source: `client/src/components/planning/dashboard-charts.tsx` line 49

- **Conservative and Optimistic are computed from slider extremes, not fixed constants.** Per epics.md Story 10.1 (lines 2116, 2124): Conservative = base case inputs with each slider at its negative extreme; Optimistic = base case inputs with each slider at its positive extreme. The `CONSERVATIVE_*` / `OPTIMISTIC_*` constants in `scenario-engine.ts` are the current pre-Story-10.1 defaults — Story 10.1 will wire the actual slider range values into scenario computation. Story 10.2a charts always render from the current `ScenarioOutputs` prop — the computation source is Story 10.1's responsibility.
  - Source: `_bmad-output/planning-artifacts/epics.md` Story 10.1 line 2116 ("Conservative (negative slider extremes)"), line 2124 ("Conservative/Optimistic are computed by applying slider percentage multipliers to base case inputs")

- **Dark mode:** All chart colors use CSS variables which have dark-mode overrides in `index.css` (lines 139–143). No explicit dark mode handling needed in chart code — `ChartContainer` wraps in the CSS scope.

- **Chart 2 performance note:** 3 scenarios × 60 data points = 180 line segments. If animation causes jank on lower-end devices, consider downsampling to monthly averages per quarter for the line display while retaining full monthly data in tooltips.
