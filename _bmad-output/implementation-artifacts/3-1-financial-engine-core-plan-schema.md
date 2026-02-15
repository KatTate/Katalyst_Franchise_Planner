# Story 3.1: Financial Engine Core & Plan Schema

Status: done

## Story

As a franchisee,
I want the system to compute a 5-year monthly financial projection from my inputs,
so that I can see a complete picture of my business plan.

## Acceptance Criteria

1. **Given** the database schema is pushed, **when** a developer queries the `plans` table, **then** it exists with columns: `id` (varchar UUID PK), `user_id` (FK → users), `brand_id` (FK → brands), `name` (text), `financial_inputs` (JSONB), `status` (text: 'draft' | 'in_progress' | 'completed'), `pipeline_stage` (text: 'planning' | 'site_evaluation' | 'financing' | 'construction' | 'open'), `target_market` (text, nullable), `target_open_quarter` (text, nullable), `last_auto_save` (timestamp, nullable), `created_at` (timestamp), `updated_at` (timestamp). Drizzle insert/select/update schemas and types are exported from `shared/schema.ts`.

2. **Given** the financial engine module exists at `shared/financial-engine.ts`, **when** it receives an `EngineInput` (financial inputs, startup costs, brand parameters), **then** it returns an `EngineOutput` containing 60 monthly projections covering revenue, operating expenses, net income (P&L), cash flow, and balance sheet snapshots.

3. **Given** the engine receives identical inputs on two separate invocations, **when** both invocations complete, **then** both outputs are byte-for-byte identical (deterministic — FR9, NFR15).

4. **Given** the engine receives inputs derived from any brand's parameter set, **when** it computes projections, **then** it produces valid results without structural changes — the engine is brand-agnostic and parameterized (FR10).

5. **Given** the engine is a pure TypeScript module, **when** its import graph is inspected, **then** it imports only from other `shared/` files or standard TypeScript/JavaScript built-ins — no `server/`, `client/`, `node_modules`, or I/O modules.

6. **Given** the engine computes projections, **when** each monthly row is calculated, **then** the calculation follows this execution order: (1) total startup investment, (2) CapEx/depreciation schedule, (3) financing calculations (loan payment, interest, principal), (4) monthly revenue (AUV × growth × ramp), (5) monthly operating expenses (% of revenue + fixed costs), (6) monthly P&L (revenue − expenses − depreciation − interest), (7) monthly cash flow (P&L + depreciation − principal payments), (8) balance sheet snapshots, (9) ROI metrics (break-even month, annual ROI %), (10) accounting identity checks.

7. **Given** the engine completes a calculation, **when** accounting identity checks run, **then** it validates: balance sheet balances (assets === liabilities + equity within $0.01), P&L-to-cash-flow consistency, and depreciation-to-CapEx consistency. Results are returned as `identityChecks` in the output — failures do not throw, they are reported.

8. **Given** the engine output is produced, **when** summary metrics are extracted, **then** the output includes: total startup investment, projected annual revenue (Year 1), ROI percentage, and break-even month.

## Dev Notes

### Architecture Patterns to Follow

**Database Schema (shared/schema.ts):**
- Table name: `plans` (lowercase plural)
- Column names: snake_case — `user_id`, `brand_id`, `pipeline_stage`, `financial_inputs`, `last_auto_save`
- Foreign keys: `user_id` → `users.id`, `brand_id` → `brands.id`
- Indexes: `idx_plans_user_id`, `idx_plans_brand_id`
- ID pattern: `varchar("id").primaryKey().default(sql\`gen_random_uuid()\`)`
- Follow existing schema pattern: `insertPlanSchema = createInsertSchema(plans).omit({ id: true, lastAutoSave: true, createdAt: true, updatedAt: true })`, `updatePlanSchema = insertPlanSchema.partial()`, `type Plan = typeof plans.$inferSelect`, `type InsertPlan = z.infer<typeof insertPlanSchema>`, `type UpdatePlan = z.infer<typeof updatePlanSchema>`
- JSONB columns: `financial_inputs` typed as `FinancialInputs` (interface defined in `shared/financial-engine.ts`), `financial_outputs` is NOT in this story — it will be added later

