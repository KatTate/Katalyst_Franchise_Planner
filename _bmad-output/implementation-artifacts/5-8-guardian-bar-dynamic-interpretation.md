# Story 5.8: Guardian Bar & Dynamic Interpretation

Status: ready-for-dev

## Story

As a franchisee,
I want persistent at-a-glance feedback on my plan's health and contextual interpretation of every key metric,
so that every decision I make is informed by its financial impact (FR7d).

## Acceptance Criteria

**Guardian Bar:**

1. Given I am viewing any Financial Statement tab, when the Guardian Bar renders (persistent slim bar above the tabs, below the workspace header), then three indicators are shown: Break-even (month and calendar date), 5yr ROI (percentage), Cash Position (status). Each indicator uses BOTH a color AND a distinct icon shape: Healthy = Green + Checkmark, Attention = Amber + Alert Triangle, Concerning = Gurple + Info Circle. The color/icon system is NOT a red/yellow/green traffic light — Gurple (advisory purple) is used for "concerning," NOT destructive red. Each indicator always includes the specific value in text ("5yr ROI: 127%") — the color/icon is supplementary, not the primary information channel.

2. Given the Guardian threshold configuration, when thresholds are evaluated, then default thresholds are: Break-even: Healthy ≤ 18 months, Attention 18-30 months, Concerning > 30 months; 5-Year ROI: Healthy ≥ 100%, Attention 50-100%, Concerning < 50%; Cash Position: Healthy = never negative, Attention = negative ≤ 3 months, Concerning = negative > 3 months. Thresholds use brand-specific defaults when configured (future Epic 8). For MVP, sensible defaults above are used.

3. Given I click a Guardian indicator, when the system responds, then I am navigated to the relevant financial statement tab and scrolled to the relevant row: Break-even → Summary tab break-even section, Cash → Cash Flow tab, 5yr ROI → ROIC tab.

4. Given I am in Quick Entry mode and edit an input cell, when the engine recalculates, then the Guardian Bar updates in real time reflecting the new computation. If a Guardian indicator changes threshold level (e.g., green → amber), the indicator animates briefly to draw attention.

5. Given the entire plan is at brand defaults (no user customization), when the Guardian Bar renders, then it shows a special note: "These projections use [Brand] default values. Customize your inputs in My Plan for projections based on your specific situation."

**Dynamic Interpretation — Type 1 (Callout Bar per-tab metrics):**

6. Given I am viewing a Financial Statement tab, when the CalloutBar renders, then it displays tab-specific key metrics with a plain-language impact statement:
   - Summary: "Your 5-year total pre-tax income: $X. Break-even: Month Y (that's [Month, Year])."
   - P&L: "Year 1 pre-tax margin: X%. [Above/within/below typical range for [Brand]]"
   - Balance Sheet: "Debt-to-equity ratio: X:1 by Year 3. [Lenders typically look for below 3:1]"
   - Cash Flow: "Lowest cash point: $X in Month Y. [You'll need at least $X in reserves]"
   - ROIC: "5-year return on invested capital: X%. Break-even on investment: Month Y."
   - Valuation: "Estimated business value at Year 5: $X based on Xa EBITDA multiple."
   - Audit: "X of 13 checks passing. [List failures with plain-language explanation]"

**Dynamic Interpretation — Type 2 (Row-Level Interpretation):**

7. Given a key computed row renders in P&L, Balance Sheet, or Cash Flow tabs, when interpretation data is available, then an interpretation row appears below it with contextual "so what" text using brand benchmarks: "XX% — within [Brand] typical range ([low]-[high]%)". Benchmarks come ONLY from brand defaults configured by the franchisor — never from universal databases. If no brand benchmark exists, the interpretation shows only the percentage/ratio without benchmark context.

8. Given I am in Quick Entry mode and edit an input cell, when the engine recalculates, then interpretation rows update in real time reflecting the new computed values.

**Dynamic Interpretation — Type 3 (Hover Tooltips):**

9. Given I hover over a computed cell in any statement tab, when the tooltip renders, then it shows a plain-language explanation of what the value means, the calculation formula used, and a "View in Glossary" link (placeholder for Story 5.10).

**Guardian Bar visibility:**

10. Given the Guardian Bar has rendered, when the user is on any tab (including during scenario comparison), then the Guardian Bar remains persistently visible — it is always shown when the plan has custom inputs.

**data-testid coverage:**

11. Given the Guardian Bar renders, then it includes: `data-testid="guardian-bar"` on the container, `data-testid="guardian-indicator-break-even"`, `data-testid="guardian-indicator-roi"`, `data-testid="guardian-indicator-cash"` on each indicator, `data-testid="guardian-defaults-note"` on the all-defaults message.

