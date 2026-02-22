# Sprint Change Proposal — Post-Epic-7 Course Correction & Stabilization

**Date:** 2026-02-22
**Triggered By:** Epic 7 Retrospective + Implementation Readiness Report (2026-02-22)
**Workflow:** Correct Course (BMAD 4-Implementation)
**Mode:** Batch (all proposals presented together)
**Approver:** PO (User)

---

## Section 1: Issue Summary

### Problem Statement

Epic 7 delivered all 6 stories successfully with clean code (0 LSP errors, 0 new tech debt), but the implementation process created three categories of problems that must be resolved before new feature work begins:

**1. Planning Document Misalignment.** During Epic 7, all stories were rewritten mid-epic and a core design philosophy was adopted informally ("Forms = onboarding wizard / Reports = power editing surface"). While the correct decisions were made, the formal Sprint Change Proposal process was not followed. This left the UX specification describing pre-Epic-7 designs. The PRD and architecture were partially updated post-epic (2026-02-22) but gaps remain — notably, no FR exists for multi-plan CRUD despite it being fully implemented in Story 7.2.

**2. Sprint Plan Stale & Epic Sequencing Wrong.** The PO has directed that Epic 6 (PDF Generation) and Epic 9 (AI Planning Advisor) are NOT next — both are presentation/intelligence layers that would require repeated rework as the core system continues evolving. The current sprint plan doesn't reflect this. Additionally, a stabilization mini-epic is needed before any feature epic to address accumulated gaps.

**3. Per-Month Independence Incomplete.** Story 7.1b.1 was deferred during Epic 7 as a "backlog" item, but per-month independence for qualifying fields (revenue, COGS%, labor%, marketing%) was a core deliverable of the Epic 7 data model restructuring. The `storedGranularity` infrastructure exists in `INPUT_FIELD_MAP` and the `scaleForStorage` function handles monthly/quarterly/annual conversions, but the actual 60-element per-month arrays and the UI for independent monthly editing have not been built. This must be completed, not deferred.

### Evidence

- **Epic 7 Retrospective** (2026-02-21): Documents the mid-epic story rewrite, design pivot, and document misalignment inventory
- **Implementation Readiness Report** (2026-02-22): Status "CONDITIONAL GO — WITH SIGNIFICANT BLOCKERS" with 3 CRITICAL blockers, 5 HIGH-priority items
- **Codebase audit** (2026-02-22): `INPUT_FIELD_MAP` shows `storedGranularity: "monthly"` only on `monthlyAuv`. All per-year fields use 5-element arrays (`[number, number, number, number, number]`). 60-element monthly arrays do not exist in the schema or engine input types.

---

## Section 2: Impact Analysis

### Epic Impact

| Epic | Impact | Details |
|------|--------|---------|
| **Epic 7 (DONE)** | Story gap | 7.1b.1 (per-month independence) must be completed — was incorrectly deferred |
| **Epic 6 (PDF)** | Deprioritized | PO directive: NOT next. Presentation layer would require rework as core evolves |
| **Epic 9 (AI Advisor)** | Deprioritized | PO directive: NOT next. Intelligence layer — same rework risk |
| **Epic 10 (What-If)** | Next feature epic | After stabilization mini-epic completes |
| **Epic 2 (Brand Config)** | Gap fix needed | Brand CRUD (delete + edit) missing since Epic 2 — causing active dev pain |
| **NEW: Stabilization Mini-Epic** | Added | Document alignment + Brand CRUD + per-month independence + testing infra |

### Story Impact

| Story | Status | Change |
|-------|--------|--------|
| 7.1b.1 Per-Month Independence | Was "backlogged" | Promoted to REQUIRED — included in stabilization mini-epic |
| Brand CRUD (delete + edit) | Unfiled gap from Epic 2 | New story in stabilization mini-epic |
| Document Realignment | Action item AI-E7-1 | New story in stabilization mini-epic |
| INPUT_FIELD_MAP Validation | Action item AI-E7-2 | New story in stabilization mini-epic |
| E2E Testing Standards | Action item AI-E7-6 | New story in stabilization mini-epic |

