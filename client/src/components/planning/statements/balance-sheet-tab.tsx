import { useMemo, useState, useCallback } from "react";
import { Pencil, ChevronDown, ChevronRight, Check, AlertTriangle, ArrowDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCents } from "@/lib/format-currency";
import { useColumnManager, ColumnToolbar, GroupedTableHead } from "./column-manager";
import type { EngineOutput, MonthlyProjection, AnnualSummary, ROICExtendedOutput } from "@shared/financial-engine";
import type { ColumnDef } from "./column-manager";
import { getAnnualValue, getQuarterlyValue, getMonthlyValue } from "./column-manager";

interface BalanceSheetTabProps {
  output: EngineOutput;
}

interface CellTooltip {
  explanation: string;
  formula: string;
}

interface BsRowDef {
  key: string;
  label: string;
  field: string;
  format: "currency" | "pct" | "number" | "months";
  isInput?: boolean;
  isSubtotal?: boolean;
  isTotal?: boolean;
  indent?: number;
  interpretationId?: string;
  interpretation?: (enriched: EnrichedBsAnnual[]) => string | null;
  tooltip?: CellTooltip;
}

interface BsSectionDef {
  key: string;
  title: string;
  rows: BsRowDef[];
  defaultExpanded?: boolean;
}

type EnrichedBsAnnual = AnnualSummary & {
  cash: number;
  accountsReceivable: number;
  inventory: number;
  totalCurrentAssets: number;
  grossFixedAssets: number;
  accumulatedDepreciation: number;
  netFixedAssets: number;
  accountsPayable: number;
  taxPayable: number;
  lineOfCredit: number;
  totalCurrentLiabilities: number;
  notesPayable: number;
  totalLongTermLiabilities: number;
  commonStock: number;
  retainedEarnings: number;
  totalLiabilitiesAndEquity: number;
  arDso: number;
  apPctOfCogs: number;
};

function computeEnrichedBsAnnuals(monthly: MonthlyProjection[], annuals: AnnualSummary[]): EnrichedBsAnnual[] {
  return annuals.map((a) => {
    const yearMonths = monthly.filter((m) => m.year === a.year);
    const lastMonth = yearMonths[yearMonths.length - 1];

    const endingCash = lastMonth ? lastMonth.endingCash : 0;
    const ar = lastMonth ? lastMonth.accountsReceivable : 0;
    const inv = lastMonth ? lastMonth.inventory : 0;
    const tca = lastMonth ? lastMonth.totalCurrentAssets : 0;
    const nfa = lastMonth ? lastMonth.netFixedAssets : 0;
    const ap = lastMonth ? lastMonth.accountsPayable : 0;
    const tp = lastMonth ? lastMonth.taxPayable : 0;
    const loc = lastMonth ? lastMonth.lineOfCredit : 0;
    const tcl = lastMonth ? lastMonth.totalCurrentLiabilities : 0;
    const cs = lastMonth ? lastMonth.commonStock : 0;
    const re = lastMonth ? lastMonth.retainedEarnings : 0;
    const tlae = lastMonth ? lastMonth.totalLiabilitiesAndEquity : 0;
    const loanClosing = lastMonth ? lastMonth.loanClosingBalance : 0;

    const monthlyRevenue = a.revenue / 12;
    const arDso = monthlyRevenue !== 0 ? (ar / monthlyRevenue) * 30 : 0;
    const apPctOfCogs = a.totalCogs !== 0 ? ap / a.totalCogs : 0;

    const totalDepreciation = yearMonths.reduce((s, m) => s + m.depreciation, 0);
    const grossFA = nfa + totalDepreciation * a.year;

    return {
      ...a,
      cash: endingCash,
      accountsReceivable: ar,
      inventory: inv,
      totalCurrentAssets: tca,
      grossFixedAssets: grossFA,
      accumulatedDepreciation: -(totalDepreciation * a.year),
      netFixedAssets: nfa,
      accountsPayable: ap,
      taxPayable: tp,
      lineOfCredit: loc,
      totalCurrentLiabilities: tcl,
      notesPayable: loanClosing,
      totalLongTermLiabilities: loanClosing,
      commonStock: cs,
      retainedEarnings: re,
      totalLiabilitiesAndEquity: tlae,
      arDso,
      apPctOfCogs,
    };
  });
}

