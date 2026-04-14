/* UnheaveN: ERA Companion — app.js */
'use strict';

// ── STATE ──────────────────────────────────────────────────────────────────
const DEFAULT_STATE = {
  tab: 'ficha',
  assistido: false,
  char: {
    nome: '', conceito: '', nivel: 1, marca: '',
    pilares: { corpo: 1, mente: 1, alma: 0 },
    subas: {
      forca:        { tier: 0, prog: 0 },
      constituicao: { tier: 0, prog: 0 },
      destreza:     { tier: 0, prog: 0 },
      intelecto:    { tier: 0, prog: 0 },
      sabedoria:    { tier: 0, prog: 0 },
      vontade:      { tier: 0, prog: 0 },
      poder:        { tier: 0, prog: 0 },
      dominio:      { tier: 0, prog: 0 },
      afinidade:    { tier: 0, prog: 0 },
    },
    hp: 50, sp: 24, pe: 15,
    determinacao: 0,
    afinidadeNivel: 1,
  },
  roller: {
    pilar: 2, subatributo: 'destreza', efetivo: 0, dt: 5,
    resultado: null, history: [],
  },
  regras: { search: '', tag: 'todos', open: null },
  hab: { filter: 'todos', search: '', open: null, favs: [] },
};

// Deep merge for safe state loading
function deepMerge(target, source) {
  const out = Object.assign({}, target);
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      out[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      out[key] = source[key];
    }
  }
  return out;
}

let S = deepMerge(DEFAULT_STATE, {});

function loadState() {
  try {
    const raw = localStorage.getItem('unheaven_v2');
    if (raw) S = deepMerge(DEFAULT_STATE, JSON.parse(raw));
  } catch (e) { console.warn('[App] Failed to load state:', e); }
}

function saveState() {
  try { localStorage.setItem('unheaven_v2', JSON.stringify(S)); } catch (e) {}
}

loadState();

// ── UTILS ──────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

