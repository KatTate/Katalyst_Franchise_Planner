import { useParams } from "wouter";
import { SummaryMetrics } from "@/components/shared/summary-metrics";

export default function MetricsDevPage() {
  const { planId } = useParams<{ planId: string }>();

  if (!planId) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <p className="text-muted-foreground">No plan ID provided. Navigate to /plans/:planId/metrics</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Summary Metrics (Dev Preview)</h1>
      <SummaryMetrics planId={planId} />
    </div>
  );
}
