/**
 * @577-industries/model-router
 * Multi-provider AI model router with 6 strategies, sovereign profile,
 * and composite scoring across 9+ providers.
 *
 * Patent: "Adaptive Model Routing" (Feb 2026)
 * License: Apache-2.0
 */

// Core router
export { ModelRouter, createRouter } from "./router.js";

// Types
export type {
  ModelEntry,
  ModelProvider,
  ModelCapability,
  RoutingStrategy,
  RouterConfig,
  CustomRoutingRule,
  RouteRequest,
  RouteResult,
} from "./types.js";

// Registry
export { DEFAULT_REGISTRY } from "./registry.js";

// Strategies
export {
  isSlmModel,
  selectCheapest,
  selectMostCapable,
  selectFastest,
  selectBalanced,
  selectMostEfficient,
  applyStrategy,
} from "./strategies.js";

// Cost estimation
export { estimateCost } from "./cost.js";
