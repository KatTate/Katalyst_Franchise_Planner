import { useState, useCallback, useMemo } from "react";
import { ChevronUp, Link2, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { MonthlyProjection } from "@shared/financial-engine";

export type DrillLevel = "annual" | "quarterly" | "monthly";

export interface ColumnDef {
  key: string;
  label: string;
  year: number;
  quarter?: number;
  month?: number;
  level: DrillLevel;
}

export interface DrillState {
  [year: number]: DrillLevel;
}

const QUARTER_LABELS = ["Q1", "Q2", "Q3", "Q4"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function useColumnManager() {
  const [drillState, setDrillState] = useState<DrillState>({});

  const getDrillLevel = useCallback(
    (year: number): DrillLevel => drillState[year] ?? "annual",
    [drillState]
  );

  const drillDown = useCallback((year: number) => {
    setDrillState((prev) => {
      const current = prev[year] ?? "annual";
      if (current === "annual") return { ...prev, [year]: "quarterly" };
      if (current === "quarterly") return { ...prev, [year]: "monthly" };
      return prev;
    });
  }, []);

  const drillUp = useCallback((year: number) => {
    setDrillState((prev) => {
      const current = prev[year] ?? "annual";
      if (current === "monthly") return { ...prev, [year]: "quarterly" };
      if (current === "quarterly") {
        const next = { ...prev };
        delete next[year];
        return next;
      }
      return prev;
    });
  }, []);

  const expandAll = useCallback(() => {
    const newState: DrillState = {};
    for (let y = 1; y <= 5; y++) newState[y] = "monthly";
    setDrillState(newState);
  }, []);

  const collapseAll = useCallback(() => {
    setDrillState({});
  }, []);

  const getColumns = useCallback((): ColumnDef[] => {
    const cols: ColumnDef[] = [];
    for (let y = 1; y <= 5; y++) {
      const level = getDrillLevel(y);
      cols.push({ key: `y${y}`, label: `Year ${y}`, year: y, level: "annual" });

      if (level === "quarterly" || level === "monthly") {
        for (let q = 1; q <= 4; q++) {
          cols.push({
            key: `y${y}q${q}`,
            label: QUARTER_LABELS[q - 1],
            year: y,
            quarter: q,
            level: "quarterly",
          });

          if (level === "monthly") {
            for (let m = 1; m <= 3; m++) {
              const monthIndex = (q - 1) * 3 + m;
              cols.push({
                key: `y${y}m${monthIndex}`,
                label: MONTH_LABELS[monthIndex - 1],
                year: y,
                month: monthIndex,
                level: "monthly",
              });
            }
          }
        }
      }
    }
    return cols;
  }, [getDrillLevel]);

  const hasAnyDrillDown = Object.keys(drillState).length > 0;

  return {
    drillState,
    getDrillLevel,
    drillDown,
    drillUp,
    expandAll,
    collapseAll,
    getColumns,
    hasAnyDrillDown,
  };
}

interface ColumnToolbarProps {
  onExpandAll: () => void;
  onCollapseAll: () => void;
  hasAnyDrillDown: boolean;
  showLinkedIndicator?: boolean;
}

export function ColumnToolbar({
  onExpandAll,
  onCollapseAll,
  hasAnyDrillDown,
  showLinkedIndicator = true,
}: ColumnToolbarProps) {
  return (
    <div className="flex items-center justify-end gap-1 px-2 py-1">
      {showLinkedIndicator && (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                <Link2 className="h-3 w-3" />
                <span>Linked</span>
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[240px]">
              <p className="text-xs">
                All years share the same input value. Per-year values will be available in a future update.
              </p>
            </TooltipContent>
          </Tooltip>
          <div className="flex-1" />
        </>
      )}
      {!showLinkedIndicator && <div className="flex-1" />}
      <Button
        variant="ghost"
        size="sm"
        className="text-xs"
        onClick={hasAnyDrillDown ? onCollapseAll : onExpandAll}
        data-testid="button-toggle-drill"
      >
        {hasAnyDrillDown ? (
          <>
            <ChevronsDownUp className="h-3 w-3 mr-1" />
            Collapse All
          </>
        ) : (
          <>
            <ChevronsUpDown className="h-3 w-3 mr-1" />
            Expand All
          </>
        )}
      </Button>
    </div>
  );
}

interface YearGroup {
  year: number;
  level: DrillLevel;
  totalCols: number;
  annualCol: ColumnDef;
  quarterCols: ColumnDef[];
  monthColsByQuarter: Record<number, ColumnDef[]>;
}

interface GroupedTableHeadProps {
  columns: ColumnDef[];
  getDrillLevel: (year: number) => DrillLevel;
  onDrillDown: (year: number) => void;
  onDrillUp: (year: number) => void;
  hasAnyDrillDown: boolean;
  testIdPrefix?: string;
}

export function GroupedTableHead({
  columns,
  getDrillLevel,
  onDrillDown,
  onDrillUp,
  hasAnyDrillDown,
  testIdPrefix = "",
}: GroupedTableHeadProps) {
  const headerInfo = useMemo(() => {
    const years: YearGroup[] = [];
    for (let y = 1; y <= 5; y++) {
      const level = getDrillLevel(y);
      const yearCols = columns.filter((c) => c.year === y);
      const annualCol = yearCols.find((c) => c.level === "annual")!;
      const quarterCols = yearCols
        .filter((c) => c.level === "quarterly")
        .sort((a, b) => (a.quarter ?? 0) - (b.quarter ?? 0));
      const monthCols = yearCols
        .filter((c) => c.level === "monthly")
        .sort((a, b) => (a.month ?? 0) - (b.month ?? 0));

      const monthColsByQuarter: Record<number, ColumnDef[]> = {};
      for (const mc of monthCols) {
        const q = Math.ceil((mc.month ?? 1) / 3);
        if (!monthColsByQuarter[q]) monthColsByQuarter[q] = [];
        monthColsByQuarter[q].push(mc);
      }

      years.push({
        year: y,
        level,
        totalCols: yearCols.length,
        annualCol,
        quarterCols,
        monthColsByQuarter,
      });
    }

    const hasQuarterly = years.some((y) => y.level !== "annual");
    const hasMonthly = years.some((y) => y.level === "monthly");
    const rowCount = hasMonthly ? 3 : hasQuarterly ? 2 : 1;

    return { years, rowCount };
  }, [columns, getDrillLevel]);

  const { years, rowCount } = headerInfo;
  const pfx = testIdPrefix ? `${testIdPrefix}-` : "";

  const labelCellClass =
    "text-left py-2 px-3 font-medium text-muted-foreground sticky left-0 z-10 min-w-[200px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]";

  if (rowCount === 1) {
    return (
      <thead>
        <tr className="border-b">
          <th className={`${labelCellClass} bg-background`} scope="col">
            &nbsp;
          </th>
          {years.map((yg, idx) => (
            <th
              key={yg.annualCol.key}
              className={`text-right py-2 px-3 font-medium text-muted-foreground whitespace-nowrap cursor-pointer select-none${idx > 0 ? " border-l border-border/30" : ""}`}
              data-testid={`${pfx}header-${yg.annualCol.key}`}
              scope="col"
              tabIndex={0}
              onClick={() => onDrillDown(yg.year)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onDrillDown(yg.year);
                }
              }}
            >
              {yg.annualCol.label}
            </th>
          ))}
        </tr>
      </thead>
    );
  }

  return (
    <thead>
      <tr className="border-b bg-muted/40">
        <th
          className={`${labelCellClass} bg-muted/40`}
          scope="col"
          rowSpan={rowCount}
        >
          &nbsp;
        </th>
        {years.map((yg, idx) => {
          const borderClass = idx > 0 ? " border-l-2 border-border/40" : "";

          if (yg.level === "annual") {
            return (
              <th
                key={yg.annualCol.key}
                className={`text-right py-2 px-3 font-medium text-muted-foreground whitespace-nowrap cursor-pointer select-none bg-muted/40${borderClass}`}
                data-testid={`${pfx}header-${yg.annualCol.key}`}
                scope="col"
                rowSpan={rowCount}
                tabIndex={0}
                onClick={() => onDrillDown(yg.year)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onDrillDown(yg.year);
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    onDrillUp(yg.year);
                  }
                }}
              >
                {yg.annualCol.label}
              </th>
            );
          }

          const levelLabel = yg.level === "quarterly" ? "Quarterly" : "Monthly";
          return (
            <th
              key={`year-group-${yg.year}`}
              className={`text-center py-2 px-3 font-medium text-muted-foreground whitespace-nowrap bg-muted/40${borderClass}`}
              colSpan={yg.totalCols}
              scope="colgroup"
              data-testid={`${pfx}header-group-y${yg.year}`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <span data-testid={`${pfx}breadcrumb-y${yg.year}`}>
                  Year {yg.year} &#x25B8; {levelLabel}
                </span>
                <button
                  className="inline-flex items-center justify-center rounded-md p-0.5 text-muted-foreground hover-elevate"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDrillUp(yg.year);
                  }}
                  data-testid={`button-collapse-year-${yg.year}`}
                  aria-label={`Collapse Year ${yg.year}`}
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
              </span>
            </th>
          );
        })}
      </tr>

      <tr className="border-b">
        {years.flatMap((yg) => {
          if (yg.level === "annual") return [];

          const cells: JSX.Element[] = [];
          const remainingRows = rowCount - 1;

          cells.push(
            <th
              key={`${yg.annualCol.key}-sub`}
              className="text-right py-1.5 px-3 text-xs font-medium text-muted-foreground whitespace-nowrap border-l-2 border-border/40 cursor-pointer select-none"
              scope="col"
              rowSpan={remainingRows}
              tabIndex={0}
              onClick={() => onDrillDown(yg.year)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onDrillDown(yg.year);
                }
              }}
              data-testid={`${pfx}header-${yg.annualCol.key}`}
            >
              Total
            </th>
          );

          if (yg.level === "quarterly") {
            yg.quarterCols.forEach((qc) => {
              cells.push(
                <th
                  key={qc.key}
                  className="text-right py-1.5 px-3 text-xs font-medium text-muted-foreground whitespace-nowrap cursor-pointer select-none"
                  scope="col"
                  rowSpan={remainingRows}
                  tabIndex={0}
                  onClick={() => onDrillDown(yg.year)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onDrillDown(yg.year);
                    }
                  }}
                  data-testid={`${pfx}header-${qc.key}`}
                >
                  {qc.label}
                </th>
              );
            });
          } else {
            yg.quarterCols.forEach((qc) => {
              const months = yg.monthColsByQuarter[qc.quarter ?? 0] ?? [];
              const colSpan = 1 + months.length;
              cells.push(
                <th
                  key={qc.key}
                  className="text-center py-1.5 px-3 text-xs font-medium text-muted-foreground whitespace-nowrap bg-muted/20"
                  scope="colgroup"
                  colSpan={colSpan}
                  data-testid={`${pfx}header-qgroup-${qc.key}`}
                >
                  {qc.label}
                </th>
              );
            });
          }

          return cells;
        })}
      </tr>

      {rowCount === 3 && (
        <tr className="border-b">
          {years.flatMap((yg) => {
            if (yg.level !== "monthly") return [];

            const cells: JSX.Element[] = [];
            yg.quarterCols.forEach((qc) => {
              cells.push(
                <th
                  key={`${qc.key}-subtotal`}
                  className="text-right py-1 px-2 text-[11px] font-medium text-muted-foreground/70 whitespace-nowrap"
                  scope="col"
                  data-testid={`${pfx}header-${qc.key}`}
                >
                  {qc.label}
                </th>
              );

              const months = yg.monthColsByQuarter[qc.quarter ?? 0] ?? [];
              months.forEach((mc) => {
                cells.push(
                  <th
                    key={mc.key}
                    className="text-right py-1 px-2 text-[11px] font-medium text-muted-foreground/70 whitespace-nowrap"
                    scope="col"
                    data-testid={`${pfx}header-${mc.key}`}
                  >
                    {mc.label}
                  </th>
                );
              });
            });

            return cells;
          })}
        </tr>
      )}
    </thead>
  );
}

