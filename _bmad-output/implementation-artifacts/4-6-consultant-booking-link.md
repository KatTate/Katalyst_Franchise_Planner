# Story 4.6: Consultant Booking Link & Workspace Chrome

## Story
**As a** franchisee working in the planning workspace,
**I want** persistent, non-intrusive access to book time with my assigned account manager,
**So that** I can get help when I need it without leaving my workflow.

## Status: Ready for Implementation

## Context
Franchisees may have an assigned account manager with a booking URL (e.g., Calendly link). This data is already stored on the user record (`accountManagerId`, `bookingUrl` fields) and returned via `/api/auth/me`. The booking link should be ever-present but non-intrusive — available in both the sidebar footer and the planning header utility area.

## Acceptance Criteria

### AC 1: Sidebar Booking Link
- **Given** a franchisee with an assigned account manager and booking URL
- **When** they view the sidebar
- **Then** a "Book Consultation" link appears in the sidebar footer above the user info section
- **And** clicking opens the booking URL in a new tab

### AC 2: Planning Header Booking Link
- **Given** a franchisee is in the planning workspace
- **When** they view the planning header
- **Then** a compact booking button/link is visible in the header utility area
- **And** clicking opens the booking URL in a new tab

### AC 3: Graceful Hiding
- **Given** a franchisee with no assigned account manager or no booking URL
- **When** they view the sidebar or planning header
- **Then** no booking link is shown (no empty space or placeholder)

### AC 4: Account Manager Name Display
- **Given** a franchisee with an assigned account manager
- **When** they see the booking link
- **Then** the account manager's name is displayed if available (falls back to generic "Book Consultation" text)

## Dev Notes

### Data Access
- User record already has `accountManagerId` and `bookingUrl` fields (see `shared/schema.ts` lines 135-136)
- These are returned via `/api/auth/me` and available through `useAuth()` hook
- Account manager details (name) need a lookup — add a simple API endpoint or include manager name in the user response

### Frontend Components
1. **Sidebar** (`client/src/components/app-sidebar.tsx`): Add booking link in `SidebarFooter` above the "Powered by Katalyst" badge
2. **Planning Header** (`client/src/components/planning/planning-header.tsx`): Add compact booking button in the header utility area (right side near save indicator)

### API Enhancement
- Extend `/api/auth/me` response to include `accountManagerName` when `accountManagerId` is set, so the frontend can display the manager's name without an extra API call

### Styling
- Use `CalendarCheck` icon from lucide-react
- Sidebar: Subtle link style matching existing footer aesthetic
- Header: Compact ghost button, non-intrusive
- Both open URL with `window.open(url, '_blank', 'noopener,noreferrer')`

## Testing
- Verify link appears when user has bookingUrl
- Verify link hidden when user has no bookingUrl
- Verify link opens in new tab
- Verify graceful handling of missing account manager name
