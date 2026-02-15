# Sprint Change Proposal: Financial Statement Output Layer & Spreadsheet Parity

**Date:** 2026-02-15
**Author:** BMAD Course Correction Workflow
**Trigger:** Brainstorming session gap analysis revealed the product's core deliverable (financial statements + PDF package) has zero UI implementation
**Severity:** Critical — blocks the product's reason for existing
**Change Scope:** Major
**Supporting Documents:**
- `_bmad-output/course-corrections/cc-2026-02-15-financial-output-layer.md` (detailed change proposals)
- `_bmad-output/course-corrections/cc-2026-02-15-addendum-guided-decomposition.md` (field decomposition + help content analysis)

---

## Section 1: Issue Summary

### Problem Statement

The product was designed to replace static franchise planning spreadsheets with interactive financial planning software that produces lender-grade business plan packages. After completing 4 epics (Auth/Onboarding, Brand Configuration, Financial Engine, Forms & Quick Entry), the application collects inputs and computes 60-month projections — but **produces none of the financial statement output that defines the product's value.**

The reference spreadsheets (PostNet, Jeremiah's Italian Ice, Tint World, Ubreakifix) all share an identical 12-sheet structure. The application currently renders:
- 5 summary metric cards
- 2 charts (revenue projection, expense breakdown)

The application does NOT render:
- P&L Statement (60-month tabular document)
- Balance Sheet (60-month tabular document)
- Cash Flow Statement (60-month tabular document)
- Summary Financials (annual overview)
- Returns on Invested Capital (ROIC) analysis
- Valuation analysis
- Audit / integrity checks (4 of 13 checks implemented, none visible)
- PDF document generation
- Glossary / help content

### Discovery Context

This gap was identified during a brainstorming session on 2026-02-15 when conducting a deep comparison between the reference spreadsheet structure and the implemented application. The reference spreadsheet is the product specification — it defines exactly what the application must produce. The gap analysis revealed that while the financial engine computes most of the underlying data, the entire output presentation layer is missing.

### Evidence

1. **Zero financial statement views exist.** No routes, no components, no pages for P&L, Balance Sheet, Cash Flow, ROIC, or Valuation.
2. **Engine computes data with no destination.** The engine produces `monthlyProjections` with P&L line items, but nothing renders them as financial documents.
3. **Input-output mismatch.** The UI collects inputs as single values (e.g., `cogsPct: number`) but the engine accepts per-year arrays (`cogsPct: [number, number, number, number, number]`). The translation layer broadcasts single values across all 5 years, eliminating the growth trajectory modeling that is fundamental to 5-year financial planning.
4. **Missing engine computations.** Several spreadsheet output categories have no engine equivalent: Valuation sheet (entire), ROIC (mostly missing), Balance Sheet details (tax payable, LOC, common stock), Cash Flow disaggregation, and 9 of 13 audit checks.
5. **UI field structure diverges from spreadsheet.** Facilities split into rent/utilities/insurance (spreadsheet has single Facilities field); Other OpEx stored as dollars (spreadsheet uses % of revenue); Management Salaries and Payroll Tax missing entirely from UI.

---

## Section 2: Impact Analysis

### Epic Impact

| Epic | Impact | Details |
|------|--------|---------|
| Epic 1 (Auth) | None | Complete, unaffected |
| Epic 2 (Brand Config) | None | Complete, unaffected |
| Epic 3 (Financial Engine) | **Extension needed** | Engine needs new inputs (EBITDA Multiple, Target Pre-tax Profit, Shareholder Salary Adj, Tax Payment Delay), new output sections (Valuation, extended ROIC, extended Audit), and Balance Sheet / Cash Flow disaggregation |
| Epic 4 (Forms & Quick Entry) | **Conceptual correction** | Input UI needs restructuring: PlanFinancialInputs per-year support, Facilities field alignment, Other OpEx unit change ($ → %), missing fields added. However, existing UI can continue functioning while views are built. |
| Epic 5 (Advisory Guardrails) | **Renumbered to 8** | Deprioritized — financial output is more critical than input validation |
| Epic 6 (AI Planning Advisor) | **Renumbered to 9** | Deprioritized — output layer must exist before AI can reference it |
| Epic 7 (Scenario & Docs) | **Split into 3** | PDF generation elevated to Epic 6; Scenario deferred to Epic 10; Per-year inputs become new Epic 7 |
| Epic ST (Admin Tools) | **No change** | ST-4 remains blocked by franchisor dashboard |
| Epic 8 (Data Sharing) | **Renumbered to 11** | Position unchanged relative to other epics |
| Epic 9 (Advisory Board) | **Renumbered to 12** | Position unchanged |

### New Epics Required

| New Epic | Position | Stories | Purpose |
|----------|----------|---------|---------|
| **Epic 5: Financial Statement Views & Output Layer** | After Epic 4 | 9 stories | Render every spreadsheet output sheet as interactive views |
| **Epic 6: Document Generation & Vault** | After Epic 5 | 2 stories | PDF export + document history (elevated from old Epic 7) |
| **Epic 7: Per-Year Inputs & Multi-Plan** | After Epic 6 | 2 stories | Year 1-5 input columns + plan CRUD |

### Story Impact

**New stories (13 total):**
- Stories 5.1-5.9: P&L View, Balance Sheet View, Cash Flow View, Summary Financials View, ROIC View, Valuation View, Audit View, Glossary, Quick Entry Interactive Statements
- Story 5.10: Contextual Help & Guidance Content
- Story 6.1: PDF Document Generation (from old 7.2)
- Story 6.2: Document History & Downloads (from old 7.3)
- Story 7.1: Per-Year Input Columns
- Story 7.2: Plan CRUD & Navigation

**Modified stories:**
- Old Story 7.1 (Scenario Management) → becomes Story 10.1, deferred

### Artifact Conflicts

| Artifact | Sections Affected | Changes Needed |
|----------|-------------------|----------------|
| **PRD** (`prd.md`) | §1 Functional Requirements | Add FR7a-FR7n (14 new functional requirements covering output views, per-year inputs, help content, glossary) |
| **Epics** (`epics.md`) | Epic numbering, new epics | Add Epics 5, 6, 7; renumber Epics 5→8, 6→9, 7→split, 8→11, 9→12 |
| **Architecture** (`architecture.md`) | Data model, API routes | Add financial statement API endpoints; extend engine output types; add help content data model |
| **Engine** (`financial-engine.ts`) | Inputs, outputs, computations | New inputs (5), new monthly output fields (17+), new output sections (Valuation, extended ROIC, extended Audit with 13 checks), P&L analysis lines (12+) |
| **Sprint Status** (`sprint-status.yaml`) | Epic/story entries | Add new epics 5-7, renumber existing 5-9 to 8-12 |

### Technical Impact

- **No rollback needed.** All completed work (Epics 1-4, ST) remains valid. The financial engine is correct — it just needs extension.
- **Engine extension is additive.** New computations add to existing engine, don't modify it. Existing 140+ tests continue passing.
- **UI extension is parallel.** New financial statement views are new pages/components alongside existing Forms/Quick Entry modes. Existing UI is unaffected.
- **PlanFinancialInputs restructuring** is the only breaking change — per-year arrays replace single values. This requires migration of existing plan data (broadcast current single values into 5-element arrays).

---

## Section 3: Recommended Approach

### Selected Path: Direct Adjustment (Option 1)

**Rationale:** No rollback is needed. All completed work is valid and serves as the foundation. The engine correctly computes 60-month projections — we need to extend it and build the presentation layer on top. This is additive work, not rework.

### Implementation Strategy

**Phase 1: Build the output layer (highest leverage)**
1. Extend financial engine with missing computations (Valuation, extended ROIC, extended Audit, Balance Sheet/Cash Flow disaggregation, P&L analysis lines)
2. Build financial statement views — P&L, Balance Sheet, Cash Flow, Summary Financials (Stories 5.1-5.4)
3. Build ROIC, Valuation, Audit views (Stories 5.5-5.7)

**Phase 2: Enable complete product**
4. PDF Document Generation (Story 6.1) + Document History (Story 6.2)
5. Per-year input columns + PlanFinancialInputs restructuring (Story 7.1)

**Phase 3: Enhance product**
6. Glossary + Contextual Help (Stories 5.8, 5.10)
7. Quick Entry as Interactive Financial Statements (Story 5.9)
8. Multi-plan management (Story 7.2)

### Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Engine extension introduces bugs | Medium | Existing 140+ tests provide regression safety. New computations get their own test suite. |
| Financial statement views are complex | Medium | Reference spreadsheet provides exact spec — every row, column, and formula is defined. No design ambiguity. |
| PlanFinancialInputs migration breaks existing plans | Low | Migration broadcasts current single values to 5-element arrays — semantically identical. |
| Scope increase delays later epics | Low | Financial output IS the product. Advisory guardrails (old Epic 5) and AI Advisor (old Epic 6) are enhancements, not core. |
| Help content requires video transcription | Low | Video content extraction is a separable task that doesn't block statement views or PDF generation. |

### Scope Impact

This proposal adds ~13 new stories across 3 new epics. The total story count increases from ~28 to ~41. However, this work represents the product's core value proposition — without it, the product is an input form that produces no output. The additional effort is non-negotiable for product viability.

### Trade-offs Considered

- **Alternative: Build PDF first, skip interactive views.** Rejected — PDF needs statement views as its content source. Can't export what doesn't exist.
- **Alternative: Show only annual summaries, skip monthly detail.** Rejected — the spreadsheet's monthly granularity is what makes it lender-grade. Annual-only summaries are what the current 5 metric cards already provide.
- **Alternative: Defer per-year inputs.** Partially accepted — per-year inputs are in Phase 2, not Phase 1. Statement views can initially use broadcast values while per-year UI is built.

---

## Section 4: Detailed Change Proposals

### CP-1: Add Missing Functional Requirements to PRD

**Artifact:** `_bmad-output/planning-artifacts/prd.md`
**Section:** §1 Functional Requirements — Financial Planning & Calculation

**Add 14 new FRs:**

```
FR7a: Franchisee can view complete P&L Statement as tabular financial document 
      with 60 monthly columns organized by year (matching reference spreadsheet 
      "P&L Statement" sheet), showing all revenue, COGS, gross profit, operating 
      expense, EBITDA, depreciation, interest, and pre-tax income line items.

FR7b: Franchisee can view complete Balance Sheet as tabular financial document 
      with 60 monthly columns (matching "Balance Sheet" sheet), showing current 
      assets, fixed assets, liabilities, and equity sections.

FR7c: Franchisee can view complete Cash Flow Statement as tabular financial 
      document with 60 monthly columns (matching "Cash Flow Statement" sheet), 
      showing operating, investing, and financing cash flows.

FR7d: Franchisee can view Summary Financials page with annual P&L summary, 
      balance sheet summary, cash flow, working capital, debt schedule, capex 
      schedule, and breakeven analysis (matching "Summary Financials" sheet).

FR7e: Franchisee can view Returns on Invested Capital (ROIC) analysis showing 
      invested capital composition, after-tax income, ROIC percentage, and core 
      capital metrics (matching "Returns on Invested Capital" sheet).

FR7f: Franchisee can view Valuation analysis showing EBITDA-multiple valuation, 
      estimated business value, after-tax proceeds, and replacement return 
      (matching "Valuation" sheet).

FR7g: Franchisee can view Audit/integrity check results showing pass/fail 
      status for all financial statement cross-checks (matching "Audit" sheet — 
      13 checks total).

FR7h: In Quick Entry mode, franchisee can edit input values directly within 
      financial statement views — input cells are editable inline while computed 
      cells update in real-time.

FR7i: All input assumptions support per-year (Year 1 through Year 5) values 
      matching the reference spreadsheet column structure, enabling growth 
      trajectory modeling.

FR7j: Input Assumptions include: EBITDA Multiple, Target Pre-tax Profit (Y1-Y5),
      Shareholder Salary Adjustment (Y1-Y5), Distributions (Y1-Y5), AR Days, 
      AP Days, Inventory Days, Tax Payment Delay, Company Name, Start Date, 
      and Financial Year End — matching all fields in the reference spreadsheet.

FR7k: Application includes a Glossary page with financial term definitions 
      accessible from main navigation. Benchmark values, where shown, are 
      sourced from brand-specific defaults configured by the franchisor.

FR7l: Application includes contextual help for every input field — tooltip 
      explanation and expanded guidance. Help content covers both consolidated 
      spreadsheet-level fields (sourced from reference spreadsheet comments and 
      video content) AND decomposed sub-fields in Forms mode (newly authored 
      guidance). Content is stored as platform-level text data.

FR7m: In Forms mode, composite input fields (Facilities, Financing, Management 
      Salaries, Shareholder Salary Adjustment, and optionally Direct Labor) are 
      decomposed into guided sub-fields with their own help content that are 
      rolled up into the engine's consolidated inputs. In Quick Entry mode, the 
      same fields appear in their consolidated spreadsheet-level form. All 
      decomposition is opt-in — Quick Entry always provides the direct path.

FR7n: Franchisee can generate and download a professional PDF business plan 
      package containing all financial statements, formatted for lender 
      presentation.
```

### CP-2: Extend Financial Engine — Missing Computations

**Artifact:** `shared/financial-engine.ts`

**A. New Engine Inputs:**
- `ebitdaMultiple: number` — for valuation calculations
- `targetPreTaxProfitPct: [number x5]` — for salary cap / labor efficiency analysis
- `shareholderSalaryAdj: [number x5]` — for adjusted pre-tax profit
- `taxPaymentDelayMonths: number` — for tax payable timing on balance sheet
- `nonCapexInvestment: [number x5]` — per-year non-capex

**B. New Monthly Output Fields (17+):**
- Balance Sheet: taxPayable, lineOfCredit, commonStock, retainedEarnings, totalCurrentAssets, totalAssets, totalCurrentLiabilities, totalLiabilities, totalEquity, totalLiabilitiesAndEquity
- Cash Flow disaggregation: cfAccountsReceivableChange, cfInventoryChange, cfOtherAssetsChange, cfAccountsPayableChange, cfTaxPayableChange, cfNetOperatingCashFlow, cfCapexPurchase, cfNetBeforeFinancing, cfNotesPayable, cfLineOfCredit, cfInterestExpense, cfDistributions, cfEquityIssuance, cfNetFinancingCashFlow, cfNetCashFlow, beginningCash, endingCash

**C. New Output Sections:**
- `ValuationOutput` — EBITDA multiple valuation per year (11 fields)
- `ROICOutput` (extended) — 15 fields per year including sweat equity, core capital metrics
- `AuditChecks` (extended) — 13 checks matching spreadsheet (currently 4)

**D. P&L Analysis Lines (12+ computed lines):**
- Adjusted Pre-tax Profit, Target Pre-tax Profit, Above/Below Target
- Non-Labor Gross Margin, Total Wages, Adjusted Total Wages
- Salary Cap @ target %, (Over)/Under Cap
- Labor Efficiency, Adjusted Labor Efficiency
- Discretionary Marketing %, PR Taxes & Benefits as % of All Wages, Other OpEx as % of Revenue

### CP-3: Fix PlanFinancialInputs → FinancialInputs Translation

**Artifact:** `PlanFinancialInputs` interface in `shared/financial-engine.ts`, plan initialization in `server/routes.ts` / `server/storage.ts`

**Current:** UI stores single values (e.g., `cogsPct: number`), translation layer broadcasts to `[v, v, v, v, v]`
**Required:** UI stores per-year arrays (e.g., `cogsPct: [number, number, number, number, number]`)

**Additionally fix:**
- Facilities: replace `rentMonthly + utilitiesMonthly + insuranceMonthly` with single `facilitiesAnnual[5]` (decomposition becomes UI-only in Forms mode)
- Other OpEx: change from flat dollar amount to % of revenue
- Add missing UI fields: managementSalaries, payrollTaxPct, distributions, shareholderSalaryAdj, targetPreTaxProfitPct, ebitdaMultiple, arDays, apDays, inventoryDays

### CP-4: New Epic 5 — Financial Statement Views & Output Layer

**Artifact:** `_bmad-output/planning-artifacts/epics.md`
**Position:** Epic 5 (immediately after current Epic 4)

**9 stories + 1 help content story:**
- 5.1: P&L Statement View (60-month tabular, matching spreadsheet line items)
- 5.2: Balance Sheet View (60-month tabular, assets/liabilities/equity)
- 5.3: Cash Flow Statement View (60-month tabular, operating/investing/financing)
- 5.4: Summary Financials View (annual columns, all summary sections)
- 5.5: Returns on Invested Capital (ROIC) View
- 5.6: Valuation View
- 5.7: Audit / Integrity Checks View (13 checks)
- 5.8: Glossary & Financial Term Reference (definitions from spreadsheet, benchmarks from brand defaults)
- 5.9: Quick Entry as Interactive Financial Statements (editable input cells inline)
- 5.10: Contextual Help & Guidance Content (tooltips for all fields including decomposed sub-fields)

Full acceptance criteria for each story documented in `cc-2026-02-15-financial-output-layer.md`.

### CP-5: Separate Document Generation from Scenario Modeling

**Artifact:** `_bmad-output/planning-artifacts/epics.md`

**Current Epic 7 splits into:**
- **Epic 6: Document Generation & Vault** (elevated priority)
  - Story 6.1: PDF Document Generation (from old 7.2)
  - Story 6.2: Document History & Downloads (from old 7.3)
- **Epic 10: Scenario Comparison** (deferred)
  - Story 10.1: Scenario Management & Comparison (from old 7.1)

### CP-6: New Epic 7 — Per-Year Inputs & Multi-Plan Management

**Artifact:** `_bmad-output/planning-artifacts/epics.md`
**Position:** Epic 7

**2 stories:**
- 7.1: Per-Year Input Columns (Y1-Y5 for all per-year fields, default propagation from Y1)
- 7.2: Plan CRUD & Navigation (create, name, rename, clone, delete, switch between plans)

### CP-7: Revised Epic Sequence

| # | Epic | Status | Change |
|---|------|--------|--------|
| 1 | Auth, Onboarding & User Management | **Done** | — |
| 2 | Brand Configuration & Administration | **Done** | — |
| 3 | Financial Planning Engine | **Done** | Needs extension (CP-2) |
| 4 | Forms & Quick Entry Experience | **Done** | Conceptual correction (CP-3) |
| **5** | **Financial Statement Views & Output Layer** | **NEW** | 10 stories — core product output |
| **6** | **Document Generation & Vault** | **ELEVATED** | From old Epic 7, stories 7.2+7.3 |
| **7** | **Per-Year Inputs & Multi-Plan Management** | **NEW** | Per-year columns + plan CRUD |
| 8 | Advisory Guardrails & Smart Guidance | Backlog | Was Epic 5, renumbered |
| 9 | AI Planning Advisor | Backlog | Was Epic 6, renumbered |
| 10 | Scenario Comparison | Backlog | Was part of Epic 7, deferred |
| 11 | Data Sharing & Pipeline Dashboards | Backlog | Was Epic 8, renumbered |
| ST | Admin Support Tools | In-progress | Unchanged |
| 12 | Advisory Board Meeting (Phase 2) | Backlog | Was Epic 9, renumbered |

### CP-8: Resolve Carried Technical Debt

**Pre-Epic-5 cleanup:**
1. Remove `as any` cast in `createUser` (carried since Epic 2)
2. Update `architecture.md` with `brand_account_managers` table (carried since Epic 2)

### Addendum: Guided Field Decomposition & Help Content

**Documented in:** `cc-2026-02-15-addendum-guided-decomposition.md`

**Key decisions (user-confirmed):**
1. **Loom videos → content extraction, not embedding.** Extract teaching from 25 Loom walkthrough videos into text-based tooltips and expanded help panels. No external video links in the application.
2. **Decomposed sub-fields need their own help content.** The spreadsheet only has comments for expert-level consolidated fields. Every sub-field created through Forms mode decomposition (rent, utilities, telecom, etc.) needs newly authored guidance text.
3. **Benchmarks removed from glossary.** Glossary contains universal definitions only. Benchmark values come from brand-specific defaults configured by the franchisor — not from a universal table.
4. **All decomposition is opt-in.** Quick Entry always provides the direct-entry path matching the spreadsheet. Forms mode offers guided decomposition for users who need it. Both produce identical engine input.

**Fields requiring Forms mode decomposition (all opt-in):**
- Facilities → Rent, Utilities, Telecom/IT, Vehicle Fleet, Insurance
- Financing → Personal Savings, Investor Equity, SBA Loan, Other Loans
- Management Salaries → Owner Salary, GM Salary, Admin Staff
- Shareholder Salary Adjustment → Guided sweat equity flow
- Direct Labor → Optional staffing calculator
- Distributions → Guided with impact context

**Help content inventory:**
- 15 glossary terms (definitions only, benchmarks from brand defaults)
- 33 tooltip texts from spreadsheet cell comments (consolidated fields)
- ~20 new tooltip texts to author (decomposed sub-fields)
- 25 Loom videos to extract content from (prerequisite task)

---

## Section 5: Implementation Handoff

### Change Scope Classification: Major

This is a Major scope change that introduces the product's core output layer. It adds 3 new epics, 13+ new stories, extends the financial engine significantly, and resequences the entire epic plan.

### Handoff Plan

| Role | Responsibility |
|------|----------------|
| **Solution Architect** | Update architecture document with new API endpoints, extended engine types, help content data model. Review engine extension design before implementation begins. |
| **Product Owner** | Update PRD with FR7a-FR7n. Update epics document with new Epics 5, 6, 7 and renumbered Epics 8-12. Update sprint-status.yaml with new epic/story entries. |
| **Developer** | Execute implementation in Phase 1-2-3 order. Start with engine extension (CP-2), then statement views (CP-4), then PDF (CP-5). |
| **Content Author** | Extract teaching content from 25 Loom videos into structured text guidance. Author new tooltip text for decomposed sub-fields. |

### Pre-Implementation Actions

1. **Resolve carried tech debt (CP-8)** — remove `as any` cast, update architecture doc
2. **Update PRD** with FR7a-FR7n
3. **Update epics document** with new Epics 5-7, renumber 8-12
4. **Update sprint-status.yaml** with new epic/story entries
5. **Update architecture document** with engine extension design

### Success Criteria

1. Every output sheet from the reference spreadsheet (P&L, Balance Sheet, Cash Flow, Summary Financials, ROIC, Valuation, Audit) has a corresponding interactive view in the application
2. Financial statement views match the reference spreadsheet's line items, column structure, and calculation results
3. Engine passes all 13 audit checks with correct identity relationships
4. PDF generation produces a lender-grade business plan package containing all financial statements
5. All input assumptions support per-year (Y1-Y5) values
6. Glossary page accessible from main navigation with definitions (benchmarks from brand defaults)
7. Every input field has contextual help — both consolidated and decomposed fields
8. Existing functionality (Epics 1-4, ST) continues working without regression

### Implementation Priority Order

| Priority | Work Item | Blocks |
|----------|-----------|--------|
| 1 (immediate) | CP-2: Engine extension (missing computations) | All statement views |
| 2 (immediate) | CP-4 Stories 5.1-5.4: Core statement views | PDF generation |
| 3 (immediate) | CP-4 Stories 5.5-5.7: ROIC, Valuation, Audit | PDF completeness |
| 4 (next) | CP-5 Story 6.1: PDF Document Generation | Product deliverable |
| 5 (next) | CP-3 + CP-6 Story 7.1: Per-year inputs | Growth modeling |
| 6 (then) | CP-4 Stories 5.8, 5.10: Glossary + Help Content | User education |
| 7 (then) | CP-4 Story 5.9: Quick Entry interactive statements | Expert UX |
| 8 (then) | CP-6 Story 7.2: Multi-plan management | Plan organization |
| 9 (then) | CP-5 Story 6.2: Document History | Compliance |

---

*This Sprint Change Proposal requires explicit user approval before implementation begins. Upon approval, the Product Owner will update all planning artifacts and the Developer will begin Phase 1 implementation starting with engine extension (CP-2).*
