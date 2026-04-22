/* ============================================================
   NAVEGAÇÃO ENTRE PÁGINAS
============================================================ */
function showPage(name) {
  const page = document.getElementById('page-' + name);
  if (!page) return;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.bottom-nav-item').forEach(t => t.classList.remove('active'));
  page.classList.add('active');
  const tab = document.getElementById('tab-' + name);
  if (tab) tab.classList.add('active');
  const bnavItem = document.getElementById('bnav-' + name);
  if (bnavItem) bnavItem.classList.add('active');
  localStorage.setItem(LAST_PAGE_KEY, name);

  const fab = document.getElementById('fabSave');
  if (name === 'editor') {
    fab.classList.remove('hidden');
  } else {
    fab.classList.add('hidden');
    if (name === 'library') renderLibrary();
    if (name === 'presets') renderPresets();
    if (name === 'mundo') {
      showMundoSection('regioes');
    }
    if (name === 'sistema' && window.CompanionUI && typeof window.CompanionUI.renderVerlorenSystemWorkbench === 'function') {
      window.CompanionUI.renderVerlorenSystemWorkbench(getSheet(currentSheetId));
    }
  }
}

/* ============================================================
   BIBLIOTECA — RENDERIZAÇÃO
============================================================ */
function renderLibrary() {
  const search   = document.getElementById('searchInput').value;
  const filterC  = document.getElementById('filterClass').value;
  const filterT  = document.getElementById('filterType').value;

  const normalSheets = appData.sheets.filter(s => {
    if (s.tipo === 'preset') return false;
    if (filterT === 'preset') return false; // presets ficam na seção própria
    const matchType = !filterT || s.tipo === filterT;
    const matchClass = !filterC || s.classificacao === filterC;
    const matchSearch = !search || includesNormalized(s.name, search) || includesNormalized(s.conceitoNarrativo, search);
    return matchType && matchClass && matchSearch;
  });

  const presetSheets = appData.sheets.filter(s => {
    if (s.tipo !== 'preset') return false;
    if (filterT && filterT !== 'preset') return false;
    const matchClass  = !filterC || s.classificacao === filterC;
    const matchSearch = !search || includesNormalized(s.name, search);
    return matchClass && matchSearch;
  });

  const grid        = document.getElementById('cardsGrid');
  const presetGrid  = document.getElementById('presetCardsGrid');
  const separator   = document.getElementById('presetSeparator');

  grid.innerHTML = normalSheets.length
    ? normalSheets.map(renderCard).join('')
    : '<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">📖</div><h3>Nenhuma ficha encontrada</h3><p>Crie uma nova ficha ou ajuste os filtros.</p></div>';

  if (presetSheets.length > 0) {
    separator.style.display = 'flex';
    presetGrid.innerHTML = presetSheets.map(renderCard).join('');
  } else {
    separator.style.display = 'none';
    presetGrid.innerHTML = '';
  }
}

function renderCard(sheet) {
  const badges = [];
  const cls = sheet.classificacao || 'Base';
  // Classe CSS usa apenas valores conhecidos para evitar injeção
  const safeCls = ['Base','Celestial','Excêntrica'].includes(cls) ? cls.toLowerCase() : 'base';
  badges.push(`<span class="badge badge-${safeCls}">${escapeHtml(cls)}</span>`);
  if (sheet.tipo === 'preset')       badges.push('<span class="badge badge-preset">Preset</span>');
  else if (sheet.tipo === 'jogador') badges.push('<span class="badge badge-player">Jogador</span>');
  else if (sheet.tipo === 'npc')     badges.push('<span class="badge badge-npc">NPC</span>');

  const safeName = escapeHtml(sheet.name || '(Sem nome)');
  const safeConcept = sheet.conceitoNarrativo ? escapeHtml(sheet.conceitoNarrativo) : '';
  const idToken = encodeInlineArg(sheet.id);

  return `
    <div class="sheet-card" onclick="openSheetInline('${idToken}')">
      <div class="card-header">
        <div class="card-name">${safeName}</div>
        <div class="card-actions" onclick="arguments[0] && arguments[0].stopPropagation()">
          <button class="card-action-btn" onclick="duplicateSheetInline('${idToken}')" title="Duplicar">⧉</button>
          <button class="card-action-btn danger" onclick="openDeleteModalInline('${idToken}')" title="Excluir">✕</button>
        </div>
      </div>
      <div class="card-badges">${badges.join('')}</div>
      ${safeConcept ? `<p class="card-concept">${safeConcept}</p>` : ''}
      <div class="card-footer">
        <span class="card-date">Atualizado ${formatDate(sheet.updatedAt)}</span>
      </div>
    </div>`;
}

/* ============================================================
   PRESETS — RENDERIZAÇÃO
============================================================ */

/* ============================================================
   EDITOR — ABERTURA E RENDERIZAÇÃO
============================================================ */
function openSheet(id) {
  const sheet = getSheet(id);
  if (!sheet) return;
  setCurrentSheetId(id);
  localStorage.setItem(ACTIVE_SHEET_KEY, id);
  renderEditor(sheet);
  showPage('editor');
  // Load portrait for this sheet
  if (typeof loadPortrait === 'function') loadPortrait(id);
}

function newSheet() {
  const sheet = createDefaultSheet();
  appData.sheets.push(sheet);
  saveData();
  openSheet(sheet.id);
}

