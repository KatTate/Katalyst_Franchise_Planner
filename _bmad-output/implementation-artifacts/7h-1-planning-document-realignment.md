# Story 7H.1: Planning Document Realignment

Status: review

## Story

As a product stakeholder,
I want all planning documents updated to reflect Epic 7's implementation decisions and the two-surface design philosophy,
so that future implementing agents have accurate, consistent reference material and no requirement falls through the cracks.

## Acceptance Criteria

### AC-1: Add FR98 to PRD (CP-1)

**Given** the PRD at `_bmad-output/planning-artifacts/prd.md` has no functional requirement for multi-plan CRUD (implemented in Story 7.2)
**When** FR98 is added
**Then** a new entry appears in the PRD functional requirements section (Section 2: Guided Planning Experience or a new Section 18):
```
FR98: Franchisee can create, rename, clone (deep copy), and delete financial plans.
Cloning creates an independent copy of all financial inputs. Deletion requires
type-to-confirm and is blocked if only one plan remains (last-plan protection).
Plan list is visible in the sidebar with context menus for lifecycle actions.
```
**And** FR98 is positioned after FR97 in the document
**And** no other PRD content is modified

### AC-2: Update Architecture — Per-Month Independence Status (CP-2)

**Given** `architecture.md` line 94 describes per-month independence as "Deferred" and "backlogged pending PO decision"
**When** the status is updated
**Then** the text is replaced with:
```
**7.1b.1 Per-Month Independence (Stabilization Mini-Epic).** 60-element arrays for
revenue, COGS%, labor%, marketing% — extending the per-year infrastructure built in
Epic 7.1a. storedGranularity infrastructure and scaleForStorage conversion functions
are in place. Implementation requires: (a) schema extension from 5-element to
60-element arrays for qualifying fields, (b) engine input type updates, (c) Reports
UI for per-month editing at monthly drill level. Scheduled as part of the
post-Epic-7 stabilization mini-epic.
```
**And** no other architecture content is modified in this AC

### AC-3: Update Epics — Epic 10 Description (CP-3)

**Given** the Epic 10 summary in `epics.md` (line ~355-359) still references "Base, Conservative, and Optimistic scenarios" which were killed per SCP-2026-02-21 D1
**When** the Epic 10 summary description is updated
**Then** the summary is replaced with:
```
Standalone sidebar destination providing interactive graphical sensitivity analysis.
Franchisees adjust assumption sliders (revenue, COGS, labor, marketing, facilities)
and see 6 simultaneous charts (Profitability, Cash Flow, Break-Even, ROI, Balance
Sheet, Debt & Working Capital) comparing Base Case vs Your Scenario (user's live
slider state). This is a planning sandbox — slider adjustments do NOT change the
user's actual plan. Replaces the retired Story 5.7 column-splitting approach.
Per SCP-2026-02-21: Conservative/Optimistic system-defined columns killed (D1),
replaced with user-authored scenario model (D2/D3). Slider ranges: ±50%/±100%
visual range, uncapped numeric input (D6).
**Status:** Ready — Epic 5 dependency satisfied. Scheduled after stabilization
mini-epic.
```
**And** the Epic 10 stories line is updated to match the actual 4-story structure (10.1, 10.2a, 10.2b, 10.3) already documented in the detailed stories section
**And** the stale "Status: Deferred" line is removed

### AC-4: Update Epics — 7.1b.1 Status Change (CP-4)

**Given** the Epic 7 summary in `epics.md` (line 343) lists 7.1b.1 as "Deferred... backlogged pending PO decision"
**When** the status is updated
**Then** the text is replaced with:
```
**Remaining:** 7.1b.1 Per-Month Independence (60-element arrays for revenue, COGS%,
labor%, marketing%) — scheduled in stabilization mini-epic (Epic 7H). Infrastructure
(storedGranularity, scaleForStorage) in place from 7.1a.
```

### AC-5: Add Epic 7H Section to Epics (CP-5)

