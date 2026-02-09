import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, index, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const brandParameterSchema = z.object({
  revenue: z.object({
    monthly_auv: z.object({ value: z.number(), label: z.string(), description: z.string() }),
    year1_growth_rate: z.object({ value: z.number(), label: z.string(), description: z.string() }),
    year2_growth_rate: z.object({ value: z.number(), label: z.string(), description: z.string() }),
    starting_month_auv_pct: z.object({ value: z.number(), label: z.string(), description: z.string() }),
  }),
  operating_costs: z.object({
    cogs_pct: z.object({ value: z.number(), label: z.string(), description: z.string() }),
    labor_pct: z.object({ value: z.number(), label: z.string(), description: z.string() }),
    rent_monthly: z.object({ value: z.number(), label: z.string(), description: z.string() }),
    utilities_monthly: z.object({ value: z.number(), label: z.string(), description: z.string() }),
    insurance_monthly: z.object({ value: z.number(), label: z.string(), description: z.string() }),
    marketing_pct: z.object({ value: z.number(), label: z.string(), description: z.string() }),
    royalty_pct: z.object({ value: z.number(), label: z.string(), description: z.string() }),
    ad_fund_pct: z.object({ value: z.number(), label: z.string(), description: z.string() }),
    other_monthly: z.object({ value: z.number(), label: z.string(), description: z.string() }),
  }),
  financing: z.object({
    loan_amount: z.object({ value: z.number(), label: z.string(), description: z.string() }),
    interest_rate: z.object({ value: z.number(), label: z.string(), description: z.string() }),
    loan_term_months: z.object({ value: z.number(), label: z.string(), description: z.string() }),
    down_payment_pct: z.object({ value: z.number(), label: z.string(), description: z.string() }),
  }),
  startup_capital: z.object({
    working_capital_months: z.object({ value: z.number(), label: z.string(), description: z.string() }),
    depreciation_years: z.object({ value: z.number(), label: z.string(), description: z.string() }),
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

export const brandThemeSchema = z.object({
  logo_url: z.string().nullable(),
  primary_color: z.string().nullable(),
  display_name: z.string().nullable(),
});

export type BrandTheme = z.infer<typeof brandThemeSchema>;

export const brands = pgTable("brands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  displayName: text("display_name"),
  brandParameters: jsonb("brand_parameters").$type<BrandParameters>(),
  startupCostTemplate: jsonb("startup_cost_template").$type<StartupCostTemplate>(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color"),
  defaultBookingUrl: text("default_booking_url"),
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
