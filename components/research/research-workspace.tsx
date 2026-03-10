"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Lightbulb, MapPinned, Search, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

type ResearchMode = "map" | "keyword-trends";

type StrategistResponse = {
  summary: string;
  recommendedCampaign: string;
  whyThisWorks: string[];
  channels: string[];
  suggestedAssets: string[];
  nextSteps: string[];
};

type PipelineResponse = {
  businesses: Array<{
    businessName: string;
    businessType: string;
    products: string;
    pricing: string;
    openingTimes: string;
    estimatedCustomerCount: string;
    website?: string;
    address: string;
    distanceKm: number;
  }>;
  csvBase64: string;
  csvFilename: string;
  websiteInsights: Array<{
    website: string;
    positioning: string;
    offerHighlights: string[];
    targetAudienceSignals: string[];
  }>;
  finalReport: {
    executiveSummary: string;
    areaSpendingPower: string;
    populationProfile: string;
    marketRangeSnapshot: string;
    immigrationInsights: string[];
    ageRangeInsights: string[];
    professionalInsights: string[];
    similarBusinessInsights: string[];
    pricingFitAssessment: string;
    secondStoreRecommendation: string;
    marketingVerdict: string;
    futureBusinessOutlook: string;
    recommendedMarketingPlays: string[];
    marketingBenefits: string[];
    risks: string[];
    nextActions: string[];
    evidenceSources: string[];
  };
};

const modes: Array<{
  id: ResearchMode;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: "map",
    label: "Map",
    description:
      "Evaluate local spending level, pricing fit, and where a second store can perform best.",
    icon: MapPinned,
  },
  {
    id: "keyword-trends",
    label: "Product keyword trends",
    description:
      "Analyze what products and keyword clusters are rising, stable, or declining in your market.",
    icon: Search,
  },
];

