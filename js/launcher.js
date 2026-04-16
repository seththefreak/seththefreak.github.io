(function () {
  const LAST_SYSTEM_KEY = 'companion_last_system';
  const lastSystemText = document.getElementById('lastSystemText');
  const openLastSystemBtn = document.getElementById('openLastSystemBtn');
  const cards = Array.from(document.querySelectorAll('.system-card'));

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

  function getLastSystem() {
    const key = localStorage.getItem(LAST_SYSTEM_KEY);
    return SYSTEM_MAP[key] ? key : '';
  }

  function updateLastSystemUI() {
    const key = getLastSystem();
    const entry = SYSTEM_MAP[key];
    if (!entry) {
      if (lastSystemText) lastSystemText.textContent = 'Nenhum sistema aberto ainda.';
      if (openLastSystemBtn) {
        openLastSystemBtn.disabled = true;
        openLastSystemBtn.textContent = 'Ultimo sistema';
      }
      return;
    }

    if (lastSystemText) lastSystemText.textContent = entry.label;
    if (openLastSystemBtn) {
      openLastSystemBtn.disabled = false;
      openLastSystemBtn.textContent = key === 'verloren' ? 'Abrir Verloren' : 'Abrir ERA';
    }
  }

  cards.forEach((card) => {
    const system = card.getAttribute('data-system');
    const href = card.getAttribute('data-href');

    card.addEventListener('click', (event) => {
      if (event.target.closest('a')) return;
      if (!SYSTEM_MAP[system]) return;
      localStorage.setItem(LAST_SYSTEM_KEY, system);
      window.location.href = href;
    });

    const action = card.querySelector('.system-cta');
    if (action) {
      action.addEventListener('click', () => {
        if (SYSTEM_MAP[system]) {
          localStorage.setItem(LAST_SYSTEM_KEY, system);
        }
      });
    }
  });

  if (openLastSystemBtn) {
    openLastSystemBtn.addEventListener('click', () => {
      const key = getLastSystem();
      if (!SYSTEM_MAP[key]) return;
      window.location.href = SYSTEM_MAP[key].href;
    });
  }

  updateLastSystemUI();
})();
