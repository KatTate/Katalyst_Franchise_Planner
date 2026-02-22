# BMAD Party Mode Review — Epic 10: What-If Playground Stories

**Review Method:** BMAD Party Mode (Classic)
**Date:** 2026-02-22
**Agents Assembled:** John (PM), Winston (Architect), Sally (UX), Bob (SM), Amelia (Dev), Quinn (QA)
**Stories Reviewed:**
- `10-1-sensitivity-controls-sandbox-engine.md` — Status: needs-revision
- `10-2-multi-chart-sensitivity-dashboard.md` — Status: SUPERSEDED (correctly split into 10-2a + 10-2b)
- `10-2a-sensitivity-chart-dashboard.md` — Status: needs-revision
- `10-2b-metric-delta-cards.md` — Status: needs-revision
**Epic Source:** `_bmad-output/planning-artifacts/epics.md` → Epic 10 (lines 368–371, 2174–2303)
**Sprint Change Proposal:** SCP-2026-02-21 (User-Authored Scenario Modeling pivot)

---

## Overall Verdict: NEEDS REVISION — All Three Active Stories

All three active stories (10-1, 10-2a, 10-2b) require revisions before they are ready for development. Story 10-2 (original unsplit version) is correctly marked SUPERSEDED and needs no action. The issues range from stale pre-SCP references in 10-1, to missing required template sections in 10-2a and 10-2b, to a fundamental metric card overlap between 10-1 and 10-2b that needs resolution.

---

## Story 10-1: Sensitivity Controls & Sandbox Engine

### John (PM) — Product Alignment

**Verdict: CONDITIONAL PASS — minor stale references remain after SCP-2026-02-21 revision**

The story header correctly notes the SCP-2026-02-21 revision and the ACs properly describe the 2-scenario model (Base Case + Your Scenario). However, several artifacts within the story still carry pre-revision language:

| Issue | Location | Detail |
|-------|----------|--------|
| Stale function signature | File Change Summary (line 159) | `computeSensitivityOutputs(planInputs, startupCosts, sliderExtremes)` — parameter `sliderExtremes` is the old name. SCP-2026-02-21 CP-7 defines it as `currentSliders`. |
| Stale return type | File Change Summary (line 159) | Says "returning `ScenarioOutputs`" and "Reuses `ScenarioOutputs` type." SCP defines a new `SensitivityOutputs { base, current }` interface. |
| Stale scenario count | File Change Summary (line 160) | Says "key metric cards (5 metrics × 3 scenarios)" — should be "× 2 scenarios" (Base + Your Scenario). |
| Stale null handling text | Gotchas (line 151) | "Handle all three scenarios' possible nulls" — should be "both scenarios'" since there are only 2 scenarios. |
| Epics.md navigation mismatch | epics.md line 2191 | Epics.md still says `route: /plans/:planId/what-if` — story file correctly says to use `WorkspaceViewContext` (no new URL route). The epics.md line was not updated by SCP-2026-02-21. |

**Dev Agent Record contains pre-revision implementation notes:** The completion notes describe 3 engine runs (base, conservative, optimistic) and "scenario metric cards reflect hardcoded slider extremes (not current slider position)" — this is the OLD behavior. After revision, the code needs to reflect 2 engine runs (base + current) with metric cards reflecting live slider state.

**5-Year ROI display formatting gap:** The ACs list "5-Year ROI %" as a metric card value sourced from `roiMetrics.fiveYearROIPct`, but neither the ACs nor dev notes mention the decimal-to-percentage conversion (`* 100`). Story 10-2b correctly documents this conversion — Story 10-1 should match.

**Recommendation:** Update the File Change Summary, stale gotcha text, and Dev Agent Record to reflect the post-SCP state. Add ROI formatting note to dev notes or ACs.

---

### Winston (Architect) — Technical Design

**Verdict: PASS — architecture patterns are sound**

Architecture alignment confirmed on all key patterns:

1. **WorkspaceViewContext navigation** — Correctly uses context-based view switching (`"scenarios"` view) instead of a new URL route. Anti-pattern correctly prohibits adding `/plans/:planId/what-if`.

2. **Sensitivity engine separation** — New `sensitivity-engine.ts` correctly stays separate from `scenario-engine.ts`. Anti-pattern prohibits modifying the existing scenario engine.

3. **Engine input/output conventions** — Cents-based currency, decimal percentages, `clamp01()` for bounds enforcement — all aligned with `shared/financial-engine.ts` interfaces.

4. **Sandbox invariant** — No PATCH calls, no plan mutations. AC and anti-pattern both enforce this.

5. **Protected files** — Correctly identifies `financial-engine.ts`, `plan-initialization.ts`, `scenario-engine.ts`, and `WorkspaceViewContext.tsx` as DO-NOT-MODIFY.

**Minor concern:** The `sensitivity-engine.ts` File Change Summary action says "CREATE" but the Dev Agent Record shows this file already exists from the initial (pre-revision) implementation. After the SCP revision, the action should be "MODIFY" (simplify from 4 engine runs to 2).

---

### Sally (UX) — User Experience

**Verdict: PASS — UI deliverables well-specified**

1. **Slider controls** — 5 sliders with visual range + uncapped numeric input, dollar impact labels, percentage display. Matches SCP-2026-02-21 D6 two-tier input model.

2. **Metric cards** — 5 metrics (Break-Even Month, 5-Year ROI, Y1 Revenue, Y1 EBITDA, Y1 Pre-Tax Income) with 2-column layout (Base + Your Scenario). Delta indicators present.

3. **Reset Sliders button** — Visible when any slider is non-zero, resets to 0%.

4. **UI states** — Loading (skeleton), computed, zero-state (helper text), error — all covered.

**Concern — metric card overlap with Story 10-2b:** Story 10-1 defines 5 metric cards below the sliders showing Base vs Your Scenario with delta indicators. Story 10-2b defines 4 metric delta cards above the chart grid showing base→scenario with deltas. The overlap is significant:
- Both show Break-Even, Revenue, and ROI deltas
- 10-1 additionally shows EBITDA and Pre-Tax Income
- 10-2b additionally shows Year 5 Cash
- Both use delta indicators

Are both intended to coexist? That creates 9 metric displays with partially redundant information. **Recommendation:** Clarify whether 10-2b's delta cards replace 10-1's metric cards or supplement them. If they replace them, 10-1's ACs about metric cards should be removed and the scope transferred to 10-2b.

---

### Bob (SM) — Story Quality & Dev Readiness

**Verdict: CONDITIONAL PASS — revisions needed before re-entering dev**

| Criterion | Status | Notes |
|-----------|--------|-------|
| Clear user story statement | PASS | |
| Testable acceptance criteria | PASS | 5 well-structured ACs |
| Architecture patterns documented | PASS | 8 patterns with source references |
| Anti-patterns & hard constraints | PASS | 7 constraints, all specific |
| Gotchas & integration warnings | PASS | 10 gotchas, excellent coverage |
| File Change Summary | **NEEDS UPDATE** | Stale function signature, wrong scenario count, action should be MODIFY not CREATE |
| Dependencies & env vars | PASS | Correctly states no new packages/env vars/API endpoints |
| Testing expectations | PASS | Unit + component + critical ACs identified |
| References | PASS | 8 source citations |
| Dev Agent Record | **STALE** | Describes pre-revision (3-scenario) implementation |

**Story sizing:** Medium. 3 files touched (1 create → now modify, 1 create, 1 modify). Appropriate as a single story.

---

### Amelia (Dev) — Implementation Feasibility

**Verdict: PASS — implementable after revision updates**

The implementation is already partially complete (Dev Agent Record filled). The revision work per SCP-2026-02-21 CP-7 is well-scoped (~30% of existing code, mostly deletion). The code patterns are clear and all integration points verified.

