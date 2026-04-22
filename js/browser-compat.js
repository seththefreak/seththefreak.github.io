(function (global) {
  var documentRef = global.document;
  var browserInfoCache = null;

  function defineProperty(target, key, value) {
    if (!target || key in target) return;
    try {
      Object.defineProperty(target, key, {
        configurable: true,
        writable: true,
        value: value,
      });
    } catch (error) {
      target[key] = value;
    }
  }

  if (typeof Object.assign !== 'function') {
    Object.assign = function assign(target) {
      if (target == null) throw new TypeError('Cannot convert undefined or null to object');
      var output = Object(target);
      for (var index = 1; index < arguments.length; index += 1) {
        var source = arguments[index];
        if (source == null) continue;
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            output[key] = source[key];
          }
        }
      }
      return output;
    };
  }

  if (!Number.isFinite) {
    Number.isFinite = function isFiniteNumber(value) {
      return typeof value === 'number' && global.isFinite(value);
    };
  }

  if (!Array.from) {
    Array.from = function from(arrayLike, mapFn, thisArg) {
      var list = [];
      if (!arrayLike) return list;
      var length = Math.max(0, Math.min(Number(arrayLike.length) || 0, Number.MAX_SAFE_INTEGER || 9007199254740991));
      for (var index = 0; index < length; index += 1) {
        var value = arrayLike[index];
        list.push(typeof mapFn === 'function' ? mapFn.call(thisArg, value, index) : value);
      }
      return list;
    };
  }

  if (!Array.prototype.includes) {
    defineProperty(Array.prototype, 'includes', function includes(searchElement, fromIndex) {
      var object = Object(this);
      var length = parseInt(object.length, 10) || 0;
      if (!length) return false;
      var start = parseInt(fromIndex, 10) || 0;
      if (start < 0) start = Math.max(length + start, 0);
      while (start < length) {
        var value = object[start];
        if (value === searchElement || (value !== value && searchElement !== searchElement)) return true;
        start += 1;
      }
      return false;
    });
  }

  if (!String.prototype.includes) {
    defineProperty(String.prototype, 'includes', function includes(search, start) {
      return this.indexOf(search, start || 0) !== -1;
    });
  }

  if (!global.requestAnimationFrame) {
    global.requestAnimationFrame = function requestAnimationFrameFallback(callback) {
      return global.setTimeout(function () {
        callback(Date.now());
      }, 16);
    };
  }

  if (!global.cancelAnimationFrame) {
    global.cancelAnimationFrame = function cancelAnimationFrameFallback(handle) {
      global.clearTimeout(handle);
    };
  }

  if (typeof global.CustomEvent !== 'function') {
    var CustomEventFallback = function CustomEventFallback(event, params) {
      var options = params || { bubbles: false, cancelable: false, detail: null };
      var customEvent;

      if (documentRef && typeof documentRef.createEvent === 'function') {
        customEvent = documentRef.createEvent('CustomEvent');
        customEvent.initCustomEvent(event, !!options.bubbles, !!options.cancelable, options.detail);
        return customEvent;
      }

      customEvent = { type: event, detail: options.detail };
      return customEvent;
    };

    CustomEventFallback.prototype = global.Event ? global.Event.prototype : {};
    global.CustomEvent = CustomEventFallback;
  }

  if (!global.matchMedia) {
    global.matchMedia = function matchMediaFallback(query) {
      return {
        matches: false,
        media: String(query || ''),
        onchange: null,
        addListener: function addListener() {},
        removeListener: function removeListener() {},
        addEventListener: function addEventListener() {},
        removeEventListener: function removeEventListener() {},
        dispatchEvent: function dispatchEvent() { return false; },
      };
    };
  }

  var elementPrototype = global.Element && global.Element.prototype;
  if (elementPrototype && !elementPrototype.matches) {
    elementPrototype.matches =
      elementPrototype.msMatchesSelector ||
      elementPrototype.webkitMatchesSelector ||
      function matchesFallback(selector) {
        var nodeList = (this.document || this.ownerDocument).querySelectorAll(selector);
        var index = 0;
        while (nodeList[index] && nodeList[index] !== this) index += 1;
        return !!nodeList[index];
      };
  }

  if (elementPrototype && !elementPrototype.closest) {
    elementPrototype.closest = function closestFallback(selector) {
      var current = this;
      while (current && current.nodeType === 1) {
        if (current.matches(selector)) return current;
        current = current.parentElement || current.parentNode;
      }
      return null;
    };
  }

  function matchMediaSafe(query) {
    try {
      return global.matchMedia(query);
    } catch (error) {
      return global.matchMedia('');
    }
  }

  function closestSafe(node, selector) {
    var current = node;
    while (current) {
      if (current.nodeType === 1 && typeof current.closest === 'function') {
        return current.closest(selector);
      }
      current = current.parentNode;
    }
    return null;
  }

  function getBrowserInfo() {
    if (browserInfoCache) return browserInfoCache;

    var ua = (global.navigator && global.navigator.userAgent) || '';
    var isOpera = /OPR\/|Opera/.test(ua);
    var isEdge = /Edg\//.test(ua);
    var isFirefox = /Firefox\//.test(ua);
    var isSamsung = /SamsungBrowser\//.test(ua);
    var isIOS = /iPad|iPhone|iPod/.test(ua);
    var isSafari = !isOpera && !isEdge && !isFirefox && /Safari\//.test(ua) && /AppleWebKit\//.test(ua);
    var isChromeLike = !isSafari && !isFirefox && (/Chrome\//.test(ua) || isOpera || isEdge || isSamsung);
    var name = isOpera
      ? 'Opera'
      : isEdge
        ? 'Edge'
        : isFirefox
          ? 'Firefox'
          : isSafari
            ? 'Safari'
            : isChromeLike
              ? 'Chrome'
              : 'navegador';

    browserInfoCache = {
      name: name,
      isOpera: isOpera,
      isEdge: isEdge,
      isFirefox: isFirefox,
      isSafari: isSafari,
      isSamsung: isSamsung,
      isChromeLike: isChromeLike,
      isIOS: isIOS,
      userAgent: ua,
    };
    return browserInfoCache;
  }

  function getManualInstallMessage() {
    var info = getBrowserInfo();

    if (info.isIOS) {
      return 'No ' + info.name + ' para iPhone ou iPad, use Compartilhar > Adicionar a Tela de Inicio.';
    }
    if (info.isOpera) {
      return 'No Opera, abra o menu do navegador e use "Instalar app" ou "Adicionar a tela inicial".';
    }
    if (info.isFirefox) {
      return 'No Firefox, use o menu do navegador para criar um atalho ou adicionar a tela inicial; a instalacao PWA varia por plataforma.';
    }
    if (info.isSafari) {
      return 'No Safari, use Compartilhar > Adicionar a Tela de Inicio.';
    }
    if (info.isChromeLike) {
      return 'Use o menu do navegador e procure por "Instalar app" ou "Adicionar a tela inicial".';
    }
    return 'Use o menu do navegador para abrir este companion em modo web ou criar um atalho.';
  }

  function supportsBackdropFilter() {
    if (!global.CSS || typeof global.CSS.supports !== 'function') return false;
    return global.CSS.supports('backdrop-filter', 'blur(1px)') || global.CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
  }

  function applyBrowserClasses() {
    if (!documentRef || !documentRef.documentElement || !documentRef.documentElement.classList) return;

    var info = getBrowserInfo();
    var root = documentRef.documentElement;
    var classes = [
      info.isOpera ? 'browser-opera' : '',
      info.isFirefox ? 'browser-firefox' : '',
      info.isSafari ? 'browser-safari' : '',
      info.isChromeLike ? 'browser-chromium' : '',
      info.isIOS ? 'browser-ios' : '',
      info.isIOS || /Android/i.test(info.userAgent || '') ? 'browser-mobile' : 'browser-desktop',
      supportsBackdropFilter() ? 'supports-backdrop-filter' : 'no-backdrop-filter',
    ];

    for (var index = 0; index < classes.length; index += 1) {
      if (classes[index]) root.classList.add(classes[index]);
    }
  }

  global.CompanionBrowserCompat = Object.assign({}, global.CompanionBrowserCompat, {
    matchMedia: matchMediaSafe,
    closest: closestSafe,
    getBrowserInfo: getBrowserInfo,
    getManualInstallMessage: getManualInstallMessage,
    supportsBackdropFilter: supportsBackdropFilter,
    applyBrowserClasses: applyBrowserClasses,
  });

  applyBrowserClasses();
})(window);
