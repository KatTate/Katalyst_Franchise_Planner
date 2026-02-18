# Story 5.6: Quick Entry Input-Output Integration

Status: draft

## Story

As a franchisee viewing Reports,
I want to edit input values directly within the P&L, Balance Sheet, Cash Flow, and Valuation tabs,
So that I work inside the financial document I already understand — the financial statements ARE my editing surface, not a separate input grid (FR7h, F2).

## Epics.md vs. UX Spec v3 Reconciliation

**Critical divergence:** The original epics.md Story 5.6 was written before the UX spec v3 retrospective revision (2026-02-16). UX spec v3 is the authoritative design document and supersedes the epics.md acceptance criteria where they conflict.

**Changes from original epics.md:**

| Epics.md (Original) | UX Spec v3 (Authoritative) | Impact |
|---------------------|---------------------------|--------|
| Mode-gated editing: Quick Entry = editable, Forms/PA = read-only | Editing is ALWAYS available in Reports — no mode gating | Remove mode checks entirely |
| "All Inputs" tab preserving flat grid | No "All Inputs" tab needed — P&L + BS + CF cover all inputs | No "All Inputs" tab to build |
| One-time orientation overlay | No orientation overlay — nothing to explain | No overlay to build |
| `quick-entry-mode.tsx` preserved as "All Inputs" engine | `quick-entry-mode.tsx` is RETIRED | Component retirement |
| P&L default tab only in Quick Entry mode | Summary remains default for all users | No tab-default logic change |
| Mode switcher controls editing | No mode switcher exists in v3 architecture | Mode switcher already exists but is orthogonal to this story |

**Design principle (UX spec v3 Part 3):** "Reports always renders financial statements with input cells editable and computed cells read-only. There is no switch to flip."

## Acceptance Criteria

**Inline Editing in P&L Tab:**

1. Given the P&L tab renders in Reports, when I click an input cell (Monthly Revenue, COGS %, Direct Labor, Management Salaries, Facilities, Marketing, Other OpEx), then the cell enters inline edit mode: a focused text input replaces the display value, with a primary-colored border highlight. The cell content is the raw editable number (e.g., "30000" for $30,000 currency, "32.0" for 32% percentage).

2. Given I am editing an input cell in the P&L tab, when I type a new value and blur or press Enter, then the value is parsed according to its format (currency → cents conversion via `parseDollarsToCents`, percentage → decimal via `/ 100`), the `PlanFinancialInputs` are updated via the `useFieldEditing` hook pattern, engine recalculation is triggered, and all dependent computed cells update immediately (optimistic UI).

3. Given I am editing an input cell in the P&L tab, when I press Tab, then focus moves to the next input cell in the same column (skipping computed cells). Shift+Tab moves to the previous input cell. Enter confirms and exits edit mode. Escape cancels the edit and restores the previous value.

4. Given I edit an input cell in any year column (pre-Epic-7), when the value is committed, then ALL year columns for that input update simultaneously (linked columns behavior). The non-edited year cells briefly flash (200ms highlight) to indicate the change propagated.

**Inline Editing in Balance Sheet Tab:**

5. Given the Balance Sheet tab renders, when I click an input cell (AR Days, AP Days, Inventory Days, Tax Payment Delay), then the same inline editing behavior from AC1-AC4 applies. The input maps to the corresponding `PlanFinancialInputs` field.

**Inline Editing in Cash Flow Tab:**

6. Given the Cash Flow tab renders, when I identify input cells, then the Cash Flow tab has NO direct input cells in the current engine model — all Cash Flow values are computed from P&L and Balance Sheet inputs. Input cell visual markers (`isInput: true`) are NOT present on Cash Flow rows. The tab is fully read-only.

**Inline Editing in Valuation Tab:**

7. Given the Valuation tab renders, when I click the EBITDA Multiple input cell, then inline editing activates. EBITDA Multiple is the single editable input on this tab (already visually marked with `isInput: true` in Story 5.5). The edit updates the valuation computation immediately.

**Input Cell Visual Treatment (Already Implemented — Verify):**

