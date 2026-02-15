# UX Specification: Financial Statement Experience

**Author:** Sally (UX Designer)
**Date:** 2026-02-15
**Status:** Draft for Review
**Foundation:** John's Six Points from Party Mode Retrospective Review
**Input Documents:**
- Brainstorming Session 2026-02-08 (54 ideas, core design principles)
- Brainstorming Session 2026-02-15 (30 gaps, three-layer problem)
- UX Design Specification 2026-02-08 (experience principles, emotional arcs)
- Sprint Change Proposal 2026-02-15 (scope, FRs, engine extension)
- Epic 1-4 Retrospectives (pattern: backend-first → UX rework)

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

## Part 1: Navigation Model

### How Users Move Between Financial Statements

**Design decision:** Financial statements are NOT separate pages with separate routes. They are sections within a unified **Financial Statements view** accessible from the planning workspace, presented through a tabbed navigation bar within the content area.

**Navigation hierarchy:**

```
Planning Workspace (existing)
├── Mode Switcher: Planning Assistant | Forms | Quick Entry
├── Input Panel (existing — Forms or Quick Entry input)
├── Dashboard Panel (existing — summary cards + charts)
└── Financial Statements (NEW — tabbed container)
    ├── Summary          (annual overview — the landing tab)
    ├── P&L Statement    (detailed P&L)
    ├── Balance Sheet    (detailed balance sheet)
    ├── Cash Flow        (detailed cash flow)
    ├── ROIC             (returns on invested capital)
    ├── Valuation        (business valuation)
    └── Audit            (integrity checks)
```

**How users get there:**

The Financial Statements view is accessible via two paths:

1. **Sidebar navigation item:** "Financial Statements" appears in the franchisee sidebar below "My Plan" / "Dashboard." One click opens the Financial Statements container with the Summary tab active.

2. **Dashboard drill-down:** Each summary metric card on the existing Dashboard Panel becomes a link. Clicking "Pre-Tax Income: $142,000" navigates to the P&L Statement tab, scrolled to the pre-tax income row. Clicking "Total Investment: $485,000" navigates to the Summary tab's startup capital section. The dashboard becomes a portal INTO the statements, not a dead end.

**Tab behavior:**

- Tabs are always visible across the top of the Financial Statements container.
- Active tab has a primary-color underline indicator.
- Tab switching is instant — no loading state. All statement data comes from the same engine computation that's already cached.
- Each tab remembers its scroll position and drill-down state within the session.
- On mobile/narrow viewports (below 1024px), tabs convert to a dropdown selector.

**Relationship to existing modes:**

- In **Forms** and **Planning Assistant** modes, Financial Statements is a separate view. The user navigates away from the input panel to see statements, then navigates back to edit.
- In **Quick Entry** mode, Financial Statements ARE the input interface (see F2: Input-Output Integration below). The tab container becomes the workspace — inputs and outputs coexist in the same tables.

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

### Quick Entry IS the Financial Statement

