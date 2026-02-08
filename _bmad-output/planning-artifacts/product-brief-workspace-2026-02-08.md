---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: ['_bmad-output/brainstorming/brainstorming-session-2026-02-08.md', 'attached_assets/katalyst-replit-agent-context-final_1770513125481.md', 'attached_assets/PostNet_-_Business_Plan_1770511701987.xlsx']
date: 2026-02-08
author: User
---

# Product Brief: Katalyst Franchise Planning Toolbox

## Executive Summary

The Katalyst Franchise Planning Toolbox is a customizable, franchisor-branded platform that guides franchisee owners through ROI calculation, financial forecasting, scenario planning, and location opening preparation. Built on a "franchisee-first" empowerment philosophy, the tool transforms the overwhelming process of planning a new franchise location into a guided self-assessment journey where the franchisee is the author of their plan, not a passive recipient of a generated report.

**Why franchisors pay for it:** Katalyst's historical average is a 30-50% reduction in construction timelines for franchise brands. When a franchisor accelerates from 15 to 25-30 openings per year, royalty income doesn't just increase — it compounds. Every location opened earlier generates royalties earlier, and those royalties compound year over year. This tool is the digital infrastructure that makes that acceleration systematic and visible — giving franchisors development pipeline visibility they've never had and franchisees planning power that reduces failed openings.

**Why Katalyst builds it regardless:** Even without charging anyone for the platform, the tool gives Katalyst visibility into currently inaccessible franchisee planning data — site evaluations, financial assumptions, construction timelines, funding status. This operational intelligence makes Katalyst's existing service delivery (design, construction management, fixture manufacturing) measurably better. The platform fee from the franchisor is revenue; the data is operational intelligence. Dual-value business case.

Katalyst deploys and configures the platform for each franchise brand client, entering FDD data, setting brand benchmarks, and customizing the experience. The franchisor provides it to their franchisees as a planning resource. PostNet serves as the launch brand.

The MVP delivers adaptive experience tiers (from first-time owner to seasoned multi-unit operator), three entry paths (Quick ROI, guided business plan, reverse goal-setting), a full financial engine with scenario planning and document production, multi-unit cascade modeling, estimated vs. actual tracking, and a per-location document vault.

---

## Core Vision

### Problem Statement

Franchise owners planning new locations face a fragmented, overwhelming process with no guided path from "I want to open a location" to "I have a funded, shovel-ready plan." They receive a complex spreadsheet (if anything at all) and are left to figure out ROI projections, construction budgets, financing, and timeline planning on their own. Most default to guessing, copying numbers from their existing location, or winging it — leading to bad site selections, budget overruns, and delayed openings.

The problem compounds across stakeholders: franchisees can't plan effectively, franchisors can't see their development pipeline, and service partners like Katalyst get engaged too late to prevent costly mistakes.

### Problem Impact

- Franchisees make lease and construction commitments before understanding the true ROI impact, often engaging expert help too late to avoid costly mistakes
- Franchisors lack visibility into their development pipeline — they don't know where franchisees are in the planning process until problems surface. This blind spot means they can't forecast royalty revenue accurately or allocate support resources proactively
- Multi-unit operators have no dynamic model showing when their portfolio cash flow supports opening the next location, leading to either over-leveraging or missed expansion windows
- The planning process generates no reusable data — every application for financing, every conversation with a contractor, starts from scratch
- Financial planning and construction planning exist in separate worlds, so a 3-week construction delay never shows up as an ROI impact

### Why Existing Solutions Fall Short

Current approaches to franchise location planning fall into three categories, all inadequate:

1. **The Spreadsheet** — Franchisors hand franchisees an Excel workbook (like the PostNet Business Plan). It contains the right financial complexity but offers no guidance, no scenario modeling, no education, and no tracking. Most franchisees are intimidated by it and never complete it properly. A first-time franchisee and a 27-location veteran get the same undifferentiated experience.

2. **Generic Business Plan Tools** — Products like LivePlan or Enloop are designed for startups, not franchise operators. They don't understand FDD data structures, franchise-specific cost categories, multi-unit portfolios, or the franchisor-franchisee relationship. They also can't produce the specific financial documents franchise lenders require.

3. **Franchise Development CRMs** — Tools like FranConnect focus on the franchisor's sales pipeline, not the franchisee's planning journey. They track deals, not financial readiness. The franchisee is a row in the franchisor's database, not a user with their own needs.

