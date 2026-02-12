# Epic 3 Retrospective: Financial Planning Engine

**Date:** 2026-02-12
**Facilitator:** Bob (Scrum Master)
**Epic Status:** Done (7/7 stories)
**Participants:** User (Project Lead), Bob (SM), Alice (PO), Charlie (Senior Dev), Dana (QA), Elena (Junior Dev), Sally (UX Designer)

---

## Part 1: Epic Review

### Delivery Metrics

| Metric | Value |
|--------|-------|
| Stories completed | 7/7 (100%) |
| Epic duration | ~3 days (Feb 10 – Feb 12, 2026) |
| Total commits (Epic 3 period) | ~40 (28 substantive + 12 auto-saves) |
| Fix/correction commits | 14 (19.7% fix ratio) |
| Reverts | **0** |
| Review-driven fixes | 10 of 14 fix commits |
| Test count at epic end | 140+ (33 engine + 98 plan-init + 9 financial service + 34 quick-start helpers) |
| Agent model | Claude Opus 4.6 |

### Codebase Vital Signs (LSP Diagnostics)

**Status: CLEAN** — Zero new type errors introduced across all 7 stories. Pre-existing Drizzle ORM type issues in `server/storage.ts` and `shared/schema.ts` remain unchanged from Epic 2 baseline.

### Tech Debt Markers Scan

| Marker Type | Count | Location | Assessment |
|-------------|-------|----------|------------|
| TODO | 1 | `shared/financial-engine.ts` — `taxRate` field collected but not applied to net income | Documented design decision; PostNet reference model is pre-tax. Low priority. |
| FIXME | 0 | — | Clean |
| HACK/WORKAROUND | 0 | — | Clean (false positives in test security data: "hacker" test user names) |
| TEMP/TEMPORARY | 0 | — | Clean |

**Net debt change:** Stable. Epic 2 had zero markers; Epic 3 added 1 intentional TODO. No concerning debt accumulation.

### File Churn Analysis (Source Code)

Files modified most frequently during Epic 3:

| File | Modifications | Assessment |
|------|--------------|------------|
| `shared/schema.ts` | 11 | Expected — every story added types, tables, or Zod schemas (plans, PlanFinancialInputs, StartupCostLineItem, brandValidationRuns, quickStartCompleted) |
| `client/src/App.tsx` | 11 | Expected — each story added a dev route for component testing |
| `server/routes/plans.ts` | 10 | Elevated — accumulated startup cost, outputs, GET/PATCH plan, and startup-cost endpoints across Stories 3.3-3.5. Watch for growth in Epic 4. |
| `server/middleware/auth.ts` | 10 | Elevated — auth and access control refinements, including cross-story fix for franchisee brand access |
| `server/storage.ts` | 7 | Expected — IStorage interface extended with plan CRUD, startup cost methods, validation run methods |
| `shared/financial-engine.ts` | 6 | Expected — core engine file; interface extensions (StartupCostLineItem metadata, PlanFinancialInputs) without computation changes |
| `server/routes/brands.ts` | 6 | Expected — validation endpoints (Story 3.7) and franchisee access fix |
| `client/src/pages/admin-brand-detail.tsx` | 6 | Expected — Validation tab added in Story 3.7 |

**Notable:** `server/routes/plans.ts` is emerging as a new high-churn file (10 modifications in one epic). Epic 4 will add auto-save, mode preference, and session recovery endpoints. Consider sub-routing before it follows the `server/routes.ts` growth pattern from Epics 1-2.

### Code Review Results

All 7 stories passed code review. Combined findings across the epic:

| Severity | Count | Resolution |
|----------|-------|-----------|
| HIGH | 7 (across Stories 3.1-3.6) | All fixed — missing db push, missing deletePlan, missing startup_costs column, missing JSONB types, missing PostNet assertions, admin-only brand endpoint blocking franchisees |
| MEDIUM | 10+ | All fixed — unused imports, import ordering, query key patterns, badge forwardRef, dead code removal, lossy conversion documentation |
| LOW | 5 | Accepted — dev route naming, structured log shape, placeholder fields, sprint-status git changes |

### E2E / Visual Verification Results

