# Story 5.6: Quick Entry Input-Output Integration

Status: review

## Story

As a franchisee viewing Reports,
I want to edit input values directly within the P&L, Balance Sheet, Cash Flow, and Valuation tabs,
so that I work inside the financial document I already understand — the financial statements ARE my editing surface, not a separate input grid (FR7h, F2).

## Acceptance Criteria

**Inline Editing in P&L Tab:**

1. Given the P&L tab renders in Reports, when I click an input cell (Monthly Revenue, COGS %, Direct Labor %, Management Salaries, Facilities, Marketing, Other OpEx), then the cell enters inline edit mode: a focused text input replaces the display value, with a primary-colored border highlight. The cell content is the raw editable number (e.g., "30000" for $30,000 currency, "32.0" for 32% percentage).

2. Given I am editing an input cell in the P&L tab, when I type a new value and blur or press Enter, then the value is parsed according to its format (currency → cents conversion via `parseDollarsToCents`, percentage → decimal via `/ 100`), the `PlanFinancialInputs` are updated via the `useFieldEditing` hook pattern, engine recalculation is triggered, and all dependent computed cells update immediately (optimistic UI).

3. Given I am editing an input cell in the P&L tab, when I press Tab, then focus moves to the next input cell in the same column (skipping computed cells). Shift+Tab moves to the previous input cell. Enter confirms and exits edit mode. Escape cancels the edit and restores the previous value.

4. Given I edit an input cell in any year column (pre-Epic-7), when the value is committed, then ALL year columns for that input update simultaneously (linked columns behavior). The non-edited year cells briefly flash (200ms highlight) to indicate the change propagated.

**Inline Editing in Balance Sheet Tab:**

5. Given the Balance Sheet tab renders, then it contains NO direct input cells in the current `PlanFinancialInputs` model. The working capital assumptions (AR Days, AP Days, Inventory Days) exist in the raw `FinancialInputs` engine interface but are not exposed through `PlanFinancialInputs` with `FinancialFieldValue` metadata. The Balance Sheet tab is fully read-only for this story.

**Inline Editing in Cash Flow Tab:**

6. Given the Cash Flow tab renders, then it contains NO direct input cells — all Cash Flow values are computed from P&L and Balance Sheet inputs. The tab is fully read-only.

**Inline Editing in Valuation Tab:**

7. Given the Valuation tab renders, when I click the EBITDA Multiple input cell, then inline editing activates. EBITDA Multiple is the single editable input on this tab (already visually marked with `isInput: true` in Story 5.5). The edit updates the valuation computation immediately. EBITDA Multiple requires special handling — it is a top-level field on the raw `FinancialInputs` interface (not inside `PlanFinancialInputs`), defaulting to 3. The save path must write to the correct location.

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

### Architecture Patterns to Follow

- **State management (architecture.md Decision 8):** TanStack React Query for all server state. Optimistic cache updates for auto-save. Query keys use hierarchical arrays: `['plans', planId]`, `['plans', planId, 'outputs']`. Mutations always invalidate parent query keys after success.
  - Source: `_bmad-output/planning-artifacts/architecture.md` → Decision 8: State Management

- **Auto-save pattern (architecture.md Decision 6):** Client debounces financial input changes at 2-second idle after last keystroke. `PATCH /api/plans/:id` with only changed fields (partial update). Visual indicator: "Saved" / "Saving..." / "Unsaved changes" in plan header.
  - Source: `_bmad-output/planning-artifacts/architecture.md` → Decision 6: Auto-Save Strategy

- **Financial input state flow (architecture.md Decision 9):** All experience tiers write to the same `PlanFinancialInputs` unified state via `updateFinancialInput()`. The `useFieldEditing` hook (`client/src/hooks/use-field-editing.ts`) provides `handleEditStart`, `handleEditCommit`, `handleEditCancel`, and `handleFieldUpdate` for editing lifecycle.
  - Source: `_bmad-output/planning-artifacts/architecture.md` → Decision 9: Component Architecture

