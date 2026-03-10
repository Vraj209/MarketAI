import { runMarketingStrategist } from "@/lib/ai/orchestration/marketing-strategist-orchestrator";
import { StrategistRequest } from "@/lib/ai/orchestration/types";

export async function executeMarketingStrategyWorkflow(request: StrategistRequest) {
  return runMarketingStrategist(request);
}
