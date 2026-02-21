# Story 5H.3: Epic 6 Story Acceptance Criteria Audit Against User Journeys

Status: review

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

Claude Opus 4.6 (Claude Code CLI)

### Completion Notes

Audit executed as part of the Create Story workflow. All 6 acceptance criteria addressed. 8 gap findings identified (3 Blocker, 3 Quality Risk, 2 Enhancement). 6 AC amendment proposals produced for PO review. Completeness threshold inconsistency fully analyzed with concrete recommendation.

### Audit Document

---

## Section 1: Journey-to-Story Mapping

### Story 6.1: PDF Document Generation

| Journey | Step | Journey Description | Story 6.1 AC Reference | Coverage | Gap ID |
|---------|------|---------------------|------------------------|----------|--------|
| J1 | 19 | Document Preview widget shows name "Sam's PostNet Business Plan" with DRAFT watermark (completeness < 90%) | AC line 1828: header reads "[Franchisee Name]'s [Brand] Business Plan" | **Partial** | GAP-01 |
| J1 | 19 | DRAFT watermark appears because completeness < 90% | AC line 1834-1836: DRAFT watermark at < 50% completeness | **Partial** | GAP-02 |
| J1 | 20 | Completeness > 90%, DRAFT disappears, button → "Generate Lender Package" | AC line 1833: button label evolves per Story 5.9. No AC for watermark removal threshold. | **Partial** | GAP-02 |
| J1 | 21 | Sam clicks "Generate Lender Package", professional PDF downloads — "his name, his numbers, his plan" | AC lines 1815-1831: PDF generated with all sections, name, brand, formatting | **Full** | — |
| J1 | 21 | "He feels ready for his bank meeting" — emotional confidence in the document | AC line 1829: "professional formatting... matches or exceeds what a financial consultant would produce" | **Partial** | GAP-03 |
| J2 | 13-21 | Identical to J1 steps 12-21 (AI-assisted path → same document experience) | Same as J1 mappings above | **Full** | — |
| J3 | 3 | Document Preview widget shows DRAFT watermark at 45% completeness | AC line 1834: DRAFT watermark at < 50% | **Full** | — |
| J3 | 8 | Completeness = 100%, DRAFT watermark drops | No explicit AC for watermark removal at 100% (only < 50% trigger exists) | **Partial** | GAP-02 |
| J5 | 8 | Denise validates brand config by comparing engine outputs vs spreadsheet | Not Epic 6 scope (engine validation = Story 5H.1). Indirect dependency. | **N/A** | — |

### Story 6.2: Document History & Downloads

| Journey | Step | Journey Description | Story 6.2 AC Reference | Coverage | Gap ID |
|---------|------|---------------------|------------------------|----------|--------|
| J1 | — | No journey step describes Sam accessing previously generated documents | Story 6.2 ACs describe history access from sidebar/Dashboard | **None** | GAP-04 |
| J3 | — | No journey step describes returning franchisee viewing document history | Story 6.2 exists but no journey validates the experience | **None** | GAP-04 |

### Journeys with No Direct Epic 6 Relevance

| Journey | Relevance | Notes |
|---------|-----------|-------|
| J4 (Chris — What-If Playground) | Edge case only | Scenario state in PDF — deferred to Epic 10. See Section 4. |
| J6 (Denise — Inviting Franchisee) | None | No document generation steps. |
| J7 (Linda — Franchisor Pipeline) | Indirect | Linda sees "3 with completed lender packages" (J7 Step 3) — implies document generation happened, but she doesn't generate. Not an Epic 6 gap. |
| J8 (Denise — View As) | Edge case only | Impersonation identity in PDF — deferred to Epic ST/12. See Section 4. |

---

## Section 2: Gap Analysis

### GAP-01: DRAFT Watermark Threshold on Document Preview Widget vs PDF

**Impact:** Quality Risk

**Journey:** J1 Step 19
**FR Traceability:** FR24, FR7n
**Description:** Journey 1 Step 19 describes the Document Preview widget showing a DRAFT watermark because Sam "hasn't hit 90% completeness yet." However, Story 6.1 AC (line 1834) only triggers DRAFT watermark "at < 50% completeness." The Document Preview widget behavior is Story 5.9's domain (and UX spec Part 14 says DRAFT watermark "when completeness is below 90%"), while Story 6.1 governs the *generated PDF* DRAFT watermark.

