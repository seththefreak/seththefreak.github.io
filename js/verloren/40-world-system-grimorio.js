/* ============================================================
   MUNDO — DADOS E FUNÇÕES
============================================================ */

// ── Dados: Regiões ─────────────────────────────────────────
const _mundoRendered = { regioes: false, bestiario: false, metaflora: false, habilidades: false, itens: false, drops: false };

function toggleLore(id) {
  const body = document.getElementById(id);
  const num  = id.replace('lc','');
  const arrow = document.getElementById('lca' + num);
  if (!body) return;
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  if (arrow) arrow.classList.toggle('open', !isOpen);
}

/* ============================================================
   MUNDO — NAVEGAÇÃO AGRUPADA
============================================================ */

const _MUNDO_GRPS = ['universo', 'natureza', 'personagem'];

function closeAllMGrp(except) {
  _MUNDO_GRPS.forEach(g => {
    if (g === except) return;
    const items = document.getElementById('sgrpitems-mundo-' + g);
    const btn   = document.getElementById('sgrpbtn-mundo-'   + g);
    if (items) items.classList.remove('open');
    if (btn)   btn.classList.remove('open');
  });
}

function toggleMGrp(grp) {
  const items = document.getElementById('sgrpitems-mundo-' + grp);
  const btn   = document.getElementById('sgrpbtn-mundo-'   + grp);
  const isOpen = items && items.classList.contains('open');
  closeAllMGrp(grp);
  if (!isOpen) {
    if (items) items.classList.add('open');
    if (btn)   btn.classList.add('open');
  }
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('#mundoNav')) closeAllMGrp(null);
});

function showMundoSection(sec) {
  // Fecha dropdowns
  closeAllMGrp(null);

  // Troca seção visível
  document.querySelectorAll('.mundo-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.mundo-tab').forEach(t => t.classList.remove('active'));
  const secEl = document.getElementById('msec-' + sec);
  const tabEl = document.getElementById('mtab-' + sec);
  if (secEl) secEl.classList.add('active');
  if (tabEl) tabEl.classList.add('active');

  // Destaca grupo que contém a tab ativa
  document.querySelectorAll('#mundoNav .sgrp-btn').forEach(b => b.classList.remove('has-active'));
  if (tabEl) {
    const mgrp = tabEl.dataset.mgrp;
    const grpBtn = document.getElementById('sgrpbtn-mundo-' + mgrp);
    if (grpBtn) grpBtn.classList.add('has-active');
  }
  // Botão direto (sem dropdown) — ex: drops
  const directBtn = document.querySelector('#mundoNav .sgrp-btn[data-direct="' + sec + '"]');
  if (directBtn) directBtn.classList.add('has-active');

  // Lazy render
  if (sec === 'regioes') {
    _mundoRendered.bestiario   = false;
    _mundoRendered.metaflora   = false;
    _mundoRendered.drops       = false;
  }
  if (sec === 'regioes')   { renderRegioes();          _mundoRendered.regioes   = true; }
  if (sec === 'bestiario'  && !_mundoRendered.bestiario)  { renderBestas();         _mundoRendered.bestiario  = true; }
  if (sec === 'metaflora'  && !_mundoRendered.metaflora)  { renderFlora();          _mundoRendered.metaflora  = true; }
  if (sec === 'drops'      && !_mundoRendered.drops)      { filtrarDropsMundo();    _mundoRendered.drops      = true; }
}

/* ── Renderização: Regiões ─────────────────────────────── */
function renderRegioes() {
  const q = document.getElementById('regiaoSearch')?.value || '';
  const container = document.getElementById('regioesList');
  if (!container) return;

  const filtered = q
    ? MUNDO_REGIOES.filter(r =>
        includesNormalized(r.nome, q) ||
        includesNormalized(r.slogan, q) ||
        includesNormalized(r.cultura, q) ||
        (r.especialidades || []).some(e => includesNormalized(e, q))
      )
    : MUNDO_REGIOES;

  container.innerHTML = `
    <div class="regioes-grid">
      ${filtered.map(r => renderRegiaoCard(r)).join('')}
    </div>
    ${filtered.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">🗺️</div><h3>Nenhuma região encontrada</h3></div>' : ''}
    ${!q ? renderProvinciasEMicro() : ''}
  `;
}

function renderRegiaoCard(r) {
  const tags = (r.especialidades || []).map(e =>
    `<span class="regiao-tag" style="background:${r.cor}22;color:${r.cor};border:1px solid ${r.cor}44;">${e}</span>`
  ).join('');

  return `<div class="regiao-card">
    <div class="regiao-card-header">
      <span class="regiao-emoji">${r.emoji}</span>
      <div class="regiao-card-titles">
        <div class="regiao-nome">${r.nome}</div>
        <div class="regiao-slogan">"${r.slogan}"</div>
      </div>
    </div>
    <div class="regiao-card-divider"></div>
    <div class="regiao-card-body">
      <div class="regiao-info-item">
        <span class="regiao-info-label">🌡️ Clima</span>
        <span class="regiao-info-value">${r.clima}</span>
      </div>
      <div class="regiao-info-item">
        <span class="regiao-info-label">⚠️ Ameaças</span>
        <span class="regiao-info-value">${r.ameacas}</span>
      </div>
      <div class="regiao-info-item full">
        <span class="regiao-info-label">🏛️ Sociedade</span>
        <span class="regiao-info-value">${r.sociedade}</span>
      </div>
      <div class="regiao-info-item full">
        <span class="regiao-info-label">🤝 Relações</span>
        <span class="regiao-info-value">${r.relacoes}</span>
      </div>
    </div>
    <div class="regiao-tags">${tags}</div>
    <div class="regiao-resumo">${r.slogan}</div>
  </div>`;
}

