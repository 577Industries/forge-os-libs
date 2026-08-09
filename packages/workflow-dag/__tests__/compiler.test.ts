import { describe, it, expect } from "vitest";
import { compileWorkflow } from "../src/compiler.js";
import type { WorkflowDefinition } from "../src/types.js";

describe("compileWorkflow", () => {
  it("compiles a linear workflow", () => {
    const def: WorkflowDefinition = {
      name: "linear",
      steps: [
        { id: "a", task: "fetch_data" },
        { id: "b", task: "process", depends_on: ["a"] },
        { id: "c", task: "save", depends_on: ["b"] },
      ],
    };

    const dag = compileWorkflow(def);

    expect(dag.executionOrder).toEqual(["a", "b", "c"]);
    expect(dag.parallelGroups).toEqual([["a"], ["b"], ["c"]]);
    expect(dag.nodes).toHaveLength(3);
  });

  it("compiles a single-step workflow", () => {
    const def: WorkflowDefinition = {
      name: "single",
      steps: [{ id: "only", task: "run" }],
    };

    const dag = compileWorkflow(def);

    expect(dag.executionOrder).toEqual(["only"]);
    expect(dag.parallelGroups).toEqual([["only"]]);
  });

  it("compiles an empty workflow", () => {
    const def: WorkflowDefinition = {
      name: "empty",
      steps: [],
    };

    const dag = compileWorkflow(def);

    expect(dag.executionOrder).toEqual([]);
    expect(dag.parallelGroups).toEqual([]);
    expect(dag.nodes).toEqual([]);
  });

  it("preserves node metadata", () => {
    const def: WorkflowDefinition = {
      name: "meta",
      steps: [
        {
          id: "step1",
          task: "analyze",
          input: "{{data}}",
          condition: "data.length > 0",
          timeout_seconds: 60,
        },
      ],
    };

    const dag = compileWorkflow(def);
    const node = dag.nodes[0];

    expect(node.taskId).toBe("analyze");
    expect(node.inputTemplate).toBe("{{data}}");
    expect(node.condition).toBe("data.length > 0");
    expect(node.timeoutSeconds).toBe(60);
  });

  it("defaults timeout to 300 seconds", () => {
    const def: WorkflowDefinition = {
      name: "defaults",
      steps: [{ id: "a", task: "run" }],
    };

    const dag = compileWorkflow(def);
    expect(dag.nodes[0].timeoutSeconds).toBe(300);
  });

  it("includes workflow name in compiled output", () => {
    const def: WorkflowDefinition = {
      name: "my-workflow",
      steps: [{ id: "a", task: "run" }],
    };

    const dag = compileWorkflow(def);
    expect(dag.name).toBe("my-workflow");
  });

  it("compiles a diamond dependency pattern", () => {
    //     a
    //    / \
    //   b   c
    //    \ /
    //     d
    const def: WorkflowDefinition = {
      name: "diamond",
      steps: [
        { id: "a", task: "start" },
        { id: "b", task: "left", depends_on: ["a"] },
        { id: "c", task: "right", depends_on: ["a"] },
        { id: "d", task: "merge", depends_on: ["b", "c"] },
      ],
    };

    const dag = compileWorkflow(def);

    expect(dag.executionOrder).toEqual(["a", "b", "c", "d"]);
    expect(dag.parallelGroups).toEqual([["a"], ["b", "c"], ["d"]]);
  });
});
