---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# Katalyst Growth Planner - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for the Katalyst Growth Planner, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**1. Financial Planning & Calculation**
- FR1: Franchisee can build a 5-year monthly financial projection based on their inputs and brand default parameters
- FR2: Franchisee can view and edit every financial input value used in their projection
- FR3: Franchisee can reset any individual edited value back to the brand default with a single action
- FR4: Franchisee can see the FDD Item 7 range alongside the brand default and their own estimate for each startup cost line item
- FR5: Franchisee can add, remove, and reorder custom startup cost line items beyond the brand template defaults
- FR6: Franchisee can classify each custom startup cost line item as CapEx (depreciable) or non-CapEx (expensed)
- FR7: Franchisee can view live-updating summary financial metrics (total investment, projected revenue, ROI, break-even) as they edit inputs
- FR8: System validates accounting identities on every calculation (balance sheet balances, P&L-to-cash-flow consistency, depreciation-to-CapEx consistency, ROIC derivation)
- FR9: System produces deterministic outputs — identical inputs always produce identical financial projections
- FR10: System computes financial projections using a single parameterized model that accepts brand-specific seed values without requiring structural changes per brand

**2. Guided Planning Experience**
- FR11: Franchisee can complete a planning experience that collects all inputs needed for a complete financial projection
- FR12: Franchisee can experience the planning tool in three experience tiers (Planning Assistant / Forms / Quick Entry), each representing a fundamentally different interaction paradigm over the same financial engine
- FR13: Franchisee can switch between experience tiers at any time from their profile settings
- FR14: System recommends an initial experience tier based on onboarding questions (franchise experience, financial literacy, planning experience)
- FR15: Franchisee can navigate freely between completed sections without losing progress
- FR16: Franchisee can save their progress and resume from where they left off across sessions
- FR17: System auto-saves franchisee progress periodically to prevent data loss from crashes or interruptions
- FR18: System recovers franchisee progress to the last auto-save point when a session is interrupted unexpectedly
- FR19: Franchisee can see a consultant booking link throughout the planning experience to schedule guidance from their assigned account manager

**3. Advisory & Guardrails**
- FR20: System flags franchisee inputs that fall significantly outside the FDD Item 7 range or brand averages with advisory nudges (non-blocking)
- FR21: System identifies when a franchisee's overall business case is weak and provides specific guidance on which inputs to reconsider
- FR22: System suggests consultant booking when flagging weak business cases or outlier inputs
- FR23: All advisory nudges are informational — the system never blocks a franchisee from proceeding with their chosen values

**4. Document Generation & Management**
- FR24: Franchisee can generate a lender-grade PDF business plan package including pro forma P&L, cash flow projection, balance sheet, break-even analysis, and summary
- FR25: Generated documents include FTC-compliant disclaimers stating that projections are franchisee-created, not franchisor representations
- FR26: Franchisee can view a list of all previously generated documents with timestamps and plan version metadata
- FR27: Franchisee can download any previously generated document from their document list

**5. User Access & Authentication**
- FR28: Katalyst admin can create franchisee invitations that send a secure link for account setup
- FR29: Invited franchisee can complete a guided onboarding experience that includes account setup and experience assessment questions
- FR30: Katalyst admin can create franchisor admin invitations for a specific brand
- FR31: Users can authenticate to access the system (Google OAuth for Katalyst admins; auth mechanism TBD for franchisees)
- FR32: System enforces role-based data isolation — franchisees see only their own data, franchisor admins see only their brand's data, Katalyst admins see all data

**6. Data Sharing & Privacy**
- FR33: Franchisee can view a clear description of exactly what data will be shared with the franchisor before making an opt-in decision
- FR34: Franchisee can opt in to share their financial projection details with their franchisor admin
- FR35: Franchisee can revoke data sharing opt-in at any time
- FR36: Franchisor admin sees franchisee pipeline status (planning stage, target market, timeline) by default without opt-in
- FR37: Franchisor admin sees franchisee financial details only when the franchisee has explicitly opted in
- FR38: Data sharing boundaries are enforced at the API level, not just the UI level

**7. Brand Configuration & Administration**
- FR39: Katalyst admin can create and configure a new franchise brand with its financial parameter set (~15-20 seed values)
- FR40: Katalyst admin can define the startup cost template for a brand, including default line items with CapEx/non-CapEx classification and Item 7 ranges
- FR41: Katalyst admin can validate a brand configuration by running the financial model against known-good spreadsheet outputs
- FR42: Katalyst admin can assign an account manager (with their booking URL) to each franchisee
- FR43: Katalyst admin can reassign account managers for existing franchisees
- FR44: Katalyst admin can configure brand-level settings (brand identity/logo, colors, default booking URL, franchisor acknowledgment feature on/off)

**8. Pipeline Visibility & Operational Intelligence**
- FR45: Franchisor admin can view a dashboard showing all their brand's franchisees with planning status, stage, target market, and timeline
- FR46: Katalyst admin can view a cross-brand dashboard showing franchisee progress across all brands
- FR47: Katalyst admin can view individual franchisee plan details for operational support
- FR48: Franchisor admin can acknowledge/review a franchisee's development plan as a status signal (if the brand has this feature enabled)

**9. Brand Identity & Experience**
- FR49: Franchisee sees their franchise brand's identity (name, logo, colors) throughout the planning experience

**10. AI Planning Advisor (Story Mode)**
- FR50: In Planning Assistant mode, franchisee interacts with an AI Planning Advisor that collects plan inputs through natural language conversation
- FR51: AI Planning Advisor extracts structured financial inputs from the franchisee's conversational responses and populates the corresponding fields
- FR52: Franchisee can view, verify, and manually correct any value that the AI Planning Advisor populated — AI-populated values are clearly distinguishable
- FR53: AI Planning Advisor has access to the brand's parameter set, Item 7 ranges, and the current state of the franchisee's plan
- FR54: System gracefully degrades when AI services are unavailable — franchisee can switch to Forms or Quick Entry to continue

**11. Advisory Board Meeting**
- FR55: Franchisee can initiate an Advisory Board Meeting from any experience tier to stress-test their current plan assumptions
- FR56: Advisory Board Meeting presents multiple domain-specific advisor personas who examine the plan from their domain perspective
- FR57: Franchisee can accept or reject specific Advisory Board suggestions — accepted suggestions are written back to the financial input state
- FR58: Advisory Board persona definitions are data-driven and configurable by Katalyst admin

### NonFunctional Requirements

**Performance**
- NFR1: Financial model recalculation completes in < 2 seconds for live-updating summary metrics
- NFR2: Wizard page transitions complete in < 1 second, including loading saved state and brand defaults
- NFR3: PDF document generation completes in < 30 seconds for a full lender package
- NFR4: Dashboard views load in < 3 seconds with up to 200 franchisees per brand
- NFR5: Auto-save operations complete without interrupting the franchisee's workflow (non-blocking)

**Security**
- NFR6: All data transmitted over HTTPS/TLS
- NFR7: Passwords hashed using bcrypt — never stored in plaintext (applies to franchisee accounts; Katalyst admins use Google OAuth)
- NFR8: Session tokens expire after a reasonable inactivity period, with configurable timeout
- NFR9: Every API endpoint enforces role-based access control. During admin impersonation (FR59-FR65), RBAC is enforced using the impersonated user's role and scope, not the admin's; the admin's real identity is preserved separately for audit purposes.
- NFR10: Franchisee data isolation enforced at the database query level. During admin impersonation, queries are scoped to the impersonated user's data boundaries; the admin does not gain broader data access than the impersonated user would have.
- NFR11: Invitation tokens are single-use, time-limited, and cryptographically secure
- NFR12: No financial data, passwords, or secrets logged or exposed in error messages

**Reliability & Data Integrity**
- NFR13: Auto-save occurs at minimum every 2 minutes during active planning sessions
- NFR14: System gracefully handles concurrent edits to the same plan (last-write-wins)
- NFR15: Financial calculation engine produces identical outputs for identical inputs (deterministic)
- NFR16: Database backups occur daily at minimum
- NFR17: System remains functional during brand parameter updates
- NFR18: Generated PDF documents are immutable after creation

