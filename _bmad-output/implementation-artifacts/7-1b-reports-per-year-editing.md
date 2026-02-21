# Story 7.1b: Reports Per-Year Inline Editing

Status: ready-for-dev

## Story

As a franchisee,
I want to edit each year's financial assumption independently in the Reports view,
so that I can fine-tune my 5-year projections directly within the financial statements (FR7i).

## Acceptance Criteria

**AC-1: Reports inline editing supports independent per-year values**

Given I am editing inputs via Reports inline editing (Financial Statement tabs)
When I edit a value in a specific year column
Then only that year's value changes — other years retain their independent values
And the linked-column broadcast behavior from Story 5.2 is removed (editing one year no longer updates all years)
And the link icons in column headers and the 200ms flash animation on non-edited columns are removed

**AC-2: "Copy Year 1 to all years" action**

Given I am editing a per-year field in Reports inline editing
When I want to broadcast Year 1's value to all years
Then a "Copy Year 1 to all years" action is available (button or context menu near the input row, not a column header feature)
And clicking "Copy Year 1 to all years" shows a confirmation prompt ("This will overwrite Years 2–5 with Year 1's value. Continue?") before executing, to prevent accidental data loss
And clicking Cancel in the confirmation prompt makes no changes to any year's values

**AC-3: INPUT_FIELD_MAP extended for new editable rows**

Given the Reports P&L tab renders financial statement rows
When per-year editable rows are displayed
Then all existing P&L editable rows (`monthly-revenue`, `cogs-pct`, `dl-pct`, `marketing`, `other-opex`) are per-year editable
And new editable rows are added: `facilities`, `management-salaries`, `payroll-tax-pct`, `royalty-pct`, `ad-fund-pct`
And `other-opex` changes from currency input to percentage input (reflecting the unit correction in Story 7.1a)

## Dev Notes

### Navigation

User reaches this feature via: **Sidebar → Reports → P&L tab**. All per-year inline editing in this story occurs within the P&L tab of the Reports view.

### Architecture Patterns to Follow

- **PerYearEditableRow composition pattern** _(Architecture §4.3 Component Hierarchy, §4.4 Two-Surface Principle)_: Create a new `PerYearEditableRow` component that *composes* `InlineEditableCell` five times (one per year). This respects the anti-pattern "DO NOT duplicate existing code" while providing the per-year editing semantics. `PerYearEditableRow` handles year index routing, "Copy Year 1 to all" context, and row-level concerns. Each cell delegates to `InlineEditableCell` for the actual edit UX.
- **FIELD_METADATA registry** _(Architecture §3.2 Per-Field Metadata Pattern)_: `client/src/lib/field-metadata.ts` defines labels, format types for all fields. The new fields and categories from Story 7.1a will already be registered.
- **INPUT_FIELD_MAP** _(Architecture §4.3 Component Hierarchy)_: `client/src/components/planning/statements/input-field-map.ts` maps P&L row keys to `PlanFinancialInputs` paths for inline editing. Must be extended for new editable rows.
- **Auto-save pattern** _(Architecture §5.2 Auto-Save & Crash Recovery)_: Both surfaces write to the same `financial_inputs` JSONB column via `PATCH /api/plans/:id`. Debounced at 2s idle.
- **data-testid convention** _(Architecture §4.5 Testing Conventions)_: Financial values use `value-{metric}-{period}` pattern. Interactive elements use `{action}-{target}`.
- **Component file naming** _(Architecture §4.1 File Organization)_: kebab-case (`per-year-editable-row.tsx`). Component names PascalCase (`PerYearEditableRow`).

### Anti-Patterns & Hard Constraints

- **DO NOT modify `components/ui/*`** — these are shadcn/ui primitives and must never be manually edited.
- **DO NOT modify `server/index.ts`, `server/vite.ts`, `server/static.ts`** — infrastructure files.
- **DO NOT create new API endpoints** — the existing `PATCH /api/plans/:id` handles all input updates.
- **DO NOT add `if (mode === 'quick-entry')` conditionals** — the two-surface architecture means Reports inline editing is always editable. No mode toggles.
- **DO NOT use `fill5()` for fields that now have per-year input** — each year is independently editable.
- **DO NOT introduce new npm packages** — all required UI components already exist in the project.

### UI/UX Deliverables

