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
 *  - migratePlanFinancialInputs: Old format → New per-year format (lossless)
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

const DEFAULT_MONTHS_TO_REACH_AUV = 14;
const DEFAULT_PAYROLL_TAX_PCT = 0.20;
const DEFAULT_OTHER_OPEX_PCT = 0.03;
const DEFAULT_AR_DAYS = 30;
const DEFAULT_AP_DAYS = 60;
const DEFAULT_INVENTORY_DAYS = 60;
const DEFAULT_TAX_RATE = 0.21;
const RENT_ESCALATION_RATE = 0.03;

// ─── Field Value Helpers ─────────────────────────────────────────────────

function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

function safeValue(field: { value: number } | null | undefined, fallback: number = 0): number {
  return field?.value ?? fallback;
}

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

function makeFieldArray5(value: number, brandDefault?: number | null): FinancialFieldValue[] {
  const bd = brandDefault !== undefined ? brandDefault : null;
  return Array.from({ length: 5 }, () => makeField(value, bd));
}

function makeEscalatedArray5(baseValue: number, escalationRate: number): FinancialFieldValue[] {
  return Array.from({ length: 5 }, (_, i) =>
    makeField(Math.round(baseValue * Math.pow(1 + escalationRate, i)))
  );
}

// ─── Build Plan Financial Inputs ─────────────────────────────────────────

export function buildPlanFinancialInputs(
  brandParams: BrandParameters
): PlanFinancialInputs {
  const bp = brandParams;

  const year1Growth = safeValue(bp?.revenue?.year1_growth_rate);
  const year2Growth = safeValue(bp?.revenue?.year2_growth_rate);

  const rentAnnualCents = dollarsToCents(safeValue(bp?.operating_costs?.rent_monthly)) * 12;
  const utilitiesAnnualCents = dollarsToCents(safeValue(bp?.operating_costs?.utilities_monthly)) * 12;
  const insuranceAnnualCents = dollarsToCents(safeValue(bp?.operating_costs?.insurance_monthly)) * 12;

  const monthlyAuvCents = dollarsToCents(safeValue(bp?.revenue?.monthly_auv));
  const annualGrossSalesCents = monthlyAuvCents * 12;
  const otherMonthlyCents = dollarsToCents(safeValue(bp?.operating_costs?.other_monthly));
  let otherOpexPct: number;
  if (otherMonthlyCents > 0 && annualGrossSalesCents > 0) {
    otherOpexPct = (otherMonthlyCents * 12) / annualGrossSalesCents;
  } else {
    otherOpexPct = otherMonthlyCents > 0 ? DEFAULT_OTHER_OPEX_PCT : 0;
  }

  const facilitiesDecomposition = {
    rent: makeEscalatedArray5(rentAnnualCents, RENT_ESCALATION_RATE),
    utilities: makeEscalatedArray5(utilitiesAnnualCents, RENT_ESCALATION_RATE),
    telecomIt: makeFieldArray5(0),
    vehicleFleet: makeFieldArray5(0),
    insurance: makeEscalatedArray5(insuranceAnnualCents, RENT_ESCALATION_RATE),
  };

  const facilitiesAnnual = Array.from({ length: 5 }, (_, i) => {
    const total =
      facilitiesDecomposition.rent[i].currentValue +
      facilitiesDecomposition.utilities[i].currentValue +
      facilitiesDecomposition.telecomIt[i].currentValue +
      facilitiesDecomposition.vehicleFleet[i].currentValue +
      facilitiesDecomposition.insurance[i].currentValue;
    return makeField(total);
  });

  return {
    revenue: {
      monthlyAuv: makeField(monthlyAuvCents),
      growthRates: [
        makeField(year1Growth),
        makeField(year2Growth),
        makeField(year2Growth),
        makeField(year2Growth),
        makeField(year2Growth),
      ],
      startingMonthAuvPct: makeField(safeValue(bp?.revenue?.starting_month_auv_pct, 0.08)),
    },
    operatingCosts: {
      royaltyPct: makeFieldArray5(safeValue(bp?.operating_costs?.royalty_pct)),
      adFundPct: makeFieldArray5(safeValue(bp?.operating_costs?.ad_fund_pct)),
      cogsPct: makeFieldArray5(safeValue(bp?.operating_costs?.cogs_pct)),
      laborPct: makeFieldArray5(safeValue(bp?.operating_costs?.labor_pct)),
      facilitiesAnnual,
      facilitiesDecomposition,
      marketingPct: makeFieldArray5(safeValue(bp?.operating_costs?.marketing_pct)),
      managementSalariesAnnual: makeFieldArray5(0),
      payrollTaxPct: makeFieldArray5(DEFAULT_PAYROLL_TAX_PCT),
      otherOpexPct: makeFieldArray5(otherOpexPct),
    },
    profitabilityAndDistributions: {
      targetPreTaxProfitPct: makeFieldArray5(0),
      shareholderSalaryAdj: makeFieldArray5(0),
      distributions: makeFieldArray5(0),
      nonCapexInvestment: makeFieldArray5(0),
    },
    workingCapitalAndValuation: {
      arDays: makeField(DEFAULT_AR_DAYS),
      apDays: makeField(DEFAULT_AP_DAYS),
      inventoryDays: makeField(DEFAULT_INVENTORY_DAYS),
      taxPaymentDelayMonths: makeField(0),
      ebitdaMultiple: makeField(0),
    },
    financing: {
      loanAmount: makeField(dollarsToCents(safeValue(bp?.financing?.loan_amount))),
      interestRate: makeField(safeValue(bp?.financing?.interest_rate)),
      loanTermMonths: makeField(safeValue(bp?.financing?.loan_term_months)),
      downPaymentPct: makeField(safeValue(bp?.financing?.down_payment_pct)),
    },
    startupCapital: {
      workingCapitalMonths: makeField(safeValue(bp?.startup_capital?.working_capital_months)),
      depreciationYears: makeField(safeValue(bp?.startup_capital?.depreciation_years)),
    },
  };
}

