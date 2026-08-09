/**
 * Dry-run simulation of a compiled DAG.
 * Estimates total execution time assuming parallel groups run concurrently.
 */

import type { CompiledDag, SimulationResult, SimulationGroup } from "./types.js";

export function simulate(dag: CompiledDag): SimulationResult {
  const nodeMap = new Map(dag.nodes.map((n) => [n.id, n]));

  const groups: SimulationGroup[] = dag.parallelGroups.map((group) => {
    // In a parallel group, the slowest step determines the group duration
    const maxTimeout = Math.max(
      ...group.map((id) => (nodeMap.get(id)?.timeoutSeconds ?? 300) * 1000)
    );

    return {
      steps: group,
      parallel: group.length > 1,
      estimatedMs: maxTimeout,
    };
  });

  // Total time is sum of group durations (groups run sequentially)
  const totalEstimatedMs = groups.reduce((sum, g) => sum + g.estimatedMs, 0);

  return { groups, totalEstimatedMs };
}
