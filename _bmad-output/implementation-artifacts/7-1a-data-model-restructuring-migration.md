# Story 7.1a: Data Model Restructuring & Migration

Status: done

## Story

As a franchisee,
I want the system's data model to support different values for each year (Year 1 through Year 5) for my financial assumptions,
So that per-year input editing (Stories 7.1b–7.1e) can be built on a stable foundation without data loss (FR7i).

## Acceptance Criteria

**AC-1: PlanFinancialInputs restructured to per-year arrays**

Given the `PlanFinancialInputs` interface in `shared/financial-engine.ts`
When per-year fields are stored
Then the following per-year fields use 5-element `FinancialFieldValue[]` arrays, organized by category:

*Revenue (1 per-year field):*
- `growthRates[5]` (replaces `year1GrowthRate` + `year2GrowthRate`)

*Operating Costs (9 per-year fields + 1 nested decomposition):*
- `royaltyPct[5]`, `adFundPct[5]`, `cogsPct[5]`, `laborPct[5]`
- `facilitiesAnnual[5]` (replaces `rentMonthly` + `utilitiesMonthly` + `insuranceMonthly`)
- `facilitiesDecomposition`: `{ rent: FinancialFieldValue[], utilities: FinancialFieldValue[], telecomIt: FinancialFieldValue[], vehicleFleet: FinancialFieldValue[], insurance: FinancialFieldValue[] }` — each a 5-element per-year array. Stores the component breakdown behind `facilitiesAnnual`. Used by Forms mode (Story 7.1d) for guided editing; Reports mode edits `facilitiesAnnual` directly.
- `marketingPct[5]`, `managementSalariesAnnual[5]` (new), `payrollTaxPct[5]` (new), `otherOpexPct[5]` (replaces `otherMonthly` as dollar amount)

*Profitability & Distributions (new category):*
- `targetPreTaxProfitPct[5]` (new, per-year percentage)
- `shareholderSalaryAdj[5]` (new, per-year currency in cents)
- `distributions[5]` (new, per-year currency in cents)
- `nonCapexInvestment[5]` (new, per-year currency in cents)

*Working Capital & Valuation (new category):*
- `arDays` (single value, integer)
- `apDays` (single value, integer)
- `inventoryDays` (single value, integer)
- `taxPaymentDelayMonths` (single value, integer)
- `ebitdaMultiple` (single value, decimal)

*Unchanged categories:*
- `financing` (loanAmount, interestRate, loanTermMonths, downPaymentPct) — remains single-value fields
- `startupCapital` (workingCapitalMonths, depreciationYears) — remains single-value fields

Note: `monthlyAuv` and `startingMonthAuvPct` intentionally remain single-value fields. Revenue variation across years is modeled via `growthRates`, not by changing the base AUV. This is consistent with the engine's design where `annualGrossSales` is derived from `monthlyAuv * 12` as a Year 1 base.

**AC-2: Existing plan migration is lossless and transactionally safe**

