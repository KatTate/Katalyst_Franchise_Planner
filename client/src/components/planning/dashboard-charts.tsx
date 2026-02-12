import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MonthlyProjection, AnnualSummary } from "@shared/financial-engine";

// ─── Break-Even Timeline Chart ──────────────────────────────────────────

interface BreakEvenChartProps {
  monthlyProjections: MonthlyProjection[];
}

const breakEvenConfig: ChartConfig = {
  cumulativeCashFlow: {
    label: "Cumulative Cash Flow",
    color: "hsl(var(--primary))",
  },
};

export function BreakEvenChart({ monthlyProjections }: BreakEvenChartProps) {
  // Use the engine's pre-computed cumulative net cash flow which accounts for
  // financing inflows, loan principal payments, and distributions — matching
  // the same basis as roiMetrics.breakEvenMonth.
  const data = monthlyProjections.map((mp) => ({
    month: `M${mp.month}`,
    monthNum: mp.month,
    cumulativeCashFlow: mp.cumulativeNetCashFlow / 100, // Convert cents to dollars
  }));

  // Sample every 3 months for cleaner X axis
  const tickIndices = data.filter((_, i) => i % 6 === 0 || i === data.length - 1).map(d => d.month);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Break-Even Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4" data-testid="chart-breakeven-timeline">
        <ChartContainer config={breakEvenConfig} className="h-[220px] w-full">
          <AreaChart data={data} margin={{ top: 5, right: 12, left: 12, bottom: 0 }}>
            <defs>
              <linearGradient id="fillPositive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#D0D1DB4D" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#50534C" }}
              ticks={tickIndices}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#50534C" }}
              tickFormatter={(v: number) =>
                v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v.toFixed(0)}`
              }
              width={60}
            />
            <ReferenceLine y={0} stroke="#D0D1DB" strokeWidth={1.5} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => {
                    const num = Number(value);
                    return `$${num.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
                  }}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="cumulativeCashFlow"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#fillPositive)"
              animationDuration={300}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// ─── Revenue vs Expenses Chart ──────────────────────────────────────────

interface RevenueExpensesChartProps {
  annualSummaries: AnnualSummary[];
}

const revenueExpensesConfig: ChartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
  expenses: {
    label: "Expenses",
    color: "#50534C",
  },
};

export function RevenueExpensesChart({ annualSummaries }: RevenueExpensesChartProps) {
  const data = annualSummaries.map((as) => ({
    year: `Year ${as.year}`,
    revenue: as.revenue / 100, // Convert cents to dollars
    expenses: (as.totalCogs + as.totalOpex) / 100,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Revenue vs. Expenses
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4" data-testid="chart-revenue-expenses">
        <ChartContainer config={revenueExpensesConfig} className="h-[220px] w-full">
          <BarChart data={data} margin={{ top: 5, right: 12, left: 12, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#D0D1DB4D" />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#50534C" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#50534C" }}
              tickFormatter={(v: number) =>
                v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v.toFixed(0)}`
              }
              width={60}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => {
                    const num = Number(value);
                    return `$${num.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
                  }}
                />
              }
            />
            <Bar
              dataKey="revenue"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              animationDuration={300}
              animationEasing="ease-out"
            />
            <Bar
              dataKey="expenses"
              fill="#50534C"
              radius={[4, 4, 0, 0]}
              animationDuration={300}
              animationEasing="ease-out"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
