# Story 5H.2: Report Tab UI Audit & Remediation Across All Tabs

Status: in-progress (Phase 1 & 2 complete — audit and documentation; Phase 3 & 4 pending)

## Story

As a franchisee,
I want all financial report tabs to render correctly without layout issues, overlapping elements, or visual clutter,
So that I can confidently review my financial projections and present them to lenders (FR7a-FR7g, FR84-FR86).

## Prerequisite

Story 5H.1 Phase 4 complete — all engine formula fixes merged and regression tests passing.

## Acceptance Criteria Summary

- Phase 1: Systematic visual audit of all 7 report tabs ✅
- Phase 2: Issue documentation and prioritization ✅
- Phase 3: PO-approved remediation (pending)
- Phase 4: Playwright verification (pending)

---

## Phase 1: Systematic Visual Audit — All 7 Tabs

Audit performed: 2026-02-20
Auditor context: Code review of all statement tab components, shared components, parent container, and z-index stacking

### Audit Methodology

Each tab was audited against the following checklist per story AC:
- Layout & Spacing (duplicate callouts, sticky headers, section alignment, whitespace, column alignment)
- Sidebar Interaction (content area behavior, z-index layering, content clipping)
- Comparison/Scenario Mode (column headers, row labels, horizontal overflow)
- Responsive Behavior (progressive disclosure, 1024px readability, scroll indicators)
- Component Consistency (CalloutBar, StatementSection, FinancialValue, interpretation rows, Guardian Bar)
- Test Infrastructure (data-testid attributes)
- Dark Mode (passive observation)

### Architecture Context

The Reports tab rendering stack (top to bottom):

```
┌─ GuardianBar ────────────────────────────────────────────┐  (outside scroll container)
├─ TabsList / TabsTrigger ─────────────────────────────────┤  (outside scroll container)
├─ ScenarioBar ────────────────────────────────────────────┤  (outside scroll container)
├─ CalloutBar (parent, shared) ────────────────────────────┤  (outside scroll container, hidden during comparison)
├─ Scroll Container ───────────────────────────────────────┤
│  ├─ ScenarioSummaryCard (comparison only) ───────────────│
│  ├─ TabsContent ─────────────────────────────────────────│
│  │  ├─ Per-Tab Callout Bar (tab-local, sticky top-0) ───│  ← DUPLICATE
│  │  ├─ ColumnToolbar ────────────────────────────────────│
│  │  └─ Table with sticky section headers ────────────────│
│  └───────────────────────────────────────────────────────│
└──────────────────────────────────────────────────────────┘
```

### Tab-by-Tab Audit Results

#### (1) Summary Tab — PASS (minor observations)

- **Layout & Spacing:** Uses `StatementSection` collapsible cards for P&L summary, Balance Sheet summary, Cash Flow summary, Break-even, and Startup Capital. Sections are properly spaced with `space-y-4`. No duplicate callout bar — Summary tab does not render its own callout.
- **Sidebar Interaction:** Content flows correctly as sidebar opens/closes (flex layout).
- **Comparison Mode:** Renders comparison via side-by-side metric cards within each `StatementSection`. Layout is acceptable — not a dense table, so no column cramping.
- **Component Consistency:** Uses `StatementTable` for the P&L summary data, which is consistent with other tabs. Sections use `StatementSection` wrapper consistently.
- **Test Infrastructure:** `data-testid="summary-tab"` present. Section test IDs present. ✅
- **Dark Mode:** No tab-specific dark mode issues observed.

**Issues found:** None (Critical/High).

---

#### (2) P&L Tab — FAIL (Critical)

- **Duplicate Callout Bar:** Parent `CalloutBar` renders P&L-specific metrics (Annual Revenue Y1, Pre-Tax Margin Y1). Tab-local `PnlCalloutBar` ALSO renders: Annual Revenue Y1, Pre-Tax Income Y1, Pre-Tax Margin %. Revenue and Margin metrics are **duplicated** across both bars.
  - Parent CalloutBar: `sticky top-0 z-30` (OUTSIDE scroll container — always visible)
  - Tab-local PnlCalloutBar: `sticky top-0 z-30` (INSIDE scroll container — sticks to top when scrolled)
  - Result: Two stacked metric bars showing overlapping financial information.
