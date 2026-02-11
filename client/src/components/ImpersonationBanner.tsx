import { useState } from "react";
import { useImpersonation } from "@/contexts/ImpersonationContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Eye, X, Loader2 } from "lucide-react";

export function ImpersonationBanner() {
  const {
    active,
    targetUser,
    readOnly,
    editingEnabled,
    remainingMinutes,
    stopImpersonation,
    toggleEditMode,
    isTogglingEditMode,
  } = useImpersonation();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  if (!active || !targetUser) return null;

  const displayName = targetUser.displayName || targetUser.email;
  const modeLabel = readOnly ? "Read-Only Mode" : "Editing Enabled";

  const handleToggleChange = (checked: boolean) => {
    if (checked) {
      setShowConfirmDialog(true);
    } else {
      toggleEditMode(false);
    }
  };

  const handleConfirmEdit = () => {
    setShowConfirmDialog(false);
    toggleEditMode(true);
  };

  const handleCancelEdit = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <div
        role="alert"
        aria-live="assertive"
        className={`flex items-center justify-between gap-3 px-4 h-12 text-white text-sm font-medium${editingEnabled ? " impersonation-banner-pulse" : ""}`}
        style={{ backgroundColor: "#FF6D00" }}
        data-testid="impersonation-banner"
      >
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
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
        <div className="flex items-center gap-3 shrink-0">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-white/90" data-testid="label-enable-editing">
            {isTogglingEditMode ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : null}
            <span>Enable Editing</span>
            <Switch
              checked={editingEnabled}
              onCheckedChange={handleToggleChange}
              disabled={isTogglingEditMode}
              data-testid="switch-enable-editing"
              className="data-[state=checked]:bg-white/30 data-[state=unchecked]:bg-white/20"
            />
          </label>
          <Button
            variant="ghost"
            size="sm"
            onClick={stopImpersonation}
            className="text-white shrink-0 no-default-hover-elevate"
            data-testid="button-exit-view-as"
          >
            <X className="h-4 w-4 mr-1" />
            Exit View As
          </Button>
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent data-testid="dialog-confirm-edit-mode">
          <AlertDialogHeader>
            <AlertDialogTitle>Enable Editing</AlertDialogTitle>
            <AlertDialogDescription>
              You will be able to modify {displayName}'s data. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelEdit} data-testid="button-cancel-edit-mode">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmEdit} data-testid="button-confirm-edit-mode">
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
