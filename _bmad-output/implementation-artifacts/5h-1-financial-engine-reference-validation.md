# Story 5H.1: Financial Engine Cell-by-Cell Validation Against Reference Spreadsheets

Status: ready-for-dev

## Story

As a project stakeholder,
I want the financial engine validated cell-by-cell against multiple brand reference spreadsheets,
So that we have verified confidence that engine output matches the source-of-truth calculations before those outputs are permanently captured in lender-facing PDF documents (Epic 6).

## Acceptance Criteria

### Phase 1: Input Mapping (all brands)

**AC-1.** **Given** a reference spreadsheet for a brand, **when** the input mapping is created, **then** a documented input mapping table exists for EACH brand being validated, showing how every spreadsheet input cell maps to a `FinancialInputs` field.

**AC-2.** **And** the mapping explicitly documents every conversion applied (dollars→cents, monthly→annual, single→5-year tuple, percentage display→decimal).

**AC-3.** **And** the mapping accounts for the `unwrapForEngine()` transformation pipeline in `shared/plan-initialization.ts` — specifically: `monthlyAuv * 12 → annualGrossSales`, `fill5()` for single→tuple, `monthly fixed costs → annual with 3% escalation`, `otherMonthly (cents) → otherOpexPct (% of revenue)`, `loanAmount / totalInvestment → equityPct`, `depreciationYears → depreciationRate (1/years)`.

**AC-4.** **And** the input mapping is documented as structured constants within the test file (`shared/financial-engine-reference.test.ts`) — mapping constants live alongside the assertions they feed, producing one self-contained artifact.

**AC-5.** **And** without explicit input mapping, validators make different assumptions — this mapping is the prerequisite for all subsequent validation.

### Phase 2: Cell-by-Cell Output Comparison (minimum 2 brands)

**AC-6.** **Given** the input values from a reference spreadsheet are loaded into the engine via the documented input mapping, **when** the engine computes projections via `calculateProjections()`, **then** every output cell is compared against the corresponding spreadsheet output cell for the following priority outputs:
- P&L: all line items for months 1, 12, 24, 36, 48, 60 AND annual totals (Years 1-5)
- Balance Sheet: all line items at months 12, 24, 36, 48, 60
- Cash Flow: all line items for months 1, 12, 24, 36, 48, 60
- ROIC: all summary metrics per year
- Valuation: all summary metrics per year
- Audit: all 15 audit checks pass/fail status

**AC-7.** **And** intermediate months are spot-checked after primary validation passes.

**AC-8.** **And** validation covers at minimum **2 brands** (PostNet + one other) — one brand could pass by coincidence if paired bugs cancel out. Remaining brands are stretch goals.

**AC-9.** **And** each discrepancy is documented with: cell reference (tab + row + column), expected value (from spreadsheet), actual value (from engine), delta (absolute and percentage), and classification.

### Phase 3: Tolerance & Discrepancy Classification

**AC-10.** **Given** a discrepancy between engine output and spreadsheet value, **when** the delta is evaluated, **then** tolerance thresholds are: ±$1 (100 cents) per line item, ±$10 (1000 cents) per section total.

**AC-11.** **And** deltas within tolerance are classified as rounding artifacts and documented but not fixed.

**AC-12.** **And** deltas exceeding tolerance are classified into one of three categories, each requiring Product Owner sign-off:
- **(a) BUG** — formula error in the engine. Must fix `shared/financial-engine.ts` AND add regression test. Engine test suite must be updated.
- **(b) KNOWN DIVERGENCE** — intentional simplification in the engine (e.g., `otherMonthly→otherOpexPct` approximation, monthly-to-annual cost escalation model). Document the rationale, the magnitude of divergence, and whether it's acceptable for lender-facing documents.
- **(c) SPREADSHEET ERROR** — the reference spreadsheet itself has a bug. Document with evidence (formula inspection, cross-check against other brands).

### Phase 4: Codify as Permanent Test Assertions

