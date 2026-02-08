import { storage } from "./storage";
import { hashPassword } from "./auth";
import { log } from "./index";

export async function seedAdminUser(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    log("ADMIN_EMAIL and ADMIN_PASSWORD not set — skipping admin seed", "seed");
    return;
  }

  const existing = await storage.getUserByEmail(adminEmail);
  if (existing) {
    log(`Admin user ${adminEmail} already exists — skipping seed`, "seed");
    return;
  }

  const passwordHash = await hashPassword(adminPassword);

  await storage.createUser({
    email: adminEmail,
    passwordHash,
    role: "katalyst_admin",
    brandId: null,
    displayName: "Katalyst Admin",
    onboardingCompleted: true,
    preferredTier: null,
  });

  log(`Admin user ${adminEmail} created successfully`, "seed");
}
