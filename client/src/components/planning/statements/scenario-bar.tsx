import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SCENARIO_COLORS } from "@/lib/scenario-engine";

interface ScenarioBarProps {
  comparisonActive: boolean;
  onActivateComparison: () => void;
  onDeactivateComparison: () => void;
}

export function ScenarioBar({
  comparisonActive,
  onActivateComparison,
  onDeactivateComparison,
}: ScenarioBarProps) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-2 border-b bg-muted/20 shrink-0"
      data-testid="scenario-bar"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Layers className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        {comparisonActive ? (
          <span className="text-sm text-muted-foreground" data-testid="text-scenario-active">
            Comparing:{" "}
            <span className="inline-flex items-center gap-1">
              <span className={`inline-block h-2 w-2 rounded-full ${SCENARIO_COLORS.base.dot}`} />
              <span className="font-medium text-foreground">Base</span>
            </span>
            {" / "}
            <span className="inline-flex items-center gap-1">
              <span className={`inline-block h-2 w-2 rounded-full ${SCENARIO_COLORS.conservative.dot}`} />
              <span className="font-medium text-foreground">Conservative</span>
            </span>
            {" / "}
            <span className="inline-flex items-center gap-1">
              <span className={`inline-block h-2 w-2 rounded-full ${SCENARIO_COLORS.optimistic.dot}`} />
              <span className="font-medium text-foreground">Optimistic</span>
            </span>
          </span>
        ) : (
          <span className="text-sm text-muted-foreground" data-testid="text-scenario-active">
            Viewing:{" "}
            <span className="inline-flex items-center gap-1">
              <span className={`inline-block h-2 w-2 rounded-full ${SCENARIO_COLORS.base.dot}`} />
              <span className="font-medium text-foreground">Base Case</span>
            </span>
          </span>
        )}
      </div>

      {comparisonActive ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onDeactivateComparison}
          data-testid="button-compare-scenarios"
        >
          Close Comparison
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              data-testid="button-compare-scenarios"
            >
              Compare Scenarios
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={onActivateComparison}
              data-testid="button-scenario-conservative"
            >
              <span className={`inline-block h-2 w-2 rounded-full ${SCENARIO_COLORS.conservative.dot} mr-2 shrink-0`} />
              Conservative
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onActivateComparison}
              data-testid="button-scenario-optimistic"
            >
              <span className={`inline-block h-2 w-2 rounded-full ${SCENARIO_COLORS.optimistic.dot} mr-2 shrink-0`} />
              Optimistic
            </DropdownMenuItem>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem disabled>
                  Create Custom Scenario
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="text-xs">Custom scenarios coming in a future update</p>
              </TooltipContent>
            </Tooltip>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
