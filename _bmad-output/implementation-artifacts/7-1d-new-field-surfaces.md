# Story 7.1d: Facilities Guided Decomposition & Other OpEx Correction

Status: ready-for-dev

## Story

As a franchisee planning my operating costs,
I want to break down my Facilities costs into Rent, Utilities, Telecom/IT, Vehicle/Fleet, and Insurance in the My Plan forms — so I can think through each component — while still being able to edit the total directly in Reports for quick adjustments.

I also want Other OpEx to display as a percentage (not a dollar amount), matching how the engine actually uses it.

## Design Principle

Forms provides a **guided decomposition** for Facilities — it's the kind of hand-holding that makes Forms valuable as an onboarding surface. Reports shows the rolled-up **total** for quick inline editing. Both surfaces write to the same data. This is a natural example of Forms and Reports playing complementary roles: Forms helps you *think through* the number, Reports lets you *change* the number fast.

## Acceptance Criteria

**AC-1: Facilities guided decomposition in Forms**

Given I am viewing My Plan → Operating Costs section
When the Facilities area renders
Then guided sub-fields are shown: Rent, Utilities, Telecom/IT, Vehicle/Fleet, Insurance
And each sub-field has a single currency input (the annual value — per-year fine-tuning happens in Reports)
And a computed "Facilities Total" is displayed as the sum of all sub-fields
And "Set for all years" checkbox works the same as other per-year fields (Story 7.1c AC-3)
And the sub-fields roll up into `facilitiesAnnual[year]` (sum of all sub-fields for each year)
And the rollup is computed in the UI — the engine never sees the decomposition

**Facilities decomposition persistence:** Sub-fields are stored in `PlanFinancialInputs.operatingCosts.facilitiesDecomposition`: `{ rent, utilities, telecomIt, vehicleFleet, insurance }` — each a 5-element per-year array. These persist across sessions.

**AC-2: Facilities inline editing in Reports**

Given I am viewing the P&L tab in Reports
When the Facilities row is displayed
Then `facilitiesAnnual` is editable as a per-year currency field (this is handled by Story 7.1b's `INPUT_FIELD_MAP` extension)
And editing `facilitiesAnnual` in Reports writes directly to the per-year array — it does NOT update the decomposition sub-fields
And the old `rentMonthly`, `utilitiesMonthly`, `insuranceMonthly` rows are no longer displayed as separate P&L rows

**AC-3: Simplified mismatch handling**

Given a user edits `facilitiesAnnual` directly in Reports (changing the total)
When they return to Forms and view the Facilities decomposition
Then if `facilitiesAnnual[year]` differs from the sum of decomposition sub-fields for that year
Then Forms shows an informational note: "Total was adjusted to $X in Reports. Your breakdown below may not match."
And the decomposition sub-fields remain as last entered (they are NOT auto-adjusted)
And when the user edits any sub-field in Forms, the total recalculates from the sub-fields (Forms becomes authoritative again for that year)

**Design decision — simplified conflict resolution:** The original design proposed "Re-sync from total" and "Keep decomposition" action buttons. This has been simplified. The decomposition is informational context. When there's a mismatch, the user sees a note and can either: (a) edit a sub-field in Forms, which recalculates the total from sub-fields, or (b) leave it and continue editing the total in Reports. No modal, no action buttons, no proportional redistribution algorithm.

**Accepted tradeoff — persistent mismatch:** If a user edits `facilitiesAnnual` in Reports and never returns to edit the decomposition in Forms, the mismatch persists indefinitely. This is acceptable under the "Reports = power editing" principle — the Reports total is what the engine uses, and the Forms decomposition is guidance, not authoritative. QA should not flag persistent mismatches as bugs.

**AC-4: Other OpEx percentage display correction**

Given Other OpEx was migrated from dollars to percentage in Story 7.1a
When Other OpEx displays in both Reports and Forms
Then it shows as "Other OpEx %" with a percentage input format
And any remaining dollar-to-percentage conversion logic in `unwrapForEngine` is cleaned up (was a known limitation at `plan-initialization.ts:305-308`)

## Dev Notes

### Navigation

- **Facilities decomposition**: Sidebar → My Plan → Operating Costs section → Facilities sub-section
- **Facilities inline edit**: Sidebar → Reports → P&L tab → Facilities row (handled by 7.1b)
- **Other OpEx**: Both surfaces — label and format change

### Architecture

- **facilitiesDecomposition** in `PlanFinancialInputs` already exists (added in 7.1a)
- **FIELD_METADATA** entries for decomposition sub-fields already exist in `field-metadata.ts`
- **facilitiesAnnual** editing in Reports is handled by 7.1b (this story just ensures the decomposition→total rollup works in Forms)
- **Auto-save**: same `PATCH /api/plans/:id` pattern, single save writes both decomposition and computed `facilitiesAnnual`

### Anti-Patterns & Hard Constraints

- **DO NOT modify `components/ui/*`**
- **DO NOT create new API endpoints**
- **DO NOT introduce new npm packages**
- **DO NOT write `facilitiesAnnual` in a separate save from the decomposition** — compute rollup in UI, write both in one save
- **DO NOT build complex conflict resolution UI** — simple informational note is sufficient

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/components/planning/forms-mode.tsx` | MODIFY | Add Facilities guided decomposition sub-section with sub-fields, rollup total, and mismatch note. |
| `shared/plan-initialization.ts` | MODIFY | Clean up Other OpEx dollar→percentage conversion if remnants exist. |

### Testing Expectations

- **E2E (Playwright)**:
  - Navigate to My Plan → Operating Costs → Facilities → enter Rent $24,000, Utilities $6,000 → verify total shows $30,000
  - Save → switch to Reports → verify Facilities row shows $30,000 for Year 1
  - In Reports, edit Facilities Year 1 to $35,000 → switch to My Plan → verify mismatch note appears, decomposition still shows $24,000 + $6,000
  - In My Plan, edit Rent to $28,000 → verify total recalculates to $34,000 (28K + 6K), mismatch note disappears
  - Verify Other OpEx shows as "Other OpEx %" in both surfaces

### References

- **PRD Requirements**: FR7j (full input assumption set — Facilities decomposition matches reference spreadsheet)
- **Design Principle**: Forms = guided breakdown; Reports = direct total editing
- **Predecessor**: Story 7.1a (data model, facilitiesDecomposition structure), Story 7.1b (Facilities row editable in Reports)

### Dependencies

- **Depends on**: Story 7.1a (DONE), Story 7.1b (Facilities editable in Reports), Story 7.1c (Forms field sections)
- **Implementation order**: After 7.1b and 7.1c

### Completion Notes

### File List

### Testing Summary
