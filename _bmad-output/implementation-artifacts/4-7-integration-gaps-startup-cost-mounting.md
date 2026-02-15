# Story 4.7: Integration Gaps — Startup Cost Mounting & Forms Metadata

Status: ready-for-dev

## Story

As a franchisee,
I want my startup cost builder, Item 7 range data, and per-field advisory indicators accessible within the Forms and Quick Entry planning modes,
so that I can customize my startup costs, see FDD ranges alongside my estimates, and receive visual cues when my inputs fall outside typical ranges — capabilities the system already supports but that I currently cannot reach (FR4, FR5, FR6, FR20).

## Acceptance Criteria

### AC1: StartupCostBuilder mounted in Forms mode
**Given** I am in Forms mode viewing my plan
**When** the workspace renders
**Then** I see a "Startup Costs" collapsible section alongside the existing financial category sections (Revenue, Operating Costs, Financing, Startup Capital)
**And** the Startup Costs section renders the existing `StartupCostBuilder` component
**And** I can add, remove, reorder, and edit startup cost line items within this section
**And** each template line item shows its FDD Item 7 range (low–high) alongside the brand default and my estimate
**And** I can classify custom line items as CapEx (depreciable) or non-CapEx (expensed)
**And** I can reset individual items to brand defaults
**And** the section's progress indicator in the completeness dashboard shows startup cost item count

