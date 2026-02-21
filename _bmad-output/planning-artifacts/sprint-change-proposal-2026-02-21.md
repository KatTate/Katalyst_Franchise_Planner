# Sprint Change Proposal: Epic 10 Pivot — User-Authored Scenario Modeling

**Date:** 2026-02-21
**Status:** APPROVED (2026-02-21) — All 8 change proposals applied to artifacts and code
**Author:** Correct Course workflow (Batch mode)
**Triggered by:** UX review of Story 10-1 implementation — Product Owner identified that fixed Conservative/Optimistic columns answer a system-invented question, not a real user question. Follow-up PO feedback: slider ranges (±15%/±5%/±10%) are arbitrary holdovers from retired feature — should be uncapped.
**Scope:** Epic 10 (What-If Playground) — Stories 10.1, 10.2a, 10.2b, 10.3
**Severity:** Moderate — Epic 10 only, no impact on Epics 1–5H or 6–9

---

## 1. Issue Summary

### What changed

During review of Story 10-1 (Sensitivity Controls & Sandbox Engine), the Product Owner identified a fundamental design flaw in the What-If Playground's information architecture:

**The fixed Conservative and Optimistic columns don't serve the user.**

These columns show what happens when ALL sliders are pushed to their maximum negative (Conservative) or maximum positive (Optimistic) extremes simultaneously. This answers a question the system invented ("What if literally everything goes wrong/right at once?") rather than a question the user is actually asking ("What if revenue drops 10% but I also cut marketing?").

### Current implementation (Story 10-1, status: review)

