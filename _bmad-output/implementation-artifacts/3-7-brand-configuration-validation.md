# Story 3.7: Brand Configuration Validation

Status: review

## Story

As a Katalyst admin,
I want to validate a brand configuration by running the financial model against known-good spreadsheet outputs,
so that I can confirm the financial engine produces correct results for this brand (FR41).

## Acceptance Criteria

1. **Given** a brand has complete financial parameters and a startup cost template configured, **when** I navigate to the brand detail page and select the "Validation" tab, **then** I see a validation interface that lets me run the financial engine against test input/output datasets.

2. **Given** I am on the brand validation tab, **when** I view the interface, **then** I see an option to either (a) enter known input values and expected output values manually, or (b) upload a JSON test fixture containing input values and expected outputs — both approaches produce the same validation run.

3. **Given** I have provided (or uploaded) a set of known input values and expected output values, **when** I click "Run Validation," **then** the system runs the financial engine with the provided inputs combined with the brand's parameters and startup cost template, and displays a comparison report showing calculated vs. expected values for key financial outputs.

4. **Given** the validation run completes, **when** I view the comparison report, **then** each compared metric shows: metric name, expected value, calculated value, difference, and a pass/fail indicator — where "fail" means the absolute difference exceeds a configurable tolerance (default: 100 cents / $1.00 for currency values, 0.001 for percentages and ratios).

5. **Given** the comparison report is displayed, **when** differences exceed tolerance, **then** failing rows are visually highlighted and a summary banner shows "X of Y metrics passed" with an overall pass/fail status.

6. **Given** I have completed a validation run, **when** I view the validation history, **then** I see a list of previous validation runs for this brand with: timestamp, overall pass/fail status, number of metrics compared, and a summary of failures (if any) — most recent first.

7. **Given** a validation run exists in history, **when** I click on it, **then** I can view the full comparison report from that run, including the input values and expected outputs that were used.

8. **Given** I want to re-validate after changing brand parameters, **when** I modify brand parameters or startup cost template and return to the validation tab, **then** I can re-run the same test fixture against the updated brand configuration to verify the changes produce correct results.

9. **Given** the brand does not have complete financial parameters or startup cost template, **when** I navigate to the validation tab, **then** I see a clear message explaining that brand configuration must be completed before validation can run, with links to the parameters and startup cost tabs.

## Dev Notes

### Architecture Patterns to Follow

**Validation Data Model:**

Validation runs are stored in a new `brand_validation_runs` table:
- `id` (varchar, PK, gen_random_uuid)
- `brand_id` (varchar, FK → brands)
- `run_at` (timestamp, defaultNow)
- `status` ("pass" | "fail")
- `test_inputs` (JSONB — the known input values used for validation)
- `expected_outputs` (JSONB — the expected output values)
- `actual_outputs` (JSONB — the calculated output values from the engine)
- `comparison_results` (JSONB — array of metric comparisons with pass/fail)
- `tolerance_config` (JSONB — the tolerance values used for this run)
- `run_by` (varchar, FK → users — the admin who triggered it)
- `notes` (text, nullable — optional admin notes)

**Engine Invocation Pattern:**

The validation uses the exact same engine pipeline as production plan computation:
1. Take the brand's `brandParameters` and `startupCostTemplate`
2. Build `PlanFinancialInputs` via `buildPlanFinancialInputs(brandParams)` from `shared/plan-initialization.ts`
3. Override specific field values with the test fixture's known inputs (updating `currentValue` on each `FinancialFieldValue`)
4. Build startup costs via `buildPlanStartupCosts(startupCostTemplate)` from `shared/plan-initialization.ts`
5. Optionally override startup cost amounts from the test fixture
6. Call `unwrapForEngine()` to produce `EngineInput`
7. Call `calculateProjections(engineInput)` to get `EngineOutput`
8. Compare `EngineOutput` key metrics against expected values

This ensures the validation tests the complete pipeline — parameter conversion, initialization, unwrapping, and computation — not just the engine in isolation.

**Key Metrics to Compare:**

The comparison report should cover these output categories from `EngineOutput`:
- **ROI Metrics** (`roiMetrics`): `totalInvestment`, `totalReturn`, `roi`, `breakEvenMonth`, `irr`
- **Annual Summaries** (`annualSummaries[0..4]`): `totalRevenue`, `totalCogs`, `grossProfit`, `totalOpex`, `ebitda`, `netIncome`, `endingCash`
- **Identity Checks** (`identityChecks`): all should pass
- Optionally, specific monthly projections (e.g., month 1, month 12, month 60)

