# Story 5.10: Glossary & Contextual Help

Status: ready-for-dev

## Story

As a franchisee,
I want access to a glossary of financial terms and contextual help for every input field,
so that I can understand what each metric means and make informed decisions (FR7k, FR7l).

## Acceptance Criteria

### Glossary Page

1. Given I look at the sidebar navigation, when the HELP section renders, then a "Glossary" navigation item is visible (BookOpen icon) that navigates to a dedicated Glossary page at route `/glossary`.

2. Given I navigate to the Glossary page, when the page renders, then I see a searchable list of 15 financial terms: Payback Period, EBITDA, Adj Net Profit Before Tax, Shareholder Salary Adjustment, EBITDA Multiple, Average Unit Volume (AUV), Direct Labor Cost, Facilities, Equity - Cash, Core Capital, Estimated Distributions, ROIC, Breakeven, Number of Months to Breakeven, Cash Flow.

3. Given I type in the search input on the Glossary page, when I enter a partial term (e.g., "break"), then the list filters to show only terms matching the search text (case-insensitive match on term name and definition text), and the search input includes `data-testid="input-glossary-search"`.

4. Given I view a glossary term entry, when it renders, then it shows: the term name as a heading, a plain-language definition (universal across all brands), how it's calculated (derived from engine logic and expressed in plain language), and a "See it in your plan" link that navigates to the relevant financial statement tab and section. The term entry includes `data-testid="glossary-term-{termSlug}"` (e.g., `glossary-term-ebitda`).

5. Given the franchisee's brand has benchmark values configured by the franchisor (via brand defaults/parameters), when a glossary term that has a corresponding brand metric renders, then the brand-specific benchmark value is displayed alongside the definition. Benchmarks are sourced from the brand's configuration at display time — they are NOT hardcoded in the glossary data.

6. Given the franchisee's brand has NO benchmark configured for a particular metric, when that glossary term renders, then it shows only the definition and calculation — no benchmark section is displayed.

### Computed Cell Hover Tooltips (Financial Statements)

7. Given I hover over any computed cell in a financial statement tab (P&L, Balance Sheet, Cash Flow, Summary, ROIC, Valuation), when the tooltip renders, then it shows: what the number means in plain language, how it's calculated (e.g., "Revenue ($360,000) minus COGS ($108,000)"), and a "Learn more" link to the full Glossary entry for that term (if a glossary entry exists for this metric).

8. Given a computed cell's tooltip includes a "Learn more" link, when I click it, then I am navigated to the Glossary page scrolled to (or filtered to) the relevant term entry.

9. Given a computed cell does not have a corresponding glossary entry, when the tooltip renders, then the "Learn more" link is not shown — only the explanation and formula are displayed.

### Input Field Contextual Help (Forms Mode, Quick Entry, Startup Costs)

10. Given I view any input field in Forms mode, Quick Entry mode, or Startup Costs, when the field renders, then an info icon (HelpCircle from lucide-react) is visible next to the field label.

11. Given I hover over (or click on mobile) the info icon next to an input field, when the tooltip renders, then it shows the field's explanation text (1-2 sentences). For consolidated fields (those matching the spreadsheet directly), the tooltip text comes from the spreadsheet cell comments. For decomposed sub-fields (Forms mode guided fields like rent, utilities, telecom), the tooltip text is newly authored content specific to that sub-field.

12. Given the tooltip for an input field renders, when it includes a "Learn more" link, then clicking the link opens an expanded help panel (inline expandable section or popover) with deeper explanation (1-2 paragraphs of guidance content). The expanded help content is sourced from the Loom video teaching content that has been distilled into text.

13. Given the tooltip for an input field renders, when it includes a related glossary term, then a link to that glossary term's page entry is shown (e.g., "See Glossary: EBITDA").

14. Given the franchisee's brand has a benchmark value for a specific input field (from brand defaults), when the tooltip renders, then the brand benchmark is displayed in the tooltip (e.g., "Brand average: 28%").

### Help Content Data Model

15. Given the help content system is implemented, when the application loads, then all help content is available as static TypeScript data files in `shared/help-content/` directory — no database table is needed, and content is compiled into the application bundle.

