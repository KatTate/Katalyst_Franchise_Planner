# Story 3.2: Brand Default Integration & Per-Field Metadata

Status: in-progress

## Story

As a franchisee,
I want my plan pre-filled with brand defaults and per-field tracking,
so that I start by refining a reasonable plan rather than building from scratch (FR2).

## Acceptance Criteria

1. **Given** a franchisee creates a new plan for their brand, **when** the plan is initialized, **then** every financial input field is pre-filled with the brand's default value, **and** each field in the JSONB `financial_inputs` has metadata: `{ currentValue, source: 'brand_default', brandDefault, item7Range, lastModifiedAt, isCustom: false }`.

2. **Given** a plan is initialized with brand defaults, **when** the plan's startup costs are set, **then** the brand's startup cost template is mapped to `StartupCostLineItem[]` with amounts converted to cents and classifications preserved.

3. **Given** a plan has `PlanFinancialInputs` (wrapped with metadata), **when** those inputs need to be passed to the financial engine, **then** an unwrap function extracts raw numeric values and produces a valid `EngineInput` that the engine can compute projections from.

4. **Given** a franchisee edits a financial input value, **when** the field is updated, **then** the field's `source` changes to `'user_entry'`, `lastModifiedAt` is updated, and `isCustom` becomes `true`, **and** the original `brandDefault` value is preserved for reset capability.

5. **Given** a franchisee wants to reset a field, **when** the reset function is called, **then** the field's `currentValue` reverts to `brandDefault`, `source` changes back to `'brand_default'`, and `isCustom` becomes `false`.

6. **Given** any `PlanFinancialInputs` produced by the initialization function, **when** unwrapped and passed to `calculateProjections()`, **then** the engine produces valid results with all identity checks passing — confirming the bridge between brand params and engine inputs is correct.

7. **Given** brand parameters with known values (e.g., PostNet reference data), **when** the initialization function creates plan inputs and the unwrap function produces engine inputs, **then** the engine output matches previously validated PostNet reference results within tolerance.

## Dev Notes

### Architecture Patterns to Follow

**New Interfaces (shared/financial-engine.ts):**
- Update `FinancialFieldValue` to add `lastModifiedAt: string | null` and `isCustom: boolean` fields, and change `"manual"` source to `"user_entry"` per AC requirements.
- Add `PlanFinancialInputs` interface — mirrors brand parameter categories with camelCase keys, each field wrapped in `FinancialFieldValue`. This is the JSONB persistence type for `plans.financial_inputs`.
- `PlanFinancialInputs` structure mirrors `BrandParameters` categories: `revenue`, `operatingCosts`, `financing`, `startupCapital`.

**New Module (shared/plan-initialization.ts):**
- `buildPlanFinancialInputs(brandParams: BrandParameters): PlanFinancialInputs` — maps brand parameters to plan financial inputs with metadata. Currency values from brand params (stored as dollars) are converted to cents. Each field gets `source: 'brand_default'`, `isCustom: false`.
- `buildPlanStartupCosts(template: StartupCostTemplate): StartupCostLineItem[]` — maps brand startup cost template items to engine-compatible line items with amounts converted to cents.
- `unwrapForEngine(planInputs: PlanFinancialInputs, startupCosts: StartupCostLineItem[]): EngineInput` — extracts raw values from wrapped fields, expands single values into per-year arrays where needed, performs unit conversions (e.g., `monthlyAuv * 12` → `annualGrossSales`).
- `updateFieldValue(field: FinancialFieldValue, newValue: number, timestamp: string): FinancialFieldValue` — returns new field with `source: 'user_entry'`, `isCustom: true`, updated `lastModifiedAt`.
- `resetFieldToDefault(field: FinancialFieldValue, timestamp: string): FinancialFieldValue` — returns new field with `currentValue: brandDefault`, `source: 'brand_default'`, `isCustom: false`.

**Schema Update (shared/schema.ts):**
- Change `financialInputs` JSONB type annotation from `FinancialInputs` (engine type) to `PlanFinancialInputs` (wrapped type).
- Change `startupCosts` JSONB type annotation remains `StartupCostLineItem[]` (engine type is sufficient for startup costs).

**Number Format Conventions:**
- Plan JSONB stores currency in **cents as integers** (consistent with engine convention)
- Brand parameters store currency in **dollars as raw numbers** (per existing schema)
- The initialization function handles the conversion: `brandParam.value * 100` → cents

