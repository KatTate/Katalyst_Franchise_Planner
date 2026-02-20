---
stepsCompleted: ['step-01-document-discovery', 'step-02-prd-analysis', 'step-03-epic-coverage-validation', 'step-04-ux-alignment', 'step-05-epic-quality-review', 'step-06-final-assessment']
date: '2026-02-20'
project_name: 'Katalyst Growth Planner'
documents:
  prd: '_bmad-output/planning-artifacts/prd.md'
  architecture: '_bmad-output/planning-artifacts/architecture.md'
  epics: '_bmad-output/planning-artifacts/epics.md'
  ux_spec: '_bmad-output/planning-artifacts/ux-design-specification-consolidated.md'
  sprint_change_proposal: '_bmad-output/planning-artifacts/sprint-change-proposal-2026-02-19.md'
  project_context: '_bmad-output/project-context.md'
---

# Implementation Readiness Assessment Report

**Date:** 2026-02-20
**Project:** Katalyst Growth Planner

---

## Step 1: Document Discovery

### Documents Inventoried

| Document Type | File | Status |
|--------------|------|--------|
| PRD | `prd.md` | Found — last edited 2026-02-20 |
| Architecture | `architecture.md` | Found |
| Epics & Stories | `epics.md` | Found |
| UX Spec | `ux-design-specification-consolidated.md` | Found — dated 2026-02-18, single source of truth |
| Sprint Change Proposal | `sprint-change-proposal-2026-02-19.md` | Found — cross-reference document |
| Project Context | `project-context.md` | Found — cross-reference document |

### Issues
- No duplicates found
- No missing documents
- No sharded/whole conflicts

---

## Step 2: PRD Analysis

### Functional Requirements Extracted

**Section 1: Financial Planning & Calculation**
- FR1: Franchisee can build a 5-year monthly financial projection based on their inputs and brand default parameters
- FR2: Franchisee can view and edit every financial input value used in their projection
- FR3: Franchisee can reset any individual edited value back to the brand default with a single action
- FR4: Franchisee can see the FDD Item 7 range alongside the brand default and their own estimate for each startup cost line item
- FR5: Franchisee can add, remove, and reorder custom startup cost line items beyond the brand template defaults
- FR6: Franchisee can classify each custom startup cost line item as CapEx (depreciable) or non-CapEx (expensed)
- FR7: Franchisee can view live-updating summary financial metrics (total investment, projected revenue, ROI, break-even) as they edit inputs
- FR7a: P&L Statement as tabular financial document with 60 monthly columns
- FR7b: Balance Sheet as tabular financial document with 60 monthly columns
- FR7c: Cash Flow Statement as tabular financial document with 60 monthly columns
- FR7d: Summary Financials page with annual P&L summary, balance sheet summary, cash flow, working capital, debt schedule, capex schedule, and breakeven analysis
- FR7e: Returns on Invested Capital (ROIC) analysis
- FR7f: Valuation analysis
- FR7g: Audit/integrity check results (13 checks)
- FR7h: Reports inline editing — input cells always editable, computed cells read-only, real-time updates
- FR7i: Per-year (Y1-Y5) input assumptions
- FR7j: Complete input assumptions list matching reference spreadsheet
- FR7k: Glossary page with financial term definitions
- FR7l: Contextual help for every input field — tooltip + expanded guidance
- FR7m: My Plan composite field decomposition + Reports consolidated form + bidirectional sync
- FR7n: PDF business plan package generation and download
- FR8: Accounting identity validation on every calculation
- FR9: Deterministic outputs
- FR10: Single parameterized model — no structural changes per brand
- FR74: Corporation tax with loss carry-forward
- FR75: Tax payment delay
- FR76: Shareholder salary adjustment → Adjusted Net Profit Before Tax
- FR77: EBITDA-based valuation
- FR78: Full ROIC computation
- FR79: Labor Efficiency Ratios
- FR80: Breakeven burn metrics
- FR81: Payback period analysis
- FR82: Retained Earnings as distinct balance sheet line item
- FR83: Summary Financials dashboard

**Section 2: Guided Planning Experience**
- FR11: Complete planning experience collecting all inputs
- FR12: Two persistent surfaces (My Plan + Reports) + three adaptive experience tiers (Story/Normal/Expert)
- FR13: Franchisee can switch experience tiers; both surfaces accessible in all tiers
- FR14: System recommends initial tier from onboarding questions
- FR15: Free navigation between completed sections
- FR16: Save progress + resume across sessions
- FR17: Auto-save periodically
- FR18: Session recovery to last auto-save point
- FR19: Consultant booking link throughout planning experience

