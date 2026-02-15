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
then builds, tests, verifies, and updates all tracking artifacts.

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

- This workflow has **11 steps**. You are NOT done until step 11 is complete.
- NEVER skip steps or optimize the sequence — every step exists for a reason
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS follow the instructions.xml referenced in the workflow YAML
- ALWAYS apply the checklist.md validation before completing
- The agent plans its OWN implementation approach from acceptance criteria — do not use pre-scripted task checklists
- Steps 10 and 11 (update story/sprint status, communicate completion) are MANDATORY — these are the steps most commonly skipped and must always be executed
- Do NOT stop after implementation. You MUST continue through testing, verification, documentation updates, and completion communication.

## Step Summary

For reference, the 11 steps in this workflow are:
1. Load story file
2. Load project context
3. Detect review continuation
4. Mark story in-progress (update sprint status)
5. Plan implementation approach
6. Implement the plan
7. Test implementation
8. Verify ALL acceptance criteria
9. Platform verification (LSP, git, screenshots)
10. **Update story file AND sprint status** ← commonly missed
11. **Communicate completion** ← commonly missed

## What's Next

After implementing a story, the typical next steps are:
- **Code Review (CR)** — review implemented code against acceptance criteria
- Recommend starting a **new chat session** for Code Review to keep context fresh
