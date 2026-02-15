import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeSwitcher } from "@/components/planning/mode-switcher";
import { SaveIndicator } from "@/components/planning/save-indicator";
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
  return (
    <header className="flex items-center gap-3 px-3 py-2 border-b bg-background shrink-0">
      <SidebarTrigger data-testid="button-sidebar-toggle" />
      <h1 className="text-sm font-semibold truncate min-w-0">{planName}</h1>
      <div className="flex-1" />
      <ModeSwitcher activeMode={activeMode} onModeChange={onModeChange} />
      <div className="flex-1" />
      <SaveIndicator status={saveStatus} onRetry={onRetrySave} />
    </header>
  );
}
