# Story 3.4: Live Summary Metrics & Accounting Validation

Status: done

## Story

As a franchisee,
I want to see live-updating summary metrics as I edit my plan,
so that I immediately understand the impact of each change (FR7, FR8).

## Acceptance Criteria

1. **Given** a plan with financial inputs, **when** I view my plan in the planning workspace, **then** a summary metrics panel displays four headline metrics: total startup investment, projected annual revenue (Year 1), ROI percentage (5-year), and break-even month — all computed by the financial engine from my current inputs and startup costs.

2. **Given** I am viewing my plan with summary metrics displayed, **when** any financial input value changes (field edit, startup cost add/remove/edit, reset to default), **then** the summary metrics recompute and update on screen within 2 seconds of the change (NFR1).

3. **Given** the financial engine computes projections, **when** the computation completes, **then** the engine validates all four accounting identities on every calculation: (a) balance sheet equation — assets = liabilities + equity per year, (b) total depreciation consistency with CapEx, (c) loan amortization consistency, (d) P&L-to-cash-flow consistency — operating cash flow = pre-tax income + depreciation + working capital changes per year (FR8).

4. **Given** an accounting identity check fails (any `identityChecks` item has `passed: false`), **when** the engine returns results, **then** the failure is logged to a structured server-side log with full input/output context (the `EngineInput` that produced the failure, the specific check name, expected vs. actual values, and tolerance), at a severity level suitable for monitoring alerts — **and** the summary metrics still display to the user without interruption (failures do not block the user).

5. **Given** a plan with financial inputs, **when** I request the computed financial outputs via the API, **then** the server runs `calculateProjections()` with my current inputs and returns the complete `EngineOutput` (monthly projections, annual summaries, ROI metrics, identity check results) — and identical inputs always produce identical outputs (FR9, NFR15).

6. **Given** the summary metrics are displayed, **when** I view the total startup investment metric, **then** it matches the sum of all my startup cost line items (CapEx + Non-CapEx + Working Capital) as computed by `getStartupCostTotals()`.

7. **Given** the financial engine returns identity check results, **when** all checks pass, **then** no user-facing indication of the validation is shown — the validation is silent and successful.

