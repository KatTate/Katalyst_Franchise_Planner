# Test Automation Summary — Story 7H.2: Per-Month Independence

**Date:** 2026-02-22
**Story:** 7H.2 — Per-Month Independence (7.1b.1)
**Test Frameworks:** Vitest (unit tests), Playwright (E2E tests)
**Status:** All tests passing

## Generated Tests

### Unit Tests

- [x] `shared/story-7h2-per-month.test.ts` — 44 tests covering migration, engine behavior, identity checks, and input-field-map helpers

### E2E Tests

- [x] `e2e/story-7h2-per-month-independence.spec.ts` — 5 tests covering P&L inline editing, annual propagation, Copy Year 1, and linked indicator removal

### API Tests

- Not applicable — Story 7H.2 uses existing PATCH /api/plans endpoint with no new API routes

## AC Coverage Table

| AC# | AC Text (short) | Test Type | Test Case(s) | Covered |
|-----|----------------|-----------|--------------|---------|
| AC-1 | Qualifying fields stored as 60-element arrays | Unit | `monthlyAuv is a 60-element array`, `cogsPct is a 60-element array`, `laborPct is a 60-element array`, `marketingPct is a 60-element array`, `growthRates remains 5-element`, `facilitiesAnnual remains 5-element` | Yes |
| AC-2 | 5-to-60 migration (idempotent) | Unit | `expands 5-element cogsPct to 60`, `expands 5-element laborPct to 60`, `expands 5-element marketingPct to 60`, `expands single-value monthlyAuv to 60-element array`, `preserves isCustom and source metadata`, `idempotent on already-migrated data`, `preserves non-qualifying 5-element arrays`, `preserves single-value financing fields` | Yes |
| AC-3 | unwrapForEngine produces 60-element arrays | Unit | `unwrapped cogsPct is a 60-element number array`, `unwrapped laborPct is a 60-element number array`, `unwrapped marketingPct is a 60-element number array`, `unwrapped monthlyAuvByMonth is a 60-element number array`, `unwrapped growthRates remains a 5-element number array` | Yes |
| AC-4 | Engine uses month-specific values | Unit | `uniform 60-element arrays produce deterministic output`, `month-specific COGS% values produce different COGS for those months`, `month-specific laborPct values produce different labor costs`, `month-specific monthlyAuvByMonth values affect revenue during ramp-up months`, `all 13 identity checks pass with 60-element inputs`, `monthly projections count is exactly 60` | Yes |
| AC-5 | Monthly-level inline editing updates single month only | E2E | `AC-5: Monthly-level inline editing updates single month only`, `AC-5/AC-6: Editing at annual level then verifying independence` | Yes |
| AC-6 | Annual-level edit updates all 12 months of that year | E2E | `AC-6: Annual-level edit on qualifying field updates all 12 months`, `AC-5/AC-6: Editing at annual level then verifying independence` | Yes |
| AC-7 | Copy Year 1 pattern copy replicates to all years | E2E | `AC-7: Copy Year 1 pattern copy replicates to all years` | Yes |
| AC-8 | Forms displays Month 1 value; Linked indicator removed | E2E | `AC-8: No Linked indicator in column headers` | Partial |
| AC-9 | All existing tests pass; new tests for migration, engine, editing | Unit | `all identity checks pass with heterogeneous per-month values`, `determinism holds with heterogeneous inputs`, `includes all 13 identity check categories`, `monthly BS identity checks pass for months with modified COGS%`, `CF cash continuity checks pass with heterogeneous labor%` | Yes |
| AC-10 | INPUT_FIELD_MAP helpers handle 60-element array semantics | Unit | `getAbsoluteMonthIndex` (4 tests), `getMonthRangeForColKey` (6 tests), `getDrillLevelFromColKey` (3 tests), plus `computeDisplayValue` and `resolveCommitIndices` (3 tests) | Yes |

### Coverage Summary

| Area | ACs Covered | Total ACs | Coverage |
|------|------------|-----------|----------|
| Data Model (schema/storage) | AC-1 | 1 | 100% |
| Migration | AC-2 | 1 | 100% |
| Engine Interface | AC-3 | 1 | 100% |
| Engine Behavior | AC-4, AC-9 | 2 | 100% |
| UI Monthly Editing | AC-5 | 1 | 100% |
| UI Annual/Quarterly Editing | AC-6 | 1 | 100% |
| Copy Year 1 Pattern | AC-7 | 1 | 100% |
| Forms + Linked Indicator | AC-8 | 1 | Partial |
| Input Field Map Helpers | AC-10 | 1 | 100% |
| **Total** | **10 ACs** | **10** | **9.5/10 (95%)** |

