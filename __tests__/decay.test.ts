import { describe, it, expect } from "vitest";
import { applyDecay } from "../src/decay.js";
import type { Memory } from "../src/types.js";

function makeMemory(overrides: Partial<Memory> = {}): Memory {
  return {
    id: "mem-1",
    agentId: "agent-1",
    memoryType: "pattern",
    content: "test memory",
    confidence: 0.8,
    reinforcementCount: 2,
    lastReinforcedAt: new Date("2026-01-01"),
    createdAt: new Date("2025-12-01"),
    ...overrides,
  };
}

describe("applyDecay", () => {
  it("decays memory not reinforced for 30+ days", () => {
    const mem = makeMemory({ confidence: 0.8 });
    const memories = [mem];

    const result = applyDecay(memories, {
      decayCycleDays: 30,
      decayFactor: 0.95,
      minConfidence: 0.1,
      now: new Date("2026-02-15"),
    });

    expect(result.decayed).toBe(1);
    expect(mem.confidence).toBeCloseTo(0.8 * 0.95, 5);
  });

  it("does NOT decay recently reinforced memory", () => {
    const mem = makeMemory({
      confidence: 0.8,
      lastReinforcedAt: new Date("2026-02-10"),
    });
    const memories = [mem];

    applyDecay(memories, {
      decayCycleDays: 30,
      decayFactor: 0.95,
      minConfidence: 0.1,
      now: new Date("2026-02-15"),
    });

    expect(mem.confidence).toBe(0.8);
  });

  it("deletes memory below minConfidence", () => {
    const mem = makeMemory({ confidence: 0.05 });
    const memories = [mem];

    const result = applyDecay(memories, {
      decayCycleDays: 30,
      decayFactor: 0.95,
      minConfidence: 0.1,
      now: new Date("2026-02-15"),
    });

    expect(result.deleted).toBe(1);
    expect(memories).toHaveLength(0);
  });

  it("compounds over multiple cycles (0.95^n)", () => {
    const mem = makeMemory({
      confidence: 1.0,
      lastReinforcedAt: new Date("2025-01-01"),
    });
    const memories = [mem];

    // Run 3 decay cycles
    for (let i = 0; i < 3; i++) {
      applyDecay(memories, {
        decayCycleDays: 1, // 1-day cycles for testing
        decayFactor: 0.95,
        minConfidence: 0.1,
        now: new Date("2025-06-01"),
      });
    }

    expect(mem.confidence).toBeCloseTo(1.0 * 0.95 ** 3, 5);
  });

  it("supports custom decay factor and cycle days", () => {
    const mem = makeMemory({
      confidence: 0.9,
      lastReinforcedAt: new Date("2026-01-01"),
    });
    const memories = [mem];

    applyDecay(memories, {
      decayCycleDays: 7,
      decayFactor: 0.8,
      minConfidence: 0.05,
      now: new Date("2026-01-10"),
    });

    expect(mem.confidence).toBeCloseTo(0.9 * 0.8, 5);
  });
});
