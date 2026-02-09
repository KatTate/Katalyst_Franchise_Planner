# Story 2.3: Brand Identity & Dynamic Theming

Status: ready-for-dev

## Story

As a Katalyst admin,
I want to configure a brand's visual identity (logo URL, primary accent color, display name, booking URL, franchisor acknowledgment toggle),
so that franchisees see their franchise brand throughout the planning experience while the Katalyst design system remains constant.

## Acceptance Criteria

1. **Given** a brand exists in the system, **when** I navigate to the brand detail page and select the "Brand Identity" tab, **then** I see form fields for display name, logo URL, primary accent color (hex color picker + text input), default booking URL, and a franchisor acknowledgment toggle — all pre-filled with current values.

2. **Given** I enter a valid hex color (e.g., `#1E3A8A`) in the primary accent color field, **when** I click "Save Identity," **then** the color is persisted and a success toast confirms the save.

3. **Given** I enter an invalid hex color (e.g., `#ZZZ` or `purple`), **when** I attempt to save, **then** the form shows a validation error and does not submit.

4. **Given** a brand has a primary accent color configured, **when** a franchisee associated with that brand logs in, **then** `--primary` and related CSS custom properties are overridden to the brand's color via `useBrandTheme`, and all interactive elements (buttons, links, active states) adopt the brand color.

5. **Given** a brand has a logo URL configured, **when** a franchisee is logged in, **then** the brand logo appears in the sidebar header area, replacing or augmenting the default "Katalyst Growth Planner" text label.

6. **Given** any brand context is active, **then** a "Powered by Katalyst" badge is visible in the sidebar footer using `--katalyst-brand` (Katalyst Green), and this badge does NOT change color when the brand accent color changes.

7. **Given** a brand has a display name configured, **when** the display name is available, **then** it is used in contextual references throughout the UI (sidebar label, page headings) instead of the raw brand `name`.

8. **Given** I toggle the franchisor acknowledgment switch, **when** I save, **then** the boolean value persists and is retrievable via the brand API.

9. **Given** a Katalyst admin is logged in (not associated with a specific brand), **then** `--primary` retains the default Katalyst color — brand theming does NOT apply to admin sessions.

10. **Given** I enter a primary accent color in the admin identity form, **then** a live color preview swatch updates immediately to show the selected color before saving.

## Dev Notes

### Architecture Patterns to Follow

- **CSS custom property override pattern:** Brand theming works by overriding `--primary` (and its foreground counterpart) on `document.documentElement` at runtime. All shadcn/ui components reference `--primary` and automatically adopt the brand's accent color with zero component modifications. See: `_bmad-output/planning-artifacts/ux-design-specification.md#Implementation Approach`.
- **HSL format requirement:** CSS custom properties in `index.css` use `H S% L%` format (space-separated, no `hsl()` wrapper). The `hexToHSL()` function in `use-brand-theme.ts` already handles this conversion.
- **`--katalyst-brand` escape hatch:** Defined in `index.css` as `145 63% 42%` (Katalyst Green). Used exclusively for "Powered by Katalyst" elements that must NOT shift with brand theming. Reference it via `hsl(var(--katalyst-brand))` in component styles.
- **React Query cache patterns:** Brand queries use `["/api/brands", brandId]` as the query key. Mutations must `invalidateQueries` with the same key pattern after save.
- **`useBrandTheme` hook location:** `client/src/hooks/use-brand-theme.ts`. This hook is already called in `App.tsx` and sets CSS custom properties when a brand context is active. It correctly skips `katalyst_admin` users.
- **Storage interface:** All CRUD operations go through `IStorage` in `server/storage.ts`. The `updateBrandIdentity` method already exists.
- **Route protection:** Brand admin endpoints require `requireAuth()` + `requireRole("katalyst_admin")`. The PUT `/api/brands/:brandId/identity` route already exists in `server/routes.ts`.
- **`data-testid` convention:** `{action}-{target}` for interactive elements, `{type}-{content}` for display elements.

### UI/UX Deliverables

**Admin Brand Detail Page — Brand Identity Tab** (already exists at `client/src/pages/admin-brand-detail.tsx`):
- Display Name text input
- Logo URL text input
- Primary Accent Color: hex text input paired with a native color picker (`<input type="color">`)
- Live color preview swatch that updates on input change
- Default Booking URL text input
- Franchisor Acknowledgment toggle (Switch component)
- Save Identity button with loading state

**Sidebar — Brand Elements** (`client/src/components/app-sidebar.tsx`):
- Brand logo in sidebar header when brand context is active (franchisee/franchisor users)
- Brand display name or brand name as sidebar group label when brand context is active
- "Powered by Katalyst" badge in sidebar footer using `--katalyst-brand` — always visible, never overridden by brand accent

