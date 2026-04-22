/* ============================================================
   RAÇAS PRÉ-CADASTRADAS
============================================================ */
/* ============================================================
   BANCO DE DADOS DE RAÇAS — corrigido e expandido
============================================================ */

// Cada raça: name, classificacao, conceito, atributos, modos, subraças (opcional)
/* ============================================================
   BASE DE DADOS DE RAÇAS (RACES_DB)
   Estrutura de cada entrada:
   - name:           Nome da raça
   - classificacao:  'Base' | 'Celestial' | 'Excêntrica'
   - conceito:       Descrição narrativa
   - atributos:      Bônus base (aplicados ao criar preset ou ao selecionar raça)
   - modos:          Valores base de Bruto/Ágil/Preciso/Intuitivo
   - pontosExtras:   (opcional) pontos livres adicionais
   - observacao:     Nota de design/balanceamento
   - habilidades:    Habilidades ativas/passivas da raça (com id único)
   - passivas:       Passivas intrínsecas (sempre ativas, incluindo negativas)
   - progressao:     { nucleo: [...], caminhos: [...] } — habilidades de nível
   - variacoes:      Variações culturais/locus (escolhida na criação)
   - subraças:       (opcional) subtipos com atributos/modos próprios
============================================================ */
const CLS_KEY = { 'Base':'base', 'Celestial':'celestial', 'Excêntrica':'eccentrica' };

// Renderiza os chips de raça filtrados pela classificação atual
function renderRaceChips(classificacao) {
  const chips  = document.getElementById('raceChips');
  const sheet  = getSheet(currentSheetId);
  if (!chips) return;

  const races = RACES_DB.filter(r => r.classificacao === classificacao);
  const selected = sheet?.raceSelecionada || null;
  const clsKey   = CLS_KEY[classificacao] || 'base';

  chips.innerHTML = races.map(function(r) {
    var isSel = selected === r.name;
    var extras = r.pontosExtras ? ' <span style="font-size:0.65rem;opacity:0.85;">+' + r.pontosExtras + 'pt modo</span>' : '';
      var extrasA = r.pontosExtrasAtributo ? ' <span style="font-size:0.65rem;opacity:0.85;">+' + r.pontosExtrasAtributo + 'pts</span>' : '';
      var balSum = r.atributos ? Object.values(r.atributos).reduce(function(a,b){return a+(b||0);}, 0) : 0;
      var balTag = balSum !== 0 ? ' <span style="font-size:0.6rem;opacity:0.7;">' + (balSum>0?'+':'') + balSum + '</span>' : '';
      var hasProfTooltip = r.proficiencias ? ' title="⚔ ' + (r.proficiencias.armas || '') + ' | 🛡 ' + (r.proficiencias.armaduras || '') + '"' : '';
    return '<span class="race-chip ' + clsKey + (isSel ? ' selected' : '') + '" ' +
      'onclick="selectRace(\'' + r.name + '\')" ' +
      'title="' + (r.observacao || r.conceito || '').replace(/"/g, '&quot;') + '">' +
      r.name + extras +
    '</span>';
  }).join('');

  // Renderiza subraças se a raça selecionada tiver
  renderSubraceChips(selected);
  // Mostra/esconde banner
  renderRaceAppliedBanner(sheet);
}

// Exibe subraças (ex: Laika)
function renderSubraceChips(raceName) {
  const wrap = document.getElementById('subraceWrap');
  if (!wrap) return;
  const race = RACES_DB.find(r => r.name === raceName);
  if (!race || !race.subraças || !race.subraças.length) {
    wrap.style.display = 'none';
    wrap.innerHTML = '';
    return;
  }
  const sheet = getSheet(currentSheetId);
  const selSub = sheet?.subraçaSelecionada || null;
  wrap.style.display = 'block';
  wrap.innerHTML = `
    <span class="subrace-label">Subtipo de ${race.name}</span>
    <div class="subrace-chips">
      ${race.subraças.map(s => `
        <span class="subrace-chip ${selSub === s.name ? 'selected' : ''}"
          onclick="selectSubrace('${s.name}')">
          ${s.name}
        </span>`).join('')}
    </div>`;
}

// Banner que indica raça aplicada
function renderRaceAppliedBanner(sheet) {
  const banner = document.getElementById('raceAppliedBanner');
  if (!banner) return;
  if (!sheet?.raceSelecionada) { banner.style.display = 'none'; return; }
  const label = sheet.subraçaSelecionada
    ? `${sheet.raceSelecionada} — ${sheet.subraçaSelecionada}`
    : sheet.raceSelecionada;
  banner.style.display = 'flex';
  banner.innerHTML = `
    <span>✦ Modificadores de <strong>${label}</strong> aplicados</span>
    <button onclick="clearRaceSelection()">Remover raça</button>`;
}

// Seleciona uma raça e aplica modificadores
function selectRace(name) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  const race = RACES_DB.find(r => r.name === name);
  if (!race) return;

  // Toggle: clicar na mesma raça remove a seleção
  if (sheet.raceSelecionada === name && !RACES_DB.find(r=>r.name===name)?.subraças?.length) {
    clearRaceSelection();
    return;
  }

  // Limpar habilidades da raça anterior ao trocar
  if (sheet.raceSelecionada !== name) {
    sheet.habilidadesAtivas = [];
    sheet.progressaoAtiva   = [];
    sheet.caminhoEscolhido  = null;
    sheet.variacaoLocus     = null;
    sheet.laikaIntensidade  = 0;
    sheet.laikaAlterForms   = [];
  }

  sheet.raceSelecionada    = name;
  sheet.subraçaSelecionada = null;

  applyRaceModifiers(sheet, race.atributos, race.modos);
}

// Seleciona subraça e aplica seus modificadores
function selectSubrace(subraçaName) {
  const sheet = getSheet(currentSheetId);
  if (!sheet || !sheet.raceSelecionada) return;
  const race    = RACES_DB.find(r => r.name === sheet.raceSelecionada);
  const subraça = race?.subraças?.find(s => s.name === subraçaName);
  if (!subraça) return;

  // Toggle
  if (sheet.subraçaSelecionada === subraçaName) {
    sheet.subraçaSelecionada = null;
    applyRaceModifiers(sheet, race.atributos, race.modos);
    return;
  }
  sheet.subraçaSelecionada = subraçaName;
  // Subraça sobrescreve a raça base
  applyRaceModifiers(sheet, subraça.atributos, subraça.modos);
}

// Remove seleção de raça
function clearRaceSelection() {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  sheet.raceSelecionada    = null;
  sheet.subraçaSelecionada = null;
  sheet.raceBonus          = {};
  sheet.raceModos          = { Bruto:2, Ágil:2, Preciso:2, Intuitivo:2 };
  sheet.modos              = { Bruto:2, Ágil:2, Preciso:2, Intuitivo:2 };
  sheet.habilidadesAtivas  = [];
  sheet.progressaoAtiva    = [];
  sheet.caminhoEscolhido   = null;
  sheet.variacaoLocus      = null;
  sheet.laikaIntensidade   = 0;
  sheet.laikaAlterForms    = [];
  renderAtributosGrid(sheet);
  renderModos(sheet.modos);
  renderNivelInfo(sheet);
  renderRaceChips(sheet.classificacao);
  updateRaceInfoPanel(sheet);
  renderHabilidades(sheet);
  debounceSave();
  toast('Raça removida. Atributos base preservados.', 'info');
}

