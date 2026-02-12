---
name: 'step-03-execute'
description: 'Execute implementation — work from acceptance criteria and context, not a checkbox sequence'

installed_path: '{project-root}/_bmad/bmm/workflows/bmad-quick-flow/quick-dev'
thisStepFile: './step-03-execute.md'
nextStepFile: './step-04-self-check.md'
---

# Step 3: Execute Implementation

**Goal:** Implement the solution using acceptance criteria as the definition of done and technical context as guidance.

**Critical:** Work continuously without stopping for approval between logical units of work.

---

## AVAILABLE STATE

From previous steps:

- `{baseline_commit}` - Git HEAD at workflow start
- `{execution_mode}` - "tech-spec" or "direct"
- `{tech_spec_path}` - Tech-spec file (if Mode A)
- `{project_context}` - Project patterns (if exists)

From context:

- Mode A: Acceptance criteria and implementation guidance from tech-spec
- Mode B: Acceptance criteria and context from step-02 planning

---

## IMPLEMENTATION APPROACH

### 1. Plan Your Approach

- Review acceptance criteria — these are the definition of done
- Review implementation guidance and architectural constraints from spec or context
- Identify logical groupings and dependencies
- Decide sequencing based on your understanding of the codebase

### 2. Implement

- Write code following existing patterns in the codebase
- Follow architectural constraints from the spec or context
- Handle errors appropriately
- Add appropriate comments where non-obvious

### 3. Test Appropriately

- Schema, config, and infrastructure changes: verify by running them
- Business logic and API endpoints: write tests
- UI components: verify visually and functionally
- Run existing tests to catch regressions
- The agent decides the testing approach based on what makes sense for the change

### 4. Track Progress

- Keep mental track of which acceptance criteria are satisfied
- Continue to next logical unit of work immediately

---

## HALT CONDITIONS

**HALT and request guidance if:**

- 3 consecutive failures on same issue
- Tests fail and fix is not obvious
- Blocking dependency discovered
- Ambiguity in acceptance criteria that requires user decision
- Implementation conflicts with stated architectural constraints

**Do NOT halt for:**

- Minor issues that can be noted and continued
- Warnings that don't block functionality
- Style preferences (follow existing patterns)

---

## CONTINUOUS EXECUTION

**Critical:** Do not stop between logical units of work for approval.

- Work through the implementation continuously
- Only halt for blocking issues
- Tests failing = fix before continuing
- Track which acceptance criteria have been satisfied

---

## NEXT STEP

When implementation is complete (all ACs addressed) or halted on a blocker, read fully and follow: `step-04-self-check.md`.

---

## SUCCESS METRICS

- All acceptance criteria addressed
- Code follows existing patterns
- Architectural constraints from spec/context respected
- Error handling appropriate
- Tests written where appropriate for the task type
- Tests passing
- No unnecessary halts

## FAILURE MODES

- Stopping for approval between logical units of work
- Ignoring existing code patterns
- Not running tests after changes
- Giving up after first failure
- Not following project-context rules (if exists)
- Ignoring architectural constraints from spec