- **Number format rules (architecture.md):** Currency stored as cents (integers). Percentages stored as decimals (0.065 = 6.5%). Formatting happens exclusively in UI layer. Use `parseFieldInput` and `formatFieldValue` from `client/src/lib/field-metadata.ts`.
  - Source: `_bmad-output/planning-artifacts/architecture.md` → Number Format Rules

- **Naming conventions:** Components: PascalCase. Files: kebab-case. Constants: SCREAMING_SNAKE_CASE. data-testid: `{action}-{target}` for interactive, `{type}-{content}` for display, `value-{metric}-{period}` for financial values.
  - Source: `_bmad-output/planning-artifacts/architecture.md` → Naming Patterns, data-testid Convention

- **Error message pattern:** 3-part actionable format: (1) What failed, (2) Whether data was lost, (3) What to do.
  - Source: `_bmad-output/planning-artifacts/architecture.md` → Process Patterns → Error Handling

### UI/UX Deliverables

- **Primary interaction surface:** P&L tab and Valuation tab within the Reports view (`FinancialStatements` component). No new pages or routes.
- **InlineEditableCell component:** Click-to-edit overlay within table cells. Shows focused text input with primary border on activation. Replaces display value with raw editable number.
- **Linked columns flash animation:** When editing an input cell in one year column, all other year columns for that row briefly flash (200ms highlight) to indicate propagation.
- **Linked columns indicator:** Small link icon with text in the column toolbar area.
- **UI states:**
  - Default: Input cell shows formatted value with subtle visual distinction (tinted background, dashed border, hover pencil icon — already implemented)
  - Editing: Text input replaces display value, primary-colored border, auto-focused
  - Saving: Planning header shows "Saving..." via existing save indicator
  - Error: Toast notification if save fails (3-part actionable message)
- **Navigation:** User reaches this feature by navigating to any plan → Reports view → P&L or Valuation tab. No new navigation paths.

### Anti-Patterns & Hard Constraints

- **DO NOT modify `components/ui/*`** — Shadcn-managed primitives are never modified.
- **DO NOT use `useState` for server data** — All financial inputs come from React Query cache.
- **DO NOT create a separate edit mode toggle** — Editing is ALWAYS available. No mode gating per UX spec v3.
- **DO NOT build an "All Inputs" tab** — Removed in UX spec v3 retrospective.
- **DO NOT build an orientation overlay** — Removed in UX spec v3 retrospective.
- **DO NOT add working capital input editing to the Balance Sheet tab** — AR Days, AP Days, Inventory Days are not in `PlanFinancialInputs`. They exist only in the raw `FinancialInputs` engine interface without `FinancialFieldValue` metadata wrappers. Adding them as editable inputs requires schema changes that are out of scope for this story.
- **DO NOT add custom hover/active styles on Buttons or Badges** — Built-in elevation handles this per architecture.
- **DO NOT import from `server/` or `client/` in `shared/` files** — Financial engine purity enforcement.
- **Reuse existing code — DO NOT duplicate:**
  - `useFieldEditing` hook (`client/src/hooks/use-field-editing.ts`) — the editing lifecycle
  - `parseFieldInput` / `formatFieldValue` from `client/src/lib/field-metadata.ts` — parsing/formatting
  - `updateFieldValue` / `resetFieldToDefault` from `shared/plan-initialization.ts` — state updates
  - `usePlanAutoSave` hook — auto-save orchestration
  - `usePlanOutputs` hook — engine output fetching

### Gotchas & Integration Warnings

