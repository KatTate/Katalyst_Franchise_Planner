import { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, ArrowRight, Minus, RotateCcw, Save, Trash2, Eye, EyeOff, Upload, Pencil } from "lucide-react";
import { usePlan } from "@/hooks/use-plan";
import { formatCents } from "@/lib/format-currency";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  computeSensitivityOutputs,
  computeComparisonOutput,
  SLIDER_CONFIGS,
  DEFAULT_SLIDER_VALUES,
  type SliderValues,
  type SliderConfig,
  type SensitivityOutputs,
  type EngineOutput,
} from "@/lib/sensitivity-engine";
import type { PlanFinancialInputs } from "@shared/financial-engine";
import type { StartupCostLineItem } from "@shared/financial-engine";
import type { WhatIfScenario } from "@shared/schema";
import { SensitivityCharts } from "@/components/planning/sensitivity-charts";

interface WhatIfPlaygroundProps {
  planId: string;
}

// ─── Delta Card Formatting ──────────────────────────────────────────────

function formatCompactDollars(cents: number): string {
  const dollars = cents / 100;
  const absDollars = Math.abs(dollars);
  const prefix = dollars < 0 ? "-$" : "$";
  if (absDollars >= 1000) {
    return `${prefix}${Math.round(absDollars / 1000)}K`;
  }
  return `${prefix}${Math.round(absDollars)}`;
}

function formatDeltaDollars(deltaCents: number): string {
  const dollars = deltaCents / 100;
  const absDollars = Math.abs(dollars);
  const sign = dollars >= 0 ? "+" : "-";
  if (absDollars >= 1000) {
    return `${sign}$${Math.round(absDollars / 1000)}K`;
  }
  return `${sign}$${Math.round(absDollars)}`;
}

interface DeltaMetricConfig {
  key: string;
  label: string;
  testId: string;
  getBase: (o: SensitivityOutputs) => number | null;
  getCurrent: (o: SensitivityOutputs) => number | null;
  formatValue: (v: number | null) => string;
  formatDelta: (base: number | null, current: number | null) => string;
  higherIsBetter: boolean;
}

const DELTA_METRICS: DeltaMetricConfig[] = [
  {
    key: "break-even",
    label: "Break-Even",
    testId: "sensitivity-metric-delta-break-even",
    getBase: (o) => o.base.roiMetrics.breakEvenMonth,
    getCurrent: (o) => o.current.roiMetrics.breakEvenMonth,
    formatValue: (v) => (v === null ? "—" : `Mo ${v}`),
    formatDelta: (base, current) => {
      if (base === null || current === null) return "N/A";
      const diff = current - base;
      if (diff === 0) return "0";
      const sign = diff > 0 ? "+" : "";
      return `${sign}${diff} mo`;
    },
    higherIsBetter: false,
  },
  {
    key: "revenue",
    label: "Year 1 Revenue",
    testId: "sensitivity-metric-delta-revenue",
    getBase: (o) => o.base.annualSummaries[0]?.revenue ?? null,
    getCurrent: (o) => o.current.annualSummaries[0]?.revenue ?? null,
    formatValue: (v) => (v === null ? "—" : formatCompactDollars(v)),
    formatDelta: (base, current) => {
      if (base === null || current === null) return "N/A";
      const diff = current - base;
      if (diff === 0) return "$0";
      return formatDeltaDollars(diff);
    },
    higherIsBetter: true,
  },
  {
    key: "roi",
    label: "5-Year ROI",
    testId: "sensitivity-metric-delta-roi",
    getBase: (o) => o.base.roiMetrics.fiveYearROIPct ?? null,
    getCurrent: (o) => o.current.roiMetrics.fiveYearROIPct ?? null,
    formatValue: (v) => (v === null ? "—" : `${(v * 100).toFixed(0)}%`),
    formatDelta: (base, current) => {
      if (base === null || current === null) return "N/A";
      const diffPct = (current - base) * 100;
      if (Math.round(diffPct) === 0) return "0%";
      const sign = diffPct > 0 ? "+" : "";
      return `${sign}${Math.round(diffPct)}%`;
    },
    higherIsBetter: true,
  },
  {
    key: "cash",
    label: "Year 5 Cash",
    testId: "sensitivity-metric-delta-cash",
    getBase: (o) => o.base.annualSummaries[4]?.endingCash ?? null,
    getCurrent: (o) => o.current.annualSummaries[4]?.endingCash ?? null,
    formatValue: (v) => (v === null ? "—" : formatCompactDollars(v)),
    formatDelta: (base, current) => {
      if (base === null || current === null) return "N/A";
      const diff = current - base;
      if (diff === 0) return "$0";
      return formatDeltaDollars(diff);
    },
    higherIsBetter: true,
  },
];

