# Story 10.3: Scenario Persistence & Comparison

Status: review

## Story

As a franchisee,
I want to save my slider configurations as named scenarios and compare them against my base plan,
so that I can explore multiple "what-if" variations and build conviction about which assumptions matter most.

## Acceptance Criteria

### Save Scenario

1. Given I have adjusted sliders in the What-If Playground to a non-zero configuration, when I click "Save as Scenario" (`data-testid="button-save-scenario"`), then a dialog (`data-testid="dialog-save-scenario"`) prompts me to name the scenario with a text input (`data-testid="input-scenario-name"`) and a "Save" button (`data-testid="button-confirm-save-scenario"`). Pressing Save persists the current `SliderValues` as a named scenario associated with the current plan via `POST /api/plans/:planId/scenarios`. The scenario selector dropdown updates to include the new scenario. If all sliders are at zero, the "Save as Scenario" button is disabled.

2. Given I attempt to save a scenario, when I submit the name, then the name is validated: non-empty (trimmed), max 60 characters, and unique within this plan's saved scenarios. If validation fails, an inline error message appears below the input. If the plan already has 10 saved scenarios, the save dialog shows a message "Maximum 10 scenarios per plan reached — delete one to save a new one" and the Save button is disabled.

### Load Scenario

3. Given I have one or more saved scenarios, when I view the scenario selector dropdown (`data-testid="select-scenario"`), then I see all my saved scenarios listed by name in creation-date order (newest first). Selecting a saved scenario loads its `SliderValues` into the slider controls — all sliders update to the saved positions — and the metric cards and charts update to reflect the loaded scenario.

4. Given I have loaded a saved scenario, when I view the Sensitivity Controls panel, then the currently loaded scenario's name is displayed in the controls header (`data-testid="text-loaded-scenario-name"`) as a label (e.g., "Low Revenue + Lean Marketing"). Modifying any slider after loading creates an "unsaved changes" indicator (`data-testid="indicator-unsaved-changes"`) — a small dot or text badge near the scenario name.

### Update / Save As

5. Given I have loaded a saved scenario and modified one or more sliders (unsaved changes indicator is visible), when I click "Save as Scenario", then the dialog offers two options: "Save as New" (`data-testid="button-save-as-new"`) to create a new scenario with the modified sliders, and "Update [scenario name]" (`data-testid="button-update-scenario"`) to overwrite the currently loaded scenario's slider values via `PUT /api/plans/:planId/scenarios/:scenarioId`. After saving/updating, the unsaved changes indicator clears.

### Delete Scenario

6. Given I have saved scenarios, when I want to delete one, then I can delete any saved scenario via a delete action in the dropdown (trash icon or "Delete" option per scenario row, `data-testid="button-delete-scenario-{scenarioId}"`). Clicking delete shows a brief confirmation ("Delete 'Low Revenue'?" with Cancel/Delete buttons). Confirming sends `DELETE /api/plans/:planId/scenarios/:scenarioId`. If the deleted scenario was currently loaded, sliders reset to zero and the loaded scenario name clears.

### Comparison Overlay

7. Given I have at least one saved scenario, when I want to compare scenarios, then I can select a saved scenario as a "comparison overlay" from a separate "Compare with…" control (`data-testid="select-comparison-scenario"`). Selecting a comparison scenario triggers a third engine run: the comparison scenario's saved `SliderValues` are applied to the base plan inputs to produce a third `EngineOutput`. Charts show a third dotted line (`strokeDasharray="2 2"`) for the comparison scenario alongside Base (solid) and Your Scenario (dashed). Metric delta cards show a third column for the comparison scenario with its own delta vs Base.

8. Given a comparison overlay is active, when I deselect the comparison scenario (choose "None" from the Compare dropdown), then the third dotted line disappears from all charts, the third metric column is removed, and the engine returns to 2 runs (base + current). The comparison overlay is optional — the playground is fully functional without it.

### Sandbox Invariant

9. Given I adjust sliders, load scenarios, save scenarios, or activate comparison overlays, when I observe the plan data, then no saved plan data is modified — no `PATCH /api/plans/:planId` is sent for `financialInputs`. Scenario CRUD operations use dedicated `/api/plans/:planId/scenarios` endpoints only. The `financialInputs` column on the `plans` table is never touched by scenario operations.

### data-testid Coverage

