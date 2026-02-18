# Story 5.5: ROIC, Valuation & Audit Tabs

Status: review

## Story

As a franchisee,
I want to see my Return on Invested Capital, business valuation analysis, and financial integrity audit results,
So that I can understand my return, what the franchise could be worth, and trust the accuracy of projections (FR7e, FR7f, FR7g).

## Acceptance Criteria

**ROIC Tab — Structure and Layout:**

1. Given I navigate to the ROIC tab within Financial Statements, when the tab renders, then the ROIC view renders as a tabular view with annual columns only (Y1-Y5). There is NO monthly or quarterly drill-down — no `useColumnManager`, no `ColumnToolbar`, no `GroupedTableHead`. A simple 5-column annual table with a fixed "Metric" label column.

2. Given the ROIC tab renders, then a sticky Key Metrics Callout Bar shows a plain-language ROIC interpretation: "Your 5-year cumulative ROIC of X% means for every dollar you invested, you earned $Y back." The cumulative ROIC value is derived from the Year 5 `roicExtended` entry's `roicPct`. The dollar equivalent is `1 + (roicPct)` formatted as currency per dollar (e.g., "$1.27 back" for 27% cumulative ROIC). If `roicPct` is 0 or negative, display "Your plan has not yet generated a positive return on invested capital."

3. Given the ROIC tab renders, then row sections match the reference spreadsheet structure with three collapsible sections:
   - **Invested Capital:** Outside Cash (Equity), Total Loans (Debt), Total Cash Invested, Total Sweat Equity, Retained Earnings less Distributions, Total Invested Capital
   - **Returns:** Pre-Tax Net Income, Pre-Tax Net Income incl. Sweat Equity, Tax Rate, Taxes Due, After-Tax Net Income, ROIC %
   - **Core Capital:** Average Core Capital per Month, Months of Core Capital, Excess Core Capital

4. Given the ROIC tab renders, then all sections are expanded by default (no collapsed sections — this is a simpler view with only ~15 rows).

5. Given the ROIC tab renders, then all cells are read-only (no input cells on this tab). There is no input cell visual distinction — all rows are computed.

**Valuation Tab — Structure and Layout:**

6. Given I navigate to the Valuation tab within Financial Statements, when the tab renders, then the Valuation view renders with annual columns only (Y1-Y5), using the same simple annual table layout as ROIC.

7. Given the Valuation tab renders, then a sticky Key Metrics Callout Bar shows: Estimated Enterprise Value (Y5) and Net After-Tax Proceeds (Y5). Values are sourced from the Year 5 `valuation` entry.

8. Given the Valuation tab renders, then row sections match the reference spreadsheet structure with four collapsible sections:
   - **EBITDA Basis:** EBITDA (= netOperatingIncome), EBITDA Multiple (editable input), Estimated Enterprise Value
   - **Adjustments:** Less: Outstanding Debt, Less: Working Capital Adjustment, Estimated Equity Value
   - **After-Tax:** Estimated Taxes on Sale (21%), Net After-Tax Proceeds
   - **Returns:** Total Cash Extracted (distributions + sale proceeds), Total Invested, Net Return, Return Multiple, Replacement Return Required, Business Annual ROIC

9. Given the Valuation tab renders, then EBITDA Multiple is the PRIMARY editable input cell on this tab. It is visually distinguished with the same input cell pattern used on P&L/Balance Sheet/Cash Flow tabs: subtle tinted background (`primary/5`), thin dashed left border (`primary/20`), small pencil icon on hover. Clicking does NOT open inline editor in this story (visual-only, actual editing in Story 5.6).

10. Given the Valuation tab renders, then the "Adjustments" section computes:
    - Outstanding Debt = `totalLoans` from the corresponding year's `roicExtended` entry (or engine input `debtAmount`)
    - Working Capital Adjustment = Total Current Assets - Total Current Liabilities from end-of-year balance sheet (derived from monthly projections)
    - Estimated Equity Value = Estimated Enterprise Value - Outstanding Debt - Working Capital Adjustment

