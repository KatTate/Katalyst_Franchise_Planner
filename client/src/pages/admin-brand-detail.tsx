import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest, getQueryFn } from "@/lib/queryClient";
import type { Brand, BrandParameters, StartupCostTemplate, StartupCostItem } from "@shared/schema";
import { brandParameterSchema } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
import { ArrowLeft, Save, Plus, Pencil, Trash2, ArrowUp, ArrowDown, UserPlus, X, Star } from "lucide-react";

function getDefaultBrandParameters(): BrandParameters {
  return {
    revenue: {
      monthly_auv: { value: 0, label: "Monthly AUV", description: "Average unit volume per month" },
      year1_growth_rate: { value: 0, label: "Year 1 Growth Rate", description: "Annual revenue growth rate for year 1 (decimal, e.g. 0.05 = 5%)" },
      year2_growth_rate: { value: 0, label: "Year 2 Growth Rate", description: "Annual revenue growth rate for year 2+ (decimal)" },
      starting_month_auv_pct: { value: 0, label: "Starting Month AUV %", description: "Percentage of full AUV in the opening month (decimal)" },
    },
    operating_costs: {
      cogs_pct: { value: 0, label: "COGS %", description: "Cost of goods sold as percentage of revenue (decimal)" },
      labor_pct: { value: 0, label: "Labor %", description: "Labor cost as percentage of revenue (decimal)" },
      rent_monthly: { value: 0, label: "Monthly Rent", description: "Monthly rent payment" },
      utilities_monthly: { value: 0, label: "Monthly Utilities", description: "Monthly utilities cost" },
      insurance_monthly: { value: 0, label: "Monthly Insurance", description: "Monthly insurance cost" },
      marketing_pct: { value: 0, label: "Marketing %", description: "Local marketing as percentage of revenue (decimal)" },
      royalty_pct: { value: 0, label: "Royalty %", description: "Franchise royalty as percentage of revenue (decimal)" },
      ad_fund_pct: { value: 0, label: "Ad Fund %", description: "National ad fund as percentage of revenue (decimal)" },
      other_monthly: { value: 0, label: "Other Monthly", description: "Other recurring monthly expenses" },
    },
    financing: {
      loan_amount: { value: 0, label: "Loan Amount", description: "Default loan amount" },
      interest_rate: { value: 0, label: "Interest Rate", description: "Annual interest rate (decimal, e.g. 0.07 = 7%)" },
      loan_term_months: { value: 0, label: "Loan Term (months)", description: "Loan term in months" },
      down_payment_pct: { value: 0, label: "Down Payment %", description: "Down payment as percentage of total investment (decimal)" },
    },
    startup_capital: {
      working_capital_months: { value: 0, label: "Working Capital (months)", description: "Number of months of working capital reserve" },
      depreciation_years: { value: 0, label: "Depreciation (years)", description: "CapEx depreciation period in years" },
    },
  };
}

