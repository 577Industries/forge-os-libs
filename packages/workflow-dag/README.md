<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/577Industries/.github/main/brand/out/wordmark-dark.svg">
  <img alt="577 Industries" height="44" src="https://raw.githubusercontent.com/577Industries/.github/main/brand/out/wordmark-light.svg">
</picture>

# forge-workflow-dag

`FORGE OS` · [program overview](https://github.com/577Industries#forge-os--agent-infrastructure)

**A YAML-to-DAG workflow compiler that uses Kahn's topological sort to determine execution order, detect cycles, and identify steps that can run in parallel.**

[![release](https://img.shields.io/github/v/release/577Industries/forge-workflow-dag?style=flat-square)](https://github.com/577Industries/forge-workflow-dag/releases)
[![license](https://img.shields.io/badge/license-Apache_2.0-blue?style=flat-square)](./LICENSE)
[![npm](https://img.shields.io/npm/v/%40577-industries%2Fworkflow-dag?style=flat-square)](https://www.npmjs.com/package/@577-industries/workflow-dag)

Implements the core algorithm described in the **"Workflow DAG Compiler"** patent (March 2026) by 577 Industries.

## How It Works

```
                    ┌──────────┐
  YAML Definition → │  Parser  │
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │ Compiler │ ← Kahn's Algorithm
                    └────┬─────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
         ┌────▼───┐ ┌───▼────┐ ┌──▼───────┐
         │ Order  │ │ Groups │ │ Mermaid  │
         └────────┘ └────────┘ └──────────┘
```

## Quick Start

```bash
npm install @577-industries/workflow-dag
```

```typescript
import { parseYaml, compileWorkflow, toMermaid } from "@577-industries/workflow-dag";

const yaml = `
name: deploy-pipeline
steps:
  - id: build
    task: compile_code
  - id: test_unit
    task: run_unit_tests
    depends_on: [build]
  - id: test_e2e
    task: run_e2e_tests
    depends_on: [build]
  - id: deploy
    task: deploy_to_prod
    depends_on: [test_unit, test_e2e]
`;

const definition = parseYaml(yaml);
const dag = compileWorkflow(definition);

console.log(dag.executionOrder);
// → ["build", "test_unit", "test_e2e", "deploy"]

console.log(dag.parallelGroups);
// → [["build"], ["test_unit", "test_e2e"], ["deploy"]]

console.log(toMermaid(dag));
// → graph TD
//     build["compile_code"]
//     test_unit["run_unit_tests"]
//     ...
```

## API Reference

### `parseYaml(yamlString: string): WorkflowDefinition`

Parses a YAML string into a validated workflow definition.

### `compileWorkflow(definition: WorkflowDefinition): CompiledDag`

Compiles a workflow definition into a DAG with execution order and parallel groups. Throws `CycleDetectedError` if a cycle exists, or `InvalidDependencyError` if a step references a nonexistent dependency.

### `toMermaid(dag: CompiledDag): string`

Generates a Mermaid graph diagram from a compiled DAG.

### `simulate(dag: CompiledDag): SimulationResult`

Dry-runs the DAG, estimating total execution time based on step timeouts and parallelism.

### Types

| Type | Description |
|------|-------------|
| `WorkflowDefinition` | Input workflow with name, steps, and metadata |
| `WorkflowStep` | A single step: id, task, depends_on, condition, timeout |
| `DagNode` | Compiled node with resolved dependencies |
| `CompiledDag` | Full compilation result: nodes, order, parallel groups |
| `SimulationResult` | Dry-run result with group timing estimates |

### Error Types

| Error | When |
|-------|------|
| `CycleDetectedError` | Workflow contains circular dependencies |
| `InvalidDependencyError` | Step references a nonexistent dependency |

## Architecture

This library implements Kahn's algorithm for topological sorting:

1. **Parse** — YAML → validated WorkflowDefinition
2. **Build adjacency** — compute in-degree for each node
3. **Process zero-degree nodes** — in batches (each batch = parallel group)
4. **Detect cycles** — if unprocessed nodes remain after sort, a cycle exists

Based on the ["Workflow DAG Compiler" patent](https://www.577industries.com/forge) by 577 Industries.

---

Extracted from [FORGE OS](https://www.577industries.com) by **577 Industries**.
