import { describe, it, expect } from "vitest";
import { compileWorkflow } from "../src/compiler.js";
import { CycleDetectedError, InvalidDependencyError } from "../src/errors.js";
import type { WorkflowDefinition } from "../src/types.js";

describe("cycle detection", () => {
  it("detects a direct cycle (A → B → A)", () => {
    const def: WorkflowDefinition = {
      name: "cycle",
      steps: [
        { id: "a", task: "run", depends_on: ["b"] },
        { id: "b", task: "run", depends_on: ["a"] },
      ],
    };

    expect(() => compileWorkflow(def)).toThrow(CycleDetectedError);
  });

  it("detects an indirect cycle (A → B → C → A)", () => {
    const def: WorkflowDefinition = {
      name: "indirect-cycle",
      steps: [
        { id: "a", task: "run", depends_on: ["c"] },
        { id: "b", task: "run", depends_on: ["a"] },
        { id: "c", task: "run", depends_on: ["b"] },
      ],
    };

    expect(() => compileWorkflow(def)).toThrow(CycleDetectedError);
  });

  it("includes cycle node IDs in the error", () => {
    const def: WorkflowDefinition = {
      name: "cycle-info",
      steps: [
        { id: "a", task: "run", depends_on: ["b"] },
        { id: "b", task: "run", depends_on: ["a"] },
      ],
    };

    try {
      compileWorkflow(def);
      expect.fail("Should have thrown");
    } catch (err) {
      const cycleErr = err as CycleDetectedError;
      expect(cycleErr.cycle).toContain("a");
      expect(cycleErr.cycle).toContain("b");
    }
  });

  it("detects a self-referencing cycle", () => {
    const def: WorkflowDefinition = {
      name: "self-cycle",
      steps: [{ id: "a", task: "run", depends_on: ["a"] }],
    };

    expect(() => compileWorkflow(def)).toThrow(CycleDetectedError);
  });
});

describe("invalid dependencies", () => {
  it("throws on unknown dependency", () => {
    const def: WorkflowDefinition = {
      name: "bad-dep",
      steps: [{ id: "a", task: "run", depends_on: ["nonexistent"] }],
    };

    expect(() => compileWorkflow(def)).toThrow(InvalidDependencyError);
  });

  it("includes step and dependency info in error", () => {
    const def: WorkflowDefinition = {
      name: "bad-dep-info",
      steps: [{ id: "step1", task: "run", depends_on: ["missing"] }],
    };

    try {
      compileWorkflow(def);
      expect.fail("Should have thrown");
    } catch (err) {
      const depErr = err as InvalidDependencyError;
      expect(depErr.stepId).toBe("step1");
      expect(depErr.missingDependency).toBe("missing");
    }
  });
});
