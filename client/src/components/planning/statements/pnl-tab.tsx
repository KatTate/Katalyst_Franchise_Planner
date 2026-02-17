import { useMemo, useState, useCallback } from "react";
import { Pencil, ChevronDown, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCents } from "@/lib/format-currency";
import { useColumnManager, ColumnHeaders } from "./column-manager";
import type { EngineOutput, MonthlyProjection, AnnualSummary, PLAnalysisOutput } from "@shared/financial-engine";
import type { ColumnDef } from "./column-manager";
import { getAnnualValue, getQuarterlyValue, getMonthlyValue } from "./column-manager";

interface PnlTabProps {
  output: EngineOutput;
}

interface CellTooltip {
  explanation: string;
  formula: string;
}

interface PnlRowDef {
  key: string;
  label: string;
  field: string;
  format: "currency" | "pct";
  isInput?: boolean;
  isSubtotal?: boolean;
  isTotal?: boolean;
  indent?: number;
  interpretationId?: string;
  interpretation?: (enriched: EnrichedAnnual[]) => string | null;
  tooltip?: CellTooltip;
}

interface PnlSectionDef {
  key: string;
  title: string;
  rows: PnlRowDef[];
  defaultExpanded?: boolean;
}

type EnrichedAnnual = AnnualSummary & {
  monthlyRevenue: number;
  cogsPct: number;
  materialsCogs: number;
  royalties: number;
  adFund: number;
  directLaborPct: number;
  managementSalaries: number;
  payrollTaxBenefits: number;
  facilities: number;
  marketing: number;
  discretionaryMarketing: number;
  otherOpex: number;
  nonCapexInvestment: number;
  opexPct: number;
};

function computeEnrichedAnnuals(monthly: MonthlyProjection[], annuals: AnnualSummary[]): EnrichedAnnual[] {
  return annuals.map((a) => {
    const yearMonths = monthly.filter((m) => m.year === a.year);
    const sum = (fn: (m: MonthlyProjection) => number) => yearMonths.reduce((s, m) => s + fn(m), 0);
    const revenue = a.revenue;
    const annualMarketing = sum((m) => m.marketing);
    return {
      ...a,
      monthlyRevenue: yearMonths.length > 0 ? Math.round(revenue / yearMonths.length) : 0,
      cogsPct: revenue !== 0 ? a.totalCogs / revenue : 0,
      materialsCogs: sum((m) => m.materialsCogs),
      royalties: sum((m) => m.royalties),
      adFund: sum((m) => m.adFund),
      directLaborPct: revenue !== 0 ? a.directLabor / revenue : 0,
      managementSalaries: sum((m) => m.managementSalaries),
      payrollTaxBenefits: sum((m) => m.payrollTaxBenefits),
      facilities: sum((m) => m.facilities),
      marketing: annualMarketing,
      discretionaryMarketing: annualMarketing,
      otherOpex: sum((m) => m.otherOpex),
      nonCapexInvestment: sum((m) => m.nonCapexInvestment),
      opexPct: revenue !== 0 ? a.totalOpex / revenue : 0,
    };
  });
}

