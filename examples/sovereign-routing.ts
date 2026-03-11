/**
 * Sovereign Routing Example
 * Filter to open-source models only using sovereignOnly flag.
 *
 * Run: npx tsx examples/sovereign-routing.ts
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
];

console.log("\n  Sovereign Routing - Open-source models only\n");

const allModels = router.getRegistry();
const osModels = allModels.filter((m) => m.isOpenSource);
console.log("  Open-source models in registry: " + osModels.length + "/" + allModels.length);
console.log();

for (const m of osModels) {
  console.log(
    "    " +
      m.displayName.padEnd(28) +
      m.provider.padEnd(12) +
      ("$" + m.inputCostPer1M.toFixed(2)).padEnd(10) +
      m.capabilities.join(", ")
  );
}

console.log("\n  Routing results with sovereignOnly: true\n");
console.log(
  "  " +
    "Strategy".padEnd(14) +
    "Model".padEnd(28) +
    "Provider".padEnd(12) +
    "Input $/1M".padEnd(12) +
    "Score"
);
console.log("  " + "-".repeat(70));

for (const strategy of strategies) {
  const result = router.route({ sovereignOnly: true, strategy });
  const m = result.model;
  console.log(
    "  " +
      strategy.padEnd(14) +
      m.displayName.padEnd(28) +
      m.provider.padEnd(12) +
      ("$" + m.inputCostPer1M.toFixed(2)).padEnd(12) +
      result.score.toFixed(4)
  );
}
console.log();
