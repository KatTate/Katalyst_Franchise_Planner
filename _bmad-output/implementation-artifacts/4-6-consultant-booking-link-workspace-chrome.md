# Story 4.6: Consultant Booking Link & Workspace Chrome

Status: ready-for-dev

## Story

As a franchisee,
I want easy access to book time with my account manager,
so that I can get help whenever I need it without leaving the planning experience (FR19).

## Acceptance Criteria

1. **Given** I am a franchisee with an assigned account manager and a booking URL configured on my user record, **when** I view the sidebar in any part of the application, **then** a "Book with [Account Manager Name]" link appears in the sidebar footer area (above the "Powered by Katalyst" badge). Clicking the link opens the account manager's booking URL in a new browser tab. The link uses a calendar icon and subtle styling consistent with the sidebar footer aesthetic.

2. **Given** I am a franchisee in the planning workspace (any experience mode — Forms or Quick Entry), **when** I view the planning header, **then** a compact booking icon button is visible in the header utility area (right side, near the save indicator). Hovering over the button shows a tooltip with the account manager's name (e.g., "Book with Jane Smith"). Clicking the button opens the booking URL in a new browser tab.

3. **Given** I am a franchisee with no assigned account manager OR no booking URL configured, **when** I view the sidebar or planning header, **then** no booking link or button is rendered. There is no empty space, placeholder, or "coming soon" message — the link is simply absent.

4. **Given** I am a franchisee with an assigned account manager whose name is available, **when** I see the booking link in the sidebar, **then** it reads "Book with [Account Manager Name]" (e.g., "Book with Jane Smith"). **When** no account manager name is available but a booking URL exists, **then** the link falls back to generic text: "Book Consultation".

## Dev Notes

### Architecture Patterns to Follow

**Cross-Cutting Concern #6 (Architecture Doc — Cross-Cutting Concerns):**

The consultant booking link is identified as a cross-cutting UI concern: "Ever-present across all modes, configurable per account manager per franchisee." It appears in two locations: the application sidebar (global — visible everywhere) and the planning header (workspace-specific — visible during planning).

**Data Access Pattern (Architecture Doc — FR11-19 Coverage):**

- User data including `bookingUrl`, `accountManagerId`, and `accountManagerName` is available via the `useAuth()` hook, which calls `/api/auth/me`
- The `/api/auth/me` endpoint already resolves the account manager's display name by joining on the `users` table using `accountManagerId` — no additional API endpoint needed
- `bookingUrl` is stored directly on the user record (set during invitation acceptance from brand account manager configuration)
- `accountManagerId` is a foreign key to the `users` table (the manager is also a user)

**Component Patterns (from Stories 4.1-4.5):**

- Sidebar uses shadcn `SidebarFooter` for footer content — booking link belongs here
- Planning header uses a flex layout with utility area on the right side
- Ghost buttons (`variant="ghost"`) with lucide-react icons for compact toolbar actions
- `Tooltip` / `TooltipTrigger` / `TooltipContent` for icon-only buttons that need labels
- `text-muted-foreground` for subtle, non-demanding UI elements
- `data-testid` convention: `button-sidebar-book-consultation`, `button-header-book-consultation`
- External links open with `window.open(url, '_blank', 'noopener,noreferrer')` for security

**Sidebar Architecture (Architecture Doc — Component Architecture):**

- `AppSidebar` (`client/src/components/app-sidebar.tsx`) is the main sidebar component using shadcn sidebar primitives
- The sidebar has three sections: `SidebarHeader`, `SidebarContent` (navigation), `SidebarFooter` (user info, branding)
- The booking link should appear in `SidebarFooter`, above the existing "Powered by Katalyst" section, separated by a `Separator`

### UI/UX Deliverables

**Sidebar Booking Link (in AppSidebar → SidebarFooter):**

- Location: `SidebarFooter`, above the "Powered by Katalyst" branding badge, separated by a thin `Separator`
- Appearance: Ghost button, full width, left-aligned with gap, small text (`text-xs`), muted color (`text-muted-foreground`)
- Icon: `CalendarCheck` from lucide-react (small, `h-3.5 w-3.5`)
- Text: "Book with [Account Manager Name]" or "Book Consultation" (fallback)
- Text truncation: `truncate` class on the text span to handle long names
- Interaction: `onClick` opens booking URL in new tab
- Visibility: Only rendered when `bookingUrl` is truthy on the user object

**Planning Header Booking Button (in PlanningHeader):**

- Location: Right side of planning header, in the utility area alongside the save indicator
- Appearance: Ghost icon button (`variant="ghost" size="icon"`)
- Icon: `CalendarCheck` from lucide-react (`h-4 w-4`)
- Tooltip: Wraps button in `Tooltip` → `TooltipTrigger` + `TooltipContent` showing "Book with [Name]" or "Book Consultation"
- Interaction: `onClick` opens booking URL in new tab
- Visibility: Only rendered when `bookingUrl` is truthy on the user object

**UI States:**

- **Has booking URL + manager name:** Shows personalized "Book with [Name]" in sidebar, tooltip in header
- **Has booking URL + no manager name:** Shows generic "Book Consultation" text
- **No booking URL:** Component not rendered — no empty space, no placeholder
- **No special loading/error states:** Booking data comes with the auth user response, which is already loaded before the sidebar/header render

### Anti-Patterns & Hard Constraints

