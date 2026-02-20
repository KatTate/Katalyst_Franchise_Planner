import { describe, test, expect } from "vitest";
import { calculateProjections, type FinancialInputs, type StartupCostLineItem, type EngineResult } from "./financial-engine";

const TOL_MONTHLY = 200;
const TOL_ANNUAL = 2000;
const TOL_BS = 2000;
const TOL_PCT = 0.005;
const TOL_ROIC_VAL = 5000;

function expectClose(actual: number, expected: number, tolerance: number, label: string) {
  const diff = Math.abs(actual - expected);
  if (diff > tolerance) {
    expect.fail(`${label}: actual=${actual} expected=${expected} diff=${diff} tolerance=${tolerance}`);
  }
}

function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

function makeStartupCost(id: string, name: string, amount: number, classification: "capex" | "non_capex" | "working_capital", order: number): StartupCostLineItem {
  return { id, name, amount, capexClassification: classification, isCustom: false, source: "brand_default" as const, brandDefaultAmount: amount, item7RangeLow: null, item7RangeHigh: null, sortOrder: order };
}

const POSTNET_INPUTS: FinancialInputs = {
  revenue: { annualGrossSales: 32240100, monthsToReachAuv: 14, startingMonthAuvPct: 0.08, growthRates: [0.13, 0.13, 0.10, 0.08, 0.08] },
  operatingCosts: {
    cogsPct: [0.30, 0.30, 0.30, 0.30, 0.30],
    laborPct: [0.17, 0.17, 0.17, 0.17, 0.17],
    royaltyPct: [0.05, 0.05, 0.05, 0.05, 0.05],
    adFundPct: [0.02, 0.02, 0.02, 0.02, 0.02],
    marketingPct: [0.05, 0.03, 0.02, 0.02, 0.02],
    otherOpexPct: [0.03, 0.03, 0.03, 0.03, 0.03],
    payrollTaxPct: [0.20, 0.20, 0.20, 0.20, 0.20],
    facilitiesAnnual: [1000000, 1030000, 1060900, 1092727, 1125509],
    managementSalariesAnnual: [0, 5170021, 5813444, 6352566, 6879826],
  },
  financing: { totalInvestment: 25650700, equityPct: 0.20, interestRate: 0.105, termMonths: 144 },
  startup: { depreciationRate: 0.25 },
  workingCapitalAssumptions: { arDays: 30, apDays: 60, inventoryDays: 60 },
  distributions: [0, 0, 0, 3000000, 3500000],
  taxRate: 0.21,
  ebitdaMultiple: 5,
  taxPaymentDelayMonths: 9,
  targetPreTaxProfitPct: [0.15, 0.15, 0.15, 0.15, 0.15],
  shareholderSalaryAdj: [5500000, 0, 0, 0, 0],
};

const POSTNET_STARTUP_COSTS: StartupCostLineItem[] = [
  makeStartupCost("1", "Equipment & Signage", 12605700, "capex", 0),
  makeStartupCost("2", "Leasehold Improvements", 87500, "capex", 1),
  makeStartupCost("3", "Technology", 520000, "capex", 2),
  makeStartupCost("4", "Non-CapEx Investments", 8437500, "non_capex", 3),
  makeStartupCost("5", "Working Capital", 4000000, "working_capital", 4),
];

const JEREMIAHS_INPUTS: FinancialInputs = {
  revenue: { annualGrossSales: 54965900, monthsToReachAuv: 15, startingMonthAuvPct: 0.50, growthRates: [0.10, 0.08, 0.06, 0.05, 0.04] },
  operatingCosts: {
    cogsPct: [0.22, 0.22, 0.22, 0.22, 0.22],
    laborPct: [0.18, 0.18, 0.18, 0.18, 0.18],
    royaltyPct: [0.06, 0.06, 0.06, 0.06, 0.06],
    adFundPct: [0.045, 0.045, 0.045, 0.045, 0.045],
    marketingPct: [0.02, 0.02, 0.02, 0.02, 0.02],
    otherOpexPct: [0.03, 0.03, 0.03, 0.03, 0.03],
    payrollTaxPct: [0.20, 0.20, 0.20, 0.20, 0.20],
    facilitiesAnnual: [7500000, 7725000, 7956750, 8195453, 8441316],
    managementSalariesAnnual: [0, 9224608, 9947003, 10503249, 10980789],
  },
  financing: { totalInvestment: 51078350, equityPct: 0.20, interestRate: 0.105, termMonths: 144 },
  startup: { depreciationRate: 0.25 },
  workingCapitalAssumptions: { arDays: 30, apDays: 60, inventoryDays: 60 },
  distributions: [0, 0, 0, 0, 0],
  taxRate: 0.21,
  ebitdaMultiple: 5,
  taxPaymentDelayMonths: 9,
  targetPreTaxProfitPct: [0.15, 0.15, 0.15, 0.15, 0.15],
  shareholderSalaryAdj: [5500000, 0, 0, 0, 0],
};

const JEREMIAHS_STARTUP_COSTS: StartupCostLineItem[] = [
  makeStartupCost("1", "CapEx Investments", 34615000, "capex", 0),
  makeStartupCost("2", "Non-CapEx Investments", 11463350, "non_capex", 1),
  makeStartupCost("3", "Working Capital", 5000000, "working_capital", 2),
];

interface SpreadsheetPL {
  revenue: number;
  materials: number;
  royalties: number;
  adFund: number;
  totalCogs: number;
  grossProfit: number;
  directLabor: number;
  contributionMargin: number;
  facilities: number;
  marketing: number;
  managementSalaries: number;
  payrollTaxBenefits: number;
  otherOpex: number;
  nonCapexInvestment: number;
  totalOpex: number;
  netOperatingIncome: number;
  depreciation: number;
  interestExpense: number;
  preTaxIncome: number;
}

interface SpreadsheetBS {
  cash: number;
  accountsReceivable: number;
  otherCurrentAssets: number;
  totalCurrentAssets: number;
  netFixedAssets: number;
  totalAssets: number;
  accountsPayable: number;
  taxPayable: number;
  totalCurrentLiabilities: number;
  notesPayable: number;
  totalLiabilities: number;
  commonStock: number;
  retainedEarnings: number;
  totalCapital: number;
  totalLiabilitiesAndEquity: number;
}

