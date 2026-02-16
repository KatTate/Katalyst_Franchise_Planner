# Story 5.1: Financial Engine Extension

Status: ready-for-dev

## Story

As a developer,
I want the financial engine to compute all output sections present in the reference spreadsheet,
So that the Financial Statement views have complete data to render (FR8, FR9, FR10).

## Acceptance Criteria

1. **Given** the existing financial engine in `shared/financial-engine.ts`
   **When** the engine is extended with the missing computations
   **Then** the `FinancialInputs` interface accepts 5 new optional fields with backward-compatible defaults:
   - `ebitdaMultiple: number` (default: 3)
   - `targetPreTaxProfitPct: [number x5]` (default: [0.10, 0.10, 0.10, 0.10, 0.10])
   - `shareholderSalaryAdj: [number x5]` (default: [0, 0, 0, 0, 0], in cents)
   - `taxPaymentDelayMonths: number` (default: 1)
   - `nonCapexInvestment: [number x5]` (default: derived from startup costs — Y1 = non-capex total, Y2-5 = 0)
   **And** existing callers that do not provide these fields continue to work without changes (backward compatibility).

2. **Given** the extended engine
   **When** projections are computed
   **Then** `MonthlyProjection` includes 10 new Balance Sheet disaggregation fields:
   - `taxPayable` — estimated tax liability based on pre-tax income and tax rate, with delay for payment timing
   - `lineOfCredit` — line of credit balance (0 for MVP, structural placeholder)
   - `commonStock` — equity issuance amount (constant = equityAmount)
   - `retainedEarnings` — cumulative pre-tax income minus cumulative distributions
   - `totalCurrentAssets` — cash + accounts receivable + inventory
   - `totalAssets` — total current assets + net fixed assets
   - `totalCurrentLiabilities` — accounts payable + tax payable
   - `totalLiabilities` — total current liabilities + loan closing balance + line of credit
   - `totalEquity` — common stock + retained earnings
   - `totalLiabilitiesAndEquity` — total liabilities + total equity

3. **Given** the extended engine
   **When** projections are computed
   **Then** `MonthlyProjection` includes 17 new Cash Flow disaggregation fields:
   - **Operating:** `cfDepreciation` (add-back), `cfAccountsReceivableChange`, `cfInventoryChange`, `cfAccountsPayableChange`, `cfTaxPayableChange`, `cfNetOperatingCashFlow`
   - **Investing:** `cfCapexPurchase`, `cfNetBeforeFinancing`
   - **Financing:** `cfNotesPayable` (principal repayment), `cfLineOfCredit` (change), `cfInterestExpense`, `cfDistributions`, `cfEquityIssuance`, `cfNetFinancingCashFlow`
   - **Net:** `cfNetCashFlow`, `beginningCash`, `endingCash`
   **And** `cfNetOperatingCashFlow` equals the existing `operatingCashFlow` field (consistency check)
   **And** `cfNetCashFlow` = `cfNetBeforeFinancing` + `cfNetFinancingCashFlow`
   **And** `endingCash` for month M equals `beginningCash` for month M+1

4. **Given** the extended engine
   **When** projections are computed
   **Then** `EngineOutput` includes a new `valuation: ValuationOutput[]` array with one entry per year (5 entries), each containing 11 fields:
   - `year`, `grossSales` (= annual revenue), `netOperatingIncome` (= EBITDA)
   - `shareholderSalaryAdj` — annual shareholder salary adjustment from inputs
   - `adjNetOperatingIncome` — EBITDA minus shareholder salary adjustment
   - `adjNetOperatingIncomePct` — adjNetOperatingIncome / grossSales
   - `ebitdaMultiple` — from inputs
   - `estimatedValue` — adjNetOperatingIncome * ebitdaMultiple
   - `estimatedTaxOnSale` — estimatedValue * taxRate
   - `netAfterTaxProceeds` — estimatedValue - estimatedTaxOnSale
   - `totalCashInvested` — equityAmount (constant across years)
   - `replacementReturnRequired` — benchmark: how much annual return would be needed to replace the business income
   - `businessAnnualROIC` — adjNetOperatingIncome / totalCashInvested

