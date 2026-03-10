import { randomUUID } from "crypto";
import { classifyMarketingIntent } from "@/lib/ai/orchestration/intent-classifier";
import { assembleStrategistContext } from "@/lib/ai/orchestration/context-assembler";
import { OrchestratorResult, StrategistRequest } from "@/lib/ai/orchestration/types";
import { formatStrategyOutput } from "@/lib/ai/formatters/strategy-formatter";
import { executeIntentTool } from "@/lib/ai/tools/tool-registry";
import { strategyOutputSchema } from "@/lib/ai/schemas/strategy-output";

export async function runMarketingStrategist(
  request: StrategistRequest,
): Promise<OrchestratorResult> {
  const traceId = randomUUID();

  const intent = classifyMarketingIntent(request.prompt);
  const context = await assembleStrategistContext(request.workspaceId, request.prompt);
  const toolOutput = await executeIntentTool(intent, context);
  const formatted = formatStrategyOutput(intent, context);
  const response = strategyOutputSchema.parse(formatted);

  return {
    intent,
    traceId,
    context,
    toolOutputs: [toolOutput],
    response,
  };
}
