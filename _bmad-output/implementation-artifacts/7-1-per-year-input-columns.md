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
Then all 10 per-year operating cost categories use 5-element `FinancialFieldValue` arrays:
- `growthRates[5]` (replaces `year1GrowthRate` + `year2GrowthRate`)
- `royaltyPct[5]`, `adFundPct[5]`, `cogsPct[5]`, `laborPct[5]`
- `facilitiesAnnual[5]` (replaces `rentMonthly` + `utilitiesMonthly` + `insuranceMonthly`)
- `marketingPct[5]`, `managementSalariesAnnual[5]`, `payrollTaxPct[5]`, `otherOpexPct[5]` (replaces `otherMonthly` as dollar amount)
And new per-year fields are added: `targetPreTaxProfitPct[5]`, `shareholderSalaryAdj[5]`, `distributions[5]`, `nonCapexInvestment[5]`
And missing single-value fields are added to the UI: `arDays`, `apDays`, `inventoryDays`, `taxPaymentDelayMonths`, `ebitdaMultiple`

**AC-2: Existing plan migration is lossless**

Given existing plans store single-value `FinancialFieldValue` fields
When the migration runs
Then current single values are broadcast into 5-element arrays (e.g., `cogsPct: {currentValue: 0.35}` → `cogsPct: [{currentValue: 0.35}, {currentValue: 0.35}, {currentValue: 0.35}, {currentValue: 0.35}, {currentValue: 0.35}]`)
And the migration is semantically identical — no data loss, no behavioral change for existing plans
And plans continue to produce identical engine output before and after migration

**AC-3: Reports inline editing supports independent per-year values**

Given I am editing inputs via Reports inline editing (Financial Statement tabs)
When I edit a value in a specific year column
Then only that year's value changes — other years retain their independent values
And the linked-column broadcast behavior from Story 5.2 is removed (editing one year no longer updates all years)
And the link icons in column headers and the 200ms flash animation on non-edited columns are removed
And a "Copy Year 1 to all years" action is available for users who want to broadcast a single value

**AC-4: Forms mode (My Plan) shows 5 input columns per per-year field**

Given I am editing inputs in Forms mode (My Plan)
When the form renders per-year fields
Then each per-year field shows 5 input columns labeled Year 1 through Year 5
And by default, Year 2-5 inherit Year 1's value with a visual indicator (link icon, lighter text) showing they are inherited
And editing Year 2-5 breaks the inheritance for that specific year — the value becomes independent
And a "Reset to Year 1" action is available per cell to re-establish inheritance
And single-value fields (arDays, apDays, inventoryDays, taxPaymentDelayMonths, ebitdaMultiple) show a single input column (not 5)

**AC-5: Facilities field alignment**

Given the Facilities field alignment is corrected
When the input structure is updated
Then the engine's single `facilitiesAnnual[5]` field is exposed directly in Reports inline editing as "Facilities ($)" per year (matching the reference spreadsheet)
And in Forms mode (My Plan), the guided decomposition (Rent, Utilities, Telecom/IT, Vehicle Fleet, Insurance) rolls up into `facilitiesAnnual[year]` with per-year support
And the old `rentMonthly`, `utilitiesMonthly`, `insuranceMonthly` fields are replaced by the consolidated structure

**AC-6: Other OpEx unit correction**

Given Other OpEx is changed from flat dollar amount to % of revenue
When the input displays in both Reports inline editing and Forms mode
Then Other OpEx shows as a percentage field ("Other OpEx %") in both surfaces
And migration converts existing dollar values (`otherMonthly` in cents) to equivalent percentages based on projected Year 1 revenue
And the `unwrapForEngine` translation no longer needs the dollar-to-percentage conversion (it was a known limitation — see `plan-initialization.ts:305-308`)

**AC-7: unwrapForEngine translation layer updated**

