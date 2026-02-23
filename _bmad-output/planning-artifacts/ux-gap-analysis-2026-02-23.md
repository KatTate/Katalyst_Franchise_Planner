---
date: 2026-02-23
author: Sally (UX Designer)
status: Approved for Implementation
audit_scope: Full system audit against UX Design Specification (Consolidated) and all 8 User Journeys
workflow: Quick Spec (QS) → Quick Dev (QD) per item
---

# UX Gap Analysis — Katalyst Growth Planner

**Author:** Sally (UX Designer)
**Date:** 2026-02-23
**Status:** Approved for Implementation

This document captures actionable UX gaps identified during a full system audit against the consolidated UX Design Specification and User Journeys. Each gap is sized for the Quick Spec / Quick Dev workflow.

---

## Gap Group A: Onboarding Copy Refresh

**Priority:** High — first user interaction
**Scope:** Copy/language only, no structural changes
**Estimated Complexity:** Small

### A.1: Update Tier Recommendation Language

**Current state:** Onboarding presents three "tiers" (Planning Assistant, Forms, Quick Entry) as distinct mode choices with labels and icons. The user selects one.

**Desired state:** Onboarding asks the same three questions, then presents a **recommendation** based on answers — not a mode picker. The three paths still exist, but the language frames them as guidance:

| Experience Level | Recommendation Copy |
|-----------------|-------------------|
| **New to this** (Sam) | "We recommend starting with the **Planning Assistant** — it'll guide you through your plan conversationally, explaining things as you go. You can always switch to forms anytime." |
| **Knows their numbers** (Chris) | "You're in good shape to dive into **My Plan** forms. Fill in your numbers section by section. The Planning Assistant is always available if you want a second opinion." |
| **Veteran** (Maria) | "You've got this. Head straight to **Reports** and build your plan inline — everything's editable. No hand-holding required." |

**What to change:**
- `client/src/pages/onboarding.tsx` — Update `TIER_INFO` labels and descriptions
- Update the recommendation step to frame as guidance ("We suggest...") rather than selection ("Choose your mode...")
- Remove "mode" language entirely — use "starting point" or "recommended path"
- Keep the ability for the user to override the recommendation

**Files:** `client/src/pages/onboarding.tsx`

---

## Gap Group B: Dashboard Enrichment

**Priority:** High — Sam's home base and re-entry point
**Scope:** New components on Dashboard page
**Estimated Complexity:** Medium (2 components)

### B.1: Plan Completeness Widget on Dashboard

**Current state:** Plan cards on Dashboard show only plan name and "In progress" / "Quick start needed" status.

**Desired state:** Each plan card (or a dedicated widget for the active plan) shows section-by-section completion status:

```
Revenue: ✓ Customized
COGS: ✓ Customized  
Labor: BD (Brand Default)
Facilities: ✓ Customized
Startup Costs: BD
Marketing: BD
```

**UX Spec Reference:** Journey 1 Step 6, Journey 3 Steps 2-4

**What to change:**
- Add a `PlanCompletenessWidget` component (or extend existing plan cards) on `client/src/pages/dashboard.tsx`
- Reuse logic from `client/src/components/planning/plan-completeness-bar.tsx` (already exists in workspace)
- Show as a compact visual summary — checkmarks for customized sections, "BD" for defaults
- Include overall percentage (e.g., "45% customized")

**Files:** `client/src/pages/dashboard.tsx`, potentially new component file

### B.2: Document Preview Widget on Dashboard

**Current state:** No document preview on Dashboard.

**Desired state:** A card-sized miniature showing the first page of the lender document, updating based on plan state:
- Sam sees his name on the document (pride moment)
- "View Full Preview" opens the Document Preview Modal
- "Generate PDF" triggers download (when PDF generation ships)
- DRAFT watermark when plan completeness < 90%
- Empty state when plan is too incomplete: "Complete your plan to preview your lender package"

**UX Spec Reference:** Part 13, Journey 1 Steps 19-21