- **Sidebar Interaction:** No issues observed — sidebar z-10 is below callout z-30 in stacking context.
- **Comparison Mode:** Uses `ComparisonTableHead` with abbreviated labels ("Base", "Cons", "Opt") and colored dots. Tight but functional at annual level. Quarterly drill-down disabled during comparison (correct per spec).
- **Test Infrastructure:** Comprehensive `data-testid` coverage including editable cells, section toggles, interpretation rows. ✅

**Issues found:**
| # | Severity | Description |
|---|----------|-------------|
| P1 | Critical | Duplicate callout bar — PnlCalloutBar renders overlapping metrics with parent CalloutBar |

---

#### (3) Balance Sheet Tab — FAIL (Critical)

- **Duplicate Callout Bar:** Parent `CalloutBar` renders Balance Sheet metrics (Total Assets Y1, Debt-to-Equity Y3). Tab-local `BsCalloutBar` ALSO renders: Total Assets Y1, Total Equity Y1, Balance Sheet identity status (Balanced/Imbalanced), plus interpretation text about debt-to-equity. **Total Assets Y1 appears in both bars.** This is the exact issue visible in Screenshot 1 (`attached_assets/image_1771605261047.png`).
  - Both bars use `sticky top-0 z-30` at their respective levels.
  - BsCalloutBar additionally contains the Balance Sheet identity check status (green checkmark or red alert) — this is a UNIQUE element not present in the parent CalloutBar and should be preserved.
- **Sidebar Interaction:** Screenshot 2 (`attached_assets/image_1771605269747.png`) documented the Glossary label overlapping the callout metrics area. The sidebar component uses `z-10` (from shadcn sidebar). The callout bars use `z-30`. In the sidebar's `fixed` positioning, the sidebar and content area are siblings in the DOM — at viewport widths where the sidebar pushes content (not overlays), the z-index is irrelevant because they don't overlap. At overlay widths, the sidebar's z-10 could potentially sit under the callout bars. However, the reported issue was about sidebar CONTENT (Glossary label) bleeding into the report content area, which suggests a layout boundary issue rather than pure z-index.
- **Comparison Mode:** Uses `ComparisonTableHead` and `ComparisonBsSection` components. At annual level, 15 data columns + 1 label column. Column text at `text-[11px]` with `px-2`. Screenshot 3 (`attached_assets/image_1771605283221.png`) documented cramped headers and awkward row label wrapping.
  - Label column has `min-w-[200px]` — consuming significant viewport space.
  - Section header rows use `colSpan={totalCols + 1}` which is correct.
  - Data cells use `whitespace-nowrap` which prevents text wrapping but may cause overflow.
- **Test Infrastructure:** Comprehensive `data-testid` coverage including identity check status. ✅

**Issues found:**
| # | Severity | Description |
|---|----------|-------------|
| B1 | Critical | Duplicate callout bar — BsCalloutBar renders overlapping metrics with parent CalloutBar (Total Assets Y1 duplicated) |
| B2 | High | BsCalloutBar contains unique "Balanced/Imbalanced" identity check status not present in parent CalloutBar — must be preserved during consolidation |
| B3 | High | Comparison mode column headers cramped at 15 data columns (documented in Screenshot 3) |
| B4 | Medium | Sidebar content potentially overlapping report content at certain viewport widths (documented in Screenshot 2) |

---

#### (4) Cash Flow Tab — FAIL (Critical)

- **Duplicate Callout Bar:** Parent `CalloutBar` renders Cash Flow metrics (Net Cash Flow Y1, Lowest Cash Point with month). Tab-local `CfCalloutBar` ALSO renders: Net Cash Flow Y1, Ending Cash Y5, Lowest Cash Point. **Net Cash Flow Y1 and Lowest Cash Point metrics are duplicated.**
  - Same sticky/z-index architecture as other tabs.
  - CfCalloutBar includes a negative-cash warning color treatment and interpretation text — these are mildly unique but the parent CalloutBar already has interpretation text for Cash Flow.
