import { describe, it, expect } from "vitest";
import { INPUT_FIELD_MAP } from "@/components/planning/statements/input-field-map";
import { FIELD_METADATA } from "@/lib/field-metadata";

describe("INPUT_FIELD_MAP mechanical validation", () => {
  it("every INPUT_FIELD_MAP entry has a matching FIELD_METADATA entry with the same format type", () => {
    const mismatches: string[] = [];
    const missing: string[] = [];

    for (const [rowKey, mapping] of Object.entries(INPUT_FIELD_MAP)) {
      const categoryMeta = FIELD_METADATA[mapping.category];
      if (!categoryMeta) {
        missing.push(
          `${rowKey}: category "${mapping.category}" not found in FIELD_METADATA`
        );
        continue;
      }

      const fieldMeta = categoryMeta[mapping.fieldName];
      if (!fieldMeta) {
        missing.push(
          `${rowKey}: field "${mapping.fieldName}" not found in FIELD_METADATA["${mapping.category}"]`
        );
        continue;
      }

      if (fieldMeta.format !== mapping.inputFormat) {
        mismatches.push(
          `${rowKey}: INPUT_FIELD_MAP says "${mapping.inputFormat}" but FIELD_METADATA says "${fieldMeta.format}" for ${mapping.category}.${mapping.fieldName}`
        );
      }
    }

    if (missing.length > 0) {
      expect.fail(
        `INPUT_FIELD_MAP references fields not in FIELD_METADATA:\n${missing.join("\n")}`
      );
    }

    if (mismatches.length > 0) {
      expect.fail(
        `Format type mismatches between INPUT_FIELD_MAP and FIELD_METADATA:\n${mismatches.join("\n")}`
      );
    }
  });

  it("every INPUT_FIELD_MAP entry has a valid FormatType", () => {
    const validFormats = ["currency", "percentage", "integer", "decimal"];

    for (const [rowKey, mapping] of Object.entries(INPUT_FIELD_MAP)) {
      expect(
        validFormats.includes(mapping.inputFormat),
        `${rowKey}: invalid inputFormat "${mapping.inputFormat}"`
      ).toBe(true);
    }
  });

  it("no duplicate fieldName mappings exist", () => {
    const seen = new Map<string, string>();
    const duplicates: string[] = [];

    for (const [rowKey, mapping] of Object.entries(INPUT_FIELD_MAP)) {
      const key = `${mapping.category}.${mapping.fieldName}`;
      if (seen.has(key)) {
        duplicates.push(
          `${rowKey} and ${seen.get(key)} both map to ${key}`
        );
      }
      seen.set(key, rowKey);
    }

    if (duplicates.length > 0) {
      expect.fail(
        `Duplicate field mappings found:\n${duplicates.join("\n")}`
      );
    }
  });

  const ENGINE_FIELD_SEMANTICS: Record<
    string,
    { fieldName: string; enginePath: string; semanticType: "cents" | "decimal_pct" | "integer" | "decimal_number" }
  > = {
    "revenue.monthlyAuv": { fieldName: "monthlyAuv", enginePath: "revenue.monthlyAuvByMonth", semanticType: "cents" },
    "revenue.growthRates": { fieldName: "growthRates", enginePath: "revenue.growthRates", semanticType: "decimal_pct" },
    "operatingCosts.cogsPct": { fieldName: "cogsPct", enginePath: "operatingCosts.cogsPct", semanticType: "decimal_pct" },
    "operatingCosts.royaltyPct": { fieldName: "royaltyPct", enginePath: "operatingCosts.royaltyPct", semanticType: "decimal_pct" },
    "operatingCosts.adFundPct": { fieldName: "adFundPct", enginePath: "operatingCosts.adFundPct", semanticType: "decimal_pct" },
    "operatingCosts.laborPct": { fieldName: "laborPct", enginePath: "operatingCosts.laborPct", semanticType: "decimal_pct" },
    "operatingCosts.facilitiesAnnual": { fieldName: "facilitiesAnnual", enginePath: "operatingCosts.facilitiesAnnual", semanticType: "cents" },
    "operatingCosts.managementSalariesAnnual": { fieldName: "managementSalariesAnnual", enginePath: "operatingCosts.managementSalariesAnnual", semanticType: "cents" },
    "operatingCosts.payrollTaxPct": { fieldName: "payrollTaxPct", enginePath: "operatingCosts.payrollTaxPct", semanticType: "decimal_pct" },
    "operatingCosts.marketingPct": { fieldName: "marketingPct", enginePath: "operatingCosts.marketingPct", semanticType: "decimal_pct" },
    "operatingCosts.otherOpexPct": { fieldName: "otherOpexPct", enginePath: "operatingCosts.otherOpexPct", semanticType: "decimal_pct" },
    "profitabilityAndDistributions.targetPreTaxProfitPct": { fieldName: "targetPreTaxProfitPct", enginePath: "targetPreTaxProfitPct", semanticType: "decimal_pct" },
    "profitabilityAndDistributions.distributions": { fieldName: "distributions", enginePath: "distributions", semanticType: "cents" },
    "profitabilityAndDistributions.shareholderSalaryAdj": { fieldName: "shareholderSalaryAdj", enginePath: "shareholderSalaryAdj", semanticType: "cents" },
    "profitabilityAndDistributions.nonCapexInvestment": { fieldName: "nonCapexInvestment", enginePath: "nonCapexInvestment", semanticType: "cents" },
    "workingCapitalAndValuation.arDays": { fieldName: "arDays", enginePath: "workingCapitalAssumptions.arDays", semanticType: "integer" },
    "workingCapitalAndValuation.apDays": { fieldName: "apDays", enginePath: "workingCapitalAssumptions.apDays", semanticType: "integer" },
    "workingCapitalAndValuation.inventoryDays": { fieldName: "inventoryDays", enginePath: "workingCapitalAssumptions.inventoryDays", semanticType: "integer" },
    "workingCapitalAndValuation.taxPaymentDelayMonths": { fieldName: "taxPaymentDelayMonths", enginePath: "taxPaymentDelayMonths", semanticType: "integer" },
    "workingCapitalAndValuation.ebitdaMultiple": { fieldName: "ebitdaMultiple", enginePath: "ebitdaMultiple", semanticType: "decimal_number" },
  };

  type SemanticType = "cents" | "decimal_pct" | "integer" | "decimal_number";
  type FormatType = "currency" | "percentage" | "integer" | "decimal";

  const SEMANTIC_TO_FORMAT: Record<SemanticType, FormatType> = {
    cents: "currency",
    decimal_pct: "percentage",
    integer: "integer",
    decimal_number: "decimal",
  };

  it("every INPUT_FIELD_MAP entry's format type is semantically correct for the engine's FinancialInputs type", () => {
    const mismatches: string[] = [];

    for (const [rowKey, mapping] of Object.entries(INPUT_FIELD_MAP)) {
      const compoundKey = `${mapping.category}.${mapping.fieldName}`;
      const semantics = ENGINE_FIELD_SEMANTICS[compoundKey];

      if (!semantics) {
        mismatches.push(
          `${rowKey} (${compoundKey}): missing from ENGINE_FIELD_SEMANTICS map — add an entry for this field`
        );
        continue;
      }

      const expectedFormat = SEMANTIC_TO_FORMAT[semantics.semanticType];
      if (mapping.inputFormat !== expectedFormat) {
        mismatches.push(
          `${rowKey} (${compoundKey}): INPUT_FIELD_MAP format is "${mapping.inputFormat}" but engine semantic type "${semantics.semanticType}" requires "${expectedFormat}" (engine path: ${semantics.enginePath})`
        );
      }
    }

    const inputFieldMapCompoundKeys = new Set(
      Object.values(INPUT_FIELD_MAP).map((m) => `${m.category}.${m.fieldName}`)
    );
    for (const semanticsKey of Object.keys(ENGINE_FIELD_SEMANTICS)) {
      if (!inputFieldMapCompoundKeys.has(semanticsKey)) {
        mismatches.push(
          `${semanticsKey}: present in ENGINE_FIELD_SEMANTICS but not in INPUT_FIELD_MAP — remove stale entry or add the field to INPUT_FIELD_MAP`
        );
      }
    }

    const semanticsEntry = ENGINE_FIELD_SEMANTICS[Object.keys(ENGINE_FIELD_SEMANTICS)[0]];
    if (semanticsEntry) {
      for (const [compoundKey, entry] of Object.entries(ENGINE_FIELD_SEMANTICS)) {
        const expectedFieldName = compoundKey.split(".")[1];
        if (entry.fieldName !== expectedFieldName) {
          mismatches.push(
            `${compoundKey}: ENGINE_FIELD_SEMANTICS fieldName is "${entry.fieldName}" but compound key implies "${expectedFieldName}"`
          );
        }
      }
    }

    if (mismatches.length > 0) {
      expect.fail(
        `Engine type cross-reference mismatches:\n${mismatches.join("\n")}`
      );
    }
  });

  it("INPUT_FIELD_MAP completeness — every FIELD_METADATA field that is user-editable has an INPUT_FIELD_MAP entry or is explicitly excluded", () => {
    const EXCLUDED_FIELDS = new Set([
      "revenue.startingMonthAuvPct",            // Edited in Forms mode only, not in Reports inline editing
      "facilitiesDecomposition.rent",            // Edited via Forms guided decomposition, not Reports
      "facilitiesDecomposition.utilities",       // Edited via Forms guided decomposition, not Reports
      "facilitiesDecomposition.telecomIt",       // Edited via Forms guided decomposition, not Reports
      "facilitiesDecomposition.vehicleFleet",    // Edited via Forms guided decomposition, not Reports
      "facilitiesDecomposition.insurance",       // Edited via Forms guided decomposition, not Reports
      "financing.loanAmount",                    // Edited in Forms mode only
      "financing.interestRate",                  // Edited in Forms mode only
      "financing.loanTermMonths",                // Edited in Forms mode only
      "financing.downPaymentPct",                // Edited in Forms mode only
      "startupCapital.workingCapitalMonths",     // Edited in Forms mode only
      "startupCapital.depreciationYears",        // Edited in Forms mode only
    ]);

    const inputFieldMapKeys = new Set<string>();
    for (const mapping of Object.values(INPUT_FIELD_MAP)) {
      inputFieldMapKeys.add(`${mapping.category}.${mapping.fieldName}`);
    }

    const coveredCategories = new Set<string>();
    for (const mapping of Object.values(INPUT_FIELD_MAP)) {
      coveredCategories.add(mapping.category);
    }

    const uncovered: string[] = [];

    for (const [category, fields] of Object.entries(FIELD_METADATA)) {
      if (!coveredCategories.has(category)) {
        for (const fieldName of Object.keys(fields)) {
          const compoundKey = `${category}.${fieldName}`;
          if (!EXCLUDED_FIELDS.has(compoundKey)) {
            uncovered.push(
              `${compoundKey}: category "${category}" has no INPUT_FIELD_MAP entries — add this field to INPUT_FIELD_MAP or EXCLUDED_FIELDS`
            );
          }
        }
        continue;
      }

      for (const fieldName of Object.keys(fields)) {
        const compoundKey = `${category}.${fieldName}`;
        if (!inputFieldMapKeys.has(compoundKey) && !EXCLUDED_FIELDS.has(compoundKey)) {
          uncovered.push(
            `${compoundKey}: present in FIELD_METADATA but missing from both INPUT_FIELD_MAP and EXCLUDED_FIELDS — add it to one or the other`
          );
        }
      }
    }

    if (uncovered.length > 0) {
      expect.fail(
        `INPUT_FIELD_MAP completeness gaps:\n${uncovered.join("\n")}`
      );
    }
  });

  it("INPUT_FIELD_MAP category values match FIELD_METADATA category keys", () => {
    const invalidCategories: string[] = [];

    for (const [rowKey, mapping] of Object.entries(INPUT_FIELD_MAP)) {
      if (!(mapping.category in FIELD_METADATA)) {
        invalidCategories.push(
          `${rowKey}: category "${mapping.category}" is not a valid key in FIELD_METADATA`
        );
      }
    }

    if (invalidCategories.length > 0) {
      expect.fail(
        `Invalid INPUT_FIELD_MAP categories:\n${invalidCategories.join("\n")}`
      );
    }
  });
});
