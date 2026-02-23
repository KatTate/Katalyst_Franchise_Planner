import { describe, it, expect } from "vitest";
import {
  brandParameterSchema,
  startupCostItemSchema,
  startupCostTemplateSchema,
  planStartupCostLineItemSchema,
  planStartupCostsSchema,
  brandThemeSchema,
  financialFieldValueSchema,
  planFinancialInputsSchema,
} from "./schema";

function makeParam(value: number, label = "Test", description = "Test param") {
  return { value, label, description };
}

function makeBrandParameters(overrides: Record<string, any> = {}) {
  return {
    revenue: {
      monthly_auv: makeParam(15000),
      year1_growth_rate: makeParam(0.05),
      year2_growth_rate: makeParam(0.03),
      starting_month_auv_pct: makeParam(0.08),
    },
    operating_costs: {
      cogs_pct: makeParam(0.30),
      labor_pct: makeParam(0.25),
      rent_monthly: makeParam(3000),
      utilities_monthly: makeParam(500),
      insurance_monthly: makeParam(200),
      marketing_pct: makeParam(0.05),
      royalty_pct: makeParam(0.065),
      ad_fund_pct: makeParam(0.02),
      other_monthly: makeParam(300),
    },
    financing: {
      loan_amount: makeParam(150000),
      interest_rate: makeParam(0.105),
      loan_term_months: makeParam(84),
      down_payment_pct: makeParam(0.20),
    },
    startup_capital: {
      working_capital_months: makeParam(3),
      depreciation_years: makeParam(4),
    },
    ...overrides,
  };
}

describe("brandParameterSchema", () => {
  it("accepts valid brand parameters", () => {
    const result = brandParameterSchema.safeParse(makeBrandParameters());
    expect(result.success).toBe(true);
  });

  it("rejects negative percentage", () => {
    const params = makeBrandParameters();
    params.revenue.monthly_auv.value = -100;
    const result = brandParameterSchema.safeParse(params);
    expect(result.success).toBe(false);
  });

  it("rejects percentage over 100%", () => {
    const params = makeBrandParameters();
    params.revenue.year1_growth_rate.value = 1.5;
    const result = brandParameterSchema.safeParse(params);
    expect(result.success).toBe(false);
  });

  it("accepts boundary percentage values", () => {
    const params = makeBrandParameters();
    params.revenue.year1_growth_rate.value = 0;
    params.revenue.year2_growth_rate.value = 1;
    const result = brandParameterSchema.safeParse(params);
    expect(result.success).toBe(true);
  });

  it("rejects non-integer loan term months", () => {
    const params = makeBrandParameters();
    params.financing.loan_term_months.value = 84.5;
    const result = brandParameterSchema.safeParse(params);
    expect(result.success).toBe(false);
  });

  it("rejects missing required sections", () => {
    const result = brandParameterSchema.safeParse({
      revenue: {
        monthly_auv: makeParam(15000),
      },
    });
    expect(result.success).toBe(false);
  });
});

