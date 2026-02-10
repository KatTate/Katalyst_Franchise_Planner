/** Format cents as a display currency string (e.g., 1500000 → "$15,000") */
export function formatCents(cents: number, showCents = false): string {
  const dollars = cents / 100;
  return dollars.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  });
}

/** Parse a user-entered dollar string to cents (integer). Returns NaN on invalid input. */
export function parseDollarsToCents(input: string): number {
  const cleaned = input.replace(/[$,\s]/g, "");
  const dollars = parseFloat(cleaned);
  if (isNaN(dollars) || dollars < 0) return NaN;
  return Math.round(dollars * 100);
}
