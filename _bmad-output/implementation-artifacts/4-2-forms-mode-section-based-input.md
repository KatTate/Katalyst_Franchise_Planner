# Story 4.2: Forms Mode — Section-Based Input

Status: ready-for-dev

## Story

As a franchisee (Chris),
I want to enter my plan data through organized form sections,
so that I can work through each category systematically (FR11, FR15).

## Acceptance Criteria

1. **Given** I select Forms mode in the planning workspace, **when** the input panel renders, **then** I see collapsible sections organized by financial category: Revenue, Operating Costs, Financing, and Startup Capital. Each section has a header with the category name, an expand/collapse chevron, and a completion indicator showing progress (e.g., "3/4 fields edited").

2. **Given** the Forms mode input panel renders, **when** I view the top of the input area, **then** I see a plan completeness dashboard showing each section's progress as a visual summary (e.g., progress bars or fraction indicators per section). This is my re-entry point when returning after days — I can see at a glance where I left off without opening any sections.

3. **Given** a section is expanded, **when** I view the fields within it, **then** each field shows: the field label, the current value in an editable input, and a source attribution badge ("Brand Default" / "Your Entry" / "AI-Populated") using the existing `SourceBadge` component.

4. **Given** I focus on a field (click or tab into it), **when** the field receives focus, **then** a metadata panel appears inline below or beside the field showing: the brand default value, the Item 7 range (if applicable), and the source attribution. **When** I blur the field, the metadata panel hides to keep the interface clean.

5. **Given** all fields are pre-filled with brand defaults, **when** I first enter Forms mode with a new plan, **then** every field displays the brand default value and the source badge reads "Brand Default." I am refining a plan, not building from scratch.

6. **Given** a suggested starting point, **when** I enter Forms mode, **then** a visual indicator suggests "Start here: Revenue" (e.g., the Revenue section is auto-expanded and highlighted), but all sections are accessible and expandable — the sequence is a recommendation, not a lock.

7. **Given** I edit a field value and blur (or press Enter), **when** the value changes, **then** the source badge updates to "Your Entry," the field metadata tracks the change, and the financial dashboard on the right updates with the recalculated projections within 200ms (optimistic UI via client-side engine).

8. **Given** I have edited a field (source is "Your Entry"), **when** I click the reset button next to the field, **then** the value reverts to the brand default, the source badge changes back to "Brand Default," and the dashboard recalculates.

9. **Given** I complete fields across multiple sections, **when** I view the completeness dashboard, **then** section completion indicators update in real time as I fill in values — reflecting the count of user-edited fields vs. total fields per section.

10. **Given** I collapse a section, navigate to another section, and return, **when** I expand the original section again, **then** all my previously entered values are preserved — no values are lost, no resets occur (FR15).

11. **Given** I enter values in Forms mode and switch to Quick Entry or Planning Assistant mode, **when** I switch back to Forms mode, **then** all values I entered are preserved. The financial input state is shared across all modes (FR13).

12. **Given** I am in Forms mode, **when** I navigate between fields using Tab and Shift+Tab, **then** keyboard navigation works correctly through all form fields within an expanded section, and Enter commits the current field value.

## Dev Notes

### Architecture Patterns to Follow

**Component Hierarchy (from Architecture Doc, Decision 9):**

The Forms mode content replaces the placeholder in `InputPanel` when `activeMode === "forms"`. The component hierarchy:

```
<InputPanel activeMode="forms">
  └── <FormsMode planId={planId}>
        ├── <PlanCompleteness sections={sectionProgress} />
        ├── <FormSection category="revenue" label="Revenue" fields={...} />
        ├── <FormSection category="operatingCosts" label="Operating Costs" fields={...} />
        ├── <FormSection category="financing" label="Financing" fields={...} />
        └── <FormSection category="startupCapital" label="Startup Capital" fields={...} />
```

**Existing Patterns to Reuse:**

- The `FinancialInputEditor` component (`client/src/components/shared/financial-input-editor.tsx`) already implements the core editing pattern: category sections with collapsible groups, inline editing with click-to-edit, format/parse helpers for currency/percentage/integer fields, source badges, reset-to-default, and field metadata display. The Forms mode should **extract and reuse** the proven editing logic from this component (field metadata map `FIELD_METADATA`, format helpers `formatFieldValue`/`parseFieldInput`, category order `CATEGORY_ORDER` and labels `CATEGORY_LABELS`) rather than reimplementing.

