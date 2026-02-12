---
name: 'step-03-generate'
description: 'Build the implementation guidance — acceptance criteria and architectural context for the dev agent'

installed_path: '{project-root}/_bmad/bmm/workflows/bmad-quick-flow/quick-spec'
nextStepFile: './step-04-review.md'
wipFile: '{implementation_artifacts}/tech-spec-wip.md'
---

# Step 3: Generate Implementation Guidance

**Progress: Step 3 of 4** - Next: Review & Finalize

## RULES:

- MUST NOT skip steps.
- MUST NOT optimize sequence.
- MUST follow exact instructions.
- MUST NOT implement anything - just document.
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

## CONTEXT:

- Requires `{wipFile}` with defined "Overview" and "Context for Development" sections.
- Focus: Create acceptance criteria and implementation guidance that tell the dev agent WHAT to build and WHY, not HOW step-by-step.
- Output: Acceptance criteria (definition of done) plus architectural guidance (constraints and patterns).
- Target: Meet the **READY FOR DEVELOPMENT** standard defined in `workflow.md`.

## SEQUENCE OF INSTRUCTIONS

### 1. Load Current State

**Read `{wipFile}` completely and extract:**

- All frontmatter values
- Overview section (Problem, Solution, Scope)
- Context for Development section (Patterns, Files, Decisions)

### 2. Generate Acceptance Criteria

**Create specific, testable acceptance criteria:**

Each AC should describe a verifiable outcome:

```markdown
- AC 1: Given [precondition], when [action], then [expected result]
```

**Ensure ACs cover:**

- Happy path functionality
- Error handling
- Edge cases (if relevant)
- Integration points (if relevant)

**Quality bar:** Could a competent developer or AI agent read these ACs and know exactly what "done" looks like? Each AC must be specific enough to verify — no vague language like "should work properly."

### 3. Generate Implementation Guidance

Create directional guidance that helps the dev agent build correctly without scripting every step:

a) **Architecture Patterns to Follow**

- What patterns from the existing codebase should be extended
- Naming conventions, file organization, component structure to match
- Reference specific existing files as examples where helpful

b) **Anti-Patterns and Constraints**

- What approaches to avoid (and why)
- Files or areas that should NOT be modified
- Performance or security constraints

c) **File Change Summary**

- Which files will likely need modification or creation
- This is directional guidance, not a rigid prescription
- The dev agent may discover additional files need changes

d) **Dependencies**

- External libraries or services needed
- Other features this depends on
- API or data dependencies

### 4. Generate Testing Guidance

**Describe the testing approach appropriate for this task:**

- What types of tests make sense (unit, integration, E2E, manual verification)
- Key scenarios to test
- This is guidance, not a rigid test plan — the dev agent decides the testing approach

### 5. Complete Additional Context

**Fill in remaining sections:**

a) **Notes**

- High-risk items from pre-mortem analysis
- Known limitations
- Future considerations (out of scope but worth noting)

### 6. Write Complete Spec

a) **Update `{wipFile}` with all generated content:**

- Ensure all template sections are filled in
- No placeholder text remaining
- All frontmatter values current
- Update status to 'review' (NOT 'ready-for-dev' - that happens after user review in Step 4)

b) **Update frontmatter:**

```yaml
---
# ... existing values ...
status: 'review'
stepsCompleted: [1, 2, 3]
---
```

c) **Read fully and follow: `{nextStepFile}` (Step 4)**

## REQUIRED OUTPUTS:

- ACs MUST be specific, testable, and cover the full scope of the change.
- Implementation guidance MUST include architecture patterns, constraints, and file change summary.
- Status MUST be updated to 'review'.

## VERIFICATION CHECKLIST:

- [ ] `stepsCompleted: [1, 2, 3]` set in frontmatter.
- [ ] Spec meets the **READY FOR DEVELOPMENT** standard.
