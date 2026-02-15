import { useState, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { FinancialFieldValue } from "@shared/financial-engine";
import type { FormatType } from "@/lib/field-metadata";
import {
  formatFieldValue,
  parseFieldInput,
  getInputPlaceholder,
} from "@/lib/field-metadata";
import { formatCents } from "@/lib/format-currency";

export interface EditableCellProps {
  field: FinancialFieldValue;
  format: FormatType;
  category: string;
  fieldName: string;
  onCellEdit: (category: string, fieldName: string, value: number) => void;
  onNavigate: (fieldName: string, direction: "next" | "prev" | "down") => void;
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

function getFormattedDisplayValue(field: FinancialFieldValue, format: FormatType): string {
  switch (format) {
    case "currency":
      return formatCents(field.currentValue, true);
    case "percentage":
    case "integer":
      return formatFieldValue(field.currentValue, format);
  }
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

export function EditableCell({
  field,
  format,
  category,
  fieldName,
  onCellEdit,
  onNavigate,
}: EditableCellProps) {
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
    setLocalValue(getRawEditValue(field, format));
    requestAnimationFrame(() => {
      inputRef.current?.select();
    });
  }, [field, format]);

  const commitValue = useCallback((): void => {
    setIsFocused(false);
    let parsedValue: number;
    if (format === "integer") {
      const cleaned = localValue.replace(/[^0-9.\-]/g, "").trim();
      const num = parseFloat(cleaned);
      parsedValue = isNaN(num) || num < 0 ? NaN : Math.round(num);
    } else {
      parsedValue = parseFieldInput(localValue, format);
    }
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
    commitValue();
  }, [commitValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        skipBlurCommitRef.current = true;
        commitValue();
        onNavigate(fieldName, e.shiftKey ? "prev" : "next");
      } else if (e.key === "Enter") {
        e.preventDefault();
        skipBlurCommitRef.current = true;
        commitValue();
        onNavigate(fieldName, "down");
      } else if (e.key === "Escape") {
        cancelEdit();
      }
    },
    [commitValue, cancelEdit, onNavigate, fieldName]
  );

  const outOfRange = isOutOfRange(field);
  const displayValue = isFocused ? localValue : getFormattedDisplayValue(field, format);

  const input = (
    <Input
      ref={inputRef}
      className={`h-7 text-sm font-mono tabular-nums px-2 py-0 ${
        outOfRange ? "bg-[#A9A2AA]/10" : ""
      }`}
      value={displayValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={getInputPlaceholder(format)}
      data-testid={`grid-cell-${fieldName}`}
      data-field-name={fieldName}
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