// Aplica os modificadores de atributos e modos na ficha
function applyRaceModifiers(sheet, attrs, modos) {
  // Guarda o bônus racial separado — NÃO altera sheet.atributos (base do jogador)
  sheet.raceBonus = {};
  if (attrs) {
    Object.keys(attrs).forEach(function(a) {
      if (attrs[a] !== 0) sheet.raceBonus[a] = attrs[a];
    });
  }
  // Copia modos da raça como ponto de partida; guarda como base racial (não custa pontos)
  const nomesModos = ['Bruto','Ágil','Preciso','Intuitivo'];
  sheet.raceModos = {};
  if (modos) {
    nomesModos.forEach(function(m) {
      const v = modos[m] !== undefined ? Math.max(0, modos[m]) : 2;
      sheet.modos[m]     = v;  // valor atual = base racial
      sheet.raceModos[m] = v;  // base racial salva
    });
  } else {
    nomesModos.forEach(function(m) {
      sheet.raceModos[m] = sheet.modos[m] ?? 1;
    });
  }
  // Atualiza contadores
  renderNivelInfo(sheet);
  // Re-renderiza
  renderAttrs(sheet.atributos);
  renderModos(sheet.modos);
  renderRaceChips(sheet.classificacao);
  updateRaceInfoPanel(sheet);
  updateStats(sheet);
  updatePicosVales(sheet);
  debounceSave();
  var label = sheet.subraçaSelecionada
    ? sheet.raceSelecionada + ' — ' + sheet.subraçaSelecionada
    : sheet.raceSelecionada;
  var race = RACES_DB.find(function(r) { return r.name === sheet.raceSelecionada; });
  var extrasMsg = race && race.pontosExtras ? ' (+' + race.pontosExtras + ' pontos extras livres)' : '';
  toast('Modificadores de ' + label + ' aplicados!' + extrasMsg, 'success');
  // Re-render habilidades para nova raça
  renderHabilidades(sheet);
}

/* ============================================================
   PAINEL DE INFORMAÇÃO DE RAÇA NOS MODOS
============================================================ */
function updateRaceInfoPanel(sheet) {
  var panel = document.getElementById('modosRaceInfo');
  if (!panel) return;
  if (!sheet || !sheet.raceSelecionada) {
    panel.innerHTML = '<p style="font-size:0.78rem;color:var(--text-muted);">Escala 0–4 · Selecione uma raça para ver os modos base</p>';
    return;
  }
  var race     = RACES_DB.find(function(r) { return r.name === sheet.raceSelecionada; });
  var subraca  = race && race.subraças ? race.subraças.find(function(s) { return s.name === sheet.subraçaSelecionada; }) : null;
  var source   = subraca || race;
  var label    = sheet.subraçaSelecionada ? (sheet.raceSelecionada + ' — ' + sheet.subraçaSelecionada) : sheet.raceSelecionada;
  var obs      = (subraca ? '' : (race ? race.observacao || '' : ''));
  var extras   = (race && race.pontosExtras && !subraca) ? race.pontosExtras : 0;
  var extrasAttr = (race && race.pontosExtrasAtributo && !subraca) ? race.pontosExtrasAtributo : 0;
  var modsStr  = source && source.modos
    ? Object.entries(source.modos).map(function(e) {
        return '<strong>' + e[0] + ':</strong> ' + e[1];
      }).join(' &nbsp;·&nbsp; ')
    : '';
  var prof = race ? (race.proficiencias || null) : null;

  var profHtml = '';
  if (prof) {
    var rows = [];
    if (prof.armas)       rows.push(['⚔', 'Armas', prof.armas]);
    if (prof.armaduras)   rows.push(['🛡', 'Armaduras', prof.armaduras]);
    if (prof.tipoMagico && prof.tipoMagico.length) rows.push(['✨', 'Magia', prof.tipoMagico.join(', ')]);
    if (prof.escolas && prof.escolas.length) rows.push(['📖', 'Escolas', prof.escolas.join(', ')]);
    if (prof.afinidades && prof.afinidades.length && prof.afinidades[0] !== 'Nenhuma fixa') rows.push(['🔥', 'Afinidades', prof.afinidades.join(', ')]);
    if (prof.skillsIniciais) rows.push(['📚', 'Skills Iniciais', '+' + prof.skillsIniciais]);
    if (prof.periciasBonus)  rows.push(['🎯', 'Perícias', prof.periciasBonus]);
    if (rows.length) {
      var rowsHtml = rows.map(function(r) {
        return '<div style="display:flex;gap:6px;align-items:baseline;font-size:0.74rem;">' +
          '<span>' + r[0] + '</span>' +
          '<span style="color:var(--text-muted);min-width:72px;">' + r[1] + '</span>' +
          '<span style="color:var(--text-secondary);">' + r[2] + '</span>' +
          '</div>';
      }).join('');
      profHtml = '<div style="margin-top:8px;padding:8px 10px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);display:flex;flex-direction:column;gap:4px;">' + rowsHtml + '</div>';
      if (prof.progressao) {
        profHtml += '<div style="margin-top:5px;font-size:0.7rem;color:var(--text-muted);font-style:italic;padding:0 2px;">' + prof.progressao + '</div>';
      }
    }
  }

  panel.innerHTML =
    '<div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 14px;font-size:0.8rem;color:var(--text-secondary);">' +
      '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:' + (obs || profHtml ? '6' : '0') + 'px;">' +
        '<span style="font-weight:700;color:var(--text-accent);">✦ ' + label + '</span>' +
        (extrasAttr ? '<span style="background:var(--lavanda-light);color:var(--text-accent);border-radius:12px;padding:2px 10px;font-size:0.72rem;font-weight:700;">+' + extrasAttr + ' pts attr extra</span>' : '') +
        (extras ? '<span style="background:var(--menta-light,#d0f0e0);color:var(--menta-dark,#2a7a5a);border-radius:12px;padding:2px 10px;font-size:0.72rem;font-weight:700;">+' + extras + ' pt modo extra</span>' : '') +
        '<span style="color:var(--text-muted);">' + modsStr + '</span>' +
      '</div>' +
      (obs ? '<div style="font-size:0.75rem;color:var(--text-muted);font-style:italic;margin-bottom:6px;">' + obs + '</div>' : '') +
      profHtml +
    '</div>';
}

/* ============================================================
   RENDERIZAR PRESETS (agrupados por classificação + botão editar)
============================================================ */
function renderPresets() {
  const presets = appData.sheets.filter(s => s.tipo === 'preset');
  const grid = document.getElementById('presetsGrid');
  const empty = document.getElementById('presetsEmptyState');

  if (!presets.length) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  // Separar personagens prontos de presets raciais
  const personagensProntos = presets.filter(p => p.personagemPronto);
  const raciais = presets.filter(p => !p.personagemPronto);

  function buildPresetCard(p, isPersonagem) {
    const subLabel = isPersonagem
      ? `${p.raceSelecionada || p.raca || p.classificacao} · Nv${p.nivel || 1} · ${p.classe || 'Personagem'}`
      : `${p.classificacao} · Preset Racial`;
    return `
      <div class="preset-card${isPersonagem ? ' preset-personagem' : ''}">
        <div class="preset-name">${p.name || '(Sem nome)'}</div>
        <div class="preset-class">${subLabel}</div>
        ${isPersonagem && p.conceitoNarrativo ? `<div class="preset-conceito">${(p.conceitoNarrativo||'').split('—')[1]?.trim() || ''}</div>` : ''}
        <div class="preset-actions">
          <button class="btn btn-primary btn-sm" onclick="newSheetFromPreset('${p.id}')">▶ Usar</button>
          <button class="btn btn-secondary btn-sm" onclick="openEditPresetModal('${p.id}')">✏️</button>
          <button class="btn btn-ghost btn-sm" onclick="openDeleteModal('${p.id}')" style="color:var(--attr-neg)">✕</button>
        </div>
      </div>`;
  }

  let html = '';

  // ── SEÇÃO: PERSONAGENS PRONTOS ──
  if (personagensProntos.length) {
    html += `<div style="grid-column:1/-1;margin:14px 0 6px;">
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-size:1.1rem;font-weight:800;color:var(--text-accent);">👤 Personagens Prontos</span>
        <span style="font-size:0.75rem;color:var(--text-muted);font-style:italic;">${personagensProntos.length} personagens • prontos para jogar</span>
      </div>
    </div>`;

    // Agrupar por raça
    const porRaca = {};
    personagensProntos.forEach(p => {
      const r = p.raceSelecionada || p.raca || p.classificacao || 'Outros';
      (porRaca[r] = porRaca[r] || []).push(p);
    });
    Object.entries(porRaca).forEach(([raca, lista]) => {
      html += `<div style="grid-column:1/-1;margin:10px 0 4px 0;">
        <span style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);padding:2px 10px;background:var(--bg-secondary);border-radius:10px;">${raca}</span>
      </div>`;
      lista.forEach(p => { html += buildPresetCard(p, true); });
    });
    html += `<div style="grid-column:1/-1;height:1px;background:var(--border);margin:16px 0 10px;"></div>`;
  }

  // ── SEÇÃO: PRESETS RACIAIS ──
  if (raciais.length) {
    html += `<div style="grid-column:1/-1;margin:4px 0 8px;">
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-size:1.1rem;font-weight:800;color:var(--text-accent);">🌟 Presets Raciais</span>
        <span style="font-size:0.75rem;color:var(--text-muted);font-style:italic;">${raciais.length} raças • bases para construção</span>
      </div>
    </div>`;
    const groups = { Base:[], Celestial:[], 'Excêntrica':[] };
    raciais.forEach(p => {
      const c = p.classificacao || 'Base';
      (groups[c] = groups[c] || []).push(p);
    });
    Object.entries(groups).forEach(([cls, list]) => {
      if (!list.length) return;
      const clsKey = CLS_KEY[cls] || 'base';
      html += `<div style="grid-column:1/-1;margin:8px 0 4px;">
        <span class="badge badge-${clsKey}" style="font-size:0.8rem;padding:4px 14px;">${cls}</span>
      </div>`;
      list.forEach(p => { html += buildPresetCard(p, false); });
    });
  }

  grid.innerHTML = html;
}

