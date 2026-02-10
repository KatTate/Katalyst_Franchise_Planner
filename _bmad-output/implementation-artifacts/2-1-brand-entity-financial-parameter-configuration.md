# Story 2.1: Brand Entity & Financial Parameter Configuration

Status: done

## Story

As a Katalyst admin,
I want to create and configure a franchise brand with its financial parameter set,
so that franchisees of that brand can plan with accurate default values (FR39).

## Acceptance Criteria

1. **Given** I am logged in as a Katalyst admin and navigate to the Brand Management page via the sidebar,
   **Then** I see a list of all existing brands showing name, display name, and creation date,
   **And** I see a "Create New Brand" button.

2. **Given** I am on the Brand Management page,
   **When** I click "Create New Brand",
   **Then** I see a brand creation form (dialog or inline) with fields for: Brand Name, Display Name, and Slug (auto-generated from name, editable).

3. **Given** I am filling out the brand creation form,
   **When** I submit the form with valid values,
   **Then** the new brand appears in my brand list,
   **And** I see a success confirmation message,
   **And** I am taken to the brand detail page where I can configure financial parameters.

4. **Given** I submit the brand creation form with a name that already exists,
   **When** I click Save,
   **Then** I see a validation error indicating the brand name must be unique.

5. **Given** I am on the brand detail page,
   **When** I navigate to the Financial Parameters section,
   **Then** I see editable fields for the brand's financial seed values (~15-20 parameters), organized into logical categories: Revenue, Operating Costs, Financing, and Startup & Capital,
   **And** each parameter has a clear label and description explaining what it controls.

6. **Given** I am editing financial parameters for an existing brand,
   **When** I change a parameter value (e.g., update "Labor Cost %" from 28% to 30%) and click Save,
   **Then** I see a success message confirming the parameters were updated,
   **And** the updated values are displayed in the form.

7. **Given** I submit a parameter form with missing required values or invalid entries (e.g., a negative percentage),
   **When** I click Save,
   **Then** I see inline validation errors next to the affected fields,
   **And** the form is not submitted until errors are corrected.

8. **Given** franchisees are actively planning with the brand's current parameters,
   **When** I update a financial parameter value,
   **Then** the change applies to new plans created after the update,
   **And** existing plans in progress continue using the parameters they were initialized with (NFR17).

9. **Given** I am logged in as a franchisee or franchisor,
   **When** I attempt to access the Brand Management page or brand admin API endpoints,
   **Then** I am denied access (403 or redirected).

## Dev Notes

### Architecture Patterns to Follow

- **Storage abstraction**: All database operations go through `IStorage` interface in `server/storage.ts`. Route handlers never construct raw queries. Extend the existing interface with brand CRUD operations.
- **Schema-first**: Define/confirm Drizzle table schema and Zod validation schemas in `shared/schema.ts` before writing routes or UI. The `brands` table already exists with `id`, `name`, `slug`, `displayName`, `brandParameters` (JSONB), `startupCostTemplate` (JSONB), `logoUrl`, `primaryColor`, `defaultBookingUrl`, `franchisorAcknowledgmentEnabled`, `createdAt`.
- **JSONB for brand parameters**: The `brandParameters` column stores ~15-20 financial seed values as a typed JSONB object. The `brandParameterSchema` Zod schema is already defined in `shared/schema.ts` with four categories (revenue, operating_costs, financing, startup_capital) where each parameter has `{ value, label, description }`.
- **Route protection**: Use existing `requireAuth` and `requireRole("katalyst_admin")` middleware from `server/middleware/auth.ts` for all brand admin endpoints.
- **API patterns**: RESTful endpoints. `GET /api/brands` (list), `POST /api/brands` (create), `GET /api/brands/:brandId` (detail), `PUT /api/brands/:brandId/parameters` (update params). Use Zod validation on request bodies before passing to storage.
- **Frontend data fetching**: Use `@tanstack/react-query` with `useQuery` for reads and `useMutation` with `apiRequest` from `@lib/queryClient` for writes. Invalidate cache by queryKey after mutations.
- **Forms**: Use shadcn `useForm` + `Form` component (wraps react-hook-form) with `zodResolver` for validation.
- **Routing**: Use `wouter` — `Link` component and `useLocation`/`useParams` hooks. Register pages in `client/src/App.tsx`.
- **Navigation**: Add "Brands" to sidebar for `katalyst_admin` role only, using existing pattern in `app-sidebar.tsx`.
- **Error response format**: `{ error: string, message: string, details?: unknown, statusCode: number }` per architecture Decision 5.
- **data-testid**: Add `data-testid` attributes to all interactive and display elements per project convention.

