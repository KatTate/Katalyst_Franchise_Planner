# Story 5.7: Scenario Comparison

Status: ready-for-dev

## Story

As a franchisee,
I want to compare my base case against conservative and optimistic scenarios,
so that I can build conviction that my plan works even in a challenging environment (FR7d, F3).

## Acceptance Criteria

**Scenario Bar:**

1. Given I am viewing any Financial Statement tab in Reports, then a persistent Scenario Bar renders between the tab navigation and the statement content. It displays: "Viewing: Base Case" (with a filled circle indicator) and a "Compare Scenarios" button/dropdown trigger.

2. Given I click "Compare Scenarios" in the Scenario Bar, when the dropdown opens, then I see two quick scenario options: "Conservative" and "Optimistic", and a disabled "Create Custom Scenario" option with tooltip: "Custom scenarios coming in a future update" (deferred to Epic 10).

**Scenario Computation:**

3. Given I activate the Conservative scenario, then three variables are adjusted simultaneously from my base case inputs: Revenue -15%, COGS % +2 percentage points, and Operating Expenses +10%. All computed values (gross profit, EBITDA, pre-tax income, cash flow, ROIC, valuation) reflect these adjusted inputs through a full engine recalculation.

4. Given I activate the Optimistic scenario, then three variables are adjusted: Revenue +15%, COGS % -1 percentage point, and Operating Expenses -5%. All computed values reflect the adjusted inputs through a full engine recalculation.

5. Given the sensitivity factors for quick scenarios, then these factors are sourced from brand-level defaults when available (configurable by franchisor in brand configuration). If no brand-specific factors exist, the sensible defaults above are used. Scenarios are computed client-side by applying sensitivity multipliers to base case inputs — they do NOT persist to the database.

**Comparison View:**

6. Given I activate scenario comparison at the annual view (default), then each year column splits into 3 sub-columns: Base, Conservative, Optimistic (15 data columns total). Scenario columns are color-coded: Base (neutral/default), Conservative (muted warm tone), Optimistic (muted cool tone). This applies to all statement tabs that display columnar financial data (P&L, Balance Sheet, Cash Flow, Summary sections).

7. Given scenario comparison is active, then a comparison summary card appears above the table with precise language describing all three scenarios. The summary uses this pattern: "In the conservative scenario (15% lower revenue, higher costs), your business reaches break-even by Month [X] and generates $[Y] in Year 1 pre-tax income. Your base case projects $[Z], and the optimistic case projects $[W]." The language acknowledges this is a sensitivity analysis — it never says "Even in the conservative scenario..."

8. Given I deactivate scenario comparison (by clicking "Compare Scenarios" again or a "Close Comparison" action), then the view returns to the single Base Case column layout. The Scenario Bar reverts to "Viewing: Base Case".

**Drill-Down Interaction Constraint:**

9. Given scenario comparison is active at annual view, then year column headers lose their drill-down affordance (no expand cursor, no click-to-drill). A tooltip on year headers explains: "Collapse comparison to drill into year detail."

10. Given I had already drilled into a year (quarterly view) before activating comparison, then comparison shows 3 scenario columns per quarter for the expanded year, while other years show Base Case only as single annual columns.

11. Given I had drilled to monthly detail before activating comparison, then the system auto-collapses the monthly drill-down to quarterly for that year, activates comparison at quarterly level, and shows a brief toast: "Comparison view available at annual and quarterly levels."

12. Given scenario comparison is active, then the Expand All / Collapse All controls in the ColumnToolbar are disabled with a tooltip: "Deactivate comparison to drill down."

**ROIC and Valuation Tabs:**

13. Given scenario comparison is active and I view the ROIC or Valuation tab, then these annual-only tabs show 3 scenario columns per year (same as P&L annual comparison layout). Break-even month and cumulative ROIC values differ per scenario.

**Audit Tab:**

14. Given scenario comparison is active and I view the Audit tab, then the Audit tab shows base case checks only — scenario comparison does not apply to audit integrity checks (they would always pass since the engine is deterministic).

**Inline Editing During Comparison:**

15. Given scenario comparison is active and I click an input cell, then inline editing is available ONLY for the Base Case column. Conservative and Optimistic columns are read-only computed values. When I edit a base case input, all three scenario columns recalculate immediately.

**data-testid Coverage:**

16. Given the Scenario Bar renders, then it includes: `data-testid="scenario-bar"` on the container, `data-testid="text-scenario-active"` on the active scenario label, `data-testid="button-compare-scenarios"` on the comparison trigger, `data-testid="button-scenario-conservative"` and `data-testid="button-scenario-optimistic"` on the dropdown options, and `data-testid="card-scenario-summary"` on the comparison summary card.

