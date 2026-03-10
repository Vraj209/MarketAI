import { PageHeader } from "@/components/app/page-header";
import { WebsiteAuditWorkspace } from "@/components/website-audit/website-audit-workspace";

export default function WebsiteAuditPage() {
  return (
    <>
      <PageHeader
        title="Website audit"
        description="Analyze your business website for SEO, conversion performance, visual clarity, and prioritized growth actions."
      />
      <WebsiteAuditWorkspace />
    </>
  );
}
