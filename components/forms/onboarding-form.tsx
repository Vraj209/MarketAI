"use client";

import { ReactNode, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BusinessOnboardingInput,
  businessOnboardingSchema,
} from "@/features/business/schemas/onboarding";

type OnboardingFormProps = {
  defaultValues?: Partial<BusinessOnboardingInput>;
};

export function OnboardingForm({ defaultValues }: OnboardingFormProps) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const form = useForm<BusinessOnboardingInput>({
    resolver: zodResolver(businessOnboardingSchema),
    defaultValues: {
      name: "",
      category: "",
      websiteUrl: "",
      location: "",
      audience: "",
      lifecycle: "",
      goals: "",
      brandVoice: "",
      competitors: "",
      challenges: "",
      ...defaultValues,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    setStatus("saving");

    const response = await fetch("/api/onboarding", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    setStatus("saved");
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business onboarding</CardTitle>
        <CardDescription>
          Add detailed business context so every agent workflow is specific to your current stage,
          goals, competitors, and market position.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-8">
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <SectionTitle
              title="Business snapshot"
              description="Core business identity and current operating context."
              className="md:col-span-2"
            />
            <Field label="Business name" error={errors.name?.message}>
              <Input {...register("name")} placeholder="Acme Pizza" />
            </Field>
            <Field label="Category" error={errors.category?.message}>
              <Input {...register("category")} placeholder="Restaurant" />
            </Field>
            <Field label="Website URL" error={errors.websiteUrl?.message}>
              <Input {...register("websiteUrl")} placeholder="https://acmepizza.com" />
            </Field>
            <Field label="Primary location" error={errors.location?.message}>
              <Input {...register("location")} placeholder="Toronto, ON (Downtown core)" />
            </Field>
          </section>

          <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <SectionTitle
              title="Stage and planning"
              description="Where the business is today and what it plans to achieve next."
              className="md:col-span-2"
            />
            <Field
              label="Current business stage"
              hint="Examples: Early traction, Growth, Expansion, Mature."
              error={errors.lifecycle?.message}
            >
              <Input {...register("lifecycle")} placeholder="Growth stage with repeat customers" />
            </Field>
            <Field
              label="Brand voice"
              hint="How should marketing sound across channels?"
              error={errors.brandVoice?.message}
            >
              <Input {...register("brandVoice")} placeholder="Clear, trusted, and local-friendly" />
            </Field>
            <Field
              label="Current plan and goals"
              hint="Include short-term targets, campaign priorities, and timeline."
              error={errors.goals?.message}
              className="md:col-span-2"
            >
              <Textarea
                {...register("goals")}
                placeholder="Increase weekday evening orders by 20% in 90 days. Plan to run local offer + referral campaign."
              />
            </Field>
          </section>

          <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <SectionTitle
              title="Market context"
              description="Audience, competitors, and local market advantage assessment."
              className="md:col-span-2"
            />
            <div className="rounded-lg border border-[var(--border)] bg-[var(--accent-soft)]/16 px-3 py-3 text-sm text-[var(--muted-foreground)] md:col-span-2">
              Competitor intelligence and location advantage/disadvantage will be evaluated using
              Google Maps around your current area. You can still provide competitor names as seed
              input.
            </div>
            <Field
              label="Target audience profile"
              hint="Who buys, what they care about, and when they engage."
              error={errors.audience?.message}
              className="md:col-span-2"
            >
              <Textarea
                {...register("audience")}
                placeholder="Families nearby, office workers at lunch, and students looking for affordable combo meals."
              />
            </Field>
            <Field
              label="Top competitors (optional seed list)"
              hint="Leave blank if you want us to detect nearby competitors from Google Maps."
              error={errors.competitors?.message}
            >
              <Input
                {...register("competitors")}
                placeholder="Pizza Nova, Slice Hub, local food court options"
              />
            </Field>
            <Field
              label="Location details for map-based analysis"
              hint="Add full address or area details so we can evaluate local advantage/disadvantage against nearby competitors."
              error={errors.challenges?.message}
            >
              <Input
                {...register("challenges")}
                placeholder="Near Union Station, strong lunch traffic, weaker evening visibility, limited parking"
              />
            </Field>
          </section>

          <div className="md:col-span-2 flex items-center gap-3">
            <Button type="submit" disabled={status === "saving"}>
              {status === "saving" ? "Saving..." : "Save onboarding"}
            </Button>
            {status === "saved" ? (
              <p className="text-sm text-[var(--success)]">Saved successfully.</p>
            ) : null}
            {status === "error" ? (
              <p className="text-sm text-[var(--error)]">Unable to save. Please retry.</p>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
};

function Field({ label, hint, error, className, children }: FieldProps) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">{label}</label>
      {hint ? <p className="mb-2 text-xs text-[var(--muted-foreground)]">{hint}</p> : null}
      {children}
      {error ? <p className="mt-1 text-xs text-[var(--error)]">{error}</p> : null}
    </div>
  );
}

type SectionTitleProps = {
  title: string;
  description: string;
  className?: string;
};

function SectionTitle({ title, description, className }: SectionTitleProps) {
  return (
    <div className={className}>
      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
        {title}
      </h3>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{description}</p>
    </div>
  );
}
