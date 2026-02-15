import { createContext, useContext, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { DemoModeStatus } from "@shared/schema";

interface DemoModeContextValue {
  active: boolean;
  brandId: string | null;
  brandName: string | null;
  demoUserId: string | null;
  isLoading: boolean;
  enterDemoMode: (brandId: string) => Promise<void>;
  exitDemoMode: () => Promise<void>;
  resetDemoData: (brandId: string) => Promise<void>;
}

const DemoModeContext = createContext<DemoModeContextValue>({
  active: false,
  brandId: null,
  brandName: null,
  demoUserId: null,
  isLoading: false,
  enterDemoMode: async () => {},
  exitDemoMode: async () => {},
  resetDemoData: async () => {},
});

export function useDemoMode() {
  return useContext(DemoModeContext);
}

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const isRealAdmin = user?.role === "katalyst_admin" || user?._realUser?.role === "katalyst_admin";

  const { data: status, isLoading } = useQuery<DemoModeStatus>({
    queryKey: ["/api/admin/demo/status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!isRealAdmin,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });

  const enterDemoMode = useCallback(async (brandId: string) => {
    try {
      const res = await apiRequest("POST", `/api/admin/demo/franchisee/${brandId}`);
      const data: DemoModeStatus = await res.json();
      queryClient.setQueryData(["/api/admin/demo/status"], data);
      queryClient.setQueryData(["/api/admin/impersonate/status"], { active: false });
      queryClient.invalidateQueries();

      if (data.active) {
        toast({
          title: `Entered demo mode for ${data.brandName}`,
          description: "You can fully interact as a franchisee.",
        });
        setLocation("/");
      }
    } catch (err) {
      toast({
        title: "Failed to enter demo mode",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  }, [queryClient, toast, setLocation]);

  const exitDemoMode = useCallback(async () => {
    try {
      await apiRequest("POST", "/api/admin/demo/exit");
      queryClient.setQueryData(["/api/admin/demo/status"], { active: false });
      queryClient.invalidateQueries();

      toast({ title: "Exited demo mode", description: "Returned to admin view." });
      setLocation("/admin/brands");
    } catch (err) {
      toast({
        title: "Failed to exit demo mode",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  }, [queryClient, toast, setLocation]);

  const resetDemoData = useCallback(async (brandId: string) => {
    try {
      const res = await apiRequest("POST", `/api/admin/demo/reset/${brandId}`);
      const data = await res.json();
      queryClient.invalidateQueries();

      toast({
        title: "Demo data reset",
        description: data.message || `Demo data reset to ${data.brandName} defaults.`,
      });
    } catch (err) {
      toast({
        title: "Failed to reset demo data",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  }, [queryClient, toast]);

  const value: DemoModeContextValue = {
    active: status?.active ?? false,
    brandId: status?.active ? status.brandId : null,
    brandName: status?.active ? status.brandName : null,
    demoUserId: status?.active ? status.demoUserId : null,
    isLoading: isRealAdmin ? isLoading : false,
    enterDemoMode,
    exitDemoMode,
    resetDemoData,
  };

  return (
    <DemoModeContext.Provider value={value}>
      {children}
    </DemoModeContext.Provider>
  );
}
