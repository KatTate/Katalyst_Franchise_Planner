# Story 3.2: Brand Default Integration & Per-Field Metadata

Status: ready-for-dev

## Story

As a franchisee,
I want my plan pre-filled with brand defaults and per-field tracking,
so that I start by refining a reasonable plan rather than building from scratch (FR2).

## Acceptance Criteria

1. **Given** a brand has `brandParameters` and `startupCostTemplate` configured, **when** a new plan is initialized for that brand, **then** every financial input field in the plan's `financial_inputs` JSONB is pre-filled with the brand's default value and wrapped in `FinancialFieldValue` metadata: `{ currentValue, source: 'brand_default', brandDefault, item7Range }`.

2. **Given** a plan is initialized, **when** the plan's `startup_costs` JSONB is populated, **then** it contains `StartupCostLineItem[]` derived from the brand's `startupCostTemplate` — each template item's `default_amount` becomes the line item's `amount`, and `capex_classification` maps from the template's `capex_classification`.

3. **Given** a plan has initialized financial inputs, **when** the `financial_inputs` JSONB is read, **then** every leaf field is a `FinancialFieldValue` object where `brandDefault` preserves the original brand default for reset capability, and `source` is `'brand_default'`.

4. **Given** a plan's stored `financial_inputs` (wrapped in `FinancialFieldValue`), **when** the financial engine needs to run, **then** an `unwrapFinancialInputs()` function extracts `.currentValue` from every field to produce the raw `FinancialInputs` the engine consumes.

5. **Given** a franchisee edits a financial input field, **when** the field value is updated, **then** the field's `source` changes to `'manual'` and `currentValue` is updated, while `brandDefault` remains unchanged.

6. **Given** a franchisee wants to reset a field, **when** the reset action is performed, **then** `currentValue` is restored to `brandDefault` and `source` is set back to `'brand_default'`.

7. **Given** the transform and unwrap functions exist in `shared/`, **when** their import graph is inspected, **then** they import only from other `shared/` files — no `server/`, `client/`, or I/O modules (same purity constraint as the engine).

8. **Given** the initialization produces a `StoredFinancialInputs` and the unwrap produces `FinancialInputs`, **when** the unwrapped output is passed to `calculateProjections()`, **then** the engine runs successfully and produces valid projections with all identity checks passing.

## Dev Notes

### Architecture Patterns to Follow

**Per-Field Metadata Pattern (`FinancialFieldValue` — already defined in `shared/financial-engine.ts`):**
```typescript
export interface FinancialFieldValue {
  currentValue: number;
  source: "brand_default" | "manual" | "ai_populated";
  brandDefault: number | null;
  item7Range: { min: number; max: number } | null;
}
```
This interface is already exported from Story 3.1. Do not redefine it.

**Terminology note:** The epic AC uses `'user_entry'` for franchisee edits. The implementation uses `'manual'` — these mean the same thing. The three source states are `'brand_default'`, `'manual'`, and `'ai_populated'` (Story 6.3).

**`StoredFinancialInputs` — the JSONB-stored version of `FinancialInputs`:**
This interface should live in `shared/plan-defaults.ts` (not in `financial-engine.ts`) since it's a persistence/initialization concern, not a computation concern. It imports `FinancialFieldValue` from the engine.

Mirrors the `FinancialInputs` structure exactly, but every leaf `number` is replaced with `FinancialFieldValue`, and every `[number, number, number, number, number]` tuple is replaced with `[FinancialFieldValue, FinancialFieldValue, FinancialFieldValue, FinancialFieldValue, FinancialFieldValue]`.

