# Story Context Quality Checklist

## Purpose

Validate that a story file provides sufficient context for a dev agent to implement correctly without a pre-written task list. The quality bar: Could a competent developer or AI agent read the acceptance criteria and dev notes and build the right thing?

## Required Inputs

- **Story file**: The story file to validate
- **Source documents**: Epics, architecture, PRD (discovered or provided)

---

## Acceptance Criteria Quality

- [ ] **Specific and testable**: Each AC describes a verifiable outcome, not an implementation step
- [ ] **Complete coverage**: ACs cover all requirements for this story from the epics file
- [ ] **No implementation sequencing**: ACs don't dictate the order of implementation
- [ ] **Appropriate specificity**: File paths appear only as verification points (e.g., "exported from shared/schema.ts"), not as step-by-step instructions

## Dev Notes — Architecture Patterns

- [ ] **Key patterns documented**: Naming conventions, code organization, framework patterns relevant to this story
- [ ] **Source references**: Each pattern cites the architecture doc section it comes from
- [ ] **Actionable guidance**: Patterns are specific enough to follow (not just "follow best practices")

## Dev Notes — Anti-Patterns & Hard Constraints

- [ ] **Wrong approaches identified**: Libraries, files, or approaches the dev agent must avoid
- [ ] **Protected files listed**: Files that must not be modified are explicitly named
- [ ] **Common mistakes covered**: Likely errors for this type of work are called out
- [ ] **Existing code awareness**: Notes about code that already exists and should be reused, not duplicated

## Dev Notes — Gotchas & Integration

- [ ] **Dependencies identified**: Other stories, system state, or prerequisites are noted
- [ ] **Edge cases flagged**: Non-obvious interactions or surprising behaviors documented
- [ ] **Template code guidance**: Clear about what existing code to replace vs preserve

## Dev Notes — File Changes & Dependencies

- [ ] **File change summary present**: Table showing which files are created, modified, or replaced
- [ ] **Dependencies listed**: Packages to install and packages already present (to avoid reinstalling)
- [ ] **Environment variables documented**: Required env vars with context on where they come from

## Dev Notes — References

- [ ] **Source citations present**: Technical details cite source document paths and sections
- [ ] **Traceability**: Reader can verify any claim by following the reference

## Overall Quality Bar

- [ ] **Self-sufficient**: A dev agent could implement this story correctly from the AC and Dev Notes alone
- [ ] **No task list needed**: If you feel a task list is necessary, the AC or Dev Notes are missing something — fix those instead
- [ ] **Architecture compliance**: Nothing in the story contradicts the architecture document
- [ ] **Previous story awareness**: If story_num > 1, learnings from previous stories are incorporated

---

## Validation Output

```
Story Quality: {{PASS/FAIL}}

✅ **Story Ready for Development:** {{story_key}}
📊 **Quality Score:** {{completed_items}}/{{total_items}} items passed
🎯 **Self-Sufficiency:** {{pass/fail}} — dev agent can implement from AC + Dev Notes alone
```

**If FAIL:** List specific gaps in acceptance criteria or dev notes that need to be addressed.

**If PASS:** Story provides complete implementation context and is ready for dev-story.
