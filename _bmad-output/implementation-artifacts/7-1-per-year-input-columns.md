# Story 7.1: Per-Year Input Columns

Status: ready-for-dev

## Story

As a franchisee,
I want to set different values for each year (Year 1 through Year 5) for my financial assumptions,
so that I can model realistic growth trajectories instead of flat projections across all 5 years (FR7i).

## Acceptance Criteria

**AC-1: PlanFinancialInputs restructured to per-year arrays**

Given the `PlanFinancialInputs` interface in `shared/financial-engine.ts`
When per-year fields are stored
Then the following per-year fields use 5-element `FinancialFieldValue[]` arrays, organized by category:

*Revenue (1 per-year field):*
- `growthRates[5]` (replaces `year1GrowthRate` + `year2GrowthRate`)

*Operating Costs (9 per-year fields):*
- `royaltyPct[5]`, `adFundPct[5]`, `cogsPct[5]`, `laborPct[5]`
- `facilitiesAnnual[5]` (replaces `rentMonthly` + `utilitiesMonthly` + `insuranceMonthly`)
- `marketingPct[5]`, `managementSalariesAnnual[5]` (new), `payrollTaxPct[5]` (new), `otherOpexPct[5]` (replaces `otherMonthly` as dollar amount)

*Profitability & Distributions (new category in `PlanFinancialInputs`):*
- `targetPreTaxProfitPct[5]` (new, per-year percentage)
- `shareholderSalaryAdj[5]` (new, per-year currency in cents)
- `distributions[5]` (new, per-year currency in cents)
- `nonCapexInvestment[5]` (new, per-year currency in cents)

*Working Capital & Valuation (new category in `PlanFinancialInputs`):*
- `arDays` (single value, integer)
- `apDays` (single value, integer)
- `inventoryDays` (single value, integer)
- `taxPaymentDelayMonths` (single value, integer)
- `ebitdaMultiple` (single value, decimal — see FormatType note below)

Note: `monthlyAuv` and `startingMonthAuvPct` intentionally remain single-value fields. Revenue variation across years is modeled via `growthRates`, not by changing the base AUV. This is consistent with the engine's design where `annualGrossSales` is derived from `monthlyAuv * 12` as a Year 1 base.

**AC-2: Existing plan migration is lossless**

Given existing plans store single-value `FinancialFieldValue` fields
When the migration runs
Then current single values are broadcast into 5-element arrays (e.g., `cogsPct: {currentValue: 0.35}` → `cogsPct: [{currentValue: 0.35}, {currentValue: 0.35}, {currentValue: 0.35}, {currentValue: 0.35}, {currentValue: 0.35}]`)
And the `growthRates` migration merges two separate fields: `year1GrowthRate` maps to index 0, `year2GrowthRate` maps to indices 1–4 (preserving the current `[year1Growth, year2Growth, year2Growth, year2Growth, year2Growth]` broadcast behavior)
And the `facilitiesAnnual` migration bakes in the current 3% escalation: `facilitiesAnnual[0]` = `(rentMonthly + utilitiesMonthly + insuranceMonthly) * 12`, `facilitiesAnnual[1]` = `facilitiesAnnual[0] * 1.03`, ..., `facilitiesAnnual[4]` = `facilitiesAnnual[0] * 1.03^4` — reproducing the exact values that `unwrapForEngine` currently computes
And the `otherOpexPct` migration converts `otherMonthly` (cents) to a percentage using `(otherMonthly * 12) / (monthlyAuv * 12)` as the revenue basis (i.e., `monthlyAuv * 12` before any growth is applied — matching the current `unwrapForEngine` behavior at line 311-312), then broadcasts that percentage to all 5 years
And new fields not present in old plans receive sensible defaults: `managementSalariesAnnual` = `[0,0,0,0,0]`, `payrollTaxPct` = `fill5(DEFAULT_PAYROLL_TAX_PCT)`, `targetPreTaxProfitPct` = `fill5(0)`, `shareholderSalaryAdj` = `[0,0,0,0,0]`, `distributions` = `[0,0,0,0,0]`, `nonCapexInvestment` = `[0,0,0,0,0]`, `arDays` = `DEFAULT_AR_DAYS`, `apDays` = `DEFAULT_AP_DAYS`, `inventoryDays` = `DEFAULT_INVENTORY_DAYS`, `taxPaymentDelayMonths` = `0`, `ebitdaMultiple` = `3.0`
And the migration is semantically identical — no data loss, no behavioral change for existing plans
And plans continue to produce identical engine output before and after migration (verified by unit tests comparing pre- and post-migration engine output)

