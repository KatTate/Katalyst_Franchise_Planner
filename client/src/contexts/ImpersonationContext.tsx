import { createContext, useContext, useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { ImpersonationStatus } from "@shared/schema";

interface ImpersonationContextValue {
  active: boolean;
  targetUser: { id: string; displayName: string | null; email: string; role: string; brandId: string | null } | null;
  readOnly: boolean;
  editingEnabled: boolean;
  remainingMinutes: number;
  returnBrandId: string | null;
  isLoading: boolean;
  isTogglingEditMode: boolean;
  startImpersonation: (userId: string) => Promise<void>;
  stopImpersonation: () => Promise<void>;
  toggleEditMode: (enabled: boolean) => Promise<void>;
}

const ImpersonationContext = createContext<ImpersonationContextValue>({
  active: false,
  targetUser: null,
  readOnly: true,
  editingEnabled: false,
  remainingMinutes: 0,
  returnBrandId: null,
  isLoading: false,
  isTogglingEditMode: false,
  startImpersonation: async () => {},
  stopImpersonation: async () => {},
  toggleEditMode: async () => {},
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
  const [isTogglingEditMode, setIsTogglingEditMode] = useState(false);

  const isRealAdmin = user?.role === "katalyst_admin" || user?._realUser?.role === "katalyst_admin";

  const { data: status, isLoading } = useQuery<ImpersonationStatus>({
    queryKey: ["/api/admin/impersonate/status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!isRealAdmin,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });

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

  useEffect(() => {
    if (autoRevertTimerRef.current) {
      clearTimeout(autoRevertTimerRef.current);
      autoRevertTimerRef.current = null;
    }

    if (status?.active && status.remainingMinutes > 0) {
      autoRevertTimerRef.current = setTimeout(() => {
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

  const toggleEditMode = useCallback(async (enabled: boolean) => {
    setIsTogglingEditMode(true);
    try {
      const res = await apiRequest("POST", "/api/admin/impersonate/edit-mode", { enabled });
      const data = await res.json();

      queryClient.setQueryData(["/api/admin/impersonate/status"], (prev: ImpersonationStatus | undefined) => {
        if (!prev || !prev.active) return prev;
        return {
          ...prev,
          readOnly: !data.editingEnabled,
          editingEnabled: data.editingEnabled,
        };
      });

      const displayName = status?.active ? (status.targetUser.displayName || status.targetUser.email) : "";
      if (data.editingEnabled) {
        toast({ title: `Editing enabled for ${displayName}`, description: "You can now make changes on their behalf." });
      } else {
        toast({ title: "Returned to read-only mode", description: "No further changes can be made." });
      }
    } catch (err) {
      toast({
        title: "Failed to toggle edit mode",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsTogglingEditMode(false);
    }
  }, [queryClient, toast, status]);

  const value: ImpersonationContextValue = {
    active: status?.active ?? false,
    targetUser: status?.active ? status.targetUser : null,
    readOnly: status?.active ? status.readOnly : true,
    editingEnabled: status?.active ? status.editingEnabled : false,
    remainingMinutes: status?.active ? status.remainingMinutes : 0,
    returnBrandId: status?.active ? status.returnBrandId : null,
    isLoading: isRealAdmin ? isLoading : false,
    isTogglingEditMode,
    startImpersonation,
    stopImpersonation,
    toggleEditMode,
  };

  return (
    <ImpersonationContext.Provider value={value}>
      {children}
    </ImpersonationContext.Provider>
  );
}
