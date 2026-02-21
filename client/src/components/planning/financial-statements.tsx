import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileText } from "lucide-react";
import { usePlanOutputs } from "@/hooks/use-plan-outputs";
import { CalloutBar } from "./statements/callout-bar";
import { GuardianBar } from "./statements/guardian-bar";
import { ScenarioBar } from "./statements/scenario-bar";
import { ScenarioSummaryCard } from "./statements/scenario-summary-card";
import { computeGuardianState } from "@/lib/guardian-engine";
import { computeCompleteness, getGenerateButtonLabel } from "@/lib/plan-completeness";
import { SummaryTab } from "./statements/summary-tab";
import { PnlTab } from "./statements/pnl-tab";
import { BalanceSheetTab } from "./statements/balance-sheet-tab";
import { CashFlowTab } from "./statements/cash-flow-tab";
import { RoicTab } from "./statements/roic-tab";
import { ValuationTab } from "./statements/valuation-tab";
import { AuditTab } from "./statements/audit-tab";
import { parseFieldInput } from "@/lib/field-metadata";
import { updateFieldValue } from "@shared/plan-initialization";
import { computeScenarioOutputs, type ScenarioOutputs } from "@/lib/scenario-engine";
import { useToast } from "@/hooks/use-toast";
import type { EngineOutput, PlanFinancialInputs, FinancialFieldValue } from "@shared/financial-engine";
import type { FormatType } from "@/lib/field-metadata";
import type { Plan } from "@shared/schema";

export type StatementTabId = "summary" | "pnl" | "balance-sheet" | "cash-flow" | "roic" | "valuation" | "audit";

interface FinancialStatementsProps {
  planId: string;
  defaultTab?: StatementTabId;
  plan?: Plan | null;
  queueSave?: (data: Partial<Plan>) => void;
  isSaving?: boolean;
  brandName?: string;
  startupCostCount?: number;
}

const TAB_DEFS: { id: StatementTabId; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "pnl", label: "P&L" },
  { id: "balance-sheet", label: "Balance Sheet" },
  { id: "cash-flow", label: "Cash Flow" },
  { id: "roic", label: "ROIC" },
  { id: "valuation", label: "Valuation" },
  { id: "audit", label: "Audit" },
];

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

