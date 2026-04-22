/* ============================================================
   ESTRUTURA DE DADOS
============================================================ */
const STORAGE_KEY = 'verloren_rpg_data';
const LAST_PAGE_KEY = 'verloren_last_page';
const ACTIVE_SHEET_KEY = 'verloren_active_sheet';
const DEFAULT_RACE_MODOS = { Bruto: 2, Ágil: 2, Preciso: 2, Intuitivo: 2 };
const DEFAULT_PERICIAS = {
  Influência: 0, Comunicação: 0, Ofício: 0, Medicina: 0,
  Performance: 0, Manejo: 0, Coleta: 0, Investigação: 0,
  Destreza: 0, Pontaria: 0, Golpe: 0, Cognição: 0,
  Sabedoria: 0, Travessia: 0, Furtividade: 0
};

function uniqueIds(list) {
  return window.CompanionUtils ? window.CompanionUtils.uniqueIds(list) : [...new Set((Array.isArray(list) ? list : []).filter(Boolean))];
}

function normalizeSearchText(value) {
  return window.CompanionUtils ? window.CompanionUtils.normalizeSearchText(value) : String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function includesNormalized(value, query) {
  return window.CompanionUtils ? window.CompanionUtils.includesNormalized(value, query) : (function () {
    const normalizedQuery = normalizeSearchText(query);
    return !normalizedQuery || normalizeSearchText(value).includes(normalizedQuery);
  })();
}

function getLearnedSkillIds(sheet) {
  return uniqueIds([...(sheet?.habilidadesAprendidas || []), ...(sheet?.progressaoAtiva || [])]);
}

function isPresetLearnedSkill(sheet, id) {
  return !!sheet
    && sheet.tipo === 'preset'
    && (sheet.habilidadesAprendidas || []).includes(id)
    && !(sheet.progressaoAtiva || []).includes(id);
}

function getDarkModeState() {
  const html = document.documentElement;
  const mode = html.getAttribute('data-mode');
  return mode ? mode === 'dark' : html.getAttribute('data-theme') === 'dark';
}

function normalizeSheetRecord(sheet) {
  const s = sheet || {};
  if (!s.raceBonus) s.raceBonus = {};
  if (!s.raceModos) s.raceModos = { ...DEFAULT_RACE_MODOS };
  if (!s.habilidadesAprendidas) s.habilidadesAprendidas = [];
  if (!s.habilidadesAtivas) s.habilidadesAtivas = [];
  if (!s.progressaoAtiva) s.progressaoAtiva = [];
  if (!s.inventario) s.inventario = [];
  if (!s.recompensas) s.recompensas = [];
  if (s.nivel === undefined) s.nivel = 1;
  if (!s.equipamento) s.equipamento = { maoEsquerda: null, maoDireita: null, armadura: null };
  if (s.moedas === undefined) s.moedas = calcMoedasIniciais(s.nivel || 1);
  s.pericias = { ...DEFAULT_PERICIAS, ...(s.pericias || {}) };
  if (!s.carteira) s.carteira = { cobre: 0, prata: s.moedas || 0, ouro: 0, platina: 0 };
  if (!s._recAtual) {
    try {
      const rec = calcRecursos(s);
      s._recAtual = { HP: rec.HP, MP: rec.MP, SP: rec.SP, SAN: rec.SAN };
    } catch(e) {
      s._recAtual = { HP: 10, MP: 5, SP: 8, SAN: 10 };
    }
  }
  if (s.empunhaduraAtiva === undefined) s.empunhaduraAtiva = {};
  if (s.variacaoLocus === undefined) s.variacaoLocus = null;
  if (s.laikaIntensidade === undefined) s.laikaIntensidade = 0;
  if (s.caminhoEscolhido === undefined) s.caminhoEscolhido = null;
  if (s.modificador === undefined) s.modificador = null;

  s.habilidadesAprendidas = uniqueIds(s.habilidadesAprendidas);
  s.habilidadesAtivas = uniqueIds(s.habilidadesAtivas);
  s.progressaoAtiva = uniqueIds(s.progressaoAtiva);

  if (s.tipo !== 'preset' && s.habilidadesAprendidas.length) {
    s.progressaoAtiva = uniqueIds([...s.progressaoAtiva, ...s.habilidadesAprendidas]);
    s.habilidadesAprendidas = [];
  }

  return s;
}

// Esqueleto padrão de uma ficha
function createDefaultSheet(overrides = {}) {
  const nivel = overrides.nivel || 1;
  return {
    id: generateId(),
    name: '',
    classificacao: 'Base',
    tipo: 'jogador',
    conceitoNarrativo: '',
    
    // === NOVO: Sistema de Níveis ===
    nivel: nivel,
    pontosAtributo: 3 + nivel,       // calcPontosAtributo(nivel)
    pontosAtributoUsados: 0,          // derivado em tempo real
    pontosModo: 2 + Math.floor(nivel / 6),  // calcPontosModo(nivel)
    pontosModoUsados: 0,              // derivado em tempo real
    
    // === NOVO: Modificadores Aika/Ukya ===
    modificador: null,  // null | 'Aika' | 'Ukya'
    
    // === NOVO: Caminho Racial ===
    caminhoEscolhido: null,
    
    // === Bônus racial separado do base (sistema de bônus aditivo) ===
    raceBonus: {},
    raceModos: { ...DEFAULT_RACE_MODOS }, // modos base da raça (não custam pontos)
    
    // === NOVO: Habilidades ===
    habilidadesAprendidas: [],  // IDs das habilidades aprendidas
    habilidadesDisponiveis: 1,  // 1 inicial + níveis pares
    
    atributos: {
      FOR: 0, CON: 0, AGI: 0, DES: 0, VIDA: 0, DEF: 0,
      INT: 0, SAB: 0, VON: 0, CAR: 0, PER: 0,
      MAG: 0, RESM: 0, ATQ: 0
    },
    picoPrincipal: '',
    fraquezaEstrutural: '',
    modos: { Bruto: 2, Ágil: 2, Preciso: 2, Intuitivo: 2 },
    tracos: ['', '', ''],
    vantagens: [''],
    vulnerabilidades: [''],
    arquetipo: '',
    custoNarrativo: '',
    
    // Habilidades raciais ativas (selecionadas pelo usuário)
    habilidadesAtivas: [],      // array de { id, ativa:bool }
    progressaoAtiva: [],        // habilidades de progressão adquiridas
    variacaoLocus: null,        // variação cultural selecionada
    laikaIntensidade: 0,        // 0-3 para Laika
    laikaAlterForms: [],        // alter forms ativos
    
    // === NOVO: Sistema de Equipamentos ===
    moedas: 50 + (50 * nivel),
    carteira: { cobre: 0, prata: 50 + (50 * nivel), ouro: 0, platina: 0 },
    empunhaduraAtiva: {},
    equipamento: {
      maoEsquerda: null,
      maoDireita: null,
      armadura: null
    },
    inventario: [],  // [{id, nome, peso, quantidade}]
    recompensas: [],  // [{descricao, valor, data}]
    
    // === Background do Personagem ===
    impeto: 0,
    bgOrigem: '',
    bgMemoria: '',
    bgObjetivo: '',
    bgMotivacao: '',
    bgValores: '',
    // === Perícias ===
    pericias: { ...DEFAULT_PERICIAS },
    _recAtual: { HP: 10, MP: 5, SP: 8, SAN: 10 },
    
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides
  };
}

// Estado global do app
let appData = {
  sheets: [],     // fichas normais + presets (tipo === 'preset')
  config: { theme: 'light' }
};

let currentSheetId = null;
let deleteTargetId  = null;
let saveDebounceTimer = null;

function setCurrentSheetId(id) {
  currentSheetId = id || null;
  window.currentSheetId = currentSheetId;
  return currentSheetId;
}

setCurrentSheetId(null);

/* ============================================================
   PERSISTÊNCIA (localStorage)
============================================================ */
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      appData = {
        sheets: (parsed.sheets || []).map(normalizeSheetRecord),
        config: parsed.config || { theme: 'light' }
      };
    }
  } catch(e) {}
  _rebuildSheetIndex();
}

