import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcrypt";
import {
  brands,
  users,
  plans,
  type BrandParameters,
  type StartupCostTemplate,
} from "../shared/schema";
import {
  buildPlanFinancialInputs,
  buildPlanStartupCosts,
  updateFieldValue,
} from "../shared/plan-initialization";
import type { PlanFinancialInputs } from "../shared/financial-engine";

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL must be set.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema: { brands, users, plans } });

const DEMO_PASSWORD = "demo123";
const SALT_ROUNDS = 12;

const counters = {
  brandsCreated: 0,
  brandsSkipped: 0,
  usersCreated: 0,
  usersSkipped: 0,
  plansCreated: 0,
  plansSkipped: 0,
};

function param(value: number, label: string, description: string) {
  return { value, label, description };
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

const BRAND_DATA: Array<{
  name: string;
  slug: string;
  displayName: string;
  brandParameters: BrandParameters;
  startupCostTemplate: StartupCostTemplate;
}> = [
  {
    name: "PostNet",
    slug: "postnet",
    displayName: "PostNet",
    brandParameters: {
      revenue: {
        monthly_auv: param(26867, "Monthly AUV", "Average unit volume per month ($322,401 annual / 12)"),
        year1_growth_rate: param(0.13, "Year 1 Growth Rate", "Annual revenue growth rate for year 1"),
        year2_growth_rate: param(0.13, "Year 2 Growth Rate", "Annual revenue growth rate for year 2+"),
        starting_month_auv_pct: param(0.08, "Starting Month AUV %", "Percentage of AUV achieved in first month"),
      },
      operating_costs: {
        cogs_pct: param(0.30, "COGS %", "Cost of goods sold as percentage of revenue"),
        labor_pct: param(0.17, "Labor %", "Direct labor cost as percentage of revenue"),
        rent_monthly: param(5000, "Monthly Rent", "Monthly rent expense"),
        utilities_monthly: param(2500, "Monthly Utilities", "Monthly utilities expense"),
        insurance_monthly: param(2500, "Monthly Insurance", "Monthly insurance expense"),
        marketing_pct: param(0.05, "Marketing %", "Marketing spend as percentage of revenue"),
        royalty_pct: param(0.05, "Royalty %", "Franchise royalty fee as percentage of revenue"),
        ad_fund_pct: param(0.02, "Ad Fund %", "National advertising fund contribution"),
        other_monthly: param(800, "Other Monthly", "Other monthly operating expenses"),
      },
      financing: {
        loan_amount: param(205206, "Loan Amount", "Total SBA loan amount"),
        interest_rate: param(0.105, "Interest Rate", "Annual interest rate on debt"),
        loan_term_months: param(144, "Loan Term", "Loan repayment period in months"),
        down_payment_pct: param(0.20, "Down Payment %", "Equity injection as percentage of total investment"),
      },
      startup_capital: {
        working_capital_months: param(3, "Working Capital Months", "Months of working capital reserve"),
        depreciation_years: param(4, "Depreciation Years", "Fixed asset depreciation period"),
      },
    },
    startupCostTemplate: [
      { id: "postnet-franchise-fee", name: "Franchise Fee", default_amount: 39900, capex_classification: "non_capex", item7_range_low: 35000, item7_range_high: 44900, sort_order: 0 },
      { id: "postnet-equipment", name: "Equipment & Technology", default_amount: 55000, capex_classification: "capex", item7_range_low: 45000, item7_range_high: 65000, sort_order: 1 },
      { id: "postnet-leasehold", name: "Leasehold Improvements", default_amount: 65000, capex_classification: "capex", item7_range_low: 50000, item7_range_high: 80000, sort_order: 2 },
      { id: "postnet-signage", name: "Signage & Branding", default_amount: 12132, capex_classification: "capex", item7_range_low: 8000, item7_range_high: 18000, sort_order: 3 },
      { id: "postnet-inventory", name: "Initial Inventory & Supplies", default_amount: 15000, capex_classification: "non_capex", item7_range_low: 10000, item7_range_high: 20000, sort_order: 4 },
      { id: "postnet-training", name: "Training Expenses", default_amount: 8475, capex_classification: "non_capex", item7_range_low: 5000, item7_range_high: 12000, sort_order: 5 },
      { id: "postnet-insurance-deposit", name: "Insurance & Security Deposits", default_amount: 21000, capex_classification: "non_capex", item7_range_low: 15000, item7_range_high: 28000, sort_order: 6 },
      { id: "postnet-working-capital", name: "Working Capital / Additional Funds", default_amount: 40000, capex_classification: "working_capital", item7_range_low: 25000, item7_range_high: 55000, sort_order: 7 },
    ],
  },
  {
    name: "Jeremiah's Italian Ice",
    slug: "jeremiahs-italian-ice",
    displayName: "Jeremiah's Italian Ice",
    brandParameters: {
      revenue: {
        monthly_auv: param(42565, "Monthly AUV", "Average unit volume per month ($510,784 annual / 12)"),
        year1_growth_rate: param(0.10, "Year 1 Growth Rate", "Annual revenue growth rate for year 1"),
        year2_growth_rate: param(0.10, "Year 2 Growth Rate", "Annual revenue growth rate for year 2+"),
        starting_month_auv_pct: param(0.08, "Starting Month AUV %", "Percentage of AUV achieved in first month"),
      },
      operating_costs: {
        cogs_pct: param(0.22, "COGS %", "Cost of goods sold as percentage of revenue"),
        labor_pct: param(0.18, "Labor %", "Direct labor cost as percentage of revenue"),
        rent_monthly: param(40000, "Monthly Rent", "Monthly rent expense"),
        utilities_monthly: param(20000, "Monthly Utilities", "Monthly utilities expense"),
        insurance_monthly: param(15000, "Monthly Insurance", "Monthly insurance expense"),
        marketing_pct: param(0.02, "Marketing %", "Marketing spend as percentage of revenue"),
        royalty_pct: param(0.06, "Royalty %", "Franchise royalty fee as percentage of revenue"),
        ad_fund_pct: param(0.045, "Ad Fund %", "National advertising fund contribution"),
        other_monthly: param(1200, "Other Monthly", "Other monthly operating expenses"),
      },
      financing: {
        loan_amount: param(408627, "Loan Amount", "Total SBA loan amount"),
        interest_rate: param(0.105, "Interest Rate", "Annual interest rate on debt"),
        loan_term_months: param(144, "Loan Term", "Loan repayment period in months"),
        down_payment_pct: param(0.20, "Down Payment %", "Equity injection as percentage of total investment"),
      },
      startup_capital: {
        working_capital_months: param(3, "Working Capital Months", "Months of working capital reserve"),
        depreciation_years: param(4, "Depreciation Years", "Fixed asset depreciation period"),
      },
    },
    startupCostTemplate: [
      { id: "jeremiahs-franchise-fee", name: "Franchise Fee", default_amount: 35000, capex_classification: "non_capex", item7_range_low: 30000, item7_range_high: 40000, sort_order: 0 },
      { id: "jeremiahs-equipment", name: "Equipment & Fixtures", default_amount: 120000, capex_classification: "capex", item7_range_low: 95000, item7_range_high: 145000, sort_order: 1 },
      { id: "jeremiahs-leasehold", name: "Leasehold Improvements", default_amount: 175000, capex_classification: "capex", item7_range_low: 125000, item7_range_high: 225000, sort_order: 2 },
      { id: "jeremiahs-signage", name: "Signage & Exterior", default_amount: 25000, capex_classification: "capex", item7_range_low: 15000, item7_range_high: 35000, sort_order: 3 },
      { id: "jeremiahs-inventory", name: "Initial Inventory", default_amount: 12000, capex_classification: "non_capex", item7_range_low: 8000, item7_range_high: 18000, sort_order: 4 },
      { id: "jeremiahs-training", name: "Training & Travel", default_amount: 15000, capex_classification: "non_capex", item7_range_low: 10000, item7_range_high: 20000, sort_order: 5 },
      { id: "jeremiahs-permits", name: "Permits & Licenses", default_amount: 8784, capex_classification: "non_capex", item7_range_low: 5000, item7_range_high: 15000, sort_order: 6 },
      { id: "jeremiahs-pre-opening", name: "Pre-Opening Marketing", default_amount: 20000, capex_classification: "non_capex", item7_range_low: 10000, item7_range_high: 30000, sort_order: 7 },
      { id: "jeremiahs-working-capital", name: "Working Capital / Additional Funds", default_amount: 100000, capex_classification: "working_capital", item7_range_low: 60000, item7_range_high: 140000, sort_order: 8 },
    ],
  },
  {
    name: "Tint World",
    slug: "tint-world",
    displayName: "Tint World",
    brandParameters: {
      revenue: {
        monthly_auv: param(33333, "Monthly AUV", "Average unit volume per month ($400,000 annual / 12)"),
        year1_growth_rate: param(0.04, "Year 1 Growth Rate", "Annual revenue growth rate for year 1"),
        year2_growth_rate: param(0.04, "Year 2 Growth Rate", "Annual revenue growth rate for year 2+"),
        starting_month_auv_pct: param(0.08, "Starting Month AUV %", "Percentage of AUV achieved in first month"),
      },
      operating_costs: {
        cogs_pct: param(0.20, "COGS %", "Cost of goods sold as percentage of revenue"),
        labor_pct: param(0.20, "Labor %", "Direct labor cost as percentage of revenue"),
        rent_monthly: param(4000, "Monthly Rent", "Monthly rent expense"),
        utilities_monthly: param(2000, "Monthly Utilities", "Monthly utilities expense"),
        insurance_monthly: param(1833, "Monthly Insurance", "Monthly insurance expense"),
        marketing_pct: param(0.08, "Marketing %", "Marketing spend as percentage of revenue"),
        royalty_pct: param(0.06, "Royalty %", "Franchise royalty fee as percentage of revenue"),
        ad_fund_pct: param(0.06, "Ad Fund %", "National advertising fund contribution"),
        other_monthly: param(900, "Other Monthly", "Other monthly operating expenses"),
      },
      financing: {
        loan_amount: param(320000, "Loan Amount", "Total SBA loan amount"),
        interest_rate: param(0.105, "Interest Rate", "Annual interest rate on debt"),
        loan_term_months: param(144, "Loan Term", "Loan repayment period in months"),
        down_payment_pct: param(0.20, "Down Payment %", "Equity injection as percentage of total investment"),
      },
      startup_capital: {
        working_capital_months: param(3, "Working Capital Months", "Months of working capital reserve"),
        depreciation_years: param(4, "Depreciation Years", "Fixed asset depreciation period"),
      },
    },
    startupCostTemplate: [
      { id: "tint-franchise-fee", name: "Franchise Fee", default_amount: 49500, capex_classification: "non_capex", item7_range_low: 40000, item7_range_high: 55000, sort_order: 0 },
      { id: "tint-equipment", name: "Equipment & Tools", default_amount: 85000, capex_classification: "capex", item7_range_low: 65000, item7_range_high: 110000, sort_order: 1 },
      { id: "tint-leasehold", name: "Leasehold Improvements", default_amount: 95000, capex_classification: "capex", item7_range_low: 70000, item7_range_high: 130000, sort_order: 2 },
      { id: "tint-signage", name: "Signage & Vehicle Wrap", default_amount: 20000, capex_classification: "capex", item7_range_low: 12000, item7_range_high: 30000, sort_order: 3 },
      { id: "tint-inventory", name: "Initial Inventory & Supplies", default_amount: 30000, capex_classification: "non_capex", item7_range_low: 20000, item7_range_high: 40000, sort_order: 4 },
      { id: "tint-training", name: "Training & Certification", default_amount: 18000, capex_classification: "non_capex", item7_range_low: 12000, item7_range_high: 25000, sort_order: 5 },
      { id: "tint-insurance-deposit", name: "Insurance & Deposits", default_amount: 22500, capex_classification: "non_capex", item7_range_low: 15000, item7_range_high: 30000, sort_order: 6 },
      { id: "tint-working-capital", name: "Working Capital / Additional Funds", default_amount: 80000, capex_classification: "working_capital", item7_range_low: 50000, item7_range_high: 110000, sort_order: 7 },
    ],
  },
  {
    name: "Ubreakifix",
    slug: "ubreakifix",
    displayName: "Ubreakifix",
    brandParameters: {
      revenue: {
        monthly_auv: param(24938, "Monthly AUV", "Average unit volume per month ($299,250 annual / 12)"),
        year1_growth_rate: param(0.13, "Year 1 Growth Rate", "Annual revenue growth rate for year 1"),
        year2_growth_rate: param(0.13, "Year 2 Growth Rate", "Annual revenue growth rate for year 2+"),
        starting_month_auv_pct: param(0.08, "Starting Month AUV %", "Percentage of AUV achieved in first month"),
      },
      operating_costs: {
        cogs_pct: param(0.32, "COGS %", "Cost of goods sold as percentage of revenue"),
        labor_pct: param(0.15, "Labor %", "Direct labor cost as percentage of revenue"),
        rent_monthly: param(20000, "Monthly Rent", "Monthly rent expense"),
        utilities_monthly: param(12000, "Monthly Utilities", "Monthly utilities expense"),
        insurance_monthly: param(8000, "Monthly Insurance", "Monthly insurance expense"),
        marketing_pct: param(0.05, "Marketing %", "Marketing spend as percentage of revenue"),
        royalty_pct: param(0.07, "Royalty %", "Franchise royalty fee as percentage of revenue"),
        ad_fund_pct: param(0.00, "Ad Fund %", "National advertising fund contribution"),
        other_monthly: param(700, "Other Monthly", "Other monthly operating expenses"),
      },
      financing: {
        loan_amount: param(239400, "Loan Amount", "Total SBA loan amount"),
        interest_rate: param(0.105, "Interest Rate", "Annual interest rate on debt"),
        loan_term_months: param(144, "Loan Term", "Loan repayment period in months"),
        down_payment_pct: param(0.20, "Down Payment %", "Equity injection as percentage of total investment"),
      },
      startup_capital: {
        working_capital_months: param(3, "Working Capital Months", "Months of working capital reserve"),
        depreciation_years: param(4, "Depreciation Years", "Fixed asset depreciation period"),
      },
    },
    startupCostTemplate: [
      { id: "ufix-franchise-fee", name: "Franchise Fee", default_amount: 35000, capex_classification: "non_capex", item7_range_low: 30000, item7_range_high: 40000, sort_order: 0 },
      { id: "ufix-equipment", name: "Repair Equipment & Tools", default_amount: 45000, capex_classification: "capex", item7_range_low: 35000, item7_range_high: 60000, sort_order: 1 },
      { id: "ufix-leasehold", name: "Leasehold Improvements", default_amount: 55000, capex_classification: "capex", item7_range_low: 40000, item7_range_high: 75000, sort_order: 2 },
      { id: "ufix-technology", name: "Technology & POS Systems", default_amount: 18000, capex_classification: "capex", item7_range_low: 12000, item7_range_high: 25000, sort_order: 3 },
      { id: "ufix-signage", name: "Signage & Store Branding", default_amount: 14000, capex_classification: "capex", item7_range_low: 8000, item7_range_high: 20000, sort_order: 4 },
      { id: "ufix-inventory", name: "Initial Parts Inventory", default_amount: 25000, capex_classification: "non_capex", item7_range_low: 15000, item7_range_high: 35000, sort_order: 5 },
      { id: "ufix-training", name: "Training & Certification", default_amount: 12250, capex_classification: "non_capex", item7_range_low: 8000, item7_range_high: 18000, sort_order: 6 },
      { id: "ufix-insurance", name: "Insurance & Deposits", default_amount: 15000, capex_classification: "non_capex", item7_range_low: 10000, item7_range_high: 22000, sort_order: 7 },
      { id: "ufix-working-capital", name: "Working Capital / Additional Funds", default_amount: 80000, capex_classification: "working_capital", item7_range_low: 50000, item7_range_high: 100000, sort_order: 8 },
    ],
  },
];

interface UserDef {
  firstName: string;
  role: "franchisee" | "franchisor";
  tier?: "planning_assistant" | "forms" | "quick_entry";
}

interface PlanDef {
  name: string;
  status: "draft" | "in_progress" | "completed";
  pipelineStage: "planning" | "site_evaluation" | "financing" | "construction" | "open";
  quickStartCompleted: boolean;
  targetMarket: string | null;
  targetOpenQuarter: string | null;
  locationAddress: string | null;
  financingStatus: "not_started" | "exploring" | "applied" | "pre_approved" | "approved" | "funded" | null;
  updatedDaysAgo: number;
  financialMods?: (inputs: PlanFinancialInputs) => PlanFinancialInputs;
  includeFinancials: boolean;
}

interface BrandUserDefs {
  brandSlug: string;
  users: Array<UserDef & { plans: PlanDef[] }>;
}

const BRAND_USERS: BrandUserDefs[] = [
  {
    brandSlug: "postnet",
    users: [
      {
        firstName: "Sam", role: "franchisee", tier: "planning_assistant",
        plans: [
          { name: "Main Street Location", status: "in_progress", pipelineStage: "financing", quickStartCompleted: true, targetMarket: "Suburban residential", targetOpenQuarter: "Q3 2026", locationAddress: "742 Main St, Anytown, FL 33101", financingStatus: "applied", updatedDaysAgo: 2, includeFinancials: true },
          { name: "Downtown Concept", status: "draft", pipelineStage: "planning", quickStartCompleted: false, targetMarket: null, targetOpenQuarter: null, locationAddress: null, financingStatus: null, updatedDaysAgo: 14, includeFinancials: false },
        ],
      },
      {
        firstName: "Chris", role: "franchisee", tier: "forms",
        plans: [
          { name: "Westside Shopping Center", status: "completed", pipelineStage: "open", quickStartCompleted: true, targetMarket: "Commercial retail corridor", targetOpenQuarter: "Q1 2026", locationAddress: "1200 Westside Blvd, Suite 4, Orlando, FL 32801", financingStatus: "funded", updatedDaysAgo: 1,
            financialMods: (inputs) => {
              const now = new Date().toISOString();
              const modified = JSON.parse(JSON.stringify(inputs)) as PlanFinancialInputs;
              for (let i = 0; i < modified.operatingCosts.cogsPct.length; i++) {
                modified.operatingCosts.cogsPct[i] = updateFieldValue(modified.operatingCosts.cogsPct[i], 0.23, now);
              }
              return modified;
            }, includeFinancials: true },
          { name: "Eastpoint Plaza", status: "in_progress", pipelineStage: "construction", quickStartCompleted: true, targetMarket: "Mixed residential-commercial", targetOpenQuarter: "Q4 2026", locationAddress: "890 Eastpoint Dr, Tampa, FL 33602", financingStatus: "approved", updatedDaysAgo: 5, includeFinancials: true },
        ],
      },
      {
        firstName: "Maria", role: "franchisee", tier: "quick_entry",
        plans: [
          { name: "University District Hub", status: "completed", pipelineStage: "open", quickStartCompleted: true, targetMarket: "College town foot traffic", targetOpenQuarter: "Q4 2025", locationAddress: "315 University Ave, Gainesville, FL 32601", financingStatus: "funded", updatedDaysAgo: 21, includeFinancials: true },
          { name: "Airport Corridor Location", status: "in_progress", pipelineStage: "site_evaluation", quickStartCompleted: true, targetMarket: "Business traveler corridor", targetOpenQuarter: "Q2 2027", locationAddress: null, financingStatus: "exploring", updatedDaysAgo: 7, includeFinancials: true },
          { name: "Lakeside Retail Park", status: "draft", pipelineStage: "planning", quickStartCompleted: false, targetMarket: "Suburban family area", targetOpenQuarter: null, locationAddress: null, financingStatus: null, updatedDaysAgo: 28, includeFinancials: false },
        ],
      },
      {
        firstName: "Alex", role: "franchisee", tier: "forms",
        plans: [
          { name: "Midtown Express Center", status: "in_progress", pipelineStage: "financing", quickStartCompleted: true, targetMarket: "Downtown office workers", targetOpenQuarter: "Q1 2027", locationAddress: "505 Midtown Ave, Jacksonville, FL 32202", financingStatus: "pre_approved", updatedDaysAgo: 3, includeFinancials: true },
        ],
      },
      { firstName: "Denise", role: "franchisor", plans: [] },
    ],
  },
  {
    brandSlug: "jeremiahs-italian-ice",
    users: [
      {
        firstName: "Sam", role: "franchisee", tier: "planning_assistant",
        plans: [
          { name: "Beachside Stand", status: "in_progress", pipelineStage: "construction", quickStartCompleted: true, targetMarket: "Beach tourist foot traffic", targetOpenQuarter: "Q2 2026", locationAddress: "100 Ocean Dr, Miami Beach, FL 33139", financingStatus: "funded", updatedDaysAgo: 4, includeFinancials: true },
          { name: "Community Park Kiosk", status: "draft", pipelineStage: "planning", quickStartCompleted: false, targetMarket: null, targetOpenQuarter: null, locationAddress: null, financingStatus: null, updatedDaysAgo: 18, includeFinancials: false },
        ],
      },
      {
        firstName: "Chris", role: "franchisee", tier: "forms",
        plans: [
          { name: "Boardwalk Flagship", status: "completed", pipelineStage: "open", quickStartCompleted: true, targetMarket: "Tourist boardwalk area", targetOpenQuarter: "Q3 2025", locationAddress: "225 Boardwalk Ln, Daytona Beach, FL 32118", financingStatus: "funded", updatedDaysAgo: 0, includeFinancials: true },
          { name: "Outlet Mall Stand", status: "in_progress", pipelineStage: "site_evaluation", quickStartCompleted: true, targetMarket: "Outlet shopping center", targetOpenQuarter: "Q1 2027", locationAddress: null, financingStatus: "exploring", updatedDaysAgo: 10, includeFinancials: true },
        ],
      },
      {
        firstName: "Maria", role: "franchisee", tier: "quick_entry",
        plans: [
          { name: "Suburban Strip Center", status: "completed", pipelineStage: "open", quickStartCompleted: true, targetMarket: "Suburban family neighborhood", targetOpenQuarter: "Q1 2025", locationAddress: "4500 Palm Ave, Fort Lauderdale, FL 33301", financingStatus: "funded", updatedDaysAgo: 25,
            financialMods: (inputs) => {
              const now = new Date().toISOString();
              const modified = JSON.parse(JSON.stringify(inputs)) as PlanFinancialInputs;
              for (let i = 0; i < modified.operatingCosts.adFundPct.length; i++) {
                modified.operatingCosts.adFundPct[i] = updateFieldValue(modified.operatingCosts.adFundPct[i], 0.03, now);
              }
              return modified;
            }, includeFinancials: true },
          { name: "Food Truck Rally Concept", status: "draft", pipelineStage: "planning", quickStartCompleted: false, targetMarket: "Event-based mobile", targetOpenQuarter: null, locationAddress: null, financingStatus: null, updatedDaysAgo: 30, includeFinancials: false },
        ],
      },
      {
        firstName: "Jordan", role: "franchisee", tier: "planning_assistant",
        plans: [
          { name: "Sports Complex Stand", status: "in_progress", pipelineStage: "financing", quickStartCompleted: true, targetMarket: "Youth sports families", targetOpenQuarter: "Q3 2026", locationAddress: "777 Sports Way, Kissimmee, FL 34741", financingStatus: "applied", updatedDaysAgo: 6, includeFinancials: true },
        ],
      },
      {
        firstName: "Tanya", role: "franchisee", tier: "forms",
        plans: [
          { name: "Downtown Square Kiosk", status: "in_progress", pipelineStage: "site_evaluation", quickStartCompleted: true, targetMarket: "Downtown pedestrian area", targetOpenQuarter: "Q4 2026", locationAddress: null, financingStatus: "not_started", updatedDaysAgo: 15, includeFinancials: true },
        ],
      },
      { firstName: "Denise", role: "franchisor", plans: [] },
    ],
  },
  {
    brandSlug: "tint-world",
    users: [
      {
        firstName: "Sam", role: "franchisee", tier: "planning_assistant",
        plans: [
          { name: "Industrial Park Shop", status: "in_progress", pipelineStage: "construction", quickStartCompleted: true, targetMarket: "Auto enthusiast corridor", targetOpenQuarter: "Q3 2026", locationAddress: "2800 Industrial Pkwy, Houston, TX 77003", financingStatus: "approved", updatedDaysAgo: 3, includeFinancials: true },
        ],
      },
      {
        firstName: "Chris", role: "franchisee", tier: "forms",
        plans: [
          { name: "Highway Frontage Location", status: "completed", pipelineStage: "open", quickStartCompleted: true, targetMarket: "Highway-visible auto services", targetOpenQuarter: "Q2 2025", locationAddress: "5500 Highway 290, Austin, TX 78735", financingStatus: "funded", updatedDaysAgo: 0,
            financialMods: (inputs) => {
              const now = new Date().toISOString();
              const modified = JSON.parse(JSON.stringify(inputs)) as PlanFinancialInputs;
              for (let i = 0; i < modified.operatingCosts.laborPct.length; i++) {
                modified.operatingCosts.laborPct[i] = updateFieldValue(modified.operatingCosts.laborPct[i], 0.22, now);
              }
              return modified;
            }, includeFinancials: true },
          { name: "Suburban Auto Center", status: "in_progress", pipelineStage: "financing", quickStartCompleted: true, targetMarket: "Suburban car-dependent community", targetOpenQuarter: "Q1 2027", locationAddress: "1450 Commerce Dr, San Antonio, TX 78201", financingStatus: "pre_approved", updatedDaysAgo: 8, includeFinancials: true },
        ],
      },
      {
        firstName: "Maria", role: "franchisee", tier: "quick_entry",
        plans: [
          { name: "Mall-Adjacent Storefront", status: "completed", pipelineStage: "open", quickStartCompleted: true, targetMarket: "Shopping mall traffic", targetOpenQuarter: "Q4 2025", locationAddress: "3200 Galleria Blvd, Dallas, TX 75240", financingStatus: "funded", updatedDaysAgo: 19, includeFinancials: true },
          { name: "East Dallas Workshop", status: "in_progress", pipelineStage: "site_evaluation", quickStartCompleted: true, targetMarket: "Dense urban residential", targetOpenQuarter: "Q2 2027", locationAddress: null, financingStatus: "exploring", updatedDaysAgo: 11, includeFinancials: true },
          { name: "Fleet Services Concept", status: "draft", pipelineStage: "planning", quickStartCompleted: false, targetMarket: "B2B fleet management", targetOpenQuarter: null, locationAddress: null, financingStatus: null, updatedDaysAgo: 22, includeFinancials: false },
        ],
      },
      {
        firstName: "Jordan", role: "franchisee", tier: "planning_assistant",
        plans: [
          { name: "College Town Auto Shop", status: "draft", pipelineStage: "planning", quickStartCompleted: false, targetMarket: "College student car owners", targetOpenQuarter: null, locationAddress: null, financingStatus: "not_started", updatedDaysAgo: 16, includeFinancials: false },
          { name: "Dealership Row Express", status: "in_progress", pipelineStage: "financing", quickStartCompleted: true, targetMarket: "Auto dealership adjacent", targetOpenQuarter: "Q4 2026", locationAddress: "600 Dealership Row, Fort Worth, TX 76102", financingStatus: "applied", updatedDaysAgo: 5, includeFinancials: true },
        ],
      },
      { firstName: "Marcus", role: "franchisor", plans: [] },
    ],
  },
  {
    brandSlug: "ubreakifix",
    users: [
      {
        firstName: "Sam", role: "franchisee", tier: "planning_assistant",
        plans: [
          { name: "Mall Kiosk Concept", status: "in_progress", pipelineStage: "site_evaluation", quickStartCompleted: true, targetMarket: "High-traffic indoor mall", targetOpenQuarter: "Q3 2026", locationAddress: null, financingStatus: "exploring", updatedDaysAgo: 4, includeFinancials: true },
          { name: "Big Box Retail Pad", status: "draft", pipelineStage: "planning", quickStartCompleted: false, targetMarket: null, targetOpenQuarter: null, locationAddress: null, financingStatus: null, updatedDaysAgo: 20, includeFinancials: false },
        ],
      },
      {
        firstName: "Chris", role: "franchisee", tier: "forms",
        plans: [
          { name: "Tech District Storefront", status: "completed", pipelineStage: "open", quickStartCompleted: true, targetMarket: "Tech-savvy urban professionals", targetOpenQuarter: "Q1 2026", locationAddress: "180 Innovation Way, San Jose, CA 95110", financingStatus: "funded", updatedDaysAgo: 1, includeFinancials: true },
          { name: "Campus Edge Repair Shop", status: "in_progress", pipelineStage: "construction", quickStartCompleted: true, targetMarket: "University students", targetOpenQuarter: "Q4 2026", locationAddress: "920 College Ave, Berkeley, CA 94704", financingStatus: "approved", updatedDaysAgo: 6, includeFinancials: true },
        ],
      },
      {
        firstName: "Maria", role: "franchisee", tier: "quick_entry",
        plans: [
          { name: "Suburban Repair Center", status: "completed", pipelineStage: "open", quickStartCompleted: true, targetMarket: "Family-oriented suburb", targetOpenQuarter: "Q3 2025", locationAddress: "650 Oak Park Rd, Fremont, CA 94536", financingStatus: "funded", updatedDaysAgo: 27,
            financialMods: (inputs) => {
              const now = new Date().toISOString();
              const modified = JSON.parse(JSON.stringify(inputs)) as PlanFinancialInputs;
              for (let i = 0; i < modified.operatingCosts.adFundPct.length; i++) {
                modified.operatingCosts.adFundPct[i] = updateFieldValue(modified.operatingCosts.adFundPct[i], 0.0, now);
              }
              return modified;
            }, includeFinancials: true },
          { name: "Downtown Express Location", status: "in_progress", pipelineStage: "financing", quickStartCompleted: true, targetMarket: "Downtown foot traffic", targetOpenQuarter: "Q2 2027", locationAddress: "310 Market St, San Francisco, CA 94105", financingStatus: "applied", updatedDaysAgo: 9, includeFinancials: true },
        ],
      },
      {
        firstName: "Alex", role: "franchisee", tier: "forms",
        plans: [
          { name: "Strip Mall Repair Hub", status: "in_progress", pipelineStage: "site_evaluation", quickStartCompleted: true, targetMarket: "Suburban strip mall anchored", targetOpenQuarter: "Q1 2027", locationAddress: null, financingStatus: "not_started", updatedDaysAgo: 13, includeFinancials: true },
        ],
      },
      {
        firstName: "Jordan", role: "franchisee", tier: "planning_assistant",
        plans: [
          { name: "Neighborhood Repair Shop", status: "draft", pipelineStage: "planning", quickStartCompleted: false, targetMarket: "Residential neighborhood", targetOpenQuarter: null, locationAddress: null, financingStatus: null, updatedDaysAgo: 24, includeFinancials: false },
        ],
      },
      { firstName: "Raj", role: "franchisor", plans: [] },
    ],
  },
];

async function seedBrands(): Promise<Map<string, { id: string; brandParameters: BrandParameters; startupCostTemplate: StartupCostTemplate }>> {
  const brandMap = new Map<string, { id: string; brandParameters: BrandParameters; startupCostTemplate: StartupCostTemplate }>();

  for (const bd of BRAND_DATA) {
    const existing = await db.select().from(brands).where(eq(brands.slug, bd.slug));
    if (existing.length > 0) {
      console.log(`  Brand "${bd.name}" already exists (id: ${existing[0].id}) — skipped`);
      counters.brandsSkipped++;
      brandMap.set(bd.slug, {
        id: existing[0].id,
        brandParameters: bd.brandParameters,
        startupCostTemplate: bd.startupCostTemplate,
      });
      continue;
    }

    const [created] = await db.insert(brands).values({
      name: bd.name,
      slug: bd.slug,
      displayName: bd.displayName,
      brandParameters: bd.brandParameters as any,
      startupCostTemplate: bd.startupCostTemplate as any,
    }).returning();

    console.log(`  Brand "${bd.name}" created (id: ${created.id})`);
    counters.brandsCreated++;
    brandMap.set(bd.slug, {
      id: created.id,
      brandParameters: bd.brandParameters,
      startupCostTemplate: bd.startupCostTemplate,
    });
  }

  return brandMap;
}

async function seedUsersAndPlans(
  brandMap: Map<string, { id: string; brandParameters: BrandParameters; startupCostTemplate: StartupCostTemplate }>
): Promise<void> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

  for (const brandUsers of BRAND_USERS) {
    const brand = brandMap.get(brandUsers.brandSlug);
    if (!brand) {
      console.log(`  WARNING: Brand ${brandUsers.brandSlug} not found in map — skipping users`);
      continue;
    }

    console.log(`\n  --- ${brandUsers.brandSlug} ---`);

    for (const userDef of brandUsers.users) {
      const email = `${userDef.firstName.toLowerCase()}@${brandUsers.brandSlug}.demo.katalyst.io`;

      const existingUsers = await db.select().from(users).where(eq(users.email, email));
      let userId: string;

      if (existingUsers.length > 0) {
        userId = existingUsers[0].id;
        console.log(`  User "${userDef.firstName}" (${email}) already exists — skipped`);
        counters.usersSkipped++;
      } else {
        const [created] = await db.insert(users).values({
          email,
          passwordHash,
          role: userDef.role,
          brandId: brand.id,
          displayName: userDef.firstName,
          onboardingCompleted: true,
          preferredTier: userDef.tier || null,
          isDemo: false,
        } as any).returning();
        userId = created.id;
        console.log(`  User "${userDef.firstName}" (${userDef.role}) created (id: ${userId})`);
        counters.usersCreated++;
      }

      for (const planDef of userDef.plans) {
        const existingPlans = await db.select().from(plans)
          .where(and(eq(plans.userId, userId), eq(plans.name, planDef.name)));

        if (existingPlans.length > 0) {
          console.log(`    Plan "${planDef.name}" already exists — skipped`);
          counters.plansSkipped++;
          continue;
        }

        let financialInputs: PlanFinancialInputs | null = null;
        let startupCosts: any = null;

        if (planDef.includeFinancials) {
          financialInputs = buildPlanFinancialInputs(brand.brandParameters);
          if (planDef.financialMods) {
            financialInputs = planDef.financialMods(financialInputs);
          }
          startupCosts = buildPlanStartupCosts(brand.startupCostTemplate);
        }

        const updatedAt = daysAgo(planDef.updatedDaysAgo);

        const [created] = await db.insert(plans).values({
          userId,
          brandId: brand.id,
          name: planDef.name,
          status: planDef.status,
          pipelineStage: planDef.pipelineStage,
          quickStartCompleted: planDef.quickStartCompleted,
          targetMarket: planDef.targetMarket,
          targetOpenQuarter: planDef.targetOpenQuarter,
          locationAddress: planDef.locationAddress,
          financingStatus: planDef.financingStatus,
          financialInputs: financialInputs as any,
          startupCosts: startupCosts as any,
          updatedAt,
        } as any).returning();

        console.log(`    Plan "${planDef.name}" [${planDef.status}/${planDef.pipelineStage}] created (id: ${created.id})`);
        counters.plansCreated++;
      }
    }
  }
}