16. Given the help content data model, when each field help entry is structured, then it includes: `fieldId` (matching engine field identifier, e.g., "input.facilities", "input.facilities.rent"), `tooltip` (short text, 1-2 sentences), `expandedGuidance` (deeper text, 1-2 paragraphs), `glossaryTermSlug` (links to glossary entry, nullable), `parentFieldId` (for decomposed sub-fields, points to consolidated parent, nullable), and `source` ('spreadsheet_comment' | 'video_extraction' | 'authored').

17. Given the initial content inventory, when the help content files are populated, then they include: 15 glossary term definitions, approximately 33 tooltip texts sourced from spreadsheet cell comments (for consolidated input fields), and placeholder entries for approximately 20 decomposed sub-field tooltips marked with `source: 'authored'`. Expanded guidance (from Loom video extraction) should have placeholder text with a clear comment indicating "TODO: Extract from Loom video content" — the actual video content extraction is a separate content authoring task that will happen outside the codebase.

### data-testid Coverage

18. Given the Glossary page renders, then it includes: `data-testid="page-glossary"` on the page container, `data-testid="input-glossary-search"` on the search input, `data-testid="glossary-term-{termSlug}"` on each term entry, `data-testid="link-see-in-plan-{termSlug}"` on each "See it in your plan" link.

19. Given an input field info icon renders, then it includes: `data-testid="help-icon-{fieldId}"` on the info icon (e.g., `help-icon-cogs-pct`), `data-testid="help-tooltip-{fieldId}"` on the tooltip content container, `data-testid="link-learn-more-{fieldId}"` on the "Learn more" link (when present).

20. Given a computed cell tooltip renders with a "Learn more" link, then it includes: `data-testid="link-glossary-{rowKey}"` on the glossary link.

## Dev Notes

### Architecture Patterns to Follow

- **Help content as static data (architecture.md, Help Content Data Model):** Help content is platform-level text data — not per-brand, not per-user. Store as TypeScript data files in `shared/help-content/`. This means the data is compiled into the application bundle and available on both client and server. No database table needed. Content changes require a deployment, which is appropriate for authoritative financial guidance.
  - Source: `_bmad-output/planning-artifacts/architecture.md` → Help Content Data Model section

- **API endpoints (architecture.md, API Design):** Three help content endpoints are defined:
  - `GET /api/help/glossary` — returns all glossary terms
  - `GET /api/help/fields` — returns all field help content
  - `GET /api/help/fields/:fieldId` — returns help for a specific field
  These serve the static TypeScript data files via Express routes. TanStack React Query should be used on the frontend to fetch and cache this data.
  - Source: `_bmad-output/planning-artifacts/architecture.md` → API Design, Help Content section

- **Existing tooltip pattern (pnl-tab.tsx):** The P&L tab already implements a `CellTooltip` interface with `explanation` and `formula` fields. Computed cells render tooltips via shadcn `<Tooltip>`, `<TooltipTrigger>`, `<TooltipContent>`. This existing pattern should be extended — not replaced — to include a "Learn more" glossary link. The same pattern exists across balance-sheet-tab.tsx, cash-flow-tab.tsx, roic-tab.tsx, valuation-tab.tsx, and audit-tab.tsx.
  - Source: `client/src/components/planning/statements/pnl-tab.tsx` → `CellTooltip` interface (line 25), tooltip rendering (line 796)

- **Sidebar navigation (app-sidebar.tsx):** The sidebar already has a "HELP" section with a "Book Consultation" item. The Glossary item should be added to this same section. Use `BookOpen` icon from lucide-react (already imported set includes other icons; BookOpen is available from the same package). The sidebar uses `SidebarMenuButton` with `asChild` and wouter `Link` components for navigation.
  - Source: `client/src/components/app-sidebar.tsx` → HELP section (lines 187-209)

- **Routing (wouter, App.tsx):** Add a `/glossary` route in `App.tsx` pointing to a new `GlossaryPage` component in `client/src/pages/glossary.tsx`. Follows the existing pattern where pages are in `client/src/pages/` and registered in `App.tsx`'s `Router` component.
  - Source: `client/src/App.tsx` → Router component

