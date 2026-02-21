import type { PlanFinancialInputs, FinancialFieldValue } from "@shared/financial-engine";
import { FIELD_METADATA, CATEGORY_ORDER, CATEGORY_LABELS } from "@/lib/field-metadata";

export interface SectionProgress {
  category: string;
  label: string;
  edited: number;
  total: number;
}

function resolveCategoryData(financialInputs: PlanFinancialInputs, category: string): Record<string, unknown> | undefined {
  if (category === "facilitiesDecomposition") {
    return financialInputs.operatingCosts?.facilitiesDecomposition as unknown as Record<string, unknown> | undefined;
  }
  const data = financialInputs[category as keyof PlanFinancialInputs];
  return data as unknown as Record<string, unknown> | undefined;
}

function isEdited(field: unknown): boolean {
  if (!field) return false;
  if (Array.isArray(field)) {
    const first = field[0] as FinancialFieldValue | undefined;
    return first != null && first.source !== "brand_default";
  }
  const f = field as FinancialFieldValue;
  return f.source !== "brand_default";
}

export function computeSectionProgress(financialInputs: PlanFinancialInputs): SectionProgress[] {
  return CATEGORY_ORDER.map((category) => {
    const fields = FIELD_METADATA[category];
    const categoryData = resolveCategoryData(financialInputs, category);
    const fieldNames = Object.keys(fields);
    const total = fieldNames.length;
    const edited = fieldNames.filter((name) => {
      if (!categoryData) return false;
      return isEdited(categoryData[name]);
    }).length;
    return { category, label: CATEGORY_LABELS[category] || category, edited, total };
  });
}

export function computeCompleteness(financialInputs: PlanFinancialInputs, startupCostCount = 0): number {
  const sections = computeSectionProgress(financialInputs);
  const totalEdited = sections.reduce((sum, s) => sum + s.edited, 0) + startupCostCount;
  const totalFields = sections.reduce((sum, s) => sum + s.total, 0) + Math.max(startupCostCount, 0);
  if (totalFields === 0) return 0;
  return Math.round((totalEdited / totalFields) * 100);
}

export function hasAnyUserEdits(financialInputs: PlanFinancialInputs): boolean {
  return CATEGORY_ORDER.some((category) => {
    const fields = FIELD_METADATA[category];
    const categoryData = resolveCategoryData(financialInputs, category);
    if (!categoryData) return false;
    return Object.keys(fields).some((name) => isEdited(categoryData[name]));
  });
}

export function getGenerateButtonLabel(completeness: number): string {
  if (completeness < 50) return "Generate Draft";
  if (completeness <= 90) return "Generate Package";
  return "Generate Lender Package";
}
