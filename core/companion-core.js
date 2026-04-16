(function (global) {
  function ensureNamespace(path) {
    return path.split('.').reduce(function (scope, key) {
      if (!scope[key]) scope[key] = {};
      return scope[key];
    }, global);
  }

  var core = global.CompanionCore || {};
  core.version = '3.2.0';
  core.ensureNamespace = ensureNamespace;
  core.assign = function assign(path, values) {
    return Object.assign(ensureNamespace(path), values || {});
  };

  global.CompanionCore = core;
  ensureNamespace('CompanionUtils');
  ensureNamespace('CompanionSystems');
  ensureNamespace('CompanionUI');
})(window);
