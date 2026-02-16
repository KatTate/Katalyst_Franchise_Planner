import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeSwitcher } from "@/components/planning/mode-switcher";
import { SaveIndicator } from "@/components/planning/save-indicator";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarCheck, LayoutDashboard, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { ExperienceTier } from "@/components/planning/mode-switcher";
import type { SaveStatus } from "@/hooks/use-plan-auto-save";
import type { WorkspaceView } from "@/pages/planning-workspace";

interface PlanningHeaderProps {
  planName: string;
  activeMode: ExperienceTier;
  onModeChange: (mode: ExperienceTier) => void;
  saveStatus: SaveStatus;
  onRetrySave: () => void;
  workspaceView?: WorkspaceView;
  onViewChange?: (view: WorkspaceView) => void;
}

export function PlanningHeader({
  planName,
  activeMode,
  onModeChange,
  saveStatus,
  onRetrySave,
  workspaceView = "dashboard",
  onViewChange,
}: PlanningHeaderProps) {
  const { user } = useAuth();
  const bookingUrl = user?.bookingUrl;
  const accountManagerId = user?.accountManagerId;
  const accountManagerName = user?.accountManagerName;

  return (
    <header className="flex items-center gap-3 px-3 py-2 border-b bg-background shrink-0">
      <SidebarTrigger data-testid="button-sidebar-toggle" />
      <h1 className="text-sm font-semibold truncate min-w-0">{planName}</h1>
      <div className="flex-1" />
      <ModeSwitcher activeMode={activeMode} onModeChange={onModeChange} />
      {onViewChange && (
        <div className="flex items-center border rounded-md" data-testid="view-switcher">
          <Button
            variant={workspaceView === "dashboard" ? "secondary" : "ghost"}
            size="sm"
            className="rounded-r-none h-8 px-2.5"
            onClick={() => onViewChange("dashboard")}
            data-testid="button-view-dashboard"
          >
            <LayoutDashboard className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs hidden sm:inline">Dashboard</span>
          </Button>
          <Button
            variant={workspaceView === "statements" ? "secondary" : "ghost"}
            size="sm"
            className="rounded-l-none h-8 px-2.5"
            onClick={() => onViewChange("statements")}
            data-testid="button-view-statements"
          >
            <BarChart3 className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs hidden sm:inline">Statements</span>
          </Button>
        </div>
      )}
      <div className="flex-1" />
      {bookingUrl && accountManagerId && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.open(bookingUrl, '_blank', 'noopener,noreferrer')}
              data-testid="button-header-book-consultation"
            >
              <CalendarCheck className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {accountManagerName ? `Book with ${accountManagerName}` : "Book Consultation"}
          </TooltipContent>
        </Tooltip>
      )}
      <SaveIndicator status={saveStatus} onRetry={onRetrySave} />
    </header>
  );
}