**Section 3: Advisory & Guardrails**
- FR20: Advisory nudges for inputs deviating >25% from FDD Item 7 range midpoint or brand average
- FR21: Weak business case identification with specific guidance + advisory visual language (FR88-FR89)
- FR22: Consultant booking suggestion when flagging weak cases
- FR23: All advisory nudges informational — never blocking

**Section 4: Document Generation & Management**
- FR24: Lender-grade PDF business plan package
- FR25: FTC-compliant disclaimers in generated documents
- FR26: Document list with timestamps and plan version metadata
- FR27: Download any previously generated document

**Section 5: User Access & Authentication**
- FR28: Katalyst admin creates franchisee invitations
- FR29: Guided onboarding with experience assessment
- FR30: Katalyst admin creates franchisor admin invitations
- FR31: Authentication (Google OAuth for Katalyst; invitation-based for franchisees/franchisors)
- FR32: Role-based data isolation

**Section 6: Data Sharing & Privacy**
- FR33: Clear data sharing description before opt-in
- FR34: Opt-in to share financial details with franchisor
- FR35: Revokable data sharing
- FR36: Franchisor sees pipeline status by default
- FR37: Financial details only for opted-in franchisees
- FR38: Data sharing enforced at API level

**Section 7: Brand Configuration & Administration**
- FR39: Create/configure brand with financial parameter set
- FR40: Define startup cost template per brand
- FR41: Validate brand configuration against known-good spreadsheet
- FR42: Assign account manager to franchisee
- FR43: Reassign account managers
- FR44: Configure brand-level settings (identity, colors, defaults)

**Section 8: Pipeline Visibility & Operational Intelligence**
- FR45: Franchisor pipeline dashboard
- FR46: Katalyst cross-brand dashboard
- FR47: Katalyst view individual franchisee plan details (admin-context read-only)
- FR48: Franchisor acknowledgment/review (brand-configurable)

**Section 9: Brand Identity & Experience**
- FR49: Brand identity throughout planning experience

**Section 10: AI Planning Advisor (Story Tier)**
- FR50: AI Planning Advisor as slide-in panel within My Plan
- FR51: AI extracts structured inputs from conversation
- FR52: Franchisee can verify/correct AI-populated values
- FR53: AI has access to brand parameters, Item 7 ranges, current plan state
- FR54: Graceful degradation when AI unavailable

**Section 11: Advisory Board Meeting**
- FR55: Initiate Advisory Board Meeting from any tier
- FR56: Multiple domain-specific advisor personas with cross-talk
- FR57: Accept/reject advisory suggestions → written to financial input state
- FR58: Advisory Board persona definitions configurable by Katalyst admin

**Section 12: Admin Support Tools**
- FR59-FR73: View As impersonation, Franchisee Demo Mode, Franchisor Demo Mode (15 FRs)

**Section 13: Financial Display Standards**
- FR84: Consistent formatting rules (currency, percentage, ratio, integer)
- FR85: Accounting-style parentheses for negatives
- FR86: Monospace font (Roboto Mono) for financial figure cells
- FR87: Source badges (BD for brand default, AI for AI-populated)

**Section 14: Advisory vs. Error Visual Language**
- FR88: Distinct visual language — info token for advisory, red for errors only
- FR89: Guardian bar three visual states (healthy/concerning/critical), none using error-red

**Section 15: Impact Strip**
- FR90: Persistent Impact Strip at bottom of My Plan
- FR91: Context-sensitive metrics per active form section
- FR92: Delta indicators for input changes
- FR93: Guardian status dots
- FR94: Deep links to corresponding Reports tabs

**Section 16: Plan Completeness & Document Preview**
- FR95: Plan completeness indicator (section-by-section)
- FR96: Dashboard Document Preview widget with DRAFT watermark and completeness-aware labels

**Section 17: Bidirectional Surface Sync**
- FR97: Edits on either surface immediately reflected on the other — single financial input state

**Total FRs: 111** (FR1-FR10 = 10, FR7a-FR7n = 14, FR11-FR73 = 63, FR74-FR83 = 10, FR84-FR97 = 14)

### Non-Functional Requirements Extracted

