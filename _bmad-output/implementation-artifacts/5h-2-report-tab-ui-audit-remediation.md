# Story 5H.2: Report Tab UI Audit & Remediation Across All Tabs

Status: ready-for-dev

## Story

As a franchisee,
I want all financial report tabs to render correctly without layout issues, overlapping elements, or visual clutter,
So that I can confidently review my financial projections and present them to lenders (FR7a-FR7g, FR84-FR86).

## Acceptance Criteria

### AC-1: No Duplicate Callout Bars

**Given** any of the 7 report tabs is active,
**When** the tab content renders,
**Then** there is exactly ONE callout bar visible at the top of the tab — the parent `CalloutBar` component rendered outside the scroll container — and NO per-tab callout bar renders inside the scroll container.

### AC-2: Balance Sheet Identity Check Preserved

**Given** the Balance Sheet tab is active,
**When** the parent `CalloutBar` renders Balance Sheet content,
**Then** the callout bar includes the Balance Sheet identity check status indicator (green checkmark with "Balanced" or red alert with "Imbalanced"), which was previously only in the per-tab `BsCalloutBar`.

### AC-3: Valuation Net After-Tax Proceeds Preserved

**Given** the Valuation tab is active,
**When** the parent `CalloutBar` renders Valuation content,
**Then** the callout bar includes the "Net After-Tax Proceeds" metric, which was previously only in the per-tab `ValCalloutBar`.

### AC-4: CalloutBar Visible in Comparison Mode

**Given** the user activates comparison/scenario mode,
**When** the report tabs render,
**Then** the parent `CalloutBar` remains visible (it was previously hidden during comparison mode in `financial-statements.tsx`), showing base-case metrics as a reference point.

### AC-5: Comparison Mode Column Layout Readable

**Given** the Balance Sheet or Cash Flow tab is active in comparison mode,
**When** 15 data columns are visible (5 years × 3 scenarios),
**Then** the label column does not consume excessive viewport space (reduced from `min-w-[200px]` to `min-w-[180px]`), and column headers are readable without overlapping at 1024px minimum viewport width.

### AC-6: Sidebar Does Not Overlap Report Content

**Given** the sidebar is open at any viewport width ≥ 1024px,
**When** viewing any report tab,
**Then** sidebar content does not overlap or clip report tab content, and the content area adjusts cleanly to the available space.

### AC-7: All 7 Tabs Pass Visual Consistency Check

**Given** each tab is reviewed after remediation,
**When** the rendering is verified,
**Then**:
- Summary tab: no duplicate callout bar (was already correct — remains correct)
- P&L tab: single callout bar with parent metrics only
- Balance Sheet tab: single callout bar with identity check status
- Cash Flow tab: single callout bar with parent metrics only
- ROIC tab: single callout bar with parent metrics only
- Valuation tab: single callout bar with Net After-Tax Proceeds added
- Audit tab: no duplicate callout bar (was already correct — remains correct)

### AC-8: No Regressions Introduced

**Given** all remediation changes are complete,
**When** the application is tested,
**Then** no new visual or functional regressions are introduced — Guardian Bar position, tab switching, inline editing, column drill-down, interpretation rows, and data-testid attributes all continue working correctly.

### AC-9: Playwright Verification

**Given** all fixes are implemented,
**When** Playwright-based end-to-end testing runs,
**Then** all 7 tabs render without duplicate callout bars, the Balance Sheet identity check is visible, and comparison mode columns are readable.

## Dev Notes

### Architecture Patterns to Follow

**Rendering Stack (after remediation):**
```
┌─ GuardianBar ────────────────────────────────────────────┐  (outside scroll container)
├─ TabsList / TabsTrigger ─────────────────────────────────┤  (outside scroll container)
├─ ScenarioBar ────────────────────────────────────────────┤  (outside scroll container)
├─ CalloutBar (parent, shared) ────────────────────────────┤  (outside scroll container, VISIBLE always)
├─ Scroll Container ───────────────────────────────────────┤
│  ├─ ScenarioSummaryCard (comparison only) ───────────────│
│  ├─ TabsContent ─────────────────────────────────────────│
│  │  ├─ ColumnToolbar ────────────────────────────────────│
│  │  └─ Table with sticky section headers ────────────────│
│  └───────────────────────────────────────────────────────│
└──────────────────────────────────────────────────────────┘
```

The per-tab callout bars (`PnlCalloutBar`, `BsCalloutBar`, `CfCalloutBar`, `RoicCalloutBar`, `ValCalloutBar`) are REMOVED. The parent `CalloutBar` at `callout-bar.tsx` already has a `getTabContent()` switch statement covering all 7 tabs with tab-specific metrics and interpretation text — the per-tab bars were always redundant duplicates.

