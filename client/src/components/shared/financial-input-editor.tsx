import { useState, useCallback, useRef } from "react";
import { usePlan } from "@/hooks/use-plan";
import {
  updateFieldValue,
  resetFieldToDefault,
} from "@shared/plan-initialization";
import type {
  PlanFinancialInputs,
  FinancialFieldValue,
} from "@shared/financial-engine";
import { formatCents, parseDollarsToCents } from "@/lib/format-currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RotateCcw, AlertCircle, ChevronDown } from "lucide-react";

// ─── Field metadata mapping (labels and format types) ────────────────────

type FormatType = "currency" | "percentage" | "integer";

interface FieldMeta {
  label: string;
  format: FormatType;
}

const FIELD_METADATA: Record<string, Record<string, FieldMeta>> = {
  revenue: {
    monthlyAuv: { label: "Monthly AUV", format: "currency" },
    year1GrowthRate: { label: "Year 1 Growth Rate", format: "percentage" },
    year2GrowthRate: { label: "Year 2 Growth Rate", format: "percentage" },
    startingMonthAuvPct: { label: "Starting Month AUV %", format: "percentage" },
  },
  operatingCosts: {
    cogsPct: { label: "COGS %", format: "percentage" },
    laborPct: { label: "Labor %", format: "percentage" },
    rentMonthly: { label: "Rent (Monthly)", format: "currency" },
    utilitiesMonthly: { label: "Utilities (Monthly)", format: "currency" },
    insuranceMonthly: { label: "Insurance (Monthly)", format: "currency" },
    marketingPct: { label: "Marketing %", format: "percentage" },
    royaltyPct: { label: "Royalty %", format: "percentage" },
    adFundPct: { label: "Ad Fund %", format: "percentage" },
    otherMonthly: { label: "Other (Monthly)", format: "currency" },
  },
  financing: {
    loanAmount: { label: "Loan Amount", format: "currency" },
    interestRate: { label: "Interest Rate", format: "percentage" },
    loanTermMonths: { label: "Loan Term (Months)", format: "integer" },
    downPaymentPct: { label: "Down Payment %", format: "percentage" },
  },
  startupCapital: {
    workingCapitalMonths: { label: "Working Capital (Months)", format: "integer" },
    depreciationYears: { label: "Depreciation (Years)", format: "integer" },
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  revenue: "Revenue",
  operatingCosts: "Operating Costs",
  financing: "Financing",
  startupCapital: "Startup Capital",
};

const CATEGORY_ORDER = ["revenue", "operatingCosts", "financing", "startupCapital"];

// ─── Format/parse helpers ────────────────────────────────────────────────

function formatFieldValue(value: number, format: FormatType): string {
  switch (format) {
    case "currency":
      return formatCents(value);
    case "percentage":
      return `${(value * 100).toFixed(1)}%`;
    case "integer":
      return String(value);
  }
}

function parseFieldInput(input: string, format: FormatType): number {
  switch (format) {
    case "currency":
      return parseDollarsToCents(input);
    case "percentage": {
      const cleaned = input.replace(/%/g, "").trim();
      const num = parseFloat(cleaned);
      if (isNaN(num)) return NaN;
      return num / 100;
    }
    case "integer": {
      const num = parseInt(input, 10);
      if (isNaN(num) || num < 0) return NaN;
      return num;
    }
  }
}

function getInputPlaceholder(format: FormatType): string {
  switch (format) {
    case "currency":
      return "$0";
    case "percentage":
      return "0.0%";
    case "integer":
      return "0";
  }
}

// ─── Component ───────────────────────────────────────────────────────────

interface FinancialInputEditorProps {
  planId: string;
}

export function FinancialInputEditor({ planId }: FinancialInputEditorProps) {
  const { plan, isLoading, error, updatePlan, isSaving, saveError } = usePlan(planId);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const editCanceledRef = useRef(false);

  const financialInputs = plan?.financialInputs as PlanFinancialInputs | null | undefined;

  const saveInputs = useCallback(
    async (updated: PlanFinancialInputs) => {
      try {
        await updatePlan({ financialInputs: updated as any });
      } catch {
        // Error handled via mutation state
      }
    },
    [updatePlan]
  );

  const handleEditStart = useCallback(
    (category: string, fieldName: string, field: FinancialFieldValue) => {
      // Block new edits while a save is in-flight to prevent stale-snapshot overwrites
      if (isSaving) return;

      const meta = FIELD_METADATA[category]?.[fieldName];
      if (!meta) return;

      const key = `${category}.${fieldName}`;
      setEditingField(key);

      // Show raw value for editing
      switch (meta.format) {
        case "currency":
          setEditValue(String(field.currentValue / 100));
          break;
        case "percentage":
          setEditValue(String((field.currentValue * 100).toFixed(1)));
          break;
        case "integer":
          setEditValue(String(field.currentValue));
          break;
      }
    },
    [isSaving]
  );

  const handleEditCommit = useCallback(() => {
    if (!editingField || !financialInputs || editCanceledRef.current) {
      editCanceledRef.current = false;
      setEditingField(null);
      setEditValue("");
      return;
    }

    const [category, fieldName] = editingField.split(".");
    const meta = FIELD_METADATA[category]?.[fieldName];
    if (!meta) return;

    const parsedValue = parseFieldInput(editValue, meta.format);
    if (isNaN(parsedValue)) {
      setEditingField(null);
      setEditValue("");
      return;
    }

    const categoryObj = financialInputs[category as keyof PlanFinancialInputs];
    const field = categoryObj[fieldName as keyof typeof categoryObj] as FinancialFieldValue;

    // Only save if value actually changed
    if (parsedValue !== field.currentValue) {
      const updatedField = updateFieldValue(field, parsedValue, new Date().toISOString());
      const updatedInputs = {
        ...financialInputs,
        [category]: {
          ...categoryObj,
          [fieldName]: updatedField,
        },
      };
      saveInputs(updatedInputs as PlanFinancialInputs);
    }

    setEditingField(null);
    setEditValue("");
  }, [editingField, editValue, financialInputs, saveInputs]);

  const handleEditCancel = useCallback(() => {
    editCanceledRef.current = true;
    setEditingField(null);
    setEditValue("");
  }, []);

  const handleReset = useCallback(
    (category: string, fieldName: string) => {
      if (!financialInputs || isSaving) return;

      const categoryObj = financialInputs[category as keyof PlanFinancialInputs];
      const field = categoryObj[fieldName as keyof typeof categoryObj] as FinancialFieldValue;
      const resetField = resetFieldToDefault(field, new Date().toISOString());

      const updatedInputs = {
        ...financialInputs,
        [category]: {
          ...categoryObj,
          [fieldName]: resetField,
        },
      };
      saveInputs(updatedInputs as PlanFinancialInputs);
    },
    [financialInputs, isSaving, saveInputs]
  );

  // ─── Loading state ──────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Inputs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  // ─── Error state ────────────────────────────────────────────────────────

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Inputs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive" data-testid="status-error">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to load financial inputs. Please try again.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── No inputs state ───────────────────────────────────────────────────

  if (!financialInputs) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Inputs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground" data-testid="status-no-inputs">
            Plan not initialized — financial inputs will be available after plan setup.
          </p>
        </CardContent>
      </Card>
    );
  }

  // ─── Main render ────────────────────────────────────────────────────────

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Financial Inputs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {CATEGORY_ORDER.map((category) => {
          const fields = FIELD_METADATA[category];
          const categoryData = financialInputs[category as keyof PlanFinancialInputs];

          return (
            <CategorySection
              key={category}
              category={category}
              label={CATEGORY_LABELS[category]}
              fields={fields}
              categoryData={categoryData}
              editingField={editingField}
              editValue={editValue}
              focusedField={focusedField}
              onEditValueChange={setEditValue}
              onEditStart={handleEditStart}
              onEditCommit={handleEditCommit}
              onEditCancel={handleEditCancel}
              onReset={handleReset}
              onFocusChange={setFocusedField}
            />
          );
        })}

        {isSaving && (
          <p className="text-xs text-muted-foreground text-center pt-1" data-testid="status-saving">
            Saving...
          </p>
        )}
        {saveError && (
          <div className="flex items-center gap-2 text-destructive text-sm" data-testid="status-error">
            <AlertCircle className="h-4 w-4" />
            <span>Save failed. Your changes will be retried on next edit.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Category Section ────────────────────────────────────────────────────

interface CategorySectionProps {
  category: string;
  label: string;
  fields: Record<string, FieldMeta>;
  categoryData: Record<string, FinancialFieldValue>;
  editingField: string | null;
  editValue: string;
  focusedField: string | null;
  onEditValueChange: (v: string) => void;
  onEditStart: (category: string, fieldName: string, field: FinancialFieldValue) => void;
  onEditCommit: () => void;
  onEditCancel: () => void;
  onReset: (category: string, fieldName: string) => void;
  onFocusChange: (key: string | null) => void;
}

function CategorySection({
  category,
  label,
  fields,
  categoryData,
  editingField,
  editValue,
  focusedField,
  onEditValueChange,
  onEditStart,
  onEditCommit,
  onEditCancel,
  onReset,
  onFocusChange,
}: CategorySectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-md" data-testid={`section-${category}`}>
        <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 hover:bg-muted/50 rounded-t-md">
          <span className="text-sm font-semibold">{label}</span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              isOpen ? "" : "-rotate-90"
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-2 space-y-0.5">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_140px_100px_80px] gap-2 px-2 py-1 text-xs font-medium text-muted-foreground border-b">
              <span>Field</span>
              <span>Value</span>
              <span>Source</span>
              <span />
            </div>

            {Object.entries(fields).map(([fieldName, meta]) => {
              const field = categoryData[fieldName] as FinancialFieldValue;
              const key = `${category}.${fieldName}`;
              const isEditing = editingField === key;
              const isFocused = focusedField === key;

              return (
                <FieldRow
                  key={key}
                  fieldKey={key}
                  category={category}
                  fieldName={fieldName}
                  meta={meta}
                  field={field}
                  isEditing={isEditing}
                  isFocused={isFocused}
                  editValue={editValue}
                  onEditValueChange={onEditValueChange}
                  onEditStart={onEditStart}
                  onEditCommit={onEditCommit}
                  onEditCancel={onEditCancel}
                  onReset={onReset}
                  onFocusChange={onFocusChange}
                />
              );
            })}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// ─── Field Row ───────────────────────────────────────────────────────────

interface FieldRowProps {
  fieldKey: string;
  category: string;
  fieldName: string;
  meta: FieldMeta;
  field: FinancialFieldValue;
  isEditing: boolean;
  isFocused: boolean;
  editValue: string;
  onEditValueChange: (v: string) => void;
  onEditStart: (category: string, fieldName: string, field: FinancialFieldValue) => void;
  onEditCommit: () => void;
  onEditCancel: () => void;
  onReset: (category: string, fieldName: string) => void;
  onFocusChange: (key: string | null) => void;
}

function FieldRow({
  fieldKey,
  category,
  fieldName,
  meta,
  field,
  isEditing,
  isFocused,
  editValue,
  onEditValueChange,
  onEditStart,
  onEditCommit,
  onEditCancel,
  onReset,
  onFocusChange,
}: FieldRowProps) {
  const isUserEntry = field.source === "user_entry";
  const defaultDisplay =
    field.brandDefault !== null ? formatFieldValue(field.brandDefault, meta.format) : null;

  return (
    <div
      className={`grid grid-cols-[1fr_140px_100px_80px] gap-2 px-2 py-1.5 items-center rounded hover:bg-muted/50 text-sm ${
        isUserEntry ? "bg-muted/30" : ""
      }`}
    >
      {/* Label + brand default */}
      <div>
        <span className="truncate">{meta.label}</span>
        {defaultDisplay && (
          <span
            className="block text-xs text-muted-foreground"
            data-testid={`field-default-${fieldName}`}
          >
            Default: {defaultDisplay}
          </span>
        )}
        {isFocused && field.lastModifiedAt && (
          <span className="block text-xs text-muted-foreground">
            Modified: {new Date(field.lastModifiedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Editable value */}
      {isEditing ? (
        <Input
          className="h-7 text-sm font-mono"
          value={editValue}
          onChange={(e) => onEditValueChange(e.target.value)}
          onBlur={onEditCommit}
          onKeyDown={(e) => {
            if (e.key === "Enter") onEditCommit();
            if (e.key === "Escape") onEditCancel();
          }}
          placeholder={getInputPlaceholder(meta.format)}
          data-testid={`field-input-${fieldName}`}
          autoFocus
        />
      ) : (
        <button
          className="text-left font-mono tabular-nums hover:underline cursor-text h-7 flex items-center"
          onClick={() => onEditStart(category, fieldName, field)}
          onFocus={() => onFocusChange(fieldKey)}
          onBlur={() => onFocusChange(null)}
          data-testid={`field-input-${fieldName}`}
        >
          {formatFieldValue(field.currentValue, meta.format)}
        </button>
      )}

      {/* Source badge */}
      <Badge
        variant={isUserEntry ? "default" : "secondary"}
        className="text-xs justify-center"
        data-testid={`badge-source-${fieldName}`}
      >
        {isUserEntry ? "Your Entry" : "Brand Default"}
      </Badge>

      {/* Reset button */}
      <div className="flex justify-end">
        {isUserEntry && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="p-1 text-muted-foreground hover:text-foreground"
                onClick={() => onReset(category, fieldName)}
                aria-label="Reset to brand default"
                data-testid={`button-reset-${fieldName}`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Reset to brand default</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
