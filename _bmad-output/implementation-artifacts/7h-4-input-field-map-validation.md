# Story 7H.4: INPUT_FIELD_MAP Mechanical Validation

Status: done

## Story

As a developer maintaining the Katalyst Growth Planner,
I want every INPUT_FIELD_MAP entry's format type to be mechanically validated against both FIELD_METADATA and the engine's FinancialInputs type semantics at test time,
so that format mismatches (e.g., a percentage field mapped as currency) cause build failure and the recurring display format bug class is permanently eliminated.

## Background

This is the same class of bug flagged in 3 consecutive retrospectives:
- **Epic 5**: P&L formatting — fields displayed in wrong format
- **Epic 5H**: Labor efficiency display — percentage/currency confusion
- **Epic 7**: Other OpEx mapped as currency instead of percentage in INPUT_FIELD_MAP

Root cause: INPUT_FIELD_MAP is a manual mapping with no mechanical validation against the engine's output types. Code review catches these bugs, but only after they're introduced. The existing 3 tests validate INPUT_FIELD_MAP → FIELD_METADATA consistency but do NOT cross-reference engine type semantics.

Source: `_bmad-output/implementation-artifacts/epic-7-retrospective.md` — Action Item AI-E7-2.

## Acceptance Criteria

1. **Given** the test file `client/src/lib/input-field-map-validation.test.ts` exists with 3 tests, **when** I run `npx vitest run client/src/lib/input-field-map-validation.test.ts`, **then** all existing tests continue to pass AND new tests added by this story also pass. No existing test is deleted or weakened.

2. **Given** a new test "every INPUT_FIELD_MAP entry's format type is semantically correct for the engine's FinancialInputs type", **when** it runs, **then** it verifies each INPUT_FIELD_MAP entry's `inputFormat` is consistent with how the engine treats that field. The test uses an explicit `ENGINE_FIELD_SEMANTICS` map (defined in the test file) with 4 semantic types (`"cents"` | `"decimal_pct"` | `"integer"` | `"decimal_number"`) and a deterministic `SEMANTIC_TO_FORMAT` lookup (cents→currency, decimal_pct→percentage, integer→integer, decimal_number→decimal) to verify each entry. A mismatch causes test failure with a clear diagnostic message naming the row key, the INPUT_FIELD_MAP format, and the engine's expected format.

3. **Given** a new test "INPUT_FIELD_MAP completeness — every FIELD_METADATA field that is user-editable has an INPUT_FIELD_MAP entry or is explicitly excluded", **when** it runs, **then** it verifies that fields in FIELD_METADATA categories that are present in INPUT_FIELD_MAP have full coverage. Fields that are intentionally NOT in INPUT_FIELD_MAP (e.g., `startingMonthAuvPct`, all `financing` category fields, all `startupCapital` category fields, all `facilitiesDecomposition` sub-fields) are listed in an explicit `EXCLUDED_FIELDS` set with a comment explaining why each is excluded (edited elsewhere in the UI). If a new field is added to FIELD_METADATA in a covered category but not added to either INPUT_FIELD_MAP or EXCLUDED_FIELDS, the test fails.

4. **Given** a new test "INPUT_FIELD_MAP category values match FIELD_METADATA category keys", **when** it runs, **then** it verifies that every `category` value used in INPUT_FIELD_MAP entries is a valid key in the FIELD_METADATA object. This catches typos in category strings.

5. **Given** a developer introduces a format mismatch (e.g., changes `otherOpexPct` from `"percentage"` to `"currency"` in INPUT_FIELD_MAP), **when** they run the test suite, **then** at least one test fails with a message clearly identifying the mismatch. This is the core acceptance criterion — the bug class that has recurred 3 times must now be caught mechanically.

6. **Given** the test file after this story is complete, **when** I count the test cases, **then** there are at minimum 6 tests (3 existing + 3 new). Each test has a descriptive name referencing the validation dimension it covers.

