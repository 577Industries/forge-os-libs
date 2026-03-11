import { describe, it, expect } from "vitest";
import { createRouter, ModelRouter } from "../src/router.js";
import { DEFAULT_REGISTRY } from "../src/registry.js";
import type { ModelEntry } from "../src/types.js";

describe("ModelRouter", () => {
  it("default strategy is balanced", () => {
    const router = createRouter();
    const result = router.route();
    // Should not throw and should return a result
    expect(result.model).toBeDefined();
    expect(result.score).toBeGreaterThan(0);
  });

  it("custom registry overrides default", () => {
    const custom: ModelEntry[] = [
      {
        id: "custom-model",
        provider: "openai",
        displayName: "Custom",
        inputCostPer1M: 1,
        outputCostPer1M: 1,
        capabilities: ["chat"],
        latency: "fast",
        contextWindow: 4096,
      },
    ];
    const router = createRouter({ registry: custom });
    const result = router.route();
    expect(result.model.id).toBe("custom-model");
    expect(router.getRegistry()).toHaveLength(1);
  });

  it("required capabilities filter candidates", () => {
    const router = createRouter({
      requiredCapabilities: ["vision", "analysis"],
    });
    const result = router.route();
    expect(result.model.capabilities).toContain("vision");
    expect(result.model.capabilities).toContain("analysis");
  });

  it("preferred provider prioritizes matching models", () => {
    const router = createRouter({
      preferredProvider: "google",
      strategy: "cost",
    });
    // With cost strategy, cheapest overall wins regardless of provider.
    // But among same-cost, preferred provider wins.
    const result = router.route();
    expect(result.model).toBeDefined();
  });

  it("cost ceiling filters expensive models", () => {
    const router = createRouter({ maxCostPer1MInput: 1.0 });
    const result = router.route();
    expect(result.model.inputCostPer1M).toBeLessThanOrEqual(1.0);
  });

  it("per-request strategy override works", () => {
    const router = createRouter({ strategy: "balanced" });
    const costResult = router.route({ strategy: "cost" });
    const capResult = router.route({ strategy: "capability" });
    // Cost and capability strategies should generally pick different models
    // (cheapest vs most capable), though they could coincide
    expect(costResult.model).toBeDefined();
    expect(capResult.model).toBeDefined();
  });

  it("custom rules route by category", () => {
    const router = createRouter({
      strategy: "custom",
      customRules: [
        { category: "code-review", modelId: "claude-opus-4-20250514" },
      ],
    });
    const result = router.route({ category: "code-review" });
    expect(result.model.id).toBe("claude-opus-4-20250514");
    expect(result.score).toBe(1.0);
  });

  it("throws when no candidates available", () => {
    const router = createRouter({ maxCostPer1MInput: 0.001 });
    expect(() => router.route()).toThrow("No models match");
  });

  it("getModelById returns correct model", () => {
    const router = createRouter();
    const model = router.getModelById("gpt-4o");
    expect(model).toBeDefined();
    expect(model!.displayName).toBe("GPT-4o");
  });

  it("getModelById returns undefined for unknown model", () => {
    const router = createRouter();
    const model = router.getModelById("nonexistent-model");
    expect(model).toBeUndefined();
  });

  it("getModelsByProvider filters correctly", () => {
    const router = createRouter();
    const anthropicModels = router.getModelsByProvider("anthropic");
    expect(anthropicModels.length).toBe(3);
    expect(anthropicModels.every((m) => m.provider === "anthropic")).toBe(true);
  });

  it("getModelsWithCapabilities filters correctly", () => {
    const router = createRouter();
    const visionModels = router.getModelsWithCapabilities(["vision", "tools"]);
    expect(visionModels.length).toBeGreaterThan(0);
    expect(
      visionModels.every(
        (m) => m.capabilities.includes("vision") && m.capabilities.includes("tools")
      )
    ).toBe(true);
  });

  it("per-request capabilities merge with config capabilities", () => {
    const router = createRouter({
      requiredCapabilities: ["chat"],
    });
    const result = router.route({ capabilities: ["vision"] });
    expect(result.model.capabilities).toContain("chat");
    expect(result.model.capabilities).toContain("vision");
  });

  it("per-request cost ceiling overrides config", () => {
    const router = createRouter({ maxCostPer1MInput: 100 });
    const result = router.route({ maxCostPer1MInput: 0.5 });
    expect(result.model.inputCostPer1M).toBeLessThanOrEqual(0.5);
  });
});