function renderProvinciasEMicro() {
  return MUNDO_REGIOES.filter(r => r.provincias?.length || r.microreinos?.length).map(r => {
    const provCards = (r.provincias || []).map(p => `
      <div class="provincia-card">
        <div class="provincia-nome">${p.nome}</div>
        <div class="provincia-tipo">${p.tipo}</div>
        <div class="provincia-desc">${p.desc}</div>
        ${p.gancho ? `<div class="provincia-gancho">🔗 ${p.gancho}</div>` : ''}
      </div>`).join('');

    const microCards = (r.microreinos || []).map(m => `
      <div class="micro-card">
        <div class="micro-nome">${m.nome}</div>
        <div class="micro-tipo">${m.tipo}</div>
        <div class="micro-stats">
          <div class="micro-stat"><span class="micro-stat-label">Gov.</span><span class="micro-stat-val" style="font-size:0.75rem;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${m.gov}</span></div>
          <div class="micro-stat"><span class="micro-stat-label">Militar</span><span class="micro-stat-val" style="font-size:0.75rem;">${m.militar}</span></div>
          <div class="micro-stat"><span class="micro-stat-label">Comércio</span><span class="micro-stat-val"><span class="comercial-stars">${'★'.repeat(m.comercial)}${'☆'.repeat(5-m.comercial)}</span></span></div>
        </div>
        <div class="micro-perigo">⚠️ ${m.perigo}</div>
        ${m.uso ? `<div class="micro-uso">💡 ${m.uso}</div>` : ''}
      </div>`).join('');

    const hasProv = provCards.length > 0;
    const hasMicro = microCards.length > 0;

    return `<div class="regiao-sub-section">
      <div class="regiao-grupo-titulo">${r.emoji} ${r.nome}</div>
      ${hasProv ? `<div class="regiao-sub-title">Províncias</div><div class="provincias-grid">${provCards}</div>` : ''}
      ${hasMicro ? `<div class="regiao-sub-title" style="margin-top:${hasProv?'24px':'0'}">Micro-Reinos</div><div class="provincias-grid">${microCards}</div>` : ''}
    </div>`;
  }).join('');
}

function filtrarRegioes() { _mundoRendered.regioes = true; renderRegioes(); }

/* ── Renderização: Bestiário ───────────────────────────── */
function renderBestas() {
  _bestaCardIdx = 0;
  const q    = document.getElementById('bestaSearch')?.value || '';
  const hab  = document.getElementById('bestaHabitatFilter')?.value || '';
  const diff = document.getElementById('bestaDiffFilter')?.value || '';
  const grid = document.getElementById('bestasGrid');
  if (!grid) return;

  const filtered = MUNDO_BESTAS.filter(b => {
    const matchQ   = !q   || includesNormalized(b.nome, q) || includesNormalized(b.apelido, q) || includesNormalized(b.hab_str, q);
    const matchHab = !hab || includesNormalized(b.hab_str, hab) || b.hab.some(h => includesNormalized(h, hab));
    const matchD   = !diff || (diff === '6' ? parseInt(b.diff) >= 6 : b.diff === diff || b.diff.startsWith(diff));
    return matchQ && matchHab && matchD;
  });

  grid.innerHTML = filtered.length
    ? filtered.map(b => renderBestaCard(b)).join('')
    : '<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">🐉</div><h3>Nenhuma criatura encontrada</h3></div>';
}

function diffColor(d) {
  const n = parseInt(d);
  if (n >= 9) return '#c05060';
  if (n >= 7) return '#a060c0';
  if (n >= 5) return '#c07840';
  if (n >= 4) return '#e09858';
  if (n >= 3) return '#7ab4e0';
  if (n >= 2) return '#7fc4a8';
  return '#a0b0a0';
}

function diffLabel(d) {
  const n = parseInt(d);
  if (n >= 10) return 'Deus';
  if (n >= 9)  return 'Lendário';
  if (n >= 7)  return 'Épico';
  if (n >= 5)  return 'Perigoso';
  if (n >= 4)  return 'Difícil';
  if (n >= 3)  return 'Moderado';
  if (n >= 2)  return 'Simples';
  return 'Trivial';
}

const DROP_RARITY_COLORS = ['#9ba8b0','#6ab87a','#6aace0','#b86ad8','#e09040','#e04050','#e0b020'];
const DROP_RARITY_LABELS = ['Comum','Incomum','Raro','Épico','Lendário','Mítico','Único'];

function rarColor(r) { return DROP_RARITY_COLORS[r] || DROP_RARITY_COLORS[0]; }
function rarLabel(r) { return DROP_RARITY_LABELS[r] || 'Comum'; }

function adicionarDropAoInventario(nomeDrop, chance) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) { toast('Nenhuma ficha ativa!', 'error'); return; }
  sheet.inventario = sheet.inventario || [];
  sheet.inventario.push({ id: 'item_' + generateId(), nome: nomeDrop + (chance !== '?' ? ` (${chance})` : ''), peso: 0.2, quantidade: 1 });
  renderInventario(sheet);
  atualizarCarga(sheet);
  debounceSave();
  toast(`${nomeDrop} adicionado ao inventário!`, 'success');
}

