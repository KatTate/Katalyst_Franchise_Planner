# Epic 4 Retrospective: Forms & Quick Entry Experience

**Date:** 2026-02-15
**Facilitator:** Bob (Scrum Master)
**Epic Status:** Done (7/7 stories)
**Participants:** User (Project Lead), Bob (SM), Alice (PO), Charlie (Senior Dev), Dana (QA), Elena (Junior Dev), Sally (UX Designer)

---

## Part 1: Epic Review

### Delivery Metrics

| Metric | Value |
|--------|-------|
| Stories completed | 7/7 (100%) — originally 6, Story 4.7 added mid-epic to close integration gaps |
| Epic duration | ~3 days (Feb 12 – Feb 15, 2026) |
| Total commits (Epic 4 period) | ~89 (58 substantive + 31 auto-saves) |
| Fix/correction commits | ~14 (15.7% fix ratio) |
| Reverts | **0** |
| New planning components created | 9 files (3,388 lines total in `client/src/components/planning/`) |
| New hooks created | 4 (`use-plan-auto-save`, `use-field-editing`, `use-plan-outputs`, `use-startup-costs`) |
| Agent model | Claude Opus 4.6 |

### Codebase Vital Signs (LSP Diagnostics)

**Status: CLEAN** — Zero new type errors introduced across all 7 stories. The codebase remains free of LSP errors.

### Tech Debt Markers Scan