11. Given the Valuation tab renders, then the "Returns" section computes:
    - Total Cash Extracted = cumulative distributions through Year 5 + netAfterTaxProceeds (Year 5)
    - Total Invested = `totalCashInvested` from `roicExtended` (Year 5)
    - Net Return = Total Cash Extracted - Total Invested
    - Return Multiple = Total Cash Extracted / Total Invested (guarded: if Total Invested ≤ 0, show "N/A")

**Audit Tab — Structure and Layout:**

12. Given I navigate to the Audit tab within Financial Statements, when the tab renders, then the Audit view displays as a diagnostic checklist — NOT a tabular financial statement. It uses a card/list layout, not the column-based table used by other tabs.

13. Given the Audit tab renders, then a visual summary header shows: "X of Y checks passing" (e.g., "13 of 13 checks passing" or "12 of 13 checks passing"). The count is derived from the `identityChecks` array on `EngineOutput`, grouped by check category name prefix. A category passes if ALL of its per-year entries pass.

14. Given the Audit tab renders, then all identity check categories are displayed, grouped by their check name prefix. The engine produces ~50+ individual `IdentityCheckResult` entries across 13 check categories (some are per-year). The categories are:
    - Balance Sheet Imbalance I
    - Balance Sheet Imbalance II
    - P&L Check
    - Balance Sheet Check
    - Cash Flow Check I
    - Cash Flow Check II
    - Corporation Tax Check
    - Working Capital Check
    - Debt Check
    - Capex Check
    - Breakeven Check
    - ROI Check
    - Valuation Check

15. Given the Audit tab renders, then each check category shows:
    - Check name (bold, left-aligned)
    - Overall pass/fail status icon: checkmark icon (lucide `Check`) in success color for pass, alert triangle icon (lucide `AlertTriangle`) in destructive color for fail
    - Expandable detail section showing per-year results: Year, Expected value, Actual value, Tolerance, and per-year pass/fail icon

16. Given a check category has all per-year entries passing, then the category displays in a success state: green checkmark icon, muted text, collapsed detail section (expandable on click).

17. Given a check category has ANY per-year entry failing, then the category displays in an error state: alert triangle icon in destructive color, the category detail is auto-expanded, and failed entries highlight with destructive background. A specific explanation of what's wrong is shown (e.g., "Year 3: Expected $485,200 but actual $485,150 — difference of $50"). A navigation link "[View in Balance Sheet →]" or "[View in Cash Flow →]" navigates to the relevant statement tab via the `onNavigateToTab` callback.

18. Given the Audit tab renders, then the view is COMPLETELY read-only in all modes — it has no editable cells and no input cell visual distinction.

**Shared Patterns (All Three Tabs):**

19. Given any of the three tabs renders, then hovering over computed cells shows a tooltip with: plain-language explanation (bold) and calculation formula (muted). Glossary links are placeholders until Story 5.10.

20. Given any of the three tabs renders, then negative values display in amber advisory color (`text-amber-700 dark:text-amber-400`) — never destructive red (except for failed audit checks which use destructive color).

21. Given any of the three tabs renders, then the table uses ARIA roles: `role="grid"` on the table (ROIC/Valuation), `role="row"` on rows, `role="rowheader"` on label cells, `role="gridcell"` on data cells with `aria-readonly="true"` (except EBITDA Multiple which uses `aria-readonly="false"`).

**Container Wiring:**

22. Given the Financial Statements container renders, then the ROIC tab (`<TabsContent value="roic">`) renders `<RoicTab output={output} />` instead of a `<PlaceholderTab>`, the Valuation tab (`<TabsContent value="valuation">`) renders `<ValuationTab output={output} />` instead of a `<PlaceholderTab>`, and the Audit tab (`<TabsContent value="audit">`) renders `<AuditTab output={output} onNavigateToTab={handleNavigateToTab} />` instead of a `<PlaceholderTab>`.

23. Given all three tabs are wired, then the `<PlaceholderTab>` component definition can be removed from `financial-statements.tsx` if no other tab uses it.

**Loading/Empty States:**

24. Given the Financial Statements container is loading engine output, then all three tabs inherit the loading skeleton state from the parent container — no tab-level loading state is needed. If engine output is available but has empty `roicExtended`/`valuation`/`identityChecks` arrays, tabs render with appropriate empty state messaging.

## Dev Notes

