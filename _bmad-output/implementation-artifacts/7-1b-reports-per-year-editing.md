# Story 7.1b: Make All Financial Assumptions Editable in Reports

Status: in-progress

## Story

As a franchisee fine-tuning my 5-year plan,
I want to click on any financial assumption in my Reports — revenue, COGS, rent, salaries, royalties, marketing, all of it — and change it for any year, quarter, or month,
so that I can model exactly how my business will evolve over time, the way I would in a spreadsheet, but with the math handled for me.

## Design Principle

**Reports is the power editing surface.** Forms (My Plan) is the onboarding wizard for beginners. Reports is where all users — especially experienced operators — do their real work. Expert users skip Forms entirely and build their plan right in the financial statements. Every financial assumption must be editable inline in Reports, with per-year independence at minimum, and per-month independence for fields where it makes business sense (revenue, costs, growth rates). The drill-down UI (annual → quarterly → monthly) provides progressive disclosure so users aren't overwhelmed with 60 columns.

## Acceptance Criteria

**AC-1: Every financial assumption is editable in Reports P&L**

Given I am viewing the P&L tab in Reports
When any financial assumption row is displayed
Then ALL of the following rows are inline-editable with per-year independence:

| Row | Field Path | Format | Stored Granularity | Per-Month Capable |
|-----|-----------|--------|-------------------|-------------------|
| Revenue | `revenue.monthlyAuv` | currency | monthly | Yes |
| Growth Rate | `revenue.growthRates` | percentage | — | No |
| COGS % | `operatingCosts.cogsPct` | percentage | — | Yes |
| Direct Labor % | `operatingCosts.laborPct` | percentage | — | Yes |
| Royalty % | `operatingCosts.royaltyPct` | percentage | — | No |
| Ad Fund % | `operatingCosts.adFundPct` | percentage | — | No |
| Marketing % | `operatingCosts.marketingPct` | percentage | — | Yes |
| Other OpEx % | `operatingCosts.otherOpexPct` | percentage | — | No |
| Facilities ($) | `operatingCosts.facilitiesAnnual` | currency | annual | No |
| Mgmt Salaries ($) | `operatingCosts.managementSalariesAnnual` | currency | annual | No |
| Payroll Tax % | `operatingCosts.payrollTaxPct` | percentage | — | No |
| Target Pre-Tax Profit % | `profitabilityAndDistributions.targetPreTaxProfitPct` | percentage | — | No |
| Distributions ($) | `profitabilityAndDistributions.distributions` | currency | annual | No |
| Shareholder Salary Adj ($) | `profitabilityAndDistributions.shareholderSalaryAdj` | currency | annual | No |
| Non-CapEx Investment ($) | `profitabilityAndDistributions.nonCapexInvestment` | currency | annual | No |

And editing a value in Year 3 does NOT change Year 1, 2, 4, or 5
And the drill-down display shows correct breakdowns at every level (annual → quarterly → monthly)
And currency fields with `storedGranularity` apply correct reverse-scaling when edited at non-stored levels (e.g., editing annual revenue divides by 12 to store monthly AUV)

**AC-2: Per-month independence for qualifying fields**

Given a field is marked as "Per-Month Capable" (revenue, COGS%, labor%, marketing%)
When I drill down to monthly view and edit a specific month's value
Then that month's value changes independently — other months within the same year retain their values
And the quarterly and annual totals/averages recalculate to reflect the change
And the data model stores 60 `FinancialFieldValue` elements (12 months × 5 years) for per-month fields
And migration from the current 5-element per-year arrays expands losslessly by repeating each year's value 12 times