const PNL_SECTIONS: PnlSectionDef[] = [
  {
    key: "revenue",
    title: "Revenue",
    rows: [
      { key: "monthly-revenue", label: "Monthly Revenue", field: "monthlyRevenue", format: "currency", isInput: true },
      { key: "annual-revenue", label: "Annual Revenue", field: "revenue", format: "currency", isSubtotal: true, tooltip: { explanation: "Total revenue earned during the year", formula: "Sum of monthly revenue" } },
    ],
  },
  {
    key: "cogs",
    title: "Cost of Sales",
    rows: [
      { key: "cogs-pct", label: "COGS %", field: "cogsPct", format: "pct", isInput: true },
      { key: "materials-cogs", label: "Materials / COGS", field: "materialsCogs", format: "currency", indent: 1, tooltip: { explanation: "Direct materials cost based on your COGS percentage", formula: "Revenue x COGS %" } },
      { key: "royalties", label: "Royalties", field: "royalties", format: "currency", indent: 1, tooltip: { explanation: "Franchise royalty fees paid to the brand", formula: "Revenue x Royalty rate" } },
      { key: "ad-fund", label: "Ad Fund", field: "adFund", format: "currency", indent: 1, tooltip: { explanation: "Required advertising fund contribution", formula: "Revenue x Ad fund rate" } },
      { key: "total-cogs", label: "Total Cost of Sales", field: "totalCogs", format: "currency", isSubtotal: true, tooltip: { explanation: "All costs directly tied to generating revenue", formula: "Materials + Royalties + Ad Fund" } },
    ],
  },
  {
    key: "gross-profit",
    title: "Gross Profit",
    rows: [
      {
        key: "gross-profit",
        label: "Gross Profit",
        field: "grossProfit",
        format: "currency",
        isSubtotal: true,
        tooltip: { explanation: "Revenue remaining after cost of sales", formula: "Revenue - Total Cost of Sales" },
        interpretationId: "interp-gross-profit",
        interpretation: (enriched) => {
          const y1 = enriched[0];
          if (!y1 || y1.revenue === 0) return null;
          const pct = (y1.grossProfitPct * 100).toFixed(1);
          return `${pct}% gross margin in Year 1`;
        },
      },
      { key: "gp-pct", label: "Gross Margin %", field: "grossProfitPct", format: "pct", tooltip: { explanation: "Percentage of revenue retained after cost of sales", formula: "Gross Profit / Revenue" } },
    ],
  },
  {
    key: "opex",
    title: "Operating Expenses",
    rows: [
      { key: "direct-labor", label: "Direct Labor", field: "directLabor", format: "currency", isInput: true, indent: 1 },
      { key: "dl-pct", label: "Direct Labor %", field: "directLaborPct", format: "pct", isInput: true, indent: 1 },
      { key: "mgmt-salaries", label: "Management Salaries", field: "managementSalaries", format: "currency", isInput: true, indent: 1 },
      { key: "payroll-tax", label: "Payroll Tax & Benefits", field: "payrollTaxBenefits", format: "currency", indent: 1, tooltip: { explanation: "Employer payroll taxes and employee benefits", formula: "(Direct Labor + Mgmt Salaries) x Payroll Tax rate" } },
      { key: "facilities", label: "Facilities", field: "facilities", format: "currency", isInput: true, indent: 1 },
      { key: "marketing", label: "Marketing / Advertising", field: "marketing", format: "currency", isInput: true, indent: 1 },
      { key: "disc-marketing", label: "Discretionary Marketing", field: "discretionaryMarketing", format: "currency", indent: 1, tooltip: { explanation: "Owner-directed marketing spend beyond required brand contributions", formula: "Same as Marketing in current model" } },
      { key: "other-opex", label: "Other OpEx", field: "otherOpex", format: "currency", isInput: true, indent: 1 },
      { key: "total-opex", label: "Total Operating Expenses", field: "totalOpex", format: "currency", isSubtotal: true, tooltip: { explanation: "Total cost of running the business day-to-day", formula: "Sum of all operating expense line items" } },
    ],
  },
  {
    key: "ebitda",
    title: "EBITDA",
    rows: [
      { key: "ebitda", label: "EBITDA", field: "ebitda", format: "currency", isSubtotal: true, tooltip: { explanation: "Earnings before interest, taxes, depreciation, and amortization", formula: "Gross Profit - Direct Labor - Total Operating Expenses" } },
      { key: "ebitda-pct", label: "EBITDA Margin %", field: "ebitdaPct", format: "pct", tooltip: { explanation: "EBITDA as a percentage of revenue", formula: "EBITDA / Revenue" } },
    ],
  },
  {
    key: "below-ebitda",
    title: "Below EBITDA",
    rows: [
      { key: "depreciation", label: "Depreciation & Amortization", field: "depreciation", format: "currency", indent: 1, tooltip: { explanation: "Non-cash expense spreading equipment cost over its useful life", formula: "CapEx / Depreciation years" } },
      { key: "interest", label: "Interest Expense", field: "interestExpense", format: "currency", indent: 1, tooltip: { explanation: "Cost of borrowing on your loan balance", formula: "Average loan balance x Interest rate" } },
    ],
  },
  {
    key: "pretax",
    title: "Pre-Tax Income",
    rows: [
      {
        key: "pretax-income",
        label: "Pre-Tax Income",
        field: "preTaxIncome",
        format: "currency",
        isTotal: true,
        tooltip: { explanation: "Your bottom-line profit before taxes", formula: "EBITDA - Depreciation - Interest Expense" },
        interpretationId: "interp-pretax-income",
        interpretation: (enriched) => {
          const y1 = enriched[0];
          if (!y1 || y1.revenue === 0) return null;
          const pct = (y1.preTaxIncomePct * 100).toFixed(1);
          return `${pct}% pre-tax margin in Year 1`;
        },
      },
      { key: "pretax-pct", label: "Pre-Tax Margin %", field: "preTaxIncomePct", format: "pct", tooltip: { explanation: "Pre-tax profit as a percentage of revenue", formula: "Pre-Tax Income / Revenue" } },
    ],
  },
  {
    key: "pl-analysis",
    title: "P&L Analysis",
    defaultExpanded: false,
    rows: [
      { key: "adj-pretax", label: "Adjusted Pre-Tax Profit", field: "adjustedPreTaxProfit", format: "currency", tooltip: { explanation: "Pre-tax income adjusted for owner compensation", formula: "Pre-Tax Income + Owner salary adjustment" } },
      { key: "target-pretax", label: "Target Pre-Tax Profit", field: "targetPreTaxProfit", format: "currency", tooltip: { explanation: "The profit level your plan should aim for", formula: "Revenue x Target Pre-Tax Profit %" } },
      { key: "above-below-target", label: "Above / Below Target", field: "aboveBelowTarget", format: "currency", tooltip: { explanation: "How far your adjusted profit is from the target", formula: "Adjusted Pre-Tax - Target Pre-Tax" } },
      { key: "salary-cap", label: "Salary Cap at Target", field: "salaryCapAtTarget", format: "currency", tooltip: { explanation: "Maximum owner salary to still hit the target profit", formula: "Derived from target profit and operating expenses" } },
      { key: "over-under-cap", label: "(Over) / Under Cap", field: "overUnderCap", format: "currency", tooltip: { explanation: "Whether your management salary is within the cap", formula: "Salary Cap - Actual Management Salaries" } },
      {
        key: "labor-eff",
        label: "Labor Efficiency",
        field: "laborEfficiency",
        format: "pct",
        tooltip: { explanation: "What portion of gross profit goes to all wages", formula: "Total wages / Gross Profit" },
        interpretationId: "interp-labor-eff",
        interpretation: (enriched) => {
          const y1 = enriched[0];
          if (!y1 || y1.revenue === 0) return null;
          return "Ratio of gross profit consumed by all wages";
        },
      },
      { key: "adj-labor-eff", label: "Adjusted Labor Efficiency", field: "adjustedLaborEfficiency", format: "pct", tooltip: { explanation: "Labor efficiency excluding owner salary", formula: "Wages (excl. owner salary) / Gross Profit" } },
      { key: "disc-mktg-pct", label: "Discretionary Marketing %", field: "discretionaryMarketingPct", format: "pct", tooltip: { explanation: "Discretionary marketing as a share of revenue", formula: "Discretionary Marketing / Revenue" } },
      { key: "pr-tax-ben-pct", label: "PR Taxes & Benefits % of Wages", field: "prTaxBenefitsPctOfWages", format: "pct", tooltip: { explanation: "Payroll burden relative to total wages", formula: "Payroll Taxes & Benefits / Total Wages" } },
      { key: "other-opex-pct-rev", label: "Other OpEx % of Revenue", field: "otherOpexPctOfRevenue", format: "pct", tooltip: { explanation: "Miscellaneous operating costs as a share of revenue", formula: "Other Operating Expenses / Revenue" } },
    ],
  },
];

