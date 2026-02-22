# Story 7H.2: Per-Month Independence (7.1b.1)

Status: ready-for-dev

## Story

As a franchisee fine-tuning my 5-year plan in Reports,
I want to edit qualifying financial assumptions (revenue, COGS%, labor%, marketing%) at the individual month level when I drill down to monthly view,
so that I can model seasonal variations and monthly fluctuations with full granularity — the way I would in a spreadsheet.

## Acceptance Criteria

1. **Given** a plan with financial inputs, **when** the plan's `PlanFinancialInputs` is loaded, **then** the qualifying fields (`monthlyAuv`, `cogsPct`, `laborPct`, `marketingPct`) are stored as 60-element `FinancialFieldValue[]` arrays (one element per projection month), while all other per-year fields remain as 5-element arrays and all single-value fields remain as plain `FinancialFieldValue`.

2. **Given** a plan created before per-month independence, **when** the plan is loaded, **then** existing 5-element per-year arrays for qualifying fields are losslessly migrated to 60-element arrays by repeating each year's value across its 12 months (Year 1 value → months 1-12, Year 2 value → months 13-24, etc.), and the plan's `monthlyAuv` single-value field is expanded to a 60-element array with the same value in every element. Migration is idempotent — running it on an already-migrated plan produces identical output.

3. **Given** a plan with 60-element per-month arrays for qualifying fields, **when** `unwrapForEngine()` is called, **then** the engine receives 60-element number arrays for `cogsPct`, `laborPct`, and `marketingPct` (instead of 5-element tuples), and `monthlyAuvByMonth` as a 60-element number array (instead of scalar `annualGrossSales`). The engine uses `[m-1]` direct month indexing instead of `[yearIndex(m)]` for these fields.

4. **Given** the engine receives 60-element arrays for qualifying fields, **when** `calculateProjections()` runs, **then** every monthly projection uses the month-specific value for revenue AUV, COGS%, labor%, and marketing% — identical inputs still produce identical outputs (determinism preserved). All 13 accounting identity checks continue to pass.

5. **Given** I am viewing Reports P&L with a year drilled down to monthly level, **when** I click on a qualifying field cell (revenue, COGS%, labor%, marketing%) at the monthly column, **then** an inline edit input opens for that specific month. When I commit the edit, only that single month's value in the 60-element array is updated — other months remain unchanged.

6. **Given** I am viewing Reports P&L with a year at annual or quarterly level, **when** I click on a qualifying field cell, **then** the annual-level edit updates all 12 months of that year to the new value, and the quarterly-level edit updates the 3 months of that quarter to the new value. This preserves the existing per-year editing behavior as a convenience shortcut.

7. **Given** I click "Copy Year 1 to All" on a qualifying per-month field, **when** the action completes, **then** months 1-12 values are copied to months 13-24, 25-36, 37-48, and 49-60 respectively (month-by-month pattern copy, not just a single value broadcast).

8. **Given** a plan with 60-element per-month arrays, **when** I view the plan in Forms (My Plan), **then** Forms continues to display single-value inputs (the Month 1 value as the representative). Editing a field in Forms updates all 60 months to the entered value. Per-month granularity is exclusively a Reports capability.

9. **Given** existing unit tests for the financial engine and plan initialization, **when** this story is complete, **then** all existing tests continue to pass (with updated fixtures for 60-element arrays where needed), and new tests cover: (a) 5-to-60 migration, (b) direct month indexing in engine, (c) annual/quarterly/monthly edit granularity in commit handler, (d) Copy Year 1 pattern copy.

10. **Given** the `INPUT_FIELD_MAP` entries for qualifying fields, **when** a qualifying field is rendered at monthly drill level, **then** the `storedGranularity` and `scaleForStorage` logic correctly handles the 60-element array semantics — monthly-level edits store directly, quarterly-level edits scale to 3 months, annual-level edits scale to 12 months.

## Dev Notes

### Architecture Patterns to Follow

**Per-Month Array Convention (extending Epic 7 per-year pattern):**
- Per-year fields: 5-element `FinancialFieldValue[]` arrays indexed by year (0-4). Engine receives `[number, number, number, number, number]` tuples.
- Per-month fields (NEW): 60-element `FinancialFieldValue[]` arrays indexed by absolute month (0-59). Engine receives `number[]` of length 60. Engine loop uses `fi.field[m-1]` instead of `fi.field[yearIndex(m)]`.
- The `PlanFinancialInputs` interface uses the same `FinancialFieldValue[]` type for both — the length distinguishes them (5 vs 60).
- Source: `_bmad-output/planning-artifacts/architecture.md` Decision 1, `_bmad-output/planning-artifacts/epics.md` Epic 7H Story 7H.2.

