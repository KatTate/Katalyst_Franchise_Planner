# Sprint Change Proposal: Epic 5 Remediation & Scenario Redesign

**Date:** 2026-02-20
**Status:** ✅ APPROVED — Product Owner reviewed all 9 open items on 2026-02-20
**Author:** Party Mode session (Bob, John, Sally, Winston, Amelia, BMad Master + Product Owner)
**Supersedes:** Builds on SCP-2026-02-19 (preserved as historical record)
**Triggered by:** Party Mode review identifying unresolved decisions, new Scenario vision, and need for clean consolidated plan

---

## Context

SCP-2026-02-19 identified 13 UI divergences from the consolidated UX spec. That document accumulated 3 amendments, an adversarial review appendix, and a premature approval record through multiple agent sessions. This SCP replaces it as the active remediation plan.

The original SCP-2026-02-19 and its amendments are preserved as historical context.

**Key finding from Party Mode review:** The financial engine, auth/RBAC, storage layer, and API routes are solid. All divergences are in the UI shell layer: CSS design tokens, component structure, sidebar navigation, and component placement.

---

## Section 1: Confirmed Decisions

These decisions were explicitly confirmed by the Product Owner during the 2026-02-20 Party Mode session.

| # | Decision | Detail | Status |
|---|----------|--------|--------|
| D1 | Delete mode switcher | Delete `mode-switcher.tsx` entirely. Do NOT deprecate. The three-mode model is dead. When Epic 9 delivers the AI Planning Assistant, it will be a slide-in panel within My Plan — not a mode. Tier 1 users get the same forms as Tier 2 until Epic 9 ships. | **CONFIRMED** |
| D2 | Brand color is `#78BF26` | This is the correct Katalyst Green hex. The HSL values in both `--primary` and `--katalyst-brand` need to be recomputed correctly. SCP-2026-02-19 AR finding #8 confirmed the existing HSL math is wrong. Correct HSL: approximately `90° 67% 45%` (must be verified by precise conversion). | **CONFIRMED** |
| D3 | Dark mode: freeze | Do not touch dark mode during remediation. It exists in the codebase. The UX spec defers it to post-MVP. Leave it as-is — don't update it with the new palette, don't strip it out. Just don't touch it. | **CONFIRMED** |
| D4 | Build `<FinancialValue>` component | Create the design-system primitive recommended in SCP-2026-02-19 Amendment C. This component handles all number formatting (currency, percentage, ratio, multiplier, months) with accounting-style negatives. Build it BEFORE fixing L2 (negative formatting) and CP-12 (ratio format). Eliminates the distributed `formatValue`/`formatCents` pattern and prevents the class of "wrong format tag" bugs. | **CONFIRMED** |
| D5 | Scenarios: standalone graphical What-If Playground | Pull scenario comparison entirely out of Reports. No more column-splitting overlay. Create a dedicated sidebar destination ("What-If" or "Scenarios") with a multi-chart sensitivity dashboard. See Section 3 for full description. | **CONFIRMED** |
| D6 | Story 5.7 retires from Epic 5 | Story 5.7 (Scenario Comparison — column splitting in Reports) is retired. Epic 5 closes with 9 stories (5.1–5.6, 5.8–5.10). The new graphical What-If Playground becomes Epic 10's scope. | **CONFIRMED** |
| D7 | User journeys must be documented | No end-to-end user journey narrative exists anywhere in the planning artifacts. Journey maps for all key personas must be created. To be captured as a section in the UX spec or as a standalone artifact. | **CONFIRMED — COMPLETED** (8 journeys added to UX spec Part 15, 2026-02-20) |

---

## Section 2: Change Proposals — Confirmed (Category A)

These items were classified as "Category A — Spec is right, code must change" in SCP-2026-02-19 Amendment A. They were never challenged by the Product Owner during Party Mode discussion.

**Status: Proceeding unless Product Owner objects during open item review.**

### CP-1: Delete Mode Switcher (was C1)

**Decision D1 applies.** Delete, not deprecate.

**Files:** `mode-switcher.tsx`, `planning-workspace.tsx`, `input-panel.tsx`

- Delete `mode-switcher.tsx`
- Remove `ExperienceTier` type from `input-panel.tsx`
- Remove `activeMode` state, `getStoredMode()`, `setActiveMode()` from `planning-workspace.tsx`
- Remove `localStorage` mode persistence
- `InputPanel` always renders `FormsMode` directly (no branching, no mode prop)

### CP-2: Retire Quick Entry Grid (was C2)

**Category A — confirmed, never challenged.**

**Files:** `quick-entry-mode.tsx`, `input-panel.tsx`

