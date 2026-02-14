---
name: bmad-dev-story
description: >
  BMAD Method: Implement a story using its acceptance criteria and dev notes.
  Use when user says "dev story", "DS", "implement story", "build the story",
  "code the story", or requests story implementation. Phase 4 Implementation workflow.
---

# BMAD Dev Story Workflow

This skill activates the BMAD Dev Story workflow. The agent plans its own
implementation approach from the story's acceptance criteria and dev notes,
then builds, and tests the code.

## Activation

When this skill is triggered, execute the BMAD workflow by following these steps exactly:

### 1. Load the Workflow Engine

Read the BMAD workflow execution engine:
`_bmad/core/tasks/workflow.xml`

### 2. Load the Workflow Configuration

Pass this workflow configuration file to the engine:
`_bmad/bmm/workflows/4-implementation/dev-story/workflow.yaml`

### 3. Execute

Follow the workflow engine instructions precisely, processing the workflow YAML
through all steps in order. The workflow engine handles:
- Configuration loading from `_bmad/bmm/config.yaml`
- Story file discovery and loading
- Sprint status tracking
- Project context loading (if exists)
- Instructions execution from the workflow's instructions.xml
- Checklist validation from the workflow's checklist.md

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS save output after completing EACH workflow step
- ALWAYS follow the instructions.xml referenced in the workflow YAML
- ALWAYS apply the checklist.md validation before completing
- The agent plans its OWN implementation approach from acceptance criteria — do not use pre-scripted task checklists

## What's Next

After implementing a story, the typical next steps are:
- **Code Review (CR)** — review implemented code against acceptance criteria
- Recommend starting a **new chat session** for Code Review to keep context fresh