function formatValue(value: number, format: "currency" | "pct"): string {
  if (format === "pct") return `${(value * 100).toFixed(1)}%`;
  return formatCents(value);
}

function getCellValue(
  field: string,
  col: ColumnDef,
  enriched: EnrichedAnnual[],
  monthly: MonthlyProjection[],
  plAnalysis: PLAnalysisOutput[],
  format: "currency" | "pct"
): number {
  if (field === "monthlyRevenue") {
    if (col.level === "annual") {
      const ea = enriched[col.year - 1];
      return ea ? ea.monthlyRevenue : 0;
    }
    if (col.level === "monthly" && col.month) {
      return getMonthlyValue("revenue", col.year, col.month, monthly);
    }
    if (col.level === "quarterly" && col.quarter) {
      const startMonth = (col.year - 1) * 12 + (col.quarter - 1) * 3;
      let sum = 0;
      let count = 0;
      for (let i = 0; i < 3; i++) {
        const mp = monthly[startMonth + i];
        if (mp) {
          sum += mp.revenue;
          count++;
        }
      }
      return count > 0 ? Math.round(sum / count) : 0;
    }
    return 0;
  }

  if (field === "discretionaryMarketing") {
    if (col.level === "annual") {
      const ea = enriched[col.year - 1];
      return ea ? ea.discretionaryMarketing : 0;
    }
    if (col.level === "monthly" && col.month) {
      return getMonthlyValue("marketing", col.year, col.month, monthly);
    }
    if (col.level === "quarterly" && col.quarter) {
      return getQuarterlyValue("marketing", col.year, col.quarter, monthly, format);
    }
    return 0;
  }

  if (col.level === "annual") {
    return getAnnualValue(field, col.year, enriched, plAnalysis);
  }
  if (col.level === "quarterly" && col.quarter) {
    return getQuarterlyValue(field, col.year, col.quarter, monthly, format);
  }
  if (col.level === "monthly" && col.month) {
    return getMonthlyValue(field, col.year, col.month, monthly);
  }
  return 0;
}

