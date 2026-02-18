# Story 5.4: Balance Sheet & Cash Flow Tabs

Status: in-progress

## Story

As a franchisee,
I want to see my complete Balance Sheet and Cash Flow Statement matching the reference spreadsheet,
So that I can understand my asset/liability position and where cash comes from and goes (FR7b, FR7c).

## Acceptance Criteria

**Balance Sheet Tab — Structure and Layout:**

1. Given I navigate to the Balance Sheet tab within Financial Statements, when the tab renders, then a sticky Key Metrics Callout Bar shows: Total Assets (Y1), Total Equity (Y1), and Balance Sheet identity status (pass/fail with checkmark or alert icon).

2. Given the Balance Sheet tab renders, then it displays as a tabular financial document with progressive disclosure — annual view by default, with drill-down to quarterly and monthly columns via the `useColumnManager` hook built in Story 5.2.

3. Given the Balance Sheet tab renders, then row sections match the reference spreadsheet structure:
   - **Current Assets:** Cash, Accounts Receivable, Inventory, Total Current Assets
   - **Fixed Assets:** Equipment (Gross Fixed Assets), Accumulated Depreciation, Net Book Value (Net Fixed Assets)
   - **Total Assets:** Total Assets (with interpretation row)
   - **Current Liabilities:** Accounts Payable, Tax Payable, Line of Credit, Total Current Liabilities
   - **Long-Term Liabilities:** Notes Payable, Total Long-Term Liabilities
   - **Total Liabilities:** Total Liabilities
   - **Capital (Equity):** Common Stock / Paid-in Capital, Retained Earnings, Total Capital
   - **Total Liabilities and Equity:** Total Liabilities and Equity
   - **Core Capital Metrics:** Avg Core Capital / Month, Months of Core Capital, Excess Core Capital (collapsed by default)
   - **Ratios:** AR DSO, AP % of COGS (collapsed by default)

**Balance Sheet — Identity Check:**

4. Given the Balance Sheet tab renders, then a balance sheet identity check row at the bottom shows "Assets = Liabilities + Equity" with a pass/fail icon per column (checkmark for pass within $1 tolerance, alert icon for fail).

5. Given the identity check fails for any column, then the cell highlights with destructive background and shows a tooltip with the specific Total Assets vs Total L+E values and the difference.

**Balance Sheet — Point-in-Time Semantics:**

6. Given the Balance Sheet tab renders at sub-annual drill-down (quarterly or monthly), then balance sheet fields show the ending balance at that point in time (end-of-quarter or end-of-month), NOT summed values. This applies to: Cash, Accounts Receivable, Inventory, Total Current Assets, Net Fixed Assets, Accounts Payable, Tax Payable, Line of Credit, Total Current Liabilities, Notes Payable, Total Long-Term Liabilities, Total Liabilities, Common Stock, Retained Earnings, Total Equity, Total Liabilities and Equity, Total Assets, Gross Fixed Assets, Accumulated Depreciation.

**Cash Flow Tab — Structure and Layout:**

7. Given I navigate to the Cash Flow tab within Financial Statements, when the tab renders, then a sticky Key Metrics Callout Bar shows: Net Cash Flow (Y1), Ending Cash (Y5), and lowest cash point (month number and amount).

8. Given the Cash Flow tab renders, then it displays with progressive disclosure and row sections matching the reference spreadsheet:
   - **Operating Activities:** Net Income (Pre-Tax Income), Add Back: Depreciation, Changes in Accounts Receivable, Changes in Inventory, Changes in Accounts Payable, Changes in Tax Payable, Net Operating Cash Flow
   - **Investing Activities:** Purchase of Fixed Assets (CapEx), Net Cash Before Financing
   - **Financing Activities:** Notes Payable (Proceeds/Repayments), Line of Credit Draws/Repayments, Interest Expense, Distributions, Equity Issuance, Net Financing Cash Flow
   - **Net Cash Flow:** Net Cash Flow, Beginning Cash, Ending Cash

**Cash Flow — Identity Check:**

9. Given the Cash Flow tab renders, then a cash flow identity check row at the bottom shows "Ending Cash = Beginning Cash + Net Cash Flow" with a pass/fail icon per column (checkmark for pass within $1 tolerance, alert icon for fail with tooltip showing specific values).

