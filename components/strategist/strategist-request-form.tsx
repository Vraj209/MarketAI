"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type StrategistResponse = {
  summary: string;
  recommendedCampaign: string;
  whyThisWorks: string[];
  channels: string[];
  suggestedAssets: string[];
  nextSteps: string[];
};

export function StrategistRequestForm() {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [result, setResult] = useState<StrategistResponse | null>(null);

  const runStrategist = async () => {
    setStatus("loading");
    setResult(null);

    const response = await fetch("/api/agent/strategize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    const data = (await response.json()) as { data: StrategistResponse };
    setResult(data.data);
    setStatus("idle");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ask the marketing strategist</CardTitle>
          <CardDescription>
            Describe your campaign challenge. The orchestrator classifies intent, assembles context, and returns structured output.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="I run a pizza shop in Toronto. What campaign should I run this month and which channels should I prioritize?"
            className="min-h-36"
          />
          <div className="flex items-center gap-3">
            <Button onClick={runStrategist} disabled={status === "loading" || prompt.length < 10}>
              {status === "loading" ? "Generating..." : "Generate strategy"}
            </Button>
            {status === "error" ? (
              <p className="text-sm text-[var(--error)]">Request failed. Please try again.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {result ? (
        <Card>
          <CardHeader>
            <CardTitle>Structured strategist output</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Section title="Summary" items={[result.summary]} />
            <Section title="Recommended campaign" items={[result.recommendedCampaign]} />
            <Section title="Why this works" items={result.whyThisWorks} />
            <Section title="Channels" items={result.channels} />
            <Section title="Suggested assets" items={result.suggestedAssets} />
            <Section title="Next steps" items={result.nextSteps} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

type SectionProps = {
  title: string;
  items: string[];
};

function Section({ title, items }: SectionProps) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--foreground)]">{title}</h3>
      <ul className="space-y-1 text-sm text-[var(--muted-foreground)]">
        {items.map((item) => (
          <li key={item} className="rounded-md bg-[var(--accent-soft)]/16 px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
