(() => {
  const styles = `
    #startupSplash {
      position: fixed;
      inset: 0;
      z-index: 3000;
      display: grid;
      place-items: center;
      background:
        radial-gradient(circle at 18% 18%, rgba(120, 92, 255, 0.28), transparent 34%),
        radial-gradient(circle at 82% 24%, rgba(82, 214, 201, 0.16), transparent 28%),
        linear-gradient(160deg, #171d2d 0%, #111726 48%, #090c14 100%);
      color: #f2ebff;
      opacity: 0;
      transform: scale(1.02);
      transition: opacity 260ms ease, transform 420ms ease;
    }
    #startupSplash.ready {
      opacity: 1;
      transform: scale(1);
    }
    #startupSplash.hide {
      opacity: 0;
      transform: scale(1.01);
      pointer-events: none;
    }
    .startup-sigil {
      width: min(26vw, 136px);
      aspect-ratio: 1;
      border-radius: 28%;
      background: linear-gradient(145deg, #e1d0ff, #8f6cff 52%, #5ad8d0);
      padding: 4px;
      box-shadow: 0 28px 80px rgba(44, 25, 92, 0.42);
    }
    .startup-sigil-core {
      width: 100%;
      height: 100%;
      border-radius: 25%;
      background:
        linear-gradient(145deg, rgba(13, 18, 31, 0.98), rgba(20, 28, 43, 0.98)),
        #0f1320;
      display: grid;
      place-items: center;
      position: relative;
      overflow: hidden;
    }
    .startup-sigil-core::before,
    .startup-sigil-core::after {
      content: "";
      position: absolute;
      inset: 19%;
      border: 2px solid rgba(244, 238, 255, 0.28);
      transform: rotate(45deg);
    }
    .startup-sigil-core::after {
      inset: 30%;
      border-color: rgba(90, 216, 208, 0.28);
      transform: rotate(0deg);
    }
    .startup-glyph {
      font: 700 min(12vw, 64px) "Playfair Display", Georgia, serif;
      letter-spacing: 0.08em;
      color: #f7f2ff;
      text-shadow: 0 0 22px rgba(214, 197, 255, 0.3);
      position: relative;
      z-index: 1;
    }
    .startup-copy {
      margin-top: 22px;
      text-align: center;
      padding: 0 28px;
    }
    .startup-title {
      font: 700 clamp(2rem, 5vw, 3.8rem) "Playfair Display", Georgia, serif;
      letter-spacing: 0.08em;
    }
    .startup-subtitle {
      margin-top: 6px;
      color: rgba(221, 214, 240, 0.74);
      font: 600 clamp(0.84rem, 2vw, 1rem) "Merriweather", Georgia, serif;
      letter-spacing: 0.24em;
      text-transform: uppercase;
    }
  `;

  const splash = document.createElement('div');
  splash.id = 'startupSplash';
  splash.innerHTML = `
    <div>
      <div class="startup-sigil">
        <div class="startup-sigil-core">
          <div class="startup-glyph">V</div>
        </div>
      </div>
      <div class="startup-copy">
        <div class="startup-title">Verloren</div>
        <div class="startup-subtitle">RPG Sheets</div>
      </div>
    </div>
  `;

  const styleTag = document.createElement('style');
  styleTag.textContent = styles;
  document.head.appendChild(styleTag);

  document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(splash);
    requestAnimationFrame(() => splash.classList.add('ready'));
  }, { once: true });

  window.addEventListener('load', () => {
    setTimeout(() => {
      splash.classList.add('hide');
      setTimeout(() => splash.remove(), 420);
    }, 220);
  }, { once: true });
})();
