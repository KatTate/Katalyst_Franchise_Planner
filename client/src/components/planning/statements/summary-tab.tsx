import { useCallback } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCents } from "@/lib/format-currency";
import { formatROI, formatBreakEven } from "@/components/shared/summary-metrics";
import { StatementSection } from "./statement-section";
import { StatementTable, type SectionDef } from "./statement-table";
import type { EngineOutput, AnnualSummary } from "@shared/financial-engine";

import { SCENARIO_COLORS, type ScenarioOutputs, type ScenarioId } from "@/lib/scenario-engine";

interface SummaryTabProps {
  output: EngineOutput;
  onNavigateToTab: (tab: string, scrollTo?: string) => void;
  scenarioOutputs?: ScenarioOutputs | null;
}

const plSummarySections: SectionDef[] = [
  {
    key: "revenue",
    title: "Revenue",
    rows: [
      { key: "revenue", label: "Revenue", field: "revenue", format: "currency" },
    ],
    defaultExpanded: true,
  },
  {
    key: "cost-of-sales",
    title: "Cost of Sales",
    rows: [
      { key: "total-cogs", label: "Cost of Sales", field: "totalCogs", format: "currency" },
      { key: "cogs-pct", label: "COGS %", field: "cogsPct", format: "pct" },
    ],
    defaultExpanded: true,
  },
  {
    key: "gross-profit",
    title: "Gross Profit",
    rows: [
      { key: "gross-profit", label: "Gross Profit", field: "grossProfit", format: "currency", isSubtotal: true },
      { key: "gp-pct", label: "GP %", field: "grossProfitPct", format: "pct" },
    ],
    defaultExpanded: true,
  },
  {
    key: "operating-expenses",
    title: "Operating Expenses",
    rows: [
      { key: "direct-labor", label: "Direct Labor", field: "directLabor", format: "currency", indent: 1 },
      { key: "dl-pct", label: "DL %", field: "directLaborPct", format: "pct", indent: 1 },
      { key: "contrib-margin-pct", label: "Contribution Margin %", field: "contributionMarginPct", format: "pct" },
      { key: "total-opex", label: "Total OpEx", field: "totalOpex", format: "currency", isSubtotal: true },
      { key: "opex-pct", label: "OpEx %", field: "opexPct", format: "pct" },
    ],
    defaultExpanded: true,
  },
  {
    key: "ebitda",
    title: "EBITDA",
    rows: [
      { key: "ebitda", label: "EBITDA", field: "ebitda", format: "currency", isSubtotal: true },
      { key: "ebitda-pct", label: "EBITDA %", field: "ebitdaPct", format: "pct" },
    ],
    defaultExpanded: true,
  },
  {
    key: "below-ebitda",
    title: "Below EBITDA",
    rows: [
      { key: "depreciation", label: "D&A", field: "depreciation", format: "currency", indent: 1 },
      { key: "interest", label: "Interest", field: "interestExpense", format: "currency", indent: 1 },
    ],
    defaultExpanded: true,
  },
  {
    key: "net-pbt",
    title: "Net PBT",
    rows: [
      { key: "pretax-income", label: "Net PBT", field: "preTaxIncome", format: "currency", isTotal: true },
      { key: "pretax-pct", label: "Net PBT %", field: "preTaxIncomePct", format: "pct" },
    ],
    defaultExpanded: true,
  },
];

const laborEfficiencyRows: SectionDef[] = [
  {
    key: "labor-efficiency",
    title: "Labor Efficiency",
    rows: [
      { key: "labor-efficiency-val", label: "Labor Efficiency Ratio", field: "laborEfficiency", format: "ratio" },
      { key: "adj-labor-efficiency", label: "Adj. Labor Efficiency", field: "adjustedLaborEfficiency", format: "ratio" },
      { key: "salary-cap", label: "Salary Cap at Target", field: "salaryCapAtTarget", format: "currency" },
      { key: "over-under-cap", label: "Over/Under Cap", field: "overUnderCap", format: "currency" },
    ],
    defaultExpanded: true,
  },
];

const bsSummarySections: SectionDef[] = [
  {
    key: "bs-summary",
    title: "Balance Sheet",
    rows: [
      { key: "total-assets", label: "Total Assets", field: "totalAssets", format: "currency" },
      { key: "ending-cash", label: "  of which Cash", field: "endingCash", format: "currency", indent: 1 },
      { key: "total-liabilities", label: "Total Liabilities", field: "totalLiabilities", format: "currency" },
      { key: "total-equity", label: "Total Net Assets", field: "totalEquity", format: "currency", isSubtotal: true },
    ],
    defaultExpanded: true,
  },
];

const cfSummarySections: SectionDef[] = [
  {
    key: "cf-summary",
    title: "Cash Flow",
    rows: [
      { key: "ending-cash-cf", label: "Closing Cash Balance", field: "endingCash", format: "currency" },
      { key: "operating-cf", label: "Operating Cash Flow", field: "operatingCashFlow", format: "currency" },
      { key: "net-cf", label: "Net Cash Flow", field: "netCashFlow", format: "currency" },
    ],
    defaultExpanded: true,
  },
];

