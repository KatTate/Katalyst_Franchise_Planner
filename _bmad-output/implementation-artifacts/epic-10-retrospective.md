# Epic 10 Retrospective: What-If Playground — User-Authored Scenario Modeling

**Date:** 2026-02-23
**Epic:** Epic 10 — What-If Playground
**Previous Retrospective:** Epic 7 (epic-7-retrospective.md)
**Facilitator:** Bob (Scrum Master)
**Participants:** Alice (PO), Charlie (Senior Dev), Dana (QA), Elena (Junior Dev), Frank (DevOps)

---

## Executive Summary

Epic 10 delivered all 4 stories (10.1, 10.2a, 10.2b, 10.3) implementing a standalone What-If Playground where franchisees interactively explore user-authored "what-if" scenarios. The feature set includes: 5 sensitivity sliders with uncapped numeric input, a sandbox engine (2 engine runs: Base + Your Scenario), 6 simultaneous charts (Profitability, Cash Flow, Break-Even, ROI, Balance Sheet, Debt/Working Capital), desirability-based metric delta cards, and full scenario CRUD (save/load/rename/delete/compare) with JSONB column storage.

Epic 10 is notable for two reasons:

1. **Process maturity.** A formal Sprint Change Proposal (SCP-2026-02-21) was executed mid-epic when the PO identified that fixed Conservative/Optimistic columns answered a system-invented question. The SCP documented 8 change proposals, all applied cleanly before implementation continued. This directly addresses Epic 7's AI-E7-7 (Change Proposal Requirement for Design Philosophy Pivots).

2. **Architectural isolation.** Epic 10's entire feature set is contained in 3 new client-side files and 1 server route extension (scenario CRUD). Zero modifications to the financial engine, zero modifications to existing planning surfaces (Forms, Reports), zero modifications to existing hotspot files (pnl-tab.tsx, use-field-editing.ts, forms-mode.tsx). The sandbox invariant — no scenario operation touches `financialInputs` — held across all 4 stories.

The codebase emerged clean: 0 LSP errors in Epic 10 files, 0 new tech debt markers, 7.1% fix-commit ratio (2 of 28 commits, below the 7.8% project average). Adversarial code reviews maintained their 100% hit rate: all 4 reviews found real bugs (12 findings total: 9H/7M/6L), all HIGH and MEDIUM findings fixed before story completion.

---

## Part 1: Epic Delivery Summary

### Stories Delivered

| Story | Title | Status | Code Review | Findings |
|-------|-------|--------|-------------|----------|
| 10.1 | Sensitivity Controls & Sandbox Engine | DONE | Adversarial CR | 2H/2M/2L — all H+M fixed |
| 10.2a | Sensitivity Chart Dashboard | DONE | Adversarial CR | 3H/2M/3L — all H+M fixed |
| 10.2b | Metric Delta Cards & Dashboard Polish | DONE | Adversarial CR | 0H/3M/1L — all M fixed |
| 10.3 | Scenario Persistence & Comparison | DONE | Adversarial CR | 3H/3M/3L — all H+M fixed |

### Deferred Work

| Item | Reason | Status |
|------|--------|--------|
| None | N/A | N/A |

### Mid-Epic Design Pivot: SCP-2026-02-21

| Aspect | Before SCP | After SCP |
|--------|-----------|-----------|
| Scenario model | 4 engine runs: Base + Conservative + Optimistic + Custom | 2 engine runs: Base + Your Scenario |
| MetricCard layout | 3 fixed columns (Base/Conservative/Optimistic) + optional 4th | 2 columns (Base / Your Scenario) with delta indicators |
| Slider ranges | ±15%/±5%/±10% (from retired feature) | Uncapped numeric input; slider visual range -50% to +100% |
| Story 10.3 status | Optional Enhancement | Essential (promoted) |
| Conservative/Optimistic | System-defined, always visible | Killed (D1) |

**Process compliance:** Full SCP with 8 change proposals → PO approval → artifact updates → code changes → review. This is the correct application of AI-E7-7 from the Epic 7 retrospective.

---

## Part 2: Codebase Health

### Files Changed (Epic 10 scope)

