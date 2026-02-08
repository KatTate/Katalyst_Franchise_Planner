---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success']
inputDocuments: ['_bmad-output/planning-artifacts/product-brief-workspace-2026-02-08.md', '_bmad-output/brainstorming/brainstorming-session-2026-02-08.md', 'attached_assets/katalyst-replit-agent-context-final_1770513125481.md', 'attached_assets/PostNet_-_Business_Plan_1770511701987.xlsx', 'attached_assets/Pasted-Persona-A-First-Time-Franchisee-Sam-The-New-Owner-Snaps_1770523428988.txt']
workflowType: 'prd'
briefCount: 1
brainstormingCount: 1
researchCount: 0
projectDocsCount: 0
classification:
  projectType: 'B2B2C Vertical SaaS Platform'
  domain: 'Franchise Operations / Financial Planning & Analysis'
  complexity: 'high'
  complexityDrivers: ['parameterized financial engine with startup cost detail builder', 'multi-stakeholder data isolation (the throuple problem)', 'complex location lifecycle state management', 'FTC compliance content positioning', 'brand-parameterized UX/education/document layers']
  projectContext: 'greenfield'
  notes: 'Not fintech — no money handling or financial regulation. Fintech-adjacent document accuracy requirements (lender-grade outputs). B2B2C distribution: Katalyst sells to franchisor, franchisor provides to franchisee. Three distinct user tiers with different UX needs. Primary complexity driver is configurability via parameterization, not regulation. Spreadsheet analysis of 4 brands (PostNet, Jeremiahs, Ubreakifix, Tint World) confirmed: identical model structure, only seed values differ (~15-20 parameters). Startup/construction cost detail builder is the one area requiring structural configuration (custom line items per brand).'
---

# Product Requirements Document - Katalyst Franchise Planning Toolbox

**Author:** User
**Date:** 2026-02-08

## Project Classification

- **Project Type:** B2B2C Vertical SaaS Platform
- **Domain:** Franchise Operations with Financial Planning & Analysis engine
- **Complexity:** High — primary driver is parameterization and startup cost detail (brand-parameterized financial engine, UX, documents, wizard steps, educational content), compounded by multi-stakeholder data isolation ("the throuple problem"), complex location lifecycle state management, and FTC compliance constraints on content positioning
- **Project Context:** Greenfield

**Key Classification Notes:**
- Not fintech — no money handling, no financial regulation. Fintech-adjacent document accuracy requirements (lender-grade outputs must be mathematically correct) and FTC content positioning constraints
- B2B2C, not B2B — buyer (franchisor) is not the primary user (franchisee). Three distinct user tiers (franchisee, franchisor admin, Katalyst admin) with completely different UX needs, essentially three different products sharing one data layer
- Spreadsheet deep dive (4 brands) confirmed: the financial model is structurally identical across all brands. "Configuration" is really parameterization — ~15-20 seed values plugged into the same formula engine. No brand-specific formula logic, no different line items, no structural variation in the core financial model
- The one area requiring structural configuration: startup/construction cost detail builder — brands have different expense categories for opening a location, and this is where the tool adds value beyond the current spreadsheets (which just lump startup costs into 2-3 investment numbers)

**Spreadsheet Analysis Summary (4 brands):**

All brands share identical structure across all sheets: P&L Statement, Balance Sheet, Cash Flow Statement, Summary Financials, Returns on Invested Capital, Valuation, Model. Only the Input Assumptions sheet values differ:

| Parameter | PostNet | Jeremiah's | Ubreakifix | Tint World |
|-----------|---------|------------|------------|------------|
| Growth Rate Y1 | 13% | 10% | 13% | 4% |
| Royalty Fee | 5% | 6% | 7% | 6% |
| Ad Fund | 2% | 4.5% | 0% | 6% |
| Materials/COGS | 30% | 22% | 32% | 20% |
| Direct Labor | 17% | 18% | 15% | 20% |
| Facilities $/mo | $10,000 | $75,000 | $40,000 | $7,833 |
| Marketing | 5% | 2% | 5% | 8% |
| Total Investment | $256,507 | $510,784 | $299,250 | $400,000 |
| Equity/Debt Split | 20/80 | 20/80 | 20/80 | 20/80 |

Identical across all: Payroll taxes (20%), Other OpEx (3%), Target pre-tax profit (15%), Shareholder salary adj ($55K), Debt term (144 mo), Interest rate (10.5%), Tax rate (21%), EBITDA multiple (5x).

## Success Criteria

### User Success

**Sam (First-Time Franchisee — Story Mode):**
- Completes a lender-ready financial package within 2-3 guided sessions with their account manager
- Walks into a bank feeling confident — documents look professional and complete
- Understands their own numbers well enough to explain them to a lender (empowerment, not dependency)
- Has ever-present access to book consultant time when stuck or wanting guidance (Calendly-style booking link)
- Can edit any number in the plan — including brand defaults — because they are the author of their plan and responsible for their decisions

