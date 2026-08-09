/**
 * Mermaid diagram generation from compiled DAGs.
 */

import type { CompiledDag } from "./types.js";

export function toMermaid(dag: CompiledDag): string {
  const lines: string[] = ["graph TD"];

  // Define nodes
  for (const node of dag.nodes) {
    const label = node.taskId.replace(/"/g, "'");
    lines.push(`  ${node.id}["${label}"]`);
  }

  // Define edges from dependencies
  for (const node of dag.nodes) {
    for (const dep of node.dependsOn) {
      lines.push(`  ${dep} --> ${node.id}`);
    }
  }

  return lines.join("\n");
}