**Key implementation concern:** The Dev Agent Record shows 646 Vitest tests passing and E2E verification complete — but these test results are from the pre-revision implementation. After applying the SCP changes, all tests need re-verification.

---

### Quinn (QA) — Test Coverage

**Verdict: PASS with note**

Testing expectations section is adequate. Critical ACs (sandbox invariant, break-even null, slider boundaries) are flagged for coverage. Vitest + React Testing Library specified.

**Note:** The testing section should be updated post-revision to reflect 2-scenario assertions instead of 3-scenario assertions. The test "Assert that metric cards show Base Case and Your Scenario columns" is correct for the revised model.

---

## Story 10-2a: Sensitivity Chart Dashboard

### John (PM) — Product Alignment

**Verdict: CONDITIONAL PASS — forward references to Story 10.3 create ambiguity**

The ACs correctly describe 6 charts with Base Case + Your Scenario curves. Chart data sources are properly mapped to `EngineOutput` fields. However:

**Story 10.3 forward references:** ACs 3, 7, 9 all contain "If a saved scenario is loaded for comparison (Story 10.3), a third dotted curve is shown." This creates implementation ambiguity:
- `SensitivityOutputs { base, current }` has only 2 scenarios
- A third curve requires extending the interface with an optional `comparison?: EngineOutput` property
- Should the dev agent build the 3-curve rendering infrastructure now (10-2a) or later (10.3)?

**Recommendation:** Either remove the Story 10.3 forward references and let 10.3 extend the charts when it arrives, or explicitly define the optional comparison prop interface in the dev notes so the dev agent knows exactly what to build.

**Chart 2 scope discrepancy with epics.md:** The epics.md (line 2226) says Chart 2 should show "Net Operating Cash Flow, Net Cash Flow, Ending Cash Balance" (3 series). The story file (AC 5) only shows "Ending Cash Balance" (1 series per scenario). The simplification may be intentional, but the discrepancy is undocumented. If intentional, the epics.md should be updated.

---

### Winston (Architect) — Technical Design

**Verdict: CONDITIONAL PASS — solid patterns but missing required sections**

Architecture patterns are strong:

1. **Presentational component pattern** — `SensitivityCharts` receives `SensitivityOutputs` as a prop, never calls engine functions directly. Anti-pattern explicitly prohibits engine calls inside chart components.

2. **Recharts + ChartContainer pattern** — Follows existing `dashboard-charts.tsx` pattern. `ChartConfig`, `ChartTooltip`, `ChartTooltipContent` properly referenced.

3. **Data memoization** — `useMemo` per chart, keyed on `SensitivityOutputs` prop. Anti-pattern prohibits skipping memoization.

4. **Currency/percentage conventions** — Cents → dollars (÷100), decimal → percentage (×100) for ROIC. Source citations confirm patterns.

**Critical missing sections:**

| Required Section | Present? | Impact |
|-----------------|----------|--------|
| File Change Summary | **NO** | Dev agent doesn't know which files to create/modify |
| Dependencies & Environment Variables | **NO** | Dev agent must guess dependency status |
| Testing Expectations | **NO** | No testing guidance for chart components |
| References | **NO** | No source citations section (though inline references exist in dev notes) |
| Dev Agent Record | **NO** | Template section missing entirely |

**Recommendation:** Add all five missing sections. The File Change Summary should at minimum include:
- `client/src/components/planning/sensitivity-charts.tsx` — CREATE
- `client/src/components/planning/what-if-playground.tsx` — MODIFY (add `<SensitivityCharts>` as child)

---

### Sally (UX) — User Experience

**Verdict: PASS — excellent UI deliverables**

1. **Human-friendly chart titles** — "Am I Making Money?" / *Profitability*, "Can I Pay My Bills?" / *Cash Flow* — excellent plain-language approach with technical subtitles.

2. **Responsive grid** — 2×3 on desktop, 1-column on mobile. Desktop as primary e2e target.

3. **Amber advisory zone** — Cash-negative zone on Chart 2 uses amber (not red), with contextual annotation. Follows Guardian Bar visual language.

