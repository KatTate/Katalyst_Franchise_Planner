import { useState, useCallback } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatFinancialValue } from "@/components/shared/financial-value";
import { Link } from "wouter";
import type { EngineOutput, ROICExtendedOutput } from "@shared/financial-engine";

import { SCENARIO_COLORS, type ScenarioId, type ScenarioOutputs } from "@/lib/scenario-engine";

interface RoicTabProps {
  output: EngineOutput;
  scenarioOutputs?: ScenarioOutputs | null;
}

interface CellTooltip {
  explanation: string;
  formula: string;
  glossarySlug?: string;
}

interface RoicRowDef {
  key: string;
  label: string;
  field: keyof ROICExtendedOutput;
  format: "currency" | "pct" | "number" | "months";
  isSubtotal?: boolean;
  isTotal?: boolean;
  indent?: number;
  tooltip?: CellTooltip;
}

interface RoicSectionDef {
  key: string;
  title: string;
  rows: RoicRowDef[];
  defaultExpanded?: boolean;
}

const ROIC_SECTIONS: RoicSectionDef[] = [
  {
    key: "invested-capital",
    title: "Invested Capital",
    rows: [
      { key: "outside-cash", label: "Outside Cash (Equity)", field: "outsideCash", format: "currency", indent: 1, tooltip: { explanation: "Owner's equity investment into the business", formula: "Initial equity contribution" } },
      { key: "total-loans", label: "Total Loans (Debt)", field: "totalLoans", format: "currency", indent: 1, tooltip: { explanation: "Total debt financing obtained", formula: "Initial loan amount" } },
      { key: "total-cash-invested", label: "Total Cash Invested", field: "totalCashInvested", format: "currency", isSubtotal: true, tooltip: { explanation: "Sum of equity and debt financing", formula: "Outside Cash + Total Loans" } },
      { key: "total-sweat-equity", label: "Total Sweat Equity", field: "totalSweatEquity", format: "currency", indent: 1, tooltip: { explanation: "Cumulative below-market salary adjustment representing owner labor value", formula: "Cumulative Shareholder Salary Adjustment" } },
      { key: "retained-earnings", label: "Retained Earnings Less Distributions", field: "retainedEarningsLessDistributions", format: "currency", indent: 1, tooltip: { explanation: "Accumulated profits remaining in the business after owner distributions", formula: "Year-end Retained Earnings balance" } },
      { key: "total-invested-capital", label: "Total Invested Capital", field: "totalInvestedCapital", format: "currency", isTotal: true, tooltip: { explanation: "Full economic capital deployed in the business", formula: "Total Cash Invested + Sweat Equity + Retained Earnings" } },
    ],
  },
  {
    key: "return-analysis",
    title: "Return Analysis",
    rows: [
      { key: "pre-tax-net-income", label: "Pre-Tax Net Income", field: "preTaxNetIncome", format: "currency", indent: 1, tooltip: { explanation: "Profit before taxes from the income statement", formula: "Revenue - All Expenses" } },
      { key: "pre-tax-inc-sweat", label: "Pre-Tax Net Income incl. Sweat Equity", field: "preTaxNetIncomeIncSweatEquity", format: "currency", indent: 1, tooltip: { explanation: "Net income adjusted for owner's below-market salary (subtracts the unpaid salary as an expense)", formula: "Pre-Tax Net Income - Shareholder Salary Adjustment" } },
      { key: "tax-rate", label: "Tax Rate", field: "taxRate", format: "pct", indent: 1, tooltip: { explanation: "Applicable corporate/franchise tax rate", formula: "From financial inputs" } },
      { key: "taxes-due", label: "Taxes Due", field: "taxesDue", format: "currency", indent: 1, tooltip: { explanation: "Estimated tax liability for the year", formula: "Max(0, Pre-Tax incl. Sweat Equity) x Tax Rate" } },
      { key: "after-tax-net-income", label: "After-Tax Net Income", field: "afterTaxNetIncome", format: "currency", isSubtotal: true, tooltip: { explanation: "Net income after estimated taxes", formula: "Pre-Tax incl. Sweat Equity - Taxes Due" } },
      { key: "roic-pct", label: "ROIC %", field: "roicPct", format: "pct", isTotal: true, tooltip: { explanation: "Return on total invested capital — measures how efficiently the business uses all capital", formula: "Pre-Tax Net Income (incl. Sweat Equity) / Total Invested Capital", glossarySlug: "roic" } },
    ],
  },
  {
    key: "core-capital",
    title: "Core Capital Analysis",
    defaultExpanded: true,
    rows: [
      { key: "avg-core-capital", label: "Avg Core Capital / Month", field: "avgCoreCapitalPerMonth", format: "currency", indent: 1, tooltip: { explanation: "Average monthly operating capital requirement based on opex and direct labor", formula: "(Total OpEx + Direct Labor) / 12" } },
      { key: "months-core-capital", label: "Months of Core Capital", field: "monthsOfCoreCapital", format: "months", indent: 1, tooltip: { explanation: "How many months your ending cash covers operating needs", formula: "Ending Cash / Avg Core Capital per Month" } },
      { key: "excess-core-capital", label: "Excess Core Capital", field: "excessCoreCapital", format: "currency", indent: 1, tooltip: { explanation: "Cash above what's needed for 3 months of operating expenses", formula: "Ending Cash - (3 x Avg Core Capital per Month)" } },
    ],
  },
];

function formatRoicValue(value: number, format: "currency" | "pct" | "number" | "months"): string {
  return formatFinancialValue(value, format);
}

