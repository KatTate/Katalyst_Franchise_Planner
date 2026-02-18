---
date: 2026-02-18
author: Sally (UX Designer), consolidated by Party Mode (Sally, Paige, Winston, Bob)
project_name: Katalyst Growth Planner
status: Consolidated — Single Source of Truth
supersedes:
  - ux-design-specification.md (2026-02-08)
  - ux-financial-statements-spec.md (2026-02-16)
inputDocuments:
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/planning-artifacts/ux-financial-statements-spec.md
  - _bmad-output/planning-artifacts/tech-spec-5.2-progressive-disclosure-gaps.md
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
---

# UX Design Specification — Katalyst Growth Planner (Consolidated)

**Author:** Sally (UX Designer)
**Date:** 2026-02-18
**Status:** Consolidated — Single Source of Truth
**Supersedes:** `ux-design-specification.md` (2026-02-08), `ux-financial-statements-spec.md` (2026-02-16)

---

## Part 1: Project Vision + White-Label Strategy

### Project Vision

The Katalyst Growth Planner is a franchise location planning platform that transforms the overwhelming process of opening a new franchise location into a guided, empowering journey. It serves three stakeholders from a single data layer (the "throuple problem"): the franchisee as primary user and plan author, the franchisor as pipeline visibility buyer, and Katalyst as operational intelligence beneficiary.

The UX accomplishes something unusual: it makes a complex financial planning tool feel approachable to a first-time business owner while simultaneously satisfying a 27-location veteran who wants speed and no hand-holding. Two primary interaction surfaces — **My Plan** (structured forms with AI planning assistant) and **Reports** (interactive financial statements with inline editing) — solve this by presenting different interaction paradigms that all write to the same underlying financial input state. Both surfaces are accessible via sidebar navigation; there are no "modes" to switch between.

### White-Label Theming Strategy

**Approach: Branded Shell with Prominent Katalyst Identity**

The platform uses a "branded shell" approach that leans more toward Katalyst visibility than a pure white-label:

- **Katalyst owns:** Design system foundation (Montserrat/Roboto typography, spacing scale, component patterns, color governance, interaction patterns, data visualization style). The structural "feel" of the product is unmistakably Katalyst across all brand deployments.
- **Brand owns:** Primary accent color (replaces Katalyst Green in interactive elements), logo in the header, brand name in contextual copy (e.g., "PostNet benchmarks"), startup cost template categories.
- **Shared space:** Login/onboarding carries the brand identity prominently with a clear "Powered by Katalyst" mark. The sidebar, footer, and "about" sections maintain Katalyst branding. Katalyst's design system personality (rounded cards, 2px borders, the "Gurple" info pattern, segmented controls, warm neutrals) is constant — a multi-unit franchisee working across brands will immediately recognize "this is a Katalyst tool" even though it's branded for PostNet vs. Jeremiah's.
- **Strategic rationale:** Multi-unit franchisees who cross brand boundaries are the organic evangelism channel. The UX must be similar enough across brand deployments that they recognize the platform, while different enough (brand accent, logo, brand-specific copy) that the franchisor feels ownership.

**Brand Theming Mechanism: Override `--primary` with Katalyst Escape Hatch**

Brand theming works by overriding `--primary` (and its foreground counterpart) at runtime when a brand context loads. All existing shadcn/ui components reference `--primary` and automatically adopt the brand's accent color with zero component modifications.

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
    └── NOTE: Dark mode DEFERRED to post-MVP