/* ============================================================
   MODAL DE EDIÇÃO DE PRESET
============================================================ */
let editingPresetId = null;

function openEditPresetModal(id) {
  editingPresetId = id;
  const p = getSheet(id);
  if (!p) return;

  document.getElementById('editPresetModalTitle').textContent = `Editar: ${p.name}`;
  document.getElementById('editPresetName').value    = p.name;
  document.getElementById('editPresetConceito').value = p.conceitoNarrativo || '';

  const allAttrs = ['FOR','CON','AGI','DES','VIDA','DEF','INT','SAB','VON','CAR','PER','MAG','RESM','ATQ'];
  const attrsEl  = document.getElementById('editPresetAttrs');
  attrsEl.innerHTML = allAttrs.map(a => {
    const v = p.atributos?.[a] ?? 0;
    return `
      <div class="preset-edit-attr">
        <label>${a}</label>
        <input type="number" id="epa-${a}" value="${v}" min="-10" max="10" />
      </div>`;
  }).join('');

  const modos = p.modos || { Bruto:1,Ágil:1,Preciso:1,Intuitivo:1 };
  const modosEl = document.getElementById('editPresetModos');
  modosEl.innerHTML = ['Bruto','Ágil','Preciso','Intuitivo'].map(m => `
    <div class="preset-edit-modo">
      <label>${m}</label>
      <input type="number" id="epm-${m}" value="${modos[m]??1}" min="0" max="10" />
    </div>`).join('');

  openModal('editPresetModal');
}

function confirmEditPreset() {
  const p = getSheet(editingPresetId);
  if (!p) return;

  p.name = document.getElementById('editPresetName').value;
  p.conceitoNarrativo = document.getElementById('editPresetConceito').value;

  const allAttrs = ['FOR','CON','AGI','DES','VIDA','DEF','INT','SAB','VON','CAR','PER','MAG','RESM','ATQ'];
  allAttrs.forEach(a => {
    p.atributos[a] = parseInt(document.getElementById(`epa-${a}`)?.value) || 0;
  });
  ['Bruto','Ágil','Preciso','Intuitivo'].forEach(m => {
    p.modos[m] = parseInt(document.getElementById(`epm-${m}`)?.value) || 1;
  });
  p.updatedAt = Date.now();

  saveData();
  closeModal('editPresetModal');
  renderPresets();
  renderLibrary();
  toast('Preset atualizado!', 'success');
}

/* ============================================================
   PRÉ-CARREGAMENTO DE RAÇAS
============================================================ */
function openPreloadModal() {
  const list = document.getElementById('preloadList');
  // Agrupa por classificação no modal
  const groups = {};
  RACES_DB.forEach(r => {
    (groups[r.classificacao] = groups[r.classificacao] || []).push(r);
  });
  let html = '';
  Object.entries(groups).forEach(([cls, races]) => {
    const clsKey = CLS_KEY[cls] || 'base';
    html += `<div style="width:100%;font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin:8px 0 4px;">${cls}</div>`;
    races.forEach(r => {
      const already = appData.sheets.some(s => s.tipo === 'preset' && s.name === r.name);
      html += `<span class="preload-chip ${already ? 'loaded' : ''}"
        onclick="${already ? '' : `loadRacePreset('${r.name}')`}"
        title="${already ? 'Já carregada' : 'Clique para carregar'}">${r.name}${already ? ' ✓' : ''}</span>`;
    });
  });
  list.innerHTML = html;
  openModal('preloadModal');
}

function loadRacePreset(name) {
  const raceData = RACES_DB.find(r => r.name === name);
  if (!raceData) return;
  const already = appData.sheets.some(s => s.tipo === 'preset' && s.name === name);
  if (already) return;
  const preset = createDefaultSheet({
    name: raceData.name,
    classificacao: raceData.classificacao,
    tipo: 'preset',
    conceitoNarrativo: raceData.conceito,
    atributos: { ...raceData.atributos },
    modos: { ...raceData.modos }
  });
  appData.sheets.push(preset);
  saveData();
  openPreloadModal();
  toast(`${name} carregada como preset!`, 'success');
}

function loadAllRaces() {
  let count = 0;
  RACES_DB.forEach(r => {
    const already = appData.sheets.some(s => s.tipo === 'preset' && s.name === r.name);
    if (!already) {
      const preset = createDefaultSheet({
        name: r.name,
        classificacao: r.classificacao,
        tipo: 'preset',
        conceitoNarrativo: r.conceito,
        atributos: { ...r.atributos },
        modos: { ...r.modos }
      });
      appData.sheets.push(preset);
      count++;
    }
  });
  saveData();
  closeModal('preloadModal');
  renderPresets();
  renderLibrary();
  toast(`${count} raças carregadas!`, 'success');
}

