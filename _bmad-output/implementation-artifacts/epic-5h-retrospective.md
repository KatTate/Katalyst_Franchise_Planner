# Epic 5H Retrospective: Post-Epic-5 Hardening Sprint

**Date:** 2026-02-21
**Facilitator:** Bob (Scrum Master) — BMAD Retrospective Workflow (15 Steps)
**Status:** FINALIZED
**Participants:** User (Project Lead), Bob (SM), Alice (PO), Charlie (Senior Dev), Dana (QA), Elena (Junior Dev), Sally (UX Designer)

---

## Epic Summary

| Metric | Value |
|--------|-------|
| Stories planned | 4 |
| Stories completed | 4 (100%) |
| Total commits (5H period) | ~80 |
| 5H-specific commits | 8 |
| Fix/correction commits in period | 17 (mostly Epic 10 spec, not 5H) |
| Reverts | 0 |
| Code reviews completed | 2/2 code-impacting stories (100%) |
| Documentation-only stories | 2 (5H.3, 5H.4) |
| New tech debt markers | 0 (reduced by 3) |
| LSP errors/warnings | 0 / 0 |
| Previous retro follow-through | 7/10 (70%) — all CRITICAL/HIGH items completed |
| Deployment status | Development only — not published |

### Stories Delivered

| Story | Title | Type | Key Outcome |
|-------|-------|------|-------------|
| 5H.1 | Financial Engine Reference Validation | Code + Tests | 99 reference tests, 1 bug fixed, 2 divergences documented |
| 5H.2 | Report Tab UI Audit & Remediation | Code | 5 duplicate callout bars removed, BS identity check bug found in review |
| 5H.3 | Epic 6 AC Audit Against User Journeys | Documentation | 8 gaps found, 6 AC amendment proposals |
| 5H.4 | Planning Artifact Alignment | Documentation | 111 FRs mapped, coverage corrected, architecture aligned |

---

## Previous Retrospective Follow-Through (Epic 5 → 5H)

| Epic 5 Action Item | Priority | Status | Evidence |
|--------------------|----------|--------|----------|
| AI-1: Financial Engine Validation | CRITICAL | ✅ Done | 5H.1 — 99 tests, 2 brands, 1 bug fixed |
| AI-2: UI Remediation | CRITICAL | ✅ Done | 5H.2 — callout bars cleaned, BS identity check preserved |
| AI-3: Epic 6 AC Audit | CRITICAL | ✅ Done | 5H.3 — 8 gaps, 6 amendments |
| AI-4: Code Review Discipline | HIGH | ✅ Done | 2/2 reviews, both found bugs |
| AI-5: Planning Artifact Alignment | HIGH | ✅ Done | 5H.4 — 111 FRs, coverage map corrected |
| AI-6: Agent Control Process | HIGH | ✅ Done | Rules codified, carried to all stories |
| AI-7: Content Authoring (22 TODOs) | MEDIUM | ❌ Not Addressed | Deferred to Story 6.1 dev notes. 19 remain. |
| AI-8: Dead Code Cleanup | MEDIUM | ⏳ Partial | editable-cell.tsx marked [DELETED], actual deletion unverified |
| AI-9: Document Large File Decision | MEDIUM | ❌ Not Addressed | Carried |
| AI-10: taxRate TODO (Carried) | Carried | ✅ Done | Resolved in 5H.1 — confirmed 21% |

**Follow-through rate: 70% (7/10).** All CRITICAL and HIGH items completed. Unaddressed items are MEDIUM/LOW priority.

---

## Git Commit History Analysis (Platform Intelligence — Step 2.5)

| Metric | Value |
|--------|-------|
| Total commits (all time) | 592 |
| Epic 5H period commits | ~80 (Feb 20-21) |
| 5H-specific commits (referencing "5H") | 8 |
| Fix/correction commits (project lifetime) | 49 (8.3%) |
| Fix commits during 5H period | 17 |
| Auto-save commits during period | ~6 |
| Reverts | 0 |

**Most-touched files during 5H period:**