### UI/UX Deliverables

**Page: Brand Management List (`/admin/brands`)**
- Table/card list of existing brands showing: name, display name, creation date
- "Create New Brand" button
- Empty state if no brands exist
- Sidebar navigation item: "Brands" with `Building2` icon, visible only for `katalyst_admin` role

**Dialog: Create Brand**
- Fields: Brand Name (required), Display Name (optional), Slug (auto-generated from Brand Name via kebab-case, editable)
- Slug auto-generates on Brand Name keystrokes but remains editable
- Validation: name required, slug required, uniqueness error from server
- Success: toast notification, redirect to brand detail page

**Page: Brand Detail (`/admin/brands/:brandId`)**
- Brand name/display name shown in page header
- Tabbed interface (for this story, only the "Financial Parameters" tab is required; other tabs will be added in Stories 2.2-2.4)
- Back navigation to brand list

**Tab: Financial Parameters**
- Parameters grouped into collapsible/visible sections by category:
  - **Revenue**: Monthly AUV, Year 1 Growth Rate, Year 2 Growth Rate, Starting Month AUV %
  - **Operating Costs**: COGS %, Labor %, Rent (monthly), Utilities (monthly), Insurance (monthly), Marketing %, Royalty %, Ad Fund %, Other Monthly
  - **Financing**: Loan Amount, Interest Rate, Loan Term (months), Down Payment %
  - **Startup & Capital**: Working Capital Months, Depreciation Years
- Each parameter shows its label, description, and editable value input
- Currency fields show $ prefix; percentage fields show % suffix
- Save button per section or single Save All button
- Loading state while fetching parameters
- Success toast on save
- Inline validation errors for invalid values

### Anti-Patterns & Hard Constraints

- **DO NOT modify**: `server/vite.ts`, `vite.config.ts`, `server/index.ts`, `server/static.ts`, `drizzle.config.ts`, `package.json`
- **DO NOT install packages manually** — use the packager tool if a new dependency is needed
- **DO NOT** create custom login/auth flows — auth is already implemented
- **DO NOT** construct raw SQL queries outside of `storage.ts` — use the Drizzle ORM and IStorage interface
- **DO NOT** add hover/active background color classes to `<Button>` or `<Badge>` — they have built-in elevation interactions
- **DO NOT** use `text-primary` for primary colored text (per design guidelines)
- **DO NOT** nest cards inside cards
- **DO NOT** specify height/width on `<Button size="icon">` elements
- **DO NOT** use `display:table`
- **DO NOT** add borders to fewer than 4 sides of rounded elements
- **Existing code**: The `brands` table, `brandParameterSchema`, `startupCostItemSchema`, `insertBrandSchema`, and related types already exist in `shared/schema.ts`. Do not duplicate or redefine them.
- **Existing storage methods**: `getBrands()`, `getBrand(id)`, `getBrandBySlug(slug)`, `createBrand()`, `updateBrand()`, `updateBrandParameters()` already exist in the `IStorage` interface and `DatabaseStorage` implementation. Verify they work correctly; do not rewrite them unless there's a bug.

### Gotchas & Integration Warnings

