# Story 2.4: Account Manager Assignment

Status: ready-for-dev

## Story

As a Katalyst admin,
I want to assign and reassign account managers to franchisees,
so that each franchisee has a dedicated point of contact with a booking link.

## Acceptance Criteria

1. **Given** I navigate to a brand's detail page and select the "Account Managers" tab, **when** franchisees exist for this brand, **then** I see a table listing each franchisee with columns: Franchisee Name, Email, Account Manager (name or "Unassigned"), Booking URL (or "—"), and an Edit action button.

2. **Given** I click the Edit button for a franchisee, **when** the assignment dialog opens, **then** I see a dropdown populated with all Katalyst admin users (name + email) and a text input for the booking URL pre-filled with the franchisee's current booking URL (or the brand's default booking URL if none is set).

3. **Given** I select an account manager from the dropdown and enter a valid booking URL, **when** I click "Assign Manager," **then** the assignment is saved, the table row updates immediately to show the new account manager's name and booking URL, and a success toast confirms the change.

4. **Given** a franchisee already has an assigned account manager, **when** I click Edit, **then** the dropdown pre-selects the current account manager and the booking URL field shows the current booking URL, allowing me to reassign to a different manager or update the booking URL.

5. **Given** I enter an invalid booking URL (not a valid URL format), **when** I attempt to save, **then** the form shows a validation error and does not submit.

6. **Given** no franchisees exist for the brand, **when** I view the Account Managers tab, **then** I see an empty state message indicating no franchisees are available and suggesting inviting franchisees first.

7. **Given** the franchisees list or account manager list is loading, **then** I see skeleton loading indicators until the data loads.

8. **Given** a franchisee has an assigned account manager, **then** the account manager's name and booking URL are available on the franchisee's user record for display in the planning experience (verified via API response including `accountManagerId` and `bookingUrl` fields).

## Dev Notes

### Architecture Patterns to Follow

- **Storage interface pattern:** All data access goes through `IStorage` in `server/storage.ts`. Add a `getKatalystAdmins()` method to the interface and implement in `DatabaseStorage`. This method queries the `users` table where `role = 'katalyst_admin'` and returns a safe projection (id, email, displayName, profileImageUrl) — never expose `passwordHash`.
- **API route pattern:** New endpoint `GET /api/admin/account-managers` (protected by `requireAuth` + `requireRole("katalyst_admin")`) returns the list of Katalyst admin users. Keep route handlers thin — delegate to storage.
- **Default fetcher pattern:** Replace existing custom `queryFn` calls in `AccountManagerTab` with the default fetcher (`getQueryFn` from `@/lib/queryClient`). Use array-based query keys (e.g., `["/api/brands", brandId, "franchisees"]`) which the default fetcher joins with `/` to construct the URL.
- **React Query cache invalidation:** After mutation, invalidate `["/api/brands", brand.id, "franchisees"]` to refresh the table. The mutation already does this correctly.
- **`data-testid` convention:** `{action}-{target}` for interactive elements (e.g., `button-assign-manager-{id}`), `{type}-{content}` for display elements (e.g., `text-manager-name-{id}`).
- **Zod validation:** The `assignAccountManagerSchema` already exists in `server/routes.ts` and validates `account_manager_id` (non-empty string) and `booking_url` (valid URL).

### UI/UX Deliverables

**Admin Brand Detail Page — Account Managers Tab** (existing stub at `client/src/pages/admin-brand-detail.tsx`, `AccountManagerTab` component):

- **Franchisee table** with columns: Franchisee Name, Email, Account Manager (resolved name, not raw ID), Booking URL, Actions (Edit button)
- **Assignment dialog** with:
  - Account Manager dropdown (`Select` component) populated from `GET /api/admin/account-managers` — shows `displayName (email)` format for each option
  - Booking URL text input with URL validation
  - Cancel and Assign Manager buttons with loading state
- **Pre-fill behavior:** Booking URL defaults to brand's `defaultBookingUrl` when no booking URL is set; dropdown pre-selects current manager on edit

**States:**
- Loading: Skeleton placeholders while franchisee list loads
- Empty: "No franchisees for this brand yet" card with guidance to invite franchisees
- Error: Destructive toast on save failure
- Success: Toast confirmation on successful assignment

### Anti-Patterns & Hard Constraints

- **DO NOT** expose `passwordHash` in any API response — all user list endpoints must project safe fields only
- **DO NOT** create a new page — the Account Managers tab already exists in `admin-brand-detail.tsx`; improve the existing stub
- **DO NOT** modify `server/vite.ts`, `vite.config.ts`, `drizzle.config.ts`, or `package.json`
- **DO NOT** modify the existing `PUT /api/users/:userId/account-manager` route or `assignAccountManagerSchema` — they are correct and tested
- **DO NOT** use the `allUsers` disabled query that currently exists in the stub — it hits the wrong endpoint. Replace it with a proper query to the new account managers endpoint
- **DO NOT** hard-code account manager IDs or booking URLs — always use the dropdown and form inputs

### Gotchas & Integration Warnings

- The existing `AccountManagerTab` stub has a non-functional `allUsers` query that fetches from `/api/brands/:id/franchisees` instead of listing Katalyst admins. This query must be replaced with a query to the new `GET /api/admin/account-managers` endpoint.
- The current assignment dialog uses a raw text `Input` for the account manager ID. This must be replaced with a `Select` dropdown populated from the account managers list.
- The `GET /api/brands/:brandId/franchisees` endpoint already returns `accountManagerId` but NOT the account manager's name. To display the manager's name in the table, either: (a) join/resolve on the server side, or (b) cross-reference the account managers list on the client side. Option (b) is simpler and avoids changing the existing endpoint.
- The brand's `defaultBookingUrl` field (from Story 2.3) should be used as a fallback when a franchisee has no `bookingUrl` set and the admin opens the assignment dialog.
- The `assignAccountManager` storage method sets both `accountManagerId` and `bookingUrl` on the user record simultaneously — they are always updated together.
- Account managers are Katalyst admin users (`role = 'katalyst_admin'`), not brand-specific. The dropdown should show ALL Katalyst admins regardless of which brand is being managed.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `server/storage.ts` | MODIFY | Add `getKatalystAdmins()` to `IStorage` interface and `DatabaseStorage` implementation |
| `server/routes.ts` | MODIFY | Add `GET /api/admin/account-managers` route returning Katalyst admin users with safe field projection |
| `client/src/pages/admin-brand-detail.tsx` | MODIFY | Rewrite `AccountManagerTab`: replace raw ID input with Select dropdown, add account managers query, resolve manager names in table, replace custom queryFn with default fetcher, add proper loading/empty states |

### Dependencies & Environment Variables

- No new packages needed — all required components (`Select`, `Dialog`, `Table`, `Skeleton`) are already installed
- No new environment variables needed
- Depends on existing Story 2.3 completion (brand identity fields including `defaultBookingUrl` are in place)

### References

- [Source: _bmad-output/planning-artifacts/prd.md#FR42] — Katalyst admin assigns account manager with booking URL
- [Source: _bmad-output/planning-artifacts/prd.md#FR43] — Katalyst admin reassigns account managers
- [Source: _bmad-output/planning-artifacts/architecture.md#users-table] — `account_manager_id` FK → users, `booking_url` text
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Booking-Link] — Booking URL as ever-present safety net in planning experience
- [Source: _bmad-output/planning-artifacts/epics.md#Story-2.4] — Epic 2 story acceptance criteria

## Dev Agent Record

### Agent Model Used

### Completion Notes

### File List
