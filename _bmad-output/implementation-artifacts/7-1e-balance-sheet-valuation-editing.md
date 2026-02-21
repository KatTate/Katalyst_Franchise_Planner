# Story 7.1e: Balance Sheet & Valuation Inline Editing

Status: ready-for-dev

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

### File List

### Testing Summary
