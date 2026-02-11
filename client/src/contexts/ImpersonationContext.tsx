import { createContext, useContext, useCallback, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { ImpersonationStatus } from "@shared/schema";

interface ImpersonationContextValue {
  /** Whether impersonation is currently active */
  active: boolean;
  /** Target user details when active */
  targetUser: { id: string; displayName: string | null; email: string; role: string; brandId: string | null } | null;
  /** Whether the impersonation is read-only (always true in ST.1) */
  readOnly: boolean;
  /** Minutes remaining before auto-revert */
  remainingMinutes: number;
  /** Brand ID to return to on exit */
  returnBrandId: string | null;
  /** Whether the status is still loading */
  isLoading: boolean;
  /** Start impersonating a user */
  startImpersonation: (userId: string) => Promise<void>;
  /** Stop impersonation and return to admin view */
  stopImpersonation: () => Promise<void>;
}

const ImpersonationContext = createContext<ImpersonationContextValue>({
  active: false,
  targetUser: null,
  readOnly: true,
  remainingMinutes: 0,
  returnBrandId: null,
  isLoading: false,
  startImpersonation: async () => {},
  stopImpersonation: async () => {},
});

export function useImpersonation() {
  return useContext(ImpersonationContext);
}

export function ImpersonationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const autoRevertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAdmin = user?.role === "katalyst_admin";

  const { data: status, isLoading } = useQuery<ImpersonationStatus>({
    queryKey: ["/api/admin/impersonate/status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!isAdmin,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });

  // Handle expired status returned from server
  useEffect(() => {
    if (status && !status.active && "expired" in status && status.expired) {
      toast({ title: "Impersonation session expired", description: "Returning to admin view." });
      if (status.returnBrandId) {
        setLocation(`/admin/brands/${status.returnBrandId}?tab=account-manager`);
      } else {
        setLocation("/");
      }
    }
  }, [status, toast, setLocation]);

  // Set up frontend auto-revert timer
  useEffect(() => {
    if (autoRevertTimerRef.current) {
      clearTimeout(autoRevertTimerRef.current);
      autoRevertTimerRef.current = null;
    }

    if (status?.active && status.remainingMinutes > 0) {
      autoRevertTimerRef.current = setTimeout(() => {
        // Refetch status which will trigger server-side auto-revert
        queryClient.invalidateQueries({ queryKey: ["/api/admin/impersonate/status"] });
      }, status.remainingMinutes * 60 * 1000);
    }

    return () => {
      if (autoRevertTimerRef.current) {
        clearTimeout(autoRevertTimerRef.current);
      }
    };
  }, [status, queryClient]);

  const startImpersonation = useCallback(async (userId: string) => {
    try {
      const res = await apiRequest("POST", `/api/admin/impersonate/${userId}`);
      const data: ImpersonationStatus = await res.json();
      queryClient.setQueryData(["/api/admin/impersonate/status"], data);

      if (data.active) {
        // Invalidate stale admin-context queries before entering impersonated view
        queryClient.invalidateQueries();
        toast({
          title: `Now viewing as ${data.targetUser.displayName || data.targetUser.email}`,
          description: "Read-only mode — no changes can be made.",
        });
        setLocation("/");
      }
    } catch (err) {
      toast({
        title: "Failed to start impersonation",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  }, [queryClient, toast, setLocation]);

  const stopImpersonation = useCallback(async () => {
    try {
      const res = await apiRequest("POST", "/api/admin/impersonate/stop");
      const data = await res.json();
      queryClient.setQueryData(["/api/admin/impersonate/status"], { active: false });
      // Invalidate queries that may have been scoped to impersonated user
      queryClient.invalidateQueries();

      toast({ title: "Exited View As mode", description: "Returned to admin view." });

      if (data.returnBrandId) {
        setLocation(`/admin/brands/${data.returnBrandId}?tab=account-manager`);
      } else {
        setLocation("/");
      }
    } catch (err) {
      toast({
        title: "Failed to exit impersonation",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  }, [queryClient, toast, setLocation]);

  const value: ImpersonationContextValue = {
    active: status?.active ?? false,
    targetUser: status?.active ? status.targetUser : null,
    readOnly: status?.active ? status.readOnly : true,
    remainingMinutes: status?.active ? status.remainingMinutes : 0,
    returnBrandId: status?.active ? status.returnBrandId : null,
    isLoading: isAdmin ? isLoading : false,
    startImpersonation,
    stopImpersonation,
  };

  return (
    <ImpersonationContext.Provider value={value}>
      {children}
    </ImpersonationContext.Provider>
  );
}