**Cash Flow — Negative Cash Highlighting:**

10. Given the Cash Flow tab renders, then any cell where Ending Cash is negative displays with a subtle warm background tint (`amber-50`/`amber-950` for dark) AND a small downward-arrow icon — advisory, not destructive red.

11. Given negative cash highlighting, then the warm color is accompanied by a non-color indicator (downward arrow icon from lucide-react) for accessibility per UX Spec Part 15.

**Cash Flow — Flow vs Point-in-Time Semantics:**

12. Given the Cash Flow tab renders at sub-annual drill-down, then flow items (changes in working capital, CapEx, financing activities, net cash flow) show the flow for that specific period (monthly value or quarterly sum of 3 months). Beginning Cash and Ending Cash show point-in-time balances.

**Shared Patterns (Both Tabs):**

13. Given either tab renders, then each row section has a clickable section header that collapses or expands its child rows with a chevron icon (ChevronDown when expanded, ChevronRight when collapsed). Section headers respond to keyboard (Enter/Space) and have `tabIndex={0}` and `aria-expanded`.

14. Given either tab renders, then input-driven rows are visually distinguished from computed rows using three non-color indicators: subtle tinted background (`primary/5`), thin dashed left border (`primary/20`), and small pencil icon visible on hover. Computed rows use standard background with no border decoration.

15. Given either tab renders, then subtotal rows use `font-medium` with a top border. Total rows use `font-semibold` with a double top border (`border-t-[3px] border-double`).

16. Given either tab renders, then hovering over computed cells shows a tooltip with: plain-language explanation (bold), calculation formula (muted), and "View in glossary" link (placeholder until Story 5.10).

17. Given either tab renders, then the table uses ARIA grid roles: `role="grid"` on the table, `role="row"` on rows, `role="rowheader"` on label cells, `role="gridcell"` on data cells with appropriate `aria-readonly` values.

18. Given either tab renders, then negative values display in amber advisory color (`text-amber-700 dark:text-amber-400`) — never destructive red.

**Loading/Empty States:**

19. Given the Financial Statements container is loading engine output (via `usePlanOutputs`), then both tabs inherit the loading skeleton state from the parent container — no tab-level loading state is needed. If engine output is available but has zero monthly projections, tabs render with empty column structure and no data rows.

**Container Wiring:**

20. Given the Financial Statements container renders, then the Balance Sheet tab (`<TabsContent value="balance-sheet">`) renders `<BalanceSheetTab output={output} />` instead of a placeholder, and the Cash Flow tab (`<TabsContent value="cash-flow">`) renders `<CashFlowTab output={output} />` instead of a placeholder.

## Dev Notes

### Architecture Patterns to Follow

- **Component naming:** PascalCase components, kebab-case files — `BalanceSheetTab` in `balance-sheet-tab.tsx`, `CashFlowTab` in `cash-flow-tab.tsx` (Source: architecture.md § Code Naming)
- **State management:** No new API calls. All data comes from `EngineOutput` passed as a prop from `FinancialStatements` container via `usePlanOutputs` hook. Local state only for UI (expanded/collapsed sections). (Source: architecture.md § Communication Patterns)
- **Currency formatting:** Use `formatCents` from `@/lib/format-currency` for all currency display. Engine stores currency as cents (integers). (Source: architecture.md § Number Format Rules)
- **Percentage formatting:** Percentages are stored as decimals (e.g., 0.065 = 6.5%). Display as `(value * 100).toFixed(1) + "%"`. (Source: architecture.md § Number Format Rules)
- **data-testid convention:** Rows: `bs-row-{key}` / `cf-row-{key}`, values: `bs-value-{row-key}-{col-key}` / `cf-value-{row-key}-{col-key}`, sections: `bs-section-{key}` / `cf-section-{key}`, interpretation: `bs-interp-{key}` / `cf-interp-{key}`, callout bar: `bs-callout-bar` / `cf-callout-bar`. (Source: architecture.md § data-testid Naming Convention)
- **Expenses are negative values.** The engine sign convention: revenue positive, expenses negative. Display absolute values for expense-type rows where appropriate. (Source: 5-1-financial-engine-extension.md)
- **Shadcn components:** Use existing `<Tooltip>`, `<TooltipContent>`, `<TooltipTrigger>` from `@/components/ui/tooltip`. Use `lucide-react` icons (Pencil, ChevronDown, ChevronRight, Check, AlertTriangle, ArrowDown). (Source: architecture.md § Structure Patterns)
- **Reuse Story 5.2 infrastructure:** `useColumnManager` hook for drill-down state, `ColumnToolbar` for expand/collapse buttons, `GroupedTableHead` for column headers, `getAnnualValue`/`getQuarterlyValue`/`getMonthlyValue` helpers for cell value resolution. (Source: 5-2-financial-statements-container-summary-tab.md)

