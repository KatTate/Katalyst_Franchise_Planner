import { useState } from "react";
import { ChevronDown, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface StatementSectionProps {
  title: string;
  defaultExpanded?: boolean;
  linkLabel?: string;
  onLinkClick?: () => void;
  children: React.ReactNode;
  testId: string;
}

export function StatementSection({
  title,
  defaultExpanded = false,
  linkLabel,
  onLinkClick,
  children,
  testId,
}: StatementSectionProps) {
  const [open, setOpen] = useState(defaultExpanded);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div data-testid={testId} className="border rounded-md">
        <CollapsibleTrigger asChild>
          <button
            className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover-elevate rounded-md"
            data-testid={`${testId}-toggle`}
          >
            <div className="flex items-center gap-2">
              {open ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <span className="text-sm font-semibold">{title}</span>
            </div>
            {linkLabel && onLinkClick && (
              <span
                className="text-xs text-primary flex items-center gap-1 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onLinkClick();
                }}
                data-testid={`${testId}-link`}
              >
                {linkLabel}
                <ArrowRight className="h-3 w-3" />
              </span>
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
