/**
 * Plan Initialization — Bridge between BrandParameters and the Financial Engine.
 *
 * This module converts brand configuration data into plan-ready financial inputs
 * with per-field metadata (source tracking, brand defaults, reset capability).
 *
 * Key responsibilities:
 *  - buildPlanFinancialInputs: BrandParameters → PlanFinancialInputs (wrapped)
 *  - buildPlanStartupCosts: StartupCostTemplate → StartupCostLineItem[] (engine-ready)
 *  - unwrapForEngine: PlanFinancialInputs + StartupCostLineItem[] → EngineInput (raw)
 *  - updateFieldValue / resetFieldToDefault: per-field edit helpers
 *
 * Currency convention:
 *  - BrandParameters store currency as dollars (raw numbers)
 *  - PlanFinancialInputs and engine store currency as cents (integers)
 *  - This module handles the conversion: dollars * 100 → cents
 */

import type { BrandParameters, StartupCostTemplate } from "./schema";
import type {
  FinancialFieldValue,
  PlanFinancialInputs,
  FinancialInputs,
  StartupCostLineItem,
  EngineInput,
} from "./financial-engine";

// ─── Constants (system defaults for fields without brand parameters) ─────

/** Default months to reach full AUV (PostNet convention) */
const DEFAULT_MONTHS_TO_REACH_AUV = 14;

/** Default payroll tax + benefits rate (20% of labor + management) */
const DEFAULT_PAYROLL_TAX_PCT = 0.20;

/** Default other operating expense percentage of revenue */
const DEFAULT_OTHER_OPEX_PCT = 0.03;

/** Default working capital assumptions (days) */
const DEFAULT_AR_DAYS = 30;
const DEFAULT_AP_DAYS = 60;
const DEFAULT_INVENTORY_DAYS = 60;

/** Default tax rate */
const DEFAULT_TAX_RATE = 0.21;

/** Annual rent escalation rate for years 2-5 */
const RENT_ESCALATION_RATE = 0.03;

// ─── Field Value Helpers ─────────────────────────────────────────────────

/** Convert a dollar amount to cents */
function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/** Create a FinancialFieldValue with brand default source */
function makeField(
  value: number,
  brandDefault: number | null = null,
  item7Range: { min: number; max: number } | null = null
): FinancialFieldValue {
  return {
    currentValue: value,
    source: "brand_default",
    brandDefault: brandDefault ?? value,
    item7Range,
    lastModifiedAt: null,
    isCustom: false,
  };
}

// ─── Build Plan Financial Inputs ─────────────────────────────────────────

/**
 * Maps brand parameters to plan financial inputs with per-field metadata.
 * Currency values are converted from dollars (brand params) to cents (plan storage).
 * Each field starts with source: 'brand_default' and isCustom: false.
 */
export function buildPlanFinancialInputs(
  brandParams: BrandParameters
): PlanFinancialInputs {
  const bp = brandParams;

  return {
    revenue: {
      monthlyAuv: makeField(dollarsToCents(bp.revenue.monthly_auv.value)),
      year1GrowthRate: makeField(bp.revenue.year1_growth_rate.value),
      year2GrowthRate: makeField(bp.revenue.year2_growth_rate.value),
      startingMonthAuvPct: makeField(bp.revenue.starting_month_auv_pct.value),
    },
    operatingCosts: {
      cogsPct: makeField(bp.operating_costs.cogs_pct.value),
      laborPct: makeField(bp.operating_costs.labor_pct.value),
      rentMonthly: makeField(dollarsToCents(bp.operating_costs.rent_monthly.value)),
      utilitiesMonthly: makeField(dollarsToCents(bp.operating_costs.utilities_monthly.value)),
      insuranceMonthly: makeField(dollarsToCents(bp.operating_costs.insurance_monthly.value)),
      marketingPct: makeField(bp.operating_costs.marketing_pct.value),
      royaltyPct: makeField(bp.operating_costs.royalty_pct.value),
      adFundPct: makeField(bp.operating_costs.ad_fund_pct.value),
      otherMonthly: makeField(dollarsToCents(bp.operating_costs.other_monthly.value)),
    },
    financing: {
      loanAmount: makeField(dollarsToCents(bp.financing.loan_amount.value)),
      interestRate: makeField(bp.financing.interest_rate.value),
      loanTermMonths: makeField(bp.financing.loan_term_months.value),
      downPaymentPct: makeField(bp.financing.down_payment_pct.value),
    },
    startupCapital: {
      workingCapitalMonths: makeField(bp.startup_capital.working_capital_months.value),
      depreciationYears: makeField(bp.startup_capital.depreciation_years.value),
    },
  };
}