function saveData() {
  _rebuildSheetIndex();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

/* ============================================================
   UTILITÁRIOS
============================================================ */
function generateId() {
  return window.CompanionUtils ? window.CompanionUtils.createId('sheet') : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Throttle utility for performance
function throttle(fn, delay) {
  var last = 0;
  return function() {
    var now = Date.now();
    if (now - last >= delay) {
      last = now;
      return fn.apply(this, arguments);
    }
  };
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'2-digit' });
}

function sanitizeNonNegativeInt(value, fallback = 0) {
  const numeric = Number.parseInt(value, 10);
  return Number.isFinite(numeric) ? Math.max(0, numeric) : fallback;
}

function encodeInlineArg(value) {
  return encodeURIComponent(String(value == null ? '' : value));
}

function decodeInlineArg(token) {
  try {
    return decodeURIComponent(String(token == null ? '' : token));
  } catch (error) {
    return String(token == null ? '' : token);
  }
}

function openSheetInline(token) {
  openSheet(decodeInlineArg(token));
}

function duplicateSheetInline(token) {
  duplicateSheet(decodeInlineArg(token));
}

function openDeleteModalInline(token) {
  openDeleteModal(decodeInlineArg(token));
}

// Índice rápido de fichas por ID (evita busca linear repetida)
let _sheetIndex = new Map();