Example shape:
```typescript
interface StoredFinancialInputs {
  revenue: {
    annualGrossSales: FinancialFieldValue;
    monthsToReachAuv: FinancialFieldValue;
    startingMonthAuvPct: FinancialFieldValue;
    growthRates: [FinancialFieldValue, FinancialFieldValue, FinancialFieldValue, FinancialFieldValue, FinancialFieldValue];
  };
  operatingCosts: {
    cogsPct: [FinancialFieldValue, FinancialFieldValue, FinancialFieldValue, FinancialFieldValue, FinancialFieldValue];
    // ... same pattern for all per-year arrays
  };
  // ... mirrors all FinancialInputs sections
}
```

**Currency Convention:** Cents as integers (15000 = $150.00). Percentages as decimals (0.065 = 6.5%). Brand parameter currency values (`currencyParam`) store raw dollar amounts — the transform must multiply by 100 to convert to cents.

**JSONB Convention:** Column names are snake_case (`financial_inputs`, `startup_costs`). JSONB content uses camelCase keys (consumed by TypeScript).

**Schema Pattern:** The plans table `financialInputs` column type annotation should change from `.$type<FinancialInputs>()` to `.$type<StoredFinancialInputs>()` since the JSONB stores the wrapped version, not raw engine inputs.

### BrandParameters → FinancialInputs Mapping Table

This is the core mapping the `initializeFinancialInputs()` function must implement. `BrandParameters` uses snake_case keys with `{ value, label, description }` per field. The transform extracts `.value` and converts units.

| BrandParameters field | FinancialInputs field | Transform |
|---|---|---|
| `revenue.monthly_auv.value` | `revenue.annualGrossSales` | `value * 12 * 100` (monthly dollars → annual cents) |
| `revenue.starting_month_auv_pct.value` | `revenue.startingMonthAuvPct` | direct (already decimal) |
| `revenue.year1_growth_rate.value` | `revenue.growthRates[0]` | direct |
| `revenue.year2_growth_rate.value` | `revenue.growthRates[1..4]` | repeat same value for years 2-5 |
| — | `revenue.monthsToReachAuv` | default `6` (no brand param; standard ramp period) |
| `operating_costs.cogs_pct.value` | `operatingCosts.cogsPct[0..4]` | repeat for all 5 years |
| `operating_costs.labor_pct.value` | `operatingCosts.laborPct[0..4]` | repeat for all 5 years |
| `operating_costs.royalty_pct.value` | `operatingCosts.royaltyPct[0..4]` | repeat for all 5 years |
| `operating_costs.ad_fund_pct.value` | `operatingCosts.adFundPct[0..4]` | repeat for all 5 years |
| `operating_costs.marketing_pct.value` | `operatingCosts.marketingPct[0..4]` | repeat for all 5 years |
| `operating_costs.rent_monthly.value` + `utilities_monthly.value` + `insurance_monthly.value` | `operatingCosts.facilitiesAnnual[0..4]` | `(rent + utilities + insurance) * 12 * 100` (aggregate monthly dollars → annual cents), repeat for all 5 years. **Known limitation:** aggregation loses per-component reset granularity — resetting "facilities" restores the aggregate, not individual rent/utilities/insurance. Acceptable for 3.2; future decomposition possible. |
| `operating_costs.other_monthly.value` | `operatingCosts.otherOpexPct[0..4]` | `(other_monthly / monthly_auv)` to approximate as % of revenue; repeat for all 5 years. If `monthly_auv` is 0, default to 0. |
| — | `operatingCosts.payrollTaxPct[0..4]` | default `0` (no brand param; user must configure) |
| — | `operatingCosts.managementSalariesAnnual[0..4]` | default `0` (no brand param; user must configure) |
| `financing.down_payment_pct.value` | `financing.equityPct` | direct |
| `financing.interest_rate.value` | `financing.interestRate` | direct |
| `financing.loan_term_months.value` | `financing.termMonths` | direct |
| (derived from startup costs sum) | `financing.totalInvestment` | sum of all initialized startup cost amounts |
| `startup_capital.depreciation_years.value` | `startup.depreciationRate` | `1 / depreciation_years` (0 if depreciation_years is 0) |
| — | `workingCapitalAssumptions.arDays` | default `0` (no brand param) |
| — | `workingCapitalAssumptions.apDays` | default `0` (no brand param) |
| — | `workingCapitalAssumptions.inventoryDays` | default `0` (no brand param) |
| — | `distributions[0..4]` | default `[0, 0, 0, 0, 0]` (no brand param) |
| — | `taxRate` | default `0` (no brand param; user configures) |

