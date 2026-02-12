import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, ClipboardList, Grid3X3 } from "lucide-react";

type ExperienceTier = "planning_assistant" | "forms" | "quick_entry";

interface InputPanelProps {
  activeMode: ExperienceTier;
}

const MODE_PLACEHOLDERS: Record<ExperienceTier, { icon: typeof MessageSquare; title: string; description: string }> = {
  planning_assistant: {
    icon: MessageSquare,
    title: "Planning Assistant",
    description: "The AI Planning Advisor will be available here. For now, use Forms or Quick Entry to build your plan.",
  },
  forms: {
    icon: ClipboardList,
    title: "Forms",
    description: "Section-based input forms are coming soon.",
  },
  quick_entry: {
    icon: Grid3X3,
    title: "Quick Entry",
    description: "Spreadsheet-style input grid is coming soon.",
  },
};

export function InputPanel({ activeMode }: InputPanelProps) {
  const placeholder = MODE_PLACEHOLDERS[activeMode];
  const Icon = placeholder.icon;

  return (
    <div data-testid="input-panel" className="h-full p-4 overflow-auto">
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{placeholder.title}</h3>
          <p className="text-muted-foreground text-sm max-w-sm">{placeholder.description}</p>
        </CardContent>
      </Card>
    </div>
  );
}
