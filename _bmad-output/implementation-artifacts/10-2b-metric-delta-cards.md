# Story 10.2b: Metric Delta Cards & Dashboard Polish

Status: needs-revision

## Story

As a franchisee,
I want to see key metric cards that instantly summarize how my slider adjustments change my break-even, revenue, ROI, and cash position,
so that I can quickly grasp the impact without reading every chart in detail.

## Dependencies

- Story 10.2a (Sensitivity Chart Dashboard) must be complete before this story begins. The delta card strip is rendered within the same `SensitivityCharts` component (or as a sibling component within `WhatIfPlayground`) and relies on the chart dashboard layout being in place.

## Acceptance Criteria

### Key Metric Delta Cards

1. Given `SensitivityOutputs` are available, when the metric delta card strip renders (above the chart grid), then 4 key metric cards are displayed showing the impact of current slider adjustments vs. the base case:
    - **Break-Even**: "Mo 14 → Mo 18 (+4 mo)" — shows base case month vs. Your Scenario month. If either scenario's `breakEvenMonth` is `null` (break-even not reached in 60 months), display "—" for that value and "N/A" for the delta (e.g., "Mo 14 → —" or "— → —").
    - **Year 1 Revenue**: "$142K → $121K (-$21K)" — base vs Your Scenario
    - **5-Year ROI**: "127% → 98% (-29%)" — base vs Your Scenario `fiveYearROIPct` from `roiMetrics` (multiply by 100 to display as percentage)
    - **Year 5 Cash**: "$68K → $32K (-$36K)" — base vs Your Scenario `endingCash` at Year 5 (`annualSummaries[4].endingCash`)

    Delta color rules — color by **desirability**, not raw sign:
    - **Revenue, ROI, Cash** (higher = better): positive delta → green; negative delta → amber
    - **Break-Even** (lower month = better, so a positive delta means worse): positive delta → amber; negative delta → green
    - Null Break-Even deltas ("N/A") are rendered in muted/neutral color — not amber or green

2. Given the metric delta cards render on initial page load (before the user has interacted with any slider), when all sliders are at zero, then Your Scenario equals Base Case and deltas show zero/no change. A contextual note reads: "Move a slider to see how it changes your metrics." This note is visible on initial load and disappears after the user's first slider interaction.

### Visual Hierarchy

3. Given the delta card strip and chart grid are both rendered, then the delta card strip is the visual headline of the dashboard — it uses slightly larger type (e.g., `text-base font-semibold` for metric values vs. `text-sm` for chart titles) and a subtle background band (e.g., `bg-muted/30` or similar) to distinguish it from the chart grid below. The user's eye should land on the delta cards first, then explore the charts for detail.

### data-testid Coverage

4. Given the metric delta cards render, then they include:
    - `data-testid="sensitivity-metric-delta-break-even"` on the Break-Even metric delta card
    - `data-testid="sensitivity-metric-delta-revenue"` on the Revenue delta card
    - `data-testid="sensitivity-metric-delta-roi"` on the ROI delta card
    - `data-testid="sensitivity-metric-delta-cash"` on the Cash delta card
    - `data-testid="sensitivity-delta-helper-text"` on the initial contextual note

### Sandbox Invariant

5. Given I interact with the delta cards area, then no `PATCH /api/plans/:planId` request is sent — all computation is client-side sandbox-only.

## Dev Notes

### Architecture Patterns to Follow

- **Delta cards consume `SensitivityOutputs` as a prop — same as charts.** The delta card component is a pure presentational component. It receives `SensitivityOutputs` and derives its four metrics from `base` and `current` outputs. It does NOT call any engine functions.

- **Data sources for each delta metric:**
  - Break-Even: `output.roiMetrics.breakEvenMonth` (base vs current) — can be `null`
  - Year 1 Revenue: `output.annualSummaries[0].revenue` (base vs current) — in cents, divide by 100
  - 5-Year ROI: `output.roiMetrics.fiveYearROIPct` (base vs current) — decimal fraction, multiply by 100 for percentage display. Same convention as `roicExtended[].roicPct` — confirmed by `callout-bar.tsx` line 105 and `roic-tab.tsx` line 212.
  - Year 5 Cash: `output.annualSummaries[4].endingCash` (base vs current) — in cents, divide by 100