- **Brand data access pattern:** Brand parameters (including any benchmark values) are fetched via `useQuery<Brand>({ queryKey: ["/api/brands", brandId] })`. The brand object includes `parameters` (JSONB containing financial defaults and ranges). Benchmark display should use `brand?.parameters?.fieldName` with null checks.
  - Source: `client/src/pages/planning-workspace.tsx` → brand query pattern

- **Naming conventions:** Components: PascalCase. Files: kebab-case. Constants: SCREAMING_SNAKE_CASE. data-testid: `{action}-{target}` for interactive, `{type}-{content}` for display.
  - Source: `_bmad-output/planning-artifacts/architecture.md` → Naming Patterns

- **Navigation to financial statements:** Use wouter `useLocation` for navigation from the Glossary page. Tab IDs for financial statement views: `summary`, `pnl`, `balance-sheet`, `cash-flow`, `roic`, `valuation`, `audit`. Navigate via `/planning?tab={tabId}` parameterized URL.
  - Source: `client/src/contexts/WorkspaceViewContext.tsx`

### UI/UX Deliverables

**Glossary Page (`/glossary`):**
- Full-width page accessible from sidebar navigation
- Search input at the top for filtering terms
- List/grid of 15 financial terms, each as an expandable card or section
- Each term shows: term name (heading), definition (paragraph), calculation explanation, "See it in your plan" navigation link
- Brand benchmark section (conditional — only shown when brand data has a relevant benchmark)
- Related terms links (optional, for cross-referencing between terms)
- Clean, readable layout consistent with the application's card/border styling pattern
- Empty state if search returns no results: "No matching terms found"

**Computed Cell Tooltip Enhancement:**
- Extend existing `CellTooltip` in statement tabs to include optional `glossarySlug` field
- When present, render a "Learn more" link at the bottom of the tooltip that navigates to `/glossary?term={slug}`
- Tooltip layout: explanation text (first line), formula (second line, muted text), "Learn more" link (third line, primary color)

**Input Field Help Icons:**
- Small `HelpCircle` icon (16px, muted foreground color) positioned to the right of input field labels
- On hover: shows tooltip with brief explanation text
- Tooltip includes "Learn more" link that opens expanded guidance (inline expandable section below the field, or a popover/dialog)
- If brand benchmark exists for the field, show it in the tooltip: "Brand average: X%"
- Icon should not interfere with field interaction or layout — always visible, positioned inline

**UI States:**
- Loading: Glossary page shows skeleton cards while help content loads
- Empty search: "No matching terms found" message
- No brand benchmarks: Benchmark section simply omitted (not shown as empty)
- Error: If help content API fails, show "Unable to load help content" with retry option

### Anti-Patterns & Hard Constraints

- **DO NOT hardcode benchmark values in the glossary data files.** Benchmarks are brand-specific and come from brand configuration at display time. The glossary data contains only universal definitions and calculations.
  - Source: Course Correction Addendum Section 3.3, Architecture Help Content Data Model

- **DO NOT embed or link to Loom videos.** The video content is extracted into text-based guidance (`expandedGuidance` field). The application stores text, not video URLs. Placeholder expanded guidance should have TODO comments for content extraction.
  - Source: Course Correction Addendum Section 3.1

- **DO NOT create a database table for help content.** The architecture decision explicitly states: "Help content is static data compiled into the application bundle (TypeScript data files in `shared/help-content/`). No database table needed."
  - Source: `_bmad-output/planning-artifacts/architecture.md` → Storage Decision

- **DO NOT replace the existing `CellTooltip` pattern in statement tabs.** Extend the existing interface to add an optional `glossarySlug` field. The current tooltip rendering in pnl-tab.tsx (and other tabs) should be enhanced, not rewritten.
  - Source: `client/src/components/planning/statements/pnl-tab.tsx` → existing CellTooltip pattern

- **DO NOT modify `vite.config.ts`, `server/vite.ts`, `package.json`, or `drizzle.config.ts`.** These are protected files per project guidelines.

- **DO NOT add help icons in a way that changes field layout on hover.** The help icon must always be present (visibility-based, not display-based toggling). No layout shifts.
  - Source: Development guidelines → universal design guidelines → layout

