# Story ST.3: Franchisee Demo Mode (Per Brand)

Status: in-progress

## Story

As a Katalyst admin,
I want to enter a franchisee demo mode for any brand to showcase the franchisee planning experience with brand-default data,
so that I can demo the platform to prospective franchisees and franchisors without using real client data (FR66, FR67, FR68, FR69).

## Acceptance Criteria

1. Each brand has exactly one system-managed demo franchisee account, auto-created when the brand is configured. The demo account is seeded with the brand's current default financial parameters and startup cost template at creation time.
2. The demo franchisee account cannot be invited, deleted, or assigned to a real user — it is excluded from invitation lists, user management actions, and franchisee count displays.
3. On the brand management screen, each brand card displays an "Enter Franchisee Demo Mode" button visible only to Katalyst admins.
4. Clicking "Enter Franchisee Demo Mode" on a brand card loads the demo franchisee's home page pre-populated with that brand's default financial parameters and startup cost template.
5. The application header displays a demo banner in a visually distinct color (NOT orange — calming color such as blue, purple, or teal to signal "safe sandbox") indicating "Demo Mode: [Brand Name] — Franchisee View" with an "Exit Demo" button.
6. The demo banner reuses the header bar position (same pattern as impersonation banner) — no second bar, no layout shift.
7. While in demo mode, the admin can interact fully — edit financial inputs, add line items, and experience the complete franchisee workflow. No read-only overlay, no pulsation — demo mode is always fully interactive.
8. Changes to demo data do not affect any real user data — the demo operates on the demo franchisee's isolated plan.
9. A "Reset Demo Data" action is available (in the demo banner or as a prominent control) that re-seeds the demo account's plan with the brand's current default financial parameters and startup cost template, clearing any modifications from previous demo sessions.
10. Clicking "Exit Demo" returns the admin to the brand management screen.
11. The sidebar navigation shows only what a franchisee would see while in demo mode — admin navigation items are hidden (same sidebar transformation as impersonation mode).
12. Demo mode state is stored in the server session (same pattern as impersonation) and terminates on logout or session expiry.

## Dev Notes

### Architecture Patterns to Follow

- **Session-based demo state (mirrors impersonation pattern):** Demo mode state lives on the PostgreSQL-backed session object, just like impersonation. Add `demo_mode_brand_id?: string` and `demo_mode_user_id?: string` to `SessionData` in `server/types/session.d.ts`. When demo mode is active, `getEffectiveUser(req)` should return the demo franchisee user — reuse the same dual-identity pattern from ST-1/ST-2.
  - Source: server/types/session.d.ts — existing SessionData augmentation
  - Source: architecture.md line 477 — "Demo mode uses the same mechanism with synthetic user targets"
- **Demo mode and impersonation are mutually exclusive:** An admin cannot be in both impersonation and demo mode simultaneously. Starting demo mode should auto-stop any active impersonation, and starting impersonation should auto-stop any active demo mode. Check for conflicts in both entry endpoints.
- **API route organization:** Demo endpoints go in `server/routes/admin.ts` under the existing `/api/admin` prefix, matching the architecture doc's API design:
  - `POST /api/admin/demo/franchisee/:brandId` — enter franchisee demo mode for a brand
  - `POST /api/admin/demo/exit` — exit demo mode, return to admin view
  - `POST /api/admin/demo/reset/:brandId` — reset demo data to brand defaults
  - `GET /api/admin/demo/status` — return current demo mode state (active/inactive, brand details)
  - Source: architecture.md lines 573-577
- **Demo franchisee account creation:** When a brand is created (or on first demo mode entry for existing brands), the system creates a demo user with: `role: 'franchisee'`, `brandId: brand.id`, `email: 'demo-franchisee@[brand.slug].katalyst.internal'`, `displayName: '[Brand Name] Demo Franchisee'`, `is_demo: true`. Also create an associated demo plan with `status: 'in_progress'` and `financialInputs` populated from the brand's default parameters.
- **`is_demo` flag on users table:** Add a boolean `is_demo` column (default `false`) to the `users` table in `shared/schema.ts`. This flag marks system-managed demo accounts. All user listing queries, invitation flows, and user management actions must exclude `is_demo = true` users. The flag approach is preferred over a naming convention because it's enforceable at the query level.
- **Demo plan seeding:** When creating or resetting a demo plan, use the brand's `financialParameters` JSONB and `startupCostTemplates` to seed the plan's `financialInputs` and `startupCosts`. Follow the same initialization pattern used in `shared/plan-initialization.ts` for real plans. Set `source: 'brand_default'` on all seeded field values.
  - Source: shared/plan-initialization.ts — existing plan initialization logic
- **Frontend state:** Extend `ImpersonationContext` (or create a parallel `DemoModeContext`) to track demo mode state. The context should expose: `demoMode: { active: boolean, brandId?: string, brandName?: string }`, `enterDemoMode(brandId)`, `exitDemoMode()`, `resetDemoData()`. The demo banner component can be similar to `ImpersonationBanner.tsx` but with a different color and no edit toggle / pulsation.
  - Source: client/src/contexts/ImpersonationContext.tsx — pattern to follow