**AC-3: Reports inline editing supports independent per-year values**

Given I am editing inputs via Reports inline editing (Financial Statement tabs)
When I edit a value in a specific year column
Then only that year's value changes — other years retain their independent values
And the linked-column broadcast behavior from Story 5.2 is removed (editing one year no longer updates all years)
And the link icons in column headers and the 200ms flash animation on non-edited columns are removed
And a "Copy Year 1 to all years" action is available for users who want to broadcast a single value
And clicking "Copy Year 1 to all years" shows a confirmation prompt ("This will overwrite Years 2–5 with Year 1's value. Continue?") before executing, to prevent accidental data loss

**AC-4: Forms mode (My Plan) shows 5 input columns per per-year field**

Given I am editing inputs in Forms mode (My Plan)
When the form renders per-year fields
Then each per-year field shows 5 input columns labeled Year 1 through Year 5
And by default, Year 2-5 inherit Year 1's value with a visual indicator (link icon, lighter text) showing they are inherited
And editing Year 2-5 breaks the inheritance for that specific year — the value becomes independent
And a "Reset to Year 1" action is available per cell to re-establish inheritance
And single-value fields (arDays, apDays, inventoryDays, taxPaymentDelayMonths, ebitdaMultiple) show a single input column (not 5)

**Inheritance model (cross-surface reconciliation):** Inheritance is a UI-only concept in Forms mode — it is NOT stored in the JSONB. When Year 2-5 "inherit" Year 1, they are stored as actual `FinancialFieldValue` objects with their own `currentValue` matching Year 1's value. When Year 1 changes in Forms mode and other years are still in "inherited" state, those years update to match. The "inherited" state is determined at render time by comparing: if `year[n].currentValue === year[0].currentValue && year[n].source === year[0].source`, show as inherited. Editing Year 2-5 in either Reports or Forms always writes an independent value. This means Reports mode never needs to know about inheritance — it always sees 5 independent values.

**AC-5: Facilities field alignment**

Given the Facilities field alignment is corrected
When the input structure is updated
Then the engine's single `facilitiesAnnual[5]` field is exposed directly in Reports inline editing as "Facilities ($)" per year (matching the reference spreadsheet)
And in Forms mode (My Plan), the guided decomposition (Rent, Utilities, Telecom/IT, Vehicle Fleet, Insurance) rolls up into `facilitiesAnnual[year]` with per-year support
And the old `rentMonthly`, `utilitiesMonthly`, `insuranceMonthly` fields are replaced by the consolidated structure

**Facilities decomposition persistence model:** The sub-fields (Rent, Utilities, Telecom/IT, Vehicle Fleet, Insurance) are stored in a new `facilitiesDecomposition` property within `PlanFinancialInputs.operatingCosts`. Structure: `facilitiesDecomposition: { rent: FinancialFieldValue[], utilities: FinancialFieldValue[], telecomIt: FinancialFieldValue[], vehicleFleet: FinancialFieldValue[], insurance: FinancialFieldValue[] }` — each a 5-element per-year array. These sub-values persist across sessions and roll up to `facilitiesAnnual[year]` in Forms mode (sum of all sub-fields for that year). In Reports inline editing, only `facilitiesAnnual` is editable — editing it does NOT update the decomposition (it overwrites the rolled-up value). Migration populates: `rent` from old `rentMonthly * 12` (broadcast to 5 years with 3% escalation baked in), `utilities` from old `utilitiesMonthly * 12` (same escalation), `insurance` from old `insuranceMonthly * 12` (same escalation), `telecomIt` and `vehicleFleet` default to `[0,0,0,0,0]` (new fields with no legacy data). `BrandParameters` may not have these new sub-fields — use `0` as the default.

