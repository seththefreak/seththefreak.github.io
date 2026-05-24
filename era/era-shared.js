/*
 * Audit refactor:
 * - Preserved shared ERA constants and mechanics while documenting this shared surface.
 * - Enlarged compact shared buttons to meet touch-target guidance without changing actions.
 * - Exposes PDF-sourced compendium tables for the ERA reference UI.
 */
const { useState, useEffect, useCallback, useMemo, useRef } = React;

const SOURCE_DATA = window.ERA_DATA;
const C = {
  ...SOURCE_DATA.C,
  bg: "#0F1115",
  bg2: "#1A1D24",
  bg3: "#2A2F3A",
  border: "#3A4150",
  text: "#E5E7EB",
  muted: "#6B7280",
  corpo: "#DC2626",
  corpoDark: "#B91C1C",
  corpoAccent: "#E06A6A",
  sangue: "#7F1D1D",
  mente: "#36B7C8",
  menteLight: "#79C9D4",
  menteDark: "#0D7487",
  menteNeon: "#22D3EE",
  alma: "#A78BFA",
  almaLight: "#C4B5FD",
  almaDark: "#6D5DD3",
  almaGlow: "#7C6DD6",
  gold: "#FDE68A",
  goldWarm: "#FCD34D",
  goldDark: "#BFA14A",
  goldGlow: "#FFF7CC",
  green: "#7EA391",
  success: "#7EA391",
  warning: "#BFA14A",
  danger: "#DC2626",
};
const APP_VERSION = "3.4.1";
const FONT_TEXT = '"Merriweather","Lora",Georgia,serif';
const FONT_DISPLAY = '"Playfair Display","Noto Serif Display",Georgia,serif';
const FONT_SYSTEM = '"IBM Plex Mono","Inconsolata","Courier Prime",monospace';
const TIERS = SOURCE_DATA.TIERS;
const APT_SYMBOLS = SOURCE_DATA.APT_SYMBOLS || ["○", "◎", "◆", "❖", "✦"];
const APT_DIFFS = SOURCE_DATA.APT_DIFFS || [];
const TIER_DT = SOURCE_DATA.TIER_DT;
const PILARS = {
  ...SOURCE_DATA.PILARS,
  corpo: { ...SOURCE_DATA.PILARS.corpo, color: C.corpoAccent },
  mente: { ...SOURCE_DATA.PILARS.mente, color: C.mente },
  alma: { ...SOURCE_DATA.PILARS.alma, color: C.alma },
};
const SUBS = SOURCE_DATA.SUBS;
const DMG_COLS = SOURCE_DATA.DMG_COLS;
const DMG_ROWS = SOURCE_DATA.DMG_ROWS;
const WEAPONS = SOURCE_DATA.WEAPONS;
const ARMORS = SOURCE_DATA.ARMORS;
const ELEMENTOS = SOURCE_DATA.ELEMENTOS;
const FORMAS = SOURCE_DATA.FORMAS;
const PROPS = SOURCE_DATA.PROPS;
const STYLE_AFFINITY = SOURCE_DATA.STYLE_AFFINITY || [];
const STYLE_REACTION_RULES = SOURCE_DATA.STYLE_REACTION_RULES || { allow: [], block: [], parry: [] };
const WEAPON_STYLE_MAP = SOURCE_DATA.WEAPON_STYLE_MAP || [];
const STYLE_DETAILS = SOURCE_DATA.STYLE_DETAILS || [];
const ADVANCED_SYSTEMS = SOURCE_DATA.ADVANCED_SYSTEMS || { alchemy: [], chaining: { flow: [], turns: [], detectability: [] }, projects: { tiers: [], quality: [] }, relics: { tiers: [], willNotes: [] } };
const PDF_SOURCE_GUIDES = SOURCE_DATA.PDF_SOURCE_GUIDES || [];
const KW_GUIDE = SOURCE_DATA.KW_GUIDE || { principles: [], flow: [], intensities: [], actionTypes: [], bonus: [], healingScale: [], stacking: [] };
const MANIFESTATION_ADVANCED_REFERENCE = SOURCE_DATA.MANIFESTATION_ADVANCED_REFERENCE || {
  prerequisites: [],
  soulUnlocks: [],
  forms: [],
  elementalWeapons: [],
  propertyBands: [],
  conflicts: [],
  synergies: [],
};
const COMBAT_PRESSURE_SYSTEM = SOURCE_DATA.COMBAT_PRESSURE_SYSTEM || {
  states: [],
  damageSources: [],
  criticalByState: [],
  execution: [],
  sniperAim: [],
  synergies: [],
  styleRoles: [],
};
const ACOES = SOURCE_DATA.ACOES;
const DT_TABLE = SOURCE_DATA.DT_TABLE;
const RECOVERY = SOURCE_DATA.RECOVERY || [];
const OVERDRAFT = SOURCE_DATA.OVERDRAFT || [];
const TRAUMAS = SOURCE_DATA.TRAUMAS || [];
const EXHAUSTION = SOURCE_DATA.EXHAUSTION || [];
const DAMAGE_TYPE_RULES = SOURCE_DATA.DAMAGE_TYPE_RULES || [];
const COMBAT_SEQUENCE = SOURCE_DATA.COMBAT_SEQUENCE || [];
const DODGE_REACTIONS = SOURCE_DATA.DODGE_REACTIONS || [];
const PARRY_REACTIONS = SOURCE_DATA.PARRY_REACTIONS || [];
const SANITY_LOSS = SOURCE_DATA.SANITY_LOSS || [];
const CONTROL_MANEUVERS = SOURCE_DATA.CONTROL_MANEUVERS || [];
const POSITIONING_RULES = SOURCE_DATA.POSITIONING_RULES || [];
const LUCK_ROLL = SOURCE_DATA.LUCK_ROLL || [];
const LEVELS = SOURCE_DATA.LEVELS;