type EnrichedAnnualSummary = AnnualSummary & {
  cogsPct: number;
  directLaborPct: number;
  opexPct: number;
};

function computeEnrichedSummaries(annualSummaries: EngineOutput["annualSummaries"]): EnrichedAnnualSummary[] {
  return annualSummaries.map((s) => ({
    ...s,
    cogsPct: s.revenue !== 0 ? s.totalCogs / s.revenue : 0,
    directLaborPct: s.revenue !== 0 ? s.directLabor / s.revenue : 0,
    opexPct: s.revenue !== 0 ? s.totalOpex / s.revenue : 0,
  }));
}

export function SummaryTab({ output, onNavigateToTab, scenarioOutputs }: SummaryTabProps) {
  const { annualSummaries, monthlyProjections, roiMetrics, plAnalysis, identityChecks } = output;
  const enrichedSummaries = computeEnrichedSummaries(annualSummaries);
  const total5yrPreTax = annualSummaries.reduce((sum, s) => sum + s.preTaxIncome, 0);
  const y1Margin = annualSummaries[0]?.revenue
    ? (annualSummaries[0].preTaxIncome / annualSummaries[0].revenue)
    : 0;

  const breakEvenDate = useCallback(() => {
    if (roiMetrics.breakEvenMonth === null) return "N/A";
    const start = new Date();
    start.setMonth(start.getMonth() + roiMetrics.breakEvenMonth);
    return start.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [roiMetrics.breakEvenMonth]);

  const capexTotal = roiMetrics.totalStartupInvestment;

  return (
    <div className="space-y-4 pb-8" data-testid="summary-tab">
      <StatementSection
        title="Annual P&L Summary"
        defaultExpanded={true}
        linkLabel="View Full P&L"
        onLinkClick={() => onNavigateToTab("pnl")}
        testId="section-pl-summary"
      >
        <StatementTable
          sections={plSummarySections}
          annualSummaries={enrichedSummaries}
          monthlyProjections={monthlyProjections}
          testIdPrefix="pl-summary"
        />
        {y1Margin !== 0 && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground px-3" data-testid="interp-y1-margin">
            {y1Margin > 0 ? (
              <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            )}
            <span>
              Year 1 pre-tax margin: {(y1Margin * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </StatementSection>

      <StatementSection
        title="Labor Efficiency"
        defaultExpanded={false}
        testId="section-labor-efficiency"
      >
        <StatementTable
          sections={laborEfficiencyRows}
          annualSummaries={enrichedSummaries}
          monthlyProjections={monthlyProjections}
          plAnalysis={plAnalysis}
          testIdPrefix="labor-eff"
        />
      </StatementSection>

      <StatementSection
        title="Balance Sheet Summary"
        defaultExpanded={false}
        linkLabel="View Full Balance Sheet"
        onLinkClick={() => onNavigateToTab("balance-sheet")}
        testId="section-bs-summary"
      >
        <StatementTable
          sections={bsSummarySections}
          annualSummaries={enrichedSummaries}
          monthlyProjections={monthlyProjections}
          testIdPrefix="bs-summary"
        />
      </StatementSection>

      <StatementSection
        title="Cash Flow Summary"
        defaultExpanded={false}
        linkLabel="View Full Cash Flow"
        onLinkClick={() => onNavigateToTab("cash-flow")}
        testId="section-cf-summary"
      >
        <StatementTable
          sections={cfSummarySections}
          annualSummaries={enrichedSummaries}
          monthlyProjections={monthlyProjections}
          testIdPrefix="cf-summary"
        />
      </StatementSection>

      <StatementSection
        title="Break-Even Analysis"
        defaultExpanded={true}
        testId="section-break-even"
      >
        <div className="space-y-3">
          {scenarioOutputs ? (
            <ScenarioBreakEvenComparison scenarioOutputs={scenarioOutputs} />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Break-even Month
                  </p>
                  <p className="text-lg font-semibold font-mono" data-testid="value-breakeven-month">
                    {formatBreakEven(roiMetrics.breakEvenMonth)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Estimated Date
                  </p>
                  <p className="text-lg font-semibold" data-testid="value-breakeven-date">
                    {breakEvenDate()}
                  </p>
                </div>
              </div>
              {roiMetrics.breakEvenMonth !== null && (
                <p className="text-sm text-muted-foreground" data-testid="text-breakeven-interp">
                  You'd start making money by {breakEvenDate()}
                </p>
              )}
              <BreakEvenSparkline monthlyProjections={monthlyProjections} />
            </>
          )}
        </div>
      </StatementSection>

      <StatementSection
        title={scenarioOutputs ? "Year 1 Key Metrics — Scenario Comparison" : "Startup Capital Summary"}
        defaultExpanded={!!scenarioOutputs || false}
        testId="section-startup-capital"
      >
        {scenarioOutputs ? (
          <ScenarioKeyMetrics scenarioOutputs={scenarioOutputs} />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Total Investment
              </p>
              <p className="text-lg font-semibold font-mono" data-testid="value-total-investment-summary">
                {formatCents(roiMetrics.totalStartupInvestment)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                5-Year Cumulative Cash Flow
              </p>
              <p className="text-lg font-semibold font-mono" data-testid="value-5yr-cum-cf">
                {formatCents(roiMetrics.fiveYearCumulativeCashFlow)}
              </p>
            </div>
          </div>
        )}
      </StatementSection>
    </div>
  );
}

function ScenarioBreakEvenComparison({ scenarioOutputs }: { scenarioOutputs: ScenarioOutputs }) {
  const SCENARIOS: { id: ScenarioId; label: string }[] = [
    { id: "base", label: "Base Case" },
    { id: "conservative", label: "Conservative" },
    { id: "optimistic", label: "Optimistic" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4" data-testid="scenario-breakeven-comparison">
      {SCENARIOS.map((s) => {
        const output = scenarioOutputs[s.id];
        const breakEvenMonth = output.roiMetrics.breakEvenMonth;

        return (
          <div key={s.id} className={`rounded-md p-3 ${SCENARIO_COLORS[s.id].bg}`}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className={`inline-block h-2 w-2 rounded-full ${SCENARIO_COLORS[s.id].dot}`} />
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{s.label}</p>
            </div>
            <p className="text-lg font-semibold font-mono" data-testid={`value-breakeven-${s.id}`}>
              {formatBreakEven(breakEvenMonth)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {breakEvenMonth === null
                ? "Does not break even within 5 years"
                : `Month ${breakEvenMonth}`}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function ScenarioKeyMetrics({ scenarioOutputs }: { scenarioOutputs: ScenarioOutputs }) {
  const SCENARIOS: { id: ScenarioId; label: string }[] = [
    { id: "base", label: "Base Case" },
    { id: "conservative", label: "Conservative" },
    { id: "optimistic", label: "Optimistic" },
  ];

  const metrics: { label: string; getValue: (o: EngineOutput) => number; format: "currency" | "pct" }[] = [
    { label: "Year 1 Revenue", getValue: (o) => o.annualSummaries[0]?.revenue ?? 0, format: "currency" },
    { label: "Year 1 Pre-Tax Income", getValue: (o) => o.annualSummaries[0]?.preTaxIncome ?? 0, format: "currency" },
    { label: "Year 1 Net Margin", getValue: (o) => {
      const rev = o.annualSummaries[0]?.revenue ?? 0;
      const pti = o.annualSummaries[0]?.preTaxIncome ?? 0;
      return rev !== 0 ? pti / rev : 0;
    }, format: "pct" },
    { label: "5-Year Cum. Cash Flow", getValue: (o) => o.roiMetrics.fiveYearCumulativeCashFlow, format: "currency" },
  ];

  return (
    <div className="overflow-x-auto" data-testid="scenario-key-metrics">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 px-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground min-w-[160px]">
              Metric
            </th>
            {SCENARIOS.map((s) => (
              <th
                key={s.id}
                className={`py-2 px-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap ${SCENARIO_COLORS[s.id].bg}`}
              >
                <span className="flex items-center justify-end gap-1">
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${SCENARIO_COLORS[s.id].dot}`} />
                  {s.label}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => (
            <tr key={m.label} className="border-b last:border-b-0">
              <td className="py-2 px-3 text-sm font-medium">{m.label}</td>
              {SCENARIOS.map((s) => {
                const value = m.getValue(scenarioOutputs[s.id]);
                const isNeg = value < 0;
                return (
                  <td
                    key={s.id}
                    className={`py-2 px-3 text-right font-mono tabular-nums text-sm whitespace-nowrap ${SCENARIO_COLORS[s.id].bg}${isNeg ? " text-amber-700 dark:text-amber-400" : ""}`}
                    data-testid={`metric-${m.label.replace(/\s+/g, "-").toLowerCase()}-${s.id}`}
                  >
                    {m.format === "pct"
                      ? (isNeg ? `(${(Math.abs(value) * 100).toFixed(1)}%)` : `${(value * 100).toFixed(1)}%`)
                      : (isNeg ? `(${formatCents(Math.abs(value))})` : formatCents(value))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BreakEvenSparkline({ monthlyProjections }: { monthlyProjections: EngineOutput["monthlyProjections"] }) {
  if (monthlyProjections.length === 0) return null;

  const values = monthlyProjections.map((m) => m.cumulativeNetCashFlow);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;
  const width = 400;
  const height = 60;
  const padding = 4;

  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * (width - padding * 2);
    const y = height - padding - ((v - minVal) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(" ");

  const zeroY = height - padding - ((0 - minVal) / range) * (height - padding * 2);

  return (
    <div data-testid="chart-breakeven-sparkline" className="mt-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[400px] h-[60px]">
        <line
          x1={padding}
          y1={zeroY}
          x2={width - padding}
          y2={zeroY}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="0.5"
          strokeDasharray="4,4"
        />
        <polyline
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          points={points}
        />
      </svg>
    </div>
  );
}