**AC-6: Other OpEx unit correction**

Given Other OpEx is changed from flat dollar amount to % of revenue
When the input displays in both Reports inline editing and Forms mode
Then Other OpEx shows as a percentage field ("Other OpEx %") in both surfaces
And migration converts existing dollar values (`otherMonthly` in cents) to equivalent percentages using the formula: `otherOpexPct = (otherMonthly * 12) / (monthlyAuv * 12)` — using pre-growth annual revenue as the basis (matching the current `unwrapForEngine` behavior). The resulting percentage is broadcast to all 5 years. If `monthlyAuv` is 0, use `DEFAULT_OTHER_OPEX_PCT` as the fallback.
And the `unwrapForEngine` translation no longer needs the dollar-to-percentage conversion (it was a known limitation — see `plan-initialization.ts:305-308`)

**AC-7: unwrapForEngine translation layer updated**

Given the `PlanFinancialInputs` → `FinancialInputs` translation layer in `shared/plan-initialization.ts`
When `unwrapForEngine` processes the new per-year structure
Then it passes per-year arrays directly to the engine instead of broadcasting single values via `fill5()`
And the facilities calculation no longer sums `rentMonthly + utilitiesMonthly + insuranceMonthly` with 3% escalation — it passes `facilitiesAnnual` arrays directly
And new fields (`managementSalariesAnnual`, `payrollTaxPct`, `targetPreTaxProfitPct`, `shareholderSalaryAdj`, `distributions`, `ebitdaMultiple`, `arDays`, `apDays`, `inventoryDays`, `taxPaymentDelayMonths`, `nonCapexInvestment`) are mapped from `PlanFinancialInputs` to `FinancialInputs`
And hardcoded defaults (e.g., `managementSalariesAnnual: [0,0,0,0,0]`, `payrollTaxPct: fill5(DEFAULT_PAYROLL_TAX_PCT)`, `arDays: DEFAULT_AR_DAYS`) are replaced by user-editable values

**AC-8: Balance Sheet tab inline editing for working capital assumptions**

Given I am viewing the Balance Sheet tab in Reports
When the working capital assumption rows are rendered
Then `arDays`, `apDays`, `inventoryDays`, and `taxPaymentDelayMonths` are inline-editable using `InlineEditableCell`
And these are single-value fields (one input, not per-year columns) because they apply uniformly across all years in the engine
And edits save to `PlanFinancialInputs.workingCapitalAndValuation` via the same `PATCH /api/plans/:id` auto-save pattern
And the `INPUT_FIELD_MAP` is extended with entries for these rows (format: `integer`)

**AC-9: Valuation tab inline editing for EBITDA multiple**

Given I am viewing the Valuation tab in Reports
When the EBITDA multiple row is rendered
Then `ebitdaMultiple` is inline-editable using `InlineEditableCell`
And it is a single-value field (one input, not per-year columns)
And the field uses the new `"decimal"` format type (see FormatType note below) — displayed as a number with 1 decimal place (e.g., "3.5x")
And edits save to `PlanFinancialInputs.workingCapitalAndValuation.ebitdaMultiple`
And the `INPUT_FIELD_MAP` is extended with an entry for this row

## Dev Notes

### Architecture Patterns to Follow

