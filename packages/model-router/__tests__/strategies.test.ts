import { describe, it, expect } from "vitest";
import {
  selectCheapest,
  selectMostCapable,
  selectFastest,
  selectBalanced,
  selectMostEfficient,
  isSlmModel,
  applyStrategy,
} from "../src/strategies.js";
import { DEFAULT_REGISTRY } from "../src/registry.js";
import type { ModelEntry } from "../src/types.js";

describe("isSlmModel", () => {
  it("classifies models with inputCostPer1M <= 0.50 as SLM", () => {
    const model = DEFAULT_REGISTRY.find((m) => m.id === "gpt-4o-mini")!;
    expect(isSlmModel(model)).toBe(true);
  });

  it("classifies 8B parameter models as SLM", () => {
    const model = DEFAULT_REGISTRY.find((m) => m.id === "llama-3.1-8b-instant")!;
    expect(isSlmModel(model)).toBe(true);
  });

  it("classifies 22B parameter models as SLM", () => {
    const model = DEFAULT_REGISTRY.find((m) => m.id === "mistral-small-latest")!;
    expect(isSlmModel(model)).toBe(true);
  });

  it("does not classify expensive large models as SLM", () => {
    const model = DEFAULT_REGISTRY.find((m) => m.id === "claude-opus-4-20250514")!;
    expect(isSlmModel(model)).toBe(false);
  });
});

describe("selectCheapest", () => {
  it("selects the cheapest model by input cost", () => {
    const { model } = selectCheapest(DEFAULT_REGISTRY);
    const minCost = Math.min(...DEFAULT_REGISTRY.map((m) => m.inputCostPer1M));
    expect(model.inputCostPer1M).toBe(minCost);
  });

  it("returns highest score for the cheapest model", () => {
    const { score } = selectCheapest(DEFAULT_REGISTRY);
    // Score approaches 1 as cost approaches 0 relative to max cost
    expect(score).toBeGreaterThan(0.99);
  });
});

describe("selectMostCapable", () => {
  it("selects model with most capabilities", () => {
    const { model } = selectMostCapable(DEFAULT_REGISTRY);
    const maxCaps = Math.max(...DEFAULT_REGISTRY.map((m) => m.capabilities.length));
    expect(model.capabilities.length).toBe(maxCaps);
  });

  it("returns score of 1 for the most capable model", () => {
    const { score } = selectMostCapable(DEFAULT_REGISTRY);
    expect(score).toBe(1);
  });
});

describe("selectFastest", () => {
  it("selects a fast-latency model", () => {
    const { model } = selectFastest(DEFAULT_REGISTRY);
    expect(model.latency).toBe("fast");
  });

  it("returns score of 1 for fast latency", () => {
    const { score } = selectFastest(DEFAULT_REGISTRY);
    expect(score).toBe(1.0);
  });
});

describe("selectBalanced", () => {
  it("applies 40/35/25 weighting correctly", () => {
    const cheap: ModelEntry = {
      id: "cheap",
      provider: "openai",
      displayName: "Cheap",
      inputCostPer1M: 0.1,
      outputCostPer1M: 0.1,
      capabilities: ["chat"],
      latency: "fast",
      contextWindow: 128_000,
    };
    const capable: ModelEntry = {
      id: "capable",
      provider: "anthropic",
      displayName: "Capable",
      inputCostPer1M: 15,
      outputCostPer1M: 75,
      capabilities: ["chat", "tools", "vision", "analysis", "code"],
      latency: "slow",
      contextWindow: 200_000,
    };
    // With just these two, balanced should prefer cheap due to
    // cost dominating (0.4 weight) + speed (0.25 weight)
    const { model } = selectBalanced([cheap, capable]);
    expect(model.id).toBe("cheap");
  });

  it("returns a score between 0 and 1", () => {
    const { score } = selectBalanced(DEFAULT_REGISTRY);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});

describe("selectMostEfficient", () => {
  it("gives open-source models a 1.15x bonus", () => {
    const osModel: ModelEntry = {
      id: "os-model",
      provider: "groq",
      displayName: "OS Model",
      inputCostPer1M: 0.5,
      outputCostPer1M: 0.5,
      capabilities: ["chat", "tools"],
      latency: "fast",
      contextWindow: 128_000,
      isOpenSource: true,
    };
    const closedModel: ModelEntry = {
      id: "closed-model",
      provider: "openai",
      displayName: "Closed Model",
      inputCostPer1M: 0.5,
      outputCostPer1M: 0.5,
      capabilities: ["chat", "tools"],
      latency: "fast",
      contextWindow: 128_000,
      isOpenSource: false,
    };
    const { model } = selectMostEfficient([osModel, closedModel]);
    expect(model.id).toBe("os-model");
  });
});

describe("applyStrategy", () => {
  it("custom strategy falls back to balanced", () => {
    const balancedResult = selectBalanced(DEFAULT_REGISTRY);
    const customResult = applyStrategy("custom", DEFAULT_REGISTRY);
    expect(customResult.model.id).toBe(balancedResult.model.id);
    expect(customResult.score).toBe(balancedResult.score);
  });
});
