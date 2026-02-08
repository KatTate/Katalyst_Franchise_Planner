---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/product-brief-workspace-2026-02-08.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/prd-validation-report.md
  - attached_assets/THEME_VALUES_(1)_1770580912929.md
  - attached_assets/DesignTheme_1770580912930.tsx
  - attached_assets/PostNet_-_Business_Plan_1770511701987.xlsx
  - attached_assets/Pasted-Persona-A-First-Time-Franchisee-Sam-The-New-Owner-Snaps_1770523428988.txt
date: 2026-02-08
author: User
project_name: Katalyst Growth Planner
---

# UX Design Specification — Katalyst Growth Planner

**Author:** User
**Date:** 2026-02-08

---

## Executive Summary

### Project Vision

The Katalyst Growth Planner is a franchise location planning platform that transforms the overwhelming process of opening a new franchise location into a guided, empowering journey. It serves three stakeholders from a single data layer (the "throuple problem"): the franchisee as primary user and plan author, the franchisor as pipeline visibility buyer, and Katalyst as operational intelligence beneficiary.

The UX must accomplish something unusual: make a complex financial planning tool feel approachable to a first-time business owner while simultaneously satisfying a 27-location veteran who wants speed and no hand-holding. Three experience tiers (Story Mode, Normal Mode, Expert Mode) solve this by presenting three fundamentally different interaction paradigms that all write to the same underlying financial input state.

### White-Label Theming Strategy

**Approach: Branded Shell with Prominent Katalyst Identity**

The platform uses a "branded shell" approach that leans more toward Katalyst visibility than a pure white-label:

- **Katalyst owns:** Design system foundation (Montserrat/Roboto typography, spacing scale, component patterns, color governance, interaction patterns, data visualization style). The structural "feel" of the product is unmistakably Katalyst across all brand deployments.
- **Brand owns:** Primary accent color (replaces Katalyst Green in interactive elements), logo in the header, brand name in contextual copy (e.g., "PostNet benchmarks"), startup cost template categories.
- **Shared space:** Login/onboarding carries the brand identity prominently with a clear "Powered by Katalyst" mark. The sidebar, footer, and "about" sections maintain Katalyst branding. Katalyst's design system personality (rounded cards, 2px borders, the "Gurple" info pattern, segmented controls, warm neutrals) is constant — a multi-unit franchisee working across brands will immediately recognize "this is a Katalyst tool" even though it's branded for PostNet vs. Jeremiah's.
- **Strategic rationale:** Multi-unit franchisees who cross brand boundaries are the organic evangelism channel. The UX must be similar enough across brand deployments that they recognize the platform, while different enough (brand accent, logo, brand-specific copy) that the franchisor feels ownership.

### Target Users

**Persona A: Sam (First-Time Franchisee) — Story Mode**
- Age 30-45, former corporate manager, purchased first franchise unit
- Excited but anxious, overwhelmed by FDD and financial complexity
- Needs structure, education at every step, confidence to walk into a bank
- Tech-competent but new to franchising mechanics
- Will use the product with their Katalyst account manager in guided sessions

**Persona B: Maria (Portfolio Operator) — Expert Mode**
- Age 40-60, owns 7+ locations, financially sophisticated
- Pragmatic, speed-focused, intolerant of wasted time
- Expects spreadsheet-level input speed and portfolio-level visibility
- Will rip through a plan in 15 minutes, doesn't want tooltips or education

**Persona C: Chris (Scaling Operator) — Normal Mode**
- Age 30-50, has 1-3 locations, learning to systematize
- Ambitious and stretched, confident but nervous about replication
- Needs the ability to compare against prior location actuals
- Wants education available on demand, not forced

**Secondary:** Katalyst account managers (brand setup, client guidance), franchisor development teams (pipeline dashboards), Katalyst admins (cross-brand intelligence).

### Key Design Challenges

1. **Three interaction paradigms, one engine** — Story Mode (AI conversation + live dashboard), Normal Mode (section-based forms), Expert Mode (spreadsheet grid) must feel like coherent products sharing a design language, not three different apps bolted together. The transition between modes should feel like changing a "view" on the same data, not switching products.

2. **Financial complexity without intimidation** — The tool produces lender-grade financial packages (P&L, cash flow, balance sheet, break-even). Sam needs to feel empowered by this, not overwhelmed. Progressive disclosure is essential: summary for confidence, detail for due diligence, education for understanding.

3. **Per-field metadata density** — Every financial input carries brand defaults, Item 7 ranges, source attribution, reset capability, and tier-dependent explanations. This is a lot of information to present without visual overload, especially in Normal/Expert modes where many fields are visible simultaneously.

4. **Split-screen responsive stacking** — Story Mode's core UX is a split screen: AI conversation on the left, live financial dashboard on the right. This must stack/tab below 1024px without losing the connection between conversation and live-updating numbers.

5. **White-label theming with Katalyst identity** — The brand accent color system must be implemented via CSS custom properties so the entire product re-themes dynamically per brand, while the Katalyst design system (component shapes, typography, spacing, interaction patterns) remains constant.

6. **Auto-save trust signals** — Multi-session planning over weeks/months requires absolute confidence that work is never lost. The save state must be visible, unambiguous, and ever-present without being distracting.

### Design Opportunities

1. **The "Confidence Pack" emotional arc** — Sam's journey from anxious kitchen-table confusion to walking into a bank feeling prepared is a designable emotional arc. The UX can deliberately move from warm, supportive onboarding to increasingly professional-looking outputs, mirroring Sam's growing confidence.

2. **AI conversation as natural data collection** — Story Mode's conversational interface lets Sam describe their situation in natural language while the system extracts structured financial inputs behind the scenes. This is a fundamentally better data collection UX than forms for first-time users — they tell their story, and the plan materializes.

3. **Estimated vs. actual as engagement hook** — Post-opening, franchisees update estimates with actuals. This turns a one-time planning tool into a living operational dashboard and creates the return engagement that proves product value (60%+ target).

4. **Katalyst design system as competitive moat** — The consistent design language across brand deployments (warm neutrals, the "Gurple" info pattern, Montserrat headers, rounded 2px-bordered cards) becomes recognizable. When Maria opens a Tint World instance after using Ubreakifix, the immediate familiarity says "I know this tool, I trust this tool."

## Core User Experience

### Defining Experience

The core user action in the Katalyst Growth Planner is **editing a financial input and seeing the plan update in real time**. This is the atomic interaction that everything else serves:

- In **Story Mode**, Sam tells the AI "my rent is about $4,200 a month" — the facilities cost field populates, the dashboard numbers shift, and the ROI range adjusts. The conversation *is* the input method, but the magic moment is the same: I said something, and my plan changed.
- In **Normal Mode**, Chris types "23%" into the COGS field — the summary card recalculates, break-even shifts from month 11 to month 12, and she understands the impact immediately.
- In **Expert Mode**, Maria tabs through cells at spreadsheet speed, watching the bottom-line numbers update as she goes. No lag, no confirmation dialogs, just flow.

The secondary core action is **scenario comparison**. The moment where Sam compares Good/Better/Best and realizes "even the conservative case works" is where conviction forms — this is an active interaction pattern, not a passive output. The UX must treat scenario modeling as a first-class interaction: toggle between scenarios, see numbers shift, understand the range of outcomes. Conviction precedes documents.

The tertiary core action is **generating and downloading the lender-ready document package**. This is the culmination moment — the plan transforms from a working tool into a professional artifact that Sam carries into the bank. The emotional weight of this moment is significant: the output must look *more* professional than anything Sam could have produced alone. But the document is a deliverable, not an interaction — it's the container for the conviction built during scenario comparison.

### Platform Strategy

- **Desktop-first, web-only.** Minimum viewport: 1024px. This is a financial planning tool used in meetings and at desks, not on phones in the field.
- **Mouse/keyboard primary interaction.** Tab-through support in Expert Mode is critical for Maria's speed. Form fields must support keyboard navigation throughout.
- **No offline requirement.** Users plan during sessions (often with their Katalyst account manager on a call). Always-connected is acceptable.
- **Split-screen layout is the signature interaction** for Story Mode — conversation panel (left) + live financial dashboard (right) using resizable panels.
  - **Panel ratio defaults and constraints:** Conversation panel minimum width 360px, dashboard panel minimum width 480px. At 1024px viewport with collapsed sidebar (44px), this yields approximately a 420/560 default split. The resize handle allows adjustment within these minimums.
  - **Stacked mode (below 1024px):** Panels stack into a tabbed interface (Chat | Dashboard). When the user is on the Chat tab and a financial recalculation occurs, a subtle **accent-colored dot** appears on the Dashboard tab label with a **single gentle pulse animation**, indicating "something changed." This signals continuous updates without creating notification anxiety (no badge count — recalculation is continuous, not discrete events). Tapping the Dashboard tab reveals the updated numbers.

### Effortless Interactions

These interactions must feel completely natural and require zero cognitive effort:

1. **Auto-save is invisible.** The plan saves continuously. There is no "Save" button. A subtle status indicator ("All changes saved" / "Saving...") exists in the chrome but never demands attention. Crash recovery restores the exact state — including conversation position in Story Mode.

2. **Brand defaults pre-fill everything.** When Sam starts a plan, every field already has a PostNet default value. He's not staring at empty fields wondering what to put — he's reviewing and adjusting numbers that are already reasonable. The "edit vs. create" framing is key: you're refining a plan, not building one from scratch.

3. **Mode switching preserves financial state.** If Sam starts in Story Mode, switches to Normal Mode to review all fields at once, then switches back — all financial input values are preserved. The form reflects every AI-populated value, and the dashboard is identical. **Important boundary:** Financial input state is shared across modes; conversation history is Story Mode-specific. Normal Mode doesn't have a conversation. When Sam returns to Story Mode, the AI conversation picks up where it left off, but the financial inputs may reflect changes made in Normal Mode — the advisor acknowledges these gracefully.

4. **Reset to default is per-field and reversible.** Every field Sam has edited shows a subtle "reset" affordance. One click restores the brand default. This removes the fear of experimentation — "I can always put it back."

5. **Consultant booking is ever-present but non-intrusive.** A persistent "Book time with [Account Manager Name]" element is always reachable (sidebar footer or header utility area) without cluttering the planning workspace. It's the safety net that gives Sam confidence to explore alone.

6. **Smart location suggestions (data-dependent).** When a franchisee enters a zip code or market area, the system suggests market-appropriate parameter adjustments if the brand seed data includes market-tier information — e.g., "Rent in this area averages $X based on similar PostNet markets." This creates delight through proactive intelligence, not just prevents frustration. Implementation depends on brand seed data availability; the UX pattern is ready even if data arrives post-MVP.

### Critical Success Moments

1. **Quick ROI result (first 90 seconds).** Sam enters 5 numbers, sees a preliminary ROI range. This is the "aha" moment — the tool immediately provides value before asking for commitment. The result must include a **contextual sentiment frame** — not a judgment, but a reference point: "Typical PostNet returns range from 8-25%. Your preliminary estimate of 12-18% falls in the healthy range." A subtle visual gauge positions Sam's result within the brand's disclosed range. FTC-safe because it references the brand's publicly disclosed range, not a guarantee. If this feels slow, complicated, or produces a confusing number without context, Sam bounces.