```

**Brand theming is applied at runtime** by setting `--primary` and `--primary-foreground` on the root element when a brand context is loaded. This means:
- A PostNet deployment overrides `--primary` to PostNet blue
- A Tint World deployment overrides `--primary` to Tint World red
- The Katalyst design system (component shapes, typography, spacing, interaction patterns, the "Gurple" info pattern) remains constant
- The "Powered by Katalyst" badge always uses `--katalyst-brand` (Katalyst Green)

**The Recognition Test (Testable Checklist):**

The recognition test passes when the **only** visual differences between two brand deployments are:

1. The accent color of interactive elements (buttons, links, active states, progress indicators)
2. The logo in the sidebar header
3. Brand-specific copy (brand name, benchmark references, startup cost categories)

Everything else — typography, component shapes, spacing, interaction behavior, layout structure, the "Gurple" info pattern, the "Powered by Katalyst" badge, data visualization style — must be **pixel-identical** across brand deployments. This is a verifiable checklist, not an aspiration.

**Dark Mode: Deferred to Post-MVP**

The token architecture fully supports dark mode via the `.dark` class structure — dark-mode values can be added to every foundation token without refactoring. However, dark mode implementation is **deferred to post-MVP** because:

- Financial planning tools are primarily used in well-lit environments (offices, bank meetings, kitchen tables). Dark mode is a preference, not a requirement.
- Implementing dark mode doubles the visual testing matrix.
- The token architecture means adding dark mode later requires only filling in `.dark` token values and testing — zero component changes, zero layout changes.

---

## Part 2: Personas

### Persona A: Sam (First-Time Franchisee) — Primary surface: My Plan

- Age 30-45, former corporate manager, purchased first franchise unit
- Excited but anxious, overwhelmed by FDD and financial complexity
- Needs structure, education at every step, confidence to walk into a bank
- Tech-competent but new to franchising mechanics
- Will use the product with their Katalyst account manager in guided sessions
- **Primary interaction:** My Plan structured forms + AI Planning Assistant for conversational guidance
- **Secondary interaction:** Reviews Reports to see projections, generates lender documents

### Persona B: Maria (Portfolio Operator) — Primary surface: Reports

- Age 40-60, owns 7+ locations, financially sophisticated
- Pragmatic, speed-focused, intolerant of wasted time
- Expects spreadsheet-level input speed and portfolio-level visibility
- Will rip through a plan in 15 minutes, doesn't want tooltips or education
- **Primary interaction:** Reports with inline editing — tabs through editable input cells at spreadsheet speed across P&L, Balance Sheet, Cash Flow
- **Secondary interaction:** Rarely uses My Plan; goes directly to Reports from sidebar

### Persona C: Chris (Scaling Operator) — Primary surface: My Plan + Reports

- Age 30-50, has 1-3 locations, learning to systematize
- Ambitious and stretched, confident but nervous about replication
- Needs the ability to compare against prior location actuals
- Wants education available on demand, not forced
- **Primary interaction:** My Plan for structured input, navigates to Reports via Impact Strip deep links to review projections
- **Secondary interaction:** Uses scenario comparison to build conviction; occasional inline edits in Reports

**Secondary users:** Katalyst account managers (brand setup, client guidance), franchisor development teams (pipeline dashboards), Katalyst admins (cross-brand intelligence).

### User Mental Models

| From | To | Mechanism |
|------|----|-----------|
| "Someone tells me the numbers" (Sam) | "I understand and own my numbers" | AI Planning Assistant conversation extracts Sam's knowledge; the AI doesn't tell him the answers — it helps him discover them |
| "I need a spreadsheet" (Maria) | "I need a planning system" | Reports inline editing matches spreadsheet speed; scenario comparison and document generation exceed spreadsheet capability |
| "I'm guessing" (Chris) | "I'm improving" | Location #1 actuals visible during Location #2 planning; quantified tightening of assumptions |

---

## Part 3: Experience Principles

These five principles guide every UX decision in the Katalyst Growth Planner:

1. **You are the author.** The franchisee owns their plan. Every number is editable. AI suggests, brand defaults seed, but the franchisee decides. The plan is titled with the franchisee's name before the brand name ("Sam's PostNet Plan"), and every generated document carries the franchisee as the author. This directly supports FTC compliance positioning and is the emotional core of the product.

2. **Show the impact in their language.** When Sam changes a number, show what it means for the business in terms Sam understands — not just "Break-even: Month 14" but "You'd start making money by February 2027." Dates are real; month numbers are abstract. The AI Planning Assistant translates financial metrics into business timeline language. In Reports, Maria sees the finance-native metrics she prefers. The principle adapts per persona: Sam gets business language, Maria gets finance language, Chris gets a blend.

3. **Progressive confidence, not progressive complexity.** The UX arc matches Sam's emotional arc: Quick ROI (hope) -> guided planning (understanding) -> Scenario comparison (conviction) -> Document generation (professional confidence) -> Post-opening actuals (operational mastery). Each stage should feel like a step up in competence, not a step up in difficulty.

4. **Same data, different lens.** My Plan and Reports are two interaction surfaces over the same **financial input state**. Navigating between them is like switching between a paragraph view and an outline view of the same document. The visual language reinforces this: same color scheme, same summary cards, same field names, different interaction density. **Boundary:** Financial input state is shared across both surfaces. Surface-specific interaction state (form section expansion in My Plan, column drill-down state in Reports, scroll position) belongs to each surface individually.

5. **Trust through transparency.** Every AI-populated value shows its source. Every brand default is labeled and resettable. Save state is always visible. Item 7 ranges are always accessible. The tool earns trust by never hiding how it works or where a number came from.

---

## Part 4: Emotional Design + Failure States

### Primary Emotional Goals

| Persona | Primary Emotion | The Moment It Peaks | What They'd Say |
|---------|----------------|---------------------|-----------------|
| **Sam** (first-timer) | **Confident competence** — "I understand my own business plan" | Downloading the lender-ready PDF and realizing he can explain every number in it | "I actually feel ready for this meeting." |
| **Maria** (veteran) | **Efficient mastery** — "This tool respects my time and expertise" | Finishing a full plan in 15 minutes with zero friction | "Finally, something that doesn't slow me down." |
| **Chris** (scaling) | **Informed control** — "I'm smarter this time because I can see what happened last time" | Comparing Location #1 actuals against Location #2 projections and seeing tighter assumptions | "I'm not guessing anymore." |

**Shared emotional goal across all personas:** **Authorship.** The franchisee should feel like the author of their plan, not the consumer of someone else's model.

### Sam's Emotional Arc (the "Confidence Pack")

| Stage | Emotional State | UX Design Response |
|-------|----------------|-------------------|
| **Pre-entry** (kitchen table, 9 PM) | Anxious, overwhelmed, imposter syndrome | The invitation email and Quick ROI entry feel warm, simple, low-commitment. No financial jargon in the first interaction. |
| **Quick ROI** (first 90 seconds) | Cautious hope — "Maybe this is manageable" | A clear, positive-but-honest result with brand context. The sentiment frame ("healthy range") provides relief without overpromising. Warm visual tone. |
| **AI Planning Assistant Session 1** (with account manager) | Growing understanding — "I'm learning my own numbers" | The AI conversation is patient, explains context, never rushes. Every AI-populated field is visible and editable. The Impact Strip updates feel like magic, not pressure. |
| **Startup Cost Builder** | Surprised capability — "I didn't even think about insurance deposits" | Progressive revelation of cost categories builds competence. Item 7 ranges provide guardrails without judgment. "Reset to default" removes fear. |
| **Scenario Comparison** | Conviction — "Even the worst case works" | Three scenarios rendered side-by-side. The conservative case showing positive ROI is the emotional turning point. |
| **Document Generation** | Professional pride — "This looks like a real business plan" | The PDF is visually polished, clearly formatted, and carries Sam's name as the author. The Dashboard Document Preview widget shows progressive pride — Sam sees his plan taking professional shape while still editing. |
| **Bank Meeting** | Earned confidence — "I can explain every number" | (Outside the product.) Sam knows his numbers because he built them, not because they were handed to him. |
| **Post-opening actuals** | Operational ownership — "My plan is alive" | Updating estimates with actuals feels like maintaining a living document, not revisiting a dead one. |

### Maria's Emotional Arc (Speed & Respect)

| Stage | Emotional State | UX Design Response |
|-------|----------------|-------------------|
| **Login** | Impatient efficiency — "Let me work" | Reports is one sidebar click away. No onboarding, no tooltips, no tutorial overlays. |
| **Input entry** | Flow state — "This moves at my speed" | Tab-through navigation across P&L input cells, instant recalculation, no confirmation dialogs. The interface disappears and the numbers remain. |
| **Scenario modeling** | Analytical satisfaction — "I see the levers" | Sensitivity analysis reveals which variables matter most. Maria finds insights, not just outputs. |
| **Multi-plan generation** | Portfolio command — "All my locations, one afternoon" | Generating packages for locations #8, #9, #10 in sequence feels like a production run, not three separate tasks. |

### Chris's Emotional Arc (Smarter This Time)

| Stage | Emotional State | UX Design Response |
|-------|----------------|-------------------|
| **Location #2 start** | Determined improvement — "I know what went wrong last time" | Location #1 actuals are visible and referenceable during Location #2 planning. The system acknowledges her history. |
| **Startup cost review** | Sharp competence — "I've done this before, I know the real numbers" | Pre-filled defaults that Chris immediately overrides with confidence, informed by experience. |
| **Side-by-side comparison** | Measurable growth — "12% tighter assumptions" | Quantified improvement over Location #1 validates that Chris is genuinely better at this now. |

### Failure State Emotional Design

**Scenario 1: The plan genuinely doesn't work (negative ROI)**

When Sam enters his real numbers and the conservative case shows negative ROI, the tool must not simply display bad numbers and leave Sam to draw conclusions:

- **Never say "this won't work."** Instead: "At these numbers, the break-even timeline extends beyond 36 months. Here are the inputs with the most impact on that timeline."
- **Surface actionable levers.** Highlight the 3-4 inputs that most affect ROI (typically rent, initial investment, revenue assumptions) and show what values would bring the plan into positive territory.
- **Distinguish location from franchise.** Guide Sam toward "this specific location may not be the best fit" rather than "franchising isn't for you."
- **Support the advisor conversation.** When Sam's account manager is on the call, the data provides an objective foundation for a difficult conversation.

**Scenario 2: The AI says something wrong**

When the AI Planning Assistant extracts a wrong number from conversation (Sam said "forty-two hundred" and the AI populated $42,000):

- **Inline correction.** The field is immediately editable. One click, fix the number, metrics update. No modal, no confirmation.
- **No trust penalty.** One wrong extraction shouldn't undermine confidence in the entire system. The AI acknowledges naturally: "Got it, updated to $4,200."
- **The correction pattern is: correct the field, not report a bug.** The UX treats AI extraction like autocomplete, not like a gatekeeper.

**Scenario 3: The advisor disagrees with the franchisee's numbers**

When Sam's account manager Denise thinks Sam's revenue estimate is too optimistic:

- **The plan is Sam's.** Denise can suggest, but Sam decides. The UX never prevents Sam from entering any value.
- **Scenario comparison is the resolution tool.** Instead of arguing about which revenue number is "right," create scenarios: Sam's estimate, Denise's estimate, and the brand average. Let the projections speak.
- **The advisor role is facilitative, not authoritative.** The AI Planning Assistant mirrors this — it asks questions and surfaces implications, never overrides.

### Brand Voice in UI Copy

**Voice:** Vibrant, Quick-witted, Authentic (from Katalyst brand guidelines).

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

**Tone Boundaries:**

| Katalyst IS | Katalyst is SOMETIMES | Katalyst is NEVER |
|-------------|----------------------|-------------------|
| Encouraging | Challenging (when numbers don't work) | Judgmental about financial choices |
| Clear | Serious (when discussing real money) | Dismissive of user's situation |
| Warm | Direct (when advisory guardrails trigger) | Condescending about financial literacy |

---

## Part 5: Platform Strategy

- **Desktop-first, web-only.** Minimum viewport: 1024px. This is a financial planning tool used in meetings and at desks, not on phones in the field.
- **Mouse/keyboard primary interaction.** Tab-through support in Reports inline editing is critical for Maria's speed. Form fields must support keyboard navigation throughout.
- **No offline requirement.** Users plan during sessions (often with their Katalyst account manager on a call). Always-connected is acceptable.
- **Responsive behavior (below 1024px):** Financial statement tabs convert to a dropdown selector. Impact Strip becomes a read-only summary card. AI Planning Assistant panel becomes full-screen overlay. Layout stacks vertically. See Part 17 (Accessibility) for details.

### Critical Success Moments

1. **Quick ROI result (first 90 seconds).** Sam enters 5 numbers, sees a preliminary ROI range. The result includes a contextual sentiment frame — "Typical PostNet returns range from 8-25%. Your preliminary estimate of 12-18% falls in the healthy range." If this feels slow, complicated, or produces a confusing number without context, Sam bounces.

2. **First AI-populated field.** Sam tells the AI Planning Assistant about his rent, and the financial input populates without him touching a form. This is the moment the AI proves its value — "I'm having a conversation, and my plan is building itself."

3. **Document download.** Sam clicks "Generate Package" and gets a PDF that looks like it was prepared by a financial consultant. Professional formatting, consistent numbers, FTC-compliant disclaimers. The plan header reads **"Sam's PostNet Plan"** — not "PostNet Financial Model."

4. **Estimated vs. actual comparison.** Chris opens her Location #2 plan next to her Location #1 actuals and sees exactly where reality diverged from the plan. The tool proves it's not a one-time calculator — it's an operational system.

5. **Three-scenario side-by-side.** Good/Better/Best scenarios rendered together, showing Sam that even in the conservative case, the business works. This is the conviction moment that precedes the bank visit.

### Effortless Interactions

1. **Auto-save is invisible.** The plan saves continuously. There is no "Save" button. A subtle status indicator ("All changes saved" / "Saving...") exists in the chrome but never demands attention.

2. **Brand defaults pre-fill everything.** When Sam starts a plan, every field already has a PostNet default value. He's not staring at empty fields — he's reviewing and adjusting numbers that are already reasonable.

3. **Navigation preserves financial state.** If Sam enters values in My Plan, then navigates to Reports to review, all values are present. If he edits a cell inline in Reports, then navigates back to My Plan — the form reflects the change. One plan state, two interaction surfaces.

4. **Reset to default is per-field and reversible.** Every field Sam has edited shows a subtle "reset" affordance. One click restores the brand default.

5. **Consultant booking is ever-present but non-intrusive.** A persistent "Talk to [Manager Name]" element in the sidebar Help section is always reachable without cluttering the planning workspace.

---

## Part 6: Design System + Visual Design Foundation

### Color System

**Three-Layer Color Architecture:**

**Layer 1: Semantic Core (meaning-reserved)**

| Token | Hex | Role |
|-------|-----|------|
| **Katalyst Green** | `#78BF26` | Primary brand + success states. Overridden per brand via `--primary`. `--katalyst-brand` escape hatch preserves this for "Powered by Katalyst" elements. |
| **Standard Red** | `#EF4444` | Actual errors only — missing required fields, system failures, validation errors. NEVER used for advisory guardrails. |
| **Warning Yellow** | `#E1D660` | Caution states — approaching Item 7 boundaries, pending save states. Used sparingly. |

