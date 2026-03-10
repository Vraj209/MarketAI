import { PageHeader } from "@/components/app/page-header";
import { OnboardingForm } from "@/components/forms/onboarding-form";

export default function OnboardingPage() {
  return (
    <>
      <PageHeader
        title="Onboarding"
        description="Build a complete business profile: current stage, planning direction, audience, and location. Competitors and location advantage are evaluated from your local area using map-based analysis."
      />
      <OnboardingForm />
    </>
  );
}
