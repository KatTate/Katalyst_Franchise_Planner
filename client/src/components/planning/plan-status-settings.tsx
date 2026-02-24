import { useState, useCallback, useEffect } from "react";
import { usePlan } from "@/hooks/use-plan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, Landmark, Milestone } from "lucide-react";

const PIPELINE_STAGES = [
  { value: "planning", label: "Planning" },
  { value: "site_evaluation", label: "Site Evaluation" },
  { value: "financing", label: "Financing" },
  { value: "construction", label: "Construction" },
  { value: "open", label: "Open" },
] as const;

const FINANCING_STATUSES = [
  { value: "not_started", label: "Not Started" },
  { value: "exploring", label: "Exploring Options" },
  { value: "applied", label: "Applied" },
  { value: "pre_approved", label: "Pre-Approved" },
  { value: "approved", label: "Approved" },
  { value: "funded", label: "Funded" },
] as const;

interface PlanStatusSettingsProps {
  planId: string;
}

export function PlanStatusSettings({ planId }: PlanStatusSettingsProps) {
  const { plan, isLoading, updatePlan, isSaving } = usePlan(planId);

  const [targetOpenDate, setTargetOpenDate] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [pipelineStage, setPipelineStage] = useState("planning");
  const [financingStatus, setFinancingStatus] = useState("");

  useEffect(() => {
    if (plan) {
      setTargetOpenDate(plan.targetOpenDate || "");
      setTargetMarket(plan.targetMarket || "");
      setLocationAddress(plan.locationAddress || "");
      setPipelineStage(plan.pipelineStage || "planning");
      setFinancingStatus(plan.financingStatus || "");
    }
  }, [plan]);

  const handleFieldBlur = useCallback(
    (field: string, value: string) => {
      if (!plan || isSaving) return;
      const currentVal = (plan as any)[field] || "";
      if (value === currentVal) return;
      updatePlan({ [field]: value || null }).catch(() => {});
    },
    [plan, isSaving, updatePlan]
  );

  const handleSelectChange = useCallback(
    (field: string, value: string) => {
      if (!plan || isSaving) return;
      if (field === "pipelineStage") setPipelineStage(value);
      if (field === "financingStatus") setFinancingStatus(value);
      updatePlan({ [field]: value || null } as any).catch(() => {});
    },
    [plan, isSaving, updatePlan]
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="plan-status-settings">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-muted p-2">
            <Milestone className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">Plan Status & Details</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="pipeline-stage" className="flex items-center gap-2 text-sm font-medium">
            <Milestone className="h-4 w-4 text-muted-foreground" />
            Pipeline Stage
          </Label>
          <Select
            value={pipelineStage}
            onValueChange={(v) => handleSelectChange("pipelineStage", v)}
            disabled={isSaving}
          >
            <SelectTrigger id="pipeline-stage" data-testid="select-pipeline-stage">
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              {PIPELINE_STAGES.map((stage) => (
                <SelectItem key={stage.value} value={stage.value} data-testid={`option-stage-${stage.value}`}>
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target-open-date" className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Target Open Date
          </Label>
          <Input
            id="target-open-date"
            type="month"
            value={targetOpenDate}
            onChange={(e) => setTargetOpenDate(e.target.value)}
            onBlur={() => handleFieldBlur("targetOpenDate", targetOpenDate)}
            disabled={isSaving}
            placeholder="YYYY-MM"
            data-testid="input-target-open-date"
          />
          <p className="text-xs text-muted-foreground">When you expect to open for business</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target-market" className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Market Area
          </Label>
          <Input
            id="target-market"
            value={targetMarket}
            onChange={(e) => setTargetMarket(e.target.value)}
            onBlur={() => handleFieldBlur("targetMarket", targetMarket)}
            disabled={isSaving}
            placeholder="e.g., Downtown Seattle, WA"
            data-testid="input-target-market"
          />
          <p className="text-xs text-muted-foreground">The market area you're targeting</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location-address" className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Location Address
          </Label>
          <Input
            id="location-address"
            value={locationAddress}
            onChange={(e) => setLocationAddress(e.target.value)}
            onBlur={() => handleFieldBlur("locationAddress", locationAddress)}
            disabled={isSaving}
            placeholder="e.g., 123 Main St, Austin, TX"
            data-testid="input-location-address"
          />
          <p className="text-xs text-muted-foreground">Your planned franchise location</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="financing-status" className="flex items-center gap-2 text-sm font-medium">
            <Landmark className="h-4 w-4 text-muted-foreground" />
            Financing Status
          </Label>
          <Select
            value={financingStatus || "not_started"}
            onValueChange={(v) => handleSelectChange("financingStatus", v)}
            disabled={isSaving}
          >
            <SelectTrigger id="financing-status" data-testid="select-financing-status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {FINANCING_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value} data-testid={`option-financing-${status.value}`}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
