# Story 3.6: Quick ROI — First 90-Second Experience

Status: ready-for-dev

## Story

As a new franchisee (Sam),
I want to enter just 5 key numbers and immediately see a preliminary ROI range,
so that I feel engaged and hopeful within 90 seconds of starting — the conversion hook that keeps me planning.

## Acceptance Criteria

1. **Given** I have just completed onboarding (or skipped it) and created my first plan, **when** I land on the planning workspace for the first time, **then** a focused "Quick Start" overlay appears within the planning workspace, presenting 5 high-impact input fields: expected monthly revenue, estimated monthly rent, initial investment budget, number of staff, and target market population — each with a clear, jargon-free label (e.g., "How much do you expect to bring in each month?").

2. **Given** the Quick Start overlay is displayed, **when** I view the 5 input fields, **then** all fields are pre-filled with brand defaults (monthly revenue from Monthly AUV, rent from brand rent default, investment budget from computed startup cost total, staff count from a brand-derived estimate, and target market population from a reasonable default) so I can accept or adjust each one.

3. **Given** I am interacting with the Quick Start, **when** I change any of the 5 input values, **then** the ROI percentage and break-even month metrics visible on the Quick Start summary card update in real time (within 2 seconds per NFR1) reflecting my new inputs — I see the financial impact of each change immediately.

4. **Given** I have entered or accepted values for the 5 Quick Start inputs, **when** I view the summary card, **then** I see a clear result: "Based on your inputs, your estimated ROI is X% with break-even at month Y" — with a contextual sentiment frame positioning my result within the brand's typical range (e.g., "Typical [Brand] returns range from 8–25%. Your estimate of 14% falls in the healthy range.").

5. **Given** the Quick Start is displayed, **when** I click "Dismiss" or "Skip to Full Planning", **then** the Quick Start overlay closes and I see the full planning workspace (Forms / Quick Entry / Planning Assistant) with my Quick Start input values preserved in the plan's financial inputs.

6. **Given** I have completed the Quick Start (entered all 5 values and viewed the result), **when** I click "Continue to Full Planning", **then** the Quick Start is marked as completed on this plan, the 5 input values are persisted to the plan's financial inputs, and I see the full planning workspace.

7. **Given** I have previously completed or dismissed the Quick Start for this plan, **when** I return to the planning workspace (navigate away and come back, or log out and log in again), **then** I go directly to the planning workspace — the Quick Start does not re-appear.

8. **Given** I am a returning user who already has a plan with Quick Start completed, **when** I create a second plan for the same brand, **then** the Quick Start appears again for the new plan (it is per-plan, not per-user) since each plan deserves its own initial engagement moment.

## Dev Notes

### Architecture Patterns to Follow

**Quick Start Field Mapping to Financial Engine:**

The Quick Start presents 5 user-friendly fields. Three map directly to existing `PlanFinancialInputs` fields; two are proxy fields that require conversion:

| Quick Start Field | User-Friendly Label | Engine Mapping | Pre-Fill Source |
|---|---|---|---|
| Expected Monthly Revenue | "How much do you expect to bring in each month?" | `revenue.monthlyAuv` (direct — currency in cents) | Brand default `revenue.monthly_auv.value` |
| Estimated Monthly Rent | "What's your estimated monthly rent?" | `operatingCosts.rentMonthly` (direct — currency in cents) | Brand default `operating_costs.rent_monthly.value` |
| Initial Investment Budget | "How much are you planning to invest upfront?" | Total startup investment — update proportionally (see below) | Sum of brand startup cost template default amounts |
| Number of Staff | "How many people do you plan to employ?" | Proxy → computes labor cost as `(count × avgAnnualWage) / (annualRevenue)` → updates `operatingCosts.laborPct` | Derived from brand default labor % and revenue (reverse-engineer a reasonable headcount) |
| Target Market Population | "What's the population of your target market area?" | Plan metadata only — stored on plan record, does not feed engine directly | Reasonable default (e.g., 50,000) or null |

**Investment Budget → Startup Costs Proportional Scaling:**

When the user changes "Initial Investment Budget," the Quick Start applies a proportional scaling factor to all startup cost line items:
- `scaleFactor = newBudget / currentTotal`
- Each startup cost line item's `amount` is updated: `Math.round(item.amount * scaleFactor)`
- Source metadata on each adjusted item updates to `'user_entry'`
- This preserves the relative distribution of costs while letting the user set an overall budget

