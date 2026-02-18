---
status: SUPERSEDED
superseded_by: _bmad-output/planning-artifacts/ux-design-specification-consolidated.md
superseded_date: 2026-02-18
superseded_reason: "Consolidated with ux-design-specification.md into single authoritative UX spec. All content preserved in consolidated document with v3 architecture taking precedence."
---

# UX Specification: Financial Statement Experience

**Author:** Sally (UX Designer)
**Date:** 2026-02-16
**Status:** SUPERSEDED — See ux-design-specification-consolidated.md
**Revision:** v3 — Eliminates mode switcher; establishes My Plan / Reports two-door architecture
**Foundation:** John's Six Points from Party Mode Retrospective Review
**Input Documents:**
- Brainstorming Session 2026-02-08 (54 ideas, core design principles)
- Brainstorming Session 2026-02-15 (30 gaps, three-layer problem)
- UX Design Specification 2026-02-08 (experience principles, emotional arcs)
- Sprint Change Proposal 2026-02-15 (scope, FRs, engine extension)
- Epic 1-4 Retrospectives (pattern: backend-first → UX rework)
- Sally's Self-Critique 2026-02-16 (9 issues identified)
- v3 Architecture Review 2026-02-16 (mode switcher elimination, "Quick Entry IS Reports" insight)

---

## The Problem This Spec Solves

Four retrospectives reveal the same pattern: we build data and computation first, then discover mid-epic that the user experience was never designed. The Sprint Change Proposal defines WHAT the financial statement views must contain (line items, columns, calculations). This spec defines HOW users experience that content — the navigation, hierarchy, interaction, interpretation, and emotional design that turns data tables into a planning tool.

Without this spec, Epic 5 will produce seven flat 60-column tables that technically match the spreadsheet but fail every design principle from both brainstorming sessions.

---

## Six Foundation Points

These six points, identified during the Party Mode retrospective review, are the mandatory requirements for this spec. Every design decision traces back to one or more of these:

| # | Foundation Point | Source |
|---|-----------------|--------|
| F1 | Progressive disclosure — annual summary first, drill to monthly detail | Brainstorming Feb 8: "Layered Complexity" principle, Idea #45 |
| F2 | Input-output integration — Quick Entry IS the financial statement, not a bolt-on | Brainstorming Feb 15: Gap #21 |
| F3 | Scenario comparison as first-class feature — the conviction moment | UX Spec: "secondary core action"; Brainstorming Feb 8: Idea #12 |
| F4 | Dynamic interpretation — the "so what" layer for non-experts | Brainstorming Feb 8: Idea #50, #51; UX Spec: Principle #2 |
| F5 | ROI Threshold Guardian — persistent feedback on every decision | Brainstorming Feb 8: Idea #51 |
| F6 | Document preview visible during planning — progressive pride | UX Spec: Sam's emotional arc, "live document preview" |

---

## Part 1: Navigation Model — The Two-Door Architecture

### v3 Core Insight: There Are No Modes

The v2 spec retained a mode switcher (Planning Assistant | Forms | Quick Entry) inherited from Epic 4. This created cognitive overload: three "modes" that confused every persona. The v3 architecture eliminates modes entirely and replaces them with two sidebar destinations that serve as two doors into the same underlying plan data.

**The fundamental principle: Quick Entry IS Reports.**

Maria doesn't need a separate input grid or a "Quick Entry mode." She opens Reports, clicks the P&L tab, and edits input cells inline. The financial statements ARE her workspace. Sam doesn't need to understand modes — he opens My Plan and fills in structured forms. Both users are editing the same plan data through different interaction surfaces.

### Application-Level Navigation

The sidebar is the single, persistent navigation structure. There is no mode switcher, no dashboard toggle, no separate "Quick Entry" destination.

```
┌─ Sidebar ──────────────────────────┐
│                                      │
│  [Brand Logo / Katalyst]             │
│                                      │
│  ── MY LOCATIONS ──                  │
│  All Plans (portfolio)               │
│                                      │
│  ── [ACTIVE PLAN NAME] ──           │
│  My Plan                             │
│  Reports                             │
│  Scenarios                           │
│  Settings                            │
│                                      │
│  ── HELP ──                          │
│  Talk to [Manager Name]              │
│                                      │
└──────────────────────────────────────┘
```

**Sidebar items explained:**

| Item | What It Is | Primary Persona |
|------|-----------|-----------------|
| All Plans | Portfolio view — list of franchise locations/plans. Entry point for Chris (multi-unit). For Sam (single plan), this may show just one plan with a prompt to start. | Chris |
| My Plan | Structured form-based input workspace. Summary metrics at top, collapsible input sections below. Labels, help text, brand default indicators, AI planning assistant available as slide-in panel or floating button. | Sam, Chris |
| Reports | Tabbed financial statements (Summary, P&L, Balance Sheet, Cash Flow, ROIC, Valuation, Audit). Input cells are editable inline — this IS the power-user input surface. | Maria (primary workspace), Sam & Chris (review output) |
| Scenarios | Good/Better/Best scenario comparison. Pulls from the same engine data. | All |
| Settings | Plan-level settings — plan name, brand selection, projection period, etc. | All |
| Talk to [Manager Name] | AI planning assistant in a conversational format. Contextual to the active plan. | Sam |

**Critical design rules:**

1. **No mode switcher exists anywhere in the UI.** There is no toggle, no segmented control, no radio group that switches between "Planning Assistant," "Forms," and "Quick Entry." These concepts were design-time persona lenses, not user-facing features.

2. **My Plan and Reports are NOT modes — they are destinations.** They appear as sidebar navigation items, just like "Settings" or "Scenarios." The user clicks one to go there. They click the other to go there. No "switching modes."

3. **Data flows both directions.** If Maria edits Monthly AUV inline in the P&L (within Reports), the value in My Plan's Revenue section reflects it. If Sam enters his rent in My Plan's Facilities section, the P&L in Reports updates. One plan, two interaction surfaces.

4. **The AI planning assistant is a feature, not a destination.** It's available from within My Plan as a slide-in panel (triggered by a floating button or header icon). It is NOT a separate sidebar item that Sam has to navigate to. It's contextual help available where Sam is already working. The "Talk to [Manager Name]" sidebar item in the Help section opens the same assistant but from a conversational starting point — useful for first-time users who want guidance before diving into forms.

### How Users Enter the Financial Statements (Reports)

Reports is accessible via three paths:

1. **Sidebar click:** Clicking "Reports" opens the Financial Statements container with the Summary tab active. This is the primary entry point.

2. **My Plan deep links:** The Impact Strip at the bottom of My Plan (see below) includes links like "View Full P&L →" that navigate directly to the relevant Reports tab. Summary metric cards in My Plan also link to their corresponding statement sections.

3. **Portfolio drill-down:** From All Plans, clicking a plan opens it. The default landing is My Plan for Sam/Chris, but a "View Reports" link on each plan card goes directly to Reports.

### My Plan — Impact Strip Pattern

My Plan retains structured form-based input sections as the primary editing surface. A persistent **Impact Strip** appears at the bottom, showing the 3-4 key metrics most affected by the section the user is currently editing:

```
┌─ My Plan ────────────────────────────────────────────────────┐
│                                                               │
│  [Summary Metrics Bar — headline numbers]                     │
│                                                               │
│  [Revenue Section]                                            │
│  Monthly Revenue: $30,000                                     │
│  Revenue Growth Rate: 10%                                     │
│  ...                                                          │
│                                                               │
│  [+ Other collapsible sections: COGS, Labor, Facilities...]   │
│                                                               │
├─ Impact Strip (sticky bottom) ───────────────────────────────┤
│  Pre-Tax Income: $42,000 (+$3,200)  │  Break-even: Mo 14     │
│  Gross Margin: 70.0%                │  5yr ROI: 127%          │
│  ↳ View Full P&L →                                           │
└───────────────────────────────────────────────────────────────┘
```

Impact Strip behavior:
- **Context-sensitive:** The metrics shown change based on which form section is active. Revenue section shows P&L impact. Financing section shows balance sheet and cash flow impact. Startup costs section shows investment totals and ROI impact.
- **Delta indicators:** When the user changes a value, affected metrics show the change amount ("+$3,200") in a subtle highlight for 3 seconds, then the highlight fades but the new value remains.
- **Deep link:** The "View Full P&L" (or "View Full Balance Sheet", etc.) link navigates to the relevant Reports tab. This is the bridge from form editing to full-statement review — Chris clicks to see the full picture, then clicks "My Plan" in the sidebar to return.
- **Guardian integration:** The Impact Strip includes a miniature Guardian indicator — three colored dots with icons (break-even, ROI, cash) that change in real time as the user edits. If an edit pushes a Guardian metric from green to amber, the dot animates briefly to draw attention.

