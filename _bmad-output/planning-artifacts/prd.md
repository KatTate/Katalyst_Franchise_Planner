---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
inputDocuments: ['_bmad-output/planning-artifacts/product-brief-workspace-2026-02-08.md', '_bmad-output/brainstorming/brainstorming-session-2026-02-08.md', 'attached_assets/katalyst-replit-agent-context-final_1770513125481.md', '_bmad-output/planning-artifacts/reference-data/PostNet_-_Business_Plan_1770511701987.xlsx', 'attached_assets/Pasted-Persona-A-First-Time-Franchisee-Sam-The-New-Owner-Snaps_1770523428988.txt']
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
- **Complexity:** High — primary driver is parameterization and startup cost detail (brand-parameterized financial engine, UX, documents, planning experience, educational content), compounded by multi-stakeholder data isolation ("the throuple problem"), AI-powered conversational planning layer (Story Mode), complex location lifecycle state management, and FTC compliance constraints on content positioning
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
- **Startup/construction cost detail builder:** Brand-defined templates with variable line items per brand. Franchisees can add/remove/edit any line item. "Reset to brand defaults" restores template without losing custom additions. Total feeds into financial engine as "Total Investment Required"
- **All values franchisee-editable:** Every number in the plan is editable by the franchisee (franchisee empowerment). Defaults are seeded by brand parameters with easy "reset to default" buttons, but nothing is locked
- **Multi-session planning stability:** Save mid-session, resume days later, zero data loss. Auto-save every few minutes for crash recovery. Applies across all three experience tiers (Story Mode conversation, Normal Mode forms, Expert Mode spreadsheet).
- **Document accuracy:** Financial outputs match manual spreadsheet calculations exactly
- **Data isolation with opt-in sharing:** Franchisee data invisible to other franchisees. Without opt-in, franchisor sees pipeline status only (when/where: stage, quarter, market). With opt-in, franchisor additionally sees financial details (how much: projections, investment, documents). Opt-in UI makes value exchange visible
- **Performance:** ROI/summary calculations < 2 seconds (live-updating as franchisee adjusts inputs); document generation can take longer (not expected to be live-update)
- **Ever-present consultant booking link:** Calendly-style booking link visible across all planning sessions
- **AI Planning Advisor accuracy:** AI-populated financial values validated against field schemas before writing to input state. Franchisee can verify and correct any AI-populated value.
- **ROI Threshold Guardian:** Advisory, not blocking. Handles both outlier inputs (unrealistic growth) and weak business cases (low ROI) — guides without judging, suggests levers to adjust

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

## User Journeys

### Journey 1: Sam — First Location, First Plan (Story Mode)

**Opening Scene:** Sam signed his PostNet franchise agreement six weeks ago. He's sitting at his kitchen table at 9 PM, laptop open, trying to make sense of a 47-page Franchise Disclosure Document and a spreadsheet someone emailed him. He needs to go to the bank next month. His wife asks how it's going. He says "fine" but his stomach knots.

His Katalyst account manager, Denise, sends him a link: "Hey Sam, before our call Thursday, try this — takes two minutes." It's the Quick ROI entry.

**Rising Action:**

*Session 1 (alone, 10 minutes):* Sam clicks the link. Three onboarding questions determine he's a first-timer — Story Mode activates. The Quick ROI asks for 5 inputs: location type, estimated investment, expected revenue, and two quick cost percentages. In 90 seconds, Sam sees a preliminary ROI range: "Based on these inputs, your estimated annual return is 12-18%." There's a note: "This is a rough range. Your full plan will refine this significantly." He sees the consultant booking link in the corner — "Book time with Denise" — and clicks it. Thursday confirmed.

*Session 2 (with Denise, 45 minutes):* They open the planning tool together. Story Mode activates the AI Planning Advisor — a conversational interface on the left with a live financial dashboard on the right. The advisor opens: "Welcome back, Sam! Last time we got your Quick ROI range. Let's start building your full plan. Tell me about the location you're considering."

Sam types: "I'm looking at a spot on Main Street, rent is about $4,200 a month." The advisor extracts the location and rent, populates the facilities cost field, and the dashboard updates in real-time. "Great — $4,200/month for Main Street. I've updated your plan. The PostNet average is around $10,000/month, so your rent is favorable. Now, let's talk startup costs."

The advisor guides Sam through the **Startup Cost Detail Builder** conversationally. Instead of filling out a form, Sam has a dialogue: the advisor walks through each category — franchise fee, leasehold improvements, equipment & fixtures, signage, initial inventory, insurance deposits, professional fees, working capital reserve. Each has a brand default visible in the detail panel on the right, alongside the FDD Item 7 range. Sam mentions his landlord is giving him a TI allowance — the advisor adjusts leasehold improvements and Sam sees the total update live. "I didn't even think about the insurance deposits," he tells Denise. She says "that's the point."

They continue through revenue assumptions, operating expenses, financing structure — all through conversation. Every value the AI populates is visible in the detail panel where Sam can verify or manually adjust. Sam tells the advisor he wants to be conservative on growth — the advisor adjusts and confirms: "I've set your Year 1 growth to 10% instead of the PostNet default of 13%. Your numbers, your plan." They save mid-session — the tool shows "All changes saved" with a resume-anytime indicator.

*Session 3 (with Denise, 30 minutes):* They run the 3-scenario model. Good/Better/Best scenarios show Sam that even in the conservative case, he breaks even in 14 months. The ROI Threshold Guardian flags that his rent assumption is high relative to his revenue — not blocking, just noting. Sam decides to negotiate harder on the lease. They generate documents: pro forma P&L, cash flow projection, break-even analysis, lender summary. Sam downloads a PDF.

**Climax:** Sam walks into the bank. The loan officer opens the package and says, "This is very well organized. Walk me through your assumptions." Sam can — because he built every number, not Denise. The loan officer approves the SBA loan application.

**Resolution:** Two months later, Sam is in construction. He opens the tool and starts updating estimates with actuals — the contractor bid came in $8K over his estimate for fixtures. He updates it, sees the ROI impact (minimal), and feels in control. He books time with Denise to review the timeline. The plan is alive.

**Requirements revealed:** Quick ROI entry, onboarding tier detection, Story Mode guidance, startup cost detail builder with brand defaults, real-time calculation updates, save/resume with auto-save, 3-scenario modeling, ROI Threshold Guardian, document generation, estimated vs. actual tracking, consultant booking link, PDF export.

### Journey 2: Chris — Second Location, Smarter This Time (Normal Mode)

**Opening Scene:** Chris opened her first Tint World location 18 months ago. It went well — profitable by month 10 — but the construction ran 5 weeks over and cost $22K more than planned. Now she's planning location #2 and wants to avoid repeating those mistakes. Her Katalyst account manager, Marcus, has already set up her account.

**Rising Action:**

*Session 1 (alone, 20 minutes):* Chris logs in and the onboarding detects Normal Mode — she's done this before but isn't a portfolio operator. She sees her location #1 in the system with the estimated vs. actual data she's been updating. She starts a new location plan for location #2. The form-based planning sections pre-fill brand defaults for Tint World, and Chris immediately starts editing — she knows her COGS run closer to 23% than the default 20%, and her labor is higher than average at 22%.

