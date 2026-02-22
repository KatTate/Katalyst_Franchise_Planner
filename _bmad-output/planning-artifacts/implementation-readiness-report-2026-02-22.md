---
stepsCompleted: [step-01-document-discovery, step-02-prd-analysis]
assessmentDate: 2026-02-22
project: workspace
documentsAssessed:
  prd: _bmad-output/planning-artifacts/prd.md
  architecture: _bmad-output/planning-artifacts/architecture.md
  epics: _bmad-output/planning-artifacts/epics.md
  ux: _bmad-output/planning-artifacts/ux-design-specification-consolidated.md
---

# Implementation Readiness Assessment Report

**Date:** 2026-02-22
**Project:** Katalyst Growth Planner (workspace)

## Step 1: Document Discovery

### Documents Assessed

| Document | File | Lines | Last Modified |
|----------|------|-------|---------------|
| PRD | `prd.md` | 955 | 2026-02-22 |
| Architecture | `architecture.md` | 2,127 | 2026-02-22 |
| Epics & Stories | `epics.md` | 2,453 | 2026-02-22 |
| UX Design | `ux-design-specification-consolidated.md` | 1,414 | 2026-02-21 |

### Supporting Artifacts

- `product-brief-workspace-2026-02-08.md` — Original product brief
- `prd-validation-report.md` — Previous PRD validation
- `implementation-readiness-report-2026-02-20.md` — Previous IR report
- 6 Sprint Change Proposals (2026-02-09 through 2026-02-21)
- `tech-spec-5.2-progressive-disclosure-gaps.md` — Tech spec
- `reference-data/` — Reference data folder

### Issues

- **Duplicates:** None found
- **Missing Documents:** None — all four core documents present
- **Resolution Required:** None

## Step 2: PRD Analysis

### Functional Requirements Extracted

**Section 1: Financial Planning & Calculation (33 FRs)**
- FR1: 5-year monthly financial projection
- FR2: View and edit every financial input value
- FR3: Reset individual values to brand default
- FR4: FDD Item 7 range alongside brand default and user estimate
- FR5: Add/remove/reorder custom startup cost line items
- FR6: Classify startup cost line items as CapEx/non-CapEx
- FR7: Live-updating summary financial metrics
- FR7a: P&L Statement (60 monthly columns)
- FR7b: Balance Sheet (60 monthly columns)
- FR7c: Cash Flow Statement (60 monthly columns)
- FR7d: Summary Financials page
- FR7e: ROIC analysis
- FR7f: Valuation analysis
- FR7g: Audit/integrity checks (13 checks)
- FR7h: Reports inline editing (input cells editable, computed read-only)
- FR7i: Per-year values (Y1-Y5) for all input assumptions
- FR7j: Complete input assumptions list (EBITDA Multiple, Target Pre-tax Profit, etc.)
- FR7k: Glossary page with financial term definitions
- FR7l: Contextual help for every input field
- FR7m: Composite field decomposition (My Plan) ↔ consolidated (Reports) with bidirectional sync
- FR7n: PDF business plan package generation
- FR8: Accounting identity validation
- FR9: Deterministic outputs
- FR10: Single parameterized model (no per-brand structural changes)
- FR74: Corporation tax with loss carry-forward
- FR75: Tax payment delay (balance sheet + cash flow)
- FR76: Shareholder salary adjustment + adjusted net profit
- FR77: EBITDA-based valuation
- FR78: Full ROIC computation
- FR79: Labor Efficiency Ratios
- FR80: Breakeven burn metrics
- FR81: Payback period analysis
- FR82: Retained earnings tracking
- FR83: Summary Financials dashboard (comprehensive output view)

**Section 2: Guided Planning Experience (9 FRs)**
- FR11: Planning experience collects all inputs
- FR12: Two-surface architecture with three adaptive tiers
- FR13: Switch experience tiers anytime
- FR14: System recommends initial tier
- FR15: Free navigation between completed sections
- FR16: Save progress and resume
- FR17: Auto-save periodically
- FR18: Crash recovery to last auto-save
- FR19: Consultant booking link throughout

**Section 3: Advisory & Guardrails (4 FRs)**
- FR20: Outlier input flagging (25% deviation threshold, configurable)
- FR21: Weak business case guidance (advisory visual language)
- FR22: Consultant booking on flagging
- FR23: All nudges informational, never blocking

**Section 4: Document Generation & Management (4 FRs)**
- FR24: Lender-grade PDF package
- FR25: FTC-compliant disclaimers
- FR26: Document list with timestamps
- FR27: Document download

**Section 5: User Access & Authentication (5 FRs)**
- FR28: Franchisee invitation creation
- FR29: Guided onboarding with tier recommendation
- FR30: Franchisor admin invitations
- FR31: Authentication (Google OAuth + invitation-based)
- FR32: Role-based data isolation

**Section 6: Data Sharing & Privacy (6 FRs)**
- FR33: Clear data sharing description
- FR34: Opt-in financial sharing
- FR35: Revoke opt-in anytime
- FR36: Default pipeline status visibility
- FR37: Financial details only with opt-in
- FR38: API-level enforcement

