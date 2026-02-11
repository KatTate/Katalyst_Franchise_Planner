# Sprint Change Proposal: Admin Support Tools — Impersonation & Demo Modes

**Date:** 2026-02-11
**Trigger:** Product owner request during Epic 3 development + testing validation need
**Change Scope:** Moderate — New Standalone Epic (Direct Adjustment)
**Proposed By:** Scrum Master (Bob) via Correct Course workflow with Party Mode review
**Review Method:** BMAD Party Mode (Classic) — John (PM), Winston (Architect), Sally (UX), Bob (SM), Mary (BA)

---

## Section 1: Issue Summary

**Problem Statement:**
During Epic 3 (Financial Planning Engine) development, the product owner identified the need for Katalyst admins to view the system from a franchisee's or franchisor's perspective. This need emerged from two converging triggers:

1. **Development/QA validation gap:** No way to verify the franchisee experience without logging in as a franchisee. The admin sees admin UI, not what the client sees. This blocks effective code review validation for Story 3.5 and all subsequent franchisee-facing work.
2. **Product need for support workflows:** Katalyst admins do shoulder-to-shoulder work with clients. They need to see exactly what the client sees, with the client's real data, and optionally make edits on their behalf.
3. **Sales/training need:** Katalyst admins demo the platform to prospective franchisors and franchisees. They need curated demo experiences that showcase the platform without using real client data.

**Evidence:**
- No "View As" or impersonation capability exists in any planned epic (verified against all FRs and stories)
- FR47 ("Katalyst admin can view individual franchisee plan details for operational support") provides admin-context read-only viewing, not role simulation — complementary but not sufficient
- Current RBAC (Story 1.5, done) enforces strict role boundaries with no override mechanism
- Franchisor user visibility gap identified: brand detail page has a Franchisees tab but no Franchisor Users tab; franchisor admins are only visible in the Invitations page

**Issue Category:** New requirement emerged from stakeholder (product owner)

---

## Section 2: Impact Analysis

### Epic Impact

| Epic | Impact | Details |
|------|--------|---------|
| Epic 1 (Auth, RBAC) | **LOW** | RBAC middleware (Story 1.5) needs a controlled override path for impersonation. No rework — additive change to the middleware. |
| Epic 2 (Brand Config) | **LOW** | Brand card in brand management screen gains a "Enter Franchisee Demo Mode" button entry point. Minor UI addition. |
| Epic 3 (Financial Engine) | **NONE** | Engine is role-agnostic. API routes already use `req.user` scoping — impersonation modifies `req.user` resolution, not route logic. |
| Epics 4-7 | **NONE** | Franchisee-facing features will automatically work under impersonation if implemented at the middleware layer. |
| Epic 8 (Dashboards) | **LOW** | FR47 clarification needed to distinguish admin-context viewing from role simulation. Franchisor impersonation deferred until this epic delivers franchisor dashboard UI. |
| Epic 9 | **NONE** | No impact. |

### Story Impact

| Story | Impact | Details |
|-------|--------|---------|
| Story 1.5 (RBAC) | **LOW** | Middleware gains `getEffectiveUser(req)` helper; `requireRole` respects impersonation context |
| Story 2.3 (Brand Theming) | **NONE** | Impersonated view inherits the franchisee's brand theming automatically |
| Story 3.5+ (Financial APIs) | **NONE** | Routes use `req.user` — impersonation changes resolution, not route code |
| Story 8.2 (Franchisor Dashboard) | **DEFERRED** | Franchisor impersonation deferred until this story delivers the franchisor UI |

### Artifact Conflicts

| Artifact | Impact | Sections Affected |
|----------|--------|------------------|
| **prd.md** | **MODERATE** | New FR section (12), NFR9 amendment, NFR10 amendment, new NFR, Role Access Matrix update, FR47 clarification |
| **epics.md** | **MODERATE** | New epic section with 4 stories, FR coverage map additions, NFR amendments |
| **architecture.md** | **LOW** | Session model documentation, middleware impersonation pattern, audit logging |
| **ux-design-specification.md** | **LOW** | Impersonation banner spec, demo banner spec, entry point descriptions |

