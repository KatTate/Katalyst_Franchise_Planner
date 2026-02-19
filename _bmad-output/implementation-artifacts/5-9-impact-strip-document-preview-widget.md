# Story 5.9: Impact Strip & Document Preview Widget

Status: ready-for-dev

## Story

As a franchisee using My Plan (Forms mode),
I want to see the real-time impact of my edits on key metrics without leaving the form, preview my business plan document as it takes shape, and access document generation from the right places,
so that I understand the financial consequence of every input change, feel pride watching my plan become a professional document, and can generate lender-ready packages when I'm ready (FR7d, FR24).

## Acceptance Criteria

### Impact Strip — Forms Mode Sticky Bottom Bar

1. Given I am in Forms mode editing financial inputs, when the Impact Strip renders as a persistent sticky bar at the bottom of the Forms input panel, then it shows 3-4 key financial metrics most relevant to the section I'm currently editing:
   - Revenue section active → Pre-Tax Income, Break-even Month, Gross Margin %, 5yr ROI
   - Operating Expenses section active → EBITDA, Pre-Tax Income, Labor Efficiency %
   - Financing section active → Cash Position (lowest month), Debt Service Coverage, Break-even Month
   - Startup Costs section active → Total Investment, 5yr ROI, Break-even Month
   - No section active (or all collapsed) → Pre-Tax Income, Break-even Month, Gross Margin %, 5yr ROI (default set)

2. Given I change an input value in Forms mode, when the engine recalculates (via `usePlanOutputs`), then affected metrics in the Impact Strip show a delta indicator (e.g., "+$3,200" or "-2 months") in a subtle highlight for 3 seconds, then the highlight fades but the updated value remains displayed.

3. Given the Impact Strip renders, then it includes a deep link reading "View Full P&L →" (or "View Full Balance Sheet →", "View Full Cash Flow →" depending on the active section context) that, when clicked, navigates to the Financial Statements view on the relevant tab using `navigateToStatements(tabId)` from `WorkspaceViewContext`.

4. Given the Impact Strip includes a miniature Guardian display, when it renders, then three small colored dots with icons are shown matching the Guardian Bar pattern: Break-even (CheckCircle / AlertTriangle / InfoCircle), 5yr ROI (same icon set), Cash Position (same icon set). The dots use the same `guardian-healthy`, `guardian-attention`, `guardian-concerning` color tokens already defined in `index.css` and `tailwind.config.ts`. Clicking a miniature Guardian dot navigates to Financial Statements with the relevant tab focused (Break-even → Summary, Cash → Cash Flow, ROI → ROIC).

5. Given I edit an input value that pushes a Guardian metric across a threshold level (e.g., healthy → attention), when the miniature Guardian dot updates, then it animates briefly (a pulse or scale animation lasting ~600ms) to draw attention to the status change.

6. Given the Impact Strip includes a document preview icon (FileText or similar), when I click the icon, then a Document Preview modal opens showing a formatted representation of the business plan document at readable size, reflecting the current state of my financial inputs.

### Document Preview Modal

7. Given the Document Preview modal opens (from Impact Strip icon or Dashboard "View Full Preview"), then it renders as a full-screen or large modal showing the business plan document with: a cover page displaying the franchisee's name (from `plan.name`) and the brand identity (logo reference, brand name via `brand?.displayName || brand?.name`), summary financial metrics, and key financial statement sections (P&L summary, Cash Flow summary, Break-even analysis). The modal includes a close button and a "Generate PDF" button.

8. Given the plan has less than 90% input completeness, when the Document Preview modal renders, then a diagonal "DRAFT" watermark is visible across the preview content.

9. Given the plan has all inputs at brand defaults (no user customization, detected via `isAllDefaults` from `guardian-engine.ts`), when the Document Preview modal renders, then a note appears: "Your plan is using all brand default values. Edit inputs to personalize your projections."

### Dashboard Document Preview Widget

10. Given I am on the Dashboard Panel, when the dashboard renders, then a Document Preview widget card appears showing a miniature representation of the first page of the business plan document. The widget displays the franchisee's name prominently on the document preview — this is the "pride moment" (the user sees their name on a professional-looking document).

11. Given the Dashboard Document Preview widget renders, then it includes: a "View Full Preview" link/button that opens the Document Preview modal, and a "Generate PDF" button that will trigger PDF generation (wired to Story 6.1 — for this story, clicking it shows a toast: "PDF generation coming soon").

12. Given the plan input completeness changes, when the Dashboard Document Preview widget renders, then: below 50% completeness the preview shows a "DRAFT" watermark and the generate button reads "Generate Draft"; between 50-90% the button reads "Generate Package"; above 90% the button reads "Generate Lender Package" with a subtle completion indicator.

