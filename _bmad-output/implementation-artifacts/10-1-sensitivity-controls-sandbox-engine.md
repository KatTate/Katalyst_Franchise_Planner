# Story 10.1: Sensitivity Controls & Sandbox Engine

Status: needs-revision

> **Revised per SCP-2026-02-21:** Conservative/Optimistic system-defined columns removed. Now shows Base Case vs Your Scenario (user's live slider state). Slider ranges widened (±50%/±100% visual, uncapped numeric). Reset button added.

## Story

As a franchisee,
I want to navigate to a standalone What-If Playground and adjust assumption sliders to see how my plan responds to changing conditions,
So that I can explore "what-if" scenarios of my own design — without modifying my actual plan.

## Acceptance Criteria

**Given** I have a plan with financial inputs and am on the planning workspace
**When** I click the "Scenarios" sidebar navigation item (data-testid="nav-scenarios")
**Then** I see the What-If Playground view replace the main content area

**Given** I am on the What-If Playground view
**When** the page renders
**Then** a page header is visible with the text: "What happens to my WHOLE business if things change?"
**And** a Sensitivity Controls panel is displayed with sliders for five assumptions:
  - Revenue adjustment: visual range -50% to +100%, step 5%
  - COGS adjustment: visual range -20pp to +20pp, step 1pp
  - Payroll/Labor adjustment: visual range -50% to +100%, step 5%
  - Marketing adjustment: visual range -50% to +100%, step 5%
  - Facilities adjustment: visual range -50% to +100%, step 5%
**And** sliders have practical visual ranges (above) but numeric input fields accept any value within mathematical limits (revenue ≥ -100%, percentages clamped by engine's clamp01())
**And** each slider shows its current percentage adjustment (e.g., "+8%" or "-5%")
**And** each slider shows the resulting annual dollar impact (e.g., "Revenue: +8% → +$24,000/yr")
**And** numeric input fields accompany each slider for precise entry

**Given** I am viewing the What-If Playground with sliders at default positions (all zero)
**When** the engine computes scenarios
**Then** two scenarios are computed client-side: Base Case (saved plan inputs, unmodified) and Your Scenario (base inputs with current slider adjustments applied). When sliders are at zero, Your Scenario = Base Case (engine skips the second run).
**And** key metric cards are displayed showing Base Case vs Your Scenario values for: Break-Even Month, 5-Year ROI %, Year-1 Revenue, Year-1 EBITDA, and Year-1 Pre-Tax Income
**And** each metric card shows two columns (Base Case + Your Scenario) with delta indicators vs. Base Case
**And** a "Reset Sliders" button is visible when any slider is non-zero, returning all sliders to 0%
**And** helper text reads: "Move a slider to see how it changes your metrics" (when sliders are at zero)

**Given** I adjust any slider value
**When** the slider moves
**Then** the dollar impact label for that slider updates immediately
**And** the engine recomputes Your Scenario with the current slider positions (debounced 350ms)
**And** metric cards update to reflect the new Base vs Your Scenario comparison

**Given** I adjust sliders to any position
**When** I observe the plan data
**Then** slider adjustments do NOT modify the saved plan — the base case always reflects the user's actual saved plan inputs
**And** no PATCH request is sent to /api/plans/:planId

## Dev Notes

### Architecture Patterns to Follow

- **Context-based navigation, not a new URL route:** The workspace uses `WorkspaceViewContext` (client/src/contexts/WorkspaceViewContext.tsx) to switch between views: `"my-plan"`, `"reports"`, `"scenarios"`, `"settings"`. The What-If Playground is rendered as the `"scenarios"` view. Do NOT add a new URL route (`/plans/:planId/what-if`). The sidebar "Scenarios" button (`data-testid="nav-scenarios"`) already calls `navigateToScenarios()` which sets `workspaceView = "scenarios"`.
  - Source: `client/src/contexts/WorkspaceViewContext.tsx`, `client/src/components/app-sidebar.tsx:161-170`

- **Follow the scenario-engine.ts pattern (adapted for 2-scenario model):** `client/src/lib/scenario-engine.ts` demonstrates the pattern: (1) call `unwrapForEngine(planInputs, startupCosts)` to get raw `EngineInput`, (2) clone `EngineInput.financialInputs` with `cloneFinancialInputs()`, (3) apply adjustments to the clone, (4) call `calculateProjections()`. The sensitivity engine runs twice: base (unmodified) and current (slider adjustments applied). If all sliders are at zero, skip the second run.
  - Source: `client/src/lib/sensitivity-engine.ts` (already implemented)

- **Engine inputs are in cents and decimals:** All monetary amounts in `EngineInput` are in integer cents. All percentages are decimals (0.08 = 8%). The sensitivity engine must apply adjustments in the same units:
  - Revenue slider `+8%` → multiply `fi.revenue.annualGrossSales` by `1.08`
  - COGS slider `+2pp` → add `0.02` to each element of `fi.operatingCosts.cogsPct[0..4]`, then `clamp01()`
  - Labor slider `+5%` → multiply each element of `fi.operatingCosts.laborPct[0..4]` by `1.05`, then `clamp01()`
  - Marketing slider `+5%` → multiply each element of `fi.operatingCosts.marketingPct[0..4]` by `1.05`, then `clamp01()`
  - Facilities slider `+5%` → multiply each element of `fi.operatingCosts.facilitiesAnnual[0..4]` by `1.05` (round to integer cents)
  - Source: `client/src/lib/scenario-engine.ts:52-73`, `shared/financial-engine.ts` interfaces

- **Two scenarios: Base Case + Your Scenario (SCP-2026-02-21 D1/D2/D3):** Base Case = unmodified plan. Your Scenario = base inputs with current slider adjustments applied. When all sliders are at zero, Your Scenario = Base Case (engine skips the second run). Conservative/Optimistic system-defined scenarios are RETIRED.
  - Source: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-02-21.md` → D1, D2, D3

- **Dollar impact calculation per slider:** The per-slider impact label (e.g., "Revenue: +8% → +$24,000/yr") uses the BASE case Y1 annual revenue as the reference. Impact = `(sliderPct / 100) * baseOutput.annualSummaries[0].revenue`. Format as dollars (divide by 100 from cents). Show sign (+ or −) always. For COGS/labor/marketing/facilities sliders, the reference is the relevant Y1 cost from `baseOutput.annualSummaries[0]`.

- **usePlan hook for plan data:** Use `usePlan(planId)` from `client/src/hooks/use-plan.ts` to get the plan record. Cast `plan.financialInputs as PlanFinancialInputs`. Get startup costs from `plan.startupCosts as StartupCostLineItem[]`. Both are needed to call `unwrapForEngine()`.
  - Source: `client/src/hooks/use-plan.ts`, `client/src/pages/planning-workspace.tsx:110-111`

- **Debounce slider input:** Slider changes must be debounced before triggering scenario recomputation. Use a `useState` + `useEffect` pattern with a 350ms debounce, or the `useDebouncedValue` pattern if already in the codebase. The dollar impact label updates immediately on slider move; recomputation waits for debounce.

- **React.useMemo for computation:** Wrap the 3-scenario computation inside `React.useMemo` keyed on the debounced slider values and `plan.financialInputs`. This prevents redundant engine calls on unrelated re-renders.

- **shadcn/ui Slider:** Use the existing `Slider` component from `@/components/ui/slider` for the slider controls. It accepts `min`, `max`, `step`, `value`, and `onValueChange` props. Pair each slider with an `Input` component from `@/components/ui/input` for the numeric field.

- **No server calls in sandbox:** The sensitivity engine runs entirely client-side using the shared `calculateProjections()` function. There are NO new API endpoints in Story 10-1. The computation happens in the browser.

- **Currency formatting:** Use the project's existing currency formatter pattern. Amounts from the engine are in cents; divide by 100 for display. Format as `$X,XXX` or `$X,XXX/yr`. Inspect `client/src/lib/` for existing `formatCurrency` or similar utilities before creating a new one.

### UI/UX Deliverables

- **Page header:** Visible text "What happens to my WHOLE business if things change?" (from AC). Subtitle or description text recommended.
- **Sensitivity Controls panel:** Sticky or collapsible panel at the top of the What-If Playground view. Contains the 5 sliders. Each row:
  - Label (e.g., "Revenue")
  - Slider control (shadcn/ui `Slider`)
  - Current adjustment display (e.g., "+8%" or "0%")
  - Dollar impact display (e.g., "+$24,000/yr")
  - Numeric input for precise entry (optional, synced with slider)
- **Slider ranges (SCP-2026-02-21 D6 — uncapped numeric):**
  - Revenue: visual min=-50, max=+100, step=5 (%). Numeric input accepts any value ≥ -100%.
  - COGS: visual min=-20, max=+20, step=1 (pp). Numeric input uncapped; engine clamp01() enforces [0,1].
  - Payroll/Labor: visual min=-50, max=+100, step=5 (%). Numeric input uncapped; engine clamp01() enforces [0,1].
  - Marketing: visual min=-50, max=+100, step=5 (%). Numeric input uncapped; engine clamp01() enforces [0,1].
  - Facilities: visual min=-50, max=+100, step=5 (%). Numeric input uncapped.
- **Key metric cards below the sliders:** One card per metric. Each card shows two columns (Base Case, Your Scenario) with delta indicators for Your Scenario vs. Base.
  - Metrics: Break-Even Month, 5-Year ROI %, Year-1 Revenue, Year-1 EBITDA, Year-1 Pre-Tax Income
  - Source field mappings: `roiMetrics.breakEvenMonth`, `roiMetrics.fiveYearROIPct`, `annualSummaries[0].revenue`, `annualSummaries[0].ebitda`, `annualSummaries[0].preTaxIncome`
- **Reset Sliders button:** Visible when any slider is non-zero. Resets all sliders to 0% (Your Scenario = Base Case).
- **UI states:**
  - Loading: Show skeleton cards while `usePlan` resolves; disable sliders until data is available
  - Computed: Show metric cards with Base Case vs Your Scenario
  - Zero state: All sliders at 0%, helper text visible, Your Scenario = Base Case
  - Error: If plan data is unavailable, show an error message consistent with the planning-workspace error pattern

### Anti-Patterns & Hard Constraints

- **NEVER call `PATCH /api/plans/:planId` from the What-If Playground.** Slider values are sandbox-only. Any API mutation would corrupt the user's actual plan. If you find yourself importing `usePlanAutoSave` or calling `queueSave()`, stop immediately.

- **NEVER add a new URL route for the What-If Playground.** The app uses `WorkspaceViewContext` for in-workspace navigation. Adding a route (`/plans/:planId/what-if`) would break the sidebar navigation pattern and require changes to `App.tsx`, `app-sidebar.tsx`, and `WorkspaceViewContext.tsx` beyond this story's scope.

- **Do NOT call `computeScenarioOutputs()` from `scenario-engine.ts` in the What-If Playground.** That function uses hardcoded conservative/optimistic factors. The sensitivity engine uses `computeSensitivityOutputs()` from `sensitivity-engine.ts` with dynamic slider values.

- **Do NOT run more than 2 `calculateProjections()` calls per render cycle.** One for base, one for current (slider adjustments applied). If all sliders are at zero, skip the second run — Your Scenario equals Base Case.

- **Do NOT modify `shared/financial-engine.ts` or `shared/plan-initialization.ts`.** The engine and `unwrapForEngine()` are authoritative and stable. They have 173 passing tests that must not be broken.

- **Do NOT modify `client/src/lib/scenario-engine.ts`.** The existing Summary tab may use `computeScenarioOutputs()`. Create a new sensitivity engine separately.

- **Files that MUST NOT be modified in this story:**
  - `shared/financial-engine.ts` — authoritative financial engine, 173 tests
  - `shared/plan-initialization.ts` — engine input preparation, tested
  - `client/src/lib/scenario-engine.ts` — used by existing statements views
  - `client/src/contexts/WorkspaceViewContext.tsx` — no new views needed; "scenarios" already exists

### Gotchas & Integration Warnings

- **`annualGrossSales` is already the full annual revenue (not monthly AUV).** `unwrapForEngine()` in `plan-initialization.ts` converts `monthlyAuv * 12` to `annualGrossSales` in cents. The revenue slider multiplies this already-annual figure. Don't double-convert.

- **COGS slider is in percentage POINTS, not multiplicative percent.** `fi.operatingCosts.cogsPct` is a decimal (e.g., 0.30 = 30%). Adding 5pp means adding `0.05` to each array element. Applying `clamp01()` after prevents values escaping [0, 1]. The scenario-engine.ts `applyScenarioFactors` already shows this pattern at line 60-62.

- **Facilities is in annual cents, not a percentage.** `fi.operatingCosts.facilitiesAnnual` is a 5-element tuple of integer cents. The facilities slider is a multiplicative factor: `Math.round(facilitiesAnnual[i] * (1 + sliderPct/100))`. This is different from the cogsPct additive pattern.

- **Plan data arrives from `usePlan()`, not `usePlanOutputs()`.** The What-If Playground computes its own scenarios from `plan.financialInputs` directly (client-side). It should NOT use `usePlanOutputs()` (which calls `GET /api/plans/:planId/outputs`) because that would create a server-side base and a client-side sensitivity computation — potentially inconsistent. Run all 3 engine calls in the browser.

- **`plan.startupCosts` typing:** In `planning-workspace.tsx:111`, startup costs are cast as `StartupCostLineItem[] | null`. If null, pass an empty array `[]` to `unwrapForEngine()`. The engine handles empty startup costs gracefully.

- **The ImpactStrip renders below the workspace content.** The What-If Playground component renders within the `flex-1` content area of planning-workspace.tsx. The ImpactStrip is a sibling at the bottom. Design the WhatIfPlayground component to scroll independently within its container (`overflow-y-auto`).

- **WorkspaceViewContext "scenarios" placeholder is at planning-workspace.tsx:127-142.** Replace the entire `case "scenarios":` block with `<WhatIfPlayground planId={planId} />`. The component receives planId and fetches its own plan data via `usePlan(planId)`.

- **Slider `value` prop is an array in shadcn/ui.** The shadcn Slider component uses `value={[currentValue]}` and `onValueChange={([v]) => setSliderValue(v)}` (array destructuring). Don't pass a bare number.

- **Break-even month can be null.** `roiMetrics.breakEvenMonth` is `number | null`. If the plan doesn't break even in 60 months, show "60+ mo" or "—" rather than null. Handle all three scenarios' possible nulls.

- **Previous story learnings (Epic 5H, Story 5.10):** Story 5.10 shows the help content pattern (static data in `shared/help-content/`). No help content is needed for Story 10-1, but the component organization pattern from `client/src/components/planning/statements/` should be followed for the new `what-if-playground.tsx` component.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/lib/sensitivity-engine.ts` | CREATE | New sensitivity computation engine with dynamic slider parameters. Exports `computeSensitivityOutputs(planInputs, startupCosts, sliderExtremes)` returning `ScenarioOutputs`. Reuses `ScenarioOutputs` type from `scenario-engine.ts`. |
| `client/src/components/planning/what-if-playground.tsx` | CREATE | What-If Playground React component. Contains Sensitivity Controls panel (5 sliders) and key metric cards (5 metrics × 3 scenarios). Accepts `planId: string`. |
| `client/src/pages/planning-workspace.tsx` | MODIFY | Replace `case "scenarios":` placeholder block (lines 127-142) with `<WhatIfPlayground planId={planId} />`. Add import for WhatIfPlayground. |

### Dependencies & Environment Variables

- **No new npm packages required.** shadcn/ui Slider is already available (`@/components/ui/slider`). React Query is already installed. The financial engine is already in `shared/`.
- **No new environment variables.** All computation is client-side with existing data.
- **No new API endpoints.** No server changes in this story.
- **No database schema changes.** Slider state is ephemeral (not persisted) in Story 10-1.

### Testing Expectations

- **Unit tests for sensitivity-engine.ts:** Test `computeSensitivityOutputs()` with a mock `PlanFinancialInputs`. Assert that the base output equals `calculateProjections(unwrapForEngine(planInputs, []))`. Assert that with revenue slider at +10%, current output has higher Y1 revenue than base output. Assert that with all sliders at zero, current output equals base output.
- **Component tests for WhatIfPlayground:** Render with a mock plan (via query mock or test plan fixture). Assert that `data-testid="nav-scenarios"` click shows the playground. Assert that 5 slider controls render. Assert that metric cards show "Base Case" and "Your Scenario" columns. Assert that "Reset Sliders" button appears when slider is non-zero.
- **Critical ACs to cover in tests:** Sandbox invariant (no PATCH calls emitted), break-even null handling, slider range boundaries.
- **Test framework:** Vitest + React Testing Library (consistent with existing test setup).

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` → Story 10.1] — User story, acceptance criteria, and Dev Notes for Sensitivity Controls & Sandbox Engine
- [Source: `client/src/lib/scenario-engine.ts`] — Authoritative pattern for cloning FinancialInputs and applying scenario factors to EngineInput
- [Source: `client/src/contexts/WorkspaceViewContext.tsx`] — WorkspaceView type, navigateToScenarios(), and the "scenarios" view slot
- [Source: `client/src/pages/planning-workspace.tsx:113-173`] — renderWorkspaceContent() switch, the "scenarios" placeholder to replace, and plan data access pattern
- [Source: `client/src/components/app-sidebar.tsx:160-170`] — Existing "Scenarios" sidebar nav button (data-testid="nav-scenarios"), no changes needed
- [Source: `shared/financial-engine.ts`] — EngineInput, EngineOutput, FinancialInputs interfaces and calculateProjections() function
- [Source: `shared/plan-initialization.ts`] — unwrapForEngine() function signature and transformation logic
- [Source: `_bmad-output/planning-artifacts/architecture.md`] — Currency in cents, percentage as decimal, and client-side computation conventions

## Dev Agent Record

### Agent Model Used

Claude 4.6 Opus (Replit Agent)

### Completion Notes

Implemented the What-If Playground as a client-side sandbox feature. Created a new sensitivity engine (`sensitivity-engine.ts`) following the existing `scenario-engine.ts` pattern — clones `FinancialInputs`, applies slider-based adjustments, and runs `calculateProjections()` three times (base, conservative-extreme, optimistic-extreme). Built the `WhatIfPlayground` React component with 5 sensitivity sliders (Revenue, COGS, Labor, Marketing, Facilities), each with percentage display, dollar impact label, and numeric input. Metric cards display Break-Even Month, 5-Year ROI %, Y1 Revenue, Y1 EBITDA, and Y1 Pre-Tax Income across all three scenarios with delta indicators. The component is purely sandbox — no PATCH calls, no plan mutations. Slider changes update dollar impact labels immediately; scenario metric cards reflect hardcoded slider extremes (not current slider position). Replaced the "scenarios" placeholder in `planning-workspace.tsx` with `<WhatIfPlayground planId={planId} />`. Also fixed a pre-existing LSP error where `StartupCostLineItem` was incorrectly imported from `@shared/schema` instead of `@shared/financial-engine`.

### File List

- `client/src/lib/sensitivity-engine.ts` — CREATED: Sensitivity computation engine with `computeSensitivityOutputs()`, `SliderValues`, `SliderConfig`, `SLIDER_CONFIGS`, `DEFAULT_SLIDER_VALUES`
- `client/src/components/planning/what-if-playground.tsx` — CREATED: What-If Playground React component with sensitivity controls panel and metric cards
- `client/src/pages/planning-workspace.tsx` — MODIFIED: Replaced `case "scenarios":` placeholder with `<WhatIfPlayground planId={planId} />`, added import, fixed `StartupCostLineItem` import source
- `_bmad-output/implementation-artifacts/10-1-sensitivity-controls-sandbox-engine.md` — MODIFIED: Status updates and Dev Agent Record

### Testing Summary

- **Test approach:** E2E browser testing via Playwright + Vitest regression testing
- **Vitest:** All 646 existing tests pass — no regressions
- **E2E test:** Playwright test verified: navigation to Scenarios view, header text, 5 slider rows with controls, 5 metric cards with 3 scenario columns, slider interaction (set revenue to +8% → showed "+$35,000/yr" impact), visual layout captured via screenshot
- **ACs covered:** All 5 acceptance criteria verified (navigation, slider rendering, scenario computation, slider interaction, sandbox invariant)
- **All tests passing:** Yes
- **LSP Status:** 0 errors, 0 warnings
- **Visual Verification:** Yes — E2E screenshots confirmed correct rendering
