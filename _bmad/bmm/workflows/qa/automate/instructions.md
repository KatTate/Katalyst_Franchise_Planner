# QA - Automate

**Goal**: Generate automated API and E2E tests for implemented code.

**Scope**: This workflow generates tests ONLY. It does **not** perform code review or story validation (use Code Review `CR` for that).

## Instructions

### Step 0: Detect Test Framework

Check project for existing test framework:

- Look for `package.json` dependencies (playwright, jest, vitest, cypress, etc.)
- Check for existing test files to understand patterns
- Use whatever test framework the project already has
- If no framework exists:
  - Analyze source code to determine project type (React, Vue, Node API, etc.)
  - Search online for current recommended test framework for that stack
  - Suggest the framework and get user confirmation
  - Install the test framework using the platform's package management tools (not manual shell commands)
  - Create initial test configuration files as needed (e.g., vitest.config.ts, jest.config.js, playwright.config.ts)

### Step 1: Identify Test Targets

Determine test source (in priority order):

**Option A — Story-driven (preferred when a story file exists):**

- If user provides a story file path, load it directly
- If user names a feature, search implementation artifacts for the matching story file
- When story file is available:
  - Extract ALL acceptance criteria
  - Number each AC — these become the primary test case sources
  - Present AC list and confirm scope with user
  - Maintain an AC Coverage Table throughout:
    | AC# | AC Text (short) | Test Case | Covered |
    |-----|----------------|-----------|---------|

**Option B — Feature-driven (when no story file applies):**

- Specific feature/component name from user
- Directory to scan (e.g., `src/components/`)
- Auto-discover features in the codebase
- Document test targets and confirm with user

### Step 2: Generate API Tests (if applicable)

For API endpoints/services, generate tests that:

- Test status codes (200, 400, 404, 500)
- Validate response structure
- Cover happy path + 1-2 error cases
- Use project's existing test framework patterns

### Step 3: Generate E2E Tests (if UI exists)

For UI features, generate tests that:

- Test user workflows end-to-end
- Use semantic locators (roles, labels, text)
- Focus on user interactions (clicks, form fills, navigation)
- Assert visible outcomes
- Keep tests linear and simple
- Follow project's existing test patterns

#### AC-to-Test Mapping (when story file is available)

For each acceptance criterion from Step 1:

- Write at least one test case that directly verifies the AC
- Each test MUST include at least one assertion that would FAIL if the AC were not implemented:
  - BAD: `test('AC3: breadcrumb', () => { expect(true).toBe(true) })`
  - GOOD: `test('AC3: breadcrumb shows drill path', () => { expect(page.locator('[data-testid="breadcrumb"]')).toContainText('Quarterly') })`
- For visual/UX ACs, use structural assertions:
  - Element exists and is visible: `toBeVisible()`
  - Element contains expected text: `toContainText()`
  - Element has distinguishing attribute or class: `toHaveAttribute()` or `toHaveClass()`
  - Do NOT assert exact CSS values (colors, pixel sizes) — these break on theme changes
- Update the AC Coverage Table with test case name and assertion summary

### Step 4: Run Tests

Execute tests to verify they pass:

- Use the project's configured test command (e.g., `npm test`, `npx vitest`, `pytest`)
- If the test command is not configured in package.json scripts, add it before running
- If tests require a running server (E2E tests), ensure the development server workflow is running first
- If failures occur, fix them immediately — iterate until all generated tests pass
- Run any pre-existing tests to verify no regressions were introduced

### Step 5: Create Summary

Output markdown summary:

```markdown
# Test Automation Summary

## Generated Tests

### API Tests
- [x] tests/api/endpoint.spec.ts - Endpoint validation

### E2E Tests
- [x] tests/e2e/feature.spec.ts - User workflow

## Coverage

### AC Coverage (when story-driven)
- ACs with test coverage: X/Y
- Uncovered ACs: [list with justification]

### Feature Coverage
- API endpoints: 5/10 covered
- UI features: 3/8 covered

## Next Steps
- Run tests in CI
- Add more edge cases as needed
```

## Keep It Simple

**Do:**

- Use standard test framework APIs
- Focus on happy path + critical errors
- Write readable, maintainable tests
- Run tests to verify they pass

**Avoid:**

- Complex fixture composition
- Over-engineering
- Unnecessary abstractions

**For Advanced Features:**

If the project needs:

- Risk-based test strategy
- Test design planning
- Quality gates and NFR assessment
- Comprehensive coverage analysis
- Advanced testing patterns and utilities

→ **Install Test Architect (TEA) module**: <https://bmad-code-org.github.io/bmad-method-test-architecture-enterprise/>

## Output

Save summary to: `{implementation_artifacts}/tests/test-summary.md`

**Done!** Tests generated and verified.
