import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Settings } from "lucide-react";
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

import { QuickStartOverlay } from "@/components/shared/quick-start-overlay";
import { SummaryMetrics } from "@/components/shared/summary-metrics";
import { useWorkspaceView } from "@/contexts/WorkspaceViewContext";
import type { Brand, Plan } from "@shared/schema";
import type { PlanFinancialInputs } from "@shared/financial-engine";
import type { StartupCostLineItem } from "@shared/financial-engine";

export default function PlanningWorkspace() {
  const params = useParams<{ planId: string }>();
  const planId = params.planId!;
  const { plan, isLoading: planLoading, error: planError, saveStatus, queueSave, retrySave, flushSave, isSaving, hasUnsavedChanges } = usePlanAutoSave(planId);
  const { setOpen } = useSidebar();
  const { workspaceView, statementsDefaultTab, navigateToStatements, setActivePlanName, resetWorkspaceView, navigateToMyPlan } = useWorkspaceView();

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [startupCostCount, setStartupCostCount] = useState(0);
  const [docPreviewOpen, setDocPreviewOpen] = useState(false);

  const brandId = plan?.brandId;
  const { data: brand } = useQuery<Brand>({
    queryKey: ["/api/brands", brandId],
    enabled: !!brandId,
  });

  useEffect(() => {
    resetWorkspaceView();
  }, [planId, resetWorkspaceView]);

  useEffect(() => {
    if (plan?.name) {
      setActivePlanName(plan.name);
    }
  }, [plan?.name, setActivePlanName]);

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
          <div data-testid="placeholder-settings" className="flex-1 flex items-center justify-center p-8">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Settings className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Settings</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Coming soon — plan settings will appear here.
                </p>
              </CardContent>
            </Card>
          </div>
        );
      case "my-plan":
      default:
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
        planName={plan.name || "My Plan"}
        saveStatus={saveStatus}
        onRetrySave={retrySave}
      />
      <div className="flex-1 min-h-0 flex flex-col">
        {renderWorkspaceContent()}
      </div>

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
