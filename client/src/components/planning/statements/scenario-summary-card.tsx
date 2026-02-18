import { Card, CardContent } from "@/components/ui/card";
import { formatCents } from "@/lib/format-currency";
import { SCENARIO_COLORS } from "@/lib/scenario-engine";
import type { ScenarioOutputs } from "@/lib/scenario-engine";

interface ScenarioSummaryCardProps {
  scenarioOutputs: ScenarioOutputs;
}

function formatBreakEvenText(month: number | null): string {
  if (month === null || month < 0) return "has not reached break-even within the 5-year projection period";
  return `reaches break-even by Month ${month}`;
}

function formatPreTaxText(preTaxIncome: number): string {
  if (preTaxIncome < 0) {
    return `generates a (${formatCents(Math.abs(preTaxIncome))}) loss in Year 1`;
  }
  return `generates ${formatCents(preTaxIncome)} in Year 1 pre-tax income`;
}

export function ScenarioSummaryCard({ scenarioOutputs }: ScenarioSummaryCardProps) {
  const { base, conservative, optimistic } = scenarioOutputs;

  const consBreakEven = conservative.roiMetrics.breakEvenMonth;
  const consY1PreTax = conservative.annualSummaries[0]?.preTaxIncome ?? 0;

  const baseY1PreTax = base.annualSummaries[0]?.preTaxIncome ?? 0;
  const optY1PreTax = optimistic.annualSummaries[0]?.preTaxIncome ?? 0;

  return (
    <Card className="overflow-visible" data-testid="card-scenario-summary">
      <CardContent className="py-3 px-4">
        <p className="text-sm leading-relaxed">
          In the{" "}
          <span className="inline-flex items-center gap-1">
            <span className={`inline-block h-2 w-2 rounded-full ${SCENARIO_COLORS.conservative.dot}`} />
            <span className="font-medium">conservative scenario</span>
          </span>
          {" "}(15% lower revenue, higher costs), your business{" "}
          {formatBreakEvenText(consBreakEven)} and {formatPreTaxText(consY1PreTax)}.
          Your{" "}
          <span className="inline-flex items-center gap-1">
            <span className={`inline-block h-2 w-2 rounded-full ${SCENARIO_COLORS.base.dot}`} />
            <span className="font-medium">base case</span>
          </span>
          {" "}projects {formatCents(baseY1PreTax < 0 ? baseY1PreTax : baseY1PreTax)}{baseY1PreTax < 0 ? " (loss)" : ""},
          and the{" "}
          <span className="inline-flex items-center gap-1">
            <span className={`inline-block h-2 w-2 rounded-full ${SCENARIO_COLORS.optimistic.dot}`} />
            <span className="font-medium">optimistic case</span>
          </span>
          {" "}projects {formatCents(optY1PreTax < 0 ? optY1PreTax : optY1PreTax)}{optY1PreTax < 0 ? " (loss)" : ""}.
        </p>
      </CardContent>
    </Card>
  );
}