- Delete `quick-entry-mode.tsx`
- Remove `QuickEntryMode` import from `input-panel.tsx`
- Remove Quick Entry test files
- Reports inline editing (Story 5.6) replaces this functionality

### CP-3: Fix Navigation Architecture (was C3)

**Category A — confirmed, never challenged.**

**Files:** Sidebar component (`app-sidebar.tsx` or equivalent)

- Top-level nav: Home, Brands (admin), Invitations (admin) — Glossary REMOVED from top nav
- [Active Plan Name] section: My Plan, Reports, Scenarios, Settings — CONFIRMED as-is
- HELP section: "Book Consultation" (existing), Glossary (moved here from top nav)
- Brands / Invitations remain as admin-level items (visible by role)

**PO Review (2026-02-20):** Current sidebar structure confirmed as mostly correct. Only change: move Glossary from top nav down to Help section. Rest stays as-is.

### CP-4: Fix Color System (was H1)

**Decision D2 applies.** `#78BF26` is the correct hex.

**Files:** `client/src/index.css`

- Recompute `--primary` HSL from `#78BF26` (approximately `90 67% 45%` — verify with precise conversion)
- Recompute `--katalyst-brand` HSL — current value `145 63% 42%` is wrong (hue 145° is teal, `#78BF26` is hue ~90° yellow-green)
- Full palette shift: backgrounds, cards, borders, sidebar, popovers from cool blue-gray to warm neutrals per UX spec Part 6
- **Do NOT update dark mode** (Decision D3)

### CP-5: Fix Typography (was H2)

**Status: ✅ APPROVED.** Montserrat (headings), Roboto (body), Roboto Mono (financial figures). See Section 5, Open Item 1.

### CP-6: Fix Story 5.5 HIGHs (was H3)

**Status: ✅ APPROVED.** Fix all 3 HIGH findings per ACs as written. See Section 5, Open Item 2.

### CP-7: Re-verify Stories 5.6–5.10 (was H4)

**Status: ✅ APPROVED.** Re-verify after structural changes. See Section 5, Open Item 3.

### CP-8: Reposition Impact Strip (was M1)

**Status: ✅ APPROVED.** Move to planning-workspace level. See Section 5, Open Item 4.

### CP-9: Add Document Preview to Dashboard (was M2)

**Status: ✅ APPROVED.** Dashboard widget with empty state. See Section 5, Open Item 5.

### CP-10: Reposition Plan Completeness Dashboard (was M4)

**Status: ✅ APPROVED.** Move to workspace level as re-entry dashboard. See Section 5, Open Item 6.

**Note from SCP-2026-02-19 Amendment A:** This was reclassified as Category C ("Both need work"). AR finding #12 proved the `PlanCompleteness` component already exists inside FormsMode (lines 214-264). This is a repositioning task, not a creation task.

### CP-11: Polish — Border Radius (was L1)

**Status: ✅ APPROVED.** `rounded-2xl` for cards, `rounded-xl` for inputs/buttons. See Section 5, Open Item 7.

### CP-12: Ratio Format Fix (from Amendment B)

**Status: ✅ APPROVED.** `0.35x` format for ratios via `<FinancialValue>`. See Section 5, Open Item 8.

### CP-13: Negative Number Formatting (was L2, upgraded to HIGH)

**Status: ✅ APPROVED.** Accounting-style parentheses via `<FinancialValue>`. See Section 5, Open Item 9.

SCP-2026-02-19 Amendment A upgraded this from LOW to HIGH. Negative numbers currently display as `-$4,200` instead of accounting-style `($4,200)`. This is a pervasive financial display issue affecting user trust. Will be implemented via `<FinancialValue>` component (Decision D4).

---

## Section 3: Scenario Redesign — What-If Playground (Epic 10)

### Vision

A standalone sidebar destination that answers "What happens to my WHOLE business if things change?" through interactive graphical sensitivity analysis. This is a **planning tool**, not an accounting report. It builds conviction by letting the franchisee see how their plan responds to changing assumptions.

### Layout

**Top: Sensitivity Controls (sticky/collapsible, shared across all charts)**

Sliders for key assumptions, each showing current adjustment and dollar impact:
- Revenue: -15% ←——●——→ +15%
- COGS: -5% ←——●——→ +5%
- Payroll/Labor: -10% ←——●——→ +10%
- Marketing: -10% ←——●——→ +10%
- Facilities: -10% ←——●——→ +10%
- (Additional sliders as warranted by the financial model)

Alternatively, sliders could be replaced with or supplemented by editable numeric fields for precise input.

### Charts (mirroring Summary tab sections, all update simultaneously)

1. **Profitability (P&L Summary)** — 5-year line/area chart showing Annual Revenue, COGS, Gross Profit, EBITDA, Pre-Tax Income. Three scenario curves (Base solid, Conservative dashed, Optimistic dashed light).

