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

---

## Appendix: Adversarial Review Findings

*Reviewed: 2026-02-19 via BMAD Adversarial Review workflow*
*Content type: Sprint Change Proposal (planning artifact)*
*Cross-referenced against: UX Design Specification (consolidated), codebase, sprint-status.yaml*

### Findings (14 total, prioritized)

1. **CRITICAL — Missing Divergence: `--info` / "Gurple" token absent from codebase.** The UX spec (Part 6, Part 12) defines a `--info` token mapped to "Mystical (Gurple)" `#A9A2AA` for advisory/educational content, and explicitly states red must NEVER be used for advisory guardrails. The codebase's `index.css` has no `--info` token at all. The Guardian Bar's "concerning" level uses `280 12% 65%` (a generic purple), not the specified Gurple hex. The proposal never identifies this missing design token — it only catches the primary color being blue.

2. **CRITICAL — Dark mode exists but UX spec explicitly defers it to post-MVP.** The codebase has a full `.dark` CSS class with 60+ dark-mode token overrides. The UX spec (Part 1, line 96–102) states: "Dark mode implementation is deferred to post-MVP." The proposal not only fails to flag this contradiction, it actively instructs the developer to "update dark mode variant" in CP-4 and lists "Dark mode and light mode both render correctly with new palette" as success criterion #12. The proposal is asking devs to polish a feature the spec says shouldn't exist yet.

3. **HIGH — Missing Divergence: `<FinancialValue>` component doesn't exist.** The UX spec (Part 6, Component Strategy table) specifies a custom `<FinancialValue>` component as a design-system primitive that "handles all number formatting" and states "All financial displays use this component." No such component exists anywhere in the codebase. Financial formatting is scattered across `format-currency.ts`, `field-metadata.ts`, and inline formatting in statement components. This is a significant architectural divergence the proposal completely ignores.

4. **HIGH — Negative number formatting misclassified as LOW.** The UX spec (Part 6) explicitly requires "Negative numbers: accounting-style parentheses, NOT minus signs. e.g., ($4,200) not -$4,200." The `formatCents()` function in `format-currency.ts` uses `toLocaleString` which produces "-$4,200" format. The proposal mentions this in L2 as a LOW polish item, but it's actually a core design-system violation — every financial display in the app renders negatives wrong. Classifying a pervasive formatting error that affects trust and professionalism as "LOW" is negligently optimistic.

5. **HIGH — Sidebar background color is wrong but not specifically identified.** The UX spec's token translation table (Part 6) specifies `--sidebar-background: White (#FFFFFF)`. The codebase has `--sidebar: 210 5% 94%` (a blue-gray), and uses `--sidebar` instead of `--sidebar-background`. The proposal's CP-4 mentions shifting from "cool blue-gray to warm neutrals" but never specifically identifies the sidebar background as being the wrong color or the wrong token name.

6. **HIGH — Execution sequence has a dependency violation.** The proposal orders CP-6 (Fix Story 5.5 HIGHs) at step 5, after CP-1/CP-2 (retire mode switcher/Quick Entry at step 2) and CP-3 (navigation at step 3). But CP-7 (re-verify stories 5.6–5.10) is at step 6. Story 5.5 is *also* affected by the structural changes from CP-1/CP-2 — audit tab rendering could break when the workspace structure changes — yet CP-6 is sequenced *before* CP-7's general re-verification. The proposal should either re-verify *all* stories (including 5.5) after structural changes, or acknowledge that CP-6 fixes might need to be re-applied after CP-1/CP-2. As written, the dev could fix 5.5 and then have CP-1/CP-2 break it again.

7. **HIGH — CP-3 sidebar specification is incomplete and ambiguous.** CP-3 says to create "MY LOCATIONS section header with 'All Plans' item (replaces 'Home')" and to add "Planning Assistant" to the HELP section. But the actual sidebar code (`app-sidebar.tsx`) has a first SidebarGroup with the brand label, not "MY LOCATIONS." The proposal doesn't specify: What happens to the "Glossary" nav item beyond "relocated to contextual access or Help section"? The "or" makes this non-actionable. Also, CP-3 says to add "Book Consultation" to the HELP section, but the current sidebar *already has* booking in a HELP section — the proposal doesn't acknowledge existing work or explain what specifically changes.

