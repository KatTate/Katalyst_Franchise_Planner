import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { MoreHorizontal, Pencil, Copy, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DeletePlanDialog } from "./delete-plan-dialog";
import { RenamePlanDialog } from "./rename-plan-dialog";

interface PlanContextMenuProps {
  planId: string;
  planName: string;
  isActivePlan: boolean;
  isLastPlan: boolean;
  nextPlanId?: string | null;
  onRename?: () => void;
}

export function PlanContextMenu({
  planId,
  planName,
  isActivePlan,
  isLastPlan,
  nextPlanId,
  onRename,
}: PlanContextMenuProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [clonedPlan, setClonedPlan] = useState<{ id: string; name: string } | null>(null);

  const cloneMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/plans/${planId}/clone`);
      return res.json();
    },
    onSuccess: (plan: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      toast({ title: "Plan cloned", description: `"${plan.name}" created. You can rename it now.` });
      setClonedPlan({ id: plan.id, name: plan.name });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to clone plan", description: err.message, variant: "destructive" });
    },
  });

  const handleRenameClick = () => {
    if (onRename) {
      onRename();
    } else {
      setRenameOpen(true);
    }
  };

  const handleCloneRenameClose = (open: boolean) => {
    if (!open && clonedPlan) {
      setLocation(`/plans/${clonedPlan.id}`);
      setClonedPlan(null);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            data-testid={`menu-plan-${planId}`}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem
            onClick={handleRenameClick}
            data-testid={`menu-rename-plan-${planId}`}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => cloneMutation.mutate()}
            disabled={cloneMutation.isPending}
            data-testid={`menu-clone-plan-${planId}`}
          >
            <Copy className="h-4 w-4 mr-2" />
            {cloneMutation.isPending ? "Cloning..." : "Clone Plan"}
          </DropdownMenuItem>
          {isLastPlan ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <DropdownMenuItem
                    disabled
                    data-testid={`menu-delete-plan-${planId}`}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Plan
                  </DropdownMenuItem>
                </div>
              </TooltipTrigger>
              <TooltipContent>You must have at least one plan</TooltipContent>
            </Tooltip>
          ) : (
            <DropdownMenuItem
              onClick={() => setDeleteOpen(true)}
              className="text-destructive focus:text-destructive"
              data-testid={`menu-delete-plan-${planId}`}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Plan
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DeletePlanDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        planId={planId}
        planName={planName}
        isActivePlan={isActivePlan}
        nextPlanId={nextPlanId}
      />

      <RenamePlanDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        planId={planId}
        currentName={planName}
      />

      {clonedPlan && (
        <RenamePlanDialog
          open={!!clonedPlan}
          onOpenChange={handleCloneRenameClose}
          planId={clonedPlan.id}
          currentName={clonedPlan.name}
        />
      )}
    </>
  );
}