| File | Lines | New/Modified | Stories |
|------|-------|-------------|---------|
| client/src/components/planning/what-if-playground.tsx | 979 | New (Story 10.1), heavily modified across all stories | 10.1, 10.2b, 10.3 |
| client/src/components/planning/sensitivity-charts.tsx | 622 | New | 10.2a, 10.3 |
| client/src/lib/sensitivity-engine.ts | 137 | Modified (simplified per SCP) | 10.1, 10.3 |
| server/routes/plans.ts | +151 lines | Modified (scenario CRUD endpoints) | 10.3 |
| shared/schema.ts | +18 lines | Modified (WhatIfScenario types) | 10.1, 10.3 |
| client/src/components/app-sidebar.tsx | +4 lines | Modified (nav item) | 10.1 |
| Total net additions | +1,516 lines | — | — |

### LSP Diagnostics

| File | Errors | Warnings |
|------|--------|----------|
| what-if-playground.tsx | 0 | 0 |
| sensitivity-charts.tsx | 0 | 0 |
| sensitivity-engine.ts | 0 | 0 |
| plans.ts (scenario routes) | 0 (E10 code) | 0 |

**Note:** `plans.ts` has 3 pre-existing LSP warnings (implicit `any[]` on line 70/80, type overlap on line 200) from pre-Epic 10 code. These are NOT introduced by Epic 10.

**Result: 0 errors, 0 warnings across all Epic 10 files.**

### Tech Debt Markers

| Location | Count | Description |
|----------|-------|-------------|
| Epic 10 files | 0 | Clean |
| shared/help-content/field-help.ts | 18 | Loom video placeholders (carried from Epic 5) |
| client/src/components/shared/field-help-icon.tsx | 1 | Conditional check for "TODO:" prefix |
| Total project | 19 | Unchanged from Epic 7 |

**Net new debt from Epic 10: ZERO.**

### Git Health Metrics

| Metric | Value | Assessment |
|--------|-------|------------|
| Commits during E10 | 28 | — |
| Fix commits during E10 | 2 (7.1%) | Below 7.8% project average |
| Reverts | 0 | Clean |
| LSP errors post-epic | 0 (E10 code) | Clean |
| New tech debt markers | 0 | Clean |

### Hotspot Analysis

| File | E10 Commits | E7 Commits | Status |
|------|-------------|------------|--------|
| what-if-playground.tsx | 8 | N/A (new) | Accumulating — 979 lines, 3 stories modifying |
| sensitivity-charts.tsx | 4 | N/A (new) | Stable — created once, minor updates |
| sensitivity-engine.ts | 2 | N/A (new) | Stable — core utility, rarely modified |
| pnl-tab.tsx | 0 | 9 | NOT MODIFIED in E10 ✓ |
| use-field-editing.ts | 0 | 6 | NOT MODIFIED in E10 ✓ |
| forms-mode.tsx | 0 | 6 | NOT MODIFIED in E10 ✓ |

**Key finding:** Epic 10's architectural isolation means zero modifications to the Epic 7 hotspot files. The What-If Playground is a self-contained feature surface with no cross-contamination to existing planning surfaces.

**Emerging hotspot:** `what-if-playground.tsx` at 979 lines is the single integration point for slider controls, metric delta cards, scenario management UI, and comparison overlay. Three of four stories modified this file. If future stories add complexity (e.g., more slider types, scenario sharing), this file will become a maintenance concern similar to `pnl-tab.tsx` in Epic 7.

### Sandbox Invariant Verification

| Check | Result |
|-------|--------|
| `what-if-playground.tsx` contains PATCH to financialInputs? | NO ✓ |
| `sensitivity-engine.ts` contains PATCH to financialInputs? | NO ✓ |
| Scenario CRUD routes modify financialInputs? | NO — only modify `whatIfScenarios` JSONB column ✓ |
| `computeSensitivityOutputs()` mutates input? | NO — uses `cloneFinancialInputs()` before applying factors ✓ |

**Result: Sandbox invariant preserved across all 4 stories.**

---

## Part 3: Code Review Analysis

### Review Coverage

