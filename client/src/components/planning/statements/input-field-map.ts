import type { FormatType } from "@/lib/field-metadata";

export interface InputFieldMapping {
  category: string;
  fieldName: string;
  inputFormat: FormatType;
}

export const INPUT_FIELD_MAP: Record<string, InputFieldMapping> = {
  "monthly-revenue": {
    category: "revenue",
    fieldName: "monthlyAuv",
    inputFormat: "currency",
  },
  "cogs-pct": {
    category: "operatingCosts",
    fieldName: "cogsPct",
    inputFormat: "percentage",
  },
  "dl-pct": {
    category: "operatingCosts",
    fieldName: "laborPct",
    inputFormat: "percentage",
  },
  "marketing": {
    category: "operatingCosts",
    fieldName: "marketingPct",
    inputFormat: "percentage",
  },
  "other-opex": {
    category: "operatingCosts",
    fieldName: "otherMonthly",
    inputFormat: "currency",
  },
};

export const EBITDA_MULTIPLE_KEY = "ebitda-multiple";

export function isEditableRow(rowKey: string): boolean {
  return rowKey in INPUT_FIELD_MAP || rowKey === EBITDA_MULTIPLE_KEY;
}