- **FinancialFieldValue wrapper**: Every user-editable field uses the `FinancialFieldValue` interface (`shared/financial-engine.ts:25-32`). Per-year fields become arrays of 5 `FinancialFieldValue` objects, not arrays of raw numbers.
- **PlanFinancialInputs → FinancialInputs pipeline**: `buildPlanFinancialInputs()` creates the JSONB-stored structure from brand parameters. `unwrapForEngine()` extracts raw values for the engine. Both functions live in `shared/plan-initialization.ts`.
- **Currency in cents**: All currency amounts stored as cents (integers). `dollarsToCents()` / `centsToDollars()` for conversion. See `shared/financial-engine.ts:10`.
- **Percentages as decimals**: Stored as decimals (0.065 = 6.5%). UI displays with `(value * 100).toFixed(1)%`.
- **Auto-save pattern**: Both surfaces (My Plan and Reports) write to the same `financial_inputs` JSONB column via `PATCH /api/plans/:id`. Debounced at 2s idle. Changes on one surface immediately reflect on the other (FR97).
- **FIELD_METADATA registry**: `client/src/lib/field-metadata.ts` defines labels, format types for all fields. Must be extended for new fields. New categories `profitabilityAndDistributions` and `workingCapitalAndValuation` must be added to `CATEGORY_LABELS` and `CATEGORY_ORDER`.
- **INPUT_FIELD_MAP**: `client/src/components/planning/statements/input-field-map.ts` maps P&L row keys to `PlanFinancialInputs` paths for inline editing. Must be extended for new editable rows.
- **FormatType extension**: The current `FormatType` union is `"currency" | "percentage" | "integer"`. This story requires adding `"decimal"` to support `ebitdaMultiple` (number with 1 decimal place, e.g., "3.5x"). Add to `field-metadata.ts`: `formatFieldValue` for `"decimal"` should return `value.toFixed(1)`, `parseFieldInput` for `"decimal"` should parse as float without rounding (unlike `"integer"` which calls `Math.round`), and `getInputPlaceholder` for `"decimal"` should return `"0.0"`.
- **data-testid convention**: Financial values use `value-{metric}-{period}` pattern. Interactive elements use `{action}-{target}`.
- **Component file naming**: kebab-case (`per-year-input.tsx`). Component names PascalCase (`PerYearInput`).
- **Schema in shared/schema.ts**: The `plans` table JSONB column is typed: `jsonb("financial_inputs").$type<PlanFinancialInputs>()`. Update the type to match the new structure.

### UI/UX Deliverables

**Reports Inline Editing (Post-Epic-7 behavior):**
- Per-year input cells are independently editable — no linked-column broadcast
- Link icons in column headers removed
- Flash animation on non-edited columns removed
- New "Copy Year 1 to all years" action available (button or context menu near the input row, not a column header feature)
- All existing P&L editable rows (`monthly-revenue`, `cogs-pct`, `dl-pct`, `marketing`, `other-opex`) become per-year editable
- New editable rows added: `facilities`, `management-salaries`, `payroll-tax-pct`, `royalty-pct`, `ad-fund-pct`
- `other-opex` changes from currency input to percentage input

**Forms Mode (My Plan) per-year layout:**
- Per-year fields render 5 input columns: Year 1 | Year 2 | Year 3 | Year 4 | Year 5
- Default state: Year 2-5 inherit Year 1's value (visual indicator: lighter text, link icon, or dashed border)
- Editing Year 2-5 breaks inheritance for that cell only — value becomes independent (regular text weight, no link icon)
- "Reset to Year 1" affordance per cell to re-establish inheritance
- Single-value fields (arDays, apDays, inventoryDays, taxPaymentDelayMonths, ebitdaMultiple) show one input column
- Facilities section shows guided decomposition (Rent, Utilities, Telecom/IT, Vehicle Fleet, Insurance) that rolls up to `facilitiesAnnual[year]`

**New fields surfaced in UI:**
- Management Salaries (annual, per-year, currency)
- Payroll Tax & Benefits % (per-year, percentage)
- Target Pre-Tax Profit % (per-year, percentage)
- Shareholder Salary Adjustment (per-year, currency)
- Distributions (per-year, currency)
- EBITDA Multiple (single value, number with 1 decimal)
- AR Days (single value, integer)
- AP Days (single value, integer)
- Inventory Days (single value, integer)
- Tax Payment Delay Months (single value, integer)
- Non-CapEx Investment (per-year, currency)

### Anti-Patterns & Hard Constraints