function _rebuildSheetIndex() {
  _sheetIndex = new Map(appData.sheets.map(s => [s.id, s]));
}

function getSheet(id) {
  return _sheetIndex.get(id);
}

/* ============================================================
   SISTEMA DE NÍVEIS E MODIFICADORES
============================================================ */

// Calcula o limite máximo de um atributo baseado no nível
function calcMaxAtributo(nivel) {
  return 4 + Math.floor(nivel / 5);
}

// Calcula quantas habilidades o personagem pode aprender
// 1 inicial + 1 a cada 2 níveis
function calcHabilidadesDisponiveis(nivel) {
  return 1 + Math.floor(nivel / 2);
}

// Calcula pontos de atributo disponíveis: 3 + nível
function calcPontosAtributo(nivel, sheet) {
  const base = 3 + nivel;
  if (!sheet) return base;
  const race = RACES_DB.find(r => r.name === sheet.raceSelecionada);
  // Humano: +4 atributos extras (Adaptabilidade Estrutural)
  // Outros com pontosExtras: bônus livre
  const raceBonusAttr = race ? (race.pontosExtrasAtributo || 0) : 0;
  return base + raceBonusAttr;
}

// Calcula pontos de modo disponíveis: 2 + 1 a cada 6 níveis
function calcPontosModo(nivel, sheet) {
  const base = 2 + Math.floor(nivel / 6);
  if (!sheet) return base;
  const race = RACES_DB.find(r => r.name === sheet.raceSelecionada);
  const raceBonusModo = race ? (race.pontosExtrasModo || 0) : 0;
  return base + raceBonusModo;
}

// ── Atributos base que o jogador distribui pontos ─────────
// VIDA, DEF, ATQ, RESM são subatributos DERIVADOS e não entram nesta lista
const ATTRS_BASE = ['FOR','CON','AGI','DES','VON','INT','SAB','PER','CAR','MAG'];

// Pontos de atributo USADOS: soma apenas atributos base (positivos consomem, negativos devolvem)
function calcPontosAtributoUsados(sheet) {
  const attrs = sheet.atributos || {};
  let usado = 0;
  // Apenas os atributos que o jogador distribui; VIDA, DEF, ATQ, RESM são derivados
  ATTRS_BASE.forEach(k => { usado += (attrs[k] || 0); });
  return usado;
}

// Pontos de modo USADOS: cada modo começa no valor da raça (ou 1 se sem raça).
// O jogador só gasta pontos ao elevar UM MODO ACIMA do valor racial base.
function calcPontosModoUsados(sheet) {
  const modos     = sheet.modos     || {};
  const raceModos = sheet.raceModos || {};
  const modBonus  = _efeitos_modo_modificador(sheet.modificador);
  const nomes = ['Bruto', 'Ágil', 'Preciso', 'Intuitivo'];
  let usado = 0;
  nomes.forEach(n => {
    const atual = modos[n] ?? 1;
    const base  = (raceModos[n] ?? 1) + (modBonus[n] || 0);
    if (atual > base) usado += (atual - base);
  });
  return usado;
}

