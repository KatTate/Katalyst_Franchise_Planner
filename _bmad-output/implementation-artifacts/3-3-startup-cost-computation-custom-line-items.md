# Story 3.3: Startup Cost Computation & Custom Line Items

Status: ready-for-dev

## Story

As a franchisee,
I want to customize my startup costs beyond the brand template,
so that my plan reflects my specific situation (FR5, FR6).

## Acceptance Criteria

1. **Given** my plan has the brand's startup cost template pre-filled (via Story 3.2's `buildPlanStartupCosts()`), **when** I view the Startup Cost Builder section of my plan, **then** I see all template line items listed with columns: Item Name, My Estimate (editable), Brand Default, FDD Item 7 Low, FDD Item 7 High, and CapEx/Non-CapEx classification — and each template line item shows the FDD Item 7 range alongside the brand default and my estimate (FR4).

2. **Given** I am viewing my startup cost line items, **when** I click "Add Custom Item," **then** I see a form to enter: item name, amount (currency), and CapEx classification (CapEx or Non-CapEx) — **and** upon saving, the new custom item appears in my list with `isCustom: true` and `source: 'user_entry'`, **and** the dashboard metrics (total investment, ROI, break-even) update to reflect the addition.

3. **Given** I have a custom line item in my startup costs, **when** I click the remove action on that item, **then** the item is removed from my list, **and** the dashboard metrics update to reflect the removal. Template line items cannot be removed — only custom items have a remove action.

4. **Given** I have multiple startup cost line items (template and custom), **when** I reorder them using drag-and-drop or move controls, **then** the new order is persisted and reflected on next load.

5. **Given** I edit the amount of any startup cost line item (template or custom), **when** I change the value, **then** the item's `source` updates to `'user_entry'` (for template items, tracking that the user has overridden the brand default), **and** the dashboard metrics update within 2 seconds (NFR1).

6. **Given** I have edited a template line item's amount, **when** I click the reset action on that item, **then** the amount reverts to the brand default value, the `source` reverts to `'brand_default'`, and the dashboard metrics update accordingly.

7. **Given** a startup cost line item is classified as CapEx, **when** the financial engine computes projections, **then** the item's amount is depreciated according to the engine's straight-line depreciation schedule over `depreciationYears`.

8. **Given** a startup cost line item is classified as Non-CapEx, **when** the financial engine computes projections, **then** the item's amount is expensed in Year 1 (spread evenly over 12 months).

9. **Given** the plan's startup costs are modified (add, remove, edit, reorder), **when** the changes are saved, **then** the `plans.startup_costs` JSONB column is updated via the existing plan update mechanism, **and** the financial engine recomputes projections with the updated startup cost data.

10. **Given** I have a mix of template and custom items, **when** I view the startup cost total, **then** I see the total startup investment amount, broken down by CapEx total, Non-CapEx total, and Working Capital total.

## Dev Notes

### Architecture Patterns to Follow

**Enhanced StartupCostLineItem Interface (shared/financial-engine.ts):**

The current `StartupCostLineItem` interface needs to be extended to support the full startup cost builder feature. The enhanced interface must support custom items, brand default tracking, Item 7 ranges, ordering, and per-item source attribution:

```typescript
export interface StartupCostLineItem {
  id: string;                                        // Unique ID (UUID) for drag-and-drop and keying
  name: string;                                      // Item name (editable for custom items)
  amount: number;                                    // Current amount in cents
  capexClassification: "capex" | "non_capex" | "working_capital";
  isCustom: boolean;                                 // true = user-added, false = from brand template
  source: "brand_default" | "user_entry";            // Tracks whether user has overridden amount
  brandDefaultAmount: number | null;                 // Original brand default in cents (null for custom items)
  item7RangeLow: number | null;                      // FDD Item 7 low range in cents (null for custom items)
  item7RangeHigh: number | null;                     // FDD Item 7 high range in cents (null for custom items)
  sortOrder: number;                                 // Display order (0-based)
}
```

