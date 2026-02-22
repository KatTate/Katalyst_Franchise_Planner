# Epic 7 Retrospective: Per-Year Inputs & Multi-Plan Management

**Date:** 2026-02-21
**Epic:** Epic 7 — Per-Year Inputs & Multi-Plan Management
**Previous Retrospective:** Epic 5H (epic-5h-retrospective.md)
**Facilitator:** Bob (Scrum Master)
**Participants:** Alice (PO), Charlie (Senior Dev), Dana (QA), Elena (Junior Dev), Frank (DevOps)

---

## Executive Summary

Epic 7 delivered all 6 stories (7.1a through 7.1e + 7.2) in a single day, enabling per-year financial editing across 15+ fields, Forms onboarding for all assumptions, facilities guided decomposition, balance sheet/valuation editing, and full plan lifecycle management. The codebase emerged clean: 0 LSP errors, 0 new tech debt markers, and a 5% fix-commit ratio (below the 7.8% project average).

However, Epic 7 also revealed a **systemic process failure**: the team fundamentally rewrote all stories mid-epic — changing from 5 stories to 6, pivoting the core Forms/Reports design philosophy, and splitting a mega-story — without following BMAD's formal change process. This left planning documents (PRD, architecture, epics summary) misaligned with what was actually built. Combined with recurring display-format validation gaps (now flagged for the 3rd consecutive retrospective) and incomplete Brand CRUD from Epic 2 actively causing development pain, Epic 7's technical success is offset by process and documentation debt that must be resolved before new epic work begins.

**The PO has directed that Epic 6 (PDF Generation) and Epic 9 (AI Planning Advisor) are NOT next.** Both are presentation/intelligence layers that would require repeated rework as the core system architecture continues evolving. Sprint planning must be reset to reflect actual priorities.

---

## Part 1: Epic Delivery Summary

### Stories Delivered

| Story | Title | Status | Code Review | Findings |
|-------|-------|--------|-------------|----------|
| 7.1a | Data Model Restructuring & Migration | DONE | No formal review (686 unit tests) | N/A |
| 7.1b | Make All Financial Assumptions Editable in Reports | DONE | Architect review (2 rounds) | Dead code (facilitiesDecomposition branch) |
| 7.1c | Forms Onboarding — New Field Sections & Simple Inputs | DONE | Adversarial CR | 1H/5M/2L — all fixed |
| 7.1d | Facilities Guided Decomposition & Other OpEx Correction | DONE | Adversarial CR | 1H/3M/3L — all fixed |
| 7.1e | Balance Sheet & Valuation Inline Editing | DONE | Adversarial CR | 0H/3M/3L — all fixed |
| 7.2 | Plan CRUD & Navigation | DONE | Adversarial CR | 3H/4M/2L — all fixed |

### Deferred Work

| Item | Reason | Status |
|------|--------|--------|
| 7.1b AC-2: Per-month independence (60-element arrays) | Scope risk — split to 7.1b.1 | Backlogged (PO decision pending) |
| Brand CRUD: Delete + full metadata editing | Epic 2 gap — never specified | Flagged in 7.2 dev notes, **ignored during implementation** |

---

## Part 2: The Story Rewrite — What Actually Happened

### Critical Finding: Mid-Epic Design Pivot Without Formal Process

During Epic 7 execution, the team discovered that the original story designs were based on incorrect assumptions about what users actually need. All stories were rewritten, a new story was created (7.1e), and a fundamental design philosophy was adopted — all without following BMAD's Sprint Change Proposal process.

### Original vs Actual Stories

| Aspect | Original (5 stories) | Actual (6 stories) |
|--------|----------------------|---------------------|
| **7.1b scope** | Per-year editing, PerYearEditableRow component | All 15+ fields editable, no PerYearEditableRow |
| **7.1c design** | 5-column per-year editing in Forms, inheritance detection | Single-value inputs only, "Set for all years" checkbox |
| **7.1d scope** | Mega-story: Facilities + Other OpEx + Balance Sheet + Valuation | Split: Facilities + Other OpEx only |
| **7.1e** | Did not exist | NEW: Balance Sheet & Valuation Inline Editing |
| **Facilities mismatch** | Decomposition is "authoritative source" with re-sync options | Simplified: informational note only, no action buttons |
| **Dependency chain** | 7.1a → 7.1b + 7.1c (parallel) → 7.1d | 7.1a → 7.1b → 7.1c + 7.1d (parallel) → 7.1e |

### The Core Design Pivot

