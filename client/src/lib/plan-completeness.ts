import type { PlanFinancialInputs, FinancialFieldValue } from "@shared/financial-engine";
import { FIELD_METADATA, CATEGORY_ORDER } from "@/lib/field-metadata";

export interface SectionProgress {
  category: string;
  label: string;
  edited: number;
  total: number;
}

export function computeSectionProgress(financialInputs: PlanFinancialInputs): SectionProgress[] {
  const CATEGORY_LABELS: Record<string, string> = {
    revenue: "Revenue",
    operatingCosts: "Operating Costs",
    financing: "Financing",
    startupCapital: "Startup Capital",
  };

  return CATEGORY_ORDER.map((category) => {
    const fields = FIELD_METADATA[category];
    const categoryData = financialInputs[category as keyof PlanFinancialInputs];
    const fieldNames = Object.keys(fields);
    const total = fieldNames.length;
    const edited = fieldNames.filter((name) => {
      const field = categoryData[name as keyof typeof categoryData] as FinancialFieldValue | undefined;
      return field && field.source !== "brand_default";
    }).length;
    return { category, label: CATEGORY_LABELS[category], edited, total };
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
    const categoryData = financialInputs[category as keyof PlanFinancialInputs];
    return Object.keys(fields).some((name) => {
      const field = categoryData[name as keyof typeof categoryData] as FinancialFieldValue | undefined;
      return field && field.source !== "brand_default";
    });
  });
}

export function getGenerateButtonLabel(completeness: number): string {
  if (completeness < 50) return "Generate Draft";
  if (completeness <= 90) return "Generate Package";
  return "Generate Lender Package";
}
