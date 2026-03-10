import { getOpenAIClient } from "@/lib/integrations/openai/client";
import {
  DiscoveredBusiness,
  discoveredBusinessSchema,
  FinalResearchReport,
  finalResearchReportSchema,
  ResearchPipelineRequest,
  WebsiteInsight,
  websiteInsightSchema,
} from "@/lib/validations/research-pipeline";

type PipelineResult = {
  businesses: DiscoveredBusiness[];
  csvBase64: string;
  csvFilename: string;
  websiteInsights: WebsiteInsight[];
  finalReport: FinalResearchReport;
};

type MarketIntelligenceReport = {
  marketRangeSnapshot: string;
  areaSpendingPower: string;
  populationProfile: string;
  immigrationInsights: string[];
  ageRangeInsights: string[];
  professionalInsights: string[];
  evidenceSources: string[];
};

type FuturePredictionReport = {
  futureBusinessOutlook: string;
  marketingVerdict: string;
  recommendedMarketingPlays: string[];
  marketingBenefits: string[];
};

type LatLng = { lat: number; lng: number };

type GeocodeApiResponse = {
  status: string;
  error_message?: string;
  results: Array<{
    geometry?: { location?: { lat?: number; lng?: number } };
  }>;
};

type PlacesSearchResponse = {
  status: string;
  error_message?: string;
  next_page_token?: string;
  results?: GooglePlaceResult[];
};

type GooglePlaceResult = {
  place_id?: string;
  name?: string;
  formatted_address?: string;
  geometry?: { location?: { lat?: number; lng?: number } };
  types?: string[];
  price_level?: number;
  opening_hours?: { open_now?: boolean };
  user_ratings_total?: number;
  website?: string;
};

const GOOGLE_MAPS_BASE_URL = "https://maps.googleapis.com/maps/api";

export async function runResearchPipeline(
  input: ResearchPipelineRequest,
): Promise<PipelineResult> {
  const businesses = await discoverBusinessesFromGoogleMaps(input);
  if (!businesses.length) {
    throw new Error("No Google Maps businesses found for this query and radius.");
  }

  const websiteInsights = await runWebsiteResearchAgent(businesses);
  const marketIntelligence = await runLocalMarketIntelligenceAgent(input, businesses);
  const futurePrediction = await runFuturePredictionAgent(
    input,
    businesses,
    marketIntelligence,
    websiteInsights,
  );
  const finalReport = await runSynthesisAgent(
    input,
    businesses,
    websiteInsights,
    marketIntelligence,
    futurePrediction,
  );
  const csv = buildBusinessesCsv(businesses);

  return {
    businesses,
    csvBase64: Buffer.from(csv, "utf-8").toString("base64"),
    csvFilename: `market-research-${slugify(input.businessType)}-${Date.now()}.csv`,
    websiteInsights,
    finalReport,
  };
}

async function discoverBusinessesFromGoogleMaps(
  input: ResearchPipelineRequest,
): Promise<DiscoveredBusiness[]> {
  const apiKey = process.env["GOOGLE_MAPS_API_KEY"];
  if (!apiKey) {
    throw new Error("Missing GOOGLE_MAPS_API_KEY. Add it in your .env file.");
  }

  const center = await geocodeArea(input.currentArea, apiKey);
  const radiusMeters = Math.max(500, Math.min(15000, Math.round(input.radiusKm * 1000)));
  const query = `${input.businessType} in ${input.currentArea}`;

  const rawPlaces = await searchPlaces(query, center, radiusMeters, apiKey);
  const deduped = dedupePlaces(rawPlaces);
  const maxDistanceKm = input.radiusKm + 0.25;

  const businesses = deduped
    .map((place) => {
      const distanceKm = calculateDistanceKm(center, place.geometry?.location);
      return discoveredBusinessSchema.parse({
        businessName: place.name ?? "Unknown",
        businessType: formatBusinessType(place.types, input.businessType),
        products: inferProducts(place.types),
        pricing: formatPriceLevel(place.price_level),
        openingTimes: formatOpeningHours(place.opening_hours),
        estimatedCustomerCount: formatCustomerCount(place.user_ratings_total),
        website: place.website?.trim() || "",
        address: place.formatted_address ?? input.currentArea,
        distanceKm,
      });
    })
    .filter((business) => business.distanceKm <= maxDistanceKm)
    .sort((left, right) => left.distanceKm - right.distanceKm);

  return businesses;
}

