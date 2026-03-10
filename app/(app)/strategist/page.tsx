import { PageHeader } from "@/components/app/page-header";
import { StrategistRequestForm } from "@/components/strategist/strategist-request-form";

export default function StrategistPage() {
  return (
    <>
      <PageHeader
        title="Marketing strategist"
        description="Core AI experience with deterministic orchestration: intent classification, context assembly, tool execution, and structured outputs."
      />
      <StrategistRequestForm />
    </>
  );
}