- **DO NOT modify `shared/financial-engine.ts` engine computation logic** — the engine's `calculateProjections()` function already accepts per-year arrays via `FinancialInputs`. Only the `PlanFinancialInputs` interface and `unwrapForEngine` translation need changes.
- **DO NOT modify `components/ui/*`** — these are shadcn/ui primitives and must never be manually edited.
- **DO NOT modify `server/index.ts`, `server/vite.ts`, `server/static.ts`** — infrastructure files.
- **DO NOT create new API endpoints** — the existing `PATCH /api/plans/:id` with `financial_inputs` JSONB handles all input updates. No new routes needed.
- **DO NOT add `if (mode === 'quick-entry')` conditionals** — the two-surface architecture means Reports inline editing is always editable. No mode toggles.
- **DO NOT use `fill5()` for fields that now have per-year input** — the whole point of this story is to stop broadcasting single values. `fill5()` should only remain for fields that genuinely use a single value across all years (if any).
- **DO NOT break the `EngineInput` / `FinancialInputs` interface** — the engine's input contract (`shared/financial-engine.ts:70-134`) must remain unchanged. This story changes what feeds INTO that interface, not the interface itself.
- **DO NOT duplicate existing code** — `InlineEditableCell` already handles single-cell editing. Extend it or compose with it for per-year cells, don't create a parallel component.
- **DO NOT introduce new npm packages** — all required UI components (Input, Collapsible, Tooltip, etc.) already exist in the project.

### Gotchas & Integration Warnings

- **`fill5()` usage audit**: `shared/plan-initialization.ts:413-414` defines `fill5()` which broadcasts a single value to 5 years. After this story, most calls to `fill5()` in `unwrapForEngine()` should be removed. Verify each one is replaced with the actual per-year array extraction.
- **`otherMonthly` → `otherOpexPct` conversion**: Currently `unwrapForEngine` (line 305-314) converts `otherMonthly` (dollars) to `otherOpexPct` (percentage of revenue). After this story, `otherOpexPct` is stored directly as a per-year percentage, eliminating this conversion entirely. The KNOWN LIMITATION comment on line 306-308 becomes obsolete.
- **Facilities field compound calculation**: Currently `unwrapForEngine` (line 291-303) sums `rentMonthly + utilitiesMonthly + insuranceMonthly` and applies 3% escalation via `RENT_ESCALATION_RATE`. After this story, `facilitiesAnnual` is stored directly as 5 per-year values. The escalation is no longer automatic — users set each year's value independently (or inherit from Year 1).
- **Forms mode decomposition rollup**: In Forms mode, Facilities has guided sub-fields (Rent, Utilities, etc.). These must roll up to the `facilitiesAnnual[year]` value for each year independently. The rollup is UI-only — the engine never sees the decomposition.
- **`year1GrowthRate` / `year2GrowthRate` consolidation**: Currently `PlanFinancialInputs` has separate fields for year 1 and year 2 growth rates. In `unwrapForEngine` (line 336), year 2 growth is broadcast to years 2-5: `[year1Growth, year2Growth, year2Growth, year2Growth, year2Growth]`. After this story, a single `growthRates[5]` per-year array replaces both fields.
- **Migration timing**: Migration must run when the server starts or when a plan is first loaded. Existing plans in the database have the old single-value structure. The migration should be robust — it must handle plans already in the new format (idempotent).
- **Scenario engine impact**: `client/src/lib/scenario-engine.ts` and `client/src/lib/sensitivity-engine.ts` call `unwrapForEngine` or produce `FinancialInputs` directly. Both must be updated for the new `PlanFinancialInputs` structure:
  - **Sensitivity engine**: Applies the same percentage multiplier to each of the 5 per-year base values independently (e.g., if `cogsPct` base is `[0.30, 0.28, 0.27, 0.26, 0.25]` and multiplier is 1.10, result is `[0.33, 0.308, 0.297, 0.286, 0.275]`). There are NOT 5 independent multiplier sliders per field — one multiplier applies across all years for a given field.
  - **Scenario engine**: If scenarios store snapshots of `PlanFinancialInputs`, existing scenario snapshots will be in the old single-value format. The migration function must also be applied to scenario snapshots (or scenarios must be re-generated). Verify whether scenario data is stored separately or references the plan's `financial_inputs`.
