import { Check, Loader2, AlertCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SaveStatus } from "@/hooks/use-plan-auto-save";

interface SaveIndicatorProps {
  status: SaveStatus;
  onRetry: () => void;
}

export function SaveIndicator({ status, onRetry }: SaveIndicatorProps) {
  switch (status) {
    case "saved":
      return (
        <div className="flex items-center gap-1.5" data-testid="status-auto-save">
          <Check className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground whitespace-nowrap" data-testid="text-save-status">
            All changes saved
          </span>
        </div>
      );

    case "saving":
      return (
        <div className="flex items-center gap-1.5" data-testid="status-auto-save">
          <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
          <span className="text-xs text-muted-foreground whitespace-nowrap" data-testid="text-save-status">
            Saving...
          </span>
        </div>
      );

    case "unsaved":
      return (
        <div className="flex items-center gap-1.5" data-testid="status-auto-save">
          <Circle className="h-2.5 w-2.5 fill-muted-foreground text-muted-foreground" />
          <span className="text-xs text-muted-foreground whitespace-nowrap" data-testid="text-save-status">
            Unsaved changes
          </span>
        </div>
      );

    case "error":
      return (
        <div className="flex items-center gap-1.5" data-testid="status-auto-save">
          <AlertCircle className="h-3.5 w-3.5 text-destructive" />
          <span className="text-xs text-destructive whitespace-nowrap" data-testid="text-save-status">
            Save failed
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="text-xs h-auto py-0.5 px-1.5"
            data-testid="button-retry-save"
          >
            Retry
          </Button>
        </div>
      );
  }
}
