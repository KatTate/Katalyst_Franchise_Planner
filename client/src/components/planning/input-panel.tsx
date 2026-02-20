import { FormsMode } from "@/components/planning/forms-mode";

interface InputPanelProps {
  planId: string;
  planName?: string;
  brandName?: string;
  queueSave?: (data: any) => void;
  onSectionChange?: (section: string | null) => void;
  onStartupCostCountChange?: (count: number) => void;
}

export function InputPanel({ planId, planName, brandName, queueSave, onSectionChange, onStartupCostCountChange }: InputPanelProps) {
  return (
    <div data-testid="input-panel" className="h-full overflow-hidden">
      <FormsMode planId={planId} planName={planName} brandName={brandName} queueSave={queueSave} onSectionChange={onSectionChange} onStartupCostCountChange={onStartupCostCountChange} />
    </div>
  );
}