2. **First AI-populated field (Story Mode).** Sam types about his rent, and the facilities cost field populates on the dashboard without him touching a form. This is the moment Story Mode proves its value — "I'm having a conversation, and my plan is building itself."

3. **Document download.** Sam clicks "Generate Package" and gets a PDF that looks like it was prepared by a financial consultant. Professional formatting, consistent numbers, FTC-compliant disclaimers, his name and location on every page. The plan header reads **"Sam's PostNet Plan"** — not "PostNet Financial Model." The franchisee's name appears before the brand name, reinforcing authorship. This is where the "Confidence Pack" emotional arc peaks.

4. **Estimated vs. actual comparison.** Chris opens her Location #2 plan next to her Location #1 actuals and sees exactly where reality diverged from the plan. This is the moment the tool proves it's not a one-time calculator — it's an operational system.

5. **Three-scenario side-by-side.** Good/Better/Best scenarios rendered together, showing Sam that even in the conservative case, the business works. This is the conviction moment that precedes the bank visit — and it's elevated to a primary interaction pattern, not a late-stage feature.

### Experience Principles

These five principles guide every UX decision in the Katalyst Growth Planner:

1. **You are the author.** The franchisee owns their plan. Every number is editable. AI suggests, brand defaults seed, but the franchisee decides. The UX must reinforce authorship at every turn — the plan is titled with the franchisee's name before the brand name ("Sam's PostNet Plan"), and every generated document carries the franchisee as the author. This directly supports FTC compliance positioning and is the emotional core of the product: unlike every other financial tool for franchisees that treats them as consumers of someone else's model, this tool makes them the author of their own business plan.

2. **Show the impact in their language.** When Sam changes a number, show what it means for the business in terms Sam understands — not just "Break-even: Month 14" but "You'd start making money by February 2027." Dates are real; month numbers are abstract. In Story Mode, the AI advisor translates financial metrics into business timeline language. In Expert Mode, Maria sees the finance-native metrics she prefers. The principle adapts per persona: Sam gets business language, Maria gets finance language, Chris gets a blend.

3. **Progressive confidence, not progressive complexity.** The UX arc matches Sam's emotional arc: Quick ROI (hope) → Story Mode guided planning (understanding) → Scenario comparison (conviction) → Document generation (professional confidence) → Post-opening actuals (operational mastery). Each stage should feel like a step up in competence, not a step up in difficulty.

4. **Same data, different lens.** Story Mode, Normal Mode, and Expert Mode are three ways to interact with the same **financial input state**. Switching modes is like switching between a paragraph view and an outline view of the same document. The visual language reinforces this: same color scheme, same summary cards, same field names, different interaction density. **Boundary:** Financial input state is shared across all modes. Mode-specific interaction state (conversation history in Story Mode, form section expansion in Normal Mode, column sort in Expert Mode) belongs to each mode individually. "Same data" means financial data — not all UI state.

5. **Trust through transparency.** Every AI-populated value shows its source. Every brand default is labeled and resettable. Save state is always visible. Item 7 ranges are always accessible. The tool earns trust by never hiding how it works or where a number came from.

### Party Mode Review Notes

The following improvements were incorporated via Party Mode review (PM John, Architect Winston, UX Sally):

| # | Improvement | Rationale |
|---|------------|-----------|
| 1 | Scenario comparison elevated to secondary core action; document generation moved to tertiary | Conviction is an interaction; documents are deliverables |
| 2 | Panel ratio constraints specified (360px min conversation, 480px min dashboard) | Prevents layout degradation at narrow viewports |
| 3 | Stacked-mode update indicator defined (accent dot + single pulse) | Solves cross-tab awareness without notification anxiety |
| 4 | Principle #2 rewritten: impact shown in persona-appropriate language | Sam needs dates; Maria needs finance metrics |
| 5 | Smart location suggestions added as offensive effortless interaction | Creates delight, not just friction prevention |
| 6 | Quick ROI sentiment indicator with brand range context | Prevents meaningless numbers for first-timers |
| 7 | Authorship emphasis: franchisee name before brand name in headers/documents | Reinforces empowerment philosophy |
| 8 | "Same data, different lens" boundary clarified: financial state shared, interaction state mode-specific | Prevents developer misinterpretation |

## Desired Emotional Response

### Primary Emotional Goals

The Katalyst Growth Planner must produce three distinct primary emotions, one per persona:

| Persona | Primary Emotion | The Moment It Peaks | What They'd Say |
|---------|----------------|---------------------|-----------------|
| **Sam** (first-timer) | **Confident competence** — "I understand my own business plan" | Downloading the lender-ready PDF and realizing he can explain every number in it | "I actually feel ready for this meeting." |
| **Maria** (veteran) | **Efficient mastery** — "This tool respects my time and expertise" | Finishing a full plan in 15 minutes with zero friction | "Finally, something that doesn't slow me down." |
| **Chris** (scaling) | **Informed control** — "I'm smarter this time because I can see what happened last time" | Comparing Location #1 actuals against Location #2 projections and seeing tighter assumptions | "I'm not guessing anymore." |

**Shared emotional goal across all personas:** **Authorship.** The franchisee should feel like the author of their plan, not the consumer of someone else's model. This is the emotional thread that connects all three personas and all three experience tiers.

### Emotional Journey Mapping

**Sam's Emotional Arc (the "Confidence Pack"):**

| Stage | Emotional State | UX Design Response |
|-------|----------------|-------------------|
| **Pre-entry** (kitchen table, 9 PM) | Anxious, overwhelmed, imposter syndrome | The invitation email and Quick ROI entry feel warm, simple, low-commitment. No financial jargon in the first interaction. |
| **Quick ROI** (first 90 seconds) | Cautious hope — "Maybe this is manageable" | A clear, positive-but-honest result with brand context. The sentiment frame ("healthy range") provides relief without overpromising. Warm visual tone. |
| **Story Mode Session 1** (with account manager) | Growing understanding — "I'm learning my own numbers" | The AI conversation is patient, explains context, never rushes. Every AI-populated field is visible and editable. The dashboard updates feel like magic, not pressure. |
| **Startup Cost Builder** | Surprised capability — "I didn't even think about insurance deposits" | Progressive revelation of cost categories builds competence. Item 7 ranges provide guardrails without judgment. "Reset to default" removes fear. |
| **Scenario Comparison** | Conviction — "Even the worst case works" | Three scenarios rendered side-by-side. The conservative case showing positive ROI is the emotional turning point. |
| **Document Generation** | Professional pride — "This looks like a real business plan" | The PDF is visually polished, clearly formatted, and carries Sam's name as the author. The document quality exceeds Sam's self-image — he feels more professional than he thought he was. A **live document preview** is visible during planning, building pride progressively rather than delivering it as a surprise at the end. Sam can see his plan taking shape as a professional document throughout the process. |
| **Bank Meeting** | Earned confidence — "I can explain every number" | (Outside the product, but the UX designed this moment.) Sam knows his numbers because he built them, not because they were handed to him. |
| **Post-opening actuals** | Operational ownership — "My plan is alive" | Updating estimates with actuals feels like maintaining a living document, not revisiting a dead one. The plan grows with the business. |

**Maria's Emotional Arc (Speed & Respect):**

| Stage | Emotional State | UX Design Response |
|-------|----------------|-------------------|
| **Login** | Impatient efficiency — "Let me work" | Expert Mode activates immediately. No onboarding, no tooltips, no tutorial overlays. |
| **Input entry** | Flow state — "This moves at my speed" | Tab-through navigation, instant recalculation, no confirmation dialogs. The interface disappears and the numbers remain. |
| **Scenario modeling** | Analytical satisfaction — "I see the levers" | Sensitivity analysis reveals which variables matter most. Maria finds insights, not just outputs. |
| **Multi-plan generation** | Portfolio command — "All my locations, one afternoon" | Generating packages for locations #8, #9, #10 in sequence feels like a production run, not three separate tasks. |

**Chris's Emotional Arc (Smarter This Time):**

| Stage | Emotional State | UX Design Response |
|-------|----------------|-------------------|
| **Location #2 start** | Determined improvement — "I know what went wrong last time" | Location #1 actuals are visible and referenceable during Location #2 planning. The system acknowledges her history. |
| **Startup cost review** | Sharp competence — "I've done this before, I know the real numbers" | Pre-filled defaults that Chris immediately overrides with confidence, informed by experience. |
| **Side-by-side comparison** | Measurable growth — "12% tighter assumptions" | Quantified improvement over Location #1 validates that Chris is genuinely better at this now. |

### Failure State Emotional Design

The emotional journey maps above describe the happy path. Equally important is the emotional design for when things go wrong. Three failure scenarios require explicit emotional handling:

**Scenario 1: The plan genuinely doesn't work (negative ROI)**

When Sam enters his real numbers and the conservative case shows negative ROI, the tool must not simply display bad numbers and leave Sam to draw conclusions. The emotional design response:

- **Never say "this won't work."** Instead: "At these numbers, the break-even timeline extends beyond 36 months. Here are the inputs with the most impact on that timeline."
- **Surface actionable levers.** Highlight the 3-4 inputs that most affect ROI (typically rent, initial investment, revenue assumptions) and show what values would bring the plan into positive territory. The message is "here's what would need to change," not "you should give up."
- **Distinguish location from franchise.** Guide Sam toward "this specific location may not be the best fit" rather than "franchising isn't for you." The tool should make it emotionally safe to abandon a bad location without abandoning the dream.
- **Support the advisor conversation.** When Sam's account manager Denise is on the call, the data provides an objective foundation for a difficult conversation. The tool is the honest broker.

**Scenario 2: The AI says something wrong**

When Story Mode extracts a wrong number from conversation (Sam said "forty-two hundred" and the AI populated $42,000), the correction flow must feel like editing a typo, not filing a bug report:

- **Inline correction.** The field is immediately editable. One click, fix the number, dashboard updates. No modal, no confirmation, no "are you sure?"
- **No trust penalty.** One wrong extraction shouldn't undermine confidence in the entire system. The correction should feel routine, not alarming. The AI acknowledges naturally: "Got it, updated to $4,200."
- **Visible source attribution.** The "AI-populated" label on the field makes it clear this was a suggestion, not a fact. Corrections reinforce that Sam is the author, the AI is the assistant.

**Scenario 3: Sam and his advisor disagree**

When Denise thinks Sam's revenue projection is too optimistic, the tool should support productive disagreement without taking sides:

- **Scenario branching.** Make it trivially easy to create "Sam's projection" and "Denise's suggestion" as two scenarios and compare them side by side. The tool facilitates the conversation rather than arbitrating it.
- **Brand context as neutral ground.** "PostNet locations in similar markets typically see $300K-$420K AUV in year one" provides objective context that neither party owns.
- **No winner declared.** Both scenarios are saved. Sam decides which to use in the final plan. Authorship is preserved even when the advisor disagrees.

### Micro-Emotions

**Critical micro-emotions to cultivate:**

- **Trust over skepticism.** Every number has a visible source (brand default, AI-populated, manual). Transparency eliminates the "where did this number come from?" anxiety. Trust is built through attribution, not explanation.
- **Safety over fear.** "Reset to default" on every field, auto-save that never loses work, and the ever-present "Book time with [Account Manager]" link create a psychological safety net. Experimentation becomes risk-free.
- **Accomplishment over frustration.** Section completion indicators, plan progress visualization, and the physical act of downloading a finished PDF all create closure moments. The UX should have definitive "you finished this part" signals.
- **Clarity over confusion.** Financial concepts are explained in plain language (in Story/Normal mode). The AI advisor never assumes financial literacy. Error messages describe the problem in business terms, not technical terms.

