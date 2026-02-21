import { describe, it, expect, vi } from "vitest";

vi.mock("../storage", () => ({
  storage: {},
}));

import { mergeExtractedParameters, getDefaultBrandParameters, validatePdfBuffer } from "./fdd-ingestion-service";
import { brandParameterSchema } from "@shared/schema";
import type { BrandParameters } from "@shared/schema";

function makeParam(value: number, label = "Test", description = "Test") {
  return { value, label, description };
}

function makeBrandParameters(): BrandParameters {
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
  };
}

describe("getDefaultBrandParameters", () => {
  it("returns a complete BrandParameters object with zero values", () => {
    const defaults = getDefaultBrandParameters();
    const result = brandParameterSchema.safeParse(defaults);
    expect(result.success).toBe(true);
  });

  it("has zero values for all fields", () => {
    const defaults = getDefaultBrandParameters();
    expect(defaults.revenue.monthly_auv.value).toBe(0);
    expect(defaults.operating_costs.royalty_pct.value).toBe(0);
    expect(defaults.financing.loan_amount.value).toBe(0);
    expect(defaults.startup_capital.depreciation_years.value).toBe(0);
  });
});

describe("mergeExtractedParameters", () => {
  it("merges extracted values into existing parameters", () => {
    const existing = makeBrandParameters();
    const extracted: Partial<BrandParameters> = {
      operating_costs: {
        royalty_pct: makeParam(0.08, "Royalty %", "8% royalty from FDD"),
      } as any,
    };

    const merged = mergeExtractedParameters(extracted, existing);

    expect(merged.operating_costs.royalty_pct.value).toBe(0.08);
    expect(merged.operating_costs.royalty_pct.description).toBe("8% royalty from FDD");
    // Non-extracted fields retain existing values
    expect(merged.operating_costs.cogs_pct.value).toBe(0.30);
    expect(merged.revenue.monthly_auv.value).toBe(15000);
  });

  it("merges into default parameters when existing is null", () => {
    const extracted: Partial<BrandParameters> = {
      operating_costs: {
        royalty_pct: makeParam(0.06, "Royalty %", "From FDD"),
        ad_fund_pct: makeParam(0.02, "Ad Fund %", "From FDD"),
      } as any,
    };

    const merged = mergeExtractedParameters(extracted, null);

    expect(merged.operating_costs.royalty_pct.value).toBe(0.06);
    expect(merged.operating_costs.ad_fund_pct.value).toBe(0.02);
    // Non-extracted fields use defaults (0)
    expect(merged.operating_costs.cogs_pct.value).toBe(0);
    expect(merged.revenue.monthly_auv.value).toBe(0);
  });

  it("produces valid BrandParameters after merge with existing", () => {
    const existing = makeBrandParameters();
    const extracted: Partial<BrandParameters> = {
      revenue: {
        monthly_auv: makeParam(20000, "Monthly AUV", "Extracted"),
      } as any,
      financing: {
        loan_amount: makeParam(200000, "Loan Amount", "From Item 7"),
      } as any,
    };

    const merged = mergeExtractedParameters(extracted, existing);
    const result = brandParameterSchema.safeParse(merged);
    expect(result.success).toBe(true);
  });

  it("produces valid BrandParameters after merge with null (defaults)", () => {
    const extracted: Partial<BrandParameters> = {
      operating_costs: {
        royalty_pct: makeParam(0.05, "Royalty", "5%"),
      } as any,
    };

    const merged = mergeExtractedParameters(extracted, null);
    const result = brandParameterSchema.safeParse(merged);
    expect(result.success).toBe(true);
  });

  it("handles empty extraction result", () => {
    const existing = makeBrandParameters();
    const merged = mergeExtractedParameters({}, existing);

    const result = brandParameterSchema.safeParse(merged);
    expect(result.success).toBe(true);
    // All values should remain as existing
    expect(merged.revenue.monthly_auv.value).toBe(15000);
  });

  it("does not mutate the existing parameters object", () => {
    const existing = makeBrandParameters();
    const originalRoyalty = existing.operating_costs.royalty_pct.value;

    const extracted: Partial<BrandParameters> = {
      operating_costs: {
        royalty_pct: makeParam(0.99, "Royalty", "Changed"),
      } as any,
    };

    mergeExtractedParameters(extracted, existing);

    expect(existing.operating_costs.royalty_pct.value).toBe(originalRoyalty);
  });

  it("ignores extracted fields that do not exist in the schema", () => {
    const existing = makeBrandParameters();
    const extracted = {
      operating_costs: {
        royalty_pct: makeParam(0.07, "Royalty", "From FDD"),
        nonexistent_field: makeParam(999, "Fake", "Should be ignored"),
      },
    } as Partial<BrandParameters>;

    const merged = mergeExtractedParameters(extracted, existing);
    expect(merged.operating_costs.royalty_pct.value).toBe(0.07);
    expect((merged.operating_costs as any).nonexistent_field).toBeUndefined();
  });
});

describe("validatePdfBuffer", () => {
  it("rejects empty buffer", () => {
    const result = validatePdfBuffer(Buffer.alloc(0));
    expect(result.valid).toBe(false);
    expect(result.error).toBe("File is empty");
  });

  it("rejects non-PDF buffer", () => {
    const result = validatePdfBuffer(Buffer.from("not a pdf file"));
    expect(result.valid).toBe(false);
    expect(result.error).toContain("not a valid PDF");
  });

  it("accepts valid PDF buffer", () => {
    const pdfBuffer = Buffer.from("%PDF-1.4 some content");
    const result = validatePdfBuffer(pdfBuffer);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("rejects buffer shorter than 4 bytes", () => {
    const result = validatePdfBuffer(Buffer.from("abc"));
    expect(result.valid).toBe(false);
  });
});