**Engine Purity Contract:**
The financial engine (`shared/financial-engine.ts`) is a pure function module. No I/O, no side effects, no `Date.now()`. All changes to the engine must preserve this contract. Identical inputs → identical outputs (FR9, NFR15). Source: `shared/financial-engine.ts` header comment.

**Edit Commit Chain (existing pattern to extend):**
1. `PnlTab.handleCommitEdit()` extracts `yearIndex` from colKey (`y1` → 0, `y2` → 1, etc.)
2. Calls `onCellEdit(category, fieldName, rawInput, inputFormat, yearIndex)`
3. `FinancialStatements.handleCellEdit()` resolves category object, indexes into array at `yearIndex`, calls `updateFieldValue()`, then `buildUpdatedInputs()`
4. `buildUpdatedInputs()` does `existingField.map((f, i) => i === yearIndex ? updatedField : f)` — this already works for any array length since it uses generic index comparison
5. For per-month: `yearIndex` parameter is reinterpreted as a general `arrayIndex`. Monthly colKey `y2m5` → month index 16 (= (2-1)*12 + 5 - 1). Annual colKey `y2` → need to update indices 12-23. Quarterly colKey `y2q3` → need to update indices 18-20.

**Naming Convention:**
- `monthlyAuv` → `monthlyAuvByMonth` in `FinancialInputs` (engine input interface) to distinguish from the old scalar `monthlyAuv` / `annualGrossSales`
- In `PlanFinancialInputs`, rename from `monthlyAuv: FinancialFieldValue` to `monthlyAuv: FinancialFieldValue[]` (same name, type changes from scalar to array)
- The `annualGrossSales` field in `FinancialInputs` is replaced by `monthlyAuvByMonth: number[]` (60 elements in cents)

### UI/UX Deliverables

**Reports P&L Tab — Monthly Drill-Down Editing:**
- When a year is drilled to monthly level (existing column-manager infrastructure), qualifying field cells at month columns become individually editable
- Click to edit opens `InlineEditableCell` for that single month
- Tab navigation flows across months within the same row (existing Tab key infrastructure)
- Monthly cells show month-specific values (not repeated year value)

**Reports P&L Tab — Annual/Quarterly Level (Convenience Editing):**
- Annual-level edit on a qualifying field updates all 12 months of that year (bulk write)
- Quarterly-level edit updates the 3 months of that quarter (bulk write)
- Annual total and quarterly subtotal display values are aggregated from the 60 monthly values (sum for currency, average for percentages)

**Forms (My Plan) — No Changes:**
- Forms continues to show single-value inputs
- Editing in Forms sets all 60 months to the entered value
- No per-month or per-year columns in Forms

**Column Toolbar — Linked Indicator Update:**
- The `ColumnToolbar` "Linked" tooltip currently says "All years share the same input value. Per-year values will be available in a future update." This text should be removed or updated since per-year independence is already implemented and per-month is now live. Remove the "Linked" indicator entirely — it's no longer accurate for any field.

### Anti-Patterns & Hard Constraints

- **DO NOT** modify `vite.config.ts`, `server/vite.ts`, `drizzle.config.ts`, or `package.json` — these are protected files per project conventions.
- **DO NOT** add per-month editing to Forms (My Plan) — Forms remains single-value inputs only. This is a core design principle from Epic 7.
- **DO NOT** create a separate `MonthlyFieldValue` type — reuse `FinancialFieldValue[]` with length 60. The existing type system handles this.
- **DO NOT** change the `onCellEdit` callback signature — the existing `yearIndex` parameter can be reinterpreted as a general array index. For bulk writes (annual editing 12 months, quarterly editing 3 months), call the update function in a loop.
- **DO NOT** break the existing 5-element per-year arrays for non-qualifying fields. Only `monthlyAuv`, `cogsPct`, `laborPct`, `marketingPct` become 60-element arrays.
- **DO NOT** remove `yearIndex()` or `monthInYear()` helper functions from the engine — they're still used for non-qualifying fields that remain per-year (facilities, management salaries, royalties, etc.).
- **DO NOT** change the engine's ramp-up logic structure — the `monthsToReachAuv` / `startingMonthAuvPct` ramp-up still applies but now modulates the per-month AUV values.