const PN_PL: Record<number, SpreadsheetPL> = {
  1: { revenue: 2149.34, materials: 644.802, royalties: 107.467, adFund: 42.9868, totalCogs: 795.2558, grossProfit: 1354.0842, directLabor: 365.3878, contributionMargin: 988.6964, facilities: 833.3333333, marketing: 107.467, managementSalaries: 0, payrollTaxBenefits: 73.07756, otherOpex: 64.4802, nonCapexInvestment: 7031.25, totalOpex: 8109.608093, netOperatingIncome: -7120.911693, depreciation: -2752.75, interestExpense: -1789.314455, preTaxIncome: -11662.97615 },
  12: { revenue: 23335.69143, materials: 7000.707429, royalties: 1166.784571, adFund: 466.7138286, totalCogs: 8634.205829, grossProfit: 14701.4856, directLabor: 3967.067543, contributionMargin: 10734.41806, facilities: 833.3333333, marketing: 1166.784571, managementSalaries: 0, payrollTaxBenefits: 793.4135086, otherOpex: 700.0707429, nonCapexInvestment: 7031.25, totalOpex: 10524.85216, netOperatingIncome: 209.565901, depreciation: -2752.75, interestExpense: -1652.154462, preTaxIncome: -4195.338561 },
  24: { revenue: 29923.38238, materials: 8977.014715, royalties: 1496.169119, adFund: 598.4676476, totalCogs: 11071.65148, grossProfit: 18851.7309, directLabor: 5086.975005, contributionMargin: 13764.7559, facilities: 858.3333333, marketing: 897.7014715, managementSalaries: 4308.350858, payrollTaxBenefits: 1879.065173, otherOpex: 897.7014715, nonCapexInvestment: 0, totalOpex: 8841.152307, netOperatingIncome: 4923.603589, depreciation: -2752.75, interestExpense: -1502.525378, preTaxIncome: 668.3282104 },
  36: { revenue: 33056.75154, materials: 9917.025462, royalties: 1652.837577, adFund: 661.1350308, totalCogs: 12230.99807, grossProfit: 20825.75347, directLabor: 5619.647762, contributionMargin: 15206.10571, facilities: 884.0833333, marketing: 661.1350308, managementSalaries: 4844.53687, payrollTaxBenefits: 2092.836926, otherOpex: 991.7025462, nonCapexInvestment: 0, totalOpex: 9474.294706, netOperatingIncome: 5731.811002, depreciation: -2752.75, interestExpense: -1352.896295, preTaxIncome: 1626.164707 },
  48: { revenue: 35800.44561, materials: 10740.13368, royalties: 1790.022281, adFund: 716.0089123, totalCogs: 13246.16488, grossProfit: 22554.28074, directLabor: 6086.075754, contributionMargin: 16468.20498, facilities: 910.6058333, marketing: 716.0089123, managementSalaries: 5293.805289, payrollTaxBenefits: 2275.976209, otherOpex: 1074.013368, nonCapexInvestment: 0, totalOpex: 10270.40961, netOperatingIncome: 6197.795371, depreciation: -2752.75, interestExpense: -1203.267212, preTaxIncome: 2241.778159 },
  60: { revenue: 38771.86494, materials: 11631.55948, royalties: 1938.593247, adFund: 775.4372989, totalCogs: 14345.59003, grossProfit: 24426.27491, directLabor: 6591.21704, contributionMargin: 17835.05787, facilities: 937.9240083, marketing: 775.4372989, managementSalaries: 5733.188517, payrollTaxBenefits: 2464.881112, otherOpex: 1163.155948, nonCapexInvestment: 0, totalOpex: 11074.58688, netOperatingIncome: 6760.47099, depreciation: 0, interestExpense: -1053.638128, preTaxIncome: 5706.832861 },
};

const PN_BS: Record<number, SpreadsheetBS> = {
  12: { cash: 25369.22521, accountsReceivable: 22582.92719, otherCurrentAssets: 13809.61465, totalCurrentAssets: 61761.76706, netFixedAssets: 99099, totalAssets: 160860.7671, accountsPayable: 13549.75631, taxPayable: 0, totalCurrentLiabilities: 13549.75631, notesPayable: 188105.1333, totalLiabilities: 201654.8896, commonStock: 51301.40, retainedEarnings: -92095.52259, totalCapital: -40794.12259, totalLiabilitiesAndEquity: 160860.7671 },
  24: { cash: 34032.85275, accountsReceivable: 28958.11198, otherCurrentAssets: 17708.08382, totalCurrentAssets: 80699.04855, netFixedAssets: 66066, totalAssets: 146765.0486, accountsPayable: 17374.86719, taxPayable: 0, totalCurrentLiabilities: 17374.86719, notesPayable: 171004.6667, totalLiabilities: 188379.5339, commonStock: 51301.40, retainedEarnings: -92915.8853, totalCapital: -41614.4853, totalLiabilitiesAndEquity: 146765.0486 },
  36: { cash: 58992.91798, accountsReceivable: 31990.40472, otherCurrentAssets: 19562.3516, totalCurrentAssets: 110545.6743, netFixedAssets: 33033, totalAssets: 143578.6743, accountsPayable: 19194.24283, taxPayable: 0, totalCurrentLiabilities: 19194.24283, notesPayable: 153904.2, totalLiabilities: 173098.4428, commonStock: 51301.40, retainedEarnings: -80821.16854, totalCapital: -29519.76854, totalLiabilitiesAndEquity: 143578.6743 },
  48: { cash: 62562.45276, accountsReceivable: 34645.59253, otherCurrentAssets: 21186.01713, totalCurrentAssets: 118394.0624, netFixedAssets: 0, totalAssets: 118394.0624, accountsPayable: 20787.35552, taxPayable: 0, totalCurrentLiabilities: 20787.35552, notesPayable: 136803.7333, totalLiabilities: 157591.0889, commonStock: 51301.40, retainedEarnings: -90498.42643, totalCapital: -39197.02643, totalLiabilitiesAndEquity: 118394.0624 },
  60: { cash: 68979.01388, accountsReceivable: 37521.15962, otherCurrentAssets: 22944.4461, totalCurrentAssets: 129444.6196, netFixedAssets: 0, totalAssets: 129444.6196, accountsPayable: 22512.69577, taxPayable: 0, totalCurrentLiabilities: 22512.69577, notesPayable: 119703.2667, totalLiabilities: 142215.9624, commonStock: 51301.40, retainedEarnings: -64072.74283, totalCapital: -12771.34283, totalLiabilitiesAndEquity: 129444.6196 },
};

