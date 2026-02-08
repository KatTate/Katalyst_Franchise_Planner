---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-02-08'
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

**Functional Requirements (58 FRs across 11 categories):**

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
| AI Planning Advisor (FR50-FR54) | 5 | LLM-powered conversational interface for Story Mode. Split-screen UX (chat + live dashboard). NL-to-structured-input extraction. Per-field attribution tracking. |
| Advisory Board Meeting (FR55-FR58) | 4 | Multi-persona AI stress-testing of plan assumptions. Persona manifest system, topic-based selection, cross-talk orchestration. Phase 2. |

**Non-Functional Requirements (28 NFRs across 6 categories):**

| Category | Key Constraints |
|----------|----------------|
| Performance | Financial recalc < 2s, page transition < 1s, PDF generation < 30s, dashboard load < 3s for 200 franchisees |
| Security | HTTPS, bcrypt passwords, session expiry, API-level RBAC, single-use invitation tokens, no financial data in logs |
| Reliability & Data Integrity | Auto-save every 2 min, deterministic calculations, concurrent edit handling, immutable generated documents |
| Scalability | 10 brands, 500 franchisees, brand_id partitioning from day one |
| AI Integration | LLM API timeouts < 30s, graceful degradation to form-based mode, AI-populated values validated against field schemas, conversation context < 32K tokens |
| Usability | Desktop-first (1024px min), plain-language errors, consistent financial formatting, 200ms visual feedback |

### Scale & Complexity

- **Primary domain:** Full-stack web application (B2B2C vertical SaaS)
- **Complexity level:** High
- **Estimated architectural components:** ~15+ (financial engine, AI conversation agent, advisory board orchestrator, advisor persona system, planning state management, startup cost builder subsystem, document generator, advisory rules engine, admin configuration system, franchisor dashboard, Katalyst dashboard, data sharing/privacy layer, brand theming, auto-save system, invitation/auth system)
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

1. **Franchisee's interactive editing session** — mutable, auto-saved, conversation/form/spreadsheet-state-tracked, full detail access
2. **Franchisor's pipeline view** — read-only snapshot of status, stage, timeline, market. Financial details only if franchisee opted in.
3. **Katalyst's operational intelligence** — full visibility, cross-brand aggregation, individual plan drill-down for support

This is the central data model design challenge. The authorization boundaries must be enforced at the query level, and the three read patterns may benefit from different query projections rather than one-size-fits-all data access.

### Scale Guidance

With 500 max users across 10 brands:
- **Do:** Clean, well-indexed PostgreSQL schema with smart query scoping
- **Don't:** Event sourcing, CQRS, Redis caching layers, distributed systems patterns
- **Principle:** Don't over-engineer for speculative scale. The temptation to build for 10,000 users will slow down the MVP without delivering value. Build for 500, architect so that scaling to 5,000 is a database optimization task, not a rewrite.

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application (B2B2C vertical SaaS) based on project requirements analysis. The project requires:
- Complex, multi-paradigm frontend (AI conversation + forms + spreadsheet)
- Server-side computation (deterministic financial engine)
- PostgreSQL for relational data with brand_id partitioning
- LLM API integration (server-side proxy to OpenAI/Anthropic)
- PDF generation (server-side)
- Session-based auth with invitation-only model

### Starter: Replit Full-Stack JS Template (Already Active)

**This project is already initialized on the Replit full-stack JS template.** No starter selection decision is needed — the template is in place and the tech stack decision was made in Step 2 based on requirements analysis.

**Rationale for Confirmation:**
1. TypeScript end-to-end provides type safety for financial engine (critical for deterministic calculations)
2. React 18 ecosystem depth supports the three radically different interaction paradigms (conversation, forms, spreadsheet)
3. PostgreSQL with Drizzle ORM supports brand_id partitioning and complex relational queries for RBAC
4. Express 5 provides straightforward API layer for financial engine endpoints and LLM proxy
5. Vite provides fast development iteration on complex UI
6. shadcn/ui component library provides the full suite needed (forms, dialogs, sidebars, tabs, cards, charts via Recharts)

### Architectural Decisions Provided by Starter

**Language & Runtime:**
- TypeScript 5.6 (strict mode available)
- Node.js runtime (server) + browser (client)
- ESM modules throughout (`"type": "module"`)
- tsx for development server execution

**Frontend Framework & Libraries:**
- React 18.3 with Vite 7.3 (HMR, fast builds)
- Tailwind CSS 3.4 for styling
- shadcn/ui component library (full Radix UI primitive set: accordion, dialog, dropdown, form, tabs, toast, tooltip, sidebar, etc.)
- Wouter 3.3 for client-side routing
- TanStack React Query 5.60 for server state management
- React Hook Form 7.55 + @hookform/resolvers for form handling
- Recharts 2.15 for charting/visualization
- Framer Motion 11.13 for animations
- React Resizable Panels 2.1 (critical for split-screen Story Mode layout)
- Lucide React for icons, React Icons for brand logos
- class-variance-authority + clsx + tailwind-merge for style composition

**Backend Framework & Libraries:**
- Express 5.0 (latest major version)
- express-session + connect-pg-simple for session management
- Passport + passport-local for authentication
- ws 8.18 for WebSocket support (useful for real-time auto-save or AI streaming)

**Database & ORM:**
- PostgreSQL (Replit built-in, Neon-backed)
- Drizzle ORM 0.39 for type-safe database operations
- Drizzle Kit 0.31 for migrations (`db:push` command)
- drizzle-zod 0.7 for schema-to-validation integration

**Validation:**
- Zod 3.24 for runtime validation (shared between client/server)
- drizzle-zod for automatic Zod schemas from Drizzle table definitions

**Build & Dev Tooling:**
- Vite dev server with React plugin and HMR
- esbuild for production builds
- TypeScript compiler for type checking (`tsc`)
- Replit Vite plugins (cartographer, dev banner, runtime error modal)

**Code Organization (Existing Structure):**
```
├── client/
│   └── src/
│       ├── components/ui/    # shadcn/ui components (40+ primitives)
│       ├── hooks/            # Custom hooks (use-toast, use-mobile)
│       ├── lib/              # Utilities (queryClient, utils)
│       ├── pages/            # Route components
│       └── App.tsx           # Root with routing
├── server/
│   ├── index.ts              # Server entry point
│   ├── routes.ts             # API routes
│   ├── storage.ts            # Storage interface (IStorage)
│   ├── static.ts             # Static file serving
│   └── vite.ts               # Vite dev server integration
├── shared/
│   └── schema.ts             # Drizzle schema + Zod types
└── package.json
```

### Gaps to Fill (Not Provided by Starter)

These capabilities are required by the PRD but not included in the starter template. They will be addressed in architectural decisions (Step 4) and implementation stories:

| Gap | Need | Candidate Solutions |
|-----|------|-------------------|
| **PDF Generation** | Lender-grade financial documents (FR24-FR27) | pdfkit, @react-pdf/renderer (server-side), or puppeteer (heavier) |
| **Immutable Document Storage** | Generated documents must be stored immutably with version history (FR24-FR27) | PostgreSQL bytea/JSONB, Replit Object Storage, or filesystem with hash-based naming |
| **LLM SDK** | AI Planning Advisor conversation (FR50-FR54) | OpenAI SDK, Anthropic SDK, or Vercel AI SDK (provider-agnostic) |
| **Email/Invitations** | Invitation-only auth flow (FR28) | Resend, SendGrid, or Nodemailer |
| **Financial Number Formatting** | Consistent currency/percentage display (NFR usability) | Intl.NumberFormat (built-in), or dinero.js for money math |
| **Decimal Precision** | Deterministic financial calculations without floating-point drift | decimal.js or big.js for arbitrary-precision arithmetic |
| **Streaming Response Handling** | AI conversation streaming UX (FR51) | Server-Sent Events (built-in) or WebSocket (ws already included) |

### What the Starter Does NOT Decide (Left for Step 4)

The starter provides infrastructure but leaves these architectural decisions open:

1. **State management pattern** — How the unified financial input state is structured and shared across three experience tiers
2. **Financial engine architecture** — Pure function module design, calculation graph, accounting identity checks
3. **AI integration pattern** — How conversation maps to structured financial inputs, streaming approach, error handling
4. **RBAC enforcement pattern** — Middleware vs. query-level vs. both for three-tier authorization
5. **Auto-save strategy** — Debounce timing, conflict detection, state diff approach
6. **Data model design** — Tables, relationships, brand_id partitioning, per-field metadata storage
7. **Component architecture** — How Story/Normal/Expert modes share components vs. diverge
8. **API design** — RESTful resource design, endpoint structure, request/response schemas
9. **Document generation pipeline** — Template system, data flow from engine to PDF
10. **Immutable document storage & retention** — Where generated documents live, versioning strategy, audit trail, file retention policy
11. **Brand parameter configuration** — Storage format, admin UI, validation rules

**Note:** The Replit template's existing `server/vite.ts` and `vite.config.ts` are pre-configured and MUST NOT be modified. The template handles frontend/backend co-serving on a single port automatically.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
1. Data model design — Tables, relationships, brand_id partitioning, per-field metadata
2. Financial engine architecture — Pure function module, calculation graph, precision handling
3. RBAC enforcement pattern — API-level data isolation for three stakeholder types
4. State management for unified financial input — How three tiers write to one state
5. Authentication model — Invitation-only, session-based, role assignment

**Important Decisions (Shape Architecture):**
6. API design — RESTful endpoints, error handling, validation patterns
7. Auto-save strategy — Debounce, conflict detection, state persistence
8. Component architecture — Shared vs. divergent components across experience tiers
9. Document generation pipeline — PDF creation, template system, immutable storage
10. AI integration pattern — LLM proxy, conversation-to-input mapping, streaming

**Deferred Decisions (Post-MVP / Phase 2 per PRD):**
- Advisory Board Meeting orchestration (Phase 2 — FR55-FR58)
- 3-scenario modeling (Good/Better/Best) — one excellent plan with ROI Threshold Guardian is sufficient for MVP
- Estimated vs. actual tracking — requires post-opening data; MVP franchisees haven't opened yet
- Multi-location cascade modeling
- Sensitivity analysis (deep) — ROI Threshold Guardian covers MVP need
- Franchisor acknowledgment feature (optional, brand-configurable)
- Advanced analytics/reporting beyond pipeline visibility

