import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ConversationPanel } from "@/components/planning/conversation-panel";
import { LiveDashboardPanel } from "@/components/planning/live-dashboard-panel";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import type { SimulatedMessage } from "@/lib/planning-assistant-simulation";
import type { PlanFinancialInputs } from "@shared/financial-engine";

interface MobilePlanningAssistantProps {
  messages: SimulatedMessage[];
  isStreaming: boolean;
  streamingContent: string;
  onSendMessage: (text: string) => void;
  planId: string;
  financialInputs: PlanFinancialInputs | null;
  startupCostCount: number;
}

export function MobilePlanningAssistant({
  messages,
  isStreaming,
  streamingContent,
  onSendMessage,
  planId,
  financialInputs,
  startupCostCount,
}: MobilePlanningAssistantProps) {
  return (
    <div className="flex flex-col h-full" data-testid="mobile-planning-assistant">
      <Tabs defaultValue="chat" className="flex flex-col h-full">
        <div className="shrink-0 px-4 pt-2">
          <TabsList className="w-full" data-testid="mobile-tabs">
            <TabsTrigger value="chat" className="flex-1" data-testid="tab-chat">
              Chat
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex-1" data-testid="tab-dashboard">
              Dashboard
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="chat" className="flex-1 min-h-0 mt-0">
          <ErrorBoundary fallbackMessage="Conversation panel encountered an error.">
            <ConversationPanel
              messages={messages}
              isStreaming={isStreaming}
              streamingContent={streamingContent}
              onSendMessage={onSendMessage}
            />
          </ErrorBoundary>
        </TabsContent>
        <TabsContent value="dashboard" className="flex-1 min-h-0 mt-0">
          <ErrorBoundary fallbackMessage="Dashboard panel encountered an error.">
            <LiveDashboardPanel
              planId={planId}
              financialInputs={financialInputs}
              startupCostCount={startupCostCount}
            />
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
}
