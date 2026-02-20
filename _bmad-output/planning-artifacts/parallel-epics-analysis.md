# Parallel Epics Analysis — What Can Run Alongside Epic 5H & Epic 6

**Generated:** 2026-02-20
**Analyst:** Claude Code
**Branch:** claude/review-parallel-epics-acqu3
**Purpose:** Identify remaining epics/stories that have no dependencies on and no file-level conflicts with Epics 5H and 6, enabling concurrent development streams.

---

## Current State Snapshot

| Epic | Status | Story Count | Notes |
|------|--------|-------------|-------|
| Epic 5H | in-progress | 4 | 5H.1 in review; 5H.2/3/4 backlog |
| Epic 6 | backlog | 2 | Blocked until ALL of 5H completes |
| Epic 7 | backlog | 2 | Depends on Epic 5 (done) |
| Epic 8 | backlog | 2 | No listed dependencies |
| Epic 9 | backlog | 4 | No listed dependencies |
| Epic 10 | backlog | 3 | Depends on Epic 5 (done) |
| Epic 11 | backlog | 3 | No listed dependencies |
| Epic 12 | deferred | TBD | Phase 2 — no stories yet |
| Epic ST | in-progress | 1 remaining (ST-4) | Blocked on Epic 11.2 |

---

## Files Owned by Epic 5H and Epic 6

Understanding the "blast radius" of 5H and 6 is the foundation for all parallelism decisions.

### Epic 5H File Ownership

**Story 5H.1 (Engine Reference Validation — currently in review):**
- `shared/financial-engine.ts` — bug fixes from reference comparison
- `shared/financial-engine-reference.test.ts` — new/expanded test file (already exists)

**Story 5H.2 (Report Tab UI Audit & Remediation — backlog, starts after 5H.1 Phase 4):**
- `client/src/components/planning/statements/pnl-tab.tsx`
- `client/src/components/planning/statements/balance-sheet-tab.tsx`
- `client/src/components/planning/statements/cash-flow-tab.tsx`
- `client/src/components/planning/statements/roic-tab.tsx`
- `client/src/components/planning/statements/valuation-tab.tsx`
- `client/src/components/planning/statements/audit-tab.tsx`
- `client/src/components/planning/statements/summary-tab.tsx`
- `client/src/components/planning/statements/guardian-bar.tsx`
- `client/src/components/planning/statements/callout-bar.tsx`
- `client/src/components/planning/statements/statement-section.tsx`
- `client/src/components/planning/statements/statement-table.tsx`
- `client/src/components/planning/statements/column-manager.tsx`
- `client/src/components/planning/impact-strip.tsx`
- `client/src/index.css`

**Story 5H.3 (Epic 6 AC Audit — backlog, no code dependency):**
- `_bmad-output/planning-artifacts/epics.md` (amendment proposals to Stories 6.1 and 6.2 ACs — different section from 5H.4)
- `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` (read-only reference)
- No source code files touched

**Story 5H.4 (Planning Artifact Alignment — backlog, no code dependency):**
- `_bmad-output/planning-artifacts/epics.md` (FR Coverage Map header + FR74–FR97 entries)
- `_bmad-output/planning-artifacts/architecture.md` (remove stale "three modes" references)
- No source code files touched

### Epic 6 File Ownership

**Story 6.1 (PDF Document Generation):**
- `server/routes/documents.ts` (new file — PDF generation endpoint)
- `server/index.ts` (one-line route registration)
- Possibly: `server/services/pdf-generator.ts` (new service file)
- Client: existing "Generate PDF" buttons already placed by Story 5.9 — no new client component files expected

**Story 6.2 (Document History & Downloads):**
- `shared/schema.ts` — new `documents` table (metadata: generation date, plan snapshot ID, completeness)
- `server/routes/documents.ts` — document history endpoints (extends 6.1 route file)
- `client/src/pages/document-history.tsx` (new page)
- `client/src/components/document-history/` (new components)
- PostgreSQL + Replit Object Storage configuration

---

## Stories That CAN Run in Parallel With 5H and 6

These stories have no blocking dependency on 5H or 6 completing, and touch no files owned by 5H or 6.

---

### Within Epic 5H Itself: 5H.3 and 5H.4

Both 5H.3 and 5H.4 are documentation/analysis tasks with **no source code changes**. They do not depend on 5H.1 or 5H.2 completing. They can begin immediately while 5H.1 is still in code review.