**Note:** `financing.loan_amount` in BrandParameters is informational — the engine derives debt from `totalInvestment * (1 - equityPct)`. The `loan_amount` brand default can populate `brandDefault` on the `totalInvestment` field for display reference but is not used in the calculation.

### StartupCostTemplate → StartupCostLineItem[] Mapping

```
StartupCostItem (template)        → StartupCostLineItem (plan)
─────────────────────────────       ──────────────────────────
name                              → name
default_amount                    → amount (× 100 for cents conversion)
capex_classification              → capexClassification (snake_case → camelCase)
```

The `item7_range_low` / `item7_range_high` from the template are NOT stored on `StartupCostLineItem` (which is engine input). They can be stored on the corresponding `FinancialFieldValue` as `item7Range` if the initialization also creates per-startup-cost metadata, but this is primarily Story 3.3 scope.

### Anti-Patterns & Hard Constraints

- **DO NOT** modify the financial engine's `calculateProjections()` function or any of its internal logic — Story 3.1 is closed
- **DO NOT** put I/O, database calls, or imports from `server/` in the shared transform module
- **DO NOT** create `shared/types.ts` — all interfaces belong in `shared/financial-engine.ts`
- **DO NOT** duplicate the `FinancialFieldValue` interface — it's already exported from `shared/financial-engine.ts`
- **DO NOT** hardcode brand-specific values (PostNet numbers, etc.) — the transform must be brand-agnostic
- **DO NOT** add API routes in this story — API routes come in Story 3.5. This story creates the pure transform functions and storage-level initialization
- **DO NOT** add UI components — UI comes in Epic 4
- **DO NOT** modify `vite.config.ts`, `drizzle.config.ts`, or `package.json` scripts
- **DO NOT** modify files in `client/src/components/ui/` (Shadcn-managed)

### Gotchas & Integration Warnings

