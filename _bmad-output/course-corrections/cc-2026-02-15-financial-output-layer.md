# Course Correction Proposal: Financial Statement Output Layer & Spreadsheet Parity

**Date:** 2026-02-15
**Trigger:** Brainstorming session gap analysis — product's core deliverable (financial statements + PDF package) has zero UI implementation
**Severity:** Critical — blocks product's reason for existing
**Scope:** PRD functional requirements, epic plan, engine extensions, UI output layer

---

## 1. Problem Statement

The reference spreadsheets (PostNet, Jeremiah's Italian Ice, Tint World, Ubreakifix) define exactly what this product replaces. All four brands share an identical 12-sheet structure:

| # | Sheet | Purpose |
|---|-------|---------|
| 1 | Start Here! | Welcome / intro video link |
| 2 | Glossary | Term definitions and benchmarks |
| 3 | **Input Assumptions** | All editable inputs organized by category with per-year (Y1-Y5) columns |
| 4 | **Summary Financials** | Annual P&L summary, balance sheet summary, cash flow, working capital, breakeven |
| 5 | **P&L Statement** | Full profit & loss with 60 monthly columns + 5 annual summaries |
| 6 | **Balance Sheet** | Full balance sheet with 60 monthly columns + 5 annual summaries |
| 7 | **Cash Flow Statement** | Full cash flow with 60 monthly columns + 5 annual summaries |
| 8 | **Returns on Invested Capital** | ROIC calculation with invested capital, after-tax income, core capital metrics |
| 9 | **Valuation** | EBITDA multiple valuation, estimated value, net proceeds |
| 10 | Model | Internal computation engine (60-month calculations) |
| 11 | **Audit** | 13 integrity checks across all sheets |
| 12 | Feedback & Support | Contact information |

**What we built:** An input collection tool (Forms + Quick Entry) that feeds a financial engine computing 60-month projections. The engine outputs data to 5 summary cards and 2 charts. **No financial statement views exist.** No P&L table, no balance sheet table, no cash flow table, no ROIC, no valuation, no PDF generation.

**What we should have built:** The spreadsheet itself — turned into interactive software. Every sheet above (3-9, 11) should be a view in the application.

---

## 2. Gap Analysis: Spreadsheet → Engine → UI

### 2.1 Input Assumptions (Sheet 3 → Engine → UI)

**Spreadsheet inputs with per-year (Y1-Y5) columns:**

| Input Field | Engine (`FinancialInputs`) | UI (`PlanFinancialInputs`) | Gap |
|-------------|---------------------------|---------------------------|-----|
| AUV / Gross Sales | `annualGrossSales` (single) | `monthlyAuv` (single) | OK — single value correct |
| Months to AUV | `monthsToReachAuv` (single) | `year1GrowthRate` (misnamed) | OK structurally |
| Starting Month AUV % | `startingMonthAuvPct` | `startingMonthAuvPct` | OK |
| Corporation Tax | `taxRate` | — | **Collected but not in UI inputs** |
| **EBITDA Multiple** | — | — | **MISSING from engine and UI** |
| Annual Growth Rate Y1-Y5 | `growthRates[5]` ✓ | `year1GrowthRate`, `year2GrowthRate` only | **UI exposes only 2 of 5 years** |
| Royalty Fee Y1-Y5 | `royaltyPct[5]` ✓ | `royaltyPct` (single) | **UI loses per-year granularity** |
| Ad Fund Y1-Y5 | `adFundPct[5]` ✓ | `adFundPct` (single) | **UI loses per-year granularity** |
| Materials COGS Y1-Y5 | `cogsPct[5]` ✓ | `cogsPct` (single) | **UI loses per-year granularity** |
| Direct Labor Y1-Y5 | `laborPct[5]` ✓ | `laborPct` (single) | **UI loses per-year granularity** |
| Facilities Y1-Y5 ($) | `facilitiesAnnual[5]` ✓ | `rentMonthly + utilitiesMonthly + insuranceMonthly` | **UI splits into 3 fields; spreadsheet has 1. Per-year lost** |
| Marketing Y1-Y5 | `marketingPct[5]` ✓ | `marketingPct` (single) | **UI loses per-year granularity** |
| Mgmt & Admin Salaries Y1-Y5 ($) | `managementSalariesAnnual[5]` ✓ | — | **MISSING from UI entirely** |
| Payroll Tax & Benefits Y1-Y5 | `payrollTaxPct[5]` ✓ | — | **MISSING from UI entirely** |
| Other Opex Y1-Y5 (% of revenue) | `otherOpexPct[5]` ✓ | `otherMonthly` (flat $) | **UI uses wrong unit ($ vs %) and loses per-year** |
| **Target Pre-tax Profit Y1-Y5** | — | — | **MISSING from engine and UI** |
| **Shareholder Salary Adj Y1-Y5** | — | — | **MISSING from engine and UI** |
| Total Investment | Derived from `startupCosts` | Via startup costs | OK |
| CapEx / Non-CapEx / Working Capital | `startupCosts` classification | Startup cost builder | OK |
| Equity / Cash Injection | `equityPct * totalInvestment` | `downPaymentPct` | OK |
| Debt / Term / Rate | `interestRate`, `termMonths` | `loanAmount`, `interestRate`, `loanTermMonths` | OK |
| Distributions Y1-Y5 | `distributions[5]` ✓ | — | **MISSING from UI** |
| AR Days | `arDays` ✓ | — | **MISSING from UI** (engine has it) |
| AP Days (Materials) | `apDays` ✓ | — | **MISSING from UI** (engine has it) |
| Inventory Days | `inventoryDays` ✓ | — | **MISSING from UI** (engine has it) |
| Depreciation Rate | `depreciationRate` ✓ | `depreciationYears` | OK (inverted) |
| **Tax Payment Delay** | — | — | **MISSING from engine and UI** |
| **Start of Business Operations** | — | — | **MISSING (metadata)** |
| **Financial Year End** | — | — | **MISSING (metadata)** |
| **Company Name** | — | — | **MISSING (metadata)** |

**Summary:**
- **Engine has per-year arrays** for 10 operating cost categories — correct
- **UI wraps them as single values**, losing per-year granularity entirely
- **5 input fields completely missing** from both engine and UI: EBITDA Multiple, Target Pre-tax Profit, Shareholder Salary Adjustment, Tax Payment Delay, Company Name/Start Date/FY End
- **5 input fields missing from UI** but present in engine: distributions, AR days, AP days, inventory days, management salaries, payroll tax
- **UI field structure diverges** from spreadsheet: Facilities split into rent/utilities/insurance; Other Opex uses $ instead of % of revenue

### 2.2 Output Sheets (Sheets 4-9, 11 → Engine → UI)

| Sheet | Engine Output | UI View | Gap |
|-------|--------------|---------|-----|
| **Summary Financials** | `annualSummaries` (partial) | 5 metric cards + 2 charts | **No tabular summary. Missing: labor efficiency ratios, salary cap analysis, working capital detail, debt schedule, capex schedule, breakeven date** |
| **P&L Statement** | `monthlyProjections` (most P&L lines) | **NONE** | **No P&L table exists in UI. Missing engine lines: adj pre-tax, target profit comparison, salary cap, labor efficiency, discretionary marketing %** |
| **Balance Sheet** | `monthlyProjections` (partial BS) | **NONE** | **No balance sheet table. Missing engine lines: tax payable, credit card payable, line of credit, common stock, other assets, core capital metrics** |
| **Cash Flow Statement** | `monthlyProjections` (partial CF) | **NONE** | **No cash flow table. Missing engine lines: inventory changes, other assets changes, AP changes, tax payable changes, LOC draws/repayments, distributions, equity issuance as separate items** |
| **Returns on Invested Capital** | `roiMetrics` (minimal) | **NONE** | **No ROIC view. Engine has only breakEvenMonth + 5yr ROI. Missing: full ROIC calc, sweat equity, after-tax income, months of core capital, excess core capital** |
| **Valuation** | — | **NONE** | **Entire sheet MISSING from engine. EBITDA multiple valuation, estimated value, net after-tax proceeds, replacement return** |
| **Audit** | `identityChecks` (4 checks) | **NONE** | **No audit view. Engine has 4 checks. Spreadsheet has 13: BS Imbalance I & II, P&L, BS, CF I & II, Corp Tax, Working Capital, Debt, Capex, Breakeven, ROI, Valuation** |

### 2.3 Glossary (Sheet 2)

The spreadsheet includes a Glossary sheet with term definitions and benchmarks for each financial metric. This serves as inline help / education. No equivalent exists in the application.

---

## 3. Change Proposals

### CP-1: Add Missing Functional Requirements to PRD

**Artifact:** `_bmad-output/planning-artifacts/prd.md`
**Section:** Functional Requirements — §1. Financial Planning & Calculation

Add FRs for the missing input fields and output views:

```
FR7a: Franchisee can view complete P&L Statement as tabular financial document 
      with 60 monthly columns organized by year (matching reference spreadsheet 
      "P&L Statement" sheet), showing all revenue, COGS, gross profit, operating 
      expense, EBITDA, depreciation, interest, and pre-tax income line items

FR7b: Franchisee can view complete Balance Sheet as tabular financial document 
      with 60 monthly columns (matching "Balance Sheet" sheet), showing current 
      assets, fixed assets, liabilities, and equity sections

FR7c: Franchisee can view complete Cash Flow Statement as tabular financial 
      document with 60 monthly columns (matching "Cash Flow Statement" sheet), 
      showing operating, investing, and financing cash flows

FR7d: Franchisee can view Summary Financials page with annual P&L summary, 
      balance sheet summary, cash flow, working capital, debt schedule, capex 
      schedule, and breakeven analysis (matching "Summary Financials" sheet)

FR7e: Franchisee can view Returns on Invested Capital (ROIC) analysis showing 
      invested capital composition, after-tax income, ROIC percentage, and core 
      capital metrics (matching "Returns on Invested Capital" sheet)

FR7f: Franchisee can view Valuation analysis showing EBITDA-multiple valuation, 
      estimated business value, after-tax proceeds, and replacement return 
      (matching "Valuation" sheet)

FR7g: Franchisee can view Audit/integrity check results showing pass/fail 
      status for all financial statement cross-checks (matching "Audit" sheet)

FR7h: In Quick Entry mode, franchisee can edit input values directly within 
      financial statement views — input cells are editable inline while computed 
      cells update in real-time

FR7i: All input assumptions support per-year (Year 1 through Year 5) values 
      matching the reference spreadsheet column structure, enabling growth 
      trajectory modeling

FR7j: Input Assumptions include: EBITDA Multiple, Target Pre-tax Profit (Y1-Y5),
      Shareholder Salary Adjustment (Y1-Y5), Distributions (Y1-Y5), AR Days, 
      AP Days, Inventory Days, Tax Payment Delay, Company Name, Start Date, 
      and Financial Year End — matching all fields in the reference spreadsheet 
      Input Assumptions sheet

FR7k: Application includes a Glossary page with financial term definitions and 
      benchmarks matching the reference spreadsheet Glossary sheet
```

### CP-2: Extend Financial Engine — Missing Computations

**Artifact:** `shared/financial-engine.ts`

The engine currently computes most P&L line items but is missing several output categories entirely. Required additions:

**A. New Engine Inputs:**
- `ebitdaMultiple: number` — for valuation calculations
- `targetPreTaxProfitPct: [number, number, number, number, number]` — for salary cap / labor efficiency analysis
- `shareholderSalaryAdj: [number, number, number, number, number]` — for adjusted pre-tax profit
- `taxPaymentDelayMonths: number` — for tax payable timing on balance sheet
- `nonCapexInvestment: [number, number, number, number, number]` — per-year non-capex (currently hardcoded from startup costs)

**B. New Engine Outputs — Monthly:**
- `taxPayable: number` — balance sheet: taxes owed but not yet paid
- `lineOfCredit: number` — balance sheet: LOC balance
- `commonStock: number` — balance sheet: equity injection
- `retainedEarnings: number` — balance sheet: cumulative P&L minus distributions
- `totalCurrentAssets: number` — subtotal
- `totalAssets: number` — subtotal
- `totalCurrentLiabilities: number` — subtotal
- `totalLiabilities: number` — subtotal
- `totalEquity: number` — subtotal
- `totalLiabilitiesAndEquity: number` — must equal totalAssets
- Cash flow disaggregation:
  - `cfAccountsReceivableChange: number`
  - `cfInventoryChange: number`
  - `cfOtherAssetsChange: number`
  - `cfAccountsPayableChange: number`
  - `cfTaxPayableChange: number`
  - `cfNetOperatingCashFlow: number` (subtotal)
  - `cfCapexPurchase: number`
  - `cfNetBeforeFinancing: number` (subtotal)
  - `cfNotesPayable: number`
  - `cfLineOfCredit: number`
  - `cfInterestExpense: number`
  - `cfDistributions: number`
  - `cfEquityIssuance: number`
  - `cfNetFinancingCashFlow: number` (subtotal)
  - `cfNetCashFlow: number`
  - `beginningCash: number`
  - `endingCash: number`

**C. New Engine Output Sections:**
- `ValuationOutput` — EBITDA multiple valuation per year:
  - grossSales, netOperatingIncome, shareholderSalaryAdj, adjNetOperatingIncome
  - adjNetOperatingIncomePct, equityInvestedCapital, estimatedValue
  - estimatedTaxesOnSale, netAfterTaxProceeds, replacementReturnRequired, businessAnnualROIC

- `ROICOutput` (extended) — per year:
  - outsideCash (equity), totalLoans (debt), totalCashInvested
  - totalSweatEquity, retainedEarningsLessDistributions, totalInvestedCapital
  - preTaxNetIncome, preTaxNetIncomeIncSweatEquity
  - taxRate, taxesDue, afterTaxNetIncome, roicPct
  - avgCoreCapitalPerMonth, monthsOfCoreCapital, excessCoreCapital

- `AuditChecks` (extended) — 13 checks matching spreadsheet:
  - Balance Sheet Imbalance Check I & II
  - Profit & Loss Check
  - Balance Sheet Check
  - Cash Flow Check I & II
  - Corporation Tax Check
  - Working Capital Check
  - Debt Check
  - Capex Check
  - Breakeven Check
  - ROI Check
  - Valuation Check

**D. P&L Analysis Lines (computed, not new inputs):**
- Adjusted Pre-tax Profit (pre-tax + shareholder salary adj)
- Target Pre-tax Profit (target % × revenue)
- Above/(Below) Target
- Non-Labor Gross Margin
- Total Wages, Adjusted Total Wages
- Salary Cap @ target %
- (Over)/Under Cap
- Labor Efficiency (NLGM / Wages)
- Adjusted Labor Efficiency
- Discretionary Marketing as % of Revenue
- PR Taxes & Benefits as % of All Wages
- Other OpEx as % of Revenue

### CP-3: Fix PlanFinancialInputs → FinancialInputs Translation Layer

**Artifact:** `PlanFinancialInputs` interface in `shared/financial-engine.ts`, plan initialization in `server/routes.ts` or `server/storage.ts`

The `PlanFinancialInputs` interface (UI-facing) wraps fields as single values, but the engine's `FinancialInputs` interface accepts per-year arrays. The translation layer currently broadcasts single values across all 5 years. This needs to change:

**Current:** `cogsPct: FinancialFieldValue` (single value → broadcast to `[v, v, v, v, v]`)
**Required:** `cogsPct: [FinancialFieldValue, FinancialFieldValue, FinancialFieldValue, FinancialFieldValue, FinancialFieldValue]` or equivalent per-year structure

All per-year fields must support independent Year 1-5 values in the UI layer.

Additionally, `PlanFinancialInputs` currently splits "Facilities" into `rentMonthly`, `utilitiesMonthly`, `insuranceMonthly`. The spreadsheet has a single "Facilities ($)" field per year. The engine has `facilitiesAnnual[5]`. The UI should match the spreadsheet structure (single Facilities field per year), not the current 3-field split.

### CP-4: New Epic — Financial Statement Views & Output Layer

**Artifact:** `_bmad-output/planning-artifacts/epics.md`
**Position:** Epic 5 (immediately after current Epic 4)

This is the highest-leverage work. The engine already computes most of this data. These stories render it.

```
Epic 5: Financial Statement Views & Output Layer

The plan builder renders every output sheet from the reference spreadsheet as 
interactive tabular views. Each view matches the reference spreadsheet's line 
items, column structure (60 monthly columns organized by year + 5 annual summary 
columns), and formatting conventions. Financial statement views are read-only in 
Forms mode; in Quick Entry mode, input cells within these statements are directly 
editable.

FRs covered: FR7a, FR7b, FR7c, FR7d, FR7e, FR7f, FR7g, FR7h, FR7k
Dependencies: Epic 3 (financial engine), Epic 4 (planning workspace)

### Story 5.1: P&L Statement View

As a franchisee,
I want to see my complete P&L statement matching the reference spreadsheet's 
"P&L Statement" sheet,
So that I can see how my assumptions flow through to profitability.

Acceptance Criteria:
- P&L renders as a tabular financial document
- Columns: 60 monthly columns organized by year + 5 annual summary columns
- Row sections matching spreadsheet: Revenue Growth, Revenue, Cost of Goods Sold 
  (Materials, Royalties, Ad Fund), Total COGS, Gross Profit, Gross Profit %, 
  Direct Labor, Direct LER, Contribution Margin, Operating Expenses (Facilities, 
  Marketing, Labor Mgmt & Admin, Payroll Tax & Benefits, Other OpEx, Non-CapEx), 
  Total OpEx, Net Operating Income, Depreciation, Interest, Pre-tax Net Income
- Analysis section: Adj Pre-tax Profit, Target Pre-tax Profit, Above/Below Target,
  Salary Cap, Labor Efficiency, Discretionary Marketing %
- Section headers visually distinguish input-driven vs computed rows
- Horizontal scrolling with frozen row labels (first column sticky)
- Year headers group monthly columns
- Currency formatting consistent throughout ($X,XXX)
- Percentage rows formatted as X.X%

### Story 5.2: Balance Sheet View

As a franchisee,
I want to see my complete Balance Sheet matching the reference spreadsheet,
So that I can understand my asset and liability position month by month.

Acceptance Criteria:
- Balance sheet renders as tabular financial document
- Columns: 60 monthly + 5 annual summaries
- Sections matching spreadsheet: 
  - ASSETS: Current Assets (Cash, AR, Other Current Assets, Total Current), 
    Fixed Assets (Equipment, Accum Depreciation, Net Book Value), 
    Other Assets, Total Assets
  - LIABILITIES AND EQUITY: Current Liabilities (AP, Tax Payable, 
    Credit Card Payable, LOC, Total Current), Long-term Liabilities 
    (Notes Payable, Total Long-term), Total Liabilities, 
    Capital (Common Stock, Retained Earnings, Total Capital), 
    Total Liabilities and Equity
- Balance sheet identity check: Total Assets = Total Liabilities + Equity 
  (visually indicated with check/error icon per column)
- Core Capital metrics section: Core Capital target levels, Months of 
  Core Capital, Excess Core Capital
- AR DSO and AP % of COGS displayed

### Story 5.3: Cash Flow Statement View

As a franchisee,
I want to see my complete Cash Flow Statement matching the reference spreadsheet,
So that I can understand where cash comes from and where it goes.

Acceptance Criteria:
- Cash flow renders as tabular financial document
- Columns: 60 monthly + 5 annual summaries
- Sections matching spreadsheet:
  - Cash Flows from Operations: Net Income, Add Back Depreciation,
    Changes in AR/Other Current Assets/Other Assets/AP/Tax Payable,
    Net Cash Flows from Operations
  - Cash Flows from Investing: Purchase of Fixed Assets,
    Net Cash Flows Before Financing
  - Cash Flows from Financing: Notes Payable, Line of Credit,
    Interest Expense, Distributions, Equity Issuance,
    Net Cash Flows from Financing
  - Net Cash Flows, Beginning Cash, Ending Cash
  - Check row, LOC Balance, Base Cash Balance,
    Cash Available to Pay on Line, Cash Needed to Draw on Line
- Cash flow check: Ending Cash = Beginning Cash + Net Cash Flows 
  (visually indicated)

### Story 5.4: Summary Financials View

As a franchisee,
I want to see a Summary Financials page matching the reference spreadsheet,
So that I can quickly assess my business plan across all 5 years.

Acceptance Criteria:
- Summary displays annual columns (Year 1-5) only (not monthly)
- Sections matching spreadsheet:
  - P&L Summary: Revenue, Cost of Sales, COGS %, Gross Profit, GP %,
    Direct Labor, DL %, Contribution Margin %, Total OpEx, OpEx %,
    EBITDA, EBITDA %, D&A, Interest, Net PBT, Net PBT %,
    Adj Net PBT, Adj Net PBT %
  - Labor Efficiency: Direct LER, Admin LER Forecasted/Benchmark/Difference,
    Adj Total LER Actual/Benchmark/Difference, Salary Cap, Over/Under Cap
  - Balance Sheet: Assets (of which Cash), Liabilities, Total Net Assets,
    Total Liabilities & Equity, (of which Retained Earnings)
  - Cash Flow: Closing Cash Balance
  - Working Capital: AR Closing, AP Closing, Inventory Closing
  - Debt: Closing Balance, Interest Expense
  - Capital Expenditure: Total Expenditure, Total Depreciation, 
    Total Net Book Value
  - Breakeven Analysis: Breakeven date

### Story 5.5: Returns on Invested Capital (ROIC) View

As a franchisee,
I want to see my ROIC analysis matching the reference spreadsheet,
So that I can understand my return on the capital I've invested.

Acceptance Criteria:
- ROIC renders as tabular view with annual columns (Year 1-5)
- Rows matching spreadsheet: Invested Capital section (Outside Cash/Equity,
  Total Loans/Debt, Total Cash Invested, Total Sweat Equity, 
  Retained Earnings less Distributions, Total Invested Capital),
  Pre-Tax Net Income, Pre-Tax including Sweat Equity, Tax Rate,
  Taxes Due, After Tax Net Income, ROIC %,
  Average Core Capital per Month, Months of Core Capital,
  Excess Core Capital
- Explanation column with contextual help for each metric

### Story 5.6: Valuation View

As a franchisee,
I want to see a business valuation analysis matching the reference spreadsheet,
So that I can understand what my franchise could be worth.

Acceptance Criteria:
- Valuation renders as tabular view with annual columns (Year 1-5)
- Rows matching spreadsheet: EBITDA Multiple, Gross Sales, 
  Net Operating Income, Shareholder Salary Adjustment,
  Adj Net Operating Income, Adj Net Operating Income % of Revenue,
  Equity (invested capital), Estimated Value, 
  Estimated Taxes on Sale (21%), Net After-Tax Proceeds,
  Replacement Return Required, Business Annual ROIC
- Explanation column with contextual help

### Story 5.7: Audit / Integrity Checks View

As a franchisee,
I want to see the results of all financial statement integrity checks,
So that I can trust the accuracy of my projections.

Acceptance Criteria:
- Audit view shows all 13 checks matching spreadsheet:
  Balance Sheet Imbalance I & II, P&L Check, Balance Sheet Check,
  Cash Flow Check I & II, Corporation Tax Check, Working Capital Check,
  Debt Check, Capex Check, Breakeven Check, ROI Check, Valuation Check
- Each check shows: name, status (pass/fail/warning), expected value, 
  actual value, tolerance
- Visual summary: X of 13 checks passing
- Failed checks highlighted with explanation of what's wrong

### Story 5.8: Glossary & Financial Term Reference

As a franchisee,
I want access to a glossary of financial terms and benchmarks,
So that I can understand what each metric means and how it's calculated.

Acceptance Criteria:
- Glossary page or sidebar panel accessible from any financial statement view
- Terms matching spreadsheet Glossary sheet: Payback Period, EBITDA, 
  Adj Net PBT, Shareholder Salary Adjustment, EBITDA Multiple, AUV,
  Direct Labor Cost, Facilities, Equity Cash, Core Capital,
  Estimated Distributions, ROIC, Breakeven, Number of Months to Breakeven,
  Cash Flow
- Each term includes: definition, calculation method, benchmark value 
  (where applicable from brand parameters)

### Story 5.9: Quick Entry as Interactive Financial Statements

As an experienced franchisee (Jordan persona),
I want to edit input values directly within the P&L and financial statement 
views where input cells are editable and computed cells update live,
So that I work inside the financial document I already understand.

Acceptance Criteria:
- In Quick Entry mode, cells that correspond to input assumptions are 
  editable directly in the P&L/Balance Sheet/Cash Flow views
- Editable cells are visually distinguished from computed cells (e.g., 
  light blue background like Excel input cells)
- Editing a cell immediately triggers engine recalculation and updates 
  all dependent computed cells
- Tab navigation moves between editable cells in logical order
- Changes auto-save with same 2-second debounce as existing input modes
- Per-year values are editable in their respective monthly columns
```

### CP-5: Separate Document Generation from Scenario Modeling

**Artifact:** `_bmad-output/planning-artifacts/epics.md`

**Current Epic 7** bundles three unrelated things:
1. Scenario Management (Good/Better/Best) — nice-to-have
2. PDF Document Generation — core deliverable, product's entire purpose
3. Document History — needed for compliance (FR26, FR27)

**Split into:**

**Epic 6: Document Generation & Vault** (elevated priority)
- Story 6.1: PDF Document Generation (current 7.2 ACs)
- Story 6.2: Document History & Downloads (current 7.3 ACs)
- Dependencies: Epic 5 (financial statement views must exist to export)

**Epic 10: Scenario Comparison** (deferred)
- Story 10.1: Scenario Management & Comparison (current 7.1 ACs)

### CP-6: New Epic — Per-Year Inputs & Multi-Plan Management

**Artifact:** `_bmad-output/planning-artifacts/epics.md`
**Position:** Epic 7

```
Epic 7: Per-Year Input Granularity & Multi-Plan Management

All input assumptions support independent Year 1-5 values (the engine already 
accepts per-year arrays). Multi-plan management enables creating, naming, 
cloning, and switching between plans.

### Story 7.1: Per-Year Input Columns

As a franchisee,
I want to set different values for each year (Year 1-5) for all my assumptions,
So that I can model realistic growth trajectories.

Acceptance Criteria:
- Input Assumptions view shows Y1-Y5 columns for every per-year field
- Matches reference spreadsheet Input Assumptions sheet layout
- Per-year fields: growth rate, royalty fee, ad fund, materials COGS, 
  direct labor, facilities, marketing, mgmt salaries, payroll tax,
  other opex, target pre-tax profit, shareholder salary adj, distributions
- Changes to any year's value immediately recalculate engine output
- Default behavior: changing Y1 propagates to Y2-Y5 unless Y2-Y5 
  have been independently modified

### Story 7.2: Plan CRUD & Navigation

As a franchisee,
I want to create new plans, name them, rename existing plans, clone a plan, 
and switch between plans in the sidebar,
So that I can manage multiple planning scenarios.

Acceptance Criteria:
- "Create New Plan" action available in sidebar
- Plans listed in sidebar with names
- Click plan name to switch active plan
- Rename plan inline
- Clone plan creates a copy with "(Copy)" suffix
- Delete plan with confirmation
```

### CP-7: Revised Epic Sequence

| # | Epic | Status | Notes |
|---|------|--------|-------|
| 1 | Auth, Onboarding & User Management | **Done** | |
| 2 | Brand Configuration & Administration | **Done** | |
| 3 | Financial Planning Engine | **Done** | Needs extension (CP-2) |
| 4 | Forms & Quick Entry Experience | **Done** | Conceptual correction noted |
| **5** | **Financial Statement Views & Output Layer** | **NEW** | 9 stories — render every spreadsheet sheet |
| **6** | **Document Generation & Vault** | **Elevated** | PDF export + document history |
| **7** | **Per-Year Inputs & Multi-Plan Management** | **NEW** | Year columns + plan CRUD |
| 8 | Advisory Guardrails & Smart Guidance | Was Epic 5 | Renumbered |
| 9 | AI Planning Advisor | Was Epic 6 | Renumbered |
| 10 | Scenario Comparison | Was part of Epic 7 | Split out, deferred |
| 11 | Data Sharing & Pipeline Dashboards | Was Epic 8 | Renumbered |
| ST | Admin Support Tools | Unchanged | |
| 12 | Advisory Board Meeting (Phase 2) | Was Epic 9 | Renumbered |

### CP-8: Resolve Carried Technical Debt

Two items carried from Epic 2 through 3 consecutive epics:
1. Remove `as any` cast in `createUser` 
2. Update `architecture.md` with `brand_account_managers` table

Resolve as pre-Epic-5 preparation before first new story begins.

---

## 4. Implementation Priority

**Immediate (blocks everything):**
1. CP-2 partial: Extend engine with missing Balance Sheet, Cash Flow, ROIC, Valuation computations
2. CP-4 Stories 5.1-5.4: P&L, Balance Sheet, Cash Flow, Summary Financials views
3. CP-4 Stories 5.5-5.7: ROIC, Valuation, Audit views

**Next (enables complete product):**
4. CP-5: PDF Document Generation
5. CP-3 + CP-6: Per-year input columns + PlanFinancialInputs restructuring

**Then (enhances product):**
6. CP-4 Stories 5.8-5.9: Glossary, Quick Entry interactive statements
7. CP-6 Story 7.2: Multi-plan management

---

## 5. What This Changes About the Product

**Before this correction:** The product is an input form that shows 5 summary numbers. A franchisee fills in fields and sees "Total Investment: $256,507" and "Break-Even Month: 18." They cannot see their P&L, cannot see their balance sheet, cannot understand how their assumptions flow through to profitability. They cannot generate a PDF. They cannot take anything to a bank.

**After this correction:** The product is the spreadsheet turned into interactive software. Every financial statement the spreadsheet produces, the application produces. Every input the spreadsheet accepts, the application accepts — with the same per-year granularity. The franchisee works inside their financial plan, sees every line item update in real-time, and generates a professional PDF package they can hand to a lender.

The reference spreadsheet is the spec. Build it into software.
