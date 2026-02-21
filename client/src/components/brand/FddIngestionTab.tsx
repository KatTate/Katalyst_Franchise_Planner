import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Brand, FddIngestionRun, FddExtractionResult, BrandParameters, StartupCostTemplate } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  RotateCw,
} from "lucide-react";

// All fields expected in each BrandParameters category, for showing "Not found" labels
const ALL_PARAMETER_FIELDS: Record<string, Array<{ field: string; label: string; isPercentage: boolean }>> = {
  revenue: [
    { field: "monthly_auv", label: "Monthly AUV", isPercentage: false },
    { field: "year1_growth_rate", label: "Year 1 Growth Rate", isPercentage: true },
    { field: "year2_growth_rate", label: "Year 2 Growth Rate", isPercentage: true },
    { field: "starting_month_auv_pct", label: "Starting Month AUV %", isPercentage: true },
  ],
  operating_costs: [
    { field: "cogs_pct", label: "COGS %", isPercentage: true },
    { field: "labor_pct", label: "Labor %", isPercentage: true },
    { field: "rent_monthly", label: "Monthly Rent", isPercentage: false },
    { field: "utilities_monthly", label: "Monthly Utilities", isPercentage: false },
    { field: "insurance_monthly", label: "Monthly Insurance", isPercentage: false },
    { field: "marketing_pct", label: "Marketing %", isPercentage: true },
    { field: "royalty_pct", label: "Royalty %", isPercentage: true },
    { field: "ad_fund_pct", label: "Ad Fund %", isPercentage: true },
    { field: "other_monthly", label: "Other Monthly", isPercentage: false },
  ],
  financing: [
    { field: "loan_amount", label: "Loan Amount", isPercentage: false },
    { field: "interest_rate", label: "Interest Rate", isPercentage: true },
    { field: "loan_term_months", label: "Loan Term (months)", isPercentage: false },
    { field: "down_payment_pct", label: "Down Payment %", isPercentage: true },
  ],
  startup_capital: [
    { field: "working_capital_months", label: "Working Capital (months)", isPercentage: false },
    { field: "depreciation_years", label: "Depreciation (years)", isPercentage: false },
  ],
};

function formatCurrency(dollars: number): string {
  return `$${dollars.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function ConfidenceBadge({ level }: { level: "high" | "medium" | "low" }) {
  const variants: Record<string, { className: string; label: string }> = {
    high: { className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", label: "High" },
    medium: { className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", label: "Medium" },
    low: { className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", label: "Low" },
  };
  const v = variants[level] || variants.medium;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${v.className}`} data-testid={`badge-confidence-${level}`}>
      {v.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    processing: { variant: "secondary", label: "Processing" },
    completed: { variant: "default", label: "Completed" },
    failed: { variant: "destructive", label: "Failed" },
    applied_parameters: { variant: "outline", label: "Parameters Applied" },
    applied_startup_costs: { variant: "outline", label: "Startup Costs Applied" },
    applied_both: { variant: "default", label: "Fully Applied" },
  };
  const c = config[status] || { variant: "secondary" as const, label: status };
  return <Badge variant={c.variant} data-testid={`badge-status-${status}`}>{c.label}</Badge>;
}

interface ParameterFieldProps {
  category: string;
  field: string;
  extracted: { value: number; label: string; description: string };
  existing: { value: number; label: string; description: string } | null;
  confidence: string | undefined;
  onValueChange: (category: string, field: string, value: number) => void;
}

