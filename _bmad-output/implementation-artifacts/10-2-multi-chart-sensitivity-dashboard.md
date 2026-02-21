# Story 10.2: Multi-Chart Sensitivity Dashboard

**Status: SUPERSEDED**

> This story has been split into two smaller stories following a Party Mode team review (2026-02-21). The recommendations addressed story size, testability, UX clarity, error handling, and color constant management.
>
> **Replacement stories:**
> - **[10-2a] Sensitivity Chart Dashboard** (`10-2a-sensitivity-chart-dashboard.md`) — 6 charts, error boundary, performance AC, human-friendly titles
> - **[10-2b] Metric Delta Cards & Dashboard Polish** (`10-2b-metric-delta-cards.md`) — 4 delta metric cards, visual hierarchy, helper text lifecycle
>
> **Key changes applied from team review:**
> 1. Split into 10.2a (charts) and 10.2b (delta cards) to reduce scope risk
> 2. Added error boundary AC for engine failures / malformed data
> 3. Specified helper text lifecycle — disappears after first slider interaction
> 4. Replaced hardcoded HSL values in ACs with runtime `SCENARIO_COLORS` references
> 5. Rephrased AC 2 for testability — "same React commit cycle" instead of "≤ 300ms animation"
> 6. Added `data-testid` on Chart 1 tooltip content and error boundary
> 7. Added measurable performance AC (500ms at 4x CPU throttle)
> 8. Human-friendly chart titles with technical subtitles (e.g., "Am I Making Money?" / *Profitability*)
> 9. Chart 2 amber zone contextual annotation for user guidance
> 10. Scoped responsive testing — desktop is primary e2e target; tablet/mobile verified visually
> 11. Visual hierarchy guidance — delta cards as "headline," charts as "supporting detail"
>
> **Do not implement from this file. Use 10-2a and 10-2b instead.**
