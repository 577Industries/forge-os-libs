/**
 * Parallel group identification and visualization example.
 * Run: npx tsx examples/parallel-groups.ts
 */

import { compileWorkflow, toMermaid, simulate } from "../src/index.js";
import type { WorkflowDefinition } from "../src/index.js";

const workflow: WorkflowDefinition = {
  name: "multi-branch-pipeline",
  steps: [
    { id: "ingest", task: "data_ingestion" },

    // Branch 1: Text processing
    { id: "text_extract", task: "extract_text", depends_on: ["ingest"] },
    { id: "text_analyze", task: "analyze_sentiment", depends_on: ["text_extract"] },

    // Branch 2: Image processing
    { id: "img_extract", task: "extract_images", depends_on: ["ingest"] },
    { id: "img_resize", task: "resize_images", depends_on: ["img_extract"] },

    // Branch 3: Metadata
    { id: "meta_extract", task: "extract_metadata", depends_on: ["ingest"] },

    // Merge all branches
    { id: "merge", task: "combine_results", depends_on: ["text_analyze", "img_resize", "meta_extract"] },
    { id: "publish", task: "publish_report", depends_on: ["merge"] },
  ],
};

const dag = compileWorkflow(workflow);

console.log("=== Parallel Group Analysis ===\n");
console.log(`Workflow: ${dag.name}`);
console.log(`Total steps: ${dag.nodes.length}`);
console.log(`Parallel groups: ${dag.parallelGroups.length}\n`);

dag.parallelGroups.forEach((group, i) => {
  const status = group.length > 1 ? "PARALLEL" : "SEQUENTIAL";
  console.log(`Group ${i + 1} [${status}]: ${group.join(", ")}`);
});

console.log("\n=== Mermaid Diagram ===\n");
console.log(toMermaid(dag));

const sim = simulate(dag);
console.log("\n=== Simulation ===\n");
sim.groups.forEach((g, i) => {
  const mode = g.parallel ? "parallel" : "sequential";
  console.log(`Group ${i + 1}: ${g.steps.join(", ")} (${mode}, ~${g.estimatedMs / 1000}s)`);
});
console.log(`\nTotal estimated: ~${sim.totalEstimatedMs / 1000}s`);