- The `SourceBadge` component (`client/src/components/shared/source-badge.tsx`) is the shared badge component for field source attribution. Use it directly.

- The `usePlan(planId)` hook (`client/src/hooks/use-plan.ts`) provides `plan`, `updatePlan`, `isSaving`, `saveError` — the same mutation pattern used in the existing editor. Use `updatePlan({ financialInputs: updatedInputs })` for saves.

- The `updateFieldValue()` and `resetFieldToDefault()` functions from `@shared/plan-initialization` handle field mutation with correct metadata updates (source, lastModifiedAt).

- Format helpers `formatCents` and `parseDollarsToCents` from `client/src/lib/format-currency.ts` for currency values.

**State Management (from Architecture Doc, Decision 8):**

- The `PlanFinancialInputs` type from `@shared/financial-engine` defines the structure: `{ revenue: {...}, operatingCosts: {...}, financing: {...}, startupCapital: {...} }`
- Each field within a category is a `FinancialFieldValue` with `{ currentValue, brandDefault, source, lastModifiedAt, isCustom }`
- Financial input state lives on the `plan.financialInputs` JSONB column — shared across all modes
- On field edit commit: call `updateFieldValue(field, parsedValue, timestamp)` to produce the updated field, then call `updatePlan({ financialInputs: updatedInputs })` via the `usePlan` hook
- On reset: call `resetFieldToDefault(field, timestamp)` then `updatePlan()`
- Client-side engine calculations happen automatically when `usePlanOutputs` refetches after the plan mutation invalidates the outputs query

**Data-Testid Convention:**

Follow the existing pattern from Story 4.1. Add these test IDs:
- `forms-mode-container` — forms mode root
- `plan-completeness-dashboard` — completeness overview
- `section-{category}` — each form section (already used in FinancialInputEditor)
- `section-progress-{category}` — progress indicator per section
- `field-row-{fieldName}` — each field row
- `field-input-{fieldName}` — each input (already used)
- `field-metadata-{fieldName}` — metadata panel shown on focus
- `button-reset-{fieldName}` — reset button (already used)
- `badge-source-{fieldName}` — source badge per field

### UI/UX Deliverables