// Habilidades APRENDIDAS: conta habilidades de progressão adquiridas
function calcHabilidadesAprendidas(sheet) {
  return getLearnedSkillIds(sheet).length;
}

// Calcula capacidade de carga baseado na FOR
function calcCapacidadeCarga(for_value) {
  if (for_value >= 0) {
    return Math.pow(for_value, 3) + Math.pow(for_value, 2) + for_value + 10;
  } else {
    return (for_value * 2) + 10;
  }
}

// Calcula moedas iniciais
function calcMoedasIniciais(nivel) {
  return 50 + (50 * nivel);
}

// Verifica se o modificador Aika está ativo
function isAika(sheet) {
  return sheet.modificador === 'Aika';
}

// Verifica se o modificador Ukya está ativo
function isUkya(sheet) {
  return sheet.modificador === 'Ukya';
}

// Retorna o valor efetivo de um atributo considerando modificadores e bônus racial
function getAtributoEfetivo(sheet, attr) {
  const baseValue = (sheet.atributos[attr] || 0) + ((sheet.raceBonus || {})[attr] || 0);

  // Aika: FOR = -∞
  if (isAika(sheet) && attr === 'FOR') return -Infinity;

  // Ukya: MAG = -∞
  if (isUkya(sheet) && attr === 'MAG') return -Infinity;

  // Aika: MAG +2 (ignora limite)
  if (isAika(sheet) && attr === 'MAG') return baseValue + 2;

  // Ukya: FOR +2 (ignora limite)
  if (isUkya(sheet) && attr === 'FOR') return baseValue + 2;

  // Aika: CON direciona seus pontos para RESM (CON efetivo = 0 mesmo que base > 0)
  if (isAika(sheet) && attr === 'CON') return 0;

  // Aika: RESM recebe +CON (valor do CON base + racial)
  if (isAika(sheet) && attr === 'RESM') {
    const conBase = (sheet.atributos['CON'] || 0) + ((sheet.raceBonus || {})['CON'] || 0);
    return baseValue + conBase;
  }

  // Aika: -1 VIDA
  if (isAika(sheet) && attr === 'VIDA') return baseValue - 1;

  return baseValue;
}

// Verifica se um atributo está bloqueado pelo modificador
function isAtributoBlocked(sheet, attr) {
  if (isAika(sheet) && attr === 'FOR') return true;
  if (isUkya(sheet) && attr === 'MAG') return true;
  return false;
}

// Verifica se uma habilidade atende os requisitos
function verificaRequisito(sheet, requisito) {
  if (!requisito) return true;
  
  // Formato: "Nível X"
  if (requisito.includes('Nível')) {
    const m = requisito.match(/\d+/);
    if (!m) return true;
    const nivelReq = parseInt(m[0]);
    return sheet.nivel >= nivelReq;
  }
  
  // Formato: "Von 3", "Sab 3", etc
  const match = requisito.match(/^(\w+)\s+(\d+)$/);
  if (match) {
    const [, attr, valor] = match;
    const attrMap = {
      'Von': 'VON', 'Sab': 'SAB', 'Int': 'INT', 'For': 'FOR',
      'Con': 'CON', 'Agi': 'AGI', 'Des': 'DES', 'Per': 'PER',
      'Car': 'CAR', 'Mag': 'MAG'
    };
    const attrKey = attrMap[attr] || attr.toUpperCase();
    return getAtributoEfetivo(sheet, attrKey) >= parseInt(valor);
  }
  
  // Requisitos especiais
  if (requisito.includes('Intensidade')) {
    const m = requisito.match(/\d+/);
    if (!m) return true;
    const nivel = parseInt(m[0]);
    return sheet.laikaIntensidade >= nivel;
  }
  
  return true;
}