4. **Loading state** — Skeleton placeholders at chart height.

5. **Chart legend** — Scenario labels with color dots matching line styles.

**Chart 1 visual density concern:** AC 3 specifies 5 P&L metrics (Revenue, COGS, Gross Profit, EBITDA, Pre-Tax Income) as overlaid lines for 2 scenarios = 10 lines on one chart. This could be visually cluttered. **Recommendation:** Add dev note guidance on line weight differentiation, series grouping, or a legend that allows toggling individual series on/off.

---

### Bob (SM) — Story Quality & Dev Readiness

**Verdict: FAIL — missing 5 required template sections**

| Criterion | Status | Notes |
|-----------|--------|-------|
| Clear user story statement | PASS | |
| 17 testable acceptance criteria | PASS | Thorough and specific |
| Architecture patterns documented | PASS | 10 patterns with source references |
| UI/UX deliverables | PASS | Comprehensive |
| Anti-patterns & hard constraints | PASS | 8 constraints documented |
| Gotchas & integration warnings | PASS | 12 gotchas, excellent coverage |
| File Change Summary | **MISSING** | No file change table |
| Dependencies & Environment Variables | **MISSING** | Section absent |
| Testing Expectations | **MISSING** | No testing guidance |
| References | **MISSING** | No dedicated references section |
| Dev Agent Record | **MISSING** | Template section absent |

**Self-sufficiency assessment: FAIL** — Without a File Change Summary or Testing Expectations, a dev agent cannot implement this story from the AC + Dev Notes alone. The extensive inline source citations partially compensate for the missing References section, but the structural gaps must be filled.

---

### Amelia (Dev) — Implementation Feasibility

**Verdict: CONDITIONAL PASS — implementable once missing sections are added**

The chart specifications are detailed enough to build from. The `EngineOutput` field mappings are explicit. The `dashboard-charts.tsx` pattern reference provides a concrete example to follow.

**Implementation concern — Chart 6 field verification needed:** The story references `monthlyProjections[m].loanClosingBalance` and `totalCurrentAssets - totalCurrentLiabilities`. The dev agent should verify these exact field names on the `MonthlyProjection` interface in `shared/financial-engine.ts`. The story provides the engine line reference (line 572) which is helpful.

**Performance AC (AC 14) — testing approach unclear:** "500ms at 4x CPU throttle" is measurable but the story doesn't specify whether this is manual Chrome DevTools verification or an automated Playwright test with `page.metrics()`. Recommend clarifying as manual verification during story QA.

---

### Quinn (QA) — Test Coverage

**Verdict: FAIL — no testing section**

Without a Testing Expectations section, there is no guidance on:
- What to test (chart rendering, data transforms, tooltip content, error boundary)
- What framework to use (Vitest + RTL? Playwright?)
- Which ACs are critical for automated coverage
- Whether chart visual verification is manual or automated

**Recommendation:** Add Testing Expectations section covering:
- Unit tests for chart data transform functions (`useMemo` computations)
- Component tests: chart renders with mock `SensitivityOutputs`, correct `data-testid` attributes
- E2E: 6 charts render on Scenarios view, Chart 2 amber zone appears with cash-negative data
- Performance: manual Chrome DevTools verification at 4x CPU throttle
- Error boundary: component test triggering error state

---

## Story 10-2b: Metric Delta Cards & Dashboard Polish

### John (PM) — Product Alignment

**Verdict: CONDITIONAL PASS — metric card overlap with 10-1 needs resolution**

The 4 delta metrics (Break-Even, Y1 Revenue, 5-Year ROI, Y5 Cash) are well-chosen for headline impact. Desirability-based coloring logic is correctly specified (lower break-even = better → positive delta = amber).

**Critical overlap with Story 10-1 metric cards:** Story 10-1 already defines 5 metric cards with Base vs Your Scenario delta indicators. Story 10-2b adds 4 delta cards with similar data (3 of 4 metrics overlap). The relationship between these two widget sets is undefined:

| Metric | In 10-1? | In 10-2b? |
|--------|----------|-----------|
| Break-Even Month | Yes | Yes |
| 5-Year ROI % | Yes | Yes |
| Year-1 Revenue | Yes | Yes |
| Year-1 EBITDA | Yes | No |
| Year-1 Pre-Tax Income | Yes | No |
| Year-5 Cash | No | Yes |

If both coexist, the user sees 9 metric displays with 3 showing duplicate information in different formats. This is likely unintentional.

**Recommendation:** One of:
1. Story 10-2b's delta cards REPLACE 10-1's metric cards → remove metric card ACs from 10-1
2. Story 10-1's metric cards are removed when 10-2b is implemented → add explicit migration note
3. They serve different purposes → document the distinct value of each

---

### Winston (Architect) — Technical Design

**Verdict: CONDITIONAL PASS — architecture sound, structural sections missing**

1. **Presentational pattern** — Delta cards consume `SensitivityOutputs` as a prop. Anti-pattern prohibits engine calls.

2. **Data sources** — All 4 metric sources correctly mapped with unit conventions (cents ÷ 100, decimal × 100).

3. **Helper text lifecycle** — `hasInteractedWithSlider` state lifted to `WhatIfPlayground`, passed as prop. This is architecturally correct but creates coupling with Story 10-1.

**Missing sections (same as 10-2a):**