### UI/UX Deliverables

**Screens/Pages:**

- **Balance Sheet Tab** (`balance-sheet-tab.tsx`) — The complete Balance Sheet view rendered within `<TabsContent value="balance-sheet">` of the Financial Statements container. Receives `EngineOutput` as a prop.
- **Cash Flow Tab** (`cash-flow-tab.tsx`) — The complete Cash Flow Statement view rendered within `<TabsContent value="cash-flow">`. Receives `EngineOutput` as a prop.

**Key UI Elements (Balance Sheet):**

- Sticky callout bar with 3 key metrics (Total Assets Y1, Total Equity Y1, Identity Status pass/fail)
- 10 collapsible row sections with chevron expand/collapse toggles
- Ratios and Core Capital Metrics sections collapsed by default
- Identity check row at bottom with per-column pass/fail indicators
- Tooltip on failed identity cells showing specific values and difference

**Key UI Elements (Cash Flow):**

- Sticky callout bar with 3 key metrics (Net Cash Flow Y1, Ending Cash Y5, Lowest Cash Point)
- 4 collapsible row sections with chevron toggles
- Negative ending cash cells with warm amber background + downward arrow icon
- All flow items properly summed for quarterly, direct monthly values for monthly drill-down

**UI States:**

- **Section collapsed:** Only section header visible with ChevronRight icon
- **Section expanded:** All child rows visible with ChevronDown icon
- **Input cell hover:** Pencil icon becomes visible (CSS `invisible` → `visible` on group hover)
- **Computed cell hover:** Tooltip appears with explanation, formula, and glossary link
- **Negative cash cell:** Warm amber background tint + downward arrow icon (not destructive red)
- **Identity check pass:** Green checkmark icon + "Pass" text
- **Identity check fail:** Destructive background + alert triangle icon + tooltip with values
- **Drill-down active:** Additional quarterly/monthly columns; balance sheet values are point-in-time, cash flow values are period flows (except beginning/ending cash which are point-in-time)

### Anti-Patterns & Hard Constraints

- **DO NOT install new packages.** All dependencies are already present (Shadcn tooltips, lucide-react icons, column-manager).
- **DO NOT modify `components/ui/` files.** These are Shadcn-managed primitives.
- **DO NOT modify `vite.config.ts`, `server/vite.ts`, `drizzle.config.ts`, or `package.json` scripts.** (Source: development guidelines § Forbidden Changes)
- **DO NOT create new API endpoints.** This story is pure frontend — all data comes from the `EngineOutput` prop passed by `FinancialStatements`.
- **DO NOT make input cells actually editable in this story.** Input cell highlighting is visual-only. Actual inline editing is enabled in Story 5.6 (Quick Entry Integration). The pencil icon and tinted background indicate "this is an input" but clicking does not open an editor.
- **DO NOT implement benchmark-based interpretation text.** Story 5.8 (Guardian Bar & Dynamic Interpretation) wires brand benchmark comparisons. For now, interpretations show percentage values only without "within/above/below typical range" language.
- **DO NOT use `display:table` CSS property.** HTML `<table>` elements are fine. (Source: development guidelines § Layout)
- **DO NOT apply custom hover/active styles to `<Button>` or `<Badge>`.** Built-in elevation handles this. (Source: development guidelines § Interactions)
- **DO NOT use emojis anywhere** in the UI. Use lucide-react icons instead. (Source: development guidelines § Emoji)
- **DO NOT use destructive red for negative cash values.** Use warm amber advisory color (`text-amber-700 dark:text-amber-400` with `bg-amber-50 dark:bg-amber-950/30`). Negative cash is advisory, not an error. (Source: UX spec Part 8.4, epics.md Story 5.4 Dev Notes)
- **DO NOT sum percentage or ratio fields across quarters.** Percentage values at quarterly/monthly drill-down should use the value from the monthly projection, NOT be summed. (Source: 5-2-financial-statements-container-summary-tab.md § Gotchas)
- **DO NOT sum point-in-time balance sheet fields across quarters.** Use end-of-period values (last month of quarter for quarterly, specific month for monthly). (Source: UX spec Part 3 — Point-in-Time vs Flow distinction)