- **DO NOT** create a separate API endpoint for booking data — `bookingUrl` and `accountManagerName` are already returned by `/api/auth/me` and available through `useAuth()`
- **DO NOT** modify files in `client/src/components/ui/` — shadcn primitives are managed separately
- **DO NOT** modify `vite.config.ts`, `drizzle.config.ts`, or `server/vite.ts`
- **DO NOT** modify `shared/financial-engine.ts` or `shared/plan-initialization.ts`
- **DO NOT** add custom hover/active styles on `<Button>` — the built-in elevation handles hover/active states automatically
- **DO NOT** use `useState` to store booking data fetched from the server — use the existing `useAuth()` hook which uses TanStack Query
- **DO NOT** nest the booking link inside a `<Card>` in the sidebar — it should be a simple button in the footer
- **DO NOT** use an `<a>` tag for external links — use a `<Button>` with `onClick` handler calling `window.open()` for consistent styling and `noopener,noreferrer` security
- **DO NOT** create a modal or dialog for booking — the link opens the external booking URL directly

### Gotchas & Integration Warnings

- **Type safety with `useAuth()`:** The `useAuth()` hook returns a `User` type from `shared/schema.ts`. The `bookingUrl`, `accountManagerId`, and `accountManagerName` fields may not be on the base `User` select type — they are added dynamically by the `/api/auth/me` endpoint response. The implementation may need type assertions (`(user as any).bookingUrl`) or an extended type interface. Check the existing `useAuth()` return type and the `/api/auth/me` response shape.

- **Sidebar collapse behavior:** In the planning workspace, the sidebar auto-collapses. When collapsed, the booking link text won't be visible (only the icon remains in icon-collapsed mode). Ensure the booking link renders acceptably in both expanded and collapsed sidebar states. The `SidebarFooter` content typically hides when the sidebar collapses — verify this behavior.

- **Account manager name resolution:** The `/api/auth/me` endpoint already performs a join to resolve the account manager's `displayName` from the `users` table. This is returned as `accountManagerName` in the response. If `accountManagerId` is set but the manager user has no `displayName`, the fallback text "Book Consultation" should be used.

- **Booking URL format:** The `bookingUrl` is expected to be a full URL (e.g., `https://calendly.com/jane-smith`). No URL validation is needed on the frontend — the URL is set by admins during brand/account-manager configuration and stored as-is.

- **Test data availability:** The PostNet brand's dev franchisee (`dev-franchisee-postnet@katgroupinc.com`) has `accountManagerId` and `bookingUrl` configured via the invitation acceptance flow. This user can be used for e2e testing. Franchisees without a booking URL (e.g., other dev accounts) should show no booking link.

- **Implementation already exists:** This story was implemented prior to the story context document being properly created. The implementation is in commits `795325a` and surrounding commits. The existing code should be verified against these acceptance criteria — not reimplemented from scratch.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/components/app-sidebar.tsx` | MODIFY | Add booking link button in `SidebarFooter` above "Powered by Katalyst" badge. Conditionally render based on `bookingUrl` from `useAuth()`. Show CalendarCheck icon + personalized or generic text. |
| `client/src/components/planning/planning-header.tsx` | MODIFY | Add compact ghost icon button with Tooltip in header utility area (right side). Conditionally render based on `bookingUrl` from `useAuth()`. |
| `server/routes/auth.ts` | MODIFY | Enhance `/api/auth/me` response to include `bookingUrl`, `accountManagerId`, and `accountManagerName` (resolved from manager's `displayName`) when available on the user record. |

### Testing Expectations

- **End-to-end (Playwright):** Navigate to the planning workspace as a franchisee with a booking URL configured. Verify the booking link appears in both the sidebar footer and planning header. Verify the link text includes the account manager's name. Verify clicking opens the booking URL. Log in as a user without a booking URL and verify no booking link is shown.
- **Critical ACs for test coverage:** AC 1 (sidebar link present and clickable), AC 2 (header button present with tooltip), AC 3 (graceful hiding when no booking URL).
- **Regression:** Existing sidebar functionality (navigation, user info, logout) must not be affected. Planning header layout (mode switcher, save indicator) must not shift.
- **Visual verification:** Screenshots should confirm the booking link is subtle and non-intrusive in both locations.

### Dependencies & Environment Variables

**Packages already installed (DO NOT reinstall):**
- `lucide-react` — icons (CalendarCheck)
- `@tanstack/react-query` — server state management (via `useAuth()`)
- All shadcn/ui components (Button, Tooltip, Separator, Sidebar primitives)

**No new packages needed.**

**No new environment variables needed.**

**No database migration needed** — `bookingUrl` and `accountManagerId` columns already exist on the `users` table.

### References

- Epics: `_bmad-output/planning-artifacts/epics.md` — Epic 4 overview, Story 4.6 AC (persistent booking link, sidebar/header placement, graceful hiding)
- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Cross-Cutting Concern #6 (consultant booking link), FR11-19 coverage (plan-header booking link), FR49 coverage (booking_url on brand theme/schema), Component Architecture (sidebar structure)
- UX Design: `_bmad-output/planning-artifacts/ux-design-specification.md` — "No offline requirement" (users plan with Katalyst account manager on call), workspace chrome pattern (auto-save trust transitions), header layout specification
- PRD: `_bmad-output/planning-artifacts/prd.md` — FR19 (consultant booking link throughout experience), FR22 (suggest consultant booking for weak cases — future story 5.2)
- Previous Story: `_bmad-output/implementation-artifacts/4-5-auto-save-session-recovery.md` — Planning header structure (save indicator location), ghost button patterns, data-testid conventions, `useAuth()` usage patterns
- Existing Code: `client/src/components/app-sidebar.tsx` — sidebar structure with SidebarFooter; `client/src/components/planning/planning-header.tsx` — header layout with utility area; `server/routes/auth.ts` — `/api/auth/me` endpoint with user data resolution; `client/src/hooks/use-auth.ts` — auth hook providing user data

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Completion Notes

### File List

### Testing Summary
