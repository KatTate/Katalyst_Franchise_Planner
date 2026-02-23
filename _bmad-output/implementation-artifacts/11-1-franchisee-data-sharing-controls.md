# Story 11.1: Franchisee Data Sharing Controls

Status: ready-for-dev

## Story

As a franchisee,
I want to control what financial data my franchisor can see,
so that I share details only when I'm comfortable doing so.

## Acceptance Criteria

1. **Given** I am logged in as a franchisee and viewing my plan workspace, **when** I click "Settings" in the sidebar, **then** I see a "Data Sharing" section with a clear, human-readable description of exactly what data will be shared with the franchisor if I opt in — listing shared fields (financial projections, startup costs, generated documents) and never-shared fields (AI conversations, personal notes) (FR33).

2. **Given** I am viewing the Data Sharing settings, **when** I have not yet opted in, **then** I see my current sharing status as "Not Sharing" with a prominent "Share with [Brand Name]" action, and **when** I click it, I see a confirmation dialog explaining the data that will be shared and a "Confirm" button to grant consent (FR34).

3. **Given** I have granted data sharing consent, **when** I view the Data Sharing settings, **then** I see my current sharing status as "Sharing" with a timestamp of when I opted in, and I see a "Stop Sharing" action to revoke consent at any time (FR35).

4. **Given** I have granted consent and then click "Stop Sharing", **when** I confirm the revocation, **then** sharing is revoked immediately — the status changes to "Not Sharing" and the franchisor can no longer see my financial details on their next request (FR35).

5. **Given** I grant or revoke consent, **then** the change is enforced at the API level via a `data_sharing_consents` audit trail table — not just hidden in the UI. A new append-only record is inserted for each grant/revoke action (FR38).

6. **Given** a franchisor admin requests my plan data via the API, **when** I have NOT opted in, **then** the API response includes only pipeline fields (plan name, pipeline stage, target market, target open quarter) and excludes all financial details (financial inputs, financial outputs, startup costs, documents) (FR36, FR37).

7. **Given** a franchisor admin requests my plan data via the API, **when** I HAVE opted in, **then** the API response includes pipeline fields AND financial details (financial inputs, financial outputs, startup costs) (FR37).

8. **Given** a Katalyst admin requests any plan data via the API, **then** the response always includes all fields regardless of consent status — Katalyst admins have full visibility (FR46).

9. **Given** I am a franchisor admin, **then** I cannot access the data sharing settings page or grant/revoke consent on behalf of a franchisee — consent is exclusively franchisee-controlled.

## Dev Notes

### Architecture Patterns to Follow

- **Schema in `shared/schema.ts`**: All new tables and types must be defined in this single file. Use Drizzle ORM `pgTable()` with `createInsertSchema()` + drizzle-zod for insert/select types. Follow existing naming: snake_case columns, camelCase TypeScript properties. (Source: `_bmad-output/planning-artifacts/architecture.md` — Code Structure)

- **IStorage interface in `server/storage.ts`**: All database operations go through the IStorage interface. Add new methods for consent operations. Never construct raw queries in route handlers. (Source: architecture.md — Data Access Layer)

- **Express router pattern**: Create a dedicated router file `server/routes/consent.ts`. Use `requireAuth` middleware from `server/middleware/auth.ts`. Use `getEffectiveUser()` for impersonation-aware user resolution. Follow the thin handler + storage method pattern established in `server/routes/plans.ts`. (Source: architecture.md — API Patterns)

- **RBAC three-layer enforcement**: Layer 1: `requireRole()` on route. Layer 2: `scopeToUser()` for query scoping. Layer 3: Response projection based on consent status. The consent check for franchisor plan visibility extends the existing `requirePlanAccess()` pattern in `server/routes/plans.ts:37-53`. (Source: architecture.md — Authorization)

- **API response format**: Success responses use `{ data: T }` shape. Error responses use `{ error: { message, code } }` shape. Validation errors include `details` field. (Source: architecture.md — API Patterns)

- **TanStack React Query**: Use `useQuery` for fetching consent status, `useMutation` for grant/revoke with `onSuccess` query invalidation. Query keys: `['plans', planId, 'consent']`. Never use `useState` for server data. (Source: architecture.md — State Management)

- **Component naming**: PascalCase for components (`DataSharingSettings`), kebab-case for files (`data-sharing-settings.tsx`). Place new components in `client/src/components/planning/` since this is a plan workspace feature. (Source: architecture.md — Naming Conventions)

- **data-testid convention**: Interactive elements: `button-grant-consent`, `button-revoke-consent`. Display elements: `badge-sharing-status`, `text-sharing-description`. (Source: architecture.md — Testing)