function newSheetFromPreset(presetId) {
  const preset = getSheet(presetId);
  if (!preset) return;
  const newSheet = normalizeSheetRecord(JSON.parse(JSON.stringify(preset)));
  newSheet.id = generateId();
  newSheet.tipo = 'jogador';
  newSheet.name = preset.name + ' (cópia)';
  newSheet.progressaoAtiva = uniqueIds([...(newSheet.progressaoAtiva || []), ...(newSheet.habilidadesAprendidas || [])]);
  newSheet.habilidadesAprendidas = [];
  newSheet.createdAt = Date.now();
  newSheet.updatedAt = Date.now();
  appData.sheets.push(newSheet);
  saveData();
  openSheet(newSheet.id);
  toast('Ficha criada a partir do preset!', 'success');
}

/* ============================================================
   SISTEMA DE NÍVEIS - Funções de Manipulação
============================================================ */

function ajustarNivel(delta) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  
  const novoNivel = Math.max(1, Math.min(20, sheet.nivel + delta));
  if (novoNivel === sheet.nivel) return;
  sheet.nivel = novoNivel;
  
  // Atualiza limites derivados do nível (não sobrescreve valores gastos)
  sheet.pontosAtributo         = calcPontosAtributo(novoNivel, sheet);
  sheet.pontosModo             = calcPontosModo(novoNivel, sheet);
  sheet.habilidadesDisponiveis = calcHabilidadesDisponiveis(novoNivel);

  renderNivelInfo(sheet);
  renderAtributosGrid(sheet);  // Recalcular limites de atributo
  
  // === FASE 3 & 4: Atualiza moedas, subatributos e gráfico ===
  const inicialEl = document.getElementById('moedasInicial');
  if (inicialEl) inicialEl.textContent = calcMoedasIniciais(novoNivel);
  // Não reseta as moedas ao mudar nível — mantém o que tem
  atualizarSubatributos(sheet);
  atualizarCarga(sheet);
  
  // Reavalia requisitos de nível das habilidades
  atualizarBloqueioHabilidades(sheet);
  
  saveData();
  toast(`Nível ajustado para ${novoNivel}`, 'info');
}

function setNivelManual(valor) {
  const nivel = parseInt(valor) || 1;
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  
  const novoNivel = Math.max(1, Math.min(20, nivel));
  if (novoNivel === sheet.nivel) return;
  sheet.nivel = novoNivel;
  sheet.pontosAtributo         = calcPontosAtributo(novoNivel, sheet);
  sheet.pontosModo             = calcPontosModo(novoNivel, sheet);
  sheet.habilidadesDisponiveis = calcHabilidadesDisponiveis(novoNivel);
  
  renderNivelInfo(sheet);
  renderAtributosGrid(sheet);
  
  // === FASE 3 & 4: Atualiza subatributos (não reseta moedas) ===
  const inicialEl2 = document.getElementById('moedasInicial');
  if (inicialEl2) inicialEl2.textContent = calcMoedasIniciais(novoNivel);
  atualizarSubatributos(sheet);
  atualizarCarga(sheet);
  atualizarBloqueioHabilidades(sheet);
  
  saveData();
}

function renderNivelInfo(sheet) {
  // Atualiza input de nível
  const nivelInput = document.getElementById('nivelInput');
  if (nivelInput) nivelInput.value = sheet.nivel;

  // ── Pontos de Atributo ──
  const pontosAttrTotal  = calcPontosAtributo(sheet.nivel, sheet);
  const pontosAttrUsados = calcPontosAtributoUsados(sheet);
  const attrOver = pontosAttrUsados > pontosAttrTotal;
  const elAttrUsados = document.getElementById('pontosAttrUsados');
  const elAttrTotal  = document.getElementById('pontosAttrTotal');
  if (elAttrUsados && elAttrTotal) {
    elAttrUsados.textContent = pontosAttrUsados;
    elAttrTotal.textContent  = pontosAttrTotal;
    const card = elAttrUsados.closest('.pontos-card');
    if (card) card.classList.toggle('pontos-excedido', attrOver);
    // Show racial bonus in tooltip
    var raceForPts = sheet.raceSelecionada ? RACES_DB.find(function(r){return r.name===sheet.raceSelecionada;}) : null;
    var extraPts = raceForPts ? (raceForPts.pontosExtrasAtributo || 0) : 0;
    if (card && extraPts > 0) {
      card.title = 'Base: ' + (pontosAttrTotal - extraPts) + ' + Racial: +' + extraPts;
    }
  }

  // ── Pontos de Modo ──
  const pontosModoTotal  = calcPontosModo(sheet.nivel, sheet);
  const pontosModoUsados = calcPontosModoUsados(sheet);
  const modoOver = pontosModoUsados > pontosModoTotal;
  const elModoUsados = document.getElementById('pontosModoUsados');
  const elModoTotal  = document.getElementById('pontosModoTotal');
  if (elModoUsados && elModoTotal) {
    elModoUsados.textContent = pontosModoUsados;
    elModoTotal.textContent  = pontosModoTotal;
    const card = elModoUsados.closest('.pontos-card');
    if (card) card.classList.toggle('pontos-excedido', modoOver);
  }

  // ── Habilidades ──
  const habTotal    = calcHabilidadesDisponiveis(sheet.nivel);
  const habUsadas   = calcHabilidadesAprendidas(sheet);
  const habOver = habUsadas > habTotal;
  const elHabUsadas    = document.getElementById('habAprendidas');
  const elHabDisponiveis = document.getElementById('habDisponiveis');
  if (elHabUsadas && elHabDisponiveis) {
    elHabUsadas.textContent     = habUsadas;
    elHabDisponiveis.textContent = habTotal;
    const card = elHabUsadas.closest('.pontos-card');
    if (card) card.classList.toggle('pontos-excedido', habOver);
  }

  // Sincroniza os campos derivados no objeto sheet (para saveData)
  sheet.pontosAtributo         = pontosAttrTotal;
  sheet.pontosAtributoUsados   = pontosAttrUsados;
  sheet.pontosModo             = pontosModoTotal;
  sheet.pontosModoUsados       = pontosModoUsados;
  sheet.habilidadesDisponiveis = habTotal;
}

