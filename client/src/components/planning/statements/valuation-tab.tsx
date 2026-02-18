import { useMemo, useState, useCallback } from "react";
import { ChevronDown, ChevronRight, Pencil } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCents } from "@/lib/format-currency";
import type { EngineOutput, ValuationOutput, ROICExtendedOutput, MonthlyProjection } from "@shared/financial-engine";

import { SCENARIO_COLORS, type ScenarioId, type ScenarioOutputs } from "@/lib/scenario-engine";

interface ValuationTabProps {
  output: EngineOutput;
  scenarioOutputs?: ScenarioOutputs | null;
}

interface CellTooltip {
  explanation: string;
  formula: string;
}

interface ValRowDef {
  key: string;
  label: string;
  getValue: (yearIdx: number, enriched: EnrichedValYear[]) => number;
  format: "currency" | "pct" | "multiple";
  isInput?: boolean;
  isSubtotal?: boolean;
  isTotal?: boolean;
  indent?: number;
  tooltip?: CellTooltip;
}

interface ValSectionDef {
  key: string;
  title: string;
  rows: ValRowDef[];
}

interface EnrichedValYear {
  year: number;
  val: ValuationOutput;
  roic: ROICExtendedOutput;
  outstandingDebt: number;
  workingCapitalAdj: number;
  estimatedEquityValue: number;
  totalCashExtracted: number;
  totalInvested: number;
  netReturn: number;
  returnMultiple: number;
}

function computeEnrichedValYears(
  valuation: ValuationOutput[],
  roicExtended: ROICExtendedOutput[],
  monthlyProjections: MonthlyProjection[],
): EnrichedValYear[] {
  let cumulativeDistributions = 0;

  return valuation.map((val, idx) => {
    const roic = roicExtended[idx];
    const yearEndMonthIdx = (idx + 1) * 12 - 1;
    const yearEndMonth = monthlyProjections[yearEndMonthIdx];

    const outstandingDebt = roic ? roic.totalLoans : 0;
    const tca = yearEndMonth ? yearEndMonth.totalCurrentAssets : 0;
    const tcl = yearEndMonth ? yearEndMonth.totalCurrentLiabilities : 0;
    const workingCapitalAdj = tca - tcl;
    const estimatedEquityValue = val.estimatedValue - outstandingDebt - workingCapitalAdj;

    let yearDistributions = 0;
    const startMonth = idx * 12;
    const endMonth = (idx + 1) * 12;
    for (let m = startMonth; m < endMonth && m < monthlyProjections.length; m++) {
      yearDistributions += Math.abs(monthlyProjections[m].cfDistributions);
    }
    cumulativeDistributions += yearDistributions;
    const totalCashExtracted = cumulativeDistributions + val.netAfterTaxProceeds;
    const totalInvested = val.totalCashInvested;
    const netReturn = totalCashExtracted - totalInvested;
    const returnMultiple = totalInvested > 0 ? totalCashExtracted / totalInvested : 0;

    return {
      year: val.year,
      val,
      roic,
      outstandingDebt,
      workingCapitalAdj,
      estimatedEquityValue,
      totalCashExtracted,
      totalInvested,
      netReturn,
      returnMultiple,
    };
  });
}