### UI/UX Deliverables

- **Settings view within plan workspace** (`workspaceView === "settings"`): Replace the existing placeholder in `client/src/pages/planning-workspace.tsx:130-144` with a real settings page component. The settings page should contain a "Data Sharing" card as its primary content.

- **Data Sharing Card**: A `Card` component containing:
  - Section title: "Data Sharing with [Brand Name]"
  - Description text explaining what will/won't be shared (shared: financial projections, startup cost breakdown, generated documents, planning timeline; never shared: AI conversations, personal notes)
  - Current status badge: "Sharing" (green) or "Not Sharing" (muted)
  - If sharing: timestamp of when consent was granted
  - Action button: "Share with [Brand Name]" (when not sharing) or "Stop Sharing" (when sharing)

- **Confirmation Dialog** (using shadcn `AlertDialog`):
  - **Grant consent dialog**: Title "Share Your Plan with [Brand Name]?", body listing shared/not-shared fields, "Confirm" and "Cancel" buttons
  - **Revoke consent dialog**: Title "Stop Sharing with [Brand Name]?", body explaining franchisor will lose access to financial details, "Stop Sharing" and "Cancel" buttons

- **UI States**:
  - Loading: Skeleton placeholders while consent status loads
  - Not opted in: "Not Sharing" badge, "Share" CTA
  - Opted in: "Sharing" badge with green indicator, granted timestamp, "Stop Sharing" action
  - Error: Toast notification with 3-part error message (what failed, data safety, what to do)
  - Mutation in-flight: Button shows loading spinner, disabled during request

- **Navigation**: Franchisee reaches data sharing via sidebar → Settings (already wired at `client/src/components/app-sidebar.tsx:171-181`)

### Anti-Patterns & Hard Constraints

- **DO NOT modify `components/ui/` files** — these are shadcn-managed primitives.
- **DO NOT create a new page route** — the settings view is rendered within the existing plan workspace via `WorkspaceViewContext`, not as a standalone route. There is already a `case "settings":` in `planning-workspace.tsx:130`.
- **DO NOT use `useState` for consent status** — use TanStack React Query. The consent status is server data.
- **DO NOT split the Drizzle schema across multiple files** — all tables go in `shared/schema.ts`.
- **DO NOT construct raw DB queries in route handlers** — all operations go through `IStorage` methods in `storage.ts`.
- **DO NOT allow franchisor or katalyst_admin roles to grant/revoke consent** — consent is exclusively controlled by the plan owner (franchisee).
- **DO NOT use `UPDATE` on `data_sharing_consents`** — this table is append-only. Each grant/revoke is a new INSERT. Current status is determined by querying the most recent record.
- **DO NOT make pipeline fields consent-dependent** — pipeline fields (name, pipeline_stage, target_market, target_open_quarter) are ALWAYS visible to franchisors regardless of consent status (FR36).
- **DO NOT use `db.push` to apply schema changes** — use `drizzle-kit generate` + `drizzle-kit migrate` for proper migration tracking. Or if the project uses `db:push` (confirmed in `package.json:11`), follow the existing convention.

### Gotchas & Integration Warnings

- **Existing `requirePlanAccess()` in `server/routes/plans.ts:37-53`** allows franchisor access to any plan in their brand (line 49-50). This function currently returns the full plan object. Story 11.1 requires adding response projection to strip financial fields when consent is not granted. The projection logic should be applied AFTER `requirePlanAccess()` succeeds, not inside it.

- **`getEffectiveUser()` in `server/middleware/auth.ts`** resolves demo/impersonation context. Consent endpoints must use this for the franchisee identity (the effective user, not the admin behind impersonation). During impersonation, the admin sees the franchisee's consent status but cannot modify it unless `impersonation_edit_enabled` is true AND the effective user is a franchisee.

- **Pipeline fields already exist on the `plans` table**: `pipelineStage` (line 185), `targetMarket` (line 187), `targetOpenQuarter` (line 188), `name` (line 181) in `shared/schema.ts`. These do NOT need to be added.

- **The `plans` table has no `data_sharing_consents` relation yet** — the new table references `plans.id` and `users.id`. Define the foreign key in the new table, not on the plans table.

- **Brand name resolution**: The UI needs the brand name for "Share with [Brand Name]". The brand is already available via `useBrandTheme()` hook (used in `app-sidebar.tsx:39`). Reuse this hook — do NOT fetch the brand separately.

- **The settings placeholder (`planning-workspace.tsx:130-144`)** currently imports `Card`, `CardContent`, and `Settings` from lucide-react. The replacement component will need these plus additional imports.

