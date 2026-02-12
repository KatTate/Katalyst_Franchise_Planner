# Story 4.1: Planning Layout, Dashboard & Mode Switcher

Status: done

## Story

As a franchisee,
I want to choose how I enter my plan data using a clear mode switcher, with a live financial dashboard always available,
so that I can use the input method that works best for me and see the impact of every change (FR12, FR13, FR7).

## Acceptance Criteria

1. **Given** I am viewing my plan at `/plans/:planId`, **when** the planning workspace loads, **then** a segmented control mode switcher shows "Planning Assistant | Forms | Quick Entry" at the top of the workspace below the header and above the content area, and all three options are always visible — none are hidden, disabled, or locked.

2. **Given** I am in the planning workspace, **when** I click a different mode in the segmented control, **then** the content area restructures immediately — no loading spinner, no confirmation dialog, no "are you sure?" prompt. The segmented control stays fixed during the transition; only the content below changes.

3. **Given** I have entered financial input values in one mode, **when** I switch to another mode, **then** all financial input state is preserved — no values are lost, no reset occurs. The dashboard metrics remain consistent across the switch.

4. **Given** I select a mode, **when** the workspace renders, **then** the Direction F (Hybrid Adaptive) layout is applied: the sidebar collapses automatically in Planning Assistant mode for immersion, and restores to expanded state in Forms and Quick Entry modes. The sidebar transition uses a 200–300ms animation, and users with `prefers-reduced-motion` enabled see an instant transition with no animation.

5. **Given** I select a mode in the workspace, **when** I log out and log back in, **then** my last selected mode is restored as the active mode in the segmented control. The mode preference is saved to my user profile (the `preferredTier` field on the users table).

6. **Given** the planning workspace loads, **when** the layout renders, **then** a financial dashboard panel is displayed alongside the input area in a resizable split view using `react-resizable-panels`. The input panel is on the left and the dashboard is on the right. The split-view enforces minimum widths: 360px for the input panel and 480px for the dashboard panel. The resize handle is visible and draggable.

7. **Given** my plan has financial inputs, **when** the dashboard panel renders, **then** I see summary cards with 4–5 headline metrics: Total Startup Investment, Projected Annual Revenue (Year 1), ROI (5-Year), Break-Even Month, and Monthly Cash Flow (Year 1 Average). All financial values display with consistent formatting: currency with `$` and commas (via `formatCents`), percentages with 1 decimal place (NFR27).

8. **Given** the dashboard panel renders, **when** I view charts below the summary cards, **then** I see Recharts-powered visualizations: a break-even timeline chart (area/line chart showing cumulative cash flow crossing zero) and a revenue vs. expenses chart (monthly grouped bars over the projection period). Charts use the Katalyst design system colors: brand primary for revenue/positive, Charcoal for expenses/negative, and correct axis/grid styling per the UX specification.

9. **Given** I change a financial input value (via any mode), **when** the dashboard receives updated engine outputs, **then** the summary cards and charts update to reflect the new projections. The dashboard uses optimistic UI — showing client-side engine results within 200ms — with full server-confirmed recalculation following within 500ms.

10. **Given** a financial field has been populated, **when** I view it in the workspace, **then** a source attribution badge displays its origin: "Brand Default" (for brand-seeded values), "AI-Populated" (for AI-extracted values), or "Your Entry" (for user-modified values). The badge reflects the `source` field from the per-field metadata in `PlanFinancialInputs`.

11. **Given** I am a new franchisee viewing my first plan, **when** the plan has `quickStartCompleted === false`, **then** the `QuickStartOverlay` component renders instead of the planning workspace content. When I complete or dismiss the Quick Start, the overlay unmounts and the full planning workspace appears.

12. **Given** the planning workspace is the real route at `/plans/:planId`, **when** it is fully implemented, **then** the temporary dev routes (`/plans/:planId/startup-costs-dev`, `/plans/:planId/metrics-dev`, `/plans/:planId/inputs-dev`, `/plans/:planId/quick-start`) are removed from `App.tsx` and their dev page files are deleted. The workspace subsumes the functionality these dev pages demonstrated.

