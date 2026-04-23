(function () {
  var compat = window.CompanionBrowserCompat || {};
  var LAST_SYSTEM_KEY = 'companion_last_system';
  var TRANSITION_MS = 620;
  var reducedMotionQuery = compat.matchMedia ? compat.matchMedia('(prefers-reduced-motion: reduce)') : window.matchMedia('(prefers-reduced-motion: reduce)');
  var browserInfo = typeof compat.getBrowserInfo === 'function' ? compat.getBrowserInfo() : {};
  var supportsBackdropFilter = typeof compat.supportsBackdropFilter === 'function' ? compat.supportsBackdropFilter() : false;

  var SYSTEM_MAP = {
    verloren: {
      label: 'Verloren RPG Sheets',
      href: 'index.html?app=verloren'
    },
    era: {
      label: 'UnheaveN: ERA Palimpsest',
      href: 'era/index.html'
    }
  };

  var app = document.getElementById('app');
  var canvas = document.getElementById('cosmos');
  var veil = document.getElementById('veil');
  var lastSystemText = document.getElementById('lastSystemText');
  var openLastSystemBtn = document.getElementById('openLastSystemBtn');
  var installAppBtn = document.getElementById('installAppBtn');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.system-card[data-system][data-href]'));
  var ctaButtons = Array.prototype.slice.call(document.querySelectorAll('[data-system-cta]'));

  function isDesktopViewport() {
    return Math.max(window.innerWidth || 0, document.documentElement ? document.documentElement.clientWidth || 0 : 0) > 720;
  }

  function shouldUseSafeDesktopMode() {
    if (!isDesktopViewport()) return false;
    if (browserInfo.isIOS || /Android/i.test(browserInfo.userAgent || '')) return false;
    // All desktop browsers use safe mode: preserve-3d + pointer parallax
    // causes z-index to be ignored in favour of 3D depth order, pushing
    // card-bg in front of content. Chrome was previously missing from this
    // check (it supports backdrop-filter, so !supportsBackdropFilter = false).
    return true;
  }

  function syncDesktopRenderingMode() {
    var root = document.documentElement;
    if (!root || !root.classList) return;

    if (shouldUseSafeDesktopMode()) {
      root.classList.add('launcher-safe-depth');
      if (app) app.style.transform = 'none';
      return;
    }

    root.classList.remove('launcher-safe-depth');
  }

  function findClosest(node, selector) {
    if (compat.closest) return compat.closest(node, selector);
    return node && typeof node.closest === 'function' ? node.closest(selector) : null;
  }

  function setButtonLabel(button, label) {
    if (!button) return;
    var labelNode = button.querySelector('.utility-btn-label');
    if (labelNode) {
      labelNode.textContent = label;
      return;
    }
    button.textContent = label;
  }

  function getLastSystem() {
    var key = localStorage.getItem(LAST_SYSTEM_KEY);
    return SYSTEM_MAP[key] ? key : '';
  }

  function setLastSystem(key) {
    if (!SYSTEM_MAP[key]) return;
    localStorage.setItem(LAST_SYSTEM_KEY, key);
  }

  function syncSessionFlags(key) {
    if (key === 'verloren') {
      sessionStorage.setItem('verloren_active', '1');
      return;
    }
    sessionStorage.removeItem('verloren_active');
  }

  function updateLastSystemUI() {
    var key = getLastSystem();
    var entry = SYSTEM_MAP[key];

    if (!entry) {
      if (lastSystemText) lastSystemText.textContent = 'Nenhum sistema aberto ainda.';
      if (openLastSystemBtn) {
        openLastSystemBtn.disabled = true;
        setButtonLabel(openLastSystemBtn, 'Ultimo sistema');
      }
      return;
    }

    if (lastSystemText) lastSystemText.textContent = entry.label;
    if (openLastSystemBtn) {
      openLastSystemBtn.disabled = false;
      setButtonLabel(openLastSystemBtn, key === 'verloren' ? 'Abrir Verloren' : 'Abrir ERA');
    }
  }

  function dispatchSelectionEvent(key) {
    try {
      window.dispatchEvent(new CustomEvent('unheavenSelect', {
        detail: { system: key }
      }));
    } catch (error) {
      console.warn('[launcher] Falha ao emitir evento de selecao.', error);
    }
  }

  function goToSystem(key, href) {
    var entry = SYSTEM_MAP[key];
    var target = (entry && entry.href) || href || '';
    if (!target) return;

    setLastSystem(key);
    syncSessionFlags(key);
    dispatchSelectionEvent(key);

    if (!veil || reducedMotionQuery.matches) {
      window.location.href = target;
      return;
    }

    veil.dataset.system = key;
    veil.classList.add('show');

    window.setTimeout(function () {
      window.location.href = target;
    }, TRANSITION_MS);
  }

  function handleCardActivation(card) {
    if (!card) return;
    goToSystem(card.getAttribute('data-system'), card.getAttribute('data-href'));
  }

  cards.forEach(function (card) {
    card.addEventListener('click', function (event) {
      if (findClosest(event.target, '[data-system-cta]')) return;
      handleCardActivation(card);
    });

    card.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      handleCardActivation(card);
    });
  });

  ctaButtons.forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      var card = findClosest(button, '.system-card');
      handleCardActivation(card);
    });
  });

  if (openLastSystemBtn) {
    openLastSystemBtn.addEventListener('click', function () {
      var key = getLastSystem();
      if (!key) return;
      goToSystem(key);
    });
  }

  if (installAppBtn) {
    installAppBtn.addEventListener('click', function () {
      if (typeof window.promptInstallApp === 'function') {
        window.promptInstallApp();
      }
    });
  }

  window.addEventListener('pageshow', function () {
    if (!veil) return;
    veil.classList.remove('show');
    veil.dataset.system = '';
  });

  function setupCosmos() {
    if (!canvas) return;

    var context = canvas.getContext('2d');
    if (!context) return;

    var width = 0;
    var height = 0;
    var dpr = 1;
    var stars = [];
    var animationFrameId = 0;

    function buildStars() {
      stars = [];
      var total = Math.max(60, Math.floor(width * height / 6000));

      for (var index = 0; index < total; index += 1) {
        var roll = Math.random();
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 0.9 + 0.12,
          alpha: Math.random() * 0.5 + 0.08,
          speed: Math.random() * 0.0003 + 0.00008,
          phase: Math.random() * Math.PI * 2,
          color: roll > 0.9 ? '#A78BFA' : roll > 0.8 ? '#22D3EE' : roll > 0.73 ? '#FDE68A' : '#E5E7EB'
        });
      }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();
      renderFrame(0);
    }

    function renderFrame(timestamp) {
      var time = timestamp || 0;
      context.clearRect(0, 0, width, height);

      var background = context.createRadialGradient(width * 0.5, height * 0.42, 0, width * 0.5, height * 0.42, Math.max(width, height) * 0.8);
      background.addColorStop(0, '#11101e');
      background.addColorStop(0.5, '#0d0e15');
      background.addColorStop(1, '#0F1115');
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);

      var nebulaLeft = context.createRadialGradient(width * 0.1, height * 0.18, 0, width * 0.1, height * 0.18, width * 0.32);
      nebulaLeft.addColorStop(0, 'rgba(109, 93, 211, 0.065)');
      nebulaLeft.addColorStop(1, 'rgba(109, 93, 211, 0)');
      context.fillStyle = nebulaLeft;
      context.fillRect(0, 0, width, height);

      var nebulaRight = context.createRadialGradient(width * 0.9, height * 0.82, 0, width * 0.9, height * 0.82, width * 0.32);
      nebulaRight.addColorStop(0, 'rgba(191, 161, 74, 0.05)');
      nebulaRight.addColorStop(1, 'rgba(191, 161, 74, 0)');
      context.fillStyle = nebulaRight;
      context.fillRect(0, 0, width, height);

      stars.forEach(function (star) {
        var pulse = reducedMotionQuery.matches ? 1 : (Math.sin(time * star.speed * 800 + star.phase) * 0.33 + 0.67);
        context.globalAlpha = star.alpha * pulse;
        context.fillStyle = star.color;
        context.beginPath();
        context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        context.fill();
      });

      context.globalAlpha = 1;
    }

    function animate(timestamp) {
      renderFrame(timestamp);
      animationFrameId = window.requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    if (!reducedMotionQuery.matches) {
      animationFrameId = window.requestAnimationFrame(animate);
    }
  }

  function setupParallax() {
    if (!app || reducedMotionQuery.matches) return;
    if (shouldUseSafeDesktopMode()) return;
    if ((compat.matchMedia ? compat.matchMedia('(pointer: coarse)') : window.matchMedia('(pointer: coarse)')).matches) return;

    var pointerX = window.innerWidth / 2;
    var pointerY = window.innerHeight / 2;
    var ticking = false;

    function update() {
      ticking = false;
      var rotateX = ((pointerY / window.innerHeight) - 0.5) * -0.3;
      var rotateY = ((pointerX / window.innerWidth) - 0.5) * 0.45;
      app.style.transform = 'perspective(1400px) rotateY(' + rotateY + 'deg) rotateX(' + rotateX + 'deg)';
    }

    window.addEventListener('pointermove', function (event) {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    window.addEventListener('pointerleave', function () {
      app.style.transform = '';
    });
  }

  syncDesktopRenderingMode();
  window.addEventListener('resize', syncDesktopRenderingMode, { passive: true });
  updateLastSystemUI();
  setupCosmos();
  setupParallax();
})();
