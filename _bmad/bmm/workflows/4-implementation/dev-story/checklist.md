# Dev Story Definition of Done Checklist

## Purpose

Validate that a story implementation is complete and ready for code review. This checklist verifies outcomes against the story's acceptance criteria and ensures all workflow steps were executed. It does not duplicate the platform's built-in code review capabilities.

## Required Inputs

- **Story file**: The story being implemented
- **Implementation**: The code changes made

---

## Context & Requirements Validation

- [ ] **Architecture compliance**: Implementation follows all architectural requirements specified in Dev Notes
- [ ] **Technical specifications**: All technical specifications (libraries, frameworks, versions) from Dev Notes are implemented correctly
- [ ] **Dev Notes constraints respected**: Anti-patterns avoided, protected files unmodified, only listed dependencies installed

## Acceptance Criteria Verification

- [ ] **Every AC satisfied**: Each acceptance criterion in the story file has been verified as met
- [ ] **No partial implementations**: Nothing is "mostly done" or "will be finished later"
- [ ] **Verifiable outcomes**: Each AC was verified by running, testing, or inspecting the result

## Testing & Quality

- [ ] **Appropriate testing**: Implementation is tested in a way that matches the task type (infrastructure verified by running, business logic has unit/integration tests, UI verified visually and functionally)
- [ ] **Test evidence exists**: For business logic stories — at least one test file exists covering core ACs. For UI stories — visual verification was performed. For infrastructure — successful execution was confirmed.
- [ ] **Testing documented**: Testing approach, test files, and AC coverage are documented
- [ ] **No regressions**: All existing tests still pass
- [ ] **Code quality**: Implementation follows project coding standards and conventions

## User-Facing Delivery

_Skip this section ONLY if the story's "As a..." role is explicitly a developer or the story is purely infrastructure/backend with no user interaction._

- [ ] **UI exists for user actions**: Every acceptance criterion that describes a user action (filling a form, clicking a button, viewing a list) has a corresponding UI component that a user can interact with
- [ ] **Not API-only**: The story was NOT implemented as API endpoints alone — if ACs describe user behavior, a usable interface was built
- [ ] **UI visually verified**: The UI components were loaded in a browser and visually confirmed to work (not just tested via API calls or curl)
- [ ] **UI states handled**: Error states, loading states, empty states, and success feedback are implemented in the UI

## Platform Verification (Replit)

- [ ] **LSP diagnostics clean**: No type errors or unresolved references in files changed during this story
- [ ] **Git status verified**: All implementation changes are tracked; no unexpected files modified outside story scope
- [ ] **Visual verification** (if user-facing): Screenshots taken and UI confirmed to render correctly

## Documentation & Traceability

- [ ] **Dev Agent Record updated**: Completion Notes summarize what was built and key decisions
- [ ] **File List complete**: All created, modified, or deleted files listed with relative paths
- [ ] **Testing Summary included**: Test approach, test files, AC coverage, and pass/fail status documented
- [ ] **LSP Status recorded**: Clean, errors fixed, or warnings noted
- [ ] **Story status updated**: Status changed to "review"
- [ ] **Sprint status updated**: Sprint tracking file reflects "review" status for this story (if applicable)

---

## Validation Output

```
Definition of Done: {{PASS/FAIL}}

✅ **Story Implementation Complete:** {{story_key}}
📊 **ACs Verified:** {{verified_count}}/{{total_count}}
🧪 **Tests:** {{test_status}}
🔍 **Platform Checks:** LSP {{lsp_status}} | Git {{git_status}}
📝 **Documentation:** Story file {{story_update_status}} | Sprint status {{sprint_update_status}}
```

**If FAIL:** List which acceptance criteria are not yet satisfied, which Dev Notes constraints were violated, or which documentation/tracking steps were missed.

**If PASS:** Story is ready for code review.
