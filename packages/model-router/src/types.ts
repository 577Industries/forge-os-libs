/**
 * @577-industries/model-router - Type Definitions
 * Patent: "Adaptive Model Routing" (Feb 2026)
 */

/** Supported AI providers */
export type ModelProvider =
  | "anthropic"
  | "openai"
  | "google"
  | "groq"
  | "deepseek"
  | "mistral"
  | "together"
  | "fireworks"
  | "litellm";

/** Model capability tags */
export type ModelCapability =
  | "chat"
  | "tools"
  | "vision"
  | "analysis"
  | "code"
  | "edge";

/** Available routing strategies */
export type RoutingStrategy =
  | "cost"
  | "capability"
  | "speed"
  | "balanced"
  | "efficiency"
  | "custom";

/** A single model entry in the registry */
export interface ModelEntry {
  id: string;
  provider: ModelProvider;
  displayName: string;
  inputCostPer1M: number;
  outputCostPer1M: number;
  capabilities: ModelCapability[];
  latency: "fast" | "medium" | "slow";
  contextWindow: number;
  isDefault?: boolean;
  parameterSize?: string;
  isOpenSource?: boolean;
}

/** Router configuration */
export interface RouterConfig {
  /** Model registry to use (defaults to DEFAULT_REGISTRY) */
  registry?: ModelEntry[];
  /** Default routing strategy (defaults to "balanced") */
  strategy?: RoutingStrategy;
  /** Maximum input cost per 1M tokens - filters out models above this */
  maxCostPer1MInput?: number;
  /** Only consider models with ALL of these capabilities */
  requiredCapabilities?: ModelCapability[];
  /** Prefer models from this provider (used as a tiebreaker) */
  preferredProvider?: ModelProvider;
  /** Custom category-to-model routing rules */
  customRules?: CustomRoutingRule[];
}

/** A custom routing rule mapping a category to a specific model */
export interface CustomRoutingRule {
  /** Agent/task category */
  category: string;
  /** Specific model ID to use */
  modelId: string;
}

/** Per-request routing parameters */
export interface RouteRequest {
  /** Required capabilities for this request */
  capabilities?: ModelCapability[];
  /** Task category (for custom rules) */
  category?: string;
  /** Override strategy for this request */
  strategy?: RoutingStrategy;
  /** Override max cost for this request */
  maxCostPer1MInput?: number;
  /** Filter to open-source models only */
  sovereignOnly?: boolean;
}

/** Result of a routing decision */
export interface RouteResult {
  /** The selected model */
  model: ModelEntry;
  /** Composite score (strategy-dependent) */
  score: number;
  /** Whether this model is classified as an SLM */
  isSlm: boolean;
}
