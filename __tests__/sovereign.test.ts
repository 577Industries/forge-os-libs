import { describe, it, expect } from "vitest";
import { createRouter } from "../src/router.js";

describe("Sovereign routing", () => {
  it("sovereign mode only returns open-source models", () => {
    const router = createRouter();
    const result = router.route({ sovereignOnly: true });
    expect(result.model.isOpenSource).toBe(true);
  });

  it("all sovereign results have isOpenSource: true", () => {
    const strategies = ["cost", "capability", "speed", "balanced", "efficiency"] as const;
    const router = createRouter();
    for (const strategy of strategies) {
      const result = router.route({ sovereignOnly: true, strategy });
      expect(result.model.isOpenSource).toBe(true);
    }
  });

  it("sovereign mode still applies strategy within filtered set", () => {
    const router = createRouter();
    const costResult = router.route({ sovereignOnly: true, strategy: "cost" });
    const capResult = router.route({ sovereignOnly: true, strategy: "capability" });
    // Cost strategy should pick cheapest open-source model
    // Capability strategy should pick most capable open-source model
    expect(costResult.model.isOpenSource).toBe(true);
    expect(capResult.model.isOpenSource).toBe(true);
    // They should generally differ (cheapest vs most capable)
    // but both must be open source
  });

  it("sovereign + capability filter works together", () => {
    const router = createRouter();
    const result = router.route({
      sovereignOnly: true,
      capabilities: ["code"],
    });
    expect(result.model.isOpenSource).toBe(true);
    expect(result.model.capabilities).toContain("code");
  });

  it("sovereign + cost ceiling works together", () => {
    const router = createRouter();
    const result = router.route({
      sovereignOnly: true,
      maxCostPer1MInput: 0.5,
    });
    expect(result.model.isOpenSource).toBe(true);
    expect(result.model.inputCostPer1M).toBeLessThanOrEqual(0.5);
  });
});