### Architecture Patterns to Follow

- **Component naming:** PascalCase components, kebab-case files — `RoicTab` in `roic-tab.tsx`, `ValuationTab` in `valuation-tab.tsx`, `AuditTab` in `audit-tab.tsx` (Source: architecture.md § Code Naming)
- **State management:** No new API calls. All data comes from `EngineOutput` passed as a prop from `FinancialStatements` container via `usePlanOutputs` hook. Local state only for UI (expanded/collapsed sections). (Source: architecture.md § Communication Patterns)
- **Currency formatting:** Use `formatCents` from `@/lib/format-currency` for all currency display. Engine stores currency as cents (integers). (Source: architecture.md § Number Format Rules)
- **Percentage formatting:** Percentages are stored as decimals (e.g., 0.065 = 6.5%). Display as `(value * 100).toFixed(1) + "%"`. (Source: architecture.md § Number Format Rules)
- **data-testid convention:** Rows: `roic-row-{key}` / `val-row-{key}` / `audit-check-{key}`, values: `roic-value-{key}-y{year}` / `val-value-{key}-y{year}`, sections: `roic-section-{key}` / `val-section-{key}`, callout bar: `roic-callout-bar` / `val-callout-bar` / `audit-summary`. (Source: architecture.md § data-testid Naming Convention)
- **Expenses are negative values.** The engine sign convention: revenue positive, expenses negative. Display absolute values for expense-type rows where appropriate. ROIC and Valuation output fields are already positive (adjusted by engine). (Source: 5-1-financial-engine-extension.md)
- **Shadcn components:** Use existing `<Tooltip>`, `<TooltipContent>`, `<TooltipTrigger>` from `@/components/ui/tooltip`. Use `<Card>` for audit check groups. Use `lucide-react` icons (Check, AlertTriangle, ChevronDown, ChevronRight, Pencil, ExternalLink). (Source: architecture.md § Structure Patterns)
- **No column manager needed.** ROIC and Valuation tabs are annual-only — no drill-down. Do NOT import `useColumnManager`, `ColumnToolbar`, or `GroupedTableHead`. Build a simple static 6-column table (label + Y1-Y5). The Audit tab is not tabular at all — it uses a card/list layout. (Source: epics.md Story 5.5 Dev Notes, UX spec Part 8.5/8.6/8.7)

### UI/UX Deliverables

**Screens/Pages:**

- **ROIC Tab** (`roic-tab.tsx`) — Annual-only tabular view rendered within `<TabsContent value="roic">`. Receives `EngineOutput` as a prop. ~200-300 lines expected.
- **Valuation Tab** (`valuation-tab.tsx`) — Annual-only tabular view rendered within `<TabsContent value="valuation">`. Receives `EngineOutput` as a prop. ~250-350 lines expected.
- **Audit Tab** (`audit-tab.tsx`) — Diagnostic checklist view rendered within `<TabsContent value="audit">`. Receives `EngineOutput` and `onNavigateToTab` as props. ~200-300 lines expected.

**Key UI Elements (ROIC):**

- Sticky callout bar with plain-language ROIC interpretation ("Your 5-year cumulative ROIC of X%...")
- 3 collapsible sections (Invested Capital, Returns, Core Capital) — all expanded by default
- Simple 6-column table (Metric label + Y1-Y5)
- All cells read-only with tooltips on hover
- Subtotal/total row styling matching P&L/BS conventions (font-medium/font-semibold, top border)

**Key UI Elements (Valuation):**

- Sticky callout bar with Enterprise Value (Y5) and Net After-Tax Proceeds (Y5)
- 4 collapsible sections — all expanded by default
- Simple 6-column table (Metric label + Y1-Y5)
- EBITDA Multiple row with input cell visual distinction (tinted background, dashed border, pencil icon on hover)
- All other cells read-only with tooltips on hover

**Key UI Elements (Audit):**

- Summary header: "X of 13 checks passing" with overall pass/fail indication
- 13 check category cards/rows, each with:
  - Pass/fail icon + check name
  - Expandable detail showing per-year results (Year, Expected, Actual, Tolerance, Status)
  - Navigation link on failed checks pointing to relevant statement tab
