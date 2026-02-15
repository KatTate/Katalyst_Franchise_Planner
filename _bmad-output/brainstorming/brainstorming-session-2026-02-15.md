---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: ['_bmad-output/planning-artifacts/prd.md', '_bmad-output/brainstorming/brainstorming-session-2026-02-08.md', '_bmad-output/planning-artifacts/reference-data/PostNet_-_Business_Plan_1770511701987.xlsx']
session_topic: 'End-to-end franchisee user journeys — complete workflow mapping with gap analysis against existing PRD and current build'
session_goals: 'Map every franchisee workflow end-to-end across all three persona tiers, validate PRD against built reality, identify what is accurate/outdated/missing — with specific focus on multi-plan management, plan cloning/renaming, startup costs, and persona tier differences'
selected_approach: 'ai-recommended'
techniques_used: ['Role Playing', 'Question Storming', 'Decision Tree Mapping']
ideas_generated: []
context_file: ''
session_active: false
workflow_completed: true
---

# Brainstorming Session Results — Franchisee Journey Gap Analysis

**Facilitator:** Tate Fisher
**Date:** 2026-02-15

---

## Session Overview

**Topic:** End-to-end franchisee user journeys — complete workflow mapping with gap analysis against existing PRD and current build

**Goals:**
1. Map every franchisee workflow end-to-end across all three persona tiers (Story/Normal/Expert)
2. Validate what the PRD says against what's actually built
3. Identify what's accurate, what's outdated, and what's missing entirely
4. Specific focus areas: multi-plan management (create/clone/rename), startup costs management, and persona tier differences

**Scope boundary:** Franchisee journeys only. Franchisor and admin journeys deferred.

### Context

Building on the Feb 8 brainstorming session (54 ideas) and the full PRD. Sally's retrospective comment identified that feature design has outpaced journey design — we've built capabilities but haven't mapped the complete user paths that connect them. This session grounds discovery in the PRD and current build to produce an actionable gap inventory.

### Techniques Selected

**Approach:** AI-Recommended Techniques

- **Role Playing (collaborative):** Walk in each persona's shoes through the complete app experience — every click, screen, and decision point
- **Question Storming (deep):** Generate every unanswered question about gaps, missing transitions, and unbuilt pathways
- **Decision Tree Mapping (structured):** Map concrete UI flows for multi-plan management, startup costs, plan creation/cloning/renaming

---

## The Central Finding

**The product's reason for existing is to produce lender-grade business plans — pro forma P&L, balance sheet, cash flow, break-even analysis, and lender summary packages.** The reference spreadsheets in `_bmad-output/planning-artifacts/reference-data/` define exactly what that output looks like:

### Reference Spreadsheet Structure (PostNet Business Plan)

| Sheet | Purpose | Status in Build |
|-------|---------|----------------|
| Start Here! | Orientation | N/A |
| Glossary | Term definitions | Not built |
| **Input Assumptions** | All user-configurable parameters (per-year) | **Partially built** — 19 of ~86 inputs exposed, no per-year structure |
| **Summary Financials** | Annual P&L summary + labor efficiency + balance sheet + cash flow summaries | **Not built** — engine computes this data, UI never renders it |
| **P&L Statement** | Full Profit & Loss with 60 monthly columns across 5 years, ~50 line items | **Not built** — engine computes monthly P&L, UI never renders it |
| **Balance Sheet** | Full balance sheet with monthly detail, assets/liabilities/equity | **Not built** — engine computes this, UI never renders it |
| **Cash Flow Statement** | Operating/investing/financing cash flows, monthly | **Not built** — engine computes this, UI never renders it |
| **Returns on Invested Capital** | ROIC calculations, core capital analysis | **Not built** — partial ROI metrics shown (5-year ROI, break-even) |
| **Valuation** | EBITDA multiple valuation, net proceeds analysis | **Not built** |
| Model | Calculation engine (hidden from users in spreadsheet) | **Built** — `shared/financial-engine.ts` is solid |
| **Audit** | 13 identity checks (balance sheet, P&L, cash flow, working capital, debt, capex, breakeven, ROI, valuation) | **Partially built** — engine runs identity checks internally |
| Feedback & Support | Contact info | N/A |

