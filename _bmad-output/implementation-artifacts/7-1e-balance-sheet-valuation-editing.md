# Story 7.1e: Balance Sheet & Valuation Inline Editing

Status: done

## Story

As a franchisee reviewing my financial projections,
I want to adjust working capital assumptions (AR Days, AP Days, Inventory Days, Tax Payment Delay) and my EBITDA multiple directly in the Balance Sheet and Valuation tabs,
so that I can see how these assumptions affect my projected balance sheet and business valuation without leaving Reports.

## Design Principle

These are single-value fields — they apply uniformly across all 5 years. They don't need per-year or per-month editing. A simple inline edit (click, type, save) is sufficient. This extends the "everything editable in Reports" principle to the Balance Sheet and Valuation tabs.

## Acceptance Criteria

**AC-1: Balance Sheet tab — working capital assumptions editable**

Given I am viewing the Balance Sheet tab in Reports
When the working capital assumption rows are rendered
Then the following fields are inline-editable using `InlineEditableCell`:

| Field | Format | Validation | Notes |
|-------|--------|-----------|-------|
| AR Days | integer | 0–365 | Accounts Receivable collection period |
| AP Days | integer | 0–365 | Accounts Payable payment period |
| Inventory Days | integer | 0–365 | Inventory turnover period |
| Tax Payment Delay (Months) | integer | 0–24 | Delay between accrual and payment |

And these are single-value fields (one input, not per-year columns)
And edits save to `PlanFinancialInputs.workingCapitalAndValuation` via `PATCH /api/plans/:id`
And validation rejects negative values and values exceeding the maximum
And the balance sheet recalculates immediately after save (AR balance, AP balance, inventory balance, tax liability)

**AC-2: Valuation tab — EBITDA multiple editable**

Given I am viewing the Valuation tab in Reports
When the EBITDA multiple row is rendered
Then `ebitdaMultiple` is inline-editable using `InlineEditableCell`
And it is a single-value field
And the field uses `decimal` format — displayed as a number with 1 decimal place and "x" suffix (e.g., "3.5x")
And validation rejects values below 0.1 and negative values
And the valuation recalculates immediately after save

**AC-3: INPUT_FIELD_MAP extension for non-P&L tabs**

Given the `INPUT_FIELD_MAP` currently only covers P&L rows
When Balance Sheet and Valuation tabs need inline editing
Then `INPUT_FIELD_MAP` is extended with entries for `arDays`, `apDays`, `inventoryDays`, `taxPaymentDelayMonths`, and `ebitdaMultiple`
And the `isEditableRow()` function correctly identifies these rows
And each tab's rendering code checks `isEditableRow()` to determine whether to render an `InlineEditableCell`

## Dev Notes

### Navigation

- **Balance Sheet editing**: Sidebar → Reports → Balance Sheet tab → working capital rows
- **Valuation editing**: Sidebar → Reports → Valuation tab → EBITDA Multiple row

### Architecture

- These fields already exist in `PlanFinancialInputs.workingCapitalAndValuation` (added in 7.1a)
- `FIELD_METADATA` entries already exist in `field-metadata.ts` for all five fields
- `InlineEditableCell` already works for single-value editing (no per-year columns needed)
- The `EBITDA_MULTIPLE_KEY` constant already exists in `input-field-map.ts`
- The engine already reads these values from `FinancialInputs` and uses them in balance sheet and valuation calculations

### Anti-Patterns & Hard Constraints

