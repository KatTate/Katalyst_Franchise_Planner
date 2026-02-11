# Story 3.5: Financial Input API & Per-Field Reset

Status: dev-complete

## Story

As a franchisee,
I want to edit individual financial inputs and reset them to brand defaults,
so that I can experiment freely without fear of losing the starting point (FR2, FR3).

## Acceptance Criteria

1. **Given** I am viewing my plan's financial inputs, **when** I edit a field value and leave the field, **then** the field saves with my new value, a "Your Entry" source badge replaces the previous "Brand Default" badge, and the `last_modified_at` timestamp updates — confirming my change was captured.

2. **Given** I have edited one or more financial input fields, **when** I click the reset button on a specific field, **then** the field's value reverts to the brand default in a single click, the source badge changes back to "Brand Default", and I do not need to confirm — the reset is immediate and non-destructive (the field can always be edited again).

3. **Given** I am viewing my plan, **when** the financial inputs page loads, **then** I see all financial input fields grouped by category (Revenue, Operating Costs, Financing, Startup Capital) with their current values, source attribution badges ("Brand Default" / "Your Entry"), and formatted appropriately — currency with $ and commas, percentages with %, integers for months/years.

4. **Given** I edit or reset a financial input, **when** the change is saved, **then** the summary metrics (total startup investment, projected annual revenue, ROI, break-even month) update to reflect my changes within 2 seconds (NFR1). _Note: In this story, metrics update is verified via query invalidation of `planOutputsKey`. End-to-end visual verification (input + metrics on the same screen) becomes testable in Story 4.1 when both components are co-rendered in the planning workspace._

5. **Given** I am viewing any financial input field, **then** the brand default value is always visible as muted secondary text (e.g., "Default: $25,000"). **When** I focus on the field, **then** an expanded metadata panel appears showing source attribution and last-modified timestamp. On blur, the expanded panel recedes back to the compact default-value-only display — providing full context on demand while keeping the interface clean at rest.

6. **Given** my plan has financial inputs with a mix of brand defaults and my custom entries, **when** I navigate away and return to the financial inputs page, **then** all my edits are preserved — every field shows its last-saved value and correct source badge.

7. **Given** my plan has financial inputs, **when** the complete plan data loads, **then** every financial input field includes its metadata: current value, source (`brand_default` or `user_entry`), original brand default value, and last-modified timestamp — enabling the UI to render source badges and reset affordances correctly.

## Dev Notes

### Architecture Patterns to Follow

**API Endpoints (server/routes/plans.ts):**

Two new endpoints on the existing plans router:

- `GET /api/plans/:planId` — Returns the complete plan object including `financialInputs` (PlanFinancialInputs JSONB with per-field metadata) and all plan columns. Enforces `requireAuth` + plan ownership via existing `requirePlanAccess()`. Returns `{ data: Plan }`.

- `PATCH /api/plans/:planId` — Accepts partial plan updates using `updatePlanSchema` (the existing `.partial()` schema from `shared/schema.ts`). The primary use case is updating `financialInputs` after field edits or resets. The client sends the **complete** `financialInputs` object (with the field change applied client-side using `updateFieldValue()` or `resetFieldToDefault()` from `shared/plan-initialization.ts`). The server replaces the `financial_inputs` JSONB column — this is consistent with the startup costs pattern (full replacement, not deep merge). Sets `updatedAt` automatically via the existing `storage.updatePlan()` method. Returns `{ data: Plan }`.

**PATCH Validation — PlanFinancialInputs Zod Schema (shared/schema.ts):**

Add a Zod validation schema for `PlanFinancialInputs` to validate the JSONB structure at the API boundary (this was identified as Story 3.5 scope in the Story 3.1 code review — OS-2). The schema validates the nested structure of `FinancialFieldValue` wrappers:

```typescript
export const financialFieldValueSchema = z.object({
  currentValue: z.number(),
  source: z.enum(["brand_default", "user_entry", "ai_populated"]),
  brandDefault: z.number().nullable(),
  item7Range: z.object({ min: z.number(), max: z.number() }).nullable(),
  lastModifiedAt: z.string().nullable(),
  isCustom: z.boolean(),
});

export const planFinancialInputsSchema = z.object({
  revenue: z.object({
    monthlyAuv: financialFieldValueSchema,
    year1GrowthRate: financialFieldValueSchema,
    year2GrowthRate: financialFieldValueSchema,
    startingMonthAuvPct: financialFieldValueSchema,
  }),
  operatingCosts: z.object({
    cogsPct: financialFieldValueSchema,
    laborPct: financialFieldValueSchema,
    rentMonthly: financialFieldValueSchema,
    utilitiesMonthly: financialFieldValueSchema,
    insuranceMonthly: financialFieldValueSchema,
    marketingPct: financialFieldValueSchema,
    royaltyPct: financialFieldValueSchema,
    adFundPct: financialFieldValueSchema,
    otherMonthly: financialFieldValueSchema,
  }),
  financing: z.object({
    loanAmount: financialFieldValueSchema,
    interestRate: financialFieldValueSchema,
    loanTermMonths: financialFieldValueSchema,
    downPaymentPct: financialFieldValueSchema,
  }),
  startupCapital: z.object({
    workingCapitalMonths: financialFieldValueSchema,
    depreciationYears: financialFieldValueSchema,
  }),
});
```

**PATCH validation sequence (two-stage):**

1. **Stage 1 — Top-level schema:** Parse `req.body` with `updatePlanSchema` to validate top-level plan fields (name, status, etc.). This rejects unknown fields and validates scalar types. Since `financialInputs` is typed as `unknown`/`any` in the Drizzle-generated schema, it passes through without nested validation.
2. **Stage 2 — Financial inputs deep validation:** If `parsedBody.financialInputs` is present, validate it separately with `planFinancialInputsSchema.parse(parsedBody.financialInputs)`. If validation fails, return 400 with the Zod error details. If it passes, use the validated data for the storage update.
3. **Persist:** Call `storage.updatePlan(planId, validatedData)` with only the validated fields.

**Client-Side Edit Flow:**

The client owns the field update logic using pure functions from `shared/plan-initialization.ts`:

1. Load plan via `usePlan(planId)` hook (query key: `` [`/api/plans/${planId}`] ``) → has full `PlanFinancialInputs`
2. User edits a field → call `updateFieldValue(field, newValue, new Date().toISOString())`
3. Build updated `PlanFinancialInputs` with the changed field
4. Call PATCH mutation with `{ financialInputs: updatedInputs }`
5. On success, invalidate `planOutputsKey(planId)` to refresh summary metrics

For reset:
1. User clicks reset on a field → call `resetFieldToDefault(field, new Date().toISOString())`
2. Build updated `PlanFinancialInputs` with the reset field
3. Call PATCH mutation with `{ financialInputs: updatedInputs }`
4. On success, invalidate outputs to refresh metrics

**State Management Pattern (Client-Side):**

Follow TanStack React Query patterns established in Stories 3.3–3.4:

- Query key: `` [`/api/plans/${planId}`] `` — single-element template literal, consistent with `use-plan-outputs.ts` and `use-startup-costs.ts`. Export a `planKey(planId)` factory function for reuse.
- The hook `usePlan` fetches `GET /api/plans/:planId` and provides an `updatePlan` mutation for PATCH (use `apiRequest("PATCH", ...)` from `client/src/lib/queryClient.ts`, matching the `useStartupCosts` mutation pattern)
- After a successful PATCH that includes `financialInputs`, invalidate `planOutputsKey(planId)` from `use-plan-outputs.ts` so summary metrics refresh
- Use optimistic UI: apply field changes to the local cache immediately via `queryClient.setQueryData`, reconcile on server response
- Save on blur (when user leaves the field) — consistent with startup cost editing pattern from Story 3.3

**Component Naming:**
- Hook: `usePlan` → file: `use-plan.ts`
- Component: `FinancialInputEditor` → file: `financial-input-editor.tsx`
- Dev page: `InputsDevPage` → file: `inputs-dev.tsx`

**Number Format Rules (from architecture):**

| Type | Storage (JSONB) | Example | Display |
|------|----------------|---------|---------|
| Currency amounts | Cents as integers | `2500000` = $25,000 | `$25,000` |
| Percentages/rates | Decimal form | `0.065` = 6.5% | `6.5%` |
| Months/years | Plain integers | `120` = 120 months | `120` |

Currency formatting uses the existing `formatCents()` utility from `client/src/lib/format-currency.ts`. Percentage formatting multiplies by 100 for display (e.g., `0.065` → `6.5%`).

**Field Metadata Mapping (labels and types):**

