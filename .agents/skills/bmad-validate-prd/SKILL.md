---
name: bmad-validate-prd
description: >
  BMAD Method: Validate an existing PRD against BMAD standards for completeness,
  clarity, and quality. Use when user says "validate PRD", "VP", "review PRD",
  "check PRD", or wants to verify their PRD meets quality standards.
  Phase 2 Planning workflow.
---

# BMAD Validate PRD Workflow

This skill activates the BMAD PRD Validation workflow. It reviews an existing
PRD against BMAD standards through comprehensive quality assessment.

## Activation

When this skill is triggered, load and follow the workflow directly:

Read fully and follow: `_bmad/bmm/workflows/2-plan-workflows/create-prd/workflow-validate-prd.md`

The workflow uses step-file architecture with steps in `steps-v/` directory.
- Configuration loading from `_bmad/bmm/config.yaml`
- PRD file discovery and loading
- Output: validation report

## Workflow Steps (13 Steps + 1 Conditional Branch)

1. **step-v-01-discovery** — Discover and load the PRD to validate, detect format
2. **step-v-02-format-detection** — Format classification and structure analysis
   - ↳ **step-v-02b-parity-check** — Parity check handler (conditional: auto-loaded for variant/legacy formats)
3. **step-v-03-density-validation** — Information density validation (wordiness, filler, conciseness)
4. **step-v-04-brief-coverage-validation** — Product brief coverage validation
5. **step-v-05-measurability-validation** — Measurability validation (quantified success criteria)
6. **step-v-06-traceability-validation** — Traceability validation (requirements linkage)
7. **step-v-07-implementation-leakage-validation** — Implementation leakage detection (technology in requirements)
8. **step-v-08-domain-compliance-validation** — Domain compliance validation
9. **step-v-09-project-type-validation** — Project-type compliance validation
10. **step-v-10-smart-validation** — SMART requirements validation
11. **step-v-11-holistic-quality-validation** — Holistic quality assessment and rating
12. **step-v-12-completeness-validation** — Completeness validation
13. **step-v-13-report-complete** — Final report compilation, summary, and next steps

## Commonly Missed Steps

- ⚠️ **step-v-07-implementation-leakage** — Agents may skip leakage detection since it requires checking FRs/NFRs for technology-specific language. This is a critical quality gate.
- ⚠️ **step-v-11-holistic-quality** — The holistic assessment provides the overall quality rating. Skipping it means no overall score.
- ⚠️ **step-v-13-report-complete** — Final report step that compiles all findings and presents actionable options (edit, review, fix). Must not be skipped.
- ⚠️ **Each validation step must be executed sequentially** — agents may try to batch multiple validations together. Each step must complete fully before the next begins.

## Replit Task List Integration

**MANDATORY on activation:** Before beginning Step 1, create a Replit task list using the `write_task_list` tool with one task per workflow step listed above (13 sequential steps; if step-v-02b parity check is triggered, add it as a task dynamically). Each task should include the step number and name (e.g., "Step 1: Discovery — Discover and load the PRD to validate"). Mark the first task as `in_progress`. As you complete each step, immediately mark its task as `completed` (architect_reviewed: "not_applicable", reason: "BMAD workflow step — planning/facilitation, not code") and mark the next task as `in_progress`. This gives the user visible progress tracking throughout the workflow.

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS read each step file completely before taking action
- ALWAYS follow step-file architecture: load one step at a time, never look ahead
- ALWAYS halt at menus and wait for user selection
- Recommend using a different high-quality LLM for validation if available
- Each validation step must produce findings independently — do not batch

## What's Next

After validating a PRD, the typical next steps are:
- If issues found: **Edit PRD (EP)** — fix the identified problems
- If passed: **Create Architecture (CA)** or **Create UX (CU)**