---

## Section 3: Recommended Approach

**Selected Path:** Option 1 — Direct Adjustment (New Standalone Epic)

**Justification:**
- This is purely additive — no existing work needs modification or rollback
- A standalone epic keeps completed Epic 1 clean
- The session impersonation mechanism is a well-understood architectural pattern (dual-identity on session)
- Stories 1 and 2 of the new epic are needed immediately to validate Story 3.5 code review and all subsequent franchisee-facing work
- Stories 3 and 4 (demo modes) build on the same session mechanism and can follow naturally

**Effort Estimate:** Medium — 4 stories across infrastructure, UI, and data seeding
**Risk Level:** Low — additive feature, well-understood pattern, no rework of existing code
**Timeline Impact:** Inserts before remaining Epic 3 backlog (Stories 3.5-3.7). Stories ST-1 and ST-2 are immediate priority. Stories ST-3 and ST-4 can be sequenced after or interleaved.

---

## Section 4: Detailed Change Proposals

### 4.1 PRD Changes (prd.md)

#### Change P-1: New FR Section 12 (insert after line 741, after Section 11 Advisory Board Meeting)

**NEW:**
```markdown
### 12. Admin Support Tools: Impersonation & Demo Modes

_Scope: Katalyst admins only. Franchisors and franchisees never see or access these tools. Franchisor impersonation is deferred until Epic 8 delivers the franchisor dashboard UI and a Franchisor Users admin view exists._

**12a. View As — Franchisee Impersonation**

- **FR59:** Katalyst admin can activate "View As" mode for any franchisee by clicking a "View As" button in the franchisee's row on the brand detail Franchisees tab; the system loads that franchisee's home page with their real data and role-scoped access boundaries
- **FR60:** While in "View As" mode, the existing application header bar transforms into a high-contrast impersonation banner (neon construction orange) displaying: the franchisee's name, their role, current mode (read-only or editing), and an "Exit View As" button that returns the admin to the brand detail page they came from
- **FR61:** "View As" mode is read-only by default; an "Enable Editing" toggle in the impersonation banner requires an explicit confirmation dialog ("You will be able to modify [Franchisee Name]'s data. Continue?") before activating; once editing is enabled, the impersonation banner pulsates to provide a persistent visual alert that edits are live
- **FR62:** While editing is enabled, the admin can perform the same actions the impersonated franchisee could perform (edit financial inputs, add startup cost line items, etc.) but cannot perform destructive account-level actions (delete the user's account, revoke their invitation, change their role, or reassign their brand)
- **FR63:** Edits made while impersonating are attributed in the per-field metadata source field using a structured format (e.g., "admin:[admin_name]") distinct from existing source values ("brand_default", "user_entry", "ai_populated"), and each impersonation edit session is logged in an audit record containing: admin identity, impersonated user, session start/end timestamps, and summary of actions taken
- **FR64:** "View As" impersonation state is stored in the server session and is scoped to that session only — it terminates on logout, session expiry, or when the admin clicks "Exit View As"; impersonation state is never persisted beyond the active session
- **FR65:** During impersonation, the RBAC middleware resolves data queries using the impersonated user's identity and access scope while preserving the admin's real identity for audit purposes; NFR9 (endpoint RBAC) and NFR10 (DB-level data isolation) remain enforced — the admin sees exactly what the impersonated user is authorized to see, nothing more

**12b. Demo Mode — Franchisee (Per Brand)**

- **FR66:** Each brand has a demo franchisee account pre-populated with that brand's default financial parameters and startup cost template; this account is system-managed and cannot be invited, deleted, or assigned to a real user
- **FR67:** Katalyst admin can activate Franchisee Demo Mode by clicking "Enter Franchisee Demo Mode" on the brand card in the brand management screen; the system loads the demo franchisee's home page with brand-default data
- **FR68:** While in Franchisee Demo Mode, the application header displays a visually distinct demo banner (different color from the orange impersonation banner) indicating "Demo Mode: [Brand Name] — Franchisee View" with an "Exit Demo" button; this banner must contrast with the impersonation banner to clearly communicate that the admin is in a safe sandbox with no real user data at risk
- **FR69:** Franchisee Demo Mode is fully interactive — the admin can edit demo financial inputs, add line items, and experience the full franchisee workflow; changes to demo data do not affect any real user data and can be reset to brand defaults

**12c. Demo Mode — Franchisor (Fictitious Brand)**

- **FR70:** The system includes a pre-seeded fictitious demo brand (e.g., "Bob's Burgers" or similar lighthearted brand) with a complete franchisor demo environment: brand identity, financial parameters, startup cost template, and multiple demo franchisees at various planning states and statuses
- **FR71:** Katalyst admin can activate Franchisor Demo Mode via a "Demo Mode" menu item in the Katalyst admin sidebar; the system loads the fictitious brand's franchisor dashboard as the demo franchisor would see it, with the pipeline of demo franchisees
- **FR72:** From within Franchisor Demo Mode, the admin can click into any demo franchisee to enter that franchisee's planning experience (Franchisee Demo within Franchisor Demo), with the demo banner updating to reflect the nested context; exiting the nested franchisee demo returns to the franchisor demo dashboard
- **FR73:** While in Franchisor Demo Mode, the application header displays a demo banner indicating "Demo Mode: [Fictitious Brand] — Franchisor View" with an "Exit Demo" button; the demo banner is visually distinct from the impersonation banner (FR60) and uses the same demo color scheme as Franchisee Demo Mode (FR68)
```