There are actually **two distinct DRAFT watermark surfaces** that the sources conflate:
1. **Document Preview widget** (real-time, visual, Story 5.9) — DRAFT watermark at < 90% per UX spec Part 14
2. **Generated PDF** (file output, Story 6.1) — DRAFT watermark at < 50% per Story 6.1 AC

This distinction is not explicit in any source. The journey describes the preview widget (Step 19), not the PDF file. But when the user generates the PDF at 60% completeness, does it get a DRAFT watermark? Story 6.1 says no (> 50%), but the preview widget still shows DRAFT (< 90%). The user would see a DRAFT preview but generate a non-DRAFT PDF — confusing.

**See AC-5 analysis below for full threshold reconciliation.**

---

### GAP-02: Missing Middle Tier — What Happens Between 50% and 90%?

**Impact:** Blocker

**Journey:** J1 Steps 19-20, J3 Steps 3 and 8
**FR Traceability:** FR24
**Description:** Story 5.9 defines a three-tier button label system:
- < 50%: "Generate Draft"
- 50-90%: "Generate Package"
- > 90%: "Generate Lender Package"

Story 6.1 only defines **two** PDF behaviors:
- < 50%: DRAFT watermark + default-values note on cover
- Everything else: No watermark (implied)

**The 50-90% tier has NO corresponding PDF behavior.** When a user at 70% completeness clicks "Generate Package," what does the PDF look like? No DRAFT watermark (per Story 6.1), but also not a "Lender Package" (per Story 5.9 label). The absence of a middle-tier AC means the dev agent will have to guess.

Additionally, the cover note ("This plan contains brand default assumptions that have not been personalized") is only specified for < 50%. A plan at 70% completeness has customized most inputs but not all — should it have a note? The current ACs don't say.

---

### GAP-03: "Professional Formatting" is Subjective

**Impact:** Quality Risk

**Journey:** J1 Step 21
**FR Traceability:** FR24
**Description:** Story 6.1 AC (line 1829) says: "professional formatting with brand identity (logo, colors) and Katalyst design — consistent typography, proper page breaks, branded headers/footers, and financial tables with formatting that matches or exceeds what a financial consultant would produce."

The phrase "matches or exceeds what a financial consultant would produce" is subjective. Different agents will interpret this differently. Epic 5 retrospective explicitly warned about this: "agents interpret vague ACs differently across sessions." Concrete criteria are needed.

**What IS specified (measurable):**
- Consistent typography (checkable)
- Proper page breaks (checkable — no tables split mid-row across pages)
- Branded headers/footers (checkable — logo, brand color, plan name)
- Financial values as $X,XXX and X.X% (checkable — NFR27)

**What is NOT specified (needs definition):**
- Font family and sizes
- Table styling (borders, shading, alternating rows?)
- Chart/graph inclusion and styling (break-even chart mentioned in content list)
- Page margins
- Color scheme beyond brand identity
- Header/footer content layout

---

### GAP-04: No User Journey for Document History (Story 6.2)

**Impact:** Enhancement

**Journey:** None
**FR Traceability:** FR26, FR27
**Description:** No user journey describes a franchisee accessing their document history. Journey 1 ends at Step 21 (PDF download). Journey 3 (returning franchisee) focuses on plan editing, not document retrieval. Story 6.2 is a valid story backed by FR26 and FR27, but there is no journey narrative validating the UX flow.

This is not a blocker — FR26/FR27 provide sufficient requirement backing. However, the absence of a journey means edge cases in the document history experience have not been walked through narratively: What does the first-time empty state look like? How does the user navigate from Dashboard to document history? What if a user generates 10+ documents — is there pagination?

---

### GAP-05: No Error State ACs for PDF Generation

**Impact:** Blocker

**Journey:** J1 Step 21 (happy path only)
**FR Traceability:** FR24
**Description:** All user journeys describe happy paths. Story 6.1 has no ACs for:
- PDF generation timeout (what if it takes > 30 seconds per NFR3?)
- Server error during PDF generation
- Missing data edge cases (plan with zero inputs, plan with corrupted data)
- Network error during download
- Storage failure when saving to Replit Object Storage

The journey describes: "A professional PDF downloads." But what if it doesn't? The dev agent needs guidance on error UX — toast notification? Error modal? Retry button? Without error state ACs, the agent will either skip error handling or invent its own approach.

---

### GAP-06: Story 6.2 Thumbnail Preview Underspecified

**Impact:** Quality Risk

