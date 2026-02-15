import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeSwitcher } from "@/components/planning/mode-switcher";
import { SaveIndicator } from "@/components/planning/save-indicator";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { ExperienceTier } from "@/components/planning/mode-switcher";
import type { SaveStatus } from "@/hooks/use-plan-auto-save";

interface PlanningHeaderProps {
  planName: string;
  activeMode: ExperienceTier;
  onModeChange: (mode: ExperienceTier) => void;
  saveStatus: SaveStatus;
  onRetrySave: () => void;
}

export function PlanningHeader({ planName, activeMode, onModeChange, saveStatus, onRetrySave }: PlanningHeaderProps) {
  const { user } = useAuth();
  const bookingUrl = user?.bookingUrl;
  const accountManagerName = user?.accountManagerName;

  return (
    <header className="flex items-center gap-3 px-3 py-2 border-b bg-background shrink-0">
      <SidebarTrigger data-testid="button-sidebar-toggle" />
      <h1 className="text-sm font-semibold truncate min-w-0">{planName}</h1>
      <div className="flex-1" />
      <ModeSwitcher activeMode={activeMode} onModeChange={onModeChange} />
      <div className="flex-1" />
      {bookingUrl && (
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