function toggleBestaExpand(id) {
  const el = document.getElementById('besta-expand-' + id);
  const btn = document.getElementById('besta-btn-' + id);
  if (!el) return;
  const open = el.style.display !== 'none';
  el.style.display = open ? 'none' : 'block';
  if (btn) btn.textContent = open ? '▼ Ver detalhes' : '▲ Ocultar';
}

let _bestaCardIdx = 0;
function renderBestaCard(b) {
  const idx = _bestaCardIdx++;
  const cardId = 'besta_' + idx;
  const dc = diffColor(b.diff);
  const dl = diffLabel(b.diff);
  const habs = b.hab_str.split(',').map(h => h.trim()).filter(Boolean);

  const habBadges = habs.slice(0, 4).map(h =>
    `<span class="besta-badge habitat">📍 ${h}</span>`
  ).join('');
  const maisHabs = habs.length > 4 ? `<span class="besta-badge habitat">+${habs.length-4}</span>` : '';

  // Stats block
  const statsHtml = b.stats ? `
    <div class="besta-stats-grid">
      <div class="besta-stat"><span class="bstat-label">❤️ HP</span><span class="bstat-val">${b.stats.hp || '—'}</span></div>
      <div class="besta-stat"><span class="bstat-label">⚔️ ATQ</span><span class="bstat-val">${b.stats.atq || '—'}</span></div>
      <div class="besta-stat"><span class="bstat-label">🛡️ DEF</span><span class="bstat-val">${b.stats.def || '—'}</span></div>
      <div class="besta-stat"><span class="bstat-label">🏃 MOV</span><span class="bstat-val">${b.stats.mov || '—'}</span></div>
      ${b.stats.sen ? `<div class="besta-stat full"><span class="bstat-label">👁️ Sentidos</span><span class="bstat-val">${b.stats.sen}</span></div>` : ''}
    </div>` : '';

  // Habilidades — novo formato com descrições
  const habsHtml = (b.habilidades || []).map(h => {
    if (typeof h === 'string') return `<li class="besta-hab-item"><span class="besta-hab-nome">${escapeHtml(h)}</span></li>`;
    return `<li class="besta-hab-item">
      <span class="besta-hab-nome">${escapeHtml(h.nome)}</span>
      <span class="besta-hab-desc">${escapeHtml(h.desc)}</span>
    </li>`;
  }).join('');

  // Drops com botão de adicionar ao inventário e raridade
  const dropsHtml = (b.drops || []).map(d => {
    const ch = d.chance && d.chance !== '?' ? `<span class="drop-chance">${d.chance}</span>` : '<span class="drop-chance" style="color:var(--text-muted)">?%</span>';
    const rarC = d.rar !== undefined ? rarColor(d.rar) : DROP_RARITY_COLORS[0];
    const rarL = d.rar !== undefined ? rarLabel(d.rar) : 'Comum';
    return `<div class="besta-drop-row">
      <div class="besta-drop-main">
        <span class="drop-rar-dot" style="background:${rarC}" title="${rarL}"></span>
        <span class="besta-drop-nome">${escapeHtml(d.item)}</span>
        ${ch}
      </div>
      ${d.desc ? `<div class="besta-drop-desc">${escapeHtml(d.desc)}</div>` : ''}
      <button class="drop-add-btn" onclick="adicionarDropAoInventario('${escapeHtml(d.item).replace(/'/g,"\\'")}','${d.chance||'?'}')" title="Adicionar ao inventário da ficha ativa">+ Ficha</button>
    </div>`;
  }).join('');

  return `<div class="besta-card">
    <div class="besta-header">
      <div style="flex:1;">
        <div class="besta-nome">${escapeHtml(b.nome)}</div>
        ${b.apelido ? `<div class="besta-apelido">${escapeHtml(b.apelido)}</div>` : ''}
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;">${habBadges}${maisHabs}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;">
        <span class="besta-badge diff" style="background:${dc}22;color:${dc};border:1px solid ${dc}55;">Dif. ${b.diff}</span>
        <span class="besta-badge tamanho">📏 ${b.tam}</span>
        <span style="font-size:0.72rem;color:${dc};font-weight:600;">${dl}</span>
      </div>
    </div>
    ${b.desc ? `<div class="besta-lore">${escapeHtml(b.desc)}</div>` : ''}
    ${statsHtml}
    <button class="besta-expand-btn" id="besta-btn-${cardId}" onclick="toggleBestaExpand('${cardId}')">▼ Ver detalhes</button>
    <div id="besta-expand-${cardId}" style="display:none;">
      <div class="besta-section-title">⚡ Habilidades</div>
      <ul class="besta-hab-list">${habsHtml}</ul>
      ${b.drops?.length ? `
      <div class="besta-section-title">💎 Drops</div>
      <div class="besta-drops-lista">${dropsHtml}</div>` : ''}
    </div>
  </div>`;
}

function filtrarBestas() { _bestaCardIdx = 0; renderBestas(); }


/* ── Renderização: Metaflora ───────────────────────────── */
const RARITY_LABELS = ['Comum', 'Incomum', 'Raro', 'Muito Raro', 'Épico', 'Lendário'];
const RARITY_ICONS  = ['⚪', '🟢', '🔵', '🟣', '🟠', '🔴'];