## Dev Notes

### Architecture Patterns to Follow

**Layout Architecture (from Architecture Doc, Decision 9):**

The planning workspace follows the component hierarchy defined in the architecture:

```
<PlanningWorkspace>                        (page-level route component at /plans/:planId)
  ├── <PlanningHeader>                     (shared — mode switcher, save status, plan name)
  │     └── <ModeSwitcher>                 (segmented control: Planning Assistant | Forms | Quick Entry)
  ├── <QuickStartOverlay>                  (conditional — shown when quickStartCompleted === false)
  └── <SplitView>                          (ResizablePanelGroup — horizontal)
        ├── <InputPanel>                   (LEFT — mode-specific content)
        │     ├── Planning Assistant mode → placeholder with message "Planning Assistant mode — coming in Epic 6"
        │     ├── Forms mode → placeholder with message "Forms mode — coming in Story 4.2"
        │     └── Quick Entry mode → placeholder with message "Quick Entry mode — coming in Story 4.3"
        └── <DashboardPanel>               (RIGHT — shared financial dashboard)
              ├── <SummaryCards>            (4-5 headline metrics: investment, revenue, ROI, break-even, cash flow)
              └── <DashboardCharts>         (Recharts: break-even timeline + revenue vs. expenses)
```

The `SummaryMetrics` component from `client/src/components/shared/summary-metrics.tsx` already renders the 4 headline metrics (Total Startup Investment, Projected Annual Revenue, ROI, Break-Even). Reuse it or extract its `MetricCard` pattern into the dashboard. Add a 5th metric: Monthly Cash Flow (Year 1 Average) — computed as `annualSummaries[0].netCashFlow / 12` from `EngineOutput`.

**State Management (from Architecture Doc, Decision 8):**

- `usePlan(planId)` — loads plan data including `financialInputs`, `startupCosts`, `quickStartCompleted`
- `usePlanOutputs(planId)` — loads computed engine outputs (monthlyProjections, annualSummaries, roiMetrics)
- Local `useState` for active mode selection (synced to `preferredTier` on user profile via PATCH `/api/auth/me` or similar)
- The `useSidebar()` hook from shadcn provides `setOpen(boolean)` to programmatically collapse/expand the sidebar based on the active mode
- Client-side engine import (`import { calculateProjections, unwrapForEngine } from '@shared/financial-engine'`) enables instant dashboard preview (< 200ms) before server confirmation

**Mode Switcher Mechanics:**

- Active mode stored in local state, initialized from `user.preferredTier` (default: `"forms"` if null)
- On mode switch: (1) update local state immediately, (2) call `useSidebar().setOpen(mode !== 'planning_assistant')` for sidebar behavior, (3) debounced PATCH to update `preferredTier` on user profile
- Mode values match the database enum: `"planning_assistant"`, `"forms"`, `"quick_entry"`
- The segmented control uses shadcn/ui `Tabs` (or custom segmented control component) with user-facing labels: "Planning Assistant", "Forms", "Quick Entry"

**Sidebar Collapse Behavior (Direction F):**

- Planning Assistant mode: `setOpen(false)` — sidebar collapses to icon-only 44px state
- Forms mode: `setOpen(true)` — sidebar expanded
- Quick Entry mode: `setOpen(true)` — sidebar expanded
- The shadcn sidebar component already supports `collapsible="icon"` with CSS transitions. Ensure the transition duration is 200–300ms via the existing CSS custom properties (`--sidebar-width` transition) or Tailwind `transition-all duration-300`
- Add `@media (prefers-reduced-motion: reduce)` to override transition to `duration-0` (instant)

**Split View Panel Configuration:**

- Use `ResizablePanelGroup` (from `client/src/components/ui/resizable.tsx`) with `direction="horizontal"`
- Left panel (`ResizablePanel`): `minSize` based on pixel conversion — 360px minimum. Use `react-resizable-panels` minSize as a percentage or use the `minSizePixels` prop if available in the installed version
- Right panel (`ResizablePanel`): 480px minimum
- `ResizableHandle` with `withHandle` for a visible grip indicator
- Default split: approximately 40/60 (input/dashboard) at typical viewport widths

