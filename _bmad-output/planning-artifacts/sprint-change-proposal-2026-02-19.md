# Sprint Change Proposal: UX Specification Compliance Remediation

**Date:** 2026-02-19
**Author:** BMAD Course Correction Workflow
**Triggered by:** Post-Epic-5 divergence analysis comparing current implementation against consolidated UX Design Specification
**Mode:** Batch (all changes presented together)
**Selected Path:** Option 1 — Direct Adjustment (patch forward)
**Change Scope:** Moderate

---

## Section 1: Issue Summary

During Epics 1–5 implementation, the executing agent diverged from the consolidated UX Design Specification in 13 documented ways. The UX spec was created mid-sprint (commit `bd766be`, 2026-02-16) but the agent continued building against older assumptions — notably preserving a three-mode experience (Planning Assistant / Forms / Quick Entry) that the spec explicitly retired, using a blue color system instead of Katalyst Green, using Open Sans instead of the specified Montserrat/Roboto/Roboto Mono type stack, and structuring navigation differently than the Two-Door Model.

The financial engine, auth/RBAC, storage layer, and API routes are all solid. The divergences are confined to the **UI shell layer**: CSS design tokens, component structure, sidebar navigation, and component placement. The codebase is healthy (0 LSP errors, 0 warnings, 25 benign content TODOs in `field-help.ts`).

**Discovery method:** Systematic comparison of current codebase against all four planning artifacts (PRD, Architecture, UX Spec, Epics) during BMAD Course Correction workflow.

### Complete Divergence Catalog

**CRITICAL (C):**

| ID | Divergence | Evidence | UX Spec Reference |
|----|-----------|----------|--------------------|
| C1 | Mode Switcher still exists | `mode-switcher.tsx` present, `ExperienceTier` type, `activeMode` state in `planning-workspace.tsx` | Part 7, line 453/498: "The segmented control mode switcher is retired. No mode switcher exists anywhere in the UI." |
| C2 | Quick Entry grid still exists | `quick-entry-mode.tsx` present, imported in `input-panel.tsx` | Part 10, line 823: "The flat grid component is retired. Its functionality is fully absorbed by inline-editable financial statement tabs in Reports." |
| C3 | Navigation architecture wrong | Missing "MY LOCATIONS" / "All Plans" labeling, missing Planning Assistant in Help section, Glossary placed as top-level nav | Part 7: Two-Door Model sidebar structure |

**HIGH (H):**

| ID | Divergence | Evidence | UX Spec Reference |
|----|-----------|----------|--------------------|
| H1 | Color system is blue, not Katalyst Green | `--primary: 211 85% 42%` in index.css | Part 6: Primary = `#78BF26` (Katalyst Green), warm neutral palette |
| H2 | Typography wrong | `--font-sans: Open Sans`, `--font-mono: Menlo` | Part 6: Montserrat (headings), Roboto (body), Roboto Mono (financials) |
| H3 | Story 5.5 has 3 unresolved HIGH findings | sprint-status.yaml: H1 audit categories, H2 muted text, H3 per-row icons | Story 5.5 acceptance criteria AC14, AC16, AC17 |
| H4 | Stories 5.6–5.10 unverified | All 5 stories in "review" status, not code-reviewed post-UX-spec | sprint-status.yaml |

**MEDIUM (M):**

| ID | Divergence | Evidence | UX Spec Reference |
|----|-----------|----------|--------------------|
| M1 | Impact Strip inside FormsMode | `ImpactStrip` imported in `forms-mode.tsx`, not at workspace level | Part 8: Sticky bottom bar on My Plan view |
| M2 | Document Preview not on Dashboard | Only in FormsMode modal; Dashboard is a plan list | Part 13: Document Preview widget card on Dashboard |
| M3 | Guardian Bar placement unverified | Rendered within `FinancialStatements`, needs position check | Part 9: Above Reports tabs, below header |
| M4 | Missing Plan Completeness Dashboard | `SummaryMetrics` shows financial metrics, not section completion | Part 8: Plan completeness dashboard for re-entry |