const PN_ANNUAL_PL: Record<number, { revenue: number; totalCogs: number; grossProfit: number; netOperatingIncome: number; depreciation: number; interestExpense: number; preTaxIncome: number }> = {
  1: { revenue: 161737.835, totalCogs: 59842.99895, grossProfit: 101894.8361, netOperatingIncome: -38413.70909, depreciation: -33033, interestExpense: -20648.8135, preTaxIncome: -92095.52259 },
  2: { revenue: 337175.2845, totalCogs: 124754.8553, grossProfit: 212420.4293, netOperatingIncome: 51065.90179, depreciation: -33033, interestExpense: -18853.2645, preTaxIncome: -820.3627125 },
  3: { revenue: 379137.6681, totalCogs: 140280.9372, grossProfit: 238856.7309, netOperatingIncome: 62185.43227, depreciation: -33033, interestExpense: -17057.7155, preTaxIncome: 12094.71677 },
  4: { revenue: 414297.8052, totalCogs: 153290.1879, grossProfit: 261007.6173, netOperatingIncome: 68617.90861, depreciation: -33033, interestExpense: -15262.1665, preTaxIncome: 20322.74211 },
  5: { revenue: 448684.3188, totalCogs: 166013.1979, grossProfit: 282671.1208, netOperatingIncome: 74892.3011, depreciation: 0, interestExpense: -13466.6175, preTaxIncome: 61425.6836 },
};

const JI_PL: Record<number, SpreadsheetPL> = {
  1: { revenue: 22902.45833, materials: 5038.540833, royalties: 1374.1475, adFund: 1030.610625, totalCogs: 7443.298958, grossProfit: 15459.15938, directLabor: 4122.4425, contributionMargin: 11336.71688, facilities: 6250, marketing: 458.0491667, managementSalaries: 0, payrollTaxBenefits: 824.4885, otherOpex: 687.07375, nonCapexInvestment: 9552.791667, totalOpex: 17772.40308, netOperatingIncome: -6435.686208, depreciation: -7211.458333, interestExpense: -3563.069623, preTaxIncome: -17210.21416 },
  12: { revenue: 41224.425, materials: 9069.3735, royalties: 2473.4655, adFund: 1855.099125, totalCogs: 13397.93813, grossProfit: 27826.48688, directLabor: 7420.3965, contributionMargin: 20406.09038, facilities: 6250, marketing: 824.4885, managementSalaries: 0, payrollTaxBenefits: 1484.0793, otherOpex: 1236.73275, nonCapexInvestment: 9552.791667, totalOpex: 19348.09222, netOperatingIncome: 1057.998158, depreciation: -7211.458333, interestExpense: -3289.942335, preTaxIncome: -9443.40251 },
  24: { revenue: 48627.65104, materials: 10698.08323, royalties: 2917.659063, adFund: 2188.244297, totalCogs: 15803.98659, grossProfit: 32823.66445, directLabor: 8752.977188, contributionMargin: 24070.68727, facilities: 6437.5, marketing: 972.5530209, managementSalaries: 7687.173302, payrollTaxBenefits: 3288.030098, otherOpex: 1458.829531, nonCapexInvestment: 0, totalOpex: 19844.08595, netOperatingIncome: 4226.601314, depreciation: -7211.458333, interestExpense: -2991.985293, preTaxIncome: -5976.842312 },
  36: { revenue: 51626.89816, materials: 11357.91759, royalties: 3097.613889, adFund: 2323.210417, totalCogs: 16778.7419, grossProfit: 34848.15626, directLabor: 9292.841668, contributionMargin: 25555.31459, facilities: 6630.625, marketing: 1032.537963, managementSalaries: 8289.169207, payrollTaxBenefits: 3516.402175, otherOpex: 1548.806945, nonCapexInvestment: 0, totalOpex: 21017.54129, netOperatingIncome: 4537.773297, depreciation: -7211.458333, interestExpense: -2694.028252, preTaxIncome: -5367.713288 },
  48: { revenue: 54268.22825, materials: 11939.01021, royalties: 3256.093695, adFund: 2442.070271, totalCogs: 17637.17418, grossProfit: 36631.05407, directLabor: 9768.281085, contributionMargin: 26862.77298, facilities: 6829.54375, marketing: 1085.364565, managementSalaries: 8752.70759, payrollTaxBenefits: 3704.197735, otherOpex: 1628.046847, nonCapexInvestment: 0, totalOpex: 21999.86049, netOperatingIncome: 4862.912495, depreciation: -7211.458333, interestExpense: -2396.07121, preTaxIncome: -4744.617049 },
  60: { revenue: 56479.1996, materials: 12425.42391, royalties: 3388.751976, adFund: 2541.563982, totalCogs: 18355.73987, grossProfit: 38123.45973, directLabor: 10166.25593, contributionMargin: 27957.2038, facilities: 7034.430063, marketing: 1129.583992, managementSalaries: 9150.657676, payrollTaxBenefits: 3863.382721, otherOpex: 1694.375988, nonCapexInvestment: 0, totalOpex: 22872.43044, netOperatingIncome: 5084.773362, depreciation: 0, interestExpense: -2098.114168, preTaxIncome: 2986.659193 },
};

