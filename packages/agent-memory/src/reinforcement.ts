/**
 * Logarithmic reinforcement — confidence grows with diminishing returns.
 * Formula: confidence += 0.1 * (1.0 / ln(count + 2))
 */

export function computeReinforcement(
  currentConfidence: number,
  reinforcementCount: number
): number {
  const increment = 0.1 * (1.0 / Math.log(reinforcementCount + 2));
  return Math.min(1.0, currentConfidence + increment);
}
