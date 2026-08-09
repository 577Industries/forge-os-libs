/**
 * Composite recall scoring.
 * Score = similarity * 0.7 + confidence * 0.3
 */

import type { Memory, ScoredMemory } from "./types.js";
import { cosineSimilarity } from "./similarity.js";

export interface RecallOptions {
  similarityWeight?: number;
  confidenceWeight?: number;
  minConfidence?: number;
}

export function scoreMemories(
  memories: Memory[],
  queryEmbedding?: number[],
  options?: RecallOptions
): ScoredMemory[] {
  const simW = options?.similarityWeight ?? 0.7;
  const confW = options?.confidenceWeight ?? 0.3;
  const minConf = options?.minConfidence ?? 0;

  return memories
    .filter((m) => m.confidence > minConf)
    .map((m) => {
      const similarity =
        queryEmbedding && m.embedding
          ? cosineSimilarity(queryEmbedding, m.embedding)
          : 0;
      const score = queryEmbedding
        ? similarity * simW + m.confidence * confW
        : m.confidence;
      return { ...m, score };
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score);
}
