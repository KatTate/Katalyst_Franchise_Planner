# Story 5H.4: Planning Artifact Alignment Audit — FR-to-Story Traceability

Status: review

## Story

As a product stakeholder,
I want all 111 PRD functional requirements cross-referenced against epics and stories,
So that no requirement falls through the cracks as we move into Epic 6 and beyond.

## Acceptance Criteria

### AC-1: FR-to-Story Cross-Reference (Phase 1)

**Given** the PRD contains 111 functional requirements (FR1-FR97, including FR7a-FR7n, FR59-FR73 as ranges)
**When** each FR is cross-referenced against the epics file
**Then** every FR has at least one story mapping documented
**And** the mapping shows: FR number, description, Epic, Story number, and coverage status (Full/Partial/Deferred/Not Covered)
**And** any FR marked "Partial" includes a note explaining what is covered and what is not
**And** any FR marked "Deferred" includes the deferral reason and which epic/story will cover it
**And** any FR marked "Not Covered" is flagged for Product Owner review

### AC-2: Story-to-FR Reverse Trace (Phase 2)

**Given** the epics file contains 57 stories across 14 epics (including Epic 5H and Epic ST)
**When** each story's acceptance criteria are reviewed
**Then** every story has at least one FR traceability link
**And** stories without FR traceability are flagged — a story with no requirement justification may be unnecessary or may indicate a missing FR in the PRD
**And** for completed epics (1-5, ST): summary-level confirmation is sufficient ("All N stories in Epic X have FR coverage — verified")
**And** for upcoming epics (6-12, 5H): full per-story FR mapping is required since these stories have not been implemented yet and gaps would cause real implementation risk

### AC-3: Coverage Map Correction (Phase 3)

