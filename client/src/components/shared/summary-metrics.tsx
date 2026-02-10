import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { X, RefreshCw } from "lucide-react";
import { usePlanOutputs } from "@/hooks/use-plan-outputs";
import { formatCents } from "@/lib/format-currency";
import type { EngineOutput } from "../../../../shared/financial-engine";

interface SummaryMetricsProps {
  planId: string;
}

function formatROI(pct: number): string {
  const display = pct * 100;
  if (Number.isInteger(display)) return `${display}%`;
  return `${display.toFixed(1)}%`;
}

function formatBreakEven(month: number | null): string {
  if (month === null) return "N/A";
  return `Month ${month}`;
}

function MetricCard({
  label,
  value,
  subtitle,
  testId,
  isFetching,
}: {
  label: string;
  value: string;
  subtitle?: string;
  testId: string;
  isFetching: boolean;
}) {
  return (
    <Card>
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
      </CardContent>
    </Card>
  );
}

function MetricSkeleton() {
  return (
    <Card>
      <CardContent className="pt-4 pb-3 px-4">
        <Skeleton className="h-3 w-24 mb-2" />
        <Skeleton className="h-7 w-32" />
      </CardContent>
    </Card>
  );
}

export function SummaryMetrics({ planId }: SummaryMetricsProps) {
  const { output, isLoading, isFetching, error, invalidateOutputs } = usePlanOutputs(planId);
  const [advisoryDismissed, setAdvisoryDismissed] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div data-testid="status-metrics-loading">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricSkeleton />
          <MetricSkeleton />
          <MetricSkeleton />
          <MetricSkeleton />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const is400 = error.message?.includes("400");
    if (is400) {
      return (
        <div className="text-center py-6 text-muted-foreground text-sm">
          Set up your plan to see projections.
        </div>
      );
    }
    return (
      <div className="text-center py-6">
        <p className="text-sm text-muted-foreground mb-2">
          Unable to compute metrics. Your data is safe — please try refreshing.
        </p>
        <Button variant="outline" size="sm" onClick={() => invalidateOutputs()}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Retry
        </Button>
      </div>
    );
  }

  // No output yet (shouldn't happen if no error, but defensive)
  if (!output) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        Set up your plan to see projections.
      </div>
    );
  }

  const { roiMetrics, annualSummaries, identityChecks } = output;
  const hasIdentityFailures = identityChecks.some((c) => !c.passed);

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Total Startup Investment"
          value={formatCents(roiMetrics.totalStartupInvestment)}
          testId="value-total-investment"
          isFetching={isFetching && !isLoading}
        />
        <MetricCard
          label="Projected Annual Revenue"
          value={formatCents(annualSummaries[0]?.revenue ?? 0)}
          subtitle="Year 1"
          testId="value-annual-revenue"
          isFetching={isFetching && !isLoading}
        />
        <MetricCard
          label="ROI (5-Year)"
          value={formatROI(roiMetrics.fiveYearROIPct)}
          testId="value-roi-pct"
          isFetching={isFetching && !isLoading}
        />
        <MetricCard
          label="Break-Even"
          value={formatBreakEven(roiMetrics.breakEvenMonth)}
          testId="value-break-even-month"
          isFetching={isFetching && !isLoading}
        />
      </div>

      {/* Identity check advisory — non-blocking, dismissible */}
      {hasIdentityFailures && !advisoryDismissed && (
        <div
          className="mt-3 flex items-center justify-between rounded-md px-3 py-2 text-sm"
          style={{ backgroundColor: "#A9A2AA20", color: "#A9A2AA" }}
          data-testid="status-identity-check"
        >
          <span>We're double-checking the numbers</span>
          <button
            onClick={() => setAdvisoryDismissed(true)}
            className="ml-2 hover:opacity-70 transition-opacity"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
