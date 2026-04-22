/*
 * Responsibility: keep splash randomization isolated and testable.
 * Exports: selectRandomVariant.
 */

export function selectRandomVariant(items, random = Math.random) {
  const pool = Array.isArray(items) ? items : [];
  if (!pool.length) return "";
  const index = Math.floor(random() * pool.length);
  return pool[index] || pool[0] || "";
}