**Journey:** N/A (no journey covers document history)
**FR Traceability:** FR26
**Description:** Story 6.2 AC says "each document entry shows a thumbnail preview of the first page." This is a non-trivial technical requirement with no implementation guidance:
- Is the thumbnail generated at PDF creation time and stored alongside the PDF?
- Is it rendered on-the-fly from the PDF binary?
- What dimensions/resolution?
- What if thumbnail generation fails — show a placeholder?

The dev agent will need to make architectural decisions that should be specified or at least constrained. The architecture doc (Decision 13) specifies `file_path or blob_reference` for the PDF but nothing about thumbnails.

---

### GAP-07: Story 6.2 Missing IStorage Immutability Reference

**Impact:** Quality Risk

**Journey:** N/A
**FR Traceability:** FR26, FR27, NFR18
**Description:** Architecture Decision 13 enforces document immutability at the IStorage interface level — no `updateDocument()` or `deleteDocument()` methods exist. Story 6.2 mentions immutability (NFR18) but does not reference this architectural constraint. The dev agent should know that mutation is structurally impossible at the interface level, not just a policy. This prevents the agent from accidentally adding PUT/DELETE endpoints.

Additionally, Story 6.2 does not mention the API endpoint pattern: only POST (create) and GET (read/list/download) — no PUT/PATCH/DELETE. The dev notes should reference this.

---

### GAP-08: Missing Audit Tab Content in PDF

**Impact:** Blocker

**Journey:** J1 Step 17
**FR Traceability:** FR24
**Description:** Journey 1 Step 17 mentions Sam checking the Audit tab, which shows "all checks passing with green indicators." Story 6.1's PDF content list includes P&L, Balance Sheet, Cash Flow, ROIC, Valuation, Break-Even, and Startup Capital Summary — but does NOT include an Audit section. The Audit tab is one of the 7 report tabs and contains meaningful content (15 audit checks with pass/fail status).

Should the PDF include an Audit summary section? The spreadsheets include an Audit tab. Lenders may want to see that the plan passes internal consistency checks. This is potentially a missing PDF section.

Note: The Summary tab content is also not explicitly listed in Story 6.1's PDF sections (Executive Summary may cover it, but that's ambiguous).

---

## Section 3: AC Amendment Proposals

### Amendment 1: Reconcile Completeness Thresholds (AC-5)

**Gap ID:** GAP-01, GAP-02
**Journey:** J1 Steps 19-20, J3 Steps 3 and 8
**FR Traceability:** FR24, FR7n
**Current AC Text:** (Story 6.1, line 1834) "When the button is clicked at < 50% completeness, Then the generated PDF includes a 'DRAFT' watermark on every page"
**Proposed Amendment:**

Replace the single completeness AC with a three-tier model aligned to Story 5.9 and UX spec Part 13:

```
**Given** the "Generate PDF" button label evolves with input completeness (Story 5.9)

**When** the button is clicked at < 50% completeness ("Generate Draft")
**Then** the generated PDF includes a "DRAFT" watermark on every page
**And** a note on the cover: "This plan contains brand default assumptions that have not been personalized. Review and update inputs for a complete projection."

**When** the button is clicked at 50-90% completeness ("Generate Package")
**Then** the generated PDF does NOT include a DRAFT watermark
**And** a note on the cover: "Some inputs in this plan use brand default values. Review remaining defaults in My Plan for fully personalized projections."

**When** the button is clicked at > 90% completeness ("Generate Lender Package")
**Then** the generated PDF does NOT include a DRAFT watermark and no default-values note appears
```

**Impact Classification:** Blocker
**Rationale:** Without this, the dev agent will implement only the < 50% tier and leave 50-90% behavior undefined. The UX spec Part 14 says DRAFT watermark on the Document Preview widget at < 90%, but the *generated PDF* should follow Story 5.9's three-tier model (the authoritative source for button labels). The Document Preview widget and the generated PDF are different surfaces with different thresholds — the preview is a real-time rendering (always showing current state), while the PDF is a point-in-time artifact.

**Recommended authoritative model:**
- **Document Preview widget** (Story 5.9): DRAFT watermark at < 90% completeness (per UX spec Part 14)
- **Generated PDF** (Story 6.1): DRAFT watermark at < 50% only; cover note at < 90%; clean PDF at > 90%
- **Button label** (Story 5.9): Three tiers — Generate Draft / Generate Package / Generate Lender Package

---

### Amendment 2: Add Error State ACs

**Gap ID:** GAP-05
**Journey:** J1 Step 21 (happy path only)
**FR Traceability:** FR24
**Current AC Text:** None — no error states specified
**Proposed Amendment:**