8. **MEDIUM — CP-4 color mapping math is wrong.** The proposal states `--primary: 90 75% 45%` as the HSL mapping for `#78BF26` (Katalyst Green). Converting `#78BF26` to HSL yields approximately `90° 67% 45%` (saturation ~67%, not 75%). The existing `--katalyst-brand: 145 63% 42%` is also wrong for `#78BF26` (should be ~90° hue, not 145°). The proposal claims `--katalyst-brand already correct at 145 63% 42%` — but 145° is in the teal-green range, not the yellow-green of `#78BF26`. Either the hex or the HSL is wrong, and the proposal blindly trusts one while changing the other.

9. **MEDIUM — Risk assessment is unrealistically optimistic about Quick Entry removal.** The proposal rates "Quick Entry removal leaves input gaps" as Low likelihood / Low impact, claiming "Reports inline editing (5.6) already covers the same functionality." But Story 5.6 is in "review" status with an unresolved deferred AC (AC7: EBITDA Multiple), and the sprint-status.yaml notes it hasn't been code-reviewed post-UX-spec. Claiming a story that hasn't been verified fully replaces another component is wishful thinking, not risk assessment. The risk should be Medium/Medium at minimum.

10. **MEDIUM — Success criteria are incomplete.** The 12 success criteria omit several verifiable outcomes that the change proposals explicitly call for: (a) No criterion for sidebar structure matching the Two-Door Model beyond vague criterion #4 — no mention of "All Plans" item, Planning Assistant placeholder, or Glossary relocation. (b) No criterion for the `font-heading` Tailwind utility class that CP-5 says "may need." (c) No criterion verifying the warm neutral palette shift (backgrounds, cards, borders) — only criterion #2 checks `--primary`. (d) No criterion for test removal (Quick Entry tests) or test addition (post-remediation workspace verification) mentioned in Technical Impact.

11. **MEDIUM — Story 5.2 was supposed to eliminate the mode switcher per the UX spec's Story Rewrite table, yet it's marked "done."** The UX spec's own Story Rewrite section (Part 19) assigns mode-switcher elimination to Story 5.2, which is marked "done" in sprint-status.yaml. Either Story 5.2 didn't actually do what the spec required (meaning its "done" status is fraudulent), or the proposal is re-discovering a known gap that should have been caught during Story 5.2's code review. The proposal doesn't investigate this discrepancy.

12. **MEDIUM — CP-10 (Plan Completeness Dashboard) is redundant with existing implementation.** The `forms-mode.tsx` file already contains a `PlanCompleteness` component (lines 214-264) that renders a `plan-completeness-dashboard` with section-by-section progress bars. The proposal's M4 divergence claims "`SummaryMetrics` shows financial metrics, not section completion" — but it's looking at the wrong component. The completeness dashboard exists; it's just inside FormsMode, not at the workspace level. The proposal should be about *repositioning* it (like CP-8 for Impact Strip), not *creating* it.

13. **LOW — LSP cleanliness is irrelevant padding.** The proposal claims "0 LSP errors, 0 warnings" and "25 benign content TODOs" as evidence of codebase health, but these metrics are meaningless for the type of divergences identified. LSP errors detect syntax/type issues, not design-system compliance or navigation architecture correctness. Citing LSP cleanliness in a document about UX spec divergences is padding the argument.

14. **LOW — CP-9 (Add Document Preview to Dashboard) lacks specificity about data source.** It says to show "first page / summary of lender document for the user's most recent or active plan" but doesn't specify: What if the user has no plans? What API endpoint provides the preview data? The existing `DocumentPreviewWidget` component already exists but is coupled to a specific plan context. Moving it to the Dashboard (which lists multiple plans) creates a data-binding ambiguity the proposal doesn't address.

---

## Amendment A: Spec Reconciliation Classifications (added 2026-02-19, Party Mode review)

*Context: Party Mode expert group review identified that the UX spec should not be treated as absolute truth — some divergences may reflect spec decisions that need revisiting given implementation learnings. Each divergence is classified below.*

### Classification Key

- **Category A — Spec is right, code must change:** Implementation diverges from a sound spec decision.
- **Category B — Spec needs revisiting:** The spec decision may be wrong, premature, or contradicted by later evidence. Spec should be updated before code changes.
- **Category C — Both need work:** Neither spec nor code is fully right; reconciliation needed.

