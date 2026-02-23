import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlanningAssistant } from "@/contexts/PlanningAssistantContext";
import { useSidebar } from "@/components/ui/sidebar";

export function PlanningAssistantFAB() {
  const { openPlanningAssistant, isOpen, sidebarStateBeforeOpen } = usePlanningAssistant();
  const { open: sidebarOpen, setOpen: setSidebarOpen } = useSidebar();

  if (isOpen) return null;

  const handleClick = () => {
    sidebarStateBeforeOpen.current = sidebarOpen;
    setSidebarOpen(false);
    openPlanningAssistant();
  };

  return (
    <Button
      onClick={handleClick}
      className="fixed bottom-20 right-6 z-30 rounded-full h-12 w-12 shadow-lg hover:shadow-xl transition-shadow"
      size="icon"
      data-testid="button-planning-assistant-fab"
    >
      <MessageSquare className="h-5 w-5" />
    </Button>
  );
}