/* ============================================================
   PERSONAGENS PRONTOS — 3 por raça
============================================================ */
function carregarPersonagensPreset() {
  let count = 0;
  PERSONAGENS_PRESET_DATA.forEach(p => {
    const already = appData.sheets.some(s => s.tipo === 'preset' && s.name === p.name);
    if (already) return;
    const raceData = RACES_DB.find(r => r.name === p.raca);
    const preset = createDefaultSheet({
      name: p.name,
      tipo: 'preset',
      classificacao: raceData ? raceData.classificacao : 'Base',
      conceitoNarrativo: `${p.classe} — ${p.conceito}`,
      nivel: p.nivel || 1,
      atributos: { ...(raceData ? raceData.atributos : {}), ...p.atributos },
      modos: { ...p.modos },
      // Bug fix: campo correto é raceSelecionada, não raca
      raceSelecionada: p.raca,
      raceBonus: raceData ? { ...raceData.atributos } : {},
    });

    // Bug fix: pericias usam capitalização original (Golpe, não golpe)
    if (p.pericias) {
      const periciaKeys = Object.keys(preset.pericias);
      Object.entries(p.pericias).forEach(([pName, pts]) => {
        // Tenta match exato primeiro, depois case-insensitive
        const key = periciaKeys.find(k => k === pName)
                 || periciaKeys.find(k => k.toLowerCase() === pName.toLowerCase())
                 || pName;
        preset.pericias[key] = (preset.pericias[key] || 0) + pts;
      });
    }

    // Habilidades aprendidas
    if (p.habilidadesAprendidas && p.habilidadesAprendidas.length > 0) {
      preset.habilidadesAprendidas = [...p.habilidadesAprendidas];
    }

    // Equipamento
    if (p.equipamento) {
      preset.equipamento = preset.equipamento || {};
      if (p.equipamento.maoDireita)  preset.equipamento.maoDireita  = p.equipamento.maoDireita;
      if (p.equipamento.maoEsquerda) preset.equipamento.maoEsquerda = p.equipamento.maoEsquerda;
      if (p.equipamento.armadura)    preset.equipamento.armadura    = p.equipamento.armadura;
    }

    // Bug fix: ITEMS_DB não existe — monta inventário só com id, nome e quantidade
    if (p.inventario && p.inventario.length > 0) {
      preset.inventario = p.inventario.map(item => ({
        id:         item.id || generateId(),
        nome:       item.nome || item.id || 'Item',
        quantidade: item.qty || item.quantidade || 1,
        peso:       item.peso || 0.2,
      }));
    }

    // Bug fix: moedas é número, carteira é o objeto separado
    if (p.moedas) {
      preset.moedas   = p.moedas;
      preset.carteira = { cobre: 0, prata: p.moedas, ouro: 0, platina: 0 };
    }

    // Background
    if (p.bgOrigem)    preset.bgOrigem    = p.bgOrigem;
    if (p.bgObjetivo)  preset.bgObjetivo  = p.bgObjetivo;
    if (p.bgValores)   preset.bgValores   = p.bgValores;
    if (p.bgConceito)  preset.conceitoNarrativo = `${p.classe} — ${p.conceito}`;

    preset.personagemPronto = true;
    appData.sheets.push(preset);
    count++;
  });
  saveData();
  renderPresets();
  renderLibrary();
  if (count > 0) toast(`${count} personagens prontos carregados! 👤`, 'success');
  else toast('Personagens já estavam carregados!', 'info');
}
function buildFaeDualidadeBlock(sheet) {
  const attrs = sheet.atributos || {};
  const raceBonus = sheet.raceBonus || {};
  const total = (a) => (attrs[a] || 0) + (raceBonus[a] || 0);
  // Modificações da Forma Feérica
  const FAE_DELTA = { FOR:-1, DEF:-1, AGI:1, PER:1 };
  const modPills = Object.entries(FAE_DELTA).map(([a, d]) => {
    const t = total(a) + d;
    const cls = d > 0 ? 'pos' : 'neg';
    return `<span class="fae-mod-pill ${cls}">${a} ${d > 0 ? '+' : ''}${d} → ${t >= 0 ? '+' : ''}${t}</span>`;
  }).join('');

  return `
  <div class="fae-dualidade">
    <div class="fae-dualidade-title">✦ Dualidade Morfológica</div>
    <div class="fae-dualidade-sub">
      A Faerie alterna entre formas no início de seu turno, sem custo, desde que não esteja reagindo.
      Sem duração. Sem cooldown. Estado natural.
    </div>
    <div class="fae-formas">
      <div class="fae-forma-card">
        <div class="fae-forma-nome">🧍 Forma Humanoide</div>
        <div class="fae-forma-desc">
          Atributos normais da ficha base. Interação social plena.
          Pode usar equipamentos normalmente. Sem penalidades.
        </div>
      </div>
      <div class="fae-forma-card faerica">
        <div class="fae-forma-nome">🧚 Forma Feérica</div>
        <div class="fae-forma-desc">Sutil e etérea.</div>
        <div class="fae-mod-row">${modPills}</div>
        <div class="fae-ganhos">
          <div class="fae-ganho-item">Voo leve (curta distância).</div>
          <div class="fae-ganho-item">Atravessa espaços estreitos.</div>
          <div class="fae-ganho-item">+1 dado em testes de ocultação.</div>
          <div class="fae-ganho-item">Manipulação ambiental leve (luz, aroma, som, ilusões sensoriais).</div>
        </div>
        <div class="fae-restricoes">
          <div class="fae-restricao-item">Não usa armaduras pesadas.</div>
          <div class="fae-restricao-item">Equipamentos físicos grandes tornam-se inutilizáveis.</div>
          <div class="fae-restricao-item">Sem bônus de dano físico adicional.</div>
        </div>
      </div>
    </div>
  </div>`;
}

/* ============================================================
   HABILIDADES RACIAIS — renderização e preview situacional
============================================================ */

// Renderiza toda a seção de habilidades raciais no editor
function renderHabilidades(sheet) {
  var habSection = document.getElementById('habSection');
  var habContent = document.getElementById('habContent');
  if (!habSection || !habContent) return;

  var raceName = sheet.raceSelecionada;
  var race = raceName ? RACES_DB.find(function(r){ return r.name === raceName; }) : null;
  var subraca = (race && race.subraças && sheet.subraçaSelecionada)
    ? race.subraças.find(function(s){ return s.name === sheet.subraçaSelecionada; })
    : null;

  // Se não tem habilidades definidas, esconde seção
  var habs = race ? (race.habilidades || []) : [];
  var passivas = race ? (race.passivas || []) : [];
  var progressao = race ? (race.progressao || {}) : {};
  var variacoes = race ? (race.variacoes || []) : [];
  var hasLaika = (subraca && subraca.alterForms);

  // Esconde seção se não há raça ou se a raça não tem conteúdo algum
  const temConteudo = habs.length > 0 || passivas.length > 0 ||
    (progressao.nucleo && progressao.nucleo.length > 0) ||
    (progressao.caminhos && progressao.caminhos.length > 0) ||
    variacoes.length > 0 || hasLaika ||
    raceName === 'Faerie'; // sempre mostrar para a Faerie (Dualidade Morfológica)

  if (!race || !temConteudo) {
    habSection.style.display = 'none';
    habContent.innerHTML = '';
    return;
  }
  habSection.style.display = '';

  var html = '';

  // ── DUALIDADE MORFOLÓGICA — exclusivo Faerie ────────────
  if (raceName === 'Faerie') {
    html += buildFaeDualidadeBlock(sheet);
  }

  // ── HABILIDADES RACIAIS BASE ─────────────────────────────
  if (habs.length) {
    html += '<div class="hab-group-title">✦ Habilidades Raciais</div>';
    html += '<div class="hab-grid">';
    habs.forEach(function(h) {
      html += buildHabCard(h, sheet, false);
    });
    html += '</div>';
  }

  // ── PASSIVAS ────────────────────────────────────────────
  if (passivas.length) {
    html += '<div class="hab-group-title">◈ Passivas Intrínsecas</div>';
    html += '<div class="hab-grid">';
    passivas.forEach(function(h) {
      html += buildHabCard(h, sheet, true);
    });
    html += '</div>';
  }

  // ── LAIKA — ALTER FORMS + INTENSIDADES ──────────────────
  if (subraca && subraca.intensidades) {
    html += '<div class="hab-group-title">🐾 Transformação Parcial — ' + subraca.name + '</div>';
    html += buildLaikaWidget(sheet, subraca);
  }

  // ── PROGRESSÃO RACIAL ───────────────────────────────────
  var nucleo = progressao.nucleo || [];
  var caminhos = progressao.caminhos || [];
  if (nucleo.length || caminhos.length) {
    html += '<div class="hab-group-title">◆ Progressão Racial</div>';
    if (nucleo.length) {
      html += '<div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin:6px 0 6px 2px;">Núcleo</div>';
      html += '<div class="hab-grid">';
      nucleo.forEach(function(h) { html += buildHabCard(h, sheet, false); });
      html += '</div>';
    }
    if (caminhos.length) {
      html += '<div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin:12px 0 6px 2px;">Caminhos (escolha 1 no nível 5)</div>';
      caminhos.forEach(function(c) { html += buildCaminhoCard(c, sheet); });
    }
  }

  // ── VARIAÇÕES DE LOCUS ──────────────────────────────────
  if (variacoes.length) {
    html += '<div class="hab-group-title">🌐 Variação de Locus / Cultura</div>';
    html += '<p style="font-size:0.78rem;color:var(--text-muted);margin-bottom:8px;">Escolhida na criação do personagem.</p>';
    html += buildVariacaoChips(variacoes, sheet);
  }

  habContent.innerHTML = html;
}

