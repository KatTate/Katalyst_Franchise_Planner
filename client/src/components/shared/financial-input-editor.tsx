import { useState, useCallback } from "react";
import { usePlan } from "@/hooks/use-plan";
import { useFieldEditing } from "@/hooks/use-field-editing";
import type {
  PlanFinancialInputs,
  FinancialFieldValue,
} from "@shared/financial-engine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SourceBadge } from "@/components/shared/source-badge";
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
import {
  FIELD_METADATA,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  formatFieldValue,
  getInputPlaceholder,
} from "@/lib/field-metadata";
import type { FieldMeta } from "@/lib/field-metadata";

function resolveCategoryData(inputs: PlanFinancialInputs, category: string): Record<string, FinancialFieldValue | FinancialFieldValue[]> {
  if (category === "facilitiesDecomposition") {
    return (inputs.operatingCosts?.facilitiesDecomposition ?? {}) as Record<string, FinancialFieldValue | FinancialFieldValue[]>;
  }
  return ((inputs as any)[category] ?? {}) as Record<string, FinancialFieldValue | FinancialFieldValue[]>;
}

interface FinancialInputEditorProps {
  planId: string;
}

export function FinancialInputEditor({ planId }: FinancialInputEditorProps) {
  const { plan, isLoading, error, updatePlan, isSaving, saveError } = usePlan(planId);
  const financialInputs = plan?.financialInputs as PlanFinancialInputs | null | undefined;

  const saveInputs = useCallback(
    (updated: PlanFinancialInputs) => {
      updatePlan({ financialInputs: updated }).catch(() => {});
    },
    [updatePlan]
  );

  const {
    editingField,
    editValue,
    focusedField,
    setEditValue,
    setFocusedField,
    handleEditStart,
    handleEditCommit,
    handleEditCancel,
    handleReset,
  } = useFieldEditing({ financialInputs, isSaving, onSave: saveInputs });

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

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Financial Inputs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {CATEGORY_ORDER.map((category) => {
          const fields = FIELD_METADATA[category];
          const categoryData = resolveCategoryData(financialInputs, category);

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

interface CategorySectionProps {
  category: string;
  label: string;
  fields: Record<string, FieldMeta>;
  categoryData: Record<string, FinancialFieldValue | FinancialFieldValue[]>;
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
        <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 hover-elevate rounded-t-md">
          <span className="text-sm font-semibold">{label}</span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              isOpen ? "" : "-rotate-90"
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-2 space-y-0.5">
            <div className="grid grid-cols-[1fr_140px_100px_80px] gap-2 px-2 py-1 text-xs font-medium text-muted-foreground border-b">
              <span>Field</span>
              <span>Value</span>
              <span>Source</span>
              <span />
            </div>

            {Object.entries(fields).map(([fieldName, meta]) => {
              const raw = categoryData[fieldName];
              const field = (Array.isArray(raw) ? raw[0] : raw) as FinancialFieldValue;
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
      className={`grid grid-cols-[1fr_140px_100px_80px] gap-2 px-2 py-1.5 items-center rounded hover-elevate text-sm ${
        isUserEntry ? "bg-muted/30" : ""
      }`}
    >
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
          aria-label={`Edit ${meta.label}`}
        >
          {formatFieldValue(field.currentValue, meta.format)}
        </button>
      )}

      <div data-testid={`badge-source-${fieldName}`}>
        <SourceBadge source={field.source as "brand_default" | "user_entry" | "ai_populated"} />
      </div>

      <div className="flex justify-end">
        {isUserEntry && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onReset(category, fieldName)}
                aria-label="Reset to brand default"
                data-testid={`button-reset-${fieldName}`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset to brand default</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