None of these solutions guide the franchisee through the actual decision-making process. None connect site selection to construction to financing to ROI. None track estimated vs. actual performance. None adapt to the franchisee's experience level. And none serve the three-stakeholder reality of franchise expansion (franchisee, franchisor, service partner).

### Proposed Solution

A guided, adaptive financial planning and location management platform that:

- **Adapts to the operator** through experience tiers — a first-time business owner gets full guidance and education at every step; a seasoned multi-unit operator gets a power-user interface with all levers exposed. Same underlying financial engine, same rigor of output, different presentation layer. Determined through simple onboarding questions ("Is this your first franchise location?" "How many locations do you currently operate?")
- **Hooks immediately** with a 5-input Quick ROI that delivers a preliminary range in under 2 minutes
- **Deepens progressively** through a guided business plan wizard or reverse goal-setting mode ("What ROI do you need?")
- **Models reality** with good/better/best scenario planning, sensitivity analysis, and a persistent ROI Threshold Guardian
- **Produces real documents** — pro forma P&L, cash flow projections, balance sheets, break-even analyses ready for bank submissions
- **Lives beyond the plan** through estimated vs. actual tracking that evolves the pro forma from best guess to ground truth
- **Scales with the operator** via multi-unit cascade modeling that shows when the portfolio generates enough cash to trigger the next opening
- **Stores everything** in a per-location document vault that organizes leases, permits, bids, and contracts
- **Educates without forcing** through optional financial literacy layers on every document and metric

The tool is configured per franchise brand by Katalyst, who enters FDD data, sets benchmarks, and customizes the branding — creating the service engagement that justifies the platform fee.

### Key Differentiators

1. **Franchisee-first empowerment design** — The franchisee is the author of their plan, not a passive recipient of a generated report. This isn't philosophical decoration; it's a legal necessity (FTC compliance) turned into a UX strength. No other tool is designed from this perspective.

2. **Adaptive experience tiers** — Same financial engine, different guidance levels. A first-time owner and a 27-location veteran both produce equally rigorous plans. The tool adjusts how much it guides, explains, and surfaces — not what it calculates.

3. **Three-stakeholder value in a single tool** — Franchisee gets planning power, franchisor gets pipeline visibility and accelerated royalty compounding, Katalyst gets operational intelligence for better service delivery. One data entry serves all three.

4. **Living plan, not a one-time exercise** — Estimated vs. actual tracking means the tool stays relevant after opening day, creating permanent engagement rather than a disposable planning artifact.

5. **Multi-unit cascade modeling** — Completely unserved need. No tool shows multi-unit operators when their portfolio cash flow supports the next opening.

6. **Katalyst's domain expertise embedded in the product** — The tool's workflow mirrors Katalyst's physical-world frameworks (QuickBrick, Balanced Servicescape, 5-Gear). Two decades of opening thousands of locations informs how the guided journey is structured — naturally surfacing the moments where space, construction, and timeline decisions have the biggest ROI impact.

7. **Financial complexity preserved, not dumbed down** — Summary views for confidence, full detail for due diligence, education for understanding. The financial documents produced are the actual documents lenders require.

### Architectural Direction

- **MVP deploys as isolated instances per brand** — each franchisor gets their own deployment with separate data, configuration, and hosting. Complete data isolation for franchisor confidentiality, simpler per-brand customization, and straightforward MVP delivery.
- **Architecture designed to support future multi-tenant consolidation** — as brand count grows, the operational overhead of isolated instances will drive migration to shared infrastructure with application-layer data partitioning. Cross-brand analytics for Katalyst become native at that point.
- **This is a stateful planning system, not a calculator** — locations move through lifecycle states (planning, site evaluation, under construction, open, operating). Portfolios contain locations in different states simultaneously. The data model and architecture must support persistent, long-lived user data with complex state transitions.

---

## Target Users

### Primary Users

#### Persona A: "Sam" — The First-Time Franchisee (Story Mode)

**Snapshot:** Age 30-45. Former corporate manager (hospitality/retail) or owner of a single independent business who has purchased their first franchise unit. Often financed via SBA/owner equity. Technically competent but new to franchising mechanics.

**Background:** Corporate or small-business background — store manager, restaurant manager, district manager, or independent small business owner. Little prior multi-site experience. Decision driven by desire for a known model and lower risk vs. an independent startup.

**Emotional state at first engagement:** Excited but anxious. Hopes the franchisor/system is "solved," worried about hidden costs, timeline slippage, and getting the first store open without wrecking the family finances. Feels overwhelmed by the checklist (site, LOI, construction, equipment, operations). Needs structure to feel less adrift.

