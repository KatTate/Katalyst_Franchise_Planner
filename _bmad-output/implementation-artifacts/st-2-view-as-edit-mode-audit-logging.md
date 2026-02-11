# Story ST.2: View As Edit Mode & Audit Logging

Status: review

## Story

As a Katalyst admin in "View As" mode,
I want to optionally enable editing to make changes on a franchisee's behalf during a support session,
so that I can help clients directly without asking them to make changes themselves.

## Acceptance Criteria

1. While in "View As" read-only mode for a franchisee, the impersonation banner displays an "Enable Editing" toggle next to the mode label.
2. Clicking the "Enable Editing" toggle opens a confirmation dialog: "You will be able to modify [Franchisee Name]'s data. Continue?" with "Confirm" and "Cancel" buttons.
3. If I confirm, the impersonation banner begins pulsating with a CSS animation to visually alert me that edits are live.
4. The banner text updates to show "Editing Enabled" instead of "Read-Only Mode".
5. While editing is enabled, all form inputs, buttons, and actions that were previously disabled become interactive — I can perform the same actions the franchisee could perform (edit financial inputs, add startup cost line items, etc.).
6. I cannot perform destructive account-level actions even with editing enabled: I cannot delete the franchisee's account, revoke their invitation, change their role, or reassign their brand.
7. Edits I make are attributed in the per-field metadata `source` field using a structured format `"admin:[my_admin_display_name]"` — this is distinct from existing source values `"brand_default"`, `"user_entry"`, and `"ai_populated"`.
8. When an impersonation edit session is active (or ends), an audit record is created containing: my admin identity, the impersonated franchisee, session start timestamp, session end timestamp, and a summary of actions taken.
9. I can toggle editing off to return to read-only mode without exiting "View As" — the banner stops pulsating and the mode label reverts to "Read-Only Mode".
10. Toggling editing off or exiting "View As" ends the edit session and writes the audit record.

## Dev Notes

### Architecture Patterns to Follow

- **Dual-identity session pattern (established in ST-1):** `req.user` always holds the real admin. `getEffectiveUser(req)` returns the impersonated user for data scoping. ST-2 adds `req.session.impersonation_edit_enabled` boolean field to the session to track edit mode state.
  - Source: server/middleware/auth.ts — `getEffectiveUser`, `isImpersonating`, `requireReadOnlyImpersonation`
- **Session storage:** Edit mode state lives on the PostgreSQL-backed session object alongside existing impersonation fields. Add `impersonation_edit_enabled?: boolean` to `SessionData` in `server/types/session.d.ts`.
  - Source: server/types/session.d.ts — existing SessionData augmentation
- **`requireReadOnlyImpersonation` middleware:** Currently rejects ALL mutations during impersonation. Must be updated to check `req.session.impersonation_edit_enabled` — if true, allow mutations through. If false (or absent), reject mutations as before.
  - Source: server/middleware/auth.ts lines 92-117
- **Impersonation status endpoint:** The `GET /api/admin/impersonate/status` response already has a `readOnly` field (currently hardcoded to `true`). Must be updated to reflect `!req.session.impersonation_edit_enabled`.
  - Source: server/routes/admin.ts line 83
- **Impersonation start endpoint:** When starting a new impersonation, `impersonation_edit_enabled` should default to `false` (read-only by default, per FR61).
  - Source: server/routes/admin.ts lines 114-117
- **Audit log storage:** Create a new `impersonation_audit_logs` database table (Drizzle schema in `shared/schema.ts`). Fields: `id` (uuid, PK), `admin_user_id` (FK → users), `impersonated_user_id` (FK → users), `edit_session_started_at` (timestamp), `edit_session_ended_at` (timestamp, nullable — null while session is active), `actions_summary` (JSONB — array of action descriptions), `created_at` (timestamp). This is NOT a per-request log — it's a per-edit-session record that captures the window during which editing was enabled.
  - Source: architecture.md — "impersonation state stored in PostgreSQL session store"; PRD FR63, NFR30 (audit records retained 90 days)
- **Per-field metadata source attribution:** The financial input `FieldMetadata.source` field (in the `financial_inputs` JSONB on the plans table) currently accepts `'brand_default' | 'manual' | 'ai_populated'`. The `admin:[admin_name]` format is a string convention, NOT a new enum value — it uses a prefix pattern so downstream code can identify admin-sourced values via `source.startsWith('admin:')`.
  - Source: architecture.md lines 1076-1081 — FieldMetadata interface; epics.md ST-2 AC