- No tabular financial statement layout — diagnostic list/card layout
- All content read-only

**UI States:**

- **Section collapsed (ROIC/Valuation):** Only section header visible with ChevronRight icon
- **Section expanded (ROIC/Valuation):** All child rows visible with ChevronDown icon
- **Computed cell hover (ROIC/Valuation):** Tooltip with explanation + formula
- **Input cell hover (Valuation — EBITDA Multiple only):** Pencil icon becomes visible
- **Audit check passing:** Green checkmark, muted styling, collapsed detail
- **Audit check failing:** Destructive alert triangle, auto-expanded detail, highlighted failed entries with navigation link
- **Empty engine output:** Graceful messaging "No projection data available"

### Anti-Patterns & Hard Constraints

- **DO NOT install new packages.** All dependencies are already present (Shadcn tooltips, lucide-react icons, Card component).
- **DO NOT modify `components/ui/` files.** These are Shadcn-managed primitives.
- **DO NOT modify `vite.config.ts`, `server/vite.ts`, `drizzle.config.ts`, or `package.json` scripts.** (Source: development guidelines § Forbidden Changes)
- **DO NOT create new API endpoints.** This story is pure frontend — all data comes from the `EngineOutput` prop passed by `FinancialStatements`.
- **DO NOT make the EBITDA Multiple cell actually editable in this story.** Input cell highlighting is visual-only. Actual inline editing is enabled in Story 5.6 (Quick Entry Integration). The pencil icon and tinted background indicate "this is an input" but clicking does not open an editor.
- **DO NOT implement benchmark-based interpretation text.** Story 5.8 (Guardian Bar & Dynamic Interpretation) wires brand benchmark comparisons.
- **DO NOT import `useColumnManager` or `ColumnToolbar` for ROIC/Valuation tabs.** These are annual-only views with no drill-down capability.
- **DO NOT use `display:table` CSS property.** HTML `<table>` elements are fine. (Source: development guidelines § Layout)
- **DO NOT apply custom hover/active styles to `<Button>` or `<Badge>`.** Built-in elevation handles this. (Source: development guidelines § Interactions)
- **DO NOT use emojis anywhere** in the UI. Use lucide-react icons instead. (Source: development guidelines § Emoji)
- **DO NOT use destructive red for negative values in ROIC/Valuation tabs.** Use warm amber advisory color. Destructive color is ONLY used for failed audit checks. (Source: UX spec Part 6)
- **DO NOT re-implement section expand/collapse logic.** Follow the same pattern as `BsSection` in `balance-sheet-tab.tsx` or `PnlSection` in `pnl-tab.tsx`: `useState` for expanded state, ChevronDown/ChevronRight toggle, `tabIndex={0}`, `aria-expanded`, keyboard handler for Enter/Space.

### Gotchas & Integration Warnings

**ROIC Data Mapping — Field-to-Row:**

The engine provides `roicExtended: ROICExtendedOutput[]` with one entry per year. Map fields to rows:

| ROIC Row | Engine Field | Format |
|---|---|---|
| Outside Cash (Equity) | `outsideCash` | Currency |
| Total Loans (Debt) | `totalLoans` | Currency |
| Total Cash Invested | `totalCashInvested` | Currency |
| Total Sweat Equity | `totalSweatEquity` | Currency |
| Retained Earnings less Distributions | `retainedEarningsLessDistributions` | Currency |
| Total Invested Capital | `totalInvestedCapital` | Currency (subtotal) |
| Pre-Tax Net Income | `preTaxNetIncome` | Currency |
| Pre-Tax Net Income incl. Sweat Equity | `preTaxNetIncomeIncSweatEquity` | Currency |
| Tax Rate | `taxRate` | Percentage |
| Taxes Due | `taxesDue` | Currency |
| After-Tax Net Income | `afterTaxNetIncome` | Currency |
| ROIC % | `roicPct` | Percentage |
| Avg Core Capital / Month | `avgCoreCapitalPerMonth` | Currency |
| Months of Core Capital | `monthsOfCoreCapital` | Number (1 decimal) |
| Excess Core Capital | `excessCoreCapital` | Currency |

**Valuation Data Mapping — Field-to-Row:**