**What to change:**
- Add `DocumentPreviewWidget` to Dashboard (the component already exists at `client/src/components/planning/document-preview-widget.tsx` — evaluate reuse)
- Widget needs plan data (name, completeness, financial inputs) to render preview
- Wire up "View Full Preview" to open `DocumentPreviewModal`

**Dependencies:** Requires plan data loading on Dashboard. Currently Dashboard loads plan list but not full plan data.

**Files:** `client/src/pages/dashboard.tsx`, `client/src/components/planning/document-preview-widget.tsx`

### B.3: Dashboard Empty State Copy

**Current state:** "No plans yet. Create your first plan to get started."

**Desired state:** Warmer brand-voice copy per UX spec Part 4:
- "Ready to plan your next location? Let's build something great."
- CTA button: "Create Your First Plan"

**Files:** `client/src/pages/dashboard.tsx`

---

## Gap Group C: Reports Tab Completeness Badges

**Priority:** Medium — transparency for power users
**Scope:** UI enhancement to existing tab labels
**Estimated Complexity:** Small

### C.1: Per-Tab BD Badge Count

**Current state:** Tab labels show clean text only: "Summary", "P&L", "Balance Sheet", etc.

**Desired state:** Tabs show a small badge count for inputs still at brand default:
- "P&L (3 BD)" — 3 input fields in P&L are still at brand defaults
- "Balance Sheet (2 BD)" — 2 input fields at defaults
- When all inputs are customized: clean label, no badge
- When all inputs are at default: "P&L (All BD)"

**Design decision (from audit discussion):** Per-cell BD badges in the statement grid are **deferred** — Reports is already dense, and adding badges to every default cell would create visual noise. The tab-level badge gives Maria the information she needs without cluttering the grid.

**UX Spec Reference:** Part 14

**What to change:**
- `client/src/components/planning/financial-statements.tsx` — Enhance `TAB_DEFS` rendering to include badge count
- Need a function that counts brand-default inputs per statement tab (cross-reference `INPUT_FIELD_MAP` with current `financialInputs` vs. brand defaults)
- Badge styling: small, muted, non-intrusive (e.g., `text-xs text-muted-foreground ml-1`)

**Files:** `client/src/components/planning/financial-statements.tsx`, possibly `client/src/lib/plan-completeness.ts`

---

## Gap Group D: Design System Consistency Pass

**Priority:** Medium-High — visual polish and brand identity
**Scope:** CSS/styling audit and fixes
**Estimated Complexity:** Small-Medium (systematic but straightforward)

### D.1: Typography Audit

**Current state:** Likely using default system fonts or partially applied custom fonts.

**Desired state per UX spec Part 6:**
- **Headings:** Montserrat 600-700 (page titles, section headers, card titles, metric labels)
- **Body:** Roboto 400-500 (form labels, body text, conversation messages, descriptions)
- **Financial figures:** Roboto Mono 400-500 (all numeric financial values for tabular alignment)

**What to check/fix:**
- Verify Google Fonts are loaded (Montserrat, Roboto, Roboto Mono) in `index.html` or CSS imports
- Verify `--font-heading`, `--font-body`, `--font-mono` CSS custom properties exist and are applied
- Verify `<FinancialValue>` component uses Roboto Mono
- Audit heading elements for Montserrat application

**Files:** `client/index.html`, `client/src/index.css`, `client/src/components/shared/financial-value.tsx`, `tailwind.config.ts`

### D.2: Shape System Audit

**Current state:** Likely using shadcn/ui defaults (smaller border-radius values).

**Desired state per UX spec Part 6:**

| Element | Border Radius | Border Width |
|---------|--------------|-------------|
| Cards | 1rem (16px) / `rounded-2xl` | 2px |
| Buttons | 0.75rem (12px) / `rounded-xl` | 1px (outline variant) |
| Inputs | 0.75rem (12px) / `rounded-xl` | 2px |
| Badges | 0.5rem (8px) / `rounded-lg` | None |
| Modals | 1.25rem (20px) / `rounded-2xl` | 2px |

