import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Brand, StartupCostTemplate, StartupCostItem } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";

const startupCostFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  default_amount: z.number().min(0, "Amount must be positive"),
  capex_classification: z.enum(["capex", "non_capex", "working_capital"]),
  item7_range_low: z.number().min(0).nullable(),
  item7_range_high: z.number().min(0).nullable(),
}).refine(
  (data) => {
    if (data.item7_range_low !== null && data.item7_range_high !== null) {
      return data.item7_range_low <= data.item7_range_high;
    }
    return true;
  },
  { message: "Low range must be less than or equal to high range", path: ["item7_range_high"] }
);

type StartupCostFormData = z.infer<typeof startupCostFormSchema>;

export function StartupCostTemplateTab({ brand }: { brand: Brand }) {
  const { toast } = useToast();
  const [items, setItems] = useState<StartupCostItem[]>(brand.startupCostTemplate || []);
  const [editingItem, setEditingItem] = useState<StartupCostItem | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  const form = useForm<StartupCostFormData>({
    resolver: zodResolver(startupCostFormSchema),
    defaultValues: { name: "", default_amount: 0, capex_classification: "capex", item7_range_low: null, item7_range_high: null },
  });

  const saveTemplate = useMutation({
    mutationFn: async (template: StartupCostTemplate) => {
      const res = await apiRequest("PUT", `/api/brands/${brand.id}/startup-cost-template`, template);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands", brand.id] });
      toast({ title: "Template saved", description: "Startup cost template has been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleAddItem = (data: StartupCostFormData) => {
    const newItem: StartupCostItem = {
      id: crypto.randomUUID(),
      name: data.name,
      default_amount: data.default_amount,
      capex_classification: data.capex_classification,
      item7_range_low: data.item7_range_low,
      item7_range_high: data.item7_range_high,
      sort_order: items.length,
    };
    const updated = [...items, newItem];
    setItems(updated);
    saveTemplate.mutate(updated);
    setShowAddDialog(false);
    form.reset();
  };

  const handleEditItem = (data: StartupCostFormData) => {
    if (!editingItem) return;
    const updated = items.map((item) =>
      item.id === editingItem.id
        ? { ...item, ...data }
        : item
    );
    setItems(updated);
    saveTemplate.mutate(updated);
    setEditingItem(null);
    form.reset();
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id).map((item, i) => ({ ...item, sort_order: i }));
    setItems(updated);
    saveTemplate.mutate(updated);
    setDeleteItemId(null);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...items];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    const reindexed = updated.map((item, i) => ({ ...item, sort_order: i }));
    setItems(reindexed);
    saveTemplate.mutate(reindexed);
  };

  const handleMoveDown = (index: number) => {
    if (index >= items.length - 1) return;
    const updated = [...items];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    const reindexed = updated.map((item, i) => ({ ...item, sort_order: i }));
    setItems(reindexed);
    saveTemplate.mutate(reindexed);
  };

  const openEditDialog = (item: StartupCostItem) => {
    setEditingItem(item);
    form.reset({
      name: item.name,
      default_amount: item.default_amount,
      capex_classification: item.capex_classification,
      item7_range_low: item.item7_range_low,
      item7_range_high: item.item7_range_high,
    });
  };

  const openAddDialog = () => {
    form.reset({ name: "", default_amount: 0, capex_classification: "capex", item7_range_low: null, item7_range_high: null });
    setShowAddDialog(true);
  };

  const formatCurrency = (n: number | null) => n !== null ? `$${n.toLocaleString()}` : "—";

  const deleteTarget = items.find((i) => i.id === deleteItemId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Startup Cost Template</h2>
          <p className="text-sm text-muted-foreground">Define the default line items franchisees see when creating a plan</p>
        </div>
        <Button onClick={openAddDialog} data-testid="button-add-line-item">
          <Plus className="h-4 w-4 mr-2" />
          Add Line Item
        </Button>
      </div>

      {!items.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground" data-testid="text-no-startup-costs">No startup cost items yet</p>
            <Button className="mt-4" variant="outline" onClick={openAddDialog} data-testid="button-add-first-item">
              <Plus className="h-4 w-4 mr-2" />
              Add First Line Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Default Amount</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead className="text-right">Item 7 Low</TableHead>
                <TableHead className="text-right">Item 7 High</TableHead>
                <TableHead className="w-[160px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id} data-testid={`row-startup-cost-${item.id}`}>
                  <TableCell className="font-medium" data-testid={`text-cost-name-${item.id}`}>{item.name}</TableCell>
                  <TableCell className="text-right" data-testid={`text-cost-amount-${item.id}`}>{formatCurrency(item.default_amount)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" data-testid={`badge-cost-class-${item.id}`}>
                      {item.capex_classification === "capex" ? "CapEx" : item.capex_classification === "non_capex" ? "Non-CapEx" : "Working Capital"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(item.item7_range_low)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.item7_range_high)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        aria-label={`Move ${item.name} up`}
                        data-testid={`button-move-up-cost-${item.id}`}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === items.length - 1}
                        aria-label={`Move ${item.name} down`}
                        data-testid={`button-move-down-cost-${item.id}`}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditDialog(item)}
                        aria-label={`Edit ${item.name}`}
                        data-testid={`button-edit-cost-${item.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteItemId(item.id)}
                        aria-label={`Delete ${item.name}`}
                        data-testid={`button-delete-cost-${item.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={showAddDialog || !!editingItem} onOpenChange={(open) => { if (!open) { setShowAddDialog(false); setEditingItem(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle data-testid="text-cost-dialog-title">{editingItem ? "Edit Line Item" : "Add Line Item"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Update the details for this startup cost item." : "Add a new startup cost line item to the template."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(editingItem ? handleEditItem : handleAddItem)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Line Item Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Leasehold Improvements" data-testid="input-cost-name" />
                    </FormControl>
                    <FormDescription>Use the Item 7 description from the FDD if applicable</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="default_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Value ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-cost-amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capex_classification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CapEx Classification</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-cost-classification">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="capex">CapEx (depreciated over time)</SelectItem>
                        <SelectItem value="non_capex">Non-CapEx (expensed in Year 1)</SelectItem>
                        <SelectItem value="working_capital">Working Capital</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>CapEx costs are depreciated; non-CapEx costs are expensed in Year 1</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="item7_range_low"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item 7 Low ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                          placeholder="Optional"
                          data-testid="input-cost-item7-low"
                        />
                      </FormControl>
                      <FormDescription>Leave blank if not in Item 7 of the FDD</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="item7_range_high"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item 7 High ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                          placeholder="Optional"
                          data-testid="input-cost-item7-high"
                        />
                      </FormControl>
                      <FormDescription>Leave blank if not in Item 7 of the FDD</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setShowAddDialog(false); setEditingItem(null); }}>Cancel</Button>
                <Button type="submit" disabled={saveTemplate.isPending} data-testid="button-save-cost-item">
                  {saveTemplate.isPending ? "Saving..." : editingItem ? "Update Item" : "Add Item"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteItemId} onOpenChange={(open) => { if (!open) setDeleteItemId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Line Item</AlertDialogTitle>
            <AlertDialogDescription>
              Remove &ldquo;{deleteTarget?.name}&rdquo; from the template? This will not affect existing plans.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-cost">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteItemId && handleDeleteItem(deleteItemId)}
              className="bg-destructive text-destructive-foreground hover-elevate"
              data-testid="button-confirm-delete-cost"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
