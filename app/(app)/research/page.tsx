import { PageHeader } from "@/components/app/page-header";
import { ResearchWorkspace } from "@/components/research/research-workspace";

export default function ResearchPage() {
  return (
    <>
      <PageHeader
        title="Market research"
        description="Run map-based market intelligence and product keyword trend analysis to guide pricing and expansion decisions."
      />
      <ResearchWorkspace />
    </>
  );
}