**AC-13.** **Given** the validation results for each brand, **when** the validation is codified, **then** validation results are permanent Vitest assertions in a dedicated test file (`shared/financial-engine-reference.test.ts`).

**AC-14.** **And** tests run in the standard `vitest` suite so every future engine change automatically regresses against reference values.

**AC-15.** **And** the test file documents: input values used, expected output values, tolerance applied, and source spreadsheet cell reference.

**AC-16.** **And** any formula fix includes BOTH the engine fix AND a new regression test assertion.

**AC-17.** **And** engine fixes must not break any of the existing 173+ internal consistency tests; if a fix necessarily changes internal test expectations, the dev agent must document the rationale for each affected test and update it deliberately — silent test failures or skips are not acceptable.

### Phase 5: Carried Item Resolution

**AC-18.** **Given** the `taxRate` TODO has been carried from Epic 3 (now 4 epics old, documented as AI-10), **when** the cell-by-cell validation runs, **then** the validation reveals whether the current tax rate implementation matches the reference spreadsheets.

**AC-19.** **And** if the implementation matches, the TODO is resolved as "confirmed correct" with a comment referencing the validation.

**AC-20.** **And** if the implementation does not match, the fix is included in the engine corrections from Phase 3.

**AC-21.** **And** either way, the `taxRate` TODO is resolved — it does not carry to another epic.

## Dev Notes

### Why This Story Exists

The financial engine (`shared/financial-engine.ts`, 1,091 lines) has 173+ internal consistency tests in `shared/financial-engine.test.ts` (1,742 lines). These tests verify that the balance sheet balances, cash flow reconciles, depreciation schedules are consistent, and accounting identities hold. **However, no test compares engine output cell-by-cell against the reference spreadsheet values.** Internal consistency tests prove the engine is internally coherent — they do NOT prove the engine produces correct dollar amounts. A perfectly consistent engine with a wrong formula produces consistently wrong numbers.

This story is the **CRITICAL BLOCKER** for Epic 6 (Document Generation & Vault). Epic 6 turns engine output into permanent lender-facing PDF documents. If the engine has undiscovered formula bugs, they would be permanently captured in documents used for SBA loan applications. The validation must happen BEFORE any PDF generation work begins.

**Origin:** Epic 5 Retrospective Action Item AI-1 (CRITICAL severity). Also absorbs AI-10 (taxRate TODO carried from Epic 3).

### Reference Data Inventory

**Reference Spreadsheets** (`_bmad-output/planning-artifacts/reference-data/`):
| File | Brand | Size |
|------|-------|------|
| `PostNet_-_Business_Plan_1770511701987.xlsx` | PostNet | 3.0 MB |
| `Jeremiah's_Italian_Ice_-_Business_Plan_1770526878237.xlsx` | Jeremiah's Italian Ice | 3.0 MB |
| `Tint_World_-_Business_Plan_1770526878237.xlsx` | Tint World | 3.0 MB |
| `Ubreakifix_-_Business_Plan_1770526878237.xlsx` | Ubreakifix | 3.0 MB |

**Reference Tab Screenshots** (same directory — use to verify cell references when .xlsx parsing is ambiguous):
- `Screenshot Start Here Tab.png` — brand overview / setup page
- `Screenshot Input Tab.png` — input values
- `Screenshot P&L Tab.png` — profit & loss statement
- `Screenshot BS Tab.png` — balance sheet
- `Screenshot CashFlow Tab.png` — cash flow statement
- `Screenshot ROIC Tab.png` — returns on invested capital
- `Screenshot Valuation Tab.png` — business valuation
- `Screenshot Full Model Tab.png` — full monthly model
- `Screenshot Audit Tab.png` — audit / identity checks
- `Screenshot Summarby Tab 1.png` / `Screenshot Summary Tab 2.png` — summary views

### Architecture Constraints (Non-Negotiable)