- **Existing `GET /api/plans` endpoint (`plans.ts:57-73`)** returns plans for franchisors via `getPlansByBrand()`. This currently returns full plan objects. The consent-based response projection should be applied here as well — franchisors listing plans should see projected (stripped) data for non-opted-in franchisees.

- **Auto-save and plan mutation endpoints** (`PATCH /api/plans/:planId`) should NOT be affected by consent — consent only controls what a franchisor can READ, not what a franchisee can WRITE.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `shared/schema.ts` | MODIFY | Add `dataSharingConsents` table, insert schema, types, and consent status type |
| `server/storage.ts` | MODIFY | Add IStorage methods: `getConsentStatus()`, `grantConsent()`, `revokeConsent()`; implement in `DatabaseStorage` |
| `server/routes/consent.ts` | CREATE | New router: `GET /api/plans/:planId/consent`, `POST /api/plans/:planId/consent/grant`, `POST /api/plans/:planId/consent/revoke` |
| `server/routes.ts` | MODIFY | Register new `consentRouter` |
| `server/routes/plans.ts` | MODIFY | Add consent-based response projection for franchisor role in `GET /api/plans` and `GET /api/plans/:planId` |
| `client/src/components/planning/data-sharing-settings.tsx` | CREATE | Data sharing settings component with consent status, grant/revoke actions, confirmation dialogs |
| `client/src/pages/planning-workspace.tsx` | MODIFY | Replace settings placeholder with `DataSharingSettings` component |

### Testing Expectations

- **API-level tests** (integration): Verify franchisor sees only pipeline fields without consent, sees financial fields with consent, Katalyst admin sees all fields regardless. Verify franchisee can grant/revoke consent. Verify non-franchisee roles cannot grant/revoke.
- **Frontend tests** (Playwright e2e): Verify settings page renders data sharing card, grant flow shows confirmation dialog and updates status, revoke flow shows confirmation and updates status.
- **Critical ACs for automated test coverage**: AC-5 (API enforcement), AC-6 (pipeline-only projection), AC-7 (full projection with consent), AC-8 (Katalyst full access), AC-9 (franchisor cannot modify consent).
- **Test framework**: Playwright (Replit runner) for e2e. Vitest for unit/integration tests on consent logic.
- **data-testid elements**: `button-grant-consent`, `button-revoke-consent`, `badge-sharing-status`, `text-sharing-description`, `dialog-grant-consent`, `dialog-revoke-consent`, `text-consent-timestamp`.

### Dependencies & Environment Variables

- **No new packages needed** — all required libraries are already installed:
  - `drizzle-orm@^0.39.3` (schema, queries)
  - `drizzle-zod@^0.7.0` (insert schema generation)
  - `@tanstack/react-query@^5.60.5` (client state)
  - `express@^5.0.1` (routing)
  - `zod@^3.24.2` (validation)
  - shadcn/ui components: Card, Badge, AlertDialog, Button, Skeleton (already installed)
- **No new environment variables needed** — uses existing `DATABASE_URL` and session config.
- **Database migration**: Run `npm run db:push` after adding the new `dataSharingConsents` table to `shared/schema.ts`.

### References

- `_bmad-output/planning-artifacts/epics.md` — Epic 11, Story 11.1 (FR33-FR38)
- `_bmad-output/planning-artifacts/prd.md` — FR33-FR38 (data sharing), NFR9-10 (RBAC, query isolation)
- `_bmad-output/planning-artifacts/architecture.md` — Data Sharing section, RBAC three-layer enforcement, API patterns, consent endpoint design, `data_sharing_consents` table schema
- `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` — Journey 7 (Franchisor Pipeline) for data boundary definitions, Journey 5 (Linda) for explicit with/without opt-in field lists
- `shared/schema.ts` — Existing `plans`, `users`, `brands` tables
- `server/storage.ts` — IStorage interface pattern
- `server/routes/plans.ts` — `requirePlanAccess()`, plan listing with role scoping
- `server/middleware/auth.ts` — `requireAuth`, `requireRole()`, `getEffectiveUser()`
- `server/middleware/rbac.ts` — `scopeToUser()`, `projectForRole()`
- `client/src/components/app-sidebar.tsx` — Settings nav item (line 171-181)
- `client/src/pages/planning-workspace.tsx` — Settings placeholder (line 130-144)
- `client/src/contexts/WorkspaceViewContext.tsx` — `"settings"` workspace view type

## Dev Agent Record

### Agent Model Used

(pending)

### Completion Notes

(pending)

### File List

(pending)

### Testing Summary

(pending)