7. **Given** the `ENGINE_FIELD_SEMANTICS` map defined in the test file, **when** I read it, **then** every entry documents: (a) the `fieldName` from INPUT_FIELD_MAP, (b) the corresponding FinancialInputs path in the engine (e.g., `revenue.monthlyAuvByMonth`), and (c) the expected semantic type (`"cents"` | `"decimal_pct"` | `"integer"` | `"decimal_number"`). The map covers all 20 INPUT_FIELD_MAP entries. Each semantic type maps deterministically to exactly one FormatType via a `SEMANTIC_TO_FORMAT` lookup (cents→currency, decimal_pct→percentage, integer→integer, decimal_number→decimal).

8. **Given** the full test suite runs (`npx vitest run`), **when** I check the exit code, **then** it is 0. All existing tests across the project continue to pass — no regressions.

## Dev Notes

### Architecture Patterns to Follow

**Test File Location & Conventions:**
- File: `client/src/lib/input-field-map-validation.test.ts` (EXTEND existing file — do NOT create a new file)
- Import: `import { describe, it, expect } from "vitest"` — globals are disabled
- Import subjects: `INPUT_FIELD_MAP` from `@/components/planning/statements/input-field-map`, `FIELD_METADATA` from `@/lib/field-metadata`
- Test names should reference the validation dimension: e.g., `"engine type cross-reference"`, `"completeness coverage"`, `"category validity"`
- Source: `_bmad-output/project-context.md` Testing Rules section

**ENGINE_FIELD_SEMANTICS Map Design:**

The map is a `Record<string, { enginePath: string; semanticType: "cents" | "decimal_pct" | "integer" | "decimal_number" }>` keyed by `category.fieldName` (matching the compound key used in the existing duplicate-detection test). Each entry documents the engine's FinancialInputs path and what semantic type the engine expects.

Four semantic types:
- `"cents"` — integer cents (e.g., 15000 = $150.00). Must map to FormatType `"currency"`.
- `"decimal_pct"` — decimal percentage (e.g., 0.065 = 6.5%). Must map to FormatType `"percentage"`.
- `"integer"` — plain integer (e.g., 30 = 30 days). Must map to FormatType `"integer"`.
- `"decimal_number"` — plain decimal number (e.g., 4.5 = 4.5x multiple). Must map to FormatType `"decimal"`.

Key mappings (derived from `shared/financial-engine.ts` lines 94-158):

| INPUT_FIELD_MAP fieldName | FinancialInputs path | Semantic type | Format type |
|---------------------------|---------------------|---------------|-------------|
| monthlyAuv | revenue.monthlyAuvByMonth | cents | currency |
| growthRates | revenue.growthRates | decimal_pct | percentage |
| cogsPct | operatingCosts.cogsPct | decimal_pct | percentage |
| royaltyPct | operatingCosts.royaltyPct | decimal_pct | percentage |
| adFundPct | operatingCosts.adFundPct | decimal_pct | percentage |
| laborPct | operatingCosts.laborPct | decimal_pct | percentage |
| facilitiesAnnual | operatingCosts.facilitiesAnnual | cents | currency |
| managementSalariesAnnual | operatingCosts.managementSalariesAnnual | cents | currency |
| payrollTaxPct | operatingCosts.payrollTaxPct | decimal_pct | percentage |
| marketingPct | operatingCosts.marketingPct | decimal_pct | percentage |
| otherOpexPct | operatingCosts.otherOpexPct | decimal_pct | percentage |
| targetPreTaxProfitPct | targetPreTaxProfitPct | decimal_pct | percentage |
| distributions | distributions | cents | currency |
| shareholderSalaryAdj | shareholderSalaryAdj | cents | currency |
| nonCapexInvestment | nonCapexInvestment | cents | currency |
| arDays | workingCapitalAssumptions.arDays | integer | integer |
| apDays | workingCapitalAssumptions.apDays | integer | integer |
| inventoryDays | workingCapitalAssumptions.inventoryDays | integer | integer |
| taxPaymentDelayMonths | taxPaymentDelayMonths | integer | integer |
| ebitdaMultiple | ebitdaMultiple | decimal_number | decimal |

**Semantic type → FormatType mapping rule (deterministic, no exceptions):**
- `"cents"` → FormatType `"currency"` (stored as integer cents, displayed as dollars)
- `"decimal_pct"` → FormatType `"percentage"` (stored as decimal 0.065, displayed as 6.5%)
- `"integer"` → FormatType `"integer"` (stored and displayed as plain integer)
- `"decimal_number"` → FormatType `"decimal"` (stored as plain decimal, displayed with 2dp)