10. Given the What-If Playground renders with scenario persistence features, then it includes:
    - `data-testid="button-save-scenario"` on the Save as Scenario button
    - `data-testid="dialog-save-scenario"` on the save/update dialog
    - `data-testid="input-scenario-name"` on the name input in the dialog
    - `data-testid="button-confirm-save-scenario"` on the dialog's Save button
    - `data-testid="select-scenario"` on the scenario selector/load dropdown
    - `data-testid="text-loaded-scenario-name"` on the loaded scenario name display
    - `data-testid="indicator-unsaved-changes"` on the unsaved changes indicator
    - `data-testid="button-save-as-new"` on the "Save as New" option in the update dialog
    - `data-testid="button-update-scenario"` on the "Update [name]" option in the update dialog
    - `data-testid="button-delete-scenario-{scenarioId}"` on each scenario's delete action
    - `data-testid="select-comparison-scenario"` on the comparison overlay dropdown
    - `data-testid="scenario-count-indicator"` on the saved scenarios count display (e.g., "3/10")

## Dev Notes

### Storage Design Decision: JSONB Column vs Separate Table

**Recommendation: JSONB column `what_if_scenarios` on the `plans` table.**

| Criterion | JSONB column on `plans` | Separate `what_if_scenarios` table |
|-----------|------------------------|------------------------------------|
| Implementation complexity | LOW — single column, single query | MODERATE — new table, FK, migration, CRUD queries |
| Query pattern | Read/write entire array atomically | Individual row CRUD, JOIN on read |
| 10-scenario cap enforcement | Application-layer array length check | Application-layer COUNT query OR DB constraint |
| Plan cloning | Free — JSONB cloned with plan | Requires explicit scenario row duplication |
| Plan deletion cascade | Free — column deleted with plan | Requires ON DELETE CASCADE FK |
| Performance at 10 items | Negligible — small JSONB blob | Negligible — 10 rows |
| Concurrency risk | Low — single user edits their own plan | Low — same, but row-level is theoretically cleaner |
| Migration risk | Low — nullable column, no existing data affected | Low — new table, no existing data affected |

**Decision: JSONB column.** The scenario data is small (10 objects × ~100 bytes each), always accessed as a complete set (load all for dropdown), and has a natural lifecycle tied to the plan (clone, delete cascade). A separate table adds complexity without material benefit at this scale.

**Schema addition to `shared/schema.ts`:**

```typescript
export interface WhatIfScenario {
  id: string;
  name: string;
  sliderValues: SliderValues;
  createdAt: string;
}

// Add to plans table definition:
whatIfScenarios: jsonb("what_if_scenarios").$type<WhatIfScenario[]>().default([]),
```

Generate `id` client-side using `crypto.randomUUID()` (or `nanoid` if already in project dependencies — check first). The `id` field is needed for update/delete targeting and for `data-testid` suffixing.

**Migration:** Add the column via a Drizzle migration. The column is nullable with a default of `[]` (empty array). Existing plans get `null` → treat as `[]` in application code.

### API Design

Three new endpoints under the existing plans router (`server/routes/plans.ts`):

**POST /api/plans/:planId/scenarios** — Create a saved scenario
```
Request body: { name: string, sliderValues: SliderValues }
Validates: name non-empty, trimmed, max 60 chars, unique within plan
Validates: plan has < 10 scenarios
Validates: sliderValues matches SliderValues shape (5 numeric keys)
Response: 201 with updated plan (or just the new WhatIfScenario)
Implementation: Read plan → validate → append to whatIfScenarios array → PATCH plan
```

**PUT /api/plans/:planId/scenarios/:scenarioId** — Update a saved scenario
```
Request body: { name?: string, sliderValues?: SliderValues }
Validates: scenario exists in plan's whatIfScenarios array
Validates: if name provided, same rules as create (unique excluding current)
Response: 200 with updated scenario
Implementation: Read plan → find scenario by id → merge updates → PATCH plan
```

**DELETE /api/plans/:planId/scenarios/:scenarioId** — Delete a saved scenario
```
Response: 200 with { deleted: true }
Implementation: Read plan → filter out scenario by id → PATCH plan
```

All three endpoints reuse the existing plan access auth middleware (the `requirePlanAccess()` function in `plans.ts`). No new auth logic needed.

**Zod validation schema** for scenario create/update:

```typescript
import { z } from "zod";

const sliderValuesSchema = z.object({
  revenue: z.number(),
  cogs: z.number(),
  labor: z.number(),
  marketing: z.number(),
  facilities: z.number(),
});

const createScenarioSchema = z.object({
  name: z.string().trim().min(1).max(60),
  sliderValues: sliderValuesSchema,
});

const updateScenarioSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  sliderValues: sliderValuesSchema.optional(),
});
```

