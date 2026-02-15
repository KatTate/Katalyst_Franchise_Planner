# Story 4.4: Quick Entry Mode — Keyboard Navigation & Formatting

Status: ready-for-dev

## Story

As a franchisee (Maria),
I want keyboard-driven navigation and auto-formatting in the spreadsheet grid,
So that I can complete the entire plan at maximum speed without a mouse.

## Acceptance Criteria

1. **Given** I am in Quick Entry mode and a Value cell has focus, **when** I press Tab, **then** focus advances to the next editable Value cell in document order (skipping group header rows). **When** I press Shift+Tab, **then** focus moves to the previous editable Value cell. Navigation wraps across category groups — tabbing past the last field in "Revenue" moves to the first field in "Operating Costs."

2. **Given** I am editing a Value cell, **when** I press Enter, **then** the current value is committed and focus moves down to the next editable Value cell below. If the current cell is the last field in a category group, focus moves to the first field in the next expanded category group. This enables rapid top-to-bottom data entry without using Tab.

3. **Given** I am editing a currency field (format: `currency`), **when** I blur or commit the cell, **then** the displayed value is auto-formatted with a leading `$`, comma thousands separators, and 2 decimal places (e.g., typing `4200` displays as `$4,200.00`). During active editing, the raw numeric value is shown without formatting for easy overwrite.

4. **Given** I am editing a percentage field (format: `percentage`), **when** I blur or commit the cell, **then** the displayed value is auto-formatted with a trailing `%` and 1 decimal place (e.g., typing `23` displays as `23.0%`). During active editing, the raw numeric value is shown without formatting.

5. **Given** I am editing a months/integer field (format: `months` or `integer`), **when** I blur or commit the cell, **then** the value is displayed as a whole number with no decimal places. The input accepts integers only — decimal input is rounded to the nearest integer on commit.

6. **Given** the grid contains 60+ rows of financial inputs, **when** I scroll through the grid, **then** only visible rows are rendered to the DOM via row virtualization (using `@tanstack/react-virtual`). Scrolling remains smooth at 60fps. The sticky metrics bar and table column headers remain fixed during scroll.

7. **Given** I am navigating entirely by keyboard (Tab, Shift+Tab, Enter, Escape), **when** I work through all editable fields, **then** I can complete the entire plan input without using a mouse. The keyboard flow is: Tab to cell → type value → Enter to commit and move down (or Tab to commit and move right to next field). Escape cancels without committing.

8. **Given** I have a collapsed category group, **when** I navigate via Tab/Enter, **then** the collapsed group's fields are skipped — focus jumps to the next expanded group's first editable cell. Collapsed groups do not participate in keyboard navigation.

## Dev Notes

### Architecture Patterns to Follow

**Component Hierarchy (from Architecture Doc, Decision 9):**

Story 4.4 enhances the existing `QuickEntryMode` component from Story 4.3. The component hierarchy remains:

```
<InputPanel activeMode="quick_entry">
  └── <QuickEntryMode planId={planId}>
        ├── <StickyMetrics planId output isLoading isFetching />
        └── <VirtualizedGrid>   ← NEW: wraps table in virtualized container
              ├── <thead> (sticky column headers)
              └── <tbody> (virtualized rows via @tanstack/react-virtual)
                    ├── Group header row (Revenue) → colSpan, chevron toggle
                    │     ├── Field row → EditableCell (enhanced with formatting)
                    │     └── ...
                    └── ...
```

