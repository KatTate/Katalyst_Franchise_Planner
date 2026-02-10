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
  source: "brand_default" | "user_entry" | "ai_populated";
  brandDefault: number | null;
  item7Range: { min: number; max: number } | null;
  lastModifiedAt: string | null;
  isCustom: boolean;
}

/** Wrapped financial inputs for plan JSONB persistence. Each user-editable field
 *  carries metadata (source, brand default, reset capability). The structure
 *  mirrors BrandParameters categories with camelCase keys. */
export interface PlanFinancialInputs {
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
  /** Corporation tax rate (decimal, e.g. 0.21 = 21%) — TODO: apply to compute after-tax net income */
  taxRate: number;
}

export interface StartupCostLineItem {
  name: string;
  amount: number; // cents
  capexClassification: "capex" | "non_capex" | "working_capital";
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

  // Debt
  loanOpeningBalance: number;
  loanPrincipalPayment: number;
  loanClosingBalance: number;
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

export interface EngineOutput {
  monthlyProjections: MonthlyProjection[];
  annualSummaries: AnnualSummary[];
  roiMetrics: ROIMetrics;
  identityChecks: IdentityCheckResult[];
}

// ─── Helpers ────────────────────────────────────────────────────────────

/** Round to nearest cent, normalizing -0 to 0 */
function roundCents(value: number): number {
  const result = Math.round(value * CENTS_PRECISION) / CENTS_PRECISION;
  return result === 0 ? 0 : result; // normalize -0 to 0
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
  const debtAmount = roundCents(fi.financing.totalInvestment * (1 - fi.financing.equityPct));
  const equityAmount = roundCents(fi.financing.totalInvestment * fi.financing.equityPct);
  const monthlyPrincipal = fi.financing.termMonths > 0
    ? roundCents(debtAmount / fi.financing.termMonths)
    : 0;

  // ── Step 3: Depreciation ──────────────────────────────────────────
  const annualDepreciation = roundCents(capexTotal * fi.startup.depreciationRate);
  const monthlyDepreciation = roundCents(annualDepreciation / MONTHS_PER_YEAR);
  const depreciationYears = fi.startup.depreciationRate > 0
    ? Math.round(1 / fi.startup.depreciationRate)
    : 0;

  // ── Step 4: Monthly Projections ───────────────────────────────────
  const monthly: MonthlyProjection[] = [];
  let prevRevenue = 0;
  let loanBalance = debtAmount;
  let accumulatedDepreciation = 0;

  for (let m = 1; m <= MAX_PROJECTION_MONTHS; m++) {
    const yi = yearIndex(m);
    const miy = monthInYear(m);
    const monthlyAuv = fi.revenue.annualGrossSales / MONTHS_PER_YEAR;

    // ── Revenue with ramp-up ──────────────────────────────────────
    let auvPct: number;
    let revenue: number;

    if (m <= fi.revenue.monthsToReachAuv) {
      // Linear ramp from startingMonthAuvPct to 100% over monthsToReachAuv months
      const startPct = fi.revenue.startingMonthAuvPct;
      if (startPct !== 0) {
        const monthsRemaining = fi.revenue.monthsToReachAuv - m;
        auvPct = startPct + ((1 - startPct) * (fi.revenue.monthsToReachAuv - monthsRemaining) / fi.revenue.monthsToReachAuv);
      } else {
        auvPct = m / fi.revenue.monthsToReachAuv;
      }
      revenue = roundCents(auvPct * monthlyAuv);
    } else {
      // Post-ramp: compound monthly growth
      const growthRate = fi.revenue.growthRates[yi];
      const monthlyGrowthRate = growthRate / MONTHS_PER_YEAR;
      revenue = roundCents(prevRevenue * (1 + monthlyGrowthRate));
      auvPct = monthlyAuv > 0 ? revenue / monthlyAuv : 0;
    }

    // ── COGS ──────────────────────────────────────────────────────
    const materialsCogs = roundCents(-revenue * fi.operatingCosts.cogsPct[yi]);
    const royalties = roundCents(-revenue * fi.operatingCosts.royaltyPct[yi]);
    const adFund = roundCents(-revenue * fi.operatingCosts.adFundPct[yi]);
    const totalCogs = roundCents(materialsCogs + royalties + adFund);
    const grossProfit = roundCents(revenue + totalCogs); // totalCogs is negative

    // ── Operating Expenses ────────────────────────────────────────
    const directLabor = roundCents(-revenue * fi.operatingCosts.laborPct[yi]);
    const contributionMargin = roundCents(grossProfit + directLabor);

    const facilities = roundCents(-fi.operatingCosts.facilitiesAnnual[yi] / MONTHS_PER_YEAR);
    const marketingExp = roundCents(-revenue * fi.operatingCosts.marketingPct[yi]);
    const managementSalaries = roundCents(-fi.operatingCosts.managementSalariesAnnual[yi] / MONTHS_PER_YEAR);
    const payrollBase = Math.abs(directLabor) + Math.abs(managementSalaries);
    const payrollTaxBenefits = roundCents(-payrollBase * fi.operatingCosts.payrollTaxPct[yi]);
    const otherOpex = roundCents(-revenue * fi.operatingCosts.otherOpexPct[yi]);

    // Non-CapEx spread over Year 1 only
    const nonCapexMonthly = (yi === 0)
      ? roundCents(-nonCapexTotal / MONTHS_PER_YEAR)
      : 0;

    const totalOpex = roundCents(
      facilities + marketingExp + managementSalaries +
      payrollTaxBenefits + otherOpex + nonCapexMonthly
    );

    // ── EBITDA ────────────────────────────────────────────────────
    const ebitda = roundCents(contributionMargin + totalOpex);

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
      interestExpense = roundCents(
        -((loanOpening + closingBeforePayment) / 2) * fi.financing.interestRate / MONTHS_PER_YEAR
      );
      loanBalance = roundCents(closingBeforePayment);
    }

    // ── Pre-Tax Income ────────────────────────────────────────────
    const preTaxIncome = roundCents(ebitda + depThisMonth + interestExpense);

    // ── Balance Sheet Items ───────────────────────────────────────
    const dim = daysInMonth();
    const accountsReceivable = roundCents((revenue / dim) * fi.workingCapitalAssumptions.arDays);
    const inventoryVal = roundCents((Math.abs(materialsCogs) / dim) * fi.workingCapitalAssumptions.inventoryDays);
    const accountsPayable = roundCents((Math.abs(materialsCogs) / dim) * fi.workingCapitalAssumptions.apDays);
    const netFixedAssets = roundCents(capexTotal - accumulatedDepreciation);

    // ── Operating Cash Flow ───────────────────────────────────────
    const prevAR = m > 1 ? monthly[m - 2].accountsReceivable : 0;
    const prevInv = m > 1 ? monthly[m - 2].inventory : 0;
    const prevAP = m > 1 ? monthly[m - 2].accountsPayable : 0;

    const changeAR = -(accountsReceivable - prevAR);
    const changeInv = -(inventoryVal - prevInv);
    const changeAP = accountsPayable - prevAP;

    const operatingCashFlow = roundCents(
      preTaxIncome + Math.abs(depThisMonth) + changeAR + changeInv + changeAP
    );

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
      loanOpeningBalance: loanOpening,
      loanPrincipalPayment: principalPayment,
      loanClosingBalance: loanBalance,
    });

    prevRevenue = revenue;
  }

  // ── Step 5: Annual Summaries ────────────────────────────────────────
  const annualSummaries: AnnualSummary[] = [];
  let cumulativeCash = 0;
  let cumulativeRetainedEarnings = 0;

  for (let y = 0; y < 5; y++) {
    const yearMonths = monthly.filter((mp) => mp.year === y + 1);
    const lastMonth = yearMonths[yearMonths.length - 1];

    const revenue = yearMonths.reduce((s, mp) => s + mp.revenue, 0);
    const totalCogs = yearMonths.reduce((s, mp) => s + mp.totalCogs, 0);
    const grossProfit = roundCents(revenue + totalCogs);
    const directLabor = yearMonths.reduce((s, mp) => s + mp.directLabor, 0);
    const contributionMargin = roundCents(grossProfit + directLabor);
    const totalOpex = yearMonths.reduce((s, mp) => s + mp.totalOpex, 0);
    const ebitda = roundCents(contributionMargin + totalOpex);
    const depreciation = yearMonths.reduce((s, mp) => s + mp.depreciation, 0);
    const interest = yearMonths.reduce((s, mp) => s + mp.interestExpense, 0);
    const preTaxIncome = roundCents(ebitda + depreciation + interest);
    const opCashFlow = yearMonths.reduce((s, mp) => s + mp.operatingCashFlow, 0);

    // Financing cash flows for the year
    const capexCF = y === 0 ? -capexTotal : 0;
    const debtDrawdown = y === 0 ? debtAmount : 0;
    const principalRepaid = yearMonths.reduce((s, mp) => s + mp.loanPrincipalPayment, 0);
    const debtRepaymentCF = -principalRepaid; // principal repayment every year including Y1
    const distributions = -fi.distributions[y];
    const equityIssuance = y === 0 ? equityAmount : 0;

    const financingCF = debtDrawdown + debtRepaymentCF + distributions + equityIssuance;
    const cfBeforeFinancing = roundCents(opCashFlow + capexCF);
    const netCashFlow = roundCents(cfBeforeFinancing + financingCF);
    cumulativeCash = roundCents(cumulativeCash + netCashFlow);

    // Retained earnings
    cumulativeRetainedEarnings = roundCents(cumulativeRetainedEarnings + preTaxIncome - fi.distributions[y]);

    // Balance sheet
    const totalCurrentAssets = roundCents(
      cumulativeCash + lastMonth.accountsReceivable + lastMonth.inventory
    );
    const totalAssets = roundCents(totalCurrentAssets + lastMonth.netFixedAssets);
    const totalLiabilities = roundCents(lastMonth.accountsPayable + lastMonth.loanClosingBalance);
    const totalEquity = roundCents(equityAmount + cumulativeRetainedEarnings);

    annualSummaries.push({
      year: y + 1,
      revenue: roundCents(revenue),
      totalCogs: roundCents(totalCogs),
      grossProfit: roundCents(grossProfit),
      grossProfitPct: revenue !== 0 ? roundCents(grossProfit / revenue) : 0,
      directLabor: roundCents(directLabor),
      contributionMargin: roundCents(contributionMargin),
      contributionMarginPct: revenue !== 0 ? roundCents(contributionMargin / revenue) : 0,
      totalOpex: roundCents(totalOpex),
      ebitda: roundCents(ebitda),
      ebitdaPct: revenue !== 0 ? roundCents(ebitda / revenue) : 0,
      depreciation: roundCents(depreciation),
      interestExpense: roundCents(interest),
      preTaxIncome: roundCents(preTaxIncome),
      preTaxIncomePct: revenue !== 0 ? roundCents(preTaxIncome / revenue) : 0,
      totalAssets: roundCents(totalAssets),
      totalLiabilities: roundCents(totalLiabilities),
      totalEquity: roundCents(totalEquity),
      operatingCashFlow: roundCents(opCashFlow),
      netCashFlow: roundCents(netCashFlow),
      endingCash: roundCents(cumulativeCash),
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
    if (cumulativeNetCash >= 0 && breakEvenMonth === null) {
      breakEvenMonth = m + 1;
    }
  }

  const fiveYearCumulativeCashFlow = roundCents(
    annualSummaries.reduce((s, a) => s + a.netCashFlow, 0)
  );

  const fiveYearROIPct = totalStartupInvestment !== 0
    ? roundCents(fiveYearCumulativeCashFlow / totalStartupInvestment)
    : 0;

  const roiMetrics: ROIMetrics = {
    breakEvenMonth,
    totalStartupInvestment: roundCents(totalStartupInvestment),
    fiveYearCumulativeCashFlow,
    fiveYearROIPct,
  };

  // ── Step 7: Accounting Identity Checks ──────────────────────────────
  const identityChecks: IdentityCheckResult[] = [];
  const tolerance = 1; // $0.01 tolerance (1 cent)

  // Check 1: Balance sheet balances for each year
  for (const annual of annualSummaries) {
    const diff = Math.abs(annual.totalAssets - (annual.totalLiabilities + annual.totalEquity));
    identityChecks.push({
      name: `Balance sheet balances (Year ${annual.year})`,
      passed: diff <= tolerance,
      expected: annual.totalAssets,
      actual: roundCents(annual.totalLiabilities + annual.totalEquity),
      tolerance,
    });
  }

  // Check 2: Depreciation total matches CapEx over depreciation period
  if (depreciationYears > 0) {
    const totalDepreciation = monthly.reduce((s, mp) => s + Math.abs(mp.depreciation), 0);
    const expectedDepreciation = capexTotal;
    const depDiff = Math.abs(roundCents(totalDepreciation) - expectedDepreciation);
    identityChecks.push({
      name: "Total depreciation equals CapEx",
      passed: depDiff <= tolerance,
      expected: expectedDepreciation,
      actual: roundCents(totalDepreciation),
      tolerance,
    });
  }

  // Check 3: Loan fully amortized check (within projection window if term <= 60)
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

  // Check 4: P&L to cash flow consistency per year (Net Income + Depreciation + WC changes ≈ Operating CF)
  for (const annual of annualSummaries) {
    const yearMonths = monthly.filter((mp) => mp.year === annual.year);
    const netIncome = annual.preTaxIncome;
    const dep = Math.abs(annual.depreciation);
    const firstMonth = yearMonths[0];
    const lastMonthOfYear = yearMonths[yearMonths.length - 1];

    // Get prior year ending values
    const priorYearMonths = monthly.filter((mp) => mp.year === annual.year - 1);
    const priorLast = priorYearMonths.length > 0 ? priorYearMonths[priorYearMonths.length - 1] : null;
    const priorAR = priorLast ? priorLast.accountsReceivable : 0;
    const priorInv = priorLast ? priorLast.inventory : 0;
    const priorAP = priorLast ? priorLast.accountsPayable : 0;

    const changeAR = -(lastMonthOfYear.accountsReceivable - priorAR);
    const changeInv = -(lastMonthOfYear.inventory - priorInv);
    const changeAP = lastMonthOfYear.accountsPayable - priorAP;

    const expectedOCF = roundCents(netIncome + dep + changeAR + changeInv + changeAP);
    const actualOCF = roundCents(annual.operatingCashFlow);
    const diff = Math.abs(expectedOCF - actualOCF);

    identityChecks.push({
      name: `P&L to cash flow consistency (Year ${annual.year})`,
      passed: diff <= tolerance,
      expected: expectedOCF,
      actual: actualOCF,
      tolerance,
    });
  }

  return {
    monthlyProjections: monthly,
    annualSummaries,
    roiMetrics,
    identityChecks,
  };
}
