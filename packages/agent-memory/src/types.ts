/**
 * Type definitions for agent-memory.
 */

export type MemoryType = "pattern" | "preference" | "baseline" | "entity" | "insight";

export interface Memory {
  id: string;
  agentId: string;
  memoryType: MemoryType;
  content: string;
  confidence: number;
  reinforcementCount: number;
  embedding?: number[];
  lastReinforcedAt: Date;
  createdAt: Date;
}

export interface MemoryStoreConfig {
  agentId: string;
  embeddingProvider?: EmbeddingProvider;
  similarityThreshold?: number;
  decayCycleDays?: number;
  decayFactor?: number;
  minConfidence?: number;
}

export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
}

export interface ScoredMemory extends Memory {
  score: number;
}
