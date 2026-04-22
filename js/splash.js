(() => {
  /* ── Configuração ─────────────────────────────────── */
  const SPLASH_DURATION = 4000;  // ms até iniciar o fade-out automático
  const FADE_IN_MS      = 420;   // ms do fade-in
  const FADE_OUT_MS     = 500;   // ms do fade-out
  const SKIP_AFTER      = 1400;  // ms após os quais o toque/clique pula

  /* ── Assets ───────────────────────────────────────── */
  const BASE = 'assets/splash/';
  const IMAGES = {
    landscape: [
      BASE + 'splash_horizontal.png',
      BASE + 'splash_horizontal_2.png',
    ],
    portrait: [
      BASE + 'splash_vertical.png',
      BASE + 'splash_vertical_2.png',
    ],
  };

  function pickImage() {
    const pool = window.innerWidth >= window.innerHeight
      ? IMAGES.landscape
      : IMAGES.portrait;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /* ── Estilos ──────────────────────────────────────── */
  const styles = `
    #startupSplash {
      position: fixed;
      inset: 0;
      z-index: 3000;
      background: #0b0c10;
      opacity: 0;
      transform: scale(1.02);
      transition: opacity ${FADE_IN_MS}ms ease, transform ${FADE_IN_MS}ms ease;
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
    }
    #startupSplash.ready {
      opacity: 1;
      transform: scale(1);
    }
    #startupSplash.hide {
      opacity: 0;
      transform: scale(1.015);
      pointer-events: none;
      transition: opacity ${FADE_OUT_MS}ms ease, transform ${FADE_OUT_MS}ms ease;
    }
    #startupSplash img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      display: block;
    }
    #splash-skip-hint {
      position: absolute;
      bottom: 28px;
      left: 50%;
      transform: translateX(-50%);
      color: rgba(255, 255, 255, 0.45);
      font: 500 11px 'IBM Plex Mono', monospace, sans-serif;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.5s ease;
      white-space: nowrap;
    }
    #splash-skip-hint.visible {
      opacity: 1;
    }
  `;

  /* ── Elemento ─────────────────────────────────────── */
  const splash = document.createElement('div');
  splash.id = 'startupSplash';
  splash.setAttribute('role', 'img');
  splash.setAttribute('aria-label', 'Unheaven: Verloren — carregando…');

  const img = document.createElement('img');
  img.src = pickImage();
  img.alt = '';
  img.draggable = false;

  const hint = document.createElement('div');
  hint.id = 'splash-skip-hint';
  hint.textContent = 'toque para continuar';

  splash.appendChild(img);
  splash.appendChild(hint);

  const styleTag = document.createElement('style');
  styleTag.textContent = styles;
  document.head.appendChild(styleTag);

  /* ── Lógica ───────────────────────────────────────── */
  let removed = false;

  function removeSplash() {
    if (removed) return;
    removed = true;
    splash.classList.add('hide');
    setTimeout(() => splash.remove(), FADE_OUT_MS + 50);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(splash);
    requestAnimationFrame(() => splash.classList.add('ready'));
  }, { once: true });

  window.addEventListener('load', () => {
    // Hint de skip
    const hintTimer = setTimeout(() => hint.classList.add('visible'), SKIP_AFTER);

    // Auto-remove
    const autoTimer = setTimeout(removeSplash, SPLASH_DURATION);

    // Skip por toque/clique
    let canSkip = false;
    setTimeout(() => { canSkip = true; }, SKIP_AFTER);

    splash.addEventListener('click', () => {
      if (!canSkip) return;
      clearTimeout(autoTimer);
      clearTimeout(hintTimer);
      removeSplash();
    });
  }, { once: true });

  // Troca imagem se girar o device antes de fechar
  window.addEventListener('orientationchange', () => {
    if (!removed) img.src = pickImage();
  });
})();