**Rationale:** 15 FRs organized into three sub-sections covering impersonation (FR59-FR65), per-brand franchisee demo (FR66-FR69), and franchisor demo with fictitious brand (FR70-FR73). Each FR is specific enough to write acceptance criteria from. Franchisor impersonation explicitly deferred.

#### Change P-2: NFR9 Amendment (line 758)

**OLD:**
```
- **NFR9:** Every API endpoint enforces role-based access control — no endpoint returns data the requesting user's role should not see
```

**NEW:**
```
- **NFR9:** Every API endpoint enforces role-based access control — no endpoint returns data the requesting user's role should not see. During admin impersonation (FR59-FR65), RBAC is enforced using the impersonated user's role and scope, not the admin's; the admin's real identity is preserved separately for audit purposes.
```

**Rationale:** Impersonation modifies how RBAC resolves the "current user" without bypassing RBAC itself. The amendment makes this explicit.

#### Change P-3: NFR10 Amendment (line 759)

**OLD:**
```
- **NFR10:** Franchisee data isolation enforced at the database query level — queries always scoped to the authenticated user's permissions, not filtered after retrieval
```

**NEW:**
```
- **NFR10:** Franchisee data isolation enforced at the database query level — queries always scoped to the authenticated user's permissions, not filtered after retrieval. During admin impersonation, queries are scoped to the impersonated user's data boundaries; the admin does not gain broader data access than the impersonated user would have.
```

**Rationale:** Makes explicit that impersonation narrows admin access to the target user's scope rather than widening it.

#### Change P-4: New NFR (insert after NFR27, line 788)

**NEW:**
```
- **NFR28:** Impersonation sessions have a maximum duration limit (configurable, default 60 minutes) after which the session automatically reverts to admin view, requiring re-activation for continued impersonation
- **NFR29:** All impersonation and demo mode API endpoints (start, stop, status, reset) are restricted to the `katalyst_admin` role; audit log records for impersonation edit sessions are retained for a minimum of 90 days
```

**Rationale:** Security safeguard — prevents indefinite impersonation sessions that could be left open accidentally.

#### Change P-5: Role Access Matrix Update (line 458)

**OLD:**
```
| **Katalyst Admin** | All data across all franchisees and all brands | Brand parameter setup, startup cost template creation, franchisee invitation/provisioning, model validation, cross-brand views | Admin dashboard with configuration tools |
```