**Mapping from BrandParameters → PlanFinancialInputs:**
- `revenue.monthly_auv.value` → `revenue.monthlyAuv.currentValue` (× 100 for cents)
- `revenue.year1_growth_rate.value` → `revenue.year1GrowthRate.currentValue` (already decimal)
- `revenue.year2_growth_rate.value` → `revenue.year2GrowthRate.currentValue` (already decimal)
- `revenue.starting_month_auv_pct.value` → `revenue.startingMonthAuvPct.currentValue` (already decimal)
- `operating_costs.*_pct.value` → `operatingCosts.*Pct.currentValue` (already decimal)
- `operating_costs.*_monthly.value` → `operatingCosts.*Monthly.currentValue` (× 100 for cents)
- `financing.loan_amount.value` → `financing.loanAmount.currentValue` (× 100 for cents)
- `financing.interest_rate.value` → `financing.interestRate.currentValue` (already decimal)
- `financing.loan_term_months.value` → `financing.loanTermMonths.currentValue` (integer)
- `financing.down_payment_pct.value` → `financing.downPaymentPct.currentValue` (already decimal)
- `startup_capital.*` → `startupCapital.*` (integer values)

**Mapping from PlanFinancialInputs → Engine FinancialInputs (unwrap):**
- `revenue.monthlyAuv * 12` → `revenue.annualGrossSales`
- `revenue.startingMonthAuvPct` → `revenue.startingMonthAuvPct`
- Default `monthsToReachAuv = 14` (PostNet convention; not in brand params)
- `[year1GrowthRate, year2GrowthRate, year2GrowthRate, year2GrowthRate, year2GrowthRate]` → `revenue.growthRates`
- Single percentage values → 5-element arrays (same value repeated)
- `(rentMonthly + utilitiesMonthly + insuranceMonthly) * 12` → `facilitiesAnnual[0]`, with 3% annual escalation for years 2-5
- `otherMonthly` → treated as additional fixed cost, converted to percentage of estimated revenue for `otherOpexPct`; if zero, defaults to `0.03`
- `loanAmount` → used to derive `equityPct = 1 - (loanAmount / totalInvestment)` when totalInvestment is computed from startup costs
- `depreciationYears` → `depreciationRate = depreciationYears > 0 ? 1 / depreciationYears : 0`
- System defaults for fields not in brand params: `payrollTaxPct = 0.20`, `managementSalariesAnnual = [0,0,0,0,0]`, `workingCapitalAssumptions = { arDays: 30, apDays: 60, inventoryDays: 60 }`, `distributions = [0,0,0,0,0]`, `taxRate = 0.21`

### Anti-Patterns & Hard Constraints

- **DO NOT** modify `shared/financial-engine.ts` computation logic — only add/modify interfaces
- **DO NOT** create `shared/types.ts` — all financial interfaces stay in `shared/financial-engine.ts`
- **DO NOT** split the Drizzle schema across multiple files — `shared/schema.ts` only
- **DO NOT** add API routes in this story — API routes come in Story 3.5
- **DO NOT** add UI components in this story — UI comes in Epic 4
- **DO NOT** modify `vite.config.ts`, `drizzle.config.ts`, or `package.json` scripts
- **DO NOT** modify files in `client/src/components/ui/` (Shadcn-managed)
- **DO NOT** use `snake_case` inside JSONB content — use `camelCase`
- **DO NOT** store brand_default in dollars in the plan JSONB — convert to cents
- **DO NOT** throw errors from initialization functions — return reasonable defaults for missing data

### Gotchas & Integration Warnings

- **Brand params use dollars, engine uses cents:** Brand parameter currency values (monthly_auv, rent_monthly, etc.) are stored as raw numbers in dollars. The plan JSONB and engine use cents. Always multiply by 100 when converting from brand params.
- **Brand params wrap values in `{value, label, description}`:** Must extract `.value` from each brand parameter field.
- **Engine expects per-year arrays:** Many engine fields (cogsPct, laborPct, etc.) are 5-element tuples. The plan stores single values. The unwrap function must expand single values into arrays.
- **`other_monthly` → `otherOpexPct` mismatch:** Brand params have `other_monthly` (fixed cents), but the engine expects `otherOpexPct` (percentage of revenue). For initialization, derive a reasonable percentage or use a system default of 3%.
- **`facilities` in the engine encompasses all fixed monthly costs:** Combine rent + utilities + insurance into `facilitiesAnnual` during unwrap.
- **startup cost template amounts are in dollars:** The `StartupCostItem.default_amount` is stored as a dollar value. Convert to cents when building `StartupCostLineItem[]`.
- **FinancialInputs change is a type-only change:** Changing the JSONB column type from `FinancialInputs` to `PlanFinancialInputs` doesn't require a database migration — both are JSONB, the type annotation is TypeScript-only.
- **Existing tests must pass:** The financial engine tests in `shared/financial-engine.test.ts` must continue to pass since we're not modifying computation logic.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `shared/financial-engine.ts` | MODIFY | Update `FinancialFieldValue` (add lastModifiedAt, isCustom; change "manual" → "user_entry"). Add `PlanFinancialInputs` interface. |
| `shared/plan-initialization.ts` | CREATE | Plan initialization bridge: `buildPlanFinancialInputs()`, `buildPlanStartupCosts()`, `unwrapForEngine()`, `updateFieldValue()`, `resetFieldToDefault()` |
| `shared/plan-initialization.test.ts` | CREATE | Tests for all initialization and conversion functions |
| `shared/schema.ts` | MODIFY | Update `financialInputs` JSONB type annotation to `PlanFinancialInputs` |

