import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SCENARIO_COLORS, SCENARIO_LABELS, type ScenarioId } from "@/lib/scenario-engine";
import type { DrillLevel } from "./column-manager";

export interface ComparisonColumnDef {
  key: string;
  label: string;
  year: number;
  quarter?: number;
  scenario: ScenarioId;
  level: DrillLevel;
}

const SCENARIOS: ScenarioId[] = ["base", "conservative", "optimistic"];

export function buildComparisonColumns(
  drillState: Record<number, DrillLevel>,
): ComparisonColumnDef[] {
  const cols: ComparisonColumnDef[] = [];
  const QUARTER_LABELS = ["Q1", "Q2", "Q3", "Q4"];

  for (let y = 1; y <= 5; y++) {
    const level = drillState[y] ?? "annual";

    if (level === "annual") {
      for (const s of SCENARIOS) {
        cols.push({
          key: `y${y}-${s}`,
          label: `Y${y} ${SCENARIO_LABELS[s]}`,
          year: y,
          scenario: s,
          level: "annual",
        });
      }
    } else if (level === "quarterly") {
      for (let q = 1; q <= 4; q++) {
        for (const s of SCENARIOS) {
          cols.push({
            key: `y${y}q${q}-${s}`,
            label: `${QUARTER_LABELS[q - 1]} ${SCENARIO_LABELS[s]}`,
            year: y,
            quarter: q,
            scenario: s,
            level: "quarterly",
          });
        }
      }
    }
  }
  return cols;
}

interface ComparisonTableHeadProps {
  drillState: Record<number, DrillLevel>;
  testIdPrefix?: string;
}

export function ComparisonTableHead({
  drillState,
  testIdPrefix = "",
}: ComparisonTableHeadProps) {
  const pfx = testIdPrefix ? `${testIdPrefix}-` : "";

  const yearGroups: { year: number; level: DrillLevel; colSpan: number }[] = [];
  for (let y = 1; y <= 5; y++) {
    const level = drillState[y] ?? "annual";
    const colSpan = level === "quarterly" ? 4 * 3 : 3;
    yearGroups.push({ year: y, level, colSpan });
  }

  const hasQuarterly = yearGroups.some((yg) => yg.level === "quarterly");

  const labelCellClass =
    "text-left py-2 px-3 font-medium text-muted-foreground sticky left-0 z-10 min-w-[200px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]";

  return (
    <thead>
      <tr className="border-b bg-muted/40">
        <th
          className={`${labelCellClass} bg-muted/40`}
          scope="col"
          rowSpan={hasQuarterly ? 3 : 2}
        >
          &nbsp;
        </th>
        {yearGroups.map((yg, idx) => (
          <th
            key={`year-group-${yg.year}`}
            className={`text-center py-2 px-3 font-medium text-muted-foreground whitespace-nowrap bg-muted/40${idx > 0 ? " border-l-2 border-border/40" : ""}`}
            colSpan={yg.colSpan}
            scope="colgroup"
            data-testid={`${pfx}header-group-y${yg.year}`}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-default">Year {yg.year}</span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Collapse comparison to drill into year detail.</p>
              </TooltipContent>
            </Tooltip>
          </th>
        ))}
      </tr>

      {hasQuarterly && (
        <tr className="border-b bg-muted/20">
          {yearGroups.flatMap((yg, idx) => {
            if (yg.level === "annual") {
              return [
                <th
                  key={`yg-annual-${yg.year}`}
                  className={`text-center py-1.5 px-2 text-xs font-medium text-muted-foreground whitespace-nowrap${idx > 0 ? " border-l-2 border-border/40" : ""}`}
                  colSpan={3}
                  scope="colgroup"
                  rowSpan={2}
                />,
              ];
            }
            const QUARTER_LABELS = ["Q1", "Q2", "Q3", "Q4"];
            return [1, 2, 3, 4].map((q, qi) => (
              <th
                key={`yg-q-${yg.year}-q${q}`}
                className={`text-center py-1.5 px-2 text-xs font-medium text-muted-foreground whitespace-nowrap${qi === 0 && idx > 0 ? " border-l-2 border-border/40" : ""}`}
                colSpan={3}
                scope="colgroup"
              >
                {QUARTER_LABELS[q - 1]}
              </th>
            ));
          })}
        </tr>
      )}

      <tr className="border-b">
        {yearGroups.flatMap((yg, ygIdx) => {
          if (yg.level === "annual") {
            return SCENARIOS.map((s, sIdx) => (
              <th
                key={`scenario-${yg.year}-${s}`}
                className={`text-right py-1.5 px-2 text-[11px] font-medium text-muted-foreground whitespace-nowrap ${SCENARIO_COLORS[s].bg}${sIdx === 0 && ygIdx > 0 ? " border-l-2 border-border/40" : ""}`}
                scope="col"
                data-testid={`${pfx}header-y${yg.year}-${s}`}
              >
                <span className="flex items-center justify-end gap-1">
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${SCENARIO_COLORS[s].dot}`} />
                  {s === "base" ? "Base" : s === "conservative" ? "Cons" : "Opt"}
                </span>
              </th>
            ));
          }
          return [1, 2, 3, 4].flatMap((q, qi) =>
            SCENARIOS.map((s, sIdx) => (
              <th
                key={`scenario-${yg.year}-q${q}-${s}`}
                className={`text-right py-1.5 px-2 text-[11px] font-medium text-muted-foreground whitespace-nowrap ${SCENARIO_COLORS[s].bg}${sIdx === 0 && qi === 0 && ygIdx > 0 ? " border-l-2 border-border/40" : ""}`}
                scope="col"
                data-testid={`${pfx}header-y${yg.year}q${q}-${s}`}
              >
                <span className="flex items-center justify-end gap-1">
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${SCENARIO_COLORS[s].dot}`} />
                  {s === "base" ? "Base" : s === "conservative" ? "Cons" : "Opt"}
                </span>
              </th>
            ))
          );
        })}
      </tr>
    </thead>
  );
}