export function getAnnualValue(
  field: string,
  year: number,
  annualSummaries: any[],
  plAnalysis?: any[],
  roicExtended?: any[],
  valuation?: any[]
): number {
  const summary = annualSummaries[year - 1];
  if (!summary) return 0;
  if (field in summary) return (summary as any)[field];
  if (plAnalysis) {
    const pa = plAnalysis[year - 1];
    if (pa && field in pa) return (pa as any)[field];
  }
  if (roicExtended) {
    const re = roicExtended[year - 1];
    if (re && field in re) return (re as any)[field];
  }
  if (valuation) {
    const val = valuation[year - 1];
    if (val && field in val) return (val as any)[field];
  }
  return 0;
}

export function getQuarterlyValue(
  field: string,
  year: number,
  quarter: number,
  monthly: MonthlyProjection[],
  format?: "currency" | "pct" | "number" | "months"
): number {
  const startMonth = (year - 1) * 12 + (quarter - 1) * 3;
  let sum = 0;
  let count = 0;
  for (let i = 0; i < 3; i++) {
    const mp = monthly[startMonth + i];
    if (mp && field in mp) {
      sum += (mp as any)[field];
      count++;
    }
  }
  if (format === "pct" && count > 0) {
    return Math.round((sum / count) * 10000) / 10000;
  }
  return Math.round(sum * 100) / 100;
}

export function getMonthlyValue(
  field: string,
  year: number,
  month: number,
  monthly: MonthlyProjection[]
): number {
  const idx = (year - 1) * 12 + month - 1;
  const mp = monthly[idx];
  if (mp && field in mp) return (mp as any)[field];
  return 0;
}
