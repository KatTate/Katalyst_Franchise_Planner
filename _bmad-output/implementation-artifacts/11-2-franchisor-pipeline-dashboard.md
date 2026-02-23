# Story 11.2: Franchisor Pipeline Dashboard

Status: in-progress

## Story

As a franchisor admin,
I want to see a dashboard of all my brand's franchisees and their planning progress,
So that I have pipeline visibility into development activity (FR45, FR48).

## Acceptance Criteria

1. **Given** I am logged in as a franchisor admin **When** I click "Pipeline" in the sidebar **Then** I see a pipeline dashboard page at `/pipeline` showing all franchisees for my brand with: display name, planning status, pipeline stage, target market, and target open quarter — and the sidebar "Pipeline" nav item is active.

2. **Given** the pipeline dashboard is loading **When** the API request is in-flight **Then** I see a skeleton loading state (not a blank page) — and once data arrives the franchisee list renders with no layout shift.

3. **Given** my brand has franchisees at various pipeline stages **When** I view the dashboard **Then** I see a summary section at the top showing counts per pipeline stage (e.g., "12 Planning, 4 Site Evaluation, 3 Financing, 1 Construction, 2 Open") PLUS a "Stalled" count showing franchisees with no activity in 30+ days — with all counts matching the franchisee list below.

4. **Given** a franchisee has NOT opted in to data sharing **When** I view that franchisee's row in the pipeline dashboard **Then** I see pipeline-only data (display name, pipeline stage, target market, target open quarter, plan status, last activity date) — and NO financial details are visible (no revenue projections, startup costs, ROI, or financial documents).

5. **Given** a franchisee HAS opted in to data sharing **When** I view that franchisee's row in the pipeline dashboard **Then** I see pipeline data PLUS a visual indicator that financial details are available (e.g., an "eye" icon or "Financials Shared" badge) — and I can expand or click into the row to see financial summary data (projected annual revenue, total startup investment, break-even month, ROI).

6. **Given** the pipeline dashboard is loaded **When** the brand has up to 200 franchisees **Then** the page loads and renders within 3 seconds (NFR4) — verified by the pipeline API response returning within 2 seconds and the client rendering within 1 second of data receipt.

7. **Given** I am logged in as a franchisor admin for Brand A **When** I view the pipeline dashboard **Then** I see ONLY Brand A's franchisees — franchisees from other brands are never included in the API response or rendered on screen (NFR10 data isolation).

8. **Given** my brand has `franchisorAcknowledgmentEnabled` set to `true` **When** I click "Acknowledge" on a franchisee's plan in the pipeline dashboard **Then** the row updates to show an "Acknowledged" state with a timestamp (e.g., "Reviewed Feb 23") — and on subsequent visits the acknowledged state persists. **Given** the franchisee updates their plan after acknowledgment **Then** the acknowledged state resets (row returns to unacknowledged) so I know the plan has changed since my last review. If acknowledgment is disabled for the brand, the button does not appear. _(Note: This is franchisor-side tracking only. Franchisee-visible acknowledgment notifications are a Phase 2 consideration.)_

9. **Given** I am logged in as a Katalyst admin (not a franchisor) **When** I navigate to `/pipeline` **Then** I am either redirected to the admin dashboard (this page is franchisor-only; the Katalyst cross-brand dashboard is Story 11.3) OR I see a message indicating this page is for franchisor admins.

10. **Given** the pipeline dashboard is rendered **When** I inspect the page **Then** all interactive elements and data display elements have `data-testid` attributes following the project convention (e.g., `card-pipeline-${franchiseeId}`, `badge-pipeline-stage-${franchiseeId}`, `text-franchisee-name-${franchiseeId}`, `button-acknowledge-${planId}`).

11. **Given** I am on the pipeline dashboard **When** the dashboard has loaded **Then** I see a "Last updated" timestamp and a manual refresh button — clicking refresh re-fetches pipeline data without a full page reload.

12. **Given** the pipeline dashboard is rendered **When** I view the page on a viewport below 768px **Then** the layout adapts responsively — the summary counts stack vertically and the franchisee list uses a card layout instead of a table.

13. **Given** a franchisee has had no plan activity in 30 or more days **When** I view the pipeline dashboard **Then** that franchisee's row is visually flagged as "stalled" (e.g., a warning icon or amber highlight distinct from normal rows) — so I can immediately identify franchisees who may need outreach without scanning timestamps manually.

