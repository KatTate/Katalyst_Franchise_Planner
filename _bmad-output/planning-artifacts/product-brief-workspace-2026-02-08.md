---
stepsCompleted: [1, 2, 3, 4]
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
