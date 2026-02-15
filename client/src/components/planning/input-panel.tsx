import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import type { ExperienceTier } from "@/components/planning/mode-switcher";
import { FormsMode } from "@/components/planning/forms-mode";
import { QuickEntryMode } from "@/components/planning/quick-entry-mode";

interface InputPanelProps {
  activeMode: ExperienceTier;
  planId: string;
}

export function InputPanel({ activeMode, planId }: InputPanelProps) {
  if (activeMode === "forms") {
    return (
      <div data-testid="input-panel" className="h-full overflow-hidden">
        <FormsMode planId={planId} />
      </div>
    );
  }

  if (activeMode === "quick_entry") {
    return (
      <div data-testid="input-panel" className="h-full overflow-hidden">
        <QuickEntryMode planId={planId} />
      </div>
    );
  }

  return (
    <div data-testid="input-panel" className="h-full p-4 overflow-auto">
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Planning Assistant</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            The AI Planning Advisor will be available here. For now, use Forms or Quick Entry to build your plan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