**Virtualization Pattern (from @tanstack/react-virtual v3):**

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const rowVirtualizer = useVirtualizer({
  count: flatRows.length,
  getScrollElement: () => scrollContainerRef.current,
  estimateSize: () => 33, // ~33px per row (py-1 + content)
  overscan: 10,
});
```

- The scroll container is a `<div>` wrapping the `<table>`, with a fixed height and `overflow-y: auto`
- Rows are absolutely positioned using `transform: translateY(virtualRow.start)px`
- The `<tbody>` height is set to `rowVirtualizer.getTotalSize()` to maintain proper scrollbar
- Both group header rows and field rows are virtualized
- Sticky metrics and thead remain outside the virtualized area

**Keyboard Navigation Pattern:**

Implement a `useGridNavigation` custom hook (or inline logic in `EditableCell`) that:
- Maintains a flat ordered list of editable field cell refs/IDs (excluding group headers and collapsed groups)
- On Tab: `e.preventDefault()`, find current index, focus next editable cell
- On Shift+Tab: `e.preventDefault()`, find current index, focus previous editable cell
- On Enter (after commit): find current index, focus the next cell below (next in flat list)
- Uses `data-field-name` attributes on cells to identify and navigate between them
- Recalculates the navigation order when groups are expanded/collapsed

**Auto-Formatting Pattern:**

Enhance `EditableCell` to show formatted values when not focused, raw values when focused:
- **Unfocused state:** Display formatted value via `formatFieldValue()` from `field-metadata.ts` — this already handles currency (`$4,200`), percentage (`23.0%`), and integer formatting
- **Focused state:** Display raw numeric value for easy editing (e.g., `4200` not `$4,200.00`)
- **On commit:** Parse via `parseFieldInput()` (already exists), apply rounding for integer types, then save
- The existing `formatFieldValue` and `parseFieldInput` utilities in `client/src/lib/field-metadata.ts` already handle all format types — reuse them

**State Management (Decision 8):**

- Financial input state: `plan.financialInputs` JSONB — shared across all modes via `usePlan` hook
- Cell edit flow: raw input → `parseFieldInput()` → `updateFieldValue()` → `updatePlan({ financialInputs })`
- TanStack Query handles cache invalidation and refetch of outputs automatically
- Virtualized rows must maintain their edit state correctly when scrolled out of and back into view

**Existing Utilities to Reuse:**

- `FIELD_METADATA`, `CATEGORY_ORDER`, `CATEGORY_LABELS`, `formatFieldValue`, `parseFieldInput`, `getInputPlaceholder` from `client/src/lib/field-metadata.ts`
- `SourceBadge` from `client/src/components/shared/source-badge.tsx`
- `usePlan(planId)` hook for plan data and mutations
- `usePlanOutputs(planId)` hook for live financial metrics
- `updateFieldValue()` and `resetFieldToDefault()` from `@shared/plan-initialization`
- `formatCents` from `client/src/lib/format-currency.ts`
- `formatROI`, `formatBreakEven` from `client/src/components/shared/summary-metrics`
- `useFieldEditing` hook (already imported in quick-entry-mode.tsx)

### UI/UX Deliverables

**Quick Entry Mode (enhanced — renders inside InputPanel at `/plans/:planId`):**

The visual layout is identical to Story 4.3 — this story adds behavioral enhancements to the existing grid:

1. **Keyboard Navigation Flow:**
   - Tab/Shift+Tab cycles through Value cells only (not category headers, not Source/Default columns)
   - Enter commits current cell and moves focus downward to the next Value cell
   - Escape cancels edit and keeps focus on current cell (existing behavior)
   - Navigation skips collapsed category groups entirely
   - Visual focus indicator is already handled by the `<Input>` component's built-in focus ring

2. **Auto-Formatted Value Display:**
   - When a Value cell is **not focused**: shows formatted value (e.g., `$4,200.00`, `23.0%`, `14`)
   - When a Value cell **is focused**: shows raw numeric value (e.g., `4200`, `23`, `14`) for easy overwrite
   - The transition between formatted/raw happens on focus/blur — no flicker or layout shift
   - Currency fields display with `$` prefix, comma separators, 2 decimal places
   - Percentage fields display with `%` suffix, 1 decimal place
   - Month/integer fields display as whole numbers

3. **Virtualized Scrolling:**
   - Only visible rows (plus ~10 overscan rows) are in the DOM
   - Smooth scrolling without jank for 60+ rows
   - Sticky metrics bar remains fixed at top of the Quick Entry panel
   - Table column headers remain sticky below the metrics bar
   - Scroll position is preserved when cells are edited

**UI States (unchanged from 4.3, with additions):**

- All existing states (loading, empty, error, saving) remain unchanged
- **New: Formatted idle state** — cells show formatted values when not being edited
- **New: Raw editing state** — on focus, cell switches to raw numeric value for editing

**Data-Testid Convention (additions to existing):**

- All existing `data-testid` attributes from Story 4.3 are preserved
- `grid-cell-{fieldName}` — Value input cell (existing, behavior enhanced)

### Anti-Patterns & Hard Constraints

- **DO NOT** create a separate route or page — Quick Entry renders inside `InputPanel` at `/plans/:planId`
- **DO NOT** modify `shared/financial-engine.ts` — the engine is complete and tested
- **DO NOT** modify `shared/plan-initialization.ts` — use existing `updateFieldValue` and `resetFieldToDefault`
- **DO NOT** modify `server/services/financial-service.ts`
- **DO NOT** modify files in `client/src/components/ui/` — shadcn primitives
- **DO NOT** modify `vite.config.ts` or `drizzle.config.ts`
- **DO NOT** create new formatting utilities — use existing `formatFieldValue` and `parseFieldInput` from `client/src/lib/field-metadata.ts`
- **DO NOT** use `useState` for server data — TanStack Query manages all server state
- **DO NOT** implement a click-to-edit pattern — cells must be immediately editable on focus (established in Story 4.3)
- **DO NOT** break the existing cell commit/cancel behavior (blur/Enter to commit, Escape to cancel) — enhance it, don't replace it
- **DO NOT** use a heavy third-party grid library (ag-grid, react-data-grid, etc.) — the existing TanStack Table + custom cells pattern is established and must be extended
- **DO NOT** implement auto-save in this story — each cell edit triggers an immediate PATCH via `usePlan.updatePlan()` (auto-save with debouncing is Story 4.5)
- **DO NOT** implement advisory nudges beyond the existing Gurple background + range tooltip — full advisory nudges are Epic 5

### Gotchas & Integration Warnings

- **Virtualization changes the DOM structure:** The current Story 4.3 implementation renders all rows as a native `<table>`. Adding virtualization requires wrapping the table body in a scrollable container and using absolute positioning for rows. The `<thead>` must remain sticky outside the virtualized area. Group header rows with `colSpan` must be handled correctly within the virtualized list.

- **EditableCell ref management for keyboard nav:** With virtualization, cells scroll in and out of the DOM. Keyboard navigation cannot rely on persistent refs to all cells. Instead, use `data-field-name` attributes and `document.querySelector` (or a ref callback map keyed by field name) to find the next/previous cell when navigating. The virtualizer's `scrollToIndex()` method can bring off-screen cells into view before focusing.

- **Expanded/collapsed state affects navigation order:** When a category group is collapsed, its field rows are hidden. The flat navigation list must be recalculated whenever expand/collapse state changes. Use a `useMemo` that depends on the `expanded` state from TanStack Table to rebuild the ordered list of navigable field names.

- **Auto-formatting must not fight with `parseFieldInput`:** The existing `parseFieldInput` already strips `$`, `%`, and commas before parsing. When the cell shows formatted values and the user focuses it, the value switches to raw — so `parseFieldInput` receives clean numeric strings. Ensure the transition from formatted → raw doesn't cause a flash of the formatted value being parsed as NaN.

- **TanStack Table `getExpandedRowModel` with virtualization:** The virtualizer needs a flat list of all visible rows (both group headers and expanded field rows). Use `table.getRowModel().rows` (which already respects expand/collapse state) to get the flat list, then feed its length to the virtualizer.

- **Group header rows have different height:** Group header rows may have slightly different padding than field rows. Use a consistent `estimateSize` or implement `measureElement` for dynamic measurement. Given the small row count (~60-80 rows), a uniform estimate of ~33px should work fine.

- **`as any` type cast warning:** Story 4.3 code review flagged unnecessary `as any` casts. Avoid introducing new ones. The `Plan` schema types `financialInputs` as `PlanFinancialInputs`.

- **Existing tests must continue passing:** All 352+ tests from previous epics must pass. Run `npx vitest` to verify no regressions.

- **File size management:** The `quick-entry-mode.tsx` file is currently 559 lines. Adding virtualization and keyboard navigation will increase this significantly. Consider extracting `EditableCell` into its own file (`editable-cell.tsx`) and the virtualization wrapper into a helper, keeping the main file under ~400 lines per file.

- **@tanstack/react-virtual must be installed:** This package is likely not yet installed. Install `@tanstack/react-virtual` via the package manager before implementation.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/components/planning/quick-entry-mode.tsx` | MODIFY | Add virtualization via `@tanstack/react-virtual`, enhance EditableCell with auto-formatting (formatted display on blur, raw value on focus), add keyboard navigation (Tab/Shift+Tab between cells, Enter to move down). Consider splitting into multiple files if size exceeds ~400 lines. |
| `client/src/components/planning/editable-cell.tsx` | CREATE (optional) | Extract EditableCell component if `quick-entry-mode.tsx` becomes too large. Contains: always-editable input, auto-formatting on blur, keyboard event handlers for Tab/Shift+Tab/Enter navigation, Gurple out-of-range styling. |

