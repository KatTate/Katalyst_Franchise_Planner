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

### Navigation

User reaches this feature via: **Sidebar → My Plan** → collapsible form sections (Revenue, Operating Costs, Profitability & Distributions, Working Capital & Valuation). All per-year editing in this story occurs within the My Plan forms view (`forms-mode.tsx`).

### Architecture Patterns to Follow

- **FIELD_METADATA registry** _(Architecture §3.2 Per-Field Metadata Pattern)_: `client/src/lib/field-metadata.ts` — all new fields and categories already registered by Story 7.1a.
- **Two-Surface Principle** _(Architecture §4.4)_: Forms mode (My Plan) and Reports (inline editing) share the same `financial_inputs` JSONB state. Edits on either surface immediately reflect on the other.
- **Auto-save pattern** _(Architecture §5.2 Auto-Save & Crash Recovery)_: Forms mode writes to the same `financial_inputs` JSONB column via `PATCH /api/plans/:id`. Debounced at 2s idle. Changes immediately reflect in Reports.
- **Component hierarchy** _(Architecture §4.3)_: `forms-mode.tsx` renders collapsible sections, each containing field rows with input controls.
- **data-testid convention** _(Architecture §4.5 Testing Conventions)_: Financial values use `value-{metric}-{period}` pattern. Interactive elements use `{action}-{target}`.
- **Component file naming** _(Architecture §4.1 File Organization)_: kebab-case. Component names PascalCase.

### Anti-Patterns & Hard Constraints

- **DO NOT modify `components/ui/*`** — these are shadcn/ui primitives.
- **DO NOT modify `server/index.ts`, `server/vite.ts`, `server/static.ts`**.
- **DO NOT create new API endpoints** — use existing `PATCH /api/plans/:id`.
- **DO NOT introduce inheritance detection logic** — all 5 years are always independent (see AC-3 design decision).
- **DO NOT introduce new npm packages**.

### UI/UX Deliverables

- **Target surface**: My Plan forms view (`client/src/components/planning/forms-mode.tsx`)
- **Modified components**: `FormsMode` (per-year input rendering, new field sections), `InputPanel` (field pass-through)
- **Per-year input layout**: Each per-year field row renders 5 inline input columns labeled Year 1–Year 5. Single-value fields render 1 input column.
- **"Copy Year 1 to all years" action**: Button displayed per per-year field row. Uses existing shadcn AlertDialog or equivalent confirmation pattern already in the project.
- **New form sections**: Profitability & Distributions, Working Capital & Valuation — rendered as collapsible sections matching existing section styling.

### UI States

- **Loading**: While auto-save is persisting a per-year edit, show the existing save indicator pattern (debounced 2s idle). No additional loading state needed for individual field edits.
- **Error / save failure**: If `PATCH /api/plans/:id` fails during save, show inline retry per the architecture's error handling pattern (Architecture §5.2) — never silently drop changes.
- **Error / copy-all failure**: If save fails during "Copy Year 1 to all years", show an error toast and revert all year values to their pre-copy state.
- **Success**: On successful "Copy Year 1 to all years", all 5 year cells update to reflect Year 1's value. No additional success toast needed — the visual update is sufficient confirmation.
- **Empty state**: N/A — per-year fields always have a value (defaulted from brand parameters or migration in Story 7.1a).

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

### References

- **PRD Requirement**: FR7i (per-year independent input editing), FR7j (full input assumption set)
- **Architecture Document**: `_bmad-output/planning-artifacts/architecture.md`
  - §3.2 Per-Field Metadata Pattern — field structure within `financial_inputs` JSONB
  - §4.1 File Organization — kebab-case files, PascalCase components
  - §4.3 Component Hierarchy — `forms-mode.tsx` collapsible sections with field rows
  - §4.4 Two-Surface Principle — My Plan (forms) and Reports (inline editing) share the same `financial_inputs` state
  - §4.5 Testing Conventions — `data-testid` patterns for financial values and interactive elements
  - §5.2 Auto-Save & Crash Recovery — debounced save, inline retry on failure
- **Epics Document**: `_bmad-output/planning-artifacts/epics.md` — Epic 7, Story 7.1c (line 1947)
- **Predecessor Stories**: Story 7.1a registered all new fields and FIELD_METADATA categories; this story renders them in the Forms surface

### Dependencies

- **Depends on**: Story 7.1a (Data Model Restructuring & Migration)
- **Can parallel with**: Story 7.1b (Reports Per-Year Editing)

### Completion Notes

### File List

### Testing Summary
