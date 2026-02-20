import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { CheckCircle, AlertTriangle, Info, FileText, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePlanOutputs } from "@/hooks/use-plan-outputs";
import { computeGuardianState, isAllDefaults } from "@/lib/guardian-engine";
import { formatFinancialValue, formatFinancialDelta, type FinancialFormat } from "@/components/shared/financial-value";
import { formatBreakEven } from "@/components/shared/summary-metrics";
import type { EngineOutput, PlanFinancialInputs, StartupCostLineItem } from "@shared/financial-engine";
import type { GuardianLevel, GuardianIndicator } from "@/lib/guardian-engine";
import type { StatementTabId } from "@/components/planning/financial-statements";

interface ImpactStripProps {
  planId: string;
  activeSection: string | null;
  financialInputs: PlanFinancialInputs | null;
  startupCosts: StartupCostLineItem[] | null;
  onNavigateToStatements: (tab?: StatementTabId) => void;
  onOpenDocumentPreview: () => void;
}

interface MetricDef {
  key: string;
  label: string;
  getValue: (output: EngineOutput) => number | null;
  financialFormat: FinancialFormat;
}

const METRICS: Record<string, MetricDef> = {
  "pre-tax-income": {
    key: "pre-tax-income",
    label: "Pre-Tax Income",
    getValue: (o) => o.annualSummaries[0]?.preTaxIncome ?? null,
    financialFormat: "currency",
  },
  "break-even": {
    key: "break-even",
    label: "Break-even",
    getValue: (o) => o.roiMetrics.breakEvenMonth,
    financialFormat: "months",
  },
  "gross-margin": {
    key: "gross-margin",
    label: "Gross Margin %",
    getValue: (o) => o.annualSummaries[0]?.grossProfitPct ?? null,
    financialFormat: "pct",
  },
  "five-yr-roi": {
    key: "five-yr-roi",
    label: "5yr ROI",
    getValue: (o) => o.roiMetrics.fiveYearROIPct,
    financialFormat: "pct",
  },
  ebitda: {
    key: "ebitda",
    label: "EBITDA",
    getValue: (o) => o.annualSummaries[0]?.ebitda ?? null,
    financialFormat: "currency",
  },
  "labor-efficiency": {
    key: "labor-efficiency",
    label: "Labor %",
    getValue: (o) => {
      const s = o.annualSummaries[0];
      if (!s || s.revenue === 0) return null;
      return s.directLabor / s.revenue;
    },
    financialFormat: "pct",
  },
  "cash-position": {
    key: "cash-position",
    label: "Cash (Low)",
    getValue: (o) => {
      if (!o.monthlyProjections.length) return null;
      return Math.min(...o.monthlyProjections.map((m) => m.endingCash));
    },
    financialFormat: "currency",
  },
  "debt-service-coverage": {
    key: "debt-service-coverage",
    label: "Debt Coverage",
    getValue: (o) => {
      const s = o.annualSummaries[0];
      if (!s || s.interestExpense === 0) return null;
      return s.ebitda / Math.abs(s.interestExpense);
    },
    financialFormat: "multiplier",
  },
  "total-investment": {
    key: "total-investment",
    label: "Total Investment",
    getValue: (o) => o.roiMetrics.totalStartupInvestment,
    financialFormat: "currency",
  },
};

const SECTION_METRICS: Record<string, string[]> = {
  revenue: ["pre-tax-income", "break-even", "gross-margin", "five-yr-roi"],
  operatingCosts: ["ebitda", "pre-tax-income", "labor-efficiency"],
  financing: ["cash-position", "debt-service-coverage", "break-even"],
  startupCosts: ["total-investment", "five-yr-roi", "break-even"],
};

const DEFAULT_METRICS = ["pre-tax-income", "break-even", "gross-margin", "five-yr-roi"];

const SECTION_DEEP_LINK: Record<string, { label: string; tab: StatementTabId }> = {
  revenue: { label: "View Full P&L", tab: "pnl" },
  operatingCosts: { label: "View Full P&L", tab: "pnl" },
  financing: { label: "View Full Cash Flow", tab: "cash-flow" },
  startupCosts: { label: "View Full Summary", tab: "summary" },
  startupCapital: { label: "View Full Summary", tab: "summary" },
};

const DEFAULT_DEEP_LINK = { label: "View Full Summary", tab: "summary" as StatementTabId };

const LEVEL_STYLES: Record<GuardianLevel, { dot: string; icon: typeof CheckCircle }> = {
  healthy: { dot: "bg-guardian-healthy", icon: CheckCircle },
  attention: { dot: "bg-guardian-attention", icon: AlertTriangle },
  concerning: { dot: "bg-guardian-concerning", icon: Info },
};