/* ============================================================
   TEMA
============================================================ */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.classList.toggle('dark', theme === 'dark');
  appData.config = appData.config || {};
  appData.config.theme = theme;
  saveData();
  
  // === FASE 5: Recria gráfico com novas cores de tema ===
  const sheet = getSheet(currentSheetId);
  if (sheet && radarChartInstance) {
    destruirRadarChart();
    setTimeout(() => renderRadarChart(sheet), 80);
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

/* ============================================================
   SETTINGS SIDEBAR — v2.1 (data-theme + data-mode architecture)
============================================================ */

// ---- Theme registry ----
const THEMES = [
  { id: 'default',        name: 'Default',        dot: null },
  { id: 'cherry-blossom', name: 'Cherry Blossom', dot: 'linear-gradient(135deg,#F2A1B3,#F8C6D3)' },
  { id: 'dragon-jade',    name: 'Dragon Jade',    dot: 'linear-gradient(135deg,#1FA77A,#7ED1B2)' },
  { id: 'dry-bamboo',     name: 'Dry Bamboo',     dot: 'linear-gradient(135deg,#8A9A5B,#D2CBB8)' },
  { id: 'neon-nebula',    name: 'Neon Nebula',    dot: 'linear-gradient(135deg,#9B5CFF,#C3A3FF)' },
  { id: 'tropical-ocean', name: 'Tropical Ocean', dot: 'linear-gradient(135deg,#00B3C6,#6FE3F0)' },
  { id: 'crimson',        name: 'Crimson',        dot: 'linear-gradient(135deg,#C62828,#E57373)' },
  { id: 'deep-dark',      name: 'Deep Dark',      dot: 'linear-gradient(135deg,#161616,#4F46E5)' },
  { id: 'grey-zone',      name: 'Grey Zone',      dot: 'linear-gradient(135deg,#7a7a7a,#c8c8c8)' },
];

const FONT_SIZES = { small: '0.9rem', normal: '1rem', large: '1.15rem', xlarge: '1.3rem' };

let _sidebarOpen = false;

// ── Sidebar open/close ──────────────────────────────────────
function openSettingsSidebar() {
  document.getElementById('settingsSidebar').classList.add('open');
  document.getElementById('settingsOverlay').classList.add('open');
  const btn = document.getElementById('overflowMenuBtn');
  if (btn) btn.setAttribute('aria-expanded', 'true');
  _sidebarOpen = true;
  _renderThemeList();
  _syncFontSizeBtns();
  _syncToggle('contrastToggle', localStorage.getItem('ss_highContrast') === 'true');
  _syncToggle('motionToggle',   localStorage.getItem('ss_reduceMotion') === 'true');
  _syncModeBtn();
}

function closeSettingsSidebar() {
  document.getElementById('settingsSidebar').classList.remove('open');
  document.getElementById('settingsOverlay').classList.remove('open');
  const btn = document.getElementById('overflowMenuBtn');
  if (btn) btn.setAttribute('aria-expanded', 'false');
  _sidebarOpen = false;
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && _sidebarOpen) closeSettingsSidebar();
});

// Swipe-right to close
(function() {
  var sx = 0;
  var sb = document.getElementById('settingsSidebar');
  if (!sb) return;
  sb.addEventListener('touchstart', function(e) { sx = e.touches[0].clientX; }, {passive:true});
  sb.addEventListener('touchend',   function(e) { if (e.changedTouches[0].clientX - sx > 60) closeSettingsSidebar(); }, {passive:true});
})();