The Startup Cost Detail Builder is where Chris shines this time. She goes line by line, cross-referencing against her location #1 actuals. Leasehold improvements — her first location was $15K over because of HVAC work she didn't anticipate. She adds a buffer. Equipment — she knows which suppliers give better pricing now, adjusts down. She finishes the startup costs section feeling sharp.

*Session 2 (with Marcus, 20 minutes):* Quick check-in. Marcus reviews her assumptions against Tint World benchmarks. "Your labor is high but consistent with what you ran at location #1 — makes sense." They run scenarios. Chris asks: "What if I negotiate 3 months of reduced rent during buildout?" She adjusts the facilities line, sees the ROI impact immediately. She decides to push for it.

**Climax:** Chris pulls up the side-by-side: Location #1 estimated vs. actual next to Location #2 projections. Her startup costs are 12% tighter. Her timeline is realistic because she budgeted for the HVAC contingency. She tells Marcus: "I wish I'd had this the first time."

**Resolution:** Chris generates her lender package and adds it to the document vault alongside her location #1 documents. She's already thinking about location #3 — she asks Marcus about the cascade modeling feature coming later.

**Requirements revealed:** Multi-location per user, estimated vs. actual from prior location visible during new plan creation, Normal Mode (education available but not forced), pre-fill from brand defaults with user edits, side-by-side comparison, document vault per location, consultant booking.

### Journey 3: Maria — Portfolio Expansion Planning (Expert Mode)

**Opening Scene:** Maria owns 7 Ubreakifix locations and is under contract to open 5 more over the next 3 years. She doesn't need hand-holding — she needs speed, accuracy, and portfolio-level visibility. Her Katalyst rep, James, just onboarded her to the platform.

**Rising Action:**

*Session 1 (alone, 15 minutes):* Expert Mode activates. No tooltips, no educational overlays — just the inputs in a spreadsheet-style interface. Maria rips through the plan for location #8 in 15 minutes flat. She adjusts COGS to 34% (she runs higher materials than the brand default of 32%), drops the ad fund to 0% (Ubreakifix doesn't charge one), and enters her negotiated lease rate. She runs three scenarios in rapid succession, toggling growth rates and staffing levels.

She notices something in the sensitivity analysis — her break-even is highly sensitive to the first 6 months' revenue ramp. She adjusts the "starting month AUV %" from the default 8% up to 15% — her brand recognition in this market should drive faster initial traffic.

*Session 2 (with James, 10 minutes):* Maria doesn't need a walkthrough. She needs James to validate one assumption — the construction timeline for this specific market (permitting is slower here). James adjusts the timeline and they see the cash flow impact. Maria flags that she wants to start planning locations #9 and #10 simultaneously — she's working from the same capital pool and needs to see how they interact. James notes the cascade modeling feature isn't in MVP but logs her need.

**Climax:** Maria generates lender packages for locations #8, #9, and #10 in one afternoon. Each has customized assumptions reflecting market-specific conditions. Her investor sees professional, consistent documentation across all three — that consistency is what gives him confidence to fund the expansion.

**Resolution:** Maria is the kind of user who will push the tool's limits. She wants to import her existing 7 locations' actuals, model the full portfolio cash flow, and identify when she can accelerate to locations #11 and #12. That's post-MVP — but the tool has earned her trust with speed and accuracy on the current plans.

**Requirements revealed:** Expert Mode (no hand-holding, all inputs exposed), fast input flow, sensitivity analysis, adjustable ramp-up parameters, multi-location plan creation, document generation for multiple locations, consultant booking (minimal use but present).

### Journey 4: Denise (Katalyst Account Manager) — Brand Setup & Client Guidance

**Opening Scene:** Katalyst just signed a new franchise brand — Jeremiah's Italian Ice, 40 locations and growing. Denise is the account manager responsible for setting up the platform and onboarding the first cohort of franchisees.

**Rising Action:**

*Brand Setup (30 minutes):* Denise logs into the Katalyst admin dashboard. She creates a new brand instance for Jeremiah's. The setup wizard walks her through the parameter set:
- Brand identity (name, logo, colors)
- Financial parameters: AUV ($487K), royalty (6%), ad fund (4.5%), COGS (22%), labor (18%), growth rates by year
- Startup cost template: she builds the brand-specific line items — franchise fee, equipment package, small-format buildout, freezer units, signage. Some of these are standard across Katalyst brands; others are Jeremiah's-specific
- Financing defaults: typical equity/debt split, SBA terms
- Consultant booking link: Denise enters her Calendly URL

She validates by running the model against the Jeremiah's spreadsheet data she already has. The outputs match. Brand is live.

*Client Onboarding (per franchisee):* A new Jeremiah's franchisee, David, gets an invitation email with his login. Denise has a 45-minute call scheduled. She can see David's progress in the Katalyst dashboard — he completed Quick ROI on his own before the call (good sign). During the call, she walks him through the planning tool, Story Mode active — the AI Planning Advisor guides David through conversation while Denise observes. She watches his inputs populate in her admin view — not to judge, but to ensure data quality. She notices his facilities estimate seems low for his market and mentions it. David adjusts.

**Climax:** Three months in, Denise has 8 Jeremiah's franchisees active in the tool. She pulls up the Katalyst dashboard — she can see who's in planning, who's in site evaluation, who's stuck. She notices one franchisee hasn't logged in for 3 weeks and reaches out. He was stalled on financing — Denise connects him with a lending partner. Without the tool's visibility, she wouldn't have known until it was too late.

**Resolution:** Denise presents aggregated (anonymized) pipeline data to the Jeremiah's franchisor development team. They see, for the first time, a real development pipeline — 8 locations in planning, 3 in site evaluation, 2 about to start construction. The franchisor's VP of Development says: "We've never been able to see this before."

**Requirements revealed:** Katalyst admin dashboard, brand parameter setup wizard, startup cost template builder (variable line items per brand), brand validation (model output matches expected), franchisee progress visibility, cross-franchisee pipeline view, consultant booking configuration, franchisor reporting (aggregated/anonymized).

### Journey 5: Linda (Franchisor VP) — Pipeline Visibility (Read-Only Admin)

**Opening Scene:** Linda is VP of Development at PostNet. She manages a franchise system of 700+ locations and approves 20-30 new openings per year. She currently tracks development via a spreadsheet her team updates manually based on phone calls with franchisees. She has no idea which franchisees are actively planning, which are stalled, or which will open next quarter.

**Rising Action:**

Linda gets an email from her Katalyst contact: "Your franchisees are now using the planning platform. Here's your admin dashboard login." She logs in. The dashboard shows a pipeline view:

- 12 franchisees in active planning
- 4 in site evaluation
- 3 with completed lender packages
- 2 with no activity in 30+ days (flagged)

She clicks into the pipeline list. For each franchisee, she sees the **without-opt-in data**: name, location market, lifecycle stage, projected opening quarter (coarse — "Q3 2026," not a specific date), last activity date. She does NOT see investment amounts, revenue projections, ROI estimates, or financial documents — that's behind the opt-in wall.

**Data boundary (explicit):**

*Without opt-in (pipeline status — when/where):*
- Franchisee name
- Target market/territory
- Current lifecycle stage (planning, site evaluation, construction, open)
- Last activity date
- Projected opening quarter (coarse)