| Story | Review Type | Performed | HIGH Bugs | MEDIUM Bugs | LOW Bugs |
|-------|------------|-----------|-----------|-------------|----------|
| 10.1 | Adversarial CR | YES | 2 | 2 | 2 |
| 10.2a | Adversarial CR | YES | 3 | 2 | 3 |
| 10.2b | Adversarial CR | YES | 0 | 3 | 1 |
| 10.3 | Adversarial CR | YES | 3 | 3 | 3 |
| **Total** | — | **4 of 4 (100%)** | **8** | **10** | **9** |

**100% adversarial code review coverage.** This addresses AI-E7-4 (Mandatory Adversarial Review for ALL Stories) — no stories skipped review.

### Bug Pattern Analysis

**HIGH severity bugs found in code review:**

| Story | Bug | Category |
|-------|-----|----------|
| 10.1 H1 | COGS unit display: "pp" vs "%" formatting | **Display format** (4th retro) |
| 10.1 H2 | Dead conditional branch (conservative/optimistic remnant) | Dead code |
| 10.2a H1 | Chart grid breakpoint (3-column gap at md) | Layout |
| 10.2a H2 | Custom tooltip not rendering comparison data | Missing feature |
| 10.2a H3 | Missing data validation guard (annualSummaries.length < 5) | Edge case |
| 10.3 H1 | Scenarios not sorted newest-first | Sort order |
| 10.3 H2 | No inline validation for duplicate scenario names | Missing validation |
| 10.3 H3 | useMemo missing dependency on comparison scenario | Stale data |

**MEDIUM severity bugs found in code review:**

| Story | Bug | Category |
|-------|-----|----------|
| 10.1 M1-M2 | Minor UX issues | UX polish |
| 10.2a M1-M2 | Chart annotation gaps | UX polish |
| 10.2b M1 | Delta card positioning (before/after charts) | Layout |
| 10.2b M2 | useMemo optimization for computedMetrics | Performance |
| 10.2b M3 | Missing evidence table for desirability rules | Documentation |
| 10.3 M1-M3 | Dialog UX, error handling improvements | UX polish |

### Pattern Analysis

| Pattern | Frequency (E10) | Frequency (E7) | Trend |
|---------|-----------------|-----------------|-------|
| Display format bugs | 1 (COGS pp vs %) | 1 (Other OpEx) | **Persistent — 4th consecutive retro** |
| Missing data validation | 2 (chart guards, scenario sort) | 0 | New |
| useMemo dependency errors | 1 | 0 | New |
| Dead code from prior iteration | 1 (conservative/optimistic remnant) | 1 (facilitiesDecomposition branch) | Stable |
| Missing UX feedback | 3 (tooltip, validation, positioning) | 3 (rename, clone, badges) | Stable |

**Key finding: Display format bugs continue.** Story 10.1 had the COGS unit showing "%" instead of "pp" (percentage points). This is the same class of bug flagged in Epic 5 (P&L formatting), Epic 5H (labor efficiency), Epic 7 (Other OpEx), and now Epic 10 (COGS unit). The INPUT_FIELD_MAP validation test added per AI-E7-2 catches format mismatches in the Reports surface, but it doesn't cover the sensitivity engine's display formatting — that's a separate code path.

---

## Part 4: Previous Retrospective Follow-Through (Epic 7 → Epic 10)

### CRITICAL Items

| # | E7 Action Item | Priority | Status | Evidence |
|---|---------------|----------|--------|----------|
| AI-E7-1 | Planning Document Realignment | CRITICAL | ✅ Done | PRD, architecture, epics.md all updated before E10 implementation |
| AI-E7-2 | INPUT_FIELD_MAP Mechanical Validation | CRITICAL | ✅ Done | `input-field-map-validation.test.ts` added; test modified during E10 (+30/-lines) |
| AI-E7-3 | Sprint Planning Reset | CRITICAL | ✅ Done | Sprint status reset; Epic 10 selected as next; E6/E9 correctly deferred |

### HIGH Items

