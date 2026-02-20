---
name: bmad-create-architecture
description: >
  BMAD Method: Collaborative architectural decision facilitation for AI-agent
  consistency. Use when user says "create architecture", "CA", "architect the
  solution", "technical architecture", or needs technical decisions on stack,
  database, APIs, and folder structure. Phase 3 Solutioning workflow.
---

# BMAD Create Architecture Workflow

This skill activates the BMAD Create Architecture workflow. It creates
comprehensive architecture decisions through collaborative step-by-step
discovery that ensures AI agents implement consistently.

## Activation

When this skill is triggered, load and follow the workflow directly:

Read fully and follow: `_bmad/bmm/workflows/3-solutioning/create-architecture/workflow.md`

The workflow uses step-file architecture with steps in `steps/` directory.
- Configuration loading from `_bmad/bmm/config.yaml`
- Template: `_bmad/bmm/workflows/3-solutioning/create-architecture/architecture-decision-template.md`
- Data files: `_bmad/bmm/workflows/3-solutioning/create-architecture/data/`
- Output to planning artifacts directory

## Workflow Steps (8 Steps + 1 Conditional Branch)

1. **step-01-init** — Workflow initialization, input document discovery (PRD required), continuation detection
   - ↳ **step-01b-continue** — Continuation handler (conditional: auto-loaded if existing incomplete document found)
2. **step-02-context** — Project context analysis and technical landscape assessment
3. **step-03-starter** — Starter template and project foundation decisions
4. **step-04-decisions** — Core architectural decisions (stack, database, auth, APIs)
5. **step-05-patterns** — Implementation patterns and consistency rules
6. **step-06-structure** — Project structure and file organization
7. **step-07-validation** — Architecture validation against PRD requirements
8. **step-08-complete** — Architecture completion and handoff to next phase

## Commonly Missed Steps

- ⚠️ **step-07-validation** — Agents may skip validation after structure feels complete. This step ensures architecture decisions cover all PRD requirements and prevents implementation conflicts.
- ⚠️ **step-08-complete** — Final completion step that updates workflow status and provides implementation guidance. Must not be skipped.
- ⚠️ **step-01-init PRD validation** — Architecture REQUIRES a PRD to work from. Agents must not proceed without verifying PRD exists and is loaded.

## Replit Task List Integration

**MANDATORY on activation:** Before beginning Step 1, create a Replit task list using the `write_task_list` tool with one task per workflow step listed above (8 sequential steps; if step-01b continuation is triggered, add it as a task dynamically). Each task should include the step number and name (e.g., "Step 1: Init — Workflow initialization, input document discovery"). Mark the first task as `in_progress`. As you complete each step, immediately mark its task as `completed` (architect_reviewed: "not_applicable", reason: "BMAD workflow step — planning/facilitation, not code") and mark the next task as `in_progress`. This gives the user visible progress tracking throughout the workflow.

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS read each step file completely before taking action
- ALWAYS follow step-file architecture: load one step at a time, never look ahead
- ALWAYS update frontmatter stepsCompleted before loading next step
- This is a PARTNERSHIP — you bring architectural knowledge, user brings domain expertise
- Focus on DECISIONS that prevent implementation conflicts between AI agents
- PRD document MUST exist before starting this workflow
- ABSOLUTELY NO TIME ESTIMATES — AI development speed has fundamentally changed

## What's Next

After creating architecture, the typical next steps are:
- **Create Epics (CE)** — break work into epics and stories
- Recommend starting a **new chat session** for the epics workflow