**What to check/fix:**
- Audit `--radius` CSS variable value
- Check shadcn/ui component overrides for card, button, input, badge, dialog
- Update global or component-level styles to match spec

**Files:** `client/src/index.css`, `tailwind.config.ts`, component files as needed

### D.3: Color Token Audit

**Current state:** Colors may not match spec hex values precisely.

**Desired state per UX spec Part 6:** Verify every token in `index.css` against the spec's token table:

| Token | Expected Hex |
|-------|-------------|
| `--background` | #F5F6F8 |
| `--foreground` | #3D3936 |
| `--card` | #FFFFFF |
| `--primary` | #78BF26 |
| `--destructive` | #EF4444 |
| `--border` | #D0D1DB |
| `--muted-foreground` | #8C898C |
| `--katalyst-brand` | #78BF26 |
| `--info` (Gurple) | #A9A2AA |

**What to check/fix:**
- Read `client/src/index.css` and compare every CSS custom property value against the spec table
- Fix any mismatches
- Ensure HSL values in CSS correspond to the correct hex values

**Files:** `client/src/index.css`

---

## Gap Group E: Future Epic — Row-Level Interpretation ("So What" Layer)

**Priority:** Future — needs its own planning/research round
**Scope:** New feature requiring brand benchmark data, per-statement logic, careful copy
**Estimated Complexity:** Large (epic-level)

### E.1: Research & Planning Needed

This gap is **parked for dedicated planning.** The Row-Level Interpretation layer is a major UX differentiator but requires:

1. **Brand benchmark data source** — Where do "typical PostNet ranges" come from? Brand configuration? Hard-coded? A benchmark database?
2. **Per-statement interpretation logic** — Which rows get interpretation? What formulas/ratios trigger annotations?
3. **Copy framework** — Language patterns for "within typical range," "above typical range," "below typical range." Tone guidance. When to show vs. when to omit.
4. **Hover tooltip depth** — Plain-language meaning, formula derivation, glossary links. How much is too much?

**UX Spec Reference:** Part 12 (Types 1-3 of Dynamic Interpretation)

**Recommendation:** Create a dedicated epic with research stories before implementation. Consider a brainstorming session with the analyst (Mary) to define the benchmark data model.

---

## Gap Group F: Spec-Only Updates (No System Changes)

These items require UX spec doc edits only. **Already applied** as part of this gap analysis.

### F.1: Planning Assistant — Split-Screen Design (Applied)

**Change:** Updated Part 9 of UX spec to reflect the implemented 50/50 split-screen design (ResizablePanelGroup with conversation panel left, live dashboard right) instead of the original "slide-in panel from right edge" description.

### F.2: Quick ROI Placement Clarification (Applied)

**Change:** Added a note in Journey 1 clarifying that Quick ROI is implemented as the first interaction within a plan workspace (Quick Start Overlay) rather than as a pre-plan onboarding step. Both achieve the same goal; the in-plan approach provides better context.

---

## Implementation Order Recommendation

| Order | Gap | Why This Order |
|-------|-----|---------------|
| 1 | **A.1** Onboarding Copy | First user touchpoint. Small change, outsized impact. |
| 2 | **B.3** Dashboard Empty State Copy | Quick win while working on Dashboard. |
| 3 | **D.3** Color Token Audit | Foundation — everything else looks wrong if colors are off. |
| 4 | **D.1** Typography Audit | Second foundation layer — fonts define the product's feel. |
| 5 | **D.2** Shape System Audit | Third foundation layer — border-radius and border-width. |
| 6 | **C.1** Reports Tab BD Badges | Transparency feature for power users. |
| 7 | **B.1** Plan Completeness Widget | Dashboard enrichment — returning user experience. |
| 8 | **B.2** Document Preview Widget | Dashboard enrichment — emotional design moment. Largest item. |
| 9 | **E.1** Row-Level Interpretation | Future epic — needs planning first. |
