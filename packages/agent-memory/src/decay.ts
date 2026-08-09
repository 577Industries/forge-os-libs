/**
 * Exponential decay — memories lose confidence when unreinforced.
 * Memories not reinforced within `decayCycleDays` lose `decayFactor` of their confidence.
 * Memories below `minConfidence` are deleted.
 */

import type { Memory } from "./types.js";

export interface DecayConfig {
  decayCycleDays: number;
  decayFactor: number;
  minConfidence: number;
  now?: Date;
}

export function applyDecay(
  memories: Memory[],
  config: DecayConfig
): { decayed: number; deleted: number } {
  const now = config.now ?? new Date();
  const cycleMs = config.decayCycleDays * 24 * 60 * 60 * 1000;
  let decayed = 0;
  let deleted = 0;

  for (let i = memories.length - 1; i >= 0; i--) {
    const mem = memories[i];
    const elapsed = now.getTime() - mem.lastReinforcedAt.getTime();

    if (elapsed >= cycleMs && mem.confidence > config.minConfidence) {
      mem.confidence *= config.decayFactor;
      decayed++;
    }

    if (mem.confidence <= config.minConfidence) {
      memories.splice(i, 1);
      deleted++;
    }
  }

  return { decayed, deleted };
}
