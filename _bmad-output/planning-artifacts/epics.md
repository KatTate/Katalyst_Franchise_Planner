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
- FR31: Users can authenticate with email and password to access the system
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
- NFR7: Passwords hashed using bcrypt — never stored in plaintext
- NFR8: Session tokens expire after a reasonable inactivity period, with configurable timeout
- NFR9: Every API endpoint enforces role-based access control
- NFR10: Franchisee data isolation enforced at the database query level
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

### Additional Requirements

**From Architecture:**
- Starter template: Replit Full-Stack JS Template (TypeScript, React 18, Vite, Express 5, PostgreSQL, Drizzle ORM, shadcn/ui, TanStack React Query)
- JSONB storage for financial_inputs with per-field metadata pattern (value, source, last_modified_at, is_custom)
- Controlled rounding strategy: currency to 2 decimal places, percentages stored as decimals with 1 decimal display
- Invitation-only auth via Passport.js with session stored in PostgreSQL (connect-pg-simple)
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
| FR31 | Epic 1 | Email/password authentication |
| FR32 | Epic 1 | Role-based data isolation |
| FR33 | Epic 8 | View description of data shared with franchisor |
| FR34 | Epic 8 | Opt in to share financial details with franchisor |
| FR35 | Epic 8 | Revoke data sharing opt-in at any time |
| FR36 | Epic 8 | Franchisor sees pipeline status by default |
| FR37 | Epic 8 | Franchisor sees financial details only with opt-in |
| FR38 | Epic 8 | Data sharing enforced at API level |
| FR39 | Epic 2 | Create and configure new franchise brand |
| FR40 | Epic 2 | Define startup cost template for a brand |
| FR41 | Epic 2 | Validate brand config against known-good spreadsheets |
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

**Coverage Summary:** 58/58 FRs mapped. All functional requirements covered. 36 stories across 8 MVP epics (+ 1 deferred Phase 2 epic).

## Epic List

### Epic 1: Auth, Onboarding & User Management
Katalyst admins can invite franchisees and franchisor admins. Users can create accounts, log in, and complete a guided onboarding that assesses their experience level and recommends an initial planning tier.
**FRs covered:** FR14, FR28, FR29, FR30, FR31, FR32
**NFRs addressed:** NFR6-12 (security), NFR11 (invitation tokens)

### Epic 2: Brand Configuration & Administration
Katalyst admins can create franchise brands with financial parameter sets, startup cost templates, brand identity (logo, colors), and account manager assignments. Brand theming applies throughout the franchisee experience.
**FRs covered:** FR39, FR40, FR41, FR42, FR43, FR44, FR49
**NFRs addressed:** NFR17 (non-disruptive config updates), NFR19-21 (multi-brand scalability)

### Epic 3: Financial Planning Engine
The core calculation engine computes 5-year monthly financial projections from brand parameters and franchisee inputs. Supports live-updating metrics, deterministic outputs, accounting identity validation, custom startup cost line items, and per-field metadata (source, defaults, Item 7 ranges).
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR10
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
**Then** the following tables exist: `users` (id, email, password_hash, role, brand_id, display_name, onboarding_completed, preferred_tier, created_at), `sessions` (connect-pg-simple session store), `invitations` (id, email, role, brand_id, token, expires_at, accepted_at, created_by)
**And** Drizzle insert schemas and types are exported from `shared/schema.ts`
**And** Passport.js is configured with local strategy and session serialization
**And** the Express app uses session middleware backed by PostgreSQL
**And** a seed script creates the initial Katalyst admin account (email from environment variable) for platform bootstrap — this is the entry point for the entire invitation chain

### Story 1.2: Invitation Creation by Admin

As a Katalyst admin,
I want to create invitations for franchisees and franchisor admins,
So that I can onboard new users to the platform in a controlled way.

**Acceptance Criteria:**

