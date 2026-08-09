import { describe, it, expect } from "vitest";
import { compileWorkflow } from "../src/compiler.js";
import { toMermaid } from "../src/visualize.js";
import type { WorkflowDefinition } from "../src/types.js";

describe("toMermaid", () => {
  it("generates valid Mermaid syntax", () => {
    const def: WorkflowDefinition = {
      name: "test",
      steps: [
        { id: "a", task: "Fetch Data" },
        { id: "b", task: "Process", depends_on: ["a"] },
      ],
    };

    const dag = compileWorkflow(def);
    const mermaid = toMermaid(dag);

    expect(mermaid).toContain("graph TD");
    expect(mermaid).toContain('a["Fetch Data"]');
    expect(mermaid).toContain('b["Process"]');
    expect(mermaid).toContain("a --> b");
  });

  it("handles nodes with no edges", () => {
    const def: WorkflowDefinition = {
      name: "no-edges",
      steps: [
        { id: "a", task: "Independent A" },
        { id: "b", task: "Independent B" },
      ],
    };

    const dag = compileWorkflow(def);
    const mermaid = toMermaid(dag);

    expect(mermaid).toContain('a["Independent A"]');
    expect(mermaid).toContain('b["Independent B"]');
    expect(mermaid).not.toContain("-->");
  });

  it("handles diamond pattern edges", () => {
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
    const mermaid = toMermaid(dag);

    expect(mermaid).toContain("a --> b");
    expect(mermaid).toContain("a --> c");
    expect(mermaid).toContain("b --> d");
    expect(mermaid).toContain("c --> d");
  });

  it("handles empty DAG", () => {
    const def: WorkflowDefinition = { name: "empty", steps: [] };
    const dag = compileWorkflow(def);
    const mermaid = toMermaid(dag);

    expect(mermaid).toBe("graph TD");
  });
});