- **`buildPlanFinancialInputs` changes**: This function (`shared/plan-initialization.ts:85-118`) creates the default `PlanFinancialInputs` from `BrandParameters`. It needs to create 5-element `FinancialFieldValue` arrays for per-year fields and add new fields (managementSalaries, payrollTaxPct, etc.) with appropriate brand defaults.
- **BrandParameters may not have all new fields**: `BrandParameters` in `shared/financial-engine.ts` may not define brand defaults for all new fields (managementSalaries, targetPreTaxProfitPct, etc.). Use sensible fallback defaults (0 for currencies, engine constants for percentages).
- **Inline editing cell targeting**: Currently `INPUT_FIELD_MAP` maps row keys to single `PlanFinancialInputs` paths. With per-year editing, the column index must also be passed to identify which year's value is being edited. The `onCellEdit` callback will need to accept a year index parameter.
- **Flash animation removal**: `animate-flash-linked` CSS class in `inline-editable-cell.tsx:92` and the `flashingRows` state management in `pnl-tab.tsx:403-434` implement the linked-column broadcast animation. Remove this code entirely — it's obsolete when columns are independent.
- **Test data impact**: `shared/plan-initialization.test.ts` has extensive tests for `buildPlanFinancialInputs` and `unwrapForEngine`. These tests must be updated to reflect the new per-year array structure. The reference validation tests in `shared/financial-engine-reference.test.ts` must continue passing unchanged.
- **Forms mode decomposition persistence**: The `facilitiesDecomposition` sub-fields are stored in `PlanFinancialInputs.operatingCosts.facilitiesDecomposition` (see AC-5 persistence model). The rollup to `facilitiesAnnual[year]` happens in Forms mode UI — it sums all sub-fields for each year. If a user edits `facilitiesAnnual` directly in Reports, the decomposition sub-values are NOT updated — the direct edit overrides the rollup. Next time the user opens Forms mode, they will see a mismatch indicator ("Facilities total has been manually adjusted in Reports") and can choose to re-sync.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `shared/financial-engine.ts` | MODIFY | Update `PlanFinancialInputs` interface to use per-year `FinancialFieldValue[]` arrays. Add new field groups. Do NOT modify `FinancialInputs`, `EngineInput`, or `calculateProjections`. |
| `shared/plan-initialization.ts` | MODIFY | Rewrite `buildPlanFinancialInputs()` for per-year arrays. Rewrite `unwrapForEngine()` to extract per-year values directly. Add migration function for old → new format. Remove `fill5()` calls for per-year fields. |
| `shared/plan-initialization.test.ts` | MODIFY | Update all tests for new `PlanFinancialInputs` structure. Add migration tests. Verify engine output remains identical for migrated data. |
| `shared/schema.ts` | MODIFY | Update `$type<PlanFinancialInputs>()` annotation (auto-follows interface change). |
| `server/storage.ts` | MODIFY | Add migration logic in `getPlan()` or plan retrieval path — detect old format and migrate on read. |
| `client/src/lib/field-metadata.ts` | MODIFY | Add `FIELD_METADATA` entries for all new fields. Add `"decimal"` to `FormatType` union. Add `profitabilityAndDistributions` and `workingCapitalAndValuation` to `CATEGORY_LABELS` and `CATEGORY_ORDER`. Add `formatFieldValue`, `parseFieldInput`, and `getInputPlaceholder` cases for `"decimal"`. |
| `client/src/components/planning/statements/input-field-map.ts` | MODIFY | Extend `INPUT_FIELD_MAP` with new editable rows (facilities, management-salaries, payroll-tax-pct, royalty-pct, ad-fund-pct). Update `other-opex` from currency to percentage format. |
| `client/src/components/planning/statements/pnl-tab.tsx` | MODIFY | Remove linked-column flash behavior (`flashingRows`, `animate-flash-linked`). Update `handleCommitEdit` to pass year index. Add "Copy Year 1 to all" action. |
| `client/src/components/planning/statements/inline-editable-cell.tsx` | MODIFY | Remove `isFlashing` prop and `animate-flash-linked` class (linked columns removed). |
| `client/src/components/planning/forms-mode.tsx` | MODIFY | Add per-year input rendering (5 columns per per-year field). Add inheritance behavior (Year 2-5 inherit Year 1). Add "Reset to Year 1" affordance. Add new field sections. |
| `client/src/components/planning/input-panel.tsx` | MODIFY | Update to pass new fields to `FormsMode`. |
| `client/src/hooks/use-field-editing.ts` | MODIFY | Update field editing hook to handle per-year array updates (year index parameter). |
| `client/src/lib/sensitivity-engine.ts` | MODIFY | Update sensitivity multipliers to apply same multiplier across all 5 per-year base values independently. Verify works with new `PlanFinancialInputs` structure. |
| `client/src/lib/scenario-engine.ts` | MODIFY | Update for new `PlanFinancialInputs` structure. Apply migration to any stored scenario snapshots in old format. |
| `client/src/components/planning/statements/balance-sheet-tab.tsx` | MODIFY | Add inline editable cells for arDays, apDays, inventoryDays, taxPaymentDelayMonths (single-value, integer format). See AC-8. |
| `client/src/components/planning/statements/valuation-tab.tsx` | MODIFY | Add inline editable cell for ebitdaMultiple (single-value, decimal format). See AC-9. |