### AC2: StartupCostBuilder mounted in Quick Entry mode
**Given** I am in Quick Entry mode viewing my plan
**When** the workspace renders
**Then** I see a "Startup Costs" collapsible category group in the grid, positioned after the existing financial parameter categories
**And** the Startup Costs group renders the existing `StartupCostBuilder` component (not individual grid rows — startup costs have CRUD operations that don't fit the parameter grid pattern)
**And** the component is styled consistently with the Quick Entry grid's visual density
**And** the transition between the grid rows above and the StartupCostBuilder below feels cohesive

### AC3: Forms mode metadata panel shows real Item 7 range data
**Given** I am in Forms mode and I focus on a financial input field
**When** the metadata panel appears
**Then** if the field has Item 7 range data, it displays "Item 7 range: $X – $Y" with formatted currency values
**And** if the field has no Item 7 range data, it displays "Item 7 range: N/A" (not "No range data")
**And** the brand default value and source attribution continue to display correctly

### AC4: Forms mode completeness dashboard includes Startup Costs
**Given** I am in Forms mode
**When** the plan completeness dashboard renders at the top
**Then** a "Startup Costs" entry appears showing the count of startup cost line items (e.g., "Startup Costs: 8 items")
**And** this entry updates when I add or remove items via the StartupCostBuilder

## Dev Notes

### Architecture Patterns to Follow

- **Component reuse:** The `StartupCostBuilder` component (`client/src/components/shared/startup-cost-builder.tsx`) is fully implemented with add/edit/remove/reorder/reset, Item 7 range display, and CapEx classification. It accepts a single prop: `planId: string`. Mount it; do not rebuild it.
- **Data fetching:** `StartupCostBuilder` uses the `useStartupCosts(planId)` hook internally for data fetching and mutations via `PUT /api/plans/:id/startup-costs`. No additional data wiring is needed in the parent components.
- **Field metadata system:** Forms mode and Quick Entry mode both use `FIELD_METADATA`, `CATEGORY_ORDER`, and `CATEGORY_LABELS` from `client/src/lib/field-metadata.ts` to organize financial parameter fields. Startup costs are a fundamentally different data structure (variable line items from `plan_startup_costs` table, not fixed fields from `financial_inputs` JSONB), so they should be mounted as a separate section — not added to the field-metadata system.
- **Per-field metadata in FinancialFieldValue:** The `FinancialFieldValue` interface (in `shared/financial-engine.ts`) includes `item7Range?: { min: number; max: number }`. The forms-mode metadata panel currently ignores this field and hardcodes "No range data" at line 463 of `forms-mode.tsx`. Replace the hardcoded text with a conditional read of `field.item7Range`.
- **Currency formatting:** Use `formatCents()` from `client/src/lib/format-currency.ts` for Item 7 range display (values are stored in cents).
- **Collapsible pattern:** Forms mode uses shadcn `Collapsible` components for category sections. The StartupCostBuilder section should follow the same collapsible pattern, using the same styling and the same `ChevronDown` rotation pattern.
- **Category ordering:** The startup costs section should appear after the `startupCapital` category in both Forms and Quick Entry modes. In Forms, this means rendering it after the `CATEGORY_ORDER.map()` loop. In Quick Entry, this means rendering it below the TanStack Table grid.

### UI/UX Deliverables

**Forms Mode changes:**
- New collapsible "Startup Costs" section at the bottom of the category list, after "Startup Capital"
- Section header matches existing category section headers (ChevronDown icon, category label, progress count)
- Inside the collapsible: renders `<StartupCostBuilder planId={planId} />`
- Completeness dashboard at top includes a "Startup Costs" entry showing item count

**Quick Entry Mode changes:**
- Below the TanStack Table grid, a "Startup Costs" section renders `<StartupCostBuilder planId={planId} />`
- Visually consistent: same background, padding, and spacing as the grid above
- A collapsible category header ("Startup Costs") matches the grid's category group header styling

**Forms Mode metadata panel fix:**
- Line 463 in forms-mode.tsx: replace hardcoded "No range data" with conditional display of `field.item7Range` using `formatCents()`

**States:**
- Loading: `StartupCostBuilder` already handles its own loading state (Skeleton)
- Error: `StartupCostBuilder` already handles its own error state (AlertCircle)
- Empty: `StartupCostBuilder` already handles empty state (shows "No startup costs configured")

### Anti-Patterns & Hard Constraints

- **DO NOT rebuild startup cost functionality.** The component exists and works. The only task is mounting it in the right places.
- **DO NOT add startup cost fields to `FIELD_METADATA` or `CATEGORY_ORDER`.** Startup costs are variable line items from a separate table (`plan_startup_costs`), not fixed parameter fields from the `financial_inputs` JSONB. They have different CRUD operations (add/remove/reorder) that don't fit the parameter field pattern.
- **DO NOT modify `StartupCostBuilder` internals** unless strictly necessary for integration (e.g., adding a `className` prop for styling adjustments). The component's data fetching, mutations, and rendering logic are complete and tested.
- **DO NOT modify** `server/vite.ts`, `vite.config.ts`, `drizzle.config.ts`, or `package.json`.
- **DO NOT modify** any server-side files. This is purely a frontend integration task — all API endpoints and data models already exist.

### Gotchas & Integration Warnings

- **Startup cost data is separate from financial inputs.** The `plan.financialInputs` JSONB contains financial parameters. Startup costs live in `plan_startup_costs` table and are fetched by `useStartupCosts(planId)` inside `StartupCostBuilder`. These are two different data paths — don't conflate them.
- **Item 7 range field name mismatch:** In `FinancialFieldValue`, the field is `item7Range: { min, max }`. In the `plan_startup_costs` table, the columns are `item7_range_low` and `item7_range_high`. The `StartupCostBuilder` already handles this mapping internally. For the forms-mode metadata panel fix, read `field.item7Range.min` and `field.item7Range.max`.
- **Quick Entry grid uses virtualization.** The `StartupCostBuilder` should be mounted OUTSIDE the virtualized area — below the `scrollContainerRef` div, not inside the TanStack Table rows. Adding it inside the table would break virtualization calculations.
- **Auto-save integration:** `StartupCostBuilder` handles its own saves via `useStartupCosts` hook (PUT to startup costs API). It does NOT use the `queueSave` prop that Forms/Quick Entry modes use for `financial_inputs` auto-save. No auto-save wiring is needed.
- **Completeness dashboard for startup costs:** The existing `computeSectionProgress()` function iterates `CATEGORY_ORDER` and checks `FIELD_METADATA`. For the startup costs entry, you'll need to add a separate count — use `useStartupCosts(planId)` to get the count of items, displayed as "X items" rather than "X/Y fields" since there's no fixed total.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/components/planning/forms-mode.tsx` | MODIFY | Add StartupCostBuilder collapsible section after category sections; fix Item 7 range display in metadata panel (line 463); add startup cost count to completeness dashboard |
| `client/src/components/planning/quick-entry-mode.tsx` | MODIFY | Add StartupCostBuilder section below the grid table |
| `client/src/components/planning/input-panel.tsx` | NO CHANGE | Forms/Quick Entry modes handle their own rendering; no changes needed here |
| `client/src/components/shared/startup-cost-builder.tsx` | POSSIBLY MODIFY | May need to accept optional `className` prop for Quick Entry styling consistency; otherwise no changes |
| `client/src/lib/field-metadata.ts` | NO CHANGE | Startup costs don't belong in the field metadata system |

### Testing Expectations

- **E2E testing (Playwright):** Primary testing method. Verify:
  - Forms mode shows "Startup Costs" section that expands to show the builder
  - Quick Entry mode shows "Startup Costs" section below the grid
  - Add/remove/reorder operations work within both modes
  - Item 7 range displays in StartupCostBuilder (already working in component)
  - Forms metadata panel shows Item 7 range when field has range data
  - Completeness dashboard includes startup cost count
- **No unit tests needed:** This is a pure mounting/integration task — the component's own logic is already tested

### Dependencies & Environment Variables

- **No new packages needed.** All required components, hooks, and libraries are already installed.
- **No environment variables needed.**
- **Data dependency:** Plans must have startup cost data initialized from brand templates. This is handled by the existing plan creation flow (`POST /api/plans` initializes startup costs from brand template).

### References

- UX Design Specification: `_bmad-output/planning-artifacts/ux-design-specification.md`
  - Lines 193-194: Sam's emotional arc — "Startup Cost Builder — Surprised capability"
  - Lines 735-751: Normal Mode interaction flow — collapsible sections by category including Startup Costs
  - Lines 793-799: Story 4.2 AC — sections include "Startup Costs"
  - Lines 810-815: Story 4.3 AC — category groups include "Startup Costs"
- Architecture: `_bmad-output/planning-artifacts/architecture.md`
  - Lines 127-138: Startup Cost Builder as Subsystem
  - Lines 353-359: `plan_startup_costs` table schema
  - Lines 376-408: Per-field metadata pattern with `item7_range`
  - Lines 533-536: Startup Costs API endpoints
- Epics: `_bmad-output/planning-artifacts/epics.md`
  - Story 3.3 (lines 667-681): StartupCostBuilder component creation
  - Story 4.2 (lines 789-799): Forms mode with Startup Costs section
  - Story 4.3 (lines 810-815): Quick Entry with Startup Costs category group
- Existing component: `client/src/components/shared/startup-cost-builder.tsx` (485 lines, fully implemented)
- Existing hook: `client/src/hooks/use-startup-costs.ts`
- FR Coverage: FR4 (Item 7 ranges), FR5 (add/remove/reorder), FR6 (CapEx classification), FR20 (advisory nudges — partial, for startup cost items)

## Dev Agent Record

### Agent Model Used

### Completion Notes

### File List

### Testing Summary
