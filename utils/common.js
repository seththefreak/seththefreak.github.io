(function (global) {
  var utils = global.CompanionUtils || (global.CompanionUtils = {});

  function toNumber(value, fallback) {
    var numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : (fallback === undefined ? 0 : fallback);
  }

  function clampNumber(value, min, max) {
    return Math.max(min, Math.min(max, toNumber(value, min)));
  }

  function uniqueIds(list) {
    return Array.from(new Set((Array.isArray(list) ? list : []).filter(Boolean)));
  }

  function normalizeSearchText(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function includesNormalized(value, query) {
    var normalizedQuery = normalizeSearchText(query);
    return !normalizedQuery || normalizeSearchText(value).includes(normalizedQuery);
  }

  function formatSigned(value) {
    var numeric = toNumber(value, 0);
    return numeric > 0 ? '+' + numeric : String(numeric);
  }

  function createId(prefix) {
    return (prefix || 'id') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function best(values) {
    var list = Array.isArray(values) ? values : [];
    return list.length ? Math.max.apply(Math, list) : 0;
  }

  function sumBy(list, iteratee) {
    return (Array.isArray(list) ? list : []).reduce(function (total, item, index) {
      return total + toNumber(iteratee(item, index), 0);
    }, 0);
  }

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