---

### Data Architecture

#### Decision 1: Data Model Design

**Database:** PostgreSQL (Replit built-in, Neon-backed) — already decided by starter.

**ORM:** Drizzle ORM with drizzle-zod for type-safe schema-to-validation — already decided by starter.

**Migration Strategy:** Drizzle Kit `db:push` for development, managed migrations for production.

**Core Entity Model:**

```
brands
  ├── brand_parameters (JSONB — financial defaults, ranges, labels)
  ├── startup_cost_templates[] (variable line items per brand)
  └── brand_theme (colors, logo URL, display name)

users
  ├── role: 'franchisee' | 'franchisor' | 'katalyst_admin'
  ├── brand_id (FK → brands)
  ├── account_manager_id (FK → users, nullable)
  └── invitation_token (single-use, expires)

plans (central entity — the "plan" a franchisee builds)
  ├── user_id (FK → users, the franchisee)
  ├── brand_id (FK → brands, denormalized for query efficiency)
  ├── status: 'draft' | 'in_progress' | 'completed'
  ├── experience_tier: 'story' | 'normal' | 'expert'
  ├── financial_inputs (JSONB — the unified financial input state)
  ├── financial_outputs (JSONB — cached engine results)
  ├── last_auto_save: timestamp
  ├── quick_roi_result (JSONB — nullable, from Quick ROI)
  │
  │  Pipeline-visible fields (always visible to franchisor, no opt-in needed):
  ├── pipeline_stage: 'planning' | 'site_evaluation' | 'financing' | 'construction' | 'open'
  ├── target_market: text (city/region)
  ├── target_open_quarter: text (e.g., 'Q3 2026')
  └── plan_name: text

data_sharing_consents[] (consent history — append-only audit trail)
  ├── plan_id (FK → plans)
  ├── user_id (FK → users)
  ├── action: 'granted' | 'revoked'
  ├── granted_at: timestamp
  └── ip_address: text (optional, for audit)

plan_startup_costs[] (per-plan line items, branched from brand template)
  ├── plan_id (FK → plans)
  ├── category, label, amount, is_custom
  ├── capex_classification: 'capex' | 'non_capex' | 'working_capital'
  ├── brand_default_amount (nullable — null for custom items)
  ├── item7_range_low, item7_range_high (nullable)
  └── sort_order

generated_documents[]
  ├── plan_id (FK → plans)
  ├── document_type: 'pro_forma' | 'cash_flow' | 'break_even' | 'lender_package'
  ├── version: integer (auto-incrementing per plan+type)
  ├── inputs_snapshot (JSONB — frozen copy of financial_inputs at generation time)
  ├── file_path or blob_reference
  ├── generated_at: timestamp
  └── is_immutable: true (enforced — no updates, only new versions)

ai_conversations[] (Story Mode chat history)
  ├── plan_id (FK → plans)
  ├── messages (JSONB array — role, content, timestamp, extracted_values)
  └── total_tokens_used: integer
```

**Per-Field Metadata Pattern (within financial_inputs JSONB):**

```typescript
interface FinancialFieldValue {
  value: number;
  source: 'brand_default' | 'manual' | 'ai_populated';
  brand_default: number;
  item7_range?: { low: number; high: number };
  last_modified: string; // ISO timestamp
}

// Example financial_inputs structure:
interface FinancialInputs {
  revenue: {
    monthly_auv: FinancialFieldValue;
    year1_growth_rate: FinancialFieldValue;
    year2_growth_rate: FinancialFieldValue;
    starting_month_auv_pct: FinancialFieldValue;
  };
  expenses: {
    cogs_pct: FinancialFieldValue;
    labor_pct: FinancialFieldValue;
    rent_monthly: FinancialFieldValue;
    // ... more expense categories
  };
  financing: {
    loan_amount: FinancialFieldValue;
    interest_rate: FinancialFieldValue;
    loan_term_months: FinancialFieldValue;
    down_payment: FinancialFieldValue;
  };
  // ... additional sections
}
```

**Rationale for JSONB for financial_inputs:**
- The financial model is parameterized per brand — different brands have different field sets
- JSONB allows flexible schema while maintaining queryability
- Per-field metadata (source, brand_default, range) is naturally nested
- The financial engine treats this as a typed interface regardless of storage format
- Alternative (normalized tables with one row per field) creates excessive joins for a model that's always read/written as a unit

**brand_id Partitioning:**
Every table that contains brand-specific data includes `brand_id` as a column. All queries include `brand_id` in WHERE clauses. This is enforced by middleware, not developer discipline.

#### Decision 2: Financial Number Precision

**Decision:** Use JavaScript native numbers with controlled rounding strategy.

**Rationale:**
- Financial calculations in this context are projections and estimates, not transactional accounting
- The PostNet business plan spreadsheet uses standard Excel floating-point (same as JS)
- Determinism requirement is about same-inputs-same-outputs, not arbitrary precision
- Adding decimal.js adds complexity and performance cost for projections that are inherently approximate

**Rounding Strategy:**
- All currency values rounded to nearest cent (2 decimal places) at display and storage
- All percentage values stored as decimals (0.13 for 13%), displayed with 1 decimal place
- Intermediate calculations use full floating-point precision
- Final step applies `Math.round(value * 100) / 100` before storage/display
- Monthly projection arrays (60 months) maintain precision through the array, round only at output

**Accounting Identity Checks:**
- Balance sheet: assets === liabilities + equity (within $0.01 tolerance)
- P&L-to-cash-flow consistency check
- Depreciation total matches CapEx classification total
- These run on every engine invocation as assertions

---

### Authentication & Security

#### Decision 3: Authentication Model

**Decision:** Invitation-only, session-based authentication using Passport.js (already in starter) with custom invitation flow.

**Architecture:**
- No self-registration. Users are created by Katalyst admins or franchisor users with appropriate permissions.
- Invitation tokens are single-use, time-limited (configurable, default 7 days).
- Invitation email contains a link with the token. First visit sets password.
- Sessions stored in PostgreSQL via connect-pg-simple (already in starter).
- Session expiry: configurable per role (longer for franchisees, shorter for admins).

**Password Security:** bcrypt with cost factor 12.

#### Decision 4: Authorization (RBAC) Pattern

**Decision:** Middleware-enforced role-based access control with query-level data scoping.

**Three Authorization Layers:**

```
Layer 1: Route-level middleware (role check)
  → requireRole('franchisee', 'katalyst_admin')
  → Applied to every route definition

Layer 2: Query-level scoping (data isolation)
  → scopeToUser(req.user) automatically adds WHERE clauses
  → Franchisee: WHERE user_id = req.user.id
  → Franchisor: WHERE brand_id = req.user.brand_id (all plans visible at pipeline level)
  → Katalyst: WHERE brand_id IN (assigned_brands) — full access

Layer 3: Response-level projection (field filtering)
  → Franchisor WITHOUT opt-in sees pipeline fields only:
      { plan_name, pipeline_stage, target_market, target_open_quarter, status }
  → Franchisor WITH opt-in sees pipeline + financial details:
      { ...pipelineFields, financial_inputs, financial_outputs, startup_costs, documents }
  → Katalyst sees: everything (all fields, all plans)
  → Consent check: query data_sharing_consents for most recent action per plan
```

**Enforcement Principle:** Data isolation is enforced at the storage layer (IStorage methods receive user context), not at the route handler level. Route handlers never construct raw queries.

---

### API & Communication Patterns

#### Decision 5: API Design

**Decision:** RESTful API with resource-oriented endpoints. No GraphQL (unnecessary complexity for known, stable read patterns at this scale).

**Endpoint Structure:**

```
Auth:
  POST   /api/auth/login
  POST   /api/auth/logout
  GET    /api/auth/me
  POST   /api/invitations              (Katalyst/Franchisor creates invitation)
  POST   /api/invitations/:token/accept (Franchisee accepts, sets password)

Plans:
  GET    /api/plans                     (user's plans, scoped by role)
  POST   /api/plans                     (create new plan)
  GET    /api/plans/:id                 (get plan with financial inputs)
  PATCH  /api/plans/:id                 (update financial inputs — auto-save target)
  GET    /api/plans/:id/outputs         (get calculated financial outputs)

Startup Costs:
  GET    /api/plans/:id/startup-costs   (get plan's startup cost line items)
  PUT    /api/plans/:id/startup-costs   (bulk update/replace startup costs)
  POST   /api/plans/:id/startup-costs/reset (reset to brand defaults)

Documents:
  POST   /api/plans/:id/documents       (generate a document — creates immutable version)
  GET    /api/plans/:id/documents       (list generated documents with version history)
  GET    /api/plans/:id/documents/:docId (download specific document — no update/delete endpoints)

Data Sharing Consent:
  GET    /api/plans/:id/consent          (get current consent status + description of what's shared)
  POST   /api/plans/:id/consent/grant    (grant data sharing — appends to consent history)
  POST   /api/plans/:id/consent/revoke   (revoke data sharing — appends to consent history)

Quick ROI:
  POST   /api/quick-roi                 (lightweight calculation, no auth required for initial capture)

AI (Story Mode):
  POST   /api/plans/:id/conversation    (send message, receive AI response + extracted values)
  GET    /api/plans/:id/conversation    (get conversation history)

Brand Admin:
  GET    /api/brands/:brandId/parameters
  PUT    /api/brands/:brandId/parameters
  GET    /api/brands/:brandId/startup-cost-template
  PUT    /api/brands/:brandId/startup-cost-template

Pipeline (Franchisor/Katalyst):
  GET    /api/pipeline                  (franchisee pipeline, scoped by role)
  GET    /api/pipeline/summary          (aggregated statistics)

Booking:
  GET    /api/booking-url               (get current user's consultant booking URL)
```

**Error Handling Standard:**
```typescript
interface ApiError {
  error: string;           // machine-readable error code
  message: string;         // human-readable message
  details?: unknown;       // validation errors, field-level issues
  statusCode: number;
}
```

All errors return consistent structure. Validation errors (from Zod) return field-level details. Financial engine errors are never exposed raw — they're wrapped with user-friendly messages.

**Request Validation:** Every POST/PUT/PATCH validates request body using Zod schemas derived from drizzle-zod insert schemas (with `.extend()` for additional rules).

#### Decision 6: Auto-Save Strategy

**Decision:** Client-side debounced saves with server-side timestamp tracking.

