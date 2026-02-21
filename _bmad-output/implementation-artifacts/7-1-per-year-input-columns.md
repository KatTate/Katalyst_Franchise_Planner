# Story 7.1a: Data Model Restructuring & Migration

Status: ready-for-dev

## Story

As a franchisee,
I want the system's data model to support different values for each year (Year 1 through Year 5) for my financial assumptions,
so that per-year input editing (Stories 7.1b–7.1d) can be built on a stable foundation without data loss (FR7i).

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

**AC-2: Existing plan migration is lossless and transactionally safe**

Given existing plans store single-value `FinancialFieldValue` fields
When the migration runs
Then current single values are broadcast into 5-element arrays (e.g., `cogsPct: {currentValue: 0.35}` → `cogsPct: [{currentValue: 0.35}, {currentValue: 0.35}, {currentValue: 0.35}, {currentValue: 0.35}, {currentValue: 0.35}]`)
And the `growthRates` migration merges two separate fields: `year1GrowthRate` maps to index 0, `year2GrowthRate` maps to indices 1–4 (preserving the current `[year1Growth, year2Growth, year2Growth, year2Growth, year2Growth]` broadcast behavior)
And the `facilitiesAnnual` migration bakes in the current 3% escalation: `facilitiesAnnual[0]` = `(rentMonthly + utilitiesMonthly + insuranceMonthly) * 12`, `facilitiesAnnual[1]` = `facilitiesAnnual[0] * 1.03`, ..., `facilitiesAnnual[4]` = `facilitiesAnnual[0] * 1.03^4` — reproducing the exact values that `unwrapForEngine` currently computes
And the `facilitiesDecomposition` migration populates: `rent` from old `rentMonthly * 12` (broadcast to 5 years with 3% escalation baked in), `utilities` from old `utilitiesMonthly * 12` (same escalation), `insurance` from old `insuranceMonthly * 12` (same escalation), `telecomIt` and `vehicleFleet` default to `[0,0,0,0,0]` (new fields with no legacy data)
And the `otherOpexPct` migration converts `otherMonthly` (cents) to a percentage using `(otherMonthly * 12) / (monthlyAuv * 12)` as the revenue basis (i.e., `monthlyAuv * 12` before any growth is applied — matching the current `unwrapForEngine` behavior at line 311-312), then broadcasts that percentage to all 5 years. If `monthlyAuv` is 0, use `DEFAULT_OTHER_OPEX_PCT` as the fallback. If `monthlyAuv` is very small (resulting in `otherOpexPct > 1.0`), cap at `1.0` (100%) to prevent nonsensical percentages.
And new fields not present in old plans receive sensible defaults: `managementSalariesAnnual` = `[0,0,0,0,0]`, `payrollTaxPct` = `fill5(DEFAULT_PAYROLL_TAX_PCT)`, `targetPreTaxProfitPct` = `fill5(0)`, `shareholderSalaryAdj` = `[0,0,0,0,0]`, `distributions` = `[0,0,0,0,0]`, `nonCapexInvestment` = `[0,0,0,0,0]`, `arDays` = `DEFAULT_AR_DAYS`, `apDays` = `DEFAULT_AP_DAYS`, `inventoryDays` = `DEFAULT_INVENTORY_DAYS`, `taxPaymentDelayMonths` = `0`, `ebitdaMultiple` = `3.0`
And the migration is semantically identical — no data loss, no behavioral change for existing plans
And plans continue to produce identical engine output before and after migration (verified by unit tests comparing pre- and post-migration engine output)
And migration is **transactionally safe** — if migration fails partway through a plan's fields, the entire plan migration is rolled back and the plan remains in its original format (no half-migrated state). Migration failures are logged with the plan ID and error details.
And migration is **idempotent** — running migration on an already-migrated plan produces no changes
And migration performs a **one-time write-back** — when a plan in old format is first loaded, it is migrated and the migrated version is persisted back to the database, so subsequent loads do not repeat the migration

**AC-3: unwrapForEngine translation layer updated**

Given the `PlanFinancialInputs` → `FinancialInputs` translation layer in `shared/plan-initialization.ts`
When `unwrapForEngine` processes the new per-year structure
Then it passes per-year arrays directly to the engine instead of broadcasting single values via `fill5()`
And the facilities calculation no longer sums `rentMonthly + utilitiesMonthly + insuranceMonthly` with 3% escalation — it passes `facilitiesAnnual` arrays directly
And new fields (`managementSalariesAnnual`, `payrollTaxPct`, `targetPreTaxProfitPct`, `shareholderSalaryAdj`, `distributions`, `ebitdaMultiple`, `arDays`, `apDays`, `inventoryDays`, `taxPaymentDelayMonths`, `nonCapexInvestment`) are mapped from `PlanFinancialInputs` to `FinancialInputs`
And hardcoded defaults (e.g., `managementSalariesAnnual: [0,0,0,0,0]`, `payrollTaxPct: fill5(DEFAULT_PAYROLL_TAX_PCT)`, `arDays: DEFAULT_AR_DAYS`) are replaced by user-editable values