The engine provides `valuation: ValuationOutput[]` with one entry per year. Map fields to rows:

| Valuation Row | Engine Field | Format |
|---|---|---|
| EBITDA | `netOperatingIncome` | Currency |
| EBITDA Multiple | `ebitdaMultiple` | Number (1 decimal, e.g., "3.0x") — INPUT CELL |
| Estimated Enterprise Value | `estimatedValue` | Currency |
| Outstanding Debt | `totalCashInvested` minus equity — OR use `roicExtended[y].totalLoans` | Currency |
| Working Capital Adjustment | Derived from monthly projections (see below) | Currency |
| Estimated Equity Value | Computed: estimatedValue - debt - wcAdj | Currency |
| Estimated Taxes on Sale | `estimatedTaxOnSale` | Currency |
| Net After-Tax Proceeds | `netAfterTaxProceeds` | Currency |
| Total Cash Extracted | Computed locally (see below) | Currency |
| Total Invested | `totalCashInvested` from valuation entry | Currency |
| Net Return | Computed: totalCashExtracted - totalInvested | Currency |
| Return Multiple | Computed: totalCashExtracted / totalInvested | Number (e.g., "2.3x") |
| Replacement Return Required | `replacementReturnRequired` | Currency |
| Business Annual ROIC | `businessAnnualROIC` | Percentage |

**Valuation — Working Capital Adjustment:**

Working Capital Adjustment is NOT directly provided by the engine's `ValuationOutput`. It must be derived from monthly projection data:
- For each year, take the last month's `totalCurrentAssets - totalCurrentLiabilities` from the monthly projections.
- This requires access to `monthlyProjections` from the `EngineOutput` — already available through the `output` prop.

**Valuation — Total Cash Extracted:**

Also computed locally, not in ValuationOutput:
- Cumulative distributions through Year N: Sum `distributions` from `annualSummaries[0..y]` (note: distributions are negative in the engine, take absolute value)
- Plus `netAfterTaxProceeds` for that year
- `Total Cash Extracted = cumDistributions + netAfterTaxProceeds`

**Valuation — Outstanding Debt:**

Use `roicExtended[y].totalLoans` for each year. This gives the original debt amount (constant across years in current engine). Alternatively, if you want the remaining loan balance, use the end-of-year `loanClosingBalance` from monthly projections. Use `totalLoans` from roicExtended for consistency with the reference spreadsheet.

**Audit — Check Category Grouping:**

The engine's `identityChecks` array contains individual `IdentityCheckResult` entries. Many checks are per-year (e.g., "BS Imbalance I – Y1", "BS Imbalance I – Y2"). Group these by extracting the category prefix:
- The `name` field has patterns like `"BS Imbalance I – Y1"`, `"P&L Check – Y3"`, `"Capex Check"` (no year suffix for global checks)
- Grouping strategy: Split on ` – Y` or ` – ` to extract the category name. All entries sharing the same prefix belong to the same category.
- Verify by checking actual `identityChecks` names in the engine output.

**Audit — Navigation Link Mapping:**

Failed checks should link to the relevant statement tab. Mapping:

| Check Category Prefix | Navigation Target | Tab | Scroll Target |
|---|---|---|---|
| BS Imbalance | Balance Sheet | `balance-sheet` | `bs-section-total-assets` |
| P&L Check | P&L Statement | `pnl` | `pnl-section-pretax` |
| Balance Sheet Check | Balance Sheet | `balance-sheet` | `bs-section-equity` |
| Cash Flow Check | Cash Flow | `cash-flow` | `cf-section-net-cash` |
| Corporation Tax Check | ROIC | `roic` | `roic-section-returns` |
| Working Capital Check | Balance Sheet | `balance-sheet` | `bs-section-current-assets` |
| Debt Check | Cash Flow | `cash-flow` | `cf-section-financing` |
| Capex Check | Balance Sheet | `balance-sheet` | `bs-section-fixed-assets` |
| Breakeven Check | Summary | `summary` | N/A |
| ROI Check | ROIC | `roic` | `roic-section-returns` |
| Valuation Check | Valuation | `valuation` | `val-section-ebitda` |

The `onNavigateToTab` callback from the container accepts `(tab: string, scrollTo?: string)`. Use this to navigate and scroll to the relevant section.

