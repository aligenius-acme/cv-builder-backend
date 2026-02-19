import OpenAI from 'openai';
import config from '../config';
import { prisma } from './prisma';
import { AIServiceError } from './errors';

// Initialize OpenAI client
const openai = config.ai.openaiApiKey ? new OpenAI({ apiKey: config.ai.openaiApiKey }) : null;

export interface AICompletionOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface AICompletionResult<T = unknown> {
  data: T;
  rawContent: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  durationMs: number;
}

export interface UsageLogParams {
  userId: string;
  organizationId?: string | null;
  operation: string;
}

/**
 * Execute an AI completion and return the raw content
 */
export async function executeCompletion(
  options: AICompletionOptions
): Promise<{ content: string; usage: AICompletionResult['usage']; durationMs: number }> {
  if (!openai) {
    throw new AIServiceError('AI service not configured');
  }

  const startTime = Date.now();

  const completion = await openai.chat.completions.create({
    model: options.model || config.ai.openaiModel,
    messages: [
      { role: 'system', content: options.systemPrompt },
      { role: 'user', content: options.userPrompt },
    ],
    temperature: options.temperature ?? 0.5,
    max_tokens: options.maxTokens ?? 2000,
  });

  const durationMs = Date.now() - startTime;
  const content = completion.choices[0]?.message?.content || '';

  return {
    content,
    usage: {
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      totalTokens: completion.usage?.total_tokens || 0,
    },
    durationMs,
  };
}

/**
 * Execute an AI completion and parse the response as JSON object
 */
export async function executeJsonCompletion<T = Record<string, unknown>>(
  options: AICompletionOptions,
  usageLog?: UsageLogParams
): Promise<AICompletionResult<T>> {
  const { content, usage, durationMs } = await executeCompletion(options);

  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new AIServiceError('Failed to parse AI response as JSON object');
  }

  let data: T;
  try {
    data = JSON.parse(jsonMatch[0]) as T;
  } catch {
    throw new AIServiceError('Invalid JSON in AI response');
  }

  // Log usage if params provided
  if (usageLog) {
    await logAIUsage(usageLog, usage, options.model, true);
  }

  return { data, rawContent: content, usage, durationMs };
}

/**
 * Execute an AI completion and parse the response as JSON array
 */
export async function executeJsonArrayCompletion<T = unknown>(
  options: AICompletionOptions,
  usageLog?: UsageLogParams
): Promise<AICompletionResult<T[]>> {
  const { content, usage, durationMs } = await executeCompletion(options);

  // Extract JSON array from response
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    // Return empty array if no valid JSON found
    if (usageLog) {
      await logAIUsage(usageLog, usage, options.model, true);
    }
    return { data: [] as T[], rawContent: content, usage, durationMs };
  }

  let data: T[];
  try {
    data = JSON.parse(jsonMatch[0]) as T[];
  } catch {
    data = [] as T[];
  }

  // Log usage if params provided
  if (usageLog) {
    await logAIUsage(usageLog, usage, options.model, true);
  }

  return { data, rawContent: content, usage, durationMs };
}

/**
 * Log AI usage to the database
 */
export async function logAIUsage(
  params: UsageLogParams,
  usage: AICompletionResult['usage'],
  model?: string,
  success: boolean = true,
  errorMessage?: string
): Promise<void> {
  // Estimate cost based on GPT-4o-mini pricing ($0.15/M input, $0.60/M output)
  const costPerInputToken = 0.00000015;
  const costPerOutputToken = 0.0000006;
  const estimatedCost =
    usage.promptTokens * costPerInputToken + usage.completionTokens * costPerOutputToken;

  await prisma.aIUsageLog.create({
    data: {
      userId: params.userId,
      organizationId: params.organizationId,
      operation: params.operation,
      provider: 'openai',
      model: model || config.ai.openaiModel,
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      totalTokens: usage.totalTokens,
      estimatedCost,
      durationMs: 0,
      success,
      errorMessage,
    },
  });
}

/**
 * Check if AI service is available
 */
export function isAIAvailable(): boolean {
  return !!openai;
}

/**
 * Get the configured AI model
 */
export function getAIModel(): string {
  return config.ai.openaiModel;
}
