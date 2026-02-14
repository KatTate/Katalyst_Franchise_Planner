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
through all steps in order. The workflow engine handles:
- Configuration loading from `_bmad/bmm/config.yaml`
- Input file discovery (epics, PRD, architecture, UX docs)
- Template application from the workflow's template file
- Checklist validation from the workflow's checklist file
- Output file creation in the implementation artifacts directory

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS save output after completing EACH workflow step
- ALWAYS follow the instructions.xml referenced in the workflow YAML
- ALWAYS apply the checklist.md validation before completing

## What's Next

After creating a story, the typical next steps are:
- **Validate Story (VS)** — verify the story is complete and ready for development
- **Dev Story (DS)** — implement the story
- Recommend starting a **new chat session** for Dev Story to keep context fresh