**NEW:**
```
| **Katalyst Admin** | All data across all franchisees and all brands; impersonation scopes view to target user's data boundaries | Brand parameter setup, startup cost template creation, franchisee invitation/provisioning, model validation, cross-brand views, "View As" impersonation of any franchisee (FR59-FR65), Franchisee Demo Mode per brand (FR66-FR69), Franchisor Demo Mode with fictitious brand (FR70-FR73) | Admin dashboard with configuration tools; impersonation banner (orange) and demo banner (distinct color) indicate active mode |
```

**Rationale:** Updates all three columns (Data Access, Actions, UX) to reflect impersonation and demo capabilities.

#### Change P-6: FR47 Clarification Note (for Epic 8 story writing)

**ADD NOTE** near FR47 (line ~721):
```
_Note: FR47 provides a read-only admin-context view of a franchisee's plan data within the Katalyst admin dashboard. FR59 (View As) provides full role-simulation where the admin sees the franchisee's own UI as the franchisee would experience it. These are complementary — FR47 is for quick operational review, FR59 is for support and validation._
```

**Rationale:** Prevents confusion during Epic 8 story writing about overlap between FR47 and FR59.

### 4.2 Epics Changes (epics.md)

#### Change E-1: New Epic Section (insert after Epic 8, before Epic 9)

**NEW:**
```markdown
---

## Epic ST: Admin Support Tools — Impersonation & Demo Modes

Katalyst admins need tools to validate the franchisee/franchisor experience, support clients shoulder-to-shoulder, and demo the platform to prospects. This epic delivers "View As" impersonation for real user data, per-brand franchisee demo mode, and a franchisor demo mode with a fictitious brand.

**Scope:** Katalyst admins only. Franchisors and franchisees never see or access these tools.
**Dependency:** Stories ST-1 and ST-2 have no external dependencies. Story ST-3 depends on brand financial parameters (Epic 2, done). Story ST-4 is blocked until Epic 8 delivers the franchisor dashboard — it should not be started until Story 8.2 is complete.

**Priority:** Stories ST-1 and ST-2 are immediate — needed for validating Epic 3 code reviews and all subsequent franchisee-facing work. Stories ST-3 and ST-4 follow.

**FRs covered:** FR59, FR60, FR61, FR62, FR63, FR64, FR65, FR66, FR67, FR68, FR69, FR70, FR71, FR72, FR73
**NFRs addressed:** NFR9 (amended), NFR10 (amended), NFR28 (new), NFR29 (new)

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
**And** the impersonation session has a maximum duration (configurable, default 60 minutes) after which it auto-reverts (NFR28)
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
```

**Rationale:** 4 stories covering the full scope. ST-1 and ST-2 are the immediate priority for development validation. ST-3 and ST-4 build on the same session mechanism. Story ST-4 has a soft dependency on Epic 8 (franchisor dashboard) but can be built in parallel.

#### Change E-2: FR Coverage Map Additions (insert after FR58 row, line ~245)

**NEW:**
```
| FR59-FR65 | Epic ST | Admin "View As" impersonation of franchisees |
| FR66-FR69 | Epic ST | Per-brand Franchisee Demo Mode |
| FR70-FR73 | Epic ST | Franchisor Demo Mode with fictitious brand |
```

**Rationale:** Maps new FRs to the new epic in the coverage table.

#### Change E-3: NFR Amendments (matching PRD changes P-2, P-3, P-4)

Apply the same NFR9, NFR10 amendments and NFR28 addition as described in PRD changes P-2, P-3, P-4.

### 4.3 Architecture Changes (architecture.md)

#### Change A-1: Session Model (add to Decision 3: Authentication Model)

**ADD:**
```
**Impersonation Session Model:**
- Admin impersonation stored as `impersonating_user_id` on the server session object
- Helper function `getEffectiveUser(req)` returns the impersonated user for data access when impersonation is active, or `req.user` when not
- `req.user` always contains the real admin identity for audit purposes
- Impersonation state stored in PostgreSQL session store (survives server restarts within session TTL)
- Maximum impersonation duration enforced server-side (configurable, default 60 minutes)
- Demo mode uses the same mechanism with synthetic user targets
```