**Given** the Epic 7H stabilization sprint does not yet exist in `epics.md` (confirmed by grep — no matches for "Epic 7H")
**When** the new epic section is added
**Then** a new epic summary block is inserted after the Epic 7 summary (line ~344) and before the Epic 8 summary (line ~345), containing the full Epic 7H description from CP-5 of SCP-2026-02-22:
```
### Epic 7H: Post-Epic-7 Stabilization Sprint
Resolve accumulated gaps from Epic 7's mid-epic design pivot, complete the per-month
independence feature that was the core motivation for Epic 7's data model restructuring,
fix the Brand CRUD gap from Epic 2, and establish testing infrastructure standards.
All planning documents (PRD, Architecture, Epics, UX Spec) are realigned in this epic
to reflect what was actually built.

**Stories (5):**
- 7H.1 Planning Document Realignment — Update all 4 planning documents (PRD, Architecture,
  Epics, UX Spec) to reflect Epic 7 implementation decisions. Add FR98 (multi-plan CRUD).
  Update Epic 10 description. Remove stale pre-Epic-7 content from UX spec. Add facilities
  decomposition to UX spec. Update sidebar wireframe.
- 7H.2 Per-Month Independence (7.1b.1) — Extend PlanFinancialInputs schema from 5-element
  per-year arrays to 60-element per-month arrays for qualifying fields (revenue, COGS%,
  labor%, marketing%). Update engine input types. Add Reports UI for per-month editing at
  monthly drill level. Forms unchanged (single-value + "Set for all years" only).
- 7H.3 Brand CRUD Completion — Add brand deletion (with confirmation) and full metadata
  editing (name, display name, slug) to the brand management interface. Resolves Epic 2
  gap that is actively causing development pain (test agents create junk brands requiring
  manual PO cleanup).
- 7H.4 INPUT_FIELD_MAP Mechanical Validation — Add test-time assertion verifying every
  INPUT_FIELD_MAP entry has a format type matching FIELD_METADATA / engine output type.
  Build fails if a percentage field is mapped as currency. Closes the recurring display
  format bug (flagged in 3 consecutive retrospectives).
- 7H.5 E2E Testing Standards & Infrastructure — Document and enforce: test agents must
  authenticate as franchisee (not admin), must not use demo mode, must clean up test data.
  Update test helpers and documentation. Prevents junk brand accumulation and wasted tokens.

**Dependency chain:** 7H.1 (no code dependencies, can start immediately) → 7H.2 (extends
7.1a infrastructure) | 7H.3, 7H.4, 7H.5 (independent, can parallel)
```
**And** the new section is placed BEFORE the detailed story sections (which start at `## Epic 8:`)

### AC-6: Update Epics — FR Coverage Map (CP-6)

**Given** the FR Coverage Map in `epics.md` (line ~192-294) currently covers 111 FRs but does not include FR98
**When** FR98 is added to the coverage map
**Then** a new row is added to the FR Coverage Map table:
```
| FR98 | Epic 7 | Multi-plan lifecycle: create, rename, clone, delete with last-plan protection |
```
**And** the Coverage Summary header (line 294) is updated from "111/111" to "112/112" with the updated breakdown math including FR98
**And** the breakdown includes FR98 in the correct category

### AC-7: Update UX Spec — Two-Surface Boundary (CP-7 Issue 1)

**Given** the UX spec Part 7 (line 451+) describes the two-door model but does not explicitly state that Forms deliberately excludes per-year/per-month editing
**When** the two-surface boundary is added
**Then** a new subsection or paragraph is added to Part 7, after the "Critical design rules" list (line ~506), stating:
```
### Two-Surface Design Boundary (Epic 7 Decision)

Forms (My Plan) deliberately does NOT replicate Reports' per-year or per-month editing
granularity. My Plan provides single-value inputs with a "Set for all years" checkbox
only. Per-year independence and per-month independence are exclusively Reports
capabilities.

This is the core design principle adopted during Epic 7: Forms = onboarding wizard for
less experienced personas. Reports = power editing surface where all financial
assumptions are editable inline with full granularity. Expert users may skip Forms
entirely.
```
**And** the language is consistent with the design principle documented in the epics.md Epic 7 summary (line 333)

### AC-8: Update UX Spec — Mark Pre-Epic-7 Section Historical (CP-7 Issue 2)

