import { useMemo, memo, Component, type ReactNode } from "react";
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
  ReferenceArea,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SensitivityOutputs } from "@/lib/sensitivity-engine";
import type { EngineOutput } from "@shared/financial-engine";

interface SensitivityChartsProps {
  scenarioOutputs: SensitivityOutputs | null;
}

const YEAR_INDICES = [0, 1, 2, 3, 4] as const;
const YEAR_END_MONTH_INDICES = [11, 23, 35, 47, 59] as const;
const CASH_FLOW_TICK_MONTHS = [1, 12, 24, 36, 48, 60];

function dollarTickFormatter(v: number): string {
  if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function dollarTooltipFormatter(value: unknown): string {
  const num = Number(value);
  return `$${num.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function pctTooltipFormatter(value: unknown): string {
  const num = Number(value);
  return `${num.toFixed(1)}%`;
}

// ─── Chart 1: Profitability ──────────────────────────────────────────────

const profitabilityConfig: ChartConfig = {
  baseRevenue: { label: "Revenue (Base)", color: "hsl(var(--chart-1))" },
  baseCogs: { label: "COGS (Base)", color: "hsl(var(--chart-2))" },
  baseGrossProfit: { label: "Gross Profit (Base)", color: "hsl(var(--chart-3))" },
  baseEbitda: { label: "EBITDA (Base)", color: "hsl(var(--chart-4))" },
  basePreTaxIncome: { label: "Pre-Tax Income (Base)", color: "hsl(var(--chart-5))" },
  currentRevenue: { label: "Revenue (Your Scenario)", color: "hsl(var(--chart-1))" },
  currentCogs: { label: "COGS (Your Scenario)", color: "hsl(var(--chart-2))" },
  currentGrossProfit: { label: "Gross Profit (Your Scenario)", color: "hsl(var(--chart-3))" },
  currentEbitda: { label: "EBITDA (Your Scenario)", color: "hsl(var(--chart-4))" },
  currentPreTaxIncome: { label: "Pre-Tax Income (Your Scenario)", color: "hsl(var(--chart-5))" },
};

function ProfitabilityChart({ base, current }: { base: EngineOutput; current: EngineOutput }) {
  const data = useMemo(() => {
    return YEAR_INDICES.map((i) => ({
      year: `Year ${i + 1}`,
      baseRevenue: base.annualSummaries[i].revenue / 100,
      baseCogs: base.annualSummaries[i].totalCogs / 100,
      baseGrossProfit: base.annualSummaries[i].grossProfit / 100,
      baseEbitda: base.annualSummaries[i].ebitda / 100,
      basePreTaxIncome: base.annualSummaries[i].preTaxIncome / 100,
      currentRevenue: current.annualSummaries[i].revenue / 100,
      currentCogs: current.annualSummaries[i].totalCogs / 100,
      currentGrossProfit: current.annualSummaries[i].grossProfit / 100,
      currentEbitda: current.annualSummaries[i].ebitda / 100,
      currentPreTaxIncome: current.annualSummaries[i].preTaxIncome / 100,
    }));
  }, [base, current]);

  return (
    <Card data-testid="sensitivity-chart-profitability">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-medium">Am I Making Money?</CardTitle>
        <p className="text-xs text-muted-foreground">Profitability</p>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <ChartContainer config={profitabilityConfig} className="h-[220px] w-full">
          <AreaChart data={data} margin={{ top: 5, right: 12, left: 12, bottom: 0 }}>
            <defs>
              <linearGradient id="fillBaseRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.15} />
                <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fillCurrentRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.08} />
                <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#D0D1DB4D" />
            <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={dollarTickFormatter} width={60} />
            <ChartTooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0]?.payload;
                if (!row) return null;
                return (
                  <div data-testid="chart-profitability-tooltip" className="bg-background border rounded-lg shadow-lg p-3 text-xs space-y-2">
                    <p className="font-semibold">{label}</p>
                    {[
                      { key: "Revenue", base: row.baseRevenue, current: row.currentRevenue, color: "hsl(var(--chart-1))" },
                      { key: "COGS", base: row.baseCogs, current: row.currentCogs, color: "hsl(var(--chart-2))" },
                      { key: "Gross Profit", base: row.baseGrossProfit, current: row.currentGrossProfit, color: "hsl(var(--chart-3))" },
                      { key: "EBITDA", base: row.baseEbitda, current: row.currentEbitda, color: "hsl(var(--chart-4))" },
                      { key: "Pre-Tax Income", base: row.basePreTaxIncome, current: row.currentPreTaxIncome, color: "hsl(var(--chart-5))" },
                    ].map((s) => (
                      <div key={s.key} className="grid grid-cols-[8px_1fr_auto_auto] gap-x-2 items-center">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-muted-foreground">{s.key}</span>
                        <span className="font-mono tabular-nums">{dollarTooltipFormatter(s.base)}</span>
                        <span className="font-mono tabular-nums text-muted-foreground">{dollarTooltipFormatter(s.current)}</span>
                      </div>
                    ))}
                    <div className="flex gap-3 pt-1 border-t text-[10px] text-muted-foreground">
                      <span>Base Case (solid)</span>
                      <span>Your Scenario (dashed)</span>
                    </div>
                  </div>
                );
              }}
            />
            <Area type="monotone" dataKey="baseRevenue" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#fillBaseRevenue)" dot={false} name="Revenue (Base)" />
            <Area type="monotone" dataKey="currentRevenue" stroke="hsl(var(--chart-1))" strokeWidth={2} strokeDasharray="5 5" fill="url(#fillCurrentRevenue)" dot={false} name="Revenue (Yours)" />
            <Line type="monotone" dataKey="baseCogs" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} name="COGS (Base)" />
            <Line type="monotone" dataKey="currentCogs" stroke="hsl(var(--chart-2))" strokeWidth={2} strokeDasharray="5 5" dot={false} name="COGS (Yours)" />
            <Line type="monotone" dataKey="baseGrossProfit" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} name="Gross Profit (Base)" />
            <Line type="monotone" dataKey="currentGrossProfit" stroke="hsl(var(--chart-3))" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Gross Profit (Yours)" />
            <Line type="monotone" dataKey="baseEbitda" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} name="EBITDA (Base)" />
            <Line type="monotone" dataKey="currentEbitda" stroke="hsl(var(--chart-4))" strokeWidth={2} strokeDasharray="5 5" dot={false} name="EBITDA (Yours)" />
            <Line type="monotone" dataKey="basePreTaxIncome" stroke="hsl(var(--chart-5))" strokeWidth={2} dot={false} name="Pre-Tax (Base)" />
            <Line type="monotone" dataKey="currentPreTaxIncome" stroke="hsl(var(--chart-5))" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Pre-Tax (Yours)" />
          </AreaChart>
        </ChartContainer>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block" style={{ backgroundColor: "hsl(var(--chart-1))" }} />Revenue</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block" style={{ backgroundColor: "hsl(var(--chart-2))" }} />COGS</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block" style={{ backgroundColor: "hsl(var(--chart-3))" }} />Gross Profit</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block" style={{ backgroundColor: "hsl(var(--chart-4))" }} />EBITDA</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block" style={{ backgroundColor: "hsl(var(--chart-5))" }} />Pre-Tax Income</span>
          <span className="ml-2 flex items-center gap-1"><span className="w-3 h-0 border-t-2 border-solid inline-block border-foreground/40" />Base</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0 border-t-2 border-dashed inline-block border-foreground/40" />Yours</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Chart 2: Cash Flow ──────────────────────────────────────────────────

const cashFlowConfig: ChartConfig = {
  baseCash: { label: "Base Case", color: "hsl(var(--primary))" },
  currentCash: { label: "Your Scenario", color: "hsl(var(--chart-4))" },
};

function CashFlowChart({ base, current }: { base: EngineOutput; current: EngineOutput }) {
  const { data, hasNegativeCash, negativeRanges } = useMemo(() => {
    if (base.monthlyProjections.length !== 60) {
      return { data: [], hasNegativeCash: false, negativeRanges: [] as { start: number; end: number }[] };
    }

    const chartData = base.monthlyProjections.map((mp, i) => ({
      month: i + 1,
      label: `M${i + 1}`,
      baseCash: mp.endingCash / 100,
      currentCash: current.monthlyProjections[i].endingCash / 100,
    }));

    let anyNegative = false;
    const ranges: { start: number; end: number }[] = [];
    let rangeStart: number | null = null;

    for (let m = 0; m < 60; m++) {
      const baseNeg = base.monthlyProjections[m].endingCash < 0;
      const currentNeg = current.monthlyProjections[m].endingCash < 0;
      if (baseNeg || currentNeg) {
        anyNegative = true;
        if (rangeStart === null) rangeStart = m + 1;
      } else {
        if (rangeStart !== null) {
          ranges.push({ start: rangeStart, end: m });
          rangeStart = null;
        }
      }
    }
    if (rangeStart !== null) ranges.push({ start: rangeStart, end: 60 });

    return { data: chartData, hasNegativeCash: anyNegative, negativeRanges: ranges };
  }, [base, current]);

  return (
    <Card data-testid="sensitivity-chart-cash-flow">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-medium">Can I Pay My Bills?</CardTitle>
        <p className="text-xs text-muted-foreground">Cash Flow</p>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <ChartContainer config={cashFlowConfig} className="h-[220px] w-full">
          <LineChart data={data} margin={{ top: 5, right: 12, left: 12, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#D0D1DB4D" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10 }}
              ticks={CASH_FLOW_TICK_MONTHS}
              tickFormatter={(m: number) => {
                if (m % 12 === 0) return `Y${m / 12}`;
                return `M${m}`;
              }}
            />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={dollarTickFormatter} width={60} />
            <ReferenceLine y={0} stroke="#D0D1DB" strokeWidth={1} />
            {negativeRanges.map((r, idx) => (
              <ReferenceArea
                key={idx}
                x1={r.start}
                x2={r.end}
                fill="hsl(var(--chart-5))"
                fillOpacity={0.15}
              />
            ))}
            <ChartTooltip
              content={
                <ChartTooltipContent formatter={(value) => dollarTooltipFormatter(value)} />
              }
            />
            <Line type="monotone" dataKey="baseCash" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Base Case" />
            <Line type="monotone" dataKey="currentCash" stroke="hsl(var(--chart-4))" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Your Scenario" />
          </LineChart>
        </ChartContainer>
        {hasNegativeCash && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2" data-testid="cash-flow-advisory">
            Cash dips below zero here — consider adjusting assumptions
          </p>
        )}
        <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block bg-primary" />Base Case</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0 border-t-2 border-dashed inline-block" style={{ borderColor: "hsl(var(--chart-4))" }} />Your Scenario</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Chart 3: Break-Even ────────────────────────────────────────────────

const breakEvenConfig: ChartConfig = {
  months: { label: "Months to Break-Even", color: "hsl(var(--primary))" },
};

function BreakEvenChart({ base, current }: { base: EngineOutput; current: EngineOutput }) {
  const data = useMemo(() => {
    return [
      {
        scenario: "Base Case",
        months: base.roiMetrics.breakEvenMonth,
        fill: "hsl(var(--primary))",
      },
      {
        scenario: "Your Scenario",
        months: current.roiMetrics.breakEvenMonth,
        fill: "hsl(var(--chart-4))",
      },
    ];
  }, [base, current]);

  return (
    <Card data-testid="sensitivity-chart-break-even">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-medium">When Do I Break Even?</CardTitle>
        <p className="text-xs text-muted-foreground">Break-Even Timeline</p>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <ChartContainer config={breakEvenConfig} className="h-[220px] w-full">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 5, bottom: 0 }}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#D0D1DB4D" />
            <XAxis
              type="number"
              domain={[0, 60]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => `M${v}`}
            />
            <YAxis
              type="category"
              dataKey="scenario"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              width={100}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => {
                    if (value === null || value === undefined) return "No break-even in 5 years";
                    return `Month ${value}`;
                  }}
                />
              }
            />
            <Bar dataKey="months" radius={[0, 4, 4, 0]} animationDuration={300}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <div className="flex flex-col gap-1 mt-2">
          {data.map((d) => (
            <div key={d.scenario} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.fill }} />
              <span className="text-muted-foreground">{d.scenario}:</span>
              <span className="font-medium">
                {d.months !== null ? `Month ${d.months}` : "No break-even in 5 years"}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Chart 4: ROI & Returns ─────────────────────────────────────────────

const roiConfig: ChartConfig = {
  baseRoic: { label: "Base Case ROIC", color: "hsl(var(--primary))" },
  currentRoic: { label: "Your Scenario ROIC", color: "hsl(var(--chart-4))" },
};

function ROIChart({ base, current }: { base: EngineOutput; current: EngineOutput }) {
  const data = useMemo(() => {
    return YEAR_INDICES.map((i) => ({
      year: `Year ${i + 1}`,
      baseRoic: (base.roicExtended[i]?.roicPct ?? 0) * 100,
      currentRoic: (current.roicExtended[i]?.roicPct ?? 0) * 100,
    }));
  }, [base, current]);

  const year5Roic = current.roicExtended[4]?.roicPct ?? 0;

  return (
    <Card data-testid="sensitivity-chart-roi">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-medium">What's My Return?</CardTitle>
        <p className="text-xs text-muted-foreground">ROI & Returns</p>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <ChartContainer config={roiConfig} className="h-[200px] w-full">
          <LineChart data={data} margin={{ top: 5, right: 12, left: 12, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#D0D1DB4D" />
            <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${v.toFixed(0)}%`} width={50} />
            <ChartTooltip content={<ChartTooltipContent formatter={(value) => pctTooltipFormatter(value)} />} />
            <Line type="monotone" dataKey="baseRoic" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Base Case" />
            <Line type="monotone" dataKey="currentRoic" stroke="hsl(var(--chart-4))" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Your Scenario" />
          </LineChart>
        </ChartContainer>
        <div className="mt-2 rounded-md bg-muted/50 p-2" data-testid="roi-callout">
          <p className="text-xs text-foreground">
            Your scenario: {(year5Roic * 100).toFixed(1)}% ROIC at Year 5.
          </p>
        </div>
        <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block bg-primary" />Base Case</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0 border-t-2 border-dashed inline-block" style={{ borderColor: "hsl(var(--chart-4))" }} />Your Scenario</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Chart 5: Balance Sheet Health ──────────────────────────────────────

const balanceSheetConfig: ChartConfig = {
  baseAssets: { label: "Assets (Base)", color: "hsl(var(--chart-1))" },
  baseLiabilities: { label: "Liabilities (Base)", color: "hsl(var(--chart-2))" },
  currentAssets: { label: "Assets (Your Scenario)", color: "hsl(var(--chart-1))" },
  currentLiabilities: { label: "Liabilities (Your Scenario)", color: "hsl(var(--chart-2))" },
};

function BalanceSheetChart({ base, current }: { base: EngineOutput; current: EngineOutput }) {
  const data = useMemo(() => {
    return YEAR_INDICES.map((i) => ({
      year: `Year ${i + 1}`,
      baseAssets: base.annualSummaries[i].totalAssets / 100,
      baseLiabilities: base.annualSummaries[i].totalLiabilities / 100,
      currentAssets: current.annualSummaries[i].totalAssets / 100,
      currentLiabilities: current.annualSummaries[i].totalLiabilities / 100,
    }));
  }, [base, current]);

  return (
    <Card data-testid="sensitivity-chart-balance-sheet">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-medium">Is My Business Growing?</CardTitle>
        <p className="text-xs text-muted-foreground">Balance Sheet Health</p>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <ChartContainer config={balanceSheetConfig} className="h-[220px] w-full">
          <LineChart data={data} margin={{ top: 5, right: 12, left: 12, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#D0D1DB4D" />
            <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={dollarTickFormatter} width={60} />
            <ChartTooltip content={<ChartTooltipContent formatter={(value) => dollarTooltipFormatter(value)} />} />
            <Line type="monotone" dataKey="baseAssets" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} name="Assets (Base)" />
            <Line type="monotone" dataKey="currentAssets" stroke="hsl(var(--chart-1))" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Assets (Yours)" />
            <Line type="monotone" dataKey="baseLiabilities" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} name="Liabilities (Base)" />
            <Line type="monotone" dataKey="currentLiabilities" stroke="hsl(var(--chart-2))" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Liabilities (Yours)" />
          </LineChart>
        </ChartContainer>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block" style={{ backgroundColor: "hsl(var(--chart-1))" }} />Total Assets</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block" style={{ backgroundColor: "hsl(var(--chart-2))" }} />Total Liabilities</span>
          <span className="ml-2 flex items-center gap-1"><span className="w-3 h-0 border-t-2 border-solid inline-block border-foreground/40" />Base</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0 border-t-2 border-dashed inline-block border-foreground/40" />Yours</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Chart 6: Debt & Working Capital ────────────────────────────────────

const debtConfig: ChartConfig = {
  baseDebt: { label: "Debt (Base)", color: "hsl(var(--chart-1))" },
  baseWorkingCapital: { label: "Working Capital (Base)", color: "hsl(var(--chart-3))" },
  currentDebt: { label: "Debt (Your Scenario)", color: "hsl(var(--chart-1))" },
  currentWorkingCapital: { label: "Working Capital (Your Scenario)", color: "hsl(var(--chart-3))" },
};

function DebtWorkingCapitalChart({ base, current }: { base: EngineOutput; current: EngineOutput }) {
  const data = useMemo(() => {
    if (base.monthlyProjections.length !== 60 || current.monthlyProjections.length !== 60) {
      return [];
    }
    return YEAR_END_MONTH_INDICES.map((mi, i) => {
      const bmp = base.monthlyProjections[mi];
      const cmp = current.monthlyProjections[mi];
      return {
        year: `Year ${i + 1}`,
        baseDebt: bmp.loanClosingBalance / 100,
        baseWorkingCapital: (bmp.totalCurrentAssets - bmp.totalCurrentLiabilities) / 100,
        currentDebt: cmp.loanClosingBalance / 100,
        currentWorkingCapital: (cmp.totalCurrentAssets - cmp.totalCurrentLiabilities) / 100,
      };
    });
  }, [base, current]);

  return (
    <Card data-testid="sensitivity-chart-debt-working-capital">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-medium">How's My Debt?</CardTitle>
        <p className="text-xs text-muted-foreground">Debt & Working Capital</p>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <ChartContainer config={debtConfig} className="h-[220px] w-full">
          <LineChart data={data} margin={{ top: 5, right: 12, left: 12, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#D0D1DB4D" />
            <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={dollarTickFormatter} width={60} />
            <ChartTooltip content={<ChartTooltipContent formatter={(value) => dollarTooltipFormatter(value)} />} />
            <Line type="monotone" dataKey="baseDebt" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} name="Debt (Base)" />
            <Line type="monotone" dataKey="currentDebt" stroke="hsl(var(--chart-1))" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Debt (Yours)" />
            <Line type="monotone" dataKey="baseWorkingCapital" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} name="Working Cap (Base)" />
            <Line type="monotone" dataKey="currentWorkingCapital" stroke="hsl(var(--chart-3))" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Working Cap (Yours)" />
          </LineChart>
        </ChartContainer>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block" style={{ backgroundColor: "hsl(var(--chart-1))" }} />Outstanding Debt</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block" style={{ backgroundColor: "hsl(var(--chart-3))" }} />Working Capital</span>
          <span className="ml-2 flex items-center gap-1"><span className="w-3 h-0 border-t-2 border-solid inline-block border-foreground/40" />Base</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0 border-t-2 border-dashed inline-block border-foreground/40" />Yours</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Error Boundary ─────────────────────────────────────────────────────

interface ErrorBoundaryState {
  hasError: boolean;
}

class ChartErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div data-testid="sensitivity-charts-error" className="col-span-full flex items-center justify-center p-8">
          <Card>
            <CardContent className="py-8 px-6 text-center">
              <p className="text-sm text-muted-foreground">
                Unable to generate charts. Please try adjusting your inputs.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Main Component ─────────────────────────────────────────────────────

function SensitivityChartsInner({ scenarioOutputs }: { scenarioOutputs: SensitivityOutputs }) {
  const { base, current } = scenarioOutputs;

  if (
    !base.annualSummaries || base.annualSummaries.length < 5 ||
    !current.annualSummaries || current.annualSummaries.length < 5 ||
    !base.roicExtended || base.roicExtended.length < 5 ||
    !current.roicExtended || current.roicExtended.length < 5 ||
    !base.monthlyProjections || base.monthlyProjections.length !== 60 ||
    !current.monthlyProjections || current.monthlyProjections.length !== 60
  ) {
    return (
      <div data-testid="sensitivity-charts-error" className="flex items-center justify-center p-8">
        <Card>
          <CardContent className="py-8 px-6 text-center">
            <p className="text-sm text-muted-foreground">
              Unable to generate charts. Please try adjusting your inputs.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="sensitivity-charts-grid">
      <ProfitabilityChart base={base} current={current} />
      <CashFlowChart base={base} current={current} />
      <BreakEvenChart base={base} current={current} />
      <ROIChart base={base} current={current} />
      <BalanceSheetChart base={base} current={current} />
      <DebtWorkingCapitalChart base={base} current={current} />
    </div>
  );
}

export const SensitivityCharts = memo(function SensitivityCharts({ scenarioOutputs }: SensitivityChartsProps) {
  if (!scenarioOutputs) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="sensitivity-charts-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2 pt-4 px-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-24 mt-1" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <Skeleton className="h-[220px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <ChartErrorBoundary>
      <SensitivityChartsInner scenarioOutputs={scenarioOutputs} />
    </ChartErrorBoundary>
  );
});
