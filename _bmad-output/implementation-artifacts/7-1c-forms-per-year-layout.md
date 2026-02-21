# Story 7.1c: Forms Mode Per-Year Layout

Status: ready-for-dev

## Story

As a franchisee,
I want to see and edit Year 1 through Year 5 values for each assumption in the My Plan forms,
so that I can model growth trajectories through the guided planning experience (FR7i).

## Acceptance Criteria

**AC-1: Forms mode shows 5 input columns per per-year field**

Given I am editing inputs in Forms mode (My Plan)
When the form renders per-year fields
Then each per-year field shows 5 input columns labeled Year 1 through Year 5
And single-value fields (arDays, apDays, inventoryDays, taxPaymentDelayMonths, ebitdaMultiple) show a single input column (not 5)

**AC-2: "Copy Year 1 to all years" broadcast action**

Given I am editing a per-year field in Forms mode
When Year 2–5 show the same value as Year 1 (initial state after plan creation or migration)
Then a "Copy Year 1 to all years" button is available per field row
And clicking it shows a confirmation prompt ("This will overwrite Years 2–5 with Year 1's value. Continue?") before executing
And clicking Cancel makes no changes

**AC-3: Independent per-year editing**

Given I am editing a per-year field in Forms mode
When I change a value in Year 2, 3, 4, or 5
Then that year's value updates independently — other years retain their values
And editing any year always writes the value directly to the `FinancialFieldValue` for that year index in the JSONB

**Design decision — inheritance model simplified:** The original design proposed a UI-only "inheritance" concept where Year 2–5 would visually appear as inherited from Year 1 (lighter text, link icons) and auto-update when Year 1 changed. This has been simplified to avoid a fragile heuristic (value-equality detection produces false positives when a user intentionally sets Year 2 to the same value as Year 1). Instead:
- All 5 years are always shown as independent editable fields
- "Copy Year 1 to all years" provides the broadcast convenience when needed
- No inheritance detection, no "Reset to Year 1" per-cell action, no visual inherited/independent distinction
- This is consistent with how Reports inline editing works (AC-1 in Story 7.1b) — both surfaces treat all 5 years as independent values

**AC-4: New field sections rendered in Forms mode**

Given the form renders the new fields added in Story 7.1a
When the user views the form
Then the following new fields are rendered in their respective sections:
- **Operating Costs**: Management Salaries (annual, per-year, currency), Payroll Tax & Benefits % (per-year, percentage)
- **Profitability & Distributions**: Target Pre-Tax Profit % (per-year, percentage), Shareholder Salary Adjustment (per-year, currency), Distributions (per-year, currency), Non-CapEx Investment (per-year, currency)
- **Working Capital & Valuation**: AR Days (single, integer), AP Days (single, integer), Inventory Days (single, integer), Tax Payment Delay Months (single, integer), EBITDA Multiple (single, decimal with "x" suffix display)

## Dev Notes

### Architecture Patterns to Follow

- **FIELD_METADATA registry**: `client/src/lib/field-metadata.ts` — all new fields and categories already registered by Story 7.1a.
- **Auto-save pattern**: Forms mode writes to the same `financial_inputs` JSONB column via `PATCH /api/plans/:id`. Debounced at 2s idle. Changes immediately reflect in Reports.
- **data-testid convention**: Financial values use `value-{metric}-{period}` pattern. Interactive elements use `{action}-{target}`.
- **Component file naming**: kebab-case. Component names PascalCase.

### Anti-Patterns & Hard Constraints

- **DO NOT modify `components/ui/*`** — these are shadcn/ui primitives.
- **DO NOT modify `server/index.ts`, `server/vite.ts`, `server/static.ts`**.
- **DO NOT create new API endpoints** — use existing `PATCH /api/plans/:id`.
- **DO NOT introduce inheritance detection logic** — all 5 years are always independent (see AC-3 design decision).
- **DO NOT introduce new npm packages**.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/components/planning/forms-mode.tsx` | MODIFY | Add per-year input rendering (5 columns per per-year field). Add "Copy Year 1 to all" button per row. Add new field sections (Profitability & Distributions, Working Capital & Valuation). |
| `client/src/components/planning/input-panel.tsx` | MODIFY | Update to pass new fields to `FormsMode`. |

### Testing Expectations

- **E2E tests (Playwright)**:
  - Verify per-year fields show 5 input columns labeled Year 1–5
  - Verify single-value fields show 1 input column
  - Edit Year 3 in Forms → confirm other years unchanged
  - "Copy Year 1 to all" → confirm dialog → confirm all years updated
  - "Copy Year 1 to all" → Cancel → confirm no changes
  - Verify new field sections rendered (Profitability & Distributions, Working Capital & Valuation)
  - **Cross-surface consistency**: Edit a per-year value in Forms → switch to Reports → confirm value reflected. Edit in Reports → switch to Forms → confirm value reflected.

### Dependencies

- **Depends on**: Story 7.1a (Data Model Restructuring & Migration)
- **Can parallel with**: Story 7.1b (Reports Per-Year Editing)

### Completion Notes

### File List

### Testing Summary