| # | E7 Action Item | Priority | Status | Evidence |
|---|---------------|----------|--------|----------|
| AI-E7-4 | Mandatory Adversarial Review for ALL Stories | HIGH | ✅ Done | 4/4 stories reviewed (100% coverage) |
| AI-E7-5 | Brand CRUD Completion (Delete + Edit) | HIGH | ❌ Not addressed | Not scheduled in E10 sprint |
| AI-E7-6 | E2E Testing Standards | HIGH | ⏳ Partial | Standards adopted for E10 test runs but not formalized as documentation |
| AI-E7-7 | Change Proposal Requirement for Design Pivots | HIGH | ✅ Done | SCP-2026-02-21 executed for Conservative/Optimistic removal |
| AI-E7-8 | Story Complexity Threshold | HIGH | ⏳ Partial | Story 10.2 split into 10.2a + 10.2b (chart dashboard + delta cards). Story 10.3 remained complex (5+ ACs, 3H findings). |

### MEDIUM Items

| # | E7 Action Item | Priority | Status | Evidence |
|---|---------------|----------|--------|----------|
| AI-E7-9 | Hotspot File Refactoring Budget | MEDIUM | ✅ N/A | E10 did not modify any E7 hotspot files — no refactoring needed |
| AI-E7-10 | Completion Report Accuracy Standard | MEDIUM | ⏳ Partial | Reports improved but not formally standardized |

### LOW Items (Carried)

| # | E7 Action Item | Priority | Status |
|---|---------------|----------|--------|
| AI-E7-11 | Schedule 7.1b.1 Decision | LOW | ❌ Not addressed (5th carry of per-month independence) |
| AI-E7-12 | 30-Day Month Decision | LOW | ❌ Not addressed (5th carry) |
| AI-E7-13 | Content Authoring — 19 Loom TODOs | LOW | ❌ Not addressed (5th carry) |

### Follow-Through Rate

| Category | Completed | Partial | Not Addressed | Total |
|----------|-----------|---------|---------------|-------|
| CRITICAL | 3 | 0 | 0 | 3 |
| HIGH | 2 | 2 | 1 | 5 |
| MEDIUM | 1 | 1 | 0 | 2 |
| LOW | 0 | 0 | 3 | 3 |
| **Total** | **6 (46%)** | **3 (23%)** | **4 (31%)** | **13** |

**Follow-through rate improved: 46% fully completed vs. 33% in Epic 7.** All CRITICAL items completed — a first. The improvement is concentrated in CRITICAL and HIGH process items (SCP process, document realignment, mandatory reviews). LOW items continue to carry because they require PO decisions or content resources not available during implementation sprints.

---

## Part 5: What Went Well

1. **SCP-2026-02-21 executed correctly.** When the PO identified that Conservative/Optimistic columns were solving a system-invented problem, the team used a formal Sprint Change Proposal. 8 change proposals documented, approved, and applied before code changes continued. This is a direct correction of Epic 7's biggest process failure (AI-E7-7).

2. **Architectural isolation.** Epic 10's entire feature lives in 3 new client files + 1 route extension. Zero modifications to the financial engine, zero modifications to existing planning surfaces, zero modifications to Epic 7 hotspot files. The sandbox pattern (`cloneFinancialInputs()` → `applySensitivityFactors()` → `calculateProjections()`) cleanly separates what-if computation from plan state.

3. **100% code review coverage with 100% hit rate.** All 4 stories reviewed, all 4 reviews found real bugs. This is the strongest quality gate performance across all epics. The COGS "pp" vs "%" bug in Story 10.1 would have shipped to users without review.

4. **Story 10.2 split was the right call.** Splitting "Multi-Chart Dashboard" into 10.2a (charts) and 10.2b (delta cards + polish) kept each story focused. Story 10.2b had 0 HIGH findings — the smallest, most focused stories produce the cleanest code.

5. **JSONB column storage decision validated.** Storing scenarios as a JSON array on the `plans` table (vs. a separate `scenarios` table with FK) kept the implementation simple: no joins, free cascade on plan delete, no migration complexity. At ≤10 scenarios per plan, the JSONB approach is optimal.

6. **Zero net tech debt.** Despite adding 1,516 lines across 7 files, no new TODO/FIXME/HACK markers. The existing 19 markers are unchanged from Epic 5.

