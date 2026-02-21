import type { FormatType } from "@/lib/field-metadata";
import type { DrillLevel } from "./column-manager";

export interface InputFieldMapping {
  category: string;
  fieldName: string;
  inputFormat: FormatType;
  storedGranularity?: "monthly" | "annual";
}

export const INPUT_FIELD_MAP: Record<string, InputFieldMapping> = {
  "monthly-revenue": {
    category: "revenue",
    fieldName: "monthlyAuv",
    inputFormat: "currency",
    storedGranularity: "monthly",
  },
  "growth-rate": {
    category: "revenue",
    fieldName: "growthRates",
    inputFormat: "percentage",
  },
  "cogs-pct": {
    category: "operatingCosts",
    fieldName: "cogsPct",
    inputFormat: "percentage",
  },
  "royalty-pct": {
    category: "operatingCosts",
    fieldName: "royaltyPct",
    inputFormat: "percentage",
  },
  "ad-fund-pct": {
    category: "operatingCosts",
    fieldName: "adFundPct",
    inputFormat: "percentage",
  },
  "dl-pct": {
    category: "operatingCosts",
    fieldName: "laborPct",
    inputFormat: "percentage",
  },
  "facilities": {
    category: "operatingCosts",
    fieldName: "facilitiesAnnual",
    inputFormat: "currency",
    storedGranularity: "annual",
  },
  "mgmt-salaries": {
    category: "operatingCosts",
    fieldName: "managementSalariesAnnual",
    inputFormat: "currency",
    storedGranularity: "annual",
  },
  "payroll-tax-pct": {
    category: "operatingCosts",
    fieldName: "payrollTaxPct",
    inputFormat: "percentage",
  },
  "marketing": {
    category: "operatingCosts",
    fieldName: "marketingPct",
    inputFormat: "percentage",
  },
  "other-opex": {
    category: "operatingCosts",
    fieldName: "otherOpexPct",
    inputFormat: "percentage",
  },
  "target-pretax-profit-pct": {
    category: "profitabilityAndDistributions",
    fieldName: "targetPreTaxProfitPct",
    inputFormat: "percentage",
  },
  "distributions": {
    category: "profitabilityAndDistributions",
    fieldName: "distributions",
    inputFormat: "currency",
    storedGranularity: "annual",
  },
  "shareholder-salary-adj": {
    category: "profitabilityAndDistributions",
    fieldName: "shareholderSalaryAdj",
    inputFormat: "currency",
    storedGranularity: "annual",
  },
  "non-capex-investment": {
    category: "profitabilityAndDistributions",
    fieldName: "nonCapexInvestment",
    inputFormat: "currency",
    storedGranularity: "annual",
  },
};

export const EBITDA_MULTIPLE_KEY = "ebitda-multiple";

export function isEditableRow(rowKey: string): boolean {
  return rowKey in INPUT_FIELD_MAP || rowKey === EBITDA_MULTIPLE_KEY;
}

export function getDrillLevelFromColKey(colKey: string): DrillLevel {
  if (/^y\d+m\d+$/.test(colKey)) return "monthly";
  if (/^y\d+q\d+$/.test(colKey)) return "quarterly";
  return "annual";
}

export function scaleForStorage(
  parsedValue: number,
  drillLevel: DrillLevel,
  storedGranularity: "monthly" | "annual" | undefined,
  inputFormat: FormatType,
): { scaled: number; inputStr: string } | null {
  if (!storedGranularity) return null;

  let scaled = parsedValue;

  if (storedGranularity === "monthly") {
    if (drillLevel === "annual") scaled = Math.round(parsedValue / 12);
    else if (drillLevel === "quarterly") scaled = Math.round(parsedValue / 3);
  } else if (storedGranularity === "annual") {
    if (drillLevel === "quarterly") scaled = Math.round(parsedValue * 4);
    else if (drillLevel === "monthly") scaled = Math.round(parsedValue * 12);
  }

  if (scaled === parsedValue) return null;

  let inputStr: string;
  if (inputFormat === "currency") {
    inputStr = String(scaled / 100);
  } else if (inputFormat === "percentage") {
    inputStr = String(scaled * 100);
  } else {
    inputStr = String(scaled);
  }
  return { scaled, inputStr };
}