- **Target surface**: Reports view → P&L tab (`client/src/components/planning/statements/pnl-tab.tsx`)
- **New component**: `PerYearEditableRow` — renders 5 inline-editable cells (one per year column) for each per-year financial field, with a "Copy Year 1 to all years" action
- **Removed UI elements**: Link icons in year column headers, 200ms flash animation on non-edited columns
- **Confirmation dialog**: Standard confirmation prompt for "Copy Year 1 to all years" action (use existing shadcn AlertDialog or equivalent pattern already in the project)

### UI States

- **Loading**: While auto-save is persisting a per-year edit, the cell should show the existing save indicator pattern (debounced 2s idle). No additional loading state needed for individual cell edits.
- **Error / save failure**: If `PATCH /api/plans/:id` fails during save, show inline retry per the architecture's error handling pattern (Architecture §5.2) — never silently drop changes.
- **Error / copy-all failure**: If save fails during "Copy Year 1 to all years", show an error toast and revert all year values to their pre-copy state.
- **Success**: On successful "Copy Year 1 to all years", all 5 year cells update to reflect Year 1's value. No additional success toast needed — the visual update is sufficient confirmation.
- **Empty state**: N/A — per-year fields always have a value (defaulted from brand parameters or migration).

### Gotchas & Integration Warnings

- **Inline editing cell targeting**: Currently `INPUT_FIELD_MAP` maps row keys to single `PlanFinancialInputs` paths. With per-year editing, the column index must also be passed to identify which year's value is being edited. The `onCellEdit` callback will need to accept a year index parameter.
- **Flash animation removal**: `animate-flash-linked` CSS class in `inline-editable-cell.tsx:92` and the `flashingRows` state management in `pnl-tab.tsx:403-434` implement the linked-column broadcast animation. Remove this code entirely — it's obsolete when columns are independent.
- **`use-field-editing.ts` hook update**: The field editing hook must be updated to handle per-year array updates (year index parameter).

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/components/planning/statements/per-year-editable-row.tsx` | CREATE | New component composing 5 `InlineEditableCell` instances with year-index routing and "Copy Year 1 to all" action. |
| `client/src/components/planning/statements/input-field-map.ts` | MODIFY | Extend `INPUT_FIELD_MAP` with new editable rows (facilities, management-salaries, payroll-tax-pct, royalty-pct, ad-fund-pct). Update `other-opex` from currency to percentage format. |
| `client/src/components/planning/statements/pnl-tab.tsx` | MODIFY | Remove linked-column flash behavior (`flashingRows`, `animate-flash-linked`). Update `handleCommitEdit` to pass year index. Integrate `PerYearEditableRow`. Add "Copy Year 1 to all" action. |
| `client/src/components/planning/statements/inline-editable-cell.tsx` | MODIFY | Remove `isFlashing` prop and `animate-flash-linked` class (linked columns removed). |
| `client/src/hooks/use-field-editing.ts` | MODIFY | Update field editing hook to handle per-year array updates (year index parameter). |

### Testing Expectations

- **E2E tests (Playwright)**:
  - Edit Year 3 of a per-year field in Reports → confirm Year 1, 2, 4, 5 unchanged
  - "Copy Year 1 to all years" → confirm dialog appears → confirm all years updated
  - "Copy Year 1 to all years" → Cancel → confirm no years changed
  - Verify new editable rows (facilities, management-salaries, etc.) are editable in P&L tab
  - Verify `other-opex` shows as percentage input (not currency)
  - **Cross-surface consistency**: Edit a per-year value in Reports → switch to Forms mode → confirm value reflected correctly

### References

- **PRD Requirement**: FR7i (per-year independent input editing)
- **Architecture Document**: `_bmad-output/planning-artifacts/architecture.md`
  - §3.2 Per-Field Metadata Pattern — field structure within `financial_inputs` JSONB
  - §4.3 Component Hierarchy — `<PnlTab />` with inline-editable input cells
  - §4.4 Two-Surface Principle — My Plan (forms) and Reports (inline editing) share the same `financial_inputs` state
  - §5.2 Auto-Save & Crash Recovery — debounced save, inline retry on failure
- **Epics Document**: `_bmad-output/planning-artifacts/epics.md` — Epic 7, Story 7.1b (line 1935)
- **Predecessor Story**: Story 5.2 introduced linked-column broadcast behavior; this story removes it

### Dependencies

- **Depends on**: Story 7.1a (Data Model Restructuring & Migration)
- **Can parallel with**: Story 7.1c (Forms Per-Year Layout)
- **Blocks**: Nothing directly (but Story 7.1d's Reports-side new field editing depends on the `PerYearEditableRow` component created here)

### Completion Notes

### File List

### Testing Summary