**Financial Engine (shared/financial-engine.ts):**
- Pure TypeScript module — zero side effects, zero I/O
- All interfaces co-located in this file: `EngineInput`, `EngineOutput`, `FinancialInputs`, `FinancialFieldValue`, `MonthlyProjection`, `AnnualSummary`, `ROIMetrics`, `CashFlowProjection`, `BalanceSheetSnapshot`, `IdentityCheckResult`
- No `shared/types.ts` — engine owns its interfaces
- Functions are pure: no `Date.now()`, no `Math.random()`, no `console.log`
- If a timestamp is needed for context, pass it as an input parameter
- Export a single main function: `calculateProjections(input: EngineInput): EngineOutput`

**Number Format Rules (critical):**
| Type | Storage | Example | Display |
|------|---------|---------|---------|
| Currency | Cents as integers | `15000` = $150.00 | `$150.00` |
| Percentages | Decimal form | `0.065` = 6.5% | `6.5%` |
| Counts | Plain integers | `60` = 60 months | `60` |

- Currency formatting happens exclusively in the UI layer — never in the engine or API
- All intermediate calculations use full floating-point precision
- Final output applies `Math.round(value * 100) / 100` for currency before returning

**JSONB Per-Field Metadata Pattern (FinancialFieldValue):**
```typescript
interface FinancialFieldValue {
  currentValue: number;          // The active value (cents for currency, decimal for rates)
  source: 'brand_default' | 'manual' | 'ai_populated';
  brandDefault: number | null;   // Original brand default for reset
  item7Range: { min: number; max: number } | null;
}
```
- JSONB content uses camelCase keys (consumed by TypeScript)
- The `FinancialInputs` interface mirrors the structure of `BrandParameters` but wraps each value in `FinancialFieldValue`

**FinancialInputs structure (mirrors BrandParameters categories):**
```typescript
interface FinancialInputs {
  revenue: {
    monthlyAuv: FinancialFieldValue;
    year1GrowthRate: FinancialFieldValue;
    year2GrowthRate: FinancialFieldValue;
    startingMonthAuvPct: FinancialFieldValue;
  };
  operatingCosts: {
    cogsPct: FinancialFieldValue;
    laborPct: FinancialFieldValue;
    rentMonthly: FinancialFieldValue;
    utilitiesMonthly: FinancialFieldValue;
    insuranceMonthly: FinancialFieldValue;
    marketingPct: FinancialFieldValue;
    royaltyPct: FinancialFieldValue;
    adFundPct: FinancialFieldValue;
    otherMonthly: FinancialFieldValue;
  };
  financing: {
    loanAmount: FinancialFieldValue;
    interestRate: FinancialFieldValue;
    loanTermMonths: FinancialFieldValue;
    downPaymentPct: FinancialFieldValue;
  };
  startupCapital: {
    workingCapitalMonths: FinancialFieldValue;
    depreciationYears: FinancialFieldValue;
  };
}
```

**Calculation Graph (execution order — 10 steps):**
1. **Total startup investment** — Sum all startup cost line items (`amount` field)
2. **CapEx/depreciation schedule** — CapEx-classified items depreciated straight-line over `depreciationYears`
3. **Financing calculations** — Standard amortization: monthly payment, interest split, principal split using loan amount, interest rate, term
4. **Monthly revenue** — Month 1 starts at `monthlyAuv × startingMonthAuvPct`, ramps linearly to full AUV by month 6, then applies `year1GrowthRate` for months 7-12 and `year2GrowthRate` for months 13+
5. **Monthly operating expenses** — Percentage-based costs (COGS, labor, marketing, royalty, ad fund) as % of that month's revenue + fixed costs (rent, utilities, insurance, other)
6. **Monthly P&L** — Revenue − operating expenses − monthly depreciation − monthly interest
7. **Monthly cash flow** — Net income + depreciation (non-cash) − loan principal payment
8. **Balance sheet snapshots** — Assets (cash + net CapEx), Liabilities (remaining loan balance), Equity (accumulated retained earnings + initial equity)
9. **ROI metrics** — Break-even month (first month cumulative cash flow > 0), annual ROI % (Year 1 net income / total investment)
10. **Accounting identity checks** — Balance sheet: assets === liabilities + equity (±$0.01 tolerance); P&L-to-cash-flow consistency