/* ============================================================
   MODIFICADORES Aika/Ukya - Funções de Manipulação
============================================================ */

function setModificador(tipo) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;

  const anterior = sheet.modificador;
  sheet.modificador = tipo;

  // Remove efeitos do modificador anterior nos modos
  _removerEfeitoModoModificador(sheet, anterior);

  // Aplica efeitos do novo modificador nos modos
  _aplicarEfeitoModoModificador(sheet, tipo);

  // Atualiza visual dos botões
  _renderModificadorUI(tipo);
  renderAtributosGrid(sheet);
  renderModos(sheet.modos);
  renderNivelInfo(sheet);
  atualizarSubatributos(sheet);
  atualizarBloqueioHabilidades(sheet);
  saveData();

  const nomes = { null: 'Normal', Aika: 'Aika 💠', Ukya: 'Ukya 🔶' };
  toast(`Modificador alterado: ${nomes[tipo] || 'Normal'}`, 'success');
}

// Efeitos de modo dos modificadores (Aika: +Intuitivo +Preciso / Ukya: +Bruto +Ágil)
function _efeitos_modo_modificador(tipo) {
  if (tipo === 'Aika') return { Intuitivo: 1, Preciso: 1 };
  if (tipo === 'Ukya')  return { Bruto: 1, Ágil: 1 };
  return {};
}

function _removerEfeitoModoModificador(sheet, tipo) {
  const ef = _efeitos_modo_modificador(tipo);
  const raceModos = sheet.raceModos || {};
  Object.entries(ef).forEach(([m, delta]) => {
    const piso = raceModos[m] ?? 0;
    sheet.modos[m] = Math.max(piso, (sheet.modos[m] || 0) - delta);
  });
}

function _aplicarEfeitoModoModificador(sheet, tipo) {
  const ef = _efeitos_modo_modificador(tipo);
  Object.entries(ef).forEach(([m, delta]) => {
    const base = sheet.modos[m] ?? sheet.raceModos?.[m] ?? 2;
    sheet.modos[m] = base + delta;
  });
}

// Atualiza apenas o visual dos botões de modificador (sem alterar sheet.modos)
function _renderModificadorUI(tipo) {
  document.querySelectorAll('.modificador-btn').forEach(btn => {
    btn.removeAttribute('data-active');
  });
  const idMap = { null: 'mod-normal', Aika: 'mod-Aika', Ukya: 'mod-Ukya' };
  const btnId = idMap[String(tipo)];
  const activeBtn = document.getElementById(btnId) || document.getElementById('mod-normal');
  if (activeBtn) activeBtn.setAttribute('data-active', 'true');
  const sheet = getSheet(currentSheetId);
  if (sheet) renderModificadorAviso(sheet);
}

function renderModificadorAviso(sheet) {
  const aviso = document.getElementById('modificadorAviso');
  if (!aviso) return;

  if (isAika(sheet)) {
    aviso.style.display = 'block';
    aviso.innerHTML = '💠 <strong>Aika ativo:</strong> FOR travada (-∞). MAG +2. +1 Intuitivo, +1 Preciso. CON → RESM. −1 VIDA.';
  } else if (isUkya(sheet)) {
    aviso.style.display = 'block';
    aviso.innerHTML = '🔶 <strong>Ukya ativo:</strong> MAG travada (-∞). FOR +2. +1 Bruto, +1 Ágil.';
  } else {
    aviso.style.display = 'none';
  }
}