**Layer 2: Functional Neutrals (structure and hierarchy)**

| Token | Hex | Role | Text Hierarchy Level |
|-------|-----|------|---------------------|
| **Black** | `#3D3936` | Headlines, section headers, KPI values | Primary |
| **Charcoal** | `#50534C` | Body text, labels, form content | Secondary |
| **Gauntlet** | `#8C898C` | Muted text, placeholders, disabled states | Tertiary |
| **Gray** | `#D0D1DB` | Borders, dividers, input borders | Structural |
| **Gray Light** | `#F5F6F8` | Page backgrounds | Surface |
| **White** | `#FFFFFF` | Cards, elevated surfaces, modals, inputs | Surface |

**Layer 3: Categorical Accents**

| Token | Hex | Usage |
|-------|-----|-------|
| **Mystical ("Gurple")** | `#A9A2AA` | Advisory color — Guardian suggestions, Item 7 ranges, AI confidence markers, informational panels |
| **Edamame Sage** | `#96A487` | Target/goal states — positive scenario outcomes, break-even achieved |
| **Basque** | `#676F13` | Historical/comparison data — Location #1 actuals when comparing |
| **Wheat** | `#DDCDAE` | People/personal — account manager references, franchisee attribution |
| **Zeus** | `#A6A091` | Neutral category — default chart series |

**Katalyst -> shadcn/ui Token Translation Table:**

| shadcn/ui Token | Katalyst Token | Hex Value |
|----------------|---------------|-----------|
| `--background` | Gray Light | `#F5F6F8` |
| `--foreground` | Black | `#3D3936` |
| `--card` | White | `#FFFFFF` |
| `--card-foreground` | Black | `#3D3936` |
| `--primary` | Katalyst Green | `#78BF26` |
| `--primary-foreground` | White | `#FFFFFF` |
| `--secondary` | Gray Light | `#F5F6F8` |
| `--secondary-foreground` | Charcoal | `#50534C` |
| `--muted` | Gray Light | `#F5F6F8` |
| `--muted-foreground` | Gauntlet | `#8C898C` |
| `--accent` | Gray Light | `#F5F6F8` |
| `--accent-foreground` | Black | `#3D3936` |
| `--destructive` | Standard Red | `#EF4444` |
| `--destructive-foreground` | White | `#FFFFFF` |
| `--border` | Gray | `#D0D1DB` |
| `--input` | Gray | `#D0D1DB` |
| `--ring` | Katalyst Green | `#78BF26` |
| `--sidebar-background` | White | `#FFFFFF` |
| `--sidebar-foreground` | Charcoal | `#50534C` |
| `--sidebar-accent` | Gray Light | `#F5F6F8` |
| `--katalyst-brand` | Katalyst Green | `#78BF26` |
| `--info` | Mystical (Gurple) | `#A9A2AA` |

**Color Governance Rules:**

1. **3-Category Rule:** No more than 3 categorical accent colors in any single view.
2. **Green as accent, not surface.** Katalyst Green (or brand primary) appears on buttons, links, focus rings — never as large surface backgrounds.
3. **Red is sacred.** Red means something is broken. Advisory suggestions use the Gurple, never red.
4. **Brand override scope:** Only `--primary`, `--primary-foreground`, and `--ring` are overridden per brand. All other tokens are Katalyst constants.

### Typography System

| Usage | Font | Weight Range | Purpose |
|-------|------|-------------|---------|
| **Headings** | Montserrat | 600-700 | Page titles, section headers, card titles, metric labels |
| **Body** | Roboto | 400-500 | Form labels, body text, conversation messages, descriptions |
| **Financial figures** | Roboto Mono | 400-500 | All numeric financial values — ensures tabular alignment |

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
| **xs** | 0.75rem (12px) | 1.5 | Captions, source badges, timestamps, "All changes saved" |

**Financial Figure Formatting (via `<FinancialValue>` primitive):**

| Type | Format | Font | Example |
|------|--------|------|---------|
| Currency | $X,XXX.XX | Roboto Mono | $4,200.00 |
| Percentage | X.X% | Roboto Mono | 12.5% |
| Months/integers | X | Roboto Mono | 14 |
| Negative currency | ($X,XXX.XX) | Roboto Mono, red text | ($2,100.00) |
| Large currency | $X.XM or $XXK | Roboto Mono | $1.2M, $450K |

### Spacing & Layout Foundation

| Level | Value | Usage |
|-------|-------|-------|
| **xs** | 4px (0.25rem) | Icon-to-text gaps, badge padding |
| **sm** | 8px (0.5rem) | Input internal padding, tight element groups |
| **md** | 16px (1rem) | Card internal padding, form field spacing |
| **lg** | 24px (1.5rem) | Section spacing, card padding |
| **xl** | 32px (2rem) | Page-level section gaps |
| **2xl** | 48px (3rem) | Major layout divisions |

**Surface-Specific Density:**

| Surface | Primary Spacing | Cell/Field Padding | Section Gaps | Rationale |
|---------|----------------|-------------------|-------------|-----------|
| **Reports** (inline editing) | sm/md | 8px cell padding | 16px between groups | Maria needs maximum data density; many rows must fit |
| **My Plan** (forms) | md/lg | 16px field padding | 24px between sections | Chris needs breathing room for comprehension |
| **AI Planning Assistant** | lg/xl | 24px message padding | 32px between segments | Sam needs conversational spaciousness |

### Shape System

| Element | Border Radius | Border Width |
|---------|--------------|-------------|
| Cards | 1rem (16px) / `rounded-2xl` | 2px |
| Buttons | 0.75rem (12px) / `rounded-xl` | 1px (outline variant) |
| Inputs | 0.75rem (12px) / `rounded-xl` | 2px |
| Badges | 0.5rem (8px) / `rounded-lg` | None |
| Modals | 1.25rem (20px) / `rounded-2xl` | 2px |

### Component Strategy

| Component Category | Source | Notes |
|-------------------|--------|-------|
| **Layout primitives** (sidebar, header, panels) | shadcn/ui sidebar + custom | Brand logo placement, collapsible sidebar |
| **Form components** (inputs, selects, checkboxes) | shadcn/ui form | Metadata-on-demand overlay on focus, source attribution badges |
| **`<FinancialValue>` primitive** | Custom component | Design system primitive — handles all number formatting. All financial displays use this component. |
| **Financial statements** (statement tables, callout bars) | Custom components using `<FinancialValue>` | Interactive tables with inline editing, progressive disclosure |
| **Chat/conversation** (AI Planning Assistant) | Custom components | AI message bubbles, streaming text, field-population animations |
| **Dialogs, tooltips, dropdowns** | shadcn/ui (Radix primitives) | Styled to Katalyst tokens, no structural changes |