| File | Changes | Assessment |
|------|---------|-----------|
| `sprint-status.yaml` | 10 | Expected — every story updates this |
| `sensitivity-engine.ts` | 5 | NOT 5H — Epic 10 SCP work |
| `what-if-playground.tsx` | 5 | NOT 5H — Epic 10 SCP work |
| `5h-4-planning-artifact-alignment.md` | 5 | Expected — documentation story |
| `epics.md` | 4 | Expected — artifact alignment corrections |

**Key Finding:** The 5H stories themselves were surgically focused. Most git churn during this period came from concurrent Epic 10 SCP spec correction work (6 fix commits for Story 10.2). Zero reverts across the entire period.

---

## Codebase Health Scan (Platform Intelligence — Step 2.75)

**LSP Health Check:**

| File Checked | Errors | Warnings |
|-------------|--------|----------|
| `shared/financial-engine.ts` | 0 | 0 |
| `client/src/components/planning/statements/callout-bar.tsx` | 0 | 0 |
| `client/src/components/planning/financial-statements.tsx` | 0 | 0 |

**Tech Debt Markers:**

| Marker Type | Count | Location | Assessment |
|-------------|-------|----------|------------|
| TODO | 19 | `shared/help-content/field-help.ts` | Content placeholders — Loom video extraction |
| TODO | 1 | `client/src/components/shared/field-help-icon.tsx` | UI-related |
| FIXME | 0 | — | Clean |
| HACK/WORKAROUND | 0 | — | Clean |
| XXX/TEMP | 0 | — | Clean |
| Server TODOs | 0 | — | Clean |

**Net debt change from Epic 5H:** -3 markers. Epic 5 had 22 TODOs, now 20. The `taxRate` TODO resolved in 5H.1.

---

## Visual Verification (Platform Intelligence — Step 9)

Screenshots captured of running application (PostNet Demo Plan, Reports → P&L tab):

| Finding | Status | Screenshot Evidence |
|---------|--------|-------------------|
| ScenarioBar / "Compare Scenarios" button | **CONFIRMED VISIBLE** | Top-right of Reports view, prominently displayed next to "Viewing: Base Case" |
| Labor Efficiency rows | **NOT VISIBLE** | P&L Analysis section collapsed by default (`defaultExpanded: false`). Playwright DOM scan could not find rows even after expansion attempts — needs investigation |
| CalloutBar remediation (5H.2) | **WORKING CORRECTLY** | Shows Break-even, 5yr ROI, Cash Position. No duplicate per-tab callout bars. |
| Financial value formatting (visible rows) | **APPEARS CORRECT** | Revenue shows as currency ($55,000), COGS % shows as percentage (30.0%) |
| Bottom status bar | **WORKING CORRECTLY** | Shows PRE-TAX INCOME, BREAK-EVEN, GROSS MARGIN %, 5YR ROI |

---

## What Went Well

1. **Adversarial code reviews caught real bugs.** BS identity check search predicate mismatch (5H.2, H1) and expanded CF/BS validation gaps (5H.1, H2/H3) both came from fresh-context adversarial reviews. This validates the process as non-negotiable.

2. **100% story completion with zero scope creep.** All 4 stories delivered and reviewed. No abandoned work, no scope changes.

3. **Net tech debt reduction.** Zero new TODO/FIXME/HACK markers added. Actually reduced count by 3 (taxRate TODO resolved, others cleaned). Server has zero debt markers.

4. **Clean codebase health.** Zero LSP errors, zero warnings across all checked files. Engine code is stable.

5. **Agent session control rules established and held.** No self-approval, no unauthorized rewrites, mandatory code review for code-impacting stories. These rules prevented Epic 5's control failures from recurring.

6. **Surgical implementation.** 5H commits were focused — most git churn during the period was from concurrent Epic 10 SCP work, not 5H. The hardening stories were clean and targeted.

---

## What Didn't Go Well

1. **Validation tested the engine, not the user experience.** 99 reference tests proved engine calculations match reference spreadsheet values, but nobody verified that those values are DISPLAYED correctly to the user — format types (currency vs percentage vs ratio), labels, and presentation layer accuracy were never validated against what the spreadsheets show. The gap between "engine is right" and "user sees right numbers" was not closed.

