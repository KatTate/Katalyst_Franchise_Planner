# Code Review Validation Checklist

## Purpose

Validate that a code review was thorough and that the story implementation meets the acceptance criteria and dev notes constraints.

---

## Story Context

- [ ] Story file loaded and parsed
- [ ] Story status verified as reviewable ("review")
- [ ] Architecture and project context docs loaded (as available)

## Change Discovery

- [ ] Git changes discovered (using git log for committed changes, git status for uncommitted) and compared against story File List
- [ ] Discrepancies between git reality and story claims documented
- [ ] Comprehensive file list built from both sources

## Acceptance Criteria Verification

- [ ] Every AC individually verified against implementation
- [ ] Each AC marked as SATISFIED, PARTIAL, or NOT SATISFIED with evidence
- [ ] Any unsatisfied or partial ACs flagged as HIGH severity findings
- [ ] **Dev agent evidence audited**: Each AC's verification entry reviewed for accuracy; missing evidence flagged as HIGH finding
- [ ] **Evidence determinations recorded**: Each AC marked CONFIRMED, DISPUTED, or UNVERIFIED against dev's claims
- [ ] **User-facing AC evidence source checked**: User-facing ACs must have UI-based evidence, not code-only

## Dev Notes Compliance

- [ ] Architecture patterns verified as followed
- [ ] Anti-patterns verified as avoided
- [ ] Protected files verified as unmodified
- [ ] Dependencies verified (only listed packages installed)

## Code Quality Review

- [ ] Security review performed on changed files
- [ ] Performance review performed on changed files
- [ ] Error handling reviewed
- [ ] Code quality assessed (naming, structure, duplication)
- [ ] Test quality assessed (meaningful assertions, appropriate coverage)

## Platform Intelligence

- [ ] LSP diagnostics run on all changed files
- [ ] LSP errors and warnings documented as findings
- [ ] Architect sub-agent deep analysis requested with story context and git diff
- [ ] Architect findings incorporated into review
- [ ] Visual verification performed (if user-facing story with running server)
- [ ] Screenshot results compared against acceptance criteria (if applicable)

## Review Outcome

- [ ] Findings categorized by severity (HIGH/MEDIUM/LOW)
- [ ] Minimum 3 findings identified (adversarial review standard)
- [ ] User presented with resolution options
- [ ] Review notes appended to story Dev Agent Record
- [ ] Change Log updated with review entry
- [ ] Story status updated based on outcome
- [ ] Sprint status synced (if sprint tracking enabled)
- [ ] Story file saved with review results