// ── Constrói um card de habilidade individual ─────────────
function buildHabCard(h, sheet, isPassiva, extraClass) {
  var isNeg  = h.negativa === true;
  var hasEf  = !!(h.efeito);
  var isAtivo = !isNeg && (sheet.habilidadesAtivas || []).indexOf(h.id) !== -1;
  var isAprendidaPreset = !isNeg && isPresetLearnedSkill(sheet, h.id);
  var isAprendida = !isNeg && (isAprendidaPreset || getLearnedSkillIds(sheet).indexOf(h.id) !== -1);
  var tipoLabel = h.tipo === 'ativa' ? 'ativa' : 'passiva';
  var tipoCls   = h.tipo === 'ativa' ? 'hab-tipo-ativa' : 'hab-tipo-passiva';
  
  var atendeRequisito = verificaRequisito(sheet, h.req);
  var habBloqueada = h.req && !atendeRequisito;

  var cardCls = 'hab-card' +
    (hasEf  ? ' has-efeito' : '') +
    (isNeg  ? ' negativa'   : '') +
    (isAtivo ? ' ativa-on'   : '') +
    (isAprendida ? ' hab-aprendida' : '') +
    (habBloqueada ? ' hab-bloqueada' : '') +
    (extraClass ? ' ' + extraClass : '');

  // Toggle de preview (apenas não-negativas)
  var toggleHtml = isNeg
    ? '<div class="hab-toggle negativa" title="Passiva negativa — sempre ativa"></div>'
    : '<div class="hab-toggle ' + (isAtivo ? 'on' : '') + '" onclick="toggleHabilidade(\'' + h.id + '\')" title="Ativar para ver preview"></div>';

  var reqHtml = '';
  if (h.req) {
    var reqClass = habBloqueada ? 'hab-req bloqueado' : 'hab-req';
    var reqIcon = habBloqueada ? '🔒 ' : '';
    reqHtml = '<div class="' + reqClass + '">' + reqIcon + 'Req: ' + h.req + '</div>';
  }

  // Botão de aprender: NÃO aparece em passivas intrínsecas (sem req) — sempre ativas
  var isIntrinseca = isPassiva && !h.req;
  var aprenderHtml = '';
  if (!isNeg && !isIntrinseca) {
    var btnLocked = habBloqueada || isAprendidaPreset;
    var btnLabel = isAprendidaPreset ? '✓ Do preset' : isAprendida ? '✓ Aprendida' : '+ Aprender';
    var btnCls   = 'hab-aprender-btn' + (isAprendida ? ' aprendida' : '') + (btnLocked ? ' disabled' : '');
    var btnTitle = habBloqueada ? 'Requisito não atendido' : isAprendidaPreset ? 'Habilidade fixa do preset' : '';
    aprenderHtml = '<button class="' + btnCls + '" onclick="aprenderHabilidade(\'' + h.id + '\')"' +
      (btnLocked ? ' disabled' : '') +
      (btnTitle ? ' title="' + btnTitle + '"' : '') + '>' + btnLabel + '</button>';
  } else if (isIntrinseca) {
    aprenderHtml = '<div class="hab-intrinseca-badge">✦ Passiva intrínseca — sempre ativa</div>';
  }

  var previewHtml = '';
  if (hasEf && !isNeg) {
    previewHtml = buildEfeitoPreview(h, sheet);
  }

  return '<div class="' + cardCls + '" id="hab-' + h.id + '">' +
    '<div class="hab-card-top">' +
      toggleHtml +
      '<div class="hab-info">' +
        '<div class="hab-nome">' + h.nome +
          '<span class="hab-tipo-badge ' + tipoCls + '">' + tipoLabel + '</span>' +
        '</div>' +
        reqHtml +
        '<div class="hab-desc">' + h.desc + '</div>' +
      '</div>' +
    '</div>' +
    aprenderHtml +
    previewHtml +
  '</div>';
}

// ── Constrói o preview situacional de um efeito ───────────
function buildEfeitoPreview(h, sheet) {
  if (!h.efeito) return '';
  var ef = h.efeito;
  var rows = '';

  // Efeito em atributo(s)
  if (ef.tipo === 'atributo' && ef.attr) {
    // Usa valor efetivo (base + bônus racial + modificadores) para preview correto
    var base = getAtributoEfetivo(sheet, ef.attr);
    if (base === -Infinity) base = -3;
    var result = base + ef.delta;
    rows += buildPreviewRow(ef.attr, base, result);
  }
  if (ef.tipo === 'atributo' && ef.mods) {
    Object.entries(ef.mods).forEach(function(entry) {
      var attr = entry[0]; var delta = entry[1];
      var base = getAtributoEfetivo(sheet, attr);
      if (base === -Infinity) base = -3;
      rows += buildPreviewRow(attr, base, base + delta);
    });
  }
  // Efeito em modo
  if (ef.tipo === 'modo') {
    var modosArr = ef.modos || (ef.attr ? [ef.attr] : []);
    if (!modosArr.length && ef.attr) modosArr = [ef.attr];
    modosArr.forEach(function(m) {
      var base = (sheet.modos || {})[m] || 0;
      rows += buildPreviewRow(m, base, base + (ef.delta || 0));
    });
  }
  // Efeito de dado (bonus/penalty)
  if (ef.tipo === 'dado') {
    var delta = ef.delta || 0;
    var sign  = delta > 0 ? '+' : '';
    rows += '<div class="hab-preview-row">' +
      '<span class="hab-preview-label">Dados</span>' +
      '<span class="hab-preview-arrow">→</span>' +
      '<span class="hab-preview-result" style="color:' + (delta > 0 ? 'var(--attr-pos)' : 'var(--attr-neg)') + ';">' +
        sign + delta + ' dado' + (Math.abs(delta) > 1 ? 's' : '') +
      '</span>' +
    '</div>';
  }
  // Efeito de dano
  if (ef.tipo === 'dano') {
    rows += '<div class="hab-preview-row">' +
      '<span class="hab-preview-label">Dano</span>' +
      '<span class="hab-preview-arrow">→</span>' +
      '<span class="hab-preview-result">+' + ef.delta + '</span>' +
    '</div>';
  }
  // Redução de dano
  if (ef.tipo === 'reducaoDano') {
    var formula = ef.formula || '';
    var displayFormula = formula;
    if (formula) {
      // Avalia a fórmula de forma segura (sem eval), substituindo variáveis conhecidas
      var forVal = (sheet.atributos || {})['FOR'] || 0;
      var conVal = (sheet.atributos || {})['CON'] || 0;
      try {
        // Substituição segura: apenas variáveis de atributo numéricas
        var numericFormula = formula
          .replace(/\bFOR\b/g, forVal)
          .replace(/\bCON\b/g, conVal);
        // Valida que só contém números e operadores básicos antes de calcular
        if (/^[\d\s\+\-\*\/\(\)\.]+$/.test(numericFormula)) {
          var val = Function('"use strict"; return (' + numericFormula + ')')();
          displayFormula = '(' + formula + ' = ' + Math.floor(val) + ')';
        }
      } catch(e) { /* mantém a fórmula textual */ }
    }
    rows += '<div class="hab-preview-row">' +
      '<span class="hab-preview-label">Redução de dano</span>' +
      '<span class="hab-preview-arrow">→</span>' +
      '<span class="hab-preview-result">' + (ef.valor || displayFormula || '?') + '</span>' +
    '</div>';
  }
  // Cura
  if (ef.tipo === 'cura') {
    var formula = ef.formula || '';
    var forVal = (sheet.atributos || {})['FOR'] || 0;
    var conVal = (sheet.atributos || {})['CON'] || 0;
    var resolved = formula;
    try {
      var numericFormula = formula
        .replace(/\bFOR\b/g, forVal)
        .replace(/\bCON\b/g, conVal);
      if (/^[\d\s\+\-\*\/\(\)\.]+$/.test(numericFormula)) {
        var val = Function('"use strict"; return (' + numericFormula + ')')();
        resolved = formula + ' = ' + Math.floor(val);
      }
    } catch(e) { /* mantém a fórmula textual */ }
    rows += '<div class="hab-preview-row">' +
      '<span class="hab-preview-label">Cura</span>' +
      '<span class="hab-preview-arrow">→</span>' +
      '<span class="hab-preview-result">+' + resolved + ' Vida</span>' +
    '</div>';
  }
  // Sucesso automático
  if (ef.tipo === 'sucesso') {
    rows += '<div class="hab-preview-row">' +
      '<span class="hab-preview-label">Bônus</span>' +
      '<span class="hab-preview-arrow">→</span>' +
      '<span class="hab-preview-result">+' + ef.delta + ' sucesso auto</span>' +
    '</div>';
  }
  // Efeito (+1 magnitude magia)
  if (ef.tipo === 'efeito') {
    rows += '<div class="hab-preview-row">' +
      '<span class="hab-preview-label">Efeito mágico</span>' +
      '<span class="hab-preview-arrow">→</span>' +
      '<span class="hab-preview-result">+' + ef.delta + ' (dano/duração/alcance)</span>' +
    '</div>';
  }

  if (!rows) return '';

  var condHtml = ef.condicional
    ? '<div class="hab-preview-cond">⚡ ' + ef.condicional + '</div>'
    : '';

  return '<div class="hab-preview">' +
    '<div class="hab-preview-title">✦ Preview Situacional (base + bônus)</div>' +
    '<div class="hab-preview-rows">' + rows + condHtml + '</div>' +
    '<div style="font-size:0.68rem;color:var(--text-muted);margin-top:6px;font-style:italic;">Valores base não são alterados — este é o total situacional.</div>' +
  '</div>';
}