Use a constant mapping object (e.g., `FIELD_METADATA` in `financial-input-editor.tsx`) rather than algorithmic camelCase-to-title conversion, since abbreviations (AUV, COGS) and suffixes (Pct → %) need explicit labels:

| Field Key | Label | Format Type |
|-----------|-------|-------------|
| `revenue.monthlyAuv` | Monthly AUV | currency |
| `revenue.year1GrowthRate` | Year 1 Growth Rate | percentage |
| `revenue.year2GrowthRate` | Year 2 Growth Rate | percentage |
| `revenue.startingMonthAuvPct` | Starting Month AUV % | percentage |
| `operatingCosts.cogsPct` | COGS % | percentage |
| `operatingCosts.laborPct` | Labor % | percentage |
| `operatingCosts.rentMonthly` | Rent (Monthly) | currency |
| `operatingCosts.utilitiesMonthly` | Utilities (Monthly) | currency |
| `operatingCosts.insuranceMonthly` | Insurance (Monthly) | currency |
| `operatingCosts.marketingPct` | Marketing % | percentage |
| `operatingCosts.royaltyPct` | Royalty % | percentage |
| `operatingCosts.adFundPct` | Ad Fund % | percentage |
| `operatingCosts.otherMonthly` | Other (Monthly) | currency |
| `financing.loanAmount` | Loan Amount | currency |
| `financing.interestRate` | Interest Rate | percentage |
| `financing.loanTermMonths` | Loan Term (Months) | integer |
| `financing.downPaymentPct` | Down Payment % | percentage |
| `startupCapital.workingCapitalMonths` | Working Capital (Months) | integer |
| `startupCapital.depreciationYears` | Depreciation (Years) | integer |

Format type determines input behavior:
- **currency**: Display via `formatCents()`, input accepts dollar amounts, store as cents (`value * 100`)
- **percentage**: Display as `value * 100` with `%` suffix, input accepts percentage, store as decimal (`input / 100`)
- **integer**: Display and store as-is, input accepts whole numbers only

### UI/UX Deliverables

**Financial Input Editor Component (`<FinancialInputEditor />`):**

A temporary dev component (same pattern as `<StartupCostBuilder />` and `<SummaryMetrics />`) that will be integrated into the planning workspace Detail Panel in Story 4.1. Lives in `client/src/components/shared/`.

**Layout — Categorized Field Groups:**

Four collapsible sections matching the `PlanFinancialInputs` structure:

1. **Revenue** — Monthly AUV, Year 1 Growth Rate, Year 2 Growth Rate, Starting Month AUV %
2. **Operating Costs** — COGS %, Labor %, Rent (monthly), Utilities (monthly), Insurance (monthly), Marketing %, Royalty %, Ad Fund %, Other (monthly)
3. **Financing** — Loan Amount, Interest Rate, Loan Term (months), Down Payment %
4. **Startup Capital** — Working Capital Months, Depreciation Years

Each field row displays:
- Field label (human-readable name derived from the camelCase key, e.g., `monthlyAuv` → "Monthly AUV")
- Editable value input (type-aware: currency fields show $ formatting, percentage fields show %, integer fields accept whole numbers)
- Source badge: "Brand Default" (muted style) or "Your Entry" (accent style)
- Reset button: visible only when `source === 'user_entry'` — a subtle icon button (e.g., `RotateCcw` from lucide-react, `aria-label="Reset to brand default"`) that resets to brand default on click
- Brand default reference value: **always visible** as muted secondary text below/beside the input (e.g., "Default: $25,000") so users can scan and compare without clicking into each field. On field focus, the metadata panel expands to also show the source badge more prominently and the `lastModifiedAt` timestamp if present. On blur, the expanded metadata recedes back to the compact default-value-only display.

**Test IDs (`data-testid` attributes):**
- `section-{category}` — category section container (e.g., `section-revenue`, `section-operatingCosts`)
- `field-input-{fieldName}` — editable input for each field (e.g., `field-input-monthlyAuv`, `field-input-cogsPct`)
- `badge-source-{fieldName}` — source attribution badge (e.g., `badge-source-monthlyAuv`)
- `button-reset-{fieldName}` — per-field reset button (e.g., `button-reset-monthlyAuv`)
- `field-default-{fieldName}` — brand default reference value display
- `status-saving` — saving indicator
- `status-error` — error message container
- `status-no-inputs` — empty state for null financialInputs