**Section 7: Brand Configuration & Administration (6 FRs)**
- FR39: Brand creation with parameter set
- FR40: Startup cost template definition
- FR41: Brand configuration validation
- FR42: Account manager assignment
- FR43: Account manager reassignment
- FR44: Brand-level settings

**Section 8: Pipeline Visibility & Operational Intelligence (3 FRs)**
- FR45: Franchisor pipeline dashboard
- FR46: Katalyst cross-brand dashboard
- FR47: Individual franchisee plan details (admin view)
- FR48: Franchisor plan acknowledgment (brand-configurable)

**Section 9: White-Labeling & Brand Identity (1 FR)**
- FR49: Brand identity throughout planning experience

**Section 10: AI Planning Advisor (5 FRs)**
- FR50: AI Planning Advisor as slide-in panel in My Plan
- FR51: AI extracts structured inputs from conversation
- FR52: Verify/correct AI-populated values
- FR53: AI has access to brand parameters and plan state
- FR54: Graceful degradation when AI unavailable

**Section 11: Advisory Board Meeting (4 FRs)**
- FR55: Initiate Advisory Board Meeting
- FR56: Multiple domain-specific advisor personas
- FR57: Accept/reject Advisory Board suggestions
- FR58: Data-driven persona definitions

**Section 12: Admin Impersonation — View As (7 FRs)**
- FR59: Katalyst admin "View As" franchisee
- FR60: Orange impersonation banner
- FR61: View As works with Reports inline editing
- FR62: View As impersonation is read-only by default with audit-logged edit capability
- FR63: Audit trail for impersonation sessions
- FR64: Session-scoped impersonation state
- FR65: RBAC enforced during impersonation

**Section 13: Demo Mode (8 FRs)**
- FR66: Per-brand demo franchisee account
- FR67: Enter Franchisee Demo Mode from brand card
- FR68: Demo banner (distinct from impersonation)
- FR69: Interactive demo mode
- FR70: Fictitious demo brand for Franchisor Demo
- FR71: Enter Franchisor Demo Mode
- FR72: Nested Franchisee Demo within Franchisor Demo
- FR73: Franchisor Demo banner

**Section 14: Financial Display Standards (4 FRs)**
- FR84: Consistent formatting rules (currency, percentage, ratio, integer)
- FR85: Accounting-style parentheses for negatives
- FR86: Monospace font for financial figures
- FR87: Source badges (BD, AI) for attribution

**Section 15: Advisory vs. Error Visual Language (2 FRs)**
- FR88: Distinct visual language (advisory ≠ error, red reserved for errors)
- FR89: ROI Threshold Guardian three visual states

**Section 16: Impact Strip (5 FRs)**
- FR90: Persistent Impact Strip at bottom of My Plan
- FR91: Context-sensitive metrics per active section
- FR92: Delta indicators
- FR93: Guardian status dots
- FR94: Deep links to Reports tabs

**Section 17: Plan Completeness & Document Preview (2 FRs)**
- FR95: Plan completeness indicator (section-by-section)
- FR96: Dashboard Document Preview widget with DRAFT watermark

**Section 18: Bidirectional Surface Sync (1 FR)**
- FR97: Immediate sync between My Plan and Reports

**Total FRs: 111**

### Non-Functional Requirements Extracted

**Performance (5 NFRs)**
- NFR1: Financial recalculation < 2 seconds
- NFR2: Wizard page transitions < 1 second
- NFR3: PDF generation < 30 seconds
- NFR4: Dashboard views < 3 seconds (200 franchisees)
- NFR5: Non-blocking auto-save

**Security (7 NFRs)**
- NFR6: HTTPS/TLS for all data
- NFR7: Bcrypt password hashing
- NFR8: Session token expiry (60 min inactivity, configurable 15-120)
- NFR9: Endpoint-level RBAC (including impersonation scoping)
- NFR10: DB-level data isolation (query-scoped, not post-filtered)
- NFR11: Single-use, time-limited invitation tokens
- NFR12: No financial data/secrets in logs or errors

**Reliability (6 NFRs)**
- NFR13: Auto-save every 2 minutes minimum
- NFR14: Concurrent edit handling (last-write-wins or conflict detection)
- NFR15: Deterministic financial engine (cross-environment)
- NFR16: Daily database backups with PITR
- NFR17: No disruption during brand parameter updates
- NFR18: PDF immutability after creation

**Scalability (3 NFRs)**
- NFR19: 10 brands, 500 active franchisees without architecture changes
- NFR20: Linear financial engine scaling
- NFR21: Multi-brand partitioning from day one

**AI Integration (3 NFRs)**
- NFR22: AI response < 5 seconds with typing indicator
- NFR23: AI value validation before write
- NFR24: Full functionality without AI services

**Usability (4 NFRs)**
- NFR25: Desktop browsers (1024px min), no mobile requirement
- NFR26: Plain language error messages
- NFR27: Consistent financial formatting (FR84-FR87)
- NFR28: 200ms visual feedback for all user actions

