---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/planning-artifacts/sprint-change-proposal-2026-02-15.md
  - _bmad-output/planning-artifacts/ux-financial-statements-spec.md
  - _bmad-output/brainstorming/brainstorming-session-2026-02-15.md
  - _bmad-output/course-corrections/cc-2026-02-15-financial-output-layer.md
  - _bmad-output/course-corrections/cc-2026-02-15-addendum-guided-decomposition.md
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
- FR12: Franchisee can experience the planning tool through two surfaces: My Plan (guided forms) and Reports (financial statements with inline editing), with AI Planning Assistant available as a slide-in panel within My Plan (Epic 9)
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
- FR54: System gracefully degrades when AI services are unavailable — franchisee can continue with Forms (My Plan) or Reports inline editing

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
| FR7a | Epic 5 | View complete P&L Statement as tabular financial document |
| FR7b | Epic 5 | View complete Balance Sheet as tabular financial document |
| FR7c | Epic 5 | View complete Cash Flow Statement as tabular financial document |
| FR7d | Epic 5 | View Summary Financials page with annual overview |
| FR7e | Epic 5 | View Returns on Invested Capital (ROIC) analysis |
| FR7f | Epic 5 | View Valuation analysis |
| FR7g | Epic 5 | View Audit/integrity check results |
| FR7h | Epic 5 | Always-editable inline input cells within Reports financial statement views |
| FR7i | Epic 7 | Per-year (Y1-Y5) input values for all assumptions |
| FR7j | Epic 7 | Input Assumptions include all reference spreadsheet fields |
| FR7k | Epic 5 | Glossary page with financial term definitions |
| FR7l | Epic 5 | Contextual help for every input field |
| FR7m | Epic 5 | My Plan composite field decomposition (guided form sub-fields) |
| FR7n | Epic 6 | Generate and download professional PDF business plan package |
| FR8 | Epic 3 | Validate accounting identities on every calculation |
| FR9 | Epic 3 | Deterministic outputs for identical inputs |
| FR10 | Epic 3 | Single parameterized model accepts brand-specific seeds |
| FR11 | Epic 4 | Complete planning experience collecting all inputs |
| FR12 | Epic 4 | Two surfaces (My Plan forms + Reports inline editing) with AI Planning Assistant (Epic 9) |
| FR13 | Epic 4 | Switch between experience tiers at any time |
| FR14 | Epic 1 | System recommends initial tier based on onboarding |
| FR15 | Epic 4 | Navigate freely between completed sections |
| FR16 | Epic 4 | Save progress and resume across sessions |
| FR17 | Epic 4 | Auto-save progress periodically |
| FR18 | Epic 4 | Recover progress after unexpected interruption |
| FR19 | Epic 4 | See consultant booking link throughout experience |
| FR20 | Epic 8 | Flag inputs outside FDD/brand ranges with advisory nudges |
| FR21 | Epic 8 | Identify weak business cases with guidance |
| FR22 | Epic 8 | Suggest consultant booking for weak cases |
| FR23 | Epic 8 | All advisory nudges are informational, never blocking |
| FR24 | Epic 6 | Generate lender-grade PDF business plan package |
| FR25 | Epic 6 | Include FTC-compliant disclaimers in documents |
| FR26 | Epic 6 | View list of previously generated documents |
| FR27 | Epic 6 | Download any previously generated document |
| FR28 | Epic 1 | Katalyst admin creates franchisee invitations |
| FR29 | Epic 1 | Guided onboarding with account setup and assessment |
| FR30 | Epic 1 | Katalyst admin creates franchisor admin invitations |
| FR31 | Epic 1 | Authentication (Google OAuth for Katalyst admins; method TBD for franchisees) |
| FR32 | Epic 1 | Role-based data isolation |
| FR33 | Epic 11 | View description of data shared with franchisor |
| FR34 | Epic 11 | Opt in to share financial details with franchisor |
| FR35 | Epic 11 | Revoke data sharing opt-in at any time |
| FR36 | Epic 11 | Franchisor sees pipeline status by default |
| FR37 | Epic 11 | Franchisor sees financial details only with opt-in |
| FR38 | Epic 11 | Data sharing enforced at API level |
| FR39 | Epic 2 | Create and configure new franchise brand |
| FR40 | Epic 2 | Define startup cost template for a brand |
| FR41 | Epic 3 | Validate brand config against known-good spreadsheets (Story 3.7, relocated from Epic 2) |
| FR42 | Epic 2 | Assign account manager to each franchisee |
| FR43 | Epic 2 | Reassign account managers |
| FR44 | Epic 2 | Configure brand-level settings (identity, colors, etc.) |
| FR45 | Epic 11 | Franchisor pipeline dashboard |
| FR46 | Epic 11 | Katalyst cross-brand dashboard |
| FR47 | Epic 11 | Katalyst view individual plan details |
| FR48 | Epic 11 | Franchisor acknowledge/review franchisee plans |
| FR49 | Epic 2 | Brand identity visible throughout experience |
| FR50 | Epic 9 | AI Planning Advisor conversational interface |
| FR51 | Epic 9 | AI extracts structured inputs from conversation |
| FR52 | Epic 9 | View, verify, correct AI-populated values |
| FR53 | Epic 9 | AI accesses brand parameters and plan state |
| FR54 | Epic 9 | Graceful degradation when AI unavailable — continue with Forms or Reports |
| FR55 | Epic 12 | Initiate Advisory Board Meeting (Phase 2) |
| FR56 | Epic 12 | Multiple domain-specific advisor personas (Phase 2) |
| FR57 | Epic 12 | Accept/reject Advisory Board suggestions (Phase 2) |
| FR58 | Epic 12 | Configurable persona definitions (Phase 2) |
| FR59-FR65 | Epic ST | Admin "View As" impersonation of franchisees |
| FR66-FR69 | Epic ST | Per-brand Franchisee Demo Mode |
| FR70-FR73 | Epic ST | Franchisor Demo Mode with fictitious brand |

**Coverage Summary:** 87/87 FRs mapped (73 original + 14 new FR7a-FR7n). All functional requirements covered. Stories across 11 MVP epics (+ 1 deferred Phase 2 epic + 1 admin support tools epic). Epics 5-7 contain 14 stories total (10 + 2 + 2).

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

### Epic 5: Financial Statement Views & Output Layer
Two interaction surfaces (My Plan and Reports) over a shared financial input state. Reports renders every spreadsheet output sheet as interactive tabular views with always-editable input cells. My Plan provides structured forms with an Impact Strip showing real-time financial impact and deep links to Reports. Guardian Bar provides persistent plan health. Dynamic interpretation explains "so what." Document Preview builds pride progressively.
**FRs covered:** FR7a, FR7b, FR7c, FR7d, FR7e, FR7f, FR7g, FR7h, FR7k, FR7l, FR7m
**NFRs addressed:** NFR1 (< 2s recalculation), NFR27 (consistent financial formatting)
**Stories (10):** 5.1 Engine Extension, 5.2 App Navigation + Reports Container & Summary Tab, 5.3 P&L Tab (with Inline Editing), 5.4 Balance Sheet & Cash Flow Tabs (with Inline Editing), 5.5 ROIC/Valuation/Audit Tabs, 5.6 My Plan + Impact Strip + Bidirectional Data Flow, 5.7 Scenario Comparison, 5.8 Guardian Bar & Interpretation, 5.9 Document Preview & PDF Generation Trigger, 5.10 Glossary & Help
**UX design authority:** `ux-design-specification-consolidated.md` (2026-02-18)

### Epic 6: Document Generation & Vault
Generate lender-grade PDF business plan packages and maintain document history with download capability. The document is the product's primary deliverable — the lender package. Elevated from old Epic 7.
**FRs covered:** FR7n, FR24, FR25, FR26, FR27
**NFRs addressed:** NFR3 (< 30s PDF generation), NFR18 (immutable documents)
**Stories (2):** 6.1 PDF Document Generation, 6.2 Document History & Downloads