### Data Visualization

**Charting Library:** Recharts

| Chart Type | Purpose | Primary Color |
|-----------|---------|---------------|
| **Break-even timeline** | Area/line chart showing cumulative cash flow crossing zero | Katalyst Green for positive; Standard Red at 20% for negative |
| **Revenue vs. expenses** | Monthly grouped bar chart | Katalyst Green for revenue; Charcoal for expenses |
| **Scenario comparison overlay** | Line chart overlaying Good/Better/Best | Edamame (conservative), Green (base), Basque (optimistic) |
| **Sparklines** | Tiny inline trend charts in summary cards | Green for positive trend; Red for negative |

---

## Part 7: Navigation Architecture (Two-Door Model)

> **Supersedes:** Mode switcher (Planning Assistant | Forms | Quick Entry) from original spec (2026-02-08). The segmented control mode switcher is retired. There are no user-facing "modes."

### Core Insight: There Are No Modes

The original spec described three "modes" (Planning Assistant / Forms / Quick Entry) accessed via a segmented control. This has been superseded by a simpler, more intuitive architecture: **two sidebar destinations** that serve as two doors into the same plan data.

**The fundamental principle: Reports with inline editing IS the power-user input surface.** Maria doesn't need a separate input grid. She opens Reports, clicks the P&L tab, and edits input cells inline. Sam doesn't need to understand modes — he opens My Plan and fills in structured forms. Both users are editing the same plan data through different interaction surfaces.

### Application-Level Navigation

The sidebar is the single, persistent navigation structure. There is no mode switcher, no dashboard toggle, no separate "Quick Entry" destination.

```
+-- Sidebar --------------------------------+
|                                            |
|  [Brand Logo / Katalyst]                   |
|                                            |
|  -- MY LOCATIONS --                        |
|  All Plans (portfolio)                     |
|                                            |
|  -- [ACTIVE PLAN NAME] --                 |
|  My Plan                                   |
|  Reports                                   |
|  Scenarios                                 |
|  Settings                                  |
|                                            |
|  -- HELP --                                |
|  Talk to [Manager Name]                    |
|                                            |
+--------------------------------------------+
```

**Sidebar items explained:**

| Item | What It Is | Primary Persona |
|------|-----------|-----------------|
| All Plans | Portfolio view — list of franchise locations/plans | Chris |
| My Plan | Structured form-based input workspace with AI Planning Assistant available as slide-in panel | Sam, Chris |
| Reports | Tabbed financial statements with inline editing — the power-user input surface | Maria (primary), Sam & Chris (review) |
| Scenarios | Good/Better/Best scenario comparison | All |
| Settings | Plan-level settings — name, brand, projection period | All |
| Talk to [Manager Name] | AI Planning Assistant in conversational format, contextual to active plan | Sam |

**Critical design rules:**

1. **No mode switcher exists anywhere in the UI.** There is no toggle, no segmented control, no radio group that switches between "Planning Assistant," "Forms," and "Quick Entry." These concepts were design-time persona lenses, not user-facing features.

2. **My Plan and Reports are NOT modes — they are destinations.** They appear as sidebar navigation items. The user clicks one to go there. They click the other to go there. No "switching modes."

3. **Data flows both directions.** If Maria edits Monthly AUV inline in the P&L (within Reports), the value in My Plan's Revenue section reflects it. If Sam enters his rent in My Plan's Facilities section, the P&L in Reports updates. One plan, two interaction surfaces.

4. **The AI Planning Assistant is a feature, not a destination.** It's available from within My Plan as a slide-in panel. The "Talk to [Manager Name]" sidebar item opens the same assistant from a conversational starting point.

5. **If you find yourself writing `if (mode === 'quick-entry')` or `editable={mode === 'quick-entry'}`, you are violating this spec.** Input cells in Reports are ALWAYS editable. Period.

### How Users Enter Reports

Reports is accessible via three paths:

1. **Sidebar click:** Clicking "Reports" opens the Financial Statements container with the Summary tab active.
2. **My Plan deep links:** The Impact Strip at the bottom of My Plan includes links like "View Full P&L ->" that navigate directly to the relevant Reports tab.
3. **Portfolio drill-down:** From All Plans, clicking a plan opens it. A "View Reports" link goes directly to Reports.

---

## Part 8: My Plan Experience (Forms + Impact Strip)

My Plan is the structured form-based input workspace. It retains collapsible sections organized by financial category (Revenue, COGS, Labor, Facilities, Startup Costs, etc.), with summary metrics at the top.

### My Plan Layout

```
+-- My Plan -------------------------------------------------------+
|                                                                    |
|  [Summary Metrics Bar -- headline numbers]                         |
|                                                                    |
|  [Revenue Section]                                                 |
|  Monthly Revenue: $30,000                                          |
|  Revenue Growth Rate: 10%                                          |
|  ...                                                               |
|                                                                    |
|  [+ Other collapsible sections: COGS, Labor, Facilities...]       |
|                                                                    |
+-- Impact Strip (sticky bottom) -----------------------------------+
|  Pre-Tax Income: $42,000 (+$3,200)  |  Break-even: Mo 14          |
|  Gross Margin: 70.0%                |  5yr ROI: 127%               |
|  -> View Full P&L ->                                               |
+--------------------------------------------------------------------+
```

### Impact Strip Behavior

- **Context-sensitive:** The metrics shown change based on which form section is active. Revenue section shows P&L impact. Financing section shows balance sheet and cash flow impact. Startup costs section shows investment totals and ROI impact.
- **Delta indicators:** When the user changes a value, affected metrics show the change amount ("+$3,200") in a subtle highlight for 3 seconds, then the highlight fades.
- **Deep link:** The "View Full P&L" (or "View Full Balance Sheet", etc.) link navigates to the relevant Reports tab.
- **Guardian integration:** Miniature Guardian indicator — three colored dots with icons (break-even, ROI, cash) that change in real time. If an edit pushes a Guardian metric from green to amber, the dot animates briefly. Clicking a dot navigates to Reports with the relevant tab and row focused.

### My Plan Interaction Flow

1. **Initiation:** Chris selects My Plan from the sidebar. The workspace shows a plan completeness dashboard at the top: a visual summary showing each section's progress (e.g., "Revenue: 8/10 fields | Operating Costs: 3/12 fields"). This is Chris's re-entry point when she returns — she can see at a glance where she left off.

2. **Interaction:** Chris opens a section (Revenue) and sees form fields with pre-filled brand defaults. She edits values directly. **Metadata on demand:** On field focus, a subtle panel shows the brand default value, Item 7 range (if applicable), and source attribution. On blur, the metadata disappears.

3. **Feedback:** Summary metrics provide real-time recalculation. Section completion indicators track progress. Inline contextual help is available (expand/collapse) for each section.

4. **AI Planning Assistant:** Available as a floating action button or header icon within My Plan. Opens a slide-in panel (see Part 9).

### Per-Field Metadata

Every financial input carries:
- **Brand default value** — the value set by the franchisor/Katalyst during brand configuration
- **Item 7 range** — the FDD-disclosed range, if applicable
- **Source attribution** — "Brand Default" / "AI-Populated" / "Your Entry"
- **Reset affordance** — one-click return to brand default
- **Contextual help** — expand/collapse explanation of what this input means

---

## Part 9: AI Planning Assistant (Conversational Feature)

> **Supersedes:** "Story Mode" / "Planning Assistant mode" from original spec (2026-02-08). The AI Planning Assistant is no longer a workspace mode — it is a **feature** available within the application, primarily from My Plan.

### What Changed and Why

The original spec described Story Mode as one of three top-level workspace modes, occupying the full content area with a split-screen layout (left panel = AI conversation, right panel = live dashboard). This created three problems:

1. **Cognitive overload.** Users had to understand "modes" before they could start working. Sam didn't need to know he was in "Planning Assistant mode" — he just needed help building his plan.
2. **Navigation confusion.** Switching between Story Mode and Normal Mode felt like switching applications, not changing perspective on the same data.
3. **Artificial separation.** The AI assistant was locked inside a mode. Sam couldn't access it while reviewing his forms in My Plan without "switching modes."

The v3 architecture eliminates modes entirely and repositions the AI Planning Assistant as a **contextual feature** available wherever Sam is working — primarily within My Plan, but also accessible from the sidebar.

### Entry Points

The AI Planning Assistant is accessible from three places:

| Entry Point | Location | Behavior | Primary Persona |
|-------------|----------|----------|-----------------|
| **Floating action button** | Bottom-right corner of My Plan | Opens the AI panel as a slide-in from the right edge | Sam, Chris |
| **Header icon** | My Plan header bar | Same slide-in panel behavior | Sam, Chris |
| **"Talk to [Manager Name]"** | Sidebar Help section | Opens the AI panel with a conversational greeting as the starting point — useful for first-time users who want guidance before diving into forms | Sam |

All three entry points open the **same AI panel component** — they differ only in the initial context and greeting.

### Panel Behavior

The AI Planning Assistant renders as a **slide-in panel** from the right edge of the viewport:

```
+-- My Plan Content ---------+-- AI Planning Assistant Panel --+
|                             |                                  |
|  [Form sections]            |  [Conversation history]          |
|  Revenue: $30,000           |                                  |
|  COGS: 30%                  |  AI: "Hi Sam, I see you're       |
|  ...                        |  working on your revenue          |
|                             |  section. Tell me about your      |
|                             |  expected customer traffic."      |
|                             |                                  |
|  [Impact Strip]             |  [Message input]                 |
+-----------------------------+----------------------------------+
```

**Panel specifications:**

- **Width:** 400px (fixed) on viewports >= 1280px. On viewports 1024-1279px, the panel overlays the content area at 380px width with a semi-transparent backdrop.
- **Animation:** Slides in from right edge, 200-300ms ease-out transition. Respects `prefers-reduced-motion` (instant transition, no animation).
- **Dismissal:** Close button (X) in panel header, click outside the panel (overlay mode), or Escape key.
- **Persistence:** The panel remains open as Sam navigates between My Plan form sections. Navigating away from My Plan (e.g., clicking Reports in sidebar) closes the panel. The conversation state is preserved — reopening the panel restores the conversation where it left off.
- **Content push vs. overlay:** On wide viewports (>= 1280px), the panel pushes the My Plan content to the left (content area narrows). On narrower viewports (1024-1279px), the panel overlays with a backdrop. Below 1024px, the panel becomes a full-screen sheet.

### Conversation Interaction Model

The AI Planning Assistant uses a **chat-style conversation model** with message history:

**1. Initiation:**

When Sam opens the panel for the first time on a new plan, the AI greets warmly and contextually:

> "Hi Sam, I'm here to help you build your PostNet business plan. I can see you've already entered some numbers in Revenue — great start! Tell me about the location you're considering, and I'll help fill in the rest."

If the plan already has significant data, the AI acknowledges:

> "Welcome back, Sam. Your plan is looking solid — 7 of 10 sections have inputs. Want to work on the remaining areas, or would you like me to review what you've got so far?"

**2. Interaction Loop:**

Sam types natural-language responses. The AI parses, extracts structured financial values using the confidence threshold, and populates the plan:

| AI Confidence | User Said | AI Behavior | Field Visual State |
|--------------|-----------|-------------|-------------------|
| **High confidence** | "My rent is $4,200 a month" | Populates field with accent-color pulse animation | Solid value, "AI" source badge |
| **Tentative** | "Rent is around four thousand" | Populates $4,000 as tentative AND asks clarifying question | Dashed border + "~" prefix |
| **Uncertain** | "Rent depends on the lease negotiation" | Does NOT populate; asks guiding question | Field remains at brand default |

**3. Impact Feedback:**

When the AI populates or updates a value:

- The **Impact Strip** at the bottom of My Plan updates in real time — Sam sees metrics shift as the conversation progresses.
- The AI **bridges the conversation to the numbers**: "I've set your monthly rent to $4,200. Your operating costs are now $14,100 — that pushes your break-even out by about two weeks from the brand default."
- If Sam is on a section that the AI just populated, the form field updates visibly with a subtle highlight animation.

**4. Cross-surface awareness:**

If Sam edits a field directly in the My Plan form (not through conversation), the AI acknowledges gracefully on the next interaction:

> "I see you adjusted the rent to $4,500 — that bumps your break-even out by about two weeks."

If Sam navigates to Reports, edits a value inline, then returns to My Plan and opens the AI panel, the AI acknowledges:

> "Looks like you updated your COGS percentage in the P&L view — nice. Your gross margin is now 68%. Want to talk through the operating expense side?"

**5. Section Completion Awareness:**

The AI is aware of which plan sections have inputs vs. brand defaults, and proactively guides toward completeness:

> "We've covered Revenue, COGS, and Facilities. The big remaining sections are Staffing and Startup Costs. Staffing usually has the most impact on your bottom line — want to start there?"

**6. Completion and Handoff:**

When all major sections have inputs, the AI prompts scenario consideration:

> "Your base plan looks solid — all sections have your numbers. Want to explore what happens if revenue comes in 15% lower? Comparing scenarios is how you build real confidence for the bank meeting."

The AI can also prompt document generation:

> "Ready to see what your business plan looks like as a document? You can preview it from the Dashboard or generate the PDF from Reports."

### Technical Contract

The following defines the integration boundary for the AI Planning Assistant — enough for a developer to build the feature without cross-referencing other documents:

**API Surface:**

- The AI Planning Assistant reads and writes to the **same plan state** as My Plan forms and Reports inline editing. It uses the same API endpoints (e.g., `PATCH /api/plans/:id/financial-inputs`) that manual form edits use.
- Conversation history is stored separately from plan data — either as a JSONB column on the plan record or as a separate `plan_conversations` table.
- The AI processing endpoint (e.g., `POST /api/plans/:id/ai-assist`) accepts the user's message + current plan state and returns structured extraction results + the AI's response text.

**Change Staging:**

- AI-proposed changes are **applied directly** to the plan state (not staged for preview). The rationale: the AI is acting as a conversational input method, equivalent to typing in a form field. Sam doesn't "approve" a form field entry — he just edits it if it's wrong.
- **Exception:** For tentative extractions (dashed border), the value IS applied but visually marked as tentative. Sam can confirm or correct. If Sam continues the conversation without correcting, the tentative value is promoted to confirmed after the next message exchange.

**Panel State:**

- The panel manages its own local state: conversation history, scroll position, input draft text.
- The panel does NOT manage plan state — it reads from and writes to the shared plan store.
- Opening/closing the panel does not affect plan state.

**Conversation Persistence:**

- Conversation history is **persisted per plan** (not session-only). If Sam closes the browser and returns tomorrow, the conversation is there.
- Each plan has one conversation thread. There is no "start new conversation" — the AI maintains continuity.
- When the plan is deleted, the conversation is deleted.

### Persona Anchoring: "Talk to [Manager Name]"

The "Talk to [Manager Name]" sidebar item personalizes the AI assistant with the brand's account manager identity:

- **[Manager Name]** is populated from the plan's assigned account manager (from the `brand_account_managers` table). If no manager is assigned, the sidebar item reads "Talk to Your Advisor."
- The AI persona mirrors the account manager's name in conversation: "Hi Sam, I'm Denise, your Katalyst planning advisor for PostNet."
- The persona is a thin wrapper — the underlying AI behavior is identical regardless of which account manager name is displayed. The personalization creates warmth and trust, not different capabilities.

### Emotional Design for the AI Assistant

| Scenario | Emotional Risk | Design Response |
|----------|---------------|-----------------|
| AI extracts wrong value | Trust erosion — "the AI doesn't understand me" | Inline correction feels like fixing a typo, not filing a bug. AI acknowledges naturally. |
| AI asks too many clarifying questions | Frustration — "this is just a form in disguise" | High-confidence extractions are silent. Only tentative/uncertain cases ask questions. |
| Sam disagrees with AI-suggested value | Power struggle — "who's in charge of my plan?" | The plan is Sam's. AI suggests, Sam decides. "You know your market better than I do — I'll use your number." |
| AI misses a section entirely | Incompleteness — "did it actually help?" | Section completion awareness ensures the AI guides toward full coverage. |
| Sam asks a question the AI can't answer | Confidence loss — "it's not that smart" | Graceful deflection to the account manager: "That's a great question for Denise — want me to flag it for your next session?" |

---

## Part 10: Reports Experience (Financial Statements)

### Reports ARE the Interactive Financial Statements

Reports contains the tabbed Financial Statements container. The tabs are:

```
[Summary] [P&L] [Balance Sheet] [Cash Flow] [ROIC] [Valuation] [Audit]
```

**Tab behavior:**

- Tabs are always visible across the top of the Reports content area.
- Active tab has a primary-color underline indicator.
- Tab switching is instant — all statement data comes from the same engine computation.
- Each tab remembers its scroll position and drill-down state within the session.
- On mobile/narrow viewports (below 1024px), tabs convert to a dropdown selector.
- Default landing tab is **Summary** for all users.

