---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys']
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
- **Startup/construction cost detail builder:** Brand-defined templates with variable line items per brand. Franchisees can add/remove/edit any line item. "Reset to brand defaults" restores template without losing custom additions. Total feeds into financial engine as "Total Investment Required"
- **All values franchisee-editable:** Every number in the plan is editable by the franchisee (franchisee empowerment). Defaults are seeded by brand parameters with easy "reset to default" buttons, but nothing is locked
- **Multi-session wizard stability:** Save mid-session, resume days later, zero data loss. Auto-save every few minutes for crash recovery
- **Document accuracy:** Financial outputs match manual spreadsheet calculations exactly
- **Data isolation with opt-in sharing:** Franchisee data invisible to other franchisees. Without opt-in, franchisor sees pipeline status only (when/where: stage, quarter, market). With opt-in, franchisor additionally sees financial details (how much: projections, investment, documents). Opt-in UI makes value exchange visible
- **Performance:** ROI/summary calculations < 2 seconds (live-updating as franchisee adjusts inputs); document generation can take longer (not expected to be live-update)
- **Ever-present consultant booking link:** Calendly-style booking link visible across all wizard sessions
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

## Product Scope

### MVP

1. Parameterized financial engine (single universal model, brand parameter sets, all values franchisee-editable with reset-to-default)
2. Startup/construction cost detail builder (brand-defined templates with variable line items, franchisee add/remove/edit, reset-to-defaults)
3. Onboarding & adaptive experience tiers (Story/Normal/Expert)
4. Quick ROI entry point (5 inputs, under 2 minutes)
5. Multi-session guided business plan wizard with save/resume and auto-save
6. Ever-present consultant booking link (Calendly-style)
7. 3-scenario modeling + sensitivity analysis + ROI Threshold Guardian (advisory, handles both outlier inputs and weak business cases)
8. Template-driven document production (pro forma P&L, cash flow, balance sheet, break-even, lender-ready PDF)
9. Estimated vs. actual tracking
10. Per-location document vault
11. Opt-in data sharing with visible value exchange (franchisee controls what franchisor sees)
12. Franchisor admin dashboard (MVP: read-only pipeline list view with explicit data boundaries)
13. Katalyst admin dashboard (MVP: brand parameter management + startup cost template builder + cross-brand views + franchisee activity visibility)
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

## User Journeys

### Journey 1: Sam — First Location, First Plan (Story Mode)

**Opening Scene:** Sam signed his PostNet franchise agreement six weeks ago. He's sitting at his kitchen table at 9 PM, laptop open, trying to make sense of a 47-page Franchise Disclosure Document and a spreadsheet someone emailed him. He needs to go to the bank next month. His wife asks how it's going. He says "fine" but his stomach knots.

His Katalyst account manager, Denise, sends him a link: "Hey Sam, before our call Thursday, try this — takes two minutes." It's the Quick ROI entry.

**Rising Action:**

*Session 1 (alone, 10 minutes):* Sam clicks the link. Three onboarding questions determine he's a first-timer — Story Mode activates. The Quick ROI asks for 5 inputs: location type, estimated investment, expected revenue, and two quick cost percentages. In 90 seconds, Sam sees a preliminary ROI range: "Based on these inputs, your estimated annual return is 12-18%." There's a note: "This is a rough range. Your full plan will refine this significantly." He sees the consultant booking link in the corner — "Book time with Denise" — and clicks it. Thursday confirmed.

*Session 2 (with Denise, 45 minutes):* They open the wizard together. Story Mode shows Sam each section with plain-language explanations. They hit the **Startup Cost Detail Builder** — this is where Sam learns. Instead of entering one "Total Investment: $256,507" number, the wizard walks him through: franchise fee, leasehold improvements, equipment & fixtures, signage, initial inventory, insurance deposits, professional fees, working capital reserve. Each line has a brand default from PostNet's FDD with an explanation of what it covers. Sam adjusts some — his landlord is giving him a TI allowance, so leasehold improvements drop. He sees the total update in real time. "I didn't even think about the insurance deposits," he tells Denise. She says "that's the point."