const VAL_SECTIONS: ValSectionDef[] = [
  {
    key: "ebitda-basis",
    title: "EBITDA Basis",
    rows: [
      { key: "ebitda", label: "EBITDA", getValue: (_i, e) => e[_i].val.netOperatingIncome, format: "currency", indent: 1, tooltip: { explanation: "Earnings before interest, taxes, depreciation, and amortization", formula: "Revenue - COGS - OpEx (before depreciation & interest)" } },
      { key: "ebitda-multiple", label: "EBITDA Multiple", getValue: (_i, e) => e[_i].val.ebitdaMultiple, format: "multiple", isInput: true, indent: 1, tooltip: { explanation: "Multiplier applied to EBITDA to estimate business value", formula: "Industry-standard multiple (editable in Story 5.6)" } },
      { key: "estimated-value", label: "Estimated Enterprise Value", getValue: (_i, e) => e[_i].val.estimatedValue, format: "currency", isTotal: true, tooltip: { explanation: "Estimated sale price of the business based on EBITDA", formula: "EBITDA x EBITDA Multiple" } },
    ],
  },
  {
    key: "adjustments",
    title: "Adjustments",
    rows: [
      { key: "outstanding-debt", label: "Less: Outstanding Debt", getValue: (_i, e) => -e[_i].outstandingDebt, format: "currency", indent: 1, tooltip: { explanation: "Total debt that would need to be paid off upon sale", formula: "Original loan amount" } },
      { key: "working-capital-adj", label: "Less: Working Capital Adjustment", getValue: (_i, e) => -e[_i].workingCapitalAdj, format: "currency", indent: 1, tooltip: { explanation: "Net working capital adjustment (current assets minus current liabilities)", formula: "Total Current Assets - Total Current Liabilities" } },
      { key: "estimated-equity-value", label: "Estimated Equity Value", getValue: (_i, e) => e[_i].estimatedEquityValue, format: "currency", isSubtotal: true, tooltip: { explanation: "Value remaining for the owner after debt and working capital adjustments", formula: "Enterprise Value - Outstanding Debt - Working Capital Adjustment" } },
    ],
  },
  {
    key: "after-tax",
    title: "After-Tax Proceeds",
    rows: [
      { key: "estimated-tax", label: "Estimated Taxes on Sale (21%)", getValue: (_i, e) => e[_i].val.estimatedTaxOnSale, format: "currency", indent: 1, tooltip: { explanation: "Estimated capital gains tax on the business sale", formula: "Estimated Enterprise Value x Tax Rate" } },
      { key: "net-after-tax", label: "Net After-Tax Proceeds", getValue: (_i, e) => e[_i].val.netAfterTaxProceeds, format: "currency", isSubtotal: true, tooltip: { explanation: "Cash the owner would receive after selling and paying taxes", formula: "Estimated Value - Estimated Tax on Sale" } },
    ],
  },
  {
    key: "return-metrics",
    title: "Returns",
    rows: [
      { key: "total-cash-extracted", label: "Total Cash Extracted", getValue: (_i, e) => e[_i].totalCashExtracted, format: "currency", indent: 1, tooltip: { explanation: "Total cash received from distributions plus sale proceeds", formula: "Cumulative Distributions + Net After-Tax Proceeds" } },
      { key: "total-invested", label: "Total Invested", getValue: (_i, e) => e[_i].totalInvested, format: "currency", indent: 1, tooltip: { explanation: "Total equity cash invested by the owner", formula: "Owner's equity investment" } },
      { key: "net-return", label: "Net Return", getValue: (_i, e) => e[_i].netReturn, format: "currency", isSubtotal: true, tooltip: { explanation: "Profit from the investment after all costs", formula: "Total Cash Extracted - Total Invested" } },
      { key: "return-multiple", label: "Return Multiple", getValue: (_i, e) => e[_i].returnMultiple, format: "multiple", indent: 1, tooltip: { explanation: "How many times the original investment was returned", formula: "Total Cash Extracted / Total Invested" } },
      { key: "replacement-return", label: "Replacement Return Required", getValue: (_i, e) => e[_i].val.replacementReturnRequired, format: "pct", indent: 1, tooltip: { explanation: "Return required from an alternative investment to match sale proceeds", formula: "Net After-Tax Proceeds / Total Cash Invested" } },
      { key: "business-annual-roic", label: "Business Annual ROIC", getValue: (_i, e) => e[_i].val.businessAnnualROIC, format: "pct", indent: 1, tooltip: { explanation: "Annual return on invested capital from business operations", formula: "Adjusted Net Operating Income / Total Cash Invested" } },
    ],
  },
];