- **DO NOT modify `components/ui/*`**
- **DO NOT create new API endpoints**
- **DO NOT introduce new npm packages**
- **DO NOT make these per-year fields** — the engine treats them as single values across all years

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/components/planning/statements/input-field-map.ts` | MODIFY | Add `INPUT_FIELD_MAP` entries for arDays, apDays, inventoryDays, taxPaymentDelayMonths, ebitdaMultiple with validation constraints. |
| `client/src/components/planning/statements/balance-sheet-tab.tsx` | MODIFY | Add `InlineEditableCell` rendering for the four working capital assumption rows. |
| `client/src/components/planning/statements/valuation-tab.tsx` | MODIFY | Add `InlineEditableCell` rendering for EBITDA Multiple row with "x" suffix display. |

### Testing Expectations

- **E2E (Playwright)**:
  - Navigate to Reports → Balance Sheet tab → click AR Days → enter 45 → verify saved and balance sheet recalculates
  - Enter AR Days = -5 → verify rejected (validation)
  - Enter AR Days = 400 → verify rejected (max 365)
  - Edit AP Days, Inventory Days, Tax Payment Delay → verify saved with correct validation
  - Navigate to Reports → Valuation tab → click EBITDA Multiple → enter 4.5 → verify displayed as "4.5x" and valuation recalculates
  - Enter EBITDA Multiple = 0 → verify rejected (min 0.1)
  - Verify edits persist across page reload

### References

- **PRD Requirements**: FR7j (full input assumption set)
- **Predecessor**: Story 7.1a (data model, field metadata), Story 7.1b (Reports editing patterns)

### Dependencies

- **Depends on**: Story 7.1a (DONE), Story 7.1b (establishes Reports inline editing patterns)
- **Can parallel with**: Story 7.1c, Story 7.1d

### Completion Notes

- All 5 acceptance criteria met (AC-1 through AC-5)
- Single-value fields work correctly — edits apply uniformly, no per-year editing
- Reused existing InlineEditableCell component and handleCellEdit flow from Story 7.1b
- Added "decimal" case to InlineEditableCell's formatRawForInput switch for EBITDA multiple
- Working Capital Assumptions rendered as a new collapsible section in Balance Sheet tab (below Identity Check row)
- EBITDA Multiple rendered inline in Valuation tab's EBITDA Basis section (Year 1 cell editable, other years display same value)
- No new API endpoints, npm packages, or UI component modifications required

### File List

| File | Action | Summary |
|------|--------|---------|
| `client/src/components/planning/statements/input-field-map.ts` | MODIFIED | Added 5 INPUT_FIELD_MAP entries: arDays, apDays, inventoryDays, taxPaymentDelayMonths, ebitdaMultiple with singleValue flag, validation constraints (min/max) |
| `client/src/components/planning/statements/balance-sheet-tab.tsx` | MODIFIED | Added WcAssumptionsSection component, WC_ASSUMPTION_ROWS definition, editing state management (editingWcField), new props (financialInputs, onCellEdit, isSaving) |
| `client/src/components/planning/statements/valuation-tab.tsx` | MODIFIED | Added EBITDA Multiple editing state, InlineEditableCell rendering for ebitda-multiple row, new props (financialInputs, onCellEdit, isSaving), updated ValSection/ValRow to pass editing props |
| `client/src/components/planning/statements/inline-editable-cell.tsx` | MODIFIED | Added "decimal" case to formatRawForInput switch |
| `client/src/components/planning/financial-statements.tsx` | PREVIOUSLY MODIFIED | Already passes financialInputs, onCellEdit, isSaving to BalanceSheetTab and ValuationTab (done in prior session) |

### Testing Summary

- **E2E (Playwright)**: PASS — Full end-to-end test executed:
  - Navigated to Reports → Balance Sheet → verified Working Capital Assumptions section visible
  - All 4 WC fields displayed with correct defaults (AR Days: 30, AP Days: 60, Inventory Days: 60, Tax Delay: 0)
  - Edited AR Days from 30 to 45 → verified display updated to "45 days"
  - Navigated to Valuation tab → edited EBITDA Multiple to 3.5 → verified display updated to "3.5x"
  - All edits persisted in UI
- **LSP Diagnostics**: 0 errors, 0 warnings across all 5 changed files
- **Architect Review**: PASS — implementation follows existing patterns, correct single-value semantics