Each semantic type maps to exactly one FormatType. The test should build a `SEMANTIC_TO_FORMAT` lookup and assert that `SEMANTIC_TO_FORMAT[entry.semanticType] === mapping.inputFormat` for every INPUT_FIELD_MAP entry.

**EXCLUDED_FIELDS Set:**

Fields in FIELD_METADATA that are intentionally NOT in INPUT_FIELD_MAP:

| Field | Category | Reason |
|-------|----------|--------|
| startingMonthAuvPct | revenue | Edited in Forms mode only, not in Reports inline editing |
| rent | facilitiesDecomposition | Edited via Forms guided decomposition, not Reports |
| utilities | facilitiesDecomposition | Same as rent |
| telecomIt | facilitiesDecomposition | Same as rent |
| vehicleFleet | facilitiesDecomposition | Same as rent |
| insurance | facilitiesDecomposition | Same as rent |
| loanAmount | financing | Edited in Forms mode only |
| interestRate | financing | Edited in Forms mode only |
| loanTermMonths | financing | Edited in Forms mode only |
| downPaymentPct | financing | Edited in Forms mode only |
| workingCapitalMonths | startupCapital | Edited in Forms mode only |
| depreciationYears | startupCapital | Edited in Forms mode only |

These fields are excluded because they are edited through Forms mode (My Plan) or the guided decomposition UI, not through Reports inline editing where INPUT_FIELD_MAP controls editability.

Source: Architecture doc — "Two-Surface Design Principle" and `INPUT_FIELD_MAP` as single source of truth for Reports editability.

### Anti-Patterns to Avoid

1. **Do NOT modify INPUT_FIELD_MAP or FIELD_METADATA.** This story is test-only. If a mismatch is found, the test should fail — not silently fix it. (If tests reveal an actual current mismatch, flag it in the story completion report rather than fixing it.)

2. **Do NOT import engine types at runtime.** The ENGINE_FIELD_SEMANTICS map is a test-time artifact defined as a literal object in the test file. It documents what the engine expects but doesn't import FinancialInputs — that would create a client → shared import dependency that already exists but shouldn't be tightened unnecessarily in test code.

3. **Do NOT create a separate test file.** All validation tests belong in the existing `client/src/lib/input-field-map-validation.test.ts`.

4. **Do NOT weaken existing tests.** The 3 existing tests must remain unchanged. Add new tests within the existing `describe` block or add a new `describe` block in the same file.

5. **Do NOT use `test.skip` or `test.todo`.** All tests must be active and passing.

6. **Do NOT modify `shared/financial-engine.ts`, `client/src/components/planning/statements/input-field-map.ts`, or `client/src/lib/field-metadata.ts`.** This is a pure test story — only the test file changes.

### Gotchas & Integration Points

1. **The `unwrapForEngine` function in `shared/plan-initialization.ts` performs non-trivial transformations.** Some field names in PlanFinancialInputs don't match FinancialInputs (e.g., `monthlyAuv` → `monthlyAuvByMonth`, `loanAmount` → computed `totalInvestment * equityPct`). The ENGINE_FIELD_SEMANTICS map documents the engine path for reference but the validation tests check format type correctness, not field name mapping.

2. **The `ebitdaMultiple` field uses semantic type `"decimal_number"`.** In FIELD_METADATA it has format `"decimal"`. In the engine it's a plain number (not cents, not a percentage). The `SEMANTIC_TO_FORMAT` lookup maps `"decimal_number"` → `"decimal"`, so there is no special case — all 4 semantic types have a deterministic 1:1 mapping to FormatType.

3. **The `otherOpexPct` field was the bug trigger for this story.** It was previously mapped as `"currency"` in INPUT_FIELD_MAP when it should have been `"percentage"`. This was fixed in Epic 7 code review. The new engine cross-reference test would have caught this automatically.

4. **Category coverage is partial by design.** INPUT_FIELD_MAP only covers fields editable in Reports. The `financing`, `startupCapital`, and `facilitiesDecomposition` categories in FIELD_METADATA are intentionally excluded because those fields are edited through other UI surfaces. The completeness test must account for this.

