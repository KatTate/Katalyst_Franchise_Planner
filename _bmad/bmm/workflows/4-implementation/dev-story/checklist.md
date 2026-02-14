# Dev Story Definition of Done Checklist

## Purpose

Validate that a story implementation is complete and ready for code review. This checklist verifies outcomes against the story's acceptance criteria — it does not duplicate the platform's built-in code review capabilities.

## Required Inputs

- **Story file**: The story being implemented
- **Implementation**: The code changes made

---

## Acceptance Criteria Verification

- [ ] **Every AC satisfied**: Each acceptance criterion in the story file has been verified as met
- [ ] **No partial implementations**: Nothing is "mostly done" or "will be finished later"
- [ ] **Verifiable outcomes**: Each AC was verified by running, testing, or inspecting the result

## Dev Notes Compliance

- [ ] **Architecture patterns followed**: Implementation follows patterns listed in Dev Notes
- [ ] **Anti-patterns avoided**: None of the constraints in "Anti-Patterns & Hard Constraints" were violated
- [ ] **Protected files respected**: Files listed as "do not modify" were not modified
- [ ] **Dependencies correct**: Only listed dependencies were installed; existing packages were not reinstalled

## Testing & Quality

- [ ] **Appropriate testing**: Implementation is tested in a way that matches the task type (infrastructure verified by running, business logic has unit/integration tests, UI verified visually and functionally)
- [ ] **Test evidence exists**: For business logic stories — at least one test file exists covering core ACs. For UI stories — visual verification was performed. For infrastructure — successful execution was confirmed.
- [ ] **Testing documented**: Dev Agent Record includes a Testing Summary listing approach, test files, and AC coverage
- [ ] **No regressions**: All existing tests still pass
- [ ] **Code quality**: Implementation follows project coding standards and conventions

## User-Facing Delivery

_Skip this section ONLY if the story's "As a..." role is explicitly a developer or the story is purely infrastructure/backend with no user interaction._

- [ ] **UI exists for user actions**: Every acceptance criterion that describes a user action (filling a form, clicking a button, viewing a list) has a corresponding UI component that a user can interact with
- [ ] **Not API-only**: The story was NOT implemented as API endpoints alone — if ACs describe user behavior, a usable interface was built
- [ ] **UI visually verified**: The UI components were loaded in a browser and visually confirmed to work (not just tested via API calls or curl)
- [ ] **UI states handled**: Error states, loading states, empty states, and success feedback are implemented in the UI

## Documentation & Traceability

- [ ] **Dev Agent Record updated**: Completion Notes summarize what was built and key decisions
- [ ] **File List complete**: All created, modified, or deleted files listed with relative paths
- [ ] **Story status updated**: Status changed from "ready-for-dev" to "review"
- [ ] **Sprint status updated**: Sprint tracking file reflects current story status (if applicable)

---

## Validation Output

```
Definition of Done: {{PASS/FAIL}}

✅ **Story Implementation Complete:** {{story_key}}
📊 **ACs Verified:** {{verified_count}}/{{total_count}}
🧪 **Tests:** {{test_status}}
📝 **Documentation:** {{doc_status}}
```

**If FAIL:** List which acceptance criteria are not yet satisfied or which Dev Notes constraints were violated.

**If PASS:** Story is ready for code review.
