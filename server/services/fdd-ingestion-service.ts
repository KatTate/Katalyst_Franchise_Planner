import type { BrandParameters, StartupCostTemplate, FddExtractionResult } from "@shared/schema";

export interface FddExtractor {
  extract(pdfBuffer: Buffer, brandName: string): Promise<FddExtractionResult>;
}

export function getDefaultBrandParameters(): BrandParameters {
  return {
    revenue: {
      monthly_auv: { value: 0, label: "Monthly AUV", description: "Average unit volume per month" },
      year1_growth_rate: { value: 0, label: "Year 1 Growth Rate", description: "Annual revenue growth rate for year 1" },
      year2_growth_rate: { value: 0, label: "Year 2 Growth Rate", description: "Annual revenue growth rate for year 2+" },
      starting_month_auv_pct: { value: 0, label: "Starting Month AUV %", description: "Percentage of full AUV in the opening month" },
    },
    operating_costs: {
      cogs_pct: { value: 0, label: "COGS %", description: "Cost of goods sold as percentage of revenue" },
      labor_pct: { value: 0, label: "Labor %", description: "Labor cost as percentage of revenue" },
      rent_monthly: { value: 0, label: "Monthly Rent", description: "Monthly rent payment" },
      utilities_monthly: { value: 0, label: "Monthly Utilities", description: "Monthly utilities cost" },
      insurance_monthly: { value: 0, label: "Monthly Insurance", description: "Monthly insurance cost" },
      marketing_pct: { value: 0, label: "Marketing %", description: "Local marketing as percentage of revenue" },
      royalty_pct: { value: 0, label: "Royalty %", description: "Franchise royalty as percentage of revenue" },
      ad_fund_pct: { value: 0, label: "Ad Fund %", description: "National ad fund as percentage of revenue" },
      other_monthly: { value: 0, label: "Other Monthly", description: "Other recurring monthly expenses" },
    },
    financing: {
      loan_amount: { value: 0, label: "Loan Amount", description: "Default loan amount" },
      interest_rate: { value: 0, label: "Interest Rate", description: "Annual interest rate" },
      loan_term_months: { value: 0, label: "Loan Term (months)", description: "Loan term in months" },
      down_payment_pct: { value: 0, label: "Down Payment %", description: "Down payment as percentage of total investment" },
    },
    startup_capital: {
      working_capital_months: { value: 0, label: "Working Capital (months)", description: "Number of months of working capital reserve" },
      depreciation_years: { value: 0, label: "Depreciation (years)", description: "CapEx depreciation period in years" },
    },
  };
}

export function mergeExtractedParameters(
  extracted: Partial<BrandParameters>,
  existing: BrandParameters | null
): BrandParameters {
  const base = existing ?? getDefaultBrandParameters();

  const merged = JSON.parse(JSON.stringify(base)) as BrandParameters;

  for (const category of Object.keys(extracted) as Array<keyof BrandParameters>) {
    const extractedCategory = extracted[category];
    if (!extractedCategory) continue;
    for (const field of Object.keys(extractedCategory)) {
      const extractedField = (extractedCategory as any)[field];
      if (extractedField && typeof extractedField === "object" && "value" in extractedField) {
        if ((merged[category] as any)[field]) {
          (merged[category] as any)[field].value = extractedField.value;
          if (extractedField.label) (merged[category] as any)[field].label = extractedField.label;
          if (extractedField.description) (merged[category] as any)[field].description = extractedField.description;
        }
      }
    }
  }

  return merged;
}
