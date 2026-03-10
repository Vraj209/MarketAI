import { MarketingIntent } from "@/lib/ai/schemas/strategy-output";

import { AssembledContext, ToolExecutionResult } from "@/lib/ai/orchestration/types";

type ToolExecutor = (context: AssembledContext) => Promise<ToolExecutionResult>;

const defaultTool: ToolExecutor = async (context) => ({
  toolName: "CampaignPlanner",
  output: `Prepared strategy context for ${context.businessProfile?.name ?? "the business"}.`,
});

const toolByIntent: Partial<Record<MarketingIntent, ToolExecutor>> = {
  strategy_recommendation: defaultTool,
  social_content: async () => ({
    toolName: "SocialMediaGenerator",
    output: "Prepared social content structure and channel-first framing.",
  }),
  email_campaign: async () => ({
    toolName: "EmailCampaignGenerator",
    output: "Prepared lifecycle-aware email sequence outline.",
  }),
  newsletter: async () => ({
    toolName: "NewsletterGenerator",
    output: "Prepared newsletter sections and editorial angle.",
  }),
  website_audit: async () => ({
    toolName: "WebsiteAuditAgent",
    output: "Prepared website clarity and conversion audit scaffold.",
  }),
  report_generation: async () => ({
    toolName: "ReportGenerator",
    output: "Prepared report assumptions and business outcome sections.",
  }),
  research: async () => ({
    toolName: "MarketingResearchAgent",
    output: "Prepared market and competitor insight scaffold.",
  }),
  lead_response: async () => ({
    toolName: "LeadInquiryResponseAgent",
    output: "Prepared lead response template framework.",
  }),
};

export async function executeIntentTool(
  intent: MarketingIntent,
  context: AssembledContext,
): Promise<ToolExecutionResult> {
  const executor = toolByIntent[intent] ?? defaultTool;
  return executor(context);
}
