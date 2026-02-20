---
name: bmad-create-story
description: >
  BMAD Method: Create a story context document from epics and planning artifacts.
  Use when user says "create story", "CS", "prepare next story", "next story",
  or requests story creation for implementation. Phase 4 Implementation workflow.
---

# BMAD Create Story Workflow

This skill activates the BMAD Create Story workflow. It produces a story context
document — an intent-and-constraint guide for the dev agent, not an implementation script.

## Workflow Steps (6 steps total)

1. **Determine target story** — auto-discover from sprint status or parse user input
2. **Load and analyze core artifacts** — epics, UX, previous story intelligence, git history
3. **Architecture analysis for developer guardrails** — dedicated deep-dive into architecture doc
4. **Research latest technical specifics** — web research for current library/API versions
5. **Create the story context document** — write the story file from template with full context
6. **Validate story quality and update sprint status** — checklist validation + sprint-status.yaml update

## Commonly Missed Steps

- **Step 3 (Architecture analysis):** Agents sometimes skim architecture instead of doing a
  systematic extraction. Every relevant section must be checked.
- **Step 6 (Validate and update sprint status):** Agents tend to skip validation and sprint
  status updates after the "exciting" work of writing the story is done. This step is MANDATORY.
  The sprint-status.yaml MUST be updated with the story's "ready-for-dev" status.
  The checklist validation MUST be applied before reporting success.
  Set {{story_quality_validated}} = "yes" and {{sprint_status_updated}} = "yes" to confirm completion.

## Activation

When this skill is triggered, execute the BMAD workflow by following these steps exactly:

### 1. Load the Workflow Engine

Read the BMAD workflow execution engine:
`_bmad/core/tasks/workflow.xml`

### 2. Load the Workflow Configuration

Pass this workflow configuration file to the engine:
`_bmad/bmm/workflows/4-implementation/create-story/workflow.yaml`

### 3. Execute

Follow the workflow engine instructions precisely, processing the workflow YAML
through all 6 steps in order. The workflow engine handles:
- Configuration loading from `_bmad/bmm/config.yaml`
- Input file discovery (epics, PRD, architecture, UX docs)
- Template application from the workflow's template file
- Checklist validation from the workflow's checklist file
- Output file creation in the implementation artifacts directory

## Replit Task List Integration

**MANDATORY on activation:** Before beginning Step 1, create a Replit task list using the `write_task_list` tool with one task per workflow step listed above (6 steps). Each task should include the step number and name (e.g., "Step 1: Determine target story — auto-discover from sprint status"). Mark the first task as `in_progress`. As you complete each step, immediately mark its task as `completed` (architect_reviewed: "not_applicable", reason: "BMAD workflow step — planning/facilitation, not code") and mark the next task as `in_progress`. This gives the user visible progress tracking throughout the workflow.

## Critical Rules

- NEVER skip steps or optimize the sequence — execute ALL 6 steps in exact order
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS save output after completing EACH workflow step
- ALWAYS follow the instructions.xml referenced in the workflow YAML
- ALWAYS apply the checklist.md validation before completing
- EXHAUSTIVE ANALYSIS REQUIRED — do NOT be lazy or skim artifacts
- COMMON LLM MISTAKES TO PREVENT: reinventing wheels, wrong libraries, wrong file
  locations, breaking regressions, ignoring UX, vague implementations
- DOCUMENT-QUALITY MISTAKES TO PREVENT: skipping artifact analysis, vague acceptance
  criteria, missing dev notes sections, omitting UX deliverables for user-facing stories,
  not citing source references
- This workflow creates a DOCUMENT, not code. Do NOT write application code, modify source
  files, or begin implementation. Your only output is a single markdown story file.

## What's Next

After creating a story, Step 6 presents an interactive menu with options:
- **[A] Advanced Elicitation** — refine the story further
- **[R] Adversarial Review** — critical review of the story (recommended)
- **[P] Party Mode** — multi-agent review before implementation
- **[D] Done** — exit with copy-paste prompts for dev story or QA automation in a fresh context