// ── Linha individual do preview ───────────────────────────
function buildPreviewRow(label, base, result) {
  var delta = result - base;
  var sign  = delta > 0 ? '+' : '';
  var resColor = delta > 0 ? 'var(--attr-pos)' : delta < 0 ? 'var(--attr-neg)' : 'var(--text-secondary)';
  return '<div class="hab-preview-row">' +
    '<span class="hab-preview-label">' + label + '</span>' +
    '<span class="hab-preview-base">' + (base >= 0 ? '+' : '') + base + '</span>' +
    '<span class="hab-preview-arrow">→</span>' +
    '<span class="hab-preview-result" style="color:' + resColor + ';">' +
      (result >= 0 ? '+' : '') + result + ' (' + sign + delta + ')' +
    '</span>' +
  '</div>';
}

// ── Widget especial Laika ─────────────────────────────────
function buildLaikaWidget(sheet, subraca) {
  var current = sheet.laikaIntensidade || 0;
  var html = '<div class="laika-intensidade-wrap">';
  html += '<div class="laika-intensidade-label">Nível de Intensidade — sem duração fixa</div>';
  html += '<div class="intensidade-btns">';
  html += '<span class="int-btn ' + (current === 0 ? 'active' : '') + '" onclick="setLaikaIntensidade(0)">0 — Normal</span>';
  subraca.intensidades.forEach(function(intv) {
    html += '<span class="int-btn ' + (current === intv.nivel ? 'active' : '') + '" onclick="setLaikaIntensidade(' + intv.nivel + ')">' + intv.nivel + ' — ' + intv.nome + '</span>';
  });
  html += '<span class="int-btn ' + (current === 4 ? 'active' : '') + '" onclick="setLaikaIntensidade(4)">🐾 Forma Bestial</span>';
  html += '</div>';

  // Preview dos modificadores da intensidade ativa
  var preview = '';
  if (current === 0) {
    preview = '<span style="color:var(--text-muted);font-style:italic;">Forma humana — sem modificadores.</span>';
  } else if (current === 4) {
    // Forma bestial total
    var mods = subraca.formaBestial ? subraca.formaBestial.mods : { FOR:3, AGI:3, PER:3, INT:-3 };
    var bonus = subraca.formaBestial ? subraca.formaBestial.bonus : '';
    preview = buildIntensidadePreview(mods, sheet.atributos || {});
    preview += '<br><span style="font-size:0.78rem;color:var(--lavanda-dark);font-weight:700;">Bônus de linhagem: ' + bonus + '</span>';
    preview += '<br><span style="font-size:0.72rem;color:var(--attr-warn);">⚠ Não pode usar equipamentos. Comunicação limitada. Ao retornar: -1 dado mental por 1 turno.</span>';
  } else {
    var intv = subraca.intensidades.find(function(i){ return i.nivel === current; });
    if (intv) {
      preview = buildIntensidadePreview(intv.mods, sheet.atributos || {});
      preview += '<br><span style="font-size:0.75rem;color:var(--text-muted);font-style:italic;">' + intv.desc + '</span>';
    }
  }

  html += '<div class="int-preview">' + preview + '</div>';

  // Alter forms da subraça
  if (subraca.alterForms && subraca.alterForms.length) {
    html += '<div style="margin-top:12px;">';
    html += '<div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:6px;">Alter Forms</div>';
    html += '<div class="hab-grid">';
    subraca.alterForms.forEach(function(af) {
      html += buildHabCard(af, sheet, false);
    });
    html += '</div></div>';
  }

  // Instabilidade instintiva
  // Conta quantas Alter Forms desta subraça estão ativas em habilidadesAtivas
  var alterFormIds = (subraca.alterForms || []).map(function(af){ return af.id; });
  var habAtivas = sheet.habilidadesAtivas || [];
  var alterAtivos = alterFormIds.filter(function(id){ return habAtivas.indexOf(id) !== -1; }).length;
  var instinto = alterAtivos + (current >= 2 ? 1 : 0);
  var vonVal = (sheet.atributos || {}).VON || 0;
  var instColor = instinto > vonVal ? 'var(--attr-neg)' : instinto === vonVal ? 'var(--attr-warn)' : 'var(--attr-pos)';
  html += '<div id="laika-instinto-display" style="margin-top:10px;padding:8px 12px;background:var(--bg-card);border-radius:var(--radius-sm);border:1px solid var(--border);font-size:0.8rem;">';
  html += '<span style="color:var(--text-muted);">Instabilidade Instintiva:</span> ';
  html += '<strong style="color:' + instColor + ';">' + instinto + ' / VON ' + vonVal + '</strong>';
  if (instinto > vonVal) html += ' <span style="color:var(--attr-neg);">⚠ Risco de impulso predatório!</span>';
  html += '</div>';

  html += '</div>';
  return html;
}

function buildIntensidadePreview(mods, atributos) {
  var parts = Object.entries(mods).map(function(entry) {
    var attr = entry[0]; var delta = entry[1];
    var base = atributos[attr] || 0;
    var result = base + delta;
    var sign = delta > 0 ? '+' : '';
    var cls  = delta > 0 ? 'int-mod-positive' : 'int-mod-negative';
    return '<span class="' + cls + '">' + attr + ': ' + (base >= 0 ? '+' : '') + base + ' → ' + (result >= 0 ? '+' : '') + result + '</span>';
  });
  return parts.join('  &nbsp;');
}

// ── Caminho de progressão (colapsável) ───────────────────
function buildCaminhoCard(c, sheet) {
  const id = 'caminho-' + c.nome.replace(/\s/g, '-');
  const nivelRequerido = c.nivel || 5;
  const podeEscolher = sheet.nivel >= nivelRequerido;
  const caminhoEscolhido = sheet.caminhoEscolhido;
  const esteSelecionado = caminhoEscolhido === c.nome;
  const outroSelecionado = caminhoEscolhido && !esteSelecionado;
  
  let cardClass = 'caminho-card';
  if (esteSelecionado) cardClass += ' caminho-selecionado';
  if (!podeEscolher) cardClass += ' caminho-bloqueado';
  if (outroSelecionado) cardClass += ' caminho-desabilitado';
  
  let html = '<div class="' + cardClass + '" id="' + id + '">';
  
  // Header
  html += '<div class="caminho-header" onclick="toggleCaminho(\'' + id + '\')">';
  html += '<div>';
  html += '<div class="caminho-title">';
  
  // Badge de status
  if (esteSelecionado) {
    html += '<span class="caminho-badge selecionado">✓ Escolhido</span> ';
  } else if (!podeEscolher) {
    html += '<span class="caminho-badge bloqueado">🔒 Nível ' + nivelRequerido + '</span> ';
  } else if (outroSelecionado) {
    html += '<span class="caminho-badge desabilitado">✕ Não disponível</span> ';
  }
  
  html += 'Caminho — ' + c.nome;
  html += '</div>';
  html += '<div class="caminho-foco">' + (c.foco || '') + '</div>';
  html += '</div>';
  html += '<span class="caminho-arrow">▶</span>';
  html += '</div>';
  
  // Body com habilidades
  html += '<div class="caminho-body">';
  
  // Botão de escolher caminho (apenas se não bloqueado e nenhum escolhido)
  if (podeEscolher && !caminhoEscolhido) {
    html += '<div class="caminho-escolher">';
    html += '<button class="btn btn-primary btn-sm" onclick="escolherCaminho(\'' + c.nome + '\')">Escolher Este Caminho</button>';
    html += '</div>';
  } else if (esteSelecionado) {
    html += '<div class="caminho-escolher">';
    html += '<button class="btn btn-ghost btn-sm" onclick="removerCaminho()">Trocar Caminho</button>';
    html += '</div>';
  }
  
  html += '<div class="hab-grid">';
  (c.habilidades || []).forEach(function(h) {
    // Verifica requisitos
    const podeAprenderHab = verificaRequisito(sheet, h.req);
    const habClass = podeAprenderHab ? '' : 'hab-bloqueada';
    html += buildHabCard(h, sheet, false, habClass);
  });
  html += '</div>';
  html += '</div>';
  html += '</div>';
  
  return html;
}