**AC-4: Scenario and sensitivity engines updated for new structure**

Given `client/src/lib/scenario-engine.ts` and `client/src/lib/sensitivity-engine.ts` consume `PlanFinancialInputs`
When the data model changes
Then the sensitivity engine applies the same percentage multiplier to each of the 5 per-year base values independently (e.g., if `cogsPct` base is `[0.30, 0.28, 0.27, 0.26, 0.25]` and multiplier is 1.10, result is `[0.33, 0.308, 0.297, 0.286, 0.275]`). There are NOT 5 independent multiplier sliders per field — one multiplier applies across all years for a given field.
And the scenario engine applies the migration function to any stored scenario snapshots in old single-value format before processing. **Resolution: Scenario snapshots reference the plan's `financial_inputs` JSONB — they do NOT store independent copies. Therefore, migrating the plan's `financial_inputs` automatically updates scenario baselines. If this assumption is incorrect (discovered during implementation), scenario snapshots must each be migrated individually using the same migration function.**

**AC-5: FIELD_METADATA and FormatType extended for new fields**

Given the `client/src/lib/field-metadata.ts` registry
When new fields are added
Then `FIELD_METADATA` entries are added for all new fields (managementSalariesAnnual, payrollTaxPct, targetPreTaxProfitPct, shareholderSalaryAdj, distributions, nonCapexInvestment, arDays, apDays, inventoryDays, taxPaymentDelayMonths, ebitdaMultiple)
And `"decimal"` is added to the `FormatType` union to support `ebitdaMultiple` (number with 1 decimal place, e.g., "3.5x")
And `formatFieldValue` for `"decimal"` returns `value.toFixed(1)`
And `parseFieldInput` for `"decimal"` parses as float without rounding (unlike `"integer"` which calls `Math.round`)
And `getInputPlaceholder` for `"decimal"` returns `"0.0"`
And new categories `profitabilityAndDistributions` and `workingCapitalAndValuation` are added to `CATEGORY_LABELS` and `CATEGORY_ORDER`

## Dev Notes

### Architecture Patterns to Follow

- **FinancialFieldValue wrapper**: Every user-editable field uses the `FinancialFieldValue` interface (`shared/financial-engine.ts:25-32`). Per-year fields become arrays of 5 `FinancialFieldValue` objects, not arrays of raw numbers.
- **PlanFinancialInputs → FinancialInputs pipeline**: `buildPlanFinancialInputs()` creates the JSONB-stored structure from brand parameters. `unwrapForEngine()` extracts raw values for the engine. Both functions live in `shared/plan-initialization.ts`.
- **Currency in cents**: All currency amounts stored as cents (integers). `dollarsToCents()` / `centsToDollars()` for conversion. See `shared/financial-engine.ts:10`.
- **Percentages as decimals**: Stored as decimals (0.065 = 6.5%). UI displays with `(value * 100).toFixed(1)%`.
- **Auto-save pattern**: Both surfaces (My Plan and Reports) write to the same `financial_inputs` JSONB column via `PATCH /api/plans/:id`. Debounced at 2s idle. Changes on one surface immediately reflect on the other (FR97).
- **Schema in shared/schema.ts**: The `plans` table JSONB column is typed: `jsonb("financial_inputs").$type<PlanFinancialInputs>()`. Update the type to match the new structure.

### Anti-Patterns & Hard Constraints

- **DO NOT modify `shared/financial-engine.ts` engine computation logic** — the engine's `calculateProjections()` function already accepts per-year arrays via `FinancialInputs`. Only the `PlanFinancialInputs` interface and `unwrapForEngine` translation need changes.
- **DO NOT modify `components/ui/*`** — these are shadcn/ui primitives and must never be manually edited.
- **DO NOT modify `server/index.ts`, `server/vite.ts`, `server/static.ts`** — infrastructure files.
- **DO NOT create new API endpoints** — the existing `PATCH /api/plans/:id` with `financial_inputs` JSONB handles all input updates. No new routes needed.
- **DO NOT break the `EngineInput` / `FinancialInputs` interface** — the engine's input contract (`shared/financial-engine.ts:70-134`) must remain unchanged. This story changes what feeds INTO that interface, not the interface itself.
- **DO NOT introduce new npm packages** — all required components already exist in the project.

### Gotchas & Integration Warnings