2. **Architectural decisions made without PO consultation.** The 30-day month approximation (`daysInMonth() → return 30`) was introduced in Story 3.1 (Epic 3) and never surfaced for PO review. The reference spreadsheets use actual calendar days (28/30/31). This affects all working capital calculations and explains part of the documented <10% working capital divergence that was accepted without investigating root cause.

3. **ScenarioBar left visible after retirement.** SCP-2026-02-20 (D5/D6) retired scenario comparison from Reports. The decision was to "defer cleanup to Epic 10" (epics.md line 1566). But the `ScenarioBar` with its "Compare Scenarios" button is actively visible on every Financial Statements view — confusing users with a retired feature. Confirmed by visual verification screenshot.

4. **Live bugs in the display layer.** Labor efficiency rows not rendering / not findable in P&L tab — confirmed by both user report and Playwright visual verification. Formula/tooltip discrepancy: engine computes `totalWages / revenue` but tooltip says "Total wages / Gross Profit." Neither dev agents, code reviews, nor Playwright tests caught these.

5. **5H.2 scope was too narrow.** The UI audit focused on callout bar duplication and comparison mode column widths, but did not audit the broader display layer: format correctness per cell, retired UI elements, or formula/label consistency. The story accomplished what its ACs specified, but the ACs didn't cover the real risk.

6. **Working capital divergence accepted without root cause investigation.** The <10% divergence was documented and accepted in 5H.1, but the root cause (30-day months vs actual days) was knowable and should have been investigated rather than tolerated.

7. **Forward momentum stalled.** Hardening work is valuable but has delayed progress to remaining feature epics (6-11). Open questions about Plan CRUD (Epic 7), Brand CRUD (Epic 2), and other capabilities remain unanswered because those epics haven't been reached.

---

## Surprises

1. **The user found bugs by looking at the app.** Labor efficiency ratio display, ScenarioBar visibility, and 30-day month concerns were all surfaced by the product owner during the retrospective — not by any automated test, code review, or dev agent. Manual PO verification remains irreplaceable.

2. **The <10% working capital divergence has a deterministic cause** (30-day months) that could have been traced and reported in 5H.1 rather than accepted as "acceptable divergence."

3. **Epic 10 SCP work created more commit churn** during the 5H period than 5H itself. The concurrent spec correction cycle for Story 10.2 (6 fix commits) dominated the git history.

---

## PO Feedback (Verbatim)

> "One of the main reasons we did this epic is because I wanted to validate that the financial engine we were building matches the spreadsheet models in the reference data. And yet I got told that we didn't actually build a story that had a check against how the information was displayed to the user. I.e., is every cell a percentage, a dollar figure, a ratio? So as I understand it, we still don't know whether or not the financial model that we have created actually matches the Spreadsheets."

> "What I did learn is that somewhere along the way, someone decided that we were going to use an average 30-day month, as opposed to the spreadsheets' actual month days. This is fantastic to find that out during audit, because I was never asked about it."

> "Labor efficiency ratios still aren't showing up and displaying to the user as ratios."

> "Inside the Reports tab, it's still showing a View Comparison Scenarios button at the top, which I thought we got rid of in the UI cleanup story in this epic."

> "I still have concerns about whether or not the actual reports are going to be correct and what we actually need to make. I have concerns about what the CRUD function is going to be for the plans. I don't see that we ever decided or talked about CRUD for brands."

> "There's lots of things I'm concerned about, but since I can't get enough momentum to get moved on to the rest of the epics, I don't know what's remaining in future epics and what we've missed."

**Assessment:** PO is NOT SATISFIED with Epic 5H. While the engine calculation validation was valuable, the validation did not extend to what the user actually sees. The 30-day month decision represents a trust issue. Forward momentum is a systemic concern — hardening work delays reaching epics where open questions get answered.

---

## Significant Discovery Alert

During Epic 5H, the team uncovered findings that require updating the plan for Epic 6.

**Significant Changes Identified:**