**Implementation note — per-month field storage:**
- Per-month fields: `FinancialFieldValue[60]` — index `(yearIndex * 12) + monthIndex`
- Per-year fields: `FinancialFieldValue[5]` — index `yearIndex` (unchanged from 7.1a)
- Single-value fields: `FinancialFieldValue` (unchanged)
- The engine already iterates month-by-month (0..59). For per-month fields, the engine reads `field[monthIndex]` instead of `field[Math.floor(monthIndex / 12)]`. For per-year fields, no engine change needed.
- `InputFieldMapping` gains a `granularity: "per-year" | "per-month" | "single"` property that replaces/extends `storedGranularity`

**AC-3: "Copy Year 1 to all years" action**

Given I am viewing a per-year or per-month editable row in Reports
When I want to broadcast Year 1's values to all years
Then a "Copy Year 1 to all years" action is available (button or context menu near the row)
And clicking it shows a confirmation prompt ("This will overwrite Years 2–5 with Year 1's values. Continue?")
And for per-month fields, this copies all 12 monthly values from Year 1 into Years 2–5 (preserving any monthly variation within Year 1)
And clicking Cancel makes no changes

**AC-4: Legacy linked-column cleanup**

Given the per-year independent editing replaces the old linked-column behavior from Story 5.2
When inline editing is active
Then the link icons in column headers are removed
And the `flashingRows` state and `animate-flash-linked` CSS class are removed
And editing one year never triggers visual feedback on other years

## Dev Notes

### Navigation

User reaches this via: **Sidebar → Reports → P&L tab**. All inline editing occurs within the P&L tab. (Balance Sheet and Valuation editing are in Story 7.1e.)

### Architecture — What Already Works

The 7.1a foundation already provides:
- Per-year `FinancialFieldValue[]` arrays in `PlanFinancialInputs`
- `unwrapForEngine()` extracts per-year tuples for the engine
- Column manager produces year-indexed columns; `PnlRow` renders `InlineEditableCell` per column
- `handleCommitEdit` extracts year index from column key and writes to the correct array position
- `storedGranularity` on `InputFieldMapping` with `scaleForStorage()` for reverse-scaling
- Revenue drill-down already demonstrates the pattern: annual shows $331K, drill into Q1 shows correct breakdown, monthly shows individual AUV

### What This Story Adds

1. **Extend `INPUT_FIELD_MAP`** — add entries for all missing editable rows (facilities, management-salaries, payroll-tax-pct, royalty-pct, ad-fund-pct, growth-rates, distributions, etc.)
2. **Per-month data model** — expand qualifying fields from `FinancialFieldValue[5]` to `FinancialFieldValue[60]`; add migration
3. **Per-month engine consumption** — update `unwrapForEngine()` to produce 60-element tuples for per-month fields; update engine to consume them
4. **Per-month editing** — at monthly drill level, edits write to the specific month index; at quarterly/annual level, edits distribute across constituent months
5. **Copy Year 1 to all** — new UI action with confirmation dialog
6. **Flash/link cleanup** — remove `flashingRows`, `animate-flash-linked`, `isFlashing` prop

### Anti-Patterns & Hard Constraints

- **DO NOT modify `components/ui/*`** — shadcn/ui primitives
- **DO NOT create new API endpoints** — use existing `PATCH /api/plans/:id`
- **DO NOT create a separate `PerYearEditableRow` component** — the existing `PnlRow` + `InlineEditableCell` + column manager already handle per-year rendering natively
- **DO NOT introduce new npm packages**
- **DO NOT modify `server/index.ts`, `server/vite.ts`, `server/static.ts`**

### Per-Month Engine Integration

The engine's `FinancialInputs` interface currently uses 5-element tuples: `cogsPct: [number, number, number, number, number]`. For per-month fields, this becomes a 60-element array. The engine loop already runs `for (let m = 0; m < 60; m++)`. The change is the lookup:

```typescript
// Current (per-year): same value for all months in a year
const cogs = inputs.operatingCosts.cogsPct[Math.floor(m / 12)];

// Per-month: unique value per month
const cogs = inputs.operatingCosts.cogsPct[m];
```