async function main() {
  console.log("\n=== Katalyst Growth Planner — Demo Data Seed ===\n");

  console.log("Step 1: Seeding brands...");
  const brandMap = await seedBrands();

  console.log("\nStep 2: Seeding users and plans...");
  await seedUsersAndPlans(brandMap);

  console.log("\n=== Summary ===");
  console.log("┌──────────────┬─────────┬─────────┐");
  console.log("│ Record Type  │ Created │ Skipped │");
  console.log("├──────────────┼─────────┼─────────┤");
  console.log(`│ Brands       │ ${String(counters.brandsCreated).padStart(7)} │ ${String(counters.brandsSkipped).padStart(7)} │`);
  console.log(`│ Users        │ ${String(counters.usersCreated).padStart(7)} │ ${String(counters.usersSkipped).padStart(7)} │`);
  console.log(`│ Plans        │ ${String(counters.plansCreated).padStart(7)} │ ${String(counters.plansSkipped).padStart(7)} │`);
  console.log("└──────────────┴─────────┴─────────┘");
  console.log(`\nTotal records: ${counters.brandsCreated + counters.usersCreated + counters.plansCreated} created, ${counters.brandsSkipped + counters.usersSkipped + counters.plansSkipped} skipped`);
  console.log("\nDemo login password for all users: demo123");
  console.log("\nDone!\n");

  await pool.end();
}

main().catch((err) => {
  console.error("Seed script failed:", err);
  pool.end();
  process.exit(1);
});