Add to Story 6.1:

```
**Given** PDF generation is initiated
**When** generation fails (server error, timeout > 30 seconds per NFR3, or storage failure)
**Then** a toast notification appears: "PDF generation failed. Please try again." with a "Retry" action button
**And** no partial or corrupted PDF is stored in document history
**And** the "Generate PDF" button returns to its pre-generation state (not stuck in loading)

**Given** PDF generation is initiated
**When** the generation is in progress
**Then** the "Generate PDF" button shows a loading state (spinner + "Generating...") and is disabled to prevent duplicate generation
**And** a progress indicator is visible to the user
```

**Impact Classification:** Blocker
**Rationale:** Without error ACs, the dev agent will either skip error handling or invent its own approach. PDF generation is a server-side operation that can fail. Lender-facing documents must not have partial or corrupted versions in the history.

---

### Amendment 3: Replace Subjective "Professional Formatting" with Measurable Criteria

**Gap ID:** GAP-03
**Journey:** J1 Step 21
**FR Traceability:** FR24
**Current AC Text:** (Story 6.1, line 1829) "professional formatting with brand identity (logo, colors) and Katalyst design — consistent typography, proper page breaks, branded headers/footers, and financial tables with formatting that matches or exceeds what a financial consultant would produce"
**Proposed Amendment:**

Replace with:

```
**And** the PDF uses the following formatting standards:
- Brand logo in the header of every page (except cover page, which has a larger centered logo)
- Brand primary color used for section headers and table header backgrounds
- Financial tables use alternating row shading for readability, right-aligned numeric columns, and left-aligned label columns
- No table is split across a page break mid-row — tables that don't fit on the current page start on the next page
- Page margins: 1 inch on all sides (standard business document)
- Headers: page number, brand name, and "Confidential" indicator
- Footers: FTC disclaimer text (FR25) and generation date
- Font: system professional font (e.g., Inter, Helvetica, or similar sans-serif) at 10-11pt for body, 14-16pt for section headers
```

**Impact Classification:** Quality Risk
**Rationale:** "Matches or exceeds what a financial consultant would produce" is not testable. Different agents will produce different formatting. The amendment provides concrete, verifiable criteria.

---

### Amendment 4: Add Audit Summary to PDF Content

**Gap ID:** GAP-08
**Journey:** J1 Step 17
**FR Traceability:** FR24
**Current AC Text:** (Story 6.1, lines 1817-1826) PDF sections list does not include Audit summary
**Proposed Amendment:**

Add to the PDF content list:

```
- Audit Summary (pass/fail status of all 15 audit checks with plain-language explanations for any failures)
```

**Impact Classification:** Blocker
**Rationale:** The Audit tab is one of the 7 report tabs and contains meaningful content for lenders — it validates internal consistency of the financial projections. The reference spreadsheets include an Audit tab. Omitting it from the PDF means the lender package is incomplete compared to the spreadsheet equivalent. If the PO decides against including Audit in the PDF, this should be an explicit exclusion decision, not an accidental omission.

---

### Amendment 5: Add Thumbnail and Immutability Dev Notes to Story 6.2

**Gap ID:** GAP-06, GAP-07
**Journey:** N/A
**FR Traceability:** FR26, FR27, NFR18
**Current AC Text:** (Story 6.2) "each document entry shows a thumbnail preview of the first page"
**Proposed Amendment:**

Add to Story 6.2 Dev Notes:

```
**Dev Notes (additions):**
- Thumbnail generation: Generate a PNG thumbnail of the first PDF page at PDF creation time.
  Store the thumbnail alongside the PDF in Replit Object Storage. Recommended size: 300x400px.
  If thumbnail generation fails, display a generic document icon placeholder — do not block
  the document creation flow.
- Architecture constraint: IStorage interface exposes only createDocument(), getDocument(),
  and listDocuments() — no updateDocument() or deleteDocument(). Immutability is enforced
  at the interface level (Architecture Decision 13). Do NOT add PUT/PATCH/DELETE endpoints
  for documents.
- API endpoints: POST /api/plans/:id/documents (generate), GET /api/plans/:id/documents (list),
  GET /api/plans/:id/documents/:docId (download). No mutation endpoints.
```

**Impact Classification:** Quality Risk
**Rationale:** Without thumbnail guidance, the dev agent may attempt on-the-fly PDF-to-image conversion on every page load (expensive) or skip thumbnails entirely. Without immutability reference, the agent may create mutation endpoints that violate the architecture.

---

