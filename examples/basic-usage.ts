/**
 * Basic usage example.
 * Run: npx tsx examples/basic-usage.ts
 */

import { MemoryStore } from "../src/index.js";

const store = new MemoryStore({ agentId: "sales-agent" });

console.log("=== Agent Memory: Basic Usage ===\n");

// Store memories of different types
await store.store("pattern", "Customers ask about pricing before features");
await store.store("preference", "User prefers bullet-point summaries over paragraphs");
await store.store("baseline", "Average response time is 2.3 seconds");
await store.store("entity", "Acme Corp is a Fortune 500 company in the manufacturing sector");
await store.store("insight", "Follow-up emails within 24 hours increase close rate by 15%");

console.log(`Stored ${store.getAll().length} memories\n`);

// Reinforce a pattern (seen again)
const result = await store.store("pattern", "Customers ask about pricing before features");
console.log(`Duplicate stored? Reinforced: ${result.reinforced}`);
console.log(`Pattern confidence: ${Math.round(store.getAll()[0].confidence * 100)}%\n`);

// Recall top memories
const recalled = await store.recall(undefined, 3);
console.log("Top 3 memories by confidence:");
for (const mem of recalled) {
  console.log(`  [${mem.memoryType}] ${mem.content} (${Math.round(mem.confidence * 100)}%)`);
}

// Format for LLM prompt
console.log("\nFormatted for system prompt:");
console.log(store.format(recalled));