The financial engine's `calculateProjections()` function currently reads `name`, `amount`, and `capexClassification` from startup cost line items. The new fields (`id`, `isCustom`, `source`, `brandDefaultAmount`, `item7RangeLow`, `item7RangeHigh`, `sortOrder`) are metadata for the UI and persistence layer — the engine does not need modification for computation. However, the interface must be updated in `financial-engine.ts` since it is the single source of truth for this type.

**Updated buildPlanStartupCosts() (shared/plan-initialization.ts):**

The existing `buildPlanStartupCosts()` must be updated to populate the new fields:

```typescript
export function buildPlanStartupCosts(template: StartupCostTemplate): StartupCostLineItem[] {
  return template.map((item, index) => ({
    id: crypto.randomUUID(),                          // Generate unique ID
    name: item.name,
    amount: dollarsToCents(item.default_amount),
    capexClassification: item.capex_classification,
    isCustom: false,
    source: 'brand_default' as const,
    brandDefaultAmount: dollarsToCents(item.default_amount),
    item7RangeLow: item.item7_range_low !== null ? dollarsToCents(item.item7_range_low) : null,
    item7RangeHigh: item.item7_range_high !== null ? dollarsToCents(item.item7_range_high) : null,
    sortOrder: item.sort_order ?? index,
  }));
}
```

**New Startup Cost Helper Functions (shared/plan-initialization.ts):**

Add pure helper functions for startup cost operations:

- `addCustomStartupCost(costs: StartupCostLineItem[], name: string, amount: number, classification: CapexClassification): StartupCostLineItem[]` — appends a new custom item with generated UUID, `isCustom: true`, `source: 'user_entry'`, null brand default and Item 7 fields.
- `removeStartupCost(costs: StartupCostLineItem[], id: string): StartupCostLineItem[]` — removes by ID; must only remove items where `isCustom === true`. Returns unchanged array if item is a template item.
- `updateStartupCostAmount(costs: StartupCostLineItem[], id: string, newAmount: number): StartupCostLineItem[]` — updates amount and sets `source: 'user_entry'`.
- `resetStartupCostToDefault(costs: StartupCostLineItem[], id: string): StartupCostLineItem[]` — for template items only; reverts `amount` to `brandDefaultAmount`, sets `source` to `'brand_default'`.
- `reorderStartupCosts(costs: StartupCostLineItem[], orderedIds: string[]): StartupCostLineItem[]` — reorders based on provided ID sequence, updates `sortOrder` values.
- `getStartupCostTotals(costs: StartupCostLineItem[]): { capexTotal: number; nonCapexTotal: number; workingCapitalTotal: number; grandTotal: number }` — computes category totals.