### Architecture Patterns to Follow

- **Epic 10 is the sole scenario analysis surface (SCP-2026-02-20 D5/D6).** The column-splitting scenario comparison was retired from Reports. Epic 10 (What-If Playground) is now the canonical and only home for scenario analysis. Do NOT import or integrate `ScenarioBar`, `ComparisonTableHead`, or `ScenarioSummaryCard` from Epic 5 statements.
  - Source: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-02-21.md`

- **Workspace view integration:** This story modifies `what-if-playground.tsx` to add scenario management UI (Save button, Load dropdown, Compare dropdown). It does NOT modify `planning-workspace.tsx`. All scenario UI lives inside the existing `WhatIfPlayground` component.
  - Source: `client/src/components/planning/what-if-playground.tsx` (created in 10.1, enhanced in 10.2a/10.2b)

- **Scenario computation (revised per SCP-2026-02-21):** `computeSensitivityOutputs()` in `sensitivity-engine.ts` accepts `(planInputs, startupCosts, currentSliders)` and returns `SensitivityOutputs { base, current }`. For the comparison overlay, add a new function or extend the existing one to compute a third output:
  ```typescript
  export function computeComparisonOutput(
    planInputs: PlanFinancialInputs,
    startupCosts: StartupCostLineItem[],
    comparisonSliders: SliderValues,
  ): EngineOutput { ... }
  ```
  The comparison output uses the same `applySensitivityFactors` + `calculateProjections` pipeline but with the saved scenario's `SliderValues`.
  - Source: `client/src/lib/sensitivity-engine.ts`

- **TanStack Query integration:** Scenario data travels with the plan object (JSONB column). The existing `usePlan` hook (`client/src/hooks/use-plan.ts`) already fetches the plan. After the schema migration, `plan.whatIfScenarios` will be available on the plan object. Scenario mutations (create/update/delete) should use `apiRequest` from `@lib/queryClient` and invalidate the plan query cache via `queryClient.invalidateQueries({ queryKey: ['/api/plans', planId] })`.
  - Source: `client/src/hooks/use-plan.ts`, `client/src/lib/queryClient.ts`

- **Storage interface:** Add no new methods to `IStorage` for scenarios. Scenario CRUD operates through the existing `updatePlan()` method (PATCH with updated `whatIfScenarios` array). The API route handlers read the plan, modify the `whatIfScenarios` array, and call `storage.updatePlan()`.

- **Chart comparison integration:** When a comparison scenario is active, pass the comparison `EngineOutput` to `SensitivityCharts` as an optional `comparisonOutput` prop. `SensitivityCharts` (created in 10.2a) already has placeholder references for Story 10.3 comparison lines — see AC3 ("If a saved scenario is loaded for comparison (Story 10.3), a third dotted curve is shown"), AC7 ("a third bar shows its break-even month"), AC16 ("If a comparison scenario is loaded (Story 10.3), it uses a third color with dotted line style"). These placeholders need to be activated with actual rendering logic.

- **Naming conventions (architecture.md):** Components: PascalCase. Files: kebab-case. data-testid: `{type}-{content}` for display elements, `{action}-{target}` for interactive. Hooks: `use` prefix + camelCase.

- **Currency values are stored in CENTS:** All `EngineOutput` numeric values are in cents. The metric delta cards already handle this conversion — follow the existing pattern in `what-if-playground.tsx`.

### UI/UX Deliverables

**Scenario Management Controls (in Sensitivity Controls panel header):**

The existing controls header (line 448–464 of `what-if-playground.tsx`) has a flex row with the "Sensitivity Controls" title and the Reset button. Extend this area to include scenario management:

```
┌─────────────────────────────────────────────────────────┐
│  Sensitivity Controls           [3/10 scenarios saved]  │
│  [Loaded: "Low Revenue"]  ● unsaved changes             │
│                                                         │
│  [Load ▾]  [Compare with… ▾]  [Save as Scenario]  [⟲]  │
├─────────────────────────────────────────────────────────┤
│  Revenue:    ←——●——→ +10%   +$14,200/yr    [___]       │
│  ...                                                    │
└─────────────────────────────────────────────────────────┘
```

- **Load dropdown** (`select-scenario`): Uses shadcn `Select` component. Lists saved scenario names. Selecting one loads its sliders. Include a "— None —" option to deselect.
- **Compare with… dropdown** (`select-comparison-scenario`): Separate `Select`. Same scenario list but for overlay comparison. Include "— None —" to deselect. The currently loaded scenario (if any) should still appear in the Compare list — users may want to compare the currently loaded scenario (as modified) against its saved state.
- **Save as Scenario button** (`button-save-scenario`): Opens the save dialog. Disabled when all sliders are at zero.
- **Scenario count** (`scenario-count-indicator`): Shows "3/10" or similar near the controls title.
- **Loaded scenario name** (`text-loaded-scenario-name`): Displayed when a scenario is loaded.
- **Unsaved changes indicator** (`indicator-unsaved-changes`): Small dot or "(modified)" text when sliders differ from the loaded scenario's saved values.

**Save Scenario Dialog:**

Use shadcn `Dialog` component (already in project). Contains:
- Title: "Save Scenario" (or "Save Changes" when updating)
- Name input field with validation errors
- When updating an existing scenario: two buttons — "Update [name]" and "Save as New"
- When creating new: single "Save" button
- Cancel button

**Delete Confirmation:**

Brief inline confirmation or small dialog. Keep lightweight — a full modal for delete is overkill for a sandbox feature.

### Anti-Patterns & Hard Constraints

- **DO NOT modify `financialInputs` when saving/loading/deleting scenarios.** The `financialInputs` column stores the user's actual plan. Scenario persistence operates exclusively on the `whatIfScenarios` JSONB column. This is the core sandbox invariant.

- **DO NOT store computed `EngineOutput` in the database.** Only store `SliderValues` (the input deltas). Engine outputs are recomputed client-side when needed. Storing outputs would create stale data when the base plan changes.

- **DO NOT create a separate scenarios table.** Use the JSONB column approach per the design decision above. A separate table adds migration complexity, cascade logic, and query overhead for no material benefit at ≤10 items per plan.

- **DO NOT allow saving scenarios with all sliders at zero.** A scenario with all zeros is identical to the Base Case — it provides no analytical value and would confuse users. Disable the Save button when `!hasAdjustment`.

- **DO NOT import or use `ScenarioBar`, `ScenarioSummaryCard`, or `ComparisonTableHead` from Epic 5 statements.** Those components are officially `[DEAD CODE]` per SCP-2026-02-20 D5/D6.

- **DO NOT modify `vite.config.ts`, `server/vite.ts`, `package.json`, or `drizzle.config.ts`.** These are protected project files.

- **DO NOT skip cache invalidation after scenario mutations.** Every POST/PUT/DELETE to `/api/plans/:planId/scenarios` must invalidate `queryClient.invalidateQueries({ queryKey: ['/api/plans', planId] })` so the plan object (with its `whatIfScenarios` array) refreshes.

- **DO NOT add a Tasks/Subtasks section to this story file.** The dev agent plans its own implementation.

### 7H.2 Per-Month Independence Dependency

- **Story 7H.2 has been completed.** `PlanFinancialInputs` now uses 60-element per-month arrays for qualifying fields (revenue AUV, COGS%, labor%, marketing%). The sensitivity engine's `applySensitivityFactors()` already iterates over all array elements (it uses `.length` loops, not hardcoded `5`). No sensitivity engine changes needed for per-month support. `SliderValues` (percentage adjustments) are scenario-agnostic and unaffected.

### Gotchas & Integration Warnings

- **The `whatIfScenarios` column will be `null` for all existing plans until they save their first scenario.** Always treat `null` as `[]` (empty array) in application code: `const scenarios = plan.whatIfScenarios ?? [];`

- **Plan cloning (`clonePlan` in `storage.ts`) automatically clones JSONB columns.** When a user clones a plan, the saved scenarios will be cloned too. This is the desired behavior — the user gets a copy of their scenario work with the cloned plan. Verify that `clonePlan` handles the new column correctly (it should, since it copies all columns).

- **The comparison overlay engine run is independent of the "current" slider state.** The comparison scenario's `SliderValues` are applied to the BASE plan inputs, NOT to the current slider state. This means: Base = plan as-is, Current = plan + live sliders, Comparison = plan + saved scenario sliders. All three are independent derivations from the same base.

- **Scenario ID uniqueness is per-plan.** Use `crypto.randomUUID()` for IDs. No need for globally unique IDs since scenarios are embedded in a plan's JSONB column.

- **The `updatePlan` method in `storage.ts` already handles partial updates via Drizzle's `set()`.** Passing `{ whatIfScenarios: [...] }` as part of the update payload works with the existing `updatePlanSchema.partial()` pattern. However, ensure the `updatePlanSchema` picks up the new `whatIfScenarios` field after the schema change.

- **Race condition on concurrent saves:** If a user rapidly saves two scenarios, the second save could overwrite the first (read-modify-write on the JSONB array). This is acceptable for MVP — single-user plans have minimal concurrency risk. For robustness, consider optimistic concurrency (e.g., `updatedAt` check) in a future story.

- **Comparison overlay + delete interaction:** If the user deletes the scenario that is currently selected as the comparison overlay, the comparison must auto-deselect (clear the comparison dropdown and remove the third chart line). Handle this in the `onSuccess` callback of the delete mutation.

- **Loaded scenario + delete interaction:** If the user deletes the scenario that is currently loaded, reset sliders to zero and clear the loaded scenario name. Handle this in the `onSuccess` callback of the delete mutation.

- **`SensitivityCharts` prop extension:** Story 10.2a's `SensitivityCharts` component currently accepts `{ scenarioOutputs: SensitivityOutputs | null }`. Extend to accept an optional `comparisonOutput?: EngineOutput | null`. When provided, all 6 charts render a third dotted line using the comparison output's data. When `null` or omitted, charts render as before (2 lines only).

- **Metric delta card extension:** The `MetricDeltaCardStrip` and `MetricDeltaCard` components in `what-if-playground.tsx` currently show Base vs Current (2 columns per card). When a comparison overlay is active, add a third column showing the comparison scenario's value and delta vs Base. The `ComputedDeltaMetric` interface and `DELTA_METRICS` config array may need extension.

- **Drizzle migration:** After adding the `whatIfScenarios` column to the schema, run `npx drizzle-kit generate` to create the migration, then `npx drizzle-kit push` to apply it. The column should be nullable with no `NOT NULL` constraint since existing plans won't have scenario data.

### Files in Change Summary

| File | Action | Purpose |
|------|--------|---------|
| `shared/schema.ts` | Modify | Add `WhatIfScenario` interface, `whatIfScenarios` JSONB column to plans table, update `insertPlanSchema`/`updatePlanSchema` |
| `server/routes/plans.ts` | Modify | Add POST/PUT/DELETE `/api/plans/:planId/scenarios` endpoints |
| `client/src/lib/sensitivity-engine.ts` | Modify | Add `computeComparisonOutput()` function for third engine run |
| `client/src/components/planning/what-if-playground.tsx` | Modify | Add scenario save/load/delete/compare UI, state management, mutation hooks |
| `client/src/components/planning/sensitivity-charts.tsx` | Modify | Accept optional `comparisonOutput` prop, render third dotted line on all 6 charts |
| Drizzle migration file | Create | Add `what_if_scenarios` column to plans table |

## Dev Agent Record

- **Agent Model Used:** Claude 4.6 Opus (Replit Agent)
- **Completion Notes:** Implemented full scenario persistence & comparison feature. JSONB column `whatIfScenarios` added to plans table via direct SQL migration. Three API endpoints (POST/PUT/DELETE) with Zod validation enforce max 10 scenarios, unique names, and non-zero sliders. UI includes scenario save/load dropdown, update/rename buttons, save-as-new vs update dialog, comparison dropdown and per-row toggle, comparison banner, and N/10 counter. All 6 sensitivity charts extended with third dotted comparison line. MetricDeltaCardStrip shows comparison metrics. Sandbox invariant preserved — no scenario CRUD operation touches financialInputs.
- **File List:**
  - `shared/schema.ts` — Added WhatIfScenario interface, WhatIfScenarioSliderValues, whatIfScenarios JSONB column
  - `server/routes/plans.ts` — Added POST/PUT/DELETE /api/plans/:planId/scenarios endpoints
  - `client/src/lib/sensitivity-engine.ts` — Added computeComparisonOutput() function, exported EngineOutput type
  - `client/src/components/planning/what-if-playground.tsx` — Scenario CRUD UI, comparison overlay, save/load/update/rename/delete, dialog with Save as New + Update options
  - `client/src/components/planning/sensitivity-charts.tsx` — Third dotted comparison line on all 6 charts
- **Testing Summary:** E2E test attempted via Playwright but blocked by authentication requirement (Google OAuth / email-password login). Code verified structurally via architect review, LSP diagnostics (0 errors, 0 warnings), and HMR hot-reload confirmation. All ACs verified via code inspection.
- **LSP Status:** 0 errors, 0 warnings
- **Visual Verification:** Blocked by auth — screenshots not obtainable without authenticated session