- **CRITICAL — P&L field mapping:** The P&L row definitions use display field names (e.g., `field: "monthlyRevenue"`, `field: "facilities"`) that do NOT match the `PlanFinancialInputs` field names (e.g., `revenue.monthlyAuv`, `operatingCosts.utilitiesMonthly`). An explicit `INPUT_FIELD_MAP` constant must bridge this gap. The complete mapping is:

  | P&L Row Key | P&L Row `field` | PlanFinancialInputs Path | Format |
  |-------------|-----------------|-------------------------|--------|
  | monthly-revenue | monthlyRevenue | revenue.monthlyAuv | currency |
  | cogs-pct | cogsPct | operatingCosts.cogsPct | percentage |
  | dl-pct | directLaborPct | operatingCosts.laborPct | percentage |
  | mgmt-salaries | managementSalaries | operatingCosts.rentMonthly | currency |
  | facilities | facilities | operatingCosts.utilitiesMonthly | currency |
  | marketing | marketing | operatingCosts.marketingPct | percentage |
  | other-opex | otherOpex | operatingCosts.otherMonthly | currency |

  **WARNING:** The `mgmt-salaries → rentMonthly` and `facilities → utilitiesMonthly` mappings above are from the APPROXIMATE table in the original draft. They look WRONG. The implementer MUST verify each mapping by:
  1. Reading `shared/financial-engine.ts` lines 37-65 (`PlanFinancialInputs` interface)
  2. Reading `shared/financial-engine.ts` lines 70-135 (raw `FinancialInputs` consumed by engine)
  3. Reading the `unwrapInputs()` function in `shared/financial-engine.ts` to see how `PlanFinancialInputs` fields map to `FinancialInputs` fields
  4. Reading `client/src/lib/field-metadata.ts` lines 10-38 (`FIELD_METADATA`) for category/fieldName/format
  5. Cross-referencing `PNL_SECTIONS` in `pnl-tab.tsx` to confirm which display field name corresponds to which engine computation

- **CRITICAL — EBITDA Multiple is NOT in PlanFinancialInputs:** The `ebitdaMultiple` field lives on `FinancialInputs` as a top-level optional field (line 130 of `shared/financial-engine.ts`), defaulting to 3. It is NOT wrapped in `FinancialFieldValue` metadata. The editing mechanism for this field must bypass the standard `useFieldEditing` flow and directly update the plan's `financialInputs` JSONB (or a separate field). The implementer must check how `ebitdaMultiple` is currently stored and read by `unwrapInputs()`.

- **Pre-Epic-7 linked columns:** All fields in `PlanFinancialInputs` are single values (not per-year arrays). The engine applies each value uniformly across all 60 months (with growth rates as the exception). Editing Year 3's "Monthly Revenue" changes Year 1-5 simultaneously. The UI must visually indicate this with a flash on non-edited year cells.

- **Component prop threading:** `FinancialStatements` currently receives only `planId` and `defaultTab`. To enable editing, it needs access to `plan.financialInputs` and a save callback. These must be threaded from `PlanningWorkspace` (which has `usePlanAutoSave`) → `FinancialStatements` → tab components → row components. This is a multi-level prop-threading change.

- **`PnlTab` currently receives only `output: EngineOutput`** — it needs additional props for editing: `financialInputs`, `onCellEdit` callback, and `isSaving` flag.

- **P&L row `direct-labor` vs `dl-pct`:** Both rows are marked `isInput: true`. However, `direct-labor` shows the dollar amount and `dl-pct` shows the percentage. In `PlanFinancialInputs`, there is only `operatingCosts.laborPct` (a percentage). The dollar amount is computed from `laborPct * revenue`. Only `dl-pct` should be editable. The `direct-labor` row should either have `isInput` removed or should be treated as display-only in the inline editing logic.

- **Valuation tab row structure differs:** The valuation tab uses `getValue: (idx, enriched) => ...` functions instead of simple `field` strings. The EBITDA Multiple row accesses `e[_i].val.ebitdaMultiple`. The `InlineEditableCell` component must handle this different data shape.

