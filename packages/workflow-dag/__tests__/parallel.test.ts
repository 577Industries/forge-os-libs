import { describe, it, expect } from "vitest";
import { compileWorkflow } from "../src/compiler.js";
import type { WorkflowDefinition } from "../src/types.js";

describe("parallel groups", () => {
  it("groups independent steps together", () => {
    const def: WorkflowDefinition = {
      name: "parallel",
      steps: [
        { id: "a", task: "fetch" },
        { id: "b", task: "fetch" },
        { id: "c", task: "fetch" },
      ],
    };

    const dag = compileWorkflow(def);

    expect(dag.parallelGroups).toHaveLength(1);
    expect(dag.parallelGroups[0]).toHaveLength(3);
    expect(dag.parallelGroups[0]).toContain("a");
    expect(dag.parallelGroups[0]).toContain("b");
    expect(dag.parallelGroups[0]).toContain("c");
  });

  it("separates dependent steps into sequential groups", () => {
    const def: WorkflowDefinition = {
      name: "sequential",
      steps: [
        { id: "a", task: "first" },
        { id: "b", task: "second", depends_on: ["a"] },
        { id: "c", task: "third", depends_on: ["b"] },
      ],
    };

    const dag = compileWorkflow(def);

    expect(dag.parallelGroups).toHaveLength(3);
    expect(dag.parallelGroups[0]).toEqual(["a"]);
    expect(dag.parallelGroups[1]).toEqual(["b"]);
    expect(dag.parallelGroups[2]).toEqual(["c"]);
  });

  it("handles mixed parallel and sequential groups", () => {
    //  a   b
    //  |   |
    //  c   d
    //   \ /
    //    e
    const def: WorkflowDefinition = {
      name: "mixed",
      steps: [
        { id: "a", task: "start1" },
        { id: "b", task: "start2" },
        { id: "c", task: "mid1", depends_on: ["a"] },
        { id: "d", task: "mid2", depends_on: ["b"] },
        { id: "e", task: "end", depends_on: ["c", "d"] },
      ],
    };

    const dag = compileWorkflow(def);

    expect(dag.parallelGroups).toHaveLength(3);
    expect(dag.parallelGroups[0].sort()).toEqual(["a", "b"]);
    expect(dag.parallelGroups[1].sort()).toEqual(["c", "d"]);
    expect(dag.parallelGroups[2]).toEqual(["e"]);
  });

  it("handles fan-out pattern", () => {
    const def: WorkflowDefinition = {
      name: "fan-out",
      steps: [
        { id: "root", task: "start" },
        { id: "a", task: "branch1", depends_on: ["root"] },
        { id: "b", task: "branch2", depends_on: ["root"] },
        { id: "c", task: "branch3", depends_on: ["root"] },
      ],
    };

    const dag = compileWorkflow(def);

    expect(dag.parallelGroups).toHaveLength(2);
    expect(dag.parallelGroups[0]).toEqual(["root"]);
    expect(dag.parallelGroups[1].sort()).toEqual(["a", "b", "c"]);
  });
});