**UI States:**
- **Loading state:** Skeleton rows while plan data loads
- **Default state:** All fields showing brand default values with "Brand Default" badges
- **Edited state:** Changed fields show "Your Entry" badge and a reset button appears
- **Saving state:** Subtle indicator during PATCH (opacity reduction or spinner on the saving field)
- **Error state:** Inline error message if save fails, with retry option
- **No inputs state:** If `financialInputs` is null, show "Plan not initialized — financial inputs will be available after plan setup."

**Interaction Patterns:**
- Inline editing: click/focus on a value to edit directly
- Save on blur: when the user leaves a field, if the value changed, trigger PATCH
- Reset on click: single click on reset icon immediately reverts field and triggers PATCH
- Currency input: user types "25000" and sees "$25,000" (use `formatCents` / `parseDollarsToCents` from `client/src/lib/format-currency.ts`)
- Percentage input: user types "6.5" and the value is stored as `0.065`
- After save, summary metrics refresh automatically via query invalidation

**Navigation:**
- Mount on temporary dev route: `/plans/:planId/inputs` (same pattern as `/plans/:planId/startup-costs` and `/plans/:planId/metrics`)
- Component accepts `planId` as a prop and manages its own data fetching via the `usePlan` hook
- Integration into the Detail Panel layout happens in Story 4.1

### Anti-Patterns & Hard Constraints

