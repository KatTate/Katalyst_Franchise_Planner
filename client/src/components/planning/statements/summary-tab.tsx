import { useCallback, useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatFinancialValue } from "@/components/shared/financial-value";
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

function dollarTickFormatter(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function dollarTooltipFormatter(value: unknown): string {
  const num = Number(value);
  return `$${num.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

const paybackChartConfig: ChartConfig = {
  cumulativeCashFlow: { label: "Cumulative Cash Position", color: "hsl(var(--chart-1))" },
};

const breakevenChartConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "hsl(142 71% 45%)" },
  expenses: { label: "Total Expenses", color: "hsl(0 72% 51%)" },
  operatingCashFlow: { label: "Operating Cash Flow", color: "hsl(217 91% 60%)" },
};

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
        <div className="space-y-6">
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
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Total Investment
                  </p>
                  <p className="text-lg font-semibold font-mono" data-testid="value-total-investment-summary">
                    {formatFinancialValue(roiMetrics.totalStartupInvestment, "currency")}
                  </p>
                </div>
              </div>
              {roiMetrics.breakEvenMonth !== null && (
                <p className="text-sm text-muted-foreground" data-testid="text-breakeven-interp">
                  You'd start making money by {breakEvenDate()}
                </p>
              )}
              <BreakevenRevenueExpenseChart monthlyProjections={monthlyProjections} />
            </>
          )}
        </div>
      </StatementSection>

      <StatementSection
        title="Payback Period"
        defaultExpanded={true}
        testId="section-payback-period"
      >
        <div className="space-y-4">
          {scenarioOutputs ? (
            <ScenarioKeyMetrics scenarioOutputs={scenarioOutputs} />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    5-Year Cumulative Cash Flow
                  </p>
                  <p className="text-lg font-semibold font-mono" data-testid="value-5yr-cum-cf">
                    {formatFinancialValue(roiMetrics.fiveYearCumulativeCashFlow, "currency")}
                  </p>
                </div>
              </div>
              <PaybackPeriodChart monthlyProjections={monthlyProjections} breakEvenMonth={roiMetrics.breakEvenMonth} />
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
              <p className="text-lg font-semibold font-mono" data-testid="value-total-investment-startup">
                {formatFinancialValue(roiMetrics.totalStartupInvestment, "currency")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                5-Year Cumulative Cash Flow
              </p>
              <p className="text-lg font-semibold font-mono" data-testid="value-5yr-cum-cf-startup">
                {formatFinancialValue(roiMetrics.fiveYearCumulativeCashFlow, "currency")}
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
                      ? formatFinancialValue(value, "pct")
                      : formatFinancialValue(value, "currency")}
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

function BreakevenRevenueExpenseChart({ monthlyProjections }: { monthlyProjections: EngineOutput["monthlyProjections"] }) {
  const data = useMemo(() => {
    if (monthlyProjections.length === 0) return [];
    return monthlyProjections.map((m) => {
      const totalExpenses = Math.abs(m.totalCogs + m.totalOpex + m.depreciation + m.interestExpense) / 100;
      return {
        label: `M${m.month}`,
        month: m.month,
        revenue: m.revenue / 100,
        expenses: totalExpenses,
        operatingCashFlow: m.operatingCashFlow / 100,
      };
    });
  }, [monthlyProjections]);

  if (data.length === 0) return null;

  const xTicks = [1, 12, 24, 36, 48, 60].filter((t) => t <= data.length);

  return (
    <div data-testid="chart-breakeven-revenue-expense" className="w-full">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
        Monthly Revenue vs. Expenses
      </p>
      <ChartContainer config={breakevenChartConfig} className="h-[280px] w-full">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 12 }}>
          <defs>
            <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(0 72% 51%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(0 72% 51%)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            ticks={xTicks}
            tickFormatter={(v) => {
              const yr = Math.ceil(v / 12);
              const mo = v % 12 || 12;
              return mo === 1 || v === 1 ? `Y${yr}` : `M${v}`;
            }}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={dollarTickFormatter}
            tick={{ fontSize: 11 }}
            width={60}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => {
                  const label = name === "revenue" ? "Revenue" : name === "expenses" ? "Total Expenses" : "Operating CF";
                  return [dollarTooltipFormatter(value), label];
                }}
                labelFormatter={(label, payload) => {
                  const month = payload?.[0]?.payload?.month;
                  if (!month) return label;
                  const yr = Math.ceil(month / 12);
                  const mo = ((month - 1) % 12) + 1;
                  return `Year ${yr}, Month ${mo}`;
                }}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="hsl(142 71% 45%)"
            strokeWidth={2}
            fill="url(#fillRevenue)"
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke="hsl(0 72% 51%)"
            strokeWidth={2}
            fill="url(#fillExpenses)"
          />
          <Line
            type="monotone"
            dataKey="operatingCashFlow"
            stroke="hsl(217 91% 60%)"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ChartContainer>
      <div className="flex items-center justify-center gap-6 mt-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "hsl(142 71% 45%)" }} />
          <span className="text-xs text-muted-foreground">Revenue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "hsl(0 72% 51%)" }} />
          <span className="text-xs text-muted-foreground">Total Expenses</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "hsl(217 91% 60%)" }} />
          <span className="text-xs text-muted-foreground">Operating Cash Flow</span>
        </div>
      </div>
    </div>
  );
}

function PaybackPeriodChart({ monthlyProjections, breakEvenMonth }: { monthlyProjections: EngineOutput["monthlyProjections"]; breakEvenMonth: number | null }) {
  const data = useMemo(() => {
    if (monthlyProjections.length === 0) return [];
    return monthlyProjections.map((m) => ({
      label: `M${m.month}`,
      month: m.month,
      cumulativeCashFlow: m.cumulativeNetCashFlow / 100,
    }));
  }, [monthlyProjections]);

  if (data.length === 0) return null;

  const xTicks = [1, 12, 24, 36, 48, 60].filter((t) => t <= data.length);

  return (
    <div data-testid="chart-payback-period" className="w-full">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
        Cumulative Cash Position
      </p>
      <ChartContainer config={paybackChartConfig} className="h-[280px] w-full">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 12 }}>
          <defs>
            <linearGradient id="fillCumCash" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            ticks={xTicks}
            tickFormatter={(v) => {
              const yr = Math.ceil(v / 12);
              return `Year ${yr}`;
            }}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={dollarTickFormatter}
            tick={{ fontSize: 11 }}
            width={60}
          />
          <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" strokeWidth={1} />
          {breakEvenMonth !== null && breakEvenMonth <= data.length && (
            <ReferenceLine
              x={breakEvenMonth}
              stroke="hsl(142 71% 45%)"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: `Break-even`, position: "top", fontSize: 11, fill: "hsl(142 71% 45%)" }}
            />
          )}
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => [dollarTooltipFormatter(value), "Cumulative Cash"]}
                labelFormatter={(label, payload) => {
                  const month = payload?.[0]?.payload?.month;
                  if (!month) return label;
                  const yr = Math.ceil(month / 12);
                  const mo = ((month - 1) % 12) + 1;
                  return `Year ${yr}, Month ${mo}`;
                }}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="cumulativeCashFlow"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2.5}
            fill="url(#fillCumCash)"
          />
        </AreaChart>
      </ChartContainer>
      <div className="flex items-center justify-center gap-6 mt-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "hsl(var(--chart-1))" }} />
          <span className="text-xs text-muted-foreground">Cumulative Cash Position</span>
        </div>
        {breakEvenMonth !== null && (
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4" style={{ background: "hsl(142 71% 45%)", borderTop: "1px dashed" }} />
            <span className="text-xs text-muted-foreground">Break-even (Month {breakEvenMonth})</span>
          </div>
        )}
      </div>
    </div>
  );
}