**Scalability**
- NFR19: System supports up to 10 brands and 500 active franchisees without architectural changes
- NFR20: Financial engine scales linearly — adding brands does not increase calculation time
- NFR21: Database schema supports multi-brand partitioning from day one (brand_id on all relevant tables)

**AI Integration**
- NFR22: AI Planning Advisor responds within 5 seconds — visual typing indicator shown while processing
- NFR23: AI-populated financial values are validated against field type and range before being written
- NFR24: System remains fully functional when AI services are unavailable

**Usability**
- NFR25: Planning experience is usable on desktop browsers (minimum 1024px width)
- NFR26: All user-facing error messages written in plain language
- NFR27: Financial values displayed with consistent formatting throughout
- NFR28: System provides visual feedback within 200ms for any user action
- NFR29: Impersonation sessions have a maximum duration limit (configurable, default 60 minutes) after which the session automatically reverts to admin view
- NFR30: All impersonation and demo mode API endpoints restricted to `katalyst_admin` role; audit log records retained for minimum 90 days

### Additional Requirements

**From Architecture:**
- Starter template: Replit Full-Stack JS Template (TypeScript, React 18, Vite, Express 5, PostgreSQL, Drizzle ORM, shadcn/ui, TanStack React Query)
- JSONB storage for financial_inputs with per-field metadata pattern (value, source, last_modified_at, is_custom)
- Controlled rounding strategy: currency to 2 decimal places, percentages stored as decimals with 1 decimal display
- Dual auth: Google OAuth (passport-google-oauth20) for Katalyst admins (@katgroupinc.com domain); invitation-based auth for franchisees/franchisors. Sessions stored in PostgreSQL (connect-pg-simple)
- Three-layer RBAC: route-level middleware, query-level scoping, response-level projection
- RESTful API with standardized error responses and Zod validation
- Client-side debounced auto-save (2-second debounce) with PATCH partial updates
- SSE for AI conversation streaming (not WebSocket for MVP)
- TanStack React Query for server state + React Context for local UI state
- Shared financial engine as pure TypeScript module (shared/financial-engine.ts) with no side effects
- Server-side LLM proxy with structured extraction and graceful degradation
- Component architecture: shared detail panel + tier-specific input collection components (StoryModeChat, NormalModeForm, ExpertModeGrid)
- Split-view layout with resizable panels (react-resizable-panels)
- Route modules pattern for API organization
- 409 conflict handling for auto-save concurrent edit detection
- Document storage: PostgreSQL for metadata, Replit Object Storage for PDF binaries
- Generated documents are immutable after creation

