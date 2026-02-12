import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeSwitcher } from "@/components/planning/mode-switcher";

type ExperienceTier = "planning_assistant" | "forms" | "quick_entry";

interface PlanningHeaderProps {
  planName: string;
  activeMode: ExperienceTier;
  onModeChange: (mode: ExperienceTier) => void;
}

export function PlanningHeader({ planName, activeMode, onModeChange }: PlanningHeaderProps) {
  return (
    <header className="flex items-center gap-3 px-3 py-2 border-b bg-background shrink-0">
      <SidebarTrigger data-testid="button-sidebar-toggle" />
      <h1 className="text-sm font-semibold truncate min-w-0">{planName}</h1>
      <div className="flex-1" />
      <ModeSwitcher activeMode={activeMode} onModeChange={onModeChange} />
      <div className="flex-1" />
      {/* Save status placeholder — implemented in Story 4.5 */}
      <span className="text-xs text-muted-foreground whitespace-nowrap">All changes saved</span>
    </header>
  );
}