**Chris (Scaling Operator — Normal Mode):**
- Builds location #2 plan using location #1 actuals — measurably tighter assumptions
- Identifies where first location deviated from plan and adjusts proactively
- Transitions from "figuring it out each time" to having a repeatable process

**Maria (Portfolio Operator — Expert Mode):**
- Sees exactly when portfolio cash flow supports the next opening
- Compresses development schedule by identifying earlier opening windows
- Spends less time assembling data for lenders/investors — the tool produces it natively

**Cross-persona success signal:** Return engagement rate > 60% — franchisees update their plan after initial completion. If they come back, the tool is a living system. If they don't, it's a disposable calculator.

### Business Success

**Katalyst (6-month gate):**
- 2-3 brands live with active franchisees
- At least one documented instance of tool data informing a Katalyst service decision
- 60-90 days earlier visibility into franchisee planning activity vs. today's post-lease-signing engagement
- Brand onboarding requires configuring fewer than 20 parameters, completable in under 30 minutes by a Katalyst account manager
- Tool data quality sufficient to prove Katalyst's 30-50% construction timeline reduction

**Franchisor:**
- First-ever systematic development pipeline visibility — view pipeline status within 30 seconds of login
- Opt-in data sharing rate > 30% (if below, granularity needs refinement)
- Improved confidence in royalty revenue forecasting based on actual development pipeline data

**No revenue target.** Success is measured by adoption, operational intelligence, and franchisee empowerment — not platform fee revenue.

### Technical Success

- **Parameterized financial model validated:** Single universal model produces correct outputs for all four existing brand parameter sets (PostNet, Jeremiah's, Ubreakifix, Tint World)
- **Startup/construction cost detail builder:** Brand-configurable expense categories that help franchisees walk through and learn/remember all costs of opening a location — the one area requiring structural configuration beyond parameterization
- **All values franchisee-editable:** Every number in the plan is editable by the franchisee (franchisee empowerment). Defaults are seeded by brand parameters with easy "reset to default" buttons, but nothing is locked
- **Multi-session wizard stability:** Save mid-session, resume days later, zero data loss
- **Document accuracy:** Financial outputs match manual spreadsheet calculations exactly
- **Data isolation with opt-in sharing:** Franchisee data invisible to other franchisees; franchisor sees pipeline status by default, financial details only with explicit franchisee opt-in
- **Performance:** ROI/summary calculations < 2 seconds (live-updating as franchisee adjusts inputs); document generation can take longer (not expected to be live-update)
- **Ever-present consultant booking link:** Calendly-style booking link visible across all wizard sessions

### Measurable Outcomes (KPIs)

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Franchisee adoption rate | 80%+ | Per brand, ongoing |
| Quick ROI trial rate | 95%+ | Per brand, ongoing |
| Plan completion rate | 80%+ | Per brand, ongoing |
| Return engagement (plan updates) | 60%+ | 6 months post-launch |
| Opt-in data sharing rate | 30%+ | Per brand, ongoing |
| Consultant booking click-through | 15%+ of sessions | Per brand, ongoing |
| Time to lender-ready package | Baseline, then 50% reduction | 12 months |
| Early engagement window | 60-90 days advance | 6 months |
| Brand onboarding time | < 30 minutes, < 20 parameters | Per brand |
| Model validation | 4/4 brand parameter sets pass | Pre-launch |

## Product Scope

### MVP

1. Parameterized financial engine (single universal model, brand parameter sets, all values franchisee-editable with reset-to-default)
2. Startup/construction cost detail builder (brand-configurable expense categories, guided walkthrough)
3. Onboarding & adaptive experience tiers (Story/Normal/Expert)
4. Quick ROI entry point (5 inputs, under 2 minutes)
5. Multi-session guided business plan wizard with save/resume
6. Ever-present consultant booking link (Calendly-style)
7. 3-scenario modeling + sensitivity analysis + ROI Threshold Guardian
8. Template-driven document production (pro forma P&L, cash flow, balance sheet, break-even, lender-ready PDF)
9. Estimated vs. actual tracking
10. Per-location document vault
11. Opt-in data sharing (franchisee controls what franchisor sees)
12. Franchisor admin dashboard (MVP: read-only pipeline list view)
13. Katalyst admin dashboard (MVP: brand parameter management + cross-brand views)
14. Metrics instrumentation (backend event logging)

### Growth Features (Post-MVP)

- Multi-unit cascade modeling (simulation layer on financial engine)
- Reverse goal-setting entry path ("What ROI do you need?")
- Existing location data import for complete portfolio modeling
- Document intake with data extraction
- Richer admin dashboards with analytics and trend reporting
- Data Flywheel benchmark reports from aggregated franchisee data

### Vision (Future)

- Predictive analytics on location success probability
- Automated early warning for at-risk locations
- Multi-tenant architecture migration
- Integration marketplace (accounting, CRM, project management)
- Lender portal for direct financial package submission
- Contractor/vendor marketplace
- Cross-brand portfolio intelligence