function renderFlora() {
  const q   = document.getElementById('floraSearch')?.value || '';
  const rar = document.getElementById('floraRarFilter')?.value;
  const hab = document.getElementById('floraHabFilter')?.value || '';
  const grid = document.getElementById('floraGrid');
  if (!grid) return;

  const filtered = MUNDO_FLORA.filter(f => {
    const matchQ   = !q   || includesNormalized(f.nome, q) || includesNormalized(f.apelido, q) || includesNormalized(f.prop, q);
    const matchRar = rar === '' || rar === undefined || f.rar === parseInt(rar);
    const matchHab = !hab || includesNormalized(f.hab, hab);
    return matchQ && matchRar && matchHab;
  });

  grid.innerHTML = filtered.length
    ? filtered.map(f => renderFloraCard(f)).join('')
    : '<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">🌿</div><h3>Nenhuma planta encontrada</h3></div>';
}

function renderFloraCard(f) {
  const drops = (f.drops || []).map(d =>
    `<div class="flora-drop-item">⬩ ${escapeHtml(d)}</div>`
  ).join('');

  return `<div class="flora-card">
    <div class="flora-rarity-bar flora-rarity-${f.rar}"></div>
    <div class="flora-body">
      <div class="flora-nome">
        ${escapeHtml(f.nome)}
        ${f.apelido ? `<span class="flora-nome-sub">${escapeHtml(f.apelido)}</span>` : ''}
      </div>
      <div class="flora-meta">
        <span class="flora-badge raridade-${f.rar}">${RARITY_ICONS[f.rar]} ${RARITY_LABELS[f.rar]}</span>
        <span class="flora-badge tamanho">📏 ${f.tam}</span>
        ${f.hab.split(',').slice(0,2).map(h => `<span class="flora-badge habitat">📍 ${h.trim()}</span>`).join('')}
      </div>
      <div class="flora-prop">${escapeHtml(f.prop)}</div>
      ${drops ? `<div class="flora-drops"><div class="flora-drops-title">Drops</div>${drops}</div>` : ''}
    </div>
  </div>`;
}

function filtrarFlora() { renderFlora(); }

/* ============================================================
   SISTEMA — SUBTABS
============================================================ */
/* ============================================================
   SISTEMA — NAVEGAÇÃO AGRUPADA
============================================================ */

// Fecha todos os painéis de grupo abertos (exceto o indicado)
function closeAllSGrp(except) {
  ['personagem','acao','progressao','magia'].forEach(g => {
    if (g === except) return;
    const items = document.getElementById('sgrpitems-' + g);
    const btn   = document.getElementById('sgrpbtn-' + g);
    if (items) items.classList.remove('open');
    if (btn)   btn.classList.remove('open');
  });
}

// Abre/fecha um grupo
function toggleSGrp(grp) {
  const items = document.getElementById('sgrpitems-' + grp);
  const btn   = document.getElementById('sgrpbtn-'   + grp);
  const isOpen = items && items.classList.contains('open');
  closeAllSGrp(grp);
  if (!isOpen) {
    if (items) items.classList.add('open');
    if (btn)   btn.classList.add('open');
  }
}

// Fecha painéis ao clicar fora do sistema-nav
document.addEventListener('click', function(e) {
  if (!e.target.closest('#sistemaNav')) closeAllSGrp(null);
});

function showSistemaSubsec(sec) {
  // Fecha todos os painéis
  closeAllSGrp(null);

  // Atualiza seção de conteúdo
  document.querySelectorAll('.sistema-subsec').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sistema-subtab').forEach(t => t.classList.remove('active'));

  const el = document.getElementById('ssec-' + sec);
  if (el) el.classList.add('active');

  // Marca a subtab correta
  document.querySelectorAll('.sistema-subtab').forEach(t => {
    const oc = t.getAttribute('onclick') || '';
    if (oc.includes("'" + sec + "'")) t.classList.add('active');
  });

  // Marca o grupo que contém a tab ativa com destaque
  document.querySelectorAll('.sgrp-btn').forEach(b => b.classList.remove('has-active'));
  const activeTab = document.querySelector('.sistema-subtab.active');
  if (activeTab) {
    const grp = activeTab.dataset.grp;
    const grpBtn = document.getElementById('sgrpbtn-' + grp);
    if (grpBtn) grpBtn.classList.add('has-active');
  }

  // Lazy-render grimórios e catálogos de personagem
  if (sec === 'grimorio') {
    const c = document.getElementById('grimorioEscolasContainer');
    if (c && !c.dataset.rendered) { c.innerHTML = buildGrimorioEscolas(); c.dataset.rendered = '1'; }
  }
  if (sec === 'grimorio-mundanas') {
    const c = document.getElementById('grimorioMundanasContainer');
    if (c && !c.dataset.rendered) { c.innerHTML = buildGrimorioMundanas(); c.dataset.rendered = '1'; }
  }
  if (sec === 'habilidades-raciais' && !_mundoRendered.habilidades) {
    renderHabilidadesMundo(); _mundoRendered.habilidades = true;
  }
  if (sec === 'equipamentos' && !_mundoRendered.itens) {
    filtrarEquipMundo(); _mundoRendered.itens = true;
  }
  if (sec === 'combate' && window.CompanionUI && typeof window.CompanionUI.renderVerlorenSystemWorkbench === 'function') {
    window.CompanionUI.renderVerlorenSystemWorkbench(getSheet(currentSheetId));
  }
}