**Critical micro-emotions to prevent:**

- **Never judgment.** The ROI Threshold Guardian is advisory, never blocking. When Sam enters an optimistic growth rate, the system says "PostNet locations in similar markets typically see 10-15% first-year growth" — not "your growth rate is too high." The tone is a knowledgeable friend, not a gatekeeper.
- **Never abandonment.** If a session crashes, auto-save recovers. If the AI fails, Normal Mode is always available. If Sam gets confused, the booking link is always visible. There is always a next step or a helping hand.
- **Never embarrassment.** The tool never highlights what Sam doesn't know. Story Mode's conversational approach means Sam doesn't have to face a blank form and feel ignorant — the AI asks questions, Sam answers in natural language, and the form fills itself. **Brand averages are always presented as ranges with market context, not as single numbers that invite unfavorable comparison.** Instead of "PostNet average AUV: $380K," the system presents "PostNet locations range from $220K-$550K depending on market size and maturity. Your estimate of $280K is consistent with a first-year location in a mid-size market." The reframe turns a potential shame trigger into a contextualizing data point.

### Behavioral Proxies for Emotional Milestones

Emotional goals must be anchored in observable behavior to be validated. Each major emotional milestone maps to a measurable proxy:

| Emotional Milestone | Behavioral Proxy | What It Indicates |
|---------------------|-----------------|-------------------|
| **Cautious hope** (Quick ROI) | Sam proceeds to full planning within 48 hours | Hope was sufficient to overcome inertia |
| **Growing understanding** (Story Mode) | Sam edits 3+ AI-populated values (not just accepts them) | Engagement, not passive consumption |
| **Conviction** (Scenario comparison) | Sam creates or reviews 2+ scenarios before document generation | Conviction required comparison, not assumption |
| **Professional pride** (Document download) | Sam shares/downloads the document within the session | Immediate sharing signals pride in the output |
| **Efficient mastery** (Maria, Expert Mode) | Plan completed in under 20 minutes with <3 mode switches | Speed maintained, no friction-induced detours |
| **Operational ownership** (Post-opening) | Franchisee returns to update actuals within 30 days of opening | Return signals living-document ownership |

These proxies inform analytics instrumentation, not UX design directly — but they anchor the emotional design in testable outcomes.

### Design Implications

| Emotional Goal | UX Design Choice |
|---------------|-----------------|
| Confident competence (Sam) | Progressive disclosure: summary first, detail on demand. Plain-language impact statements. "Your plan" header language. |
| Efficient mastery (Maria) | Expert Mode: zero onboarding friction, keyboard navigation, instant recalculation, minimal chrome. |
| Informed control (Chris) | Location #1 actuals visible during Location #2 planning. Quantified improvement metrics. |
| Authorship (all) | Franchisee name before brand name in all headers and documents. "Reset to default" preserves agency. Every AI suggestion is a suggestion, never an override. |
| Trust | Source attribution on every field. "Brand default" / "AI-populated" / "Your entry" labels. Item 7 range reference always available. |
| Safety | Auto-save status indicator. Persistent consultant booking link. Per-field reset. Graceful AI degradation to form mode. |
| Non-judgment | Advisory tone in all guardrails. "Typical range" language, not "you're wrong" language. No red/error styling for business judgment calls — reserve red for actual errors. Brand averages shown as ranges with market context, never as single-number comparison points. |
| Professional pride | Document output quality exceeds user's self-image. Polished PDF formatting. Consistent financial formatting throughout. Brand-appropriate design. **Live document preview** visible during planning — Sam can see the professional artifact taking shape as he works, building pride during the process rather than delivering it only at the end. |
| Failure state empowerment | Bad ROI surfaces actionable levers. AI errors corrected inline with zero friction. Advisor disagreements resolved through scenario branching, not arbitration. |

### Emotional Design Principles

1. **Confidence is built in layers, not leaps.** Each stage of the planning process should make the user feel slightly more capable than the previous stage. The Quick ROI builds hope; Story Mode builds understanding; scenarios build conviction; documents build professional identity. Never skip a layer.

2. **Respect the expertise they bring.** Maria doesn't need education. Chris needs it available, not forced. Sam needs it woven in naturally. The emotional design adapts to what the user already knows — it never talks down and never assumes too much.

3. **Make the math invisible but the meaning visible.** The financial engine is complex; the user experience of it must not be. Sam should never see a formula. He should see "You'd start making money by February 2027" — the business meaning, not the calculation. Emotional confidence comes from understanding the story of the numbers, not the mechanics.

4. **The safety net is always visible.** Auto-save status, consultant booking, reset-to-default, and graceful AI degradation are all anxiety-prevention mechanisms. They should be ever-present but low-profile — visible enough to provide comfort, quiet enough to not create clutter. The user should never wonder "what if I mess this up?"

5. **Documents are mirrors.** The generated PDF should reflect back a version of Sam that feels more professional than his self-image. When Sam opens his lender package, the quality of the output should make him think "I made this?" with pride, not surprise. A **live document preview** supports this by letting Sam watch the professional artifact take shape during planning — pride builds progressively, not as a reveal.

6. **Speed is respect.** For Maria, the emotional design IS the absence of friction. When she can tab through 20 fields in 30 seconds without a single modal, tooltip, or confirmation dialog interrupting her flow, that silence is the product delivering its emotional promise. Expert Mode's emotional success is measured by how little it gets in the way. Every unnecessary interaction is a small act of disrespect to Maria's time and expertise.

### Party Mode Review Notes

The following improvements were incorporated via Party Mode review (BA Mary, PM John, UX Sally, SM Bob):

| # | Improvement | Rationale |
|---|------------|-----------|
| 1 | Failure state emotional design added: bad ROI with actionable levers | Prevents emotional devastation on unhappy paths; empowers pivoting |
| 2 | Three failure scenarios defined: bad plan, AI error, advisor disagreement | Covers the emotional design for all major unhappy paths |
| 3 | Brand averages reframed as ranges with market context | Prevents comparison embarrassment; contextualizes rather than judges |
| 4 | Behavioral proxies added for each emotional milestone | Anchors emotional goals in observable, measurable behavior |
| 5 | "Speed is respect" added as Emotional Design Principle #6 | Gives Expert Mode its own emotional identity beyond "absence of features" |
| 6 | Live document preview added to pride-building design | Builds professional pride during the process, not just at generation time |

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

**1. Notion — Multi-paradigm interaction on the same data**

Notion is the closest precedent for the "same data, different lens" principle. A Notion database can be viewed as a table (Expert Mode analog), a board (Normal Mode analog), or a list with rich content (Story Mode analog) — all operating on the same underlying records. What Notion does well:

- **View switching feels like a camera angle change, not a product switch.** The toolbar stays consistent, the data is recognizably the same, and the user's mental model survives the transition.
- **Progressive disclosure through toggle blocks and expandable rows.** Summary information is visible; detail is one click away. This maps directly to the financial field metadata challenge (brand default, Item 7 range, source attribution).
- **Templates with pre-filled content that users customize.** Notion templates are "edit, don't create" — exactly the brand-defaults-as-starting-point pattern the Katalyst Growth Planner needs.

**Transferable insight:** The view-switching affordance (tabs or segmented control at the top of the workspace) should feel like Notion's database views — lightweight, instant, and the data below is recognizably continuous.

**2. Linear — Opinionated speed and keyboard-first interaction**

Linear is the gold standard for Maria's emotional design principle: "speed is respect." What Linear does well:

- **Keyboard-first everything.** Cmd+K command palette, single-key shortcuts, tab-through forms. Power users never touch the mouse. This is the interaction model for Expert Mode.
- **Instant optimistic updates.** When you change a field in Linear, the UI updates before the server confirms. The interface feels faster than the network. This is critical for the "real-time recalculation" core interaction — the dashboard should update optimistically while the financial engine computes.
- **Minimal chrome, maximum content.** Linear's UI is famously sparse. Sidebars collapse, headers shrink, and the work takes center stage. Expert Mode should feel this clean.
- **Opinionated defaults.** Linear doesn't ask "how would you like to configure your workflow?" — it provides a workflow and lets you adjust. This maps to brand defaults that pre-fill everything.
- **Filtering and bulk operations.** Linear's ability to filter, sort, and perform bulk actions across issues maps to Expert Mode's portfolio management needs — Maria working across multiple location plans needs similar filtering, sorting, and quick-switch capabilities.

**Transferable insight:** Expert Mode's tab-through experience should aim for Linear-level keyboard responsiveness. The absence of friction IS the feature. Linear's filtering paradigm should inform Expert Mode's portfolio-level plan management and a **quick plan-switch shortcut** for Maria navigating between locations.

**3. Coda / Airtable — Financial modeling with approachable UX**

Coda (and to a lesser extent Airtable) bridges the gap between spreadsheet power and document approachability. What they do well:

- **Formulas hidden behind friendly displays.** Coda shows calculated results with formatting, not raw formulas. The user sees "$4,200/month" not "=B12*0.07." This is essential for Sam — the financial engine's complexity must be invisible.
- **Inline charts that update with the data.** When a value changes in a Coda table, embedded charts redraw instantly. This is the live dashboard pattern for Story Mode's split screen.
- **Section-based document organization.** Coda organizes content into collapsible sections with clear headers — the exact pattern Normal Mode needs for organizing financial input categories (Revenue, Operating Costs, Startup Costs, etc.).

**Transferable insight:** Normal Mode's section-based form layout should feel like a Coda document — collapsible sections, clear progress through categories, and inline summary visualizations that update as you work.

**4. Intercom / Drift — AI conversation with structured data extraction**

Modern AI support tools demonstrate the split-screen conversational pattern. What they do well:

- **Conversation panel + context panel side by side.** The agent chats on the left; customer context, order history, and actions appear on the right. This is architecturally identical to Story Mode's conversation + dashboard layout.
- **Structured data extracted from natural language.** When a customer says "I ordered the blue one last Tuesday," the system highlights the matching order in the context panel. This is the pattern for AI-populated financial fields.
- **Suggested responses and actions.** The AI suggests next steps that the agent can accept or modify. Story Mode's AI advisor suggesting financial values follows this same pattern — suggest, don't override.

**Transferable insight:** Story Mode's split-screen layout should study Intercom's proportions and interaction flow — particularly how the context panel highlights relevant data when the conversation references it.

**5. Mercury / Brex — Financial dashboards that feel approachable**

Modern fintech dashboards have solved the "financial data without intimidation" problem. What Mercury does well:

- **Summary cards with progressive drill-down.** The dashboard shows 4-5 key metrics prominently. Click any metric for detail. This maps directly to the financial summary dashboard in Story/Normal mode.
- **Clean data visualization with contextual annotations.** Charts include helpful context ("This is 12% higher than last month") without cluttering the visual. The sentiment framing for Quick ROI follows this pattern.
- **Professional but warm visual design.** Mercury proves that financial tools can be visually warm without feeling unserious. The warm neutral palette from the Katalyst design system achieves this same balance.