- **API route organization:** New endpoints go in `server/routes/admin.ts` under the existing `/api/admin` prefix. Two new endpoints needed:
  - `POST /api/admin/impersonate/edit-mode` — toggles edit mode on/off (body: `{ enabled: boolean }`)
  - `GET /api/admin/audit-logs` — lists impersonation audit logs (katalyst_admin only, for future admin dashboard use)
  - Source: server/routes/admin.ts — existing impersonation endpoints
- **Frontend state:** The `ImpersonationContext` already has `readOnly` in its state. When `readOnly` changes to `false`, the frontend removes the `pointer-events-none opacity-60` overlay from the main content area.
  - Source: client/src/contexts/ImpersonationContext.tsx — `ImpersonationContextValue.readOnly`
- **Destructive action guard:** Even with editing enabled, certain routes must remain blocked during impersonation. These include: `DELETE /api/users/:id`, role change endpoints, brand reassignment. Implement as an additional check in the `requireReadOnlyImpersonation` middleware (rename or add a parallel middleware) that always blocks these specific destructive paths regardless of edit mode.

### UI/UX Deliverables

- **"Enable Editing" toggle:** Rendered in the impersonation banner (`ImpersonationBanner.tsx`) next to the mode label. Use a `Switch` component from shadcn/ui or a `Button` with toggle behavior. Only visible when impersonation is active.
  - Source: ux-design-specification.md lines 1086-1087 — "Enable Editing toggle" in banner content
- **Confirmation dialog:** Standard shadcn `AlertDialog` triggered when the toggle is switched ON. Content: "You will be able to modify [Franchisee Name]'s data. Continue?" with "Confirm" and "Cancel" actions. If the user cancels, the toggle reverts to OFF.
  - Source: epics.md ST-2 AC — "a confirmation dialog appears"
- **Banner pulsation:** When editing is enabled, the banner gains a CSS pulsation animation. Use a `@keyframes` animation that subtly pulses the banner opacity or background brightness. The pulsation must be noticeable but not nauseating — a gentle brightness cycle between the base `#FF6D00` and a slightly brighter/lighter variant (e.g., `#FF8F33`) over ~2 seconds.
  - Source: ux-design-specification.md line 1087 — "banner pulsates (CSS animation)"
- **Mode label update:** The banner text segment showing "Read-Only Mode" switches to "Editing Enabled" when edit mode is active. This is already partially wired — `ImpersonationBanner.tsx` line 11 uses `readOnly ? "Read-Only Mode" : "Editing Enabled"`.
- **Read-only overlay removal:** `App.tsx` currently applies `pointer-events-none opacity-60` to the `<main>` content when impersonation is active. This must be conditional on `readOnly` — only apply when impersonation is active AND `readOnly` is true.
  - Source: client/src/App.tsx — impersonation read-only overlay
- **UI states:**
  - Loading: Show pending state on the toggle button while the edit-mode API call is in flight
  - Error: Toast notification if toggling edit mode fails
  - Success: Banner starts/stops pulsating; toast "Editing enabled for [Name]" or "Returned to read-only mode"
  - Toggle off: Smooth transition back to read-only (re-apply overlay, stop pulsation)

### Anti-Patterns & Hard Constraints

- **DO NOT overwrite `req.user`** with the impersonated user. The dual-identity pattern requires `req.user` to always be the real admin. This constraint from ST-1 remains in effect.
- **DO NOT modify `server/vite.ts`** or `vite.config.ts` — these are forbidden per project guidelines.
- **DO NOT modify `package.json`** directly — use the packager tool for any dependency installs.
- **DO NOT modify `drizzle.config.ts`**.
- **DO NOT allow edit mode without active impersonation.** The edit-mode toggle endpoint must verify that impersonation is currently active before enabling editing.
- **DO NOT create a separate "edit mode impersonation" flow.** Edit mode is a toggle within the existing impersonation session, not a parallel impersonation mechanism.
- **DO NOT log individual field changes in the audit record.** The audit record captures the edit session window (start/end timestamps) and a high-level summary, not a per-field change log. Per-field attribution is handled by the `source` field in `FieldMetadata`.
- **DO NOT block ALL mutations when edit mode is enabled.** Only destructive account-level actions (account deletion, role changes, brand reassignment) remain blocked. Normal franchisee actions (editing financial inputs, managing startup costs) are allowed through.
- **DO NOT implement audit log UI in this story.** The `GET /api/admin/audit-logs` endpoint provides API access for future admin dashboard consumption. No frontend audit log viewer is needed in ST-2.
- **DO NOT use `localStorage`** for edit mode state. The state is server-session-only for security.

