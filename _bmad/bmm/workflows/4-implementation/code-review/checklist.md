# Code Review Validation Checklist

## Purpose

Validate that a code review was thorough and that the story implementation meets the acceptance criteria and dev notes constraints.

---

## Story Context

- [ ] Story file loaded and parsed
- [ ] Story status verified as reviewable ("review")
- [ ] Architecture and project context docs loaded (as available)

## Change Discovery

- [ ] Git changes discovered and compared against story File List
- [ ] Discrepancies between git reality and story claims documented
- [ ] Comprehensive file list built from both sources

## Acceptance Criteria Verification

- [ ] Every AC individually verified against implementation
- [ ] Each AC marked as SATISFIED, PARTIAL, or NOT SATISFIED with evidence
- [ ] Any unsatisfied or partial ACs flagged as HIGH severity findings

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

## Review Outcome

- [ ] Findings categorized by severity (HIGH/MEDIUM/LOW)
- [ ] User presented with resolution options
- [ ] Story status updated based on outcome
- [ ] Sprint status synced (if sprint tracking enabled)
- [ ] Story file saved with review results