**Transferable insight:** The financial summary dashboard should study Mercury's card-based layout — 4-5 headline metrics (Total Investment, Monthly Revenue, Break-Even Month, ROI Range, Monthly Cashflow) with drill-down to detail.

**6. Shopify / Zendesk — White-label theming with platform identity**

The white-label theming challenge has a direct precedent in platforms that maintain platform identity across branded deployments. What Shopify does well:

- **Admin panel = platform identity.** The Shopify admin is unmistakably Shopify regardless of the store brand — consistent navigation, component library, interaction patterns. The merchant recognizes "I'm in Shopify" even though their storefront is fully branded. This is architecturally identical to the Katalyst approach: the planning workspace IS the Katalyst design system, the brand accent/logo is the customer-facing layer.
- **Storefront = brand layer.** The brand owns colors, logos, and customer-facing copy. The platform owns structure, interaction patterns, and the admin experience.
- **Cross-deployment recognition.** A Shopify merchant who manages multiple stores instantly recognizes the admin experience. This is the multi-unit franchisee requirement — Maria working across PostNet and Tint World immediately recognizes "this is a Katalyst tool."

Zendesk follows a similar pattern: the agent workspace is recognizably Zendesk across all customer deployments, while the customer-facing help center carries the brand's identity.

**Transferable insight:** The Katalyst theming architecture should follow the Shopify admin/storefront split — CSS custom properties swap brand accent colors and logos, but the design system foundation (component shapes, typography, spacing, interaction patterns) is constant and recognizable across all brand deployments.

**7. Google Docs / Figma — Auto-save trust signals**

Auto-save trust is an emotional design requirement, and two products have perfected the pattern:

- **Google Docs' save indicator:** A tiny, unobtrusive status line in the header transitions through precise states: typing → "Saving..." → "All changes saved to Drive" with timestamp. It's visible enough to provide comfort, quiet enough to never distract. The transitions are smooth and the language is confident.
- **Figma's save status:** Similar pattern with "All changes saved" in the toolbar. Figma adds visual file version history as a safety net — users can see and restore any previous state.

**Transferable insight:** The auto-save indicator should follow Google Docs' exact pattern — a small status element in the workspace chrome with "Saving..." / "All changes saved" transitions. Include a last-saved timestamp for multi-session planning confidence. The indicator must be visible but never compete for attention with the planning workspace.

### Transferable UX Patterns

**Navigation Patterns:**

| Pattern | Source | Application in Katalyst |
|---------|--------|------------------------|
| Segmented control for view switching | Notion database views | Mode switcher (Story / Normal / Expert) — lightweight tabs, not heavy navigation |
| Collapsible sidebar with icon-only state | Linear | Brand-themed sidebar collapses to 44px icons at narrow viewports |
| Section-based vertical scrolling | Coda documents | Normal Mode organizes financial inputs into collapsible category sections |
| Persistent context panel | Intercom | Story Mode dashboard stays visible while conversation scrolls |
| Quick-switch shortcut | Linear filtering | Expert Mode plan-switch for Maria navigating between location plans |

**Interaction Patterns:**

| Pattern | Source | Application in Katalyst |
|---------|--------|------------------------|
| Optimistic UI updates | Linear | Dashboard recalculates instantly on input change; server confirmation is invisible |
| Keyboard-first tabbing | Linear | Expert Mode tab-through for Maria's 15-minute plan completion |
| AI suggestion → user confirmation | Intercom/Drift | Story Mode AI populates a field; field shows "AI-populated" badge, user can edit or accept |
| Template-as-starting-point | Notion | Brand defaults pre-fill every field; planning is "editing," not "creating from scratch" |
| Metadata on demand (focus/hover) | Coda (adapted) | Per-field metadata (brand default, Item 7 range, source) appears on focus or hover, not at rest — prevents tooltip overload while keeping information accessible |
| Auto-save trust transitions | Google Docs / Figma | "Saving..." → "All changes saved" status in workspace chrome with last-saved timestamp |

**Visual Patterns:**

| Pattern | Source | Application in Katalyst |
|---------|--------|------------------------|
| Summary cards with drill-down | Mercury/Brex | Financial dashboard: 4-5 headline metrics, click for detail breakdowns |
| Warm-neutral financial UI | Mercury | Katalyst's warm neutral palette proves financial tools can feel approachable |
| Contextual data annotations | Mercury | "Your estimate is within the typical PostNet range" annotations on charts |
| Clean chart + table hybrid | Airtable | Scenario comparison rendered as cards with embedded sparklines |
| Admin/storefront theming split | Shopify/Zendesk | CSS custom properties swap brand accent; design system foundation stays constant |

### Anti-Patterns to Avoid

| Anti-Pattern | Why It Fails | Katalyst Alternative |
|-------------|-------------|---------------------|
| **Forced-linear wizard forms** | Prevents skipping ahead, traps experienced users (Maria), creates frustration when you know where you want to go | Section-based layout with all sections accessible and a **suggested order** with completion indicators. The sequence is a recommendation, not a lock — Sam follows it naturally, Chris skips ahead freely, Maria ignores it entirely. |
| **Modal confirmations for routine actions** | Interrupts flow state, disrespects Maria's time, creates anxiety ("did I do something dangerous?") | Optimistic updates with undo capability; auto-save eliminates the need for "are you sure?" |
| **Dashboard-only views** (no interaction with the data) | Passive consumption, not authorship; the user feels like a spectator, not the author | Every number on the dashboard links back to the input that drives it; the dashboard is interactive, not read-only |
| **Onboarding tutorial overlays** | Patronizing for experienced users, easily dismissed and forgotten by new users | Story Mode IS the onboarding for Sam; Expert Mode skips it entirely; Normal Mode has inline contextual help |
| **Single-number comparisons to averages** | Creates shame/judgment ("you're below average") | Range-based context with market tier: "PostNet locations range from $220K-$550K depending on market" |
| **Red/error styling for business judgment** | Treats legitimate business decisions as mistakes; undermines authorship | Reserve red for actual errors (missing required fields, system errors). Use advisory blue/purple (the "Gurple" pattern) for guardrail suggestions |
| **Separate "reports" section** | Disconnects the planning experience from the output; documents feel like an afterthought | Live document preview during planning; generation is the culmination of the same workspace |
| **Tooltip overload (visible metadata on every field)** | Creates visual "chickenpox" — info icons on every field make the UI feel cluttered and overwhelming, especially when every financial input carries brand defaults, Item 7 ranges, and source attribution | **Metadata on demand:** Fields show their value cleanly at rest. Brand default, Item 7 range, source attribution, and reset affordance appear on field focus or hover — accessible when needed, invisible when not. This preserves clean visual density while keeping full information depth available. |

### Design Inspiration Strategy

**What to Adopt:**

- **Notion's view-switching mental model** — Mode switching must feel like changing a view on the same document, not navigating to a different product. Segmented control, continuous data, instant transition.
- **Linear's keyboard-first speed** — Expert Mode must match Linear's responsiveness. Tab-through, instant updates, minimal chrome. Maria's satisfaction depends on this.
- **Mercury's financial summary cards** — The dashboard layout of 4-5 headline metrics with drill-down is proven and appropriate. Don't reinvent financial data presentation.
- **Intercom's split-screen conversation + context** — Story Mode's architecture already mirrors this pattern. Study the proportions and interaction flow.
- **Shopify's admin/storefront theming split** — The Katalyst design system is the "admin panel" (constant across deployments); brand accent colors and logos are the "storefront" layer (swapped per brand via CSS custom properties).
- **Google Docs' auto-save trust signals** — The "Saving..." / "All changes saved" pattern with timestamp is the exact UX needed for multi-session planning confidence.

**What to Adapt:**

- **Coda's section-based organization → Normal Mode forms.** Coda sections are free-form documents; Normal Mode sections are structured financial input categories. Adopt the collapsible-section pattern but with form fields and validation, not rich text.
- **Linear's filtering and portfolio operations → Expert Mode plan management.** Linear's ability to filter, sort, and bulk-operate across issues maps to Maria's need to manage multiple location plans efficiently. Adapt as a quick plan-switch shortcut and portfolio-level filtering, not as a command palette for AI conversation.
- **Mercury's annotations → brand-contextual sentiment.** Mercury annotates with month-over-month change; Katalyst annotates with brand-range context and business-timeline impact. Same pattern, different content.
- **Coda's inline detail → metadata on demand.** Coda shows formula details on cell focus; Katalyst shows field metadata (source, brand default, Item 7 range) on field focus/hover. Same progressive-disclosure principle, applied to financial input metadata.

**What to Avoid:**

- **Notion's flexibility overload.** Notion lets you build anything, which means new users build nothing. Katalyst has a defined structure (startup costs, revenue, operating costs) — the flexibility is in the numbers, not the structure.
- **Linear's learning curve.** Linear's power comes with a steep learning curve for non-technical users. Story Mode must be immediately accessible to Sam with zero learning required.
- **Airtable's formula complexity.** Airtable eventually exposes users to formula syntax. Katalyst must never expose the financial engine's formulas — the math is always invisible.

### Party Mode Review Notes

The following improvements were incorporated via Party Mode review (Architect Winston, UX Sally, PM John, BA Mary, SM Bob):

| # | Improvement | Rationale |
|---|------------|-----------|
| 1 | Added Shopify/Zendesk as white-label theming inspiration (admin panel = platform identity, storefront = brand layer) | Fills the theming gap — no prior inspiration addressed the white-label challenge |
| 2 | Added Google Docs/Figma as auto-save trust signal inspiration with specific pattern details | Provides concrete pattern reference for the save status UX emotional requirement |
| 3 | Wizard anti-pattern refined: forced-linear locking is the problem, not sequential guidance | Allows helpful sequencing in Normal Mode while preventing Maria's frustration |
| 4 | Tooltip-overload anti-pattern added; metadata-on-demand (focus/hover, not at-rest) prescribed | Solves per-field metadata density without visual clutter — critical for 50+ financial input fields |
| 5 | Linear's Cmd+K adaptation replaced with filtering/portfolio management and quick plan-switch shortcut | More accurate pattern mapping for Maria's multi-plan workflow |

## Design System Foundation

### Design System Choice

**Approach: Themeable Component System — Tailwind CSS + shadcn/ui with Katalyst Design Token Layer**

The Katalyst Growth Planner uses a **three-layer design system architecture:**

1. **Foundation layer: Tailwind CSS** — Utility-first CSS framework providing the spacing scale, responsive breakpoints, and layout primitives. Tailwind's design token system (via CSS custom properties in `index.css`) is the mechanism for white-label brand theming.

2. **Component layer: shadcn/ui** — Headless, composable React components built on Radix UI primitives. These provide accessible, unstyled component logic (dialogs, dropdowns, tabs, forms, tooltips) that the Katalyst design system styles. Components are copied into the project (not imported from a package), giving full control over styling and behavior.

3. **Brand layer: Katalyst Design Tokens** — A custom CSS custom property system that defines the Katalyst visual identity (colors, typography, spacing, border radii, shadows) and supports per-brand accent color overrides. This layer sits on top of Tailwind and shadcn/ui, providing the "branded shell" theming capability.

### Rationale for Selection

