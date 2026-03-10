import { z } from "zod";

export const researchPipelineRequestSchema = z.object({
  businessType: z.string().min(2).max(120),
  currentArea: z.string().min(2).max(160),
  radiusKm: z.number().min(0).max(15),
  currentPriceRange: z.string().min(1).max(80),
  notes: z.string().max(500).optional(),
});

export type ResearchPipelineRequest = z.infer<typeof researchPipelineRequestSchema>;

export const discoveredBusinessSchema = z.object({
  businessName: z.string(),
  businessType: z.string(),
  products: z.string(),
  pricing: z.string(),
  openingTimes: z.string(),
  estimatedCustomerCount: z.string(),
  website: z.string().optional(),
  address: z.string(),
  distanceKm: z.number(),
});

export type DiscoveredBusiness = z.infer<typeof discoveredBusinessSchema>;

export const websiteInsightSchema = z.object({
  website: z.string(),
  positioning: z.string(),
  offerHighlights: z.array(z.string()),
  targetAudienceSignals: z.array(z.string()),
});

export type WebsiteInsight = z.infer<typeof websiteInsightSchema>;

export const finalResearchReportSchema = z.object({
  executiveSummary: z.string(),
  areaSpendingPower: z.string(),
  populationProfile: z.string(),
  marketRangeSnapshot: z.string(),
  immigrationInsights: z.array(z.string()),
  ageRangeInsights: z.array(z.string()),
  professionalInsights: z.array(z.string()),
  similarBusinessInsights: z.array(z.string()),
  pricingFitAssessment: z.string(),
  secondStoreRecommendation: z.string(),
  marketingVerdict: z.string(),
  futureBusinessOutlook: z.string(),
  recommendedMarketingPlays: z.array(z.string()),
  marketingBenefits: z.array(z.string()),
  risks: z.array(z.string()),
  nextActions: z.array(z.string()),
  evidenceSources: z.array(z.string()),
});

export type FinalResearchReport = z.infer<typeof finalResearchReportSchema>;