// ── Variações de Locus ────────────────────────────────────
function buildVariacaoChips(variacoes, sheet) {
  var sel = sheet.variacaoLocus || null;
  var html = '<div class="variacao-chips">';
  variacoes.forEach(function(v) {
    html += '<div class="variacao-chip ' + (sel === v.id ? 'selected' : '') + '" onclick="selectVariacao(\'' + v.id + '\')">' +
      v.nome +
    '</div>';
  });
  html += '</div>';
  // Desc da variação selecionada
  var selV = variacoes.find(function(v){ return v.id === sel; });
  if (selV) {
    html += '<div class="variacao-desc show">' + selV.desc;
    if (selV.efeito) {
      html += '<div style="margin-top:6px;">' + buildSmallEfeitoPreview(selV.efeito, sheet) + '</div>';
    }
    html += '</div>';
  } else {
    html += '<div class="variacao-desc"></div>';
  }
  return html;
}

function buildSmallEfeitoPreview(ef, sheet) {
  if (!ef) return '';
  if (ef.tipo === 'atributo' && ef.attr) {
    // Usa valor efetivo para refletir bônus racial e modificadores
    var base = getAtributoEfetivo(sheet, ef.attr);
    if (base === -Infinity) base = -3;
    return '<span class="variacao-preview-row">✦ ' + ef.attr + ': ' + (base >= 0 ? '+' : '') + base + ' → <strong>+' + (base + ef.delta) + '</strong>' + (ef.condicional ? ' <em>(' + ef.condicional + ')</em>' : '') + '</span>';
  }
  if (ef.tipo === 'dado') {
    return '<span class="variacao-preview-row">✦ Dados: ' + (ef.delta > 0 ? '+' : '') + ef.delta + (ef.condicional ? ' — ' + ef.condicional : '') + '</span>';
  }
  return '';
}

// ── Interações ────────────────────────────────────────────
// Reavalia os requisitos de cada habilidade visível e atualiza lock/unlock sem re-render completo
function atualizarBloqueioHabilidades(sheet) {
  if (!sheet || !sheet.raceSelecionada) return;
  var race = RACES_DB.find(function(r){ return r.name === sheet.raceSelecionada; });
  if (!race) return;

  // Coleta todos os IDs de habilidades com requisito
  var todasHabs = [];
  (race.habilidades || []).forEach(function(h){ todasHabs.push(h); });
  (race.passivas || []).forEach(function(h){ todasHabs.push(h); });
  var prog = race.progressao || {};
  (prog.nucleo || []).forEach(function(h){ todasHabs.push(h); });
  (prog.caminhos || []).forEach(function(c){
    (c.habilidades || []).forEach(function(h){ todasHabs.push(h); });
  });

  todasHabs.forEach(function(h) {
    if (!h.req) return;
    var card = document.getElementById('hab-' + h.id);
    if (!card) return;

    var atende = verificaRequisito(sheet, h.req);
    var estavaBloqueada = card.classList.contains('hab-bloqueada');

    if (atende && estavaBloqueada) {
      // Desbloquear
      card.classList.remove('hab-bloqueada');
      var reqEl = card.querySelector('.hab-req');
      if (reqEl) {
        reqEl.classList.remove('bloqueado');
        reqEl.textContent = 'Req: ' + h.req;
      }
      // Reabilita o toggle de preview
      var tog = card.querySelector('.hab-toggle:not(.negativa)');
      if (tog) tog.removeAttribute('style');
      // Reabilita o botão de aprender
      var btnApr = card.querySelector('.hab-aprender-btn');
      if (btnApr) { btnApr.disabled = false; btnApr.classList.remove('disabled'); }
    } else if (!atende && !estavaBloqueada) {
      // Bloquear
      card.classList.add('hab-bloqueada');
      var reqEl = card.querySelector('.hab-req');
      if (reqEl) {
        reqEl.classList.add('bloqueado');
        reqEl.textContent = '🔒 Req: ' + h.req;
      }
      // Desativa a habilidade de preview se estava ativa
      var idx = (sheet.habilidadesAtivas || []).indexOf(h.id);
      if (idx !== -1) {
        sheet.habilidadesAtivas.splice(idx, 1);
        card.classList.remove('ativa-on');
        var tog = card.querySelector('.hab-toggle');
        if (tog) tog.classList.remove('on');
      }
      // Desaprende a habilidade de progressão se estava aprendida
      var idxP = (sheet.progressaoAtiva || []).indexOf(h.id);
      if (idxP !== -1) {
        sheet.progressaoAtiva.splice(idxP, 1);
        card.classList.remove('hab-aprendida');
        var btnApr = card.querySelector('.hab-aprender-btn');
        if (btnApr) { btnApr.textContent = '+ Aprender'; btnApr.classList.remove('aprendida'); }
        renderNivelInfo(sheet);
      }
      // Bloqueia o botão de aprender
      var btnApr = card.querySelector('.hab-aprender-btn');
      if (btnApr) { btnApr.disabled = true; btnApr.classList.add('disabled'); }
    }
  });
}

function toggleHabilidade(id) {
  var sheet = getSheet(currentSheetId);
  if (!sheet) return;

  // Impede toggle se o card está bloqueado por requisito
  var card = document.getElementById('hab-' + id);
  if (card && card.classList.contains('hab-bloqueada')) {
    toast('Requisito não atendido para esta habilidade.', 'error');
    return;
  }

  sheet.habilidadesAtivas = sheet.habilidadesAtivas || [];
  var idx = sheet.habilidadesAtivas.indexOf(id);
  if (idx === -1) {
    sheet.habilidadesAtivas.push(id);
  } else {
    sheet.habilidadesAtivas.splice(idx, 1);
  }
  debounceSave();
  // Atualiza apenas o estado do card sem re-renderizar tudo
  if (card) {
    var isNow = sheet.habilidadesAtivas.indexOf(id) !== -1;
    card.classList.toggle('ativa-on', isNow);
    var tog = card.querySelector('.hab-toggle');
    if (tog) tog.classList.toggle('on', isNow);
  }
  // Se for um Alter Form da Laika, atualiza o contador de instinto
  _updateLaikaInstintoDisplay(sheet);
}

function _updateLaikaInstintoDisplay(sheet) {
  var el = document.getElementById('laika-instinto-display');
  if (!el) return;
  var race = RACES_DB.find(function(r){ return r.name === sheet.raceSelecionada; });
  if (!race) return;
  var subraca = (race.subraças || []).find(function(s){ return s.name === sheet.subraçaSelecionada; });
  if (!subraca || !subraca.alterForms) return;
  var current = sheet.laikaIntensidade || 0;
  var alterFormIds = subraca.alterForms.map(function(af){ return af.id; });
  var habAtivas = sheet.habilidadesAtivas || [];
  var alterAtivos = alterFormIds.filter(function(id){ return habAtivas.indexOf(id) !== -1; }).length;
  var instinto = alterAtivos + (current >= 2 ? 1 : 0);
  var vonVal = (sheet.atributos || {}).VON || 0;
  var instColor = instinto > vonVal ? 'var(--attr-neg)' : instinto === vonVal ? 'var(--attr-warn)' : 'var(--attr-pos)';
  var warn = instinto > vonVal ? ' <span style="color:var(--attr-neg);">⚠ Risco de impulso predatório!</span>' : '';
  el.innerHTML = '<span style="color:var(--text-muted);">Instabilidade Instintiva:</span> <strong style="color:' + instColor + ';">' + instinto + ' / VON ' + vonVal + '</strong>' + warn;
}

/* ============================================================
   FUNÇÕES DE RESET DE DISTRIBUIÇÃO DE PONTOS
============================================================ */
function resetAtributos() {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  // Zera apenas os atributos base que o jogador distribui (mantém bônus racial e subatributos derivados)
  const attrs = sheet.atributos;
  ATTRS_BASE.forEach(k => { if (k in attrs) attrs[k] = 0; });
  renderAtributosGrid(sheet);
  renderNivelInfo(sheet);
  updateStats(sheet);
  updatePicosVales(sheet);
  atualizarSubatributos(sheet);
  debounceSave();
  toast('Atributos resetados. Pontos devolvidos ao pool.', 'info');
}

