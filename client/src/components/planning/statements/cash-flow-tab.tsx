import { useMemo, useState, useCallback } from "react";
import { Pencil, ChevronDown, ChevronRight, Check, AlertTriangle, ArrowDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCents } from "@/lib/format-currency";
import { useColumnManager, ColumnToolbar, GroupedTableHead } from "./column-manager";
import type { EngineOutput, MonthlyProjection, AnnualSummary } from "@shared/financial-engine";
import type { ColumnDef } from "./column-manager";
import { getMonthlyValue } from "./column-manager";

interface CashFlowTabProps {
  output: EngineOutput;
}

interface CellTooltip {
  explanation: string;
  formula: string;
}

interface CfRowDef {
  key: string;
  label: string;
  field: string;
  format: "currency";
  isInput?: boolean;
  isSubtotal?: boolean;
  isTotal?: boolean;
  indent?: number;
  interpretationId?: string;
  interpretation?: (annuals: AnnualSummary[], monthly: MonthlyProjection[]) => string | null;
  tooltip?: CellTooltip;
}

interface CfSectionDef {
  key: string;
  title: string;
  rows: CfRowDef[];
  defaultExpanded?: boolean;
}

const CF_POINT_IN_TIME_FIELDS = new Set([
  "beginningCash", "endingCash",
]);

const CF_SECTIONS: CfSectionDef[] = [
  {
    key: "operating",
    title: "Operating Activities",
    rows: [
      { key: "net-income", label: "Net Income (Pre-Tax Income)", field: "preTaxIncome", format: "currency", indent: 1, tooltip: { explanation: "Profit before taxes from the income statement", formula: "Revenue - All Expenses" } },
      { key: "depreciation", label: "Add Back: Depreciation", field: "cfDepreciation", format: "currency", indent: 1, tooltip: { explanation: "Non-cash expense added back to cash flow", formula: "Monthly depreciation of fixed assets" } },
      { key: "ar-change", label: "Changes in Accounts Receivable", field: "cfAccountsReceivableChange", format: "currency", indent: 1, tooltip: { explanation: "Cash impact of changes in money owed to you", formula: "Prior AR - Current AR (decrease = cash inflow)" } },
      { key: "inventory-change", label: "Changes in Inventory", field: "cfInventoryChange", format: "currency", indent: 1, tooltip: { explanation: "Cash impact of changes in goods held for sale", formula: "Prior Inventory - Current Inventory" } },
      { key: "ap-change", label: "Changes in Accounts Payable", field: "cfAccountsPayableChange", format: "currency", indent: 1, tooltip: { explanation: "Cash impact of changes in amounts owed to suppliers", formula: "Current AP - Prior AP (increase = cash inflow)" } },
      { key: "tax-payable-change", label: "Changes in Tax Payable", field: "cfTaxPayableChange", format: "currency", indent: 1, tooltip: { explanation: "Cash impact of changes in taxes owed", formula: "Current Tax Payable - Prior Tax Payable" } },
      { key: "net-operating-cf", label: "Net Operating Cash Flow", field: "cfNetOperatingCashFlow", format: "currency", isSubtotal: true, tooltip: { explanation: "Cash generated from core business operations", formula: "Net Income + Depreciation + Working Capital Changes" } },
    ],
  },
  {
    key: "investing",
    title: "Investing Activities",
    rows: [
      { key: "capex", label: "Purchase of Fixed Assets (CapEx)", field: "cfCapexPurchase", format: "currency", indent: 1, tooltip: { explanation: "Cash spent on equipment and fixtures", formula: "Total capital expenditure purchases" } },
      { key: "net-before-financing", label: "Net Cash Before Financing", field: "cfNetBeforeFinancing", format: "currency", isSubtotal: true, tooltip: { explanation: "Cash position after operations and investments", formula: "Net Operating Cash Flow + CapEx" } },
    ],
  },
  {
    key: "financing",
    title: "Financing Activities",
    rows: [
      { key: "notes-payable", label: "Notes Payable (Proceeds/Repayments)", field: "cfNotesPayable", format: "currency", indent: 1, tooltip: { explanation: "Loan proceeds received or principal repaid", formula: "Loan drawdowns - Principal payments" } },
      { key: "loc-draws", label: "Line of Credit Draws/Repayments", field: "cfLineOfCredit", format: "currency", indent: 1, tooltip: { explanation: "Net draws or repayments on revolving credit line", formula: "LOC draws - LOC repayments" } },
      { key: "interest-expense", label: "Interest Expense", field: "cfInterestExpense", format: "currency", indent: 1, tooltip: { explanation: "Cash paid for interest on loans", formula: "Average loan balance x Interest rate / 12" } },
      { key: "distributions", label: "Distributions", field: "cfDistributions", format: "currency", indent: 1, tooltip: { explanation: "Cash distributed to owners", formula: "Monthly owner distribution amount" } },
      { key: "equity-issuance", label: "Equity Issuance", field: "cfEquityIssuance", format: "currency", indent: 1, tooltip: { explanation: "Cash received from owner equity contributions", formula: "Initial equity investment (Month 1 only)" } },
      { key: "net-financing-cf", label: "Net Financing Cash Flow", field: "cfNetFinancingCashFlow", format: "currency", isSubtotal: true, tooltip: { explanation: "Net cash from all financing activities", formula: "Notes + LOC + Interest + Distributions + Equity" } },
    ],
  },
  {
    key: "net-cash",
    title: "Net Cash Flow",
    rows: [
      {
        key: "net-cash-flow",
        label: "Net Cash Flow",
        field: "cfNetCashFlow",
        format: "currency",
        isTotal: true,
        tooltip: { explanation: "Total change in cash during the period", formula: "Net Cash Before Financing + Net Financing Cash Flow" },
        interpretationId: "interp-net-cash-flow",
        interpretation: (annuals) => {
          const y1 = annuals[0];
          if (!y1) return null;
          return `${formatCents(y1.netCashFlow)} net cash flow in Year 1`;
        },
      },
      { key: "beginning-cash", label: "Beginning Cash", field: "beginningCash", format: "currency", tooltip: { explanation: "Cash balance at the start of the period", formula: "Prior period ending cash" } },
      { key: "ending-cash", label: "Ending Cash", field: "endingCash", format: "currency", isSubtotal: true, tooltip: { explanation: "Cash balance at the end of the period", formula: "Beginning Cash + Net Cash Flow" } },
    ],
  },
];