**Tolerance Configuration:**

Default tolerances:
- Currency values (cents): ±100 (i.e., $1.00 tolerance)
- Percentage/ratio values: ±0.001 (0.1%)
- Month counts (breakEvenMonth): ±1
- Identity checks: must all pass (no tolerance)

The admin can adjust these tolerances per validation run.

**Test Fixture Format:**

The JSON test fixture format for upload:

```json
{
  "name": "PostNet Q1 2026 Baseline",
  "inputs": {
    "revenue": { "monthlyAuv": 2500000 },
    "operatingCosts": { "cogsPct": 0.28, "laborPct": 0.30 },
    "financing": { "loanAmount": 15000000 },
    "startupCosts": [
      { "name": "Franchise Fee", "amount": 4500000 },
      { "name": "Leasehold Improvements", "amount": 7500000 }
    ]
  },
  "expectedOutputs": {
    "roiMetrics": { "roi": 0.142, "breakEvenMonth": 14, "totalInvestment": 22000000 },
    "annualSummaries": [
      { "year": 1, "totalRevenue": 30000000, "netIncome": 2100000 }
    ]
  },
  "tolerances": {
    "currency": 100,
    "percentage": 0.001,
    "months": 1
  }
}
```

The `inputs` object uses the same field names as `PlanFinancialInputs` but with raw values (no metadata wrappers). The validation endpoint maps these onto the `FinancialFieldValue.currentValue` fields. Any field not specified in the fixture retains its brand default value — this allows testing partial overrides (e.g., "what if a franchisee only changes their rent?").

**API Pattern:**

- `POST /api/brands/:brandId/validate` — Run a new validation (katalyst_admin only)
  - Request body: `{ inputs, expectedOutputs, tolerances?, notes? }`
  - Response: Full comparison result + saved run ID
- `GET /api/brands/:brandId/validation-runs` — List validation history (katalyst_admin only)
- `GET /api/brands/:brandId/validation-runs/:runId` — Get a specific run's full results (katalyst_admin only)

**Service Layer:**

Create `server/services/brand-validation-service.ts` to encapsulate validation logic:
- `runBrandValidation(brand, testInputs, expectedOutputs, tolerances)` — orchestrates the complete validation pipeline
- `compareMetrics(actual, expected, tolerances)` — produces the comparison array
- Keep route handlers thin; business logic in the service

**Frontend Component Organization:**

- Tab component: `client/src/components/brand/BrandValidationTab.tsx` — main validation interface
- Sub-components within the same file or minimal split:
  - Validation form (manual input or JSON upload)
  - Comparison report table
  - Validation history list
- Hook: Use existing `useQuery`/`useMutation` patterns with `apiRequest` from `@lib/queryClient`

**Storage Interface:**

Add to `IStorage`:
- `createBrandValidationRun(run)` — insert a new validation run
- `getBrandValidationRuns(brandId)` — list runs for a brand (most recent first)
- `getBrandValidationRun(runId)` — get a single run

### UI/UX Deliverables

**Validation Tab (within Brand Detail Page):**

Add a "Validation" tab to the existing `admin-brand-detail.tsx` TabsList, positioned after "Startup Costs" and before "Settings."

**Validation Interface Layout:**

- **Top section: Run Validation**
  - Two input methods presented as a toggle: "Manual Entry" / "Upload Fixture"
  - Manual Entry: A compact form with categorized input fields (Revenue, Operating Costs, Financing, Startup Costs) for known inputs, plus corresponding expected output fields (ROI %, break-even month, Year 1 revenue, Year 1 net income, total investment)
  - Upload Fixture: A file drop zone accepting `.json` files, with a preview of the parsed fixture content
  - "Run Validation" primary button
  - Optional notes text input for the admin to label the run

- **Middle section: Comparison Report (after running)**
  - Summary banner: "15 of 17 metrics passed" with overall PASS (green badge) or FAIL (destructive badge)
  - Table with columns: Metric | Expected | Calculated | Difference | Status
  - Failing rows highlighted with destructive background
  - Currency values formatted with $ and commas, percentages with 1 decimal
  - Identity checks shown as a separate grouped section

- **Bottom section: Validation History**
  - List of previous runs as Cards, each showing: date/time, status badge (pass/fail), metrics summary, admin notes
  - Click to expand and view full comparison report
  - Most recent first