**Staff Count → Labor Percentage Conversion:**

The "Number of Staff" field is a user-friendly proxy. Conversion approach:
- Assume a configurable average annual wage per employee (could be a brand parameter extension or a system constant, e.g., $35,000/year = 3,500,000 cents/year)
- `laborPct = (staffCount × avgAnnualWageCents) / (monthlyAuvCents × 12)`
- Clamp to `[0.05, 0.60]` (5%–60%) to keep within reasonable bounds
- Update `operatingCosts.laborPct.currentValue` with the computed value
- Store the raw staff count as plan metadata for display on return visits

**Quick Start Completion Tracking:**

Add a `quickStartCompleted` boolean column to the `plans` table (default `false`). This controls whether the Quick Start overlay appears when loading the planning workspace:
- On plan creation: `quickStartCompleted = false`
- On Quick Start completion or dismissal: PATCH plan with `quickStartCompleted = true`
- On plan load: if `quickStartCompleted === true`, skip Quick Start and go directly to planning workspace

**API Patterns:**

No new API endpoints are needed. The Quick Start uses existing infrastructure:

- `GET /api/plans/:planId` — Load plan (check `quickStartCompleted` flag)
- `GET /api/plans/:planId/outputs` — Fetch engine output (ROI metrics) for live-updating display
- `PATCH /api/plans/:planId` — Save Quick Start changes (financial inputs + `quickStartCompleted` flag)
- `PUT /api/plans/:planId/startup-costs` — Save proportionally-scaled startup costs

The Quick Start component performs client-side computation for real-time preview:
1. User changes a Quick Start field
2. Client-side: apply field mapping (update financial inputs locally, scale startup costs if budget changed, convert staff count to labor %)
3. Client-side: call `unwrapForEngine()` + `calculateProjections()` for instant preview (the engine is a shared pure module)
4. Display updated ROI/break-even immediately (optimistic)
5. Debounced PATCH to server persists changes (2s debounce, matching auto-save pattern from architecture)
6. Server-side recalculation via `planOutputsKey` invalidation confirms the preview

**Client-Side Engine Invocation:**

The financial engine (`shared/financial-engine.ts`) is a pure TypeScript module with no I/O dependencies. It can run in the browser. For the Quick Start's real-time preview, import `calculateProjections` and `unwrapForEngine` directly on the client side to compute projections instantly without a server round-trip. This is critical for the "real-time after each value entry" AC — server round-trips would add latency that breaks the 90-second engagement window.

**State Management:**

- Use `usePlan(planId)` for plan data (includes `quickStartCompleted` flag and `financialInputs`)
- Use `useStartupCosts(planId)` for startup costs (needed for investment budget total)
- Use `usePlanOutputs(planId)` as the canonical source for engine outputs (server-confirmed)
- Local state (`useState`) for the Quick Start's in-progress field values before commit
- After Quick Start completion, call `updatePlan()` mutation to persist all changes at once

**Component Naming and Location:**

- Component: `QuickStartOverlay` → file: `client/src/components/shared/quick-start-overlay.tsx`
- Helper: `quick-start-helpers.ts` → file: `client/src/lib/quick-start-helpers.ts` (field mapping, scaling, conversion logic)
- Hook: No new hook needed — compose `usePlan`, `useStartupCosts`, `usePlanOutputs`
- Dev page: `QuickStartDevPage` → file: `client/src/pages/quick-start-dev.tsx` (temporary dev route at `/plans/:planId/quick-start`)

**Number Formatting:**

Follow established conventions from Story 3.5:
- Currency: display via `formatCents()` from `client/src/lib/format-currency.ts`, input accepts dollars, store as cents
- Percentages: display as `value × 100` with `%` suffix, store as decimal
- Population/headcount: plain integers, display with comma formatting (e.g., "50,000")

**Sentiment Frame for ROI Result:**

