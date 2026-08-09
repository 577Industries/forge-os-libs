/**
 * Cycle detection example.
 * Run: npx tsx examples/cycle-detection.ts
 */

import { compileWorkflow, CycleDetectedError } from "../src/index.js";
import type { WorkflowDefinition } from "../src/index.js";

const cyclic: WorkflowDefinition = {
  name: "cyclic-workflow",
  steps: [
    { id: "a", task: "process_orders", depends_on: ["c"] },
    { id: "b", task: "generate_report", depends_on: ["a"] },
    { id: "c", task: "send_notifications", depends_on: ["b"] },
  ],
};

console.log("Attempting to compile a cyclic workflow...\n");

try {
  compileWorkflow(cyclic);
  console.log("ERROR: Should not reach here");
} catch (err) {
  if (err instanceof CycleDetectedError) {
    console.log("Cycle detected!");
    console.log("  Involved nodes:", err.cycle.join(", "));
    console.log("  Message:", err.message);
  }
}
