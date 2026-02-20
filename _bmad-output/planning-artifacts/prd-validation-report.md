---
validationTarget: '_bmad-output/planning-artifacts/prd.md'
validationDate: '2026-02-20'
priorValidation: '2026-02-15 (4/5, Pass)'
inputDocuments:
  - '_bmad-output/planning-artifacts/product-brief-workspace-2026-02-08.md'
  - '_bmad-output/brainstorming/brainstorming-session-2026-02-08.md'
  - 'attached_assets/katalyst-replit-agent-context-final_1770513125481.md'
  - '_bmad-output/planning-artifacts/reference-data/PostNet_-_Business_Plan_1770511701987.xlsx'
  - 'attached_assets/Pasted-Persona-A-First-Time-Franchisee-Sam-The-New-Owner-Snaps_1770523428988.txt'
  - 'attached_assets/Pasted-Financial-Model-Engine-Testable-Requirements-Derived-fr_1771137277359.txt'
additionalReferences:
  - '_bmad-output/project-context.md (2026-02-19)'
  - '_bmad-output/planning-artifacts/ux-design-specification-consolidated.md (2026-02-18)'
  - '_bmad-output/planning-artifacts/sprint-change-proposal-2026-02-19.md (2026-02-19)'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/epics.md'
validationStepsCompleted: ['step-v-01-discovery', 'party-mode-review']
validationStatus: IN_PROGRESS
partyModeFindings: 6
---

# PRD Validation Report (Re-Validation)

**PRD Being Validated:** `_bmad-output/planning-artifacts/prd.md`
**Validation Date:** 2026-02-20
**Prior Validation:** 2026-02-15 — 4/5 (Pass), all 12 validation steps completed
**Trigger:** Post-UX-consolidation alignment check, incorporating updated project context, consolidated UX Design Specification (2026-02-18), and Sprint Change Proposal (2026-02-19)

## Input Documents

**PRD Frontmatter Documents:**
- PRD: Katalyst Franchise Planning Toolbox (prd.md) — 920 lines, 83 FRs, 30 NFRs
- Product Brief: product-brief-workspace-2026-02-08.md
- Brainstorming Session: brainstorming-session-2026-02-08.md
- Context Document: katalyst-replit-agent-context-final.md
- Spreadsheet Reference: PostNet_-_Business_Plan.xlsx
- Persona Snapshot: Pasted-Persona-A-First-Time-Franchisee-Sam.txt
- Financial Model Requirements: Pasted-Financial-Model-Engine-Testable-Requirements.txt

**Additional Reference Documents (user-requested):**
- Project Context: project-context.md (2026-02-19)
- UX Design Specification: ux-design-specification-consolidated.md (2026-02-18)
- Sprint Change Proposal: sprint-change-proposal-2026-02-19.md (2026-02-19)
- Architecture: architecture.md
- Epics: epics.md

## Prior Validation Summary (2026-02-15)

The previous validation completed all 12 steps and found:
- Format: BMAD Standard (6/6 core sections)
- Information Density: Pass (0 violations)
- Brief Coverage: 100% (0 gaps)
- Measurability: Pass (0 violations across 113 requirements)
- Traceability: Pass (0 broken chains, 0 orphans)
- Implementation Leakage: Pass (0 violations)
- Domain Compliance: Pass
- Project-Type Compliance: Pass (100%)
- SMART Quality: 92.8% scoring 4+/5
- Holistic Quality: 4/5 — Good
- Completeness: 100%

**Prior validation conclusion:** PRD is structurally sound, well-written, and ready for downstream consumption.

## Party Mode Cross-Document Alignment Review (2026-02-20)

**Participants:** John (PM), Sally (UX Designer), Winston (Architect), Mary (Analyst), Bob (Scrum Master), Quinn (QA)

**Focus:** Does the PRD still accurately describe the product being built, given the consolidated UX spec and sprint change proposal?

**Conclusion:** The PRD's *structural quality* remains strong (4/5). The issues identified are **alignment gaps** between the PRD and the evolved UX specification — not writing quality problems. The PRD describes capabilities correctly, but its terminology and some missing requirements create downstream confusion.

### Finding 1: CRITICAL — FR7h and FR7m Reference Retired "Quick Entry Mode"

**Evidence:**
- FR7h: "In Quick Entry mode, franchisee can edit input values directly within financial statement views"
- FR7m: "In Quick Entry mode, the same fields appear in their consolidated spreadsheet-level form"

**UX Spec Reference:** Part 10, line 823: "The flat grid component is retired. Its functionality is fully absorbed by inline-editable financial statement tabs in Reports."

**Impact:** Developers built a Quick Entry grid component (`quick-entry-mode.tsx`) because the PRD used this terminology. The sprint change proposal (CP-2) now requires deleting this component. PRD language directly caused downstream implementation divergence.

**Recommended Fix:** Update FR7h and FR7m to reference "Reports inline editing" instead of "Quick Entry mode." The capability (edit inputs directly in financial views) is preserved — the mechanism name changes.

### Finding 2: HIGH — No FR for Consistent Financial Formatting Component

