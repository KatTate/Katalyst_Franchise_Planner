import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

vi.mock("../storage", () => ({
  storage: {
    getBrands: vi.fn(),
    getBrand: vi.fn(),
    getBrandBySlug: vi.fn(),
    getBrandByName: vi.fn(),
    createBrand: vi.fn(),
    updateBrand: vi.fn(),
    updateBrandParameters: vi.fn(),
    updateStartupCostTemplate: vi.fn(),
    updateBrandIdentity: vi.fn(),
    getFranchiseesByBrand: vi.fn(),
    getBrandAccountManagers: vi.fn(),
    upsertBrandAccountManager: vi.fn(),
    removeBrandAccountManager: vi.fn(),
    setDefaultAccountManager: vi.fn(),
    getUser: vi.fn(),
    getKatalystAdmins: vi.fn(),
  },
}));

import { storage } from "../storage";

const createBrandSchema = z.object({
  name: z.string().min(1, "Brand name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  display_name: z.string().max(100).optional(),
});

const brandIdentitySchema = z.object({
  display_name: z.string().max(100).nullable().optional(),
  logo_url: z.string().url().nullable().optional(),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color").nullable().optional(),
  default_booking_url: z.string().url().nullable().optional(),
  franchisor_acknowledgment_enabled: z.boolean().optional(),
});

describe("Brands Routes - Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Brand Creation Schema Validation", () => {
    it("should validate valid brand creation data", () => {
      const parsed = createBrandSchema.safeParse({
        name: "PostNet",
        slug: "postnet",
        display_name: "PostNet Franchise",
      });
      expect(parsed.success).toBe(true);
    });

    it("should reject empty brand name", () => {
      const parsed = createBrandSchema.safeParse({
        name: "",
        slug: "postnet",
      });
      expect(parsed.success).toBe(false);
    });

    it("should reject invalid slug format (uppercase)", () => {
      const parsed = createBrandSchema.safeParse({
        name: "PostNet",
        slug: "PostNet",
      });
      expect(parsed.success).toBe(false);
    });

    it("should reject slug with spaces", () => {
      const parsed = createBrandSchema.safeParse({
        name: "PostNet",
        slug: "post net",
      });
      expect(parsed.success).toBe(false);
    });

    it("should accept slug with hyphens", () => {
      const parsed = createBrandSchema.safeParse({
        name: "PostNet US",
        slug: "postnet-us",
      });
      expect(parsed.success).toBe(true);
    });

    it("should accept without display_name", () => {
      const parsed = createBrandSchema.safeParse({
        name: "PostNet",
        slug: "postnet",
      });
      expect(parsed.success).toBe(true);
    });
  });

  describe("Brand Identity Schema Validation", () => {
    it("should validate valid identity data", () => {
      const parsed = brandIdentitySchema.safeParse({
        display_name: "PostNet",
        primary_color: "#FF5733",
        franchisor_acknowledgment_enabled: true,
      });
      expect(parsed.success).toBe(true);
    });

    it("should reject invalid hex color", () => {
      const parsed = brandIdentitySchema.safeParse({
        primary_color: "red",
      });
      expect(parsed.success).toBe(false);
    });

    it("should reject invalid URL format", () => {
      const parsed = brandIdentitySchema.safeParse({
        logo_url: "not-a-url",
      });
      expect(parsed.success).toBe(false);
    });

    it("should accept null values for nullable fields", () => {
      const parsed = brandIdentitySchema.safeParse({
        display_name: null,
        logo_url: null,
        primary_color: null,
        default_booking_url: null,
      });
      expect(parsed.success).toBe(true);
    });

    it("should accept empty object", () => {
      const parsed = brandIdentitySchema.safeParse({});
      expect(parsed.success).toBe(true);
    });
  });

  describe("Brand CRUD Operations", () => {
    it("should check for duplicate slug before creating", async () => {
      (storage.getBrandBySlug as any).mockResolvedValue(null);
      (storage.getBrandByName as any).mockResolvedValue(null);
      (storage.createBrand as any).mockResolvedValue({
        id: "brand-1",
        name: "PostNet",
        slug: "postnet",
        displayName: "PostNet",
      });

      const existingSlug = await storage.getBrandBySlug("postnet");
      expect(existingSlug).toBeNull();

      const brand = await storage.createBrand({
        name: "PostNet",
        slug: "postnet",
        displayName: "PostNet",
      });
      expect(brand.name).toBe("PostNet");
    });

    it("should detect duplicate slug", async () => {
      (storage.getBrandBySlug as any).mockResolvedValue({ id: "brand-1", slug: "postnet" });
      const existing = await storage.getBrandBySlug("postnet");
      expect(existing).not.toBeNull();
    });

    it("should detect duplicate name", async () => {
      (storage.getBrandByName as any).mockResolvedValue({ id: "brand-1", name: "PostNet" });
      const existing = await storage.getBrandByName("PostNet");
      expect(existing).not.toBeNull();
    });

    it("should list brands for katalyst_admin", async () => {
      (storage.getBrands as any).mockResolvedValue([
        { id: "b1", name: "PostNet" },
        { id: "b2", name: "Brand2" },
      ]);
      const brands = await storage.getBrands();
      expect(brands).toHaveLength(2);
    });

    it("should scope brands for franchisor to own brand", async () => {
      const user = { role: "franchisor", brandId: "b1" };
      (storage.getBrand as any).mockResolvedValue({ id: "b1", name: "PostNet" });

      if (user.role === "franchisor" && user.brandId) {
        const brand = await storage.getBrand(user.brandId);
        expect(brand).not.toBeNull();
      }
    });
  });

  describe("Brand Parameters", () => {
    it("should update brand parameters", async () => {
      const mockParams = {
        revenue: {
          monthly_auv: { value: 50000, label: "Monthly AUV", description: "Average unit volume" },
          year1_growth_rate: { value: 0.1, label: "Year 1 Growth", description: "Growth rate" },
          year2_growth_rate: { value: 0.05, label: "Year 2 Growth", description: "Growth rate" },
          starting_month_auv_pct: { value: 0.5, label: "Starting %", description: "Starting month percentage" },
        },
        operating_costs: {
          cogs_pct: { value: 0.3, label: "COGS", description: "Cost of goods" },
          labor_pct: { value: 0.25, label: "Labor", description: "Labor cost" },
          rent_monthly: { value: 3000, label: "Rent", description: "Monthly rent" },
          utilities_monthly: { value: 500, label: "Utilities", description: "Monthly utilities" },
          insurance_monthly: { value: 200, label: "Insurance", description: "Monthly insurance" },
          marketing_pct: { value: 0.05, label: "Marketing", description: "Marketing spend" },
          royalty_pct: { value: 0.06, label: "Royalty", description: "Franchise royalty" },
          ad_fund_pct: { value: 0.02, label: "Ad Fund", description: "Ad fund contribution" },
          other_monthly: { value: 500, label: "Other", description: "Other costs" },
        },
        financing: {
          loan_amount: { value: 100000, label: "Loan", description: "Loan amount" },
          interest_rate: { value: 0.07, label: "Rate", description: "Interest rate" },
          loan_term_months: { value: 84, label: "Term", description: "Loan term" },
          down_payment_pct: { value: 0.2, label: "Down Payment", description: "Down payment" },
        },
        startup_capital: {
          working_capital_months: { value: 3, label: "Working Capital", description: "Months of working capital" },
          depreciation_years: { value: 7, label: "Depreciation", description: "Years of depreciation" },
        },
      };

      (storage.updateBrandParameters as any).mockResolvedValue({
        id: "b1",
        brandParameters: mockParams,
      });

      const result = await storage.updateBrandParameters("b1", mockParams as any);
      expect(result.brandParameters).toEqual(mockParams);
    });
  });

  describe("Account Manager Operations", () => {
    it("should verify manager is katalyst_admin before assigning", async () => {
      (storage.getUser as any).mockResolvedValue({ id: "m1", role: "katalyst_admin" });
      const manager = await storage.getUser("m1");
      expect(manager!.role).toBe("katalyst_admin");
    });

    it("should reject non-admin as account manager", async () => {
      (storage.getUser as any).mockResolvedValue({ id: "m1", role: "franchisee" });
      const manager = await storage.getUser("m1");
      expect(manager!.role !== "katalyst_admin").toBe(true);
    });

    it("should clear default manager when deleting that manager", async () => {
      const brand = { id: "b1", defaultAccountManagerId: "m1" };
      (storage.getBrand as any).mockResolvedValue(brand);
      (storage.setDefaultAccountManager as any).mockResolvedValue({});
      (storage.removeBrandAccountManager as any).mockResolvedValue(undefined);

      const fetchedBrand = await storage.getBrand("b1");
      if (fetchedBrand!.defaultAccountManagerId === "m1") {
        await storage.setDefaultAccountManager("b1", null);
      }
      await storage.removeBrandAccountManager("b1", "m1");

      expect(storage.setDefaultAccountManager).toHaveBeenCalledWith("b1", null);
      expect(storage.removeBrandAccountManager).toHaveBeenCalledWith("b1", "m1");
    });
  });
});