// ─── Build Plan Startup Costs ────────────────────────────────────────────

export function buildPlanStartupCosts(
  template: StartupCostTemplate
): StartupCostLineItem[] {
  return template.map((item, index) => ({
    id: crypto.randomUUID(),
    name: item.name,
    amount: dollarsToCents(item.default_amount),
    capexClassification: item.capex_classification,
    isCustom: false,
    source: "brand_default" as const,
    brandDefaultAmount: dollarsToCents(item.default_amount),
    item7RangeLow: item.item7_range_low !== null ? dollarsToCents(item.item7_range_low) : null,
    item7RangeHigh: item.item7_range_high !== null ? dollarsToCents(item.item7_range_high) : null,
    sortOrder: item.sort_order ?? index,
  }));
}

// ─── Startup Cost Operations ────────────────────────────────────────────

export function addCustomStartupCost(
  costs: StartupCostLineItem[],
  name: string,
  amount: number,
  classification: StartupCostLineItem["capexClassification"]
): StartupCostLineItem[] {
  const maxOrder = costs.length > 0 ? Math.max(...costs.map((c) => c.sortOrder)) : -1;
  const newItem: StartupCostLineItem = {
    id: crypto.randomUUID(),
    name,
    amount,
    capexClassification: classification,
    isCustom: true,
    source: "user_entry",
    brandDefaultAmount: null,
    item7RangeLow: null,
    item7RangeHigh: null,
    sortOrder: maxOrder + 1,
  };
  return [...costs, newItem];
}

export function removeStartupCost(
  costs: StartupCostLineItem[],
  id: string
): StartupCostLineItem[] {
  const item = costs.find((c) => c.id === id);
  if (!item || !item.isCustom) return costs;
  return normalizeOrder(costs.filter((c) => c.id !== id));
}

export function updateStartupCostAmount(
  costs: StartupCostLineItem[],
  id: string,
  newAmount: number
): StartupCostLineItem[] {
  return costs.map((c) =>
    c.id === id ? { ...c, amount: newAmount, source: "user_entry" as const } : c
  );
}