**UX Spec Authority (Part 12):** "Type 1: Key Metrics Callout Bar — Sticky at top of each tab" specifies ONE callout bar per tab with tab-specific content:

| Statement | Callout Content |
|-----------|----------------|
| Summary | "Your 5-year total pre-tax income: $X. Break-even: Month Y (that's [Month, Year])." |
| P&L | "Year 1 pre-tax margin: X%. [Above/within/below typical range for [Brand]]" |
| Balance Sheet | "Debt-to-equity ratio: X:1 by Year 3. [Lenders typically look for below 3:1]" |
| Cash Flow | "Lowest cash point: $X in Month Y. [You'll need at least $X in reserves]" |
| ROIC | "5-year return on invested capital: X%. Break-even on investment: Month Y." |
| Valuation | "Estimated business value at Year 5: $X based on Xa EBITDA multiple." |
| Audit | "X of 13 checks passing. [List failures with plain-language explanation]" |

Source: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` lines 919-929

**Z-Index Stack (unchanged):**
- Guardian Bar: outside scroll container (sticky)
- CalloutBar: `sticky top-0 z-30 bg-background/95 backdrop-blur-sm` (outside scroll container)
- Sidebar: `z-10` (shadcn sidebar)
- Impact Strip: `z-10` (sticky bottom)
- Section headers: `z-20` (inside scroll container — sticky within table)

**Component Conventions:**
- All financial values formatted via `<FinancialValue>` component
- Interpretation rows use `InterpretationRow` component
- Currency in cents internally, displayed as dollars
- `data-testid` attributes on all interactive and meaningful display elements

### UI/UX Deliverables

**Reports view — all 7 tabs affected:**
- Single `CalloutBar` at top of each tab showing tab-specific key metrics
- Balance Sheet tab: identity check status (Balanced/Imbalanced with icon) visible in callout bar
- Valuation tab: Net After-Tax Proceeds metric visible in callout bar
- Comparison mode: callout bar remains visible showing base-case metrics
- Comparison mode: column headers readable at 1024px with reduced label column width

**Visual states:**
- Normal view: single callout bar with metrics + interpretation text
- Comparison mode: same callout bar (base case) + comparison columns below
- Sidebar open: content area adjusts cleanly, no overlap
- Balance Sheet identity check: green checkmark ("Balanced") or red alert with destructive styling ("Imbalanced")

### Anti-Patterns & Hard Constraints

- **DO NOT** create new per-tab callout bar components to replace the removed ones — the parent `CalloutBar` handles all tab-specific content via its `getTabContent()` switch
- **DO NOT** modify `StatementTable`, `StatementSection`, `ColumnManager`, or `FinancialValue` shared components — those are correct and working
- **DO NOT** modify `GuardianBar`, `ScenarioBar`, or `ImpactStrip` components — outside scope
- **DO NOT** modify `audit-tab.tsx` or `summary-tab.tsx` — these tabs have NO per-tab callout bars and are already correct
- **DO NOT** change `data-testid` attribute naming conventions on the parent `CalloutBar` — existing test IDs must remain stable
- **DO NOT** modify the financial engine (`shared/financial-engine.ts`) — this is a UI-only story
- **DO NOT** remove the `identityChecks` data that powers the Balance Sheet identity status — only remove the UI component that duplicates it; the data flows to the parent `CalloutBar`
- **Previous agent failure warning:** Commit `9033cc35` claimed to "Remove redundant callout bars" but `git diff` showed 0 source file changes. All 5 per-tab callout bars still exist. This story must actually remove the code.

### Gotchas & Integration Warnings

- **BsCalloutBar contains unique content:** The `BsCalloutBar` has a Balance Sheet identity check indicator (green checkmark for "Balanced", red alert for "Imbalanced") that is NOT in the parent `CalloutBar`. This must be added to the `balance-sheet` case in `getTabContent()` in `callout-bar.tsx` BEFORE removing `BsCalloutBar`. Removing without preserving this loses functionality.
- **ValCalloutBar contains unique content:** The `ValCalloutBar` has a "Net After-Tax Proceeds" metric not in the parent `CalloutBar`. Consider adding to the `valuation` case in `getTabContent()`.
- **CfCalloutBar negative-cash warning:** The `CfCalloutBar` has a negative-cash warning color treatment. Check whether the parent `CalloutBar` already handles this in its Cash Flow case — it likely does via interpretation text.
- **CalloutBar hidden in comparison mode:** In `financial-statements.tsx`, the parent `CalloutBar` is conditionally hidden when `isComparison` is true. The per-tab callout bars were the only metric bars visible during comparison. After removing per-tab bars, the parent must be made visible in comparison mode to avoid losing all callout metrics.
- **Two call sites per tab:** Each per-tab callout bar is rendered in TWO places — once in normal mode, once in comparison mode. Both must be removed.
- **Comparison mode `identityChecks` prop:** The parent `CalloutBar` may need the `identityChecks` prop passed from `financial-statements.tsx`. Verify the data flow: `output.identityChecks` → `CalloutBar` component.
- **Label column min-width:** Reducing from `200px` to `180px` in comparison mode only — verify this doesn't break normal (non-comparison) view where the wider label column is appropriate.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/components/planning/statements/pnl-tab.tsx` | MODIFY | Remove `PnlCalloutBar` component definition and both usage sites (normal + comparison) |
| `client/src/components/planning/statements/balance-sheet-tab.tsx` | MODIFY | Remove `BsCalloutBar` component definition, `CalloutMetric` helper, and both usage sites |
| `client/src/components/planning/statements/cash-flow-tab.tsx` | MODIFY | Remove `CfCalloutBar` component definition and both usage sites |
| `client/src/components/planning/statements/roic-tab.tsx` | MODIFY | Remove `RoicCalloutBar` component definition and both usage sites |
| `client/src/components/planning/statements/valuation-tab.tsx` | MODIFY | Remove `ValCalloutBar` component definition, `CalloutMetric` helper, and both usage sites |
| `client/src/components/planning/statements/callout-bar.tsx` | MODIFY | Add BS identity check status to `balance-sheet` case in `getTabContent()`; add Net After-Tax Proceeds to `valuation` case; accept `identityChecks` prop if not already present |
| `client/src/components/planning/financial-statements.tsx` | MODIFY | Remove `isComparison` condition hiding `CalloutBar`; pass `identityChecks` prop to `CalloutBar` |
| `client/src/components/planning/statements/comparison-table-head.tsx` | MODIFY | Reduce label column `min-w` from `200px` to `180px` in comparison mode |

