# Story 7.1c: Forms Onboarding — New Field Sections & Simple Inputs

Status: ready-for-dev

## Story

As a first-time franchisee setting up my plan,
I want the My Plan forms to walk me through all the financial assumptions I need to set — including new fields like management salaries, payroll taxes, and growth rates — with simple, approachable inputs,
so that I can get from zero to a working 5-year projection without being overwhelmed.

## Design Principle

**Forms = onboarding wizard. Reports = power editing surface.** Forms (My Plan) is the guided hand-holding layer for less experienced personas. It asks simple questions, sets reasonable starting values, and gets the user to a plan they can *see* in Reports. Forms does NOT replicate the granular per-year or per-month editing that Reports provides. Expert users skip Forms entirely and go straight to Reports.

Forms remains the place to:
- Enter initial values during plan creation
- Do major resets (revert to brand defaults)
- Access guided breakdowns (like Facilities decomposition — see Story 7.1d)

Forms does NOT need:
- 5-column per-year editing (that's what Reports does)
- Per-month editing (that's what Reports does)
- Drill-down display (that's what Reports does)

## Acceptance Criteria

**AC-1: New field sections rendered in Forms**

Given I am viewing My Plan (Forms mode)
When the form sections render
Then the following new fields appear in their respective sections with single-value inputs:

- **Revenue**: Monthly AUV (currency), Annual Growth Rate (percentage — single value applied as Year 1 default, user can fine-tune per year in Reports)
- **Operating Costs**: COGS % (percentage), Direct Labor % (percentage), Marketing % (percentage), Other OpEx % (percentage), Royalty % (percentage), Ad Fund % (percentage), Payroll Tax & Benefits % (percentage), Management Salaries (annual, currency), Facilities — see Story 7.1d for guided decomposition
- **Profitability & Distributions**: Target Pre-Tax Profit % (percentage), Shareholder Salary Adjustment (annual, currency), Distributions (annual, currency), Non-CapEx Investment (annual, currency)
- **Working Capital & Valuation**: AR Days (integer), AP Days (integer), Inventory Days (integer), Tax Payment Delay Months (integer), EBITDA Multiple (decimal)
- **Financing**: Loan Amount (currency), Interest Rate (percentage), Loan Term Months (integer), Down Payment % (percentage)

And single-value fields show one input
And fields that are per-year in the data model show one input for the Year 1 / base value (with a note: "Fine-tune per year in Reports")

**AC-2: Form inputs write to PlanFinancialInputs correctly**

Given I edit a field value in Forms
When the value is saved via auto-save
Then for single-value fields: the `FinancialFieldValue.currentValue` is updated directly
And for per-year fields: the Year 1 value (index 0) is updated
And for per-month fields: all 12 months of Year 1 (indices 0-11) are updated with the same value
And the value change is immediately reflected in Reports when the user navigates there

**AC-3: "Set all years" convenience option**

Given I am editing a per-year or per-month field in Forms
When the field has a "Set for all years" checkbox or toggle (default: checked for new plans)
Then checking "Set for all years" and entering a value writes that value to all 5 years (or all 60 months for per-month fields)
And unchecking it writes only to Year 1
And a subtle hint says "Go to Reports to set different values per year or month"

**AC-4: Brand default indicators**

Given a field has a brand default value
When the field is displayed
Then the brand default is shown as a subtle reference (e.g., placeholder text or small label: "Brand default: 6.5%")
And if the user's value matches the brand default, the field appears in the default state
And a "Reset to brand default" action is available per field

## Dev Notes

### Navigation

User reaches this via: **Sidebar → My Plan** → collapsible form sections.

### Architecture Patterns

- **Two-Surface Principle**: Forms and Reports share the same `PlanFinancialInputs` JSONB. Edits in Forms immediately reflect in Reports and vice versa.
- **Auto-save**: `PATCH /api/plans/:id` with 2s debounce.
- **FIELD_METADATA**: `client/src/lib/field-metadata.ts` provides labels and format types for all fields.
- **Existing Forms code**: `client/src/components/planning/forms-mode.tsx` already renders collapsible sections with input controls.

### What This Story Does NOT Do

- No 5-column per-year editing in Forms (Reports handles that)
- No drill-down display in Forms (Reports handles that)
- No per-month editing UI in Forms (Reports handles that)
- No Facilities decomposition (that's Story 7.1d)

### Anti-Patterns & Hard Constraints

- **DO NOT modify `components/ui/*`** — shadcn/ui primitives
- **DO NOT create new API endpoints**
- **DO NOT introduce per-year column editing in Forms** — this contradicts the design principle
- **DO NOT introduce new npm packages**

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/components/planning/forms-mode.tsx` | MODIFY | Add new field sections (Profitability & Distributions, Working Capital & Valuation). Add "Set for all years" toggle for per-year fields. Add "Fine-tune per year in Reports" hints. Add brand default display and reset action. |
| `client/src/components/planning/input-panel.tsx` | MODIFY | Pass new fields to Forms if needed. |

### Testing Expectations

- **E2E (Playwright)**:
  - Navigate to My Plan → verify all new field sections are visible
  - Edit Management Salaries → switch to Reports → verify value appears in P&L
  - Edit Growth Rate with "Set for all years" checked → verify all years updated in Reports
  - Edit Growth Rate with "Set for all years" unchecked → verify only Year 1 updated
  - Verify "Reset to brand default" restores the original value
  - Verify Working Capital & Valuation fields (AR Days, AP Days, etc.) are editable with proper validation

### References

- **PRD Requirements**: FR7j (full input assumption set)
- **Design Principle**: Forms = onboarding; Reports = power editing
- **Predecessor**: Story 7.1a (data model, field metadata), Story 7.1b (Reports editing must work for "Fine-tune in Reports" to make sense)

### Dependencies

- **Depends on**: Story 7.1a (DONE), Story 7.1b (Reports editing — so the "Fine-tune in Reports" CTA is functional)
- **Can parallel with**: Story 7.1d (Facilities decomposition is a separate Forms section)

### Completion Notes

### File List

### Testing Summary