| Factor | Decision Driver |
|--------|----------------|
| **White-label requirement** | Tailwind's CSS custom property system enables dynamic brand theming without build-time configuration. A brand's accent color swaps via overriding `--primary` at runtime without rebuilding the application. |
| **Architecture alignment** | The architecture document (Step 3 of architecture workflow) already specifies React + Tailwind + shadcn/ui. The design system choice must align with the technical foundation. |
| **Component accessibility** | shadcn/ui components are built on Radix UI, which provides WCAG 2.1 AA accessibility out of the box — keyboard navigation, focus management, screen reader support. This is non-negotiable for a financial planning tool. |
| **Three-mode interaction density** | Story Mode needs conversational UI components (chat bubbles, streaming text). Normal Mode needs form-heavy layouts (input groups, sections, validation). Expert Mode needs data-dense grids (tabular input, inline editing). shadcn/ui provides the form and dialog primitives; custom components extend for chat and grid. |
| **Design control** | shadcn/ui copies components into the project rather than importing them from a package. This means Katalyst can modify any component's internals — critical for implementing the metadata-on-demand pattern, the field source attribution badges, and the auto-save status indicator. |
| **Team velocity** | Tailwind + shadcn/ui is the most productive React component approach for a solo developer or small team. No design file handoff required; components are styled inline with utility classes. |
| **Existing template** | The Replit full-stack JS template already includes Tailwind CSS and shadcn/ui, eliminating setup time. |

### Implementation Approach

**Brand Theming Mechanism: Option A (Override `--primary`) with Katalyst Escape Hatch**

Brand theming works by overriding `--primary` (and its foreground counterpart) at runtime when a brand context loads. All existing shadcn/ui components reference `--primary` and automatically adopt the brand's accent color with zero component modifications. This is the simplest, most maintainable approach.

**Single escape hatch:** A `--katalyst-brand` token is defined that always resolves to Katalyst Green regardless of brand context. This is used exclusively for the "Powered by Katalyst" badge in the sidebar footer and any Katalyst-identity elements that must NOT shift with brand theming. Everything else flows through `--primary`.

**Design Token Architecture:**

```
CSS Custom Properties (index.css)
├── Katalyst Foundation Tokens
│   ├── --background, --foreground (warm neutrals)
│   ├── --card, --card-foreground
│   ├── --primary, --primary-foreground (Katalyst Green default; overridden per brand)
│   ├── --katalyst-brand (always Katalyst Green — escape hatch for Powered-by badge)
│   ├── --secondary, --accent, --muted
│   ├── --destructive (reserved for actual errors only)
│   ├── --info (the "Gurple" — advisory/educational content)
│   └── --radius (border radius scale)
├── Typography Tokens
│   ├── --font-heading: 'Montserrat' (Katalyst constant)
│   ├── --font-body: 'Roboto' (Katalyst constant)
│   └── --font-mono: 'Roboto Mono' (financial figures)
├── Financial Formatting Tokens (design system constants)
│   ├── Currency: leading $, no space, 2 decimal places
│   ├── Percentages: 1 decimal place, trailing %
│   ├── Months/integers: 0 decimal places
│   ├── Thousands: comma separators (always)
│   └── Negative numbers: accounting-style parentheses, NOT minus signs
│       e.g., ($4,200) not -$4,200
└── Dark Mode Tokens (.dark class)
    └── All foundation tokens with dark-mode values
    └── NOTE: Dark mode DEFERRED to post-MVP (see Customization Strategy)
```

**Brand theming is applied at runtime** by setting `--primary` and `--primary-foreground` on the root element when a brand context is loaded. The component library remains unchanged — only the token values shift. This means:
- A PostNet deployment overrides `--primary` to PostNet blue
- A Tint World deployment overrides `--primary` to Tint World red
- The Katalyst design system (component shapes, typography, spacing, interaction patterns, the "Gurple" info pattern) remains constant
- The "Powered by Katalyst" badge always uses `--katalyst-brand` (Katalyst Green)

**Component Strategy:**

| Component Category | Source | Customization Level | Notes |
|-------------------|--------|-------------------|-------|
| **Layout primitives** (sidebar, header, panels) | shadcn/ui sidebar + custom | Heavy | Brand logo placement, collapsible behavior, mode switcher |
| **Form components** (inputs, selects, checkboxes) | shadcn/ui form | Moderate | Metadata-on-demand overlay on focus, source attribution badges |
| **`<FinancialValue>` primitive** | Custom component | Full custom | **Design system primitive** — handles all number formatting (currency decimals, thousands separators, accounting-style negatives, percentage formatting). All financial displays use this component; individual components never format numbers directly. |
| **Financial display** (summary cards, charts, sparklines) | Custom components using `<FinancialValue>` | Full custom | Mercury-inspired card layout, drill-down behavior, scenario comparison |
| **Chat/conversation** (Story Mode) | Custom components | Full custom | AI message bubbles, streaming text, field-population animations |
| **Data grid** (Expert Mode) | **Purpose-built component on TanStack Table** | Full custom | This is the highest-risk, highest-complexity custom component. TanStack Table (headless, React-native) provides virtualization, sorting, and column management. Katalyst owns cell rendering, keyboard navigation (Linear-speed tab-through), inline editing with type-aware inputs, optimistic recalculation, row-level source attribution, and conditional "Gurple" formatting for out-of-range values. NOT an "adapted table" — a purpose-built financial grid. |
| **Dialogs, tooltips, dropdowns** | shadcn/ui (Radix primitives) | Light | Styled to Katalyst tokens, no structural changes |
| **Navigation** (mode switcher, breadcrumbs) | shadcn/ui tabs/segmented | Moderate | Notion-inspired view-switching feel |

### Customization Strategy

**What Katalyst owns (constant across all brands):**

- **Typography:** Montserrat for headings, Roboto for body, Roboto Mono for financial figures. These never change per brand — they ARE the Katalyst identity.
- **Component geometry:** Rounded corners (`rounded-md` on controls, consistent border width), consistent padding scale. The physical "shape" of every component is Katalyst.
- **Interaction patterns:** hover-elevate / active-elevate-2 behavior, metadata-on-demand on focus, optimistic updates, auto-save status transitions. How the product *behaves* is Katalyst.
- **Color system structure:** Warm neutrals for backgrounds, the "Gurple" (info-purple) for advisory content, reserved red for actual errors, green for success states. The *roles* of colors are Katalyst.
- **Financial formatting:** The `<FinancialValue>` primitive enforces consistent number presentation — accounting-style negatives, comma separators, appropriate decimal places — across all modes and components.
- **Spacing scale:** Consistent small/medium/large spacing values across all components and layouts.
- **Data visualization style:** Chart types, annotation patterns, sparkline rendering, scenario comparison card layout.

**What brands own (swapped per deployment):**

- **Primary accent color:** The `--primary` token is overridden per brand, affecting buttons, links, active states, progress indicators, and the accent dot in stacked-mode tab indicators.
- **Logo:** Brand logo appears in the sidebar header and document outputs. Katalyst logo appears in the sidebar footer ("Powered by Katalyst") and the login/about areas.
- **Contextual copy:** "PostNet benchmarks," "PostNet average AUV range," brand-specific startup cost categories from the brand seed data.
- **Startup cost template:** The categories and default values in the financial model come from the brand's seed data, not from Katalyst.

**Dark Mode: Deferred to Post-MVP**

The token architecture fully supports dark mode via the `.dark` class structure — dark-mode values can be added to every foundation token without refactoring. However, dark mode implementation is **deferred to post-MVP** for the following reasons:

- Financial planning tools are primarily used in well-lit environments (offices, bank meetings, kitchen tables). Dark mode is a preference, not a requirement.
- Implementing dark mode doubles the visual testing matrix (every screen, every mode, light AND dark).
- The token architecture means adding dark mode later requires only filling in `.dark` token values and testing — zero component changes, zero layout changes.
- Maria (the most likely dark-mode requester for long sessions) is a post-MVP optimization target.

**The Recognition Test (Testable Checklist):**

The recognition test passes when the **only** visual differences between two brand deployments are:

1. The accent color of interactive elements (buttons, links, active states, progress indicators)
2. The logo in the sidebar header
3. Brand-specific copy (brand name, benchmark references, startup cost categories)

Everything else — typography, component shapes, spacing, interaction behavior, layout structure, the "Gurple" info pattern, the "Powered by Katalyst" badge, data visualization style — must be **pixel-identical** across brand deployments. This is a verifiable checklist, not an aspiration.

### Party Mode Review Notes

The following improvements were incorporated via Party Mode review (Architect Winston, UX Sally, PM John, BA Mary, SM Bob):

| # | Improvement | Rationale |
|---|------------|-----------|
| 1 | Brand theming uses Option A (override `--primary` per brand) with single `--katalyst-brand` escape hatch for Powered-by badge | Simplifies implementation; every shadcn/ui component works without modification |
| 2 | `<FinancialValue>` design system primitive added with number formatting tokens (decimals, separators, accounting-style negatives, currency) | Ensures consistent financial display; no component ever formats numbers independently |
| 3 | Expert Mode grid explicitly specified as purpose-built on TanStack Table; highest-risk component flagged | De-risks the most complex custom component with a proven headless foundation |
| 4 | Dark mode deferred to post-MVP; token architecture supports it with zero refactoring cost later | Eliminates testing matrix doubling; ships faster without architectural compromise |
| 5 | Recognition test made concrete: only accent color, logo, and brand copy differ; everything else pixel-identical | Converts aspirational principle into verifiable checklist |

## Core Experience Design

### Defining Experience

**"I told it about my business, and it built my plan."**

That's the sentence Sam would say to a friend. The defining experience of the Katalyst Growth Planner is **natural-language financial planning with real-time visual feedback** — the moment where Sam describes his situation in plain English and watches a professional financial plan materialize on the right side of the screen.

This is the interaction that differentiates Katalyst from every spreadsheet template, every SBA calculator, and every consultant-driven engagement. The user doesn't fill out a form — they have a conversation. The plan doesn't appear at the end — it builds live as they talk.

But the defining experience must also work for Maria, who would describe the product differently: **"I finished the whole plan in twelve minutes without touching a mouse."** Her defining experience is the Expert Mode tab-through — the same financial engine, the same output, but the interaction is raw speed instead of guided conversation.

The unifying defining experience across all personas is: **"I changed something, and the plan immediately showed me what it meant."** Real-time financial feedback is the common thread. The input method varies (conversation, form, grid); the magic moment is the same — numbers change, meaning surfaces, the plan evolves.

### User Mental Model

**How users currently solve this problem:**

- **Sam (first-timer):** Has no mental model for financial planning. His reference point is the FDD (Franchise Disclosure Document) — a dense legal document that lists Item 7 costs but doesn't help him understand what they mean for HIS situation. He may have a spreadsheet his franchisor gave him, or he's working with a Katalyst account manager who walks him through numbers on a screen share. His mental model is: "Someone smart tells me the numbers, and I trust them."
- **Maria (veteran):** Has a highly developed mental model based on Excel. She thinks in rows and columns. Her financial planning is a spreadsheet she's refined over years. Her mental model is: "I know my numbers; the tool just needs to organize them and produce the output."
- **Chris (scaling):** Has a hybrid mental model. She's done this once, so she has reference points (Location #1 actuals), but she's not confident enough to work without structure. Her mental model is: "Last time I guessed; this time I want to be smarter about it."

**Mental model shifts the product must create:**