**Engine Purity:**
- `calculateProjections(input: EngineInput): EngineOutput` is a pure function — same inputs → same outputs. No `Date.now()`, no randomness, no I/O, no side effects.
- Engine never touches database, filesystem, or network.
- Code lives in `shared/` — runs on both server and client. No server-only APIs (fs, crypto), no DOM APIs.

**Currency Convention:**
- All currency values: **cents as integers** (15000 = $150.00)
- All percentages: **decimals** (0.065 = 6.5%)
- Never mix. This convention applies to BOTH the test file and any engine fixes.

**Engine Input Interface:**
```typescript
interface EngineInput {
  financialInputs: FinancialInputs;
  startupCosts: StartupCostLineItem[];
}
```

The engine takes `FinancialInputs` (raw numbers with 5-year tuples), NOT `PlanFinancialInputs` (wrapped with `FinancialFieldValue` metadata). For this story, you construct `FinancialInputs` directly from spreadsheet values — you do NOT call `unwrapForEngine()`. The `unwrapForEngine()` pipeline is documented here for reference (to understand why existing test data may differ from spreadsheet inputs), but the test file should construct `FinancialInputs` objects directly.

### The `unwrapForEngine()` Transformation Pipeline

This pipeline in `shared/plan-initialization.ts` (lines 271-368) converts UI-facing `PlanFinancialInputs` to engine-facing `FinancialInputs`. Understanding these transformations is critical for input mapping because they explain HOW values get from the UI to the engine. When mapping spreadsheet inputs, you need to understand what the engine actually expects:

| Spreadsheet Input | Transformation | Engine Field |
|---|---|---|
| Monthly AUV (dollars) | `× 12`, then `× 100` (dollars→cents) | `annualGrossSales` (annual, cents) |
| Single cost percentage | `fill5()` — replicated to 5-year array | `cogsPct`, `laborPct`, etc. (5-element tuple) |
| Monthly rent + utilities + insurance | Sum, `× 12`, then escalate at 3%/yr for 5 years | `facilitiesAnnual` (5-element tuple, cents) |
| Other monthly cost (dollars) | `(otherMonthly × 12) / annualGrossSales` → percentage | `otherOpexPct` (decimal, per-year tuple) — **KNOWN LIMITATION** |
| Loan amount + total investment | `1 - (loanAmount / totalInvestment)` | `equityPct` (decimal, 0-1) |
| Depreciation years | `1 / years` | `depreciationRate` (decimal) |
| Down payment % | **UI-only** — NOT passed to engine | N/A — `equityPct` derived from loanAmount |
| Growth rates (Year 1, Year 2) | Year 2 rate fills Years 2-5 | `growthRates` (5-element tuple) |

**KNOWN LIMITATION — `otherMonthly → otherOpexPct`:**
This converts a fixed monthly dollar cost into a percentage of revenue, making it scale with revenue changes. The engine interface only accepts `otherOpexPct` (percentage), not fixed dollar amounts. This will likely surface as a **KNOWN DIVERGENCE** during validation if the spreadsheet treats this as a fixed cost.

**Hardcoded defaults in `unwrapForEngine()`** (these may not appear in the spreadsheet):
- `monthsToReachAuv`: hardcoded to `DEFAULT_MONTHS_TO_REACH_AUV` (14)
- `payrollTaxPct`: hardcoded to `DEFAULT_PAYROLL_TAX_PCT` (0.20) across all 5 years
- `managementSalariesAnnual`: hardcoded to `[0, 0, 0, 0, 0]`
- `distributions`: hardcoded to `[0, 0, 0, 0, 0]`
- `taxRate`: hardcoded to `DEFAULT_TAX_RATE` (0.21)
- Working capital assumptions: `arDays=30, apDays=60, inventoryDays=60`

Note: The existing `shared/financial-engine.test.ts` PostNet input data (lines 14-61) was constructed for internal consistency testing. It may have values that DON'T exactly match the spreadsheet if the original developer made mapping errors. **The reference test file must re-derive inputs from the spreadsheet independently** — do not copy from the existing test file without verification.