function getCfCellValue(
  field: string,
  col: ColumnDef,
  annuals: AnnualSummary[],
  monthly: MonthlyProjection[],
): number {
  if (CF_POINT_IN_TIME_FIELDS.has(field)) {
    if (col.level === "annual") {
      if (field === "endingCash") {
        const a = annuals[col.year - 1];
        return a ? a.endingCash : 0;
      }
      if (field === "beginningCash") {
        const startIdx = (col.year - 1) * 12;
        const mp = monthly[startIdx];
        return mp ? mp.beginningCash : 0;
      }
    }
    if (col.level === "quarterly" && col.quarter) {
      if (field === "endingCash") {
        const endMonthIdx = (col.year - 1) * 12 + col.quarter * 3 - 1;
        const mp = monthly[endMonthIdx];
        return mp ? mp.endingCash : 0;
      }
      if (field === "beginningCash") {
        const startIdx = (col.year - 1) * 12 + (col.quarter - 1) * 3;
        const mp = monthly[startIdx];
        return mp ? mp.beginningCash : 0;
      }
    }
    if (col.level === "monthly" && col.month) {
      return getMonthlyValue(field, col.year, col.month, monthly);
    }
    return 0;
  }

  if (col.level === "annual") {
    if (field === "cfNetOperatingCashFlow") {
      const a = annuals[col.year - 1];
      return a ? a.operatingCashFlow : 0;
    }
    if (field === "cfNetCashFlow") {
      const a = annuals[col.year - 1];
      return a ? a.netCashFlow : 0;
    }
    const yearMonths = monthly.filter((m) => m.year === col.year);
    return yearMonths.reduce((s, m) => s + ((m as any)[field] ?? 0), 0);
  }

  if (col.level === "quarterly" && col.quarter) {
    const startIdx = (col.year - 1) * 12 + (col.quarter - 1) * 3;
    let sum = 0;
    for (let i = 0; i < 3; i++) {
      const mp = monthly[startIdx + i];
      if (mp) sum += (mp as any)[field] ?? 0;
    }
    return sum;
  }

  if (col.level === "monthly" && col.month) {
    return getMonthlyValue(field, col.year, col.month, monthly);
  }

  return 0;
}