8. Given any statement tab renders, then input cells are visually distinguished with: subtle tinted background (`bg-primary/5`), thin dashed left border (`border-l-2 border-dashed border-primary/20`), and a pencil icon visible on row hover (`invisible group-hover:visible`). This visual treatment was implemented in Stories 5.3-5.5 and should be preserved unchanged.

**Auto-Save Integration:**

9. Given I edit any input cell in any statement tab, when the value is committed, then the change is queued via the plan's auto-save system with the existing 2-second debounce. The save indicator in the planning header reflects the pending/saving/saved state.

**Linked Columns Indicator (Pre-Epic-7):**

10. Given any statement tab with input cells renders, then a small link icon and explanatory text appears in the column header area: "All years share the same value. Per-year values available in a future update." This sets expectations for why editing Y2 changes Y1-Y5.

**Editing is NOT Mode-Gated:**

11. Given I am viewing Reports in ANY experience tier (Planning Assistant, Forms, or Quick Entry), then input cells are ALWAYS editable. There is no mode check, no "switch to Quick Entry" tooltip, no read-only state for input cells in Reports. The visual distinction between input and computed cells is sufficient for discoverability.

**Component Retirement — `quick-entry-mode.tsx`:**

12. Given `quick-entry-mode.tsx` (571 lines, flat TanStack Table grid) exists from Epic 4, then its functionality is fully superseded by inline editing within the financial statement tabs. The component is NOT deleted in this story (it remains referenced by `InputPanel`), but no new features are added to it and it is not wired into the Reports/Financial Statements view.

**ARIA & Accessibility:**

13. Given input cells are editable, then they use `role="gridcell"` with `aria-readonly="false"`. When in edit mode, the input element has `aria-label` describing the field (e.g., "Monthly Revenue, Year 1"). Computed cells retain `aria-readonly="true"`.

## Dev Notes

### Input Field Mapping — Statement Row to PlanFinancialInputs

The critical engineering challenge is mapping statement row definitions (e.g., PnlRowDef with `field: "monthlyRevenue"`) to the correct `PlanFinancialInputs` category and field name for the `useFieldEditing` hook.

**P&L Input Mapping:**

| Row Key | Row Field | PlanFinancialInputs Category | PlanFinancialInputs Field | Format |
|---------|-----------|------------------------------|--------------------------|--------|
| monthly-revenue | monthlyRevenue | revenue | monthlyAuv | currency |
| cogs-pct | cogsPct | operatingCosts | cogsPct | percentage |
| direct-labor | directLabor | operatingCosts | laborPct | percentage |
| mgmt-salaries | managementSalaries | operatingCosts | rentMonthly | currency |
| facilities | facilities | operatingCosts | utilitiesMonthly | currency |
| marketing | marketing | operatingCosts | marketingPct | percentage |
| other-opex | otherOpex | operatingCosts | otherMonthly | currency |

**IMPORTANT:** The mapping above is APPROXIMATE. The actual field names in `PlanFinancialInputs` (defined in `shared/financial-engine.ts`) may differ from the display field names in the statement rows. The implementer MUST:
1. Read `shared/financial-engine.ts` to find the exact `PlanFinancialInputs` structure
2. Read `client/src/lib/field-metadata.ts` for the `FIELD_METADATA` mapping (category → fieldName → format)
3. Cross-reference with `shared/plan-initialization.ts` for `updateFieldValue` and `resetFieldToDefault`
4. Create an explicit `INPUT_FIELD_MAP` that maps each statement row's `key` to its `{ category, fieldName, format }` in `PlanFinancialInputs`

**Balance Sheet Input Mapping:** AR Days, AP Days, Inventory Days, Tax Payment Delay — these are working capital parameters. Check `PlanFinancialInputs` for their exact category/field path.

**Valuation Input Mapping:** EBITDA Multiple — check if this exists in `PlanFinancialInputs` or needs to be added.

### Architecture Pattern

The inline editing integration follows the existing patterns:

1. **Data flow:** `usePlan` hook provides `plan.financialInputs` → statement tabs read computed outputs from `usePlanOutputs` → editing writes back to `plan.financialInputs` via `queueSave` → engine recalculates → `usePlanOutputs` cache invalidates → computed cells update.