export function ImpactStrip({
  planId,
  activeSection,
  financialInputs,
  startupCosts,
  onNavigateToStatements,
  onOpenDocumentPreview,
}: ImpactStripProps) {
  const { output, isFetching, error } = usePlanOutputs(planId);

  const metricKeys = useMemo(() => {
    if (activeSection && SECTION_METRICS[activeSection]) {
      return SECTION_METRICS[activeSection];
    }
    return DEFAULT_METRICS;
  }, [activeSection]);

  const deepLink = useMemo(() => {
    if (activeSection && SECTION_DEEP_LINK[activeSection]) {
      return SECTION_DEEP_LINK[activeSection];
    }
    return DEFAULT_DEEP_LINK;
  }, [activeSection]);

  const guardianState = useMemo(() => {
    if (!output) return null;
    return computeGuardianState(output, undefined, financialInputs, startupCosts);
  }, [output, financialInputs, startupCosts]);

  const prevValues = useRef<Record<string, number | null>>({});
  const [deltas, setDeltas] = useState<Record<string, number>>({});
  const deltaTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const settledRef = useRef<Record<string, number | null>>({});

  useEffect(() => {
    if (!output) return;

    const currentValues: Record<string, number | null> = {};
    for (const key of Object.keys(METRICS)) {
      currentValues[key] = METRICS[key].getValue(output);
    }

    const prev = prevValues.current;
    const hasPrev = Object.keys(prev).length > 0;

    if (hasPrev) {
      const newDeltas: Record<string, number> = {};
      for (const key of Object.keys(currentValues)) {
        const cur = currentValues[key];
        const settled = settledRef.current[key] ?? null;
        if (cur !== null && settled !== null && cur !== settled) {
          newDeltas[key] = cur - settled;
        }
      }

      if (Object.keys(newDeltas).length > 0) {
        setDeltas((d) => ({ ...d, ...newDeltas }));
        for (const key of Object.keys(newDeltas)) {
          if (deltaTimers.current[key]) clearTimeout(deltaTimers.current[key]);
          deltaTimers.current[key] = setTimeout(() => {
            setDeltas((d) => {
              const next = { ...d };
              delete next[key];
              return next;
            });
            settledRef.current[key] = currentValues[key];
          }, 3000);
        }
      }
    } else {
      settledRef.current = { ...currentValues };
    }

    prevValues.current = currentValues;
  }, [output]);

  useEffect(() => {
    return () => {
      for (const timer of Object.values(deltaTimers.current)) {
        clearTimeout(timer);
      }
    };
  }, []);

  const prevGuardianLevels = useRef<Record<string, GuardianLevel>>({});
  const [pulsingDots, setPulsingDots] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!guardianState) return;
    const changed = new Set<string>();
    const currentLevels: Record<string, GuardianLevel> = {};

    guardianState.indicators.forEach((ind) => {
      currentLevels[ind.id] = ind.level;
      const prev = prevGuardianLevels.current[ind.id];
      if (prev && prev !== ind.level) {
        changed.add(ind.id);
      }
    });

    prevGuardianLevels.current = currentLevels;
    if (changed.size === 0) return;

    setPulsingDots(changed);
    setTimeout(() => setPulsingDots(new Set()), 650);
  }, [guardianState]);

  const isLoading = !output && isFetching;
  const hasError = !!error;

  return (
    <div
      data-testid="impact-strip"
      className="sticky bottom-0 z-10 border-t bg-card px-4 py-2.5 shrink-0"
    >
      <div className="flex items-center gap-3 flex-wrap">
        {metricKeys.map((key) => {
          const def = METRICS[key];
          if (!def) return null;
          const val = output ? def.getValue(output) : null;
          const delta = deltas[key];
          const hasDelta = delta !== undefined && delta !== 0;

          return (
            <div
              key={key}
              data-testid={`impact-metric-${key}`}
              className="flex flex-col min-w-0"
            >
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide truncate">
                {def.label}
              </span>
              <div className="flex items-baseline gap-1.5">
                {isLoading ? (
                  <Skeleton className="h-5 w-16" />
                ) : hasError ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-sm font-mono text-muted-foreground">—</span>
                    </TooltipTrigger>
                    <TooltipContent>Unable to calculate projections</TooltipContent>
                  </Tooltip>
                ) : (
                  <>
                    <span
                      className="text-sm font-semibold font-mono tabular-nums"
                      style={{ opacity: isFetching ? 0.5 : 1 }}
                    >
                      {key === "break-even" ? formatBreakEven(val) : formatFinancialValue(val, def.financialFormat)}
                    </span>
                    {hasDelta && (
                      <span
                        className={`text-xs font-mono tabular-nums animate-in fade-in-0 duration-200 ${
                          delta > 0 ? "text-guardian-healthy" : "text-guardian-attention"
                        }`}
                      >
                        {formatFinancialDelta(delta, def.financialFormat)}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}

        <div className="flex-1" />

        {guardianState && (
          <div className="flex items-center gap-1.5">
            {guardianState.indicators.map((ind) => {
              const style = LEVEL_STYLES[ind.level];
              const Icon = style.icon;
              const isPulsing = pulsingDots.has(ind.id);

              return (
                <Tooltip key={ind.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      data-testid={`impact-guardian-dot-${ind.id}`}
                      className={`flex items-center justify-center w-6 h-6 rounded-full cursor-pointer transition-colors ${style.dot}/20 hover-elevate${isPulsing ? " guardian-pulse" : ""}`}
                      onClick={() => {
                        const tabMap: Record<string, StatementTabId> = {
                          "break-even": "summary",
                          roi: "roic",
                          cash: "cash-flow",
                        };
                        onNavigateToStatements(tabMap[ind.id] ?? "summary");
                      }}
                      aria-label={`${ind.label}: ${ind.value}`}
                    >
                      <Icon className={`h-3 w-3 ${style.dot.replace("bg-", "text-")}`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{ind.label}: {ind.value}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}

        <button
          type="button"
          data-testid="impact-deep-link"
          className="text-xs text-primary flex items-center gap-0.5 hover:underline shrink-0"
          onClick={() => onNavigateToStatements(deepLink.tab)}
        >
          {deepLink.label} <ArrowRight className="h-3 w-3" />
        </button>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              data-testid="impact-doc-preview-icon"
              className="shrink-0 p-1 rounded-md hover-elevate"
              onClick={onOpenDocumentPreview}
              aria-label="Document preview"
            >
              <FileText className="h-4 w-4 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Preview business plan document</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
