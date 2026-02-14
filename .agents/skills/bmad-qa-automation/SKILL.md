---
name: bmad-qa-automation
description: >
  BMAD Method: QA test automation — generate test cases and automation scripts
  from story acceptance criteria. Use when user says "QA test", "QA", "test
  automation", "generate tests", "automate tests", or needs test generation.
  Phase 4 Implementation workflow.
---

# BMAD QA Test Automation Workflow

This skill activates the BMAD QA Test Automation workflow. It generates
test cases and automation scripts from story acceptance criteria.

## Activation

When this skill is triggered, execute the BMAD workflow by following these steps exactly:

### 1. Load the Workflow Engine

Read the BMAD workflow execution engine:
`_bmad/core/tasks/workflow.xml`

### 2. Load the Workflow Configuration

Pass this workflow configuration file to the engine:
`_bmad/bmm/workflows/qa/automate/workflow.yaml`

### 3. Execute

Follow the workflow engine instructions precisely. The workflow engine handles:
- Configuration loading from `_bmad/bmm/config.yaml`
- Story file discovery for test generation
- Architecture docs for technical context
- Test case generation from acceptance criteria
- Automation script generation
- Checklist validation

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS save output after completing EACH workflow step
- ALWAYS generate tests that match acceptance criteria exactly
- Tests should be runnable without manual intervention

## What's Next

After test automation, the typical next step is:
- Run the generated tests and fix any failures
- **Code Review (CR)** — include test coverage in the review
