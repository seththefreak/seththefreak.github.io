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

  if (id === 'default') {
    // Restore to light/dark based on saved mode
    var mode = localStorage.getItem('ss_mode') || 'light';
    html.setAttribute('data-theme', mode === 'dark' ? 'dark' : 'light');
    html.removeAttribute('data-theme-name');
  } else {
    html.setAttribute('data-theme', id);
    // Apply current mode
    var mode = localStorage.getItem('ss_mode') || 'light';
    html.setAttribute('data-mode', mode);
    // Update toggle in appData
    if (typeof appData !== 'undefined' && appData.config) {
      appData.config.theme = id;
    }
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

  return `
    <div class="sheet-card" onclick="openSheet('${sheet.id}')">
      <div class="card-header">
        <div class="card-name">${safeName}</div>
        <div class="card-actions" onclick="arguments[0] && arguments[0].stopPropagation()">
          <button class="card-action-btn" onclick="duplicateSheet('${sheet.id}')" title="Duplicar">⧉</button>
          <button class="card-action-btn danger" onclick="openDeleteModal('${sheet.id}')" title="Excluir">✕</button>
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
  currentSheetId = id;
  const sheet = getSheet(id);
  if (!sheet) return;
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
    currentSheetId = null;
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

/* ============================================================
   MODO LEITURA / PREVIEW
============================================================ */
function previewSheet() {
  saveCurrentSheet(true);
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  const content = document.getElementById('readModeContent');
  content.innerHTML = buildReadModeHTML(sheet);
  document.getElementById('readModeOverlay').classList.add('open');
}

function closeReadMode() {
  document.getElementById('readModeOverlay').classList.remove('open');
}
/* ============================================================
   EXPORTAR PDF — corrigido
   Correções:
     1. slotName() agora resolve o equipamento pelo EQUIPAMENTOS_INDEX
        e exibe todos os atributos relevantes (dado, tipoDano, etc.)
     2. A janela de impressão recebe color-scheme correto e a regra
        @media print não sobrescreve mais as cores do tema escolhido
   buildReadModeHTML permanece intacta para o preview overlay.
   buildPrintHTML é a versão self-contained para impressão.
============================================================ */

/* ============================================================
   EXPORTAR PDF — v2 (habilidades corrigidas + suporte a retrato)
============================================================ */

function buildPrintHTML(s, isDark) {

  /* ── PALETA FIXA (sem CSS variables) ──────────────────── */
  const C = isDark ? {
    bg       : '#18111f',
    bgCard   : '#221a30',
    bgCard2  : '#2c2040',
    text     : '#e8e0f8',
    muted    : '#9080b0',
    accent   : '#c0a0f0',
    border   : '#3a2a4a',
    pos      : '#5fc88a',
    neg      : '#e06070',
    zero     : '#7060a0',
    posBg    : '#1a2e22',
    negBg    : '#2e1a20',
    badgeBg  : '#2a1e3a',
    ornament : 'rgba(180,140,255,0.25)',
    resHP    : '#e05070', resMPbg: '#5040a0', resSP: '#40a870', resSAN: '#5090d0',
  } : {
    bg       : '#f8f4ff',
    bgCard   : '#f2ecfc',
    bgCard2  : '#ede5fa',
    text     : '#3d3452',
    muted    : '#9080b0',
    accent   : '#8060b8',
    border   : '#ddd4f0',
    pos      : '#5fa87a',
    neg      : '#c05060',
    zero     : '#a89ec2',
    posBg    : '#d8f4e8',
    negBg    : '#fce8ec',
    badgeBg  : '#e8dff8',
    ornament : 'rgba(160,120,220,0.25)',
    resHP    : '#e05070', resMPbg: '#8060c8', resSP: '#40a870', resSAN: '#5090d0',
  };

  /* ── HELPERS ───────────────────────────────────────────── */
  const esc = str => str
    ? String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
    : '';

  const section = (title, icon, body) => `
    <div style="background:${C.bgCard};border:1px solid ${C.border};border-radius:10px;
                padding:20px 22px;margin-bottom:18px;page-break-inside:avoid;">
      <div style="font-family:'Playfair Display',serif;font-size:1rem;font-weight:700;
                  color:${C.accent};margin-bottom:14px;padding-bottom:8px;
                  border-bottom:1px solid ${C.border};display:flex;align-items:center;gap:8px;">
        <span>${icon}</span> ${title}
      </div>
      ${body}
    </div>`;

  const pill = (label, bg, color) =>
    `<span style="display:inline-block;padding:2px 11px;border-radius:20px;font-size:0.68rem;
                  font-weight:700;text-transform:uppercase;letter-spacing:0.05em;
                  background:${bg};color:${color};">${esc(label)}</span>`;

  const listBlock = (arr, fallback = '') => {
    const items = (arr || []).filter(x => x);
    if (!items.length) return fallback;
    return `<ul style="list-style:none;padding:0;margin:0;">${
      items.map(x => `<li style="padding:4px 0 4px 16px;position:relative;font-size:0.85rem;
                                  color:${C.muted};line-height:1.6;">
        <span style="position:absolute;left:0;top:8px;color:${C.border};font-size:0.5rem;">◆</span>
        ${esc(x)}</li>`).join('')
    }</ul>`;
  };

  /* ── INDEX DE HABILIDADES ──────────────────────────────── */
  /*
   * Varre todo o RACES_DB e monta um Map<id → objeto> cobrindo:
   *   - race.habilidades[]            (habilidades base da raça)
   *   - race.progressao.nucleo[]      (habilidades de núcleo)
   *   - race.progressao.caminhos[].habilidades[]  (caminhos)
   *
   * Isso resolve o bug em que progressaoAtiva continha apenas IDs
   * (ex: "hum_n1") e a impressão mostrava o ID bruto em vez do
   * nome/tipo/descrição reais da habilidade.
   */
  const buildHabIndex = () => {
    const map = new Map();
    if (typeof RACES_DB === 'undefined') return map;
    for (const race of RACES_DB) {
      for (const h of (race.habilidades || [])) {
        map.set(h.id, h);
      }
      const prog = race.progressao || {};
      for (const h of (prog.nucleo || [])) {
        map.set(h.id, h);
      }
      for (const cam of (prog.caminhos || [])) {
        for (const h of (cam.habilidades || [])) {
          map.set(h.id, h);
        }
      }
    }
    return map;
  };
  const HAB_INDEX = buildHabIndex();

  /* ── DADOS DO SHEET ────────────────────────────────────── */
  const attrs   = s.atributos || {};
  const modos   = s.modos || {};
  const rec     = s._recAtual || { HP: '—', MP: '—', SP: '—', SAN: '—' };
  const cart    = s.carteira  || { cobre: 0, prata: 0, ouro: 0, platina: 0 };
  const equip   = s.equipamento || {};
  const inv     = (s.inventario || []).filter(x => x);
  const pericias = s.pericias || {};
  const habs    = (s.progressaoAtiva || []).filter(x => x);
  const portrait = s.portrait || s.portraitData || s.avatarUrl || null;
  const bg      = {
    origem    : s.bgOrigem     || '',
    memoria   : s.bgMemoria    || '',
    objetivo  : s.bgObjetivo   || '',
    motivacao : s.bgMotivacao  || '',
    valores   : s.bgValores    || '',
  };

  /* ── BADGES DE CABEÇALHO ───────────────────────────────── */
  const classColors = {
    base       : { bg: C.badgeBg,   color: C.accent },
    celestial  : { bg: '#daeeff',   color: '#5a90c8' },
    excentrica : { bg: '#fce8f0',   color: '#c07898' },
    eccentrica : { bg: '#fce8f0',   color: '#c07898' },
    default    : { bg: C.badgeBg,   color: C.accent },
  };
  const classKey = (s.classificacao || 'base').toLowerCase();
  const classCfg = classColors[classKey] || classColors.default;

  const tipoMap = { preset: 'Preset Racial', npc: 'NPC', jogador: 'Jogador' };
  const tipoLabel = tipoMap[s.tipo] || 'Jogador';
  const tipoColors = {
    preset : { bg: '#e8dff8', color: '#8060b8' },
    npc    : { bg: '#f0deb0', color: '#987040' },
    jogador: { bg: '#d8f4ec', color: '#5f9e80' },
  };
  const tipoCfg = tipoColors[s.tipo] || tipoColors.jogador;

  /* ── RECURSOS ──────────────────────────────────────────── */
  let recMaxes = { HP: '?', MP: '?', SP: '?', SAN: '?' };
  try { recMaxes = calcRecursos(s); } catch(e) {}

  const resMeta = [
    { key: 'HP',  icon: '❤',  label: 'HP',  sub: 'Vida',     cor: '#e05070' },
    { key: 'MP',  icon: '💜', label: 'MP',  sub: 'Mana',     cor: '#8060c8' },
    { key: 'SP',  icon: '💚', label: 'SP',  sub: 'Estamina', cor: '#40a870' },
    { key: 'SAN', icon: '🔵', label: 'SAN', sub: 'Sanidade', cor: '#5090d0' },
  ];
  const recursosHTML = `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">
      ${resMeta.map(m => `
        <div style="background:${C.bgCard2};border:1px solid ${C.border};border-radius:8px;
                    padding:10px 8px;text-align:center;">
          <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;
                      color:${m.cor};margin-bottom:4px;">${m.icon} ${m.sub}</div>
          <div style="font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700;color:${m.cor};">
            ${rec[m.key] ?? '—'}
          </div>
          <div style="font-size:0.65rem;color:${C.muted};margin-top:2px;">/ ${recMaxes[m.key] ?? '—'} max</div>
        </div>`).join('')}
    </div>`;

  /* ── ATRIBUTOS ─────────────────────────────────────────── */
  const ATTRS_GROUPS_LOCAL = [
    ['FOR','CON','AGI','DES','VIDA','DEF'],
    ['INT','SAB','VON','CAR','PER'],
    ['MAG','RESM','ATQ']
  ];
  const ATTR_LABELS_LOCAL = {
    FOR:'Força', CON:'Constituição', AGI:'Agilidade', DES:'Destreza',
    VIDA:'Vida', DEF:'Defesa', INT:'Inteligência', SAB:'Sabedoria',
    VON:'Vontade', CAR:'Carisma', PER:'Percepção',
    MAG:'Magia', RESM:'Res.Mág', ATQ:'Ataque'
  };
  const attrCard = (key) => {
    const v   = attrs[key] ?? 0;
    const col = v > 0 ? C.pos : v < 0 ? C.neg : C.zero;
    const disp = v > 0 ? `+${v}` : String(v);
    return `
      <div style="text-align:center;background:${C.bgCard2};border-radius:8px;padding:8px 4px;">
        <div style="font-size:0.58rem;font-weight:700;text-transform:uppercase;
                    letter-spacing:0.07em;color:${C.muted};margin-bottom:3px;">${ATTR_LABELS_LOCAL[key]||key}</div>
        <div style="font-family:'Playfair Display',serif;font-size:1.25rem;
                    font-weight:700;color:${col};">${disp}</div>
      </div>`;
  };

  const atributosHTML = ATTRS_GROUPS_LOCAL.map((group, gi) => {
    const groupLabels = ['Físicos', 'Mentais', 'Combate'];
    return `
      <div style="margin-bottom:12px;">
        <div style="font-size:0.62rem;font-weight:700;text-transform:uppercase;letter-spacing:0.09em;
                    color:${C.muted};margin-bottom:6px;">${groupLabels[gi]}</div>
        <div style="display:grid;grid-template-columns:repeat(${group.length},1fr);gap:6px;">
          ${group.map(attrCard).join('')}
        </div>
      </div>`;
  }).join('');

  const picoFraqueza = (s.picoPrincipal || s.fraquezaEstrutural) ? `
    <div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap;">
      ${s.picoPrincipal ? `
        <div style="background:${C.posBg};border-radius:6px;padding:8px 14px;font-size:0.82rem;">
          <span style="color:${C.pos};font-weight:700;">▲ Pico:</span> ${esc(s.picoPrincipal)}
        </div>` : ''}
      ${s.fraquezaEstrutural ? `
        <div style="background:${C.negBg};border-radius:6px;padding:8px 14px;font-size:0.82rem;">
          <span style="color:${C.neg};font-weight:700;">▼ Fraqueza:</span> ${esc(s.fraquezaEstrutural)}
        </div>` : ''}
    </div>` : '';

  /* ── MODOS ─────────────────────────────────────────────── */
  const modesVals = Object.values(modos);
  const maxM = modesVals.length ? Math.max(...modesVals) : 0;
  const modosHTML = Object.entries(modos).map(([k, v]) => {
    const isDom = v === maxM && v > 1;
    return `<div style="padding:6px 14px;border-radius:6px;font-size:0.82rem;
                         background:${isDom ? C.accent : C.bgCard2};
                         color:${isDom ? (isDark ? '#18111f' : '#fff') : C.text};
                         font-weight:${isDom ? '700' : '400'};">
      ${esc(k)}: <strong>${v}</strong>
    </div>`;
  }).join('');

  /* ── PERÍCIAS ──────────────────────────────────────────── */
  const periciasFiltradas = Object.entries(pericias).filter(([, v]) => v !== 0);
  const periciasHTML = periciasFiltradas.length
    ? `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
        ${periciasFiltradas.map(([k, v]) => `
          <div style="display:flex;justify-content:space-between;align-items:center;
                      background:${C.bgCard2};border-radius:6px;padding:6px 10px;">
            <span style="font-size:0.78rem;color:${C.muted};">${esc(k)}</span>
            <span style="font-size:0.88rem;font-weight:700;
                         color:${v > 0 ? C.pos : C.neg};">${v > 0 ? '+' : ''}${v}</span>
          </div>`).join('')}
       </div>`
    : `<p style="font-size:0.82rem;color:${C.muted};font-style:italic;">Nenhuma perícia treinada.</p>`;

  /* ── HABILIDADES (CORRIGIDO) ───────────────────────────── */
  /*
   * Agora resolve cada ID via HAB_INDEX para exibir nome, tipo e
   * descrição reais. IDs não encontrados no DB (ex: habilidades
   * customizadas) caem num fallback de pílula com o ID cru.
   */
  const HAB_TIPO_COLOR = {
    passiva    : isDark ? '#9070d0' : '#8060b8',
    ativa      : isDark ? '#5090d0' : '#4070c0',
    progressao : isDark ? '#40a870' : '#2e8a5a',
    negativa   : isDark ? '#e06070' : '#c05060',
  };

  const habsHTML = habs.length
    ? `<div style="display:flex;flex-direction:column;gap:8px;">
        ${habs.map(id => {
          const h = HAB_INDEX.get(id);

          /* ID não encontrado → pílula de fallback */
          if (!h) {
            return `<span style="display:inline-block;padding:5px 12px;border-radius:20px;
                                 font-size:0.78rem;font-family:'IBM Plex Mono',monospace;
                                 background:${C.bgCard2};border:1px solid ${C.border};
                                 color:${C.muted};font-style:italic;">${esc(id)}</span>`;
          }

          const tipoCor = HAB_TIPO_COLOR[h.tipo] || C.muted;

          return `
            <div style="background:${C.bgCard2};border:1px solid ${C.border};border-radius:8px;
                        padding:10px 14px;position:relative;overflow:hidden;">
              <div style="position:absolute;left:0;top:0;bottom:0;width:3px;
                          background:${tipoCor};border-radius:2px 0 0 2px;"></div>
              <div style="padding-left:12px;">
                <div style="display:flex;align-items:center;gap:7px;margin-bottom:4px;flex-wrap:wrap;">
                  <span style="font-weight:700;font-size:0.88rem;color:${C.text};">${esc(h.nome)}</span>
                  ${h.tipo ? `<span style="font-size:0.6rem;font-weight:700;text-transform:uppercase;
                                           letter-spacing:0.06em;padding:1px 7px;border-radius:10px;
                                           background:${tipoCor}22;color:${tipoCor};">${esc(h.tipo)}</span>` : ''}
                </div>
                ${h.req ? `<div style="font-size:0.7rem;color:${C.accent};font-style:italic;margin-bottom:5px;">
                              Req: ${esc(h.req)}</div>` : ''}
                <div style="font-size:0.8rem;color:${C.muted};line-height:1.55;">${esc(h.desc || '')}</div>
                ${h.efeito && h.efeito.condicional ? `
                  <div style="margin-top:5px;font-size:0.7rem;color:${tipoCor};font-style:italic;">
                    ⚡ ${esc(h.efeito.condicional)}
                  </div>` : ''}
              </div>
            </div>`;
        }).join('')}
       </div>`
    : `<p style="font-size:0.82rem;color:${C.muted};font-style:italic;">Nenhuma habilidade adquirida.</p>`;

  /* ── EQUIPAMENTOS ──────────────────────────────────────── */
  const resolveEquip = (slot) => {
    if (!slot) return null;
    if (typeof slot === 'string') {
      return (typeof EQUIPAMENTOS_INDEX !== 'undefined' && EQUIPAMENTOS_INDEX.get(slot)) || { nome: slot };
    }
    if (slot.id && typeof EQUIPAMENTOS_INDEX !== 'undefined') {
      const fromDB = EQUIPAMENTOS_INDEX.get(slot.id);
      return fromDB ? { ...fromDB, ...slot } : slot;
    }
    return slot;
  };

  const slotCard = (obj, label, icon) => {
    if (!obj) {
      return `
        <div style="background:${C.bgCard2};border-radius:8px;padding:10px 12px;">
          <div style="font-size:0.62rem;font-weight:700;text-transform:uppercase;
                      color:${C.muted};margin-bottom:6px;">${icon} ${label}</div>
          <span style="color:${C.muted};font-style:italic;font-size:0.82rem;">— vazio —</span>
        </div>`;
    }

    const nome = esc(obj.nome || obj.id || '?');
    const detailRow = (lbl, val) => val != null && val !== ''
      ? `<div style="display:flex;gap:4px;align-items:baseline;font-size:0.73rem;margin-top:3px;">
           <span style="color:${C.muted};min-width:72px;">${lbl}</span>
           <span style="color:${C.text};font-weight:600;">${esc(String(val))}</span>
         </div>`
      : '';

    let details = '';
    const tipo = obj.tipo || '';

    if (tipo === 'arma') {
      details = [
        detailRow('Dano',        obj.dado),
        detailRow('Tipo',        obj.tipoDano),
        detailRow('Empunhadura', obj.empunhadura),
        detailRow('Alcance',     obj.alcance),
        detailRow('Ação',        obj.acao),
        obj.penalidade  ? detailRow('Penalidade',  obj.penalidade)  : '',
        obj.bonus       ? detailRow('Bônus',       obj.bonus)       : '',
        obj.critico     ? detailRow('Crítico',     obj.critico)     : '',
        obj.aspectos    ? detailRow('Aspectos',    obj.aspectos)    : '',
        obj.requisitos  ? detailRow('Requisitos',  Object.entries(obj.requisitos).map(([k,v])=>`${k} ${v>=0?'+':''}${v}`).join(', ')) : '',
      ].join('');
    } else if (tipo === 'armadura') {
      details = [
        detailRow('RD',          obj.rd),
        detailRow('CA',          obj.ca),
        detailRow('Res. Mágica', obj.rm  || null),
        obj.penalidade  ? detailRow('Penalidade',  obj.penalidade)  : '',
        detailRow('Peso',        obj.peso != null ? `${obj.peso} kg` : null),
      ].join('');
    } else if (tipo === 'escudo') {
      details = [
        detailRow('Defesa',       obj.defesa),
        detailRow('Durabilidade', obj.durabilidade),
        obj.penalidade  ? detailRow('Penalidade', obj.penalidade)  : '',
        detailRow('Peso',         obj.peso != null ? `${obj.peso} kg` : null),
      ].join('');
    } else {
      details = [
        detailRow('Tipo', obj.categoria || obj.subtipo || null),
        detailRow('Peso', obj.peso != null ? `${obj.peso} kg` : null),
      ].join('');
    }

    return `
      <div style="background:${C.bgCard2};border-radius:8px;padding:10px 12px;">
        <div style="font-size:0.62rem;font-weight:700;text-transform:uppercase;
                    color:${C.muted};margin-bottom:6px;">${icon} ${label}</div>
        <div style="font-weight:700;color:${C.text};font-size:0.88rem;margin-bottom:4px;">${nome}</div>
        ${details
          ? `<div style="border-top:1px solid ${C.border};margin-top:6px;padding-top:6px;">${details}</div>`
          : ''}
      </div>`;
  };

  const maoEsq  = resolveEquip(equip.maoEsquerda);
  const maoDir  = resolveEquip(equip.maoDireita);
  const armadura = resolveEquip(equip.armadura);

  const equipHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
      ${slotCard(maoEsq,  'Mão Esq.',  '🗡')}
      ${slotCard(maoDir,  'Mão Dir.',  '⚔')}
      ${slotCard(armadura,'Armadura',  '🛡')}
    </div>`;

  /* ── INVENTÁRIO ─────────────────────────────────────────── */
  const invHTML = inv.length
    ? `<table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
        <thead>
          <tr style="border-bottom:1px solid ${C.border};">
            <th style="text-align:left;padding:4px 8px;color:${C.muted};font-weight:700;font-size:0.65rem;text-transform:uppercase;">Item</th>
            <th style="text-align:center;padding:4px 8px;color:${C.muted};font-weight:700;font-size:0.65rem;text-transform:uppercase;">Qtd</th>
            <th style="text-align:center;padding:4px 8px;color:${C.muted};font-weight:700;font-size:0.65rem;text-transform:uppercase;">Peso</th>
          </tr>
        </thead>
        <tbody>
          ${inv.map((item, i) => `
            <tr style="background:${i % 2 === 0 ? 'transparent' : C.bgCard2};">
              <td style="padding:5px 8px;color:${C.text};">${esc(item.nome || item.id || '?')}</td>
              <td style="padding:5px 8px;text-align:center;color:${C.muted};">${item.quantidade ?? 1}</td>
              <td style="padding:5px 8px;text-align:center;color:${C.muted};">${item.peso ?? '—'}</td>
            </tr>`).join('')}
        </tbody>
      </table>`
    : `<p style="font-size:0.82rem;color:${C.muted};font-style:italic;">Inventário vazio.</p>`;

  /* ── CARTEIRA ───────────────────────────────────────────── */
  const moedaChip = (label, valor, cor) =>
    `<div style="text-align:center;background:${C.bgCard2};border-radius:8px;padding:8px 12px;min-width:60px;">
      <div style="font-size:0.6rem;font-weight:700;text-transform:uppercase;color:${cor};margin-bottom:3px;">${label}</div>
      <div style="font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;color:${C.text};">${valor}</div>
    </div>`;

  const carteiraHTML = `
    <div style="display:flex;gap:10px;flex-wrap:wrap;">
      ${moedaChip('Cobre',   cart.cobre   || 0, '#b87040')}
      ${moedaChip('Prata',   cart.prata   || 0, '#9090b0')}
      ${moedaChip('Ouro',    cart.ouro    || 0, '#c0a020')}
      ${moedaChip('Platina', cart.platina || 0, '#80c0d0')}
    </div>`;

  /* ── BACKGROUND ─────────────────────────────────────────── */
  const bgRow = (label, val) => val
    ? `<div style="margin-bottom:10px;">
        <div style="font-size:0.62rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;
                    color:${C.accent};margin-bottom:4px;">${label}</div>
        <div style="font-size:0.85rem;color:${C.muted};line-height:1.6;padding:8px 12px;
                    background:${C.bgCard2};border-radius:6px;border-left:3px solid ${C.accent};">
          ${esc(val)}
        </div>
       </div>`
    : '';

  const backgroundHTML = [
    bgRow('Origem',    bg.origem),
    bgRow('Memória',   bg.memoria),
    bgRow('Objetivo',  bg.objetivo),
    bgRow('Motivação', bg.motivacao),
    bgRow('Valores',   bg.valores),
    s.impeto ? `<div style="margin-top:8px;display:flex;align-items:center;gap:8px;">
      <span style="font-size:0.62rem;font-weight:700;text-transform:uppercase;color:${C.accent};">Ímpeto</span>
      <span style="font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;color:${C.pos};">${s.impeto}</span>
    </div>` : '',
  ].join('');

  const hasBg = Object.values(bg).some(v => v) || s.impeto;

  /* ── BADGE RAÇA ─────────────────────────────────────────── */
  const raceBadges = [
    s.raceSelecionada     ? pill(s.raceSelecionada,     '#e0d4f8', C.accent)   : '',
    s.subraçaSelecionada  ? pill(s.subraçaSelecionada,  '#d4eef8', '#5a90c8')  : '',
    s.modificador         ? pill(s.modificador === 'Aika' ? '💠 Aika' : '🔶 Ukya', '#ffe8cc', '#987040') : '',
  ].filter(Boolean).join(' ');

  /* ── MONTAGEM FINAL ─────────────────────────────────────── */
  return `
    <!-- ORNAMENTO -->
    <div style="text-align:center;letter-spacing:0.4em;color:${C.ornament};font-size:1.1rem;margin-bottom:10px;">✦ ❧ ✦</div>

    <!-- CABEÇALHO (com retrato opcional) -->
    <div style="margin-bottom:20px;">

      ${portrait ? `
        <div style="float:right;margin:0 0 16px 20px;">
          <div style="width:110px;height:147px;border-radius:8px;overflow:hidden;
                      border:2px solid ${C.border};box-shadow:0 4px 16px rgba(0,0,0,0.25);">
            <img src="${portrait}"
                 style="width:100%;height:100%;object-fit:cover;display:block;"
                 alt="Retrato de ${esc(s.name || '')}"/>
          </div>
        </div>` : ''}

      <h1 style="font-family:'Playfair Display',serif;font-size:2.2rem;font-weight:700;
                  color:${C.accent};margin:0 0 8px;">
        ${esc(s.name || 'Ficha sem nome')}
      </h1>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
        ${pill(s.classificacao || 'Base', classCfg.bg, classCfg.color)}
        ${pill(`Nível ${s.nivel || 1}`, C.badgeBg, C.accent)}
        ${pill(tipoLabel, tipoCfg.bg, tipoCfg.color)}
      </div>
      ${raceBadges ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">${raceBadges}</div>` : ''}
      ${s.conceitoNarrativo
        ? `<p style="font-style:italic;color:${C.muted};font-size:0.9rem;line-height:1.7;
                     margin:10px 0 0;padding:10px 14px;background:${C.bgCard};border-radius:8px;
                     border-left:3px solid ${C.accent};">${esc(s.conceitoNarrativo)}</p>`
        : ''}

      ${portrait ? '<div style="clear:both;"></div>' : ''}
    </div>

    <div style="border-top:1px solid ${C.border};margin-bottom:18px;
                text-align:center;padding-top:10px;color:${C.ornament};letter-spacing:0.3em;">· · ·</div>

    <!-- RECURSOS -->
    ${section('Recursos', '⚡', recursosHTML)}

    <!-- ATRIBUTOS -->
    ${section('Atributos Base', '⚔', atributosHTML + picoFraqueza)}

    <!-- MODOS -->
    ${section('Modos Narrativos', '🎭',
      `<div style="display:flex;gap:8px;flex-wrap:wrap;">${modosHTML}</div>`)}

    <!-- PERÍCIAS -->
    ${section('Perícias', '📖', periciasHTML)}

    <!-- HABILIDADES -->
    ${section('Habilidades Adquiridas', '✨', habsHTML)}

    <!-- TRAÇOS / VANTAGENS / VULNERAB. -->
    ${(s.tracos?.some(x=>x) || s.vantagens?.some(x=>x) || s.vulnerabilidades?.some(x=>x))
      ? section('Características', '🧬', `
          ${s.tracos?.some(x=>x) ? `
            <div style="margin-bottom:12px;">
              <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;
                          color:${C.accent};margin-bottom:6px;">Traços Fixos</div>
              ${listBlock(s.tracos)}
            </div>` : ''}
          ${s.vantagens?.some(x=>x) ? `
            <div style="margin-bottom:12px;">
              <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;
                          color:${C.pos};margin-bottom:6px;">▲ Vantagens Situacionais</div>
              ${listBlock(s.vantagens)}
            </div>` : ''}
          ${s.vulnerabilidades?.some(x=>x) ? `
            <div>
              <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;
                          color:${C.neg};margin-bottom:6px;">▼ Vulnerabilidades Naturais</div>
              ${listBlock(s.vulnerabilidades)}
            </div>` : ''}`)
      : ''}

    <!-- ARQUÉTIPO / CUSTO -->
    ${(s.arquetipo || s.custoNarrativo) ? section('Perfil Narrativo', '📜', `
      ${s.arquetipo ? `
        <div style="margin-bottom:10px;">
          <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;color:${C.muted};margin-bottom:4px;">Arquétipo Natural</div>
          <div style="font-size:0.85rem;color:${C.muted};">${esc(s.arquetipo)}</div>
        </div>` : ''}
      ${s.custoNarrativo ? `
        <div>
          <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;color:${C.muted};margin-bottom:4px;">Custo Narrativo</div>
          <div style="font-size:0.85rem;color:${C.muted};">${esc(s.custoNarrativo)}</div>
        </div>` : ''}
    `) : ''}

    <!-- EQUIPAMENTOS -->
    ${section('Equipamentos', '⚔', equipHTML)}

    <!-- INVENTÁRIO -->
    ${section('Inventário', '🎒', invHTML)}

    <!-- CARTEIRA -->
    ${section('Carteira', '💰', carteiraHTML)}

    <!-- BACKGROUND -->
    ${hasBg ? section('Background do Personagem', '📖', backgroundHTML) : ''}

    <!-- RODAPÉ -->
    <div style="text-align:center;letter-spacing:0.4em;color:${C.ornament};font-size:1.1rem;margin-top:10px;">✦ ❧ ✦</div>
    <div style="text-align:center;font-size:0.62rem;color:${C.ornament};margin-top:6px;font-family:'IBM Plex Mono',monospace;">
      Verloren RPG Sheets · ${esc(s.name || '')} · Nível ${s.nivel || 1}
    </div>
  `;
}

/* ============================================================
   EXPORTAR PDF
============================================================ */
function exportSheetPDF() {
  saveCurrentSheet(true);
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;

  const isDark = getDarkModeState();
  const bg     = isDark ? '#18111f' : '#f8f4ff';
  const text   = isDark ? '#e8e0f8' : '#3d3452';

  const colorSchemeMeta = isDark ? 'dark' : 'light';
  const colorSchemeCSS  = isDark ? 'dark'  : 'light';

  const html = `<!DOCTYPE html>
<html data-theme="${isDark ? 'dark' : 'light'}">
<head>
<meta charset="UTF-8"/>
<meta name="color-scheme" content="${colorSchemeMeta}"/>
<title>${(sheet.name || 'Ficha').replace(/</g,'&lt;')} — Verloren RPG Sheets</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet"/>
<style>
  :root { color-scheme: ${colorSchemeCSS}; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Merriweather', serif;
    background: ${bg} !important;
    color: ${text} !important;
    padding: 32px 40px;
    max-width: 780px;
    margin: 0 auto;
    font-size: 14px;
    line-height: 1.5;
  }
  @media print {
    html, body {
      -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
      background: ${bg} !important;
      color: ${text} !important;
    }
    body { padding: 16px 24px; }
    @page { margin: 12mm 14mm; }
  }
</style>
</head>
<body data-theme="${isDark ? 'dark' : 'light'}">
${buildPrintHTML(sheet, isDark)}
<script>
  document.fonts.ready.then(() => { window.print(); });
<\/script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) {
    toast('Pop-up bloqueado pelo navegador. Permita pop-ups para exportar o PDF.', 'error');
    return;
  }
  win.document.write(html);
  win.document.close();
  toast('PDF aberto para impressão!', 'success');
}

