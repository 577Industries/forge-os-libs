/**
 * Format memories for injection into LLM system prompts.
 */

import type { Memory } from "./types.js";

export function formatMemoriesForPrompt(memories: Memory[]): string {
  if (memories.length === 0) return "";

  const lines = memories.map((m) => {
    return `- [${m.memoryType}] ${m.content} (confidence: ${Math.round(m.confidence * 100)}%, reinforced ${m.reinforcementCount}x)`;
  });

  return `\n\n## Agent Memory
These are learnings from your previous runs. Use them to improve your responses.
${lines.join("\n")}`;
}