### Existing Test Data WARNING

The existing test file `shared/financial-engine.test.ts` already has a `postNetInputs` constant (line 14) and `postNetStartupCosts` array (line 50). These were created for internal consistency testing and may contain mapping errors that were never caught (because internal consistency tests don't compare against reference values).

**Do not trust existing test data as ground truth.** Re-derive all input mappings from the source spreadsheets. If the existing test data matches the spreadsheet, great — document the confirmation. If it doesn't match, document the discrepancy and use the spreadsheet values in the reference test file.

### Spreadsheet Parsing Guidance

**Tool:** Use the `xlsx` npm package to parse .xlsx files. It's already available in the project environment (check `package.json`), or install via packager if needed.

**Approach:**
1. Parse the .xlsx file programmatically to extract cell values
2. Use the tab screenshots as visual verification when cell references are ambiguous
3. For each brand, document the exact cell references (e.g., "P&L!B5" for Month 1 Gross Sales)
4. Handle any merged cells or formula-only cells carefully — extract the computed value, not the formula

**Tabs to Extract From:**
| Tab | Content | Priority |
|-----|---------|----------|
| Input | All input parameters | Phase 1 (mapping) |
| P&L | Monthly and annual P&L | Phase 2 (primary) |
| BS (Balance Sheet) | Monthly balance sheet | Phase 2 (primary) |
| Cash Flow | Monthly cash flow | Phase 2 (primary) |
| ROIC | Annual ROIC metrics | Phase 2 (primary) |
| Valuation | Annual valuation metrics | Phase 2 (primary) |
| Audit | Identity check results | Phase 2 (primary) |
| Full Model | Complete monthly model | Phase 2 (spot-checks) |
| Summary | Annual summary | Phase 2 (verification) |

### Test File Structure

Create `shared/financial-engine-reference.test.ts` with this structure:

```typescript
import { describe, it, expect } from "vitest";
import { calculateProjections, type EngineInput, type FinancialInputs, type StartupCostLineItem } from "./financial-engine";

// ═══════════════════════════════════════════════════════════════════════
// TOLERANCE CONSTANTS
// ═══════════════════════════════════════════════════════════════════════
const LINE_ITEM_TOLERANCE = 100;    // ±$1.00 (100 cents) per line item
const SECTION_TOTAL_TOLERANCE = 1000; // ±$10.00 (1000 cents) per section total

// ═══════════════════════════════════════════════════════════════════════
// BRAND 1: PostNet
// Source: _bmad-output/planning-artifacts/reference-data/PostNet_-_Business_Plan_1770511701987.xlsx
// ═══════════════════════════════════════════════════════════════════════

// ─── Input Mapping ──────────────────────────────────────────────────
// Each field documents:
//   - Spreadsheet cell reference (Tab!Cell)
//   - Raw spreadsheet value
//   - Conversion applied
//   - Resulting engine value

const postNetReferenceInputs: FinancialInputs = {
  revenue: {
    annualGrossSales: 0,      // Input!B3: $X/mo → ×12 → ×100 → cents
    monthsToReachAuv: 0,      // Input!B4: X months
    startingMonthAuvPct: 0,   // Input!B5: X% → ÷100 → decimal
    growthRates: [0, 0, 0, 0, 0], // Input!B6,B7: Y1=X%, Y2=Y% → Y fills 2-5
  },
  // ... (complete mapping for all sections)
};

const postNetReferenceStartupCosts: StartupCostLineItem[] = [
  // Source: Input tab startup costs section
  // Each item: { id, name, amount (cents), capexClassification, ... }
];

const postNetReferenceInput: EngineInput = {
  financialInputs: postNetReferenceInputs,
  startupCosts: postNetReferenceStartupCosts,
};

// ─── Expected Output Values ─────────────────────────────────────────
// Each value documents the source cell reference from the spreadsheet

const postNetExpectedOutputs = {
  pl: {
    month1: { grossSales: 0, /* ... */ },  // P&L!B row values
    month12: { grossSales: 0, /* ... */ }, // P&L!M row values
    // ... months 24, 36, 48, 60
    annualTotals: {
      year1: { grossSales: 0, /* ... */ }, // P&L annual column
      // ... years 2-5
    },
  },
  balanceSheet: {
    month12: { /* ... */ },
    // ... months 24, 36, 48, 60
  },
  cashFlow: { /* ... */ },
  roic: { /* per year */ },
  valuation: { /* per year */ },
  audit: { /* 15 check pass/fail */ },
};

// ─── Validation Tests ───────────────────────────────────────────────

describe("Reference Validation: PostNet", () => {
  const result = calculateProjections(postNetReferenceInput);

  describe("P&L — Priority Months", () => {
    it("Month 1 gross sales matches reference ±$1", () => {
      const m1 = result.monthlyProjections[0];
      expect(m1.revenue).toBeCloseTo(postNetExpectedOutputs.pl.month1.grossSales, -2);
      // Or: expect(Math.abs(m1.revenue - expected)).toBeLessThanOrEqual(LINE_ITEM_TOLERANCE);
    });
    // ... all P&L line items for months 1, 12, 24, 36, 48, 60
  });

  describe("P&L — Annual Totals", () => {
    // Year 1-5 annual totals
  });

  describe("Balance Sheet — Year-End Snapshots", () => {
    // Month 12, 24, 36, 48, 60
  });

  describe("Cash Flow — Priority Months", () => {
    // Months 1, 12, 24, 36, 48, 60
  });

  describe("ROIC — Annual Metrics", () => {
    // Years 1-5
  });

  describe("Valuation — Annual Metrics", () => {
    // Years 1-5
  });

  describe("Audit — Identity Checks", () => {
    // All 15 audit checks
  });
});

// ═══════════════════════════════════════════════════════════════════════
// BRAND 2: [Second Brand — Jeremiah's, Tint World, or Ubreakifix]
// ═══════════════════════════════════════════════════════════════════════
// Same structure as PostNet above
```

### Tolerance Implementation

Use custom assertion helpers for consistency:

```typescript
function expectWithinTolerance(actual: number, expected: number, tolerance: number, label: string) {
  const delta = Math.abs(actual - expected);
  const pctDelta = expected !== 0 ? (delta / Math.abs(expected)) * 100 : (delta > 0 ? Infinity : 0);
  expect(delta, `${label}: actual=${actual}, expected=${expected}, delta=${delta} (${pctDelta.toFixed(2)}%), tolerance=${tolerance}`).toBeLessThanOrEqual(tolerance);
}
```

### Discrepancy Documentation

For any discrepancy exceeding tolerance, document directly in the test file as a comment block:

```typescript
// DISCREPANCY: P&L Month 12 COGS
// Cell: P&L!M8
// Expected (spreadsheet): 1234567 ($12,345.67)
// Actual (engine): 1234890 ($12,348.90)
// Delta: 323 cents ($3.23), 0.03%
// Classification: BUG | KNOWN DIVERGENCE | SPREADSHEET ERROR
// Rationale: [explanation]
// PO Sign-off: [pending | approved YYYY-MM-DD]
```

### taxRate TODO Resolution (AC-18 through AC-21)

The `taxRate` TODO has been carried since Epic 3 (documented as AI-10 in Epic 5 Retrospective). Current implementation:
- `taxRate` is set to `0.21` (21%) via `DEFAULT_TAX_RATE` constant
- Used in 3 engine locations:
  - Line 521: Tax accrual on P&L → `Math.max(0, preTaxIncome * fi.taxRate)`
  - Line 728: Valuation tax on sale → `estimatedValue * fi.taxRate`
  - Line 766: ROIC taxes due → `Math.max(0, preTaxNetIncomeIncSweatEquity * fi.taxRate)`
- Also returned as-is in ROIC output (line 787): `taxRate: fi.taxRate`

**Resolution approach:** During cell-by-cell validation, compare the engine's tax calculations against the spreadsheet's tax calculations. If they match → resolve as "confirmed correct." If they don't → classify and fix per Phase 3 rules.

### Agent Session Control Rules (Mandatory)

These rules are from the Epic 5 Retrospective and are mandatory for ALL stories in Epic 5H:

1. **No self-approval:** Do NOT approve your own work product — SCPs, code reviews, story completion require Product Owner confirmation in a separate session.
2. **No unauthorized rewrites:** Do NOT rewrite or substantially modify a completed story's code without explicit Product Owner approval. Fixing bugs within this story's scope is allowed.
3. **Cross-story bug fixes:** If a bug in the existing engine blocks validation, fix the minimum needed to unblock, document the fix, and flag to Product Owner. Don't refactor — patch.
4. **File ownership awareness:** Before modifying `shared/financial-engine.ts` (owned by Stories 3.1 and 5.1), read the story dev records to understand what was done and why. This prevents accidental regressions.
5. **Code review required:** This story requires a formal adversarial code review (fresh agent context) after all changes are complete. Story stays in "review" status until review is done.

### Implementation Sequence

1. **Install xlsx parser** — verify `xlsx` package is available, install if needed
2. **Parse PostNet spreadsheet** — extract all input cells and output cells programmatically
3. **Create input mapping** — document every conversion in structured constants
4. **Run engine with mapped inputs** — call `calculateProjections()` with PostNet reference inputs
5. **Compare outputs cell-by-cell** — all priority outputs per AC-6
6. **Classify discrepancies** — within tolerance (rounding) vs. exceeding tolerance (BUG/DIVERGENCE/SPREADSHEET ERROR)
7. **Fix BUGs** — patch `shared/financial-engine.ts` with regression tests; verify 173+ existing tests still pass
8. **Repeat for Brand 2** — minimum 2 brands for confidence (AC-8)
9. **Resolve taxRate TODO** — confirm or fix per AC-18 through AC-21
10. **Verify all tests pass** — `vitest run` must pass with zero failures

### Files Modified by This Story

| File | Action | Notes |
|------|--------|-------|
| `shared/financial-engine-reference.test.ts` | **CREATE** | New test file — the primary deliverable |
| `shared/financial-engine.ts` | **MODIFY** (if bugs found) | Engine formula fixes — minimum viable patches only |
| `shared/financial-engine.test.ts` | **MODIFY** (if existing tests affected) | Update expectations if engine fixes change outputs |

### Dependencies & Blocking

- **Depends on:** Epic 5 complete (all 9 stories done — confirmed ✓)
- **Blocks:** Story 5H.2 (Report Tab UI Audit) — must complete Phase 4 before 5H.2 Phase 1 begins. The UI audit must evaluate engine output that reflects all 5H.1 corrections.
- **Blocks:** Epic 6 (Document Generation) — entire epic cannot start until 5H is complete

### Completion Checklist

- [ ] `shared/financial-engine-reference.test.ts` exists with structured input mappings for ≥2 brands
- [ ] All priority output cells compared for ≥2 brands (P&L, BS, CF, ROIC, Valuation, Audit)
- [ ] Every discrepancy >tolerance documented with classification + cell reference
- [ ] All BUG-classified discrepancies fixed in `shared/financial-engine.ts` with regression tests
- [ ] All KNOWN DIVERGENCE discrepancies documented with rationale and magnitude
- [ ] Existing 173+ internal consistency tests still pass (zero regressions)
- [ ] New reference validation tests pass in `vitest` suite
- [ ] taxRate TODO resolved (confirmed correct OR fixed) — does not carry forward
- [ ] All engine fixes flagged to Product Owner for awareness
- [ ] Formal adversarial code review completed (fresh agent context)