2. **Cash Flow** — 5-year line chart showing Net Operating Cash Flow, Net Cash Flow, Ending Cash Balance. Highlight months where any scenario goes cash-negative (amber advisory zone).

3. **Break-Even Analysis** — Visual showing months to break-even for each scenario. Could be horizontal bar chart, timeline, or annotated point on the profitability chart.

4. **ROI & Returns** — 5-year cumulative ROIC chart with three scenario curves. Callout card with plain-language interpretation.

5. **Balance Sheet Health** — Total Assets vs Total Liabilities over 5 years. Equity growth visible as the gap between the lines.

6. **Debt & Working Capital** — Outstanding debt paydown trajectory, working capital position.

### Behavior

- All charts react to the same slider values simultaneously
- Scenarios are computed client-side by applying percentage multipliers to base case inputs
- Base case always reflects the user's actual saved plan inputs
- Slider adjustments do NOT change the user's actual plan — this is a sandbox
- Optional: "Lock this scenario" to save slider positions as a named scenario for future reference
- Three scenario curves on every chart: Base Case, Conservative, Optimistic
- Key metric cards with delta indicators showing impact of slider changes

### Architecture Notes

- Financial engine already supports this — pass modified inputs, get full projection
- Charting library needed (e.g., Recharts)
- Engine runs once per scenario (3 runs). Client-side computation, debounced slider input for instant feel.
- Under 2 seconds per computation per NFR1

### Story Migration

- Story 5.7 (Scenario Comparison — column splitting in Reports) is **RETIRED** from Epic 5
- Epic 10 receives new story/stories with ACs reflecting the What-If Playground vision above
- Epic 5 closes with 9 stories: 5.1–5.6, 5.8–5.10
- Sidebar "Scenarios" nav item points to the new What-If Playground, not to Reports

---

## Section 4: User Journey Documentation (Required Deliverable)

The following user journeys must be documented as step-by-step narratives. These are not acceptance criteria or wireframes — they are human-readable stories of what the user experiences from start to finish.

### Required Journeys

1. **New Franchisee (Tier 2 — Normal):** Invitation → onboarding → dashboard → My Plan → fill inputs → Reports → scenarios → document generation
2. **New Franchisee (Tier 1 — Story):** Same as above but with AI Planning Assistant guiding inputs (placeholder until Epic 9)
3. **Returning Franchisee:** Login → dashboard → session recovery → resume planning
4. **Franchisee reviewing scenarios:** Navigate to What-If Playground → adjust sliders → build conviction
5. **Katalyst Admin setting up a brand:** Create brand → configure parameters → startup cost template → assign account manager → invite franchisees
6. **Katalyst Admin inviting a franchisee:** Create invitation → franchisee receives email → completes onboarding
7. **Franchisor Admin viewing pipeline:** Login → dashboard → view franchisee progress → optionally review plans
8. **Katalyst Admin using View As:** Impersonate franchisee → see their plan → support mode

### Destination

To be determined: either a new section in the UX spec or a standalone `user-journeys.md` artifact.

---

## Section 5: Open Items — ALL APPROVED

All 9 open items were reviewed and approved by the Product Owner on 2026-02-20. Decisions are recorded inline below.

### Open Item 1: CP-5 — Typography (Montserrat/Roboto/Roboto Mono)

**Proposal:** Replace Open Sans with Montserrat (headings), Roboto (body), Roboto Mono (financial figures). Load via Google Fonts CDN.

**Decision:** Type stack confirmed as proposed. No brand-specific overrides needed.

**Status:** ✅ APPROVED

---

### Open Item 2: CP-6 — Story 5.5 HIGH Findings

**Proposal:** Fix 3 unresolved HIGH findings from adversarial code review:
- H1: Audit category names/count don't match AC14's 13 listed categories (engine produces 15)
- H2: Passing audit categories missing muted text styling (AC16)
- H3: Failing check detail missing per-row pass/fail icon (AC17)

**Decision:** Proceed with fixes per acceptance criteria as written. Will be addressed via `<FinancialValue>` component rollout.

**Status:** ✅ APPROVED

---

### Open Item 3: CP-7 — Re-verify Stories 5.6–5.10

**Proposal:** After structural changes (mode switcher deletion, Quick Entry retirement, nav fix), systematically re-verify each story's acceptance criteria.

**Decision:** Proceed with re-verification after structural changes. `<FinancialValue>` component covers formatting concerns across 5.2–5.6, 5.8–5.10.

**Status:** ✅ APPROVED

---

### Open Item 4: CP-8 — Reposition Impact Strip

