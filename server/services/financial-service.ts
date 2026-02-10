/**
 * Financial Service — orchestrates engine invocation for a plan.
 *
 * Business logic lives here, not in route handlers (architecture pattern).
 * The engine itself is a pure function in shared/financial-engine.ts.
 */

import type { Plan } from "@shared/schema";
import type { EngineOutput, IdentityCheckResult, EngineInput } from "@shared/financial-engine";
import { calculateProjections } from "@shared/financial-engine";
import { unwrapForEngine } from "@shared/plan-initialization";
import type { IStorage } from "../storage";
import { logStructured } from "./structured-logger";

/**
 * Compute financial projections for a plan.
 *
 * 1. Loads startup costs via storage (handles legacy migration)
 * 2. Unwraps plan financial inputs into raw EngineInput
 * 3. Runs the pure financial engine
 * 4. Logs any identity check failures
 * 5. Returns the complete EngineOutput
 *
 * @throws Error if plan.financialInputs is null
 */
export async function computePlanOutputs(
  plan: Plan,
  storage: IStorage
): Promise<EngineOutput> {
  if (!plan.financialInputs) {
    throw new Error("Plan has no financial inputs configured");
  }

  // 1. Get startup costs (handles legacy migration)
  const startupCosts = await storage.getStartupCosts(plan.id);

  // 2. Unwrap plan inputs for engine
  const engineInput = unwrapForEngine(plan.financialInputs as any, startupCosts);

  // 3. Run engine
  const output = calculateProjections(engineInput);

  // 4. Log any identity check failures
  logIdentityCheckFailures(plan.id, engineInput, output.identityChecks);

  return output;
}

/** Log failed identity checks as structured warnings to stderr. */
function logIdentityCheckFailures(
  planId: string,
  engineInput: EngineInput,
  checks: IdentityCheckResult[]
): void {
  const failures = checks.filter((c) => !c.passed);
  for (const check of failures) {
    logStructured({
      level: "warn",
      event: "accounting_identity_check_failed",
      timestamp: new Date().toISOString(),
      data: {
        planId,
        checkName: check.name,
        expected: check.expected,
        actual: check.actual,
        tolerance: check.tolerance,
        engineInput,
      },
    });
  }
}