function resetModos() {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  // Retorna modos ao valor base racial
  const base = sheet.raceModos || { Bruto:2, Ágil:2, Preciso:2, Intuitivo:2 };
  sheet.modos = { ...base };
  // Reaplicar efeitos de modo do modificador ativo
  _aplicarEfeitoModoModificador(sheet, sheet.modificador);
  renderModos(sheet.modos);
  renderNivelInfo(sheet);
  atualizarSubatributos(sheet);
  debounceSave();
  toast('Modos resetados ao valor base racial.', 'info');
}

function resetHabilidades() {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  sheet.progressaoAtiva = [];
  sheet.caminhoEscolhido = null;
  // Atualiza visual de todos os cards aprendidos
  renderHabilidades(sheet);
  renderNivelInfo(sheet);
  debounceSave();
  toast('Habilidades desaprendidas. Pontos devolvidos.', 'info');
}

/* ============================================================
   HABILIDADES — APRENDER E TOGGLE
============================================================ */

// Aprende ou desaprende uma habilidade de progressão (consome slot de habilidade disponível)
function aprenderHabilidade(id) {
  var sheet = getSheet(currentSheetId);
  if (!sheet) return;
  if (isPresetLearnedSkill(sheet, id)) {
    toast('Habilidade fixa do preset.', 'info');
    return;
  }

  var card = document.getElementById('hab-' + id);
  if (card && card.classList.contains('hab-bloqueada')) {
    toast('Requisito não atendido para esta habilidade.', 'error');
    return;
  }

  sheet.progressaoAtiva = sheet.progressaoAtiva || [];
  var idx = sheet.progressaoAtiva.indexOf(id);

  if (idx === -1) {
    // Verificar se há slot disponível
    const usadas = calcHabilidadesAprendidas(sheet);
    const total  = calcHabilidadesDisponiveis(sheet.nivel);
    if (usadas >= total) {
      toast(`Habilidades esgotadas! (${usadas}/${total}). Aumente o nível para desbloquear mais.`, 'warn');
      return;
    }
    sheet.progressaoAtiva.push(id);
    toast('Habilidade aprendida!', 'success');
  } else {
    sheet.progressaoAtiva.splice(idx, 1);
    toast('Habilidade desaprendida.', 'info');
  }

  // Atualiza o visual do botão no card
  if (card) {
    var isAprendida = getLearnedSkillIds(sheet).indexOf(id) !== -1;
    card.classList.toggle('hab-aprendida', isAprendida);
    var btn = card.querySelector('.hab-aprender-btn');
    if (btn) {
      btn.textContent = isAprendida ? '✓ Aprendida' : '+ Aprender';
      btn.classList.toggle('aprendida', isAprendida);
    }
  }

  // Atualiza contador de habilidades
  renderNivelInfo(sheet);
  debounceSave();
}

function toggleCaminho(id) {
  var el = document.getElementById(id);
  if (el) el.classList.toggle('open');
}

function selectVariacao(id) {
  var sheet = getSheet(currentSheetId);
  if (!sheet) return;
  sheet.variacaoLocus = (sheet.variacaoLocus === id) ? null : id;
  debounceSave();
  renderHabilidades(sheet);
}

/* ============================================================
   CAMINHOS RACIAIS - Escolha e Remoção
============================================================ */

function escolherCaminho(nomeCaminho) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  
  // Verifica se já tem um caminho escolhido
  if (sheet.caminhoEscolhido) {
    toast('Você já escolheu um caminho. Remova o atual antes de escolher outro.', 'error');
    return;
  }
  
  // Verifica nível mínimo
  if (sheet.nivel < 5) {
    toast('Você precisa estar no nível 5 ou superior para escolher um caminho.', 'error');
    return;
  }
  
  sheet.caminhoEscolhido = nomeCaminho;
  debounceSave();
  renderHabilidades(sheet);
  toast(`Caminho escolhido: ${nomeCaminho}`, 'success');
}

function removerCaminho() {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  
  const caminhoAnterior = sheet.caminhoEscolhido;
  
  if (confirm(`Tem certeza que deseja trocar o caminho "${caminhoAnterior}"? Esta ação não pode ser desfeita.`)) {
    sheet.caminhoEscolhido = null;
    debounceSave();
    renderHabilidades(sheet);
    toast('Caminho removido. Você pode escolher outro agora.', 'info');
  }
}

function setLaikaIntensidade(nivel) {
  var sheet = getSheet(currentSheetId);
  if (!sheet) return;
  sheet.laikaIntensidade = (sheet.laikaIntensidade === nivel) ? 0 : nivel;
  debounceSave();
  renderHabilidades(sheet);
  _updateLaikaInstintoDisplay(sheet);
}

/* ============================================================
   IMPORTAR / EXPORTAR
============================================================ */
function exportBackup() {
  const data = JSON.stringify({ type: 'backup', version: 1, ...appData }, null, 2);
  downloadJSON(data, 'verloren-backup.json');
  toast('Backup exportado!', 'success');
}

function exportSheetJSON() {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  downloadJSON(JSON.stringify({ type: 'sheet', version: 1, sheet }, null, 2), `${sheet.name || 'ficha'}.json`);
  toast('Ficha exportada como JSON!', 'success');
}

function exportPresetJSON(id) {
  const preset = getSheet(id);
  if (!preset) return;
  downloadJSON(JSON.stringify({ type: 'sheet', version: 1, sheet: preset }, null, 2), `preset-${preset.name}.json`);
}

function openImportModal() {
  document.getElementById('importJsonText').value = '';
  openModal('importModal');
}
function openImportPresetModal() { openImportModal(); }

function doImport() {
  try {
    const json = JSON.parse(document.getElementById('importJsonText').value);
    
    // Função interna de migração — garante campos essenciais em fichas importadas de versões antigas
    const migrateSheet = (s) => {
      if (!s.raceBonus)              s.raceBonus = {};
      if (!s.raceModos)              s.raceModos = { Bruto:2, Ágil:2, Preciso:2, Intuitivo:2 };
      if (!s.habilidadesAprendidas)  s.habilidadesAprendidas = [];
      if (!s.habilidadesAtivas)      s.habilidadesAtivas = [];
      if (!s.progressaoAtiva)        s.progressaoAtiva = [];
      if (!s.inventario)             s.inventario = [];
      if (!s.recompensas)            s.recompensas = [];
      if (s.nivel === undefined)     s.nivel = 1;
      if (!s.equipamento)            s.equipamento = { maoEsquerda: null, maoDireita: null, armadura: null };
      if (s.moedas === undefined)    s.moedas = calcMoedasIniciais(s.nivel || 1);
      if (!s.pericias)               s.pericias = { Influência:0, Comunicação:0, Ofício:0, Medicina:0, Performance:0, Manejo:0, Coleta:0, Investigação:0, Destreza:0, Pontaria:0, Golpe:0, Cognição:0, Sabedoria:0, Travessia:0, Furtividade:0 };
      // Migrate resource tracking
      if (!s._recAtual) {
        try {
          const rec = calcRecursos(s);
          s._recAtual = { HP: rec.HP, MP: rec.MP, SP: rec.SP, SAN: rec.SAN };
        } catch(e) { s._recAtual = { HP: 10, MP: 5, SP: 8, SAN: 10 }; }
      }
      return s;
    };
    
    if (json.type === 'backup') {
      // Importar backup completo — evita duplicar IDs já existentes
      let importCount = 0;
      json.sheets.forEach(s => {
        if (!appData.sheets.find(x => x.id === s.id)) {
          appData.sheets.push(normalizeSheetRecord(migrateSheet(s)));
          importCount++;
        }
      });
      saveData();
      toast(`Backup importado! ${importCount} fichas novas (${json.sheets.length - importCount} ignoradas por duplicata).`, 'success');
    } else if (json.type === 'sheet' && json.sheet) {
      const s = normalizeSheetRecord(migrateSheet(json.sheet));
      s.id = generateId(); // sempre gera novo ID para evitar conflitos
      s.createdAt = s.updatedAt = Date.now();
      appData.sheets.push(s);
      saveData();
      toast('Ficha importada!', 'success');
    } else {
      toast('Formato de JSON inválido. Esperado: { type: "backup"|"sheet", ... }', 'error');
      return;
    }
    closeModal('importModal');
    renderLibrary();
    renderPresets();
  } catch(e) {
    toast('Erro ao importar JSON: ' + e.message, 'error');
  }
}

function downloadJSON(data, filename) {
  const blob = new Blob([data], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

