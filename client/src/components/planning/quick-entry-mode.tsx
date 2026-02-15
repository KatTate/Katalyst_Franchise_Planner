import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  type ColumnDef,
  type Row,
  type CellContext,
} from "@tanstack/react-table";
import { usePlan } from "@/hooks/use-plan";
import { usePlanOutputs } from "@/hooks/use-plan-outputs";
import { useFieldEditing } from "@/hooks/use-field-editing";
import type {
  PlanFinancialInputs,
  FinancialFieldValue,
} from "@shared/financial-engine";
import { SourceBadge } from "@/components/shared/source-badge";
import {
  formatROI,
  formatBreakEven,
} from "@/components/shared/summary-metrics";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronDown, RotateCcw, AlertCircle } from "lucide-react";
import {
  FIELD_METADATA,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  formatFieldValue,
  parseFieldInput,
  getInputPlaceholder,
} from "@/lib/field-metadata";
import type { FormatType } from "@/lib/field-metadata";
import { formatCents } from "@/lib/format-currency";

interface QuickEntryModeProps {
  planId: string;
}

interface GridRow {
  id: string;
  isGroupHeader: boolean;
  category: string;
  fieldName: string | null;
  label: string;
  format: FormatType | null;
  field: FinancialFieldValue | null;
  subRows?: GridRow[];
}

const UNIT_LABELS: Record<FormatType, string> = {
  currency: "$",
  percentage: "%",
  integer: "#",
};

function buildGridRows(financialInputs: PlanFinancialInputs): GridRow[] {
  return CATEGORY_ORDER.map((category) => {
    const fields = FIELD_METADATA[category];
    const categoryData = financialInputs[category as keyof PlanFinancialInputs];
    const children: GridRow[] = Object.entries(fields).map(([fieldName, meta]) => {
      const field = categoryData[fieldName as keyof typeof categoryData] as FinancialFieldValue;
      return {
        id: `${category}.${fieldName}`,
        isGroupHeader: false,
        category,
        fieldName,
        label: meta.label,
        format: meta.format,
        field,
      };
    });
    return {
      id: category,
      isGroupHeader: true,
      category,
      fieldName: null,
      label: CATEGORY_LABELS[category],
      format: null,
      field: null,
      subRows: children,
    };
  });
}

function isOutOfRange(field: FinancialFieldValue): boolean {
  if (!field.item7Range) return false;
  return field.currentValue < field.item7Range.min || field.currentValue > field.item7Range.max;
}

function formatRangeText(field: FinancialFieldValue, format: FormatType): string {
  if (!field.item7Range) return "";
  const minStr = formatFieldValue(field.item7Range.min, format);
  const maxStr = formatFieldValue(field.item7Range.max, format);
  return `Typical range: ${minStr} – ${maxStr}`;
}

function getRawEditValue(field: FinancialFieldValue, format: FormatType): string {
  switch (format) {
    case "currency":
      return String(field.currentValue / 100);
    case "percentage":
      return String((field.currentValue * 100).toFixed(1));
    case "integer":
      return String(field.currentValue);
  }
}

function EditableCell({
  row,
  onCellEdit,
}: {
  row: Row<GridRow>;
  onCellEdit: (category: string, fieldName: string, value: number) => void;
}) {
  const { field, format, category, fieldName } = row.original;
  if (!field || !format || !fieldName) return null;

  const [localValue, setLocalValue] = useState(() => getRawEditValue(field, format));
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const committedRef = useRef(field.currentValue);
  const skipBlurCommitRef = useRef(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(getRawEditValue(field, format));
      committedRef.current = field.currentValue;
    }
  }, [field.currentValue, format, isFocused]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    requestAnimationFrame(() => {
      inputRef.current?.select();
    });
  }, []);

  const commitEdit = useCallback(() => {
    setIsFocused(false);
    const parsedValue = parseFieldInput(localValue, format);
    if (!isNaN(parsedValue) && parsedValue !== committedRef.current) {
      committedRef.current = parsedValue;
      onCellEdit(category, fieldName, parsedValue);
    } else {
      setLocalValue(getRawEditValue(field, format));
    }
  }, [localValue, format, fieldName, category, field, onCellEdit]);

  const cancelEdit = useCallback(() => {
    skipBlurCommitRef.current = true;
    setLocalValue(getRawEditValue(field, format));
    setIsFocused(false);
    inputRef.current?.blur();
  }, [field, format]);

  const handleBlur = useCallback(() => {
    if (skipBlurCommitRef.current) {
      skipBlurCommitRef.current = false;
      return;
    }
    commitEdit();
  }, [commitEdit]);

  const outOfRange = isOutOfRange(field);

  const input = (
    <Input
      ref={inputRef}
      className={`h-7 text-sm font-mono tabular-nums px-2 py-0 ${
        outOfRange ? "bg-[#A9A2AA]/10" : ""
      }`}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commitEdit();
          skipBlurCommitRef.current = true;
          inputRef.current?.blur();
        }
        if (e.key === "Escape") cancelEdit();
      }}
      placeholder={getInputPlaceholder(format)}
      data-testid={`grid-cell-${fieldName}`}
    />
  );

  if (outOfRange) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{input}</TooltipTrigger>
        <TooltipContent
          className="text-xs"
          style={{ backgroundColor: "#A9A2AA", color: "#FFFFFF" }}
        >
          {formatRangeText(field, format)}
        </TooltipContent>
      </Tooltip>
    );
  }

  return input;
}

