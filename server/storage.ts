import { eq, and, desc, sql, isNull, gt } from "drizzle-orm";
import { db } from "./db";
import {
  users, brands, invitations, plans,
  brandAccountManagers, brandValidationRuns, auditLogs,
  type User, type InsertUser, type Brand, type Invitation, type Plan,
  type BrandParameters, type StartupCostTemplate,
} from "@shared/schema";
import { buildPlanFinancialInputs, buildPlanStartupCosts, migrateStartupCosts } from "@shared/plan-initialization";
import type { StartupCostLineItem } from "@shared/financial-engine";

type InsertPlan = {
  userId: string;
  brandId: string;
  name?: string;
  financialInputs?: any;
  startupCosts?: any;
  quickStartCompleted?: boolean;
};

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(data: InsertUser): Promise<User>;
  upsertUserFromGoogle(data: { email: string; displayName: string; profileImageUrl: string | null }): Promise<User>;
  upsertDevUser(data: { role: string; brandSlug: string; brandId: string; brandDisplayName: string }): Promise<User>;
  updateUserPreferredTier(userId: string, tier: string): Promise<User>;
  updateUserOnboarding(userId: string, data: { onboardingCompleted: boolean; preferredTier?: string }): Promise<void>;
  assignAccountManager(userId: string, accountManagerId: string, bookingUrl: string): Promise<User>;

  getBrands(): Promise<Brand[]>;
  getBrand(id: string): Promise<Brand | undefined>;
  getBrandBySlug(slug: string): Promise<Brand | undefined>;
  getBrandByName(name: string): Promise<Brand | undefined>;
  createBrand(data: { name: string; slug: string; displayName: string }): Promise<Brand>;
  updateBrand(id: string, data: Record<string, any>): Promise<Brand>;
  updateBrandParameters(brandId: string, parameters: any): Promise<Brand>;
  updateStartupCostTemplate(brandId: string, template: any): Promise<Brand>;
  updateBrandIdentity(brandId: string, data: Record<string, any>): Promise<Brand>;
  getFranchiseesByBrand(brandId: string): Promise<User[]>;
  getBrandAccountManagers(brandId: string): Promise<any[]>;
  getBrandAccountManager(brandId: string, userId: string): Promise<any | undefined>;
  upsertBrandAccountManager(brandId: string, userId: string, bookingUrl: string | null): Promise<any>;
  removeBrandAccountManager(brandId: string, userId: string): Promise<void>;
  setDefaultAccountManager(brandId: string, managerId: string | null): Promise<Brand>;

  createBrandValidationRun(data: {
    brandId: string;
    runAt: Date;
    status: string;
    testInputs: any;
    expectedOutputs: any;
    actualOutputs: any;
    comparisonResults: any;
    toleranceConfig: any;
    runBy: string;
    notes: string | null;
  }): Promise<any>;
  getBrandValidationRuns(brandId: string): Promise<any[]>;
  getBrandValidationRun(id: string): Promise<any | undefined>;

  getPlan(id: string): Promise<Plan | undefined>;
  getPlansByUser(userId: string): Promise<Plan[]>;
  getPlansByBrand(brandId: string): Promise<Plan[]>;
  createPlan(data: InsertPlan): Promise<Plan>;
  updatePlan(id: string, data: any): Promise<Plan>;
  getStartupCosts(planId: string): Promise<StartupCostLineItem[]>;
  updateStartupCosts(planId: string, costs: any): Promise<any>;
  resetStartupCostsToDefaults(planId: string, brandId: string): Promise<any>;

  getKatalystAdmins(): Promise<User[]>;
  createAuditLog(data: {
    adminUserId: string;
    impersonatedUserId: string;
    editSessionStartedAt: Date;
    editSessionEndedAt: Date | null;
    actionsSummary: string[];
  }): Promise<any>;
  endAuditLog(id: string): Promise<void>;
  appendAuditLogAction(id: string, action: string): Promise<void>;
  getAuditLogs(): Promise<any[]>;

  getDemoUserForBrand(brandId: string): Promise<User | undefined>;
  createDemoUser(brandId: string, brandName: string, brandSlug: string): Promise<User>;
  createDemoPlan(userId: string, brandId: string, brand: Brand): Promise<Plan>;
  resetDemoPlan(planId: string, brandId: string): Promise<Plan>;

  createInvitation(data: {
    email: string;
    role: string;
    brandId: string | null;
    token: string;
    expiresAt: Date;
    createdBy: string;
  }): Promise<Invitation>;
  getInvitations(): Promise<Invitation[]>;
  getInvitationsByBrand(brandId: string): Promise<Invitation[]>;
  getInvitationByToken(token: string): Promise<Invitation | undefined>;
  getPendingInvitation(email: string, role: string, brandId: string | null): Promise<Invitation | undefined>;
  markInvitationAccepted(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async upsertUserFromGoogle(data: { email: string; displayName: string; profileImageUrl: string | null }): Promise<User> {
    const existing = await this.getUserByEmail(data.email);
    if (existing) {
      const [updated] = await db.update(users).set({
        displayName: data.displayName,
        profileImageUrl: data.profileImageUrl,
        updatedAt: new Date(),
      }).where(eq(users.id, existing.id)).returning();
      return updated;
    }
    const [user] = await db.insert(users).values({
      email: data.email,
      displayName: data.displayName,
      profileImageUrl: data.profileImageUrl,
      role: "katalyst_admin",
    }).returning();
    return user;
  }

  async upsertDevUser(data: { role: string; brandSlug: string; brandId: string; brandDisplayName: string }): Promise<User> {
    const email = `dev-${data.role}@${data.brandSlug}.localhost`;
    const displayName = `Dev ${data.brandDisplayName} ${data.role}`;
    const existing = await this.getUserByEmail(email);
    if (existing) {
      return existing;
    }
    const [user] = await db.insert(users).values({
      email,
      displayName,
      role: data.role,
      brandId: data.brandId,
    }).returning();
    return user;
  }

  async updateUserPreferredTier(userId: string, tier: string): Promise<User> {
    const [updated] = await db.update(users).set({
      preferredTier: tier,
      updatedAt: new Date(),
    }).where(eq(users.id, userId)).returning();
    return updated;
  }

  async updateUserOnboarding(userId: string, data: { onboardingCompleted: boolean; preferredTier?: string }): Promise<void> {
    const setData: Record<string, any> = {
      onboardingCompleted: data.onboardingCompleted,
      updatedAt: new Date(),
    };
    if (data.preferredTier !== undefined) {
      setData.preferredTier = data.preferredTier;
    }
    await db.update(users).set(setData).where(eq(users.id, userId));
  }

  async assignAccountManager(userId: string, accountManagerId: string, bookingUrl: string): Promise<User> {
    const [updated] = await db.update(users).set({
      accountManagerId,
      bookingUrl,
      updatedAt: new Date(),
    }).where(eq(users.id, userId)).returning();
    return updated;
  }

  async getBrands(): Promise<Brand[]> {
    return db.select().from(brands);
  }

  async getBrand(id: string): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.id, id));
    return brand;
  }

  async getBrandBySlug(slug: string): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.slug, slug));
    return brand;
  }

  async getBrandByName(name: string): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.name, name));
    return brand;
  }

  async createBrand(data: { name: string; slug: string; displayName: string }): Promise<Brand> {
    const [brand] = await db.insert(brands).values(data).returning();
    return brand;
  }

  async updateBrand(id: string, data: Record<string, any>): Promise<Brand> {
    const [updated] = await db.update(brands).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(brands.id, id)).returning();
    return updated;
  }

  async updateBrandParameters(brandId: string, parameters: any): Promise<Brand> {
    const [updated] = await db.update(brands).set({
      brandParameters: parameters,
      updatedAt: new Date(),
    }).where(eq(brands.id, brandId)).returning();
    return updated;
  }

  async updateStartupCostTemplate(brandId: string, template: any): Promise<Brand> {
    const [updated] = await db.update(brands).set({
      startupCostTemplate: template,
      updatedAt: new Date(),
    }).where(eq(brands.id, brandId)).returning();
    return updated;
  }

  async updateBrandIdentity(brandId: string, data: Record<string, any>): Promise<Brand> {
    const [updated] = await db.update(brands).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(brands.id, brandId)).returning();
    return updated;
  }

  async getFranchiseesByBrand(brandId: string): Promise<User[]> {
    return db.select().from(users).where(
      and(eq(users.role, "franchisee"), eq(users.brandId, brandId))
    );
  }

  async getBrandAccountManagers(brandId: string): Promise<any[]> {
    const rows = await db
      .select({
        id: brandAccountManagers.id,
        brandId: brandAccountManagers.brandId,
        userId: brandAccountManagers.userId,
        bookingUrl: brandAccountManagers.bookingUrl,
        createdAt: brandAccountManagers.createdAt,
        displayName: users.displayName,
        email: users.email,
      })
      .from(brandAccountManagers)
      .innerJoin(users, eq(brandAccountManagers.userId, users.id))
      .where(eq(brandAccountManagers.brandId, brandId));
    return rows;
  }

  async getBrandAccountManager(brandId: string, userId: string): Promise<any | undefined> {
    const [row] = await db.select().from(brandAccountManagers).where(
      and(eq(brandAccountManagers.brandId, brandId), eq(brandAccountManagers.userId, userId))
    );
    return row;
  }

  async upsertBrandAccountManager(brandId: string, userId: string, bookingUrl: string | null): Promise<any> {
    const existing = await this.getBrandAccountManager(brandId, userId);
    if (existing) {
      const [updated] = await db.update(brandAccountManagers).set({
        bookingUrl,
      }).where(eq(brandAccountManagers.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(brandAccountManagers).values({
      brandId,
      userId,
      bookingUrl,
    }).returning();
    return created;
  }

  async removeBrandAccountManager(brandId: string, userId: string): Promise<void> {
    await db.delete(brandAccountManagers).where(
      and(eq(brandAccountManagers.brandId, brandId), eq(brandAccountManagers.userId, userId))
    );
  }

  async setDefaultAccountManager(brandId: string, managerId: string | null): Promise<Brand> {
    const [updated] = await db.update(brands).set({
      defaultAccountManagerId: managerId,
      updatedAt: new Date(),
    }).where(eq(brands.id, brandId)).returning();
    return updated;
  }

  async createBrandValidationRun(data: {
    brandId: string;
    runAt: Date;
    status: string;
    testInputs: any;
    expectedOutputs: any;
    actualOutputs: any;
    comparisonResults: any;
    toleranceConfig: any;
    runBy: string;
    notes: string | null;
  }): Promise<any> {
    const [run] = await db.insert(brandValidationRuns).values(data).returning();
    return run;
  }

  async getBrandValidationRuns(brandId: string): Promise<any[]> {
    return db.select().from(brandValidationRuns)
      .where(eq(brandValidationRuns.brandId, brandId))
      .orderBy(desc(brandValidationRuns.createdAt));
  }

  async getBrandValidationRun(id: string): Promise<any | undefined> {
    const [run] = await db.select().from(brandValidationRuns).where(eq(brandValidationRuns.id, id));
    return run;
  }

  async getPlan(id: string): Promise<Plan | undefined> {
    const [plan] = await db.select().from(plans).where(eq(plans.id, id));
    return plan;
  }

  async getPlansByUser(userId: string): Promise<Plan[]> {
    return db.select().from(plans).where(eq(plans.userId, userId));
  }

  async getPlansByBrand(brandId: string): Promise<Plan[]> {
    return db.select().from(plans).where(eq(plans.brandId, brandId));
  }

  async createPlan(data: InsertPlan): Promise<Plan> {
    const [plan] = await db.insert(plans).values(data).returning();
    return plan;
  }

  async updatePlan(id: string, data: any): Promise<Plan> {
    const [updated] = await db.update(plans).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(plans.id, id)).returning();
    return updated;
  }

  async getStartupCosts(planId: string): Promise<StartupCostLineItem[]> {
    const plan = await this.getPlan(planId);
    if (!plan || !plan.startupCosts) return [];
    const costs = plan.startupCosts as any[];
    if (costs.length === 0) return [];
    const first = costs[0];
    if (first && typeof first === "object" && "isCustom" in first) {
      return costs as StartupCostLineItem[];
    }
    return migrateStartupCosts(costs as any);
  }

  async updateStartupCosts(planId: string, costs: any): Promise<any> {
    const [updated] = await db.update(plans).set({
      startupCosts: costs,
      updatedAt: new Date(),
    }).where(eq(plans.id, planId)).returning();
    return updated.startupCosts;
  }

  async resetStartupCostsToDefaults(planId: string, brandId: string): Promise<any> {
    const brand = await this.getBrand(brandId);
    const template = brand?.startupCostTemplate ?? [];
    const costs = buildPlanStartupCosts(template as StartupCostTemplate);
    const [updated] = await db.update(plans).set({
      startupCosts: costs,
      updatedAt: new Date(),
    }).where(eq(plans.id, planId)).returning();
    return updated.startupCosts;
  }

  async getKatalystAdmins(): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, "katalyst_admin"));
  }

  async createAuditLog(data: {
    adminUserId: string;
    impersonatedUserId: string;
    editSessionStartedAt: Date;
    editSessionEndedAt: Date | null;
    actionsSummary: string[];
  }): Promise<any> {
    const [log] = await db.insert(auditLogs).values(data).returning();
    return log;
  }

  async endAuditLog(id: string): Promise<void> {
    await db.update(auditLogs).set({
      editSessionEndedAt: new Date(),
    }).where(eq(auditLogs.id, id));
  }

  async appendAuditLogAction(id: string, action: string): Promise<void> {
    await db.update(auditLogs).set({
      actionsSummary: sql`${auditLogs.actionsSummary} || ${JSON.stringify([action])}::jsonb`,
    }).where(eq(auditLogs.id, id));
  }

  async getAuditLogs(): Promise<any[]> {
    return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
  }

  async getDemoUserForBrand(brandId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      and(eq(users.isDemoUser, true), eq(users.brandId, brandId))
    );
    return user;
  }

  async createDemoUser(brandId: string, brandName: string, brandSlug: string): Promise<User> {
    const email = `demo@${brandSlug}.localhost`;
    const [user] = await db.insert(users).values({
      email,
      displayName: `Demo ${brandName} Franchisee`,
      role: "franchisee",
      brandId,
      isDemoUser: true,
      onboardingCompleted: true,
      preferredTier: "forms",
    }).returning();
    return user;
  }

  async createDemoPlan(userId: string, brandId: string, brand: Brand): Promise<Plan> {
    const brandParams = brand.brandParameters as BrandParameters | null;
    const template = brand.startupCostTemplate as StartupCostTemplate | null;

    const financialInputs = brandParams ? buildPlanFinancialInputs(brandParams) : null;
    const startupCosts = template ? buildPlanStartupCosts(template) : [];

    const [plan] = await db.insert(plans).values({
      userId,
      brandId,
      name: `${brand.displayName || brand.name} Demo Plan`,
      financialInputs,
      startupCosts,
      quickStartCompleted: true,
    }).returning();
    return plan;
  }

  async resetDemoPlan(planId: string, brandId: string): Promise<Plan> {
    const brand = await this.getBrand(brandId);
    const brandParams = brand?.brandParameters as BrandParameters | null;
    const template = brand?.startupCostTemplate as StartupCostTemplate | null;

    const financialInputs = brandParams ? buildPlanFinancialInputs(brandParams) : null;
    const startupCosts = template ? buildPlanStartupCosts(template) : [];

    const [updated] = await db.update(plans).set({
      financialInputs,
      startupCosts,
      quickStartCompleted: true,
      updatedAt: new Date(),
    }).where(eq(plans.id, planId)).returning();
    return updated;
  }

  async createInvitation(data: {
    email: string;
    role: string;
    brandId: string | null;
    token: string;
    expiresAt: Date;
    createdBy: string;
  }): Promise<Invitation> {
    const [invitation] = await db.insert(invitations).values(data).returning();
    return invitation;
  }

  async getInvitations(): Promise<Invitation[]> {
    return db.select().from(invitations);
  }

  async getInvitationsByBrand(brandId: string): Promise<Invitation[]> {
    return db.select().from(invitations).where(eq(invitations.brandId, brandId));
  }

  async getInvitationByToken(token: string): Promise<Invitation | undefined> {
    const [invitation] = await db.select().from(invitations).where(eq(invitations.token, token));
    return invitation;
  }

  async getPendingInvitation(email: string, role: string, brandId: string | null): Promise<Invitation | undefined> {
    const conditions = [
      eq(invitations.email, email),
      eq(invitations.role, role),
      isNull(invitations.acceptedAt),
      gt(invitations.expiresAt, new Date()),
    ];
    if (brandId !== null) {
      conditions.push(eq(invitations.brandId, brandId));
    } else {
      conditions.push(isNull(invitations.brandId));
    }
    const [invitation] = await db.select().from(invitations).where(and(...conditions));
    return invitation;
  }

  async markInvitationAccepted(id: string): Promise<void> {
    await db.update(invitations).set({
      acceptedAt: new Date(),
    }).where(eq(invitations.id, id));
  }
}

export const storage = new DatabaseStorage();
