import { eq, and, isNull, gt } from "drizzle-orm";
import { db } from "./db";
import {
  type User,
  type InsertUser,
  type Invitation,
  type InsertInvitation,
  type Brand,
  type InsertBrand,
  users,
  invitations,
  brands,
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
  createBrand(brand: InsertBrand): Promise<Brand>;
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

  async createBrand(brand: InsertBrand): Promise<Brand> {
    const [created] = await db.insert(brands).values(brand).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