**From UX Design Specification:**
- Direction F (Hybrid Adaptive) layout: sidebar collapses in Planning Assistant for immersion, restores in Forms/Quick Entry
- 200-300ms sidebar transition animation with prefers-reduced-motion support
- Mode switcher: segmented control (Planning Assistant | Forms | Quick Entry) always visible to all users
- Split-screen layout for Planning Assistant: conversation panel (left, min 360px) + live financial dashboard (right, min 480px)
- Stacked mode below 1024px: tabbed interface (Chat | Dashboard) with accent-colored dot indicator for changes
- AI extraction confidence threshold: confident (silent populate), tentative (dashed border + clarify), uncertain (no populate + guide)
- Expert/Quick Entry grid: TanStack Table with category grouping, virtualization for 60+ rows, tab-through keyboard navigation
- Forms mode: plan completeness dashboard for session re-entry, collapsible sections by financial category
- Quick ROI result in first 90 seconds for new users
- Live document preview visible during planning
- Per-field source attribution badges: Brand Default / AI-Populated / Your Entry
- Per-field reset to brand default with single action
- Financial values shown with contextual sentiment (brand ranges, market context)
- Auto-save status indicator: "All changes saved" / "Saving..." always visible
- Consultant booking link persistent throughout experience
- Three-scenario comparison (Good/Better/Best) as primary interaction pattern
- Katalyst color system: three-layer color architecture with --katalyst-brand escape hatch for "Powered by" badge
- Typography: Montserrat (headlines), Roboto (body), Roboto Mono (financial values)
- "Gurple" (Mystical #A9A2AA) for advisory indicators (never errors)
- White-label theming via CSS custom properties: brand accent overrides --primary

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 3 | Build 5-year monthly financial projection |
| FR2 | Epic 3 | View and edit every financial input value |
| FR3 | Epic 3 | Reset individual values to brand default |
| FR4 | Epic 3 | See FDD Item 7 range alongside defaults and estimates |
| FR5 | Epic 3 | Add, remove, reorder custom startup cost line items |
| FR6 | Epic 3 | Classify custom line items as CapEx or non-CapEx |
| FR7 | Epic 3, 4 | View live-updating summary financial metrics |
| FR8 | Epic 3 | Validate accounting identities on every calculation |
| FR9 | Epic 3 | Deterministic outputs for identical inputs |
| FR10 | Epic 3 | Single parameterized model accepts brand-specific seeds |
| FR11 | Epic 4 | Complete planning experience collecting all inputs |
| FR12 | Epic 4 | Three experience tiers (Planning Assistant / Forms / Quick Entry) |
| FR13 | Epic 4 | Switch between experience tiers at any time |
| FR14 | Epic 1 | System recommends initial tier based on onboarding |
| FR15 | Epic 4 | Navigate freely between completed sections |
| FR16 | Epic 4 | Save progress and resume across sessions |
| FR17 | Epic 4 | Auto-save progress periodically |
| FR18 | Epic 4 | Recover progress after unexpected interruption |
| FR19 | Epic 4 | See consultant booking link throughout experience |
| FR20 | Epic 5 | Flag inputs outside FDD/brand ranges with advisory nudges |
| FR21 | Epic 5 | Identify weak business cases with guidance |
| FR22 | Epic 5 | Suggest consultant booking for weak cases |
| FR23 | Epic 5 | All advisory nudges are informational, never blocking |
| FR24 | Epic 7 | Generate lender-grade PDF business plan package |
| FR25 | Epic 7 | Include FTC-compliant disclaimers in documents |
| FR26 | Epic 7 | View list of previously generated documents |
| FR27 | Epic 7 | Download any previously generated document |
| FR28 | Epic 1 | Katalyst admin creates franchisee invitations |
| FR29 | Epic 1 | Guided onboarding with account setup and assessment |
| FR30 | Epic 1 | Katalyst admin creates franchisor admin invitations |
| FR31 | Epic 1 | Authentication (Google OAuth for Katalyst admins; method TBD for franchisees) |
| FR32 | Epic 1 | Role-based data isolation |
| FR33 | Epic 8 | View description of data shared with franchisor |
| FR34 | Epic 8 | Opt in to share financial details with franchisor |
| FR35 | Epic 8 | Revoke data sharing opt-in at any time |
| FR36 | Epic 8 | Franchisor sees pipeline status by default |
| FR37 | Epic 8 | Franchisor sees financial details only with opt-in |
| FR38 | Epic 8 | Data sharing enforced at API level |
| FR39 | Epic 2 | Create and configure new franchise brand |
| FR40 | Epic 2 | Define startup cost template for a brand |
| FR41 | Epic 3 | Validate brand config against known-good spreadsheets (Story 3.7, relocated from Epic 2) |
| FR42 | Epic 2 | Assign account manager to each franchisee |
| FR43 | Epic 2 | Reassign account managers |
| FR44 | Epic 2 | Configure brand-level settings (identity, colors, etc.) |
| FR45 | Epic 8 | Franchisor pipeline dashboard |
| FR46 | Epic 8 | Katalyst cross-brand dashboard |
| FR47 | Epic 8 | Katalyst view individual plan details |
| FR48 | Epic 8 | Franchisor acknowledge/review franchisee plans |
| FR49 | Epic 2 | Brand identity visible throughout experience |
| FR50 | Epic 6 | AI Planning Advisor conversational interface |
| FR51 | Epic 6 | AI extracts structured inputs from conversation |
| FR52 | Epic 6 | View, verify, correct AI-populated values |
| FR53 | Epic 6 | AI accesses brand parameters and plan state |
| FR54 | Epic 6 | Graceful degradation when AI unavailable |
| FR55 | Epic 9 | Initiate Advisory Board Meeting (Phase 2) |
| FR56 | Epic 9 | Multiple domain-specific advisor personas (Phase 2) |
| FR57 | Epic 9 | Accept/reject Advisory Board suggestions (Phase 2) |
| FR58 | Epic 9 | Configurable persona definitions (Phase 2) |
| FR59-FR65 | Epic ST | Admin "View As" impersonation of franchisees |
| FR66-FR69 | Epic ST | Per-brand Franchisee Demo Mode |
| FR70-FR73 | Epic ST | Franchisor Demo Mode with fictitious brand |

**Coverage Summary:** 73/73 FRs mapped. All functional requirements covered. 40 stories across 8 MVP epics (+ 1 deferred Phase 2 epic + 1 admin support tools epic).

## Epic List

### Epic 1: Auth, Onboarding & User Management
Katalyst admins can invite franchisees and franchisor admins. Users can create accounts, log in, and complete a guided onboarding that assesses their experience level and recommends an initial planning tier.
**FRs covered:** FR14, FR28, FR29, FR30, FR31, FR32
**NFRs addressed:** NFR6-12 (security), NFR11 (invitation tokens)

### Epic 2: Brand Configuration & Administration
Katalyst admins can create franchise brands with financial parameter sets, startup cost templates, brand identity (logo, colors), and account manager assignments. Brand theming applies throughout the franchisee experience.
**FRs covered:** FR39, FR40, FR42, FR43, FR44, FR49 *(FR41 relocated to Epic 3 as Story 3.7)*
**NFRs addressed:** NFR17 (non-disruptive config updates), NFR19-21 (multi-brand scalability)

### Epic 3: Financial Planning Engine
The core calculation engine computes 5-year monthly financial projections from brand parameters and franchisee inputs. Supports live-updating metrics, deterministic outputs, accounting identity validation, custom startup cost line items, and per-field metadata (source, defaults, Item 7 ranges). Includes brand configuration validation against known-good spreadsheet outputs.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR10, FR41
**NFRs addressed:** NFR1 (< 2s recalculation), NFR15 (deterministic), NFR20 (linear scaling)

### Epic 4: Forms & Quick Entry Experience
Franchisees can build financial plans using two manual input paradigms — Forms (guided sections with progressive disclosure) and Quick Entry (spreadsheet-style grid with tab-through navigation). Includes mode switching, auto-save, session recovery, navigation, and persistent consultant booking link.
**FRs covered:** FR11, FR12, FR13, FR15, FR16, FR17, FR18, FR19
**NFRs addressed:** NFR2 (< 1s transitions), NFR5 (non-blocking auto-save), NFR13 (2-min auto-save), NFR14 (concurrent edit handling), NFR25 (desktop 1024px+), NFR28 (200ms feedback)

### Epic 5: Advisory Guardrails & Smart Guidance
System provides non-blocking advisory nudges when franchisee inputs fall outside FDD Item 7 ranges or brand averages. Identifies weak business cases with actionable guidance on which inputs to reconsider. Suggests consultant booking when appropriate. All guidance is advisory — never blocks the franchisee.
**FRs covered:** FR20, FR21, FR22, FR23
**NFRs addressed:** NFR26 (plain-language messages), NFR27 (consistent financial formatting)

### Epic 6: AI Planning Advisor (Planning Assistant)
Franchisees can have a natural-language conversation with an AI advisor in a split-screen layout. The advisor extracts structured financial inputs from conversation and populates the plan in real time with confidence-based extraction (confident/tentative/uncertain). Graceful degradation to Forms/Quick Entry when AI is unavailable.
**FRs covered:** FR50, FR51, FR52, FR53, FR54
**NFRs addressed:** NFR22 (< 5s AI response), NFR23 (AI value validation), NFR24 (graceful degradation)

### Epic 7: Scenario Comparison & Document Generation
Franchisees can model Good/Better/Best scenarios, compare them side by side to build conviction, and generate lender-grade PDF business plan packages with FTC-compliant disclaimers. Includes document history and re-download capability.
**FRs covered:** FR24, FR25, FR26, FR27
**NFRs addressed:** NFR3 (< 30s PDF generation), NFR18 (immutable documents)

### Epic 8: Data Sharing, Privacy & Pipeline Dashboards
Franchisees control data sharing with their franchisor via explicit opt-in/revoke. Franchisor admins see pipeline dashboards with planning status. Katalyst admins see cross-brand operational intelligence. Privacy boundaries enforced at the API level.
**FRs covered:** FR33, FR34, FR35, FR36, FR37, FR38, FR45, FR46, FR47, FR48
**NFRs addressed:** NFR4 (< 3s dashboard loads), NFR9-10 (role-based access, query-level isolation)

### Epic 9: Advisory Board Meeting (Phase 2 — Deferred)
Franchisees can stress-test their plan with multiple AI advisor personas who provide cross-cutting domain feedback. Persona definitions are data-driven and configurable.
**FRs covered:** FR55, FR56, FR57, FR58
**Status:** Deferred to Phase 2 per PRD decision

### Epic ST: Admin Support Tools — Impersonation & Demo Modes
Katalyst admins can impersonate franchisees ("View As") for support and validation, enter per-brand franchisee demo mode for sales demos, and enter franchisor demo mode with a fictitious brand.
**FRs covered:** FR59-FR73
**NFRs addressed:** NFR9 (amended), NFR10 (amended), NFR29 (new), NFR30 (new)
**Priority:** ST-1, ST-2 immediate; ST-3 after ST-2; ST-4 blocked until Epic 8.2

---

## Epic 1: Auth, Onboarding & User Management

Katalyst admins can invite franchisees and franchisor admins. Users can create accounts, log in, and complete a guided onboarding that assesses their experience level and recommends an initial planning tier.

### Story 1.1: Project Initialization & Auth Database Schema

As a developer,
I want the project foundation set up with database tables for users, sessions, and invitations,
So that all authentication and user management features have the data layer they need.

**Acceptance Criteria:**

**Given** the Replit full-stack JS template is in place
**When** the database schema is pushed
**Then** the following tables exist: `users` (id, email, display_name, profile_image_url, role, brand_id, onboarding_completed, preferred_tier, created_at), `sessions` (connect-pg-simple session store), `brands` (id, name, slug, created_at), `invitations` (id, email, role, brand_id, token, expires_at, accepted_at, created_by, created_at)
**And** Drizzle insert schemas and types are exported from `shared/schema.ts`
**And** Passport.js is configured with Google OAuth strategy (passport-google-oauth20) restricted to @katgroupinc.com domain, with session serialization
**And** the Express app uses session middleware backed by PostgreSQL
**And** Katalyst admin users can authenticate via Google OAuth — first login auto-creates their account with `katalyst_admin` role

### Story 1.2: Invitation Creation by Admin

As a Katalyst admin,
I want to create invitations for franchisees and franchisor admins,
So that I can onboard new users to the platform in a controlled way.

**Acceptance Criteria:**

**Given** I am logged in as a Katalyst admin and on the dashboard
**When** I navigate to the Invitation Management page
**Then** I see a table of all invitations showing email, role, brand, status (pending/accepted/expired), and expiry date

**Given** I am on the Invitation Management page
**When** I fill out the new invitation form with email, role, and brand and click Send
**Then** a new invitation is created and appears in my invitation list with a "pending" status
**And** I can copy the invitation acceptance link to share with the invitee

**Given** I am logged in as a franchisor admin
**When** I access the Invitation Management page
**Then** I can only create franchisee invitations for my own brand
**And** I can only see invitations for my own brand

**Given** I am logged in as a franchisee
**When** I try to access the Invitation Management page
**Then** I am not able to see or access invitation management features

**Given** I fill out the invitation form with an invalid email or missing fields
**When** I click Send
**Then** I see clear validation error messages explaining what needs to be corrected

### Story 1.3: Invitation Acceptance & Account Creation

As an invited user,
I want to accept my invitation and set up my account,
So that I can access the Katalyst Growth Planner.

**Acceptance Criteria:**

**Given** I have a valid, unexpired invitation link
**When** I visit the invitation URL
**Then** I see the Invitation Acceptance page showing the brand name and my invited email address

**Given** I am on the Invitation Acceptance page with a valid invitation
**When** I fill in my display name, password, and password confirmation and click Create Account
**Then** my user account is created with the role and brand specified in the invitation
**And** I am automatically logged in and redirected to the dashboard

**Given** I visit an invitation link with an expired token
**When** the page loads
**Then** I see a clear message that the invitation has expired and should contact their admin for a new one

**Given** I visit an invitation link that has already been accepted
**When** the page loads
**Then** I see a message that this invitation was already used, with a link to log in instead

**Given** I visit an invitation link with an invalid or nonexistent token
**When** the page loads
**Then** I see a clear error message that the invitation is invalid

**Given** I submit the account creation form with a password shorter than 8 characters or mismatched confirmation
**When** I click Create Account
**Then** I see inline validation errors and my account is not created

### Story 1.4: Login, Logout & Session Management

As a registered user,
I want to log in and maintain my session,
So that I can securely access the platform across visits.

**Acceptance Criteria:**

**Given** I am a Katalyst admin on the login page
**When** I click the "Sign in with Google" button and complete the Google OAuth flow with a @katgroupinc.com account
**Then** I am redirected to the dashboard
**And** I see my display name and profile picture in the sidebar header area

**Given** I am on the login page
**When** I complete Google OAuth with a non-@katgroupinc.com account (e.g., a personal Gmail)
**Then** I see a clear error message on the login page: "Only @katgroupinc.com accounts are authorized"
**And** I remain on the login page, not logged in

**Given** I am a franchisee or franchisor admin who has already created my account (via invitation acceptance in Story 1.3)
**When** I visit the login page
**Then** I see an email and password login form
**And** I can enter my email and password and click "Sign In" to access the platform

**Given** I am on the login page with the email/password form
**When** I enter incorrect credentials and click "Sign In"
**Then** I see an error message: "Invalid email or password"
**And** I remain on the login page

**Given** I am logged in
**When** I click "Sign Out" in the sidebar
**Then** I see a confirmation dialog: "You'll be signed out. Your plan is always saved."
**And** upon confirming, I am redirected to the login page
**And** I can no longer access any authenticated pages — navigating to a protected URL returns me to the login page

**Given** I have been inactive for the configured session timeout period (NFR8)
**When** I attempt any action or page navigation
**Then** I see a message explaining that my session has expired for security
**And** I am redirected to the login page where I can sign in again
**And** after signing in, my previously saved plan data is intact (auto-save ensures no data loss)

### Story 1.5: Role-Based Access Control

As a platform operator,
I want the system to enforce role-based access so users only see and modify data they are authorized for (FR32).

**Acceptance Criteria:**

**Given** I am logged in as a franchisee
**When** I navigate directly to an admin-only page (e.g., /admin/invitations or /admin/brands)
**Then** I am redirected to my dashboard
**And** I do not see admin navigation items (such as "Invitations" or "Brands") in the sidebar

**Given** I am logged in as a franchisee
**When** I navigate to the URL of another franchisee's plan (e.g., by guessing or modifying the plan ID in the URL)
**Then** I see a "Plan not found" message
**And** I cannot view, edit, or infer the existence of another franchisee's data

**Given** I am logged in as a franchisor admin for Brand A
**When** I try to access data belonging to Brand B (e.g., franchisees, plans, or invitations for another brand)
**Then** I see an "Access denied" or "Not found" message
**And** I cannot view or modify any data outside my assigned brand

**Given** I am logged in as a franchisor admin
**When** I view the sidebar navigation
**Then** I see only navigation items relevant to my role and brand (e.g., my brand's franchisee list, invitations for my brand)
**And** I do not see cross-brand admin features reserved for Katalyst admins

**Given** I am logged in as a Katalyst admin
**When** I navigate to any page or data in the system
**Then** I can view and manage data across all brands without restriction

**Given** I am not logged in
**When** I try to visit any authenticated page
**Then** I am redirected to the login page

**Given** RBAC is enforced at the API level (NFR9, NFR10)
**When** any user attempts to access data outside their role scope — whether through the UI or by manipulating API parameters (direct URLs, ID guessing, sequential enumeration)
**Then** the system returns no data and reveals no information about resources the user is not authorized to see

### Story 1.6: Franchisee Onboarding & Tier Recommendation

As a new franchisee,
I want to complete a guided onboarding experience after account creation,
So that the platform recommends a planning approach that fits my experience level (FR14, FR29).

**Acceptance Criteria:**

**Given** I have just created my account
**When** I complete the onboarding questionnaire (franchise experience, financial literacy, planning experience)
**Then** the system recommends an initial experience tier (Planning Assistant, Forms, or Quick Entry)
**And** the recommendation is a suggestion, not a restriction — all three tiers remain accessible
**And** my onboarding responses and recommended tier are saved to my user profile
**And** I can skip onboarding if I choose (all tiers remain available)
**And** the onboarding UI is warm and approachable, matching the emotional design for Sam's first interaction — low-commitment, jargon-free language, matching the "cautious hope" pre-entry emotional state
**And** onboarding takes no more than 2-3 questions to minimize friction

---

## Epic 2: Brand Configuration & Administration

Katalyst admins can create franchise brands with financial parameter sets, startup cost templates, brand identity (logo, colors), and account manager assignments. Brand theming applies throughout the franchisee experience.

### Story 2.1: Brand Entity & Financial Parameter Configuration

As a Katalyst admin,
I want to create and configure a franchise brand with its financial parameter set,
So that franchisees of that brand can plan with accurate default values (FR39).

**Acceptance Criteria:**

**Given** I am logged in as a Katalyst admin and on the Brand Management page
**When** I view the page
**Then** I see a list of all existing brands showing name, display name, and creation date
**And** I see a "Create New Brand" button

**Given** I am on the Brand Management page
**When** I click "Create New Brand"
**Then** I see a brand creation form with fields for: Brand Name, Display Name, and Slug (auto-generated from name, editable)

**Given** I am filling out the brand creation form
**When** I submit the form with valid values
**Then** the new brand appears in my brand list
**And** I see a success confirmation message
**And** I am taken to the brand detail page where I can configure financial parameters

**Given** I submit the brand creation form with a name that already exists
**When** I click Save
**Then** I see a validation error indicating the brand name must be unique

**Given** I am on the brand detail page
**When** I navigate to the Financial Parameters section
**Then** I see editable fields for the brand's financial seed values (~15-20 parameters), organized into logical categories (e.g., Revenue, Operating Costs, Startup & Capital, Financing)
**And** each parameter has a clear label and description explaining what it controls
**And** the specific parameter names and categories are defined in the Brand Financial Parameters Reference (see Architecture doc)

**Given** I am editing financial parameters for an existing brand
**When** I change a parameter value (e.g., update "Labor Cost %" from 28% to 30%) and click Save
**Then** I see a success message confirming the parameters were updated
**And** the updated values are displayed in the form

**Given** I submit a parameter form with missing required values or invalid entries (e.g., a negative percentage)
**When** I click Save
**Then** I see inline validation errors next to the affected fields
**And** the form is not submitted until errors are corrected

**Given** franchisees are actively planning with the brand's current parameters
**When** I update a financial parameter value
**Then** the change applies to new plans created after the update
**And** existing plans in progress continue using the parameters they were initialized with — no disruption to active sessions (NFR17)

### Story 2.2: Startup Cost Template Management

As a Katalyst admin,
I want to define and manage the startup cost line items for a brand,
So that franchisees see accurate default cost categories with FDD Item 7 ranges when planning (FR40).

**Acceptance Criteria:**

**Given** I am viewing a brand's detail page
**When** I navigate to the Startup Cost Template section
**Then** I see a list of all template line items showing: name, default value, CapEx/non-CapEx classification, Item 7 low range, and Item 7 high range
**And** I see an "Add Line Item" button
**And** if no line items exist, I see an empty state prompting me to add the first item

**Given** I am on the Startup Cost Template section
**When** I click "Add Line Item"
**Then** I see a form with fields for: Line Item Name, Default Value (currency), CapEx toggle (with tooltip: "CapEx costs are depreciated over time; non-CapEx costs are expensed in Year 1"), Item 7 Low Range (currency), and Item 7 High Range (currency)

**Given** I have filled out the Add Line Item form with valid values
**When** I click Save
**Then** the new line item appears in the template list
**And** I see a success message confirming the item was added

**Given** I submit the Add Line Item form with invalid data (e.g., blank name, Item 7 Low Range greater than High Range)
**When** I click Save
**Then** I see inline validation errors explaining what needs to be corrected

**Given** I have an existing line item in the template
**When** I click Edit on that line item
**Then** the form reopens with the current values pre-filled
**And** I can modify any field and save the changes

**Given** I have an existing line item in the template
**When** I click Delete on that line item
**Then** I see a confirmation dialog: "Remove '[Line Item Name]' from the template? This will not affect existing plans."
**And** upon confirming, the line item is removed from the list

**Given** I have multiple line items in the template
**When** I reorder the items (e.g., by dragging or using move controls)
**Then** the new order is reflected immediately in the list
**And** the order is persisted

**Given** the startup cost template is complete for a brand
**When** a new franchisee creates a plan with this brand
**Then** the franchisee's startup cost section is pre-populated with all template line items in the configured order
**And** each line item shows the FDD Item 7 range alongside the brand default and the franchisee's own estimate (FR4)

**Given** I update the template after franchisees have already started plans
**When** an existing franchisee views their plan
**Then** their existing startup cost entries remain unchanged — template changes only affect newly created plans

### Story 2.3: Brand Identity & Dynamic Theming

As a Katalyst admin,
I want to configure a brand's visual identity,
So that franchisees see their franchise brand throughout the planning experience (FR44, FR49).

**Acceptance Criteria:**

**Given** a brand exists in the system
**When** I configure the brand identity (logo URL, primary accent color, display name)
**Then** the brand's accent color overrides `--primary` via CSS custom properties
**And** the brand logo appears in the header
**And** brand name appears in contextual copy (e.g., "PostNet benchmarks")
**And** the "Powered by Katalyst" badge uses `--katalyst-brand` (always Katalyst Green, never overridden)
**And** the Katalyst design system (typography, spacing, component shapes) remains constant across all brands
**And** default booking URL is configurable per brand
**And** franchisor acknowledgment feature can be toggled on/off per brand

### Story 2.4: Account Manager Assignment

As a Katalyst admin,
I want to assign and reassign account managers to franchisees,
So that each franchisee has a dedicated point of contact with a booking link (FR42, FR43).

**Acceptance Criteria:**

**Given** a franchisee user exists
**When** I assign an account manager (another user) with their booking URL
**Then** the franchisee's profile links to their assigned account manager
**And** the account manager's name and booking URL are available for display in the planning experience
**And** I can reassign the account manager to a different user
**And** the booking link updates immediately for the franchisee

### ~~Story 2.5: Brand Configuration Validation~~ *(Moved to Story 3.7)*

> **Relocated:** This story depends on the financial engine (`shared/financial-engine.ts`) which is built in Epic 3, Stories 3.1–3.6. Validation cannot run until the engine exists. Moved to Epic 3 as Story 3.7 per Party Mode discussion (2026-02-09).

---

## Epic 3: Financial Planning Engine

The core calculation engine computes 5-year monthly financial projections from brand parameters and franchisee inputs. Supports live-updating metrics, deterministic outputs, accounting identity validation, custom startup cost line items, and per-field metadata.

### Story 3.1: Financial Engine Core & Plan Schema

As a franchisee,
I want the system to compute a 5-year monthly financial projection from my inputs,
So that I can see a complete picture of my business plan (FR1).

**Acceptance Criteria:**

**Given** the `plans` table exists with: id, user_id, brand_id, name, financial_inputs (JSONB), status, pipeline_stage, target_market, target_open_quarter, last_auto_save, created_at, updated_at
**When** the financial engine (`shared/financial-engine.ts`) receives financial inputs and brand parameters
**Then** it computes 60 monthly projections for: revenue, operating costs, P&L, cash flow, balance sheet
**And** the engine is a pure TypeScript module with no side effects and no database or API dependencies
**And** identical inputs always produce identical outputs (FR9, NFR15)
**And** the engine accepts brand-specific seed values without structural changes per brand (FR10)

### Story 3.2: Brand Default Integration & Per-Field Metadata

As a franchisee,
I want my plan pre-filled with brand defaults and per-field tracking,
So that I start by refining a reasonable plan rather than building from scratch (FR2).

**Acceptance Criteria:**

**Given** a franchisee creates a new plan for their brand
**When** the plan is initialized
**Then** every financial input field is pre-filled with the brand's default value
**And** each field in the JSONB financial_inputs has metadata: `{ value, source: 'brand_default', last_modified_at, is_custom: false }`
**And** the `source` field updates to `'user_entry'` when the franchisee edits a value
**And** the original brand default value is preserved alongside the current value for reset capability
**And** I can view every financial input value used in my projection (FR2)

### Story 3.3: Startup Cost Computation & Custom Line Items

As a franchisee,
I want to customize my startup costs beyond the brand template,
So that my plan reflects my specific situation (FR5, FR6).

**Acceptance Criteria:**

**Given** my plan has the brand's startup cost template pre-filled
**When** I add a custom startup cost line item
**Then** I can set its name, value, and classify it as CapEx (depreciable) or non-CapEx (expensed)
**And** I can remove custom line items and reorder all line items
**And** CapEx items are depreciated according to the engine's depreciation schedule
**And** non-CapEx items are expensed in the period incurred
**And** I can see the FDD Item 7 range alongside each template line item's brand default and my estimate (FR4)

### Story 3.4: Live Summary Metrics & Accounting Validation

As a franchisee,
I want to see live-updating summary metrics as I edit my plan,
So that I immediately understand the impact of each change (FR7, FR8).

**Acceptance Criteria:**

**Given** a plan with financial inputs
**When** any input value changes
**Then** summary metrics update: total startup investment, projected annual revenue, ROI percentage, break-even month
**And** recalculation completes in < 2 seconds (NFR1)
**And** the engine validates accounting identities on every calculation: balance sheet balances, P&L-to-cash-flow consistency, depreciation-to-CapEx consistency, ROIC derivation (FR8)
**And** validation failures are logged with full input/output context to a structured log (not just console) with severity level that triggers monitoring alerts, so accounting bugs can be diagnosed — failures do not block the user

### Story 3.5: Financial Input API & Per-Field Reset

As a franchisee,
I want to edit individual financial inputs and reset them to brand defaults,
So that I can experiment freely without fear of losing the starting point (FR2, FR3).

**Acceptance Criteria:**

**Given** a plan exists with financial inputs
**When** I update a financial input via PATCH `/api/plans/:id`
**Then** only the changed fields are updated (partial update)
**And** the field's `source` metadata changes to `'user_entry'` and `last_modified_at` is updated
**When** I reset a field to brand default
**Then** the field's value reverts to the brand's default value
**And** the `source` metadata changes back to `'brand_default'`
**And** the reset is a single action (one click/tap)
**And** GET `/api/plans/:id` returns the complete plan with all financial inputs and their metadata
**And** GET `/api/plans/:id/outputs` returns the computed financial outputs from the engine

### Story 3.6: Quick ROI — First 90-Second Experience

As a new franchisee (Sam),
I want to enter just 5 key numbers and immediately see a preliminary ROI range,
So that I feel engaged and hopeful within 90 seconds of starting — the conversion hook that keeps me planning.

**Acceptance Criteria:**

**Given** I have just completed onboarding (or skipped it) and created my first plan
**When** I land on the planning workspace for the first time
**Then** a focused "Quick Start" experience prompts me for 5 high-impact inputs: target market population, estimated rent, initial investment budget, expected monthly revenue, and staffing count
**And** all 5 fields are pre-filled with brand defaults so I can accept or adjust
**And** after entering each value, the dashboard's ROI and break-even metrics update in real time
**And** upon completing the 5 inputs, a summary card highlights: "Based on your inputs, your estimated ROI is X% with break-even at month Y"
**And** the experience feels rewarding — the franchisee sees meaningful output from minimal effort
**And** I can dismiss the Quick Start at any time to access full Forms/Quick Entry/Planning Assistant
**And** the Quick Start is shown only on first plan creation — returning users go directly to the planning workspace

### Story 3.7: Brand Configuration Validation

As a Katalyst admin,
I want to validate a brand configuration by running the financial model against known-good spreadsheet outputs,
So that I can confirm the financial engine produces correct results for this brand (FR41).

**Acceptance Criteria:**

**Given** a brand has complete financial parameters and startup cost template
**When** I trigger brand validation with a set of known input values and expected outputs
**Then** the system runs the financial engine with those inputs and the brand's parameters
**And** a comparison report shows the calculated vs. expected values for key outputs
**And** differences exceeding a configurable tolerance are highlighted
**And** validation results are saved for audit purposes

> **Note:** Relocated from Epic 2 (formerly Story 2.5). This story requires the complete financial engine (Stories 3.1–3.6) to be implemented before validation can execute.

---

## Epic 4: Forms & Quick Entry Experience

Franchisees can build financial plans using two manual input paradigms — Forms (guided sections with progressive disclosure) and Quick Entry (spreadsheet-style grid with tab-through navigation). Includes mode switching, auto-save, session recovery, and persistent consultant booking link.

### Story 4.1: Planning Layout, Dashboard & Mode Switcher

As a franchisee,
I want to choose how I enter my plan data using a clear mode switcher, with a live financial dashboard always available,
So that I can use the input method that works best for me and see the impact of every change (FR12, FR13, FR7).

**Acceptance Criteria:**

**Given** I am viewing my plan
**When** the planning workspace loads
**Then** a segmented control mode switcher shows "Planning Assistant | Forms | Quick Entry" at the top of the workspace
**And** all three options are always visible — none are hidden or locked
**And** switching modes is instant — no loading state, no confirmation dialog
**And** the Direction F (Hybrid Adaptive) layout is implemented: sidebar collapses in Planning Assistant mode for immersion, restores in Forms/Quick Entry for power navigation
**And** sidebar transition uses 200-300ms animation with `prefers-reduced-motion` support
**And** financial input state is preserved when switching modes
**And** my mode preference is persisted to my user profile and restored on next login (the segmented control is the primary mode switch — no separate settings page needed for MVP)
**And** a financial dashboard panel is rendered alongside the input area in a resizable split view
**And** the dashboard shows summary cards with 4-5 headline metrics: total investment, projected revenue, ROI, break-even month, monthly cash flow
**And** charts (Recharts) visualize projections over the 5-year period
**And** per-field source attribution badges display: "Brand Default" / "AI-Populated" / "Your Entry"
**And** split-view panels enforce minimum widths (360px input, 480px dashboard)
**And** financial values display with consistent formatting: currency with $ and commas, percentages with 1 decimal (NFR27)
**And** the dashboard updates within 200ms (optimistic UI) with full recalculation within 500ms when any financial input changes

### Story 4.2: Forms Mode — Section-Based Input

As a franchisee (Chris),
I want to enter my plan data through organized form sections,
So that I can work through each category systematically (FR11, FR15).

**Acceptance Criteria:**

**Given** I select Forms mode
**When** the workspace renders
**Then** I see collapsible sections organized by financial category (Revenue, Operating Costs, Startup Costs, Staffing, etc.)
**And** a plan completeness dashboard at the top shows each section's progress (e.g., "Revenue: 8/10 fields")
**And** all fields are pre-filled with brand defaults
**And** a suggested order indicator shows "Start here: Revenue" but all sections are accessible
**And** on field focus, a metadata panel shows: brand default value, Item 7 range (if applicable), source attribution; on blur, the metadata panel hides to keep the interface clean
**And** section completion indicators update as I fill in values
**And** I can navigate freely between sections without losing progress (FR15)

### Story 4.3: Quick Entry Mode — Grid Foundation

As a franchisee (Maria),
I want to enter my plan data in a spreadsheet-style grid with inline editing,
So that I can see and edit all my inputs at a glance (FR12 — Quick Entry tier).

**Acceptance Criteria:**

**Given** I select Quick Entry mode
**When** the workspace renders
**Then** I see a dense grid built on TanStack Table with columns: Category, Input Name, Value, Unit, Source, Brand Default
**And** rows are organized into collapsible category groups (Revenue, Operating Costs, Startup Costs, Staffing)
**And** cells accept keyboard input immediately (no click-to-edit)
**And** a sticky summary row at the top shows 4-5 headline metrics, updating with every cell change
**And** out-of-range values get a subtle "Gurple" (#A9A2AA) background with hover tooltip showing typical range

### Story 4.4: Quick Entry Mode — Keyboard Navigation & Formatting

As a franchisee (Maria),
I want keyboard-driven navigation and auto-formatting in the spreadsheet grid,
So that I can complete the entire plan at maximum speed without a mouse.

**Acceptance Criteria:**

**Given** I am in Quick Entry mode
**When** I navigate the grid
**Then** Tab advances to the next editable cell, Shift+Tab goes back, Enter confirms and moves down
**And** type-aware inputs: currency auto-formats with $ and commas, percentages auto-append %, months accept integers only
**And** the grid uses virtualization for smooth performance with 60+ rows (NFR28)
**And** plan completion in under 20 minutes with tab-through, no mouse required for core input

### Story 4.5: Auto-Save & Session Recovery

As a franchisee,
I want my work automatically saved so I never lose progress,
So that I can plan across multiple sessions with confidence (FR16, FR17, FR18).

**Acceptance Criteria:**

**Given** I am editing my plan
**When** I make changes
**Then** auto-save triggers after 2 seconds of inactivity (debounced) via PATCH `/api/plans/:id`
**And** only changed fields are sent (partial update)
**And** a save status indicator shows "All changes saved" / "Saving..." / "Unsaved changes" in the workspace header
**And** if the browser crashes during active editing, reopening the plan recovers all changes up to the last auto-save point, which is at most 2 minutes old (NFR13)
**And** browser `beforeunload` handler warns if unsaved changes exist
**And** if two tabs save simultaneously, the server returns 409 Conflict and the client handles it gracefully — displaying a message to reload or merge, never silently losing data
**When** I return to the platform after an interruption
**Then** my plan loads the last auto-saved state with all values preserved
**And** my active section/mode is restored to where I left off
**And** auto-save operates without interrupting my workflow (non-blocking, background - NFR5)

### Story 4.6: Consultant Booking Link & Workspace Chrome

As a franchisee,
I want easy access to book time with my account manager,
So that I can get help whenever I need it without leaving the planning experience (FR19).

**Acceptance Criteria:**

**Given** I am in the planning experience
**When** the workspace renders
**Then** a persistent "Book time with [Account Manager Name]" link is visible in the sidebar footer or header utility area
**And** the link opens the account manager's booking URL
**And** the link is always reachable without cluttering the planning workspace
**And** if no account manager is assigned, the link is hidden gracefully

---

## Epic 5: Advisory Guardrails & Smart Guidance

System provides non-blocking advisory nudges when franchisee inputs fall outside expected ranges, flags weak business cases with actionable guidance, and suggests consultant booking.

### Story 5.1: Input Range Validation & Advisory Nudges

As a franchisee,
I want to be notified when my inputs are unusual compared to brand norms,
So that I can make informed decisions about my assumptions (FR20, FR23).

**Acceptance Criteria:**

**Given** I enter a financial input value
**When** the value falls significantly outside the FDD Item 7 range or brand averages
**Then** a non-blocking advisory nudge appears with contextual information: "PostNet locations in similar markets typically see [range]. Your estimate of [value] is [above/below] this range."
**And** the nudge uses the "Gurple" (#A9A2AA) color scheme — never red, never error-styled
**And** the nudge does not prevent me from saving or proceeding with my chosen value (FR23)
**And** nudges appear inline near the relevant field, not as disruptive modals or toasts
**And** in Quick Entry mode, out-of-range values show a subtle Gurple background with range tooltip on hover

### Story 5.2: Weak Business Case Detection & Actionable Guidance

As a franchisee,
I want to be informed when my overall business case looks challenging,
So that I can understand what to adjust before committing (FR21, FR22).

**Acceptance Criteria:**

**Given** the financial engine has computed my projections
**When** my plan shows negative ROI or break-even beyond 36 months
**Then** the system surfaces a guidance panel identifying this is a challenging scenario
**And** the guidance highlights the 3-4 inputs with the most impact on ROI/break-even and shows what values would improve the outlook
**And** the guidance frames the message as "here's what would need to change" — never "this won't work"
**And** a consultant booking suggestion is included: "Consider discussing these assumptions with [Account Manager Name]" (FR22)
**And** the guidance distinguishes location-specific issues from franchise-wide issues ("this specific location may not be the best fit")
**And** the guidance is advisory only — the franchisee can dismiss it and continue

---

## Epic 6: AI Planning Advisor (Planning Assistant)

Franchisees can have a natural-language conversation with an AI advisor in a split-screen layout. The advisor extracts structured financial inputs from conversation and populates the plan in real time.

### Story 6.1: LLM Integration & Conversation API

As a developer,
I want a server-side LLM proxy that streams AI responses and extracts financial values,
So that the Planning Assistant can have intelligent conversations about the franchisee's business (FR50, FR53).

**Acceptance Criteria:**

**Given** the LLM proxy service is configured
**When** a franchisee sends a message via POST `/api/plans/:id/conversation`
**Then** the server streams the AI response via Server-Sent Events (SSE)
**And** the AI has access to: the brand's parameter set, Item 7 ranges, and the current state of the franchisee's plan
**And** the final SSE event includes any extracted financial values as structured data
**And** conversation history is stored per plan for context continuity
**And** the AI responds within 5 seconds with a visual typing indicator shown while processing (NFR22)
**And** AI-extracted values are validated against field type and range before being written to financial inputs (NFR23)

### Story 6.2: Split-Screen Planning Assistant Interface

As a franchisee (Sam),
I want to have a conversation with the AI advisor while seeing my plan update live,
So that I can describe my business situation and watch my plan build itself (FR50).

**Acceptance Criteria:**

**Given** I select Planning Assistant mode
**When** the workspace renders
**Then** a split-screen layout shows: conversation panel (left, minimum 360px) and financial dashboard (right, minimum 480px)
**And** the AI advisor introduces itself with a warm greeting: "Hi [name], I'm here to help you build your [Brand] business plan..."
**And** I can type natural-language messages in a text input
**And** AI responses stream in real-time with a typing indicator
**And** the conversation panel scrolls to show the latest message
**And** below 1024px viewport, panels stack into a tabbed interface (Chat | Dashboard) with an accent-colored dot indicator on the Dashboard tab when recalculation occurs
**And** the sidebar collapses in Planning Assistant mode for maximum immersion (Direction F)

### Story 6.3: AI Value Extraction & Field Population

As a franchisee,
I want the AI to extract financial values from my conversation and populate my plan,
So that I don't have to fill out forms — I just talk about my business (FR51, FR52).

**Acceptance Criteria:**

**Given** I am in a Planning Assistant conversation
**When** I describe a financial detail (e.g., "my rent is about $4,200 a month")
**Then** the AI applies a three-tier confidence threshold:
- **High confidence** ("My rent is $4,200"): Field populates silently with accent-color pulse animation, source badge shows "AI"
- **Tentative** ("Rent is around four thousand"): Field shows dashed border with "~" prefix, AI asks clarifying question
- **Uncertain** ("Rent depends on the lease"): Field stays at brand default, AI asks a guiding question
**And** the AI bridges the conversation to the dashboard: "I've updated your monthly rent — notice how that shifted your break-even"
**And** all AI-populated values are clearly distinguishable from manual entries and brand defaults
**And** I can click any AI-populated field to edit it directly, and the AI acknowledges the correction naturally

### Story 6.4: Graceful Degradation & Mode Continuity

As a franchisee,
I want to continue planning even when the AI service is unavailable,
So that my work is never blocked by a technical issue (FR54).

**Acceptance Criteria:**

**Given** AI services are unavailable (network error, service down, rate limited)
**When** I attempt to use Planning Assistant mode
**Then** the system displays a clear, non-alarming message: "The planning advisor is temporarily unavailable. You can continue with Forms or Quick Entry."
**And** a prominent suggestion to switch to Forms or Quick Entry mode is displayed
**And** all previously AI-populated values are preserved in the financial inputs
**And** when I switch away from Planning Assistant and return later, the conversation picks up where it left off
**And** if financial inputs changed while in Forms/Quick Entry, the AI acknowledges them on return: "I see you've updated a few values — your break-even is now at month 15"
**And** if an AI response was in progress when switching modes, it completes in the background and extracted values populate into the shared state

---

## Epic 7: Scenario Comparison & Document Generation

Franchisees can model Good/Better/Best scenarios, compare them side by side to build conviction, and generate lender-grade PDF business plan packages.

### Story 7.1: Scenario Management & Comparison

As a franchisee,
I want to create and compare multiple scenarios for my business plan,
So that I can build conviction that my plan works even in conservative cases.

**Acceptance Criteria:**

**Given** I have a plan with financial inputs
**When** I create scenarios (Good/Better/Best or custom-named)
**Then** I can duplicate my current inputs into a new scenario and adjust key variables
**And** I can view scenarios side by side with key metrics compared
**And** contextual sentiment provides meaning: "Your conservative case still shows positive ROI by month 18"
**And** the comparison highlights which variables differ between scenarios and their impact
**And** scenario data is stored per plan — each plan supports multiple scenarios
**And** creating scenarios is low-friction — the AI advisor suggests it when the base plan is complete

### Story 7.2: PDF Document Generation

As a franchisee,
I want to generate a professional PDF business plan package,
So that I can walk into a bank meeting feeling confident and prepared (FR24, FR25).

**Acceptance Criteria:**

**Given** I have a completed plan (optionally with scenarios)
**When** I click "Generate Package"
**Then** a PDF package is generated within 30 seconds (NFR3) containing: pro forma P&L, cash flow projection, balance sheet, break-even analysis, and executive summary
**And** the document header reads "[Franchisee Name]'s [Brand] Plan" — franchisee name before brand name
**And** professional formatting with brand identity (logo, colors) and Katalyst design — consistent typography, proper page breaks, branded headers/footers, and financial tables with formatting that matches or exceeds what a financial consultant would produce
**And** FTC-compliant disclaimers state that projections are franchisee-created, not franchisor representations (FR25)
**And** financial values use consistent formatting throughout (NFR27)
**And** a live document preview is visible during planning so the franchisee can see the artifact taking shape

### Story 7.3: Document History & Downloads

As a franchisee,
I want to view and download my previously generated documents,
So that I can access any version of my plan at any time (FR26, FR27).

**Acceptance Criteria:**

**Given** I have generated one or more document packages
**When** I view my document list
**Then** I see all previously generated documents with timestamps and plan version metadata
**And** I can download any previous document
**And** generated documents are immutable — changes to the plan after generation do not alter existing documents (NFR18)
**And** documents are stored with metadata in PostgreSQL and binary PDF in Replit Object Storage

---

## Epic 8: Data Sharing, Privacy & Pipeline Dashboards

Franchisees control data sharing with their franchisor via explicit opt-in/revoke. Franchisor admins see pipeline dashboards. Katalyst admins see cross-brand operational intelligence.

### Story 8.1: Franchisee Data Sharing Controls

As a franchisee,
I want to control what financial data my franchisor can see,
So that I share details only when I'm comfortable doing so (FR33, FR34, FR35).

**Acceptance Criteria:**

**Given** I am logged in as a franchisee
**When** I view data sharing settings
**Then** I see a clear description of exactly what data will be shared with the franchisor if I opt in (FR33)
**And** I can opt in to share my financial projection details with my franchisor admin (FR34)
**And** I can revoke data sharing at any time with immediate effect (FR35)
**And** opt-in/revoke changes are enforced at the API level — not just hidden in the UI (FR38)
**And** my pipeline status (planning stage, target market, timeline) is always visible to the franchisor regardless of opt-in (FR36)
**And** my financial details are visible to the franchisor only when I have explicitly opted in (FR37)

### Story 8.2: Franchisor Pipeline Dashboard

As a franchisor admin,
I want to see a dashboard of all my brand's franchisees and their planning progress,
So that I have pipeline visibility into development activity (FR45, FR48).

**Acceptance Criteria:**

**Given** I am logged in as a franchisor admin
**When** I view the pipeline dashboard
**Then** I see all franchisees for my brand with: name, planning status, stage, target market, target open timeline
**And** the dashboard loads in < 3 seconds with up to 200 franchisees (NFR4)
**And** I can see financial details only for franchisees who have opted in to sharing (FR37)
**And** franchisees who have not opted in show pipeline status only — no financial data
**And** if the brand has the acknowledgment feature enabled, I can acknowledge/review a franchisee's plan as a status signal (FR48)
**And** data isolation ensures I see only my brand's franchisees (NFR10)

### Story 8.3: Katalyst Admin Cross-Brand Dashboard

As a Katalyst admin,
I want to view operational intelligence across all brands,
So that I can support franchisees and monitor platform health (FR46, FR47).

**Acceptance Criteria:**

**Given** I am logged in as a Katalyst admin
**When** I view the cross-brand dashboard
**Then** I see franchisee progress across all brands with planning status, stage, and key metrics (FR46)
**And** I can drill into individual franchisee plan details for operational support (FR47)
**And** the dashboard supports filtering by brand, status, and timeline
**And** the view loads in < 3 seconds (NFR4)
**And** I have full visibility into all data across all brands

---

## Epic 9: Advisory Board Meeting (Phase 2 — Deferred)

Franchisees can stress-test their plan with multiple AI advisor personas who provide cross-cutting domain feedback. Persona definitions are data-driven and configurable.

*Stories for this epic will be created when Phase 2 planning begins. FRs covered: FR55, FR56, FR57, FR58.*

---

## Epic ST: Admin Support Tools — Impersonation & Demo Modes

Katalyst admins need tools to validate the franchisee/franchisor experience, support clients shoulder-to-shoulder, and demo the platform to prospects. This epic delivers "View As" impersonation for real user data, per-brand franchisee demo mode, and a franchisor demo mode with a fictitious brand.

**Scope:** Katalyst admins only. Franchisors and franchisees never see or access these tools.
**Dependency:** Stories ST-1 and ST-2 have no external dependencies. Story ST-3 depends on brand financial parameters (Epic 2, done). Story ST-4 is blocked until Epic 8 delivers the franchisor dashboard — it should not be started until Story 8.2 is complete.

**Priority:** Stories ST-1 and ST-2 are immediate — needed for validating Epic 3 code reviews and all subsequent franchisee-facing work. Stories ST-3 and ST-4 follow.

**FRs covered:** FR59, FR60, FR61, FR62, FR63, FR64, FR65, FR66, FR67, FR68, FR69, FR70, FR71, FR72, FR73
**NFRs addressed:** NFR9 (amended), NFR10 (amended), NFR29 (new), NFR30 (new)

### Story ST-1: View As Infrastructure & Read-Only Mode

As a Katalyst admin,
I want to activate "View As" mode for any franchisee and see the platform exactly as they would see it,
So that I can validate the franchisee experience and support clients shoulder-to-shoulder (FR59, FR60, FR64, FR65).

**Acceptance Criteria:**

**Given** I am logged in as a Katalyst admin viewing a brand's Franchisees tab
**When** I click the "View As" button in a franchisee's row
**Then** the system loads that franchisee's home page with their real data
**And** the sidebar navigation shows only what the franchisee would see (no admin items)
**And** the application header transforms into a high-contrast neon construction orange impersonation banner
**And** the banner displays: the franchisee's name, their role ("Franchisee"), "Read-Only Mode", and an "Exit View As" button
**And** I can navigate the platform as the franchisee would — all pages, all data scoped to their permissions
**And** I cannot make any edits — all input fields, buttons, and actions that modify data are disabled
**And** clicking "Exit View As" returns me to the brand detail Franchisees tab I came from
**And** the impersonation state is stored in the server session and terminates on logout or session expiry
**And** the impersonation session has a maximum duration (configurable, default 60 minutes) after which it auto-reverts (NFR29)
**And** during impersonation, API endpoints enforce RBAC using the franchisee's role and data scope, not my admin scope (NFR9, NFR10)
**And** my admin identity is preserved in the session for audit purposes (FR65)

### Story ST-2: View As Edit Mode & Audit Logging

As a Katalyst admin in "View As" mode,
I want to optionally enable editing to make changes on a franchisee's behalf during a support session,
So that I can help clients directly without asking them to make changes themselves (FR61, FR62, FR63).

**Acceptance Criteria:**

**Given** I am in "View As" read-only mode for a franchisee
**When** I click the "Enable Editing" toggle in the impersonation banner
**Then** a confirmation dialog appears: "You will be able to modify [Franchisee Name]'s data. Continue?"
**And** if I confirm, the impersonation banner begins pulsating to visually alert me that edits are live
**And** the banner text updates to show "Editing Enabled" instead of "Read-Only Mode"
**And** I can perform the same actions the franchisee could perform (edit financial inputs, add startup cost line items, etc.)
**And** I cannot perform destructive account-level actions (delete account, revoke invitation, change role, reassign brand)
**And** edits I make are attributed in the per-field metadata source field using a structured format ("admin:[my_admin_name]") distinct from "brand_default", "user_entry", "ai_populated"
**And** an audit record is created for this impersonation edit session containing: my admin identity, the impersonated franchisee, session start/end timestamps, and summary of actions taken
**And** I can toggle editing off to return to read-only mode without exiting "View As"

### Story ST-3: Franchisee Demo Mode (Per Brand)

As a Katalyst admin,
I want to enter a franchisee demo mode for any brand to showcase the franchisee planning experience with brand-default data,
So that I can demo the platform to prospective franchisees and franchisors without using real client data (FR66, FR67, FR68, FR69).

**Acceptance Criteria:**

**Given** I am viewing the brand management screen
**When** I click "Enter Franchisee Demo Mode" on a brand card
**Then** the system loads the demo franchisee's home page pre-populated with that brand's default financial parameters and startup cost template
**And** the application header displays a demo banner in a visually distinct color (NOT orange — different from impersonation banner) indicating "Demo Mode: [Brand Name] — Franchisee View"
**And** the demo banner includes an "Exit Demo" button that returns me to the brand management screen
**And** I can interact fully — edit financial inputs, add line items, and experience the complete franchisee workflow
**And** changes to demo data do not affect any real user data
**And** demo data can be reset to brand defaults
**And** the demo franchisee account is system-managed — it cannot be invited, deleted, or assigned to a real user
**And** each brand has exactly one demo franchisee account, auto-created when the brand is configured
**And** the demo account is seeded with the brand's current default financial parameters and startup cost template at creation time
**And** a "Reset Demo Data" action is available that re-seeds the demo account with current brand defaults (clearing any modifications from previous demo sessions)

### Story ST-4: Franchisor Demo Mode (Fictitious Brand)

As a Katalyst admin,
I want to enter a franchisor demo mode with a fictitious brand to showcase the franchisor pipeline dashboard experience,
So that I can demo the franchisor view to prospective franchisors with realistic but fictional data (FR70, FR71, FR72, FR73).

**Acceptance Criteria:**

**Given** the system includes a pre-seeded fictitious demo brand (e.g., "Bob's Burgers") with brand identity, financial parameters, startup cost template, and multiple demo franchisees at various planning states and statuses
**When** I click "Demo Mode" in the Katalyst admin sidebar
**Then** the system loads the fictitious brand's franchisor dashboard as a demo franchisor would see it
**And** the dashboard shows a pipeline of demo franchisees at different stages (new, mid-planning, completed, stalled, etc.)
**And** the application header displays a demo banner indicating "Demo Mode: [Fictitious Brand] — Franchisor View" with an "Exit Demo" button
**And** the demo banner uses the same color scheme as Franchisee Demo Mode (FR68) — visually distinct from the orange impersonation banner
**And** I can click into any demo franchisee to enter that franchisee's planning experience (nested Franchisee Demo within Franchisor Demo)
**And** when in nested franchisee demo, the demo banner updates to reflect the nested context
**And** exiting the nested franchisee demo returns me to the franchisor demo dashboard
**And** the "Exit Demo" button from the franchisor demo returns me to the admin view
**And** the fictitious brand and its demo data are system-managed and do not appear in real brand lists or reports