**Old philosophy:** Forms and Reports are both full-power editing surfaces. Forms has 5-column per-year editing, same as Reports.

**New philosophy:** Forms = onboarding wizard for less experienced personas. Reports = power editing surface where all financial assumptions are editable inline. Expert users skip Forms entirely. Forms does NOT replicate Reports' granular per-year or per-month editing.

This is the correct design decision. But it was made informally during implementation, never documented in the PRD or architecture, and left planning artifacts in a contradictory state.

### Document Misalignment Inventory

| Document | Last Updated | Misalignment |
|----------|-------------|--------------|
| **epics.md (summary, ~line 331)** | Partially updated during E7 | **INTERNALLY CONTRADICTORY.** Summary section lists 5 stories with old names (PerYearEditableRow, "5-column per-year editing," combined 7.1d). Detailed section (line 1915+) has correct 6-story structure. Same document contradicts itself. |
| **epics.md (detailed, ~line 1915)** | Updated during E7 | Correct — reflects what was built |
| **PRD** | 2026-02-20 (before E7) | Missing "Forms = onboarding wizard" design principle. No mention that Forms deliberately excludes per-year editing. Any FR references to Forms behavior assume pre-rewrite design. |
| **Architecture** | 2026-02-21 02:00 (5H.4 audit, before E7) | Doesn't document two-surface philosophy. Missing new component structure (7.1e, facilities decomposition pattern). No deferred 7.1b.1 reference. |
| **Sprint status** | Updated during E7 | Story statuses correct but descriptions may have stale assumptions |

---

## Part 3: Codebase Health

### LSP Diagnostics

| File | Errors | Warnings |
|------|--------|----------|
| pnl-tab.tsx | 0 | 0 |
| use-field-editing.ts | 0 | 0 |
| forms-mode.tsx | 0 | 0 |
| financial-statements.tsx | 0 | 0 |
| app-sidebar.tsx | 0 | 0 |
| plan-initialization.ts | 0 | 0 |
| input-field-map.ts | 0 | 0 |
| balance-sheet-tab.tsx | 0 | 0 |
| valuation-tab.tsx | 0 | 0 |

**Result: 0 errors, 0 warnings across all 9 key files.**

### Tech Debt Markers

| Location | Count | Description |
|----------|-------|-------------|
| shared/help-content/field-help.ts | 18 | Loom video placeholders (carried from Epic 5) |
| client/src/components/shared/field-help-icon.tsx | 1 | Conditional check for "TODO:" prefix |
| e2e test files | 3 | FIXME/HACK markers in test code only |
| server/ | 0 | Clean |

**Net new debt from Epic 7: ZERO.** All 19 production TODO markers existed before Epic 7.

### Git Health Metrics

| Metric | Value | Assessment |
|--------|-------|------------|
| Fix commits during E7 | 4 of ~80 (5%) | Below project average of 7.8% |
| Reverts | 0 | Clean |
| Hotspot: pnl-tab.tsx | 9 changes across 4 stories | Accumulating complexity |
| Hotspot: use-field-editing.ts | 6 changes across 3 stories | Accumulating complexity |
| Hotspot: forms-mode.tsx | 6 changes across 2 stories | Accumulating complexity |

### Hotspot Cross-Story Coupling

| File | Modified By |
|------|-------------|
| pnl-tab.tsx | 7.1a, 7.1b, 7.1d, 7.1e |
| use-field-editing.ts | 7.1b, 7.1c, 7.1d |
| forms-mode.tsx | 7.1c, 7.1d |
| input-field-map.ts | 7.1a, 7.1b, 7.1e |
| financial-statements.tsx | 7.1b, 7.1e |

---

## Part 4: Code Review Analysis

### Review Coverage

| Story | Review Type | Performed | Bugs Found |
|-------|------------|-----------|------------|
| 7.1a | Adversarial CR | NO — relied on 686 unit tests | N/A |
| 7.1b | Architect review (2 rounds) | YES | Dead code branch |
| 7.1c | Adversarial CR | YES | 1H (functional bug) |
| 7.1d | Adversarial CR | YES | 1H (display format bug) |
| 7.1e | Adversarial CR | YES | 0H (3M quality issues) |
| 7.2 | Adversarial CR | YES | 3H (functional bugs) |

**Key finding: 100% hit rate.** Every adversarial review that ran found real bugs — functional issues, not style nits. This continues the pattern from Epic 5H and validates adversarial reviews as non-negotiable.

### Bug Pattern Analysis

**Functional bugs found in code review (HIGH severity):**