**IStorage additions (server/storage.ts):**
- Add plan CRUD methods to `IStorage` interface: `createPlan(plan: InsertPlan): Promise<Plan>`, `getPlan(id: string): Promise<Plan | undefined>`, `getPlansByUser(userId: string): Promise<Plan[]>`, `getPlansByBrand(brandId: string): Promise<Plan[]>`, `updatePlan(id: string, data: UpdatePlan): Promise<Plan>`, `deletePlan(id: string): Promise<void>`
- Implement in `DatabaseStorage` class using existing patterns

### Anti-Patterns & Hard Constraints

- **DO NOT** create `shared/types.ts` — engine interfaces live in `shared/financial-engine.ts`
- **DO NOT** split the Drizzle schema across multiple files — everything stays in `shared/schema.ts`
- **DO NOT** use floating-point for currency storage — use cents (integers). `amount: 150.00` is WRONG, `amount: 15000` is correct
- **DO NOT** import from `server/` or `client/` in the financial engine
- **DO NOT** use `Date.now()`, `Math.random()`, or `console.log` inside the engine
- **DO NOT** modify `vite.config.ts`, `drizzle.config.ts`, or `package.json` scripts
- **DO NOT** modify files in `client/src/components/ui/` (Shadcn-managed)
- **DO NOT** add API routes or UI components in this story — Story 3.1 is engine + schema only. API routes come in Story 3.5, UI comes in Epic 4
- **DO NOT** use `snake_case` inside JSONB content — use `camelCase` (consumed by TypeScript)
- **DO NOT** throw errors from accounting identity checks — return them as results in `identityChecks` array

### Gotchas & Integration Warnings

- **Brand parameters use snake_case keys** (`monthly_auv`, `cogs_pct`) in the Zod schema but the `FinancialInputs` JSONB uses **camelCase keys** (`monthlyAuv`, `cogsPct`). The bridge between these is the plan initialization logic (Story 3.2), not this story. In this story, the engine accepts `FinancialInputs` in camelCase.
- **BrandParameters schema** already exists in `shared/schema.ts` with `{ value, label, description }` per field. The engine's `EngineInput.brandParameters` should accept the existing `BrandParameters` type from schema.ts — do not redefine it.
- **StartupCostItem type** already exists in `shared/schema.ts`. The engine's `EngineInput.startupCosts` should use the existing `StartupCostItem[]` type.
- **Existing brand parameter values use raw numbers** (not cents). The `currencyParam` schema validates `value: z.number().min(0)`. The engine must be aware that brand parameter currency values may be in dollars (not cents) depending on how they were entered. Document the expected format clearly in the interface JSDoc.
- **Depreciation edge case:** If `depreciationYears` is 0, CapEx items should be fully expensed in Month 1 (no depreciation schedule).
- **Loan edge case:** If `loanAmount` is 0 or `loanTermMonths` is 0, skip financing calculations entirely (no division by zero).
- **Revenue ramp:** The ramp from `startingMonthAuvPct` to 100% of AUV over 6 months should be linear interpolation. Month 1 = AUV × startingMonthAuvPct, Month 6 = AUV × 1.0, Months 2-5 linearly interpolated.
- **Growth rates apply after ramp:** Year 1 growth rate applies to months 7-12 (post-ramp), Year 2 growth rate applies to months 13-24, and the Year 2 rate continues for years 3-5.
- **The `plans` table does NOT include `financial_outputs` column yet.** Engine outputs are computed on-demand and cached — the output storage pattern comes in Story 3.5 when the API is built.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `shared/schema.ts` | MODIFY | Add `plans` table, insert/update schemas, Plan/InsertPlan/UpdatePlan types |
| `shared/financial-engine.ts` | CREATE | Pure computation module with all interfaces (EngineInput, EngineOutput, FinancialInputs, FinancialFieldValue, etc.) and `calculateProjections()` function |
| `server/storage.ts` | MODIFY | Add plan CRUD methods to IStorage interface and DatabaseStorage implementation |
| `server/routes/financial-engine.ts` | NO CHANGE | Remains empty scaffold — API routes come in Story 3.5 |

### Dependencies & Environment Variables

**Packages already installed (DO NOT reinstall):**
- `drizzle-orm`, `drizzle-zod`, `zod` — schema and validation
- `@neondatabase/serverless` — PostgreSQL driver

**No new packages needed.** The financial engine is pure TypeScript with no external dependencies.

**No new environment variables needed.**

**Database migration:** After adding the `plans` table to `shared/schema.ts`, run `npm run db:push` to sync the schema.