**Inline editing is always available — not gated by a mode.**

Every financial statement tab renders input cells as editable and computed cells as read-only. There is no toggle to "enable editing." The visual distinction between input and computed cells makes it clear which cells accept input.

### Information Hierarchy — Progressive Disclosure

Every financial statement view follows a three-layer information hierarchy:

**Layer 1: Annual Summary (Default View)**
- 5 annual columns (Year 1 through Year 5)
- Section headers with expandable/collapsible row groups
- Key metric callouts at the top of each statement
- Trend indicators (directional arrows or sparklines)

**Layer 2: Quarterly Drill-Down**
- Click year column header -> 4 quarterly columns (Q1-Q4) plus annual total
- Other years remain collapsed
- Breadcrumb: "Year 2 -> Quarterly View"

**Layer 3: Monthly Detail**
- Click quarter column header -> 3 monthly columns
- Quarter total and annual total remain visible
- Breadcrumb: "Year 2 -> Q2 -> Monthly View"

**Drill-down interaction:**
- Click year header -> expand to quarters
- Click quarter header -> expand to months
- Click breadcrumb or collapse control -> return up
- "Expand All" / "Collapse All" controls for power users
- Keyboard: Enter drills down; Escape goes up

**Sticky elements:** Row labels (leftmost column), section headers (vertical), and key metrics callout bar are all sticky with high z-index and subtle shadow.

### Input-Output Cell Distinction

| Cell Type | Background | Text Style | Border | Icon | Interaction |
|-----------|-----------|------------|--------|------|-------------|
| Input (editable) | Subtle tinted background (primary/5) | Regular weight | Thin dashed left border (primary/20) | Small pencil icon on hover | Click to edit inline; Tab navigates between input cells |
| Computed (read-only) | Standard background | Medium weight | None | None | Hover shows tooltip with formula/derivation |
| Section header/total | Slightly elevated background | Bold weight | None | None | Not editable; shows sum of child rows |

**Inline editing behavior:**
- Click input cell -> cell enters edit mode
- Type new value -> engine recalculates immediately (optimistic UI)
- Tab -> next input cell in same column (skipping computed cells)
- Shift+Tab -> previous input cell
- Enter -> confirms and moves down
- Escape -> cancels edit, restores previous value
- All auto-formatting rules apply (currency, percentage, integer on blur)

### Pre-Epic-7 Per-Year Behavior

Until Epic 7 delivers per-year input arrays, all years broadcast the same value:

- A small **link icon** in the column header row with tooltip: "All years share the same value. Per-year values will be available in a future update."
- Editing any year column updates all years simultaneously with a brief flash.
- After Epic 7: link icon disappears, per-year editing is independent, "Copy Y1 to all years" is opt-in.

### Statement-Specific Details

**Summary Financials (Landing Tab):** Annual P&L summary, Balance Sheet summary, Cash Flow summary, Break-Even analysis, Startup Capital summary. Each section header links to the detail tab.

**P&L Statement:** Revenue, COGS, Gross Profit, Operating Expenses (7 line items), EBITDA, Below-EBITDA (Depreciation, Interest), Pre-Tax Income, P&L Analysis. Input cells: Revenue, COGS %, Direct Labor %, Management Salaries, Facilities, Marketing, Other OpEx %.

**Balance Sheet:** Current Assets, Fixed Assets, Total Assets, Current/LT Liabilities, Equity, Balance Check. Input cells: AR Days, AP Days, Inventory Days, Tax Payment Delay.

**Cash Flow:** Operating Activities, Investing Activities, Cash Before Financing, Financing Activities, Net Cash Flow. Negative cash highlighting with warm background tint AND downward-arrow icon.

**ROIC:** Annual view only. Invested Capital, Returns, ROIC Metrics. Key callout: "Your 5-year cumulative ROIC of X% means for every dollar invested, you earned $Y back."

**Valuation:** Annual view only. EBITDA Basis (EBITDA Multiple is editable input), Adjustments, After-Tax, Returns.

**Audit:** Diagnostic view, not a financial statement. Pass/fail indicators with navigation links to failing rows.

### Transition from Epic 4 Quick Entry Grid

> The flat grid component (`quick-entry-mode.tsx`) is **retired**. Its functionality is fully absorbed by inline-editable financial statement tabs in Reports. No "All Inputs" fallback tab is needed. No orientation overlay is needed.

---

## Part 11: Scenario Comparison

### Good/Better/Best Is a First-Class Feature

A persistent **Scenario Bar** sits between the tab navigation and the statement content:

```
+-----------------------------------------------------+
|  Viewing: * Base Case    [Compare Scenarios v]        |
+-----------------------------------------------------+
```

- **"Base Case"** is the user's current plan inputs — always exists.
- **"Compare Scenarios"** opens a dropdown with Quick Scenarios (Conservative, Optimistic) and Custom Scenario (deferred to Epic 10).

### Quick Scenario Sensitivity Model

Quick scenarios apply sensitivity factors to **three variables simultaneously:**

| Variable | Conservative | Optimistic |
|----------|-------------|-----------|
| Revenue | -15% | +15% |
| COGS % | +2 percentage points | -1 percentage point |
| Operating Expenses (total) | +10% | -5% |

Sensitivity factors are brand-level defaults, configurable by the franchisor.

**Language precision:** The comparison summary card uses honest language:

> "In the conservative scenario (15% lower revenue, higher costs), your business reaches break-even by Month 22 and generates $8,400 in Year 1 pre-tax income. Your base case projects $42,000."

NOT "Even in the conservative scenario..." — that implies the conservative case captures all downside.

### Comparison Interaction Constraints

**Design rule: Comparison mode locks drill-down to the currently expanded level.**

- **Annual view** (default): 3 scenario columns per year (15 data columns). No further drill-down while comparison is active.
- **Already drilled into a year:** 3 scenario columns per quarter for that year. Other years as single "Base Case only" columns.
- **Already drilled to monthly:** Comparison NOT available at monthly. Auto-collapses to quarterly with toast: "Comparison view available at annual and quarterly levels."

To drill down while comparing: deactivate comparison first, drill, then reactivate.

### Where Scenarios Live in the Data Model

- Scenarios are variations on the plan's `financial_inputs` JSONB.
- Base case IS the plan's current inputs.
- Quick scenarios are computed client-side by applying sensitivity multipliers — they don't persist unless saved.
- Custom scenarios (Epic 10) are persisted as separate input snapshots.

---

## Part 12: Guardian Bar + Dynamic Interpretation

### ROI Threshold Guardian

A **persistent, slim bar** at the top of Reports (above the tabs, below the workspace header):

```
+------------------------------------------------------------------+
|  * Break-even: Mo 14 (Feb '27)  |  * 5yr ROI: 127%  |  * Cash: OK  |
+------------------------------------------------------------------+
```

Each indicator uses color AND icon:

| Level | Color | Icon | Meaning |
|-------|-------|------|---------|
| Healthy | Green (success) | Checkmark | Metric is healthy |
| Attention | Amber/Yellow (warning) | Alert triangle | Metric needs attention |
| Concerning | Gurple (advisory) | Info circle | Metric is concerning |

**This is NOT a red/yellow/green traffic light.** We use Katalyst's advisory color system. The Guardian is a compass, not a judgment.

**Threshold defaults:**

| Metric | Green | Amber | Gurple |
|--------|-------|-------|--------|
| Break-even | <= 18 months | 18-30 months | > 30 months |
| 5-Year ROI | >= 100% | 50-100% | < 50% |
| Cash Position | Never negative | Negative <= 3 months | Negative > 3 months |

Thresholds are configurable per brand (Epic 8). MVP uses sensible defaults.

**Guardian interaction:** Clicking any indicator navigates to the relevant statement tab and row.

**Guardian in My Plan:** Via Impact Strip miniature — three colored dots with icons. Clicking navigates to Reports.

### Dynamic Interpretation — The "So What" Layer

**Type 1: Key Metrics Callout Bar** — Sticky at top of each tab:

| Statement | Callout Content |
|-----------|----------------|
| Summary | "Your 5-year total pre-tax income: $X. Break-even: Month Y (that's [Month, Year])." |
| P&L | "Year 1 pre-tax margin: X%. [Above/within/below typical range for [Brand]]" |
| Balance Sheet | "Debt-to-equity ratio: X:1 by Year 3. [Lenders typically look for below 3:1]" |
| Cash Flow | "Lowest cash point: $X in Month Y. [You'll need at least $X in reserves]" |
| ROIC | "5-year return on invested capital: X%. Break-even on investment: Month Y." |
| Valuation | "Estimated business value at Year 5: $X based on Xa EBITDA multiple." |
| Audit | "X of 13 checks passing. [List failures with plain-language explanation]" |