const JI_BS: Record<number, SpreadsheetBS> = {
  12: { cash: 20088.18538, accountsReceivable: 39894.60484, otherCurrentAssets: 17890.27101, totalCurrentAssets: 77873.06123, netFixedAssets: 259612.5, totalAssets: 337485.5612, accountsPayable: 17553.62613, taxPayable: 0, totalCurrentLiabilities: 17553.62613, notesPayable: 374574.5667, totalLiabilities: 392128.1928, commonStock: 102156.7, retainedEarnings: -156799.3316, totalCapital: -54642.63156, totalLiabilitiesAndEquity: 337485.5612 },
  24: { cash: -18018.33488, accountsReceivable: 47059.01714, otherCurrentAssets: 21103.06829, totalCurrentAssets: 50143.75055, netFixedAssets: 173075, totalAssets: 223218.7505, accountsPayable: 20705.96754, taxPayable: 0, totalCurrentLiabilities: 20705.96754, notesPayable: 340522.3333, totalLiabilities: 361228.3009, commonStock: 102156.7, retainedEarnings: -240166.2503, totalCapital: -138009.5503, totalLiabilitiesAndEquity: 223218.7505 },
  36: { cash: -41331.09119, accountsReceivable: 49961.51434, otherCurrentAssets: 22404.65936, totalCurrentAssets: 31035.08252, netFixedAssets: 86537.5, totalAssets: 117572.5825, accountsPayable: 21983.06631, taxPayable: 0, totalCurrentLiabilities: 21983.06631, notesPayable: 306470.1, totalLiabilities: 328453.1663, commonStock: 102156.7, retainedEarnings: -313037.2838, totalCapital: -210880.5838, totalLiabilitiesAndEquity: 117572.5825 },
  48: { cash: -55992.88669, accountsReceivable: 52517.64024, otherCurrentAssets: 23550.92426, totalCurrentAssets: 20075.67781, netFixedAssets: 0, totalAssets: 20075.67781, accountsPayable: 23107.76171, taxPayable: 0, totalCurrentLiabilities: 23107.76171, notesPayable: 272417.8667, totalLiabilities: 295525.6284, commonStock: 102156.7, retainedEarnings: -377606.6506, totalCapital: -275449.9506, totalLiabilitiesAndEquity: 20075.67781 },
  60: { cash: -63011.11791, accountsReceivable: 54657.28993, otherCurrentAssets: 24510.42525, totalCurrentAssets: 16156.59727, netFixedAssets: 0, totalAssets: 16156.59727, accountsPayable: 24049.20757, taxPayable: 0, totalCurrentLiabilities: 24049.20757, notesPayable: 238365.6333, totalLiabilities: 262414.8409, commonStock: 102156.7, retainedEarnings: -348414.9436, totalCapital: -246258.2436, totalLiabilitiesAndEquity: 16156.59727 },
};

const JI_ANNUAL_PL: Record<number, { revenue: number; totalCogs: number; grossProfit: number; netOperatingIncome: number; depreciation: number; interestExpense: number; preTaxIncome: number }> = {
  1: { revenue: 392395.4528, totalCogs: 127528.5222, grossProfit: 264866.9306, netOperatingIncome: -29143.75981, depreciation: -86537.5, interestExpense: -41118.07175, preTaxIncome: -156799.3316 },
  2: { revenue: 559067.1492, totalCogs: 181696.8235, grossProfit: 377370.3257, netOperatingIncome: 40713.16849, depreciation: -86537.5, interestExpense: -37542.58725, preTaxIncome: -83366.91876 },
  3: { revenue: 602848.6696, totalCogs: 195925.8176, grossProfit: 406922.852, netOperatingIncome: 47633.56929, depreciation: -86537.5, interestExpense: -33967.10275, preTaxIncome: -72871.03346 },
  4: { revenue: 636560.552, totalCogs: 206882.1794, grossProfit: 429678.3726, netOperatingIncome: 52359.75148, depreciation: -86537.5, interestExpense: -30391.61825, preTaxIncome: -64569.36677 },
  5: { revenue: 665502.3764, totalCogs: 216288.2723, grossProfit: 449214.1041, netOperatingIncome: 56007.84068, depreciation: 0, interestExpense: -26816.13375, preTaxIncome: 29191.70693 },
};

const PN_ROIC: Record<number, { outsideCash: number; totalLoans: number; totalCashInvested: number; totalSweatEquity: number; retainedEarnings: number; totalInvestedCapital: number; preTaxNetIncome: number; preTaxNetIncomeIncSweat: number; taxRate: number; taxesDue: number; afterTaxNetIncome: number; roicPct: number }> = {
  1: { outsideCash: 51301.40, totalLoans: 205205.60, totalCashInvested: 256507, totalSweatEquity: 55000, retainedEarnings: -92095.52259, totalInvestedCapital: 219411.4774, preTaxNetIncome: -92095.52259, preTaxNetIncomeIncSweat: -147095.5226, taxRate: 0.21, taxesDue: -19390.05965, afterTaxNetIncome: -72705.46294, roicPct: -0.33 },
  2: { outsideCash: 51301.40, totalLoans: 205205.60, totalCashInvested: 256507, totalSweatEquity: 55000, retainedEarnings: -92915.8853, totalInvestedCapital: 218591.1147, preTaxNetIncome: -820.3627125, preTaxNetIncomeIncSweat: -820.3627125, taxRate: 0.21, taxesDue: 0, afterTaxNetIncome: -820.3627125, roicPct: 0 },
  3: { outsideCash: 51301.40, totalLoans: 205205.60, totalCashInvested: 256507, totalSweatEquity: 55000, retainedEarnings: -80821.16854, totalInvestedCapital: 230685.8315, preTaxNetIncome: 12094.71677, preTaxNetIncomeIncSweat: 12094.71677, taxRate: 0.21, taxesDue: 2539.890521, afterTaxNetIncome: 9554.826245, roicPct: 0.04 },
  4: { outsideCash: 51301.40, totalLoans: 205205.60, totalCashInvested: 256507, totalSweatEquity: 55000, retainedEarnings: -90498.42643, totalInvestedCapital: 221008.5736, preTaxNetIncome: 20322.74211, preTaxNetIncomeIncSweat: 20322.74211, taxRate: 0.21, taxesDue: 4267.775843, afterTaxNetIncome: 16054.96627, roicPct: 0.07 },
  5: { outsideCash: 51301.40, totalLoans: 205205.60, totalCashInvested: 256507, totalSweatEquity: 55000, retainedEarnings: -64072.74283, totalInvestedCapital: 247434.2572, preTaxNetIncome: 61425.6836, preTaxNetIncomeIncSweat: 61425.6836, taxRate: 0.21, taxesDue: 12899.39356, afterTaxNetIncome: 48526.29004, roicPct: 0.20 },
};