### Testing Expectations

- **Playwright e2e testing (primary):** All 7 tabs should be verified via Playwright to confirm:
  - No duplicate callout bars visible
  - Balance Sheet identity check status visible in callout bar
  - Comparison mode renders with readable columns
  - Tab switching works correctly
  - No visual regressions
- **Manual/visual verification:** Sidebar open/close at different viewport widths
- **No unit test changes expected:** This is a UI-only remediation — no engine or API changes
- **LSP diagnostics:** Check all modified files for TypeScript errors after removal of components

### Dependencies & Environment Variables

- **No new packages needed** — all changes use existing components and styling
- **Depends on:** Story 5H.1 complete (confirmed done — engine validated, all tests passing)
- **Blocks:** Epic 6 (Document Generation) — UI must be correct before PDF rendering begins

### References

- [Source: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` Part 12] — Type 1: Key Metrics Callout Bar specification (ONE per tab)
- [Source: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` Part 10] — Financial Statement Views rendering stack
- [Source: `_bmad-output/planning-artifacts/epics.md` Epic 5H, Story 5H.2] — Full acceptance criteria and context
- [Source: `_bmad-output/planning-artifacts/architecture.md`] — File structure, component hierarchy
- [Source: `_bmad-output/implementation-artifacts/epic-5-retrospective.md` AI-2] — Origin action item
- [Source: `_bmad-output/implementation-artifacts/5h-1-financial-engine-reference-validation.md`] — Prerequisite story (done), agent session control rules
- [Source: `attached_assets/image_1771605261047.png`] — Screenshot 1: BS duplicate callout bars
- [Source: `attached_assets/image_1771605269747.png`] — Screenshot 2: sidebar overlap
- [Source: `attached_assets/image_1771605283221.png`] — Screenshot 3: comparison mode cramping

### Agent Session Control Rules (Mandatory — carried from 5H.1)

1. **No self-approval:** Do NOT approve your own work product — story completion requires Product Owner confirmation.
2. **No unauthorized rewrites:** Do NOT rewrite or substantially modify a completed story's code without explicit Product Owner approval. Fixing bugs within this story's scope is allowed.
3. **Cross-story bug fixes:** If a bug in existing code blocks remediation, fix the minimum needed to unblock, document the fix, and flag to Product Owner. Don't refactor — patch.
4. **File ownership awareness:** Before modifying any tab component, understand what was implemented in its original story (5.3, 5.4, 5.5) and what SCP remediation (CP-1 through CP-16) may have changed.
5. **Code review required:** This story requires a formal adversarial code review (fresh agent context) after all changes are complete. Story stays in "review" status until review is done.

## Dev Agent Record

### Agent Model Used

### Completion Notes

### File List

### Testing Summary