/* ============================================================
   MUNDO — ITENS SUBTABS
============================================================ */

/* ============================================================
   GRIMÓRIO — ESCOLAS DE MAGIA
   Ataque · Controle · Ampliação · Conjuração
============================================================ */
function buildGrimorioEscolas() {
  const schools = [
    GRIMORIO_ESCOLAS.ataque,
    GRIMORIO_ESCOLAS.controle,
    GRIMORIO_ESCOLAS.ampliacao,
    GRIMORIO_ESCOLAS.conjuracao
  ];

  let html = `
  <section class="sistema-section">
    <h2 class="sistema-section-title">📖 Grimório das Escolas de Magia</h2>
    <p class="sistema-desc">Catálogo completo das magias das quatro escolas arcanas de Verloren. Cada magia apresenta custo em PM, alcance, duração e área de efeito.</p>
    <div class="grimorio-school-tabs">
      ${schools.map((s,i) => `<button class="grim-tab${i===0?' active':''}" onclick="switchGrimTab('escola','${s.nome.replace(/\s+/g,'-')}',this)" style="--tab-cor:${s.cor}">${s.emoji} ${s.nome}</button>`).join('')}
    </div>`;

  schools.forEach((school, si) => {
    html += `<div class="grim-school-content${si===0?' active':''}" id="grim-escola-${school.nome.replace(/\s+/g,'-')}">
      <div class="sistema-card" style="border-left:4px solid ${school.cor};margin-bottom:16px;">
        <div style="font-weight:700;font-size:1rem;color:${school.cor};margin-bottom:6px;">${school.emoji} ${school.nome}</div>
        <p style="font-size:0.85rem;color:var(--text-secondary);margin:0;">${school.desc}</p>
      </div>
      <div class="grimorio-search-row">
        <input class="search-input" type="text" placeholder="Buscar magia..." oninput="filtrarGrimorio(this,'grim-escola-${school.nome.replace(/\s+/g,'-')}')" />
      </div>`;

    school.capitulos.forEach(cap => {
      html += `<div class="grim-capitulo">
        <div class="grim-cap-titulo">${cap.nome}</div>
        <div class="grim-spells-grid">`;
      cap.magias.forEach(m => {
        html += buildSpellCard(m, school.cor);
      });
      html += `</div></div>`;
    });

    html += `</div>`;
  });

  html += `</section>`;
  return html;
}

function buildGrimorioMundanas() {
  const caps = Object.entries(GRIMORIO_MUNDANAS_DATA);
  const total = caps.reduce((acc, [,c]) => acc + c.magias.length, 0);

  let html = `
  <section class="sistema-section">
    <h2 class="sistema-section-title">🌿 Grimório das Magias Mundanas</h2>
    <p class="sistema-desc">Encantamentos utilitários catalogados fora das quatro grandes escolas arcanas. <strong>${total} magias</strong> organizadas em ${caps.length} capítulos temáticos — de valor inestimável para o viajante, o artesão e o espião.</p>
    <div class="grimorio-search-row" style="margin-bottom:16px;">
      <input class="search-input" type="text" id="mundanasSearch" placeholder="Buscar magia mundana..." oninput="filtrarGrimorioMundanas(this)" />
      <div id="mundanasCount" style="font-size:0.78rem;color:var(--text-muted);padding:6px 10px;">${total} magias</div>
    </div>`;

  caps.forEach(([num, cap]) => {
    html += `<div class="grim-capitulo" id="grim-cap-mnd-${num}">
      <div class="grim-cap-titulo">${num} — ${cap.emoji} ${cap.nome}</div>
      <div class="grim-spells-grid mundanas">`;
    cap.magias.forEach(m => {
      html += buildSpellCard(m, '#7ab87a', true);
    });
    html += `</div></div>`;
  });

  html += `</section>`;
  return html;
}