12. Given the CalloutBar renders per-tab content, then it includes: `data-testid="callout-bar"` on the container, `data-testid="callout-interpretation"` on the interpretation text.

13. Given an interpretation row renders, then it includes: `data-testid="interpretation-row-{rowKey}"` on each interpretation row.

## Dev Notes

### Architecture Patterns to Follow

- **Existing Guardian implementation:** `client/src/lib/guardian-engine.ts` and `client/src/components/planning/statements/guardian-bar.tsx` already implement the core Guardian Bar — the computation engine (`computeGuardianState`), threshold logic, `isAllDefaults` detection, and the visual bar with color+icon indicators. These files were created prematurely but are architecturally sound. Story 5.8 validates, enhances, and integrates them fully.
  - Source: `client/src/lib/guardian-engine.ts` → `computeGuardianState()`, `isAllDefaults()`
  - Source: `client/src/components/planning/statements/guardian-bar.tsx` → `GuardianBar`, `GuardianIndicatorItem`

- **Guardian integration in container:** The `FinancialStatements` component at `client/src/components/planning/financial-statements.tsx` already imports and renders `<GuardianBar>` at lines 214-218, positioned above the `<Tabs>` component. It uses `useMemo` to compute `guardianState` from `output`, `financialInputs`, and `startupCosts`.
  - Source: `client/src/components/planning/financial-statements.tsx` → lines 77-80, 214-218

- **Brand default metadata access:** `PlanFinancialInputs` (from `shared/financial-engine.ts`) wraps each field in `FinancialFieldValue` which contains `brandDefault: number | null` and `item7Range: { min: number; max: number } | null`. This is the authoritative source for benchmark comparisons in interpretation rows. The `isCustom` boolean and `source` field indicate whether a value has been customized.
  - Source: `shared/financial-engine.ts` → `FinancialFieldValue` interface (lines 25-32)
  - Source: `shared/financial-engine.ts` → `PlanFinancialInputs` interface (lines 37-65)

- **CalloutBar existing pattern:** `client/src/components/planning/statements/callout-bar.tsx` currently renders a single Summary-style callout with `formatCents`, `formatROI`, `formatBreakEven`. For per-tab callouts, the approach is to make CalloutBar accept the active tab ID and EngineOutput, then render tab-specific content. The existing `CalloutBar` already has the visual skeleton — it needs content variation by tab.
  - Source: `client/src/components/planning/statements/callout-bar.tsx`