Given existing plans store single-value `FinancialFieldValue` fields
When the migration runs
Then current single values are broadcast into 5-element arrays (e.g., `cogsPct: {currentValue: 0.35}` → `cogsPct: [{currentValue: 0.35}, ...(×5)]`)
And the `growthRates` migration merges two separate fields: `year1GrowthRate` maps to index 0, `year2GrowthRate` maps to indices 1–4 (preserving the current `[year1Growth, year2Growth, year2Growth, year2Growth, year2Growth]` broadcast behavior)
And the `facilitiesAnnual` migration bakes in the current 3% escalation: `facilitiesAnnual[0]` = `(rentMonthly + utilitiesMonthly + insuranceMonthly) * 12`, `facilitiesAnnual[n]` = `facilitiesAnnual[0] * 1.03^n`
And the `facilitiesDecomposition` migration populates: `rent` from `rentMonthly * 12` (with 3% escalation baked in per year), `utilities` from `utilitiesMonthly * 12` (same), `insurance` from `insuranceMonthly * 12` (same), `telecomIt` and `vehicleFleet` default to `[0,0,0,0,0]` (new fields)
And the `otherOpexPct` migration converts `otherMonthly` (cents) to a percentage using `(otherMonthly * 12) / (monthlyAuv * 12)` as the revenue basis. If `monthlyAuv` is 0, use `DEFAULT_OTHER_OPEX_PCT` as fallback. If result > 1.0, cap at 1.0 (known lossy conversion — acceptable for nonsensical inputs).
And new fields not present in old plans receive sensible defaults: `managementSalariesAnnual` = `[0,0,0,0,0]`, `payrollTaxPct` = `fill5(DEFAULT_PAYROLL_TAX_PCT)`, `targetPreTaxProfitPct` = `fill5(0)`, `shareholderSalaryAdj` = `[0,0,0,0,0]`, `distributions` = `[0,0,0,0,0]`, `nonCapexInvestment` = `[0,0,0,0,0]`, `arDays` = `DEFAULT_AR_DAYS`, `apDays` = `DEFAULT_AP_DAYS`, `inventoryDays` = `DEFAULT_INVENTORY_DAYS`, `taxPaymentDelayMonths` = `0`, `ebitdaMultiple` = `3.0`
And the migration is semantically identical — no behavioral change for existing plans
And plans continue to produce identical engine output before and after migration (verified by unit tests)
And migration is transactionally safe — partial failure rolls back entirely, plan remains in original format, failure logged with plan ID and error details
And migration is idempotent — running on an already-migrated plan produces no changes
And migration performs a one-time write-back — old-format plan is migrated and persisted on first load

**AC-3: unwrapForEngine translation layer updated**

Given the `PlanFinancialInputs` → `FinancialInputs` translation layer in `shared/plan-initialization.ts`
When `unwrapForEngine` processes the new per-year structure
Then it passes per-year arrays directly to the engine instead of broadcasting single values via `fill5()`
And the facilities calculation no longer sums `rentMonthly + utilitiesMonthly + insuranceMonthly` with 3% escalation — it passes `facilitiesAnnual` arrays directly
And new fields (`managementSalariesAnnual`, `payrollTaxPct`, `targetPreTaxProfitPct`, `shareholderSalaryAdj`, `distributions`, `ebitdaMultiple`, `arDays`, `apDays`, `inventoryDays`, `taxPaymentDelayMonths`, `nonCapexInvestment`) are mapped from `PlanFinancialInputs` to `FinancialInputs`
And hardcoded defaults are replaced by user-editable values

**AC-4: Scenario and sensitivity engines updated for new structure**

