import { useState, useCallback, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatCents } from "@/lib/format-currency";
import type { AnnualSummary, MonthlyProjection, PLAnalysisOutput, ROICExtendedOutput, ValuationOutput } from "@shared/financial-engine";
import { type ColumnDef, type DrillLevel, getAnnualValue, getQuarterlyValue, getMonthlyValue } from "./column-manager";

export interface RowDef {
  key: string;
  label: string;
  field: string;
  format: "currency" | "pct" | "number" | "months";
  isSubtotal?: boolean;
  isTotal?: boolean;
  indent?: number;
  interpretation?: string;
}

export interface SectionDef {
  key: string;
  title: string;
  rows: RowDef[];
  defaultExpanded?: boolean;
}

interface StatementTableProps {
  sections: SectionDef[];
  annualSummaries: AnnualSummary[];
  monthlyProjections: MonthlyProjection[];
  plAnalysis?: PLAnalysisOutput[];
  roicExtended?: ROICExtendedOutput[];
  valuation?: ValuationOutput[];
  columns?: ColumnDef[];
  onDrillDown?: (year: number) => void;
  onDrillUp?: (year: number) => void;
  testIdPrefix: string;
}

function formatValue(value: number, format: RowDef["format"]): string {
  switch (format) {
    case "currency":
      return formatCents(value);
    case "pct":
      return `${(value * 100).toFixed(1)}%`;
    case "number":
      return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
    case "months":
      return `${value.toFixed(1)} mo`;
    default:
      return String(value);
  }
}

function getCellValue(
  field: string,
  col: ColumnDef,
  annualSummaries: AnnualSummary[],
  monthlyProjections: MonthlyProjection[],
  plAnalysis?: PLAnalysisOutput[],
  roicExtended?: ROICExtendedOutput[],
  valuation?: ValuationOutput[]
): number {
  if (col.level === "annual") {
    return getAnnualValue(field, col.year, annualSummaries, plAnalysis, roicExtended, valuation);
  }
  if (col.level === "quarterly" && col.quarter) {
    return getQuarterlyValue(field, col.year, col.quarter, monthlyProjections);
  }
  if (col.level === "monthly" && col.month) {
    return getMonthlyValue(field, col.year, col.month, monthlyProjections);
  }
  return 0;
}