- **`fill5()` usage audit**: `shared/plan-initialization.ts:413-414` defines `fill5()` which broadcasts a single value to 5 years. After this story, most calls to `fill5()` in `unwrapForEngine()` should be removed. Verify each one is replaced with the actual per-year array extraction.
- **`otherMonthly` → `otherOpexPct` conversion**: Currently `unwrapForEngine` (line 305-314) converts `otherMonthly` (dollars) to `otherOpexPct` (percentage of revenue). After this story, `otherOpexPct` is stored directly as a per-year percentage, eliminating this conversion entirely. The KNOWN LIMITATION comment on line 306-308 becomes obsolete.
- **Facilities field compound calculation**: Currently `unwrapForEngine` (line 291-303) sums `rentMonthly + utilitiesMonthly + insuranceMonthly` and applies 3% escalation via `RENT_ESCALATION_RATE`. After this story, `facilitiesAnnual` is stored directly as 5 per-year values. The escalation is no longer automatic — users set each year's value independently.
- **`year1GrowthRate` / `year2GrowthRate` consolidation**: Currently `PlanFinancialInputs` has separate fields for year 1 and year 2 growth rates. In `unwrapForEngine` (line 336), year 2 growth is broadcast to years 2-5: `[year1Growth, year2Growth, year2Growth, year2Growth, year2Growth]`. After this story, a single `growthRates[5]` per-year array replaces both fields.
- **Migration timing**: Migration runs on first plan load (detect old format → migrate → write-back). Must handle plans already in the new format (idempotent).
- **`buildPlanFinancialInputs` changes**: This function (`shared/plan-initialization.ts:85-118`) creates the default `PlanFinancialInputs` from `BrandParameters`. It needs to create 5-element `FinancialFieldValue` arrays for per-year fields and add new fields (managementSalaries, payrollTaxPct, etc.) with appropriate brand defaults.
- **BrandParameters may not have all new fields**: `BrandParameters` in `shared/financial-engine.ts` may not define brand defaults for all new fields (managementSalaries, targetPreTaxProfitPct, etc.). Use sensible fallback defaults (0 for currencies, engine constants for percentages).
- **Test data impact**: `shared/plan-initialization.test.ts` has extensive tests for `buildPlanFinancialInputs` and `unwrapForEngine`. These tests must be updated to reflect the new per-year array structure. The reference validation tests in `shared/financial-engine-reference.test.ts` must continue passing unchanged.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `shared/financial-engine.ts` | MODIFY | Update `PlanFinancialInputs` interface to use per-year `FinancialFieldValue[]` arrays. Add new field groups (profitabilityAndDistributions, workingCapitalAndValuation). Add `facilitiesDecomposition` to operatingCosts. Do NOT modify `FinancialInputs`, `EngineInput`, or `calculateProjections`. |
| `shared/plan-initialization.ts` | MODIFY | Rewrite `buildPlanFinancialInputs()` for per-year arrays. Rewrite `unwrapForEngine()` to extract per-year values directly. Add `migratePlanFinancialInputs()` function for old → new format. Remove `fill5()` calls for per-year fields. |
| `shared/plan-initialization.test.ts` | MODIFY | Update all existing tests, add migration tests (including corrupt data, idempotency, partial failure), add per-year array extraction tests, add new field default tests. Verify engine output identical for migrated data. |
| `shared/schema.ts` | MODIFY | Update `$type<PlanFinancialInputs>()` annotation (auto-follows interface change). |
| `server/storage.ts` | MODIFY | Add migration-on-read with write-back in `getPlan()` — detect old format, migrate, persist migrated version. Wrap in transaction for safety. |
| `client/src/lib/field-metadata.ts` | MODIFY | Add `FIELD_METADATA` entries for all new fields. Add `"decimal"` to `FormatType` union. Add new categories to `CATEGORY_LABELS` and `CATEGORY_ORDER`. Add `formatFieldValue`, `parseFieldInput`, `getInputPlaceholder` cases for `"decimal"`. |
| `client/src/lib/sensitivity-engine.ts` | MODIFY | Update sensitivity multipliers to apply same multiplier across all 5 per-year base values independently. |
| `client/src/lib/scenario-engine.ts` | MODIFY | Update for new `PlanFinancialInputs` structure. Apply migration to any stored scenario snapshots in old format if they exist independently. |

### Testing Expectations

- **Unit tests (Vitest)**: `shared/plan-initialization.test.ts` — update all existing tests, add tests for:
  - Migration: standard old-format → new-format conversion
  - Migration: corrupt data handling (missing fields, wrong types, null values)
  - Migration: idempotency (migrate already-migrated plan → no changes)
  - Migration: `otherOpexPct` sanity cap when `monthlyAuv` is very small
  - Migration: `facilitiesDecomposition` population from old rent/utilities/insurance fields
  - Per-year array extraction via `unwrapForEngine`
  - New field defaults (all new fields have correct initial values)
  - Engine output identity: pre-migration and post-migration data produce identical `calculateProjections()` output
- **Reference validation tests**: `shared/financial-engine-reference.test.ts` — must continue passing unchanged.
- **Engine tests**: `shared/financial-engine.test.ts` — should pass unchanged (engine interface is not changing).
- **Sensitivity engine tests**: Verify multipliers apply correctly to per-year arrays (not just single values).

### Dependencies

- **Depends on**: Nothing (this is the foundation story)
- **Blocks**: Story 7.1b (Reports Per-Year Editing), Story 7.1c (Forms Per-Year Layout), Story 7.1d (New Field Surfaces)

### Completion Notes

### File List

### Testing Summary
