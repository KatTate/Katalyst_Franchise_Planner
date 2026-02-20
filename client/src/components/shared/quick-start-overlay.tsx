import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import { usePlan } from "@/hooks/use-plan";
import { formatCents, parseDollarsToCents } from "@/lib/format-currency";
import { formatROI } from "@/components/shared/summary-metrics";
import {
  staffCountToLaborPct,
  laborPctToStaffCount,
  scaleStartupCosts,
  startupCostTotal,
  computeQuickPreview,
  breakEvenToCalendarDate,
  generateSentimentFrame,
  generateLeverHint,
  findHighestImpactInput,
  createDefaultStartupCostItem,
} from "@/lib/quick-start-helpers";
import { updateFieldValue, buildPlanFinancialInputs, buildPlanStartupCosts } from "@shared/plan-initialization";
import type { PlanFinancialInputs, StartupCostLineItem, EngineOutput } from "@shared/financial-engine";
import type { Brand } from "@shared/schema";

// ─── Types ──────────────────────────────────────────────────────────────

interface QuickStartOverlayProps {
  planId: string;
  brand: Brand | null;
  onComplete: () => void;
}

interface QuickStartValues {
  revenueDollars: string;
  rentDollars: string;
  investmentDollars: string;
  staffCount: string;
  suppliesPct: string;
}

// ─── Animated Number ────────────────────────────────────────────────────

function AnimatedValue({
  value,
  testId,
  className,
}: {
  value: string;
  testId: string;
  className?: string;
}) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        data-testid={testId}
        className={className}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

// ─── Component ──────────────────────────────────────────────────────────