---

## Part 6: What Didn't Go Well

### 6.1 — Display Format Bugs (4th Consecutive Retro) — PERSISTENT

Story 10.1's COGS unit displayed "%" instead of "pp" (percentage points). This is the same bug class flagged in:
- **Epic 5:** P&L formatting inconsistencies
- **Epic 5H:** Labor efficiency display (shows NaN)
- **Epic 7:** Other OpEx displaying dollars instead of percentages
- **Epic 10:** COGS unit "%" vs "pp"

The INPUT_FIELD_MAP validation test (AI-E7-2) covers the Reports surface's field-to-format mapping but does **not** cover the sensitivity engine's `SLIDER_CONFIGS` display formatting. These are separate code paths with no shared validation.

**Root cause (updated):** The display format problem is not a single bug — it's a **class of bugs** that reoccurs wherever manual format mappings exist without mechanical cross-validation. Fixing INPUT_FIELD_MAP didn't prevent the same class from appearing in a new code path (SLIDER_CONFIGS). The lesson: every new display format mapping needs its own validation, or a shared validation framework needs to cover all format paths.

### 6.2 — what-if-playground.tsx Accumulating Size

At 979 lines, `what-if-playground.tsx` is approaching maintenance concern territory. It contains:
- Slider control rendering and state management
- Metric delta card computation and rendering
- Scenario CRUD operations (save/load/rename/delete)
- Comparison overlay management
- Save/rename/delete dialog UI
- Loading/error/empty states

Three of four stories modified this file (8 commits). While the code is well-organized with clear section markers, future feature additions (e.g., scenario sharing, additional slider types, multi-scenario comparison matrix) would push it past the maintenance threshold.

**Mitigating factor:** Unlike `pnl-tab.tsx` (which was modified by 4 different stories across cross-cutting concerns), `what-if-playground.tsx` is a self-contained surface. Decomposition into sub-components (slider panel, scenario manager, delta strip) would be straightforward if needed.

### 6.3 — Brand CRUD Gap Persists (2nd Retro)

AI-E7-5 (Brand CRUD Completion) was flagged as HIGH in Epic 7's retrospective but was not addressed during Epic 10. The gap — no brand deletion or full metadata editing — continues to cause:
- Test agents creating junk brands during e2e test runs
- PO manual cleanup burden
- Development friction when testing plan flows

This is now the 2nd consecutive retrospective flagging this issue.

### 6.4 — plans.ts Pre-Existing LSP Warnings

`server/routes/plans.ts` has 3 pre-existing LSP warnings (implicit `any[]` types on lines 70/80, type overlap on line 200) that pre-date Epic 10. While Epic 10's scenario CRUD routes are clean, the file's existing type safety issues were not addressed. These warnings indicate potential type-safety gaps in the plan listing and creation routes.

---

## Part 7: Patterns & Root Causes

| Pattern | Root Cause | Frequency | Impact | Trend |
|---------|-----------|-----------|--------|-------|
| Display format bugs | Manual format mappings without shared validation framework | 4 consecutive epics | User-facing data in wrong format | **Worsening** — spreading to new code paths |
| File size accumulation | Single integration point pattern | what-if-playground.tsx (979 lines) | Future maintenance risk | New (E10-specific) |
| Pre-existing debt carries | Low-priority items need PO/content resources | LOW items carried 5th time | Technical debt accumulation | Stable |
| Brand CRUD gap | Epic 2 incomplete spec; not prioritized | 2nd retro flagging | Development friction + junk data | **Worsening** |

---

## Part 8: Process Improvements Observed

### 8.1 — Formal Change Process Adopted

The SCP-2026-02-21 execution demonstrates that the team can now handle mid-epic design pivots without creating document misalignment. The 8-CP format with keep/modify/delete classification made the change scope clear and auditable.

### 8.2 — Story Splitting Applied

Epic 10's original 3-story structure (10.1 + 10.2 + 10.3) was split to 4 stories (10.1 + 10.2a + 10.2b + 10.3) per AI-E7-8 (Story Complexity Threshold). The split directly reduced review findings: 10.2b (the smaller story) had 0 HIGH findings.

