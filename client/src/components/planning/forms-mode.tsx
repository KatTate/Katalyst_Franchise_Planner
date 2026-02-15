import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { usePlan } from "@/hooks/use-plan";
import { useFieldEditing } from "@/hooks/use-field-editing";
import type {
  PlanFinancialInputs,
  FinancialFieldValue,
} from "@shared/financial-engine";
import { SourceBadge } from "@/components/shared/source-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, RotateCcw, AlertCircle, Sparkles } from "lucide-react";
import {
  FIELD_METADATA,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  formatFieldValue,
  getInputPlaceholder,
} from "@/lib/field-metadata";
import { formatCents } from "@/lib/format-currency";
import { useStartupCosts } from "@/hooks/use-startup-costs";
import { StartupCostBuilder } from "@/components/shared/startup-cost-builder";
import type { FieldMeta } from "@/lib/field-metadata";

type StartupCostCountCallback = (count: number) => void;

interface FormsModeProps {
  planId: string;
  queueSave?: (data: any) => void;
}

interface SectionProgress {
  category: string;
  label: string;
  edited: number;
  total: number;
}

function computeSectionProgress(financialInputs: PlanFinancialInputs): SectionProgress[] {
  return CATEGORY_ORDER.map((category) => {
    const fields = FIELD_METADATA[category];
    const categoryData = financialInputs[category as keyof PlanFinancialInputs];
    const fieldNames = Object.keys(fields);
    const total = fieldNames.length;
    const edited = fieldNames.filter((name) => {
      const field = categoryData[name as keyof typeof categoryData] as FinancialFieldValue | undefined;
      return field && field.source !== "brand_default";
    }).length;
    return { category, label: CATEGORY_LABELS[category], edited, total };
  });
}

function hasAnyUserEdits(financialInputs: PlanFinancialInputs): boolean {
  return CATEGORY_ORDER.some((category) => {
    const fields = FIELD_METADATA[category];
    const categoryData = financialInputs[category as keyof PlanFinancialInputs];
    return Object.keys(fields).some((name) => {
      const field = categoryData[name as keyof typeof categoryData] as FinancialFieldValue | undefined;
      return field && field.source !== "brand_default";
    });
  });
}

export function FormsMode({ planId, queueSave }: FormsModeProps) {
  const { plan, isLoading, error, updatePlan, isSaving, saveError } = usePlan(planId);
  const financialInputs = plan?.financialInputs as PlanFinancialInputs | null | undefined;

  const sectionStorageKey = `plan-active-section-${planId}`;
  const getStoredSection = (): string | null => {
    try { return localStorage.getItem(sectionStorageKey); } catch { return null; }
  };
  const storedSection = useRef(getStoredSection());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleSectionInteract = useCallback((category: string) => {
    try { localStorage.setItem(sectionStorageKey, category); } catch {}
  }, [sectionStorageKey]);

  useEffect(() => {
    if (!financialInputs || !storedSection.current) return;
    const el = document.querySelector(`[data-testid="section-${storedSection.current}"]`);
    if (el && scrollContainerRef.current) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
      });
    }
    storedSection.current = null;
  }, [financialInputs]);

  const saveInputs = useCallback(
    (updated: PlanFinancialInputs) => {
      if (queueSave) {
        queueSave({ financialInputs: updated });
      } else {
        updatePlan({ financialInputs: updated }).catch(() => {});
      }
    },
    [updatePlan, queueSave]
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
  } = useFieldEditing({ financialInputs, isSaving: queueSave ? false : isSaving, onSave: saveInputs });

  const [startupCostCount, setStartupCostCount] = useState(0);

  const sectionProgress = useMemo(
    () => (financialInputs ? computeSectionProgress(financialInputs) : []),
    [financialInputs]
  );

  const showStartHere = useMemo(
    () => (financialInputs ? !hasAnyUserEdits(financialInputs) : false),
    [financialInputs]
  );

  if (isLoading) {
    return (
      <div data-testid="forms-mode-container" className="h-full p-4 space-y-4 overflow-auto">
        <Skeleton className="h-20 w-full rounded-md" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="forms-mode-container" className="h-full p-4 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 text-destructive" data-testid="status-error">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Failed to load your plan data. Please try refreshing.</span>
        </div>
      </div>
    );
  }

  if (!financialInputs) {
    return (
      <div data-testid="forms-mode-container" className="h-full p-4 flex flex-col items-center justify-center">
        <p className="text-sm text-muted-foreground" data-testid="status-no-inputs">
          Your plan hasn't been initialized yet. Complete Quick Start to begin.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="forms-mode-container" className="h-full flex flex-col overflow-hidden">
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <PlanCompleteness sections={sectionProgress} startupCostCount={startupCostCount} />
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-auto px-4 py-4 space-y-3">
        {CATEGORY_ORDER.map((category, index) => (
          <FormSection
            key={category}
            category={category}
            label={CATEGORY_LABELS[category]}
            fields={FIELD_METADATA[category]}
            categoryData={financialInputs[category as keyof PlanFinancialInputs]}
            progress={sectionProgress[index]}
            editingField={editingField}
            editValue={editValue}
            focusedField={focusedField}
            onEditValueChange={setEditValue}
            onEditStart={handleEditStart}
            onEditCommit={handleEditCommit}
            onEditCancel={handleEditCancel}
            onReset={handleReset}
            onFocusChange={setFocusedField}
            onSectionInteract={handleSectionInteract}
            showStartHere={showStartHere && index === 0}
            defaultOpen={showStartHere ? index === 0 : true}
          />
        ))}

        <StartupCostSection planId={planId} defaultOpen={true} onCountChange={setStartupCostCount} onSectionInteract={handleSectionInteract} />

        {!queueSave && isSaving && (
          <p className="text-xs text-muted-foreground text-center pt-1" data-testid="status-saving">
            Saving...
          </p>
        )}
        {!queueSave && saveError && (
          <div className="flex items-center gap-2 text-destructive text-sm justify-center" data-testid="status-save-error">
            <AlertCircle className="h-4 w-4" />
            <span>Save failed. Your changes will be retried on next edit.</span>
          </div>
        )}
      </div>
    </div>
  );
}

