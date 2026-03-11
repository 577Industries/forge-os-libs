import type { ModelEntry } from "./types.js";

/**
 * Estimate cost in cents for a given model and token counts.
 * Falls back to Sonnet-level pricing if model is not found.
 */
export function estimateCost(
  entry: ModelEntry | undefined,
  inputTokens: number,
  outputTokens: number
): number {
  if (!entry) {
    // Fallback to Sonnet-level pricing: $3/1M input, $15/1M output
    return (inputTokens / 1_000_000) * 300 + (outputTokens / 1_000_000) * 1500;
  }
  const inputCostCents = entry.inputCostPer1M * 100;
  const outputCostCents = entry.outputCostPer1M * 100;
  return (inputTokens / 1_000_000) * inputCostCents + (outputTokens / 1_000_000) * outputCostCents;
}
