import { useImpersonation } from "@/contexts/ImpersonationContext";
import { Button } from "@/components/ui/button";
import { Eye, X } from "lucide-react";

export function ImpersonationBanner() {
  const { active, targetUser, readOnly, remainingMinutes, stopImpersonation } = useImpersonation();

  if (!active || !targetUser) return null;

  const displayName = targetUser.displayName || targetUser.email;
  const modeLabel = readOnly ? "Read-Only Mode" : "Editing Enabled";

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-center justify-between gap-3 px-4 h-12 text-white text-sm font-medium"
      style={{ backgroundColor: "#FF6D00" }}
      data-testid="impersonation-banner"
    >
      <div className="flex items-center gap-2 min-w-0">
        <Eye className="h-4 w-4 shrink-0" />
        <span className="truncate" data-testid="impersonation-banner-name">
          {displayName}
        </span>
        <span className="text-white/80">&mdash;</span>
        <span className="text-white/80">Franchisee</span>
        <span className="text-white/80">|</span>
        <span data-testid="impersonation-banner-mode">{modeLabel}</span>
        {remainingMinutes <= 10 && (
          <>
            <span className="text-white/80">|</span>
            <span className="text-white/90 text-xs" data-testid="impersonation-banner-time">
              {remainingMinutes}m remaining
            </span>
          </>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={stopImpersonation}
        className="text-white hover:bg-white/20 shrink-0"
        data-testid="button-exit-view-as"
      >
        <X className="h-4 w-4 mr-1" />
        Exit View As
      </Button>
    </div>
  );
}
