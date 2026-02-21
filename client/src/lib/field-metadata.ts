import { formatCents, parseDollarsToCents } from "@/lib/format-currency";

export type FormatType = "currency" | "percentage" | "integer" | "decimal";

export interface FieldMeta {
  label: string;
  format: FormatType;
}

export const FIELD_METADATA: Record<string, Record<string, FieldMeta>> = {
  revenue: {
    monthlyAuv: { label: "Monthly AUV", format: "currency" },
    growthRates: { label: "Growth Rate", format: "percentage" },
    startingMonthAuvPct: { label: "Starting Month AUV %", format: "percentage" },
  },
  operatingCosts: {
    royaltyPct: { label: "Royalty %", format: "percentage" },
    adFundPct: { label: "Ad Fund %", format: "percentage" },
    cogsPct: { label: "COGS %", format: "percentage" },
    laborPct: { label: "Labor %", format: "percentage" },
    facilitiesAnnual: { label: "Facilities (Annual)", format: "currency" },
    marketingPct: { label: "Marketing %", format: "percentage" },
    managementSalariesAnnual: { label: "Management Salaries (Annual)", format: "currency" },
    payrollTaxPct: { label: "Payroll Tax %", format: "percentage" },
    otherOpexPct: { label: "Other OpEx %", format: "percentage" },
  },
  facilitiesDecomposition: {
    rent: { label: "Rent (Annual)", format: "currency" },
    utilities: { label: "Utilities (Annual)", format: "currency" },
    telecomIt: { label: "Telecom / IT (Annual)", format: "currency" },
    vehicleFleet: { label: "Vehicle / Fleet (Annual)", format: "currency" },
    insurance: { label: "Insurance (Annual)", format: "currency" },
  },
  profitabilityAndDistributions: {
    targetPreTaxProfitPct: { label: "Target Pre-Tax Profit %", format: "percentage" },
    shareholderSalaryAdj: { label: "Shareholder Salary Adj.", format: "currency" },
    distributions: { label: "Distributions", format: "currency" },
    nonCapexInvestment: { label: "Non-CapEx Investment", format: "currency" },
  },
  workingCapitalAndValuation: {
    arDays: { label: "A/R Days", format: "integer" },
    apDays: { label: "A/P Days", format: "integer" },
    inventoryDays: { label: "Inventory Days", format: "integer" },
    taxPaymentDelayMonths: { label: "Tax Payment Delay (Months)", format: "integer" },
    ebitdaMultiple: { label: "EBITDA Multiple", format: "decimal" },
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
  facilitiesDecomposition: "Facilities Breakdown",
  profitabilityAndDistributions: "Profitability & Distributions",
  workingCapitalAndValuation: "Working Capital & Valuation",
  financing: "Financing",
  startupCapital: "Startup Capital",
};

export const CATEGORY_ORDER = [
  "revenue",
  "operatingCosts",
  "facilitiesDecomposition",
  "profitabilityAndDistributions",
  "workingCapitalAndValuation",
  "financing",
  "startupCapital",
];

export function formatFieldValue(value: number, format: FormatType, showDecimals = false): string {
  switch (format) {
    case "currency":
      return formatCents(value, showDecimals);
    case "percentage":
      return `${(value * 100).toFixed(1)}%`;
    case "integer":
      return String(value);
    case "decimal":
      return value.toFixed(2);
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
    case "decimal": {
      const cleaned = input.replace(/[^0-9.\-]/g, "").trim();
      const num = parseFloat(cleaned);
      if (isNaN(num)) return NaN;
      return num;
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
    case "decimal":
      return "0.00";
  }
}