| From | To | Mechanism |
|------|----|-----------|
| "Someone tells me the numbers" (Sam) | "I understand and own my numbers" | Story Mode conversation extracts Sam's knowledge; the AI doesn't tell him the answers — it helps him discover them |
| "I need a spreadsheet" (Maria) | "I need a planning system" | Expert Mode matches spreadsheet speed; scenario comparison and document generation exceed spreadsheet capability |
| "I'm guessing" (Chris) | "I'm improving" | Location #1 actuals visible during Location #2 planning; quantified tightening of assumptions |

**Where users will get confused or frustrated:**

- **Sam:** The gap between "I'm having a conversation" and "this produced a financial plan" is conceptually large. If the dashboard doesn't update visibly during the conversation, Sam won't trust that the conversation is doing anything productive. The live dashboard is not a nice-to-have — it's the proof that the conversation has purpose.
- **Maria:** If Expert Mode has ANY unnecessary friction (confirmation dialogs, slow recalculation, mouse-required interactions), Maria will perceive the entire product as amateur. Her frustration tolerance is near zero.
- **Chris:** The scenario comparison feature must be discoverable without being forced. Chris needs to find it naturally after building her primary plan, not be pushed into it before she's ready.

### Success Criteria

**The core interaction succeeds when:**

| Criterion | Measurable Indicator | Persona |
|-----------|---------------------|---------|
| **Real-time feedback feels instant** | Dashboard updates within 200ms of input change (optimistic UI); full recalculation completes within 500ms | All |
| **Story Mode conversation populates fields accurately** | 80%+ of AI-extracted values require no correction from the user | Sam |
| **Story Mode conversation covers the plan** | 70%+ of material financial inputs addressable through guided conversation in a single session; remaining 30% are brand defaults that don't require discussion (insurance rates, depreciation schedules, etc.) | Sam |
| **The plan feels like "mine"** | Franchisee edits 3+ AI-populated or default values (not just accepts everything) | Sam, Chris |
| **Expert Mode matches spreadsheet speed** | Plan completion in under 20 minutes with tab-through, no mouse required for core input | Maria |
| **Scenario comparison drives conviction** | User creates or reviews 2+ scenarios before document generation | Sam, Chris |
| **Document output exceeds expectations** | User downloads or shares the document within the same session (not "I'll look at this later") | All |
| **Mode switching preserves trust** | User switches modes at least once without losing data or needing to re-enter values | Chris |
| **Quick ROI creates engagement** | User proceeds from Quick ROI to full planning within 48 hours | Sam |

### Novel UX Patterns

**Pattern classification for each major interaction:**

| Interaction | Classification | Analysis |
|------------|---------------|----------|
| **AI conversation → financial field population** | **Novel** | No mainstream financial planning tool uses conversational AI to extract structured financial inputs from natural language. This is the highest-risk, highest-reward interaction. The precedent is Intercom's data extraction from support conversations, adapted for a very different domain. Users have no prior expectation for this — the UX must teach the pattern through immediate, visible results (field populations on the dashboard). |
| **Split-screen conversation + live dashboard** | **Novel combination of established patterns** | Split-screen panels are established (Intercom, IDEs, email clients). Live-updating dashboards are established (Mercury, trading platforms). The combination — a conversation that drives live dashboard updates — is novel. The risk is cognitive split: users watching the dashboard might stop engaging with the conversation, or vice versa. The AI advisor must reference dashboard changes conversationally ("I've updated your facilities cost — notice how that shifted your break-even by a month") to bridge the two panels. |
| **Three-mode view switching on shared data** | **Established (Notion precedent)** | Notion's database views prove this pattern works. The key is maintaining the Notion-like "same data, different camera angle" feel. The segmented control must be lightweight, the data transition must be instant, and the summary cards must appear in all three modes to anchor the user's sense of continuity. |
| **Brand-default pre-fill with per-field reset** | **Established (template pattern)** | Notion templates, CRM lead defaults, email template customization. Users understand "start with a template, customize." The novelty is per-field source attribution (Brand Default / AI-Populated / Your Entry) and per-field reset — these extend the familiar template pattern with transparency affordances. |
| **Scenario comparison (Good/Better/Best)** | **Established (spreadsheet what-if)** | Excel users understand scenario modeling. The Katalyst version adds visual side-by-side comparison with contextual sentiment ("Your conservative case still shows positive ROI by month 18"). The pattern is familiar; the presentation is elevated. |
| **Expert Mode spreadsheet grid** | **Established (spreadsheet pattern)** | The mental model is Excel. Tab-through, inline editing, instant recalculation. The only novelty is the integration with the financial engine (calculated fields that update as you type) and source attribution per row. Maria expects spreadsheet behavior; deliver it exactly. |

**Novel pattern education strategy:**

For the two novel patterns (AI field population and split-screen conversation + dashboard), the education strategy is **immediate demonstration, not explanation:**

- **Story Mode's first interaction** should produce a visible field population within the first 2-3 messages. Sam says his name and location → the plan header updates. Sam mentions his rent → the facilities cost field populates. The pattern teaches itself through immediate cause-and-effect. No tutorial overlay needed.
- **The AI advisor bridges the split screen** by explicitly referencing dashboard changes in conversation: "I've updated your monthly rent to $4,200. Look at how that affects your monthly operating costs on the right — they've gone from $12,300 to $14,100." This conversational bridging teaches Sam to watch the dashboard during the conversation.

**AI Extraction Confidence Threshold:**

Not all conversational extractions are equally certain. The AI must handle ambiguity gracefully using a **confidence threshold pattern:**

| AI Confidence | User Said | AI Behavior | Field Visual State |
|--------------|-----------|-------------|-------------------|
| **High confidence** | "My rent is $4,200 a month" | Populates field silently with accent-color pulse animation | Solid value, "AI" source badge |
| **Tentative** | "Rent is around four thousand" | Populates $4,000 as a tentative value AND asks a clarifying question: "I've estimated your rent at $4,000 — is that close, or did you have a more specific figure?" | **Dashed border** on the field + "~" prefix on the value, indicating "tentative, awaiting confirmation" |
| **Uncertain** | "Rent depends on the lease negotiation" | Does NOT populate a value; asks a guiding question: "That makes sense — do you have a ballpark range in mind? Even a rough estimate helps build the initial picture." | Field remains at brand default |