// ── Light / Dark mode toggle ────────────────────────────────
function toggleDarkMode() {
  var html = document.documentElement;
  var currentMode = localStorage.getItem('ss_mode') || (html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  var next = currentMode === 'dark' ? 'light' : 'dark';
  _applyMode(next);
  localStorage.setItem('ss_mode', next);
}

function _applyMode(mode) {
  var html = document.documentElement;
  html.setAttribute('data-mode', mode);
  // Sync legacy data-theme=dark for backward compat with existing CSS
  var currentTheme = localStorage.getItem('ss_customTheme') || 'default';
  if (currentTheme === 'default') {
    // Default theme: use old applyTheme for backward compat
    applyTheme(mode === 'dark' ? 'dark' : 'light');
  }
  _syncModeBtn();
  // Refresh charts
  var sheet = (typeof getSheet === 'function' && currentSheetId) ? getSheet(currentSheetId) : null;
  if (sheet && typeof radarChartInstance !== 'undefined' && radarChartInstance) {
    if (typeof destruirRadarChart === 'function') destruirRadarChart();
    setTimeout(function() { if (typeof renderRadarChart === 'function') renderRadarChart(sheet); }, 80);
  }
}

function _syncModeBtn() {
  var mode = localStorage.getItem('ss_mode') || 'light';
  var el = document.getElementById('modeSwitchLabel');
  if (el) el.textContent = mode === 'dark' ? '🌙 Escuro' : '☀️ Claro';
}

(function _initMode() {
  var saved = localStorage.getItem('ss_mode');
  if (saved) {
    document.documentElement.setAttribute('data-mode', saved);
    // Backward compat: if theme is default, also set data-theme
    var theme = localStorage.getItem('ss_customTheme') || 'default';
    if (theme === 'default') {
      document.documentElement.setAttribute('data-theme', saved === 'dark' ? 'dark' : 'light');
    }
  }
})();

// ── Theme selection ─────────────────────────────────────────
function _renderThemeList() {
  var activeId = localStorage.getItem('ss_customTheme') || 'default';
  var list = document.getElementById('themeList');
  if (!list) return;
  list.innerHTML = THEMES.map(function(t) {
    var dotHtml = t.dot
      ? '<span class="theme-dot" style="background:' + t.dot + '"></span>'
      : '<span class="theme-dot" style="background:linear-gradient(135deg,var(--lavanda),var(--celeste))"></span>';
    var isActive = activeId === t.id;
    return '<li class="theme-item' + (isActive ? ' active' : '') + '" role="option" aria-selected="' + isActive + '" onclick="applyCustomTheme(\'' + t.id + '\')">'
      + '<span class="theme-radio"><span class="theme-radio-dot"></span></span>'
      + '<span class="theme-name">' + t.name + '</span>'
      + dotHtml
      + '</li>';
  }).join('');
}

function applyCustomTheme(id) {
  localStorage.setItem('ss_customTheme', id);
  var html = document.documentElement;
  html.removeAttribute('data-theme');
  html.removeAttribute('data-custom-theme'); // remove old attr if present
  var persistedTheme = id;

  if (id === 'default') {
    // Restore to light/dark based on saved mode
    var mode = localStorage.getItem('ss_mode') || 'light';
    html.setAttribute('data-theme', mode === 'dark' ? 'dark' : 'light');
    html.removeAttribute('data-theme-name');
    persistedTheme = mode === 'dark' ? 'dark' : 'light';
  } else {
    html.setAttribute('data-theme', id);
    // Apply current mode
    var mode = localStorage.getItem('ss_mode') || 'light';
    html.setAttribute('data-mode', mode);
  }

  if (typeof appData !== 'undefined') {
    appData.config = appData.config || {};
    appData.config.theme = persistedTheme;
    saveData();
  }

  _renderThemeList();
  // Refresh chart
  var sheet = (typeof getSheet === 'function' && currentSheetId) ? getSheet(currentSheetId) : null;
  if (sheet && typeof radarChartInstance !== 'undefined' && radarChartInstance) {
    if (typeof destruirRadarChart === 'function') destruirRadarChart();
    setTimeout(function() { if (typeof renderRadarChart === 'function') renderRadarChart(sheet); }, 80);
  }
}

(function _initCustomTheme() {
  var saved = localStorage.getItem('ss_customTheme');
  if (saved && saved !== 'default') {
    var html = document.documentElement;
    html.setAttribute('data-theme', saved);
    var mode = localStorage.getItem('ss_mode') || 'light';
    html.setAttribute('data-mode', mode);
  }
})();

// ── Font size ───────────────────────────────────────────────
function setFontSize(size) {
  localStorage.setItem('ss_fontSize', size);
  document.documentElement.style.fontSize = FONT_SIZES[size] || '1rem';
  _syncFontSizeBtns();
}

function _syncFontSizeBtns() {
  var active = localStorage.getItem('ss_fontSize') || 'normal';
  document.querySelectorAll('.font-size-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.size === active);
  });
}

(function _initFontSize() {
  var saved = localStorage.getItem('ss_fontSize') || 'normal';
  document.documentElement.style.fontSize = FONT_SIZES[saved] || '1rem';
})();