### Artifact Conflicts

| Document | Last Updated | Issues |
|----------|-------------|--------|
| **PRD** | 2026-02-22 | Missing FR98 (multi-plan CRUD). Two-surface design principle is documented. |
| **Architecture** | 2026-02-22 | Two-surface principle documented. Per-month deferred status needs update (it's no longer deferred). |
| **Epics** | 2026-02-22 | Epic 10 description stale (still references "Conservative, and Optimistic scenarios" — killed per SCP-2026-02-21). Epic 10 status says "Deferred" but Epic 5 is complete. Stabilization mini-epic doesn't exist yet. 7.1b.1 listed as "backlogged" — needs promotion. FR Coverage Map needs FR98. |
| **UX Spec** | 2026-02-18 | Predates Epic 7. 5 issues: (1) two-surface boundary not explicit, (2) pre-Epic-7 per-year section stale, (3) facilities decomposition missing, (4) story rewrite section stale, (5) sidebar structure divergent from implementation |
| **Sprint Status** | 2026-02-21 | Stale. Needs full reset with stabilization mini-epic and updated epic sequencing |

### Technical Impact

- **Schema change required:** `PlanFinancialInputs` must support 60-element arrays for qualifying fields (revenue, COGS%, labor%, marketing%) alongside existing 5-element per-year arrays
- **Engine input types:** `EngineInput.financialInputs` currently uses 5-element tuples — must handle monthly granularity for qualifying fields
- **UI change required:** Reports inline editing must support per-month editing at the monthly drill level for qualifying fields
- **No rollback needed:** All existing code is correct and clean. Changes are additive.

---

## Section 3: Recommended Approach

### Selected Path: Direct Adjustment (Option 1) with New Stabilization Mini-Epic

**No rollback.** Epic 7's code is correct. No MVP scope reduction. The issues are:
- Document drift (fix by updating all 4 documents together)
- Missing feature (fix by implementing 7.1b.1)
- Accumulated gaps (fix via stabilization mini-epic)
- Wrong epic sequencing (fix via sprint planning reset)

### Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Per-month implementation touches engine input types | MEDIUM | 7.1a already built the migration framework and storedGranularity infrastructure — extending to 60-element arrays follows established patterns |
| Document realignment could introduce new inconsistencies | LOW | All 4 documents updated in one pass, then verified via IR check |
| Brand CRUD could affect existing brand data | LOW | Delete requires confirmation, edit is metadata only |
| Stabilization delays next feature epic | ACCEPTED | Technical debt compounds — paying it now prevents larger problems later |

### PO-Directed Epic Sequencing

| Order | Epic | Rationale |
|-------|------|-----------|
| **NEXT** | Stabilization Mini-Epic (7H) | Document alignment + Brand CRUD + per-month independence + testing infra |
| **THEN** | Epic 10 (What-If Playground) | Standalone sidebar feature, contained scope, builds on Epic 7 foundation |
| **THEN** | Epic 8 (Advisory Guardrails) | Extends core editing system |
| **THEN** | Epic 11 (Data Sharing & Dashboards) | Pipeline visibility layer |
| **LATER** | Epic ST (Admin Support Tools) | ST-4 blocked on Epic 11.2 |
| **LAST** | Epic 6 (PDF Generation) | Presentation layer — wait for core to stabilize |
| **LAST** | Epic 9 (AI Planning Advisor) | Intelligence layer — wait for core to stabilize |
| **PHASE 2** | Epic 12 (Advisory Board Meeting) | Deferred per PRD |

---

## Section 4: Detailed Change Proposals

### CP-1: Add FR98 to PRD (Multi-Plan CRUD)

**Document:** PRD
**Section:** Functional Requirements — Section 2 (Guided Planning Experience) or new Section 18

OLD:
*No FR for multi-plan management exists*

NEW:
```
FR98: Franchisee can create, rename, clone (deep copy), and delete financial plans.
Cloning creates an independent copy of all financial inputs. Deletion requires
type-to-confirm and is blocked if only one plan remains (last-plan protection).
Plan list is visible in the sidebar with context menus for lifecycle actions.
```

**Rationale:** Epic 7.2 implemented this capability but it has no PRD traceability. Future agents won't know this is a required feature.

---

### CP-2: Update Architecture — Per-Month Independence Status

**Document:** Architecture
**Section:** Two-Surface Architecture, line ~94

OLD:
```
**Deferred: 7.1b.1 Per-Month Independence.** 60-element arrays for revenue, COGS%,
labor%, marketing% are architecturally supported (storedGranularity infrastructure
exists) but UI for monthly editing is backlogged pending PO decision. No persona is
actively requesting seasonality modeling.
```

NEW:
```
**7.1b.1 Per-Month Independence (Stabilization Mini-Epic).** 60-element arrays for
revenue, COGS%, labor%, marketing% — extending the per-year infrastructure built in
Epic 7.1a. storedGranularity infrastructure and scaleForStorage conversion functions
are in place. Implementation requires: (a) schema extension from 5-element to
60-element arrays for qualifying fields, (b) engine input type updates, (c) Reports
UI for per-month editing at monthly drill level. Scheduled as part of the
post-Epic-7 stabilization mini-epic.
```

**Rationale:** Per-month independence is no longer deferred — PO has directed implementation.

---

### CP-3: Update Epics — Epic 10 Description (Stale Scenario References)

**Document:** Epics
**Section:** Epic 10 summary (line ~355-359)

OLD:
```
Standalone sidebar destination providing interactive graphical sensitivity analysis.
Franchisees adjust assumption sliders (revenue, COGS, labor, marketing, facilities)
and see 6 simultaneous charts (Profitability, Cash Flow, Break-Even, ROI, Balance
Sheet, Debt & Working Capital) update across Base, Conservative, and Optimistic
scenarios. This is a planning sandbox — slider adjustments do NOT change the user's
actual plan. Replaces the retired Story 5.7 column-splitting approach. Per
SCP-2026-02-20 Decision D5/D6 and Section 3.
```

NEW:
```
Standalone sidebar destination providing interactive graphical sensitivity analysis.
Franchisees adjust assumption sliders (revenue, COGS, labor, marketing, facilities)
and see 6 simultaneous charts (Profitability, Cash Flow, Break-Even, ROI, Balance
Sheet, Debt & Working Capital) comparing Base Case vs Your Scenario (user's live
slider state). This is a planning sandbox — slider adjustments do NOT change the
user's actual plan. Replaces the retired Story 5.7 column-splitting approach.
Per SCP-2026-02-21: Conservative/Optimistic system-defined columns killed (D1),
replaced with user-authored scenario model (D2/D3). Slider ranges: ±50%/±100%
visual range, uncapped numeric input (D6).
**Status:** Ready — Epic 5 dependency satisfied. Scheduled after stabilization
mini-epic.
```

**Rationale:** SCP-2026-02-21 killed Conservative/Optimistic scenarios and replaced with user-authored model. Current description references the killed design. Status says "Deferred" but Epic 5 is complete.

---

### CP-4: Update Epics — 7.1b.1 Status Change

**Document:** Epics
**Section:** Epic 7 summary (line ~343)

OLD:
```
**Deferred:** 7.1b.1 Per-Month Independence (60-element arrays for revenue, COGS%,
labor%, marketing%) — backlogged pending PO decision
```

NEW:
```
**Remaining:** 7.1b.1 Per-Month Independence (60-element arrays for revenue, COGS%,
labor%, marketing%) — scheduled in stabilization mini-epic (Epic 7H). Infrastructure
(storedGranularity, scaleForStorage) in place from 7.1a.
```

**Rationale:** PO has directed implementation. This was a core deliverable of the Epic 7 data model restructuring.

---

### CP-5: Add Stabilization Mini-Epic (7H) to Epics

**Document:** Epics
**Section:** After Epic 7 summary, before Epic 8

NEW (insert after Epic 7):
```
### Epic 7H: Post-Epic-7 Stabilization Sprint
Resolve accumulated gaps from Epic 7's mid-epic design pivot, complete the per-month
independence feature that was the core motivation for Epic 7's data model restructuring,
fix the Brand CRUD gap from Epic 2, and establish testing infrastructure standards.
All planning documents (PRD, Architecture, Epics, UX Spec) are realigned in this epic
to reflect what was actually built.

**Stories (5):**
- 7H.1 Planning Document Realignment — Update all 4 planning documents (PRD, Architecture,
  Epics, UX Spec) to reflect Epic 7 implementation decisions. Add FR98 (multi-plan CRUD).
  Update Epic 10 description. Remove stale pre-Epic-7 content from UX spec. Add facilities
  decomposition to UX spec. Update sidebar wireframe.
- 7H.2 Per-Month Independence (7.1b.1) — Extend PlanFinancialInputs schema from 5-element
  per-year arrays to 60-element per-month arrays for qualifying fields (revenue, COGS%,
  labor%, marketing%). Update engine input types. Add Reports UI for per-month editing at
  monthly drill level. Forms unchanged (single-value + "Set for all years" only).
- 7H.3 Brand CRUD Completion — Add brand deletion (with confirmation) and full metadata
  editing (name, display name, slug) to the brand management interface. Resolves Epic 2
  gap that is actively causing development pain (test agents create junk brands requiring
  manual PO cleanup).
- 7H.4 INPUT_FIELD_MAP Mechanical Validation — Add test-time assertion verifying every
  INPUT_FIELD_MAP entry has a format type matching FIELD_METADATA / engine output type.
  Build fails if a percentage field is mapped as currency. Closes the recurring display
  format bug (flagged in 3 consecutive retrospectives).
- 7H.5 E2E Testing Standards & Infrastructure — Document and enforce: test agents must
  authenticate as franchisee (not admin), must not use demo mode, must clean up test data.
  Update test helpers and documentation. Prevents junk brand accumulation and wasted tokens.

**Dependency chain:** 7H.1 (no code dependencies, can start immediately) → 7H.2 (extends
7.1a infrastructure) | 7H.3, 7H.4, 7H.5 (independent, can parallel)
```

**Rationale:** Stabilization mini-epic consolidates all CRITICAL and HIGH action items from the Epic 7 retrospective plus the incomplete per-month feature.

---

### CP-6: Update Epics — FR Coverage Map

**Document:** Epics
**Section:** FR Coverage Map (lines ~190-294)

ADD:
```
| FR98 | Epic 7 | Multi-plan lifecycle: create, rename, clone, delete with last-plan protection |
```

UPDATE Coverage Summary:
```
**Coverage Summary:** 112/112 FRs mapped (was 111/111)
```

**Rationale:** FR98 added per CP-1. Coverage map must stay in sync.

---

### CP-7: Update UX Spec — 5 Issues from Readiness Report

**Document:** UX Design Specification (Consolidated)
**Issues to resolve:**

1. **Part 7 (Two-Door Model):** Add explicit statement that Forms (My Plan) deliberately does NOT replicate Reports' per-year or per-month editing. Forms provides single-value inputs with "Set for all years" checkbox only. This is the two-surface design principle boundary.

2. **Part 10 (Pre-Epic-7 Per-Year Behavior section):** Mark as historical or remove. Epic 7 has been delivered — per-year editing is now independent. The link icons and broadcast behavior described no longer apply.

3. **Part 8 (My Plan sections):** Add facilities decomposition interaction pattern: Rent + Utilities + Telecom + Vehicle + Insurance sub-fields with rollup to total. Informational note when decomposition sum differs from Reports total (no action buttons, no proportional redistribution).

4. **Part 19 (Story Rewrite Implications):** Mark as historical. The 10-story structure suggested for Epic 5 was superseded by actual implementation.

5. **Part 7 (Sidebar wireframe):** Update to reflect actual implementation: "MY PLANS" section listing all plans with context menus (Epic 7.2), not "MY LOCATIONS → All Plans."

**Rationale:** UX spec last updated 2026-02-18, before Epic 7 delivery. These 5 issues create potential for design inconsistency if agents reference the spec for future work.

---

### CP-8: Sprint Status Reset

**Document:** sprint-status.yaml
**Action:** Full reset to reflect:
- Epic 7H (stabilization) added as next in-progress epic
- Stories 7H.1-7H.5 added with status "backlog"
- Epic 10 status updated: dependency satisfied (Epic 5 done), scheduled after 7H
- Epic sequencing updated per PO direction (Section 3 of this proposal)
- 7.1b.1 removed from "deferred" references

**Rationale:** Sprint plan is stale. Must reflect PO-directed sequencing and stabilization epic.

---

### CP-9: Process Changes (Non-Document)

The following process rules apply immediately per Epic 7 retrospective action items. These are not document edits — they are operational standards for the next sprint:

**P-1: Mandatory Adversarial Review (AI-E7-4).** No story moves to "done" without an adversarial code review. Foundation stories are reviewed FIRST because their design decisions propagate to all downstream work. 100% hit rate across all reviews validates the process.

**P-2: Change Proposal for Design Pivots (AI-E7-7).** Any change to the fundamental relationship between product surfaces (Forms vs Reports roles, how editing works, what users see where) requires a Sprint Change Proposal before implementation. Story-level ACs can evolve during development. Surface-level design philosophy cannot change without PO sign-off and document updates.

**P-3: Story Complexity Threshold (AI-E7-8).** Stories with 5+ acceptance criteria or 3+ new component files get either (a) split into smaller stories before implementation, or (b) an additional review round focused on inter-component integration.

**P-4: Completion Report Accuracy (AI-E7-10).** Story completion reports must include: (a) file list verified against actual git diff, (b) AC-by-AC verification with specific evidence, (c) dev notes flagged as TODO must be explicitly addressed or escalated.

---

## Section 5: Implementation Handoff

### Change Scope Classification: MODERATE

This is a moderate-scope change requiring:
- Backlog reorganization (new stabilization mini-epic with 5 stories)
- Epic resequencing (PO-directed)
- Document updates across all 4 planning artifacts + UX spec
- One significant feature completion (per-month independence)
- One gap fix (Brand CRUD)
- Process standard enforcement

### Handoff Plan

| Recipient | Responsibility | Deliverables |
|-----------|---------------|-------------|
| **PO (User)** | Approve this proposal. Confirm epic sequencing. | Approval recorded |
| **Scrum Master (Bob)** | Execute sprint planning reset. Create stabilization mini-epic in sprint status. Enforce process rules P-1 through P-4. | Updated sprint-status.yaml, process enforcement |
| **Story Creator** | Create story context documents for 7H.1-7H.5 using Create Story workflow | 5 story files in implementation-artifacts |
| **Development** | Implement stories in dependency order: 7H.1 first (unblocks all), then 7H.2-7H.5 (can parallel) | Working code, passing tests |
| **Code Review** | Adversarial review for every story (P-1) | Review reports with findings |

### Success Criteria

1. All 4 planning documents (PRD, Architecture, Epics, UX Spec) are internally consistent and reflect what was actually built through Epic 7
2. Per-month independence works for qualifying fields (revenue, COGS%, labor%, marketing%) in Reports inline editing
3. Brands can be deleted and have their metadata edited
4. INPUT_FIELD_MAP has mechanical validation that fails the build on format mismatches
5. E2E tests authenticate as franchisee and clean up after themselves
6. Sprint status reflects PO-directed epic sequencing
7. Implementation Readiness check passes without CRITICAL blockers

---

*Sprint Change Proposal generated by Correct Course workflow (2026-02-22)*
*Source documents: Epic 7 Retrospective (2026-02-21), Implementation Readiness Report (2026-02-22)*
*Platform intelligence: 0 LSP errors, 23 tech debt markers (all pre-existing), 0 reverts*