### Gotchas & Integration Warnings

**Revenue Ramp-Up Interaction:**
The engine's revenue calculation currently uses `annualGrossSales / 12` as `monthlyAuv` and applies ramp-up percentage during the first N months. With per-month independence, each month has its own AUV in cents. The ramp-up logic must use `monthlyAuvByMonth[m-1]` as the base AUV for that month, then apply the ramp-up percentage on top of it. After ramp-up completes, growth rates compound on the previous month's actual revenue (existing behavior).

**Growth Rate Interaction:**
Growth rates remain as 5-element per-year arrays. After ramp-up, the engine uses `growthRates[yearIndex(m)]` to get the annual growth rate, converts to monthly, and compounds on previous month revenue. This is unchanged — growth rates are NOT qualifying per-month fields.

**Migration Idempotency:**
The `migratePlanFinancialInputs()` function already handles old-format → per-year migration. Add a new migration path: 5-element → 60-element for qualifying fields. Detection: if `cogsPct` array has length 5, it needs migration. If length 60, it's already migrated. If `monthlyAuv` is not an array (plain object with `currentValue`), it needs migration to 60-element array.

**Scenario Engine / Sensitivity Engine:**
Check `client/src/lib/scenario-engine.ts` and `client/src/lib/sensitivity-engine.ts` — these may construct `EngineInput` or manipulate `FinancialInputs` and will need updates for 60-element arrays. The scenario engine likely constructs modified `FinancialInputs` for comparison — it must produce 60-element arrays for qualifying fields.

**Copy Year 1 to All — Pattern Copy:**
Currently `handleCopyYear1ToAll` copies `fieldArr[0].currentValue` to indices 1-4. For 60-element arrays, the pattern copy means: take months 0-11, replicate to months 12-23, 24-35, 36-47, 48-59. Each destination month gets the value from its corresponding month-in-year from Year 1 (month 0 → months 12, 24, 36, 48; month 1 → months 13, 25, 37, 49; etc.).

**Forms ↔ Reports Bidirectional Sync:**
When a user edits a field in Forms, all 60 months must be set to the same value (Forms provides single-value semantics). When displaying in Forms, show `monthlyAuv[0].currentValue` (or Month 1 value) as the representative. If months have diverged (user edited individual months in Reports), Forms shows Month 1 value and editing in Forms overwrites all months.

**`scaleForStorage` for Per-Month Fields:**
Currently `scaleForStorage` handles `storedGranularity: "monthly" | "annual"` to convert between display and storage units (e.g., annual currency display → monthly storage). For qualifying per-month fields, the display-vs-storage scaling still applies (annual column shows sum of 12 months, quarterly shows sum of 3), but the commit handler now also needs to determine WHICH indices to update. This is a separate concern from value scaling.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `shared/financial-engine.ts` | MODIFY | `PlanFinancialInputs`: `monthlyAuv` from `FinancialFieldValue` → `FinancialFieldValue[]` (60). `FinancialInputs`: replace `annualGrossSales` with `monthlyAuvByMonth: number[]` (60). Engine loop: direct month indexing for qualifying fields. Keep `yearIndex()` for non-qualifying fields. |
| `shared/plan-initialization.ts` | MODIFY | `buildPlanFinancialInputs`: generate 60-element arrays for qualifying fields. `migratePlanFinancialInputs`: add 5→60 migration path. `unwrapForEngine`: extract 60-element number arrays for qualifying fields. `makeFieldArray60()` helper. |
| `shared/plan-initialization.test.ts` | MODIFY | Add tests for 5→60 migration, 60-element `unwrapForEngine`, single-value→60 `monthlyAuv` migration. Update existing fixtures. |
| `shared/financial-engine.test.ts` | MODIFY | Update engine test fixtures to use 60-element arrays for qualifying fields. Add tests for month-specific values producing different projections. |
| `shared/financial-engine-reference.test.ts` | MODIFY | Update reference test fixtures for 60-element arrays. |
| `client/src/components/planning/financial-statements.tsx` | MODIFY | `handleCellEdit`: for 60-element arrays, compute absolute month index from colKey; for annual/quarterly edits on per-month fields, loop to update all months in that year/quarter. `handleCopyYear1ToAll`: pattern copy for 60-element arrays. |
| `client/src/components/planning/statements/pnl-tab.tsx` | MODIFY | `handleCommitEdit`: extract month-level index from colKey (`y2m5` → month 16). `getRawValue`: for per-month fields, read from 60-element array using absolute month index. |
| `client/src/components/planning/statements/input-field-map.ts` | MODIFY | Add `perMonth?: boolean` flag to qualifying field entries. Possibly add helper to compute absolute month index from colKey. |
| `client/src/components/planning/statements/column-manager.tsx` | MODIFY | Remove or update "Linked" indicator tooltip text in `ColumnToolbar`. |
| `client/src/lib/scenario-engine.ts` | MODIFY | Update scenario input construction for 60-element qualifying fields. |
| `client/src/lib/sensitivity-engine.ts` | MODIFY | Update sensitivity input construction for 60-element qualifying fields. |
| `shared/schema.ts` | CHECK | Verify `PlanFinancialInputs` type reference is consistent (it imports from `financial-engine.ts`). |
| `client/src/components/planning/plan-forms.tsx` (or equivalent Forms component) | MODIFY | When reading/writing qualifying fields, handle 60-element array: display `[0].currentValue`, write all 60 elements on edit. |

