import type {
  ModelEntry,
  ModelProvider,
  ModelCapability,
  RoutingStrategy,
  RouterConfig,
  RouteRequest,
  RouteResult,
} from "./types.js";
import { DEFAULT_REGISTRY, getModelById, getModelsByProvider, getModelsWithCapabilities } from "./registry.js";
import { applyStrategy, isSlmModel } from "./strategies.js";
import { estimateCost } from "./cost.js";

/**
 * ModelRouter - Multi-provider AI model router with 6 strategies,
 * sovereign profile filtering, and composite scoring.
 */
export class ModelRouter {
  private readonly registry: ModelEntry[];
  private readonly defaultStrategy: RoutingStrategy;
  private readonly maxCostPer1MInput?: number;
  private readonly requiredCapabilities?: ModelCapability[];
  private readonly preferredProvider?: ModelProvider;
  private readonly customRules: Map<string, string>;

  constructor(config: RouterConfig = {}) {
    this.registry = config.registry ?? [...DEFAULT_REGISTRY];
    this.defaultStrategy = config.strategy ?? "balanced";
    this.maxCostPer1MInput = config.maxCostPer1MInput;
    this.requiredCapabilities = config.requiredCapabilities;
    this.preferredProvider = config.preferredProvider;
    this.customRules = new Map();

    if (config.customRules) {
      for (const rule of config.customRules) {
        this.customRules.set(rule.category, rule.modelId);
      }
    }
  }

  /**
   * Route a request to the best model based on strategy and filters.
   */
  route(request: RouteRequest = {}): RouteResult {
    const strategy = request.strategy ?? this.defaultStrategy;

    // Check custom rules first
    if (strategy === "custom" || this.customRules.size > 0) {
      if (request.category) {
        const modelId = this.customRules.get(request.category);
        if (modelId) {
          const model = getModelById(this.registry, modelId);
          if (model) {
            return {
              model,
              score: 1.0,
              isSlm: isSlmModel(model),
            };
          }
        }
      }
    }

    // Build candidate list with filters
    let candidates = [...this.registry];

    // Sovereign filter: open-source only
    if (request.sovereignOnly) {
      candidates = candidates.filter((m) => m.isOpenSource === true);
    }

    // Capability filter (merge config + request)
    const requiredCaps = [
      ...(this.requiredCapabilities ?? []),
      ...(request.capabilities ?? []),
    ];
    if (requiredCaps.length > 0) {
      candidates = candidates.filter((m) =>
        requiredCaps.every((c) => m.capabilities.includes(c))
      );
    }

    // Cost ceiling filter (request overrides config)
    const maxCost = request.maxCostPer1MInput ?? this.maxCostPer1MInput;
    if (maxCost !== undefined) {
      candidates = candidates.filter((m) => m.inputCostPer1M <= maxCost);
    }

    // Preferred provider: move matching models to front (tiebreaker)
    if (this.preferredProvider) {
      const preferred = candidates.filter(
        (m) => m.provider === this.preferredProvider
      );
      const others = candidates.filter(
        (m) => m.provider !== this.preferredProvider
      );
      candidates = [...preferred, ...others];
    }

    if (candidates.length === 0) {
      throw new Error(
        "No models match the given constraints. " +
          "Check capabilities, cost ceiling, and sovereign filters."
      );
    }

    const { model, score } = applyStrategy(strategy, candidates);

    return {
      model,
      score,
      isSlm: isSlmModel(model),
    };
  }

  /**
   * Estimate cost in cents for a model and token counts.
   */
  estimateCost(modelId: string, inputTokens: number, outputTokens: number): number {
    const entry = getModelById(this.registry, modelId);
    return estimateCost(entry, inputTokens, outputTokens);
  }

  /** Get the full registry */
  getRegistry(): ModelEntry[] {
    return [...this.registry];
  }

  /** Look up a model by ID */
  getModelById(id: string): ModelEntry | undefined {
    return getModelById(this.registry, id);
  }

  /** Get all models from a specific provider */
  getModelsByProvider(provider: ModelProvider): ModelEntry[] {
    return getModelsByProvider(this.registry, provider);
  }

  /** Get all models with ALL specified capabilities */
  getModelsWithCapabilities(caps: ModelCapability[]): ModelEntry[] {
    return getModelsWithCapabilities(this.registry, caps);
  }
}

/**
 * Factory function - create a ModelRouter with the given config.
 */
export function createRouter(config?: RouterConfig): ModelRouter {
  return new ModelRouter(config);
}