1. **Display layer not validated** — Epic 6 generates permanent PDFs from the same display layer that hasn't been verified against reference spreadsheets.
   - Impact: PDFs could contain incorrectly formatted values (dollars shown as percentages, ratios not rendering, etc.)

2. **30-day month approximation confirmed as divergent** — Reference spreadsheets use actual calendar days. Our engine uses 30-day months.
   - Impact: PDF documents will contain working capital figures that don't match reference spreadsheets.

3. **Retired UI elements still visible** — ScenarioBar with "Compare Scenarios" button appears in Reports.
   - Impact: Potential for retired features to appear in generated documents.

**Impact on Epic 6:**

The current plan assumes:
- Engine output is accurate and display-ready
- Working capital figures match reference spreadsheets
- Reports UI is clean and production-ready

But Epic 5H revealed:
- Display formatting is unverified
- Working capital diverges due to 30-day months
- Retired UI elements are still visible
- Labor efficiency rows don't render

**Epic Update Required: YES** — Complete critical path items before Epic 6 kickoff.

---

## Epic 6 Readiness Assessment

| Dimension | Status | Notes |
|-----------|--------|-------|
| Engine Calculations | GREEN | 99 tests pass, 2 known divergences documented |
| Display Format Accuracy | RED | No validation that displayed values match reference spreadsheet formats |
| 30-Day Month Issue | RED | Confirmed divergence from reference spreadsheets; requires architecture decision |
| UI Quality (ScenarioBar) | RED | Retired feature still visible — confirmed by screenshot |
| UI Quality (Labor Efficiency) | RED | Rows not rendering / not findable in DOM — confirmed by Playwright |
| AC Readiness | YELLOW | 6 amendment proposals from 5H.3 not yet applied |
| Planning Artifacts | GREEN | 111/111 FRs mapped |
| Code Health | GREEN | Zero LSP errors/warnings, zero new debt markers |
| Process Maturity | GREEN | Code review discipline restored, agent control rules codified |
| Deployment | GREEN | Development only — no external stakeholder exposure |
| Stakeholder Acceptance | YELLOW | Only PO has reviewed; PO has concerns |
| Forward Momentum | RED | Hardening work valuable but blocking progress to remaining epics (6-11) |
| Plan CRUD | YELLOW | Deferred to Epic 7, Story 7.2 — unanswered questions about plan creation flow |
| Brand CRUD | YELLOW | In Epic 2 scope but specific CRUD flow not discussed |

**Overall: NOT READY for Epic 6 without targeted fixes, but forward momentum must be prioritized.**

---

## Action Items

| # | Action Item | Priority | Timing | Type | Success Criteria |
|---|-------------|----------|--------|------|-----------------|
| AI-1 | **Display Format Validation:** Validate every cell in every report tab against reference spreadsheets — not just values, but format type (currency/pct/ratio/number/months), labels, and presentation correctness. | CRITICAL | Before Epic 6 | New validation story | Every row in P&L, BS, CF, ROIC, Valuation tabs has format type verified against reference spreadsheet. All mismatches fixed. |
| AI-2 | **30-Day Month Resolution:** Surface 30-day vs actual-days decision to PO. If actual days: determine what plan-level inputs are needed (start date, opening month, location). Scope data model and engine changes. | CRITICAL | Before Epic 6 | Architecture decision + engine change | PO has made informed decision. If actual days chosen: engine updated, reference tests updated, working capital divergence re-measured. |
| AI-3 | **Remove ScenarioBar from Reports:** Remove `ScenarioBar` from `financial-statements.tsx` render path. Retired features must not be visible to users. | HIGH | Immediate | Bug fix | No "Compare Scenarios" button visible in Financial Statements view. |
| AI-4 | **Fix Labor Efficiency Display:** Investigate why rows don't render in P&L Analysis section. Resolve formula/tooltip discrepancy (totalWages/revenue vs totalWages/grossProfit) against reference spreadsheets. | HIGH | Before Epic 6 | Bug fix | Labor Efficiency rows visible and displaying as "X.XXx" ratio format. Formula matches reference spreadsheet. Tooltip matches actual formula. |
| AI-5 | **Apply 5H.3 AC Amendments:** Apply the 6 amendment proposals from Story 5H.3 to Epic 6 Story 6.1 and 6.2 ACs before implementation begins. | HIGH | Before Epic 6 | Documentation | All 6 amendments (GAP-01 through GAP-08 coverage) incorporated into story ACs. |
| AI-6 | **Architectural Decision Surfacing Rule:** Any engine decision affecting financial accuracy (rounding, averaging, approximation, formula choice) must be documented and surfaced for PO review before implementation. | MEDIUM | Ongoing | Process | No engine accuracy decision made without documented PO approval note in story dev notes. |
| AI-7 | **Display-Layer Validation as Standard Practice:** Engine validation stories must include presentation-layer checks — not just "does the engine compute X" but "does the user see X in the correct format." | MEDIUM | Before Epic 6 story creation | Process | Every validation story AC explicitly mentions display format verification. |
| AI-8 | **Content Authoring (Carried from E5, E5H):** 19 Loom video TODO placeholders in field-help.ts. | LOW | Deferred | Content | All 19 TODOs replaced with actual guidance text. |
| AI-9 | **Document Large File Decision (Carried from E5, E5H):** Architecture note for financial-engine.ts size. | LOW | Deferred | Documentation | Architecture document includes rationale for single-file engine. |