**Architecture:**
- Client debounces financial input changes (2-second debounce after last keystroke)
- PATCH `/api/plans/:id` with only changed fields (partial update)
- Server records `last_auto_save` timestamp
- On page load, client fetches latest saved state
- No conflict detection for MVP (single user per plan assumption, last-write-wins)
- Visual indicator: "Saved" / "Saving..." / "Unsaved changes" in UI header

**Crash Recovery:**
- Auto-save ensures maximum 2 minutes of data loss (NFR13)
- Browser beforeunload handler warns if unsaved changes exist
- On reconnection after crash, latest server state is loaded

#### Decision 7: Real-Time Communication

**Decision:** Server-Sent Events (SSE) for AI conversation streaming. No WebSocket for MVP.

**Rationale:**
- AI conversation streaming is the only real-time requirement in MVP
- SSE is simpler than WebSocket for server-to-client streaming
- SSE works through proxies/load balancers without special configuration
- ws package in starter is available if WebSocket is needed later (Advisory Board Meeting Phase 2)

**Implementation:**
- `POST /api/plans/:id/conversation` returns SSE stream
- Client receives streamed AI response tokens
- Final SSE event includes extracted financial values to update the detail panel
- Connection closes after response is complete (not persistent)

---

### Frontend Architecture

#### Decision 8: State Management

**Decision:** TanStack React Query for server state + React Context for local UI state. No Redux/Zustand.

**Server State (React Query):**
- Plan data, financial inputs, financial outputs, documents, conversation history
- Query keys: `['/api/plans', planId]`, `['/api/plans', planId, 'outputs']`, etc.
- Optimistic updates for auto-save (update cache immediately, reconcile on server response)
- Cache invalidation after mutations

**Local UI State (React Context):**
- Current experience tier (story/normal/expert)
- Active section/tab in the planning experience
- UI-only state (sidebar open/closed, modal state, form validation state)
- Theme preference (light/dark)

**Financial Input State Flow:**
```
[Story Mode Chat] ──→ extractValuesFromAI() ──→ updateFinancialInput()
[Normal Mode Form] ──→ onFieldChange()       ──→ updateFinancialInput()
[Expert Mode Grid] ──→ onCellEdit()          ──→ updateFinancialInput()
                                                       │
                                                       ▼
                                              React Query Cache
                                              (optimistic update)
                                                       │
                                                       ▼
                                              PATCH /api/plans/:id
                                              (debounced auto-save)
                                                       │
                                                       ▼
                                              Financial Engine
                                              (server-side recalc)
                                                       │
                                                       ▼
                                              Updated Outputs
                                              (cache invalidation)
```

#### Decision 9: Component Architecture

**Decision:** Shared detail panel + tier-specific input collection components.

**Layout Architecture:**

```
<PlanningLayout>                          (shared wrapper)
  ├── <PlanningHeader>                    (shared — plan name, tier toggle, save status, booking link)
  ├── <SplitView>                         (shared — resizable panels via react-resizable-panels)
  │     ├── <InputPanel>                  (LEFT — tier-specific)
  │     │     ├── <StoryModeChat />       (AI conversation interface)
  │     │     ├── <NormalModeForm />      (section-by-section form)
  │     │     └── <ExpertModeGrid />      (spreadsheet-style inputs)
  │     └── <DetailPanel>                 (RIGHT — shared across all tiers)
  │           ├── <FinancialDashboard />  (live charts, KPIs, summary)
  │           ├── <StartupCostBuilder />  (expandable cost detail)
  │           └── <SectionDetail />       (per-field values with metadata)
  └── <PlanningFooter>                    (shared — navigation, document generation)
```

**Key Principle:** The Detail Panel (right side) is identical regardless of tier. It shows the current state of all financial inputs with their metadata (source attribution, brand defaults, Item 7 ranges). This is the "truth" view — what the engine sees.

**Tier Switching:** Users can switch tiers mid-session. No data is lost because all tiers write to the same financial input state. Switching tiers changes only the left panel.

#### Decision 10: Routing Strategy

**Decision:** Wouter with flat route structure.

```
/                                    → Landing / Login
/onboarding                          → New user onboarding (tier detection)
/plans                               → Plan list (franchisee sees own, franchisor sees pipeline)
/plans/:id                           → Planning experience (tier-specific)
/plans/:id/documents                 → Generated documents for a plan
/quick-roi                           → Quick ROI calculator (minimal auth)
/admin/brands                        → Brand management (Katalyst only)
/admin/brands/:brandId               → Brand parameter editor
/admin/users                         → User/invitation management
/pipeline                            → Pipeline dashboard (franchisor/Katalyst)
```

---

### Infrastructure & Deployment

#### Decision 11: Hosting & Deployment

**Decision:** Replit Deployments (built-in). Single-server deployment.

**Rationale:**
- 500 max users, no need for horizontal scaling
- Replit handles TLS, health checks, domain management
- Single-server simplifies session management (no sticky sessions needed)
- PostgreSQL is managed by Replit (Neon-backed)

#### Decision 12: Environment Configuration

**Decision:** Environment variables via Replit Secrets for sensitive values, .env for non-sensitive development config.

**Required Secrets:**
- `SESSION_SECRET` (already exists)
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` (for AI Planning Advisor)
- Email service API key (for invitations)

**Environment Variables:**
- `NODE_ENV` (development/production)
- `DATABASE_URL` (auto-provided by Replit)
- `LLM_MODEL` (configurable model selection)
- `LLM_MAX_TOKENS` (conversation context limit)

#### Decision 13: Document Storage

**Decision:** PostgreSQL for document metadata + Replit Object Storage for PDF binary files.

**Architecture:**
- `generated_documents` table stores metadata: plan_id, document_type, version, inputs_snapshot, generated_at
- Actual PDF binary stored in Replit Object Storage (or filesystem with hash-based naming as fallback)
- Documents are immutable — new generation creates a new version, never overwrites
- **Immutability enforcement:** IStorage interface exposes `createDocument()` and `getDocument()`/`listDocuments()` only — no `updateDocument()` or `deleteDocument()` methods exist. This makes accidental mutation structurally impossible at the application layer.
- `inputs_snapshot` JSONB captures the exact financial inputs used to generate the document, enabling reproducibility audit
- API exposes only POST (create) and GET (read) for documents — no PUT/PATCH/DELETE endpoints

---

### AI Integration Architecture

#### Decision 14: LLM Integration Pattern

**Decision:** Server-side LLM proxy with structured extraction.

**Architecture:**

```
Client (Story Mode Chat)
  │
  POST /api/plans/:id/conversation
  { message: "My rent is $4,200/month" }
  │
  ▼
Server (AI Conversation Handler)
  │
  ├── Load conversation history from ai_conversations table
  ├── Load current financial_inputs + brand_parameters
  ├── Construct system prompt with:
  │     • Brand context (PostNet defaults, Item 7 ranges)
  │     • Current plan state (what's filled, what's missing)
  │     • FTC compliance framing instructions
  │     • Per-field schema (valid ranges, types)
  │
  ├── Call LLM API (streaming)
  │     • Model: configurable (default: GPT-4o or Claude 3.5 Sonnet)
  │     • Temperature: 0.3 (low creativity, high consistency)
  │     • Structured output: conversation response + extracted values
  │
  ├── Validate extracted values against field schemas
  │     • Type checking (number, percentage, currency)
  │     • Range checking (within Item 7 ranges if applicable)
  │     • Flag but don't reject out-of-range values
  │
  ├── Stream response tokens to client via SSE
  │
  ├── On completion:
  │     • Save conversation turn to ai_conversations
  │     • Apply extracted values to financial_inputs with source='ai_populated'
  │     • Trigger financial engine recalculation
  │     • Return updated outputs to client
  │
  ▼
Client receives:
  • Streamed AI text (for chat UI)
  • Extracted values (for detail panel update)
  • Updated financial outputs (for dashboard refresh)
```

**Graceful Degradation:**
- If LLM API is unavailable, Story Mode shows: "AI advisor is temporarily unavailable. Switch to Normal Mode to continue building your plan."
- Normal and Expert modes are completely unaffected by LLM availability
- Conversation history is preserved even if AI goes down temporarily

**Token Management:**
- Conversation context limited to most recent N messages (configurable, default ~20)
- System prompt includes current plan state summary, not full history
- Token usage tracked per plan in `ai_conversations.total_tokens_used`

---

### Financial Engine Architecture

#### Decision 15: Engine Design

**Decision:** Pure TypeScript function module in `shared/` directory. No side effects, no I/O, no database calls.

**Architecture:**

```typescript
// shared/financial-engine.ts

interface EngineInput {
  financialInputs: FinancialInputs;       // The unified input state
  startupCosts: StartupCostItem[];         // Startup cost line items
  brandParameters: BrandParameters;        // Brand defaults and ranges
}

interface EngineOutput {
  monthlyProjections: MonthlyProjection[]; // 60 months
  annualSummary: AnnualSummary[];          // 5 years
  roiMetrics: ROIMetrics;                  // Break-even, IRR, ROI %
  cashFlow: CashFlowProjection;
  balanceSheet: BalanceSheetSnapshot[];
  identityChecks: IdentityCheckResult[];   // Pass/fail for each check
}

function calculateProjections(input: EngineInput): EngineOutput {
  // Pure computation — deterministic, no side effects
  // Runs accounting identity checks as assertions
  // Returns complete output snapshot
}
```

**Key Properties:**
- **Pure function:** Same inputs always produce same outputs
- **No I/O:** Engine never touches database, filesystem, or network
- **Shared code:** Runs on both server (for document generation) and client (for live preview if needed)
- **Identity checks built-in:** Every invocation validates accounting identities
- **Typed interfaces:** Input and output are fully typed TypeScript interfaces

**Calculation Graph (execution order):**
1. Total startup investment (from startup cost line items)
2. CapEx/depreciation schedule (from CapEx-classified items)
3. Financing calculations (loan payment, interest, principal)
4. Monthly revenue projections (AUV × growth × ramp)
5. Monthly operating expenses (% of revenue × fixed costs)
6. Monthly P&L (revenue - expenses - depreciation - interest)
7. Monthly cash flow (P&L + depreciation - principal payments)
8. Balance sheet snapshots (assets, liabilities, equity)
9. ROI metrics (break-even month, IRR, annual ROI %)
10. Accounting identity checks (assertions)

---

### Decision Impact Analysis

**Implementation Sequence (dependency-ordered):**

1. **Database schema** → Foundation for everything
2. **Auth + RBAC middleware** → Required before any data endpoints
3. **Financial engine** → Core computation, no dependencies on UI
4. **Storage interface (IStorage)** → CRUD operations with role scoping
5. **API routes** → Thin layer over storage + engine
6. **Normal Mode UI** → Form-based input + detail panel + dashboard
7. **Expert Mode UI** → Spreadsheet-style input (reuses detail panel)
8. **Document generation** → PDF pipeline + immutable storage
9. **Story Mode UI + AI integration** → Chat interface + LLM proxy
10. **Brand admin UI** → Parameter management
11. **Pipeline dashboard** → Franchisor/Katalyst views
12. **Quick ROI** → Lightweight standalone calculator

**Cross-Component Dependencies:**

```
Financial Engine ←── (consumed by) ──→ All three experience tiers
                ←── (consumed by) ──→ Document generation
                ←── (consumed by) ──→ Quick ROI
                ←── (consumed by) ──→ AI conversation (for context)