| Story | Verification Method | Result |
|-------|-------------------|--------|
| 3.1 | 33 vitest tests, PostNet reference validation | PASS |
| 3.2 | 66 vitest tests, engine integration, PostNet reference validation | PASS |
| 3.3 | 32 vitest tests, visual verification at `/plans/:planId/startup-costs` | PASS |
| 3.4 | 9 vitest tests, visual verification at `/plans/:planId/metrics` | PASS |
| 3.5 | AC verification via code review, visual verification at `/plans/:planId/inputs` | PASS |
| 3.6 | 34 vitest tests, E2E visual verification at `/plans/:planId/quick-start` | PASS (after 4 post-visual bug fixes) |
| 3.7 | E2E visual verification (manual entry, JSON upload, comparison report, history) | PASS |

### Commit History Patterns

- **~40 total commits** during the epic period (28 substantive + 12 auto-saves)
- **14 fix commits (19.7%)** — elevated vs. Epic 2 (2.6%), but 10/14 are review-driven catches, not regressions
- **0 reverts** — features implemented correctly despite higher complexity domain
- **12 auto-save commits** — Replit agent checkpoint artifacts adding noise to history
- **Consistent review cadence** — 4-step pipeline: implement → party mode → code review → Codex
- **Stories 3.1-3.2 have no explicit commit tags** — traceability gap for foundational engine work

### Per-Story Commit Distribution

| Story | Commits | Fix Commits | Assessment |
|-------|---------|-------------|------------|
| 3.1 | ~0 tagged | — | Traceability gap — likely predates tagging convention |
| 3.2 | ~0 tagged | — | Same as 3.1 |
| 3.3 | 2 | 1 | Clean |
| 3.4 | 3 | 1 | Clean |
| 3.5 | 4 | 1 | Clean |
| 3.6 | 8 | 4 (P1, P2, code review, Codex) | Highest complexity — proxy field conversions and edge cases |
| 3.7 | 6 | 0 | Clean — completed in ~1 hour, well-defined scope |

---

## Part 2: What Went Well

1. **Pure engine architecture paid dividends.** The decision to build `shared/financial-engine.ts` as a zero-dependency, deterministic pure module enabled server-side computation (Story 3.4), client-side real-time preview (Story 3.6), and brand validation (Story 3.7) — all without modifying the engine's computation logic after Story 3.1. This is the strongest architectural validation in the project so far.