**Type 2: Row-Level Interpretation** — Subtle interpretation line below key rows:

```
Pre-Tax Income    $42,000    $58,000    $72,000    $85,000    $98,000
                  -> 11.7% of revenue -- within PostNet typical range (10-15%)
```

Benchmarks come ONLY from brand defaults — never universal databases. If no benchmark exists, show only the percentage/ratio. Language is always neutral: "within typical range," "above typical range," "below typical range."

**Type 3: Hover Tooltips on Computed Values** — Plain-language meaning, formula derivation, glossary link.

---

## Part 13: Document Preview + PDF Generation

### Where Document Preview Lives

Document Preview is NOT shown within Reports (that would be redundant). Instead:

**1. Dashboard Panel — Preview Widget:**

A card-sized miniature showing the first page of the lender document, updating in real time:

- Sam sees his name on the document — that's the pride moment.
- "View Full Preview" opens a modal with all pages.
- "Generate PDF" triggers download.

**2. My Plan — Preview accessible from Impact Strip:**

A small document icon in the Impact Strip opens the full Document Preview modal.

**3. Reports — Generate Button Only:**

A prominent "Generate PDF" button in the Reports header. The user is already looking at statement content — they don't need a preview.

**Generate PDF button label evolves with completeness:**
- < 50% input completeness: "Generate Draft"
- 50-90%: "Generate Package"
- > 90%: "Generate Lender Package" (with completion indicator)

---

## Part 14: Empty + Incomplete States

### Per-Tab Completeness Badges

Each Reports tab shows a completeness indicator in the tab label:

- **All inputs customized:** No indicator (clean tab label)
- **Some inputs at brand default:** Small "BD" badge count (e.g., "P&L (3 BD)")
- **All inputs at brand default:** "P&L (All BD)" — the tab content is meaningful (brand defaults produce valid projections) but the user hasn't customized anything.

### Per-Cell "BD" (Brand Default) Indicator

Input cells that still hold the brand default value show a small "BD" badge in the cell corner. When the user edits the value, the badge disappears. When the user resets to default, the badge returns.

### Guardian Note for All-Defaults State

If the entire plan is at brand defaults (no user customization), the Guardian Bar shows a special note:

> "These projections use [Brand] default values. Customize your inputs in My Plan for projections based on your specific situation."

### Draft Label on Preview

The Document Preview widget shows "DRAFT" watermark diagonally across the preview when completeness is below 90%.

---

## Part 15: User Journey Tracing

### Sam's Journey (First-Time Franchisee)

1. Receives invitation email -> creates account -> sees branded onboarding with Quick ROI prompt
2. Enters 5 numbers -> sees preliminary ROI range with brand context ("healthy range") -> cautious hope
3. Navigates to **My Plan** from sidebar -> sees form sections pre-filled with PostNet defaults
4. Clicks floating AI button -> AI Planning Assistant panel slides in -> begins conversational planning
5. Tells the AI about his rent, location, staffing plans -> fields populate in the form, Impact Strip updates
6. Closes AI panel -> reviews and adjusts values directly in forms -> Impact Strip shows real-time impact
7. Clicks "View Full P&L ->" in Impact Strip -> navigates to **Reports** -> sees full financial statements
8. Reviews the Summary tab -> sees "Break-even: Month 14 (February 2027)" -> growing conviction
9. Navigates to **Scenarios** from sidebar -> compares Good/Better/Best -> "even the conservative case works"
10. Returns to Dashboard -> sees Document Preview widget with his name on a professional plan -> pride
11. Clicks "Generate Lender Package" -> downloads PDF -> "I actually feel ready for this meeting"

### Maria's Journey (Portfolio Operator)

1. Logs in -> sees All Plans with her 7 locations
2. Creates new plan for Location #8 -> navigates directly to **Reports** from sidebar
3. Clicks P&L tab -> tabs through input cells at spreadsheet speed -> engine recalculates as she types
4. Switches to Balance Sheet tab -> adjusts AR Days, AP Days inline
5. Checks Guardian Bar -> all green -> moves on
6. Clicks "Generate PDF" in Reports header -> downloads PDF
7. Returns to All Plans -> opens Location #9 -> repeats

### Chris's Journey (Scaling Operator)

1. Logs in -> sees All Plans with Location #1 (has actuals) and Location #2 (in planning)
2. Opens Location #2 -> lands on **My Plan** -> sees completeness dashboard
3. Edits Revenue section -> Impact Strip shows P&L impact with delta indicators
4. Clicks "View Full P&L ->" -> navigates to **Reports** -> reviews P&L projections
5. Notices labor costs seem high -> edits Direct Labor % inline in Reports -> values update in both surfaces
6. Returns to **My Plan** via sidebar -> continues with Startup Costs section
7. Opens **Scenarios** -> runs conservative scenario -> reviews comparison
8. Navigates to **Reports** -> clicks "Generate Lender Package" -> PDF downloads

---

## Part 16: Component Architecture

### StatementTable Component Family

The financial statement table is decomposed into a family of components:

| Component | Responsibility |
|-----------|---------------|
| **StatementTable** | Orchestrator — receives row/section definitions, manages drill-down state, coordinates editing |
| **ColumnManager** | Controls progressive disclosure (annual -> quarterly -> monthly), manages column visibility and drill-down transitions |
| **SectionGroup** | Renders a collapsible row group (Revenue, COGS, etc.) with expand/collapse state |
| **DataRow** | Renders a single data row across all visible columns |
| **EditableCell** | Renders an input cell — handles click-to-edit, type-aware formatting, Tab navigation, source badges |
| **ComputedCell** | Renders a computed (read-only) cell — handles hover tooltip with formula/derivation |
| **InterpretationRow** | Renders the "so what" annotation below a data row |
| **StickyContainer** | Manages sticky positioning for row labels, section headers, and callout bar |
| **ScenarioColumns** | Renders comparison columns (Base/Conservative/Optimistic) with color coding |

### Key Implementation Boundaries

- **StatementTable does NOT manage plan state.** It reads from and writes to the shared plan store (React context or state management).
- **EditableCell reuses Epic 4's EditableCell** (from `editable-cell.tsx`) with extensions for the statement table context (column-aware Tab navigation, section-aware Enter navigation).
- **ColumnManager owns drill-down state** — the table's column configuration is derived from ColumnManager's state. Other components don't know or care which drill-down level is active.
- **ScenarioColumns is a separate concern** from drill-down. It composes with whatever columns ColumnManager is showing.

---

## Part 17: Accessibility

### Non-Color Indicators

Every color-coded element has a non-color alternative:

| Element | Color Meaning | Non-Color Indicator |
|---------|--------------|-------------------|
| Input cells (editable) | Primary/5 tinted background | Dashed left border + pencil icon on hover |
| Computed cells (read-only) | Standard background | No border, no icon — absence IS the indicator |
| Guardian healthy | Green | Checkmark icon |
| Guardian attention | Amber | Alert triangle icon |
| Guardian concerning | Gurple | Info circle icon |
| Negative cash cells | Warm tint | Downward arrow icon |
| Scenario columns (conservative) | Muted warm | Column header labeled "Cons" |
| Scenario columns (optimistic) | Muted cool | Column header labeled "Opt" |
| Brand default cell | No special color | "BD" badge visible |

### ARIA Roles and Announcements

- Overall container: `role="grid"` with `aria-label="P&L Statement"` (per statement)
- Section groups: `role="rowgroup"` with `aria-expanded`
- Row labels: `role="rowheader"`
- Input cells: `role="gridcell"` with `aria-readonly="false"` and descriptive `aria-label`
- Computed cells: `role="gridcell"` with `aria-readonly="true"`
- Interpretation rows: `role="note"` linked via `aria-describedby`
- Guardian Bar: `role="status"` with `aria-live="polite"`

### Focus Management

- **Drill-down:** Focus moves to first cell of newly visible column. Collapsing returns focus to the year/quarter header.
- **Tab navigation:** Tab moves between input cells only, skipping computed cells. Column-major order.
- **Scenario activation:** Focus stays on current cell. Expanded columns announced via `aria-live`.
- **Section expand/collapse:** Focus stays on section header. Collapsed content removed from tab order.

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Tab | Move to next editable cell |
| Shift+Tab | Move to previous editable cell |
| Enter | Confirm edit + move to next editable cell in same row group |
| Escape | Cancel edit / collapse current drill-down level |
| Arrow keys | Navigate between cells within the grid |
| Space | Toggle section expand/collapse when focused on header |

