/**
 * Basic workflow compilation example.
 * Run: npx tsx examples/basic-workflow.ts
 */

import { parseYaml, compileWorkflow, toMermaid, simulate } from "../src/index.js";

const yaml = `
name: data-pipeline
description: ETL pipeline with parallel processing
version: "1.0"
steps:
  - id: extract
    task: extract_data
    timeout_seconds: 60

  - id: validate
    task: validate_schema
    depends_on: [extract]

  - id: transform_a
    task: normalize_dates
    depends_on: [validate]

  - id: transform_b
    task: clean_nulls
    depends_on: [validate]

  - id: load
    task: write_to_db
    depends_on: [transform_a, transform_b]
`;

const definition = parseYaml(yaml);
console.log("Parsed workflow:", definition.name);
console.log(`  ${definition.steps.length} steps\n`);

const dag = compileWorkflow(definition);
console.log("Execution order:", dag.executionOrder.join(" → "));
console.log("\nParallel groups:");
dag.parallelGroups.forEach((group, i) => {
  const parallel = group.length > 1 ? " (parallel)" : "";
  console.log(`  Group ${i + 1}: [${group.join(", ")}]${parallel}`);
});

console.log("\nMermaid diagram:");
console.log(toMermaid(dag));

const sim = simulate(dag);
console.log(`\nSimulation: ${sim.groups.length} groups, ~${sim.totalEstimatedMs / 1000}s estimated`);
