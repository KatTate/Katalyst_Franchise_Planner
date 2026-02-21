# Story 7.1d: New Field Surfaces — Facilities, Other OpEx, Balance Sheet & Valuation Editing

Status: ready-for-dev

## Story

As a franchisee,
I want to edit Facilities costs as a guided decomposition, see Other OpEx as a percentage, and edit working capital and valuation assumptions inline,
so that my financial model matches the reference spreadsheet's full input set (FR7i, FR7j).

## Acceptance Criteria

**AC-1: Facilities field alignment — Reports surface**

Given the Facilities field alignment is corrected
When viewing Reports inline editing
Then the engine's `facilitiesAnnual[5]` field is exposed directly as "Facilities ($)" per year (matching the reference spreadsheet)
And editing `facilitiesAnnual` in Reports writes directly to the per-year array — it does NOT update the decomposition sub-fields
And the old `rentMonthly`, `utilitiesMonthly`, `insuranceMonthly` fields are no longer displayed

**AC-2: Facilities guided decomposition — Forms surface**

Given I am editing Facilities in Forms mode (My Plan)
When the Facilities section renders
Then guided sub-fields are shown: Rent, Utilities, Telecom/IT, Vehicle Fleet, Insurance — each with per-year (5 column) editing
And the sub-fields roll up into `facilitiesAnnual[year]` (sum of all sub-fields for each year) with the total displayed
And the rollup is computed in the UI — the engine never sees the decomposition

**Facilities decomposition persistence model:** The sub-fields are stored in `PlanFinancialInputs.operatingCosts.facilitiesDecomposition`: `{ rent: FinancialFieldValue[], utilities: FinancialFieldValue[], telecomIt: FinancialFieldValue[], vehicleFleet: FinancialFieldValue[], insurance: FinancialFieldValue[] }` — each a 5-element per-year array. These persist across sessions.

**Facilities source-of-truth resolution:** The decomposition sub-fields are the **authoritative source** for `facilitiesAnnual` when editing in Forms mode. However, Reports mode allows direct editing of `facilitiesAnnual` for users who prefer working with the total directly. When `facilitiesAnnual[year]` differs from the sum of decomposition sub-fields for that year (because the user edited the total directly in Reports), Forms mode shows a warning: "Facilities total was manually adjusted in Reports — decomposition values may not match the current total." The user can then choose:
- **"Re-sync from total"**: Proportionally redistributes the `facilitiesAnnual[year]` value across the existing decomposition sub-fields (maintaining their relative proportions). If all sub-fields are 0, assigns the entire total to Rent.
- **"Keep decomposition"**: Recalculates `facilitiesAnnual[year]` as the sum of sub-fields (overwriting the Reports edit).
This avoids silent data conflicts while keeping both surfaces functional.

**AC-3: Other OpEx unit correction — UI display**

Given Other OpEx is changed from flat dollar amount to % of revenue (data migration handled in Story 7.1a)
When the input displays in both Reports inline editing and Forms mode
Then Other OpEx shows as a percentage field ("Other OpEx %") in both surfaces
And the `unwrapForEngine` translation no longer needs the dollar-to-percentage conversion (it was a known limitation — see `plan-initialization.ts:305-308`)

**AC-4: Balance Sheet tab inline editing for working capital assumptions**

Given I am viewing the Balance Sheet tab in Reports
When the working capital assumption rows are rendered
Then `arDays`, `apDays`, `inventoryDays`, and `taxPaymentDelayMonths` are inline-editable using `InlineEditableCell`
And these are single-value fields (one input, not per-year columns) because they apply uniformly across all years in the engine
And edits save to `PlanFinancialInputs.workingCapitalAndValuation` via the same `PATCH /api/plans/:id` auto-save pattern
And the `INPUT_FIELD_MAP` is extended with entries for these rows (format: `integer`)
And validation prevents negative values for all four fields (minimum: 0)
And validation prevents unreasonable values: `arDays` max 365, `apDays` max 365, `inventoryDays` max 365, `taxPaymentDelayMonths` max 24

**AC-5: Valuation tab inline editing for EBITDA multiple**

Given I am viewing the Valuation tab in Reports
When the EBITDA multiple row is rendered
Then `ebitdaMultiple` is inline-editable using `InlineEditableCell`
And it is a single-value field (one input, not per-year columns)
And the field uses the `"decimal"` format type (added in Story 7.1a) — displayed as a number with 1 decimal place (e.g., "3.5x")
And edits save to `PlanFinancialInputs.workingCapitalAndValuation.ebitdaMultiple`
And the `INPUT_FIELD_MAP` is extended with an entry for this row
And validation prevents negative values and zero (minimum: 0.1)

## Dev Notes

### Navigation

