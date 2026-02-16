import { useState, useCallback, useMemo, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileText } from "lucide-react";
import { usePlanOutputs } from "@/hooks/use-plan-outputs";
import { CalloutBar } from "./statements/callout-bar";
import { SummaryTab } from "./statements/summary-tab";
import type { EngineOutput } from "@shared/financial-engine";

export type StatementTabId = "summary" | "pnl" | "balance-sheet" | "cash-flow" | "roic" | "valuation" | "audit";

interface FinancialStatementsProps {
  planId: string;
  defaultTab?: StatementTabId;
  onBack?: () => void;
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

export function FinancialStatements({ planId, defaultTab = "summary", onBack }: FinancialStatementsProps) {
  const { output, isLoading, isFetching, error, invalidateOutputs } = usePlanOutputs(planId);
  const [activeTab, setActiveTab] = useState<StatementTabId>(defaultTab);
  const isWide = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleNavigateToTab = useCallback((tab: string, _scrollTo?: string) => {
    setActiveTab(tab as StatementTabId);
  }, []);

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
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as StatementTabId)}
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
              <Select value={activeTab} onValueChange={(v) => setActiveTab(v as StatementTabId)}>
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
            data-testid="button-generate-pdf"
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Generate Draft
          </Button>
        </div>

        <CalloutBar
          annualSummaries={output.annualSummaries}
          roiMetrics={output.roiMetrics}
        />

        <div className="flex-1 overflow-auto">
          <div className="p-4">
            <TabsContent value="summary" className="mt-0">
              <SummaryTab output={output} onNavigateToTab={handleNavigateToTab} />
            </TabsContent>

            <TabsContent value="pnl" className="mt-0">
              <PlaceholderTab name="P&L Statement" description="Detailed profit & loss breakdown with all revenue and expense lines." />
            </TabsContent>

            <TabsContent value="balance-sheet" className="mt-0">
              <PlaceholderTab name="Balance Sheet" description="Assets, liabilities, and equity breakdown by year." />
            </TabsContent>

            <TabsContent value="cash-flow" className="mt-0">
              <PlaceholderTab name="Cash Flow Statement" description="Operating, investing, and financing cash flows." />
            </TabsContent>

            <TabsContent value="roic" className="mt-0">
              <PlaceholderTab name="ROIC Analysis" description="Return on invested capital metrics and analysis." />
            </TabsContent>

            <TabsContent value="valuation" className="mt-0">
              <PlaceholderTab name="Valuation" description="Business valuation estimates based on EBITDA multiples." />
            </TabsContent>

            <TabsContent value="audit" className="mt-0">
              <PlaceholderTab name="Audit / Integrity Checks" description="Financial identity checks and data consistency verification." />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}

function PlaceholderTab({ name, description }: { name: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" data-testid={`placeholder-${name.toLowerCase().replace(/\s+/g, '-')}`}>
      <FileText className="h-10 w-10 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{name}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      <p className="text-xs text-muted-foreground mt-2">Coming in the next update.</p>
    </div>
  );
}