const AMP_THRESHOLDS = [0, 1, 3, 6, 10, 15];
const AMP_LABELS = ["+0", "+1-2", "+3-5", "+6-9", "+10-14", "+15+"];
const MANIFESTATION_ACTIONS = [
  { maxKw: 3, rangeLabel: "1-3 KW", short: "m", tierLabel: "Simples", label: "m - Simples", detail: "Acao Menor", color: C.menteLight },
  { maxKw: 7, rangeLabel: "4-7 KW", short: "Mv", tierLabel: "Avancada", label: "Mv - Avancada", detail: "Movimento", color: C.mente },
  { maxKw: 14, rangeLabel: "8-14 KW", short: "M", tierLabel: "Completa", label: "M - Completa", detail: "Acao Maior", color: C.gold },
  { maxKw: Infinity, rangeLabel: "15+ KW", short: "C", tierLabel: "Extrema", label: "C - Extrema", detail: "Acao Completa", color: C.corpoAccent },
];
const GRIP_LABELS = {
  "1M": "Uma mao",
  "2M": "Duas maos",
  D: "Emp. dupla",
};

const SUB_TO_PILAR = Object.entries(PILARS).reduce((acc, [pillarId, pillar]) => {
  pillar.subs.forEach((subId) => {
    acc[subId] = pillarId;
  });
  return acc;
}, {});

