# Story 5H.4: Planning Artifact Alignment Audit — FR-to-Story Traceability

Status: ready-for-dev

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

**Given** the epics file contains stories across 14 epics (including Epic 5H and Epic ST)
**When** each story's acceptance criteria are reviewed
**Then** every story has at least one FR traceability link
**And** stories without FR traceability are flagged — a story with no requirement justification may be unnecessary or may indicate a missing FR in the PRD

### AC-3: Coverage Map Correction (Phase 3)

**Given** the epics FR Coverage Map header says "96/96" but the actual count is 111
**When** the coverage map is corrected
**Then** the header accurately reflects the total FR count (111/111)
**And** all FRs from FR74-FR97 are present in the coverage map table with their epic/story assignments
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
- **Architecture line 188 — "three radically different interaction paradigms":** This is in the technology rationale section. Under the two-surface model, there are TWO primary paradigms: form-based guided input (My Plan) and spreadsheet-like interactive statements (Reports). The AI Planning Assistant is a slide-in panel within My Plan, not a separate paradigm. Update to "two interaction paradigms" or "two distinct interaction surfaces (guided forms and interactive financial statements)."
- **Architecture lines 276, 282, 298 — "three experience tiers" and "three tiers":** These refer to the behavioral tier model (Story/Normal/Expert), which is STILL VALID. Do not change these. The behavioral tiers modulate AI guidance density and default landing surface but do not represent separate interaction modes. However, line 282 says "Story/Normal/Expert modes" — the word "modes" should be changed to "tiers" for consistency with the new terminology.
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
  - Story 5H.2 (done) — UI audit complete, FR84-FR97 display standards confirmed in Reports
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

{{agent_model_name_version}}

### Completion Notes

### File List

### Testing Summary
