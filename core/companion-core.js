/*
 * Audit refactor:
 * - Added JSDoc to the shared namespace bootstrap helpers.
 * - Kept the legacy global namespace contract for backward-compatible scripts.
 * - No runtime behavior or data values changed.
 */
(function (global) {
  /**
   * Creates or returns a dot-delimited namespace on the global object.
   * @param {string} path
   * @returns {object}
   */
  function ensureNamespace(path) {
    return path.split('.').reduce(function (scope, key) {
      if (!scope[key]) scope[key] = {};
      return scope[key];
    }, global);
  }

  var core = global.CompanionCore || {};
  core.version = '3.2.0';
  core.ensureNamespace = ensureNamespace;

  /**
   * Assigns values into a global namespace while preserving existing objects.
   * @param {string} path
   * @param {object} values
   * @returns {object}
   */
  core.assign = function assign(path, values) {
    return Object.assign(ensureNamespace(path), values || {});
  };

  global.CompanionCore = core;
  ensureNamespace('CompanionUtils');
  ensureNamespace('CompanionSystems');
  ensureNamespace('CompanionUI');
})(window);