5. **Given** the extended engine
   **When** projections are computed
   **Then** `EngineOutput` includes a new `roicExtended: ROICExtendedOutput[]` array with one entry per year (5 entries), each containing 15 fields:
   - `year`, `outsideCash` (equityAmount, constant), `totalLoans` (debtAmount, constant)
   - `totalCashInvested` — outsideCash + totalLoans
   - `totalSweatEquity` — cumulative shareholderSalaryAdj through this year
   - `retainedEarningsLessDistributions` — cumulative (preTaxIncome - distributions) through this year
   - `totalInvestedCapital` — totalCashInvested + totalSweatEquity + retainedEarningsLessDistributions
   - `preTaxNetIncome` — annual pre-tax income
   - `preTaxNetIncomeIncSweatEquity` — preTaxNetIncome + annual shareholderSalaryAdj
   - `taxRate` — from inputs (passthrough for display)
   - `taxesDue` — preTaxNetIncomeIncSweatEquity * taxRate (floor 0)
   - `afterTaxNetIncome` — preTaxNetIncomeIncSweatEquity - taxesDue
   - `roicPct` — afterTaxNetIncome / totalInvestedCapital (if totalInvestedCapital > 0)
   - `avgCoreCapitalPerMonth` — average monthly operating expenses (absolute value of totalOpex + directLabor)
   - `monthsOfCoreCapital` — endingCash (annual) / avgCoreCapitalPerMonth
   - `excessCoreCapital` — endingCash - (3 * avgCoreCapitalPerMonth), i.e., cash above 3-month reserve

6. **Given** the extended engine
   **When** projections are computed
   **Then** `EngineOutput` includes a new `plAnalysis: PLAnalysisOutput[]` array with one entry per year (5 entries), each containing 12+ analysis lines:
   - `adjustedPreTaxProfit` — preTaxIncome + shareholderSalaryAdj
   - `targetPreTaxProfit` — revenue * targetPreTaxProfitPct
   - `aboveBelowTarget` — adjustedPreTaxProfit - targetPreTaxProfit
   - `nonLaborGrossMargin` — grossProfit (revenue + totalCogs, no labor)
   - `totalWages` — |directLabor| + |managementSalaries|
   - `adjustedTotalWages` — totalWages - shareholderSalaryAdj
   - `salaryCapAtTarget` — (nonLaborGrossMargin - targetPreTaxProfit - |totalOpex excluding facilities and payroll|) or alternative: revenue * (1 - cogsPct - targetPreTaxProfitPct) - non-wage opex
   - `overUnderCap` — salaryCapAtTarget - adjustedTotalWages
   - `laborEfficiency` — totalWages / revenue
   - `adjustedLaborEfficiency` — adjustedTotalWages / revenue
   - `discretionaryMarketingPct` — |marketing| / revenue
   - `prTaxBenefitsPctOfWages` — |payrollTaxBenefits| / totalWages
   - `otherOpexPctOfRevenue` — |otherOpex| / revenue

7. **Given** the extended engine
   **When** projections are computed
   **Then** `identityChecks` is extended from 4 categories to 13 checks matching the reference spreadsheet Audit sheet:
   - **Balance Sheet Imbalance I** — totalAssets = totalLiabilitiesAndEquity (per year, end-of-year monthly snapshot)
   - **Balance Sheet Imbalance II** — alternative cross-check (e.g., equity = assets - liabilities)
   - **P&L Check** — grossProfit + directLabor + totalOpex + depreciation + interest = preTaxIncome (annual)
   - **Balance Sheet Check** — beginning equity + net income - distributions = ending equity (annual)
   - **Cash Flow Check I** — cfNetCashFlow = endingCash - beginningCash (per year)
   - **Cash Flow Check II** — sum of all CF categories = cfNetCashFlow (per year)
   - **Corporation Tax Check** — taxesDue computed correctly per year
   - **Working Capital Check** — AR/AP/Inventory computed consistently with revenue/COGS
   - **Debt Check** — loan balance amortization consistent with principal payments
   - **Capex Check** — total depreciation equals CapEx over depreciation period (existing)
   - **Breakeven Check** — break-even month calculation consistency
   - **ROI Check** — 5-year ROI derivation from cumulative cash flows
   - **Valuation Check** — estimatedValue = adjNetOperatingIncome * ebitdaMultiple