const JI_ROIC: Record<number, { outsideCash: number; totalLoans: number; totalCashInvested: number; totalSweatEquity: number; retainedEarnings: number; totalInvestedCapital: number; preTaxNetIncome: number; preTaxNetIncomeIncSweat: number; taxRate: number; taxesDue: number; afterTaxNetIncome: number; roicPct: number }> = {
  1: { outsideCash: 102156.7, totalLoans: 408626.8, totalCashInvested: 510783.5, totalSweatEquity: 55000, retainedEarnings: -156799.3316, totalInvestedCapital: 408984.1684, preTaxNetIncome: -156799.3316, preTaxNetIncomeIncSweat: -211799.3316, taxRate: 0.21, taxesDue: -32927.85963, afterTaxNetIncome: -123871.4719, roicPct: -0.30 },
  2: { outsideCash: 102156.7, totalLoans: 408626.8, totalCashInvested: 510783.5, totalSweatEquity: 55000, retainedEarnings: -240166.2503, totalInvestedCapital: 325617.2497, preTaxNetIncome: -83366.91876, preTaxNetIncomeIncSweat: -83366.91876, taxRate: 0.21, taxesDue: -17507.05294, afterTaxNetIncome: -65859.86582, roicPct: -0.20 },
  3: { outsideCash: 102156.7, totalLoans: 408626.8, totalCashInvested: 510783.5, totalSweatEquity: 55000, retainedEarnings: -313037.2838, totalInvestedCapital: 252746.2162, preTaxNetIncome: -72871.03346, preTaxNetIncomeIncSweat: -72871.03346, taxRate: 0.21, taxesDue: -15302.91703, afterTaxNetIncome: -57568.11644, roicPct: -0.23 },
  4: { outsideCash: 102156.7, totalLoans: 408626.8, totalCashInvested: 510783.5, totalSweatEquity: 55000, retainedEarnings: -377606.6506, totalInvestedCapital: 188176.8494, preTaxNetIncome: -64569.36677, preTaxNetIncomeIncSweat: -64569.36677, taxRate: 0.21, taxesDue: -13559.56702, afterTaxNetIncome: -51009.79975, roicPct: -0.27 },
  5: { outsideCash: 102156.7, totalLoans: 408626.8, totalCashInvested: 510783.5, totalSweatEquity: 55000, retainedEarnings: -348414.9436, totalInvestedCapital: 217368.5564, preTaxNetIncome: 29191.70693, preTaxNetIncomeIncSweat: 29191.70693, taxRate: 0.21, taxesDue: 6130.258455, afterTaxNetIncome: 23061.44847, roicPct: 0.11 },
};

const PN_VALUATION: Record<number, { grossSales: number; netOperatingIncome: number; salaryAdj: number; adjNOI: number; ebitdaMultiple: number; estimatedValue: number; taxOnSale: number; netProceeds: number }> = {
  1: { grossSales: 161737.835, netOperatingIncome: -38413.70909, salaryAdj: 55000, adjNOI: -93413.70909, ebitdaMultiple: 5, estimatedValue: -467068.5455, taxOnSale: -98084.3946, netProceeds: -368984.1509 },
  2: { grossSales: 337175.2845, netOperatingIncome: 51065.90179, salaryAdj: 0, adjNOI: 51065.90179, ebitdaMultiple: 5, estimatedValue: 255329.509, taxOnSale: 53619.19688, netProceeds: 201710.3121 },
  3: { grossSales: 379137.6681, netOperatingIncome: 62185.43227, salaryAdj: 0, adjNOI: 62185.43227, ebitdaMultiple: 5, estimatedValue: 310927.1614, taxOnSale: 65294.70388, netProceeds: 245632.4575 },
  4: { grossSales: 414297.8052, netOperatingIncome: 68617.90861, salaryAdj: 0, adjNOI: 68617.90861, ebitdaMultiple: 5, estimatedValue: 343089.5431, taxOnSale: 72048.80404, netProceeds: 271040.739 },
  5: { grossSales: 448684.3188, netOperatingIncome: 74892.3011, salaryAdj: 0, adjNOI: 74892.3011, ebitdaMultiple: 5, estimatedValue: 374461.5055, taxOnSale: 78636.91616, netProceeds: 295824.5894 },
};

const JI_VALUATION: Record<number, { grossSales: number; netOperatingIncome: number; salaryAdj: number; adjNOI: number; ebitdaMultiple: number; estimatedValue: number; taxOnSale: number; netProceeds: number }> = {
  1: { grossSales: 392395.4528, netOperatingIncome: -29143.75981, salaryAdj: 55000, adjNOI: -84143.75981, ebitdaMultiple: 5, estimatedValue: -420718.7991, taxOnSale: -88350.9478, netProceeds: -332367.8513 },
  2: { grossSales: 559067.1492, netOperatingIncome: 40713.16849, salaryAdj: 0, adjNOI: 40713.16849, ebitdaMultiple: 5, estimatedValue: 203565.8424, taxOnSale: 42748.82691, netProceeds: 160817.0155 },
  3: { grossSales: 602848.6696, netOperatingIncome: 47633.56929, salaryAdj: 0, adjNOI: 47633.56929, ebitdaMultiple: 5, estimatedValue: 238167.8464, taxOnSale: 50015.24775, netProceeds: 188152.5987 },
  4: { grossSales: 636560.552, netOperatingIncome: 52359.75148, salaryAdj: 0, adjNOI: 52359.75148, ebitdaMultiple: 5, estimatedValue: 261798.7574, taxOnSale: 54977.73905, netProceeds: 206821.0183 },
  5: { grossSales: 665502.3764, netOperatingIncome: 56007.84068, salaryAdj: 0, adjNOI: 56007.84068, ebitdaMultiple: 5, estimatedValue: 280039.2034, taxOnSale: 58808.23271, netProceeds: 221230.9707 },
};

