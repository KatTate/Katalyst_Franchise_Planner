import { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { usePlan } from "@/hooks/use-plan";
import { formatCents } from "@/lib/format-currency";
import {
  computeSensitivityOutputs,
  SLIDER_CONFIGS,
  DEFAULT_SLIDER_VALUES,
  type SliderValues,
  type SliderConfig,
  type SensitivityOutputs,
} from "@/lib/sensitivity-engine";
import type { ScenarioOutputs } from "@/lib/scenario-engine";
import type { PlanFinancialInputs } from "@shared/financial-engine";
import type { StartupCostLineItem } from "@shared/financial-engine";

interface WhatIfPlaygroundProps {
  planId: string;
}

interface MetricDefinition {
  key: string;
  label: string;
  getValue: (output: ScenarioOutputs["base"]) => number | null;
  format: "currency" | "pct" | "months";
}

const METRICS: MetricDefinition[] = [
  {
    key: "break-even",
    label: "Break-Even Month",
    getValue: (o) => o.roiMetrics.breakEvenMonth,
    format: "months",
  },
  {
    key: "roi",
    label: "5-Year ROI %",
    getValue: (o) => o.roiMetrics.fiveYearROIPct,
    format: "pct",
  },
  {
    key: "y1-revenue",
    label: "Year-1 Revenue",
    getValue: (o) => o.annualSummaries[0]?.revenue ?? null,
    format: "currency",
  },
  {
    key: "y1-ebitda",
    label: "Year-1 EBITDA",
    getValue: (o) => o.annualSummaries[0]?.ebitda ?? null,
    format: "currency",
  },
  {
    key: "y1-pretax",
    label: "Year-1 Pre-Tax Income",
    getValue: (o) => o.annualSummaries[0]?.preTaxIncome ?? null,
    format: "currency",
  },
];

function formatMetricValue(value: number | null, format: "currency" | "pct" | "months"): string {
  if (value === null || value === undefined) return "—";
  switch (format) {
    case "currency":
      return formatCents(value);
    case "pct":
      return `${(value * 100).toFixed(1)}%`;
    case "months":
      return `${value} mo`;
  }
}

function formatDelta(
  base: number | null,
  compare: number | null,
  format: "currency" | "pct" | "months"
): string | null {
  if (base === null || compare === null) return null;
  const diff = compare - base;
  if (diff === 0) return null;
  const sign = diff > 0 ? "+" : "";
  switch (format) {
    case "currency":
      return `${sign}${formatCents(diff)}`;
    case "pct":
      return `${sign}${(diff * 100).toFixed(1)}pp`;
    case "months":
      return `${sign}${diff} mo`;
  }
}

function sumY1Monthly(baseOutput: ScenarioOutputs["base"], field: "marketing" | "facilities"): number {
  let total = 0;
  for (const mp of baseOutput.monthlyProjections) {
    if (mp.year === 1) total += mp[field];
  }
  return Math.round(total);
}

function computeSliderDollarImpact(
  key: keyof SliderValues,
  pct: number,
  baseOutput: ScenarioOutputs["base"]
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

function formatSliderImpact(key: keyof SliderValues, pct: number, baseOutput: ScenarioOutputs["base"]): string {
  const impact = computeSliderDollarImpact(key, pct, baseOutput);
  if (impact === 0 && pct === 0) return "$0/yr";
  const sign = impact >= 0 ? "+" : "";
  return `${sign}${formatCents(impact)}/yr`;
}

function formatSliderPct(pct: number): string {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}%`;
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
  baseOutput: ScenarioOutputs["base"] | null;
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
    const clamped = Math.max(config.min, Math.min(config.max, parsed));
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
  const pctDisplay = formatSliderPct(value);

  return (
    <div className="grid grid-cols-[140px_1fr_60px_120px_80px] gap-3 items-center" data-testid={`slider-row-${config.key}`}>
      <label className="text-sm font-medium text-foreground truncate">{config.label}</label>
      <Slider
        min={config.min}
        max={config.max}
        step={config.step}
        value={[value]}
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
        min={config.min}
        max={config.max}
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

function isBetter(metricKey: string, val: number | null, baseVal: number | null): boolean {
  if (val === null || baseVal === null) return false;
  return metricKey === "break-even" ? val < baseVal : val > baseVal;
}

function isWorse(metricKey: string, val: number | null, baseVal: number | null): boolean {
  if (val === null || baseVal === null) return false;
  return metricKey === "break-even" ? val > baseVal : val < baseVal;
}

function ScenarioColumn({
  label,
  value,
  baseVal,
  metricKey,
  format,
  testId,
  highlight,
}: {
  label: string;
  value: number | null;
  baseVal: number | null;
  metricKey: string;
  format: "currency" | "pct" | "months";
  testId: string;
  highlight?: boolean;
}) {
  const delta = formatDelta(baseVal, value, format);
  const worse = isWorse(metricKey, value, baseVal);
  const better = isBetter(metricKey, value, baseVal);

  return (
    <div data-testid={testId} className={highlight ? "bg-primary/5 rounded-md p-1.5 -m-1.5" : ""}>
      <div className="text-[10px] text-muted-foreground mb-0.5">{label}</div>
      <div className={`text-sm font-semibold font-mono tabular-nums ${highlight ? "text-primary" : ""}`}>
        {value === null && metricKey === "break-even" ? "60+ mo" : formatMetricValue(value, format)}
      </div>
      {delta && (
        <div className={`flex items-center gap-0.5 text-[10px] font-mono ${worse ? "text-orange-600 dark:text-orange-400" : better ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}`}>
          {worse ? <TrendingDown className="h-3 w-3" /> : better ? <TrendingUp className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
          {delta}
        </div>
      )}
    </div>
  );
}

function MetricCard({
  metric,
  scenarioOutputs,
  hasCustom,
}: {
  metric: MetricDefinition;
  scenarioOutputs: SensitivityOutputs;
  hasCustom: boolean;
}) {
  const baseVal = metric.getValue(scenarioOutputs.base);
  const conservativeVal = metric.getValue(scenarioOutputs.conservative);
  const optimisticVal = metric.getValue(scenarioOutputs.optimistic);
  const customVal = metric.getValue(scenarioOutputs.custom);

  return (
    <Card data-testid={`metric-card-${metric.key}`}>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {metric.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className={`grid gap-2 ${hasCustom ? "grid-cols-4" : "grid-cols-3"}`}>
          <ScenarioColumn label="Base Case" value={baseVal} baseVal={baseVal} metricKey={metric.key} format={metric.format} testId={`metric-base-${metric.key}`} />
          <ScenarioColumn label="Conservative" value={conservativeVal} baseVal={baseVal} metricKey={metric.key} format={metric.format} testId={`metric-conservative-${metric.key}`} />
          <ScenarioColumn label="Optimistic" value={optimisticVal} baseVal={baseVal} metricKey={metric.key} format={metric.format} testId={`metric-optimistic-${metric.key}`} />
          {hasCustom && (
            <ScenarioColumn label="Your Scenario" value={customVal} baseVal={baseVal} metricKey={metric.key} format={metric.format} testId={`metric-custom-${metric.key}`} highlight />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function WhatIfPlayground({ planId }: WhatIfPlaygroundProps) {
  const { plan, isLoading, error } = usePlan(planId);
  const [sliderValues, setSliderValues] = useState<SliderValues>({ ...DEFAULT_SLIDER_VALUES });
  const [debouncedSliders, setDebouncedSliders] = useState<SliderValues>({ ...DEFAULT_SLIDER_VALUES });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSliders({ ...sliderValues });
    }, 350);
    return () => clearTimeout(timer);
  }, [sliderValues]);

  const handleSliderChange = useCallback((key: keyof SliderValues, val: number) => {
    setSliderValues((prev) => ({ ...prev, [key]: val }));
  }, []);

  const financialInputs = plan?.financialInputs as PlanFinancialInputs | null | undefined;
  const startupCostsData = (plan?.startupCosts ?? []) as StartupCostLineItem[];

  const hasCustom = Object.values(sliderValues).some((v) => v !== 0);

  const scenarioOutputs = useMemo<SensitivityOutputs | null>(() => {
    if (!financialInputs) return null;
    return computeSensitivityOutputs(financialInputs, startupCostsData, debouncedSliders);
  }, [financialInputs, startupCostsData, debouncedSliders]);

  if (isLoading) {
    return (
      <div data-testid="what-if-loading" className="flex-1 overflow-y-auto p-6 space-y-6">
        <Skeleton className="h-8 w-96" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
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
    <div data-testid="what-if-playground" className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div data-testid="what-if-header">
          <h1 className="text-xl font-bold tracking-tight" data-testid="what-if-title">
            What happens to my WHOLE business if things change?
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Adjust assumptions below to see how your plan responds. These changes are sandbox-only — your actual plan is never modified.
          </p>
        </div>

        <Card data-testid="sensitivity-controls-panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Sensitivity Controls</CardTitle>
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

        <div>
          <h2 className="text-base font-semibold mb-3" data-testid="metrics-heading">Key Metrics by Scenario</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="metric-cards-grid">
            {scenarioOutputs &&
              METRICS.map((metric) => (
                <MetricCard
                  key={metric.key}
                  metric={metric}
                  scenarioOutputs={scenarioOutputs}
                  hasCustom={hasCustom}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
