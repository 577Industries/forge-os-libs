/**
 * Strategy Comparison Example
 * Compare all 6 routing strategies on the same candidate set.
 *
 * Run: npx tsx examples/strategy-comparison.ts
 */
import { createRouter } from "../src/index.js";
import type { RoutingStrategy } from "../src/index.js";

const router = createRouter();
const strategies: RoutingStrategy[] = [
  "cost",
  "capability",
  "speed",
  "balanced",
  "efficiency",
  "custom",
];

console.log("\n  Strategy Comparison - All 14 models, no filters\n");
console.log(
  "  " +
    "Strategy".padEnd(14) +
    "Model".padEnd(28) +
    "Provider".padEnd(12) +
    "Input $/1M".padEnd(12) +
    "Latency".padEnd(10) +
    "Caps".padEnd(6) +
    "Score"
);
console.log("  " + "-".repeat(88));

for (const strategy of strategies) {
  const result = router.route({ strategy });
  const m = result.model;
  console.log(
    "  " +
      strategy.padEnd(14) +
      m.displayName.padEnd(28) +
      m.provider.padEnd(12) +
      ("$" + m.inputCostPer1M.toFixed(2)).padEnd(12) +
      m.latency.padEnd(10) +
      String(m.capabilities.length).padEnd(6) +
      result.score.toFixed(4)
  );
}

console.log("\n  SLM classification:");
const slmResult = router.route({ strategy: "cost" });
console.log(
  "  " + slmResult.model.displayName + " -> isSlm: " + slmResult.isSlm
);
console.log();