### Dependencies & Environment Variables

**Packages to install:**
- `@tanstack/react-virtual` — row virtualization for the spreadsheet grid

**Packages already installed (DO NOT reinstall):**
- `@tanstack/react-table` — grid framework
- `@tanstack/react-query` — server state
- `drizzle-orm`, `drizzle-zod`, `zod` — schema/validation
- `lucide-react` — icons
- `class-variance-authority`, `clsx`, `tailwind-merge` — styling
- All shadcn/ui components

**No new environment variables needed.**

**No database migration needed** — this story is purely frontend, reading/writing to existing `financialInputs` JSONB column via existing PATCH `/api/plans/:id` endpoint.

### Testing Expectations

- **End-to-end (Playwright):** Verify keyboard navigation works: Tab moves between Value cells, Shift+Tab goes backward, Enter commits and moves down. Verify auto-formatting displays correctly: currency shows `$X,XXX.00` on blur, raw number on focus. Verify virtualization doesn't break grid rendering with 60+ rows.
- **Critical ACs for test coverage:** AC 1 (Tab/Shift+Tab navigation), AC 2 (Enter moves down), AC 3 (currency auto-format), AC 6 (virtualization smooth scrolling), AC 7 (mouse-free completion), AC 8 (collapsed groups skipped).
- **Regression:** All 352+ existing Vitest tests must pass. Mode switching between Forms and Quick Entry must preserve financial state.
- **Performance:** Scrolling through the full grid should feel smooth — no visible jank or frame drops.

### References

- Epics: `_bmad-output/planning-artifacts/epics.md` — Epic 4 overview, Story 4.4 AC (Tab/Shift+Tab, Enter, auto-formatting, virtualization, 20-minute completion)
- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Decision 8 (State Management), Decision 9 (Component Architecture: InputPanel → tier-specific content), TanStack patterns, data-testid naming
- UX Design: `_bmad-output/planning-artifacts/ux-design-specification.md` — Expert Mode interaction flow (tab-through cells, type-aware inputs, instant recalculation, no mouse required), spacing density (sm/md), financial formatting tokens (currency 2 decimals, percentage 1 decimal, accounting-style negatives, comma separators)
- Previous Story: `_bmad-output/implementation-artifacts/4-3-quick-entry-mode-grid-foundation.md` — EditableCell always-editable pattern, GridRow interface, TanStack Table configuration, CompactMetric component, StickyMetrics, existing data-testid conventions, code review findings (remove `as any` casts, use shared SourceBadge, Button size="icon" no explicit dimensions)
- TanStack Virtual: `@tanstack/react-virtual` v3 — `useVirtualizer` hook, `estimateSize`, `overscan`, `scrollToIndex` for keyboard nav focus management

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Completion Notes

### File List

### Testing Summary
