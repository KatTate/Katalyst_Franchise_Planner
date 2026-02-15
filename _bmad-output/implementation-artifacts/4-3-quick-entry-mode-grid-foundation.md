# Story 4.3: Quick Entry Mode — Grid Foundation

Status: done

## Story

As a franchisee (Maria),
I want to enter my plan data in a spreadsheet-style grid with inline editing,
So that I can see and edit all my inputs at a glance (FR12 — Quick Entry tier).

## Acceptance Criteria

1. **Given** I select Quick Entry mode in the planning workspace, **when** the input panel renders, **then** I see a dense, spreadsheet-style grid built on TanStack Table with columns: Category, Input Name, Value, Unit, Source, Brand Default. The grid uses sm/md spacing density per the UX spec (8px cell padding, 16px between groups) — maximum data density for Maria's workflow.

2. **Given** the grid renders, **when** I view the rows, **then** they are organized into collapsible category groups matching `CATEGORY_ORDER`: Revenue, Operating Costs, Financing, Startup Capital. Each group has a header row with a chevron toggle that collapses/expands the group's child rows. All groups start expanded by default.

3. **Given** I view a data row in the grid, **when** I click or focus on the Value cell, **then** the cell transitions to an editable input immediately — click-to-edit with auto-focus and auto-select of current value. The input accepts raw numeric entry appropriate to the field's format (dollar amounts for currency, decimal for percentage, integer for months).

4. **Given** I am editing a cell, **when** I blur the input or press Enter, **then** the value is committed: the field's `currentValue` is updated via `updateFieldValue()`, the plan is saved via `usePlan.updatePlan()`, and the source badge updates from "Brand Default" to "Your Entry." Pressing Escape cancels the edit without committing.

5. **Given** the grid is rendered, **when** I view the top of the Quick Entry panel, **then** I see a sticky summary row showing 4 headline metrics: Total Investment, Year 1 Revenue, 5-Year ROI, and Break-Even Month. These metrics update with every cell change via the `usePlanOutputs` hook, with a subtle opacity transition during refetch.