### Color Contrast (WCAG 2.1 AA minimum)

| Text Level | Color | On Background | Contrast Ratio | Status |
|-----------|-------|---------------|---------------|--------|
| Primary (Black) | `#3D3936` | `#FFFFFF` | ~12:1 | Pass AAA |
| Primary (Black) | `#3D3936` | `#F5F6F8` | ~10:1 | Pass AAA |
| Secondary (Charcoal) | `#50534C` | `#FFFFFF` | ~7.5:1 | Pass AAA |
| Tertiary (Gauntlet) | `#8C898C` | `#FFFFFF` | ~3.5:1 | Pass AA (large text) |
| Katalyst Green on White | `#78BF26` | `#FFFFFF` | ~3.7:1 | Pass AA (large text only) |

### Responsive Behavior (below 1024px)

- Financial statement tabs convert to a dropdown selector.
- Callout bar IS shown as a read-only summary card.
- Impact Strip becomes a compact summary.
- AI Planning Assistant panel becomes full-screen sheet.
- Layout stacks vertically.

---

## Part 18: UX Pattern Analysis + Anti-Patterns

### Novel UX Patterns

| Interaction | Classification | Analysis |
|------------|---------------|----------|
| **AI conversation -> financial field population** | **Novel** | No mainstream financial tool uses conversational AI to extract structured financial inputs. Highest-risk, highest-reward. Precedent: Intercom's data extraction, adapted for financial domain. |
| **Two-door interaction model (My Plan + Reports)** | **Established (Notion precedent)** | Notion's database views prove "same data, different camera angle" works. Sidebar navigation is familiar. |
| **Brand-default pre-fill with per-field reset** | **Established (template pattern)** | Notion templates, CRM defaults. Extended with per-field source attribution and reset. |
| **Scenario comparison (Good/Better/Best)** | **Established (spreadsheet what-if)** | Excel users understand scenarios. Katalyst adds multi-variable sensitivity and visual side-by-side. |
| **Inline editing in financial statements** | **Established (spreadsheet pattern)** | Tab-through, inline editing, instant recalculation. Extended with engine integration and source attribution. |
| **Progressive disclosure (annual -> quarterly -> monthly)** | **Established (drill-down pattern)** | Standard hierarchical data exploration. Applied to financial statements with column management. |

### Anti-Patterns Avoided

| Anti-Pattern | Why We Avoid It | Our Approach |
|-------------|----------------|--------------|
| **Mode switcher** | Forces users to understand "modes" before working. Creates cognitive overhead and navigation confusion. | Two sidebar destinations. No modes, no switching. |
| **Separate input grid** | Creates a disconnected editing surface. Users edit inputs in one place, see outputs in another. | Inline editing in Reports. Input cells live inside the financial statements. |
| **View mode / Edit mode toggle** | Reintroduces modes. "Am I viewing or editing?" is unnecessary friction. | Input cells are always editable. Computed cells are always read-only. Visual treatment distinguishes them. |
| **AI assistant as a separate workspace** | Locks the AI behind a mode switch. Users can't get help while working. | Slide-in panel accessible from My Plan. AI is a feature, not a destination. |
| **Document preview inside financial statements** | Redundant — you're already looking at the financial data. | Preview on Dashboard and via Impact Strip. Reports gets "Generate PDF" button. |
| **Red for advisory warnings** | Red means broken, not "your growth rate is optimistic." | Gurple (advisory purple) for suggestions. Red reserved for actual errors. |

---

## Part 19: Out of Scope + Deferred Items

| Item | Deferred To | Reason |
|------|-------------|--------|
| Custom scenario creation (duplicate base case, modify inputs) | Epic 10 | Quick multi-variable scenarios sufficient for Epic 5 |
| Per-year input columns in My Plan and Reports | Epic 7 | Dependency on PlanFinancialInputs restructuring |
| Multi-plan comparison (portfolio-level) | Epic 7 | Requires plan CRUD + All Plans navigation |
| AI Planning Assistant integration with Reports | Epic 9 | AI integration is My Plan-focused for MVP |
| Advisory nudges on individual input fields | Epic 8 | Guardian Bar provides plan-level advisory; field-level is Epic 8 |
| Excel/CSV export | Backlog | Lower priority than PDF |
| Estimated vs. actual tracking | Phase 2 | PRD Phase 2 scope |
| Configurable Guardian thresholds per brand | Epic 8 | Sensible defaults for MVP |
| Dark mode | Post-MVP | Token architecture supports it; deferred to reduce testing matrix |

---

## Admin Support Tools — Impersonation & Demo Mode UX

### Impersonation Banner (View As Mode)

- Reuses the existing application header bar
- Background: neon construction orange (#FF6D00)
- Content: "[Franchisee Name] — Franchisee | Read-Only Mode | [Enable Editing toggle] | [Exit View As button]"
- When editing enabled: banner pulsates, text changes to "Editing Enabled"
- Exit button returns admin to brand detail Franchisees tab

### Demo Mode Banner

- Same header bar reuse pattern
- Background: visually distinct from orange (blue, purple, or teal recommended)
- Content: "Demo Mode: [Brand Name] — [Role] View | [Exit Demo button]"
- No pulsation — demo mode is always fully interactive

### Entry Points

- **View As:** "View As" button in each franchisee's row on brand detail Franchisees tab
- **Franchisee Demo:** "Enter Franchisee Demo Mode" button on each brand card
- **Franchisor Demo:** "Demo Mode" menu item in admin sidebar

---

## Story Rewrite Implications

This consolidated spec requires the following story structure for Epic 5:

| Story | Scope |
|-------|-------|
| 5.1: Engine Extension | Add missing computations (Valuation, extended ROIC, extended Audit, Balance Sheet/Cash Flow disaggregation). No UI. |
| 5.2: Application Navigation + Reports Container + Summary Tab | Sidebar navigation. Eliminate mode switcher entirely. Reports with tab navigation. Guardian Bar structure. Summary tab as landing. Progressive disclosure infrastructure. |
| 5.3: P&L Statement Tab with Inline Editing | Full P&L with drill-down, interpretation rows. Input cells ALWAYS editable inline. Visual distinction for input vs. computed. Tab navigation. Accessibility. |
| 5.4: Balance Sheet + Cash Flow Tabs | Built together (tightly coupled). Inline editable inputs. Negative cash highlighting. |
| 5.5: ROIC + Valuation + Audit Tabs | Three simpler views, annual-only. Valuation has editable EBITDA multiple. Audit with navigation links. |
| 5.6: My Plan + Impact Strip | My Plan forms with Impact Strip. Bidirectional data flow with Reports. |
| 5.7: Scenario Comparison | Multi-variable quick scenarios. Comparison columns with drill-down constraints. |
| 5.8: Guardian Bar + Dynamic Interpretation | Guardian with icons + colors, row-level interpretation, callout bars. Real-time updates. |
| 5.9: Document Preview + PDF Generation | Dashboard preview widget. Generate PDF with completeness-aware labels. |
| 5.10: Glossary + Contextual Help | Glossary page + inline tooltip integration. |

---

## Change Log

| Date | Change | Source |
|------|--------|--------|
| 2026-02-08 | Original UX design specification created. Three-mode architecture (Planning Assistant / Forms / Quick Entry) with segmented control mode switcher. | `ux-design-specification.md` |
| 2026-02-16 | Financial statements spec v3 created. Eliminates mode switcher, establishes two-door architecture (My Plan / Reports), retires Quick Entry as a concept, makes inline editing always-on in Reports. | `ux-financial-statements-spec.md` |
| 2026-02-17 | Tech spec for Story 5.2 progressive disclosure gaps completed. | `tech-spec-5.2-progressive-disclosure-gaps.md` |
| 2026-02-18 | **Consolidated into single document.** Mode switcher retired. Quick Entry retired. AI Planning Assistant repositioned from workspace mode to contextual feature (slide-in panel within My Plan). All content from both source documents preserved, with v3 architecture taking precedence on navigation, input surfaces, and component architecture. Part 9 (AI Planning Assistant) freshly written. | This document |

---

## Approval

**Status:** Consolidated — Ready for Review
**Author:** Sally (UX Designer), with contributions from Winston (Architect), Paige (Tech Writer)
**Facilitated by:** Bob (Scrum Master)
**Date:** 2026-02-18
