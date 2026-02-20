import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── Brand Parameters Type (snake_case keys) ────────────────────────────

export type BrandParameters = {
  revenue: {
    monthly_auv: { value: number };
    year1_growth_rate: { value: number };
    year2_growth_rate: { value: number };
    starting_month_auv_pct: { value: number };
  };
  operating_costs: {
    cogs_pct: { value: number };
    labor_pct: { value: number };
    rent_monthly: { value: number };
    utilities_monthly: { value: number };
    insurance_monthly: { value: number };
    marketing_pct: { value: number };
    royalty_pct: { value: number };
    ad_fund_pct: { value: number };
    other_monthly: { value: number };
  };
  financing: {
    loan_amount: { value: number };
    interest_rate: { value: number };
    loan_term_months: { value: number };
    down_payment_pct: { value: number };
  };
  startup_capital: {
    working_capital_months: { value: number };
    depreciation_years: { value: number };
  };
};

export type StartupCostTemplate = Array<{
  name: string;
  default_amount: number;
  capex_classification: "capex" | "non_capex" | "working_capital";
  item7_range_low: number | null;
  item7_range_high: number | null;
  sort_order: number | null;
}>;

export type ValidationToleranceConfig = {
  currency?: number;
  percentage?: number;
  months?: number;
};

export type ImpersonationStatus = {
  active: boolean;
  targetUser?: {
    id: string;
    displayName: string | null;
    email: string;
    role: string;
    brandId: string | null;
  };
  readOnly?: boolean;
  editingEnabled?: boolean;
  remainingMinutes?: number;
  returnBrandId?: string | null;
  expired?: boolean;
};

export type DemoModeStatus = {
  active: boolean;
  brandId?: string;
  brandName?: string;
  demoUserId?: string;
};

// ─── Database Tables ─────────────────────────────────────────────────────

