---
name: bmad-qa-automation
description: >
  BMAD Method: QA test automation — generate test cases and automation scripts
  from story acceptance criteria. Use when user says "QA test", "QA", "test
  automation", "generate tests", "automate tests", or needs test generation.
  Phase 4 Implementation workflow.
---

# BMAD QA Test Automation Workflow

This skill activates the BMAD QA Test Automation workflow (6 steps). It generates
test cases and automation scripts from story acceptance criteria.

## Workflow Steps (6 Total)

1. **Step 0: Detect Test Framework** — discover or select a test framework
2. **Step 1: Identify Features** — ask user what to test (WAIT point)
3. **Step 2: Generate API Tests** — create API test files (if applicable)
4. **Step 3: Generate E2E Tests** — create E2E test files (if UI exists)
5. **Step 4: Run Tests** — execute all generated tests and fix failures ⚠️ COMMONLY MISSED
6. **Step 5: Create Summary** — write test-summary.md with coverage metrics ⚠️ COMMONLY MISSED

## Commonly Missed Steps

Steps 4 and 5 are the most frequently skipped. Agents tend to generate test files
and consider the workflow "done" without actually running the tests or producing
the summary document. Both steps are MANDATORY — the workflow is NOT complete
until tests have been executed and the summary has been saved.

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

- NEVER skip steps or optimize the sequence — execute ALL 6 steps in exact order
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS save output after completing EACH workflow step
- ALWAYS generate tests that match acceptance criteria exactly
- Tests should be runnable without manual intervention
- ALWAYS run the generated tests (Step 4) before considering the workflow complete — generating files is NOT enough
- ALWAYS produce the test-summary.md (Step 5) with actual coverage metrics — do NOT skip the summary
- The workflow is NOT complete until tests have been executed AND the summary document exists on disk
- Set {{tests_executed}} = "yes" after Step 4 and {{summary_created}} = "yes" after Step 5
- The final output MUST confirm both variables are set — if either is missing, the workflow is incomplete

## What's Next

After test automation, the typical next step is:
- Run the generated tests and fix any failures
- **Code Review (CR)** — include test coverage in the review
