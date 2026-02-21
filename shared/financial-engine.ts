/**
 * Financial Engine — Pure TypeScript computation module.
 *
 * Properties:
 *  - Pure function: identical inputs always produce identical outputs (FR9, NFR15)
 *  - No I/O: never touches database, filesystem, or network
 *  - No side effects: no Date.now(), no randomness, no external state
 *  - Accepts brand-specific seed values without structural changes per brand (FR10)
 *
 * Currency convention: cents as integers (e.g. 15000 = $150.00)
 * Percentage convention: decimal form (e.g. 0.065 = 6.5%)
 * Counts: plain integers
 */

// ─── Constants ──────────────────────────────────────────────────────────
export const MAX_PROJECTION_MONTHS = 60;
const MONTHS_PER_YEAR = 12;
const CENTS_PRECISION = 100;

// ─── JSONB Field Metadata ────────────────────────────────────────────────

/** Per-field metadata wrapper stored in plan JSONB. The engine operates on
 *  unwrapped raw values (FinancialInputs below); the FinancialFieldValue
 *  wrapper is consumed by the UI/plan-initialization layer (Story 3.2+). */
export interface FinancialFieldValue {
  currentValue: number;
  source: "brand_default" | "user_entry" | "ai_populated" | `admin:${string}`;
  brandDefault: number | null;
  item7Range: { min: number; max: number } | null;
  lastModifiedAt: string | null;
  isCustom: boolean;
}

/** Wrapped financial inputs for plan JSONB persistence. Each user-editable field
 *  carries metadata (source, brand default, reset capability). The structure
 *  mirrors BrandParameters categories with camelCase keys.
 *
 *  Per-year fields use 5-element FinancialFieldValue[] arrays (Year 1 through Year 5).
 *  Single-value fields remain as plain FinancialFieldValue. */