User reaches the features in this story via four surfaces:
- **Facilities (Reports)**: Sidebar → Reports → P&L tab → Facilities row (inline editable per-year cells)
- **Facilities (Forms)**: Sidebar → My Plan → Operating Costs section → Facilities guided decomposition sub-fields
- **Balance Sheet editing**: Sidebar → Reports → Balance Sheet tab → working capital assumption rows (arDays, apDays, inventoryDays, taxPaymentDelayMonths)
- **Valuation editing**: Sidebar → Reports → Valuation tab → EBITDA Multiple row

### Architecture Patterns to Follow

- **FIELD_METADATA registry** _(Architecture — Per-Field Metadata Pattern)_: All new fields and the `"decimal"` FormatType already registered by Story 7.1a. `client/src/lib/field-metadata.ts` defines labels, format types, and categories for all fields.
- **INPUT_FIELD_MAP** _(Architecture — Component Hierarchy)_: Extended by Story 7.1b for P&L rows. This story extends it further for Balance Sheet and Valuation tab rows. Located in `client/src/components/planning/statements/input-field-map.ts`.
- **PerYearEditableRow** _(Architecture — Component Hierarchy)_: Created by Story 7.1b — reuse for Facilities decomposition sub-fields in Forms mode.
- **Two-Surface Principle** _(Architecture — Two-Surface Architecture)_: Forms mode (My Plan) and Reports (inline editing) share the same `financial_inputs` JSONB state. Edits on either surface immediately reflect on the other. This is critical for the Facilities decomposition mismatch logic.
- **Auto-save pattern** _(Architecture — Auto-Save Strategy)_: `PATCH /api/plans/:id` with debounced 2s idle. Both surfaces write to the same `financial_inputs` JSONB column.
- **data-testid convention** _(Architecture — Testing Conventions)_: Financial values use `value-{metric}-{period}`. Interactive elements use `{action}-{target}`.

### Anti-Patterns & Hard Constraints

- **DO NOT modify `components/ui/*`** — shadcn/ui primitives.
- **DO NOT modify `server/index.ts`, `server/vite.ts`, `server/static.ts`**.
- **DO NOT create new API endpoints**.
- **DO NOT introduce new npm packages**.
- **DO NOT write `facilitiesAnnual` directly from the Forms decomposition save path** — the Forms surface computes the rollup (`facilitiesAnnual[year] = sum of sub-fields`) and writes both the decomposition AND the computed `facilitiesAnnual` in a single save operation. Do not trigger a separate save for `facilitiesAnnual` that could race with the decomposition save.

### Gotchas & Integration Warnings

- **Forms mode decomposition rollup**: Facilities sub-fields must roll up per-year independently. The rollup computation is: `facilitiesAnnual[year] = rent[year] + utilities[year] + telecomIt[year] + vehicleFleet[year] + insurance[year]`.
- **Mismatch detection**: Compare `facilitiesAnnual[year]` (stored) vs. sum of decomposition sub-fields for each year. If any year mismatches, show the warning in Forms mode.
- **Proportional redistribution**: When re-syncing from total, calculate each sub-field's proportion of the old sum, then multiply by the new total. Handle edge case where old sum is 0 (assign all to Rent).
- **BrandParameters**: May not have new decomposition sub-fields (telecomIt, vehicleFleet). Default to `[0,0,0,0,0]`.

### UI/UX Deliverables

- **Reports → P&L tab**: Facilities row uses `PerYearEditableRow` (from 7.1b) exposing `facilitiesAnnual` as 5 per-year inline editable cells. Old `rentMonthly`, `utilitiesMonthly`, `insuranceMonthly` rows removed from display. Other OpEx row relabeled to "Other OpEx %" with percentage input format.
- **Forms → My Plan → Operating Costs section**: New Facilities guided decomposition sub-section with 5 sub-field rows (Rent, Utilities, Telecom/IT, Vehicle Fleet, Insurance), each using per-year (5 column) editing via `PerYearEditableRow`. A computed "Facilities Total" display row shows the rollup. Mismatch warning banner appears when `facilitiesAnnual` diverges from decomposition sum, with two action buttons: "Re-sync from total" and "Keep decomposition".
- **Reports → Balance Sheet tab**: Four new inline editable cells for `arDays`, `apDays`, `inventoryDays`, `taxPaymentDelayMonths` — each single-value, integer format, using `InlineEditableCell`.
- **Reports → Valuation tab**: One new inline editable cell for `ebitdaMultiple` — single-value, decimal format with "x" suffix display (e.g., "3.5x"), using `InlineEditableCell`.

### UI States

