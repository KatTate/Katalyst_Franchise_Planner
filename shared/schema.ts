import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, index, jsonb, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

const pctParam = (label: string) =>
  z.object({ value: z.number().min(0, `${label} must be 0 or greater`).max(1, `${label} must be at most 100%`), label: z.string(), description: z.string() });
const currencyParam = (label: string) =>
  z.object({ value: z.number().min(0, `${label} must be 0 or greater`), label: z.string(), description: z.string() });
const intParam = (label: string, min = 0) =>
  z.object({ value: z.number().min(min, `${label} must be at least ${min}`).int(`${label} must be a whole number`), label: z.string(), description: z.string() });

export const brandParameterSchema = z.object({
  revenue: z.object({
    monthly_auv: currencyParam("Monthly AUV"),
    year1_growth_rate: pctParam("Year 1 Growth Rate"),
    year2_growth_rate: pctParam("Year 2 Growth Rate"),
    starting_month_auv_pct: pctParam("Starting Month AUV %"),
  }),
  operating_costs: z.object({
    cogs_pct: pctParam("COGS %"),
    labor_pct: pctParam("Labor %"),
    rent_monthly: currencyParam("Monthly Rent"),
    utilities_monthly: currencyParam("Monthly Utilities"),
    insurance_monthly: currencyParam("Monthly Insurance"),
    marketing_pct: pctParam("Marketing %"),
    royalty_pct: pctParam("Royalty %"),
    ad_fund_pct: pctParam("Ad Fund %"),
    other_monthly: currencyParam("Other Monthly"),
  }),
  financing: z.object({
    loan_amount: currencyParam("Loan Amount"),
    interest_rate: pctParam("Interest Rate"),
    loan_term_months: intParam("Loan Term", 0),
    down_payment_pct: pctParam("Down Payment %"),
  }),
  startup_capital: z.object({
    working_capital_months: intParam("Working Capital Months", 0),
    depreciation_years: intParam("Depreciation Years", 0),
  }),
});

export type BrandParameters = z.infer<typeof brandParameterSchema>;

export const startupCostItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  default_amount: z.number().min(0),
  capex_classification: z.enum(["capex", "non_capex", "working_capital"]),
  item7_range_low: z.number().min(0).nullable(),
  item7_range_high: z.number().min(0).nullable(),
  sort_order: z.number(),
});

export type StartupCostItem = z.infer<typeof startupCostItemSchema>;

export const startupCostTemplateSchema = z.array(startupCostItemSchema);

export type StartupCostTemplate = z.infer<typeof startupCostTemplateSchema>;

// ─── Plan Startup Cost Line Item (enhanced, for plan JSONB) ──────────────

export const planStartupCostLineItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  amount: z.number().int().min(0),
  capexClassification: z.enum(["capex", "non_capex", "working_capital"]),
  isCustom: z.boolean(),
  source: z.string().refine(
    (s) => ["brand_default", "user_entry"].includes(s) || s.startsWith("admin:"),
    { message: "source must be brand_default, user_entry, or admin:[name]" }
  ),
  brandDefaultAmount: z.number().int().min(0).nullable(),
  item7RangeLow: z.number().int().min(0).nullable(),
  item7RangeHigh: z.number().int().min(0).nullable(),
  sortOrder: z.number().int().min(0),
}).refine(
  (data) => !(data.isCustom && data.brandDefaultAmount !== null),
  { message: "Custom items must have null brandDefaultAmount" }
).refine(
  (data) => !(!data.isCustom && data.brandDefaultAmount === null),
  { message: "Template items must have non-null brandDefaultAmount" }
).refine(
  (data) => {
    if (data.item7RangeLow !== null && data.item7RangeHigh !== null) {
      return data.item7RangeLow <= data.item7RangeHigh;
    }
    return true;
  },
  { message: "item7RangeLow must be <= item7RangeHigh" }
);

export const planStartupCostsSchema = z.array(planStartupCostLineItemSchema);

export const brandThemeSchema = z.object({
  logo_url: z.string().nullable(),
  primary_color: z.string().nullable(),
  display_name: z.string().nullable(),
});

export type BrandTheme = z.infer<typeof brandThemeSchema>;

export const brands = pgTable("brands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  displayName: text("display_name"),
  brandParameters: jsonb("brand_parameters").$type<BrandParameters>(),
  startupCostTemplate: jsonb("startup_cost_template").$type<StartupCostTemplate>(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color"),
  defaultBookingUrl: text("default_booking_url"),
  defaultAccountManagerId: varchar("default_account_manager_id"),
  franchisorAcknowledgmentEnabled: boolean("franchisor_acknowledgment_enabled").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBrandSchema = createInsertSchema(brands).omit({
  id: true,
  createdAt: true,
});
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type Brand = typeof brands.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  profileImageUrl: text("profile_image_url"),
  role: text("role").notNull().$type<"franchisee" | "franchisor" | "katalyst_admin">(),
  brandId: varchar("brand_id").references(() => brands.id),
  displayName: text("display_name"),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  preferredTier: text("preferred_tier").$type<"planning_assistant" | "forms" | "quick_entry">(),
  accountManagerId: varchar("account_manager_id").references(() => users.id),
  bookingUrl: text("booking_url"),
  isDemoUser: boolean("is_demo_user").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_users_email").on(table.email),
  index("idx_users_brand_id").on(table.brandId),
]);

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const invitations = pgTable("invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  role: text("role").notNull().$type<"franchisee" | "franchisor" | "katalyst_admin">(),
  brandId: varchar("brand_id").references(() => brands.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_invitations_token").on(table.token),
  index("idx_invitations_email").on(table.email),
]);

