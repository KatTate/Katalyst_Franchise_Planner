import { useMemo, useState, useCallback } from "react";
import { Check, AlertTriangle, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCents } from "@/lib/format-currency";
import type { EngineOutput, IdentityCheckResult } from "@shared/financial-engine";

interface AuditTabProps {
  output: EngineOutput;
  onNavigateToTab?: (tab: string, scrollTo?: string) => void;
  comparisonActive?: boolean;
}

interface CheckCategory {
  key: string;
  label: string;
  description: string;
  checks: IdentityCheckResult[];
  navigateTab?: string;
  navigateScrollTo?: string;
}

const CATEGORY_CONFIG: {
  prefix: string;
  key: string;
  label: string;
  description: string;
  navigateTab?: string;
}[] = [
  { prefix: "Monthly BS identity", key: "monthly-bs", label: "Balance Sheet Identity (Monthly)", description: "Assets = Liabilities + Equity for every month", navigateTab: "balance-sheet" },
  { prefix: "Annual BS identity", key: "annual-bs", label: "Balance Sheet Identity (Annual)", description: "Assets = Liabilities + Equity at each year end", navigateTab: "balance-sheet" },
  { prefix: "Total depreciation equals CapEx", key: "depreciation", label: "Depreciation vs CapEx", description: "Total depreciation over the asset life equals the original purchase cost", navigateTab: "balance-sheet" },
  { prefix: "Loan amortization consistency", key: "loan", label: "Loan Amortization", description: "Final loan balance matches expected amortization schedule", navigateTab: "cash-flow" },
  { prefix: "P&L to CF consistency", key: "pl-cf", label: "P&L to Cash Flow Consistency", description: "Operating cash flow reconciles with net income and working capital changes", navigateTab: "pnl" },
  { prefix: "CF cash continuity", key: "cf-continuity", label: "Cash Flow Continuity", description: "Each month's ending cash equals the next month's beginning cash", navigateTab: "cash-flow" },
  { prefix: "CF net identity", key: "cf-net", label: "Cash Flow Net Identity", description: "Net cash flow = cash before financing + financing activities", navigateTab: "cash-flow" },
  { prefix: "CF ending cash identity", key: "cf-ending", label: "Cash Flow Ending Balance", description: "Ending cash = beginning cash + net cash flow", navigateTab: "cash-flow" },
  { prefix: "P&L Check", key: "pl-check", label: "P&L Integrity", description: "Gross profit + expenses = pre-tax income", navigateTab: "pnl" },
  { prefix: "BS equity continuity", key: "bs-equity", label: "Equity Continuity", description: "Beginning equity + net income - distributions = ending equity", navigateTab: "balance-sheet" },
  { prefix: "Corporation Tax Check", key: "corp-tax", label: "Corporation Tax", description: "Taxes due match the formula: max(0, adjusted pre-tax income) x tax rate", navigateTab: "roic" },
  { prefix: "Working Capital AR", key: "working-capital", label: "Working Capital (AR)", description: "Accounts receivable consistent with revenue and AR days assumption", navigateTab: "balance-sheet" },
  { prefix: "Breakeven", key: "breakeven", label: "Breakeven Validation", description: "Break-even month has non-negative cumulative cash flow; prior month is negative", navigateTab: "summary" },
  { prefix: "ROI Check", key: "roi", label: "ROI Calculation", description: "5-year ROI derived correctly from cumulative cash flows and investment", navigateTab: "roic" },
  { prefix: "Valuation Check", key: "valuation-check", label: "Valuation Derivation", description: "Estimated value = adjusted net operating income x EBITDA multiple", navigateTab: "valuation" },
];

function categorizeChecks(checks: IdentityCheckResult[]): CheckCategory[] {
  const categories: CheckCategory[] = [];

  for (const config of CATEGORY_CONFIG) {
    const matching = checks.filter((c) => c.name.startsWith(config.prefix));
    if (matching.length > 0) {
      categories.push({
        key: config.key,
        label: config.label,
        description: config.description,
        checks: matching,
        navigateTab: config.navigateTab,
      });
    }
  }

  const knownPrefixes = CATEGORY_CONFIG.map((c) => c.prefix);
  const uncategorized = checks.filter((c) => !knownPrefixes.some((p) => c.name.startsWith(p)));
  if (uncategorized.length > 0) {
    categories.push({
      key: "other",
      label: "Other Checks",
      description: "Additional identity checks",
      checks: uncategorized,
    });
  }

  return categories;
}

export function AuditTab({ output, onNavigateToTab, comparisonActive }: AuditTabProps) {
  const { identityChecks } = output;

  const categories = useMemo(() => categorizeChecks(identityChecks), [identityChecks]);

  const totalCategories = categories.length;
  const passedCategories = categories.filter((c) => c.checks.every((ch) => ch.passed)).length;
  const allPassed = passedCategories === totalCategories;

  return (
    <div className="space-y-4 pb-8" data-testid="audit-tab">
      <AuditSummary
        passedCategories={passedCategories}
        totalCategories={totalCategories}
        allPassed={allPassed}
      />
      <div className="space-y-2 px-1" data-testid="audit-categories">
        {categories.map((cat) => (
          <AuditCategory
            key={cat.key}
            category={cat}
            onNavigateToTab={onNavigateToTab}
          />
        ))}
      </div>
    </div>
  );
}