### Reports — Financial Statements with Inline Editing

Reports contains the tabbed Financial Statements container. The tabs are:

```
[Summary] [P&L] [Balance Sheet] [Cash Flow] [ROIC] [Valuation] [Audit]
```

**Tab behavior:**

- Tabs are always visible across the top of the Reports content area.
- Active tab has a primary-color underline indicator.
- Tab switching is instant — no loading state. All statement data comes from the same engine computation that's already cached.
- Each tab remembers its scroll position and drill-down state within the session.
- On mobile/narrow viewports (below 1024px), tabs convert to a dropdown selector.
- Default landing tab is **Summary** for all users.

**Inline editing is always available — not gated by a mode.**

Every financial statement tab renders input cells as editable and computed cells as read-only. There is no toggle to "enable editing." The visual distinction between input and computed cells (see Part 3) makes it clear which cells accept input. Maria recognizes and uses this immediately. Sam may never notice the editable cells in Reports because he enters values through My Plan — and that's fine. Both paths write to the same underlying data.

**Why not gate editing behind a toggle?** Because adding a toggle reintroduces modes. "View mode" vs. "Edit mode" is the same cognitive split we're eliminating. Input cells are always editable. Computed cells are always read-only. The visual treatment (dashed border, pencil icon on hover) is sufficient to distinguish them. Sam won't accidentally edit a cell in Reports because input cells don't look like buttons — they look like subtle, tinted data cells that become editable on click. Discovery is progressive: Sam might click one out of curiosity, see it's editable, and realize he can work here too. That's a feature, not a bug.

**[F1] [F2]**

---

## Part 2: Information Hierarchy — Progressive Disclosure

### The Layered Complexity Pattern

**Design principle (from Brainstorming Feb 8):** "Financial modeling IS complex because it should be. The tool provides a high-level summary layer that lets franchisees click into full detail. Summary for confidence, detail for due diligence, education for empowerment."

Every financial statement view follows a three-layer information hierarchy:

#### Layer 1: Annual Summary (Default View)

What the user sees when they first open any statement tab:

- **5 annual columns** (Year 1 through Year 5) — not 60 monthly columns.
- **Section headers** with expandable/collapsible row groups (Revenue, COGS, Operating Expenses, etc.).
- **Key metric callouts** at the top of each statement — the 2-3 numbers that answer "so what?" for this statement.
- **Trend indicators** — small directional arrows or sparklines showing the trajectory across years.

This is the view that Sam (first-time franchisee) uses. It answers "is my business going to work?" without drowning him in monthly detail.

#### Layer 2: Quarterly Drill-Down

When the user clicks on a year column header (or an expand control):

- The selected year expands to show **4 quarterly columns** (Q1-Q4) plus the annual total.
- Other years remain collapsed as annual totals.
- Section groups remain expandable/collapsible independently.
- A breadcrumb or visual indicator shows: "Year 2 → Quarterly View"

This is the view Chris uses. She wants to see seasonal patterns and quarter-over-quarter trends without full monthly granularity.

#### Layer 3: Monthly Detail

When the user clicks on a quarter column header:

- The selected quarter expands to show **3 monthly columns** (e.g., Month 4, Month 5, Month 6 for Q2 Year 1).
- The quarter total and annual total remain visible as reference columns.
- A breadcrumb shows: "Year 2 → Q2 → Monthly View"

This is the view Maria uses and the view that matches the reference spreadsheet's 60-column structure. It's also the view that appears in the PDF output.

**Drill-down interaction:**

- Click on a year column header → expand to quarters
- Click on a quarter column header → expand to months
- Click the breadcrumb or collapse control → return to the higher level
- "Expand All" / "Collapse All" controls available for power users
- Keyboard: Enter on a focused column header drills down; Escape goes up a level

**Column layout with drill-down:**

| State | Columns Visible |
|-------|----------------|
| Default (annual) | Y1, Y2, Y3, Y4, Y5 |
| Year 2 expanded to quarterly | Y1, Q1-Y2, Q2-Y2, Q3-Y2, Q4-Y2, Y2 Total, Y3, Y4, Y5 |
| Year 2 Q2 expanded to monthly | Y1, Q1-Y2, M4, M5, M6, Q2 Total, Q3-Y2, Q4-Y2, Y2 Total, Y3, Y4, Y5 |

**Sticky elements:**

- Row labels (leftmost column) are sticky horizontally — always visible as the user scrolls through columns.
- Section headers are sticky vertically — always visible as the user scrolls through rows.
- The "key metrics callout" bar at the top of each statement is sticky — always visible.
- Sticky elements have a high z-index and a subtle shadow to indicate they're floating above scrollable content.

**[F1]**

---

## Part 3: Input-Output Integration

### Reports ARE the Interactive Financial Statements