function PlanCompleteness({ sections, startupCostCount }: { sections: SectionProgress[]; startupCostCount: number }) {
  const totalEdited = sections.reduce((sum, s) => sum + s.edited, 0);
  const totalFields = sections.reduce((sum, s) => sum + s.total, 0);

  return (
    <div data-testid="plan-completeness-dashboard">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">Plan Progress</span>
        <span className="text-xs text-muted-foreground">
          {totalEdited}/{totalFields} fields customized
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {sections.map((section) => {
          const pct = section.total > 0 ? (section.edited / section.total) * 100 : 0;
          return (
            <div
              key={section.category}
              className="flex flex-col gap-1"
              data-testid={`section-progress-${section.category}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground truncate">{section.label}</span>
                <span className="text-xs font-medium tabular-nums">
                  {section.edited}/{section.total}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
        <div
          className="flex flex-col gap-1"
          data-testid="section-progress-startupCosts"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground truncate">Startup Costs</span>
            <span className="text-xs font-medium tabular-nums">
              {startupCostCount} items
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FormSectionProps {
  category: string;
  label: string;
  fields: Record<string, FieldMeta>;
  categoryData: Record<string, FinancialFieldValue>;
  progress: SectionProgress;
  editingField: string | null;
  editValue: string;
  focusedField: string | null;
  onEditValueChange: (v: string) => void;
  onEditStart: (category: string, fieldName: string, field: FinancialFieldValue) => void;
  onEditCommit: () => void;
  onEditCancel: () => void;
  onReset: (category: string, fieldName: string) => void;
  onFocusChange: (key: string | null) => void;
  onSectionInteract: (category: string) => void;
  showStartHere: boolean;
  defaultOpen: boolean;
}

function FormSection({
  category,
  label,
  fields,
  categoryData,
  progress,
  editingField,
  editValue,
  focusedField,
  onEditValueChange,
  onEditStart,
  onEditCommit,
  onEditCancel,
  onReset,
  onFocusChange,
  onSectionInteract,
  showStartHere,
  defaultOpen,
}: FormSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (open) {
      onSectionInteract(category);
    }
  }, [category, onSectionInteract]);

  return (
    <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
      <div
        className={`border rounded-md ${showStartHere ? "ring-2 ring-primary/30" : ""}`}
        data-testid={`section-${category}`}
      >
        <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full px-4 py-3 hover-elevate rounded-t-md">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-semibold truncate">{label}</span>
            {showStartHere && (
              <span className="flex items-center gap-1 text-xs text-primary font-medium shrink-0">
                <Sparkles className="h-3 w-3" />
                Start here
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground tabular-nums">
              {progress.edited}/{progress.total} edited
            </span>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                isOpen ? "" : "-rotate-90"
              }`}
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-1">
            {Object.entries(fields).map(([fieldName, meta]) => {
              const field = categoryData[fieldName] as FinancialFieldValue;
              const key = `${category}.${fieldName}`;
              const isEditing = editingField === key;
              const isFocused = focusedField === key;

              return (
                <FormField
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

interface FormFieldProps {
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

function FormField({
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
}: FormFieldProps) {
  const isUserEntry = field.source === "user_entry";
  const defaultDisplay =
    field.brandDefault !== null ? formatFieldValue(field.brandDefault, meta.format) : null;

  return (
    <div data-testid={`field-row-${fieldName}`} className="rounded-md px-3 py-2.5 hover-elevate">
      <div className="flex items-center gap-3">
        <label className="text-sm text-foreground min-w-0 flex-1 truncate">
          {meta.label}
        </label>

        <div className="w-36 shrink-0">
          {isEditing ? (
            <Input
              className="h-8 text-sm font-mono tabular-nums"
              value={editValue}
              onChange={(e) => onEditValueChange(e.target.value)}
              onBlur={() => {
                onEditCommit();
                onFocusChange(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onEditCommit();
                  onFocusChange(null);
                }
                if (e.key === "Escape") onEditCancel();
              }}
              placeholder={getInputPlaceholder(meta.format)}
              data-testid={`field-input-${fieldName}`}
              autoFocus
            />
          ) : (
            <button
              className="w-full text-left font-mono tabular-nums text-sm h-8 px-3 rounded-md border border-input bg-transparent hover:border-ring cursor-text flex items-center"
              onClick={() => {
                onFocusChange(fieldKey);
                onEditStart(category, fieldName, field);
              }}
              onFocus={() => onFocusChange(fieldKey)}
              onBlur={() => onFocusChange(null)}
              data-testid={`field-input-${fieldName}`}
              aria-label={`Edit ${meta.label}`}
            >
              {formatFieldValue(field.currentValue, meta.format)}
            </button>
          )}
        </div>

        <div className="shrink-0" data-testid={`badge-source-${fieldName}`}>
          <SourceBadge source={field.source as "brand_default" | "user_entry" | "ai_populated"} />
        </div>

        <div className="w-8 shrink-0 flex justify-center">
          {isUserEntry ? (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onReset(category, fieldName)}
              aria-label="Reset to brand default"
              data-testid={`button-reset-${fieldName}`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <span className="invisible h-9 w-9" />
          )}
        </div>
      </div>

      {(isFocused || isEditing) && (
        <div
          className="mt-2 ml-0 pl-3 border-l-2 border-muted text-xs text-muted-foreground space-y-0.5 animate-in fade-in-0 slide-in-from-top-1 duration-200"
          data-testid={`field-metadata-${fieldName}`}
        >
          {defaultDisplay && (
            <p>Brand default: <span className="font-mono tabular-nums">{defaultDisplay}</span></p>
          )}
          <p>Item 7 range: {field.item7Range ? (
            <span className="font-mono tabular-nums">{formatCents(field.item7Range.min)} – {formatCents(field.item7Range.max)}</span>
          ) : (
            <span className="italic">N/A</span>
          )}</p>
          <p>Source: {field.source === "brand_default" ? "Brand Default" : field.source === "user_entry" ? "Your Entry" : "AI-Populated"}</p>
        </div>
      )}
    </div>
  );
}

function StartupCostSection({ planId, defaultOpen, onCountChange, onSectionInteract }: { planId: string; defaultOpen: boolean; onCountChange?: StartupCostCountCallback; onSectionInteract?: (category: string) => void }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { costs } = useStartupCosts(planId);

  useEffect(() => {
    onCountChange?.(costs.length);
  }, [costs.length, onCountChange]);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (open) {
      onSectionInteract?.("startupCosts");
    }
  }, [onSectionInteract]);

  return (
    <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
      <div className="border rounded-md" data-testid="section-startupCosts">
        <CollapsibleTrigger className="flex items-center justify-between gap-2 w-full px-4 py-3 hover-elevate rounded-t-md">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-semibold truncate">Startup Costs</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground tabular-nums">
              {costs.length} items
            </span>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                isOpen ? "" : "-rotate-90"
              }`}
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <StartupCostBuilder planId={planId} />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
