import type { ModelEntry, RoutingStrategy } from "./types.js";

/** SLM classification threshold */
const SLM_COST_THRESHOLD = 0.5;

/** Classify whether a model is a Small Language Model */
export function isSlmModel(entry: ModelEntry): boolean {
  return (
    entry.inputCostPer1M <= SLM_COST_THRESHOLD ||
    entry.parameterSize === "8B" ||
    entry.parameterSize === "22B"
  );
}

/** Strategy: Cost - cheapest model */
export function selectCheapest(candidates: ModelEntry[]): { model: ModelEntry; score: number } {
  const model = candidates.reduce((best, m) =>
    m.inputCostPer1M < best.inputCostPer1M ? m : best
  );
  const maxCost = Math.max(...candidates.map((m) => m.inputCostPer1M));
  const score = maxCost > 0 ? 1 - model.inputCostPer1M / maxCost : 1;
  return { model, score };
}

/** Strategy: Capability - most capable model */
export function selectMostCapable(candidates: ModelEntry[]): { model: ModelEntry; score: number } {
  const model = candidates.reduce((best, m) =>
    m.capabilities.length > best.capabilities.length ? m : best
  );
  const maxCaps = Math.max(...candidates.map((m) => m.capabilities.length));
  const score = maxCaps > 0 ? model.capabilities.length / maxCaps : 1;
  return { model, score };
}

/** Strategy: Speed - fastest latency model */
export function selectFastest(candidates: ModelEntry[]): { model: ModelEntry; score: number } {
  const latencyOrder: Record<string, number> = { fast: 0, medium: 1, slow: 2 };
  const latencyScore: Record<string, number> = { fast: 1.0, medium: 0.6, slow: 0.3 };
  const model = candidates.reduce((best, m) =>
    latencyOrder[m.latency] < latencyOrder[best.latency] ? m : best
  );
  const score = latencyScore[model.latency];
  return { model, score };
}

/** Strategy: Balanced - weighted 40% cost + 35% capability + 25% speed */
export function selectBalanced(candidates: ModelEntry[]): { model: ModelEntry; score: number } {
  const maxCost = Math.max(...candidates.map((m) => m.inputCostPer1M));
  const maxCaps = Math.max(...candidates.map((m) => m.capabilities.length));
  const latencyScore: Record<string, number> = { fast: 1.0, medium: 0.6, slow: 0.3 };

  let bestScore = -1;
  let best = candidates[0];

  for (const m of candidates) {
    const costScore = maxCost > 0 ? 1 - m.inputCostPer1M / maxCost : 1;
    const capScore = maxCaps > 0 ? m.capabilities.length / maxCaps : 1;
    const speedScore = latencyScore[m.latency];
    const score = costScore * 0.4 + capScore * 0.35 + speedScore * 0.25;
    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  }

  return { model: best, score: bestScore };
}

/** Strategy: Efficiency - best capability-to-cost ratio with open-source bonus */
export function selectMostEfficient(candidates: ModelEntry[]): { model: ModelEntry; score: number } {
  const latencyScore: Record<string, number> = { fast: 1.0, medium: 0.6, slow: 0.3 };

  let bestScore = -1;
  let best = candidates[0];

  for (const m of candidates) {
    const capScore = m.capabilities.length;
    const speedFactor = latencyScore[m.latency];
    const cost = Math.max(m.inputCostPer1M, 0.01);
    const openSourceBonus = m.isOpenSource ? 1.15 : 1.0;
    const score = (capScore * speedFactor * openSourceBonus) / cost;
    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  }

  return { model: best, score: bestScore };
}

/** Dispatch to the correct strategy function */
export function applyStrategy(
  strategy: RoutingStrategy,
  candidates: ModelEntry[]
): { model: ModelEntry; score: number } {
  switch (strategy) {
    case "cost":
      return selectCheapest(candidates);
    case "capability":
      return selectMostCapable(candidates);
    case "speed":
      return selectFastest(candidates);
    case "balanced":
      return selectBalanced(candidates);
    case "efficiency":
      return selectMostEfficient(candidates);
    case "custom":
      // Custom falls back to balanced when no custom rule matches
      return selectBalanced(candidates);
    default:
      return selectBalanced(candidates);
  }
}