export function QuickEntryMode({ planId }: QuickEntryModeProps) {
  const { plan, isLoading, error, updatePlan, isSaving, saveError } = usePlan(planId);
  const { output, isLoading: outputsLoading, isFetching } = usePlanOutputs(planId);
  const financialInputs = plan?.financialInputs as PlanFinancialInputs | null | undefined;

  const saveInputs = useCallback(
    (updated: PlanFinancialInputs) => {
      updatePlan({ financialInputs: updated }).catch(() => {});
    },
    [updatePlan]
  );

  const { handleFieldUpdate, handleReset } = useFieldEditing({
    financialInputs,
    isSaving,
    onSave: saveInputs,
  });

  const gridRows = useMemo(
    () => (financialInputs ? buildGridRows(financialInputs) : []),
    [financialInputs]
  );

  const columns = useMemo<ColumnDef<GridRow>[]>(
    () => [
      {
        id: "category",
        header: "Category",
        size: 130,
        cell: ({ row }: CellContext<GridRow, unknown>) => {
          if (row.original.isGroupHeader) {
            return (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5 font-semibold text-sm w-full justify-start"
                onClick={() => row.toggleExpanded()}
                data-testid={`group-toggle-${row.original.category}`}
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
                    row.getIsExpanded() ? "" : "-rotate-90"
                  }`}
                />
                {row.original.label}
              </Button>
            );
          }
          return (
            <span className="text-xs text-muted-foreground pl-5">
              {CATEGORY_LABELS[row.original.category]}
            </span>
          );
        },
      },
      {
        id: "inputName",
        header: "Input Name",
        size: 180,
        cell: ({ row }: CellContext<GridRow, unknown>) => {
          if (row.original.isGroupHeader) return null;
          return (
            <span className="text-sm">{row.original.label}</span>
          );
        },
      },
      {
        id: "value",
        header: "Value",
        size: 150,
        cell: ({ row }: CellContext<GridRow, unknown>) => {
          if (row.original.isGroupHeader) return null;
          return <EditableCell row={row} onCellEdit={handleFieldUpdate} />;
        },
      },
      {
        id: "unit",
        header: "Unit",
        size: 60,
        cell: ({ row }: CellContext<GridRow, unknown>) => {
          if (row.original.isGroupHeader || !row.original.format) return null;
          return (
            <span className="text-xs text-muted-foreground" data-testid={`grid-unit-${row.original.fieldName}`}>
              {UNIT_LABELS[row.original.format]}
            </span>
          );
        },
      },
      {
        id: "source",
        header: "Source",
        size: 110,
        cell: ({ row }: CellContext<GridRow, unknown>) => {
          if (row.original.isGroupHeader || !row.original.field) return null;
          return (
            <SourceBadge
              source={row.original.field.source as "brand_default" | "user_entry" | "ai_populated"}
            />
          );
        },
      },
      {
        id: "brandDefault",
        header: "Brand Default",
        size: 120,
        cell: ({ row }: CellContext<GridRow, unknown>) => {
          if (row.original.isGroupHeader || !row.original.field || !row.original.format) return null;
          const { field, format } = row.original;
          if (field.brandDefault === null) return <span className="text-xs text-muted-foreground">—</span>;
          return (
            <span className="text-xs font-mono tabular-nums text-muted-foreground" data-testid={`grid-default-${row.original.fieldName}`}>
              {formatFieldValue(field.brandDefault, format)}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        size: 40,
        cell: ({ row }: CellContext<GridRow, unknown>) => {
          if (row.original.isGroupHeader || !row.original.field || !row.original.fieldName) return null;
          const isUserEntry = row.original.field.source === "user_entry";
          if (!isUserEntry) return null;
          return (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleReset(row.original.category, row.original.fieldName!)}
              aria-label="Reset to brand default"
              data-testid={`grid-reset-${row.original.fieldName}`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          );
        },
      },
    ],
    [handleFieldUpdate, handleReset]
  );

  const table = useReactTable({
    data: gridRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row) => row.subRows,
    initialState: {
      expanded: true,
    },
  });

  if (isLoading) {
    return (
      <div data-testid="quick-entry-container" className="h-full p-3 space-y-3 overflow-auto">
        <Skeleton className="h-20 w-full rounded-md" />
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-8 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="quick-entry-container" className="h-full p-3 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 text-destructive" data-testid="status-error">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Failed to load your plan data. Please try refreshing.</span>
        </div>
      </div>
    );
  }

  if (!financialInputs) {
    return (
      <div data-testid="quick-entry-container" className="h-full p-3 flex flex-col items-center justify-center">
        <p className="text-sm text-muted-foreground" data-testid="status-no-inputs">
          Your plan hasn't been initialized yet. Complete Quick Start to begin.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="quick-entry-container" className="h-full flex flex-col overflow-hidden">
      <div className="sticky top-0 z-10 bg-background border-b px-3 py-2">
        <StickyMetrics output={output} isLoading={outputsLoading} isFetching={isFetching} />
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm" data-testid="quick-entry-grid">
          <thead className="sticky top-0 z-[5] bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b"
                    style={{ width: header.column.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              const isGroup = row.original.isGroupHeader;
              return (
                <tr
                  key={row.id}
                  className={`border-b transition-colors ${
                    isGroup
                      ? "bg-muted/50 hover-elevate"
                      : "hover-elevate"
                  }`}
                  data-testid={isGroup ? `grid-group-${row.original.category}` : `grid-row-${row.original.fieldName}`}
                >
                  {isGroup ? (
                    <td className="px-2 py-1.5" colSpan={columns.length}>
                      {flexRender(row.getVisibleCells()[0].column.columnDef.cell, row.getVisibleCells()[0].getContext())}
                    </td>
                  ) : (
                    row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-2 py-1">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isSaving && (
        <div className="px-3 py-1 border-t bg-background">
          <p className="text-xs text-muted-foreground text-center" data-testid="status-saving">
            Saving...
          </p>
        </div>
      )}
      {saveError && (
        <div className="px-3 py-1 border-t bg-background">
          <div className="flex items-center gap-2 text-destructive text-xs justify-center" data-testid="status-save-error">
            <AlertCircle className="h-3 w-3" />
            <span>Save failed. Your changes will be retried on next edit.</span>
          </div>
        </div>
      )}
    </div>
  );
}

function StickyMetrics({
  output,
  isLoading,
  isFetching,
}: {
  output: ReturnType<typeof usePlanOutputs>["output"];
  isLoading: boolean;
  isFetching: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-2" data-testid="quick-entry-metrics-loading">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 rounded-md" />
        ))}
      </div>
    );
  }

  if (!output) {
    return (
      <p className="text-xs text-muted-foreground text-center py-1" data-testid="quick-entry-metrics-empty">
        Enter values to see metrics
      </p>
    );
  }

  const { roiMetrics, annualSummaries } = output;
  const fetching = isFetching && !isLoading;

  return (
    <div className="grid grid-cols-4 gap-2" data-testid="quick-entry-metrics">
      <CompactMetric
        label="Total Investment"
        value={formatCents(roiMetrics.totalStartupInvestment)}
        isFetching={fetching}
        testId="qe-metric-investment"
      />
      <CompactMetric
        label="Year 1 Revenue"
        value={formatCents(annualSummaries[0]?.revenue ?? 0)}
        isFetching={fetching}
        testId="qe-metric-revenue"
      />
      <CompactMetric
        label="5-Year ROI"
        value={formatROI(roiMetrics.fiveYearROIPct)}
        isFetching={fetching}
        testId="qe-metric-roi"
      />
      <CompactMetric
        label="Break-Even"
        value={formatBreakEven(roiMetrics.breakEvenMonth)}
        isFetching={fetching}
        testId="qe-metric-breakeven"
      />
    </div>
  );
}

function CompactMetric({
  label,
  value,
  isFetching,
  testId,
}: {
  label: string;
  value: string;
  isFetching: boolean;
  testId: string;
}) {
  return (
    <div className="rounded-md bg-card border px-2 py-1.5">
      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider truncate">
        {label}
      </p>
      <p
        className="text-sm font-semibold font-mono tabular-nums transition-opacity duration-200 truncate"
        style={{ opacity: isFetching ? 0.5 : 1 }}
        data-testid={testId}
      >
        {value}
      </p>
    </div>
  );
}