14. **Given** the pipeline dashboard is loaded with multiple franchisees **When** I click a column header (pipeline stage, last activity date, or target open quarter) **Then** the list sorts by that column (toggling ascending/descending on repeated clicks) — enabling me to quickly find stalled franchisees, upcoming openings, or franchisees at a specific stage.

## Dev Notes

### Architecture Patterns to Follow

- **Route module pattern**: Create `server/routes/pipeline.ts` as an Express Router (default export). Register it in `server/routes.ts` with `app.use("/api/pipeline", pipelineRouter)`. Follow the same pattern as `server/routes/brands.ts` — import `Router` from `express`, import `storage` from `../storage`, apply `requireAuth` and `requireRole` middleware.
  - *Source: architecture.md §Architectural Boundaries, §Route Module Pattern*

- **RBAC enforcement**: Use `requireRole("franchisor")` on the pipeline GET endpoint. Do NOT include `katalyst_admin` — Story 11.3 handles the cross-brand Katalyst dashboard separately. Use `getEffectiveUser(req)` (not `req.user`) to support impersonation/demo mode sessions. Scope queries with `effectiveUser.brandId`.
  - *Source: architecture.md §Decision 4 (RBAC), server/middleware/auth.ts*

- **Data isolation**: The pipeline API endpoint MUST include `WHERE brand_id = effectiveUser.brandId` in all queries. This is the "Layer 2: Query-level scoping" pattern. Never filter brand data in application code after retrieval — filter at the query level.
  - *Source: architecture.md §Three Authorization Layers*

- **Response projection (Layer 3)**: For each plan, check the most recent `data_sharing_consents` record. If the franchisee has an active grant, include financial summary fields. If not (or no consent record exists), return pipeline-only fields. This projection happens server-side — the client never receives data it shouldn't display.
  - *Source: architecture.md §Layer 3: Response-level projection*

- **Page file pattern**: Create `client/src/pages/pipeline.tsx` as a default export function component. Use `useAuth()` for role checks, `useQuery()` for data fetching with `queryKey: ["/api/pipeline"]`. Follow the same structure as `admin-brands.tsx` — loading skeleton, empty state, data grid.
  - *Source: architecture.md §Component Boundaries, client/src/pages/admin-brands.tsx*

- **Sidebar navigation**: Add a "Pipeline" nav item to `app-sidebar.tsx` visible only when `user.role === "franchisor"`. Use the `BarChart3` icon from lucide-react (already imported). Insert it after "Home" in the navItems array with `url: "/pipeline"` and `testId: "nav-pipeline"`.
  - *Source: architecture.md §Page Access Matrix, client/src/components/app-sidebar.tsx*

- **Route registration**: Add a `<Route path="/pipeline">` in `App.tsx` wrapped with an appropriate guard that allows `franchisor` role. The existing `AdminRoute` guard allows `franchisor` (it checks `role !== "franchisee"`), so it can be reused. Alternatively, create a `FranchisorRoute` guard if more precise role checking is needed.
  - *Source: client/src/App.tsx §AppRouter*

- **Naming conventions**: Files in kebab-case (`pipeline.tsx`, `pipeline-summary.tsx`), components in PascalCase (`PipelineDashboard`, `PipelineRow`), query keys as URL paths (`["/api/pipeline"]`), data-testid as `{type}-{description}-{id}`.
  - *Source: architecture.md §Naming Patterns, §data-testid Naming Convention*

- **TanStack Query**: Use the project's default query client configuration. Query keys should be `["/api/pipeline"]` for the main list. No optimistic updates needed — this is a read-only dashboard.
  - *Source: architecture.md §Communication Patterns*

- **UI components**: Use Shadcn primitives from `@/components/ui/` — Card, Table, Badge, Button, Skeleton. Never modify Shadcn source files. Use Tailwind utility classes for layout. Border radius follows project convention: Card = `rounded-2xl`, Button = `rounded-xl`.
  - *Source: architecture.md §Structure Patterns*

### UI/UX Deliverables

**Primary page: Pipeline Dashboard (`/pipeline`)**

Per UX Journey 7 (Linda, VP of Development at PostNet), the dashboard should show:

1. **Pipeline Summary Bar** — A horizontal bar or card row at the top showing:
   - Counts per pipeline stage: Planning | Site Evaluation | Financing | Construction | Open
   - A "Stalled" count (franchisees with no activity in 30+ days) — styled distinctly (amber/warning) to draw attention
   - Each with a count badge. Clicking a stage could filter the list (optional enhancement).