const BS_SECTIONS: BsSectionDef[] = [
  {
    key: "current-assets",
    title: "Current Assets",
    rows: [
      { key: "cash", label: "Cash", field: "endingCash", format: "currency", indent: 1, tooltip: { explanation: "Cash available at the end of the period", formula: "Beginning Cash + Net Cash Flow" } },
      { key: "accounts-receivable", label: "Accounts Receivable", field: "accountsReceivable", format: "currency", indent: 1, tooltip: { explanation: "Revenue earned but not yet collected", formula: "Revenue x (AR Days / 30)" } },
      { key: "inventory", label: "Inventory", field: "inventory", format: "currency", indent: 1, tooltip: { explanation: "Value of goods held for sale", formula: "COGS x (Inventory Days / 365)" } },
      { key: "total-current-assets", label: "Total Current Assets", field: "totalCurrentAssets", format: "currency", isSubtotal: true, tooltip: { explanation: "Sum of all short-term assets", formula: "Cash + Accounts Receivable + Inventory" } },
    ],
  },
  {
    key: "fixed-assets",
    title: "Fixed Assets",
    rows: [
      { key: "gross-fixed-assets", label: "Equipment (Gross Fixed Assets)", field: "grossFixedAssets", format: "currency", indent: 1, tooltip: { explanation: "Total original cost of equipment and fixtures", formula: "Sum of all CapEx purchases" } },
      { key: "accumulated-depreciation", label: "Accumulated Depreciation", field: "accumulatedDepreciation", format: "currency", indent: 1, tooltip: { explanation: "Total depreciation charged since purchase", formula: "Cumulative monthly depreciation" } },
      { key: "net-fixed-assets", label: "Net Book Value (Net Fixed Assets)", field: "netFixedAssets", format: "currency", isSubtotal: true, tooltip: { explanation: "Current book value of fixed assets", formula: "Gross Fixed Assets - Accumulated Depreciation" } },
    ],
  },
  {
    key: "total-assets",
    title: "Total Assets",
    rows: [
      {
        key: "total-assets",
        label: "Total Assets",
        field: "totalAssets",
        format: "currency",
        isTotal: true,
        tooltip: { explanation: "Everything the business owns", formula: "Total Current Assets + Net Fixed Assets" },
        interpretationId: "interp-total-assets",
        interpretation: (enriched) => {
          const y1 = enriched[0];
          if (!y1) return null;
          return `${formatCents(y1.totalAssets)} in total assets at end of Year 1`;
        },
      },
    ],
  },
  {
    key: "current-liabilities",
    title: "Current Liabilities",
    rows: [
      { key: "accounts-payable", label: "Accounts Payable", field: "accountsPayable", format: "currency", indent: 1, tooltip: { explanation: "Amounts owed to suppliers for goods or services", formula: "COGS x (AP Days / 365)" } },
      { key: "tax-payable", label: "Tax Payable", field: "taxPayable", format: "currency", indent: 1, tooltip: { explanation: "Taxes accrued but not yet paid", formula: "Based on tax payment timing" } },
      { key: "line-of-credit", label: "Line of Credit", field: "lineOfCredit", format: "currency", indent: 1, tooltip: { explanation: "Short-term revolving credit facility balance", formula: "Draws - Repayments" } },
      { key: "total-current-liabilities", label: "Total Current Liabilities", field: "totalCurrentLiabilities", format: "currency", isSubtotal: true, tooltip: { explanation: "Sum of all short-term obligations", formula: "AP + Tax Payable + Line of Credit" } },
    ],
  },
  {
    key: "long-term-liabilities",
    title: "Long-Term Liabilities",
    rows: [
      { key: "notes-payable", label: "Notes Payable", field: "loanClosingBalance", format: "currency", indent: 1, tooltip: { explanation: "Outstanding balance on long-term loans", formula: "Opening Balance - Principal Payments" } },
      { key: "total-lt-liabilities", label: "Total Long-Term Liabilities", field: "loanClosingBalance", format: "currency", isSubtotal: true, tooltip: { explanation: "Sum of all long-term debt obligations", formula: "Notes Payable balance" } },
    ],
  },
  {
    key: "total-liabilities",
    title: "Total Liabilities",
    rows: [
      { key: "total-liabilities", label: "Total Liabilities", field: "totalLiabilities", format: "currency", isSubtotal: true, tooltip: { explanation: "Everything the business owes", formula: "Total Current Liabilities + Total Long-Term Liabilities" } },
    ],
  },
  {
    key: "equity",
    title: "Capital (Equity)",
    rows: [
      { key: "common-stock", label: "Common Stock / Paid-in Capital", field: "commonStock", format: "currency", indent: 1, tooltip: { explanation: "Capital invested by the owner(s)", formula: "Initial equity investment" } },
      { key: "retained-earnings", label: "Retained Earnings", field: "retainedEarnings", format: "currency", indent: 1, tooltip: { explanation: "Accumulated profits reinvested in the business", formula: "Cumulative Net Income - Distributions" } },
      { key: "total-equity", label: "Total Capital", field: "totalEquity", format: "currency", isSubtotal: true, tooltip: { explanation: "Owner's stake in the business", formula: "Common Stock + Retained Earnings" } },
    ],
  },
  {
    key: "total-l-and-e",
    title: "Total Liabilities and Equity",
    rows: [
      { key: "total-l-and-e", label: "Total Liabilities and Equity", field: "totalLiabilitiesAndEquity", format: "currency", isTotal: true, tooltip: { explanation: "Must equal Total Assets (accounting identity)", formula: "Total Liabilities + Total Equity" } },
    ],
  },
  {
    key: "core-capital",
    title: "Core Capital Metrics",
    defaultExpanded: false,
    rows: [
      { key: "avg-core-capital", label: "Avg Core Capital / Month", field: "avgCoreCapitalPerMonth", format: "currency", indent: 1, tooltip: { explanation: "Average monthly operating capital requirement", formula: "From ROIC extended analysis" } },
      { key: "months-core-capital", label: "Months of Core Capital", field: "monthsOfCoreCapital", format: "months", indent: 1, tooltip: { explanation: "How many months your cash covers operating needs", formula: "Ending Cash / Avg Core Capital per Month" } },
      { key: "excess-core-capital", label: "Excess Core Capital", field: "excessCoreCapital", format: "currency", indent: 1, tooltip: { explanation: "Cash above what's needed for operations", formula: "Ending Cash - Required Core Capital" } },
    ],
  },
  {
    key: "ratios",
    title: "Ratios",
    defaultExpanded: false,
    rows: [
      { key: "ar-dso", label: "AR DSO (Days Sales Outstanding)", field: "arDso", format: "number", indent: 1, tooltip: { explanation: "Average days to collect receivables", formula: "Accounts Receivable / (Revenue / 30)" } },
      { key: "ap-pct-cogs", label: "AP % of COGS", field: "apPctOfCogs", format: "pct", indent: 1, tooltip: { explanation: "Accounts payable relative to cost of goods sold", formula: "Accounts Payable / Total COGS" } },
    ],
  },
];