**Goals:** Open on time and on or under budget. Validate the business economics (recoup investment). Get a replicable ops system that yields predictable staffing and revenue.

**Knowledge/sophistication:** Understands P&L basics but not highly sophisticated in pro-formas or capital structures. Relies on franchisor Item 19, simple spreadsheets, and outside advisors for financing. Needs hand-holding to translate pro-forma numbers to their cashflow reality.

**Pain points:**
- Fear of unknown construction costs and schedule overruns
- Lack of confidence reading Item 19 or converting it to a lender-friendly pro-forma
- Overwhelm managing contractors, suppliers, and the franchisor's requirements simultaneously

**What the tool gives them:** A "confidence pack" — clear milestone roadmap, easy lender-grade pro-forma walkthrough, 3-scenario modeling (low/likely/high) mapped to Item 19, and educational layers at every step explaining what each number means and why it matters.

**"Aha!" moment:** When the Quick ROI entry shows them a realistic range in under 2 minutes and they think: "I can actually understand this."

#### Persona B: "Maria" — The Multi-Unit Portfolio Operator (Expert Mode)

**Snapshot:** Age 40-60. Owns or manages 5+ locations (often under a Multi-Unit Operator Agreement). Financially sophisticated, uses pro-formas, portfolio-level KPIs, and debt to scale. Often runs a single brand (deep) or several related brands (adjacent diversification).

**Background:** Either built from a single store and scaled up, or came in as a serial operator/entrepreneur with experience managing multi-site logistics and teams. Has relationships with lenders and general contractors.

**Emotional state when engaging:** Pragmatic and transactional. Focused on throughput — how fast and cheaply can I open units that meet target returns. Less emotionally fragile than first-timers but intolerant of wasted time and ambiguity. Values predictability, repeatability, and measurable returns.

**Goals:** Optimized unit economics at scale (margins, labor efficiency). Shortened time-to-open and consistent quality across sites. Reliable capital plans and predictable supplier chains.

**Knowledge/sophistication:** High — comfortable with multi-period pro-formas, debt/leverage scenarios, unit-level P&L, and portfolio forecasting. Expects Item 19 data, pro-forma templates, and verified asset data. Will layer financing assumptions (e.g., 60-80% leverage) to model returns.

**Pain points:**
- Operational scaling friction: inconsistent contractors, variable lead times, ad hoc cost creep across sites
- Need for integrated systems (construction timelines, supplier commitments, payroll, ops) that scale predictably
- Franchisor process limitations and slow decision loops that block development cadence

**What the tool gives them:** Portfolio dashboard with unit cost variance, time-to-open tracking, and unit economics. Advanced pro-forma models with what-if scenarios for leverage. Multi-unit cascade modeling showing when portfolio cash flow supports the next opening. Integration-ready data for lenders or investors.

**"Aha!" moment:** When the cascade model shows them exactly when their existing portfolio generates enough cash flow to trigger opening #8, and they realize they can compress their development schedule by 6 months.

#### Persona C: "Chris" — The Scaling Operator (Normal Mode)

**Snapshot:** Age 30-50. Has opened 1-3 locations and is learning the repeatable parts of rollout. Not a rookie but not a portfolio operator. Typically still materially involved in day-to-day ops; capacity and systems are the primary constraints.

**Why this persona is distinct:** Qualitatively different from both extremes — understands field operations and the basic pro-forma but lacks portfolio systems, developer relationships, and capital sophistication. Needs to establish repeatability and avoid the hard learning curve that kills scale.

**Background:** Has proven the model works with their first location(s). Now trying to systematize what was previously done through personal effort and learning-on-the-fly.

**Emotional state:** Ambitious and stretched. Confident that the model works, nervous about replicating success, and frustrated by inefficiencies that made the second/third site costlier or slower than the first.

**Goals:** Build a repeatable opening playbook and control initial cost drift. Move from owner-operator to operator-manager by creating reliable subcontractor and supplier relationships and a replicable construction template.

**Knowledge/sophistication:** Medium — can read basic pro-formas and unit economics, but needs help with financing tactics for multiple builds and with systems to manage concurrent projects.

**Pain points:**
- Turning one success into a repeatable, contractable process
- Managing concurrent projects without portfolio-grade systems
- Financing tactics for second/third location when cash flow is still building