**Given** UX spec Part 10 contains a "Pre-Epic-7 Per-Year Behavior" section (line 799-805) that describes behavior no longer applicable (link icons, broadcast editing)
**When** the section is marked as historical
**Then** the section is wrapped in a `<details>` tag with summary "Historical: Pre-Epic-7 Per-Year Behavior (superseded by Epic 7)" and a note:
```
> **Superseded by Epic 7 (2026-02-21).** Per-year editing is now independent — each year
> can have its own value. The link icon and broadcast behavior described below no longer
> apply. "Copy Y1 to all years" is available as an opt-in action, not the default.
```

### AC-9: Update UX Spec — Facilities Decomposition (CP-7 Issue 3)

**Given** UX spec Part 8 (My Plan Experience, line 518+) does not document the facilities decomposition interaction pattern implemented in Story 7.1d
**When** the facilities decomposition pattern is added
**Then** a new subsection is added to Part 8, after "Per-Field Metadata" (line ~567), describing:
```
### Facilities Guided Decomposition (Epic 7.1d)

The Facilities section in My Plan decomposes the single "Facilities" input into sub-fields:
- Rent
- Utilities
- Telecom
- Vehicle
- Insurance

Each sub-field accepts a monthly dollar value. The sub-fields roll up to a total
Facilities value that maps to the engine's facilities input.

**Mismatch handling:** When the decomposition sum differs from the Reports total (e.g.,
due to direct editing in Reports), an informational note is displayed: "Your itemized
total ($X) differs from the Reports total ($Y)." No action buttons, no proportional
redistribution — the note is advisory only. The user can resolve the difference by
editing either surface.
```

### AC-10: Update UX Spec — Mark Story Rewrite Section Historical (CP-7 Issue 4)

**Given** UX spec contains a "Story Rewrite Implications" section (line 1378) that suggests a 10-story structure for Epic 5, which was superseded by actual implementation (9 stories)
**When** the section is marked as historical
**Then** the section is wrapped in a `<details>` tag with summary "Historical: Story Rewrite Implications (superseded by implementation)" and a note:
```
> **Superseded (2026-02-20).** Epic 5 was implemented with 9 stories (5.1-5.6, 5.8-5.10),
> not the 10-story structure suggested below. Story 5.7 (Scenario Comparison) was retired
> and moved to Epic 10. See epics.md for the authoritative story structure.
```

### AC-11: Update UX Spec — Sidebar Wireframe (CP-7 Issue 5)

**Given** UX spec Part 7 sidebar wireframe (line 465-482) shows "MY LOCATIONS" with "All Plans (portfolio)" which does not match the actual implementation from Story 7.2
**When** the sidebar wireframe is updated
**Then** the wireframe is updated to reflect the actual implementation:
```
+-- Sidebar --------------------------------+
|                                            |
|  [Brand Logo / Katalyst]                   |
|                                            |
|  -- MY PLANS --                            |
|  ▸ PostNet - Downtown       [⋮]            |
|  ▸ PostNet - Mall Location  [⋮]            |
|  + Create New Plan                         |
|                                            |
|  -- [ACTIVE PLAN NAME] --                 |
|  My Plan                                   |
|  Reports                                   |
|  What-If                                   |
|  Settings                                  |
|                                            |
|  -- HELP --                                |
|  Glossary                                  |
|                                            |
+--------------------------------------------+
```
**And** the "Sidebar items explained" table (line 487-494) is updated to replace "All Plans" with "MY PLANS" and "Scenarios" with "What-If", and to remove "Planning Assistant" from the sidebar items (it is a slide-in panel within My Plan, not a sidebar destination)
**And** [⋮] context menus are noted as providing rename, clone, and delete actions per Story 7.2

### AC-12: Update UX Spec Change Log

**Given** all UX spec changes from AC-7 through AC-11 are complete
**When** the change log is updated
**Then** a new entry is added to the Change Log table (line ~1399):
```
| 2026-02-22 | **Epic 7H.1 Document Realignment.** Added two-surface design boundary (Part 7). Marked Pre-Epic-7 Per-Year Behavior as historical (Part 10). Added Facilities Guided Decomposition pattern (Part 8). Marked Story Rewrite Implications as historical. Updated sidebar wireframe to match Epic 7.2 implementation (MY PLANS section with context menus, What-If replaces Scenarios). | SCP-2026-02-22, CP-7 |
```

## Dev Notes

### Architecture Patterns to Follow