function buildSpellCard(m, cor, isMundana) {
  const pmColor = m.pm <= 2 ? '#7ab87a' : m.pm <= 8 ? '#e0a030' : m.pm <= 15 ? '#e06060' : '#d040d0';
  const elemDefs = [
    { key:'fogo',    emoji:'🔥', color:'#e05020', pattern:/\b(fog|chama|ígnea|ígneo|incêndio|calor|ardente|braseiro|infernal)\b/i },
    { key:'gelo',    emoji:'❄️', color:'#50a0d0', pattern:/\b(gel|glacial|frio|neve|neblina|congelamento|tundra)\b/i },
    { key:'raio',    emoji:'⚡', color:'#d0b020', pattern:/\b(raio|elétric|trovão|tempestade|relâmpago|fulminante)\b/i },
    { key:'terra',   emoji:'🪨', color:'#a07030', pattern:/\b(terra|pedra|rocha|mineral|granito|quartzo|solo|lama)\b/i },
    { key:'vento',   emoji:'🌀', color:'#70b070', pattern:/\b(vento|ar|brisa|ciclone|furacão|rajada|tufão)\b/i },
    { key:'água',    emoji:'💧', color:'#4090c0', pattern:/\b(água|aqua|chuva|oceano|rio|dilúvio|maré|tidal)\b/i },
    { key:'luz',     emoji:'✨', color:'#d0c020', pattern:/\b(luz|luz\s|radiante|sagrada|sagrado|divina|celestial|solar|bênção)\b/i },
    { key:'sombra',  emoji:'🌑', color:'#8060c0', pattern:/\b(sombra|trevas|escuridão|negra|umbra|noite|obscuro)\b/i },
    { key:'ácido',   emoji:'🧪', color:'#80c040', pattern:/\b(ácido|veneno|tóxico|corrosivo|pus|bile|venenoso)\b/i },
    { key:'necrótico',emoji:'💀',color:'#906080', pattern:/\b(necrótico|morte|vampírico|drenagem|putrefação|cadáver|espectral)\b/i },
  ];
  // Determine element: use explicit m.elemento or auto-detect
  let elemLabel = m.elemento || null;
  let elemColor = '#909090';
  if (!elemLabel) {
    const text = `${m.nome||''} ${m.desc||''}`;
    for (const e of elemDefs) {
      if (e.pattern.test(text)) { elemLabel = `${e.emoji} ${e.key.charAt(0).toUpperCase()+e.key.slice(1)}`; elemColor = e.color; break; }
    }
  } else {
    const ek = elemLabel.toLowerCase().replace(/^[^\w]+/,'').trim().split(' ')[0];
    const found = elemDefs.find(e => e.key === ek || ek.startsWith(e.key.slice(0,4)));
    if (found) elemColor = found.color;
  }
  const elemElem = elemLabel ? `<span class="grim-spell-elemento" style="background:${elemColor}18;color:${elemColor};border-color:${elemColor}40;">${elemLabel}</span>` : '';
  const dataElem = normalizeSearchText(elemLabel || '');
  return `<div class="grim-spell-card" data-nome="${escapeHtml(normalizeSearchText(m.nome || ''))}" data-desc="${escapeHtml(normalizeSearchText(m.desc || ''))}" data-elemento="${escapeHtml(dataElem)}">
    <div class="grim-spell-header">
      <span class="grim-spell-nome">${m.nome}</span>
      <span class="grim-spell-pm" style="background:${pmColor}20;color:${pmColor};border-color:${pmColor}40;">${m.pm} PM</span>
    </div>
    <div class="grim-spell-meta">
      ${m.nivel !== undefined && !isMundana ? `<span class="grim-spell-nivel">Nv${m.nivel}</span>` : ''}
      ${elemElem}
      ${m.alcance ? `<span>📍 ${m.alcance}</span>` : ''}
      ${m.duracao ? `<span>⏱ ${m.duracao}</span>` : ''}
      ${m.area && m.area !== '—' ? `<span>🎯 ${m.area}</span>` : ''}
    </div>
    <div class="grim-spell-desc">${m.desc}</div>
    ${m.obs ? `<div class="grim-spell-obs">✦ ${m.obs}</div>` : ''}
  </div>`;
}

function switchGrimTab(tipo, id, btn) {
  const container = btn.closest('.sistema-subsec') || btn.closest('section') || btn.parentElement.closest('div') || btn.parentElement;
  container.querySelectorAll('.grim-tab').forEach(t => t.classList.remove('active'));
  container.querySelectorAll('.grim-school-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  const content = document.getElementById(`grim-${tipo}-${id}`);
  if (content) content.classList.add('active');
}

function filtrarGrimorio(input, containerId) {
  const q = normalizeSearchText(input.value);
  const container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll('.grim-spell-card').forEach(card => {
    const match = !q || card.dataset.nome.includes(q) || card.dataset.desc.includes(q);
    card.style.display = match ? '' : 'none';
  });
  container.querySelectorAll('.grim-capitulo').forEach(cap => {
    const visible = [...cap.querySelectorAll('.grim-spell-card')].some(c => c.style.display !== 'none');
    cap.style.display = visible ? '' : 'none';
  });
}

function filtrarGrimorioMundanas(input) {
  const q = normalizeSearchText(input.value);
  let count = 0;
  let total = 0;
  document.querySelectorAll('#grimorioMundanasContainer .grim-spell-card').forEach(card => {
    const match = !q || card.dataset.nome.includes(q) || card.dataset.desc.includes(q);
    card.style.display = match ? '' : 'none';
    if (match) count++;
    total++;
  });
  document.querySelectorAll('#grimorioMundanasContainer .grim-capitulo').forEach(cap => {
    const visible = [...cap.querySelectorAll('.grim-spell-card')].some(c => c.style.display !== 'none');
    cap.style.display = visible ? '' : 'none';
  });
  const el = document.getElementById('mundanasCount');
  if (el) el.textContent = q ? `${count} de ${total} encontradas` : `${total} magias`;
}

/* ============================================================
   MUNDO — HABILIDADES
============================================================ */
function renderHabilidadesMundo() {
  const grid = document.getElementById('habMundoGrid');
  const raceFilter = document.getElementById('habMundoRaceFilter');
  if (!grid) return;

  // Populate race filter
  if (raceFilter && raceFilter.options.length <= 1) {
    const races = typeof RACES_DB !== 'undefined' ? RACES_DB.map(r => r.name).sort() : [];
    races.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r;
      opt.textContent = r;
      raceFilter.appendChild(opt);
    });
  }

  filtrarHabilidadesMundo();
}