They move through revenue assumptions, operating expenses, financing structure. Every number has a default. Sam adjusts his growth rate down — he's conservative. Denise says "that's fine, these are your numbers." Sam sees the "Reset to Default" button but likes his more cautious assumptions. They save mid-session — the wizard shows a progress indicator and "Resume anytime."

*Session 3 (with Denise, 30 minutes):* They run the 3-scenario model. Good/Better/Best scenarios show Sam that even in the conservative case, he breaks even in 14 months. The ROI Threshold Guardian flags that his rent assumption is high relative to his revenue — not blocking, just noting. Sam decides to negotiate harder on the lease. They generate documents: pro forma P&L, cash flow projection, break-even analysis, lender summary. Sam downloads a PDF.

**Climax:** Sam walks into the bank. The loan officer opens the package and says, "This is very well organized. Walk me through your assumptions." Sam can — because he built every number, not Denise. The loan officer approves the SBA loan application.

**Resolution:** Two months later, Sam is in construction. He opens the tool and starts updating estimates with actuals — the contractor bid came in $8K over his estimate for fixtures. He updates it, sees the ROI impact (minimal), and feels in control. He books time with Denise to review the timeline. The plan is alive.

**Requirements revealed:** Quick ROI entry, onboarding tier detection, Story Mode guidance, startup cost detail builder with brand defaults, real-time calculation updates, save/resume with auto-save, 3-scenario modeling, ROI Threshold Guardian, document generation, estimated vs. actual tracking, consultant booking link, PDF export.

### Journey 2: Chris — Second Location, Smarter This Time (Normal Mode)

**Opening Scene:** Chris opened her first Tint World location 18 months ago. It went well — profitable by month 10 — but the construction ran 5 weeks over and cost $22K more than planned. Now she's planning location #2 and wants to avoid repeating those mistakes. Her Katalyst account manager, Marcus, has already set up her account.

**Rising Action:**

*Session 1 (alone, 20 minutes):* Chris logs in and the onboarding detects Normal Mode — she's done this before but isn't a portfolio operator. She sees her location #1 in the system with the estimated vs. actual data she's been updating. She starts a new location plan for location #2. The wizard pre-fills brand defaults for Tint World, and Chris immediately starts editing — she knows her COGS run closer to 23% than the default 20%, and her labor is higher than average at 22%.

The Startup Cost Detail Builder is where Chris shines this time. She goes line by line, cross-referencing against her location #1 actuals. Leasehold improvements — her first location was $15K over because of HVAC work she didn't anticipate. She adds a buffer. Equipment — she knows which suppliers give better pricing now, adjusts down. She finishes the startup costs section feeling sharp.

*Session 2 (with Marcus, 20 minutes):* Quick check-in. Marcus reviews her assumptions against Tint World benchmarks. "Your labor is high but consistent with what you ran at location #1 — makes sense." They run scenarios. Chris asks: "What if I negotiate 3 months of reduced rent during buildout?" She adjusts the facilities line, sees the ROI impact immediately. She decides to push for it.

**Climax:** Chris pulls up the side-by-side: Location #1 estimated vs. actual next to Location #2 projections. Her startup costs are 12% tighter. Her timeline is realistic because she budgeted for the HVAC contingency. She tells Marcus: "I wish I'd had this the first time."

**Resolution:** Chris generates her lender package and adds it to the document vault alongside her location #1 documents. She's already thinking about location #3 — she asks Marcus about the cascade modeling feature coming later.

**Requirements revealed:** Multi-location per user, estimated vs. actual from prior location visible during new plan creation, Normal Mode (education available but not forced), pre-fill from brand defaults with user edits, side-by-side comparison, document vault per location, consultant booking.

### Journey 3: Maria — Portfolio Expansion Planning (Expert Mode)

**Opening Scene:** Maria owns 7 Ubreakifix locations and is under contract to open 5 more over the next 3 years. She doesn't need hand-holding — she needs speed, accuracy, and portfolio-level visibility. Her Katalyst rep, James, just onboarded her to the platform.

