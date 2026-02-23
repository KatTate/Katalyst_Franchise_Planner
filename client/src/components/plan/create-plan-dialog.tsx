import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const createPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required").max(100, "Plan name must be 100 characters or less"),
});

type CreatePlanForm = z.infer<typeof createPlanSchema>;

interface CreatePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePlanDialog({ open, onOpenChange }: CreatePlanDialogProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<CreatePlanForm>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: { name: "" },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreatePlanForm) => {
      const res = await apiRequest("POST", "/api/plans", data);
      return res.json();
    },
    onSuccess: (plan: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      toast({ title: "Plan created", description: `"${plan.name}" is ready.` });
      form.reset();
      onOpenChange(false);
      setLocation(`/plans/${plan.id}`);
    },
    onError: (err: Error) => {
      toast({ title: "Failed to create plan", description: err.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: CreatePlanForm) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) form.reset(); onOpenChange(val); }}>
      <DialogContent data-testid="dialog-create-plan">
        <DialogHeader>
          <DialogTitle data-testid="text-create-plan-title">Create New Plan</DialogTitle>
          <DialogDescription>Give your plan a name, like a location or scenario.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., PostNet - Downtown Location"
                      data-testid="input-plan-name"
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => { form.reset(); onOpenChange(false); }}
                data-testid="button-cancel-create-plan"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                data-testid="button-submit-create-plan"
              >
                {createMutation.isPending ? "Creating..." : "Create Plan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
