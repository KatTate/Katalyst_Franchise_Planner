import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowRight } from "lucide-react";
import { usePlanOutputs } from "@/hooks/use-plan-outputs";
import { MetricCard, formatROI, formatBreakEven } from "@/components/shared/summary-metrics";
import { BreakEvenChart, RevenueExpensesChart } from "@/components/planning/dashboard-charts";
import { formatCents } from "@/lib/format-currency";
import type { StatementTabId } from "@/components/planning/financial-statements";

interface DashboardPanelProps {
  planId: string;
  onNavigateToStatements?: (tab?: StatementTabId) => void;
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

function ClickableMetricCard({
  label,
  value,
  subtitle,
  testId,
  isFetching,
  onClick,
}: {
  label: string;
  value: string;
  subtitle?: string;
  testId: string;
  isFetching: boolean;
  onClick?: () => void;
}) {
  return (
    <Card className={onClick ? "cursor-pointer hover-elevate" : ""} onClick={onClick}>
      <CardContent className="pt-4 pb-3 px-4">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
          {label}
        </p>
        <p
          className="text-2xl font-semibold font-mono tabular-nums transition-opacity duration-200"
          style={{ opacity: isFetching ? 0.5 : 1 }}
          data-testid={testId}
        >
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
        {onClick && (
          <span className="text-xs text-primary flex items-center gap-0.5 mt-1">
            View details <ArrowRight className="h-3 w-3" />
          </span>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardPanel({ planId, onNavigateToStatements }: DashboardPanelProps) {
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
  const fetching = isFetching && !isLoading;

  return (
    <div data-testid="dashboard-panel" className="h-full p-4 overflow-auto">
      <div className="space-y-4">
        <div data-testid="dashboard-summary-cards" className="grid grid-cols-2 xl:grid-cols-3 gap-3">
          <ClickableMetricCard
            label="Total Startup Investment"
            value={formatCents(roiMetrics.totalStartupInvestment)}
            testId="metric-card-investment"
            isFetching={fetching}
            onClick={onNavigateToStatements ? () => onNavigateToStatements("summary") : undefined}
          />
          <ClickableMetricCard
            label="Projected Annual Revenue"
            value={formatCents(annualSummaries[0]?.revenue ?? 0)}
            subtitle="Year 1"
            testId="metric-card-revenue"
            isFetching={fetching}
            onClick={onNavigateToStatements ? () => onNavigateToStatements("pnl") : undefined}
          />
          <ClickableMetricCard
            label="ROI (5-Year)"
            value={formatROI(roiMetrics.fiveYearROIPct)}
            testId="metric-card-roi"
            isFetching={fetching}
            onClick={onNavigateToStatements ? () => onNavigateToStatements("roic") : undefined}
          />
          <ClickableMetricCard
            label="Break-Even"
            value={formatBreakEven(roiMetrics.breakEvenMonth)}
            testId="metric-card-breakeven"
            isFetching={fetching}
            onClick={onNavigateToStatements ? () => onNavigateToStatements("cash-flow") : undefined}
          />
          <ClickableMetricCard
            label="Monthly Cash Flow"
            value={formatCents(monthlyAvgCashFlow)}
            subtitle="Year 1 Average"
            testId="metric-card-cashflow"
            isFetching={fetching}
            onClick={onNavigateToStatements ? () => onNavigateToStatements("cash-flow") : undefined}
          />
        </div>

        {onNavigateToStatements && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onNavigateToStatements("summary")}
            data-testid="button-dashboard-view-statements"
          >
            <ArrowRight className="h-3.5 w-3.5 mr-1.5" />
            View Financial Statements
          </Button>
        )}

        <BreakEvenChart monthlyProjections={monthlyProjections} />
        <RevenueExpensesChart annualSummaries={annualSummaries} />
      </div>
    </div>
  );
}