### Gotchas & Integration Warnings

**Existing Implementation — CRITICAL (Balance Sheet):**

This story has an EXISTING implementation in `client/src/components/planning/statements/balance-sheet-tab.tsx` (~687 lines). The file already contains:
- `BalanceSheetTab` component with callout bar, 10 collapsible sections, identity check row
- `EnrichedBsAnnual` type extending `AnnualSummary` with balance sheet fields
- `computeEnrichedBsAnnuals` function mapping monthly projections to enriched annual data
- `BS_SECTIONS` constant with 10 section definitions and ~20 row definitions
- `BS_POINT_IN_TIME_FIELDS` Set for correct point-in-time value resolution
- `ROIC_EXTENDED_FIELDS` Set for routing core capital metrics to `roicExtended` data
- `getBsCellValue` function with proper point-in-time quarterly/monthly handling
- `BsSection` component with expand/collapse, keyboard accessibility (`tabIndex`, `aria-expanded`, `onKeyDown`)
- `BsRow` component with input vs computed visual distinction, tooltips, interpretation rows
- `IdentityCheckRow` with per-column pass/fail using $1 tolerance
- `BsCalloutBar` with Total Assets, Total Equity, and identity status

The dev agent MUST read the existing file, compare against acceptance criteria, and fix/enhance rather than rewrite. Key areas that may need verification:
- Callout bar content matches AC1
- All rows are present per AC3 section structure
- Ratios and Core Capital sections default to collapsed (AC3)
- Identity check tolerance and display match AC4/AC5
- Point-in-time semantics are correctly implemented for sub-annual drill-down (AC6)
- Tooltip content is present for all computed cells (AC15)
- ARIA roles and keyboard accessibility match AC12/AC16

**Rows Referenced in Epics But NOT in Engine:**

The epics.md Story 5.4 references several rows that do NOT have corresponding fields in `MonthlyProjection` or `AnnualSummary`:
- **Balance Sheet:** "Other Current Assets", "Other Assets", "Credit Card Payable" — these rows are in the reference spreadsheet but the engine (Story 5.1) does not compute them. They are always zero in the current model. Do NOT add these as visible rows — they would display $0 for all periods, adding noise. If future engine extensions add these fields, they can be added as rows at that time.
- **Cash Flow — Cash Management section:** "Check row, LOC Balance, Base Cash Balance, Cash Available to Pay on Line, Cash Needed to Draw on Line" — these are LOC management detail rows from the reference spreadsheet. The engine does not compute these disaggregated LOC management fields. The LOC balance is already visible on the Balance Sheet (Line of Credit row) and LOC draws/repayments appear in Cash Flow Financing Activities. Do NOT add a Cash Management section with empty rows. This can be added when the engine supports detailed LOC management computation.

This is a deliberate scoping decision: show what the engine computes, not phantom rows with $0 values.

**However, the Balance Sheet tab is NOT wired into the container.** The `financial-statements.tsx` container still renders `<PlaceholderTab>` for both Balance Sheet and Cash Flow tabs. The dev agent must:
1. Import `BalanceSheetTab` from `./statements/balance-sheet-tab`
2. Replace the Balance Sheet `<PlaceholderTab>` with `<BalanceSheetTab output={output} />`

**No Existing Cash Flow Implementation:**

There is NO existing `cash-flow-tab.tsx` file. The Cash Flow tab must be created from scratch following the same component patterns as the Balance Sheet and P&L tabs. Reference files for patterns:
- `balance-sheet-tab.tsx` — closest structural analogue (point-in-time fields, enriched data pattern)
- `pnl-tab.tsx` — section/row definition pattern, tooltip format, interpretation rows

**Cash Flow Field Mapping:**

The engine provides disaggregated cash flow fields on `MonthlyProjection`:

| Cash Flow Row | Engine Field | Type |
|---|---|---|
| Net Income | `preTaxIncome` | Flow (sum for quarterly) |
| Add Back: Depreciation | `cfDepreciation` | Flow |
| Changes in AR | `cfAccountsReceivableChange` | Flow |
| Changes in Inventory | `cfInventoryChange` | Flow |
| Changes in AP | `cfAccountsPayableChange` | Flow |
| Changes in Tax Payable | `cfTaxPayableChange` | Flow |
| Net Operating Cash Flow | `cfNetOperatingCashFlow` | Flow |
| CapEx Purchases | `cfCapexPurchase` | Flow |
| Net Cash Before Financing | `cfNetBeforeFinancing` | Flow |
| Notes Payable | `cfNotesPayable` | Flow |
| LOC Draws/Repayments | `cfLineOfCredit` | Flow |
| Interest Expense | `cfInterestExpense` | Flow |
| Distributions | `cfDistributions` | Flow |
| Equity Issuance | `cfEquityIssuance` | Flow |
| Net Financing Cash Flow | `cfNetFinancingCashFlow` | Flow |
| Net Cash Flow | `cfNetCashFlow` | Flow |
| Beginning Cash | `beginningCash` | Point-in-time |
| Ending Cash | `endingCash` | Point-in-time |

Flow fields: Sum across months for quarterly aggregation; use monthly value directly for monthly view.
Point-in-time fields: Use end-of-period value (last month of quarter, or specific month).

**Cash Flow Identity Check:**

The Cash Flow tab should include an identity check row at the bottom (like the Balance Sheet identity check row). The check verifies: `Ending Cash = Beginning Cash + Net Cash Flow`. For each column, compute the values from the displayed data and show pass/fail. The engine already runs `CF ending cash identity` checks (visible in `identityChecks` array), but the tab should compute this locally for each visible column (including sub-annual drill-down) rather than relying on the pre-computed monthly identity checks. Use the same $1 tolerance and visual pattern as the Balance Sheet identity check.

**Lowest Cash Point Callout:**

The Cash Flow callout bar should identify the month with the lowest ending cash across all 60 months. Scan `monthlyProjections` to find the minimum `endingCash` value and its month number. Display as "Month X: $Y" or "M{X}: $Y". This is computed locally — it is NOT a field on `EngineOutput`.

**AnnualSummary Cash Flow Fields:**

`AnnualSummary` has `operatingCashFlow`, `netCashFlow`, and `endingCash`. For the annual view, use:
- `operatingCashFlow` for Net Operating Cash Flow
- `netCashFlow` for Net Cash Flow
- `endingCash` for Ending Cash (point-in-time)

For other cash flow rows at the annual level, sum the 12 monthly values for that year.

**Balance Sheet — Gross Fixed Assets and Accumulated Depreciation:**

The existing implementation computes `grossFixedAssets` and `accumulatedDepreciation` for the enriched annual data using cumulative depreciation. The `getBsCellValue` function already handles quarterly/monthly resolution for these derived fields. Verify the computation is correct: `grossFixedAssets = netFixedAssets + cumulativeDepreciation` and `accumulatedDepreciation = -cumulativeDepreciation`.

**Cash Flow — Sign Convention:**