**LOW (L):**

| ID | Divergence | Evidence | UX Spec Reference |
|----|-----------|----------|--------------------|
| L1 | Border radius wrong | Uses default `rounded-md` | Part 6: `rounded-2xl` cards, `rounded-xl` inputs |
| L2 | Financial formatting gaps | No accounting-style parentheses, no "BD" badges, no per-tab completion | Part 9/10: Financial formatting conventions |

---

## Section 2: Impact Analysis

### Epic Impact

| Epic | Status | Impact Level | Details |
|------|--------|-------------|---------|
| Epic 5 (Financial Statements) | in-progress | **HIGH** | Mode switcher/Quick Entry retirement changes workspace rendering. Impact Strip and Document Preview need repositioning. Story 5.5 has 3 unresolved HIGHs. Stories 5.6–5.10 need re-verification. |
| Epic 7 (Per-Year Inputs) | backlog | **MEDIUM** | Story 7.1 ACs reference Quick Entry grid — need rewording to reference Reports inline editing and Forms. |
| Epic 9 (AI Planning Advisor) | backlog | **MINOR** | Planning Assistant sidebar nav entry created as placeholder during C3 fix. |
| Epic 6 (Document Generation) | backlog | **MINOR** | Document Preview widget placement changes (Dashboard vs FormsMode). |
| Epics 8, 10–12, ST | various | **NONE** | No impact from any of the 13 divergences. |

### Story Impact

| Story | Current Status | Impact | Action Needed |
|-------|---------------|--------|---------------|
| 5.5 | in-progress | Direct | Fix 3 HIGH findings (audit categories, muted text, per-row icons) |
| 5.6 | review | Re-verify | Confirm inline editing works after mode switcher removal |
| 5.7 | review | Re-verify | Confirm scenario comparison unaffected |
| 5.8 | review | Re-verify | Verify Guardian Bar placement matches spec |
| 5.9 | review | Re-verify | Impact Strip and Document Preview repositioned (CP-8, CP-9) |
| 5.10 | review | Re-verify | Confirm glossary accessible after navigation changes |
| 7.1 | backlog | AC reword | Remove Quick Entry references, replace with Reports/Forms |

### Artifact Conflicts

| Artifact | Needs Update? | Details |
|----------|--------------|---------|
| PRD | **No** | Requirements are correct; code doesn't match them |
| Architecture | **No** | Design system specs in doc are correct |
| UX Spec | **No** | Authority document; implementation must match it |
| Epics | **Yes** | Epic 7 Story 7.1 ACs need Quick Entry references removed |
| sprint-status.yaml | **Yes** | Needs remediation story entries and status updates |

### Technical Impact

- **Components deleted:** `mode-switcher.tsx`, `quick-entry-mode.tsx`
- **Components modified:** `planning-workspace.tsx`, `input-panel.tsx`, `forms-mode.tsx`, sidebar component, `index.css`
- **Components repositioned:** Impact Strip (→ workspace level), Document Preview (→ Dashboard)
- **Fonts installed:** Montserrat, Roboto, Roboto Mono (Google Fonts CDN)
- **Tests removed:** Quick Entry mode tests, mode switcher interaction tests
- **Tests added:** Post-remediation workspace verification
- **No data model changes.** No API changes. No engine changes.

---

## Section 3: Recommended Approach

### Selected: Option 1 — Direct Adjustment

Patch the current codebase forward. No rollback, no MVP scope reduction.

### Rationale

1. **Codebase is healthy** — zero LSP errors, no meaningful tech debt, clean starting point
2. **Financial engine is proven** — 173+ tests, deterministic, architecturally sound
3. **All divergences are UI-layer** — CSS tokens, component deletion, component moves, sidebar restructuring
4. **Rollback would destroy value** — Epic 5's financial statement infrastructure (4 completed stories, inline editing, scenario comparison, guardian bar) is high-quality tested work
5. **MVP scope unaffected** — no features cut, no requirements changed, no new capabilities needed
6. **Remediating now prevents compounding** — Epics 6–12 build on the UI shell; fixing it now avoids retrofitting later