async function geocodeArea(area: string, apiKey: string): Promise<LatLng> {
  const url = `${GOOGLE_MAPS_BASE_URL}/geocode/json?address=${encodeURIComponent(area)}&key=${apiKey}`;
  const response = await fetch(url, { method: "GET", signal: AbortSignal.timeout(12000) });

  if (!response.ok) {
    throw new Error("Google Geocoding API request failed.");
  }

  const payload = (await response.json()) as GeocodeApiResponse;
  if (payload.status !== "OK" || !payload.results.length) {
    throw new Error(
      payload.error_message
        ? `Google Geocoding API error: ${payload.error_message}`
        : `Unable to geocode area: ${area}`,
    );
  }

  const location = payload.results[0]?.geometry?.location;
  if (typeof location?.lat !== "number" || typeof location?.lng !== "number") {
    throw new Error(`Invalid geocoding response for area: ${area}`);
  }

  return { lat: location.lat, lng: location.lng };
}

async function searchPlaces(
  query: string,
  center: LatLng,
  radiusMeters: number,
  apiKey: string,
): Promise<GooglePlaceResult[]> {
  const results: GooglePlaceResult[] = [];
  let pageToken: string | null = null;

  for (let page = 0; page < 3; page += 1) {
    const pageTokenParam = pageToken ? `&pagetoken=${encodeURIComponent(pageToken)}` : "";
    const url = `${GOOGLE_MAPS_BASE_URL}/place/textsearch/json?query=${encodeURIComponent(
      query,
    )}&location=${center.lat},${center.lng}&radius=${radiusMeters}&key=${apiKey}${pageTokenParam}`;

    if (pageToken) {
      await sleep(2000);
    }

    const response = await fetch(url, { method: "GET", signal: AbortSignal.timeout(12000) });
    if (!response.ok) {
      throw new Error("Google Places API request failed.");
    }

    const payload = (await response.json()) as PlacesSearchResponse;
    if (payload.status !== "OK" && payload.status !== "ZERO_RESULTS") {
      throw new Error(
        payload.error_message
          ? `Google Places API error: ${payload.error_message}`
          : `Google Places API status: ${payload.status}`,
      );
    }

    if (Array.isArray(payload.results)) {
      results.push(...payload.results);
    }

    pageToken = payload.next_page_token ?? null;
    if (!pageToken) {
      break;
    }
  }

  return results;
}

function dedupePlaces(places: GooglePlaceResult[]): GooglePlaceResult[] {
  const seen = new Set<string>();
  const unique: GooglePlaceResult[] = [];

  for (const place of places) {
    const key =
      place.place_id ??
      `${place.name ?? ""}::${place.formatted_address ?? ""}::${place.geometry?.location?.lat ?? ""}::${place.geometry?.location?.lng ?? ""}`;
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(place);
  }

  return unique;
}

async function runWebsiteResearchAgent(
  businesses: DiscoveredBusiness[],
): Promise<WebsiteInsight[]> {
  const websites = businesses
    .map((business) => business.website?.trim())
    .filter((website): website is string => Boolean(website))
    .slice(0, 8);

  if (!websites.length) {
    return [];
  }

  const snapshots = await Promise.all(
    websites.map(async (website) => {
      try {
        const response = await fetch(website, {
          method: "GET",
          signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) {
          return { website, content: "" };
        }

        const html = await response.text();
        return { website, content: extractWebsiteSnapshot(html) };
      } catch {
        return { website, content: "" };
      }
    }),
  );

  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are a website analysis agent. Read snapshots and output strict JSON array only.",
        },
        {
          role: "user",
          content: [
            "For each website snapshot return fields: website, positioning, offerHighlights[], targetAudienceSignals[].",
            JSON.stringify(snapshots),
          ].join("\n"),
        },
      ],
    });

    const parsed = await parseJsonFromModelOutput(response.output_text);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((entry) => websiteInsightSchema.safeParse(entry))
      .filter((entry) => entry.success)
      .map((entry) => entry.data);
  } catch {
    return [];
  }
}