type DeltaColor = "green" | "amber" | "neutral";

function getDeltaColor(
  base: number | null,
  current: number | null,
  higherIsBetter: boolean,
): DeltaColor {
  if (base === null || current === null) return "neutral";
  const diff = current - base;
  if (diff === 0) return "neutral";
  const isPositive = diff > 0;
  const isDesirable = higherIsBetter ? isPositive : !isPositive;
  return isDesirable ? "green" : "amber";
}

const deltaColorClasses: Record<DeltaColor, string> = {
  green: "text-green-600 dark:text-green-500",
  amber: "text-amber-500 dark:text-amber-400",
  neutral: "text-muted-foreground",
};

interface ComputedDeltaMetric {
  config: DeltaMetricConfig;
  baseVal: number | null;
  currentVal: number | null;
  baseFormatted: string;
  currentFormatted: string;
  deltaStr: string;
  color: DeltaColor;
}

function MetricDeltaCard({ metric }: { metric: ComputedDeltaMetric }) {
  return (
    <div
      className="rounded-lg border bg-card p-3 space-y-1"
      data-testid={metric.config.testId}
    >
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {metric.config.label}
      </div>
      <div className="flex items-center gap-1.5 text-base font-semibold font-mono tabular-nums">
        <span>{metric.baseFormatted}</span>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span>{metric.currentFormatted}</span>
      </div>
      <div className={`text-sm font-mono tabular-nums ${deltaColorClasses[metric.color]}`}>
        ({metric.deltaStr})
      </div>
    </div>
  );
}