13. Given the plan has all inputs at brand defaults, when the Dashboard Document Preview widget renders, then the same defaults note from AC 9 appears on the widget.

### Reports Header — Generate PDF Button

14. Given I am viewing the Financial Statements (Reports) view, when the header renders, then a "Generate PDF" button appears in the header area. No document preview is shown in Reports — the user is already looking at the financial content. The button label evolves with completeness: < 50% → "Generate Draft"; 50-90% → "Generate Package"; > 90% → "Generate Lender Package". Clicking the button shows a toast: "PDF generation coming soon" (wired to Story 6.1).

### Completeness Calculation

15. Given the system needs to compute plan input completeness as a percentage, then completeness is calculated using the existing `computeSectionProgress` logic from `forms-mode.tsx`: sum of all edited fields across all sections divided by total fields across all sections, expressed as a percentage. Startup cost entries count as additional edited fields if any have been added. This calculation is extracted into a shared utility so it can be used by the Impact Strip, Document Preview widget, Dashboard widget, and Reports header without duplication.

### data-testid Coverage

16. Given the Impact Strip renders, then it includes: `data-testid="impact-strip"` on the container, `data-testid="impact-metric-{metricKey}"` on each metric display (e.g., `impact-metric-pre-tax-income`, `impact-metric-break-even`), `data-testid="impact-deep-link"` on the "View Full P&L →" link, `data-testid="impact-guardian-dot-{indicator}"` on each miniature Guardian dot (e.g., `impact-guardian-dot-break-even`), `data-testid="impact-doc-preview-icon"` on the document preview icon.

17. Given the Document Preview modal renders, then it includes: `data-testid="document-preview-modal"` on the modal container, `data-testid="document-preview-cover"` on the cover page section, `data-testid="document-preview-draft-watermark"` on the DRAFT watermark (when shown), `data-testid="button-generate-pdf"` on the Generate PDF button, `data-testid="button-close-preview"` on the close button.

18. Given the Dashboard Document Preview widget renders, then it includes: `data-testid="document-preview-widget"` on the widget card, `data-testid="button-view-full-preview"` on the View Full Preview link, `data-testid="button-generate-pdf-dashboard"` on the Generate PDF button, `data-testid="text-plan-author-name"` on the franchisee name display.

19. Given the Reports header Generate PDF button renders, then it includes: `data-testid="button-generate-pdf-reports"` on the button.

## Dev Notes

### Architecture Patterns to Follow

- **State management (architecture.md Decision 8):** All financial state flows through TanStack React Query. The Impact Strip and Document Preview read from the same `usePlanOutputs` and `usePlan` hooks used by Financial Statements and Forms mode. No new server state is introduced — Impact Strip metrics and Document Preview content are derived client-side from `EngineOutput` and `PlanFinancialInputs`.
  - Source: `_bmad-output/planning-artifacts/architecture.md` → Decision 8: State Management

- **Guardian reuse:** Import `computeGuardianState` and `isAllDefaults` from `client/src/lib/guardian-engine.ts`. The miniature Guardian dots in the Impact Strip use the same threshold logic and color system as the full Guardian Bar in Reports. Do NOT re-implement threshold logic.
  - Source: `client/src/lib/guardian-engine.ts` → `computeGuardianState()`, `isAllDefaults()`
  - Source: `client/src/components/planning/statements/guardian-bar.tsx` → icon/color patterns

- **Guardian color tokens (ALREADY DEFINED — do NOT re-add):** `guardian-healthy`, `guardian-attention`, `guardian-concerning` with foreground variants are already in `index.css` (lines 40-45 light, 130-135 dark) and `tailwind.config.ts` (lines 56-61). The `@keyframes guardian-pulse` animation was added in Story 5.8.
  - Source: `client/src/components/planning/statements/guardian-bar.tsx` → animation classes

- **Navigation between surfaces:** Use `navigateToStatements(tabId)` and `navigateToMyPlan()` from `WorkspaceViewContext` (`client/src/contexts/WorkspaceViewContext.tsx`). These functions are already wired and used throughout the workspace.
  - Source: `client/src/contexts/WorkspaceViewContext.tsx` → `navigateToStatements`, `navigateToMyPlan`

- **Brand name access pattern:** `brand?.displayName || brand?.name` — verified in `planning-workspace.tsx` line 143. The brand is fetched via `useQuery<Brand>({ queryKey: ["/api/brands", brandId] })`.
  - Source: `client/src/pages/planning-workspace.tsx` → line 143