- **Negative Cash Highlighting:** Data rows correctly apply warm background tinting for negative cash values (`text-destructive` and `bg-destructive/5`). Downward arrow icons are present. This is per spec.
- **Comparison Mode:** Uses same `ComparisonTableHead` pattern. Same column cramping concerns as Balance Sheet.
- **Test Infrastructure:** Comprehensive `data-testid` coverage. ✅

**Issues found:**
| # | Severity | Description |
|---|----------|-------------|
| C1 | Critical | Duplicate callout bar — CfCalloutBar renders overlapping metrics with parent CalloutBar |

---

#### (5) ROIC Tab — FAIL (Critical)

- **Duplicate Callout Bar:** Parent `CalloutBar` renders ROIC metrics (5yr ROIC %, Break-even month). Tab-local `RoicCalloutBar` renders a narrative sentence: "Your 5-year cumulative ROIC of X% means for every dollar you invested, you earned $Y back." **The ROIC percentage is present in both bars.**
  - RoicCalloutBar uses a different visual format — sentence-style interpretation rather than metric cards. The parent CalloutBar already includes both the metric AND an interpretation sentence.
  - RoicCalloutBar is purely redundant — its sentence content overlaps with the parent CalloutBar's interpretation text.
- **Annual-Only View:** ROIC tab renders a simple 5-column annual table without ColumnManager drill-down. This is correct per UX spec ("Annual view only"). No drill-down messaging is shown, but this is by design.
- **Comparison Mode:** Renders side-by-side scenario columns for each year. Uses a custom table structure (not ComparisonTableHead) with year group headers. At 15 columns, the layout is tight but the ROIC table has fewer rows than P&L or Balance Sheet, so vertical cramping is not an issue.
- **Test Infrastructure:** Comprehensive `data-testid` coverage. ✅

**Issues found:**
| # | Severity | Description |
|---|----------|-------------|
| R1 | Critical | Duplicate callout bar — RoicCalloutBar renders overlapping content with parent CalloutBar |

---

#### (6) Valuation Tab — FAIL (Critical)

- **Duplicate Callout Bar:** Parent `CalloutBar` renders Valuation metrics (Estimated Value Y5, EBITDA Multiple). Tab-local `ValCalloutBar` renders: Estimated Enterprise Value Y5, Net After-Tax Proceeds Y5, EBITDA Multiple, plus interpretation text. **Estimated Value and EBITDA Multiple are duplicated.**
  - ValCalloutBar includes "Net After-Tax Proceeds" which is a unique metric not in the parent CalloutBar — should be considered for consolidation.
- **Annual-Only View:** Same as ROIC — correct per spec.
- **Comparison Mode:** Similar to ROIC, custom comparison table. Tight at 15 columns but manageable.
- **Valuation-Specific Note:** The Valuation tab has an `InlineEditableCell` for the EBITDA Multiple row (an input cell within the table). This inline editing works correctly and is per spec ("EBITDA Multiple is editable input").
- **Test Infrastructure:** Comprehensive `data-testid` coverage. ✅

**Issues found:**
| # | Severity | Description |
|---|----------|-------------|
| V1 | Critical | Duplicate callout bar — ValCalloutBar renders overlapping metrics with parent CalloutBar |
| V2 | Low | ValCalloutBar has unique "Net After-Tax Proceeds" metric — consider adding to parent CalloutBar during consolidation |

---

#### (7) Audit Tab — PASS

- **No Duplicate Callout Bar:** Audit tab does not render its own callout bar. The parent CalloutBar renders audit-specific content (Checks Passing count). ✅ This is the correct pattern all tabs should follow.
- **Layout:** Uses Card components for each check category with collapsible detail. Clean, well-spaced layout.
- **Comparison Mode:** Shows informational note "Showing base case checks only" when comparison is active. Correct behavior — audit integrity checks are base-case-only.
- **Navigation Links:** Each check category has a navigation link to the relevant tab (e.g., "View Balance Sheet"). Links use `data-testid` attributes.
- **Test Infrastructure:** Comprehensive `data-testid` coverage. ✅