Unified Financial Input State ←── (written by) ──→ Story Mode AI extraction
                              ←── (written by) ──→ Normal Mode forms
                              ←── (written by) ──→ Expert Mode grid
                              ←── (read by)    ──→ Financial Engine
                              ←── (read by)    ──→ Detail Panel

RBAC Middleware ←── (gates) ──→ Every API endpoint
               ←── (scopes) ──→ Every storage query

Brand Parameters ←── (seeds) ──→ New plan defaults
                 ←── (seeds) ──→ Startup cost templates
                 ←── (context for) ──→ AI system prompt
                 ←── (context for) ──→ Item 7 range display
```

---

## Implementation Patterns & Consistency Rules

_Reviewed via Party Mode with Dev (Amelia), QA (Quinn), UX (Sally), and PM (John). All team recommendations incorporated._

### Pattern Categories Defined

**25 critical conflict points** identified across 5 categories where AI agents could make different choices. Patterns below ensure consistent, compatible code.

---

### Naming Patterns

**Database Naming (Drizzle schema in `shared/schema.ts`):**
- Tables: lowercase plural — `users`, `plans`, `brands`, `data_sharing_consents`
- Columns: snake_case — `user_id`, `brand_id`, `pipeline_stage`
- Foreign keys: `{referenced_table_singular}_id` — `user_id`, `brand_id`, `plan_id`
- JSONB columns: snake_case at column level (`financial_inputs`), **camelCase inside JSON content** (consumed by TypeScript)
- Indexes: `idx_{table}_{column}` — `idx_plans_user_id`, `idx_plans_brand_id`

**JSONB Query Example (critical — agents must follow this):**
```typescript
// CORRECT: camelCase keys inside JSONB path expressions
db.query.plans.findMany({
  where: sql`financial_inputs->'monthlyRent'->>'currentValue' > '5000'`
})

// WRONG: snake_case inside JSONB
db.query.plans.findMany({
  where: sql`financial_inputs->'monthly_rent'->>'current_value' > '5000'`
})
```

**API Naming:**
- Endpoints: lowercase plural nouns, kebab-case — `/api/plans`, `/api/startup-costs`, `/api/quick-roi`
- Route params: `:paramName` format (Express convention) — `/api/plans/:planId/startup-costs`
- Nested resources: parent ID named explicitly — `:planId`, `:docId`, `:brandId`
- Query params: camelCase — `?brandId=`, `?pipelineStage=`
- Headers: standard HTTP headers only — no custom `X-` headers in MVP

**Code Naming:**
- Components: PascalCase — `PlanDashboard`, `StartupCostEditor`, `DetailPanel`
- Files: kebab-case — `plan-dashboard.tsx`, `startup-cost-editor.tsx`, `not-found.tsx` (matches template convention)
- Functions/variables: camelCase — `calculateProjections`, `financialInputs`, `handleSave`
- Types/interfaces: PascalCase — `EngineInput`, `FinancialInputs`, `InsertPlan`
- Constants: SCREAMING_SNAKE_CASE only for true constants — `MAX_PROJECTION_MONTHS = 60`, `AUTO_SAVE_DEBOUNCE_MS = 2000`
- Hooks: `use` prefix + camelCase — `useFinancialEngine`, `usePlanAutoSave`, `useCurrentUser`

---

### Number Format Rules

**Critical distinction — currency vs. rates (Party Mode: Amelia's recommendation):**

| Type | Storage Format | Example | Display Format |
|------|---------------|---------|----------------|
| Currency amounts | Cents as integers | `15000` = $150.00 | `$150.00` |
| Percentages/rates | Decimal form | `0.065` = 6.5% | `6.5%` |
| Counts/quantities | Plain integers | `60` = 60 months | `60` |
| Ratios/multipliers | Decimal form | `1.03` = 3% growth | `3%` or `1.03x` |

**Rule:** Currency formatting happens exclusively in the UI layer. The financial engine, API, and storage all use raw numeric values (cents for currency, decimals for rates). Never format numbers for display in server code or the engine.

---

### Structure Patterns

**Project Organization:**

```
shared/
  schema.ts                ← All Drizzle tables + Zod insert schemas + types
  financial-engine.ts      ← Pure computation module + its own interfaces (EngineInput, EngineOutput)

server/
  routes.ts                ← All API route registration (thin handlers)
  storage.ts               ← IStorage interface + DatabaseStorage implementation
  middleware/
    auth.ts                ← Session auth + requireRole() middleware
    rbac.ts                ← Query scoping (scopeToUser) + response projection (projectForRole)
  services/
    ai-service.ts          ← LLM proxy + conversation management + NL extraction
    document-service.ts    ← PDF generation + immutable storage
    financial-service.ts   ← Orchestrates engine invocation + saves results to storage

client/src/
  pages/                   ← One file per route (kebab-case filenames)
  components/
    ui/                    ← Shadcn primitives (NEVER modify these)
    shared/                ← Cross-tier components (detail panel, financial dashboard, ROI card)
    planning/              ← Plan-specific components (story mode chat, normal mode forms, expert grid)
    admin/                 ← Brand admin components
    pipeline/              ← Franchisor/Katalyst dashboard components
  hooks/                   ← Custom hooks (useFinancialEngine, usePlanAutoSave, useCurrentUser)
  lib/                     ← Utilities (currency formatting, date formatting, validation helpers)
```

**Rules:**
- No `shared/types.ts` — engine interfaces live in `shared/financial-engine.ts` (co-located, Party Mode: Amelia)
- One Drizzle schema file (`shared/schema.ts`) — never split across files
- `components/shared/` for components used across multiple experience tiers (Party Mode: Sally)
- Server services are the only place business logic lives — routes stay thin
- `components/ui/` is Shadcn-managed — never manually edit files in this directory

---

### Schema Patterns

**Insert and Update schemas (Party Mode: Quinn's recommendation):**

```typescript
// shared/schema.ts — pattern for every entity

// 1. Table definition
export const plans = pgTable("plans", { ... });

// 2. Insert schema (for POST — omits auto-generated fields)
export const insertPlanSchema = createInsertSchema(plans).omit({ id: true, lastAutoSave: true });
export type InsertPlan = z.infer<typeof insertPlanSchema>;

// 3. Select type (for GET responses)
export type Plan = typeof plans.$inferSelect;

// 4. Update schema (for PATCH — all fields optional)
export const updatePlanSchema = insertPlanSchema.partial();
export type UpdatePlan = z.infer<typeof updatePlanSchema>;
```

**Rule:** Every entity with a PATCH endpoint must have an explicit `.partial()` update schema. Auto-save uses the update schema, not the insert schema.

---

### Format Patterns

**API Response Format (consistent wrapper for every endpoint):**

```typescript
// Success — single entity
{ data: T }

// Success — list
{ data: T[], total: number }

// Error — general
{ error: { message: string, code: string } }

// Error — validation
{ error: { message: string, code: "VALIDATION_ERROR", details: Record<string, string> } }
```

**HTTP Status Codes:**
- `200` — success (GET, PATCH, PUT)
- `201` — created (POST)
- `400` — validation error (bad request body)
- `401` — unauthenticated (no session)
- `403` — forbidden (wrong role for this resource)
- `404` — not found
- `500` — internal server error

**Date/Time:** ISO 8601 strings in all JSON responses — `"2026-02-08T14:30:00Z"`. Never Unix timestamps.

**JSONB Per-Field Metadata (the core data pattern):**

```typescript
interface FieldMetadata {
  currentValue: number;
  source: 'brand_default' | 'manual' | 'ai_populated';
  brandDefault: number | null;
  item7Range: { min: number; max: number } | null;
}
```

Every financial input field in the `financial_inputs` JSONB column follows this structure. The `source` field enables attribution display and reset-to-default functionality.

---

### data-testid Naming Convention

**Interactive elements:** `{action}-{target}` — `button-save-plan`, `input-monthly-rent`, `link-dashboard`

**Display elements:** `{type}-{content}` — `text-plan-name`, `status-auto-save`, `badge-pipeline-stage`

**Dynamic/repeated elements:** `{type}-{description}-{id}` — `card-plan-${planId}`, `row-cost-${index}`

**Financial data values (Party Mode: Quinn's recommendation):**
`value-{metric}-{period}` — `value-revenue-month-3`, `value-roi-annual-2`, `value-break-even-month`

This convention enables Playwright to verify specific financial projections by metric and period.

---

### Communication Patterns

**State Management:**
- TanStack Query is the **only** state manager for server data — no Redux, no Zustand, no Context for fetched data
- Query keys are hierarchical arrays: `['plans', planId]`, `['plans', planId, 'startup-costs']`
- Mutations always invalidate parent query keys after success
- Optimistic updates only for auto-save — all other mutations wait for server confirmation
- Local UI state (modal open/closed, selected tab) uses React `useState` — this is fine, it's not server data

**Auto-Save Pattern (refined with Party Mode feedback from Quinn and Sally):**
- Debounced at 2-second idle after last keystroke — not interval-based
- Uses `PATCH /api/plans/:planId` with partial financial inputs (update schema)
- **Save indicator in plan header** (not app header) — shows "Saved" / "Saving..." / "Unsaved changes" (Party Mode: Sally)
- Conflict detection: server returns `lastAutoSave` timestamp, client compares before write
- **In-flight save handling** (Party Mode: Quinn):
  - Navigation blocked with "Unsaved changes" prompt if save is in-flight
  - Experience tier switch completes current save before switching
  - If save fails, show inline retry — never silently drop changes

---

### Process Patterns

**Error Handling:**

Server:
- Try/catch at route handler level
- Services throw typed errors: `ValidationError`, `NotFoundError`, `ForbiddenError`
- Global Express error handler maps error types to HTTP status codes
- Never expose stack traces or internal details to client

Client:
- TanStack Query `onError` callbacks + toast notifications via `useToast()`
- Never silent failures — every failed request produces user-visible feedback

Financial Engine:
- Returns `identityChecks[]` with pass/fail — **never throws**
- Caller decides how to handle failed identity checks (display warning, block document generation, etc.)

**Error Message Pattern — 3-part actionable format (Party Mode: John):**

Every user-facing error message for data operations must communicate:
1. **What failed** — "Your latest changes haven't been saved"
2. **Whether data was lost** — "Your previous work is safe"
3. **What to do** — "Please check your connection and try again"

```
// GOOD: Actionable, reassuring
"Your latest changes haven't been saved yet. Your previous work is safe. Please check your connection and try again."