5. **The test file path `client/src/lib/` is within Vitest scope.** Per project-context.md: "Vitest scope: `shared/**/*.test.ts`, `server/**/*.test.ts`, `client/src/lib/**/*.test.ts`."

### File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `client/src/lib/input-field-map-validation.test.ts` | MODIFY | Add 3+ new test cases: engine type cross-reference, completeness coverage, category validity |

**No other files are modified.** This is a test-only story.

### Testing Expectations

- Run: `npx vitest run client/src/lib/input-field-map-validation.test.ts` — all 6+ tests pass
- Run: `npx vitest run` — full suite passes (no regressions)
- Verify format mismatch detection: temporarily change a field's format in the test's ENGINE_FIELD_SEMANTICS map and confirm the test fails with a clear diagnostic message

### References

- Epic 7 Retrospective — AI-E7-2 action item: `_bmad-output/implementation-artifacts/epic-7-retrospective.md` lines 278-282
- Architecture doc — INPUT_FIELD_MAP as single source of truth: `_bmad-output/planning-artifacts/architecture.md` line 91
- SCP-2026-02-22 — Story 7H.4 definition: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-02-22.md` lines 241-244
- Project context — Testing rules: `_bmad-output/project-context.md` lines 86-113
- Engine types — FinancialInputs interface: `shared/financial-engine.ts` lines 94-158
- INPUT_FIELD_MAP — Current 20 entries: `client/src/components/planning/statements/input-field-map.ts` lines 15-141
- FIELD_METADATA — Current entries: `client/src/lib/field-metadata.ts` lines 10-57

## Dev Agent Record

- **Agent Model Used:** Claude 4.6 Opus (Replit Agent)
- **Completion Notes:** Added 3 new test cases to the existing `input-field-map-validation.test.ts` file: (1) engine type cross-reference test with `ENGINE_FIELD_SEMANTICS` map covering all 20 INPUT_FIELD_MAP entries and deterministic `SEMANTIC_TO_FORMAT` lookup, (2) completeness coverage test with explicit `EXCLUDED_FIELDS` set documenting 12 fields edited through Forms mode, (3) category validity test verifying all INPUT_FIELD_MAP category values are valid FIELD_METADATA keys. No production code was modified — this is a pure test story.
- **File List:**
  - `client/src/lib/input-field-map-validation.test.ts` — MODIFIED (added 3 new tests, ENGINE_FIELD_SEMANTICS map, SEMANTIC_TO_FORMAT lookup, EXCLUDED_FIELDS set)
- **Testing Summary:**
  - Test approach: Vitest unit tests (test-only story)
  - Test file modified: `client/src/lib/input-field-map-validation.test.ts`
  - ACs covered by tests: AC1 (existing tests pass), AC2 (engine cross-reference), AC3 (completeness), AC4 (category validity), AC5 (mismatch detection), AC6 (6 tests), AC7 (ENGINE_FIELD_SEMANTICS structure), AC8 (full suite passes)
  - All tests passing: Yes (6/6 in target file, 753/753 full suite)
- **LSP Status:** 0 new errors, 0 warnings (pre-existing path alias LSP errors are unchanged)
- **Visual Verification:** N/A (developer-facing test-only story)

## Code Review Record

- **Review Date:** 2026-02-22
- **Reviewer:** Claude 4.6 Opus (Replit Agent) — fresh context, adversarial review
- **Review Outcome:** PASS — all 8 ACs satisfied, 4 issues found and fixed
- **Findings Summary:** 0 HIGH, 2 MEDIUM, 2 LOW — all resolved
  - M1: Completeness test error message in uncovered-category branch was misleading (said "has entries" when category has none) — fixed
  - M2: No reverse coverage check on ENGINE_FIELD_SEMANTICS — added bidirectional validation + fieldName consistency check
  - L1: SEMANTIC_TO_FORMAT typed as `Record<string, string>` — tightened to `Record<SemanticType, FormatType>` with local type aliases
  - L2: Redundant `fieldName` property never validated — added fieldName-vs-compound-key consistency check in M2 fix
- **Tests After Fixes:** 6/6 in target file, 753/753 full suite
- **Git Discovery:** yes | Discrepancies: 0
- **LSP Scan:** 0 new errors, 0 warnings
- **Architect Review:** yes — confirmed all ACs satisfied, agreed with findings