## Dev Notes

### Architecture Patterns to Follow

- **Client-side computation (architecture.md):** Scenarios are computed entirely on the client by applying sensitivity multipliers to the base case `FinancialInputs`, then running `calculateProjections()` from `shared/financial-engine.ts`. The engine is pure — same inputs always produce same outputs. No server round-trip needed.
  - Source: `_bmad-output/planning-artifacts/architecture.md` → Financial Engine purity

- **Engine invocation pattern:** Import `calculateProjections` and `unwrapInputs` (or the equivalent unwrapping path used in `client/src/hooks/use-plan-outputs.ts`). Build modified `FinancialInputs` for each scenario by adjusting revenue, COGS%, and OpEx fields, then invoke `calculateProjections()` for each. Cache all three `EngineOutput` objects in component state.
  - Source: `shared/financial-engine.ts` → `calculateProjections(input: EngineInput): EngineOutput`

- **State management (architecture.md Decision 8):** Use local component state (`useState`) for scenario comparison mode (on/off) and cached scenario outputs. Scenario outputs are derived data — they don't go through React Query since they're never persisted. The base case `EngineOutput` comes from `usePlanOutputs` via React Query as today.
  - Source: `_bmad-output/planning-artifacts/architecture.md` → Decision 8: State Management

- **Number format rules (architecture.md):** Currency as cents (integers). Percentages as decimals (0.065 = 6.5%). The sensitivity model's "+2 percentage points to COGS%" means: if base COGS% is 0.30 (30%), conservative COGS% becomes 0.32 (32%). "+10% to OpEx" means: multiply each OpEx line item by 1.10. "-15% to Revenue" means: multiply `annualGrossSales` by 0.85.
  - Source: `_bmad-output/planning-artifacts/architecture.md` → Number Format Rules

- **Naming conventions:** Components: PascalCase. Files: kebab-case. Constants: SCREAMING_SNAKE_CASE. data-testid: `{action}-{target}` for interactive, `{type}-{content}` for display.
  - Source: `_bmad-output/planning-artifacts/architecture.md` → Naming Patterns

- **Color-coding approach:** Use CSS custom properties or semantic Tailwind classes for scenario column backgrounds. Base = no special background (default). Conservative = a warm muted tint (e.g., `bg-orange-50/50 dark:bg-orange-950/20`). Optimistic = a cool muted tint (e.g., `bg-blue-50/50 dark:bg-blue-950/20`). Keep column text colors unchanged — the background tint is the only visual distinction.
  - Source: `_bmad-output/planning-artifacts/ux-financial-statements-spec.md` → Part 4

### UI/UX Deliverables

- **Scenario Bar component:** A slim horizontal bar rendered between the tab strip and the CalloutBar in `FinancialStatements`. Contains the active scenario label, the "Compare Scenarios" dropdown trigger, and (when comparison is active) a "Close Comparison" action. Persistent across all tabs.

- **Comparison Summary Card:** A Card component rendered above the statement table content when comparison is active. Contains the natural-language summary comparing break-even months and Year 1 pre-tax income across all three scenarios. Updates reactively when base case inputs change.

- **Column layout transformation:** When comparison activates, the table header and data cells multiply — each year gets 3 sub-columns (Base/Cons/Opt). The `GroupedTableHead` from `column-manager.tsx` needs extension or a parallel comparison-aware header renderer. Each sub-column header shows a scenario label with a colored indicator dot.

- **UI states:**
  - Default: Scenario Bar shows "Viewing: Base Case" with Compare button. Tables show single-column-per-period layout.
  - Comparison Active: Scenario Bar shows "Comparing: Base / Conservative / Optimistic" with Close button. Tables show triple-column layout. Summary card visible. Drill-down controls disabled.
  - Loading/Computing: Brief loading indicator while scenario engine computations run (should be near-instant since engine is pure client-side JS, but provide a fallback).
  - Toast: When auto-collapsing monthly→quarterly on comparison activation.

- **Navigation:** User reaches this feature via Reports view → any tab → Scenario Bar. No new routes or pages.

### Anti-Patterns & Hard Constraints

- **DO NOT persist scenarios to the database.** Quick scenarios are ephemeral client-side computations. Custom scenario persistence is deferred to Epic 10 (`10-1-scenario-management-comparison`). The plan's `financialInputs` JSONB is never modified by scenario comparison.

- **DO NOT modify `shared/financial-engine.ts`** for scenario support. The engine already accepts `FinancialInputs` and produces `EngineOutput` — scenarios are built by constructing modified `FinancialInputs` objects and calling the same `calculateProjections()`. No engine changes needed.

