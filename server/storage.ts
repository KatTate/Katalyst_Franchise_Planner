import { eq, and, isNull, gt } from "drizzle-orm";
import { db } from "./db";
import {
  type User,
  type InsertUser,
  type Invitation,
  type InsertInvitation,
  type Brand,
  type InsertBrand,
  type Plan,
  type InsertPlan,
  type UpdatePlan,
  type BrandParameters,
  type StartupCostTemplate,
  type BrandAccountManager,
  type InsertBrandAccountManager,
  users,
  invitations,
  brands,
  plans,
  brandAccountManagers,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUserFromGoogle(profile: {
    email: string;
    displayName: string;
    profileImageUrl: string | null;
  }): Promise<User>;

  getInvitations(): Promise<Invitation[]>;
  getInvitationsByBrand(brandId: string): Promise<Invitation[]>;
  getInvitationByToken(token: string): Promise<Invitation | undefined>;
  getPendingInvitation(email: string, role: string, brandId: string | null): Promise<Invitation | undefined>;
  createInvitation(invitation: InsertInvitation): Promise<Invitation>;
  markInvitationAccepted(id: string): Promise<void>;

  updateUserOnboarding(userId: string, data: {
    onboardingCompleted: boolean;
    preferredTier?: "planning_assistant" | "forms" | "quick_entry" | null;
  }): Promise<User>;

  getBrands(): Promise<Brand[]>;
  getBrand(id: string): Promise<Brand | undefined>;
  getBrandBySlug(slug: string): Promise<Brand | undefined>;
  getBrandByName(name: string): Promise<Brand | undefined>;
  createBrand(brand: InsertBrand): Promise<Brand>;
  updateBrand(id: string, data: Partial<InsertBrand>): Promise<Brand>;
  updateBrandParameters(id: string, parameters: BrandParameters): Promise<Brand>;
  updateStartupCostTemplate(id: string, template: StartupCostTemplate): Promise<Brand>;
  updateBrandIdentity(id: string, data: {
    displayName?: string | null;
    logoUrl?: string | null;
    primaryColor?: string | null;
    defaultBookingUrl?: string | null;
    franchisorAcknowledgmentEnabled?: boolean;
  }): Promise<Brand>;

  assignAccountManager(franchiseeId: string, accountManagerId: string, bookingUrl: string): Promise<User>;
  getUsersByBrand(brandId: string): Promise<User[]>;
  getFranchiseesByBrand(brandId: string): Promise<User[]>;
  createPlan(plan: InsertPlan): Promise<Plan>;
  getPlan(id: string): Promise<Plan | undefined>;
  getPlansByUser(userId: string): Promise<Plan[]>;
  getPlansByBrand(brandId: string): Promise<Plan[]>;
  updatePlan(id: string, data: UpdatePlan): Promise<Plan>;
  getKatalystAdmins(): Promise<Array<{ id: string; email: string; displayName: string | null; profileImageUrl: string | null }>>;
  getBrandAccountManagers(brandId: string): Promise<BrandAccountManager[]>;
  getBrandAccountManager(brandId: string, accountManagerId: string): Promise<BrandAccountManager | undefined>;
  upsertBrandAccountManager(brandId: string, accountManagerId: string, bookingUrl: string | null): Promise<BrandAccountManager>;
  removeBrandAccountManager(brandId: string, accountManagerId: string): Promise<void>;
  setDefaultAccountManager(brandId: string, accountManagerId: string | null): Promise<Brand>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser as any).returning();
    return user;
  }

  async upsertUserFromGoogle(profile: {
    email: string;
    displayName: string;
    profileImageUrl: string | null;
  }): Promise<User> {
    const existing = await this.getUserByEmail(profile.email);
    if (existing) {
      const [updated] = await db
        .update(users)
        .set({
          displayName: profile.displayName,
          profileImageUrl: profile.profileImageUrl,
        })
        .where(eq(users.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db
      .insert(users)
      .values({
        email: profile.email,
        displayName: profile.displayName,
        profileImageUrl: profile.profileImageUrl,
        role: "katalyst_admin" as const,
        onboardingCompleted: false,
      })
      .returning();
    return created;
  }

  async getInvitations(): Promise<Invitation[]> {
    return db.select().from(invitations);
  }

  async getInvitationsByBrand(brandId: string): Promise<Invitation[]> {
    return db.select().from(invitations).where(eq(invitations.brandId, brandId));
  }

  async getInvitationByToken(token: string): Promise<Invitation | undefined> {
    const [invitation] = await db.select().from(invitations).where(eq(invitations.token, token)).limit(1);
    return invitation;
  }

  async getPendingInvitation(email: string, role: string, brandId: string | null): Promise<Invitation | undefined> {
    const conditions = [
      eq(invitations.email, email),
      eq(invitations.role, role),
      isNull(invitations.acceptedAt),
      gt(invitations.expiresAt, new Date()),
    ];
    if (brandId) {
      conditions.push(eq(invitations.brandId, brandId));
    } else {
      conditions.push(isNull(invitations.brandId));
    }
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(and(...conditions))
      .limit(1);
    return invitation;
  }

  async createInvitation(invitation: InsertInvitation): Promise<Invitation> {
    const [created] = await db.insert(invitations).values(invitation as any).returning();
    return created;
  }

  async markInvitationAccepted(id: string): Promise<void> {
    await db.update(invitations).set({ acceptedAt: new Date() }).where(eq(invitations.id, id));
  }

  async updateUserOnboarding(userId: string, data: {
    onboardingCompleted: boolean;
    preferredTier?: "planning_assistant" | "forms" | "quick_entry" | null;
  }): Promise<User> {
    const updateData: Record<string, any> = { onboardingCompleted: data.onboardingCompleted };
    if (data.preferredTier !== undefined) {
      updateData.preferredTier = data.preferredTier;
    }
    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async getBrands(): Promise<Brand[]> {
    return db.select().from(brands);
  }

  async getBrand(id: string): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.id, id)).limit(1);
    return brand;
  }

  async getBrandBySlug(slug: string): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.slug, slug)).limit(1);
    return brand;
  }

  async getBrandByName(name: string): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.name, name)).limit(1);
    return brand;
  }

  async createBrand(brand: InsertBrand): Promise<Brand> {
    const [created] = await db.insert(brands).values(brand).returning();
    return created;
  }

  async updateBrand(id: string, data: Partial<InsertBrand>): Promise<Brand> {
    const [updated] = await db.update(brands).set(data).where(eq(brands.id, id)).returning();
    return updated;
  }

  async updateBrandParameters(id: string, parameters: BrandParameters): Promise<Brand> {
    const [updated] = await db
      .update(brands)
      .set({ brandParameters: parameters })
      .where(eq(brands.id, id))
      .returning();
    return updated;
  }

  async updateStartupCostTemplate(id: string, template: StartupCostTemplate): Promise<Brand> {
    const [updated] = await db
      .update(brands)
      .set({ startupCostTemplate: template })
      .where(eq(brands.id, id))
      .returning();
    return updated;
  }

  async updateBrandIdentity(id: string, data: {
    displayName?: string | null;
    logoUrl?: string | null;
    primaryColor?: string | null;
    defaultBookingUrl?: string | null;
    franchisorAcknowledgmentEnabled?: boolean;
  }): Promise<Brand> {
    const [updated] = await db
      .update(brands)
      .set(data)
      .where(eq(brands.id, id))
      .returning();
    return updated;
  }

  async assignAccountManager(franchiseeId: string, accountManagerId: string, bookingUrl: string): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ accountManagerId, bookingUrl })
      .where(eq(users.id, franchiseeId))
      .returning();
    return updated;
  }

  async getUsersByBrand(brandId: string): Promise<User[]> {
    return db.select().from(users).where(eq(users.brandId, brandId));
  }

  async getFranchiseesByBrand(brandId: string): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(and(eq(users.brandId, brandId), eq(users.role, "franchisee")));
  }

  async createPlan(plan: InsertPlan): Promise<Plan> {
    const [created] = await db.insert(plans).values(plan as any).returning();
    return created;
  }

  async getPlan(id: string): Promise<Plan | undefined> {
    const [plan] = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
    return plan;
  }

  async getPlansByUser(userId: string): Promise<Plan[]> {
    return db.select().from(plans).where(eq(plans.userId, userId));
  }

  async getPlansByBrand(brandId: string): Promise<Plan[]> {
    return db.select().from(plans).where(eq(plans.brandId, brandId));
  }

  async updatePlan(id: string, data: UpdatePlan): Promise<Plan> {
    const [updated] = await db
      .update(plans)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(plans.id, id))
      .returning();
    return updated;
  }

  async getKatalystAdmins(): Promise<Array<{ id: string; email: string; displayName: string | null; profileImageUrl: string | null }>> {
    const admins = await db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        profileImageUrl: users.profileImageUrl,
      })
      .from(users)
      .where(eq(users.role, "katalyst_admin"));
    return admins;
  }

  async getBrandAccountManagers(brandId: string): Promise<BrandAccountManager[]> {
    return db
      .select()
      .from(brandAccountManagers)
      .where(eq(brandAccountManagers.brandId, brandId));
  }

  async getBrandAccountManager(brandId: string, accountManagerId: string): Promise<BrandAccountManager | undefined> {
    const [row] = await db
      .select()
      .from(brandAccountManagers)
      .where(
        and(
          eq(brandAccountManagers.brandId, brandId),
          eq(brandAccountManagers.accountManagerId, accountManagerId)
        )
      )
      .limit(1);
    return row;
  }

  async upsertBrandAccountManager(brandId: string, accountManagerId: string, bookingUrl: string | null): Promise<BrandAccountManager> {
    const existing = await this.getBrandAccountManager(brandId, accountManagerId);
    if (existing) {
      const [updated] = await db
        .update(brandAccountManagers)
        .set({ bookingUrl })
        .where(eq(brandAccountManagers.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db
      .insert(brandAccountManagers)
      .values({ brandId, accountManagerId, bookingUrl } as any)
      .returning();
    return created;
  }

  async removeBrandAccountManager(brandId: string, accountManagerId: string): Promise<void> {
    await db
      .delete(brandAccountManagers)
      .where(
        and(
          eq(brandAccountManagers.brandId, brandId),
          eq(brandAccountManagers.accountManagerId, accountManagerId)
        )
      );
  }

  async setDefaultAccountManager(brandId: string, accountManagerId: string | null): Promise<Brand> {
    const [updated] = await db
      .update(brands)
      .set({ defaultAccountManagerId: accountManagerId })
      .where(eq(brands.id, brandId))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