function renderEditor(sheet) {
  // Dados gerais
  document.getElementById('sheetName').value = sheet.name || '';
  document.getElementById('conceitoNarrativo').value = sheet.conceitoNarrativo || '';
  document.getElementById('arquetipo').value = sheet.arquetipo || '';
  document.getElementById('custoNarrativo').value = sheet.custoNarrativo || '';
  document.getElementById('picoPrincipal').value = sheet.picoPrincipal || '';
  document.getElementById('fraquezaEstrutural').value = sheet.fraquezaEstrutural || '';

  // === NOVO: Sistema de Níveis e Modificadores ===
  renderNivelInfo(sheet);
  _renderModificadorUI(sheet.modificador || null);  // apenas visual, sem alterar modos

  // Classificação — também re-renderiza chips de raça
  setClassificacao(sheet.classificacao || 'Base', false);
  // Tipo
  setTipo(sheet.tipo || 'jogador', false);

  // Seletor de raça
  renderRaceChips(sheet.classificacao || 'Base');

  // Atributos
  renderAttrs(sheet.atributos || {});
  // Modos narrativos
  renderModos(sheet.modos || {});
  // Listas dinâmicas
  renderDynamicList('tracos',           sheet.tracos || ['','','']);
  renderDynamicList('vantagens',        sheet.vantagens || ['']);
  renderDynamicList('vulnerabilidades', sheet.vulnerabilidades || ['']);
  // Stats
  updateStats(sheet);
  // Picos & Vales automático
  updatePicosVales(sheet);
  // Painel de raça nos modos
  updateRaceInfoPanel(sheet);
  // Habilidades raciais
  renderHabilidades(sheet);
  
  // === FASE 4: Subatributos ===
  renderSubatributos(sheet);
  
  // === FASE 5: Gráfico Radial ===
  destruirRadarChart();
  setTimeout(() => renderRadarChart(sheet), 50);
  
  // === FASE 3: Economia & Equipamentos ===
  renderEconomia(sheet);
  
  // === Background do Personagem ===
  document.getElementById('impetoInput').value = sheet.impeto || 0;
  document.getElementById('bgOrigem').value = sheet.bgOrigem || '';
  document.getElementById('bgMemoria').value = sheet.bgMemoria || '';
  document.getElementById('bgObjetivo').value = sheet.bgObjetivo || '';
  document.getElementById('bgMotivacao').value = sheet.bgMotivacao || '';
  document.getElementById('bgValores').value = sheet.bgValores || '';
  updateImpetoHint(sheet.nivel || 1, sheet.impeto || 0);
  renderPericias(sheet);
}

/* ============================================================
   CLASSIFICAÇÃO E TIPO
============================================================ */
function setClassificacao(val, save = true) {
  ['base','celestial','eccentrica'].forEach(k => {
    const btn = document.getElementById('cls-' + k);
    if (btn) btn.className = 'class-btn';
  });
  const map = { 'Base': 'base', 'Celestial': 'celestial', 'Excêntrica': 'eccentrica' };
  const key = map[val] || 'base';
  const activeBtn = document.getElementById('cls-' + key);
  if (activeBtn) activeBtn.className = `class-btn active-${key}`;

  // Ao mudar classificação, limpa raça e re-renderiza chips
  if (save && currentSheetId) {
    const s = getSheet(currentSheetId);
    if (s) {
      s.classificacao      = val;
      s.raceSelecionada    = null;
      s.subraçaSelecionada = null;
      s.raceBonus          = {};
      s.habilidadesAtivas  = [];
      s.progressaoAtiva    = [];
      s.caminhoEscolhido   = null;
      renderRaceChips(val);
      renderHabilidades(s);
      renderNivelInfo(s);
      debounceSave();
    }
  } else {
    renderRaceChips(val);
  }
}

function setTipo(val, save = true) {
  ['jogador','npc','preset'].forEach(k => {
    document.getElementById('tipo-' + k).classList.toggle('active', k === val);
  });
  if (save && currentSheetId) {
    const s = getSheet(currentSheetId);
    if (s) { s.tipo = val; debounceSave(); }
  }
}

/* ============================================================
   ATRIBUTOS
============================================================ */
const ATTRS_GROUPS = [
  ['FOR','CON','AGI','DES','VIDA','DEF'],
  ['INT','SAB','VON','CAR','PER'],
  ['MAG','RESM','ATQ']
];

const ATTR_LABELS = {
  FOR:'Força', CON:'Constituição', AGI:'Agilidade', DES:'Destreza',
  VIDA:'Vida', DEF:'Defesa', INT:'Inteligência', SAB:'Sabedoria',
  VON:'Vontade', CAR:'Carisma', PER:'Percepção', MAG:'Magia',
  RESM:'Res. Mágica', ATQ:'Ataque'
};

function renderAttrs(attrs) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  renderAtributosGrid(sheet);
}