- **Helper text lifecycle:** The contextual note ("Move a slider to see how it changes your metrics") should be controlled by a state variable (e.g., `hasInteractedWithSlider`). This state should be lifted to `WhatIfPlayground` (10.1's component) and passed down as a prop. When any slider fires its first `onChange`, set the flag to `true` and the note disappears. This requires a minor interface addition to what Story 10.1 provides — coordinate with 10.1's component contract.

- **Formatting patterns:**
  - Dollar values: `$${Math.round(valueInCents / 100 / 1000)}K` for compact display
  - Percentage: `${(decimalFraction * 100).toFixed(0)}%`
  - Break-even month: `Mo ${month}` or "—" for null
  - Delta: `(+$21K)` or `(-$21K)` with sign

- **Memoize delta computations:** Wrap the 4 delta metric calculations in `useMemo` keyed on `SensitivityOutputs` to avoid recalculating on unrelated re-renders.

### UI/UX Deliverables

**Metric Delta Card Strip (above chart grid):**
- 4 metric delta cards in a horizontal row on desktop (4-column grid); 2×2 grid on tablet/mobile
- The strip has a subtle background band to elevate it visually above the charts
- Each card shows: metric name, base case value → arrow → Your Scenario value, delta in parentheses
- Delta coloring is desirability-based (per AC 1), not raw-sign-based
- On initial page load (sliders at zero): show prompt "Move a slider to see how it changes your metrics" — disappears after first slider interaction

**Responsive behavior:**
- Desktop (≥1024px): 4-column metric strip
- Tablet (768–1023px): 2×2 metric grid
- Mobile (<768px): 2×2 metric grid
- Desktop layout (≥1024px) is the primary acceptance target for automated e2e testing. Tablet and mobile layouts are verified by visual review during story QA.

### Anti-Patterns & Hard Constraints

- **DO NOT call `calculateProjections()` or any engine function inside the delta card component.** All engine computation belongs in `WhatIfPlayground` (10.1's domain). Delta cards are pure presentational.

- **DO NOT use red/destructive colors for negative deltas.** Negative deltas use amber (advisory), not red (error). Positive desirable deltas use green. This follows the Guardian advisory language.

- **DO NOT hardcode arbitrary hex or HSL color values.** Use CSS tokens and Tailwind utility classes (`text-amber-500`, `text-green-600`, `text-muted-foreground`) for delta coloring.

- **DO NOT add new API endpoints or server-side calls.** All data is derived from `SensitivityOutputs` in-memory.

- **DO NOT modify `vite.config.ts`, `server/vite.ts`, `package.json`, or `drizzle.config.ts`.** These are protected project files.

- **DO NOT add a Tasks/Subtasks section to this story file.** The dev agent plans its own implementation.

### Gotchas & Integration Warnings

- **`roiMetrics.fiveYearROIPct` is a decimal fraction**, not a percentage. Multiply by 100 for display: `(fiveYearROIPct * 100).toFixed(0) + "%"`. Same convention as `roicExtended[].roicPct`.

- **`roiMetrics.breakEvenMonth` can be `null`.** Both the base and current scenarios can independently be null. Handle all four combinations: both non-null, base null only, current null only, both null.

- **Currency values are in CENTS.** `annualSummaries[0].revenue` and `annualSummaries[4].endingCash` are in cents. Divide by 100 before formatting.

- **When sliders are at zero, Your Scenario equals Base Case.** Deltas show zero/no change. The helper text is an encouragement to explore.

- **`annualSummaries` has exactly 5 entries (index 0-4).** Year 1 Revenue = index 0, Year 5 Cash = index 4.

- **Dark mode:** Use Tailwind's `dark:` variants for any custom styling. CSS token colors (`--chart-*`, `--primary`) automatically adapt via `index.css` overrides.
