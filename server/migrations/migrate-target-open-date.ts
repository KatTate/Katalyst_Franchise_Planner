import { db } from "../db";
import { plans } from "@shared/schema";
import { isNull, isNotNull, sql } from "drizzle-orm";

const QUARTER_TO_MONTH: Record<string, string> = {
  Q1: "01",
  Q2: "04",
  Q3: "07",
  Q4: "10",
};

function parseTargetOpenQuarter(value: string): string | null {
  const trimmed = value.trim();
  const match = trimmed.match(/^(Q[1-4])\s+(\d{4})$/);
  if (!match) return null;
  const month = QUARTER_TO_MONTH[match[1]];
  if (!month) return null;
  return `${match[2]}-${month}`;
}

export async function migrateTargetOpenDate(): Promise<{ migrated: number; skipped: number; failed: number }> {
  const plansToMigrate = await db
    .select({ id: plans.id, targetOpenQuarter: plans.targetOpenQuarter })
    .from(plans)
    .where(isNotNull(plans.targetOpenQuarter));

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const plan of plansToMigrate) {
    if (!plan.targetOpenQuarter) {
      skipped++;
      continue;
    }
    const parsed = parseTargetOpenQuarter(plan.targetOpenQuarter);
    if (!parsed) {
      console.warn(`[migrate-target-open-date] Could not parse "${plan.targetOpenQuarter}" for plan ${plan.id}`);
      failed++;
      continue;
    }
    await db
      .update(plans)
      .set({ targetOpenDate: parsed })
      .where(sql`${plans.id} = ${plan.id}`);
    migrated++;
  }

  return { migrated, skipped, failed };
}

if (require.main === module) {
  migrateTargetOpenDate()
    .then((result) => {
      console.log(`Migration complete:`, result);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}