// ── High contrast ───────────────────────────────────────────
function toggleHighContrast() {
  var current = localStorage.getItem('ss_highContrast') === 'true';
  var next = !current;
  localStorage.setItem('ss_highContrast', next);
  document.documentElement.setAttribute('data-high-contrast', next);
  _syncToggle('contrastToggle', next);
}

(function _initHighContrast() {
  var saved = localStorage.getItem('ss_highContrast') === 'true';
  document.documentElement.setAttribute('data-high-contrast', saved);
})();

// ── Reduce motion ───────────────────────────────────────────
function toggleReduceMotion() {
  var current = localStorage.getItem('ss_reduceMotion') === 'true';
  var next = !current;
  localStorage.setItem('ss_reduceMotion', next);
  document.documentElement.setAttribute('data-reduce-motion', next);
  _syncToggle('motionToggle', next);
}

(function _initReduceMotion() {
  var saved = localStorage.getItem('ss_reduceMotion') === 'true';
  if (saved) document.documentElement.setAttribute('data-reduce-motion', 'true');
})();

// ── Toggle helper ───────────────────────────────────────────
function _syncToggle(id, value) {
  var el = document.getElementById(id);
  if (el) el.setAttribute('aria-checked', value ? 'true' : 'false');
}

/* ============================================================
   CHARACTER PORTRAIT SYSTEM
   - Auto-crop to 3:4 ratio using canvas
   - localStorage persistence per sheet
   - Decorative frame with theme-aware borders
============================================================ */

function handlePortraitFile(event) {
  var file = event.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      var dataUrl = _cropPortrait(img, 3, 4);
      _setPortraitUI(dataUrl);
      _savePortrait(dataUrl);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  // Reset input so same file can be picked again
  event.target.value = '';
}

function _cropPortrait(img, ratioW, ratioH) {
  var canvas = document.getElementById('portraitCanvas');
  // Target output size
  var outW = 360, outH = Math.round(outW * ratioH / ratioW);
  canvas.width  = outW;
  canvas.height = outH;
  var ctx = canvas.getContext('2d');

  // Source crop: center-fit
  var srcW = img.width, srcH = img.height;
  var targetRatio = ratioW / ratioH;
  var srcRatio = srcW / srcH;
  var cropX, cropY, cropW, cropH;

  if (srcRatio > targetRatio) {
    // Image wider than target: crop sides
    cropH = srcH;
    cropW = srcH * targetRatio;
    cropX = (srcW - cropW) / 2;
    cropY = 0;
  } else {
    // Image taller than target: crop top/bottom — favor upper half (face area)
    cropW = srcW;
    cropH = srcW / targetRatio;
    cropX = 0;
    // Bias toward top 40% of image (portrait/face crops)
    cropY = Math.min(srcH - cropH, (srcH - cropH) * 0.35);
  }

  ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outW, outH);
  return canvas.toDataURL('image/jpeg', 0.88);
}

function _setPortraitUI(dataUrl) {
  var frame  = document.getElementById('portraitFrame');
  var ph     = document.getElementById('portraitPlaceholder');
  var imgEl  = document.getElementById('portraitImg');
  var removeBtn = document.getElementById('portraitRemoveBtn');
  if (!frame) return;
  if (dataUrl) {
    imgEl.src = dataUrl;
    imgEl.style.display = 'block';
    ph.style.display = 'none';
    frame.classList.add('has-image');
    if (removeBtn) removeBtn.style.display = 'flex';
  } else {
    imgEl.src = '';
    imgEl.style.display = 'none';
    ph.style.display = 'flex';
    frame.classList.remove('has-image');
    if (removeBtn) removeBtn.style.display = 'none';
  }
}

function removePortrait(event) {
  if (event) { event.stopPropagation(); event.preventDefault(); }
  _setPortraitUI(null);
  _savePortrait(null);
}

function _savePortrait(dataUrl) {
  if (!currentSheetId) return;
  var key = 'portrait_' + currentSheetId;
  if (dataUrl) {
    try { localStorage.setItem(key, dataUrl); } catch(e) {}
  } else {
    localStorage.removeItem(key);
  }
}

function loadPortrait(sheetId) {
  var key = 'portrait_' + sheetId;
  var saved = localStorage.getItem(key);
  _setPortraitUI(saved || null);
}


