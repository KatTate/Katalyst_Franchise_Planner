import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCents } from "@/lib/format-currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Circle,
  ArrowUpDown,
  DollarSign,
  Clock,
  Users,
  ShieldCheck,
  ShieldOff,
  Eye,
  EyeOff,
} from "lucide-react";

interface FinancialSummary {
  projectedAnnualRevenue: number;
  totalStartupInvestment: number;
  breakEvenMonth: number | null;
  roiPct: number;
}

interface AcknowledgmentState {
  acknowledgedAt: string;
  isStale: boolean;
}

interface PipelineFranchisee {
  franchiseeId: string;
  displayName: string | null;
  planId: string;
  planName: string;
  planStatus: string;
  pipelineStage: string;
  targetMarket: string | null;
  targetOpenQuarter: string | null;
  lastActivityDate: string;
  isStalled: boolean;
  hasConsentedFinancials: boolean;
  financialSummary: FinancialSummary | null;
  acknowledgment: AcknowledgmentState | null;
}

interface PipelineSummary {
  planning: number;
  site_evaluation: number;
  financing: number;
  construction: number;
  open: number;
  stalled: number;
  total: number;
}

interface PipelineResponse {
  franchisees: PipelineFranchisee[];
  summary: PipelineSummary;
  lastUpdated: string;
  acknowledgmentEnabled: boolean;
}

const STAGE_LABELS: Record<string, string> = {
  planning: "Planning",
  site_evaluation: "Site Evaluation",
  financing: "Financing",
  construction: "Construction",
  open: "Open",
};

