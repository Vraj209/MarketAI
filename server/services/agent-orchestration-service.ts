import { StrategistRequest } from "@/lib/ai/orchestration/types";
import { executeMarketingStrategyWorkflow } from "@/server/workflows/marketing-strategy-workflow";

export class AgentOrchestrationService {
  async runStrategist(request: StrategistRequest) {
    return executeMarketingStrategyWorkflow(request);
  }
}