export function resetStartupCostToDefault(
  costs: StartupCostLineItem[],
  id: string
): StartupCostLineItem[] {
  return costs.map((c) => {
    if (c.id !== id || c.isCustom || c.brandDefaultAmount === null) return c;
    return { ...c, amount: c.brandDefaultAmount, source: "brand_default" as const };
  });
}

export function reorderStartupCosts(
  costs: StartupCostLineItem[],
  orderedIds: string[]
): StartupCostLineItem[] {
  const idToIndex = new Map(orderedIds.map((id, i) => [id, i]));
  const sorted = [...costs].sort((a, b) => {
    const ai = idToIndex.get(a.id) ?? a.sortOrder;
    const bi = idToIndex.get(b.id) ?? b.sortOrder;
    return ai - bi;
  });
  return sorted.map((c, i) => ({ ...c, sortOrder: i }));
}

export function getStartupCostTotals(costs: StartupCostLineItem[]): {
  capexTotal: number;
  nonCapexTotal: number;
  workingCapitalTotal: number;
  grandTotal: number;
} {
  let capexTotal = 0;
  let nonCapexTotal = 0;
  let workingCapitalTotal = 0;
  for (const c of costs) {
    if (c.capexClassification === "capex") capexTotal += c.amount;
    else if (c.capexClassification === "non_capex") nonCapexTotal += c.amount;
    else workingCapitalTotal += c.amount;
  }
  return { capexTotal, nonCapexTotal, workingCapitalTotal, grandTotal: capexTotal + nonCapexTotal + workingCapitalTotal };
}

export function migrateStartupCosts(costs: Array<Partial<StartupCostLineItem> & { name: string; amount: number; capexClassification: StartupCostLineItem["capexClassification"] }>): StartupCostLineItem[] {
  return costs.map((c, index) => ({
    id: c.id ?? crypto.randomUUID(),
    name: c.name,
    amount: c.amount,
    capexClassification: c.capexClassification,
    isCustom: c.isCustom ?? false,
    source: c.source ?? "brand_default",
    brandDefaultAmount: c.brandDefaultAmount !== undefined ? c.brandDefaultAmount : c.amount,
    item7RangeLow: c.item7RangeLow ?? null,
    item7RangeHigh: c.item7RangeHigh ?? null,
    sortOrder: c.sortOrder ?? index,
  }));
}

function normalizeOrder(costs: StartupCostLineItem[]): StartupCostLineItem[] {
  const sorted = [...costs].sort((a, b) => a.sortOrder - b.sortOrder);
  return sorted.map((c, i) => (c.sortOrder === i ? c : { ...c, sortOrder: i }));
}

// ─── Migration: Old Format → Per-Year Format ────────────────────────────

interface OldFormatPlanFinancialInputs {
  revenue: {
    monthlyAuv: FinancialFieldValue;
    year1GrowthRate: FinancialFieldValue;
    year2GrowthRate: FinancialFieldValue;
    startingMonthAuvPct: FinancialFieldValue;
  };
  operatingCosts: {
    cogsPct: FinancialFieldValue;
    laborPct: FinancialFieldValue;
    rentMonthly: FinancialFieldValue;
    utilitiesMonthly: FinancialFieldValue;
    insuranceMonthly: FinancialFieldValue;
    marketingPct: FinancialFieldValue;
    royaltyPct: FinancialFieldValue;
    adFundPct: FinancialFieldValue;
    otherMonthly: FinancialFieldValue;
  };
  financing: {
    loanAmount: FinancialFieldValue;
    interestRate: FinancialFieldValue;
    loanTermMonths: FinancialFieldValue;
    downPaymentPct: FinancialFieldValue;
  };
  startupCapital: {
    workingCapitalMonths: FinancialFieldValue;
    depreciationYears: FinancialFieldValue;
  };
}

function isOldFormat(data: unknown): data is OldFormatPlanFinancialInputs {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  const rev = d.revenue as Record<string, unknown> | undefined;
  return rev !== undefined && "year1GrowthRate" in rev;
}

