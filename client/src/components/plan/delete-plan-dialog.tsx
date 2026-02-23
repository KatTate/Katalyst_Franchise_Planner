import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface DeletePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  planName: string;
  isActivePlan: boolean;
  nextPlanId?: string | null;
}

export function DeletePlanDialog({
  open,
  onOpenChange,
  planId,
  planName,
  isActivePlan,
  nextPlanId,
}: DeletePlanDialogProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [confirmText, setConfirmText] = useState("");

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/plans/${planId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      toast({ title: "Plan deleted", description: `"${planName}" has been permanently removed.` });
      setConfirmText("");
      onOpenChange(false);
      if (isActivePlan) {
        if (nextPlanId) {
          setLocation(`/plans/${nextPlanId}`);
        } else {
          setLocation("/");
        }
      }
    },
    onError: (err: Error) => {
      toast({ title: "Failed to delete plan", description: err.message, variant: "destructive" });
    },
  });

  const canDelete = confirmText === planName;

  return (
    <AlertDialog open={open} onOpenChange={(val) => { if (!val) setConfirmText(""); onOpenChange(val); }}>
      <AlertDialogContent data-testid="dialog-delete-plan">
        <AlertDialogHeader>
          <AlertDialogTitle data-testid="text-delete-plan-title">Delete {planName}?</AlertDialogTitle>
          <AlertDialogDescription data-testid="text-delete-plan-description">
            This cannot be undone. All financial data and generated documents for this plan will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="confirm-delete">Type the plan name to confirm:</Label>
          <Input
            id="confirm-delete"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={planName}
            data-testid="input-confirm-delete"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => setConfirmText("")}
            data-testid="button-cancel-delete-plan"
          >
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={!canDelete || deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
            data-testid="button-confirm-delete-plan"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Plan"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