Given the `PlanFinancialInputs` → `FinancialInputs` translation layer in `shared/plan-initialization.ts`
When `unwrapForEngine` processes the new per-year structure
Then it passes per-year arrays directly to the engine instead of broadcasting single values via `fill5()`
And the facilities calculation no longer sums `rentMonthly + utilitiesMonthly + insuranceMonthly` with 3% escalation — it passes `facilitiesAnnual` arrays directly
And new fields (`managementSalariesAnnual`, `payrollTaxPct`, `targetPreTaxProfitPct`, `shareholderSalaryAdj`, `distributions`, `ebitdaMultiple`, `arDays`, `apDays`, `inventoryDays`, `taxPaymentDelayMonths`, `nonCapexInvestment`) are mapped from `PlanFinancialInputs` to `FinancialInputs`
And hardcoded defaults (e.g., `managementSalariesAnnual: [0,0,0,0,0]`, `payrollTaxPct: fill5(DEFAULT_PAYROLL_TAX_PCT)`, `arDays: DEFAULT_AR_DAYS`) are replaced by user-editable values

## Dev Notes

### Architecture Patterns to Follow

- **FinancialFieldValue wrapper**: Every user-editable field uses the `FinancialFieldValue` interface (`shared/financial-engine.ts:25-32`). Per-year fields become arrays of 5 `FinancialFieldValue` objects, not arrays of raw numbers.
- **PlanFinancialInputs → FinancialInputs pipeline**: `buildPlanFinancialInputs()` creates the JSONB-stored structure from brand parameters. `unwrapForEngine()` extracts raw values for the engine. Both functions live in `shared/plan-initialization.ts`.
- **Currency in cents**: All currency amounts stored as cents (integers). `dollarsToCents()` / `centsToDollars()` for conversion. See `shared/financial-engine.ts:10`.
- **Percentages as decimals**: Stored as decimals (0.065 = 6.5%). UI displays with `(value * 100).toFixed(1)%`.
- **Auto-save pattern**: Both surfaces (My Plan and Reports) write to the same `financial_inputs` JSONB column via `PATCH /api/plans/:id`. Debounced at 2s idle. Changes on one surface immediately reflect on the other (FR97).
- **FIELD_METADATA registry**: `client/src/lib/field-metadata.ts` defines labels, format types for all fields. Must be extended for new fields.
- **INPUT_FIELD_MAP**: `client/src/components/planning/statements/input-field-map.ts` maps P&L row keys to `PlanFinancialInputs` paths for inline editing. Must be extended for new editable rows.
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
- **Scenario engine impact**: `client/src/lib/scenario-engine.ts` and `client/src/lib/sensitivity-engine.ts` call `unwrapForEngine` or produce `FinancialInputs` directly. Verify they work with the new `PlanFinancialInputs` structure. The sensitivity engine applies percentage multipliers to base inputs — those multipliers should apply per-year.
- **`buildPlanFinancialInputs` changes**: This function (`shared/plan-initialization.ts:85-118`) creates the default `PlanFinancialInputs` from `BrandParameters`. It needs to create 5-element `FinancialFieldValue` arrays for per-year fields and add new fields (managementSalaries, payrollTaxPct, etc.) with appropriate brand defaults.
- **BrandParameters may not have all new fields**: `BrandParameters` in `shared/financial-engine.ts` may not define brand defaults for all new fields (managementSalaries, targetPreTaxProfitPct, etc.). Use sensible fallback defaults (0 for currencies, engine constants for percentages).
- **Inline editing cell targeting**: Currently `INPUT_FIELD_MAP` maps row keys to single `PlanFinancialInputs` paths. With per-year editing, the column index must also be passed to identify which year's value is being edited. The `onCellEdit` callback will need to accept a year index parameter.
- **Flash animation removal**: `animate-flash-linked` CSS class in `inline-editable-cell.tsx:92` and the `flashingRows` state management in `pnl-tab.tsx:403-434` implement the linked-column broadcast animation. Remove this code entirely — it's obsolete when columns are independent.
- **Test data impact**: `shared/plan-initialization.test.ts` has extensive tests for `buildPlanFinancialInputs` and `unwrapForEngine`. These tests must be updated to reflect the new per-year array structure. The reference validation tests in `shared/financial-engine-reference.test.ts` must continue passing unchanged.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `shared/financial-engine.ts` | MODIFY | Update `PlanFinancialInputs` interface to use per-year `FinancialFieldValue[]` arrays. Add new field groups. Do NOT modify `FinancialInputs`, `EngineInput`, or `calculateProjections`. |
| `shared/plan-initialization.ts` | MODIFY | Rewrite `buildPlanFinancialInputs()` for per-year arrays. Rewrite `unwrapForEngine()` to extract per-year values directly. Add migration function for old → new format. Remove `fill5()` calls for per-year fields. |
| `shared/plan-initialization.test.ts` | MODIFY | Update all tests for new `PlanFinancialInputs` structure. Add migration tests. Verify engine output remains identical for migrated data. |
| `shared/schema.ts` | MODIFY | Update `$type<PlanFinancialInputs>()` annotation (auto-follows interface change). |
| `server/storage.ts` | MODIFY | Add migration logic in `getPlan()` or plan retrieval path — detect old format and migrate on read. |
| `client/src/lib/field-metadata.ts` | MODIFY | Add `FIELD_METADATA` entries for all new fields. Add per-year format support. Add new category entries if needed. |
| `client/src/components/planning/statements/input-field-map.ts` | MODIFY | Extend `INPUT_FIELD_MAP` with new editable rows (facilities, management-salaries, payroll-tax-pct, royalty-pct, ad-fund-pct). Update `other-opex` from currency to percentage format. |
| `client/src/components/planning/statements/pnl-tab.tsx` | MODIFY | Remove linked-column flash behavior (`flashingRows`, `animate-flash-linked`). Update `handleCommitEdit` to pass year index. Add "Copy Year 1 to all" action. |
| `client/src/components/planning/statements/inline-editable-cell.tsx` | MODIFY | Remove `isFlashing` prop and `animate-flash-linked` class (linked columns removed). |
| `client/src/components/planning/forms-mode.tsx` | MODIFY | Add per-year input rendering (5 columns per per-year field). Add inheritance behavior (Year 2-5 inherit Year 1). Add "Reset to Year 1" affordance. Add new field sections. |
| `client/src/components/planning/input-panel.tsx` | MODIFY | Update to pass new fields to `FormsMode`. |
| `client/src/hooks/use-field-editing.ts` | MODIFY | Update field editing hook to handle per-year array updates (year index parameter). |
| `client/src/lib/sensitivity-engine.ts` | MODIFY | Verify/update sensitivity multipliers work with new per-year `PlanFinancialInputs` structure. |
| `client/src/lib/scenario-engine.ts` | MODIFY | Verify/update scenario engine works with new `PlanFinancialInputs` structure. |
| `client/src/components/planning/statements/balance-sheet-tab.tsx` | MODIFY | Add inline editable cells for arDays, apDays, inventoryDays, taxPaymentDelayMonths. |
| `client/src/components/planning/statements/valuation-tab.tsx` | MODIFY | Add inline editable cell for ebitdaMultiple. |

### Testing Expectations

- **Unit tests (Vitest)**: `shared/plan-initialization.test.ts` — update all existing tests, add tests for migration, per-year array extraction, new field defaults. Test that engine output is identical for migrated vs. pre-migration data.
- **Reference validation tests**: `shared/financial-engine-reference.test.ts` — must continue passing unchanged. These validate engine accuracy against the reference spreadsheet.
- **Engine tests**: `shared/financial-engine.test.ts` — should pass unchanged (engine interface is not changing).
- **E2E tests (Playwright)**: Verify Reports inline editing works per-year (edit Year 3, confirm Year 1 unchanged). Verify Forms mode per-year layout. Verify "Copy Year 1 to all" action. Verify migration (load existing plan, confirm values preserved).
- **Critical ACs for automated coverage**: AC-2 (migration lossless), AC-3 (independent per-year editing), AC-7 (unwrapForEngine correctness).

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