### Testing Expectations

- **Unit tests (Vitest)**: `shared/plan-initialization.test.ts` — update all existing tests, add tests for migration, per-year array extraction, new field defaults. Test that engine output is identical for migrated vs. pre-migration data.
- **Reference validation tests**: `shared/financial-engine-reference.test.ts` — must continue passing unchanged. These validate engine accuracy against the reference spreadsheet.
- **Engine tests**: `shared/financial-engine.test.ts` — should pass unchanged (engine interface is not changing).
- **E2E tests (Playwright)**: Verify Reports inline editing works per-year (edit Year 3, confirm Year 1 unchanged). Verify Forms mode per-year layout. Verify "Copy Year 1 to all" action with confirmation dialog. Verify migration (load existing plan, confirm values preserved). Verify Balance Sheet tab inline editing for arDays, apDays, inventoryDays, taxPaymentDelayMonths (AC-8). Verify Valuation tab inline editing for ebitdaMultiple (AC-9). Test data setup: seed a plan with old-format `PlanFinancialInputs` (single-value fields) before migration tests — use `buildPlanFinancialInputs()` from the pre-migration codebase to create the fixture.
- **Critical ACs for automated coverage**: AC-2 (migration lossless — compare engine output pre/post), AC-3 (independent per-year editing), AC-5 (facilities decomposition persistence), AC-7 (unwrapForEngine correctness), AC-8 (balance sheet editing), AC-9 (valuation editing).

### Dependencies & Environment Variables

- **No new packages required** — all UI components exist in the project.
- **No new environment variables** — no new external services.
- **Database migration**: Run `npx drizzle-kit push` after schema changes (the JSONB column type doesn't change, but the TypeScript interface does).
- **Existing packages already present (DO NOT reinstall)**: React 18.3, Vite 7.3, Drizzle ORM 0.39, shadcn/ui, TanStack React Query 5.60, Recharts 2.15, Wouter 3.3.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 7, Story 7.1] — Full AC and dev notes from epics file
- [Source: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-02-15.md` — CP-3] — PlanFinancialInputs restructuring requirements
- [Source: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` — Part 10, lines 758-805] — Pre-Epic-7 vs Post-Epic-7 behavior, per-year editing UX
- [Source: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` — Part 8, lines 518-569] — My Plan (Forms mode) layout and interaction
- [Source: `_bmad-output/planning-artifacts/prd.md` — FR7i, FR7j] — Per-year input requirements
- [Source: `shared/financial-engine.ts:37-65`] — Current `PlanFinancialInputs` interface
- [Source: `shared/financial-engine.ts:70-134`] — `FinancialInputs` engine interface (DO NOT modify)
- [Source: `shared/plan-initialization.ts:85-118`] — `buildPlanFinancialInputs()` function
- [Source: `shared/plan-initialization.ts:271-368`] — `unwrapForEngine()` function
- [Source: `client/src/components/planning/statements/input-field-map.ts`] — P&L inline editing field mappings
- [Source: `client/src/lib/field-metadata.ts`] — Field metadata registry

## Dev Agent Record

### Agent Model Used

### Completion Notes

### File List

### Testing Summary