### Dependencies & Environment Variables

**No new packages needed.** All functions are pure TypeScript with no external dependencies.

**No new environment variables needed.**

**No database migration needed.** JSONB type annotations are TypeScript-only; the database column remains `jsonb`.

### References

- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Decision 15 (Engine Design), Per-field metadata pattern, Number Format Rules
- Story 3.1 Code Review: DD-1a (PlanFinancialInputs separation), DD-1b (buildFinancialInputsFromBrand), DD-4 (StartupCostItem → StartupCostLineItem mapping), OS-1 (transformation function)
- Epics: `_bmad-output/planning-artifacts/epics.md` — Epic 3 overview, Story 3.2 AC, FR2/FR3
- Existing schema: `shared/schema.ts` — BrandParameters, StartupCostItem, plans table
- Engine: `shared/financial-engine.ts` — FinancialFieldValue, FinancialInputs, StartupCostLineItem, EngineInput, calculateProjections()

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6) via Claude Code CLI

### Completion Notes

**Implementation (2026-02-10):**
- Updated `FinancialFieldValue` interface: added `lastModifiedAt`, `isCustom` fields; changed `"manual"` source to `"user_entry"` per AC requirements
- Added `PlanFinancialInputs` interface — wrapped financial inputs for plan JSONB persistence, mirroring brand parameter categories with per-field metadata
- Created `shared/plan-initialization.ts` with 5 pure functions:
  - `buildPlanFinancialInputs()`: BrandParameters → PlanFinancialInputs (with dollars→cents conversion)
  - `buildPlanStartupCosts()`: StartupCostTemplate → StartupCostLineItem[] (with dollars→cents conversion)
  - `unwrapForEngine()`: PlanFinancialInputs + StartupCostLineItem[] → EngineInput (expanding single values to 5-year arrays, combining fixed costs into facilitiesAnnual with 3% escalation, deriving equityPct from loanAmount/totalInvestment)
  - `updateFieldValue()`: immutable field update with source tracking
  - `resetFieldToDefault()`: immutable reset to brand default
- Updated `plans.financialInputs` JSONB type annotation from engine `FinancialInputs` to `PlanFinancialInputs`
- 60 new tests covering all functions, edge cases, round-trip edit/reset, and engine integration
- All 93 tests passing (60 new + 33 existing engine tests)
- No TypeScript errors in new/modified files

**Design Decisions:**
- `PlanFinancialInputs` stores user-editable fields as single values (e.g., `cogsPct: 0.30`). The `unwrapForEngine()` function expands these to 5-year arrays for the engine. Per-year differentiation (like rent escalation) is handled automatically.
- Fixed monthly costs (rent + utilities + insurance) are combined into `facilitiesAnnual` with 3% annual escalation, matching PostNet convention.
- `otherMonthly` (fixed cents) is converted to `otherOpexPct` (% of revenue) in the unwrap function.
- System defaults for fields without brand parameters: `monthsToReachAuv=14`, `payrollTaxPct=0.20`, `managementSalariesAnnual=[0,0,0,0,0]`, `workingCapitalAssumptions={ar:30,ap:60,inv:60}`, `distributions=[0,0,0,0,0]`, `taxRate=0.21`.
- `equityPct` is derived dynamically from `loanAmount / totalInvestment` rather than stored as a separate field.

### LSP Status
Clean — no errors in new/modified files. Pre-existing Drizzle ORM type issues in node_modules and server/storage.ts are unrelated.

### Visual Verification
N/A — this story is infrastructure/data-layer only (developer role), no UI components.

### File List
| File | Action | Notes |
|------|--------|-------|
| `shared/financial-engine.ts` | MODIFIED | Updated `FinancialFieldValue` (added lastModifiedAt, isCustom; "manual"→"user_entry"). Added `PlanFinancialInputs` interface. |
| `shared/plan-initialization.ts` | CREATED | Plan initialization bridge: `buildPlanFinancialInputs()`, `buildPlanStartupCosts()`, `unwrapForEngine()`, `updateFieldValue()`, `resetFieldToDefault()` |
| `shared/plan-initialization.test.ts` | CREATED | 60 tests: field initialization, startup cost mapping, engine unwrap, field update/reset, engine integration, edge cases |
| `shared/schema.ts` | MODIFIED | Changed `financialInputs` JSONB type annotation from `FinancialInputs` to `PlanFinancialInputs` |
| `_bmad-output/implementation-artifacts/3-2-brand-default-integration-per-field-metadata.md` | CREATED | Story file with detailed dev notes and AC |

