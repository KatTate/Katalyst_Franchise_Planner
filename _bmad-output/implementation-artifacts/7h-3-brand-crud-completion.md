# Story 7H.3: Brand CRUD Completion

Status: ready-for-dev

## Story

As a Katalyst admin,
I want to delete brands (with confirmation) and edit brand metadata (name, display name, slug) from the brand management interface,
so that I can clean up junk brands created by test agents and correct brand metadata without manual database intervention.

## Acceptance Criteria

1. **Given** I am on the brand detail page (`/admin/brands/:brandId`), **when** I look at the page header area, **then** I see a "Settings" tab (already exists as the "identity" tab) that now includes a "Brand Metadata" section at the top with editable fields for Brand Name, Display Name, and Slug — pre-populated with the brand's current values.

2. **Given** I am editing brand metadata in the Settings tab, **when** I change the Brand Name, Display Name, or Slug and click Save, **then** the brand is updated and I see a success toast. The page header reflects the updated name/slug immediately (via query cache invalidation). Uniqueness constraints are enforced — if I enter a name or slug that already exists on another brand, I see a validation error.

3. **Given** I am editing the Slug field, **when** I type a value, **then** the input enforces the same format rules as brand creation: lowercase alphanumeric with hyphens only (`/^[a-z0-9-]+$/`), max 50 characters.

4. **Given** I am on the brand detail page, **when** I scroll to the bottom of the Settings tab, **then** I see a "Danger Zone" section with a "Delete Brand" button styled with the destructive variant.

5. **Given** I click the "Delete Brand" button, **when** the confirmation dialog opens, **then** I see: (a) the brand name prominently displayed, (b) a warning explaining that all plans, franchisee associations, and configuration data for this brand will be permanently deleted, (c) a count of associated plans and franchisees that will be affected (fetched from the API), (d) a text input requiring me to type the brand name to confirm, and (e) the delete button is disabled until the typed text exactly matches the brand name.

6. **Given** I type the brand name correctly and click "Delete Brand" in the confirmation dialog, **when** the deletion completes, **then** the brand and all its associated plans are permanently removed (via database cascade), brand account manager associations are cleaned up, I see a success toast, and I am redirected to the brands list page (`/admin/brands`).

7. **Given** the brand has associated franchisee or franchisor users (users with `brandId` matching the deleted brand), **when** I delete the brand, **then** those users' `brandId` is set to `null` server-side (not deleted — users are preserved but become unassigned), and the confirmation dialog pre-warns about this by showing the affected user count.

8. **Given** the delete API endpoint `DELETE /api/brands/:brandId`, **when** a non-katalyst_admin user attempts to call it, **then** the request is rejected with 403. Only `katalyst_admin` role can delete brands.

9. **Given** I am on the brands list page (`/admin/brands`), **when** I view a brand card, **then** the existing card behavior is unchanged — clicking navigates to the brand detail page. No delete button on the list page (deletion is only available from the brand detail Settings tab to prevent accidental deletions).

10. **Given** the brand's slug is changed, **when** any system component references the brand by slug (e.g., `getBrandBySlug`), **then** the new slug is used. There is no redirect from old slug to new slug — slug changes are immediate and downstream consumers use the updated value on next access.

## Dev Notes

### Architecture Patterns to Follow

**API Pattern (RESTful resource endpoints):**
- Brand routes live in `server/routes/brands.ts`. All brand endpoints use `requireAuth` + `requireRole("katalyst_admin")` middleware.
- Route parameter pattern: `/:brandId` with `Request<{ brandId: string }>` typing.
- Validation with Zod schemas, parsed via `.safeParse()`, errors returned as `{ message, errors[] }`.
- Storage layer called via `storage.methodName()` — route handlers never construct raw queries.
- Source: `_bmad-output/planning-artifacts/architecture.md` Decision 4/5.

**Storage Layer Pattern:**
- `IStorage` interface in `server/storage.ts` defines method signatures. `DatabaseStorage` class implements them.
- Brand methods: `getBrand()`, `getBrandBySlug()`, `getBrandByName()`, `createBrand()`, `updateBrand()`, etc. (lines 60-74).
- New methods must be added to both the interface and the implementation class.
- Uses Drizzle ORM with `eq()` from `drizzle-orm` for where clauses.
- Source: `server/storage.ts` lines 36-100.

**UI Component Patterns:**
- Brand management UI: list page (`client/src/pages/admin-brands.tsx`), detail page (`client/src/pages/admin-brand-detail.tsx`), tab components in `client/src/components/brand/`.
- Mutations use `useMutation` from `@tanstack/react-query` with `apiRequest()` helper from `@/lib/queryClient`.
- Cache invalidation: `queryClient.invalidateQueries({ queryKey: ["/api/brands"] })` and `queryClient.invalidateQueries({ queryKey: ["/api/brands", brandId] })`.
- Toast notifications via `useToast()` hook.
- Navigation via `setLocation()` from wouter.
- All interactive elements require `data-testid` attributes following the pattern: `button-*`, `input-*`, `text-*`, `dialog-*`.
- Source: `client/src/pages/admin-brands.tsx`, `client/src/components/brand/BrandIdentityTab.tsx`.