function renderAtributosGrid(sheet) {
  if (!sheet) return;
  
  const grid = document.getElementById('attrsGrid');
  const allAttrs = ATTRS_GROUPS.flat();
  const maxAttr = calcMaxAtributo(sheet.nivel);
  const raceBonus = sheet.raceBonus || {};
  const isFaerie = sheet.raceSelecionada === 'Faerie';

  // Deltas da Forma Feérica da Faerie para mostrar como indicador
  const FAE_DELTA = { FOR:-1, DEF:-1, AGI:1, PER:1 };

  grid.innerHTML = allAttrs.map(function(attr) {
    const base = (sheet.atributos[attr] !== undefined ? sheet.atributos[attr] : 0);
    const bonus = raceBonus[attr] || 0;
    const total = base + bonus;

    const isBlocked = isAtributoBlocked(sheet, attr);
    const hasRaceBonus = bonus !== 0;
    const warn = Math.abs(base) > maxAttr;

    // Efeito Aika em CON (→ RESM) e VIDA
    const isAikaConv = isAika(sheet) && (attr === 'CON' || attr === 'RESM' || attr === 'VIDA');

    // Cor do card
    let cls = total > 0 ? 'pos' : total < 0 ? 'neg' : '';
    if (isBlocked) cls = 'blocked';
    if (isAikaConv && (attr === 'CON' || attr === 'VIDA')) cls = 'neg'; // CON e VIDA viram negativos visualmente

    const hasFaeBadge = isFaerie && FAE_DELTA[attr] !== undefined;
    const itemCls = 'attr-item' +
      (cls ? ' ' + cls : '') +
      (warn ? ' warn' : '') +
      (hasRaceBonus ? ' race-modified' : '') +
      (isBlocked ? ' blocked' : '') +
      (hasFaeBadge ? ' has-fae-badge' : '');

    // Badge Aika/Ukya / racial
    let modBadge = '';
    if (isBlocked) {
      modBadge = '<span class="attr-mod-badge blocked" title="Bloqueado por modificador">-∞</span>';
    } else if ((isAika(sheet) && attr === 'MAG') || (isUkya(sheet) && attr === 'FOR')) {
      modBadge = '<span class="attr-mod-badge boost" title="Bônus de modificador">+2</span>';
    } else if (isAika(sheet) && attr === 'CON') {
      modBadge = '<span class="attr-mod-badge blocked" title="CON → RESM (Aika)">→RESM</span>';
    } else if (isAika(sheet) && attr === 'RESM') {
      const conVal = (sheet.atributos['CON'] || 0) + (raceBonus['CON'] || 0);
      if (conVal > 0) modBadge = '<span class="attr-mod-badge boost" title="Absorve CON">+' + conVal + 'CON</span>';
    } else if (isAika(sheet) && attr === 'VIDA') {
      modBadge = '<span class="attr-mod-badge blocked" title="-1 Vida (Aika)">−1</span>';
    } else if (hasRaceBonus) {
      modBadge = '<span class="attr-mod-badge" title="Bônus racial">' + (bonus > 0 ? '+' : '') + bonus + '</span>';
    }

    const warnBadge = warn
      ? '<span class="attr-warn-badge" title="Base acima do limite (máx: ' + maxAttr + ')">⚠</span>'
      : '';

    // Valor principal
    let displayVal;
    if (isBlocked) {
      displayVal = '-∞';
    } else if ((isAika(sheet) && attr === 'MAG') || (isUkya(sheet) && attr === 'FOR')) {
      const t2 = total + 2;
      displayVal = (t2 > 0 ? '+' : '') + t2;
    } else if (isAika(sheet) && attr === 'CON') {
      displayVal = '→'; // CON flui para RESM
    } else if (isAika(sheet) && attr === 'RESM') {
      const conVal = (sheet.atributos['CON'] || 0) + (raceBonus['CON'] || 0);
      const newResm = total + conVal;
      displayVal = (newResm > 0 ? '+' : '') + newResm;
    } else if (isAika(sheet) && attr === 'VIDA') {
      const newVida = total - 1;
      displayVal = (newVida > 0 ? '+' : '') + newVida;
    } else {
      displayVal = (total > 0 ? '+' : '') + total;
    }

    // Decomposição base · bônus racial
    let decomposicao = '';
    if (hasRaceBonus && !isBlocked) {
      const baseStr = (base > 0 ? '+' : '') + base;
      const bonusStr = (bonus > 0 ? '+' : '') + bonus;
      decomposicao =
        '<div class="attr-decomp">' +
          '<span class="attr-decomp-base" title="Pontos base do jogador">' + baseStr + '</span>' +
          '<span class="attr-decomp-sep">·</span>' +
          '<span class="attr-decomp-bonus" title="Bônus racial">' + bonusStr + '</span>' +
        '</div>';
    }

    // Badge Faerie: mostra valor em forma feérica
    let faeBadge = '';
    if (hasFaeBadge) {
      const delta = FAE_DELTA[attr];
      const faeVal = total + delta;
      faeBadge = '<span class="attr-fae-badge" title="Forma Feérica">✦' +
        (faeVal > 0 ? '+' : '') + faeVal + '</span>';
    }

    return '<div class="' + itemCls + '" id="attr-item-' + attr + '">' +
      warnBadge + modBadge +
      '<div class="attr-label" title="' + (ATTR_LABELS[attr] || attr) + '">' + attr + '</div>' +
      '<div class="attr-value" id="attr-val-' + attr + '">' + displayVal + '</div>' +
      decomposicao +
      '<div class="attr-controls">' +
        '<button class="attr-btn" onclick="changeAttr(\'' + attr + '\', -1)">−</button>' +
        '<button class="attr-btn" onclick="changeAttr(\'' + attr + '\',  1)">+</button>' +
      '</div>' +
      '<div class="attr-limit">−1 a +' + maxAttr + ' | máx 3 neg.</div>' +
      faeBadge +
    '</div>';
  }).join('');
}

