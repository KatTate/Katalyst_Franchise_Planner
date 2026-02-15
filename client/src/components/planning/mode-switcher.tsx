export type ExperienceTier = "planning_assistant" | "forms" | "quick_entry";

const MODES: { value: ExperienceTier; label: string; testId: string }[] = [
  { value: "planning_assistant", label: "Planning Assistant", testId: "mode-switcher-planning-assistant" },
  { value: "forms", label: "Forms", testId: "mode-switcher-forms" },
  { value: "quick_entry", label: "Quick Entry", testId: "mode-switcher-quick-entry" },
];

interface ModeSwitcherProps {
  activeMode: ExperienceTier;
  onModeChange: (mode: ExperienceTier) => void;
}

export function ModeSwitcher({ activeMode, onModeChange }: ModeSwitcherProps) {
  return (
    <div
      data-testid="mode-switcher"
      role="tablist"
      aria-label="Planning mode"
      className="inline-flex items-center rounded-xl bg-muted p-1 gap-0.5"
    >
      {MODES.map((mode) => (
        <button
          key={mode.value}
          data-testid={mode.testId}
          role="tab"
          aria-selected={activeMode === mode.value}
          onClick={() => onModeChange(mode.value)}
          className={`
            px-4 py-1.5 text-sm font-medium rounded-lg transition-colors duration-150
            ${activeMode === mode.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
            }
          `}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
