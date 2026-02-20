import { useMemo } from "react";
import { computeSectionProgress } from "@/lib/plan-completeness";
import type { PlanFinancialInputs } from "@shared/financial-engine";
import type { SectionProgress } from "@/lib/plan-completeness";

interface PlanCompletenessBarProps {
  financialInputs: PlanFinancialInputs | null;
  startupCostCount: number;
}

export function PlanCompletenessBar({ financialInputs, startupCostCount }: PlanCompletenessBarProps) {
  const sections = useMemo(
    () => (financialInputs ? computeSectionProgress(financialInputs) : []),
    [financialInputs]
  );

  if (!financialInputs) return null;

  const totalEdited = sections.reduce((sum, s) => sum + s.edited, 0);
  const totalFields = sections.reduce((sum, s) => sum + s.total, 0);

  return (
    <div data-testid="plan-completeness-dashboard">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">Plan Progress</span>
        <span className="text-xs text-muted-foreground">
          {totalEdited}/{totalFields} fields customized
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {sections.map((section) => {
          const pct = section.total > 0 ? (section.edited / section.total) * 100 : 0;
          return (
            <div
              key={section.category}
              className="flex flex-col gap-1"
              data-testid={`section-progress-${section.category}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground truncate">{section.label}</span>
                <span className="text-xs font-medium tabular-nums">
                  {section.edited}/{section.total}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
        <div
          className="flex flex-col gap-1"
          data-testid="section-progress-startupCosts"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground truncate">Startup Costs</span>
            <span className="text-xs font-medium tabular-nums">
              {startupCostCount} items
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