2. **Franchisee List/Table** — Sortable columns. One row per franchisee with:
   - **Always visible (pipeline fields)**: Franchisee display name, pipeline stage (as a colored badge), target market, target open quarter, plan status (draft/in_progress/completed), last activity date
   - **Stalled indicator**: Rows for franchisees with 30+ days inactivity show a visual warning (amber badge, warning icon, or row highlight) distinct from normal rows
   - **Visible only with opt-in**: A subtle secondary indicator (small unlock/shield icon — should NOT compete visually with the pipeline stage badge, which is the primary dimension) showing financials are shared. Expandable row or click-through showing: projected annual revenue, total startup investment, break-even month, ROI percentage
   - **Conditional**: Acknowledge/review button (only if `brand.franchisorAcknowledgmentEnabled === true`). Shows "Acknowledged [date]" state after click. Resets when franchisee updates their plan.
   - **Sortable columns**: Pipeline stage, last activity date, target open quarter (click header to toggle ascending/descending)

3. **Empty state** — If the brand has no franchisees yet: "No franchisees have started planning yet. Invite franchisees to begin."

4. **Loading state** — Skeleton cards/rows while data is fetching.

5. **Refresh control** — A "Last updated: [timestamp]" label with a refresh icon button.

6. **Responsive layout** — Table on desktop (>= 768px), card stack on mobile (< 768px).

- *Source: ux-design-specification-consolidated.md §Part 15, Journey 7*

### Anti-Patterns & Hard Constraints

- **DO NOT include `katalyst_admin` in the pipeline route's `requireRole`** — Katalyst admins get their own cross-brand dashboard in Story 11.3. Mixing both roles into one endpoint creates scoping complexity. Katalyst admins currently have no brandId, so `WHERE brand_id = ...` would fail.

- **DO NOT expose raw `financial_inputs` or `financial_outputs` JSONB** to the franchisor endpoint — even for opted-in franchisees. The pipeline dashboard shows **summary metrics only** (annual revenue, total startup investment, break-even month, ROI). Extract these from cached `financial_outputs` server-side and return a curated projection.

- **DO NOT modify `shared/schema.ts` for pipeline stage types** — The `pipelineStage` field already exists on the plans table with the correct type union: `"planning" | "site_evaluation" | "financing" | "construction" | "open"`. Do not add a new table or duplicate this enum.

- **DO NOT modify existing Shadcn UI components** in `client/src/components/ui/`. Build all pipeline UI from Shadcn primitives without changing their source.

- **DO NOT create a new IStorage interface method that bypasses brand scoping.** The storage layer must always receive brandId for franchisor queries. Never write `SELECT * FROM plans` without a WHERE clause.

- **DO NOT add WebSocket or real-time subscriptions** — The pipeline dashboard is request/response. Real-time pipeline updates are explicitly Phase 2 per architecture.md §Future Considerations.

- **DO NOT use `req.user` directly** — Always use `getEffectiveUser(req)` which handles impersonation and demo mode sessions correctly.

- **DO NOT store acknowledgment state on the plans table** — Acknowledgments have their own `plan_acknowledgments` table to support audit trail and reset detection. Do not overload the plans table with franchisor-specific columns.

- **DO NOT build franchisee-visible acknowledgment notifications** — Acknowledgment is franchisor-side tracking only in this story. Franchisee-facing notifications ("Your franchisor reviewed your plan") are a Phase 2 consideration that would require cross-role data flow, notification UI on the franchisee dashboard, and UX decisions about placement and prominence. Do not scope-creep into this.

### Gotchas & Integration Warnings

- **Story 11.1 dependency**: This story depends on Story 11.1 (Franchisee Data Sharing Controls) being complete. Story 11.1 creates the `data_sharing_consents` table, consent API endpoints, and storage methods. If 11.1 is not yet implemented when this story begins, the dev agent must create the consent infrastructure as part of this story or stub the consent check (always return "not opted in") with a clear TODO.

- **No consent table exists today**: As of this story's creation, the `data_sharing_consents` table referenced in architecture.md has NOT been implemented in `shared/schema.ts`. The dev agent needs to either: (a) implement the table as specified in architecture.md §Core Entity Model (`data_sharing_consents[plan_id, user_id, action, granted_at, ip_address]`), or (b) coordinate with Story 11.1 if it has already been built.

- **`getPlansByBrand()` already exists** in storage.ts — reuse it, do not create a duplicate. It returns all plans for a brand. The pipeline endpoint should join this with user data (franchisee display names) and consent status.