export function StatementTable({
  sections,
  annualSummaries,
  monthlyProjections,
  plAnalysis,
  roicExtended,
  valuation,
  columns,
  onDrillDown,
  onDrillUp,
  testIdPrefix,
}: StatementTableProps) {
  const defaultCols: ColumnDef[] = [1, 2, 3, 4, 5].map((y) => ({
    key: `y${y}`,
    label: `Year ${y}`,
    year: y,
    level: "annual" as DrillLevel,
  }));

  const activeCols = columns ?? defaultCols;
  const annualCols = activeCols.filter((c) => c.level === "annual");

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach((s) => {
      initial[s.key] = s.defaultExpanded ?? true;
    });
    return initial;
  });

  const toggleSection = useCallback((key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <div className="overflow-x-auto" data-testid={`${testIdPrefix}-table`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-3 font-medium text-muted-foreground sticky left-0 bg-background z-10 min-w-[180px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
              &nbsp;
            </th>
            {annualCols.map((col) => (
              <th
                key={col.key}
                className={`text-right py-2 px-3 font-medium text-muted-foreground whitespace-nowrap${onDrillDown ? " cursor-pointer select-none" : ""}`}
                data-testid={`header-${col.key}`}
                tabIndex={onDrillDown ? 0 : undefined}
                onClick={onDrillDown ? () => onDrillDown(col.year) : undefined}
                onKeyDown={
                  onDrillDown
                    ? (e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          onDrillDown(col.year);
                        } else if (e.key === "Escape" && onDrillUp) {
                          e.preventDefault();
                          onDrillUp(col.year);
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
          {sections.map((section) => {
            const isExpanded = expandedSections[section.key] ?? true;
            return (
              <TableSection
                key={section.key}
                section={section}
                isExpanded={isExpanded}
                onToggle={() => toggleSection(section.key)}
                columns={annualCols}
                annualSummaries={annualSummaries}
                monthlyProjections={monthlyProjections}
                plAnalysis={plAnalysis}
                roicExtended={roicExtended}
                valuation={valuation}
                testIdPrefix={testIdPrefix}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface TableSectionProps {
  section: SectionDef;
  isExpanded: boolean;
  onToggle: () => void;
  columns: ColumnDef[];
  annualSummaries: AnnualSummary[];
  monthlyProjections: MonthlyProjection[];
  plAnalysis?: PLAnalysisOutput[];
  roicExtended?: ROICExtendedOutput[];
  valuation?: ValuationOutput[];
  testIdPrefix: string;
}

function TableSection({
  section,
  isExpanded,
  onToggle,
  columns,
  annualSummaries,
  monthlyProjections,
  plAnalysis,
  roicExtended,
  valuation,
  testIdPrefix,
}: TableSectionProps) {
  return (
    <>
      <tr
        className="cursor-pointer hover-elevate sticky top-0 z-20 bg-background shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]"
        onClick={onToggle}
        data-testid={`section-${section.key}`}
      >
        <td
          className="py-2 px-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground sticky left-0 bg-background z-20"
          colSpan={columns.length + 1}
        >
          <span className="flex items-center gap-1">
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
            {section.title}
          </span>
        </td>
      </tr>
      {isExpanded &&
        section.rows.map((row) => (
          <DataRow
            key={row.key}
            row={row}
            columns={columns}
            annualSummaries={annualSummaries}
            monthlyProjections={monthlyProjections}
            plAnalysis={plAnalysis}
            roicExtended={roicExtended}
            valuation={valuation}
            testIdPrefix={testIdPrefix}
          />
        ))}
    </>
  );
}

interface DataRowProps {
  row: RowDef;
  columns: ColumnDef[];
  annualSummaries: AnnualSummary[];
  monthlyProjections: MonthlyProjection[];
  plAnalysis?: PLAnalysisOutput[];
  roicExtended?: ROICExtendedOutput[];
  valuation?: ValuationOutput[];
  testIdPrefix: string;
}

function DataRow({
  row,
  columns,
  annualSummaries,
  monthlyProjections,
  plAnalysis,
  roicExtended,
  valuation,
  testIdPrefix,
}: DataRowProps) {
  const rowClass = row.isTotal
    ? "font-semibold border-t border-b"
    : row.isSubtotal
    ? "font-medium"
    : "";

  const paddingLeft = row.indent ? `${12 + row.indent * 16}px` : undefined;

  return (
    <>
      <tr className={`${rowClass} hover:bg-muted/30 transition-colors`} data-testid={`row-${row.key}`}>
        <td
          className="py-1.5 px-3 text-sm sticky left-0 bg-background z-10 min-w-[180px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]"
          style={{ paddingLeft }}
        >
          {row.label}
        </td>
        {columns.map((col) => {
          const value = getCellValue(
            row.field,
            col,
            annualSummaries,
            monthlyProjections,
            plAnalysis,
            roicExtended,
            valuation
          );
          return (
            <td
              key={col.key}
              className="py-1.5 px-3 text-right font-mono tabular-nums text-sm whitespace-nowrap"
              data-testid={`value-${row.key}-${col.key}`}
            >
              {formatValue(value, row.format)}
            </td>
          );
        })}
      </tr>
      {row.interpretation && (
        <tr className="text-xs text-muted-foreground" data-testid={`interp-${row.key}`}>
          <td colSpan={columns.length + 1} className="py-1 px-3 pl-8 italic">
            {row.interpretation}
          </td>
        </tr>
      )}
    </>
  );
}