| Story | Can Start Now | File Conflict with 5H.1 | File Conflict with 5H.2 | File Conflict with 6.x |
|-------|--------------|------------------------|------------------------|----------------------|
| 5H.3 (AC Audit) | ✅ Yes | None | None | None |
| 5H.4 (Artifact Alignment) | ✅ Yes | None | None | None |

**Coordination note:** Both 5H.3 and 5H.4 propose edits to `epics.md`, but in different sections:
- 5H.3: Amends Stories 6.1 and 6.2 acceptance criteria (Epic 6 section)
- 5H.4: Updates FR Coverage Map header and FR74–FR97 entries (Requirements Inventory section)

These sections are far apart in the file. They can be run in parallel on separate branches and merged sequentially, or run sequentially if single-developer. Running 5H.3 → 5H.4 is the safer order (5H.4 has a larger surface area and makes a final pass over the document).

---

### Epic 7.2: Plan CRUD & Navigation

**What it does:** Adds create/clone/rename/delete plan UI and backend endpoints. Adds sidebar plan navigation list.

**Files touched:**
- `server/routes/plans.ts` — new endpoints: `POST /api/plans/:id/clone`, `DELETE /api/plans/:id`; rename via existing `PATCH`
- `client/src/components/app-sidebar.tsx` — "My Plans" section with plan list
- `client/src/pages/dashboard.tsx` — "Create New Plan" button entry point
- Possibly: `client/src/hooks/use-plans.ts` (new hook)

**Conflict analysis:**
- `server/routes/plans.ts`: 5H touches only `shared/financial-engine.ts` and test files. 6.1 creates a separate `documents.ts` route. No conflict.
- `app-sidebar.tsx`: No 5H or 6 story touches the sidebar component. No conflict.
- `dashboard.tsx`: No 5H or 6 story touches the dashboard page. No conflict.

**Dependency check:** Epic 5 (done) ✅. No dependency on 5H or 6.

**Verdict: ✅ CAN run in parallel with 5H and 6.**

---

### Epic 9.1: LLM Integration & Conversation API

**What it does:** Builds the server-side LLM proxy with SSE streaming, conversation history storage, AI value extraction, and validation.