export function CashFlowTab({ output }: CashFlowTabProps) {
  const { annualSummaries, monthlyProjections } = output;

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
    CF_SECTIONS.forEach((s) => {
      initial[s.key] = s.defaultExpanded ?? true;
    });
    return initial;
  });

  const toggleSection = useCallback((key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const lowestCash = useMemo(() => {
    let minVal = Infinity;
    let minMonth = 1;
    monthlyProjections.forEach((mp, idx) => {
      if (mp.endingCash < minVal) {
        minVal = mp.endingCash;
        minMonth = idx + 1;
      }
    });
    return { month: minMonth, value: minVal === Infinity ? 0 : minVal };
  }, [monthlyProjections]);

  return (
    <div className="space-y-0 pb-8" data-testid="cash-flow-tab">
      <CfCalloutBar
        annuals={annualSummaries}
        lowestCash={lowestCash}
      />
      <ColumnToolbar
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
        hasAnyDrillDown={hasAnyDrillDown}
        showLinkedIndicator={false}
      />
      <div className="overflow-x-auto" data-testid="cf-table">
        <table className="w-full text-sm" role="grid" aria-label="Cash Flow Statement">
          <GroupedTableHead
            columns={columns}
            getDrillLevel={getDrillLevel}
            onDrillDown={drillDown}
            onDrillUp={drillUp}
            hasAnyDrillDown={hasAnyDrillDown}
            testIdPrefix="cf"
          />
          <tbody>
            {CF_SECTIONS.map((section) => (
              <CfSection
                key={section.key}
                section={section}
                columns={visibleCols}
                annuals={annualSummaries}
                monthly={monthlyProjections}
                isExpanded={expandedSections[section.key] ?? true}
                onToggle={() => toggleSection(section.key)}
              />
            ))}
            <CfIdentityCheckRow
              columns={visibleCols}
              annuals={annualSummaries}
              monthly={monthlyProjections}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CfCalloutBar({
  annuals,
  lowestCash,
}: {
  annuals: AnnualSummary[];
  lowestCash: { month: number; value: number };
}) {
  const y1 = annuals[0];
  const y5 = annuals[4];
  if (!y1) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-4 px-4 py-3 border-b bg-muted/30 sticky top-0 z-30"
      data-testid="cf-callout-bar"
    >
      <CalloutMetric
        label="Net Cash Flow (Y1)"
        value={formatCents(y1.netCashFlow)}
        testId="cf-callout-net-cf-y1"
      />
      <div className="w-px h-8 bg-border" />
      <CalloutMetric
        label="Ending Cash (Y5)"
        value={y5 ? formatCents(y5.endingCash) : "N/A"}
        testId="cf-callout-ending-cash-y5"
      />
      <div className="w-px h-8 bg-border" />
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Lowest Cash Point</span>
        <span className="text-lg font-semibold font-mono tabular-nums" data-testid="cf-callout-lowest-cash">
          M{lowestCash.month}: {formatCents(lowestCash.value)}
        </span>
      </div>
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

interface CfSectionProps {
  section: CfSectionDef;
  columns: ColumnDef[];
  annuals: AnnualSummary[];
  monthly: MonthlyProjection[];
  isExpanded: boolean;
  onToggle: () => void;
}

function CfSection({ section, columns, annuals, monthly, isExpanded, onToggle }: CfSectionProps) {
  return (
    <>
      <tr
        className="bg-muted/40 cursor-pointer hover-elevate"
        data-testid={`cf-section-${section.key}`}
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
          <CfRow
            key={row.key}
            row={row}
            columns={columns}
            annuals={annuals}
            monthly={monthly}
          />
        ))}
    </>
  );
}

interface CfRowProps {
  row: CfRowDef;
  columns: ColumnDef[];
  annuals: AnnualSummary[];
  monthly: MonthlyProjection[];
}

function CfRow({ row, columns, annuals, monthly }: CfRowProps) {
  const rowClass = row.isTotal
    ? "font-semibold border-t-[3px] border-double border-b"
    : row.isSubtotal
      ? "font-medium border-t"
      : "";

  const paddingLeft = row.indent ? `${12 + row.indent * 16}px` : undefined;

  const inputCellClass = row.isInput
    ? "bg-primary/5 border-l-2 border-dashed border-primary/20"
    : "";

  const interpText = row.interpretation ? row.interpretation(annuals, monthly) : null;
  const interpId = row.interpretationId;

  const isEndingCashRow = row.field === "endingCash";

  return (
    <>
      <tr
        className={`${rowClass} hover-elevate group`}
        data-testid={`cf-row-${row.key}`}
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
          const value = getCfCellValue(row.field, col, annuals, monthly);
          const isNegative = value < 0;
          const cellContent = formatCents(value);

          const isNegativeEndingCash = isEndingCashRow && value < 0;

          const negativeCashClass = isNegativeEndingCash
            ? " bg-amber-50 dark:bg-amber-950/30"
            : "";
          const negativeTextClass = isNegative
            ? " text-amber-700 dark:text-amber-400"
            : "";

          if (!row.isInput && row.tooltip) {
            return (
              <td
                key={col.key}
                className={`py-1.5 px-3 text-right font-mono tabular-nums text-sm whitespace-nowrap${negativeTextClass}${negativeCashClass}`}
                data-testid={`cf-value-${row.key}-${col.key}`}
                role="gridcell"
                aria-readonly="true"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help inline-flex items-center gap-1">
                      {cellContent}
                      {isNegativeEndingCash && (
                        <ArrowDown className="h-3 w-3 text-amber-700 dark:text-amber-400 shrink-0" aria-label="Negative cash balance" />
                      )}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[260px]">
                    <p className="text-xs font-medium">{row.tooltip.explanation}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{row.tooltip.formula}</p>
                    <a
                      href="#glossary"
                      className="text-xs text-primary/50 mt-1 inline-block"
                      data-testid={`glossary-link-${row.key}`}
                      aria-disabled="true"
                      onClick={(e) => e.preventDefault()}
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
              className={`py-1.5 px-3 text-right font-mono tabular-nums text-sm whitespace-nowrap ${row.isInput ? inputCellClass : ""}${negativeTextClass}${negativeCashClass}`}
              data-testid={`cf-value-${row.key}-${col.key}`}
              role="gridcell"
              aria-readonly={row.isInput ? "false" : "true"}
            >
              <span className="inline-flex items-center gap-1">
                {cellContent}
                {isNegativeEndingCash && (
                  <ArrowDown className="h-3 w-3 text-amber-700 dark:text-amber-400 shrink-0" aria-label="Negative cash balance" />
                )}
              </span>
            </td>
          );
        })}
      </tr>
      {interpText && (
        <tr
          className="text-xs text-muted-foreground"
          data-testid={`cf-interp-${row.key}`}
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

function CfIdentityCheckRow({
  columns,
  annuals,
  monthly,
}: {
  columns: ColumnDef[];
  annuals: AnnualSummary[];
  monthly: MonthlyProjection[];
}) {
  return (
    <tr
      className="border-t-2 border-double"
      data-testid="cf-row-identity-check"
      role="row"
    >
      <td
        className="py-2 px-3 text-sm font-medium sticky left-0 bg-background z-10 min-w-[200px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]"
        role="rowheader"
      >
        Ending Cash = Beginning Cash + Net Cash Flow
      </td>
      {columns.map((col) => {
        const beginningCash = getCfCellValue("beginningCash", col, annuals, monthly);
        const netCashFlow = getCfCellValue("cfNetCashFlow", col, annuals, monthly);
        const endingCash = getCfCellValue("endingCash", col, annuals, monthly);
        const expected = beginningCash + netCashFlow;
        const diff = Math.abs(endingCash - expected);
        const passed = diff < 100;

        return (
          <td
            key={col.key}
            className={`py-2 px-3 text-right text-sm whitespace-nowrap ${passed ? "" : "bg-destructive/10 text-destructive"}`}
            data-testid={`cf-identity-${col.key}`}
            role="gridcell"
            aria-readonly="true"
          >
            {passed ? (
              <span className="flex items-center justify-end gap-1">
                <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400 shrink-0" />
                <span className="text-green-700 dark:text-green-400 font-medium">Pass</span>
              </span>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center justify-end gap-1 cursor-help">
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                    <span className="font-medium">Fail</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[260px]">
                  <p className="text-xs font-medium">Cash flow does not balance</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ending Cash: {formatCents(endingCash)} vs Beginning + Net: {formatCents(expected)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Difference: {formatCents(diff)}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </td>
        );
      })}
    </tr>
  );
}