- **Shared types:** Add `DemoModeStatus` type to `shared/schema.ts` with active/inactive variants, similar to `ImpersonationStatus`.
- **`getEffectiveUser` integration:** When demo mode is active, `getEffectiveUser(req)` should return the demo franchisee user. This means the same RBAC scoping, data isolation, and sidebar transformation that works for impersonation will automatically work for demo mode. The demo user IS a real user record in the database — just flagged as `is_demo`.
- **No timeout for demo mode:** Unlike impersonation (60-minute timeout), demo mode has no automatic timeout. The admin stays in demo mode until they explicitly exit or their session expires.
- **No audit logging for demo mode:** Unlike impersonation edit mode, demo mode edits do not require audit logging because no real user data is at risk.

### UI/UX Deliverables

- **"Enter Franchisee Demo Mode" button:** Added to each brand card on the brand management page (`admin-brands.tsx`). Uses a ghost or outline variant `<Button>` with a `Play` or `Monitor` icon from `lucide-react`. Only visible when the logged-in user is `katalyst_admin`.
- **Demo mode banner:** Replaces the standard application header when demo mode is active (same pattern as impersonation banner). Background: a calming, visually distinct color — teal/cyan (e.g., `#0891B2` or similar) is recommended to contrast with the orange impersonation banner. White text. Layout: `"Demo Mode: [Brand Name] — Franchisee View | [Reset Demo Data] | [Exit Demo]"`. No pulsation animation.
  - Source: ux-design-specification.md lines 1091-1098 — Demo Mode Banner spec
- **Sidebar transformation:** When demo mode is active, the sidebar renders only franchisee-appropriate navigation items (reuse the same sidebar hiding logic from impersonation mode).
- **No read-only overlay:** Unlike impersonation's default read-only mode, demo mode is always fully interactive. No `pointer-events-none` overlay is applied.
- **Reset Demo Data button:** A button in the demo banner (or prominently placed in the UI) that triggers `POST /api/admin/demo/reset/:brandId`. Shows a brief loading state and a success toast: "Demo data reset to [Brand Name] defaults."
- **UI states:**
  - Loading: Show loading state while entering/exiting demo mode
  - Error: Toast notification if demo mode start/exit/reset fails (e.g., brand not found, demo account creation failed)
  - Success: Smooth transition to demo view; toast "Entered demo mode for [Brand Name]"
  - Exit: Smooth transition back to admin view; toast "Exited demo mode"

### Anti-Patterns & Hard Constraints