function changeAttr(attr, delta) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  
  if (isAtributoBlocked(sheet, attr)) {
    toast('Este atributo está bloqueado pelo modificador ativo', 'error');
    return;
  }
  
  sheet.atributos = sheet.atributos || {};
  const valorAtual = sheet.atributos[attr] ?? 0;
  const novoValor  = valorAtual + delta;
  const maxAttr    = calcMaxAtributo(sheet.nivel);
  const raceBonus  = (sheet.raceBonus || {})[attr] || 0;
  const novoTotal  = novoValor + raceBonus;

  // Limite superior: base não pode exceder maxAttr
  if (novoValor > maxAttr) {
    toast(`Atributo não pode ser maior que +${maxAttr} (nível ${sheet.nivel})`, 'error');
    return;
  }

  // Limite inferior: base não pode ser menor que -1
  if (novoValor < -1) {
    toast('A base de um atributo não pode ser menor que -1.', 'error');
    return;
  }

  // O total (base + racial) nunca pode ser menor que -3
  if (novoTotal < -3) {
    toast(`Total de ${attr} não pode ser menor que -3 (com bônus racial: ${raceBonus > 0 ? '+' : ''}${raceBonus}).`, 'error');
    return;
  }

  // Ao reduzir para -1: verificar se já há 3 atributos negativos (excluindo o atual)
  if (delta < 0 && novoValor < 0) {
    const attrs = sheet.atributos;
    const negativosAtuais = Object.entries(attrs)
      .filter(([k, v]) => k !== attr && (v || 0) < 0)
      .length;
    if (negativosAtuais >= 3) {
      toast('Máximo de 3 atributos negativos atingido.', 'warn');
      return;
    }
  }

  // Ao aumentar: verificar pontos disponíveis
  if (delta > 0) {
    const usadosApos = calcPontosAtributoUsados(sheet) + delta;
    const total = calcPontosAtributo(sheet.nivel, sheet);
    if (usadosApos > total) {
      toast(`Pontos de atributo esgotados! (${calcPontosAtributoUsados(sheet)}/${total} — incluindo bônus racial)`, 'warn');
      return;
    }
  }
  
  sheet.atributos[attr] = novoValor;
  renderAtributosGrid(sheet);
  renderNivelInfo(sheet);
  debounceSave();
  updateStats(sheet);
  updatePicosVales(sheet);
  atualizarSubatributos(sheet);
  atualizarBloqueioHabilidades(sheet);
}

/* ============================================================
   MODOS NARRATIVOS
============================================================ */
function renderModos(modos) {
  const grid = document.getElementById('modosGrid');
  if (!grid) return;
  // Skip if unchanged
  const hashKey = JSON.stringify(modos);
  if (grid._lastHash === hashKey) return;
  grid._lastHash = hashKey;
  const names = ['Bruto', 'Ágil', 'Preciso', 'Intuitivo'];
  const modeVals = names.map(n => modos[n] ?? 2);
  const maxVal = Math.max(...modeVals);

  // Qualidade: 0=nulo, 1=ruim, 2=mediano, 3=bom, 4=dominante, 5+=acima
  const QUALITY = { 0:'Nulo', 1:'Ruim', 2:'Mediano', 3:'Bom', 4:'Dominante' };
  const QUALITY_CLS = { 0:'q0', 1:'q1', 2:'q2', 3:'q3', 4:'q4' };

  grid.innerHTML = names.map(nome => {
    const val = modos[nome] ?? 2;
    const q = Math.min(Math.max(val, 0), 4);
    const qCls = QUALITY_CLS[q] || 'q4';
    const qLabel = QUALITY[q] || 'Dominante+';
    const isDom = val === maxVal && val >= 3;
    const warn  = val > 4;

    // Barra de qualidade: 4 pips
    let pipsHtml = '';
    for (let i = 1; i <= 4; i++) {
      const filled = i <= q ? `filled-${q}` : '';
      pipsHtml += `<div class="modo-quality-pip ${filled}"></div>`;
    }

    return `
      <div class="modo-item ${qCls}-item" id="modo-item-${nome}">
        <div class="modo-header">
          <span class="modo-label">${nome}</span>
          ${isDom ? '<span class="modo-dominant-badge">Dominante</span>' : ''}
        </div>
        <div class="modo-controls">
          <button class="attr-btn" onclick="changeModo('${nome}', -1)">−</button>
          <span class="modo-value" id="modo-val-${nome}">${val}</span>
          <button class="attr-btn" onclick="changeModo('${nome}',  1)">+</button>
        </div>
        <div class="modo-quality-bar">${pipsHtml}</div>
        <div class="modo-quality-label ${qCls}">${warn ? '⚠ Acima do máx.' : qLabel}</div>
      </div>`;
  }).join('');
}

function changeModo(nome, delta) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  sheet.modos     = sheet.modos     || {};
  sheet.raceModos = sheet.raceModos || {};

  const valorAtual = sheet.modos[nome] ?? 1;
  const baseRacial = sheet.raceModos[nome] ?? 1;
  const novoValor  = valorAtual + delta;

  // Não permite abaixo do valor base racial (mínimo absoluto 0)
  const piso = Math.max(0, baseRacial);
  if (novoValor < piso) {
    toast(`Mínimo para ${nome}: ${piso} (base racial).`, 'warn');
    return;
  }

  // Ao aumentar, verifica pontos disponíveis
  if (delta > 0) {
    const usadosApos = calcPontosModoUsados(sheet) + 1;
    const total = calcPontosModo(sheet.nivel, sheet);
    if (usadosApos > total) {
      toast(`Pontos de modo esgotados! (${calcPontosModoUsados(sheet)}/${total} — incluindo bônus racial)`, 'warn');
      return;
    }
  }

  sheet.modos[nome] = novoValor;
  renderModos(sheet.modos);
  renderNivelInfo(sheet);
  debounceSave();
  atualizarSubatributos(sheet);
}

/* ============================================================
   LISTAS DINÂMICAS
============================================================ */

