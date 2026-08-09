/**
 * Cost Ceiling Example
 * Route with different maxCostPer1MInput values to see how
 * the candidate set changes.
 *
 * Run: npx tsx examples/cost-ceiling.ts
 */
import { createRouter } from "../src/index.js";

const router = createRouter();
const ceilings = [0.5, 1.0, 5.0];

console.log("\n  Cost Ceiling Routing\n");

for (const ceiling of ceilings) {
  console.log("  --- Max input cost: $" + ceiling.toFixed(2) + "/1M tokens ---");

  const candidates = router
    .getRegistry()
    .filter((m) => m.inputCostPer1M <= ceiling);
  console.log("  Available models: " + candidates.length);

  for (const m of candidates) {
    console.log(
      "    " +
        m.displayName.padEnd(28) +
        m.provider.padEnd(12) +
        "$" +
        m.inputCostPer1M.toFixed(2)
    );
  }

  const result = router.route({
    maxCostPer1MInput: ceiling,
    strategy: "balanced",
  });
  console.log(
    "  -> Balanced pick: " +
      result.model.displayName +
      " (score: " +
      result.score.toFixed(4) +
      ", isSlm: " +
      result.isSlm +
      ")"
  );
  console.log();
}