### Epic 7: Per-Year Inputs & Multi-Plan Management
Enable Year 1-5 independent input values for all per-year financial assumptions, unlocking growth trajectory modeling. Add plan creation, naming, cloning, and navigation for multi-location planning. Includes PlanFinancialInputs restructuring, Facilities field alignment, and Other OpEx unit correction.
**FRs covered:** FR7i, FR7j, FR15, FR16
**Stories (2):** 7.1 Per-Year Input Columns, 7.2 Plan CRUD & Navigation

### Epic 8: Advisory Guardrails & Smart Guidance
System provides non-blocking advisory nudges when franchisee inputs fall outside FDD Item 7 ranges or brand averages. Identifies weak business cases with actionable guidance on which inputs to reconsider. Suggests consultant booking when appropriate. All guidance is advisory — never blocks the franchisee.
**FRs covered:** FR20, FR21, FR22, FR23
**NFRs addressed:** NFR26 (plain-language messages), NFR27 (consistent financial formatting)

### Epic 9: AI Planning Advisor (Planning Assistant)
Franchisees can have a natural-language conversation with an AI advisor in a split-screen layout. The advisor extracts structured financial inputs from conversation and populates the plan in real time with confidence-based extraction (confident/tentative/uncertain). Graceful degradation to Forms/Quick Entry when AI is unavailable.
**FRs covered:** FR50, FR51, FR52, FR53, FR54
**NFRs addressed:** NFR22 (< 5s AI response), NFR23 (AI value validation), NFR24 (graceful degradation)

### Epic 10: What-If Playground (formerly "Scenario Comparison")
Standalone sidebar destination providing interactive graphical sensitivity analysis. Franchisees adjust assumption sliders (revenue, COGS, labor, marketing, facilities) and see all charts update simultaneously across Base, Conservative, and Optimistic scenarios. Replaces the retired Story 5.7 column-splitting approach. Per SCP-2026-02-20 Decision D5/D6 and Section 3.
**FRs covered:** FR7d *(additional scenario FRs to be defined)*
**Status:** Deferred — depends on financial statement views (Epic 5) being complete

### Epic 11: Data Sharing, Privacy & Pipeline Dashboards
Franchisees control data sharing with their franchisor via explicit opt-in/revoke. Franchisor admins see pipeline dashboards with planning status. Katalyst admins see cross-brand operational intelligence. Privacy boundaries enforced at the API level.
**FRs covered:** FR33, FR34, FR35, FR36, FR37, FR38, FR45, FR46, FR47, FR48
**NFRs addressed:** NFR4 (< 3s dashboard loads), NFR9-10 (role-based access, query-level isolation)

### Epic 12: Advisory Board Meeting (Phase 2 — Deferred)
Franchisees can stress-test their plan with multiple AI advisor personas who provide cross-cutting domain feedback. Persona definitions are data-driven and configurable.
**FRs covered:** FR55, FR56, FR57, FR58
**Status:** Deferred to Phase 2 per PRD decision

### Epic ST: Admin Support Tools — Impersonation & Demo Modes
Katalyst admins can impersonate franchisees ("View As") for support and validation, enter per-brand franchisee demo mode for sales demos, and enter franchisor demo mode with a fictitious brand.
**FRs covered:** FR59-FR73
**NFRs addressed:** NFR9 (amended), NFR10 (amended), NFR29 (new), NFR30 (new)
**Priority:** ST-1, ST-2 immediate; ST-3 after ST-2; ST-4 blocked until Epic 11.2

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

## Epic 5: Financial Statement Views & Output Layer

Epic 5 implements two interaction surfaces — **My Plan** and **Reports** — as sidebar navigation destinations over the same financial input state (the "two-door" model). There are no user-facing "modes." Reports renders every output sheet from the reference spreadsheet as interactive tabular views within a unified tabbed container. Input cells in Reports are **always editable inline** — there is no edit toggle, no mode switch, no gating. My Plan provides structured form-based input with an Impact Strip showing real-time financial impact metrics and deep links into Reports. Both surfaces read from and write to the same plan state; edits in either surface are immediately reflected in the other. A persistent Guardian Bar in Reports provides at-a-glance plan health. Dynamic interpretation rows explain "so what" for every key metric. Financial statement views use progressive disclosure (annual → quarterly → monthly drill-down).

**UX Design Authority:** `ux-design-specification-consolidated.md` (2026-02-18) — Single Source of Truth. Supersedes `ux-design-specification.md` and `ux-financial-statements-spec.md`.
**FRs covered:** FR7a, FR7b, FR7c, FR7d, FR7e, FR7f, FR7g, FR7h, FR7k, FR7l, FR7m
**Dependencies:** Epic 3 (financial engine), Epic 4 (planning workspace, EditableCell component)
**Story sequence rationale:** Stories follow the consolidated UX spec's recommended rewrite structure (Part 20), building from engine → navigation + container → individual statements with inline editing → My Plan + Impact Strip → scenario comparison → interpretation → document preview → help. Each story has its dependencies met.

### Story 5.1: Financial Engine Extension

As a developer,
I want the financial engine to compute all output sections present in the reference spreadsheet,
So that the Financial Statement views have complete data to render (FR8, FR9, FR10).

**Acceptance Criteria:**

**Given** the existing financial engine in `shared/financial-engine.ts`
**When** the engine is extended with the missing computations
**Then** the engine accepts 5 new inputs: `ebitdaMultiple` (number), `targetPreTaxProfitPct` (5-element array), `shareholderSalaryAdj` (5-element array), `taxPaymentDelayMonths` (number), `nonCapexInvestment` (5-element array)
**And** new inputs have sensible defaults (ebitdaMultiple: 3, targetPreTaxProfitPct: [10,10,10,10,10], shareholderSalaryAdj: [0,0,0,0,0], taxPaymentDelayMonths: 1, nonCapexInvestment: derived from startup costs)
**And** `MonthlyProjection` gains 17+ new fields for balance sheet disaggregation: taxPayable, lineOfCredit, commonStock, retainedEarnings, totalCurrentAssets, totalAssets, totalCurrentLiabilities, totalLiabilities, totalEquity, totalLiabilitiesAndEquity
**And** `MonthlyProjection` gains 17 new fields for cash flow disaggregation: cfAccountsReceivableChange, cfInventoryChange, cfOtherAssetsChange, cfAccountsPayableChange, cfTaxPayableChange, cfNetOperatingCashFlow, cfCapexPurchase, cfNetBeforeFinancing, cfNotesPayable, cfLineOfCredit, cfInterestExpense, cfDistributions, cfEquityIssuance, cfNetFinancingCashFlow, cfNetCashFlow, beginningCash, endingCash
**And** a new `ValuationOutput` section is computed per year (11 fields): grossSales, netOperatingIncome, shareholderSalaryAdj, adjNetOperatingIncome, adjNetOperatingIncomePct, equityInvestedCapital, estimatedValue, estimatedTaxesOnSale, netAfterTaxProceeds, replacementReturnRequired, businessAnnualROIC
**And** `ROICOutput` is extended to 15 fields per year: outsideCash, totalLoans, totalCashInvested, totalSweatEquity, retainedEarningsLessDistributions, totalInvestedCapital, preTaxNetIncome, preTaxNetIncomeIncSweatEquity, taxRate, taxesDue, afterTaxNetIncome, roicPct, avgCoreCapitalPerMonth, monthsOfCoreCapital, excessCoreCapital
**And** `AuditChecks` is extended from 4 checks to 13: Balance Sheet Imbalance I & II, P&L Check, Balance Sheet Check, Cash Flow Check I & II, Corporation Tax Check, Working Capital Check, Debt Check, Capex Check, Breakeven Check, ROI Check, Valuation Check
**And** 12+ P&L analysis lines are computed: Adjusted Pre-tax Profit, Target Pre-tax Profit, Above/Below Target, Non-Labor Gross Margin, Total Wages, Adjusted Total Wages, Salary Cap @ target %, (Over)/Under Cap, Labor Efficiency, Adjusted Labor Efficiency, Discretionary Marketing %, PR Taxes & Benefits as % of All Wages, Other OpEx as % of Revenue
**And** all existing 140+ engine tests continue passing (no regressions)
**And** new computations have comprehensive test coverage verifiable against reference spreadsheet values
**And** the engine remains deterministic — identical inputs always produce identical outputs (FR9)

