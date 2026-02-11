import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { StartupCostLineItem } from "@shared/financial-engine";

export function startupCostsKey(planId: string) {
  return ["/api/plans", planId, "startup-costs"] as const;
}

export function useStartupCosts(planId: string) {
  const queryClient = useQueryClient();
  const queryKey = startupCostsKey(planId);

  const query = useQuery<StartupCostLineItem[]>({
    queryKey,
    enabled: !!planId,
  });

  const updateMutation = useMutation({
    mutationFn: async (costs: StartupCostLineItem[]) => {
      const res = await apiRequest("PUT", `/api/plans/${planId}/startup-costs`, costs);
      return res.json() as Promise<StartupCostLineItem[]>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/plans/${planId}/startup-costs/reset`);
      return res.json() as Promise<StartupCostLineItem[]>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    },
  });

  return {
    costs: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    updateCosts: updateMutation.mutateAsync,
    resetToDefaults: resetMutation.mutateAsync,
    isSaving: updateMutation.isPending || resetMutation.isPending,
  };
}