**Performance:** NFR1-NFR5 (recalculation, transitions, PDF gen, dashboards, auto-save)
**Security:** NFR6-NFR12 (TLS, hashing, sessions, RBAC, isolation, tokens, logging)
**Reliability & Data Integrity:** NFR13-NFR18 (auto-save cadence, concurrency, determinism, backups, live config, immutable docs)
**Scalability:** NFR19-NFR21 (10 brands/500 users, linear scaling, multi-brand schema)
**AI Integration:** NFR22-NFR24 (response time, validation, degradation)
**Usability:** NFR25-NFR28 (desktop 1024px+, plain language, formatting, feedback latency)
**Admin Support Tools:** NFR29-NFR30 (impersonation duration, role restriction, audit retention)

**Total NFRs: 30**

### PRD Completeness Assessment

The PRD is comprehensive with 111 FRs across 17 sections and 30 NFRs across 7 categories. The 2026-02-20 edit successfully aligned the conceptual model to two-surface architecture with behavioral tiers throughout. New FRs (84-97) cover financial display standards, advisory visual language, Impact Strip, plan completeness, document preview, and bidirectional sync — all of which were previously specified only in the UX spec but missing from the PRD capability contract.

**Observations:**
- FR numbering gap: FR10 jumps to FR74 (FR74-83 were added in a prior course correction for financial engine outputs). This is cosmetic but worth noting.
- Quick Scenario comparison is in MVP scope (Story 5.7) but has no dedicated FR number assigned in the PRD — it's covered by the Journey text and MVP table, but no FR number exists for scenario comparison capability.
- FR55-FR58 (Advisory Board Meeting) are in the FRs but explicitly deferred to Phase 2 in the MVP section — this is acceptable but should be noted as "not in MVP scope."

---

## Step 3: Epic Coverage Validation

### Epic FR Coverage Extracted

