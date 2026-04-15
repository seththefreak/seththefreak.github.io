const { useState, useEffect, useCallback } = React;

const SOURCE_DATA = window.ERA_DATA;
const C = SOURCE_DATA.C;
const TIERS = SOURCE_DATA.TIERS;
const TIER_DT = SOURCE_DATA.TIER_DT;
const PILARS = SOURCE_DATA.PILARS;
const SUBS = SOURCE_DATA.SUBS;
const DMG_COLS = SOURCE_DATA.DMG_COLS;
const DMG_ROWS = SOURCE_DATA.DMG_ROWS;
const WEAPONS = SOURCE_DATA.WEAPONS;
const ARMORS = SOURCE_DATA.ARMORS;
const ELEMENTOS = SOURCE_DATA.ELEMENTOS;
const FORMAS = SOURCE_DATA.FORMAS;
const PROPS = SOURCE_DATA.PROPS;
const ACOES = SOURCE_DATA.ACOES;
const DT_TABLE = SOURCE_DATA.DT_TABLE;

const LEVEL_HP_VALUES = [24, 31, 38, 46, 53, 60, 67, 74, 82, 89, 96];
const LEVELS = SOURCE_DATA.LEVELS.map((level, index) => ({
  ...level,
  hp: LEVEL_HP_VALUES[index] || level.hp,
}));

const AMP_THRESHOLDS = [0, 1, 3, 6, 10, 15];
const AMP_LABELS = ["+0", "+1-2", "+3-5", "+6-9", "+10-14", "+15+"];

const SUB_TO_PILAR = Object.entries(PILARS).reduce((acc, [pillarId, pillar]) => {
  pillar.subs.forEach((subId) => {
    acc[subId] = pillarId;
  });
  return acc;
}, {});

const PERICIAS_LIST = [
  { id: "influencia", label: "Influencia", groupPilar: "mente", bases: ["sabedoria"] },
  { id: "comunicacao", label: "Comunicacao", groupPilar: "mente", bases: ["intelecto"] },
  { id: "oficio", label: "Oficio", groupPilar: "corpo", bases: ["destreza", "sabedoria"] },
  { id: "medicina", label: "Medicina", groupPilar: "mente", bases: ["intelecto", "sabedoria"] },
  { id: "manejo", label: "Manejo", groupPilar: "corpo", bases: ["destreza"] },
  { id: "investigacao", label: "Investigacao", groupPilar: "mente", bases: ["intelecto"] },
  { id: "pontaria", label: "Pontaria", groupPilar: "corpo", bases: ["destreza"] },
  { id: "golpe", label: "Golpe", groupPilar: "corpo", bases: ["forca", "destreza"] },
  { id: "cognicao", label: "Cognicao", groupPilar: "mente", bases: ["intelecto"] },
  { id: "travessia", label: "Travessia", groupPilar: "corpo", bases: ["destreza"] },
  { id: "furtividade", label: "Furtividade", groupPilar: "corpo", bases: ["destreza"] },
  { id: "ocultismo", label: "Ocultismo", groupPilar: "alma", bases: ["dominio"] },
  { id: "iniciativa", label: "Iniciativa", groupPilar: "corpo", bases: ["destreza", "percepcao"] },
  { id: "sobrevivencia", label: "Sobrevivencia", groupPilar: "mente", bases: ["sabedoria"] },
  { id: "percepcao", label: "Percepcao", groupPilar: "mente", bases: ["sabedoria"] },
];

const EXTRA_CONDS = [
  { id: "fragilizado", label: "Fragilizado", color: "#F59E0B", desc: "Perde resistencia e fica mais vulneravel a ataques pesados." },
  { id: "derrubado", label: "Derrubado", color: "#FB923C", desc: "No chao. Levantar exige Movimento ou uma acao equivalente." },
  { id: "desarmado", label: "Desarmado", color: "#94A3B8", desc: "Sem arma empunhada. Precisa sacar ou recuperar o equipamento." },
  { id: "paralisado", label: "Paralisado", color: "#38BDF8", desc: "Nao move nem executa acoes fisicas ate encerrar o efeito." },
  { id: "silenciado", label: "Silenciado", color: "#A3A3A3", desc: "Falas e efeitos verbais ficam bloqueados ou prejudicados." },
  { id: "quebrado", label: "Quebrado", color: "#22D3EE", desc: "Colapso mental. -3 em rolagens ate estabilizar." },
  { id: "inconsciente", label: "Inconsciente", color: "#6B7280", desc: "Incapaz de agir. Exige ajuda, descanso ou teste para retornar." },
  { id: "assombro1", label: "Assombro 1", color: C.alma, desc: "Atacante recupera 10% do dano causado como HP." },
  { id: "assombro2", label: "Assombro 2", color: C.alma, desc: "Gera +1d4 de sombra por turno enquanto estiver ativo." },
  { id: "assombro3", label: "Assombro 3", color: C.alma, desc: "+2d6 de sombra e sem cura magica ate purificacao." },
];