export function PnlTab({ output }: PnlTabProps) {
  const { annualSummaries, monthlyProjections, plAnalysis } = output;
  const enriched = useMemo(
    () => computeEnrichedAnnuals(monthlyProjections, annualSummaries),
    [monthlyProjections, annualSummaries]
  );

  const {
    drillDown,
    drillUp,
    getColumns,
    expandAll,
    collapseAll,
    hasAnyDrillDown,
    getDrillLevel,
  } = useColumnManager();

  const columns = getColumns();
  const annualCols = columns.filter((c) => c.level === "annual");
  const visibleCols = hasAnyDrillDown ? columns : annualCols;

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    PNL_SECTIONS.forEach((s) => {
      initial[s.key] = s.defaultExpanded ?? true;
    });
    return initial;
  });

  const toggleSection = useCallback((key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <div className="space-y-0 pb-8" data-testid="pnl-tab">
      <PnlCalloutBar enriched={enriched} />
      <ColumnHeaders
        columns={columns}
        getDrillLevel={getDrillLevel}
        onDrillDown={drillDown}
        onDrillUp={drillUp}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
        hasAnyDrillDown={hasAnyDrillDown}
        showLinkedIndicator={false}
      />
      <div className="overflow-x-auto" data-testid="pnl-table">
        <table className="w-full text-sm" role="grid" aria-label="Profit and Loss Statement">
          <thead>
            <tr className="border-b">
              <th
                className="text-left py-2 px-3 font-medium text-muted-foreground sticky left-0 bg-background z-10 min-w-[200px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]"
                scope="col"
              >
                &nbsp;
              </th>
              {visibleCols.map((col) => (
                <th
                  key={col.key}
                  className={`text-right py-2 px-3 font-medium text-muted-foreground whitespace-nowrap${col.level === "annual" ? " cursor-pointer select-none" : ""}`}
                  data-testid={`pnl-header-${col.key}`}
                  scope="col"
                  tabIndex={col.level === "annual" ? 0 : undefined}
                  onClick={col.level === "annual" ? () => drillDown(col.year) : undefined}
                  onKeyDown={
                    col.level === "annual"
                      ? (e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            drillDown(col.year);
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            drillUp(col.year);
                          }
                        }
                      : undefined
                  }
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PNL_SECTIONS.map((section) => (
              <PnlSection
                key={section.key}
                section={section}
                columns={visibleCols}
                enriched={enriched}
                monthly={monthlyProjections}
                plAnalysis={plAnalysis}
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

function PnlCalloutBar({ enriched }: { enriched: EnrichedAnnual[] }) {
  const y1 = enriched[0];
  if (!y1) return null;
  return (
    <div
      className="flex flex-wrap items-center gap-4 px-4 py-3 border-b bg-muted/30"
      data-testid="pnl-callout-bar"
    >
      <CalloutMetric
        label="Annual Revenue (Y1)"
        value={formatCents(y1.revenue)}
        testId="pnl-callout-revenue-y1"
      />
      <div className="w-px h-8 bg-border" />
      <CalloutMetric
        label="Pre-Tax Income (Y1)"
        value={formatCents(y1.preTaxIncome)}
        testId="pnl-callout-pretax-y1"
      />
      <div className="w-px h-8 bg-border" />
      <CalloutMetric
        label="Pre-Tax Margin %"
        value={`${(y1.preTaxIncomePct * 100).toFixed(1)}%`}
        testId="pnl-callout-margin-y1"
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

interface PnlSectionProps {
  section: PnlSectionDef;
  columns: ColumnDef[];
  enriched: EnrichedAnnual[];
  monthly: MonthlyProjection[];
  plAnalysis: PLAnalysisOutput[];
  isExpanded: boolean;
  onToggle: () => void;
}

function PnlSection({ section, columns, enriched, monthly, plAnalysis, isExpanded, onToggle }: PnlSectionProps) {
  return (
    <>
      <tr
        className="bg-muted/40 sticky top-0 z-20 cursor-pointer hover-elevate"
        data-testid={`pnl-section-${section.key}`}
        onClick={onToggle}
        role="row"
      >
        <td
          className="py-2 px-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground sticky left-0 bg-muted/40 z-20"
          colSpan={columns.length + 1}
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
          <PnlRow
            key={row.key}
            row={row}
            columns={columns}
            enriched={enriched}
            monthly={monthly}
            plAnalysis={plAnalysis}
          />
        ))}
    </>
  );
}

interface PnlRowProps {
  row: PnlRowDef;
  columns: ColumnDef[];
  enriched: EnrichedAnnual[];
  monthly: MonthlyProjection[];
  plAnalysis: PLAnalysisOutput[];
}

function PnlRow({ row, columns, enriched, monthly, plAnalysis }: PnlRowProps) {
  const rowClass = row.isTotal
    ? "font-semibold border-t-2 border-b"
    : row.isSubtotal
      ? "font-medium border-t"
      : "";

  const paddingLeft = row.indent ? `${12 + row.indent * 16}px` : undefined;

  const inputCellClass = row.isInput
    ? "bg-primary/5 border-l-2 border-dashed border-primary/20"
    : "";

  const interpText = row.interpretation ? row.interpretation(enriched) : null;
  const interpId = row.interpretationId;

  return (
    <>
      <tr
        className={`${rowClass} hover-elevate group`}
        data-testid={`pnl-row-${row.key}`}
        role="row"
        aria-describedby={interpText && interpId ? interpId : undefined}
      >
        <td
          className={`py-1.5 px-3 text-sm sticky left-0 bg-background z-10 min-w-[200px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)] ${inputCellClass}`}
          style={{ paddingLeft }}
          role="rowheader"
        >
          <span className="flex items-center gap-1.5">
            {row.label}
            {row.isInput && (
              <Pencil
                className="h-3 w-3 text-primary/40 invisible group-hover:visible shrink-0"
                aria-label="Editable field"
              />
            )}
          </span>
        </td>
        {columns.map((col) => {
          const value = getCellValue(row.field, col, enriched, monthly, plAnalysis, row.format);
          const isNegative = value < 0;
          const cellContent = formatValue(value, row.format);

          if (!row.isInput && row.tooltip) {
            return (
              <td
                key={col.key}
                className={`py-1.5 px-3 text-right font-mono tabular-nums text-sm whitespace-nowrap${isNegative ? " text-amber-700 dark:text-amber-400" : ""}`}
                data-testid={`pnl-value-${row.key}-${col.key}`}
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
                    <a
                      href="#glossary"
                      className="text-xs text-primary underline mt-1 inline-block"
                      data-testid={`glossary-link-${row.key}`}
                    >
                      View in glossary
                    </a>
                  </TooltipContent>
                </Tooltip>
              </td>
            );
          }

          return (
            <td
              key={col.key}
              className={`py-1.5 px-3 text-right font-mono tabular-nums text-sm whitespace-nowrap ${row.isInput ? inputCellClass : ""}${isNegative ? " text-amber-700 dark:text-amber-400" : ""}`}
              data-testid={`pnl-value-${row.key}-${col.key}`}
              role="gridcell"
              aria-readonly={row.isInput ? "false" : "true"}
            >
              {cellContent}
            </td>
          );
        })}
      </tr>
      {interpText && (
        <tr
          className="text-xs text-muted-foreground"
          data-testid={`pnl-interp-${row.key}`}
          id={interpId}
          role="row"
        >
          <td colSpan={columns.length + 1} className="py-1 px-3 pl-8 italic">
            {interpText}
          </td>
        </tr>
      )}
    </>
  );
}
