/**
 * DAG Compiler — Kahn's topological sort with cycle detection
 * and parallel group identification.
 *
 * Adapted from FORGE OS workflow DSL compiler.
 * Algorithm: Kahn's algorithm processes nodes with in-degree 0 in batches,
 * where each batch represents a set of steps that can execute in parallel.
 */

import type { WorkflowDefinition, DagNode, CompiledDag } from "./types.js";
import { CycleDetectedError, InvalidDependencyError } from "./errors.js";

export function compileWorkflow(definition: WorkflowDefinition): CompiledDag {
  const nodes: DagNode[] = definition.steps.map((step) => ({
    id: step.id,
    taskId: step.task,
    inputTemplate: step.input ?? null,
    condition: step.condition ?? null,
    timeoutSeconds: step.timeout_seconds ?? 300,
    dependsOn: step.depends_on ?? [],
  }));

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Validate all dependencies exist
  for (const node of nodes) {
    for (const dep of node.dependsOn) {
      if (!nodeMap.has(dep)) {
        throw new InvalidDependencyError(node.id, dep);
      }
    }
  }

  // Kahn's algorithm for topological sort
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  }

  for (const node of nodes) {
    for (const dep of node.dependsOn) {
      adjacency.get(dep)!.push(node.id);
      inDegree.set(node.id, (inDegree.get(node.id) ?? 0) + 1);
    }
  }

  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  const executionOrder: string[] = [];
  const parallelGroups: string[][] = [];

  while (queue.length > 0) {
    // Current batch can run in parallel
    const currentBatch = [...queue];
    parallelGroups.push(currentBatch);
    queue.length = 0;

    for (const id of currentBatch) {
      executionOrder.push(id);
      for (const neighbor of adjacency.get(id) ?? []) {
        const newDegree = (inDegree.get(neighbor) ?? 1) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) queue.push(neighbor);
      }
    }
  }

  // Cycle detection: if not all nodes processed, a cycle exists
  if (executionOrder.length !== nodes.length) {
    const remaining = nodes
      .filter((n) => !executionOrder.includes(n.id))
      .map((n) => n.id);
    throw new CycleDetectedError(remaining);
  }

  return { name: definition.name, nodes, executionOrder, parallelGroups };
}