Given `client/src/lib/scenario-engine.ts` and `client/src/lib/sensitivity-engine.ts` consume `PlanFinancialInputs`
When the data model changes
Then the sensitivity engine applies the same percentage multiplier to each of the 5 per-year base values independently (e.g., if `cogsPct` base is `[0.30, 0.28, 0.27, 0.26, 0.25]` and multiplier is 1.10, result is `[0.33, 0.308, 0.297, 0.286, 0.275]`). One multiplier applies across all years for a given field — NOT 5 independent multiplier sliders.
And the scenario engine requires no separate migration (computes on-the-fly from plan's `PlanFinancialInputs` via `unwrapForEngine()`, no stored snapshots)
And the `cloneFinancialInputs` helper in both engines handles all new optional fields
And the existing 5 sensitivity sliders (revenue, cogs, labor, marketing, facilities) remain unchanged — new fields do NOT receive sensitivity sliders in this story

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

- **FinancialFieldValue wrapper**: Every user-editable field uses the `FinancialFieldValue` interface (`shared/financial-engine.ts:25-32`). Per-year fields become arrays of 5 `FinancialFieldValue` objects, not arrays of raw numbers. This wrapper carries `source` (brand-default / manual / ai) and `lastModifiedAt` metadata for attribution tracking.
- **PlanFinancialInputs → FinancialInputs pipeline**: `buildPlanFinancialInputs()` creates the JSONB-stored structure from brand parameters. `unwrapForEngine()` extracts raw values for the engine. Both functions live in `shared/plan-initialization.ts`. This two-step pipeline is the core data flow — any new field must participate in both.
- **Currency in cents**: All currency amounts stored as cents (integers). `dollarsToCents()` / `centsToDollars()` for conversion. See `shared/financial-engine.ts:10`.
- **Percentages as decimals**: Stored as decimals (0.065 = 6.5%). UI displays with `(value * 100).toFixed(1)%`.
- **Auto-save pattern**: Both surfaces (My Plan and Reports) write to the same `financial_inputs` JSONB column via `PATCH /api/plans/:id`. Debounced at 2s idle. Changes on one surface immediately reflect on the other (FR97).
- **Schema in shared/schema.ts**: The `plans` table JSONB column is typed: `jsonb("financial_inputs").$type<PlanFinancialInputs>()`. Update the type to match the new structure.
- **Vitest test conventions**: `globals: false` — always import `{ describe, it, expect, vi, beforeEach }` from `"vitest"` explicitly. Test files in `shared/**/*.test.ts` scope.

### Anti-Patterns & Hard Constraints

- **DO NOT modify `shared/financial-engine.ts` engine computation logic** — the engine's `calculateProjections()` function already accepts per-year arrays via `FinancialInputs`. Only the `PlanFinancialInputs` interface and `unwrapForEngine` translation need changes.
- **DO NOT modify `components/ui/*`** — these are shadcn/ui primitives and must never be manually edited.
- **DO NOT modify `server/index.ts`, `server/vite.ts`, `server/static.ts`** — infrastructure files.
- **DO NOT create new API endpoints** — the existing `PATCH /api/plans/:id` with `financial_inputs` JSONB handles all input updates. No new routes needed for this story.
- **DO NOT break the `EngineInput` / `FinancialInputs` interface** — the engine's input contract (`shared/financial-engine.ts:70-134`) must remain unchanged. This story changes what feeds INTO that interface, not the interface itself.
- **DO NOT introduce new npm packages** — all required components already exist in the project.
- **DO NOT use `require()`** — ESM only throughout the project (`import`/`export`).

### Gotchas & Integration Warnings

**Note:** Line numbers referenced below are approximate and may shift due to interim commits — use function names and surrounding comments to locate code sections.

- **`fill5()` usage audit**: `shared/plan-initialization.ts` defines `fill5()` which broadcasts a single value to 5 years. After this story, most calls to `fill5()` in `unwrapForEngine()` should be removed. Verify each one is replaced with the actual per-year array extraction.
- **`otherMonthly` → `otherOpexPct` conversion**: `unwrapForEngine` converts `otherMonthly` (dollars) to `otherOpexPct` (percentage of revenue). After this story, `otherOpexPct` is stored directly as a per-year percentage, eliminating this conversion entirely. Known limitation: capping at 1.0 is a one-way lossy conversion for nonsensical inputs where `monthlyAuv` is very small.
- **Facilities field compound calculation**: `unwrapForEngine` sums `rentMonthly + utilitiesMonthly + insuranceMonthly` and applies 3% escalation via `RENT_ESCALATION_RATE`. After this story, `facilitiesAnnual` is stored directly as 5 per-year values. The escalation is no longer automatic — users set each year's value independently.
- **`year1GrowthRate` / `year2GrowthRate` consolidation**: `PlanFinancialInputs` has separate fields for year 1 and year 2 growth rates. In `unwrapForEngine`, year 2 growth is broadcast to years 2-5: `[year1Growth, year2Growth, year2Growth, year2Growth, year2Growth]`. After this story, a single `growthRates[5]` per-year array replaces both fields.
- **Migration timing**: Migration runs on first plan load (detect old format → migrate → write-back). Must handle plans already in the new format (idempotent).
- **`buildPlanFinancialInputs` changes**: This function (`shared/plan-initialization.ts`) creates the default `PlanFinancialInputs` from `BrandParameters`. It needs to create 5-element `FinancialFieldValue` arrays for per-year fields and add new fields (managementSalaries, payrollTaxPct, etc.) with appropriate brand defaults.
- **BrandParameters may not have all new fields**: `BrandParameters` in `shared/financial-engine.ts` may not define brand defaults for all new fields (managementSalaries, targetPreTaxProfitPct, etc.). Use sensible fallback defaults (0 for currencies, engine constants for percentages).
- **Test data impact**: `shared/plan-initialization.test.ts` has extensive tests for `buildPlanFinancialInputs` and `unwrapForEngine`. These tests must be updated to reflect the new per-year array structure. The reference validation tests in `shared/financial-engine-reference.test.ts` must continue passing unchanged.
- **Sensitivity engine per-year multiplier semantics**: One multiplier per field, applied to all 5 year values independently. Do NOT create 5 separate slider knobs per field. The existing slider infrastructure remains — just update how the multiplier is applied to per-year arrays.
- **`cloneFinancialInputs` deep clone**: Both `scenario-engine.ts` and `sensitivity-engine.ts` have a `cloneFinancialInputs` helper that deep-clones `PlanFinancialInputs`. These must handle the new per-year array structure and all new optional fields without losing data.
- **JSONB type safety**: `.$type<PlanFinancialInputs>()` on Drizzle JSONB columns is compile-time only. Runtime migration detection determines format by checking whether fields are arrays vs single objects.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `shared/financial-engine.ts` | MODIFY | Update `PlanFinancialInputs` interface to use per-year `FinancialFieldValue[]` arrays. Add new field groups (profitabilityAndDistributions, workingCapitalAndValuation). Add `facilitiesDecomposition` to operatingCosts. Do NOT modify `FinancialInputs`, `EngineInput`, or `calculateProjections`. |
| `shared/plan-initialization.ts` | MODIFY | Rewrite `buildPlanFinancialInputs()` for per-year arrays. Rewrite `unwrapForEngine()` to extract per-year values directly. Add `migratePlanFinancialInputs()` function for old → new format conversion. Remove `fill5()` calls for per-year fields. |
| `shared/plan-initialization.test.ts` | MODIFY | Update all existing tests, add migration tests (standard, corrupt data, idempotency, partial failure, otherOpexPct sanity cap, facilitiesDecomposition population), add per-year array extraction tests, add new field default tests. Verify engine output identity for migrated data. |
| `shared/schema.ts` | MODIFY | Update `$type<PlanFinancialInputs>()` annotation (auto-follows interface change). |
| `server/storage.ts` | MODIFY | Add migration-on-read with write-back in `getPlan()` — detect old format, migrate, persist migrated version. Wrap in transaction for safety. |
| `client/src/lib/field-metadata.ts` | MODIFY | Add `FIELD_METADATA` entries for all new fields. Add `"decimal"` to `FormatType` union. Add new categories to `CATEGORY_LABELS` and `CATEGORY_ORDER`. Add `formatFieldValue`, `parseFieldInput`, `getInputPlaceholder` cases for `"decimal"`. |
| `client/src/lib/sensitivity-engine.ts` | MODIFY | Update sensitivity multipliers to apply same multiplier across all 5 per-year base values independently. |
| `client/src/lib/scenario-engine.ts` | MODIFY | Verify `cloneFinancialInputs` compiles with new `PlanFinancialInputs` structure. No migration needed — scenarios compute on-the-fly. |

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
- **Server storage migration tests**: `getPlan()` detects old-format plan, migrates, writes back migrated version, and returns it. Second `getPlan()` call returns already-migrated plan without re-running migration (idempotency at DB layer). Failed migration rolls back transactionally — plan remains in old format. Migration failures are logged with plan ID and error details.

### Dependencies

- **Depends on**: Nothing (this is the foundation story for Epic 7)
- **Blocks**: Story 7.1b (Reports Per-Year Editing), Story 7.1c (Forms Per-Year Layout), Story 7.1d (New Field Surfaces), Story 7.1e (Balance Sheet & Valuation Editing)
- **No new packages required**: All dependencies already installed.
- **No new environment variables**: No external services consumed by this story.

### References

- **Epics**: `_bmad-output/planning-artifacts/epics.md` — Epic 7, Story 7.1a (line ~1928)
- **Architecture**: `_bmad-output/planning-artifacts/architecture.md` — Two-Surface Architecture (line ~73), PlanFinancialInputs pipeline, JSONB storage pattern
- **Project Context**: `_bmad-output/project-context.md` — Currency/percentage conventions, FinancialFieldValue wrapper, unwrapForEngine pipeline, testing rules
- **Original comprehensive story file**: `_bmad-output/implementation-artifacts/7-1-per-year-input-columns.md` — contains full implementation details, completion notes, and revenue drill-down enhancement (which is a later addition beyond this story's core scope)
- **Epic 7 Retrospective**: `_bmad-output/implementation-artifacts/epic-7-retrospective.md` — documents that 7.1a skipped formal adversarial code review (flagged as process violation), 686 unit tests compensated

## Completion Notes

**Implementation completed.** 686 unit tests passing (Vitest).

### What was built (7.1a core scope):
- PlanFinancialInputs restructured to per-year FinancialFieldValue[] arrays for all applicable fields (13 per-year + 5 single-value)
- `migratePlanFinancialInputs()` handles old→new format with transactional safety, idempotency, and lossless conversion
- `unwrapForEngine()` updated to pass per-year arrays directly to engine instead of `fill5()` broadcasting
- `buildPlanFinancialInputs()` creates per-year arrays from brand parameters for new plans
- FIELD_METADATA extended with all new fields, `"decimal"` FormatType added for `ebitdaMultiple`
- Sensitivity engine updated to apply multipliers across all 5 per-year values independently
- Scenario engine verified — computes on-the-fly from PlanFinancialInputs, no migration needed
- `cloneFinancialInputs` updated in both engines to handle new structure

### Revenue Drill-Down Enhancement (completed 2026-02-21, bundled with 7.1a):
- Merged separate "Monthly Revenue" and "Annual Revenue" P&L rows into single editable "Revenue" row
- Added `storedGranularity` field to `InputFieldMapping` interface for currency vs percentage aggregation handling
- Added `getDrillLevelFromColKey` and `scaleForStorage` helper functions for reverse-computation
- Design decision: percentage fields use `getRawValue` at all drill levels; currency fields with `storedGranularity` use `getCellValue` from engine
- Additional files modified: `client/src/components/planning/statements/input-field-map.ts`, `client/src/components/planning/statements/pnl-tab.tsx`

### Process notes from retrospective:
- Skipped formal adversarial code review — relied on 686 unit tests. Flagged in Epic 7 retrospective as process violation. Every adversarial review that ran on other Epic 7 stories found real functional bugs (100% hit rate). Mandatory adversarial review for all stories adopted as process rule going forward (AI-E7-4).
- Foundation story design decisions propagated to all 5 downstream stories cleanly with zero rework — validates the foundation-first architecture approach.

### Testing Summary

- **686 unit tests passing** (Vitest) covering:
  - Migration: standard, corrupt data, idempotency, otherOpexPct cap, facilitiesDecomposition
  - Per-year array extraction via unwrapForEngine
  - New field defaults
  - Engine output identity (pre-migration vs post-migration)
  - Sensitivity multiplier per-year application
  - Reference validation tests unchanged and passing