`unwrapForEngine()` handles the expansion — per-year fields repeat each value 12 times, per-month fields pass through directly.

### Migration Strategy

Same lossless pattern as 7.1a:
1. Detect 5-element arrays for per-month-capable fields
2. Expand to 60 elements: `year[i]` → `months[i*12 .. i*12+11]` (repeat value 12 times)
3. Preserve all `FinancialFieldValue` metadata (source, brandDefault, etc.)
4. Migration runs on plan load, not as a batch job

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `shared/financial-engine.ts` | MODIFY | Expand per-month fields in `FinancialInputs` from 5-tuple to 60-element array. Update engine loop to use per-month lookup for qualifying fields. |
| `shared/plan-initialization.ts` | MODIFY | Add migration for 5→60 element expansion. Update `unwrapForEngine()` for per-month fields. |
| `client/src/components/planning/statements/input-field-map.ts` | MODIFY | Add all missing `INPUT_FIELD_MAP` entries. Add `granularity` property. |
| `client/src/components/planning/statements/pnl-tab.tsx` | MODIFY | Remove `flashingRows` state, link icons, flash animation. Add "Copy Year 1 to all" action. Update `handleCommitEdit` for per-month writes. |
| `client/src/components/planning/statements/inline-editable-cell.tsx` | MODIFY | Remove `isFlashing` prop and `animate-flash-linked` class. |
| `client/src/hooks/use-field-editing.ts` | MODIFY | Support per-month array writes (month index parameter). |
| `client/src/lib/field-metadata.ts` | MODIFY | Update labels/format for new editable fields if needed. |
| `shared/financial-engine.test.ts` | MODIFY | Add tests for per-month input consumption. |
| `shared/plan-initialization.test.ts` | MODIFY | Add tests for 5→60 migration. |

### Testing Expectations

- **E2E (Playwright)**:
  - Click on Facilities Year 3 in P&L → edit value → confirm Year 1, 2, 4, 5 unchanged, Year 3 total OpEx recalculated
  - Click on Management Salaries Year 2 → edit → confirm saved and reflected in EBITDA
  - Click on Royalty % Year 4 → edit → confirm only Year 4 royalty changes
  - Drill into Year 1 quarterly → drill into Q2 monthly → edit Month 5 COGS% → confirm Month 4, 6 unchanged, Q2 average recalculated, Year 1 annual recalculated
  - "Copy Year 1 to all" → confirm dialog → confirm all years updated → for per-month field, confirm all 12 monthly values copied
  - "Copy Year 1 to all" → Cancel → confirm no changes
  - Verify flash animation and link icons are gone
  - Verify Other OpEx displays as percentage (not currency)

- **Unit tests**:
  - Migration: 5-element → 60-element expansion preserves values and metadata
  - Engine: per-month inputs produce correct monthly output (Month 3 COGS ≠ Month 7 COGS when inputs differ)
  - `scaleForStorage`: reverse-scaling for annual→monthly, quarterly→monthly for currency fields

### References

- **PRD Requirements**: FR7i (per-year independent editing), FR7j (full input assumption set)
- **Predecessor**: Story 7.1a (data model foundation, per-year arrays, drill-down display infrastructure)
- **Design Principle**: Reports = power editing surface; Forms = onboarding only

### Scope Risk Note

Per-month independence (AC-2) is a material data-model and engine expansion (5→60 element arrays, migration, engine lookup changes). If timeline risk emerges during implementation, per-month independence can be split into a follow-up story 7.1b.1 without blocking 7.1c/7.1d. The per-year editing (AC-1) and Copy Year 1 (AC-3) are the hard prerequisites for downstream stories.

### Dependencies

- **Depends on**: Story 7.1a (DONE)
- **Blocks**: Story 7.1c, 7.1d (both depend on "Fine-tune in Reports" being functional), 7.1e (can parallel once editing patterns are established)

### Completion Notes

### File List

### Testing Summary
