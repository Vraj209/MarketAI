import {
  BusinessOnboardingInput,
  businessOnboardingSchema,
} from "@/features/business/schemas/onboarding";
import { BusinessProfile } from "@/features/business/types/business-profile";
import { BusinessRepository } from "@/server/repositories/business-repository";
import { PrismaBusinessRepository } from "@/server/repositories/prisma-business-repository";

const defaultRepository: BusinessRepository = new PrismaBusinessRepository();

export class BusinessService {
  constructor(private readonly repository: BusinessRepository = defaultRepository) {}

  async saveOnboarding(
    workspaceId: string,
    input: BusinessOnboardingInput,
  ): Promise<BusinessProfile> {
    const parsed = businessOnboardingSchema.parse(input);
    return this.repository.upsertOnboardingProfile(workspaceId, parsed);
  }

  async getWorkspaceProfile(workspaceId: string): Promise<BusinessProfile | null> {
    return this.repository.getByWorkspaceId(workspaceId);
  }
}
