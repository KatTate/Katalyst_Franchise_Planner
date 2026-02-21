# QA Automate - Validation Checklist

## Test Generation

- [ ] API tests generated (if applicable)
- [ ] E2E tests generated (if UI exists)
- [ ] Tests use standard test framework APIs
- [ ] Tests cover happy path
- [ ] Tests cover 1-2 critical error cases

## AC Coverage (when story file provided)

- [ ] Story file loaded and all ACs extracted
- [ ] Each AC mapped to at least one test case with a falsifiable assertion
- [ ] Visual/UX ACs use structural assertions (visibility, text content, attributes) not pixel-level CSS checks
- [ ] AC Coverage Table included in test summary with covered/uncovered counts
- [ ] Any uncovered ACs explicitly listed with justification

## Test Quality

- [ ] All generated tests run successfully
- [ ] Tests use proper locators (semantic, accessible)
- [ ] Tests have clear descriptions
- [ ] No hardcoded waits or sleeps
- [ ] Tests are independent (no order dependency)

## Test Execution (Step 4) — COMMONLY MISSED

- [ ] All generated tests actually executed (not just written to disk)
- [ ] Test runner output captured showing pass/fail results
- [ ] Failing tests debugged and fixed
- [ ] {{tests_executed}} set to "yes"

## Output (Step 5) — COMMONLY MISSED

- [ ] Test summary created and saved to disk at default_output_file path
- [ ] Tests saved to appropriate directories
- [ ] Summary includes coverage metrics
- [ ] {{summary_created}} set to "yes"

## Completion Gate

- [ ] {{tests_executed}} = "yes" — if not set, go back to Step 4
- [ ] {{summary_created}} = "yes" — if not set, go back to Step 5

---

**Need more comprehensive testing?** Install [Test Architect (TEA)](https://bmad-code-org.github.io/bmad-method-test-architecture-enterprise/) for advanced workflows.
