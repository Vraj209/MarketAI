import { BusinessOnboardingInput } from "@/features/business/schemas/onboarding";
import { BusinessProfile } from "@/features/business/types/business-profile";

export interface BusinessRepository {
  upsertOnboardingProfile(
    workspaceId: string,
    input: BusinessOnboardingInput,
  ): Promise<BusinessProfile>;
  getByWorkspaceId(workspaceId: string): Promise<BusinessProfile | null>;
}