- **Existing `aria-readonly` attributes:** The statement tabs already set `aria-readonly="false"` on `isInput` cells and `aria-readonly="true"` on computed cells (implemented in 5.3-5.5). AC13 is partially already met.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/components/planning/statements/inline-editable-cell.tsx` | CREATE | Lightweight click-to-edit cell component (~80 lines). Accepts display value, raw value, format, input mapping, onCommit callback. Handles Tab/Shift+Tab/Enter/Escape. |
| `client/src/components/planning/statements/input-field-map.ts` | CREATE | Explicit `INPUT_FIELD_MAP` constant mapping P&L row keys → `{ category, fieldName, format }` in `PlanFinancialInputs`. Also maps valuation EBITDA Multiple. |
| `client/src/components/planning/statements/pnl-tab.tsx` | MODIFY | Add `financialInputs`, `onCellEdit`, `isSaving` props. Replace display-only input cells with `InlineEditableCell`. Wire input mapping. Add flash animation for linked columns. |
| `client/src/components/planning/statements/valuation-tab.tsx` | MODIFY | Add `financialInputs`, `onCellEdit`, `isSaving` props. Wire EBITDA Multiple editing with special save path. |
| `client/src/components/planning/statements/column-manager.tsx` | MODIFY | Add linked columns indicator to `ColumnToolbar` (link icon + explanatory text). |
| `client/src/components/planning/financial-statements.tsx` | MODIFY | Accept `financialInputs`, `onCellEdit`, `isSaving` props. Pass to PnlTab and ValuationTab. |
| `client/src/pages/planning-workspace.tsx` | MODIFY | Pass `plan.financialInputs`, `queueSave`, and `isSaving` to `FinancialStatements`. |

### Dependencies & Environment Variables

- **No new packages needed.** All required utilities exist: `useFieldEditing`, `parseFieldInput`, `formatFieldValue`, `updateFieldValue`, React Query.
- **No new environment variables needed.**
- **Existing packages used:** `lucide-react` (Link2 icon for linked columns indicator), `framer-motion` (optional, for flash animation — already installed).

### Testing Expectations

- **Playwright e2e tests (run_test):**
  - Navigate to Reports → P&L tab → click Monthly Revenue cell → verify edit mode activates
  - Type new value → press Enter → verify cell updates and other year columns update
  - Verify Tab key moves to next input cell, skipping computed cells
  - Press Escape → verify edit cancels and original value restores
  - Navigate to Valuation tab → click EBITDA Multiple → edit → verify valuation recalculates
  - Verify Balance Sheet and Cash Flow tabs have no editable cells
  - Verify editing works regardless of experience tier (no mode gating)

- **Critical ACs requiring test coverage:** AC1 (click-to-edit activation), AC2 (value parsing and save), AC3 (keyboard navigation), AC4 (linked columns propagation), AC7 (EBITDA Multiple), AC11 (no mode gating)

### References

- [Source: `_bmad-output/planning-artifacts/architecture.md` → Decision 6: Auto-Save Strategy] — 2-second debounce, PATCH partial updates
- [Source: `_bmad-output/planning-artifacts/architecture.md` → Decision 8: State Management] — React Query + optimistic updates
- [Source: `_bmad-output/planning-artifacts/architecture.md` → Decision 9: Component Architecture] — shared detail panel + tier-specific input panels
- [Source: `_bmad-output/planning-artifacts/architecture.md` → Number Format Rules] — currency as cents, percentages as decimals
- [Source: `_bmad-output/planning-artifacts/architecture.md` → Implementation Patterns] — data-testid conventions, error message format
- [Source: `_bmad-output/planning-artifacts/ux-financial-statements-spec.md` → Part 3] — "Reports always renders financial statements with input cells editable and computed cells read-only. There is no switch to flip."
- [Source: `shared/financial-engine.ts` → lines 37-65] — `PlanFinancialInputs` interface definition
- [Source: `shared/financial-engine.ts` → line 130] — `ebitdaMultiple` as top-level optional field on `FinancialInputs`
- [Source: `client/src/hooks/use-field-editing.ts`] — existing editing hook with `handleEditStart`, `handleEditCommit`, `handleFieldUpdate`
- [Source: `client/src/lib/field-metadata.ts`] — `FIELD_METADATA`, `parseFieldInput`, `formatFieldValue`
- [Source: `client/src/components/planning/statements/pnl-tab.tsx` → lines 80-204] — `PNL_SECTIONS` with `isInput: true` markers
- [Source: `client/src/components/planning/statements/valuation-tab.tsx` → line 98] — EBITDA Multiple row with `isInput: true`

## Dev Agent Record

### Agent Model Used
Claude 4.6 Opus (Replit Agent)

### Completion Notes

**Implemented (P&L inline editing — 5 editable rows):**
- Created `input-field-map.ts` with verified INPUT_FIELD_MAP mapping 5 P&L row keys to PlanFinancialInputs paths
- Created `inline-editable-cell.tsx` component: click-to-edit, Tab/Shift+Tab/Enter/Escape keyboard nav, 200ms flash animation, committedRef guard to prevent double-commit on blur+Tab
- Modified `pnl-tab.tsx` to accept editing props, wire InlineEditableCell for input rows, manage editing/flashing state
- Modified `financial-statements.tsx` to accept and pass financialInputs, onCellEdit, isSaving props
- Modified `planning-workspace.tsx` to thread plan financialInputs, queueSave, and isSaving to FinancialStatements
- Added CSS keyframe animation `animate-flash-linked` for linked-column visual feedback
- Display shows formatted raw input value (from plan cache) for immediate optimistic feedback after edits

**Deferred / Out of Scope:**
- **EBITDA Multiple editing (AC7):** Deferred — ebitdaMultiple is on FinancialInputs (engine input), not PlanFinancialInputs (plan JSONB). No save path exists without schema changes. Valuation tab remains display-only.
- **Management Salaries row:** Excluded — hardcoded to 0 in engine, no 1:1 PlanFinancialInputs mapping (managementSalaries is computed from laborPct + wages, not a direct input)
- **Facilities row:** Excluded — computed from rent + utilities + insurance (3 separate inputs), no single-field mapping
- **Balance Sheet tab (AC5):** Read-only as specified — working capital assumptions not in PlanFinancialInputs
- **Cash Flow tab (AC6):** Read-only as specified — all values are computed
- **quick-entry-mode.tsx retirement (AC12):** Not deleted per spec — remains referenced but no new features added

**ACs verified:** AC1 ✓, AC2 ✓, AC3 ✓, AC4 ✓, AC5 ✓, AC6 ✓, AC7 deferred, AC8 ✓ (preserved from 5.3-5.5), AC9 ✓, AC10 ✓, AC11 ✓, AC12 ✓, AC13 ✓

### File List
- `client/src/components/planning/statements/input-field-map.ts` — CREATED
- `client/src/components/planning/statements/inline-editable-cell.tsx` — CREATED
- `client/src/components/planning/statements/pnl-tab.tsx` — MODIFIED
- `client/src/components/planning/financial-statements.tsx` — MODIFIED
- `client/src/pages/planning-workspace.tsx` — MODIFIED
- `client/src/index.css` — MODIFIED (flash animation keyframe)

### Testing Summary
- Playwright e2e test: click-to-edit Monthly Revenue → type value → Enter commits → display updates immediately (AC1, AC2)
- Playwright e2e test: Tab navigates Monthly Revenue → COGS % → Direct Labor % (AC3)
- Playwright e2e test: Escape cancels edit, restores original value (AC3)
- Playwright e2e test: all year columns show same value (linked columns, AC4)
- Playwright e2e test: value persists after commit ($45,000 displayed correctly)
- Verified no mode gating — editing works regardless of experience tier (AC11)
- LSP clean — no diagnostics
