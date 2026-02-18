import { formatCents } from "@/lib/format-currency";
import { formatROI, formatBreakEven } from "@/components/shared/summary-metrics";
import type { AnnualSummary, ROIMetrics } from "@shared/financial-engine";

interface CalloutBarProps {
  annualSummaries: AnnualSummary[];
  roiMetrics: ROIMetrics;
  planStartDate?: string;
}

function breakEvenCalendarDate(breakEvenMonth: number | null, planStartDate?: string): string {
  if (breakEvenMonth === null) return "N/A";
  const start = planStartDate ? new Date(planStartDate) : new Date();
  start.setMonth(start.getMonth() + breakEvenMonth);
  return start.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function CalloutBar({ annualSummaries, roiMetrics, planStartDate }: CalloutBarProps) {
  const total5yrPreTax = annualSummaries.reduce((sum, s) => sum + s.preTaxIncome, 0);
  const calendarDate = breakEvenCalendarDate(roiMetrics.breakEvenMonth, planStartDate);
  const breakEvenText = roiMetrics.breakEvenMonth !== null
    ? `Break-even: Month ${roiMetrics.breakEvenMonth} (${calendarDate}).`
    : "Break-even has not been reached within the 5-year projection period.";

  return (
    <div
      data-testid="callout-bar"
      className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b"
    >
      <div className="flex flex-wrap items-center gap-4 px-4 py-3">
        <CalloutMetric
          label="Total 5yr Pre-Tax Income"
          value={formatCents(total5yrPreTax)}
          testId="value-5yr-pretax"
        />
        <div className="w-px h-8 bg-border" />
        <CalloutMetric
          label="Break-even"
          value={formatBreakEven(roiMetrics.breakEvenMonth)}
          subtitle={roiMetrics.breakEvenMonth !== null ? calendarDate : undefined}
          testId="value-breakeven-callout"
        />
        <div className="w-px h-8 bg-border" />
        <CalloutMetric
          label="5yr ROI"
          value={formatROI(roiMetrics.fiveYearROIPct)}
          testId="value-5yr-roi"
        />
      </div>
      <p
        className="text-xs text-muted-foreground px-4 pb-2"
        data-testid="callout-interpretation"
      >
        Your 5-year total pre-tax income: {formatCents(total5yrPreTax)}. {breakEvenText}
      </p>
    </div>
  );
}

function CalloutMetric({
  label,
  value,
  subtitle,
  testId,
}: {
  label: string;
  value: string;
  subtitle?: string;
  testId: string;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
        {label}
      </span>
      <span
        className="text-lg font-semibold font-mono tabular-nums"
        data-testid={testId}
      >
        {value}
      </span>
      {subtitle && (
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      )}
    </div>
  );
}
