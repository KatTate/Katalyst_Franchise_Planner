import { SidebarTrigger } from "@/components/ui/sidebar";
import { SaveIndicator } from "@/components/planning/save-indicator";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { SaveStatus } from "@/hooks/use-plan-auto-save";

interface PlanningHeaderProps {
  planName: string;
  saveStatus: SaveStatus;
  onRetrySave: () => void;
}

export function PlanningHeader({
  planName,
  saveStatus,
  onRetrySave,
}: PlanningHeaderProps) {
  const { user } = useAuth();
  const bookingUrl = user?.bookingUrl;
  const accountManagerId = user?.accountManagerId;
  const accountManagerName = user?.accountManagerName;

  return (
    <header className="flex items-center gap-3 px-3 py-2 border-b bg-background shrink-0">
      <SidebarTrigger data-testid="button-sidebar-toggle" />
      <h1 className="text-sm font-semibold truncate min-w-0" data-testid="text-plan-name">{planName}</h1>
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
