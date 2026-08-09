import type { ModelEntry, ModelProvider, ModelCapability } from "./types.js";

/**
 * Default model registry - 14 models across 9 providers.
 * Pricing and capabilities current as of Feb 2026.
 */
export const DEFAULT_REGISTRY: ModelEntry[] = [
  {
    id: "claude-sonnet-4-20250514",
    provider: "anthropic",
    displayName: "Claude Sonnet 4",
    inputCostPer1M: 3,
    outputCostPer1M: 15,
    capabilities: ["chat", "tools", "vision", "analysis"],
    latency: "medium",
    contextWindow: 200_000,
    isDefault: true,
  },
  {
    id: "claude-haiku-4-20250506",
    provider: "anthropic",
    displayName: "Claude Haiku 4",
    inputCostPer1M: 0.8,
    outputCostPer1M: 4,
    capabilities: ["chat", "tools"],
    latency: "fast",
    contextWindow: 200_000,
  },
  {
    id: "claude-opus-4-20250514",
    provider: "anthropic",
    displayName: "Claude Opus 4",
    inputCostPer1M: 15,
    outputCostPer1M: 75,
    capabilities: ["chat", "tools", "vision", "analysis", "code"],
    latency: "slow",
    contextWindow: 200_000,
  },
  {
    id: "gpt-4o",
    provider: "openai",
    displayName: "GPT-4o",
    inputCostPer1M: 2.5,
    outputCostPer1M: 10,
    capabilities: ["chat", "tools", "vision", "code"],
    latency: "medium",
    contextWindow: 128_000,
  },
  {
    id: "gpt-4o-mini",
    provider: "openai",
    displayName: "GPT-4o Mini",
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.6,
    capabilities: ["chat", "tools"],
    latency: "fast",
    contextWindow: 128_000,
  },
  {
    id: "gemini-2.0-flash",
    provider: "google",
    displayName: "Gemini 2.0 Flash",
    inputCostPer1M: 0.1,
    outputCostPer1M: 0.4,
    capabilities: ["chat", "tools", "vision"],
    latency: "fast",
    contextWindow: 1_000_000,
  },
  {
    id: "gemini-2.5-pro",
    provider: "google",
    displayName: "Gemini 2.5 Pro",
    inputCostPer1M: 1.25,
    outputCostPer1M: 10,
    capabilities: ["chat", "tools", "vision", "analysis"],
    latency: "medium",
    contextWindow: 1_000_000,
  },
  {
    id: "llama-3.3-70b-versatile",
    provider: "groq",
    displayName: "Llama 3.3 70B",
    inputCostPer1M: 0.59,
    outputCostPer1M: 0.79,
    capabilities: ["chat", "tools"],
    latency: "fast",
    contextWindow: 128_000,
    parameterSize: "70B",
    isOpenSource: true,
  },
  {
    id: "deepseek-chat",
    provider: "deepseek",
    displayName: "DeepSeek V3",
    inputCostPer1M: 0.27,
    outputCostPer1M: 1.1,
    capabilities: ["chat", "tools", "code"],
    latency: "fast",
    contextWindow: 64_000,
    isOpenSource: true,
  },
  {
    id: "mistral-large-latest",
    provider: "mistral",
    displayName: "Mistral Large",
    inputCostPer1M: 2,
    outputCostPer1M: 6,
    capabilities: ["chat", "tools", "code"],
    latency: "medium",
    contextWindow: 128_000,
    isOpenSource: true,
  },
  {
    id: "mistral-small-latest",
    provider: "mistral",
    displayName: "Mistral Small",
    inputCostPer1M: 0.1,
    outputCostPer1M: 0.3,
    capabilities: ["chat", "tools", "edge"],
    latency: "fast",
    contextWindow: 32_000,
    parameterSize: "22B",
    isOpenSource: true,
  },
  {
    id: "llama-3.1-8b-instant",
    provider: "groq",
    displayName: "Llama 3.1 8B",
    inputCostPer1M: 0.05,
    outputCostPer1M: 0.08,
    capabilities: ["chat", "tools", "edge"],
    latency: "fast",
    contextWindow: 131_072,
    parameterSize: "8B",
    isOpenSource: true,
  },
  {
    id: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
    provider: "together",
    displayName: "Llama 3.1 8B (Together)",
    inputCostPer1M: 0.18,
    outputCostPer1M: 0.18,
    capabilities: ["chat", "tools", "edge"],
    latency: "fast",
    contextWindow: 131_072,
    parameterSize: "8B",
    isOpenSource: true,
  },
  {
    id: "accounts/fireworks/models/llama-v3p1-8b-instruct",
    provider: "fireworks",
    displayName: "Llama 3.1 8B (Fireworks)",
    inputCostPer1M: 0.2,
    outputCostPer1M: 0.2,
    capabilities: ["chat", "tools", "edge"],
    latency: "fast",
    contextWindow: 131_072,
    parameterSize: "8B",
    isOpenSource: true,
  },
];

/** Look up a model by its ID */
export function getModelById(
  registry: ModelEntry[],
  id: string
): ModelEntry | undefined {
  return registry.find((m) => m.id === id);
}

/** Get all models from a specific provider */
export function getModelsByProvider(
  registry: ModelEntry[],
  provider: ModelProvider
): ModelEntry[] {
  return registry.filter((m) => m.provider === provider);
}

/** Get all models that have ALL of the specified capabilities */
export function getModelsWithCapabilities(
  registry: ModelEntry[],
  caps: ModelCapability[]
): ModelEntry[] {
  return registry.filter((m) =>
    caps.every((c) => m.capabilities.includes(c))
  );
}