function FinancialParametersTab({ brand }: { brand: Brand }) {
  const { toast } = useToast();
  const params = brand.brandParameters || getDefaultBrandParameters();
  const [formData, setFormData] = useState<BrandParameters>(params);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const updateParams = useMutation({
    mutationFn: async (data: BrandParameters) => {
      const res = await apiRequest("PUT", `/api/brands/${brand.id}/parameters`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands", brand.id] });
      toast({ title: "Parameters saved", description: "Financial parameters have been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateField = (category: keyof BrandParameters, field: string, rawValue: string) => {
    const parsed = rawValue === "" ? NaN : parseFloat(rawValue);
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: {
          ...(prev[category] as any)[field],
          value: parsed,
        },
      },
    }));
    setValidationErrors((prev) => {
      const key = `${category}.${field}`;
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return prev;
    });
  };

  const handleSave = () => {
    const result = brandParameterSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path.length >= 3 && err.path[2] === "value") {
          const key = `${err.path[0]}.${err.path[1]}`;
          errors[key] = err.message;
        } else if (err.path.length >= 2) {
          const key = `${err.path[0]}.${err.path[1]}`;
          errors[key] = errors[key] || err.message;
        }
      });
      setValidationErrors(errors);
      toast({ title: "Validation failed", description: "Please correct the highlighted fields before saving.", variant: "destructive" });
      return;
    }
    setValidationErrors({});
    updateParams.mutate(result.data);
  };

  const renderParameterCategory = (
    category: keyof BrandParameters,
    title: string,
    fields: Record<string, { value: number; label: string; description: string }>
  ) => (
    <Card key={category}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(fields).map(([key, field]) => {
          const errorKey = `${category}.${key}`;
          const error = validationErrors[errorKey];
          return (
            <div key={key} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
              <div className="sm:col-span-1">
                <Label htmlFor={`param-${category}-${key}`} className="text-sm font-medium">{field.label}</Label>
                <p className="text-xs text-muted-foreground mt-0.5">{field.description}</p>
              </div>
              <div className="sm:col-span-2">
                <Input
                  id={`param-${category}-${key}`}
                  type="number"
                  step="any"
                  value={isNaN(field.value) ? "" : field.value}
                  onChange={(e) => updateField(category, key, e.target.value)}
                  className={error ? "border-destructive" : ""}
                  data-testid={`input-param-${category}-${key}`}
                />
                {error && (
                  <p className="text-xs text-destructive mt-1" data-testid={`error-param-${category}-${key}`}>{error}</p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Financial Parameters</h2>
          <p className="text-sm text-muted-foreground">Configure the default seed values for this brand's financial engine</p>
        </div>
        <Button onClick={handleSave} disabled={updateParams.isPending} data-testid="button-save-parameters">
          <Save className="h-4 w-4 mr-2" />
          {updateParams.isPending ? "Saving..." : "Save Parameters"}
        </Button>
      </div>

      {renderParameterCategory("revenue", "Revenue", formData.revenue)}
      {renderParameterCategory("operating_costs", "Operating Costs", formData.operating_costs)}
      {renderParameterCategory("financing", "Financing", formData.financing)}
      {renderParameterCategory("startup_capital", "Startup & Capital", formData.startup_capital)}
    </div>
  );
}

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

function StartupCostTemplateTab({ brand }: { brand: Brand }) {
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

function isValidHex(color: string): boolean {
  return /^#([a-f\d]{3}|[a-f\d]{6})$/i.test(color);
}

function normalizeHexForPicker(color: string): string {
  if (/^#[a-f\d]{6}$/i.test(color)) return color;
  if (/^#[a-f\d]{3}$/i.test(color)) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  }
  return "#2563eb";
}

function BrandIdentityTab({ brand }: { brand: Brand }) {
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(brand.displayName || "");
  const [logoUrl, setLogoUrl] = useState(brand.logoUrl || "");
  const [primaryColor, setPrimaryColor] = useState(brand.primaryColor || "#2563eb");
  const [defaultBookingUrl, setDefaultBookingUrl] = useState(brand.defaultBookingUrl || "");
  const [franchisorAck, setFranchisorAck] = useState(brand.franchisorAcknowledgmentEnabled);
  const [colorError, setColorError] = useState("");

  const handleColorTextChange = (value: string) => {
    setPrimaryColor(value);
    if (value && !isValidHex(value)) {
      setColorError("Enter a valid hex color (e.g., #1E3A8A)");
    } else {
      setColorError("");
    }
  };

  const handleColorPickerChange = (value: string) => {
    setPrimaryColor(value);
    setColorError("");
  };

  const handleSave = () => {
    if (primaryColor && !isValidHex(primaryColor)) {
      setColorError("Enter a valid hex color (e.g., #1E3A8A)");
      return;
    }
    updateIdentity.mutate();
  };

  const updateIdentity = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PUT", `/api/brands/${brand.id}/identity`, {
        display_name: displayName || null,
        logo_url: logoUrl || null,
        primary_color: primaryColor || null,
        default_booking_url: defaultBookingUrl || null,
        franchisor_acknowledgment_enabled: franchisorAck,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands", brand.id] });
      toast({ title: "Identity saved", description: "Brand identity has been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Brand Identity</h2>
          <p className="text-sm text-muted-foreground">Configure the visual identity and settings for this brand</p>
        </div>
        <Button onClick={handleSave} disabled={updateIdentity.isPending || !!colorError} data-testid="button-save-identity">
          <Save className="h-4 w-4 mr-2" />
          {updateIdentity.isPending ? "Saving..." : "Save Identity"}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Visual Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identity-display-name">Display Name</Label>
            <Input
              id="identity-display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., PostNet Franchise"
              data-testid="input-identity-display-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="identity-logo-url">Logo URL</Label>
            <Input
              id="identity-logo-url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              data-testid="input-identity-logo-url"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="identity-primary-color">Primary Accent Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="identity-primary-color"
                value={normalizeHexForPicker(primaryColor)}
                onChange={(e) => handleColorPickerChange(e.target.value)}
                className="h-9 w-12 rounded-md border cursor-pointer"
                data-testid="input-identity-primary-color"
              />
              <Input
                value={primaryColor}
                onChange={(e) => handleColorTextChange(e.target.value)}
                placeholder="#2563eb"
                className={`flex-1 ${colorError ? "border-destructive" : ""}`}
                data-testid="input-identity-primary-color-hex"
              />
              <div
                className="h-9 w-9 rounded-md border shrink-0"
                style={{ backgroundColor: isValidHex(primaryColor) ? primaryColor : "#ccc" }}
                data-testid="swatch-primary-color"
              />
            </div>
            {colorError ? (
              <p className="text-xs text-destructive" data-testid="text-color-error">{colorError}</p>
            ) : (
              <p className="text-xs text-muted-foreground">This overrides the --primary CSS variable for franchisees of this brand</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Brand Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identity-booking-url">Default Booking URL</Label>
            <Input
              id="identity-booking-url"
              value={defaultBookingUrl}
              onChange={(e) => setDefaultBookingUrl(e.target.value)}
              placeholder="https://calendly.com/your-team"
              data-testid="input-identity-booking-url"
            />
            <p className="text-xs text-muted-foreground">Fallback booking URL when no specific account manager is assigned</p>
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label>Franchisor Acknowledgment</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Allow franchisor to review and acknowledge franchisee plans</p>
            </div>
            <Switch
              checked={franchisorAck}
              onCheckedChange={setFranchisorAck}
              data-testid="switch-franchisor-ack"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type AccountManager = {
  id: string;
  email: string;
  displayName: string | null;
  profileImageUrl: string | null;
};

type BrandAccountManagerRow = {
  id: string;
  brandId: string;
  accountManagerId: string;
  bookingUrl: string | null;
  createdAt: string;
};

type FranchiseeRow = {
  id: string;
  email: string;
  displayName: string | null;
  accountManagerId: string | null;
  bookingUrl: string | null;
};

function AccountManagerTab({ brand }: { brand: Brand }) {
  const { toast } = useToast();

  const { data: allAdmins, isLoading: adminsLoading } = useQuery<AccountManager[]>({
    queryKey: ["/api/admin/account-managers"],
  });

  const { data: brandManagers, isLoading: brandManagersLoading } = useQuery<BrandAccountManagerRow[]>({
    queryKey: ["/api/brands", brand.id, "account-managers"],
  });

  const { data: franchisees, isLoading: franchiseesLoading } = useQuery<FranchiseeRow[]>({
    queryKey: ["/api/brands", brand.id, "franchisees"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const [addManagerId, setAddManagerId] = useState("");
  const [addBookingUrl, setAddBookingUrl] = useState("");
  const [addBookingUrlError, setAddBookingUrlError] = useState("");
  const [editingBrandManager, setEditingBrandManager] = useState<string | null>(null);
  const [editBrandBookingUrl, setEditBrandBookingUrl] = useState("");
  const [editBrandBookingUrlError, setEditBrandBookingUrlError] = useState("");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [overrideManagerId, setOverrideManagerId] = useState("");
  const [overrideBookingUrl, setOverrideBookingUrl] = useState("");
  const [overrideBookingUrlError, setOverrideBookingUrlError] = useState("");

  const adminMap = new Map((allAdmins || []).map((m) => [m.id, m]));
  const brandManagerMap = new Map((brandManagers || []).map((bm) => [bm.accountManagerId, bm]));

  function resolveAdminName(id: string | null): string {
    if (!id) return "Unassigned";
    const admin = adminMap.get(id);
    if (!admin) return "Unknown";
    return admin.displayName || admin.email;
  }

  function validateUrl(url: string): boolean {
    if (!url) return true;
    try { new URL(url); return true; } catch { return false; }
  }

  const availableToAdd = (allAdmins || []).filter(
    (a) => !brandManagerMap.has(a.id)
  );

  const upsertBrandManager = useMutation({
    mutationFn: async ({ account_manager_id, booking_url }: { account_manager_id: string; booking_url: string | null }) => {
      const res = await apiRequest("PUT", `/api/brands/${brand.id}/account-managers`, { account_manager_id, booking_url });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands", brand.id, "account-managers"] });
      toast({ title: "Account manager updated", description: "Brand account manager configuration saved." });
      setAddManagerId("");
      setAddBookingUrl("");
      setAddBookingUrlError("");
      setEditingBrandManager(null);
      setEditBrandBookingUrl("");
      setEditBrandBookingUrlError("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const removeBrandManager = useMutation({
    mutationFn: async (managerId: string) => {
      const res = await apiRequest("DELETE", `/api/brands/${brand.id}/account-managers/${managerId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands", brand.id, "account-managers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/brands", brand.id] });
      toast({ title: "Manager removed", description: "Account manager removed from this brand." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const setDefaultManager = useMutation({
    mutationFn: async (accountManagerId: string | null) => {
      const res = await apiRequest("PUT", `/api/brands/${brand.id}/default-account-manager`, { account_manager_id: accountManagerId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands", brand.id] });
      toast({ title: "Default manager updated", description: "New franchisees will be auto-assigned to this manager." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const assignFranchiseeManager = useMutation({
    mutationFn: async ({ userId, account_manager_id, booking_url }: { userId: string; account_manager_id: string; booking_url: string }) => {
      const res = await apiRequest("PUT", `/api/users/${userId}/account-manager`, { account_manager_id, booking_url });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands", brand.id, "franchisees"] });
      toast({ title: "Account manager assigned", description: "Franchisee account manager has been updated." });
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  function openFranchiseeEditDialog(f: FranchiseeRow) {
    setEditingUser(f.id);
    setOverrideManagerId(f.accountManagerId || "");
    const managerBrandUrl = f.accountManagerId ? brandManagerMap.get(f.accountManagerId)?.bookingUrl : null;
    setOverrideBookingUrl(f.bookingUrl || managerBrandUrl || brand.defaultBookingUrl || "");
    setOverrideBookingUrlError("");
  }

  const isLoading = adminsLoading || brandManagersLoading || franchiseesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card><CardContent className="p-4 space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
        <Skeleton className="h-8 w-64" />
        <Card><CardContent className="p-4 space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold" data-testid="text-account-manager-heading">Brand Account Managers</h2>
        <p className="text-sm text-muted-foreground">Configure which account managers work with this brand and their booking URLs</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          {(brandManagers || []).length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Manager</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Booking URL</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(brandManagers || []).map((bm) => {
                  const admin = adminMap.get(bm.accountManagerId);
                  const isDefault = brand.defaultAccountManagerId === bm.accountManagerId;
                  return (
                    <TableRow key={bm.id} data-testid={`row-brand-manager-${bm.accountManagerId}`}>
                      <TableCell className="font-medium" data-testid={`text-brand-manager-name-${bm.accountManagerId}`}>
                        {admin?.displayName || "Unknown"}
                      </TableCell>
                      <TableCell>{admin?.email || "—"}</TableCell>
                      <TableCell>
                        {editingBrandManager === bm.accountManagerId ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editBrandBookingUrl}
                              onChange={(e) => {
                                setEditBrandBookingUrl(e.target.value);
                                setEditBrandBookingUrlError(e.target.value && !validateUrl(e.target.value) ? "Invalid URL" : "");
                              }}
                              placeholder="https://calendly.com/manager"
                              className="max-w-[280px]"
                              data-testid="input-edit-brand-booking-url"
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Save booking URL"
                              disabled={!!editBrandBookingUrlError || upsertBrandManager.isPending}
                              onClick={() => upsertBrandManager.mutate({ account_manager_id: bm.accountManagerId, booking_url: editBrandBookingUrl || null })}
                              data-testid="button-save-brand-booking-url"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" aria-label="Cancel edit" onClick={() => setEditingBrandManager(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span
                            className={bm.bookingUrl ? "text-sm" : "text-muted-foreground text-sm"}
                            data-testid={`text-brand-booking-url-${bm.accountManagerId}`}
                          >
                            {bm.bookingUrl || "Not set"}
                          </span>
                        )}
                        {editBrandBookingUrlError && editingBrandManager === bm.accountManagerId && (
                          <p className="text-sm text-destructive mt-1">{editBrandBookingUrlError}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        {isDefault ? (
                          <Badge variant="secondary" data-testid={`badge-default-manager-${bm.accountManagerId}`}>
                            <Star className="h-3 w-3 mr-1" />Default
                          </Badge>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDefaultManager.mutate(bm.accountManagerId)}
                            disabled={setDefaultManager.isPending}
                            data-testid={`button-set-default-${bm.accountManagerId}`}
                          >
                            Set as Default
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Edit booking URL"
                            onClick={() => {
                              setEditingBrandManager(bm.accountManagerId);
                              setEditBrandBookingUrl(bm.bookingUrl || "");
                              setEditBrandBookingUrlError("");
                            }}
                            data-testid={`button-edit-brand-manager-${bm.accountManagerId}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Remove manager"
                            onClick={() => removeBrandManager.mutate(bm.accountManagerId)}
                            disabled={removeBrandManager.isPending}
                            data-testid={`button-remove-brand-manager-${bm.accountManagerId}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {(brandManagers || []).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4" data-testid="text-no-brand-managers">
              No account managers configured for this brand yet
            </p>
          )}

          <Separator />

          <div className="space-y-2">
            <Label className="text-sm font-medium">Add Account Manager</Label>
            <div className="flex items-end gap-3 flex-wrap">
              <div className="space-y-1 flex-1 min-w-[200px]">
                <Select value={addManagerId} onValueChange={setAddManagerId} data-testid="select-add-brand-manager">
                  <SelectTrigger data-testid="select-add-brand-manager-trigger">
                    <SelectValue placeholder="Select an admin to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableToAdd.map((a) => (
                      <SelectItem key={a.id} value={a.id} data-testid={`select-add-manager-option-${a.id}`}>
                        {a.displayName ? `${a.displayName} (${a.email})` : a.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 flex-1 min-w-[200px]">
                <Input
                  value={addBookingUrl}
                  onChange={(e) => {
                    setAddBookingUrl(e.target.value);
                    setAddBookingUrlError(e.target.value && !validateUrl(e.target.value) ? "Invalid URL" : "");
                  }}
                  placeholder="Booking URL (optional)"
                  data-testid="input-add-brand-booking-url"
                />
                {addBookingUrlError && <p className="text-sm text-destructive">{addBookingUrlError}</p>}
              </div>
              <Button
                onClick={() => addManagerId && upsertBrandManager.mutate({ account_manager_id: addManagerId, booking_url: addBookingUrl || null })}
                disabled={!addManagerId || !!addBookingUrlError || upsertBrandManager.isPending}
                data-testid="button-add-brand-manager"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <h2 className="text-lg font-semibold">Franchisee Assignments</h2>
        <p className="text-sm text-muted-foreground">
          New franchisees are auto-assigned the brand's default manager. Override individual assignments below.
        </p>
      </div>

      {!franchisees?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground" data-testid="text-no-franchisees">No franchisees for this brand yet</p>
            <p className="text-sm text-muted-foreground mt-1">Invite franchisees to this brand to assign account managers</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Franchisee</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Account Manager</TableHead>
                <TableHead>Booking URL</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {franchisees.map((f) => (
                <TableRow key={f.id} data-testid={`row-franchisee-${f.id}`}>
                  <TableCell className="font-medium">{f.displayName || "—"}</TableCell>
                  <TableCell>{f.email}</TableCell>
                  <TableCell data-testid={`text-manager-name-${f.id}`}>
                    {f.accountManagerId ? (
                      <span>{resolveAdminName(f.accountManagerId)}</span>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="truncate max-w-[200px]">
                    {f.bookingUrl ? (
                      <a href={f.bookingUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline" data-testid={`link-booking-url-${f.id}`}>
                        {f.bookingUrl}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Edit account manager"
                      onClick={() => openFranchiseeEditDialog(f)}
                      data-testid={`button-assign-manager-${f.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={!!editingUser} onOpenChange={(open) => { if (!open) setEditingUser(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override Account Manager</DialogTitle>
            <DialogDescription>Change the account manager or booking URL for this franchisee.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Account Manager</Label>
              <Select value={overrideManagerId} onValueChange={(val) => {
                setOverrideManagerId(val);
                const managerBrandUrl = brandManagerMap.get(val)?.bookingUrl;
                if (managerBrandUrl) {
                  setOverrideBookingUrl(managerBrandUrl);
                  setOverrideBookingUrlError("");
                }
              }} data-testid="select-override-manager">
                <SelectTrigger data-testid="select-manager-trigger">
                  <SelectValue placeholder="Select an account manager" />
                </SelectTrigger>
                <SelectContent>
                  {(allAdmins || []).map((m) => (
                    <SelectItem key={m.id} value={m.id} data-testid={`select-manager-option-${m.id}`}>
                      {m.displayName ? `${m.displayName} (${m.email})` : m.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Booking URL</Label>
              <Input
                value={overrideBookingUrl}
                onChange={(e) => {
                  setOverrideBookingUrl(e.target.value);
                  setOverrideBookingUrlError(e.target.value && !validateUrl(e.target.value) ? "Must be a valid URL (e.g. https://calendly.com/manager)" : "");
                }}
                placeholder="https://calendly.com/manager"
                data-testid="input-manager-booking-url"
              />
              {overrideBookingUrlError && (
                <p className="text-sm text-destructive" data-testid="text-booking-url-error">{overrideBookingUrlError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)} data-testid="button-cancel-manager">Cancel</Button>
            <Button
              onClick={() => editingUser && assignFranchiseeManager.mutate({ userId: editingUser, account_manager_id: overrideManagerId, booking_url: overrideBookingUrl })}
              disabled={!overrideManagerId || !overrideBookingUrl || !!overrideBookingUrlError || assignFranchiseeManager.isPending}
              data-testid="button-save-manager"
            >
              {assignFranchiseeManager.isPending ? "Saving..." : "Save Override"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminBrandDetailPage() {
  const params = useParams<{ brandId: string }>();
  const [, setLocation] = useLocation();

  const { data: brand, isLoading, error } = useQuery<Brand>({
    queryKey: ["/api/brands", params.brandId],
    queryFn: async () => {
      const res = await fetch(`/api/brands/${params.brandId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Brand not found");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => setLocation("/admin/brands")} data-testid="button-back-to-brands">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Brands
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive font-medium">Brand not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/brands")} data-testid="button-back-to-brands">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-brand-detail-title">{brand.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">{brand.slug}</Badge>
            {brand.displayName && brand.displayName !== brand.name && (
              <span className="text-sm text-muted-foreground">{brand.displayName}</span>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="parameters">
        <TabsList data-testid="tabs-brand-sections">
          <TabsTrigger value="parameters" data-testid="tab-parameters">Financial Parameters</TabsTrigger>
          <TabsTrigger value="startup-costs" data-testid="tab-startup-costs">Startup Costs</TabsTrigger>
          <TabsTrigger value="identity" data-testid="tab-identity">Brand Identity</TabsTrigger>
          <TabsTrigger value="account-manager" data-testid="tab-account-manager">Account Managers</TabsTrigger>
        </TabsList>

        <TabsContent value="parameters" className="mt-4">
          <FinancialParametersTab brand={brand} />
        </TabsContent>
        <TabsContent value="startup-costs" className="mt-4">
          <StartupCostTemplateTab brand={brand} />
        </TabsContent>
        <TabsContent value="identity" className="mt-4">
          <BrandIdentityTab brand={brand} />
        </TabsContent>
        <TabsContent value="account-manager" className="mt-4">
          <AccountManagerTab brand={brand} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