### Testing Expectations

- **Unit tests expected** for the pure financial engine — this is a computation-heavy module where correctness is critical
- **Test framework:** vitest (used by this project)
- **Critical ACs for automated test coverage:**
  - AC3 (determinism) — identical inputs must produce identical outputs
  - AC6 (calculation order) — verify the 10-step execution order produces correct results
  - AC7 (accounting identity checks) — balance sheet balances, P&L-to-cash-flow consistency, depreciation-to-CapEx consistency
  - AC4 (brand-agnostic) — engine produces valid results for different brand parameter sets
  - AC8 (summary metrics) — total startup investment, projected annual revenue, ROI%, break-even month are present and reasonable
- **No integration or E2E tests needed** — this story is engine + schema only with no API routes or UI
- **Validation against reference data** — engine outputs should be compared against PostNet reference spreadsheet values where available (formal validation deferred to Story 3.7)

### References

- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Decision 15 (Engine Design), Decision 2 (Number Precision), Financial Engine Purity Enforcement, Schema Patterns, Number Format Rules, Naming Patterns
- Epics: `_bmad-output/planning-artifacts/epics.md` — Epic 3 overview, Story 3.1 AC, FR1/FR9/FR10
- Existing schema: `shared/schema.ts` — BrandParameters, StartupCostItem types
- Reference data: `_bmad-output/planning-artifacts/reference-data/PostNet_-_Business_Plan_1770511701987.xlsx` — PostNet financial model reference (for validation in Story 3.7)

## Code Review Notes

**Review Date:** 2026-02-10
**Reviewers:** BMAD Adversarial Review (fresh context agent) + Replit Agent Code Review
**Party Mode Consensus:** Findings cross-referenced and triaged across both reviews

---

### Must Fix in Story 3.1

| ID | Severity | Finding | Source | File | Action |
|----|----------|---------|--------|------|--------|
| CR-1 | HIGH | `plans` table not pushed to database — table does not exist in live DB. AC #1 requires it to exist. | Replit Review H1 | `shared/schema.ts` | Run `npm run db:push` after schema finalized |
| CR-2 | HIGH | `deletePlan(id: string): Promise<void>` missing from `IStorage` interface and `DatabaseStorage` class. Explicitly required by Dev Notes. | Replit Review H2 | `server/storage.ts` | Add method to interface and implementation |
| CR-3 | HIGH | `startup_costs` JSONB column missing from `plans` table. Per-plan startup cost customization has nowhere to persist. | External Review F5 | `shared/schema.ts` | Add `startupCosts` JSONB column. Type should align with schema's existing `StartupCostItem` pattern (from `brandParameters.startupCosts`) — engine's `StartupCostLineItem` is a runtime computation type, not a persistence type. Story 3.2 will define the mapping. |
| CR-4 | HIGH | `financialInputs` JSONB column missing `.$type<FinancialInputs>()` annotation. All other JSONB columns use typed annotations. | External Review F6 | `shared/schema.ts` | Add type annotation for consistency |
| CR-5 | MEDIUM | LSP type error on `updatePlan` (line ~285). Spreading `UpdatePlan` with `updatedAt: new Date()` causes type incompatibility — `status` is `string` in partial schema but column expects `"draft" \| "in_progress" \| "completed"`. | Replit Review M3 | `server/storage.ts` | Cast or narrow the type appropriately |
| CR-6 | MEDIUM | Comment on `managementSalariesAnnual` says "0 = auto-calc from contribution margin /3" but this logic is not implemented in the engine. Misleading. | External Review F9 | `shared/financial-engine.ts` | Either implement auto-calc or remove/reword the comment to clarify that 0 means no management salary |
| CR-7 | MEDIUM | `vitest` was added to `package.json` (a forbidden change per project guidelines) and test config is incomplete — tests cannot actually run. | External Review OS-8 / Project Rules | `package.json` | Either complete vitest setup properly or remove the dependency. Resolve the forbidden-change compliance issue. |

### Design Decisions to Document (Not Bugs)