**Delete Confirmation Pattern (reference: plan deletion):**
- `DeletePlanDialog` at `client/src/components/plan/delete-plan-dialog.tsx` uses `AlertDialog` from shadcn/ui.
- Type-to-confirm: user must type the exact plan name before the delete button enables.
- `Button variant="destructive"` for the confirm action.
- `AlertDialogCancel` for the cancel action.
- useMutation with `apiRequest("DELETE", ...)`, toast on success/error, navigate on success.
- Source: `client/src/components/plan/delete-plan-dialog.tsx` lines 1-102.

### UI/UX Deliverables

**Settings Tab Enhancement (BrandIdentityTab.tsx):**
- Add a "Brand Metadata" Card section at the top of the existing Settings tab, before the "Visual Identity" card.
- Contains: Brand Name (text input), Display Name (text input), Slug (text input with format validation).
- Slug input shows format hint text: "Lowercase letters, numbers, and hyphens only".
- A Save Metadata button specific to this section (separate from the Save Identity button below).
- On successful save, invalidate both `/api/brands` (list) and `/api/brands/:brandId` (detail) queries so the page header and brand list reflect changes.

**Danger Zone Section (bottom of Settings tab):**
- Visually separated from the identity settings by a prominent border/background.
- Contains a warning card with destructive styling: red-tinted border, "Danger Zone" heading.
- "Delete Brand" button with `variant="destructive"`.
- Clicking opens a `DeleteBrandDialog` component (new file, modeled on `DeletePlanDialog`).

**DeleteBrandDialog Component:**
- AlertDialog with brand name in title.
- Description warning about cascading data loss (plans, configuration).
- Shows counts: "This brand has X plan(s) and Y user(s) that will be affected."
- Type-to-confirm input matching brand name.
- Delete button disabled until match + not pending.
- On success: toast, redirect to `/admin/brands`.

**States to Handle:**
- Loading state while fetching affected counts for the delete dialog.
- Error state if deletion fails (e.g., database constraint violation).
- Success state with toast notification and redirect.
- Empty slug validation error inline.
- Duplicate name/slug server-side error displayed as toast.

### Anti-Patterns & Hard Constraints

- **DO NOT** modify `vite.config.ts`, `server/vite.ts`, `drizzle.config.ts`, or `package.json` — these are protected files.
- **DO NOT** add a delete button to the brand list page (`admin-brands.tsx`). Deletion is only accessible from the brand detail Settings tab to prevent accidental deletions.
- **DO NOT** hard-delete users when a brand is deleted. Users must be preserved with their `brandId` set to `null`. Users may have authentication records, session data, and audit logs that must survive brand deletion.
- **DO NOT** skip the type-to-confirm pattern for brand deletion. Brand deletion cascades to plans and is irreversible. The plan deletion dialog (`delete-plan-dialog.tsx`) is the reference implementation.
- **DO NOT** create a new API endpoint for slug editing separate from the existing `PUT /api/brands/:brandId` — extend the existing update schema to accept `slug` alongside `name` and `display_name`.
- **DO NOT** duplicate the `slugify()` function — it already exists in `admin-brands.tsx` line 42-48. If needed in the Settings tab, extract to a shared utility or import.
- **DO NOT** add slug auto-generation on name change for the metadata edit form. Auto-slug is only for brand creation. When editing, name and slug are independent — changing the name does NOT auto-update the slug (the admin may have intentionally set a custom slug).

### Gotchas & Integration Warnings

**Database Cascade Behavior:**
- `plans` table: `brandId` FK has `onDelete: "cascade"` (`shared/schema.ts` line 180) — deleting a brand auto-deletes all associated plans. This is the intended behavior.
- `users` table: `brandId` FK has NO onDelete constraint (`shared/schema.ts` line 133) — Postgres will reject the delete if users reference the brand. The server must SET NULL on `users.brandId` BEFORE deleting the brand.
- `invitations` table: `brandId` FK has NO onDelete constraint (`shared/schema.ts` line 158) — the server must also nullify or delete invitations referencing the brand.
- `brandAccountManagers` table: `brandId` FK has NO onDelete constraint (`shared/schema.ts` line 275) — the server must delete brand_account_managers rows BEFORE deleting the brand.
- **Order of operations in deleteBrand():** (1) Set users.brandId = null, (2) Delete invitations with brandId, (3) Delete brand_account_managers with brandId, (4) Delete the brand (plans cascade automatically).

**Uniqueness Validation on Update:**
- When updating brand name or slug, the server must check for uniqueness EXCLUDING the current brand. The existing `getBrandByName()` and `getBrandBySlug()` methods return any brand with that name/slug — the route handler must compare the returned brand's ID against the current brandId to allow "no-op" updates where the name/slug hasn't changed.

