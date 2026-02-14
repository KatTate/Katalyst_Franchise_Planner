---
name: bmad-code-review
description: >
  BMAD Method: Adversarial code review verifying implementation against story
  acceptance criteria and dev notes. Use when user says "code review", "CR",
  "review code", "review my code", or requests code quality review.
  Phase 4 Implementation workflow.
---

# BMAD Code Review Workflow

This skill activates the BMAD Code Review workflow. It performs adversarial
code review that verifies implementation against story acceptance criteria
and dev notes constraints, checking code quality, security, and test coverage.

## Activation

When this skill is triggered, execute the BMAD workflow by following these steps exactly:

### 1. Load the Workflow Engine

Read the BMAD workflow execution engine:
`_bmad/core/tasks/workflow.xml`

### 2. Load the Workflow Configuration

Pass this workflow configuration file to the engine:
`_bmad/bmm/workflows/4-implementation/code-review/workflow.yaml`

### 3. Execute

Follow the workflow engine instructions precisely, processing the workflow YAML
through all steps in order. The workflow engine handles:
- Configuration loading from `_bmad/bmm/config.yaml`
- Story file discovery for the story being reviewed
- Architecture and UX doc loading for review context
- Sprint status tracking
- Instructions execution from the workflow's instructions.xml
- Checklist validation from the workflow's checklist.md

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS save output after completing EACH workflow step
- ALWAYS follow the instructions.xml referenced in the workflow YAML
- ALWAYS apply the checklist.md validation before completing
- Review must be ADVERSARIAL — assume problems exist and look for them

## What's Next

After code review, the typical next steps are:
- If fixes needed: **Dev Story (DS)** — go back and fix the issues found
- If passed: **Next Story (CS)** — create the next story in the sprint
- If epic complete: **Retrospective (ER)** — review the completed epic
