import { describe, it, expect } from "vitest";
import { scoreMemories } from "../src/recall.js";
import type { Memory } from "../src/types.js";

function makeMemory(overrides: Partial<Memory> = {}): Memory {
  return {
    id: "mem-1",
    agentId: "agent-1",
    memoryType: "pattern",
    content: "test",
    confidence: 0.5,
    reinforcementCount: 0,
    lastReinforcedAt: new Date(),
    createdAt: new Date(),
    ...overrides,
  };
}

describe("scoreMemories", () => {
  it("without query, ranks by confidence", () => {
    const memories = [
      makeMemory({ id: "low", confidence: 0.3 }),
      makeMemory({ id: "high", confidence: 0.9 }),
      makeMemory({ id: "mid", confidence: 0.6 }),
    ];

    const scored = scoreMemories(memories);

    expect(scored[0].id).toBe("high");
    expect(scored[1].id).toBe("mid");
    expect(scored[2].id).toBe("low");
  });

  it("with embeddings, uses composite score (sim*0.7 + conf*0.3)", () => {
    const queryEmb = [1, 0, 0];
    const memories = [
      makeMemory({
        id: "similar",
        confidence: 0.3,
        embedding: [0.9, 0.1, 0],
      }),
      makeMemory({
        id: "confident",
        confidence: 0.9,
        embedding: [0, 1, 0],
      }),
    ];

    const scored = scoreMemories(memories, queryEmb);

    // "similar" has high similarity but low confidence
    // "confident" has low similarity but high confidence
    expect(scored.length).toBe(2);
    // The similar one should score higher with 0.7 weight on similarity
    expect(scored[0].id).toBe("similar");
  });

  it("filters out memories below minConfidence", () => {
    const memories = [
      makeMemory({ id: "ok", confidence: 0.5 }),
      makeMemory({ id: "low", confidence: 0.05 }),
    ];

    const scored = scoreMemories(memories, undefined, {
      minConfidence: 0.1,
    });

    expect(scored).toHaveLength(1);
    expect(scored[0].id).toBe("ok");
  });

  it("returns empty for empty store", () => {
    expect(scoreMemories([])).toEqual([]);
  });

  it("supports custom weights", () => {
    const queryEmb = [1, 0, 0];
    const memories = [
      makeMemory({
        id: "sim",
        confidence: 0.2,
        embedding: [0.95, 0.05, 0],
      }),
      makeMemory({
        id: "conf",
        confidence: 0.95,
        embedding: [0, 1, 0],
      }),
    ];

    // With 90% confidence weight, the confident one should win
    const scored = scoreMemories(memories, queryEmb, {
      similarityWeight: 0.1,
      confidenceWeight: 0.9,
    });

    expect(scored[0].id).toBe("conf");
  });
});