- **Brand parameter currency values are in dollars, engine expects cents.** The `currencyParam` schema validates `value: z.number().min(0)` — these are raw dollar amounts (e.g., `5000` = $5,000). The engine expects cents (e.g., `500000`). Always multiply by 100 in the transform.
- **BrandParameters uses snake_case keys** (`monthly_auv`, `cogs_pct`) while `FinancialInputs` uses **camelCase** (`annualGrossSales`, `cogsPct`). The transform is the bridge.
- **BrandParameters has single values; engine expects 5-year arrays.** Most operating cost percentages in BrandParameters are single values but the engine needs `[Y1, Y2, Y3, Y4, Y5]` tuples. The initialization replicates the single value across all 5 years. Only `growthRates` has distinct year1/year2 values.
- **`other_monthly` (currency) → `otherOpexPct` (percentage) mismatch.** The brand parameter is a fixed dollar amount but the engine expects a % of revenue. The initialization must approximate: `otherOpexPct ≈ other_monthly / monthly_auv`. **This is a known lossy approximation** — the percentage is computed against the brand's base AUV, but during revenue ramp (month 1 at ~8% AUV), the effective dollar amount will be far less than the brand intended. Add a prominent code comment explaining this trade-off.
- **`financing.totalInvestment` is derived, not mapped.** It equals the sum of all startup cost line item amounts after initialization. Do not map from `loan_amount`.
- **`startup.depreciationRate` is the inverse of years.** `depreciation_years = 4` → `depreciationRate = 0.25`. Handle `depreciation_years = 0` (no depreciation) → `depreciationRate = 0`.
- **The `financialInputs` JSONB column type must change** from `.$type<FinancialInputs>()` to `.$type<StoredFinancialInputs>()` since the column stores the wrapped version. This is a schema type annotation change only (no DB migration needed).
- **Existing Story 3.1 test fixtures use raw `FinancialInputs`.** The engine tests should continue to work unchanged — the engine still accepts raw `FinancialInputs`. New tests for this story validate the transform/unwrap round-trip.
- **`BrandParameters` may be `null`** on a brand record (column is nullable JSONB). The initialization must handle this — if brand has no parameters configured, the function should throw an error (plan creation requires brand configuration).
- **`startupCostTemplate` may be `null` while `brandParameters` is configured (partial case).** If template is null/empty, initialize with empty startup costs array and set `financing.totalInvestment = 0`. This is a valid state — the franchisee adds costs in Story 3.3.
- **Verify `default_amount` units before applying `× 100` conversion.** The `startupCostItemSchema` validates `default_amount: z.number().min(0)` with no unit annotation. Check existing template seed data to confirm whether values are in dollars or already in cents. Applying `× 100` to values already in cents would inflate by 100x.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `shared/financial-engine.ts` | NO CHANGE | `FinancialFieldValue` already exported — no modifications needed. `StoredFinancialInputs` lives in `plan-defaults.ts` to avoid mixing persistence concerns into the engine. |
| `shared/plan-defaults.ts` | CREATE | Pure transform module: `StoredFinancialInputs` interface, `initializeFinancialInputs(brand, template)`, `unwrapFinancialInputs(stored)`, `initializeStartupCosts(template)`, `updateField(stored, path, value)`, `resetField(stored, path)`. The `updateField`/`resetField` functions should accept a dot-path string (e.g., `"operatingCosts.cogsPct.0"`) to address deeply nested leaves. |
| `shared/plan-defaults.test.ts` | CREATE | Tests: round-trip (initialize → unwrap → engine runs), field update changes source, reset restores default, null brand params handling, currency conversion correctness (`monthly_auv=5000` → `annualGrossSales=6000000`), `depreciation_years=0` → `depreciationRate=0`, growth rate split (year1 vs year2+), 5-year array replication |
| `shared/schema.ts` | MODIFY | Update `financialInputs` column type from `FinancialInputs` to `StoredFinancialInputs` (imported from `shared/plan-defaults.ts`) |
| `server/routes/financial-engine.ts` | NO CHANGE | Remains empty scaffold — API routes come in Story 3.5 |

### Dependencies & Environment Variables

**Packages already installed (DO NOT reinstall):**
- `drizzle-orm`, `drizzle-zod`, `zod` — schema and validation
- `vitest` — testing

**No new packages needed.** The transform functions are pure TypeScript with no external dependencies.

**No new environment variables needed.**

**Database migration:** After updating the `financialInputs` column type annotation in `shared/schema.ts`, no actual DB migration is needed — `.$type<>()` is a TypeScript-only annotation that doesn't affect the database column definition.

### References

- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Decision 15 (Engine Design), Decision 2 (Number Precision), Per-Field Metadata Pattern, Schema Patterns, Number Format Rules
- Epics: `_bmad-output/planning-artifacts/epics.md` — Epic 3 overview, Story 3.2 AC, FR2
- Existing schema: `shared/schema.ts` — `BrandParameters` (line 13-43), `StartupCostItem` (line 45-55), `StartupCostTemplate` (line 57-59), `plans` table (line 139-156)
- Engine interfaces: `shared/financial-engine.ts` — `FinancialFieldValue` (line 25-30), `FinancialInputs` (line 34-91), `StartupCostLineItem` (line 93-97), `EngineInput` (line 99)
- Story 3.1 completion: `_bmad-output/implementation-artifacts/3-1-financial-engine-core-plan-schema.md` — design decisions, file list, lessons learned

## Dev Agent Record

### Agent Model Used

### Completion Notes

### File List