| FR | Epic | Coverage Status |
|----|------|----------------|
| FR1 | Epic 3 (Story 3.1) | ✅ Covered |
| FR2 | Epic 3 (Story 3.2, 3.5) | ✅ Covered |
| FR3 | Epic 3 (Story 3.5) | ✅ Covered |
| FR4 | Epic 3 (Story 3.3) | ✅ Covered |
| FR5 | Epic 3 (Story 3.3) | ✅ Covered |
| FR6 | Epic 3 (Story 3.3) | ✅ Covered |
| FR7 | Epic 3 (Story 3.4), Epic 4 | ✅ Covered |
| FR7a | Epic 5 (Story 5.3) | ✅ Covered |
| FR7b | Epic 5 (Story 5.4) | ✅ Covered |
| FR7c | Epic 5 (Story 5.4) | ✅ Covered |
| FR7d | Epic 5 (Story 5.2) | ✅ Covered |
| FR7e | Epic 5 (Story 5.5) | ✅ Covered |
| FR7f | Epic 5 (Story 5.5) | ✅ Covered |
| FR7g | Epic 5 (Story 5.5) | ✅ Covered |
| FR7h | Epic 5 (Stories 5.3, 5.4, 5.5) | ✅ Covered |
| FR7i | Epic 7 (Story 7.1) | ✅ Covered |
| FR7j | Epic 7 (Story 7.1) | ✅ Covered |
| FR7k | Epic 5 (Story 5.10) | ✅ Covered |
| FR7l | Epic 5 (Story 5.10) | ✅ Covered |
| FR7m | Epic 5 (Story 5.6) | ✅ Covered |
| FR7n | Epic 6 (Story 6.1) | ✅ Covered |
| FR8 | Epic 3 (Story 3.4) | ✅ Covered |
| FR9 | Epic 3 (Story 3.1) | ✅ Covered |
| FR10 | Epic 3 (Story 3.1) | ✅ Covered |
| FR11 | Epic 4 (Story 4.2) | ✅ Covered |
| FR12 | Epic 4 (Story 4.1), Epic 5 (Story 5.2, 5.6) | ⚠️ Stale text — see below |
| FR13 | Epic 4 (Story 4.1) | ✅ Covered |
| FR14 | Epic 1 (Story 1.6) | ✅ Covered |
| FR15 | Epic 4 (Story 4.2) | ✅ Covered |
| FR16 | Epic 4 (Story 4.5) | ✅ Covered |
| FR17 | Epic 4 (Story 4.5) | ✅ Covered |
| FR18 | Epic 4 (Story 4.5) | ✅ Covered |
| FR19 | Epic 4 (Story 4.6) | ✅ Covered |
| FR20 | Epic 8 (Story 8.1) | ✅ Covered |
| FR21 | Epic 8 (Story 8.2) | ✅ Covered |
| FR22 | Epic 8 (Story 8.2) | ✅ Covered |
| FR23 | Epic 8 (Story 8.1) | ✅ Covered |
| FR24 | Epic 6 (Story 6.1) | ✅ Covered |
| FR25 | Epic 6 (Story 6.1) | ✅ Covered |
| FR26 | Epic 6 (Story 6.2) | ✅ Covered |
| FR27 | Epic 6 (Story 6.2) | ✅ Covered |
| FR28 | Epic 1 (Story 1.1) | ✅ Covered |
| FR29 | Epic 1 (Story 1.6) | ✅ Covered |
| FR30 | Epic 1 (Story 1.1) | ✅ Covered |
| FR31 | Epic 1 (Stories 1.2-1.5) | ✅ Covered |
| FR32 | Epic 1 (Story 1.5) | ✅ Covered |
| FR33-FR38 | Epic 11 (Story 11.1) | ✅ Covered |
| FR39 | Epic 2 (Story 2.1) | ✅ Covered |
| FR40 | Epic 2 (Story 2.2) | ✅ Covered |
| FR41 | Epic 3 (Story 3.7) | ✅ Covered |
| FR42 | Epic 2 (Story 2.4) | ✅ Covered |
| FR43 | Epic 2 (Story 2.4) | ✅ Covered |
| FR44 | Epic 2 (Story 2.3) | ✅ Covered |
| FR45 | Epic 11 (Story 11.2) | ✅ Covered |
| FR46 | Epic 11 (Story 11.3) | ✅ Covered |
| FR47 | Epic 11 (Story 11.3) | ✅ Covered |
| FR48 | Epic 11 (Story 11.2) | ✅ Covered |
| FR49 | Epic 2 (Story 2.3) | ✅ Covered |
| FR50 | Epic 9 (Stories 9.1, 9.2) | ✅ Covered |
| FR51 | Epic 9 (Story 9.3) | ✅ Covered |
| FR52 | Epic 9 (Story 9.3) | ✅ Covered |
| FR53 | Epic 9 (Story 9.1) | ✅ Covered |
| FR54 | Epic 9 (Story 9.4) | ✅ Covered |
| FR55-FR58 | Epic 12 (Phase 2 — deferred) | ✅ Covered (deferred) |
| FR59-FR65 | Epic ST (Stories ST-1, ST-2) | ✅ Covered |
| FR66-FR69 | Epic ST (Story ST-3) | ✅ Covered |
| FR70-FR73 | Epic ST (Story ST-4) | ✅ Covered |
| **FR74-FR83** | **Epic 5 (Story 5.1)** | **⚠️ Covered in story content but MISSING from FR Coverage Map** |
| **FR84-FR87** | **Epic 5 (Stories 5.2-5.5)** | **⚠️ Covered in story content but MISSING from FR Coverage Map** |
| **FR88-FR89** | **Epic 5 (Story 5.8), Epic 8** | **⚠️ Covered in story content but MISSING from FR Coverage Map** |
| **FR90-FR94** | **Epic 5 (Story 5.6)** | **⚠️ Covered in story content but MISSING from FR Coverage Map** |
| **FR95-FR96** | **Epic 5 (Stories 5.6, 5.9)** | **⚠️ Covered in story content but MISSING from FR Coverage Map** |
| **FR97** | **Epic 5 (Story 5.6)** | **⚠️ Covered in story content but MISSING from FR Coverage Map** |

### Coverage Statistics

- Total PRD FRs: **111**
- FRs covered in epic stories (substantive content): **111** (100%)
- FRs listed in Epics FR Coverage Map: **87** (78%)
- FRs missing from FR Coverage Map: **24** (FR74-FR83, FR84-FR97)
- Coverage map claims "87/87 FRs mapped" — this count is outdated; PRD now has 111 FRs

### Missing FR Coverage Map Entries

#### 🟠 High Priority — FR Coverage Map Stale

**FR74-FR83 (Financial Engine Outputs):** These 10 FRs (corporation tax, tax payment delay, shareholder salary, EBITDA valuation, ROIC, labor efficiency, breakeven burn, payback period, retained earnings, summary financials) are substantively covered by Story 5.1 (Financial Engine Extension) but are not listed in the epics document's FR Coverage Map. The map still claims only 87 FRs.

**FR84-FR97 (New PRD FRs from 2026-02-20 edit):** These 14 FRs (financial display standards, advisory visual language, Impact Strip, plan completeness, document preview, bidirectional sync) are substantively covered by Epic 5 stories (5.2-5.9) and Epic 8, but are not listed in the FR Coverage Map because they were added to the PRD after the epics document was last updated.