- **`getFranchiseesByBrand()` already exists** in storage.ts — use this to get the list of franchisee users for the brand.

- **Sidebar visibility logic**: The navItems array in `app-sidebar.tsx` uses `visible` flags. Add the Pipeline item with `visible: user?.role === "franchisor" && !hideAdminNav`. Be careful not to show Pipeline during impersonation/demo mode when the real user's role is masked.

- **AdminRoute guard allows franchisor**: The existing `AdminRoute` component in `App.tsx` only blocks `franchisee` role — it allows both `katalyst_admin` and `franchisor`. This means a Katalyst admin could technically navigate to `/pipeline`. Handle this gracefully in the page component (show a redirect or message per AC-9).

- **Pipeline stage values**: The `pipelineStage` column defaults to `"planning"` for all new plans. Many plans may not have `targetMarket` or `targetOpenQuarter` set — handle null/empty values gracefully in the UI (show "—" or "Not set").

- **Last activity date accuracy (Party Mode finding F4)**: The `plan.updatedAt` field fires on every auto-save, including when a franchisee merely opens their plan without making meaningful changes. For stalled detection (AC-13) and the "last activity" display, prefer tracking when `financial_inputs` actually change rather than raw `updatedAt`. Options: (a) compare `financial_inputs` hashes on save to detect real changes, (b) use a separate `lastMeaningfulActivity` timestamp updated only when input values change, or (c) use `updatedAt` as-is for MVP with a dev note to refine later. The dev agent should choose the simplest approach that makes stalled detection reliable — option (c) is acceptable for MVP if the 30-day window is generous enough to absorb false positives from casual opens.

