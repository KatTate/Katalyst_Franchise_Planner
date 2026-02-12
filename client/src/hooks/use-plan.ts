import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { planOutputsKey } from "@/hooks/use-plan-outputs";
import type { Plan } from "@shared/schema";

/** Query key factory for plan data. */
export function planKey(planId: string) {
  return [`/api/plans/${planId}`] as const;
}

export function usePlan(planId: string) {
  const queryClient = useQueryClient();

  const query = useQuery<{ data: Plan }>({
    queryKey: planKey(planId),
    enabled: !!planId,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Plan>) => {
      const res = await apiRequest("PATCH", `/api/plans/${planId}`, data);
      return res.json() as Promise<{ data: Plan }>;
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: planKey(planId) });
      const previous = queryClient.getQueryData<{ data: Plan }>(planKey(planId));

      if (previous) {
        queryClient.setQueryData(planKey(planId), {
          data: { ...previous.data, ...newData },
        });
      }

      return { previous };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(planKey(planId), data);
      // Invalidate outputs so summary metrics refresh
      queryClient.invalidateQueries({ queryKey: planOutputsKey(planId) });
    },
    onError: (_err, _newData, context) => {
      if (context?.previous) {
        queryClient.setQueryData(planKey(planId), context.previous);
      }
    },
  });

  return {
    plan: query.data?.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    updatePlan: updateMutation.mutateAsync,
    isSaving: updateMutation.isPending,
    saveError: updateMutation.error,
  };
}