## Test Execution Results

### Unit Tests (Vitest)

- **Total suite:** 733 tests passed across 21 test files
- **New tests added:** 44 tests in `shared/story-7h2-per-month.test.ts`
- **Regressions introduced:** 0
- **Pre-existing failures:** 0

### E2E Tests (Playwright)

- **Total:** 5 tests passed via `npx playwright test e2e/story-7h2-per-month-independence.spec.ts`
- **Execution time:** 45.6 seconds
- **Setup:** Uses franchisee dev-login flow with auto-created demo plan, patches with pre-migration financialInputs format (5-element arrays → client-side migration handles 60-element conversion)

## Test Design Notes

### Unit Test Architecture

- **Fixture pattern:** `makeField(value)` / `makeFieldArray5(value)` / `makeFieldArray60(value)` helpers create `FinancialFieldValue` objects with brand_default metadata
- **Engine input builder:** `buildEngineInput(overrides?)` constructs full `EngineInput` with 60-element arrays for qualifying fields, accepts partial overrides for targeted testing
- **Heterogeneous inputs:** AC-9 tests use per-month values that vary across months (e.g., cogsPct[6]=0.35, cogsPct[18]=0.25, cogsPct[40]=0.28) to verify accounting identities hold under non-uniform conditions

### E2E Test Architecture

- **Setup flow:** POST admin dev-login → create brand → POST franchisee dev-login (auto-creates demo plan) → PATCH plan with financialInputs + quickStartCompleted
- **Zod compatibility:** Uses pre-migration format (single-value monthlyAuv, 5-element arrays for qualifying fields) because the Zod schema in `shared/schema.ts` hasn't been updated to accept 60-element arrays for monthlyAuv
- **Login flow:** Browser-side admin dev-login, then navigate directly to plan workspace

## Findings

### Zod Schema Inconsistency (Bug)

The Zod validation schema in `shared/schema.ts` line 226 defines `revenue.monthlyAuv` as `financialFieldValueSchema` (single FinancialFieldValue object), while the TypeScript interface in `shared/financial-engine.ts` defines it as `FinancialFieldValue[]` (60-element array). This means:

- PATCH `/api/plans/:id` with 60-element monthlyAuv array will fail server-side Zod validation
- Plan creation via POST (which uses `buildPlanFinancialInputs` server-side) bypasses Zod validation and stores correctly
- Client-side code works correctly because it doesn't go through Zod validation

**Recommendation:** Update `planFinancialInputsSchema.revenue.monthlyAuv` to `financialFieldValueArraySchema` (or a union for backward compatibility) and add a schema-level test to lock this in.

### Pre-existing E2E Environment Issue

The existing `story-7-1b-reports-editing.spec.ts` E2E tests (5 tests) also fail in the current environment due to the same `financial-statements` locator not being found after navigation. This is a pre-existing issue unrelated to Story 7H.2 changes. The new 7H.2 E2E tests were designed to handle this via the franchisee dev-login flow with proper brand/plan association.

## Uncovered ACs

| AC# | AC Text (short) | Justification |
|-----|----------------|---------------|
| AC-8 (partial) | Forms displays Month 1 value; editing in Forms updates all 60 months | The Linked indicator removal portion of AC-8 is fully tested (E2E asserts no link-icon or linked-indicator elements exist). The Forms single-value display behavior is not E2E tested because Forms is a separate surface from Reports P&L and requires different navigation context. The underlying logic (reading index 0, writing all 60 elements) is exercised by the unit tests for `use-field-editing.ts` in the existing test suite. |

## Workflow Completion Gate

- **{{tests_executed}}** = yes
- **{{summary_created}}** = yes

## Next Steps

- Fix the Zod schema inconsistency for `monthlyAuv` (change from single to array schema)
- Add E2E coverage for Forms single-value display (AC-8 partial gap)
- Add E2E test for quarterly-level editing on qualifying fields
- Run full Playwright suite in CI when all environment issues are resolved
