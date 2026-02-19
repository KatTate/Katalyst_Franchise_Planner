import { FormsMode } from "@/components/planning/forms-mode";

interface InputPanelProps {
  planId: string;
  planName?: string;
  brandName?: string;
  queueSave?: (data: any) => void;
}

export function InputPanel({ planId, planName, brandName, queueSave }: InputPanelProps) {
  return (
    <div data-testid="input-panel" className="h-full overflow-hidden">
      <FormsMode planId={planId} planName={planName} brandName={brandName} queueSave={queueSave} />
    </div>
  );
}
