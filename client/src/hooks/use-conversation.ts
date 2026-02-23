import { useState, useCallback, useRef } from "react";
import { getGreeting, streamResponse } from "@/lib/planning-assistant-simulation";
import type { SimulatedMessage } from "@/lib/planning-assistant-simulation";
import { usePlanningAssistant } from "@/contexts/PlanningAssistantContext";

interface UseConversationOptions {
  userName: string;
  brandName: string;
  onValuesExtracted?: (values: Record<string, number>) => void;
}

interface UseConversationReturn {
  messages: SimulatedMessage[];
  isStreaming: boolean;
  streamingContent: string;
  sendMessage: (text: string) => Promise<void>;
  initializeGreeting: () => void;
}

export function useConversation({
  userName,
  brandName,
  onValuesExtracted,
}: UseConversationOptions): UseConversationReturn {
  const { messages, setMessages } = usePlanningAssistant();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const abortRef = useRef(false);

  const initializeGreeting = useCallback(() => {
    if (messages.length === 0 && userName && brandName) {
      const greeting = getGreeting(userName, brandName);
      setMessages([greeting]);
    }
  }, [messages.length, userName, brandName, setMessages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMsg: SimulatedMessage = {
        id: `msg-${Date.now()}-user`,
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev: SimulatedMessage[]) => [...prev, userMsg]);
      setIsStreaming(true);
      setStreamingContent("");
      abortRef.current = false;

      let accumulated = "";
      let extractedValues: Record<string, number> | undefined;

      try {
        const currentMessages = [...messages, userMsg];
        for await (const chunk of streamResponse(text, currentMessages)) {
          if (abortRef.current) break;
          accumulated += chunk.char;
          setStreamingContent(accumulated);
          if (chunk.done && chunk.extractedValues) {
            extractedValues = chunk.extractedValues;
          }
        }

        const assistantMsg: SimulatedMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: "assistant",
          content: accumulated,
          timestamp: new Date(),
          extractedValues,
        };

        setMessages((prev: SimulatedMessage[]) => [...prev, assistantMsg]);

        if (extractedValues && onValuesExtracted) {
          onValuesExtracted(extractedValues);
        }
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
      }
    },
    [isStreaming, messages, setMessages, onValuesExtracted]
  );

  return {
    messages,
    isStreaming,
    streamingContent,
    sendMessage,
    initializeGreeting,
  };
}