**Issues found:** None.

---

## Phase 2: Issue Documentation & Prioritization

### Consolidated Issue Register

| ID | Severity | Tabs Affected | Description | Regression? | Screenshot Ref |
|----|----------|---------------|-------------|-------------|----------------|
| UI-01 | **Critical** | P&L, Balance Sheet, Cash Flow, ROIC, Valuation (5 tabs) | Duplicate callout bars — each tab renders its own callout bar with metrics that overlap the parent CalloutBar's tab-specific content. Two stacked metric bars showing redundant financial information. | Pre-existing (introduced during Epic 5 implementation) | Screenshot 1 (Balance Sheet) |
| UI-02 | **High** | Balance Sheet | BsCalloutBar contains unique "Balanced/Imbalanced" identity check status (green checkmark or red alert) not present in parent CalloutBar. Must be preserved when removing duplicate bars. | N/A (unique content, not a regression) | Screenshot 1 |
| UI-03 | **High** | Balance Sheet, Cash Flow (comparison mode) | Comparison mode column headers cramped at 15 data columns. Headers use `text-[11px]` with `px-2` padding. Label column consumes `min-w-[200px]` of viewport. Readable but tight at 1024px. | Pre-existing | Screenshot 3 |
| UI-04 | **Medium** | All tabs | Sidebar content potentially overlapping report content at overlay viewport widths. Sidebar uses `z-10`, callout bars use `z-30`. Layout boundary issue at certain widths. | Pre-existing | Screenshot 2 |
| UI-05 | **Medium** | P&L, Balance Sheet, Cash Flow, ROIC, Valuation | Inconsistent callout bar styling — parent CalloutBar uses `bg-background/95 backdrop-blur-sm`; per-tab callout bars use `bg-muted/30`. Visual inconsistency in stacked bars. | Pre-existing | — |
| UI-06 | **Low** | Valuation | ValCalloutBar has unique "Net After-Tax Proceeds" metric not in parent CalloutBar — consider adding during consolidation. | N/A | — |
| UI-07 | **Low** | Balance Sheet | Dark mode: BsCalloutBar uses hardcoded `text-green-700` / `text-destructive` for identity check — has dark variants (`dark:text-green-400`) but other per-tab callout bars lack dark mode attention. | Pre-existing | — |

### Priority for Remediation

**Must Fix (Phase 3):**
- UI-01: Remove all per-tab callout bars, consolidate into parent CalloutBar
- UI-02: Preserve Balance Sheet identity check status in consolidated CalloutBar
- UI-03: Clean up comparison mode column layout

**Should Fix (Phase 3 if time permits):**
- UI-04: Verify sidebar/content z-index at all viewport widths ≥ 1024px
- UI-05: Resolved automatically by UI-01 (removing per-tab bars eliminates inconsistency)

**Document for Future (not blocking):**
- UI-06: Consider adding Net After-Tax Proceeds to Valuation callout
- UI-07: Dark mode styling — Phase 2 post-MVP

---

## Phase 3: Remediation Plan (PO-Approved 2026-02-20)

### Approach

**1. Consolidate Callout Bars (addresses UI-01, UI-02, UI-05)**

Remove all 5 per-tab callout bar components:
- `PnlCalloutBar` in `pnl-tab.tsx`
- `BsCalloutBar` in `balance-sheet-tab.tsx`
- `CfCalloutBar` in `cash-flow-tab.tsx`
- `RoicCalloutBar` in `roic-tab.tsx`
- `ValCalloutBar` in `valuation-tab.tsx`

Enhance the parent `CalloutBar` in `callout-bar.tsx`:
- Add Balance Sheet identity check status (Balanced/Imbalanced) to the `balance-sheet` case in `getTabContent()` — this is the only unique element from the per-tab bars that isn't already in the parent.
- The parent CalloutBar's `getTabContent()` switch statement already covers all 7 tabs with appropriate tab-specific metrics and interpretation text.