/* ============================================================
   EXPORTAR PNG
============================================================ */
function exportSheetPNG() {
  saveCurrentSheet(true);
  previewSheet(); // abre o preview
  setTimeout(() => {
    toast('Use a captura de tela do navegador ou Ctrl+P → Salvar como PDF para exportar a imagem.', 'info');
  }, 500);
}

/* ============================================================
   MODAIS
============================================================ */
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// Fechar modal ao clicar fora — registrado via delegação no document para garantir que o DOM está pronto
function initModalClickOutside() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
}

/* ============================================================
   TOAST
============================================================ */
function toast(msg, type = 'info') {
  const icons = { success: '✓', error: '✕', info: 'ℹ', warn: '⚠' };
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]}</span> ${msg}`;
  container.appendChild(el);
  setTimeout(() => {
    el.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

/* ============================================================
   UTILITÁRIOS
============================================================ */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

/* ============================================================
   FASE 3 — SISTEMA DE EQUIPAMENTOS & INVENTÁRIO
============================================================ */

// ---- BASE DE DADOS DE EQUIPAMENTOS ----
let slotAtualSeletor = null;

// ---- MOEDAS ----
function salvarMoedas(valor) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  sheet.moedas = parseInt(valor) || 0;
  // sync carteira prata
  if (!sheet.carteira) sheet.carteira = { cobre:0, prata:0, ouro:0, platina:0 };
  sheet.carteira.prata = sheet.moedas;
  debounceSave();
}

function salvarMoedaEspecifica(tipo, valor) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  if (!sheet.carteira) sheet.carteira = { cobre:0, prata:0, ouro:0, platina:0 };
  sheet.carteira[tipo] = parseInt(valor) || 0;
  // keep moedas (prata) in sync
  sheet.moedas = sheet.carteira.prata || 0;
  const moedasEl = document.getElementById('moedasInput');
  if (moedasEl) moedasEl.value = sheet.moedas;
  debounceSave();
}

function converterMoedas() {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  if (!sheet.carteira) sheet.carteira = { cobre:0, prata:0, ouro:0, platina:0 };
  let { cobre, prata, ouro, platina } = sheet.carteira;
  // 100 cobre = 1 prata
  const cobreExcesso = Math.floor(cobre / 100);
  cobre = cobre % 100;
  prata += cobreExcesso;
  // 10 prata = 1 ouro
  const pratoExcesso = Math.floor(prata / 10);
  prata = prata % 10;
  ouro += pratoExcesso;
  // 10 ouro = 1 platina
  const ouroExcesso = Math.floor(ouro / 10);
  ouro = ouro % 10;
  platina += ouroExcesso;
  sheet.carteira = { cobre, prata, ouro, platina };
  sheet.moedas = prata;
  renderCarteiraUI(sheet);
  debounceSave();
  toast('Moedas convertidas! ⇅', 'success');
}

function renderCarteiraUI(sheet) {
  const c = sheet.carteira || { cobre:0, prata:0, ouro:0, platina:0 };
  const elC = document.getElementById('carteiraCobre');
  const elP = document.getElementById('carteiraPrata');
  const elO = document.getElementById('carteiraOuro');
  const elPt = document.getElementById('carteiraPlatina');
  if (elC)  elC.value  = c.cobre   || 0;
  if (elP)  elP.value  = c.prata   || 0;
  if (elO)  elO.value  = c.ouro    || 0;
  if (elPt) elPt.value = c.platina || 0;
  const moedasEl = document.getElementById('moedasInput');
  if (moedasEl) moedasEl.value = c.prata || 0;
}

// ── SISTEMA MONETÁRIO EXPANDIDO ────────────────────────────
const RAR_COLORS = ['#9ba8b0','#6ab87a','#6aace0','#b86ad8','#e09040','#e04050','#e0b020'];
const RAR_LABELS = ['Comum','Incomum','Raro','Épico','Lendário','Mítico','Único'];

let _lojaTab = 'todos';

function setLojaTab(tab) {
  _lojaTab = tab;
  document.querySelectorAll('.loja-tab').forEach(t => t.classList.remove('active'));
  const tabs = document.querySelectorAll('.loja-tab');
  const tabMap = ['todos','arma','armadura','escudo','pocao','elixir','util','material','comida'];
  const idx = tabMap.indexOf(tab);
  if (tabs[idx]) tabs[idx].classList.add('active');
  filtrarLoja();
}

function filtrarLoja() {
  const q = document.getElementById('lojaSearch')?.value || '';
  const grid = document.getElementById('lojaGrid');
  if (!grid) return;

  // Juntar todos os itens compráveis
  const equipItens = TODOS_EQUIPAMENTOS.map(e => ({ ...e, subtipo: e.tipo, icone: e.tipo === 'arma' ? '⚔️' : e.tipo === 'armadura' ? '🛡️' : '🔰', efeito: buildEquipEfeito(e) }));
  const todos = [...equipItens, ...CONSUMIVEIS_DB, ...MATERIAIS_DB];

  const filtrados = todos.filter(i => {
    const tipo = i.tipo || '';
    const matchTab = _lojaTab === 'todos' || tipo === _lojaTab || i.subtipo === _lojaTab;
    const matchQ = !q || includesNormalized(i.nome, q) || includesNormalized(i.efeito, q) || includesNormalized(i.desc, q);
    return matchTab && matchQ;
  });

  if (!filtrados.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:24px;">Nenhum item encontrado.</div>';
    return;
  }

  grid.innerHTML = filtrados.map(item => {
    const rar = item.rar !== undefined ? item.rar : 0;
    const rarC = RAR_COLORS[rar] || RAR_COLORS[0];
    const rarL = RAR_LABELS[rar] || 'Comum';
    const icone = item.icone || '📦';
    const efeito = item.efeito || item.desc || '—';
    const preco = item.preco || 0;
    const peso = item.peso !== undefined ? item.peso + 'kg' : '—';
    const idSeguro = (item.id||'').replace(/['"]/g, '');
    return `<div class="loja-card">
      <div class="loja-card-top">
        <span class="loja-icone">${icone}</span>
        <span class="loja-nome">${escapeHtml(item.nome)}</span>
        <span class="loja-rar" style="background:${rarC}22;color:${rarC};border:1px solid ${rarC}55;">${rarL}</span>
      </div>
      <div class="loja-efeito">${escapeHtml(efeito)}</div>
      <div class="loja-footer">
        <span class="loja-preco">💰 ${preco}P</span>
        <span class="loja-peso">⚖️ ${peso}</span>
        <button class="loja-comprar" onclick="comprarItem('${idSeguro}')">Comprar</button>
      </div>
    </div>`;
  }).join('');
}

function buildEquipEfeito(e) {
  if (e.tipo === 'arma')    return `Dano: ${e.dado||'—'} ${e.tipoDano||''} | Empun: ${e.empunhadura||'—'} | Crítico: ${e.critico||'—'}`;
  if (e.tipo === 'armadura') return `RD: ${e.rd} | CA: ${e.ca} | RM: ${e.rm} | Penalidade: ${e.penalidade}`;
  if (e.tipo === 'escudo')  return `Defesa: +${e.defesa} | Durabilidade: ${e.durabilidade} | Penalidade: ${e.penalidade}`;
  return '—';
}

function comprarItem(itemId) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) { toast('Nenhuma ficha ativa!', 'error'); return; }

  // Verifica se é equipamento
  const equip = EQUIPAMENTOS_INDEX.get(itemId);
  const consumivel = CONSUMIVEIS_INDEX.get(itemId);
  const material = MATERIAIS_INDEX.get(itemId);
  const item = equip || consumivel || material;
  if (!item) { toast('Item não encontrado!', 'error'); return; }

  const preco = item.preco || 0;
  if (!sheet.carteira) sheet.carteira = { cobre:0, prata: sheet.moedas||0, ouro:0, platina:0 };
  const prataDispo = sheet.carteira.prata || 0;
  if (prataDispo < preco) {
    toast(`Prata insuficiente! Você tem ${prataDispo}P, precisa de ${preco}P`, 'error');
    return;
  }

  sheet.carteira.prata -= preco;
  sheet.moedas = sheet.carteira.prata;
  renderCarteiraUI(sheet);

  // Adicionar ao inventário
  sheet.inventario = sheet.inventario || [];
  sheet.inventario.push({
    id: 'item_' + generateId(),
    nome: item.nome,
    peso: item.peso || 0,
    quantidade: 1,
    origem: 'loja',
    itemId: itemId
  });

  // Registrar transação
  registrarTransacao(sheet, `Compra: ${item.nome}`, -preco);

  renderInventario(sheet);
  atualizarCarga(sheet);
  renderRecompensas(sheet);
  debounceSave();
  toast(`${item.nome} comprado! −${preco}P`, 'success');
}

function abrirTransacao(tipo) {
  const desc = document.getElementById('transacaoDescInput');
  const valor = document.getElementById('transacaoValorInput');
  const titulo = document.getElementById('transacaoTitulo');
  if (!desc || !valor) { abrirAdicionarRecompensa(); return; }
  if (titulo) titulo.textContent = tipo === 'ganhar' ? '💰 Ganhar Moedas' : '💸 Gastar Moedas';
  desc.value = '';
  valor.value = '100';
  desc.dataset.tipo = tipo;
  openModal('transacaoModal');
  setTimeout(() => desc.focus(), 100);
}

function confirmarTransacao() {
  const desc = document.getElementById('transacaoDescInput');
  const valor = document.getElementById('transacaoValorInput');
  if (!desc || !valor) return;
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;

  const tipo = desc.dataset.tipo || 'ganhar';
  const descricao = desc.value.trim();
  const quantia = parseInt(valor.value) || 0;
  if (!descricao) { toast('Digite a descrição!', 'error'); return; }

  const delta = tipo === 'ganhar' ? quantia : -quantia;
  if (!sheet.carteira) sheet.carteira = { cobre:0, prata:0, ouro:0, platina:0 };
  sheet.carteira.prata = Math.max(0, (sheet.carteira.prata || 0) + delta);
  sheet.moedas = sheet.carteira.prata;

  renderCarteiraUI(sheet);

  registrarTransacao(sheet, descricao, delta);
  renderRecompensas(sheet);
  debounceSave();
  closeModal('transacaoModal');
  toast(tipo === 'ganhar' ? `+${quantia}P ganhos!` : `−${quantia}P gastos!`, 'success');
}

function registrarTransacao(sheet, desc, valor) {
  sheet.recompensas = sheet.recompensas || [];
  sheet.recompensas.unshift({ id: 'tx_' + generateId(), descricao: desc, valor, data: Date.now() });
  // Manter apenas últimas 50
  if (sheet.recompensas.length > 50) sheet.recompensas = sheet.recompensas.slice(0, 50);
}

function limparHistoricoTransacoes() {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  if (!confirm('Limpar todo o histórico de transações?')) return;
  sheet.recompensas = [];
  renderRecompensas(sheet);
  debounceSave();
  toast('Histórico limpo.', 'info');
}

function renderLoja() {
  _lojaTab = 'todos';
  filtrarLoja();
}

// ---- ÍMPETO ----
const IMPETO_TABLE = [0,10,25,45,70,100,140,190,250,320,400,490,590,700,820,950,1090,1240,1400,1600];

const MARCOS = {5:'Desafio',9:'Grande Feito',13:'Determinação',15:'Proeza Épica',17:'Ascensão Lendária',19:'Julgamento',20:'Lenda Viva'};

function salvarImpeto(valor) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  sheet.impeto = parseInt(valor) || 0;
  updateImpetoHint(sheet.nivel || 1, sheet.impeto);
  debounceSave();
}

function updateImpetoHint(nivel, impeto) {
  const hint = document.getElementById('impetoNivelHint');
  const meta = document.getElementById('impetoMeta');
  if (!hint || !meta) return;
  const proximoNivel = nivel + 1;
  if (proximoNivel <= 20) {
    const needed = IMPETO_TABLE[proximoNivel - 1];
    const diff = Math.max(0, needed - impeto);
    hint.textContent = diff === 0 ? '✅ Pronto para avançar de nível!' : `Próximo nível (${proximoNivel}): ${needed} Ímpeto — faltam ${diff}`;
  } else {
    hint.textContent = 'Nível máximo atingido!';
  }
  const marco = MARCOS[nivel];
  meta.innerHTML = marco ? `<span style="color:var(--lavanda-dark);font-weight:700;">✦ Marco: ${marco}</span>` : '';
}

// ---- CARGA ----
function atualizarCarga(sheet) {
  if (!sheet) return;
  // FOR efetivo = base + raceBonus; se Aika, trata como -3 para fins de carga
  const forEfetivo = getAtributoEfetivo(sheet, 'FOR');
  const forCarga = forEfetivo === -Infinity ? -3 : forEfetivo;
  const maxCarga = calcCapacidadeCarga(forCarga);
  const pesoTotal = calcularPesoTotal(sheet);
  const pct = maxCarga > 0 ? Math.min((pesoTotal / maxCarga) * 100, 100) : 100;
  const overloaded = pesoTotal > maxCarga;

  const fill  = document.getElementById('cargaFill');
  const atual = document.getElementById('cargaAtual');
  const maxEl = document.getElementById('cargaMaxima');

  if (fill)  { fill.style.width = pct + '%'; fill.classList.toggle('overload', overloaded); }
  if (atual) atual.textContent = pesoTotal.toFixed(1);
  if (maxEl) maxEl.textContent = maxCarga.toFixed(1);
}

function calcularPesoTotal(sheet) {
  let peso = 0;
  
  // Peso dos equipados
  const equip = sheet.equipamento || {};
  ['maoEsquerda', 'maoDireita', 'armadura'].forEach(slot => {
    const itemId = equip[slot];
    if (!itemId) return;
    if (typeof itemId === 'string' && itemId.endsWith('__bloqueado')) return; // skip marker
    const item = EQUIPAMENTOS_INDEX.get(itemId);
    if (item) peso += item.peso || 0;
  });
  
  // Peso do inventário
  (sheet.inventario || []).forEach(item => {
    peso += (item.peso || 0) * (item.quantidade || 1);
  });
  
  return peso;
}

// ---- EQUIPAMENTOS (SLOTS) ----
function abrirSeletorEquipamento(slotNome) {
  slotAtualSeletor = slotNome;
  const titulos = { maoEsquerda: '🗡️ Mão Esquerda', maoDireita: '🗡️ Mão Direita', armadura: '🛡️ Armadura' };
  const el = document.getElementById('seletorEquipTitulo');
  if (el) el.textContent = 'Escolher: ' + (titulos[slotNome] || slotNome);
  
  // Resetar filtros
  const search = document.getElementById('equipamentoSearch');
  const tipo = document.getElementById('equipamentoTipo');
  if (search) search.value = '';
  if (tipo) {
    if (slotNome === 'armadura') tipo.value = 'armadura';
    else tipo.value = 'arma';
  }
  
  filtrarEquipamentos();
  openModal('seletorEquipamentoModal');
}

function filtrarEquipamentos() {
  const search = document.getElementById('equipamentoSearch')?.value || '';
  const tipo = document.getElementById('equipamentoTipo')?.value || 'todos';
  const sheet = getSheet(currentSheetId);
  
  let items = TODOS_EQUIPAMENTOS.filter(i => {
    if (tipo !== 'todos' && i.tipo !== tipo) return false;
    if (search && !includesNormalized(i.nome, search) && !includesNormalized(i.aspectos, search)) return false;
    return true;
  });
  
  const grid = document.getElementById('equipamentoGrid');
  if (!grid) return;
  
  if (!items.length) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:24px;">Nenhum item encontrado.</p>';
    return;
  }
  
  grid.innerHTML = items.map(item => {
    const tipoCls = { arma: 'equip-tipo-arma', armadura: 'equip-tipo-armadura', escudo: 'equip-tipo-escudo' }[item.tipo] || '';
    let stats = '';
    if (item.tipo === 'arma') {
      const reqStr = item.requisitos ? Object.entries(item.requisitos).map(([k,v]) => `${k} ${v}`).join(', ') : '—';
      stats = `Dano: ${item.dado || '-'} ${item.tipoDano || ''} | Emp: ${item.empunhadura || '—'}<br>Alcance: ${item.alcance || 'Adj'} | Crítico: ${item.critico || '—'}<br>Req: ${reqStr} | ${item.preco}P`;
      if (item.aspectos) stats += `<br><em>${item.aspectos}</em>`;
    }
    if (item.tipo === 'armadura') stats = `RD: ${item.rd} | CA: ${item.ca} | RM: ${item.rm}<br>Penalidade: ${item.penalidade} | Peso: ${item.peso}kg<br>Preço: ${item.preco}P`;
    if (item.tipo === 'escudo')  stats = `Defesa: +${item.defesa} | Dur: ${item.durabilidade}<br>Penalidade: ${item.penalidade} | Peso: ${item.peso}kg<br>Preço: ${item.preco}P`;
    
    return `<div class="equipamento-card" onclick="equiparItem('${slotAtualSeletor}','${item.id}')">
      <div class="equip-card-nome">${escapeHtml(item.nome)}</div>
      <span class="equip-card-tipo ${tipoCls}">${item.tipo}</span>
      <div class="equip-card-stats">${stats}</div>
    </div>`;
  }).join('');
}

function equiparItem(slotNome, itemId) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  sheet.equipamento = sheet.equipamento || { maoEsquerda: null, maoDireita: null, armadura: null };

  const novoItem = EQUIPAMENTOS_INDEX.get(itemId);
  if (!novoItem) return;

  // Two-handed check: empunhadura '2M' locks both hand slots
  const isTwoHanded = novoItem.tipo === 'arma' && novoItem.empunhadura === '2M';
  const isHandSlot = slotNome === 'maoEsquerda' || slotNome === 'maoDireita';

  // If a two-handed weapon is already occupying the other hand slot, block the equip
  if (isHandSlot && !isTwoHanded) {
    const otherSlot = slotNome === 'maoEsquerda' ? 'maoDireita' : 'maoEsquerda';
    const otherItem = sheet.equipamento[otherSlot] ? EQUIPAMENTOS_INDEX.get(sheet.equipamento[otherSlot]) : null;
    if (otherItem && otherItem.empunhadura === '2M') {
      toast('Remova a arma de duas mãos antes de equipar aqui.', 'error');
      return;
    }
  }

  // Se havia item anterior no slot, restitui o preço dele
  const itemAnteriorId = sheet.equipamento[slotNome];
  if (!sheet.carteira) sheet.carteira = { cobre:0, prata: sheet.moedas||0, ouro:0, platina:0 };
  if (itemAnteriorId && itemAnteriorId !== '__locked_2h__') {
    const itemAnterior = EQUIPAMENTOS_INDEX.get(itemAnteriorId);
    if (itemAnterior) { sheet.carteira.prata = (sheet.carteira.prata || 0) + (itemAnterior.preco || 0); sheet.moedas = sheet.carteira.prata; }
  }

  // Se arma de duas mãos: também remove item do outro slot de mão, restitui e trava
  if (isTwoHanded && isHandSlot) {
    const otherSlot = slotNome === 'maoEsquerda' ? 'maoDireita' : 'maoEsquerda';
    const otherItemId = sheet.equipamento[otherSlot];
    if (otherItemId && otherItemId !== '__locked_2h__') {
      const otherItem = EQUIPAMENTOS_INDEX.get(otherItemId);
      if (otherItem) { sheet.carteira.prata = (sheet.carteira.prata || 0) + (otherItem.preco || 0); sheet.moedas = sheet.carteira.prata; }
    }
    // Always lock the other slot when equipping 2H weapon in either hand
    sheet.equipamento[otherSlot] = '__locked_2h__';
  }

  // Deduz preço do novo item
  const preco = novoItem.preco || 0;
  if ((sheet.carteira.prata || 0) < preco) {
    toast(`Prata insuficiente! Faltam ${preco - (sheet.carteira.prata || 0)}P`, 'error');
    return;
  }
  sheet.carteira.prata = (sheet.carteira.prata || 0) - preco;
  sheet.moedas = sheet.carteira.prata;

  sheet.equipamento[slotNome] = itemId;

  // Atualiza UI de moedas
  renderCarteiraUI(sheet);

  renderSlots(sheet);
  atualizarCarga(sheet);
  debounceSave();
  closeModal('seletorEquipamentoModal');
  toast(`${novoItem.nome} equipado! −${preco}P`, 'success');
}

function removerEquipamento(slotNome) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  sheet.equipamento = sheet.equipamento || {};

  // Restitui o preço do item removido
  const itemId = sheet.equipamento[slotNome];
  if (!sheet.carteira) sheet.carteira = { cobre:0, prata: sheet.moedas||0, ouro:0, platina:0 };
  if (itemId && itemId !== '__locked_2h__') {
    const item = EQUIPAMENTOS_INDEX.get(itemId);
    if (item && item.preco) {
      sheet.carteira.prata = (sheet.carteira.prata || 0) + item.preco;
      sheet.moedas = sheet.carteira.prata;
      renderCarteiraUI(sheet);
      toast(`${item.nome} removido. +${item.preco}P restituído.`, 'info');
      // If two-handed, also unlock the other slot
      if (item.empunhadura === '2M') {
        const otherSlot = slotNome === 'maoEsquerda' ? 'maoDireita' : 'maoEsquerda';
        if (sheet.equipamento[otherSlot] === '__locked_2h__') {
          sheet.equipamento[otherSlot] = null;
        }
      }
    }
  } else if (itemId === '__locked_2h__') {
    toast('Remova a arma de duas mãos do outro slot primeiro.', 'warn');
    return;
  }

  sheet.equipamento[slotNome] = null;
  renderSlots(sheet);
  atualizarCarga(sheet);
  debounceSave();
}


function renderSlots(sheet) {
  const equip = sheet.equipamento || {};
  const grips = sheet.empunhaduraAtiva || {}; // { maoEsquerda: '1M'|'2M', maoDireita: '1M'|'2M' }
  
  ['maoEsquerda', 'maoDireita', 'armadura'].forEach(slot => {
    const el = document.getElementById('slot-' + slot);
    if (!el) return;
    const itemId = equip[slot];
    if (!itemId) {
      el.innerHTML = '<span class="slot-vazio">Vazio</span>';
    } else if (itemId === '__locked_2h__') {
      el.innerHTML = '<span class="slot-vazio" style="color:var(--attr-warn);font-size:0.78rem;">🔒 Bloqueado (arma 2M)</span>';
    } else {
      const item = EQUIPAMENTOS_INDEX.get(itemId);
      if (item) {
        const isTwoHanded = item.empunhadura === '2M';
        const isDualGrip = item.empunhadura && item.empunhadura.includes('/');
        let gripHtml = '';
        if (isDualGrip && (slot === 'maoEsquerda' || slot === 'maoDireita')) {
          const grips_parts = item.empunhadura.split('/');
          const activeGrip = grips[slot] || grips_parts[0];
          gripHtml = `<div class="grip-toggle-row">${grips_parts.map(g => 
            `<button class="grip-btn${g === activeGrip ? ' active' : ''}" onclick="setGrip('${slot}','${g}')" title="Equipar em ${g}">${g}</button>`
          ).join('')}<span class="grip-active-label">${activeGrip === '2M' ? '⚔⚔ Duas mãos' : '⚔ Uma mão'}</span></div>`;
        }
        el.innerHTML = `
          <div class="item-slot-nome">${escapeHtml(item.nome)}${isTwoHanded ? ' <span style="font-size:0.68rem;color:var(--attr-warn);">⚔⚔ 2M</span>' : ''}</div>
          <div class="item-slot-peso">${item.peso}kg · ${item.preco}P</div>
          ${gripHtml}
          <button class="item-remover" onclick="removerEquipamento('${slot}')">✕ Remover</button>`;
      } else {
        el.innerHTML = '<span class="slot-vazio">Item não encontrado</span>';
      }
    }
  });
}

function setGrip(slot, grip) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  if (!sheet.empunhaduraAtiva) sheet.empunhaduraAtiva = {};
  const itemId = sheet.equipamento?.[slot];
  if (!itemId) return;
  const item = EQUIPAMENTOS_INDEX.get(itemId);
  if (!item || !item.empunhadura.includes('/')) return;
  
  // If switching to 2M, lock the other hand
  const otherSlot = slot === 'maoEsquerda' ? 'maoDireita' : 'maoEsquerda';
  if (grip === '2M') {
    const otherItemId = sheet.equipamento[otherSlot];
    if (otherItemId && otherItemId !== '__locked_2h__') {
      const otherItem = EQUIPAMENTOS_INDEX.get(otherItemId);
      if (otherItem) { if (!sheet.carteira) sheet.carteira = {cobre:0,prata:sheet.moedas||0,ouro:0,platina:0}; sheet.carteira.prata = (sheet.carteira.prata||0) + (otherItem.preco||0); sheet.moedas = sheet.carteira.prata; }
    }
    sheet.equipamento[otherSlot] = '__locked_2h__';
  } else if (grip === '1M') {
    // Unlock if it was locked by this weapon
    if (sheet.equipamento[otherSlot] === '__locked_2h__') {
      sheet.equipamento[otherSlot] = null;
    }
  }
  sheet.empunhaduraAtiva[slot] = grip;
  renderSlots(sheet);
  renderCarteiraUI(sheet);
  debounceSave();
  toast(`${item.nome}: modo ${grip === '2M' ? 'duas mãos' : 'uma mão'}`, 'info');
}

// ---- INVENTÁRIO ----
function abrirAdicionarItem() {
  const nome = document.getElementById('itemNomeInput');
  const peso = document.getElementById('itemPesoInput');
  const qtd  = document.getElementById('itemQtdInput');
  if (nome) nome.value = '';
  if (peso) peso.value = '0.5';
  if (qtd)  qtd.value  = '1';
  openModal('adicionarItemModal');
  setTimeout(() => nome && nome.focus(), 100);
}

function confirmarAdicionarItem() {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  
  const nome = document.getElementById('itemNomeInput')?.value?.trim();
  const peso = parseFloat(document.getElementById('itemPesoInput')?.value) || 0;
  const qtd  = parseInt(document.getElementById('itemQtdInput')?.value) || 1;
  
  if (!nome) { toast('Digite o nome do item!', 'error'); return; }
  
  sheet.inventario = sheet.inventario || [];
  sheet.inventario.push({ id: 'item_' + generateId(), nome, peso, quantidade: qtd });
  
  renderInventario(sheet);
  atualizarCarga(sheet);
  debounceSave();
  closeModal('adicionarItemModal');
  toast(`${nome} adicionado ao inventário!`, 'success');
}

function ajustarQuantidade(itemId, delta) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  const item = (sheet.inventario || []).find(i => i.id === itemId);
  if (!item) return;
  item.quantidade = Math.max(1, (item.quantidade || 1) + delta);
  renderInventario(sheet);
  atualizarCarga(sheet);
  debounceSave();
}

function removerItem(itemId) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  sheet.inventario = (sheet.inventario || []).filter(i => i.id !== itemId);
  renderInventario(sheet);
  atualizarCarga(sheet);
  debounceSave();
}

function renderInventario(sheet) {
  const lista = document.getElementById('inventarioLista');
  if (!lista) return;
  const items = sheet.inventario || [];
  
  if (!items.length) {
    lista.innerHTML = '<div class="inventario-vazio">Inventário vazio. Adicione itens clicando em "+ Adicionar Item".</div>';
    return;
  }
  
  lista.innerHTML = items.map(item => {
    const total = ((item.peso || 0) * (item.quantidade || 1)).toFixed(2);
    return `<div class="inventario-item">
      <div class="item-info">
        <span class="item-nome">${escapeHtml(item.nome)}</span>
        <span class="item-detalhes">${item.peso}kg × ${item.quantidade} = ${total}kg total</span>
      </div>
      <div class="item-acoes">
        <button class="btn-qty" onclick="ajustarQuantidade('${item.id}',-1)" title="Diminuir">−</button>
        <span class="item-quantidade">${item.quantidade}</span>
        <button class="btn-qty" onclick="ajustarQuantidade('${item.id}',1)" title="Aumentar">+</button>
        <button class="btn-qty danger" onclick="removerItem('${item.id}')" title="Remover">🗑️</button>
      </div>
    </div>`;
  }).join('');
}

// ---- RECOMPENSAS ----
function abrirAdicionarRecompensa() {
  const desc  = document.getElementById('recompDescInput');
  const valor = document.getElementById('recompValorInput');
  if (desc)  desc.value  = '';
  if (valor) valor.value = '100';
  openModal('adicionarRecompensaModal');
  setTimeout(() => desc && desc.focus(), 100);
}

function confirmarAdicionarRecompensa() {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  
  const desc  = document.getElementById('recompDescInput')?.value?.trim();
  const valor = parseInt(document.getElementById('recompValorInput')?.value) || 0;
  
  if (!desc) { toast('Digite a descrição da recompensa!', 'error'); return; }
  
  sheet.recompensas = sheet.recompensas || [];
  sheet.recompensas.unshift({ id: 'rew_' + generateId(), descricao: desc, valor, data: Date.now() });
  
  renderRecompensas(sheet);
  
  // Adicionar o valor nas moedas (prata)
  if (!sheet.carteira) sheet.carteira = { cobre:0, prata: sheet.moedas||0, ouro:0, platina:0 };
  sheet.carteira.prata = (sheet.carteira.prata || 0) + valor;
  sheet.moedas = sheet.carteira.prata;
  renderCarteiraUI(sheet);
  
  debounceSave();
  closeModal('adicionarRecompensaModal');
  toast(`+${valor}P registrado!`, 'success');
}

function removerRecompensa(rewId) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  sheet.recompensas = (sheet.recompensas || []).filter(r => r.id !== rewId);
  renderRecompensas(sheet);
  debounceSave();
}

function renderRecompensas(sheet) {
  const lista = document.getElementById('recompensasLista');
  if (!lista) return;
  const rews = sheet.recompensas || [];

  if (!rews.length) {
    lista.innerHTML = '<div class="recompensas-vazio">Nenhuma transação registrada.</div>';
    return;
  }

  lista.innerHTML = rews.map(r => {
    const positivo = (r.valor || 0) >= 0;
    const sinal = positivo ? '+' : '';
    const cls = positivo ? 'pos' : 'neg';
    return `<div class="transacao-item">
      <span class="transacao-sinal ${cls}">${positivo ? '↑' : '↓'}</span>
      <div class="transacao-info">
        <div class="transacao-desc">${escapeHtml(r.descricao)}</div>
        <div class="transacao-data">${formatDate(r.data)}</div>
      </div>
      <span class="transacao-valor ${cls}">${sinal}${r.valor}P</span>
      <button class="recompensa-remover" onclick="removerRecompensa('${r.id}')" title="Remover">✕</button>
    </div>`;
  }).join('');
}

function renderEconomia(sheet) {
  // Initialize carteira if not exists (migrate from moedas)
  if (!sheet.carteira) {
    sheet.carteira = { cobre: 0, prata: sheet.moedas || 0, ouro: 0, platina: 0 };
  }

  // Moedas
  const moedasInicial = calcMoedasIniciais(sheet.nivel);
  const inicialEl = document.getElementById('moedasInicial');
  if (inicialEl) inicialEl.textContent = moedasInicial;

  // Render wallet UI
  renderCarteiraUI(sheet);

  // Slots
  renderSlots(sheet);

  // Inventário
  renderInventario(sheet);

  // Recompensas
  renderRecompensas(sheet);

  // Carga
  atualizarCarga(sheet);

  // Loja
  renderLoja();
}


/* ============================================================
   FASE 4 — MOTOR DE ATRIBUTOS v2 (fórmulas oficiais)
   ──────────────────────────────────────────────────
   REGRA GLOBAL:
     safe(x) = Math.max(0, x)   → potências, ln, termos positivos
     pen(x)  = Math.min(0, x)   → penalidades
============================================================ */

// Helpers globais
const _safe = x => Math.max(0, x);
const _pen  = x => Math.min(0, x);
const _fl   = x => Math.floor(x);
const _ln   = x => Math.log(Math.max(0, x));   // ln seguro

/**
 * Retorna valor numérico de um atributo com regras Aika/Ukya + racial.
 * Trata -Infinity como -3.
 */
function evSheet(sheet, attr) {
  const v = getAtributoEfetivo(sheet, attr);
  return v === -Infinity ? -3 : (v || 0);
}

/* ── RECURSOS ─────────────────────────────────────────────── */

/**
 * HP — Vida
 * HP = 30
 *    + 0.7·safe(VIDA)² + 2·safe(VIDA) + 4·pen(VIDA)
 *    + 0.5·safe(CON)²  + 2·safe(CON)  + 3·pen(CON)
 *    + (LV-1)·(2·safe(CON) + safe(VIDA))
 */
function _getVerlorenHelpers() {
  return {
    resolveAttribute: getAtributoEfetivo,
    equipmentIndex: typeof EQUIPAMENTOS_INDEX === 'undefined' ? null : EQUIPAMENTOS_INDEX,
  };
}

function _getRaceLuckBonus(sheet) {
  if (!sheet || !sheet.raceSelecionada || typeof RACES_DB === 'undefined') return 0;
  const race = RACES_DB.find(function (item) { return item.name === sheet.raceSelecionada; });
  return race && race.atributos && race.atributos.LK ? race.atributos.LK : 0;
}

function _getDerivedVerloren(sheet) {
  const derived = window.CompanionSystems.Verloren.calculateDerived(sheet, _getVerlorenHelpers());
  return { ...derived, LK: derived.LK + _getRaceLuckBonus(sheet) };
}

function _buildLegacySubatributos(sheet, derived) {
  return {
    VIDA: derived.HP,
    DEF: derived.DEF_TOTAL,
    ATQ: derived.ATK_TOTAL,
    RESM: derived.MR_TOTAL,
    INIC: evSheet(sheet, 'PER') + evSheet(sheet, 'AGI'),
    MOV: derived.MV,
    CONC: _fl((evSheet(sheet, 'INT') + evSheet(sheet, 'VON')) / 2),
    PERCEP: derived.PER_TESTE,
    FURT: _fl((evSheet(sheet, 'AGI') + evSheet(sheet, 'DES')) / 2),
    SOCIAL: _fl((evSheet(sheet, 'CAR') + evSheet(sheet, 'INT')) / 2),
    HP: derived.HP,
    SP: derived.SP,
    MP: derived.MP,
    SAN: derived.SAN,
    EV: derived.EV,
    BLK: derived.BLK,
    PWR: derived.PWR,
    WIL: derived.WIL,
    PER_TESTE: derived.PER_TESTE,
    LK: derived.LK,
  };
}

function calcHP(sheet) {
  return window.CompanionSystems.Verloren.calcHP(sheet, _getVerlorenHelpers());
}

/**
 * SP — Estamina
 * SP = 20
 *    + 0.5·safe(CON)² + 2·safe(CON) + 3·pen(CON)
 *    + AGI
 *    + (LV-1)·(safe(CON) + AGI)
 */
function calcSP(sheet) {
  return window.CompanionSystems.Verloren.calcSP(sheet, _getVerlorenHelpers());
}

/**
 * MP — Mana
 * MP = 20
 *    + 0.6·safe(MAG)² + 2·safe(MAG) + 3·pen(MAG)
 *    + 0.4·safe(INT)² + 2·safe(INT) + 2·pen(INT)
 *    + (LV-1)·(safe(MAG) + safe(INT))
 */
function calcMP(sheet) {
  return window.CompanionSystems.Verloren.calcMP(sheet, _getVerlorenHelpers());
}

/**
 * SAN — Sanidade
 * SAN = 25
 *     + 0.8·safe(VON)² + 2·safe(VON) + 3·pen(VON)
 *     + SAB
 *     + (LV-1)·safe(VON)
 */
function calcSAN(sheet) {
  return window.CompanionSystems.Verloren.calcSAN(sheet, _getVerlorenHelpers());
}

/* ── MOBILIDADE & DEFESA ─────────────────────────────────── */

/**
 * MV — Movimento
 * MV = 4 + AGI + floor(3·ln(safe(AGI)+1)/ln(11)) + LV/6
 */
function calcMV(sheet) {
  return window.CompanionSystems.Verloren.calcMV(sheet, _getVerlorenHelpers());
}

/**
 * EV — Esquiva
 * EV = DES + floor(4·ln(safe(AGI)+1)/ln(11)) + LV/6
 */
function calcEV(sheet) {
  return window.CompanionSystems.Verloren.calcEV(sheet, _getVerlorenHelpers());
}

/**
 * BLK — Bloqueio
 * BLK = floor((FOR + DES) / 10)
 */
function calcBLK(sheet) {
  return window.CompanionSystems.Verloren.calcBLK(sheet, _getVerlorenHelpers());
}

/**
 * DEF_TOTAL — Defesa total
 * DEF_TOTAL = DEF + floor((safe(CON)+safe(FOR))/6) + equip
 */
function calcDEF_TOTAL(sheet) {
  return window.CompanionSystems.Verloren.calcDEF_TOTAL(sheet, _getVerlorenHelpers());
}

/**
 * MR_TOTAL — Resistência mágica total
 * MR_TOTAL = RESM + floor((safe(VON)+safe(CON))/6) + equip
 */
function calcMR_TOTAL(sheet) {
  return window.CompanionSystems.Verloren.calcMR_TOTAL(sheet, _getVerlorenHelpers());
}

/* ── COMBATE ─────────────────────────────────────────────── */

/**
 * ATK_TOTAL — Ataque total
 * ATK = ATQ + w·floor(5·ln(safe((1-p)·DES + p·FOR) + 1) / ln(11))
 */
function calcATK_TOTAL(sheet) {
  return window.CompanionSystems.Verloren.calcATK_TOTAL(sheet, _getVerlorenHelpers());
}

/**
 * PWR — Poder mágico
 * PWR = MAG + floor(5·ln(safe(MAG+INT)+1)/ln(11))
 */
function calcPWR(sheet) {
  return window.CompanionSystems.Verloren.calcPWR(sheet, _getVerlorenHelpers());
}

/* ── TESTES ──────────────────────────────────────────────── */

/**
 * WIL — Vontade (testes)
 * WIL = VON + floor(3·ln(safe(VON+CON)+1)/ln(11)) + LV/6
 */
function calcWIL(sheet) {
  return window.CompanionSystems.Verloren.calcWIL(sheet, _getVerlorenHelpers());
}

/**
 * PER_TESTE — Percepção (testes)
 * PER_TESTE = PER + floor(3·ln(safe(SAB+AGI)+1)/ln(11))
 */
function calcPER_TESTE(sheet) {
  return window.CompanionSystems.Verloren.calcPER_TESTE(sheet, _getVerlorenHelpers());
}

/**
 * LK — Sorte
 * LK = 10 + CAR + floor(SAB/2)
 */
function calcLK(sheet) {
  return window.CompanionSystems.Verloren.calcLK(sheet, _getVerlorenHelpers()) + _getRaceLuckBonus(sheet);
}

/* ── HELPERS DE EQUIPAMENTO ─────────────────────────────── */
function _getEquipBonus(sheet, campo) {
  return window.CompanionSystems.Verloren.getEquipBonus(sheet, campo, _getVerlorenHelpers());
}
function _getWeaponFactors(sheet) {
  return window.CompanionSystems.Verloren.getWeaponFactors(sheet, _getVerlorenHelpers());
}

/* ── AGREGADOR PRINCIPAL ─────────────────────────────────── */

/** Calcula todos os derivados de uma vez e retorna o objeto. */
function calcularTodosDerivados(sheet) {
  return _getDerivedVerloren(sheet);
}

/** Compat: calcularSubatributos agora delega ao motor novo */
function calcularSubatributos(sheet) {
  return _buildLegacySubatributos(sheet, calcularTodosDerivados(sheet));
}

/** Compat: calcRecursos agora usa o motor novo */
function calcRecursos(sheet) {
  const d = _getDerivedVerloren(sheet);
  return {
    HP: d.HP,
    MP: d.MP,
    SP: d.SP,
    SAN: d.SAN,
  };
}

/* ── METADATA DOS DERIVADOS ─────────────────────────────── */
const SUBATTR_META = {
  // Recursos (mostrados como barras visuais)
  HP:        { label:'HP',          formula:'30+0.7·safe(VIDA)²+0.5·safe(CON)²+…',         desc:'Vida máxima',             cor:'#e05070' },
  MP:        { label:'MP',          formula:'20+0.6·safe(MAG)²+0.4·safe(INT)²+…',           desc:'Mana máxima',             cor:'#8060c8' },
  SP:        { label:'SP',          formula:'20+0.5·safe(CON)²+2·safe(CON)+AGI+…',          desc:'Estamina máxima',         cor:'#40a870' },
  SAN:       { label:'SAN',         formula:'25+0.8·safe(VON)²+SAB+…',                       desc:'Sanidade máxima',         cor:'#5090d0' },
  // Mobilidade & Defesa
  MV:        { label:'MV',          formula:'4+AGI+⌊3·ln(safe(AGI)+1)/ln(11)⌋+LV/6',       desc:'Movimento (metros/turno)',cor:'#c0a040' },
  EV:        { label:'EV',          formula:'DES+⌊4·ln(safe(AGI)+1)/ln(11)⌋+LV/6',          desc:'Esquiva',                 cor:'#50b8a0' },
  BLK:       { label:'BLK',         formula:'⌊(FOR+DES)/10⌋',                                desc:'Bloqueio',                cor:'#8090a0' },
  DEF_TOTAL: { label:'DEF Total',   formula:'DEF+⌊(safe(CON)+safe(FOR))/6⌋+equip',          desc:'Defesa total c/ equip',   cor:'#7060a0' },
  MR_TOTAL:  { label:'MR Total',    formula:'RESM+⌊(safe(VON)+safe(CON))/6⌋+equip',         desc:'Resist. mágica total',    cor:'#9050c0' },
  // Combate
  ATK_TOTAL: { label:'ATK Total',   formula:'ATQ+w·⌊5·ln(safe((1-p)·DES+p·FOR)+1)/ln(11)⌋',desc:'Ataque total c/ arma',    cor:'#d06040' },
  PWR:       { label:'PWR',         formula:'MAG+⌊5·ln(safe(MAG+INT)+1)/ln(11)⌋',           desc:'Poder mágico',            cor:'#c070e0' },
  // Testes
  WIL:       { label:'WIL',         formula:'VON+⌊3·ln(safe(VON+CON)+1)/ln(11)⌋+LV/6',     desc:'Testes de Vontade',       cor:'#a08040' },
  PER_TESTE: { label:'PER Teste',   formula:'PER+⌊3·ln(safe(SAB+AGI)+1)/ln(11)⌋',           desc:'Percepção (testes)',       cor:'#6090a0' },
  LK:        { label:'LK',          formula:'10+CAR+⌊SAB/2⌋',                                desc:'Sorte',                   cor:'#50b040' },
};

/* ── BARRAS DE RECURSOS ─────────────────────────────────── */

const _RES_META = {
  HP:  { icon:'❤',  label:'HP',  sub:'Vida',     cor:'#e05070', grad:'linear-gradient(90deg,#c03050,#e05070)', gradLow:'linear-gradient(90deg,#801530,#c03050)', danger:0.25, crit:0.10 },
  MP:  { icon:'💜', label:'MP',  sub:'Mana',     cor:'#8060c8', grad:'linear-gradient(90deg,#5040a0,#8060c8)', gradLow:'linear-gradient(90deg,#302070,#5040a0)', danger:0.20, crit:0.05 },
  SP:  { icon:'💚', label:'SP',  sub:'Estamina', cor:'#40a870', grad:'linear-gradient(90deg,#208050,#40a870)', gradLow:'linear-gradient(90deg,#104030,#208050)', danger:0.30, crit:0.15 },
  SAN: { icon:'🔵', label:'SAN', sub:'Sanidade', cor:'#5090d0', grad:'linear-gradient(90deg,#3060a0,#5090d0)', gradLow:'linear-gradient(90deg,#203060,#3060a0)', danger:0.35, crit:0.20 },
};

/**
 * Garante que sheet._recAtual existe e está clampado ao máximo atual.
 */
function _migrarRecAtual(sheet) {
  const rec = calcRecursos(sheet);
  if (!sheet._recAtual) {
    sheet._recAtual = { HP: rec.HP, MP: rec.MP, SP: rec.SP, SAN: rec.SAN };
  } else {
    ['HP','MP','SP','SAN'].forEach(k => {
      if (sheet._recAtual[k] === undefined || sheet._recAtual[k] === null)
        sheet._recAtual[k] = rec[k];
      else
        sheet._recAtual[k] = Math.min(sheet._recAtual[k], rec[k]);
    });
  }
}

/** Renderiza o painel completo de barras de recursos. */
function renderBarrasRecursos(sheet) {
  const wrap = document.getElementById('recursosBarrasWrap');
  if (!wrap) return;
  _migrarRecAtual(sheet);
  const rec = calcRecursos(sheet);
  wrap.innerHTML = Object.entries(_RES_META).map(([id, m]) => {
    const max = rec[id];
    const cur = Math.max(0, Math.min(max, sheet._recAtual[id] ?? max));
    return _buildResBar(id, m, cur, max);
  }).join('');
}

function _buildResBar(id, m, cur, max) {
  const pct      = max > 0 ? Math.round((cur/max)*100) : 0;
  const isDanger = pct <= m.danger*100;
  const isCrit   = pct <= m.crit*100;
  const grad     = isDanger ? m.gradLow : m.grad;
  const cls      = isCrit ? 'res-critical' : isDanger ? 'res-danger' : '';
  return `<div class="res-bar-wrap ${cls}" id="reswrap-${id}">
    <div class="res-bar-header">
      <div class="res-bar-label-wrap">
        <span class="res-bar-icon">${m.icon}</span>
        <span class="res-bar-name">${m.label}</span>
        <span class="res-bar-sub">${m.sub}</span>
      </div>
      <div class="res-bar-vals">
        <span class="res-bar-cur" id="rescur-${id}">${cur}</span>
        <span class="res-bar-sep">/</span>
        <span class="res-bar-max" id="resmax-${id}">${max}</span>
      </div>
    </div>
    <div class="res-bar-track">
      <div class="res-bar-fill" id="resfill-${id}"
        style="width:${pct}%;background:${grad};"
        role="progressbar" aria-valuenow="${cur}" aria-valuemin="0" aria-valuemax="${max}">
      </div>
      <div class="res-bar-shimmer"></div>
    </div>
    <div class="res-bar-pct" id="respct-${id}">${pct}%</div>
    <div class="res-bar-btns">
      ${[-10,-1,1,10].map(d =>
        `<button class="res-btn ${d>0?'res-btn-plus':'res-btn-minus'}"
          onclick="ajustarRecurso('${id}',${d})"
          style="border-color:${m.cor}44;color:${m.cor}">${d>0?'+':''}${d}</button>`
      ).join('')}
      <button class="res-btn res-btn-max"
        onclick="restaurarRecurso('${id}')"
        style="border-color:${m.cor}33;color:${m.cor}88">MAX</button>
    </div>
  </div>`;
}

function _atualizarBarraUnica(sheet, id) {
  const m   = _RES_META[id];
  if (!m) return;
  const rec = calcRecursos(sheet);
  const max = rec[id];
  sheet._recAtual[id] = Math.max(0, Math.min(max, sheet._recAtual[id] ?? max));
  const cur = sheet._recAtual[id];
  const pct = max > 0 ? Math.round((cur/max)*100) : 0;
  const isDanger = pct <= m.danger*100;
  const isCrit   = pct <= m.crit*100;
  const grad     = isDanger ? m.gradLow : m.grad;

  const fill = document.getElementById(`resfill-${id}`);
  const curEl= document.getElementById(`rescur-${id}`);
  const maxEl= document.getElementById(`resmax-${id}`);
  const pctEl= document.getElementById(`respct-${id}`);
  const wrap = document.getElementById(`reswrap-${id}`);

  if (fill) { fill.style.width = `${pct}%`; fill.style.background = grad;
    fill.setAttribute('aria-valuenow', cur); fill.setAttribute('aria-valuemax', max); }
  if (curEl) curEl.textContent = cur;
  if (maxEl) maxEl.textContent = max;
  if (pctEl) pctEl.textContent = `${pct}%`;
  if (wrap)  {
    wrap.classList.toggle('res-danger',   isDanger && !isCrit);
    wrap.classList.toggle('res-critical', isCrit);
  }
}

function _atualizarTodasBarras(sheet) {
  Object.keys(_RES_META).forEach(id => _atualizarBarraUnica(sheet, id));
}

/** Chamado pelos botões +/− das barras */
function ajustarRecurso(id, delta) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  _migrarRecAtual(sheet);
  const rec = calcRecursos(sheet);
  sheet._recAtual[id] = Math.max(0, Math.min(rec[id], (sheet._recAtual[id]??rec[id]) + delta));
  _atualizarBarraUnica(sheet, id);
  debounceSave();
}

/** Restaura recurso ao máximo */
function restaurarRecurso(id) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  _migrarRecAtual(sheet);
  sheet._recAtual[id] = calcRecursos(sheet)[id];
  _atualizarBarraUnica(sheet, id);
  debounceSave();
}

/* ── RENDER / ATUALIZAÇÃO DOS DERIVADOS ─────────────────── */

const _DERIVADOS_GRUPOS = [
  { label:'🏃 Mobilidade & Defesa', keys:['MV','EV','BLK','DEF_TOTAL','MR_TOTAL'] },
  { label:'⚔ Combate',             keys:['ATK_TOTAL','PWR'] },
  { label:'🧠 Testes & Social',    keys:['WIL','PER_TESTE','LK'] },
];

function renderSubatributos(sheet) {
  // Barras de recursos
  renderBarrasRecursos(sheet);

  // Grid de derivados (exceto recursos — esses ficam nas barras)
  const grid = document.getElementById('subatributosGrid');
  if (!grid) return;

  const d = calcularTodosDerivados(sheet);
  let html = '';

  _DERIVADOS_GRUPOS.forEach(g => {
    html += `<div class="derivados-grupo-lbl">${g.label}</div>
      <div class="derivados-grupo-items">`;
    g.keys.forEach(key => {
      const meta = SUBATTR_META[key];
      if (!meta) return;
      const val  = d[key] ?? 0;
      const sign = (val >= 0 && !['MV','LK'].includes(key)) ? '+' : '';
      html += `<div class="subattr-card" title="${meta.desc}">
        <div class="subattr-sigla" style="color:${meta.cor}">${meta.label}</div>
        <div class="subattr-valor" id="sub-${key.toLowerCase()}" style="color:${meta.cor}">${sign}${val}</div>
        <div class="subattr-formula">${meta.formula}</div>
        <div class="subattr-desc">${meta.desc}</div>
      </div>`;
    });
    html += '</div>';
  });

  grid.innerHTML = html;
}

function atualizarSubatributos(sheet) {
  const d = calcularTodosDerivados(sheet);

  // Atualiza derivados no grid
  Object.entries(d).forEach(([key, val]) => {
    const el = document.getElementById('sub-' + key.toLowerCase());
    if (!el) return;
    const sign = (val >= 0 && !['MV','LK','HP','MP','SP','SAN'].includes(key)) ? '+' : '';
    const txt  = `${sign}${val}`;
    if (el.textContent !== txt) {
      el.textContent = txt;
      el.classList.remove('changed');
      void el.offsetWidth;
      el.classList.add('changed');
    }
  });

  // Atualiza barras de recursos
  _migrarRecAtual(sheet);
  _atualizarTodasBarras(sheet);

  // Radar e carga
  renderRadarChart(sheet);
  atualizarCarga(sheet);
}

/* ── CSS DAS BARRAS (injetado uma vez) ─────────────────── */
(function _injetarCSSBarras() {
  if (document.getElementById('_res-bars-style')) return;
  const s = document.createElement('style');
  s.id = '_res-bars-style';
  s.textContent = `