// BAD: Generic, anxiety-inducing
"Unable to save your plan. Please try again."

// BAD: Technical, unhelpful
"Error: ECONNREFUSED 5432"
```

**Loading State Pattern (refined with Party Mode feedback from Sally):**
- TanStack Query's `.isLoading` / `.isPending` for all async states
- Full-page skeleton for initial page loads (first visit to a plan)
- **Split-screen panels have independent loading states** (Party Mode: Sally):
  - Chat panel can stream AI response while dashboard loads engine results
  - Dashboard can show skeleton while startup costs are still fetching
  - Never block the entire split-screen for a single panel's load
- Inline spinners for section updates within a panel
- Buttons disabled + spinner during mutations
- Never block the entire UI for a background operation

**Authentication Flow:**
- Session-based (express-session + connect-pg-simple)
- Login: `POST /api/auth/login` → sets session cookie → redirect to plans list
- Protected routes: `requireRole()` middleware checks session, returns 401/403
- Frontend: `useQuery({ queryKey: ['/api/auth/me'] })` for current user — redirects to login on 401
- Invitation flow: Token in URL → registration form → `POST /api/auth/register` with token → auto-login

**Validation Pattern:**
- Single source of truth: Zod schemas in `shared/schema.ts`
- Client: `zodResolver` in react-hook-form validates before submit
- Server: Same Zod schema validates request body in route handler
- Never validate only on one side — both must validate

**Consent Endpoint — human-readable description (Party Mode: John):**
- `GET /api/plans/:planId/consent` returns:
```typescript
{
  data: {
    currentStatus: 'granted' | 'revoked' | 'not_set',
    grantedAt: string | null,
    description: "Sharing your plan with [Brand Name] allows them to see your financial projections, startup cost breakdown, and planning timeline. They will NOT see your personal notes or AI conversation history.",
    sharedFields: ['financial_inputs', 'financial_outputs', 'startup_costs', 'documents', 'pipeline_fields'],
    neverSharedFields: ['ai_conversations', 'personal_notes']
  }
}
```
This satisfies FR33-FR38 and FTC compliance — the user sees exactly what will be shared before granting.

---

### Financial Engine Purity Enforcement (Party Mode: Quinn + Amelia)

```typescript
// shared/financial-engine.ts
//
// @engine-pure: This module must have zero side effects.
// No imports from server/, client/, or any I/O module.
// All functions must be deterministic: same inputs → same outputs.
// Verification: grep for import statements — only shared/ and standard lib allowed.
```

**Enforcement rules:**
- `financial-engine.ts` may only import from: other `shared/` files, standard TypeScript/JavaScript built-ins
- Forbidden imports: anything from `server/`, `client/`, `node_modules` (except pure math/utility libraries with zero I/O)
- Every function is a pure function: no `Date.now()`, no `Math.random()`, no `console.log`
- If a timestamp is needed for calculation context, it must be passed in as an input parameter

---

### Enforcement Guidelines

**All AI agents MUST:**
1. Import types from `@shared/schema.ts` — never redeclare types locally
2. Use `IStorage` methods for all database operations — never raw SQL in route handlers
3. Follow the API response wrapper format `{ data }` / `{ error }` for every endpoint
4. Use TanStack Query for all server state — no local state for fetched data
5. Apply `data-testid` attributes to all interactive elements and financial display values
6. Store currency as cents (integers), rates as decimals — format only at display time
7. Keep the financial engine pure — no imports from `server/` or `client/`, no side effects
8. Create both insert and update (`.partial()`) schemas for entities with PATCH endpoints
9. Use 3-part actionable error messages for all data operation failures
10. Place cross-tier components in `components/shared/` — not duplicated per tier

**Anti-Patterns (never do these):**
- Raw `db.query()` or `db.execute()` in route handlers — use `IStorage` methods
- `useState` for data that comes from the server — use TanStack Query
- Floating point for currency — `amount: 150.00` is wrong, use `amount: 15000`
- Splitting Drizzle schema across multiple files
- Business logic in route handlers — move to `server/services/`
- Hardcoded brand parameters — always read from database
- Custom hover/active styles on Shadcn `<Button>` or `<Badge>` — built-in elevation handles this
- Modifying files in `components/ui/` — these are Shadcn-managed
- `Date.now()` or `Math.random()` inside the financial engine
- Silent error swallowing — every catch block must produce user-visible feedback or explicit logging

---

### Pattern Examples

**Good — API route handler:**
```typescript
app.patch("/api/plans/:planId", requireRole("franchisee"), async (req, res) => {
  const parsed = updatePlanSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { message: "Invalid plan data", code: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors } });
  }
  const plan = await storage.updatePlan(req.params.planId, parsed.data, req.user);
  return res.json({ data: plan });
});
```

**Bad — business logic in route, raw query, no validation:**
```typescript
app.patch("/api/plans/:planId", async (req, res) => {
  const result = await db.update(plans).set(req.body).where(eq(plans.id, req.params.planId));
  // Missing: auth check, validation, role scoping, response wrapper
  res.json(result);
});
```

**Good — TanStack Query with proper types and cache invalidation:**
```typescript
const { data: plan, isLoading } = useQuery<Plan>({ queryKey: ['plans', planId] });