**Design principle (from Brainstorming Feb 15, Gap #21):** "Jordan works inside P&L / Balance Sheet / Cash Flow as interactive documents with editable input cells and live-computed output cells."

**v3 clarification:** This is not gated by a "mode." Reports always renders financial statements with input cells editable and computed cells read-only. There is no switch to flip. Maria opens Reports and starts typing. Sam opens Reports to review his projections, and if he clicks an input cell, he can edit it there too. The interaction surface is always available — personas differ in whether they use it as their primary workspace or as an occasional review tool.

#### How It Works

Every cell in a financial statement table is one of two types:

1. **Input cells** — values that the user controls (revenue growth rate, COGS %, rent, staffing count, etc.). These are editable inline.
2. **Computed cells** — values calculated by the engine (gross profit, EBITDA, net income, total assets, etc.). These are read-only.

**Visual distinction between input and computed cells:**

| Cell Type | Background | Text Style | Border | Icon | Interaction |
|-----------|-----------|------------|--------|------|-------------|
| Input (editable) | Subtle tinted background (primary/5) | Regular weight | Thin dashed left border (primary/20) | Small pencil icon on hover | Click to edit inline; Tab navigates between input cells |
| Computed (read-only) | Standard background | Medium weight | None | None | Hover shows tooltip with formula/derivation; not editable |
| Section header/total | Slightly elevated background | Bold weight | None | None | Not editable; shows sum of child rows |

**Accessibility note (Critique Issue #7):** The input/computed distinction MUST NOT rely solely on background color. The dashed left border and the pencil icon on hover provide two additional non-color indicators. Screen readers announce input cells with `role="gridcell"` and `aria-readonly="false"`; computed cells use `aria-readonly="true"`. See Part 15 (Accessibility) for full details.

**Inline editing behavior:**

- Click on an input cell → cell enters edit mode (border highlight, value becomes editable text)
- Type the new value → engine recalculates immediately (optimistic UI)
- Tab → moves to the next input cell in the same column (skipping computed cells)
- Shift+Tab → moves to the previous input cell
- Enter → confirms and moves down to the next input cell in the same row group
- Escape → cancels edit, restores previous value
- All auto-formatting rules from Epic 4 apply (currency, percentage, integer formatting on blur)

**The P&L as an interactive document (example):**

```
P&L Statement — Year 1 (Annual View)
─────────────────────────────────────────
                              Y1        Y2        Y3
Revenue
  Monthly Revenue         [edit]    [edit]    [edit]     ← Input cells
  Annual Revenue          $360,000  $396,000  $435,600   ← Computed

Cost of Goods Sold
  COGS %                  [edit]    [edit]    [edit]     ← Input cell
  COGS $                  $108,000  $118,800  $130,680   ← Computed

Gross Profit              $252,000  $277,200  $304,920   ← Computed
Gross Margin              70.0%     70.0%     70.0%      ← Computed

Operating Expenses
  Direct Labor %          [edit]    [edit]    [edit]     ← Input cell
  Direct Labor $          $90,000   $99,000   $108,900   ← Computed
  Management Salaries     [edit]    [edit]    [edit]     ← Input cell
  Facilities              [edit]    [edit]    [edit]     ← Input cell
  ...
```

Maria tabs through the `[edit]` cells at spreadsheet speed, and every computed cell updates as she goes. She's not "viewing a P&L and editing inputs somewhere else" — she's editing INSIDE the P&L.

Sam, meanwhile, entered the same Monthly Revenue value through My Plan's Revenue form section. Both surfaces wrote to the same underlying plan data. If Sam later visits Reports out of curiosity and clicks the Monthly Revenue cell, he sees his value — and can change it right there if he wants.

### Two Doors, One Room

This table summarizes how the same data is accessed through both navigation destinations:

| Plan Input | My Plan Surface | Reports Surface |
|-----------|----------------|-----------------|
| Monthly Revenue | Text field in Revenue form section, with label, help text, brand default indicator | Editable cell in P&L → Revenue → Monthly Revenue row |
| COGS % | Text field in COGS form section | Editable cell in P&L → Cost of Goods Sold → COGS % row |
| AR Days | Text field in Working Capital form section | Editable cell in Balance Sheet → Current Assets section |
| EBITDA Multiple | Text field in Valuation form section | Editable cell in Valuation → EBITDA Basis section |

**Editing in either place updates the same value.** There is no sync delay, no "save and refresh." The engine recalculates and both surfaces reflect the change because they read from the same plan state.

### Pre-Epic-7 Per-Year Behavior (Critique Issue #8)

Until Epic 7 delivers the PlanFinancialInputs restructuring to per-year arrays, all years broadcast the same value. This creates a UX tension: the annual view shows 5 year columns, but editing Y2 changes Y1-Y5 simultaneously.

**Design decision: Linked columns with visual indicator.**

Before Epic 7:
- All 5 year columns are displayed (not hidden — that would make the views unusable).
- A small **link icon** appears in the column header row, spanning all 5 year columns, with a tooltip: "All years share the same value. Per-year values will be available in a future update."
- When the user edits an input cell in ANY year column, ALL year columns update simultaneously. The updating cells briefly flash to show the change propagated.
- The cell the user edited shows a pencil icon; the other 4 year columns show a link icon in the edited cell for 2 seconds, reinforcing "these are linked."
- In the drill-down views (quarterly/monthly), editing any period updates all periods for that input.

After Epic 7:
- The link icon disappears.
- Editing Y2 changes only Y2. Y1 values are independent.
- A "Copy Y1 to all years" action is available for users who want to broadcast.
- Per-year values are the default; broadcasting is the opt-in action.

### Transition from Epic 4 Quick Entry Grid (Critique Issue #9)

The Epic 4 implementation included a flat TanStack Table grid with ~19 input fields in "Quick Entry mode." That flat grid is superseded by inline editing within Reports. The transition:

- **The flat grid component (`quick-entry-mode.tsx`) is retired.** Its functionality is fully absorbed by the inline-editable financial statement tabs in Reports.
- **No "All Inputs" fallback tab is needed.** The original v2 spec proposed an "All Inputs" tab as an escape hatch. In v3 this is unnecessary — the P&L tab already contains the majority of editable inputs, and the remaining inputs are distributed across Balance Sheet (working capital days) and Valuation (EBITDA multiple). A power user like Maria navigates between 2-3 tabs, not a separate flat grid.
- **No one-time orientation overlay is needed.** There's nothing to explain. Reports shows financial statements with editable cells. My Plan shows structured forms. Users navigate between them via the sidebar. There's no "mode change" to orient them to.

**[F2]**

---

## Part 4: Scenario Comparison — The Conviction Moment

### Good/Better/Best Is a First-Class Feature

**Design principle (from UX Spec):** "Scenario comparison elevated to secondary core action. The moment where Sam compares Good/Better/Best and realizes 'even the conservative case works' is where conviction forms."

**Design principle (from Brainstorming Feb 8, Idea #12):** "Every ROI output presents three scenarios (conservative, moderate, optimistic) so the franchisee sees a range, not a false promise."

#### Scenario Bar

A persistent **Scenario Bar** sits between the tab navigation and the statement content. It shows the currently active scenario and provides quick access to comparison:

```
┌─────────────────────────────────────────────────────┐
│  Viewing: ● Base Case    [Compare Scenarios ▾]      │
└─────────────────────────────────────────────────────┘
```

- **"Base Case"** is the user's current plan inputs — always exists.
- **"Compare Scenarios"** opens a dropdown/panel with:
  - **Quick Scenarios:** "Conservative" and "Optimistic" — auto-generated by applying sensitivity factors to multiple variables (see below). These require zero configuration.
  - **Custom Scenario:** "Create Custom Scenario" — lets the user duplicate the base case and modify specific inputs. (Implementation deferred to Epic 10, but the UI slot exists now.)

#### Quick Scenario Sensitivity Model (Critique Issue #6)

**The original draft applied ±15% to revenue only. That's dangerously oversimplified.** A "conservative" scenario with only lower revenue ignores cost risks. Sam would walk into the bank with false confidence.

Quick scenarios apply sensitivity factors to **three variables simultaneously:**

| Variable | Conservative | Optimistic |
|----------|-------------|-----------|
| Revenue | -15% | +15% |
| COGS % | +2 percentage points | -1 percentage point |
| Operating Expenses (total) | +10% | -5% |

This models the realistic conservative case: lower revenue AND higher costs. The optimistic case is more modest on the cost side (costs don't swing as much as revenue in practice).

**Sensitivity factor source:** These factors are brand-level defaults set in brand configuration. If the franchisor has data on actual variance ranges, they can calibrate the factors. The defaults above are sensible starting points.

**Language precision:** The comparison summary card uses precise language about what's being modeled:

> "In the conservative scenario (15% lower revenue, higher costs), your business reaches break-even by Month 22 and generates $8,400 in pre-tax income in Year 1. Your base case projects $42,000."

NOT "Even in the conservative scenario..." — that implies the conservative case captures all downside. Our language acknowledges it's a sensitivity analysis, not a guarantee.

#### Comparison View

When the user activates comparison, the statement view transforms.

**Interaction constraint with progressive disclosure (Critique Issue #2):**

Scenario comparison and drill-down interact dangerously. Three scenarios x 5 years = 15 columns at annual view. Three scenarios x 4 quarters = 12 columns for a single expanded year. This creates an unreadable table.

**Design rule: Comparison mode locks drill-down to the currently expanded level.**

When comparison is activated:
- If the user is at **annual view** (default): comparison shows 3 scenario columns per year. This is 15 data columns — wide but manageable with horizontal scroll. No further drill-down is available while comparison is active. The year headers lose their expand affordance and a tooltip explains: "Collapse comparison to drill into year detail."
- If the user has **already drilled into a year** before activating comparison: comparison shows 3 scenario columns per quarter (12 columns for the expanded year) + the other years as single "Base Case only" annual columns. Still manageable. No further drill-down to monthly while comparison is active.
- If the user has **already drilled to monthly** before activating comparison: comparison is NOT AVAILABLE at monthly granularity. The system auto-collapses to quarterly for the expanded year and shows the comparison. A brief toast: "Comparison view available at annual and quarterly levels."

**To drill down while comparing:** Deactivate comparison first, drill to the desired level, then reactivate comparison at that level.

**Visual layout (annual comparison):**

```
                    Year 1                      Year 2
              Base    Cons    Opt         Base    Cons    Opt
Revenue      $360K   $306K   $414K      $396K   $336K   $455K
COGS         $108K   $98K    $120K      $118K   $108K   $140K
...
Pre-Tax      $42K    $8.4K   $72K       $58K    $18K    $92K
```

- Scenario columns are color-coded: Base (neutral), Conservative (muted/warm), Optimistic (muted/cool).
- The "worst case" column highlights the bottom-line metric with contextual interpretation (see F4).

**Comparison summary card:**

Above the table, a summary card distills the comparison:

> "In the conservative scenario (15% lower revenue, higher costs), your business reaches break-even by Month 22 and generates $8,400 in Year 1 pre-tax income. Your base case projects $42,000, and the optimistic case projects $72,000."

This is the conviction moment — but it's an honest one. The conservative case models multiple risk factors, not just revenue.

#### Where Scenarios Live in the Data Model

- Scenarios are stored as variations on the plan's `financial_inputs` JSONB.
- The base case IS the plan's current inputs.
- Quick scenarios are computed client-side by applying sensitivity multipliers to the base case inputs — they don't persist unless the user saves them.
- Custom scenarios (Epic 10) are persisted as separate input snapshots within the plan.

**[F3]**

---

## Part 5: Dynamic Interpretation — The "So What" Layer

### Every Number Needs Context

**Design principle (from UX Spec, Principle #2):** "Show the impact in their language. When Sam changes a number, show what it means for the business in terms Sam understands."

**Design principle (from Brainstorming Feb 8, Idea #50):** "Financial Literacy Layers — contextual education on every financial document and metric. Tooltips, explainers, walkthroughs. Available when the franchisee wants to understand — not forced."

The "so what" layer consists of three types of contextual interpretation, applied throughout all financial statement views:

#### Type 1: Key Metrics Callout Bar

Each financial statement tab has a **callout bar** at the top — 2-3 cards that answer the most important question for that statement:

| Statement | Callout Bar Content |
|-----------|-------------------|
| Summary | "Your 5-year total pre-tax income: $X. Break-even: Month Y (that's [Month, Year])." |
| P&L | "Year 1 pre-tax margin: X%. [Contextual: 'Above/within/below typical range for [Brand] franchisees']" |
| Balance Sheet | "Debt-to-equity ratio: X:1 by Year 3. [Contextual: 'Lenders typically look for below 3:1']" |
| Cash Flow | "Lowest cash point: $X in Month Y. [Contextual: 'You'll need at least $X in reserves to cover this period']" |
| ROIC | "5-year return on invested capital: X%. Break-even on investment: Month Y." |
| Valuation | "Estimated business value at Year 5: $X based on Xa EBITDA multiple." |
| Audit | "X of 13 checks passing. [List any failures with plain-language explanation]" |

The callout bar is **always visible** (sticky at top of each tab). It updates in real time as inputs change.

#### Type 2: Row-Level Interpretation

Certain rows in the financial statements include a subtle interpretation line below the numbers:

```
Pre-Tax Income    $42,000    $58,000    $72,000    $85,000    $98,000
                  ↳ 11.7% of revenue — within PostNet typical range (10-15%)
```

Row-level interpretations appear for:
- Pre-tax income (margin percentage + brand benchmark context)
- Gross margin (percentage + brand benchmark)
- Labor cost (percentage of revenue + efficiency note)
- Break-even row (converted to calendar date: "February 2027")
- Cash flow (months of negative cash flow highlighted)
- ROIC (comparison to alternative investment benchmarks)

**Rules for interpretations:**
- Benchmarks come ONLY from brand defaults configured by the franchisor — never from universal databases.
- If no brand benchmark exists for a metric, the interpretation shows only the percentage/ratio without benchmark context.
- Interpretations use neutral language: "within typical range," "above typical range," "below typical range." Never "good" or "bad."
- In Reports, interpretations update in real time as input cells are edited inline. When values change via My Plan, interpretations in Reports update upon navigation back to Reports.

**Accessibility note (Critique Issue #7):** Interpretation rows are associated with their parent data row via `aria-describedby`. Screen readers announce them as supplementary context after reading the data row values. They are NOT read as separate table rows — they are descriptive annotations.

#### Type 3: Hover Tooltips on Computed Values

When the user hovers over any computed cell, a tooltip appears showing:
- **What this number means** in plain language (e.g., "Gross Profit is your revenue minus the direct cost of goods. It's what you have left to cover operating expenses and profit.")
- **How it's calculated** (e.g., "Revenue ($360,000) minus COGS ($108,000)")
- **Link to Glossary** for the full definition

Tooltips are the "education for empowerment" layer. They're available when the user wants them, invisible when they don't.

**[F4]**

---

## Part 6: ROI Threshold Guardian

### Persistent Feedback on Every Decision

**Design principle (from Brainstorming Feb 8, Idea #51):** "Persistent red/yellow/green indicator. Franchisee sets acceptable ROI range; every decision that pushes toward the bottom triggers a warning. Real-time feedback, self-correction as they go."

#### The Guardian Bar

A **persistent, slim bar** appears at the very top of the Financial Statements view (above the tabs, below the workspace header). It shows the plan's overall health at a glance:

```
┌──────────────────────────────────────────────────────────────────┐
│  ● Break-even: Mo 14 (Feb '27)  │  ● 5yr ROI: 127%  │  ● Cash: OK  │
└──────────────────────────────────────────────────────────────────┘
```

Each indicator uses the following color AND icon system:

| Level | Color | Icon | Meaning | Example |
|-------|-------|------|---------|---------|
| Healthy | Green (success token) | Checkmark | Metric is healthy | Break-even within 18 months; positive 5yr ROI; cash never goes negative |
| Attention | Amber/Yellow (warning token) | Alert triangle | Metric needs attention | Break-even between 18-30 months; 5yr ROI below 50%; cash goes negative briefly |
| Concerning | Gurple (info/advisory token) | Info circle | Metric is concerning | Break-even beyond 30 months; negative 5yr ROI; extended negative cash periods |

**Accessibility note (Critique Issue #7):** Each indicator includes BOTH a color AND an icon shape. The checkmark, alert triangle, and info circle are distinguishable without color perception. The text label always includes the specific value ("5yr ROI: 127%") — the color/icon is supplementary, not the primary information channel.

**Important design constraint:** This is NOT a red/yellow/green traffic light. We use the Katalyst color system:
- Success (green) for healthy
- A warm amber for "attention" (not destructive red — that's reserved for errors)
- Gurple (the advisory purple) for "concerning" — consistent with the advisory pattern used elsewhere

The Guardian Bar is NOT a judgment. It's a compass. The language is always:
- "Break-even: Month 14" — fact
- "5yr ROI: 127%" — fact
- "Cash: lowest point -$8,200 in Month 6" — fact with specificity

The user draws their own conclusions. The Guardian provides the data to draw them from.

#### Threshold Configuration

The Guardian thresholds are brand-specific defaults set by the franchisor/Katalyst during brand configuration:

| Metric | Green Threshold | Amber Threshold | Gurple Threshold |
|--------|----------------|-----------------|------------------|
| Break-even | ≤ 18 months | 18-30 months | > 30 months |
| 5-Year ROI | ≥ 100% | 50-100% | < 50% |
| Cash Position | Never negative | Negative ≤ 3 months | Negative > 3 months |

These thresholds are configurable per brand in the admin brand configuration (future story in Epic 8 Advisory Guardrails). For MVP, they use sensible defaults.

#### Guardian Interaction

- Clicking any Guardian indicator navigates to the relevant financial statement tab and scrolls to the relevant row.
- Clicking "Break-even: Mo 14" → navigates to Summary tab, scrolls to break-even analysis section.
- Clicking "Cash: lowest point -$8,200 in Month 6" → navigates to Cash Flow tab, drills into Year 1 monthly view, highlights Month 6.
- The Guardian updates in real time as inputs change — editing a cell inline in Reports immediately reflects in the Guardian. Editing a value in My Plan also updates the Guardian (visible via the miniature Guardian dots in the Impact Strip).

#### Guardian in My Plan (via Impact Strip)

The full Guardian Bar is only visible in Reports. In My Plan, the Impact Strip (Part 1) includes a miniature Guardian — three colored dots with icons, showing the same health status. Clicking a miniature Guardian dot navigates to Reports with the relevant tab and row focused.

**[F5]**

---

## Part 7: Document Preview — Progressive Pride

### The Plan Takes Shape as You Work

**Design principle (from UX Spec, Sam's emotional arc):** "A live document preview is visible during planning, building pride progressively rather than delivering it as a surprise at the end."

#### Where Document Preview Lives (Critique Issue #4)

**Revised design decision:** Document Preview is NOT shown within the Financial Statements view. When the user is already looking at the P&L tab, showing a miniature P&L preview alongside it is redundant — a thumbnail of what you're already looking at adds no value.

Instead, Document Preview appears where there IS a meaningful gap between "what I'm working on" and "what the output looks like":

**1. Dashboard Panel — Preview Widget:**

The existing Dashboard Panel (summary cards + charts) gains a **Document Preview widget** — a card-sized miniature showing the first page of the lender document. It updates in real time as inputs change.

```
┌─ Dashboard ──────────────────────────────────────────────────┐
│                                                               │
│  [Summary Cards]  [Charts]                                    │
│                                                               │
│  ┌─ Your Business Plan ─────────────────────────────────┐    │
│  │  Sam's PostNet Business Plan                          │    │
│  │  ──────────────────────────                           │    │
│  │  P&L Statement (preview)                              │    │
│  │  Revenue: $360K | Pre-Tax: $42K                       │    │
│  │                                                       │    │
│  │  Page 1 of 8    [View Full Preview] [Generate PDF]    │    │
│  └───────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────┘
```

- The preview card shows Sam's name on the document. That's the pride moment.
- "View Full Preview" opens a modal with all pages rendered at readable size.
- "Generate PDF" triggers the actual PDF generation and download.

**2. My Plan — Preview accessible from Impact Strip:**

The Impact Strip includes a small document icon. Clicking it opens the full Document Preview modal. The user sees their edits reflected in the document format.

**3. Reports — Generate Button Only:**

In Reports, the document preview is replaced by a prominent "Generate PDF" button in the header area. The user is already looking at the financial statement content — they don't need a preview of it. They need the ability to produce the final artifact.

```
┌─ Reports Header ─────────────────────────────────────────────┐
│  [Summary] [P&L] [Balance Sheet] [Cash Flow] ...   [Generate PDF ↓] │
└───────────────────────────────────────────────────────────────┘
```

**Generate PDF button label evolves with completeness:**
- At < 50% input completeness: "Generate Draft"
- At 50-90%: "Generate Package"
- At > 90%: "Generate Lender Package" (with a subtle completion indicator)

**The emotional design:**

- When Sam first sees the preview widget on the Dashboard, he sees his name on a professional-looking financial document. That's the pride moment — and it happens early, while he's still editing inputs.
- As he works through inputs (in My Plan or directly in Reports), the preview updates. The document gets more complete and more real.
- When Sam navigates to Reports and sees the full interactive financial statements, the document preview isn't needed — the interactive views ARE the document content. The "Generate PDF" button is the natural culmination: "I've reviewed everything, now make it official."

**[F6]**

---

## Part 8: Statement-Specific Design Details

### 8.1 Summary Financials (Landing Tab)

The Summary tab is the DEFAULT landing tab when the user opens Reports from the sidebar. It provides the annual overview that Sam needs and the quick reference that Maria wants. (Maria may navigate immediately to P&L to start editing — the Summary is a useful landing, not a gate.)

**Layout:**

```
┌─ Key Metrics Callout Bar (sticky) ─────────────────────────────┐
│  Total 5yr Pre-Tax Income: $355K  │  Break-even: Mo 14  │  ... │
└────────────────────────────────────────────────────────────────┘

┌─ Annual P&L Summary ──────────────────────────────────────────┐
│  (Collapsible section — expanded by default)                   │
│                    Y1        Y2        Y3        Y4        Y5  │
│  Revenue          $360K     $396K     $436K     $479K     $527K│
│  COGS             $108K     ...                                │
│  Gross Profit     $252K     ...                                │
│  Operating Exp    $168K     ...                                │
│  Pre-Tax Income   $42K      ...                                │
│  ↳ 11.7% margin — within PostNet typical range (10-15%)       │
└────────────────────────────────────────────────────────────────┘

┌─ Balance Sheet Summary ───────────────────────────────────────┐
│  (Collapsible section — collapsed by default)                  │
│  Total Assets, Total Liabilities, Total Equity by year         │
└────────────────────────────────────────────────────────────────┘

┌─ Cash Flow Summary ──────────────────────────────────────────┐
│  Operating CF, Net CF, Ending Cash by year                     │
└────────────────────────────────────────────────────────────────┘

┌─ Break-Even Analysis ─────────────────────────────────────────┐
│  Break-even month, cumulative cash flow chart (sparkline)      │
│  "You'd start making money by [calendar date]"                 │
└────────────────────────────────────────────────────────────────┘

┌─ Startup Capital Summary ─────────────────────────────────────┐
│  Total investment, CapEx vs non-CapEx split, funding sources   │
└────────────────────────────────────────────────────────────────┘
```

Each section header is a link to the detailed statement tab. "Annual P&L Summary → View Full P&L" link navigates to the P&L tab.

### 8.2 P&L Statement

**Row structure (matching reference spreadsheet):**

| Section | Rows |
|---------|------|
| Revenue | Monthly Revenue, Annual Revenue |
| COGS | COGS %, COGS $ |
| Gross Profit | Gross Profit $, Gross Margin % |
| Operating Expenses | Direct Labor, Management Salaries, Payroll Tax & Benefits, Facilities, Marketing/Advertising, Discretionary Marketing, Other OpEx |
| EBITDA | EBITDA $, EBITDA Margin % |
| Below EBITDA | Depreciation, Interest Expense |
| Pre-Tax Income | Pre-Tax Income $, Pre-Tax Margin % |
| P&L Analysis | Adjusted Pre-Tax Profit, Target Pre-Tax Profit, Above/Below Target, Salary Cap analysis, Labor Efficiency |

**Input cells (always editable in Reports):** Revenue, COGS %, Direct Labor %, Management Salaries, Facilities, Marketing, Other OpEx %, and other input fields are editable inline. Gross Profit, EBITDA, Pre-Tax Income, and all analysis rows are computed and read-only.

### 8.3 Balance Sheet

**Row structure:**

| Section | Rows |
|---------|------|
| Current Assets | Cash, Accounts Receivable, Inventory, Other Current Assets, Total Current Assets |
| Fixed Assets | Gross Fixed Assets, Accumulated Depreciation, Net Fixed Assets |
| Total Assets | Total Assets |
| Current Liabilities | Accounts Payable, Tax Payable, Current Portion of LT Debt, Total Current Liabilities |
| Long-Term Liabilities | Notes Payable (net of current), Line of Credit, Total LT Liabilities |
| Total Liabilities | Total Liabilities |
| Equity | Common Stock / Paid-in Capital, Retained Earnings, Total Equity |
| Check | Total Liabilities + Equity (must equal Total Assets) |

**Input cells (always editable in Reports):** AR Days, AP Days, Inventory Days, Tax Payment Delay are the primary inputs that drive balance sheet line items. These appear as editable cells in the relevant rows.

**Audit integration:** The "Total Liabilities + Equity = Total Assets" check shows a pass/fail indicator inline. If it fails (which shouldn't happen with a correct engine), the row highlights in destructive color.

### 8.4 Cash Flow Statement

**Row structure:**

| Section | Rows |
|---------|------|
| Operating Activities | Net Income, Depreciation, Changes in AR, Changes in Inventory, Changes in Other Assets, Changes in AP, Changes in Tax Payable, Net Operating Cash Flow |
| Investing Activities | CapEx Purchases, Net Investing Cash Flow |
| Cash Before Financing | Net Cash Before Financing |
| Financing Activities | Notes Payable, Line of Credit Draws/Repayments, Interest Expense, Distributions, Equity Issuance, Net Financing Cash Flow |
| Net Cash Flow | Net Cash Flow, Beginning Cash, Ending Cash |

**Negative cash highlighting:** Any month where Ending Cash is negative gets a subtle warm background tint AND a small downward-arrow icon in the cell (not destructive red — this is advisory, not an error). The Guardian Bar's "Cash" indicator reflects this.

### 8.5 ROIC

Annual view only (no monthly drill-down — ROIC is computed annually):

| Section | Rows |
|---------|------|
| Invested Capital | Initial Investment, Additional CapEx, Working Capital Investment, Non-CapEx Investment, Total Invested Capital, Cumulative Invested Capital |
| Returns | Adjusted Pre-Tax Income, Sweat Equity Adjustment, After-Tax Income (estimated), Cumulative After-Tax Income |
| ROIC Metrics | Annual ROIC %, Cumulative ROIC %, Cash-on-Cash Return %, Core Capital %, Core Capital ROIC % |

**Key callout:** "Your 5-year cumulative ROIC of X% means for every dollar you invested, you earned $Y back."

### 8.6 Valuation

Annual view only:

| Section | Rows |
|---------|------|
| EBITDA Basis | EBITDA, EBITDA Multiple (input), Estimated Enterprise Value |
| Adjustments | Less: Outstanding Debt, Less: Working Capital Adjustment, Estimated Equity Value |
| After-Tax | Estimated Tax on Sale, After-Tax Proceeds |
| Returns | Total Cash Extracted (distributions + sale proceeds), Total Invested, Net Return, Return Multiple |

**Input cells:** EBITDA Multiple is the primary input. All other values are computed.

### 8.7 Audit / Integrity Checks

Not a financial statement — a diagnostic view:

```
┌─ Audit Results ───────────────────────────────────────────────┐
│                                                                │
│  ✓ Balance Sheet Identity (Assets = Liabilities + Equity)      │
│    Year 1: $485,200 = $485,200  ✓                             │
│    Year 2: $462,100 = $462,100  ✓                             │
│    ...                                                         │
│                                                                │
│  ✓ Cash Flow to Balance Sheet (Ending Cash matches)            │
│    ...                                                         │
│                                                                │
│  ✗ Depreciation Consistency                                    │
│    Year 3: Accumulated depreciation $45,000 but CapEx only     │
│    $40,000 — check depreciation schedule                       │
│    [View in Balance Sheet →]                                   │
│                                                                │
│  12 of 13 checks passing                                       │
└────────────────────────────────────────────────────────────────┘
```

Each check shows pass/fail with the specific values being compared. Failed checks include a link to navigate to the relevant statement and row.

---

## Part 9: Responsive Strategy

### Desktop-First, Graceful Degradation

**From UX Spec:** "Desktop-first, web-only. Minimum viewport: 1024px."

Financial statement views are inherently wide — even annual-only view has 5+ columns plus row labels. The responsive strategy:

| Viewport | Behavior |
|----------|----------|
| ≥ 1280px | Full experience. Statement tabs + all features. All annual columns visible without horizontal scroll. |
| 1024-1279px | Full experience. Horizontal scroll may appear for quarterly/monthly drill-down. |
| 768-1023px | Simplified experience. Tab navigation converts to dropdown. Annual view only (no drill-down to quarterly/monthly). Scenario comparison shows one scenario at a time with a selector. Guardian Bar collapses to a single summary indicator. |
| < 768px | **"View on Desktop" message.** Financial statements are not rendered on mobile. A friendly message: "Financial statements are best viewed on a larger screen. Your plan data is safe — open this page on your computer or tablet to see the full view." The Summary tab's key metrics callout bar IS shown on mobile as a read-only summary card — so mobile users can still see headline numbers. |

**Justification for no mobile financial statements:** The reference spreadsheet has 60 columns and 30+ rows per statement. Even the annual summary view has 5 data columns plus labels, section headers, and interpretation rows. Attempting to fit this on a 375px screen would produce an unusable experience. Showing headline metrics on mobile preserves informational access without degrading the experience.

---

## Part 10: Component Architecture

### Preventing Mega-Components

The Epic 4 retrospective flagged `forms-mode.tsx` (536 lines) and `quick-entry-mode.tsx` (571 lines) as growing concerns. In the v3 architecture, `quick-entry-mode.tsx` is retired entirely (its functionality is absorbed by inline editing in Reports), and `forms-mode.tsx` evolves into the `<MyPlan>` component. Financial statement views are MORE complex than either of those files. The component architecture must prevent 1000+ line files.

**Component hierarchy (Critique Issue #3 — StatementTable decomposition):**

The original draft assigned six distinct behaviors to a single `<StatementTable>` component. This revised architecture decomposes it into a family of focused components:

```
<AppLayout>                                    (sidebar + content area)
├── <AppSidebar />                             (navigation: All Plans, My Plan, Reports, etc.)
├── <ContentArea>
│   ├── Route: /plan/:id/my-plan
│   │   └── <MyPlan>                           (structured forms + Impact Strip)
│   │       ├── <SummaryMetricsBar />          (headline numbers, ~60 lines)
│   │       ├── <InputSection title="Revenue"> (collapsible form sections)
│   │       ├── <InputSection title="COGS">
│   │       ├── ...
│   │       └── <ImpactStrip />                (sticky bottom bar, ~100 lines)
│   │
│   ├── Route: /plan/:id/reports
│   │   └── <Reports>                          (tabbed financial statements)
│   │       ├── <GuardianBar />                (persistent health indicators, ~80 lines)
│   │       ├── <TabNavigation />              (Summary|P&L|BS|CF|ROIC|Val|Audit)
│   │       ├── <StatementTab statement="summary">
│   │       │   ├── <CalloutBar metrics={...} />
│   │       │   ├── <StatementSection title="P&L Summary">
│   │       │   │   └── <StatementTable rows={...} columns={...} />
│   │       │   └── ...
│   │       ├── <StatementTab statement="pnl">
│   │       │   ├── <CalloutBar />
│   │       │   └── <StatementTable
│   │       │           rows={pnlRows}
│   │       │           columns={yearColumns}
│   │       │           drillDown={true}
│   │       │           editable={true}
│   │       │           interpretations={pnlInterpretations}
│   │       │       />
│   │       ├── ...
│   │       └── <DocumentPreviewModal />       (full preview modal, ~120 lines)
│   │
│   ├── Route: /plan/:id/scenarios
│   │   └── <Scenarios />                      (comparison view)
│   │
│   └── Route: /plan/:id/settings
│       └── <PlanSettings />
```

**Key differences from v2 architecture:**

1. **`editable` is always `true` in Reports.** There is no `mode === 'quick-entry'` conditional. Input cells are always editable; computed cells are always read-only. The visual treatment handles the distinction.
2. **`<AllInputsView>` is removed.** No flat grid fallback. The financial statement tabs ARE the editing surface.
3. **`<ImpactStrip>` lives inside `<MyPlan>`, not inside `<Reports>`.** It's the bridge FROM forms TO reports, not a component within the reports view.
4. **`<AppSidebar>` replaces the mode switcher.** Navigation is structural (sidebar items), not modal (segmented control).

**StatementTable decomposition — the family of components:**

`<StatementTable>` is an ORCHESTRATOR (~150 lines) that composes these focused sub-components:

| Component | Responsibility | Lines (target) |
|-----------|---------------|----------------|
| `<StatementTable>` | Orchestrates layout, passes data to children, manages table-level state (which sections expanded, which year drilled into) | ~150 |
| `<ColumnManager>` | Generates column definitions based on drill-down state. Handles annual → quarterly → monthly column expansion/collapse. Manages the "linked columns" indicator (pre-Epic-7). | ~120 |
| `<SectionGroup>` | Renders a collapsible row group (Revenue, COGS, Operating Expenses, etc.). Manages its own expand/collapse state. Contains `<DataRow>` and `<InterpretationRow>` children. | ~80 |
| `<DataRow>` | Renders a single row of data cells across all visible columns. Delegates cell rendering to `<EditableCell>` or `<ComputedCell>` based on cell type. | ~60 |
| `<EditableCell>` | Inline editing for input cells. Reused from Epic 4 with minimal changes. Handles click-to-edit, Tab navigation, auto-formatting, auto-save. | ~100 (existing) |
| `<ComputedCell>` | Read-only cell with hover tooltip showing formula and glossary link. | ~40 |
| `<InterpretationRow>` | Renders contextual "so what" text below a data row. Collapses into a single row spanning all columns. | ~40 |
| `<StickyContainer>` | Wraps row labels and section headers with sticky positioning and shadow effects. | ~30 |
| `<ScenarioColumns>` | When comparison is active, wraps each year's data into scenario sub-columns with color coding. Handles the comparison layout transformation. | ~80 |

**Total across family:** ~700 lines distributed across 9 files averaging ~80 lines each. No single file exceeds 150 lines. The complexity is real — we're distributing it, not hiding it.

**Key shared components (unchanged from v1):**

| Component | Responsibility | Reuse |
|-----------|---------------|-------|
| `<CalloutBar>` | Renders 2-3 key metrics with dynamic interpretation text | Used by every statement tab |
| `<GuardianBar>` | Renders persistent health indicators with navigation links | Used once, always visible |
| `<ScenarioBar>` | Renders scenario selector and comparison toggle | Used once, always visible |

---

## Part 11: Glossary & Help Integration

### Contextual Education, Not a Reference Manual

The Glossary (Story 5.8) and Help Content (Story 5.10) from the Sprint Change Proposal integrate into the financial statement experience as follows:

**Glossary access:**
- Sidebar navigation item: "Glossary" — opens a searchable list of financial terms with definitions.
- Inline access: Every computed cell tooltip includes a "Learn more" link that opens the Glossary entry for that term.
- Terms used in interpretation rows are hyperlinked to their Glossary definitions.

**Help content on input fields:**
- In Reports (where inputs are inline in financial statements), hovering an input cell shows the field's help tooltip.
- On focus (when editing), an expanded help panel slides in below the cell or in a sidebar, showing the full guidance text.
- In My Plan (structured forms), help text appears alongside form fields as it does today — labels, descriptions, and brand default indicators.
- Help content includes both the consolidated-field help (from spreadsheet comments) and the decomposed sub-field help (authored for My Plan's form sections).

---

## Part 12: Empty & Incomplete States (Critique Issue #5)

### Brand Defaults Are a Starting Point, Not a Finished Product

When Sam opens Financial Statements before editing any inputs, every field has a brand default value. Technically, the statements are "complete." But emotionally, this is NOT Sam's plan — it's the brand template. The UX must distinguish between "personalized" and "default" values.

#### Completeness Indicators

**Per-tab completeness badge:**

Each tab in the Financial Statements navigation shows a small completeness indicator:

```
[Summary ●] [P&L 3/8] [Balance Sheet 0/4] [Cash Flow —] [ROIC —] ...
```

- Tabs with editable inputs show "X of Y inputs customized" (e.g., "3/8" means 3 of 8 input fields have been edited by the user).
- Tabs with no editable inputs (Cash Flow, ROIC — all computed) show a dash "—" with no completeness indicator.
- The Summary tab shows a filled circle when at least one input has been customized anywhere, and an empty circle when everything is still brand defaults.

**Per-cell default indicator:**

Input cells that still hold the brand default value show a subtle **"BD" badge** (Brand Default) in the corner of the cell. When the user edits the cell, the badge disappears. When the user resets the cell to the brand default (existing reset action from Epic 4), the badge reappears.

This provides a per-cell visual answer to "did I actually set this, or is it the template?"

#### Guardian Bar with All Defaults

When all inputs are brand defaults, the Guardian Bar shows the health metrics computed from brand defaults. This IS honest — the brand defaults represent a typical plan for that brand. The Guardian indicators are:
- Labeled normally (green/amber/gurple based on thresholds)
- But with a supplementary note below the Guardian Bar: "Based on [Brand] defaults. Customize your inputs to see your specific projections."

This note disappears once the user has customized at least 3 inputs (arbitrary threshold — enough to indicate engagement).

#### Document Preview with Incomplete Plan

The Document Preview widget on the Dashboard shows the same preview regardless of completeness, but:
- The document title reads "Sam's PostNet Business Plan — Draft" until the plan reaches 50% input customization.
- The "Generate PDF" button label reflects completeness (see Part 7).

**[F5] [F6]**

---

## Part 13: User Journey Tracing

### From Login to Conviction (the retrospective's missing piece)

This section traces the complete user path for each persona through the two-door architecture, ensuring no component mount or navigation link is missing.

#### Sam's Journey (First-Time Franchisee — enters through My Plan)

1. **Login** → All Plans (portfolio view, showing one plan for Sam)
2. **Clicks his plan** → lands on **My Plan**
3. **Quick Start** → 5 questions → preliminary metrics populate (existing)
4. **Edits inputs** in My Plan's structured form sections — Revenue, COGS, Labor, etc.
5. **Sees Impact Strip** at the bottom of My Plan: "Pre-Tax Income: $42,000 (+$3,200) | Break-even: Mo 14 | ROI: 127%"
6. **Sees miniature Guardian dots** in Impact Strip — all green
7. **Clicks "View Full P&L →"** in Impact Strip → navigates to **Reports**, P&L tab
8. **Sees Guardian Bar** at top of Reports — full-size indicators with icons
9. **Sees callout bar:** "Year 1 pre-tax margin: 11.7% — within PostNet typical range"
10. **Sees completeness badge** on P&L tab: "5/8" — some inputs still at brand default
11. **Hovers a computed cell** → tooltip explains "Gross Profit = Revenue - COGS"
12. **Clicks Summary tab** → annual overview with all sections
13. **Reads break-even interpretation:** "You'd start making money by February 2027"
14. **Clicks "Scenarios" in sidebar** → Conservative/Optimistic comparison view
15. **Reads comparison summary:** "In the conservative scenario (15% lower revenue, higher costs), your business reaches break-even by Month 22"
16. **Clicks "My Plan" in sidebar** → returns to forms, continues editing → Impact Strip updates
17. **Returns to Reports** → completeness badge now "8/8"
18. **Clicks "Generate Lender Package"** → PDF downloads

**Every step uses sidebar navigation. No mode switching. No confusion about where to go.**

#### Maria's Journey (Financial Expert — enters through Reports)

1. **Login** → All Plans (sees client's plan)
2. **Clicks the plan** → lands on My Plan by default
3. **Immediately clicks "Reports" in sidebar** — she knows where she's going
4. **Clicks P&L tab** → sees financial statement with editable input cells
5. **Tabs through input cells** at spreadsheet speed — revenue, COGS %, labor %, facilities, etc.
6. **Sees linked-column indicators** (pre-Epic-7) — editing Y2 updates all years, link icons flash briefly
7. **Guardian Bar updates** in real time as she enters values
8. **Clicks Balance Sheet tab** — enters working capital days (AR, AP, Inventory) inline
9. **Clicks Cash Flow tab** — reviews computed cash flows, checks for negative months (warm tint + downward arrow icon on negative cells)
10. **Clicks Valuation tab** — enters EBITDA multiple inline
11. **Returns to P&L tab** → clicks "Scenarios" in sidebar → sees conservative case at annual level
12. **Reviews comparison summary** — notes conservative case still works with multi-variable sensitivity
13. **Clicks "Reports" in sidebar** → clicks "Generate Lender Package" → PDF downloads — done in 15 minutes

**Maria never touches My Plan. She works entirely in Reports, editing inline. No flat grid, no mode selection, no orientation overlay.**

#### Chris's Journey (Experienced Multi-Unit Owner — uses both doors)

1. **Login** → All Plans (sees Location #1 and Location #2)
2. **Clicks Location #2** → lands on **My Plan**
3. **Edits inputs** in My Plan's form sections, overriding brand defaults with experience-informed values
4. **Sees Impact Strip** updating in real time — delta indicators show "+$4,800" as she changes revenue
5. **Clicks "View Full P&L →"** in Impact Strip → navigates to **Reports**, P&L tab
6. **Drills into P&L Year 1** → expands to quarterly to see seasonal ramp-up
7. **Sees interpretation:** "Your Year 1 labor cost of 28% is above PostNet typical range (22-26%)"
8. **Clicks "My Plan" in sidebar** → adjusts labor inputs in the Labor form section
9. **Impact Strip shows** labor cost now at 25%, interpretation updates
10. **Clicks "Scenarios" in sidebar** → sees conservative case
11. **Returns to Reports** → clicks "Generate Lender Package" → PDF downloads for lender meeting
12. **Clicks "All Plans" in sidebar** → opens Location #1 plan to repeat the process

**Chris moves between My Plan and Reports fluidly. The sidebar is her navigation tool — she never has to "switch modes."**

---

## Part 14: What This Spec Does NOT Cover

These items are explicitly out of scope for Epic 5's UX spec and belong to later epics:

| Item | Deferred To | Reason |
|------|-------------|--------|
| Custom scenario creation (duplicate base case, modify inputs) | Epic 10 | Scope — quick multi-variable scenarios are sufficient for Epic 5 |
| Per-year input columns in My Plan and Reports | Epic 7 | Dependency — per-year UI needs PlanFinancialInputs restructuring |
| Multi-plan comparison (portfolio-level) | Epic 7 | Dependency — requires plan CRUD + All Plans navigation |
| AI planning assistant integration with Reports | Epic 9 | Dependency — requires AI integration |
| Advisory nudges on individual input fields | Epic 8 | Scope — Guardian Bar provides plan-level advisory; field-level is Epic 8 |
| Excel/CSV export | Backlog | Lower priority than PDF |
| Estimated vs. actual tracking | Phase 2 | PRD Phase 2 scope |
| Configurable Guardian thresholds per brand | Epic 8 | Scope — sensible defaults for MVP |

---

## Part 15: Accessibility (Critique Issue #7)

### Inclusive Design for Financial Data

Financial statement views present dense tabular data with interactive elements. Accessibility is not optional — it's a design requirement.

#### Non-Color Indicators

Every color-coded element in this spec has a non-color alternative:

| Element | Color Meaning | Non-Color Indicator |
|---------|--------------|-------------------|
| Input cells (editable) | Primary/5 tinted background | Dashed left border + pencil icon on hover |
| Computed cells (read-only) | Standard background | No border, no icon — absence IS the indicator |
| Guardian healthy | Green | Checkmark icon |
| Guardian attention | Amber | Alert triangle icon |
| Guardian concerning | Gurple | Info circle icon |
| Negative cash cells | Warm tint | Downward arrow icon in cell |
| Scenario columns (conservative) | Muted warm | Column header labeled "Cons" |
| Scenario columns (optimistic) | Muted cool | Column header labeled "Opt" |
| Completeness: customized | No special color | No "BD" badge |
| Completeness: brand default | No special color | "BD" badge visible in cell corner |

#### ARIA Roles and Announcements

The financial statement tables use the following ARIA structure:

- The overall container uses `role="grid"` with `aria-label="P&L Statement"` (or whichever statement).
- Section groups (Revenue, COGS, etc.) use `role="rowgroup"` with `aria-expanded="true/false"` for collapsible sections.
- Row labels use `role="rowheader"`.
- Input cells use `role="gridcell"` with `aria-readonly="false"` and `aria-label` including the row name and column name (e.g., "Monthly Revenue, Year 2").
- Computed cells use `role="gridcell"` with `aria-readonly="true"`.
- Interpretation rows use `role="note"` and are linked to their parent data row via `aria-describedby`.
- The Guardian Bar uses `role="status"` with `aria-live="polite"` so screen readers announce changes without interrupting the user.

#### Focus Management

- **Drill-down:** When a year expands to quarterly view, focus moves to the first cell of the newly visible Q1 column. When collapsing, focus returns to the year column header.
- **Tab navigation (Quick Entry):** Tab moves between input cells only, skipping computed cells. The focus order follows column-major order (all editable cells in a column, then next column).
- **Scenario activation:** When comparison mode activates, focus stays on the current cell. The expanded columns are announced via `aria-live`.
- **Section expand/collapse:** Focus stays on the section header after toggle. Collapsed content is removed from tab order.

#### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Tab | Move to next editable cell (Quick Entry) |
| Shift+Tab | Move to previous editable cell |
| Enter | Confirm edit + move to next editable cell in same row group |
| Escape | Cancel edit / collapse current drill-down level |
| Arrow keys | Navigate between cells within the grid |
| Space | Toggle section expand/collapse when focused on section header |

---

## Part 16: Story Rewrite Implications

This v3 UX spec requires the Sprint Change Proposal's Epic 5 stories to be rewritten. The v3 two-door architecture eliminates mode-conditional behavior and replaces it with two navigation destinations (My Plan and Reports) that share the same underlying plan data.

| Current Story | v3 Rewrite Direction |
|--------------|-------------------|
| 5.1: P&L View | Merge with progressive disclosure pattern — P&L with annual/quarterly/monthly drill-down, interpretation rows, sticky headers. Input cells are ALWAYS editable (no mode gate). |
| 5.2: Balance Sheet View | Same drill-down pattern, audit check inline, editable input cells always available |
| 5.3: Cash Flow View | Same pattern, negative cash highlighting, Guardian integration |
| 5.4: Summary Financials | Becomes the LANDING TAB in Reports — callout bars, section links to detail tabs, break-even analysis |
| 5.5: ROIC View | Annual-only, callout bar with plain-language ROIC interpretation |
| 5.6: Valuation View | Annual-only, editable EBITDA multiple inline |
| 5.7: Audit View | Diagnostic view with navigation links to failing rows |
| 5.8: Glossary | Standalone page + inline integration (tooltips link to glossary) |
| 5.9: Quick Entry Interactive | **RETIRED AS A CONCEPT.** Inline editing is built into every statement tab in Reports. There is no separate "Quick Entry" anything. The old flat grid component is retired. |
| 5.10: Help Content | Integrated into field tooltips (Reports) and form labels (My Plan) |

**Recommended new story structure:**

1. **5.1: Engine Extension** — Add missing computations (Valuation, extended ROIC, extended Audit, Balance Sheet/Cash Flow disaggregation). No UI.
2. **5.2: Application Navigation + Reports Container + Summary Tab** — Sidebar navigation (All Plans, My Plan, Reports, Scenarios, Settings). Eliminate mode switcher entirely. Reports view with tab navigation (Summary, P&L, Balance Sheet, Cash Flow, ROIC, Valuation, Audit). Guardian Bar (structure only, thresholds in 5.8). Summary Financials as landing tab with callout bars and section links. Progressive disclosure infrastructure (annual → quarterly → monthly). Completeness indicators per tab. Linked-column indicators (pre-Epic-7).
3. **5.3: P&L Statement Tab with Inline Editing** — Full P&L with drill-down, interpretation rows. Input cells are ALWAYS editable inline (no mode conditional). Visual distinction for input vs. computed cells (tinted background, dashed border, pencil icon). Tab navigation across input cells. Reuse EditableCell from Epic 4. Accessibility: ARIA grid roles, non-color indicators.
4. **5.4: Balance Sheet + Cash Flow Tabs** — Built together (tightly coupled through LOC and tax payable mechanics). Inline editable inputs (AR Days, AP Days, etc.). Negative cash highlighting with icon. Inline audit check on balance sheet.
5. **5.5: ROIC + Valuation + Audit Tabs** — Three simpler views, annual-only, built together. Valuation has editable EBITDA multiple inline. Audit view with navigation links to failing rows.
6. **5.6: My Plan + Impact Strip** — My Plan structured form workspace with collapsible input sections. Impact Strip (sticky bottom bar) with context-sensitive metrics, delta indicators, miniature Guardian dots, and deep links to Reports tabs. Bidirectional data flow: editing in My Plan updates Reports, editing in Reports updates My Plan. This story connects the two doors.
7. **5.7: Scenario Comparison** — Multi-variable quick scenarios (revenue, COGS, OpEx sensitivity). Comparison columns with drill-down constraint rule. Comparison summary card with honest language. Brand-configurable sensitivity factors. Scenarios as a sidebar destination.
8. **5.8: Guardian Bar + Dynamic Interpretation** — ROI Threshold Guardian with icons + colors, row-level interpretation with brand benchmarks, callout bar content. Real-time updates in both Reports (inline editing) and My Plan (via Impact Strip miniature Guardian). Navigation links from Guardian to statement rows. Default thresholds (configurable in Epic 8).
9. **5.9: Document Preview + PDF Generation** — Dashboard Document Preview widget. Generate PDF button in Reports with completeness-aware labels. Empty/incomplete state handling. Per-cell "BD" (Brand Default) indicator.
10. **5.10: Glossary + Contextual Help** — Glossary page, inline tooltip integration in Reports, expanded help panels, form-level help in My Plan.

**Critical implementation note for the developer:** There is NO mode switcher, NO mode state, NO conditional rendering based on a mode variable. The `planningMode` state from Epic 4 is retired. My Plan and Reports are separate routes with separate components that read from and write to the same plan state. If you find yourself writing `if (mode === 'quick-entry')` or `editable={mode === 'quick-entry'}`, you are violating this spec. Input cells in Reports are ALWAYS editable. Period.

This rewrite sequence addresses all six foundation points and all nine critique issues, eliminates the mode-switching antipattern, and follows the retrospective lesson: design the experience first, then build it.

---

## Appendix A: Critique Issue Traceability

| Issue # | Problem | Resolution | Spec Section |
|---------|---------|------------|-------------|
| 1 | Forms mode users get worst experience (read-only statements, navigate away to edit) | v3: Eliminated modes entirely. My Plan has Impact Strip with deep links to Reports. Reports has always-editable input cells. Two doors, one room — no navigating away. | Part 1 (Two-Door Architecture) |
| 2 | Scenario comparison + progressive disclosure = column explosion | Comparison mode locks drill-down to current level; monthly drill-down disables comparison | Part 4 (Interaction constraint) |
| 3 | StatementTable is a mega-component disguised as small | Decomposed into 9-component family: StatementTable orchestrator + ColumnManager, SectionGroup, DataRow, EditableCell, ComputedCell, InterpretationRow, StickyContainer, ScenarioColumns | Part 10 (Component Architecture) |
| 4 | Document Preview is redundant inside Financial Statements | Moved to Dashboard (preview widget) and My Plan (via Impact Strip icon); Reports gets "Generate PDF" button only | Part 7 (Document Preview) |
| 5 | No empty/incomplete state design | Per-tab completeness badges, per-cell "BD" (Brand Default) indicator, Guardian note for all-defaults state, Draft label on preview | Part 12 (Empty & Incomplete States) |
| 6 | Quick scenarios only adjust revenue — false conviction | Multi-variable sensitivity: revenue (-15%), COGS (+2pp), OpEx (+10%) for conservative. Honest language in summary card. | Part 4 (Quick Scenario Sensitivity Model) |
| 7 | No accessibility design | Full Part 15: non-color indicators for every color-coded element, ARIA grid roles, focus management, keyboard shortcuts | Part 15 (Accessibility) |
| 8 | Per-year input timing problem (pre-Epic-7) | Linked columns with visual indicator (link icon, flash on broadcast, tooltip explaining constraint) | Part 3 (Pre-Epic-7 Per-Year Behavior) |
| 9 | No transition from existing Quick Entry flat grid | v3: Quick Entry as a concept is retired. The flat grid is retired. Reports with inline-editable cells replaces it entirely. No "All Inputs" fallback needed, no orientation overlay needed. | Part 3 (Transition from Epic 4) |

---

## Approval

**Status:** Revised — Architecture Simplified, Ready for User Approval
**Author:** Sally (UX Designer)
**Date:** 2026-02-16
**Revision History:**
- v1 (2026-02-15): Initial draft addressing six foundation points
- v2 (2026-02-16): Revised to address 9 issues from Sally's self-critique
- v3 (2026-02-16): Architecture overhaul — eliminated mode switcher, established two-door architecture (My Plan / Reports), retired "Quick Entry" as a concept, made inline editing always-on in Reports, updated all user journeys and component architecture to reflect sidebar-based navigation