| Story | Bug | Category |
|-------|-----|----------|
| 7.1c H1 | "Set for all years" defaulted incorrectly for existing plans | Edge case handling |
| 7.1d H1 | Other OpEx displaying dollars instead of percentages | **Display format** (3rd retro) |
| 7.2 H1 | Context menu rename was non-functional (onRename never passed) | Missing wiring |
| 7.2 H2 | No inline rename prompt after cloning | Missing UX flow |
| 7.2 H3 | Status badges missing from sidebar plan list | Missing AC implementation |

**Pattern: Features work in the happy path but have broken edge cases, missing UI feedback, or unimplemented sub-criteria.** Dev agent self-assessment of completeness is unreliable, especially on complex stories (7.2 had 9 findings vs 7.1e's 0 HIGH findings).

### Completion Report Accuracy

| Issue | Frequency | Examples |
|-------|-----------|---------|
| File lists claiming modifications that didn't happen | 3 of 5 reviews (60%) | 7.1c, 7.1d, 7.2 |
| Incorrect AC enumeration | 1 of 5 reviews (20%) | 7.1e: claimed "AC-1 through AC-5" but only 3 ACs exist |
| Dev notes flagged as TODO but ignored | 1 story | 7.2: Brand CRUD gap noted but not acted on |

---

## Part 5: Previous Retrospective Follow-Through (Epic 5H → Epic 7)

| # | 5H Action Item | Priority | Status | Evidence |
|---|---------------|----------|--------|----------|
| AI-1 | Display Format Validation | CRITICAL | ⏳ Partial | 7.1d caught OpEx format bug via CR, but no systematic audit for 15 new fields |
| AI-2 | 30-Day Month Resolution | CRITICAL | ❌ Deferred by PO | PO: "after progressing through several more epics" |
| AI-3 | Remove ScenarioBar from Reports | HIGH | ✅ Done | Executed immediately post-5H retro |
| AI-4 | Fix Labor Efficiency Display | HIGH | ✅ Done | Formula + crash fix executed post-5H retro |
| AI-5 | Apply 5H.3 AC Amendments to Epic 6 | HIGH | ✅ Done | All 6 amendments applied |
| AI-6 | Architectural Decision Surfacing Rule | MEDIUM | ⏳ Partial | 7.1b.1 deferral surfaced properly; facilities persistence design and otherOpexPct conversion made without PO consultation |
| AI-7 | Display-Layer Validation as Standard Practice | MEDIUM | ⏳ Partial | CR caught 7.1d bug, but not built into story ACs |
| AI-8 | Content Authoring (19 TODOs) | LOW | ❌ Not addressed | 4th carry |
| AI-9 | Document Large File Decision | LOW | ❌ Not addressed | 4th carry |

**Follow-through rate: 33% fully completed (3/9).** The 3 HIGH items executed immediately post-retro were successful. CRITICAL and MEDIUM items saw partial progress. LOW items carried again.

---

## Part 6: What Went Well

1. **Proactive scope management.** The 7.1b AC-2 deferral (per-month independence → 7.1b.1) was textbook risk management. Identified early, communicated clearly, unblocked all downstream stories.

2. **Foundation-first architecture.** Story 7.1a's investment in per-year arrays, migration framework, storedGranularity infrastructure, and FIELD_METADATA extensions paid compound returns. All 5 downstream stories plugged into the foundation cleanly with zero rework.

3. **100% adversarial code review hit rate.** Every review that ran found real functional bugs. This validates the process as non-negotiable for quality.

4. **Zero net tech debt.** Despite heavy feature additions (15+ editable fields, 4 new components, facilities decomposition, plan CRUD), no new TODO/FIXME/HACK markers were introduced to production code.

5. **Improving fix-commit ratio.** 5% during Epic 7 vs 7.8% project lifetime average. Zero reverts. The team is getting more disciplined.

6. **Correct design pivot.** The "Forms = onboarding wizard / Reports = power editing surface" decision was the right call based on actual user needs. Expert users (Chris, Jordan) skip Forms entirely; beginners (Sam) need guided onboarding, not 5-column spreadsheet editing.

---

## Part 7: What Didn't Go Well

### 7.1 — Story Rewrite Without Process (CRITICAL)

All Epic 7 stories were fundamentally rewritten mid-epic without a Sprint Change Proposal. A core design philosophy pivot (Forms = onboarding only) was adopted informally. This left the PRD, architecture document, and epics.md summary section misaligned with what was built. The same epics.md file now contradicts itself — old story descriptions in the summary, new ones in the detailed section.

**Root cause:** The team realized the original stories were based on incorrect assumptions but prioritized shipping over process. No formal change mechanism was invoked because the BMAD workflows weren't part of the implementation flow.

**Impact:** Every downstream workflow (story creation, readiness checks, code reviews, new developer onboarding) references planning documents that describe a product that doesn't exist. This is a compounding risk.

### 7.2 — Display Format Validation (3rd Consecutive Retro)

Other OpEx was mapped as currency format instead of percentage in INPUT_FIELD_MAP. This is the same class of bug flagged in Epic 5 (P&L formatting), Epic 5H (labor efficiency display), and now Epic 7 (Other OpEx). The root cause is unchanged: INPUT_FIELD_MAP is a manual mapping with no mechanical validation against the engine's output types.

**Root cause:** Manual mapping without automated cross-reference. Code review catches these bugs, but only after they're introduced.

### 7.3 — Brand CRUD Gap Causing Active Development Pain (HIGH)

Epic 2's Brand Management (Story 2.1) shipped without delete or full metadata editing capabilities. This was flagged in Story 7.2's dev notes but ignored during implementation. Meanwhile, e2e test agents create dozens of junk brands per test run, polluting the system and requiring manual cleanup by the PO.

**Root cause (creation):** Epic 2's story ACs were incomplete — only brand creation and financial parameter editing were specified.

**Root cause (pollution):** E2E test agents authenticate via admin/demo mode instead of as franchisees. Admin mode triggers brand creation flows and demo mode isn't fully wired, causing test failures, wasted tokens, and junk data.

### 7.4 — Dev Agent Completion Reliability

Story 7.2 had 9 code review findings (3 HIGH) despite the dev agent marking it "done." File lists were inaccurate in 60% of reviews. AC counts were wrong in 7.1e. The pattern: the more complex the story, the less reliable the self-assessment. Stories with 5+ ACs or 3+ new components are high-risk for incomplete implementation.

### 7.5 — Foundation Story Skipped Code Review

Story 7.1a — the most critical foundation story whose design decisions propagate to every downstream story — had no formal adversarial code review. It relied solely on 686 unit tests. Tests verify behavior but don't catch design issues, unnecessary complexity, or maintenance risks.

### 7.6 — Hotspot File Accumulation

`pnl-tab.tsx` was modified 9 times across 4 stories. It renders rows, handles drill-down, manages inline editing state, and serves as the integration point for every new editable feature. Without decomposition, it will become a maintenance bottleneck.

### 7.7 — E2E Testing Process Creating Waste

Test agents consistently authenticate as admin instead of franchisee, triggering brand creation flows and wasting tokens on flows that aren't the target of the test. Each Playwright run can create multiple bogus brands, and the demo mode path they attempt isn't fully functional. This creates:
- Junk brand data requiring manual cleanup
- Wasted API tokens on failed admin flows
- Test instability from hitting unwired demo mode paths
- False test failures unrelated to the feature being tested

---

## Part 8: Patterns & Root Causes

| Pattern | Root Cause | Frequency | Impact |
|---------|-----------|-----------|--------|
| Display format bugs | Manual INPUT_FIELD_MAP mapping without mechanical validation | 3 consecutive epics | User-facing data displayed in wrong format |
| Story rewrite without process | No formal change mechanism integrated into implementation flow | First occurrence at this scale | Planning documents diverge from reality |
| Dev agent over-reports completeness | Complexity-correlated reliability gap in self-assessment | Every complex story | Code review finds bugs marked "done" |
| Hotspot file accumulation | Monolithic component design (pnl-tab.tsx) | Growing since Epic 5 | Maintenance risk, merge conflicts |
| Test agents create junk data | E2E tests authenticate as admin, not franchisee | Ongoing since testing began | Manual cleanup burden on PO |
| Flagged issues ignored | Dev notes treated as informational, not actionable | 7.2 (Brand CRUD gap) | Known problems persist |

---

## Part 9: Action Items (Priority-Ranked)

### CRITICAL — Blockers (Must complete before new epic work)

**AI-E7-1: Planning Document Realignment**
- **What:** Reconcile all planning documents with what was actually built:
  1. **epics.md summary (~line 331):** Update to 6 stories with correct names, correct dependency chain, remove references to PerYearEditableRow, "5-column per-year editing in Forms," combined 7.1d
  2. **epics.md detailed (~line 1915):** Already correct — verify only
  3. **PRD:** Add "Forms = onboarding wizard / Reports = power editing surface" design principle. Update any FRs that assume Forms has per-year editing
  4. **Architecture:** Document two-surface philosophy, new component structure, deferred 7.1b.1
  5. **Sprint status:** Reset for new sprint planning cycle
- **Owner:** Alice (PO) + Charlie (Senior Dev)
- **When:** Before any new story creation
- **Rationale:** Every downstream workflow depends on accurate planning documents

**AI-E7-2: INPUT_FIELD_MAP Mechanical Validation**
- **What:** Add a test-time assertion that verifies every INPUT_FIELD_MAP entry has a format type matching FIELD_METADATA / engine output type. Build fails if a percentage field is mapped as currency.
- **Owner:** Charlie (Senior Dev)
- **When:** Before next story implementation
- **Rationale:** 3rd consecutive retrospective flagging same bug class. Code review alone hasn't prevented it.

**AI-E7-3: Sprint Planning Reset**
- **What:** Current sprint plan is stale. Epic sequencing must be re-evaluated:
  - Epic 6 (PDF Generation) and Epic 9 (AI Planning Advisor) are NOT next per PO direction — both are presentation/intelligence layers that would require repeated rework as core architecture evolves
  - Deferred work (7.1b.1, Brand CRUD) needs explicit scheduling decisions
  - Next epic selection should prioritize core system completeness over polish
- **Owner:** Alice (PO)
- **When:** After document realignment (AI-E7-1)
- **Rationale:** Linear epic numbering doesn't reflect actual priorities. PO has directed sequencing based on rework risk.

### HIGH — Process Improvements

**AI-E7-4: Mandatory Adversarial Review for ALL Stories**
- **What:** No story is marked "done" without an adversarial code review, regardless of test coverage. Foundation stories get reviewed FIRST because their design decisions propagate to all downstream work.
- **Owner:** Bob (SM) — process enforcement
- **When:** Immediate
- **Rationale:** 7.1a skipped review. 100% hit rate on reviews that ran proves the value.

**AI-E7-5: Brand CRUD Completion (Delete + Edit)**
- **What:** Add brand deletion and full metadata editing (name, display name, slug). This is an Epic 2 gap that is actively causing development pain — test agents create junk brands that require manual PO cleanup.
- **Owner:** Alice (PO) — story creation; Charlie — implementation
- **When:** Schedule as part of sprint planning reset (AI-E7-3)
- **Rationale:** Flagged in 7.2 dev notes but ignored. Active development pain, not theoretical debt.

**AI-E7-6: E2E Testing Standards**
- **What:** Establish mandatory testing standards for all e2e test runs:
  1. Test agents MUST authenticate as a franchisee user, NOT as admin
  2. Test agents MUST NOT use demo mode (not fully wired)
  3. Test agents MUST clean up any test data they create (brands, plans)
  4. Test plans must specify the authentication path explicitly
- **Owner:** Dana (QA) — standard definition; Bob (SM) — enforcement
- **When:** Immediate — applies to all future test runs
- **Rationale:** Every test run creates junk brands, wastes tokens, and hits unwired demo paths. The PO should not be manually cleaning up after automated testing.

**AI-E7-7: Change Proposal Requirement for Design Philosophy Pivots**
- **What:** Any change to the fundamental relationship between product surfaces (Forms vs Reports roles, how editing works, what users see where) requires a Sprint Change Proposal before implementation. Story-level ACs can evolve during development. Surface-level design philosophy cannot change without PO sign-off and document updates.
- **Owner:** Bob (SM) — process enforcement
- **When:** Immediate
- **Rationale:** The Forms=onboarding pivot was correct but informal. If the same happens in future epics (e.g., AI Advisor surface), documents will diverge again.

**AI-E7-8: Story Complexity Threshold**
- **What:** Stories with 5+ acceptance criteria or 3+ new component files get either (a) split into smaller stories before implementation, or (b) an additional review round focused on inter-component integration.
- **Owner:** Alice (PO) for splitting; Dana (QA) for review rounds
- **When:** During story creation
- **Rationale:** 7.2 (5 ACs, 4 new components) had 9 review findings. 7.1e (3 ACs, 0 new components) had 0 HIGH findings. Complexity correlates with reliability issues.

### MEDIUM — Technical Improvements

**AI-E7-9: Hotspot File Refactoring Budget**
- **What:** Evaluate `pnl-tab.tsx` for decomposition before any new epic adds logic to it. If the next epic's stories will modify this file, refactor first — separate row rendering from editing orchestration.
- **Owner:** Charlie (Senior Dev)
- **When:** During next epic's story creation — assess impact, refactor if warranted
- **Rationale:** 9 modifications across 4 stories. Accumulating complexity without decomposition.

**AI-E7-10: Completion Report Accuracy Standard**
- **What:** Story completion reports must include: (a) file list verified against actual git diff, (b) AC-by-AC verification with specific evidence (not bulk "AC-1 through AC-N"), (c) dev notes flagged as TODO must be explicitly addressed or escalated.
- **Owner:** Elena (Junior Dev) — template creation
- **When:** Before next story implementation
- **Rationale:** File lists wrong in 60% of reviews. ACs miscounted. Dev note TODOs ignored (7.2 Brand CRUD).

### LOW — Carried Items

**AI-E7-11: Schedule 7.1b.1 (Per-Month Independence) Decision**
- **Owner:** Alice (PO)
- **When:** Part of sprint planning reset (AI-E7-3)
- **Status:** Backlogged. No persona is actively requesting seasonality modeling.

**AI-E7-12: 30-Day Month Decision (Carried from 5H)**
- **Owner:** Alice (PO)
- **When:** Re-evaluate after core system stabilizes
- **Status:** PO-deferred. 4th carry.

**AI-E7-13: Content Authoring — 19 Loom Video TODOs (Carried from E5)**
- **Owner:** Alice (PO) — needs content creation resources
- **When:** When content creation resources are available
- **Status:** 4th carry. These are content tasks, not engineering tasks.

---

## Part 10: Metrics Summary

| Metric | Value | Trend |
|--------|-------|-------|
| Stories delivered | 6 of 6 (100%) | On target |
| Stories rewritten mid-epic | 5 of 6 (83%) | NEW — process concern |
| Code review coverage | 5 of 6 (83%) | Below target (should be 100%) |
| Code review hit rate (bugs found) | 5 of 5 (100%) | Consistent with 5H |
| HIGH severity bugs found in review | 5 total (across 4 stories) | Pattern: happy path works, edges break |
| Fix-commit ratio (E7 period) | 5% (4 of ~80) | Improved from 7.8% lifetime avg |
| Reverts | 0 | Clean |
| LSP errors post-epic | 0 | Clean |
| New tech debt markers | 0 | Clean |
| Existing tech debt markers | 19 (unchanged) | Carried |
| 5H action item follow-through | 33% complete, 33% partial, 33% not addressed | Partial improvement |
| Planning document misalignment | 3 documents (PRD, architecture, epics summary) | NEW — critical |

---

## Part 11: Key Decisions Made During Epic 7

| Decision | Rationale | Impact | Documented? |
|----------|-----------|--------|-------------|
| Forms = onboarding wizard, Reports = power editing surface | Users need guided onboarding (Sam) OR expert editing (Chris, Jordan), not both in the same surface | Fundamental product architecture change | ❌ Not in PRD or architecture |
| Defer per-month independence to 7.1b.1 | Scope risk — unblocks downstream stories | Seasonality modeling delayed | ✅ In sprint status and epics.md |
| Split 7.1d into 7.1d + 7.1e | Original 7.1d was a mega-story | Better focus per story, cleaner code review | ✅ In epics.md (detailed section only) |
| Simplified facilities mismatch handling | Original re-sync with action buttons was over-engineered | Informational note only — accepted tradeoff | ✅ In story 7.1d |
| Brand CRUD gap flagged but not acted on | Flagged in 7.2 dev notes as TODO | Brand deletion still missing; junk data accumulates | ⚠️ Noted but ignored |
| Epic 6 and Epic 9 NOT next | PO: presentation/intelligence layers shouldn't be built while core architecture is evolving | Avoids repeated rework of PDF templates and AI integration | ❌ Not yet documented in sprint plan |

---

## Part 12: Next Epic Preparation Assessment

### Current Situation

The PO has directed that Epic 6 (PDF Generation) and Epic 9 (AI Planning Advisor) are NOT next. Both are presentation/intelligence layers that would require repeated rework as the core system architecture continues evolving. Linear epic numbering does not reflect actual priorities.

### Realistic Next Epic Candidates

| Option | Description | Dependencies on E7 | Risk |
|--------|-------------|---------------------|------|
| Epic 8 | Franchisor Dashboard & Data Sharing | Depends on stable financial model | Advisory nudge UI is new pattern |
| Epic 10 | What-If Playground / Sensitivity Analysis | Depends on per-year editing (E7) | Contained sidebar scope |
| Stabilization Mini-Epic | Brand CRUD + Document Alignment + Testing Infra | Resolves active pain | No new features for stakeholders |

### Preparation Sequence

1. **CRITICAL blockers first** (AI-E7-1, AI-E7-2, AI-E7-3) — these are non-negotiable prerequisites
2. **Sprint Planning Reset** (AI-E7-3) — determines which epic is next based on accurate documents
3. **Hotspot assessment** (AI-E7-9) — if next epic touches pnl-tab.tsx, decompose first
4. **Story creation** — only after documents are aligned per AI-E7-1

### Significant Discoveries Requiring Epic Updates

Three findings from Epic 7 affect any future epic that touches Forms or Reports:

1. **Forms/Reports design philosophy pivot** — Any epic adding new input fields or editing capabilities must know which surface they target. Forms = onboarding wizard (single-value inputs). Reports = power editing surface (multi-year/month inline editing). Expert users skip Forms entirely.

2. **Facilities decomposition pattern** — Simplified to "informational note only" (no action buttons, no re-sync). Any epic adding guided decomposition for other categories must follow this pattern.

3. **INPUT_FIELD_MAP as single source of truth** — Every editable field in Reports requires an entry with correct format type. No mechanical validation exists yet (AI-E7-2 addresses this).

**Resolution:** AI-E7-1 (document realignment) ensures these discoveries are captured in PRD, architecture, and epics.md before any new story creation. No separate planning session needed — alignment IS the fix.

---

## Part 13: Critical Readiness Assessment

### Epic 7 Completion Readiness

| Dimension | Status | Notes |
|-----------|--------|-------|
| Testing & Quality | Stories individually verified via adversarial CR | No full E2E flow test across all stories |
| Deployment | Dev environment only | Not blocking — app not yet published |
| Stakeholder Acceptance | PO signed off on all stories during epic | Document misalignment = incomplete acceptance record |
| Technical Health | 0 LSP errors, 0 new debt markers | 3 hotspot files accumulating complexity |
| Code Quality (Platform) | Clean | 0 errors, 0 warnings across 9 key files |
| Tech Debt Trend | Flat | 0 new markers, 19 carried (18 Loom placeholders) |
| Git Health | Healthy | 5% fix ratio (below 7.8% avg), 0 reverts |

### Verdict

Epic 7 is **complete from a story perspective** but has **3 CRITICAL items** that must be resolved before any new epic work:

1. Planning document realignment (AI-E7-1)
2. INPUT_FIELD_MAP mechanical validation (AI-E7-2)
3. Sprint planning reset (AI-E7-3)

### Unresolved Items Carrying Forward

| Item | Impact if Ignored | Priority |
|------|-------------------|----------|
| Planning documents contradict reality | New stories created from wrong assumptions | CRITICAL |
| No format validation in INPUT_FIELD_MAP | Same display bug class will recur (4th retro) | CRITICAL |
| Sprint plan stale | Wrong epic gets worked on next | CRITICAL |
| Brand CRUD missing delete/edit | Junk data accumulation, PO manual cleanup | HIGH |
| E2E tests auth as admin | Wasted tokens, false failures, junk brands | HIGH |
| Hotspot files growing | Maintenance burden, harder code reviews | MEDIUM |

---

## Part 14: Retrospective Closure

### Key Takeaways

1. **Process discipline matters as much as code quality.** Epic 7's code was clean (0 errors, 0 new debt, 5% fix ratio), but the process failure (rewriting stories without formal change proposal) created document debt that now blocks forward progress.

2. **Adversarial code reviews are non-negotiable.** 100% hit rate finding real functional bugs across all stories reviewed. The one story that skipped review (7.1a) was the highest-risk foundation story.

3. **Display format validation is a systemic gap.** Flagged for the 3rd consecutive retrospective. Code review catches it, but prevention (mechanical validation) is needed.

4. **Complexity concentrates in hotspot files.** pnl-tab.tsx (9 changes), use-field-editing.ts (6 changes), forms-mode.tsx (6 changes) need decomposition monitoring.

### Commitments Summary

| Category | Count |
|----------|-------|
| CRITICAL Blockers | 3 |
| HIGH Process Improvements | 5 |
| MEDIUM Technical Improvements | 2 |
| LOW Carried Items | 3 |
| **Total** | **13** |

### Previous Retro Follow-Through Warning

Epic 5H retrospective had 9 action items. Follow-through: 33% complete, 33% partial, 33% not addressed. The 3 items completed immediately post-retro succeeded. Items deferred to "later" were not addressed. This retro's CRITICAL items are structured as blockers specifically to prevent the same pattern.

### Next Steps

1. Execute CRITICAL blockers: Document Realignment, INPUT_FIELD_MAP Validation, Sprint Planning Reset
2. Apply HIGH process improvements: Mandatory reviews, E2E standards, Change Proposal requirement
3. Sprint Planning Reset determines next epic (this retro does NOT make that decision)
4. Begin next epic only after CRITICAL blockers cleared

---

## Part 15: Recommendations for Next Sprint

### Before Any New Story Work

1. **AI-E7-1:** Fix all planning document misalignments (epics summary, PRD, architecture)
2. **AI-E7-2:** Write INPUT_FIELD_MAP validation test
3. **AI-E7-3:** Reset sprint plan with PO-directed epic sequencing
4. **AI-E7-6:** Establish e2e testing standards (franchisee auth, no demo mode, cleanup)
5. **AI-E7-10:** Create completion report template

### Epic Sequencing Guidance (PO-Directed)

- **NOT NEXT:** Epic 6 (PDF Generation) — presentation layer, will change if underlying model changes
- **NOT NEXT:** Epic 9 (AI Planning Advisor) — intelligence layer, same rework risk
- **CONSIDER:** Epic 8 (Advisory Guardrails) — extends core editing system, builds on Epic 7's foundation
- **CONSIDER:** Brand CRUD completion (AI-E7-5) — resolves active development pain
- **CONSIDER:** Epic 10 (What-If Playground) — standalone sidebar feature with contained scope
- **DECISION NEEDED:** 7.1b.1 (Per-Month Independence) scheduling

### Readiness Gaps for Epic 8

If Epic 8 is selected:
- Brand parameter schema may need range data (not just single defaults) for advisory nudges
- "Gurple" (#A9A2AA) advisory color scheme is a new UI pattern — no existing component
- Story 8.2 references "Account Manager Name" — source unclear
- Assess whether pnl-tab.tsx needs decomposition before adding nudge logic (AI-E7-9)

---

## Appendix A: Action Item Quick Reference

| ID | Priority | Action | Owner | When |
|----|----------|--------|-------|------|
| AI-E7-1 | CRITICAL | Planning document realignment | Alice + Charlie | Before new story work |
| AI-E7-2 | CRITICAL | INPUT_FIELD_MAP mechanical validation | Charlie | Before next story |
| AI-E7-3 | CRITICAL | Sprint planning reset | Alice | After AI-E7-1 |
| AI-E7-4 | HIGH | Mandatory adversarial review for ALL stories | Bob | Immediate |
| AI-E7-5 | HIGH | Brand CRUD completion (delete + edit) | Alice + Charlie | Sprint planning |
| AI-E7-6 | HIGH | E2E testing standards | Dana + Bob | Immediate |
| AI-E7-7 | HIGH | Change proposal requirement for design pivots | Bob | Immediate |
| AI-E7-8 | HIGH | Story complexity threshold | Alice + Dana | Story creation |
| AI-E7-9 | MEDIUM | Hotspot file refactoring budget | Charlie | Next epic planning |
| AI-E7-10 | MEDIUM | Completion report accuracy standard | Elena | Before next story |
| AI-E7-11 | LOW | Schedule 7.1b.1 decision | Alice | Sprint planning |
| AI-E7-12 | LOW | 30-Day month decision (carry) | Alice | After core stabilizes |
| AI-E7-13 | LOW | Content authoring 19 TODOs (carry) | Alice | When resources available |

---

## Appendix B: Files Changed During Epic 7 (Top 25 by Frequency)

| File | Changes | Stories |
|------|---------|---------|
| pnl-tab.tsx | 9 | 7.1a, 7.1b, 7.1d, 7.1e |
| use-field-editing.ts | 6 | 7.1b, 7.1c, 7.1d |
| forms-mode.tsx | 6 | 7.1c, 7.1d |
| input-field-map.ts | 5 | 7.1a, 7.1b, 7.1e |
| financial-statements.tsx | 4 | 7.1b, 7.1e |
| financial-engine.ts | 3 | 7.1a |
| storage.ts | 3 | 7.1a, 7.2 |
| valuation-tab.tsx | 3 | 7.1e |
| app-sidebar.tsx | 3 | 7.2 |
| plans.ts (routes) | 2 | 7.2 |

---

*End of Epic 7 Retrospective*
