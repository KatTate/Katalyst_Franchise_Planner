import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { EngineOutput } from "@shared/financial-engine";

/** Query key factory for plan outputs. */
export function planOutputsKey(planId: string) {
  return ["/api/plans", planId, "outputs"] as const;
}

/**
 * Fetches financial engine outputs for a plan.
 *
 * Returns the complete EngineOutput (monthlyProjections, annualSummaries,
 * roiMetrics, identityChecks) computed server-side from the plan's current
 * financial inputs and startup costs.
 *
 * Outputs are refetched whenever the query is invalidated — callers should
 * invalidate `planOutputsKey(planId)` after updating financial inputs or
 * startup costs so metrics stay in sync.
 */
export function usePlanOutputs(planId: string) {
  const queryClient = useQueryClient();

  const query = useQuery<{ data: EngineOutput }>({
    queryKey: planOutputsKey(planId),
    enabled: !!planId,
    staleTime: 0,
  });

  /** Invalidate cached outputs to trigger refetch (call after input changes). */
  function invalidateOutputs() {
    queryClient.invalidateQueries({ queryKey: planOutputsKey(planId) });
  }

  return {
    output: query.data?.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    invalidateOutputs,
  };
}