**UI States:**
- **No Configuration:** Warning card with links to parameters and startup cost tabs
- **Ready:** Validation form visible, history below (if any runs exist)
- **Running:** Button disabled with loading spinner, "Running financial engine..."
- **Results:** Comparison report displayed with pass/fail indicators
- **Error:** Clear error message if engine fails (e.g., invalid inputs)

**`data-testid` Attributes:**
- `tab-validation` — validation tab trigger
- `validation-method-toggle` — manual/upload toggle
- `validation-input-form` — manual input form container
- `validation-upload-zone` — file upload drop zone
- `button-run-validation` — run validation button
- `validation-report-summary` — summary banner with pass/fail count
- `validation-report-table` — comparison results table
- `validation-status-badge` — overall pass/fail badge
- `validation-metric-row-{metric}` — individual metric comparison row
- `validation-history-list` — validation history container
- `validation-history-item-{runId}` — individual history item
- `validation-no-config-warning` — warning when brand config incomplete
- `validation-notes-input` — notes text input
- `validation-loading` — loading state indicator

**Navigation:**
- Accessed via Brand Detail page → "Validation" tab
- Route remains `/admin/brands/:brandId` with `?tab=validation` URL parameter (matching existing tab pattern)

### Anti-Patterns & Hard Constraints

- **DO NOT** modify `shared/financial-engine.ts` — the engine is complete and tested. Validation invokes it as-is.
- **DO NOT** modify `shared/plan-initialization.ts` — use existing `buildPlanFinancialInputs()`, `buildPlanStartupCosts()`, and `unwrapForEngine()` as-is.
- **DO NOT** modify `server/services/financial-service.ts` — create a separate validation service. The existing service is for plan computation; validation is a different use case (brand-level, not plan-level).
- **DO NOT** modify files in `client/src/components/ui/` — these are shadcn primitives.
- **DO NOT** modify `vite.config.ts` or `drizzle.config.ts`.
- **DO NOT** create a separate plan to run validation — validation operates directly on brand parameters + test inputs, not on a persisted plan entity. The validation service constructs ephemeral `PlanFinancialInputs` and `StartupCostLineItem[]` for engine invocation.
- **DO NOT** expose validation endpoints to non-admin roles — all validation routes require `katalyst_admin` role.
- **DO NOT** duplicate the financial engine invocation logic — reuse `buildPlanFinancialInputs`, `unwrapForEngine`, and `calculateProjections` from existing shared modules.
- **DO NOT** store test fixture files in the filesystem — the fixture content is stored in the `brand_validation_runs` JSONB columns alongside results.

### Gotchas & Integration Warnings

- **Currency units mismatch:** `BrandParameters` stores currency as dollars (raw numbers), but the engine and `PlanFinancialInputs` store currency as cents (integers). `buildPlanFinancialInputs()` handles the conversion (multiplies by 100). Test fixture inputs should use the same unit as the engine (cents) to avoid confusion. Document this clearly in the fixture format. If the admin provides values in dollars in the manual form, convert to cents before sending to the API.

- **`buildPlanFinancialInputs` requires complete `BrandParameters`:** If brand parameters are null or incomplete, the initialization function will fail. The validation tab must check for complete parameters before enabling the "Run Validation" button.

- **Startup cost template may be empty:** `buildPlanStartupCosts` handles null/empty templates gracefully (returns empty array), but the engine needs at least some startup costs to produce meaningful ROI metrics. Warn the admin if the startup cost template is empty.

- **`unwrapForEngine` transforms PlanFinancialInputs to EngineInput:** The `EngineInput` interface has a different structure than `PlanFinancialInputs` (e.g., per-year arrays instead of single values, annual gross sales computed from monthly AUV). The test fixture expected outputs should match `EngineOutput` format, not the intermediate `EngineInput` format.

- **Identity checks may fail:** The engine includes accounting identity checks. If any fail during validation, this is itself a validation finding — show identity check results prominently in the report. A validation run where the engine produces correct numbers but fails an identity check should still be flagged.

- **Existing tests must continue passing:** `shared/financial-engine.test.ts` (33+ tests), `shared/plan-initialization.test.ts` (131+ tests), and `server/services/financial-service.test.ts` (9 tests) must all pass unchanged. The only new test file should be for the validation service itself.

- **JSON upload parsing:** The uploaded JSON fixture must be validated with Zod before processing. Invalid fixtures should produce a clear parsing error, not a server crash. Use a dedicated Zod schema for the fixture format.

- **Tab integration with existing brand detail page:** The brand detail page uses `<Tabs defaultValue={initialTab}>` with tab values from URL search params. Add `validation` as a new tab value. Import the new `BrandValidationTab` component in `admin-brand-detail.tsx`.