export function QuickStartOverlay({ planId, brand, onComplete }: QuickStartOverlayProps) {
  const { plan, isLoading, error, updatePlan, isSaving } = usePlan(planId);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear pending debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Local state for the 5 input fields (string for input editing)
  const [values, setValues] = useState<QuickStartValues | null>(null);

  // Derived engine output from current inputs
  const [preview, setPreview] = useState<EngineOutput | null>(null);

  // Working copies of financial inputs and startup costs
  const [workingInputs, setWorkingInputs] = useState<PlanFinancialInputs | null>(null);
  const [workingCosts, setWorkingCosts] = useState<StartupCostLineItem[] | null>(null);

  // Staff count tracking (numeric)
  const [staffNum, setStaffNum] = useState<number>(5);

  // Initialize from plan data
  useEffect(() => {
    if (!plan || values !== null) return;

    let fi = plan.financialInputs;
    let costs = plan.startupCosts;

    // If financial inputs are null, try to initialize from brand
    if (!fi && brand?.brandParameters) {
      fi = buildPlanFinancialInputs(brand.brandParameters);
    }
    if (!costs && brand?.startupCostTemplate) {
      costs = buildPlanStartupCosts(brand.startupCostTemplate);
    }

    if (!fi) return;
    if (!costs) costs = [];

    if (costs.length === 0) {
      const defaultInvestment = 15_000_00;
      costs = [createDefaultStartupCostItem(defaultInvestment)];
    }

    const monthlyAuvCents = fi.revenue.monthlyAuv.currentValue;
    const rentCents = fi.operatingCosts.rentMonthly.currentValue;
    const investmentCents = startupCostTotal(costs);
    const laborPct = fi.operatingCosts.laborPct.currentValue;
    const cogsPct = fi.operatingCosts.cogsPct.currentValue;

    // Derive staff count from labor pct
    const derivedStaff = laborPctToStaffCount(laborPct, monthlyAuvCents);

    setValues({
      revenueDollars: String(Math.round(monthlyAuvCents / 100)),
      rentDollars: String(Math.round(rentCents / 100)),
      investmentDollars: String(Math.round(investmentCents / 100)),
      staffCount: String(derivedStaff),
      suppliesPct: String(Math.round(cogsPct * 100)),
    });
    setStaffNum(derivedStaff);
    setWorkingInputs(fi);
    setWorkingCosts(costs);

    // Compute initial preview
    try {
      const output = computeQuickPreview(fi, costs);
      setPreview(output);
    } catch {
      // Engine error — will show in UI
    }
  }, [plan, brand, values]);

  // Recompute preview whenever working inputs/costs change
  const recompute = useCallback(
    (fi: PlanFinancialInputs, costs: StartupCostLineItem[]) => {
      try {
        const output = computeQuickPreview(fi, costs);
        setPreview(output);
      } catch {
        // Engine computation failed — stale preview shown
      }
    },
    []
  );

  // Debounced save to server
  const debouncedSave = useCallback(
    (fi: PlanFinancialInputs, costs: StartupCostLineItem[], staff: number) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          await updatePlan({
            financialInputs: fi as any,
            startupCosts: costs as any,
          });
        } catch {
          // Save failed — will retry on next change
        }
      }, 2000);
    },
    [updatePlan]
  );

  // Field change handlers
  const handleFieldChange = useCallback(
    (field: keyof QuickStartValues, rawValue: string) => {
      if (!workingInputs || !workingCosts || !values) return;

      const newValues = { ...values, [field]: rawValue };
      setValues(newValues);

      const now = new Date().toISOString();
      let fi = structuredClone(workingInputs);
      let costs = [...workingCosts];
      let staff = staffNum;

      switch (field) {
        case "revenueDollars": {
          const cents = parseDollarsToCents(rawValue);
          if (isNaN(cents)) return;
          fi.revenue.monthlyAuv = updateFieldValue(fi.revenue.monthlyAuv, cents, now);
          // Recompute labor pct with new revenue
          const newLaborPct = staffCountToLaborPct(staff, cents);
          fi.operatingCosts.laborPct = updateFieldValue(fi.operatingCosts.laborPct, newLaborPct, now);
          break;
        }
        case "rentDollars": {
          const cents = parseDollarsToCents(rawValue);
          if (isNaN(cents)) return;
          fi.operatingCosts.rentMonthly = updateFieldValue(fi.operatingCosts.rentMonthly, cents, now);
          break;
        }
        case "investmentDollars": {
          const cents = parseDollarsToCents(rawValue);
          if (isNaN(cents)) return;
          costs = scaleStartupCosts(costs, cents);
          break;
        }
        case "staffCount": {
          const count = parseInt(rawValue, 10);
          if (isNaN(count) || count < 0) return;
          staff = count;
          setStaffNum(count);
          const monthlyAuv = fi.revenue.monthlyAuv.currentValue;
          const newLaborPct = staffCountToLaborPct(count, monthlyAuv);
          fi.operatingCosts.laborPct = updateFieldValue(fi.operatingCosts.laborPct, newLaborPct, now);
          break;
        }
        case "suppliesPct": {
          const pct = parseFloat(rawValue);
          if (isNaN(pct) || pct < 0 || pct > 100) return;
          fi.operatingCosts.cogsPct = updateFieldValue(fi.operatingCosts.cogsPct, pct / 100, now);
          break;
        }
      }

      setWorkingInputs(fi);
      setWorkingCosts(costs);
      recompute(fi, costs);
      debouncedSave(fi, costs, staff);
    },
    [workingInputs, workingCosts, values, staffNum, recompute, debouncedSave]
  );

  // Complete Quick Start
  const handleComplete = useCallback(async () => {
    if (!workingInputs || !workingCosts) return;
    try {
      await updatePlan({
        financialInputs: workingInputs as any,
        startupCosts: workingCosts as any,
        quickStartCompleted: true,
      });
      onComplete();
    } catch {
      // Save error — user can retry
    }
  }, [workingInputs, workingCosts, staffNum, updatePlan, onComplete]);

  // Skip Quick Start
  const handleSkip = useCallback(async () => {
    try {
      await updatePlan({
        quickStartCompleted: true,
        ...(workingInputs ? { financialInputs: workingInputs as any } : {}),
        ...(workingCosts ? { startupCosts: workingCosts as any } : {}),
      });
      onComplete();
    } catch {
      // Save error
    }
  }, [workingInputs, workingCosts, staffNum, updatePlan, onComplete]);

  const brandName = brand?.displayName || brand?.name || "franchise";
  const roiMetrics = preview?.roiMetrics;
  const hasInvestment = roiMetrics ? roiMetrics.totalStartupInvestment > 0 : false;
  const isNegativeROI = roiMetrics ? roiMetrics.fiveYearROIPct < 0 && hasInvestment : false;

  // Memoize sensitivity analysis — must be called before early returns (Rules of Hooks)
  const leverHint = useMemo(() => {
    if (!isNegativeROI || !workingInputs || !workingCosts) return null;
    const impact = findHighestImpactInput(workingInputs, workingCosts, staffNum);
    return generateLeverHint(impact);
  }, [isNegativeROI, workingInputs, workingCosts, staffNum]);

  // ── Error State (checked before loading guard so errors aren't masked) ──
  if (error && !isLoading) {
    return (
      <div data-testid="quick-start-error" className="max-w-md mx-auto py-16 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          We couldn't load your plan details. Your data is safe — please try refreshing.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  // ── Loading State ──────────────────────────────────────────────────────
  if (isLoading || !values) {
    return (
      <div data-testid="quick-start-loading" className="max-w-5xl mx-auto py-8 px-4">
        <Skeleton className="h-8 w-96 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-64 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <div>
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="quick-start-overlay" className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <h1 className="text-2xl font-bold font-[Montserrat] mb-2">
        Let's get a quick picture of your {brandName} business
      </h1>
      <p className="text-muted-foreground mb-8">
        Answer 5 quick questions and see your estimated ROI instantly.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Left Column: Input Fields ──────────────────────────────── */}
        <div className="space-y-5">
          {/* 1. Monthly Revenue */}
          <div>
            <Label htmlFor="qs-revenue" className="text-sm font-medium">
              How much do you expect to bring in each month?
            </Label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="qs-revenue"
                data-testid="quick-start-field-revenue"
                type="text"
                inputMode="numeric"
                className="pl-7 font-mono"
                value={values.revenueDollars}
                onChange={(e) => handleFieldChange("revenueDollars", e.target.value)}
              />
            </div>
            {workingInputs && (
              <p className="text-xs text-muted-foreground mt-1">
                Brand average: {formatCents(workingInputs.revenue.monthlyAuv.brandDefault ?? 0)}
              </p>
            )}
          </div>

          {/* 2. Monthly Rent */}
          <div>
            <Label htmlFor="qs-rent" className="text-sm font-medium">
              What's your estimated monthly rent?
            </Label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="qs-rent"
                data-testid="quick-start-field-rent"
                type="text"
                inputMode="numeric"
                className="pl-7 font-mono"
                value={values.rentDollars}
                onChange={(e) => handleFieldChange("rentDollars", e.target.value)}
              />
            </div>
            {workingInputs && (
              <p className="text-xs text-muted-foreground mt-1">
                Brand average: {formatCents(workingInputs.operatingCosts.rentMonthly.brandDefault ?? 0)}
              </p>
            )}
          </div>

          {/* 3. Investment Budget */}
          <div>
            <Label htmlFor="qs-investment" className="text-sm font-medium">
              How much are you planning to invest upfront?
            </Label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="qs-investment"
                data-testid="quick-start-field-investment"
                type="text"
                inputMode="numeric"
                className="pl-7 font-mono"
                value={values.investmentDollars}
                onChange={(e) => handleFieldChange("investmentDollars", e.target.value)}
              />
            </div>
            {workingCosts && (
              <p className="text-xs text-muted-foreground mt-1">
                Brand average: {formatCents(workingCosts.reduce(
                  (sum, c) => sum + (c.brandDefaultAmount ?? c.amount), 0
                ))}
              </p>
            )}
          </div>

          {/* 4. Staff Count */}
          <div>
            <Label htmlFor="qs-staff" className="text-sm font-medium">
              How many people do you plan to employ?
            </Label>
            <Input
              id="qs-staff"
              data-testid="quick-start-field-staff"
              type="text"
              inputMode="numeric"
              className="mt-1.5 font-mono max-w-[120px]"
              value={values.staffCount}
              onChange={(e) => handleFieldChange("staffCount", e.target.value)}
            />
          </div>

          {/* 5. Supplies/Materials % */}
          <div>
            <Label htmlFor="qs-supplies" className="text-sm font-medium">
              What percentage of revenue goes to supplies and materials?
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="qs-supplies"
                data-testid="quick-start-field-supplies"
                type="text"
                inputMode="decimal"
                className="pr-7 font-mono max-w-[120px]"
                value={values.suppliesPct}
                onChange={(e) => handleFieldChange("suppliesPct", e.target.value)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
            {workingInputs && (
              <p className="text-xs text-muted-foreground mt-1">
                Brand average: {Math.round((workingInputs.operatingCosts.cogsPct.brandDefault ?? 0) * 100)}%
              </p>
            )}
          </div>
        </div>

        {/* ── Right Column: Live Result Card ─────────────────────────── */}
        <div>
          <Card className="sticky top-8">
            <CardContent className="pt-6 pb-5 px-6">
              {roiMetrics ? (
                <div className="space-y-4">
                  {/* ROI */}
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                      Your Estimated ROI
                    </p>
                    <p className="text-4xl font-bold font-mono tabular-nums">
                      <AnimatedValue
                        value={hasInvestment ? formatROI(roiMetrics.fiveYearROIPct) : "N/A"}
                        testId="quick-start-result-roi"
                      />
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">5-Year Return on Investment</p>
                  </div>

                  {/* Break-Even */}
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                      Break-Even
                    </p>
                    <p className="text-xl font-semibold font-mono tabular-nums">
                      <AnimatedValue
                        value={breakEvenToCalendarDate(roiMetrics.breakEvenMonth)}
                        testId="quick-start-result-breakeven"
                      />
                    </p>
                  </div>

                  {/* Total Investment */}
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                      Total Startup Investment
                    </p>
                    <p className="text-xl font-semibold font-mono tabular-nums">
                      <AnimatedValue
                        value={formatCents(roiMetrics.totalStartupInvestment)}
                        testId="quick-start-result-investment"
                      />
                    </p>
                  </div>

                  {/* Sentiment Frame */}
                  <div
                    className="rounded-md px-3 py-2 text-sm mt-4"
                    style={{ backgroundColor: "#A9A2AA20", color: "#A9A2AA" }}
                    data-testid="quick-start-sentiment"
                  >
                    {hasInvestment
                      ? generateSentimentFrame(roiMetrics.fiveYearROIPct, roiMetrics.breakEvenMonth)
                      : "Enter your planned investment amount to see your estimated return."}
                  </div>

                  {/* AC9: Negative ROI guidance */}
                  {isNegativeROI && leverHint && (
                    <div
                      className="rounded-md px-3 py-2 text-sm"
                      style={{ backgroundColor: "#A9A2AA20", color: "#A9A2AA" }}
                      data-testid="quick-start-lever-hint"
                    >
                      {leverHint}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-6 w-40" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Footer Actions ──────────────────────────────────────────── */}
      <div className="mt-8 flex items-center justify-between">
        <button
          data-testid="quick-start-button-skip"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
          onClick={handleSkip}
          disabled={isSaving}
        >
          Skip to full planning &rarr;
        </button>
        <Button
          data-testid="quick-start-button-complete"
          size="lg"
          onClick={handleComplete}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "See My Full Plan"}
        </Button>
      </div>
    </div>
  );
}
