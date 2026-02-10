import { useParams } from "wouter";
import { StartupCostBuilder } from "@/components/shared/startup-cost-builder";

export default function StartupCostsDevPage() {
  const { planId } = useParams<{ planId: string }>();

  if (!planId) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <p className="text-muted-foreground">No plan ID provided. Navigate to /plans/:planId/startup-costs</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Startup Cost Builder (Dev Preview)</h1>
      <StartupCostBuilder planId={planId} />
    </div>
  );
}