export const brands = pgTable("brands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  displayName: text("display_name"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color"),
  defaultBookingUrl: text("default_booking_url"),
  franchisorAcknowledgmentEnabled: boolean("franchisor_acknowledgment_enabled").default(false),
  defaultAccountManagerId: varchar("default_account_manager_id"),
  brandParameters: jsonb("brand_parameters").$type<BrandParameters>(),
  startupCostTemplate: jsonb("startup_cost_template").$type<StartupCostTemplate>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  displayName: text("display_name"),
  profileImageUrl: text("profile_image_url"),
  role: text("role").notNull().default("franchisee"),
  brandId: varchar("brand_id"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  preferredTier: text("preferred_tier"),
  accountManagerId: varchar("account_manager_id"),
  bookingUrl: text("booking_url"),
  isDemoUser: boolean("is_demo_user").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invitations = pgTable("invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  role: text("role").notNull(),
  brandId: varchar("brand_id"),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const plans = pgTable("plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  brandId: varchar("brand_id").notNull(),
  name: text("name").notNull().default("My Business Plan"),
  financialInputs: jsonb("financial_inputs"),
  startupCosts: jsonb("startup_costs"),
  quickStartCompleted: boolean("quick_start_completed").default(false),
  lastAutoSave: timestamp("last_auto_save"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const brandAccountManagers = pgTable(
  "brand_account_managers",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    brandId: varchar("brand_id").notNull(),
    accountManagerId: varchar("account_manager_id").notNull(),
    bookingUrl: text("booking_url"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("brand_account_managers_brand_user_idx").on(table.brandId, table.accountManagerId),
  ]
);

export const brandValidationRuns = pgTable("brand_validation_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  brandId: varchar("brand_id").notNull(),
  runAt: timestamp("run_at").notNull(),
  status: text("status").notNull(),
  testInputs: jsonb("test_inputs").notNull(),
  expectedOutputs: jsonb("expected_outputs").notNull(),
  actualOutputs: jsonb("actual_outputs").notNull(),
  comparisonResults: jsonb("comparison_results").notNull(),
  toleranceConfig: jsonb("tolerance_config").notNull(),
  runBy: varchar("run_by").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminUserId: varchar("admin_user_id").notNull(),
  impersonatedUserId: varchar("impersonated_user_id").notNull(),
  editSessionStartedAt: timestamp("edit_session_started_at").notNull(),
  editSessionEndedAt: timestamp("edit_session_ended_at"),
  actionsSummary: jsonb("actions_summary").notNull().$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Zod Schemas for JSON Fields ─────────────────────────────────────────

const parameterValueSchema = z.object({
  value: z.number(),
});

export const brandParameterSchema = z.object({
  revenue: z.object({
    monthly_auv: parameterValueSchema,
    year1_growth_rate: parameterValueSchema,
    year2_growth_rate: parameterValueSchema,
    starting_month_auv_pct: parameterValueSchema,
  }),
  operating_costs: z.object({
    cogs_pct: parameterValueSchema,
    labor_pct: parameterValueSchema,
    rent_monthly: parameterValueSchema,
    utilities_monthly: parameterValueSchema,
    insurance_monthly: parameterValueSchema,
    marketing_pct: parameterValueSchema,
    royalty_pct: parameterValueSchema,
    ad_fund_pct: parameterValueSchema,
    other_monthly: parameterValueSchema,
  }),
  financing: z.object({
    loan_amount: parameterValueSchema,
    interest_rate: parameterValueSchema,
    loan_term_months: parameterValueSchema,
    down_payment_pct: parameterValueSchema,
  }),
  startup_capital: z.object({
    working_capital_months: parameterValueSchema,
    depreciation_years: parameterValueSchema,
  }),
});

export const startupCostTemplateSchema = z.array(
  z.object({
    name: z.string().min(1),
    default_amount: z.number(),
    capex_classification: z.enum(["capex", "non_capex", "working_capital"]),
    item7_range_low: z.number().nullable(),
    item7_range_high: z.number().nullable(),
    sort_order: z.number().nullable(),
  })
);

const financialFieldValueSchema = z.object({
  currentValue: z.number(),
  source: z.string(),
  brandDefault: z.number().nullable(),
  item7Range: z.object({
    min: z.number(),
    max: z.number(),
  }).nullable(),
  lastModifiedAt: z.string().nullable(),
  isCustom: z.boolean(),
});

export const planFinancialInputsSchema = z.object({
  revenue: z.object({
    monthlyAuv: financialFieldValueSchema,
    year1GrowthRate: financialFieldValueSchema,
    year2GrowthRate: financialFieldValueSchema,
    startingMonthAuvPct: financialFieldValueSchema,
  }),
  operatingCosts: z.object({
    cogsPct: financialFieldValueSchema,
    laborPct: financialFieldValueSchema,
    rentMonthly: financialFieldValueSchema,
    utilitiesMonthly: financialFieldValueSchema,
    insuranceMonthly: financialFieldValueSchema,
    marketingPct: financialFieldValueSchema,
    royaltyPct: financialFieldValueSchema,
    adFundPct: financialFieldValueSchema,
    otherMonthly: financialFieldValueSchema,
  }),
  financing: z.object({
    loanAmount: financialFieldValueSchema,
    interestRate: financialFieldValueSchema,
    loanTermMonths: financialFieldValueSchema,
    downPaymentPct: financialFieldValueSchema,
  }),
  startupCapital: z.object({
    workingCapitalMonths: financialFieldValueSchema,
    depreciationYears: financialFieldValueSchema,
  }),
});

export const planStartupCostsSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    amount: z.number(),
    capexClassification: z.enum(["capex", "non_capex", "working_capital"]),
    isCustom: z.boolean(),
    source: z.string(),
    brandDefaultAmount: z.number().nullable(),
    item7RangeLow: z.number().nullable(),
    item7RangeHigh: z.number().nullable(),
    sortOrder: z.number(),
  })
);

// ─── Insert Schemas ──────────────────────────────────────────────────────

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlanSchema = createInsertSchema(plans).pick({
  userId: true,
  brandId: true,
  name: true,
  financialInputs: true,
  startupCosts: true,
  quickStartCompleted: true,
});

export const updatePlanSchema = createInsertSchema(plans).pick({
  userId: true,
  brandId: true,
  name: true,
  financialInputs: true,
  startupCosts: true,
  quickStartCompleted: true,
}).partial();

// ─── TypeScript Types ────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Brand = typeof brands.$inferSelect;
export type Invitation = typeof invitations.$inferSelect;
export type Plan = typeof plans.$inferSelect;