### Dependencies & Environment Variables

- No new packages needed. All changes use existing TypeScript, Drizzle JSONB, React, and shadcn/ui infrastructure.
- No new environment variables.
- **Dependency on completed stories:** Epic 7 complete (7.1a through 7.2). Story 7H.1 (planning doc realignment) complete.

### Testing Expectations

**Unit Tests (Vitest — `shared/` files):**
- `plan-initialization.test.ts`: Test `buildPlanFinancialInputs` produces 60-element arrays for qualifying fields. Test migration from 5-element to 60-element. Test migration idempotency. Test `unwrapForEngine` extracts 60-element number arrays.
- `financial-engine.test.ts`: Test that month-specific values for cogsPct/laborPct/marketingPct/monthlyAuv produce different monthly projections. Test that uniform 60-element arrays produce identical output to old 5-element arrays (backward compatibility). Test all 13 identity checks pass with 60-element inputs.
- `financial-engine-reference.test.ts`: Update reference fixtures.

**E2E Tests (Playwright via run_test):**
- Navigate to Reports P&L. Drill Year 1 to monthly. Click on a COGS% cell at a specific month. Edit and commit. Verify only that month's value changed. Drill up to annual — verify annual total reflects the change.
- Edit COGS% at annual level. Drill down to monthly — verify all 12 months show the new value.

**Critical ACs for test coverage:** AC1 (schema shape), AC2 (migration), AC3-4 (engine), AC5-6 (monthly/annual editing), AC7 (copy Year 1 pattern).

### References

- `_bmad-output/planning-artifacts/epics.md` — Epic 7H, Story 7H.2 description and dependency chain
- `_bmad-output/planning-artifacts/architecture.md` — Decision 1 (Data Model), Decision 2 (Financial Precision), Decision 8 (State Management)
- `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` — Two-Surface Design Boundary section
- `shared/financial-engine.ts` — Engine interfaces (`PlanFinancialInputs`, `FinancialInputs`, `FinancialFieldValue`), engine loop with `yearIndex()` usage
- `shared/plan-initialization.ts` — `buildPlanFinancialInputs()`, `migratePlanFinancialInputs()`, `unwrapForEngine()`, `updateFieldValue()`
- `client/src/components/planning/financial-statements.tsx` — `handleCellEdit()`, `buildUpdatedInputs()`, `handleCopyYear1ToAll()`
- `client/src/components/planning/statements/input-field-map.ts` — `INPUT_FIELD_MAP`, `scaleForStorage()`, `getDrillLevelFromColKey()`
- `client/src/components/planning/statements/column-manager.tsx` — `useColumnManager()`, `ColumnToolbar`, drill-down infrastructure
- `client/src/components/planning/statements/inline-editable-cell.tsx` — Edit cell component
- `client/src/components/planning/statements/pnl-tab.tsx` — `handleCommitEdit()`, `getRawValue()`

## Dev Agent Record

### Agent Model Used

### Completion Notes

### File List

### Testing Summary