function MetricDeltaCardStrip({
  outputs,
  hasInteractedWithSlider,
  comparisonOutput,
  comparisonName,
}: {
  outputs: SensitivityOutputs;
  hasInteractedWithSlider: boolean;
  comparisonOutput?: EngineOutput | null;
  comparisonName?: string | null;
}) {
  const computedMetrics = useMemo<ComputedDeltaMetric[]>(() => {
    return DELTA_METRICS.map((config) => {
      const baseVal = config.getBase(outputs);
      const currentVal = config.getCurrent(outputs);
      return {
        config,
        baseVal,
        currentVal,
        baseFormatted: config.formatValue(baseVal),
        currentFormatted: config.formatValue(currentVal),
        deltaStr: config.formatDelta(baseVal, currentVal),
        color: getDeltaColor(baseVal, currentVal, config.higherIsBetter),
      };
    });
  }, [outputs]);

  const comparisonMetricValues = useMemo(() => {
    if (!comparisonOutput) return null;
    return DELTA_METRICS.map((config) => {
      const fakeOutputs: SensitivityOutputs = { base: outputs.base, current: comparisonOutput };
      const val = config.getCurrent(fakeOutputs);
      return {
        key: config.key,
        formatted: config.formatValue(val),
        deltaStr: config.formatDelta(config.getBase(outputs), val),
        color: getDeltaColor(config.getBase(outputs), val, config.higherIsBetter),
      };
    });
  }, [comparisonOutput, outputs]);

  return (
    <div className="rounded-xl bg-muted/30 p-4 space-y-3" data-testid="sensitivity-delta-strip">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {computedMetrics.map((metric, i) => (
          <div key={metric.config.key}>
            <MetricDeltaCard metric={metric} />
            {comparisonMetricValues && (
              <div
                className="mt-1 px-3 py-1.5 rounded-md border border-dashed border-chart-4/40 bg-chart-4/5 text-xs"
                data-testid={`comparison-metric-${metric.config.key}`}
              >
                <span className="text-muted-foreground">{comparisonName ?? "Comparison"}: </span>
                <span className="font-mono tabular-nums font-semibold">{comparisonMetricValues[i].formatted}</span>
                <span className={`ml-1 font-mono tabular-nums ${deltaColorClasses[comparisonMetricValues[i].color]}`}>
                  ({comparisonMetricValues[i].deltaStr})
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      {!hasInteractedWithSlider && (
        <p
          className="text-sm text-muted-foreground text-center"
          data-testid="sensitivity-delta-helper-text"
        >
          Move a slider to see how it changes your metrics.
        </p>
      )}
    </div>
  );
}

// ─── Slider Utilities ───────────────────────────────────────────────────

function sumY1Monthly(baseOutput: SensitivityOutputs["base"], field: "marketing" | "facilities"): number {
  let total = 0;
  for (const mp of baseOutput.monthlyProjections) {
    if (mp.year === 1) total += mp[field];
  }
  return Math.round(total);
}

function computeSliderDollarImpact(
  key: keyof SliderValues,
  pct: number,
  baseOutput: SensitivityOutputs["base"]
): number {
  const y1 = baseOutput.annualSummaries[0];
  if (!y1) return 0;
  switch (key) {
    case "revenue":
      return Math.round((pct / 100) * y1.revenue);
    case "cogs":
      return Math.round((pct / 100) * y1.revenue);
    case "labor":
      return Math.round((pct / 100) * y1.directLabor);
    case "marketing":
      return Math.round((pct / 100) * sumY1Monthly(baseOutput, "marketing"));
    case "facilities":
      return Math.round((pct / 100) * sumY1Monthly(baseOutput, "facilities"));
  }
}

function formatSliderImpact(key: keyof SliderValues, pct: number, baseOutput: SensitivityOutputs["base"]): string {
  const impact = computeSliderDollarImpact(key, pct, baseOutput);
  if (impact === 0 && pct === 0) return "$0/yr";
  const sign = impact >= 0 ? "+" : "";
  return `${sign}${formatCents(impact)}/yr`;
}

function formatSliderPct(pct: number, unit: string): string {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}${unit}`;
}

function SensitivitySliderRow({
  config,
  value,
  onChange,
  baseOutput,
  disabled,
}: {
  config: SliderConfig;
  value: number;
  onChange: (key: keyof SliderValues, val: number) => void;
  baseOutput: SensitivityOutputs["base"] | null;
  disabled: boolean;
}) {
  const [inputValue, setInputValue] = useState(String(value));

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const handleSliderChange = useCallback(
    ([v]: number[]) => {
      onChange(config.key, v);
    },
    [config.key, onChange]
  );

  const handleInputBlur = useCallback(() => {
    const parsed = parseFloat(inputValue);
    if (isNaN(parsed)) {
      setInputValue(String(value));
      return;
    }
    const mathMin = config.key === "cogs" ? -Infinity : -100;
    const clamped = Math.max(mathMin, parsed);
    onChange(config.key, clamped);
    setInputValue(String(clamped));
  }, [inputValue, value, config, onChange]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        (e.target as HTMLInputElement).blur();
      }
    },
    []
  );

  const impactDisplay = baseOutput ? formatSliderImpact(config.key, value, baseOutput) : "—";
  const pctDisplay = formatSliderPct(value, config.unit);

  const sliderDisplayValue = Math.max(config.min, Math.min(config.max, value));

  return (
    <div className="grid grid-cols-[140px_1fr_60px_120px_80px] gap-3 items-center" data-testid={`slider-row-${config.key}`}>
      <label className="text-sm font-medium text-foreground truncate">{config.label}</label>
      <Slider
        min={config.min}
        max={config.max}
        step={config.step}
        value={[sliderDisplayValue]}
        onValueChange={handleSliderChange}
        disabled={disabled}
        data-testid={`slider-${config.key}`}
      />
      <span className="text-sm font-mono tabular-nums text-center font-semibold" data-testid={`slider-pct-${config.key}`}>
        {pctDisplay}
      </span>
      <span className="text-xs font-mono tabular-nums text-muted-foreground text-right" data-testid={`slider-impact-${config.key}`}>
        {impactDisplay}
      </span>
      <Input
        type="number"
        step={config.step}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleInputBlur}
        onKeyDown={handleInputKeyDown}
        disabled={disabled}
        className="h-7 text-xs text-center font-mono px-1"
        data-testid={`input-${config.key}`}
      />
    </div>
  );
}

// ─── Scenario Helpers ────────────────────────────────────────────────────

function slidersMatch(a: SliderValues, b: SliderValues): boolean {
  return (
    a.revenue === b.revenue &&
    a.cogs === b.cogs &&
    a.labor === b.labor &&
    a.marketing === b.marketing &&
    a.facilities === b.facilities
  );
}

export function WhatIfPlayground({ planId }: WhatIfPlaygroundProps) {
  const { plan, isLoading, error } = usePlan(planId);
  const { toast } = useToast();
  const [sliderValues, setSliderValues] = useState<SliderValues>({ ...DEFAULT_SLIDER_VALUES });
  const [debouncedSliders, setDebouncedSliders] = useState<SliderValues>({ ...DEFAULT_SLIDER_VALUES });
  const [hasInteractedWithSlider, setHasInteractedWithSlider] = useState(false);

  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveDialogName, setSaveDialogName] = useState("");
  const [saveDialogMode, setSaveDialogMode] = useState<"create" | "rename">("create");
  const [isSaving, setIsSaving] = useState(false);
  const [saveDialogError, setSaveDialogError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [comparisonScenarioId, setComparisonScenarioId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSliders({ ...sliderValues });
    }, 350);
    return () => clearTimeout(timer);
  }, [sliderValues]);

  const handleSliderChange = useCallback((key: keyof SliderValues, val: number) => {
    setSliderValues((prev) => ({ ...prev, [key]: val }));
    setHasInteractedWithSlider(true);
  }, []);

  const handleResetSliders = useCallback(() => {
    setSliderValues({ ...DEFAULT_SLIDER_VALUES });
    setActiveScenarioId(null);
  }, []);

  const financialInputs = plan?.financialInputs as PlanFinancialInputs | null | undefined;
  const startupCostsData = (plan?.startupCosts ?? []) as StartupCostLineItem[];
  const scenarios: WhatIfScenario[] = useMemo(() => {
    const raw = (plan?.whatIfScenarios as WhatIfScenario[] | null) ?? [];
    return [...raw].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [plan?.whatIfScenarios]);

  const hasAdjustment = Object.values(sliderValues).some((v) => v !== 0);

  const activeScenario = activeScenarioId
    ? scenarios.find((s) => s.id === activeScenarioId) ?? null
    : null;

  const hasUnsavedChanges = activeScenario
    ? !slidersMatch(sliderValues, activeScenario.sliderValues as SliderValues)
    : hasAdjustment;

  const comparisonScenario = comparisonScenarioId
    ? scenarios.find((s) => s.id === comparisonScenarioId) ?? null
    : null;

  const scenarioOutputs = useMemo<SensitivityOutputs | null>(() => {
    if (!financialInputs) return null;
    return computeSensitivityOutputs(financialInputs, startupCostsData, debouncedSliders);
  }, [financialInputs, startupCostsData, debouncedSliders]);

  const comparisonOutput = useMemo<EngineOutput | null>(() => {
    if (!financialInputs || !comparisonScenario) return null;
    return computeComparisonOutput(
      financialInputs,
      startupCostsData,
      comparisonScenario.sliderValues as SliderValues,
    );
  }, [financialInputs, startupCostsData, comparisonScenario]);

  const invalidatePlan = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/plans", planId] });
  }, [planId]);

  const handleLoadScenario = useCallback((scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario) return;
    setSliderValues({ ...(scenario.sliderValues as SliderValues) });
    setActiveScenarioId(scenarioId);
    setHasInteractedWithSlider(true);
  }, [scenarios]);

  const handleSaveNew = useCallback(() => {
    setSaveDialogMode("create");
    setSaveDialogName("");
    setSaveDialogError(null);
    setSaveDialogOpen(true);
  }, []);

  const handleRenameScenario = useCallback(() => {
    if (!activeScenario) return;
    setSaveDialogMode("rename");
    setSaveDialogName(activeScenario.name);
    setSaveDialogError(null);
    setSaveDialogOpen(true);
  }, [activeScenario]);

  const handleSaveDialogConfirm = useCallback(async () => {
    const name = saveDialogName.trim();
    if (!name) {
      setSaveDialogError("Scenario name is required.");
      return;
    }
    if (name.length > 60) {
      setSaveDialogError("Name must be 60 characters or less.");
      return;
    }
    const excludeId = saveDialogMode === "rename" ? activeScenarioId : null;
    const duplicate = scenarios.some((s) => s.name === name && s.id !== excludeId);
    if (duplicate) {
      setSaveDialogError("A scenario with this name already exists.");
      return;
    }
    setSaveDialogError(null);
    setIsSaving(true);
    try {
      if (saveDialogMode === "create") {
        const res = await apiRequest("POST", `/api/plans/${planId}/scenarios`, {
          name,
          sliderValues,
        });
        const created: WhatIfScenario = await res.json();
        setActiveScenarioId(created.id);
        toast({ title: "Scenario saved", description: `"${name}" has been saved.` });
      } else if (saveDialogMode === "rename" && activeScenarioId) {
        await apiRequest("PUT", `/api/plans/${planId}/scenarios/${activeScenarioId}`, {
          name,
        });
        toast({ title: "Scenario renamed", description: `Renamed to "${name}".` });
      }
      invalidatePlan();
      setSaveDialogOpen(false);
    } catch (err: any) {
      const msg = err.message || "Failed to save scenario";
      setSaveDialogError(msg.includes(":") ? msg.split(": ").slice(1).join(": ") : msg);
    } finally {
      setIsSaving(false);
    }
  }, [saveDialogName, saveDialogMode, planId, sliderValues, activeScenarioId, scenarios, invalidatePlan, toast]);

  const handleUpdateScenario = useCallback(async () => {
    if (!activeScenarioId) return;
    setIsSaving(true);
    try {
      await apiRequest("PUT", `/api/plans/${planId}/scenarios/${activeScenarioId}`, {
        sliderValues,
      });
      toast({ title: "Scenario updated", description: "Slider values have been saved." });
      invalidatePlan();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update scenario", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [activeScenarioId, planId, sliderValues, invalidatePlan, toast]);

  const handleDeleteScenario = useCallback(async (scenarioId: string) => {
    try {
      await apiRequest("DELETE", `/api/plans/${planId}/scenarios/${scenarioId}`);
      if (activeScenarioId === scenarioId) {
        setActiveScenarioId(null);
        setSliderValues({ ...DEFAULT_SLIDER_VALUES });
      }
      if (comparisonScenarioId === scenarioId) {
        setComparisonScenarioId(null);
      }
      invalidatePlan();
      toast({ title: "Scenario deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to delete scenario", variant: "destructive" });
    }
    setDeleteConfirmId(null);
  }, [planId, activeScenarioId, comparisonScenarioId, invalidatePlan, toast]);

  const handleToggleComparison = useCallback((scenarioId: string) => {
    setComparisonScenarioId((prev) => (prev === scenarioId ? null : scenarioId));
  }, []);

  if (isLoading) {
    return (
      <div data-testid="what-if-loading" className="flex-1 overflow-y-auto p-6 space-y-6">
        <Skeleton className="h-8 w-96" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div data-testid="what-if-error" className="flex-1 flex items-center justify-center p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unable to Load Plan Data</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              We couldn't load your plan data for the What-If Playground. Please try refreshing the page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!financialInputs) {
    return (
      <div data-testid="what-if-no-data" className="flex-1 flex items-center justify-center p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <Minus className="h-8 w-8 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Financial Data Available</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Complete your plan inputs first to use the What-If Playground.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div data-testid="what-if-playground" data-has-interacted={hasInteractedWithSlider} className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div data-testid="what-if-header">
          <h1 className="text-xl font-bold tracking-tight" data-testid="what-if-title">
            What happens to my WHOLE business if things change?
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Adjust assumptions below to see how your plan responds. These changes are sandbox-only — your actual plan is never modified.
          </p>
        </div>

        {scenarioOutputs && (
          <MetricDeltaCardStrip
            outputs={scenarioOutputs}
            hasInteractedWithSlider={hasInteractedWithSlider}
            comparisonOutput={comparisonOutput}
            comparisonName={comparisonScenario?.name ?? null}
          />
        )}

        <Card data-testid="sensitivity-controls-panel">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-base">Sensitivity Controls</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                {scenarios.length > 0 && (
                  <Select
                    value={activeScenarioId ?? ""}
                    onValueChange={(v) => {
                      if (v) handleLoadScenario(v);
                    }}
                  >
                    <SelectTrigger
                      className="h-8 w-[180px] text-xs"
                      data-testid="select-scenario"
                    >
                      <SelectValue placeholder="Load scenario…" />
                    </SelectTrigger>
                    <SelectContent>
                      {scenarios.map((s) => (
                        <SelectItem key={s.id} value={s.id} data-testid={`scenario-option-${s.id}`}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {activeScenario && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRenameScenario}
                    data-testid="button-rename-scenario"
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Rename
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveNew}
                  disabled={!hasAdjustment || (scenarios.length >= 10 && !activeScenario)}
                  data-testid="button-save-scenario"
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  Save As…
                </Button>

                {hasAdjustment && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetSliders}
                    data-testid="button-reset-sliders"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    Reset
                  </Button>
                )}

                <span className="text-xs text-muted-foreground tabular-nums" data-testid="scenario-count-indicator">
                  {scenarios.length}/10 saved
                </span>
              </div>
            </div>

            {activeScenario && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground" data-testid="text-loaded-scenario-name">
                  Loaded: "{activeScenario.name}"
                </span>
                {hasUnsavedChanges && (
                  <span className="text-xs text-amber-500" data-testid="indicator-unsaved-changes">
                    • unsaved changes
                  </span>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[140px_1fr_60px_120px_80px] gap-3 items-center text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              <span>Assumption</span>
              <span className="text-center">Adjustment</span>
              <span className="text-center">Value</span>
              <span className="text-right">Annual Impact</span>
              <span className="text-center">Precise</span>
            </div>
            {SLIDER_CONFIGS.map((config) => (
              <SensitivitySliderRow
                key={config.key}
                config={config}
                value={sliderValues[config.key]}
                onChange={handleSliderChange}
                baseOutput={scenarioOutputs?.base ?? null}
                disabled={!scenarioOutputs}
              />
            ))}
          </CardContent>
        </Card>

        {scenarios.length > 0 && (
          <Card data-testid="saved-scenarios-panel">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Saved Scenarios</CardTitle>
                <Select
                  value={comparisonScenarioId ?? "__none__"}
                  onValueChange={(v) => setComparisonScenarioId(v === "__none__" ? null : v)}
                >
                  <SelectTrigger
                    className="h-8 w-[200px] text-xs"
                    data-testid="select-comparison-scenario"
                  >
                    <SelectValue placeholder="Compare with…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— None —</SelectItem>
                    {scenarios.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {scenarios.map((s) => (
                  <div
                    key={s.id}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                      activeScenarioId === s.id ? "border-primary bg-primary/5" : ""
                    }`}
                    data-testid={`scenario-row-${s.id}`}
                  >
                    <button
                      className="text-sm font-medium text-left flex-1 hover:underline"
                      onClick={() => handleLoadScenario(s.id)}
                      data-testid={`button-load-scenario-${s.id}`}
                    >
                      {s.name}
                      {activeScenarioId === s.id && (
                        <span className="ml-2 text-xs text-muted-foreground">(active)</span>
                      )}
                    </button>
                    <div className="flex items-center gap-1">
                      <Button
                        variant={comparisonScenarioId === s.id ? "default" : "ghost"}
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleToggleComparison(s.id)}
                        title={comparisonScenarioId === s.id ? "Hide comparison" : "Compare on charts"}
                        data-testid={`button-compare-scenario-${s.id}`}
                      >
                        {comparisonScenarioId === s.id ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteConfirmId(s.id)}
                        title="Delete scenario"
                        data-testid={`button-delete-scenario-${s.id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {comparisonScenario && (
          <div className="rounded-lg border border-dashed border-chart-4 bg-chart-4/5 px-4 py-2 flex items-center gap-2" data-testid="comparison-banner">
            <Eye className="h-4 w-4 text-chart-4 shrink-0" />
            <span className="text-sm">
              Comparing against <strong>"{comparisonScenario.name}"</strong> — shown as dotted gold line on charts
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => setComparisonScenarioId(null)}
              data-testid="button-dismiss-comparison"
            >
              Dismiss
            </Button>
          </div>
        )}

        <div>
          <h2 className="text-base font-semibold mb-3" data-testid="charts-heading">
            Business Impact — Base vs Your Scenario{comparisonScenario ? ` vs "${comparisonScenario.name}"` : ""}
          </h2>
          <SensitivityCharts scenarioOutputs={scenarioOutputs} comparisonOutput={comparisonOutput} comparisonName={comparisonScenario?.name ?? null} />
        </div>
      </div>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-save-scenario">
          <DialogHeader>
            <DialogTitle>
              {saveDialogMode === "rename" ? "Rename Scenario" : "Save Scenario"}
            </DialogTitle>
            <DialogDescription>
              {saveDialogMode === "rename"
                ? "Enter a new name for this scenario."
                : activeScenario && hasUnsavedChanges
                  ? "Save your changes as a new scenario, or update the current one."
                  : scenarios.length >= 10
                    ? "Maximum 10 scenarios per plan reached — delete one to save a new one."
                    : "Give this slider configuration a name so you can load it later."}
            </DialogDescription>
          </DialogHeader>
          {saveDialogMode === "create" && activeScenario && hasUnsavedChanges ? (
            <>
              <div>
                <Input
                  value={saveDialogName}
                  onChange={(e) => { setSaveDialogName(e.target.value); setSaveDialogError(null); }}
                  placeholder="e.g. Optimistic Revenue"
                  maxLength={60}
                  data-testid="input-scenario-name"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && saveDialogName.trim()) handleSaveDialogConfirm();
                  }}
                />
                {saveDialogError && (
                  <p className="text-sm text-destructive mt-1.5" data-testid="text-scenario-name-error">{saveDialogError}</p>
                )}
              </div>
              <DialogFooter className="flex gap-2 sm:gap-2">
                <Button variant="outline" onClick={() => setSaveDialogOpen(false)} data-testid="button-cancel-save">
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { handleUpdateScenario(); setSaveDialogOpen(false); }}
                  disabled={isSaving}
                  data-testid="button-update-scenario"
                >
                  {isSaving ? "Updating…" : `Update "${activeScenario.name}"`}
                </Button>
                <Button
                  onClick={handleSaveDialogConfirm}
                  disabled={!saveDialogName.trim() || isSaving || scenarios.length >= 10}
                  data-testid="button-save-as-new"
                >
                  {isSaving ? "Saving…" : "Save as New"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div>
                <Input
                  value={saveDialogName}
                  onChange={(e) => { setSaveDialogName(e.target.value); setSaveDialogError(null); }}
                  placeholder="e.g. Optimistic Revenue"
                  maxLength={60}
                  data-testid="input-scenario-name"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && saveDialogName.trim()) handleSaveDialogConfirm();
                  }}
                />
                {saveDialogError && (
                  <p className="text-sm text-destructive mt-1.5" data-testid="text-scenario-name-error">{saveDialogError}</p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSaveDialogOpen(false)} data-testid="button-cancel-save">
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveDialogConfirm}
                  disabled={!saveDialogName.trim() || isSaving || (saveDialogMode === "create" && scenarios.length >= 10)}
                  data-testid="button-confirm-save-scenario"
                >
                  {isSaving ? "Saving…" : saveDialogMode === "create" ? "Save" : "Rename"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-delete-scenario">
          <DialogHeader>
            <DialogTitle>Delete Scenario</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{scenarios.find((s) => s.id === deleteConfirmId)?.name}"? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} data-testid="button-cancel-delete">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDeleteScenario(deleteConfirmId)}
              data-testid="button-confirm-delete"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
