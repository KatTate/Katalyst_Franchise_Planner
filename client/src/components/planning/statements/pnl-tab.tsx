import { useMemo, useCallback } from "react";
import { Pencil } from "lucide-react";
import { formatCents } from "@/lib/format-currency";
import { useColumnManager, ColumnHeaders } from "./column-manager";
import type { EngineOutput, MonthlyProjection, AnnualSummary, PLAnalysisOutput } from "@shared/financial-engine";
import type { ColumnDef } from "./column-manager";
import { getAnnualValue, getQuarterlyValue, getMonthlyValue } from "./column-manager";

interface PnlTabProps {
  output: EngineOutput;
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
}

interface PnlSectionDef {
  key: string;
  title: string;
  rows: PnlRowDef[];
}

type EnrichedAnnual = AnnualSummary & {
  cogsPct: number;
  materialsCogs: number;
  royalties: number;
  adFund: number;
  directLaborPct: number;
  managementSalaries: number;
  payrollTaxBenefits: number;
  facilities: number;
  marketing: number;
  otherOpex: number;
  nonCapexInvestment: number;
  opexPct: number;
};

function computeEnrichedAnnuals(monthly: MonthlyProjection[], annuals: AnnualSummary[]): EnrichedAnnual[] {
  return annuals.map((a) => {
    const yearMonths = monthly.filter((m) => m.year === a.year);
    const sum = (fn: (m: MonthlyProjection) => number) => yearMonths.reduce((s, m) => s + fn(m), 0);
    const revenue = a.revenue;
    return {
      ...a,
      cogsPct: revenue !== 0 ? a.totalCogs / revenue : 0,
      materialsCogs: sum((m) => m.materialsCogs),
      royalties: sum((m) => m.royalties),
      adFund: sum((m) => m.adFund),
      directLaborPct: revenue !== 0 ? a.directLabor / revenue : 0,
      managementSalaries: sum((m) => m.managementSalaries),
      payrollTaxBenefits: sum((m) => m.payrollTaxBenefits),
      facilities: sum((m) => m.facilities),
      marketing: sum((m) => m.marketing),
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
      { key: "monthly-revenue", label: "Monthly Revenue", field: "revenue", format: "currency", isInput: true },
      { key: "annual-revenue", label: "Annual Revenue", field: "revenue", format: "currency", isSubtotal: true },
    ],
  },
  {
    key: "cogs",
    title: "Cost of Sales",
    rows: [
      { key: "cogs-pct", label: "COGS %", field: "cogsPct", format: "pct", isInput: true },
      { key: "materials-cogs", label: "Materials / COGS", field: "materialsCogs", format: "currency", indent: 1 },
      { key: "royalties", label: "Royalties", field: "royalties", format: "currency", indent: 1 },
      { key: "ad-fund", label: "Ad Fund", field: "adFund", format: "currency", indent: 1 },
      { key: "total-cogs", label: "Total Cost of Sales", field: "totalCogs", format: "currency", isSubtotal: true },
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
        interpretationId: "interp-gross-profit",
        interpretation: (enriched) => {
          const y1 = enriched[0];
          if (!y1 || y1.revenue === 0) return null;
          const pct = (y1.grossProfitPct * 100).toFixed(1);
          return `${pct}% gross margin in Year 1`;
        },
      },
      { key: "gp-pct", label: "Gross Margin %", field: "grossProfitPct", format: "pct" },
    ],
  },
  {
    key: "opex",
    title: "Operating Expenses",
    rows: [
      { key: "direct-labor", label: "Direct Labor", field: "directLabor", format: "currency", isInput: true, indent: 1 },
      { key: "dl-pct", label: "Direct Labor %", field: "directLaborPct", format: "pct", isInput: true, indent: 1 },
      { key: "mgmt-salaries", label: "Management Salaries", field: "managementSalaries", format: "currency", isInput: true, indent: 1 },
      { key: "payroll-tax", label: "Payroll Tax & Benefits", field: "payrollTaxBenefits", format: "currency", indent: 1 },
      { key: "facilities", label: "Facilities", field: "facilities", format: "currency", isInput: true, indent: 1 },
      { key: "marketing", label: "Marketing / Advertising", field: "marketing", format: "currency", isInput: true, indent: 1 },
      { key: "other-opex", label: "Other OpEx", field: "otherOpex", format: "currency", isInput: true, indent: 1 },
      { key: "total-opex", label: "Total Operating Expenses", field: "totalOpex", format: "currency", isSubtotal: true },
    ],
  },
  {
    key: "ebitda",
    title: "EBITDA",
    rows: [
      { key: "ebitda", label: "EBITDA", field: "ebitda", format: "currency", isSubtotal: true },
      { key: "ebitda-pct", label: "EBITDA Margin %", field: "ebitdaPct", format: "pct" },
    ],
  },
  {
    key: "below-ebitda",
    title: "Below EBITDA",
    rows: [
      { key: "depreciation", label: "Depreciation & Amortization", field: "depreciation", format: "currency", indent: 1 },
      { key: "interest", label: "Interest Expense", field: "interestExpense", format: "currency", indent: 1 },
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
        interpretationId: "interp-pretax-income",
        interpretation: (enriched) => {
          const y1 = enriched[0];
          if (!y1 || y1.revenue === 0) return null;
          const pct = (y1.preTaxIncomePct * 100).toFixed(1);
          return `${pct}% pre-tax margin in Year 1`;
        },
      },
      { key: "pretax-pct", label: "Pre-Tax Margin %", field: "preTaxIncomePct", format: "pct" },
    ],
  },
  {
    key: "pl-analysis",
    title: "P&L Analysis",
    rows: [
      { key: "adj-pretax", label: "Adjusted Pre-Tax Profit", field: "adjustedPreTaxProfit", format: "currency" },
      { key: "target-pretax", label: "Target Pre-Tax Profit", field: "targetPreTaxProfit", format: "currency" },
      { key: "above-below-target", label: "Above / Below Target", field: "aboveBelowTarget", format: "currency" },
      { key: "salary-cap", label: "Salary Cap at Target", field: "salaryCapAtTarget", format: "currency" },
      { key: "over-under-cap", label: "(Over) / Under Cap", field: "overUnderCap", format: "currency" },
      {
        key: "labor-eff",
        label: "Labor Efficiency",
        field: "laborEfficiency",
        format: "pct",
        interpretationId: "interp-labor-eff",
        interpretation: (enriched) => {
          const y1 = enriched[0];
          if (!y1 || y1.revenue === 0) return null;
          return "Ratio of gross profit consumed by all wages";
        },
      },
      { key: "adj-labor-eff", label: "Adjusted Labor Efficiency", field: "adjustedLaborEfficiency", format: "pct" },
      { key: "disc-mktg-pct", label: "Discretionary Marketing %", field: "discretionaryMarketingPct", format: "pct" },
      { key: "pr-tax-ben-pct", label: "PR Taxes & Benefits % of Wages", field: "prTaxBenefitsPctOfWages", format: "pct" },
      { key: "other-opex-pct-rev", label: "Other OpEx % of Revenue", field: "otherOpexPctOfRevenue", format: "pct" },
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
}

function PnlSection({ section, columns, enriched, monthly, plAnalysis }: PnlSectionProps) {
  return (
    <>
      <tr
        className="bg-muted/40 sticky top-0 z-20"
        data-testid={`pnl-section-${section.key}`}
      >
        <td
          className="py-2 px-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground sticky left-0 bg-muted/40 z-20"
          colSpan={columns.length + 1}
        >
          {section.title}
        </td>
      </tr>
      {section.rows.map((row) => (
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
          return (
            <td
              key={col.key}
              className={`py-1.5 px-3 text-right font-mono tabular-nums text-sm whitespace-nowrap ${row.isInput ? inputCellClass : ""}${isNegative ? " text-amber-700 dark:text-amber-400" : ""}`}
              data-testid={`pnl-value-${row.key}-${col.key}`}
              role="gridcell"
              aria-readonly={row.isInput ? "false" : "true"}
            >
              {formatValue(value, row.format)}
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