const updateMutation = useMutation({
  mutationFn: (data: UpdatePlan) => apiRequest('PATCH', `/api/plans/${planId}`, data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans', planId] }),
  onError: () => toast({ title: "Your latest changes haven't been saved yet.", description: "Your previous work is safe. Please try again." })
});
```

**Bad — local state for server data, no error handling:**
```typescript
const [plan, setPlan] = useState(null);
useEffect(() => { fetch(`/api/plans/${planId}`).then(r => r.json()).then(setPlan) }, []);
```

---

## Project Structure & Boundaries

_Reviewed via Party Mode with Dev (Amelia), QA (Quinn), UX (Sally), SM (Bob), and PM (John). All team recommendations incorporated._

### Complete Project Directory Structure

Legend: **[T]** = exists in template (do not recreate), **[C]** = create during implementation

```
katalyst-growth-planner/
│
├── [T] package.json                      # Dependencies (DO NOT manually edit scripts)
├── [T] tsconfig.json                     # TypeScript config
├── [T] tailwind.config.ts                # Tailwind + Shadcn theme config
├── [T] vite.config.ts                    # Vite config (DO NOT modify)
├── [T] drizzle.config.ts                 # Drizzle ORM config (DO NOT modify)
├── [T] replit.md                         # Project documentation + agent memory
├── [T] .env                              # Environment variables (gitignored)
│
├── shared/                               # Shared between server and client
│   ├── [C] schema.ts                     # ALL Drizzle tables, Zod schemas, types
│   ├── [C] financial-engine.ts           # Pure computation module + interfaces
│   │                                     #   (@engine-pure — zero I/O, zero side effects)
│   └── [C] brand-seed-data/
│       └── postnet.ts                    # PostNet brand defaults, startup cost template,
│                                         #   Item 7 ranges, and reference calculations
│                                         #   (bridge between Excel file and running system)
│
├── server/                               # Express backend
│   ├── [T] index.ts                      # Server entry point (DO NOT modify)
│   ├── [T] vite.ts                       # Vite dev middleware (DO NOT modify)
│   ├── [T] static.ts                     # Static file serving (DO NOT modify)
│   ├── [C] routes.ts                     # Route composition — imports and registers all route modules
│   ├── [C] storage.ts                    # IStorage interface + DatabaseStorage
│   │
│   ├── [C] routes/                       # Route modules (Party Mode: Amelia — keep each under 100 lines)
│   │   ├── auth.ts                       # POST login, POST register, GET me, POST logout
│   │   ├── plans.ts                      # Plan CRUD + PATCH auto-save
│   │   ├── startup-costs.ts              # Startup cost line items CRUD
│   │   ├── documents.ts                  # POST generate + GET retrieve (immutable)
│   │   ├── consent.ts                    # GET status + POST grant + POST revoke
│   │   ├── ai.ts                         # POST conversation message (Story Mode)
│   │   ├── quick-roi.ts                  # POST calculate (no auth — public)
│   │   ├── admin.ts                      # Brand CRUD (katalyst_admin only)
│   │   └── pipeline.ts                   # Pipeline queries (franchisor + katalyst_admin)
│   │
│   ├── [C] middleware/
│   │   ├── auth.ts                       # Session auth, requireAuth(), requireRole()
│   │   └── rbac.ts                       # scopeToUser(), projectForRole() — query + response filtering
│   │
│   └── [C] services/
│       ├── ai-service.ts                 # LLM proxy, conversation mgmt, NL→structured extraction
│       ├── document-service.ts           # PDF generation, immutable doc storage
│       └── financial-service.ts          # Orchestrates engine + persists results
│
├── client/
│   └── src/
│       ├── [T] main.tsx                  # Client entry point
│       ├── [C] App.tsx                   # Root component, SidebarProvider, Router
│       ├── [T] index.css                 # Theme variables, Tailwind base (replace red placeholders)
│       │
│       ├── components/
│       │   ├── [T] ui/                   # Shadcn primitives (NEVER modify)
│       │   │   ├── button.tsx
│       │   │   ├── card.tsx
│       │   │   ├── form.tsx
│       │   │   ├── sidebar.tsx
│       │   │   ├── toast.tsx
│       │   │   ├── tooltip.tsx
│       │   │   └── ...                   # Other Shadcn components as needed
│       │   │
│       │   ├── [C] common/               # Cross-tier components (Party Mode: Bob — renamed from shared/)
│       │   │   ├── detail-panel.tsx       # Per-field metadata display (value, source, range, reset)
│       │   │   ├── financial-dashboard.tsx # Summary projections, ROI metrics, charts
│       │   │   ├── roi-summary-card.tsx   # Break-even, IRR, annual ROI display
│       │   │   ├── startup-cost-table.tsx  # Startup cost line items (view/edit)
│       │   │   ├── save-indicator.tsx      # "Saved" / "Saving..." / "Unsaved changes"
│       │   │   ├── consent-dialog.tsx      # Data sharing consent grant/revoke UI
│       │   │   ├── error-boundary.tsx      # Fault isolation per panel (Party Mode: Amelia)
│       │   │   └── plan-header.tsx         # Plan name, tier selector, save indicator, booking link
│       │   │
│       │   ├── [C] planning/             # Experience tier-specific components
│       │   │   ├── story-layout.tsx       # Split-screen: chat left, dashboard right (Party Mode: Amelia)
│       │   │   ├── normal-layout.tsx      # Section nav left, form center, detail panel right
│       │   │   ├── expert-layout.tsx      # Full-width spreadsheet grid, collapsible dashboard
│       │   │   │
│       │   │   ├── story-mode/
│       │   │   │   ├── chat-panel.tsx     # AI conversation interface
│       │   │   │   ├── message-bubble.tsx  # Individual message display
│       │   │   │   └── chat-input.tsx      # Message input with send
│       │   │   │
│       │   │   ├── normal-mode/
│       │   │   │   ├── section-nav.tsx     # Section navigation (sidebar or tabs)
│       │   │   │   ├── input-section.tsx   # Grouped form fields per planning section
│       │   │   │   └── field-input.tsx     # Single financial input with metadata
│       │   │   │
│       │   │   └── expert-mode/
│       │   │       ├── spreadsheet-grid.tsx # Direct-access spreadsheet-style grid
│       │   │       └── grid-cell.tsx        # Individual editable cell
│       │   │
│       │   ├── [C] admin/                # Brand administration components
│       │   │   ├── brand-form.tsx         # Brand setup/edit form
│       │   │   ├── brand-defaults-editor.tsx # Financial defaults + Item 7 ranges
│       │   │   ├── startup-cost-template.tsx # Startup cost template editor
│       │   │   └── user-management.tsx    # Invitation, role assignment
│       │   │
│       │   ├── [C] pipeline/             # Franchisor/Katalyst dashboard components
│       │   │   ├── pipeline-board.tsx     # Kanban-style pipeline stages
│       │   │   ├── plan-summary-card.tsx  # Pipeline card with stage + market
│       │   │   └── pipeline-filters.tsx   # Filter by stage, market, quarter
│       │   │
│       │   └── [C] app-sidebar.tsx       # Application sidebar navigation
│       │
│       ├── [C] pages/                    # One file per route
│       │   ├── login.tsx                  # Login page [PUBLIC]
│       │   ├── register.tsx               # Invitation-based registration [PUBLIC — token required]
│       │   ├── plans.tsx                  # Plans list / franchisee home [PROTECTED — franchisee]
│       │   ├── plan.tsx                   # Plan workspace — renders story/normal/expert layout [PROTECTED — franchisee]
│       │   ├── quick-roi.tsx             # Lightweight ROI calculator [PUBLIC — lead capture]
│       │   ├── pipeline.tsx              # Franchisor pipeline dashboard [PROTECTED — franchisor, katalyst_admin]
│       │   ├── admin-brands.tsx          # Katalyst brand management [PROTECTED — katalyst_admin]
│       │   ├── admin-brand.tsx           # Single brand configuration [PROTECTED — katalyst_admin]
│       │   └── [T] not-found.tsx         # 404 page (exists in template)
│       │
│       ├── hooks/
│       │   ├── [C] use-auth.ts           # Current user, login/logout, role checks
│       │   ├── [C] use-financial-engine.ts # Client-side engine invocation for live preview
│       │   ├── [C] use-plan-auto-save.ts  # Debounced auto-save with conflict detection
│       │   └── [T] use-toast.ts          # Toast notifications (exists in template)
│       │
│       └── lib/
│           ├── [T] queryClient.ts        # TanStack Query config (exists in template)
│           ├── [C] format.ts             # Currency, percentage, date display formatting
│           ├── [C] brand-theme.ts        # Maps brand config → CSS custom properties at runtime
│           │                             #   (Party Mode: Sally — dynamic, not per-brand CSS files)
│           ├── [C] protected-route.tsx    # Route guard (redirects if not authed/wrong role)
│           └── [T] utils.ts              # General utilities (exists in template)
│
└── attached_assets/                      # Reference data (not deployed)
    ├── PostNet_-_Business_Plan_1770511701987.xlsx
    └── katalyst-replit-agent-context-final_1770513125481.md
```

---

### Architectural Boundaries

**API Boundaries:**

| Boundary | Route Module | Inbound | Auth Required |
|----------|-------------|---------|---------------|
| `/api/auth/*` | `routes/auth.ts` | Client login/register | No (public) |
| `/api/plans/*` | `routes/plans.ts` | Plan CRUD + auto-save | Yes — franchisee owns, franchisor reads (projected) |
| `/api/plans/:id/startup-costs/*` | `routes/startup-costs.ts` | Startup cost CRUD | Yes — franchisee only |
| `/api/plans/:id/documents/*` | `routes/documents.ts` | Create + retrieve (immutable) | Yes — franchisee creates, franchisor reads (with consent) |
| `/api/plans/:id/consent/*` | `routes/consent.ts` | Grant/revoke/status | Yes — franchisee only |
| `/api/plans/:id/conversation` | `routes/ai.ts` | Chat message | Yes — franchisee only (Story Mode) |
| `/api/quick-roi` | `routes/quick-roi.ts` | Stateless calculation | No (public — lead capture) |
| `/api/admin/brands/*` | `routes/admin.ts` | Brand CRUD | Yes — katalyst_admin only |
| `/api/pipeline/*` | `routes/pipeline.ts` | Pipeline queries | Yes — franchisor or katalyst_admin |

**Route Module Pattern (Party Mode: Amelia):**

```typescript
// server/routes/plans.ts
import { Express } from "express";
import { IStorage } from "../storage";
import { requireAuth, requireRole } from "../middleware/auth";
import { updatePlanSchema } from "@shared/schema";

export function registerPlanRoutes(app: Express, storage: IStorage) {
  app.get("/api/plans", requireAuth(), requireRole("franchisee"), async (req, res) => { ... });
  app.post("/api/plans", requireAuth(), requireRole("franchisee"), async (req, res) => { ... });
  app.get("/api/plans/:planId", requireAuth(), async (req, res) => { ... });
  app.patch("/api/plans/:planId", requireAuth(), requireRole("franchisee"), async (req, res) => { ... });
}

// server/routes.ts — composition root
import { registerAuthRoutes } from "./routes/auth";
import { registerPlanRoutes } from "./routes/plans";
// ... all other route modules

export function registerRoutes(app: Express, storage: IStorage) {
  registerAuthRoutes(app, storage);
  registerPlanRoutes(app, storage);
  // ... all other route modules
}
```

**Component Boundaries (client-side):**

```
Pages (route-level containers)
  └── compose components from common/ + planning/ + admin/ + pipeline/
  └── own their TanStack Query hooks
  └── never contain business logic — delegate to hooks and components
  └── plan.tsx: fetches plan → determines tier → renders {story|normal|expert}-layout

Layout Components (components/planning/{story|normal|expert}-layout.tsx)
  └── define arrangement of common/ components for each experience tier
  └── story-layout: split-screen (chat left, dashboard right)
  └── normal-layout: section nav left, form center, detail panel right
  └── expert-layout: full-width grid, collapsible dashboard
  └── each wrapped in error-boundary for fault isolation

Common Components (components/common/)
  └── receive data via props — never fetch their own data
  └── emit changes via callbacks — never mutate server state directly
  └── used identically across Story/Normal/Expert modes
  └── error-boundary wraps each independently — dashboard crash doesn't kill chat

Tier Components (components/planning/{story|normal|expert}-mode/)
  └── tier-specific input paradigm only
  └── write to same financial input state via same mutation hooks
  └── compose with common/ components (detail panel, dashboard)
```

**Service Boundaries (server-side):**

```
Routes (server/routes/ modules)
  └── Thin: validate request → call storage/service → format response
  └── Each module: registerXxxRoutes(app, storage) — under 100 lines
  └── routes.ts composes all modules

Storage (server/storage.ts)
  └── All database operations — sole owner of Drizzle queries
  └── Receives user context for RBAC scoping
  └── Exposes typed methods matching IStorage interface
  └── Documents: createDocument() + getDocument() + listDocuments() ONLY (no update/delete)

Services (server/services/)
  └── Business logic orchestration
  └── ai-service: LLM API calls, conversation context management, value extraction
  └── document-service: PDF rendering, inputs snapshot, immutable storage
  └── financial-service: invokes engine, persists outputs, triggers recalculation
  └── Services call storage — never raw Drizzle queries

Financial Engine (shared/financial-engine.ts)
  └── PURE — no imports from server/ or client/
  └── Called by: financial-service (server), useFinancialEngine (client preview)
  └── Zero side effects — deterministic computation only
```

**Data Boundaries:**

```
PostgreSQL (single database)
  └── All tables defined in shared/schema.ts via Drizzle
  └── Accessed exclusively through IStorage methods
  └── RBAC scoping applied at query level in storage methods
  └── JSONB columns use camelCase internally

Sessions
  └── express-session + connect-pg-simple → stored in PostgreSQL
  └── Session cookie is httpOnly, secure, sameSite

Brand Seed Data (shared/brand-seed-data/)
  └── PostNet defaults, startup cost templates, Item 7 ranges
  └── Reference calculations for engine validation
  └── Ships with product — not test fixtures
  └── Seeded to DB on first run or brand creation

LLM API (external)
  └── Accessed only through server/services/ai-service.ts
  └── Never called from client — server is the proxy
  └── API key stored in environment secret, never exposed to client

Brand Theming (client/src/lib/brand-theme.ts)
  └── Reads brand config from API (primary color, accent, logo URL)
  └── Sets CSS custom properties on document root at runtime
  └── No per-brand CSS files — single utility, dynamic application
```

---

### Requirements to Structure Mapping

**FR Categories → Files:**

| FR Category | Primary Files | Supporting Files |
|-------------|--------------|-----------------|
| **Financial Planning (FR1-10)** | `shared/financial-engine.ts` | `server/services/financial-service.ts`, `client/components/common/financial-dashboard.tsx`, `client/components/common/roi-summary-card.tsx` |
| **Guided Experience (FR11-19)** | `client/pages/plan.tsx`, `client/components/planning/{story\|normal\|expert}-layout.tsx`, `client/components/planning/{story\|normal\|expert}-mode/*` | `client/components/common/plan-header.tsx` (includes booking link — Party Mode: John), `client/hooks/use-plan-auto-save.ts` |
| **Advisory & Guardrails (FR20-23)** | `shared/financial-engine.ts` (identity checks), `client/components/common/detail-panel.tsx` (range warnings) | `server/services/financial-service.ts` |
| **Documents (FR24-27)** | `server/services/document-service.ts`, `server/routes/documents.ts` | `server/storage.ts` (createDocument, getDocument, listDocuments — immutable only) |
| **Auth & Access (FR28-32)** | `server/middleware/auth.ts`, `server/routes/auth.ts`, `client/pages/login.tsx`, `client/pages/register.tsx` | `client/hooks/use-auth.ts`, `client/lib/protected-route.tsx` |
| **Data Sharing (FR33-38)** | `server/middleware/rbac.ts`, `server/routes/consent.ts`, `client/components/common/consent-dialog.tsx` | `server/storage.ts` (consent CRUD) |
| **Brand Admin (FR39-44)** | `client/pages/admin-brands.tsx`, `client/pages/admin-brand.tsx`, `client/components/admin/*`, `server/routes/admin.ts` | `server/storage.ts` (brand CRUD), `shared/brand-seed-data/postnet.ts` |
| **Pipeline (FR45-48)** | `client/pages/pipeline.tsx`, `client/components/pipeline/*`, `server/routes/pipeline.ts` | `server/middleware/rbac.ts` (projectForRole) |
| **Brand Identity (FR49)** | `client/lib/brand-theme.ts`, `shared/schema.ts` (brand theme columns + `booking_url`) | `client/components/common/plan-header.tsx` |
| **AI Planning Advisor (FR50-54)** | `server/services/ai-service.ts`, `server/routes/ai.ts`, `client/components/planning/story-mode/*`, `client/components/planning/story-layout.tsx` | `client/pages/plan.tsx` (tier selection) |
| **Advisory Board (FR55-58)** | Phase 2 — not in MVP file structure | — |

**Cross-Cutting Concerns:**

| Concern | Files |
|---------|-------|
| RBAC enforcement | `server/middleware/auth.ts` + `server/middleware/rbac.ts` + `server/storage.ts` (every method) |
| Auto-save | `client/hooks/use-plan-auto-save.ts` + `server/routes/plans.ts` (PATCH) + `client/components/common/save-indicator.tsx` |
| Financial formatting | `client/lib/format.ts` (cents→dollars, decimals→percentages) |
| FTC compliance | `server/services/document-service.ts` (disclaimer injection) + `client/components/common/consent-dialog.tsx` |
| Per-field metadata | `shared/schema.ts` (FieldMetadata type) + `client/components/common/detail-panel.tsx` |
| Fault isolation | `client/components/common/error-boundary.tsx` — wraps each panel in layout components independently |
| Brand theming | `client/lib/brand-theme.ts` + `shared/schema.ts` (brand theme config + `booking_url`) |
| Engine validation | `shared/brand-seed-data/postnet.ts` — reference calculations from PostNet spreadsheet |

---

### Page Access Matrix (Party Mode: Sally)

| Page | Path | Access Level | Role(s) |
|------|------|-------------|---------|
| Login | `/login` | PUBLIC | — |
| Register | `/register` | PUBLIC (token required) | — |
| Quick ROI | `/quick-roi` | PUBLIC | — (lead capture entry) |
| Plans List | `/plans` | PROTECTED | franchisee |
| Plan Workspace | `/plans/:planId` | PROTECTED | franchisee (owner), franchisor (read, with consent) |
| Pipeline | `/pipeline` | PROTECTED | franchisor, katalyst_admin |
| Brand Management | `/admin/brands` | PROTECTED | katalyst_admin |
| Brand Config | `/admin/brands/:brandId` | PROTECTED | katalyst_admin |

---

### Integration Points

**Internal Communication:**
- Client → Server: HTTP REST via TanStack Query default fetcher
- Client → Engine: Direct import of `shared/financial-engine.ts` for live preview
- Server → Engine: Direct import for document generation and recalculation
- Server → LLM: HTTP via `ai-service.ts` → external LLM API
- Server → PDF: `document-service.ts` generates PDF server-side

**External Integrations:**
- **LLM API** (OpenAI or equivalent) — server-side only, via `ai-service.ts`
- **Replit Object Storage** — for generated PDF documents, via `document-service.ts`
- **PostgreSQL** (Neon-backed via Replit) — via Drizzle ORM through `storage.ts`

**Data Flow — Plan Creation to Document Generation:**

```
User Input (any tier)
  → client mutation (PATCH /api/plans/:id)
  → server/routes/plans.ts validates with updatePlanSchema
  → storage.updatePlan() persists to DB
  → financial-service.recalculate() invokes engine
  → engine returns EngineOutput (pure computation)
  → storage.updatePlanOutputs() persists cached results
  → client receives updated outputs via query invalidation
  → user clicks "Generate PDF"
  → POST /api/plans/:id/documents
  → document-service.generate() snapshots inputs + renders PDF
  → storage.createDocument() saves immutable record
  → PDF stored in Object Storage
```

---

### Development Workflow Integration

**Development Server:**
- `npm run dev` starts Express (port 5000) + Vite dev middleware
- Vite handles HMR for client code
- Express serves API routes at `/api/*`
- Single port — no proxy configuration needed

**Database Migrations:**
- Drizzle Kit manages migrations via `npx drizzle-kit push`
- Schema changes always start in `shared/schema.ts`
- Never use raw SQL for schema changes

**Build Process:**
- `npm run build` → Vite builds client → `script/build.ts` compiles server
- Output: `dist/` directory with compiled server + bundled client assets
- `shared/` code is bundled into both server and client builds

**Testing:**
- End-to-end tests via Replit's Playwright runner (run_test tool)
- No separate test directory — tests authored through testing tool
- `data-testid` coverage mandatory for all interactive and financial display elements
- Financial engine validated against `shared/brand-seed-data/postnet.ts` reference calculations

---

## Architecture Validation Results

_Reviewed via Party Mode with Dev (Amelia), QA (Quinn), UX (Sally), SM (Bob), and PM (John). All team recommendations incorporated._

### Coherence Validation — PASS

**Decision Compatibility:**
All 15 architectural decisions are compatible. React + Express + PostgreSQL + Drizzle + TanStack Query is a proven stack with no version conflicts. Session auth (express-session + connect-pg-simple) works natively with PostgreSQL. Drizzle + drizzle-zod produces shared schemas consumed by both React Hook Form (zodResolver) and Express route validation — single source of truth. Financial engine as pure shared module imports cleanly into both Vite client bundle and Express server. JSONB columns for per-field metadata pair naturally with Drizzle's `jsonb()` type and TypeScript interfaces.

**Pattern Consistency:**
- Database naming (snake_case) and JSONB internals (camelCase) explicitly separated
- API naming (kebab-case endpoints, camelCase query params) aligns with Express conventions
- Code naming (PascalCase components, kebab-case files) matches template convention
- Currency-as-cents rule enforced at every layer: engine → storage → API → UI (`format.ts`)
- `.partial()` update schemas for every PATCH-able entity — consistent auto-save pattern

**Structure Alignment:**
- Route modules (8 files under `server/routes/`) map 1:1 to API boundary table
- Three layout components match the three experience tiers — clear separation
- `components/common/` holds cross-tier components; `components/planning/` holds tier-specific
- `[T]`/`[C]` legend prevents agents from recreating template files
- Error boundary in `common/` enables fault isolation per panel in split-screen layouts

---

### Requirements Coverage Validation — PASS

**Functional Requirements (58 FRs):**

| FR Range | Category | Architectural Support | Status |
|----------|----------|----------------------|--------|
| FR1-10 | Financial Planning | `financial-engine.ts` (pure), `financial-service.ts` (orchestration), `financial-dashboard.tsx` + `roi-summary-card.tsx` (display) | COVERED |
| FR11-19 | Guided Experience | `plan.tsx` → 3 layout components, `plan-header.tsx` (booking link, tier selector, save indicator), `use-plan-auto-save.ts` | COVERED |
| FR20-23 | Advisory & Guardrails | Engine identity checks (never throws), `detail-panel.tsx` (range warnings, source attribution) | COVERED |
| FR24-27 | Documents | `document-service.ts` (PDF + immutable storage), `storage.ts` (createDocument/getDocument only) | COVERED |
| FR28-32 | Auth & Access | `auth.ts` middleware (session + requireRole), `use-auth.ts` hook, `protected-route.tsx`, invitation token flow | COVERED |
| FR33-38 | Data Sharing & Consent | `rbac.ts` (scopeToUser + projectForRole), `consent-dialog.tsx` (human-readable field lists), `routes/consent.ts` | COVERED |
| FR39-44 | Brand Admin | `routes/admin.ts`, admin pages, `brand-defaults-editor.tsx`, `startup-cost-template.tsx`, `brand-seed-data/postnet.ts` | COVERED |
| FR45-48 | Pipeline | `routes/pipeline.ts`, `pipeline.tsx` page, `pipeline-board.tsx`, RBAC projection | COVERED |
| FR49 | Brand Identity | `brand-theme.ts` (runtime CSS variables), `schema.ts` (brand theme columns + booking_url) | COVERED |
| FR50-54 | AI Planning Advisor | `ai-service.ts` (LLM proxy + NL extraction), `story-layout.tsx` (split-screen), `routes/ai.ts` | COVERED |
| FR55-58 | Advisory Board | Explicitly deferred to Phase 2 — not in MVP structure | DEFERRED (by design) |

**Non-Functional Requirements (28 NFRs):**

| NFR Area | Architectural Support | Status |
|----------|----------------------|--------|
| Performance | Client-side engine for live preview, server-side for document generation, TanStack Query caching | COVERED |
| Security | Session-based auth, RBAC at 3 layers, httpOnly cookies, no secrets exposed to client | COVERED |
| Data Integrity | Currency as cents, immutable documents, auto-save with conflict detection | COVERED |
| FTC Compliance | Consent dialog with field lists, disclaimer injection, source attribution | COVERED |
| Accessibility | Shadcn components (built-in ARIA), data-testid convention, proper form labels | COVERED |
| Scalability | Stateless engine, PostgreSQL with indexes, JSONB for flexible schema evolution | COVERED |
| Graceful Degradation | AI is enhancement — Normal/Expert work without LLM, cut order documented | COVERED |

---

### Implementation Readiness Validation — PASS

**Decision Completeness:**
- 15 decisions documented with specific technology versions
- 25 conflict points resolved with code examples (good and bad patterns)
- 10 enforcement guidelines + 10 anti-patterns provide guardrails

**Structure Completeness:**
- 50+ files explicitly defined with `[T]`/`[C]` legend
- Page access matrix documents public vs. protected routes with roles
- Route module pattern includes composition code example
- Storage wiring documented: `routes.ts` creates `DatabaseStorage` internally and passes to route modules (Party Mode: Amelia)

**Pattern Completeness:**
- All naming conventions specified (6 categories)
- Number format rules explicit (currency vs. rates vs. counts)
- Error handling: 3-part actionable messages, engine never throws
- Auto-save: debounce, conflict detection, in-flight handling, UI indicator
- Loading states: split-screen independent loading, skeleton vs. inline spinner

---

### Gap Analysis Results

**Critical Gaps: NONE**

**Important Gaps (3 found — all resolved):**

1. **Session configuration details.** Architecture specifies express-session + connect-pg-simple but doesn't detail cookie config. **Resolution:** Implementation detail — agents follow standard secure defaults (httpOnly, secure in production, sameSite: lax). SESSION_SECRET already configured.

2. **Rate limiting on public endpoints.** Quick ROI and auth endpoints are public with no rate limiting. **Resolution:** Post-MVP operational hardening. Noted as future enhancement.

3. **Auto-save conflict resolution (Party Mode: Quinn).** Step 5 defines conflict detection but doesn't specify the full failure path. **Resolution — new decision:**

> **Auto-Save Conflict Handling (MVP):**
> - Server detects stale `lastAutoSave` timestamp → returns `409 Conflict` with server's current version
> - Client shows 3-part message: "Your changes conflict with a more recent save. Your work has been preserved locally. Please refresh to see the latest version."
> - Client preserves unsaved changes in local state (not lost on refresh)
> - **No merge UI in MVP** — merge is Phase 2 complexity
> - User refreshes to get server version, then re-applies their changes manually

**Nice-to-Have Gaps (2 found):**

1. **Monitoring/observability.** No logging framework specified. **Resolution:** Standard `console.log` with Express error handler sufficient for MVP on Replit. Structured logging in Phase 2.

2. **Split-screen responsive behavior (Party Mode: Sally).** Architecture specifies side-by-side split for Story Mode but doesn't address narrow viewports. **Resolution — implementation note:**

> **Split-Screen Responsive Rule:**
> - Viewports ≥ 1024px: side-by-side (chat left, dashboard right)
> - Viewports < 1024px: stacked vertically or tab-based toggle between chat and dashboard
> - Agents must implement responsive breakpoint — never build rigid two-column layout

---

### Validation Issues Addressed

All issues found during validation have been resolved:

| Issue | Severity | Resolution |
|-------|----------|------------|
| Auto-save conflict path undefined | Important | `409 Conflict` → 3-part message → preserve local → no merge in MVP (Quinn) |
| Implementation priority order | Important | Engine before client pages — engine types needed by components (Amelia) |
| Storage wiring undocumented | Important | `routes.ts` creates DatabaseStorage, passes to modules (Amelia) |
| Quick ROI → registration funnel | Minor | Note CTA in Quick ROI page: "Build a full plan → Sign up" (Sally) |
| Split-screen responsive behavior | Minor | Stack/tab below 1024px breakpoint (Sally) |
| Cut order buried in Decision 15 | Minor | Elevated to implementation handoff section (John) |
| Shippable unit boundaries unclear | Minor | Independently shippable units documented for sprint planning (Bob) |

---

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed (Step 2 — multi-tenant B2B2C, throuple problem, FTC compliance)
- [x] Scale and complexity assessed (Step 2 — 3 user roles, 3 experience tiers, franchise domain)
- [x] Technical constraints identified (Step 3 — Replit template, single PostgreSQL, no containerization)
- [x] Cross-cutting concerns mapped (Step 6 — RBAC, auto-save, formatting, FTC, metadata, fault isolation, theming)

**Architectural Decisions**
- [x] Critical decisions documented with versions (15 decisions, Step 4)
- [x] Technology stack fully specified (React 18 + Express + PostgreSQL + Drizzle + TanStack Query v5)
- [x] Integration patterns defined (LLM proxy, PDF generation, Object Storage)
- [x] Performance considerations addressed (client-side engine preview, query caching, debounced auto-save)

**Implementation Patterns**
- [x] Naming conventions established (database, API, code, JSONB, data-testid — 6 categories)
- [x] Structure patterns defined (project organization, schema patterns, route modules)
- [x] Communication patterns specified (TanStack Query, auto-save, auth flow, validation)
- [x] Process patterns documented (error handling, loading states, consent, engine purity)

**Project Structure**
- [x] Complete directory structure defined (50+ files with [T]/[C] legend)
- [x] Component boundaries established (pages → layouts → common/tier components)
- [x] Integration points mapped (client→server REST, client→engine direct, server→LLM, server→Object Storage)
- [x] Requirements to structure mapping complete (11 FR categories + 7 cross-cutting concerns)

---

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** HIGH

**Key Strengths:**
- Financial engine purity architecturally enforced — computation is deterministic and testable
- Three-tier experience model writes to same state — no data divergence risk
- RBAC at three layers prevents authorization gaps
- Per-field metadata enables attribution, reset, and range display uniformly
- Immutable document storage prevents tampering — no update/delete methods exist
- Party Mode reviews at Steps 5, 6, and 7 resolved 25+ potential implementation conflicts
- Graceful degradation baked in — AI is enhancement, not foundation
- Auto-save conflict handling explicitly decided (no merge in MVP)
- Split-screen responsive behavior specified (stack below 1024px)

**Areas for Future Enhancement:**
- Rate limiting on public endpoints (post-MVP)
- Structured logging/observability (Phase 2)
- WebSocket for real-time pipeline updates (Phase 2)
- Advisory Board feature (FR55-58, Phase 2)
- Auto-save merge UI for conflict resolution (Phase 2)
- Multi-language support (not in current requirements)

---

### Implementation Handoff

**AI Agent Guidelines:**
1. Follow all 15 architectural decisions exactly as documented
2. Use the 10 enforcement rules and avoid all 10 anti-patterns
3. Respect `[T]`/`[C]` file legend — never recreate template files
4. Financial engine (`shared/financial-engine.ts`) must remain pure — verify with `@engine-pure` comment
5. Every component must have `data-testid` attributes following the documented convention
6. Use `components/common/` for cross-tier components, never duplicate per tier
7. `routes.ts` creates `DatabaseStorage` instance and passes it to each route module via `registerXxxRoutes(app, storage)` (Party Mode: Amelia)
8. Auto-save conflicts return `409` — no merge UI in MVP (Party Mode: Quinn)
9. Split-screen layouts must stack/tab below 1024px viewport (Party Mode: Sally)

**Resource-Constrained Cut Order (Party Mode: John — elevated from Decision 15):**

| Priority | What | Cut Impact |
|----------|------|-----------|
| **NEVER CUT** | Financial engine, Normal Mode, Expert Mode, PDF generation, save/resume, auth, RBAC | Product doesn't work |
| **First cut** | AI Planning Advisor (Story Mode) | Falls back to form-based Normal Mode |
| **Second cut** | Franchisor pipeline dashboard | Katalyst uses direct DB queries |
| **Third cut** | ROI Threshold Guardian (advisory guardrails) | Users see raw numbers without warnings |

**Implementation Priority Order (Party Mode: Amelia — engine before client):**

1. `shared/schema.ts` — All tables, insert/update schemas, types
2. `shared/financial-engine.ts` — Pure computation module + interfaces (EngineInput, EngineOutput)
3. `shared/brand-seed-data/postnet.ts` — PostNet defaults from Excel reference
4. `server/storage.ts` — IStorage interface + DatabaseStorage implementation
5. `server/middleware/auth.ts` + `server/middleware/rbac.ts` — Auth and authorization
6. `server/routes.ts` + `server/routes/*.ts` — API endpoints (routes.ts creates storage, passes to modules)
7. `client/src/pages/login.tsx` + `client/src/pages/plans.tsx` — Core user flow
8. `client/src/pages/plan.tsx` + layout components — Planning experience
9. `client/src/pages/quick-roi.tsx` — Public lead capture (with registration CTA — Party Mode: Sally)
10. `client/src/pages/pipeline.tsx` + admin pages — Franchisor/Katalyst views

**Independently Shippable Units (Party Mode: Bob — for sprint boundaries):**

| Unit | Dependencies | Can Demo/Test Independently |
|------|-------------|---------------------------|
| Financial engine + seed data | None | Yes — pure functions, testable with reference calculations |
| Auth flow (login/register) | schema + storage | Yes — standalone user management |
| Plans list + empty state | auth + schema + storage | Yes — CRUD without financial features |
| Quick ROI page | financial engine only | Yes — no auth, stateless calculation |
| Plan workspace (Normal Mode) | engine + auth + storage + routes | Yes — full planning experience |
| Plan workspace (Story Mode) | Normal Mode + AI service | Yes — adds AI layer on top |
| Pipeline dashboard | plans + consent + RBAC | Yes — read-only view of existing plans |
| Brand admin | schema + storage + seed data | Yes — configuration interface |