const BS_POINT_IN_TIME_FIELDS = new Set([
  "endingCash", "accountsReceivable", "inventory", "totalCurrentAssets",
  "netFixedAssets", "accountsPayable", "taxPayable", "lineOfCredit",
  "totalCurrentLiabilities", "loanClosingBalance", "totalLiabilities",
  "commonStock", "retainedEarnings", "totalEquity", "totalLiabilitiesAndEquity",
  "totalAssets", "grossFixedAssets", "accumulatedDepreciation",
]);

const ROIC_EXTENDED_FIELDS = new Set([
  "avgCoreCapitalPerMonth", "monthsOfCoreCapital", "excessCoreCapital",
]);

function formatBsValue(value: number, format: "currency" | "pct" | "number" | "months"): string {
  if (format === "pct") return `${(value * 100).toFixed(1)}%`;
  if (format === "number") return value.toFixed(1);
  if (format === "months") return value.toFixed(1);
  return formatCents(value);
}

function getBsCellValue(
  field: string,
  col: ColumnDef,
  enriched: EnrichedBsAnnual[],
  monthly: MonthlyProjection[],
  roicExtended: ROICExtendedOutput[],
): number {
  if (ROIC_EXTENDED_FIELDS.has(field)) {
    return getAnnualValue(field, col.year, enriched, undefined, roicExtended);
  }

  if (field === "grossFixedAssets" || field === "accumulatedDepreciation") {
    if (col.level === "annual") {
      const ea = enriched[col.year - 1];
      return ea ? (ea as any)[field] : 0;
    }
    if (col.level === "monthly" && col.month) {
      const mp = monthly[(col.year - 1) * 12 + col.month - 1];
      if (!mp) return 0;
      const cumDepreciation = monthly.slice(0, (col.year - 1) * 12 + col.month).reduce((s, m) => s + m.depreciation, 0);
      if (field === "accumulatedDepreciation") return -cumDepreciation;
      return mp.netFixedAssets + cumDepreciation;
    }
    if (col.level === "quarterly" && col.quarter) {
      const endMonthIdx = (col.year - 1) * 12 + col.quarter * 3 - 1;
      const mp = monthly[endMonthIdx];
      if (!mp) return 0;
      const cumDepreciation = monthly.slice(0, endMonthIdx + 1).reduce((s, m) => s + m.depreciation, 0);
      if (field === "accumulatedDepreciation") return -cumDepreciation;
      return mp.netFixedAssets + cumDepreciation;
    }
    return 0;
  }

  if (field === "arDso") {
    if (col.level === "annual") {
      const ea = enriched[col.year - 1];
      return ea ? ea.arDso : 0;
    }
    if (col.level === "monthly" && col.month) {
      const mp = monthly[(col.year - 1) * 12 + col.month - 1];
      if (!mp || mp.revenue === 0) return 0;
      return (mp.accountsReceivable / mp.revenue) * 30;
    }
    if (col.level === "quarterly" && col.quarter) {
      const endMonthIdx = (col.year - 1) * 12 + col.quarter * 3 - 1;
      const mp = monthly[endMonthIdx];
      if (!mp || mp.revenue === 0) return 0;
      return (mp.accountsReceivable / mp.revenue) * 30;
    }
    return 0;
  }

  if (field === "apPctOfCogs") {
    if (col.level === "annual") {
      const ea = enriched[col.year - 1];
      return ea ? ea.apPctOfCogs : 0;
    }
    if (col.level === "monthly" && col.month) {
      const mp = monthly[(col.year - 1) * 12 + col.month - 1];
      if (!mp || mp.totalCogs === 0) return 0;
      return mp.accountsPayable / Math.abs(mp.totalCogs);
    }
    if (col.level === "quarterly" && col.quarter) {
      const endMonthIdx = (col.year - 1) * 12 + col.quarter * 3 - 1;
      const mp = monthly[endMonthIdx];
      if (!mp || mp.totalCogs === 0) return 0;
      return mp.accountsPayable / Math.abs(mp.totalCogs);
    }
    return 0;
  }

  if (BS_POINT_IN_TIME_FIELDS.has(field)) {
    if (col.level === "annual") {
      const ea = enriched[col.year - 1];
      return ea ? (ea as any)[field] : 0;
    }
    if (col.level === "monthly" && col.month) {
      return getMonthlyValue(field, col.year, col.month, monthly);
    }
    if (col.level === "quarterly" && col.quarter) {
      const endMonthIdx = (col.year - 1) * 12 + col.quarter * 3 - 1;
      const mp = monthly[endMonthIdx];
      if (mp && field in mp) return (mp as any)[field];
      return 0;
    }
    return 0;
  }

  if (col.level === "annual") {
    return getAnnualValue(field, col.year, enriched);
  }
  if (col.level === "quarterly" && col.quarter) {
    return getQuarterlyValue(field, col.year, col.quarter, monthly);
  }
  if (col.level === "monthly" && col.month) {
    return getMonthlyValue(field, col.year, col.month, monthly);
  }
  return 0;
}

