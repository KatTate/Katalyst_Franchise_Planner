import { useParams } from "wouter";
import { FinancialInputEditor } from "@/components/shared/financial-input-editor";

export default function InputsDevPage() {
  const { planId } = useParams<{ planId: string }>();

  if (!planId) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <p className="text-muted-foreground">No plan ID provided. Navigate to /plans/:planId/inputs</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Financial Input Editor (Dev Preview)</h1>
      <FinancialInputEditor planId={planId} />
    </div>
  );
}