async function runSynthesisAgent(
  input: ResearchPipelineRequest,
  businesses: DiscoveredBusiness[],
  websiteInsights: WebsiteInsight[],
  marketIntelligence: MarketIntelligenceReport,
  futurePrediction: FuturePredictionReport,
): Promise<FinalResearchReport> {
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: "gpt-4.1",
    input: [
      {
        role: "system",
        content:
          "You are a senior market research synthesis agent. Output strict JSON only with decision-ready findings.",
      },
      {
        role: "user",
        content: [
          "Create a final local market research report by combining output from two upstream agents.",
          `Business type: ${input.businessType}`,
          `Area: ${input.currentArea}`,
          `Radius: ${input.radiusKm} km`,
          `Current pricing: ${input.currentPriceRange}`,
          `Notes: ${input.notes ?? "none"}`,
          `Similar business entries: ${JSON.stringify(businesses)}`,
          `Website insights: ${JSON.stringify(websiteInsights)}`,
          `Market intelligence agent output: ${JSON.stringify(marketIntelligence)}`,
          `Future prediction agent output: ${JSON.stringify(futurePrediction)}`,
          "Return fields exactly: executiveSummary, areaSpendingPower, populationProfile, marketRangeSnapshot, immigrationInsights[], ageRangeInsights[], professionalInsights[], similarBusinessInsights[], pricingFitAssessment, secondStoreRecommendation, marketingVerdict, futureBusinessOutlook, recommendedMarketingPlays[], marketingBenefits[], risks[], nextActions[], evidenceSources[].",
          "Use only grounded evidence from the provided agent outputs. Do not invent source URLs.",
        ].join("\n"),
      },
    ],
  });

  const parsed = await parseJsonFromModelOutput(response.output_text);
  const normalized = normalizeFinalReportPayload(parsed);
  return finalResearchReportSchema.parse(normalized);
}

function buildBusinessesCsv(businesses: DiscoveredBusiness[]): string {
  const headers = [
    "Business Name",
    "Business Type",
    "Products",
    "Pricing",
    "Opening Times",
    "Estimated Customer Count",
    "Website",
    "Address",
    "Distance (km)",
  ];

  const lines = businesses.map((business) =>
    [
      business.businessName,
      business.businessType,
      business.products,
      business.pricing,
      business.openingTimes,
      business.estimatedCustomerCount,
      business.website ?? "",
      business.address,
      String(business.distanceKm),
    ]
      .map(csvEscape)
      .join(","),
  );

  return [headers.map(csvEscape).join(","), ...lines].join("\n");
}

function csvEscape(value: string): string {
  const escaped = value.replaceAll('"', '""');
  return `"${escaped}"`;
}

function extractWebsiteSnapshot(html: string): string {
  const normalized = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized.slice(0, 1800);
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function parseJsonFromModelOutput(rawText: string): Promise<unknown> {
  const text = rawText.trim();

  const candidates: string[] = [];
  candidates.push(text);

  const fencedMatch = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    candidates.push(fencedMatch[1].trim());
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(text.slice(firstBrace, lastBrace + 1));
  }

  const firstBracket = text.indexOf("[");
  const lastBracket = text.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    candidates.push(text.slice(firstBracket, lastBracket + 1));
  }

  for (const candidate of candidates) {
    const parsed = tryParseJson(candidate);
    if (parsed !== null) {
      return parsed;
    }
  }

  const repaired = await repairJsonWithModel(text);
  if (repaired) {
    const repairedParsed = tryParseJson(repaired);
    if (repairedParsed !== null) {
      return repairedParsed;
    }
  }

  throw new Error("Unable to parse valid JSON from model output.");
}

async function runLocalMarketIntelligenceAgent(
  input: ResearchPipelineRequest,
  businesses: DiscoveredBusiness[],
): Promise<MarketIntelligenceReport> {
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: "gpt-4.1",
    tools: [{ type: "web_search_preview" }],
    input: [
      {
        role: "system",
        content:
          "You are a local economic and demographic intelligence agent. Use web search and provide verifiable output.",
      },
      {
        role: "user",
        content: [
          "Research the local market for the given business type and location. Use credible public sources (government stats, census, municipal portals, research organizations).",
          `Business type: ${input.businessType}`,
          `Location: ${input.currentArea}`,
          `Radius: ${input.radiusKm} km`,
          `Current pricing: ${input.currentPriceRange}`,
          `Nearby businesses from map data: ${JSON.stringify(businesses.slice(0, 25))}`,
          "Return strict JSON fields exactly: marketRangeSnapshot, areaSpendingPower, populationProfile, immigrationInsights[], ageRangeInsights[], professionalInsights[], evidenceSources[].",
          "evidenceSources must be URL strings used in your analysis.",
        ].join("\n"),
      },
    ],
  });

  const parsed = (await parseJsonFromModelOutput(
    response.output_text,
  )) as Partial<MarketIntelligenceReport>;
  return {
    marketRangeSnapshot: safeText(parsed.marketRangeSnapshot),
    areaSpendingPower: safeText(parsed.areaSpendingPower),
    populationProfile: safeText(parsed.populationProfile),
    immigrationInsights: safeStringArray(parsed.immigrationInsights),
    ageRangeInsights: safeStringArray(parsed.ageRangeInsights),
    professionalInsights: safeStringArray(parsed.professionalInsights),
    evidenceSources: safeUrlArray(parsed.evidenceSources),
  };
}