- **DO NOT** implement deep-merge PATCH for `financialInputs` — the client sends the complete `PlanFinancialInputs` object with changes applied locally, and the server replaces the entire JSONB column. This matches the startup costs pattern and avoids complex merge logic. _Clarification on epic AC wording: the epic says "only changed fields are updated (partial update)" — this refers to the plan-level PATCH (only `financialInputs` is sent, not `name`, `status`, etc.), NOT field-level deep-merging within the JSONB. The JSONB column itself is replaced wholesale._
- **DO NOT** modify `shared/financial-engine.ts` — the engine and its interfaces are complete. This story wires editing and reset through the API layer.
- **DO NOT** modify `shared/plan-initialization.ts` — the `updateFieldValue()` and `resetFieldToDefault()` functions are already implemented and tested (Story 3.2). Use them as-is.
- **DO NOT** modify `server/services/financial-service.ts` — the engine orchestration is complete from Story 3.4.
- **DO NOT** put field update business logic in route handlers — the shared pure functions handle field updates; the route handler only validates and persists.
- **DO NOT** create `shared/types.ts` — all financial interfaces live in `shared/financial-engine.ts` per architecture.
- **DO NOT** split the Drizzle schema across multiple files — `shared/schema.ts` only.
- **DO NOT** use floating-point for currency display — format from cents using `formatCents()`.
- **DO NOT** modify `vite.config.ts`, `drizzle.config.ts`, or files in `client/src/components/ui/`.
- **DO NOT** add new database tables or columns — this story uses the existing `plans.financial_inputs` JSONB column.
- **DO NOT** cache or store computed outputs — engine outputs are computed fresh per request via the existing `GET /api/plans/:planId/outputs` endpoint (Story 3.4).
- **DO NOT** use red/error styling for values outside expected ranges — use the "Gurple" (#A9A2AA) advisory color per UX spec.
- **DO NOT** build the full Forms mode or Quick Entry mode UI — those are Epic 4 stories. This story builds a minimal but functional field editor for API verification and testing, which will be replaced/integrated in Epic 4.

### Gotchas & Integration Warnings

- **`updateFieldValue()` and `resetFieldToDefault()` are already tested:** 66 tests in `shared/plan-initialization.test.ts` cover these functions. Do not reimplement — import and use them directly on the client side. They are pure functions that work identically in browser and Node.js.

- **`financialInputs` can be null:** A newly created plan may have `financialInputs: null` (the column is nullable in the schema). The GET endpoint should return the plan as-is (null inputs included). The PATCH endpoint should accept `financialInputs` being set for the first time. The UI should handle null gracefully with an appropriate empty state.

- **Currency values are in cents, user enters in dollars:** The field editor must convert user input (dollars) to cents for storage and cents to dollars for display. Use `formatCents()` for display and `parseDollarsToCents()` from `client/src/lib/format-currency.ts` for input conversion.

- **Percentage values are decimals, user enters as percentages:** The user types "6.5" meaning 6.5%, but the stored value is `0.065`. The editor must multiply by 100 for display and divide by 100 for storage.

- **Output invalidation cascade:** After any successful PATCH that changes `financialInputs`, invalidate `planOutputsKey(planId)` so the `<SummaryMetrics />` component (from Story 3.4) refreshes. Import `planOutputsKey` from `client/src/hooks/use-plan-outputs.ts`.

- **Startup costs also affect outputs:** Startup cost changes (via `useStartupCosts` hook) already need output invalidation. The `usePlan` hook should similarly invalidate outputs after financial input changes. This ensures consistent metrics regardless of which input type changed.

- **The existing `requirePlanAccess()` helper returns `Plan | null`:** It already handles 404 and 403 responses. The new GET and PATCH endpoints should use this helper — no need to duplicate ownership checks.

- **`updatePlanSchema` is `.partial()` of `insertPlanSchema`:** This means all plan fields are optional in the PATCH body. The handler should validate `financialInputs` separately using `planFinancialInputsSchema` when it's present in the request body, since the Drizzle-generated schema only knows it's JSONB (no nested structure validation).

- **The `last_auto_save` column exists but is not used yet:** Story 4.5 (Auto-Save & Session Recovery) will implement the auto-save timer. Story 3.5 saves on blur only — no debounced auto-save timer yet. The PATCH endpoint should still set `updatedAt` (which it does via `storage.updatePlan()`).

- **Existing tests must continue passing:** `shared/financial-engine.test.ts` (33+ tests), `shared/plan-initialization.test.ts` (131+ tests), and `server/services/financial-service.test.ts` (9 tests) must all pass after changes.

- **TanStack Query default queryFn joins query keys as URL:** The default `queryFn` in `client/src/lib/queryClient.ts` joins the query key array elements to form the fetch URL. Use single-element template literal key `` [`/api/plans/${planId}`] `` (consistent with existing hooks) so the join produces the correct URL `GET /api/plans/<planId>`.

- **Pre-existing type errors:** There are known pre-existing Drizzle ORM type issues in `server/storage.ts`. Do not attempt to fix these — they are tracked separately.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `shared/schema.ts` | MODIFY | Add `financialFieldValueSchema`, `planFinancialInputsSchema` Zod validators for API boundary validation (Story 3.1 CR OS-2) |
| `server/routes/plans.ts` | MODIFY | Add `GET /:planId` (return complete plan) and `PATCH /:planId` (partial update with financialInputs validation) endpoints |
| `client/src/hooks/use-plan.ts` | CREATE | TanStack Query hook for plan data: GET query + PATCH mutation with output invalidation |
| `client/src/components/shared/financial-input-editor.tsx` | CREATE | Financial input editor: categorized field groups, inline editing, source badges, per-field reset buttons |
| `client/src/pages/inputs-dev.tsx` | CREATE | Temporary dev page for FinancialInputEditor testing (same pattern as startup-costs-dev and metrics-dev) |
| `client/src/App.tsx` | MODIFY | Add `/plans/:planId/inputs` route for temporary dev page |

### Dependencies & Environment Variables

**Packages already installed (DO NOT reinstall):**
- `drizzle-orm`, `drizzle-zod`, `zod` — schema and validation
- `@neondatabase/serverless` — PostgreSQL driver
- `react`, `react-dom` — UI framework
- `@tanstack/react-query` — server state management
- `lucide-react` — icons (for reset icon)
- `class-variance-authority`, `clsx`, `tailwind-merge` — styling utilities

**No new packages needed.**

**No new environment variables needed.**

**No database migration needed.** This story uses the existing `plans.financial_inputs` JSONB column. The Zod schema is TypeScript-only validation at the API boundary.

### References

- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Decision 5 (API Design: PATCH /api/plans/:id for auto-save, GET /api/plans/:id), Decision 6 (Auto-Save Strategy: PATCH with changed fields), Decision 8 (State Management: TanStack React Query, optimistic updates), Decision 15 (Engine Design: pure function, EngineInput/EngineOutput), Per-field metadata pattern (cross-cutting concern #9), Number Format Rules, Structure Patterns (server/services/ for business logic), Communication Patterns (TanStack Query, optimistic updates), Update Schema pattern (`.partial()` for PATCH)
- Epics: `_bmad-output/planning-artifacts/epics.md` — Epic 3 overview, Story 3.5 AC, FR2 (view/edit financial inputs), FR3 (reset to brand default)
- UX Design: `_bmad-output/planning-artifacts/ux-design-specification.md` — Metadata-on-demand pattern (field focus reveals brand default, source, reset affordance), source attribution badges ("Brand Default" / "Your Entry" / "AI-Populated"), per-field reset affordance design, advisory tone (Gurple #A9A2AA, never red), financial value formatting (Roboto Mono), Forms mode field interaction pattern
- PRD: `_bmad-output/planning-artifacts/prd.md` — FR2 (view/edit every financial input), FR3 (reset any individual value to brand default with single action)
- Story 3.1: `_bmad-output/implementation-artifacts/3-1-financial-engine-core-plan-schema.md` — Plans table schema, FinancialFieldValue interface, updatePlanSchema (`.partial()`), OS-2 (Zod validation for financial inputs at API boundary → this story)
- Story 3.2: `_bmad-output/implementation-artifacts/3-2-brand-default-integration-per-field-metadata.md` — PlanFinancialInputs structure, `updateFieldValue()`, `resetFieldToDefault()`, FinancialFieldValue metadata, `unwrapForEngine()`
- Story 3.3: `_bmad-output/implementation-artifacts/3-3-startup-cost-computation-custom-line-items.md` — Plan sub-resource API pattern (requirePlanAccess, Zod validation, PUT with full array), `useStartupCosts` hook pattern, StartupCostBuilder component and dev page pattern, `formatCents`/`parseDollarsToCents` utilities
- Story 3.4: `_bmad-output/implementation-artifacts/3-4-live-summary-metrics-accounting-validation.md` — `computePlanOutputs()` service, GET outputs endpoint, `usePlanOutputs` hook + `planOutputsKey()` for invalidation, SummaryMetrics component, dev page pattern, `requirePlanAccess()` returning Plan object
- Existing code: `shared/plan-initialization.ts` (`updateFieldValue`, `resetFieldToDefault`), `shared/financial-engine.ts` (`PlanFinancialInputs`, `FinancialFieldValue`), `server/routes/plans.ts` (existing endpoints and `requirePlanAccess`), `server/storage.ts` (`updatePlan`, `getPlan`), `client/src/lib/format-currency.ts` (`formatCents`, `parseDollarsToCents`), `client/src/hooks/use-plan-outputs.ts` (`planOutputsKey`, `usePlanOutputs`), `client/src/hooks/use-startup-costs.ts` (hook pattern reference), `client/src/lib/queryClient.ts` (`apiRequest`, default queryFn)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Completion Notes

All 6 files implemented per the story specification:

**Backend:**
- Added `financialFieldValueSchema` and `planFinancialInputsSchema` Zod validators to `shared/schema.ts` for API boundary validation (resolves Story 3.1 OS-2)
- Added `GET /api/plans/:planId` endpoint returning `{ data: Plan }` with `requireAuth` + `requirePlanAccess()`
- Added `PATCH /api/plans/:planId` endpoint with two-stage validation: top-level `updatePlanSchema` then deep `planFinancialInputsSchema` when `financialInputs` present

**Frontend:**
- Created `usePlan` hook with `planKey()` factory, optimistic updates via `queryClient.setQueryData`, PATCH mutation via `apiRequest`, and automatic `planOutputsKey` invalidation on success
- Created `FinancialInputEditor` component with 4 collapsible category sections, inline editing (save-on-blur), source badges ("Brand Default" / "Your Entry"), per-field reset buttons (`RotateCcw`), brand default reference values always visible, expanded metadata on focus, and all `data-testid` attributes per spec
- Created `InputsDevPage` at `/plans/:planId/inputs` route following existing dev page pattern

**Testing note:** Vitest is not installed in the current environment. Existing test files are unmodified; no regressions expected since changes are additive (new schemas, new endpoints, new components). Pre-existing `tsc` type errors (missing `@types/node` and `vite/client`) are unrelated.

### File List

| File | Action |
|------|--------|
| `shared/schema.ts` | MODIFIED — added `financialFieldValueSchema`, `planFinancialInputsSchema` |
| `server/routes/plans.ts` | MODIFIED — added GET and PATCH `/:planId` endpoints |
| `client/src/hooks/use-plan.ts` | CREATED — `usePlan` hook with `planKey()` factory |
| `client/src/components/shared/financial-input-editor.tsx` | CREATED — `FinancialInputEditor` component |
| `client/src/pages/inputs-dev.tsx` | CREATED — `InputsDevPage` dev page |
| `client/src/App.tsx` | MODIFIED — added `/plans/:planId/inputs` route |
