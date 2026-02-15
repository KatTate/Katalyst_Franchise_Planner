import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { usePlanAutoSave } from "@/hooks/use-plan-auto-save";
import { planKey } from "@/hooks/use-plan";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PlanningHeader } from "@/components/planning/planning-header";
import { InputPanel } from "@/components/planning/input-panel";
import { DashboardPanel } from "@/components/planning/dashboard-panel";
import { QuickStartOverlay } from "@/components/shared/quick-start-overlay";
import type { ExperienceTier } from "@/components/planning/mode-switcher";
import type { Brand, Plan } from "@shared/schema";

export default function PlanningWorkspace() {
  const params = useParams<{ planId: string }>();
  const planId = params.planId!;
  const { user } = useAuth();
  const { plan, isLoading: planLoading, error: planError, saveStatus, queueSave, retrySave, flushSave, isSaving, hasUnsavedChanges } = usePlanAutoSave(planId);
  const { setOpen } = useSidebar();

  const brandId = plan?.brandId;
  const { data: brand } = useQuery<Brand>({
    queryKey: ["/api/brands", brandId],
    enabled: !!brandId,
  });

  const getStoredMode = (): ExperienceTier | null => {
    try {
      const stored = localStorage.getItem(`plan-mode-${planId}`);
      if (stored === "forms" || stored === "quick_entry" || stored === "planning_assistant") {
        return stored;
      }
    } catch {}
    return null;
  };

  const [activeMode, setActiveMode] = useState<ExperienceTier>(
    getStoredMode() ?? user?.preferredTier ?? "forms"
  );

  const hasUserSynced = useRef(false);
  useEffect(() => {
    if (user?.preferredTier && !hasUserSynced.current && !getStoredMode()) {
      setActiveMode(user.preferredTier as ExperienceTier);
      hasUserSynced.current = true;
    }
  }, [user?.preferredTier]);

  const sidebarInitialized = useRef(false);
  useEffect(() => {
    if (!sidebarInitialized.current) {
      setOpen(false);
      sidebarInitialized.current = true;
    }
  }, [setOpen]);

  const saveTierRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (saveTierRef.current) clearTimeout(saveTierRef.current);
    };
  }, []);

  const pendingModeRef = useRef<ExperienceTier | null>(null);

  useEffect(() => {
    if (!isSaving && !hasUnsavedChanges && pendingModeRef.current) {
      const nextMode = pendingModeRef.current;
      pendingModeRef.current = null;
      setActiveMode(nextMode);
      try { localStorage.setItem(`plan-mode-${planId}`, nextMode); } catch {}

      if (saveTierRef.current) clearTimeout(saveTierRef.current);
      saveTierRef.current = setTimeout(async () => {
        try {
          await apiRequest("PATCH", "/api/auth/me", { preferredTier: nextMode });
          queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        } catch {
        }
      }, 500);
    }
  }, [isSaving, hasUnsavedChanges, planId]);

  const handleModeChange = useCallback(
    (mode: ExperienceTier) => {
      if (isSaving) {
        pendingModeRef.current = mode;
        return;
      }

      if (hasUnsavedChanges) {
        pendingModeRef.current = mode;
        flushSave();
        return;
      }

      setActiveMode(mode);
      try { localStorage.setItem(`plan-mode-${planId}`, mode); } catch {}

      if (saveTierRef.current) clearTimeout(saveTierRef.current);
      saveTierRef.current = setTimeout(async () => {
        try {
          await apiRequest("PATCH", "/api/auth/me", { preferredTier: mode });
          queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        } catch {
        }
      }, 500);
    },
    [isSaving, hasUnsavedChanges, flushSave]
  );

  const handleQuickStartComplete = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: planKey(planId) });
  }, [planId]);

  if (planLoading) {
    return (
      <div data-testid="planning-workspace" className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-3 py-2 border-b shrink-0">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-4 w-48" />
          <div className="flex-1" />
          <Skeleton className="h-8 w-80" />
        </div>
        <div className="flex-1 flex">
          <div className="flex-1 p-4">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
          <div className="flex-1 p-4">
            <Skeleton className="h-64 w-full rounded-lg mb-4" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (planError || !plan) {
    return (
      <div data-testid="planning-workspace" className="flex flex-col items-center justify-center h-full">
        <p className="text-sm text-muted-foreground mb-3">
          We couldn't load your plan. Your data is safe — please try refreshing.
        </p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh
        </Button>
      </div>
    );
  }

  if (!plan.quickStartCompleted) {
    return (
      <div data-testid="planning-workspace" className="flex flex-col h-full overflow-auto">
        <QuickStartOverlay
          planId={planId}
          brand={brand ?? null}
          onComplete={handleQuickStartComplete}
        />
      </div>
    );
  }

  return (
    <div data-testid="planning-workspace" className="flex flex-col h-full">
      <PlanningHeader
        planName={plan.name || "My Plan"}
        activeMode={activeMode}
        onModeChange={handleModeChange}
        saveStatus={saveStatus}
        onRetrySave={retrySave}
      />
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={40} minSize={30}>
            <div className="h-full" style={{ minWidth: 360 }}>
              <InputPanel activeMode={activeMode} planId={planId} queueSave={queueSave} />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={60} minSize={40}>
            <div className="h-full" style={{ minWidth: 480 }}>
              <DashboardPanel planId={planId} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