- **DO NOT create separate help content for each brand.** Help content (definitions, calculations, tooltips) is platform-level. Only benchmarks are brand-specific and sourced from the brand's parameter configuration.

### Gotchas & Integration Warnings

- **Glossary page needs access to brand data for benchmarks.** The page is outside the planning workspace, so it needs its own brand query. The current user's `brandId` is available from the session/user context. If the user is a Katalyst admin without a brand, benchmarks simply don't render.

- **"See it in your plan" links require a plan context.** The Glossary page is a standalone page, not inside the planning workspace. The "See it in your plan" link should navigate to the planning workspace with the relevant tab. If the user has no active plan, the link should either be disabled or navigate to the workspace (which will prompt plan selection). Use wouter `useLocation` for navigation: `/planning?tab=pnl` (or similar parameterized navigation).

- **Tooltip enhancement across multiple statement tabs.** The `CellTooltip` interface and tooltip rendering exists in pnl-tab.tsx and is likely duplicated across balance-sheet-tab, cash-flow-tab, roic-tab, valuation-tab, and audit-tab. When adding the glossary link, ensure all tabs are updated consistently. Consider extracting the tooltip rendering into a shared `<ComputedCellTooltip>` component if not already done.

- **Input field help icons in Forms mode vs Quick Entry.** Forms mode uses accordion sections with labeled fields (`forms-mode.tsx`). Quick Entry uses `editable-cell.tsx` within statement tabs. The info icon integration will look different in each context — ensure both are covered.

- **Field ID mapping between help content and engine.** The `fieldId` in help content must match the keys used in `FIELD_METADATA` (`field-metadata.ts`) and `PlanFinancialInputs` (from `shared/financial-engine.ts`). Ensure consistent naming: use the engine field key (e.g., `cogsPct`, `laborPct`, `rentMonthly`) as the `fieldId` in help content.

- **Decomposed sub-field help content needs `parentFieldId`.** Sub-fields like `input.facilities.rent` should reference parent `input.facilities` so the UI can show "This is part of the Facilities total" context.

- **UX spec Part 11 is Scenario Comparison, not Glossary.** The epics dev notes reference "UX spec Part 11 (Glossary)" but the consolidated UX spec's Part 11 is actually Scenario Comparison. The glossary is mentioned in the story breakdown table as "5.10: Glossary + Contextual Help" with scope "Glossary page + inline tooltip integration." The primary source for glossary requirements is the Course Correction Addendum Section 3 (Help Content System) and Section 4 (Help Content Architecture).

