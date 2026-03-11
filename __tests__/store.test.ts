import { describe, it, expect } from "vitest";
import { MemoryStore } from "../src/memory-store.js";
import type { EmbeddingProvider } from "../src/types.js";

// Simple mock embedding provider — uses character codes as embeddings
const mockEmbedder: EmbeddingProvider = {
  async embed(text: string) {
    const vec = new Array(8).fill(0);
    for (let i = 0; i < Math.min(text.length, 8); i++) {
      vec[i] = text.charCodeAt(i) / 127;
    }
    return vec;
  },
};

describe("MemoryStore", () => {
  it("stores a new memory with default confidence 0.5", async () => {
    const store = new MemoryStore({ agentId: "test" });
    const result = await store.store("pattern", "Users prefer dark mode");

    expect(result.reinforced).toBe(false);
    const all = store.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].confidence).toBe(0.5);
    expect(all[0].memoryType).toBe("pattern");
  });

  it("reinforces on duplicate content (text matching)", async () => {
    const store = new MemoryStore({ agentId: "test" });
    await store.store("pattern", "Users prefer dark mode");
    const result = await store.store("pattern", "Users prefer dark mode always");

    expect(result.reinforced).toBe(true);
    const all = store.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].reinforcementCount).toBe(1);
    expect(all[0].confidence).toBeGreaterThan(0.5);
  });

  it("reinforces on duplicate content (embedding similarity)", async () => {
    const store = new MemoryStore({
      agentId: "test",
      embeddingProvider: mockEmbedder,
      similarityThreshold: 0.8,
    });
    await store.store("pattern", "dark mode");
    const result = await store.store("pattern", "dark mode"); // identical = sim 1.0

    expect(result.reinforced).toBe(true);
    expect(store.getAll()).toHaveLength(1);
  });

  it("recalls without embedding provider using text matching", async () => {
    const store = new MemoryStore({ agentId: "test" });
    await store.store("pattern", "Retry on timeout");
    await store.store("preference", "Use CSV format");

    const results = await store.recall();
    expect(results.length).toBeGreaterThan(0);
  });

  it("recalls with embedding provider using cosine similarity", async () => {
    const store = new MemoryStore({
      agentId: "test",
      embeddingProvider: mockEmbedder,
    });
    await store.store("pattern", "aaa");
    await store.store("pattern", "zzz");

    const results = await store.recall("aaa", 5);
    expect(results.length).toBeGreaterThan(0);
  });

  it("full lifecycle: store → reinforce → decay → recall → format", async () => {
    const store = new MemoryStore({
      agentId: "lifecycle-test",
      decayCycleDays: 30,
    });

    // Store
    const { id } = await store.store("insight", "Always validate inputs first");
    expect(store.getAll()).toHaveLength(1);

    // Reinforce
    store.reinforce(id);
    expect(store.getAll()[0].reinforcementCount).toBe(1);

    // Decay (no time passed, so nothing should decay)
    const decay1 = store.decay();
    expect(decay1.decayed).toBe(0);

    // Advance time and decay
    store.advanceTime(35);
    const decay2 = store.decay();
    expect(decay2.decayed).toBe(1);

    // Recall
    const recalled = await store.recall();
    expect(recalled.length).toBeGreaterThan(0);

    // Format
    const formatted = store.format(recalled);
    expect(formatted).toContain("Agent Memory");
    expect(formatted).toContain("Always validate inputs first");
  });

  it("advanceTime correctly simulates time passing", async () => {
    const store = new MemoryStore({
      agentId: "time-test",
      decayCycleDays: 10,
    });
    await store.store("pattern", "some pattern");

    // No decay yet
    let result = store.decay();
    expect(result.decayed).toBe(0);

    // Advance 15 days — should trigger decay
    store.advanceTime(15);
    result = store.decay();
    expect(result.decayed).toBe(1);
  });

  it("respects limit in recall", async () => {
    const store = new MemoryStore({ agentId: "test" });
    for (let i = 0; i < 10; i++) {
      await store.store("pattern", `Memory number ${i} unique content`);
    }

    const results = await store.recall(undefined, 3);
    expect(results).toHaveLength(3);
  });
});