### Gotchas & Integration Warnings

- **Session type augmentation:** The `server/types/session.d.ts` file already augments `SessionData` with impersonation fields. Add `impersonation_edit_enabled?: boolean` to the same interface.
- **`requireReadOnlyImpersonation` behavioral change:** This middleware currently blocks ALL mutations during impersonation. After ST-2, it must conditionally allow mutations when `impersonation_edit_enabled` is true — EXCEPT for destructive account-level actions. The middleware logic changes from "is impersonation active? → block mutation" to "is impersonation active AND edit mode NOT enabled? → block mutation" plus "is the route a destructive action? → always block during impersonation regardless of edit mode."
- **Impersonation stop cleanup:** When `POST /api/admin/impersonate/stop` is called while edit mode is active, it must: (1) end the edit session audit record, (2) clear `impersonation_edit_enabled` from the session, (3) perform existing cleanup. Same for auto-revert on 60-minute timeout.
- **Audit record lifecycle:** The audit record is created when editing is toggled ON, and its `edit_session_ended_at` is set when editing is toggled OFF, impersonation is stopped, or the session expires. An edit session that is never explicitly stopped (e.g., session expires) should still have its end time set (to the expiry time or current time when detected).
- **ImpersonationStatus type update:** The `ImpersonationStatus` type in `shared/schema.ts` already has `readOnly: boolean` in the active variant. Ensure the status endpoint returns `readOnly: false` when edit mode is enabled. Also add `editingEnabled: boolean` as an explicit field for frontend clarity (so the frontend doesn't have to infer from `!readOnly`).
- **Frontend context update:** The `ImpersonationContext` needs a new `toggleEditMode` function alongside existing `startImpersonation` and `stopImpersonation`. This function calls `POST /api/admin/impersonate/edit-mode` with `{ enabled: boolean }` and refreshes the status query data.
- **Existing test suite:** ST-1 established 140 passing tests. The `requireReadOnlyImpersonation` tests in `server/middleware/auth.test.ts` will need updates to cover the new edit-mode-enabled path. Ensure no regressions.
- **Source field convention:** The `admin:[admin_name]` source value in `FieldMetadata` is a convention that the plan mutation endpoints must enforce. When a mutation is made during an impersonation edit session, the server should set the `source` field on modified fields to `admin:[req.user.displayName || req.user.email]` (using `req.user` — the real admin identity, NOT the effective user). This may require adjustments to the plan PATCH handler if it currently accepts client-provided `source` values.
- **Actions summary in audit log:** The `actions_summary` JSONB field can be structured as an array of strings like `["Enabled edit mode", "Modified financial inputs", "Added startup cost line item"]`. The server can append to this as mutations are processed, or it can be kept simple with just the edit session window for MVP. Start simple — just recording the edit session window (start/end) is the critical audit requirement. The detailed actions summary can be enhanced later.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `server/types/session.d.ts` | MODIFY | Add `impersonation_edit_enabled?: boolean` to SessionData |
| `shared/schema.ts` | MODIFY | Add `impersonation_audit_logs` Drizzle table, insert schema, and types. Update `ImpersonationStatus` active variant to include `editingEnabled: boolean` |
| `server/storage.ts` | MODIFY | Add `IStorage` methods for audit log CRUD: `createAuditLog`, `endAuditLog`, `getAuditLogs` |
| `server/middleware/auth.ts` | MODIFY | Update `requireReadOnlyImpersonation` to check `impersonation_edit_enabled` session field; add destructive-action guard that blocks certain routes regardless of edit mode |
| `server/routes/admin.ts` | MODIFY | Add `POST /impersonate/edit-mode` endpoint (toggle edit on/off, create/end audit record); update `POST /impersonate/stop` to clean up edit mode state and end audit record; update `GET /impersonate/status` to return accurate `readOnly`/`editingEnabled` values; add `GET /audit-logs` endpoint |
| `client/src/contexts/ImpersonationContext.tsx` | MODIFY | Add `toggleEditMode(enabled: boolean)` function; add `editingEnabled` to context value |
| `client/src/components/ImpersonationBanner.tsx` | MODIFY | Add "Enable Editing" toggle, confirmation dialog, banner pulsation animation |
| `client/src/App.tsx` | MODIFY | Make read-only overlay conditional on `readOnly` (not just `active`) |

### Dependencies & Environment Variables

- **No new packages required.** All needed libraries (shadcn AlertDialog, Switch, express-session, Drizzle) are already installed.
- **No new environment variables.** Edit mode is a server-session feature with no external service dependencies.
- **Database migration required.** The new `impersonation_audit_logs` table needs to be pushed via `drizzle-kit db:push`.

### References

- [Source: _bmad-output/planning-artifacts/prd.md — FR61, FR62, FR63] — Edit mode toggle, confirmation, allowed/blocked actions, source attribution, audit logging
- [Source: _bmad-output/planning-artifacts/prd.md — NFR29, NFR30] — Timeout enforcement, audit retention 90 days, katalyst_admin restriction
- [Source: _bmad-output/planning-artifacts/architecture.md — "Impersonation Session Model" lines 471-477] — Dual-identity session, getEffectiveUser, session storage
- [Source: _bmad-output/planning-artifacts/architecture.md — "Decision 4: Authorization (RBAC) Pattern" lines 479-506] — Three-layer RBAC enforcement
- [Source: _bmad-output/planning-artifacts/architecture.md — FieldMetadata interface lines 1076-1081] — Per-field source attribution structure
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — "Impersonation Banner" lines 1082-1089] — Banner pulsation, Enable Editing toggle, color scheme
- [Source: _bmad-output/planning-artifacts/epics.md — Epic ST, Story ST-2 lines 1141-1158] — Acceptance criteria source
- [Source: _bmad-output/implementation-artifacts/st-1-view-as-infrastructure-read-only-mode.md] — ST-1 implementation details, established patterns, file list
- [Source: server/middleware/auth.ts] — `requireReadOnlyImpersonation` implementation to modify
- [Source: server/routes/admin.ts] — Existing impersonation endpoints to extend
- [Source: server/types/session.d.ts] — Session type augmentation to extend
- [Source: shared/schema.ts lines 261-275] — Existing `ImpersonationStatus` type to update
- [Source: client/src/contexts/ImpersonationContext.tsx] — Context to extend with edit mode toggle
- [Source: client/src/components/ImpersonationBanner.tsx] — Banner to add toggle and pulsation
- [Source: client/src/App.tsx] — Read-only overlay to make conditional