function migrateField(old: FinancialFieldValue): FinancialFieldValue[] {
  return Array.from({ length: 5 }, () => ({ ...old }));
}

function migrateFieldWithEscalation(old: FinancialFieldValue, annualFactor: number): FinancialFieldValue[] {
  const baseAnnual = old.currentValue * 12;
  const baseBrandDefault = old.brandDefault !== null ? old.brandDefault * 12 : null;
  return Array.from({ length: 5 }, (_, i) => ({
    ...old,
    currentValue: Math.round(baseAnnual * Math.pow(1 + annualFactor, i)),
    brandDefault: baseBrandDefault !== null ? Math.round(baseBrandDefault * Math.pow(1 + annualFactor, i)) : null,
  }));
}

export function migratePlanFinancialInputs(data: unknown): PlanFinancialInputs {
  if (!isOldFormat(data)) {
    return data as PlanFinancialInputs;
  }

  const old = data;
  const v = (f: FinancialFieldValue) => f.currentValue;

  const monthlyFixed =
    v(old.operatingCosts.rentMonthly) +
    v(old.operatingCosts.utilitiesMonthly) +
    v(old.operatingCosts.insuranceMonthly);
  const baseAnnualFacilities = monthlyFixed * 12;
  const facilitiesAnnualValues: number[] = Array.from({ length: 5 }, (_, i) =>
    Math.round(baseAnnualFacilities * Math.pow(1 + RENT_ESCALATION_RATE, i))
  );

  const rentDecomp = migrateFieldWithEscalation(old.operatingCosts.rentMonthly, RENT_ESCALATION_RATE);
  const utilitiesDecomp = migrateFieldWithEscalation(old.operatingCosts.utilitiesMonthly, RENT_ESCALATION_RATE);
  const insuranceDecomp = migrateFieldWithEscalation(old.operatingCosts.insuranceMonthly, RENT_ESCALATION_RATE);

  const annualGrossSales = v(old.revenue.monthlyAuv) * 12;
  const otherMonthlyCents = v(old.operatingCosts.otherMonthly);
  let otherOpexPctValue: number;
  if (otherMonthlyCents > 0 && annualGrossSales > 0) {
    otherOpexPctValue = (otherMonthlyCents * 12) / annualGrossSales;
  } else {
    otherOpexPctValue = otherMonthlyCents > 0 ? DEFAULT_OTHER_OPEX_PCT : 0;
  }

  const otherOpexField = makeField(otherOpexPctValue);
  if (old.operatingCosts.otherMonthly.isCustom) {
    otherOpexField.source = old.operatingCosts.otherMonthly.source;
    otherOpexField.isCustom = true;
    otherOpexField.lastModifiedAt = old.operatingCosts.otherMonthly.lastModifiedAt;
  }

  return {
    revenue: {
      monthlyAuv: { ...old.revenue.monthlyAuv },
      growthRates: [
        { ...old.revenue.year1GrowthRate },
        { ...old.revenue.year2GrowthRate },
        { ...old.revenue.year2GrowthRate },
        { ...old.revenue.year2GrowthRate },
        { ...old.revenue.year2GrowthRate },
      ],
      startingMonthAuvPct: { ...old.revenue.startingMonthAuvPct },
    },
    operatingCosts: {
      royaltyPct: migrateField(old.operatingCosts.royaltyPct),
      adFundPct: migrateField(old.operatingCosts.adFundPct),
      cogsPct: migrateField(old.operatingCosts.cogsPct),
      laborPct: migrateField(old.operatingCosts.laborPct),
      facilitiesAnnual: facilitiesAnnualValues.map((val) => makeField(val)),
      facilitiesDecomposition: {
        rent: rentDecomp,
        utilities: utilitiesDecomp,
        telecomIt: makeFieldArray5(0),
        vehicleFleet: makeFieldArray5(0),
        insurance: insuranceDecomp,
      },
      marketingPct: migrateField(old.operatingCosts.marketingPct),
      managementSalariesAnnual: makeFieldArray5(0),
      payrollTaxPct: makeFieldArray5(DEFAULT_PAYROLL_TAX_PCT),
      otherOpexPct: Array.from({ length: 5 }, () => ({ ...otherOpexField })),
    },
    profitabilityAndDistributions: {
      targetPreTaxProfitPct: makeFieldArray5(0),
      shareholderSalaryAdj: makeFieldArray5(0),
      distributions: makeFieldArray5(0),
      nonCapexInvestment: makeFieldArray5(0),
    },
    workingCapitalAndValuation: {
      arDays: makeField(DEFAULT_AR_DAYS),
      apDays: makeField(DEFAULT_AP_DAYS),
      inventoryDays: makeField(DEFAULT_INVENTORY_DAYS),
      taxPaymentDelayMonths: makeField(0),
      ebitdaMultiple: makeField(0),
    },
    financing: { ...old.financing },
    startupCapital: { ...old.startupCapital },
  };
}

