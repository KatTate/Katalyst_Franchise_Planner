import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { X, FileText } from "lucide-react";
import { usePlanOutputs } from "@/hooks/use-plan-outputs";
import { isAllDefaults } from "@/lib/guardian-engine";
import { computeCompleteness, getGenerateButtonLabel } from "@/lib/plan-completeness";
import { formatCents } from "@/lib/format-currency";
import { formatROI, formatBreakEven } from "@/components/shared/summary-metrics";
import { useToast } from "@/hooks/use-toast";
import type { PlanFinancialInputs, EngineOutput } from "@shared/financial-engine";
import type { StartupCostLineItem } from "@shared/schema";

interface DocumentPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  planName: string;
  brandName?: string;
  financialInputs: PlanFinancialInputs | null;
  startupCosts: StartupCostLineItem[] | null;
  startupCostCount: number;
}

export function DocumentPreviewModal({
  open,
  onOpenChange,
  planId,
  planName,
  brandName,
  financialInputs,
  startupCosts,
  startupCostCount,
}: DocumentPreviewModalProps) {
  const { output, isLoading } = usePlanOutputs(planId);
  const { toast } = useToast();

  const completeness = useMemo(
    () => (financialInputs ? computeCompleteness(financialInputs, startupCostCount) : 0),
    [financialInputs, startupCostCount]
  );

  const showDraft = completeness < 90;

  const allDefaults = useMemo(
    () => isAllDefaults(financialInputs ?? null, startupCosts ?? null),
    [financialInputs, startupCosts]
  );

  const handleGeneratePdf = () => {
    toast({
      description: "PDF generation coming soon — this feature is being built",
      duration: 3000,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="document-preview-modal"
        className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        <DialogHeader className="flex flex-row items-center justify-between gap-2 shrink-0">
          <DialogTitle className="text-lg font-semibold">Business Plan Preview</DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleGeneratePdf}
              data-testid="button-generate-pdf"
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              {getGenerateButtonLabel(completeness)}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              data-testid="button-close-preview"
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div className="relative bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 rounded-md shadow-sm mx-auto" style={{ maxWidth: "600px", minHeight: "700px" }}>
            {showDraft && (
              <div
                data-testid="document-preview-draft-watermark"
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
              >
                <span
                  className="text-6xl font-bold text-gray-300 dark:text-zinc-700 select-none"
                  style={{ transform: "rotate(-35deg)", opacity: 0.4 }}
                >
                  DRAFT
                </span>
              </div>
            )}

            <div className="relative z-0 p-8 space-y-8">
              <div data-testid="document-preview-cover" className="text-center py-12 border-b border-gray-200 dark:border-zinc-700">
                <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-zinc-400 mb-4">Business Plan</p>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{planName || "My Business Plan"}</h1>
                {brandName && (
                  <p className="text-lg text-gray-600 dark:text-zinc-400">{brandName}</p>
                )}
                <p className="text-sm text-gray-400 dark:text-zinc-500 mt-4">{new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
              </div>

              {allDefaults && (
                <div className="text-sm text-gray-500 dark:text-zinc-400 italic bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md px-4 py-3" data-testid="document-preview-defaults-note">
                  Your plan is using all brand default values. Edit inputs to personalize your projections.
                </div>
              )}

              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : output ? (
                <FinancialContent output={output} />
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-zinc-400 text-sm">
                  Start editing your plan to see projections here.
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FinancialContent({ output }: { output: EngineOutput }) {
  const { roiMetrics, annualSummaries } = output;
  const yr1 = annualSummaries[0];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-zinc-700 pb-2">Key Financial Metrics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <MetricBlock label="Pre-Tax Income" value={yr1 ? formatCents(yr1.preTaxIncome) : "—"} subtitle="Year 1" />
          <MetricBlock label="Break-even" value={formatBreakEven(roiMetrics.breakEvenMonth)} />
          <MetricBlock label="5-Year ROI" value={formatROI(roiMetrics.fiveYearROIPct)} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-zinc-700 pb-2">Year 1 Profit & Loss Summary</h2>
        {yr1 ? (
          <table className="w-full text-sm">
            <tbody>
              <SummaryRow label="Revenue" value={formatCents(yr1.revenue)} bold />
              <SummaryRow label="Cost of Goods Sold" value={`(${formatCents(Math.abs(yr1.totalCogs))})`} />
              <SummaryRow label="Gross Profit" value={formatCents(yr1.grossProfit)} bold />
              <SummaryRow label="Gross Margin" value={`${(yr1.grossProfitPct * 100).toFixed(1)}%`} />
              <SummaryRow label="Total Operating Expenses" value={`(${formatCents(Math.abs(yr1.totalOpex))})`} />
              <SummaryRow label="EBITDA" value={formatCents(yr1.ebitda)} bold />
              <SummaryRow label="Pre-Tax Income" value={formatCents(yr1.preTaxIncome)} bold />
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 dark:text-zinc-400 text-sm">No projections available yet.</p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-zinc-700 pb-2">Cash Flow Summary</h2>
        {yr1 ? (
          <table className="w-full text-sm">
            <tbody>
              <SummaryRow label="Operating Cash Flow" value={formatCents(yr1.operatingCashFlow)} />
              <SummaryRow label="Net Cash Flow" value={formatCents(yr1.netCashFlow)} bold />
              <SummaryRow label="Ending Cash" value={formatCents(yr1.endingCash)} bold />
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 dark:text-zinc-400 text-sm">No projections available yet.</p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-zinc-700 pb-2">Break-even Analysis</h2>
        <div className="text-sm text-gray-700 dark:text-zinc-300 space-y-2">
          <p>
            Total Startup Investment: <strong className="font-mono">{formatCents(roiMetrics.totalStartupInvestment)}</strong>
          </p>
          <p>
            Break-even Point: <strong className="font-mono">{formatBreakEven(roiMetrics.breakEvenMonth)}</strong>
          </p>
          <p>
            5-Year Cumulative Cash Flow: <strong className="font-mono">{formatCents(roiMetrics.fiveYearCumulativeCashFlow)}</strong>
          </p>
          <p>
            5-Year Return on Investment: <strong className="font-mono">{formatROI(roiMetrics.fiveYearROIPct)}</strong>
          </p>
        </div>
      </section>
    </div>
  );
}

function MetricBlock({ label, value, subtitle }: { label: string; value: string; subtitle?: string }) {
  return (
    <div className="text-center">
      <p className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-xl font-bold font-mono text-gray-900 dark:text-gray-100">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 dark:text-zinc-500">{subtitle}</p>}
    </div>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <tr className={`border-b border-gray-100 dark:border-zinc-800 ${bold ? "font-semibold" : ""}`}>
      <td className="py-1.5 text-gray-700 dark:text-zinc-300">{label}</td>
      <td className="py-1.5 text-right font-mono tabular-nums text-gray-900 dark:text-gray-100">{value}</td>
    </tr>
  );
}
