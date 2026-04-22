var deferredInstallPrompt = null;
var hasPendingServiceWorkerReload = false;
var browserCompat = window.CompanionBrowserCompat || {};

function getCompatMatchMedia(query) {
  if (browserCompat.matchMedia) return browserCompat.matchMedia(query);
  return window.matchMedia(query);
}

function getBrowserInfo() {
  if (browserCompat.getBrowserInfo) return browserCompat.getBrowserInfo();
  return { name: 'navegador', isOpera: false, isFirefox: false, isSafari: false, isChromeLike: false, isIOS: false };
}

function getManualInstallMessage() {
  if (browserCompat.getManualInstallMessage) return browserCompat.getManualInstallMessage();
  return 'Use o menu do navegador para instalar o app ou adicionar um atalho a tela inicial.';
}

function setInstallPromptState(enabled, label, hint, mode) {
  var button = document.getElementById('installAppBtn');
  var text = document.getElementById('installStatusText');
  var buttonLabel = button ? button.querySelector('.utility-btn-label') : null;

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

function isStandaloneApp() {
  var standaloneQuery = getCompatMatchMedia('(display-mode: standalone)');
  return !!(standaloneQuery && standaloneQuery.matches) || window.navigator.standalone === true;
}

function resolveServiceWorkerUrl() {
  return window.location.pathname.indexOf('/era/') >= 0 ? '../sw.js' : './sw.js';
}

function resolveServiceWorkerScope() {
  return window.location.pathname.indexOf('/era/') >= 0 ? '../' : './';
}

function reloadForServiceWorkerUpdate() {
  if (hasPendingServiceWorkerReload) return;
  hasPendingServiceWorkerReload = true;
  window.location.reload();
}

function refreshInstallState() {
  var info = getBrowserInfo();

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

function promptInstallApp() {
  if (deferredInstallPrompt) {
    var prompt = deferredInstallPrompt;
    deferredInstallPrompt = null;

    prompt.prompt()
      .catch(function () {
      })
      .then(function () {
        return prompt.userChoice;
      })
      .catch(function () {
        return null;
      })
      .then(function () {
        refreshInstallState();
      });
    return;
  }

  var manualHelp = getManualInstallMessage();
  if (manualHelp) {
    setInstallPromptState(true, 'Como instalar', manualHelp, 'manual');
    if (typeof window.alert === 'function') {
      window.alert(manualHelp);
    }
    return;
  }

  refreshInstallState();
}

window.promptInstallApp = promptInstallApp;
window.refreshInstallState = refreshInstallState;

window.addEventListener('beforeinstallprompt', function (event) {
  event.preventDefault();
  deferredInstallPrompt = event;
  refreshInstallState();
});

window.addEventListener('appinstalled', function () {
  deferredInstallPrompt = null;
  refreshInstallState();
});

if ('serviceWorker' in navigator && window.isSecureContext !== false) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register(resolveServiceWorkerUrl(), {
      scope: resolveServiceWorkerScope()
    }).then(function (registration) {
      if (registration.waiting) {
        registration.waiting.postMessage('skipWaiting');
      }

      registration.addEventListener('updatefound', function () {
        var newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', function () {
          if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
            reloadForServiceWorkerUpdate();
          }
        });
      });
    }).catch(function (error) {
      console.warn('[pwa] Falha ao registrar o Service Worker.', error);
    });
  });

  navigator.serviceWorker.addEventListener('controllerchange', function () {
    reloadForServiceWorkerUpdate();
  });
} else {
  window.addEventListener('load', function () {
    console.info('[pwa] Service Worker indisponivel neste navegador. O app segue em modo web.');
  });
}

window.addEventListener('load', refreshInstallState);