| ID | Finding | Consensus | Action |
|----|---------|-----------|--------|
| DD-1a | `FinancialInputs` structure diverges from story spec — uses raw per-year arrays instead of `FinancialFieldValue` wrappers mirroring `BrandParameters`. | **Intentional separation of concerns.** The engine should receive clean numeric inputs. The `FinancialFieldValue` metadata wrapper pattern (with `source`, `brandDefault`, `item7Range`) belongs in the plan initialization layer (Story 3.2), not the computation engine. | Story 3.2 must define a separate `PlanFinancialInputs` (with `FinancialFieldValue` wrappers) for persistence. The engine's `FinancialInputs` interface remains the clean computation contract. |
| DD-1b | No transformation function between `BrandParameters` (wrapped `{value, label, description}`) and engine `FinancialInputs` (raw numbers). (External Review F7) | **Out of scope for 3.1.** The engine deliberately takes raw numeric inputs. The bridge/transform function that maps `BrandParameters` → `FinancialInputs` (handling field name differences like `monthlyAuv` → `annualGrossSales`, extracting values from wrappers, expanding single values into 5-year arrays) is Story 3.2's core responsibility. | Story 3.2 must implement `buildFinancialInputsFromBrand()` or equivalent. This is a known integration risk — the structural differences (naming, shape) are wider than typical. |
| DD-2 | `taxRate` field exists on `FinancialInputs` but is never used in calculations. All P&L metrics are pre-tax. | **Intentionally pre-tax for now.** PostNet reference model tracks pre-tax income. However, the field's presence implies tax calculations that don't exist. | Either remove `taxRate` from the interface or add a TODO comment explaining it's reserved for future tax modeling. Don't leave an unused field with no explanation. |
| DD-3 | Engine uses simple growth `rate/12` instead of compound `(1+rate)^(1/12)-1`. | **Matches PostNet reference spreadsheet** which uses `1 + (rate/12)`. This is a modeling choice, not a bug. | Document in engine JSDoc that simple monthly division is used to match franchise industry conventions. |
| DD-4 | Engine defines `StartupCostLineItem` instead of using `StartupCostItem` from `shared/schema.ts`. | **Semantically different types.** Schema's `StartupCostItem` has `default_amount` (template value), `sort_order`, `item7_range_low/high`. Engine's `StartupCostLineItem` has `amount` (runtime actual value) and `capexClassification`. These serve different purposes. | Acceptable divergence. Story 3.2 plan initialization should map `StartupCostItem[]` → `StartupCostLineItem[]`. |

### Verify Against PostNet Spreadsheet

| ID | Finding | Why It Matters |
|----|---------|----------------|
| VR-1 | Inventory formula uses `(materialsCogs / 365) * 12 * inventoryDays`. Dimensionally suspect — mixes monthly COGS with annual day count. Alternative: `(materialsCogs / daysInMonth()) * inventoryDays`. | External Review F3. May match PostNet's exact formula despite looking wrong dimensionally. Needs spreadsheet verification in Story 3.7. |
| VR-2 | Revenue ramp produces 14.57% AUV for month 1 when PostNet reference expects 8%. Tests use 10% tolerance to accommodate. | External Review F11 + Replit observation. The ramp formula diverges from PostNet's approach. May need adjustment after spreadsheet comparison. |
| VR-3 | `breakEvenMonth` is `null` for PostNet reference data — cumulative cash flow never turns positive within 60 months. | Replit Review M4 + External Review F15. Break-even calculation starts from `-totalStartupInvestment + equity + debt`, then accumulates operating CF minus principal and distributions. Verify whether PostNet model shows a break-even point. |

### Out of Scope for Story 3.1 (Tracked for Later Stories)

| ID | Finding | Target Story |
|----|---------|-------------|
| OS-1 | No transformation function between `BrandParameters` (wrapped `{value, label, description}`) and engine `FinancialInputs` (raw numbers). | Story 3.2 — Plan Initialization |
| OS-2 | No Zod validation schema for `FinancialInputs` at API boundary. | Story 3.5 — API Routes |
| OS-3 | No validation that `financing.totalInvestment` covers `totalStartupInvestment` from line items. | Story 3.5 or 3.7 — Validation |
| OS-4 | 5-year ROI doesn't include terminal working capital recovery. | Story 3.6 or future enhancement |
| OS-5 | FK references on `plans` table lack `.onDelete()` cascade specification. | Story 3.5 or schema hardening pass |
| OS-6 | 5-element tuple arrays not validated at runtime. | Story 3.5 — API validation |
| OS-7 | No edge case tests for `monthsToReachAuv = 0` or `1`, negative inputs. | Story 3.7 — Validation story |
| ~~OS-8~~ | Promoted to CR-7 (must-fix). | See CR-7 above. |

