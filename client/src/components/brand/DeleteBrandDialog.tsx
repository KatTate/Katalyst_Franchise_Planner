import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Skeleton } from "@/components/ui/skeleton";

interface DeleteBrandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandId: string;
  brandName: string;
}

export function DeleteBrandDialog({
  open,
  onOpenChange,
  brandId,
  brandName,
}: DeleteBrandDialogProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [confirmText, setConfirmText] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery<{ planCount: number; userCount: number }>({
    queryKey: ["/api/brands", brandId, "stats"],
    enabled: open,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/brands/${brandId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
      toast({ title: "Brand deleted", description: `"${brandName}" has been permanently removed.` });
      setConfirmText("");
      onOpenChange(false);
      setLocation("/admin/brands");
    },
    onError: (err: Error) => {
      toast({ title: "Failed to delete brand", description: err.message, variant: "destructive" });
    },
  });

  const canDelete = confirmText === brandName;

  return (
    <AlertDialog open={open} onOpenChange={(val) => { if (!val) setConfirmText(""); onOpenChange(val); }}>
      <AlertDialogContent data-testid="dialog-delete-brand">
        <AlertDialogHeader>
          <AlertDialogTitle data-testid="text-delete-brand-title">Delete {brandName}?</AlertDialogTitle>
          <AlertDialogDescription data-testid="text-delete-brand-description">
            This action cannot be undone. All plans, franchisee associations, and configuration data for this brand will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-3 py-2">
          {statsLoading ? (
            <Skeleton className="h-5 w-full" data-testid="skeleton-brand-stats" />
          ) : stats ? (
            <p className="text-sm text-muted-foreground" data-testid="text-brand-affected-counts">
              This brand has <strong>{stats.planCount} plan(s)</strong> and <strong>{stats.userCount} user(s)</strong> that will be affected.
              Plans will be permanently deleted. Users will be preserved but become unassigned.
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="confirm-delete-brand">Type the brand name to confirm:</Label>
            <Input
              id="confirm-delete-brand"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={brandName}
              data-testid="input-confirm-delete-brand"
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => setConfirmText("")}
            data-testid="button-cancel-delete-brand"
          >
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={!canDelete || deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
            data-testid="button-confirm-delete-brand"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Brand"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