const CONDS = [...SOURCE_DATA.CONDS, ...EXTRA_CONDS];
const DEFAULT_SUBS = Object.fromEntries(Object.keys(SUBS).map((key) => [key, { tier: 0, prog: 0 }]));
const DEFAULT_PERICIAS = Object.fromEntries(PERICIAS_LIST.map((pericia) => [pericia.id, { tier: 0, prog: 0 }]));

const DEFAULT_CHAR = {
  name: "Personagem",
  level: 1,
  concept: "",
  marca: "",
  pilares: { corpo: 1, mente: 1, alma: 0 },
  subs: { ...DEFAULT_SUBS },
  pericias: { ...DEFAULT_PERICIAS },
  hp: { cur: 24, max: 24 },
  sp: { cur: 100, max: 100 },
  pe: { cur: 15, max: 15 },
  exaustao: 0,
  condicoes: [],
  habilidades: "",
  manifestacoesDef: "",
  determinacao: 0,
  notas: "",
  effects: [],
};

const card = {
  background: C.bg2,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: "12px",
};

const Lbl = ({ children }) => (
  <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 3, fontFamily: "Georgia,serif", textTransform: "uppercase" }}>
    {children}
  </div>
);

const SmBtn = ({ onClick, children, color, wide }) => (
  <button
    onClick={onClick}
    style={{
      width: wide ? 36 : 24,
      height: 24,
      borderRadius: 4,
      background: C.bg3,
      border: `1px solid ${C.border}`,
      color: color || C.text,
      fontWeight: 700,
      fontSize: 12,
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
        fontFamily: "Georgia,serif",
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
  return Math.max(min, Math.min(max, value));
}

function formatSigned(value) {
  return `${value >= 0 ? "+" : ""}${value}`;
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function getCurrentLevelData(level) {
  const index = clampNumber(level - 1, 0, LEVELS.length - 1);
  return LEVELS[index] || LEVELS[0];
}

function getMeterPercent(current, max) {
  if (max <= 0) return 0;
  return clampNumber((current / max) * 100, 0, 100);
}

function rollN(n, s) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * s) + 1);
}

function best(arr) {
  return Math.max(...arr);
}

function rollDiceParts(formula) {
  const match = formula.trim().match(/^(\d+)d(\d+)([+\-]\d+)?$/i);
  if (!match) return null;

  const numberOfDice = parseInt(match[1], 10);
  const diceSides = parseInt(match[2], 10);
  const bonus = match[3] ? parseInt(match[3], 10) : 0;
  const rolls = rollN(numberOfDice, diceSides);

  return {
    total: rolls.reduce((sum, value) => sum + value, 0) + bonus,
    rolls,
    bonus,
  };
}

function manifDmgFormula(tierName, amp) {
  const tierMap = {
    Leigo: ["1d6", "1d8", "2d6", "2d8", "3d8", "4d8"],
    Treinado: ["1d8", "2d6", "2d8", "3d8", "4d8", "5d8"],
    "Esp.": ["2d6", "2d8", "3d8", "4d8", "5d8", "6d8"],
    Mestre: ["2d8", "3d8", "4d8", "5d8", "6d8", "8d8"],
    Maestria: ["3d8", "4d8", "5d8", "6d8", "8d8", "10d8"],
  };

  const damageTrack = tierMap[tierName] || tierMap.Leigo;
  let index = 0;
  for (let i = AMP_THRESHOLDS.length - 1; i >= 0; i -= 1) {
    if (amp >= AMP_THRESHOLDS[i]) {
      index = i;
      break;
    }
  }
  return damageTrack[Math.min(index, damageTrack.length - 1)];
}

function getActionMeta(peTotal) {
  if (peTotal <= 3) return { label: "m - Simples", color: C.green };
  if (peTotal <= 7) return { label: "Mv - Avancada", color: C.mente };
  if (peTotal <= 14) return { label: "M - Completa", color: C.gold };
  return { label: "C - Extrema", color: "#EF4444" };
}

function getAmpBand(amp) {
  let index = 0;
  for (let i = AMP_THRESHOLDS.length - 1; i >= 0; i -= 1) {
    if (amp >= AMP_THRESHOLDS[i]) {
      index = i;
      break;
    }
  }
  return { index, label: AMP_LABELS[index] };
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