**The engine (Model sheet equivalent) is the strongest part of the build.** It computes 60 months of detailed P&L, balance sheet items, and cash flow. It runs accounting identity checks. It produces `AnnualSummary` objects with Revenue, COGS, Gross Profit, Labor, Contribution Margin, OpEx, EBITDA, Depreciation, Interest, Pre-Tax Income, Total Assets, Total Liabilities, Total Equity, Operating Cash Flow, Net Cash Flow, and Ending Cash.

**None of that output is ever rendered as financial statements.** The UI shows 5 summary metric cards and 2 charts. The full P&L, balance sheet, and cash flow that the engine already computes are never displayed to the user in any mode.

**There is no document generation.** No PDF export. No pro forma output. No lender package. No document vault. The PRD marks "PDF generation + basic document vault" as "Never cut." Zero lines of code exist for any of this.

---

## The Three-Layer Problem

### Layer 1: The Product Has No Output (Blockers)

The platform's deliverable is a lender-grade business plan. Sam needs it for the bank. Chris needs it for location #2 financing. Jordan needs it for her investor. Without it, there's nothing to admin and nothing for the franchisor to oversee.

| Gap # | Gap | PRD Reference | Build Status |
|-------|-----|---------------|-------------|
| **28** | No financial statement views (P&L, Balance Sheet, Cash Flow) | PRD line 637: "Lender-grade P&L, cash flow, balance sheet, break-even, summary package — Primary deliverable" | Engine computes all data. UI shows 5 metric cards + 2 charts. No tabular financial statements rendered anywhere. |
| **29** | No document generation (PDF, pro forma package) | PRD line 669: "Never cut: PDF generation + basic document vault." PRD line 211: "They generate documents: pro forma P&L, cash flow projection, break-even analysis, lender summary. Sam downloads a PDF." | Zero code exists. No PDF library. No export route. No generate button. |
| **30** | No document vault | PRD line 638: "Basic Document Vault — Simple list of generated PDFs with timestamps" | Zero code exists. |

### Layer 2: The Modes Don't Serve Their Personas

The PRD describes "three fundamentally different interaction paradigms." The build delivers two slightly different views of the same 19-field input list and one placeholder.

The three modes are not about data entry speed. They're about **which financial mental model the user operates in:**

- **Sam (Planning Assistant / Story Mode):** Has no financial mental model. Needs the system to translate human questions ("how much is your rent?") into P&L line items. Doesn't know he's building a P&L.
- **Chris (Forms / Normal Mode):** Knows revenue, costs, and financing as business categories. Thinks in decisions, not financial statements.
- **Jordan (Quick Entry / Expert Mode):** Thinks in financial statements natively. Wants to edit values directly inside a P&L, balance sheet, and cash flow — because that's the structure she already knows from running franchises. She expects to see the same sheets that exist in the reference spreadsheet.

| Gap # | Gap | What Should Happen | Build Reality |
|-------|-----|--------------------|---------------|
| **5** | Planning Assistant is a dead end | Conversational AI guides Sam through planning | Placeholder card: "The AI Planning Advisor will be available here." |
| **7** | Modes don't feel different enough | Three fundamentally different interaction paradigms | Forms and Quick Entry are the same 19 fields with different presentation |
| **21** | Quick Entry isn't financial-statement-native | Jordan works inside P&L / Balance Sheet / Cash Flow as interactive documents with editable input cells and live-computed output cells | Flat grid of 19 inputs in a table with Tab navigation. Same content as Forms. |
| **22** | No per-year columns | Year 1-5 independently configurable (reference spreadsheet has 60 monthly columns) | Single flat values per field. Can't vary assumptions across years. |
| **23** | No computed output columns in grid | Inputs and computed values visible together (like a spreadsheet cell showing formula results) | Grid shows inputs only. Outputs are in a separate panel. |
| **24** | Sticky metrics vs. Plan Completeness inconsistency | Consistent experience elements across modes | Forms has progress bars. Quick Entry has summary metrics. No shared rationale. |
| **25** | Startup Costs breaks out of grid paradigm | Startup costs integrated into the financial statement structure | Card component drops out of the grid into a different UI pattern |
| **26** | No formula visibility | Power users can see how values are calculated | Engine is a black box. No intermediate formula display. |
| **27** | No export to spreadsheet | Jordan exports to Excel for cross-checking with accountant | No CSV or Excel export. |
| **8** | Per-year assumptions are flat (cross-cutting) | PRD specifies 13 per-year assumption arrays (Years 1-5) | UI shows single values. Affects all three modes. |