async function runFuturePredictionAgent(
  input: ResearchPipelineRequest,
  businesses: DiscoveredBusiness[],
  marketIntelligence: MarketIntelligenceReport,
  websiteInsights: WebsiteInsight[],
): Promise<FuturePredictionReport> {
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: "gpt-4.1",
    input: [
      {
        role: "system",
        content:
          "You are a business forecasting and growth strategy agent. Provide practical and measurable guidance.",
      },
      {
        role: "user",
        content: [
          "Predict how this business can perform in the near future based on local market and competition signals.",
          `Business type: ${input.businessType}`,
          `Location: ${input.currentArea}`,
          `Radius: ${input.radiusKm} km`,
          `Current pricing: ${input.currentPriceRange}`,
          `Owner notes: ${input.notes ?? "none"}`,
          `Map businesses: ${JSON.stringify(businesses.slice(0, 25))}`,
          `Market intelligence: ${JSON.stringify(marketIntelligence)}`,
          `Website insights: ${JSON.stringify(websiteInsights)}`,
          "Return strict JSON fields exactly: futureBusinessOutlook, marketingVerdict, recommendedMarketingPlays[], marketingBenefits[].",
        ].join("\n"),
      },
    ],
  });

  const parsed = (await parseJsonFromModelOutput(
    response.output_text,
  )) as Partial<FuturePredictionReport>;
  return {
    futureBusinessOutlook: safeText(parsed.futureBusinessOutlook),
    marketingVerdict: safeText(parsed.marketingVerdict),
    recommendedMarketingPlays: safeStringArray(parsed.recommendedMarketingPlays),
    marketingBenefits: safeStringArray(parsed.marketingBenefits),
  };
}

function formatBusinessType(types: string[] | undefined, fallback: string): string {
  if (!types?.length) {
    return fallback;
  }
  return types
    .slice(0, 3)
    .map((value) => value.replaceAll("_", " "))
    .join(", ");
}

function inferProducts(types: string[] | undefined): string {
  if (!types?.length) {
    return "Not specified in Google Maps";
  }
  return types
    .slice(0, 4)
    .map((value) => value.replaceAll("_", " "))
    .join(", ");
}

function formatPriceLevel(priceLevel: number | undefined): string {
  if (typeof priceLevel !== "number") {
    return "Not listed";
  }
  const map: Record<number, string> = {
    0: "Free",
    1: "$",
    2: "$$",
    3: "$$$",
    4: "$$$$",
  };
  return map[priceLevel] ?? "Not listed";
}

function formatOpeningHours(openingHours: { open_now?: boolean } | undefined): string {
  if (typeof openingHours?.open_now === "boolean") {
    return openingHours.open_now ? "Open now" : "Closed now";
  }
  return "Not listed";
}

function formatCustomerCount(userRatingsTotal: number | undefined): string {
  if (typeof userRatingsTotal !== "number") {
    return "Not listed";
  }
  return `${userRatingsTotal} Google ratings`;
}

function calculateDistanceKm(center: LatLng, destination?: { lat?: number; lng?: number }): number {
  if (typeof destination?.lat !== "number" || typeof destination?.lng !== "number") {
    return 0;
  }

  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(destination.lat - center.lat);
  const dLng = toRadians(destination.lng - center.lng);
  const lat1 = toRadians(center.lat);
  const lat2 = toRadians(destination.lat);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((earthRadiusKm * c).toFixed(2));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function tryParseJson(input: string): unknown | null {
  try {
    return JSON.parse(input);
  } catch {
    const normalized = normalizeJsonLikeString(input);

    try {
      return JSON.parse(normalized);
    } catch {
      const segments = extractBalancedJsonSegments(normalized);
      for (const segment of segments) {
        try {
          return JSON.parse(segment);
        } catch {
          // Keep trying remaining segments.
        }
      }
      return null;
    }
  }
}

function normalizeJsonLikeString(input: string): string {
  return input
    .replace(/^\uFEFF/, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\u00A0/g, " ")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1")
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/([{,]\s*)'([^']+?)'\s*:/g, '$1"$2":')
    .replace(/:\s*'([^']*?)'(?=\s*[,}\]])/g, (_match, value: string) => {
      const escaped = value.replaceAll('"', '\\"');
      return `: "${escaped}"`;
    })
    .replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)/g, '$1"$2"$3');
}

