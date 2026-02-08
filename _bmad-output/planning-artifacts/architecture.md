---
stepsCompleted: [1, 2]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/prd-validation-report.md
  - _bmad-output/planning-artifacts/product-brief-workspace-2026-02-08.md
  - attached_assets/katalyst-replit-agent-context-final_1770513125481.md
  - attached_assets/PostNet_-_Business_Plan_1770511701987.xlsx
  - attached_assets/Pasted-Persona-A-First-Time-Franchisee-Sam-The-New-Owner-Snaps_1770523428988.txt
workflowType: 'architecture'
project_name: 'Katalyst Growth Planner'
user_name: 'User'
date: '2026-02-08'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements (49 FRs across 9 categories):**

| Category | FR Count | Architectural Implication |
|----------|----------|--------------------------|
| Financial Planning & Calculation (FR1-FR10) | 10 | Core computation engine — deterministic, parameterized, with accounting identity checks. Must support live-updating < 2s. |
| Guided Planning Experience (FR11-FR19) | 9 | AI-powered consulting conversation (Story Mode), form-based guided experience (Normal Mode), spreadsheet interface (Expert Mode). Multi-session with auto-save, crash recovery, and ever-present booking link. |
| Advisory & Guardrails (FR20-FR23) | 4 | Business rules layer on top of the financial engine — advisory, never blocking. Integrates naturally into AI advisor conversation in Story Mode. |
| Document Generation & Management (FR24-FR27) | 4 | Server-side PDF generation with immutable output storage and FTC-compliant disclaimers. |
| User Access & Authentication (FR28-FR32) | 5 | Invitation-only auth, three-role RBAC, API-level data isolation. |
| Data Sharing & Privacy (FR33-FR38) | 6 | Granular, reversible opt-in sharing — API-level enforcement. |
| Brand Configuration & Administration (FR39-FR44) | 6 | Katalyst admin brand setup, startup cost templates, account manager assignment. |
| Pipeline Visibility & Operational Intelligence (FR45-FR48) | 4 | Franchisor read-only pipeline dashboard, Katalyst cross-brand admin view. |
| Brand Identity & Experience (FR49) | 1 | Brand-specific theming and identity display throughout the experience. |

**Non-Functional Requirements (25 NFRs across 5 categories):**

| Category | Key Constraints |
|----------|----------------|
| Performance | Financial recalc < 2s, wizard page transition < 1s, PDF generation < 30s, dashboard load < 3s for 200 franchisees |
| Security | HTTPS, bcrypt passwords, session expiry, API-level RBAC, single-use invitation tokens, no financial data in logs |
| Reliability & Data Integrity | Auto-save every 2 min, deterministic calculations, concurrent edit handling, immutable generated documents |
| Scalability | 10 brands, 500 franchisees, brand_id partitioning from day one |
| Usability | Desktop-first (1024px min), plain-language errors, consistent financial formatting, 200ms visual feedback |

### Scale & Complexity

- **Primary domain:** Full-stack web application (B2B2C vertical SaaS)
- **Complexity level:** High
- **Estimated architectural components:** ~15+ (financial engine, AI conversation agent, advisory board orchestrator, advisor persona system, wizard/form state management, startup cost builder subsystem, document generator, advisory rules engine, admin configuration system, franchisor dashboard, Katalyst dashboard, data sharing/privacy layer, brand theming, auto-save system, invitation/auth system)
- **User scale:** Modest (500 max active franchisees across 10 brands) — internal tool with known users, not public-facing
- **Data lifecycle:** Long-lived — plans evolve over months; locations have lifecycle states spanning their operational lifetime
- **AI integration:** LLM-powered conversation layer for Story Mode + multi-persona advisory board feature

### Experience Tier Architecture (2026 Vision)

**Critical architectural decision from collaborative analysis:**

The three experience tiers are NOT three versions of a wizard. They are three fundamentally different interaction paradigms, all feeding into the same financial engine through a unified financial input state:

| Tier | Interaction Paradigm | Primary Persona | Description |
|------|---------------------|-----------------|-------------|
| **Story Mode** | AI Planning Advisor conversation | Sam (first-timer) | LLM-powered conversational interface. The AI asks questions in natural language, extracts structured financial inputs, populates the plan, and provides contextual guidance. Split-screen: conversation panel + live financial dashboard. |
| **Normal Mode** | Form-based guided sections | Chris (experienced) | Traditional structured form experience with sections, field-by-field input, labels, and validation. Efficient for users who know their numbers. |
| **Expert Mode** | Spreadsheet-style direct input | Maria (veteran) | Minimal UI, maximum speed. Direct access to every parameter. Also serves as the validation interface for Katalyst to verify engine outputs against known-good spreadsheets. |

**Key architectural insight:** All three modes write to the **same financial input state**. The conversation and the form are two input methods to the same state model. The financial engine reads from this state and produces projections regardless of how the state was populated.

**Input state attribution:** Each field in the financial input state tracks its source — brand default, manual entry, or AI-populated — so that the Advisory Board and the user can distinguish between values they chose vs. values that were auto-filled.

### Advisory Board Meeting Feature

**Inspired by BMAD Party Mode architecture:**

In addition to the primary AI Planning Advisor (one-on-one conversation for data collection), the product includes an "Advisory Board Meeting" feature available from any experience tier:

- **What it is:** A multi-persona discussion that stress-tests the franchisee's plan assumptions. Multiple AI advisor personas (CFO, investment banker, marketing specialist, HR/operations advisor, seasoned franchisee voice) examine the current plan from their domain perspective and provide cross-cutting feedback.
- **How it works:** Modeled on BMAD party mode orchestration — persona manifest with domain expertise and communication styles, topic-based persona selection, cross-talk between advisors, franchisee as the decision-maker who accepts or rejects suggestions.
- **Persona system:** Data-driven, not hardcoded. Persona definitions stored as configuration with domain expertise, relevant financial model areas, communication style, and advisory priorities. Extensible per brand if needed.
- **Architectural relationship:** Advisory Board reads from the same financial input state and engine output as everything else. Advisor suggestions that the franchisee accepts are written back to the financial input state with appropriate attribution.
- **Differentiation from primary chat:** The Planning Advisor is one-on-one, linear, focused on data collection. The Advisory Board is multi-voice, exploratory, focused on assumption stress-testing.

### AI Integration Phasing

The AI layer is designed as an enhancement, not a foundation. The product works without AI; AI makes it transformative:

| Phase | What Ships | AI Dependency |
|-------|-----------|---------------|
| **MVP Core** | Financial engine + Expert Mode (spreadsheet) + Normal Mode (forms) + all infrastructure (auth, RBAC, data isolation, documents, auto-save) | None — product fully functional |
| **MVP Enhanced** | AI Planning Advisor (Story Mode) | LLM required for Story Mode only; Normal/Expert modes unaffected |
| **MVP Complete** | Advisory Board Meeting | LLM required for advisory sessions; core planning unaffected |

**Architectural principle:** If the LLM has a bad day, franchisees can still build complete financial plans using Normal or Expert mode. The AI layer degrades gracefully — it's never a single point of failure.

### Technical Constraints & Dependencies

1. **Financial determinism:** Same inputs must always produce same outputs. Floating-point consistency across server/client if calculations run in both places. Rounding must be consistent across 60 months of projections.
2. **Accounting identity checks:** Balance sheet must balance, P&L-to-cash-flow consistency, depreciation-to-CapEx consistency. These run on every calculation, not just during testing.
3. **CapEx classification data flow:** Startup cost line item classification (CapEx/non-CapEx/working capital) drives different downstream financial calculations — depreciation, P&L impact, balance sheet placement.
4. **Lender-grade document accuracy:** No $1 discrepancies between summary and detail in generated PDFs. Financial formatting must be consistent.
5. **FTC Franchise Rule:** Content positioning constraint — all projections labeled as franchisee-created. The AI Planning Advisor framing naturally reinforces this: the advisor asks questions and helps the franchisee think through their numbers, but the franchisee is always the author.
6. **Invitation-only auth model:** Simplifies auth architecture significantly — no self-registration, no email verification flows, no public endpoints for account creation.
7. **brand_id partitioning:** Every relevant table must include brand_id from day one. This is the foundation for multi-brand support via configuration rather than code changes.
8. **AI accuracy guardrails:** When AI populates financial inputs from conversation, values must be verifiable and correctable by the franchisee. The detail view (expandable sections showing every field) serves as the verification layer.