**Impact:** The FR Coverage Map is a key traceability artifact. Having 24 FRs that are covered in story content but not listed in the map means:
1. Future developers cannot trace FR84-FR97 to their implementing stories without reading all story content
2. The "87/87 FRs mapped" claim is inaccurate — actual count is 111
3. Any automated coverage checking would report false gaps

**Recommendation:** Update the epics FR Coverage Map to include FR74-FR97 and correct the coverage summary count to 111.

#### 🟠 High Priority — FR12 Text Stale in Epics

The epics document FR Coverage Map entry for FR12 (line 220) says:
> "Three experience tiers: Planning Assistant / Forms / Quick Entry"

The PRD (corrected 2026-02-20) says:
> "Two persistent surfaces (My Plan + Reports) + three adaptive experience tiers (Story/Normal/Expert)"

The epics Requirements Inventory section (line 38) also has the old FR12 text. This is a terminology drift issue — the implementing stories (Epic 5) are correctly aligned to the two-surface model, but the summary sections are stale.

**Recommendation:** Update the Requirements Inventory and FR Coverage Map entry for FR12 to match the corrected PRD text.

---

## Step 4: UX Alignment Assessment

### UX Document Status

**Found:** `ux-design-specification-consolidated.md` (dated 2026-02-18) — single source of truth, explicitly superseding the original `ux-design-specification.md` and `ux-financial-statements-spec.md`.

### UX ↔ PRD Alignment

| Aspect | UX Spec | PRD | Status |
|--------|---------|-----|--------|
| Navigation model | Two sidebar destinations (My Plan + Reports), no mode switcher | Two persistent surfaces (My Plan + Reports), no mode toggle | ✅ Aligned |
| AI Planning Assistant | Slide-in panel within My Plan, not a workspace mode | Slide-in panel within My Plan (FR50) | ✅ Aligned |
| Inline editing in Reports | Always-on, no toggle, no gating | Always editable, computed cells read-only (FR7h) | ✅ Aligned |
| Impact Strip | Persistent sticky bar at bottom of My Plan | FR90-FR94 cover all Impact Strip requirements | ✅ Aligned |
| Guardian Bar | Three states (Healthy/Attention/Concerning), Gurple for advisory | FR88-FR89 cover advisory visual language | ✅ Aligned |
| Financial display | Monospace for figures, source badges, accounting parentheses | FR84-FR87 cover all display standards | ✅ Aligned |
| Document Preview | DRAFT watermark, completeness-aware labels | FR95-FR96 cover plan completeness and preview | ✅ Aligned |
| Bidirectional sync | Both surfaces write to same financial input state | FR97 covers bidirectional sync | ✅ Aligned |

**PRD and UX Spec are fully aligned** after the 2026-02-20 PRD correction. No UX requirements are missing from the PRD.

### UX ↔ Architecture Alignment

| Aspect | UX Spec | Architecture | Status |
|--------|---------|-------------|--------|
| Navigation model | Two sidebar destinations, no mode switcher | Line 77: "All three modes write to the same financial input state" — **three modes** language | ❌ Misaligned |
| Component naming | My Plan forms + Reports tabbed statements | Line 704-706: `<StoryModeChat>`, `<NormalModeForm>`, `<ExpertModeGrid>` — **mode-based naming** | ❌ Misaligned |
| AI assistant | Slide-in panel within My Plan | Architecture describes split-screen layout as a workspace mode | ⚠️ Partially misaligned |
| Financial engine | Pure TypeScript module | Architecture specifies `shared/financial-engine.ts` | ✅ Aligned |
| JSONB per-field metadata | Source badges, brand defaults | Architecture specifies `{value, source, last_modified_at, is_custom}` | ✅ Aligned |
| Auto-save | 2-second debounce, PATCH partial updates | Architecture specifies same pattern | ✅ Aligned |

### Alignment Issues

#### 🔴 Critical — Architecture Document References "Three Modes"

**architecture.md line 77:** "All three modes write to the same financial input state."
**architecture.md lines 704-706:** Component tree lists `<StoryModeChat>`, `<NormalModeForm>`, `<ExpertModeGrid>` as tier-specific input collection components.

The UX spec (2026-02-18) explicitly retired the three-mode model:
> "Mode switcher (Planning Assistant | Forms | Quick Entry) from original spec (2026-02-08). The segmented control mode switcher is retired. There are no user-facing 'modes.'"

**Impact:** Developers consulting the architecture document will implement mode-switching components that no longer exist in the design. The component names suggest three distinct UI surfaces when the actual architecture is two sidebar destinations (My Plan + Reports) with the AI assistant as a slide-in panel within My Plan.