function AuditSummary({
  passedCategories,
  totalCategories,
  allPassed,
}: {
  passedCategories: number;
  totalCategories: number;
  allPassed: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 border-b bg-muted/30 sticky top-0 z-30"
      data-testid="audit-summary"
    >
      {allPassed ? (
        <Check className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
      ) : (
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
      )}
      <p className="text-sm" data-testid="audit-summary-text">
        <span className="font-semibold">{passedCategories} of {totalCategories}</span>
        {" "}checks passing
        {allPassed ? " — all financial integrity checks verified." : " — review failed checks below."}
      </p>
    </div>
  );
}

interface AuditCategoryProps {
  category: CheckCategory;
  onNavigateToTab?: (tab: string, scrollTo?: string) => void;
}

function AuditCategory({ category, onNavigateToTab }: AuditCategoryProps) {
  const allPassed = category.checks.every((c) => c.passed);
  const failedCount = category.checks.filter((c) => !c.passed).length;
  const [isExpanded, setIsExpanded] = useState(!allPassed);

  const handleNavigate = useCallback(() => {
    if (category.navigateTab && onNavigateToTab) {
      onNavigateToTab(category.navigateTab, category.navigateScrollTo);
    }
  }, [category.navigateTab, category.navigateScrollTo, onNavigateToTab]);

  return (
    <Card
      className="overflow-visible"
      data-testid={`audit-category-${category.key}`}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover-elevate"
        onClick={() => setIsExpanded((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded((prev) => !prev);
          }
        }}
        tabIndex={0}
        role="button"
        aria-expanded={isExpanded}
        data-testid={`audit-category-toggle-${category.key}`}
      >
        <span className="shrink-0">
          {allPassed ? (
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" data-testid={`audit-icon-pass-${category.key}`} />
          ) : (
            <AlertTriangle className="h-4 w-4 text-destructive" data-testid={`audit-icon-fail-${category.key}`} />
          )}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{category.label}</span>
            <Badge variant={allPassed ? "secondary" : "destructive"} className="text-xs" data-testid={`audit-badge-${category.key}`}>
              {allPassed ? `${category.checks.length} passed` : `${failedCount} / ${category.checks.length} failed`}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{category.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {category.navigateTab && onNavigateToTab && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-1 text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate();
                  }}
                  data-testid={`audit-nav-${category.key}`}
                  aria-label={`Go to ${category.navigateTab} tab`}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">View in {category.navigateTab.replace("-", " ")} tab</p>
              </TooltipContent>
            </Tooltip>
          )}
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
        </div>
      </div>
      {isExpanded && (
        <CardContent className="pt-0 pb-3 px-4">
          <div className="border-t pt-2 space-y-1" data-testid={`audit-details-${category.key}`}>
            {category.checks.map((check, idx) => (
              <AuditCheckRow key={`${check.name}-${idx}`} check={check} onNavigateToTab={onNavigateToTab} navigateTab={category.navigateTab} />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function AuditCheckRow({ check, onNavigateToTab, navigateTab }: { check: IdentityCheckResult; onNavigateToTab?: (tab: string, scrollTo?: string) => void; navigateTab?: string }) {
  const diff = Math.abs(check.expected - check.actual);

  return (
    <div
      className={`py-1.5 px-2 rounded-md text-xs ${check.passed ? "" : "bg-destructive/5"}`}
      data-testid={`audit-check-${check.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`}
    >
      <div className="flex items-center gap-2">
        <span className="shrink-0">
          {check.passed ? (
            <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
          ) : (
            <AlertTriangle className="h-3 w-3 text-destructive" />
          )}
        </span>
        <span className="flex-1 min-w-0 truncate font-medium">{check.name}</span>
      </div>
      <div className="ml-5 mt-1 grid grid-cols-3 gap-x-4 gap-y-0.5 text-muted-foreground">
        <span>Expected: <span className="font-mono">{formatCents(check.expected)}</span></span>
        <span>Actual: <span className="font-mono">{formatCents(check.actual)}</span></span>
        <span>Tolerance: <span className="font-mono">{formatCents(check.tolerance)}</span></span>
      </div>
      {!check.passed && (
        <div className="ml-5 mt-1 flex items-center gap-2">
          <span className="text-destructive">
            Difference of {formatCents(diff)} exceeds tolerance
          </span>
          {navigateTab && onNavigateToTab && (
            <button
              className="text-primary underline"
              onClick={() => onNavigateToTab(navigateTab)}
              data-testid={`audit-check-nav-${check.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`}
            >
              View in {navigateTab.replace("-", " ")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