### Layer 3: Multi-Plan and Workflow Gaps

These prevent the scaling story (Chris's multi-location journey) from working.

| Gap # | Gap | Impact | Build Status |
|-------|-----|--------|-------------|
| **1** | No "Create New Plan" button | Can't create a second plan | Backend `POST /api/plans` exists, zero UI calls it |
| **2** | Quick Start is a one-way door | Can't revisit onboarding | `quickStartCompleted = true` is permanent |
| **3** | Plan name not editable | Stuck with auto-generated name | Schema has `name` field, UI shows it as static text |
| **4** | Plan named "Demo Plan" | Real plan called "PostNet Demo Plan" — confusing | `createDemoPlan()` shared between real users and admin demo mode |
| **9** | No multi-plan navigation in sidebar | Can't switch plans without returning to dashboard | Sidebar has only "Dashboard" nav item for franchisees |
| **10** | No "Create Plan" UI anywhere | Multi-location planning completely blocked | **Blocker** |
| **11** | No plan cloning | Can't start new plan from existing plan's values | No backend or frontend code |
| **12** | No side-by-side comparison | Can't compare plans | No comparison view |
| **13** | No estimated vs. actual tracking | Can't update with real numbers (PRD Phase 2) | Correctly deferred, but Chris's PRD journey references it |
| **14** | No settings/profile page | PRD says tier change in settings | Mode switcher in header works; PRD inconsistency |
| **15** | No onboarding re-entry | Can't revisit tier recommendation | Minor gap |
| **16** | No plan navigation from workspace | No breadcrumbs, no plan switcher | Missing |

### Layer 4: Startup Cost Builder Detail Gaps

The Startup Cost Builder is the most complete component. These are refinement-level issues.

| Gap # | Gap | Impact | Status |
|-------|-----|--------|--------|
| **6** | Startup Costs buried at bottom of input panel | No discovery moment — users don't know it exists | Design gap |
| **17** | No startup cost comparison across plans | Can't compare location startup costs | Missing (requires multi-plan) |
| **18** | No location-specific item naming | Items are generic across plans | Design gap |
| **19** | No startup cost categories/grouping | Flat list, no sections like "Buildout" vs "Equipment" vs "Fees" | Design gap |
| **20** | Classification not editable on brand-default items | Must delete and recreate to reclassify | Missing feature |

---

## What's Working

Credit where due — the build has real substance in several areas:

1. **Financial Engine (`shared/financial-engine.ts`)** — Full 60-month projection model with P&L, balance sheet items, cash flow, ROI metrics, and accounting identity checks. Deterministic. Well-tested. This is the product's core and it works.

2. **Startup Cost Builder (`client/src/components/shared/startup-cost-builder.tsx`)** — Line items with brand defaults, FDD Item 7 ranges, capex classification, custom item support, reordering. The most complete UI component.

3. **Source Badge System** — Tracks whether values come from brand defaults, user entry, or AI. Visible in both modes. Good provenance tracking.

4. **Quick Entry Keyboard Navigation** — Tab/Shift-Tab/Enter/Escape cell navigation with virtualized rows. Real spreadsheet behavior, even if the content isn't spreadsheet-level yet.

5. **Auto-save with Debounce** — `use-plan-auto-save.ts` queues saves with debouncing. Reliable.

6. **Brand Parameter System** — Admin brand configuration with financial parameters, startup cost templates, FDD Item 7 ranges. Well-structured.

7. **Invitation + Onboarding Flow** — Token-based invitation, 3-question onboarding with tier recommendation, branded login. Complete path from invite to first workspace session.

---

## The Reference Spreadsheet Is the Spec

The reference business plan spreadsheets in `_bmad-output/planning-artifacts/reference-data/` are the definitive specification for what this product needs to produce. The PostNet spreadsheet has 12 sheets. Here's the mapping of each to what's needed:

### Sheets the Engine Already Computes (data exists, UI doesn't render it)

| Reference Sheet | Engine Data Available | What's Missing |
|----------------|---------------------|----------------|
| **P&L Statement** | `MonthlyProjection` has revenue, COGS, gross profit, labor, contribution margin, opex, EBITDA, depreciation, interest, pre-tax income — all 60 months | No P&L view. No monthly columns. No year subtotals. |
| **Balance Sheet** | `MonthlyProjection` has accounts receivable, inventory, accounts payable, net fixed assets. `AnnualSummary` has total assets, liabilities, equity. | No balance sheet view. |
| **Cash Flow Statement** | `MonthlyProjection` has operating cash flow, cumulative net cash flow. `AnnualSummary` has operating/net cash flow, ending cash. | No cash flow statement view. |
| **Summary Financials** | `AnnualSummary` has all P&L lines, balance sheet totals, and cash flow totals per year | No summary view. Dashboard shows 5 numbers + 2 charts. |
| **Returns on Invested Capital** | `ROIMetrics` has break-even month, total investment, 5-year ROI %, cumulative cash flow | Partial — some metrics shown. No ROIC table. No core capital analysis. |
| **Audit** | `identityChecks` array with pass/fail for each check | Checks run internally. Admin can see them in brand validation. Not user-facing. |

### Sheets Not Yet Computed

| Reference Sheet | Status | Complexity |
|----------------|--------|-----------|
| **Valuation** | Not computed. Needs EBITDA multiple, estimated value, after-tax proceeds. | Low — derived from existing EBITDA + configurable multiple |
| **Input Assumptions** (per-year structure) | Partially computed. Engine accepts per-year arrays but UI only exposes single values. | Medium — UI needs year columns; engine may need parameter expansion |
| **Labor Efficiency Ratios** | Not computed. Reference has Direct LER, Admin LER, Salary Cap analysis. | Medium — new calculations in engine |

### Things That Don't Exist Anywhere

| Need | PRD Reference | Status |
|------|---------------|--------|
| PDF generation | "Never cut" (line 669), Sam's Session 3 (line 211) | Zero code |
| Document vault | "Never cut" (line 669), line 638 | Zero code |
| 3-scenario modeling (Good/Better/Best) | Sam's Session 3 (line 211) | Zero code |
| ROI Threshold Guardian | Line 211 | Zero code |

---

## Recommended Priority Sequence

Based on this analysis, the work should be sequenced by what unblocks everything else:

### Priority 1: Render the Financial Statements the Engine Already Computes

The engine produces P&L, Balance Sheet, and Cash Flow data for 60 months. Rendering that data as tabular financial statements — matching the reference spreadsheet structure — is the single highest-leverage change. It:
- Gives Jordan her Expert Mode experience (interactive financial statements)
- Creates the content that PDF generation will export
- Makes the dashboard useful for all personas
- Provides the validation surface for engine accuracy (can compare side-by-side with reference spreadsheet)

### Priority 2: PDF Generation / Document Export

Once financial statements are visible, export them. This produces the actual product deliverable — the lender package Sam takes to the bank.

### Priority 3: Per-Year Input Granularity

Expose the engine's per-year parameter arrays in the UI. This gives Jordan her Year 1-5 columns and gives Chris the ability to vary assumptions across years.

### Priority 4: Plan Creation and Management

Add "Create New Plan" button, plan naming, and plan navigation. This unblocks Chris's multi-location journey.

### Priority 5: Mode Differentiation

With financial statements rendered (Priority 1), the mode architecture becomes clearer:
- **Forms mode** becomes the guided category-based input experience (Chris)
- **Quick Entry mode** becomes the interactive financial statement experience (Jordan)
- **Planning Assistant** remains deferred until AI integration

---

## Summary

The financial engine is solid. The reference spreadsheets define exactly what the product needs to output. The gap is between the engine's rich computation and the UI's thin presentation layer. Closing that gap — rendering the financial statements the engine already computes — is the foundational step that makes everything else possible.

**30 gaps identified. 3 are blockers (Gaps #10, #28, #29). The engine is the strength. The UI output layer is the critical missing piece.**