2. **Component wiring:** The `FinancialStatements` container currently receives only `planId` and `defaultTab`. To enable editing, it needs access to `plan.financialInputs` and a `queueSave` callback. These must be threaded from `PlanningWorkspace` → `FinancialStatements` → individual tab components → `PnlRow`/`BsRow`/etc.

3. **EditableCell reuse:** The existing `EditableCell` component from Epic 4 handles click-to-edit, Tab navigation, auto-formatting, and auto-save. However, it was designed for the flat grid context (`quick-entry-mode.tsx`) and expects `FinancialFieldValue` objects. The statement tabs work with computed display values, not raw `FinancialFieldValue` objects. An adapter pattern or a new lightweight `InlineEditableCell` component may be needed.

4. **Possible approach — `InlineEditableCell`:** A focused component (~80 lines) that:
   - Accepts: `displayValue: string`, `rawValue: number`, `format: FormatType`, `inputMapping: { category, fieldName }`, `onCommit: (category, fieldName, parsedValue) => void`
   - Renders: display value by default, switches to `<input>` on click
   - Handles: Tab/Shift+Tab to next/prev input cell, Enter to confirm, Escape to cancel
   - Emits: parsed value on commit
   - Does NOT need the full `FinancialFieldValue` object or range checking (those are Epic 4 Quick Entry concerns)

### Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `client/src/components/planning/statements/inline-editable-cell.tsx` | CREATE | Lightweight inline editing cell for statement tables (~80 lines) |
| `client/src/components/planning/statements/pnl-tab.tsx` | MODIFY | Add `onCellEdit` callback, replace display-only input cells with `InlineEditableCell`, add input mapping |
| `client/src/components/planning/statements/balance-sheet-tab.tsx` | MODIFY | Same as P&L — add editing for AR Days, AP Days, etc. |
| `client/src/components/planning/statements/valuation-tab.tsx` | MODIFY | Add editing for EBITDA Multiple |
| `client/src/components/planning/financial-statements.tsx` | MODIFY | Accept `financialInputs` and `onCellEdit` props, pass to tab components |
| `client/src/pages/planning-workspace.tsx` | MODIFY | Pass `plan.financialInputs` and `queueSave` to `FinancialStatements` when in Reports view |

### Pre-Epic-7 Linked Columns Constraint

All input fields in `PlanFinancialInputs` are single values (not per-year arrays). Editing any year column updates the single value, which the engine then applies to all 60 months. This means:
- Editing "Monthly Revenue" in Y3 column changes the value for Y1-Y5
- The UI must flash all year columns to show propagation
- A linked columns indicator in the header reinforces this behavior

### Testing Strategy

- P&L: Edit Monthly Revenue → verify all year columns update, verify Annual Revenue recomputes
- P&L: Edit COGS % → verify COGS $, Gross Profit, all downstream computed cells update
- Balance Sheet: Edit AR Days → verify Accounts Receivable updates
- Valuation: Edit EBITDA Multiple → verify Enterprise Value updates
- Tab navigation: Tab through P&L input cells, verify computed cells are skipped
- Auto-save: Edit a cell, verify save indicator shows pending → saving → saved
- Linked columns: Edit Y2, verify Y1/Y3/Y4/Y5 flash and update

### Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Field mapping errors (wrong PlanFinancialInputs field) | Explicit INPUT_FIELD_MAP with unit tests |
| Performance — editing triggers full engine recalc | Engine is fast (~10ms); debounce saves, not recalcs |
| EditableCell from Epic 4 doesn't fit statement table layout | Create new InlineEditableCell (~80 lines) optimized for table cells |
| Cash Flow tab confusion — users expect editable cells | Clear: Cash Flow has NO inputs, all values derived from P&L + BS |
| Linked columns surprise — editing Y2 changes Y1 | Visual indicator + flash animation on propagation |

### Story Sequence Position

- **Depends on:** Stories 5.1-5.5 (engine extension, all statement tabs implemented with visual input markers)
- **Enables:** Story 5.7 (Scenario Comparison), Story 5.8 (Guardian Bar), Story 5.9 (Impact Strip)
- **Does NOT depend on:** Epic 7 (per-year independence)