- **This is a documentation-only story.** The dev agent reads planning artifacts and edits markdown files. NO application source code is created or modified. Zero code changes.
- **Exact text replacements are provided.** CP-1 through CP-7 in `sprint-change-proposal-2026-02-22.md` contain the precise OLD and NEW text for most changes. Use the exact text from the SCP where provided.
- **Artifact locations (fixed — do NOT search for them):**
  - PRD: `_bmad-output/planning-artifacts/prd.md` — FR97 at line 902, add FR98 after
  - Architecture: `_bmad-output/planning-artifacts/architecture.md` — per-month status at line 94
  - Epics: `_bmad-output/planning-artifacts/epics.md` — Epic 7 summary lines 331-343, Epic 10 summary lines 355-359, FR Coverage Map lines 192-294
  - UX Spec: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` — Part 7 at line 451, Part 8 at line 518, Part 10 at line 730, Part 19 at line 1337, Story Rewrite at line 1378, Change Log at line 1397
  - Sprint Status: `_bmad-output/implementation-artifacts/sprint-status.yaml`
  - SCP (reference only): `_bmad-output/planning-artifacts/sprint-change-proposal-2026-02-22.md`
- **Follows Story 5H.4 precedent:** Documentation-only story with phased acceptance criteria. Same anti-pattern and constraint structure.
- **Source:** `_bmad-output/planning-artifacts/sprint-change-proposal-2026-02-22.md` (CP-1 through CP-7) and `_bmad-output/implementation-artifacts/epic-7-retrospective.md` (document misalignment inventory)

### Anti-Patterns & Hard Constraints

- **DO NOT** write, modify, or create any application source code files. This story edits exactly 4 planning artifacts (`prd.md`, `architecture.md`, `epics.md`, `ux-design-specification-consolidated.md`) and updates `sprint-status.yaml`.
- **DO NOT** delete content from the UX spec — mark stale sections as historical using `<details>` tags with supersedence notes. Stale content is an audit trail.
- **DO NOT** modify the detailed story sections in `epics.md` (the individual story acceptance criteria starting at `## Epic 1:`). Only modify the epic summary blocks and the FR Coverage Map.
- **DO NOT** modify architectural decisions, component trees, or technical implementation details in `architecture.md` — scope changes to the per-month status paragraph only (line 94).
- **DO NOT** change "three experience tiers" or "three behavioral tiers" references anywhere. The Story/Normal/Expert tier model is VALID. What was retired is "three modes" (Planning Assistant/Forms/Quick Entry).
- **DO NOT** add FR98 to the architecture document's FR table — that is a separate concern and would need its own verification. Scope architecture changes to CP-2 only.
- **DO NOT** self-approve — story completion requires Product Owner review and approval of all document changes.
- **DO NOT** run any application code, tests, or workflows. This is purely a document editing task.

### Gotchas & Integration Warnings

- **Epics.md line numbers shift as you edit.** The line numbers referenced in acceptance criteria are based on the pre-edit state. After inserting Epic 7H (AC-5), all subsequent line numbers in `epics.md` will shift down by ~20 lines. Edit in document order (top-down) or use content matching rather than line numbers.
- **FR Coverage Map breakdown math.** The current summary (line 294) says "111/111 FRs mapped (58 original FR1-FR58 + 15 FR59-FR73 admin support tools + 14 FR7a-FR7n financial statement views + 10 FR74-FR83 engine extensions + 14 FR84-FR97 display standards...)". Adding FR98 requires updating both the total (112/112) and the breakdown to include it. FR98 belongs to the Guided Planning Experience category (Section 2 of PRD), so the "58 original" count should become "59 original FR1-FR58, FR98" or FR98 should be added as its own addend.
- **UX spec sidebar wireframe alignment.** The sidebar wireframe update (AC-11) must be consistent with the sidebar items table. "Scenarios" → "What-If" is the naming change from SCP-2026-02-21. "Planning Assistant" is removed from the sidebar (it is a slide-in panel within My Plan, not a standalone sidebar destination). "Glossary" was added in Story 5.10.
- **UX spec Part 19 deferred items table.** Two items reference "Epic 7" as deferred-to target: "Per-year input columns" and "Multi-plan comparison." Both have been delivered. These entries should be marked as DONE in the deferred items table since Epic 7 is complete.
- **CP-8 and CP-9 are out of scope for this story.** CP-8 (Sprint Status Reset) was already executed during sprint planning regeneration. CP-9 (Process Changes) are operational standards, not document edits.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `_bmad-output/planning-artifacts/prd.md` | MODIFY | Add FR98 after FR97 (AC-1) |
| `_bmad-output/planning-artifacts/architecture.md` | MODIFY | Update per-month independence status paragraph at line 94 (AC-2) |
| `_bmad-output/planning-artifacts/epics.md` | MODIFY | Update Epic 10 description (AC-3), update 7.1b.1 status (AC-4), add Epic 7H section (AC-5), add FR98 to coverage map and update summary (AC-6) |
| `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` | MODIFY | Add two-surface boundary (AC-7), mark pre-Epic-7 section historical (AC-8), add facilities decomposition (AC-9), mark story rewrite historical (AC-10), update sidebar wireframe (AC-11), update change log (AC-12) |
| `_bmad-output/implementation-artifacts/sprint-status.yaml` | MODIFY | Update 7H.1 status from backlog to ready-for-dev → in-progress → done as story progresses |

