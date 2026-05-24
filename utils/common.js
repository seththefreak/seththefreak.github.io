/*
 * Audit refactor:
 * - Added JSDoc to shared utility helpers used across systems.
 * - Preserved legacy global exports and helper behavior.
 * - Left ID generation and formatting outputs backward-compatible.
 */
(function (global) {
  var utils = global.CompanionUtils || (global.CompanionUtils = {});

  /**
   * Converts a value to a finite number with fallback.
   * @param {*} value
   * @param {number=} fallback
   * @returns {number}
   */
  function toNumber(value, fallback) {
    var numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : (fallback === undefined ? 0 : fallback);
  }

  /**
   * Clamps a numeric value between min and max.
   * @param {*} value
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  function clampNumber(value, min, max) {
    return Math.max(min, Math.min(max, toNumber(value, min)));
  }

  /**
   * Returns truthy unique ids while preserving order.
   * @param {*[]} list
   * @returns {*[]}
   */
  function uniqueIds(list) {
    return Array.from(new Set((Array.isArray(list) ? list : []).filter(Boolean)));
  }

  /**
   * Normalizes text for accent-insensitive search.
   * @param {*} value
   * @returns {string}
   */
  function normalizeSearchText(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  /**
   * Checks whether normalized text contains a normalized query.
   * @param {*} value
   * @param {*} query
   * @returns {boolean}
   */
  function includesNormalized(value, query) {
    var normalizedQuery = normalizeSearchText(query);
    return !normalizedQuery || normalizeSearchText(value).includes(normalizedQuery);
  }

  /**
   * Formats a number with a leading plus sign when positive.
   * @param {*} value
   * @returns {string}
   */
  function formatSigned(value) {
    var numeric = toNumber(value, 0);
    return numeric > 0 ? '+' + numeric : String(numeric);
  }

  /**
   * Creates a reasonably unique client-side id.
   * @param {string=} prefix
   * @returns {string}
   */
  function createId(prefix) {
    return (prefix || 'id') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /**
   * Returns the highest number in a list or zero for empty input.
   * @param {number[]} values
   * @returns {number}
   */
  function best(values) {
    var list = Array.isArray(values) ? values : [];
    return list.length ? Math.max.apply(Math, list) : 0;
  }

  /**
   * Sums mapped numeric values from a list.
   * @param {*[]} list
   * @param {Function} iteratee
   * @returns {number}
   */
  function sumBy(list, iteratee) {
    return (Array.isArray(list) ? list : []).reduce(function (total, item, index) {
      return total + toNumber(iteratee(item, index), 0);
    }, 0);
  }

  /**
   * Escapes text for HTML string templates.
   * @param {*} value
   * @returns {string}
   */
  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  Object.assign(utils, {
    toNumber: toNumber,
    clampNumber: clampNumber,
    uniqueIds: uniqueIds,
    normalizeSearchText: normalizeSearchText,
    includesNormalized: includesNormalized,
    formatSigned: formatSigned,
    createId: createId,
    best: best,
    sumBy: sumBy,
    escapeHtml: escapeHtml,
  });
})(window);
