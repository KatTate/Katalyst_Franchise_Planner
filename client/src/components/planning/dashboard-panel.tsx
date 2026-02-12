import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { usePlanOutputs } from "@/hooks/use-plan-outputs";
import { MetricCard, formatROI, formatBreakEven } from "@/components/shared/summary-metrics";
import { BreakEvenChart, RevenueExpensesChart } from "@/components/planning/dashboard-charts";
import { formatCents } from "@/lib/format-currency";

interface DashboardPanelProps {
  planId: string;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="pt-4 pb-3 px-4">
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-7 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="py-4">
          <Skeleton className="h-[220px] w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="py-4">
          <Skeleton className="h-[220px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardPanel({ planId }: DashboardPanelProps) {
  const { output, isLoading, isFetching, error, invalidateOutputs } = usePlanOutputs(planId);

  if (isLoading) {
    return (
      <div data-testid="dashboard-panel" className="h-full p-4 overflow-auto">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    const is400 = error.message?.includes("400");
    return (
      <div data-testid="dashboard-panel" className="h-full p-4 overflow-auto">
        <div className="flex flex-col items-center justify-center h-full text-center py-16">
          <p className="text-sm text-muted-foreground mb-3">
            {is400
              ? "Enter your first values to see your financial dashboard come to life."
              : "We couldn't load your plan. Your data is safe — please try refreshing."}
          </p>
          {!is400 && (
            <Button variant="outline" size="sm" onClick={() => invalidateOutputs()}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!output) {
    return (
      <div data-testid="dashboard-panel" className="h-full p-4 overflow-auto">
        <div className="flex flex-col items-center justify-center h-full text-center py-16">
          <p className="text-sm text-muted-foreground">
            Enter your first values to see your financial dashboard come to life.
          </p>
        </div>
      </div>
    );
  }

  const { roiMetrics, annualSummaries, monthlyProjections } = output;
  const monthlyAvgCashFlow = annualSummaries[0]
    ? Math.round(annualSummaries[0].netCashFlow / 12)
    : 0;

  return (
    <div data-testid="dashboard-panel" className="h-full p-4 overflow-auto">
      <div className="space-y-4">
        {/* Summary Cards */}
        <div data-testid="dashboard-summary-cards" className="grid grid-cols-2 xl:grid-cols-3 gap-3">
          <MetricCard
            label="Total Startup Investment"
            value={formatCents(roiMetrics.totalStartupInvestment)}
            testId="metric-card-investment"
            isFetching={isFetching && !isLoading}
          />
          <MetricCard
            label="Projected Annual Revenue"
            value={formatCents(annualSummaries[0]?.revenue ?? 0)}
            subtitle="Year 1"
            testId="metric-card-revenue"
            isFetching={isFetching && !isLoading}
          />
          <MetricCard
            label="ROI (5-Year)"
            value={formatROI(roiMetrics.fiveYearROIPct)}
            testId="metric-card-roi"
            isFetching={isFetching && !isLoading}
          />
          <MetricCard
            label="Break-Even"
            value={formatBreakEven(roiMetrics.breakEvenMonth)}
            testId="metric-card-breakeven"
            isFetching={isFetching && !isLoading}
          />
          <MetricCard
            label="Monthly Cash Flow"
            value={formatCents(monthlyAvgCashFlow)}
            subtitle="Year 1 Average"
            testId="metric-card-cashflow"
            isFetching={isFetching && !isLoading}
          />
        </div>

        {/* Charts */}
        <BreakEvenChart monthlyProjections={monthlyProjections} totalStartupInvestment={roiMetrics.totalStartupInvestment} />
        <RevenueExpensesChart annualSummaries={annualSummaries} />
      </div>
    </div>
  );
}