This three-tier approach prevents both trust-erosion failure modes:
- **Silent wrong values** (AI confident but wrong → field shows as populated, Sam doesn't notice the error) — mitigated by the tentative state for ambiguous inputs
- **Excessive clarifying questions** (AI asks about everything → conversation feels like a form in disguise) — mitigated by silent population for high-confidence extractions

### Experience Mechanics

**Mode Switcher Interaction Design:**

The mode switcher is a **segmented control** (Story | Normal | Expert) positioned at the top of the workspace, below the header and above the content area. It is always visible regardless of which mode is active.

- **Switching is instant** — no loading state, no confirmation dialog, no "are you sure?" The content below the segmented control restructures immediately.
- **The segmented control stays fixed** during transition — the Notion database view-switch feel. Only the content area changes.
- **Story → Normal:** The split screen collapses to a single-panel form view. All AI-populated values are visible in the form fields with their source badges. The conversation is preserved in Story Mode's state — when Sam returns, it picks up where he left off.
- **Story → Expert:** The split screen collapses to the grid view. All values (AI-populated, default, user-edited) appear in the grid rows.
- **Normal/Expert → Story:** The split screen re-opens. The conversation panel scrolls to where Sam left off. If financial inputs changed while in Normal/Expert mode, the AI advisor acknowledges them on return: "I see you've updated a few values while in Normal Mode — your break-even is now at month 15."
- **Background AI completion:** If the user switches away from Story Mode while an AI response is in progress, the response completes in the background. Extracted values populate into the shared financial state. When the user returns to Story Mode, the completed AI message is visible and any populated fields reflect their new values.

**Story Mode — Detailed Interaction Flow:**

**1. Initiation:**
- Sam logs in and sees his plan dashboard (or creates a new plan)
- Clicks "Start Planning" or selects Story Mode from the mode switcher
- The split screen opens: conversation panel (left, ~40%), financial dashboard (right, ~60%)
- The AI advisor introduces itself with a warm, brief greeting: "Hi Sam, I'm here to help you build your PostNet business plan. Let's start with the basics — tell me a bit about the location you're considering."

**2. Interaction Loop (repeats throughout the session):**
- Sam types a natural-language response ("I'm looking at a spot on Main Street, rent is about $4,200 a month, it's about 1,200 square feet")
- The AI parses the response, applies the **confidence threshold** (see above), and extracts structured values
- **Dashboard update animation:** Extracted fields highlight briefly (accent-color pulse for confident values, dashed-border for tentative), then settle with their new values. The summary cards recalculate. If a key metric changed (break-even, ROI), it animates the transition.
- The AI acknowledges the extraction and bridges to the dashboard: "Got it — I've set your monthly rent to $4,200 and your space at 1,200 sq ft. Your monthly operating costs are now $14,100. Let's talk about your revenue expectations next."
- **Field source badge:** The rent field now shows an "AI" badge indicating it was AI-populated. Sam can click the field to edit it directly if the AI got it wrong.
- If Sam edits a field directly on the dashboard (not through conversation), the AI acknowledges: "I see you adjusted the rent to $4,500 — that bumps your break-even out by about two weeks."

**3. Feedback:**
- **Live dashboard** is the primary feedback mechanism — every input immediately recalculates
- **Summary cards** at the top of the dashboard show 4-5 headline metrics that update in real time
- **Section completion** indicators show which categories of the plan have been addressed (Revenue, Operating Costs, Startup Costs, etc.)
- **Sentiment indicators** on key metrics provide context: "Break-even: Month 14 (typical PostNet range: 12-18 months)"
- **The AI advisor provides verbal feedback** that translates numbers into meaning: "At these numbers, you'd start making money by March 2027."

**4. Completion:**
- The AI advisor recognizes when all major sections have inputs and prompts scenario consideration: "Your base plan looks solid. Want to explore what happens if revenue comes in 15% higher or lower? Comparing scenarios is how you build real confidence for the bank meeting."
- Section completion indicator shows 100% (all categories have at least default or user-entered values)
- "Generate Package" button becomes prominent (was available but de-emphasized before completion)
- Document preview pane shows the plan taking professional shape

**Normal Mode — Interaction Flow:**

**1. Initiation:**
- Chris selects Normal Mode from the mode switcher (or it's her default)
- The workspace shows a single-panel layout with a **plan completeness dashboard** at the top: a visual summary showing each section's progress (e.g., "Revenue: 8/10 fields | Operating Costs: 3/12 fields | Startup Costs: Complete | Staffing: Not started"). This is Chris's re-entry point when she returns after a week — she can see at a glance exactly where she left off without opening any sections.
- Below the completeness dashboard: collapsible sections organized by financial category
- All fields pre-filled with brand defaults
- A suggested order indicator shows "Start here: Revenue" but all sections are accessible — the sequence is a recommendation, not a lock

**2. Interaction:**
- Chris opens a section (Revenue) and sees form fields with pre-filled brand defaults
- She edits values directly in form fields — standard input behavior
- **Metadata on demand:** On field focus, a subtle panel shows the brand default value, Item 7 range (if applicable), and source attribution. On blur, the metadata disappears and the field shows only its value.
- Summary cards at the top of the page update as she types (same cards as Story Mode dashboard)

**3. Feedback:**
- Summary cards provide real-time recalculation feedback (same as Story Mode)
- Section completion indicators track progress across categories — the plan completeness dashboard at the top updates as Chris works
- Inline contextual help is available (expand/collapse) for each section — not tooltips, but brief explanatory paragraphs about what this category covers and why it matters

**4. Completion:**
- Same as Story Mode: scenario comparison prompt, document preview, "Generate Package"

**Expert Mode — Interaction Flow:**

**1. Initiation:**
- Maria selects Expert Mode (or it's her default)
- The workspace shows a dense, spreadsheet-style grid built on TanStack Table with **category grouping**: rows are organized into collapsible groups (Revenue | Operating Costs | Startup Costs | Staffing). Maria can collapse categories she doesn't need and focus on the ones she's editing.
- Column headers: Category | Input Name | Value | Unit | Source | Brand Default
- All fields pre-filled with brand defaults
- **Virtualization** ensures smooth scrolling and rendering performance even with 60+ financial input rows

**2. Interaction:**
- Maria tabs through cells, editing values inline
- Each cell accepts keyboard input immediately — no click-to-edit, no modals
- Tab advances to the next editable cell; Shift+Tab goes back
- Enter confirms the current value and moves down
- Type-aware inputs: currency cells auto-format with $ and commas; percentage cells auto-append %; month cells accept integers only
- **Category group collapse/expand:** Maria can collapse entire categories with a single click or keyboard shortcut, reducing the grid to only the rows she cares about

**3. Feedback:**
- Summary row at the top of the grid (sticky) shows the 4-5 headline metrics, updating with every cell change
- Out-of-range values get a subtle "Gurple" background (advisory, not error) with a hover tooltip showing the typical range
- Source column updates as Maria edits: "Brand Default" → "Your Entry"

**4. Completion:**
- Same completion flow as other modes: scenario comparison, document preview, "Generate Package"
- Maria's completion is typically faster — she may skip scenario comparison entirely and go straight to document generation

### Party Mode Review Notes

The following improvements were incorporated via Party Mode review (Architect Winston, UX Sally, PM John, BA Mary, SM Bob):

| # | Improvement | Rationale |
|---|------------|-----------|
| 1 | AI extraction confidence threshold: confident = silent populate; tentative = dashed border + clarifying question; uncertain = no populate + guiding question | Prevents trust erosion from wrong values AND friction from excessive questions |
| 2 | Expert Mode grid requires category grouping (collapsible row groups) and virtualization for 60+ rows | Prevents Maria from scroll-hunting in a flat list; TanStack Table supports both |
| 3 | Story Mode coverage criterion added: 70%+ of financial inputs addressable through guided conversation in a single session | Sets design target for AI conversation completeness, not just extraction accuracy |
| 4 | Normal Mode plan completeness dashboard for session re-entry: top-level section progress visible before opening any section | Solves Chris's "where did I leave off?" problem on return visits |
| 5 | Mode switcher mechanics defined: segmented control, always visible, instant switch, background AI completion on mode-away | Fills the undefined mode-switching interaction design with concrete behavior |

## Visual Design Foundation

### Color System

**Three-Layer Color Architecture (from Katalyst Brand Guidelines):**

The Katalyst color system uses a three-layer governance model that maps directly to the Growth Planner's white-label theming needs:

**Layer 1: Semantic Core (meaning-reserved)**

| Token | Hex | Role in Growth Planner |
|-------|-----|----------------------|
| **Katalyst Green** | `#78BF26` | Primary brand + success states. In branded deployments, this is overridden by the brand's accent color via `--primary`. The `--katalyst-brand` escape hatch preserves this green for "Powered by Katalyst" elements. |
| **Standard Red** | `#EF4444` | Actual errors only — missing required fields, system failures, validation errors. NEVER used for advisory guardrails or business judgment calls (those use the "Gurple"). |
| **Warning Yellow** | `#E1D660` | Caution states — approaching Item 7 boundaries, pending save states. Used sparingly. |

**Layer 2: Functional Neutrals (structure and hierarchy)**

| Token | Hex | Role | Text Hierarchy Level |
|-------|-----|------|---------------------|
| **Black** | `#3D3936` | Headlines, section headers, KPI values | Primary — most important text |
| **Charcoal** | `#50534C` | Body text, labels, form content | Secondary — supporting information |
| **Gauntlet** | `#8C898C` | Muted text, placeholders, disabled states, timestamps | Tertiary — least important text |
| **Gray** | `#D0D1DB` | Borders, dividers, input borders | Structural — not text |
| **Gray Light** | `#F5F6F8` | Page backgrounds, card backgrounds | Surface — not text |
| **White** | `#FFFFFF` | Elevated surfaces (cards in branded sidebars, modals, inputs) | Surface — not text |

The three text hierarchy levels (Black → Charcoal → Gauntlet) implement the "three levels of text color" design principle, mapping to Default → Secondary → Tertiary.

**Layer 3: Categorical Accents (differentiation without inherent meaning)**

| Token | Hex | Growth Planner Usage |
|-------|-----|---------------------|
| **Mystical ("Gurple")** | `#A9A2AA` | The signature advisory color — used for ROI Threshold Guardian suggestions, Item 7 range indicators, AI confidence markers, informational panels, "Did you know?" callouts. This is the "advisory, not error" alternative to red. |
| **Edamame Sage** | `#96A487` | Target/goal states — scenario comparison positive outcomes, break-even achieved indicators |
| **Basque** | `#676F13` | Historical/comparison data — Location #1 actuals when comparing to Location #2 projections |
| **Wheat** | `#DDCDAE` | People/personal — account manager references, franchisee attribution |
| **Zeus** | `#A6A091` | Neutral category — default chart series, uncategorized items |

**Katalyst → shadcn/ui Token Translation Table:**

This table provides the definitive mapping between Katalyst brand tokens and the shadcn/ui CSS custom property system. This eliminates guesswork during implementation:

| shadcn/ui Token | Katalyst Token | Hex Value | Rationale |
|----------------|---------------|-----------|-----------|
| `--background` | Gray Light | `#F5F6F8` | Page-level background; the slightly warm gray reduces eye strain |
| `--foreground` | Black | `#3D3936` | Primary text color for maximum readability |
| `--card` | White | `#FFFFFF` | Cards elevate from the Gray Light background via color contrast (Method B containment) |
| `--card-foreground` | Black | `#3D3936` | Card text matches page text hierarchy |
| `--primary` | Katalyst Green | `#78BF26` | Brand primary; overridden per brand deployment |
| `--primary-foreground` | White | `#FFFFFF` | Text on primary-colored buttons/elements |
| `--secondary` | Gray Light | `#F5F6F8` | Secondary button backgrounds |
| `--secondary-foreground` | Charcoal | `#50534C` | Text on secondary buttons |
| `--muted` | Gray Light | `#F5F6F8` | Muted backgrounds for de-emphasized content |
| `--muted-foreground` | Gauntlet | `#8C898C` | Muted/tertiary text |
| `--accent` | Gray Light | `#F5F6F8` | Accent backgrounds (hover states, selected items) |
| `--accent-foreground` | Black | `#3D3936` | Text on accent backgrounds |
| `--destructive` | Standard Red | `#EF4444` | Error/destructive actions only |
| `--destructive-foreground` | White | `#FFFFFF` | Text on destructive buttons |
| `--border` | Gray | `#D0D1DB` | All borders and dividers |
| `--input` | Gray | `#D0D1DB` | Input borders |
| `--ring` | Katalyst Green | `#78BF26` | Focus ring color; follows brand primary |
| `--sidebar-background` | White | `#FFFFFF` | Sidebar surface (elevated from page background) |
| `--sidebar-foreground` | Charcoal | `#50534C` | Sidebar text |
| `--sidebar-accent` | Gray Light | `#F5F6F8` | Sidebar hover/selected state backgrounds |
| `--katalyst-brand` | Katalyst Green | `#78BF26` | **Escape hatch** — always Katalyst Green, never overridden by brand. Used exclusively for "Powered by Katalyst" badge. |
| `--info` | Mystical (Gurple) | `#A9A2AA` | Advisory/informational panels and indicators |

**Color Governance Rules for Growth Planner:**

1. **3-Category Rule:** No more than 3 categorical accent colors in any single view. The financial dashboard should use Green (or brand primary) + Gurple + one categorical. Scenario comparison may use up to 3 scenario-specific colors.
2. **Green as accent, not surface.** Katalyst Green (or brand primary) appears on buttons, links, focus rings, and progress indicators — never as large surface backgrounds. Reserve the single most prominent CTA per screen for the green/primary button; other buttons use Charcoal (dark) or outline variants.
3. **Red is sacred.** Red means something is broken or requires immediate attention. Advisory suggestions ("your growth rate is higher than typical") use the Gurple, never red.
4. **Brand override scope:** Only `--primary`, `--primary-foreground`, and `--ring` are overridden per brand. All other tokens — neutrals, semantic red/yellow, categorical accents, the Gurple — are Katalyst constants across all brand deployments.

### Typography System

**Font Families (Katalyst constants, never overridden per brand):**

| Usage | Font | Weight Range | Purpose |
|-------|------|-------------|---------|
| **Headings** | Montserrat | 600-700 (Semibold-Bold) | Page titles, section headers, card titles, metric labels. Montserrat's geometric personality gives Katalyst its modern, confident feel. |
| **Body** | Roboto | 400-500 (Regular-Medium) | Form labels, body text, conversation messages, descriptions. Roboto's neutral readability handles long-form financial explanations without fatigue. |
| **Financial figures** | Roboto Mono | 400-500 | All numeric financial values — currency amounts, percentages, month counts. Monospace ensures tabular alignment in Expert Mode and consistent digit width in summary cards. |

**Type Scale:**

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| **4xl** | 2.25rem (36px) | 1.1 | KPI hero values (Total Investment, ROI Range) |
| **3xl** | 1.875rem (30px) | 1.2 | Hero metrics, page-level financial summaries |
| **2xl** | 1.5rem (24px) | 1.3 | Page titles ("Sam's PostNet Plan") |
| **xl** | 1.25rem (20px) | 1.4 | Modal headers, section titles |
| **lg** | 1.125rem (18px) | 1.5 | Section headers within forms, card titles |
| **base** | 1rem (16px) | 1.5 | Body text, form labels, conversation messages |
| **sm** | 0.875rem (14px) | 1.5 | Secondary text, field descriptions, metadata |
| **xs** | 0.75rem (12px) | 1.5 | Captions, source attribution badges, timestamps, "All changes saved" indicator |

**Financial Figure Formatting (via `<FinancialValue>` primitive):**

| Type | Format | Font | Example |
|------|--------|------|---------|
| Currency | $X,XXX.XX | Roboto Mono | $4,200.00 |
| Percentage | X.X% | Roboto Mono | 12.5% |
| Months/integers | X | Roboto Mono | 14 |
| Negative currency | ($X,XXX.XX) | Roboto Mono, red text | ($2,100.00) |
| Large currency | $X.XM or $XXK | Roboto Mono | $1.2M, $450K |

### Spacing & Layout Foundation

**Spacing Scale (based on 4px base unit):**

| Level | Value | Usage |
|-------|-------|-------|
| **xs** | 4px (0.25rem) | Icon-to-text gaps, badge padding |
| **sm** | 8px (0.5rem) | Input internal padding, tight element groups |
| **md** | 16px (1rem) | Card internal padding, form field spacing, standard gaps |
| **lg** | 24px (1.5rem) | Section spacing, card padding (primary) |
| **xl** | 32px (2rem) | Page-level section gaps |
| **2xl** | 48px (3rem) | Major layout divisions |

**Mode-Specific Density Levels:**

The spacing scale is consistent across all modes, but each mode operates at a different density level within the scale:

| Mode | Primary Spacing Level | Cell/Field Padding | Section Gaps | Rationale |
|------|----------------------|-------------------|-------------|-----------|
| **Expert Mode** | sm/md | 8px cell padding | 16px between groups | Maria needs maximum data density; 60+ rows must fit without excessive scrolling |
| **Normal Mode** | md/lg | 16px field padding | 24px between sections | Chris needs breathing room for form comprehension without feeling sparse |
| **Story Mode** | lg/xl | 24px message padding | 32px between conversation segments | Sam needs conversational spaciousness; the chat interface should feel unhurried |

The principle: **the spacing SCALE is constant; modes use different levels from the scale.** This ensures visual coherence when switching modes — the rhythm changes but the proportions remain harmonious.

**Layout Principles:**

1. **Information density adapts per mode via scale level selection.** Expert Mode uses sm/md from the scale; Normal uses md/lg; Story uses lg/xl. The proportional relationships between elements remain consistent across modes.

2. **Cards are the primary containment pattern.** Financial summary cards, input group sections, scenario comparison panels — all use the Card component with consistent padding, 2px borders, and the Katalyst border radius scale. Cards sit on `#F5F6F8` backgrounds with `#FFFFFF` card surfaces, providing subtle elevation through background color contrast (Method B containment).

3. **The sidebar is the navigation anchor.** At full width: 16-20rem with brand logo, navigation items, plan list, and "Powered by Katalyst" footer. At collapsed: 44px icon-only. The sidebar background uses White (`#FFFFFF`) to elevate from the Gray Light page background.

4. **The header is minimal.** Sidebar trigger, mode switcher (segmented control), auto-save indicator, and account menu. No large headers or hero sections within the planning workspace — every vertical pixel is valuable for financial data.

5. **Split-screen Story Mode uses `react-resizable-panels`** (or equivalent). Conversation panel minimum 360px, dashboard minimum 480px. The resize handle is subtle (2px, `#D0D1DB` color) and shows a grab cursor on hover.

**Shape System:**

**Note on border radius:** The Katalyst brand uses a larger radius scale than the generic `rounded-md` default. This is an intentional brand decision — the rounded, modern card feel is part of the Katalyst visual identity. The Katalyst brand radius scale takes precedence over generic development defaults for this project.

| Element | Border Radius | Border Width | Notes |
|---------|--------------|-------------|-------|
| Cards | 1rem (16px) / `rounded-2xl` | 2px | Consistent across all card types; the Katalyst signature shape |
| Buttons | 0.75rem (12px) / `rounded-xl` | 1px (outline variant) | Uses shadcn/ui size variants, no custom sizing |
| Inputs | 0.75rem (12px) / `rounded-xl` | 2px | Focus ring: 2px, primary color at 50% opacity |
| Badges | 0.5rem (8px) / `rounded-lg` | None | Source attribution, field type indicators |
| Modals | 1.25rem (20px) / `rounded-2xl` | 2px | Elevated with shadow-xl |
| Segmented controls | 0.75rem (12px) / `rounded-xl` | None | Container and items use same radius |

**Shadow System (used sparingly):**

| Token | Value | Usage |
|-------|-------|-------|
| **sm** | `0 1px 2px rgba(0,0,0,0.05)` | Subtle card elevation |
| **default** | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | Standard card shadow (optional — background color contrast may be sufficient) |
| **lg** | `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)` | Dropdowns, popovers |
| **xl** | `0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)` | Modals, floating elements |

Shadows are used for floating/overlay elements (modals, dropdowns, toasts) — not for standard cards. Card distinction comes from background color contrast (`#FFFFFF` card on `#F5F6F8` page), consistent with the Method B containment strategy.

### Data Visualization

**Charting Library:** Recharts (React-native, composable, already used in the Katalyst Performance Platform design theme).

**Chart Inventory for Financial Dashboard:**

| Chart Type | Purpose | Primary Color | Secondary Colors | Location |
|-----------|---------|---------------|-----------------|----------|
| **Break-even timeline** | Area/line chart showing cumulative cash flow crossing from negative to positive territory. This is the emotionally most important chart — the moment the line crosses zero is where Sam sees "I'll make money." | Katalyst Green (or brand primary) for positive territory fill; Standard Red at 20% opacity for negative territory | Gray (#D0D1DB) for the zero line, Charcoal for axis labels | Financial dashboard, prominent position |
| **Revenue vs. expenses** | Monthly grouped bar chart showing revenue and total expenses over 36 months. Reveals the operating picture at a glance. | Katalyst Green (or brand primary) for revenue bars | Charcoal (#50534C) for expense bars, Gray for grid lines | Financial dashboard, below break-even |
| **Scenario comparison overlay** | Line chart overlaying Good/Better/Best scenarios on the same axes. The visual proof that "even the conservative case works." | Three lines using Edamame (#96A487) for conservative, Katalyst Green for base, Basque (#676F13) for optimistic | Gray for grid, Charcoal for axis labels | Scenario comparison view |
| **Sparklines** | Tiny inline charts in summary cards showing trend direction (up/down/flat) for key metrics. No axes, no labels — just the shape. | Katalyst Green (or brand primary) for positive trend; Standard Red for negative trend | None — single-color lines | Summary cards (embedded) |

**Chart Styling Constants (Katalyst brand):**

| Element | Value |
|---------|-------|
| Grid lines | `#D0D1DB` at 30% opacity |
| Axis lines | `#D0D1DB` |
| Axis labels | Roboto, `#50534C` (Charcoal), 12px |
| Tooltip background | `#3D3936` (Black) |
| Tooltip text | `#FFFFFF` (White), Roboto, 14px |
| Tooltip financial values | Roboto Mono, uses `<FinancialValue>` formatting |
| Chart area padding | 16px (md spacing level) |
| Animation | Subtle 300ms ease-out on data transitions; no bounce effects |

### Brand Voice in UI Copy

**Voice:** Vibrant, Quick-witted, Authentic (from Katalyst brand guidelines).

The Growth Planner adapts the Katalyst brand voice for financial planning context — maintaining warmth and encouragement while handling sensitive financial information with appropriate seriousness.

**Empty State Patterns:**

| Context | Copy Pattern | Example |
|---------|-------------|---------|
| No plans yet | Warm invitation to start | "Ready to plan your next location? Let's build something great." |
| No scenarios created | Encouraging nudge | "One plan is good. Comparing scenarios is how you build real confidence." |
| No actuals entered (post-opening) | Motivating return | "Your plan is ready for real numbers. Update your estimates as you go — that's how the plan stays useful." |
| Empty search results | Helpful redirect | "Nothing matched. Try different filters, or start a new plan." |

**Error Message Patterns:**

| Context | Copy Pattern | Example |
|---------|-------------|---------|
| Save failure | Reassuring + actionable | "Your changes didn't save just now. Don't worry — we'll try again in a moment. Your recent work is safe locally." |
| AI extraction error | Casual correction | "I didn't quite catch that. Could you tell me the specific number for [field name]?" |
| Network error | Calm + informative | "We lost the connection briefly. Everything saved up to this point is safe. We'll reconnect automatically." |
| Validation error | Specific + helpful | "Monthly rent needs to be a dollar amount. Something like $4,200." |

**Tone Boundaries for Financial Context:**

| Katalyst IS | Katalyst is SOMETIMES | Katalyst is NEVER |
|-------------|----------------------|-------------------|
| Encouraging | Challenging (when numbers don't work) | Judgmental about financial choices |
| Clear | Serious (when discussing real money) | Dismissive of user's situation |
| Warm | Direct (when advisory guardrails trigger) | Condescending about financial literacy |

### Accessibility Considerations

**Color Contrast (WCAG 2.1 AA minimum):**

| Text Level | Color | On Background | Contrast Ratio | Status |
|-----------|-------|---------------|---------------|--------|
| Primary (Black) | `#3D3936` | `#FFFFFF` | ~12:1 | Pass AAA |
| Primary (Black) | `#3D3936` | `#F5F6F8` | ~10:1 | Pass AAA |
| Secondary (Charcoal) | `#50534C` | `#FFFFFF` | ~7.5:1 | Pass AAA |
| Tertiary (Gauntlet) | `#8C898C` | `#FFFFFF` | ~3.5:1 | Pass AA (large text) |
| Katalyst Green on White | `#78BF26` | `#FFFFFF` | ~3.7:1 | Pass AA (large text only) |

**Accessibility implications for the Growth Planner:**

- **Gurple info panels:** Use `bg-kat-mystical/20` with `text-kat-charcoal` body text (not `text-kat-mystical`) to maintain readable contrast. The Gurple color is for panel borders and headings, not for body text.
- **Katalyst Green as text:** Green text on white backgrounds passes only for large text (18px+). For smaller text links or labels, use the green for icons and underline decoration, with Charcoal for the text itself, or use green only on hover.
- **Expert Mode grid:** The dense data grid must maintain readable contrast in all cells. Row-level Gurple background for out-of-range values uses 10-20% opacity to ensure text remains readable.
- **Focus indicators:** All interactive elements must show visible focus rings (2px, primary color at 50% opacity) for keyboard navigation, especially critical in Expert Mode's tab-through flow.
- **Tentative field state:** The dashed border for AI tentative values must be distinguishable from standard solid borders by more than just border-style — also use a subtle background tint to ensure the state is perceivable.

**Keyboard Navigation:**

- All form controls support Tab/Shift+Tab navigation
- Expert Mode grid supports Arrow key navigation within cells
- Mode switcher accessible via keyboard
- Focus trap in modals and dialogs (Radix UI handles this)
- Skip-to-content link for screen readers

### Party Mode Review Notes

The following improvements were incorporated via Party Mode review (Architect Winston, UX Sally, PM John, BA Mary, SM Bob):

| # | Improvement | Rationale |
|---|------------|-----------|
| 1 | Katalyst → shadcn/ui token translation table added with definitive mappings for all semantic tokens | Eliminates developer guesswork; `--background` = Gray Light, `--card` = White, etc. |
| 2 | Border radius conflict resolved: Katalyst brand radii (rounded-2xl cards, rounded-xl buttons) take precedence over generic rounded-md default | The rounded modern feel IS the Katalyst brand identity |
| 3 | Chart inventory added: break-even timeline, revenue vs. expenses, scenario comparison overlay, sparklines — with color specs and Recharts library | Fills data visualization gap with specific, implementable chart specifications |
| 4 | Brand voice guidelines incorporated: empty state copy patterns, error message patterns, tone boundaries for financial context | Ensures verbal UX matches visual emotional design |
| 5 | Spacing principle refined: same scale, different density levels per mode (Expert=sm/md, Normal=md/lg, Story=lg/xl) | Prevents impractical spacing in 60-row Expert Mode grid |
