import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocation } from "wouter";
import { FIELD_HELP_MAP } from "@shared/help-content";

interface FieldHelpIconProps {
  fieldId: string;
  brandBenchmark?: { label: string; value: string } | null;
  className?: string;
}

export function FieldHelpIcon({ fieldId, brandBenchmark, className }: FieldHelpIconProps) {
  const help = FIELD_HELP_MAP.get(fieldId);
  const [, setLocation] = useLocation();
  const [expanded, setExpanded] = useState(false);

  if (!help) return null;

  const hasExpandedGuidance = help.expandedGuidance && !help.expandedGuidance.startsWith("TODO:");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center justify-center text-muted-foreground shrink-0 ${className ?? ""}`}
          aria-label={`Help for ${fieldId}`}
          data-testid={`help-icon-${fieldId}`}
          onClick={(e) => e.stopPropagation()}
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[300px]" onPointerDownOutside={(e) => e.preventDefault()} data-testid={`help-tooltip-${fieldId}`}>
        <p className="text-xs">
          {help.tooltip}
        </p>
        {brandBenchmark && (
          <p className="text-xs text-muted-foreground mt-1" data-testid={`benchmark-field-${fieldId}`}>
            Brand average: <span className="font-mono tabular-nums">{brandBenchmark.value}</span>
          </p>
        )}
        {hasExpandedGuidance && (
          <button
            type="button"
            className="text-xs text-primary mt-1 flex items-center gap-0.5 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            data-testid={`link-learn-more-${fieldId}`}
          >
            Learn more
            <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        )}
        {expanded && hasExpandedGuidance && (
          <p className="text-xs text-muted-foreground mt-1 border-t pt-1">
            {help.expandedGuidance}
          </p>
        )}
        {help.glossaryTermSlug && (
          <button
            type="button"
            className="text-xs text-primary mt-1 inline-block cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setLocation(`/glossary/${help.glossaryTermSlug}`);
            }}
            data-testid={`glossary-link-field-${fieldId}`}
          >
            See Glossary: {help.glossaryTermSlug.replace(/-/g, " ")}
          </button>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
