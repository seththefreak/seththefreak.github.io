/*
 * Audit refactor:
 * - Kept splash randomization isolated and testable.
 * - Guarded custom RNG edge cases so a value of 1 cannot select past the array.
 * - Preserved Math.random distribution for normal runtime.
 */

/**
 * Selects one item from a list using a uniform random sample.
 * @param {*[]} items
 * @param {Function} random
 * @returns {*}
 */
export function selectRandomVariant(items, random = Math.random) {
  const pool = Array.isArray(items) ? items : [];
  if (!pool.length) return "";
  const sample = Math.max(0, Math.min(Number(random()) || 0, 0.9999999999999999));
  const index = Math.floor(sample * pool.length);
  return pool[index] || pool[0] || "";
}
