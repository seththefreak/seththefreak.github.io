/*
 * Audit refactor:
 * - Wrapped install/service-worker state in a closure to avoid implicit globals.
 * - Removed production console logging and surfaced failures through existing UI text.
 * - Guarded service-worker update reloads to avoid first-install reload races.
 * - Added JSDoc to the non-trivial browser/PWA helpers.
 */
(function () {
  'use strict';

  let deferredInstallPrompt = null;
  let hasPendingServiceWorkerReload = false;
  const browserCompat = window.CompanionBrowserCompat || {};
  const hadServiceWorkerController = 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;

  /**
   * Uses the compatibility layer when available, then falls back to matchMedia.
   * @param {string} query
   * @returns {MediaQueryList | null}
   */
  function getCompatMatchMedia(query) {
    if (browserCompat.matchMedia) return browserCompat.matchMedia(query);
    return typeof window.matchMedia === 'function' ? window.matchMedia(query) : null;
  }

  /**
   * Reads normalized browser data for install guidance.
   * @returns {{name: string, isOpera: boolean, isFirefox: boolean, isSafari: boolean, isChromeLike: boolean, isIOS: boolean}}
   */
  function getBrowserInfo() {
    if (browserCompat.getBrowserInfo) return browserCompat.getBrowserInfo();
    return { name: 'navegador', isOpera: false, isFirefox: false, isSafari: false, isChromeLike: false, isIOS: false };
  }

  /**
   * Returns platform-specific manual install copy.
   * @returns {string}
   */
  function getManualInstallMessage() {
    if (browserCompat.getManualInstallMessage) return browserCompat.getManualInstallMessage();
    return 'Use o menu do navegador para instalar o app ou adicionar um atalho a tela inicial.';
  }

  /**
   * Syncs the install button and companion status copy in both launcher and ERA pages.
   * @param {boolean} enabled
   * @param {string} label
   * @param {string} hint
   * @param {string} mode
   * @returns {void}
   */
  function setInstallPromptState(enabled, label, hint, mode) {
    const button = document.getElementById('installAppBtn');
    const text = document.getElementById('installStatusText');
    const buttonLabel = button ? button.querySelector('.utility-btn-label') : null;

    if (button) {
      button.disabled = !enabled;
      button.setAttribute('data-install-mode', mode || (enabled ? 'native' : 'unsupported'));
      if (buttonLabel) {
        buttonLabel.textContent = label || 'Instalar';
      } else {
        button.textContent = label || 'Instalar';
      }
    }

    if (text && hint) {
      text.textContent = hint;
    }
  }

  /**
   * Detects installed/standalone display modes across Chromium and iOS Safari.
   * @returns {boolean}
   */
  function isStandaloneApp() {
    const standaloneQuery = getCompatMatchMedia('(display-mode: standalone)');
    return !!(standaloneQuery && standaloneQuery.matches) || window.navigator.standalone === true;
  }

  /**
   * Resolves the service worker path from root or /era/ GitHub Pages routes.
   * @returns {string}
   */
  function resolveServiceWorkerUrl() {
    return window.location.pathname.indexOf('/era/') >= 0 ? '../sw.js' : './sw.js';
  }

  /**
   * Resolves the root scope used by the shared service worker.
   * @returns {string}
   */
  function resolveServiceWorkerScope() {
    return window.location.pathname.indexOf('/era/') >= 0 ? '../' : './';
  }

  /**
   * Reloads once when an already-controlled page receives an updated worker.
   * @returns {void}
   */
  function reloadForServiceWorkerUpdate() {
    if (hasPendingServiceWorkerReload) return;
    hasPendingServiceWorkerReload = true;
    window.location.reload();
  }

  /**
   * Refreshes the install prompt UI based on current browser/PWA state.
   * @returns {void}
   */
  function refreshInstallState() {
    const info = getBrowserInfo();

    if (isStandaloneApp()) {
      setInstallPromptState(false, 'Instalado', 'O companion ja esta rodando como app.', 'installed');
      return;
    }

    if (deferredInstallPrompt) {
      setInstallPromptState(true, 'Instalar', 'Adicione este companion a tela inicial para usar como app.', 'native');
      return;
    }

    if (info.isOpera || info.isSafari || info.isFirefox || info.isChromeLike || info.isIOS) {
      setInstallPromptState(true, 'Como instalar', getManualInstallMessage(), 'manual');
      return;
    }

    setInstallPromptState(false, 'Indisponivel', 'Abra em um navegador moderno para ter instalacao e modo offline completos.', 'unsupported');
  }

  /**
   * Triggers native install when present, otherwise shows manual browser guidance.
   * @returns {void}
   */
  function promptInstallApp() {
    if (deferredInstallPrompt) {
      const prompt = deferredInstallPrompt;
      deferredInstallPrompt = null;

      prompt.prompt()
        .then(() => prompt.userChoice)
        .catch(() => null)
        .then(() => {
          refreshInstallState();
        });
      return;
    }

    const manualHelp = getManualInstallMessage();
    if (manualHelp) {
      setInstallPromptState(true, 'Como instalar', manualHelp, 'manual');
      if (typeof window.alert === 'function') {
        window.alert(manualHelp);
      }
      return;
    }

    refreshInstallState();
  }

  /**
   * Registers the shared service worker and wires update activation.
   * @returns {Promise<void>}
   */
  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register(resolveServiceWorkerUrl(), {
        scope: resolveServiceWorkerScope(),
      });

      if (hadServiceWorkerController && registration.waiting) {
        registration.waiting.postMessage('skipWaiting');
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated' && hadServiceWorkerController && navigator.serviceWorker.controller) {
            reloadForServiceWorkerUpdate();
          }
        });
      });
    } catch (error) {
      setInstallPromptState(false, 'Offline parcial', 'Nao foi possivel ativar o modo offline nesta sessao.', 'unsupported');
    }
  }

  window.promptInstallApp = promptInstallApp;
  window.refreshInstallState = refreshInstallState;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    refreshInstallState();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    refreshInstallState();
  });

  if ('serviceWorker' in navigator && window.isSecureContext !== false) {
    window.addEventListener('load', () => {
      registerServiceWorker();
    }, { once: true });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadServiceWorkerController && navigator.serviceWorker.controller) {
        reloadForServiceWorkerUpdate();
      }
    });
  } else {
    window.addEventListener('load', () => {
      setInstallPromptState(false, 'Modo web', 'Service Worker indisponivel neste navegador; o app segue online.', 'unsupported');
    }, { once: true });
  }

  window.addEventListener('load', refreshInstallState, { once: true });
})();
