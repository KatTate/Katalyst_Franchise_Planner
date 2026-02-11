/**
 * Quick Start Helpers — Field mapping, scaling, conversion logic for Story 3.6.
 *
 * This module contains all business logic for the Quick Start overlay:
 *  - Staff count ↔ labor percentage conversion
 *  - Investment budget → proportional startup cost scaling
 *  - Sensitivity analysis for highest-impact input identification (AC9)
 *  - Break-even month → calendar date conversion
 */

import type {
  PlanFinancialInputs,
  StartupCostLineItem,
  EngineOutput,
} from "@shared/financial-engine";
import { unwrapForEngine, updateFieldValue } from "@shared/plan-initialization";
import { calculateProjections } from "@shared/financial-engine";

// ─── Constants ──────────────────────────────────────────────────────────

/** Average annual wage per employee in cents ($35,000/year) */
export const AVG_ANNUAL_WAGE_CENTS = 3_500_000;

/** Labor percentage bounds */
const MIN_LABOR_PCT = 0.05;
const MAX_LABOR_PCT = 0.60;

// ─── Staff Count ↔ Labor Percentage ─────────────────────────────────────

/** Convert staff count to labor percentage. Guards against zero revenue. */
export function staffCountToLaborPct(
  staffCount: number,
  monthlyAuvCents: number
): number {
  const annualRevenue = monthlyAuvCents * 12;
  if (annualRevenue <= 0) return MIN_LABOR_PCT;
  const pct = (staffCount * AVG_ANNUAL_WAGE_CENTS) / annualRevenue;
  return Math.max(MIN_LABOR_PCT, Math.min(MAX_LABOR_PCT, pct));
}

/** Reverse: labor percentage to approximate staff count. */
export function laborPctToStaffCount(
  laborPct: number,
  monthlyAuvCents: number
): number {
  const annualRevenue = monthlyAuvCents * 12;
  if (AVG_ANNUAL_WAGE_CENTS <= 0) return 1;
  return Math.round((laborPct * annualRevenue) / AVG_ANNUAL_WAGE_CENTS);
}

// ─── Investment Budget → Proportional Startup Cost Scaling ──────────────

/** Scale all startup cost line items proportionally to match a new budget total.
 *  Adjusts the largest item by rounding difference to ensure exact match. */
export function scaleStartupCosts(
  costs: StartupCostLineItem[],
  newBudgetCents: number
): StartupCostLineItem[] {
  if (costs.length === 0) return costs;

  const currentTotal = costs.reduce((sum, c) => sum + c.amount, 0);
  if (currentTotal <= 0) return costs;

  const scaleFactor = newBudgetCents / currentTotal;
  const scaled = costs.map((c) => ({
    ...c,
    amount: Math.round(c.amount * scaleFactor),
    source: "user_entry" as const,
  }));

  // Fix rounding: adjust the largest item so sum matches exactly
  const scaledTotal = scaled.reduce((sum, c) => sum + c.amount, 0);
  const diff = newBudgetCents - scaledTotal;
  if (diff !== 0) {
    let largestIdx = 0;
    for (let i = 1; i < scaled.length; i++) {
      if (scaled[i].amount > scaled[largestIdx].amount) largestIdx = i;
    }
    scaled[largestIdx] = {
      ...scaled[largestIdx],
      amount: Math.max(0, scaled[largestIdx].amount + diff),
    };
  }

  return scaled;
}

// ─── Startup Cost Total ─────────────────────────────────────────────────

/** Sum all startup cost amounts. */
export function startupCostTotal(costs: StartupCostLineItem[]): number {
  return costs.reduce((sum, c) => sum + c.amount, 0);
}

// ─── Client-Side Engine Computation ─────────────────────────────────────

/** Compute engine outputs from Quick Start inputs (client-side, instant). */
export function computeQuickPreview(
  financialInputs: PlanFinancialInputs,
  startupCosts: StartupCostLineItem[]
): EngineOutput {
  const engineInput = unwrapForEngine(financialInputs, startupCosts);
  return calculateProjections(engineInput);
}

// ─── Break-Even Calendar Date ───────────────────────────────────────────

/** Convert a break-even month number to a calendar date string.
 *  breakEvenMonth is 1-indexed from the engine (month 1 = first month of operations).
 *  Returns "January 2027 (Month 14)" format — calendar date primary. */
export function breakEvenToCalendarDate(
  breakEvenMonth: number | null,
  baseDate?: Date
): string {
  if (breakEvenMonth === null) return "Beyond 5 years";
  const base = baseDate ?? new Date();
  // Subtract 1 because breakEvenMonth is 1-indexed (month 1 = current month)
  const targetDate = new Date(base.getFullYear(), base.getMonth() + breakEvenMonth - 1, 1);
  const monthName = targetDate.toLocaleString("en-US", { month: "long" });
  const year = targetDate.getFullYear();
  return `${monthName} ${year} (Month ${breakEvenMonth})`;
}

// ─── Sensitivity Analysis (AC9) ─────────────────────────────────────────

export interface SensitivityResult {
  field: "revenue" | "rent" | "investment" | "staff" | "supplies";
  label: string;
  roiDelta: number;
}