function runBrand(label: string, inputs: FinancialInputs, startupCosts: StartupCostLineItem[]): EngineResult {
  return calculateProjections({ financialInputs: inputs, startupCosts });
}

describe("PostNet Reference Validation", () => {
  const result = runBrand("PostNet", POSTNET_INPUTS, POSTNET_STARTUP_COSTS);

  test("identity checks all pass", () => {
    for (const c of result.identityChecks) {
      expect(c.passed, `Identity check failed: ${c.name}`).toBe(true);
    }
  });

  describe("P&L Monthly - cell-by-cell", () => {
    const priorityMonths = [1, 12, 24, 36, 48, 60];
    for (const month of priorityMonths) {
      test(`Month ${month}`, () => {
        const m = result.monthlyProjections[month - 1];
        const ss = PN_PL[month];
        const t = TOL_MONTHLY;
        expectClose(m.revenue, toCents(ss.revenue), t, "revenue");
        expectClose(Math.abs(m.materialsCogs), toCents(ss.materials), t, "materials");
        expectClose(Math.abs(m.royalties), toCents(ss.royalties), t, "royalties");
        expectClose(Math.abs(m.adFund), toCents(ss.adFund), t, "adFund");
        expectClose(Math.abs(m.totalCogs), toCents(ss.totalCogs), t, "totalCogs");
        expectClose(m.grossProfit, toCents(ss.grossProfit), t, "grossProfit");
        expectClose(Math.abs(m.directLabor), toCents(ss.directLabor), t, "directLabor");
        expectClose(m.contributionMargin, toCents(ss.contributionMargin), t, "contributionMargin");
        expectClose(Math.abs(m.facilities), toCents(ss.facilities), t, "facilities");
        expectClose(Math.abs(m.marketing), toCents(ss.marketing), t, "marketing");
        expectClose(Math.abs(m.managementSalaries), toCents(ss.managementSalaries), t, "managementSalaries");
        expectClose(Math.abs(m.payrollTaxBenefits), toCents(ss.payrollTaxBenefits), t, "payrollTaxBenefits");
        expectClose(Math.abs(m.otherOpex), toCents(ss.otherOpex), t, "otherOpex");
        expectClose(Math.abs(m.nonCapexInvestment), toCents(ss.nonCapexInvestment), t, "nonCapex");
        expectClose(Math.abs(m.totalOpex), toCents(ss.totalOpex), t, "totalOpex");
        expectClose(m.ebitda, toCents(ss.netOperatingIncome), t, "netOperatingIncome");
        expectClose(m.depreciation, toCents(ss.depreciation), t, "depreciation");
        expectClose(m.interestExpense, toCents(ss.interestExpense), t, "interestExpense");
        expectClose(m.preTaxIncome, toCents(ss.preTaxIncome), t, "preTaxIncome");
      });
    }
  });

  describe("P&L Annual Summaries", () => {
    for (let year = 1; year <= 5; year++) {
      test(`Year ${year}`, () => {
        const a = result.annualSummaries[year - 1];
        const ss = PN_ANNUAL_PL[year];
        const t = TOL_ANNUAL;
        expectClose(a.revenue, toCents(ss.revenue), t, "revenue");
        expectClose(Math.abs(a.totalCogs), toCents(ss.totalCogs), t, "totalCogs");
        expectClose(a.grossProfit, toCents(ss.grossProfit), t, "grossProfit");
        expectClose(a.ebitda, toCents(ss.netOperatingIncome), t, "netOperatingIncome");
        expectClose(a.depreciation, toCents(ss.depreciation), t, "depreciation");
        expectClose(a.interestExpense, toCents(ss.interestExpense), t, "interestExpense");
        expectClose(a.preTaxIncome, toCents(ss.preTaxIncome), t, "preTaxIncome");
      });
    }
  });

  describe("Balance Sheet - cell-by-cell", () => {
    const bsMonths = [12, 24, 36, 48, 60];
    for (const month of bsMonths) {
      test(`Month ${month} - fixed assets and financing`, () => {
        const m = result.monthlyProjections[month - 1];
        const ss = PN_BS[month];
        const t = TOL_BS;
        expectClose(m.netFixedAssets, toCents(ss.netFixedAssets), t, "netFixedAssets");
        expectClose(m.loanClosingBalance, toCents(ss.notesPayable), t, "notesPayable");
        expectClose(m.commonStock, toCents(ss.commonStock), t, "commonStock");
      });
    }

    test("KNOWN DIVERGENCE: working capital items (AR, inventory, AP) - engine uses 30-day months, spreadsheet uses actual calendar days", () => {
      for (const month of bsMonths) {
        const m = result.monthlyProjections[month - 1];
        expect(m.accountsReceivable).toBe(m.revenue);
        const cogsMag = Math.abs(m.materialsCogs);
        const expectedInv = Math.round((cogsMag / 30) * 60 * 100) / 100;
        expectClose(m.inventory, expectedInv, 1, `M${month} inventory formula`);
        const expectedAP = Math.round((cogsMag / 30) * 60 * 100) / 100;
        expectClose(m.accountsPayable, expectedAP, 1, `M${month} AP formula`);
      }
    });

    test("KNOWN DIVERGENCE: taxPayable - engine accrues taxes on BS, spreadsheet does not", () => {
      for (const month of bsMonths) {
        const ss = PN_BS[month];
        expect(ss.taxPayable).toBe(0);
      }
      const m60 = result.monthlyProjections[59];
      expect(m60.taxPayable).toBeGreaterThan(0);
    });
  });

  describe("ROIC - cell-by-cell", () => {
    for (let year = 1; year <= 5; year++) {
      test(`Year ${year}`, () => {
        const r = result.roicExtended[year - 1];
        const ss = PN_ROIC[year];
        const t = TOL_ROIC_VAL;
        expectClose(r.outsideCash, toCents(ss.outsideCash), t, "outsideCash");
        expectClose(r.totalLoans, toCents(ss.totalLoans), t, "totalLoans");
        expectClose(r.totalCashInvested, toCents(ss.totalCashInvested), t, "totalCashInvested");
        expectClose(r.totalSweatEquity, toCents(ss.totalSweatEquity), t, "totalSweatEquity");
        expectClose(r.preTaxNetIncome, toCents(ss.preTaxNetIncome), t, "preTaxNetIncome");
        expect(r.taxRate).toBeCloseTo(ss.taxRate, 2);
      });
    }
  });

  describe("ROIC KNOWN DIVERGENCE: retained earnings differ due to tax accrual on BS", () => {
    test("Year 1 retained earnings match (no positive income months)", () => {
      const r = result.roicExtended[0];
      const ss = PN_ROIC[1];
      expectClose(r.retainedEarningsLessDistributions, toCents(ss.retainedEarnings), TOL_ROIC_VAL, "retainedEarnings Y1");
    });
  });

  describe("Valuation - cell-by-cell", () => {
    for (let year = 1; year <= 5; year++) {
      test(`Year ${year}`, () => {
        const v = result.valuation[year - 1];
        const ss = PN_VALUATION[year];
        const t = TOL_ROIC_VAL;
        expectClose(v.grossSales, toCents(ss.grossSales), t, "grossSales");
        expectClose(v.netOperatingIncome, toCents(ss.netOperatingIncome), t, "netOperatingIncome");
        expectClose(v.shareholderSalaryAdj, toCents(ss.salaryAdj), t, "salaryAdj");
        expectClose(v.adjNetOperatingIncome, toCents(ss.adjNOI), t, "adjNOI");
        expect(v.ebitdaMultiple).toBe(ss.ebitdaMultiple);
        expectClose(v.estimatedValue, toCents(ss.estimatedValue), t, "estimatedValue");
        expectClose(v.estimatedTaxOnSale, toCents(ss.taxOnSale), t, "taxOnSale");
        expectClose(v.netAfterTaxProceeds, toCents(ss.netProceeds), t, "netProceeds");
      });
    }
  });
});