**Dev Notes:**
- This story is pure computation — no UI changes.
- Reference spreadsheets in `_bmad-output/planning-artifacts/reference-data/` are the verification source.
- The engine currently computes most P&L line items. This extension adds the remaining output sections (Valuation, extended ROIC, extended Audit) and disaggregates Balance Sheet and Cash Flow into their full component lines.
- See Sprint Change Proposal CP-2 for the complete field specification.

### Story 5.2: App Navigation, Reports Container & Summary Tab

As a franchisee (any persona),
I want a "Reports" sidebar destination with tabbed financial statements and an annual Summary as the landing tab,
So that I can quickly assess my business plan across all 5 years and drill into detail when I need it (FR7d).

**Acceptance Criteria:**

**Given** I am logged in with an active plan
**When** the sidebar renders
**Then** the sidebar navigation includes these items under the active plan: **My Plan**, **Reports**, **Scenarios**, **Settings**
**And** a "HELP" section includes **Planning Assistant**
**And** a "MY LOCATIONS" section includes **All Plans** (portfolio view)
**And** any existing mode switcher UI (Planning Assistant | Forms | Quick Entry segmented control) from Epic 4 is removed — there are no user-facing modes
**And** clicking **Reports** navigates to the Financial Statements container
**And** clicking **My Plan** navigates to the structured form-based input workspace (Story 5.6)

**Given** I click "Reports" in the sidebar navigation
**When** the Reports container renders
**Then** a horizontal tab bar shows: Summary | P&L | Balance Sheet | Cash Flow | ROIC | Valuation | Audit
**And** the Summary tab is active by default
**And** tab switching is instant with no loading state — all data comes from the cached engine computation
**And** each tab remembers its scroll position and drill-down state within the session
**And** on viewports below 1024px, tabs convert to a dropdown selector

**Given** I am on the Summary tab
**When** the tab renders
**Then** a sticky Key Metrics Callout Bar appears at the top showing: Total 5yr Pre-Tax Income, Break-even Month (with calendar date), and 5yr ROI %
**And** below the callout bar, collapsible sections render: Annual P&L Summary (expanded by default), Balance Sheet Summary (collapsed), Cash Flow Summary (collapsed), Break-Even Analysis (expanded), Startup Capital Summary (collapsed)
**And** Annual P&L Summary shows annual columns (Y1-Y5) with rows: Revenue, Cost of Sales, COGS %, Gross Profit, GP %, Direct Labor, DL %, Contribution Margin %, Total OpEx, OpEx %, EBITDA, EBITDA %, D&A, Interest, Net PBT, Net PBT %, Adj Net PBT, Adj Net PBT %
**And** Labor Efficiency subsection shows: Direct LER, Admin LER (Forecasted/Benchmark/Difference), Adj Total LER (Actual/Benchmark/Difference), Salary Cap, Over/Under Cap
**And** Balance Sheet Summary shows: Assets (of which Cash), Liabilities, Total Net Assets, Total Liabilities & Equity, (of which Retained Earnings)
**And** Cash Flow Summary shows: Closing Cash Balance per year
**And** Break-Even Analysis shows: Break-even month, break-even calendar date, cumulative cash flow sparkline, plain-language interpretation ("You'd start making money by [date]")
**And** Startup Capital Summary shows: Total investment, CapEx vs non-CapEx split, funding sources (equity vs debt)
**And** each section header includes a link to the detailed statement tab (e.g., "Annual P&L Summary → View Full P&L")

**Given** I am on the existing Dashboard Panel
**When** I click a summary metric card (e.g., "Pre-Tax Income: $142,000")
**Then** the system navigates to the relevant Reports tab scrolled to the relevant row (e.g., P&L tab scrolled to pre-tax income)

**Given** the progressive disclosure infrastructure
**When** I click on a year column header in any statement tab
**Then** that year expands to show 4 quarterly columns (Q1-Q4) plus the annual total
**And** other years remain collapsed as annual totals
**And** a breadcrumb/visual indicator shows the drill-down path (e.g., "Year 2 → Quarterly")
**And** clicking a quarter column header expands to 3 monthly columns with quarter and annual totals visible
**And** "Expand All" / "Collapse All" controls are available
**And** Enter on a focused column header drills down; Escape goes up a level

**Given** the plan uses single-value inputs (pre-Epic-7)
**When** any statement tab renders
**Then** a small link icon appears in the column header row spanning all 5 year columns with tooltip: "All years share the same value. Per-year values will be available in a future update."
**And** editing an input cell in any year column updates all year columns simultaneously with a brief flash animation on the propagated cells

**Given** any statement tab renders
**When** the tab has a completeness indicator
**Then** each tab in the tab bar shows a textual "BD" completeness badge: no indicator if all inputs have been user-edited, a count badge if some inputs are brand defaults (e.g., "P&L (3 BD)"), or "P&L (All BD)" if all inputs are still at brand defaults
**And** input cells that still hold brand default values show a small "BD" badge in the cell corner; the badge disappears when the user edits the value and returns if the user resets to default

**And** row labels (leftmost column) are sticky horizontally — always visible during horizontal scroll
**And** section headers are sticky vertically — always visible during vertical scroll
**And** sticky elements have a high z-index and subtle shadow to indicate floating
**And** currency values format as $X,XXX throughout; percentages as X.X%

**Dev Notes:**
- This story establishes the two-door sidebar navigation (My Plan / Reports) per consolidated UX spec Part 7. Any mode switcher UI from Epic 4 is explicitly removed.
- The `<FinancialStatements>` container component manages tab routing and shared state within the Reports destination.
- Progressive disclosure infrastructure (annual → quarterly → monthly) is built here and reused by all statement tabs.
- The `<ColumnManager>` component generates column definitions based on drill-down state.
- Linked-column indicators (pre-Epic-7) are implemented here and apply to all tabs.
- The Summary tab uses `<StatementSection>` components with `<StatementTable>` for each section.
- Tab completeness uses textual "BD" (Brand Default) count badges, NOT circle metaphors. Per-cell "BD" badges are part of the trust-through-transparency layer.
- See consolidated UX spec Part 7 (Navigation Architecture), Part 2 (Progressive Disclosure), Part 10 (Component Architecture), Part 14 (Empty & Incomplete States).

### Story 5.3: P&L Statement Tab (with Inline Editing)

As a franchisee,
I want to see my complete Profit & Loss statement matching the reference spreadsheet, with input cells I can edit directly,
So that I can understand how my assumptions flow through to profitability and adjust them in context (FR7a).

**Acceptance Criteria:**

**Given** I navigate to the P&L tab within Reports
**When** the tab renders
**Then** a sticky Key Metrics Callout Bar shows: Annual Revenue (Y1), Pre-Tax Income (Y1), Pre-Tax Margin %
**And** the P&L renders as a tabular financial document with progressive disclosure (annual default, drill to quarterly/monthly)
**And** row sections match the reference spreadsheet structure:
- **Revenue:** Monthly Revenue, Annual Revenue
- **COGS:** COGS %, COGS $
- **Gross Profit:** Gross Profit $, Gross Margin %
- **Operating Expenses:** Direct Labor (% and $), Management Salaries, Payroll Tax & Benefits, Facilities, Marketing/Advertising, Discretionary Marketing, Other OpEx
- **EBITDA:** EBITDA $, EBITDA Margin %
- **Below EBITDA:** Depreciation, Interest Expense
- **Pre-Tax Income:** Pre-Tax Income $, Pre-Tax Margin %
- **P&L Analysis:** Adjusted Pre-Tax Profit, Target Pre-Tax Profit, Above/Below Target, Salary Cap analysis, Labor Efficiency, Adjusted Labor Efficiency

**And** input-driven rows (Revenue, COGS %, Direct Labor %, Management Salaries, Facilities, Marketing, Other OpEx) are visually distinguished from computed rows using: a subtle tinted background (primary/5), a thin dashed left border (primary/20), and a small pencil icon on hover
**And** computed rows use standard background, medium weight text, no border decoration
**And** section headers use slightly elevated background with bold text
**And** the visual distinction does NOT rely solely on color — dashed border and pencil icon provide non-color indicators (Accessibility)

