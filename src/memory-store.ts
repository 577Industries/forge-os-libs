/**
 * MemoryStore — main API for agent-memory.
 * In-memory store with pluggable embedding provider.
 */

import crypto from "node:crypto";
import type { Memory, MemoryType, MemoryStoreConfig, EmbeddingProvider } from "./types.js";
import { computeReinforcement } from "./reinforcement.js";
import { applyDecay } from "./decay.js";
import { scoreMemories } from "./recall.js";
import { cosineSimilarity } from "./similarity.js";
import { formatMemoriesForPrompt } from "./format.js";

export class MemoryStore {
  private memories: Memory[] = [];
  private agentId: string;
  private embeddingProvider?: EmbeddingProvider;
  private similarityThreshold: number;
  private decayCycleDays: number;
  private decayFactor: number;
  private minConfidence: number;
  private timeOffset = 0; // ms offset for time simulation

  constructor(config: MemoryStoreConfig) {
    this.agentId = config.agentId;
    this.embeddingProvider = config.embeddingProvider;
    this.similarityThreshold = config.similarityThreshold ?? 0.85;
    this.decayCycleDays = config.decayCycleDays ?? 30;
    this.decayFactor = config.decayFactor ?? 0.95;
    this.minConfidence = config.minConfidence ?? 0.1;
  }

  /**
   * Store a memory, reinforcing if a similar one already exists.
   */
  async store(
    type: MemoryType,
    content: string
  ): Promise<{ id: string; reinforced: boolean }> {
    // Try to find a duplicate via embeddings or text matching
    let embedding: number[] | undefined;
    if (this.embeddingProvider) {
      embedding = await this.embeddingProvider.embed(content);

      // Check for semantic duplicates
      for (const existing of this.memories) {
        if (
          existing.memoryType === type &&
          existing.embedding &&
          cosineSimilarity(embedding, existing.embedding) > this.similarityThreshold
        ) {
          this.reinforce(existing.id);
          return { id: existing.id, reinforced: true };
        }
      }
    } else {
      // Text-based dedup: bidirectional substring matching
      const newLower = content.toLowerCase();
      const newPrefix = newLower.slice(0, 50);
      for (const existing of this.memories) {
        const existingLower = existing.content.toLowerCase();
        const existingPrefix = existingLower.slice(0, 50);
        if (
          existing.memoryType === type &&
          (existingLower.includes(newPrefix) || newLower.includes(existingPrefix))
        ) {
          this.reinforce(existing.id);
          return { id: existing.id, reinforced: true };
        }
      }
    }

    // Create new memory
    const now = this.now();
    const memory: Memory = {
      id: crypto.randomUUID(),
      agentId: this.agentId,
      memoryType: type,
      content,
      confidence: 0.5,
      reinforcementCount: 0,
      embedding,
      lastReinforcedAt: now,
      createdAt: now,
    };

    this.memories.push(memory);
    return { id: memory.id, reinforced: false };
  }

  /**
   * Recall relevant memories, ranked by composite score.
   */
  async recall(query?: string, limit = 5): Promise<Memory[]> {
    let queryEmbedding: number[] | undefined;
    if (query && this.embeddingProvider) {
      queryEmbedding = await this.embeddingProvider.embed(query);
    }

    const scored = scoreMemories(this.memories, queryEmbedding, {
      minConfidence: this.minConfidence,
    });

    return scored.slice(0, limit);
  }

  /**
   * Reinforce a memory by ID.
   */
  reinforce(id: string): void {
    const mem = this.memories.find((m) => m.id === id);
    if (!mem) return;

    mem.confidence = computeReinforcement(
      mem.confidence,
      mem.reinforcementCount
    );
    mem.reinforcementCount++;
    mem.lastReinforcedAt = this.now();
  }

  /**
   * Run a decay cycle. Call periodically or use advanceTime() for simulation.
   */
  decay(): { decayed: number; deleted: number } {
    return applyDecay(this.memories, {
      decayCycleDays: this.decayCycleDays,
      decayFactor: this.decayFactor,
      minConfidence: this.minConfidence,
      now: this.now(),
    });
  }

  /**
   * Format memories for LLM system prompt injection.
   */
  format(memories?: Memory[]): string {
    return formatMemoriesForPrompt(memories ?? this.memories);
  }

  /**
   * Get all stored memories.
   */
  getAll(): Memory[] {
    return [...this.memories];
  }

  /**
   * Simulate time passing (for testing and demos).
   */
  advanceTime(days: number): void {
    this.timeOffset += days * 24 * 60 * 60 * 1000;
  }

  private now(): Date {
    return new Date(Date.now() + this.timeOffset);
  }
}