/** Identify which of the 5 Quick Start fields has the most positive impact on ROI
 *  when improved by 10%. Used for AC9 constructive guidance. */
export function findHighestImpactInput(
  financialInputs: PlanFinancialInputs,
  startupCosts: StartupCostLineItem[],
  currentStaffCount: number
): SensitivityResult {
  const now = new Date().toISOString();
  const baseOutput = computeQuickPreview(financialInputs, startupCosts);
  const baseROI = baseOutput.roiMetrics.fiveYearROIPct;

  const candidates: SensitivityResult[] = [];

  // 1. Revenue +10% (also recalculate labor pct to match UI behavior —
  //    staff count stays fixed so labor % decreases with higher revenue)
  const revenueInputs = structuredClone(financialInputs);
  const newRevenue = Math.round(revenueInputs.revenue.monthlyAuv.currentValue * 1.1);
  revenueInputs.revenue.monthlyAuv = updateFieldValue(
    revenueInputs.revenue.monthlyAuv,
    newRevenue,
    now
  );
  const revenueAdjustedLaborPct = staffCountToLaborPct(currentStaffCount, newRevenue);
  revenueInputs.operatingCosts.laborPct = updateFieldValue(
    revenueInputs.operatingCosts.laborPct,
    revenueAdjustedLaborPct,
    now
  );
  const revenueROI = computeQuickPreview(revenueInputs, startupCosts).roiMetrics.fiveYearROIPct;
  candidates.push({ field: "revenue", label: "monthly revenue", roiDelta: revenueROI - baseROI });

  // 2. Rent -10% (lower is better)
  const rentInputs = structuredClone(financialInputs);
  rentInputs.operatingCosts.rentMonthly = updateFieldValue(
    rentInputs.operatingCosts.rentMonthly,
    Math.round(rentInputs.operatingCosts.rentMonthly.currentValue * 0.9),
    now
  );
  const rentROI = computeQuickPreview(rentInputs, startupCosts).roiMetrics.fiveYearROIPct;
  candidates.push({ field: "rent", label: "monthly rent", roiDelta: rentROI - baseROI });

  // 3. Investment -10% (lower is better)
  const investmentCosts = scaleStartupCosts(startupCosts, Math.round(startupCostTotal(startupCosts) * 0.9));
  const investmentROI = computeQuickPreview(financialInputs, investmentCosts).roiMetrics.fiveYearROIPct;
  candidates.push({ field: "investment", label: "investment budget", roiDelta: investmentROI - baseROI });

  // 4. Staff -10% (fewer staff = lower labor cost)
  const staffInputs = structuredClone(financialInputs);
  const reducedStaff = Math.max(1, Math.round(currentStaffCount * 0.9));
  const newLaborPct = staffCountToLaborPct(reducedStaff, staffInputs.revenue.monthlyAuv.currentValue);
  staffInputs.operatingCosts.laborPct = updateFieldValue(
    staffInputs.operatingCosts.laborPct,
    newLaborPct,
    now
  );
  const staffROI = computeQuickPreview(staffInputs, startupCosts).roiMetrics.fiveYearROIPct;
  candidates.push({ field: "staff", label: "number of staff", roiDelta: staffROI - baseROI });

  // 5. Supplies -10% (lower COGS is better)
  const suppliesInputs = structuredClone(financialInputs);
  suppliesInputs.operatingCosts.cogsPct = updateFieldValue(
    suppliesInputs.operatingCosts.cogsPct,
    suppliesInputs.operatingCosts.cogsPct.currentValue * 0.9,
    now
  );
  const suppliesROI = computeQuickPreview(suppliesInputs, startupCosts).roiMetrics.fiveYearROIPct;
  candidates.push({ field: "supplies", label: "cost of supplies", roiDelta: suppliesROI - baseROI });

  // Return the field with the highest positive ROI delta
  candidates.sort((a, b) => b.roiDelta - a.roiDelta);
  return candidates[0];
}

// ─── Sentiment Frame ────────────────────────────────────────────────────

/** Generate a contextual sentiment message for the ROI result. */
export function generateSentimentFrame(
  roiPct: number,
  breakEvenMonth: number | null
): string {
  const roiDisplay = Math.round(roiPct * 100);
  const calendarDate = breakEvenToCalendarDate(breakEvenMonth);

  if (roiPct > 0 && breakEvenMonth !== null) {
    const yearOrdinal = Math.ceil(breakEvenMonth / 12);
    const yearLabel = yearOrdinal === 1 ? "first" : yearOrdinal === 2 ? "second" : yearOrdinal === 3 ? "third" : `${yearOrdinal}th`;
    return `Your estimated ROI of ${roiDisplay}% means you'd earn back your investment plus ${roiDisplay}% over 5 years. Break-even by ${calendarDate.split(" (")[0]} means you'd start seeing positive returns within your ${yearLabel} year.`;
  }

  return "At these numbers, the return timeline extends beyond the typical range.";
}

/** Generate guidance for negative/low ROI (AC9). */
export function generateLeverHint(highestImpact: SensitivityResult): string {
  return `Adjusting your ${highestImpact.label} has the biggest effect on your return timeline.`;
}