const PERICIAS_LIST = [
  { id: "atletismo", label: "Atletismo", category: "fisicas", groupPilar: "corpo", bases: ["forca", "destreza", "constituicao"] },
  { id: "furtividade", label: "Furtividade", category: "fisicas", groupPilar: "corpo", bases: ["destreza"] },
  { id: "golpe", label: "Golpe", category: "fisicas", groupPilar: "corpo", bases: ["forca", "destreza"] },
  { id: "pontaria", label: "Pontaria", category: "fisicas", groupPilar: "corpo", bases: ["destreza"] },
  { id: "travessia", label: "Travessia", category: "fisicas", groupPilar: "corpo", bases: ["destreza", "constituicao"] },
  { id: "pilotagem", label: "Pilotagem", category: "fisicas", groupPilar: "corpo", bases: ["destreza", "intelecto"] },
  { id: "manejo", label: "Manejo", category: "fisicas", groupPilar: "corpo", bases: ["forca", "destreza"] },
  { id: "coordenacao", label: "Coordenacao", category: "fisicas", groupPilar: "corpo", bases: ["destreza"] },
  { id: "fortitude", label: "Fortitude", category: "fisicas", groupPilar: "corpo", bases: ["constituicao", "vontade"] },
  { id: "coleta", label: "Coleta", category: "fisicas", groupPilar: "corpo", bases: ["sabedoria", "destreza"] },

  { id: "percepcao", label: "Percepcao", category: "mentais", groupPilar: "mente", bases: ["sabedoria", "sintonia"] },
  { id: "investigacao", label: "Investigacao", category: "mentais", groupPilar: "mente", bases: ["intelecto", "sabedoria"] },
  { id: "medicina", label: "Medicina", category: "mentais", groupPilar: "mente", bases: ["intelecto", "sabedoria"] },
  { id: "tecnologia", label: "Tecnologia", category: "mentais", groupPilar: "mente", bases: ["intelecto"] },
  { id: "cognicao", label: "Cognicao", category: "mentais", groupPilar: "mente", bases: ["intelecto"] },
  { id: "sobrevivencia", label: "Sobrevivencia", category: "mentais", groupPilar: "mente", bases: ["sabedoria", "constituicao"] },
  { id: "oficio", label: "Oficio (X)", category: "mentais", groupPilar: "mente", bases: ["intelecto", "destreza", "sabedoria"] },
  { id: "conhecimento", label: "Conhecimento (X)", category: "mentais", groupPilar: "mente", bases: ["intelecto", "sabedoria"] },

  { id: "persuasao", label: "Persuasao", category: "sociais", groupPilar: "mente", bases: ["sabedoria", "vontade"] },
  { id: "enganacao", label: "Enganacao", category: "sociais", groupPilar: "mente", bases: ["intelecto", "sabedoria"] },
  { id: "intimidacao", label: "Intimidacao", category: "sociais", groupPilar: "mente", bases: ["vontade", "forca"] },
  { id: "influencia", label: "Influencia", category: "sociais", groupPilar: "mente", bases: ["sabedoria", "vontade"] },
  { id: "comunicacao", label: "Comunicacao", category: "sociais", groupPilar: "mente", bases: ["intelecto", "vontade"] },
  { id: "performance", label: "Performance", category: "sociais", groupPilar: "mente", bases: ["destreza", "vontade"] },

  { id: "ocultismo", label: "Ocultismo", category: "especiais", groupPilar: "alma", bases: ["intelecto", "dominio", "sintonia"] },
  { id: "iniciativa", label: "Iniciativa", category: "especiais", groupPilar: "corpo", bases: ["destreza", "sabedoria"] },
  { id: "sorte", label: "Sorte", category: "especiais", groupPilar: "alma", bases: ["sabedoria", "sintonia"] },
];

const PERICIA_GROUPS = [
  { id: "fisicas", label: "Fisicas", color: C.corpoAccent },
  { id: "mentais", label: "Mentais", color: C.mente },
  { id: "sociais", label: "Sociais", color: C.gold },
  { id: "especiais", label: "Especiais", color: C.alma },
];

const EXTRA_CONDS = [];
const CONDS = [...SOURCE_DATA.CONDS, ...EXTRA_CONDS];
const DEFAULT_SUBS = Object.fromEntries(Object.keys(SUBS).map((key) => [key, { tier: 0, prog: 0 }]));
const DEFAULT_PERICIAS = Object.fromEntries(PERICIAS_LIST.map((pericia) => [pericia.id, { tier: 0, prog: 0 }]));