/* ============================================================
   PERÍCIAS
============================================================ */
const PERICIAS_LIST = [
  { id:'Influência',   desc:'Induzir, persuadir, intimidar ou manipular decisões e comportamentos.' },
  { id:'Comunicação',  desc:'Transmitir mensagens de forma clara, eficaz ou discreta.' },
  { id:'Ofício',       desc:'Fabricar, consertar ou aprimorar objetos e estruturas.' },
  { id:'Medicina',     desc:'Compreender o corpo, diagnosticar condições e tratar ferimentos.' },
  { id:'Performance',  desc:'Executar artes performáticas (música, dança, atuação, canto).' },
  { id:'Manejo',       desc:'Manusear, operar ou controlar objetos, ferramentas e equipamentos.' },
  { id:'Coleta',       desc:'Buscar, extrair e ajuntar recursos do ambiente.' },
  { id:'Investigação', desc:'Procurar pistas, reunir informações e interpretá-las logicamente.' },
  { id:'Destreza',     desc:'Habilidade manual fina, precisão e controle motor.' },
  { id:'Pontaria',     desc:'Mirar e acertar alvos à distância.' },
  { id:'Golpe',        desc:'Atacar com armas ou o próprio corpo em combate direto.' },
  { id:'Cognição',     desc:'Conhecimento específico, lógica, análise e raciocínio técnico.' },
  { id:'Sabedoria',    desc:'Conhecimento empírico, mundano e aprendido pela experiência.' },
  { id:'Travessia',    desc:'Deslocar-se, escalar, nadar, correr e superar obstáculos físicos.' },
  { id:'Furtividade',  desc:'Agir sem ser percebido, esconder-se ou mover-se silenciosamente.' },
];

function renderPericias(sheet) {
  const grid = document.getElementById('periciasGrid');
  if (!grid) return;
  sheet.pericias = sheet.pericias || {};
  grid.innerHTML = PERICIAS_LIST.map(p => {
    const val = sheet.pericias[p.id] ?? 0;
    const cls = val > 0 ? 'pos' : val < 0 ? 'neg' : '';
    return `<div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 12px;display:flex;flex-direction:column;gap:4px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:0.82rem;font-weight:700;color:var(--text-primary);">${p.id}</span>
        <div style="display:flex;align-items:center;gap:4px;">
          <button class="attr-btn" onclick="changePericias('${p.id}',-1)">−</button>
          <span class="attr-value" style="font-size:1.1rem;min-width:22px;text-align:center;color:${val>0?'var(--attr-pos)':val<0?'var(--attr-neg)':'var(--text-secondary)'};">${val>0?'+':''}${val}</span>
          <button class="attr-btn" onclick="changePericias('${p.id}',1)">+</button>
        </div>
      </div>
      <div style="font-size:0.7rem;color:var(--text-muted);line-height:1.4;">${p.desc}</div>
    </div>`;
  }).join('');
}

function changePericias(nome, delta) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  sheet.pericias = sheet.pericias || {};
  const atual = sheet.pericias[nome] ?? 0;
  sheet.pericias[nome] = Math.max(-5, Math.min(10, atual + delta));
  renderPericias(sheet);
  debounceSave();
}

function renderDynamicList(key, items) {
  const container = document.getElementById(key + 'List');
  container.innerHTML = items.map((item, i) => `
    <div class="dynamic-item">
      <input class="dynamic-input" value="${escapeHtml(item)}"
        placeholder="${key === 'tracos' ? 'Traço fixo...' : key === 'vantagens' ? 'Vantagem situacional...' : 'Vulnerabilidade...'}"
        oninput="updateListItem('${key}', ${i}, this.value)" />
      <button class="dynamic-remove" onclick="removeListItem('${key}', ${i})">✕</button>
    </div>`).join('');
  // Atualizar contagem de traços
  if (key === 'tracos') {
    const count = document.getElementById('tracosCount');
    if (count) count.textContent = `${items.length} traço${items.length !== 1 ? 's' : ''}`;
  }
}

function addItem(key) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  sheet[key] = sheet[key] || [];
  sheet[key].push('');
  renderDynamicList(key, sheet[key]);
  // Foca no último input
  setTimeout(() => {
    const inputs = document.querySelectorAll(`#${key}List .dynamic-input`);
    if (inputs.length) inputs[inputs.length - 1].focus();
  }, 50);
  debounceSave();
}

function removeListItem(key, index) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  sheet[key].splice(index, 1);
  renderDynamicList(key, sheet[key]);
  debounceSave();
}

function updateListItem(key, index, value) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  sheet[key][index] = value;
  debounceSave();
}

/* ============================================================
   SALVAR FICHA
============================================================ */
function debounceSave() {
  clearTimeout(saveDebounceTimer);
  saveDebounceTimer = setTimeout(() => saveCurrentSheet(true), 800);
}

function saveCurrentSheet(auto = false) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  // Coleta dados dos inputs com guard para cada elemento
  const getName       = id => (document.getElementById(id) || {}).value;
  sheet.name               = getName('sheetName')               ?? sheet.name;
  sheet.conceitoNarrativo  = getName('conceitoNarrativo')       ?? sheet.conceitoNarrativo;
  sheet.arquetipo          = getName('arquetipo')               ?? sheet.arquetipo;
  sheet.custoNarrativo     = getName('custoNarrativo')          ?? sheet.custoNarrativo;
  sheet.picoPrincipal      = getName('picoPrincipal')           ?? sheet.picoPrincipal;
  sheet.fraquezaEstrutural = getName('fraquezaEstrutural')      ?? sheet.fraquezaEstrutural;
  // Background
  sheet.bgOrigem    = getName('bgOrigem')    ?? sheet.bgOrigem;
  sheet.bgMemoria   = getName('bgMemoria')   ?? sheet.bgMemoria;
  sheet.bgObjetivo  = getName('bgObjetivo')  ?? sheet.bgObjetivo;
  sheet.bgMotivacao = getName('bgMotivacao') ?? sheet.bgMotivacao;
  sheet.bgValores   = getName('bgValores')   ?? sheet.bgValores;
  sheet.updatedAt          = Date.now();
  saveData();
  if (auto) {
    const ind = document.getElementById('autosaveIndicator');
    if (ind) {
      ind.classList.add('show');
      setTimeout(() => ind.classList.remove('show'), 2000);
    }
  } else {
    toast('Ficha salva!', 'success');
  }
  updateStats(sheet);
}