- **Financial formatting:** Use `formatCents` from `client/src/lib/format-currency.ts` for currency values. Use `formatROI` and `formatBreakEven` from `client/src/components/shared/summary-metrics.tsx` for ROI and break-even formatting. Negative numbers use accounting-style parentheses per UX spec Part 1 financial formatting tokens.
  - Source: `client/src/lib/format-currency.ts`, `client/src/components/shared/summary-metrics.tsx`

- **Naming conventions:** Components: PascalCase. Files: kebab-case. Constants: SCREAMING_SNAKE_CASE. data-testid: `{action}-{target}` for interactive, `{type}-{content}` for display.
  - Source: `_bmad-output/planning-artifacts/architecture.md` → Naming Patterns

- **Completeness as shared utility:** Extract the completeness percentage calculation from `forms-mode.tsx` (`computeSectionProgress` + aggregation at lines 211-212) into a shared utility (e.g., `client/src/lib/plan-completeness.ts`) so Impact Strip, Document Preview, Dashboard widget, and Reports header can all import it. The original `forms-mode.tsx` should import from the shared utility to avoid duplication.
  - Source: `client/src/components/planning/forms-mode.tsx` → `computeSectionProgress()`, lines 44-67, 211-212

- **Delta tracking pattern:** To show "+$3,200" delta indicators, the Impact Strip needs to compare the current metric value against a "previous" snapshot. Use a `useRef` to store the last-seen metric values. When `usePlanOutputs` returns new output, diff against the ref, render deltas for changed metrics, set a 3-second timeout to clear the delta highlight, then update the ref to the new values.

### UI/UX Deliverables

**Impact Strip (sticky bottom bar in Forms mode):**
- Persistent sticky bar at the bottom of the Forms mode scroll container
- 3-4 metric cards showing formatted values with delta indicators on change
- Context-sensitive metrics that change based on which form section is expanded/active
- Miniature Guardian: three small colored dots with threshold icons (reusing Guardian color tokens)
- Deep link text ("View Full P&L →") that navigates to the relevant Reports tab
- Document preview icon (FileText from lucide-react) that opens Document Preview modal
- Responsive: Below 1024px, becomes a compact summary (fewer metrics, smaller layout)
- Visual style: Matches the application's card/border pattern, `bg-card` or `bg-muted` background, subtle top border

**Document Preview Modal:**
- Large modal (Dialog from shadcn/ui) showing a formatted document representation
- Cover page with franchisee name (`plan.name`), brand name, and plan date
- Financial summary sections: key P&L metrics, break-even analysis, cash flow summary
- "DRAFT" watermark (diagonal, semi-transparent) when completeness < 90%
- All-defaults note when `isAllDefaults` returns true
- "Generate PDF" button with completeness-aware label
- Close button
- NOT a pixel-perfect PDF preview — a structured HTML representation that communicates "this will be a professional document" and shows the user's data in document format

**Dashboard Document Preview Widget:**
- A `Card` component on the Dashboard Panel showing a miniature document first-page
- Franchisee name displayed prominently (the "pride moment")
- "DRAFT" watermark when completeness < 50%
- "View Full Preview" opens the Document Preview modal
- "Generate PDF" button with completeness-aware label
- All-defaults note when applicable
- Updates reactively as plan inputs change

**Reports Header Generate PDF Button:**
- Single button in the Financial Statements header (next to existing controls)
- Label evolves: "Generate Draft" / "Generate Package" / "Generate Lender Package"
- No preview in Reports — button only

**UI States:**
- Loading: Impact Strip shows skeleton metrics while `usePlanOutputs` is loading
- Empty/defaults: All-defaults note on Document Preview; Impact Strip shows metric values but derived from brand defaults
- Error: If engine output fails, Impact Strip shows "Unable to calculate" with muted styling
- Delta animation: 3-second highlight fade on metric value changes

### Anti-Patterns & Hard Constraints

- **DO NOT create a separate document preview inside Financial Statements/Reports.** Document Preview is redundant in Reports — the user is already looking at financial data. Reports gets only a "Generate PDF" button. Preview lives on Dashboard (widget) and via Impact Strip (icon → modal).
  - Source: UX spec Part 13, Part 18 Anti-Patterns table row "Document preview inside financial statements"

- **DO NOT use red/destructive color for Guardian indicators.** The Guardian system uses Gurple (advisory purple) for "concerning," NOT red. Red is reserved for actual errors only. The three levels are: green (healthy), amber (attention), Gurple (concerning).
  - Source: UX spec Part 6, Part 12

- **DO NOT re-implement Guardian threshold logic.** Import from `guardian-engine.ts`. Do NOT duplicate the threshold constants or computation in the Impact Strip component.