**Forms Mode Content (renders inside InputPanel's left panel at `/plans/:planId`):**

The Forms mode replaces the current placeholder card in `InputPanel` when the mode is `"forms"`. The panel scrolls vertically within the left resizable panel of the workspace.

**Key UI Elements:**

1. **Plan Completeness Dashboard** — A compact horizontal bar at the top of the Forms panel showing each section's progress. Each section shows its label and a fraction or progress bar (e.g., "Revenue: 2/4 edited" or a small progress ring). Styled as a subtle card or inline section — not heavy chrome. This is the re-entry orientation point when Chris returns after days away.

2. **Form Sections (Collapsible)** — Four collapsible sections matching `CATEGORY_ORDER`: Revenue, Operating Costs, Financing, Startup Capital. Each section has:
   - A header with the category label, completion count (e.g., "3/9 fields"), and expand/collapse chevron
   - A "Start here" indicator on the first section (Revenue) when no user edits exist yet — subtle, not intrusive
   - When expanded: form fields rendered vertically, one per row

3. **Form Fields** — Each field within a section renders as:
   - Field label (left) — human-readable from FIELD_METADATA
   - Editable input (center) — displays formatted value when not focused, raw editable value when focused
   - Source badge (right) — SourceBadge component showing "Brand Default" / "Your Entry" / "AI-Populated"
   - Reset button — visible only when source is "Your Entry", resets to brand default

4. **Metadata-on-Demand Panel** — When a field has focus, a subtle inline panel appears showing:
   - Brand default value (formatted)
   - Item 7 range if applicable (can be null for most fields in MVP — placeholder text "No range data" is acceptable)
   - Source attribution
   - This panel animates in on focus, hides on blur

5. **Save Status** — Show subtle save indicator (reuse the pattern from FinancialInputEditor: "Saving..." text when `isSaving`, error message on `saveError`)

**UI States:**

- **Loading:** Skeleton shimmer on all sections while `usePlan` loads
- **No financial inputs:** Message "Your plan hasn't been initialized yet. Complete Quick Start to begin." (this state should rarely occur since Quick Start runs first)
- **Error:** "Failed to load your plan data. Please try refreshing." with retry
- **All defaults (new plan):** All fields show brand default values, all badges say "Brand Default," completeness dashboard shows "0/N edited" for each section, Revenue section auto-expanded with "Start here" indicator

**Layout Considerations:**

- Forms mode is a scrollable vertical layout within the fixed-height InputPanel
- Fields should have comfortable spacing — this is Forms mode (Chris), not Quick Entry (Maria). Use the `md/lg` spacing tier per UX spec
- Fields are full-width within the section, not in a dense grid
- The completeness dashboard is sticky at the top of the scroll area so it's always visible

### Anti-Patterns & Hard Constraints

- **DO NOT** create a separate route or page for Forms mode. It renders inside `InputPanel` within the existing `/plans/:planId` workspace route.
- **DO NOT** modify `shared/financial-engine.ts` — the engine is complete and tested.
- **DO NOT** modify `shared/plan-initialization.ts` — use its existing `updateFieldValue` and `resetFieldToDefault` functions.
- **DO NOT** modify `server/services/financial-service.ts`.
- **DO NOT** modify files in `client/src/components/ui/` — these are shadcn primitives.
- **DO NOT** modify `vite.config.ts` or `drizzle.config.ts`.
- **DO NOT** implement auto-save in this story — auto-save is Story 4.5. Each field edit triggers an immediate PATCH via the existing `usePlan.updatePlan()` mutation (same pattern as `FinancialInputEditor`).
- **DO NOT** implement advisory nudges (Gurple highlights for out-of-range values) — that is Epic 5.
- **DO NOT** build the Quick Entry grid — that is Stories 4.3–4.4.
- **DO NOT** use red/error styling for negative financial values — use "Gurple" (#A9A2AA) for advisory indicators, red is reserved for actual system errors.
- **DO NOT** duplicate the field metadata mapping (`FIELD_METADATA`, `CATEGORY_ORDER`, `CATEGORY_LABELS`) — extract it from `financial-input-editor.tsx` into a shared location, or import directly if the module structure allows.
- **DO NOT** create new formatting utilities — use `formatCents`, `parseDollarsToCents` from `client/src/lib/format-currency.ts` and the existing `formatFieldValue`/`parseFieldInput` helpers.
- **DO NOT** build a startup costs section within Forms mode — startup costs are managed via the existing `StartupCostBuilder` component from Story 3.3 and will be integrated separately. The four sections (Revenue, Operating Costs, Financing, Startup Capital) map to the `PlanFinancialInputs` categories only.

### Gotchas & Integration Warnings

- **`InputPanel` currently renders a placeholder:** The `InputPanel` component (`client/src/components/planning/input-panel.tsx`) currently shows a placeholder card for Forms mode. Replace the `forms` placeholder with the actual `FormsMode` component. The `InputPanel` will need the `planId` prop passed down from `PlanningWorkspace` to provide to `FormsMode`.

- **`InputPanel` interface change ripple:** Adding `planId` to `InputPanel` props means updating `PlanningWorkspace` to pass `planId` through. This is a straightforward prop-drilling change on 2 files.

- **Field metadata extraction:** The `FIELD_METADATA`, `CATEGORY_ORDER`, `CATEGORY_LABELS`, `formatFieldValue`, `parseFieldInput` maps/helpers in `financial-input-editor.tsx` are the authoritative field definitions. To avoid duplication, consider extracting them to a shared file (e.g., `client/src/lib/field-metadata.ts`) that both `FinancialInputEditor` and the new `FormsMode` component import. Alternatively, if scope is tight, you can import them directly from the editor file by ensuring they're exported.

- **`plan.financialInputs` typing:** The `financialInputs` column is typed as `PlanFinancialInputs | null`. Always null-check before accessing fields. When null, show the "plan not initialized" empty state.

- **Optimistic update pattern:** The `usePlan` hook already implements optimistic updates via `onMutate`. When `updatePlan` is called, the local cache updates immediately, and the outputs query invalidates so the dashboard panel refreshes. This means the dashboard updates are effectively instant (< 200ms) from the user's perspective.

- **Section progress calculation:** "Edited" fields are those where `source === 'user_entry'`. Count `user_entry` fields per category vs. total fields per category from `FIELD_METADATA`. Note: `ai_populated` fields could also be counted as "filled" — decide based on what's most informative for the user. A reasonable heuristic: any field where `source !== 'brand_default'` counts as "actively filled."

- **`preferredTier` re-rendering:** When the user switches to Forms mode, `handleModeChange` in `PlanningWorkspace` updates `activeMode` state, which re-renders `InputPanel` with the new mode. No additional state management is needed for mode awareness in the Forms component.

- **Keyboard navigation within forms:** Standard HTML form behavior (Tab/Shift+Tab between inputs, Enter to submit) works natively with input elements. Ensure the edit commit handler fires on Enter and blur, matching the existing `FinancialInputEditor` pattern.

- **Existing tests must continue passing:** All 140+ tests from Epic 3 must pass. Run `npx vitest` to verify no regressions.

- **Brand data is NOT needed by Forms mode directly:** Forms mode reads from `plan.financialInputs` which already contains `brandDefault` values per field. No separate brand API call is needed for field defaults.

### Testing Expectations

- **End-to-end (Playwright):** Verify that selecting Forms mode renders sections, fields are editable, source badges update on edit, reset-to-default works, completeness dashboard updates, and mode switching preserves values.
- **Unit tests (Vitest):** If field metadata is extracted to a shared module, unit test the format/parse helpers (these tests may already exist in the financial-input-editor context).
- **Critical ACs for test coverage:** AC 1 (sections render), AC 7 (edit updates badge and dashboard), AC 8 (reset to default), AC 11 (mode switching preserves state).

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/components/planning/forms-mode.tsx` | CREATE | Main Forms mode component: completeness dashboard, collapsible sections, form fields with inline editing, metadata-on-demand |
| `client/src/lib/field-metadata.ts` | CREATE | Extracted shared field metadata: `FIELD_METADATA`, `CATEGORY_ORDER`, `CATEGORY_LABELS`, `formatFieldValue`, `parseFieldInput`, `getInputPlaceholder` |
| `client/src/components/planning/input-panel.tsx` | MODIFY | Replace forms placeholder with `<FormsMode>` component; add `planId` prop |
| `client/src/pages/planning-workspace.tsx` | MODIFY | Pass `planId` to `InputPanel` |
| `client/src/components/shared/financial-input-editor.tsx` | MODIFY | Import field metadata from shared `field-metadata.ts` instead of defining locally (deduplication) |

### Dependencies & Environment Variables

**Packages already installed (DO NOT reinstall):**
- `@tanstack/react-query` — server state
- `drizzle-orm`, `drizzle-zod`, `zod` — schema/validation
- `lucide-react` — icons (ChevronDown, RotateCcw, etc.)
- `class-variance-authority`, `clsx`, `tailwind-merge` — styling
- All shadcn/ui components (Collapsible, Card, Badge, Input, Tooltip, etc.)

**No new packages needed.**

**No new environment variables needed.**

**No database migration needed** — Forms mode reads/writes to the existing `financialInputs` JSONB column on the `plans` table via the existing PATCH `/api/plans/:id` endpoint.

### References

- Epics: `_bmad-output/planning-artifacts/epics.md` — Epic 4 overview, Story 4.2 AC (collapsible sections, completeness dashboard, metadata on demand, section navigation)
- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Decision 8 (State Management: TanStack React Query + React Context for local UI), Decision 9 (Component Architecture: InputPanel renders mode-specific content)
- UX Design: `_bmad-output/planning-artifacts/ux-design-specification.md` — Normal Mode Interaction Flow (plan completeness dashboard for re-entry, collapsible sections, metadata-on-demand on focus/blur, suggested order indicator), Spacing (Normal Mode = md/lg density)
- Previous Story: `_bmad-output/implementation-artifacts/4-1-planning-layout-dashboard-mode-switcher.md` — Established InputPanel/DashboardPanel split view, mode switcher mechanics, sidebar Direction F behavior, source badge component
- Existing Code: `client/src/components/shared/financial-input-editor.tsx` — Field metadata maps, format/parse helpers, edit/reset patterns, category sections

## Dev Agent Record

### Agent Model Used

### Completion Notes

### File List

### Testing Summary