- `sensitivity-engine.ts` computes 4 engine runs: Base + Conservative (all-negative extremes) + Optimistic (all-positive extremes) + Custom (user's current slider positions)
- `what-if-playground.tsx` displays 5 MetricCards with 3 fixed columns (Base/Conservative/Optimistic) + optional 4th "Your Scenario" column when any slider moves off zero
- Conservative/Optimistic never change regardless of slider interaction — they are hardcoded to slider extremes
- The "Custom" column (which DOES respond to user input) is treated as secondary

### What the Product Owner wants

1. **Kill the fixed Conservative/Optimistic columns** — they provide no user value
2. **Add named scenario saving** — users define and persist their own slider configurations as named scenarios
3. **Add scenario comparison** — users compare their own saved scenarios against each other and against Base, replacing the system-defined extremes

This pivots Epic 10 from **"system-defined sensitivity analysis"** to **"user-authored scenario modeling with comparison."**

---

## 2. Impact Analysis

### 2.1 What's Affected

| Artifact | Impact | Severity |
|----------|--------|----------|
| `sensitivity-engine.ts` (implemented) | Remove conservative/optimistic computation; keep base + custom only | Low — deletion simplifies |
| `what-if-playground.tsx` (implemented) | Remove 3-column MetricCard layout; redesign for Base vs Your Scenario | Moderate — structural UI change |
| Story 10-1 ACs (epics.md lines 2091–2120) | Rewrite: remove conservative/optimistic references, add "Your Scenario" as primary | Moderate |
| Story 10-2a ACs (`10-2a-sensitivity-chart-dashboard.md`) | Rewrite: charts show Base + Your Scenario (not 3 fixed curves) | Moderate |
| Story 10-2b ACs (`10-2b-metric-delta-cards.md`) | Rewrite: delta cards compare Base vs Your Scenario | Low |
| Story 10-3 ACs (epics.md lines 2147–2167) | Promoted from optional to essential; ACs expanded for comparison | Moderate |
| Epic 10 description (epics.md lines 2084–2089) | Rewrite epic summary | Low |
| UX Spec Journey 4 (lines 1095–1118) | Update Chris's journey to reflect new model | Low |

### 2.2 What's NOT Affected

- **Epics 1–5H:** No impact. Auth, brand config, financial engine, forms, financial statement views all unchanged.
- **Epic 6–9, 11–12, ST:** No dependency on Epic 10 scenario model.
- **Financial engine (`financial-engine.ts`):** Unchanged — the engine is scenario-agnostic. It takes inputs, produces outputs. The sensitivity engine wraps it.
- **Database schema:** The `plans` table already has a JSONB column suitable for scenario storage. Story 10-3 will add a `what_if_scenarios` column or related table — this was already planned.
- **Slider controls themselves:** The 5 sliders, their ranges, the dollar impact display, the debouncing — all remain exactly as implemented. The pivot changes what we DO with slider outputs, not how sliders work.

### 2.3 Code Already Built (Story 10-1)

| Component | Keep / Modify / Delete |
|-----------|----------------------|
| `SLIDER_CONFIGS`, `DEFAULT_SLIDER_VALUES` | **Keep** — unchanged |
| `SliderValues` type | **Keep** — unchanged |
| `cloneFinancialInputs()` | **Keep** — reused for any scenario computation |
| `applySensitivityFactors()` | **Keep** — reused for any scenario computation |
| `computeSensitivityOutputs()` | **Modify** — remove conservative/optimistic; compute base + custom only |
| `SensitivityOutputs` interface | **Modify** — becomes `{ base, current }` instead of `{ base, conservative, optimistic, custom }` |
| `SensitivitySliderRow` component | **Keep** — unchanged |
| `MetricCard` / `ScenarioColumn` | **Modify** — remove fixed 3-column layout; show Base vs Your Scenario |
| `WhatIfPlayground` component | **Modify** — remove `hasCustom` branching; always show Base + Your Scenario |
| Loading/error/empty states | **Keep** — unchanged |

**Estimated rework:** ~30% of Story 10-1 code changes. Mostly deletion (removing conservative/optimistic logic) and simplification (always show 2 columns instead of 3-or-4).

### 2.4 Sprint Status Impact

| Story | Before | After | Change |
|-------|--------|-------|--------|
| 10-1 | review | needs-revision | AC rewrite, code modification (~30% of existing code) |
| 10-2a | ready-for-dev | needs-revision | AC rewrite (chart scenario model changes) |
| 10-2b | ready-for-dev | needs-revision | AC rewrite (delta card comparison target changes) |
| 10-3 | backlog (optional) | **ready-for-dev (essential)** | Promoted; ACs expanded significantly |

---

## 3. Recommended Approach

### Design Philosophy: "Your Scenarios, Your Questions"

The What-If Playground becomes a place where **the user authors their own scenarios** by adjusting sliders, and can **save, name, reload, and compare** those scenarios. The system never imposes its own scenario definitions.

### Information Architecture (Revised)

```
┌─────────────────────────────────────────────────┐
│  What happens to my WHOLE business if things     │
│  change?                                         │
├─────────────────────────────────────────────────┤
│  SENSITIVITY CONTROLS (uncapped — D6)             │
│  Revenue:    -50% ←——●——→ +50%    +$24,000/yr   │
│  COGS:       -20pp←——●——→ +20pp   +$12,000/yr   │
│  Labor:      -50% ←——●——→ +50%    -$8,000/yr    │
│  Marketing:  -50% ←——●——→ +50%    +$0/yr        │
│  Facilities: -50% ←——●——→ +50%    -$6,000/yr    │
│  (numeric fields accept any value — no cap)      │
│                                                  │
│  [Save as Scenario]  [Reset Sliders]             │
│  ┌─────────────────────────────────────┐         │
│  │ Load: [v Select a saved scenario]   │         │
│  └─────────────────────────────────────┘         │
├─────────────────────────────────────────────────┤
│  KEY METRICS                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │Break-Even│ │ Year 1   │ │ 5-Year   │ ...    │
│  │Base: 14mo│ │ Revenue  │ │ ROI      │        │
│  │Now:  18mo│ │Base:$142K│ │Base: 127%│        │
│  │ +4 mo  ▼ │ │Now: $121K│ │Now:  98% │        │
│  └──────────┘ │-$21K   ▼ │ │-29pp   ▼ │        │
│               └──────────┘ └──────────┘         │
├─────────────────────────────────────────────────┤
│  CHARTS (6 charts — Story 10-2a)                 │
│  Base Case (solid) + Your Scenario (dashed)      │
│  + optional: loaded saved scenario (dotted)      │
└─────────────────────────────────────────────────┘
```

### Key Design Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | Remove Conservative/Optimistic as fixed system columns | They answer an invented question. User-authored scenarios are more valuable. |
| D2 | "Your Scenario" = live slider state, always visible alongside Base | The slider IS the scenario authoring tool. Its output is always relevant. |
| D3 | Story 10-3 promoted from optional to essential | Scenario persistence IS the feature. Without save/load/compare, sliders are ephemeral toys. |
| D4 | Comparison = Base vs Your Scenario (+ optional saved scenario overlay) | Users compare their authored scenarios against their actual plan. Additional saved scenarios can be overlaid for multi-scenario comparison. |
| D5 | Engine simplification: compute 2 runs (base + current), not 4 | Fewer engine runs = better performance. Additional runs only when loading saved scenarios. |
| D6 | Uncapped slider ranges — no artificial limits | The ±15%/±5%/±10% ranges were carried from the retired Quick Scenario Sensitivity Model (UX Spec Part 11, RETIRED). They were never designed as slider ranges. Franchisees doing real scenario modeling need to explore "what if revenue drops 40%?" without hitting an arbitrary wall. Sliders show a practical visual range (±50%) but numeric input fields accept any value within mathematical limits (revenue ≥ -100%, percentages clamped 0–100% by the engine's `clamp01()`). |

---

## 4. Detailed Change Proposals

### CP-1: Epic 10 Description (epics.md lines 2084–2089)

**Old:**
```
## Epic 10: What-If Playground (formerly "Scenario Comparison")

Standalone sidebar destination providing interactive graphical sensitivity analysis. Franchisees adjust assumption sliders and see all charts (Profitability, Cash Flow, Break-Even, ROI, Balance Sheet, Debt & Working Capital) update simultaneously across Base, Conservative, and Optimistic scenarios. This is a planning sandbox — slider adjustments do NOT change the user's actual plan. Replaces the retired Story 5.7 column-splitting approach. Per SCP-2026-02-20 Decision D5/D6 and Section 3.

**FRs covered:** (To be assigned when FRs for What-If Playground are formalized — extends scenario-related FRs from Epic 5's retired Story 5.7)
**Stories (3):** 10.1 Sensitivity Controls & Sandbox Engine, 10.2 Multi-Chart Dashboard, 10.3 Scenario Persistence & Sharing
```

**New:**
```
## Epic 10: What-If Playground — User-Authored Scenario Modeling

Standalone sidebar destination for interactive scenario modeling. Franchisees adjust assumption sliders to author their own "what-if" scenarios, save them with names, and compare saved scenarios against their base plan. Charts and metric cards update live as sliders move, always showing Base Case vs "Your Scenario" (current slider state). Users can save slider configurations as named scenarios, reload them, and overlay saved scenarios for comparison. This is a planning sandbox — slider adjustments do NOT change the user's actual plan. Replaces the retired Story 5.7 column-splitting approach and the system-defined Conservative/Optimistic columns (retired per SCP-2026-02-21 D1).

**FRs covered:** (To be assigned when FRs for What-If Playground are formalized — extends scenario-related FRs from Epic 5's retired Story 5.7)
**Stories (4):** 10.1 Sensitivity Controls & Sandbox Engine, 10.2a Sensitivity Chart Dashboard, 10.2b Metric Delta Cards & Dashboard Polish, 10.3 Scenario Persistence & Comparison
```

### CP-2: Story 10.1 AC Revision (epics.md lines 2091–2120)

**Changes:**
- Remove AC: "the financial engine computes three scenarios client-side: Base Case (saved plan), Conservative (negative slider extremes), and Optimistic (positive slider extremes)"
- Replace with: "the financial engine computes two scenarios client-side: Base Case (saved plan inputs, unmodified) and Your Scenario (base inputs with current slider adjustments applied)"
- Remove AC: metric cards show "all three scenario values side-by-side"
- Replace with: metric cards show "Base Case vs Your Scenario with delta indicators"
- Add AC: "A 'Reset Sliders' button returns all sliders to 0% (Your Scenario = Base Case)"
- Remove Dev Note: "Conservative/Optimistic are computed by applying slider percentage multipliers to base case inputs"
- Add Dev Note: "Engine runs twice: base (no adjustments) and current (slider adjustments applied). If sliders are all at zero, skip the second run — Your Scenario equals Base Case."
- Remove AC: slider ranges of -15%/+15%, -5%/+5%, -10%/+10%
- Replace with: "Sliders have a practical visual range (see CP-8 for details) but numeric input fields accept any value within mathematical limits. Revenue adjustment cannot go below -100%. Percentage-based inputs (COGS, labor, marketing) are clamped to valid ranges by the engine's existing `clamp01()` function."

### CP-3: Story 10.2a AC Revision (`10-2a-sensitivity-chart-dashboard.md`)

**Changes to all chart ACs:**
- Remove: "three scenario curves: Base Case (solid line), Conservative (dashed), Optimistic (light dashed)"
- Replace with: "two scenario curves: Base Case (solid line) and Your Scenario (dashed line). If a saved scenario is loaded for comparison (Story 10.3), a third curve (dotted line) shows the saved scenario."
- Remove all references to `ScenarioOutputs.conservative` and `ScenarioOutputs.optimistic`
- Replace with `ScenarioOutputs.base` and `ScenarioOutputs.current`
- Chart 3 (Break-Even): horizontal bars show Base + Your Scenario (+ optional saved scenario), not three fixed scenarios
- Chart 4 (ROI): callout card text changes from "Conservative case: [X]% ROIC" to "Your scenario: [X]% ROIC at Year 5" (reflects user's actual slider choices, not system extremes)

### CP-4: Story 10.2b AC Revision (`10-2b-metric-delta-cards.md`)

**Changes:**
- Remove: delta cards compare "Base vs Conservative"
- Replace with: delta cards compare "Base vs Your Scenario" (current slider state)
- When all sliders are at zero, Your Scenario = Base Case, so deltas show zero/no change
- Remove: initial helper text referencing Conservative scenario
- Replace with: "Move a slider to see how it changes your metrics" (simpler, scenario-agnostic)
- Delta color rules unchanged (desirability-based coloring is correct regardless of comparison target)

### CP-5: Story 10.3 Promotion & AC Expansion (epics.md lines 2147–2167)

**Old status:** Optional Enhancement
**New status:** Essential (required for Epic 10 to deliver its value proposition)

**Old title:** "Scenario Persistence & Sharing (Optional Enhancement)"
**New title:** "Scenario Persistence & Comparison"

**Revised ACs:**

```
### Story 10.3: Scenario Persistence & Comparison

As a franchisee,
I want to save my slider configurations as named scenarios and compare them against my base plan,
So that I can explore multiple "what-if" variations and build conviction about which assumptions matter most.

**Acceptance Criteria:**

**Given** I have adjusted sliders in the What-If Playground to a non-zero configuration
**When** I click "Save as Scenario"
**Then** a dialog prompts me to name the scenario (e.g., "Low Revenue + Lean Marketing")
**And** the current slider positions are saved as a named scenario associated with my plan
**And** the scenario selector dropdown updates to include the new scenario

**Given** I have one or more saved scenarios
**When** I view the scenario selector dropdown
**Then** I see all my saved scenarios listed by name
**And** I can select a saved scenario to load its slider positions into the controls
**And** the metric cards and charts update to reflect the loaded scenario

**Given** I have loaded a saved scenario
**When** I view the Sensitivity Controls
**Then** the currently loaded scenario's name is displayed in the controls header
**And** modifying any slider creates an "unsaved changes" indicator
**And** I can save the modified positions as a new scenario or overwrite the current one

**Given** I have saved scenarios
**When** I want to delete one
**Then** I can delete any saved scenario from the dropdown with a confirmation

**Given** I have at least one saved scenario
**When** I want to compare scenarios
**Then** I can select a saved scenario as a "comparison overlay" from the dropdown
**And** charts show a third dotted line for the comparison scenario alongside Base (solid) and Your Scenario (dashed)
**And** metric cards show a third column for the comparison scenario

**Given** I adjust sliders or load scenarios
**When** I observe the plan data
**Then** no saved plan data is modified — all scenarios are sandbox-only
**And** saved scenario data is stored per plan in a `what_if_scenarios` JSONB column or related table

**Dev Notes:**
- Scenario data shape: `{ name: string, sliderValues: SliderValues, createdAt: string }`
- Stored as JSON array per plan — either `what_if_scenarios` column on plans table or a separate `scenarios` table with plan_id FK
- Comparison overlay is optional — the playground is fully functional without it (Base + Your Scenario is the default)
- Engine runs: 2 (base + current) when no comparison loaded; 3 (base + current + comparison) when comparison is active
- Limit saved scenarios per plan to a reasonable cap (e.g., 10) to prevent unbounded growth
```

### CP-6: UX Spec Journey 4 Update (ux-design-specification-consolidated.md lines 1095–1118)

**Changes:**
- Remove: "alongside Conservative (dashed) and Optimistic (dashed, lighter) scenario curves"
- Replace with: "alongside Your Scenario (dashed line) showing the effect of her slider adjustments"
- Add: Chris saves a "Low Revenue" scenario, then creates a "Low Revenue + High Labor" scenario, and uses the comparison overlay to see both against her Base Case simultaneously
- Remove: references to system-defined Conservative/Optimistic scenarios

### CP-7: Code Changes to Story 10-1 Implementation

**File: `client/src/lib/sensitivity-engine.ts`**

```
// Remove:
- conservativeSliders constant and computation (lines 107-121)
- optimisticSliders constant and computation (lines 123-137)
- SensitivityOutputs extends ScenarioOutputs (line 95-97)

// Replace SensitivityOutputs with:
export interface SensitivityOutputs {
  base: ScenarioOutputs["base"];
  current: ScenarioOutputs["base"];
}

// Simplify computeSensitivityOutputs to compute only base + current:
export function computeSensitivityOutputs(
  planInputs: PlanFinancialInputs,
  startupCosts: StartupCostLineItem[],
  currentSliders: SliderValues,
): SensitivityOutputs {
  const baseEngineInput = unwrapForEngine(planInputs, startupCosts);
  const baseOutput = calculateProjections(baseEngineInput);

  const hasAdjustment = Object.values(currentSliders).some((v) => v !== 0);
  let currentOutput = baseOutput;
  if (hasAdjustment) {
    const currentInputs = applySensitivityFactors(
      cloneFinancialInputs(baseEngineInput.financialInputs),
      currentSliders,
    );
    currentOutput = calculateProjections({
      financialInputs: currentInputs,
      startupCosts: baseEngineInput.startupCosts,
    });
  }

  return { base: baseOutput, current: currentOutput };
}
```

**File: `client/src/components/planning/what-if-playground.tsx`**

- Remove `ScenarioColumn` component's 3-column layout
- Replace `MetricCard` to show 2 columns: Base Case + Your Scenario
- Remove `hasCustom` branching — always show Your Scenario
- Add "Reset Sliders" button
- Prepare for Story 10-3 integration (scenario save/load/compare will be added later)

### CP-8: Uncapped Slider Ranges (sensitivity-engine.ts + what-if-playground.tsx)

**Origin of current limits:** The ±15%/±5%/±10% ranges were carried verbatim from the retired "Quick Scenario Sensitivity Model" in UX Spec Part 11 (marked `RETIRED — do not implement`). They were designed as fixed multipliers for system-defined Conservative/Optimistic snap calculations, not as slider range limits for user-authored scenarios. Per Product Owner direction (D6), they are replaced with uncapped ranges.

**Design: Two-tier input model**

Each slider has two input mechanisms:
1. **Slider (visual):** Shows a practical drag range for common exploration. The visual range is generous but finite for usability:
   - Revenue: -50% to +100%
   - COGS: -20pp to +20pp
   - Payroll/Labor: -50% to +100%
   - Marketing: -50% to +100%
   - Facilities: -50% to +100%
2. **Numeric input field (uncapped):** Accepts any value within mathematical limits. No artificial cap. The slider thumb moves to the min/max edge when the numeric value exceeds the visual range, but the engine respects the entered value.

**Mathematical limits (enforced by engine, not UI):**
- Revenue adjustment: cannot go below -100% (revenue cannot be negative). No upper cap.
- COGS adjustment (percentage points): the engine's `clamp01()` already prevents the resulting COGS% from exceeding 100% or going below 0%.
- Labor, Marketing (percentage multipliers): same `clamp01()` applies after multiplication.
- Facilities (dollar amount multiplier): cannot go below -100% (facilities cannot be negative). No upper cap.

**File changes:**

`sensitivity-engine.ts` — update `SLIDER_CONFIGS`:
```typescript
export const SLIDER_CONFIGS: SliderConfig[] = [
  { key: "revenue", label: "Revenue", min: -50, max: 100, step: 5, unit: "%" },
  { key: "cogs", label: "COGS", min: -20, max: 20, step: 1, unit: "pp" },
  { key: "labor", label: "Payroll / Labor", min: -50, max: 100, step: 5, unit: "%" },
  { key: "marketing", label: "Marketing", min: -50, max: 100, step: 5, unit: "%" },
  { key: "facilities", label: "Facilities", min: -50, max: 100, step: 5, unit: "%" },
];
```

`what-if-playground.tsx` — numeric input fields:
- Remove `min`/`max` attributes from the `<Input>` element (or set them to mathematical limits: -100 min for revenue/facilities/labor/marketing, no max)
- The slider component still uses `config.min`/`config.max` for its visual range
- When the numeric field value exceeds the slider's visual range, the slider thumb clamps to its edge but the engine uses the actual numeric value
- Add validation: revenue adjustment < -100 shows a warning "Revenue can't go below zero"

---

## 5. Implementation Handoff

### Scope Classification: **Moderate**

- No new epics
- No new stories (Story 10-3 already existed, just promoted)
- AC rewrites for 4 stories within one epic
- Code modification to 2 existing files (~30% rework of Story 10-1)
- No database schema changes yet (deferred to Story 10-3 implementation)
- No impact outside Epic 10

### Execution Order

1. **Approve this SCP** — Product Owner review
2. **Update epics.md** — Apply CP-1 (epic description) and CP-2 (Story 10.1 ACs) and CP-5 (Story 10.3 ACs)
3. **Update story context documents** — Apply CP-3 (10-2a) and CP-4 (10-2b)
4. **Update UX spec** — Apply CP-6 (Journey 4)
5. **Implement code changes** — Apply CP-7 (sensitivity-engine.ts + what-if-playground.tsx)
6. **Update sprint-status.yaml** — Reflect story status changes
7. **Move Story 10-1 back through review** after code changes

### What Does NOT Change

- Financial engine (`financial-engine.ts`) — unchanged
- Sandbox invariant (no PATCH to plan) — unchanged
- Chart types and their data sources — unchanged (only which scenarios are plotted)
- Epic 5H hardening work — unblocked, independent
- All other epics — no dependency on Epic 10 scenario model

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Story 10-3 scope creep (comparison becomes complex) | Medium | Medium | Keep comparison overlay simple — one saved scenario at a time, no multi-scenario matrix |
| Users want more than 2 comparison targets | Low | Low | Design allows extension; defer multi-compare to Phase 2 |
| Scenario persistence adds database migration | Low | Low | JSONB column on existing table or simple related table — minimal schema change |

---

## Appendix A: Artifact Cross-Reference

| Document | Section | Change Type |
|----------|---------|-------------|
| `epics.md` | Lines 2084–2167 (Epic 10 complete) | Rewrite |
| `10-2a-sensitivity-chart-dashboard.md` | ACs 1-12 (scenario curve references) | Targeted edits |
| `10-2b-metric-delta-cards.md` | ACs 1-2 (comparison target) | Targeted edits |
| `ux-design-specification-consolidated.md` | Lines 1095–1118 (Journey 4) | Targeted edits |
| `sensitivity-engine.ts` | Lines 95–153 (interface + computation) | Rewrite |
| `what-if-playground.tsx` | Lines 231–301 (MetricCard + ScenarioColumn) | Rewrite |
| `sprint-status.yaml` | Epic 10 story statuses | Status updates |
| `prd.md` | Line 656 (scenario modeling reference) | Minor wording update |