### Cross-Cutting Concerns Identified

1. **brand_id scoping** — Touches every table, every API endpoint, every query. Must be enforced systematically via middleware/context patterns, not ad hoc per-developer discipline.
2. **Role-based data isolation** — Three different visibility rules (franchisee: own data only, franchisor: pipeline + opt-in financials, Katalyst: everything). Must be enforced at query level, not filtered after retrieval.
3. **Auto-save & state persistence** — Affects the entire planning experience across all modes. Must be non-blocking, reliable, and support crash recovery. Maximum 2-minute data loss window.
4. **Experience tier presentation** — Story (AI conversation) vs. Normal (forms) vs. Expert (spreadsheet) changes the interaction paradigm but not the underlying data or calculations. Different input collection strategies writing to the same state.
5. **Financial accuracy pipeline** — From input to calculation to document generation, financial values must maintain precision and formatting consistency.
6. **Consultant booking link** — Ever-present across all modes, configurable per account manager per franchisee. Cross-cutting UI concern.
7. **FTC compliance language** — Affects tooltips, labels, disclaimers, AI advisor conversation tone across the application. Systematic content concern.
8. **Progressive disclosure** — Each experience tier presents information at different density levels. Story Mode: conversational with rich context. Normal Mode: moderate density forms. Expert Mode: maximum density spreadsheet. Same data, dramatically different information density. This has layout and component architecture implications.
9. **Per-field metadata pattern** — Every financial input field carries: (a) brand default value, (b) Item 7 range reference, (c) current value (franchisee-entered or AI-populated), (d) value attribution source, (e) reset-to-default capability, (f) tier-dependent explanation content. This is a core data structure, not a UI decoration.

### Startup Cost Builder as Subsystem

The startup cost detail builder is identified as a subsystem, not a single component, and serves as the proof point for the parameterization thesis:

- **Variable line items per brand** — each brand has a different default template of startup cost categories
- **Franchisee customization** — add, remove, reorder custom line items beyond brand defaults
- **CapEx/non-CapEx/working capital classification** per line item — drives different downstream financial calculations
- **Item 7 range display** per line item — FDD compliance and educational guardrail
- **Per-item reset** — restore individual line items to brand defaults without resetting the entire template
- **Feeds directly into the financial engine** — startup cost totals, CapEx totals (for depreciation), and working capital feed into different model calculation paths

If this subsystem works cleanly (flexible templates, per-item overrides, classification, reset-to-defaults), the rest of the parameterization model is simpler by comparison.

### Data Model Triple-Duty Challenge

A single "plan" record must support three simultaneous read patterns with three different authorization boundaries:

1. **Franchisee's interactive editing session** — mutable, auto-saved, wizard/conversation-state-tracked, full detail access
2. **Franchisor's pipeline view** — read-only snapshot of status, stage, timeline, market. Financial details only if franchisee opted in.
3. **Katalyst's operational intelligence** — full visibility, cross-brand aggregation, individual plan drill-down for support

This is the central data model design challenge. The authorization boundaries must be enforced at the query level, and the three read patterns may benefit from different query projections rather than one-size-fits-all data access.

### Scale Guidance

With 500 max users across 10 brands:
- **Do:** Clean, well-indexed PostgreSQL schema with smart query scoping
- **Don't:** Event sourcing, CQRS, Redis caching layers, distributed systems patterns
- **Principle:** Don't over-engineer for speculative scale. The temptation to build for 10,000 users will slow down the MVP without delivering value. Build for 500, architect so that scaling to 5,000 is a database optimization task, not a rewrite.