- **Large comparison reports:** If comparing all 60 monthly projections, the report could be verbose. Default to comparing annual summaries and ROI metrics. Offer an "expanded" view that includes monthly breakdowns as a collapsible section.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `shared/schema.ts` | MODIFY | Add `brandValidationRuns` table definition, insert schema, and types |
| `server/services/brand-validation-service.ts` | CREATE | Validation orchestration: construct ephemeral plan inputs from brand params + test fixture, run engine, compare results |
| `server/routes/brands.ts` | MODIFY | Add POST validate, GET validation-runs, GET validation-runs/:runId endpoints |
| `server/storage.ts` | MODIFY | Add `createBrandValidationRun`, `getBrandValidationRuns`, `getBrandValidationRun` to IStorage interface and DatabaseStorage implementation |
| `client/src/components/brand/BrandValidationTab.tsx` | CREATE | Validation UI: manual input form, JSON upload, comparison report table, validation history list |
| `client/src/pages/admin-brand-detail.tsx` | MODIFY | Add "Validation" tab trigger and tab content rendering BrandValidationTab |

### Dependencies & Environment Variables

**Packages — Already Installed (do not reinstall):**
- `zod` — validation of test fixture schema
- `@tanstack/react-query` — data fetching for validation runs
- `drizzle-orm` — database operations for validation run storage
- `lucide-react` — icons (CheckCircle, XCircle, Upload, FileJson)

**Packages — No new packages needed.** All required functionality is available through existing dependencies.

**Environment Variables — None required.** Validation uses the existing database and financial engine with no external service dependencies.

### References

- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Data model design, API patterns, service layer pattern
- Epics: `_bmad-output/planning-artifacts/epics.md` — Story 3.7 AC (relocated from Story 2.5), FR41 (validate brand config against known-good spreadsheet outputs)
- Financial Engine: `shared/financial-engine.ts` — `EngineInput`, `EngineOutput`, `calculateProjections()` interfaces and entry point
- Plan Initialization: `shared/plan-initialization.ts` — `buildPlanFinancialInputs()`, `buildPlanStartupCosts()`, `unwrapForEngine()` pipeline
- Financial Service: `server/services/financial-service.ts` — existing engine invocation pattern (reference, not modified)
- Brand Routes: `server/routes/brands.ts` — existing brand CRUD endpoints and route patterns
- Brand Detail Page: `client/src/pages/admin-brand-detail.tsx` — existing tab structure for brand administration
- Schema: `shared/schema.ts` — `BrandParameters`, `StartupCostTemplate`, `PlanFinancialInputs` type definitions
- Previous Story: `_bmad-output/implementation-artifacts/3-6-quick-roi-first-90-second-experience.md` — engine invocation from client-side, formatting patterns

## Dev Agent Record

### Agent Model Used
Claude 4.6 Opus (Replit Agent)

### Completion Notes
All 9 acceptance criteria implemented and verified via E2E test:
- AC1: Validation tab accessible from brand detail page with full validation interface
- AC2: Upload JSON fixture and manual entry modes implemented with toggle
- AC3: Run Validation triggers financial engine with test inputs + brand parameters, displays comparison report
- AC4: Each metric row shows name, category, expected, calculated, difference, pass/fail; tolerances configurable
- AC5: Failing rows highlighted with destructive background; summary banner shows "X of Y metrics passed" with overall pass/fail
- AC6: Validation history list shows timestamp, status badge, metric count, notes; ordered most recent first
- AC7: Expandable history items show full comparison report from that run
- AC8: Re-running after parameter changes produces fresh results against updated configuration
- AC9: Warning message with links to parameters and startup costs tabs when brand not configured

### File List
- `shared/schema.ts` — Added `brandValidationRuns` table, `ValidationMetricComparison` and `ValidationToleranceConfig` interfaces, insert schema and types
- `server/storage.ts` — Added `createBrandValidationRun`, `getBrandValidationRuns`, `getBrandValidationRun` to IStorage and DatabaseStorage
- `server/services/brand-validation-service.ts` — New: validation orchestration, engine invocation, metric comparison logic
- `server/routes/brands.ts` — Added POST validate, GET validation-runs, GET validation-runs/:runId routes
- `client/src/components/brand/BrandValidationTab.tsx` — New: validation UI with manual input, JSON upload, comparison report, and history
- `client/src/pages/admin-brand-detail.tsx` — Added Validation tab between Startup Costs and Settings