**What the tool gives them:** Guided experience with education available on demand (not forced). Side-by-side comparison with their first location's actuals. Templated financial tools and scenario modeling that builds their sophistication. A bridge between first-time hand-holding and full portfolio power tools.

**"Aha!" moment:** When they compare their first location's estimated vs. actual and see exactly where their assumptions were off — then use those real numbers to build a much tighter plan for location #2.

### Secondary Users

#### The Katalyst Team (Internal Operations)

**Role:** Uses aggregated franchisee planning data for operational intelligence — better timing of service engagements, more accurate construction planning, and proactive identification of at-risk locations.

**Key interactions:** Views pipeline dashboards, accesses franchisee financial assumptions for service scoping, identifies engagement timing windows (e.g., franchisee is in site evaluation phase — time to introduce design services).

**Value received:** Visibility into previously inaccessible data that makes existing service delivery measurably better across design, construction management, and fixture manufacturing.

#### The Franchisor Development Team (Pipeline Visibility)

**Role:** Reviews development pipeline status across their franchisee base — who is in planning, who is in site evaluation, who is under construction, who is stalled.

**Key interactions:** Views pipeline dashboards showing franchisee progress, projected opening timelines, and development schedule. Does NOT interact with individual franchisee financial details (data isolation).

**Value received:** For the first time, the franchisor can see their development pipeline as a pipeline — forecast royalty revenue timing, allocate support resources proactively, and identify bottlenecks before they become failed openings.

### User Journey

#### Discovery
The franchisee doesn't "discover" the tool independently. The franchisor introduces it post-franchise-agreement signing as a planning resource, or Katalyst introduces it during their service engagement onboarding. This is a B2B2C distribution model — the tool is provided, not sought.

#### Onboarding
Three onboarding questions determine the experience tier: "Is this your first franchise location?" / "How many locations do you currently operate?" / "Have you built a business plan or pro-forma before?" The system recommends Story Mode, Normal Mode, or Expert Mode. The franchisee can override the recommendation at any time.

#### First Value (The Hook)
Regardless of tier, the first interaction is the Quick ROI entry — 5 inputs, under 2 minutes, preliminary ROI range. This gives immediate value before asking the franchisee to commit to the deeper planning process.

#### Core Usage
Iterative deepening through the guided business plan wizard or reverse goal-setting mode. Franchisee returns multiple times over weeks/months as they progress through site evaluation, financing, and construction planning. The plan evolves from estimates to commitments to actuals.

#### Success Moment
Differs by persona:
- **Sam:** Walks into a bank with a lender-grade financial package and gets asked "who helped you put this together?" — the plan looks professional and complete.
- **Chris:** Compares location #2 projections against location #1 actuals and sees a measurably tighter plan.
- **Maria:** The cascade model reveals an opening opportunity 6 months earlier than her current schedule assumed.

#### Long-term Engagement
Estimated vs. actual tracking keeps the tool relevant after opening day. The plan becomes a living operational document. Multi-unit operators return for each new location, importing proven assumptions from previous ones.

---

## Success Metrics

### Critical Context: High-Touch Delivery Model

