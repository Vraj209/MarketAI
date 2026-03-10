import { z } from "zod";

export const marketingIntentSchema = z.enum([
  "strategy_recommendation",
  "social_content",
  "email_campaign",
  "newsletter",
  "report_generation",
  "website_audit",
  "research",
  "lead_response",
]);

export type MarketingIntent = z.infer<typeof marketingIntentSchema>;

export const strategyOutputSchema = z.object({
  summary: z.string().min(1),
  recommendedCampaign: z.string().min(1),
  whyThisWorks: z.array(z.string().min(1)).min(1),
  channels: z.array(z.string().min(1)).min(1),
  suggestedAssets: z.array(z.string().min(1)).min(1),
  nextSteps: z.array(z.string().min(1)).min(1),
});

export type StrategyOutput = z.infer<typeof strategyOutputSchema>;