- **DO NOT re-add Guardian CSS custom properties.** The `guardian-healthy`, `guardian-attention`, `guardian-concerning` tokens and `@keyframes guardian-pulse` are already defined from Story 5.8. Adding them again will create duplicates.

- **DO NOT modify `vite.config.ts`, `server/vite.ts`, `package.json`, or `drizzle.config.ts`.** These are protected files per project guidelines.

- **DO NOT implement actual PDF generation.** Story 6.1 handles PDF generation. This story creates the UI surfaces (buttons, preview) that will connect to Story 6.1. Generate PDF buttons show a toast placeholder: "PDF generation coming soon".

- **DO NOT add a mode check that gates Impact Strip visibility.** The Impact Strip should render whenever the user is in Forms mode, regardless of experience tier. There is no Quick Entry vs. Forms conditional.

- **DO NOT add a new server endpoint for document preview.** The preview content is composed client-side from existing `EngineOutput` and plan data. No server rendering is needed for the HTML preview.

- **DO NOT nest a Card inside a Card.** The Document Preview widget on the Dashboard is a Card, but it should not contain a Card for the preview area — use a `div` with appropriate styling for the miniature document within the Card.

### Gotchas & Integration Warnings

- **`computeSectionProgress` is currently a local function in `forms-mode.tsx` (line 44).** It is NOT exported. Before the Impact Strip can use it, it must be extracted to a shared utility. The same applies to `hasAnyUserEdits` (line 58). When extracting, the original `forms-mode.tsx` must import from the new shared location to avoid duplication. The function depends on `FIELD_METADATA`, `CATEGORY_ORDER`, `CATEGORY_LABELS` from `client/src/lib/field-metadata.ts` and `PlanFinancialInputs`/`FinancialFieldValue` from `shared/financial-engine.ts`.

- **Active section tracking in Forms mode:** `forms-mode.tsx` tracks which section is expanded via `openSections` state (a `Set<string>`) and persists the last-interacted section via `localStorage` key `plan-active-section-${planId}`. The Impact Strip needs to know the "active" section to show context-sensitive metrics. The simplest approach: accept the currently expanded section(s) as a prop or derive from the same localStorage key. If multiple sections are expanded, use the most recently interacted one.

- **Impact Strip position relative to scroll:** The Forms mode content scrolls in a container (`scrollContainerRef` in `forms-mode.tsx`). The Impact Strip must be `sticky bottom-0` within this scroll container, NOT `fixed` at the viewport bottom, so it stays attached to the Forms panel and doesn't overlap Reports or other views.

- **Delta indicator timing:** The 3-second highlight uses a `setTimeout`. If the user makes rapid edits (multiple changes within 3 seconds), each change should reset the timer for affected metrics and show the cumulative delta from the last "settled" state, not stack multiple delta indicators.

- **`usePlanOutputs` refetch behavior:** `usePlanOutputs` (from `client/src/hooks/use-plan-outputs.ts`) returns `{ output, isLoading, isFetching, error }`. The `isFetching` flag is true during background refetches. Use `isFetching` to show a subtle loading state on Impact Strip metrics rather than a full skeleton.

- **Document Preview is NOT a real PDF render.** It's a styled HTML representation. The actual PDF generation (server-side, using pdfkit or similar) is Story 6.1. The preview should look "document-like" (white pages with margins, formatted text, professional layout) but is HTML/CSS, not a PDF viewer.

- **Startup cost count for completeness:** The completeness calculation in `forms-mode.tsx` includes startup costs via `startupCostCount` state (tracked separately via `useStartupCosts`). The shared completeness utility must account for this — if a plan has startup cost entries, they contribute to the edited count.

- **Brand may be undefined during initial load.** The `brand` query depends on `plan.brandId`. Guard brand-dependent rendering (brand name on cover page, brand-specific copy) with null checks.

