import { BusinessService } from "@/features/business/server/business-service";
import { AssembledContext } from "@/lib/ai/orchestration/types";

const businessService = new BusinessService();

export async function assembleStrategistContext(
  workspaceId: string,
  prompt: string,
): Promise<AssembledContext> {
  const businessProfile = await businessService.getWorkspaceProfile(workspaceId);

  return {
    businessProfile,
    normalizedPrompt: prompt.trim(),
  };
}
