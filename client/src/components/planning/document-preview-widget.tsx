import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Eye } from "lucide-react";
import { usePlanOutputs } from "@/hooks/use-plan-outputs";
import { isAllDefaults } from "@/lib/guardian-engine";
import { computeCompleteness, getGenerateButtonLabel } from "@/lib/plan-completeness";
import { formatCents } from "@/lib/format-currency";
import { formatROI, formatBreakEven } from "@/components/shared/summary-metrics";
import { useToast } from "@/hooks/use-toast";
import { DocumentPreviewModal } from "./document-preview-modal";
import type { PlanFinancialInputs } from "@shared/financial-engine";
import type { StartupCostLineItem } from "@shared/schema";

interface DocumentPreviewWidgetProps {
  planId: string;
  planName: string;
  brandName?: string;
  financialInputs: PlanFinancialInputs | null;
  startupCosts: StartupCostLineItem[] | null;
  startupCostCount: number;
}

export function DocumentPreviewWidget({
  planId,
  planName,
  brandName,
  financialInputs,
  startupCosts,
  startupCostCount,
}: DocumentPreviewWidgetProps) {
  const { output } = usePlanOutputs(planId);
  const { toast } = useToast();
  const [previewOpen, setPreviewOpen] = useState(false);

  const completeness = useMemo(
    () => (financialInputs ? computeCompleteness(financialInputs, startupCostCount) : 0),
    [financialInputs, startupCostCount]
  );

  const allDefaults = useMemo(
    () => isAllDefaults(financialInputs ?? null, startupCosts ?? null),
    [financialInputs, startupCosts]
  );

  const showDraft = completeness < 50;
  const buttonLabel = getGenerateButtonLabel(completeness);

  const handleGeneratePdf = () => {
    toast({
      description: "PDF generation coming soon — this feature is being built",
      duration: 3000,
    });
  };

  return (
    <>
      <Card data-testid="document-preview-widget">
        <CardContent className="pt-4 pb-4 px-4">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium truncate">Business Plan</span>
            </div>
            {completeness > 90 && (
              <span className="text-xs text-guardian-healthy font-medium shrink-0">Ready</span>
            )}
          </div>

          <div className="relative bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-700 overflow-hidden" style={{ minHeight: "140px" }}>
            {showDraft && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <span
                  className="text-3xl font-bold text-gray-300 dark:text-zinc-700 select-none"
                  style={{ transform: "rotate(-35deg)", opacity: 0.35 }}
                >
                  DRAFT
                </span>
              </div>
            )}

            <div className="relative z-0 p-4 text-center space-y-1">
              <p className="text-[9px] uppercase tracking-widest text-gray-400 dark:text-zinc-500">Business Plan</p>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate" data-testid="text-plan-author-name">
                {planName || "My Business Plan"}
              </p>
              {brandName && (
                <p className="text-xs text-gray-500 dark:text-zinc-400">{brandName}</p>
              )}

              {output ? (
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[8px] text-gray-400 dark:text-zinc-500 uppercase">Pre-Tax</p>
                    <p className="text-xs font-mono font-semibold text-gray-800 dark:text-gray-200">
                      {output.annualSummaries[0] ? formatCents(output.annualSummaries[0].preTaxIncome) : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-400 dark:text-zinc-500 uppercase">Break-even</p>
                    <p className="text-xs font-mono font-semibold text-gray-800 dark:text-gray-200">
                      {formatBreakEven(output.roiMetrics.breakEvenMonth)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-400 dark:text-zinc-500 uppercase">5yr ROI</p>
                    <p className="text-xs font-mono font-semibold text-gray-800 dark:text-gray-200">
                      {formatROI(output.roiMetrics.fiveYearROIPct)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-gray-400 dark:text-zinc-500">
                  Start editing your plan to see projections here
                </p>
              )}
            </div>
          </div>

          {allDefaults && (
            <p className="text-xs text-muted-foreground italic mt-2" data-testid="widget-defaults-note">
              Your plan is using all brand default values. Edit inputs to personalize your projections.
            </p>
          )}

          <div className="flex items-center gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setPreviewOpen(true)}
              data-testid="button-view-full-preview"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View Full Preview
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={handleGeneratePdf}
              data-testid="button-generate-pdf-dashboard"
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              {buttonLabel}
            </Button>
          </div>
        </CardContent>
      </Card>

      <DocumentPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        planId={planId}
        planName={planName}
        brandName={brandName}
        financialInputs={financialInputs}
        startupCosts={startupCosts}
        startupCostCount={startupCostCount}
      />
    </>
  );
}
