import { describe, it, expect } from "vitest";
import { computeReinforcement } from "../src/reinforcement.js";

describe("computeReinforcement", () => {
  it("first reinforcement adds ~0.144 (0.1/ln(2))", () => {
    const result = computeReinforcement(0.5, 0);
    const expected = 0.5 + 0.1 / Math.log(2);
    expect(result).toBeCloseTo(expected, 5);
  });

  it("second reinforcement adds ~0.091 (0.1/ln(3))", () => {
    const afterFirst = computeReinforcement(0.5, 0);
    const result = computeReinforcement(afterFirst, 1);
    const expected = afterFirst + 0.1 / Math.log(3);
    expect(result).toBeCloseTo(expected, 5);
  });

  it("confidence never exceeds 1.0", () => {
    let confidence = 0.99;
    for (let i = 0; i < 100; i++) {
      confidence = computeReinforcement(confidence, i);
    }
    expect(confidence).toBeLessThanOrEqual(1.0);
  });

  it("shows diminishing returns (logarithmic)", () => {
    const increments: number[] = [];
    let prev = 0.5;
    for (let i = 0; i < 5; i++) {
      const next = computeReinforcement(prev, i);
      increments.push(next - prev);
      prev = next;
    }

    // Each increment should be smaller than the previous
    for (let i = 1; i < increments.length; i++) {
      expect(increments[i]).toBeLessThan(increments[i - 1]);
    }
  });

  it("works from zero confidence", () => {
    const result = computeReinforcement(0, 0);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(1);
  });
});
