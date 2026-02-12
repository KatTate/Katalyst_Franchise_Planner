---
name: 'step-05-review'
description: 'Use platform review tools to verify implementation quality'

installed_path: '{project-root}/_bmad/bmm/workflows/bmad-quick-flow/quick-dev'
thisStepFile: './step-05-review.md'
nextStepFile: './step-06-resolve-findings.md'
---

# Step 5: Code Review

**Goal:** Use the platform's review capabilities to verify implementation quality, then present findings.

---

## AVAILABLE STATE

From previous steps:

- `{baseline_commit}` - Git HEAD at workflow start (useful for scoping review)
- `{execution_mode}` - "tech-spec" or "direct"
- `{tech_spec_path}` - Tech-spec file (if Mode A)

---

## 1. Gather Changes

Identify all changes made during this workflow:

- If git is available: use `git diff {baseline_commit}` to see what changed
- If no git: list all files modified, created, or deleted during steps 2-4
- Compile a list of all changed files for review scope

---

## 2. Run Platform Review

Use the platform's architect/review tool to review the implementation:

- Pass the list of changed files for review
- Include the acceptance criteria and any architectural constraints from the spec as review context
- Request the review focus on: correctness against ACs, code quality, security, and test coverage

💡 **REPLIT TIP:** The platform's architect tool provides an independent review perspective without needing a separate review task file.

---

## 3. Process Findings

Capture findings from the review.

- Evaluate severity: HIGH (must fix), MEDIUM (should fix), LOW (nice to fix)
- Number the findings (F1, F2, F3, etc.)
- Present findings to user as a summary table or list

---

## NEXT STEP

With findings in hand, read fully and follow: `step-06-resolve-findings.md` for user to choose resolution approach.

---

## SUCCESS METRICS

- Changes identified and scoped correctly
- Platform review tool invoked with proper context
- Findings captured and categorized by severity
- Findings presented clearly to user

## FAILURE MODES

- Not providing acceptance criteria as review context
- Not including all changed files in review scope
- Accepting zero findings without questioning
- Skipping review entirely