### Alternatives Considered

**Option 2 (Rollback):** Not viable. Mode switcher and Quick Entry date back to Epic 4 (done, retrospective complete). Rollback would lose all Epic 5 financial statement work. The stable state to build from is the current one.

**Option 3 (MVP Review):** Not needed. All 13 divergences are UI compliance issues, not missing capabilities. No scope reduction required.

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Mode switcher removal breaks component wiring | Low | Medium | FormsMode already works standalone; removal is deletion of branching logic |
| Quick Entry removal leaves input gaps | Low | Low | Reports inline editing (5.6) already covers the same functionality |
| Color system change creates contrast issues | Medium | Low | Test dark mode and light mode after palette swap |
| Stories 5.6–5.10 break after structural changes | Medium | Medium | Re-verify each story's ACs after remediation |

---

## Section 4: Detailed Change Proposals

### CP-1: Retire Mode Switcher (addresses C1)

**Files:** `mode-switcher.tsx`, `planning-workspace.tsx`, `input-panel.tsx`

**OLD:**
- `ExperienceTier` type with 3 modes (`"planning_assistant" | "forms" | "quick_entry"`)
- `activeMode` state with `localStorage` persistence in `planning-workspace.tsx`
- `getStoredMode()` function reads saved mode preference
- `InputPanel` branches on `activeMode` to render `FormsMode` / `QuickEntryMode` / placeholder
- `mode-switcher.tsx` component renders segmented control UI

**NEW:**
- Delete `mode-switcher.tsx`
- Remove `ExperienceTier` type from `input-panel.tsx`
- Remove `activeMode` state, `getStoredMode()`, `setActiveMode()` from `planning-workspace.tsx`
- Remove `localStorage` mode persistence
- `InputPanel` always renders `FormsMode` directly (no branching, no mode prop)
- Remove `showExternalMetrics` conditional (always show metrics)

**Rationale:** UX spec line 498 — "No mode switcher exists anywhere in the UI."

---

### CP-2: Retire Quick Entry Grid (addresses C2)

**Files:** `quick-entry-mode.tsx`, `input-panel.tsx`

**OLD:**
- `quick-entry-mode.tsx` exports `QuickEntryMode` component (spreadsheet grid)
- `input-panel.tsx` imports and renders `QuickEntryMode` when `activeMode === "quick_entry"`
- Quick Entry integration tests exist

**NEW:**
- Delete `quick-entry-mode.tsx`
- Remove `QuickEntryMode` import from `input-panel.tsx`
- Remove Quick Entry test files
- Reports inline editing (Story 5.6) replaces this functionality

**Rationale:** UX spec line 823 — "The flat grid component is retired. Its functionality is fully absorbed by inline-editable financial statement tabs in Reports."

---

### CP-3: Fix Navigation Architecture (addresses C3)

**Files:** Sidebar component (`app-sidebar.tsx` or equivalent)

**OLD:**
- Top-level nav: Home, Brands, Invitations, Glossary
- Plan section: My Plan, Reports, Scenarios, Settings
- No Planning Assistant in Help section

**NEW:**
- MY LOCATIONS section header with "All Plans" item (replaces "Home")
- [Active Plan Name] section: My Plan, Reports, Scenarios, Settings (unchanged)
- HELP section: "Planning Assistant" (placeholder — links to future Epic 9), "Book Consultation"
- Glossary relocated to contextual access or Help section (not top-level nav)
- Brands / Invitations remain as admin-level items (visible by role)

**Rationale:** UX spec Part 7 — Two-Door Model sidebar structure.

---

### CP-4: Fix Color System (addresses H1)

**Files:** `client/src/index.css`

**OLD:**
```css
--primary: 211 85% 42%;  /* Blue */
/* Cool gray neutrals throughout */
```

