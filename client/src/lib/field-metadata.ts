import { formatCents, parseDollarsToCents } from "@/lib/format-currency";

export type FormatType = "currency" | "percentage" | "integer";

export interface FieldMeta {
  label: string;
  format: FormatType;
}

export const FIELD_METADATA: Record<string, Record<string, FieldMeta>> = {
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

export const CATEGORY_LABELS: Record<string, string> = {
  revenue: "Revenue",
  operatingCosts: "Operating Costs",
  financing: "Financing",
  startupCapital: "Startup Capital",
};

export const CATEGORY_ORDER = ["revenue", "operatingCosts", "financing", "startupCapital"];

export function formatFieldValue(value: number, format: FormatType, showDecimals = false): string {
  switch (format) {
    case "currency":
      return formatCents(value, showDecimals);
    case "percentage":
      return `${(value * 100).toFixed(1)}%`;
    case "integer":
      return String(value);
  }
}

export function parseFieldInput(input: string, format: FormatType): number {
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
      const cleaned = input.replace(/[^0-9.\-]/g, "").trim();
      const num = parseFloat(cleaned);
      if (isNaN(num) || num < 0) return NaN;
      return Math.round(num);
    }
  }
}

export function getInputPlaceholder(format: FormatType): string {
  switch (format) {
    case "currency":
      return "$0";
    case "percentage":
      return "0.0%";
    case "integer":
      return "0";
  }
}