Some cash flow fields represent outflows and will be negative (e.g., `cfCapexPurchase`, `cfDistributions`, `cfInterestExpense`, `cfAccountsReceivableChange` when AR increases). Display the actual signed value — do NOT apply `Math.abs()` to cash flow items. The sign communicates the direction of cash movement, which is standard accounting presentation for cash flow statements. Use amber color for negative ending cash only.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/components/planning/statements/balance-sheet-tab.tsx` | MODIFY | Verify against ACs, fix any gaps (rows, tooltips, ARIA, point-in-time semantics). Already ~687 lines. |
| `client/src/components/planning/statements/cash-flow-tab.tsx` | CREATE | New Cash Flow tab component following BS/P&L patterns. Sections: Operating, Investing, Financing, Net Cash Flow. Negative cash highlighting. ~300-500 lines expected. |
| `client/src/components/planning/financial-statements.tsx` | MODIFY | Import `BalanceSheetTab` and `CashFlowTab`. Replace both `<PlaceholderTab>` instances with real components. |

### Testing Expectations

- **Primary testing method:** Playwright E2E via `run_test` tool.
- **Key scenarios to verify (Balance Sheet):**
  - Navigate to Reports > Balance Sheet tab
  - Callout bar shows Total Assets Y1, Total Equity Y1, Identity Status
  - All 10 sections present with correct row structure
  - Core Capital Metrics and Ratios sections start collapsed
  - Section expand/collapse toggle works (click and keyboard)
  - Identity check row shows pass (green checkmark) or fail (alert icon with tooltip)
  - Values are properly formatted (currency, percentages, numbers)
  - Year column header click triggers drill-down — balance sheet values remain point-in-time at sub-annual levels
- **Key scenarios to verify (Cash Flow):**
  - Navigate to Reports > Cash Flow tab
  - Callout bar shows Net Cash Flow Y1, Ending Cash Y5, Lowest Cash Point
  - All 4 sections present with correct row structure
  - Negative ending cash cells show warm amber background + downward arrow icon
  - Flow values properly aggregated at quarterly level (summed, not end-of-period)
  - Beginning Cash and Ending Cash are point-in-time at all drill-down levels
- **No unit tests needed** — pure UI presentation with no new business logic.

### Dependencies & Environment Variables

- **No new packages needed.** All dependencies are already installed.
- **No new environment variables.** This is a frontend-only story.
- **Dependencies on completed work:**
  - Story 5.1 (done) — engine extension providing cash flow disaggregation fields, balance sheet disaggregation fields, `roicExtended` in `EngineOutput`
  - Story 5.2 (done) — Financial Statements container, `useColumnManager`, `ColumnToolbar`, `GroupedTableHead`, `getAnnualValue`/`getQuarterlyValue`/`getMonthlyValue`
  - Story 5.3 (done) — established component patterns (section/row definitions, tooltip format, interpretation rows, input cell visual distinction, sticky callout bar, ARIA roles)
- **Stories that depend on THIS story:**
  - Story 5.5 (ROIC/Valuation/Audit) — reuses same component patterns
  - Story 5.6 (Quick Entry Integration) — adds actual inline editing to input cells visually marked in this story
  - Story 5.8 (Guardian Bar & Interpretation) — enhances interpretation rows with brand benchmark comparisons and cash Guardian indicator
  - Story 5.10 (Glossary & Help) — provides the glossary page that tooltip "View in glossary" links navigate to

### References

- `_bmad-output/planning-artifacts/ux-financial-statements-spec.md` Part 8.3 (Balance Sheet row structure), Part 8.4 (Cash Flow Statement row structure), Part 5 (Dynamic Interpretation), Part 6 (Guardian — negative cash is "Concerning" level, not destructive), Part 15 (Accessibility — non-color indicators, ARIA roles)
- `_bmad-output/planning-artifacts/architecture.md` § Number Format Rules, § data-testid Naming Convention, § Communication Patterns
- `_bmad-output/planning-artifacts/epics.md` § Story 5.4 — acceptance criteria and dev notes
- `_bmad-output/implementation-artifacts/5-1-financial-engine-extension.md` — engine output structure, cash flow disaggregation fields, balance sheet disaggregation fields
- `_bmad-output/implementation-artifacts/5-2-financial-statements-container-summary-tab.md` — container architecture, column manager, progressive disclosure infrastructure
- `_bmad-output/implementation-artifacts/5-3-pl-statement-tab.md` — component patterns (section definitions, row definitions, tooltips, interpretation rows, ARIA roles, input cell visual distinction, sticky callout bar, Math.abs for expense rows, keyboard accessibility)
- `shared/financial-engine.ts` — `EngineOutput`, `AnnualSummary`, `MonthlyProjection`, `ROICExtendedOutput`, `IdentityCheckResult` type definitions
- `client/src/components/planning/statements/balance-sheet-tab.tsx` — existing implementation (~687 lines)
- `client/src/components/planning/statements/pnl-tab.tsx` — reference implementation for component patterns (~570 lines)
- `client/src/components/planning/statements/column-manager.tsx` — `useColumnManager`, `ColumnToolbar`, `GroupedTableHead`, value resolver functions
- `client/src/components/planning/financial-statements.tsx` — container component where tabs are wired