- **DO NOT modify `components/ui/*`** — Shadcn-managed primitives are never modified.

- **DO NOT add custom hover/active styles on Buttons or Badges** — Built-in elevation handles this per universal design guidelines.

- **DO NOT create a separate "Scenarios" sidebar page.** The sidebar nav includes "Scenarios" as a future destination (per UX spec), but for Story 5.7 the scenario comparison lives entirely within the Reports view via the Scenario Bar. A sidebar "Scenarios" page is out of scope.

- **DO NOT attempt monthly-level comparison.** Per UX spec Part 4 Critique Issue #2, comparison is explicitly NOT available at monthly granularity. Auto-collapse to quarterly if user was at monthly.

- **DO NOT say "Even in the conservative scenario..."** in summary card text. The language must acknowledge this is a sensitivity analysis, not a guarantee.

- **Reuse existing code — DO NOT duplicate:**
  - `calculateProjections` from `shared/financial-engine.ts` — the engine entry point
  - `usePlanOutputs` hook — base case output fetching (already works)
  - `ColumnToolbar` and `GroupedTableHead` from `column-manager.tsx` — extend, don't recreate
  - `CalloutBar` from `callout-bar.tsx` — stays above scenario content
  - `StatementSection` from `statement-section.tsx` — table row rendering
  - `InlineEditableCell` from `inline-editable-cell.tsx` — editing (base case only during comparison)
  - Toast from `@/hooks/use-toast` — for the auto-collapse notification

### Gotchas & Integration Warnings

- **CRITICAL — Building FinancialInputs for scenarios:** The engine consumes `FinancialInputs` (raw numbers), not `PlanFinancialInputs` (metadata-wrapped). The current data flow is: plan's `financialInputs` (PlanFinancialInputs JSONB) → server-side `unwrapInputs()` → `FinancialInputs` → `calculateProjections()` → `EngineOutput`. For client-side scenario computation, the implementer must either:
  1. Implement a client-side version of `unwrapInputs()` that extracts raw numbers from `PlanFinancialInputs`, OR
  2. Use the already-computed base case `EngineOutput` values to reconstruct `FinancialInputs` from the first month's data, OR
  3. Check if `unwrapInputs()` is already exported from `shared/financial-engine.ts` or `shared/plan-initialization.ts` and available to the client.

  The implementer MUST trace the exact code path by reading the `usePlanOutputs` hook and the server route that computes outputs (likely `GET /api/plans/:id/outputs`) to understand how `FinancialInputs` is currently built. The scenario computation needs the SAME `FinancialInputs` that produced the base case, then applies sensitivity adjustments.

- **CRITICAL — Sensitivity factor application details:**
  - Revenue -15%: Multiply `financialInputs.revenue.annualGrossSales` by 0.85 (conservative) or 1.15 (optimistic).
  - COGS % +2pp: Add 0.02 to each element of `financialInputs.operatingCosts.cogsPct` array (conservative). Subtract 0.01 (optimistic). These are 5-element arrays for years 1-5.
  - Operating Expenses +10%: Multiply EACH of these by 1.10 (conservative) or 0.95 (optimistic):
    - `laborPct` array (each element × 1.10)
    - `facilitiesAnnual` array (each element × 1.10)
    - `managementSalariesAnnual` array (each element × 1.10)
    - `marketingPct` array (each element × 1.10)
    - `otherOpexPct` array (each element × 1.10)
    - `payrollTaxPct` is derived from labor + mgmt salaries, so its percentage stays the same (the dollar impact increases because the base amounts increase).
    - `royaltyPct` and `adFundPct` are franchise fees, NOT operating expenses — do NOT apply OpEx sensitivity to them.
  - All percentage adjustments must be clamped to valid ranges (0.0 to 1.0 for percentages).

- **CRITICAL — Startup costs and financing unchanged across scenarios.** Scenarios adjust only revenue and operating cost assumptions. `startupCosts`, `financing`, `workingCapitalAssumptions`, `distributions`, `taxRate`, and `ebitdaMultiple` remain identical to the base case. This is a sensitivity analysis of operations, not capital structure.

- **Column explosion management:** At annual view with comparison: 5 years × 3 scenarios = 15 data columns + 1 label column = 16 total. This is wide but manageable with horizontal scroll. The `statement-table.tsx` pattern with `min-w-[200px]` sticky label column and `overflow-x-auto` container handles this. Each scenario sub-column should be narrower than a standard year column (e.g., `min-w-[90px]` instead of `min-w-[100px]`).

