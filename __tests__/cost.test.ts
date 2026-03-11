import { describe, it, expect } from "vitest";
import { createRouter } from "../src/router.js";
import { estimateCost } from "../src/cost.js";
import { DEFAULT_REGISTRY } from "../src/registry.js";

describe("estimateCost", () => {
  it("known model returns accurate cost estimate", () => {
    const router = createRouter();
    // Claude Sonnet 4: $3/1M input, $15/1M output
    // 1000 input tokens, 500 output tokens
    const cost = router.estimateCost("claude-sonnet-4-20250514", 1_000_000, 1_000_000);
    // Input: 3 * 100 = 300 cents, Output: 15 * 100 = 1500 cents
    expect(cost).toBe(1800);
  });

  it("unknown model falls back to Sonnet-level pricing", () => {
    const cost = estimateCost(undefined, 1_000_000, 1_000_000);
    // Fallback: 300 cents input + 1500 cents output = 1800 cents
    expect(cost).toBe(1800);
  });

  it("zero tokens returns zero cost", () => {
    const router = createRouter();
    const cost = router.estimateCost("claude-sonnet-4-20250514", 0, 0);
    expect(cost).toBe(0);
  });

  it("cost scales linearly with token count", () => {
    const router = createRouter();
    const cost1 = router.estimateCost("gpt-4o", 100_000, 50_000);
    const cost2 = router.estimateCost("gpt-4o", 200_000, 100_000);
    expect(cost2).toBeCloseTo(cost1 * 2, 5);
  });

  it("cost estimation works for cheapest model", () => {
    const router = createRouter();
    // Llama 3.1 8B: $0.05/1M input, $0.08/1M output
    const cost = router.estimateCost("llama-3.1-8b-instant", 1_000_000, 1_000_000);
    // Input: 0.05 * 100 = 5 cents, Output: 0.08 * 100 = 8 cents
    expect(cost).toBe(13);
  });

  it("cost estimation works for most expensive model", () => {
    const router = createRouter();
    // Claude Opus 4: $15/1M input, $75/1M output
    const cost = router.estimateCost("claude-opus-4-20250514", 1_000_000, 1_000_000);
    // Input: 15 * 100 = 1500 cents, Output: 75 * 100 = 7500 cents
    expect(cost).toBe(9000);
  });
});