These metrics must be understood in the context of Katalyst's delivery model: every franchisee has a dedicated Katalyst account manager/consultant who walks them through the tool personally. This is not a self-serve SaaS product with anonymous users — it's a guided, relationship-driven platform. This fundamentally changes adoption expectations (high — approaching 100%) and baseline data quality (account managers correct and fine-tune estimates with franchisees using Katalyst's years of brand-specific experience).

### User Success Metrics (Franchisee Value)

**Plan Completion Rate**
- Target: 80%+ of franchisees who start Quick ROI entry proceed to build a full business plan (high target justified by 1:1 account manager guidance)
- Measurement: Funnel tracking from Quick ROI to completed plan with at least one scenario modeled
- Why it matters: If franchisees start but don't continue despite having a personal guide, the tool itself has a UX problem

**Time to Lender-Ready Package**
- Baseline: Establish current average (likely weeks to months of ad hoc spreadsheet work for first-timers; unknown because it's untracked today)
- Target: First-time franchisee produces a lender-grade financial package within 2-3 guided sessions with their account manager
- Measurement: Time from first login to first document export/download
- Why it matters: This is Sam's "aha!" moment — the tool proves its value when the bank says "who helped you put this together?"

**Return Engagement (Living Plan Indicator)**
- Target: 60%+ of active franchisees update their plan at least once after initial completion (updating estimates with actuals, refining scenarios as site selection narrows)
- Measurement: Sessions per franchisee over time; data updates post-initial plan
- Why it matters: If franchisees don't come back, this is a one-time calculator, not a living planning system. Return engagement proves the "estimated vs. actual" tracking creates ongoing value

**Experience Tier Accuracy**
- Target: Less than 20% of users override the system-recommended experience tier
- Measurement: Tier recommendation vs. tier actually used
- Why it matters: If users constantly switch away from the recommended tier, the onboarding questions aren't calibrated correctly

**Baseline Estimate Quality**
- Target: Franchisee initial estimates are within 25% of brand benchmarks (seeded by Katalyst from years of brand-specific data) after account manager guidance session
- Measurement: Variance between franchisee estimates and brand benchmark defaults at plan completion
- Why it matters: Baseline data only works as a proof point for Katalyst's service impact if the starting estimates are credible. Wildly optimistic or pessimistic baselines undermine the entire estimated vs. actual comparison. Account managers ensure quality, but the tool should track divergence to flag potential issues

### Business Objectives (Katalyst Value)

**Early Engagement Window**
- Target: Katalyst gains 60-90 days of advance visibility into franchisee site selection and finance development activity, compared to today's pattern of post-lease-signing engagement
- Measurement: Time between first franchisee activity in the tool and first Katalyst service engagement, compared to pre-tool baseline
- Why it matters: This is the single most valuable operational intelligence metric. Earlier engagement means better design decisions, more accurate construction planning, and fewer "I signed a lease and need to open in 3 weeks" emergencies

**First Actionable Insight (Time to Katalyst Value)**
- Target: Within 6 months of deployment for a brand, Katalyst uses tool data to make at least one service decision that would not have been possible without the tool
- Measurement: Qualitative — documented instance of tool data informing a Katalyst service engagement, resource allocation, or construction planning decision
- Why it matters: The tool must prove value to Katalyst's own operations, not just franchisees. This metric answers "is the operational intelligence real?" Requires 2-3 brands live within the 6-month window to have an honest evaluation

**Baseline Data Collection for Service Impact Proof**
- Target: 80%+ of franchisees using the tool have complete estimated timelines, costs, and milestones entered before Katalyst's construction services begin
- Measurement: Data completeness at the point of Katalyst service engagement
- Why it matters: Katalyst's 30-50% construction timeline reduction is real but hard to prove once Katalyst takes over a brand's openings (no control group — "we deleted the control sample"). The tool creates the baseline data — franchisee's original estimates, refined with account manager guidance — against which Katalyst's actual delivery can be measured

**Multi-Year Portfolio Forecast Visibility**
- Target: Multi-unit operators (Persona B and C) maintain forward-looking location plans that give Katalyst a 12-24 month development forecast
- Measurement: Number of "planned" locations in the system with projected timelines beyond the current active project
- Why it matters: Allows Katalyst to plan resource allocation, supplier commitments, and staffing for future projects instead of reacting to inbound requests

### Business Objectives (Franchisor Value)

**Development Pipeline Visibility**
- Target: Franchisor can see real-time status of all franchisee location plans — who is planning, who is in site evaluation, who is under construction, who is stalled
- Measurement: Franchisor admin dashboard usage and pipeline data completeness
- Why it matters: Franchisors currently have no systematic visibility into their development pipeline. This is the first time they can forecast royalty revenue timing from actual franchisee planning data

**Opening Pace Acceleration**
- Target: Measurable increase in locations opened per year after tool adoption (attributable jointly to the planning tool and Katalyst's services)
- Measurement: Year-over-year location openings per brand, pre and post tool adoption
- Why it matters: The franchisor's ROI case — compounding royalty revenue from faster openings — depends on this metric trending upward

### Key Performance Indicators (MVP / First Year)

| KPI | Target | Measurement Method |
|-----|--------|-------------------|
| Franchisee adoption rate | 80%+ of new franchisees actively use the tool | Active users / total new franchisees per brand |
| Trial rate (Quick ROI) | 95%+ try the Quick ROI entry | Quick ROI started / total registered users |
| Plan completion rate | 80%+ start-to-finish | Funnel: Quick ROI to completed plan |
| Return engagement | 60%+ update plan post-initial completion | Repeat sessions with data changes |
| Time to lender-ready package | Establish baseline, then reduce by 50% | First login to first document export |
| Baseline estimate quality | Within 25% of brand benchmarks | Estimate vs. benchmark variance |
| Early engagement window | 60-90 days advance visibility | First tool activity to first Katalyst engagement |
| First actionable insight | Within 6 months of brand deployment | Documented decision informed by tool data |
| Baseline data completeness | 80%+ have estimates before construction starts | Data completeness audit at service engagement |
| Brands onboarded (Year 1) | 2-3 brands configured and live | Brand count with active franchisees |

### MVP Validation Framework

**PostNet = Proof of Concept:** At 5-10 franchisees per year, PostNet validates "does this tool work at all?" — does the financial engine handle PostNet's data model, do franchisees find it valuable with account manager guidance, does the workflow feel right? Statistical significance on metrics is not achievable at this volume. PostNet proves the concept.

**Second Brand = Proof of Scale:** At 20-25 franchisees per year, the second brand validates "does this generalize?" — does the configurable financial engine handle a different brand's cost structures, does adoption hold without PostNet-specific assumptions baked in, do the metrics start to show meaningful patterns? This is where the numbers start to mean something.

**6-Month Evaluation Gate:** At 6 months post-launch with 2-3 brands live, Katalyst conducts an honest evaluation: Is the operational intelligence real? Has at least one service decision been informed by tool data? Are franchisees completing plans? Is the data quality sufficient for baseline comparisons? This is the go/no-go for continued investment.

### Metrics Instrumentation Requirement (MVP Scope)

The MVP must include backend event logging on key state transitions and user actions, even where no user-facing reporting exists yet. This is not a feature franchisees see — it's the infrastructure that powers every metric above and prevents the "we forgot to measure" problem.

**Required event logging:**
- Account created, onboarding tier selected/overridden
- Quick ROI started, Quick ROI completed
- Business plan wizard started, each section completed, plan finalized
- Scenario created, scenario compared
- Document exported/downloaded (by type)
- Estimated vs. actual data entered or updated
- Location lifecycle state transitions (planning, site evaluation, under construction, open, operating)
- Document vault uploads
- Session timestamps and duration

This event data also feeds the **Data Flywheel**: as franchisees complete plans, update estimated vs. actual, and progress through location lifecycles, the system accumulates brand-specific benchmark data. Over time, this enables more accurate default assumptions for new franchisees, better Katalyst service scoping, and stronger franchisor reporting. The MVP must capture the data fields that power future benchmarks, even if benchmark reports are not surfaced in the MVP.

---

## MVP Scope

### Design Philosophy

Great design is as simple as it can possibly be and no simpler. Opening and starting a new business is inherently complex — the MVP must honor that complexity while making it navigable. This is not a product where "ship less" means "ship better." The minimum viable version is the version that handles the real financial planning workflow end-to-end, with adaptive guidance that makes complexity accessible without dumbing it down.

### Technical Architecture Principles (MVP)

These principles emerged from architectural review and must be respected throughout implementation:

1. **Configuration-driven financial engine, not code-driven.** PostNet's business plan has specific line items, categories, and formulas. The second brand will have different ones. The engine must use a schema-driven financial model where Katalyst configures line items, formulas, and relationships per brand. If the engine is built with PostNet's structure hardcoded, the second brand deployment becomes a rewrite, not a configuration. This is non-negotiable even though PostNet is the only brand at launch.

2. **Cascade modeling is a simulation layer on top of the per-location financial engine.** These are separate concerns. The financial engine calculates per-location financials. The cascade model aggregates across locations, projects forward, and identifies trigger points for the next opening. Mixing these will create an unmaintainable system.

3. **Template-driven document production.** Pro forma P&L, cash flow, balance sheet, break-even — these are structured financial documents with formats lenders expect. Different brands may need different layouts. Template-driven generation from day one prevents a rewrite for every new brand.

4. **UX configuration is as deep as financial configuration.** If line items and categories are configured per brand, the wizard steps, educational content, and guidance layers must be configured per brand as well. A PostNet franchisee sees PostNet-specific guidance. The second brand's franchisees see different guidance. The UX layer is not generic — it's brand-aware.

### Implementation Sequence Recommendation

The implementation sequence optimizes for two things: technical dependencies (build foundations before features) and demo readiness (the PostNet deployment is also the sales demo for the second brand).

**Phase 1 — Foundation:** Financial engine (configuration-driven), user management, onboarding flow, brand configuration
**Phase 2 — Core Experience:** Quick ROI entry, guided business plan wizard (multi-session), scenario modeling, sensitivity analysis, ROI Threshold Guardian
**Phase 3 — Output:** Document production (template-driven), lender-ready export
**Phase 4 — Lifecycle:** Location lifecycle state management, estimated vs. actual tracking
**Phase 5 — Portfolio:** Multi-unit cascade modeling (simulation layer on top of engine)
**Phase 6 — Support Systems:** Document vault, admin dashboards (franchisor + Katalyst), metrics instrumentation

The vault and dashboards are lowest technical risk — straightforward CRUD. The engine and cascade are where the complexity lives.

### Core Features (MVP)

#### 1. Onboarding & Adaptive Experience Tiers
- 3-question onboarding flow that recommends Story Mode, Normal Mode, or Expert Mode based on franchisee experience level
- Franchisee can override the recommendation at any time and switch tiers during use
- Brand-specific configuration: logo, colors, FDD data, and benchmark defaults seeded by Katalyst during brand setup
- FTC Franchise Rule compliance built into onboarding: tool is positioned as a self-assessment planning resource, not a sales or earnings claims tool

#### 2. Entry Paths (MVP: Two primary, one deferred)

**MVP Entry Paths:**
- **Quick ROI Entry:** As few inputs as possible to deliver a valid preliminary ROI range. The constraint is "right inputs for real value," not an arbitrary input count or time limit. The goal is an immediate hook that demonstrates the tool's value before the franchisee commits to the full planning process
- **Guided Business Plan Wizard:** Step-by-step financial plan builder that walks the franchisee through every section of the business plan, with educational layers available at each step (surfaced in Story Mode, available on demand in Normal Mode, tucked away in Expert Mode). **Designed for multi-session completion** — the wizard is not a single continuous flow. Clear progress indicators, graceful save/resume, and session-appropriate complexity. Story Mode sequences decisions across multiple sessions so Sam never feels overwhelmed in a single sitting, even with account manager guidance.

**Deferred to v1.1:**
- **Reverse Goal-Setting:** "What ROI do you need?" — works backward from a target return to show what inputs would need to be true. Powerful for experienced operators but not essential for PostNet proof of concept. Will strengthen the pitch to the second brand where more multi-unit operators will use it.

#### 3. Financial Engine
- Configurable, schema-driven financial calculation engine — line items, cost categories, revenue assumptions, formulas, and relationships are all configured per brand by Katalyst
- PostNet Business Plan spreadsheet logic is the first configuration, not the hardcoded model
- Good/better/best scenario modeling (3-scenario planning minimum)
- Sensitivity analysis: which inputs have the biggest impact on ROI, surfaced visually so franchisees understand their key risk levers
- ROI Threshold Guardian: persistent monitoring that alerts when changes to any input push the projected return below an acceptable threshold (configurable per brand by Katalyst)

#### 4. Document Production
- Pro forma P&L (income statement)
- Cash flow projections
- Balance sheet
- Break-even analysis
- Lender-ready export format (PDF) — documents must meet the standard franchise lenders expect
- Template-driven generation: document layouts are configured per brand so different brands can produce documents in their required formats
- All documents reflect the franchisee's own inputs and scenario selections — the franchisee is the author

#### 5. Multi-Unit Cascade Modeling
- Portfolio view across multiple locations in different lifecycle states
- Cash flow cascade: models when the portfolio's aggregate cash flow generates enough to support opening the next location
- Per-location lifecycle state tracking: planning, site evaluation, under construction, open, operating
- Implemented as a simulation layer on top of the per-location financial engine — separate concerns
- MVP models locations planned and tracked through the tool; importing existing location data is a fast follow

#### 6. Estimated vs. Actual Tracking
- Side-by-side comparison of projected vs. actual performance for each location
- Evolves the pro forma from best guess to ground truth as real operating data comes in
- Enables Persona C's "aha!" moment: using location #1 actuals to build a tighter plan for location #2
- Creates the baseline data that proves Katalyst's service impact (solves the "deleted control sample" problem)

#### 7. Document Vault
- Per-location file storage for leases, permits, bids, contracts, and other planning documents
- Upload and organize — simple folder/category structure per location
- No external service integration required for MVP (no Google Drive, no Dropbox — native storage)

#### 8. Admin Dashboards (MVP versions)

**Franchisor Admin Dashboard:**
- Pipeline view: all franchisees and their current lifecycle state per location
- Projected opening timelines across the franchisee base
- Basic status filtering and sorting
- No access to individual franchisee financial details (data isolation)

**Katalyst Admin Dashboard:**
- Cross-brand visibility: all brands, all franchisees, all locations
- Engagement timing indicators: which franchisees are in site selection, which are approaching construction phase
- Data completeness tracking: which franchisees have complete plans vs. incomplete
- Basic operational intelligence views for service planning

Both dashboards start as functional list views with status filters and basic timeline visualization — growing into richer analytics over time.

#### 9. Metrics Instrumentation
- Backend event logging on all key state transitions and user actions as defined in the Success Metrics section
- Timestamp logging: account creation, onboarding, Quick ROI, wizard progress, document exports, scenario creation, estimated vs. actual updates, lifecycle state changes, document vault uploads, session data
- Not a user-facing feature — infrastructure that powers every success metric and prevents the "we forgot to measure" problem
- Also captures the raw data that feeds the future Data Flywheel

### Out of Scope for MVP

**Reverse Goal-Setting Entry Path (v1.1)**
- "What ROI do you need?" working backward to required inputs
- Deferred because Quick ROI + Guided Wizard cover the primary use cases for PostNet's proof of concept
- Prioritized for v1.1 to strengthen the pitch to the second brand where more sophisticated operators will use it

**Existing Location Data Import (Fast Follow)**
- Multi-unit operators cannot enter historical data for already-open locations to see their full portfolio in the cascade model
- MVP cascade modeling works with locations planned and tracked through the tool
- Fast follow: a streamlined data entry flow for importing existing location financials so operators see their complete portfolio picture
- This is the most important post-MVP feature for multi-unit operators

**Document Intake / Data Extraction**
- Automated extraction of data from uploaded documents (leases, FDDs, financial statements)
- MVP vault is storage and organization only — no parsing or data extraction
- Fast follow priority: enables capturing structured data from documents franchisees already have, reducing manual entry

**Advanced Analytics and Benchmarking Reports**
- Brand-specific benchmark reports derived from aggregated franchisee data (the Data Flywheel output)
- MVP captures the data; post-MVP surfaces the insights
- Requires sufficient data volume (multiple brands, multiple completed location lifecycles) to be meaningful

**External Integrations**
- Google Drive, Dropbox, or other cloud storage integration for document vault
- Accounting software integration (QuickBooks, Xero) for actual financial data import
- CRM integration (FranConnect or similar) for franchisor pipeline sync
- All deferred to post-MVP based on user demand

**Multi-Brand Portfolio View**
- Operators running locations across multiple franchise brands seeing a unified portfolio view
- MVP is single-brand per deployment (isolated instances); cross-brand views require future multi-tenant architecture

**AI/ML Features**
- AI-powered financial projections, natural language plan generation, or automated recommendations
- The tool empowers human decision-making; it does not make decisions for the franchisee
- May be explored post-MVP for specific use cases (e.g., anomaly detection in estimated vs. actual variance)

### MVP Success Criteria

The MVP is validated through the 6-Month Evaluation Gate defined in Success Metrics:

1. **2-3 brands live** within 6 months of initial deployment (PostNet + at least one additional brand)
2. **80%+ franchisee adoption** across live brands (justified by high-touch account manager model)
3. **At least one documented instance** of Katalyst using tool data to make a service decision that would not have been possible without the tool
4. **Franchisees produce lender-ready packages** through the tool (validated by account manager confirmation)
5. **Estimated vs. actual tracking** is being used by at least one franchisee with an open location
6. **Admin dashboards** are being used by both Katalyst team and at least one franchisor development team

If these criteria are met, the product thesis is validated and investment in post-MVP features is justified.

### Future Vision

**Year 1-2: Platform Maturation**
- Reverse goal-setting entry path
- Existing location data import for complete portfolio modeling
- Document intake with data extraction
- Richer admin dashboards with analytics and trend reporting
- Data Flywheel begins producing brand-specific benchmarks
- 5-10 brands on the platform

**Year 2-3: Intelligence Layer**
- Aggregated benchmark data enables "operators like you" comparisons
- Predictive analytics on location success probability based on accumulated data
- Automated early warning system for at-risk locations (estimated vs. actual variance triggers)
- Multi-tenant architecture migration as operational overhead of isolated instances grows
- Potential for franchisee self-serve onboarding (reduced dependency on Katalyst account managers for tool setup)

**Year 3+: Ecosystem Expansion**
- Integration marketplace: accounting, CRM, project management tools
- Lender portal: direct submission of financial packages to franchise-friendly lenders
- Contractor/vendor marketplace: connecting franchisees to vetted service providers (including Katalyst services)
- Cross-brand portfolio intelligence for multi-brand operators
- The tool becomes the operating system for franchise location lifecycle management
