import { SummaryMetrics } from "@/components/shared/summary-metrics";
import { PlanCompletenessBar } from "@/components/planning/plan-completeness-bar";
import type { PlanFinancialInputs } from "@shared/financial-engine";

interface LiveDashboardPanelProps {
  planId: string;
  financialInputs: PlanFinancialInputs | null;
  startupCostCount: number;
}

export function LiveDashboardPanel({
  planId,
  financialInputs,
  startupCostCount,
}: LiveDashboardPanelProps) {
  return (
    <div className="flex flex-col h-full" data-testid="live-dashboard-panel">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Plan Completeness</h3>
          <PlanCompletenessBar
            financialInputs={financialInputs}
            startupCostCount={startupCostCount}
          />
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Financial Projections</h3>
          <SummaryMetrics planId={planId} />
        </div>
        <div className="rounded-xl border bg-muted/30 p-4" data-testid="dashboard-guidance">
          <p className="text-sm text-muted-foreground">
            As you share details in the conversation, your financial projections will update
            in real time. Watch the metrics above change as we capture your business assumptions.
          </p>
        </div>
      </div>
    </div>
  );
}