**Recommendation:** Update architecture.md to:
1. Replace "three modes" with "two surfaces (My Plan + Reports)"
2. Rename components: `<StoryModeChat>` → `<AIPlanningAssistantPanel>`, `<NormalModeForm>` → `<MyPlanForms>`, `<ExpertModeGrid>` → removed (replaced by Reports inline editing)
3. Update component tree to reflect the two-door sidebar navigation model

### Warnings

- The architecture document's "Additional Requirements from UX Design Specification" section (epics.md lines 169-189) still references the original spec's concepts: "Direction F (Hybrid Adaptive) layout: sidebar collapses in Planning Assistant for immersion" and "Mode switcher: segmented control (Planning Assistant | Forms | Quick Entry) always visible." These should be updated to match the consolidated UX spec.

---

## Step 5: Epic Quality Review

### Epic Structure Validation

#### A. User Value Focus

| Epic | Title | User Value? | Assessment |
|------|-------|------------|------------|
| Epic 1 | Auth, Onboarding & User Management | ✅ | Users can create accounts, log in, and get started |
| Epic 2 | Brand Configuration & Administration | ✅ | Admins can set up brands for franchisees |
| Epic 3 | Financial Planning Engine | ⚠️ | Borderline — "engine" is technical, but delivers user-visible projections |
| Epic 4 | Forms & Quick Entry Experience | ⚠️ | Title uses retired "Quick Entry" terminology |
| Epic 5 | Financial Statement Views & Output Layer | ✅ | Users can view and interact with financial statements |
| Epic 6 | Document Generation & Vault | ✅ | Users can generate and download business plans |
| Epic 7 | Per-Year Inputs & Multi-Plan Management | ✅ | Users can model growth trajectories and manage multiple plans |
| Epic 8 | Advisory Guardrails & Smart Guidance | ✅ | Users receive helpful guidance on their inputs |
| Epic 9 | AI Planning Advisor | ✅ | Users can converse with AI to build plans |
| Epic 10 | Scenario Comparison | ✅ | Users can compare scenarios |
| Epic 11 | Data Sharing, Privacy & Pipeline Dashboards | ✅ | Users control data sharing; admins see dashboards |
| Epic 12 | Advisory Board Meeting (Phase 2) | ✅ | Deferred — users stress-test plans with AI personas |
| Epic ST | Admin Support Tools | ✅ | Admins can impersonate and demo |

**Finding:** Epic 3 is borderline technical but acceptable — the financial engine is the product's core value proposition and directly delivers user-visible outputs. Epic 4 title uses retired "Quick Entry" terminology.

#### B. Epic Independence

| Epic Pair | Independence | Notes |
|-----------|-------------|-------|
| Epic 1 → Epic 2 | ✅ | Epic 2 needs auth from Epic 1 (correct dependency direction) |
| Epic 2 → Epic 3 | ✅ | Epic 3 needs brand parameters from Epic 2 (correct) |
| Epic 3 → Epic 4 | ✅ | Epic 4 needs financial engine from Epic 3 (correct) |
| Epic 4 → Epic 5 | ✅ | Epic 5 needs EditableCell and planning workspace from Epic 4 (correct) |
| Epic 5 → Epic 6 | ✅ | Epic 6 needs financial outputs from Epic 5 (correct) |
| Epic 5 → Epic 7 | ✅ | Epic 7 builds on Epic 5's statement views (correct) |
| Epic 5 → Epic 8 | ✅ | Epic 8 needs financial outputs for advisory analysis (correct) |
| Epic 4 → Epic 9 | ✅ | Epic 9 needs planning workspace from Epic 4 (correct) |
| Epic ST → Epic 11 | ✅ | Story ST-4 depends on Epic 11 franchisor dashboard (documented, correct) |

**No forward dependencies found.** Epic ordering is correct — each epic depends only on earlier epics.

### Story Quality Assessment

#### 🟡 Minor — Epic 4 Internal Consistency

Epic 4 stories (4.1-4.6) still reference the old conceptual model:
- Story 4.1: "segmented control mode switcher shows 'Planning Assistant | Forms | Quick Entry'"
- Story 4.1: "Direction F (Hybrid Adaptive) layout... sidebar collapses in Planning Assistant mode"
- Story 4.3: "Quick Entry mode" as a separate interaction paradigm

