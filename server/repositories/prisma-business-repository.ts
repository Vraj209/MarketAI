import { BusinessProfile as PrismaBusinessProfile } from "@prisma/client";

import { BusinessOnboardingInput } from "@/features/business/schemas/onboarding";
import { BusinessProfile } from "@/features/business/types/business-profile";
import { getPrismaClient } from "@/lib/db/prisma";
import { BusinessRepository } from "@/server/repositories/business-repository";

function toDomain(profile: PrismaBusinessProfile): BusinessProfile {
  return {
    id: profile.id,
    workspaceId: profile.workspaceId,
    name: profile.name,
    category: profile.category,
    websiteUrl: profile.websiteUrl,
    location: profile.location,
    audience: profile.audience,
    lifecycle: profile.lifecycle,
    goals: profile.goals,
    brandVoice: profile.brandVoice,
    competitors: profile.competitors,
    challenges: profile.challenges,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export class PrismaBusinessRepository implements BusinessRepository {
  async upsertOnboardingProfile(
    workspaceId: string,
    input: BusinessOnboardingInput,
  ): Promise<BusinessProfile> {
    const prisma = getPrismaClient();

    await prisma.workspace.upsert({
      where: { id: workspaceId },
      update: {},
      create: {
        id: workspaceId,
        name: "Default Workspace",
        slug: workspaceId,
      },
    });

    const result = await prisma.businessProfile.upsert({
      where: { workspaceId },
      update: {
        ...input,
        websiteUrl: input.websiteUrl || null,
      },
      create: {
        workspaceId,
        ...input,
        websiteUrl: input.websiteUrl || null,
      },
    });

    return toDomain(result);
  }

  async getByWorkspaceId(workspaceId: string): Promise<BusinessProfile | null> {
    const prisma = getPrismaClient();
    const result = await prisma.businessProfile.findUnique({
      where: { workspaceId },
    });

    if (!result) {
      return null;
    }

    return toDomain(result);
  }
}