**Given** I click or Tab into an input cell in the P&L tab
**When** the cell receives focus
**Then** the cell enters edit mode immediately — inline editing is always available, not gated by any mode or toggle
**And** the cell uses the `<EditableCell>` component from Epic 4 with type-appropriate input (currency for dollar amounts, percentage for ratios)
**And** on blur or Enter, the value is saved via `PATCH /api/plans/:id/financial-inputs`, the engine recomputes, and all computed cells in the tab update within 2 seconds (NFR1)
**And** on Escape, the edit is cancelled and the previous value is restored
**And** Tab/Shift+Tab navigation moves between input cells (skipping computed cells)
**And** input cells at brand default values show a small "BD" badge in the cell corner; the badge disappears when the user edits the value
**And** each input cell shows a source attribution badge: "Brand Default", "AI", or no badge (user-entered) — visible without hover

**Given** the P&L tab has interpretation rows enabled (Story 5.8)
**When** interpretation rows render
**Then** key computed rows include an interpretation row below them showing contextual "so what" text:
- Gross Margin: "XX% — [within/above/below] [Brand] typical range ([low]-[high]%)" (benchmark from brand defaults only)
- Pre-Tax Margin: "[XX]% margin — [contextual interpretation]"
- Labor Efficiency: contextual interpretation with brand benchmark comparison
**And** if no brand benchmark exists for a metric, the interpretation shows only the percentage/ratio without benchmark context
**And** interpretations use neutral language: "within typical range," "above typical range," "below typical range" — never "good" or "bad"
**And** interpretation rows are associated with their parent data row via `aria-describedby`

**And** all cells support ARIA grid roles: input cells use `role="gridcell"` with `aria-readonly="false"`; computed cells use `aria-readonly="true"`
**And** hovering over any computed cell shows a tooltip with: plain-language explanation, calculation formula, and link to Glossary