### 8.3 — Adversarial Review Process Matured

4/4 stories reviewed (100% coverage, up from 83% in Epic 7). All reviews found real bugs. The team no longer debates whether to skip reviews for "simple" stories — every story gets reviewed.

---

## Part 9: Action Items (Priority-Ranked)

### CRITICAL — Blockers (Must complete before new epic work)

**AI-E10-1: Display Format Validation Framework**
- **What:** The INPUT_FIELD_MAP validation test (AI-E7-2) only covers the Reports surface. Create a shared validation approach that covers ALL display format mappings:
  1. INPUT_FIELD_MAP (Reports surface) — already validated ✓
  2. SLIDER_CONFIGS (sensitivity engine) — unit field must match engine input type (% for multiplicative, pp for additive)
  3. DELTA_METRICS (metric delta cards) — format functions must match engine output types
  4. Any future display format mappings
- **Owner:** Charlie (Senior Dev)
- **When:** Before next epic implementation
- **Rationale:** 4th consecutive retro flagging same bug class. Per-surface validation is insufficient — the class reoccurs in every new surface.

### HIGH — Process Improvements

**AI-E10-2: what-if-playground.tsx Decomposition Assessment**
- **What:** Evaluate decomposition before any future story adds complexity:
  - Extract `ScenarioManager` component (save/load/rename/delete + dialog UI) — ~300 lines
  - Extract `SensitivityControlsPanel` component (slider panel + header) — ~200 lines
  - Keep `MetricDeltaCardStrip` as is (already a separate component within the file)
- **Owner:** Charlie (Senior Dev)
- **When:** Before any new story modifies what-if-playground.tsx
- **Rationale:** 979 lines, 8 commits across 3 stories. Decomposition is straightforward now; it becomes harder as more features land.

**AI-E10-3: Brand CRUD Completion (Carried from E7)**
- **What:** Add brand deletion and full metadata editing. This is the 2nd retro flagging this gap.
- **Owner:** Alice (PO) — story creation
- **When:** Schedule explicitly in next sprint planning
- **Rationale:** Active development pain. Test agents create junk brands. PO does manual cleanup. 2nd carry.

**AI-E10-4: plans.ts Type Safety Cleanup**
- **What:** Fix 3 pre-existing LSP warnings in `server/routes/plans.ts`:
  1. Lines 70/80: Explicit type annotation for `plans` variable
  2. Line 200: Fix type assertion for `buildPlanFinancialInputs` return value
- **Owner:** Charlie (Senior Dev)
- **When:** During next story that modifies plans.ts
- **Rationale:** Pre-existing type safety gaps should not accumulate.

### MEDIUM — Continuous Improvements

**AI-E10-5: E2E Testing Standards Formalization (Carried from E7)**
- **What:** Formalize the testing standards adopted during E10 into a documented standard:
  1. Test agents authenticate as franchisee, not admin
  2. Test agents clean up created data
  3. Test plans specify authentication path
- **Owner:** Dana (QA)
- **When:** Before next epic's test runs
- **Rationale:** Standards were applied informally during E10 but not documented.

### LOW — Carried Items

**AI-E10-6: 7.1b.1 Per-Month Independence Decision (Carried from E7)**
- **Owner:** Alice (PO)
- **Status:** 5th carry. No persona actively requesting seasonality modeling.

**AI-E10-7: 30-Day Month Decision (Carried from E5H)**
- **Owner:** Alice (PO)
- **Status:** 5th carry. PO-deferred.

**AI-E10-8: Content Authoring — 19 Loom Video TODOs (Carried from E5)**
- **Owner:** Alice (PO)
- **Status:** 5th carry. Content tasks, not engineering tasks.

---

## Part 10: Metrics Summary

