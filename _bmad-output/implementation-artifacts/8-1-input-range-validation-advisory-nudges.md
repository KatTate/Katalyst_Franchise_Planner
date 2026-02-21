# Story 8.1: Input Range Validation & Advisory Nudges

Status: ready-for-dev

## Story

As a franchisee,
I want to be notified when my inputs are unusual compared to brand norms,
so that I can make informed decisions about my assumptions.

## Acceptance Criteria

### AC-1: Advisory Nudge Appears for Out-of-Range Inputs (My Plan Forms)

**Given** I am editing a financial input field in My Plan (forms mode)
**When** I commit a value that deviates more than the configured threshold from the FDD Item 7 range midpoint or brand average
**Then** a non-blocking advisory nudge appears inline near the relevant field
**And** the nudge displays contextual information in the format: "[Brand] locations in similar markets typically see [range]. Your estimate of [value] is [above/below] this range."
**And** the nudge uses the advisory color scheme — `guardian-concerning` token (Gurple #A9A2AA mapped to `--guardian-concerning` HSL) — never red, never error-styled
**And** the nudge does not prevent me from saving or proceeding with my chosen value
**And** the nudge is not a modal, toast, or disruptive overlay — it is inline near the field

### AC-2: Advisory Nudge Appears for Out-of-Range Inputs (Reports Inline Editing)

**Given** I am editing a financial input cell inline in Reports
**When** I commit a value that falls outside the field's Item 7 range or brand average by more than the configured threshold
**Then** the cell shows a subtle advisory-color background tint (`guardian-concerning/10`)
**And** hovering the cell displays a range tooltip: "[Brand] typical range: [low]–[high]. Your value: [value]."
**And** the advisory background persists until the value is changed to within range or the field is reset to brand default
**And** the advisory does not block saving, Tab navigation, or any other interaction

### AC-3: Nudge Disappears When Value Returns to Range

**Given** an advisory nudge is displayed for an out-of-range field
**When** I change the value to within the acceptable range, or I reset the field to brand default
**Then** the advisory nudge disappears immediately (My Plan) or the advisory background clears (Reports)

### AC-4: Fields Without Range Data Show No Nudge

**Given** a financial input field where `item7Range` is `null` and no brand average range is configured
**When** I enter any value
**Then** no advisory nudge is displayed for that field — advisory nudges require range data to evaluate against

### AC-5: Deviation Threshold Is Configurable Per Brand

**Given** the deviation threshold determines when a nudge triggers (default: value falls outside the Item 7 range — i.e., below `item7Range.min` or above `item7Range.max`)
**When** a brand has a custom threshold configured in `brand_parameters`
**Then** the system uses the brand-specific threshold instead of the default
**And** if no custom threshold is set, the system uses a sensible default (value outside Item 7 range boundaries)

### AC-6: Advisory Nudge Content References Brand Name

**Given** an advisory nudge is triggered
**When** the nudge text is rendered
**Then** it includes the brand name (e.g., "PostNet locations typically see..." not "Franchise locations typically see...")
**And** range values are formatted according to the field's format type (currency, percentage, or integer)

### AC-7: Advisory Nudges Are Accessible

**Given** advisory nudges are rendered
**Then** each nudge has `role="status"` with `aria-live="polite"` so screen readers announce them non-intrusively
**And** the advisory color meets WCAG contrast requirements against its background
**And** the nudge conveys meaning through text and icon (Info circle), not color alone

### AC-8: No Regressions to Existing Form or Reports Behavior

**Given** advisory nudges are added to My Plan forms and Reports inline editing
**When** I interact with fields normally (editing, Tab navigation, reset, auto-save)
**Then** all existing behavior is preserved — nudges are additive, not disruptive
**And** existing field-help-icon tooltips, source badges, and BD indicators continue to function

## Dev Notes

### Architecture Patterns to Follow

**Per-Field Metadata (Already Exists):**
Every `FinancialFieldValue` in `shared/financial-engine.ts` already carries `item7Range: { min: number; max: number } | null` and `brandDefault: number | null`. The advisory nudge system reads this metadata — it does not create a new data model. The existing `PlanFinancialInputs` structure (`shared/financial-engine.ts`) maps every field to a `FinancialFieldValue` with range data populated from brand parameters during plan initialization (`shared/plan-initialization.ts` → `buildPlanFinancialInputs()`).

**StartupCostLineItem (Already Exists):**
Startup cost items in `shared/financial-engine.ts` already carry `item7RangeLow: number | null` and `item7RangeHigh: number | null`. The same advisory logic should apply to startup cost fields when ranges are present.

**Guardian Color System (Already Exists):**
The advisory color is already defined in `client/src/index.css` as `--guardian-concerning` (HSL `293 4% 65%` light / `280 12% 55%` dark). Use `guardian-concerning` Tailwind classes — e.g., `bg-guardian-concerning/10` for tinted backgrounds, `text-guardian-concerning` for advisory text, `border-guardian-concerning/30` for subtle borders. The `Info` icon from Lucide is the established advisory icon (used in `guardian-bar.tsx` and `impact-strip.tsx` for the "concerning" level).

**Field Formatting (Already Exists):**
Use `formatFieldValue(value, format)` from `client/src/lib/field-metadata.ts` to format range values in nudge messages. The `FIELD_METADATA` map provides `format: "currency" | "percentage" | "integer"` for every field.

**Callout Bar Range Pattern (Already Exists):**
`client/src/components/planning/statements/callout-bar.tsx` already implements Item 7 COGS range comparison. The pattern reads `financialInputs?.operatingCosts?.cogsPct?.item7Range`, computes the actual percentage, and formats "within/above/below typical range" text. Reuse this comparison logic for per-field advisory nudges — do not create a different range-checking algorithm.

**Component Naming Convention:**
- Shared advisory components go in `client/src/components/shared/`
- Advisory nudge component: `advisory-nudge.tsx` (reusable across My Plan and Reports)
- Advisory range utility: `client/src/lib/advisory-range.ts` (range checking + message formatting)

**State Management:**
Advisory nudge visibility is computed client-side from the existing `FinancialFieldValue` metadata — no new API endpoints, no server-side validation calls, no new database columns. The nudge computation is a pure function: `(currentValue, item7Range, brandDefault, threshold) → { isOutOfRange, message }`.

**Source References:**
- Architecture: `_bmad-output/planning-artifacts/architecture.md` → "Advisory & Guardrails (FR20-FR23)" section, Decision 15 (EngineInput), Project Structure (component locations)
- PRD: `_bmad-output/planning-artifacts/prd.md` → FR20, FR23, FR88, FR89
- UX: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` → Part 6 (Gurple token), Part 8 (Per-Field Metadata, My Plan Interaction), Part 12 (Guardian Bar, Dynamic Interpretation)

### UI/UX Deliverables

**My Plan Advisory Nudge (Inline):**
- Appears below the input field when the committed value is outside range
- Compact single-line or two-line message with Info circle icon on the left
- Background: `guardian-concerning/10` with `border-guardian-concerning/30` left border accent
- Text: `text-guardian-concerning` (or `text-muted-foreground` if contrast is better)
- No dismiss button needed — nudge auto-clears when value returns to range
- Does not shift form layout significantly — use minimal vertical space (e.g., `text-xs` or `text-sm`)

**Reports Inline Editing Advisory (Cell Background):**
- Out-of-range cells get a subtle `bg-guardian-concerning/10` background tint
- Hover tooltip shows range context (brand name, typical range, user's value)
- Advisory background coexists with existing cell styles (dashed left border for editable, BD badge, flash animation)
- Advisory tint is additive — applied via additional CSS class, not replacing existing cell styling

**Nudge Message Format:**
- My Plan: `ℹ [Brand] locations typically see [formattedLow]–[formattedHigh]. Your estimate of [formattedValue] is [above/below] this range.`
- Reports tooltip: `[Brand] typical range: [formattedLow]–[formattedHigh]. Your value: [formattedValue].`
- All values formatted per field type (currency with `$`, percentage with `%`, integer plain)

**Advisory Icon:**
- Use `Info` from `lucide-react` (already used in `guardian-bar.tsx` for "concerning" level)
- Size: `h-3.5 w-3.5` inline with text (matches `field-help-icon.tsx` sizing)

**Empty/Loading States:**
- If `item7Range` is `null`: no nudge rendered (AC-4)
- If field is still at brand default: no nudge rendered (brand default is within its own range by definition)
- During auto-save: nudge state does not flicker — computed from local value, not server response

### Anti-Patterns & Hard Constraints

- **DO NOT use red or `destructive` for advisory nudges.** Red is reserved for actual errors (FR88). Advisory nudges use `guardian-concerning` (Gurple). This is a core UX principle — violating it breaks user trust.
- **DO NOT create modal dialogs, toast notifications, or overlay popups for range warnings.** Nudges are inline, non-blocking, and near the relevant field (FR23).
- **DO NOT add new API endpoints for advisory validation.** Range checking is a pure client-side function using existing `FinancialFieldValue.item7Range` metadata. No network calls needed.
- **DO NOT add new database columns or modify the schema.** All required data (`item7Range`, `brandDefault`, `source`) already exists in `FinancialFieldValue` and `StartupCostLineItem`.
- **DO NOT modify `shared/financial-engine.ts` (the engine computation).** The engine is a pure projection calculator. Advisory nudges are a display-layer concern.
- **DO NOT modify `guardian-bar.tsx` or `guardian-engine.ts`.** The Guardian Bar is a plan-level health indicator. Story 8.1 adds field-level advisory nudges — a separate concern that coexists with the Guardian.
- **DO NOT block form submission, auto-save, or field commit** when an advisory nudge is active. The nudge is informational only.
- **DO NOT add a new color token.** The advisory color already exists as `--guardian-concerning`. Reuse it.
- **DO NOT duplicate the range-checking logic** in multiple components. Create a single utility function and import it where needed.

### Gotchas & Integration Warnings

1. **Currency values are in cents.** `FinancialFieldValue.currentValue` and `item7Range.min/max` are stored in cents (e.g., `1500000` = $15,000). The `formatFieldValue()` function handles conversion to display format. Ensure range comparison happens in the same unit as the stored values (cents for currency, decimal for percentages).

2. **Percentage values are decimals.** E.g., `0.065` = 6.5%. `item7Range` for percentage fields stores min/max as decimals. The nudge message must format these as human-readable percentages.

3. **`item7Range` may be null for many fields.** Only fields with FDD Item 7 data will have ranges. The advisory system must gracefully skip fields with no range data (AC-4).

4. **Startup cost ranges use different field names.** `StartupCostLineItem` uses `item7RangeLow`/`item7RangeHigh` (separate fields) rather than `item7Range: { min, max }`. The advisory utility must handle both shapes.

5. **Brand default is always in range.** If `source === "brand_default"`, skip the nudge — the brand-configured default is by definition within the expected range. Only check when `source === "user_entry"` or `source === "ai_populated"`.

6. **My Plan forms uses `useFieldEditing` hook.** The hook tracks `editingField`, `focusedField`, and handles commit/cancel. Advisory nudge rendering should key off the committed value (after `handleEditCommit`), not the in-progress edit value.

7. **Reports inline editing uses `InlineEditableCell`.** The cell component in `client/src/components/planning/statements/inline-editable-cell.tsx` handles edit mode. The advisory background tint should be applied as a prop or wrapper — not by modifying the core cell component's internal styling.

8. **Callout bar already shows COGS range.** The existing `callout-bar.tsx` P&L tab shows "COGS at X% — above/within/below typical range." This is a tab-level callout, not a per-field nudge. Both should coexist — they serve different purposes (plan-level summary vs. field-level guidance).

9. **Auto-save timing.** My Plan auto-saves via `queueSave` in `forms-mode.tsx`. The nudge should appear immediately on commit (computed from local state), not wait for the server save response.

10. **Dark mode.** Advisory colors have separate dark mode HSL values (`--guardian-concerning: 280 12% 55%` in dark). Test that advisory nudge backgrounds and text remain legible in both light and dark modes.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/lib/advisory-range.ts` | CREATE | Pure utility: range checking, message formatting, threshold evaluation. Exports `checkFieldRange()` and `formatAdvisoryMessage()`. |
| `client/src/components/shared/advisory-nudge.tsx` | CREATE | Reusable inline advisory nudge component. Renders Info icon + message with advisory styling. Used by My Plan forms. |
| `client/src/components/planning/forms-mode.tsx` | MODIFY | Import and render `AdvisoryNudge` below fields that fail range check after commit. |
| `client/src/components/planning/statements/inline-editable-cell.tsx` | MODIFY | Add optional `isAdvisory` prop for advisory background tint. Add optional `advisoryTooltip` prop for hover range message. |
| `client/src/components/planning/statements/pnl-tab.tsx` | MODIFY | Pass advisory props to InlineEditableCell for input rows with out-of-range values. |
| `client/src/components/planning/statements/balance-sheet-tab.tsx` | MODIFY | Pass advisory props to InlineEditableCell for input rows with out-of-range values. |
| `client/src/components/planning/statements/cash-flow-tab.tsx` | MODIFY | Pass advisory props to InlineEditableCell for input rows with out-of-range values. |
| `client/src/lib/advisory-range.test.ts` | CREATE | Unit tests for range checking utility: in-range, out-of-range, null range, currency formatting, percentage formatting, threshold config. |

### Testing Expectations

- **Unit tests** for `advisory-range.ts`: Cover in-range values, out-of-range above, out-of-range below, null item7Range, currency vs percentage formatting, custom threshold, brand default skip logic. Use Vitest (the project's established test framework at `vitest.config.ts`).
- **Visual verification** for advisory nudges in My Plan forms: nudge appears below field, uses correct color, disappears on value correction.
- **Visual verification** for Reports inline editing: advisory cell tint appears, tooltip shows on hover, tint clears when value returns to range.
- **Accessibility verification**: nudge has `role="status"` and `aria-live="polite"`, color+icon convey meaning.
- **Regression check**: Existing field editing, Tab navigation, auto-save, field help icons, source badges, BD indicators all continue to work.
- **Existing tests** live in `client/src/**/*.test.ts`, `shared/**/*.test.ts`, and `e2e/` (Playwright). Run `npx vitest run` for unit tests.

### Dependencies & Environment Variables

**Already installed — DO NOT reinstall:**
- `lucide-react` (Info icon)
- `@radix-ui/react-tooltip` (tooltip pattern via shadcn/ui)
- `vitest` (test framework)
- `recharts` (not needed for this story)

**No new packages required.** All UI primitives (Tooltip, Badge, icons) are already available via shadcn/ui and Lucide.

**No new environment variables required.**

### References

- PRD: `_bmad-output/planning-artifacts/prd.md` → FR20 (Input Range Validation), FR23 (Non-Blocking Advisory), FR88 (Advisory vs. Error Visual Distinction), FR89 (Guardian Visual States)
- Architecture: `_bmad-output/planning-artifacts/architecture.md` → Advisory & Guardrails section (FR20-FR23 coverage), Decision 15 (Engine purity), Project Structure (component file locations)
- UX Spec: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` → Part 6 (Mystical/Gurple token `#A9A2AA`, Color Governance Rule 3), Part 8 (Per-Field Metadata, My Plan Interaction Flow, Metadata-on-Demand), Part 12 (Guardian Bar, Row-Level Interpretation, Type 2 benchmarks)
- Epics: `_bmad-output/planning-artifacts/epics.md` → Epic 8, Story 8.1 definition
- Existing code: `shared/financial-engine.ts` (FinancialFieldValue.item7Range), `client/src/components/planning/statements/callout-bar.tsx` (COGS range pattern), `client/src/components/planning/statements/guardian-bar.tsx` (color system), `client/src/lib/guardian-engine.ts` (threshold pattern), `client/src/components/shared/field-help-icon.tsx` (inline help pattern)

## Dev Agent Record

### Agent Model Used

### Completion Notes

### File List

### Testing Summary