**Dev Notes:**
- Row structure maps directly to the reference spreadsheet "P&L Statement" sheet.
- The `<StatementTable>` orchestrator composes `<SectionGroup>`, `<DataRow>`, `<ComputedCell>`, and `<InterpretationRow>` components.
- Inline editing is built directly into this story — input cells are ALWAYS editable in Reports per consolidated UX spec Part 10. There is no separate "Quick Entry Integration" story.
- Per-cell "BD" badges and source attribution badges are part of the trust-through-transparency layer (Experience Principle #5).
- Interpretation content and Guardian integration are wired in Story 5.8.
- See consolidated UX spec Part 10 (Reports Experience), Part 14 (Empty & Incomplete States), Part 5 (Dynamic Interpretation).

### Story 5.4: Balance Sheet & Cash Flow Tabs

As a franchisee,
I want to see my complete Balance Sheet and Cash Flow Statement matching the reference spreadsheet,
So that I can understand my asset/liability position and where cash comes from and goes (FR7b, FR7c).

**Acceptance Criteria:**

**Given** I navigate to the Balance Sheet tab
**When** the tab renders
**Then** a sticky Key Metrics Callout Bar shows: Total Assets (Y1), Total Equity (Y1), and Balance Sheet status (pass/fail)
**And** the Balance Sheet renders with progressive disclosure and row sections matching the reference spreadsheet:
- **Current Assets:** Cash, Accounts Receivable, Other Current Assets, Total Current Assets
- **Fixed Assets:** Equipment (Gross Fixed Assets), Accumulated Depreciation, Net Book Value (Net Fixed Assets)
- **Other Assets:** Other Assets
- **Total Assets**
- **Current Liabilities:** Accounts Payable, Tax Payable, Credit Card Payable, Line of Credit, Total Current Liabilities
- **Long-Term Liabilities:** Notes Payable, Total Long-Term Liabilities
- **Total Liabilities**
- **Capital (Equity):** Common Stock / Paid-in Capital, Retained Earnings, Total Capital
- **Total Liabilities and Equity**
- **Core Capital Metrics:** Core Capital target levels, Months of Core Capital, Excess Core Capital
- **Ratios:** AR DSO, AP % of COGS

**And** a balance sheet identity check row shows: "Total Assets = Total Liabilities + Equity" with a pass/fail icon per column (checkmark for pass, alert icon for fail)
**And** if the identity check fails for any column, the row highlights in destructive color with the specific values shown

**Given** I navigate to the Cash Flow tab
**When** the tab renders
**Then** a sticky Key Metrics Callout Bar shows: Net Cash Flow (Y1), Ending Cash (Y5), and lowest cash point (month and amount)
**And** the Cash Flow renders with progressive disclosure and row sections matching the reference spreadsheet:
- **Operating Activities:** Net Income, Add Back Depreciation, Changes in AR, Changes in Inventory, Changes in Other Assets, Changes in AP, Changes in Tax Payable, Net Operating Cash Flow
- **Investing Activities:** Purchase of Fixed Assets (CapEx), Net Cash Before Financing
- **Financing Activities:** Notes Payable, Line of Credit Draws/Repayments, Interest Expense, Distributions, Equity Issuance, Net Financing Cash Flow
- **Net Cash Flow:** Net Cash Flow, Beginning Cash, Ending Cash
- **Cash Management:** Check row, LOC Balance, Base Cash Balance, Cash Available to Pay on Line, Cash Needed to Draw on Line

**And** any month where Ending Cash is negative displays a subtle warm background tint AND a small downward-arrow icon in the cell — advisory, not destructive red
**And** the cash flow identity check (Ending Cash = Beginning Cash + Net Cash Flows) shows pass/fail per column with specific values

**And** both tabs use the same `<StatementTable>` component family as the P&L tab
**And** both tabs have input-driven rows visually distinguished from computed rows (same pattern as P&L)

**Given** I click or Tab into an input cell in the Balance Sheet or Cash Flow tabs
**When** the cell receives focus
**Then** the cell enters edit mode immediately — inline editing is always available, same behavior as P&L (Story 5.3)
**And** the cell uses the `<EditableCell>` component with type-appropriate input
**And** on blur or Enter, the value is saved, the engine recomputes, and all computed cells update within 2 seconds (NFR1)
**And** on Escape, the edit is cancelled and the previous value is restored
**And** Tab/Shift+Tab navigation moves between input cells (skipping computed cells)
**And** input cells at brand default values show a small "BD" badge in the cell corner
**And** each input cell shows a source attribution badge: "Brand Default", "AI", or no badge (user-entered)

**Dev Notes:**
- Balance Sheet and Cash Flow are built together because they are tightly coupled through LOC mechanics (Line of Credit draws/repayments flow between them) and tax payable timing.
- Inline editing is built directly into this story — same always-editable pattern as Story 5.3. Per consolidated UX spec Part 10.
- Negative cash highlighting uses a warm advisory color, NOT destructive red — consistent with the Guardian's "Concerning" level.
- See consolidated UX spec Part 10 (Reports Experience), Part 14 (Empty & Incomplete States).

### Story 5.5: ROIC, Valuation & Audit Tabs

As a franchisee,
I want to see my Return on Invested Capital, business valuation analysis, and financial integrity audit results,
So that I can understand my return, what the franchise could be worth, and trust the accuracy of projections (FR7e, FR7f, FR7g).

**Acceptance Criteria:**

**Given** I navigate to the ROIC tab
**When** the tab renders
**Then** the ROIC view renders as a tabular view with annual columns only (Y1-Y5, no monthly drill-down)
**And** a sticky Key Metrics Callout Bar shows: "Your 5-year cumulative ROIC of X% means for every dollar you invested, you earned $Y back."
**And** row sections match the reference spreadsheet:
- **Invested Capital:** Outside Cash (Equity), Total Loans (Debt), Total Cash Invested, Total Sweat Equity, Retained Earnings less Distributions, Total Invested Capital
- **Returns:** Pre-Tax Net Income, Pre-Tax Net Income incl. Sweat Equity, Tax Rate, Taxes Due, After-Tax Net Income, ROIC %
- **Core Capital:** Average Core Capital per Month, Months of Core Capital, Excess Core Capital

**Given** I navigate to the Valuation tab
**When** the tab renders
**Then** the Valuation view renders with annual columns only (Y1-Y5)
**And** a sticky Key Metrics Callout Bar shows: Estimated Enterprise Value (Y5), Net After-Tax Proceeds (Y5)
**And** row sections match the reference spreadsheet:
- **EBITDA Basis:** EBITDA, EBITDA Multiple (editable input), Estimated Enterprise Value
- **Adjustments:** Less: Outstanding Debt, Less: Working Capital Adjustment, Estimated Equity Value
- **After-Tax:** Estimated Taxes on Sale (21%), Net After-Tax Proceeds
- **Returns:** Total Cash Extracted (distributions + sale proceeds), Total Invested, Net Return, Return Multiple, Replacement Return Required, Business Annual ROIC
**And** EBITDA Multiple is the primary editable input cell on this tab — visually distinguished with the same input cell pattern (tinted background, dashed border, pencil icon)

**Given** I navigate to the Audit tab
**When** the tab renders
**Then** the Audit view displays as a diagnostic checklist (not a tabular financial statement)
**And** all 13 integrity checks are shown matching the reference spreadsheet: Balance Sheet Imbalance I & II, P&L Check, Balance Sheet Check, Cash Flow Check I & II, Corporation Tax Check, Working Capital Check, Debt Check, Capex Check, Breakeven Check, ROI Check, Valuation Check
**And** each check shows: check name, pass/fail status (checkmark icon for pass, alert icon for fail), expected value, actual value, and tolerance
**And** a visual summary shows: "X of 13 checks passing"
**And** failed checks include a specific explanation of what's wrong and a navigation link "[View in Balance Sheet →]" that navigates to the relevant statement tab and row
**And** the Audit view is read-only — it has no editable cells (it is a diagnostic view, not a financial statement)

**Given** I click or Tab into the EBITDA Multiple cell in the Valuation tab
**When** the cell receives focus
**Then** the cell enters edit mode immediately — inline editing is always available, same behavior as P&L (Story 5.3)
**And** on blur or Enter, the value is saved, the engine recomputes, and all Valuation computed cells update
**And** the EBITDA Multiple cell shows a "BD" badge if still at brand default; the badge disappears on edit

**Dev Notes:**
- ROIC, Valuation, and Audit are built together because they are simpler annual-only views (no monthly drill-down).
- Audit is a diagnostic view, not a financial statement — it uses a different layout than the other tabs.
- The Valuation tab's editable EBITDA Multiple cell reuses the same `<EditableCell>` component from Epic 4. Inline editing is always available per consolidated UX spec Part 10.
- See consolidated UX spec Part 10 (Reports Experience).

### Story 5.6: My Plan + Impact Strip + Bidirectional Data Flow

As a franchisee,
I want a structured form-based input workspace (My Plan) with a persistent Impact Strip showing real-time financial impact and deep links to Reports,
So that I can fill in my business plan through guided forms while seeing the financial impact of every change (FR7h, FR7d).

**Acceptance Criteria:**

**Given** I click "My Plan" in the sidebar navigation
**When** the My Plan workspace renders
**Then** a plan completeness dashboard appears at the top: a visual summary showing each section's progress (e.g., "Revenue: 8/10 fields | Operating Costs: 3/12 fields")
**And** collapsible form sections are organized by financial category: Revenue, COGS, Labor, Facilities, Marketing, Management Salaries, Startup Costs, Financing
**And** each section shows form fields pre-filled with brand default values
**And** every input field carries per-field metadata: brand default value, Item 7 range (if applicable), source attribution ("Brand Default" / "AI" / "Your Entry"), reset-to-default affordance, and contextual help (expand/collapse)
**And** on field focus, a subtle metadata panel shows the brand default value and Item 7 range; on blur, the metadata disappears

**Given** the Impact Strip renders (persistent sticky bar at the bottom of My Plan)
**When** I am editing a form section
**Then** the Impact Strip shows 3-4 key metrics most relevant to the section I'm currently editing:
- Revenue section → Pre-Tax Income, Break-even, Gross Margin, 5yr ROI
- Operating Expenses section → EBITDA, Pre-Tax Income, Labor Efficiency
- Financing section → Cash Position, Debt Service, Break-even
- Startup Costs section → Total Investment, ROI, Break-even

**Given** I change an input value in My Plan
**When** the engine recalculates
**Then** affected metrics in the Impact Strip show a delta indicator ("+$3,200") in a subtle highlight for 3 seconds, then the highlight fades but the new value remains
**And** the same value is immediately reflected in Reports — if the user navigates to Reports, the updated value appears in the corresponding input cell (bidirectional data flow)

**Given** the Impact Strip includes deep links to Reports
**When** I view the Impact Strip
**Then** a "View Full P&L →" link (or relevant statement name based on active section) navigates to the corresponding Reports tab
**And** the "Return to Editing" browser back button (or a link in Reports) brings the user back to My Plan

**Given** the Impact Strip includes a miniature Guardian
**When** it renders
**Then** three colored dots with icons (matching Guardian Bar pattern from Story 5.8) show break-even, ROI, and cash health status
**And** if an edit pushes a Guardian metric from green to amber, the dot animates briefly
**And** clicking a miniature Guardian dot navigates to Reports with the relevant tab and row focused

**Given** the Impact Strip includes a document preview icon
**When** I click the document icon
**Then** a Document Preview modal opens showing all pages of the business plan document rendered at readable size (Story 5.9)

**Given** I edit a value in Reports (inline editing in a statement tab) and then navigate to My Plan
**When** My Plan renders
**Then** the form field corresponding to the edited value reflects the updated value
**And** bidirectional data flow is seamless — both surfaces read from and write to the same plan state

**Given** the AI Planning Assistant is available within My Plan
**When** I click the floating action button or header icon
**Then** the AI Planning Assistant panel slides in from the right edge (see Epic 9 for full AI behavior)
**And** navigating away from My Plan (e.g., clicking Reports in sidebar) closes the AI panel; conversation state is preserved

**Dev Notes:**
- This story establishes the My Plan workspace as the structured form-based "door" into the plan, complementing Reports (the tabbed financial statements "door"). Per consolidated UX spec Part 8.
- The Impact Strip is a `<ImpactStrip>` component (~100 lines) rendered as a persistent sticky bar at the bottom of My Plan. Context-sensitive metrics require mapping each form section to relevant financial metrics.
- Bidirectional data flow: My Plan and Reports both read from and write to the same shared plan state (e.g., `PATCH /api/plans/:id/financial-inputs`). Edits in either surface are immediately reflected in the other.
- The old `quick-entry-mode.tsx` flat grid component is retired. There is no "All Inputs" fallback tab, no orientation overlay, and no mode-gated editing. The flat grid's function is fully replaced by Reports' inline-editable statement tabs.
- The AI Planning Assistant is a feature within My Plan, not a separate mode. Entry points and panel behavior are detailed in Epic 9 and consolidated UX spec Part 9.
- See consolidated UX spec Part 7 (Navigation Architecture), Part 8 (My Plan Experience), Part 9 (AI Planning Assistant).

### Story 5.7: Scenario Comparison — **RETIRED** (migrated to Epic 10)

> **Status:** RETIRED per SCP-2026-02-20 Decision D6. The column-splitting scenario comparison approach described below has been replaced by the standalone What-If Playground (Epic 10). Epic 5 closes with 9 stories: 5.1–5.6, 5.8–5.10.

~~As a franchisee,
I want to compare my base case against conservative and optimistic scenarios,
So that I can build conviction that my plan works even in a challenging environment (FR7d).~~

**Acceptance Criteria:**

**Given** I am viewing any Reports tab
**When** I look at the Scenario Bar (persistent bar between tab navigation and statement content)
**Then** I see: "Viewing: ● Base Case" with a "[Compare Scenarios]" dropdown/button

**Given** I click "Compare Scenarios"
**When** the dropdown opens
**Then** I see two quick scenario options: "Conservative" and "Optimistic"
**And** I see a disabled "Create Custom Scenario" option with tooltip: "Custom scenarios coming in a future update" (deferred to Epic 10)

**Given** I activate scenario comparison
**When** the statement view transforms
**Then** each year column splits into 3 sub-columns: Base, Conservative, Optimistic
**And** scenario columns are color-coded: Base (neutral), Conservative (muted warm), Optimistic (muted cool)
**And** a comparison summary card appears above the table with precise language: "In the conservative scenario (15% lower revenue, higher costs), your business reaches break-even by Month [X] and generates $[Y] in Year 1 pre-tax income. Your base case projects $[Z], and the optimistic case projects $[W]."
**And** the summary card language acknowledges this is a sensitivity analysis, not a guarantee — never says "Even in the conservative scenario..."

**Given** the quick scenario sensitivity model
**When** Conservative scenario is computed
**Then** three variables are adjusted simultaneously: Revenue -15%, COGS % +2 percentage points, Operating Expenses +10%
**And** when Optimistic scenario is computed, adjustments are: Revenue +15%, COGS % -1 percentage point, Operating Expenses -5%
**And** sensitivity factors are sourced from brand-level defaults (configurable by franchisor in brand configuration, with the above values as sensible defaults)
**And** scenarios are computed client-side by applying sensitivity multipliers to base case inputs — they do NOT persist unless the user explicitly saves them

**Given** scenario comparison is active and the user attempts to drill down
**When** the comparison is at annual view (default)
**Then** year headers lose their expand affordance
**And** a tooltip explains: "Collapse comparison to drill into year detail"
**Given** the user had already drilled into a year before activating comparison
**Then** comparison shows 3 scenario columns per quarter for the expanded year; other years show Base Case only
**Given** the user had drilled to monthly before activating comparison
**Then** the system auto-collapses to quarterly for the expanded year and shows comparison with a brief toast: "Comparison view available at annual and quarterly levels"

**Dev Notes:**
- The interaction constraint between comparison and drill-down prevents column explosion (Critique Issue #2).
- Quick scenarios require zero configuration — they are auto-generated from the base case.
- Brand-configurable sensitivity factors anticipate that some franchisors will calibrate based on actual variance data.
- See UX spec Part 4 (Scenario Comparison).

### Story 5.8: Guardian Bar & Dynamic Interpretation

As a franchisee,
I want persistent at-a-glance feedback on my plan's health and contextual interpretation of every key metric,
So that every decision I make is informed by its financial impact (FR7d).

**Acceptance Criteria:**

**Given** I am viewing any Reports tab
**When** the Guardian Bar renders (persistent slim bar above the tabs, below the workspace header)
**Then** three indicators are shown: Break-even (month and calendar date), 5yr ROI (percentage), Cash Position (status)
**And** each indicator uses BOTH a color AND a distinct icon shape:
- Healthy: Green (success token) + Checkmark icon
- Attention: Amber/Yellow (warning token) + Alert triangle icon
- Concerning: Gurple (info/advisory token) + Info circle icon
**And** the color/icon system is NOT a red/yellow/green traffic light — Gurple (advisory purple) is used for "concerning," NOT destructive red
**And** each indicator always includes the specific value in text ("5yr ROI: 127%") — the color/icon is supplementary, not the primary information channel

**Given** the Guardian threshold configuration
**When** thresholds are evaluated
**Then** default thresholds are:
- Break-even: Healthy ≤ 18 months, Attention 18-30 months, Concerning > 30 months
- 5-Year ROI: Healthy ≥ 100%, Attention 50-100%, Concerning < 50%
- Cash Position: Healthy = never negative, Attention = negative ≤ 3 months, Concerning = negative > 3 months
**And** thresholds use brand-specific defaults when configured by the franchisor (future configurability in Epic 8)
**And** for MVP, sensible defaults above are used

**Given** I click a Guardian indicator
**When** the system responds
**Then** I am navigated to the relevant financial statement tab and scrolled to the relevant row:
- Clicking "Break-even: Mo 14" → Summary tab, break-even analysis section
- Clicking "Cash: lowest point -$8,200 in Month 6" → Cash Flow tab, drills into Year 1 monthly view, highlights Month 6
- Clicking "5yr ROI: 127%" → ROIC tab

**Given** I edit an input cell inline in Reports
**When** the engine recalculates
**Then** the Guardian Bar updates in real time reflecting the new computation
**And** if a Guardian indicator changes threshold level (e.g., green → amber), the indicator animates briefly to draw attention

**Given** dynamic interpretation rows are enabled across statement tabs (P&L, Balance Sheet, Cash Flow)
**When** a key computed row renders
**Then** an interpretation row appears below it with contextual "so what" text:
- Type 1 (Callout bar metrics): Key summary numbers with plain-language impact statement
- Type 2 (Inline interpretation): Benchmark comparison using brand defaults only — "XX% — within [Brand] typical range ([low]-[high]%)"
- Type 3 (Hover tooltips on computed cells): Plain-language explanation, calculation formula, and Glossary link
**And** benchmarks come ONLY from brand defaults configured by the franchisor — never from universal databases
**And** if no brand benchmark exists, interpretation shows only the percentage/ratio without benchmark context
**And** when editing input cells inline in Reports, interpretations update in real time

**Dev Notes:**
- The Guardian Bar is a separate `<GuardianBar>` component (~80 lines), always visible at the top of the Financial Statements container.
- Guardian is a compass, not a judgment — language is always factual ("Break-even: Month 14") and the user draws their own conclusions.
- Interpretation rows are `<InterpretationRow>` components (~40 lines each) associated with parent data rows via `aria-describedby`.
- Guardian thresholds are hardcoded defaults for MVP. Epic 8 (Advisory Guardrails) adds brand-configurable thresholds.
- See UX spec Part 5 (Dynamic Interpretation), Part 6 (ROI Threshold Guardian).

### Story 5.9: Document Preview & PDF Generation Trigger

As a franchisee,
I want to preview my business plan document and generate a PDF from key locations in the app,
So that I can see my progress toward a professional lender package and feel pride in what I'm building (FR7d).

**Acceptance Criteria:**

**Given** I am on the Dashboard Panel
**When** the dashboard renders
**Then** a Document Preview widget card appears showing the first page of the lender document in miniature
**And** the preview card shows the franchisee's name on the document (the pride moment — "progressive pride")
**And** the preview updates in real time as inputs change
**And** "View Full Preview" opens the full Document Preview modal
**And** "Generate PDF" triggers PDF generation (Story 6.1)
**And** if the plan is at < 50% input completeness, the preview shows a "Draft" watermark

**Given** I click the document preview icon in the Impact Strip (within My Plan, Story 5.6)
**When** the Document Preview modal opens
**Then** it shows all pages of the business plan document rendered at readable size
**And** the preview reflects the current state of my financial inputs
**And** a "Generate PDF" button is available within the preview modal

**Given** I am in Reports
**When** the Reports header renders
**Then** a "Generate PDF" button appears in the header area (no preview in Reports — the user is already looking at the content)
**And** the button label evolves with completeness: < 50% → "Generate Draft"; 50-90% → "Generate Package"; > 90% → "Generate Lender Package"

**Given** the plan has all inputs at brand defaults (no user edits)
**When** the Document Preview widget renders
**Then** a note appears: "Your plan is using all brand default values. Customize your inputs in My Plan for projections based on your specific situation."

**Dev Notes:**
- The Document Preview modal is a `<DocumentPreviewModal>` component (~120 lines) that renders the plan as formatted pages.
- Document Preview is accessible from: (1) Dashboard preview widget, (2) My Plan via Impact Strip document icon (Story 5.6), (3) Reports gets a "Generate PDF" button only — no preview within Reports.
- The Impact Strip component and its behavior are defined in Story 5.6 (My Plan + Impact Strip). This story covers only the Document Preview modal and the PDF generation trigger points.
- The "Generate PDF" button in the Reports header connects to Story 6.1.
- See consolidated UX spec Part 13 (Document Preview), Part 14 (Empty & Incomplete States).

### Story 5.10: Glossary & Contextual Help

As a franchisee,
I want access to a glossary of financial terms and contextual help for every input field,
So that I can understand what each metric means and make informed decisions (FR7k, FR7l).

**Acceptance Criteria:**

**Given** I navigate to the Glossary
**When** the Glossary page renders (accessible from sidebar navigation item "Glossary")
**Then** I see a searchable list of 15 financial terms: Payback Period, EBITDA, Adj Net Profit Before Tax, Shareholder Salary Adjustment, EBITDA Multiple, Average Unit Volume (AUV), Direct Labor Cost, Facilities, Equity - Cash, Core Capital, Estimated Distributions, ROIC, Breakeven, Number of Months to Breakeven, Cash Flow
**And** each term includes: plain-language definition (universal across brands), how it's calculated (from engine logic), and a "See it in your plan" link that navigates to the relevant financial statement section
**And** if brand-specific benchmark values are configured by the franchisor (via brand defaults), they are displayed alongside the definition — benchmarks are sourced from brand configuration, NOT hardcoded in the glossary
**And** if no brand benchmark exists, the term shows definition and calculation only — no benchmark section

**Given** I hover over any computed cell in a financial statement tab
**When** the tooltip renders
**Then** it shows: what the number means in plain language, how it's calculated (e.g., "Revenue ($360,000) minus COGS ($108,000)"), and a "Learn more" link to the full Glossary entry for that term

**Given** I view any input field (in My Plan forms, Reports inline cells, or Startup Costs)
**When** I hover over the info icon next to the field
**Then** a tooltip shows the field's explanation text (1-2 sentences from spreadsheet cell comments for consolidated fields; newly authored text for decomposed sub-fields)
**And** a "Learn more" link opens an expanded help panel with deeper explanation (1-2 paragraphs, extracted from Loom video teaching content)
**And** if a brand-specific benchmark exists for this field, it is shown in the tooltip

**Given** the help content data model
**When** help content is stored
**Then** each field's help content includes: fieldKey (e.g., "input.facilities", "input.facilities.rent"), tooltipText (brief 1-2 sentences), expandedHelp (deeper 1-2 paragraphs from video content extraction), glossaryTermSlug (links to glossary entry, nullable), parentFieldKey (for decomposed sub-fields, nullable)
**And** help content is stored as platform-level text data — not hardcoded in component files
**And** ~33 tooltip texts are sourced from spreadsheet cell comments (consolidated fields)
**And** ~20 new tooltip texts are authored for decomposed sub-fields (My Plan guided form fields)
**And** expanded help content is extracted from the 25 Loom walkthrough videos into text-based guidance

**Dev Notes:**
- Glossary is a standalone page accessible from sidebar navigation.
- Inline tooltips integrate into every computed cell and every input field — this is the "education for empowerment" layer.
- Help content for decomposed sub-fields (rent, utilities, telecom, etc.) must be newly authored — the spreadsheet never decomposed these fields.
- Loom video content extraction is a prerequisite content authoring task — the videos are watched, teaching is distilled into text, and stored as platform data.
- See UX spec Part 11 (Glossary), Part 5 (Type 3: Hover Tooltips), and Course Correction Addendum (Guided Decomposition) Section 3 (Help Content System).

---

## Epic 6: Document Generation & Vault

Generate lender-grade PDF business plan packages and maintain document history with download capability. Elevated from old Epic 7 (stories 7.2 and 7.3). The document is the product's primary deliverable — what Sam takes to the bank, what Chris uses for location #2 financing, what Jordan presents to investors.

**FRs covered:** FR24, FR25, FR26, FR27
**Dependencies:** Epic 5 (financial statement views provide the content that PDF exports)

### Story 6.1: PDF Document Generation

As a franchisee,
I want to generate a professional PDF business plan package,
So that I can walk into a bank meeting feeling confident and prepared (FR24, FR25).

**Acceptance Criteria:**

**Given** I have a plan with financial projections
**When** I click "Generate PDF" (from the Financial Statements header, Dashboard preview widget, or Impact Strip document icon)
**Then** a PDF package is generated within 30 seconds (NFR3) containing:
- Cover page with franchisee name, brand identity (logo, colors), and plan date
- Executive Summary with key metrics (break-even, 5yr ROI, total investment)
- Pro forma P&L Statement (annual summary + monthly detail for all 5 years)
- Balance Sheet (annual summary + monthly detail)
- Cash Flow Statement (annual summary + monthly detail)
- ROIC Analysis (annual)
- Valuation Analysis (annual)
- Break-Even Analysis with cumulative cash flow chart
- Startup Capital Summary

**And** the document header reads "[Franchisee Name]'s [Brand] Business Plan" — franchisee name before brand name
**And** professional formatting with brand identity (logo, colors) and Katalyst design — consistent typography, proper page breaks, branded headers/footers, and financial tables with formatting that matches or exceeds what a financial consultant would produce
**And** FTC-compliant disclaimers state on every page: "These projections are franchisee-created estimates and do not constitute franchisor earnings claims or representations" (FR25)
**And** financial values use consistent formatting throughout: currency as $X,XXX, percentages as X.X% (NFR27)

**Given** the "Generate PDF" button label evolves with input completeness (Story 5.9)
**When** the button is clicked at < 50% completeness
**Then** the generated PDF includes a "DRAFT" watermark on every page
**And** a brief note on the cover: "This plan contains brand default assumptions that have not been personalized. Review and update inputs for a complete projection."

**Given** scenario comparison is active when PDF is generated
**When** the PDF renders
**Then** the PDF includes the comparison summary card text and scenario columns in the P&L and key metrics tables

**And** the PDF is available for immediate download upon generation
**And** the generated PDF is stored for future access (Story 6.2)

**Dev Notes:**
- PDF generation runs server-side using a PDF library (e.g., `@react-pdf/renderer` or `puppeteer` for high-fidelity rendering).
- The PDF content mirrors the Financial Statement views — same line items, same structure, but formatted for print/PDF.
- The "Generate PDF" button in the Financial Statements header was placed by Story 5.9.
- See UX spec Part 7 (Document Preview — Progressive Pride) for emotional design context.

### Story 6.2: Document History & Downloads

As a franchisee,
I want to view and download my previously generated documents,
So that I can access any version of my plan at any time (FR26, FR27).

**Acceptance Criteria:**

**Given** I have generated one or more document packages
**When** I view my document history (accessible from sidebar navigation or Dashboard)
**Then** I see a chronological list of all previously generated documents with: generation timestamp, plan name, input completeness at time of generation (draft/partial/complete), and file size
**And** I can download any previous document with a single click
**And** generated documents are immutable — changes to the plan after generation do not alter existing documents (NFR18)
**And** documents are stored with metadata in PostgreSQL (generation date, plan snapshot ID, completeness level) and binary PDF in Replit Object Storage
**And** each document entry shows a thumbnail preview of the first page
**And** a "Generate New" button is prominently available to create an updated version reflecting current inputs

---

## Epic 7: Per-Year Inputs & Multi-Plan Management

Enable Year 1-5 independent input values for all per-year financial assumptions, unlocking growth trajectory modeling. Add plan creation, naming, cloning, and navigation for multi-location planning.

**FRs covered:** FR7i, FR7j, FR15, FR16
**Dependencies:** Epic 5 (financial statement views with linked-column indicators provide the visual foundation that this epic unlocks)

### Story 7.1: Per-Year Input Columns

As a franchisee,
I want to set different values for each year (Year 1 through Year 5) for my financial assumptions,
So that I can model realistic growth trajectories instead of flat projections across all 5 years (FR7i).

**Acceptance Criteria:**

**Given** the `PlanFinancialInputs` interface is restructured
**When** per-year fields are stored
**Then** all 10 per-year operating cost categories use 5-element arrays: growthRates[5], royaltyPct[5], adFundPct[5], cogsPct[5], laborPct[5], facilitiesAnnual[5], marketingPct[5], managementSalariesAnnual[5], payrollTaxPct[5], otherOpexPct[5]
**And** new per-year fields are added: targetPreTaxProfitPct[5], shareholderSalaryAdj[5], distributions[5], nonCapexInvestment[5]
**And** missing single-value fields are added to the UI: arDays, apDays, inventoryDays, taxPaymentDelayMonths, ebitdaMultiple
**And** existing plans are migrated by broadcasting current single values into 5-element arrays (semantically identical — no data loss)

**Given** I am editing inputs via Reports inline editing (Financial Statement tabs)
**When** I edit a value in a specific year column
**Then** only that year's value changes — other years retain their independent values
**And** the linked-column indicators from Story 5.2 are removed (link icons disappear, cells no longer flash on broadcast)
**And** a "Copy Year 1 to all years" action is available for users who want to broadcast a single value

**Given** I am editing inputs in Forms mode (My Plan)
**When** the form renders per-year fields
**Then** each per-year field shows 5 input columns labeled Year 1 through Year 5
**And** by default, Year 2-5 inherit Year 1's value with a visual indicator (link icon, lighter text) showing they are inherited
**And** editing Year 2-5 breaks the inheritance for that specific year — the value becomes independent
**And** a "Reset to Year 1" action is available per cell to re-establish inheritance

**Given** the Facilities field alignment
**When** the input structure is corrected
**Then** the engine's single `facilitiesAnnual[5]` field is exposed directly in Reports inline editing as "Facilities ($)" per year (matching the spreadsheet)
**And** in Forms mode (My Plan), the guided decomposition (rent, utilities, telecom, vehicle fleet, insurance) rolls up into `facilitiesAnnual[year]` with per-year support
**And** Other OpEx changes from flat dollar amount to % of revenue (matching the spreadsheet), with migration converting existing dollar values to equivalent percentages based on projected revenue

**Dev Notes:**
- This is the story that removes the "linked columns" behavior introduced in Story 5.2 and replaces it with independent per-year editing.
- The `PlanFinancialInputs` → `FinancialInputs` translation layer changes from broadcasting single values to passing per-year arrays directly.
- Migration must handle existing plans gracefully — broadcast current single values to 5-element arrays.
- The Facilities and Other OpEx field alignment fixes are included here because they are structurally tied to the per-year restructuring.
- See Sprint Change Proposal CP-3 (Fix PlanFinancialInputs) and UX spec Part 3 (Pre-Epic-7 / Post-Epic-7 behavior).

### Story 7.2: Plan CRUD & Navigation

As a franchisee,
I want to create, name, rename, clone, and switch between multiple plans,
So that I can model different locations or scenarios as separate plans (FR15, FR16).

**Acceptance Criteria:**

**Given** I am on the Dashboard or in the sidebar
**When** I click "Create New Plan"
**Then** a new plan is created with the brand's default financial parameters and startup cost template
**And** I am prompted to name the plan (e.g., "PostNet - Downtown Location")
**And** the new plan opens in the planning workspace immediately
**And** the backend `POST /api/plans` endpoint is called (already exists but has no UI trigger)

**Given** I have an existing plan
**When** I want to duplicate it
**Then** a "Clone Plan" action is available in the plan's context menu (kebab menu or similar)
**And** cloning creates a new plan with all financial inputs and startup costs copied from the source plan
**And** the cloned plan is named "[Source Plan Name] (Copy)" and can be renamed immediately
**And** the cloned plan is independent — changes to the clone do not affect the original

**Given** I have a plan
**When** I want to rename it
**Then** I can click the plan name in the workspace header to enter inline edit mode
**And** the new name saves on blur or Enter, cancels on Escape
**And** plan names are validated: non-empty, max 100 characters

**Given** I have multiple plans
**When** I am in the sidebar
**Then** a "My Plans" section in the sidebar lists all my plans with their names
**And** clicking a plan navigates to that plan's workspace
**And** the currently active plan is visually highlighted in the sidebar
**And** each plan shows a compact status indicator (e.g., input completeness percentage or "Draft"/"Complete" label)

**Given** I want to delete a plan
**When** I select "Delete Plan" from the context menu
**Then** a confirmation dialog appears: "Delete [Plan Name]? This cannot be undone. All financial data and generated documents for this plan will be permanently removed."
**And** deletion requires typing the plan name to confirm (destructive action safeguard)
**And** the last remaining plan cannot be deleted — at least one plan must exist

**Dev Notes:**
- Backend `POST /api/plans` already exists. This story adds the UI trigger and additional endpoints: `PATCH /api/plans/:id` (rename), `POST /api/plans/:id/clone` (clone), `DELETE /api/plans/:id` (delete).
- Sidebar plan navigation addresses Gap #9 from the brainstorming session.
- The "Create New Plan" button addresses Gap #1 and Gap #10 (blockers for multi-location planning).
- Plan naming addresses Gap #3 and Gap #4 (no more "Demo Plan" default name).
- See Brainstorming Session 2026-02-15, Layer 3 (Multi-Plan and Workflow Gaps).

---

## Epic 8: Advisory Guardrails & Smart Guidance

System provides non-blocking advisory nudges when franchisee inputs fall outside expected ranges, flags weak business cases with actionable guidance, and suggests consultant booking.

### Story 8.1: Input Range Validation & Advisory Nudges

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

### Story 8.2: Weak Business Case Detection & Actionable Guidance

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

## Epic 9: AI Planning Advisor (Planning Assistant)

Franchisees can have a natural-language conversation with an AI advisor in a split-screen layout. The advisor extracts structured financial inputs from conversation and populates the plan in real time.

### Story 9.1: LLM Integration & Conversation API

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

### Story 9.2: Split-Screen Planning Assistant Interface

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

### Story 9.3: AI Value Extraction & Field Population

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

### Story 9.4: Graceful Degradation & Mode Continuity

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

## Epic 10: What-If Playground (formerly "Scenario Comparison")

Standalone sidebar destination providing interactive graphical sensitivity analysis. Franchisees adjust assumption sliders and see all charts (Profitability, Cash Flow, Break-Even, ROI, Balance Sheet, Debt & Working Capital) update simultaneously across Base, Conservative, and Optimistic scenarios. This is a planning sandbox — slider adjustments do NOT change the user's actual plan. Replaces the retired Story 5.7 column-splitting approach. Per SCP-2026-02-20 Decision D5/D6 and Section 3.

### Story 10.1: Scenario Management & Comparison

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

---

## Epic 11: Data Sharing, Privacy & Pipeline Dashboards

Franchisees control data sharing with their franchisor via explicit opt-in/revoke. Franchisor admins see pipeline dashboards. Katalyst admins see cross-brand operational intelligence.

### Story 11.1: Franchisee Data Sharing Controls

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

### Story 11.2: Franchisor Pipeline Dashboard

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

### Story 11.3: Katalyst Admin Cross-Brand Dashboard

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

## Epic 12: Advisory Board Meeting (Phase 2 — Deferred)

Franchisees can stress-test their plan with multiple AI advisor personas who provide cross-cutting domain feedback. Persona definitions are data-driven and configurable.

*Stories for this epic will be created when Phase 2 planning begins. FRs covered: FR55, FR56, FR57, FR58.*

> **Pre-Planning Note:** Before story creation begins for Epic 12, review the **BMad Builder** project for applicable patterns, agent orchestration techniques, and persona management architecture. The Advisory Board Meeting feature's multi-persona orchestration is inspired by BMAD party mode, and the BMad Builder may contain updated patterns, templates, or tooling relevant to implementation.
> Reference: https://github.com/bmad-code-org/bmad-builder

---

## Epic ST: Admin Support Tools — Impersonation & Demo Modes

Katalyst admins need tools to validate the franchisee/franchisor experience, support clients shoulder-to-shoulder, and demo the platform to prospects. This epic delivers "View As" impersonation for real user data, per-brand franchisee demo mode, and a franchisor demo mode with a fictitious brand.

**Scope:** Katalyst admins only. Franchisors and franchisees never see or access these tools.
**Dependency:** Stories ST-1 and ST-2 have no external dependencies. Story ST-3 depends on brand financial parameters (Epic 2, done). Story ST-4 is blocked until Epic 11 delivers the franchisor dashboard — it should not be started until Story 11.2 is complete.

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