function extractBalancedJsonSegments(input: string): string[] {
  const segments: string[] = [];
  const openChars = new Set(["{", "["]);
  const closeFor: Record<string, string> = {
    "{": "}",
    "[": "]",
  };

  for (let i = 0; i < input.length; i += 1) {
    const start = input[i];
    if (!openChars.has(start)) {
      continue;
    }

    const stack: string[] = [closeFor[start]];
    let inString = false;
    let escaped = false;

    for (let j = i + 1; j < input.length; j += 1) {
      const ch = input[j];
      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (ch === '"') {
          inString = false;
        }
        continue;
      }

      if (ch === '"') {
        inString = true;
        continue;
      }

      if (openChars.has(ch)) {
        stack.push(closeFor[ch]);
        continue;
      }

      if (stack.length && ch === stack[stack.length - 1]) {
        stack.pop();
        if (!stack.length) {
          segments.push(input.slice(i, j + 1));
          break;
        }
      }
    }
  }

  return segments;
}

async function repairJsonWithModel(rawText: string): Promise<string | null> {
  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You repair malformed JSON. Return only valid JSON preserving the same meaning. Do not add markdown.",
        },
        {
          role: "user",
          content: `Repair this JSON-like output into valid JSON:\n\n${rawText}`,
        },
      ],
    });
    return response.output_text.trim();
  } catch {
    return null;
  }
}

function normalizeFinalReportPayload(value: unknown): FinalResearchReport {
  const payload = (value ?? {}) as Partial<Record<keyof FinalResearchReport, unknown>>;
  return {
    executiveSummary: safeText(payload.executiveSummary),
    areaSpendingPower: safeText(payload.areaSpendingPower),
    populationProfile: safeText(payload.populationProfile),
    marketRangeSnapshot: safeText(payload.marketRangeSnapshot),
    immigrationInsights: safeStringArray(payload.immigrationInsights),
    ageRangeInsights: safeStringArray(payload.ageRangeInsights),
    professionalInsights: safeStringArray(payload.professionalInsights),
    similarBusinessInsights: safeStringArray(payload.similarBusinessInsights),
    pricingFitAssessment: safeText(payload.pricingFitAssessment),
    secondStoreRecommendation: safeText(payload.secondStoreRecommendation),
    marketingVerdict: safeText(payload.marketingVerdict),
    futureBusinessOutlook: safeText(payload.futureBusinessOutlook),
    recommendedMarketingPlays: safeStringArray(payload.recommendedMarketingPlays),
    marketingBenefits: safeStringArray(payload.marketingBenefits),
    risks: safeStringArray(payload.risks),
    nextActions: safeStringArray(payload.nextActions),
    evidenceSources: safeUrlArray(payload.evidenceSources),
  };
}

function safeText(value: unknown): string {
  if (typeof value === "string" && value.trim().length) {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    const flattened = value
      .map((entry) => (typeof entry === "string" ? entry.trim() : String(entry)))
      .filter((entry) => entry.length > 0)
      .join("; ");
    if (flattened.length) {
      return flattened;
    }
  }

  if (value && typeof value === "object") {
    try {
      const serialized = JSON.stringify(value);
      if (serialized.length > 2) {
        return serialized.slice(0, 400);
      }
    } catch {
      // Ignore and fallback below.
    }
  }

  return "Not enough structured output from agent for this field.";
}

function safeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    const cleaned = value
      .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
      .filter((entry) => entry.length > 0);
    if (cleaned.length) {
      return cleaned;
    }
  }

  if (typeof value === "string" && value.trim().length) {
    const split = value
      .split(/\n|;|•|-/g)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
    if (split.length) {
      return split;
    }
  }

  return [];
}

function safeUrlArray(value: unknown): string[] {
  const entries = safeStringArray(value);
  const urls = entries.filter((entry) => /^https?:\/\//i.test(entry));
  return urls;
}
