# Code Review Validation Checklist

## Purpose

Validate that a code review was thorough and that the story implementation meets the acceptance criteria and dev notes constraints. This checklist MUST be verified in Step 6 before the workflow can be marked complete.

---

## Step 1: Story Context and Git Discovery

- [ ] Story file loaded and parsed
- [ ] Story status verified as reviewable
- [ ] Git commands executed unconditionally (`git status`, `git log`, `git diff`)
- [ ] {{git_discovery_done}} set to "yes"
- [ ] Architecture and project context docs loaded (as available)

## Step 2: Attack Plan

- [ ] All Acceptance Criteria extracted
- [ ] All Dev Notes constraints extracted
- [ ] Review plan created covering ACs, Dev Notes, code quality, tests, git vs story

## Step 3: Adversarial Review

- [ ] Git changes cross-referenced against story File List
- [ ] {{git_discrepancy_count}} set with number of discrepancies
- [ ] Every AC individually verified against implementation
- [ ] Each AC marked as SATISFIED, PARTIAL, or NOT SATISFIED with evidence
- [ ] Any unsatisfied or partial ACs flagged as HIGH severity findings
- [ ] **Dev agent evidence audited**: Each AC's verification entry reviewed for accuracy; missing evidence flagged as HIGH finding
- [ ] **Evidence determinations recorded**: Each AC marked CONFIRMED, DISPUTED, or UNVERIFIED against dev's claims
- [ ] **User-facing AC evidence source checked**: User-facing ACs must have UI-based evidence, not code-only
- [ ] Architecture patterns verified as followed
- [ ] Anti-patterns verified as avoided
- [ ] Protected files verified as unmodified
- [ ] Dependencies verified (only listed packages installed)
- [ ] Security review performed on changed files
- [ ] Performance review performed on changed files
- [ ] Error handling reviewed
- [ ] Code quality assessed (naming, structure, duplication)
- [ ] Test quality assessed (meaningful assertions, appropriate coverage)
- [ ] Minimum 3 findings identified (adversarial review standard)

## Step 4: Platform Intelligence

- [ ] LSP diagnostics tool run on each changed file individually
- [ ] {{lsp_error_count}} set with total errors across all files
- [ ] {{lsp_warning_count}} set with total warnings across all files
- [ ] LSP errors documented as MEDIUM findings
- [ ] Architect tool called with story context, changed files, and git diff (include_git_diff: true)
- [ ] {{architect_review_done}} set to "yes"
- [ ] Architect findings incorporated into review
- [ ] Visual verification performed using screenshot tool (if user-facing story with running server)
- [ ] Screenshot results compared against acceptance criteria (if applicable)
- [ ] All platform intelligence findings merged into Step 3 findings

## Step 5: Findings Resolution

- [ ] Findings categorized by severity (HIGH/MEDIUM/LOW)
- [ ] User presented with resolution options
- [ ] Chosen resolution executed (fixes applied OR review notes added)
- [ ] Review notes appended to story Dev Agent Record
- [ ] {{fixed_count}} and {{action_count}} set

## Step 6: Status Update and Completion Validation

- [ ] {{new_status}} determined based on review outcome
- [ ] Story status updated in story file
- [ ] Story file saved
- [ ] Sprint-status.yaml synced (if it exists)
- [ ] **COMPLETION GATE — ALL of the following variables must be set:**
  - [ ] {{git_discovery_done}} = "yes"
  - [ ] {{git_discrepancy_count}} = number
  - [ ] {{lsp_error_count}} = number
  - [ ] {{lsp_warning_count}} = number
  - [ ] {{architect_review_done}} = "yes"
  - [ ] {{new_status}} = "done" or "in-progress"
  - [ ] {{fixed_count}} = number
  - [ ] {{action_count}} = number
- [ ] Final output includes all completion verification variables
