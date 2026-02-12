import { Router, Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { brandParameterSchema, startupCostTemplateSchema } from "@shared/schema";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

const createBrandSchema = z.object({
  name: z.string().min(1, "Brand name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  display_name: z.string().max(100).optional(),
});

router.get(
  "/",
  requireAuth,
  requireRole("katalyst_admin", "franchisor"),
  async (req: Request, res: Response) => {
    const user = req.user!;
    if (user.role === "franchisor" && user.brandId) {
      const brand = await storage.getBrand(user.brandId);
      return res.json(brand ? [brand] : []);
    }
    const allBrands = await storage.getBrands();
    return res.json(allBrands);
  }
);

router.post(
  "/",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request, res: Response) => {
    const parsed = createBrandSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors.map((e) => ({ path: e.path.map(String), message: e.message })),
      });
    }

    const existingSlug = await storage.getBrandBySlug(parsed.data.slug);
    if (existingSlug) {
      return res.status(409).json({ message: "A brand with this slug already exists" });
    }

    const existingName = await storage.getBrandByName(parsed.data.name);
    if (existingName) {
      return res.status(409).json({ message: "A brand with this name already exists" });
    }

    const brand = await storage.createBrand({
      name: parsed.data.name,
      slug: parsed.data.slug,
      displayName: parsed.data.display_name || parsed.data.name,
    });

    return res.status(201).json(brand);
  }
);

router.get(
  "/:brandId",
  requireAuth,
  requireRole("katalyst_admin", "franchisor", "franchisee"),
  async (req: Request<{ brandId: string }>, res: Response) => {
    const { brandId } = req.params;
    const user = req.user!;
    if ((user.role === "franchisor" || user.role === "franchisee") && user.brandId && user.brandId !== brandId) {
      return res.status(403).json({ message: "Access denied — you can only view your own brand" });
    }
    const brand = await storage.getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    return res.json(brand);
  }
);

router.put(
  "/:brandId",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string }>, res: Response) => {
    const { brandId } = req.params;
    const brand = await storage.getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const updateSchema = z.object({
      name: z.string().min(1).max(100).optional(),
      display_name: z.string().max(100).optional(),
    });

    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors.map((e) => ({ path: e.path.map(String), message: e.message })),
      });
    }

    const updateData: Record<string, any> = {};
    if (parsed.data.name) updateData.name = parsed.data.name;
    if (parsed.data.display_name !== undefined) updateData.displayName = parsed.data.display_name;

    const updated = await storage.updateBrand(brandId, updateData);
    return res.json(updated);
  }
);

router.get(
  "/:brandId/parameters",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string }>, res: Response) => {
    const { brandId } = req.params;
    const brand = await storage.getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    return res.json(brand.brandParameters || null);
  }
);

router.put(
  "/:brandId/parameters",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string }>, res: Response) => {
    const { brandId } = req.params;
    const brand = await storage.getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const parsed = brandParameterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors.map((e) => ({ path: e.path.map(String), message: e.message })),
      });
    }

    const updated = await storage.updateBrandParameters(brandId, parsed.data);
    return res.json(updated.brandParameters);
  }
);

router.get(
  "/:brandId/startup-cost-template",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string }>, res: Response) => {
    const { brandId } = req.params;
    const brand = await storage.getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    return res.json(brand.startupCostTemplate || []);
  }
);

router.put(
  "/:brandId/startup-cost-template",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string }>, res: Response) => {
    const { brandId } = req.params;
    const brand = await storage.getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const parsed = startupCostTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors.map((e) => ({ path: e.path.map(String), message: e.message })),
      });
    }

    const updated = await storage.updateStartupCostTemplate(brandId, parsed.data);
    return res.json(updated.startupCostTemplate);
  }
);

const brandIdentitySchema = z.object({
  display_name: z.string().max(100).nullable().optional(),
  logo_url: z.string().url().nullable().optional(),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color").nullable().optional(),
  default_booking_url: z.string().url().nullable().optional(),
  franchisor_acknowledgment_enabled: z.boolean().optional(),
});