// ─── Unwrap for Engine ───────────────────────────────────────────────────

export function unwrapForEngine(
  planInputs: PlanFinancialInputs,
  startupCosts: StartupCostLineItem[]
): EngineInput {
  const pi = planInputs;
  const v = (field: FinancialFieldValue) => field.currentValue;
  const va = (arr: FinancialFieldValue[]): [number, number, number, number, number] =>
    [arr[0], arr[1], arr[2], arr[3], arr[4]].map((f) => f.currentValue) as [number, number, number, number, number];

  const monthlyAuv = v(pi.revenue.monthlyAuv);
  const annualGrossSales = monthlyAuv * 12;

  const totalInvestment = startupCosts.reduce((sum, c) => sum + c.amount, 0);
  const loanAmount = v(pi.financing.loanAmount);
  const effectiveInvestment = totalInvestment > 0 ? totalInvestment : loanAmount;
  const equityPct = effectiveInvestment > 0
    ? Math.max(0, Math.min(1, 1 - (loanAmount / effectiveInvestment)))
    : 0;

  const depYears = v(pi.startupCapital.depreciationYears);
  const depreciationRate = depYears > 0 ? 1 / depYears : 0;

  const wc = pi.workingCapitalAndValuation;
  const pd = pi.profitabilityAndDistributions;

  const financialInputs: FinancialInputs = {
    revenue: {
      annualGrossSales,
      monthsToReachAuv: DEFAULT_MONTHS_TO_REACH_AUV,
      startingMonthAuvPct: v(pi.revenue.startingMonthAuvPct),
      growthRates: va(pi.revenue.growthRates),
    },
    operatingCosts: {
      cogsPct: va(pi.operatingCosts.cogsPct),
      laborPct: va(pi.operatingCosts.laborPct),
      royaltyPct: va(pi.operatingCosts.royaltyPct),
      adFundPct: va(pi.operatingCosts.adFundPct),
      marketingPct: va(pi.operatingCosts.marketingPct),
      otherOpexPct: va(pi.operatingCosts.otherOpexPct),
      payrollTaxPct: va(pi.operatingCosts.payrollTaxPct),
      facilitiesAnnual: va(pi.operatingCosts.facilitiesAnnual),
      managementSalariesAnnual: va(pi.operatingCosts.managementSalariesAnnual),
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
      arDays: v(wc.arDays),
      apDays: v(wc.apDays),
      inventoryDays: v(wc.inventoryDays),
    },
    distributions: va(pd.distributions),
    taxRate: DEFAULT_TAX_RATE,
    ebitdaMultiple: v(wc.ebitdaMultiple) || undefined,
    targetPreTaxProfitPct: va(pd.targetPreTaxProfitPct),
    shareholderSalaryAdj: va(pd.shareholderSalaryAdj),
    taxPaymentDelayMonths: v(wc.taxPaymentDelayMonths) || undefined,
    nonCapexInvestment: va(pd.nonCapexInvestment),
  };

  return { financialInputs, startupCosts };
}

// ─── Field Update Helpers ────────────────────────────────────────────────

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