**Existing PUT /api/brands/:brandId Schema:**
- Currently defined inline at `server/routes/brands.ts` lines 94-97 with only `name` and `display_name`. This schema must be extended to include `slug` with the same validation rules as in `createBrandSchema` (line 13).

**Brand Detail Page Header:**
- The brand detail page (`admin-brand-detail.tsx` lines 64-71) renders the brand name and slug from the query cache. After a metadata save, both the detail query (`["/api/brands", brandId]`) and the list query (`["/api/brands"]`) must be invalidated so the header updates and the brand list shows the new name.

**Demo Franchisee Accounts:**
- Brands may have auto-created demo franchisee accounts (`isDemo: true` on users). When a brand is deleted and users' `brandId` is set to null, demo accounts become orphaned. The delete confirmation dialog should mention this. The server-side cleanup could optionally delete demo users entirely (since they're synthetic), but setting brandId to null is the safe minimum.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `server/routes/brands.ts` | MODIFY | Extend PUT /:brandId update schema to include `slug`. Add DELETE /:brandId endpoint with safety checks and cascade cleanup. Add GET /:brandId/stats endpoint (plan count + user count for delete dialog). |
| `server/storage.ts` | MODIFY | Add `deleteBrand(id)` method to IStorage interface and DatabaseStorage. Add `getBrandStats(id)` method for plan/user counts. Add cleanup logic (nullify users, delete invitations, delete account managers). |
| `client/src/components/brand/BrandIdentityTab.tsx` | MODIFY | Add "Brand Metadata" section at top (name, display_name, slug fields + save button). Add "Danger Zone" section at bottom with delete brand button. |
| `client/src/components/brand/DeleteBrandDialog.tsx` | CREATE | New AlertDialog component for brand deletion confirmation. Type-to-confirm pattern. Shows affected plan/user counts. Modeled on `delete-plan-dialog.tsx`. |
| `client/src/pages/admin-brand-detail.tsx` | MODIFY | May need minor adjustment if the Settings tab needs to pass `onBrandDeleted` callback for navigation after deletion, though this can be handled within BrandIdentityTab via `useLocation`. |

### Testing Expectations

- **Unit tests:** The `deleteBrand` storage method should be tested for correct cascade ordering (users nullified before brand deleted). The extended update schema should be tested for slug validation and uniqueness.
- **E2E tests:** Playwright tests should cover: (a) editing brand metadata (name, display name, slug), (b) brand deletion with type-to-confirm, (c) verification that plans are deleted when brand is deleted, (d) verification that users are preserved with null brandId after brand deletion.
- **Test framework:** Vitest for unit tests, Playwright for E2E. Existing brand E2E tests are in `e2e/admin-brands.spec.ts`.
- **Test authentication:** E2E tests must authenticate as `katalyst_admin` (the only role that can manage brands).

### Dependencies & Environment Variables

- No new packages required. All UI components (`AlertDialog`, `Card`, `Input`, `Button`, `Label`, `Badge`, `Separator`) are already available from shadcn/ui.
- No new environment variables needed.
- Drizzle ORM operators already imported in `storage.ts`: `eq`, `and`, `isNull`, `sql`.

### References

- `_bmad-output/planning-artifacts/epics.md` Epic 7H §7H.3 — story definition and business context
- `_bmad-output/planning-artifacts/epics.md` Epic 2 §2.1 — original brand creation ACs (the gap this story fills)
- `_bmad-output/planning-artifacts/epics.md` Epic 7 §7.2 — TODO annotation documenting the Epic 2 CRUD gap
- `_bmad-output/planning-artifacts/architecture.md` Decision 1 — data model, brand entity, brand_id partitioning
- `_bmad-output/planning-artifacts/architecture.md` Decision 4 — RBAC enforcement pattern (katalyst_admin only)
- `_bmad-output/planning-artifacts/architecture.md` Decision 5 — API design patterns
- `shared/schema.ts` lines 103-125 — brands table definition, FK constraints
- `shared/schema.ts` lines 127-145 — users table, brandId FK (no onDelete)
- `shared/schema.ts` lines 177-195 — plans table, brandId FK (onDelete cascade)
- `shared/schema.ts` lines 273-289 — brand_account_managers table
- `server/routes/brands.ts` — all existing brand API endpoints
- `server/storage.ts` lines 60-74 — IStorage brand methods
- `client/src/pages/admin-brands.tsx` — brand list page with creation flow
- `client/src/pages/admin-brand-detail.tsx` — brand detail page with tabs
- `client/src/components/brand/BrandIdentityTab.tsx` — identity/settings tab (modification target)
- `client/src/components/plan/delete-plan-dialog.tsx` — reference implementation for delete confirmation pattern
- `_bmad-output/implementation-artifacts/sprint-status.yaml` line 712 — story status tracking

## Dev Agent Record

### Agent Model Used

### Completion Notes

### File List

### Testing Summary
