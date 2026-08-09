/**
 * YAML parser for workflow definitions.
 * Uses the `yaml` package for real YAML parsing (not JSON fallback).
 */

import { parse } from "yaml";
import type { WorkflowDefinition } from "./types.js";

export function parseYaml(yamlString: string): WorkflowDefinition {
  const parsed = parse(yamlString);

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid workflow definition: expected an object");
  }

  if (!parsed.name || typeof parsed.name !== "string") {
    throw new Error("Invalid workflow definition: 'name' is required");
  }

  if (!Array.isArray(parsed.steps)) {
    throw new Error("Invalid workflow definition: 'steps' must be an array");
  }

  for (const step of parsed.steps) {
    if (!step.id || typeof step.id !== "string") {
      throw new Error("Invalid workflow step: 'id' is required");
    }
    if (!step.task || typeof step.task !== "string") {
      throw new Error(`Invalid workflow step "${step.id}": 'task' is required`);
    }
  }

  return parsed as WorkflowDefinition;
}