export function ResearchWorkspace() {
  const [mode, setMode] = useState<ResearchMode>("map");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [result, setResult] = useState<StrategistResponse | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<"idle" | "loading" | "error">("idle");
  const [pipelineResult, setPipelineResult] = useState<PipelineResponse | null>(null);
  const [pipelineErrorMessage, setPipelineErrorMessage] = useState<string | null>(null);

  const [mapInputs, setMapInputs] = useState({
    businessType: "",
    currentArea: "",
    currentPriceRange: "",
    notes: "",
    radiusKm: 5,
  });

  const [trendInputs, setTrendInputs] = useState({
    productKeywords: "",
    marketArea: "",
    timeframe: "last 90 days",
    productContext: "",
  });

  const canRun = useMemo(() => {
    if (mode === "map") {
      return (
        mapInputs.businessType.trim().length > 1 &&
        mapInputs.currentArea.trim().length > 1 &&
        mapInputs.currentPriceRange.trim().length > 1
      );
    }

    return (
      trendInputs.productKeywords.trim().length > 2 &&
      trendInputs.marketArea.trim().length > 1
    );
  }, [mapInputs, mode, trendInputs]);

  const mapEmbedUrl = useMemo(() => {
    const businessType = mapInputs.businessType.trim() || "business";
    const area = mapInputs.currentArea.trim() || "Toronto";
    const query = `${businessType} near ${area} within ${mapInputs.radiusKm} km`;
    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  }, [mapInputs.businessType, mapInputs.currentArea, mapInputs.radiusKm]);

  const runResearch = async () => {
    if (!canRun) {
      return;
    }

    setStatus("loading");
    setResult(null);

    const prompt =
      mode === "map"
        ? [
            "Market research mode: MAP.",
            `Business type: ${mapInputs.businessType}.`,
            `Current area: ${mapInputs.currentArea}.`,
            `Research radius: ${mapInputs.radiusKm} km (0 to 15 km).`,
            `Current product price range: ${mapInputs.currentPriceRange}.`,
            `Additional notes: ${mapInputs.notes || "none"}.`,
            "Use map-oriented reasoning: identify similar businesses in range, estimate local spending level, evaluate whether current pricing fits area demand, and recommend best area profile for a second store.",
          ].join(" ")
        : [
            "Market research mode: PRODUCT KEYWORD TRENDS.",
            `Product keywords: ${trendInputs.productKeywords}.`,
            `Market area: ${trendInputs.marketArea}.`,
            `Timeframe: ${trendInputs.timeframe}.`,
            `Product context: ${trendInputs.productContext || "none"}.`,
            "Return trend direction and practical product opportunities based on keyword demand signals.",
          ].join(" ");

    const response = await fetch("/api/agent/strategize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    const payload = (await response.json()) as { data: StrategistResponse };
    setResult(payload.data);
    setStatus("idle");
  };

  const runDeepPipeline = async () => {
    if (!canRun || mode !== "map") {
      return;
    }

    setPipelineStatus("loading");
    setPipelineResult(null);
    setPipelineErrorMessage(null);

    const response = await fetch("/api/research/pipeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessType: mapInputs.businessType,
        currentArea: mapInputs.currentArea,
        radiusKm: mapInputs.radiusKm,
        currentPriceRange: mapInputs.currentPriceRange,
        notes: mapInputs.notes,
      }),
    });

    if (!response.ok) {
      let message = "Deep pipeline failed. Check API key and retry.";
      try {
        const payload = (await response.json()) as { error?: string };
        if (payload.error) {
          message = payload.error;
        }
      } catch {
        // Keep default message.
      }
      setPipelineErrorMessage(message);
      setPipelineStatus("error");
      return;
    }

    const payload = (await response.json()) as { data: PipelineResponse };
    setPipelineResult(payload.data);
    setPipelineErrorMessage(null);
    setPipelineStatus("idle");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Market research</CardTitle>
          <CardDescription>
            Choose one research mode and run agent analysis tailored to your local business context.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 md:grid-cols-2">
            {modes.map((option) => {
              const Icon = option.icon;
              const isActive = mode === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setMode(option.id);
                    setStatus("idle");
                    setResult(null);
                    setPipelineStatus("idle");
                    setPipelineResult(null);
                    setPipelineErrorMessage(null);
                  }}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-colors",
                    isActive
                      ? "border-[var(--border)] bg-[var(--accent-soft)]/24"
                      : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--accent-soft)]/14",
                  )}
                >
                  <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">{option.description}</p>
                </button>
              );
            })}
          </div>

          {mode === "map" ? (
            <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Local market map</CardTitle>
                  <CardDescription>
                    Explore your current area and nearby business clusters for spend-level and
                    expansion analysis.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Showing:{" "}
                      <span className="font-medium text-[var(--foreground)]">
                        {mapInputs.businessType || "Business type"}
                      </span>{" "}
                      near{" "}
                      <span className="font-medium text-[var(--foreground)]">
                        {mapInputs.currentArea || "Location"}
                      </span>{" "}
                      within{" "}
                      <span className="font-medium text-[var(--foreground)]">
                        {mapInputs.radiusKm} km
                      </span>
                    </p>
                  </div>
                  <iframe
                    title="Business area map"
                    src={mapEmbedUrl}
                    className="h-[360px] w-full rounded-md border border-[var(--border)]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Tip: Enter a precise location (street, neighborhood, or city zone) for better
                    competitor and second-store area recommendations.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[0, 3, 5, 10, 15].map((range) => (
                      <button
                        key={range}
                        type="button"
                        onClick={() =>
                          setMapInputs((previous) => ({ ...previous, radiusKm: range }))
                        }
                        className={cn(
                          "rounded-md border px-2 py-1 text-xs transition-colors",
                          mapInputs.radiusKm === range
                            ? "border-[var(--border)] bg-[var(--accent-soft)]/35 text-[var(--foreground)]"
                            : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)] hover:bg-[var(--accent-soft)]/16",
                        )}
                      >
                        {range} km
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Research agent</CardTitle>
                  <CardDescription>
                    Provide local business details and run map-based research analysis.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Field label="Business type">
                    <Input
                      value={mapInputs.businessType}
                      onChange={(event) =>
                        setMapInputs((previous) => ({
                          ...previous,
                          businessType: event.target.value,
                        }))
                      }
                      placeholder="Cafe, salon, gym, clinic"
                    />
                  </Field>
                  <Field label="Current area / location">
                    <Input
                      value={mapInputs.currentArea}
                      onChange={(event) =>
                        setMapInputs((previous) => ({
                          ...previous,
                          currentArea: event.target.value,
                        }))
                      }
                      placeholder="Downtown Toronto near Union Station"
                    />
                  </Field>
                  <Field label={`Kilometer range (0-15 km): ${mapInputs.radiusKm} km`}>
                    <input
                      type="range"
                      min={0}
                      max={15}
                      step={1}
                      value={mapInputs.radiusKm}
                      onChange={(event) =>
                        setMapInputs((previous) => ({
                          ...previous,
                          radiusKm: Number(event.target.value),
                        }))
                      }
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[var(--accent-soft)]/40"
                    />
                  </Field>
                  <Field label="Current product pricing">
                    <Input
                      value={mapInputs.currentPriceRange}
                      onChange={(event) =>
                        setMapInputs((previous) => ({
                          ...previous,
                          currentPriceRange: event.target.value,
                        }))
                      }
                      placeholder="$8-$20 average order value"
                    />
                  </Field>
                  <Field label="Planning notes (optional)">
                    <Input
                      value={mapInputs.notes}
                      onChange={(event) =>
                        setMapInputs((previous) => ({ ...previous, notes: event.target.value }))
                      }
                      placeholder="Second store target in next 6 months"
                    />
                  </Field>
                  <div className="flex items-center gap-3">
                    <Button onClick={runResearch} disabled={!canRun || status === "loading"}>
                      {status === "loading" ? "Running research..." : "Run map research"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={runDeepPipeline}
                      disabled={!canRun || pipelineStatus === "loading"}
                    >
                      {pipelineStatus === "loading"
                        ? "Running deep pipeline..."
                        : "Run deep research pipeline"}
                    </Button>
                    {status === "error" ? (
                      <p className="text-sm text-[var(--error)]">Unable to run research. Please retry.</p>
                    ) : null}
                    {pipelineStatus === "error" ? (
                      <p className="text-sm text-[var(--error)]">
                        {pipelineErrorMessage ?? "Deep pipeline failed. Check API key and retry."}
                      </p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Product keywords">
                <Input
                  value={trendInputs.productKeywords}
                  onChange={(event) =>
                    setTrendInputs((previous) => ({
                      ...previous,
                      productKeywords: event.target.value,
                    }))
                  }
                  placeholder="protein bowl, low carb lunch, vegan wrap"
                />
              </Field>
              <Field label="Market area">
                <Input
                  value={trendInputs.marketArea}
                  onChange={(event) =>
                    setTrendInputs((previous) => ({ ...previous, marketArea: event.target.value }))
                  }
                  placeholder="Toronto GTA"
                />
              </Field>
              <Field label="Timeframe">
                <Input
                  value={trendInputs.timeframe}
                  onChange={(event) =>
                    setTrendInputs((previous) => ({ ...previous, timeframe: event.target.value }))
                  }
                  placeholder="last 90 days"
                />
              </Field>
              <Field label="Product context (optional)">
                <Input
                  value={trendInputs.productContext}
                  onChange={(event) =>
                    setTrendInputs((previous) => ({
                      ...previous,
                      productContext: event.target.value,
                    }))
                  }
                  placeholder="mid-market takeaway brand"
                />
              </Field>
            </div>
          )}

          {mode === "keyword-trends" ? (
            <div className="flex items-center gap-3">
              <Button onClick={runResearch} disabled={!canRun || status === "loading"}>
                {status === "loading" ? "Running research..." : "Run market research"}
              </Button>
              {status === "error" ? (
                <p className="text-sm text-[var(--error)]">Unable to run research. Please retry.</p>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {result ? (
        <Card>
          <CardHeader>
            <CardTitle>{mode === "map" ? "Map research result" : "Keyword trend result"}</CardTitle>
            <CardDescription>
              Structured output from the marketing research agent workflow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[var(--foreground)]">
            <ResultRow label="Research summary" value={result.summary} />
            <ResultRow
              label={mode === "map" ? "Area recommendation" : "Trend recommendation"}
              value={result.recommendedCampaign}
            />
            <ResultList
              label={
                mode === "map"
                  ? "Similar business intelligence"
                  : "Product and keyword opportunity logic"
              }
              items={result.whyThisWorks}
            />
            <ResultList
              label={
                mode === "map"
                  ? "Spending power and population signals"
                  : "Current trend direction"
              }
              items={result.channels}
            />
            <ResultList
              label={
                mode === "map"
                  ? "Market fit and second-store guidance"
                  : "Product execution direction"
              }
              items={result.suggestedAssets}
            />
            <ResultList label="Deep research next steps" items={result.nextSteps} />
          </CardContent>
        </Card>
      ) : null}

      {pipelineResult ? (
        <Card>
          <CardHeader>
            <CardTitle>Deep research pipeline output</CardTitle>
            <CardDescription>
              Business-list agent, spreadsheet agent, website research agent, and final synthesis
              agent output.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-[var(--foreground)]">
            <div className="flex items-center gap-3">
              <Button asChild>
                <a
                  href={`data:text/csv;base64,${pipelineResult.csvBase64}`}
                  download={pipelineResult.csvFilename}
                >
                  Download Excel-compatible sheet
                </a>
              </Button>
              <p className="text-xs text-[var(--muted-foreground)]">
                {pipelineResult.businesses.length} businesses discovered
              </p>
            </div>

            <div className="grid gap-3 lg:grid-cols-[1.45fr_1fr]">
              <ResultPanel label="Executive summary">
                <p>{pipelineResult.finalReport.executiveSummary}</p>
              </ResultPanel>
              <ResultPanel label="Marketing verdict">
                <div className="flex items-start gap-2">
                  <Target className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
                  <p>{pipelineResult.finalReport.marketingVerdict}</p>
                </div>
              </ResultPanel>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <ResultPanel label="Current market range snapshot" compact>
                <p>{pipelineResult.finalReport.marketRangeSnapshot}</p>
              </ResultPanel>
              <ResultPanel label="Area spending power" compact>
                <p>{pipelineResult.finalReport.areaSpendingPower}</p>
              </ResultPanel>
              <ResultPanel label="Population profile" compact>
                <p>{pipelineResult.finalReport.populationProfile}</p>
              </ResultPanel>
              <ResultPanel label="Pricing fit assessment" compact>
                <p>{pipelineResult.finalReport.pricingFitAssessment}</p>
              </ResultPanel>
              <ResultPanel label="Second-store recommendation" compact>
                <p>{pipelineResult.finalReport.secondStoreRecommendation}</p>
              </ResultPanel>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              <ResultListCard
                label="Immigration insights"
                items={pipelineResult.finalReport.immigrationInsights}
                icon={<MapPinned className="h-4 w-4 text-[var(--accent)]" />}
              />
              <ResultListCard
                label="Age range insights"
                items={pipelineResult.finalReport.ageRangeInsights}
                icon={<Lightbulb className="h-4 w-4 text-[var(--accent)]" />}
              />
              <ResultListCard
                label="Professional segments"
                items={pipelineResult.finalReport.professionalInsights}
                icon={<Target className="h-4 w-4 text-[var(--accent)]" />}
              />
            </div>

            <ResultPanel label="Future business outlook">
              <p>{pipelineResult.finalReport.futureBusinessOutlook}</p>
            </ResultPanel>

            <div className="grid gap-3 lg:grid-cols-3">
              <ResultListCard
                label="Similar business insights"
                items={pipelineResult.finalReport.similarBusinessInsights}
                icon={<Lightbulb className="h-4 w-4 text-[var(--accent)]" />}
              />
              <ResultListCard
                label="Recommended marketing plays"
                items={pipelineResult.finalReport.recommendedMarketingPlays}
                icon={<Target className="h-4 w-4 text-[var(--accent)]" />}
              />
              <ResultListCard
                label="Marketing benefits"
                items={pipelineResult.finalReport.marketingBenefits}
                icon={<CheckCircle2 className="h-4 w-4 text-[var(--success)]" />}
              />
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <ResultListCard
                label="Risks"
                items={pipelineResult.finalReport.risks}
                icon={<AlertTriangle className="h-4 w-4 text-[var(--error)]" />}
              />
              <ResultListCard
                label="Next actions"
                items={pipelineResult.finalReport.nextActions}
                icon={<CheckCircle2 className="h-4 w-4 text-[var(--success)]" />}
              />
            </div>

            <ResultPanel label="Evidence sources">
              <ul className="space-y-2">
                {pipelineResult.finalReport.evidenceSources.map((source) => (
                  <li key={source}>
                    <a
                      href={source}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--accent)] underline underline-offset-2"
                    >
                      {source}
                    </a>
                  </li>
                ))}
              </ul>
            </ResultPanel>

            <ResultPanel label="Top discovered businesses">
              <ul className="grid gap-2 md:grid-cols-2">
                {pipelineResult.businesses.slice(0, 6).map((business) => (
                  <li
                    key={`${business.businessName}-${business.address}`}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                  >
                    <p className="font-medium">{business.businessName}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {business.address} - {business.distanceKm} km
                    </p>
                  </li>
                ))}
              </ul>
            </ResultPanel>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">{label}</label>
      {children}
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[var(--accent-soft)]/16 px-3 py-2">
      <span className="font-semibold">{label}:</span> {value}
    </div>
  );
}

function ResultList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
        {label}
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={`${label}-${item}`} className="rounded-md bg-[var(--accent-soft)]/16 px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResultPanel({
  label,
  children,
  compact = false,
}: {
  label: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--border)] bg-[var(--accent-soft)]/14",
        compact ? "px-3 py-3" : "px-4 py-4",
      )}
    >
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
        {label}
      </p>
      <div className="leading-relaxed text-[var(--foreground)]">{children}</div>
    </div>
  );
}

function ResultListCard({
  label,
  items,
  icon,
}: {
  label: string;
  items: string[];
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-3">
      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
        {icon}
        {label}
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={`${label}-${item}`}
            className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
