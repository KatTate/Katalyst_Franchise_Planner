---
stepsCompleted: [1]
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

{{requirements_coverage_map}}

## Epic List

{{epics_list}}
