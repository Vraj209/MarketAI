import { PageHeader } from "@/components/app/page-header";
import { FinancialReportWorkspace } from "@/components/reports/financial-report-workspace";

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Financial reports"
        description="Add your financial statements (monthly, quarterly, or annual). Our AI evaluates performance and predicts next steps—focus on email marketing, content, or both—with actionable recommendations."
      />
      <FinancialReportWorkspace />
    </>
  );
}