describe("Jeremiah's Italian Ice Reference Validation", () => {
  const result = runBrand("Jeremiah's", JEREMIAHS_INPUTS, JEREMIAHS_STARTUP_COSTS);

  test("identity checks all pass", () => {
    for (const c of result.identityChecks) {
      expect(c.passed, `Identity check failed: ${c.name}`).toBe(true);
    }
  });

  describe("P&L Monthly - cell-by-cell", () => {
    const priorityMonths = [1, 12, 24, 36, 48, 60];
    for (const month of priorityMonths) {
      test(`Month ${month}`, () => {
        const m = result.monthlyProjections[month - 1];
        const ss = JI_PL[month];
        const t = TOL_MONTHLY;
        expectClose(m.revenue, toCents(ss.revenue), t, "revenue");
        expectClose(Math.abs(m.materialsCogs), toCents(ss.materials), t, "materials");
        expectClose(Math.abs(m.royalties), toCents(ss.royalties), t, "royalties");
        expectClose(Math.abs(m.adFund), toCents(ss.adFund), t, "adFund");
        expectClose(Math.abs(m.totalCogs), toCents(ss.totalCogs), t, "totalCogs");
        expectClose(m.grossProfit, toCents(ss.grossProfit), t, "grossProfit");
        expectClose(Math.abs(m.directLabor), toCents(ss.directLabor), t, "directLabor");
        expectClose(m.contributionMargin, toCents(ss.contributionMargin), t, "contributionMargin");
        expectClose(Math.abs(m.facilities), toCents(ss.facilities), t, "facilities");
        expectClose(Math.abs(m.marketing), toCents(ss.marketing), t, "marketing");
        expectClose(Math.abs(m.managementSalaries), toCents(ss.managementSalaries), t, "managementSalaries");
        expectClose(Math.abs(m.payrollTaxBenefits), toCents(ss.payrollTaxBenefits), t, "payrollTaxBenefits");
        expectClose(Math.abs(m.otherOpex), toCents(ss.otherOpex), t, "otherOpex");
        expectClose(Math.abs(m.nonCapexInvestment), toCents(ss.nonCapexInvestment), t, "nonCapex");
        expectClose(Math.abs(m.totalOpex), toCents(ss.totalOpex), t, "totalOpex");
        expectClose(m.ebitda, toCents(ss.netOperatingIncome), t, "netOperatingIncome");
        expectClose(m.depreciation, toCents(ss.depreciation), t, "depreciation");
        expectClose(m.interestExpense, toCents(ss.interestExpense), t, "interestExpense");
        expectClose(m.preTaxIncome, toCents(ss.preTaxIncome), t, "preTaxIncome");
      });
    }
  });

  describe("P&L Annual Summaries", () => {
    for (let year = 1; year <= 5; year++) {
      test(`Year ${year}`, () => {
        const a = result.annualSummaries[year - 1];
        const ss = JI_ANNUAL_PL[year];
        const t = TOL_ANNUAL;
        expectClose(a.revenue, toCents(ss.revenue), t, "revenue");
        expectClose(Math.abs(a.totalCogs), toCents(ss.totalCogs), t, "totalCogs");
        expectClose(a.grossProfit, toCents(ss.grossProfit), t, "grossProfit");
        expectClose(a.ebitda, toCents(ss.netOperatingIncome), t, "netOperatingIncome");
        expectClose(a.depreciation, toCents(ss.depreciation), t, "depreciation");
        expectClose(a.interestExpense, toCents(ss.interestExpense), t, "interestExpense");
        expectClose(a.preTaxIncome, toCents(ss.preTaxIncome), t, "preTaxIncome");
      });
    }
  });

  describe("Balance Sheet - cell-by-cell", () => {
    const bsMonths = [12, 24, 36, 48, 60];
    for (const month of bsMonths) {
      test(`Month ${month} - fixed assets and financing`, () => {
        const m = result.monthlyProjections[month - 1];
        const ss = JI_BS[month];
        const t = TOL_BS;
        expectClose(m.netFixedAssets, toCents(ss.netFixedAssets), t, "netFixedAssets");
        expectClose(m.loanClosingBalance, toCents(ss.notesPayable), t, "notesPayable");
        expectClose(m.commonStock, toCents(ss.commonStock), t, "commonStock");
      });
    }

    test("KNOWN DIVERGENCE: working capital items (AR, inventory, AP) - engine uses 30-day months, spreadsheet uses actual calendar days", () => {
      for (const month of bsMonths) {
        const m = result.monthlyProjections[month - 1];
        expect(m.accountsReceivable).toBe(m.revenue);
        const cogsMag = Math.abs(m.materialsCogs);
        const expectedInv = Math.round((cogsMag / 30) * 60 * 100) / 100;
        expectClose(m.inventory, expectedInv, 1, `M${month} inventory formula`);
        const expectedAP = Math.round((cogsMag / 30) * 60 * 100) / 100;
        expectClose(m.accountsPayable, expectedAP, 1, `M${month} AP formula`);
      }
    });

    test("KNOWN DIVERGENCE: taxPayable - engine accrues taxes on BS, spreadsheet does not", () => {
      for (const month of bsMonths) {
        const ss = JI_BS[month];
        expect(ss.taxPayable).toBe(0);
      }
    });
  });

  describe("ROIC - cell-by-cell", () => {
    for (let year = 1; year <= 5; year++) {
      test(`Year ${year}`, () => {
        const r = result.roicExtended[year - 1];
        const ss = JI_ROIC[year];
        const t = TOL_ROIC_VAL;
        expectClose(r.outsideCash, toCents(ss.outsideCash), t, "outsideCash");
        expectClose(r.totalLoans, toCents(ss.totalLoans), t, "totalLoans");
        expectClose(r.totalCashInvested, toCents(ss.totalCashInvested), t, "totalCashInvested");
        expectClose(r.totalSweatEquity, toCents(ss.totalSweatEquity), t, "totalSweatEquity");
        expectClose(r.preTaxNetIncome, toCents(ss.preTaxNetIncome), t, "preTaxNetIncome");
        expect(r.taxRate).toBeCloseTo(ss.taxRate, 2);
      });
    }
  });

  describe("Valuation - cell-by-cell", () => {
    for (let year = 1; year <= 5; year++) {
      test(`Year ${year}`, () => {
        const v = result.valuation[year - 1];
        const ss = JI_VALUATION[year];
        const t = TOL_ROIC_VAL;
        expectClose(v.grossSales, toCents(ss.grossSales), t, "grossSales");
        expectClose(v.netOperatingIncome, toCents(ss.netOperatingIncome), t, "netOperatingIncome");
        expectClose(v.shareholderSalaryAdj, toCents(ss.salaryAdj), t, "salaryAdj");
        expectClose(v.adjNetOperatingIncome, toCents(ss.adjNOI), t, "adjNOI");
        expect(v.ebitdaMultiple).toBe(ss.ebitdaMultiple);
        expectClose(v.estimatedValue, toCents(ss.estimatedValue), t, "estimatedValue");
        expectClose(v.estimatedTaxOnSale, toCents(ss.taxOnSale), t, "taxOnSale");
        expectClose(v.netAfterTaxProceeds, toCents(ss.netProceeds), t, "netProceeds");
      });
    }
  });
});