**NEW:**
```css
--primary: 90 75% 45%;  /* Katalyst Green, mapped from #78BF26 */
/* Warm neutral palette per UX spec Part 6 */
/* --katalyst-brand already correct at 145 63% 42% */
/* Guardian colors already correct */
```

**Note:** Full palette mapping (backgrounds, cards, borders, sidebar, popovers) needs to shift from cool blue-gray to warm neutrals. Dark mode variant must also be updated.

**Rationale:** UX spec Part 6 — Katalyst Green `#78BF26` as primary brand color.

---

### CP-5: Fix Typography (addresses H2)

**Files:** `client/src/index.css`, `index.html`

**OLD:**
```css
--font-sans: Open Sans, sans-serif;
--font-mono: Menlo, monospace;
/* No heading font distinction */
```

**NEW:**
```css
--font-sans: 'Roboto', sans-serif;
--font-heading: 'Montserrat', sans-serif;
--font-mono: 'Roboto Mono', monospace;
```
- Add Google Fonts CDN link to `index.html` for Montserrat (600, 700), Roboto (400, 500), Roboto Mono (400, 500)
- May need tailwind config update to expose `font-heading` utility class
- Financial figure cells should use `font-mono` for tabular alignment

**Rationale:** UX spec Part 6 — Montserrat headings, Roboto body, Roboto Mono financials.

---

### CP-6: Fix Story 5.5 HIGHs (addresses H3)

**Files:** Audit tab component, financial engine outputs

**H1 FIX:** Align audit category names and count with acceptance criteria AC14's 13 listed categories. Current engine produces 15 — reconcile by merging or renaming to match spec.

**H2 FIX:** Add muted/subdued text styling to passing audit categories per AC16. Currently all categories display with same visual weight.

**H3 FIX:** Add per-row pass/fail icons to failing check detail rows per AC17. Currently check details show text only without visual status indicators.

**Rationale:** Adversarial code review findings documented in sprint-status.yaml, 2026-02-19 entry.

---

### CP-7: Re-verify Stories 5.6–5.10 (addresses H4)

After CP-1 and CP-2 change the workspace structure, systematically verify:

| Story | Verification Focus |
|-------|--------------------|
| 5.6 (inline editing) | Confirm editing still works without mode switcher branching; InputPanel renders FormsMode directly |
| 5.7 (scenario comparison) | Confirm comparison overlay unaffected by workspace structural changes |
| 5.8 (guardian bar) | Verify placement is above Reports tabs, below header per spec (M3) |
| 5.9 (impact strip + doc preview) | Confirm repositioning (CP-8, CP-9) doesn't break functionality |
| 5.10 (glossary) | Confirm glossary accessible after navigation changes (CP-3) |

Fix any breakage discovered during re-verification.

---

### CP-8: Reposition Impact Strip (addresses M1)

**Files:** `forms-mode.tsx`, `planning-workspace.tsx`

**OLD:**
- `ImpactStrip` imported and rendered inside `forms-mode.tsx` (line 30, 191)
- `DocumentPreviewModal` also inside `forms-mode.tsx` (line 31, 200)
- Only visible when in "forms" mode

**NEW:**
- Move `ImpactStrip` import and render to `planning-workspace.tsx`
- Render as sticky bottom bar on My Plan view, visible regardless of internal component state
- `DocumentPreviewModal` remains accessible from Impact Strip's `onOpenDocumentPreview` callback
- Remove ImpactStrip/DocumentPreviewModal from `forms-mode.tsx`

**Rationale:** UX spec Part 8 — Impact Strip is persistent sticky bar at bottom of My Plan.

---

### CP-9: Add Document Preview to Dashboard (addresses M2)

**Files:** `dashboard.tsx` (or equivalent page)

**OLD:**
- Dashboard shows plan list with Card components
- No document preview widget
- DocumentPreviewModal only accessible from FormsMode via Impact Strip

