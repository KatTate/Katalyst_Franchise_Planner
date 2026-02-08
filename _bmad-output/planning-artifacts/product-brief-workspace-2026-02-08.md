---
stepsCompleted: [1, 2]
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
