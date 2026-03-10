import { MarketingIntent } from "@/lib/ai/schemas/strategy-output";

const intentRules: Array<{ intent: MarketingIntent; keywords: string[] }> = [
  { intent: "website_audit", keywords: ["website", "audit", "seo", "landing page"] },
  { intent: "email_campaign", keywords: ["email", "subject", "newsletter"] },
  { intent: "social_content", keywords: ["instagram", "linkedin", "social", "post"] },
  { intent: "report_generation", keywords: ["report", "roi", "summary", "projection"] },
  { intent: "research", keywords: ["competitor", "research", "market"] },
  { intent: "lead_response", keywords: ["inquiry", "lead", "response", "reply"] },
  { intent: "newsletter", keywords: ["newsletter"] },
];

export function classifyMarketingIntent(prompt: string): MarketingIntent {
  const normalized = prompt.toLowerCase();

  for (const rule of intentRules) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return rule.intent;
    }
  }

  return "strategy_recommendation";
}