8. **Given** any input set (PostNet reference data, alternate brand data, zero-revenue edge case, zero-financing edge case)
   **When** `calculateProjections` is called twice with identical inputs
   **Then** the outputs are byte-for-byte identical (FR9 determinism preserved).

9. **Given** the PostNet reference input data already in the test file
   **When** the engine is run
   **Then** all existing 49 tests pass without modification (zero regressions).

10. **Given** the extended engine with new computation sections
    **When** new test cases are written
    **Then** comprehensive test coverage includes:
    - Balance sheet disaggregation: totalAssets = totalLiabilitiesAndEquity for all 5 years
    - Cash flow disaggregation: endingCash(month M) = beginningCash(month M+1), cfNetCashFlow identity
    - Valuation: estimatedValue = adjNetOperatingIncome * ebitdaMultiple
    - ROIC: totalInvestedCapital = outsideCash + totalLoans + sweatEquity + retainedEarnings
    - P&L Analysis: laborEfficiency = totalWages / revenue
    - All 13 audit checks pass for PostNet and alternate brand data
    - Edge cases: zero shareholderSalaryAdj, zero ebitdaMultiple, zero taxRate

11. **Given** the engine module
    **When** the source file is inspected
    **Then** it has zero import statements (pure TypeScript, no dependencies — AC5 from Epic 3).

## Dev Notes

### Architecture Patterns to Follow

- **Currency in cents, percentages as decimals.** All currency values are stored as integers in cents (e.g., 15000 = $150.00). All percentages are stored as decimals (e.g., 0.065 = 6.5%). This convention is established in the engine header comment and every existing computation. Do not deviate.

- **Expenses are negative values.** The engine uses a sign convention where revenue is positive, all expenses (COGS, labor, facilities, depreciation, interest) are negative. Gross profit = revenue + totalCogs (where totalCogs is negative). This is consistent throughout the existing engine and must be maintained for new fields.

- **`round2()` for all computed values.** Every computed value must be passed through the `round2()` helper to maintain sub-cent precision and normalize -0 to 0. The function rounds to 2 decimal places (which for cents means sub-cent accuracy). This prevents cumulative rounding drift across 60 months.

- **Per-year arrays are 5-element tuples: `[number, number, number, number, number]`.** This is the established pattern for all per-year inputs (cogsPct, laborPct, growthRates, distributions, etc.). New per-year inputs must follow the same pattern.

- **yearIndex(m) returns 0-4, monthInYear(m) returns 1-12.** Use these existing helpers for all year/month calculations. Do not reimplement.

- **`EngineOutput` is the single return type.** All new output sections (valuation, roicExtended, plAnalysis) are added as new fields on the existing `EngineOutput` interface. Do not create separate functions or separate return types.

- **New inputs must be optional with defaults.** Add new fields to `FinancialInputs` as optional properties (using `?:` syntax). At the top of `calculateProjections`, resolve defaults so the computation body can treat them as required. This preserves backward compatibility — existing callers that don't provide the new fields get sensible defaults.

- **Default resolution pattern:**
  ```typescript
  const ebitdaMultiple = fi.ebitdaMultiple ?? 3;
  const targetPreTaxProfitPct = fi.targetPreTaxProfitPct ?? [0.10, 0.10, 0.10, 0.10, 0.10];
  const shareholderSalaryAdj = fi.shareholderSalaryAdj ?? [0, 0, 0, 0, 0];
  const taxPaymentDelayMonths = fi.taxPaymentDelayMonths ?? 1;
  ```