// ─── Build Plan Startup Costs ────────────────────────────────────────────

/**
 * Maps a brand's startup cost template to engine-compatible startup cost line items.
 * Amounts are converted from dollars (template) to cents (engine).
 */
export function buildPlanStartupCosts(
  template: StartupCostTemplate
): StartupCostLineItem[] {
  return template.map((item) => ({
    name: item.name,
    amount: dollarsToCents(item.default_amount),
    capexClassification: item.capex_classification,
  }));
}

// ─── Unwrap for Engine ───────────────────────────────────────────────────

/**
 * Extracts raw numeric values from PlanFinancialInputs and produces an EngineInput.
 *
 * Key transformations:
 *  - monthlyAuv (cents/month) * 12 → annualGrossSales (cents/year)
 *  - Single percentage values → 5-element per-year arrays
 *  - Fixed monthly costs (rent + utilities + insurance) * 12 → facilitiesAnnual with 3% escalation
 *  - otherMonthly converted to otherOpexPct as proportion of estimated annual revenue
 *  - loanAmount / totalInvestment → equityPct (downPaymentPct stored for UI only)
 *  - depreciationYears → depreciationRate (1/years)
 */
export function unwrapForEngine(
  planInputs: PlanFinancialInputs,
  startupCosts: StartupCostLineItem[]
): EngineInput {
  const pi = planInputs;
  const v = (field: FinancialFieldValue) => field.currentValue;

  // Revenue
  const monthlyAuv = v(pi.revenue.monthlyAuv);
  const annualGrossSales = monthlyAuv * 12;
  const year1Growth = v(pi.revenue.year1GrowthRate);
  const year2Growth = v(pi.revenue.year2GrowthRate);

  // Operating cost percentages — expand single values to 5-year arrays
  const cogsPct = fill5(v(pi.operatingCosts.cogsPct));
  const laborPct = fill5(v(pi.operatingCosts.laborPct));
  const royaltyPct = fill5(v(pi.operatingCosts.royaltyPct));
  const adFundPct = fill5(v(pi.operatingCosts.adFundPct));
  const marketingPct = fill5(v(pi.operatingCosts.marketingPct));

  // Fixed monthly costs → annual facilities with escalation
  const monthlyFixed =
    v(pi.operatingCosts.rentMonthly) +
    v(pi.operatingCosts.utilitiesMonthly) +
    v(pi.operatingCosts.insuranceMonthly);
  const baseAnnualFacilities = monthlyFixed * 12;
  const facilitiesAnnual: [number, number, number, number, number] = [
    baseAnnualFacilities,
    Math.round(baseAnnualFacilities * (1 + RENT_ESCALATION_RATE)),
    Math.round(baseAnnualFacilities * Math.pow(1 + RENT_ESCALATION_RATE, 2)),
    Math.round(baseAnnualFacilities * Math.pow(1 + RENT_ESCALATION_RATE, 3)),
    Math.round(baseAnnualFacilities * Math.pow(1 + RENT_ESCALATION_RATE, 4)),
  ];

  // Other monthly → otherOpexPct: derive as proportion of estimated Y1 revenue.
  // KNOWN LIMITATION: This converts a fixed monthly dollar cost into a percentage of
  // revenue, making it scale with revenue changes. The engine interface only accepts
  // otherOpexPct (percentage), not fixed dollar amounts. See dev notes lines 72, 95.
  const otherMonthlyCents = v(pi.operatingCosts.otherMonthly);
  let otherOpexPct: number;
  if (otherMonthlyCents > 0 && annualGrossSales > 0) {
    otherOpexPct = (otherMonthlyCents * 12) / annualGrossSales;
  } else {
    otherOpexPct = otherMonthlyCents > 0 ? DEFAULT_OTHER_OPEX_PCT : 0;
  }

  // Financing — equityPct derived from loanAmount / totalInvestment (dev notes line 73).
  // downPaymentPct is stored in PlanFinancialInputs for UI display but does not drive
  // engine computation; loanAmount is the authoritative financing input.
  const totalInvestment = startupCosts.reduce((sum, c) => sum + c.amount, 0);
  const loanAmount = v(pi.financing.loanAmount);
  const effectiveInvestment = totalInvestment > 0 ? totalInvestment : loanAmount;
  const equityPct = effectiveInvestment > 0
    ? Math.max(0, Math.min(1, 1 - (loanAmount / effectiveInvestment)))
    : 0;

  // Depreciation
  const depYears = v(pi.startupCapital.depreciationYears);
  const depreciationRate = depYears > 0 ? 1 / depYears : 0;

  const financialInputs: FinancialInputs = {
    revenue: {
      annualGrossSales,
      monthsToReachAuv: DEFAULT_MONTHS_TO_REACH_AUV,
      startingMonthAuvPct: v(pi.revenue.startingMonthAuvPct),
      growthRates: [year1Growth, year2Growth, year2Growth, year2Growth, year2Growth],
    },
    operatingCosts: {
      cogsPct,
      laborPct,
      royaltyPct,
      adFundPct,
      marketingPct,
      otherOpexPct: fill5(otherOpexPct),
      payrollTaxPct: fill5(DEFAULT_PAYROLL_TAX_PCT),
      facilitiesAnnual,
      managementSalariesAnnual: [0, 0, 0, 0, 0],
    },
    financing: {
      totalInvestment: effectiveInvestment,
      equityPct,
      interestRate: v(pi.financing.interestRate),
      termMonths: v(pi.financing.loanTermMonths),
    },
    startup: {
      depreciationRate,
    },
    workingCapitalAssumptions: {
      arDays: DEFAULT_AR_DAYS,
      apDays: DEFAULT_AP_DAYS,
      inventoryDays: DEFAULT_INVENTORY_DAYS,
    },
    distributions: [0, 0, 0, 0, 0],
    taxRate: DEFAULT_TAX_RATE,
  };

  return { financialInputs, startupCosts };
}

// ─── Field Update Helpers ────────────────────────────────────────────────

/**
 * Returns a new FinancialFieldValue with the user's edit applied.
 * Updates source to 'user_entry', sets isCustom to true, records timestamp.
 */
export function updateFieldValue(
  field: FinancialFieldValue,
  newValue: number,
  timestamp: string
): FinancialFieldValue {
  return {
    ...field,
    currentValue: newValue,
    source: "user_entry",
    isCustom: true,
    lastModifiedAt: timestamp,
  };
}

/**
 * Returns a new FinancialFieldValue reset to its brand default.
 * If no brand default exists, the field is unchanged.
 */
export function resetFieldToDefault(
  field: FinancialFieldValue,
  timestamp: string
): FinancialFieldValue {
  if (field.brandDefault === null) {
    return field;
  }
  return {
    ...field,
    currentValue: field.brandDefault,
    source: "brand_default",
    isCustom: false,
    lastModifiedAt: timestamp,
  };
}

// ─── Utility ─────────────────────────────────────────────────────────────

/** Expand a single value into a 5-element tuple (one per year) */
function fill5(value: number): [number, number, number, number, number] {
  return [value, value, value, value, value];
}
