let deferredInstallPrompt = null;

function setInstallPromptState(enabled, label, hint) {
  const button = document.getElementById('installAppBtn');
  const text = document.getElementById('installStatusText');

  if (button) {
    button.disabled = !enabled;
    button.textContent = label || 'Instalar';
  }

  if (text && hint) {
    text.textContent = hint;
  }
}

function isStandaloneApp() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function resolveServiceWorkerUrl() {
  return window.location.pathname.includes('/era/') ? '../sw.js' : './sw.js';
}

function resolveServiceWorkerScope() {
  return window.location.pathname.includes('/era/') ? '../' : './';
}

function refreshInstallState() {
  if (isStandaloneApp()) {
    setInstallPromptState(false, 'Instalado', 'O companion ja esta rodando como app.');
    return;
  }

  if (deferredInstallPrompt) {
    setInstallPromptState(true, 'Instalar', 'Adicione este companion a tela inicial para usar como app.');
    return;
  }

  setInstallPromptState(false, 'Indisponivel', 'Abra no navegador compativel para instalar o app.');
}

async function promptInstallApp() {
  if (!deferredInstallPrompt) {
    refreshInstallState();
    return;
  }

  const prompt = deferredInstallPrompt;
  deferredInstallPrompt = null;
  await prompt.prompt();
  await prompt.userChoice;
  refreshInstallState();
}

window.promptInstallApp = promptInstallApp;
window.refreshInstallState = refreshInstallState;

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  refreshInstallState();
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  refreshInstallState();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register(resolveServiceWorkerUrl(), {
        scope: resolveServiceWorkerScope()
      });

      if (registration.waiting) {
        registration.waiting.postMessage('skipWaiting');
      }
    } catch (e) {}
  });
}

window.addEventListener('load', refreshInstallState);