- **Color system:** Guardian uses three semantic colors (NOT traffic light): `guardian-healthy` (green/success), `guardian-attention` (amber/warning), `guardian-concerning` (Gurple/advisory — hex `#A9A2AA`). These custom Tailwind colors must be defined in `tailwind.config.ts` and `index.css` as CSS variables if not already present. The "concerning" level uses Gurple (Katalyst's advisory purple), NOT destructive red.
  - Source: UX spec Part 6, Part 12, Part 17

- **State management (architecture.md Decision 8):** Guardian state is derived from `EngineOutput` via `useMemo` — no server persistence. Interpretation content is computed from `EngineOutput` + `PlanFinancialInputs` metadata. Both update reactively when the plan is recalculated.
  - Source: `_bmad-output/planning-artifacts/architecture.md` → Decision 8

- **Number format rules:** Currency stored as cents (integers). Percentages as decimals (0.065 = 6.5%). Use `formatCents()` from `client/src/lib/format-currency.ts` for currency display. ROI percentages multiply by 100 for display.
  - Source: `_bmad-output/planning-artifacts/architecture.md` → Number Format Rules

### UI/UX Deliverables

- **Guardian Bar (already exists — validate and enhance):** A persistent, slim bar at the top of the Financial Statements container (above tabs, below workspace header). Three indicators: Break-even, 5yr ROI, Cash Position. Each shows value in text + color + icon. Clicking navigates to the relevant tab. All-defaults note appears when no inputs are customized. Animation on threshold level change (CSS transition with brief scale/highlight pulse).

- **Per-Tab CalloutBar content:** The existing CalloutBar component is extended to accept the active tab ID and render tab-specific interpretation text. Each tab gets a unique callout sentence drawing from the EngineOutput:
  - Summary tab: Total 5yr pre-tax income, break-even month with calendar date
  - P&L tab: Year 1 pre-tax margin percentage with brand benchmark comparison
  - Balance Sheet tab: Debt-to-equity ratio by Year 3 with lender guidance
  - Cash Flow tab: Lowest cash point (month and amount) with reserve guidance
  - ROIC tab: 5-year cumulative ROIC percentage and break-even month
  - Valuation tab: Estimated Year 5 business value based on EBITDA multiple
  - Audit tab: Pass/fail count with plain-language failure descriptions

- **Interpretation rows (Type 2):** A new `InterpretationRow` component rendered below key computed data rows. Visually subtle — uses `text-xs text-muted-foreground` with a left indent or arrow prefix ("→"). Linked to parent row via `aria-describedby`. Key rows that get interpretation:
  - P&L: Pre-Tax Income row (margin as % of revenue, compared to brand range)
  - P&L: COGS row (COGS % compared to brand default)
  - P&L: Labor row (labor % compared to brand default)
  - Balance Sheet: Total Equity row (equity position context)
  - Cash Flow: Ending Cash row in months where cash is negative

- **Hover tooltips (Type 3):** On key computed cells (pre-tax income, EBITDA, gross profit, etc.), a tooltip on hover shows: (a) plain-language meaning, (b) the formula used to compute it, (c) a "View in Glossary" link placeholder (disabled until Story 5.10). Use Shadcn `<Tooltip>` component. These tooltips are additive — they don't replace existing cell content.

- **UI states:**
  - Guardian Bar hidden: When `guardianState.allDefaults` is true AND the user hasn't customized any inputs — per UX spec Part 14. However, current implementation already shows it but with the defaults note. **Clarification per UX spec**: The Guardian Bar IS shown even at all-defaults, but with the advisory note. The indicators still display values (brand default projections are valid numbers).
  - Animation: When a threshold level changes (e.g., from `healthy` to `attention`), the indicator briefly pulses using CSS `@keyframes` — a scale(1.05) + box-shadow highlight that fades over 600ms. Track previous level in a `useRef` to detect changes.
  - Interpretation rows during scenario comparison: Interpretation rows are HIDDEN during scenario comparison (comparison summary card replaces this function). When comparison deactivates, interpretation rows return.

### Anti-Patterns & Hard Constraints

- **DO NOT use red for the "concerning" Guardian level.** The design system explicitly uses Gurple (`#A9A2AA`) for advisory/concerning states. Red (`--destructive`) is reserved for actual errors only (missing required fields, system failures, validation errors). This is a firm UX design principle, not a suggestion.

- **DO NOT create universal benchmarks.** All benchmark comparisons in interpretation rows come ONLY from the brand's `FinancialFieldValue.brandDefault` and `item7Range` fields. If no brand benchmark exists for a given metric, the interpretation shows the ratio/percentage without comparative context. Never hardcode industry benchmarks.

- **DO NOT modify `shared/financial-engine.ts`** for interpretation content. The engine computes raw numbers; interpretation text is purely a UI concern assembled in React components from `EngineOutput` data + `PlanFinancialInputs` metadata.

- **DO NOT modify `components/ui/*`** — Shadcn-managed primitives are never modified.

- **DO NOT add custom hover/active styles on Buttons or Badges** — Built-in elevation handles this per universal design guidelines.

- **DO NOT modify `shared/schema.ts`** — No new database columns or tables needed.

- **DO NOT use `text-primary` for body text** — per design guidelines, `text-primary` is reserved for special branding contexts. Use `text-foreground`, `text-muted-foreground`, etc.

- **Reuse existing code — DO NOT duplicate:**
  - `computeGuardianState` from `client/src/lib/guardian-engine.ts` — Guardian computation
  - `isAllDefaults` from `client/src/lib/guardian-engine.ts` — brand defaults detection
  - `GuardianBar` from `client/src/components/planning/statements/guardian-bar.tsx` — Guardian visual component
  - `CalloutBar` from `client/src/components/planning/statements/callout-bar.tsx` — extend, don't recreate
  - `formatCents` from `client/src/lib/format-currency.ts` — currency formatting
  - `formatROI`, `formatBreakEven` from `client/src/components/shared/summary-metrics` — metric formatting
  - Toast from `@/hooks/use-toast` — for notifications

### Gotchas & Integration Warnings

- **CRITICAL — Guardian Bar visibility logic:** The current implementation (`financial-statements.tsx` line 214) conditionally renders `<GuardianBar>` with `{guardianState && !guardianState.allDefaults && ...}`. This HIDES the Guardian when all inputs are at defaults. Per UX spec Part 14, the Guardian IS shown at all-defaults but with the advisory note. **Fix:** Change the condition to `{guardianState && ...}` (remove `!guardianState.allDefaults`). The `GuardianBar` component already renders the all-defaults note internally.

- **CRITICAL — CalloutBar currently only renders for Summary context.** It must be enhanced to accept `activeTab: StatementTabId` and `output: EngineOutput` props, then render tab-specific content. The existing `annualSummaries` and `roiMetrics` props may be replaced with a single `output` prop for richer access to all statement data.

- **CRITICAL — Per-tab callout metric computations:**
  - P&L margin: `output.annualSummaries[0].preTaxIncome / output.annualSummaries[0].revenue * 100` (Year 1 pre-tax margin %)
  - Balance Sheet D/E ratio: `output.annualSummaries[2].totalDebt / output.annualSummaries[2].totalEquity` (Year 3 debt-to-equity)
  - Cash Flow lowest point: Iterate `output.monthlyProjections` to find the month with the lowest `endingCash`. Report the amount and month number.
  - ROIC: `output.roiMetrics.fiveYearROIPct` and `output.roiMetrics.breakEvenMonth`
  - Valuation: `output.annualSummaries[4].ebitda * output.annualSummaries[4].ebitdaMultiple` (Year 5 business value) — **WARNING:** Verify that `ebitdaMultiple` is available on `AnnualSummary`. If not, it may be on `EngineOutput` directly or computed separately.
  - Audit: Count passing/failing checks from `output.auditChecks` array — **WARNING:** Verify `auditChecks` exists on `EngineOutput`. If audit data is structured differently, adapt accordingly.

- **CRITICAL — Brand benchmark access for interpretation rows:** For P&L interpretation rows comparing COGS%, Labor%, etc. to brand ranges, access `financialInputs.operatingCosts.cogsPct.brandDefault` and `.item7Range` for the brand's typical range. Format as: "30% — within PostNet typical range (28-32%)". If `brandDefault` is null, show only "30%" without benchmark text.

- **Interpretation rows and scenario comparison:** When `scenarioOutputs` is active (comparison mode), interpretation rows should be hidden. The comparison summary card already provides scenario-specific context. Render interpretation rows only when `!comparisonActive`.

- **Guardian animation on threshold change:** Track previous indicator levels in a `useRef<Record<string, GuardianLevel>>`. On each render, compare current levels to previous. If any level changed, apply a CSS class (`guardian-pulse`) for 600ms, then remove it. The CSS animation: `@keyframes guardian-pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); box-shadow: 0 0 8px var(--guardian-color); } 100% { transform: scale(1); } }`.

- **CalloutBar hidden during comparison:** The existing `{!comparisonActive && <CalloutBar ... />}` logic in `financial-statements.tsx` (line 273) already handles this correctly. No change needed for this condition.

- **EngineOutput field availability check:** Before writing callout content, verify these fields exist on `EngineOutput`:
  - `annualSummaries[].preTaxIncome` — confirmed (used in existing callout)
  - `annualSummaries[].revenue` — confirmed (used in P&L tab)
  - `annualSummaries[].totalDebt` — check if this field exists for Balance Sheet D/E ratio
  - `annualSummaries[].totalEquity` — check if this field exists
  - `annualSummaries[].ebitda` — likely exists (used in valuation tab)
  - `monthlyProjections[].endingCash` — confirmed (used in guardian-engine)
  - `roiMetrics.breakEvenMonth` — confirmed
  - `roiMetrics.fiveYearROIPct` — confirmed
  - If any field is missing, the callout for that tab should gracefully degrade to a simpler message using only available fields.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/lib/guardian-engine.ts` | VALIDATE | Already exists. Verify thresholds match AC2. Add `previousLevels` tracking support (export a helper or keep in component). ~135 lines, no structural changes expected. |
| `client/src/components/planning/statements/guardian-bar.tsx` | MODIFY | Add CSS animation for threshold changes (guardian-pulse class). Add `previousLevels` ref for change detection. Enhance tooltip content. ~103 lines → ~130 lines. |
| `client/src/components/planning/statements/callout-bar.tsx` | MODIFY | Accept `activeTab` and full `output` props. Render tab-specific callout content with per-tab interpretation text. Accept `financialInputs` for brand benchmark access. ~88 lines → ~180 lines. |
| `client/src/components/planning/statements/interpretation-row.tsx` | CREATE | InterpretationRow component: renders subtle "so what" text below key computed rows. Accepts metric value, brand benchmark data, and generates contextual text. `role="note"` with `aria-describedby`. ~60 lines. |
| `client/src/components/planning/financial-statements.tsx` | MODIFY | Remove `!guardianState.allDefaults` condition to always show Guardian. Pass `activeTab` and `financialInputs` to CalloutBar. Pass `financialInputs` and `comparisonActive` to tab components for interpretation rows. ~331 lines, ~10 line changes. |
| `client/src/components/planning/statements/pnl-tab.tsx` | MODIFY | Add InterpretationRow components below Pre-Tax Income, COGS, and Labor rows. Accept `financialInputs` and `comparisonActive` props. Wrap interpretations in `{!comparisonActive && ...}`. |
| `client/src/components/planning/statements/balance-sheet-tab.tsx` | MODIFY | Add InterpretationRow below Total Equity row. Accept additional props for interpretation. |
| `client/src/components/planning/statements/cash-flow-tab.tsx` | MODIFY | Add InterpretationRow below Ending Cash rows where cash is negative. Accept additional props. |
| `client/src/index.css` | MODIFY | Add `guardian-healthy`, `guardian-attention`, `guardian-concerning` CSS custom properties if not already defined. Add `@keyframes guardian-pulse` animation. |
| `tailwind.config.ts` | MODIFY | Add guardian color tokens mapping to CSS custom properties if not already present. |

### Dependencies & Environment Variables

- **No new packages needed.** All required utilities exist: `formatCents` (currency formatting), `formatROI`/`formatBreakEven` (metric formatting), Shadcn `Tooltip` components, Lucide icons (`CheckCircle`, `AlertTriangle`, `Info`).
- **No new environment variables needed.**
- **No database changes needed.**

### Testing Expectations

- **Playwright e2e tests (run_test):**
  - Navigate to Reports → verify Guardian Bar is visible with three indicators
  - Verify each indicator shows a value (Break-even month, ROI %, Cash status)
  - Verify indicator colors correspond to threshold levels
  - Click Break-even indicator → verify navigation to Summary/ROIC tab
  - Click Cash indicator → verify navigation to Cash Flow tab
  - Click 5yr ROI indicator → verify navigation to ROIC tab
  - Verify CalloutBar shows Summary-specific text on Summary tab
  - Switch to P&L tab → verify callout content changes to P&L-specific text
  - Switch to Cash Flow tab → verify callout content changes
  - Verify interpretation rows appear below key P&L rows (Pre-Tax Income)
  - Verify interpretation text includes brand benchmark when available
  - Activate scenario comparison → verify interpretation rows are hidden
  - Deactivate comparison → verify interpretation rows return
  - Verify data-testid attributes on Guardian Bar, indicators, callout, interpretation rows

- **Critical ACs requiring test coverage:** AC1 (Guardian presence and content), AC3 (click navigation), AC5 (all-defaults note), AC6 (per-tab callout), AC7 (interpretation rows), AC11-13 (data-testid)

### References

- [Source: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` → Part 12: Guardian Bar + Dynamic Interpretation] — ROI Threshold Guardian design, threshold tables, interpretation types, callout bar content per tab, row-level interpretation format
- [Source: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` → Part 6: Design System] — Color system (Gurple = `#A9A2AA`), semantic core colors, advisory color governance
- [Source: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` → Part 14: Empty + Incomplete States] — Guardian all-defaults note, per-cell BD indicators
- [Source: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` → Part 17: Accessibility] — Guardian ARIA roles (`role="status"`, `aria-live="polite"`), interpretation row `role="note"` with `aria-describedby`, non-color indicators
- [Source: `_bmad-output/planning-artifacts/epics.md` → Story 5.8: Guardian Bar & Dynamic Interpretation] — User story, acceptance criteria, dev notes
- [Source: `_bmad-output/planning-artifacts/architecture.md` → Decision 8: State Management] — React Query for server state, local state for derived data
- [Source: `_bmad-output/planning-artifacts/architecture.md` → Number Format Rules] — Currency as cents, percentages as decimals
- [Source: `shared/financial-engine.ts` → lines 25-32] — `FinancialFieldValue` interface (brandDefault, item7Range, isCustom)
- [Source: `shared/financial-engine.ts` → lines 37-65] — `PlanFinancialInputs` interface (field metadata for benchmark access)
- [Source: `client/src/lib/guardian-engine.ts`] — Existing Guardian computation: `computeGuardianState()`, `isAllDefaults()`, threshold constants
- [Source: `client/src/components/planning/statements/guardian-bar.tsx`] — Existing Guardian Bar visual component
- [Source: `client/src/components/planning/statements/callout-bar.tsx`] — Existing CalloutBar with Summary-only content
- [Source: `client/src/components/planning/financial-statements.tsx`] — Container component managing tabs, Guardian rendering, scenario integration
- [Source: `_bmad-output/implementation-artifacts/5-7-scenario-comparison.md`] — Previous story patterns for scenario comparison, prop threading, CalloutBar hiding during comparison

## Dev Agent Record

### Agent Model Used

### Completion Notes

### File List

### Testing Summary