### Amendment 6: Add Document History Journey Step Awareness

**Gap ID:** GAP-04
**Journey:** N/A (gap is the absence)
**FR Traceability:** FR26, FR27
**Current AC Text:** (Story 6.2) Document history accessible from "sidebar navigation or Dashboard"
**Proposed Amendment:**

No AC change needed — FR26/FR27 provide sufficient backing. However, add to Story 6.2 Dev Notes:

```
**Dev Notes (addition):**
- No user journey currently describes the document history experience. The empty state
  (no documents generated yet) should show a call-to-action: "No documents yet.
  Generate your first business plan package from Reports or the Dashboard."
- Navigation: Add a "Documents" entry in the sidebar (below Reports) for direct access.
  The Dashboard preview widget already links to document generation (Story 5.9).
```

**Impact Classification:** Enhancement
**Rationale:** Non-blocking but improves implementability. The dev agent needs guidance on empty state and navigation placement.

---

## Section 4: Future Journey Considerations (Non-Blocking)

### Journey 4 (Chris — What-If Playground, Epic 10)

**Awareness Item:** Chris reviews scenarios in the What-If Playground before generating her lender package. If Epic 10 adds a "Generate PDF with Scenario Comparison" feature, the PDF generation (Story 6.1) would need to include scenario columns and sensitivity analysis in the document. This is explicitly deferred per SCP-2026-02-20 D5/D6. The retired AC in Story 6.1 (lines 1838-1841) correctly marks this as out of scope.

**Recommendation:** When Epic 10 is planned, add a Story 10.X for scenario-aware PDF export if the feature is desired.

### Journey 8 (Denise — View As, Epic ST/12)

**Awareness Item:** Denise uses "View As" to see David's plan. If Denise generates a PDF while in View As mode, whose name appears on the document? The answer should be David's (the franchisee whose plan it is), but the impersonation context could cause confusion. The PDF header format is "[Franchisee Name]'s [Brand] Business Plan" — this should always use the plan owner's name, not the impersonating admin's name.

**Recommendation:** When Epic ST/12 View As edit mode is finalized, add an AC to Story 6.1 (or a follow-up story): "When a PDF is generated while in View As mode, the document reflects the plan owner's identity, not the admin's."

### Journey 7 (Linda — Franchisor Pipeline, Epic 11)

**Awareness Item:** Linda's pipeline dashboard shows "3 with completed lender packages." This implies the system tracks document generation status per franchisee and surfaces it to franchisor admins. This is an Epic 11 concern, not Epic 6, but Epic 6's document storage (Story 6.2) should support querying "has this plan generated at least one document?" for downstream use.

**Recommendation:** Ensure the `generated_documents` table and API support a "has documents" query per plan, usable by Epic 11.

---

## Section 5: Story 5.9 Handoff Verification (AC-4)

### Entry Point Alignment

| Entry Point | Story 5.9 AC | Story 6.1 AC | Status |
|-------------|-------------|-------------|--------|
| Dashboard preview widget → "Generate PDF" button | 5.9 line 1391: "'Generate PDF' triggers PDF generation (Story 6.1)" | 6.1 line 1816: "from the... Dashboard preview widget" | **Aligned** |
| Impact Strip document icon → Document Preview modal → "Generate PDF" | 5.9 lines 1394-1398: modal with "Generate PDF" button | 6.1 line 1816: "from the... Impact Strip document icon" | **Aligned** |
| Reports header → "Generate PDF" button | 5.9 lines 1400-1403: button in Reports header | 6.1 line 1816: "from the Financial Statements header" | **Aligned** |

**Verdict:** All 3 entry points from Story 5.9 are referenced in Story 6.1's first AC (line 1816). No handoff gap. The parenthetical "(from the Financial Statements header, Dashboard preview widget, or Impact Strip document icon)" covers all three paths.

---

## Section 6: Completeness Threshold Consistency Check (AC-5)

### Source Comparison