function formatValValue(value: number, format: "currency" | "pct" | "multiple"): string {
  if (format === "pct") return `${(value * 100).toFixed(1)}%`;
  if (format === "multiple") return `${value.toFixed(1)}x`;
  return formatCents(value);
}

export function ValuationTab({ output, scenarioOutputs }: ValuationTabProps) {
  const { valuation, roicExtended, monthlyProjections } = output;
  const comparisonActive = !!scenarioOutputs;

  const enriched = useMemo(
    () => computeEnrichedValYears(valuation, roicExtended, monthlyProjections),
    [valuation, roicExtended, monthlyProjections],
  );

  const scenarioEnriched = useMemo(() => {
    if (!scenarioOutputs) return null;
    return {
      base: computeEnrichedValYears(scenarioOutputs.base.valuation, scenarioOutputs.base.roicExtended, scenarioOutputs.base.monthlyProjections),
      conservative: computeEnrichedValYears(scenarioOutputs.conservative.valuation, scenarioOutputs.conservative.roicExtended, scenarioOutputs.conservative.monthlyProjections),
      optimistic: computeEnrichedValYears(scenarioOutputs.optimistic.valuation, scenarioOutputs.optimistic.roicExtended, scenarioOutputs.optimistic.monthlyProjections),
    };
  }, [scenarioOutputs]);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    VAL_SECTIONS.forEach((s) => {
      initial[s.key] = true;
    });
    return initial;
  });

  const toggleSection = useCallback((key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const SCENARIOS: ScenarioId[] = ["base", "conservative", "optimistic"];

  if (comparisonActive && scenarioOutputs && scenarioEnriched) {
    return (
      <div className="space-y-0 pb-8" data-testid="valuation-tab">
        <ValCalloutBar enriched={enriched} />
        <div className="overflow-x-auto" data-testid="valuation-table">
          <table className="w-full text-sm" role="grid" aria-label="Business Valuation — Scenario Comparison">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sticky left-0 bg-background z-20 min-w-[240px]">
                  Metric
                </th>
                {Array.from({ length: 5 }, (_, yi) => (
                  <th
                    key={`yg-${yi + 1}`}
                    className={`py-2 px-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap${yi > 0 ? " border-l-2 border-border/40" : ""}`}
                    colSpan={3}
                  >
                    Year {yi + 1}
                  </th>
                ))}
              </tr>
              <tr className="border-b">
                <th className="sticky left-0 bg-background z-20" />
                {Array.from({ length: 5 }, (_, yi) =>
                  SCENARIOS.map((s, sIdx) => (
                    <th
                      key={`y${yi + 1}-${s}`}
                      className={`py-1.5 px-2 text-right text-[11px] font-medium text-muted-foreground whitespace-nowrap ${SCENARIO_COLORS[s].bg}${sIdx === 0 && yi > 0 ? " border-l-2 border-border/40" : ""}`}
                    >
                      <span className="flex items-center justify-end gap-1">
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${SCENARIO_COLORS[s].dot}`} />
                        {s === "base" ? "Base" : s === "conservative" ? "Cons" : "Opt"}
                      </span>
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {VAL_SECTIONS.map((section) => (
                <ComparisonValSection
                  key={section.key}
                  section={section}
                  scenarioEnriched={scenarioEnriched}
                  isExpanded={expandedSections[section.key] ?? true}
                  onToggle={() => toggleSection(section.key)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0 pb-8" data-testid="valuation-tab">
      <ValCalloutBar enriched={enriched} />
      <div className="overflow-x-auto" data-testid="valuation-table">
        <table className="w-full text-sm" role="grid" aria-label="Business Valuation">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sticky left-0 bg-background z-20 min-w-[240px]">
                Metric
              </th>
              {enriched.map((e) => (
                <th
                  key={e.year}
                  className="py-2 px-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap min-w-[100px]"
                  data-testid={`val-col-year-${e.year}`}
                >
                  Year {e.year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {VAL_SECTIONS.map((section) => (
              <ValSection
                key={section.key}
                section={section}
                enriched={enriched}
                isExpanded={expandedSections[section.key] ?? true}
                onToggle={() => toggleSection(section.key)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ValCalloutBar({ enriched }: { enriched: EnrichedValYear[] }) {
  if (enriched.length === 0) {
    return (
      <div className="px-4 py-3 border-b bg-muted/30 sticky top-0 z-30" data-testid="valuation-callout-bar">
        <span className="text-sm text-muted-foreground">No valuation data available.</span>
      </div>
    );
  }

  const y5 = enriched[enriched.length - 1];

  return (
    <div
      className="flex flex-wrap items-center gap-4 px-4 py-3 border-b bg-muted/30 sticky top-0 z-30"
      data-testid="valuation-callout-bar"
    >
      <CalloutMetric
        label={`Estimated Enterprise Value (Y${y5.year})`}
        value={formatCents(y5.val.estimatedValue)}
        testId="val-callout-value-y5"
      />
      <div className="w-px h-8 bg-border" />
      <CalloutMetric
        label={`Net After-Tax Proceeds (Y${y5.year})`}
        value={formatCents(y5.val.netAfterTaxProceeds)}
        testId="val-callout-net-proceeds-y5"
      />
      <div className="w-px h-8 bg-border" />
      <CalloutMetric
        label="EBITDA Multiple"
        value={`${y5.val.ebitdaMultiple.toFixed(1)}x`}
        testId="val-callout-multiple"
      />
    </div>
  );
}

function CalloutMetric({ label, value, testId }: { label: string; value: string; testId: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
      <span className="text-lg font-semibold font-mono tabular-nums" data-testid={testId}>{value}</span>
    </div>
  );
}

interface ValSectionProps {
  section: ValSectionDef;
  enriched: EnrichedValYear[];
  isExpanded: boolean;
  onToggle: () => void;
}

function ValSection({ section, enriched, isExpanded, onToggle }: ValSectionProps) {
  return (
    <>
      <tr
        className="bg-muted/40 cursor-pointer hover-elevate"
        data-testid={`val-section-${section.key}`}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        tabIndex={0}
        role="row"
        aria-expanded={isExpanded}
      >
        <td
          className="py-2 px-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground sticky left-0 bg-muted/40 z-20"
          colSpan={enriched.length + 1}
        >
          <span className="flex items-center gap-1">
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            )}
            {section.title}
          </span>
        </td>
      </tr>
      {isExpanded &&
        section.rows.map((row) => (
          <ValRow
            key={row.key}
            row={row}
            enriched={enriched}
          />
        ))}
    </>
  );
}

function ComparisonValSection({
  section,
  scenarioEnriched,
  isExpanded,
  onToggle,
}: {
  section: ValSectionDef;
  scenarioEnriched: Record<ScenarioId, EnrichedValYear[]>;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const SCENARIOS: ScenarioId[] = ["base", "conservative", "optimistic"];
  const totalCols = 5 * 3;

  return (
    <>
      <tr
        className="bg-muted/40 cursor-pointer hover-elevate"
        data-testid={`val-section-${section.key}`}
        onClick={onToggle}
        role="row"
        aria-expanded={isExpanded}
      >
        <td
          className="py-2 px-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground sticky left-0 bg-muted/40 z-20"
          colSpan={totalCols + 1}
        >
          <span className="flex items-center gap-1">
            {isExpanded ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
            {section.title}
          </span>
        </td>
      </tr>
      {isExpanded &&
        section.rows.map((row) => {
          const rowClass = row.isTotal
            ? "font-semibold border-t-[3px] border-double border-b"
            : row.isSubtotal
              ? "font-medium border-t"
              : "";
          const paddingLeft = row.indent ? `${12 + row.indent * 16}px` : undefined;

          return (
            <tr
              key={row.key}
              className={`${rowClass} hover-elevate group`}
              data-testid={`val-row-${row.key}`}
              role="row"
            >
              <td
                className="py-1.5 px-3 text-sm sticky left-0 bg-background z-10 min-w-[240px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]"
                style={{ paddingLeft }}
                role="rowheader"
              >
                {row.label}
              </td>
              {Array.from({ length: 5 }, (_, yi) => {
                const year = yi + 1;
                return SCENARIOS.map((scenario, sIdx) => {
                  const enriched = scenarioEnriched[scenario];
                  const value = row.getValue(yi, enriched);
                  const isNegative = value < 0;
                  const cellContent = formatValValue(value, row.format);

                  return (
                    <td
                      key={`y${year}-${scenario}`}
                      className={`py-1.5 px-3 text-right font-mono tabular-nums text-sm whitespace-nowrap ${SCENARIO_COLORS[scenario].bg}${isNegative ? " text-amber-700 dark:text-amber-400" : ""}${sIdx === 0 && yi > 0 ? " border-l-2 border-border/40" : ""}`}
                      data-testid={`val-value-${row.key}-y${year}-${scenario}`}
                      role="gridcell"
                    >
                      {cellContent}
                    </td>
                  );
                });
              })}
            </tr>
          );
        })}
    </>
  );
}

function ValRow({ row, enriched }: { row: ValRowDef; enriched: EnrichedValYear[] }) {
  const rowClass = row.isTotal
    ? "font-semibold border-t-[3px] border-double border-b"
    : row.isSubtotal
      ? "font-medium border-t"
      : "";

  const paddingLeft = row.indent ? `${12 + row.indent * 16}px` : undefined;

  const inputCellClass = row.isInput
    ? "bg-primary/5 border-l-2 border-dashed border-primary/20"
    : "";

  return (
    <tr
      className={`${rowClass} hover-elevate group`}
      data-testid={`val-row-${row.key}`}
      role="row"
    >
      <td
        className={`py-1.5 px-3 text-sm sticky left-0 bg-background z-10 min-w-[240px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)] ${inputCellClass}`}
        style={{ paddingLeft }}
        role="rowheader"
      >
        <span className="flex items-center gap-1.5">
          {row.label}
          {row.isInput && (
            <Pencil
              className="h-3 w-3 text-primary/40 invisible group-hover:visible shrink-0"
              aria-label="Editable field (coming soon)"
            />
          )}
        </span>
      </td>
      {enriched.map((yearData, idx) => {
        const value = row.getValue(idx, enriched);
        const isNegative = value < 0;
        const cellContent = formatValValue(value, row.format);

        const isNa = row.format === "multiple" && enriched[idx].totalInvested <= 0 && row.key === "return-multiple";

        if (row.tooltip) {
          return (
            <td
              key={yearData.year}
              className={`py-1.5 px-3 text-right font-mono tabular-nums text-sm whitespace-nowrap${isNegative ? " text-amber-700 dark:text-amber-400" : ""}${row.isInput ? ` ${inputCellClass}` : ""}`}
              data-testid={`val-value-${row.key}-y${yearData.year}`}
              role="gridcell"
              aria-readonly={row.isInput ? "false" : "true"}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">{isNa ? "N/A" : cellContent}</span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[260px]">
                  <p className="text-xs font-medium">{row.tooltip.explanation}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{row.tooltip.formula}</p>
                </TooltipContent>
              </Tooltip>
            </td>
          );
        }

        return (
          <td
            key={yearData.year}
            className={`py-1.5 px-3 text-right font-mono tabular-nums text-sm whitespace-nowrap${isNegative ? " text-amber-700 dark:text-amber-400" : ""}${row.isInput ? ` ${inputCellClass}` : ""}`}
            data-testid={`val-value-${row.key}-y${yearData.year}`}
            role="gridcell"
            aria-readonly={row.isInput ? "false" : "true"}
          >
            {isNa ? "N/A" : cellContent}
          </td>
        );
      })}
    </tr>
  );
}