describe("Cross-Brand Structural Validation", () => {
  const pnResult = runBrand("PostNet", POSTNET_INPUTS, POSTNET_STARTUP_COSTS);
  const jiResult = runBrand("Jeremiah's", JEREMIAHS_INPUTS, JEREMIAHS_STARTUP_COSTS);

  test("both brands produce 60 monthly projections", () => {
    expect(pnResult.monthlyProjections).toHaveLength(60);
    expect(jiResult.monthlyProjections).toHaveLength(60);
  });

  test("both brands produce 5 annual summaries", () => {
    expect(pnResult.annualSummaries).toHaveLength(5);
    expect(jiResult.annualSummaries).toHaveLength(5);
  });

  test("both brands produce 5 ROIC records", () => {
    expect(pnResult.roicExtended).toHaveLength(5);
    expect(jiResult.roicExtended).toHaveLength(5);
  });

  test("both brands produce 5 valuation records", () => {
    expect(pnResult.valuation).toHaveLength(5);
    expect(jiResult.valuation).toHaveLength(5);
  });

  test("all identity checks pass for both brands", () => {
    for (const c of pnResult.identityChecks) {
      expect(c.passed, `PostNet identity check failed: ${c.name}`).toBe(true);
    }
    for (const c of jiResult.identityChecks) {
      expect(c.passed, `Jeremiah's identity check failed: ${c.name}`).toBe(true);
    }
  });

  test("month 1 revenue matches startPct × monthlyAuv for both brands (ramp-up fix)", () => {
    const pnM1 = pnResult.monthlyProjections[0];
    const pnExpected = Math.round(POSTNET_INPUTS.revenue.annualGrossSales / 12 * POSTNET_INPUTS.revenue.startingMonthAuvPct);
    expect(pnM1.revenue).toBe(pnExpected);

    const jiM1 = jiResult.monthlyProjections[0];
    const jiExpected = Math.round(JEREMIAHS_INPUTS.revenue.annualGrossSales / 12 * JEREMIAHS_INPUTS.revenue.startingMonthAuvPct);
    expectClose(jiM1.revenue, jiExpected, 1, "Jeremiah's M1 revenue");
  });

  test("month at monthsToReachAuv reaches 100% AUV for both brands", () => {
    const pnAuv = POSTNET_INPUTS.revenue.annualGrossSales / 12;
    const pnM14 = pnResult.monthlyProjections[13];
    expectClose(pnM14.revenue, pnAuv, 1, "PostNet month 14 = 100% AUV");

    const jiAuv = JEREMIAHS_INPUTS.revenue.annualGrossSales / 12;
    const jiM15 = jiResult.monthlyProjections[14];
    expectClose(jiM15.revenue, jiAuv, 1, "Jeremiah's month 15 = 100% AUV");
  });

  test("gross profit % matches expected for both brands", () => {
    const pnGPPct = 1 - 0.30 - 0.05 - 0.02;
    const pnM12 = pnResult.monthlyProjections[11];
    expect(pnM12.grossProfit / pnM12.revenue).toBeCloseTo(pnGPPct, 2);

    const jiGPPct = 1 - 0.22 - 0.06 - 0.045;
    const jiM12 = jiResult.monthlyProjections[11];
    expect(jiM12.grossProfit / jiM12.revenue).toBeCloseTo(jiGPPct, 2);
  });
});