*With opt-in (financial details — how much):*
- Investment amount and financing structure
- Revenue projections and ROI estimates
- Startup cost breakdown
- Scenario modeling outputs
- Full document access

One franchisee, Tom, has opted in to share financials with PostNet. Linda clicks into Tom's plan and sees his revenue projections, startup budget, and timeline. She notices his projected opening is Q3 — that aligns with a territory she wants to activate. She asks her team to prioritize Tom's franchise agreement review.

**Climax:** At the quarterly board meeting, Linda presents a development pipeline slide built from actual data for the first time. Not estimates, not phone call summaries — real franchisee planning data. The board sees the pipeline is healthier than they thought, with 12 active plans versus the 6 they were tracking manually.

**Resolution:** Linda makes the dashboard her weekly Monday morning check. She starts forecasting royalty revenue from projected opening dates. When a franchisee goes dark (no activity for 30 days), her team reaches out proactively. Three franchisees opt in to share financials after seeing that Linda's team responds with faster support, not judgment.

**Requirements revealed:** Franchisor admin dashboard (read-only), pipeline list view with lifecycle stages, explicit data boundary (without/with opt-in), activity tracking (last login, last update), opt-in financial data visibility (per-franchisee control), stalled-franchisee flagging, projected timeline visibility (coarse), no financial details without opt-in.

### Journey 6: The Reluctant Franchisee — Minimum Engagement Path

**Opening Scene:** Kevin got his PostNet franchise agreement signed a month ago. He's a hands-on guy — he managed a print shop for 8 years before buying this franchise. He doesn't love software tools. His Katalyst account manager, Denise, sent him a link to the planning tool. Kevin opened it, saw it was some kind of financial planning thing, and thought: "I already know what I'm doing."

**Rising Action:**