- **Loading / auto-save**: While auto-save is persisting an edit, show the existing save indicator pattern (debounced 2s idle). No additional loading state needed for individual cell edits.
- **Validation error**: When the user enters an invalid value (e.g., `arDays` > 365, `ebitdaMultiple` < 0.1, negative values), the cell shows an inline validation error and rejects the input. The previous valid value is preserved.
- **Save failure**: If `PATCH /api/plans/:id` fails during save, show inline retry per the architecture's error handling pattern — never silently drop changes. For decomposition save failures, revert the sub-field edit and show an error toast.
- **Mismatch warning (Facilities)**: When Forms mode detects `facilitiesAnnual[year]` differs from the sum of decomposition sub-fields for any year, display a warning banner above the Facilities decomposition section. The banner contains descriptive text and two action buttons ("Re-sync from total", "Keep decomposition"). After the user resolves the mismatch, the warning banner disappears.
- **Success**: On successful save, cells update in place. No additional success toast needed — the visual update and save indicator are sufficient confirmation. After "Re-sync from total" or "Keep decomposition", the values update and the mismatch warning disappears.
- **Empty state**: N/A — all fields always have a value (defaulted from brand parameters or migration in Story 7.1a).

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/components/planning/forms-mode.tsx` | MODIFY | Add Facilities guided decomposition section with rollup display, mismatch warning, and re-sync/keep-decomposition actions. |
| `client/src/components/planning/statements/input-field-map.ts` | MODIFY | Extend `INPUT_FIELD_MAP` for Balance Sheet (arDays, apDays, inventoryDays, taxPaymentDelayMonths) and Valuation (ebitdaMultiple) rows. |
| `client/src/components/planning/statements/balance-sheet-tab.tsx` | MODIFY | Add inline editable cells for arDays, apDays, inventoryDays, taxPaymentDelayMonths (single-value, integer format). Add validation (min 0, max constraints). |
| `client/src/components/planning/statements/valuation-tab.tsx` | MODIFY | Add inline editable cell for ebitdaMultiple (single-value, decimal format). Add validation (min 0.1). |

### Testing Expectations

- **Test file**: `e2e/story-7-1d-new-field-surfaces.spec.ts` (follows existing `e2e/story-*.spec.ts` naming convention)
- **E2E tests (Playwright)**:
  - **Facilities (Reports)**: Edit `facilitiesAnnual` Year 2 → confirm value saved, other years unchanged
  - **Facilities (Forms)**: Edit Rent Year 1 → confirm `facilitiesAnnual` total updates → confirm Utilities/etc. unchanged
  - **Facilities mismatch**: Edit `facilitiesAnnual` in Reports → switch to Forms → confirm mismatch warning displayed → test "Re-sync from total" and "Keep decomposition" actions
  - **Other OpEx**: Verify displayed as percentage in both Reports and Forms
  - **Balance Sheet (AC-4)**: Edit arDays → confirm saved. Enter negative value → confirm rejected. Enter 400 → confirm rejected (max 365).
  - **Balance Sheet**: Edit apDays, inventoryDays, taxPaymentDelayMonths → confirm saved with validation
  - **Valuation (AC-5)**: Edit ebitdaMultiple → confirm displayed as "3.5x" format. Enter 0 → confirm rejected (min 0.1). Enter -1 → confirm rejected.
  - **Cross-surface**: Edit arDays in Balance Sheet → confirm reflected in Forms (if displayed there)

### References

- **PRD Requirements**: FR7i (per-year independent input editing), FR7j (full input assumption set — reference spreadsheet field coverage)
- **Architecture Document**: `_bmad-output/planning-artifacts/architecture.md`
  - Per-Field Metadata Pattern — field structure within `financial_inputs` JSONB, `FIELD_METADATA` registry
  - Component Hierarchy — `<BalanceSheetTab />`, `<ValuationTab />` with `InlineEditableCell`; `<FormsMode />` with collapsible sections
  - Two-Surface Architecture — My Plan (forms) and Reports (inline editing) share the same `financial_inputs` state; critical for Facilities decomposition mismatch resolution
  - Auto-Save Strategy — debounced save, inline retry on failure
  - Testing Conventions — `data-testid` patterns for financial values and interactive elements
- **Epics Document**: `_bmad-output/planning-artifacts/epics.md` — Epic 7, Story 7.1d (line 1962)
- **Predecessor Stories**:
  - Story 7.1a registered all new fields, `FIELD_METADATA` entries, `"decimal"` FormatType, `facilitiesDecomposition` data model, and working capital/valuation fields
  - Story 7.1b created `PerYearEditableRow` component and extended `INPUT_FIELD_MAP` for P&L rows
  - Story 7.1c established Forms per-year layout patterns and new form sections

### Dependencies

- **Depends on**: Story 7.1a (Data Model), Story 7.1b (PerYearEditableRow component), Story 7.1c (Forms per-year layout)
- **Implementation order**: This story should be implemented last in the 7.1 series

### Completion Notes

### File List

### Testing Summary
