import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface RenamePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  currentName: string;
  onSuccess?: (newName: string) => void;
}

export function RenamePlanDialog({
  open,
  onOpenChange,
  planId,
  currentName,
  onSuccess,
}: RenamePlanDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState(currentName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(currentName);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [open, currentName]);

  const renameMutation = useMutation({
    mutationFn: async (newName: string) => {
      const res = await apiRequest("PATCH", `/api/plans/${planId}`, { name: newName });
      return res.json();
    },
    onSuccess: (data: any) => {
      const updated = data.data || data;
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/plans", planId] });
      toast({ title: "Plan renamed", description: `Renamed to "${updated.name}".` });
      onOpenChange(false);
      onSuccess?.(updated.name);
    },
    onError: (err: Error) => {
      toast({ title: "Failed to rename plan", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 100) return;
    if (trimmed === currentName) {
      onOpenChange(false);
      return;
    }
    renameMutation.mutate(trimmed);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-rename-plan">
        <DialogHeader>
          <DialogTitle data-testid="text-rename-plan-title">Rename Plan</DialogTitle>
          <DialogDescription>Enter a new name for your plan.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rename-plan-input">Plan Name</Label>
            <Input
              id="rename-plan-input"
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              data-testid="input-rename-plan-dialog"
            />
            {name.trim().length === 0 && (
              <p className="text-sm text-destructive">Plan name is required</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-rename-dialog"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || name.trim().length > 100 || renameMutation.isPending}
              data-testid="button-submit-rename-dialog"
            >
              {renameMutation.isPending ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