router.put(
  "/:brandId/identity",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string }>, res: Response) => {
    const { brandId } = req.params;
    const brand = await storage.getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const parsed = brandIdentitySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors.map((e) => ({ path: e.path.map(String), message: e.message })),
      });
    }

    const updateData: Record<string, any> = {};
    if (parsed.data.display_name !== undefined) updateData.displayName = parsed.data.display_name;
    if (parsed.data.logo_url !== undefined) updateData.logoUrl = parsed.data.logo_url;
    if (parsed.data.primary_color !== undefined) updateData.primaryColor = parsed.data.primary_color;
    if (parsed.data.default_booking_url !== undefined) updateData.defaultBookingUrl = parsed.data.default_booking_url;
    if (parsed.data.franchisor_acknowledgment_enabled !== undefined) updateData.franchisorAcknowledgmentEnabled = parsed.data.franchisor_acknowledgment_enabled;

    const updated = await storage.updateBrandIdentity(brandId, updateData);
    return res.json(updated);
  }
);

router.get(
  "/:brandId/franchisees",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string }>, res: Response) => {
    const { brandId } = req.params;
    const brand = await storage.getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const franchisees = await storage.getFranchiseesByBrand(brandId);
    return res.json(franchisees.map((f) => ({
      id: f.id,
      email: f.email,
      displayName: f.displayName,
      accountManagerId: f.accountManagerId,
      bookingUrl: f.bookingUrl,
    })));
  }
);

router.get(
  "/:brandId/account-managers",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string }>, res: Response) => {
    const { brandId } = req.params;
    const brand = await storage.getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    const brandManagers = await storage.getBrandAccountManagers(brandId);
    return res.json(brandManagers);
  }
);

const upsertBrandAccountManagerSchema = z.object({
  account_manager_id: z.string().min(1, "Account manager is required"),
  booking_url: z.string().url("Must be a valid URL").nullable().optional(),
});

router.put(
  "/:brandId/account-managers",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string }>, res: Response) => {
    const { brandId } = req.params;
    const brand = await storage.getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const parsed = upsertBrandAccountManagerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors.map((e) => ({ path: e.path.map(String), message: e.message })),
      });
    }

    const manager = await storage.getUser(parsed.data.account_manager_id);
    if (!manager || manager.role !== "katalyst_admin") {
      return res.status(404).json({ message: "Account manager not found or not a Katalyst admin" });
    }

    const result = await storage.upsertBrandAccountManager(
      brandId,
      parsed.data.account_manager_id,
      parsed.data.booking_url ?? null,
    );
    return res.json(result);
  }
);

router.delete(
  "/:brandId/account-managers/:managerId",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string; managerId: string }>, res: Response) => {
    const { brandId, managerId } = req.params;

    const brand = await storage.getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    if (brand.defaultAccountManagerId === managerId) {
      await storage.setDefaultAccountManager(brandId, null);
    }

    await storage.removeBrandAccountManager(brandId, managerId);
    return res.json({ success: true });
  }
);

const setDefaultManagerSchema = z.object({
  account_manager_id: z.string().min(1).nullable(),
});

router.put(
  "/:brandId/default-account-manager",
  requireAuth,
  requireRole("katalyst_admin"),
  async (req: Request<{ brandId: string }>, res: Response) => {
    const { brandId } = req.params;
    const brand = await storage.getBrand(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const parsed = setDefaultManagerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors.map((e) => ({ path: e.path.map(String), message: e.message })),
      });
    }

    if (parsed.data.account_manager_id) {
      const existing = await storage.getBrandAccountManager(brandId, parsed.data.account_manager_id);
      if (!existing) {
        return res.status(400).json({ message: "This account manager is not associated with this brand. Add them first." });
      }
    }

    const updated = await storage.setDefaultAccountManager(brandId, parsed.data.account_manager_id);
    return res.json(updated);
  }
);

export default router;