- **MonthlyProjection is a flat interface.** Add new fields directly to the existing `MonthlyProjection` interface. Do not nest objects. The flat structure is consistent with the existing 30+ fields and simplifies consumption by downstream views.

- **Annual summaries recompute from monthly data.** The `annualSummaries` loop aggregates monthly values using `.reduce()` and `.filter()`. New annual-level computations follow this same pattern.

- **Identity checks use `IdentityCheckResult` interface.** New audit checks use the same interface with `name`, `passed`, `expected`, `actual`, `tolerance` fields. The tolerance is 1 cent.

### Anti-Patterns & Hard Constraints

- **DO NOT add import statements.** The engine file has zero imports. This is verified by AC5 test ("Module Purity") and is a fundamental architectural constraint. All types are defined inline. All computation is self-contained.

- **DO NOT modify existing computation logic.** The existing revenue ramp-up, COGS, operating expenses, EBITDA, depreciation, interest, debt amortization, working capital, and operating cash flow computations are correct and tested. The extension is ADDITIVE — new fields computed from existing values, not modifications to existing calculations.

- **DO NOT break the existing `MonthlyProjection` push.** The existing `monthly.push({...})` call populates ~30 fields. Add new fields to this same push call. Do not create separate arrays or post-processing passes for fields that can be computed in the main loop.

- **DO NOT use `Date`, `Math.random()`, `console.log()`, or any side effects.** The engine is a pure function. No I/O, no randomness, no external state, no logging.

- **DO NOT modify existing interface fields.** The `MonthlyProjection`, `AnnualSummary`, `ROIMetrics`, and `IdentityCheckResult` interfaces have existing consumers. Add new fields; never rename, remove, or change the type of existing fields.

- **DO NOT modify existing test expectations.** The 49 existing tests validate specific numeric values and structural properties. New computation must not change any existing computed value. If a new field's computation reuses an existing intermediate, compute it separately rather than modifying the existing chain.

- **DO NOT create separate files.** All engine code stays in `shared/financial-engine.ts`. All engine tests stay in `shared/financial-engine.test.ts`. This is a single-module pure computation unit.

- **DO NOT use `as any` type casts.** The engine is fully typed. New interfaces and computations must be type-safe.

### Gotchas & Integration Warnings

- **`nonCapexInvestment` per-year vs current Year-1-only behavior.** The existing engine spreads `nonCapexTotal` over Year 1 only (line ~363: `yi === 0`). The new optional `nonCapexInvestment` per-year array allows spreading non-capex across multiple years. When the new field is NOT provided, default behavior must match existing: `[nonCapexTotal, 0, 0, 0, 0]`. When it IS provided, use the per-year values. This is the ONE area where new inputs change existing computation — handle the default carefully to preserve backward compatibility.

- **Retained earnings must be tracked cumulatively in the monthly loop.** The existing engine tracks `cumulativeRetainedEarnings` only in the annual summary loop (line ~461). For monthly Balance Sheet `retainedEarnings` field, you'll need a running cumulative in the monthly loop. Initialize it and accumulate `preTaxIncome - monthlyDistribution` each month.

- **Cash balance must be tracked monthly for Cash Flow disaggregation.** The existing engine computes `cumulativeCash` only in the annual summary loop. For monthly `beginningCash` and `endingCash`, you'll need a running cash balance in the monthly loop. Initialize with the startup cash inflows (equity + debt - totalStartupInvestment), then accumulate monthly net cash flow.

- **Tax payable timing creates a delayed liability.** `taxPaymentDelayMonths` means that taxes computed in month M appear as a balance sheet liability until month M + taxPaymentDelayMonths. For MVP simplicity, a reasonable approach is: tax payable = preTaxIncome * taxRate accumulated monthly, with quarterly or annual payment clearing. The exact mechanism should match what makes the Balance Sheet balance.

- **Valuation section uses pre-tax income adjustments, not post-tax.** The reference spreadsheet's Valuation sheet shows "Net Operating Income" as EBITDA (not net income). The shareholder salary adjustment is subtracted from EBITDA to get "Adjusted Net Operating Income." Verify field naming matches the spreadsheet.

