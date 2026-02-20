/** Format cents as a display currency string with accounting-style negatives (e.g., -1500000 → "($15,000)") */
export function formatCents(cents: number, showCents = false): string {
  const isNegative = cents < 0;
  const absDollars = Math.abs(cents) / 100;
  const formatted = absDollars.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  });
  return isNegative ? `(${formatted})` : formatted;
}

/** Parse a user-entered dollar string to cents (integer). Returns NaN on invalid input. Handles accounting-style parentheses for negatives. */
export function parseDollarsToCents(input: string): number {
  const trimmed = input.trim();
  const isAccountingNeg = trimmed.startsWith("(") && trimmed.endsWith(")");
  const stripped = isAccountingNeg ? trimmed.slice(1, -1) : trimmed;
  const cleaned = stripped.replace(/[$,\s]/g, "");
  const dollars = parseFloat(cleaned);
  if (isNaN(dollars) || dollars < 0) return NaN;
  return Math.round(dollars * 100);
}