- **Acknowledgment reset logic**: The `plan_acknowledgments` table should track `acknowledged_at` and `plan_updated_at_snapshot` (the plan's `updatedAt` at time of acknowledgment). When rendering the pipeline row, compare `plan.updatedAt > acknowledgment.plan_updated_at_snapshot` — if true, the plan has changed since acknowledgment and the acknowledged state should not display. This avoids needing a trigger or event system to "reset" acknowledgments.

- **Financial summary extraction**: The `financial_outputs` JSONB on the plans table contains cached engine results. Key fields for the pipeline summary: `annualSummary[0].totalRevenue` (Year 1 revenue), startup costs total from `plan_startup_costs`, `breakEvenMonth`, `roicPct` from the engine output. The dev agent should examine `EngineOutput` in `shared/financial-engine.ts` for the exact field paths.

- **Demo franchisees**: Brands may have demo franchisee accounts (`users.isDemo = true`). These should be **excluded** from the pipeline dashboard — real franchisors should never see system-managed demo accounts in their pipeline.

- **Express Router pattern**: The project uses `const router = Router(); ... export default router;` (default export), NOT the `registerXRoutes(app, storage)` pattern described in architecture.md. Follow the **actual codebase pattern** from `server/routes/brands.ts`, not the architecture doc's example.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `shared/schema.ts` | MODIFY | Add `data_sharing_consents` table + Drizzle insert schema + types (*skip if Story 11.1 has already created this*). Add `plan_acknowledgments` table with columns: `id`, `plan_id` (FK), `franchisor_user_id` (FK), `acknowledged_at` (timestamp), `plan_updated_at_snapshot` (timestamp for reset detection). |
| `server/storage.ts` | MODIFY | Add IStorage methods: `getConsentStatus(planId)`, `grantConsent(planId, userId)`, `revokeConsent(planId, userId)`, `getPipelineData(brandId)` (joins plans + users + consent). *Skip consent methods if Story 11.1 has already created them.* |
| `server/routes/pipeline.ts` | CREATE | New Express Router with: `GET /` (pipeline data scoped to brand, joins plans + users + consent + acknowledgment status, includes stalled flag for 30+ day inactivity), `POST /:planId/acknowledge` (create acknowledgment record with plan_updated_at_snapshot), `DELETE /:planId/acknowledge` (optional — remove acknowledgment). Apply `requireAuth`, `requireRole("franchisor")`. |
| `server/routes.ts` | MODIFY | Import and register `pipelineRouter` with `app.use("/api/pipeline", pipelineRouter)`. |
| `client/src/pages/pipeline.tsx` | CREATE | Pipeline dashboard page. Summary bar + franchisee list/table + loading/empty states + refresh button. Responsive layout. |
| `client/src/components/pipeline/pipeline-summary.tsx` | CREATE | Summary bar component showing counts per pipeline stage. |
| `client/src/components/pipeline/pipeline-row.tsx` | CREATE | Individual franchisee row component. Shows pipeline fields, conditional financial data, optional acknowledge button. |
| `client/src/components/app-sidebar.tsx` | MODIFY | Add "Pipeline" nav item for franchisor role. |
| `client/src/App.tsx` | MODIFY | Add `/pipeline` route with appropriate guard. |
| Drizzle migration | CREATE | Migration for `data_sharing_consents` table (and `plan_acknowledgments` if applicable). *Skip if Story 11.1 migration already created consent table.* |

### Testing Expectations

- **Unit/integration tests**: The pipeline API endpoint should be tested for:
  - Franchisor sees only their brand's franchisees (data isolation)
  - Opted-in franchisees include financial summary; non-opted-in do not
  - Demo franchisees (`isDemo = true`) are excluded
  - Non-franchisor roles are rejected (401/403)
  - Empty brand (no franchisees) returns empty array, not error
  - Stalled flag: franchisees with `updatedAt` older than 30 days are flagged as stalled in API response
  - Acknowledgment: POST creates record, GET returns acknowledged state, state resets when plan `updatedAt` exceeds `plan_updated_at_snapshot`

- **Test framework**: The project uses Vitest for unit/server tests. Playwright for E2E. `data-testid` attributes are mandatory for all interactive and display elements.

- **Critical ACs for automated coverage**: AC-4 (no financial data without opt-in), AC-7 (data isolation), AC-9 (Katalyst admin redirect/block), AC-13 (stalled detection).

### Dependencies & Environment Variables

- **Packages already installed** — do NOT reinstall:
  - `@tanstack/react-query` (5.60.5) — data fetching
  - `@tanstack/react-table` (8.21.3) — optional, for table rendering
  - `drizzle-orm` (0.39.3) — database queries
  - `zod` (3.24.2) — validation schemas
  - `lucide-react` (0.453.0) — icons (BarChart3, Eye, RefreshCw, etc.)
  - `wouter` (3.3.5) — routing
  - `recharts` (2.15.2) — optional, if pipeline stage chart is added

- **No new packages required** for this story. All UI components are available via Shadcn primitives and existing libraries.

- **No new environment variables** required.

- **Database migration**: Run `drizzle-kit push` after schema changes to sync the `data_sharing_consents` table (and `plan_acknowledgments` if applicable).

### References

- [Source: _bmad-output/planning-artifacts/epics.md §Epic 11, Story 11.2] — Story definition, acceptance criteria, FR references
- [Source: _bmad-output/planning-artifacts/architecture.md §Decision 4 (RBAC)] — Three authorization layers, scopeToUser, projectForRole
- [Source: _bmad-output/planning-artifacts/architecture.md §Core Entity Model] — data_sharing_consents table, plans pipeline fields, brands.franchisorAcknowledgmentEnabled
- [Source: _bmad-output/planning-artifacts/architecture.md §API Endpoints] — GET /api/pipeline, GET /api/pipeline/summary
- [Source: _bmad-output/planning-artifacts/architecture.md §Naming Patterns] — Database, API, code, data-testid conventions
- [Source: _bmad-output/planning-artifacts/architecture.md §Page Access Matrix] — Pipeline at /pipeline, protected for franchisor + katalyst_admin
- [Source: _bmad-output/planning-artifacts/architecture.md §Requirements to Structure Mapping §Pipeline (FR45-48)] — Primary files: pipeline.tsx, pipeline/*, pipeline.ts
- [Source: _bmad-output/planning-artifacts/ux-design-specification-consolidated.md §Journey 7] — Linda (franchisor admin) pipeline dashboard UX journey
- [Source: _bmad-output/planning-artifacts/prd.md §FR45-FR48] — Functional requirements for pipeline visibility
- [Source: _bmad-output/planning-artifacts/prd.md §FR33-FR38] — Data sharing and privacy functional requirements
- [Source: server/middleware/rbac.ts] — Existing scopeToUser and projectForRole implementations
- [Source: server/routes/brands.ts] — Route module pattern reference (Express Router, default export)
- [Source: server/storage.ts] — IStorage interface, getPlansByBrand(), getFranchiseesByBrand()
- [Source: client/src/components/app-sidebar.tsx] — Sidebar navigation structure, role-based visibility
- [Source: client/src/App.tsx] — Route registration, AdminRoute guard

## Dev Agent Record

### Agent Model Used

### Completion Notes

### File List

### Testing Summary