- **ROIC section introduces post-tax calculations.** The ROIC section is the ONLY place in the engine that applies `taxRate`. The main P&L remains pre-tax. `afterTaxNetIncome` in ROIC = `preTaxNetIncomeIncSweatEquity * (1 - taxRate)`, floored at 0.

- **Audit checks: 13 checks but some are per-year.** The existing engine creates per-year identity checks (5 balance sheet checks, 5 P&L-to-CF checks = 10 entries + 1 depreciation + 1 loan). With 13 check TYPES and some per-year, the total number of `IdentityCheckResult` entries will be >13. This is correct — the "13 checks" refers to 13 check categories.

- **`lineOfCredit` is 0 for MVP.** The reference spreadsheet has a Line of Credit row but PostNet and other references show it as 0. Include the field as a structural placeholder computed as 0. This allows the Balance Sheet view to render the row even though the value is always 0.

- **The existing `operatingCashFlow` field must remain unchanged.** The new `cfNetOperatingCashFlow` should equal `operatingCashFlow` for consistency. This is an identity check, not a replacement. Both fields coexist.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `shared/financial-engine.ts` | MODIFY | Add new optional inputs to `FinancialInputs`, extend `MonthlyProjection` with BS/CF fields, add `ValuationOutput` + `ROICExtendedOutput` + `PLAnalysisOutput` interfaces, extend `EngineOutput`, implement computations in main loop + new post-loop sections, extend audit checks to 13 categories |
| `shared/financial-engine.test.ts` | MODIFY | Add comprehensive test suites for all new computation sections. Existing 49 tests must pass without modification. |

### Testing Expectations

- **Unit tests only** — this is a pure computation module with no UI, no API, no database.
- **Test framework:** Vitest (already configured, existing tests in `shared/financial-engine.test.ts`).
- **Regression safety:** Run all existing 49 tests first. If any fail, stop and investigate before proceeding.
- **New test coverage targets:**
  - Balance Sheet disaggregation identity: totalAssets = totalLiabilitiesAndEquity for every year
  - Cash Flow disaggregation identity: beginningCash(M+1) = endingCash(M) for every month
  - Valuation arithmetic: estimatedValue = adjNOI * multiple
  - ROIC capital accumulation: totalInvestedCapital composition
  - P&L analysis: labor efficiency ratios
  - All 13 audit check categories pass for PostNet input data
  - All 13 audit check categories pass for alternate brand input data
  - Edge cases: zero shareholder salary adj, zero EBITDA multiple, zero tax rate, zero revenue
  - Determinism: new outputs included in byte-for-byte comparison
- **Test against reference data:** The PostNet input data already defined in the test file (`postNetInputs`, `postNetStartupCosts`) is the primary verification source. Alternate brand data (`altBrandInputs`, `altStartupCosts`) provides secondary verification.

### Dependencies & Environment Variables

- **No new packages needed.** The engine has zero dependencies.
- **No environment variables.** The engine is a pure function.
- **No database changes.** This is a shared/ module only.

### References

- `shared/financial-engine.ts` — Current engine implementation (644 lines, 4 identity check categories, 49 tests)
- `_bmad-output/planning-artifacts/sprint-change-proposal-2026-02-15.md` § CP-2 — Complete field specification for engine extension
- `_bmad-output/planning-artifacts/architecture.md` § Engine Extension Design — Interface definitions for new output sections
- `_bmad-output/planning-artifacts/epics.md` § Story 5.1 — Acceptance criteria and dev notes
- `_bmad-output/planning-artifacts/ux-financial-statements-spec.md` — UX spec that will consume engine output (context for field naming)
- `_bmad-output/implementation-artifacts/epic-4-retrospective.md` — Codebase health baseline (zero LSP errors, zero tech debt markers)

## Dev Agent Record

### Agent Model Used

### Completion Notes

### File List

### Testing Summary