- **DO NOT overwrite `req.user`** with the demo user. Continue the dual-identity pattern: `req.user` = real admin, `getEffectiveUser(req)` = demo user.
- **DO NOT modify `server/vite.ts`** or `vite.config.ts` — forbidden per project guidelines.
- **DO NOT modify `package.json`** directly — use the packager tool for any dependency installs.
- **DO NOT modify `drizzle.config.ts`**.
- **DO NOT reuse the orange color (#FF6D00)** for the demo banner. The orange color is reserved for impersonation mode to signal "real user data at risk." Demo mode must use a distinctly different, calming color.
- **DO NOT add pulsation** to the demo banner. Pulsation is reserved for impersonation edit mode to signal danger. Demo mode is always safe.
- **DO NOT allow demo accounts to appear in user lists, invitation flows, or franchisee counts.** All queries that return user lists for display must filter out `is_demo = true` users.
- **DO NOT create a separate storage/query layer** for demo data. The demo franchisee is a real user record with a real plan — it just has `is_demo = true`. All existing storage methods work for demo data.
- **DO NOT implement franchisor demo mode** — that is Story ST-4. This story covers only per-brand franchisee demo mode.
- **DO NOT allow simultaneous demo mode and impersonation.** Starting one must auto-stop the other.

### Gotchas & Integration Warnings

- **Database migration:** Adding `is_demo` column to the `users` table requires a schema push. Use `npm run db:push` (or direct SQL for the column addition if interactive confirmation is needed, as done in ST-2 for the audit log table).
- **Existing user queries need updating:** All storage methods that list users (e.g., `getUsersByBrandId`, `getUser` for admin views) may need filtering to exclude demo accounts from regular user lists. The `getUser` method itself should NOT filter (since we need to look up the demo user for session use), but listing/management endpoints should.
- **Demo plan initialization timing:** The demo plan should be created lazily (on first demo mode entry) rather than eagerly (on brand creation). This avoids creating orphan demo data for brands that are never demo'd. The `POST /api/admin/demo/franchisee/:brandId` endpoint should: (1) find or create the demo user for this brand, (2) find or create the demo plan for this demo user, (3) set the session state, (4) return success.
- **Brand parameter changes:** When brand parameters change after the demo account was created, the demo plan may become stale. The "Reset Demo Data" action handles this — it re-seeds with current brand defaults. A stale demo plan is acceptable; the admin can reset manually.
- **`requireReadOnlyImpersonation` interaction:** When demo mode is active, the middleware should NOT block mutations. Demo mode is always fully interactive. The middleware should check: if `demo_mode_brand_id` is set on the session, allow all mutations through (similar to impersonation edit mode, but without the destructive action guard — demo users can't really be "destroyed" since they're system-managed).
- **Session cleanup:** `POST /api/admin/demo/exit` must clear `demo_mode_brand_id` and `demo_mode_user_id` from the session. Also clear any active impersonation state (belt-and-suspenders, since they should be mutually exclusive).
- **Plan plan creation:** When creating the demo plan, ensure the plan's `brandId` and `userId` are set correctly to the demo user's brand and user ID. Use the same plan creation path as regular plans to ensure all JSONB fields are properly initialized.
- **Frontend routing after demo mode entry:** After entering demo mode, navigate the admin to the franchisee dashboard/home page (`/`). After exiting, navigate back to the brand management page (`/admin/brands`).
- **Existing tests:** ST-1 and ST-2 established 244 passing tests. Adding `is_demo` to the users table may affect existing test fixtures if they don't provide the field. Ensure backward compatibility by defaulting `is_demo` to `false`.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `server/types/session.d.ts` | MODIFY | Add `demo_mode_brand_id?: string`, `demo_mode_user_id?: string` to SessionData |
| `shared/schema.ts` | MODIFY | Add `isDemo` boolean column to `users` table (default false); add `DemoModeStatus` type |
| `server/storage.ts` | MODIFY | Add methods: `getDemoUserForBrand(brandId)`, `createDemoUser(brandId, brandName, brandSlug)`, `createDemoPlan(userId, brandId)`, `resetDemoPlan(planId, brandId)`. Update user listing methods to exclude demo users where appropriate. |
| `server/middleware/auth.ts` | MODIFY | Update `getEffectiveUser` to check demo mode session state; update `requireReadOnlyImpersonation` to allow mutations in demo mode |
| `server/routes/admin.ts` | MODIFY | Add demo mode endpoints: `POST /demo/franchisee/:brandId`, `POST /demo/exit`, `POST /demo/reset/:brandId`, `GET /demo/status`. Add mutual exclusion with impersonation. |
| `client/src/contexts/ImpersonationContext.tsx` | MODIFY | Add demo mode state and methods (or create separate `DemoModeContext.tsx`) |
| `client/src/components/DemoModeBanner.tsx` | CREATE | Demo banner component with teal/cyan background, brand name, Exit Demo and Reset Demo Data buttons |
| `client/src/pages/admin-brands.tsx` | MODIFY | Add "Enter Franchisee Demo Mode" button to each brand card |
| `client/src/components/app-sidebar.tsx` | MODIFY | Apply same sidebar hiding logic for demo mode as for impersonation |
| `client/src/App.tsx` | MODIFY | Conditionally render demo banner, no read-only overlay in demo mode |

### Dependencies & Environment Variables

- **No new packages required.** All needed libraries (express-session, Drizzle, React context, shadcn components) are already installed.
- **No new environment variables.** Demo mode is a server-session feature with no external service dependencies.
- **Database migration required.** The `is_demo` column addition to the `users` table needs a schema push.

### References

- [Source: _bmad-output/planning-artifacts/prd.md — FR66, FR67, FR68, FR69] — Per-brand demo account, entry point, banner, full interactivity
- [Source: _bmad-output/planning-artifacts/prd.md — NFR30] — Demo mode endpoints restricted to katalyst_admin role
- [Source: _bmad-output/planning-artifacts/architecture.md line 477] — "Demo mode uses the same mechanism with synthetic user targets"
- [Source: _bmad-output/planning-artifacts/architecture.md lines 573-577] — Demo mode API endpoints
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md lines 1091-1112] — Demo banner color (distinct from orange), entry points, no pulsation
- [Source: _bmad-output/planning-artifacts/epics.md lines 1160-1179] — Epic ST, Story ST-3 acceptance criteria
- [Source: _bmad-output/implementation-artifacts/st-1-view-as-infrastructure-read-only-mode.md] — Dual-identity session pattern, getEffectiveUser, sidebar transformation, banner reuse
- [Source: _bmad-output/implementation-artifacts/st-2-view-as-edit-mode-audit-logging.md] — Edit mode toggle, requireReadOnlyImpersonation updates, session augmentation
- [Source: server/middleware/auth.ts] — getEffectiveUser, isImpersonating, requireReadOnlyImpersonation
- [Source: server/routes/admin.ts] — Existing impersonation endpoints to extend with demo endpoints
- [Source: server/types/session.d.ts] — SessionData augmentation to extend
- [Source: shared/schema.ts] — Users table to add is_demo column; ImpersonationStatus type pattern for DemoModeStatus
- [Source: shared/plan-initialization.ts] — Plan initialization logic to reuse for demo plan seeding
- [Source: client/src/pages/admin-brands.tsx] — Brand management page where demo entry button goes
- [Source: client/src/contexts/ImpersonationContext.tsx] — Context pattern to extend or mirror for demo mode
- [Source: client/src/components/ImpersonationBanner.tsx] — Banner pattern to adapt for demo banner

## Dev Agent Record

### Agent Model Used

### Completion Notes

### File List