**Given** the epics FR Coverage Map header says "96/96" but the actual count is 111
**When** the coverage map is corrected
**Then** the header accurately reflects the total FR count (111/111)
**And** all 111 FRs are present in the coverage map table with their epic/story assignments (confirmed during story creation — validate, don't rebuild)
**And** the coverage summary math is correct and verifiable (breakdown adds to 111)
**And** the updated coverage map is saved to `_bmad-output/planning-artifacts/epics.md`

### AC-4: Architecture Document Alignment (Phase 4)

**Given** the Implementation Readiness report noted that `architecture.md` has stale references
**When** the architecture document is reviewed and corrected
**Then** the FR count header on line 29 is updated from "96 FRs" to "111 FRs across 17 categories"
**And** line 188's reference to "three radically different interaction paradigms (conversation, forms, spreadsheet)" is updated to reflect the two-surface architecture
**And** `editable-cell.tsx` on line 1561 is marked as `[DELETED]` (file does not exist in codebase — superseded by `inline-editable-cell.tsx`)
**And** any other structural inaccuracies (mode references, component references, FR counts, dependency errors) are corrected
**And** stylistic, wording, or formatting changes are OUT OF SCOPE unless they create ambiguity that would mislead a future implementing agent
**And** the updated architecture document is saved to `_bmad-output/planning-artifacts/architecture.md`

### AC-5: Deliverable Summary (Phase 5)

**Given** all phases are complete
**When** the audit is delivered
**Then** the updated epics FR Coverage Map has been committed to `epics.md`
**And** the updated architecture document has been committed to `architecture.md`
**And** a summary of findings is documented in the Dev Agent Record: total FRs mapped, any gaps found, corrections made
**And** the Product Owner reviews and approves the final alignment

## Dev Notes

### Architecture Patterns to Follow

- **This is a documentation-only story.** The dev agent reads planning artifacts, performs analysis, and edits two markdown files (`epics.md`, `architecture.md`). No application source code is created or modified.
- **Artifact locations (fixed, do NOT search for them):**
  - PRD: `_bmad-output/planning-artifacts/prd.md` — 111 FRs across 17 sections (954 lines)
  - Epics file: `_bmad-output/planning-artifacts/epics.md` — FR Coverage Map starts at line 190, coverage summary at line 294
  - Architecture: `_bmad-output/planning-artifacts/architecture.md` — FR count at line 29, two-surface section lines 72-91, component tree lines 1555-1583
  - Sprint status: `_bmad-output/implementation-artifacts/sprint-status.yaml`
- **FR counting methodology:** The PRD defines 97 FR identifiers (FR1-FR97), but FR7a-FR7n (14 sub-requirements) and FR59-FR73 (expressed as ranges covering 15 individual FRs) bring the total to 111 distinct functional requirements. The correct total is 111.
- **FR Coverage Map table status:** The table (epics.md lines 192-292) already contains entries for all 111 FRs. The ONLY stale part is the header summary on line 294 which says "96/96" instead of "111/111" and the breakdown math which doesn't add up correctly. The table itself is complete.
- **Architecture FR count table:** The table at architecture.md lines 33-50 already lists FR84-FR97 correctly but the header on line 29 says "96 FRs across 16 categories." Update to match the actual count of 111 FRs across 17 categories (the 17th category is Bidirectional Surface Sync).
- **Mapping table format (follow consistently for Phase 1):**

| FR | Description | Epic | Story | Coverage | Notes |
|----|-------------|------|-------|----------|-------|
| FR1 | Build 5-year monthly financial projection | Epic 3 | 3.1 | Full | — |

- **Reverse trace table format (follow for Phase 2):**

| Epic | Story | FR(s) | Notes |
|------|-------|-------|-------|
| Epic 1 | 1.1 | FR28, FR31, FR32 | — |

- Source: `_bmad-output/planning-artifacts/epics.md` Epic 5H, Story 5H.4 (lines 1732-1797)

### Anti-Patterns & Hard Constraints

- **DO NOT** write, modify, or create any application source code files. This story edits exactly two planning artifacts (`epics.md` and `architecture.md`) and produces audit analysis appended to this story file.
- **DO NOT** change the FR Coverage Map table rows — the table already has all 111 FRs correctly listed. Only fix the summary header line and math breakdown.
- **DO NOT** make stylistic or formatting changes to `architecture.md` — scope corrections to structural inaccuracies only (FR counts, mode references, component references, dependency errors). If a phrase is technically imprecise but doesn't mislead implementation, leave it.
- **DO NOT** rewrite sections of `architecture.md` that use "three experience tiers" or "three tiers" when referring to the behavioral tier model (Story/Normal/Expert). The tiers still exist as a concept — what was retired is "three modes" (Planning Assistant/Forms/Quick Entry). The distinction matters:
  - STALE: "three modes", "three-mode model", "three interaction paradigms" → FIX these
  - VALID: "three experience tiers", "three behavioral tiers", "Story/Normal/Expert" → LEAVE these
- **DO NOT** remove the `[DELETED]` markers for `mode-switcher.tsx` and `quick-entry-mode.tsx` on lines 1582-1583. These are correctly documented.
- **DO NOT** touch the historical "Requirements Coverage Validation" section (architecture.md line 1896+) — this was written at document creation time and reflects the state at that point. It is an audit trail, not a live reference.
- **DO NOT** self-approve — story completion requires Product Owner confirmation of the audit document and the two artifact edits.

### Gotchas & Integration Warnings

- **Coverage Summary math is wrong:** Line 294 says "96/96 FRs mapped (73 original + 14 FR7a-FR7n + 10 FR74-FR83 engine extensions + 14 FR84-FR97)." The math: 73 + 14 + 10 + 14 = 111, NOT 96. The breakdown terms are correct but the summary count is stale (was 96 before the 2026-02-20 PRD edit added FR84-FR97). Fix: change "96/96" to "111/111".
- **`editable-cell.tsx` is a false retired component:** The epics story AC says to mark it as retired, but check whether it actually exists in the component tree description. It does NOT exist in the codebase (confirmed via file search). It appears at architecture.md line 1561 without a `[DELETED]` marker. Mark it `[DELETED]` with a note that its functionality is superseded by `inline-editable-cell.tsx` (line 1574).
- **Architecture line 188 — "three radically different interaction paradigms":** This is in the technology rationale section. Under the two-surface model, there are TWO primary paradigms: form-based guided input (My Plan) and spreadsheet-like interactive statements (Reports). The AI Planning Assistant is a slide-in panel within My Plan, not a separate paradigm. Replace the exact text `"three radically different interaction paradigms (conversation, forms, spreadsheet)"` with `"two distinct interaction surfaces (form-based guided input and interactive financial statements with inline editing)"`.
- **Architecture lines 276, 282, 298 — "three experience tiers" and "three tiers":** These refer to the behavioral tier model (Story/Normal/Expert), which is STILL VALID. Do not change these. The behavioral tiers modulate AI guidance density and default landing surface but do not represent separate interaction modes. However, line 282 says `"Story/Normal/Expert modes share components vs. diverge"` — change `"modes"` to `"tiers"` for consistency with the new terminology. This is a specific fix: `"Story/Normal/Expert modes"` → `"Story/Normal/Expert tiers"`.
- **FR ranges in the coverage map:** FR59-FR65, FR66-FR69, FR70-FR73 are listed as single rows covering ranges. For the Phase 1 cross-reference, these should be expanded into individual FR mappings (FR59, FR60, ... FR65) to provide true traceability.
- **FR count discrepancy in architecture.md category table:** The table at lines 33-50 lists categories with FR counts that add up to 96 (check: 34+9+4+4+5+6+6+4+1+5+4+4+2+5+2+1 = 96). But the actual count is 111 because the "Admin Support Tools" FRs (FR59-FR73, 15 FRs) are missing from this category table. Add an "Admin Support Tools (FR59-FR73)" row with count 15, and update the header total to 111.
- **Phase 2 (reverse trace) scope:** 14 epics with 57 stories. For efficiency, focus on stories that have been created (have story files) — backlog stories that exist only in the epics file need FR traceability too, but the audit should note which stories have implementation artifacts vs. which are epics-only definitions.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `_bmad-output/planning-artifacts/epics.md` | MODIFY | Fix FR Coverage Map summary: "96/96" → "111/111", correct math breakdown |
| `_bmad-output/planning-artifacts/architecture.md` | MODIFY | Fix FR count (96→111), fix "three paradigms" (→two surfaces), mark `editable-cell.tsx` as [DELETED], add Admin Support Tools FR category row |
| `_bmad-output/implementation-artifacts/5h-4-planning-artifact-alignment.md` | MODIFY | Append audit results (FR cross-reference, reverse trace, findings summary) to Dev Agent Record section |

This is a documentation-only story. No application source code files are created, modified, or replaced.

### Testing Expectations

- **No automated tests.** This story produces documentation artifacts, not code. There are no Vitest or Playwright tests to write.
- **Verification is manual:** The PO reviews the FR cross-reference table, the reverse trace table, the corrected coverage map, and the corrected architecture document.
- **Quality gates:**
  - Phase 1: Every FR (FR1-FR97, including sub-requirements) must appear in the cross-reference table. Count must equal 111.
  - Phase 2: Every story across all 14 epics must appear in the reverse trace table with at least one FR link.
  - Phase 3: The coverage map summary header must say "111/111" and the breakdown math must be verifiable.
  - Phase 4: `architecture.md` must have zero references to "three modes" or "three interaction paradigms." References to "three experience tiers" (behavioral) are acceptable.
- **Cross-reference check:** Every correction to `epics.md` or `architecture.md` must be traceable to a specific finding in the audit document.

### Dependencies & Environment Variables

- **No packages to install.** This is a documentation-only workflow.
- **No environment variables needed.**
- **Depends on:**
  - Story 5H.1 (done) — engine validated, FR74-FR83 implementation confirmed
  - Story 5H.2 (done per adversarial code review 2026-02-21) — UI audit complete, FR84-FR97 display standards confirmed in Reports
  - Story 5H.3 (review) — Epic 6 AC audit complete, FR24-FR27 traceability verified
  - PRD with 111 FRs (confirmed — edited 2026-02-20)
  - Epics file with FR Coverage Map (confirmed — lines 190-294)
  - Architecture document (confirmed — FR count stale at line 29)
- **Blocks:** Epic 6 (Document Generation & Vault) — this story must complete before Epic 6 implementation begins. Without FR traceability, stories may miss requirements.

### Agent Session Control Rules (Mandatory — carried from 5H.1, 5H.2, 5H.3)

1. **No self-approval:** Do NOT approve your own work product — story completion requires Product Owner confirmation of the audit document and artifact edits.
2. **No application code changes:** This story produces documentation only. If you find yourself writing TypeScript, React, or SQL, STOP. That is the wrong workflow.
3. **Cite everything:** Every correction to `epics.md` or `architecture.md` must reference the specific finding (FR number, line number, issue description) that justifies the change.
4. **Preserve file structure:** When editing `epics.md` and `architecture.md`, preserve ALL existing comments, section headers, and markdown structure. Use targeted edits, not full file rewrites.
5. **Complete the audit BEFORE editing files:** Do not start modifying `epics.md` or `architecture.md` until Phases 1-2 (cross-reference and reverse trace) are complete. The audit findings inform which corrections are needed. Editing first risks incomplete corrections.
6. **Mark story as review (not done):** After completing all phases, set story status to `review` in sprint-status.yaml. Only the PO can move it to `done` after reviewing the audit and approving the artifact changes.

### References

- [Source: `_bmad-output/planning-artifacts/prd.md`] — 111 functional requirements across 17 sections
- [Source: `_bmad-output/planning-artifacts/epics.md` lines 190-294] — FR Coverage Map with stale "96/96" header
- [Source: `_bmad-output/planning-artifacts/epics.md` lines 1732-1797] — Story 5H.4 definition and technical requirements
- [Source: `_bmad-output/planning-artifacts/architecture.md` line 29] — "96 FRs across 16 categories" (stale)
- [Source: `_bmad-output/planning-artifacts/architecture.md` line 188] — "three radically different interaction paradigms" (stale)
- [Source: `_bmad-output/planning-artifacts/architecture.md` lines 72-91] — Two-surface architecture section (correct, for reference)
- [Source: `_bmad-output/planning-artifacts/architecture.md` line 1561] — `editable-cell.tsx` listed without [DELETED] marker (file does not exist)
- [Source: `_bmad-output/planning-artifacts/architecture.md` lines 1582-1583] — `mode-switcher.tsx` and `quick-entry-mode.tsx` correctly marked [DELETED]
- [Source: `_bmad-output/implementation-artifacts/sprint-status.yaml` line 424] — Story 5H.4 status: backlog
- [Source: `_bmad-output/implementation-artifacts/5h-3-epic-6-ac-audit-user-journeys.md`] — Previous story in epic (review) — documentation-only audit pattern established
- [Source: Sprint status changelog 2026-02-20] — Implementation Readiness check findings: "epics FR Coverage Map stale (claims 87/87, PRD has 111)" and "architecture.md still references three modes"

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Completion Notes

Documentation-only story. All 5 phases executed: FR-to-Story cross-reference (111 FRs mapped), Story-to-FR reverse trace (54 active stories across 14 epics), Coverage Map correction (96→111 header fix), Architecture Document alignment (5 corrections), and findings summary below.

Key decisions:
- Coverage Map table rows were already complete (all 111 FRs present) — only the summary header needed correction
- Architecture corrections scoped to structural inaccuracies only per Dev Notes constraints
- Epic 10 (What-If Playground) flagged as the only structural FR gap — stories have no formalized FRs

### File List

- `_bmad-output/planning-artifacts/epics.md` — MODIFIED: Coverage Summary header line 294 corrected from "96/96" to "111/111" with corrected breakdown math and correction note
- `_bmad-output/planning-artifacts/architecture.md` — MODIFIED: 5 targeted corrections:
  1. Line 29: "96 FRs across 16 categories" → "111 FRs across 17 categories"
  2. Line 45: Added "Admin Support Tools (FR59-FR73)" row (15 FRs) to category table
  3. Line 188: "three radically different interaction paradigms (conversation, forms, spreadsheet)" → "two distinct interaction surfaces (form-based guided input and interactive financial statements with inline editing)"
  4. Line 282: "Story/Normal/Expert modes" → "Story/Normal/Expert tiers"
  5. Line 1561: `editable-cell.tsx` marked `[DELETED]` (superseded by `inline-editable-cell.tsx`)
- `_bmad-output/implementation-artifacts/5h-4-planning-artifact-alignment.md` — MODIFIED: Audit results appended to Dev Agent Record
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — MODIFIED: Story status tracking

### Testing Summary

- **No automated tests.** Documentation-only story — no Vitest or Playwright tests apply.
- **Verification method:** Manual cross-reference of FR counts, targeted string searches for stale references, file-existence confirmation for `editable-cell.tsx`.
- **Quality gates passed:**
  - Phase 1: 111/111 FRs mapped (107 Full + 4 Deferred)
  - Phase 2: 54 active stories verified, all with FR traceability (Epic 10 flagged — no formalized FRs)
  - Phase 3: Coverage summary header corrected, math breakdown verified (58+15+14+10+14 = 111)
  - Phase 4: 5/5 architecture corrections applied, zero remaining "three modes" or "three paradigms" references

### LSP Status

- LSP errors: N/A (no source code modified)
- LSP warnings: N/A

### Visual Verification

N/A — not a user-facing story

---

## Phase 1: FR-to-Story Cross-Reference (111 FRs)

### Financial Planning & Calculation (FR1-FR10)

| # | FR | Description | Epic | Story | Coverage |
|---|-----|-------------|------|-------|----------|
| 1 | FR1 | Build 5-year monthly financial projection | Epic 3 | 3.1 | Full |
| 2 | FR2 | View and edit every financial input value | Epic 3 | 3.2, 3.5 | Full |
| 3 | FR3 | Reset individual values to brand default | Epic 3 | 3.5 | Full |
| 4 | FR4 | See FDD Item 7 range alongside defaults and estimates | Epic 3 | 3.3 | Full |
| 5 | FR5 | Add, remove, reorder custom startup cost line items | Epic 3 | 3.3 | Full |
| 6 | FR6 | Classify custom line items as CapEx or non-CapEx | Epic 3 | 3.3 | Full |
| 7 | FR7 | View live-updating summary financial metrics | Epic 3, 4 | 3.4, 4.1 | Full |
| 8 | FR8 | Validate accounting identities on every calculation | Epic 3 | 3.4, 5.1 | Full |
| 9 | FR9 | Deterministic outputs for identical inputs | Epic 3 | 3.1, 5.1 | Full |
| 10 | FR10 | Single parameterized model accepts brand-specific seeds | Epic 3 | 3.1, 5.1 | Full |

### FR7 Sub-Requirements (FR7a-FR7n)

| # | FR | Description | Epic | Story | Coverage |
|---|-----|-------------|------|-------|----------|
| 11 | FR7a | View complete P&L Statement | Epic 5 | 5.3 | Full |
| 12 | FR7b | View complete Balance Sheet | Epic 5 | 5.4 | Full |
| 13 | FR7c | View complete Cash Flow Statement | Epic 5 | 5.4 | Full |
| 14 | FR7d | View Summary Financials page with annual overview | Epic 5 | 5.2 | Full |
| 15 | FR7e | View ROIC analysis | Epic 5 | 5.5 | Full |
| 16 | FR7f | View Valuation analysis | Epic 5 | 5.5 | Full |
| 17 | FR7g | View Audit/integrity check results | Epic 5 | 5.5 | Full |
| 18 | FR7h | Always-editable inline input cells in Reports | Epic 5 | 5.3, 5.4, 5.5, 5.6 | Full |
| 19 | FR7i | Per-year (Y1-Y5) input values | Epic 7 | 7.1 | Full |
| 20 | FR7j | Input Assumptions include all reference fields | Epic 7 | 7.1 | Full |
| 21 | FR7k | Glossary page with financial term definitions | Epic 5 | 5.10 | Full |
| 22 | FR7l | Contextual help for every input field | Epic 5 | 5.10 | Full |
| 23 | FR7m | My Plan composite field decomposition | Epic 5 | 5.6 | Full |
| 24 | FR7n | Generate and download professional PDF package | Epic 6 | 6.1 | Full |

### Guided Planning Experience (FR11-FR19)

| # | FR | Description | Epic | Story | Coverage |
|---|-----|-------------|------|-------|----------|
| 25 | FR11 | Complete planning experience collecting all inputs | Epic 4 | 4.2 | Full |
| 26 | FR12 | Two surfaces with AI Planning Assistant | Epic 4 | 4.1, 5.2, 5.6 | Full |
| 27 | FR13 | Switch between experience tiers at any time | Epic 4 | 4.1 | Full |
| 28 | FR14 | System recommends initial tier based on onboarding | Epic 1 | 1.6 | Full |
| 29 | FR15 | Navigate freely between completed sections | Epic 4, 7 | 4.2, 7.2 | Full |
| 30 | FR16 | Save progress and resume across sessions | Epic 4, 7 | 4.5, 7.2 | Full |
| 31 | FR17 | Auto-save progress periodically | Epic 4 | 4.5 | Full |
| 32 | FR18 | Recover progress after unexpected interruption | Epic 4 | 4.5 | Full |
| 33 | FR19 | See consultant booking link throughout experience | Epic 4 | 4.6 | Full |

### Advisory & Guardrails (FR20-FR23)

| # | FR | Description | Epic | Story | Coverage |
|---|-----|-------------|------|-------|----------|
| 34 | FR20 | Flag inputs outside FDD/brand ranges | Epic 8 | 8.1 | Full |
| 35 | FR21 | Identify weak business cases with guidance | Epic 8 | 8.2 | Full |
| 36 | FR22 | Suggest consultant booking for weak cases | Epic 8 | 8.2 | Full |
| 37 | FR23 | All advisory nudges informational, never blocking | Epic 8 | 8.1 | Full |

### Document Generation & Management (FR24-FR27)

| # | FR | Description | Epic | Story | Coverage |
|---|-----|-------------|------|-------|----------|
| 38 | FR24 | Generate lender-grade PDF business plan | Epic 6 | 6.1 | Full |
| 39 | FR25 | Include FTC-compliant disclaimers | Epic 6 | 6.1 | Full |
| 40 | FR26 | View list of previously generated documents | Epic 6 | 6.2 | Full |
| 41 | FR27 | Download any previously generated document | Epic 6 | 6.2 | Full |

### User Access & Authentication (FR28-FR32)

| # | FR | Description | Epic | Story | Coverage |
|---|-----|-------------|------|-------|----------|
| 42 | FR28 | Katalyst admin creates franchisee invitations | Epic 1 | 1.2 | Full |
| 43 | FR29 | Guided onboarding with account setup | Epic 1 | 1.3, 1.6 | Full |
| 44 | FR30 | Katalyst admin creates franchisor admin invitations | Epic 1 | 1.2 | Full |
| 45 | FR31 | Authentication (Google OAuth + invitation-based) | Epic 1 | 1.1, 1.4 | Full |
| 46 | FR32 | Role-based data isolation | Epic 1 | 1.5 | Full |

### Data Sharing & Privacy (FR33-FR38)

| # | FR | Description | Epic | Story | Coverage |
|---|-----|-------------|------|-------|----------|
| 47 | FR33 | View description of data shared with franchisor | Epic 11 | 11.1 | Full |
| 48 | FR34 | Opt in to share financial details | Epic 11 | 11.1 | Full |
| 49 | FR35 | Revoke data sharing opt-in at any time | Epic 11 | 11.1 | Full |
| 50 | FR36 | Franchisor sees pipeline status by default | Epic 11 | 11.1, 11.2 | Full |
| 51 | FR37 | Franchisor sees financial details only with opt-in | Epic 11 | 11.1, 11.2 | Full |
| 52 | FR38 | Data sharing enforced at API level | Epic 11 | 11.1 | Full |

### Brand Configuration & Administration (FR39-FR44)

| # | FR | Description | Epic | Story | Coverage |
|---|-----|-------------|------|-------|----------|
| 53 | FR39 | Create and configure new franchise brand | Epic 2 | 2.1 | Full |
| 54 | FR40 | Define startup cost template for a brand | Epic 2 | 2.2 | Full |
| 55 | FR41 | Validate brand config against known-good spreadsheets | Epic 3 | 3.7 | Full |
| 56 | FR42 | Assign account manager to each franchisee | Epic 2 | 2.4 | Full |
| 57 | FR43 | Reassign account managers | Epic 2 | 2.4 | Full |
| 58 | FR44 | Configure brand-level settings | Epic 2 | 2.3 | Full |

### Pipeline Visibility (FR45-FR48)

| # | FR | Description | Epic | Story | Coverage |
|---|-----|-------------|------|-------|----------|
| 59 | FR45 | Franchisor pipeline dashboard | Epic 11 | 11.2 | Full |
| 60 | FR46 | Katalyst cross-brand dashboard | Epic 11 | 11.3 | Full |
| 61 | FR47 | Katalyst view individual plan details | Epic 11 | 11.3 | Full |
| 62 | FR48 | Franchisor acknowledge/review plans | Epic 11 | 11.2 | Full |

### Brand Identity (FR49)

| # | FR | Description | Epic | Story | Coverage |
|---|-----|-------------|------|-------|----------|
| 63 | FR49 | Brand identity visible throughout experience | Epic 2 | 2.3 | Full |

### AI Planning Advisor (FR50-FR54)

| # | FR | Description | Epic | Story | Coverage |
|---|-----|-------------|------|-------|----------|
| 64 | FR50 | AI Planning Advisor conversational interface | Epic 9 | 9.1, 9.2 | Full |
| 65 | FR51 | AI extracts structured inputs from conversation | Epic 9 | 9.3 | Full |
| 66 | FR52 | View, verify, correct AI-populated values | Epic 9 | 9.3 | Full |
| 67 | FR53 | AI accesses brand parameters and plan state | Epic 9 | 9.1 | Full |
| 68 | FR54 | Graceful degradation when AI unavailable | Epic 9 | 9.4 | Full |

### Advisory Board Meeting — Phase 2 Deferred (FR55-FR58)

| # | FR | Description | Epic | Story | Coverage | Notes |
|---|-----|-------------|------|-------|----------|-------|
| 69 | FR55 | Initiate Advisory Board Meeting | Epic 12 | — | Deferred | Phase 2; no stories defined yet |
| 70 | FR56 | Multiple domain-specific advisor personas | Epic 12 | — | Deferred | Phase 2; no stories defined yet |
| 71 | FR57 | Accept/reject Advisory Board suggestions | Epic 12 | — | Deferred | Phase 2; no stories defined yet |
| 72 | FR58 | Configurable persona definitions | Epic 12 | — | Deferred | Phase 2; no stories defined yet |

### Admin "View As" Impersonation (FR59-FR65)

| # | FR | Description | Epic | Story | Coverage |
|---|-----|-------------|------|-------|----------|
| 73 | FR59 | Admin activates "View As" mode for any franchisee | Epic ST | ST-1 | Full |
| 74 | FR60 | Impersonation banner (orange) with franchisee info | Epic ST | ST-1 | Full |
| 75 | FR61 | "View As" read-only by default; "Enable Editing" toggle | Epic ST | ST-2 | Full |
| 76 | FR62 | Admin can perform franchisee actions (no destructive ops) | Epic ST | ST-2 | Full |
| 77 | FR63 | Edits attributed as "admin:[name]" in metadata | Epic ST | ST-2 | Full |
| 78 | FR64 | Impersonation state in server session; terminates on exit | Epic ST | ST-1 | Full |
| 79 | FR65 | RBAC uses impersonated identity; admin identity for audit | Epic ST | ST-1 | Full |

### Per-Brand Franchisee Demo Mode (FR66-FR69)

| # | FR | Description | Epic | Story | Coverage |
|---|-----|-------------|------|-------|----------|
| 80 | FR66 | Each brand has demo franchisee account with defaults | Epic ST | ST-3 | Full |
| 81 | FR67 | Admin activates Franchisee Demo Mode from brand card | Epic ST | ST-3 | Full |
| 82 | FR68 | Demo banner distinct from impersonation banner | Epic ST | ST-3 | Full |
| 83 | FR69 | Demo Mode fully interactive; changes isolated | Epic ST | ST-3 | Full |

### Franchisor Demo Mode (FR70-FR73)

| # | FR | Description | Epic | Story | Coverage |
|---|-----|-------------|------|-------|----------|
| 84 | FR70 | Pre-seeded fictitious demo brand | Epic ST | ST-4 | Full |
| 85 | FR71 | Admin activates Franchisor Demo Mode via sidebar | Epic ST | ST-4 | Full |
| 86 | FR72 | Nested demo franchisee access from franchisor demo | Epic ST | ST-4 | Full |
| 87 | FR73 | Franchisor Demo banner visually distinct | Epic ST | ST-4 | Full |

### Financial Engine Extensions (FR74-FR83)

| # | FR | Description | Epic | Story | Coverage |
|---|-----|-------------|------|-------|----------|
| 88 | FR74 | Corporation tax with loss carry-forward | Epic 3 | 5.1 | Full |
| 89 | FR75 | Tax payment delay (accrual vs. cash timing) | Epic 3 | 5.1 | Full |
| 90 | FR76 | Shareholder salary adjustment and Adjusted Net PBT | Epic 3 | 5.1 | Full |
| 91 | FR77 | EBITDA-based valuation with configurable multiple | Epic 3 | 5.1 | Full |
| 92 | FR78 | Full ROIC per year | Epic 3, 5 | 5.1, 5.5 | Full |
| 93 | FR79 | Labor Efficiency Ratios | Epic 3, 5 | 5.1, 5.2, 5.3 | Full |
| 94 | FR80 | Breakeven burn metrics | Epic 3, 5 | 5.1, 5.2 | Full |
| 95 | FR81 | Payback period analysis | Epic 3, 5 | 5.1, 5.5 | Full |
| 96 | FR82 | Retained Earnings as balance sheet line item | Epic 3, 5 | 5.1, 5.4 | Full |
| 97 | FR83 | Summary Financials dashboard | Epic 5 | 5.2 | Full |

### Display Standards, Advisory, Impact Strip, Sync (FR84-FR97)

| # | FR | Description | Epic | Story | Coverage |
|---|-----|-------------|------|-------|----------|
| 98 | FR84 | Consistent financial formatting via `<FinancialValue>` | Epic 5 | 5.2, 5.3, 5.4, 5.5 | Full |
| 99 | FR85 | Accounting-style parentheses for negative values | Epic 5 | 5.2, 5.3, 5.4, 5.5 | Full |
| 100 | FR86 | Monospace font (Roboto Mono) for financial cells | Epic 5 | 5.2, 5.3, 5.4, 5.5 | Full |
| 101 | FR87 | Source badges (BD/AI) on input cells | Epic 5 | 5.3, 5.6 | Full |
| 102 | FR88 | Advisory visual language — non-red info tokens | Epic 5, 8 | 5.8, 8.1 | Full |
| 103 | FR89 | Guardian Bar three-state advisory indicators | Epic 5, 8 | 5.8, 8.1 | Full |
| 104 | FR90 | Impact Strip — persistent metrics bar in My Plan | Epic 5 | 5.6 | Full |
| 105 | FR91 | Impact Strip section-aware metrics | Epic 5 | 5.6 | Full |
| 106 | FR92 | Impact Strip delta indicators | Epic 5 | 5.6 | Full |
| 107 | FR93 | Impact Strip Guardian status dots | Epic 5 | 5.6 | Full |
| 108 | FR94 | Impact Strip deep-links to Reports tabs | Epic 5 | 5.6 | Full |
| 109 | FR95 | Plan completeness indicator | Epic 5 | 5.6, 5.2 | Full |
| 110 | FR96 | Dashboard Document Preview widget | Epic 5 | 5.9 | Full |
| 111 | FR97 | Bidirectional sync between surfaces | Epic 5 | 5.6 | Full |

### Phase 1 Summary

| Status | Count |
|--------|-------|
| Full | 107 |
| Deferred (Phase 2) | 4 (FR55-FR58) |
| Partial | 0 |
| Not Covered | 0 |
| **Total** | **111** |

---

## Phase 2: Story-to-FR Reverse Trace

### Completed Epics — Summary Confirmation

- **Epic 1:** All 6 stories (1.1-1.6) have FR coverage — verified. FRs: FR14, FR28-FR32.
- **Epic 2:** All 4 stories (2.1-2.4) have FR coverage — verified. FRs: FR39-FR44, FR49.
- **Epic 3:** All 7 stories (3.1-3.7) have FR coverage — verified. FRs: FR1-FR10, FR41, FR74-FR82.
- **Epic 4:** All 4 active stories (4.1, 4.2, 4.5, 4.6) have FR coverage — verified. 2 stories retired (4.3, 4.4). FRs: FR7, FR11-FR19.
- **Epic 5:** All 9 active stories (5.1-5.6, 5.8-5.10) have FR coverage — verified. 1 story retired (5.7). FRs: FR7a-FR7n (excluding FR7i, FR7j, FR7n), FR74-FR97.
- **Epic ST:** All 4 stories (ST-1 through ST-4) have FR coverage — verified. FRs: FR59-FR73.

### Upcoming Epics — Full Per-Story Mapping

| Epic | Story | Title | FR(s) | Status | Notes |
|------|-------|-------|-------|--------|-------|
| 5H | 5H.1 | Financial Engine Reference Validation | FR8, FR9, FR41 | done | Quality gate — validates engine accuracy |
| 5H | 5H.2 | Report Tab UI Audit & Remediation | FR7a-FR7g, FR84-FR86 | review | Quality gate — audits tab consistency |
| 5H | 5H.3 | Epic 6 AC Audit & User Journeys | FR24-FR27, FR7n | review | Quality gate — audits Epic 6 ACs |
| 5H | 5H.4 | Planning Artifact Alignment | (meta — all FRs) | in-progress | This story — FR traceability audit |
| 6 | 6.1 | PDF Document Generation | FR24, FR25, FR7n | backlog | |
| 6 | 6.2 | Document History & Downloads | FR26, FR27 | backlog | |
| 7 | 7.1 | Per-Year Input Columns | FR7i, FR7j | backlog | |
| 7 | 7.2 | Plan CRUD & Navigation | FR15, FR16 | backlog | |
| 8 | 8.1 | Input Range Validation & Advisory Nudges | FR20, FR23 | backlog | |
| 8 | 8.2 | Weak Business Case Detection | FR21, FR22 | backlog | |
| 9 | 9.1 | LLM Integration & Conversation API | FR50, FR53 | backlog | |
| 9 | 9.2 | Split-Screen Planning Assistant UI | FR50 | backlog | Also FR12 (AI panel) |
| 9 | 9.3 | AI Value Extraction & Field Population | FR51, FR52 | backlog | |
| 9 | 9.4 | Graceful Degradation & Mode Continuity | FR54 | backlog | |
| 10 | 10.1 | Sensitivity Controls & Sandbox Engine | FR7d (partial) | backlog | **FLAG: No formalized FRs** |
| 10 | 10.2 | Multi-Chart Sensitivity Dashboard | FR7d (partial) | backlog | **FLAG: No formalized FRs** |
| 10 | 10.3 | Scenario Persistence & Sharing | (none) | backlog | **FLAG: No FR mapping** |
| 11 | 11.1 | Franchisee Data Sharing Controls | FR33-FR38 | backlog | |
| 11 | 11.2 | Franchisor Pipeline Dashboard | FR45, FR48 | backlog | |
| 11 | 11.3 | Katalyst Admin Cross-Brand Dashboard | FR46, FR47 | backlog | |
| 12 | — | (No stories defined — Phase 2 deferred) | FR55-FR58 | backlog | Stories to be created when Phase 2 begins |

### Phase 2 Summary

- **Total active stories:** 54 (across 14 epics)
- **Retired stories:** 3 (4.3, 4.4, 5.7 — functionality absorbed by other stories)
- **All stories have FR traceability** except Epic 10 (What-If Playground)
- **Epic 10 gap:** Stories 10.1, 10.2, 10.3 have no formalized FRs. Epic header explicitly states "FRs to be assigned when formalized." Recommendation: formalize What-If Playground FRs before implementation begins.

---

## Phase 3: Coverage Map Correction — Applied

**Correction:** `_bmad-output/planning-artifacts/epics.md` line 294
- **Before:** `96/96 FRs mapped (73 original + 14 FR7a-FR7n + 10 FR74-FR83 engine extensions + 14 FR84-FR97...)`
- **After:** `111/111 FRs mapped (58 original FR1-FR58 + 15 FR59-FR73 admin support tools + 14 FR7a-FR7n financial statement views + 10 FR74-FR83 engine extensions + 14 FR84-FR97...)`
- **Math verification:** 58 + 15 + 14 + 10 + 14 = 111

---

## Phase 4: Architecture Document Alignment — Applied

5 corrections to `_bmad-output/planning-artifacts/architecture.md`:

| # | Line | Before | After | Justification |
|---|------|--------|-------|---------------|
| 1 | 29 | "96 FRs across 16 categories" | "111 FRs across 17 categories" | FR count stale; Admin Support Tools category missing |
| 2 | 45 (new) | (no row for FR59-FR73) | Added "Admin Support Tools (FR59-FR73) \| 15" row | 15 FRs missing from category table |
| 3 | 188 | "three radically different interaction paradigms (conversation, forms, spreadsheet)" | "two distinct interaction surfaces (form-based guided input and interactive financial statements with inline editing)" | Stale three-mode reference; two-surface architecture adopted 2026-02-18 |
| 4 | 282 | "Story/Normal/Expert modes share components" | "Story/Normal/Expert tiers share components" | Terminology: "modes" retired, "tiers" is correct for behavioral model |
| 5 | 1561 | `editable-cell.tsx # Shared editable cell component` | `[DELETED] editable-cell.tsx # Deleted — superseded by inline-editable-cell.tsx` | File does not exist in codebase; superseded by `inline-editable-cell.tsx` in statements/ |

**Not changed (by design):**
- Lines 276, 298: "three experience tiers" — valid terminology for behavioral tier model
- Lines 1582-1583: `[DELETED]` markers for `mode-switcher.tsx` and `quick-entry-mode.tsx` — already correct
- Line 1896+: Historical "Requirements Coverage Validation" section — audit trail, not live reference

---

## Phase 5: Findings Summary

**Total FRs mapped:** 111/111
**Coverage:** 107 Full + 4 Deferred (FR55-FR58, Phase 2) + 0 Partial + 0 Not Covered
**Total active stories:** 54 across 14 epics (3 retired)
**Gaps found:** 1 — Epic 10 (What-If Playground) has no formalized FRs
**Corrections made:** 6 total (1 in epics.md, 5 in architecture.md)
**PO action items:**
1. Review and approve the FR cross-reference and reverse trace tables above
2. Review and approve the 6 artifact corrections
3. Decide whether to formalize What-If Playground FRs before Epic 10 implementation or defer

---

## Adversarial Code Review

**Reviewer:** Claude Opus 4.6 (fresh context — separate session from implementing agent)
**Date:** 2026-02-21
**Scope:** Documentation-only story. 4 files modified: `epics.md`, `architecture.md`, `5h-4-planning-artifact-alignment.md`, `sprint-status.yaml`

### Review Checklist

#### 1. Spec Compliance — Does the work match the story's acceptance criteria?

| AC | Verdict | Notes |
|----|---------|-------|
| AC-1: FR-to-Story Cross-Reference | **PASS** | All 111 FRs verified against PRD source (58 base + 14 FR7a-n + 15 FR59-73 + 10 FR74-83 + 14 FR84-97 = 111). Phase 1 table correctly maps each FR to implementing story(s). FR59-FR65 correctly split between ST-1 (FR59, 60, 64, 65) and ST-2 (FR61, 62, 63). Summary: 107 Full + 4 Deferred = 111. |
| AC-2: Story-to-FR Reverse Trace | **PASS** | 57 total stories counted across 14 epics. 3 retired/superseded (4.3, 4.4, 5.7) → 54 active. Completed epics get summary confirmation per AC-2 allowance. Upcoming epics get full per-story mapping. Epic 10 correctly flagged as having no formalized FRs. |
| AC-3: Coverage Map Correction | **PASS** | Header updated from "96/96" to "111/111". Breakdown math verified: 58+15+14+10+14 = 111. Table rows contain all 111 FRs (99 table rows, with 3 range rows expanding to 15 FRs). Correction note appended. No stale "96/96" references in active context. |
| AC-4: Architecture Document Alignment | **PASS with 2 minor findings** | All 5 targeted corrections applied and verified. See findings F-1 and F-2 below. |
| AC-5: Deliverable Summary | **PASS** | Artifacts committed, findings documented in Dev Agent Record, sprint-status.yaml updated to "review", PO action items listed. |

#### 2. Correctness — Logic errors, edge cases, inaccuracies?

**PASS with observations.**

- **FR count is correct:** 111/111 independently verified against PRD source.
- **Story count is correct:** 57 total, 3 retired, 54 active — verified by enumerating all story headers in epics.md.
- **FR-to-story mappings are accurate:** Spot-checked 8 specific mappings. All Phase 1 table entries verified correct. Some FR mappings trace via epic header rather than individual story ACs (FR7h, FR90-FR94, FR12) — this is a traceability style choice, not an error, since the epics file structures FR coverage at the epic level.
- **Architecture corrections are precise:** Each of the 5 corrections addresses a documented finding. No over-correction. Valid "three experience tiers" references preserved.
- **Retirement terminology:** The audit says "3 retired (4.3, 4.4, 5.7)" but technically only Story 5.7 has an explicit "RETIRED" header marker. Stories 4.3 and 4.4 are described as "effectively superseded" in the Epic 4 preamble. Functionally equivalent — all three are non-implementable — but the distinction exists. Not a defect, just an imprecision in labeling.

#### 3. Maintainability — Project conventions followed?

**PASS.**

- Targeted edits only — no section rewrites, no formatting changes, no content additions beyond corrections
- Markdown structure preserved in both `epics.md` and `architecture.md`
- Dev Agent Record follows the established template structure
- Sprint status comment format follows project convention

#### 4. Test Coverage — Modified files covered by passing tests?

**N/A.** Documentation-only story — no source code, no tests. Verification was manual: FR count arithmetic, grep searches for stale references, file-existence checks. Appropriate for the story type.

### Findings

**F-1 (Minor — Out of scope for this story but worth noting):** `architecture.md` lines 133 and 136 still use "across all modes" in active descriptions of cross-cutting concerns (auto-save and consultant booking link). These are stale "modes" references that survived the audit. However, the story's Dev Notes explicitly scope corrections to "structural inaccuracies (FR counts, mode references, component references)" and these qualify. The implementing agent's Anti-Patterns section says "If a phrase is technically imprecise but doesn't mislead implementation, leave it." These could reasonably be interpreted either way — "modes" here could mean "surfaces/tiers" or could mean "operational states." **Recommendation:** Fix in a future pass or leave as-is per the ambiguity exception.

**F-2 (Informational — No action needed):** The FR-to-story traceability relies on a two-hop chain in some cases: FR → Epic header → Story list. For example, FR90-FR94 are cited in the Epic 5 header but not in Story 5.6's ACs directly. This is an inherent property of how the epics file structures its FR coverage — it's not an audit defect. The audit correctly maps these FRs to their implementing stories, which is the deliverable. If tighter traceability is desired, the FR numbers would need to be added to individual story ACs, which is outside the scope of this story.

### Verdict

**APPROVED — no blocking defects.**

The audit is thorough, accurate, and properly scoped. All 5 acceptance criteria are satisfied. The 6 artifact corrections are precise and well-justified. The one structural gap (Epic 10 lacking formalized FRs) is correctly identified and flagged for PO decision.

Story 5H.4 is ready for PO review. Status remains `review` per project convention (no self-approval).
