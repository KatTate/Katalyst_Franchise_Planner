---
name: 'step-04-self-check'
description: 'Self-audit implementation against acceptance criteria, tests, and patterns'

installed_path: '{project-root}/_bmad/bmm/workflows/bmad-quick-flow/quick-dev'
thisStepFile: './step-04-self-check.md'
nextStepFile: './step-05-review.md'
---

# Step 4: Self-Check

**Goal:** Audit completed work against acceptance criteria, tests, and patterns before review.

---

## AVAILABLE STATE

From previous steps:

- `{baseline_commit}` - Git HEAD at workflow start
- `{execution_mode}` - "tech-spec" or "direct"
- `{tech_spec_path}` - Tech-spec file (if Mode A)
- `{project_context}` - Project patterns (if exists)

---

## SELF-CHECK AUDIT

### 1. Acceptance Criteria Satisfied

For each acceptance criterion from the spec or context:

- [ ] AC is demonstrably satisfied in the implementation
- [ ] Can point to specific code that delivers the AC
- [ ] Edge cases considered where relevant

### 2. Tests Passing

Verify test status:

- [ ] All existing tests still pass (no regressions)
- [ ] New tests written where appropriate for the task type
- [ ] No test warnings or skipped tests without reason

### 3. Architectural Constraints Followed

Verify spec/context compliance:

- [ ] Implementation guidance and patterns from spec were followed
- [ ] Anti-patterns or constraints from spec were respected
- [ ] Dependencies match what was specified

### 4. Code Quality

Verify code quality:

- [ ] Follows existing code patterns in codebase
- [ ] Follows project-context rules (if exists)
- [ ] Error handling consistent with codebase
- [ ] No obvious code smells introduced

---

## UPDATE TECH-SPEC (Mode A only)

If `{execution_mode}` is "tech-spec":

1. Load `{tech_spec_path}`
2. Update status to "Implementation Complete"
3. Save changes

---

## IMPLEMENTATION SUMMARY

Present summary to transition to review:

```
**Implementation Complete!**

**Summary:** {what was implemented}
**Files Modified:** {list of files}
**Tests:** {test summary - passed/added/etc}
**AC Status:** {all satisfied / issues noted}

Proceeding to code review...
```

---

## NEXT STEP

Proceed immediately to `step-05-review.md`.

---

## SUCCESS METRICS

- All acceptance criteria verified as satisfied
- All tests passing
- Architectural constraints followed
- Patterns followed
- Tech-spec updated (if Mode A)
- Summary presented

## FAILURE MODES

- Claiming ACs satisfied when they're not
- Not running tests before proceeding
- Missing AC verification
- Ignoring pattern violations
- Not updating tech-spec status (Mode A)