### Divergence Classifications

| ID | Divergence | Classification | Rationale |
|----|-----------|---------------|-----------|
| C1 | Mode Switcher still exists | **B — Spec needs revisiting** | Spec retires mode switcher because destination state doesn't need it. But Epic 9 (Planning Assistant for Tier 1 guided users) doesn't exist yet. Without it, Tier 1 users lose their guided experience and have no obvious entry point. Recommendation: keep mode switcher as `@deprecated` scaffold with Planning Assistant placeholder disabled, rather than deleting immediately. Retire fully when Epic 9 delivers. |
| C2 | Quick Entry grid still exists | **A — Spec is right** | Reports inline editing (Story 5.6) genuinely replaces this. Quick Entry can be retired. |
| C3 | Navigation architecture wrong | **A — Spec is right** | Two-Door Model sidebar is the correct architecture. |
| H1 | Color system is blue | **B — Spec needs revisiting** | The hex `#78BF26` must be verified against actual Katalyst brand guidelines before implementing. The existing HSL mappings in both `--primary` and `--katalyst-brand` are mathematically inconsistent with this hex (AR finding #8). Verify hex, then convert correctly. |
| H2 | Typography wrong | **A — Spec is right** | Montserrat/Roboto/Roboto Mono is the correct type stack. |
| H3 | Story 5.5 has 3 unresolved HIGHs | **A — Spec is right** | Acceptance criteria are clear; code must meet them. |
| H4 | Stories 5.6–5.10 unverified | **A — Spec is right** | Re-verification is necessary after structural changes. |
| M1 | Impact Strip inside FormsMode | **A — Spec is right** | Should be at workspace level. |
| M2 | Document Preview not on Dashboard | **A — Spec is right** | Per UX spec Part 13. |
| M3 | Guardian Bar placement unverified | **A — Spec is right** | Must be above Reports tabs, below header. |
| M4 | Missing Plan Completeness Dashboard | **C — Both need work** | AR finding #12: `PlanCompleteness` component already exists inside FormsMode (lines 214-264). This is a *repositioning* task (like CP-8), not a *creation* task. CP-10 should be rewritten to reflect this. |
| L1 | Border radius wrong | **A — Spec is right** | Design token change. |
| L2 | Financial formatting gaps | **A — Spec is right** | But severity should be upgraded from LOW to HIGH per AR finding #4 — negative number formatting is a pervasive design-system violation, not polish. |

### Impact on Change Proposals

- **CP-1 (Mode Switcher):** Revised approach — deprecate rather than delete. Add `@deprecated` comment, disable Planning Assistant option, keep Forms as sole active path. Full retirement deferred to Epic 9 delivery.
- **CP-4 (Color System):** Blocked until `#78BF26` verified against brand source. Add verification step before implementation.
- **CP-10 (Plan Completeness):** Rewrite as repositioning task — move existing `PlanCompleteness` from FormsMode to workspace level, similar to CP-8 for Impact Strip.
- **L2 severity:** Upgraded from LOW to HIGH. Negative number formatting (`($4,200)` vs `-$4,200`) is a financial platform trust issue, not polish. Move from CP-11 to a dedicated fix step earlier in execution sequence.

---

## Amendment B: C-Ratio Display Bug & Formatted-Output Audit (added 2026-02-19, Party Mode investigation)

### Confirmed Bug: Labor Efficiency Ratio displays as percentage

**Trace:**
1. Engine (`financial-engine.ts` line 823): `laborEfficiency = totalWages / revenue` → returns decimal (e.g., `0.35`)
2. Summary tab (`summary-tab.tsx` line 90): Tagged `format: "pct"`
3. Formatter (`statement-table.tsx` line 43): `(value * 100).toFixed(1) + "%"` → displays `35.0%`

**Problem:** The label says "Labor Efficiency **Ratio**" but the display shows `35.0%`. A ratio should display as `0.35x` or `0.35:1`, not as a percentage. The same issue exists for `adjustedLaborEfficiency` (line 91).

**Root cause:** The `RowDef["format"]` union type only supports `"currency" | "pct" | "number" | "months"` — there is no `"ratio"` format type. The field was tagged `"pct"` as the closest available option, but it's semantically wrong.

### Required Fix (new CP-12)

**CP-12: Add ratio format type and fix labor efficiency display**

**Files:** `statement-table.tsx`, `summary-tab.tsx`

1. Add `"ratio"` to `RowDef["format"]` union: `"currency" | "pct" | "number" | "months" | "ratio"`
2. Add format case in `formatValue()`: `case "ratio": return value.toFixed(2) + "x";`
3. Change `laborEfficiency` row (line 90) from `format: "pct"` to `format: "ratio"`
4. Change `adjustedLaborEfficiency` row (line 91) from `format: "pct"` to `format: "ratio"`

**Severity:** MEDIUM — financial display accuracy issue affecting user trust.

### New Workstream: Reference Spreadsheet Conformance Audit

Every displayed metric across all statement tabs (Summary, P&L, Balance Sheet, Cash Flow, ROIC, Valuation) must be audited against the reference business plan spreadsheet for:

1. **Label accuracy** — does the display label match the spreadsheet label?
2. **Format correctness** — is the format type (`currency`, `pct`, `ratio`, `number`, `months`) semantically correct?
3. **Unit consistency** — are percentages shown as percentages, ratios as ratios, currencies as currencies?
4. **Negative formatting** — are negatives shown with accounting-style parentheses per spec?

This audit should be executed as part of CP-7 (re-verify stories 5.6-5.10) or as a standalone verification step after all CPs are implemented.

---

## Amendment C: Architectural Note — `<FinancialValue>` Component (added 2026-02-19, AR finding #3 + Party Mode)

The UX spec (Part 6, Component Strategy table) defines `<FinancialValue>` as a design-system primitive that "handles all number formatting" with the requirement "All financial displays use this component." No such component exists. Financial formatting is currently scattered across:

- `format-currency.ts` (`formatCents` function)
- `statement-table.tsx` (`formatValue` function with 4 format types)
- Inline formatting in `summary-tab.tsx` (line 181, 388)

The C-ratio bug (Amendment B) is a direct consequence of this missing abstraction — the formatting system doesn't carry semantic unit information, so fields get tagged with the wrong format type.

**Recommendation:** Creating `<FinancialValue>` is foundational work that should be sequenced *before* the formatted-output audit (Amendment B workstream) and the negative number formatting fix (L2, now upgraded to HIGH). This component would:

1. Accept a value, a semantic unit type (`currency`, `percentage`, `ratio`, `multiplier`, `months`), and optional sign treatment
2. Render with correct formatting, including accounting-style negatives
3. Eliminate the distributed `formatValue` / `formatCents` pattern
4. Prevent the entire class of "wrong format tag" bugs

**Implementation timing:** This is a design-system primitive. It should be created as the first step of the financial formatting remediation, before CP-11's L2 fix and before CP-12.

---

## Revised Execution Sequence (incorporating Amendments A, B, C)

1. **Verify brand hex** — Confirm `#78BF26` against actual Katalyst brand guidelines (blocks CP-4)
2. **CP-4 + CP-5** (Design tokens) — Color and typography, once hex is verified
3. **CP-1 revised** (Deprecate mode switcher) — Mark `@deprecated`, disable Planning Assistant option, keep Forms as sole active path
4. **CP-2** (Retire Quick Entry)
5. **CP-3** (Navigation) — Fix sidebar structure
6. **CP-8 + CP-9 + CP-10 revised** (Repositioning) — Impact Strip to workspace, Dashboard preview, PlanCompleteness to workspace
7. **`<FinancialValue>` component** — New design-system primitive (Amendment C)
8. **CP-12** (Ratio format fix) — Fix labor efficiency display (Amendment B)
9. **L2 upgraded fix** — Negative number formatting via `<FinancialValue>`
10. **CP-6** (Story 5.5 fixes) — After structural changes settled
11. **CP-7 + Conformance Audit** (Re-verify all stories + formatted-output audit)
12. **CP-11 remainder** (Border radius polish)

---

*Generated by BMAD Course Correction Workflow, Step 5, with Party Mode Amendments (Step 6 review)*
*Authority documents: PRD, Architecture, UX Design Specification (consolidated), Epics*
*Platform intelligence: 0 LSP errors, 25 benign TODOs, 50 recent commits, healthy codebase*