**Audit — Check Name Patterns in Engine:**

Read the actual identity check names from the engine (lines ~848-1080 of `shared/financial-engine.ts`). The exact name strings determine the grouping logic. Key patterns:
- `"BS Imbalance I – Y{n}"` — 5 entries
- `"BS Imbalance II – Y{n}"` — 5 entries
- `"P&L Check – Y{n}"` — 5 entries
- `"BS Check – Y{n}"` — 5 entries
- `"CF Check I – Y{n}"` — 5 entries
- `"CF Check II – Y{n}"` — 5 entries
- `"Corp Tax Check – Y{n}"` — 5 entries
- `"Working Capital Check – Y{n}"` — 5 entries
- `"Debt Check – Y{n}"` — 5 entries
- `"Capex Check"` — 1 entry (global)
- `"Breakeven Check"` — 1 entry (global)
- `"ROI Check – Y{n}"` — 5 entries
- `"Valuation Check – Y{n}"` — 5 entries

Total: ~56 individual entries across 13 categories. Parse the ` – Y` delimiter to group.

**ROIC Callout — Cumulative ROIC Interpretation:**

The "5-year cumulative ROIC" in the callout bar should use Year 5's `roicPct` field from `roicExtended`. The dollar equivalent is calculated as: if ROIC = 27% (0.27), then "for every dollar you invested, you earned $1.27 back." Formula: `$${(1 + roicPct).toFixed(2)}`. If ROIC ≤ 0, use the fallback text.

**ROIC Callout — Edge Case:**

If `roicExtended` array is empty (no projection data), the callout should show "No ROIC data available." This shouldn't happen with a properly initialized engine but must be handled gracefully.

**Valuation Callout — Format:**

Enterprise Value Y5 and Net After-Tax Proceeds Y5 are both in cents. Use `formatCents()` for display. If `valuation` array is empty, show fallback text.

**Section Expand/Collapse Pattern:**

Reuse the exact same pattern from `balance-sheet-tab.tsx` `BsSection` component:
```typescript
function Section({ title, expanded, onToggle, children, testId }) {
  return (
    <div data-testid={testId}>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
        className="flex items-center gap-2 px-3 py-2 bg-muted/50 font-semibold text-sm cursor-pointer select-none"
      >
        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        {title}
      </div>
      {expanded && children}
    </div>
  );
}
```

**Formatting Helpers:**

Three format types beyond currency:
- `"pct"`: `(value * 100).toFixed(1) + "%"` — for decimals like `taxRate`, `roicPct`, `businessAnnualROIC`
- `"number"`: `value.toFixed(1)` — for `monthsOfCoreCapital`
- `"multiplier"`: `value.toFixed(1) + "x"` — for `ebitdaMultiple` and Return Multiple

**Table Structure (ROIC/Valuation):**

