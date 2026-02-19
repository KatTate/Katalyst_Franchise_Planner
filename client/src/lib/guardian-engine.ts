import type { EngineOutput, MonthlyProjection, PlanFinancialInputs, FinancialFieldValue } from "@shared/financial-engine";
import type { StartupCostLineItem } from "@shared/schema";

export type GuardianLevel = "healthy" | "attention" | "concerning";

export interface GuardianIndicator {
  id: "break-even" | "roi" | "cash";
  label: string;
  value: string;
  subtitle?: string;
  level: GuardianLevel;
  navigateTo: { tab: string; scrollTo?: string };
}

export interface GuardianState {
  indicators: GuardianIndicator[];
  allDefaults: boolean;
}

const BREAKEVEN_THRESHOLDS = { green: 18, amber: 30 };
const ROI_THRESHOLDS = { green: 1.0, amber: 0.5 };
const CASH_NEGATIVE_THRESHOLDS = { green: 0, amber: 3 };

function getBreakEvenLevel(month: number | null): GuardianLevel {
  if (month === null) return "concerning";
  if (month <= BREAKEVEN_THRESHOLDS.green) return "healthy";
  if (month <= BREAKEVEN_THRESHOLDS.amber) return "attention";
  return "concerning";
}

function getRoiLevel(fiveYearROIPct: number): GuardianLevel {
  if (fiveYearROIPct >= ROI_THRESHOLDS.green) return "healthy";
  if (fiveYearROIPct >= ROI_THRESHOLDS.amber) return "attention";
  return "concerning";
}

function countNegativeCashMonths(monthly: MonthlyProjection[]): number {
  return monthly.filter((m) => m.endingCash < 0).length;
}

function getCashLevel(negativeMonths: number): GuardianLevel {
  if (negativeMonths <= CASH_NEGATIVE_THRESHOLDS.green) return "healthy";
  if (negativeMonths <= CASH_NEGATIVE_THRESHOLDS.amber) return "attention";
  return "concerning";
}

function formatBreakEvenValue(month: number | null): string {
  if (month === null) return "Not reached";
  return `Month ${month}`;
}

function breakEvenCalendarDate(month: number | null, planStartDate?: string): string | undefined {
  if (month === null) return undefined;
  const start = planStartDate ? new Date(planStartDate) : new Date();
  start.setMonth(start.getMonth() + month);
  return start.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatRoiValue(pct: number): string {
  const display = pct * 100;
  if (Number.isInteger(display)) return `${display}%`;
  return `${display.toFixed(1)}%`;
}

function formatCashStatus(negativeMonths: number): string {
  if (negativeMonths === 0) return "OK";
  return `${negativeMonths} month${negativeMonths !== 1 ? "s" : ""} negative`;
}

export function isAllDefaults(
  financialInputs: PlanFinancialInputs | null,
  startupCosts: StartupCostLineItem[] | null
): boolean {
  if (!financialInputs) return true;

  const categories = Object.values(financialInputs);
  for (const category of categories) {
    if (!category || typeof category !== "object") continue;
    const fields = Object.values(category);
    for (const field of fields) {
      if (field && typeof field === "object" && "isCustom" in field) {
        if ((field as FinancialFieldValue).isCustom) return false;
      }
    }
  }

  if (startupCosts) {
    for (const cost of startupCosts) {
      if (cost.isCustom) return false;
    }
  }

  return true;
}

export function computeGuardianState(
  output: EngineOutput,
  planStartDate?: string,
  financialInputs?: PlanFinancialInputs | null,
  startupCosts?: StartupCostLineItem[] | null
): GuardianState {
  const { roiMetrics, monthlyProjections } = output;
  const negCashMonths = countNegativeCashMonths(monthlyProjections);

  const indicators: GuardianIndicator[] = [
    {
      id: "break-even",
      label: "Break-even",
      value: formatBreakEvenValue(roiMetrics.breakEvenMonth),
      subtitle: breakEvenCalendarDate(roiMetrics.breakEvenMonth, planStartDate),
      level: getBreakEvenLevel(roiMetrics.breakEvenMonth),
      navigateTo: { tab: "summary", scrollTo: "section-break-even-analysis" },
    },
    {
      id: "roi",
      label: "5yr ROI",
      value: formatRoiValue(roiMetrics.fiveYearROIPct),
      level: getRoiLevel(roiMetrics.fiveYearROIPct),
      navigateTo: { tab: "roic" },
    },
    {
      id: "cash",
      label: "Cash Position",
      value: formatCashStatus(negCashMonths),
      level: getCashLevel(negCashMonths),
      navigateTo: { tab: "cash-flow" },
    },
  ];

  return {
    indicators,
    allDefaults: isAllDefaults(financialInputs ?? null, startupCosts ?? null),
  };
}