**2. Clean Up Comparison Mode (addresses UI-03)**

In `comparison-table-head.tsx`:
- Verify column widths are not overly constrained at 1024px minimum viewport width
- Ensure `overflow-x-auto` on table wrapper provides visible scroll indicator
- Consider reducing label column `min-w` from `200px` to `180px` in comparison mode to give more space to data columns

**3. Verify Sidebar Z-Index (addresses UI-04)**

After removing duplicate callout bars:
- Verify sidebar/content layout at 1024px, 1280px, and 1440px viewport widths
- Confirm no content clipping or z-index overlap
- The sidebar (z-10) and content area are flex siblings — removing the extra sticky bars inside the scroll container reduces z-index conflict surface area

### Files to Modify

| File | Change |
|------|--------|
| `client/src/components/planning/statements/pnl-tab.tsx` | Remove `PnlCalloutBar` component and its usage (2 call sites: normal + comparison mode) |
| `client/src/components/planning/statements/balance-sheet-tab.tsx` | Remove `BsCalloutBar` component and its usage (2 call sites); remove local `CalloutMetric` helper |
| `client/src/components/planning/statements/cash-flow-tab.tsx` | Remove `CfCalloutBar` component and its usage (2 call sites) |
| `client/src/components/planning/statements/roic-tab.tsx` | Remove `RoicCalloutBar` component and its usage (2 call sites) |
| `client/src/components/planning/statements/valuation-tab.tsx` | Remove `ValCalloutBar` component and its usage (2 call sites); remove local `CalloutMetric` helper |
| `client/src/components/planning/statements/callout-bar.tsx` | Add Balance Sheet identity check status to `balance-sheet` case; accept `identityChecks` prop |
| `client/src/components/planning/financial-statements.tsx` | Pass `identityChecks` from output to CalloutBar; show CalloutBar during comparison mode (currently hidden) |
| `client/src/components/planning/statements/comparison-table-head.tsx` | Reduce label column min-width in comparison mode |

### What This Does NOT Change

- No changes to the financial engine or calculations
- No changes to the `StatementTable`, `StatementSection`, or `ColumnManager` shared components
- No changes to the `GuardianBar`, `ScenarioBar`, or `ImpactStrip` components
- No changes to data-testid naming conventions (existing test IDs on parent CalloutBar remain stable)
- No changes to the Audit tab (already correct pattern)
- No changes to the Summary tab (already correct pattern)

---

## Phase 4: Verification Plan (pending Phase 3 implementation)

After Phase 3 remediation:

1. **Playwright screenshot verification** of all 7 tabs in default (annual) view
2. **Playwright screenshot verification** of Balance Sheet and P&L in comparison mode
3. **Verify** single callout bar per tab — no duplicate metric bars
4. **Verify** Balance Sheet identity check status appears in consolidated CalloutBar
5. **Verify** sidebar open/close doesn't clip or overlap report content at 1024px and 1280px
6. **Verify** comparison mode columns are readable at 1024px minimum width
7. **Verify** Guardian Bar, tab headers, and callout bar position correctly relative to tab content
8. **Verify** no new regressions introduced by the fixes

---

## Cross-References

- **Epic 5 Retrospective:** `_bmad-output/implementation-artifacts/epic-5-retrospective.md` — action item AI-2
- **UX Design Specification:** `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` — Part 10 (Reports Experience)
- **Story 5H.1:** `_bmad-output/implementation-artifacts/5h-1-financial-engine-reference-validation.md` — prerequisite
- **Screenshot References:** `attached_assets/image_1771605261047.png` (BS duplicate callout), `attached_assets/image_1771605269747.png` (sidebar overlap), `attached_assets/image_1771605283221.png` (comparison cramping)
- **Sprint Change Proposal:** `_bmad-output/course-corrections/sprint-change-proposal-2026-02-19.md`