function filtrarHabilidadesMundo() {
  const grid = document.getElementById('habMundoGrid');
  if (!grid) return;

  const q = document.getElementById('habMundoSearch')?.value || '';
  const raceF = document.getElementById('habMundoRaceFilter')?.value || '';
  const tipoF = document.getElementById('habMundoTipoFilter')?.value || '';

  if (typeof RACES_DB === 'undefined') {
    grid.innerHTML = '<p style="color:var(--text-muted);padding:20px;">Dados de raças não disponíveis.</p>';
    return;
  }

  // Collect all habilidades from all races
  const allHabs = [];
  RACES_DB.forEach(race => {
    const addHabs = (habs, tipo, caminhoNome) => {
      (habs || []).forEach(h => {
        allHabs.push({ ...h, raceName: race.name, raceClass: race.classificacao || 'Base', tipo, caminhoNome: caminhoNome || null });
      });
    };
    addHabs(race.habilidades,  'ativa',    null);
    addHabs(race.passivas,     'passiva',  null);
    // progressao
    const prog = race.progressao || {};
    addHabs(prog.nucleo, 'progressao', 'Núcleo');
    (prog.caminhos || []).forEach(c => addHabs(c.habilidades, 'progressao', c.nome));
    // subraças
    (race.subraças || []).forEach(s => {
      addHabs(s.habilidades, 'ativa', s.name);
      addHabs(s.passivas,    'passiva', s.name);
    });
  });

  const filtered = allHabs.filter(h => {
    if (raceF && h.raceName !== raceF) return false;
    if (tipoF && h.tipo !== tipoF) return false;
    if (h.negativa && tipoF && tipoF !== 'negativa') return false;
    if (tipoF === 'negativa' && !h.negativa) return false;
    if (q && !(includesNormalized(h.nome, q) || includesNormalized(h.desc, q) || includesNormalized(h.raceName, q))) return false;
    return true;
  });

  if (!filtered.length) {
    grid.innerHTML = '<div class="empty-state" style="padding:40px 20px;"><div class="empty-state-icon">⚡</div><h3>Nenhuma habilidade encontrada</h3></div>';
    return;
  }

  grid.innerHTML = filtered.map(h => {
    const icon = h.negativa ? '⊘' : (h.tipo === 'passiva' ? '◈' : h.tipo === 'progressao' ? '⬡' : '✦');
    const tipoBadgeCls = h.negativa ? 'hab-tipo-negativa' : h.tipo === 'passiva' ? 'hab-tipo-passiva' : h.tipo === 'progressao' ? 'hab-tipo-progressao' : 'hab-tipo-ativa';
    const tipoLabel = h.negativa ? 'Negativa' : h.tipo === 'passiva' ? 'Passiva' : h.tipo === 'progressao' ? 'Progressão' : 'Ativa';

    const efeitos = h.efeito && h.efeito.mods ? Object.entries(h.efeito.mods).map(([k,v]) =>
      `<div class="mundo-hab-efeito-row"><span style="font-weight:700;color:var(--text-accent);">${k}</span> ${v > 0 ? '+' + v : v}</div>`).join('') : '';

    return `<div class="mundo-hab-card">
      <div class="mundo-hab-header">
        <div class="mundo-hab-icon">${icon}</div>
        <div class="mundo-hab-info">
          <div class="mundo-hab-nome">${escapeHtml(h.nome || 'Sem nome')}</div>
          <div class="mundo-hab-meta">
            <span class="hab-tipo-badge ${tipoBadgeCls}">${tipoLabel}</span>
            <span class="hab-race-badge">${escapeHtml(h.raceName)}</span>
            ${h.caminhoNome ? `<span style="font-size:0.62rem;color:var(--text-muted);font-style:italic;">${escapeHtml(h.caminhoNome)}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="mundo-hab-body">
        ${h.req ? `<div class="hab-req">⚠ Req: ${escapeHtml(h.req)}</div>` : ''}
        <div class="mundo-hab-desc">${escapeHtml(h.desc || 'Sem descrição.')}</div>
        ${efeitos ? `<div class="mundo-hab-efeitos"><div class="mundo-hab-efeitos-title">Efeitos</div>${efeitos}</div>` : ''}
      </div>
    </div>`;
  }).join('');
}

/* ============================================================
   MUNDO — ITENS (Equipamentos + Drops)
============================================================ */
function renderItensMundo() {
  filtrarEquipMundo();
  filtrarDropsMundo();
}

function filtrarEquipMundo() {
  const grid = document.getElementById('equipMundoGrid');
  if (!grid) return;
  const q = document.getElementById('equipMundoSearch')?.value || '';
  const tipoF = document.getElementById('equipMundoTipoFilter')?.value || '';

  const todos = [...(EQUIPAMENTOS_DB.armas || []), ...(EQUIPAMENTOS_DB.armaduras || []), ...(EQUIPAMENTOS_DB.escudos || [])];
  const filtered = todos.filter(e => {
    if (tipoF && e.tipo !== tipoF) return false;
    if (q && !(includesNormalized(e.nome, q) || includesNormalized(e.categoria, q))) return false;
    return true;
  });

  if (!filtered.length) {
    grid.innerHTML = '<div class="empty-state" style="padding:40px;"><div class="empty-state-icon">⚔️</div><h3>Nenhum item encontrado</h3></div>';
    return;
  }

  grid.innerHTML = filtered.map(e => {
    const cls = e.tipo;
    let statsHTML = '';
    if (e.tipo === 'arma') {
      statsHTML = `
        <span class="equip-stat-pill atk">🎲 ${e.dado}</span>
        <span class="equip-stat-pill">${e.tipoDano}</span>
        <span class="equip-stat-pill">${e.empunhadura}</span>
        <span class="equip-stat-pill">⚖ ${e.peso}kg</span>
        <span class="equip-stat-pill preco">💰 ${e.preco}P</span>`;
    } else if (e.tipo === 'armadura') {
      statsHTML = `
        <span class="equip-stat-pill def">🛡 DEF +${e.rd}</span>
        <span class="equip-stat-pill">CA +${e.ca}</span>
        ${e.rm ? `<span class="equip-stat-pill mag">RM +${e.rm}</span>` : ''}
        ${e.penalidade ? `<span class="equip-stat-pill pen">AGI ${e.penalidade}</span>` : ''}
        <span class="equip-stat-pill">⚖ ${e.peso}kg</span>
        <span class="equip-stat-pill preco">💰 ${e.preco}P</span>`;
    } else if (e.tipo === 'escudo') {
      statsHTML = `
        <span class="equip-stat-pill def">🛡 DEF +${e.defesa}</span>
        <span class="equip-stat-pill">Dur. ${e.durabilidade}</span>
        ${e.penalidade ? `<span class="equip-stat-pill pen">AGI ${e.penalidade}</span>` : ''}
        <span class="equip-stat-pill">⚖ ${e.peso}kg</span>
        <span class="equip-stat-pill preco">💰 ${e.preco}P</span>`;
    }
    const tipoLabel = { arma: '⚔️ Arma', armadura: '🛡 Armadura', escudo: '🔰 Escudo' }[e.tipo] || e.tipo;
    return `<div class="equip-mundo-card ${cls}">
      <div class="equip-mundo-nome">${escapeHtml(e.nome)}</div>
      <div style="margin-bottom:8px;"><span class="equip-card-tipo equip-tipo-${e.tipo}">${tipoLabel}</span>${e.categoria ? ` <span style="font-size:0.7rem;color:var(--text-muted);">${e.categoria}</span>` : ''}</div>
      <div class="equip-mundo-stats">${statsHTML}</div>
      ${e.critico ? `<div style="font-size:0.72rem;color:var(--text-muted);margin-top:4px;">Crítico: <b>${e.critico}</b></div>` : ''}
      ${e.requisitos ? `<div style="font-size:0.72rem;color:var(--attr-warn);margin-top:4px;">Req: ${Object.entries(e.requisitos).map(([k,v])=>k+' '+v).join(', ')}</div>` : ''}
    </div>`;
  }).join('');
}

// Drops are collected from Bestiário and Metaflora
function filtrarDropsMundo() {
  const grid = document.getElementById('dropsMundoGrid');
  if (!grid) return;
  const q = document.getElementById('dropsMundoSearch')?.value || '';
  const rarF = document.getElementById('dropsMundoRarFilter')?.value;

  // Collect all drops from bestas and flora
  const allDrops = [];
  if (typeof MUNDO_BESTAS !== 'undefined') {
    MUNDO_BESTAS.forEach(b => {
      (b.drops || []).forEach(d => {
        allDrops.push({ nome: d.item, rar: d.rar ?? d.raridade ?? 0, fonte: b.nome, desc: d.desc || '', tipoFonte: 'criatura', chance: d.chance });
      });
    });
  }
  if (typeof MUNDO_FLORA !== 'undefined') {
    MUNDO_FLORA.forEach(f => {
      (f.drops || []).forEach(d => {
        allDrops.push({ nome: d, rar: f.rar || 0, fonte: f.nome, desc: '', tipoFonte: 'planta', chance: '' });
      });
    });
  }

  const filtered = allDrops.filter(d => {
    if (rarF !== undefined && rarF !== '' && String(d.rar) !== rarF) return false;
    if (q && !(includesNormalized(d.nome, q) || includesNormalized(d.fonte, q))) return false;
    return true;
  });

  if (!filtered.length) {
    grid.innerHTML = '<div class="empty-state" style="padding:40px;"><div class="empty-state-icon">💎</div><h3>Nenhum drop encontrado</h3></div>';
    return;
  }

  const RARITY_LABELS_LOCAL = ['Comum','Incomum','Raro','Muito Raro','Épico','Lendário'];
  const RARITY_COLORS_LOCAL = ['raridade-0','raridade-1','raridade-2','raridade-3','raridade-4','raridade-5'];

  grid.innerHTML = filtered.map(d => `
    <div class="drop-mundo-card">
      <div class="drop-rarity-bar flora-rarity-${d.rar}"></div>
      <div class="drop-mundo-body">
        <div class="drop-mundo-nome">${escapeHtml(d.nome)}</div>
        <div style="margin-bottom:8px;">
          <span class="flora-badge ${RARITY_COLORS_LOCAL[d.rar]}">${RARITY_LABELS_LOCAL[d.rar] || 'Comum'}</span>
          ${d.chance ? `<span class="drop-chance">${d.chance}</span>` : ''}
        </div>
        ${d.desc ? `<div class="drop-mundo-desc">${escapeHtml(d.desc)}</div>` : ''}
        <div class="drop-mundo-fonte">Fonte: <b>${escapeHtml(d.fonte)}</b> <span style="color:var(--text-muted);">(${d.tipoFonte})</span></div>
      </div>
    </div>`).join('');
}

