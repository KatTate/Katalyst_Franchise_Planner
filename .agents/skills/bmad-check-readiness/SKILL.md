---
name: bmad-check-readiness
description: >
  BMAD Method: Critical validation that assesses PRD, Architecture, and Epics
  for completeness and alignment before implementation. Use when user says
  "check readiness", "IR", "implementation readiness", "ready to implement?",
  or needs to verify planning documents are aligned. Phase 3 Solutioning workflow.
---

# BMAD Check Implementation Readiness Workflow

This skill activates the BMAD Implementation Readiness workflow. It validates
that PRD, Architecture, Epics and Stories are complete and aligned before
Phase 4 implementation starts, using an adversarial review approach.

## Activation

When this skill is triggered, load and follow the workflow directly:

Read fully and follow: `_bmad/bmm/workflows/3-solutioning/check-implementation-readiness/workflow.md`

The workflow uses step-file architecture with steps in `steps/` directory.
- Configuration loading from `_bmad/bmm/config.yaml`
- Template: `_bmad/bmm/workflows/3-solutioning/check-implementation-readiness/templates/readiness-report-template.md`
- Output to planning artifacts directory

## Workflow Steps (6 Total)

1. **step-01-document-discovery** — Discover and inventory all project documents, identify duplicates, organize file structure
2. **step-02-prd-analysis** — Analyze PRD for completeness and quality
3. **step-03-epic-coverage-validation** — Validate that epics cover all PRD requirements
4. **step-04-ux-alignment** — Check UX design alignment with PRD and epics
5. **step-05-epic-quality-review** — Review epic and story quality, dependencies, acceptance criteria
6. **step-06-final-assessment** — Compile final assessment, determine readiness status, provide recommendations

## Commonly Missed Steps

- ⚠️ **step-05-epic-quality-review** — Agents may skip detailed epic quality review after coverage validation passes. Quality review catches issues like forward dependencies, incomplete acceptance criteria, and stories that are too large.
- ⚠️ **step-06-final-assessment** — Final assessment compiles all findings into actionable recommendations. Must not be skipped — it determines the READY/NEEDS WORK/NOT READY status.
- ⚠️ **step-01 duplicate resolution** — Document discovery may find both whole and sharded versions of documents. Agents must insist on resolving duplicates before proceeding.

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS read each step file completely before taking action
- ALWAYS follow step-file architecture: load one step at a time, never look ahead
- ALWAYS halt at menus and wait for user selection
- Focus on spotting GAPS — this is adversarial, assume problems exist
- Be direct about findings — do not soften the message
- Duplicate documents MUST be resolved before proceeding with assessment

## What's Next

After checking readiness, the typical next step is:
- **Sprint Planning (SP)** — plan the implementation order