describe("startupCostItemSchema", () => {
  it("accepts valid startup cost item", () => {
    const item = {
      id: "item-1",
      name: "Franchise Fee",
      default_amount: 25000,
      capex_classification: "capex" as const,
      item7_range_low: 20000,
      item7_range_high: 30000,
      sort_order: 1,
    };
    const result = startupCostItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("accepts null item7 range values", () => {
    const item = {
      id: "item-2",
      name: "Working Capital",
      default_amount: 5000,
      capex_classification: "working_capital" as const,
      item7_range_low: null,
      item7_range_high: null,
      sort_order: 2,
    };
    const result = startupCostItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const item = {
      id: "item-3",
      name: "",
      default_amount: 1000,
      capex_classification: "non_capex" as const,
      item7_range_low: null,
      item7_range_high: null,
      sort_order: 0,
    };
    const result = startupCostItemSchema.safeParse(item);
    expect(result.success).toBe(false);
  });

  it("rejects invalid capex_classification", () => {
    const item = {
      id: "item-4",
      name: "Test",
      default_amount: 100,
      capex_classification: "invalid",
      item7_range_low: null,
      item7_range_high: null,
      sort_order: 0,
    };
    const result = startupCostItemSchema.safeParse(item);
    expect(result.success).toBe(false);
  });

  it("rejects negative default_amount", () => {
    const item = {
      id: "item-5",
      name: "Test",
      default_amount: -500,
      capex_classification: "capex" as const,
      item7_range_low: null,
      item7_range_high: null,
      sort_order: 0,
    };
    const result = startupCostItemSchema.safeParse(item);
    expect(result.success).toBe(false);
  });
});

describe("startupCostTemplateSchema", () => {
  it("accepts valid array of startup cost items", () => {
    const template = [
      {
        id: "1",
        name: "Franchise Fee",
        default_amount: 25000,
        capex_classification: "capex" as const,
        item7_range_low: 20000,
        item7_range_high: 30000,
        sort_order: 1,
      },
      {
        id: "2",
        name: "Working Capital",
        default_amount: 5000,
        capex_classification: "working_capital" as const,
        item7_range_low: null,
        item7_range_high: null,
        sort_order: 2,
      },
    ];
    const result = startupCostTemplateSchema.safeParse(template);
    expect(result.success).toBe(true);
  });

  it("accepts empty array", () => {
    const result = startupCostTemplateSchema.safeParse([]);
    expect(result.success).toBe(true);
  });
});

describe("planStartupCostLineItemSchema", () => {
  it("accepts valid template-sourced line item", () => {
    const item = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Franchise Fee",
      amount: 2500000,
      capexClassification: "capex" as const,
      isCustom: false,
      source: "brand_default",
      brandDefaultAmount: 2500000,
      item7RangeLow: 2000000,
      item7RangeHigh: 3000000,
      sortOrder: 1,
    };
    const result = planStartupCostLineItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("accepts valid custom line item", () => {
    const item = {
      id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Custom Item",
      amount: 500000,
      capexClassification: "non_capex" as const,
      isCustom: true,
      source: "user_entry",
      brandDefaultAmount: null,
      item7RangeLow: null,
      item7RangeHigh: null,
      sortOrder: 10,
    };
    const result = planStartupCostLineItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("rejects custom item with non-null brandDefaultAmount", () => {
    const item = {
      id: "550e8400-e29b-41d4-a716-446655440002",
      name: "Custom Item",
      amount: 500000,
      capexClassification: "non_capex" as const,
      isCustom: true,
      source: "user_entry",
      brandDefaultAmount: 100000,
      item7RangeLow: null,
      item7RangeHigh: null,
      sortOrder: 10,
    };
    const result = planStartupCostLineItemSchema.safeParse(item);
    expect(result.success).toBe(false);
  });

  it("rejects template item with null brandDefaultAmount", () => {
    const item = {
      id: "550e8400-e29b-41d4-a716-446655440003",
      name: "Template Item",
      amount: 500000,
      capexClassification: "capex" as const,
      isCustom: false,
      source: "brand_default",
      brandDefaultAmount: null,
      item7RangeLow: null,
      item7RangeHigh: null,
      sortOrder: 1,
    };
    const result = planStartupCostLineItemSchema.safeParse(item);
    expect(result.success).toBe(false);
  });

  it("rejects item7RangeLow > item7RangeHigh", () => {
    const item = {
      id: "550e8400-e29b-41d4-a716-446655440004",
      name: "Test",
      amount: 100000,
      capexClassification: "capex" as const,
      isCustom: false,
      source: "brand_default",
      brandDefaultAmount: 100000,
      item7RangeLow: 200000,
      item7RangeHigh: 100000,
      sortOrder: 1,
    };
    const result = planStartupCostLineItemSchema.safeParse(item);
    expect(result.success).toBe(false);
  });

  it("accepts admin source", () => {
    const item = {
      id: "550e8400-e29b-41d4-a716-446655440005",
      name: "Admin Set",
      amount: 100000,
      capexClassification: "capex" as const,
      isCustom: false,
      source: "admin:John Doe",
      brandDefaultAmount: 90000,
      item7RangeLow: null,
      item7RangeHigh: null,
      sortOrder: 1,
    };
    const result = planStartupCostLineItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("rejects invalid source string", () => {
    const item = {
      id: "550e8400-e29b-41d4-a716-446655440006",
      name: "Bad Source",
      amount: 100000,
      capexClassification: "capex" as const,
      isCustom: false,
      source: "invalid_source",
      brandDefaultAmount: 100000,
      item7RangeLow: null,
      item7RangeHigh: null,
      sortOrder: 1,
    };
    const result = planStartupCostLineItemSchema.safeParse(item);
    expect(result.success).toBe(false);
  });
});

describe("brandThemeSchema", () => {
  it("accepts valid theme", () => {
    const theme = {
      logo_url: "https://example.com/logo.png",
      primary_color: "#FF5733",
      display_name: "Test Brand",
    };
    const result = brandThemeSchema.safeParse(theme);
    expect(result.success).toBe(true);
  });

  it("accepts all nulls", () => {
    const theme = {
      logo_url: null,
      primary_color: null,
      display_name: null,
    };
    const result = brandThemeSchema.safeParse(theme);
    expect(result.success).toBe(true);
  });
});

describe("financialFieldValueSchema", () => {
  it("accepts valid brand_default field", () => {
    const field = {
      currentValue: 15000,
      source: "brand_default",
      brandDefault: 15000,
      item7Range: null,
      lastModifiedAt: null,
      isCustom: false,
    };
    const result = financialFieldValueSchema.safeParse(field);
    expect(result.success).toBe(true);
  });

  it("accepts user_entry source", () => {
    const field = {
      currentValue: 20000,
      source: "user_entry",
      brandDefault: 15000,
      item7Range: { min: 10000, max: 25000 },
      lastModifiedAt: "2025-01-15T10:00:00Z",
      isCustom: true,
    };
    const result = financialFieldValueSchema.safeParse(field);
    expect(result.success).toBe(true);
  });

  it("accepts ai_populated source", () => {
    const field = {
      currentValue: 18000,
      source: "ai_populated",
      brandDefault: 15000,
      item7Range: null,
      lastModifiedAt: "2025-01-15T10:00:00Z",
      isCustom: false,
    };
    const result = financialFieldValueSchema.safeParse(field);
    expect(result.success).toBe(true);
  });

  it("accepts admin: prefixed source", () => {
    const field = {
      currentValue: 16000,
      source: "admin:Jane Smith",
      brandDefault: 15000,
      item7Range: null,
      lastModifiedAt: "2025-01-15T10:00:00Z",
      isCustom: false,
    };
    const result = financialFieldValueSchema.safeParse(field);
    expect(result.success).toBe(true);
  });

  it("rejects invalid source", () => {
    const field = {
      currentValue: 15000,
      source: "unknown_source",
      brandDefault: null,
      item7Range: null,
      lastModifiedAt: null,
      isCustom: false,
    };
    const result = financialFieldValueSchema.safeParse(field);
    expect(result.success).toBe(false);
  });
});

describe("planFinancialInputsSchema", () => {
  function makeFieldValue(value: number) {
    return {
      currentValue: value,
      source: "brand_default",
      brandDefault: value,
      item7Range: null,
      lastModifiedAt: null,
      isCustom: false,
    };
  }

  function makeFieldArray5(value: number) {
    return Array.from({ length: 5 }, () => makeFieldValue(value));
  }

  it("accepts valid plan financial inputs", () => {
    const inputs = {
      revenue: {
        monthlyAuv: makeFieldValue(1500000),
        growthRates: [makeFieldValue(0.05), makeFieldValue(0.03), makeFieldValue(0.03), makeFieldValue(0.03), makeFieldValue(0.03)],
        startingMonthAuvPct: makeFieldValue(0.08),
      },
      operatingCosts: {
        cogsPct: makeFieldArray5(0.30),
        laborPct: makeFieldArray5(0.25),
        facilitiesAnnual: makeFieldArray5(4440000),
        facilitiesDecomposition: {
          rent: makeFieldArray5(3600000),
          utilities: makeFieldArray5(600000),
          telecomIt: makeFieldArray5(0),
          vehicleFleet: makeFieldArray5(0),
          insurance: makeFieldArray5(240000),
        },
        marketingPct: makeFieldArray5(0.05),
        royaltyPct: makeFieldArray5(0.065),
        adFundPct: makeFieldArray5(0.02),
        managementSalariesAnnual: makeFieldArray5(0),
        payrollTaxPct: makeFieldArray5(0.20),
        otherOpexPct: makeFieldArray5(0.03),
      },
      profitabilityAndDistributions: {
        targetPreTaxProfitPct: makeFieldArray5(0),
        shareholderSalaryAdj: makeFieldArray5(0),
        distributions: makeFieldArray5(0),
        nonCapexInvestment: makeFieldArray5(0),
      },
      workingCapitalAndValuation: {
        arDays: makeFieldValue(30),
        apDays: makeFieldValue(60),
        inventoryDays: makeFieldValue(60),
        taxPaymentDelayMonths: makeFieldValue(0),
        ebitdaMultiple: makeFieldValue(0),
      },
      financing: {
        loanAmount: makeFieldValue(15000000),
        interestRate: makeFieldValue(0.105),
        loanTermMonths: makeFieldValue(84),
        downPaymentPct: makeFieldValue(0.20),
      },
      startupCapital: {
        workingCapitalMonths: makeFieldValue(3),
        depreciationYears: makeFieldValue(4),
      },
    };
    const result = planFinancialInputsSchema.safeParse(inputs);
    expect(result.success).toBe(true);
  });

  it("rejects missing revenue section", () => {
    const result = planFinancialInputsSchema.safeParse({
      operatingCosts: {},
      financing: {},
      startupCapital: {},
    });
    expect(result.success).toBe(false);
  });
});