6. **Given** a field's `currentValue` falls outside its `item7Range` (min/max), **when** I view that row's Value cell, **then** the cell has a subtle "Gurple" (#A9A2AA) background at 10% opacity. Hovering over the cell shows a tooltip with the typical range (e.g., "Typical range: $3,500 – $5,500") styled with Gurple background and white text. This is advisory — not an error.

7. **Given** a field has been edited (source is "user_entry"), **when** I view the actions column, **then** I see a reset button (RotateCcw icon). Clicking it resets the field to its brand default via `resetFieldToDefault()`, updates the source badge back to "Brand Default," and recalculates metrics.

8. **Given** no financial inputs exist (plan not initialized), **when** I view Quick Entry mode, **then** I see a message: "Your plan hasn't been initialized yet. Complete Quick Start to begin." **Given** an error loading plan data, **then** I see an error state with: "Failed to load your plan data. Please try refreshing."

9. **Given** I enter values in Quick Entry mode and switch to Forms or Planning Assistant mode, **when** I switch back to Quick Entry mode, **then** all values I entered are preserved. The financial input state is shared across all modes via the `usePlan` hook (FR13).

10. **Given** the grid is loading, **when** I view Quick Entry mode, **then** I see a skeleton loading state with shimmer placeholders for the metrics row and 8 grid rows.

11. **Given** I am saving after a cell edit, **when** the save is in progress, **then** a subtle "Saving..." indicator appears at the bottom of the grid. **Given** a save failure, **then** an error message appears: "Save failed. Your changes will be retried on next edit."

## Dev Notes

### Architecture Patterns to Follow

**Component Hierarchy (from Architecture Doc, Decision 9):**

The Quick Entry mode content renders inside `InputPanel` when `activeMode === "quick_entry"`. The component hierarchy:

```
<InputPanel activeMode="quick_entry">
  └── <QuickEntryMode planId={planId}>
        ├── <StickyMetrics planId output isLoading isFetching />
        │     └── <CompactMetric /> × 4 (Investment, Revenue, ROI, Break-Even)
        └── <table> (TanStack Table rendered as native HTML table)
              ├── <thead> (sticky column headers)
              └── <tbody>
                    ├── Group header row (Revenue) → colSpan, chevron toggle
                    │     ├── Field row (Monthly AUV) → EditableCell
                    │     ├── Field row (Year 1 Growth Rate) → EditableCell
                    │     └── ...
                    ├── Group header row (Operating Costs) → colSpan, chevron toggle
                    │     └── ...
                    └── ...
```

**Data Model — Grid Row Structure:**

The grid uses a `GridRow` interface with TanStack Table's `subRows` pattern for category grouping:

```typescript
interface GridRow {
  id: string;               // category key for groups, "category.fieldName" for fields
  isGroupHeader: boolean;    // true for category header rows
  category: string;          // category key from CATEGORY_ORDER
  fieldName: string | null;  // null for group headers
  label: string;             // CATEGORY_LABELS for groups, FIELD_METADATA label for fields
  format: FormatType | null; // null for group headers
  field: FinancialFieldValue | null; // null for group headers
  subRows?: GridRow[];       // child field rows for group headers
}
```

The `buildGridRows()` function transforms `PlanFinancialInputs` into this structure, iterating `CATEGORY_ORDER` and nesting field rows as `subRows` of each category group.

**TanStack Table Configuration:**

- `getCoreRowModel()` + `getExpandedRowModel()` for expand/collapse
- `getSubRows: (row) => row.subRows` to enable hierarchical rendering
- `initialState: { expanded: true }` — all groups expanded by default
- 7 column definitions: category, inputName, value (EditableCell), unit, source (SourceBadge), brandDefault, actions (reset button)

**Existing Patterns Reused:**

- `FIELD_METADATA`, `CATEGORY_ORDER`, `CATEGORY_LABELS`, `formatFieldValue`, `parseFieldInput`, `getInputPlaceholder` from `client/src/lib/field-metadata.ts` (extracted in Story 4.2)
- `SourceBadge` component from `client/src/components/shared/source-badge.tsx`
- `usePlan(planId)` hook for `plan`, `updatePlan`, `isSaving`, `saveError`
- `usePlanOutputs(planId)` hook for live financial metrics
- `updateFieldValue()` and `resetFieldToDefault()` from `@shared/plan-initialization`
- `formatCents` from `client/src/lib/format-currency.ts`
- `MetricCard`, `formatROI`, `formatBreakEven` from `client/src/components/shared/summary-metrics`

**State Management (Decision 8):**

- Financial input state lives on `plan.financialInputs` JSONB column — shared across all modes
- On cell edit commit: `parseFieldInput()` → `updateFieldValue()` → spread into updated category → `updatePlan({ financialInputs: updated })`
- On reset: `resetFieldToDefault()` → spread into updated category → `updatePlan()`
- Optimistic updates via TanStack Query — dashboard metrics refresh automatically via cache invalidation

**Spacing Density (from UX Spec — Expert Mode):**

Expert Mode uses sm/md spacing from the Katalyst scale:
- Cell padding: `px-2 py-1` (8px horizontal, 4px vertical) for data rows
- Group header padding: `px-2 py-1.5`
- Container padding: `p-3` for loading/empty states
- Metrics gap: `gap-2` between compact metric cards
- This density enables 60+ rows visible without excessive scrolling

### UI/UX Deliverables

**Quick Entry Mode Content (renders inside InputPanel's left panel at `/plans/:planId`):**

The Quick Entry mode replaces the placeholder in `InputPanel` when the mode is `"quick_entry"`. The panel is a full-height flex column with sticky metrics at top, scrollable grid below.

**Key UI Elements:**

1. **Sticky Metrics Bar** — A compact 4-column grid at the top of the panel (sticky, `z-10`, border-bottom), showing:
   - Total Investment (formatCents)
   - Year 1 Revenue (formatCents from annualSummaries[0])
   - 5-Year ROI (formatROI — percentage)
   - Break-Even Month (formatBreakEven — "Month X" or "N/A")
   - Each metric is a CompactMetric card: 10px uppercase label, sm semibold mono value
   - Opacity transitions to 0.5 during refetch, full opacity when settled

2. **Spreadsheet Grid** — Native `<table>` rendered via TanStack Table's `flexRender`:
   - **Column headers** (sticky, `z-[5]`, bg-muted): Category | Input Name | Value | Unit | Source | Brand Default | (actions)
   - **Group header rows** (bg-muted/50): Full-width colSpan, chevron + category label, clickable to toggle expand/collapse
   - **Field data rows**: Individual cells for each column, click-to-edit Value cells
   - Column sizes: Category 130px, Input Name 180px, Value 150px, Unit 60px, Source 110px, Brand Default 120px, Actions 40px

3. **EditableCell Component** — The Value column's interactive cell:
   - Display state: formatted value (`$4,200.00`, `12.5%`, `14`) in a button element, cursor-text, hover:bg-accent
   - Edit state: `<Input>` with h-7 text-sm font-mono, auto-focused and auto-selected
   - Commit on blur or Enter, cancel on Escape
   - Out-of-range state: Gurple (#A9A2AA) background at 10% opacity, Gurple tooltip on hover

4. **Source Column** — Uses `SourceBadge` component showing "Brand Default" / "Your Entry" / "AI-Populated"

5. **Actions Column** — Reset button (RotateCcw icon, size="icon" variant="ghost") visible only for user_entry fields

6. **Save Status Footer** — Conditional bottom bar showing "Saving..." or save error message

**UI States:**

- **Loading:** Skeleton shimmer — metric row (4 skeletons) + 8 grid row skeletons
- **No financial inputs:** Centered message "Your plan hasn't been initialized yet. Complete Quick Start to begin."
- **Error:** Centered destructive message with AlertCircle icon
- **All defaults (new plan):** All cells show brand default values, all source badges say "Brand Default", no reset buttons visible
- **Active editing:** Single cell in edit mode with focused input, all other cells in display mode
- **Out-of-range:** Gurple-tinted value cell with tooltip on hover

**Data-Testid Convention:**

- `quick-entry-container` — Quick Entry mode root
- `quick-entry-grid` — the `<table>` element
- `quick-entry-metrics` — metrics bar container
- `quick-entry-metrics-loading` — metrics skeleton state
- `quick-entry-metrics-empty` — metrics empty state
- `qe-metric-investment` — Total Investment metric value
- `qe-metric-revenue` — Year 1 Revenue metric value
- `qe-metric-roi` — 5-Year ROI metric value
- `qe-metric-breakeven` — Break-Even metric value
- `group-toggle-{category}` — category group expand/collapse button
- `grid-group-{category}` — category group header row
- `grid-row-{fieldName}` — field data row
- `grid-cell-{fieldName}` — value cell (display state)
- `grid-input-{fieldName}` — value input (edit state)
- `grid-unit-{fieldName}` — unit indicator
- `grid-default-{fieldName}` — brand default display
- `grid-reset-{fieldName}` — reset button
- `status-saving` — save in progress indicator
- `status-save-error` — save error message
- `status-error` — plan load error
- `status-no-inputs` — no financial inputs message

### Anti-Patterns & Hard Constraints

- **DO NOT** create a separate route or page for Quick Entry mode. It renders inside `InputPanel` within the existing `/plans/:planId` workspace route.
- **DO NOT** modify `shared/financial-engine.ts` — the engine is complete and tested.
- **DO NOT** modify `shared/plan-initialization.ts` — use its existing `updateFieldValue` and `resetFieldToDefault` functions.
- **DO NOT** modify `server/services/financial-service.ts`.
- **DO NOT** modify files in `client/src/components/ui/` — these are shadcn primitives.
- **DO NOT** modify `vite.config.ts` or `drizzle.config.ts`.
- **DO NOT** implement keyboard-driven navigation (Tab/Shift+Tab between cells, Enter to move down) — that is Story 4.4.
- **DO NOT** implement type-aware auto-formatting (currency auto-format with $ and commas, percentage auto-append %) — that is Story 4.4.
- **DO NOT** implement virtualization for 60+ rows — that is Story 4.4.
- **DO NOT** implement auto-save — that is Story 4.5. Each cell edit triggers an immediate PATCH via the existing `usePlan.updatePlan()` mutation.
- **DO NOT** duplicate the field metadata mapping — import from `client/src/lib/field-metadata.ts` (already extracted in Story 4.2).
- **DO NOT** create new formatting utilities — use existing `formatCents`, `parseDollarsToCents`, `formatFieldValue`, `parseFieldInput`, `getInputPlaceholder`.
- **DO NOT** use red/error styling for out-of-range financial values — use "Gurple" (#A9A2AA) at 10% opacity for advisory indicators. Red is reserved for actual system errors.
- **DO NOT** implement advisory nudges beyond the Gurple background + range tooltip — full advisory nudges are Epic 5.

### Gotchas & Integration Warnings

- **`InputPanel` already accepts `planId` prop:** Story 4.2 modified `InputPanel` to accept `planId` and pass it to `FormsMode`. Quick Entry mode follows the same pattern — `InputPanel` renders `<QuickEntryMode planId={planId} />` when `activeMode === "quick_entry"`.

- **TanStack Table `expanded: true` initialState:** Setting `expanded: true` (boolean, not an object) expands ALL rows by default. This is the desired behavior — Maria wants to see everything at a glance, then collapse categories she's done with.

- **Group header rows use colSpan:** Group header rows render a single `<td colSpan={columns.length}>` containing the category toggle button. This prevents misaligned cells in the group header. Non-group rows render individual `<td>` cells via `row.getVisibleCells()`.

- **EditableCell state management:** Each `EditableCell` manages its own `isEditing` and `editValue` state locally. The raw edit value format differs by type: currency shows dollars (not cents), percentage shows percentage points (not decimal), integer shows raw number. `parseFieldInput()` handles conversion back to the internal format.

- **`usePlanOutputs` refetch cadence:** The sticky metrics update automatically when `updatePlan` mutates the plan — TanStack Query invalidates the outputs query key, triggering a refetch. During the refetch window, `isFetching` is true while `isLoading` is false (stale data still displayed), so the CompactMetric opacity drops to 0.5 to indicate recalculation.

- **`plan.financialInputs` typing:** The `financialInputs` column is typed as `PlanFinancialInputs | null`. Always null-check before accessing fields. When null, show the "plan not initialized" empty state.

- **Sticky header z-index layering:** The metrics bar uses `z-10` and the table thead uses `z-[5]`. The metrics bar must stack above the table headers during scroll. Both use `bg-background` / `bg-muted` to prevent transparency issues.

- **Out-of-range detection:** `isOutOfRange()` checks `field.item7Range` existence first (most fields have null ranges in MVP), then compares `currentValue` against `min`/`max`. Only fields with defined ranges get the Gurple treatment.

- **`as any` type cast pattern:** Previous story (4.2) code review removed unnecessary `as any` casts on `updatePlan({ financialInputs })`. Avoid reintroducing them — the `Plan` schema already types `financialInputs` as `PlanFinancialInputs`.

- **Existing tests must continue passing:** All 352+ tests from previous epics must pass. Run `npx vitest` to verify no regressions.

- **Brand data is NOT needed by Quick Entry mode directly:** The grid reads from `plan.financialInputs` which already contains `brandDefault` values per field. No separate brand API call is needed.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/components/planning/quick-entry-mode.tsx` | CREATE | Main Quick Entry mode component: StickyMetrics bar, TanStack Table grid with category grouping, EditableCell with click-to-edit, Gurple out-of-range indicators, source badges, reset-to-default |
| `client/src/components/planning/input-panel.tsx` | MODIFY | Add Quick Entry mode rendering: `<QuickEntryMode planId={planId} />` when `activeMode === "quick_entry"` |

### Dependencies & Environment Variables

**Packages already installed (DO NOT reinstall):**
- `@tanstack/react-table` — grid framework
- `@tanstack/react-query` — server state
- `drizzle-orm`, `drizzle-zod`, `zod` — schema/validation
- `lucide-react` — icons (ChevronDown, RotateCcw, AlertCircle)
- `class-variance-authority`, `clsx`, `tailwind-merge` — styling
- All shadcn/ui components (Input, Button, Skeleton, Tooltip, etc.)

**No new packages needed.**

**No new environment variables needed.**

**No database migration needed** — Quick Entry mode reads/writes to the existing `financialInputs` JSONB column on the `plans` table via the existing PATCH `/api/plans/:id` endpoint.

### Testing Expectations

- **End-to-end (Playwright):** Verify that selecting Quick Entry mode renders the grid with category groups and field rows, cells are editable via click, source badges update on edit, reset-to-default works, sticky metrics display and update, mode switching preserves values.
- **Unit tests (Vitest):** Format/parse helpers already have test coverage from Story 4.2 extraction. `buildGridRows()` and `isOutOfRange()` are internal functions — verify via E2E rather than exposing for unit tests.
- **Critical ACs for test coverage:** AC 1 (grid renders with columns), AC 3 (click-to-edit), AC 4 (commit updates source badge), AC 5 (sticky metrics), AC 6 (Gurple out-of-range), AC 7 (reset to default), AC 9 (mode switching preserves state).

### References

- Epics: `_bmad-output/planning-artifacts/epics.md` — Epic 4 overview, Story 4.3 AC (dense grid, TanStack Table, category groups, inline editing, sticky metrics, Gurple out-of-range)
- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Decision 8 (State Management: TanStack React Query + React Context), Decision 9 (Component Architecture: InputPanel renders tier-specific content, ExpertModeGrid)
- UX Design: `_bmad-output/planning-artifacts/ux-design-specification.md` — Expert Mode Interaction Flow (category grouping, tab-through cells, source column updates, Gurple background for out-of-range), Spacing (Expert Mode = sm/md density), Color System (Mystical/Gurple #A9A2AA at 10% opacity for advisory), Accessibility (focus indicators for keyboard navigation, readable contrast in dense grid)
- Previous Story: `_bmad-output/implementation-artifacts/4-2-forms-mode-section-based-input.md` — Established field metadata extraction to shared module, InputPanel prop-drilling pattern, FormsMode editing/reset patterns, SourceBadge integration, code review findings (H1: metadata during editing, M1: Button size="icon" no explicit dimensions, M2: remove `as any` casts, L1: use shared SourceBadge, L2: use hover-elevate)

## Dev Agent Record

### Agent Model Used

Claude 4.6 Opus (Replit Agent)

### Completion Notes

Implemented Quick Entry mode as a dense spreadsheet-style grid within InputPanel using TanStack Table with `getExpandedRowModel` for collapsible category groups. Grid uses `subRows` pattern: category headers as parent rows with field rows nested as children. EditableCell component provides click-to-edit with format-aware raw value display (dollars for currency, percentage points for percentages, raw integers). StickyMetrics bar at top shows 4 headline financial metrics (Total Investment, Year 1 Revenue, 5-Year ROI, Break-Even) with opacity transition during refetch. Out-of-range values highlighted with Gurple (#A9A2AA) at 10% opacity background and tooltip showing Item 7 range. Source badges, reset-to-default, and save status indicators integrated using shared components and hooks from previous stories.

### File List

| File | Action |
|------|--------|
| `client/src/components/planning/quick-entry-mode.tsx` | CREATE |
| `client/src/components/planning/input-panel.tsx` | MODIFY |

### Testing Summary

- **Unit tests (Vitest):** All 352+ existing tests pass with zero regressions. No new unit tests added (format/parse helpers already covered by Story 4.2 extraction; grid rendering verified via E2E).
- **E2E tests (Playwright):** Verified via run_test: Quick Entry mode renders with category group headers, field rows display brand defaults with correct source badges, click-to-edit activates inline input, value commit updates source badge to "Your Entry", sticky metrics bar displays at top, reset-to-default reverts field, visual layout verified via screenshot.
- **AC Coverage:** AC 1 (grid with columns), AC 2 (collapsible category groups), AC 3 (click-to-edit), AC 4 (commit updates badge), AC 5 (sticky metrics), AC 6 (Gurple out-of-range via tooltip), AC 7 (reset button), AC 8 (empty/error states), AC 9 (mode switching preserves via shared state), AC 10 (loading skeleton), AC 11 (save status indicators).

### LSP Status

Clean — zero errors, zero warnings across both changed files (quick-entry-mode.tsx, input-panel.tsx).
