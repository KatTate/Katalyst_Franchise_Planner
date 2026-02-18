import { useState, useRef, useCallback, useEffect } from "react";
import type { FormatType } from "@/lib/field-metadata";

interface InlineEditableCellProps {
  displayValue: string;
  rawValue: number;
  inputFormat: FormatType | "multiple";
  onCommit: (rawInput: string) => void;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancel: () => void;
  onTabNext?: () => void;
  onTabPrev?: () => void;
  testId: string;
  ariaLabel: string;
  className?: string;
  isFlashing?: boolean;
}

function formatRawForInput(rawValue: number, inputFormat: FormatType | "multiple"): string {
  switch (inputFormat) {
    case "currency":
      return String(rawValue / 100);
    case "percentage":
      return (rawValue * 100).toFixed(1);
    case "integer":
      return String(rawValue);
    case "multiple":
      return rawValue.toFixed(1);
  }
}

export function InlineEditableCell({
  displayValue,
  rawValue,
  inputFormat,
  onCommit,
  isEditing,
  onStartEdit,
  onCancel,
  onTabNext,
  onTabPrev,
  testId,
  ariaLabel,
  className = "",
  isFlashing = false,
}: InlineEditableCellProps) {
  const [editText, setEditText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const committedRef = useRef(false);

  useEffect(() => {
    if (isEditing) {
      committedRef.current = false;
      setEditText(formatRawForInput(rawValue, inputFormat));
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [isEditing, rawValue, inputFormat]);

  const commitValue = useCallback(() => {
    if (committedRef.current) return;
    committedRef.current = true;
    onCommit(editText);
  }, [editText, onCommit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitValue();
      } else if (e.key === "Escape") {
        e.preventDefault();
        committedRef.current = true;
        onCancel();
      } else if (e.key === "Tab") {
        e.preventDefault();
        commitValue();
        if (e.shiftKey) {
          onTabPrev?.();
        } else {
          onTabNext?.();
        }
      }
    },
    [commitValue, onCancel, onTabNext, onTabPrev]
  );

  const flashClass = isFlashing
    ? "animate-flash-linked"
    : "";

  if (isEditing) {
    return (
      <td
        className={`py-0.5 px-1 text-right ${className}`}
        data-testid={testId}
        role="gridcell"
        aria-readonly="false"
      >
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={commitValue}
          onKeyDown={handleKeyDown}
          className="w-full text-right font-mono tabular-nums text-sm bg-transparent border-2 border-primary rounded px-2 py-1 outline-none"
          data-testid={`input-${testId}`}
          aria-label={ariaLabel}
        />
      </td>
    );
  }

  return (
    <td
      className={`py-1.5 px-3 text-right font-mono tabular-nums text-sm whitespace-nowrap cursor-pointer select-none ${className} ${flashClass}`}
      data-testid={testId}
      role="gridcell"
      aria-readonly="false"
      onClick={onStartEdit}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onStartEdit();
        }
      }}
      tabIndex={0}
    >
      {displayValue}
    </td>
  );
}