let toastTimer;
function toast(msg, duration = 2200) {
  const el = $('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), duration);
}

function getStats() {
  return DATA.nivelStats[S.char.nivel] || DATA.nivelStats[1];
}

function getPilarForSuba(subaId) {
  for (const p of DATA.pilares) {
    if (p.subas.some(s => s.id === subaId)) return p.id;
  }
  return 'mente';
}

function getPilarColor(pilarId) {
  const map = { corpo: 'var(--crimson2)', mente: 'var(--cyan2)', alma: 'var(--purple2)' };
  return map[pilarId] || 'var(--text)';
}

// ── TABS ───────────────────────────────────────────────────────────────────
function setTab(tab) {
  if (tab === 'dados' && !S.assistido) return;
  S.tab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const btn = $('tab-' + tab);
  if (btn) btn.classList.add('active');
  render();
}

window.setTab = setTab;

function toggleMode() {
  S.assistido = !S.assistido;
  syncModeUI();
  saveState();
  toast(S.assistido ? '⚡ Modo Assistido ativado' : '📖 Modo Manual ativado');
  if (!S.assistido && S.tab === 'dados') {
    S.tab = 'ficha';
  }
  render();
}
window.toggleMode = toggleMode;

function syncModeUI() {
  const label = $('mode-label');
  const pip = $('mode-pip');
  const toggle = $('mode-toggle');
  const dadosBtn = $('tab-dados');

  if (label) {
    label.textContent = S.assistido ? 'ASSISTIDO' : 'MANUAL';
    label.className = 'mode-label' + (S.assistido ? ' on' : '');
  }
  if (pip) pip.className = 'mode-pip ' + (S.assistido ? 'on' : 'off');
  if (toggle) toggle.classList.toggle('on', S.assistido);
  if (dadosBtn) dadosBtn.classList.toggle('locked', !S.assistido);

  // Sync tab active state
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const activeTab = $('tab-' + S.tab);
  if (activeTab) activeTab.classList.add('active');
}

// ── RENDER ─────────────────────────────────────────────────────────────────
function render() {
  const app = $('app');
  if (!app) return;
  switch (S.tab) {
    case 'ficha':   app.innerHTML = renderFicha();   break;
    case 'dados':   app.innerHTML = renderDados();   break;
    case 'consulta':app.innerHTML = renderConsulta();break;
    case 'hab':     app.innerHTML = renderHab();     break;
    default:        app.innerHTML = renderFicha();
  }
  attachInputListeners();
  syncModeUI();
}

// ── FICHA ──────────────────────────────────────────────────────────────────
function renderFicha() {
  const c = S.char;
  const stats = getStats();
  const hpPct = Math.max(0, Math.min(100, (c.hp / stats.hp) * 100));
  const spPct = Math.max(0, Math.min(100, (c.sp / stats.sp) * 100));
  const pePct = Math.max(0, Math.min(100, (c.pe / stats.pe) * 100));

  return `
<div class="section">
  <div class="section-title">Identidade</div>
  <div class="input-grid">
    <div class="input-group" style="grid-column:1/-1">
      <label class="input-label">Nome do Personagem</label>
      <input class="char-input" id="inp-nome" placeholder="Nome..." value="${esc(c.nome)}" autocomplete="off">
    </div>
    <div class="input-group" style="grid-column:1/-1">
      <label class="input-label">Conceito</label>
      <input class="char-input" id="inp-conceito" placeholder="Quem é, de onde vem, o que faz aqui..." value="${esc(c.conceito)}" autocomplete="off">
    </div>
  </div>

  <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
    <div class="level-badge">
      <div>
        <div class="level-num" id="nivel-display">${c.nivel}</div>
        <div class="level-txt">Nível</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:5px">
        <button class="val-btn" onclick="changeNivel(1)">▲</button>
        <button class="val-btn" onclick="changeNivel(-1)">▼</button>
      </div>
    </div>
    <div class="level-stats">
      HP máx: <span style="color:var(--crimson2)">${stats.hp}</span><br>
      SP máx: <span style="color:var(--cyan2)">${stats.sp}</span><br>
      PE máx: <span style="color:var(--purple2)">${stats.pe}</span>
    </div>
  </div>
</div>

<div class="section" style="padding-top:0">
  <div class="section-title">Recursos</div>
  <div class="resources-grid">
    ${renderResourceCard('hp', 'HP', c.hp, stats.hp, hpPct, -5, 5)}
    ${renderResourceCard('sp', 'SP', c.sp, stats.sp, spPct, -3, 3)}
    ${renderResourceCard('pe', 'PE', c.pe, stats.pe, pePct, -3, 3)}
  </div>
  <div class="res-recover-row">
    <button class="recover-btn" onclick="recoverFull('hp')">↑ Rec. HP</button>
    <button class="recover-btn" onclick="recoverFull('sp')">↑ Rec. SP</button>
    <button class="recover-btn" onclick="recoverFull('pe')">↑ Rec. PE</button>
  </div>
</div>

<div class="section" style="padding-top:0">
  <div class="section-title">Pilares</div>
  ${DATA.pilares.map(p => renderPilar(p)).join('')}
</div>

<div class="section" style="padding-top:0">
  <div class="section-title">Determinação</div>
  <div class="card">
    <div style="font-family:var(--font-ui);font-size:11px;color:var(--text3);margin-bottom:12px;line-height:1.5">
      Cicatrizes que viram recurso. Cada ponto = uma sobrevivência.
    </div>
    <div class="det-row">
      ${[1,2,3,4,5,6].map(i => `
        <button class="det-dot ${i <= c.determinacao ? 'filled' : ''}" onclick="toggleDet(${i})">${i}</button>
      `).join('')}
    </div>
  </div>
</div>

${c.pilares.alma >= 1 ? renderEstigmaBlock() : ''}

<div class="page-end"></div>`;
}

function renderResourceCard(res, label, current, max, pct, dec, inc) {
  return `
  <div class="resource-card">
    <div class="res-label">${label}</div>
    <div class="res-current ${res}">${current}</div>
    <div class="res-max">/ ${max}</div>
    <div class="res-bar-wrap">
      <div class="res-bar ${res}" style="width:${pct.toFixed(1)}%"></div>
    </div>
    <div class="res-adj">
      <button class="res-btn" onclick="adjRes('${res}',${dec})" style="color:var(--fail)">${dec}</button>
      <button class="res-btn" onclick="adjRes('${res}',${inc})" style="color:var(--success)">+${inc}</button>
    </div>
  </div>`;
}

function renderPilar(p) {
  const c = S.char;
  const val = c.pilares[p.id];
  return `
  <div class="pilar-card ${p.cor}">
    <div class="pilar-header">
      <div>
        <div class="pilar-nome ${p.cor}">${p.nome}</div>
        <div class="pilar-dice-label">${DATA.pilarDice[val]}</div>
      </div>
      <div class="pilar-val-ctrl">
        <button class="val-btn" onclick="changePilar('${p.id}',-1)">−</button>
        <div class="pilar-val ${p.cor}">${val}</div>
        <button class="val-btn" onclick="changePilar('${p.id}',1)">+</button>
      </div>
    </div>
    <div class="suba-list">
      ${p.subas.map(s => renderSuba(s, p.id, p.cor)).join('')}
    </div>
  </div>`;
}

function renderSuba(s, pilarId, cor) {
  const d = S.char.subas[s.id];
  if (!d) return '';
  const tierNome = DATA.tiers[d.tier] || 'Leigo';
  const autoStr  = DATA.tierAuto[tierNome] || '—';
  const isMax    = d.tier >= 4;
  return `
  <div class="suba-row">
    <div class="suba-info" onclick="toast('${s.nome}: ${s.desc.slice(0,90).replace(/'/g,'\\'')}…')">
      <div class="suba-nome">${s.nome}</div>
      <div class="suba-meta">${tierNome} · Auto: ${autoStr} · +${d.prog}</div>
    </div>
    <div class="suba-ctrl">
      <div class="prog-dots">
        ${[1,2,3].map(i => `
          <div class="prog-dot ${i <= d.prog ? 'filled '+cor : ''}"
               onclick="setProg('${s.id}',${i})"></div>
        `).join('')}
      </div>
      ${isMax
        ? `<span class="tier-chip max">MAESTRIA</span>`
        : `<button class="tier-chip" onclick="tierUp('${s.id}')">TIER↑</button>`
      }
    </div>
  </div>`;
}

function renderEstigmaBlock() {
  const c = S.char;
  const afNome = ['','Desperto','Sintonizado','Dominante','Convergente'];
  const afDesc = DATA.afinidadeNiveis.find(a => a.n === c.afinidadeNivel);
  return `
  <div class="section" style="padding-top:0">
    <div class="section-title">Estigma & Marca</div>
    <div class="marca-card">
      <div class="marca-label">Manifestação Visual da Marca</div>
      <input class="char-input marca-input" id="inp-marca"
             placeholder="Como sua Marca se manifesta fisicamente..."
             value="${esc(c.marca)}" autocomplete="off">
      <div style="margin-top:14px">
        <div class="input-label" style="margin-bottom:8px">Nível de Afinidade</div>
        <div class="af-pills">
          ${DATA.afinidadeNiveis.map(a => `
            <button class="af-pill ${a.n === c.afinidadeNivel ? 'active' : ''}"
                    onclick="setAfinidadeNivel(${a.n})">${a.nome}</button>
          `).join('')}
        </div>
        ${afDesc ? `<div class="af-desc">${afDesc.desc}</div>` : ''}
      </div>
    </div>
  </div>`;
}

// ── DADOS ──────────────────────────────────────────────────────────────────
function renderDados() {
  const r  = S.roller;
  const sd = S.char.subas[r.subatributo] || { tier: 0, prog: 0 };
  const tierNome = DATA.tiers[sd.tier] || 'Leigo';
  const allSubas = DATA.pilares.flatMap(p => p.subas.map(s => ({ ...s, pilarId: p.id })));
  const totalBonus = sd.prog + r.efetivo;

  let diceHTML = `<div style="font-family:var(--font-ui);font-size:12px;color:var(--text3)">Aperte para rolar</div>`;
  let resultHTML = '';

  if (r.resultado) {
    const res = r.resultado;
    const isSuccess = res.total >= res.dt;
    const isCrit    = res.best === 6;
    const isConfirmed = res.confirmed;

    diceHTML = res.dice.map(v => `
      <div class="die ${v === res.best ? 'best' : ''} ${v === 6 ? 'six' : ''}">
        ${v}
      </div>
    `).join('');

    const resultColor = isConfirmed ? 'var(--gold2)' : isSuccess ? 'var(--success)' : 'var(--fail)';
    const badges = [];
    if (isConfirmed)     badges.push(`<span class="badge critico">⚔ CRÍTICO</span>`);
    else if (isCrit)     badges.push(`<span class="badge ameaca">⚡ AMEAÇA</span>`);
    if (isSuccess && !isConfirmed) badges.push(`<span class="badge sucesso">✓ SUCESSO</span>`);
    if (!isSuccess)      badges.push(`<span class="badge falha">✗ FALHA</span>`);

    resultHTML = `
    <div class="result-panel">
      <div class="formula-line">
        Dado: <span class="formula-val">${res.best}</span>
        <span class="formula-plus"> + </span>Prog. Interno: <span class="formula-val">+${sd.prog}</span>
        ${r.efetivo > 0 ? `<span class="formula-plus"> + </span>Efetivo: <span class="formula-val">+${r.efetivo}</span>` : ''}
        <span class="formula-plus"> = </span>
      </div>
      <div class="result-total" style="color:${resultColor}">${res.total}</div>
      <div class="result-vs">vs. DT ${res.dt}</div>
      <div class="result-badges">${badges.join('')}</div>
      ${isCrit && !isConfirmed ? `<div class="crit-notice">Role novamente para confirmar o crítico!</div>` : ''}
    </div>`;
  }

  const histHTML = r.history.length > 0 ? `
  <div class="section" style="padding-top:0">
    <div class="section-title">Histórico</div>
    ${r.history.slice(-6).reverse().map(h => `
      <div class="history-item">
        <div class="history-formula">${h.suba} · ${h.pilar}d6 + ${h.bonus}</div>
        <div class="history-result ${h.crit ? 'c' : h.ok ? 's' : 'f'}">
          ${h.total} ${h.ok || h.crit ? '✓' : '✗'} DT${h.dt}
        </div>
      </div>
    `).join('')}
  </div>` : '';

  return `
<div class="section">
  <div class="section-title">Rolagem Assistida</div>
  <div class="roller-card">
    <div class="roller-config">
      <div class="input-group">
        <label class="input-label">Subatributo</label>
        <select class="config-select" id="sel-suba" onchange="setRollerSuba(this.value)">
          ${allSubas.map(s => `<option value="${s.id}" ${s.id === r.subatributo ? 'selected' : ''}>${s.nome}</option>`).join('')}
        </select>
      </div>
      <div class="input-group">
        <label class="input-label">Pilar (dados)</label>
        <select class="config-select" id="sel-pilar" onchange="setRollerPilar(parseInt(this.value))">
          ${[1,2,3,4,5].map(v => `<option value="${v}" ${v === r.pilar ? 'selected' : ''}>${v} — ${DATA.pilarDice[v]}</option>`).join('')}
        </select>
      </div>
      <div class="input-group">
        <label class="input-label">Prog. Efetivo</label>
        <input class="config-input" type="number" id="inp-efetivo" min="0" max="10" value="${r.efetivo}"
               oninput="setRollerField('efetivo', Math.max(0, parseInt(this.value)||0))">
      </div>
      <div class="input-group">
        <label class="input-label">DT Alvo</label>
        <input class="config-input" type="number" id="inp-dt" min="1" max="10" value="${r.dt}"
               oninput="setRollerField('dt', Math.max(1, parseInt(this.value)||5))">
      </div>
    </div>

    <div class="roller-info-strip">
      <b>${r.subatributo.charAt(0).toUpperCase() + r.subatributo.slice(1)}</b> ·
      Tier: <b>${tierNome}</b> ·
      Auto-sucesso: <b>${DATA.tierAuto[tierNome]}</b> ·
      Bônus total: <b>+${totalBonus}</b>
    </div>

    <button class="roll-btn" id="roll-btn" onclick="doRoll()">
      ⬡ &nbsp;ROLAR ${r.pilar}d6 + ${totalBonus}&nbsp; ⬡
    </button>

    <div class="dice-area" id="dice-area">${diceHTML}</div>
    ${resultHTML}
  </div>
</div>
${histHTML}
<div class="page-end"></div>`;
}

// ── CONSULTA ───────────────────────────────────────────────────────────────
function renderConsulta() {
  const q   = S.regras.search.toLowerCase().trim();
  const tag = S.regras.tag;
  const tags = ['todos','sistema','combate','estigma','recursos','condicoes'];

  const filtered = DATA.regras.filter(r => {
    const matchTag = tag === 'todos' || r.tag === tag;
    const matchQ   = !q || r.titulo.toLowerCase().includes(q);
    return matchTag && matchQ;
  });

  return `
<div class="section">
  <div class="section-title">Consulta Rápida</div>
  <div class="search-bar">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="2">
      <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/>
    </svg>
    <input id="rule-search" placeholder="Buscar regra..."
           value="${esc(S.regras.search)}" oninput="S.regras.search=this.value;render()">
  </div>
  <div class="tags-row">
    ${tags.map(t => `<button class="tag-btn ${tag === t ? 'active' : ''}" onclick="S.regras.tag='${t}';render()">${t}</button>`).join('')}
  </div>
  ${filtered.length === 0
    ? `<div class="empty-state"><span class="empty-big">∅</span>Nenhuma regra encontrada</div>`
    : filtered.map(r => `
      <div class="rule-card">
        <div class="rule-header" onclick="S.regras.open=S.regras.open==='${r.id}'?null:'${r.id}';render()">
          <div class="rule-title">${r.titulo}</div>
          <div class="rule-header-right">
            <span class="rule-tag-pill ${r.tag}">${r.tag}</span>
            <span class="chevron ${S.regras.open === r.id ? 'open' : ''}">▼</span>
          </div>
        </div>
        <div class="rule-body ${S.regras.open === r.id ? 'open' : ''}">${r.conteudo}</div>
      </div>
    `).join('')}
</div>
<div class="page-end"></div>`;
}

// ── HABILIDADES ────────────────────────────────────────────────────────────
function renderHab() {
  const q      = S.hab.search.toLowerCase().trim();
  const filter = S.hab.filter;
  const cats   = ['todos','combate','estigma','suporte'];

  let items = DATA.habilidades.filter(h => {
    const matchCat = filter === 'todos' || h.cat === filter;
    const matchQ   = !q || h.nome.toLowerCase().includes(q) || h.efeito.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  // Favs first
  items.sort((a,b) => {
    const aF = S.hab.favs.includes(a.id);
    const bF = S.hab.favs.includes(b.id);
    if (aF && !bF) return -1;
    if (!aF && bF) return 1;
    return 0;
  });

  return `
<div class="section">
  <div class="section-title">Habilidades</div>
  <div class="search-bar">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="2">
      <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/>
    </svg>
    <input id="hab-search" placeholder="Buscar habilidade..."
           value="${esc(S.hab.search)}" oninput="S.hab.search=this.value;render()">
  </div>
  <div class="tags-row">
    ${cats.map(c => `<button class="tag-btn ${filter === c ? 'active' : ''}" onclick="S.hab.filter='${c}';render()">${c}</button>`).join('')}
  </div>
  ${items.length === 0
    ? `<div class="empty-state"><span class="empty-big">☆</span>Nenhuma habilidade encontrada</div>`
    : items.map(h => `
      <div class="abil-card">
        <div class="abil-header" onclick="S.hab.open=S.hab.open==='${h.id}'?null:'${h.id}';render()">
          <div class="abil-icon ${h.cat}">${h.icon}</div>
          <div class="abil-info">
            <div class="abil-nome">${h.nome}</div>
            <div class="abil-resumo">${h.resumo}</div>
          </div>
          <button class="fav-btn ${S.hab.favs.includes(h.id) ? 'on' : ''}"
                  onclick="event.stopPropagation();toggleFav('${h.id}')">
            ${S.hab.favs.includes(h.id) ? '★' : '☆'}
          </button>
        </div>
        <div class="abil-body ${S.hab.open === h.id ? 'open' : ''}">${h.efeito}</div>
      </div>
    `).join('')}
</div>
<div class="page-end"></div>`;
}

// ── FICHA ACTIONS ──────────────────────────────────────────────────────────
function changePilar(id, delta) {
  const val = S.char.pilares[id] + delta;
  if (val < 0)  return toast('Pilar não pode ser negativo');
  if (val > 5)  return toast('Pilar máximo é 5');
  if ((id === 'corpo' || id === 'mente') && val < 1) return toast(`${id} mínimo 1`);
  S.char.pilares[id] = val;
  // Sync roller pilar if suba belongs to this pilar
  const pilarId = getPilarForSuba(S.roller.subatributo);
  if (pilarId === id) S.roller.pilar = val;
  saveState(); render();
}
window.changePilar = changePilar;

function changeNivel(delta) {
  const n = S.char.nivel + delta;
  if (n < 1 || n > 11) return;
  S.char.nivel = n;
  const stats = DATA.nivelStats[n];
  S.char.hp = Math.min(S.char.hp, stats.hp);
  S.char.sp = Math.min(S.char.sp, stats.sp);
  S.char.pe = Math.min(S.char.pe, stats.pe);
  saveState(); render();
}
window.changeNivel = changeNivel;

function adjRes(res, amount) {
  const stats = getStats();
  S.char[res] = Math.max(0, Math.min(stats[res], S.char[res] + amount));
  saveState(); render();
}
window.adjRes = adjRes;

function recoverFull(res) {
  S.char[res] = getStats()[res];
  saveState(); render();
}
window.recoverFull = recoverFull;

function setProg(subaId, val) {
  const d = S.char.subas[subaId];
  if (!d) return;
  d.prog = (d.prog === val) ? val - 1 : val;
  if (d.prog < 0) d.prog = 0;
  saveState(); render();
}
window.setProg = setProg;

function tierUp(subaId) {
  const d = S.char.subas[subaId];
  if (!d || d.tier >= 4) { toast('Maestria já atingida'); return; }
  d.tier += 1;
  d.prog  = 0;
  toast(`${subaId.charAt(0).toUpperCase() + subaId.slice(1)} → ${DATA.tiers[d.tier]}!`);
  saveState(); render();
}
window.tierUp = tierUp;

function toggleDet(i) {
  S.char.determinacao = (S.char.determinacao >= i) ? i - 1 : i;
  saveState(); render();
}
window.toggleDet = toggleDet;

function setAfinidadeNivel(n) {
  S.char.afinidadeNivel = n;
  saveState(); render();
}
window.setAfinidadeNivel = setAfinidadeNivel;

// ── ROLLER ACTIONS ─────────────────────────────────────────────────────────
function setRollerSuba(v) {
  S.roller.subatributo = v;
  const pilarId = getPilarForSuba(v);
  S.roller.pilar = S.char.pilares[pilarId] || 1;
  S.roller.resultado = null;
  saveState(); render();
}
window.setRollerSuba = setRollerSuba;

function setRollerPilar(v) {
  S.roller.pilar = v;
  S.roller.resultado = null;
  saveState();
}
window.setRollerPilar = setRollerPilar;

function setRollerField(key, val) {
  S.roller[key] = val;
  saveState();
}
window.setRollerField = setRollerField;

function doRoll() {
  const r  = S.roller;
  const sd = S.char.subas[r.subatributo] || { tier:0, prog:0 };
  const btn = $('roll-btn');
  const area = $('dice-area');

  if (btn) btn.classList.add('rolling');
  S.roller.resultado = null;

  // Animate
  let frame = 0;
  const FRAMES = 10;
  const anim = setInterval(() => {
    if (frame >= FRAMES) {
      clearInterval(anim);
      finishRoll(btn, r, sd);
      return;
    }
    if (area) {
      const tmp = Array.from({length: r.pilar}, () => Math.ceil(Math.random() * 6));
      area.innerHTML = tmp.map(v => `<div class="die rolling-anim">${v}</div>`).join('');
    }
    frame++;
  }, 60);
}
window.doRoll = doRoll;

function finishRoll(btn, r, sd) {
  const dice  = Array.from({length: r.pilar}, () => Math.ceil(Math.random() * 6));
  const best  = Math.max(...dice);
  const total = best + sd.prog + r.efetivo;
  const isCrit = best === 6;
  // Confirm critical: re-roll one die
  const confirmRoll = Math.ceil(Math.random() * 6) + sd.prog + r.efetivo;
  const confirmed = isCrit && confirmRoll >= r.dt;

  S.roller.resultado = { dice, best, total, dt: r.dt, confirmed };
  S.roller.history.push({
    suba: r.subatributo,
    pilar: r.pilar,
    bonus: sd.prog + r.efetivo,
    total,
    dt: r.dt,
    ok: total >= r.dt && !confirmed,
    crit: confirmed,
  });
  if (S.roller.history.length > 20) S.roller.history.shift();

  if (btn) btn.classList.remove('rolling');
  saveState();
  render();
}

// ── HABILIDADES ACTIONS ────────────────────────────────────────────────────
function toggleFav(id) {
  const idx = S.hab.favs.indexOf(id);
  if (idx >= 0) S.hab.favs.splice(idx, 1);
  else S.hab.favs.push(id);
  saveState(); render();
}
window.toggleFav = toggleFav;

// ── INPUT LISTENERS ────────────────────────────────────────────────────────
function attachInputListeners() {
  const map = {
    'inp-nome':     v => S.char.nome = v,
    'inp-conceito': v => S.char.conceito = v,
    'inp-marca':    v => S.char.marca = v,
  };
  for (const [id, setter] of Object.entries(map)) {
    const el = $(id);
    if (el) {
      el.addEventListener('input', e => { setter(e.target.value); saveState(); });
    }
  }
}

// ── PWA UPDATE HANDLING ────────────────────────────────────────────────────
function initServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.register('./sw.js').then(reg => {
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version available
          const banner = $('update-banner');
          if (banner) {
            banner.classList.add('visible');
            banner.onclick = () => {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            };
          }
        }
      });
    });
  }).catch(err => console.warn('[SW] Registration failed:', err));
}

// ── BOOT ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  syncModeUI();
  render();
  initServiceWorker();
});
