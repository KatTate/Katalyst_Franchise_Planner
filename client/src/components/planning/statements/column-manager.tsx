import { useState, useCallback } from "react";
import { ChevronDown, ChevronRight, Link2, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
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

interface ColumnHeadersProps {
  columns: ColumnDef[];
  getDrillLevel: (year: number) => DrillLevel;
  onDrillDown: (year: number) => void;
  onDrillUp: (year: number) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  hasAnyDrillDown: boolean;
  showLinkedIndicator?: boolean;
}

export function ColumnHeaders({
  columns,
  getDrillLevel,
  onDrillDown,
  onDrillUp,
  onExpandAll,
  onCollapseAll,
  hasAnyDrillDown,
  showLinkedIndicator = true,
}: ColumnHeadersProps) {
  const yearColumns = columns.filter((c) => c.level === "annual");

  return (
    <div className="flex flex-col">
      {showLinkedIndicator && (
        <div className="flex items-center justify-end gap-1 px-2 py-1">
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
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
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
      )}
    </div>
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