## Dev Agent Record

### Agent Model Used
Claude 4.6 Opus (Replit Agent)

### Completion Notes
- All 10 acceptance criteria implemented
- 244 tests pass (34 middleware tests, including 4 new audit log cleanup tests, 6 new edit mode tests, 1 destructive invitation test)
- Schema updated: `financialFieldValueSchema.source` and `planStartupCostLineItemSchema.source` both now accept `admin:[name]` pattern via string refine
- Audit log lifecycle covers: toggle-on create, toggle-off end, stop-impersonation end, auto-revert (getEffectiveUser expiry) end, and user-deleted cleanup end
- Destructive action guard blocks: DELETE users, PATCH/PUT user role, PATCH/PUT user brand, DELETE invitations
- Banner pulsation CSS animation cycles between #FF6D00 and #FF8F33 over 2s
- Database table `impersonation_audit_logs` created via direct SQL (drizzle-kit push requires interactive confirmation)

### File List
- `server/types/session.d.ts` — Added `impersonation_edit_enabled`, `impersonation_audit_log_id` to SessionData
- `shared/schema.ts` — Added `impersonationAuditLogs` table, updated `ImpersonationStatus` with `editingEnabled`, updated source field schemas to accept `admin:*`
- `server/storage.ts` — Added `createAuditLog`, `endAuditLog`, `getAuditLogs`, `getAuditLog`, `appendAuditLogAction` to IStorage and DatabaseStorage
- `server/middleware/auth.ts` — Added `endEditSessionAuditLog` helper, destructive action guard, updated `requireReadOnlyImpersonation` for edit mode, added audit cleanup to `getEffectiveUser` auto-revert paths
- `server/middleware/auth.test.ts` — Added 15 new tests for edit mode, destructive actions, and audit log cleanup
- `server/routes/admin.ts` — Added `POST /impersonate/edit-mode`, `GET /audit-logs` endpoints; updated stop/status/start to handle edit mode state and audit logs
- `client/src/contexts/ImpersonationContext.tsx` — Added `toggleEditMode`, `editingEnabled`, `isTogglingEditMode` to context
- `client/src/components/ImpersonationBanner.tsx` — Added Enable Editing toggle, confirmation dialog, pulsation animation
- `client/src/index.css` — Added `impersonation-banner-pulse` keyframe animation
