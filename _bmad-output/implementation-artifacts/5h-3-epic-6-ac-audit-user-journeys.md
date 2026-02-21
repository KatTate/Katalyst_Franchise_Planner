# Story 5H.3: Epic 6 Story Acceptance Criteria Audit Against User Journeys

Status: ready-for-dev

## Story

As a product stakeholder,
I want Stories 6.1 and 6.2 reviewed against user journeys to verify the documented journey produces the expected outcome,
So that Epic 6 implementation begins with verified, complete acceptance criteria that reflect real user needs.

## Acceptance Criteria

### AC-1: Journey-to-Story Mapping (Phase 1)

**Given** Stories 6.1 and 6.2 exist in `_bmad-output/planning-artifacts/epics.md` (Epic 6 section, lines 1807-1867)
**When** they are read against the 8 user journeys in the UX spec Part 15
**Then** the following journey steps are explicitly mapped to story ACs:

*Journey 1 (Sam — Normal Tier), relevant steps:*
- Step 19: Sam sees Document Preview widget on Dashboard with his name displayed — "Sam's PostNet Business Plan." DRAFT watermark appears because completeness < 90%.
- Step 20: Sam finishes customizing remaining inputs (completeness > 90%). DRAFT watermark disappears. Button label changes to "Generate Lender Package."
- Step 21: Sam clicks "Generate Lender Package." A professional PDF downloads — his name, his numbers, his plan. He feels ready for his bank meeting.

*Journey 2 (Sam — Story Tier), relevant steps:*
- Steps 13-21: Identical to Journey 1 steps 12-21 — AI-assisted inputs flow through same engine, same document generation experience.

*Journey 3 (Returning Franchisee), relevant step:*
- Step 3: Document Preview widget shows DRAFT watermark at 45% completeness.

*Journey 5 (Denise — Brand Setup), relevant step:*
- Step 8: Denise validates brand configuration by comparing engine outputs against the reference spreadsheet. This validates the engine, not the document, but the document depends on the engine.

**And** each journey step is annotated with: which Story AC(s) cover it, whether coverage is complete or partial, and any gap identified.

### AC-2: Gap Analysis (Phase 2) — Specific Gap Checks

**Given** the journey-to-story mapping is complete
**When** gaps are identified
**Then** each gap is documented with: the journey step, what the journey describes that the story ACs don't cover, the impact (blocker, quality risk, or enhancement), and a proposed AC amendment.

The following areas are specifically checked for gaps:

