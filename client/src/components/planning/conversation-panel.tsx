import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Bot, User } from "lucide-react";
import type { SimulatedMessage } from "@/lib/planning-assistant-simulation";

interface ConversationPanelProps {
  messages: SimulatedMessage[];
  isStreaming: boolean;
  streamingContent: string;
  onSendMessage: (text: string) => void;
}

function MessageBubble({ message }: { message: SimulatedMessage }) {
  const isAssistant = message.role === "assistant";
  return (
    <div
      className={`flex gap-3 ${isAssistant ? "" : "flex-row-reverse"}`}
      data-testid={`message-${message.role}-${message.id}`}
    >
      <div
        className={`shrink-0 flex items-center justify-center h-8 w-8 rounded-full ${
          isAssistant
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isAssistant
            ? "bg-muted text-foreground"
            : "bg-primary text-primary-foreground"
        }`}
        data-testid={`text-message-content-${message.id}`}
      >
        {message.content}
      </div>
    </div>
  );
}

function StreamingBubble({ content }: { content: string }) {
  return (
    <div className="flex gap-3" data-testid="message-streaming">
      <div className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">
        <Bot className="h-4 w-4" />
      </div>
      <div className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed bg-muted text-foreground whitespace-pre-wrap">
        {content}
        <span className="inline-block w-1.5 h-4 bg-primary/60 animate-pulse ml-0.5 align-text-bottom" />
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3" data-testid="typing-indicator">
      <div className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">
        <Bot className="h-4 w-4" />
      </div>
      <div className="rounded-2xl px-4 py-3 bg-muted flex gap-1.5 items-center">
        <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

export function ConversationPanel({
  messages,
  isStreaming,
  streamingContent,
  onSendMessage,
}: ConversationPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const handleSubmit = () => {
    if (!inputValue.trim() || isStreaming) return;
    onSendMessage(inputValue);
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full" data-testid="conversation-panel">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        data-testid="message-list"
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isStreaming && streamingContent && (
          <StreamingBubble content={streamingContent} />
        )}
        {isStreaming && !streamingContent && <TypingIndicator />}
      </div>

      <div className="border-t p-3" data-testid="message-input-area">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell me about your business..."
            className="flex-1 resize-none rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[40px] max-h-[120px]"
            rows={1}
            disabled={isStreaming}
            data-testid="input-message"
          />
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!inputValue.trim() || isStreaming}
            className="shrink-0 rounded-xl h-10 w-10"
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