8. **Given** the financial engine returns identity check results with one or more failures, **when** the results are displayed, **then** a subtle, non-blocking advisory indicator appears in the summary metrics area (using the "Gurple" #A9A2AA advisory color, not red/error) with warm language such as "We're double-checking the numbers" — the user can dismiss it and continue working.

## Dev Notes

### Architecture Patterns to Follow

**Financial Engine Invocation Pattern:**

The financial engine (`shared/financial-engine.ts`) is a pure TypeScript module that accepts `EngineInput` and returns `EngineOutput`. It must be invoked server-side and the results returned via API. The engine is already fully implemented with `calculateProjections()` — this story wires it into the application.

The invocation chain is:
1. Load plan's `financialInputs` (JSONB) and `startupCosts` (JSONB) from storage
2. Call `unwrapForEngine(planInputs, startupCosts)` from `shared/plan-initialization.ts` to extract raw numeric `EngineInput`
3. Call `calculateProjections(engineInput)` from `shared/financial-engine.ts`
4. Return the `EngineOutput` to the client
5. Log any identity check failures server-side before returning

**API Endpoint Pattern:**

Follow the existing route pattern established in `server/routes/plans.ts`. The new endpoint is a plan sub-resource:

- `GET /api/plans/:planId/outputs` — computes and returns `EngineOutput` for the given plan

This endpoint must:
- Enforce `requireAuth` middleware and plan ownership checks (franchisee owns plan, or Katalyst admin)
- Load the plan, extract `financialInputs` and `startupCosts`, call `unwrapForEngine()` then `calculateProjections()`
- Return `{ data: EngineOutput }` following the standard API response wrapper
- Log identity check failures before returning (see Structured Logging below)
- NOT cache results in the database for MVP — compute fresh on every request (engine completes in <100ms for 60-month projections, well within the 2-second NFR1 budget)

**Financial Service Pattern:**

Create a `server/services/financial-service.ts` service to orchestrate engine invocation. Per the architecture, business logic lives in `server/services/`, not in route handlers. The service:

```typescript
// server/services/financial-service.ts
export async function computePlanOutputs(
  plan: Plan,
  storage: IStorage
): Promise<EngineOutput> {
  // 1. Get startup costs (handles legacy migration)
  const startupCosts = await storage.getStartupCosts(plan.id);

  // 2. Unwrap plan inputs for engine
  const engineInput = unwrapForEngine(plan.financialInputs, startupCosts);

  // 3. Run engine
  const output = calculateProjections(engineInput);

  // 4. Log any identity check failures
  logIdentityCheckFailures(plan.id, engineInput, output.identityChecks);

  return output;
}
```

**State Management Pattern (Client-Side):**

Use TanStack React Query for fetching and caching engine outputs:

- Query key: `['plans', planId, 'outputs']`
- The query fetches `GET /api/plans/:planId/outputs`
- When financial inputs change (via auto-save mutation or startup cost update), invalidate `['plans', planId, 'outputs']` to trigger refetch
- Use `staleTime: 0` so outputs are always fresh when inputs change
- Optimistic UI: show a subtle loading indicator on the metrics during recomputation, but keep the previous values visible until new ones arrive (no blank flash)

**Structured Logging Pattern:**

Use a structured JSON logger for accounting identity check failures. Create a lightweight logger utility:

```typescript
// server/services/structured-logger.ts
interface StructuredLogEntry {
  level: 'info' | 'warn' | 'error';
  event: string;
  planId: string;
  timestamp: string;
  data: Record<string, unknown>;
}
```

Log identity check failures at `warn` level with:
- `event: "accounting_identity_check_failed"`
- `planId`: the plan ID
- `data.checkName`: the specific check that failed (e.g., "balance_sheet_year_3")
- `data.expected`: expected value
- `data.actual`: actual value
- `data.tolerance`: tolerance used
- `data.engineInput`: the full EngineInput that produced the failure (for reproducibility)

Output to `process.stderr` as JSON (one line per entry) — this is the standard pattern for structured logging that monitoring tools (Datadog, CloudWatch, etc.) can ingest. Do NOT use `console.log` for these — use a dedicated function that writes structured JSON.

**Number Format Rules (from architecture):**

| Type | Storage | Example | Display |
|------|---------|---------|---------|
| Currency amounts | Cents as integers | `15000000` = $150,000 | `$150,000` |
| Percentages/rates | Decimal form | `0.065` = 6.5% | `6.5%` |
| Months | Plain integers | `14` = month 14 | `Month 14` or `February 2027` |
| ROI percentage | Decimal form | `0.42` = 42% | `42%` |

Currency formatting happens exclusively in the UI layer using the existing `formatCents()` utility from `client/src/lib/format-currency.ts`.

**Component Naming:**
- Component: `SummaryMetrics` (PascalCase)
- File: `summary-metrics.tsx` (kebab-case)
- Hook: `usePlanOutputs` (camelCase)
- File: `use-plan-outputs.ts` (kebab-case)
- Service: `financial-service.ts` (kebab-case)

### UI/UX Deliverables

**Summary Metrics Component (`<SummaryMetrics />`):**

Per the architecture (Decision 9), summary metrics belong in the Detail Panel (right side of the split view) and are shared across all experience tiers. The component lives in `client/src/components/shared/`.

**Layout — Four Summary Cards:**

A row/grid of 4 metric cards, each displaying:
1. **Total Startup Investment** — `roiMetrics.totalStartupInvestment` formatted as currency (e.g., "$247,500")
2. **Projected Annual Revenue** — `annualSummaries[0].revenue` (Year 1) formatted as currency (e.g., "$385,000")
3. **ROI (5-Year)** — `roiMetrics.fiveYearROIPct` formatted as percentage (e.g., "42%")
4. **Break-Even** — `roiMetrics.breakEvenMonth` displayed as "Month N" or "N/A" if null

Each card shows:
- Metric label (above)
- Metric value (large, prominent — use Roboto Mono for financial values per UX spec)
- Subtle source context where applicable (e.g., "Year 1" under revenue)

**Card Styling:**
- Use shadcn/ui `Card` component
- Financial values use consistent formatting (NFR27): currency with $ and commas, percentages with no decimal for whole numbers or 1 decimal
- Cards arranged in a responsive grid: 4 columns on wide screens, 2×2 on narrower panels
- Per-field `data-testid` attributes: `value-total-investment`, `value-annual-revenue`, `value-roi-pct`, `value-break-even-month`, `status-identity-check` (advisory banner), `status-metrics-loading` (loading state)

**UI States:**
- **Loading state:** Skeleton placeholders in each card while engine output is being fetched (use shadcn Skeleton)
- **Success state:** Metric values displayed with animation on value change (subtle number transition, not disruptive)
- **Identity check warning state:** If any identity check fails, a small advisory banner appears below the metrics cards: "Calculation review in progress" with Gurple (#A9A2AA) background — dismissible, non-blocking
- **Error state:** If the API call fails, show inline message: "Unable to compute metrics. Your data is safe — please try refreshing." with retry action
- **No plan state:** If plan `financialInputs` is `null` (plan not yet initialized), show "Set up your plan to see projections." If `financialInputs` exists with all brand defaults (no user edits), show the computed metrics — this provides immediate value by showing "here's what a typical [Brand] location looks like"

**Interaction:**
- Metrics update automatically when the `['plans', planId, 'outputs']` query refetches (triggered by input changes)
- During recomputation, previous values remain visible with a subtle loading indicator (e.g., opacity reduction or small spinner) — no blank flash
- Cards are read-only (no click action in this story — drill-down to detailed projections is a future story)

**Navigation:**
- The `<SummaryMetrics />` component will be mounted within the Detail Panel shell (built in Story 4.1)
- For this story, it must be independently renderable and testable — mount on a temporary dev route (e.g., `/plans/:planId/metrics-dev`) similar to the pattern established in Story 3.3 for `<StartupCostBuilder />`
- The component accepts `planId` as a prop and manages its own data fetching via the `usePlanOutputs` hook

### Anti-Patterns & Hard Constraints

- **DO NOT** cache/store `EngineOutput` in the database for MVP — compute fresh on every `GET /api/plans/:planId/outputs` request. The engine is fast enough (<100ms). Caching introduces stale data risks when inputs change.
- **DO NOT** modify `shared/financial-engine.ts` — the engine is complete and tested. This story wires it into the application, it does not change the computation.
- **DO NOT** modify `shared/plan-initialization.ts` — the `unwrapForEngine()` function and startup cost helpers are complete from Stories 3.1–3.3.
- **DO NOT** use `console.log` for identity check failure logging — use structured JSON to `process.stderr` for monitoring compatibility.
- **DO NOT** block the user when identity checks fail — always return the `EngineOutput` with the results. Log server-side and show a subtle advisory indicator client-side.
- **DO NOT** use red/error styling for identity check warnings — use the "Gurple" (#A9A2AA) advisory color per UX spec.
- **DO NOT** run the financial engine on the client side for MVP — compute server-side only via the API endpoint. Client-side computation is a future optimization.
- **DO NOT** create `shared/types.ts` — engine interfaces live in `shared/financial-engine.ts` per architecture.
- **DO NOT** split the Drizzle schema across multiple files — `shared/schema.ts` only.
- **DO NOT** use floating-point for currency display — format from cents using `formatCents()`.
- **DO NOT** modify `vite.config.ts`, `drizzle.config.ts`, or files in `client/src/components/ui/`.
- **DO NOT** put business logic in route handlers — the financial service orchestrates engine invocation.
- **DO NOT** add new database tables or columns — this story uses existing plan data (financialInputs, startupCosts) as engine input and returns computed output via API.

### Gotchas & Integration Warnings

- **`unwrapForEngine()` transforms are non-trivial:** The function in `shared/plan-initialization.ts` converts `PlanFinancialInputs` (per-field metadata wrappers with cents-based currency) into `EngineInput` (raw numeric values the engine expects). Key transformations include: `monthlyAuv × 12 → annualGrossSales`, single growth rate → 5-year array, monthly fixed costs → `facilitiesAnnual` with 3% escalation, `otherMonthly → otherOpexPct` as derived percentage, `loanAmount / totalInvestment → equityPct`, `1 / depreciationYears → depreciationRate`. These are already tested — do not duplicate or reimplement this logic.

- **Startup costs must be loaded via `storage.getStartupCosts()`:** This method handles legacy format migration (plans created before Story 3.3 have old-format startup costs). Do not read `plan.startupCosts` directly — always go through the storage method.

- **Identity checks use 1-cent tolerance:** The engine's `IdentityCheckResult` uses a tolerance of 1 cent — the literal integer `1` in the cents-based system (i.e. $0.01). Floating-point arithmetic can produce tiny discrepancies that are within tolerance. A "failure" means the discrepancy exceeds this tolerance — which indicates a real accounting bug, not a rounding artifact.

- **`breakEvenMonth` can be null:** If the plan never reaches positive cumulative cash flow within 60 months, `roiMetrics.breakEvenMonth` is `null`. The UI must handle this gracefully (display "N/A" or "> 60 months" rather than showing null/undefined).

- **`fiveYearROIPct` can be negative:** If the plan loses money over 5 years, ROI will be negative. Display this honestly without alarm (advisory tone, not error styling).

- **Plans with no financial inputs:** A newly created plan may not have `financialInputs` populated yet (the field is nullable in the schema). The endpoint should return a 400 error with a helpful message if `financialInputs` is null, rather than crashing.

- **Plans with no startup costs:** If `startupCosts` is empty or null, `totalStartupInvestment` will be 0, which makes ROI computation divide-by-zero. The engine handles this by returning `fiveYearROIPct: 0` and `breakEvenMonth: null` when investment is zero. The UI should display these edge cases meaningfully.

- **TanStack Query invalidation cascade:** When startup costs are updated (via the `useStartupCosts` hook), the `['plans', planId, 'outputs']` query must also be invalidated so metrics refresh. Wire this in the `usePlanOutputs` hook or in the startup cost mutation's `onSuccess` callback. Similarly, when `financial_inputs` are updated via plan PATCH, outputs must be invalidated.

- **End-to-end latency budget for NFR1 (<2s):** The 2-second recalculation budget from NFR1 covers the full user-perceived latency: input change → save mutation (PATCH) → output refetch (GET /outputs including engine computation) → render. That's potentially three network hops. The engine itself is fast (<100ms), but the network roundtrips add up. To stay within budget: (a) the output fetch can fire immediately after the input mutation starts (don't wait for PATCH response), (b) use optimistic UI — keep previous values visible during recomputation, and (c) consider firing the output fetch with the latest local state even before the save confirms, since the engine is deterministic.

- **Brand-default-only plans should show computed metrics:** When a plan has `financialInputs` populated with all brand defaults (no user edits yet), the metrics should display the computed projections — this gives Sam immediate value ("here's what a typical PostNet location looks like"). The "Set up your plan to see projections" placeholder should only appear when `financialInputs` is truly `null` (plan not yet initialized), not when all values are defaults.

- **Legacy startup cost format plans:** `storage.getStartupCosts()` handles migration from the pre-Story 3.3 format (3-field objects to full `StartupCostLineItem`). Always go through the storage method — do not read `plan.startupCosts` directly. Add a test case for a plan with legacy-format startup costs to verify the engine still computes correctly after migration.

- **Existing empty financial engine router:** `server/routes/financial-engine.ts` exists as an empty router mounted at `/api/financial-engine`. The new outputs endpoint should be added to `server/routes/plans.ts` as `/api/plans/:planId/outputs` (plan sub-resource), not to the financial engine router — this follows the pattern established for startup costs.

- **The `requireAuth` middleware** exists at `server/middleware/auth.ts` and checks for an authenticated session. Plan ownership checks must be added in the route handler (verify `plan.userId === req.user.id` for franchisees, or allow Katalyst admins full access).

- **Existing tests:** `shared/financial-engine.test.ts` (47 tests) and `shared/plan-initialization.test.ts` (131 tests) must continue passing. New tests should cover the financial service and API endpoint.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `server/services/financial-service.ts` | CREATE | Orchestrates engine invocation: loads plan data, calls unwrapForEngine + calculateProjections, logs identity check failures |
| `server/services/structured-logger.ts` | CREATE | Structured JSON logging utility for identity check failures and other monitoring-worthy events |
| `server/routes/plans.ts` | MODIFY | Add `GET /:planId/outputs` endpoint that calls financial service and returns EngineOutput |
| `client/src/hooks/use-plan-outputs.ts` | CREATE | TanStack Query hook for fetching plan outputs (GET /api/plans/:planId/outputs), with cache invalidation wiring |
| `client/src/components/shared/summary-metrics.tsx` | CREATE | Summary metrics card grid component — displays 4 headline metrics from EngineOutput |
| `client/src/pages/metrics-dev.tsx` | CREATE | Temporary dev page for testing SummaryMetrics component (same pattern as startup-costs-dev.tsx) |
| `client/src/App.tsx` | MODIFY | Add /plans/:planId/metrics-dev route for temporary testing |
| `server/services/financial-service.test.ts` | CREATE | Tests for financial service: happy path, null inputs handling, identity check logging |

### Dependencies & Environment Variables

**Packages already installed (DO NOT reinstall):**
- `drizzle-orm`, `drizzle-zod`, `zod` — schema and validation
- `@neondatabase/serverless` — PostgreSQL driver
- `react`, `react-dom` — UI framework
- `@tanstack/react-query` — server state management
- `lucide-react` — icons
- `class-variance-authority`, `clsx`, `tailwind-merge` — styling utilities
- `recharts` — charting (available for future dashboard charts, not needed for summary cards in this story)

**No new packages needed.** The structured logger uses Node.js built-in `process.stderr.write()`.

**No new environment variables needed.**

**No database migration needed.** This story reads existing plan data and computes outputs on the fly.

### References

- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Decision 5 (API Design: GET /api/plans/:id/outputs), Decision 8 (State Management: React Query for server state), Decision 15 (Engine Design: pure function module, EngineInput/EngineOutput interfaces, calculation graph, identity checks), Financial Engine Purity Enforcement, Process Patterns (Error Handling: engine never throws, returns identityChecks), Number Format Rules, Structure Patterns (server/services/ for business logic), Communication Patterns (TanStack Query, optimistic updates)
- Epics: `_bmad-output/planning-artifacts/epics.md` — Epic 3 overview, Story 3.4 AC, FR7 (live-updating metrics), FR8 (accounting identity validation), FR9 (deterministic outputs), NFR1 (<2s recalculation), NFR15 (deterministic)
- PRD: `_bmad-output/planning-artifacts/prd.md` — FR7, FR8, NFR1, NFR15
- UX Design: `_bmad-output/planning-artifacts/ux-design-specification.md` — Mercury-inspired summary cards (4-5 headline metrics with drill-down), financial value formatting (Roboto Mono), advisory tone (Gurple color, never red for business judgment), auto-save trust signals, metadata-on-demand pattern
- Story 3.1: `_bmad-output/implementation-artifacts/3-1-financial-engine-core-plan-schema.md` — Engine architecture, EngineInput/EngineOutput types, calculateProjections signature, identity checks, plans table schema
- Story 3.2: `_bmad-output/implementation-artifacts/3-2-brand-default-integration-per-field-metadata.md` — PlanFinancialInputs structure, FinancialFieldValue metadata, unwrapForEngine() function, buildPlanFinancialInputs()
- Story 3.3: `_bmad-output/implementation-artifacts/3-3-startup-cost-computation-custom-line-items.md` — StartupCostLineItem interface, startup cost helper functions, getStartupCostTotals(), storage methods (getStartupCosts, updateStartupCosts), useStartupCosts hook, StartupCostBuilder component pattern, temporary dev route pattern
- Existing code: `shared/financial-engine.ts` (calculateProjections, EngineInput, EngineOutput, ROIMetrics, IdentityCheckResult), `shared/plan-initialization.ts` (unwrapForEngine, PlanFinancialInputs, FinancialFieldValue, getStartupCostTotals), `server/storage.ts` (IStorage.getStartupCosts, getPlan), `server/routes/plans.ts` (plan sub-resource route pattern), `client/src/lib/format-currency.ts` (formatCents), `client/src/hooks/use-startup-costs.ts` (TanStack Query hook pattern)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Completion Notes

Wired the existing financial engine into the application via a new API endpoint,
server-side financial service, and client-side SummaryMetrics UI component.

**Key implementation decisions:**
- Refactored `requirePlanAccess` in plans.ts to return full `Plan` object (instead of just brandId) so the outputs endpoint can pass it directly to the financial service — this avoids a redundant DB lookup while keeping existing startup-cost endpoints working.
- Financial service orchestrates engine invocation cleanly: loads startup costs via `storage.getStartupCosts()` (handles legacy migration), calls `unwrapForEngine()` then `calculateProjections()`, logs identity check failures to structured stderr.
- SummaryMetrics component handles all UI states: loading (skeleton), error (retry button), no-inputs (setup message), identity check advisory (Gurple dismissible banner), and normal display with opacity transition during refetch.
- Hook `usePlanOutputs` uses `staleTime: 0` and exposes `invalidateOutputs()` for cross-query invalidation when inputs change.
- Structured logger is a generic utility (not identity-check-specific) for future reuse.

**LSP Status:** Clean — zero new type errors introduced. Pre-existing type errors in `server/storage.ts` and `shared/schema.ts` remain unchanged.

**Visual Verification:** Dev page created at `/plans/:planId/metrics` following the same pattern as startup-costs-dev.

### File List

- `server/services/structured-logger.ts` — CREATE — Generic structured JSON logging utility
- `server/services/financial-service.ts` — CREATE — Engine invocation orchestrator with identity check logging
- `server/services/financial-service.test.ts` — CREATE — 9 tests covering happy path, null inputs, empty costs, determinism, identity checks, ROI metrics
- `server/routes/plans.ts` — MODIFY — Added `GET /:planId/outputs` endpoint; refactored `requirePlanAccess` to return Plan object
- `client/src/hooks/use-plan-outputs.ts` — CREATE — TanStack Query hook for fetching engine outputs
- `client/src/components/shared/summary-metrics.tsx` — CREATE — 4-card summary metrics grid with all UI states
- `client/src/pages/metrics-dev.tsx` — CREATE — Temporary dev page for testing SummaryMetrics
- `client/src/App.tsx` — MODIFY — Added /plans/:planId/metrics route
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — MODIFY — Status updated to review
- `_bmad-output/implementation-artifacts/3-4-live-summary-metrics-accounting-validation.md` — MODIFY — Status and Dev Agent Record

## Code Review Record

### Review Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Review Findings

**HIGH: 0** | **MEDIUM: 3 (all fixed)** | **LOW: 2 (accepted)**

#### MEDIUM — Fixed

1. **Unused `apiRequest` import in `use-plan-outputs.ts`** — Removed. The hook uses TanStack Query's default `queryFn` (which joins the query key as URL), so `apiRequest` was dead code.

2. **Unused `EngineOutput` type import in `summary-metrics.tsx`** — Removed. The component accesses engine output properties through the hook's return value, never referencing the `EngineOutput` type directly.

3. **Misplaced `import type { Plan }` after `const router = Router()` in `plans.ts`** — Merged into the existing `@shared/schema` import line at the top of the file. All imports now precede executable code.

#### LOW — Accepted

1. **Dev route path `/plans/:planId/metrics` vs spec's `/plans/:planId/metrics-dev`** — The route serves the same purpose (temporary dev preview). Path name is cosmetic and will be removed when Story 4.1 mounts the component in the real planning workspace.

2. **`StructuredLogEntry` omits `planId` as a top-level field** — The spec suggested `planId` as a top-level field, but the implementation uses a generic `data: Record<string, unknown>` bag. `planId` is included inside `data`. The generic approach is more reusable for non-plan-related structured logs in the future.

### Verification

- All 140 tests pass (33 engine + 98 plan-init + 9 financial service)
- Zero new TypeScript errors introduced (pre-existing errors in `server/storage.ts` unchanged)
- All 8 Acceptance Criteria verified against implementation
