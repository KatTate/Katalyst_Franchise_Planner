---
stepsCompleted: [1, 2, 3]
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