All functions are pure (return new arrays, don't mutate) and live in `shared/plan-initialization.ts` for reuse on both client and server.

**API Endpoints (server/routes/financial-engine.ts):**

The architecture specifies dedicated startup cost endpoints:

- `GET /api/plans/:planId/startup-costs` — returns the plan's startup cost line items sorted by `sortOrder`
- `PUT /api/plans/:planId/startup-costs` — bulk replaces the startup cost array (the client sends the full updated array after add/remove/edit/reorder operations)
- `POST /api/plans/:planId/startup-costs/reset` — resets all template items to brand defaults, removes all custom items

These routes must enforce `requireAuth` and ownership checks (franchisee can only modify their own plan's costs). The PUT endpoint accepts `StartupCostLineItem[]`, validates with Zod, and updates `plans.startup_costs` JSONB.

**Zod Validation Schema (shared/schema.ts):**

Add a Zod schema for the enhanced `StartupCostLineItem` to validate API input:

```typescript
export const planStartupCostLineItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  amount: z.number().int().min(0),            // cents
  capexClassification: z.enum(["capex", "non_capex", "working_capital"]),
  isCustom: z.boolean(),
  source: z.enum(["brand_default", "user_entry"]),
  brandDefaultAmount: z.number().int().min(0).nullable(),
  item7RangeLow: z.number().int().min(0).nullable(),
  item7RangeHigh: z.number().int().min(0).nullable(),
  sortOrder: z.number().int().min(0),
});

export const planStartupCostsSchema = z.array(planStartupCostLineItemSchema);
```

**IStorage additions (server/storage.ts):**

- `getStartupCosts(planId: string): Promise<StartupCostLineItem[]>` — reads `plans.startup_costs` JSONB, returns sorted by `sortOrder`
- `updateStartupCosts(planId: string, costs: StartupCostLineItem[]): Promise<StartupCostLineItem[]>` — writes to `plans.startup_costs` JSONB, returns the saved array
- `resetStartupCostsToDefaults(planId: string, brandId: string): Promise<StartupCostLineItem[]>` — loads the brand's startup cost template, calls `buildPlanStartupCosts()`, saves to plan, returns result

All storage methods must accept user context for RBAC scoping (franchisee can only access their own plan).

**Database Schema:**

No schema migration needed. Startup costs continue to be stored as JSONB on the `plans` table (`plans.startup_costs` column, already typed as `StartupCostLineItem[]`). The JSONB column type annotation should be updated to reflect the enhanced interface.

**Number Format Rules (critical):**

| Type | Storage | Example | Display |
|------|---------|---------|---------|
| Currency amounts | Cents as integers | `15000` = $150.00 | `$150.00` |
| Item 7 ranges | Cents as integers | `5000000` = $50,000.00 | `$50,000` |
| Sort order | Zero-based integers | `0`, `1`, `2` | N/A |

Currency formatting happens exclusively in the UI layer.

**Naming Conventions:**
- API endpoint: `/api/plans/:planId/startup-costs` (kebab-case)
- Component: `StartupCostBuilder` (PascalCase)
- File: `startup-cost-builder.tsx` (kebab-case)
- JSONB keys: camelCase (`brandDefaultAmount`, `capexClassification`, `sortOrder`)

### UI/UX Deliverables

**Startup Cost Builder Component (`<StartupCostBuilder />`):**

Per the architecture (Decision 9), `<StartupCostBuilder />` lives in the Detail Panel (right side of the split view) and is shared across all experience tiers. It is part of `client/src/components/shared/`.

**Layout:**
- A card/section within the Detail Panel showing all startup cost line items
- Section header: "Startup Costs" with total investment amount displayed prominently
- Category subtotals row: CapEx Total | Non-CapEx Total | Working Capital Total
- "Add Custom Item" button at the bottom of the list

**Line Item Row:**
Each row displays:
- Drag handle (for reorder) or move up/down buttons
- Item name (read-only for template items, editable for custom items)
- My Estimate field (editable currency input, auto-formatted with $ and commas)
- Brand Default column (shown for template items, "—" for custom items)
- FDD Item 7 Range column (e.g., "$30,000 – $60,000" for template items, "—" for custom items)
- CapEx/Non-CapEx badge
- Action buttons: Reset to default (template items only, shown when user has overridden), Remove (custom items only)

**UI States:**
- **Default state:** Template items listed in configured order with brand defaults as current values
- **Edited state:** When a template item's amount differs from brand default, the row shows a subtle indicator and the reset action becomes visible
- **Custom item state:** Custom items show an "X" remove button and editable name field
- **Empty state:** If somehow no startup costs exist, show "No startup costs configured for this brand. Add a custom item to get started."
- **Loading state:** Skeleton rows while plan data loads
- **Error state:** Inline error message if save fails with retry prompt

**Interaction Patterns:**
- Inline editing: click/focus on the amount cell to edit directly (no modal)
- Auto-save: changes trigger the debounced auto-save mechanism (existing pattern from Story 4.5, but for this story the PUT endpoint handles explicit save)
- Drag-and-drop reorder: uses HTML drag-and-drop or a lightweight library (consider `@dnd-kit/core` if available, otherwise use move up/down buttons)
- "Add Custom Item" opens an inline form row (not a modal) at the bottom of the list
- Currency input auto-formats: user types "45000" and sees "$45,000"

**Emotional Design (from UX spec):**
- The Startup Cost Builder maps to Sam's "Surprised capability" emotional stage — progressive revelation of cost categories builds competence
- Item 7 ranges provide guardrails without judgment (advisory, never blocking)
- "Reset to default" removes fear of experimentation
- Advisory tone: never use red/error styling for user estimates outside FDD ranges — use "Gurple" (#A9A2AA) for advisory indicators

**Navigation:**
- Accessed as a section within the planning workspace detail panel
- In Forms mode: appears as a collapsible "Startup Costs" section
- In Quick Entry mode: startup costs appear as a category group in the grid
- In Planning Assistant mode: the AI can guide the user through startup cost review, with values updating in the Startup Cost Builder on the right panel

### Anti-Patterns & Hard Constraints

- **DO NOT** create a separate `plan_startup_costs` database table — continue using the `plans.startup_costs` JSONB column. The architecture doc mentions a separate table, but Stories 3.1 and 3.2 established the JSONB pattern and it is appropriate for this data (always read/written as a unit with the plan, variable items per brand).
- **DO NOT** modify `shared/financial-engine.ts` computation logic (the `calculateProjections` function body) — the engine already correctly handles CapEx depreciation and Non-CapEx expensing. Only the `StartupCostLineItem` interface definition needs updating with additional metadata fields.
- **DO NOT** create `shared/types.ts` — all financial interfaces stay in `shared/financial-engine.ts`
- **DO NOT** split the Drizzle schema across multiple files — `shared/schema.ts` only
- **DO NOT** use floating-point for currency storage — amounts are cents (integers). `amount: 150.00` is WRONG, `amount: 15000` is correct
- **DO NOT** modify `vite.config.ts`, `drizzle.config.ts`, or `package.json` scripts
- **DO NOT** modify files in `client/src/components/ui/` (Shadcn-managed)
- **DO NOT** allow removal of template items — only custom items (`isCustom: true`) can be removed
- **DO NOT** use `snake_case` inside JSONB content — use `camelCase` (consumed by TypeScript)
- **DO NOT** use red/error styling for estimates outside FDD ranges — use the "Gurple" (#A9A2AA) advisory color pattern
- **DO NOT** use `Date.now()` or `Math.random()` inside the financial engine — for ID generation in helper functions use `crypto.randomUUID()` which is a Node.js built-in (not in the engine itself)
- **DO NOT** duplicate the startup cost total calculation in the frontend — use the `getStartupCostTotals()` shared helper

### Gotchas & Integration Warnings

- **Interface extension must be backward-compatible:** The existing `buildPlanStartupCosts()` and `unwrapForEngine()` functions in `shared/plan-initialization.ts` currently produce `StartupCostLineItem` objects with only `name`, `amount`, and `capexClassification`. After extending the interface, these functions must be updated to populate the new fields. Existing engine tests must continue to pass since `calculateProjections()` only reads `name`, `amount`, and `capexClassification`.
- **Existing plan data migration:** Plans created before this story have `startup_costs` JSONB with the old 3-field format (no `id`, `isCustom`, `source`, etc.). The API and UI must handle plans that have the old format gracefully — either migrate on first read or treat missing fields with sensible defaults (`id: generated`, `isCustom: false`, `source: 'brand_default'`, etc.).
- **Brand parameter amounts are in dollars, plan amounts are in cents:** The `buildPlanStartupCosts()` function handles this conversion via `dollarsToCents()`. Custom items entered by the user via the UI are entered in dollars and must be converted to cents before storage.
- **Item 7 ranges from the brand template use `item7_range_low` / `item7_range_high` (snake_case in the template Zod schema).** These must be mapped to `item7RangeLow` / `item7RangeHigh` (camelCase) in the `StartupCostLineItem` and converted from dollars to cents.
- **`crypto.randomUUID()` availability:** Use `crypto.randomUUID()` for ID generation in the shared module. This is available in Node.js 19+ and modern browsers. If running in an older environment, fall back to a simple UUID generator or use the `uuid` package (already available if previously installed).
- **Working Capital classification:** The current engine supports `"working_capital"` as a third classification beyond CapEx and Non-CapEx. Working capital items are included in the total startup investment but are not depreciated and not expensed as operating costs — they fund the cash reserve. The "Add Custom Item" form should expose all three classification options.
- **Sort order must be contiguous:** After any add/remove/reorder operation, `sortOrder` values should be re-normalized (0, 1, 2, ...) to prevent gaps that could cause ordering issues.
- **Existing test files:** `shared/financial-engine.test.ts` (33 tests) and `shared/plan-initialization.test.ts` (66 tests) must continue to pass. New tests should be added for the enhanced startup cost helper functions.
- **PUT vs PATCH for startup costs:** The architecture specifies `PUT /api/plans/:planId/startup-costs` (full replacement) rather than PATCH (partial update). The client should always send the complete startup cost array. This simplifies conflict resolution — last write wins at the array level.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `shared/financial-engine.ts` | MODIFY | Extend `StartupCostLineItem` interface with new metadata fields (id, isCustom, source, brandDefaultAmount, item7RangeLow, item7RangeHigh, sortOrder) |
| `shared/plan-initialization.ts` | MODIFY | Update `buildPlanStartupCosts()` to populate new fields; add startup cost helper functions (add, remove, update, reset, reorder, totals) |
| `shared/plan-initialization.test.ts` | MODIFY | Add tests for new startup cost helper functions and updated buildPlanStartupCosts |
| `shared/schema.ts` | MODIFY | Add `planStartupCostLineItemSchema` and `planStartupCostsSchema` Zod validators |
| `server/storage.ts` | MODIFY | Add `getStartupCosts()`, `updateStartupCosts()`, `resetStartupCostsToDefaults()` to IStorage interface and DatabaseStorage |
| `server/routes/financial-engine.ts` | MODIFY | Add startup cost API endpoints: GET, PUT, POST reset |
| `client/src/components/shared/startup-cost-builder.tsx` | CREATE | Startup Cost Builder component — line item list, add/remove/edit/reorder/reset UI |
| `client/src/hooks/use-startup-costs.ts` | CREATE | Custom hook wrapping TanStack Query for startup cost data fetching and mutations |
| `client/src/lib/format-currency.ts` | CREATE | Currency formatting utility (cents → display string) if not already present |

### Dependencies & Environment Variables

**Packages already installed (DO NOT reinstall):**
- `drizzle-orm`, `drizzle-zod`, `zod` — schema and validation
- `@neondatabase/serverless` — PostgreSQL driver
- `react`, `react-dom` — UI framework
- `@tanstack/react-query` — server state management
- `react-hook-form`, `@hookform/resolvers` — form handling
- `lucide-react` — icons (for drag handle, remove, reset icons)
- `class-variance-authority`, `clsx`, `tailwind-merge` — styling utilities

**Potentially needed packages:**
- `@dnd-kit/core` + `@dnd-kit/sortable` — for drag-and-drop reorder (evaluate if the interaction complexity warrants a library, or use simpler move-up/move-down buttons for MVP)

**No new environment variables needed.**

**No database migration needed.** JSONB type annotations are TypeScript-only.

### References

- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Decision 9 (Component Architecture: StartupCostBuilder in Detail Panel), Decision 5 (API Design: /api/plans/:id/startup-costs endpoints), Decision 15 (Engine Design: startup cost aggregation), Startup Cost Builder as Subsystem section, Naming Patterns, Number Format Rules, Schema Patterns
- Epics: `_bmad-output/planning-artifacts/epics.md` — Epic 3 overview, Story 3.3 AC, FR4/FR5/FR6
- UX Design: `_bmad-output/planning-artifacts/ux-design-specification.md` — Sam's emotional arc (Startup Cost Builder stage), metadata-on-demand pattern, advisory tone guidelines, "Gurple" color for advisory indicators
- Story 3.1: `_bmad-output/implementation-artifacts/3-1-financial-engine-core-plan-schema.md` — Engine calculation graph (startup cost aggregation, CapEx depreciation, Non-CapEx expensing), StartupCostLineItem interface, Number Format Rules, plans table structure
- Story 3.2: `_bmad-output/implementation-artifacts/3-2-brand-default-integration-per-field-metadata.md` — buildPlanStartupCosts() function, unwrapForEngine() function, dollar-to-cents conversion pattern, PlanFinancialInputs structure
- Existing code: `shared/financial-engine.ts` (lines 129-133: current StartupCostLineItem), `shared/plan-initialization.ts` (lines 122-130: current buildPlanStartupCosts), `shared/schema.ts` (lines 45-59: StartupCostItem and StartupCostTemplate schemas)

## Dev Agent Record

### Agent Model Used

### Completion Notes

### File List