1. **Pride moment:** Does Story 6.1 explicitly require the franchisee's name to appear prominently on the document? (Journey 1, Step 21: "his name, his numbers, his plan")
2. **Completeness-aware behavior:** Do the ACs handle the full spectrum: <50% (DRAFT watermark + default-values note), 50-90% (partial, "Generate Package" label), >90% ("Generate Lender Package" label, no watermark)?
3. **Multi-brand identity:** Does the PDF render with brand-specific identity (logo, colors) per the brand configuration? (Journey 5: PostNet branding vs. Jeremiah's branding)
4. **Document content completeness:** Does the PDF include ALL sections listed in Story 6.1 AC (cover page, executive summary, P&L, Balance Sheet, Cash Flow, ROIC, Valuation, break-even analysis, startup capital summary)?
5. **FTC disclaimers:** Are FR25 disclaimers on every page, not just the cover?
6. **Download behavior:** Is the PDF available for immediate download? Is it also stored for Story 6.2 document history?
7. **Error states:** What happens if PDF generation fails? (Network error, server timeout, missing data) The journeys describe a happy path — stories must also cover unhappy paths.
8. **Scenario content:** Story 6.1 previously had a scenario comparison AC that was retired per SCP-2026-02-20 D5/D6. Confirm the retired AC (lines 1838-1840) is properly struck through and not creating ambiguity.
9. **Document history access:** Does Journey 1 describe accessing previously generated documents, or is that only in Story 6.2? Is there a journey gap for document history?
10. **Vague or subjective ACs:** Flag any AC in Stories 6.1 or 6.2 that is vague enough to invite agent interpretation — e.g., "professional formatting... that matches or exceeds what a financial consultant would produce" is subjective. Propose concrete, measurable criteria to replace subjective language. (Lesson from Epic 5 retrospective: agents interpret vague ACs differently across sessions.)
11. **Future journey considerations (non-blocking):** Note that Journey 4 (Chris — What-If Playground, Epic 10) and Journey 8 (Denise — View As, Epic 12) have edge cases affecting document generation (scenario state in PDF, impersonation identity in PDF) — document as awareness items for those future epics, not as gaps in Epic 6.

### AC-3: AC Amendment Proposals (Phase 3)

**Given** gaps are identified
**When** amendments are proposed
**Then** each proposed amendment includes: the specific AC text to add or modify, the journey step that justifies it, and the FR traceability (FR24, FR25, FR26, FR27, FR7n)
**And** amendments are documented in a format ready for Product Owner review and approval before implementation begins
**And** the Product Owner must approve all amendments — no implementation begins on unapproved AC changes

### AC-4: Story 5.9 Handoff Verification

**Given** Story 5.9 (Document Preview & PDF Generation Trigger) established the entry points for PDF generation — Dashboard widget, Impact Strip icon, Reports header button
**When** the handoff to Story 6.1 is examined
**Then** the audit verifies that all 3 entry points documented in Story 5.9 are referenced in Story 6.1's ACs or dev notes:
- Dashboard preview widget "Generate PDF" button → Story 6.1 triggers
- Impact Strip document icon → Document Preview modal → "Generate PDF" button → Story 6.1 triggers
- Reports header "Generate PDF" button → Story 6.1 triggers
**And** any handoff gap (entry point in 5.9 not referenced in 6.1, or vice versa) is documented as a gap finding

### AC-5: Completeness Threshold Consistency Check

**Given** Story 5.9 defines button label evolution as: <50% → "Generate Draft", 50-90% → "Generate Package", >90% → "Generate Lender Package"
**And** Story 6.1 defines DRAFT watermark threshold as <50% completeness
**And** Journey 1 Step 19 describes DRAFT watermark when completeness <90% and Journey 1 Step 20 describes watermark disappearing when completeness >90%
**When** these three sources are compared
**Then** any inconsistency in completeness thresholds between Story 5.9, Story 6.1, and the user journeys is documented as a gap finding with a recommendation for which source should be authoritative

### AC-6: Output Deliverable Format

**Given** this story produces a documentation artifact, not code
**When** the audit is complete
**Then** a single markdown document is produced containing:
- Section 1: Journey-to-Story mapping table (journey step → Story AC → coverage status → gap)
- Section 2: Gap analysis with impact classification (blocker / quality risk / enhancement)
- Section 3: AC amendment proposals in PO-reviewable format
- Section 4: Future journey considerations (non-blocking awareness items)
**And** the document is saved as an appendix or update to this story file in the Dev Agent Record section

## Dev Notes

### Architecture Patterns to Follow

- **This is a documentation-only story.** The dev agent reads artifacts, produces analysis, and writes a structured audit document. No application source code is created or modified.
- **Artifact locations are fixed:**
  - User journeys: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md`, Part 15 (lines 1008-1216)
  - Stories 6.1 and 6.2: `_bmad-output/planning-artifacts/epics.md`, Epic 6 section (lines 1800-1867)
  - Story 5.9 (handoff context): `_bmad-output/planning-artifacts/epics.md` (lines 1377-1414)
  - PRD functional requirements: FR24, FR25, FR26, FR27 are defined in epics.md lines 54-57, with mapping at lines 231-234
  - FR7n definition: epics.md line 214
  - Architecture document generation design: `_bmad-output/planning-artifacts/architecture.md` — Decision 13 (PostgreSQL metadata + Replit Object Storage), API endpoints (POST/GET only), `generated_documents` schema, IStorage immutability enforcement
  - Sprint status: `_bmad-output/implementation-artifacts/sprint-status.yaml`

- **Mapping table format (follow consistently):**

| Journey | Step | Description | Story | AC | Coverage | Gap |
|---------|------|-------------|-------|----|----------|-----|
| J1 | 19 | Document Preview with name, DRAFT watermark | 6.1 | AC-1 | Full/Partial/None | Description if gap |

- **Gap classification scheme:**
  - **Blocker** — Journey describes behavior that no AC covers; implementation would miss it entirely
  - **Quality Risk** — AC exists but is vague, subjective, or incomplete; implementation could diverge
  - **Enhancement** — Journey implies nice-to-have behavior not strictly required by FRs; note for future

- **Amendment proposal format:**
```
**Gap ID:** GAP-XX
**Journey:** Journey N, Step X
**FR Traceability:** FRXX
**Current AC Text:** (quote or "none — missing")
**Proposed Amendment:** (specific AC text to add or modify)
**Impact Classification:** Blocker / Quality Risk / Enhancement
**Rationale:** (why this gap matters for the product)
```

- Source: `_bmad-output/planning-artifacts/epics.md` Epic 5H, Story 5H.3 (lines 1660-1729)

### Anti-Patterns & Hard Constraints

- **DO NOT** write, modify, or create any application source code files. This workflow produces ONE markdown artifact as output — the audit document appended to this story file.
- **DO NOT** modify Stories 6.1 or 6.2 directly in `epics.md`. The audit produces amendment *proposals* for PO review. The PO (or a subsequent workflow) applies approved amendments.
- **DO NOT** mark a journey step as "covered" if the AC is vague or subjective — flag it as a Quality Risk gap instead. Lesson from Epic 5 retrospective: agents interpret vague ACs differently across sessions, leading to inconsistent implementations.
- **DO NOT** invent requirements not traceable to user journeys or FRs. Every gap must cite a specific journey step and/or FR number.
- **DO NOT** treat Journey 4 (What-If Playground) or Journey 8 (View As) gaps as Epic 6 blockers. These are awareness items for Epics 10 and 12 respectively. Document them in Section 4 (non-blocking) only.
- **DO NOT** skip the completeness threshold consistency check (AC-5). There is a known discrepancy: Journey 1 describes DRAFT at <90%, Story 6.1 says <50%, and Story 5.9 has a three-tier label system (<50%, 50-90%, >90%). This must be explicitly analyzed and a recommendation made.
- **DO NOT** assume the retired scenario AC (epics.md lines 1838-1841) is harmless — confirm it is struck through and that no other ACs implicitly depend on scenario comparison being active in Reports.

### Gotchas & Integration Warnings

- **Completeness threshold inconsistency (KNOWN):** Journey 1 Step 19 says DRAFT watermark appears because "completeness < 90%", but Story 6.1 says DRAFT watermark at "< 50% completeness." Story 5.9 introduces a three-tier system: <50% (Generate Draft), 50-90% (Generate Package), >90% (Generate Lender Package). The audit MUST reconcile these three sources and propose a single authoritative threshold model. The UX spec Part 7 and Part 13 may have additional context.
- **Retired scenario AC still visible:** Story 6.1 lines 1838-1841 are struck through (scenario comparison in PDF), with a retirement note. Verify no other AC references or depends on this retired behavior. The `~~strikethrough~~` markdown may not render in all tools the dev agent uses — confirm the agent recognizes the retirement.
- **"Professional formatting" subjectivity:** Story 6.1 contains "professional formatting with brand identity... and financial tables with formatting that matches or exceeds what a financial consultant would produce." This is the kind of subjective language that caused agent divergence in Epic 5. The audit must flag this and propose measurable criteria.
- **Story 6.2 thumbnail preview:** The AC requires "each document entry shows a thumbnail preview of the first page." This is a non-trivial implementation detail — the audit should flag whether this is sufficiently specified (what technology generates the thumbnail? is it stored or rendered on-the-fly?).
- **IStorage immutability design:** Architecture Decision 13 enforces immutability at the interface level — no `updateDocument()` or `deleteDocument()` methods exist. Story 6.2 should reference this constraint to prevent the dev agent from accidentally creating mutation endpoints.
- **NFR3 performance target:** PDF generation must complete within 30 seconds. Neither story AC explicitly states this timeout, though Story 6.1 mentions "within 30 seconds (NFR3)." Verify this is testable.
- **Story 5.9 was already implemented** — the Document Preview widget, Impact Strip document icon, and Reports header button already exist in the codebase. Story 6.1 connects to these existing trigger points. The audit should verify that Story 6.1's ACs align with what 5.9 actually built (not just what 5.9 planned).
- **8 user journeys exist, but only 4-5 are directly relevant to Epic 6.** Journeys 1, 2, 3, and 5 have explicit document generation steps. Journey 6 (Inviting a Franchisee) does not. Journey 7 (Franchisor Pipeline) does not interact with documents. Journey 4 and 8 have edge-case implications only. The dev agent should not waste effort mapping irrelevant journeys in detail.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `_bmad-output/implementation-artifacts/5h-3-epic-6-ac-audit-user-journeys.md` | MODIFY | Append audit results to Dev Agent Record section |

This is a documentation-only story. No application source code files are created, modified, or replaced.

### Testing Expectations

- **No automated tests.** This story produces a documentation artifact, not code. There are no Vitest or Playwright tests to write.
- **Verification is manual:** The PO reviews the audit document for completeness, accuracy, and actionability of amendment proposals.
- **Quality gate:** Every journey step relevant to Epic 6 must appear in the mapping table. No journey step should be silently skipped. The dev agent should confirm the total number of mapped steps matches expectations.
- **Cross-reference check:** Every proposed amendment must cite a specific FR number (FR24, FR25, FR26, FR27, or FR7n) and a specific journey step. Amendments without traceability are rejected.

### Dependencies & Environment Variables

- **No packages to install.** This is a documentation-only workflow.
- **No environment variables needed.**
- **Depends on:**
  - Story 5H.1 (done) — engine validated, providing confidence that PDF content will be correct
  - Story 5H.2 (review) — UI audit complete, providing confidence that the visual representation is correct
  - UX spec Part 15 user journeys exist (confirmed — 8 journeys documented 2026-02-20)
  - Stories 6.1 and 6.2 exist in epics.md (confirmed — lines 1807-1867)
- **Blocks:** Epic 6 implementation — Stories 6.1 and 6.2 should not begin until this audit is complete and PO has approved any AC amendments

### References

- [Source: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` Part 15] — 8 user journey narratives (lines 1008-1216)
- [Source: `_bmad-output/planning-artifacts/epics.md` Epic 6] — Stories 6.1 and 6.2 (lines 1800-1867)
- [Source: `_bmad-output/planning-artifacts/epics.md` Epic 5H, Story 5H.3] — Story definition and context (lines 1660-1729)
- [Source: `_bmad-output/planning-artifacts/epics.md` Story 5.9] — Document Preview & PDF Generation Trigger (lines 1377-1414)
- [Source: `_bmad-output/planning-artifacts/epics.md` FR definitions] — FR24 (line 54), FR25 (line 55), FR26 (line 56), FR27 (line 57), FR7n (line 214)
- [Source: `_bmad-output/planning-artifacts/architecture.md` Decision 13] — Document storage architecture (PostgreSQL metadata + Replit Object Storage, IStorage immutability enforcement)
- [Source: `_bmad-output/planning-artifacts/architecture.md` API endpoints] — POST/GET only for documents (no PUT/PATCH/DELETE)
- [Source: `_bmad-output/planning-artifacts/architecture.md` generated_documents schema] — plan_id, document_type, version, inputs_snapshot, file_path, generated_at, is_immutable
- [Source: `_bmad-output/project-context.md`] — Agent session control rules, code review discipline, financial engine reference validation context
- [Source: `_bmad-output/implementation-artifacts/5h-1-financial-engine-reference-validation.md`] — Prerequisite story (done)
- [Source: `_bmad-output/implementation-artifacts/5h-2-report-tab-ui-audit-remediation.md`] — Previous story in epic (review)
- [Source: `_bmad-output/implementation-artifacts/epic-5-retrospective.md` AI-3] — Origin action item for this story

### Agent Session Control Rules (Mandatory — carried from 5H.1, 5H.2)

1. **No self-approval:** Do NOT approve your own work product — story completion requires Product Owner confirmation of the audit document.
2. **No code changes:** This story produces documentation only. If you find yourself writing application code, STOP. That is the wrong workflow.
3. **No direct epics.md edits:** Amendment proposals go to the PO for review. Do NOT modify Stories 6.1 or 6.2 directly.
4. **Exhaustive coverage:** Every relevant journey step must appear in the mapping table. Silently skipping a step because it seems "obvious" or "already covered" is not acceptable — make the mapping explicit.
5. **Cite everything:** Every gap finding and amendment proposal must cite specific journey steps, FR numbers, and story AC references. Unsourced claims are rejected.
6. **Threshold reconciliation is mandatory:** The completeness threshold inconsistency (AC-5) is a known issue. Do not skip it or hand-wave it. Produce a concrete recommendation.

## Dev Agent Record

### Agent Model Used

### Completion Notes

### Audit Document

_(Dev agent appends the full audit results here)_

### File List

### Testing Summary
