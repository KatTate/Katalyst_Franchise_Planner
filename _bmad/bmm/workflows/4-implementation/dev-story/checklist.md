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

- [ ] **AC verification entries produced**: Every AC has an entry with Expected (plain-language user experience), Method (how verified), Observed (actual result), and SATISFIED/NOT SATISFIED status
- [ ] **Observations are behavioral**: No entry references code constructs — all observations describe what a user sees or experiences
- [ ] **Every AC satisfied**: Each entry shows SATISFIED status
- [ ] **No partial implementations**: Nothing is "mostly done" or "will be finished later"
- [ ] **User-facing ACs verified in running app**: Screenshots or test runner results used, not code reading alone

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

## Platform Verification (Replit) — Step 9

- [ ] **LSP diagnostics tool run**: LSP diagnostics tool called on each changed file individually
- [ ] **{{lsp_error_count}} set**: Total LSP errors recorded
- [ ] **{{lsp_warning_count}} set**: Total LSP warnings recorded
- [ ] **LSP errors fixed**: Any errors in changed files resolved before proceeding
- [ ] **Git status verified**: `git status --porcelain` run; {{git_status_clean}} set to "yes" or "no"
- [ ] **Visual verification** (if user-facing): Screenshot tool used on affected pages; {{visual_verification_done}} set

## Documentation & Traceability — Step 10

- [ ] **Story status updated**: Status changed to "review"; {{story_status_updated}} = "yes"
- [ ] **Dev Agent Record updated**: Completion Notes, File List, Testing Summary, LSP Status, Visual Verification
- [ ] **Sprint status updated**: Sprint tracking file reflects "review" status; {{sprint_status_updated}} set
- [ ] **Architect tool run**: Architect tool called with relevant_files and include_git_diff: true; {{architect_review_done}} = "yes"

## Completion Gate — Step 11

- [ ] **ALL completion variables set** — if any are missing, the corresponding step was skipped:
  - [ ] {{lsp_error_count}} = number (from Step 9)
  - [ ] {{lsp_warning_count}} = number (from Step 9)
  - [ ] {{git_status_clean}} = "yes" or "no" (from Step 9)
  - [ ] {{visual_verification_done}} = "yes" or "N/A" (from Step 9)
  - [ ] {{story_status_updated}} = "yes" (from Step 10)
  - [ ] {{sprint_status_updated}} = "yes" or "N/A" (from Step 10)
  - [ ] {{architect_review_done}} = "yes" (from Step 10)
- [ ] **Final output includes completion verification section**

---

## Validation Output

```
Definition of Done: {{PASS/FAIL}}

✅ **Story Implementation Complete:** {{story_key}}
📊 **ACs Verified:** {{verified_count}}/{{total_count}}
🧪 **Tests:** {{test_status}}

Completion Verification:
- LSP Diagnostics: {{lsp_error_count}} errors, {{lsp_warning_count}} warnings
- Git Status: {{git_status_clean}}
- Visual Verification: {{visual_verification_done}}
- Story Status Updated: {{story_status_updated}}
- Sprint Status Updated: {{sprint_status_updated}}
- Architect Review: {{architect_review_done}}
```

**If FAIL:** List which acceptance criteria are not yet satisfied, which Dev Notes constraints were violated, or which completion variables are missing.

**If PASS:** Story is ready for code review.
