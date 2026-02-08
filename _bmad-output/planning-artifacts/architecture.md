---
stepsCompleted: [1, 2, 3, 4]
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
