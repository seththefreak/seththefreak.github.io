/*
 * Audit refactor:
 * - Added documented helpers for viewport, storage, event dispatch, and canvas work.
 * - Removed production console logging while keeping navigation resilient.
 * - Batched resize handlers with requestAnimationFrame to avoid repeated layout work.
 * - Preserved launcher labels, routes, and visual behavior for the GitHub Pages shell.
 */
(function () {
  'use strict';

  const compat = window.CompanionBrowserCompat || {};
  const LAST_SYSTEM_KEY = 'companion_last_system';
  const TRANSITION_MS = 620;
  const reducedMotionQuery = compat.matchMedia ? compat.matchMedia('(prefers-reduced-motion: reduce)') : window.matchMedia('(prefers-reduced-motion: reduce)');
  const browserInfo = typeof compat.getBrowserInfo === 'function' ? compat.getBrowserInfo() : {};

  const SYSTEM_MAP = {
    verloren: {
      label: 'Verloren RPG Sheets',
      href: 'index.html?app=verloren'
    },
    era: {
      label: 'UnheaveN: ERA Palimpsest',
      href: 'era/index.html'
    }
  };

  const app = document.getElementById('app');
  const canvas = document.getElementById('cosmos');
  const veil = document.getElementById('veil');
  const lastSystemText = document.getElementById('lastSystemText');
  const openLastSystemBtn = document.getElementById('openLastSystemBtn');
  const installAppBtn = document.getElementById('installAppBtn');
  const cards = Array.prototype.slice.call(document.querySelectorAll('.system-card[data-system][data-href]'));
  const ctaButtons = Array.prototype.slice.call(document.querySelectorAll('[data-system-cta]'));

  /**
   * Defers repeated event work until the next animation frame.
   * @param {Function} callback
   * @returns {Function}
   */
  function createRafThrottle(callback) {
    let ticking = false;
    return function rafThrottled() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        callback();
      });
    };
  }

  /**
   * Checks whether the current viewport should use the wider desktop treatment.
   * @returns {boolean}
   */
  function isDesktopViewport() {
    return Math.max(window.innerWidth || 0, document.documentElement ? document.documentElement.clientWidth || 0 : 0) > 720;
  }

  /**
   * Keeps 3D launcher layers from creating browser-specific stacking issues.
   * @returns {boolean}
   */
  function shouldUseSafeDesktopMode() {
    if (!isDesktopViewport()) return false;
    if (browserInfo.isIOS || /Android/i.test(browserInfo.userAgent || '')) return false;
    return true;
  }

  /**
   * Applies the class that disables unsafe depth transforms on desktop.
   * @returns {void}
   */
  function syncDesktopRenderingMode() {
    const root = document.documentElement;
    if (!root || !root.classList) return;

    if (shouldUseSafeDesktopMode()) {
      root.classList.add('launcher-safe-depth');
      if (app) app.style.transform = 'none';
      return;
    }

    root.classList.remove('launcher-safe-depth');
  }

  /**
   * Cross-browser closest wrapper used by legacy WebViews.
   * @param {Element | null} node
   * @param {string} selector
   * @returns {Element | null}
   */
  function findClosest(node, selector) {
    if (compat.closest) return compat.closest(node, selector);
    return node && typeof node.closest === 'function' ? node.closest(selector) : null;
  }

  /**
   * Updates a button label while preserving nested text spans.
   * @param {HTMLElement | null} button
   * @param {string} label
   * @returns {void}
   */
  function setButtonLabel(button, label) {
    if (!button) return;
    const labelNode = button.querySelector('.utility-btn-label');
    if (labelNode) {
      labelNode.textContent = label;
      return;
    }
    button.textContent = label;
  }

  /**
   * Reads the last selected system, guarding private-mode storage failures.
   * @returns {string}
   */
  function getLastSystem() {
    try {
      const key = localStorage.getItem(LAST_SYSTEM_KEY);
      return SYSTEM_MAP[key] ? key : '';
    } catch (error) {
      return '';
    }
  }

  /**
   * Persists the last selected system when storage is available.
   * @param {string} key
   * @returns {void}
   */
  function setLastSystem(key) {
    if (!SYSTEM_MAP[key]) return;
    try {
      localStorage.setItem(LAST_SYSTEM_KEY, key);
    } catch (error) {
      // Storage persistence is optional; navigation remains the source of truth.
    }
  }

  /**
   * Keeps legacy Verloren session routing compatible with the launcher.
   * @param {string} key
   * @returns {void}
   */
  function syncSessionFlags(key) {
    try {
      if (key === 'verloren') {
        sessionStorage.setItem('verloren_active', '1');
        return;
      }
      sessionStorage.removeItem('verloren_active');
    } catch (error) {
      // Session flags only improve route restoration; blocked storage can fall through.
    }
  }

  /**
   * Synchronizes the "last system" launcher controls.
   * @returns {void}
   */
  function updateLastSystemUI() {
    const key = getLastSystem();
    const entry = SYSTEM_MAP[key];

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

  /**
   * Emits an optional integration event for external listeners.
   * @param {string} key
   * @returns {void}
   */
  function dispatchSelectionEvent(key) {
    try {
      window.dispatchEvent(new CustomEvent('unheavenSelect', {
        detail: { system: key }
      }));
    } catch (error) {
      // Optional event dispatch must never block navigation.
    }
  }

  /**
   * Stores selection state and navigates with the existing veil transition.
   * @param {string} key
   * @param {string=} href
   * @returns {void}
   */
  function goToSystem(key, href) {
    const entry = SYSTEM_MAP[key];
    const target = (entry && entry.href) || href || '';
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

  /**
   * Activates a launcher card from click, keyboard, or CTA handlers.
   * @param {Element | null} card
   * @returns {void}
   */
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
      const card = findClosest(button, '.system-card');
      handleCardActivation(card);
    });
  });

  if (openLastSystemBtn) {
    openLastSystemBtn.addEventListener('click', function () {
      const key = getLastSystem();
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

    const context = canvas.getContext('2d');
    if (!context) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars = [];

    /**
     * Rebuilds the star field for the current canvas dimensions.
     * @returns {void}
     */
    function buildStars() {
      stars = [];
      const total = Math.max(60, Math.floor(width * height / 6000));

      for (let index = 0; index < total; index += 1) {
        const roll = Math.random();
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

    /**
     * Resizes the canvas in one frame and redraws the non-animated fallback.
     * @returns {void}
     */
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

    /**
     * Draws one cosmos frame without reading layout mid-draw.
     * @param {number} timestamp
     * @returns {void}
     */
    function renderFrame(timestamp) {
      const time = timestamp || 0;
      context.clearRect(0, 0, width, height);

      const background = context.createRadialGradient(width * 0.5, height * 0.42, 0, width * 0.5, height * 0.42, Math.max(width, height) * 0.8);
      background.addColorStop(0, '#11101e');
      background.addColorStop(0.5, '#0d0e15');
      background.addColorStop(1, '#0F1115');
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);

      const nebulaLeft = context.createRadialGradient(width * 0.1, height * 0.18, 0, width * 0.1, height * 0.18, width * 0.32);
      nebulaLeft.addColorStop(0, 'rgba(109, 93, 211, 0.065)');
      nebulaLeft.addColorStop(1, 'rgba(109, 93, 211, 0)');
      context.fillStyle = nebulaLeft;
      context.fillRect(0, 0, width, height);

      const nebulaRight = context.createRadialGradient(width * 0.9, height * 0.82, 0, width * 0.9, height * 0.82, width * 0.32);
      nebulaRight.addColorStop(0, 'rgba(191, 161, 74, 0.05)');
      nebulaRight.addColorStop(1, 'rgba(191, 161, 74, 0)');
      context.fillStyle = nebulaRight;
      context.fillRect(0, 0, width, height);

      stars.forEach(function (star) {
        const pulse = reducedMotionQuery.matches ? 1 : (Math.sin(time * star.speed * 800 + star.phase) * 0.33 + 0.67);
        context.globalAlpha = star.alpha * pulse;
        context.fillStyle = star.color;
        context.beginPath();
        context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        context.fill();
      });

      context.globalAlpha = 1;
    }

    /**
     * Continues the lightweight canvas animation while motion is allowed.
     * @param {number} timestamp
     * @returns {void}
     */
    function animate(timestamp) {
      renderFrame(timestamp);
      window.requestAnimationFrame(animate);
    }

    window.addEventListener('resize', createRafThrottle(resize), { passive: true });
    resize();

    if (!reducedMotionQuery.matches) {
      window.requestAnimationFrame(animate);
    }
  }

  function setupParallax() {
    if (!app || reducedMotionQuery.matches) return;
    if (shouldUseSafeDesktopMode()) return;
    if ((compat.matchMedia ? compat.matchMedia('(pointer: coarse)') : window.matchMedia('(pointer: coarse)')).matches) return;

    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let ticking = false;

    /**
     * Applies a small pointer-driven transform in a single animation frame.
     * @returns {void}
     */
    function update() {
      ticking = false;
      const rotateX = ((pointerY / window.innerHeight) - 0.5) * -0.3;
      const rotateY = ((pointerX / window.innerWidth) - 0.5) * 0.45;
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
  window.addEventListener('resize', createRafThrottle(syncDesktopRenderingMode), { passive: true });
  updateLastSystemUI();
  setupCosmos();
  setupParallax();
})();