export function FinancialStatements({ planId, defaultTab = "summary", plan, queueSave, isSaving = false, brandName, startupCostCount = 0 }: FinancialStatementsProps) {
  const { output, isLoading, isFetching, error, invalidateOutputs } = usePlanOutputs(planId);
  const [activeTab, setActiveTab] = useState<StatementTabId>(defaultTab);
  const isWide = useMediaQuery("(min-width: 1024px)");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositions = useRef<Record<string, number>>({});
  const pendingScrollTo = useRef<string | null>(null);
  const { toast } = useToast();

  const financialInputs = plan?.financialInputs ?? null;
  const startupCosts = plan?.startupCosts ?? null;

  const pdfButtonLabel = useMemo(() => {
    if (!financialInputs) return "Generate Draft";
    const completeness = computeCompleteness(financialInputs as PlanFinancialInputs, startupCostCount);
    return getGenerateButtonLabel(completeness);
  }, [financialInputs, startupCostCount]);

  const guardianState = useMemo(() => {
    if (!output) return null;
    return computeGuardianState(output, undefined, financialInputs, startupCosts);
  }, [output, financialInputs, startupCosts]);

  const [comparisonActive, setComparisonActive] = useState(false);

  const scenarioOutputs: ScenarioOutputs | null = useMemo(() => {
    if (!comparisonActive || !financialInputs || !startupCosts) return null;
    try {
      return computeScenarioOutputs(financialInputs, startupCosts);
    } catch {
      return null;
    }
  }, [comparisonActive, financialInputs, startupCosts]);

  const handleActivateComparison = useCallback(() => {
    setComparisonActive(true);
    toast({
      description: "Comparison view available at annual level. Drill-down is disabled during comparison.",
      duration: 3000,
    });
  }, [toast]);

  const handleDeactivateComparison = useCallback(() => {
    setComparisonActive(false);
  }, []);

  const handleCellEdit = useCallback(
    (category: string, fieldName: string, rawInput: string, inputFormat: FormatType) => {
      if (!financialInputs || !queueSave) return;
      const parsedValue = parseFieldInput(rawInput, inputFormat);
      if (isNaN(parsedValue)) return;
      const categoryObj = financialInputs[category as keyof PlanFinancialInputs];
      if (!categoryObj) return;
      const field = categoryObj[fieldName as keyof typeof categoryObj] as FinancialFieldValue;
      if (!field || parsedValue === field.currentValue) return;
      const updatedField = updateFieldValue(field, parsedValue, new Date().toISOString());
      const updatedInputs: PlanFinancialInputs = {
        ...financialInputs,
        [category]: {
          ...categoryObj,
          [fieldName]: updatedField,
        },
      };
      queueSave({ financialInputs: updatedInputs });
    },
    [financialInputs, queueSave]
  );

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const saveScrollPosition = useCallback((tabId: string) => {
    if (scrollContainerRef.current) {
      scrollPositions.current[tabId] = scrollContainerRef.current.scrollTop;
    }
  }, []);

  const restoreScrollPosition = useCallback((tabId: string) => {
    if (scrollContainerRef.current) {
      const saved = scrollPositions.current[tabId];
      scrollContainerRef.current.scrollTop = saved ?? 0;
    }
  }, []);

  const handleTabChange = useCallback((newTab: string) => {
    saveScrollPosition(activeTab);
    setActiveTab(newTab as StatementTabId);
    requestAnimationFrame(() => {
      if (pendingScrollTo.current) {
        const target = document.querySelector(`[data-testid="${pendingScrollTo.current}"]`);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          pendingScrollTo.current = null;
          return;
        }
        pendingScrollTo.current = null;
      }
      restoreScrollPosition(newTab);
    });
  }, [activeTab, saveScrollPosition, restoreScrollPosition]);

  const handleNavigateToTab = useCallback((tab: string, scrollTo?: string) => {
    if (scrollTo) {
      pendingScrollTo.current = scrollTo;
    }
    handleTabChange(tab);
  }, [handleTabChange]);

  if (isLoading) {
    return (
      <div data-testid="financial-statements" className="h-full flex flex-col">
        <div className="border-b px-4 py-3">
          <Skeleton className="h-10 w-full max-w-[600px]" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    const is400 = error.message?.includes("400");
    return (
      <div data-testid="financial-statements" className="h-full flex flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-muted-foreground mb-3">
          {is400
            ? "Enter your first values to see your financial statements."
            : "We couldn't load your projections. Your data is safe — please try refreshing."}
        </p>
        {!is400 && (
          <Button variant="outline" size="sm" onClick={() => invalidateOutputs()}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (!output) {
    return (
      <div data-testid="financial-statements" className="h-full flex flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Enter your first values to see your financial statements.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="financial-statements" className="h-full flex flex-col">
      {guardianState && (
        <GuardianBar
          state={guardianState}
          onNavigate={handleNavigateToTab}
          brandName={brandName}
        />
      )}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex flex-col h-full"
      >
        <div className="border-b px-4 flex items-center gap-3 shrink-0">
          {isWide ? (
            <TabsList className="bg-transparent h-auto p-0 gap-0">
              {TAB_DEFS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2.5 text-sm"
                  data-testid={`tab-${tab.id}`}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          ) : (
            <div className="py-2 flex-1">
              <Select value={activeTab} onValueChange={handleTabChange}>
                <SelectTrigger className="w-full" data-testid="select-statement-tab">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TAB_DEFS.map((tab) => (
                    <SelectItem key={tab.id} value={tab.id} data-testid={`select-option-${tab.id}`}>
                      {tab.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 my-2"
            data-testid="button-generate-pdf-reports"
            onClick={() => toast({ description: "PDF generation coming soon — this feature is being built", duration: 3000 })}
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            {pdfButtonLabel}
          </Button>
        </div>

        <ScenarioBar
          comparisonActive={comparisonActive}
          onActivateComparison={handleActivateComparison}
          onDeactivateComparison={handleDeactivateComparison}
        />

        <CalloutBar
          annualSummaries={output.annualSummaries}
          roiMetrics={output.roiMetrics}
          activeTab={activeTab}
          output={output}
          financialInputs={financialInputs}
          brandName={brandName}
        />

        <div className="flex-1 overflow-auto" ref={scrollContainerRef} data-testid="statements-scroll-container">
          <div className="p-4">
            {comparisonActive && scenarioOutputs && (
              <div className="mb-4">
                <ScenarioSummaryCard scenarioOutputs={scenarioOutputs} />
              </div>
            )}

            <TabsContent value="summary" className="mt-0">
              <SummaryTab
                output={output}
                onNavigateToTab={handleNavigateToTab}
                scenarioOutputs={scenarioOutputs}
              />
            </TabsContent>

            <TabsContent value="pnl" className="mt-0">
              <PnlTab
                output={output}
                financialInputs={financialInputs}
                onCellEdit={queueSave ? handleCellEdit : undefined}
                isSaving={isSaving}
                scenarioOutputs={scenarioOutputs}
                brandName={brandName}
              />
            </TabsContent>

            <TabsContent value="balance-sheet" className="mt-0">
              <BalanceSheetTab output={output} scenarioOutputs={scenarioOutputs} />
            </TabsContent>

            <TabsContent value="cash-flow" className="mt-0">
              <CashFlowTab output={output} scenarioOutputs={scenarioOutputs} />
            </TabsContent>

            <TabsContent value="roic" className="mt-0">
              <RoicTab output={output} scenarioOutputs={scenarioOutputs} />
            </TabsContent>

            <TabsContent value="valuation" className="mt-0">
              <ValuationTab output={output} scenarioOutputs={scenarioOutputs} />
            </TabsContent>

            <TabsContent value="audit" className="mt-0">
              <AuditTab output={output} onNavigateToTab={handleNavigateToTab} comparisonActive={comparisonActive} />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