Kevin clicks the link because Denise asked him to. Three onboarding questions — Story Mode is recommended. He overrides to Normal (he's not a newbie in his mind, even though this is his first franchise). The Quick ROI asks for 5 inputs. Kevin fills them in quickly — maybe a bit carelessly. 90 seconds later: "Estimated annual return: 8-14%." Kevin thinks: "That seems about right" and closes the tab.

The Katalyst dashboard shows Denise that Kevin completed Quick ROI but didn't proceed to the full planning tool. His last activity: 12 days ago.

Denise calls Kevin: "Hey Kevin, I saw your Quick ROI came back in the 8-14% range — that's reasonable for your market. I'd love to spend 20 minutes walking through the full plan with you. The bank is going to want to see projections, and this tool builds exactly what they need. It'll save you a lot of time later." Kevin agrees — not because the tool convinced him, but because Denise did.

**Climax:** In the 20-minute call, Kevin realizes the Startup Cost Detail Builder catches three expense categories he'd forgotten about — insurance deposits, professional fees for the LLC setup, and his first 3 months of marketing spend. "I was going to short myself by about $40K," he admits. The tool didn't need to be exciting — it needed to be thorough.

**Resolution:** Kevin completes his plan over two sessions with Denise. He doesn't love the tool, but he respects what it produced. When his bank asks for projections, he has them. When construction starts and costs shift, Denise reminds him to update his actuals. He does — grudgingly, but he does.

**Key insight:** The tool doesn't need to convert reluctant users on its own. It needs to (1) capture minimum data from their Quick ROI visit so the account manager can have a productive follow-up, and (2) be thorough enough that even skeptics find value in the details they would have missed.

**Requirements revealed:** Quick ROI as minimum viable data capture, Katalyst dashboard visibility into franchisee activity/inactivity, account manager follow-up workflow enabled by tool data, tool thoroughness as value proposition for skeptics.

### Journey 7: Sam Hits a Wall — Error Recovery & Edge Cases

**Opening Scene:** Sam is halfway through his business plan, Session 2. He's been editing numbers in the detail panel and accidentally deletes his entire startup cost breakdown — 15 line items he carefully built with Denise through the AI advisor.

**Rising Action:**

Sam panics. He clicks "Undo" — the system restores his last auto-saved state (auto-saved 5 minutes ago). He loses one edit, not fifteen. Relief.

Later, Sam tells the AI advisor he expects 50% year-over-year growth. The ROI Threshold Guardian activates naturally in the conversation: "That growth rate is significantly above the PostNet brand average of 13%. Your plan will still calculate with 50%, but you may want to discuss this with Denise." It's a nudge, not a block — Sam can proceed. It's his plan.

In another scenario, Sam's numbers produce a weak result — ROI of 3%. The advisor handles this conversationally: "Your projected ROI of 3% is below the PostNet average of 12-18%. This doesn't mean the location won't work — it means your current assumptions produce a low return. Want to explore adjusting your location cost, revenue assumptions, or financing structure? Or I can help you book time with Denise to talk it through." The advisor guides without judging, suggests specific levers, and offers the consultant booking link.

In another session, Sam tries to generate his lender package but hasn't completed the financing section. The document generator shows: "Your lender package requires a financing structure. Complete the Financing section to generate this document." It doesn't error out — it tells him exactly what's missing and links to that section in the detail panel.

**Climax:** Sam's browser crashes during a session. He reopens the tool, logs in, and picks up exactly where he left off — the auto-save preserved everything.

**Resolution:** Sam develops trust in the tool's resilience. He stops being afraid to experiment with numbers because he knows the auto-save has his back, the Threshold Guardian will flag obvious mistakes without blocking, and his consultant is one click away.

**Requirements revealed:** Auto-save (frequent, not just on explicit save), undo/restore to last save, ROI Threshold Guardian — handles both outlier inputs (advisory nudge) and weak business cases (guidance with specific levers + consultant booking), document generation prerequisites (clear guidance on what's incomplete), session resilience (browser crash recovery), consultant booking as safety net.

### Journey Requirements Summary

| Capability | Sam | Chris | Maria | Kevin (Reluctant) | Katalyst Admin | Franchisor Admin |
|-----------|-----|-------|-------|-------------------|----------------|-----------------|
| Quick ROI Entry | Primary entry | Quick check | Quick check | Minimum data capture | Validates output | - |
| Onboarding & Tier Detection | Critical | Useful | Skip-through | Overrides recommendation | Configures | - |
| Story Mode Guidance | Primary | - | - | Recommended but resisted | - | - |
| Normal Mode | - | Primary | - | Self-selected | - | - |
| Expert Mode | - | - | Primary | - | - | - |
| Startup Cost Detail Builder | Learns from it | Compares to actuals | Speed-runs it | Catches missed expenses | Configures template | - |
| Real-time Calculations | Essential | Essential | Essential | Notices during session | - | - |
| 3-Scenario Modeling | With consultant | Independent | Rapid iteration | With consultant | - | - |
| Sensitivity Analysis | Light | Moderate | Heavy | - | - | - |
| ROI Threshold Guardian | Safety net (outliers + weak cases) | Reference | Occasionally useful | - | - | - |
| Document Generation | Primary goal | Routine | Batch production | With consultant help | - | - |
| Save/Resume + Auto-save | Critical | Important | Important | Important | - | - |
| Estimated vs. Actual | Post-opening | Cross-location comparison | Portfolio-wide | Grudging but does it | Pipeline intelligence | - |
| Document Vault | Stores everything | Organized per location | Multi-location | Minimal use | - | - |
| Consultant Booking Link | Frequent use | Occasional | Rare | Account manager initiates | Configures URL | - |
| Multi-location | Future | Active | Heavy | - | Manages | Views pipeline |
| Opt-in Data Sharing | Decides (value exchange visible) | Decides | Decides | Decides | Sees all | Sees opted-in only |
| Brand Parameter Setup | - | - | - | - | Primary task | - |
| Pipeline Dashboard | - | - | - | - | Cross-brand view | Brand-specific view |
| Activity/Inactivity Visibility | - | - | - | Triggers follow-up | Proactive outreach | Stalled alerts |
| All Values Editable + Reset | Empowerment + safety | Expertise + reference | Speed + reference | Edits with guidance | - | - |

## Domain-Specific Requirements

### Compliance & Regulatory

**FTC Franchise Rule (16 CFR Part 436):**
- The tool must NEVER make earnings claims or projections on behalf of the franchisor. The franchisee is the author of all projections — the tool provides structure and defaults, the franchisee makes the decisions
- All financial outputs must be clearly labeled as franchisee-created projections, not franchisor representations
- The tool cannot be used as a franchise sales tool — it's only available to post-agreement franchisees
- Educational content and tooltips must be carefully worded to inform without implying guaranteed outcomes
- Brand defaults should reference FDD data (Item 19, Item 7) but the tool itself doesn't make claims about what a franchisee "should" expect

**FDD Item 7 Integration:**
- Every franchise brand has an Item 7 ("Estimated Initial Investment") table in their FDD with low/high ranges for each startup cost category
- Brand parameter setup includes Item 7 ranges alongside default values
- Franchisee view shows: "Item 7 range: $15,000 - $45,000 | Brand default: $28,000 | Your estimate: ___"
- Serves three purposes: educational (franchisee sees official range), FTC compliance reinforcement (franchisor's published estimate shown alongside franchisee's independent decision), and guardrail (ROI Threshold Guardian flags estimates wildly outside Item 7 range)
- Item 7 data is public information (in the FDD) — displaying it is compliance-positive

**Practical impact on architecture:**
- This is primarily a content/positioning constraint, not a technical architecture constraint
- No special encryption, audit trail, or regulatory reporting required beyond standard application security
- The constraint manifests in: onboarding copy, tooltip language, document disclaimers, and the fundamental UX principle that the franchisee drives all inputs

### Technical Constraints

**Financial Accuracy — Three-Tier Validation Strategy:**

1. **Known-good spreadsheet validation:** Model outputs must match all four brand spreadsheets (PostNet, Jeremiah's, Ubreakifix, Tint World) with exact parameter sets. Automated regression tests compare tool output to known-correct spreadsheet outputs
2. **Edge case parameter testing:** Extreme inputs (0% growth, 80% COGS, $0 investment, maximum values) must not produce nonsensical outputs (negative revenue, division by zero, NaN). Model must degrade gracefully at boundaries
3. **Built-in accounting identity checks:** Internal consistency checks that must always hold regardless of inputs:
   - Balance sheet must balance (Assets = Liabilities + Equity)
   - P&L net income must equal cash flow starting point (before adjustments)
   - ROIC must derive correctly from net income and invested capital
   - Depreciation must equal CapEx * depreciation rate
   - These are accounting identities — if they fail, the model is wrong regardless of what the inputs are
   - Mirrors the Audit sheet functionality in the existing spreadsheets

**Startup Cost → Financial Engine Data Flow:**

Each startup cost line item must be classified as one of three categories, because the classification drives different financial calculations:
- **CapEx** (depreciable assets — equipment, fixtures, signage) → Drives Depreciation & Amortization line in P&L → Affects EBITDA and Valuation
- **Non-CapEx** (franchise fee, initial inventory, professional fees) → Expensed in period → P&L impact
- **Working Capital** (cash reserve, additional funds) → Cash reserve → Balance Sheet and Cash Flow

Brand templates pre-tag each default line item (franchise fee = non-CapEx, equipment = CapEx, etc.). When franchisees add custom line items, they classify them. In Story Mode, this is presented simply: "Is this something you'll own for years (like equipment) or something you'll use up quickly (like initial inventory)?"

**Rounding and Determinism:**
- Lender-grade documents cannot have $1 discrepancies between summary and detail
- The 5-year projection model with monthly granularity (60 months of calculations) must be deterministic — same inputs always produce same outputs
- Sensitivity analysis must correctly propagate changes across the entire model

**Data Isolation (The Throuple Problem):**
- Franchisee financial data is confidential — no cross-franchisee visibility
- Franchisor sees pipeline status by default, financial details only with explicit franchisee opt-in
- Katalyst sees all data for operational intelligence (they're the platform operator)
- Opt-in is granular and reversible — franchisee can share and un-share at any time
- Data boundaries must be enforced at the API level, not just the UI level

**Stateful Planning System:**
- Locations have lifecycle states: planning, site evaluation, financing, construction, open, operating
- State transitions happen over weeks/months — this is not a session-based tool
- Multi-session persistence with auto-save is critical — losing a franchisee's work is unacceptable
- Estimated vs. actual tracking means data evolves over the location's lifetime

### Risk Mitigations

**Risk 1: Financial model accuracy failures**
- Mitigation: Three-tier validation (spreadsheet match, edge case testing, accounting identity checks). Identity checks run on every calculation, not just during testing
- Severity: High — inaccurate financial documents undermine lender relationships and platform credibility

**Risk 2: Franchisee enters wildly incorrect data, produces misleading documents**
- Mitigation: ROI Threshold Guardian provides advisory guardrails (flags outliers vs. Item 7 ranges and brand averages) without blocking. Account managers review during guided sessions. Documents include disclaimers that projections are franchisee-created
- Severity: Medium — FTC compliance and franchisee empowerment both require allowing this, but the tool should make bad assumptions visible

**Risk 3: Data leak between franchisees or unauthorized franchisor access**
- Mitigation: API-level data isolation enforcement, not just UI. Authorization checks on every data access. Opt-in sharing is explicit and logged
- Severity: High — trust is foundational to the throuple model

**Risk 4: Franchisee loses work (session crash, data loss)**
- Mitigation: Frequent auto-save, session recovery on re-login, explicit save confirmations
- Severity: High — losing a franchisee's plan data destroys trust permanently

**Risk 5: Brand parameter misconfiguration produces incorrect defaults**
- Mitigation: Katalyst admin validation step (run model against known spreadsheet outputs after brand setup). Brand parameter change audit log
- Severity: Medium — fixable but embarrassing if franchisees see wrong defaults

**Risk 6: CapEx/non-CapEx misclassification in startup costs**
- Mitigation: Brand templates pre-tag defaults correctly. Story Mode simplifies the classification question for custom items. Financial identity checks catch downstream errors (depreciation doesn't match CapEx total)
- Severity: Medium — affects EBITDA and valuation calculations but catchable via identity checks

## Innovation & Novel Patterns

### Detected Innovation Areas

This product has several genuinely innovative aspects — not technological breakthroughs, but novel combinations and applications:

1. **Three-stakeholder value from single data entry** — The "throuple" architecture where one franchisee action (entering their plan data) simultaneously serves the franchisee (planning power), the franchisor (pipeline visibility), and Katalyst (operational intelligence). No existing franchise tool serves all three stakeholders from a single data layer.

2. **Adaptive experience tiers on a shared financial engine** — Story/Normal/Expert modes are not different products. They're different presentation layers over the same calculation engine, producing equally rigorous outputs. This is distinct from "beginner/advanced" feature gating — the output quality doesn't degrade in Story Mode.

3. **Configuration via parameterization** — The spreadsheet analysis revealed that brand "configuration" is really just ~15-20 seed values, not structural model changes. This insight enables a simpler, more reliable architecture than a fully configurable financial engine. The one exception (startup cost detail builder) is handled as a template pattern, not a schema-definition pattern.

4. **Estimated vs. actual as a living system** — Most planning tools produce a static document. This tool creates a baseline that evolves — the plan becomes an operational tracking system. This is uncommon in franchise planning and creates the return engagement that distinguishes a platform from a calculator.

5. **FTC compliance as UX strength** — The legal requirement that the franchisee must be the "author" of their projections (not passive recipient) is turned into the product's core UX philosophy. The constraint becomes the differentiator.

### Validation Approach

- **Parameterization model:** Validated by spreadsheet analysis — 4 brands confirm identical model structure. Pre-launch validation against all 4 brand parameter sets
- **Adaptive tiers:** Validated by persona research (Sam/Chris/Maria). Account managers confirm that first-timers and veterans have fundamentally different guidance needs
- **Throuple value:** Validated at 6-month gate — does Katalyst gain operational intelligence? Does the franchisor use pipeline data? Do franchisees return to update plans?
- **Living plan:** Validated by return engagement rate (target: 60%+)

### Risk Mitigation

- If adaptive tiers prove unnecessary (all users prefer one mode), the engine still works — tiers are a presentation layer, not a structural dependency
- If throuple model doesn't deliver franchisor value, the tool still serves franchisees and Katalyst — franchisor dashboard is the lightest-weight component
- If return engagement is low, the tool still produces value as a one-time planning tool — the "living plan" is additive, not foundational

## B2B2C SaaS Platform Specific Requirements

### Project-Type Overview

This is a B2B2C Vertical SaaS platform with three distinct user tiers (franchisee, franchisor admin, Katalyst admin) serving the franchise location planning domain. It operates as a push-distribution model — franchisees don't discover the tool; it's provided to them by their franchisor through Katalyst.

### Tenant Model

**Single deployment with application-layer data partitioning by brand_id from day one.**

Rationale: The Katalyst admin (Denise) manages multiple brands. Isolated instances per brand would require separate logins, separate dashboards, and make cross-brand views impossible without a fragile meta-dashboard or complex cross-instance API integration. With only 2-3 brands in year one, a single deployment with `brand_id` partitioning on every table is fewer moving parts — not more. The financial engine is stateless (pure calculation), document templates are parameterized, and the only thing that differs per brand is the parameter set and startup cost template — that's a row in a configuration table, not a separate deployment.

**Within a brand, the data isolation model:**
- Franchisees see only their own locations and financial data
- Franchisor admin sees pipeline status for all franchisees; financial details only for franchisees who have opted in
- Katalyst admin sees all data across all franchisees and all brands
- Data boundaries enforced at API level, not just UI level

### Permission Model (RBAC)

Three roles with distinct access patterns:

| Role | Data Access | Actions | UX |
|------|------------|---------|-----|
| **Franchisee** | Own locations and plans only. Can opt in to share financial details with franchisor | Create/edit plans, run scenarios, generate documents, manage document vault, update estimated vs. actual | Wizard-driven with adaptive tiers (Story/Normal/Expert) |
| **Franchisor Admin** | Pipeline status for all brand franchisees (read-only). Financial details only for opted-in franchisees (read-only). Optional: acknowledge/review franchisee plans (status signal, not data edit) | View pipeline, view opted-in financials, acknowledge plans (if brand-configured) | Dashboard-only, primarily read-only |
| **Katalyst Admin** | All data across all franchisees and all brands | Brand parameter setup, startup cost template creation, franchisee invitation/provisioning, model validation, cross-brand views | Admin dashboard with configuration tools |

**Key RBAC principles:**
- Franchisor admin CANNOT edit franchisee data — ever
- Katalyst admin CAN view all data but should not edit franchisee plans (they guide through the account manager relationship)
- Franchisees cannot see each other's data — no peer visibility
- Opt-in sharing is controlled entirely by the franchisee and is reversible

**Optional franchisor acknowledgment (brand-configurable):**
- Franchisor admin can acknowledge/review a franchisee's development plan — this is a status signal, not data editing
- Katalyst enables this per brand during setup if the franchisor wants it
- Franchisee sees whether their plan has been reviewed
- Serves the throuple model: franchisee feels seen, franchisor has lightweight engagement, Katalyst tracks plan engagement

### Authentication & Invitation Model

**Dual auth model — Google OAuth for Katalyst admins, invitation-only for franchisees/franchisors.**

**Katalyst admin auth:**
- Katalyst team members authenticate via Google OAuth, restricted to @katgroupinc.com Google Workspace domain
- No invitation needed — first Google OAuth login auto-creates the admin account
- Domain restriction enforced server-side (hosted domain claim + email suffix validation)

**Franchisee onboarding flow (invitation-only — no self-registration):**
1. Katalyst account manager creates a franchisee record in the admin dashboard
2. System sends invitation email with a secure link
3. Franchisee clicks link, completes account setup and onboarding questions (experience tier detection)
4. Franchisee is now active with their recommended experience tier

Franchisor admins are also invited by Katalyst.

This simplifies authentication significantly — Katalyst admins use existing Google Workspace accounts (no password management), and franchisees are invitation-only (no spam accounts, no "which email did I use" problem). The invitation IS the verification for franchisees. It also reinforces FTC compliance: the tool is only available to post-agreement franchisees, and access is explicitly granted.

### Experience Tier Persistence

Experience tier (Story/Normal/Expert) is a **persistent user preference stored on the user profile**, not a one-time onboarding classification:
- Onboarding questions set the initial recommendation
- User can change their tier anytime from profile/settings
- Tier persists across sessions — no re-answering onboarding questions on every login
- Allows natural progression: Sam starts Story Mode, switches to Normal after his second location

### Access / Subscription Model

This is NOT a traditional SaaS subscription:
- Katalyst charges the franchisor a platform fee for setup and access — B2B service engagement, not self-serve subscription
- Franchisees receive access as part of their franchisor relationship — no individual billing
- Experience tiers (Story/Normal/Expert) are UX preferences, not feature gates — all franchisees get the same capabilities
- No subscription tiers, no premium features, no upsells

### Consultant Booking Link

The ever-present booking link is configurable at the **franchisee-to-account-manager level**, not just per brand:
- Katalyst account managers each have their own Calendly (or similar) URL
- When a Katalyst admin creates a franchisee invitation, they associate the franchisee with an account manager
- The booking URL is stored on the franchisee record and displayed throughout the planning experience
- Katalyst admin can reassign account managers (and booking URLs) as needed
- Fallback: brand-level default booking URL if no account manager is assigned

### Integration List

**MVP — minimal integrations:**
- Consultant booking: Configurable external URL per account manager (no API integration)
- PDF generation: Server-side document rendering for lender-grade output
- Authentication: Google OAuth for Katalyst admins (passport-google-oauth20); invitation-based for franchisees/franchisors

**Post-MVP candidates:**
- Accounting software (QuickBooks, Xero) for actuals import
- Franchise management systems (FranConnect) for pipeline sync
- Construction project management tools

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-Solving MVP — replace the spreadsheet with a better experience for one brand (PostNet), proving the financial engine, the adaptive UX, and the throuple data model.

**Core thesis to validate:** Can a single data-entry experience simultaneously serve a franchisee's planning needs, give the franchisor pipeline visibility, and give Katalyst operational intelligence?

**Single brand: PostNet.** The parameterized engine supports multiple brands architecturally (brand_id partitioning from day one), but MVP focuses on one brand to validate the model thoroughly. Adding a second brand in Phase 2 should be a configuration task (Katalyst admin enters parameters), not a development task.

**Architectural principle:** Multi-brand architecture from day one. Not additional scope — brand_id partitioning on every table, brand-aware auth, brand-aware admin tools. This means Phase 2 brand additions are configuration, not code.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- **Sam (Story Mode — AI Planning Advisor)** — First-time franchisee guided planning via AI conversation. Primary MVP journey. If Sam can produce a lender-grade business plan through conversational interaction with the AI advisor, the product works.
- **Chris (Normal Mode — Form-based)** — Experienced operator standard planning. Validates that the same engine serves a different experience level through structured forms.
- **Maria (Expert Mode — Spreadsheet-style)** — Portfolio operator direct input. Validates that the same engine serves power users. Also serves as the validation interface for Katalyst to verify engine outputs against known-good spreadsheets.
- **Denise (Katalyst Admin)** — Brand parameter setup. Must work to onboard PostNet. Validates < 30 minute brand onboarding target.
- **Linda (Franchisor Admin)** — Pipeline visibility dashboard. Lightweight read-only view. Validates franchisor value proposition and proves the throuple model.

**Deferred from MVP:**
- Kevin (Reluctant Franchisee) — Kevin's journey is handled by Sam's journey + consultant booking link + ROI Threshold Guardian
- Multi-location planning — Sam's first location is the MVP scenario

**Must-Have Capabilities:**

| Capability | MVP Scope | Rationale |
|-----------|-----------|-----------|
| Financial Engine | Full 5-year monthly model with all accounting identity checks | This is the product. No shortcuts here. |
| Startup Cost Detail Builder | Full — configurable line items, CapEx/non-CapEx classification, Item 7 ranges | Critical for accurate financial projections |
| Three Experience Tiers | Story Mode (AI Planning Advisor conversation), Normal Mode (form-based), Expert Mode (spreadsheet-style direct input). All three tiers write to the same financial input state. | Three fundamentally different interaction paradigms serving three persona types (Sam/Chris/Maria), unified by one engine. Expert Mode also serves as engine validation interface. |
| Real-time Calculations | Live-updating summary financial dashboard as franchisee edits inputs (via any tier) | Core UX differentiator vs. spreadsheet |
| Editable Values + Reset (per-field pattern) | Every input has four states: (1) brand default value, (2) franchisee-modified value, (3) AI-populated value, (4) Item 7 range reference. Reset restores state 1. UI shows state 4 for context. Value attribution tracks source. | Franchisee empowerment philosophy — non-negotiable. AI attribution ensures trust and verifiability. |
| AI Planning Advisor (Story Mode) | LLM-powered conversational interface that collects plan inputs through natural dialogue. Split-screen: conversation panel + live financial dashboard. | The 2026 experience — transforms Story Mode from a linear form into an AI consulting conversation. Gracefully degrades to Normal/Expert mode if AI unavailable. |
| ROI Threshold Guardian | Advisory nudges for outlier inputs + weak business case guidance with specific levers. In Story Mode, integrated naturally into the AI Advisor conversation. | Safety net without blocking. Includes consultant booking prompt |
| Document Generation (PDF) | Lender-grade P&L, cash flow, balance sheet, break-even, summary package | Primary deliverable — this goes to banks |
| Basic Document Vault | Simple list of generated PDFs with timestamps, plan version metadata, and download links. No organization, tagging, or search. | Prevents real user pain: Sam generates multiple versions, brings wrong one to bank. Minimal development effort. |
| Save/Resume + Auto-save | Persistent multi-session state with auto-save | Losing work is trust-destroying |
| Invitation-Only Auth | Katalyst invites franchisees and franchisor admins | Security + FTC compliance |
| RBAC (3 roles) | Franchisee, Franchisor Admin, Katalyst Admin with API-level data isolation | Throuple model foundation |
| Opt-in Data Sharing | Franchisee controls what franchisor sees, granular and reversible | Trust foundation |
| Consultant Booking Link | Ever-present, configurable per account manager | Core Katalyst value — connects digital tool to human guidance |
| Brand Parameter Setup (Admin) | Katalyst admin configures PostNet parameters + startup cost template | Brand onboarding |
| Pipeline Dashboard (Franchisor) | Read-only view: which franchisees are planning, what stage, what market. Minimal but must exist to prove platform value. | Franchisor value proposition — essential for throuple proof |
| Katalyst Admin Dashboard | Brand configuration, franchisee progress monitoring, model validation | Operational intelligence |

**Explicitly NOT in MVP:**

| Capability | Phase | Rationale |
|-----------|-------|-----------|
| Advisory Board Meeting | Phase 2 | Multi-persona stress-testing is the differentiator feature but requires the AI Planning Advisor to be stable first. Can be released as "bring your plan to the board" once Story Mode AI is proven. |
| 3-Scenario Modeling | Phase 2 | One excellent plan with ROI Threshold Guardian is sufficient for MVP. Reduces engine, document, and UX complexity. |
| Estimated vs. Actual tracking | Phase 2 | Requires post-opening data — MVP franchisees haven't opened yet |
| Multi-location planning | Phase 2 | First location first |
| Deep Sensitivity Analysis | Phase 2 | ROI Threshold Guardian covers the MVP need |
| Franchisor Acknowledgment | Phase 2 | Optional, brand-configurable — not essential for MVP validation |
| Additional brands beyond PostNet | Phase 2 | Architecture supports it; validation focuses on one brand |
| Activity/Inactivity alerts | Phase 2 | Katalyst can check the dashboard manually |

### Resource-Constrained Cut Order

If resources are critically constrained, cut in this order (each cut is independent):

1. **First cut: AI Planning Advisor (Story Mode AI).** Fall back to form-based Story Mode with educational guidance (original wizard concept). Normal + Expert modes are unaffected. The AI conversation layer is the highest-effort, highest-reward feature — cutting it reduces the product to a very good form-based tool rather than a 2026 AI-powered experience.
2. **Second cut: Franchisor dashboard.** Linda's pipeline view is the lightest-weight component and easiest to add later. Data model still captures everything — just no franchisor-facing UI yet. Katalyst shares pipeline updates manually via account manager conversations.
3. **Third cut: ROI Threshold Guardian.** Painful to cut because it's the safety net, but the account manager relationship provides a human safety net. Guardian is a business rules layer on top of the engine — can be added later without engine changes.

**Never cut:** Financial engine, Normal Mode (form-based planning), Expert Mode (spreadsheet input), PDF generation + basic document vault, save/resume, invitation auth, RBAC with data isolation, brand parameter setup. These are the irreducible core.

### MVP Internal Phasing (AI Integration Strategy)

The MVP itself is internally phased to manage AI dependency risk. Each phase is independently valuable:

| Phase | What Ships | AI Dependency | Value Delivered |
|-------|-----------|---------------|-----------------|
| **MVP Core** | Financial engine + Expert Mode + Normal Mode + all infrastructure (auth, RBAC, data isolation, documents, auto-save, dashboards) | None | Product fully functional. Chris and Maria are productive. Katalyst can validate engine. Franchisor sees pipeline. |
| **MVP Enhanced** | AI Planning Advisor (Story Mode) | LLM required for Story Mode only | Sam gets the 2026 experience. Normal/Expert modes unaffected if AI unavailable. |
| **MVP Complete** | Advisory Board Meeting (Phase 2 feature, built after MVP validation) | LLM required for advisory sessions | The differentiator. Multi-persona stress testing. Category-creating feature. |

**Architectural principle:** If the LLM has a bad day, franchisees can still build complete financial plans using Normal or Expert mode. The AI layer degrades gracefully — it's never a single point of failure.

### Post-MVP Features

**Phase 2 (after MVP validation):**
- Advisory Board Meeting — multi-persona AI stress-testing of plan assumptions (the category-creating differentiator)
- 3-Scenario Modeling (base/optimistic/pessimistic)
- Additional brands (Jeremiah's, Ubreakifix, Tint World) — should be configuration tasks, not development
- Estimated vs. actual tracking
- Enhanced Document Vault (organization, tagging)
- Multi-location planning for scaling operators
- Deep sensitivity analysis
- Franchisor acknowledgment feature (brand-configurable)
- Activity/inactivity alerts for Katalyst proactive outreach

**Phase 3 (platform expansion):**
- Accounting software integration (QuickBooks, Xero) for actuals import
- Construction project management integration
- Franchise management system integration (FranConnect)
- Advanced portfolio analytics for multi-unit operators
- Benchmark data across franchisees (anonymized, opt-in)
- White-label branding per franchisor

### Risk Mitigation Strategy

**Technical Risk: Financial model accuracy**
- Mitigation: Build and validate the engine first, before building any UI. Three-tier validation against PostNet spreadsheet data. This is the highest-risk, highest-value component.

**Market Risk: Franchisees don't adopt**
- Mitigation: MVP focuses on the clearest value prop (lender-grade documents) rather than trying to be a full platform. If document generation works, the rest follows.

**Resource Risk: Scope creep**
- Mitigation: Clear cut order defined above. Each cut removes a distinct capability without affecting others. Structured degradation path from full MVP to irreducible core.

**Throuple Risk: Platform value not demonstrated**
- Mitigation: Franchisor dashboard included in MVP (even if minimal) specifically to prove the throuple model. If we ship only a franchisee tool, we've built a spreadsheet replacement, not a platform.

## Functional Requirements

This section defines THE CAPABILITY CONTRACT for the entire product. UX designers will only design what's listed here. Architects will only support what's listed here. Epic breakdown will only implement what's listed here. If a capability is missing from FRs, it will not exist in the final product.

### 1. Financial Planning & Calculation

- **FR1:** Franchisee can build a 5-year monthly financial projection based on their inputs and brand default parameters
- **FR2:** Franchisee can view and edit every financial input value used in their projection
- **FR3:** Franchisee can reset any individual edited value back to the brand default with a single action
- **FR4:** Franchisee can see the FDD Item 7 range alongside the brand default and their own estimate for each startup cost line item
- **FR5:** Franchisee can add, remove, and reorder custom startup cost line items beyond the brand template defaults
- **FR6:** Franchisee can classify each custom startup cost line item as CapEx (depreciable) or non-CapEx (expensed)
- **FR7:** Franchisee can view live-updating summary financial metrics (total investment, projected revenue, ROI, break-even) as they edit inputs
- **FR8:** System validates accounting identities on every calculation (balance sheet balances, P&L-to-cash-flow consistency, depreciation-to-CapEx consistency, ROIC derivation)
- **FR9:** System produces deterministic outputs — identical inputs always produce identical financial projections
- **FR10:** System computes financial projections using a single parameterized model that accepts brand-specific seed values without requiring structural changes per brand

### 2. Guided Planning Experience

- **FR11:** Franchisee can complete a planning experience that collects all inputs needed for a complete financial projection
- **FR12:** Franchisee can experience the planning tool in three experience tiers, each representing a fundamentally different interaction paradigm over the same financial engine:
  - **Story Mode:** AI Planning Advisor — a conversational interface where an LLM-powered advisor asks questions in natural language, extracts structured financial inputs from the conversation, and populates the plan. Split-screen layout: conversation panel + live financial dashboard. Designed for first-time franchisees (Sam).
  - **Normal Mode:** Form-based guided sections — structured sections with field-by-field input, labels, and validation. Efficient for experienced operators who know their numbers (Chris).
  - **Expert Mode:** Spreadsheet-style direct input — minimal UI, maximum speed, direct access to every parameter. Also serves as the validation interface for Katalyst to verify engine outputs against known-good spreadsheets (Maria). 
- **FR13:** Franchisee can switch between experience tiers (Story/Normal/Expert) at any time from their profile settings
- **FR14:** System recommends an initial experience tier based on onboarding questions (franchise experience, financial literacy, planning experience)
- **FR15:** Franchisee can navigate freely between completed sections without losing progress
- **FR16:** Franchisee can save their progress and resume from where they left off across sessions
- **FR17:** System auto-saves franchisee progress periodically to prevent data loss from crashes or interruptions
- **FR18:** System recovers franchisee progress to the last auto-save point when a session is interrupted unexpectedly (browser crash, network loss, device change)
- **FR19:** Franchisee can see a consultant booking link throughout the planning experience to schedule guidance from their assigned account manager

### 3. Advisory & Guardrails

- **FR20:** System flags franchisee inputs that fall significantly outside the FDD Item 7 range or brand averages with advisory nudges (non-blocking)
- **FR21:** System identifies when a franchisee's overall business case is weak (e.g., negative ROI, break-even beyond 5 years) and provides specific guidance on which inputs to reconsider
- **FR22:** System suggests consultant booking when flagging weak business cases or outlier inputs
- **FR23:** All advisory nudges are informational — the system never blocks a franchisee from proceeding with their chosen values

### 4. Document Generation & Management

- **FR24:** Franchisee can generate a lender-grade PDF business plan package including pro forma P&L, cash flow projection, balance sheet, break-even analysis, and summary
- **FR25:** Generated documents include FTC-compliant disclaimers stating that projections are franchisee-created, not franchisor representations
- **FR26:** Franchisee can view a list of all previously generated documents with timestamps and plan version metadata
- **FR27:** Franchisee can download any previously generated document from their document list

### 5. User Access & Authentication

- **FR28:** Katalyst admin can create franchisee invitations that send a secure link for account setup
- **FR29:** Invited franchisee can complete a guided onboarding experience that includes account setup and experience assessment questions that inform their initial tier recommendation
- **FR30:** Katalyst admin can create franchisor admin invitations for a specific brand
- **FR31:** Users can authenticate to access the system (Katalyst admins via Google OAuth restricted to @katgroupinc.com domain; franchisees/franchisors via invitation-based auth — mechanism TBD)
- **FR32:** System enforces role-based data isolation — franchisees see only their own data, franchisor admins see only their brand's data, Katalyst admins see all data

### 6. Data Sharing & Privacy

- **FR33:** Franchisee can view a clear description of exactly what data will be shared with the franchisor before making an opt-in decision
- **FR34:** Franchisee can opt in to share their financial projection details with their franchisor admin
- **FR35:** Franchisee can revoke data sharing opt-in at any time
- **FR36:** Franchisor admin sees franchisee pipeline status (planning stage, target market, timeline) by default without opt-in
- **FR37:** Franchisor admin sees franchisee financial details only when the franchisee has explicitly opted in
- **FR38:** Data sharing boundaries are enforced at the API level, not just the UI level

### 7. Brand Configuration & Administration

- **FR39:** Katalyst admin can create and configure a new franchise brand with its financial parameter set (~15-20 seed values)
- **FR40:** Katalyst admin can define the startup cost template for a brand, including default line items with CapEx/non-CapEx classification and Item 7 ranges
- **FR41:** Katalyst admin can validate a brand configuration by running the financial model against known-good spreadsheet outputs
- **FR42:** Katalyst admin can assign an account manager (with their booking URL) to each franchisee
- **FR43:** Katalyst admin can reassign account managers for existing franchisees
- **FR44:** Katalyst admin can configure brand-level settings (brand identity/logo, colors, default booking URL, franchisor acknowledgment feature on/off)

### 8. Pipeline Visibility & Operational Intelligence

- **FR45:** Franchisor admin can view a dashboard showing all their brand's franchisees with planning status, stage, target market, and timeline
- **FR46:** Katalyst admin can view a cross-brand dashboard showing franchisee progress across all brands
- **FR47:** Katalyst admin can view individual franchisee plan details for operational support
- **FR48:** Franchisor admin can acknowledge/review a franchisee's development plan as a status signal (if the brand has this feature enabled)

### 9. Brand Identity & Experience

- **FR49:** Franchisee sees their franchise brand's identity (name, logo, colors) throughout the planning experience

### 10. AI Planning Advisor (Story Mode)

- **FR50:** In Story Mode, franchisee interacts with an AI Planning Advisor that collects plan inputs through natural language conversation rather than form fields
- **FR51:** AI Planning Advisor extracts structured financial inputs from the franchisee's conversational responses and populates the corresponding fields in the financial input state
- **FR52:** Franchisee can view, verify, and manually correct any value that the AI Planning Advisor populated — AI-populated values are clearly distinguishable from manually entered values and brand defaults
- **FR53:** AI Planning Advisor has access to the brand's parameter set, Item 7 ranges, and the current state of the franchisee's plan to provide contextually relevant questions and guidance
- **FR54:** System gracefully degrades when AI services are unavailable — franchisee can switch to Normal or Expert mode to continue planning without interruption

### 11. Advisory Board Meeting

- **FR55:** Franchisee can initiate an Advisory Board Meeting from any experience tier to stress-test their current plan assumptions with multiple AI advisor personas
- **FR56:** Advisory Board Meeting presents multiple domain-specific advisor personas (e.g., financial analyst, marketing strategist, operations/HR advisor, lending specialist, seasoned franchisee) who examine the plan from their domain perspective and provide cross-cutting feedback through natural cross-talk
- **FR57:** Franchisee can accept or reject specific Advisory Board suggestions — accepted suggestions are written back to the financial input state with appropriate attribution
- **FR58:** Advisory Board persona definitions (domain expertise, communication style, advisory priorities) are data-driven and configurable by Katalyst admin

## Non-Functional Requirements

### Performance

- **NFR1:** Financial model recalculation completes in < 2 seconds for live-updating summary metrics as the franchisee edits inputs
- **NFR2:** Wizard page transitions complete in < 1 second, including loading saved state and brand defaults
- **NFR3:** PDF document generation completes in < 30 seconds for a full lender package (5 documents)
- **NFR4:** Dashboard views (franchisor pipeline, Katalyst admin) load in < 3 seconds with up to 200 franchisees per brand
- **NFR5:** Auto-save operations complete without interrupting the franchisee's workflow (non-blocking, background operation)

### Security

- **NFR6:** All data transmitted over HTTPS/TLS — no unencrypted connections
- **NFR7:** Passwords hashed using industry-standard algorithms (bcrypt or equivalent) — never stored in plaintext (applies to franchisee accounts if password-based auth is used; Katalyst admins authenticate via Google OAuth)
- **NFR8:** Session tokens expire after a reasonable inactivity period, with configurable timeout
- **NFR9:** Every API endpoint enforces role-based access control — no endpoint returns data the requesting user's role should not see
- **NFR10:** Franchisee data isolation enforced at the database query level — queries always scoped to the authenticated user's permissions, not filtered after retrieval
- **NFR11:** Invitation tokens are single-use, time-limited, and cryptographically secure
- **NFR12:** No financial data, passwords, or secrets logged or exposed in error messages

### Reliability & Data Integrity

- **NFR13:** Auto-save occurs at minimum every 2 minutes during active planning sessions — maximum data loss on crash is 2 minutes of work
- **NFR14:** System gracefully handles concurrent edits to the same plan from different browser tabs/devices (last-write-wins or conflict detection)
- **NFR15:** Financial calculation engine produces identical outputs for identical inputs across all environments (deterministic — no floating-point inconsistencies across server/client)
- **NFR16:** Database backups occur daily at minimum, with point-in-time recovery capability
- **NFR17:** System remains functional during brand parameter updates — active franchisee sessions are not disrupted by admin configuration changes
- **NFR18:** Generated PDF documents are immutable after creation — changing plan inputs does not alter previously generated documents

### Scalability

- **NFR19:** System supports up to 10 brands and 500 active franchisees without architectural changes
- **NFR20:** Financial engine scales linearly — adding brands does not increase calculation time for existing brands
- **NFR21:** Database schema supports multi-brand partitioning from day one (brand_id on all relevant tables)

### AI Integration

- **NFR22:** AI Planning Advisor responds to franchisee conversation inputs within 5 seconds — visual typing indicator shown while processing
- **NFR23:** AI-populated financial values are validated against the field's expected type and range before being written to the financial input state — AI cannot silently inject invalid data
- **NFR24:** System remains fully functional when AI services are unavailable — franchisee can seamlessly switch to Normal or Expert mode without data loss

### Usability

- **NFR25:** Planning experience is usable on desktop browsers (minimum 1024px width) — mobile optimization is not required for MVP but layout should not break on tablet
- **NFR26:** All user-facing error messages written in plain language, not technical jargon — franchisees are not technical users
- **NFR27:** Financial values displayed with consistent formatting (currency symbols, thousand separators, appropriate decimal places) throughout the application
- **NFR28:** The system provides visual feedback within 200ms for any user action (click, keystroke, toggle) — even if the underlying operation takes longer
