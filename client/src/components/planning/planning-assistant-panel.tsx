import { useEffect, useCallback } from "react";
import { X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { usePlanningAssistant } from "@/contexts/PlanningAssistantContext";
import { useConversation } from "@/hooks/use-conversation";
import { useIsMobile } from "@/hooks/use-mobile";
import { ConversationPanel } from "@/components/planning/conversation-panel";
import { LiveDashboardPanel } from "@/components/planning/live-dashboard-panel";
import { MobilePlanningAssistant } from "@/components/planning/mobile-planning-assistant";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import type { PlanFinancialInputs } from "@shared/financial-engine";
import type { Plan } from "@shared/schema";

interface PlanningAssistantPanelProps {
  planId: string;
  plan: Plan;
  userName: string;
  brandName: string;
  financialInputs: PlanFinancialInputs | null;
  startupCostCount: number;
  queueSave: (data: Partial<Plan>) => void;
}

function setNestedValue(obj: any, path: string, value: any): any {
  const keys = path.split(".");
  const result = JSON.parse(JSON.stringify(obj || {}));
  let current = result;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]] || typeof current[keys[i]] !== "object") {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  const lastKey = keys[keys.length - 1];
  const existing = current[lastKey];
  const now = new Date().toISOString();

  if (Array.isArray(existing)) {
    current[lastKey] = existing.map((item: any) => ({
      ...item,
      currentValue: value,
      source: "ai_populated",
      isCustom: true,
      lastModifiedAt: now,
    }));
  } else if (existing && typeof existing === "object" && "currentValue" in existing) {
    current[lastKey] = {
      ...existing,
      currentValue: value,
      source: "ai_populated",
      isCustom: true,
      lastModifiedAt: now,
    };
  } else {
    current[lastKey] = {
      currentValue: value,
      source: "ai_populated",
      brandDefault: null,
      item7Range: null,
      isCustom: true,
      lastModifiedAt: now,
    };
  }
  return result;
}

export function PlanningAssistantPanel({
  planId,
  plan,
  userName,
  brandName,
  financialInputs,
  startupCostCount,
  queueSave,
}: PlanningAssistantPanelProps) {
  const { closePlanningAssistant, sidebarStateBeforeOpen } = usePlanningAssistant();
  const { setOpen: setSidebarOpen } = useSidebar();
  const isMobile = useIsMobile();
  const isCompact = typeof window !== "undefined" && window.innerWidth < 1024;

  const handleValuesExtracted = useCallback(
    (values: Record<string, number>) => {
      let updatedInputs = { ...(financialInputs || {}) };
      for (const [path, value] of Object.entries(values)) {
        updatedInputs = setNestedValue(updatedInputs, path, value);
      }
      queueSave({ financialInputs: updatedInputs as any });
    },
    [financialInputs, queueSave]
  );

  const {
    messages,
    isStreaming,
    streamingContent,
    sendMessage,
    initializeGreeting,
  } = useConversation({
    userName,
    brandName,
    onValuesExtracted: handleValuesExtracted,
  });

  useEffect(() => {
    initializeGreeting();
  }, [initializeGreeting]);

  const handleClose = useCallback(() => {
    closePlanningAssistant();
    setSidebarOpen(sidebarStateBeforeOpen.current);
  }, [closePlanningAssistant, setSidebarOpen, sidebarStateBeforeOpen]);

  if (isMobile || isCompact) {
    return (
      <div className="flex flex-col h-full" data-testid="planning-assistant-panel">
        <div className="flex items-center justify-between px-4 py-2 border-b shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Planning Assistant</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8"
            data-testid="button-close-assistant"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 min-h-0">
          <MobilePlanningAssistant
            messages={messages}
            isStreaming={isStreaming}
            streamingContent={streamingContent}
            onSendMessage={sendMessage}
            planId={planId}
            financialInputs={financialInputs}
            startupCostCount={startupCostCount}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" data-testid="planning-assistant-panel">
      <div className="flex items-center justify-between px-4 py-2 border-b shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Planning Assistant</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="h-8 w-8"
          data-testid="button-close-assistant"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal" data-testid="split-screen-layout">
          <ResizablePanel defaultSize={50} minSize={30} data-testid="panel-conversation">
            <ErrorBoundary fallbackMessage="Conversation panel encountered an error.">
              <ConversationPanel
                messages={messages}
                isStreaming={isStreaming}
                streamingContent={streamingContent}
                onSendMessage={sendMessage}
              />
            </ErrorBoundary>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50} minSize={25} data-testid="panel-dashboard">
            <ErrorBoundary fallbackMessage="Dashboard panel encountered an error.">
              <LiveDashboardPanel
                planId={planId}
                financialInputs={financialInputs}
                startupCostCount={startupCostCount}
              />
            </ErrorBoundary>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