**Given** I am logged in as a Katalyst admin
**When** I submit POST `/api/invitations` with email, role, and brand_id
**Then** a new invitation is created with a cryptographically secure token, expiring in 7 days
**And** the invitation is single-use (cannot be accepted twice)
**And** the API returns the invitation details including the acceptance URL
**And** non-admin users receive 403 Forbidden when attempting to create invitations
**And** franchisor admin users can create franchisee invitations for their own brand only (FR30)

### Story 1.3: Invitation Acceptance & Account Creation

As an invited user,
I want to accept my invitation and set up my account,
So that I can access the Katalyst Growth Planner.

**Acceptance Criteria:**

**Given** I have a valid, unexpired invitation link
**When** I visit the invitation URL and submit my password
**Then** my user account is created with the role and brand specified in the invitation
**And** my password is hashed with bcrypt (cost factor 12)
**And** the invitation token is marked as accepted and cannot be reused
**And** I am automatically logged in after account creation
**And** expired invitation tokens display a clear error message
**And** already-accepted tokens display a message directing to login

### Story 1.4: Login, Logout & Session Management

As a registered user,
I want to log in with my email and password and maintain my session,
So that I can securely access the platform across visits.

**Acceptance Criteria:**

**Given** I have a registered account
**When** I submit valid credentials to POST `/api/auth/login`
**Then** a session is created and a session cookie is set
**And** GET `/api/auth/me` returns my user profile (id, email, role, brand_id, display_name)
**And** invalid credentials return 401 with a plain-language error message
**And** POST `/api/auth/logout` destroys the session
**And** sessions expire after configurable inactivity period (NFR8)
**And** the login page is styled with brand theming if a brand context is available

### Story 1.5: Role-Based Access Control Middleware

As a platform operator,
I want every API endpoint to enforce role-based access control,
So that users can only see and modify data they are authorized to access (FR32).

**Acceptance Criteria:**

**Given** the RBAC middleware is implemented
**When** a request hits any protected API endpoint
**Then** Layer 1 (route-level) checks the user's role against allowed roles and returns 403 if unauthorized
**And** Layer 2 (query-level) automatically scopes database queries: franchisee sees only own data, franchisor sees only their brand's data, Katalyst admin sees all data
**And** Layer 3 (response-level) filters fields based on role and data sharing status
**And** unauthenticated requests to protected endpoints return 401
**And** no endpoint returns data the requesting user's role should not see (NFR9, NFR10)
**And** a franchisee cannot access another franchisee's plan data even by manipulating API parameters (direct URL, ID guessing, sequential ID enumeration)
**And** a franchisor admin cannot access data for brands they are not assigned to

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
I want to create a franchise brand with its financial parameter set,
So that franchisees of that brand can plan with accurate default values (FR39).

**Acceptance Criteria:**

**Given** I am logged in as a Katalyst admin
**When** I create a new brand via the admin interface
**Then** a brand record is created with JSONB `brand_parameters` containing ~15-20 financial seed values (revenue defaults, cost percentages, growth rates, etc.)
**And** the `brands` table includes: id, name, display_name, brand_parameters (JSONB), created_at, updated_at
**And** I can edit existing brand financial parameters
**And** parameter changes do not disrupt active franchisee sessions (NFR17)
**And** the brand supports multi-brand partitioning via brand_id on all relevant tables (NFR21)

### Story 2.2: Startup Cost Template Management

As a Katalyst admin,
I want to define the startup cost template for a brand,
So that franchisees see accurate default line items with proper classifications (FR40).

**Acceptance Criteria:**

**Given** a brand exists in the system
**When** I configure the startup cost template
**Then** I can add default line items with: name, default value, CapEx/non-CapEx classification, Item 7 low range, Item 7 high range
**And** I can reorder, edit, and remove template line items
**And** changes to the template affect new plans but do not alter existing plans in progress
**And** each line item's Item 7 range is stored for display alongside the franchisee's estimate (FR4)

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

### Story 2.5: Brand Configuration Validation

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