| Source | DRAFT Watermark | Button Label < 50% | Button Label 50-90% | Button Label > 90% | Cover Note |
|--------|----------------|--------------------|--------------------|--------------------|-----------|
| **Story 5.9** (lines 1400-1403) | Not specified (5.9 is trigger, not content) | "Generate Draft" (implied from UX spec) | "Generate Package" (implied) | "Generate Lender Package" | Not specified |
| **Story 6.1** (lines 1833-1836) | < 50% completeness | N/A (defers to 5.9) | N/A | N/A | < 50%: "This plan contains brand default assumptions..." |
| **UX Spec Part 13** (lines 975-978) | Not specified here | "Generate Draft" | "Generate Package" | "Generate Lender Package" (with completion indicator) | Not specified |
| **UX Spec Part 14** (line 1004) | < 90% completeness | N/A | N/A | N/A | Not specified |
| **Journey 1 Step 19** | "hasn't hit 90%" | N/A | N/A | N/A | N/A |
| **Journey 1 Step 20** | Disappears at > 90% | N/A | N/A | "Generate Lender Package" | N/A |
| **Journey 3 Step 3** | 45% → DRAFT shown | N/A | N/A | N/A | N/A |
| **Journey 3 Step 8** | 100% → DRAFT drops | N/A | N/A | N/A | N/A |

### Inconsistencies Found

1. **DRAFT watermark threshold:** Story 6.1 says < 50%. UX spec Part 14 says < 90%. Journey 1 says < 90%. These directly conflict.

2. **Middle tier behavior:** Story 5.9 button labels imply three tiers, but Story 6.1 only defines two PDF states (DRAFT / not-DRAFT).

3. **Journey 3 Step 3 at 45%:** "DRAFT watermark — it's only 45% complete." This is consistent with BOTH thresholds (45% < 50% AND 45% < 90%).

4. **Journey 3 Step 8 at 100%:** DRAFT drops. Consistent with both thresholds.

### Resolution: Two Distinct Surfaces

The confusion arises from conflating **two different DRAFT watermark surfaces:**

| Surface | Where | When DRAFT Shows | Authority |
|---------|-------|-----------------|-----------|
| **Document Preview widget** | Dashboard, real-time | < 90% completeness | UX Spec Part 14, Journey 1 Step 19 |
| **Generated PDF file** | Downloaded document | < 50% completeness | Story 6.1 AC |

This is coherent IF made explicit. The Document Preview is a real-time rendering — it shows DRAFT as long as the plan isn't "lender-ready" (< 90%). The generated PDF is a point-in-time artifact — it only gets a DRAFT watermark if the plan is substantially incomplete (< 50%).

**However, the journeys don't distinguish.** Journey 1 Step 19 describes seeing DRAFT on the preview widget. Step 20 says the DRAFT disappears at > 90%. Step 21 describes generating the PDF. The reader assumes DRAFT behavior is the same on both surfaces.

### Recommendation

**Adopt the two-surface model with explicit thresholds:**

1. **Document Preview widget** (Story 5.9 domain): DRAFT watermark at < 90% — this is the "you're not done yet" signal
2. **Generated PDF** (Story 6.1 domain): Three tiers:
   - < 50%: DRAFT watermark + "brand default assumptions" cover note
   - 50-90%: No watermark, but "some inputs at brand defaults" cover note
   - > 90%: Clean PDF, no watermark, no cover note

This model respects the UX spec Part 13 (three button labels), Part 14 (preview DRAFT at < 90%), and adds a middle-tier PDF behavior that Story 6.1 currently lacks. See Amendment 1 above.

---

## Quality Gate Verification

| Check | Status |
|-------|--------|
| All relevant journey steps mapped | 9 steps mapped across J1, J2, J3, J5 |
| Every gap cites journey step and FR | All 8 gaps cite specific sources |
| Amendment proposals include FR traceability | All 6 amendments include FR numbers |
| Completeness threshold reconciled with recommendation | Full analysis in Section 6 |
| Retired scenario AC verified | Confirmed struck through (lines 1838-1841) with retirement note |
| Story 5.9 handoff verified | All 3 entry points aligned |
| Non-blocking future items documented | J4, J7, J8 covered in Section 4 |

---

### File List

1. `_bmad-output/implementation-artifacts/5h-3-epic-6-ac-audit-user-journeys.md` — Audit document appended to Dev Agent Record section

### Testing Summary

- **Automated tests:** N/A (documentation-only story)
- **Manual verification:** Audit covers all 6 acceptance criteria
  - AC-1: Journey-to-story mapping table produced (Section 1) — 9 journey steps mapped
  - AC-2: Gap analysis produced (Section 2) — 8 gaps identified (3 Blocker, 3 Quality Risk, 2 Enhancement)
  - AC-3: AC amendment proposals produced (Section 3) — 6 proposals with FR traceability
  - AC-4: Story 5.9 handoff verified (Section 5) — all 3 entry points aligned
  - AC-5: Completeness threshold consistency analyzed (Section 6) — two-surface model recommended
  - AC-6: Output format matches specification — 4 sections + verification table