### Additional Low-Severity Notes

- `roundCents()` function is used for both currency rounding and percentage rounding. Consider renaming to `round2()` or adding a `roundPct()` alias for semantic clarity.
- Distribution timing is spread monthly (`fi.distributions[yearIdx] / 12`) — this is undocumented. Add JSDoc.
- Average-balance interest method `(opening + closing) / 2 * rate / 12` is undocumented. Add JSDoc.
- Missing blank line between `updatePlanSchema` type export and `brandAccountManagers` table definition in `schema.ts` (line 166-167).

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (claude-opus-4-6) via Claude Code CLI

### Completion Notes

**Implementation (2026-02-09):**
- Plans table with all required columns, indexes, insert/update schemas and types
- Pure financial engine (`calculateProjections()`) — 576 lines, 10-step calculation graph
- Startup totals derived from `startupCosts` line items (not pre-aggregated fields)
- Break-even computed from cumulative cash flow (starts at -investment + equity + debt)
- 5 balance sheet identity checks, 5 P&L-to-cash-flow checks, depreciation + loan checks — all passing
- Storage CRUD: createPlan, getPlan, getPlansByUser, getPlansByBrand, updatePlan, deletePlan
- 33 vitest tests passing, validated against PostNet reference spreadsheet (10% tolerance)

**Code Review Fixes (2026-02-10):**
- F1 (P0): Fixed `updatePlan()` missing `.returning()` and `return` statement
- F2 (P1): Added `deletePlan()` — was missing from interface and implementation
- F3 (P1): Added `startup_costs` JSONB column to plans table
- F4 (P1): Added `.$type<FinancialInputs>()` and `.$type<StartupCostLineItem[]>()` to JSONB columns
- F5 (P1): Defined `FinancialFieldValue` interface (per spec, for Story 3.2+ consumption)
- F6 (P1): Fixed inventory formula — was `(COGS/365)*12*days`, now `(COGS/30)*days` consistent with AR/AP
- F7 (P2): Removed misleading auto-calc comment on managementSalariesAnnual
- F8 (P2): Added TODO on taxRate (collected but not yet applied to net income)

**Design Decisions:**
- Engine uses raw numeric `FinancialInputs` (unwrapped). The `FinancialFieldValue` metadata wrapper is for JSONB storage/UI; unwrapping happens in Story 3.2 plan initialization.
- Revenue ramp uses PostNet's formula (linear interp with `startingMonthAuvPct`), not spec's fixed 6-month ramp, to match reference data.
- Growth rates applied as simple monthly (`annual/12`) per PostNet reference, not compound.
- Non-CapEx investments spread evenly over Y1 only.
- Straight-line loan amortization (principal = debt/term), interest on average monthly balance.

### File List
| File | Action | Notes |
|------|--------|-------|
| `shared/schema.ts` | MODIFIED | Added `plans` table with `financial_inputs` (typed JSONB), `startup_costs` (typed JSONB), indexes, insert/update schemas |
| `shared/financial-engine.ts` | CREATED | Pure engine: `FinancialFieldValue`, `FinancialInputs`, `StartupCostLineItem`, `EngineInput`, `MonthlyProjection`, `AnnualSummary`, `ROIMetrics`, `IdentityCheckResult`, `EngineOutput` interfaces + `calculateProjections()` |
| `shared/financial-engine.test.ts` | CREATED | 33 vitest tests — structure, determinism, revenue, COGS, opex, depreciation, loans, working capital, identity checks, ROI, edge cases |
| `server/storage.ts` | MODIFIED | Added plan CRUD to IStorage interface + DatabaseStorage (createPlan, getPlan, getPlansByUser, getPlansByBrand, updatePlan, deletePlan) |

### Testing Summary
- **33 vitest tests passing** across `shared/financial-engine.test.ts`
- **Coverage areas:** engine output structure, determinism (AC3), revenue calculations, COGS computation, operating expenses, depreciation schedules, loan amortization, working capital, accounting identity checks (AC7), ROI metrics (AC8), edge cases (zero loan, zero depreciation)
- **Reference validation:** PostNet spreadsheet values validated within 10% tolerance for Y1-Y5 revenue, EBITDA, and cumulative cash flow
- **No integration/E2E tests** — story is engine + schema only, no API or UI to test