- **Story 6.1 dependency:** The "Generate PDF" buttons placed by this story are placeholder UI. They should be clearly wired to emit a toast and be easy for Story 6.1 to replace with actual generation logic. Consider using a shared `handleGeneratePdf` callback prop or a consistent event pattern.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/lib/plan-completeness.ts` | CREATE | Shared utility: `computeSectionProgress()`, `computeCompleteness()` (percentage), `getGenerateButtonLabel()` (label by completeness). Extracted from forms-mode.tsx logic. |
| `client/src/components/planning/impact-strip.tsx` | CREATE | `<ImpactStrip>` component: sticky bottom bar with context-sensitive metrics, delta indicators, miniature Guardian, deep link, document preview icon. ~150-200 lines. |
| `client/src/components/planning/document-preview-modal.tsx` | CREATE | `<DocumentPreviewModal>` component: full modal with document-style layout, cover page, financial summaries, DRAFT watermark, all-defaults note. ~150-200 lines. |
| `client/src/components/planning/document-preview-widget.tsx` | CREATE | `<DocumentPreviewWidget>` component: Dashboard card with miniature document preview, pride moment (franchisee name), View Full Preview, Generate PDF. ~80-120 lines. |
| `client/src/components/planning/forms-mode.tsx` | MODIFY | Import `computeSectionProgress` and `computeCompleteness` from shared utility (replacing local function). Add `<ImpactStrip>` as sticky bottom bar. Pass active section and plan data as props. |
| `client/src/components/planning/dashboard-panel.tsx` | MODIFY | Add `<DocumentPreviewWidget>` card to the dashboard layout. Pass plan data, brand data, completeness. |
| `client/src/components/planning/financial-statements.tsx` | MODIFY | Add "Generate PDF" button to the header area with completeness-aware label. Import `getGenerateButtonLabel` from shared utility. |
| `client/src/pages/planning-workspace.tsx` | MODIFY | Thread brand data and navigation functions to Forms mode and Dashboard for Impact Strip and Document Preview integration. Minor prop additions. |

### Testing Expectations

- **Playwright e2e testing (primary):** Impact Strip visibility, delta indicator appearance after value change, deep link navigation to Reports tab, miniature Guardian dot navigation, Document Preview modal open/close, Dashboard widget rendering with franchisee name, Generate PDF button label evolution by completeness state.
- **Critical ACs for test coverage:** AC 1 (context-sensitive metrics), AC 3 (deep link navigation), AC 6 (document preview icon → modal), AC 10 (Dashboard widget with name), AC 14 (Reports Generate PDF button with label).
- **No unit test framework established** in the current project for frontend components. Testing is via Playwright e2e.

### Dependencies & Environment Variables

- **No new packages needed.** All required UI components (Dialog, Card, Button, Skeleton from shadcn/ui), icons (lucide-react), and hooks (TanStack React Query, usePlanOutputs, usePlan, WorkspaceViewContext) are already installed and available.
- **No new environment variables needed.** Document Preview is client-side rendering from existing plan data.
- **Depends on Story 5.8 (Guardian Bar):** Guardian color tokens, `@keyframes guardian-pulse`, `computeGuardianState`, `isAllDefaults` must be available. Story 5.8 is in "review" status — these should already be implemented.
- **Story 6.1 (PDF Generation) is a forward dependency.** This story places the UI affordances (buttons, preview) that Story 6.1 will wire to actual PDF generation. Use toast placeholders for now.

### References

- `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` → Part 8 (My Plan Experience + Impact Strip behavior, lines 518-568)
- `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` → Part 13 (Document Preview + PDF Generation, lines 944-970)
- `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` → Part 14 (Empty + Incomplete States, lines 973-996)
- `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` → Part 15 (User Journey Tracing — Sam step 10-11, Chris step 3, lines 999-1035)
- `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` → Part 17 (Accessibility — responsive behavior, line 1125)
- `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` → Part 18 (Anti-Patterns — "Document preview inside financial statements", line 1152)
- `_bmad-output/planning-artifacts/architecture.md` → Decision 8 (State Management)
- `_bmad-output/planning-artifacts/architecture.md` → Decision 13 (Document Storage — metadata + immutable storage pattern for Story 6.1 forward reference)
- `_bmad-output/planning-artifacts/epics.md` → Story 5.9 (lines 1292-1349)
- `_bmad-output/planning-artifacts/epics.md` → Story 6.1 (lines 1400-1441, forward dependency reference)
- `client/src/lib/guardian-engine.ts` → `computeGuardianState()`, `isAllDefaults()`, `GuardianState`, `GuardianLevel`
- `client/src/components/planning/forms-mode.tsx` → `computeSectionProgress()` (line 44), `hasAnyUserEdits()` (line 58), `PlanCompleteness` component (line 210+)
- `client/src/components/planning/dashboard-panel.tsx` → existing Dashboard layout pattern
- `client/src/contexts/WorkspaceViewContext.tsx` → `navigateToStatements()`, `navigateToMyPlan()`
- `client/src/hooks/use-plan-outputs.ts` → `usePlanOutputs()` hook
- `client/src/hooks/use-plan.ts` → `usePlan()` hook

## Dev Agent Record

### Agent Model Used

(To be filled by dev agent)

### Completion Notes

(To be filled by dev agent)

### File List

(To be filled by dev agent)

### Testing Summary

(To be filled by dev agent)