const DEFAULT_CHAR = {
  name: "Personagem",
  level: 1,
  concept: "",
  marca: "",
  avatar: "",
  pilares: { corpo: 1, mente: 1, alma: 0 },
  subs: { ...DEFAULT_SUBS },
  pericias: { ...DEFAULT_PERICIAS },
  hp: { cur: 24, max: 24 },
  sp: { cur: 100, max: 100 },
  pe: { cur: 12, max: 12 },
  exaustao: 0,
  condicoes: [],
  habilidades: "",
  habilidadesAprendidas: [],
  manifestacoesDef: "",
  determinacao: 0,
  notas: "",
  effects: [],
};

const EFFECT_PRESETS = [
  { name: "Foco Tatico", roll: 1, damage: 0, initiative: 1, notes: "Leitura de combate e sincronia com o turno." },
  { name: "Golpe Preciso", roll: 0, damage: 2, initiative: 0, notes: "Especialidade ofensiva aplicada em combate." },
  { name: "Postura de Guarda", roll: 1, damage: 0, initiative: 0, notes: "Concentracao defensiva e estabilidade." },
  { name: "Surto Paranormal", roll: 2, damage: 1, initiative: 0, notes: "Manifestacao mais intensa por um curto periodo." },
];

const CHARACTER_EXAMPLES = [
  {
    id: "detetive-estigmatizado",
    name: "Iori",
    concept: "Detetive marcado pela Malha",
    marca: "Sinal trino na palma da mao",
    habilidades: "Olhar treinado, leitura de cena, resistencia mental.",
    manifestacoesDef: "Nebula + Nuvem | Lux + Bola | Umbra + Fio",
    notas: "Opera bem em investigacao urbana e ancoras sobrenaturais.",
    effects: [
      { name: "Raciocinio Frio", roll: 1, damage: 0, initiative: 0, notes: "Aplica em leitura de pistas ou tomada de decisao." },
      { name: "Disparo Calculado", roll: 0, damage: 1, initiative: 1, notes: "Combate a distancia com preparo." },
    ],
  },
  {
    id: "vigilante-do-vazio",
    name: "Ka'ai",
    concept: "Executor de campo com afinidade extrema",
    marca: "Halo fragmentado no peito",
    habilidades: "Avanco agressivo, dominio da pressao, intuicao de combate.",
    manifestacoesDef: "Pyro + Lamina + Afiado | Electro + Bola | Inanis + Parede",
    notas: "Mistura confronto direto com bloqueio de area.",
    effects: [
      { name: "Ritmo de Caca", roll: 1, damage: 1, initiative: 1, notes: "Ativa ao iniciar uma ofensiva." },
    ],
  },
];

const MANIFESTATION_EXAMPLES = [
  { name: "Centelha Lux", keywords: 2, kw: 2, amp: 0, summary: "Lux + Bola. Manifestacao simples de luz concentrada." },
  { name: "Viga de Umbra", keywords: 3, kw: 5, amp: 1, summary: "Umbra + Fio + Afiado. Corte sombrio focado." },
  { name: "Armadura Cryo", keywords: 3, kw: 7, amp: 2, summary: "Cryo + Arm. Parcial + Dureza. Defesa corporal intensificada." },
];

const card = {
  background: C.bg2,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: "12px",
};

const Lbl = ({ children }) => (
  <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 3, fontFamily: FONT_DISPLAY, textTransform: "uppercase" }}>
    {children}
  </div>
);

const SmBtn = ({ onClick, children, color, wide }) => (
  <button
    onClick={onClick}
    style={{
      minWidth: wide ? 52 : 44,
      minHeight: 44,
      borderRadius: 4,
      background: C.bg3,
      border: `1px solid ${C.border}`,
      color: color || C.text,
      fontWeight: 700,
      fontSize: 12,
      fontFamily: FONT_SYSTEM,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      cursor: "pointer",
    }}
  >
    {children}
  </button>
);

