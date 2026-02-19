import { useEffect, useRef, useState } from "react";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { GuardianIndicator, GuardianLevel, GuardianState } from "@/lib/guardian-engine";

interface GuardianBarProps {
  state: GuardianState;
  onNavigate: (tab: string, scrollTo?: string) => void;
  brandName?: string;
}

const LEVEL_STYLES: Record<GuardianLevel, { bg: string; text: string; icon: typeof CheckCircle }> = {
  healthy: {
    bg: "bg-guardian-healthy/10",
    text: "text-guardian-healthy",
    icon: CheckCircle,
  },
  attention: {
    bg: "bg-guardian-attention/10",
    text: "text-guardian-attention",
    icon: AlertTriangle,
  },
  concerning: {
    bg: "bg-guardian-concerning/10",
    text: "text-guardian-concerning",
    icon: Info,
  },
};

function GuardianIndicatorItem({
  indicator,
  onNavigate,
  isPulsing,
}: {
  indicator: GuardianIndicator;
  onNavigate: (tab: string, scrollTo?: string) => void;
  isPulsing: boolean;
}) {
  const style = LEVEL_STYLES[indicator.level];
  const Icon = style.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${style.bg} hover-elevate${isPulsing ? " guardian-pulse" : ""}`}
          onClick={() => onNavigate(indicator.navigateTo.tab, indicator.navigateTo.scrollTo)}
          data-testid={`guardian-indicator-${indicator.id}`}
          aria-label={`${indicator.label}: ${indicator.value}${indicator.subtitle ? ` (${indicator.subtitle})` : ""}`}
        >
          <Icon className={`h-4 w-4 shrink-0 ${style.text}`} />
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
              {indicator.label}:
            </span>
            <span className={`text-sm font-semibold font-mono tabular-nums whitespace-nowrap ${style.text}`}>
              {indicator.value}
            </span>
            {indicator.subtitle && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                ({indicator.subtitle})
              </span>
            )}
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Click to view details in {indicator.navigateTo.tab === "roic" ? "ROIC" : indicator.navigateTo.tab === "cash-flow" ? "Cash Flow" : indicator.navigateTo.tab === "summary" ? "Summary" : indicator.navigateTo.tab} tab</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function GuardianBar({ state, onNavigate, brandName }: GuardianBarProps) {
  const prevLevels = useRef<Record<string, GuardianLevel>>({});
  const [pulsingIds, setPulsingIds] = useState<Set<string>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const currentLevels: Record<string, GuardianLevel> = {};
    const changed = new Set<string>();

    state.indicators.forEach((ind) => {
      currentLevels[ind.id] = ind.level;
      const prev = prevLevels.current[ind.id];
      if (prev && prev !== ind.level) {
        changed.add(ind.id);
      }
    });

    prevLevels.current = currentLevels;

    if (changed.size === 0) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPulsingIds(changed);
      setTimeout(() => setPulsingIds(new Set()), 650);
    }, 300);
  }, [state.indicators]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Plan health indicators"
      data-testid="guardian-bar"
      className="border-b bg-background/95 backdrop-blur-sm px-4 py-2 shrink-0"
    >
      <div className="flex flex-wrap items-center gap-3">
        {state.indicators.map((indicator) => (
          <GuardianIndicatorItem
            key={indicator.id}
            indicator={indicator}
            onNavigate={onNavigate}
            isPulsing={pulsingIds.has(indicator.id)}
          />
        ))}
        {state.allDefaults && (
          <div
            className="flex-1 text-xs text-muted-foreground italic ml-2"
            data-testid="guardian-defaults-note"
          >
            These projections use {brandName || "brand"} default values. Customize your inputs in My Plan for projections based on your specific situation.
          </div>
        )}
      </div>
      <span className="sr-only">
        {state.indicators.map((i) => `${i.label}: ${i.value}, status ${i.level}`).join(". ")}
      </span>
    </div>
  );
}
