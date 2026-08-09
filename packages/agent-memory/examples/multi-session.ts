/**
 * Multi-session simulation with decay.
 * Run: npx tsx examples/multi-session.ts
 */

import { MemoryStore } from "../src/index.js";

const store = new MemoryStore({
  agentId: "analysis-agent",
  decayCycleDays: 30,
  decayFactor: 0.95,
  minConfidence: 0.1,
});

console.log("=== Agent Memory: Multi-Session Simulation ===\n");

// Session 1: Initial learning
console.log("Session 1 (Day 0):");
await store.store("pattern", "Data exports require CSV format validation");
await store.store("preference", "User prefers detailed error messages");
await store.store("insight", "Peak traffic occurs between 2-4pm EST");
console.log(`  Stored ${store.getAll().length} memories\n`);

// Session 2: Reinforce one pattern (Day 5)
store.advanceTime(5);
console.log("Session 2 (Day 5):");
await store.store("pattern", "Data exports require CSV format validation"); // reinforce
await store.store("entity", "Database connection limit is 50");
console.log(`  Reinforced CSV pattern, added entity\n`);

// Session 3: More reinforcement (Day 15)
store.advanceTime(10);
console.log("Session 3 (Day 15):");
await store.store("pattern", "Data exports require CSV format validation"); // reinforce again
console.log(`  Reinforced CSV pattern again\n`);

// Day 35: First decay cycle
store.advanceTime(20);
console.log("Day 35 — Running decay cycle:");
const decay1 = store.decay();
console.log(`  Decayed: ${decay1.decayed}, Deleted: ${decay1.deleted}`);
console.log("  Memory states:");
for (const m of store.getAll()) {
  console.log(`    [${m.memoryType}] ${m.content.slice(0, 50)}... (${Math.round(m.confidence * 100)}%, reinforced ${m.reinforcementCount}x)`);
}

// Day 200: Multiple decay cycles
store.advanceTime(165);
console.log("\nDay 200 — Running multiple decay cycles:");
for (let i = 0; i < 5; i++) {
  store.decay();
}
const remaining = store.getAll();
console.log(`  Remaining memories: ${remaining.length}`);
for (const m of remaining) {
  console.log(`    [${m.memoryType}] ${m.content.slice(0, 50)}... (${Math.round(m.confidence * 100)}%)`);
}
const deleted = 4 - remaining.length;
if (deleted > 0) {
  console.log(`  ${deleted} low-confidence memories deleted`);
}
