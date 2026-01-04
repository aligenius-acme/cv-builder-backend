import { prisma } from './prisma';

interface AIUsageData {
  userId: string;
  organizationId?: string;
  operation: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  durationMs: number;
  success?: boolean;
  errorMessage?: string;
}

// Cost per 1M tokens (approximate)
const COST_PER_MILLION_TOKENS: Record<string, { input: number; output: number }> = {
  'llama-3.3-70b-versatile': { input: 0.59, output: 0.79 },
  'llama-3.1-70b-versatile': { input: 0.59, output: 0.79 },
  'llama-3.1-8b-instant': { input: 0.05, output: 0.08 },
  'mixtral-8x7b-32768': { input: 0.24, output: 0.24 },
  'gemma2-9b-it': { input: 0.20, output: 0.20 },
  default: { input: 0.50, output: 0.50 },
};

function calculateCost(model: string, promptTokens: number, completionTokens: number): number {
  const rates = COST_PER_MILLION_TOKENS[model] || COST_PER_MILLION_TOKENS.default;
  const inputCost = (promptTokens / 1_000_000) * rates.input;
  const outputCost = (completionTokens / 1_000_000) * rates.output;
  return inputCost + outputCost;
}

export async function logAIUsage(data: AIUsageData): Promise<void> {
  try {
    const estimatedCost = calculateCost(data.model, data.promptTokens, data.completionTokens);

    await prisma.aIUsageLog.create({
      data: {
        userId: data.userId,
        organizationId: data.organizationId,
        operation: data.operation,
        provider: data.provider,
        model: data.model,
        promptTokens: data.promptTokens,
        completionTokens: data.completionTokens,
        totalTokens: data.totalTokens,
        estimatedCost,
        durationMs: data.durationMs,
        success: data.success ?? true,
        errorMessage: data.errorMessage,
      },
    });
  } catch (error) {
    // Log error but don't throw - AI usage logging shouldn't break the main flow
    console.error('Failed to log AI usage:', error);
  }
}