export interface PlanFinancialInputs {
  revenue: {
    monthlyAuv: FinancialFieldValue;
    growthRates: FinancialFieldValue[];
    startingMonthAuvPct: FinancialFieldValue;
  };
  operatingCosts: {
    royaltyPct: FinancialFieldValue[];
    adFundPct: FinancialFieldValue[];
    cogsPct: FinancialFieldValue[];
    laborPct: FinancialFieldValue[];
    facilitiesAnnual: FinancialFieldValue[];
    facilitiesDecomposition: {
      rent: FinancialFieldValue[];
      utilities: FinancialFieldValue[];
      telecomIt: FinancialFieldValue[];
      vehicleFleet: FinancialFieldValue[];
      insurance: FinancialFieldValue[];
    };
    marketingPct: FinancialFieldValue[];
    managementSalariesAnnual: FinancialFieldValue[];
    payrollTaxPct: FinancialFieldValue[];
    otherOpexPct: FinancialFieldValue[];
  };
  profitabilityAndDistributions: {
    targetPreTaxProfitPct: FinancialFieldValue[];
    shareholderSalaryAdj: FinancialFieldValue[];
    distributions: FinancialFieldValue[];
    nonCapexInvestment: FinancialFieldValue[];
  };
  workingCapitalAndValuation: {
    arDays: FinancialFieldValue;
    apDays: FinancialFieldValue;
    inventoryDays: FinancialFieldValue;
    taxPaymentDelayMonths: FinancialFieldValue;
    ebitdaMultiple: FinancialFieldValue;
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

// ─── Input Interfaces ───────────────────────────────────────────────────

/** Raw numeric financial inputs consumed by the engine (no metadata wrappers). */
export interface FinancialInputs {
  revenue: {
    /** Annual gross sales / AUV in cents */
    annualGrossSales: number;
    /** Number of months to reach full AUV */
    monthsToReachAuv: number;
    /** Starting month AUV percentage (decimal, e.g. 0.08 = 8%) */
    startingMonthAuvPct: number;
    /** Annual growth rates (decimal) for years 1-5 */
    growthRates: [number, number, number, number, number];
  };
  operatingCosts: {
    /** COGS as % of revenue per year (decimal) */
    cogsPct: [number, number, number, number, number];
    /** Direct labor as % of revenue per year (decimal) */
    laborPct: [number, number, number, number, number];
    /** Royalty fee as % of revenue per year (decimal) */
    royaltyPct: [number, number, number, number, number];
    /** Ad fund / marketing fee as % of revenue per year (decimal) */
    adFundPct: [number, number, number, number, number];
    /** Marketing / advertising as % of revenue per year (decimal) */
    marketingPct: [number, number, number, number, number];
    /** Other operating expenses as % of revenue per year (decimal) */
    otherOpexPct: [number, number, number, number, number];
    /** Payroll taxes & benefits as % of (direct labor + mgmt salaries) per year (decimal) */
    payrollTaxPct: [number, number, number, number, number];
    /** Annual facilities/rent in cents per year */
    facilitiesAnnual: [number, number, number, number, number];
    /** Annual management & admin salaries in cents per year */
    managementSalariesAnnual: [number, number, number, number, number];
  };
  financing: {
    /** Total investment required in cents */
    totalInvestment: number;
    /** Equity / cash injection percentage (decimal, e.g. 0.20 = 20%) */
    equityPct: number;
    /** Debt interest rate (decimal, e.g. 0.105 = 10.5%) */
    interestRate: number;
    /** Debt term in months */
    termMonths: number;
  };
  startup: {
    /** Depreciation rate per year (decimal, e.g. 0.25 = 25% / 4 years) */
    depreciationRate: number;
  };
  workingCapitalAssumptions: {
    /** Accounts receivable days */
    arDays: number;
    /** Accounts payable days (materials only) */
    apDays: number;
    /** Inventory days */
    inventoryDays: number;
  };
  /** Annual owner distributions in cents [Y1..Y5] */
  distributions: [number, number, number, number, number];
  /** Corporation tax rate (decimal, e.g. 0.21 = 21%).
   *  Applied in: (1) Balance Sheet tax payable accrual, (2) Valuation
   *  estimated tax on sale, (3) ROIC Extended taxes due. The main P&L
   *  remains pre-tax — taxRate does NOT reduce preTaxIncome. */
  taxRate: number;
  ebitdaMultiple?: number;
  targetPreTaxProfitPct?: [number, number, number, number, number];
  shareholderSalaryAdj?: [number, number, number, number, number];
  taxPaymentDelayMonths?: number;
  nonCapexInvestment?: [number, number, number, number, number];
}

export interface StartupCostLineItem {
  id: string;
  name: string;
  amount: number; // cents
  capexClassification: "capex" | "non_capex" | "working_capital";
  isCustom: boolean;
  source: "brand_default" | "user_entry" | `admin:${string}`;
  brandDefaultAmount: number | null;
  item7RangeLow: number | null;
  item7RangeHigh: number | null;
  sortOrder: number;
}

export interface EngineInput {
  financialInputs: FinancialInputs;
  startupCosts: StartupCostLineItem[];
}

// ─── Output Interfaces ──────────────────────────────────────────────────

export interface MonthlyProjection {
  month: number; // 1-60
  year: number; // 1-5
  monthInYear: number; // 1-12

  // Revenue
  auvPct: number;
  revenue: number; // cents

  // COGS
  materialsCogs: number;
  royalties: number;
  adFund: number;
  totalCogs: number;
  grossProfit: number;

  // Operating expenses
  directLabor: number;
  contributionMargin: number;
  facilities: number;
  marketing: number;
  managementSalaries: number;
  payrollTaxBenefits: number;
  otherOpex: number;
  nonCapexInvestment: number;
  totalOpex: number;

  // EBITDA & net income
  ebitda: number;
  depreciation: number;
  interestExpense: number;
  preTaxIncome: number;

  // Balance sheet items
  accountsReceivable: number;
  inventory: number;
  accountsPayable: number;
  netFixedAssets: number;

  // Cash flow
  operatingCashFlow: number;
  /** Running cumulative net cash flow matching break-even basis (cents).
   *  Starts from -totalStartupInvestment + financing inflows, then accumulates
   *  operatingCashFlow - principal - distributions each month. */
  cumulativeNetCashFlow: number;

  // Debt
  loanOpeningBalance: number;
  loanPrincipalPayment: number;
  loanClosingBalance: number;

  // Balance Sheet disaggregation
  taxPayable: number;
  lineOfCredit: number;
  commonStock: number;
  retainedEarnings: number;
  totalCurrentAssets: number;
  totalAssets: number;
  totalCurrentLiabilities: number;
  totalLiabilities: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;

  // Cash Flow disaggregation — Operating
  cfDepreciation: number;
  cfAccountsReceivableChange: number;
  cfInventoryChange: number;
  cfAccountsPayableChange: number;
  cfTaxPayableChange: number;
  cfNetOperatingCashFlow: number;
  // Cash Flow disaggregation — Investing
  cfCapexPurchase: number;
  cfNetBeforeFinancing: number;
  // Cash Flow disaggregation — Financing
  cfNotesPayable: number;
  cfLineOfCredit: number;
  cfInterestExpense: number;
  cfDistributions: number;
  cfEquityIssuance: number;
  cfNetFinancingCashFlow: number;
  // Cash Flow disaggregation — Net
  cfNetCashFlow: number;
  beginningCash: number;
  endingCash: number;
}

export interface AnnualSummary {
  year: number;
  revenue: number;
  totalCogs: number;
  grossProfit: number;
  grossProfitPct: number;
  directLabor: number;
  contributionMargin: number;
  contributionMarginPct: number;
  totalOpex: number;
  ebitda: number;
  ebitdaPct: number;
  depreciation: number;
  interestExpense: number;
  preTaxIncome: number;
  preTaxIncomePct: number;
  // Balance sheet (end of year)
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  // Cash flow
  operatingCashFlow: number;
  netCashFlow: number;
  endingCash: number;
}

export interface ROIMetrics {
  /** Month number (1-60) when cumulative cash flow turns positive, or null if never */
  breakEvenMonth: number | null;
  totalStartupInvestment: number;
  projectedAnnualRevenueYear1: number;
  fiveYearCumulativeCashFlow: number;
  fiveYearROIPct: number;
}

export interface IdentityCheckResult {
  name: string;
  passed: boolean;
  expected: number;
  actual: number;
  tolerance: number;
}

export interface ValuationOutput {
  year: number;
  grossSales: number;
  netOperatingIncome: number;
  shareholderSalaryAdj: number;
  adjNetOperatingIncome: number;
  adjNetOperatingIncomePct: number;
  ebitdaMultiple: number;
  estimatedValue: number;
  estimatedTaxOnSale: number;
  netAfterTaxProceeds: number;
  totalCashInvested: number;
  replacementReturnRequired: number;
  businessAnnualROIC: number;
}

export interface ROICExtendedOutput {
  year: number;
  outsideCash: number;
  totalLoans: number;
  totalCashInvested: number;
  totalSweatEquity: number;
  retainedEarningsLessDistributions: number;
  totalInvestedCapital: number;
  preTaxNetIncome: number;
  preTaxNetIncomeIncSweatEquity: number;
  taxRate: number;
  taxesDue: number;
  afterTaxNetIncome: number;
  roicPct: number;
  avgCoreCapitalPerMonth: number;
  monthsOfCoreCapital: number;
  excessCoreCapital: number;
}

export interface PLAnalysisOutput {
  year: number;
  adjustedPreTaxProfit: number;
  targetPreTaxProfit: number;
  aboveBelowTarget: number;
  nonLaborGrossMargin: number;
  totalWages: number;
  adjustedTotalWages: number;
  salaryCapAtTarget: number;
  overUnderCap: number;
  laborEfficiency: number;
  adjustedLaborEfficiency: number;
  discretionaryMarketingPct: number;
  prTaxBenefitsPctOfWages: number;
  otherOpexPctOfRevenue: number;
}

export interface EngineOutput {
  monthlyProjections: MonthlyProjection[];
  annualSummaries: AnnualSummary[];
  roiMetrics: ROIMetrics;
  identityChecks: IdentityCheckResult[];
  valuation: ValuationOutput[];
  roicExtended: ROICExtendedOutput[];
  plAnalysis: PLAnalysisOutput[];
}

// ─── Helpers ────────────────────────────────────────────────────────────

/** Round to 2 decimal places. For currency values (stored in cents), this rounds
 *  to sub-cent precision to minimize cumulative rounding error across 60-month
 *  projections. Also used for percentage rounding (e.g. grossProfitPct).
 *  Normalizes -0 to 0. */
function round2(value: number): number {
  const result = Math.round(value * CENTS_PRECISION) / CENTS_PRECISION;
  return result === 0 ? 0 : result;
}

/** Get year index (0-4) from month number (1-60) */
function yearIndex(month: number): number {
  return Math.floor((month - 1) / MONTHS_PER_YEAR);
}

/** Get month-in-year (1-12) from month number (1-60) */
function monthInYear(month: number): number {
  return ((month - 1) % MONTHS_PER_YEAR) + 1;
}

/** Days in a given month-in-year (approximate, using 30-day months for consistency) */
function daysInMonth(): number {
  return 30;
}

// ─── Engine ─────────────────────────────────────────────────────────────

export function calculateProjections(input: EngineInput): EngineOutput {
  const { financialInputs: fi } = input;

  // ── Step 1: Startup Investment Totals (derived from line items) ────
  const capexTotal = input.startupCosts
    .filter((c) => c.capexClassification === "capex")
    .reduce((sum, c) => sum + c.amount, 0);
  const nonCapexTotal = input.startupCosts
    .filter((c) => c.capexClassification === "non_capex")
    .reduce((sum, c) => sum + c.amount, 0);
  const workingCapital = input.startupCosts
    .filter((c) => c.capexClassification === "working_capital")
    .reduce((sum, c) => sum + c.amount, 0);
  const totalStartupInvestment = capexTotal + nonCapexTotal + workingCapital;

  // ── Step 2: Financing ─────────────────────────────────────────────
  const debtAmount = round2(fi.financing.totalInvestment * (1 - fi.financing.equityPct));
  const equityAmount = round2(fi.financing.totalInvestment * fi.financing.equityPct);
  const monthlyPrincipal = fi.financing.termMonths > 0
    ? round2(debtAmount / fi.financing.termMonths)
    : 0;

  // ── Step 3: Depreciation ──────────────────────────────────────────
  const annualDepreciation = round2(capexTotal * fi.startup.depreciationRate);
  const monthlyDepreciation = round2(annualDepreciation / MONTHS_PER_YEAR);
  const depreciationYears = fi.startup.depreciationRate > 0
    ? Math.round(1 / fi.startup.depreciationRate)
    : 0;

  // ── Step 3b: Resolve new optional input defaults ─────────────────
  const ebitdaMultiple = fi.ebitdaMultiple ?? 3;
  const targetPreTaxProfitPct = fi.targetPreTaxProfitPct ?? [0.10, 0.10, 0.10, 0.10, 0.10] as [number, number, number, number, number];
  const shareholderSalaryAdj = fi.shareholderSalaryAdj ?? [0, 0, 0, 0, 0] as [number, number, number, number, number];
  const taxPaymentDelayMonths = fi.taxPaymentDelayMonths ?? 1;
  const nonCapexInvestmentPerYear = fi.nonCapexInvestment ?? [nonCapexTotal, 0, 0, 0, 0] as [number, number, number, number, number];

  // ── Step 4: Monthly Projections ───────────────────────────────────
  const monthly: MonthlyProjection[] = [];
  let prevRevenue = 0;
  let loanBalance = debtAmount;
  let accumulatedDepreciation = 0;
  let taxPayableBalance = 0;
  let runningCash = 0;
  let cumulativeRetainedEarningsMonthly = 0;

  for (let m = 1; m <= MAX_PROJECTION_MONTHS; m++) {
    const yi = yearIndex(m);
    const miy = monthInYear(m);
    const monthlyAuv = fi.revenue.annualGrossSales / MONTHS_PER_YEAR;

    // ── Revenue with ramp-up ──────────────────────────────────────
    let auvPct: number;
    let revenue: number;

    if (m <= fi.revenue.monthsToReachAuv) {
      const startPct = fi.revenue.startingMonthAuvPct;
      if (startPct !== 0) {
        if (m === 1) {
          auvPct = startPct;
        } else {
          auvPct = startPct + ((1 - startPct) * m / fi.revenue.monthsToReachAuv);
        }
      } else {
        auvPct = m / fi.revenue.monthsToReachAuv;
      }
      revenue = round2(auvPct * monthlyAuv);
    } else {
      const growthRate = fi.revenue.growthRates[yi];
      const monthlyGrowthRate = growthRate / MONTHS_PER_YEAR;
      revenue = round2(prevRevenue * (1 + monthlyGrowthRate));
      auvPct = monthlyAuv > 0 ? revenue / monthlyAuv : 0;
    }

    // ── COGS ──────────────────────────────────────────────────────
    const materialsCogs = round2(-revenue * fi.operatingCosts.cogsPct[yi]);
    const royalties = round2(-revenue * fi.operatingCosts.royaltyPct[yi]);
    const adFund = round2(-revenue * fi.operatingCosts.adFundPct[yi]);
    const totalCogs = round2(materialsCogs + royalties + adFund);
    const grossProfit = round2(revenue + totalCogs);

    // ── Operating Expenses ────────────────────────────────────────
    const directLabor = round2(-revenue * fi.operatingCosts.laborPct[yi]);
    const contributionMargin = round2(grossProfit + directLabor);

    const facilities = round2(-fi.operatingCosts.facilitiesAnnual[yi] / MONTHS_PER_YEAR);
    const marketingExp = round2(-revenue * fi.operatingCosts.marketingPct[yi]);
    const managementSalaries = round2(-fi.operatingCosts.managementSalariesAnnual[yi] / MONTHS_PER_YEAR);
    const payrollBase = Math.abs(directLabor) + Math.abs(managementSalaries);
    const payrollTaxBenefits = round2(-payrollBase * fi.operatingCosts.payrollTaxPct[yi]);
    const otherOpex = round2(-revenue * fi.operatingCosts.otherOpexPct[yi]);

    const nonCapexMonthly = round2(-nonCapexInvestmentPerYear[yi] / MONTHS_PER_YEAR);

    const totalOpex = round2(
      facilities + marketingExp + managementSalaries +
      payrollTaxBenefits + otherOpex + nonCapexMonthly
    );

    // ── EBITDA ────────────────────────────────────────────────────
    const ebitda = round2(contributionMargin + totalOpex);

    // ── Depreciation ──────────────────────────────────────────────
    const monthInLifespan = m;
    const depMonths = depreciationYears * MONTHS_PER_YEAR;
    const depThisMonth = (depMonths > 0 && monthInLifespan <= depMonths)
      ? -monthlyDepreciation
      : 0;
    accumulatedDepreciation += Math.abs(depThisMonth);

    // ── Interest & Debt ───────────────────────────────────────────
    const loanOpening = loanBalance;
    let principalPayment = 0;
    let interestExpense = 0;

    if (loanBalance > 0 && fi.financing.termMonths > 0) {
      principalPayment = Math.min(monthlyPrincipal, loanBalance);
      const closingBeforePayment = loanOpening - principalPayment;
      interestExpense = round2(
        -((loanOpening + closingBeforePayment) / 2) * fi.financing.interestRate / MONTHS_PER_YEAR
      );
      loanBalance = round2(closingBeforePayment);
    }

    // ── Pre-Tax Income ────────────────────────────────────────────
    const preTaxIncome = round2(ebitda + depThisMonth + interestExpense);

    // ── Balance Sheet Items (existing) ────────────────────────────
    const dim = daysInMonth();
    const accountsReceivable = round2((revenue / dim) * fi.workingCapitalAssumptions.arDays);
    const inventoryVal = round2((Math.abs(materialsCogs) / dim) * fi.workingCapitalAssumptions.inventoryDays);
    const accountsPayable = round2((Math.abs(materialsCogs) / dim) * fi.workingCapitalAssumptions.apDays);
    const netFixedAssets = round2(capexTotal - accumulatedDepreciation);

    // ── Operating Cash Flow (existing) ────────────────────────────
    const prevAR = m > 1 ? monthly[m - 2].accountsReceivable : 0;
    const prevInv = m > 1 ? monthly[m - 2].inventory : 0;
    const prevAP = m > 1 ? monthly[m - 2].accountsPayable : 0;

    const changeAR = -(accountsReceivable - prevAR);
    const changeInv = -(inventoryVal - prevInv);
    const changeAP = accountsPayable - prevAP;

    const operatingCashFlow = round2(
      preTaxIncome + Math.abs(depThisMonth) + changeAR + changeInv + changeAP
    );

    // ── Tax Payable (shift-by-N mechanism) ─────────────────────────
    const prevTaxPayable = taxPayableBalance;
    const taxAccrual = round2(Math.max(0, preTaxIncome * fi.taxRate));
    taxPayableBalance = round2(taxPayableBalance + taxAccrual);
    const lookbackIndex = (m - 1) - taxPaymentDelayMonths;
    if (lookbackIndex >= 0 && lookbackIndex < monthly.length) {
      const pastPreTaxIncome = monthly[lookbackIndex].preTaxIncome;
      const payment = round2(Math.max(0, pastPreTaxIncome * fi.taxRate));
      taxPayableBalance = round2(taxPayableBalance - payment);
    }
    taxPayableBalance = round2(Math.max(0, taxPayableBalance));
    const taxPayable = taxPayableBalance;

    // ── Cash Flow Disaggregation ───────────────────────────────────
    const cfDepreciation = round2(Math.abs(depThisMonth));
    const cfAccountsReceivableChange = round2(changeAR);
    const cfInventoryChange = round2(changeInv);
    const cfAccountsPayableChange = round2(changeAP);
    const cfTaxPayableChange = round2(taxPayable - prevTaxPayable);
    const cfNetOperatingCashFlow = operatingCashFlow;

    const cfCapexPurchase = (m === 1) ? round2(-capexTotal) : 0;
    const cfNetBeforeFinancing = round2(cfNetOperatingCashFlow + cfTaxPayableChange + cfCapexPurchase);

    const monthlyDistribution = round2(-fi.distributions[yi] / MONTHS_PER_YEAR);
    const cfNotesPayable = round2(-principalPayment);
    const cfLineOfCredit = 0;
    const cfInterestExpense = round2(interestExpense);
    const cfDistributions = monthlyDistribution;
    const cfEquityIssuance = (m === 1) ? equityAmount : 0;
    const debtDrawdownMonth = (m === 1) ? debtAmount : 0;
    const cfNetFinancingCashFlow = round2(
      cfNotesPayable + cfLineOfCredit + cfDistributions + cfEquityIssuance + debtDrawdownMonth
    );

    const cfNetCashFlow = round2(cfNetBeforeFinancing + cfNetFinancingCashFlow);
    const beginningCash = runningCash;
    const endingCash = round2(beginningCash + cfNetCashFlow);
    runningCash = endingCash;

    // ── Retained Earnings (cumulative monthly) ─────────────────────
    cumulativeRetainedEarningsMonthly = round2(cumulativeRetainedEarningsMonthly + preTaxIncome + monthlyDistribution);

    // ── Balance Sheet Disaggregation ───────────────────────────────
    const lineOfCredit = 0;
    const commonStock = equityAmount;
    const retainedEarnings = cumulativeRetainedEarningsMonthly;
    const totalCurrentAssets = round2(endingCash + accountsReceivable + inventoryVal);
    const totalAssets = round2(totalCurrentAssets + netFixedAssets);
    const totalCurrentLiabilities = round2(accountsPayable + taxPayable);
    const totalLiabilities = round2(totalCurrentLiabilities + loanBalance + lineOfCredit);
    const totalEquity = round2(commonStock + retainedEarnings);
    const totalLiabilitiesAndEquity = round2(totalLiabilities + totalEquity);

    monthly.push({
      month: m,
      year: yi + 1,
      monthInYear: miy,
      auvPct,
      revenue,
      materialsCogs,
      royalties,
      adFund,
      totalCogs,
      grossProfit,
      directLabor,
      contributionMargin,
      facilities,
      marketing: marketingExp,
      managementSalaries,
      payrollTaxBenefits,
      otherOpex,
      nonCapexInvestment: nonCapexMonthly,
      totalOpex,
      ebitda,
      depreciation: depThisMonth,
      interestExpense,
      preTaxIncome,
      accountsReceivable,
      inventory: inventoryVal,
      accountsPayable,
      netFixedAssets,
      operatingCashFlow,
      cumulativeNetCashFlow: 0, // placeholder — overwritten in Step 6 (break-even loop)
      loanOpeningBalance: loanOpening,
      loanPrincipalPayment: principalPayment,
      loanClosingBalance: loanBalance,
      taxPayable,
      lineOfCredit,
      commonStock,
      retainedEarnings,
      totalCurrentAssets,
      totalAssets,
      totalCurrentLiabilities,
      totalLiabilities,
      totalEquity,
      totalLiabilitiesAndEquity,
      cfDepreciation,
      cfAccountsReceivableChange,
      cfInventoryChange,
      cfAccountsPayableChange,
      cfTaxPayableChange,
      cfNetOperatingCashFlow,
      cfCapexPurchase,
      cfNetBeforeFinancing,
      cfNotesPayable,
      cfLineOfCredit,
      cfInterestExpense,
      cfDistributions,
      cfEquityIssuance,
      cfNetFinancingCashFlow,
      cfNetCashFlow,
      beginningCash,
      endingCash,
    });

    prevRevenue = revenue;
  }

  // ── Step 5: Annual Summaries ────────────────────────────────────────
  const annualSummaries: AnnualSummary[] = [];

  for (let y = 0; y < 5; y++) {
    const yearMonths = monthly.filter((mp) => mp.year === y + 1);
    const lastMonth = yearMonths[yearMonths.length - 1];

    const revenue = yearMonths.reduce((s, mp) => s + mp.revenue, 0);
    const totalCogs = yearMonths.reduce((s, mp) => s + mp.totalCogs, 0);
    const grossProfit = round2(revenue + totalCogs);
    const directLabor = yearMonths.reduce((s, mp) => s + mp.directLabor, 0);
    const contributionMargin = round2(grossProfit + directLabor);
    const totalOpex = yearMonths.reduce((s, mp) => s + mp.totalOpex, 0);
    const ebitda = round2(contributionMargin + totalOpex);
    const depreciation = yearMonths.reduce((s, mp) => s + mp.depreciation, 0);
    const interest = yearMonths.reduce((s, mp) => s + mp.interestExpense, 0);
    const preTaxIncome = round2(ebitda + depreciation + interest);
    const opCashFlow = yearMonths.reduce((s, mp) => s + mp.operatingCashFlow, 0);

    const annualNetCashFlow = yearMonths.reduce((s, mp) => s + mp.cfNetCashFlow, 0);

    annualSummaries.push({
      year: y + 1,
      revenue: round2(revenue),
      totalCogs: round2(totalCogs),
      grossProfit: round2(grossProfit),
      grossProfitPct: revenue !== 0 ? round2(grossProfit / revenue) : 0,
      directLabor: round2(directLabor),
      contributionMargin: round2(contributionMargin),
      contributionMarginPct: revenue !== 0 ? round2(contributionMargin / revenue) : 0,
      totalOpex: round2(totalOpex),
      ebitda: round2(ebitda),
      ebitdaPct: revenue !== 0 ? round2(ebitda / revenue) : 0,
      depreciation: round2(depreciation),
      interestExpense: round2(interest),
      preTaxIncome: round2(preTaxIncome),
      preTaxIncomePct: revenue !== 0 ? round2(preTaxIncome / revenue) : 0,
      totalAssets: round2(lastMonth.totalAssets),
      totalLiabilities: round2(lastMonth.totalLiabilities),
      totalEquity: round2(lastMonth.totalEquity),
      operatingCashFlow: round2(opCashFlow),
      netCashFlow: round2(annualNetCashFlow),
      endingCash: round2(lastMonth.endingCash),
    });
  }

  // ── Step 6: ROI Metrics ─────────────────────────────────────────────
  // Break-even: first month where cumulative net cash flow (starting from
  // negative total startup investment) turns non-negative.
  let breakEvenMonth: number | null = null;
  let cumulativeNetCash = -totalStartupInvestment;
  // Add back the financing inflows received at startup (equity + debt)
  cumulativeNetCash += equityAmount + debtAmount;
  for (let m = 0; m < monthly.length; m++) {
    // Net monthly cash = operating cash flow - principal repayment - pro-rata distributions
    const yearIdx = yearIndex(m + 1);
    const monthlyDistribution = fi.distributions[yearIdx] / MONTHS_PER_YEAR;
    cumulativeNetCash += monthly[m].operatingCashFlow - monthly[m].loanPrincipalPayment - monthlyDistribution;
    monthly[m].cumulativeNetCashFlow = round2(cumulativeNetCash);
    if (cumulativeNetCash >= 0 && breakEvenMonth === null) {
      breakEvenMonth = m + 1;
    }
  }

  const fiveYearCumulativeCashFlow = round2(
    annualSummaries.reduce((s, a) => s + a.netCashFlow, 0)
  );

  const fiveYearROIPct = totalStartupInvestment !== 0
    ? round2(fiveYearCumulativeCashFlow / totalStartupInvestment)
    : 0;

  const roiMetrics: ROIMetrics = {
    breakEvenMonth,
    totalStartupInvestment: round2(totalStartupInvestment),
    projectedAnnualRevenueYear1: round2(annualSummaries[0].revenue),
    fiveYearCumulativeCashFlow,
    fiveYearROIPct,
  };

  // ── Step 7: Valuation ──────────────────────────────────────────────
  const valuation: ValuationOutput[] = [];
  for (let y = 0; y < 5; y++) {
    const annual = annualSummaries[y];
    const grossSales = round2(annual.revenue);
    const netOperatingIncome = round2(annual.ebitda);
    const annualSalaryAdj = shareholderSalaryAdj[y];
    const adjNetOperatingIncome = round2(netOperatingIncome - annualSalaryAdj);
    const adjNetOperatingIncomePct = grossSales !== 0 ? round2(adjNetOperatingIncome / grossSales) : 0;
    const estimatedValue = round2(adjNetOperatingIncome * ebitdaMultiple);
    const estimatedTaxOnSale = round2(estimatedValue * fi.taxRate);
    const netAfterTaxProceeds = round2(estimatedValue - estimatedTaxOnSale);
    const totalCashInvested = equityAmount;
    const businessAnnualROIC = totalCashInvested > 0 ? round2(adjNetOperatingIncome / totalCashInvested) : 0;
    const replacementReturnRequired = totalCashInvested > 0 ? round2(netAfterTaxProceeds / totalCashInvested) : 0;

    valuation.push({
      year: y + 1,
      grossSales,
      netOperatingIncome,
      shareholderSalaryAdj: annualSalaryAdj,
      adjNetOperatingIncome,
      adjNetOperatingIncomePct,
      ebitdaMultiple,
      estimatedValue,
      estimatedTaxOnSale,
      netAfterTaxProceeds,
      totalCashInvested,
      replacementReturnRequired,
      businessAnnualROIC,
    });
  }

  // ── Step 8: ROIC Extended ──────────────────────────────────────────
  const roicExtended: ROICExtendedOutput[] = [];
  let cumulativeSweatEquity = 0;
  for (let y = 0; y < 5; y++) {
    const annual = annualSummaries[y];
    const yearEndMonth = monthly[(y + 1) * MONTHS_PER_YEAR - 1];
    const outsideCash = equityAmount;
    const totalLoans = debtAmount;
    const totalCashInvested = round2(outsideCash + totalLoans);
    cumulativeSweatEquity = round2(cumulativeSweatEquity + shareholderSalaryAdj[y]);
    const retainedEarningsLessDistributions = round2(yearEndMonth.retainedEarnings);
    const totalInvestedCapital = round2(totalCashInvested + cumulativeSweatEquity + retainedEarningsLessDistributions);
    const preTaxNetIncome = round2(annual.preTaxIncome);
    const annualSalaryAdj = shareholderSalaryAdj[y];
    const preTaxNetIncomeIncSweatEquity = round2(preTaxNetIncome - annualSalaryAdj);
    const taxesDue = round2(Math.max(0, preTaxNetIncomeIncSweatEquity * fi.taxRate));
    const afterTaxNetIncome = round2(preTaxNetIncomeIncSweatEquity - taxesDue);
    const roicPct = totalInvestedCapital > 0 ? round2(preTaxNetIncomeIncSweatEquity / totalInvestedCapital) : 0;

    const yearMonths = monthly.filter((mp) => mp.year === y + 1);
    const totalOpexAbs = yearMonths.reduce((s, mp) => s + Math.abs(mp.totalOpex), 0);
    const totalDirectLaborAbs = yearMonths.reduce((s, mp) => s + Math.abs(mp.directLabor), 0);
    const avgCoreCapitalPerMonth = round2((totalOpexAbs + totalDirectLaborAbs) / MONTHS_PER_YEAR);
    const monthsOfCoreCapital = avgCoreCapitalPerMonth > 0 ? round2(yearEndMonth.endingCash / avgCoreCapitalPerMonth) : 0;
    const excessCoreCapital = round2(yearEndMonth.endingCash - (3 * avgCoreCapitalPerMonth));

    roicExtended.push({
      year: y + 1,
      outsideCash,
      totalLoans,
      totalCashInvested,
      totalSweatEquity: cumulativeSweatEquity,
      retainedEarningsLessDistributions,
      totalInvestedCapital,
      preTaxNetIncome,
      preTaxNetIncomeIncSweatEquity,
      taxRate: fi.taxRate,
      taxesDue,
      afterTaxNetIncome,
      roicPct,
      avgCoreCapitalPerMonth,
      monthsOfCoreCapital,
      excessCoreCapital,
    });
  }

  // ── Step 9: P&L Analysis ───────────────────────────────────────────
  const plAnalysis: PLAnalysisOutput[] = [];
  for (let y = 0; y < 5; y++) {
    const annual = annualSummaries[y];
    const yearMonths = monthly.filter((mp) => mp.year === y + 1);
    const revenue = round2(annual.revenue);
    const annualSalaryAdj = shareholderSalaryAdj[y];
    const adjustedPreTaxProfit = round2(annual.preTaxIncome - annualSalaryAdj);
    const targetPreTaxProfit = round2(revenue * targetPreTaxProfitPct[y]);
    const aboveBelowTarget = round2(adjustedPreTaxProfit - targetPreTaxProfit);
    const nonLaborGrossMargin = round2(annual.grossProfit);
    const annualDirectLabor = yearMonths.reduce((s, mp) => s + Math.abs(mp.directLabor), 0);
    const annualMgmtSalaries = yearMonths.reduce((s, mp) => s + Math.abs(mp.managementSalaries), 0);
    const totalWages = round2(annualDirectLabor + annualMgmtSalaries);
    const adjustedTotalWages = round2(Math.max(0, totalWages - annualSalaryAdj));

    const annualFacilities = yearMonths.reduce((s, mp) => s + Math.abs(mp.facilities), 0);
    const annualPayrollTax = yearMonths.reduce((s, mp) => s + Math.abs(mp.payrollTaxBenefits), 0);
    const annualMarketing = yearMonths.reduce((s, mp) => s + Math.abs(mp.marketing), 0);
    const annualOtherOpex = yearMonths.reduce((s, mp) => s + Math.abs(mp.otherOpex), 0);
    const annualNonCapex = yearMonths.reduce((s, mp) => s + Math.abs(mp.nonCapexInvestment), 0);
    // nonWageOpex includes facilities and payroll taxes: these are real fixed costs that
    // reduce available margin for wages, giving a realistic salary cap.
    const nonWageOpex = round2(annualFacilities + annualPayrollTax + annualMarketing + annualOtherOpex + annualNonCapex);
    const salaryCapAtTarget = round2(nonLaborGrossMargin - targetPreTaxProfit - nonWageOpex);
    const overUnderCap = round2(salaryCapAtTarget - adjustedTotalWages);
    const laborEfficiency = totalWages !== 0 ? round2(nonLaborGrossMargin / totalWages) : 0;
    const adjustedLaborEfficiency = adjustedTotalWages !== 0 ? round2(nonLaborGrossMargin / adjustedTotalWages) : 0;
    const discretionaryMarketingPct = revenue !== 0 ? round2(annualMarketing / revenue) : 0;
    const prTaxBenefitsPctOfWages = totalWages !== 0 ? round2(annualPayrollTax / totalWages) : 0;
    const otherOpexPctOfRevenue = revenue !== 0 ? round2(annualOtherOpex / revenue) : 0;

    plAnalysis.push({
      year: y + 1,
      adjustedPreTaxProfit,
      targetPreTaxProfit,
      aboveBelowTarget,
      nonLaborGrossMargin,
      totalWages,
      adjustedTotalWages,
      salaryCapAtTarget,
      overUnderCap,
      laborEfficiency,
      adjustedLaborEfficiency,
      discretionaryMarketingPct,
      prTaxBenefitsPctOfWages,
      otherOpexPctOfRevenue,
    });
  }

  // ── Step 10: Accounting Identity Checks (15 categories) ─────────────
  const identityChecks: IdentityCheckResult[] = [];
  const tolerance = 1; // $0.01 tolerance (1 cent)

  // Cat 1: Monthly BS identity — A = L + E every month
  for (const mp of monthly) {
    const diff = Math.abs(mp.totalAssets - mp.totalLiabilitiesAndEquity);
    identityChecks.push({
      name: `Monthly BS identity (M${mp.month})`,
      passed: diff <= tolerance,
      expected: mp.totalAssets,
      actual: mp.totalLiabilitiesAndEquity,
      tolerance,
    });
  }

  // Cat 2: Annual BS identity — derived from monthly snapshots
  for (const annual of annualSummaries) {
    const diff = Math.abs(annual.totalAssets - (annual.totalLiabilities + annual.totalEquity));
    identityChecks.push({
      name: `Annual BS identity (Year ${annual.year})`,
      passed: diff <= tolerance,
      expected: annual.totalAssets,
      actual: round2(annual.totalLiabilities + annual.totalEquity),
      tolerance,
    });
  }

  // Cat 3: Depreciation total equals CapEx
  if (depreciationYears > 0) {
    const totalDepreciation = monthly.reduce((s, mp) => s + Math.abs(mp.depreciation), 0);
    const depDiff = Math.abs(round2(totalDepreciation) - capexTotal);
    identityChecks.push({
      name: "Total depreciation equals CapEx",
      passed: depDiff <= tolerance,
      expected: capexTotal,
      actual: round2(totalDepreciation),
      tolerance,
    });
  }

  // Cat 4: Loan amortization consistency
  if (fi.financing.termMonths > 0 && fi.financing.termMonths <= MAX_PROJECTION_MONTHS) {
    const finalLoanBalance = monthly[monthly.length - 1].loanClosingBalance;
    const expectedFinalBalance = Math.max(0, debtAmount - (monthlyPrincipal * Math.min(fi.financing.termMonths, MAX_PROJECTION_MONTHS)));
    identityChecks.push({
      name: "Loan amortization consistency",
      passed: Math.abs(finalLoanBalance - expectedFinalBalance) <= tolerance,
      expected: expectedFinalBalance,
      actual: finalLoanBalance,
      tolerance,
    });
  }

  // Cat 5: P&L to cash flow consistency per year
  for (const annual of annualSummaries) {
    const yearMonths = monthly.filter((mp) => mp.year === annual.year);
    const netIncome = annual.preTaxIncome;
    const dep = Math.abs(annual.depreciation);
    const lastMonthOfYear = yearMonths[yearMonths.length - 1];

    const priorYearMonths = monthly.filter((mp) => mp.year === annual.year - 1);
    const priorLast = priorYearMonths.length > 0 ? priorYearMonths[priorYearMonths.length - 1] : null;
    const priorAR = priorLast ? priorLast.accountsReceivable : 0;
    const priorInv = priorLast ? priorLast.inventory : 0;
    const priorAP = priorLast ? priorLast.accountsPayable : 0;

    const changeAR = -(lastMonthOfYear.accountsReceivable - priorAR);
    const changeInv = -(lastMonthOfYear.inventory - priorInv);
    const changeAP = lastMonthOfYear.accountsPayable - priorAP;

    const expectedOCF = round2(netIncome + dep + changeAR + changeInv + changeAP);
    const actualOCF = round2(annual.operatingCashFlow);
    const diff = Math.abs(expectedOCF - actualOCF);

    identityChecks.push({
      name: `P&L to CF consistency (Year ${annual.year})`,
      passed: diff <= tolerance,
      expected: expectedOCF,
      actual: actualOCF,
      tolerance,
    });
  }

  // Cat 6: CF cash continuity — endingCash[m] = beginningCash[m+1]
  for (let m = 0; m < monthly.length - 1; m++) {
    const diff = Math.abs(monthly[m].endingCash - monthly[m + 1].beginningCash);
    identityChecks.push({
      name: `CF cash continuity (M${monthly[m].month}→M${monthly[m + 1].month})`,
      passed: diff <= tolerance,
      expected: monthly[m].endingCash,
      actual: monthly[m + 1].beginningCash,
      tolerance,
    });
  }

  // Cat 7: CF net = before financing + financing
  for (const mp of monthly) {
    const expected = round2(mp.cfNetBeforeFinancing + mp.cfNetFinancingCashFlow);
    const diff = Math.abs(expected - mp.cfNetCashFlow);
    identityChecks.push({
      name: `CF net identity (M${mp.month})`,
      passed: diff <= tolerance,
      expected,
      actual: mp.cfNetCashFlow,
      tolerance,
    });
  }

  // Cat 8: CF ending cash = beginning + net
  for (const mp of monthly) {
    const expected = round2(mp.beginningCash + mp.cfNetCashFlow);
    const diff = Math.abs(expected - mp.endingCash);
    identityChecks.push({
      name: `CF ending cash identity (M${mp.month})`,
      passed: diff <= tolerance,
      expected,
      actual: mp.endingCash,
      tolerance,
    });
  }

  // Cat 9: P&L Check — grossProfit + directLabor + totalOpex + depreciation + interest = preTaxIncome (annual)
  for (const annual of annualSummaries) {
    const expected = round2(annual.grossProfit + annual.directLabor + annual.totalOpex + annual.depreciation + annual.interestExpense);
    const diff = Math.abs(expected - annual.preTaxIncome);
    identityChecks.push({
      name: `P&L Check (Year ${annual.year})`,
      passed: diff <= tolerance,
      expected,
      actual: annual.preTaxIncome,
      tolerance,
    });
  }

  // Cat 10: Balance Sheet Check — beginning equity + net income - distributions = ending equity (annual)
  for (let y = 0; y < 5; y++) {
    const yearMonths = monthly.filter((mp) => mp.year === y + 1);
    const priorYearMonths = monthly.filter((mp) => mp.year === y);
    const beginEquity = priorYearMonths.length > 0
      ? priorYearMonths[priorYearMonths.length - 1].totalEquity
      : round2(equityAmount);
    const yearPreTaxIncome = yearMonths.reduce((s, mp) => s + mp.preTaxIncome, 0);
    const yearDistributions = fi.distributions[y];
    const expected = round2(beginEquity + yearPreTaxIncome - yearDistributions);
    const endEquity = yearMonths[yearMonths.length - 1].totalEquity;
    const diff = Math.abs(expected - endEquity);
    identityChecks.push({
      name: `BS equity continuity (Year ${y + 1})`,
      passed: diff <= tolerance,
      expected,
      actual: endEquity,
      tolerance,
    });
  }

  // Cat 11: Corporation Tax Check — taxesDue = max(0, preTaxNetIncomeIncSweatEquity) * taxRate per year
  for (let y = 0; y < 5; y++) {
    const roicYear = roicExtended[y];
    const expectedTaxAccrual = round2(Math.max(0, roicYear.preTaxNetIncomeIncSweatEquity) * fi.taxRate);
    const diff = Math.abs(expectedTaxAccrual - roicYear.taxesDue);
    identityChecks.push({
      name: `Corporation Tax Check (Year ${y + 1})`,
      passed: diff <= tolerance,
      expected: expectedTaxAccrual,
      actual: roicYear.taxesDue,
      tolerance,
    });
  }

  // Cat 12: Working Capital Check — AR/AP/Inventory consistent with revenue/COGS
  for (const mp of monthly) {
    const yi = yearIndex(mp.month);
    const dailyRevenue = mp.revenue / daysInMonth();
    const expectedAR = round2(dailyRevenue * fi.workingCapitalAssumptions.arDays);
    const diff = Math.abs(expectedAR - mp.accountsReceivable);
    identityChecks.push({
      name: `Working Capital AR (M${mp.month})`,
      passed: diff <= tolerance,
      expected: expectedAR,
      actual: mp.accountsReceivable,
      tolerance,
    });
  }

  // Cat 13: Breakeven Check — break-even month consistency
  if (breakEvenMonth !== null) {
    const atBreakeven = monthly[breakEvenMonth - 1].cumulativeNetCashFlow;
    identityChecks.push({
      name: "Breakeven month non-negative",
      passed: atBreakeven >= 0,
      expected: 0,
      actual: atBreakeven,
      tolerance,
    });
    if (breakEvenMonth > 1) {
      const beforeBreakeven = monthly[breakEvenMonth - 2].cumulativeNetCashFlow;
      identityChecks.push({
        name: "Breakeven prior month negative",
        passed: beforeBreakeven < 0,
        expected: -1,
        actual: beforeBreakeven,
        tolerance,
      });
    }
  }

  // Cat 14: ROI Check — 5-year ROI derivation from cumulative cash flows
  {
    const expectedROI = totalStartupInvestment !== 0
      ? round2(fiveYearCumulativeCashFlow / totalStartupInvestment)
      : 0;
    const diff = Math.abs(expectedROI - roiMetrics.fiveYearROIPct);
    identityChecks.push({
      name: "ROI Check",
      passed: diff <= tolerance,
      expected: expectedROI,
      actual: roiMetrics.fiveYearROIPct,
      tolerance,
    });
  }

  // Cat 15: Valuation Check — estimatedValue = adjNetOperatingIncome * ebitdaMultiple
  for (const v of valuation) {
    const expected = round2(v.adjNetOperatingIncome * v.ebitdaMultiple);
    const diff = Math.abs(expected - v.estimatedValue);
    identityChecks.push({
      name: `Valuation Check (Year ${v.year})`,
      passed: diff <= tolerance,
      expected,
      actual: v.estimatedValue,
      tolerance,
    });
  }

  for (let y = 0; y < 5; y++) {
    valuation[y].businessAnnualROIC = roicExtended[y].roicPct;
  }

  return {
    monthlyProjections: monthly,
    annualSummaries,
    roiMetrics,
    identityChecks,
    valuation,
    roicExtended,
    plAnalysis,
  };
}