- **Existing tooltip data in pnl-tab.tsx is inline.** Currently, tooltip `explanation` and `formula` text is hardcoded in the P&L row definitions. This story should consider whether to migrate these inline tooltips to the centralized help content system or keep them as-is and overlay the glossary link. Recommendation: keep existing inline tooltips (they're tightly coupled to row definitions), add only the glossary link from the help content system.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `shared/help-content/glossary-terms.ts` | CREATE | 15 glossary term definitions with id, term, definition, calculation, relatedTerms, statementTab (for "See it in your plan" navigation), and slug. |
| `shared/help-content/field-help.ts` | CREATE | Field help content entries: ~33 from spreadsheet comments, ~20 placeholders for decomposed sub-fields. Each with fieldId, tooltip, expandedGuidance (placeholder TODOs for Loom content), glossaryTermSlug, parentFieldId, source. |
| `shared/help-content/index.ts` | CREATE | Barrel export for glossary-terms and field-help. Utility lookup functions: `getGlossaryTerm(slug)`, `getFieldHelp(fieldId)`, `searchGlossary(query)`. |
| `server/routes.ts` | MODIFY | Add three help content API routes: GET /api/help/glossary, GET /api/help/fields, GET /api/help/fields/:fieldId. Serve static data from shared/help-content. |
| `client/src/pages/glossary.tsx` | CREATE | GlossaryPage component: search input, filtered term list, term cards with definition/calculation/benchmark/navigation links. |
| `client/src/App.tsx` | MODIFY | Add `/glossary` route pointing to GlossaryPage. |
| `client/src/components/app-sidebar.tsx` | MODIFY | Add "Glossary" navigation item (BookOpen icon) to HELP section, navigating to `/glossary`. |
| `client/src/components/shared/field-help-icon.tsx` | CREATE | Reusable `<FieldHelpIcon>` component: HelpCircle icon, tooltip with explanation text, "Learn more" expandable guidance, glossary link, brand benchmark display. Used by Forms mode and Quick Entry. |
| `client/src/components/planning/statements/pnl-tab.tsx` | MODIFY | Extend `CellTooltip` interface with optional `glossarySlug`. Add "Learn more" link to tooltip rendering for computed cells that have a glossary entry. |
| `client/src/components/planning/statements/balance-sheet-tab.tsx` | MODIFY | Same tooltip enhancement as P&L — add glossary links to computed cell tooltips. |
| `client/src/components/planning/statements/cash-flow-tab.tsx` | MODIFY | Same tooltip enhancement — add glossary links to computed cell tooltips. |
| `client/src/components/planning/statements/roic-tab.tsx` | MODIFY | Same tooltip enhancement — add glossary links to computed cell tooltips. |
| `client/src/components/planning/statements/valuation-tab.tsx` | MODIFY | Same tooltip enhancement — add glossary links to computed cell tooltips. |
| `client/src/components/planning/statements/audit-tab.tsx` | MODIFY | Same tooltip enhancement — add glossary links to computed cell tooltips. |
| `client/src/components/planning/forms-mode.tsx` | MODIFY | Integrate `<FieldHelpIcon>` next to input field labels. Pass field IDs for help content lookup. |
| `client/src/components/planning/editable-cell.tsx` | MODIFY | Integrate `<FieldHelpIcon>` for Quick Entry input cells (if applicable within the cell layout). |

### Testing Expectations

- **Playwright e2e testing (primary):** Glossary page navigation from sidebar, search filtering, term display with definition/calculation, "See it in your plan" link navigation, computed cell tooltip glossary links, input field help icon visibility and tooltip content.
- **Critical ACs for test coverage:** AC 1 (sidebar navigation to glossary), AC 2 (15 terms rendered), AC 3 (search filtering), AC 4 (term content display), AC 7 (computed cell tooltip with glossary link), AC 10 (info icon next to input fields), AC 11 (tooltip content display).
- **No unit test framework established** in the current project for frontend components. Testing is via Playwright e2e.

### Dependencies & Environment Variables

- **No new packages needed.** All required UI components (Tooltip, Card, Input from shadcn/ui), icons (lucide-react BookOpen, HelpCircle), and routing (wouter Link, useLocation) are already installed.
- **No new environment variables needed.** Help content is static data compiled into the bundle.
- **Depends on Stories 5.2-5.8 (Financial Statement tabs):** Computed cell tooltips must exist in all statement tabs for glossary link enhancement. These stories are in "done" or "review" status — the tooltip infrastructure should already be implemented.
- **Content authoring dependency:** The expanded guidance text (from Loom video extraction) is a content task. The implementation should create placeholder text with clear TODO markers for content extraction. This does NOT block the story implementation — the data model, UI components, and integration can all be built with placeholder content.

### References

- `_bmad-output/planning-artifacts/architecture.md` → Help Content Data Model (lines 988-1016)
- `_bmad-output/planning-artifacts/architecture.md` → API Design, Help Content endpoints (lines 597-600)
- `_bmad-output/planning-artifacts/epics.md` → Story 5.10: Glossary & Contextual Help
- `_bmad-output/course-corrections/cc-2026-02-15-addendum-guided-decomposition.md` → Section 3 (Help Content System), Section 3.3 (Glossary Content), Section 4 (Help Content Architecture)
- `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` → Part 5 (Dynamic Interpretation, Type 3 Hover Tooltips)
- `client/src/components/planning/statements/pnl-tab.tsx` → CellTooltip interface (line 25), tooltip rendering (line 796)
- `client/src/components/app-sidebar.tsx` → HELP section (lines 187-209)
- `client/src/lib/field-metadata.ts` → FIELD_METADATA, CATEGORY_ORDER

## Dev Agent Record

### Agent Model Used

### Completion Notes

### File List

### Testing Summary