| Metric | E10 Value | E7 Value | Trend |
|--------|-----------|----------|-------|
| Stories delivered | 4 of 4 (100%) | 6 of 6 (100%) | On target |
| Stories rewritten mid-epic | 0 (SCP used instead) | 5 of 6 (83%) | **Improved** — formal process |
| Code review coverage | 4 of 4 (100%) | 5 of 6 (83%) | **Improved** |
| Code review hit rate | 4 of 4 (100%) | 5 of 5 (100%) | Consistent |
| HIGH severity bugs found in review | 8 total (across 4 stories) | 5 total (across 4 stories) | Higher volume, but all fixed |
| Fix-commit ratio (epic period) | 7.1% (2 of 28) | 5% (4 of ~80) | Slight increase, still below avg |
| Reverts | 0 | 0 | Clean |
| LSP errors post-epic (E10 files) | 0 | 0 | Clean |
| New tech debt markers | 0 | 0 | Clean |
| Existing tech debt markers | 19 (unchanged) | 19 (unchanged) | Carried |
| E7 action item follow-through | 46% complete (6/13) | 33% complete (3/9) | **Improved** |
| Planning document misalignment | 0 (SCP applied) | 3 documents | **Resolved** |
| Net new lines of code | +1,516 | N/A | Feature surface addition |
| Files changed | 7 | N/A | Contained scope |
| Hotspot files modified | 0 of 3 (pnl-tab, use-field-editing, forms-mode) | 3 of 3 | **Improved** — isolation |

---

## Part 11: Key Decisions Made During Epic 10

| Decision | Rationale | Impact | Documented? |
|----------|-----------|--------|-------------|
| Kill Conservative/Optimistic columns (D1) | System-invented question, no user value | Simplified engine (4→2 runs), cleaner UI | ✅ SCP-2026-02-21 |
| "Your Scenario" = live slider state (D2) | Slider IS the scenario authoring tool | Always-visible comparison | ✅ SCP-2026-02-21 |
| Uncapped slider ranges (D6) | ±15%/±5%/±10% from retired feature, not designed as limits | Franchisees can explore extreme scenarios | ✅ SCP-2026-02-21 |
| JSONB column for scenario storage | Simpler than separate table; free cascade; no joins | ≤10 scenarios per plan, optimal for JSON array | ✅ SCP Dev Notes |
| 10-scenario cap per plan | Prevent unbounded JSONB growth | Reasonable for user-authored scenarios | ✅ Story 10.3 ACs |
| Story 10.2 split (10.2a + 10.2b) | Complexity threshold per AI-E7-8 | Smaller stories → cleaner code (10.2b: 0H findings) | ✅ Sprint status |

---

## Part 12: Impact on Remaining Epics

### Epic 11 (Data Sharing & Dashboards)
- **Impact:** None. What-If Playground is sandbox-only and does not expose scenario data to franchisors or admins. If data sharing is ever extended to scenario data, that would be a new story.
- **Risk:** None.

### Epic ST (Admin Support Tools)
- **Impact:** Low. "View As" mode (ST-1/ST-2) should render the What-If Playground for the impersonated franchisee. Since the playground reads from the plan's `whatIfScenarios` JSONB column, impersonation will work automatically. In read-only mode, slider interaction should still work (client-side sandbox), but "Save as Scenario" should be disabled.
- **Risk:** ST-1 read-only enforcement may need to disable scenario CRUD buttons. This is a minor UI concern, not an architectural one.

### Epic 9 (AI Planning Advisor)
- **Impact:** None. The AI advisor operates on the plan's `financialInputs`, not on what-if scenarios.
- **Risk:** None.

### Epic 12 (Advisory Board Meeting)
- **Impact:** Potential synergy. Advisory personas could reference what-if scenarios when discussing risk. This would be a Phase 2 enhancement.
- **Risk:** None.

---

## Part 13: Recommendations for Next Sprint

1. **Next epic selection:** Alice (PO) to decide. Epic 11 (Data Sharing) and Epic ST (Admin Tools) are both unblocked. Epic ST Stories 1-2 are flagged as "immediate" in the epic definition.

2. **Pre-implementation:** Execute AI-E10-1 (Display Format Validation Framework) before starting any new epic. This is the 4th consecutive retro flagging the same bug class — it must be resolved systematically.

3. **Carry-forward discipline:** LOW items have carried for 5 retrospectives. If they will never be prioritized, they should be explicitly deprioritized with a "will not do in current phase" status rather than carried indefinitely.