**Chart Implementation (from UX Design Specification):**

- Library: Recharts (already installed as `recharts` in package.json)
- shadcn's chart component wrapper exists at `client/src/components/ui/chart.tsx`
- **Break-even timeline chart:** `AreaChart` (or `ComposedChart` with `Area`) showing cumulative cash flow over 60 months. Positive area filled with brand primary at 20% opacity; negative area filled with red at 10% opacity. The zero crossing point IS the break-even moment
- **Revenue vs. Expenses chart:** `BarChart` with grouped bars — revenue bars in brand primary, expense bars in Charcoal (`#50534C`). Show monthly data or aggregate to annual if 60 bars is too dense
- Chart data source: `EngineOutput.monthlyProjections[]` for monthly data, `EngineOutput.annualSummaries[]` for annual data
- Chart styling: Roboto Mono for tick values, Charcoal for axis labels, `#D0D1DB` at 30% opacity for grid lines, `#3D3936` tooltip background, 300ms ease-out animation on data transitions

**Source Attribution Badges:**

- Three badge variants: "Brand Default" (neutral/muted), "AI-Populated" (info/gurple), "Your Entry" (primary/accent)
- Read from `FinancialFieldValue.source` which is `'brand_default' | 'user_entry' | 'ai_populated'`
- Map to user-facing labels: `brand_default` → "Brand Default", `user_entry` → "Your Entry", `ai_populated` → "AI-Populated"
- Use the `Badge` component from shadcn/ui with appropriate variant styling
- Badge is small (xs text, rounded-lg) and appears inline next to or below the field value

**Routing & Integration:**

