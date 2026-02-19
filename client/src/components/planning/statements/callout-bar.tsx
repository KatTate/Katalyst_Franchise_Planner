import { formatCents } from "@/lib/format-currency";
import { formatROI, formatBreakEven } from "@/components/shared/summary-metrics";
import type { AnnualSummary, ROIMetrics, EngineOutput, PlanFinancialInputs } from "@shared/financial-engine";
import type { StatementTabId } from "../financial-statements";

interface CalloutBarProps {
  annualSummaries: AnnualSummary[];
  roiMetrics: ROIMetrics;
  planStartDate?: string;
  activeTab?: StatementTabId;
  output?: EngineOutput;
  financialInputs?: PlanFinancialInputs | null;
  brandName?: string;
}

function breakEvenCalendarDate(breakEvenMonth: number | null, planStartDate?: string): string {
  if (breakEvenMonth === null) return "N/A";
  const start = planStartDate ? new Date(planStartDate) : new Date();
  start.setMonth(start.getMonth() + breakEvenMonth);
  return start.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function getTabContent(
  tab: StatementTabId,
  annuals: AnnualSummary[],
  roiMetrics: ROIMetrics,
  output: EngineOutput | undefined,
  financialInputs: PlanFinancialInputs | null | undefined,
  brandName: string,
  planStartDate?: string,
): { metrics: MetricDef[]; interpretation: string } {
  const calendarDate = breakEvenCalendarDate(roiMetrics.breakEvenMonth, planStartDate);

  switch (tab) {
    case "pnl": {
      const y1 = annuals[0];
      const marginPct = y1 ? (y1.preTaxIncomePct * 100).toFixed(1) : "0.0";
      let brandNote = "";
      if (financialInputs?.operatingCosts?.cogsPct?.item7Range && y1) {
        const range = financialInputs.operatingCosts.cogsPct.item7Range;
        const cogsPct = y1.totalCogs !== 0 && y1.revenue !== 0 ? Math.abs(y1.totalCogs / y1.revenue) : 0;
        const minPct = range.min;
        const maxPct = range.max;
        if (cogsPct > maxPct) brandNote = ` COGS at ${(cogsPct * 100).toFixed(0)}% — above typical ${(minPct * 100).toFixed(0)}-${(maxPct * 100).toFixed(0)}% range for ${brandName}.`;
        else if (cogsPct < minPct) brandNote = ` COGS at ${(cogsPct * 100).toFixed(0)}% — below typical ${(minPct * 100).toFixed(0)}-${(maxPct * 100).toFixed(0)}% range for ${brandName}.`;
        else brandNote = ` COGS at ${(cogsPct * 100).toFixed(0)}% — within typical range for ${brandName}.`;
      }
      return {
        metrics: [
          { label: "Annual Revenue (Y1)", value: y1 ? formatCents(y1.revenue) : "$0", testId: "callout-pnl-revenue" },
          { label: "Pre-Tax Margin (Y1)", value: `${marginPct}%`, testId: "callout-pnl-margin" },
        ],
        interpretation: `Year 1 pre-tax margin: ${marginPct}%.${brandNote}`,
      };
    }
    case "balance-sheet": {
      const y3 = annuals[2];
      let deRatio = "N/A";
      let deNote = "";
      if (y3) {
        const equity = y3.totalEquity;
        if (equity > 0) {
          const ratio = (y3.totalLiabilities / equity).toFixed(1);
          deRatio = `${ratio}:1`;
          deNote = Number(ratio) <= 3
            ? " Lenders typically look for below 3:1."
            : " Above 3:1 — lenders may view this as highly leveraged.";
        } else {
          deRatio = "N/A (negative equity)";
          deNote = " Equity is negative — accumulated losses exceed invested capital.";
        }
      }
      return {
        metrics: [
          { label: "Total Assets (Y1)", value: annuals[0] ? formatCents(annuals[0].totalAssets) : "$0", testId: "callout-bs-assets" },
          { label: "Debt-to-Equity (Y3)", value: deRatio, testId: "callout-bs-de-ratio" },
        ],
        interpretation: `Debt-to-equity ratio: ${deRatio} by Year 3.${deNote}`,
      };
    }
    case "cash-flow": {
      const monthly = output?.monthlyProjections ?? [];
      let lowestVal = Infinity;
      let lowestMonth = 1;
      monthly.forEach((mp, idx) => {
        if (mp.endingCash < lowestVal) {
          lowestVal = mp.endingCash;
          lowestMonth = idx + 1;
        }
      });
      const lowestCash = lowestVal === Infinity ? 0 : lowestVal;
      const reserveNote = lowestCash < 0
        ? ` You'll need at least ${formatCents(Math.abs(lowestCash))} in reserves to cover this shortfall.`
        : " Cash remains positive throughout the projection.";
      return {
        metrics: [
          { label: "Net Cash Flow (Y1)", value: annuals[0] ? formatCents(annuals[0].netCashFlow) : "$0", testId: "callout-cf-net" },
          { label: "Lowest Cash Point", value: `${formatCents(lowestCash)} (Mo ${lowestMonth})`, testId: "callout-cf-lowest" },
        ],
        interpretation: `Lowest cash point: ${formatCents(lowestCash)} in Month ${lowestMonth}.${reserveNote}`,
      };
    }
    case "roic": {
      const roic5yr = output?.roicExtended?.[4];
      const roicPct = roic5yr ? (roic5yr.roicPct * 100).toFixed(1) : "0.0";
      const beText = roiMetrics.breakEvenMonth !== null
        ? `Break-even on investment: Month ${roiMetrics.breakEvenMonth}.`
        : "Break-even has not been reached within 5 years.";
      return {
        metrics: [
          { label: "5yr ROIC", value: `${roicPct}%`, testId: "callout-roic-pct" },
          { label: "Break-even", value: formatBreakEven(roiMetrics.breakEvenMonth), testId: "callout-roic-be" },
        ],
        interpretation: `5-year return on invested capital: ${roicPct}%. ${beText}`,
      };
    }
    case "valuation": {
      const val5 = output?.valuation?.[4];
      const estValue = val5 ? formatCents(val5.estimatedValue) : "$0";
      const multiple = val5 ? `${val5.ebitdaMultiple.toFixed(1)}x` : "N/A";
      return {
        metrics: [
          { label: "Estimated Value (Y5)", value: estValue, testId: "callout-val-value" },
          { label: "EBITDA Multiple", value: multiple, testId: "callout-val-multiple" },
        ],
        interpretation: `Estimated business value at Year 5: ${estValue} based on ${multiple} EBITDA multiple.`,
      };
    }
    case "audit": {
      const checks = output?.identityChecks ?? [];
      const total = checks.length;
      const passed = checks.filter((c) => c.passed).length;
      const failures = checks.filter((c) => !c.passed);
      const failText = failures.length > 0
        ? ` Failures: ${failures.slice(0, 3).map((f) => f.name).join(", ")}${failures.length > 3 ? ` (+${failures.length - 3} more)` : ""}.`
        : " All checks passing.";
      return {
        metrics: [
          { label: "Checks Passing", value: `${passed} / ${total}`, testId: "callout-audit-pass" },
        ],
        interpretation: `${passed} of ${total} checks passing.${failText}`,
      };
    }
    case "summary":
    default: {
      const total5yr = annuals.reduce((sum, s) => sum + s.preTaxIncome, 0);
      const beText = roiMetrics.breakEvenMonth !== null
        ? `Break-even: Month ${roiMetrics.breakEvenMonth} (${calendarDate}).`
        : "Break-even has not been reached within the 5-year projection period.";
      return {
        metrics: [
          { label: "Total 5yr Pre-Tax Income", value: formatCents(total5yr), testId: "value-5yr-pretax" },
          { label: "Break-even", value: formatBreakEven(roiMetrics.breakEvenMonth), subtitle: roiMetrics.breakEvenMonth !== null ? calendarDate : undefined, testId: "value-breakeven-callout" },
          { label: "5yr ROI", value: formatROI(roiMetrics.fiveYearROIPct), testId: "value-5yr-roi" },
        ],
        interpretation: `Your 5-year total pre-tax income: ${formatCents(total5yr)}. ${beText}`,
      };
    }
  }
}

interface MetricDef {
  label: string;
  value: string;
  subtitle?: string;
  testId: string;
}

export function CalloutBar({ annualSummaries, roiMetrics, planStartDate, activeTab = "summary", output, financialInputs, brandName }: CalloutBarProps) {
  const brand = brandName || "brand";
  const { metrics, interpretation } = getTabContent(activeTab, annualSummaries, roiMetrics, output, financialInputs, brand, planStartDate);

  return (
    <div
      data-testid="callout-bar"
      className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b"
    >
      <div className="flex flex-wrap items-center gap-4 px-4 py-3">
        {metrics.map((m, idx) => (
          <span key={m.testId} className="contents">
            {idx > 0 && <div className="w-px h-8 bg-border" />}
            <CalloutMetric
              label={m.label}
              value={m.value}
              subtitle={m.subtitle}
              testId={m.testId}
            />
          </span>
        ))}
      </div>
      <p
        className="text-xs text-muted-foreground px-4 pb-2"
        data-testid="callout-interpretation"
      >
        {interpretation}
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
