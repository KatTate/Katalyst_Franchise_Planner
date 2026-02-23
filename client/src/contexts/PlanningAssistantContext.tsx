import { createContext, useContext, useState, useCallback, useRef } from "react";
import type { SimulatedMessage } from "@/lib/planning-assistant-simulation";

interface PlanningAssistantContextType {
  isOpen: boolean;
  openPlanningAssistant: () => void;
  closePlanningAssistant: () => void;
  togglePlanningAssistant: () => void;
  messages: SimulatedMessage[];
  setMessages: (msgs: SimulatedMessage[] | ((prev: SimulatedMessage[]) => SimulatedMessage[])) => void;
  sidebarStateBeforeOpen: React.MutableRefObject<boolean>;
}

const PlanningAssistantContext = createContext<PlanningAssistantContextType>({
  isOpen: false,
  openPlanningAssistant: () => {},
  closePlanningAssistant: () => {},
  togglePlanningAssistant: () => {},
  messages: [],
  setMessages: () => {},
  sidebarStateBeforeOpen: { current: false },
});

export function PlanningAssistantProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<SimulatedMessage[]>([]);
  const sidebarStateBeforeOpen = useRef(false);

  const openPlanningAssistant = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closePlanningAssistant = useCallback(() => {
    setIsOpen(false);
  }, []);

  const togglePlanningAssistant = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <PlanningAssistantContext.Provider
      value={{
        isOpen,
        openPlanningAssistant,
        closePlanningAssistant,
        togglePlanningAssistant,
        messages,
        setMessages,
        sidebarStateBeforeOpen,
      }}
    >
      {children}
    </PlanningAssistantContext.Provider>
  );
}

export function usePlanningAssistant() {
  return useContext(PlanningAssistantContext);
}