2. **Multi-layer review pipeline caught real issues.** The 4-step review pipeline (implement → party mode → code review → Codex) caught 7 HIGH-severity findings that would have been production bugs. The cross-cutting brand endpoint security fix (franchisees couldn't access brand defaults) was caught during Story 3.5/3.6 reviews and would have blocked the Quick Start entirely.

3. **Epic 2 critical action items were addressed.** Route modularization (the blocking prerequisite) was completed — `server/routes/plans.ts` was created and brand routes were separated. Tab extraction was done. Story dependency mapping improved with all 7 stories having explicit dependency documentation.

4. **Test coverage grew substantially.** From 33 engine tests (Story 3.1) to 140+ total tests. Each story added its own test suite: plan-initialization (98 tests), financial service (9 tests), quick-start helpers (34 tests). PostNet reference validation provides regression confidence.

5. **Dev page pattern worked well for isolated testing.** Stories 3.3-3.6 each created temporary dev pages for component testing before the planning workspace exists. This enabled independent verification of StartupCostBuilder, SummaryMetrics, FinancialInputEditor, and QuickStartOverlay.

6. **Codebase health remained excellent.** Zero FIXME, zero HACK, zero WORKAROUND markers. Only 1 documented TODO. LSP diagnostics clean across all stories. Zero reverts in the entire commit history.

7. **Shared module pattern validated.** The `shared/` directory pattern (`financial-engine.ts` + `plan-initialization.ts` + `schema.ts`) proved that pure TypeScript modules can be consumed by both server and client without issues. Story 3.6's client-side engine invocation confirmed browser compatibility.

---

## Part 3: What Didn't Go Well

1. **Fix ratio increased to 19.7%.** Up from Epic 2's 2.6%. While most fixes were review-driven (a good sign), the financial engine domain introduced more first-pass errors than Epic 2's admin CRUD work. Edge cases (empty startup costs, division by zero, off-by-one in break-even, negative cost clamping) required multiple correction passes.

2. **Story 3.6 (Quick ROI) had disproportionate bug density.** It required P1 and P2 Codex fixes (hooks ordering, break-even off-by-one, negative cost clamping) and 4 post-visual-review bug fixes for edge cases. The proxy field conversions (staff count ↔ labor %) and proportional startup cost scaling added unexpected complexity.

3. **Stories 3.1-3.2 have no commit traceability.** Zero commits are explicitly tagged with "3-1" or "3-2" identifiers, making it impossible to trace which commits belong to the foundational engine work. This creates an audit gap.

4. **Dependency installation not maintained.** `npm install` was not run in the current environment, so `tsc --noEmit`, `vitest run`, and `npm run build` all fail. The codebase cannot be independently verified without first installing dependencies.

5. **`server/routes/plans.ts` emerging as new high-churn file.** With 10 modifications during Epic 3, it's accumulating endpoints (startup costs, outputs, GET/PATCH plan) and following the same growth pattern that `server/routes.ts` exhibited before modularization was forced.

6. **Two Epic 2 action items remain unaddressed.** The `as any` cast in createUser and the architecture.md update for brand_account_managers table were not completed. While they didn't cause Epic 3 problems, they represent carried technical and documentation debt.

7. **Vitest infrastructure needs stabilization.** While 140+ tests were written and reportedly passed during development, vitest is not properly installed in the project's dependencies. The test infrastructure was also modified during Story 3.6 (adding client-side patterns to vitest.config.ts), and the overall test setup needs verification.

---

## Part 4: Epic 2 Retrospective Follow-Through

| Epic 2 Action Item | Status | Evidence / Impact |
|---------------------|--------|-------------------|
| Route modularization before Epic 3 | ✅ Completed | `server/routes/plans.ts` created; brand routes separated. Financial engine routes got dedicated routing from day one. |
| Extract brand detail tab components | ✅ Completed | Brand tabs extracted; Story 3.7 added Validation tab cleanly into the existing structure. |
| Validate story dependencies during epic planning | ✅ Completed | All 7 stories had explicit dependency sections in dev notes. No mid-epic relocations. |
| Remove `as string` casts from req.params | ⏳ Partial | `requirePlanAccess` uses typed patterns; some casts may remain in older code |
| Remove `as any` cast from createUser call | ❌ Not Addressed | Pre-existing Drizzle type issue unchanged |
| Update architecture.md with brand_account_managers | ❌ Not Addressed | Documentation gap persists |

**Lessons Applied Successfully:**
- Route modularization prevented the `server/routes.ts` mega-file problem from recurring
- Explicit dependency mapping eliminated mid-epic story relocations (Epic 2 had Story 2.5 relocated mid-epic)
- Tab extraction enabled clean integration of the Validation tab in Story 3.7

**Missed Opportunities:**
- Documentation updates deferred again — architecture.md increasingly diverges from actual schema
- Type safety casts not cleaned up — technical debt carried forward

---

## Part 5: Git Commit History Analysis

### Commit Volume and Patterns

| Metric | Value |
|--------|-------|
| Total commits (all time) | 71 |
| Epic 3 substantive commits | ~28 |
| Auto-save commits | 12 |
| Fix/correction commits | 14 (19.7%) |
| Reverts | 0 |

### Fix Commit Analysis

The 14 fix commits break down as:

| Source | Count | Examples |
|--------|-------|---------|
| Code review fixes | 5 | Unused imports, import ordering, query key patterns |
| Codex PR review fixes | 4 | Break-even off-by-one, hooks ordering, negative cost clamping, stale cache |
| Post-visual-review bug fixes | 3 | Empty startup cost template, zero ROI division, brand endpoint access |
| Security fixes | 2 | Cross-tenant auth gap, data integrity issues |

**Key insight:** The majority of fixes (12/14) were caught by the review pipeline before production impact. Only 2 were discovered during visual verification after implementation. This validates the multi-layer review approach.

### File Churn Hotspots

Top 5 domain files by modification count:

1. `shared/schema.ts` — 11 changes (expected: schema evolves with every story)
2. `server/routes/plans.ts` — 10 changes (watch: approaching mega-file territory)
3. `server/middleware/auth.ts` — 10 changes (security hardening)
4. `server/storage.ts` — 7 changes (expected: IStorage grows with features)
5. `shared/financial-engine.ts` — 6 changes (interface-only changes, computation unchanged)

### Cross-Story Dependencies Revealed

- `server/routes/brands.ts` was modified in both Story 3.5 (franchisee brand access fix) and Story 3.7 (validation endpoints) — showing cross-epic coupling between brand management and financial planning
- `server/middleware/auth.ts` was touched by multiple stories, indicating auth concerns are pervasive and not isolated to a single story
- `shared/schema.ts` accumulated changes from every story — confirming it as the project's central type definition file

---

## Part 6: Codebase Health Scan

### LSP Health Check

| Metric | Value |
|--------|-------|
| Errors | 0 (all story implementations clean) |
| Warnings | 0 |
| Pre-existing issues | Drizzle ORM type inference in `server/storage.ts` (unchanged) |

### Tech Debt Markers

| Marker | Count | New This Epic | Assessment |
|--------|-------|---------------|-----------|
| TODO | 1 | 1 (documented) | `taxRate` — intentionally pre-tax for PostNet model |
| FIXME | 0 | 0 | Clean |
| HACK | 0 | 0 | Clean |
| WORKAROUND | 0 | 0 | Clean |
| TEMP | 0 | 0 | Clean |

**Net debt change:** +1 TODO (documented design decision). No concerning debt accumulation.

### Build / Test Infrastructure

| Check | Status | Issue |
|-------|--------|-------|
| `tsc --noEmit` | FAIL | Missing `@types/node` and `vite/client` type definitions |
| `vitest run` | FAIL | vitest package not installed |
| `npm run build` | FAIL | `tsx` package not installed |
| Root cause | `npm install` not run in current environment |

**Action Required:** Run `npm install` and verify all checks pass before Epic 4.

---

## Part 7: Next Epic Preview — Epic 4: Forms & Quick Entry Experience

### Overview

Epic 4 builds the UI/UX layer for manual financial input, comprising 6 stories:
1. **4.1:** Planning Layout, Dashboard & Mode Switcher
2. **4.2:** Forms Mode — Section-Based Input
3. **4.3:** Quick Entry Mode — Grid Foundation (TanStack Table)
4. **4.4:** Quick Entry Mode — Keyboard Navigation & Formatting
5. **4.5:** Auto-Save & Session Recovery
6. **4.6:** Consultant Booking Link & Workspace Chrome

### Dependencies on Epic 3

All Epic 4 stories depend on Epic 3's financial engine:
- `calculateProjections()` for live dashboard metrics
- `PlanFinancialInputs` with per-field metadata for source badges and reset
- PATCH `/api/plans/:id` for auto-save (partial updates)
- `StartupCostLineItem[]` for Forms/Quick Entry display
- `unwrapForEngine()` + `calculateProjections()` for client-side computation (established in Story 3.6)

### Potential Risks

1. **Performance:** Quick Entry grid (60+ rows) with real-time recalculation
2. **Concurrent edits:** 409 Conflict handling strategy undefined
3. **Session recovery:** Stale state detection unclear
4. **Keyboard navigation:** Accessibility edge cases not fully specified

### Preparation Needed

- Verify all 140+ tests pass with proper vitest installation
- Verify `npm run build` succeeds
- Research TanStack Table for Quick Entry grid
- Design concurrent edit handling strategy
- Plan keyboard navigation patterns

---

## Part 8: Action Items

### Process Improvements

1. **Tag all commits with story identifiers**
   Owner: All developers (team agreement)
   Deadline: Start of Epic 4
   Success criteria: Every commit includes story ID (e.g., "4-1: Add planning layout")

2. **Run `npm install` and verify build/test/lint pipeline**
   Owner: Charlie (Senior Dev)
   Deadline: Before Epic 4 Story 4.1
   Success criteria: `tsc --noEmit` passes, `vitest run` passes (140+ tests), `npm run build` succeeds

3. **Stabilize vitest configuration**
   Owner: Charlie (Senior Dev)
   Deadline: Before Epic 4 Story 4.1
   Success criteria: vitest properly listed in devDependencies, all test patterns (shared, server, client) work

### Technical Debt

1. **Monitor `server/routes/plans.ts` growth**
   Owner: Charlie (Senior Dev)
   Priority: Medium
   Notes: At 10 modifications, consider splitting into sub-routers (startup-costs, outputs, inputs) before Epic 4 adds auto-save endpoints

2. **Remove `as any` cast in createUser** (carried from Epic 2)
   Owner: Charlie (Senior Dev)
   Priority: Low

3. **Update architecture.md with brand_account_managers table** (carried from Epic 2)
   Owner: Alice (PO)
   Priority: Low

4. **Review `taxRate` TODO in financial-engine.ts**
   Owner: Alice (PO)
   Priority: Low
   Notes: Decide if after-tax computation should be added or if TODO should be removed with a comment explaining the pre-tax design choice

### Documentation

1. **Document Epic 3 shared module pattern for Epic 4 developers**
   Owner: Bob (SM)
   Deadline: Before Epic 4 Story 4.1
   Notes: The `shared/` directory pattern (financial-engine.ts + plan-initialization.ts + schema.ts) and client-side engine invocation pattern should be documented for Epic 4 stories that will consume these modules

### Team Agreements

- All commits tagged with story ID for git traceability
- Financial calculation code gets extra review attention (proxy fields, unit conversions, edge cases)
- Dev page pattern continues for Epic 4 components until Story 4.1 builds the planning workspace
- Build/test/lint verification is a blocking prerequisite before Epic 4 begins
- Plans sub-router growth monitored — split if it exceeds 15 modifications in Epic 4

---

## Part 9: Significant Discovery Assessment

**No significant discoveries that invalidate Epic 4 planning.** The financial engine architecture proved sound, the shared module pattern works for client-side computation, and all API patterns established in Epic 3 align with Epic 4's requirements.

Key confirmations for Epic 4:
- Client-side engine invocation works (validated in Story 3.6's Quick Start)
- PATCH partial update pattern works for financial inputs (Story 3.5)
- TanStack Query cache invalidation cascade works for cross-component updates (Stories 3.4-3.6)
- Dev page pattern enables isolated component testing before workspace integration
- Per-field metadata (source, brandDefault, lastModifiedAt, isCustom) is complete and tested

**One watch item:** The Quick Start overlay (Story 3.6) and the planning workspace (Story 4.1) have an integration point — the `quickStartCompleted` flag controls overlay visibility. Story 4.1 needs to handle this conditional render.

---

## Part 10: Readiness Assessment

| Area | Status | Notes |
|------|--------|-------|
| Story Completion | GREEN | 7/7 stories done (100%) |
| Code Quality | GREEN | 0 LSP errors, 0 FIXME, 0 HACK markers |
| Tech Debt | GREEN | 1 documented TODO, no concerning patterns |
| Git Health | YELLOW | 19.7% fix ratio (review-driven), 0 reverts |
| Test Infrastructure | RED | vitest not installed, `npm install` required |
| Build Pipeline | RED | `npm run build` fails, `tsx` not installed |
| File Churn | YELLOW | `plans.ts` at 10 changes — watch in Epic 4 |
| Previous Retro Follow-Through | YELLOW | 3/6 completed, 1 partial, 2 unaddressed |
| Dependency Installation | RED | `npm install` needed before any verification |

**Overall: Epic 3 is complete from a story and code quality perspective. Three infrastructure items (dependency installation, test stabilization, build verification) should be resolved before Epic 4 begins.**

---

## Part 11: Key Takeaways

1. **Pure, deterministic shared modules are the strongest architectural pattern in this project.** The financial engine's zero-dependency design enabled 3 different invocation contexts without modification. Epic 4 should follow this pattern for any new shared logic.

2. **Financial calculation domains need extra review scrutiny.** The 19.7% fix ratio (vs. 2.6% in Epic 2) reflects inherent domain complexity — rounding, unit conversions, edge cases, proxy fields. The review pipeline caught these before production, but first-pass accuracy should improve with better edge case anticipation.

3. **The multi-layer review pipeline is the project's quality backbone.** 10 of 14 fix commits were review-driven catches. This pipeline must be maintained for Epic 4, especially for the Quick Entry grid and auto-save features which have their own complexity domains.

4. **Infrastructure maintenance is easily neglected.** Dependencies not installed, vitest configuration incomplete, build failing — these are symptoms of moving fast on features without maintaining the foundation. A brief infrastructure sprint before Epic 4 will prevent compounding issues.
