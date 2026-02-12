import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Brand, BrandValidationRun, ValidationMetricComparison } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle,
  XCircle,
  Upload,
  FileJson,
  Play,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Loader2,
} from "lucide-react";

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatMetricValue(value: number, metric: string): string {
  if (metric === "breakEvenMonth") return value === 0 ? "Never" : `Month ${value}`;
  if (
    metric.includes("Pct") ||
    metric.includes("Rate") ||
    metric === "fiveYearROIPct" ||
    metric === "grossProfitPct" ||
    metric === "ebitdaPct" ||
    metric === "contributionMarginPct" ||
    metric === "preTaxIncomePct"
  ) {
    return `${(value * 100).toFixed(1)}%`;
  }
  return formatCurrency(value);
}

interface ManualInputs {
  monthlyAuv: string;
  cogsPct: string;
  laborPct: string;
  loanAmount: string;
}

interface ManualExpected {
  totalStartupInvestment: string;
  fiveYearROIPct: string;
  breakEvenMonth: string;
  year1Revenue: string;
  year1PreTaxIncome: string;
}

export function BrandValidationTab({ brand }: { brand: Brand }) {
  const { toast } = useToast();
  const [inputMethod, setInputMethod] = useState<"manual" | "upload">("upload");
  const [jsonContent, setJsonContent] = useState("");
  const [jsonParseError, setJsonParseError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);

  const [manualInputs, setManualInputs] = useState<ManualInputs>({
    monthlyAuv: "",
    cogsPct: "",
    laborPct: "",
    loanAmount: "",
  });

  const [manualExpected, setManualExpected] = useState<ManualExpected>({
    totalStartupInvestment: "",
    fiveYearROIPct: "",
    breakEvenMonth: "",
    year1Revenue: "",
    year1PreTaxIncome: "",
  });

  const hasParameters = !!brand.brandParameters;
  const hasStartupCosts = !!brand.startupCostTemplate && brand.startupCostTemplate.length > 0;

  const { data: validationRuns, isLoading: historyLoading } = useQuery<BrandValidationRun[]>({
    queryKey: ["/api/brands", brand.id, "validation-runs"],
    enabled: hasParameters,
  });

  const validateMutation = useMutation({
    mutationFn: async (body: any) => {
      const res = await apiRequest("POST", `/api/brands/${brand.id}/validate`, body);
      return res.json();
    },
    onSuccess: (data) => {
      setLastResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/brands", brand.id, "validation-runs"] });
      toast({
        title: data.status === "pass" ? "Validation Passed" : "Validation Failed",
        description: `${data.comparisonResults.filter((r: any) => r.passed).length} of ${data.comparisonResults.length} metrics passed`,
        variant: data.status === "pass" ? "default" : "destructive",
      });
    },
    onError: (err: Error) => {
      toast({ title: "Validation Error", description: err.message, variant: "destructive" });
    },
  });

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setJsonContent(text);
      try {
        JSON.parse(text);
        setJsonParseError(null);
      } catch {
        setJsonParseError("Invalid JSON format");
      }
    };
    reader.readAsText(file);
  }, []);

  const handleRunValidation = () => {
    if (inputMethod === "upload") {
      if (!jsonContent.trim()) {
        toast({ title: "No fixture provided", description: "Please paste or upload a JSON test fixture", variant: "destructive" });
        return;
      }
      try {
        const fixture = JSON.parse(jsonContent);
        validateMutation.mutate({
          inputs: fixture.inputs || {},
          expectedOutputs: fixture.expectedOutputs || {},
          tolerances: fixture.tolerances,
          notes: notes || undefined,
        });
      } catch {
        setJsonParseError("Invalid JSON format");
      }
    } else {
      const inputs: any = {};
      const expectedOutputs: any = {};

      if (manualInputs.monthlyAuv) {
        inputs.revenue = { monthlyAuv: Math.round(parseFloat(manualInputs.monthlyAuv) * 100) };
      }
      if (manualInputs.cogsPct || manualInputs.laborPct) {
        inputs.operatingCosts = {};
        if (manualInputs.cogsPct) inputs.operatingCosts.cogsPct = parseFloat(manualInputs.cogsPct) / 100;
        if (manualInputs.laborPct) inputs.operatingCosts.laborPct = parseFloat(manualInputs.laborPct) / 100;
      }
      if (manualInputs.loanAmount) {
        inputs.financing = { loanAmount: Math.round(parseFloat(manualInputs.loanAmount) * 100) };
      }

      if (manualExpected.totalStartupInvestment || manualExpected.fiveYearROIPct || manualExpected.breakEvenMonth) {
        expectedOutputs.roiMetrics = {};
        if (manualExpected.totalStartupInvestment)
          expectedOutputs.roiMetrics.totalStartupInvestment = Math.round(parseFloat(manualExpected.totalStartupInvestment) * 100);
        if (manualExpected.fiveYearROIPct)
          expectedOutputs.roiMetrics.fiveYearROIPct = parseFloat(manualExpected.fiveYearROIPct) / 100;
        if (manualExpected.breakEvenMonth)
          expectedOutputs.roiMetrics.breakEvenMonth = parseInt(manualExpected.breakEvenMonth);
      }
      if (manualExpected.year1Revenue || manualExpected.year1PreTaxIncome) {
        const yearData: any = { year: 1 };
        if (manualExpected.year1Revenue) yearData.revenue = Math.round(parseFloat(manualExpected.year1Revenue) * 100);
        if (manualExpected.year1PreTaxIncome) yearData.preTaxIncome = Math.round(parseFloat(manualExpected.year1PreTaxIncome) * 100);
        expectedOutputs.annualSummaries = [yearData];
      }

      expectedOutputs.identityChecks = true;

      validateMutation.mutate({
        inputs,
        expectedOutputs,
        notes: notes || undefined,
      });
    }
  };

  if (!hasParameters) {
    return (
      <Card data-testid="validation-no-config-warning">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground text-center">
            Brand configuration must be completed before validation can run.
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => {
              const tabsList = document.querySelector('[data-testid="tabs-brand-sections"]');
              const parametersTab = tabsList?.querySelector('[data-testid="tab-parameters"]') as HTMLButtonElement;
              parametersTab?.click();
            }} data-testid="link-to-parameters">
              Configure Parameters
            </Button>
            <Button variant="outline" onClick={() => {
              const tabsList = document.querySelector('[data-testid="tabs-brand-sections"]');
              const costsTab = tabsList?.querySelector('[data-testid="tab-startup-costs"]') as HTMLButtonElement;
              costsTab?.click();
            }} data-testid="link-to-startup-costs">
              Configure Startup Costs
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Run Validation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasStartupCosts && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-muted" data-testid="validation-startup-warning">
              <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="text-sm text-muted-foreground">
                No startup cost template configured. ROI metrics may not be meaningful without startup costs.
              </p>
            </div>
          )}

          <div className="flex gap-2" data-testid="validation-method-toggle">
            <Button
              variant={inputMethod === "upload" ? "default" : "outline"}
              onClick={() => setInputMethod("upload")}
              data-testid="button-method-upload"
            >
              <FileJson className="h-4 w-4 mr-2" />
              Upload Fixture
            </Button>
            <Button
              variant={inputMethod === "manual" ? "default" : "outline"}
              onClick={() => setInputMethod("manual")}
              data-testid="button-method-manual"
            >
              Manual Entry
            </Button>
          </div>

          {inputMethod === "upload" && (
            <div className="space-y-3" data-testid="validation-upload-zone">
              <div className="border-2 border-dashed rounded-md p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">Upload a JSON test fixture or paste below</p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="fixture-upload"
                  data-testid="input-fixture-file"
                />
                <Button variant="outline" onClick={() => document.getElementById("fixture-upload")?.click()} data-testid="button-choose-file">
                  Choose File
                </Button>
              </div>
              <Textarea
                placeholder={`{\n  "inputs": { "revenue": { "monthlyAuv": 2500000 } },\n  "expectedOutputs": {\n    "roiMetrics": { "breakEvenMonth": 14 },\n    "identityChecks": true\n  }\n}`}
                value={jsonContent}
                onChange={(e) => {
                  setJsonContent(e.target.value);
                  try {
                    if (e.target.value.trim()) JSON.parse(e.target.value);
                    setJsonParseError(null);
                  } catch {
                    setJsonParseError("Invalid JSON format");
                  }
                }}
                rows={8}
                className="font-mono text-sm"
                data-testid="textarea-fixture-json"
              />
              {jsonParseError && (
                <p className="text-sm text-destructive" data-testid="text-json-error">{jsonParseError}</p>
              )}
            </div>
          )}

          {inputMethod === "manual" && (
            <div className="space-y-4" data-testid="validation-input-form">
              <div>
                <h4 className="font-medium text-sm mb-2">Test Inputs (override brand defaults, in dollars)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="manual-auv" className="text-xs">Monthly AUV ($)</Label>
                    <Input
                      id="manual-auv"
                      type="number"
                      placeholder="e.g. 25000"
                      value={manualInputs.monthlyAuv}
                      onChange={(e) => setManualInputs((p) => ({ ...p, monthlyAuv: e.target.value }))}
                      data-testid="input-manual-auv"
                    />
                  </div>
                  <div>
                    <Label htmlFor="manual-cogs" className="text-xs">COGS (%)</Label>
                    <Input
                      id="manual-cogs"
                      type="number"
                      placeholder="e.g. 28"
                      value={manualInputs.cogsPct}
                      onChange={(e) => setManualInputs((p) => ({ ...p, cogsPct: e.target.value }))}
                      data-testid="input-manual-cogs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="manual-labor" className="text-xs">Labor (%)</Label>
                    <Input
                      id="manual-labor"
                      type="number"
                      placeholder="e.g. 30"
                      value={manualInputs.laborPct}
                      onChange={(e) => setManualInputs((p) => ({ ...p, laborPct: e.target.value }))}
                      data-testid="input-manual-labor"
                    />
                  </div>
                  <div>
                    <Label htmlFor="manual-loan" className="text-xs">Loan Amount ($)</Label>
                    <Input
                      id="manual-loan"
                      type="number"
                      placeholder="e.g. 150000"
                      value={manualInputs.loanAmount}
                      onChange={(e) => setManualInputs((p) => ({ ...p, loanAmount: e.target.value }))}
                      data-testid="input-manual-loan"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2">Expected Outputs (in dollars where applicable)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="exp-investment" className="text-xs">Total Startup Investment ($)</Label>
                    <Input
                      id="exp-investment"
                      type="number"
                      placeholder="e.g. 220000"
                      value={manualExpected.totalStartupInvestment}
                      onChange={(e) => setManualExpected((p) => ({ ...p, totalStartupInvestment: e.target.value }))}
                      data-testid="input-expected-investment"
                    />
                  </div>
                  <div>
                    <Label htmlFor="exp-roi" className="text-xs">5-Year ROI (%)</Label>
                    <Input
                      id="exp-roi"
                      type="number"
                      placeholder="e.g. 14.2"
                      value={manualExpected.fiveYearROIPct}
                      onChange={(e) => setManualExpected((p) => ({ ...p, fiveYearROIPct: e.target.value }))}
                      data-testid="input-expected-roi"
                    />
                  </div>
                  <div>
                    <Label htmlFor="exp-breakeven" className="text-xs">Break-Even Month</Label>
                    <Input
                      id="exp-breakeven"
                      type="number"
                      placeholder="e.g. 14"
                      value={manualExpected.breakEvenMonth}
                      onChange={(e) => setManualExpected((p) => ({ ...p, breakEvenMonth: e.target.value }))}
                      data-testid="input-expected-breakeven"
                    />
                  </div>
                  <div>
                    <Label htmlFor="exp-y1-revenue" className="text-xs">Year 1 Revenue ($)</Label>
                    <Input
                      id="exp-y1-revenue"
                      type="number"
                      placeholder="e.g. 300000"
                      value={manualExpected.year1Revenue}
                      onChange={(e) => setManualExpected((p) => ({ ...p, year1Revenue: e.target.value }))}
                      data-testid="input-expected-y1-revenue"
                    />
                  </div>
                  <div>
                    <Label htmlFor="exp-y1-income" className="text-xs">Year 1 Pre-Tax Income ($)</Label>
                    <Input
                      id="exp-y1-income"
                      type="number"
                      placeholder="e.g. 21000"
                      value={manualExpected.year1PreTaxIncome}
                      onChange={(e) => setManualExpected((p) => ({ ...p, year1PreTaxIncome: e.target.value }))}
                      data-testid="input-expected-y1-income"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="validation-notes" className="text-xs">Notes (optional)</Label>
            <Input
              id="validation-notes"
              placeholder="e.g. Q1 2026 Baseline Test"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              data-testid="validation-notes-input"
            />
          </div>

          <Button
            onClick={handleRunValidation}
            disabled={validateMutation.isPending}
            data-testid="button-run-validation"
          >
            {validateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running financial engine...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Validation
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {validateMutation.isPending && (
        <Card data-testid="validation-loading">
          <CardContent className="flex items-center justify-center py-8 gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Running financial engine...</span>
          </CardContent>
        </Card>
      )}

      {lastResult && !validateMutation.isPending && (
        <ComparisonReport
          status={lastResult.status}
          comparisons={lastResult.comparisonResults}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Validation History</CardTitle>
        </CardHeader>
        <CardContent data-testid="validation-history-list">
          {historyLoading && (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          )}
          {!historyLoading && (!validationRuns || validationRuns.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">No validation runs yet</p>
          )}
          {validationRuns && validationRuns.length > 0 && (
            <div className="space-y-3">
              {validationRuns.map((run) => (
                <HistoryItem
                  key={run.id}
                  run={run}
                  expanded={expandedRunId === run.id}
                  onToggle={() => setExpandedRunId(expandedRunId === run.id ? null : run.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ComparisonReport({
  status,
  comparisons,
}: {
  status: "pass" | "fail";
  comparisons: ValidationMetricComparison[];
}) {
  const passed = comparisons.filter((c) => c.passed).length;
  const total = comparisons.length;

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div
          className={`flex items-center justify-between p-3 rounded-md ${
            status === "pass" ? "bg-green-500/10" : "bg-destructive/10"
          }`}
          data-testid="validation-report-summary"
        >
          <span className="font-medium">
            {passed} of {total} metrics passed
          </span>
          <Badge
            variant={status === "pass" ? "default" : "destructive"}
            data-testid="validation-status-badge"
          >
            {status === "pass" ? (
              <><CheckCircle className="h-3 w-3 mr-1" /> PASS</>
            ) : (
              <><XCircle className="h-3 w-3 mr-1" /> FAIL</>
            )}
          </Badge>
        </div>

        <div className="overflow-x-auto" data-testid="validation-report-table">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4">Metric</th>
                <th className="text-right py-2 px-4">Expected</th>
                <th className="text-right py-2 px-4">Calculated</th>
                <th className="text-right py-2 px-4">Difference</th>
                <th className="text-center py-2 pl-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((c, i) => (
                <tr
                  key={i}
                  className={`border-b ${!c.passed ? "bg-destructive/5" : ""}`}
                  data-testid={`validation-metric-row-${c.metric.replace(/\s+/g, "-").toLowerCase()}`}
                >
                  <td className="py-2 pr-4">
                    <div>
                      <span className="font-medium">{c.metric}</span>
                      <span className="text-xs text-muted-foreground ml-2">{c.category}</span>
                    </div>
                  </td>
                  <td className="text-right py-2 px-4 font-mono text-xs">
                    {formatMetricValue(c.expected, c.metric)}
                  </td>
                  <td className="text-right py-2 px-4 font-mono text-xs">
                    {formatMetricValue(c.actual, c.metric)}
                  </td>
                  <td className="text-right py-2 px-4 font-mono text-xs">
                    {formatMetricValue(c.difference, c.metric)}
                  </td>
                  <td className="text-center py-2 pl-4">
                    {c.passed ? (
                      <CheckCircle className="h-4 w-4 text-green-500 inline" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive inline" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function HistoryItem({
  run,
  expanded,
  onToggle,
}: {
  run: BrandValidationRun;
  expanded: boolean;
  onToggle: () => void;
}) {
  const comparisons = (run.comparisonResults || []) as ValidationMetricComparison[];
  const passed = comparisons.filter((c) => c.passed).length;
  const total = comparisons.length;

  return (
    <div
      className="border rounded-md"
      data-testid={`validation-history-item-${run.id}`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 text-left hover-elevate rounded-md"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant={run.status === "pass" ? "default" : "destructive"}>
            {run.status === "pass" ? "PASS" : "FAIL"}
          </Badge>
          <span className="text-sm">
            {new Date(run.runAt).toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">
            {passed}/{total} metrics
          </span>
          {run.notes && (
            <span className="text-xs text-muted-foreground italic">{run.notes}</span>
          )}
        </div>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {expanded && (
        <div className="border-t p-3">
          <ComparisonReport status={run.status as "pass" | "fail"} comparisons={comparisons} />
        </div>
      )}
    </div>
  );
}
