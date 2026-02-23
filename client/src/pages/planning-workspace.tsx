import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { usePlanAutoSave } from "@/hooks/use-plan-auto-save";
import { planKey } from "@/hooks/use-plan";
import { queryClient } from "@/lib/queryClient";
import { PlanningHeader } from "@/components/planning/planning-header";
import { InputPanel } from "@/components/planning/input-panel";
import { FinancialStatements } from "@/components/planning/financial-statements";
import { ImpactStrip } from "@/components/planning/impact-strip";
import { DocumentPreviewModal } from "@/components/planning/document-preview-modal";
import { PlanCompletenessBar } from "@/components/planning/plan-completeness-bar";
import { WhatIfPlayground } from "@/components/planning/what-if-playground";
import { DataSharingSettings } from "@/components/planning/data-sharing-settings";
import { PlanStatusSettings } from "@/components/planning/plan-status-settings";
import { PlanningAssistantPanel } from "@/components/planning/planning-assistant-panel";
import { PlanningAssistantFAB } from "@/components/planning/planning-assistant-fab";
import { PlanningAssistantProvider, usePlanningAssistant } from "@/contexts/PlanningAssistantContext";

import { QuickStartOverlay } from "@/components/shared/quick-start-overlay";
import { SummaryMetrics } from "@/components/shared/summary-metrics";
import { useWorkspaceView } from "@/contexts/WorkspaceViewContext";
import { useAuth } from "@/hooks/use-auth";
import type { Brand, Plan } from "@shared/schema";
import type { PlanFinancialInputs } from "@shared/financial-engine";
import type { StartupCostLineItem } from "@shared/financial-engine";

export default function PlanningWorkspace() {
  return (
    <PlanningAssistantProvider>
      <PlanningWorkspaceInner />
    </PlanningAssistantProvider>
  );
}

function PlanningWorkspaceInner() {
  const params = useParams<{ planId: string }>();
  const planId = params.planId!;
  const { plan, isLoading: planLoading, error: planError, saveStatus, queueSave, retrySave, flushSave, isSaving, hasUnsavedChanges } = usePlanAutoSave(planId);
  const { setOpen } = useSidebar();
  const { workspaceView, statementsDefaultTab, navigateToStatements, setActivePlanName, resetWorkspaceView, navigateToMyPlan, navigateToSettings } = useWorkspaceView();
  const { isOpen: isPlanningAssistantOpen } = usePlanningAssistant();
  const { user } = useAuth();

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [startupCostCount, setStartupCostCount] = useState(0);
  const [docPreviewOpen, setDocPreviewOpen] = useState(false);

  const brandId = plan?.brandId;
  const { data: brand } = useQuery<Brand>({
    queryKey: ["/api/brands", brandId],
    enabled: !!brandId,
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get("view");
    if (viewParam === "settings") {
      navigateToSettings();
      window.history.replaceState({}, "", window.location.pathname);
    } else {
      resetWorkspaceView();
    }
  }, [planId, resetWorkspaceView, navigateToSettings]);

  useEffect(() => {
    if (plan?.name) {
      setActivePlanName(plan.name);
    }
  }, [plan?.name, setActivePlanName]);

  const { openPlanningAssistant, sidebarStateBeforeOpen } = usePlanningAssistant();
  const { open: sidebarOpen } = useSidebar();

  useEffect(() => {
    const handleOpenAssistant = () => {
      sidebarStateBeforeOpen.current = sidebarOpen;
      setOpen(false);
      openPlanningAssistant();
      navigateToMyPlan();
    };
    window.addEventListener("open-planning-assistant", handleOpenAssistant);
    return () => window.removeEventListener("open-planning-assistant", handleOpenAssistant);
  }, [openPlanningAssistant, sidebarStateBeforeOpen, sidebarOpen, setOpen, navigateToMyPlan]);

  const sidebarInitialized = useRef(false);
  useEffect(() => {
    if (!sidebarInitialized.current) {
      setOpen(false);
      sidebarInitialized.current = true;
    }
  }, [setOpen]);

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
        <div className="flex-1 p-4 space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
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

  const resolvedBrandName = brand?.displayName || brand?.name;
  const financialInputs = plan?.financialInputs as PlanFinancialInputs | null | undefined;
  const startupCostsData = (plan?.startupCosts ?? null) as StartupCostLineItem[] | null;

  const renderWorkspaceContent = () => {
    switch (workspaceView) {
      case "reports":
        return (
          <FinancialStatements
            planId={planId}
            defaultTab={statementsDefaultTab}
            plan={plan}
            queueSave={queueSave}
            isSaving={isSaving}
            brandName={resolvedBrandName}
            startupCostCount={startupCostCount}
          />
        );
      case "scenarios":
        return <WhatIfPlayground planId={planId} />;
      case "settings":
        return (
          <div className="flex-1 p-8 max-w-2xl mx-auto w-full space-y-6">
            <h2 className="text-2xl font-semibold">Settings</h2>
            <PlanStatusSettings planId={planId} />
            <DataSharingSettings planId={planId} />
          </div>
        );
      case "my-plan":
      default:
        if (isPlanningAssistantOpen) {
          return (
            <PlanningAssistantPanel
              planId={planId}
              plan={plan}
              userName={user?.displayName || user?.email || "there"}
              brandName={resolvedBrandName || "your franchise"}
              financialInputs={financialInputs ?? null}
              startupCostCount={startupCostCount}
              queueSave={queueSave}
            />
          );
        }
        return (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="sticky top-0 z-20 bg-background border-b px-4 py-3 space-y-3" data-testid="my-plan-summary-metrics">
              <PlanCompletenessBar financialInputs={financialInputs ?? null} startupCostCount={startupCostCount} />
              <SummaryMetrics planId={planId} />
            </div>
            <div className="flex-1 min-h-0">
              <InputPanel planId={planId} planName={plan.name || "My Plan"} brandName={resolvedBrandName} queueSave={queueSave} onSectionChange={setActiveSection} onStartupCostCountChange={setStartupCostCount} />
            </div>
          </div>
        );
    }
  };

  return (
    <div data-testid="planning-workspace" className="flex flex-col h-full">
      <PlanningHeader
        planId={planId}
        planName={plan.name || "My Plan"}
        saveStatus={saveStatus}
        onRetrySave={retrySave}
        onNameChange={(newName) => setActivePlanName(newName)}
      />
      <div className="flex-1 min-h-0 flex flex-col">
        {renderWorkspaceContent()}
      </div>

      {workspaceView === "my-plan" && <PlanningAssistantFAB />}
      <ImpactStrip
        planId={planId}
        activeSection={activeSection}
        financialInputs={financialInputs ?? null}
        startupCosts={startupCostsData}
        onNavigateToStatements={navigateToStatements}
        onOpenDocumentPreview={() => setDocPreviewOpen(true)}
      />

      <DocumentPreviewModal
        open={docPreviewOpen}
        onOpenChange={setDocPreviewOpen}
        planId={planId}
        planName={plan.name || "My Plan"}
        brandName={resolvedBrandName}
        financialInputs={financialInputs ?? null}
        startupCosts={startupCostsData}
        startupCostCount={startupCostCount}
      />
    </div>
  );
}