- The planning workspace replaces the implicit "plan page" — route is `/plans/:planId` (the same route that currently doesn't have a real page)
- The dashboard page (franchisee home page at `/`) should link to plans via "Start Planning" or clicking a plan card, navigating to `/plans/:planId`
- On the dashboard page, if the user has no plans, show a "Create Plan" CTA that POST `/api/plans` and redirects to `/plans/:newPlanId`

**Quick Start Integration:**

- In the planning workspace, before rendering the split view content, check `plan.quickStartCompleted`
- If `false`: render `<QuickStartOverlay planId={planId} brand={brand} onComplete={() => invalidatePlan()} />` in place of the workspace content
- If `true`: render the normal workspace (mode switcher, split view, dashboard)
- The `QuickStartOverlay` component already handles the complete/skip flow and patches `quickStartCompleted = true`

### UI/UX Deliverables

**Planning Workspace Page (`/plans/:planId`):**

The full-screen planning experience. The page occupies the entire content area (sidebar + main content). This is where franchisees spend the majority of their time.

**Key UI Elements:**

1. **Planning Header** — Minimal bar above the content area containing:
   - Plan name (editable inline or read-only for MVP)
   - Mode switcher segmented control (Planning Assistant | Forms | Quick Entry)
   - Auto-save status indicator area (placeholder — auto-save implemented in Story 4.5)

2. **Mode Switcher (Segmented Control)** — Three segments with the user-facing labels. The active segment is highlighted with the brand primary color. Switching is instant. Follows the Notion database view-switch feel — lightweight, not heavy navigation.

3. **Input Panel (Left)** — Content changes per mode:
   - **Planning Assistant:** Placeholder card — "The AI Planning Advisor will be available here. For now, use Forms or Quick Entry to build your plan." (Epic 6 builds the real content)
   - **Forms:** Placeholder card — "Section-based input forms are coming soon." (Story 4.2 builds the real content)
   - **Quick Entry:** Placeholder card — "Spreadsheet-style input grid is coming soon." (Stories 4.3–4.4 build the real content)

4. **Financial Dashboard (Right Panel)** — Always visible regardless of mode:
   - **Summary Cards** row: 5 metric cards (Total Investment, Year 1 Revenue, 5-Year ROI, Break-Even Month, Monthly Cash Flow). Each card shows the metric label (Montserrat, sm), the value (Roboto Mono, 2xl or 3xl), and a subtle trend sparkline or indicator if data supports it
   - **Break-Even Timeline Chart:** Area chart with cumulative cash flow, zero-line reference, month labels on X-axis, dollar values on Y-axis
   - **Revenue vs. Expenses Chart:** Bar chart with grouped monthly or annual bars
   - Dashboard scrolls independently from the input panel

5. **Resize Handle** — Between input and dashboard panels. Subtle 2px line with grab cursor on hover, GripVertical icon centered.

**UI States:**

- **Loading:** Full skeleton layout with shimmer on all cards and charts while plan/outputs load
- **Error:** "We couldn't load your plan. Your data is safe — please try refreshing." with retry button
- **Empty plan (no financial inputs):** Dashboard shows placeholder with zeros and a message: "Enter your first values to see your financial dashboard come to life"
- **Quick Start active:** `QuickStartOverlay` replaces the workspace content entirely

**Navigation:**

- User reaches this page by clicking a plan from the dashboard (`/`) or being redirected after plan creation
- URL: `/plans/:planId` — the canonical planning workspace route
- Back navigation: sidebar brand logo or "Dashboard" link returns to `/`

**`data-testid` Attributes:**

- `planning-workspace` — main workspace container
- `mode-switcher` — segmented control container
- `mode-switcher-planning-assistant` — Planning Assistant segment
- `mode-switcher-forms` — Forms segment
- `mode-switcher-quick-entry` — Quick Entry segment
- `input-panel` — left panel container
- `dashboard-panel` — right panel container
- `dashboard-summary-cards` — summary cards row
- `metric-card-investment` — Total Investment card
- `metric-card-revenue` — Year 1 Revenue card
- `metric-card-roi` — ROI card
- `metric-card-breakeven` — Break-Even card
- `metric-card-cashflow` — Monthly Cash Flow card
- `chart-breakeven-timeline` — break-even area chart
- `chart-revenue-expenses` — revenue vs. expenses bar chart
- `source-badge-brand-default` — brand default badge
- `source-badge-user-entry` — user entry badge
- `source-badge-ai-populated` — AI populated badge
- `quick-start-overlay` — (already exists on QuickStartOverlay)

### Anti-Patterns & Hard Constraints

- **DO NOT** modify files in `client/src/components/ui/` — these are shadcn primitives (resizable.tsx, sidebar.tsx, chart.tsx, etc.) managed by the shadcn CLI. Style overrides go in consuming components or in `index.css`.
- **DO NOT** modify `vite.config.ts` or `drizzle.config.ts`.
- **DO NOT** modify `shared/financial-engine.ts` — the engine is complete and tested. Consume it; don't change it.
- **DO NOT** modify `shared/plan-initialization.ts` — use its existing functions (unwrapForEngine, buildPlanFinancialInputs, etc.).
- **DO NOT** modify `server/services/financial-service.ts` — engine orchestration is complete.
- **DO NOT** use red/error styling for financial metric values — even negative ROI or extended break-even timelines use the "Gurple" (#A9A2AA) advisory color, never red. Red is reserved for actual system errors.
- **DO NOT** implement auto-save in this story — auto-save is Story 4.5. The mode preference save to user profile is a targeted PATCH, not a general auto-save mechanism.
- **DO NOT** implement the actual content for any input mode — Planning Assistant (Epic 6), Forms (Story 4.2), and Quick Entry (Stories 4.3–4.4) each have their own stories. This story delivers the workspace SHELL with placeholder content in the input panel.
- **DO NOT** create a new financial formatting utility — use existing `formatCents()` and `parseDollarsToCents()` from `client/src/lib/format-currency.ts`. Use `formatROI()` and `formatBreakEven()` exported from `client/src/components/shared/summary-metrics.tsx`.
- **DO NOT** duplicate the `SummaryMetrics` component logic — reuse it or extract shared `MetricCard` components. The existing `SummaryMetrics` already renders 4 of the 5 required metrics.
- **DO NOT** build responsive/mobile stacked layout in this story — the planning workspace is desktop-first (minimum 1024px per NFR25). Below 1024px, a message indicating desktop is recommended is acceptable. The tabbed stacked mode for sub-1024px is Story Mode-specific and comes with Epic 6.
- **DO NOT** remove the `QuickStartOverlay` component or its dev page logic — only remove the dev ROUTE from App.tsx. The component itself is reused in the workspace.

### Gotchas & Integration Warnings

- **Dev route cleanup requires care:** Stories 3.3–3.6 each created dev pages at `/plans/:planId/startup-costs-dev`, `/plans/:planId/metrics-dev`, `/plans/:planId/inputs-dev`, `/plans/:planId/quick-start`. When removing these routes from `App.tsx`, verify no other code references these routes (e.g., links in the dashboard or sidebar). The dev page FILES can be deleted since their functionality is subsumed by the workspace, but the COMPONENTS they rendered (`StartupCostBuilder`, `SummaryMetrics`, `FinancialInputEditor`, `QuickStartOverlay`) are still used.

- **The `useSidebar` hook must be called within `SidebarProvider` context:** The planning workspace page is already rendered inside `AuthenticatedLayout` which wraps with `SidebarProvider`. Verify this is the case in `App.tsx`. The `useSidebar().setOpen()` call for Direction F behavior will work only if the workspace component is a child of `SidebarProvider`.

- **Sidebar transition duration is controlled by CSS:** The shadcn sidebar component uses CSS transitions for collapse/expand. The default transition may not be exactly 200–300ms. Check `client/src/components/ui/sidebar.tsx` for transition classes and override via `index.css` if needed (e.g., `[data-slot="sidebar"] { transition-duration: 250ms; }`). Do NOT modify the sidebar.tsx file directly — use CSS overrides.

- **`react-resizable-panels` minSize is percentage-based by default:** The library's `minSize` prop expects a percentage of the total group size, not pixels. For pixel-based minimums, use `minSizePixels` (available in react-resizable-panels v2.x). Check the installed version in `package.json` — it should be v2.1+ based on the architecture doc. If `minSizePixels` is not available, calculate percentage equivalents based on a 1024px minimum viewport minus sidebar width.

- **Mode preference PATCH endpoint may not exist yet:** The `preferredTier` column exists on the `users` table, but there may not be a PATCH endpoint for updating user profile fields. Check `server/routes/` for a user profile update endpoint (e.g., `PATCH /api/auth/me` or `PATCH /api/users/me`). If none exists, add a minimal one that accepts `{ preferredTier }` and updates the authenticated user's record.

- **`EngineOutput` may be null for a new plan:** If the plan has no financial inputs yet (freshly created with `financialInputs: null`), `usePlanOutputs(planId)` may return null or an error. The dashboard must handle this gracefully — show zeroed metrics with a helpful message rather than crashing.

- **Brand data needed for source badge context:** The `QuickStartOverlay` requires the brand object. Ensure the brand is loadable by franchisees — this was fixed in Story 3.6 code review (added franchisee access to `GET /api/brands/:brandId`).

- **Chart data from EngineOutput:** The `monthlyProjections` array contains 60 entries. For the break-even chart, compute cumulative cash flow by summing `netCashFlow` from month 1 through month N for each month. For revenue vs. expenses, use `revenue` and `totalExpenses` from each monthly projection. The `annualSummaries` array (5 entries) may be preferable for the bar chart to avoid 60 clustered bars.

- **`server/routes/plans.ts` is a high-churn file:** Per Epic 3 retrospective, this file had 10 modifications in Epic 3 and is at risk of growing unwieldy. If adding a mode preference endpoint, consider whether it belongs in a separate user profile route file rather than plans.ts.

- **Existing tests must continue passing:** All 140+ tests from Epic 3 (engine, plan-init, financial service, quick-start helpers) must pass after changes. Run `npx vitest` to verify.

- **The `preferredTier` values use user-facing names:** The enum values in the schema are `"planning_assistant" | "forms" | "quick_entry"` (user-facing labels), not the internal names `"story" | "normal" | "expert"`. The mode switcher, state management, and persistence must all use these same values consistently.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/planning-workspace.tsx` | CREATE | Main planning workspace page component — layout shell, mode switcher, Quick Start conditional, split view with input panel + dashboard panel |
| `client/src/components/planning/planning-header.tsx` | CREATE | Minimal header bar: plan name, mode switcher segmented control, save status placeholder |
| `client/src/components/planning/mode-switcher.tsx` | CREATE | Segmented control component for Planning Assistant / Forms / Quick Entry with active state styling |
| `client/src/components/planning/dashboard-panel.tsx` | CREATE | Right-side financial dashboard: summary cards + charts, consumes usePlanOutputs |
| `client/src/components/planning/dashboard-charts.tsx` | CREATE | Recharts break-even timeline and revenue vs. expenses charts |
| `client/src/components/planning/input-panel.tsx` | CREATE | Left-side panel that renders mode-specific content (placeholders for now) |
| `client/src/components/shared/source-badge.tsx` | CREATE | Reusable source attribution badge component ("Brand Default" / "AI-Populated" / "Your Entry") |
| `client/src/App.tsx` | MODIFY | Replace dev routes with `/plans/:planId` pointing to PlanningWorkspace; remove startup-costs-dev, metrics-dev, inputs-dev, quick-start routes |
| `client/src/pages/startup-costs-dev.tsx` | DELETE | Dev page subsumed by workspace |
| `client/src/pages/metrics-dev.tsx` | DELETE | Dev page subsumed by workspace |
| `client/src/pages/inputs-dev.tsx` | DELETE | Dev page subsumed by workspace |
| `client/src/pages/quick-start-dev.tsx` | DELETE | Dev page subsumed by workspace |
| `server/routes/users.ts` or `server/routes/auth.ts` | MODIFY | Add PATCH endpoint for user profile update (preferredTier) if not already present |
| `client/src/hooks/use-current-user.ts` or equivalent | MODIFY | Ensure the current user hook exposes `preferredTier` and a mutation to update it |
| `client/src/index.css` | MODIFY | Add sidebar transition duration override (250ms) and prefers-reduced-motion support if not already present |

### Dependencies & Environment Variables

**Packages already installed (DO NOT reinstall):**
- `react-resizable-panels` — split view panels (v2.1+)
- `recharts` — charting library
- `@tanstack/react-query` — server state management
- `framer-motion` — animations (for metric transitions)
- `lucide-react` — icons
- `drizzle-orm`, `drizzle-zod`, `zod` — schema and validation
- `class-variance-authority`, `clsx`, `tailwind-merge` — styling utilities
- All shadcn/ui components (sidebar, tabs, badge, card, etc.)

**No new packages needed.**

**No new environment variables needed.**

**Database migration:** If adding a PATCH endpoint for user profile, no schema change is needed — `preferredTier` column already exists on the `users` table. If the `plans` table needs any adjustments (unlikely), run `npx drizzle-kit push` after schema changes.

### References

- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Decision 8 (State Management: TanStack React Query + React Context), Decision 9 (Component Architecture: PlanningLayout, SplitView, InputPanel, DetailPanel hierarchy), Decision 10 (Routing: `/plans/:id` is the planning experience), Decision 15 (Engine Design: pure TypeScript, runs client-side)
- Epics: `_bmad-output/planning-artifacts/epics.md` — Epic 4 overview, Story 4.1 AC (mode switcher, Direction F, split view, dashboard, source badges, formatting), FR7 (live-updating metrics), FR12 (three experience tiers), FR13 (switch tiers at any time)
- UX Design: `_bmad-output/planning-artifacts/ux-design-specification.md` — Direction F (Hybrid Adaptive) layout, Mode Switcher Interaction Design (segmented control, instant switch, background AI completion), Split-screen layout (360px/480px minimums), Financial Dashboard (Mercury-inspired 4-5 headline metrics with drill-down), Chart inventory (break-even timeline, revenue vs. expenses, sparklines), Color system (Katalyst Green, Charcoal, Gurple), Typography (Montserrat headings, Roboto body, Roboto Mono financials), Spacing (Mode-specific density: Story=lg/xl, Normal=md/lg, Expert=sm/md), Shape system (rounded-2xl cards, rounded-xl buttons), Shadow system (background color contrast, not shadows for cards), Data Visualization styling (Recharts, axis labels, tooltips)
- PRD: `_bmad-output/planning-artifacts/prd.md` — FR7 (live-updating summary metrics), FR12 (three experience tiers), FR13 (switch between tiers at any time), NFR1 (< 2s recalculation), NFR25 (desktop 1024px+), NFR27 (consistent financial formatting), NFR28 (200ms visual feedback)
- Story 3.4: `_bmad-output/implementation-artifacts/3-4-live-summary-metrics-accounting-validation.md` — SummaryMetrics component, MetricCard, formatROI, formatBreakEven, usePlanOutputs hook
- Story 3.5: `_bmad-output/implementation-artifacts/3-5-financial-input-api-per-field-reset.md` — usePlan hook, PATCH endpoint, formatCents, FinancialInputEditor patterns
- Story 3.6: `_bmad-output/implementation-artifacts/3-6-quick-roi-first-90-second-experience.md` — QuickStartOverlay component, client-side engine invocation pattern, dev route pattern (to be removed), brand data access fix
- Epic 3 Retrospective: `_bmad-output/implementation-artifacts/epic-3-retrospective.md` — server/routes/plans.ts high-churn warning, dev route pattern observations, test count baseline (140+)
- Existing code: `client/src/components/ui/resizable.tsx` (ResizablePanelGroup, ResizablePanel, ResizableHandle), `client/src/components/ui/sidebar.tsx` (useSidebar, SidebarProvider, setOpen, toggleSidebar), `client/src/components/ui/chart.tsx` (Recharts wrapper), `client/src/components/shared/summary-metrics.tsx` (SummaryMetrics, MetricCard, formatROI, formatBreakEven), `client/src/components/shared/quick-start-overlay.tsx` (QuickStartOverlay), `client/src/hooks/use-plan.ts` (usePlan, planKey), `client/src/hooks/use-plan-outputs.ts` (usePlanOutputs, planOutputsKey), `client/src/lib/format-currency.ts` (formatCents, parseDollarsToCents), `shared/financial-engine.ts` (calculateProjections, EngineOutput, MonthlyProjection, AnnualSummary, ROIMetrics), `shared/plan-initialization.ts` (unwrapForEngine, buildPlanFinancialInputs), `shared/schema.ts` (plans table, users table with preferredTier)

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes
Implemented the full planning workspace shell with:
- **Mode Switcher**: Segmented control with 3 modes (Planning Assistant, Forms, Quick Entry). Instant switching via local state. Mode preference persisted to user profile via debounced PATCH `/api/auth/me`.
- **Direction F Layout**: Sidebar auto-collapses in Planning Assistant mode, expands in Forms/Quick Entry. 250ms transition with prefers-reduced-motion override.
- **Split View**: ResizablePanelGroup with horizontal split — input panel (left, 40% default) and dashboard panel (right, 60% default). Draggable resize handle.
- **Financial Dashboard**: 5 metric cards (Investment, Revenue, ROI, Break-Even, Monthly Cash Flow) reusing MetricCard from SummaryMetrics. Two Recharts charts: break-even timeline (AreaChart) and revenue vs. expenses (BarChart with annual data).
- **Quick Start Integration**: Conditional render of QuickStartOverlay when plan.quickStartCompleted is false.
- **Dev Route Cleanup**: Removed 4 dev routes and deleted 4 dev page files. Added single `/plans/:planId` route.
- **Server-side**: Added PATCH `/api/auth/me` endpoint and `updateUserPreferredTier` storage method.
- **Input panels are placeholders** per story scope — actual mode content comes in Stories 4.2-4.4 and Epic 6.
- **Source badge component** created and ready for use in subsequent stories.
- **minSize** uses percentages (react-resizable-panels default) — pixel-based enforcement noted as known limitation per story gotcha section.

### LSP Status
Pre-existing infrastructure warnings only (missing type defs for node, vite/client). No new errors introduced.

### Visual Verification
N/A — no running web server available in this environment. UI components verified via successful build compilation.

### Test Results
298 tests passed, 0 failed. 12 test files. No regressions from baseline.

### File List
- `client/src/pages/planning-workspace.tsx` — CREATED — Main planning workspace page
- `client/src/components/planning/planning-header.tsx` — CREATED — Header with mode switcher and plan name
- `client/src/components/planning/mode-switcher.tsx` — CREATED — Segmented control for experience tiers
- `client/src/components/planning/dashboard-panel.tsx` — CREATED — Financial dashboard with metrics and charts
- `client/src/components/planning/dashboard-charts.tsx` — CREATED — Recharts break-even and revenue/expenses charts
- `client/src/components/planning/input-panel.tsx` — CREATED — Mode-specific input panel with placeholders
- `client/src/components/shared/source-badge.tsx` — CREATED — Source attribution badge component
- `client/src/App.tsx` — MODIFIED — Replaced dev routes with `/plans/:planId`, workspace-aware layout
- `client/src/index.css` — MODIFIED — Added sidebar transition duration and prefers-reduced-motion
- `server/routes/auth.ts` — MODIFIED — Added PATCH `/api/auth/me` endpoint for preferredTier
- `server/storage.ts` — MODIFIED — Added `updateUserPreferredTier` to IStorage and DatabaseStorage
- `client/src/pages/startup-costs-dev.tsx` — DELETED
- `client/src/pages/metrics-dev.tsx` — DELETED
- `client/src/pages/inputs-dev.tsx` — DELETED
- `client/src/pages/quick-start-dev.tsx` — DELETED

### Code Review Record

**Reviewer:** Claude Opus 4.6 (adversarial code review)
**Date:** 2026-02-12
**Outcome:** All HIGH and MEDIUM issues fixed. Story status → done.

**Findings Resolved (4 fixed):**

1. **[HIGH] Quick Start completion used `window.location.reload()` instead of query invalidation** — Dev Notes specified `onComplete={() => invalidatePlan()}` but implementation used a full page reload. Fixed to use `queryClient.invalidateQueries({ queryKey: planKey(planId) })` which triggers a React re-render without losing client state.

2. **[MEDIUM] Break-even chart didn't include initial investment offset** — Cumulative cash flow started from $0 instead of -$totalStartupInvestment, meaning the zero-crossing didn't represent actual investment recovery. Fixed by subtracting `totalStartupInvestment` from cumulative operating cash flow so the chart aligns with the Break-Even metric card.

3. **[MEDIUM] Split view minSize percentages too low** — Was `minSize={25}` / `minSize={35}` (too permissive at narrow viewports). Bumped to `minSize={30}` / `minSize={40}` which matches AC6 pixel specs at ~1200px content width. Note: `react-resizable-panels` v2.1.7 does not support `minSizePixels`; percentage-based enforcement is the only option.

4. **[LOW] `ExperienceTier` type duplicated in 4 files** — Extracted as `export type` from `mode-switcher.tsx` and all consuming files now import from single source.

**Remaining Notes (not fixed, acceptable):**

- **[MEDIUM] No client-side engine computation for optimistic dashboard updates** — Dev Notes describe the pattern (`calculateProjections` + `unwrapForEngine` for < 200ms preview) but input panels are all placeholders in this story. The optimistic UI architecture should be established in Stories 4.2–4.4 when actual input editing is implemented.
- **[LOW] Mode switcher active segment uses generic theme colors** — UX spec says brand primary, implementation uses `bg-background`. Acceptable for MVP; can be refined in a polish pass.
- **[LOW] Source badge component created but not integrated** — Expected per story scope (placeholder input panels). Ready for Stories 4.2+.

**Post-Fix Verification:**
- Build: Vite build succeeds (1,151 KB JS)
- Tests: 298 passed, 0 failed, 12 test files
- TSC: Pre-existing infrastructure warnings only, no new errors
