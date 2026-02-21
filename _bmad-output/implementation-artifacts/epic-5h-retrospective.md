# Epic 5H Retrospective: Post-Epic-5 Hardening Sprint

**Date:** 2026-02-21
**Facilitator:** Bob (Scrum Master) — BMAD Retrospective Workflow
**Status:** FINALIZED

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

3. **ScenarioBar left visible after retirement.** SCP-2026-02-20 (D5/D6) retired scenario comparison from Reports. The decision was to "defer cleanup to Epic 10" (epics.md line 1566). But the `ScenarioBar` with its "Compare Scenarios" button is actively visible on every Financial Statements view — confusing users with a retired feature.

4. **Live bugs in the display layer.** Labor efficiency ratio display not rendering correctly as reported by user. Formula/tooltip discrepancy: engine computes `totalWages / revenue` but tooltip says "Total wages / Gross Profit." Neither dev agents, code reviews, nor Playwright tests caught these.

5. **5H.2 scope was too narrow.** The UI audit focused on callout bar duplication and comparison mode column widths, but did not audit the broader display layer: format correctness per cell, retired UI elements, or formula/label consistency. The story accomplished what its ACs specified, but the ACs didn't cover the real risk.

6. **Working capital divergence accepted without root cause investigation.** The <10% divergence was documented and accepted in 5H.1, but the root cause (30-day months vs actual days) was knowable and should have been investigated rather than tolerated.

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

**Assessment:** PO is NOT SATISFIED with Epic 5H. While the engine calculation validation was valuable, the validation did not extend to what the user actually sees. The 30-day month decision represents a trust issue — architectural decisions affecting financial accuracy must be surfaced for PO review.

---

## Epic 6 Readiness Assessment

| Dimension | Status | Notes |
|-----------|--------|-------|
| Engine Calculations | GREEN | 99 tests pass, 2 known divergences documented |
| Display Format Accuracy | RED | No validation that displayed values match reference spreadsheet formats |
| 30-Day Month Issue | RED | Confirmed divergence from reference spreadsheets; requires architecture decision |
| UI Quality | YELLOW | ScenarioBar visible, labor ratio display issue |
| AC Readiness | YELLOW | 6 amendment proposals from 5H.3 not yet applied |
| Planning Artifacts | GREEN | 111/111 FRs mapped |
| Code Health | GREEN | Zero LSP errors/warnings |
| Process Maturity | GREEN | Code review discipline restored, agent control rules codified |

**Overall: NOT READY for Epic 6.**

Epic 6 generates permanent lender-facing PDF documents. The display layer has not been validated — format correctness, retired UI elements, and formula/label consistency are unverified. PDFs amplify display bugs into permanent documents.

---

## Action Items

| # | Action Item | Priority | Timing | Type |
|---|-------------|----------|--------|------|
| AI-1 | **Display Format Validation:** Validate every cell in every report tab against reference spreadsheets — not just values, but format type (currency/pct/ratio/number/months), labels, and presentation correctness. | CRITICAL | Before Epic 6 | New validation story |
| AI-2 | **30-Day Month Resolution:** Surface 30-day vs actual-days decision to PO. If actual days: determine what plan-level inputs are needed (start date, opening month, location). Scope data model and engine changes. | CRITICAL | Before Epic 6 | Architecture decision + engine change |
| AI-3 | **Remove ScenarioBar from Reports:** Remove `ScenarioBar` from `financial-statements.tsx` render path. Retired features must not be visible to users. | HIGH | Immediate | Bug fix |
| AI-4 | **Fix Labor Efficiency Display:** Investigate ratio format rendering. Resolve formula/tooltip discrepancy (totalWages/revenue vs totalWages/grossProfit) against reference spreadsheets. | HIGH | Before Epic 6 | Bug fix |
| AI-5 | **Apply 5H.3 AC Amendments:** Apply the 6 amendment proposals from Story 5H.3 to Epic 6 story ACs before implementation begins. | HIGH | Before Epic 6 | Documentation |
| AI-6 | **Architectural Decision Surfacing Rule:** Any engine decision affecting financial accuracy (rounding, averaging, approximation, formula choice) must be documented and surfaced for PO review before implementation. | MEDIUM | Ongoing | Process |
| AI-7 | **Content Authoring (Carried from E5):** 19 Loom video TODO placeholders in field-help.ts. | LOW | Deferred | Content |
| AI-8 | **Document Large File Decision (Carried from E5):** Architecture note for financial-engine.ts size. | LOW | Deferred | Documentation |

---

## Key Lesson

**Validating the engine is not the same as validating the product.** The engine can compute correct numbers, but if the display layer shows them in the wrong format, with wrong labels, or alongside retired UI features, the user sees a broken product. Financial planning tools are only as trustworthy as what the user sees — not what the engine calculates internally.

**Architectural decisions that affect accuracy are product decisions.** The 30-day month approximation is not a technical implementation detail — it's a product decision that affects every working capital number the user relies on. Such decisions must be surfaced to the product owner.

---

*Retrospective conducted using BMAD Party Mode retrospective workflow. All 15 steps completed.*
