import { useMemo } from "react";
import { formatCents } from "@/lib/format-currency";

export type FinancialFormat = "currency" | "pct" | "ratio" | "multiplier" | "number" | "months";

interface FinancialValueProps {
  value: number | null | undefined;
  format: FinancialFormat;
  showCents?: boolean;
  nullDisplay?: string;
  className?: string;
  "data-testid"?: string;
}

export function formatFinancialValue(
  value: number | null | undefined,
  format: FinancialFormat,
  showCents = false,
  nullDisplay = "—"
): string {
  if (value === null || value === undefined) return nullDisplay;

  const isNegative = value < 0;
  const absValue = Math.abs(value);

  let formatted: string;

  switch (format) {
    case "currency": {
      const inner = formatCents(absValue, showCents);
      formatted = isNegative ? `(${inner})` : inner;
      break;
    }
    case "pct": {
      const pctStr = `${(absValue * 100).toFixed(1)}%`;
      formatted = isNegative ? `(${pctStr})` : pctStr;
      break;
    }
    case "ratio": {
      const ratioStr = `${absValue.toFixed(2)}x`;
      formatted = isNegative ? `(${ratioStr})` : ratioStr;
      break;
    }
    case "multiplier": {
      const multStr = `${absValue.toFixed(1)}x`;
      formatted = isNegative ? `(${multStr})` : multStr;
      break;
    }
    case "number": {
      const numStr = absValue.toLocaleString("en-US", { maximumFractionDigits: 0 });
      formatted = isNegative ? `(${numStr})` : numStr;
      break;
    }
    case "months": {
      const moStr = `${absValue.toFixed(1)} mo`;
      formatted = isNegative ? `(${moStr})` : moStr;
      break;
    }
    default:
      formatted = String(value);
  }

  return formatted;
}

export function formatFinancialDelta(
  delta: number,
  format: FinancialFormat,
  showCents = false
): string {
  const isNegative = delta < 0;
  const absValue = Math.abs(delta);
  const sign = isNegative ? "-" : "+";

  switch (format) {
    case "currency":
      return `${sign}${formatCents(absValue, showCents)}`;
    case "pct":
      return `${sign}${(absValue * 100).toFixed(1)}%`;
    case "ratio":
      return `${sign}${absValue.toFixed(2)}x`;
    case "multiplier":
      return `${sign}${absValue.toFixed(1)}x`;
    case "number":
      return `${sign}${absValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    case "months":
      return `${sign}${absValue.toFixed(1)} mo`;
    default:
      return `${sign}${absValue}`;
  }
}

export function FinancialValue({
  value,
  format,
  showCents = false,
  nullDisplay = "—",
  className = "",
  "data-testid": testId,
}: FinancialValueProps) {
  const isNegative = value !== null && value !== undefined && value < 0;

  const display = useMemo(
    () => formatFinancialValue(value, format, showCents, nullDisplay),
    [value, format, showCents, nullDisplay]
  );

  return (
    <span
      className={`font-mono tabular-nums ${isNegative ? "text-destructive" : ""} ${className}`.trim()}
      data-testid={testId}
    >
      {display}
    </span>
  );
}