export function RoicTab({ output, scenarioOutputs }: RoicTabProps) {
  const { roicExtended } = output;
  const comparisonActive = !!scenarioOutputs;

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    ROIC_SECTIONS.forEach((s) => {
      initial[s.key] = s.defaultExpanded ?? true;
    });
    return initial;
  });

  const toggleSection = useCallback((key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const SCENARIOS: ScenarioId[] = ["base", "conservative", "optimistic"];

  if (comparisonActive && scenarioOutputs) {
    return (
      <div className="space-y-0 pb-8" data-testid="roic-tab">
        <div className="overflow-x-auto" data-testid="roic-table">
          <table className="w-full text-sm" role="grid" aria-label="ROIC Analysis — Scenario Comparison">
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
              {ROIC_SECTIONS.map((section) => (
                <ComparisonRoicSection
                  key={section.key}
                  section={section}
                  scenarioOutputs={scenarioOutputs}
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
    <div className="space-y-0 pb-8" data-testid="roic-tab">
      <div className="overflow-x-auto" data-testid="roic-table">
        <table className="w-full text-sm" role="grid" aria-label="ROIC Analysis">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sticky left-0 bg-background z-20 min-w-[240px]">
                Metric
              </th>
              {roicExtended.map((r) => (
                <th
                  key={r.year}
                  className="py-2 px-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap min-w-[100px]"
                  data-testid={`roic-col-year-${r.year}`}
                >
                  Year {r.year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROIC_SECTIONS.map((section) => (
              <RoicSection
                key={section.key}
                section={section}
                roicExtended={roicExtended}
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


interface RoicSectionProps {
  section: RoicSectionDef;
  roicExtended: ROICExtendedOutput[];
  isExpanded: boolean;
  onToggle: () => void;
}

function RoicSection({ section, roicExtended, isExpanded, onToggle }: RoicSectionProps) {
  return (
    <>
      <tr
        className="bg-muted/40 cursor-pointer hover-elevate"
        data-testid={`roic-section-${section.key}`}
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
          colSpan={roicExtended.length + 1}
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
          <RoicRow
            key={row.key}
            row={row}
            roicExtended={roicExtended}
          />
        ))}
    </>
  );
}

function ComparisonRoicSection({
  section,
  scenarioOutputs,
  isExpanded,
  onToggle,
}: {
  section: RoicSectionDef;
  scenarioOutputs: ScenarioOutputs;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const SCENARIOS: ScenarioId[] = ["base", "conservative", "optimistic"];
  const totalCols = 5 * 3;

  return (
    <>
      <tr
        className="bg-muted/40 cursor-pointer hover-elevate"
        data-testid={`roic-section-${section.key}`}
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
              data-testid={`roic-row-${row.key}`}
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
                  const roicExt = scenarioOutputs[scenario].roicExtended;
                  const yearData = roicExt[year - 1];
                  const value = yearData ? (yearData[row.field] as number) : 0;
                  const isNegative = value < 0;
                  const cellContent = formatRoicValue(value, row.format);

                  return (
                    <td
                      key={`y${year}-${scenario}`}
                      className={`py-1.5 px-3 text-right font-mono tabular-nums text-sm whitespace-nowrap ${SCENARIO_COLORS[scenario].bg}${isNegative ? " text-amber-700 dark:text-amber-400" : ""}${sIdx === 0 && yi > 0 ? " border-l-2 border-border/40" : ""}`}
                      data-testid={`roic-value-${row.key}-y${year}-${scenario}`}
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

function RoicRow({ row, roicExtended }: { row: RoicRowDef; roicExtended: ROICExtendedOutput[] }) {
  const rowClass = row.isTotal
    ? "font-semibold border-t-[3px] border-double border-b"
    : row.isSubtotal
      ? "font-medium border-t"
      : "";

  const paddingLeft = row.indent ? `${12 + row.indent * 16}px` : undefined;

  return (
    <tr
      className={`${rowClass} hover-elevate group`}
      data-testid={`roic-row-${row.key}`}
      role="row"
    >
      <td
        className="py-1.5 px-3 text-sm sticky left-0 bg-background z-10 min-w-[240px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]"
        style={{ paddingLeft }}
        role="rowheader"
      >
        {row.label}
      </td>
      {roicExtended.map((yearData) => {
        const value = yearData[row.field] as number;
        const isNegative = value < 0;
        const cellContent = formatRoicValue(value, row.format);

        if (row.tooltip) {
          return (
            <td
              key={yearData.year}
              className={`py-1.5 px-3 text-right font-mono tabular-nums text-sm whitespace-nowrap${isNegative ? " text-amber-700 dark:text-amber-400" : ""}`}
              data-testid={`roic-value-${row.key}-y${yearData.year}`}
              role="gridcell"
              aria-readonly="true"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">{cellContent}</span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[260px]">
                  <p className="text-xs font-medium">{row.tooltip.explanation}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{row.tooltip.formula}</p>
                  <Link
                    href={row.tooltip.glossarySlug ? `/glossary/${row.tooltip.glossarySlug}` : "/glossary"}
                    className="text-xs text-primary mt-1 inline-block cursor-pointer"
                    data-testid={`glossary-link-${row.key}`}
                  >
                    View in glossary
                  </Link>
                </TooltipContent>
              </Tooltip>
            </td>
          );
        }

        return (
          <td
            key={yearData.year}
            className={`py-1.5 px-3 text-right font-mono tabular-nums text-sm whitespace-nowrap${isNegative ? " text-amber-700 dark:text-amber-400" : ""}`}
            data-testid={`roic-value-${row.key}-y${yearData.year}`}
            role="gridcell"
            aria-readonly="true"
          >
            {cellContent}
          </td>
        );
      })}
    </tr>
  );
}