- **GroupedTableHead complexity:** The current `GroupedTableHead` in `column-manager.tsx` creates header rows for year/quarter/month drill-down hierarchy. Adding scenario sub-columns introduces another grouping dimension. Options:
  1. Create a separate `ComparisonTableHead` component that renders the scenario-grouped headers when comparison is active, and use the existing `GroupedTableHead` when comparison is off.
  2. Extend `GroupedTableHead` to accept a `scenarioMode` prop and conditionally render scenario sub-columns.
  Option 1 is cleaner — the comparison header layout is fundamentally different (no drill-down interaction, additional sub-grouping).

- **Tab components need scenario awareness:** Currently, `PnlTab`, `BalanceSheetTab`, `CashFlowTab`, `SummaryTab`, `RoicTab`, and `ValuationTab` each receive a single `output: EngineOutput`. For comparison, they need access to three `EngineOutput` objects (base, conservative, optimistic). Threading approach:
  - `FinancialStatements` computes scenario outputs and passes `scenarioOutputs: { base: EngineOutput; conservative: EngineOutput; optimistic: EngineOutput } | null` to each tab.
  - When `scenarioOutputs` is null, tabs render as today (single column).
  - When `scenarioOutputs` is provided, tabs render triple-column layout.

- **Pre-Epic-7 linked columns during comparison:** All input values are currently shared across years. This means all 5 year columns in each scenario show the same sensitivity-adjusted values. While this is technically correct (it's the pre-Epic-7 behavior), the visual result is 15 columns showing very similar numbers. This is expected and acceptable — per-year variation arrives in Epic 7.

- **Break-even calculation per scenario:** The `EngineOutput.roiMetrics.breakEvenMonth` already returns the break-even month for any given set of inputs. Running `calculateProjections()` with conservative inputs will produce a different `breakEvenMonth` automatically. Use this value directly in the summary card.

- **Comparison summary card values:** The summary card needs:
  - Base case: `output.roiMetrics.breakEvenMonth`, `output.annualSummaries[0].preTaxIncome`
  - Conservative: `conservativeOutput.roiMetrics.breakEvenMonth`, `conservativeOutput.annualSummaries[0].preTaxIncome`
  - Optimistic: `optimisticOutput.roiMetrics.breakEvenMonth`, `optimisticOutput.annualSummaries[0].preTaxIncome`
  - Format currency values using the existing `formatCurrency` utility from `client/src/lib/format.ts` or `field-metadata.ts`.

- **Performance consideration:** Three `calculateProjections()` calls on the client. The engine processes 60 months per call — this should be sub-10ms per call on modern hardware. If there's any perceptible delay, wrap in `useMemo` keyed on the plan's `financialInputs` to avoid unnecessary recalculations.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/components/planning/statements/scenario-bar.tsx` | CREATE | Scenario Bar component: active scenario display, Compare dropdown, Close button. ~120 lines. |
| `client/src/components/planning/statements/scenario-summary-card.tsx` | CREATE | Comparison summary Card with natural-language text comparing break-even and Year 1 pre-tax income across scenarios. ~80 lines. |
| `client/src/components/planning/statements/scenario-engine.ts` | CREATE | Client-side scenario computation utility: takes base `PlanFinancialInputs` (or `FinancialInputs` + `StartupCostLineItem[]`), applies sensitivity factors, returns three `EngineOutput` objects. ~100 lines. |
| `client/src/components/planning/statements/comparison-table-head.tsx` | CREATE | Alternative table header renderer for comparison mode: year groups with scenario sub-columns (Base/Cons/Opt). No drill-down interaction. ~120 lines. |
| `client/src/components/planning/financial-statements.tsx` | MODIFY | Add Scenario Bar between tabs and CalloutBar. Manage comparison state (on/off, scenario outputs). Pass `scenarioOutputs` prop to tab components. Compute scenarios using `scenario-engine.ts`. |
| `client/src/components/planning/statements/column-manager.tsx` | MODIFY | Disable drill-down controls when comparison is active. Add `comparisonActive` prop to `ColumnToolbar` to disable Expand/Collapse buttons. |
| `client/src/components/planning/statements/pnl-tab.tsx` | MODIFY | Accept optional `scenarioOutputs` prop. When provided, render triple-column layout per year with scenario sub-columns. Color-code scenario columns. Use `ComparisonTableHead`. Input cells editable only in Base column. |
| `client/src/components/planning/statements/balance-sheet-tab.tsx` | MODIFY | Accept optional `scenarioOutputs` prop. Render triple-column layout when comparison active. |
| `client/src/components/planning/statements/cash-flow-tab.tsx` | MODIFY | Accept optional `scenarioOutputs` prop. Render triple-column layout when comparison active. |
| `client/src/components/planning/statements/summary-tab.tsx` | MODIFY | Accept optional `scenarioOutputs` prop. Show comparison values in summary sections when active. |
| `client/src/components/planning/statements/roic-tab.tsx` | MODIFY | Accept optional `scenarioOutputs` prop. Render triple-column comparison (annual only). |
| `client/src/components/planning/statements/valuation-tab.tsx` | MODIFY | Accept optional `scenarioOutputs` prop. Render triple-column comparison (annual only). |
| `client/src/components/planning/statements/audit-tab.tsx` | MODIFY | When comparison is active, show base case checks only (no scenario columns for audit). |
| `client/src/components/planning/statements/statement-section.tsx` | MODIFY | Accept optional `scenarioOutputs` and `comparisonActive` flag. When active, render 3 cells per period instead of 1, with appropriate color-coding. |
| `shared/schema.ts` | MODIFY | Add optional `scenarioSensitivityFactors` field to `brandParameterSchema` for brand-configurable scenario sensitivity defaults. |

### Dependencies & Environment Variables

- **No new packages needed.** All required utilities exist: `calculateProjections` (engine), `formatCurrency` (formatting), toast hook, Shadcn Card/Button/Dropdown components, Lucide icons.
- **No new environment variables needed.**
- **Existing packages used:** `lucide-react` (GitCompare or Layers icon for Scenario Bar), Shadcn `DropdownMenu` components for scenario selection.

### Testing Expectations

- **Playwright e2e tests (run_test):**
  - Navigate to Reports → any tab → verify Scenario Bar shows "Viewing: Base Case"
  - Click "Compare Scenarios" → verify dropdown shows Conservative/Optimistic options and disabled Custom option
  - Activate comparison → verify table splits into triple-column layout with colored scenario columns
  - Verify comparison summary card appears with scenario-specific values
  - Verify drill-down is disabled during comparison (year headers not clickable)
  - Deactivate comparison → verify single-column layout returns
  - Navigate to ROIC and Valuation tabs during comparison → verify triple columns render
  - Navigate to Audit tab during comparison → verify no scenario columns
  - Edit base case input during comparison → verify all three scenario columns update

- **Critical ACs requiring test coverage:** AC1 (Scenario Bar presence), AC6 (triple-column activation), AC7 (summary card content), AC9 (drill-down disabled), AC8 (deactivation), AC15 (editing during comparison)

### References

- [Source: `_bmad-output/planning-artifacts/ux-financial-statements-spec.md` → Part 4: Scenario Comparison] — Full UX design for scenario bar, comparison view, drill-down constraints, sensitivity model, summary card language
- [Source: `_bmad-output/planning-artifacts/epics.md` → Story 5.7: Scenario Comparison] — User story, acceptance criteria, dev notes
- [Source: `_bmad-output/planning-artifacts/architecture.md` → Financial Engine purity] — Engine as pure shared module, client-side invocation for live preview
- [Source: `_bmad-output/planning-artifacts/architecture.md` → Decision 8: State Management] — React Query for server state, local state for derived/ephemeral data
- [Source: `_bmad-output/planning-artifacts/architecture.md` → Number Format Rules] — Currency as cents, percentages as decimals
- [Source: `shared/financial-engine.ts` → lines 70-135] — `FinancialInputs` interface with per-year arrays for COGS%, labor%, OpEx% etc.
- [Source: `shared/financial-engine.ts` → line 376] — `calculateProjections(input: EngineInput): EngineOutput` entry point
- [Source: `shared/financial-engine.ts` → lines 150-153] — `EngineInput` interface (financialInputs + startupCosts)
- [Source: `client/src/components/planning/financial-statements.tsx`] — Container component managing tabs, output fetching, inline editing
- [Source: `client/src/components/planning/statements/column-manager.tsx`] — Drill-down state, `GroupedTableHead`, `ColumnToolbar`, value accessors
- [Source: `client/src/components/planning/statements/pnl-tab.tsx`] — P&L tab with inline editing support (Story 5.6)
- [Source: `_bmad-output/implementation-artifacts/5-6-quick-entry-input-output-integration.md`] — Previous story patterns for inline editing, field mapping, prop threading
- [Source: `_bmad-output/planning-artifacts/ux-financial-statements-spec.md` → Part 4, Critique Issue #2] — Column explosion constraint: comparison locks drill-down

## Dev Agent Record

### Agent Model Used

### Completion Notes

### File List

### Testing Summary