However, Epic 5 (Story 5.2 dev notes, line 1010) explicitly states: "Any mode switcher UI from Epic 4 is explicitly removed." And Story 5.6 dev notes (line 1243) state: "The old quick-entry-mode.tsx flat grid component is retired."

**Impact:** Epic 4 stories describe building UI components (mode switcher, Quick Entry grid) that Epic 5 stories then remove. This means:
1. The mode switcher built in Story 4.1 is torn out in Story 5.2
2. The Quick Entry grid built in Stories 4.3-4.4 is replaced by Reports inline editing in Stories 5.3-5.4
3. Developer time is spent building and then removing these components

**Recommendation:** Epic 4 stories should be updated to align with the two-surface architecture. Story 4.1 should describe the My Plan workspace and sidebar navigation instead of a mode switcher. Stories 4.3-4.4 (Quick Entry) could be merged into Epic 5 as the inline editing functionality within Reports statement tabs, since that is where the grid editing behavior now lives.

#### ✅ Story Acceptance Criteria Quality

All stories across all epics use proper Given/When/Then BDD format with:
- Clear testable outcomes
- Error condition coverage
- Specific values and thresholds (e.g., "< 2 seconds", "200ms")
- NFR cross-references

Story quality is excellent throughout. No vague criteria found.

#### ✅ Database/Entity Creation Timing

Tables are created when first needed:
- Story 1.1 creates auth tables (users, sessions, invitations)
- Story 2.1 creates brand tables
- Story 3.1 creates plans table
- Story 6.2 creates documents table

No "create all tables upfront" anti-pattern found.

### Best Practices Compliance Summary

| Check | Status |
|-------|--------|
| Epics deliver user value | ✅ (Epic 3 borderline acceptable) |
| Epics function independently | ✅ No forward dependencies |
| Stories appropriately sized | ✅ All stories are 1-3 sprint completable |
| No forward dependencies | ✅ |
| Database tables created when needed | ✅ |
| Clear acceptance criteria | ✅ BDD format throughout |
| Traceability to FRs maintained | ⚠️ Map stale (87 of 111 listed) |

### Quality Violations Summary

#### 🔴 Critical Violations
None.

#### 🟠 Major Issues
1. **FR Coverage Map stale:** 24 FRs (FR74-FR97) missing from the map. Map claims 87/87 but PRD has 111.
2. **FR12 text stale in epics:** Requirements Inventory and Coverage Map use old "three experience tiers" language.

#### 🟡 Minor Concerns
1. **Epic 4 / Epic 5 build-then-remove:** Epic 4 stories build mode switcher and Quick Entry grid that Epic 5 immediately retires. Wasted effort unless Epic 4 is updated.
2. **Epic 4 title uses retired terminology:** "Forms & Quick Entry Experience" — "Quick Entry" no longer exists as a concept.
3. **Architecture "Additional Requirements from UX Design Specification" section in epics** references the original spec's three-mode model.

---

## Step 4.5: Architecture Document Alignment

### Architecture ↔ PRD Alignment