**Rationale:** Documents the architectural pattern for implementers.

#### Change A-2: API Endpoints (add to Auth section)

**ADD:**
```
Impersonation:
  POST   /api/admin/impersonate/:userId    (Start impersonation — Katalyst admin only)
  POST   /api/admin/impersonate/stop       (End impersonation — return to admin view)
  GET    /api/admin/impersonate/status      (Current impersonation state)

Demo Mode:
  POST   /api/admin/demo/franchisee/:brandId  (Enter Franchisee Demo Mode for brand)
  POST   /api/admin/demo/franchisor            (Enter Franchisor Demo Mode)
  POST   /api/admin/demo/exit                  (Exit any demo mode)
  POST   /api/admin/demo/reset/:brandId        (Reset demo data to brand defaults)
```

**Rationale:** Explicit API surface for impersonation and demo mode management.

### 4.4 UX Design Specification Changes (ux-design-specification.md)

#### Change UX-1: Impersonation Banner Specification

**ADD:**
```
**Impersonation Banner (View As Mode):**
- Reuses the existing application header bar — no new layout elements
- Background: neon construction orange (#FF6D00 or similar high-contrast orange)
- Content: "[Franchisee Name] — Franchisee | Read-Only Mode | [Enable Editing toggle] | [Exit View As button]"
- When editing is enabled: banner pulsates (CSS animation), text changes to "Editing Enabled"
- Exit button returns admin to the brand detail Franchisees tab
- Must contrast with all brand accent colors (several brands use red accents — orange avoids conflict)

**Demo Mode Banner:**
- Same header bar reuse pattern as impersonation banner
- Background: visually distinct from orange impersonation banner (color TBD — blue, purple, or teal recommended)
- Content: "Demo Mode: [Brand Name] — [Franchisee/Franchisor] View | [Exit Demo button]"
- No pulsating effect — demo mode is always safe/sandboxed
- Nested demo context updates the banner text but keeps the same color
```

**Rationale:** Visual language is safety-critical. Orange pulsating = real data with editing risk. Demo color = sandbox, no risk.

---

## Section 5: Implementation Handoff

**Change Scope:** Moderate — New Standalone Epic
**Handoff:** Development team (Amelia) for direct implementation

**Action Plan:**
1. Apply all text edits from Section 4 to the four planning artifacts (prd.md, epics.md, architecture.md, ux-design-specification.md)
2. Update sprint-status.yaml with new Epic ST and 4 stories
3. Begin Story ST-1 implementation immediately via create-story workflow
4. Story ST-2 follows ST-1 (depends on impersonation infrastructure)
5. Stories ST-3 and ST-4 can be sequenced after ST-2 or deferred based on sprint capacity

**Story Priority:**
- **ST-1 (View As Infrastructure):** Immediate — needed for Story 3.5 code review validation
- **ST-2 (Edit Mode & Audit):** Immediate — completes the support workflow
- **ST-3 (Franchisee Demo):** Next — after ST-1/ST-2, builds on same mechanism
- **ST-4 (Franchisor Demo):** Follows — soft dependency on Epic 8 franchisor dashboard

**Success Criteria:**
- All planning artifacts consistently describe the impersonation and demo mode features
- FR59-FR73 are assigned to Epic ST in the coverage map
- NFR9, NFR10 are amended to address impersonation
- NFR28 is added for impersonation session limits
- NFR29 is added for admin-only endpoint gating and audit log retention
- Sprint status reflects the new epic with correct story sequencing
- No confusion between FR47 (admin-context view) and FR59 (role simulation)

**Identified Gaps (flagged, not blocking):**
- Brand detail page lacks a "Franchisor Users" tab — franchisor admins only visible in Invitations. Franchisor impersonation deferred until this gap and Epic 8 franchisor dashboard are addressed.
- Demo banner color (for demo modes) to be finalized during UX implementation — must be distinct from orange impersonation banner.

---

## Approval

**Status:** PENDING — Awaiting product owner approval
