import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Brand, BrandParameters } from "@shared/schema";
import { brandParameterSchema } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

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

export function FinancialParametersTab({ brand }: { brand: Brand }) {
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