**Files touched:**
- `server/routes/conversation.ts` — new file (AI conversation endpoint)
- `server/index.ts` — one-line route registration (different line from 6.1's registration)
- Possibly: `server/services/llm-proxy.ts` (new service file)
- `shared/schema.ts` — possibly adds a `conversation_history` JSONB column to `plans` table

**Conflict analysis:**
- All primary files are new. No overlap with 5H (engine + statement UI) or 6 (PDF generation).
- `server/index.ts`: 6.1 also registers a route here. Both changes are additive single-line insertions. If truly in parallel, merge is trivial (standard git merge handles non-overlapping line insertions).
- `shared/schema.ts`: Only if 9.1 adds a conversation history column. 6.2 adds a `documents` table. Both are additive. Merge is straightforward.

**Dependency check:** No listed dependency on 5H or 6. The AI accesses brand parameters and plan state through existing API endpoints already built in Epics 1–4.

**Verdict: ✅ CAN run in parallel with 5H and 6.** (Minor merge coordination needed for `server/index.ts` if truly concurrent — prefer short-lived branches and fast merges.)

---

### Epic 10.1: Sensitivity Controls & Sandbox Engine

**What it does:** Creates the standalone What-If Playground page with sensitivity sliders. Computes three scenarios (Base/Conservative/Optimistic) client-side by calling `calculateProjections()` with modified inputs. Slider adjustments do NOT modify the user's actual plan.

**Files touched:**
- `client/src/pages/what-if.tsx` — new page
- `client/src/App.tsx` — new route (`/plans/:planId/what-if`)
- `client/src/components/what-if/sensitivity-controls.tsx` (new component directory)
- Calls `calculateProjections()` from `shared/financial-engine.ts` but does NOT modify it

**Conflict analysis:**
- Primary files are all new. Zero overlap with 5H's statement tab files or 6's PDF files.
- `client/src/App.tsx`: Only adds a new route entry. 5H and 6 don't touch App.tsx. No conflict.
- `shared/financial-engine.ts`: Story 5H.1 may change engine formulas. Story 10.1 only CALLS the engine, never modifies it. The calling interface (`calculateProjections()`) is stable — 5H.1 fixes change output values, not the function signature. 10.1 will automatically benefit from any 5H.1 bug fixes once merged.

**Dependency check:** Epic 5 (done) ✅. Explicitly stated: "Deferred — depends on financial statement views (Epic 5) being complete." Epic 5 is complete. No dependency on 5H or 6.

**Verdict: ✅ CAN run in parallel with 5H and 6.**

---

### Epic 10.2: Multi-Chart Sensitivity Dashboard

**What it does:** Adds 6 simultaneous Recharts charts (Profitability, Cash Flow, Break-Even, ROI, Balance Sheet, Debt) to the What-If Playground, reacting to slider adjustments.

**Files touched:**
- `client/src/components/what-if/` — new chart components
- `client/src/pages/what-if.tsx` — extended from 10.1

**Conflict analysis:** All new files. No overlap with 5H or 6.

**Dependency check:** Must follow 10.1 (sequential within Epic 10). No dependency on 5H or 6.

**Verdict: ✅ CAN run in parallel with 5H and 6 (after 10.1 completes).**

---

### Epic 11.1: Franchisee Data Sharing Controls

**What it does:** Adds opt-in/revoke data sharing settings for franchisees. API-level enforcement of sharing boundaries.

**Files touched:**
- `client/src/pages/settings.tsx` (new or extends existing settings page)
- `client/src/components/settings/data-sharing.tsx` (new component)
- `server/routes/plans.ts` (adds `sharing_opt_in` field handling) or new `server/routes/sharing.ts`
- `shared/schema.ts` — adds `sharing_opt_in` boolean column to `plans` table

**Conflict analysis:**
- `shared/schema.ts`: 6.2 adds a `documents` table; 11.1 adds a column to the existing `plans` table. These are different locations in the same file — merges are straightforward. If truly concurrent on separate branches, coordinate the merge order.
- All other files are new or touch routes not touched by 5H or 6.

**Dependency check:** No listed dependency on 5H or 6.

**Verdict: ✅ CAN run in parallel with 5H and 6.** (Coordinate `shared/schema.ts` merge with 6.2 if both are in flight simultaneously — prefer landing 6.2 first then rebasing 11.1's schema change on top.)

---

### Epic 11.2: Franchisor Pipeline Dashboard

**What it does:** Pipeline visibility dashboard for franchisor admins — franchisee list with planning status, stage, market, timeline. Financial details gated by franchisee opt-in.

**Files touched:**
- `client/src/pages/franchisor-dashboard.tsx` (new page)
- `client/src/components/franchisor/` (new component directory)
- `server/routes/brands.ts` (adds franchisee-list-for-franchisor endpoints) or new route file
- `server/routes/plans.ts` (adds permission-scoped plan summary endpoint)

**Conflict analysis:** New files or additive changes to existing route files not touched by 5H or 6. No conflict.

**Dependency check:** Depends on 11.1 (sequential within Epic 11). No dependency on 5H or 6.

**Verdict: ✅ CAN run in parallel with 5H and 6 (after 11.1 completes).**

---

### Epic 11.3: Katalyst Admin Cross-Brand Dashboard

**What it does:** Cross-brand operational intelligence dashboard for Katalyst admins. Filter by brand, status, timeline. Drill into individual franchisee plans.

**Files touched:**
- `client/src/pages/admin-dashboard.tsx` (extends or replaces existing admin dashboard)
- `client/src/components/admin/cross-brand-dashboard.tsx` (new component)
- `server/routes/admin.ts` (adds cross-brand query endpoints)

**Conflict analysis:** Primarily extends existing admin route file and creates new components. `server/routes/admin.ts` is not touched by 5H or 6. No conflict.

**Dependency check:** No listed dependency on 5H or 6.

**Verdict: ✅ CAN run in parallel with 5H and 6.**

---

## Stories That CANNOT Run in Parallel With 5H or 6

These stories have direct file-level conflicts with Epic 5H (primarily 5H.2) or are logically dependent on 5H completing.

---

### Epic 7.1: Per-Year Input Columns

**Why it conflicts:**

1. **File conflict with 5H.2:** Story 7.1 explicitly removes the "linked-column" indicators from all statement tabs (Story 5.2 introduced them; 7.1 removes them now that per-year values are independent). This means 7.1 modifies the same statement tab files (`pnl-tab.tsx`, `balance-sheet-tab.tsx`, `cash-flow-tab.tsx`, etc.) that 5H.2 is simultaneously auditing and fixing. Running both in parallel guarantees destructive merge conflicts.

2. **Logical conflict with 5H.1:** Story 7.1 restructures `PlanFinancialInputs` to use 5-element arrays for all per-year inputs. This changes the `unwrapForEngine()` transformation pipeline in `shared/plan-initialization.ts` — the exact pipeline that 5H.1 is validating against reference spreadsheets. If 7.1 restructures the inputs while 5H.1 is still in validation, the 5H.1 reference tests become invalid immediately.

3. **Schema conflict:** 7.1 modifies `shared/schema.ts` (restructuring the `financial_inputs` JSONB field expectations). This overlaps with 6.2's schema changes.

**Verdict: ❌ CANNOT run in parallel with 5H or 6. Must wait until 5H.1 and 5H.2 complete.**

---

### Epic 8.1: Input Range Validation & Advisory Nudges

**Why it conflicts:**

Story 8.1 adds advisory nudge UI to Reports inline editing: "out-of-range values show a subtle advisory-color background with range tooltip on hover." This requires modifying the same statement tab components (`pnl-tab.tsx`, `balance-sheet-tab.tsx`, etc.) and `inline-editable-cell.tsx` that 5H.2 is auditing and remediating. Running 8.1 while 5H.2 is in flight means fixing UI issues in files that are simultaneously being modified by a different developer/agent for a different purpose — guaranteed conflicts.

**Verdict: ❌ CANNOT run in parallel with 5H.2. Must wait until 5H.2 completes.**

The My Plan forms portion of 8.1 (advisory nudges next to form fields in `client/src/components/planning/forms/`) does NOT conflict with 5H.2 (which only touches statement tabs). However, the story is written as a single unit; splitting it introduces coordination complexity. Recommend keeping 8.1 as a unit and starting it after 5H.2.

---

### Epic 8.2: Weak Business Case Detection & Actionable Guidance

**Why it conflicts:**

Depends on 8.1 (sequential within Epic 8). Inherits 8.1's file conflicts with 5H.2.

**Verdict: ❌ CANNOT run in parallel with 5H.2. Starts after 8.1, which starts after 5H.2.**

---

### Epic 9.2: Split-Screen Planning Assistant Interface

**Why it may conflict:**

Story 9.2 adds a split-screen layout to My Plan with sidebar collapse behavior ("Direction F"). This involves:
- `client/src/components/planning/planning-workspace.tsx` — layout restructure
- `client/src/index.css` — layout CSS for split-screen and sidebar collapse

`client/src/index.css` is explicitly listed as a 5H.2 modification target (z-index and layout changes for statement tabs). Concurrent modification of CSS layout rules is high-risk for conflicts.

**Verdict: ⚠️ CAUTION — partial conflict. 9.1 (API-only, no UI) can run freely in parallel. 9.2 should wait until 5H.2 completes to avoid CSS layout conflicts.**

---

### Epic 10.3: Scenario Persistence & Sharing (optional)

**Why it may conflict:**

Story 10.3 stores scenario data in `shared/schema.ts` (new column or table). This overlaps with 6.2's schema changes. As an optional enhancement, this story has the lowest priority and should simply be sequenced after 6.2.

**Verdict: ⚠️ Low risk — schema conflict with 6.2 is resolvable, but sequence after 6.2 for clean implementation.**

---

## Summary Tables

### Parallel Execution Opportunities

| Story | Epic | Can Start | File Conflicts with 5H | File Conflicts with 6 | Notes |
|-------|------|-----------|----------------------|--------------------|-------|
| 5H.3 | 5H | Now (5H.1 in review) | None | None | Documentation only |
| 5H.4 | 5H | Now (5H.1 in review) | None | None | Documentation only |
| 7.2 Plan CRUD | 7 | Now | None | None | New routes + sidebar nav |
| 9.1 LLM API | 9 | Now | None | Minor (`server/index.ts`) | New route file |
| 10.1 What-If Engine | 10 | Now | None | None | New page + sandbox |
| 10.2 What-If Charts | 10 | After 10.1 | None | None | New chart components |
| 11.1 Data Sharing | 11 | Now | None | Minor (`schema.ts`) | Coordinate schema merge |
| 11.2 Franchisor Dashboard | 11 | After 11.1 | None | None | New pages/endpoints |
| 11.3 Katalyst Dashboard | 11 | Now | None | None | New pages/endpoints |

### Stories Blocked Until 5H/6 Completes

| Story | Epic | Blocked By | Reason |
|-------|------|-----------|--------|
| 7.1 Per-Year Inputs | 7 | 5H.1 + 5H.2 | Modifies statement tabs (5H.2 files) AND restructures input pipeline (5H.1 scope) |
| 8.1 Advisory Nudges | 8 | 5H.2 | Modifies same statement tab components |
| 8.2 Business Case Detection | 8 | 8.1 → 5H.2 | Depends on 8.1 |
| 9.2 Planning Assistant UI | 9 | 5H.2 | CSS layout conflict with `client/src/index.css` |
| 9.3 AI Value Extraction | 9 | 9.2 | Sequential |
| 9.4 Graceful Degradation | 9 | 9.3 | Sequential |
| ST-4 Franchisor Demo | ST | 11.2 | Explicitly blocked pending Epic 11.2 |

---

## Recommended Execution Plan

With the analysis above, the following multi-stream approach maximizes throughput:

### Stream A: 5H Hardening (current)
```
5H.1 (in review) → [merge] → 5H.2 UI Audit → [complete] → Epic 6 unlocked
```

### Stream B: 5H Documentation (can start now, parallel to Stream A)
```
5H.3 (AC Audit) + 5H.4 (Artifact Alignment) — coordinate epics.md edits
Run 5H.3 first, then 5H.4 for clean merge history
```

### Stream C: Plan Management (can start now)
```
Epic 7.2 (Plan CRUD & Navigation) — independent, no conflicts
```

### Stream D: AI Foundation (can start now)
```
Epic 9.1 (LLM Integration & Conversation API) — new files, minimal conflict
9.2/9.3/9.4 unlock after 5H.2 completes
```

### Stream E: What-If Playground (can start now)
```
Epic 10.1 (Sensitivity Controls) → Epic 10.2 (Multi-Chart Dashboard)
Epic 10.3 (optional, after 6.2)
```

### Stream F: Data Sharing & Dashboards (can start now)
```
Epic 11.1 → Epic 11.2 → [ST-4 unlocked]
Epic 11.3 (independent of 11.1 sequence, can run parallel to 11.1)
```

### Stream G: Advisory Layer (waits for Stream A to complete 5H.2)
```
[5H.2 complete] → Epic 8.1 → Epic 8.2
```

### Stream H: Per-Year Inputs (waits for Streams A and G)
```
[5H.1 + 5H.2 complete] → Epic 7.1 (Per-Year Input Columns)
```

---

## Key Decision Points

**1. Can 5H.3 and 5H.4 truly run in parallel with each other?**
Yes, but with coordination. They both write to `epics.md` in different sections. Use short-lived branches and merge sequentially (5H.3 → 5H.4 order recommended). If a single developer is working on both, run them sequentially within a session.

**2. Does 5H.1 being "in review" block anything in the parallel streams?**
No. The parallel streams (7.2, 9.1, 10.1, 11.x) create entirely new files or touch routes/components that are completely separate from the engine (`shared/financial-engine.ts`) that 5H.1 is modifying.

**3. Should Epic 9.1 (LLM API) wait for anything?**
No. The conversation endpoint accesses brand parameters and plan state through existing APIs already built in Epics 1–4. It can be built and tested independently.

**4. What is the earliest point at which Epic 7.1 can start?**
After both 5H.1 and 5H.2 complete. 5H.1 must finalize the engine's correct behavior (so the new input pipeline 7.1 builds is validated against the correct engine). 5H.2 must finish its statement tab modifications (so 7.1 can safely remove the linked-column indicators from those same files).

**5. Is there any conflict between Epic 10.1 and 5H.1?**
No. Story 10.1 calls `calculateProjections()` but does not modify `shared/financial-engine.ts`. If 5H.1 fixes engine bugs, Story 10.1's sandbox engine automatically benefits once the fix is merged. The calling interface is stable.

---

## FR Traceability for Parallel Stories

For completeness, the FRs covered by the parallelizable stories:

| Story | FRs Covered |
|-------|------------|
| 5H.3 | Gap analysis for FR24, FR25, FR26, FR27 (Epic 6) |
| 5H.4 | FR traceability for all 111 FRs |
| 7.2 | FR15, FR16 (multi-plan navigation) |
| 9.1 | FR50, FR53 (AI conversation + context access) |
| 10.1 | FR7d extended (scenario/sensitivity analysis) |
| 10.2 | FR7d extended (multi-chart sensitivity) |
| 11.1 | FR33, FR34, FR35, FR38 (data sharing controls) |
| 11.2 | FR36, FR37, FR45, FR48 (franchisor pipeline) |
| 11.3 | FR46, FR47 (Katalyst cross-brand dashboard) |

---

*This analysis was generated from a full review of `epics.md` (2333 lines), `sprint-status.yaml`, and the existing source file inventory. File conflict analysis is based on the source file listing as of 2026-02-20.*
