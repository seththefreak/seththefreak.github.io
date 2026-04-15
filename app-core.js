// UnheaveN: ERA â€” Companion Â· app.js  v2.9-PWA
// React app transpilado via Babel standalone em runtime.

const { useState, useEffect, useCallback } = React;
const { C, TIERS, TIER_DT, PILARS, SUBS, LEVELS, CONDS,
        DMG_COLS, DMG_ROWS, WEAPONS, ARMORS,
        ELEMENTOS, FORMAS, PROPS, ACOES, DT_TABLE } = window.ERA_DATA;

// â”€â”€ Utils â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function rollN(n, s) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * s) + 1);
}
function best(arr) { return Math.max(...arr); }
function rollDice(formula) {
  const m = formula.trim().match(/^(\d+)d(\d+)([+\-]\d+)?$/i);
  if (!m) return null;
  const n = parseInt(m[1]), s = parseInt(m[2]), b = m[3] ? parseInt(m[3]) : 0;
  return rollN(n, s).reduce((a, x) => a + x, 0) + b;
}
function rollDiceParts(formula) {
  // Returns { total, rolls, bonus }
  const m = formula.trim().match(/^(\d+)d(\d+)([+\-]\d+)?$/i);
  if (!m) return null;
  const n = parseInt(m[1]), s = parseInt(m[2]), b = m[3] ? parseInt(m[3]) : 0;
  const rolls = rollN(n, s);
  return { total: rolls.reduce((a, x) => a + x, 0) + b, rolls, bonus: b };
}

// Pega o dado de dano de manifestaÃ§Ã£o para um tier + amplificaÃ§Ã£o
function manifDmgFormula(tierName, amp) {
  const tierMap = {
    "Leigo":    ["1d6","1d8","2d6","2d8","3d8","4d8"],
    "Treinado": ["1d8","2d6","2d8","3d8","4d8","5d8"],
    "Esp.":     ["2d6","2d8","3d8","4d8","5d8","6d8"],
    "Mestre":   ["2d8","3d8","4d8","5d8","6d8","8d8"],
    "Maestria": ["3d8","4d8","5d8","6d8","8d8","10d8"],
  };
  const cols = [0,1,3,6,10,15]; // limiares de amplificaÃ§Ã£o
  const t = tierMap[tierName] || tierMap["Leigo"];
  let idx = 0;
  for (let i = cols.length - 1; i >= 0; i--) { if (amp >= cols[i]) { idx = i; break; } }
  return t[Math.min(idx, t.length - 1)];
}

// â”€â”€ PerÃ­cias â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const PERICIAS_LIST = [
  { id: "influencia",    label: "InfluÃªncia",    pilar: "alma"  },
  { id: "comunicacao",   label: "ComunicaÃ§Ã£o",   pilar: "mente" },
  { id: "oficio",        label: "OfÃ­cio",        pilar: "corpo" },
  { id: "medicina",      label: "Medicina",      pilar: "mente" },
  { id: "performance",   label: "Performance",   pilar: "alma"  },
  { id: "manejo",        label: "Manejo",        pilar: "corpo" },
  { id: "investigacao",  label: "InvestigaÃ§Ã£o",  pilar: "mente" },
  { id: "pontaria",      label: "Pontaria",      pilar: "corpo" },
  { id: "golpe",         label: "Golpe",         pilar: "corpo" },
  { id: "cognicao",      label: "CogniÃ§Ã£o",      pilar: "mente" },
  { id: "travessia",     label: "Travessia",     pilar: "corpo" },
  { id: "furtividade",   label: "Furtividade",   pilar: "corpo" },
  { id: "ocultismo",     label: "Ocultismo",     pilar: "alma"  },
  { id: "iniciativa",    label: "Iniciativa",    pilar: "corpo" },
  { id: "sobrevivencia", label: "SobrevivÃªncia", pilar: "corpo" },
  { id: "percepcao",     label: "PercepÃ§Ã£o",     pilar: "mente" },
];

const DEFAULT_PERICIAS = Object.fromEntries(PERICIAS_LIST.map(p => [p.id, { tier: 0, prog: 0 }]));

// â”€â”€ Defaults â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const DEFAULT_SUBS = Object.fromEntries(Object.keys(SUBS).map(k => [k, { tier: 0, prog: 0 }]));
const DEFAULT_CHAR = {
  name: "Personagem", level: 1, concept: "", marca: "",
  pilares: { corpo: 1, mente: 1, alma: 0 },
  subs: { ...DEFAULT_SUBS },
  pericias: { ...DEFAULT_PERICIAS },
  hp: { cur: 24, max: 24  },
  sp: { cur: 100, max: 100 },
  pe: { cur: 15,  max: 15  },
  exaustao: 0, condicoes: [],
  habilidades: "", manifestacoesDef: "", determinacao: 0, notas: ""
};

// â”€â”€ Shared style primitives â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const card = { background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px" };

const Lbl = ({ children }) => (
  <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 3, fontFamily: "Georgia,serif", textTransform: "uppercase" }}>{children}</div>
);

const SmBtn = ({ onClick, children, color, wide }) => (
  <button onClick={onClick} style={{ width: wide ? 36 : 24, height: 24, borderRadius: 4, background: C.bg3, border: `1px solid ${C.border}`, color: color || C.text, fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>{children}</button>
);

const Sect = ({ title, color, children }) => (
  <div style={{ ...card, marginBottom: 10 }}>
    <div style={{ fontFamily: "Georgia,serif", fontSize: 10, color: color || C.gold, letterSpacing: 3, marginBottom: 10, borderBottom: `1px solid ${(color || C.gold)}33`, paddingBottom: 6, textTransform: "uppercase" }}>{title}</div>
    {children}
  </div>
);