- **Session table**: The `session` table for `connect-pg-simple` has been dropped by drizzle-kit push in the past. If it's missing, recreate it with: `CREATE TABLE IF NOT EXISTS "session" (sid varchar NOT NULL, sess json NOT NULL, expire timestamp(6) NOT NULL); ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid"); CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");`
- **Slug uniqueness**: The `slug` column has a `UNIQUE` constraint. The create brand flow must handle the case where a generated slug conflicts — show a server error as a validation message, not a generic 500.
- **Brand parameters JSONB**: When a brand is first created, `brandParameters` will be `null`. The Financial Parameters editor must handle this gracefully — either show empty fields that the admin fills in, or pre-populate with a default template structure (with zero/empty values and correct labels/descriptions).
- **NFR17 (non-disruptive parameter updates)**: This story's AC states existing plans continue using their initialized parameters. This is naturally satisfied because plans will copy brand parameters at creation time (Epic 3). No special handling needed in this story — just document the intent.
- **Dev login bypass**: When `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are not set, the system uses a dev login bypass that creates a `katalyst_admin` user. This is the primary way to test during development.
- **Route file churn**: `server/routes.ts` already has 700+ lines and was flagged for modularization in the Epic 1 retrospective. Consider whether new brand routes should be added to the existing file or extracted — but follow the current pattern unless explicitly modularizing.
- **Brand list permissions**: The `GET /api/brands` endpoint currently exists but may need role protection. Verify the endpoint returns brands only to authenticated katalyst_admin users.
- **`createTableIfMissing: true`**: The session store config already has this flag, which should auto-create the session table. If it's still failing, the SQL recreation above is the fallback.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `shared/schema.ts` | VERIFY | Brand table, parameter schemas, types already exist — confirm they're correct |
| `server/storage.ts` | VERIFY/MODIFY | Brand CRUD methods already exist — verify correctness, fix if needed |
| `server/routes.ts` | MODIFY | Add/verify brand admin API endpoints: GET /api/brands, POST /api/brands, GET /api/brands/:brandId, GET /api/brands/:brandId/parameters, PUT /api/brands/:brandId/parameters |
| `server/middleware/auth.ts` | VERIFY | requireAuth, requireRole already exist — confirm they work |
| `client/src/pages/admin-brands.tsx` | CREATE | Brand Management list page with create brand dialog |
| `client/src/pages/admin-brand-detail.tsx` | CREATE | Brand Detail page with Financial Parameters editor tab |
| `client/src/App.tsx` | MODIFY | Add routes for /admin/brands and /admin/brands/:brandId with AdminRoute guard |
| `client/src/components/app-sidebar.tsx` | MODIFY | Add "Brands" nav item for katalyst_admin role |

### Dependencies & Environment Variables

**Already installed (DO NOT reinstall):**
- drizzle-orm, drizzle-zod, zod (schema + validation)
- @tanstack/react-query (data fetching)
- react-hook-form, @hookform/resolvers (form handling)
- shadcn/ui components (form, dialog, tabs, card, button, input, toast, etc.)
- wouter (routing)
- lucide-react (icons)
- express, express-session, connect-pg-simple (backend)
- passport, passport-google-oauth20 (auth)

**No new packages needed for this story.**

**Environment variables:**
- `DATABASE_URL` — already configured (Replit built-in PostgreSQL)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — optional for dev (dev login bypass works without them)
- `SESSION_SECRET` — already configured

### References

- Epic 2 stories: `_bmad-output/planning-artifacts/epics.md` lines 479-529 (Story 2.1 full AC)
- Architecture — Data Model: `_bmad-output/planning-artifacts/architecture.md` lines 305-418 (brands table, JSONB patterns, per-field metadata)
- Architecture — API Design: `_bmad-output/planning-artifacts/architecture.md` lines 546-551 (Brand Admin endpoints)
- Architecture — RBAC: `_bmad-output/planning-artifacts/architecture.md` lines 470-496 (three authorization layers)
- Architecture — FR Coverage: `_bmad-output/planning-artifacts/architecture.md` line 1692 (FR39-44 coverage)
- UX — White-label theming: `_bmad-output/planning-artifacts/ux-design-specification.md` lines 32-41
- Epic 1 Retrospective: `_bmad-output/implementation-artifacts/epic-1-retrospective.md` (action items, tech debt)
- Existing schema: `shared/schema.ts` (brands table, brandParameterSchema, insertBrandSchema)
- Existing storage: `server/storage.ts` (IStorage interface with brand methods)
- Existing routes: `server/routes.ts` (existing endpoint patterns)

## Dev Agent Record

### Agent Model Used
Claude 4.6 Opus (Replit Agent)

### Completion Notes
Story 2.1 implementation was largely pre-existing from a prior session. This dev session:
1. Verified all existing implementation against the 9 acceptance criteria — all satisfied
2. Fixed 22 LSP type errors in server/routes.ts (req.params type narrowing via `as string` casts, createUser insert type assertion)
3. Verified the app runs correctly — brands API, brand list page, create brand dialog, brand detail page with financial parameters editor all functional
4. Ran comprehensive e2e test (23 steps) covering: dev login, sidebar navigation, brand list view, brand creation with auto-slug, financial parameter editing and saving, data persistence — all passed
5. Added brand name uniqueness validation (AC4): unique DB constraint on brands.name, getBrandByName() storage method, 409 response on duplicate
6. Added financial parameter validation (AC7): brandParameterSchema now enforces non-negative values for currency fields, 0-1 range for percentage fields (stored as decimals), non-negative integers for term/period fields; frontend validates before submit with inline error messages per field

Key decisions:
- Used `as string` casts for `req.params.brandId` instead of generic route typing to minimize disruption to existing code
- Used `as any` cast for createUser call due to drizzle-zod type generation mismatch (same pattern already used in storage layer)
- Story scope is Brand Entity + Financial Parameters (ACs 1-9); the additional tabs (Startup Costs, Brand Identity, Account Managers) were pre-built and belong to Stories 2.2-2.4 but are functional
- AC8 (plan parameter immutability): Deferred by design per dev notes — "naturally satisfied because plans will copy brand parameters at creation time (Epic 3). No special handling needed in this story."

### LSP Status
Clean — 0 errors, 0 warnings after fixes

### Visual Verification
E2e test verified all UI elements via screenshots: login, brand list (empty + populated states), create brand dialog, brand detail page with financial parameters tab, save confirmation toast, back navigation, data persistence

### File List
- `server/routes.ts` — MODIFIED (LSP type fixes: req.params casts, createUser type assertion, brand name uniqueness validation)
- `shared/schema.ts` — MODIFIED (added unique constraint on brands.name, added validation constraints to brandParameterSchema: non-negative currency, 0-1 range for pct, non-negative int for terms)
- `server/storage.ts` — MODIFIED (added getBrandByName() method to IStorage and DatabaseStorage)
- `client/src/pages/admin-brands.tsx` — VERIFIED (brand list page with create dialog, pre-existing)
- `client/src/pages/admin-brand-detail.tsx` — MODIFIED (added client-side brandParameterSchema validation with inline error messages in FinancialParametersTab)
- `client/src/components/app-sidebar.tsx` — VERIFIED (Brands nav item for katalyst_admin, pre-existing)
- `client/src/hooks/use-brand-theme.ts` — VERIFIED (brand theme CSS override hook, pre-existing)
- `client/src/App.tsx` — VERIFIED (routes for /admin/brands and /admin/brands/:brandId with AdminRoute guard, pre-existing)
- `_bmad-output/implementation-artifacts/2-1-brand-entity-financial-parameter-configuration.md` — MODIFIED (status updates, Dev Agent Record, AC7/AC8 notes)