function ParameterField({ category, field, extracted, existing, confidence, onValueChange }: ParameterFieldProps) {
  const isPercentage = field.includes("pct") || field.includes("rate") || field.includes("growth");
  const displayValue = isPercentage ? (extracted.value * 100).toFixed(2) : extracted.value.toString();
  const existingDisplay = existing
    ? (isPercentage ? `${(existing.value * 100).toFixed(2)}%` : formatCurrency(existing.value))
    : null;

  return (
    <div className="flex items-center gap-3 py-2 border-b last:border-0" data-testid={`field-${category}-${field}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{extracted.label}</span>
          {confidence && <ConfidenceBadge level={confidence as "high" | "medium" | "low"} />}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{extracted.description}</p>
      </div>
      {existingDisplay && (
        <div className="text-right shrink-0">
          <span className="text-xs text-muted-foreground">Current</span>
          <p className="text-sm">{existingDisplay}</p>
        </div>
      )}
      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="w-32 shrink-0">
        <Input
          type="number"
          step={isPercentage ? "0.01" : "1"}
          value={displayValue}
          onChange={(e) => {
            const raw = parseFloat(e.target.value);
            if (!isNaN(raw)) {
              onValueChange(category, field, isPercentage ? raw / 100 : raw);
            }
          }}
          className="text-right text-sm"
          data-testid={`input-${category}-${field}`}
        />
        <span className="text-xs text-muted-foreground">{isPercentage ? "%" : "$"}</span>
      </div>
    </div>
  );
}

export function FddIngestionTab({ brand }: { brand: Brand }) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<FddExtractionResult | null>(null);

  const { data: runs, isLoading: runsLoading } = useQuery<FddIngestionRun[]>({
    queryKey: ["/api/brands", brand.id, "fdd-ingestion", "runs"],
  });

  // Note: Uses raw fetch instead of apiRequest because apiRequest sets Content-Type: application/json,
  // which is incompatible with FormData uploads. The browser must set the multipart boundary automatically.
  const extractMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/brands/${brand.id}/fdd-ingestion/extract`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Upload failed" }));
        throw new Error(err.message || "Upload failed");
      }
      return res.json();
    },
    onSuccess: (data: FddIngestionRun) => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands", brand.id, "fdd-ingestion", "runs"] });
      setSelectedFile(null);
      setExpandedRunId(data.id);
      if (data.extractedData) {
        setEditedData(JSON.parse(JSON.stringify(data.extractedData)));
      }
      toast({ title: "Extraction complete", description: "Review the extracted data below." });
    },
    onError: (error: Error) => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands", brand.id, "fdd-ingestion", "runs"] });
      toast({ title: "Extraction failed", description: error.message, variant: "destructive" });
    },
  });

  const retryMutation = useMutation({
    mutationFn: async (runId: string) => {
      const res = await apiRequest("POST", `/api/brands/${brand.id}/fdd-ingestion/${runId}/retry`);
      return res.json();
    },
    onSuccess: (data: FddIngestionRun) => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands", brand.id, "fdd-ingestion", "runs"] });
      setExpandedRunId(data.id);
      if (data.extractedData) {
        setEditedData(JSON.parse(JSON.stringify(data.extractedData)));
      }
      toast({ title: "Retry successful", description: "Extraction completed. Review the extracted data below." });
    },
    onError: (error: Error) => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands", brand.id, "fdd-ingestion", "runs"] });
      toast({ title: "Retry failed", description: error.message, variant: "destructive" });
    },
  });

  const applyParametersMutation = useMutation({
    mutationFn: async ({ runId, parameters }: { runId: string; parameters: Partial<BrandParameters> }) => {
      const res = await apiRequest("POST", `/api/brands/${brand.id}/fdd-ingestion/${runId}/apply-parameters`, { parameters });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands", brand.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/brands", brand.id, "fdd-ingestion", "runs"] });
      toast({ title: "Parameters applied", description: "Financial parameters have been updated from FDD data." });
    },
    onError: (error: Error) => {
      toast({ title: "Apply failed", description: error.message, variant: "destructive" });
    },
  });

  const applyStartupCostsMutation = useMutation({
    mutationFn: async ({ runId, startupCosts }: { runId: string; startupCosts: StartupCostTemplate }) => {
      const res = await apiRequest("POST", `/api/brands/${brand.id}/fdd-ingestion/${runId}/apply-startup-costs`, { startupCosts });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands", brand.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/brands", brand.id, "fdd-ingestion", "runs"] });
      toast({ title: "Startup costs applied", description: "Startup cost template has been updated from FDD data." });
    },
    onError: (error: Error) => {
      toast({ title: "Apply failed", description: error.message, variant: "destructive" });
    },
  });

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast({ title: "Invalid file", description: "Please select a PDF file.", variant: "destructive" });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 20MB.", variant: "destructive" });
      return;
    }
    setSelectedFile(file);
  }, [toast]);

  const handleUpload = useCallback(() => {
    if (selectedFile) {
      extractMutation.mutate(selectedFile);
    }
  }, [selectedFile, extractMutation]);

  const handleExpandRun = useCallback((run: FddIngestionRun) => {
    if (expandedRunId === run.id) {
      setExpandedRunId(null);
      setEditedData(null);
    } else {
      setExpandedRunId(run.id);
      if (run.extractedData) {
        setEditedData(JSON.parse(JSON.stringify(run.extractedData)));
      }
    }
  }, [expandedRunId]);

  const handleParameterValueChange = useCallback((category: string, field: string, value: number) => {
    setEditedData((prev) => {
      if (!prev) return prev;
      const updated = JSON.parse(JSON.stringify(prev)) as FddExtractionResult;
      if (!(updated.parameters as any)[category]) {
        (updated.parameters as any)[category] = {};
      }
      if (!(updated.parameters as any)[category][field]) {
        (updated.parameters as any)[category][field] = { value: 0, label: field, description: "" };
      }
      (updated.parameters as any)[category][field].value = value;
      return updated;
    });
  }, []);

  const handleStartupCostChange = useCallback((index: number, field: string, value: string | number) => {
    setEditedData((prev) => {
      if (!prev) return prev;
      const updated = JSON.parse(JSON.stringify(prev)) as FddExtractionResult;
      if (updated.startupCosts && updated.startupCosts[index]) {
        (updated.startupCosts[index] as any)[field] = value;
      }
      return updated;
    });
  }, []);

  const renderParameterReview = (extractedData: FddExtractionResult) => {
    const categories: Array<{ key: keyof BrandParameters; label: string }> = [
      { key: "revenue", label: "Revenue" },
      { key: "operating_costs", label: "Operating Costs" },
      { key: "financing", label: "Financing" },
      { key: "startup_capital", label: "Startup Capital" },
    ];

    const data = editedData || extractedData;
    const existingParams = brand.brandParameters;

    return (
      <div className="space-y-4">
        {categories.map(({ key, label }) => {
          const categoryData = (data.parameters as any)?.[key];
          const allFields = ALL_PARAMETER_FIELDS[key] || [];

          return (
            <Card key={key}>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">{label}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                {allFields.map(({ field, label: fieldLabel, isPercentage }) => {
                  const fieldData = categoryData?.[field];
                  const existingField = existingParams ? (existingParams[key] as any)?.[field] || null : null;

                  if (fieldData) {
                    return (
                      <ParameterField
                        key={field}
                        category={key}
                        field={field}
                        extracted={fieldData}
                        existing={existingField}
                        confidence={data.confidence[`${key}.${field}`]}
                        onValueChange={handleParameterValueChange}
                      />
                    );
                  }

                  const existingDisplay = existingField
                    ? (isPercentage ? `${(existingField.value * 100).toFixed(2)}%` : formatCurrency(existingField.value))
                    : null;
                  const retainLabel = existingField
                    ? "Not found — will retain current value"
                    : "Not found — will use default";

                  return (
                    <div key={field} className="flex items-center gap-3 py-2 border-b last:border-0 opacity-60" data-testid={`field-${key}-${field}-not-found`}>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">{fieldLabel}</span>
                        <p className="text-xs text-muted-foreground mt-0.5 italic">{retainLabel}</p>
                      </div>
                      {existingDisplay && (
                        <div className="text-right shrink-0">
                          <span className="text-xs text-muted-foreground">Current</span>
                          <p className="text-sm">{existingDisplay}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderStartupCostReview = (extractedData: FddExtractionResult) => {
    const data = editedData || extractedData;
    const costs = data.startupCosts;

    if (!costs || costs.length === 0) {
      return <p className="text-sm text-muted-foreground text-center py-4">No startup costs were extracted from this document.</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2 font-medium">Line Item</th>
              <th className="text-right py-2 px-2 font-medium">Amount</th>
              <th className="text-center py-2 px-2 font-medium">Type</th>
              <th className="text-right py-2 px-2 font-medium">Item 7 Low</th>
              <th className="text-right py-2 px-2 font-medium">Item 7 High</th>
            </tr>
          </thead>
          <tbody>
            {costs.map((cost, idx) => (
              <tr key={cost.id || idx} className="border-b last:border-0" data-testid={`row-startup-cost-${idx}`}>
                <td className="py-2 px-2">
                  <Input
                    value={cost.name}
                    onChange={(e) => handleStartupCostChange(idx, "name", e.target.value)}
                    className="text-sm h-8"
                    data-testid={`input-startup-cost-name-${idx}`}
                  />
                </td>
                <td className="text-right py-2 px-2">
                  <Input
                    type="number"
                    value={cost.default_amount}
                    onChange={(e) => handleStartupCostChange(idx, "default_amount", parseFloat(e.target.value) || 0)}
                    className="text-sm text-right h-8 w-28"
                    data-testid={`input-startup-cost-amount-${idx}`}
                  />
                </td>
                <td className="text-center py-2 px-2">
                  <select
                    value={cost.capex_classification}
                    onChange={(e) => handleStartupCostChange(idx, "capex_classification", e.target.value)}
                    className="text-xs border rounded px-1 py-1 bg-background"
                    data-testid={`select-startup-cost-type-${idx}`}
                  >
                    <option value="capex">CapEx</option>
                    <option value="non_capex">Non-CapEx</option>
                    <option value="working_capital">Working Capital</option>
                  </select>
                </td>
                <td className="text-right py-2 px-2 text-muted-foreground">
                  {cost.item7_range_low !== null ? formatCurrency(cost.item7_range_low) : "—"}
                </td>
                <td className="text-right py-2 px-2 text-muted-foreground">
                  {cost.item7_range_high !== null ? formatCurrency(cost.item7_range_high) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t font-medium">
              <td className="py-2 px-2">Total</td>
              <td className="text-right py-2 px-2">
                {formatCurrency(costs.reduce((sum, c) => sum + c.default_amount, 0))}
              </td>
              <td colSpan={3}></td>
            </tr>
          </tfoot>
        </table>
        {data.confidence.startupCosts && (
          <div className="mt-2">
            <ConfidenceBadge level={data.confidence.startupCosts as "high" | "medium" | "low"} />
            <span className="text-xs text-muted-foreground ml-2">Startup cost extraction confidence</span>
          </div>
        )}
      </div>
    );
  };

  const renderExtractionNotes = (notes: string[]) => {
    if (!notes || notes.length === 0) return null;
    return (
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Extraction Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <ul className="space-y-1">
            {notes.map((note, idx) => (
              <li key={idx} className="text-sm text-muted-foreground">• {note}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6" data-testid="fdd-ingestion-tab">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            FDD Document Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-6 text-center" data-testid="upload-area">
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
              Upload a Franchise Disclosure Document (FDD) PDF to extract financial parameters and startup costs.
            </p>
            <div className="flex items-center justify-center gap-3">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="input-file-upload"
                />
                <span className="inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium hover:bg-accent transition-colors">
                  Choose PDF
                </span>
              </label>
              {selectedFile && (
                <div className="flex items-center gap-2">
                  <span className="text-sm" data-testid="text-selected-file">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground">({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                </div>
              )}
            </div>
            {selectedFile && (
              <Button
                className="mt-4"
                onClick={handleUpload}
                disabled={extractMutation.isPending}
                data-testid="button-extract"
              >
                {extractMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Extracting data from FDD...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload & Extract
                  </>
                )}
              </Button>
            )}
            <p className="text-xs text-muted-foreground mt-3">Maximum file size: 20MB. PDF format only.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ingestion History</CardTitle>
        </CardHeader>
        <CardContent>
          {runsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : !runs || runs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6" data-testid="text-no-runs">
              No FDD documents have been processed for this brand yet.
            </p>
          ) : (
            <div className="space-y-2">
              {runs.map((run) => (
                <div key={run.id} className="border rounded-lg" data-testid={`ingestion-run-${run.id}`}>
                  <button
                    onClick={() => handleExpandRun(run)}
                    className="w-full flex items-center justify-between p-3 hover:bg-accent/50 transition-colors text-left"
                    data-testid={`button-expand-run-${run.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-sm font-medium">{run.filename}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {new Date(run.runAt).toLocaleDateString()} {new Date(run.runAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={run.status} />
                      {expandedRunId === run.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </button>

                  {expandedRunId === run.id && run.extractedData && (
                    <div className="border-t p-4 space-y-6">
                      <div>
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          Financial Parameters
                          {!run.status.includes("applied_parameters") && run.status !== "applied_both" && (
                            <Badge variant="outline" className="text-xs">Not yet applied</Badge>
                          )}
                        </h3>
                        {renderParameterReview(run.extractedData)}
                        {run.status === "completed" || run.status === "applied_startup_costs" ? (
                          <Button
                            className="mt-3"
                            onClick={() => applyParametersMutation.mutate({
                              runId: run.id,
                              parameters: (editedData || run.extractedData).parameters,
                            })}
                            disabled={applyParametersMutation.isPending}
                            data-testid="button-apply-parameters"
                          >
                            {applyParametersMutation.isPending ? (
                              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Applying...</>
                            ) : (
                              <><CheckCircle className="h-4 w-4 mr-2" /> Apply Financial Parameters</>
                            )}
                          </Button>
                        ) : (
                          <div className="mt-3 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <CheckCircle className="h-4 w-4" /> Parameters applied
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          Startup Cost Template
                          {!run.status.includes("applied_startup_costs") && run.status !== "applied_both" && (
                            <Badge variant="outline" className="text-xs">Not yet applied</Badge>
                          )}
                        </h3>
                        {renderStartupCostReview(run.extractedData)}
                        {run.status === "completed" || run.status === "applied_parameters" ? (
                          <Button
                            className="mt-3"
                            onClick={() => applyStartupCostsMutation.mutate({
                              runId: run.id,
                              startupCosts: (editedData || run.extractedData).startupCosts,
                            })}
                            disabled={applyStartupCostsMutation.isPending}
                            data-testid="button-apply-startup-costs"
                          >
                            {applyStartupCostsMutation.isPending ? (
                              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Applying...</>
                            ) : (
                              <><CheckCircle className="h-4 w-4 mr-2" /> Apply Startup Costs</>
                            )}
                          </Button>
                        ) : (
                          <div className="mt-3 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <CheckCircle className="h-4 w-4" /> Startup costs applied
                          </div>
                        )}
                      </div>

                      {renderExtractionNotes(run.extractedData.extractionNotes)}
                    </div>
                  )}

                  {expandedRunId === run.id && run.status === "failed" && (
                    <div className="border-t p-4">
                      <div className="flex items-center gap-2 text-destructive">
                        <XCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Extraction failed</span>
                      </div>
                      {run.errorMessage && (
                        <p className="text-sm text-muted-foreground mt-1">{run.errorMessage}</p>
                      )}
                      <Button
                        variant="outline"
                        className="mt-3"
                        onClick={() => retryMutation.mutate(run.id)}
                        disabled={retryMutation.isPending}
                        data-testid={`button-retry-${run.id}`}
                      >
                        {retryMutation.isPending ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Retrying...</>
                        ) : (
                          <><RotateCw className="h-4 w-4 mr-2" /> Retry Extraction</>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