export const insertInvitationSchema = createInsertSchema(invitations).omit({
  id: true,
  createdAt: true,
  acceptedAt: true,
});
export type InsertInvitation = z.infer<typeof insertInvitationSchema>;
export type Invitation = typeof invitations.$inferSelect;

export const plans = pgTable("plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  brandId: varchar("brand_id").references(() => brands.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  financialInputs: jsonb("financial_inputs").$type<import("./financial-engine").PlanFinancialInputs>(),
  startupCosts: jsonb("startup_costs").$type<import("./financial-engine").StartupCostLineItem[]>(),
  status: text("status").notNull().$type<"draft" | "in_progress" | "completed">().default("draft"),
  pipelineStage: text("pipeline_stage").$type<"planning" | "site_evaluation" | "financing" | "construction" | "open">().default("planning"),
  quickStartCompleted: boolean("quick_start_completed").default(false).notNull(),
  quickStartStaffCount: integer("quick_start_staff_count"),
  targetMarket: text("target_market"),
  targetOpenQuarter: text("target_open_quarter"),
  lastAutoSave: timestamp("last_auto_save"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_plans_user_id").on(table.userId),
  index("idx_plans_brand_id").on(table.brandId),
]);

export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastAutoSave: true,
});
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = typeof plans.$inferSelect;
export const updatePlanSchema = insertPlanSchema.partial();
export type UpdatePlan = z.infer<typeof updatePlanSchema>;

// ─── Financial Input JSONB Validation (Story 3.5 — API boundary) ─────────

export const financialFieldValueSchema = z.object({
  currentValue: z.number(),
  source: z.string().refine(
    (s) => ["brand_default", "user_entry", "ai_populated"].includes(s) || s.startsWith("admin:"),
    { message: "source must be brand_default, user_entry, ai_populated, or admin:[name]" }
  ),
  brandDefault: z.number().nullable(),
  item7Range: z.object({ min: z.number(), max: z.number() }).nullable(),
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

export const brandAccountManagers = pgTable("brand_account_managers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  brandId: varchar("brand_id").notNull().references(() => brands.id),
  accountManagerId: varchar("account_manager_id").notNull().references(() => users.id),
  bookingUrl: text("booking_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("idx_brand_account_managers_unique").on(table.brandId, table.accountManagerId),
  index("idx_brand_account_managers_brand").on(table.brandId),
]);

export const insertBrandAccountManagerSchema = createInsertSchema(brandAccountManagers).omit({
  id: true,
  createdAt: true,
});
export type InsertBrandAccountManager = z.infer<typeof insertBrandAccountManagerSchema>;
export type BrandAccountManager = typeof brandAccountManagers.$inferSelect;

// ─── Impersonation Status (ST.1 — frontend/backend contract) ─────────────

export type ImpersonationStatus =
  | { active: false; expired?: boolean; returnBrandId?: string | null }
  | {
      active: true;
      targetUser: {
        id: string;
        displayName: string | null;
        email: string;
        role: string;
        brandId: string | null;
      };
      readOnly: boolean;
      editingEnabled: boolean;
      remainingMinutes: number;
      returnBrandId: string | null;
    };

// ─── Demo Mode Status (ST.3 — frontend/backend contract) ─────────────────

export type DemoModeStatus =
  | { active: false }
  | {
      active: true;
      brandId: string;
      brandName: string;
      demoUserId: string;
    };

export const impersonationAuditLogs = pgTable("impersonation_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminUserId: varchar("admin_user_id").notNull().references(() => users.id),
  impersonatedUserId: varchar("impersonated_user_id").notNull().references(() => users.id),
  editSessionStartedAt: timestamp("edit_session_started_at").notNull(),
  editSessionEndedAt: timestamp("edit_session_ended_at"),
  actionsSummary: jsonb("actions_summary").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_audit_logs_admin").on(table.adminUserId),
  index("idx_audit_logs_impersonated").on(table.impersonatedUserId),
]);

export const insertImpersonationAuditLogSchema = createInsertSchema(impersonationAuditLogs).omit({
  id: true,
  createdAt: true,
});
export type InsertImpersonationAuditLog = z.infer<typeof insertImpersonationAuditLogSchema>;
export type ImpersonationAuditLog = typeof impersonationAuditLogs.$inferSelect;

// ─── Brand Validation Runs (Story 3.7) ───────────────────────────────────

export interface ValidationMetricComparison {
  metric: string;
  category: string;
  expected: number;
  actual: number;
  difference: number;
  toleranceUsed: number;
  passed: boolean;
}

export interface ValidationToleranceConfig {
  currency: number;
  percentage: number;
  months: number;
}

export const brandValidationRuns = pgTable("brand_validation_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  brandId: varchar("brand_id").notNull().references(() => brands.id),
  runAt: timestamp("run_at").defaultNow().notNull(),
  status: text("status").notNull().$type<"pass" | "fail">(),
  testInputs: jsonb("test_inputs").notNull(),
  expectedOutputs: jsonb("expected_outputs").notNull(),
  actualOutputs: jsonb("actual_outputs").notNull(),
  comparisonResults: jsonb("comparison_results").$type<ValidationMetricComparison[]>().notNull(),
  toleranceConfig: jsonb("tolerance_config").$type<ValidationToleranceConfig>().notNull(),
  runBy: varchar("run_by").references(() => users.id),
  notes: text("notes"),
}, (table) => [
  index("idx_brand_validation_runs_brand").on(table.brandId),
]);

export const insertBrandValidationRunSchema = createInsertSchema(brandValidationRuns).omit({
  id: true,
});
export type InsertBrandValidationRun = z.infer<typeof insertBrandValidationRunSchema>;
export type BrandValidationRun = typeof brandValidationRuns.$inferSelect;