const STAGE_COLORS: Record<string, string> = {
  planning: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  site_evaluation: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  financing: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  construction: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  open: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

type SortField = "displayName" | "pipelineStage" | "lastActivityDate" | "planStatus" | "targetOpenQuarter";
type SortDirection = "asc" | "desc";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function daysAgo(dateStr: string): number {
  const now = new Date();
  const then = new Date(dateStr);
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}

export default function PipelinePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sortField, setSortField] = useState<SortField>("displayName");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [stageFilter, setStageFilter] = useState<string>("all");

  const { data, isLoading, isRefetching } = useQuery<PipelineResponse>({
    queryKey: ["/api/pipeline"],
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (planId: string) => {
      await apiRequest("POST", `/api/pipeline/${planId}/acknowledge`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pipeline"] });
      toast({ title: "Plan acknowledged" });
    },
    onError: () => {
      toast({ title: "Failed to acknowledge plan", variant: "destructive" });
    },
  });

  const unacknowledgeMutation = useMutation({
    mutationFn: async (planId: string) => {
      await apiRequest("DELETE", `/api/pipeline/${planId}/acknowledge`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pipeline"] });
      toast({ title: "Acknowledgment removed" });
    },
    onError: () => {
      toast({ title: "Failed to remove acknowledgment", variant: "destructive" });
    },
  });

  const filteredAndSorted = useMemo(() => {
    if (!data) return [];
    let items = [...data.franchisees];

    if (stageFilter !== "all") {
      if (stageFilter === "stalled") {
        items = items.filter((f) => f.isStalled);
      } else {
        items = items.filter((f) => f.pipelineStage === stageFilter);
      }
    }

    items.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "displayName":
          cmp = (a.displayName || "").localeCompare(b.displayName || "");
          break;
        case "pipelineStage": {
          const order = ["planning", "site_evaluation", "financing", "construction", "open"];
          cmp = order.indexOf(a.pipelineStage) - order.indexOf(b.pipelineStage);
          break;
        }
        case "lastActivityDate":
          cmp = new Date(a.lastActivityDate).getTime() - new Date(b.lastActivityDate).getTime();
          break;
        case "planStatus":
          cmp = (a.planStatus || "").localeCompare(b.planStatus || "");
          break;
        case "targetOpenQuarter":
          cmp = (a.targetOpenQuarter || "").localeCompare(b.targetOpenQuarter || "");
          break;
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });

    return items;
  }, [data, stageFilter, sortField, sortDirection]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  if (!user) return null;

  if (user.role !== "franchisor") {
    return (
      <div className="flex items-center justify-center min-h-[400px]" data-testid="pipeline-access-denied">
        <div className="text-center space-y-2">
          <Users className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">This page is for franchisor admins. Please use the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="pipeline-loading">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" data-testid="pipeline-error">
        <p className="text-muted-foreground">Unable to load pipeline data.</p>
      </div>
    );
  }

  const { summary } = data;

  return (
    <div className="space-y-6" data-testid="pipeline-page">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-pipeline-title">
            Franchisee Pipeline
          </h1>
          <p className="text-muted-foreground text-sm mt-1" data-testid="text-pipeline-subtitle">
            Overview of all franchisee planning progress
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/pipeline"] })}
          disabled={isRefetching}
          data-testid="button-refresh-pipeline"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isRefetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3" data-testid="pipeline-summary">
        <SummaryCard
          label="Total"
          count={summary.total}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          testId="summary-total"
        />
        <SummaryCard
          label="Planning"
          count={summary.planning}
          icon={<Circle className="h-4 w-4 text-blue-500" />}
          testId="summary-planning"
        />
        <SummaryCard
          label="Site Eval"
          count={summary.site_evaluation}
          icon={<Circle className="h-4 w-4 text-purple-500" />}
          testId="summary-site-evaluation"
        />
        <SummaryCard
          label="Financing"
          count={summary.financing}
          icon={<DollarSign className="h-4 w-4 text-amber-500" />}
          testId="summary-financing"
        />
        <SummaryCard
          label="Construction"
          count={summary.construction}
          icon={<Circle className="h-4 w-4 text-orange-500" />}
          testId="summary-construction"
        />
        <SummaryCard
          label="Open"
          count={summary.open}
          icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
          testId="summary-open"
        />
        <SummaryCard
          label="Stalled"
          count={summary.stalled}
          icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
          testId="summary-stalled"
          highlight={summary.stalled > 0}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3" data-testid="pipeline-controls">
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-stage-filter">
            <SelectValue placeholder="Filter by stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="site_evaluation">Site Evaluation</SelectItem>
            <SelectItem value="financing">Financing</SelectItem>
            <SelectItem value="construction">Construction</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="stalled">Stalled</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground" data-testid="text-pipeline-count">
          Showing {filteredAndSorted.length} of {data.franchisees.length} franchisees
        </p>
      </div>

      {filteredAndSorted.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center" data-testid="pipeline-empty">
            <Users className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {data.franchisees.length === 0
                ? "No franchisees have started planning yet."
                : "No franchisees match the selected filter."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="hidden lg:block" data-testid="pipeline-table">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => toggleSort("displayName")} data-testid="sort-name">
                        Franchisee <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                      </Button>
                    </TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => toggleSort("pipelineStage")} data-testid="sort-stage">
                        Stage <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                      </Button>
                    </TableHead>
                    <TableHead>Target Market</TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => toggleSort("targetOpenQuarter")} data-testid="sort-open-quarter">
                        Open Quarter <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => toggleSort("lastActivityDate")} data-testid="sort-activity">
                        Last Activity <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                      </Button>
                    </TableHead>
                    <TableHead>Financials</TableHead>
                    {data.acknowledgmentEnabled && <TableHead>Acknowledged</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSorted.map((f) => (
                    <TableRow
                      key={f.planId}
                      className={f.isStalled ? "bg-red-50/50 dark:bg-red-950/20" : ""}
                      data-testid={`row-franchisee-${f.planId}`}
                    >
                      <TableCell className="font-medium" data-testid={`text-franchisee-name-${f.planId}`}>
                        <div className="flex items-center gap-2">
                          {f.displayName}
                          {f.isStalled && (
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Stalled — no activity for {daysAgo(f.lastActivityDate)} days
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-plan-name-${f.planId}`}>{f.planName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={STAGE_COLORS[f.pipelineStage] || ""} data-testid={`badge-stage-${f.planId}`}>
                          {STAGE_LABELS[f.pipelineStage] || f.pipelineStage}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-market-${f.planId}`}>
                        {f.targetMarket || "—"}
                      </TableCell>
                      <TableCell data-testid={`text-open-quarter-${f.planId}`}>
                        {f.targetOpenQuarter || "—"}
                      </TableCell>
                      <TableCell data-testid={`text-activity-${f.planId}`}>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className={f.isStalled ? "text-red-600 dark:text-red-400 font-medium" : ""}>
                            {formatDate(f.lastActivityDate)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <FinancialCell franchisee={f} />
                      </TableCell>
                      {data.acknowledgmentEnabled && (
                        <TableCell>
                          <AcknowledgmentCell
                            franchisee={f}
                            onAcknowledge={() => acknowledgeMutation.mutate(f.planId)}
                            onUnacknowledge={() => unacknowledgeMutation.mutate(f.planId)}
                            isPending={acknowledgeMutation.isPending || unacknowledgeMutation.isPending}
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          <div className="lg:hidden space-y-3" data-testid="pipeline-cards">
            {filteredAndSorted.map((f) => (
              <Card
                key={f.planId}
                className={f.isStalled ? "border-red-200 dark:border-red-800" : ""}
                data-testid={`card-franchisee-${f.planId}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2" data-testid={`text-card-name-${f.planId}`}>
                      {f.displayName}
                      {f.isStalled && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    </CardTitle>
                    <Badge variant="secondary" className={STAGE_COLORS[f.pipelineStage] || ""} data-testid={`badge-card-stage-${f.planId}`}>
                      {STAGE_LABELS[f.pipelineStage] || f.pipelineStage}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan</span>
                    <span data-testid={`text-card-plan-${f.planId}`}>{f.planName}</span>
                  </div>
                  {f.targetMarket && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Market</span>
                      <span data-testid={`text-card-market-${f.planId}`}>{f.targetMarket}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Activity</span>
                    <span className={f.isStalled ? "text-red-600 dark:text-red-400 font-medium" : ""} data-testid={`text-card-activity-${f.planId}`}>
                      {formatDate(f.lastActivityDate)}
                      {f.isStalled && ` (${daysAgo(f.lastActivityDate)}d ago)`}
                    </span>
                  </div>
                  <FinancialCell franchisee={f} isCard />
                  {data.acknowledgmentEnabled && (
                    <div className="pt-2 border-t">
                      <AcknowledgmentCell
                        franchisee={f}
                        onAcknowledge={() => acknowledgeMutation.mutate(f.planId)}
                        onUnacknowledge={() => unacknowledgeMutation.mutate(f.planId)}
                        isPending={acknowledgeMutation.isPending || unacknowledgeMutation.isPending}
                        isCard
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground text-right" data-testid="text-last-updated">
        Last updated: {formatDate(data.lastUpdated)}
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  count,
  icon,
  testId,
  highlight = false,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
  testId: string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-red-200 dark:border-red-800" : ""} data-testid={testId}>
      <CardContent className="p-4 flex flex-col items-center gap-1">
        {icon}
        <span className={`text-2xl font-bold ${highlight ? "text-red-600 dark:text-red-400" : ""}`} data-testid={`${testId}-count`}>
          {count}
        </span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}

function FinancialCell({
  franchisee,
  isCard = false,
}: {
  franchisee: PipelineFranchisee;
  isCard?: boolean;
}) {
  if (!franchisee.hasConsentedFinancials) {
    return (
      <div className={`flex items-center gap-1 text-muted-foreground ${isCard ? "justify-between" : ""}`} data-testid={`financial-no-consent-${franchisee.planId}`}>
        {isCard && <span className="text-muted-foreground">Financials</span>}
        <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center gap-1">
              <ShieldOff className="h-3.5 w-3.5" />
              <span className="text-xs">No consent</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            Franchisee has not shared financial data
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  if (!franchisee.financialSummary) {
    return (
      <div className={`flex items-center gap-1 text-muted-foreground ${isCard ? "justify-between" : ""}`} data-testid={`financial-no-data-${franchisee.planId}`}>
        {isCard && <span className="text-muted-foreground">Financials</span>}
        <div className="flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
          <span className="text-xs">No projections yet</span>
        </div>
      </div>
    );
  }

  const fs = franchisee.financialSummary;

  if (isCard) {
    return (
      <div className="space-y-1" data-testid={`financial-summary-${franchisee.planId}`}>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Revenue (Y1)</span>
          <span className="font-medium">{formatCents(fs.projectedAnnualRevenue)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Startup Cost</span>
          <span>{formatCents(fs.totalStartupInvestment)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Break-even</span>
          <span>{fs.breakEvenMonth ? `Month ${fs.breakEvenMonth}` : "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">5Y ROI</span>
          <span className={fs.roiPct >= 0 ? "text-green-600" : "text-red-600"}>{(fs.roiPct * 100).toFixed(1)}%</span>
        </div>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <div className="flex items-center gap-1" data-testid={`financial-summary-${franchisee.planId}`}>
          <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
          <span className="text-xs font-medium">{formatCents(fs.projectedAnnualRevenue)}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="left" className="space-y-1 text-xs">
        <p>Revenue (Y1): {formatCents(fs.projectedAnnualRevenue)}</p>
        <p>Startup: {formatCents(fs.totalStartupInvestment)}</p>
        <p>Break-even: {fs.breakEvenMonth ? `Month ${fs.breakEvenMonth}` : "N/A"}</p>
        <p>5Y ROI: {(fs.roiPct * 100).toFixed(1)}%</p>
      </TooltipContent>
    </Tooltip>
  );
}

function AcknowledgmentCell({
  franchisee,
  onAcknowledge,
  onUnacknowledge,
  isPending,
  isCard = false,
}: {
  franchisee: PipelineFranchisee;
  onAcknowledge: () => void;
  onUnacknowledge: () => void;
  isPending: boolean;
  isCard?: boolean;
}) {
  const ack = franchisee.acknowledgment;

  if (!ack) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onAcknowledge}
        disabled={isPending}
        className={isCard ? "w-full" : ""}
        data-testid={`button-acknowledge-${franchisee.planId}`}
      >
        <Eye className="h-3.5 w-3.5 mr-1" />
        Acknowledge
      </Button>
    );
  }

  if (ack.isStale) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onAcknowledge}
            disabled={isPending}
            className={`border-amber-300 text-amber-700 dark:text-amber-400 ${isCard ? "w-full" : ""}`}
            data-testid={`button-reacknowledge-${franchisee.planId}`}
          >
            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
            Updated — Re-ack
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Plan was updated since you last acknowledged it on {formatDate(ack.acknowledgedAt)}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={onUnacknowledge}
          disabled={isPending}
          className={`text-green-600 dark:text-green-400 ${isCard ? "w-full" : ""}`}
          data-testid={`button-unacknowledge-${franchisee.planId}`}
        >
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
          Acknowledged
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        Acknowledged on {formatDate(ack.acknowledgedAt)}. Click to remove.
      </TooltipContent>
    </Tooltip>
  );
}