**NEW:**
- Add `DocumentPreviewWidget` card to Dashboard page
- Shows first page / summary of lender document for the user's most recent or active plan
- Clickable to open full DocumentPreviewModal

**Rationale:** UX spec Part 13 — Document Preview lives on Dashboard panel as a card.

---

### CP-10: Plan Completeness Dashboard (addresses M4)

**Files:** `planning-workspace.tsx` or new component

**OLD:**
- `SummaryMetrics` bar shows financial metrics (revenue, profit, ROI, etc.) at top of My Plan

**NEW:**
- Add plan completeness indicator alongside or above SummaryMetrics
- Shows section-by-section completion status (e.g., Revenue ✓, Expenses partial, Startup Costs ✗)
- Provides session re-entry context for returning users

**Rationale:** UX spec Part 8 — plan completeness dashboard for re-entry.

---

### CP-11: Polish Items (addresses L1, L2)

**L1 — Border radius:**
- Update card components to use `rounded-2xl` (or configure via CSS variable)
- Update input/button components to use `rounded-xl`
- Currently uses default shadcn `rounded-md`

**L2 — Financial formatting:**
- Accounting-style parentheses for negative numbers: `($4,200)` instead of `-$4,200`
- "BD" (Brand Default) badge on cells still using brand default values
- Per-tab completeness indicators in Reports tab bar

**Priority:** Lower — address after critical and high items.

---

## Section 5: Implementation Handoff

### Change Scope Classification: Moderate

This is not a minor patch (too many cross-cutting changes across the UI layer) but not a major replan (no architecture rework, no MVP scope changes, no new epics required). It is a focused remediation sprint within Epic 5's existing scope.

### Execution Sequence

The change proposals have dependencies. Recommended execution order:

1. **CP-4 + CP-5** (Design tokens) — Color and typography first, as they affect every screen
2. **CP-1 + CP-2** (Retire components) — Remove mode switcher and Quick Entry
3. **CP-3** (Navigation) — Fix sidebar structure
4. **CP-8 + CP-9 + CP-10** (Repositioning) — Move Impact Strip, add Dashboard preview, add completeness
5. **CP-6** (Story 5.5 fixes) — Fix audit tab HIGH findings
6. **CP-7** (Re-verify 5.6–5.10) — Verify everything works after structural changes
7. **CP-11** (Polish) — Border radius, financial formatting

### Handoff Recipients

| Role | Responsibility |
|------|---------------|
| Development agent | Execute all 11 change proposals in sequence above |
| Course correction workflow | Verify success criteria after implementation |

### Success Criteria

1. Zero components exist that UX spec says are retired (mode switcher, Quick Entry)
2. `--primary` CSS variable maps to Katalyst Green (`#78BF26`)
3. Typography uses Montserrat (headings), Roboto (body), Roboto Mono (financials)
4. Sidebar navigation matches Two-Door Model (MY LOCATIONS → Plan → HELP)
5. Impact Strip renders as sticky bottom bar on My Plan (workspace level, not inside FormsMode)
6. Document Preview widget appears on Dashboard
7. Plan completeness indicator visible on My Plan
8. Story 5.5 passes all acceptance criteria (3 HIGHs resolved)
9. Stories 5.6–5.10 pass re-verification after structural changes
10. LSP remains clean (0 errors)
11. Existing financial engine tests still pass (173+)
12. Dark mode and light mode both render correctly with new palette

### Sprint Status Updates Required

After remediation is complete:
- Story 5.5: `in-progress` → `done` (after CP-6 fixes)
- Stories 5.6–5.10: `review` → `done` (after CP-7 re-verification)
- Epic 5: `in-progress` → `done` (after all stories close)
- Epic 7 Story 7.1: Update ACs to remove Quick Entry references

---

*Generated by BMAD Course Correction Workflow, Step 5*
*Authority documents: PRD, Architecture, UX Design Specification (consolidated), Epics*
*Platform intelligence: 0 LSP errors, 25 benign TODOs, 50 recent commits, healthy codebase*