Simple HTML table:
```html
<table role="grid" aria-label="ROIC Analysis">
  <thead>
    <tr>
      <th class="sticky left-0 ...">Metric</th>
      <th>Year 1</th>
      <th>Year 2</th>
      <th>Year 3</th>
      <th>Year 4</th>
      <th>Year 5</th>
    </tr>
  </thead>
  <tbody>
    <!-- Section headers + data rows -->
  </tbody>
</table>
```

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/components/planning/statements/roic-tab.tsx` | CREATE | New ROIC tab component. Annual-only table with 3 sections (Invested Capital, Returns, Core Capital). ~200-300 lines. |
| `client/src/components/planning/statements/valuation-tab.tsx` | CREATE | New Valuation tab component. Annual-only table with 4 sections (EBITDA Basis, Adjustments, After-Tax, Returns). Editable EBITDA Multiple (visual-only). ~250-350 lines. |
| `client/src/components/planning/statements/audit-tab.tsx` | CREATE | New Audit tab component. Diagnostic checklist with 13 check categories, per-year detail, navigation links. ~200-300 lines. |
| `client/src/components/planning/financial-statements.tsx` | MODIFY | Import `RoicTab`, `ValuationTab`, `AuditTab`. Replace 3 `<PlaceholderTab>` instances with real components. Remove `PlaceholderTab` function if no longer used. ~15 lines changed. |

### Testing Expectations

- **Primary testing method:** Playwright E2E via `run_test` tool.
- **Key scenarios to verify (ROIC):**
  - Navigate to Reports > ROIC tab
  - Callout bar shows plain-language ROIC interpretation with dollar amount
  - Three sections present: Invested Capital, Returns, Core Capital
  - All sections expanded by default
  - 15 rows visible with proper formatting (currency, percentage, number)
  - No drill-down controls visible (annual-only)
  - Tooltip appears on computed cell hover with explanation text
- **Key scenarios to verify (Valuation):**
  - Navigate to Reports > Valuation tab
  - Callout bar shows Enterprise Value (Y5) and Net After-Tax Proceeds (Y5)
  - Four sections present: EBITDA Basis, Adjustments, After-Tax, Returns
  - EBITDA Multiple row has input cell visual distinction (tinted background, dashed border)
  - EBITDA Multiple shows pencil icon on hover
  - All other cells read-only
  - Values properly formatted (currency, multiplier, percentage)
- **Key scenarios to verify (Audit):**
  - Navigate to Reports > Audit tab
  - Summary shows "X of Y checks passing"
  - All 13 check categories displayed
  - Passing checks show green checkmark icon
  - If any checks fail: alert icon, expanded detail, navigation link
  - Clicking navigation link navigates to correct tab
- **Container wiring:**
  - All three tabs render real components (no "Coming in the next update" placeholder text)
  - No `PlaceholderTab` references remain in the container
- **No unit tests needed** — pure UI presentation with no new business logic.

### Dependencies & Environment Variables

- **No new packages needed.** All dependencies are already installed.
- **No new environment variables.** This is a frontend-only story.
- **Dependencies on completed work:**
  - Story 5.1 (done) — engine extension providing `valuation`, `roicExtended`, and `identityChecks` arrays on `EngineOutput`
  - Story 5.2 (done) — Financial Statements container with tab navigation, `usePlanOutputs` hook
  - Story 5.3 (done) — established component patterns (section definitions, tooltip format, input cell visual distinction, sticky callout bar, ARIA roles)
  - Story 5.4 (done) — established additional patterns (section expand/collapse, computed cell tooltips, identity check visual pattern)
- **Stories that depend on THIS story:**
  - Story 5.6 (Quick Entry Integration) — adds actual inline editing to EBITDA Multiple input cell
  - Story 5.8 (Guardian Bar & Interpretation) — enhances ROIC/Valuation with interpretation rows, connects Guardian indicator click to ROIC tab
  - Story 5.10 (Glossary & Help) — provides glossary page that tooltip links navigate to

### References

- `_bmad-output/planning-artifacts/ux-financial-statements-spec.md` Part 8.5 (ROIC), Part 8.6 (Valuation), Part 8.7 (Audit), Part 15 (Accessibility)
- `_bmad-output/planning-artifacts/architecture.md` § Number Format Rules, § data-testid Naming Convention, § Communication Patterns
- `_bmad-output/planning-artifacts/epics.md` § Story 5.5 — acceptance criteria and dev notes
- `_bmad-output/implementation-artifacts/5-1-financial-engine-extension.md` — engine output structure, `ValuationOutput`, `ROICExtendedOutput`, `IdentityCheckResult`
- `_bmad-output/implementation-artifacts/5-4-balance-sheet-cash-flow-tabs.md` — component patterns, section expand/collapse pattern, identity check visual pattern
- `shared/financial-engine.ts` — `EngineOutput`, `ValuationOutput`, `ROICExtendedOutput`, `IdentityCheckResult`, identity check name patterns (lines 848-1080)
- `client/src/components/planning/statements/balance-sheet-tab.tsx` — reference for section/row patterns, expand/collapse, tooltips, identity check display
- `client/src/components/planning/statements/pnl-tab.tsx` — reference for section definitions, row definitions, input cell visual distinction
- `client/src/components/planning/statements/callout-bar.tsx` — reference for sticky callout bar component pattern
- `client/src/components/planning/financial-statements.tsx` — container where tabs are wired, `PlaceholderTab` to be replaced
- `client/src/lib/format-currency.ts` — `formatCents` utility for currency display