export function BalanceSheetTab({ output }: BalanceSheetTabProps) {
  const { annualSummaries, monthlyProjections, identityChecks, roicExtended } = output;
  const enriched = useMemo(
    () => computeEnrichedBsAnnuals(monthlyProjections, annualSummaries),
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
    BS_SECTIONS.forEach((s) => {
      initial[s.key] = s.defaultExpanded ?? true;
    });
    return initial;
  });

  const toggleSection = useCallback((key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const bsIdentityCheck = identityChecks.find((c) => c.name.toLowerCase().includes("balance sheet") || c.name.toLowerCase().includes("assets = liabilities"));
  const bsCheckPassed = bsIdentityCheck ? bsIdentityCheck.passed : true;

  return (
    <div className="space-y-0 pb-8" data-testid="balance-sheet-tab">
      <BsCalloutBar enriched={enriched} identityPassed={bsCheckPassed} />
      <ColumnToolbar
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
        hasAnyDrillDown={hasAnyDrillDown}
        showLinkedIndicator={false}
      />
      <div className="overflow-x-auto" data-testid="bs-table">
        <table className="w-full text-sm" role="grid" aria-label="Balance Sheet">
          <GroupedTableHead
            columns={columns}
            getDrillLevel={getDrillLevel}
            onDrillDown={drillDown}
            onDrillUp={drillUp}
            hasAnyDrillDown={hasAnyDrillDown}
            testIdPrefix="bs"
          />
          <tbody>
            {BS_SECTIONS.map((section) => (
              <BsSection
                key={section.key}
                section={section}
                columns={visibleCols}
                enriched={enriched}
                monthly={monthlyProjections}
                roicExtended={roicExtended}
                isExpanded={expandedSections[section.key] ?? true}
                onToggle={() => toggleSection(section.key)}
              />
            ))}
            <IdentityCheckRow
              columns={visibleCols}
              enriched={enriched}
              monthly={monthlyProjections}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BsCalloutBar({ enriched, identityPassed }: { enriched: EnrichedBsAnnual[]; identityPassed: boolean }) {
  const y1 = enriched[0];
  if (!y1) return null;
  return (
    <div
      className="flex flex-wrap items-center gap-4 px-4 py-3 border-b bg-muted/30 sticky top-0 z-30"
      data-testid="bs-callout-bar"
    >
      <CalloutMetric
        label="Total Assets (Y1)"
        value={formatCents(y1.totalAssets)}
        testId="bs-callout-total-assets-y1"
      />
      <div className="w-px h-8 bg-border" />
      <CalloutMetric
        label="Total Equity (Y1)"
        value={formatCents(y1.totalEquity)}
        testId="bs-callout-total-equity-y1"
      />
      <div className="w-px h-8 bg-border" />
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Balance Sheet</span>
        <span className="flex items-center gap-1.5" data-testid="bs-callout-identity-status">
          {identityPassed ? (
            <>
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">Balanced</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">Imbalanced</span>
            </>
          )}
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

interface BsSectionProps {
  section: BsSectionDef;
  columns: ColumnDef[];
  enriched: EnrichedBsAnnual[];
  monthly: MonthlyProjection[];
  roicExtended: ROICExtendedOutput[];
  isExpanded: boolean;
  onToggle: () => void;
}

function BsSection({ section, columns, enriched, monthly, roicExtended, isExpanded, onToggle }: BsSectionProps) {
  return (
    <>
      <tr
        className="bg-muted/40 cursor-pointer hover-elevate"
        data-testid={`bs-section-${section.key}`}
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
          <BsRow
            key={row.key}
            row={row}
            columns={columns}
            enriched={enriched}
            monthly={monthly}
            roicExtended={roicExtended}
          />
        ))}
    </>
  );
}

interface BsRowProps {
  row: BsRowDef;
  columns: ColumnDef[];
  enriched: EnrichedBsAnnual[];
  monthly: MonthlyProjection[];
  roicExtended: ROICExtendedOutput[];
}

function BsRow({ row, columns, enriched, monthly, roicExtended }: BsRowProps) {
  const rowClass = row.isTotal
    ? "font-semibold border-t-[3px] border-double border-b"
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
        data-testid={`bs-row-${row.key}`}
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
          const value = getBsCellValue(row.field, col, enriched, monthly, roicExtended);
          const isNegative = value < 0;
          const cellContent = formatBsValue(value, row.format);

          if (!row.isInput && row.tooltip) {
            return (
              <td
                key={col.key}
                className={`py-1.5 px-3 text-right font-mono tabular-nums text-sm whitespace-nowrap${isNegative ? " text-amber-700 dark:text-amber-400" : ""}`}
                data-testid={`bs-value-${row.key}-${col.key}`}
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
              className={`py-1.5 px-3 text-right font-mono tabular-nums text-sm whitespace-nowrap ${row.isInput ? inputCellClass : ""}${isNegative ? " text-amber-700 dark:text-amber-400" : ""}`}
              data-testid={`bs-value-${row.key}-${col.key}`}
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
          data-testid={`bs-interp-${row.key}`}
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

function IdentityCheckRow({ columns, enriched, monthly }: { columns: ColumnDef[]; enriched: EnrichedBsAnnual[]; monthly: MonthlyProjection[] }) {
  return (
    <tr
      className="border-t-2 border-double"
      data-testid="bs-row-identity-check"
      role="row"
    >
      <td
        className="py-2 px-3 text-sm font-medium sticky left-0 bg-background z-10 min-w-[200px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]"
        role="rowheader"
      >
        Assets = Liabilities + Equity
      </td>
      {columns.map((col) => {
        const totalAssets = getBsCellValue("totalAssets", col, enriched, monthly, []);
        const totalLE = getBsCellValue("totalLiabilitiesAndEquity", col, enriched, monthly, []);
        const diff = Math.abs(totalAssets - totalLE);
        const passed = diff < 100;

        return (
          <td
            key={col.key}
            className={`py-2 px-3 text-right text-sm whitespace-nowrap ${passed ? "" : "bg-destructive/10 text-destructive"}`}
            data-testid={`bs-identity-${col.key}`}
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
                  <p className="text-xs font-medium">Balance sheet does not balance</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Assets: {formatCents(totalAssets)} vs L+E: {formatCents(totalLE)}
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