**Proposal:** Move `ImpactStrip` from inside `forms-mode.tsx` to `planning-workspace.tsx` level. Render as persistent sticky bar at bottom of My Plan view.

**Decision:** Move to planning-workspace level for persistent visibility across all plan views.

**Status:** ✅ APPROVED

---

### Open Item 5: CP-9 — Document Preview on Dashboard

**Proposal:** Add `DocumentPreviewWidget` card to Dashboard page. Shows first page/summary of lender document for user's active plan with DRAFT watermark.

**Decision:** Place on Dashboard with empty state for users with no plans. Note future multi-location evolution.

**Status:** ✅ APPROVED

---

### Open Item 6: CP-10 — Plan Completeness Dashboard Repositioning

**Proposal:** Move existing `PlanCompleteness` component from inside FormsMode to workspace level. Shows section-by-section completion status for session re-entry context.

**Decision:** Move to workspace level as re-entry dashboard. Component already exists — repositioning only.

**Status:** ✅ APPROVED

---

### Open Item 7: CP-11 — Border Radius Polish

**Proposal:** Update card components to `rounded-2xl`, input/button components to `rounded-xl` (currently using default `rounded-md`).

**Decision:** Confirmed. `rounded-2xl` for cards, `rounded-xl` for inputs/buttons.

**Status:** ✅ APPROVED

---

### Open Item 8: CP-12 — Ratio Format Fix

**Proposal:** Add `"ratio"` to `RowDef["format"]` union type. Fix labor efficiency display from `35.0%` to `0.35x`. Change `laborEfficiency` and `adjustedLaborEfficiency` rows from `format: "pct"` to `format: "ratio"`.

**Decision:** Confirmed. `0.35x` is the correct display format for ratios. Will be handled via `<FinancialValue>` component.

**Status:** ✅ APPROVED

---

### Open Item 9: CP-13 — Negative Number Formatting

**Proposal:** All negative financial values display as `($4,200)` instead of `-$4,200` (accounting-style parentheses). Implemented via `<FinancialValue>` component (Decision D4). Upgraded from LOW to HIGH severity.

**Decision:** Confirmed. Accounting-style parentheses for all negative numbers. Implemented via `<FinancialValue>` component.

**Status:** ✅ APPROVED

---

## Section 6: Execution Sequence (FINAL — all items approved)

All items approved. Execution sequence finalized.

1. **Verify HSL conversion** — Compute precise HSL for `#78BF26` (blocks CP-4)
2. **CP-4 + CP-5** (Design tokens) — Color and typography
3. **CP-1** (Delete mode switcher)
4. **CP-2** (Retire Quick Entry)
5. **CP-3** (Navigation — Two-Door Model sidebar)
6. **CP-8 + CP-9 + CP-10** (Repositioning — Impact Strip, Dashboard preview, Plan Completeness)
7. **`<FinancialValue>` component** (Decision D4)
8. **CP-12** (Ratio format fix)
9. **CP-13** (Negative number formatting via `<FinancialValue>`)
10. **CP-6** (Story 5.5 HIGH fixes)
11. **CP-7** (Re-verify Stories 5.6–5.10)
12. **CP-11** (Border radius polish)

---

## Section 7: Document Updates Required (after code remediation)

| Document | Update Needed |
|----------|--------------|
| `architecture.md` | Replace "three modes" with "two surfaces (My Plan + Reports)". Rename component tree entries. Remove retired component references. |
| `epics.md` FR Coverage Map | Update from 87 → 111 FRs. Add FR74-FR97 entries. Fix FR12 text to match corrected PRD. |
| `epics.md` Story 5.7 | Mark as retired/migrated to Epic 10 |
| `epics.md` Epic 10 | Rewrite with What-If Playground scope and new story ACs |
| `epics.md` Story 7.1 | Remove Quick Entry references, replace with Reports/Forms |
| UX spec or new artifact | Add User Journey narratives (Section 4) |
| `sprint-status.yaml` | Regenerate after all changes via Sprint Planning workflow |

---

## Approval Record

**Status:** ✅ FULLY APPROVED
**Open items remaining:** 0 — all 9 items reviewed and approved by Product Owner on 2026-02-20
**Approved by:** Product Owner (2026-02-20)
**Next step:** Execute per Section 6 sequence

---

## References

- `sprint-change-proposal-2026-02-19.md` — Historical predecessor (preserved, not superseded for context)
- `sprint-change-proposal-2026-02-15.md` — Original Epic 5-7 restructuring
- `implementation-readiness-report-2026-02-20.md` — IR check findings
- `ux-design-specification-consolidated.md` — UX design authority (2026-02-18)
- `prd.md` — Product requirements (last edited 2026-02-20, 111 FRs)