**Design principle (from Brainstorming Feb 15, Gap #21):** "Jordan works inside P&L / Balance Sheet / Cash Flow as interactive documents with editable input cells and live-computed output cells."

In Quick Entry mode, the financial statement views ARE the input interface. This is the single most important design decision in this spec.

#### How It Works

Every cell in a financial statement table is one of two types:

1. **Input cells** — values that the user controls (revenue growth rate, COGS %, rent, staffing count, etc.). These are editable inline.
2. **Computed cells** — values calculated by the engine (gross profit, EBITDA, net income, total assets, etc.). These are read-only.

**Visual distinction between input and computed cells:**

| Cell Type | Background | Text Style | Interaction |
|-----------|-----------|------------|-------------|
| Input (editable) | Subtle tinted background (e.g., very faint primary/5 tint) | Regular weight | Click to edit inline; Tab navigates between input cells |
| Computed (read-only) | Standard background | Medium weight | Hover shows tooltip with formula/derivation; not editable |
| Section header/total | Slightly elevated background | Bold weight | Not editable; shows sum of child rows |

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

In this view, Maria tabs through the `[edit]` cells at spreadsheet speed, and every computed cell updates as she goes. She's not "viewing a P&L and editing inputs somewhere else" — she's editing INSIDE the P&L.

**Mode-specific behavior of the same Financial Statements view:**

| Mode | Financial Statements Behavior |
|------|------------------------------|
| Planning Assistant | Read-only view. AI conversation drives input changes; statement view shows results. |
| Forms | Read-only view. User edits in the Forms input panel; statement view shows results. |
| Quick Entry | Interactive view. Input cells are editable inline. This IS the primary input interface. |

**The existing Quick Entry grid (from Epic 4) transforms:**

The current Quick Entry grid shows a flat list of ~19 input fields in a TanStack Table. With this spec, Quick Entry mode replaces that flat grid with the financial statement tabs themselves. The P&L tab becomes the primary input surface for P&L-related inputs. The Balance Sheet tab becomes the input surface for balance sheet inputs (working capital days, financing terms). Each statement tab exposes only the inputs relevant to that statement.

This means the current `quick-entry-mode.tsx` component evolves from a standalone grid into a controller that renders the financial statement tabs with inline editing enabled. The component reuse pattern from Epic 4 (shared field metadata, shared auto-save hook) continues — the rendering container changes, not the data layer.

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
  - **Quick Scenarios:** "Conservative (-15%)" and "Optimistic (+15%)" — auto-generated by applying a revenue sensitivity factor to the base case. These require zero configuration.
  - **Custom Scenario:** "Create Custom Scenario" — lets the user duplicate the base case and modify specific inputs. (Implementation deferred to Epic 10, but the UI slot exists now.)

#### Comparison View

When the user activates comparison, the statement view transforms:

**Side-by-side columns:**

Each year column splits into sub-columns for each active scenario:

```
                    Year 1                      Year 2
              Base    Cons    Opt         Base    Cons    Opt
Revenue      $360K   $306K   $414K      $396K   $336K   $455K
COGS         $108K   $91.8K  $124K      $118K   $100K   $136K
...
Pre-Tax      $42K    $12K    $72K       $58K    $24K    $92K
```

- Scenario columns are color-coded: Base (neutral), Conservative (muted/warm), Optimistic (muted/cool).
- The "worst case" column highlights the bottom-line metric with contextual interpretation (see F4).
- Comparison mode works with the progressive disclosure layers — users can compare at annual, quarterly, or monthly granularity.

**Comparison summary card:**

Above the table, a summary card distills the comparison into one sentence:

> "Even in the conservative scenario, your business reaches break-even by Month 18 and generates $12,000 in pre-tax income in Year 1. Your base case projects $42,000."

This is the conviction moment. The card is the first thing Sam reads, and it answers "does this work even if things go wrong?"

#### Where Scenarios Live in the Data Model

- Scenarios are stored as variations on the plan's `financial_inputs` JSONB.
- The base case IS the plan's current inputs.
- Quick scenarios are computed client-side by applying a multiplier to revenue assumptions — they don't persist unless the user saves them.
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
- In Quick Entry mode, interpretations update in real time as input cells are edited.

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

Each indicator uses the following color system:

| Color | Meaning | Example |
|-------|---------|---------|
| Green (success token) | Metric is healthy | Break-even within 18 months; positive 5yr ROI; cash never goes negative |
| Amber/Yellow (warning token) | Metric needs attention | Break-even between 18-30 months; 5yr ROI below 50%; cash goes negative briefly |
| Gurple (info/advisory token) | Metric is concerning but not critical | Break-even beyond 30 months; negative 5yr ROI; extended negative cash periods |

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
- The Guardian updates in real time as inputs change — in Quick Entry mode, editing a cell immediately reflects in the Guardian.

**[F5]**

---

## Part 7: Document Preview — Progressive Pride

### The Plan Takes Shape as You Work

**Design principle (from UX Spec, Sam's emotional arc):** "A live document preview is visible during planning, building pride progressively rather than delivering it as a surprise at the end."

#### Document Preview Panel

A **Document Preview** option is available as a toggle in the Financial Statements view. When activated, a collapsible right-side panel (or bottom panel on narrower screens) shows a miniature rendering of the lender-ready document:

```
┌─────────────────────────────────────────────────────────────────┐
│  [Financial Statement Tabs]                 [📄 Preview ▾]     │
│                                                                 │
│  ┌──────────────────────┐  ┌──────────────────────────────┐    │
│  │                      │  │  Sam's PostNet Business Plan  │    │
│  │  Interactive P&L     │  │  ─────────────────────────── │    │
│  │  (full-size,         │  │  P&L Statement               │    │
│  │   editable in QE)    │  │  Year 1    Year 2    Year 3  │    │
│  │                      │  │  Revenue   $360K    $396K    │    │
│  │                      │  │  ...                         │    │
│  │                      │  │                              │    │
│  │                      │  │  Page 1 of 8                 │    │
│  └──────────────────────┘  └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

**Preview behavior:**

- The preview shows the current financial statements formatted as they would appear in the PDF — professional layout, page numbers, headers with "Sam's PostNet Plan," FTC disclaimers.
- The preview updates in real time as inputs change.
- The preview is a READ-ONLY miniature — not editable. Editing happens in the main panel.
- A "Generate PDF" button appears at the bottom of the preview panel. This becomes progressively more prominent as the plan reaches completeness.
- The preview panel is **collapsed by default** (shown as a slim sidebar icon) to not overwhelm first-time users. It's discoverable but not intrusive.

**The emotional design:**

- When Sam first opens the preview, he sees his name on a professional-looking financial document. That's the pride moment.
- As he works through inputs (in any mode), the preview's numbers update. The document gets more complete and more real.
- The "Generate PDF" button's label evolves with completeness:
  - At < 50% completeness: "Generate Draft Package"
  - At 50-90%: "Generate Package"
  - At > 90%: "Generate Lender Package" (with a subtle checkmark or completion indicator)

**[F6]**

---

## Part 8: Statement-Specific Design Details

### 8.1 Summary Financials (Landing Tab)

The Summary tab is the DEFAULT tab when the user opens Financial Statements. It provides the annual overview that Sam needs and the quick reference that Maria wants.

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

**In Quick Entry mode:** Revenue, COGS %, Direct Labor %, Management Salaries, Facilities, Marketing, Other OpEx %, and other input fields are editable inline. Gross Profit, EBITDA, Pre-Tax Income, and all analysis rows are computed and read-only.

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

**Input cells (Quick Entry):** AR Days, AP Days, Inventory Days, Tax Payment Delay are the primary inputs that drive balance sheet line items. These appear as editable cells in the relevant rows.

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

**Negative cash highlighting:** Any month where Ending Cash is negative gets a subtle warm background tint (not destructive red — this is advisory, not an error). The Guardian Bar's "Cash" indicator reflects this.

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
| ≥ 1280px | Full experience. Statement tabs + preview panel side by side. All columns visible without horizontal scroll. |
| 1024-1279px | Full experience but preview panel collapsed by default. Horizontal scroll may appear for quarterly/monthly drill-down. |
| 768-1023px | Simplified experience. Tab navigation converts to dropdown. Annual view only (no drill-down to quarterly/monthly). Scenario comparison shows one scenario at a time with a selector. Guardian Bar collapses to a single summary indicator. |
| < 768px | **"View on Desktop" message.** Financial statements are not rendered on mobile. A friendly message: "Financial statements are best viewed on a larger screen. Your plan data is safe — open this page on your computer or tablet to see the full view." The Summary tab's key metrics callout bar IS shown on mobile as a read-only summary card — so mobile users can still see headline numbers. |

**Justification for no mobile financial statements:** The reference spreadsheet has 60 columns and 30+ rows per statement. Even the annual summary view has 5 data columns plus labels, section headers, and interpretation rows. Attempting to fit this on a 375px screen would produce an unusable experience. Showing headline metrics on mobile preserves informational access without degrading the experience.

---

## Part 10: Component Architecture

### Preventing Mega-Components

The Epic 4 retrospective flagged `forms-mode.tsx` (536 lines) and `quick-entry-mode.tsx` (571 lines) as growing concerns. Financial statement views are MORE complex. The component architecture must prevent 1000+ line files.

**Component hierarchy:**

```
<FinancialStatements>                    (container, tab routing, ~100 lines)
├── <GuardianBar />                      (persistent health indicators, ~80 lines)
├── <ScenarioBar />                      (scenario selector/comparison toggle, ~60 lines)
├── <StatementTab statement="summary">   (tab content router, ~50 lines)
│   ├── <CalloutBar metrics={...} />     (key metrics summary, ~60 lines)
│   ├── <StatementSection title="P&L Summary">
│   │   └── <StatementTable rows={...} columns={...} />
│   ├── <StatementSection title="Balance Sheet Summary">
│   │   └── <StatementTable rows={...} columns={...} />
│   └── ...
├── <StatementTab statement="pnl">
│   ├── <CalloutBar />
│   └── <StatementTable
│           rows={pnlRows}
│           columns={yearColumns}
│           drillDown={true}              (enables progressive disclosure)
│           editable={mode === 'quick-entry'}  (enables F2 input-output integration)
│           interpretations={pnlInterpretations}  (enables F4 "so what" layer)
│       />
├── ...
└── <DocumentPreview />                  (collapsible preview panel, ~120 lines)
```

**Key shared components:**

| Component | Responsibility | Reuse |
|-----------|---------------|-------|
| `<StatementTable>` | Renders rows × columns with progressive disclosure, inline editing, sticky headers/labels, and interpretation rows | Used by every statement tab |
| `<CalloutBar>` | Renders 2-3 key metrics with dynamic interpretation text | Used by every statement tab |
| `<GuardianBar>` | Renders persistent health indicators with navigation links | Used once, always visible |
| `<ScenarioBar>` | Renders scenario selector and comparison toggle | Used once, always visible |
| `<InterpretationRow>` | Renders contextual "so what" text below a data row | Used within `<StatementTable>` |
| `<EditableCell>` | Inline editing for input cells (reuse from Epic 4) | Used within `<StatementTable>` in Quick Entry mode |
| `<DocumentPreview>` | Miniature PDF-style rendering of the plan | Used once, collapsible |

**Target file sizes:** No single component file should exceed 300 lines. The `<StatementTable>` component is the most complex and should be the focus of architectural attention — it handles progressive disclosure, inline editing, sticky positioning, and interpretation rows.

---

## Part 11: Glossary & Help Integration

### Contextual Education, Not a Reference Manual

The Glossary (Story 5.8) and Help Content (Story 5.10) from the Sprint Change Proposal integrate into the financial statement experience as follows:

**Glossary access:**
- Sidebar navigation item: "Glossary" — opens a searchable list of financial terms with definitions.
- Inline access: Every computed cell tooltip includes a "Learn more" link that opens the Glossary entry for that term.
- Terms used in interpretation rows are hyperlinked to their Glossary definitions.

**Help content on input fields:**
- In Quick Entry mode (where inputs are inline in statements), hovering an input cell shows the field's help tooltip.
- On focus (when editing), an expanded help panel slides in below the cell or in a sidebar, showing the full guidance text.
- Help content includes both the consolidated-field help (from spreadsheet comments) and the decomposed sub-field help (newly authored for Forms mode).

---

## Part 12: User Journey Tracing

### From Login to Conviction (the retrospective's missing piece)

This section traces the complete user path for each persona through the financial statement experience, ensuring no component mount or navigation link is missing.

#### Sam's Journey (First-Time Franchisee → Planning Assistant / Forms)

1. **Login** → Dashboard (existing)
2. **Quick Start** → 5 questions → preliminary metrics (existing)
3. **Forms mode** → edits inputs by category (existing)
4. **Clicks "Financial Statements"** in sidebar → Summary tab opens
5. **Sees callout bar:** "Your 5-year total pre-tax income: $142,000. Break-even: Month 14 (February 2027)."
6. **Sees Guardian Bar:** all three indicators green
7. **Scrolls through Summary sections** — annual P&L, balance sheet, cash flow summaries
8. **Clicks "View Full P&L"** → P&L tab opens (read-only in Forms mode)
9. **Sees interpretation row:** "Pre-tax margin 11.7% — within PostNet typical range"
10. **Hovers a computed cell** → tooltip explains "Gross Profit = Revenue - COGS"
11. **Clicks "Compare Scenarios"** → Conservative/Optimistic columns appear
12. **Reads comparison summary:** "Even in the conservative scenario, you reach break-even by Month 18"
13. **Opens Document Preview** → sees "Sam's PostNet Business Plan" with professional formatting
14. **Clicks "Generate Lender Package"** → PDF downloads

**Every step has a component. Every transition has a navigation path. No dead ends.**

#### Maria's Journey (Veteran → Quick Entry)

1. **Login** → Dashboard (existing)
2. **Quick Entry mode** (her default) → Financial Statements tabs appear as the workspace
3. **P&L tab active** — input cells are editable inline
4. **Tabs through input cells** at spreadsheet speed — revenue, COGS %, labor %, facilities, etc.
5. **Guardian Bar updates** in real time as she enters values
6. **Drills into Year 2 quarterly view** to set seasonal revenue variation
7. **Switches to Balance Sheet tab** — enters working capital days (AR, AP, Inventory)
8. **Switches to Cash Flow tab** — reviews computed cash flows, checks for negative months
9. **Opens Scenario Comparison** — confirms conservative case works
10. **Generates PDF** — done in 15 minutes

**Every step is within the financial statement tabs. No mode switching. No navigating away.**

#### Chris's Journey (Scaling Operator → Forms)

1. **Login** → sees plan list with Location #1 and Location #2 (requires multi-plan from Epic 7)
2. **Opens Location #2 plan** → Forms mode
3. **Edits inputs** in Forms mode, overriding defaults with experience-informed values
4. **Clicks "Financial Statements"** → Summary tab
5. **Drills into P&L** → expands Year 1 to quarterly to see seasonal ramp-up
6. **Sees interpretation:** "Your Year 1 labor cost of 28% is 3 points lower than your Location #1 plan" (requires multi-plan comparison, deferred)
7. **Compare Scenarios** → sees that even with conservative revenue, Location #2 is stronger than Location #1 was
8. **Generates PDF** for lender meeting

---

## Part 13: What This Spec Does NOT Cover

These items are explicitly out of scope for Epic 5's UX spec and belong to later epics:

| Item | Deferred To | Reason |
|------|-------------|--------|
| Custom scenario creation (duplicate base case, modify inputs) | Epic 10 | Scope — quick scenarios (±15%) are sufficient for Epic 5 |
| Per-year input columns in Forms mode | Epic 7 | Dependency — per-year UI needs PlanFinancialInputs restructuring |
| Multi-plan comparison | Epic 7 | Dependency — requires plan CRUD + navigation |
| Planning Assistant mode interaction with statements | Epic 9 | Dependency — requires AI integration |
| Advisory nudges on individual input fields | Epic 8 | Scope — Guardian Bar provides plan-level advisory; field-level is Epic 8 |
| Excel/CSV export | Backlog | Lower priority than PDF |
| Estimated vs. actual tracking | Phase 2 | PRD Phase 2 scope |

---

## Part 14: Story Rewrite Implications

This UX spec requires the Sprint Change Proposal's Epic 5 stories to be rewritten. The current stories (5.1-5.10) are data-table specifications. The rewritten stories should reflect the experience design:

| Current Story | Rewrite Direction |
|--------------|-------------------|
| 5.1: P&L View | Merge with progressive disclosure pattern — P&L with annual/quarterly/monthly drill-down, interpretation rows, sticky headers |
| 5.2: Balance Sheet View | Same drill-down pattern, audit check inline |
| 5.3: Cash Flow View | Same pattern, negative cash highlighting, Guardian integration |
| 5.4: Summary Financials | Becomes the LANDING TAB with callout bars, section links to detail tabs, break-even analysis |
| 5.5: ROIC View | Annual-only, callout bar with plain-language ROIC interpretation |
| 5.6: Valuation View | Annual-only, editable EBITDA multiple |
| 5.7: Audit View | Diagnostic view with navigation links to failing rows |
| 5.8: Glossary | Standalone page + inline integration (tooltips link to glossary) |
| 5.9: Quick Entry Interactive | NO LONGER A SEPARATE STORY — integrated into every statement view via the editable cell pattern when mode === quick-entry |
| 5.10: Help Content | Integrated into field tooltips and expanded help panels |

**Recommended new story structure:**

1. **5.1: Engine Extension** — Add missing computations (Valuation, extended ROIC, extended Audit, Balance Sheet/Cash Flow disaggregation). No UI.
2. **5.2: Financial Statements Container + Summary Tab** — Tab navigation, Guardian Bar, Scenario Bar, Summary Financials landing tab with callout bars and section links. Progressive disclosure infrastructure (annual → quarterly → monthly).
3. **5.3: P&L Statement Tab** — Full P&L with drill-down, interpretation rows, input cell highlighting (for Quick Entry preparation).
4. **5.4: Balance Sheet + Cash Flow Tabs** — Built together (tightly coupled through LOC and tax payable mechanics — per Winston's recommendation).
5. **5.5: ROIC + Valuation + Audit Tabs** — Three simpler views, annual-only, built together.
6. **5.6: Quick Entry Input-Output Integration** — Enable inline editing in all statement tabs when mode === quick-entry. Reuse EditableCell from Epic 4. Tab navigation across input cells.
7. **5.7: Scenario Comparison** — Quick scenarios (±15% revenue), comparison columns, comparison summary card.
8. **5.8: Guardian Bar + Dynamic Interpretation** — ROI Threshold Guardian, row-level interpretation with brand benchmarks, callout bar content.
9. **5.9: Document Preview + Glossary** — Collapsible preview panel, glossary page, inline help integration.
10. **5.10: Contextual Help Content** — Tooltip text for all fields, expanded help panels, video content extraction.

This rewrite sequence addresses all six foundation points and follows the retrospective lesson: design the experience first, then build it.

---

## Approval

**Status:** Draft — Awaiting Party Mode Review and User Approval
**Author:** Sally (UX Designer)
**Date:** 2026-02-15