**Admin & Audit (2 NFRs)**
- NFR29: Impersonation session max duration (60 min default)
- NFR30: Admin-only impersonation/demo endpoints, 90-day audit retention

**Total NFRs: 30**

### Additional Requirements & Constraints

- **FTC Compliance:** Franchisee is always the author of projections; tool cannot position outputs as franchisor representations
- **Currency Convention:** All financial calculations in cents (integer arithmetic)
- **Pre-tax Calculations:** Engine operates pre-tax; tax is computed as a separate layer
- **Single Parameterized Model:** ~25-30 seed values per brand, no per-brand formula logic
- **Startup Cost Detail Builder:** The one area requiring structural configuration (variable line items per brand)
- **Push-Distribution Model:** Franchisees don't discover the tool; it's provided via franchisor through Katalyst

### PRD Completeness Assessment

**Strengths:**
- Comprehensive FR coverage across all product domains (111 FRs)
- Clear persona-to-tier mapping with journey traceability
- Well-defined cut order and phasing strategy
- Financial engine input specification is exhaustive (86 individual values enumerated)
- Two-surface design principle is now clearly documented (updated 2026-02-22)

**Concerns:**
- FR numbering has gaps (FR7a-FR7n sub-numbering, jump from FR58 to FR59 with gaps at FR60-65, etc.) — functional but could cause traceability confusion
- FR48 appears under Section 8 but its numbering falls between Section 7 and Section 8 boundaries — minor organizational issue
- Some FRs are very dense (FR83 is a single FR covering ~20 distinct output metrics) — could cause coverage validation ambiguity
- No explicit FR for multi-plan management (create/rename/clone/delete plans) despite this being implemented in Epic 7.2 — gap between PRD and implementation

## Step 3: Epic Coverage Validation

### Coverage Matrix

The epics document contains an FR Coverage Map (lines 190-294) claiming 111/111 FRs mapped. Adversarial cross-check results:

| FR Range | Epic Assignment | Status |
|----------|----------------|--------|
| FR1-FR10 | Epic 3 (Financial Engine) | ✓ Covered |
| FR7a-FR7n | Epic 5 (Financial Statements), Epic 6 (Documents) | ✓ Covered |
| FR11-FR19 | Epic 4 (Forms), Epic 1 (Auth/Onboarding) | ✓ Covered |
| FR20-FR23 | Epic 8 (Advisory Guardrails) | ✓ Covered |
| FR24-FR27 | Epic 6 (Document Generation) | ✓ Covered |
| FR28-FR32 | Epic 1 (Auth/Onboarding) | ✓ Covered |
| FR33-FR38 | Epic 11 (Data Sharing/Privacy) | ✓ Covered |
| FR39-FR44 | Epic 2 (Brand Configuration) | ✓ Covered |
| FR45-FR48 | Epic 11 (Pipeline/Dashboards) | ✓ Covered |
| FR49 | Epic 2 (Brand Identity) | ✓ Covered |
| FR50-FR54 | Epic 9 (AI Planning Advisor) | ✓ Covered |
| FR55-FR58 | Epic 12 (Advisory Board — Phase 2 deferred) | ✓ Covered |
| FR59-FR65 | Epic ST (Admin Impersonation) | ✓ Covered (range notation) |
| FR66-FR69 | Epic ST (Franchisee Demo Mode) | ✓ Covered (range notation) |
| FR70-FR73 | Epic ST (Franchisor Demo Mode) | ✓ Covered (range notation) |
| FR74-FR82 | Epic 3 (Engine), Epic 5 (Views) | ✓ Covered |
| FR83-FR97 | Epic 5 (Display Standards, Impact Strip, etc.) | ✓ Covered |

### Missing Requirements

**Gap 1: Multi-Plan CRUD (MEDIUM)**
- **Issue:** No explicit FR for plan lifecycle management (create, rename, clone, delete plans). Epic 7.2 implemented this functionality, and the RBAC table mentions "Create/edit plans" as a franchisee action, but there is no dedicated FR.
- **Impact:** Implementation exists (Epic 7.2 delivered) but lacks PRD traceability. Future agents won't know this capability is required.
- **Recommendation:** Add FR98 covering multi-plan lifecycle: create new plans, rename plans, clone plans (deep copy), delete plans (with last-plan protection). Assign to Epic 7.

**Gap 2: Quick Start / Quick ROI Entry (LOW)**
- **Issue:** The user journeys describe a "Quick ROI entry" (Sam's Journey, Session 1) as a 5-input rapid assessment, but there's no dedicated FR for it. FR11 covers the general planning experience, but the Quick Start as a distinct entry point isn't specified.
- **Impact:** Quick Start is implemented but not formally required. Low risk since it's additive UX, not a core data flow.
- **Recommendation:** Consider adding FR99 if Quick Start is considered a required capability.

### Coverage Statistics

- Total PRD FRs: 111
- FRs covered in epics: 111 (per coverage map)
- Coverage percentage: 100% (for existing FRs)
- Implementation gaps: 2 capabilities implemented without corresponding FRs (plan CRUD, quick start)
