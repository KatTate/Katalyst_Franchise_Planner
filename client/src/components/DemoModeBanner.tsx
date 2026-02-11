import { useState } from "react";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { Button } from "@/components/ui/button";
import { Monitor, X, RotateCcw, Loader2 } from "lucide-react";

export function DemoModeBanner() {
  const { active, brandId, brandName, exitDemoMode, resetDemoData } = useDemoMode();
  const [isResetting, setIsResetting] = useState(false);

  if (!active || !brandName || !brandId) return null;

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetDemoData(brandId);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div
      role="status"
      className="flex items-center justify-between gap-3 px-4 h-12 text-white text-sm font-medium"
      style={{ backgroundColor: "#0891B2" }}
      data-testid="demo-mode-banner"
    >
      <div className="flex items-center gap-2 min-w-0 flex-wrap">
        <Monitor className="h-4 w-4 shrink-0" />
        <span data-testid="demo-mode-banner-label">
          Demo Mode: {brandName}
        </span>
        <span className="text-white/80">&mdash;</span>
        <span className="text-white/80">Franchisee View</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          disabled={isResetting}
          className="text-white shrink-0 no-default-hover-elevate"
          data-testid="button-reset-demo-data"
        >
          {isResetting ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4 mr-1" />
          )}
          Reset Demo Data
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={exitDemoMode}
          className="text-white shrink-0 no-default-hover-elevate"
          data-testid="button-exit-demo"
        >
          <X className="h-4 w-4 mr-1" />
          Exit Demo
        </Button>
      </div>
    </div>
  );
}