**Critical Path Before Epic 6:** Items AI-1, AI-2, AI-3, AI-4, AI-5 must be completed before Epic 6 implementation begins.

---

## Next Epic Preparation

**Epic 6: Document Generation & Vault** (2 stories: 6.1 PDF Generation, 6.2 Document History & Downloads)

**CRITICAL PREPARATION (Must complete before Epic 6 starts):**

1. Display Format Validation (AI-1)
2. 30-Day Month Resolution (AI-2)
3. Remove ScenarioBar (AI-3)
4. Fix Labor Efficiency Display (AI-4)
5. Apply 5H.3 AC Amendments (AI-5)

**PARALLEL PREPARATION (Can happen during early stories):**

6. PDF Library Evaluation — `@react-pdf/renderer` vs `puppeteer`
7. Object Storage Integration — scope for document vault (Story 6.2)

**NICE-TO-HAVE PREPARATION:**

8. PDF Testing Strategy — approach for validating PDF content programmatically

---

## Key Lessons

1. **Validating the engine is not the same as validating the product.** The engine can compute correct numbers, but if the display layer shows them in the wrong format, with wrong labels, or alongside retired UI features, the user sees a broken product. Financial planning tools are only as trustworthy as what the user sees — not what the engine calculates internally.

2. **Architectural decisions that affect accuracy are product decisions.** The 30-day month approximation is not a technical implementation detail — it's a product decision that affects every working capital number the user relies on. Such decisions must be surfaced to the product owner.

3. **Adversarial code reviews are non-negotiable.** Both 5H code reviews found real bugs (100% hit rate). The process is proven.

4. **Quality gates must balance against forward momentum.** Hardening catches real issues, but delaying feature epics means open questions remain unanswered. Efficiency in pre-epic work is critical.

---

## Team Performance

Epic 5H delivered 4 stories with 100% completion rate, restored code review discipline after Epic 5's 44% coverage gap, and built a 99-test reference validation framework across 2 brands. The retrospective surfaced 4 key lessons, 3 previously-unknown bugs (via visual verification and PO inspection), and 1 significant discovery requiring Epic 6 plan updates. The team is positioned for Epic 6 success contingent on completing 5 critical path items.

---

*Retrospective conducted using BMAD Party Mode retrospective workflow. All 15 steps executed in order: Epic Discovery → Document Discovery → Deep Story Analysis → Git Commit History Analysis → Codebase Health Scan → Previous Retro Follow-Through → Preview Next Epic → Initialize Retrospective → Epic Review Discussion → Next Epic Preparation Discussion → Synthesize Action Items with Change Detection → Critical Readiness Exploration (including visual verification) → Retrospective Closure → Save Retrospective & Update Sprint Status → Final Summary and Handoff.*