The summary card includes a contextual message positioning the user's ROI within the brand's typical range. This requires brand-level ROI range data. Approach:
- If brand parameters include disclosed ROI ranges, use those
- If not, use a generic frame: "Your estimated ROI of X% means you'd earn back your investment plus X% over 5 years. Break-even at month Y means you'd start seeing positive returns by [month name, year]."
- Convert abstract month numbers to calendar dates (e.g., "Month 14" → "February 2027" based on a target opening date or current date + months) per UX Principle #2 ("Show the impact in their language")
- Use the "Gurple" (#A9A2AA) advisory color for range context, never red/green judgment styling

### UI/UX Deliverables

**Quick Start Overlay (`<QuickStartOverlay />`):**

A focused, welcoming overlay that appears within the planning workspace on first plan load. NOT a modal dialog — it's a content overlay that replaces the planning workspace content until completed/dismissed.

**Layout:**

Two-column layout (desktop):
- **Left column (input fields):** 5 clearly labeled input fields with warm, approachable copy. Each field has:
  - A friendly question label (not a technical field name)
  - A pre-filled editable input with appropriate formatting (currency with `$`, integers for headcount/population)
  - Brand default shown as muted helper text below input: "Brand average: $X"
  - Visual feedback when value changes (subtle accent pulse matching the AI-populated field pattern)
- **Right column (live result card):** A summary card showing:
  - "Your Estimated ROI: X%" (large, prominent)
  - "Break-Even: Month Y ([Calendar Month Year])" (secondary)
  - Contextual sentiment frame (tertiary, muted)
  - A simple visual gauge or indicator positioning the ROI within a healthy range
  - Total startup investment computed amount

**Below 1024px (stacked):**
- Fields stack vertically
- Result card sticks to bottom of viewport or appears after the 5th field

**Header/Footer:**
- Header: Warm welcome message — "Let's get a quick picture of your [Brand Name] business" (brand name from theme)
- Footer: Two actions:
  - Primary button: "See My Full Plan" (completes Quick Start, transitions to workspace)
  - Text link: "Skip to full planning →" (dismisses Quick Start)

**UI States:**
- **Loading:** Skeleton placeholders for the 5 fields and result card while plan data loads
- **Active:** Fields editable, result card updating in real-time
- **Calculating:** Brief shimmer/pulse on result card metrics while engine recomputes (< 200ms typical for client-side engine)
- **Complete:** Summary card shows final result with "See My Full Plan" CTA emphasized
- **Error:** If plan data fails to load, show "We couldn't load your plan details. Your data is safe — please try refreshing." with retry button

**Navigation:**
- Mount on planning workspace route (`/plans/:planId`): the planning workspace page checks `plan.quickStartCompleted` and renders `<QuickStartOverlay />` when `false`
- Also available on temporary dev route: `/plans/:planId/quick-start`
- After completion, the overlay unmounts and the full planning workspace renders in its place

**Key Visual Design:**
- Warm, inviting tone — this is Sam's first interaction with the planning tool
- Large, clear typography for field labels (Montserrat)
- Roboto Mono for financial values in the result card
- Brand accent color for the primary CTA and ROI highlight
- No financial jargon: "monthly revenue" not "Monthly AUV", "monthly rent" not "Operating Cost — Facilities"
- The experience should feel like answering 5 simple questions, not filling out a financial form

### Anti-Patterns & Hard Constraints

- **DO NOT** create a separate financial engine or calculation module for Quick ROI — use the existing `shared/financial-engine.ts` `calculateProjections()` function. The Quick Start is a curated front door to the same engine, not a different calculator.
- **DO NOT** modify `shared/financial-engine.ts` — the engine is complete and tested. Quick ROI feeds the engine through the existing `EngineInput` interface.
- **DO NOT** modify `shared/plan-initialization.ts` — use the existing `updateFieldValue()` and `resetFieldToDefault()` functions for field updates. Add new Quick Start helper functions in a separate file.
- **DO NOT** modify `server/services/financial-service.ts` — the engine orchestration is complete.
- **DO NOT** modify files in `client/src/components/ui/` — these are shadcn primitives.
- **DO NOT** modify `vite.config.ts` or `drizzle.config.ts`.
- **DO NOT** use red/error styling for ROI results — even a negative ROI should use the "Gurple" (#A9A2AA) advisory color with constructive framing, never judgment. Per UX spec: "never say 'this won't work'" — instead surface actionable levers.
- **DO NOT** build the Quick Start as a separate page/route — it's an overlay WITHIN the planning workspace that replaces the workspace content on first load.
- **DO NOT** make the Quick Start blocking — the "Skip to full planning" option must always be available. The Quick Start is engaging, not gatekeeping.
- **DO NOT** store Quick ROI results in a separate table or field — the 5 inputs write to the plan's existing `financialInputs` and `startupCosts` JSONB columns. The engine computes ROI on demand.
- **DO NOT** add an `avgAnnualWage` constant directly in the component — put the staff-to-labor conversion constant in a shared location (`client/src/lib/quick-start-helpers.ts`) so it can be promoted to a brand parameter later if needed.
- **DO NOT** duplicate the `MetricCard` component — reuse or extend the existing one from `client/src/components/shared/summary-metrics.tsx`.

### Gotchas & Integration Warnings

- **`financialInputs` can be null on a new plan:** The plan may have `financialInputs: null` if the initialization step hasn't run yet. The Quick Start should handle this by calling `buildPlanFinancialInputs(brandParams)` to initialize inputs before the user starts editing. Check how the existing plan creation flow (POST `/api/plans`) initializes financial inputs — if it already calls `buildPlanFinancialInputs`, the Quick Start receives pre-populated data.

- **Startup costs needed for investment budget total:** The "Initial Investment Budget" field's pre-fill value requires the startup costs array. Load startup costs alongside the plan. If `plan.startupCosts` is null, call `buildPlanStartupCosts(brand.startupCostTemplate)` to initialize. The sum of all startup cost amounts (in cents) is the pre-fill for the investment budget field.

- **Currency is in cents everywhere:** The engine and JSONB store currency as cents (integers). The Quick Start inputs must convert dollars → cents on save and cents → dollars on display. Use existing `formatCents()` and `parseDollarsToCents()` from `client/src/lib/format-currency.ts`.

- **Staff count is a proxy, not a stored financial field:** The staff count doesn't exist in `PlanFinancialInputs`. When converting staffCount → laborPct, the reverse conversion is needed for pre-fill: `staffCount = Math.round(laborPct × monthlyAuv × 12 / avgAnnualWageCents)`. Store the raw staff count as plan metadata (e.g., in a JSONB field or the plan's `targetMarket`-adjacent metadata) so it can be displayed if the user returns to the Quick Start context.

- **Client-side engine import:** The financial engine module (`shared/financial-engine.ts`) uses no Node.js-specific APIs and is already configured as a shared module. It should work in the browser via the existing Vite alias `@shared/*`. Verify the import works: `import { calculateProjections } from '@shared/financial-engine'`.

- **Proportional startup cost scaling can produce rounding artifacts:** When scaling all startup costs by a factor, individual items may not sum exactly to the new total due to rounding. After scaling, adjust the largest item by the rounding difference to ensure the sum matches the user's budget exactly.

- **The `quickStartCompleted` column needs a database migration:** Adding a boolean column to the `plans` table requires running `npx drizzle-kit push` after schema changes. Existing plans will default to `false`, which means they would show Quick Start on next load. This is acceptable — existing test/dev plans seeing the Quick Start once is not harmful. Alternatively, default to `true` for existing plans if a migration can set it.

- **`usePlanOutputs` uses server-side computation:** The `usePlanOutputs` hook fetches engine outputs from the server. For Quick Start real-time preview, client-side computation provides instant feedback. The server-confirmed outputs (via `usePlanOutputs`) serve as the canonical source after save. During Quick Start interaction, prioritize client-side computation for speed, then reconcile with server on save.

- **Brand parameters must be available for pre-fill:** The Quick Start needs brand parameters (for default values) and the brand's startup cost template. The plan's `brandId` is available from `usePlan`. Load brand data to get parameters. Check if there's an existing way to fetch brand parameters for a given brand ID — the admin brand detail page likely has this pattern.

- **Existing tests must continue passing:** `shared/financial-engine.test.ts` (33+ tests), `shared/plan-initialization.test.ts` (131+ tests), and `server/services/financial-service.test.ts` (9 tests) must all pass after changes. The only schema-level change is the new `quickStartCompleted` column, which should not break existing tests.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `shared/schema.ts` | MODIFY | Add `quickStartCompleted` boolean column (default `false`) to `plans` table; add `quickStartStaffCount` integer column (nullable) for staff count metadata |
| `client/src/lib/quick-start-helpers.ts` | CREATE | Field mapping logic: investment budget ↔ startup cost scaling, staff count ↔ labor percentage conversion, reverse conversions for pre-fill, rounding adjustment |
| `client/src/components/shared/quick-start-overlay.tsx` | CREATE | Quick Start overlay component: 5 input fields, live ROI/break-even result card, sentiment frame, complete/dismiss actions |
| `client/src/pages/quick-start-dev.tsx` | CREATE | Temporary dev page at `/plans/:planId/quick-start` following existing dev page pattern |
| `client/src/App.tsx` | MODIFY | Add `/plans/:planId/quick-start` dev route |
| `server/routes/plans.ts` | MODIFY | Ensure PATCH endpoint accepts `quickStartCompleted` and `quickStartStaffCount` fields (should work via existing `updatePlanSchema.partial()` once schema is updated) |

### Dependencies & Environment Variables

**Packages already installed (DO NOT reinstall):**
- `drizzle-orm`, `drizzle-zod`, `zod` — schema and validation
- `@tanstack/react-query` — server state management
- `react`, `react-dom` — UI framework
- `lucide-react` — icons
- `recharts` — charting (if visual gauge is implemented as a chart)
- `class-variance-authority`, `clsx`, `tailwind-merge` — styling utilities
- `framer-motion` — animations (for subtle transitions and pulse effects)

**No new packages needed.**

**No new environment variables needed.**

**Database migration required:** After adding `quickStartCompleted` and `quickStartStaffCount` columns to the `plans` table schema, run `npx drizzle-kit push` to apply the migration.

### References

- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Decision 5 (API Design: `POST /api/quick-roi` endpoint pattern, `PATCH /api/plans/:id`), Decision 8 (State Management: TanStack React Query, optimistic updates), Decision 9 (Component Architecture: shared components in `client/src/components/shared/`), Decision 15 (Financial Engine: pure TypeScript module, can run client-side), Per-field metadata pattern, Number Format Rules (cents for currency, decimals for rates), Data Model (`plans.quick_roi_result` JSONB mentioned in architecture entity model)
- Epics: `_bmad-output/planning-artifacts/epics.md` — Epic 3 overview, Story 3.6 AC (5 high-impact inputs, real-time ROI, dismiss/complete, first-plan-only), FR7 (live-updating summary financial metrics)
- UX Design: `_bmad-output/planning-artifacts/ux-design-specification.md` — Quick ROI as Critical Success Moment #1 ("first 90 seconds"), Sam's Emotional Arc ("cautious hope"), Behavioral Proxy (proceeds to full planning within 48 hours), Sentiment frame with brand range context, "Gurple" (#A9A2AA) advisory color, Metadata-on-demand pattern, Financial value formatting (Roboto Mono), Experience Principle #2 (show impact in their language — dates not month numbers), Experience Principle #3 (progressive confidence)
- PRD: `_bmad-output/planning-artifacts/prd.md` — FR7 (view live-updating summary financial metrics), NFR1 (< 2s recalculation), NFR28 (200ms visual feedback)
- Story 3.1: `_bmad-output/implementation-artifacts/3-1-financial-engine-core-plan-schema.md` — Plans table schema, `calculateProjections()` function, `EngineInput`/`EngineOutput` interfaces, `ROIMetrics` interface
- Story 3.2: `_bmad-output/implementation-artifacts/3-2-brand-default-integration-per-field-metadata.md` — `buildPlanFinancialInputs()`, `buildPlanStartupCosts()`, `unwrapForEngine()`, `updateFieldValue()`, `resetFieldToDefault()`
- Story 3.4: `_bmad-output/implementation-artifacts/3-4-live-summary-metrics-accounting-validation.md` — `computePlanOutputs()` service, `usePlanOutputs` hook, `planOutputsKey()`, `SummaryMetrics` component, `MetricCard` subcomponent
- Story 3.5: `_bmad-output/implementation-artifacts/3-5-financial-input-api-per-field-reset.md` — `usePlan` hook, `planKey()`, PATCH endpoint pattern, `formatCents()`/`parseDollarsToCents()` utilities, `FinancialInputEditor` component patterns
- Existing code: `shared/financial-engine.ts` (engine + interfaces), `shared/plan-initialization.ts` (bridge functions), `client/src/components/shared/summary-metrics.tsx` (`MetricCard`, `formatROI`, `formatBreakEven`), `client/src/hooks/use-plan.ts`, `client/src/hooks/use-plan-outputs.ts`, `client/src/hooks/use-startup-costs.ts`, `client/src/lib/format-currency.ts`

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Completion Notes

### File List