**Evidence:** UX spec (Part 6, Component Strategy table) specifies a `<FinancialValue>` design-system primitive that "handles all number formatting" and states "All financial displays use this component." No corresponding FR exists in the PRD.

**Sprint Change Proposal Cross-Reference:** Adversarial review finding #3 (HIGH) — "No such component exists anywhere in the codebase. Financial formatting is scattered across format-currency.ts, field-metadata.ts, and inline formatting."

**Impact:** Without an FR mandating consistent formatting, scattered implementation is a defensible interpretation. Architectural fragmentation results.

**Recommended Fix:** Add an FR specifying that all financial values are rendered through a consistent formatting mechanism handling currency, percentages, accounting-style parentheses, and tabular alignment.

### Finding 3: HIGH — Negative Number Formatting Unspecified

**Evidence:** UX spec (Part 6) explicitly requires "Negative numbers: accounting-style parentheses, NOT minus signs. e.g., ($4,200) not -$4,200." The PRD has no FR or NFR specifying this.

**Sprint Change Proposal Cross-Reference:** Adversarial review finding #4 (HIGH) — formatCents() uses toLocaleString which produces "-$4,200" format. Classified as LOW in the proposal but assessed as HIGH by the adversarial reviewer.

**Impact:** Current implementation displays all negative numbers with minus signs. Every financial display in the app renders negatives wrong per UX spec. Without a PRD requirement, this is not testable against the PRD.

**Recommended Fix:** Add to an FR or NFR: "All negative financial values are displayed using accounting-style parentheses, e.g., ($4,200), not minus signs."

### Finding 4: HIGH — Guardian Visual Language Not Specified

**Evidence:** FR21 says the ROI Threshold Guardian is "advisory, not blocking" but does not specify visual treatment. UX spec (Part 6, Part 12) explicitly states: red is reserved for actual errors only; advisory/educational content uses the "Gurple" (Mystical #A9A2AA) `--info` token. Red must NEVER be used for advisory guardrails.

**Sprint Change Proposal Cross-Reference:** Adversarial review finding #1 (CRITICAL) — `--info` / "Gurple" token is absent from the codebase entirely. Guardian Bar's "concerning" level uses a generic purple, not the specified Gurple hex.

**Impact:** Without a PRD requirement distinguishing error vs. advisory visual language, a developer could reasonably use red for Guardian warnings and satisfy FR21.

**Recommended Fix:** Add to FR21 or a new FR: "Advisory indicators (Guardian, out-of-range warnings) use a visually distinct, non-error color. Red is reserved exclusively for actual errors (missing required fields, system failures, validation errors)."

### Finding 5: MEDIUM — Experience Tier Language Drift

**Evidence:** The PRD describes experience tiers as three "modes" (Story Mode, Normal Mode, Expert Mode) in multiple locations, implying three distinct UI states. The UX spec reframes the interaction model as two persistent surfaces (My Plan, Reports) with experience tiers modulating behavior within those surfaces — how much guidance the AI Planning Assistant provides, how much educational content surfaces, etc. The tiers no longer determine which "mode" the UI presents.

**Impact:** The old language contributed to the mode switcher being built (CP-1 in sprint change proposal). While the capability is preserved, the framing creates confusion about what "tiers" control.

**Recommended Fix:** Update tier-related language to clarify that tiers modulate behavior within two surfaces (My Plan, Reports), not switch between three separate UI modes.

### Finding 6: MEDIUM — Sprint Change Proposal Incorrectly States PRD Needs No Updates

**Evidence:** Sprint change proposal Section 2, Artifact Conflicts table: "PRD | No | Requirements are correct; code doesn't match them."

**Party Mode Assessment:** Disagree. Findings 1-5 demonstrate that the PRD uses terminology and omits requirements that created the implementation divergences. The requirements *capabilities* are correct, but the *language* and *completeness* need updating. The sprint change proposal's own adversarial review found 3 issues the proposal didn't catch in the PRD.

**Recommended Fix:** Update the sprint change proposal to acknowledge PRD needs terminology alignment. Execute Edit PRD workflow before implementation.

## Recommended Next Steps

**Team Consensus (Party Mode):**

1. **Edit PRD (EP)** — Fix findings 1-5 above. Focused edit, not rewrite.
2. **Update Epics** — At minimum, Story 7.1 ACs need Quick Entry references removed. Any stories referencing old three-mode architecture need alignment.
3. **Implementation Readiness (IR)** — After planning documents agree. Confirms PRD + Architecture + UX Spec + Epics are aligned before dev work.
4. **Sprint Change Proposal Execution** — CP-1 through CP-11 code changes.

**Do NOT run Implementation Readiness before editing the PRD.** IR assumes planning documents are aligned. They are not yet.

## Validation Status

**Status:** IN_PROGRESS — Party Mode review complete. Full 13-step re-validation deferred in favor of Edit PRD workflow to address alignment findings first. Remaining validation steps can be run after PRD is edited to confirm fixes.

**Structural Quality Rating (unchanged):** 4/5 — Good. The PRD remains well-written, dense, traceable, and measurable. The issues are alignment gaps with the evolved UX specification, not writing quality problems.