const Sect = ({ title, color, children, className, style }) => (
  <div className={className} style={{ ...card, marginBottom: 10, ...style }}>
    <div
      style={{
        fontFamily: FONT_DISPLAY,
        fontSize: 10,
        color: color || C.gold,
        letterSpacing: 3,
        marginBottom: 10,
        borderBottom: `1px solid ${(color || C.gold)}33`,
        paddingBottom: 6,
        textTransform: "uppercase",
      }}
    >
      {title}
    </div>
    {children}
  </div>
);

const ResponsiveGrid = ({ children, minWidth = 280, className = "", style }) => (
  <div
    className={["responsive-grid", className].filter(Boolean).join(" ")}
    style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}px, 1fr))`, ...style }}
  >
    {children}
  </div>
);

function clampNumber(value, min, max) {
  return window.CompanionUtils.clampNumber(value, min, max);
}

function formatSigned(value) {
  return window.CompanionUtils.formatSigned(value);
}

function createId(prefix) {
  return window.CompanionUtils.createId(prefix);
}

function getCurrentLevelData(level) {
  const index = clampNumber(level - 1, 0, LEVELS.length - 1);
  return LEVELS[index] || LEVELS[0];
}

function getPillarBaseValue(pillarId) {
  return Number(PILARS[pillarId] && PILARS[pillarId].base) || 0;
}

function getPillarPointsAvailable(level) {
  return 2 + Math.floor((clampNumber(Number(level) || 1, 1, LEVELS.length) - 1) / 2);
}

function getPillarPointsUsed(pillars) {
  return Object.keys(PILARS).reduce((total, pillarId) => {
    const value = Number(pillars && pillars[pillarId]);
    return total + Math.max(0, (Number.isFinite(value) ? value : getPillarBaseValue(pillarId)) - getPillarBaseValue(pillarId));
  }, 0);
}

function getAttributeFreePointsAvailable(level) {
  return 2 * clampNumber(Number(level) || 1, 1, LEVELS.length);
}

function getPillarBonusPoints(pillars, pillarId) {
  const value = Number(pillars && pillars[pillarId]);
  return Math.max(0, (Number.isFinite(value) ? value : getPillarBaseValue(pillarId)) - getPillarBaseValue(pillarId)) * 3;
}

function normalizeProgressEntry(entry) {
  return {
    tier: clampNumber(Number(entry && entry.tier) || 0, 0, TIERS.length - 1),
    prog: clampNumber(Number(entry && entry.prog) || 0, 0, 3),
  };
}

function shiftProgressEntry(entry, delta) {
  const next = normalizeProgressEntry(entry);
  const direction = Number(delta) || 0;
  if (direction > 0) {
    if (next.prog < 3) return { ...next, prog: next.prog + 1 };
    if (next.tier < TIERS.length - 1) return { tier: next.tier + 1, prog: 0 };
    return next;
  }
  if (direction < 0) {
    if (next.prog > 0) return { ...next, prog: next.prog - 1 };
    if (next.tier > 0) return { tier: next.tier - 1, prog: 3 };
  }
  return next;
}

function formatApt(tier, prog) {
  const safeTier = clampNumber(Number(tier) || 0, 0, TIERS.length - 1);
  const safeProg = clampNumber(Number(prog) || 0, 0, 3);
  return `${APT_SYMBOLS[safeTier] || ""} ${TIERS[safeTier]} +${safeProg}`;
}

function getTierDeltaRules(characterTier, targetTier) {
  const diff = clampNumber((Number(characterTier) || 0) - (Number(targetTier) || 0), -4, 4);
  if (diff >= 3) return { diff, pge: 2, advantage: 1, auto: "success", label: "+3 APT: sucesso automatico" };
  if (diff === 2) return { diff, pge: 2, advantage: 1, auto: null, label: "+2 APT: +2 PGE e Vantagem" };
  if (diff === 1) return { diff, pge: 2, advantage: 0, auto: null, label: "+1 APT: +2 PGE" };
  if (diff <= -3) return { diff, pge: -2, advantage: -1, auto: "fail", label: "-3 APT: falha automatica" };
  if (diff === -2) return { diff, pge: -2, advantage: -1, auto: null, label: "-2 APT: -2 PGE e Desvantagem" };
  if (diff === -1) return { diff, pge: -2, advantage: 0, auto: null, label: "-1 APT: -2 PGE" };
  return { diff, pge: 0, advantage: 0, auto: null, label: "Mesmo APT" };
}

function resolveAdvantageState(value) {
  if (value > 0) return "advantage";
  if (value < 0) return "disadvantage";
  return "normal";
}

function getMeterPercent(current, max) {
  if (max <= 0) return 0;
  return clampNumber((current / max) * 100, 0, 100);
}

function getManifestationPeTotal(kw, amp = 0) {
  return Math.max(0, Number(kw) || 0) + Math.max(0, Number(amp) || 0);
}

function getKeywordCount(...groups) {
  return groups.flat().filter(Boolean).length;
}

function rollN(n, s) {
  return window.CompanionSystems.Dice.rollPool(n, s);
}

function best(arr) {
  return window.CompanionUtils.best(arr);
}

function rollDiceParts(formula) {
  return window.CompanionSystems.Dice.rollFormula(formula);
}

function getScaleBand(scaleValue) {
  let index = 0;
  for (let i = AMP_THRESHOLDS.length - 1; i >= 0; i -= 1) {
    if (scaleValue >= AMP_THRESHOLDS[i]) {
      index = i;
      break;
    }
  }
  return { index, label: AMP_LABELS[index] };
}

function getDamageTrackByTier(tierName) {
  const tierMap = {
    Leigo: ["1d6", "1d8", "2d6", "2d8", "3d8", "4d8"],
    Treinado: ["1d8", "2d6", "2d8", "3d8", "4d8", "5d8"],
    "Esp.": ["2d6", "2d8", "3d8", "4d8", "5d8", "6d8"],
    Especialista: ["2d6", "2d8", "3d8", "4d8", "5d8", "6d8"],
    Mestre: ["2d8", "3d8", "4d8", "5d8", "6d8", "8d8"],
    Lenda: ["3d8", "4d8", "5d8", "6d8", "8d8", "10d8"],
    Maestria: ["3d8", "4d8", "5d8", "6d8", "8d8", "10d8"],
  };

  return tierMap[tierName] || tierMap.Leigo;
}

function manifDmgFormula(tierName, scaleValue) {
  const damageTrack = getDamageTrackByTier(tierName);
  const scaleBand = getScaleBand(scaleValue);
  return damageTrack[Math.min(scaleBand.index, damageTrack.length - 1)];
}

function getActionMeta(kwTotal) {
  return window.CompanionSystems.Actions.getThresholdAction(kwTotal, MANIFESTATION_ACTIONS.map((action) => ({
    max: action.maxKw,
    ...action,
  })));
}

function getAmpBand(amp) {
  return getScaleBand(amp);
}

function getConditionById(conditionId) {
  return CONDS.find((condition) => condition.id === conditionId) || null;
}

function getPericiaById(periciaId) {
  return PERICIAS_LIST.find((pericia) => pericia.id === periciaId) || PERICIAS_LIST[0];
}

function resolveRollBase(baseId, stack = []) {
  if (SUB_TO_PILAR[baseId]) {
    const pillarId = SUB_TO_PILAR[baseId];
    return {
      id: baseId,
      label: SUBS[baseId].label,
      pillar: pillarId,
      color: PILARS[pillarId].color,
    };
  }

  if (PILARS[baseId]) {
    return {
      id: baseId,
      label: PILARS[baseId].label,
      pillar: baseId,
      color: PILARS[baseId].color,
    };
  }

  const pericia = PERICIAS_LIST.find((item) => item.id === baseId);
  if (pericia && !stack.includes(baseId)) {
    const nestedBase = (pericia.bases && pericia.bases[0]) || pericia.groupPilar;
    const resolvedNested = resolveRollBase(nestedBase, [...stack, baseId]);
    return {
      id: baseId,
      label: pericia.label,
      pillar: resolvedNested.pillar,
      color: resolvedNested.color,
    };
  }

  return {
    id: baseId,
    label: baseId,
    pillar: "corpo",
    color: PILARS.corpo.color,
  };
}

function getPericiaBases(pericia) {
  if (!pericia) return [];
  return (pericia.bases || [pericia.groupPilar]).map((baseId) => resolveRollBase(baseId));
}

function formatPericiaBaseList(pericia) {
  return getPericiaBases(pericia).map((base) => base.label).join(" / ");
}

function splitSlashOptions(value) {
  if (!value) return [];
  return String(value)
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
}

function getWeaponGripOptions(weapon) {
  if (!weapon) return [];

  const gripParts = splitSlashOptions(weapon.emp);
  const dmgParts = splitSlashOptions(weapon.dmg);
  const optionCount = Math.max(gripParts.length, dmgParts.length, 1);

  return Array.from({ length: optionCount }, (_, index) => {
    const gripCode = gripParts[index] || gripParts[gripParts.length - 1] || `MODO-${index + 1}`;
    const formula = (dmgParts[index] || dmgParts[dmgParts.length - 1] || weapon.dmg || "").trim();
    return {
      id: `${weapon.name}-${gripCode}-${index}`,
      gripCode,
      gripLabel: GRIP_LABELS[gripCode] || gripCode,
      formula,
    };
  });
}

function getWeaponCriticalOptions(weapon) {
  if (!weapon || !weapon.crit) return [];
  const criticalOptions = splitSlashOptions(weapon.crit);
  if (criticalOptions.length <= 1) {
    return [{ id: `${weapon.name}-crit-0`, label: weapon.crit.trim() }];
  }
  return criticalOptions.map((criticalOption, index) => ({
    id: `${weapon.name}-crit-${index}`,
    label: criticalOption,
  }));
}

function normalizeEffect(effect) {
  return {
    id: effect.id || createId("fx"),
    name: effect.name || "Nova habilidade",
    roll: Number(effect.roll) || 0,
    damage: Number(effect.damage) || 0,
    initiative: Number(effect.initiative) || 0,
    notes: effect.notes || "",
  };
}

function createEmptyEffect() {
  return normalizeEffect({ id: createId("fx"), name: "Nova habilidade" });
}

function sumSelectedEffectValue(effects, selectedIds, field) {
  return effects.reduce((total, effect) => {
    if (!selectedIds.includes(effect.id)) return total;
    return total + (Number(effect[field]) || 0);
  }, 0);
}

function getEffectSummary(effect, fields) {
  const labels = { roll: "Rol", damage: "Dano", initiative: "Init" };
  return fields
    .filter((field) => Number(effect[field]) !== 0)
    .map((field) => `${labels[field]} ${formatSigned(Number(effect[field]))}`)
    .join(" | ");
}

function EffectToggleGroup({ effects, selectedIds, onToggle, fields, title, color }) {
  const availableEffects = effects.filter((effect) => fields.some((field) => Number(effect[field]) !== 0));
  if (!availableEffects.length) return null;

  return (
    <div style={{ marginBottom: 12 }}>
      {title ? <Lbl>{title}</Lbl> : null}
      <div className="chip-row">
        {availableEffects.map((effect) => {
          const active = selectedIds.includes(effect.id);
          const summary = getEffectSummary(effect, fields);
          return (
            <button
              key={effect.id}
              onClick={() => onToggle(effect.id)}
              style={{
                padding: "5px 9px",
                borderRadius: 999,
                background: active ? `${color}22` : C.bg3,
                border: `1px solid ${active ? color : C.border}`,
                color: active ? color : C.text,
                fontSize: 11,
                transition: "all 0.15s",
              }}
            >
              {effect.name}
              {summary ? <span style={{ color: active ? color : C.muted, marginLeft: 6 }}>{summary}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
