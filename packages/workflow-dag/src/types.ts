/**
 * Type definitions for workflow-dag.
 * Generalized from FORGE OS agent workflows — "agent" → "task".
 */

export interface WorkflowDefinition {
  name: string;
  description?: string;
  version?: string;
  metadata?: Record<string, unknown>;
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  id: string;
  task: string;
  input?: string;
  depends_on?: string[];
  condition?: string;
  timeout_seconds?: number;
}

export interface DagNode {
  id: string;
  taskId: string;
  inputTemplate: string | null;
  condition: string | null;
  timeoutSeconds: number;
  dependsOn: string[];
}

export interface CompiledDag {
  name: string;
  nodes: DagNode[];
  executionOrder: string[];
  parallelGroups: string[][];
}

export interface SimulationResult {
  groups: SimulationGroup[];
  totalEstimatedMs: number;
}

export interface SimulationGroup {
  steps: string[];
  parallel: boolean;
  estimatedMs: number;
}