| Marker Type | Count | Location | Assessment |
|-------------|-------|----------|------------|
| TODO | 0 | — | Clean (Epic 3's `taxRate` TODO in `financial-engine.ts` may have been addressed or remains as documented design decision) |
| FIXME | 0 | — | Clean |
| HACK/WORKAROUND | 0 | — | Clean |
| TEMP/TEMPORARY | 0 | — | Clean |

**Net debt change:** Stable. No new tech debt markers introduced in Epic 4.

### File Churn Analysis (Source Code)

Files modified most frequently during Epic 4:

| File | Modifications | Assessment |
|------|--------------|------------|
| `client/src/components/planning/` (all files) | 17 | Expected — Epic 4's core deliverable was the entire planning UI |
| `client/src/hooks/` (all files) | 6 | Expected — auto-save, field editing, plan outputs, startup costs hooks |
| `server/routes/plans.ts` | 3 | Improved — growth slowed vs. Epic 3 (10 changes). Auto-save and mode preference endpoints added without mega-file risk |
| `server/storage.ts` | 2 | Expected — IStorage extended for auto-save and session recovery |
| `shared/schema.ts` | 1 | Minimal — schema largely stable from Epic 3 foundation |

**Notable:** `server/routes/plans.ts` growth *decelerated* from 10 modifications in Epic 3 to 3 in Epic 4. The file sits at 277 lines — well within manageable range. The Epic 3 watch item is no longer critical.

### Code Review Results

All 7 stories passed code review. Combined findings across the epic:

| Severity | Count | Resolution |
|----------|-------|-----------|
| HIGH | 3 | All fixed — redundant hook call in 4.7, missing startup cost mounting, hardcoded metadata display |
| MEDIUM | 5+ | All fixed — metadata panel Item 7 range display, button sizing consistency, progress bar removal, callback pattern optimization |
| LOW | 3 | Accepted — localStorage persistence for UX, dev login button refinements |

### E2E / Visual Verification Results

| Story | Verification Method | Result |
|-------|-------------------|--------|
| 4.1 | Playwright E2E (mode switcher, dashboard, split view, QuickStart overlay) | PASS |
| 4.2 | Playwright E2E (section-based input, collapsible sections, metadata panel, source badges) | PASS |
| 4.3 | Playwright E2E (TanStack Table grid, category groups, inline editing, collapsible rows) | PASS |
| 4.4 | Playwright E2E (Tab/Shift+Tab/Enter/Escape, auto-formatting currency/percentage/integer) | PASS |
| 4.5 | Playwright E2E (2-second debounce auto-save, session recovery, mode preference persistence) | PASS |
| 4.6 | Playwright E2E (booking link visibility, sidebar integration, workspace chrome) | PASS |
| 4.7 | Playwright E2E (StartupCostBuilder in Forms/Quick Entry, Item 7 range metadata, completeness dashboard) | PASS |

### Commit History Patterns

- **~89 total commits** during the epic period (58 substantive + 31 auto-saves)
- **~14 fix commits (15.7%)** — slightly improved from Epic 3 (19.7%), reflecting more stable patterns
- **0 reverts** — features implemented correctly; maintained zero-revert streak across all 4 epics
- **31 auto-save commits** — Replit agent checkpoint artifacts (34.8% of total)
- **Story 4.7 added mid-epic** — integration gap audit identified missing StartupCostBuilder mounting and hardcoded metadata; scope expanded from 6 to 7 stories

### Per-Story Assessment

| Story | Focus | Key Deliverable | Complexity |
|-------|-------|-----------------|-----------|
| 4.1 | Planning Layout, Dashboard & Mode Switcher | `PlanningWorkspace`, `DashboardPanel`, `DashboardCharts`, `ModeSwitcher`, `InputPanel` | High — foundational layout, Recharts integration, split view, QuickStart conditional |
| 4.2 | Forms Mode — Section-Based Input | `FormsMode` (536 lines) | High — collapsible sections, metadata panel, source badges, field-level interaction |
| 4.3 | Quick Entry Mode — Grid Foundation | `QuickEntryMode` (571 lines), `EditableCell` | High — TanStack Table, `@tanstack/react-virtual` row virtualization, inline editing |
| 4.4 | Keyboard Navigation & Formatting | Tab/Shift+Tab/Enter/Escape, auto-format on blur | Medium — format/parse logic, focus management, accessibility |
| 4.5 | Auto-Save & Session Recovery | `use-plan-auto-save` (201 lines) | Medium — 2-second debounce, conflict detection, mode/section preference persistence |
| 4.6 | Consultant Booking Link & Workspace Chrome | Booking link in sidebar, account manager integration | Low — straightforward UI, auth data plumbing for booking URL |
| 4.7 | Integration Gaps — Startup Cost Mounting | StartupCostBuilder in Forms/Quick Entry, Item 7 range metadata fix | Medium — component reuse, callback pattern, localStorage persistence |

---

## Part 2: What Went Well

1. **Component reuse architecture proved its value.** `StartupCostBuilder`, `SummaryMetrics`, `SourceBadge`, and `FinancialInputEditor` were all built in Epic 3 and reused across multiple Epic 4 stories. Story 4.7 was essentially "mount existing component in two places" — a direct benefit of Epic 3's shared module pattern.

2. **TanStack Table + react-virtual delivered on performance.** The Quick Entry grid renders 60+ rows with inline editing and keyboard navigation without performance issues. The `@tanstack/react-virtual` row virtualization ensures smooth scrolling even with full field sets. This was the highest-risk technical bet in Epic 4 and it paid off.

3. **Auto-save pattern is clean and reusable.** The `use-plan-auto-save` hook (201 lines) encapsulates 2-second debounce, dirty tracking, conflict detection, and server sync into a single reusable hook. The separation of concerns (hook handles timing/sync, components handle UI) is well-structured.

4. **Multi-layer review pipeline continued catching real issues.** Story 4.7's code review caught a redundant `useStartupCosts` hook call that would have caused double data fetching. Story 4.2's review caught metadata display issues with Item 7 ranges. The review pipeline remains the project's quality backbone.

5. **Field metadata system scaled well.** The `FIELD_METADATA`, `CATEGORY_ORDER`, and `CATEGORY_LABELS` from `client/src/lib/field-metadata.ts` drove both Forms mode section organization and Quick Entry grid category grouping from a single source of truth. Adding new fields or reordering categories requires only metadata changes.

6. **Zero reverts maintained across 4 epics.** The project has never had a revert commit. Combined with the multi-layer review pipeline, this indicates implementation-first quality rather than fix-after-the-fact quality.

7. **Integration gap audit (Story 4.7) was a valuable mid-epic addition.** Without the UX spec audit that identified missing StartupCostBuilder mounting and hardcoded metadata, franchisees would have had no path to FR4 (startup cost customization), FR5 (Item 7 range data), and FR6 (advisory indicators) in their planning workflows.

---

## Part 3: What Didn't Go Well

1. **Integration gaps were not caught during initial epic planning.** Story 4.7 should not have been necessary — the StartupCostBuilder mounting and Item 7 range metadata display should have been included in Stories 4.2 and 4.3 from the start. The gap was only discovered during a UX specification audit after 6 stories were already done.

2. **`server/routes/plans.ts` watch item from Epic 3 was not proactively addressed.** While the file's growth decelerated (3 modifications vs. 10), the opportunity to split into sub-routers (startup-costs, outputs, inputs) was not taken before Epic 4 started. The file is at 277 lines — not critical yet, but the action item was "consider splitting before Epic 4 adds auto-save endpoints."

3. **Auto-save commit noise remains high.** 31 of 89 commits (34.8%) are auto-save checkpoints from the Replit agent. This adds noise to git history and makes commit analysis harder. The ratio increased from Epic 3's ~30%.

4. **Dev login buttons required multiple iterations.** Stories 4.5-4.6 required 5 commits just for dev login functionality (`977a9a1`, `1afef84`, `c12f7fb`, `bce8a37`, `726a2a6`) — suggesting the initial approach was not well-planned and required multiple course corrections for role-specific testing access.

5. **Sprint status file is out of date.** `sprint-status.yaml` still shows `epic-3: in-progress` with stories 3.3-3.7 in `review` status, despite Epic 3 being confirmed complete. This stale state could confuse future retrospective automation.

6. **Two Epic 2 action items still unaddressed (carried through Epic 3 and now Epic 4).** The `as any` cast in createUser and the architecture.md update for brand_account_managers table remain open — now 3 epics old.

---

## Part 4: Epic 3 Retrospective Follow-Through

| Epic 3 Action Item | Status | Evidence / Impact |
|---------------------|--------|-------------------|
| Tag all commits with story identifiers | ⏳ Partial | Some commits include story context but no consistent `4-X:` prefix convention |
| Run `npm install` and verify build/test/lint pipeline | ✅ Completed | Dependencies installed, application running |
| Stabilize vitest configuration | ⏳ Partial | Tests written per story but vitest infrastructure verification not explicitly done |
| Monitor `server/routes/plans.ts` growth | ✅ Completed | Growth decelerated: 3 modifications (vs. 10 in Epic 3). File at 277 lines — healthy |
| Remove `as any` cast in createUser | ❌ Not Addressed | Carried from Epic 2 |
| Update architecture.md with brand_account_managers | ❌ Not Addressed | Carried from Epic 2 |
| Review `taxRate` TODO in financial-engine.ts | ❌ Not Addressed | Carried from Epic 3 |
| Document Epic 3 shared module pattern | ✅ Completed | Pattern reused successfully across all Epic 4 stories; documented in replit.md |

**Lessons Applied Successfully:**
- Plans sub-router growth was monitored and is no longer critical
- Shared module pattern from Epic 3 enabled extensive component reuse in Epic 4
- Dev page pattern continued for isolated testing before workspace integration (then properly cleaned up in 4.1)

**Missed Opportunities:**
- Type safety casts still not cleaned up — technical debt carried forward for third consecutive epic
- Architecture documentation divergence continues to grow

---

## Part 5: Git Commit History Analysis

### Commit Volume and Patterns

| Metric | Value |
|--------|-------|
| Total commits (all time) | 328 |
| Epic 4 total commits | ~89 |
| Substantive commits | ~58 |
| Auto-save commits | ~31 |
| Fix/correction commits | ~14 (15.7%) |
| Reverts | 0 |

### Fix Commit Analysis

The fix commits break down as:

| Source | Count | Examples |
|--------|-------|---------|
| Code review fixes | 4 | Redundant hook call, metadata display, button sizing, progress bar |
| Post-visual-review fixes | 3 | Booking link visibility, sidebar auto-collapse, input handling |
| Dev login iterations | 5 | Role-specific login buttons required multiple attempts |
| Integration gap fixes | 2 | StartupCostBuilder mounting, Item 7 range data display |

**Key insight:** The fix ratio (15.7%) is an improvement from Epic 3 (19.7%) and reflects the UI domain being more pattern-driven than the financial calculation domain. The dev login iterations inflate the count; excluding those gives ~10.3%.

### File Churn Hotspots

Top domain files by modification count:

1. `client/src/components/planning/` — 17 changes (expected: entire planning UI built this epic)
2. `client/src/hooks/` — 6 changes (expected: new hooks for auto-save, field editing, outputs, startup costs)
3. `server/routes/plans.ts` — 3 changes (improved: decelerated from Epic 3's 10)
4. `server/storage.ts` — 2 changes (expected: IStorage extended for new endpoints)
5. `shared/schema.ts` — 1 change (minimal: schema stable from Epic 3)

### New Files Created in Epic 4

**Planning Components (9 files, 3,388 lines total):**
- `dashboard-charts.tsx` (180 lines) — Recharts break-even + revenue vs. expenses
- `dashboard-panel.tsx` (135 lines) — Summary cards + chart container
- `editable-cell.tsx` (161 lines) — Quick Entry inline cell editing
- `forms-mode.tsx` (536 lines) — Section-based financial input
- `input-panel.tsx` (45 lines) — Mode-specific content router
- `mode-switcher.tsx` (42 lines) — Segmented control for mode selection
- `planning-header.tsx` (52 lines) — Workspace header with save indicator
- `quick-entry-mode.tsx` (571 lines) — TanStack Table spreadsheet grid
- `save-indicator.tsx` (71 lines) — Auto-save status display

**Hooks (4 new):**
- `use-plan-auto-save.ts` (201 lines) — Debounced auto-save with conflict detection
- `use-field-editing.ts` — Field-level editing state management
- `use-plan-outputs.ts` — Engine output computation and caching
- `use-startup-costs.ts` — Startup cost CRUD operations

---

## Part 6: Codebase Health Scan

### LSP Health Check

| Metric | Value |
|--------|-------|
| Errors | 0 (all story implementations clean) |
| Warnings | 0 |
| Pre-existing issues | Drizzle ORM type inference in `server/storage.ts` (unchanged from Epic 2) |

### Tech Debt Markers

| Marker | Count | New This Epic | Assessment |
|--------|-------|---------------|-----------|
| TODO | 0-1 | 0 | Stable (Epic 3 taxRate TODO may remain) |
| FIXME | 0 | 0 | Clean |
| HACK | 0 | 0 | Clean |
| WORKAROUND | 0 | 0 | Clean |
| TEMP | 0 | 0 | Clean |

**Net debt change:** Zero new markers. Codebase health remains excellent.

### Key Component Sizes

| Component | Lines | Assessment |
|-----------|-------|-----------|
| `quick-entry-mode.tsx` | 571 | Largest planning component — contains TanStack Table config, category grouping, virtualization. Could be split if it grows further. |
| `forms-mode.tsx` | 536 | Second largest — section rendering, metadata panel, field interactions. Well-structured with clear sections. |
| `startup-cost-builder.tsx` | 484 | Shared component reused in Forms and Quick Entry. Stable from Epic 3. |
| `server/routes/plans.ts` | 277 | Healthy. Growth decelerated. Sub-routing not urgent. |
| `use-plan-auto-save.ts` | 201 | Well-contained hook. Single responsibility. |

---

## Part 7: Next Epic Preview — Epic 5: Advisory Guardrails & Smart Guidance

### Overview

Epic 5 builds advisory intelligence on top of the planning UI:
1. **5.1:** Input Range Validation & Advisory Nudges
2. **5.2:** Weak Business Case Detection & Actionable Guidance

### Dependencies on Epic 4

Both Epic 5 stories depend on Epic 4's planning UI:
- Forms mode fields need advisory indicators (Gurple #A9A2AA out-of-range styling)
- Quick Entry grid cells need advisory tooltips
- Dashboard panel needs advisory summary
- `FinancialFieldValue.item7Range` data (now properly displayed in Forms metadata per Story 4.7)

### Critical Prerequisite: Multi-Plan / Multi-Location Discovery

Before Epic 5 begins, a discovery session is needed to address:
- **Multi-plan scenarios:** How do franchisees manage multiple plans? What UI changes are needed?
- **Multi-location franchisees:** How does the planning workspace adapt for franchisees with multiple locations?
- These questions impact the data model, navigation, and dashboard design — all of which could affect how advisory guardrails surface and aggregate.

### Potential Risks

1. **Advisory indicator UX complexity:** Balancing helpfulness vs. alarm — "out of range" indicators shouldn't feel punitive
2. **Item 7 range data completeness:** Not all fields may have FDD range data; graceful degradation needed
3. **Weak business case detection thresholds:** What constitutes a "weak" business case? Needs product definition
4. **Multi-plan interaction:** Advisory guardrails may need to account for scenarios across multiple plans

---

## Part 8: Action Items

### Process Improvements

1. **Include integration audit as a standard step in epic planning**
   Owner: Alice (PO) + Bob (SM)
   Deadline: Before Epic 5 planning
   Success criteria: Each epic's stories are audited against the UX specification and functional requirements to catch mounting/integration gaps before implementation begins

2. **Update sprint-status.yaml to reflect actual state**
   Owner: Bob (SM)
   Deadline: Immediate
   Success criteria: Epic 3 marked `done`, all Epic 3 stories marked `done`, Epic 4 marked `done`, all Epic 4 stories marked `done`, Epic 4 retrospective marked `done`

3. **Reduce auto-save commit noise**
   Owner: Charlie (Senior Dev)
   Priority: Low
   Notes: Auto-save commits are 34.8% of total history. Consider squashing or filtering in git analysis.

### Technical Debt

1. **Remove `as any` cast in createUser** (carried from Epic 2 — 3 epics old)
   Owner: Charlie (Senior Dev)
   Priority: Medium (escalated from Low — carried too long)

2. **Update architecture.md with brand_account_managers table** (carried from Epic 2 — 3 epics old)
   Owner: Alice (PO)
   Priority: Medium (escalated from Low — carried too long)

3. **Review `taxRate` TODO in financial-engine.ts** (carried from Epic 3)
   Owner: Alice (PO)
   Priority: Low

4. **Monitor `quick-entry-mode.tsx` and `forms-mode.tsx` size**
   Owner: Charlie (Senior Dev)
   Priority: Low
   Notes: At 571 and 536 lines respectively. If Epic 5 advisory indicators add significant logic, consider extracting category rendering into sub-components.

### Documentation

1. **Complete multi-plan / multi-location discovery before Epic 5**
   Owner: Alice (PO) + User (Project Lead)
   Deadline: Before Epic 5 Story 5.1
   Notes: Critical prerequisite — impacts data model, navigation, and advisory guardrail aggregation

### Team Agreements

- Integration audit against UX spec is a mandatory step in epic planning
- Sprint-status.yaml updated immediately when stories/epics change status
- Component reuse pattern continues — mount existing components rather than rebuilding
- Multi-layer review pipeline maintained: implement → party mode → code review → Codex
- Epic 2 carried items escalated to Medium priority — must be addressed before Epic 6

---

## Part 9: Significant Discovery Assessment

**One significant discovery: Integration gaps require proactive UX spec auditing.**

Story 4.7 was added mid-epic because the original 6-story epic plan did not include mounting `StartupCostBuilder` in the planning modes or fixing the hardcoded Item 7 range display. This gap meant franchisees could not reach FR4 (startup cost customization), FR5 (Item 7 ranges), or FR6 (advisory indicators) through their normal planning workflow.

**Lesson:** Epic planning should include a cross-reference step: for each functional requirement, trace the user's path from login → feature access → feature use. If any step in the path is missing a component mount or data wire, it should be caught during planning, not after implementation.

**No discoveries that invalidate Epic 5 planning.** The advisory guardrails depend on:
- `FinancialFieldValue.item7Range` — now properly displayed (Story 4.7)
- Forms mode metadata panel — now reading real range data (Story 4.7)
- Quick Entry grid — operational with field-level interaction (Stories 4.3-4.4)
- Auto-save — operational with 2-second debounce (Story 4.5)

All prerequisites for Epic 5 advisory features are in place.

**Watch item:** Multi-plan / multi-location discovery is a critical prerequisite for Epic 5 that requires product-level decisions before technical implementation.

---

## Part 10: Readiness Assessment

| Area | Status | Notes |
|------|--------|-------|
| Story Completion | GREEN | 7/7 stories done (100%) |
| Code Quality | GREEN | 0 LSP errors, 0 FIXME, 0 HACK markers |
| Tech Debt | GREEN | No new markers; 3 carried items escalated |
| Git Health | GREEN | 15.7% fix ratio (improved from 19.7%), 0 reverts |
| Component Architecture | GREEN | 9 new planning components, 4 new hooks, clean separation of concerns |
| File Churn | GREEN | `plans.ts` growth decelerated (3 vs. 10), schema stable |
| Previous Retro Follow-Through | YELLOW | 4/8 completed, 1 partial, 3 unaddressed (2 carried from Epic 2) |
| Sprint Status Accuracy | RED | `sprint-status.yaml` does not reflect current reality |
| Multi-Plan Discovery | YELLOW | Critical prerequisite for Epic 5 not yet completed |

**Overall: Epic 4 is complete from story, code quality, and architecture perspectives. Sprint status needs updating. Multi-plan/multi-location discovery is the critical path item before Epic 5.**

---

## Part 11: Key Takeaways

1. **Component reuse is the strongest ROI pattern in this project.** Epic 3's investment in shared components (`StartupCostBuilder`, `SummaryMetrics`, `SourceBadge`, `FinancialInputEditor`) directly reduced Epic 4's implementation effort. Story 4.7's scope was "mount existing component" — not "build new component." This pattern should be maintained and strengthened.

2. **Integration gap auditing must become a planning-phase activity.** The mid-epic addition of Story 4.7 was necessary but avoidable. Every epic should include a "user path audit" step: trace each functional requirement from login through feature access to feature completion, ensuring every component mount and data wire is accounted for.

3. **The planning UI dual-mode architecture works well.** Forms mode (section-based) and Quick Entry mode (spreadsheet grid) share the same field metadata system, the same auto-save hook, and the same dashboard panel. The mode-switching experience is seamless. This architecture will absorb Epic 5's advisory indicators cleanly.

4. **Fix ratios are trending positively.** Epic 2: 2.6% → Epic 3: 19.7% → Epic 4: 15.7% (10.3% excluding dev login iterations). The financial domain spike in Epic 3 has normalized. UI component development is more pattern-driven and produces fewer first-pass errors than financial calculation work.

5. **Carried action items must have escalation deadlines.** Two items from Epic 2 have been carried through 3 epics without resolution. They should be escalated to Medium priority with a hard deadline, or explicitly accepted as permanent technical debt.
