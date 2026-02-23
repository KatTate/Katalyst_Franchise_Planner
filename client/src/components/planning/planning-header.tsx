import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SaveIndicator } from "@/components/planning/save-indicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarCheck, Pencil, Check, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SaveStatus } from "@/hooks/use-plan-auto-save";

interface PlanningHeaderProps {
  planId: string;
  planName: string;
  saveStatus: SaveStatus;
  onRetrySave: () => void;
  onNameChange?: (newName: string) => void;
}

export function PlanningHeader({
  planId,
  planName,
  saveStatus,
  onRetrySave,
  onNameChange,
}: PlanningHeaderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const bookingUrl = user?.bookingUrl;
  const accountManagerId = user?.accountManagerId;
  const accountManagerName = user?.accountManagerName;

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(planName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const renameMutation = useMutation({
    mutationFn: async (newName: string) => {
      const res = await apiRequest("PATCH", `/api/plans/${planId}`, { name: newName });
      return res.json();
    },
    onSuccess: (data: any) => {
      const updated = data.data || data;
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/plans", planId] });
      onNameChange?.(updated.name);
      setIsEditing(false);
    },
    onError: (err: Error) => {
      toast({ title: "Failed to rename plan", description: err.message, variant: "destructive" });
      setEditValue(planName);
      setIsEditing(false);
    },
  });

  const handleSaveName = () => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === planName) {
      setEditValue(planName);
      setIsEditing(false);
      return;
    }
    renameMutation.mutate(trimmed);
  };

  const handleCancelEdit = () => {
    setEditValue(planName);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveName();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <header className="flex items-center gap-3 px-3 py-2 border-b bg-background shrink-0">
      <SidebarTrigger data-testid="button-sidebar-toggle" />
      {isEditing ? (
        <div className="flex items-center gap-1 min-w-0 max-w-xs">
          <Input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSaveName}
            className="h-7 text-sm font-semibold"
            data-testid="input-rename-plan"
            maxLength={100}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleSaveName}
            disabled={renameMutation.isPending}
            data-testid="button-confirm-rename"
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleCancelEdit}
            data-testid="button-cancel-rename"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1 min-w-0 group">
          <h1
            className="text-sm font-semibold truncate min-w-0 cursor-pointer"
            onClick={() => { setEditValue(planName); setIsEditing(true); }}
            data-testid="text-plan-name"
          >{planName}</h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => { setEditValue(planName); setIsEditing(true); }}
            data-testid="button-edit-plan-name"
          >
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
      )}
      <div className="flex-1" />
      {bookingUrl && accountManagerId && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.open(bookingUrl, '_blank', 'noopener,noreferrer')}
              data-testid="button-header-book-consultation"
            >
              <CalendarCheck className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {accountManagerName ? `Book with ${accountManagerName}` : "Book Consultation"}
          </TooltipContent>
        </Tooltip>
      )}
      <SaveIndicator status={saveStatus} onRetry={onRetrySave} />
    </header>
  );
}