## Code Review Notes

**Reviewer:** Claude Opus 4.6 (adversarial code review + BMAD party mode multi-agent review)
**Date:** 2026-02-10
**Verdict:** IN PROGRESS — 1 HIGH + 4 MEDIUM items must be resolved before done

### Findings

#### HIGH — Must Fix

**H1: AC7 NOT SATISFIED — Missing PostNet reference value assertions**
- **File:** `shared/plan-initialization.test.ts` (Engine Integration section, lines 346-381)
- **Description:** AC7 requires "engine output matches previously validated PostNet reference results within tolerance." Current tests verify identity checks pass, positive revenue, and deterministic output — but do NOT assert against specific known-good PostNet reference values (e.g., Y1-Y5 annual revenue, break-even month, 5-year ROI).
- **Suggested fix:** Add 3-5 snapshot assertions to the Engine Integration test section comparing key output metrics against PostNet reference values from `shared/financial-engine.test.ts`. Example: `expect(output.annualSummaries[0].revenue).toBeCloseTo(expectedY1Revenue, -2)`.
- **Party mode consensus:** 4/5 agents agreed this blocks done (Quinn, Amelia, Bob, John).

#### MEDIUM — Should Fix

**M1: Dead code — `makeSystemDefault` function never called**
- **File:** `shared/plan-initialization.ts:74-83`
- **Description:** `makeSystemDefault()` creates a `FinancialFieldValue` with `brandDefault: null`. Not used anywhere. System defaults (payrollTaxPct, monthsToReachAuv, etc.) are hardcoded as raw numbers in `unwrapForEngine()`.
- **Suggested fix:** Remove the function. It can be recreated if needed in a future story.

**M2: `otherMonthly` → `otherOpexPct` conversion is semantically lossy**
- **File:** `shared/plan-initialization.ts:191-199`
- **Description:** Fixed monthly dollar costs (`otherMonthly`) are converted to a percentage of revenue (`otherOpexPct`). This means "other costs" scale with revenue instead of staying fixed. For PostNet ($1,000/mo, ~$322K/yr), the derived 3.72% is reasonable at initialization. However, if a user changes revenue, the dollar-equivalent of "other costs" shifts proportionally.
- **Context:** Dev notes (line 72, 95) explicitly document this as a known limitation — the engine interface accepts `otherOpexPct` (percentage) not fixed dollar amounts. The implementation follows the spec.
- **Suggested fix:** Document as a known limitation in code comments. Consider adding `otherFixedCostsAnnual` to the engine interface in a future story if this causes inaccurate projections.

**M3: `downPaymentPct` is a dead editable field on the normal path** *(Codex P2)*
- **File:** `shared/plan-initialization.ts:202-206`
- **Description:** When `startupCosts` is non-empty (the normal path), `equityPct` is derived solely from `loanAmount / totalInvestment`. The persisted field `financing.downPaymentPct.currentValue` is never read, making it a no-op in projections. A franchisee could edit `downPaymentPct` in the UI and see zero effect — only `loanAmount` matters.
- **Suggested fix:** Either derive `equityPct` from `downPaymentPct` (honoring user intent), or remove `downPaymentPct` from `PlanFinancialInputs` and compute it as a display-only derived value.

**M4: Fallback financing internally inconsistent when startup costs empty** *(Codex P2)*
- **File:** `shared/plan-initialization.ts:204-206, 231`
- **Description:** When `startupCosts = []`, the fallback sets `totalInvestment = loanAmount` (line 231), but `equityPct` comes from `downPaymentPct` (line 206). The engine then computes `debtAmount = totalInvestment * (1 - equityPct)`, which is smaller than the entered loan. E.g., $200K loan + 20% down → `debtAmount = $160K`, under-financing the exact scenario the fallback is meant to handle.
- **Suggested fix:** When startup costs are empty, set `equityPct = 0` (100% debt-financed) so `debtAmount = loanAmount`, or derive `totalInvestment = loanAmount / (1 - downPaymentPct)` to keep the math consistent.

#### LOW — Nice to Fix

**L1: `workingCapitalMonths` stored but unused**
- `PlanFinancialInputs.startupCapital.workingCapitalMonths` is initialized but `unwrapForEngine` never reads it. Placeholder for future WC modeling story.

**L2: Empty startup costs produce degenerate ROI metrics**
- When `startupCosts = []`, `totalStartupInvestment = 0` in engine, causing `breakEvenMonth = 1` and `fiveYearROIPct = 0`.

**L3: `item7Range` always null for financial input fields**
- Item 7 data exists on startup cost items, not financial parameter fields. Field is a placeholder.

**L4: `sprint-status.yaml` changed in git but not in story File List**
- Expected workflow housekeeping, not a code issue.