| Required Section | Present? |
|-----------------|----------|
| File Change Summary | **NO** |
| Dependencies & Env Vars (in Dev Notes) | **NO** (has a top-level Dependencies section for story ordering, but not the template's Dev Notes subsection) |
| Testing Expectations | **NO** |
| References | **NO** |
| Dev Agent Record | **NO** |

---

### Sally (UX) — User Experience

**Verdict: PASS — clear visual hierarchy guidance**

1. **Delta card strip** — 4-column on desktop, 2×2 on tablet/mobile. Subtle background band distinguishes from chart grid.

2. **Visual hierarchy** — Delta cards as "headline" (larger type, elevated background), charts as "supporting detail." Good information architecture.

3. **Delta formatting** — "Mo 14 → Mo 18 (+4 mo)" pattern is user-friendly. Compact dollar format ($142K) appropriate.

4. **Desirability coloring** — Green/amber based on whether the delta direction is desirable. Null break-even handled with neutral color.

5. **Helper text** — "Move a slider to see how it changes your metrics" — clear, encouraging, disappears after first interaction.

---

### Bob (SM) — Story Quality & Dev Readiness

**Verdict: FAIL — missing 4 required template sections**

| Criterion | Status | Notes |
|-----------|--------|-------|
| Clear user story statement | PASS | |
| 5 testable acceptance criteria | PASS | Clear and specific |
| Architecture patterns documented | PASS | 4 patterns |
| UI/UX deliverables | PASS | Comprehensive |
| Anti-patterns & hard constraints | PASS | 6 constraints |
| Gotchas & integration warnings | PASS | 5 gotchas |
| File Change Summary | **MISSING** | |
| Testing Expectations | **MISSING** | |
| References | **MISSING** | |
| Dev Agent Record | **MISSING** | |

**Self-sufficiency assessment: FAIL** — Same structural gaps as 10-2a.

---

### Quinn (QA) — Test Coverage

**Verdict: FAIL — no testing section**

Missing guidance on testing the 4 delta metrics, desirability-based coloring, null break-even handling (4 combinations), and helper text lifecycle.

---

## Cross-Story Issues

### Issue 1: Metric Card Overlap (10-1 vs 10-2b) — BLOCKING

Stories 10-1 and 10-2b both define metric/delta card widgets showing overlapping Base vs Your Scenario comparisons. The stories need to clearly define ownership:
- **Option A:** 10-1 owns the metric cards; 10-2b adds ONLY the delta strip with non-overlapping metrics
- **Option B:** 10-2b's delta cards REPLACE 10-1's metric cards entirely; 10-1 scope reduced to sliders + engine only
- **Option C:** Both coexist with distinct visual treatments (10-1 as detailed cards, 10-2b as compact strip) — but this must be explicitly documented

**Recommendation:** Option B is cleanest. Move all metric display to 10-2b (expanding its metric set if needed) and reduce 10-1 to sliders + engine + basic zero-state feedback only.

### Issue 2: Story 10.3 Forward References in 10-2a — NON-BLOCKING

Multiple ACs in 10-2a reference "If a saved scenario is loaded for comparison (Story 10.3)" without defining how the optional third scenario would be passed to the chart component. This should either be:
- Removed (let 10.3 extend charts when it arrives)
- Made explicit (define `comparison?: EngineOutput` in `SensitivityOutputs` interface)

### Issue 3: Helper Text Ownership (10-1 vs 10-2b) — NON-BLOCKING

Both stories define helper text "Move a slider to see how it changes your metrics":
- 10-1: displays when sliders are at zero (AC line 39)
- 10-2b: displays on initial load, disappears after first slider interaction (AC 2)

These may be the same text in the same location, or two separate instances. Clarify which story owns the helper text.

### Issue 4: Chart 2 Scope vs Epics.md — NON-BLOCKING

Epics.md defines Chart 2 with 3 series (Net Operating Cash Flow, Net Cash Flow, Ending Cash Balance). Story 10-2a simplifies to 1 series (Ending Cash Balance only). If this simplification is intentional, update epics.md.

### Issue 5: Epics.md Navigation Model Stale — NON-BLOCKING

Epics.md line 2191 still says `route: /plans/:planId/what-if` for the What-If Playground. The implemented approach (and Story 10-1's explicit anti-pattern) uses `WorkspaceViewContext` navigation. Epics.md should be updated to match.

---

## Revision Checklist

### Story 10-1 (revisions needed before returning to dev)

- [ ] Update File Change Summary: `sensitivity-engine.ts` action MODIFY (not CREATE), fix function signature to `currentSliders`, fix return type to `SensitivityOutputs`, fix scenario count to 2
- [ ] Fix gotcha: "Handle all three scenarios' possible nulls" → "both scenarios'"
- [ ] Add ROI formatting note: `fiveYearROIPct * 100` for display
- [ ] Resolve metric card overlap with Story 10-2b (see Cross-Story Issue 1)
- [ ] Update Dev Agent Record to note the SCP-2026-02-21 revision is pending re-implementation
- [ ] Update epics.md line 2191: remove `/plans/:planId/what-if` route reference, align with WorkspaceViewContext approach

### Story 10-2a (revisions needed before entering dev)

- [ ] Add File Change Summary section (list files to create/modify)
- [ ] Add Dependencies & Environment Variables section
- [ ] Add Testing Expectations section
- [ ] Add References section
- [ ] Add Dev Agent Record section (empty template)
- [ ] Resolve Story 10.3 forward references: either remove or define optional comparison prop
- [ ] Address Chart 1 visual density (10 lines) — add guidance on series differentiation
- [ ] Reconcile Chart 2 scope with epics.md (1 series vs 3)
- [ ] Clarify Performance AC 14 — manual vs automated verification

### Story 10-2b (revisions needed before entering dev)

- [ ] Add File Change Summary section
- [ ] Add Dependencies & Environment Variables section (in Dev Notes)
- [ ] Add Testing Expectations section
- [ ] Add References section
- [ ] Add Dev Agent Record section (empty template)
- [ ] Resolve metric card overlap with Story 10-1 (see Cross-Story Issue 1)
- [ ] Clarify helper text ownership relative to Story 10-1

---

## Approval

**Status:** NEEDS REVISION — All Three Active Stories
**Reviewed By:** John (PM), Winston (Architect), Sally (UX), Bob (SM), Amelia (Dev), Quinn (QA)
**Date:** 2026-02-22
**Next Action:** Address revision checklist items, then resubmit for review