**States:**
- Loading: Brand data fetching (already handled by `useQuery` loading state)
- Empty: No brand identity configured — show default Katalyst theming (current behavior)
- Error: Save failure — destructive toast with error message (already implemented)
- Success: Save success — toast confirmation (already implemented)

### Anti-Patterns & Hard Constraints

- **DO NOT** modify `index.css` token values for brand-specific colors — theming is purely runtime via `document.documentElement.style.setProperty()`
- **DO NOT** create per-brand CSS files or static stylesheets
- **DO NOT** apply brand theming for `katalyst_admin` users — the hook already guards this with `user.role !== "katalyst_admin"`
- **DO NOT** modify `vite.config.ts`, `package.json`, or `drizzle.config.ts`
- **DO NOT** add hover/active state classes to `<Button>` or `<Badge>` — they already have built-in elevation interactions
- **DO NOT** set `h-*` or `w-*` on `<Button size="icon">` — the size variant handles this
- **DO NOT** nest a `<Card>` inside another `<Card>` or inside a sidebar without padding
- **DO NOT** use `text-primary` class for text color — use foreground hierarchy (default, `text-muted-foreground`, etc.)
- **DO NOT** add new npm packages — all required libraries are already installed
- **DO NOT** change the `brands` table schema in `shared/schema.ts` — columns `logoUrl`, `primaryColor`, `displayName`, `defaultBookingUrl`, `franchisorAcknowledgmentEnabled` already exist

### Gotchas & Integration Warnings

- **`--primary-foreground` calculation:** When overriding `--primary`, the hook should also set `--primary-foreground` to ensure text on primary-colored surfaces has adequate contrast. A simple luminance check (if primary is dark, use white foreground; if light, use dark foreground) is sufficient. The current `useBrandTheme` hook does NOT set `--primary-foreground` — this needs to be added.
- **Sidebar property overrides:** The hook already sets `--sidebar-primary` and `--sidebar-ring` to match the brand color. Verify that `--sidebar-primary-foreground` also gets appropriate contrast.
- **Cleanup on unmount:** The hook's `useEffect` cleanup already removes the overridden properties — verify it removes ALL properties that were set (including any newly added `--primary-foreground`).
- **Color picker + text input sync:** The native `<input type="color">` always produces a valid hex. The text input needs validation before applying. Keep both in sync bidirectionally.
- **Logo URL loading:** The sidebar should gracefully handle broken image URLs (use `<img>` with `onError` fallback or an `<Avatar>` with `AvatarFallback`).
- **Existing admin UI:** The `BrandIdentityTab` component with all form fields and the `updateIdentity` mutation already exists in `admin-brand-detail.tsx`. The backend PUT route and `updateBrandIdentity` storage method also exist. Do NOT recreate them — enhance the existing implementation.
- **Brand data availability for sidebar:** The `useBrandTheme` hook already fetches and returns the `brand` object. This can be consumed by the sidebar to display the logo and display name.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/hooks/use-brand-theme.ts` | MODIFY | Add `--primary-foreground` and `--sidebar-primary-foreground` calculation based on luminance; ensure cleanup removes all set properties |
| `client/src/components/app-sidebar.tsx` | MODIFY | Add brand logo in sidebar header (from `useBrandTheme` brand data), use display name as label, add "Powered by Katalyst" badge in footer |
| `client/src/pages/admin-brand-detail.tsx` | MODIFY | Add hex color validation, live color preview swatch, enhance color picker UX (sync native picker + text input) |
| `client/src/index.css` | NO CHANGE | `--katalyst-brand` token already defined; no brand-specific changes |
| `shared/schema.ts` | NO CHANGE | Brand identity columns already exist |
| `server/routes.ts` | NO CHANGE | PUT `/api/brands/:brandId/identity` already exists |
| `server/storage.ts` | NO CHANGE | `updateBrandIdentity` already implemented |

### Dependencies & Environment Variables

- **No new packages required** — all dependencies are already installed
- **No new environment variables** — brand configuration is stored in the database
- **Existing packages used:** React, `@tanstack/react-query`, shadcn/ui components, Lucide React icons, wouter

### References

- `_bmad-output/planning-artifacts/ux-design-specification.md#Implementation Approach` — CSS custom property override pattern, `--katalyst-brand` escape hatch
- `_bmad-output/planning-artifacts/ux-design-specification.md#Customization Strategy` — What brands own vs. what Katalyst owns
- `_bmad-output/planning-artifacts/architecture.md` lines 1539-1542 — `brand-theme.ts` architecture
- `_bmad-output/planning-artifacts/architecture.md` lines 321 — Brand theme entity model
- `_bmad-output/planning-artifacts/epics.md` lines 582-598 — Story 2.3 acceptance criteria and FR references (FR44, FR49)

## Dev Agent Record

### Agent Model Used

### Completion Notes

### File List