function updateStats(sheet) {
  const raceBonus = sheet.raceBonus || {};
  // Conta sobre o total efetivo (base + bônus racial)
  const attrs = sheet.atributos || {};
  const totais = Object.keys(attrs).map(k => (attrs[k] || 0) + (raceBonus[k] || 0));
  const pos = totais.filter(v => v > 0).length;
  const neg = totais.filter(v => v < 0).length;
  const modos = sheet.modos || {};
  const domModo = Object.entries(modos).sort((a,b) => b[1]-a[1])[0];
  const stats = document.getElementById('statsContent');
  if (!stats) return;
  stats.innerHTML = `
    <div>📋 Traços: <strong>${(sheet.tracos||[]).filter(t=>t).length}</strong></div>
    <div>✅ Vantagens: <strong>${(sheet.vantagens||[]).filter(v=>v).length}</strong></div>
    <div>⚠️ Vulnerab.: <strong>${(sheet.vulnerabilidades||[]).filter(v=>v).length}</strong></div>
    <div>🟢 Attrs +: <strong>${pos}</strong></div>
    <div>🔴 Attrs −: <strong>${neg}</strong></div>
    ${domModo ? `<div>🎭 Modo dom.: <strong>${domModo[0]} (${domModo[1]})</strong></div>` : ''}
  `;
}

/* ============================================================
   PICOS & VALES — cálculo automático
============================================================ */
function updatePicosVales(sheet) {
  const picosEl = document.getElementById('picosAuto');
  const valesEl = document.getElementById('valesAuto');
  if (!picosEl || !valesEl) return;

  const attrs = sheet.atributos || {};
  const raceBonus = sheet.raceBonus || {};
  // Usa total efetivo para picos/vales
  const entries = Object.keys(attrs).map(k => [k, (attrs[k] || 0) + (raceBonus[k] || 0)]).filter(([, v]) => v !== 0);

  if (!entries.length) {
    picosEl.textContent = '—';
    valesEl.textContent = '—';
    return;
  }

  // Ordena do maior para o menor
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const maxVal = sorted[0][1];
  const minVal = sorted[sorted.length - 1][1];

  // Picos: todos os atributos com o valor máximo (se positivo)
  if (maxVal > 0) {
    const picos = sorted.filter(([, v]) => v === maxVal);
    picosEl.textContent = picos.map(([k, v]) => `${k} (${v > 0 ? '+' + v : v})`).join('  ·  ');
  } else {
    picosEl.textContent = '—';
  }

  // Vales: todos os atributos com o valor mínimo (se negativo)
  if (minVal < 0) {
    const vales = sorted.filter(([, v]) => v === minVal);
    valesEl.textContent = vales.map(([k, v]) => `${k} (${v})`).join('  ·  ');
  } else {
    valesEl.textContent = '—';
  }
}

/* ============================================================
   DUPLICAR / EXCLUIR
============================================================ */
function duplicateSheet(id) {
  const sid = id || currentSheetId;
  const sheet = getSheet(sid);
  if (!sheet) return;
  const copy = JSON.parse(JSON.stringify(sheet));
  copy.id = generateId();
  copy.name = (copy.name || 'Ficha') + ' (cópia)';
  copy.createdAt = copy.updatedAt = Date.now();
  appData.sheets.push(copy);
  saveData();
  renderLibrary();
  toast('Ficha duplicada!', 'success');
}

function openDeleteModal(id) {
  deleteTargetId = id;
  const sheet = getSheet(id);
  document.getElementById('deleteModalText').textContent =
    `Excluir "${sheet?.name || 'esta ficha'}"? Esta ação não pode ser desfeita.`;
  openModal('deleteModal');
}

function confirmDelete() {
  appData.sheets = appData.sheets.filter(s => s.id !== deleteTargetId);
  saveData();
  closeModal('deleteModal');
  if (currentSheetId === deleteTargetId) {
    setCurrentSheetId(null);
    localStorage.removeItem(ACTIVE_SHEET_KEY);
    showPage('library');
  }
  renderLibrary();
  renderPresets();
  toast('Ficha excluída.', 'info');
}

/* ============================================================
   PRESETS
============================================================ */
function saveAsPreset() {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  document.getElementById('presetNameInput').value = sheet.name;
  openModal('savePresetModal');
}

function confirmSaveAsPreset() {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  const name = document.getElementById('presetNameInput').value || sheet.name;
  const preset = JSON.parse(JSON.stringify(sheet));
  preset.id = generateId();
  preset.name = name;
  preset.tipo = 'preset';
  preset.createdAt = preset.updatedAt = Date.now();
  appData.sheets.push(preset);
  saveData();
  closeModal('savePresetModal');
  toast('Preset salvo!', 'success');
}

