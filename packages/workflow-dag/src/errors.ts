/**
 * Error types for workflow-dag.
 */

export class CycleDetectedError extends Error {
  public readonly cycle: string[];

  constructor(cycle: string[]) {
    super(`Cycle detected in workflow: ${cycle.join(" \u2192 ")}`);
    this.name = "CycleDetectedError";
    this.cycle = cycle;
  }
}

export class InvalidDependencyError extends Error {
  public readonly stepId: string;
  public readonly missingDependency: string;

  constructor(stepId: string, missingDependency: string) {
    super(`Step "${stepId}" depends on unknown step "${missingDependency}"`);
    this.name = "InvalidDependencyError";
    this.stepId = stepId;
    this.missingDependency = missingDependency;
  }
}