### Dependencies & Environment Variables

- No packages, env vars, or external services required.
- No code dependencies — this story can start immediately (first in Epic 7H dependency chain).

### References

- Source: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-02-22.md` — CP-1 through CP-7 contain the exact change specifications
- Source: `_bmad-output/implementation-artifacts/epic-7-retrospective.md` — Part 2 documents the design pivot and document misalignment inventory
- Precedent: `_bmad-output/implementation-artifacts/5h-4-planning-artifact-alignment.md` — Story 5H.4 is the precedent for phased documentation audit structure
- Source: `_bmad-output/planning-artifacts/epics.md` — Epic 7H summary in SCP-2026-02-22 CP-5
- Source: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` — UX design authority

## Dev Agent Record

### Agent Model Used

Claude 4.6 Opus (via Replit Agent)

### Completion Notes

Documentation-only story — all 12 acceptance criteria satisfied. Four planning artifacts edited with exact text from SCP-2026-02-22 CP-1 through CP-7. Key changes:
- PRD: Added FR98 (multi-plan CRUD) after FR97
- Architecture: Updated per-month independence status from "Deferred" to "Stabilization Mini-Epic" with implementation requirements
- Epics: Updated Epic 10 description (SCP-2026-02-21 decisions), changed 7.1b.1 from "Deferred" to "Remaining/scheduled", added Epic 7H section (5 stories), added FR98 to FR Coverage Map (112/112)
- UX Spec: Added Two-Surface Design Boundary subsection, marked Pre-Epic-7 Per-Year Behavior historical, added Facilities Guided Decomposition pattern, marked Story Rewrite Implications historical, updated sidebar wireframe (MY PLANS section with context menus, What-If replaces Scenarios, Glossary replaces Planning Assistant), marked 2 deferred items as DONE in Part 19, added changelog entry

### File List

- `_bmad-output/planning-artifacts/prd.md` — MODIFIED (AC-1: FR98 added)
- `_bmad-output/planning-artifacts/architecture.md` — MODIFIED (AC-2: per-month independence status updated)
- `_bmad-output/planning-artifacts/epics.md` — MODIFIED (AC-3: Epic 10 desc, AC-4: 7.1b.1 status, AC-5: Epic 7H section, AC-6: FR Coverage Map 112/112)
- `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` — MODIFIED (AC-7: two-surface boundary, AC-8: pre-Epic-7 historical, AC-9: facilities decomposition, AC-10: story rewrite historical, AC-11: sidebar wireframe, AC-12: changelog)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — MODIFIED (story status tracking)
- `_bmad-output/implementation-artifacts/7h-1-planning-document-realignment.md` — MODIFIED (story status + dev agent record)

### Testing Summary

- **Test approach:** Document inspection — grep verification of all 12 ACs against edited files
- **Test files:** None (documentation-only story, no code or test files created)
- **ACs covered:** All 12 (AC-1 through AC-12) verified via content matching
- **All tests passing:** Yes (all 12 ACs satisfied)
- **LSP Status:** 0 errors, 0 warnings (no code files modified)
- **Visual Verification:** N/A (documentation-only story, not user-facing)