| Aspect | Architecture | PRD | Status |
|--------|-------------|-----|--------|
| Auth model | Dual: Google OAuth + invitation-based | FR31: same | ✅ |
| RBAC | Three-layer (route, query, projection) | FR32, NFR9, NFR10 | ✅ |
| Financial engine | Pure TS module, `shared/financial-engine.ts` | FR8-FR10, deterministic | ✅ |
| JSONB per-field metadata | `{value, source, last_modified_at, is_custom}` | FR2, FR3, FR87 | ✅ |
| Auto-save | 2s debounce, PATCH partial | FR17, NFR13 | ✅ |
| PDF storage | PostgreSQL metadata + Object Storage for binaries | FR24-FR27, NFR18 | ✅ |
| Session management | PostgreSQL-backed, `connect-pg-simple` | NFR8 | ✅ |
| Conceptual model | "Three modes" | "Two surfaces + tiers" | ❌ **Misaligned** |
| Component naming | StoryModeChat, NormalModeForm, ExpertModeGrid | N/A (PRD doesn't name components) | ⚠️ Stale vs UX spec |

### Architecture ↔ Epics Alignment

The architecture's component tree (lines 704-706) lists `<StoryModeChat>`, `<NormalModeForm>`, `<ExpertModeGrid>` as tier-specific input components. Epic 5 stories explicitly retire this component structure:
- Story 5.2 dev notes: "Any mode switcher UI from Epic 4 is explicitly removed."
- Story 5.6 dev notes: "The old quick-entry-mode.tsx flat grid component is retired."

**The architecture document is the most outdated planning artifact.** It was written before the UX consolidation (2026-02-18) and has not been updated to reflect the two-surface model.

---

## Environment Readiness

### Database: READY
PostgreSQL database is provisioned. DATABASE_URL, PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE environment variables are all configured as secrets.

### Secrets & Configuration: GAPS FOUND
- `SESSION_SECRET`: ✅ Configured
- `ADMIN_EMAIL`: ✅ Configured (admin@katalyst.io)
- `REPLIT_DOMAINS` / `REPLIT_DEV_DOMAIN` / `REPL_ID`: ✅ Configured (platform-managed)
- Google OAuth credentials (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`): ❓ Not found — architecture specifies Google OAuth via `passport-google-oauth20`. These may be needed for Katalyst admin authentication.
- AI/LLM API key (e.g., `OPENAI_API_KEY`): ❓ Not found — Epic 9 (AI Planning Advisor) will require LLM API credentials. Not needed until Epic 9 implementation.

### Deployment: NOT CONFIGURED
No deployment configuration found. This is expected for a project still in active development.

### Codebase Health: ISSUES FOUND (brownfield)
- **LSP errors:** 0
- **LSP warnings:** 0
- **Tech debt markers (project source):** 21 — all in `shared/help-content/field-help.ts`, all are `TODO: Extract from Loom video content` placeholders for expanded guidance text. These are content TODOs, not code debt.

### Integrations: GAPS FOUND
No Replit integrations are currently configured. The architecture references:
- PostgreSQL (provisioned via built-in database — ✅)
- Google OAuth (no integration configured — ⚠️ credentials needed before Epic 1)
- LLM/AI service (no integration configured — ⚠️ credentials needed before Epic 9)
- Replit Object Storage (for PDF binaries — ⚠️ not yet configured, needed for Epic 6)

---

## Summary and Recommendations

### Overall Readiness Status

**NEEDS WORK** — The PRD is fully aligned and comprehensive. The epics have strong story quality with excellent acceptance criteria. However, there are significant document alignment gaps between the architecture, the epics FR Coverage Map, and the corrected PRD/UX spec that will cause confusion during implementation.

### Critical Issues Requiring Immediate Action

1. **Architecture document misalignment (🔴):** `architecture.md` still references "three modes" and names components (`StoryModeChat`, `NormalModeForm`, `ExpertModeGrid`) that have been retired by the consolidated UX spec. Developers reading the architecture document will get a fundamentally wrong picture of the navigation model.

2. **Epics FR Coverage Map stale (🟠):** 24 FRs (FR74-FR97) are covered in story content but not listed in the FR Coverage Map. The map claims "87/87" when the PRD has 111 FRs. This breaks traceability.

3. **Epics Requirements Inventory section stale (🟠):** The Requirements Inventory at the top of `epics.md` (lines 24-165) copies old PRD text for FR12, FR50, FR54, and NFR24/NFR27. These should be updated to match the corrected PRD language.

### Recommended Next Steps

1. **Update `architecture.md`:** Replace three-mode language with two-surface model. Update component tree to reflect My Plan + Reports + AI slide-in panel architecture. This is the highest-priority fix because developers reference this document daily.

2. **Update `epics.md` FR Coverage Map:** Add FR74-FR97 to the coverage map. Correct the coverage summary from "87/87" to "111/111". Update FR12 description in both the Requirements Inventory and Coverage Map.

3. **Reconcile Epic 4 stories with Epic 5 architecture:** Either update Epic 4 stories to build the two-surface components directly (avoiding build-then-remove waste), or add explicit dev notes to Epic 4 stories noting that mode switcher and Quick Entry grid are scaffolding that will be replaced in Epic 5.

4. **Configure Google OAuth integration:** Google OAuth credentials (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) are required for Epic 1 (Katalyst admin authentication). Set these up before starting Epic 1 implementation.

5. **Optional: Add FR for Scenario Comparison:** Quick Scenario Comparison (Story 5.7) is in MVP scope but has no dedicated FR in the PRD. Consider adding FR98 to formalize this capability.

### Final Note

This assessment identified **5 issues** across **3 categories** (architecture misalignment, traceability gaps, environment gaps). The 2 critical issues (#1 architecture document, #2 coverage map) should be addressed before starting new implementation work, as they will cause developer confusion. The PRD itself is in excellent shape after the 2026-02-20 alignment work — all 111 FRs are aligned with the UX spec's two-surface architecture, and all are substantively covered in epic story content. Story quality is excellent throughout with proper BDD acceptance criteria, clear dependencies, and comprehensive dev notes.
