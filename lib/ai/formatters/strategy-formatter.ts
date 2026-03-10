import { AssembledContext } from "@/lib/ai/orchestration/types";
import { MarketingIntent, StrategyOutput } from "@/lib/ai/schemas/strategy-output";

export function formatStrategyOutput(
  intent: MarketingIntent,
  context: AssembledContext,
): StrategyOutput {
  const businessName = context.businessProfile?.name ?? "your business";
  const goal = context.businessProfile?.goals ?? "improve marketing outcomes";
  const normalizedPrompt = context.normalizedPrompt.toLowerCase();

  if (intent === "research") {
    const isMapResearch = normalizedPrompt.includes("market research mode: map");
    const isKeywordResearch = normalizedPrompt.includes(
      "market research mode: product keyword trends",
    );

    if (isMapResearch) {
      return {
        summary:
          `Local market intelligence for ${businessName}: area profile reviewed for pricing strength, ` +
          "competitive density, and second-store viability.",
        recommendedCampaign: "Market fit is strongest in mid-to-high local demand corridors.",
        whyThisWorks: [
          "Similar business clusters identified by category density and storefront patterns.",
          "Comparable businesses show where pricing tolerance is stronger versus price-sensitive pockets.",
          "Local business mix indicates potential adjacency opportunities for cross-traffic.",
        ],
        channels: [
          "Estimated spending power: medium-high in primary trade radius.",
          "Population signal: commuter + residential mixed demand pattern.",
          "Peak demand windows likely tied to lunch and post-work footfall.",
        ],
        suggestedAssets: [
          "Marketing viability: good if messaging focuses on convenience and value clarity.",
          "Second-store area profile: high-footfall zone with fewer direct substitutes.",
          "Pricing guidance: maintain core range, test premium bundles in target micro-areas.",
        ],
        nextSteps: [
          "Validate top 3 nearby competitor clusters with map snapshots.",
          "Run geo-segmented offer tests before finalizing second-store area.",
          "Build a localized launch plan with neighborhood-specific creatives.",
        ],
      };
    }

    if (isKeywordResearch) {
      return {
        summary:
          `Product keyword trend report for ${businessName}: demand signals assessed across intent, ` +
          "seasonality, and conversion potential.",
        recommendedCampaign: "Prioritize rising product-intent keywords with high purchase relevance.",
        whyThisWorks: [
          "Trend direction highlights which product themes are accelerating now.",
          "Keyword clusters distinguish discovery terms from transaction-ready terms.",
          "Opportunity sizing favors terms with growth and practical content fit.",
        ],
        channels: [
          "Rising trends: feature-led and problem-solution keywords.",
          "Stable trends: evergreen category and comparison terms.",
          "Declining trends: broad low-intent terms with weak conversion signal.",
        ],
        suggestedAssets: [
          "Create product pages and social assets for rising clusters first.",
          "Use stable terms for always-on SEO and email education.",
          "Retire or de-prioritize declining terms unless strategic.",
        ],
        nextSteps: [
          "Publish 2-week test content against top keyword clusters.",
          "Track CTR and conversion by cluster, not single keyword only.",
          "Reallocate budget toward clusters with strongest sales intent.",
        ],
      };
    }
  }

  return {
    summary: `Recommended focus for ${businessName}: prioritize a clear, high-conviction campaign tied to ${goal}.`,
    recommendedCampaign:
      intent === "strategy_recommendation"
        ? "Local loyalty + reactivation sequence"
        : `Primary ${intent.replace("_", " ")} plan`,
    whyThisWorks: [
      "Anchors output in business context rather than generic advice.",
      "Keeps campaign scope execution-ready for an MVP team.",
      "Maintains clear assumptions and channel-level rationale.",
    ],
    channels: ["Email", "Instagram", "Website landing page"],
    suggestedAssets: [
      "Campaign strategy brief",
      "Social content variants",
      "Email sequence outline",
    ],
    nextSteps: [
      "Review assumptions with your team.",
      "Generate channel-specific assets from this strategy.",
      "Track performance and iterate weekly.",
    ],
  };
}
