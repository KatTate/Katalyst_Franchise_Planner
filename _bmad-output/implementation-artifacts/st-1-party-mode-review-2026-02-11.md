# BMAD Party Mode Review — Story ST.1: View As Infrastructure & Read-Only Mode

**Review Method:** BMAD Party Mode (Classic)
**Date:** 2026-02-11
**Agents Assembled:** John (PM), Winston (Architect), Sally (UX), Bob (SM), Amelia (Dev)
**Story File:** `_bmad-output/implementation-artifacts/st-1-view-as-infrastructure-read-only-mode.md`
**Story Status:** ready-for-dev

---

## Overall Verdict: APPROVED FOR DEVELOPMENT

Story ST.1 is well-crafted, architecturally sound, and ready for implementation. All five agents approved the story with minor non-blocking recommendations.

---

## Agent Reviews

### John (PM) — Product Alignment

**Verdict: PASS**

FR/NFR traceability confirmed across all 10 acceptance criteria:

| AC | FR/NFR Coverage | Status |
|----|----------------|--------|
| AC1 — "View As" button on franchisee rows, katalyst_admin only | FR59 | Covered |
| AC2 — Impersonation loads franchisee home with real data | FR59 | Covered |
| AC3 — Sidebar hides admin items during impersonation | FR60 | Covered |
| AC4 — Orange banner with name, role, "Read-Only Mode", exit button | FR60 | Covered |
| AC5 — All inputs disabled; mutations rejected server-side | FR59, NFR9, NFR10 | Covered |
| AC6 — Exit returns admin to brand detail Franchisees tab | FR60 | Covered |
| AC7 — Logout/session expiry terminates impersonation | FR64 | Covered |
| AC8 — 60-minute max duration with auto-revert | NFR29 | Covered |
| AC9 — RBAC enforced using franchisee scope during impersonation | NFR9, NFR10 | Covered |
| AC10 — Admin identity preserved for audit | FR65 | Covered |

**Scope boundary with ST-2:** Correctly excludes FR61 (Enable Editing toggle), FR62 (edit actions), FR63 (edit audit logging). Dev notes enforce this with explicit anti-pattern: "DO NOT implement edit mode — that is Story ST-2."

**Business value:** Addresses the immediate development validation gap (cannot verify franchisee experience from admin login) and the shoulder-to-shoulder support workflow.

---

### Winston (Architect) — Technical Design

**Verdict: PASS**

Architecture alignment confirmed on all five key patterns:

1. **Dual-Identity Session Pattern** — `req.user` = real admin, `getEffectiveUser(req)` = impersonated user. Anti-pattern correctly prohibits overwriting `req.user`. Matches architecture.md "Impersonation Session Model."

2. **Session Storage** — `req.session.impersonating_user_id`, `req.session.impersonation_started_at`, `req.session.return_brand_id` on PostgreSQL-backed session store. No new tables. Matches architecture.md Decision 3.

3. **Middleware Chain** — `requireAuth` -> `requireRole` -> handler. `getEffectiveUser` called inside handlers and scoping functions, not as separate middleware. `requireReadOnlyImpersonation` middleware for mutation rejection. Matches architecture.md Decision 4.

4. **API Surface** — Three endpoints in `server/routes/admin.ts` under `/api/admin` prefix, all gated by `requireRole("katalyst_admin")`. Matches architecture.md API routes section.

5. **Integration Points** — Dev notes correctly identify `requirePlanAccess` (plans.ts:15-31), `scopeToUser`, `projectForRole` (rbac.ts) as requiring `getEffectiveUser` updates. Gotchas section covers session typing, timing of status checks, sidebar navigation, return URL, and concurrent sessions.

**Minor concern:** `getEffectiveUser` is async (requires DB lookup for impersonated user profile). This ripples to callsites but is manageable. Recommend request-level caching (`req._effectiveUser`) to avoid redundant DB queries within a single request.

---

### Sally (UX) — User Experience

**Verdict: PASS**

UI deliverables are well-specified and aligned with UX Design Specification:

1. **Impersonation Banner** — `#FF6D00` orange, white text, replaces existing header bar (no layout shift). WCAG AA contrast passes (~4.6:1). Layout: `[Name] — Franchisee | Read-Only Mode | [Exit View As]`.

2. **"View As" Button** — Ghost button with `Eye` icon on franchisee rows in `AccountManagerTab`. Only visible to `katalyst_admin`.

3. **Sidebar Transformation** — Admin items hidden, only franchisee navigation visible. Driven by `ImpersonationContext`.

4. **Read-Only Visual State** — `pointer-events-none opacity-60` on form containers. Dual-layer enforcement (frontend visual + backend rejection).

5. **UI States** — Loading (skeleton), error (toast), success (toast + transition), auto-revert (toast + redirect). Comprehensive.

**Minor suggestions:**
- Add `role="alert"` or `aria-live="assertive"` to impersonation banner for screen reader accessibility
- Return navigation is deterministic (always Franchisees tab) since the entry point is always from the Franchisees tab

---

### Bob (SM) — Story Quality & Dev Readiness

**Verdict: PASS — ready-for-dev confirmed**

| Criterion | Status |
|-----------|--------|
| Clear user story statement | PASS |
| 10 testable acceptance criteria | PASS |
| Comprehensive dev notes (architecture, UI/UX, anti-patterns, gotchas) | PASS |
| File change summary (11 files, action + notes) | PASS |
| Dependencies identified (none needed) | PASS |
| 9 anti-patterns documented | PASS |
| Scope boundary with ST-2 explicit | PASS |
| 12 source document references | PASS |

**Story sizing:** Medium-large. 11 files touched, 3 new API endpoints, 2 new React components, modifications to core middleware. Appropriate as a single story because all pieces are interdependent and the read-only constraint limits behavioral complexity.

---

### Amelia (Dev) — Implementation Feasibility

**Verdict: PASS — implementable as specified**

All 11 files reviewed against existing codebase. Integration points accurate. No missing dependencies.

**Recommended implementation order:**
1. `server/auth.ts` — session type augmentation
2. `server/middleware/auth.ts` — `getEffectiveUser` + `requireReadOnlyImpersonation`
3. `server/middleware/rbac.ts` — update `scopeToUser` / `projectForRole` callers
4. `server/routes/admin.ts` — 3 impersonation endpoints
5. `server/routes/plans.ts` — update `requirePlanAccess` + add read-only guards
6. `shared/schema.ts` — `ImpersonationStatus` type
7. `client/src/contexts/ImpersonationContext.tsx` — React context
8. `client/src/components/ImpersonationBanner.tsx` — orange banner
9. `client/src/components/brand/AccountManagerTab.tsx` — "View As" button
10. `client/src/components/app-sidebar.tsx` — conditional nav items
11. `client/src/App.tsx` — wrap with provider, render banner

**Key implementation notes:**
- `getEffectiveUser` is async (DB lookup) — add request-level cache (`req._effectiveUser`)
- Plan mutation endpoints (PATCH, PUT, POST) all need `requireReadOnlyImpersonation` guard
- Frontend auto-revert via `setTimeout` based on `remainingMinutes` from status endpoint

---

## Cross-Agent Recommendations (Non-Blocking)

1. **Concurrent tab behavior:** Auto-stop previous impersonation when starting a new one (less friction than erroring)
2. **Accessibility:** Add `aria-live="assertive"` to impersonation banner for screen readers
3. **Performance:** Cache `getEffectiveUser` result on request object to avoid redundant DB queries
4. **Return navigation:** Deterministic — always returns to Franchisees tab (entry point is always Franchisees tab)
5. **Testing:** Consider unit tests for `getEffectiveUser` helper and 60-minute timeout logic
6. **Timeout enforcement:** Frontend `setTimeout` for UX auto-revert; backend check as safety net. Lazy enforcement acceptable for MVP.

---

## Approval

**Status:** APPROVED FOR DEVELOPMENT
**Approved By:** John (PM), Winston (Architect), Sally (UX), Bob (SM), Amelia (Dev)
**Date:** 2026-02-11
**Next Action:** Proceed to implementation via dev agent (Amelia)
