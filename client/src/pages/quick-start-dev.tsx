import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { usePlan } from "@/hooks/use-plan";
import { QuickStartOverlay } from "@/components/shared/quick-start-overlay";
import type { Brand } from "@shared/schema";

export default function QuickStartDevPage() {
  const { planId } = useParams<{ planId: string }>();
  const [completed, setCompleted] = useState(false);
  const { plan, isLoading: planLoading } = usePlan(planId ?? "");

  // Load brand data for pre-fill defaults
  const { data: brand } = useQuery<Brand>({
    queryKey: ["/api/brands", plan?.brandId],
    enabled: !!plan?.brandId,
  });

  if (!planId) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <p className="text-muted-foreground">
          No plan ID provided. Navigate to /plans/:planId/quick-start
        </p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="max-w-4xl mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Quick Start Complete!</h1>
        <p className="text-muted-foreground mb-4">
          The Quick Start overlay has been dismissed. In the real app, this would
          transition to the full planning workspace.
        </p>
        <button
          className="text-sm text-primary hover:underline"
          onClick={() => setCompleted(false)}
        >
          Show Quick Start again (dev only)
        </button>
      </div>
    );
  }

  if (planLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <p className="text-muted-foreground">Loading plan...</p>
      </div>
    );
  }

  return (
    <QuickStartOverlay
      planId={planId}
      brand={brand ?? null}
      onComplete={() => setCompleted(true)}
    />
  );
}