**Rising Action:**

*Session 1 (alone, 15 minutes):* Expert Mode activates. No tooltips, no educational overlays — just the inputs. Maria rips through the wizard for location #8 in 15 minutes flat. She adjusts COGS to 34% (she runs higher materials than the brand default of 32%), drops the ad fund to 0% (Ubreakifix doesn't charge one), and enters her negotiated lease rate. She runs three scenarios in rapid succession, toggling growth rates and staffing levels.

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

*Client Onboarding (per franchisee):* A new Jeremiah's franchisee, David, gets an invitation email with his login. Denise has a 45-minute call scheduled. She can see David's progress in the Katalyst dashboard — he completed Quick ROI on his own before the call (good sign). During the call, she walks him through the wizard, Story Mode active. She watches his inputs populate in her admin view — not to judge, but to ensure data quality. She notices his facilities estimate seems low for his market and mentions it. David adjusts.

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

The Katalyst dashboard shows Denise that Kevin completed Quick ROI but didn't proceed to the wizard. His last activity: 12 days ago.

Denise calls Kevin: "Hey Kevin, I saw your Quick ROI came back in the 8-14% range — that's reasonable for your market. I'd love to spend 20 minutes walking through the full plan with you. The bank is going to want to see projections, and this tool builds exactly what they need. It'll save you a lot of time later." Kevin agrees — not because the tool convinced him, but because Denise did.

**Climax:** In the 20-minute call, Kevin realizes the Startup Cost Detail Builder catches three expense categories he'd forgotten about — insurance deposits, professional fees for the LLC setup, and his first 3 months of marketing spend. "I was going to short myself by about $40K," he admits. The tool didn't need to be exciting — it needed to be thorough.

**Resolution:** Kevin completes his plan over two sessions with Denise. He doesn't love the tool, but he respects what it produced. When his bank asks for projections, he has them. When construction starts and costs shift, Denise reminds him to update his actuals. He does — grudgingly, but he does.

**Key insight:** The tool doesn't need to convert reluctant users on its own. It needs to (1) capture minimum data from their Quick ROI visit so the account manager can have a productive follow-up, and (2) be thorough enough that even skeptics find value in the details they would have missed.

**Requirements revealed:** Quick ROI as minimum viable data capture, Katalyst dashboard visibility into franchisee activity/inactivity, account manager follow-up workflow enabled by tool data, tool thoroughness as value proposition for skeptics.

### Journey 7: Sam Hits a Wall — Error Recovery & Edge Cases

**Opening Scene:** Sam is halfway through his business plan wizard, Session 2. He's been editing numbers and accidentally deletes his entire startup cost breakdown — 15 line items he carefully entered with Denise.

**Rising Action:**

Sam panics. He clicks "Undo" — the wizard restores his last auto-saved state (auto-saved 5 minutes ago). He loses one edit, not fifteen. Relief.

Later, Sam enters an unrealistic number — he sets his revenue growth rate to 50% year-over-year. The ROI Threshold Guardian activates: "This growth rate is significantly above the PostNet brand average of 13%. Your plan will still calculate, but you may want to discuss this with your consultant." It's a nudge, not a block — Sam can proceed. It's his plan.

In another scenario, Sam enters everything correctly but his numbers produce a weak result — ROI of 3%. The ROI Threshold Guardian handles this differently: "Your projected ROI of 3% is below the PostNet brand average of 12-18%. This doesn't mean the location won't work — it means your current assumptions produce a low return. Consider adjusting: location cost, revenue assumptions, or financing structure. Or book time with your consultant to explore options." The tool guides without judging. It suggests specific levers Sam could adjust and offers the consultant booking link.

In another session, Sam tries to generate his lender package but hasn't completed the financing section. The document generator shows: "Your lender package requires a financing structure. Complete the Financing section to generate this document." It doesn't error out — it tells him exactly what's missing and links to that wizard step.

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
