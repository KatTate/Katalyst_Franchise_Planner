---
stepsCompleted: [1, 2, 3, 4, 5, 6]
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