/* ─── BARRAS DE RECURSOS ─────────────────────────── */
#recursosBarrasWrap{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
@media(max-width:480px){#recursosBarrasWrap{grid-template-columns:1fr;}}
.res-bar-wrap{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:12px 14px;transition:border-color var(--transition),box-shadow var(--transition);}
.res-bar-wrap.res-danger{border-color:rgba(200,100,60,.5);box-shadow:0 0 10px rgba(200,100,60,.1);}
.res-bar-wrap.res-critical{border-color:rgba(200,50,50,.7);animation:_pulse-crit 2s ease-in-out infinite;}
@keyframes _pulse-crit{0%,100%{box-shadow:0 0 10px rgba(200,50,50,.15);}50%{box-shadow:0 0 22px rgba(200,50,50,.35);}}
.res-bar-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;}
.res-bar-label-wrap{display:flex;align-items:center;gap:4px;}
.res-bar-icon{font-size:.9rem;}
.res-bar-name{font-weight:800;font-size:.82rem;color:var(--text-primary);}
.res-bar-sub{font-size:.6rem;color:var(--text-muted);font-style:italic;}
.res-bar-vals{display:flex;align-items:baseline;gap:2px;}
.res-bar-cur{font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700;color:var(--text-primary);transition:color .3s;}
.res-bar-sep{font-size:.78rem;color:var(--text-muted);}
.res-bar-max{font-size:.78rem;color:var(--text-secondary);}
.res-bar-track{height:9px;background:var(--bg-secondary);border-radius:5px;overflow:hidden;position:relative;margin-bottom:3px;box-shadow:inset 0 1px 3px rgba(0,0,0,.1);}
.res-bar-fill{height:100%;border-radius:5px;transition:width .4s cubic-bezier(.4,0,.2,1),background .35s;position:relative;}
.res-bar-shimmer{position:absolute;inset:0;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.13) 50%,transparent 100%);background-size:200% 100%;animation:_shimmer 2.6s ease-in-out infinite;pointer-events:none;}
@keyframes _shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
.res-bar-pct{font-size:.58rem;color:var(--text-muted);text-align:right;margin-bottom:7px;}
.res-bar-btns{display:flex;gap:4px;}
.res-btn{flex:1;padding:4px 0;background:var(--bg-secondary);border:1px solid transparent;border-radius:5px;font-size:.68rem;font-weight:700;font-family:'Courier New',monospace;cursor:pointer;transition:background var(--transition),transform .1s;}
.res-btn:hover{background:var(--bg-card-hover);transform:translateY(-1px);}
.res-btn:active{transform:scale(.94);}
.res-btn-max{flex:.7;font-size:.58rem;}
/* ─── DERIVADOS GRUPOS ───────────────────────────── */
.derivados-grupo-lbl{font-size:.64rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-muted);margin:14px 0 6px 2px;}
.derivados-grupo-items{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:7px;margin-bottom:2px;}
`;
  document.head.appendChild(s);
})();

/* ============================================================
   FASE 5 — GRÁFICO RADIAL
============================================================ */

let radarChartInstance = null;

function calcularCategorias(sheet) {
  const subs = calcularSubatributos(sheet);
  const modos = sheet.modos || {};
  const ev = (attr) => {
    const v = getAtributoEfetivo(sheet, attr);
    return v === -Infinity ? -10 : (v || 0);
  };
  
  // Normalizar para escala 0-10
  const norm = (v, min, max) => Math.max(0, Math.min(10, ((v - min) / (max - min)) * 10));
  const d = calcularTodosDerivados(sheet);
  const resistencia = norm(
  (norm(d.HP,        8,  750) * 4) +
  (norm(d.DEF_TOTAL, -4,  20) * 4) +
  (norm(d.MR_TOTAL,  -5,  25) * 2),
  0, 100  // corrigido
);
  const agressividade = norm(
  (norm(d.ATK_TOTAL, 0, 12) * 6) +
  (norm(ev('FOR'),  -3, 13) * 4),
  0, 100
);
  const magia = norm(d.PWR, -3, 19);
  const estrategia    = norm((ev('INT') + ev('SAB') + ev('PER')) / 3, -3, 5);
  const valores = [modos.Bruto||1, modos.Ágil||1, modos.Preciso||1, modos.Intuitivo||1];
  const media = valores.reduce((a,b) => a+b, 0) / 4;
  const desvio = Math.sqrt(valores.reduce((a,b) => a + Math.pow(b - media, 2), 0) / 4);
  const versatilidade = norm(desvio, 2, 0); // desvio alto = especialista = baixo; desvio baixo = versátil = alto
  
  return {
    resistencia:   parseFloat(resistencia.toFixed(1)),
    agressividade: parseFloat(agressividade.toFixed(1)),
    magia:         parseFloat(magia.toFixed(1)),
    estrategia:    parseFloat(estrategia.toFixed(1)),
    versatilidade: parseFloat(versatilidade.toFixed(1))
  };
}

function renderRadarChart(sheet) {
  const canvas = document.getElementById('radarChart');
  if (!canvas || !canvas.getContext) return;

  if (!radarChartInstance || radarChartInstance.canvas !== canvas) {
    destruirRadarChart();
    radarChartInstance = {
      canvas,
      resizeHandler: throttle(function() {
        const activeSheet = getSheet(currentSheetId) || sheet;
        if (activeSheet) renderRadarChart(activeSheet);
      }, 120)
    };
    window.addEventListener('resize', radarChartInstance.resizeHandler);
  }

  const labels = ['Resistencia', 'Agressividade', 'Magia', 'Estrategia', 'Versatilidade'];
  const values = Object.values(calcularCategorias(sheet));
  const palette = getDarkModeState()
    ? {
        text: 'rgba(232,224,248,0.88)',
        muted: 'rgba(200,188,236,0.56)',
        grid: 'rgba(88,74,140,0.52)',
        fill: 'rgba(136,110,240,0.2)',
        border: 'rgba(180,148,255,0.94)',
        point: 'rgba(220,196,255,1)',
        ring: 'rgba(24,18,42,0.34)'
      }
    : {
        text: 'rgba(61,52,82,0.9)',
        muted: 'rgba(92,82,118,0.46)',
        grid: 'rgba(189,176,221,0.82)',
        fill: 'rgba(181,150,234,0.22)',
        border: 'rgba(140,96,184,0.96)',
        point: 'rgba(123,78,168,1)',
        ring: 'rgba(255,255,255,0.56)'
      };

  const dpr = window.devicePixelRatio || 1;
  const wrapperWidth = canvas.parentElement ? canvas.parentElement.clientWidth : 320;
  const size = Math.max(260, Math.min(wrapperWidth, 420));
  canvas.width = Math.round(size * dpr);
  canvas.height = Math.round(size * dpr);
  canvas.style.width = '100%';
  canvas.style.height = size + 'px';

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);

  const center = size / 2;
  const radius = size * 0.28;
  const maxValue = 10;

  ctx.save();
  ctx.translate(center, center);

  for (let ring = 5; ring >= 1; ring--) {
    const currentRadius = radius * (ring / 5);
    ctx.beginPath();
    labels.forEach(function(_, index) {
      const angle = (-Math.PI / 2) + (Math.PI * 2 * index / labels.length);
      const x = Math.cos(angle) * currentRadius;
      const y = Math.sin(angle) * currentRadius;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = ring % 2 === 0 ? palette.ring : 'transparent';
    ctx.fill();
    ctx.strokeStyle = palette.grid;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  labels.forEach(function(_, index) {
    const angle = (-Math.PI / 2) + (Math.PI * 2 * index / labels.length);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    ctx.strokeStyle = palette.grid;
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  ctx.beginPath();
  values.forEach(function(value, index) {
    const angle = (-Math.PI / 2) + (Math.PI * 2 * index / labels.length);
    const scaled = Math.max(0, Math.min(maxValue, value)) / maxValue;
    const x = Math.cos(angle) * radius * scaled;
    const y = Math.sin(angle) * radius * scaled;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = palette.fill;
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 2.5;
  ctx.fill();
  ctx.stroke();

  values.forEach(function(value, index) {
    const angle = (-Math.PI / 2) + (Math.PI * 2 * index / labels.length);
    const scaled = Math.max(0, Math.min(maxValue, value)) / maxValue;
    const x = Math.cos(angle) * radius * scaled;
    const y = Math.sin(angle) * radius * scaled;
    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = palette.point;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = palette.border;
    ctx.stroke();
  });

  ctx.restore();

  ctx.fillStyle = palette.muted;
  ctx.font = '600 10px Merriweather, serif';
  ctx.textAlign = 'center';
  [2, 4, 6, 8, 10].forEach(function(step, index) {
    const y = center - (radius * (step / maxValue));
    ctx.fillText(String(step), center, y - (index === 4 ? 4 : 2));
  });

  ctx.fillStyle = palette.text;
  ctx.font = '600 12px Merriweather, serif';
  labels.forEach(function(label, index) {
    const angle = (-Math.PI / 2) + (Math.PI * 2 * index / labels.length);
    const labelRadius = radius + 30;
    const x = center + Math.cos(angle) * labelRadius;
    const y = center + Math.sin(angle) * labelRadius;
    ctx.textAlign = Math.abs(Math.cos(angle)) < 0.18 ? 'center' : (Math.cos(angle) > 0 ? 'left' : 'right');
    ctx.textBaseline = Math.sin(angle) > 0.52 ? 'top' : (Math.sin(angle) < -0.52 ? 'bottom' : 'middle');
    ctx.fillText(label, x, y);
  });
}

function destruirRadarChart() {
  if (radarChartInstance && radarChartInstance.resizeHandler) {
    window.removeEventListener('resize', radarChartInstance.resizeHandler);
  }
  if (radarChartInstance && radarChartInstance.canvas) {
    const ctx = radarChartInstance.canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, radarChartInstance.canvas.width, radarChartInstance.canvas.height);
  }
  radarChartInstance = null;
}

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

/* ============================================================
   FICHA — VIEW TABS (Editar / Compacto / Expandido)
============================================================ */
function showFichaView(view) {
  document.querySelectorAll('.ficha-view-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.ficha-view-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('fichaview-' + view).classList.add('active');
  document.querySelectorAll('.ficha-view-tab').forEach(t => {
    if (t.getAttribute('onclick').includes("'" + view + "'")) t.classList.add('active');
  });

  if (view === 'compacto') renderFichaCompacta();
  if (view === 'expandido') renderFichaExpandida();
}

function renderFichaCompacta() {
  const container = document.getElementById('compactSheetContent');
  if (!container) return;
  if (!currentSheetId) {
    container.innerHTML = '<div class="empty-state" style="padding:60px 20px;color:var(--text-muted);"><div class="empty-state-icon">👁</div><h3>Nenhuma ficha aberta</h3></div>';
    return;
  }
  saveCurrentSheet(true);
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;

  const attrs    = sheet.atributos || {};
  const modos    = sheet.modos    || {};
  const der      = calcularTodosDerivados(sheet);
  const rec      = calcRecursos(sheet);
  const allAttrs = ATTRS_GROUPS.flat();
  _migrarRecAtual(sheet);

  // ── Atributos ──────────────────────────────────────────────
  const attrsHTML = allAttrs.map(a => {
    const base  = (attrs[a] ?? 0);
    const bonus = (sheet.raceBonus && sheet.raceBonus[a]) || 0;
    const total = base + bonus;
    const cls   = total > 0 ? 'pos' : total < 0 ? 'neg' : 'zero';
    return `<div class="compact-attr">
      <div class="compact-attr-label">${a}</div>
      <div class="compact-attr-val ${cls}">${total > 0 ? '+' + total : total}</div>
    </div>`;
  }).join('');

  // ── Modos ──────────────────────────────────────────────────
  const modesValues = Object.values(modos);
  const maxM = modesValues.length ? Math.max(...modesValues) : 0;
  const modosHTML = Object.entries(modos).map(([k,v]) =>
    `<div class="compact-modo ${v===maxM&&v>1?'dominant':''}">
      <span class="compact-modo-name">${k}</span>
      <span class="compact-modo-val">${v}</span>
    </div>`).join('');

  // ── Derivados (só valores, sem fórmulas) ──────────────────
  const derivKeyMap = [
    {k:'MV', v:der.MV,       label:'Mov'},
    {k:'EV', v:der.EV,       label:'Esq'},
    {k:'BLK',v:der.BLK,      label:'Blk'},
    {k:'DEF',v:der.DEF_TOTAL,label:'DEF'},
    {k:'MR', v:der.MR_TOTAL, label:'MR'},
    {k:'ATK',v:der.ATK_TOTAL,label:'ATK'},
    {k:'PWR',v:der.PWR,      label:'PWR'},
    {k:'WIL',v:der.WIL,      label:'WIL'},
    {k:'PER',v:der.PER_TESTE,label:'PER'},
    {k:'LK', v:der.LK,       label:'LK'},
  ];
  const subattrsHTML = derivKeyMap.map(({label, v}) =>
    `<div class="compact-subattr-pill">
      <span class="compact-subattr-key">${label}</span>
      <span class="compact-subattr-val">${v >= 0 ? '+' : ''}${v}</span>
    </div>`
  ).join('');

  // ── Recursos editáveis ─────────────────────────────────────
  const resHTML = ['HP','MP','SP','SAN'].map(r => {
    const meta    = _RES_META[r];
    const max     = rec[r];
    const current = Math.min(sheet._recAtual[r] ?? max, max);
    const pct     = max > 0 ? Math.max(0, Math.min(100, (current/max)*100)) : 0;
    return `<div class="resource-bar-wrap">
      <div class="resource-bar-header">
        <span class="resource-bar-name" style="color:${meta.cor}">${meta.icon} ${r}</span>
        <div style="display:flex;align-items:center;gap:4px;">
          <input class="resource-edit-input" type="number" value="${current}" min="0" max="${max}"
            onchange="updateRecursoAtual('${r}', this.value, ${max})" title="Valor atual" />
          <span style="font-size:0.72rem;color:var(--text-muted);">/ ${max}</span>
        </div>
      </div>
      <div class="resource-bar-track">
        <div class="resource-bar-fill" id="resbar-${r.toLowerCase()}" style="width:${pct}%;background:${meta.grad};"></div>
      </div>
    </div>`;
  }).join('');

  // ── Habilidades (só nomes) ─────────────────────────────────
  let habsNomesHTML = '';
  if (typeof RACES_DB !== 'undefined') {
    const race = RACES_DB.find(r => r.name === sheet.raceSelecionada);
    if (race) {
      const todasHabs = [
        ...(race.habilidades||[]), ...(race.passivas||[]),
        ...(race.progressao?.nucleo||[]),
        ...(race.progressao?.caminhos||[]).flatMap(c => c.habilidades||[]),
        ...(race.subraças||[]).flatMap(s => [...(s.habilidades||[]),...(s.passivas||[])]),
      ];
      const todasAtivas = [...(sheet.habilidadesAtivas||[]), ...(sheet.habilidadesAprendidas||[]), ...(sheet.progressaoAtiva||[])];
      const ativas = todasHabs.filter(h => todasAtivas.includes(h.id));
      if (ativas.length) {
        habsNomesHTML = `<div class="compact-section-label">Habilidades</div>
          <div class="compact-list">${ativas.map(h =>
            `<div class="compact-list-item" style="${h.negativa?'color:var(--attr-neg);':''}">${escapeHtml(h.nome)}</div>`
          ).join('')}</div>`;
      }
    }
  }

  // ── Equipamento equipado (só nomes) ───────────────────────
  let equipNomesHTML = '';
  if (sheet.equipamento && typeof EQUIPAMENTOS_INDEX !== 'undefined') {
    const slots = {maoEsquerda:'🗡 Mão Esq.', maoDireita:'🗡 Mão Dir.', armadura:'🛡 Armadura'};
    const rows = Object.entries(slots).map(([sk, sl]) => {
      const id = sheet.equipamento[sk];
      const item = (id && id !== '__locked_2h__') ? EQUIPAMENTOS_INDEX.get(id) : null;
      if (!item) return '';
      return `<div class="compact-list-item"><span style="color:var(--text-muted);font-size:0.7rem;margin-right:4px;">${sl}</span>${escapeHtml(item.nome)}</div>`;
    }).filter(Boolean).join('');
    if (rows) equipNomesHTML = `<div class="compact-section-label">Equipado</div><div class="compact-list">${rows}</div>`;
  }

  // ── Traços / Vantagens / Vulnerabilidades (só nomes) ──────
  const listNomes = (arr, label) => {
    const items = (arr || []).filter(x => x);
    if (!items.length) return '';
    return `<div class="compact-section-label">${label}</div>
      <div class="compact-list">${items.map(x => `<div class="compact-list-item">${escapeHtml(x)}</div>`).join('')}</div>`;
  };

  // ── Variação locus / caminho (só o nome) ──────────────────
  let escolhasHTML = '';
  const escolhas = [];
  if (sheet.caminhoEscolhido) escolhas.push(`Caminho: ${sheet.caminhoEscolhido}`);
  if (sheet.variacaoLocus && typeof RACES_DB !== 'undefined') {
    const race = RACES_DB.find(r => r.name === sheet.raceSelecionada);
    const vari = (race?.variacoes||[]).find(v => v.id === sheet.variacaoLocus);
    if (vari) escolhas.push(`Variação: ${vari.nome}`);
  }
  if (sheet.subraçaSelecionada) escolhas.push(`Subtipu: ${sheet.subraçaSelecionada}`);
  if (escolhas.length) {
    escolhasHTML = `<div class="compact-section-label">Escolhas Raciais</div>
      <div class="compact-list">${escolhas.map(x => `<div class="compact-list-item">${escapeHtml(x)}</div>`).join('')}</div>`;
  }

  const emojis = { 'Base':'🌱','Celestial':'✨','Excêntrica':'🌀' };
  container.innerHTML = `
    <div class="compact-sheet">
      <div class="compact-sheet-header">
        <div class="compact-avatar">${emojis[sheet.classificacao]||'✦'}</div>
        <div class="compact-title">
          <div class="compact-name">${escapeHtml(sheet.name || 'Sem nome')}</div>
          <div class="compact-subtitle">
            ${sheet.raceSelecionada ? escapeHtml(sheet.raceSelecionada) + ' · ' : ''}${sheet.classificacao||'Base'} · Nv.${sheet.nivel||1}
            ${sheet.modificador ? ' · ' + (sheet.modificador==='Aika'?'💠 Aika':'🔶 Ukya') : ''}
          </div>
        </div>
      </div>

      <div class="compact-section-label">Recursos</div>
      <div class="compact-resources">${resHTML}</div>

      <div class="compact-section-label">Atributos</div>
      <div class="compact-attrs">${attrsHTML}</div>

      <div class="compact-section-label">Derivados</div>
      <div class="compact-subattrs-row">${subattrsHTML}</div>

      <div class="compact-section-label">Modos Narrativos</div>
      <div class="compact-modos">${modosHTML}</div>

      ${escolhasHTML}
      ${habsNomesHTML}
      ${equipNomesHTML}
      ${listNomes(sheet.tracos, 'Traços')}
      ${listNomes(sheet.vantagens, 'Vantagens')}
      ${listNomes(sheet.vulnerabilidades, 'Vulnerabilidades')}

      <div style="text-align:center;color:var(--ornament-color);margin-top:20px;letter-spacing:0.4em;">✦ ❧ ✦</div>
    </div>`;
}

function updateRecursoAtual(recurso, valor, max) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  _migrarRecAtual(sheet);
  const v = Math.max(0, Math.min(parseInt(valor) || 0, max));
  sheet._recAtual[recurso] = v;
  // Atualiza barra no editor principal
  ajustarRecurso && _atualizarBarraUnica(sheet, recurso);
  // Atualiza barra na view compacta
  const bar = document.getElementById('resbar-' + recurso.toLowerCase());
  if (bar) bar.style.width = (max > 0 ? (v/max)*100 : 0) + '%';
  debounceSave();
}

function renderFichaExpandida() {
  const container = document.getElementById('expandedSheetContent');
  if (!container) return;
  if (!currentSheetId) {
    container.innerHTML = '<div class="empty-state" style="padding:60px 20px;color:var(--text-muted);"><div class="empty-state-icon">📜</div><h3>Nenhuma ficha aberta</h3></div>';
    return;
  }
  saveCurrentSheet(true);
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;

  const attrs    = sheet.atributos || {};
  const modos    = sheet.modos    || {};
  const rec      = calcRecursos(sheet);
  const der      = calcularTodosDerivados(sheet);
  const allAttrs = ATTRS_GROUPS.flat();
  _migrarRecAtual(sheet);

  const modesValues = Object.values(modos);
  const maxM = modesValues.length ? Math.max(...modesValues) : 0;

  // ════════════════════════════════════════════════════════
  // HELPER: bloco padrão
  // ════════════════════════════════════════════════════════
  const block = (title, inner) => inner
    ? `<div class="expanded-block"><div class="expanded-block-title">${title}</div>${inner}</div>`
    : '';

  // ════════════════════════════════════════════════════════
  // 1. RECURSOS — barras visuais (read-only)
  // ════════════════════════════════════════════════════════
  const recRows = ['HP','MP','SP','SAN'].map(k => {
    const meta = _RES_META[k];
    const max  = rec[k];
    const cur  = sheet._recAtual[k] ?? max;
    const pct  = max > 0 ? Math.max(0,Math.min(100,(cur/max)*100)) : 0;
    // Quais atributos influenciam cada recurso (para o jogador entender)
    const influencias = { HP:'VIDA · CON', MP:'MAG · INT', SP:'CON · AGI', SAN:'VON · SAB' };
    return `<div class="resource-bar-wrap">
      <div class="resource-bar-header">
        <div>
          <span class="resource-bar-name" style="color:${meta.cor}">${meta.icon} ${k}</span>
          <span style="font-size:0.68rem;color:var(--text-muted);margin-left:6px;">influenciado por ${influencias[k]}</span>
        </div>
        <span class="resource-bar-value" style="color:${meta.cor};font-weight:700;">${cur} / ${max}</span>
      </div>
      <div class="resource-bar-track">
        <div class="resource-bar-fill" style="width:${pct}%;background:${pct<=meta.danger*100?meta.gradLow:meta.grad};"></div>
      </div>
    </div>`;
  }).join('');

  // ════════════════════════════════════════════════════════
  // 2. ATRIBUTOS BASE
  // ════════════════════════════════════════════════════════
  const attrRows = allAttrs.map(a => {
    const base  = attrs[a] ?? 0;
    const bonus = (sheet.raceBonus && sheet.raceBonus[a]) || 0;
    const total = base + bonus;
    const cls   = total > 0 ? 'pos' : total < 0 ? 'neg' : 'zero';
    const bonusLabel = bonus !== 0
      ? `<span style="font-size:0.65rem;color:var(--text-muted);margin-left:3px;">(base ${base>0?'+':''}${base} ${bonus>0?'+':''}${bonus} racial)</span>`
      : '';
    return `<div class="read-attr">
      <div class="read-attr-label">${a}</div>
      <div class="read-attr-val ${cls}">${total > 0 ? '+'+total : total}</div>
      ${bonusLabel}
    </div>`;
  }).join('');

  // ════════════════════════════════════════════════════════
  // 3. DERIVADOS — valor + o que influencia (sem fórmula)
  // ════════════════════════════════════════════════════════
  const derivGroups = [
    { title:'🏃 Mobilidade & Defesa', items:[
      { key:'MV',        val:der.MV,        label:'Movimento',       influence:'AGI',            desc:'Metros que você pode mover por turno em ação de Movimento.' },
      { key:'EV',        val:der.EV,        label:'Esquiva',         influence:'DES · AGI',       desc:'Bônus em testes para desviar de ataques ou efeitos de área.' },
      { key:'BLK',       val:der.BLK,       label:'Bloqueio',        influence:'FOR · DES',       desc:'Redução de dano ao bloquear com escudo ou corpo a corpo.' },
      { key:'DEF_TOTAL', val:der.DEF_TOTAL, label:'DEF Total',       influence:'DEF · CON · FOR · armadura', desc:'Defesa física total incluindo equipamento. Reduz dano direto.' },
      { key:'MR_TOTAL',  val:der.MR_TOTAL,  label:'MR Total',        influence:'RESM · VON · CON · escudo',  desc:'Resistência mágica total. Reduz dano e efeitos mágicos.' },
    ]},
    { title:'⚔️ Combate & Magia', items:[
      { key:'ATK_TOTAL', val:der.ATK_TOTAL, label:'ATK Total',       influence:'ATQ · DES · FOR · arma',     desc:'Bônus de ataque total com a arma equipada. Afeta testes de acerto.' },
      { key:'PWR',       val:der.PWR,       label:'Poder Mágico',    influence:'MAG · INT',       desc:'Força das suas magias e habilidades mágicas.' },
    ]},
    { title:'🧠 Testes & Sorte', items:[
      { key:'WIL',       val:der.WIL,       label:'Vontade',         influence:'VON · CON',       desc:'Resistência mental. Usado em testes contra medo, charme e controle.' },
      { key:'PER_TESTE', val:der.PER_TESTE, label:'Percepção',       influence:'PER · SAB · AGI', desc:'Capacidade de notar detalhes, armadilhas e ameaças ocultas.' },
      { key:'LK',        val:der.LK,        label:'Sorte',           influence:'CAR · SAB',       desc:'Bônus base para eventos e testes com fator aleatório.' },
    ]},
  ];
  const subRows = derivGroups.map(g => {
    const rows = g.items.map(({val, label, influence, desc}) => {
      const sign = val >= 0 ? '+' : '';
      return `<div class="expanded-hab-item" style="padding:10px 14px;margin-bottom:6px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <span style="font-weight:700;font-size:.88rem;color:var(--text-primary);">${label}</span>
            <span style="font-size:.68rem;color:var(--lavanda);margin-left:8px;font-weight:600;">${influence}</span>
          </div>
          <div style="font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700;color:var(--text-accent);">${sign}${val}</div>
        </div>
        <div style="font-size:.78rem;color:var(--text-muted);margin-top:3px;">${desc}</div>
      </div>`;
    }).join('');
    return `<div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin-bottom:6px;">${g.title}</div>${rows}`;
  }).join('');

  // ════════════════════════════════════════════════════════
  // 4. MODOS NARRATIVOS + descrição de como funcionam
  // ════════════════════════════════════════════════════════
  const modosDesc = {
    Bruto:'Força bruta, resistência e combate físico direto.',
    Ágil:'Agilidade, acrobacia e reações rápidas.',
    Preciso:'Técnica, concentração e precisão cirúrgica.',
    Intuitivo:'Instinto, leitura de situações e criatividade.',
  };
  const modosHTML = Object.entries(modos).map(([k,v]) =>
    `<div class="read-modo ${v===maxM&&v>1?'dominant':''}">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-weight:700;">${k}</span>
        <strong style="font-family:'Playfair Display',serif;font-size:1.2rem;">${v}</strong>
      </div>
      <div style="font-size:0.72rem;color:var(--text-muted);margin-top:3px;">${modosDesc[k]||''}</div>
    </div>`).join('');

  // ════════════════════════════════════════════════════════
  // 5. RAÇA & CONCEITO (conceito narrativo da raça escolhida)
  // ════════════════════════════════════════════════════════
  let racaBlock = '';
  let race = null;
  if (sheet.raceSelecionada && typeof RACES_DB !== 'undefined') {
    race = RACES_DB.find(r => r.name === sheet.raceSelecionada);
    if (race) {
      const profRows = race.proficiencias ? Object.entries(race.proficiencias).filter(([k]) => k !== 'progressao').map(([k,v]) => {
        const labels = {armas:'Armas',armaduras:'Armaduras',escolas:'Escolas Mágicas',afinidades:'Afinidades',tipoMagico:'Tipo Mágico',skillsIniciais:'Skills Iniciais',periciasBonus:'Perícias Bônus'};
        const val = Array.isArray(v) ? v.join(', ') : String(v);
        return `<div style="display:flex;gap:8px;padding:4px 0;border-bottom:1px solid var(--border-light);font-size:0.82rem;">
          <span style="color:var(--text-muted);min-width:110px;flex-shrink:0;">${labels[k]||k}</span>
          <span style="color:var(--text-secondary);">${escapeHtml(val)}</span>
        </div>`;
      }).join('') : '';

      racaBlock = `
        ${race.conceito ? `<div style="font-style:italic;color:var(--text-secondary);font-size:0.88rem;line-height:1.6;margin-bottom:14px;padding:10px 14px;background:var(--bg-secondary);border-left:3px solid var(--lavanda);border-radius:0 var(--radius-sm) var(--radius-sm) 0;">"${escapeHtml(race.conceito)}"</div>` : ''}
        ${race.observacao ? `<div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:12px;padding:8px 12px;background:var(--lavanda-light);border-radius:var(--radius-sm);">⚙ ${escapeHtml(race.observacao)}</div>` : ''}
        ${profRows ? `<div style="margin-top:8px;">${profRows}</div>` : ''}`;
    }
  }

  // ════════════════════════════════════════════════════════
  // 6. SUBRA​ÇA — se escolhida
  // ════════════════════════════════════════════════════════
  let subracaBlock = '';
  if (race && sheet.subraçaSelecionada) {
    const sub = (race.subraças||[]).find(s => s.name === sheet.subraçaSelecionada);
    if (sub) {
      const subAttrBonuses = sub.atributos
        ? Object.entries(sub.atributos).filter(([,v])=>v!==0).map(([k,v])=>`${k}: ${v>0?'+':''}${v}`).join(', ')
        : '';
      subracaBlock = `
        <div style="font-size:0.8rem;font-weight:700;color:var(--text-accent);margin-bottom:8px;">Subtipo: ${escapeHtml(sub.name)}</div>
        ${sub.conceito ? `<div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;margin-bottom:10px;">${escapeHtml(sub.conceito)}</div>` : ''}
        ${subAttrBonuses ? `<div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:8px;">Bônus: ${subAttrBonuses}</div>` : ''}
        ${sub.mecanica ? `<div style="font-size:0.83rem;color:var(--text-secondary);padding:8px 12px;background:var(--bg-secondary);border-left:3px solid var(--celeste);border-radius:0 var(--radius-sm) var(--radius-sm) 0;">⚙ ${escapeHtml(sub.mecanica)}</div>` : ''}`;
    }
  }

  // ════════════════════════════════════════════════════════
  // 7. VARIAÇÃO LOCUS / CULTURAL — com descrição completa
  // ════════════════════════════════════════════════════════
  let variacaoBlock = '';
  if (race && sheet.variacaoLocus) {
    const vari = (race.variacoes||[]).find(v => v.id === sheet.variacaoLocus);
    if (vari) {
      variacaoBlock = `
        <div style="font-size:0.8rem;font-weight:700;color:var(--text-accent);margin-bottom:6px;">Variação: ${escapeHtml(vari.nome)}</div>
        <div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;">${escapeHtml(vari.desc)}</div>`;
    }
  }

  // ════════════════════════════════════════════════════════
  // 8. MECÂNICA RACIAL
  // ════════════════════════════════════════════════════════
  let mecanicaBlock = '';
  if (race && race.mecanica) {
    mecanicaBlock = `<div class="expanded-mecanica-block">
      <div class="expanded-mecanica-title">⚙ Mecânica: ${escapeHtml(race.name)}</div>
      <div class="expanded-mecanica-desc">${escapeHtml(race.mecanica)}</div>
    </div>`;
  }
  if (race && sheet.subraçaSelecionada) {
    const sub = (race.subraças||[]).find(s => s.name === sheet.subraçaSelecionada);
    if (sub?.mecanica) {
      mecanicaBlock += `<div class="expanded-mecanica-block" style="margin-top:8px;">
        <div class="expanded-mecanica-title">⚙ Mecânica: ${escapeHtml(sub.name)}</div>
        <div class="expanded-mecanica-desc">${escapeHtml(sub.mecanica)}</div>
      </div>`;
    }
  }

  // ════════════════════════════════════════════════════════
  // 9. CAMINHO DE PROGRESSÃO — com descrição e habilidades
  // ════════════════════════════════════════════════════════
  let caminhoBlock = '';
  if (race && sheet.caminhoEscolhido) {
    const caminho = (race.progressao?.caminhos||[]).find(c => c.nome === sheet.caminhoEscolhido);
    if (caminho) {
      const habsProgAtivas = (sheet.progressaoAtiva||[]);
      const habsAprendidas = (sheet.habilidadesAprendidas||[]);

      // Habilidades do núcleo desbloqueadas
      const nucleo = (race.progressao?.nucleo||[]).filter(h =>
        habsProgAtivas.includes(h.id) || habsAprendidas.includes(h.id)
      );
      const caminhoHabs = (caminho.habilidades||[]).filter(h =>
        habsProgAtivas.includes(h.id) || habsAprendidas.includes(h.id)
      );

      const renderHabProg = (h) => {
        const tipoCls = h.tipo === 'passiva' ? 'hab-tipo-passiva' : 'hab-tipo-progressao';
        const tipoLabel = h.tipo === 'passiva' ? 'Passiva' : 'Progressão';
        return `<div class="expanded-hab-item">
          <div class="expanded-hab-nome">
            ${escapeHtml(h.nome)}
            <span class="hab-tipo-badge ${tipoCls}">${tipoLabel}</span>
          </div>
          ${h.req ? `<div class="hab-req" style="font-size:0.72rem;color:var(--attr-warn);margin-bottom:4px;">⚠ Req: ${escapeHtml(h.req)}</div>` : ''}
          <div class="expanded-hab-desc">${escapeHtml(h.desc||'Sem descrição.')}</div>
        </div>`;
      };

      caminhoBlock = `
        <div style="background:var(--lavanda-light);border:1.5px solid var(--lavanda);border-radius:var(--radius-md);padding:12px 16px;margin-bottom:14px;">
          <div style="font-family:'Playfair Display',serif;font-size:1rem;font-weight:700;color:var(--text-accent);margin-bottom:4px;">Caminho: ${escapeHtml(caminho.nome)}</div>
          ${caminho.foco ? `<div style="font-size:0.82rem;color:var(--text-secondary);font-style:italic;">${escapeHtml(caminho.foco)}</div>` : ''}
        </div>
        ${nucleo.length ? `<div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin-bottom:6px;">Habilidades do Núcleo</div>${nucleo.map(renderHabProg).join('')}` : ''}
        ${caminhoHabs.length ? `<div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin-bottom:6px;${nucleo.length?'margin-top:12px;':''}">Habilidades do Caminho</div>${caminhoHabs.map(renderHabProg).join('')}` : ''}
        ${(!nucleo.length && !caminhoHabs.length) ? '<div style="font-size:0.82rem;color:var(--text-muted);font-style:italic;">Nenhuma habilidade de progressão adquirida ainda.</div>' : ''}`;
    }
  }

  // ════════════════════════════════════════════════════════
  // 10. HABILIDADES RACIAIS — com descrição completa
  // ════════════════════════════════════════════════════════
  let habsBlock = '';
  if (race) {
    const todasHabsDB = [
      ...(race.habilidades||[]),
      ...(race.passivas||[]),
      ...(race.subraças||[]).flatMap(s => [...(s.habilidades||[]),...(s.passivas||[])]),
    ];
    const todasAtivas = [...(sheet.habilidadesAtivas||[]), ...(sheet.habilidadesAprendidas||[])];
    const ativas = todasHabsDB.filter(h => todasAtivas.includes(h.id));

    if (ativas.length) {
      habsBlock = ativas.map(h => {
        const neg = h.negativa;
        const tipoCls = neg ? 'hab-tipo-negativa' : h.tipo === 'passiva' ? 'hab-tipo-passiva' : 'hab-tipo-ativa';
        const tipoLabel = neg ? 'Negativa' : h.tipo === 'passiva' ? 'Passiva' : 'Ativa';
        return `<div class="expanded-hab-item ${neg ? 'negativa' : ''}">
          <div class="expanded-hab-nome">
            ${escapeHtml(h.nome)}
            <span class="hab-tipo-badge ${tipoCls}">${tipoLabel}</span>
          </div>
          ${h.req ? `<div class="hab-req" style="font-size:0.72rem;color:var(--attr-warn);margin-bottom:4px;">⚠ Req: ${escapeHtml(h.req)}</div>` : ''}
          <div class="expanded-hab-desc">${escapeHtml(h.desc||'Sem descrição.')}</div>
          ${h.efeito?.mods ? `<div style="font-size:0.72rem;color:var(--lavanda);margin-top:6px;">Efeitos: ${Object.entries(h.efeito.mods).map(([k,v])=>`${k} ${v>0?'+':''}${v}`).join(' · ')}</div>` : ''}
        </div>`;
      }).join('');
    }
  }

  // ════════════════════════════════════════════════════════
  // 11. EQUIPAMENTO — stats completos de cada item equipado
  // ════════════════════════════════════════════════════════
  let equipBlock = '';
  if (sheet.equipamento && typeof EQUIPAMENTOS_INDEX !== 'undefined') {
    const slots = {maoEsquerda:'🗡 Mão Esq.', maoDireita:'🗡 Mão Dir.', armadura:'🛡 Armadura'};
    const rows = Object.entries(slots).map(([slotKey, slotLabel]) => {
      const itemId = sheet.equipamento[slotKey];
      if (!itemId || itemId === '__locked_2h__') {
        const emptyLabel = itemId === '__locked_2h__' ? '<em style="color:var(--attr-warn);">🔒 Bloqueado (2M)</em>' : '<em style="color:var(--text-muted);">Vazio</em>';
        return `<div class="expanded-equip-row">
          <div class="expanded-equip-slot">${slotLabel}</div>
          <div class="expanded-equip-name">${emptyLabel}</div>
        </div>`;
      }
      const item = EQUIPAMENTOS_INDEX.get(itemId);
      if (!item) return '';

      let statsHTML = '';
      if (item.tipo === 'arma') {
        statsHTML = `
          <span class="equip-stat-pill atk">🎲 ${item.dado}</span>
          <span class="equip-stat-pill">${item.tipoDano}</span>
          <span class="equip-stat-pill">${item.empunhadura}</span>
          <span class="equip-stat-pill">⚖ ${item.peso}kg</span>
          <span class="equip-stat-pill preco">💰 ${item.preco}P</span>`;
      } else if (item.tipo === 'armadura') {
        statsHTML = `
          <span class="equip-stat-pill def">🛡 DEF +${item.rd}</span>
          <span class="equip-stat-pill">CA +${item.ca}</span>
          ${item.rm ? `<span class="equip-stat-pill mag">RM +${item.rm}</span>` : ''}
          ${item.penalidade ? `<span class="equip-stat-pill pen">AGI ${item.penalidade}</span>` : ''}
          <span class="equip-stat-pill">⚖ ${item.peso}kg</span>`;
      } else if (item.tipo === 'escudo') {
        statsHTML = `
          <span class="equip-stat-pill def">🛡 DEF +${item.defesa}</span>
          <span class="equip-stat-pill">Dur. ${item.durabilidade}</span>
          ${item.penalidade ? `<span class="equip-stat-pill pen">AGI ${item.penalidade}</span>` : ''}
          <span class="equip-stat-pill">⚖ ${item.peso}kg</span>`;
      }

      return `<div class="expanded-equip-row">
        <div class="expanded-equip-slot">${slotLabel}</div>
        <div style="flex:1;">
          <div class="expanded-equip-name">${escapeHtml(item.nome)}</div>
          ${item.categoria ? `<div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:4px;">${item.categoria}</div>` : ''}
          <div class="expanded-equip-stats">${statsHTML}</div>
          ${item.critico ? `<div style="font-size:0.72rem;color:var(--text-muted);margin-top:4px;">Crítico: <b>${item.critico}</b></div>` : ''}
          ${item.requisitos ? `<div style="font-size:0.72rem;color:var(--attr-warn);margin-top:2px;">Req: ${Object.entries(item.requisitos).map(([k,v])=>k+' '+v).join(', ')}</div>` : ''}
        </div>
      </div>`;
    }).join('');
    equipBlock = rows || '<p style="color:var(--text-muted);font-style:italic;">Nenhum equipamento equipado.</p>';
  }

  // ════════════════════════════════════════════════════════
  // 12. INVENTÁRIO
  // ════════════════════════════════════════════════════════
  const inv = sheet.inventario || [];
  const invBlock = inv.length
    ? inv.map(item => `<div class="expanded-inv-item">
        <span class="expanded-inv-qty">×${item.quantidade ?? 1}</span>
        <span style="flex:1;font-size:0.85rem;color:var(--text-primary);">${escapeHtml(item.nome || item.id)}</span>
        ${item.peso ? `<span style="font-size:0.75rem;color:var(--text-muted);">${item.peso}kg</span>` : ''}
      </div>`).join('')
    : '';

  // ════════════════════════════════════════════════════════
  // 13. TRAÇOS / VANTAGENS / VULNERABILIDADES
  // ════════════════════════════════════════════════════════
  const sectionBlock = (label, icon, arr) => {
    const items = (arr||[]).filter(x=>x);
    if (!items.length) return '';
    return `<div class="expanded-block">
      <div class="expanded-block-title">${icon} ${label}</div>
      <ul class="read-list">${items.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul>
    </div>`;
  };

  // ════════════════════════════════════════════════════════
  // 14. PERÍCIAS
  // ════════════════════════════════════════════════════════
  const pericias = sheet.pericias || {};
  const periciaRows = Object.entries(pericias).filter(([,v]) => v !== 0).map(([nome, val]) =>
    `<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--border-light);font-size:0.85rem;">
      <span style="color:var(--text-primary);">${escapeHtml(nome)}</span>
      <span style="font-family:'Playfair Display',serif;font-size:1.05rem;font-weight:700;color:${val>0?'var(--attr-pos)':'var(--attr-neg)'};">${val>0?'+':''}${val}</span>
    </div>`).join('');

  // ════════════════════════════════════════════════════════
  // 15. BACKGROUND
  // ════════════════════════════════════════════════════════
  const bgFields = [
    {label:'Origem',           val: sheet.bgOrigem},
    {label:'Memória Marcante', val: sheet.bgMemoria},
    {label:'Objetivo',         val: sheet.bgObjetivo},
    {label:'Motivação',        val: sheet.bgMotivacao},
    {label:'Valores',          val: sheet.bgValores},
  ].filter(f => f.val);
  const bgBlock = bgFields.length
    ? bgFields.map(f => `<div style="margin-bottom:14px;">
        <div style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin-bottom:4px;">${f.label}</div>
        <div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;">${escapeHtml(f.val)}</div>
      </div>`).join('')
    : '';

  // ════════════════════════════════════════════════════════
  // MONTAGEM FINAL
  // ════════════════════════════════════════════════════════
  const emojis = { 'Base':'🌱','Celestial':'✨','Excêntrica':'🌀' };

  container.innerHTML = `
    <div class="expanded-sheet">
      <div style="text-align:center;margin-bottom:8px;color:var(--ornament-color);letter-spacing:0.4em;">✦ ❧ ✦</div>

      <h1 style="font-family:'Playfair Display',serif;font-size:2rem;font-weight:700;color:var(--text-accent);text-align:center;margin-bottom:6px;">${escapeHtml(sheet.name || 'Sem nome')}</h1>
      <div style="text-align:center;margin-bottom:${sheet.conceitoNarrativo ? '10px' : '24px'};display:flex;justify-content:center;gap:8px;flex-wrap:wrap;">
        <span class="badge badge-${(sheet.classificacao||'base').toLowerCase()}">${sheet.classificacao||'Base'}</span>
        ${sheet.raceSelecionada ? `<span class="badge badge-player">${escapeHtml(sheet.raceSelecionada)}</span>` : ''}
        ${sheet.subraçaSelecionada ? `<span class="badge" style="background:var(--celeste-light);color:var(--celeste-dark);">${escapeHtml(sheet.subraçaSelecionada)}</span>` : ''}
        <span class="badge badge-npc">Nível ${sheet.nivel||1}</span>
        ${sheet.modificador ? `<span class="badge" style="background:var(--lavanda-light);color:var(--lavanda-dark);">${sheet.modificador==='Aika'?'💠 Aika':'🔶 Ukya'}</span>` : ''}
      </div>
      ${sheet.conceitoNarrativo ? `<div style="font-style:italic;text-align:center;color:var(--text-secondary);font-size:0.95rem;line-height:1.7;font-family:'Playfair Display',serif;margin-bottom:24px;">"${escapeHtml(sheet.conceitoNarrativo)}"</div>` : ''}

      ${block('💚 Recursos', recRows)}
      ${block('⚡ Atributos Base', `<div class="read-attrs-grid">${attrRows}</div>`)}
      ${block('📊 Derivados', subRows)}
      ${block('🎭 Modos Narrativos', `<div class="read-modos-row">${modosHTML}</div>`)}

      ${race ? block(`${emojis[race.classificacao]||'✦'} Raça: ${escapeHtml(race.name)}`, racaBlock) : ''}
      ${subracaBlock ? block('🔀 Subtipo Racial', subracaBlock) : ''}
      ${variacaoBlock ? block('🏛 Variação Cultural / Locus', variacaoBlock) : ''}
      ${mecanicaBlock ? block('⚙ Mecânicas Raciais', mecanicaBlock) : ''}
      ${caminhoBlock ? block('🛤 Caminho de Progressão', caminhoBlock) : ''}
      ${habsBlock ? block('⚡ Habilidades Raciais', habsBlock) : ''}

      ${sectionBlock('Traços Fixos', '📌', sheet.tracos)}
      ${sectionBlock('Vantagens Situacionais', '✅', sheet.vantagens)}
      ${sectionBlock('Vulnerabilidades', '⚠', sheet.vulnerabilidades)}

      ${block('⚔️ Equipamento', equipBlock)}
      ${invBlock ? block('🎒 Inventário', invBlock) : ''}
      ${periciaRows ? block('🎓 Perícias', periciaRows) : ''}
      ${bgBlock ? block('📖 Background', bgBlock) : ''}

      <div style="text-align:center;color:var(--ornament-color);margin-top:24px;letter-spacing:0.4em;">✦ ❧ ✦</div>
    </div>`;
}

/* Fix: ensure _recAtual is saved & migrated */
function restoreAppState() {
  const hash = window.location.hash;
  if (hash === '#new') {
    newSheet();
    if (history.replaceState) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    } else {
      window.location.hash = '';
    }
    return;
  }

  const lastPage = localStorage.getItem(LAST_PAGE_KEY) || 'library';
  const activeSheetId = localStorage.getItem(ACTIVE_SHEET_KEY);

  if (lastPage === 'editor' && activeSheetId && getSheet(activeSheetId)) {
    openSheet(activeSheetId);
    return;
  }

  if (activeSheetId && !getSheet(activeSheetId)) {
    localStorage.removeItem(ACTIVE_SHEET_KEY);
  }

  showPage(lastPage);
}

function init() {
  localStorage.setItem('companion_last_system', 'verloren');
  loadData();
  applyTheme(appData.config.theme || 'light');
  renderLibrary();

  // Fecha modais ao clicar fora
  initModalClickOutside();

  // Tab presets
  document.getElementById('tab-presets').addEventListener('click', () => showPage('presets'));

  // Tecla ESC fecha modais e modo leitura
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
      document.getElementById('readModeOverlay').classList.remove('open');
    }
  });

  // Marca grupo ativo inicial no sistema (Personagem)
  const grpBtn = document.getElementById('sgrpbtn-personagem');
  if (grpBtn) grpBtn.classList.add('has-active');

  // Marca grupo ativo inicial no mundo (Universo)
  const mundoGrpBtn = document.getElementById('sgrpbtn-mundo-universo');
  if (mundoGrpBtn) mundoGrpBtn.classList.add('has-active');

  if (typeof refreshInstallState === 'function') refreshInstallState();
  restoreAppState();
  if (window.CompanionUI && typeof window.CompanionUI.renderVerlorenSystemWorkbench === 'function') {
    window.CompanionUI.renderVerlorenSystemWorkbench(getSheet(currentSheetId));
  }

  // Se não há fichas, mostra estado vazio com dica
  if (!appData.sheets.length) {
    setTimeout(() => toast('Bem-vindo ao Verloren RPG Sheets! Crie sua primeira ficha ou pré-carregue as raças. ✦', 'info'), 500);
  }
}

document.addEventListener('DOMContentLoaded', init);
