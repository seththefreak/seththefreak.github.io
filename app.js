// UnheaveN: ERA — Companion · app.js  v2.9-PWA
// React app transpilado via Babel standalone em runtime.

const { useState, useEffect, useCallback } = React;
const { C, TIERS, TIER_DT, PILARS, SUBS, LEVELS, CONDS,
        DMG_COLS, DMG_ROWS, WEAPONS, ARMORS,
        ELEMENTOS, FORMAS, PROPS, ACOES, DT_TABLE } = window.ERA_DATA;

// ── Utils ────────────────────────────────────────────────────────────────────

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

// Pega o dado de dano de manifestação para um tier + amplificação
function manifDmgFormula(tierName, amp) {
  const tierMap = {
    "Leigo":    ["1d6","1d8","2d6","2d8","3d8","4d8"],
    "Treinado": ["1d8","2d6","2d8","3d8","4d8","5d8"],
    "Esp.":     ["2d6","2d8","3d8","4d8","5d8","6d8"],
    "Mestre":   ["2d8","3d8","4d8","5d8","6d8","8d8"],
    "Maestria": ["3d8","4d8","5d8","6d8","8d8","10d8"],
  };
  const cols = [0,1,3,6,10,15]; // limiares de amplificação
  const t = tierMap[tierName] || tierMap["Leigo"];
  let idx = 0;
  for (let i = cols.length - 1; i >= 0; i--) { if (amp >= cols[i]) { idx = i; break; } }
  return t[Math.min(idx, t.length - 1)];
}

// ── Perícias ─────────────────────────────────────────────────────────────────

const PERICIAS_LIST = [
  { id: "influencia",    label: "Influência",    pilar: "alma"  },
  { id: "comunicacao",   label: "Comunicação",   pilar: "mente" },
  { id: "oficio",        label: "Ofício",        pilar: "corpo" },
  { id: "medicina",      label: "Medicina",      pilar: "mente" },
  { id: "performance",   label: "Performance",   pilar: "alma"  },
  { id: "manejo",        label: "Manejo",        pilar: "corpo" },
  { id: "investigacao",  label: "Investigação",  pilar: "mente" },
  { id: "pontaria",      label: "Pontaria",      pilar: "corpo" },
  { id: "golpe",         label: "Golpe",         pilar: "corpo" },
  { id: "cognicao",      label: "Cognição",      pilar: "mente" },
  { id: "travessia",     label: "Travessia",     pilar: "corpo" },
  { id: "furtividade",   label: "Furtividade",   pilar: "corpo" },
  { id: "ocultismo",     label: "Ocultismo",     pilar: "alma"  },
  { id: "iniciativa",    label: "Iniciativa",    pilar: "corpo" },
  { id: "sobrevivencia", label: "Sobrevivência", pilar: "corpo" },
  { id: "percepcao",     label: "Percepção",     pilar: "mente" },
];

const DEFAULT_PERICIAS = Object.fromEntries(PERICIAS_LIST.map(p => [p.id, { tier: 0, prog: 0 }]));

// ── Defaults ─────────────────────────────────────────────────────────────────

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

// ── Shared style primitives ──────────────────────────────────────────────────

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

// ── Root App ─────────────────────────────────────────────────────────────────

function App() {
  const [tab, setTab] = useState("ficha");
  const [char, setChar] = useState(DEFAULT_CHAR);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const r = localStorage.getItem("uh_char_v2");
      if (r) {
        const parsed = JSON.parse(r);
        // migrar chars antigos sem pericias
        if (!parsed.pericias) parsed.pericias = { ...DEFAULT_PERICIAS };
        setChar(c => ({ ...DEFAULT_CHAR, ...parsed, pericias: { ...DEFAULT_PERICIAS, ...(parsed.pericias || {}) } }));
      }
    } catch(e) {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem("uh_char_v2", JSON.stringify(char)); } catch(e) {}
  }, [char, loaded]);

  const upd = useCallback(fn => setChar(p => typeof fn === "function" ? fn(p) : { ...p, ...fn }), []);

  const TABS = [
    { id: "ficha",   icon: "◈", label: "FICHA"   },
    { id: "dados",   icon: "◉", label: "DADOS"   },
    { id: "combate", icon: "◆", label: "COMBATE" },
    { id: "arsenal", icon: "◇", label: "ARSENAL" },
    { id: "sistema", icon: "◎", label: "SISTEMA" },
  ];

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "'Segoe UI',system-ui,sans-serif", maxWidth: 500, margin: "0 auto", minHeight: "100dvh" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea, select {
          background: ${C.bg3}; color: ${C.text};
          border: 1px solid ${C.border}; border-radius: 4px;
          padding: 5px 8px; font-family: inherit; font-size: 13px;
          width: 100%; outline: none;
        }
        input:focus, textarea:focus { border-color: ${C.gold}; }
        button { cursor: pointer; border: none; font-family: inherit; }
        textarea { resize: none; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; }
        body { background: ${C.bg}; }
      `}</style>

      {/* Header */}
      <div style={{ background: C.bg2, borderBottom: `1px solid ${C.border}`, padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "Georgia,serif", fontSize: 9, color: C.gold, letterSpacing: 3, textTransform: "uppercase" }}>UnheaveN · ERA · Palimpsest</div>
          <div style={{ fontFamily: "Georgia,serif", fontSize: 15, fontWeight: 700, color: C.text, marginTop: 1 }}>
            {char.name || "—"} <span style={{ fontSize: 11, color: C.muted, fontFamily: "sans-serif" }}>Nv.{char.level}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[{ k: "hp", c: C.corpo, l: "HP" }, { k: "sp", c: C.mente, l: "SP" }, { k: "pe", c: C.alma, l: "PE" }].map(({ k, c, l }) => {
            const pct = char[k].max > 0 ? Math.max(0, Math.min(100, (char[k].cur / char[k].max) * 100)) : 0;
            return (
              <div key={k} style={{ width: 38, textAlign: "center" }}>
                <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1 }}>{l}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: pct < 25 ? "#EF4444" : c }}>{char[k].cur}</div>
                <div style={{ height: 3, background: C.bg3, borderRadius: 2 }}>
                  <div style={{ height: 3, width: `${pct}%`, background: c, borderRadius: 2, transition: "width 0.3s" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: C.bg2, borderBottom: `1px solid ${C.border}` }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "8px 2px", background: tab === t.id ? C.bg3 : "transparent", borderBottom: tab === t.id ? `2px solid ${C.gold}` : "2px solid transparent", color: tab === t.id ? C.gold : C.muted, fontFamily: "Georgia,serif", fontSize: 9, letterSpacing: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, transition: "all 0.15s" }}>
            <span style={{ fontSize: 14 }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "10px 10px 80px" }}>
        {tab === "ficha"   && <TabFicha   char={char} upd={upd} />}
        {tab === "dados"   && <TabDados   char={char} />}
        {tab === "combate" && <TabCombate char={char} upd={upd} />}
        {tab === "arsenal" && <TabArsenal />}
        {tab === "sistema" && <TabSistema />}
      </div>
    </div>
  );
}

// ── FICHA ────────────────────────────────────────────────────────────────────

function TabFicha({ char, upd }) {
  const [fichaTab, setFichaTab] = useState("base");
  const ld = LEVELS[char.level - 1] || LEVELS[0];

  function setRes(res, val) {
    const mx = LEVELS[Math.max(0, Math.min(10, char.level - 1))][res];
    upd(c => ({ ...c, [res]: { ...c[res], cur: Math.max(0, Math.min(mx, val)) } }));
  }
  function setLvl(l) {
    const d = LEVELS[Math.max(0, Math.min(10, l - 1))];
    upd(c => ({ ...c, level: l, hp: { ...c.hp, max: d.hp }, sp: { cur: 100, max: 100 }, pe: { ...c.pe, max: d.pe } }));
  }
  function setSub(k, f, v) {
    upd(c => ({ ...c, subs: { ...c.subs, [k]: { ...c.subs[k], [f]: v } } }));
  }
  function setPilar(p, v) {
    const mn = p === "alma" ? 0 : 1;
    upd(c => ({ ...c, pilares: { ...c.pilares, [p]: Math.max(mn, Math.min(5, v)) } }));
  }
  function toggleCond(id) {
    upd(c => ({ ...c, condicoes: c.condicoes.includes(id) ? c.condicoes.filter(x => x !== id) : [...c.condicoes, id] }));
  }
  function setPericia(pid, field, val) {
    upd(c => ({ ...c, pericias: { ...c.pericias, [pid]: { ...(c.pericias[pid] || { tier: 0, prog: 0 }), [field]: val } } }));
  }

  const FICHA_TABS = [
    { id: "base",    label: "Base"      },
    { id: "pericias",label: "Perícias"  },
    { id: "extras",  label: "Extras"    },
  ];

  return (
    <div>
      {/* Sub-tabs da Ficha */}
      <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
        {FICHA_TABS.map(t => (
          <button key={t.id} onClick={() => setFichaTab(t.id)} style={{ flex: 1, padding: "6px 4px", borderRadius: 6, background: fichaTab === t.id ? `${C.gold}22` : C.bg2, border: `1px solid ${fichaTab === t.id ? C.gold : C.border}`, color: fichaTab === t.id ? C.gold : C.muted, fontSize: 11, fontFamily: "Georgia,serif", letterSpacing: 1, transition: "all 0.15s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {fichaTab === "base" && (
        <div>
          {/* Identidade */}
          <Sect title="Identidade">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 8, marginBottom: 8 }}>
              <div><Lbl>Nome</Lbl><input value={char.name} onChange={e => upd({ name: e.target.value })} /></div>
              <div>
                <Lbl>Nível</Lbl>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                  <SmBtn onClick={() => setLvl(Math.max(1, char.level - 1))}>−</SmBtn>
                  <span style={{ fontFamily: "Georgia,serif", fontSize: 20, fontWeight: 700, color: C.gold, width: 24, textAlign: "center" }}>{char.level}</span>
                  <SmBtn onClick={() => setLvl(Math.min(11, char.level + 1))}>+</SmBtn>
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div><Lbl>Conceito</Lbl><input value={char.concept} onChange={e => upd({ concept: e.target.value })} placeholder="Ex: Detetive paranormal" /></div>
              <div><Lbl>Marca</Lbl><input value={char.marca} onChange={e => upd({ marca: e.target.value })} placeholder="Ex: Veia pulsante" /></div>
            </div>
          </Sect>

          {/* Recursos */}
          <Sect title="Recursos">
            {[{ k: "hp", label: "HP — Pontos de Vida", c: C.corpo }, { k: "sp", label: "SP — Sanidade", c: C.mente }, { k: "pe", label: "PE — Essência", c: C.alma }].map(({ k, label, c }) => {
              const mx = k === "sp" ? 100 : ld[k];
              const cur = char[k].cur;
              const pct = mx > 0 ? Math.max(0, Math.min(100, (cur / mx) * 100)) : 0;
              return (
                <div key={k} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontFamily: "Georgia,serif", fontSize: 11, color: c, letterSpacing: 1 }}>{label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <SmBtn onClick={() => setRes(k, cur - 5)} color={c}>−5</SmBtn>
                      <SmBtn onClick={() => setRes(k, cur - 1)} color={c}>−</SmBtn>
                      <span style={{ fontWeight: 700, fontSize: 15, color: pct < 25 ? "#EF4444" : c, minWidth: 40, textAlign: "center" }}>
                        {cur}<span style={{ color: C.muted, fontSize: 11, fontWeight: 400 }}>/{mx}</span>
                      </span>
                      <SmBtn onClick={() => setRes(k, cur + 1)} color={c}>+</SmBtn>
                      <SmBtn onClick={() => setRes(k, cur + 5)} color={c}>+5</SmBtn>
                    </div>
                  </div>
                  <div style={{ height: 6, background: C.bg3, borderRadius: 3 }}>
                    <div style={{ height: 6, width: `${pct}%`, background: c, borderRadius: 3, transition: "width 0.3s" }} />
                  </div>
                  {pct < 25 && <div style={{ fontSize: 10, color: c, marginTop: 2 }}>
                    {k === "hp" ? "⚠ Últimos Pontos: −2 em tudo" : k === "sp" ? "⚠ Quebrado: −3 em rolagens" : "⚠ Sem Manifestações até recuperação"}
                  </div>}
                </div>
              );
            })}
            <div>
              <Lbl>Exaustão</Lbl>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 4 }}>
                {[0, 1, 2, 3, 4].map(i => (
                  <button key={i} onClick={() => upd({ exaustao: i === char.exaustao && i > 0 ? i - 1 : i })}
                    style={{ width: 30, height: 28, borderRadius: 4, background: char.exaustao >= i && i > 0 ? "#6B728033" : C.bg3, border: `1px solid ${char.exaustao >= i && i > 0 ? "#6B7280" : C.border}`, color: char.exaustao >= i && i > 0 ? C.text : C.muted, fontWeight: 700, fontSize: 12 }}>
                    {i}
                  </button>
                ))}
                {char.exaustao > 0 && <span style={{ fontSize: 11, color: C.muted }}>−{char.exaustao} rolagens{char.exaustao >= 3 ? " · mov÷2" : ""}{char.exaustao >= 4 ? " · Inconsciente" : ""}</span>}
              </div>
            </div>
          </Sect>

          {/* Pilares */}
          <Sect title="Pilares">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {Object.entries(PILARS).map(([pk, pv]) => (
                <div key={pk} style={{ ...card, borderColor: pv.color + "44", textAlign: "center", padding: 10 }}>
                  <div style={{ fontFamily: "Georgia,serif", fontSize: 9, color: pv.color, letterSpacing: 2, marginBottom: 4 }}>{pv.label}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    <SmBtn onClick={() => setPilar(pk, char.pilares[pk] - 1)}>−</SmBtn>
                    <span style={{ fontFamily: "Georgia,serif", fontSize: 26, fontWeight: 700, color: pv.color, lineHeight: 1 }}>{char.pilares[pk]}</span>
                    <SmBtn onClick={() => setPilar(pk, char.pilares[pk] + 1)}>+</SmBtn>
                  </div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{char.pilares[pk]}d6</div>
                </div>
              ))}
            </div>
          </Sect>

          {/* Subatributos */}
          <Sect title="Subatributos">
            {Object.entries(PILARS).map(([pk, pv]) => (
              <div key={pk} style={{ marginBottom: 12 }}>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 10, color: pv.color, letterSpacing: 2, marginBottom: 6, paddingBottom: 4, borderBottom: `1px solid ${pv.color}33` }}>{pv.label}</div>
                {pv.subs.map(sk => {
                  const s = char.subs[sk] || { tier: 0, prog: 0 };
                  const tdt = TIER_DT[s.tier];
                  return (
                    <div key={sk} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, padding: "6px 8px", background: C.bg3, borderRadius: 6 }}>
                      <div style={{ width: 88, flexShrink: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{SUBS[sk].label}</div>
                        <div style={{ fontSize: 9, color: pv.color, letterSpacing: 1 }}>{TIERS[s.tier]}{tdt ? ` · auto DT${tdt}` : ""}</div>
                      </div>
                      <div style={{ display: "flex", gap: 3 }}>
                        {TIERS.map((_, i) => (
                          <button key={i} onClick={() => setSub(sk, "tier", i)} title={TIERS[i]}
                            style={{ width: 13, height: 13, borderRadius: 2, background: s.tier >= i ? pv.color : C.border, border: "none", cursor: "pointer", flexShrink: 0 }} />
                        ))}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 3, marginLeft: "auto" }}>
                        <SmBtn onClick={() => setSub(sk, "prog", Math.max(0, s.prog - 1))}>−</SmBtn>
                        <span style={{ fontSize: 14, fontWeight: 700, color: pv.color, width: 22, textAlign: "center" }}>+{s.prog}</span>
                        <SmBtn onClick={() => setSub(sk, "prog", Math.min(3, s.prog + 1))}>+</SmBtn>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </Sect>

          {/* Condições */}
          <Sect title="Condições Ativas">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: char.condicoes.length ? 8 : 0 }}>
              {CONDS.map(c => {
                const act = char.condicoes.includes(c.id);
                return (
                  <button key={c.id} onClick={() => toggleCond(c.id)} style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: act ? c.color + "22" : C.bg3, color: act ? c.color : C.muted, border: `1px solid ${act ? c.color : C.border}`, transition: "all 0.15s" }}>{c.label}</button>
                );
              })}
            </div>
            {char.condicoes.map(id => {
              const c = CONDS.find(x => x.id === id);
              return c ? <div key={id} style={{ fontSize: 11, color: c.color, padding: "4px 8px", background: c.color + "11", borderRadius: 4, borderLeft: `2px solid ${c.color}`, marginBottom: 3 }}><strong>{c.label}:</strong> {c.desc}</div> : null;
            })}
          </Sect>

          {/* Determinação */}
          <Sect title="Determinação">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <SmBtn onClick={() => upd({ determinacao: Math.max(0, char.determinacao - 1) })}>−</SmBtn>
              <div style={{ display: "flex", gap: 5 }}>
                {Array.from({ length: Math.max(5, char.determinacao + 1) }).map((_, i) => (
                  <div key={i} style={{ width: 18, height: 18, borderRadius: 3, background: i < char.determinacao ? C.gold : C.bg3, border: `1px solid ${i < char.determinacao ? C.gold : C.border}`, transition: "all 0.2s" }} />
                ))}
              </div>
              <SmBtn onClick={() => upd({ determinacao: char.determinacao + 1 })}>+</SmBtn>
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>Cicatriz que virou recurso. Ativa quando a cena confronta a Declaração. Não altera dados — ignora um obstáculo com consequência.</div>
          </Sect>
        </div>
      )}

      {fichaTab === "pericias" && (
        <PericiasTab char={char} setPericia={setPericia} />
      )}

      {fichaTab === "extras" && (
        <div>
          <Sect title="Habilidades & Manifestações">
            {[
              { k: "habilidades",    label: "Habilidades",             ph: "Resistente, Atirador, Sensitivo, Exorcista..." },
              { k: "manifestacoesDef", label: "Manifestações Definidas", ph: "Centelha: Pyro+Bola 2PE · Escudo: Cryo+Cúpula 6PE..." },
              { k: "notas",          label: "Notas Livres",            ph: "Anotações, âncoras, declarações de determinação..." },
            ].map(({ k, label, ph }) => (
              <div key={k} style={{ marginBottom: 8 }}>
                <Lbl>{label}</Lbl>
                <textarea rows={k === "notas" ? 4 : 2} value={char[k] || ""} onChange={e => upd({ [k]: e.target.value })} placeholder={ph} />
              </div>
            ))}
          </Sect>
        </div>
      )}
    </div>
  );
}

// ── PERÍCIAS TAB ──────────────────────────────────────────────────────────────

function PericiasTab({ char, setPericia }) {
  const PILAR_COLOR = { corpo: C.corpo, mente: C.mente, alma: C.alma };
  const PILAR_LABEL = { corpo: "CORPO", mente: "MENTE", alma: "ALMA" };

  return (
    <div>
      <div style={{ padding: "8px 10px", background: C.bg3, borderRadius: 6, marginBottom: 10, fontSize: 11, color: C.muted }}>
        Tier avança com 4 pts. Auto-sucesso: Treinado DT4 · Esp. DT5 · Mestre DT6 · Maestria DT7.
      </div>
      {["corpo", "mente", "alma"].map(pk => {
        const pc = PILAR_COLOR[pk];
        const plist = PERICIAS_LIST.filter(p => p.pilar === pk);
        return (
          <div key={pk} style={{ ...card, marginBottom: 10 }}>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 10, color: pc, letterSpacing: 3, marginBottom: 8, borderBottom: `1px solid ${pc}33`, paddingBottom: 5 }}>{PILAR_LABEL[pk]}</div>
            {plist.map(p => {
              const s = (char.pericias && char.pericias[p.id]) || { tier: 0, prog: 0 };
              const tdt = TIER_DT[s.tier];
              const autoTxt = tdt ? `auto DT${tdt}` : "rola sempre";
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, padding: "6px 8px", background: C.bg3, borderRadius: 6 }}>
                  {/* Nome e tier label */}
                  <div style={{ width: 96, flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{p.label}</div>
                    <div style={{ fontSize: 9, color: pc, letterSpacing: 1 }}>{TIERS[s.tier]} · {autoTxt}</div>
                  </div>
                  {/* Tier dots */}
                  <div style={{ display: "flex", gap: 3 }}>
                    {TIERS.map((_, i) => (
                      <button key={i} onClick={() => setPericia(p.id, "tier", i)} title={TIERS[i]}
                        style={{ width: 12, height: 12, borderRadius: 2, background: s.tier >= i ? pc : C.border, border: "none", cursor: "pointer", flexShrink: 0 }} />
                    ))}
                  </div>
                  {/* Progresso */}
                  <div style={{ display: "flex", alignItems: "center", gap: 3, marginLeft: "auto" }}>
                    <SmBtn onClick={() => setPericia(p.id, "prog", Math.max(0, s.prog - 1))}>−</SmBtn>
                    <span style={{ fontSize: 13, fontWeight: 700, color: pc, width: 22, textAlign: "center" }}>+{s.prog}</span>
                    <SmBtn onClick={() => setPericia(p.id, "prog", Math.min(3, s.prog + 1))}>+</SmBtn>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ── DADOS ────────────────────────────────────────────────────────────────────

function TabDados({ char }) {
  const [mode, setMode] = useState("sub"); // "sub" | "pericia"
  const [selP, setSelP] = useState("corpo");
  const [selS, setSelS] = useState("forca");
  const [selPericia, setSelPericia] = useState("golpe");
  const [ef, setEf] = useState(0);
  const [dt, setDt] = useState(5);
  const [rolling, setRolling] = useState(false);
  const [res, setRes] = useState(null);
  const [hist, setHist] = useState([]);

  useEffect(() => { setSelS(PILARS[selP].subs[0]); }, [selP]);

  function buildRollConfig() {
    if (mode === "sub") {
      const sub = char.subs[selS] || { tier: 0, prog: 0 };
      const nd = char.pilares[selP] || 1;
      return { nd, prog: sub.prog, tier: sub.tier, label: SUBS[selS].label, pilarColor: PILARS[selP].color, pilarLabel: PILARS[selP].label };
    } else {
      const pdata = (char.pericias && char.pericias[selPericia]) || { tier: 0, prog: 0 };
      const pinfo = PERICIAS_LIST.find(p => p.id === selPericia);
      const pk = pinfo ? pinfo.pilar : "corpo";
      const nd = char.pilares[pk] || 1;
      const pc = { corpo: C.corpo, mente: C.mente, alma: C.alma }[pk];
      return { nd, prog: pdata.prog, tier: pdata.tier, label: pinfo ? pinfo.label : selPericia, pilarColor: pc, pilarLabel: pk.toUpperCase() };
    }
  }

  function roll() {
    setRolling(true);
    setTimeout(() => {
      const { nd, prog, tier, label, pilarColor, pilarLabel } = buildRollConfig();
      const dice = rollN(nd, 6);
      const b = best(dice);
      const exMod = -char.exaustao;
      const total = b + prog + ef + exMod;
      const tdt = TIER_DT[tier];
      const auto = tdt && dt <= tdt;
      const suc = auto || total >= dt;
      const threat = b === 6 && !auto;
      const critfail = b === 1 && !suc;
      const r = { dice, b, total, dt, suc, auto, threat, critfail, label, pilarColor, pilarLabel, tier: TIERS[tier], prog, ef, exMod, t: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) };
      setRes(r); setHist(h => [r, ...h].slice(0, 8)); setRolling(false);
    }, 350);
  }

  const cfg = buildRollConfig();
  const tdt = TIER_DT[cfg.tier];
  const autoNow = tdt && dt <= tdt;

  return (
    <div>
      <Sect title="Configurar Rolagem" color={C.gold}>
        {/* Mode switch */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {[{ id: "sub", label: "Subatributo" }, { id: "pericia", label: "Perícia" }].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} style={{ flex: 1, padding: "6px 4px", borderRadius: 6, background: mode === m.id ? `${C.gold}22` : C.bg3, border: `1px solid ${mode === m.id ? C.gold : C.border}`, color: mode === m.id ? C.gold : C.muted, fontSize: 12, transition: "all 0.15s" }}>{m.label}</button>
          ))}
        </div>

        {mode === "sub" ? (
          <div>
            <Lbl>Pilar</Lbl>
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {Object.entries(PILARS).map(([pk, pv]) => (
                <button key={pk} onClick={() => setSelP(pk)} style={{ flex: 1, padding: "8px 4px", borderRadius: 6, background: selP === pk ? pv.color + "22" : C.bg3, border: `1px solid ${selP === pk ? pv.color : C.border}`, color: selP === pk ? pv.color : C.muted, fontFamily: "Georgia,serif", fontSize: 11, letterSpacing: 1, transition: "all 0.15s" }}>
                  {pv.label}<br /><span style={{ fontSize: 18, fontWeight: 700 }}>{char.pilares[pk]}</span><span style={{ fontSize: 10 }}>d6</span>
                </button>
              ))}
            </div>
            <Lbl>Subatributo</Lbl>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
              {PILARS[selP].subs.map(sk => (
                <button key={sk} onClick={() => setSelS(sk)} style={{ padding: "5px 10px", borderRadius: 5, background: selS === sk ? PILARS[selP].color + "22" : C.bg3, border: `1px solid ${selS === sk ? PILARS[selP].color : C.border}`, color: selS === sk ? PILARS[selP].color : C.text, fontSize: 12, transition: "all 0.15s" }}>
                  {SUBS[sk].label} <span style={{ color: PILARS[selP].color, fontWeight: 700 }}>+{(char.subs[sk] || { prog: 0 }).prog}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <Lbl>Perícia</Lbl>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
              {PERICIAS_LIST.map(p => {
                const pdata = (char.pericias && char.pericias[p.id]) || { tier: 0, prog: 0 };
                const pc = { corpo: C.corpo, mente: C.mente, alma: C.alma }[p.pilar];
                const isS = selPericia === p.id;
                return (
                  <button key={p.id} onClick={() => setSelPericia(p.id)} style={{ padding: "4px 9px", borderRadius: 5, background: isS ? pc + "22" : C.bg3, border: `1px solid ${isS ? pc : C.border}`, color: isS ? pc : C.text, fontSize: 11, transition: "all 0.15s" }}>
                    {p.label} {pdata.prog > 0 && <span style={{ color: pc, fontWeight: 700 }}>+{pdata.prog}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <Lbl>Prog. Efetivo</Lbl>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <SmBtn onClick={() => setEf(v => v - 1)}>−</SmBtn>
              <span style={{ fontWeight: 700, fontSize: 16, color: C.gold, width: 32, textAlign: "center" }}>{ef >= 0 ? "+" : ""}{ef}</span>
              <SmBtn onClick={() => setEf(v => v + 1)}>+</SmBtn>
            </div>
          </div>
          <div>
            <Lbl>DT Alvo</Lbl>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <SmBtn onClick={() => setDt(v => Math.max(1, v - 1))}>−</SmBtn>
              <span style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 16, color: C.mente, width: 20, textAlign: "center" }}>{dt}</span>
              <SmBtn onClick={() => setDt(v => Math.min(9, v + 1))}>+</SmBtn>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div style={{ padding: "8px 10px", background: C.bg3, borderRadius: 6, fontSize: 12, marginBottom: 10, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <span style={{ color: cfg.pilarColor }}>{cfg.nd}d6</span>
          <span style={{ color: C.muted }}>+</span>
          <span style={{ color: cfg.pilarColor }}>{cfg.prog} ({cfg.label})</span>
          {ef !== 0 && <><span style={{ color: C.muted }}>+</span><span style={{ color: C.gold }}>{ef >= 0 ? "+" : ""}{ef} ef</span></>}
          {char.exaustao > 0 && <><span style={{ color: C.muted }}>+</span><span style={{ color: "#EF4444" }}>−{char.exaustao} exaustão</span></>}
          <span style={{ color: C.muted }}>vs</span>
          <span style={{ color: autoNow ? C.green : C.mente, fontWeight: 700 }}>DT {dt}{autoNow ? " ⚡auto" : ""}</span>
        </div>

        <button onClick={roll} disabled={rolling} style={{ width: "100%", padding: "12px", borderRadius: 8, background: rolling ? C.bg3 : `${C.gold}22`, border: `2px solid ${rolling ? C.border : C.gold}`, color: rolling ? C.muted : C.gold, fontFamily: "Georgia,serif", fontSize: 16, fontWeight: 700, letterSpacing: 2, transition: "all 0.2s" }}>
          {rolling ? "···" : "ROLAR"}
        </button>
      </Sect>

      {res && (
        <div style={{ ...card, borderColor: res.suc ? C.green : res.threat ? C.gold : "#EF4444", borderWidth: 2, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 15, color: res.auto ? "#FDE68A" : res.threat ? C.gold : res.suc ? C.green : "#EF4444", fontWeight: 700, letterSpacing: 1 }}>
              {res.auto ? "⚡ AUTO-SUCESSO" : res.threat ? "◈ AMEAÇA!" : res.suc ? "✓ SUCESSO" : res.critfail ? "✕ FALHA CRÍTICA" : "✕ FALHA"}
            </div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 30, fontWeight: 700, color: res.suc ? C.green : "#EF4444", lineHeight: 1 }}>{res.total}</div>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
            {res.dice.map((d, i) => (
              <div key={i} style={{ width: 34, height: 34, borderRadius: 6, background: d === res.b ? C.gold + "33" : C.bg3, border: `1px solid ${d === res.b ? C.gold : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: d === res.b ? C.gold : C.muted, fontSize: 15, fontFamily: "Georgia,serif" }}>{d}</div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: C.muted }}>
            melhor: <strong style={{ color: C.text }}>{res.b}</strong> + {res.label} <strong style={{ color: res.pilarColor }}>+{res.prog}</strong>
            {res.ef !== 0 && <> ef <strong style={{ color: C.gold }}>{res.ef >= 0 ? "+" : ""}{res.ef}</strong></>}
            {res.exMod !== 0 && <> <strong style={{ color: "#EF4444" }}>{res.exMod}</strong></>}
            {" "}= <strong style={{ color: C.text, fontSize: 13 }}>{res.total}</strong> vs DT {res.dt}
          </div>
          {res.threat && <div style={{ fontSize: 11, color: C.gold, marginTop: 4, padding: "4px 8px", background: C.gold + "11", borderRadius: 4 }}>Role novamente vs DT {res.dt} para confirmar crítico → Impacto Bruto ou Efeito Crítico</div>}
          {res.critfail && <div style={{ fontSize: 11, color: "#EF4444", marginTop: 4, padding: "4px 8px", background: "#EF444411", borderRadius: 4 }}>Falha Crítica — Mestre introduz complicação narrativa proporcional</div>}
        </div>
      )}

      {hist.length > 1 && (
        <Sect title="Histórico" color={C.muted}>
          {hist.slice(1).map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
              <span style={{ color: C.muted }}>{r.t} · {r.label}</span>
              <span style={{ color: r.suc ? C.green : "#EF4444", fontWeight: 600 }}>{r.total} vs {r.dt} {r.suc ? "✓" : "✕"}</span>
            </div>
          ))}
        </Sect>
      )}
    </div>
  );
}

// ── COMBATE ──────────────────────────────────────────────────────────────────

function TabCombate({ char, upd }) {
  const [combatTab, setCombatTab] = useState("tracker");
  const [fighters, setFighters] = useState([{ id: 1, name: char.name || "PC", init: 0, hp: char.hp.cur, maxHp: char.hp.max, isPC: true, conds: [] }]);
  const [round, setRound] = useState(1);
  const [active, setActive] = useState(0);
  const [newName, setNewName] = useState("");

  function addF(isPC) {
    const nm = newName.trim() || (isPC ? "Aliado" : "Inimigo");
    setFighters(f => [...f, { id: Date.now(), name: nm, init: 0, hp: 50, maxHp: 50, isPC, conds: [] }]);
    setNewName("");
  }
  function rollInit(id) {
    const r = Math.floor(Math.random() * 6) + 1;
    setFighters(f => { const u = f.map(x => x.id === id ? { ...x, init: r } : x); return [...u].sort((a, b) => b.init - a.init); });
  }
  function rollAllInit() {
    setFighters(f => { const u = f.map(x => ({ ...x, init: Math.floor(Math.random() * 6) + 1 })); return [...u].sort((a, b) => b.init - a.init); });
  }
  function next() { const n = (active + 1) % fighters.length; if (n === 0) setRound(r => r + 1); setActive(n); }
  function chHp(id, d) { setFighters(f => f.map(x => x.id === id ? { ...x, hp: Math.max(0, x.hp + d) } : x)); }
  function togC(id, cid) { setFighters(f => f.map(x => x.id === id ? { ...x, conds: x.conds.includes(cid) ? x.conds.filter(v => v !== cid) : [...x.conds, cid] } : x)); }
  function remove(id) { setFighters(f => f.filter(x => x.id !== id)); }

  const CTABS = [
    { id: "tracker",  label: "Tracker" },
    { id: "armas",    label: "Armas"   },
    { id: "manif",    label: "Manif."  },
  ];

  return (
    <div>
      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
        {CTABS.map(t => (
          <button key={t.id} onClick={() => setCombatTab(t.id)} style={{ flex: 1, padding: "6px 4px", borderRadius: 6, background: combatTab === t.id ? `${C.corpo}22` : C.bg2, border: `1px solid ${combatTab === t.id ? C.corpo : C.border}`, color: combatTab === t.id ? C.corpo : C.muted, fontSize: 11, fontFamily: "Georgia,serif", letterSpacing: 1, transition: "all 0.15s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {combatTab === "tracker" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontFamily: "Georgia,serif" }}>
              <span style={{ fontSize: 10, color: C.gold, letterSpacing: 2 }}>RODADA </span>
              <span style={{ fontSize: 26, fontWeight: 700, color: C.gold }}>{round}</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={rollAllInit} style={{ padding: "6px 10px", borderRadius: 6, background: C.bg3, border: `1px solid ${C.border}`, color: C.text, fontSize: 12 }}>◉ Iniciativa</button>
              <button onClick={next} style={{ padding: "6px 14px", borderRadius: 6, background: `${C.gold}22`, border: `1px solid ${C.gold}`, color: C.gold, fontFamily: "Georgia,serif", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>PRÓX ▶</button>
            </div>
          </div>

          {fighters.map((f, idx) => {
            const isAct = idx === active;
            const pct = f.maxHp > 0 ? Math.max(0, Math.min(100, (f.hp / f.maxHp) * 100)) : 0;
            const hc = pct > 50 ? C.green : pct > 25 ? "#FACC15" : "#EF4444";
            return (
              <div key={f.id} style={{ ...card, borderColor: isAct ? C.gold : C.border, borderWidth: isAct ? 2 : 1, marginBottom: 8, transition: "border 0.2s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div onClick={() => rollInit(f.id)} style={{ width: 28, height: 28, borderRadius: 4, background: isAct ? C.gold : C.bg3, color: isAct ? C.bg : C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, cursor: "pointer", flexShrink: 0, userSelect: "none" }} title="Clique para rolar iniciativa">
                    {f.init || "?"}
                  </div>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: isAct ? C.gold : C.text }}>{f.name}</span>
                  <span style={{ fontSize: 10, color: f.isPC ? C.mente : C.corpo, border: `1px solid ${f.isPC ? C.mente + "44" : C.corpo + "44"}`, borderRadius: 10, padding: "1px 6px" }}>{f.isPC ? "PC" : "NPC"}</span>
                  <button onClick={() => remove(f.id)} style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: C.bg3, border: `1px solid ${C.border}`, color: C.muted }}>✕</button>
                </div>
                <div style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <span style={{ fontSize: 10, color: C.muted, letterSpacing: 1 }}>HP</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <SmBtn onClick={() => chHp(f.id, -10)} color="#EF4444" wide>−10</SmBtn>
                      <SmBtn onClick={() => chHp(f.id, -5)}  color="#EF4444" wide>−5</SmBtn>
                      <SmBtn onClick={() => chHp(f.id, -1)}  color="#EF4444">−</SmBtn>
                      <span style={{ fontSize: 13, fontWeight: 700, color: hc, minWidth: 48, textAlign: "center" }}>{f.hp}/{f.maxHp}</span>
                      <SmBtn onClick={() => chHp(f.id, 1)}   color={C.green}>+</SmBtn>
                      <SmBtn onClick={() => chHp(f.id, 5)}   color={C.green} wide>+5</SmBtn>
                    </div>
                  </div>
                  <div style={{ height: 5, background: C.bg3, borderRadius: 3 }}>
                    <div style={{ height: 5, width: `${pct}%`, background: hc, borderRadius: 3, transition: "width 0.3s" }} />
                  </div>
                  {pct === 0 && <div style={{ fontSize: 10, color: "#EF4444", marginTop: 2 }}>Inconsciente — Teste Constituição DT 5/turno ou morte</div>}
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {CONDS.map(c => {
                    const on = f.conds.includes(c.id);
                    return <button key={c.id} onClick={() => togC(f.id, c.id)} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10, background: on ? c.color + "22" : C.bg3, border: `1px solid ${on ? c.color : C.border}`, color: on ? c.color : C.muted, transition: "all 0.1s" }}>{c.label}</button>;
                  })}
                </div>
                {f.conds.length > 0 && (
                  <div style={{ marginTop: 5, display: "flex", flexDirection: "column", gap: 2 }}>
                    {f.conds.map(id => { const c = CONDS.find(x => x.id === id); return c ? <div key={id} style={{ fontSize: 10, color: c.color, borderLeft: `2px solid ${c.color}`, paddingLeft: 5 }}>{c.desc}</div> : null; })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Adicionar combatente */}
          <div style={{ ...card, marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 6 }}>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome do combatente..." onKeyDown={e => e.key === "Enter" && addF(false)} />
              <button onClick={() => addF(true)} style={{ padding: "5px 8px", borderRadius: 5, background: `${C.mente}22`, border: `1px solid ${C.mente}`, color: C.mente, fontSize: 11, whiteSpace: "nowrap" }}>+ Aliado</button>
              <button onClick={() => addF(false)} style={{ padding: "5px 8px", borderRadius: 5, background: `${C.corpo}22`, border: `1px solid ${C.corpo}`, color: C.corpo, fontSize: 11, whiteSpace: "nowrap" }}>+ Inimigo</button>
            </div>
          </div>
        </div>
      )}

      {combatTab === "armas" && <ArmasDmgTab char={char} />}
      {combatTab === "manif" && <ManifDmgTab char={char} />}
    </div>
  );
}

// ── ARMAS — ROLAGEM DE DANO ───────────────────────────────────────────────────

function ArmasDmgTab({ char }) {
  const [selWeapon, setSelWeapon] = useState(null);
  const [customFormula, setCustomFormula] = useState("1d8");
  const [useCustom, setUseCustom] = useState(false);
  const [dmgRes, setDmgRes] = useState(null);
  const [rd, setRd] = useState(0);
  const [catFilter, setCatFilter] = useState("cacl");

  const cats = [
    { id: "cacl", label: "Leve"   },
    { id: "cacm", label: "Média"  },
    { id: "cacp", label: "Pesada" },
    { id: "dist", label: "Dist."  },
  ];

  const visibleWeapons = WEAPONS.filter(w => w.cat === catFilter);

  function getFormula() {
    if (useCustom) return customFormula;
    if (!selWeapon) return null;
    // pega o primeiro dado (para armas versáteis, pega o 1M)
    const raw = selWeapon.dmg.split("/")[0].trim();
    return raw;
  }

  function rollDmg() {
    const formula = getFormula();
    if (!formula) return;
    // rola 2x, pega o melhor
    const r1 = rollDiceParts(formula);
    const r2 = rollDiceParts(formula);
    if (!r1 || !r2) return;
    const bestR = r1.total >= r2.total ? r1 : r2;
    const afterRD = Math.max(0, bestR.total - rd);
    setDmgRes({ r1: r1.total, r2: r2.total, best: Math.max(r1.total, r2.total), bestRolls: bestR.rolls, bestBonus: bestR.bonus, formula, afterRD, rd });
  }

  // Extrai fórmula limpa pra mostrar no botão
  const activeFormula = getFormula() || "—";

  return (
    <div>
      {/* Tipo de ataque */}
      <Sect title="Rolagem de Dano — Armas" color={C.corpo}>
        <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
          <button onClick={() => setUseCustom(false)} style={{ flex: 1, padding: "6px", borderRadius: 6, background: !useCustom ? `${C.corpo}22` : C.bg3, border: `1px solid ${!useCustom ? C.corpo : C.border}`, color: !useCustom ? C.corpo : C.muted, fontSize: 11 }}>Selecionar Arma</button>
          <button onClick={() => setUseCustom(true)} style={{ flex: 1, padding: "6px", borderRadius: 6, background: useCustom ? `${C.corpo}22` : C.bg3, border: `1px solid ${useCustom ? C.corpo : C.border}`, color: useCustom ? C.corpo : C.muted, fontSize: 11 }}>Fórmula Livre</button>
        </div>

        {!useCustom ? (
          <div>
            {/* Cat filter */}
            <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
              {cats.map(c => (
                <button key={c.id} onClick={() => { setCatFilter(c.id); setSelWeapon(null); }} style={{ flex: 1, padding: "4px 2px", borderRadius: 5, background: catFilter === c.id ? `${C.corpo}22` : C.bg3, border: `1px solid ${catFilter === c.id ? C.corpo : C.border}`, color: catFilter === c.id ? C.corpo : C.muted, fontSize: 11 }}>{c.label}</button>
              ))}
            </div>
            {/* Weapon list */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
              {visibleWeapons.map(w => {
                const isSel = selWeapon?.name === w.name;
                return (
                  <button key={w.name} onClick={() => setSelWeapon(w)} style={{ padding: "4px 9px", borderRadius: 5, background: isSel ? `${C.corpo}22` : C.bg3, border: `1px solid ${isSel ? C.corpo : C.border}`, color: isSel ? C.corpo : C.text, fontSize: 11, transition: "all 0.1s" }}>
                    {w.name}
                  </button>
                );
              })}
            </div>
            {selWeapon && (
              <div style={{ padding: "8px 10px", background: C.bg3, borderRadius: 6, marginBottom: 10, fontSize: 11 }}>
                <div style={{ fontWeight: 700, color: C.corpo, marginBottom: 2 }}>{selWeapon.name}</div>
                <div style={{ color: C.muted }}>{selWeapon.type} · {selWeapon.emp}{selWeapon.range ? ` · ${selWeapon.range}` : ""} · Ação: {selWeapon.act}</div>
                <div style={{ color: "#FACC15", marginTop: 2 }}>Dado: <strong>{selWeapon.dmg}</strong> · Crítico: {selWeapon.crit}</div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ marginBottom: 12 }}>
            <Lbl>Fórmula de Dano</Lbl>
            <input value={customFormula} onChange={e => setCustomFormula(e.target.value)} placeholder="1d8, 2d6+2, 1d12..." style={{ marginTop: 4 }} />
          </div>
        )}

        {/* RD */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <Lbl>RD do Alvo</Lbl>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <SmBtn onClick={() => setRd(v => Math.max(0, v - 1))}>−</SmBtn>
            <span style={{ fontWeight: 700, fontSize: 15, color: C.muted, width: 28, textAlign: "center" }}>{rd}</span>
            <SmBtn onClick={() => setRd(v => v + 1)}>+</SmBtn>
            <SmBtn onClick={() => setRd(0)} color={C.muted}>0</SmBtn>
          </div>
        </div>

        <div style={{ padding: "6px 10px", background: C.bg3, borderRadius: 6, marginBottom: 10, fontSize: 11, color: C.muted }}>
          Fórmula ativa: <strong style={{ color: C.corpo }}>{activeFormula}</strong> — rola 2×, usa o maior. Progresso Interno <strong>não</strong> soma no dano.
        </div>

        <button onClick={rollDmg} disabled={!getFormula()} style={{ width: "100%", padding: "12px", borderRadius: 8, background: getFormula() ? `${C.corpo}22` : C.bg3, border: `2px solid ${getFormula() ? C.corpo : C.border}`, color: getFormula() ? C.corpo : C.muted, fontFamily: "Georgia,serif", fontSize: 16, fontWeight: 700, letterSpacing: 2, transition: "all 0.2s" }}>
          ROLAR DANO
        </button>

        {dmgRes && (
          <div style={{ marginTop: 12, padding: "12px", background: C.bg3, borderRadius: 8, border: `2px solid ${C.corpo}` }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
              {/* Rolos individuais */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>1ª ROLAGEM</div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 700, color: dmgRes.r1 >= dmgRes.r2 ? C.corpo : C.muted }}>{dmgRes.r1}</div>
              </div>
              <div style={{ color: C.muted, fontSize: 18 }}>vs</div>
              <div style={{ flex: 1, textAlign: "right" }}>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>2ª ROLAGEM</div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 700, color: dmgRes.r2 > dmgRes.r1 ? C.corpo : C.muted }}>{dmgRes.r2}</div>
              </div>
            </div>
            {/* Dados detalhados */}
            <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
              {dmgRes.bestRolls.map((d, i) => (
                <div key={i} style={{ width: 30, height: 30, borderRadius: 5, background: `${C.corpo}22`, border: `1px solid ${C.corpo}44`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: C.corpo, fontSize: 13 }}>{d}</div>
              ))}
              {dmgRes.bestBonus !== 0 && <div style={{ display: "flex", alignItems: "center", color: C.muted, fontSize: 12 }}>{dmgRes.bestBonus > 0 ? "+" : ""}{dmgRes.bestBonus}</div>}
            </div>
            {/* Melhor resultado */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
              <div>
                <div style={{ fontSize: 10, color: C.muted }}>MELHOR RESULTADO</div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 32, fontWeight: 700, color: C.corpo, lineHeight: 1 }}>{dmgRes.best}</div>
              </div>
              {dmgRes.rd > 0 && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: C.muted }}>APÓS RD {dmgRes.rd}</div>
                  <div style={{ fontFamily: "Georgia,serif", fontSize: 32, fontWeight: 700, color: dmgRes.afterRD > 0 ? "#FACC15" : C.muted, lineHeight: 1 }}>{dmgRes.afterRD}</div>
                </div>
              )}
            </div>
            {dmgRes.best === dmgRes.r1 && dmgRes.r1 !== dmgRes.r2 && <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>Usou a 1ª rolagem</div>}
            {dmgRes.best === dmgRes.r2 && dmgRes.r1 !== dmgRes.r2 && <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>Usou a 2ª rolagem</div>}
          </div>
        )}
      </Sect>
    </div>
  );
}

// ── MANIFESTAÇÕES — ROLAGEM DE DANO ──────────────────────────────────────────

function ManifDmgTab({ char }) {
  const tierAlma = char.subs.dominio ? TIERS[char.subs.dominio.tier] : "Leigo";
  const MANIF_TIERS = ["Leigo", "Treinado", "Esp.", "Mestre", "Maestria"];
  const [selTier, setSelTier] = useState(tierAlma);
  const [amp, setAmp] = useState(0);
  const [progEf, setProgEf] = useState(0);
  const [manifRes, setManifRes] = useState(null);

  // Tipo de ação baseado em PE total
  function getActLabel(pe) {
    if (pe <= 3) return { label: "m — Simples", color: C.green };
    if (pe <= 7) return { label: "Mv — Avançada", color: C.mente };
    if (pe <= 14) return { label: "M — Completa", color: C.gold };
    return { label: "C — Extrema", color: "#EF4444" };
  }

  // Pega limiar de amplificação
  const AMP_BANDS = [0,1,3,6,10,15];
  const AMP_LABELS = ["+0","+1–2","+3–5","+6–9","+10–14","+15+"];

  function getAmpBand(a) {
    let idx = 0;
    for (let i = AMP_BANDS.length - 1; i >= 0; i--) { if (a >= AMP_BANDS[i]) { idx = i; break; } }
    return { idx, label: AMP_LABELS[idx] };
  }

  const formula = manifDmgFormula(selTier, amp);
  const act = getActLabel(amp);
  const ampBand = getAmpBand(amp);

  function rollManif() {
    const r1 = rollDiceParts(formula);
    const r2 = rollDiceParts(formula);
    if (!r1 || !r2) return;
    const bestR = r1.total >= r2.total ? r1 : r2;
    const withProg = Math.max(r1.total, r2.total) + progEf;
    setManifRes({ r1: r1.total, r2: r2.total, best: Math.max(r1.total, r2.total), withProg, bestRolls: bestR.rolls, formula, tierUsed: selTier, ampUsed: amp });
  }

  // Tabela de escala rápida
  const tierMap = {
    "Leigo":    ["1d6","1d8","2d6","2d8","3d8","4d8"],
    "Treinado": ["1d8","2d6","2d8","3d8","4d8","5d8"],
    "Esp.":     ["2d6","2d8","3d8","4d8","5d8","6d8"],
    "Mestre":   ["2d8","3d8","4d8","5d8","6d8","8d8"],
    "Maestria": ["3d8","4d8","5d8","6d8","8d8","10d8"],
  };

  return (
    <div>
      <Sect title="Rolagem de Dano — Manifestação" color={C.alma}>

        {/* Tier de Domínio */}
        <Lbl>Tier de Domínio</Lbl>
        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          {MANIF_TIERS.map(t => (
            <button key={t} onClick={() => setSelTier(t)} style={{ flex: 1, padding: "5px 2px", borderRadius: 5, background: selTier === t ? `${C.alma}33` : C.bg3, border: `1px solid ${selTier === t ? C.alma : C.border}`, color: selTier === t ? C.alma : C.muted, fontSize: 11, transition: "all 0.1s" }}>{t}</button>
          ))}
        </div>

        {/* Amplificação */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <Lbl>Amplificação PE extra</Lbl>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <SmBtn onClick={() => setAmp(v => Math.max(0, v - 1))}>−</SmBtn>
              <span style={{ fontWeight: 700, fontSize: 18, color: C.gold, width: 32, textAlign: "center" }}>{amp}</span>
              <SmBtn onClick={() => setAmp(v => v + 1)}>+</SmBtn>
              <SmBtn onClick={() => setAmp(0)} color={C.muted}>0</SmBtn>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>Faixa: {ampBand.label}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: act.color }}>{act.label}</div>
          </div>
        </div>

        {/* Progresso Efetivo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <Lbl>Prog. Efetivo (soma ao resultado)</Lbl>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <SmBtn onClick={() => setProgEf(v => v - 1)}>−</SmBtn>
            <span style={{ fontWeight: 700, fontSize: 15, color: C.gold, width: 32, textAlign: "center" }}>{progEf >= 0 ? "+" : ""}{progEf}</span>
            <SmBtn onClick={() => setProgEf(v => v + 1)}>+</SmBtn>
          </div>
        </div>

        {/* Preview */}
        <div style={{ padding: "8px 10px", background: `${C.alma}11`, border: `1px solid ${C.alma}33`, borderRadius: 6, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 10, color: C.muted }}>DADO BASE</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 700, color: C.alma }}>{formula}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: C.muted }}>TIER</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.alma }}>{selTier}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: C.muted }}>AÇÃO</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: act.color }}>{act.label.split("—")[0].trim()}</div>
            </div>
          </div>
        </div>

        <button onClick={rollManif} style={{ width: "100%", padding: "12px", borderRadius: 8, background: `${C.alma}22`, border: `2px solid ${C.alma}`, color: C.alma, fontFamily: "Georgia,serif", fontSize: 16, fontWeight: 700, letterSpacing: 2, transition: "all 0.2s" }}>
          ROLAR MANIFESTAÇÃO
        </button>

        {manifRes && (
          <div style={{ marginTop: 12, padding: "12px", background: C.bg3, borderRadius: 8, border: `2px solid ${C.alma}` }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>1ª ROLAGEM</div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 20, fontWeight: 700, color: manifRes.r1 >= manifRes.r2 ? C.alma : C.muted }}>{manifRes.r1}</div>
              </div>
              <div style={{ color: C.muted }}>vs</div>
              <div style={{ flex: 1, textAlign: "right" }}>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>2ª ROLAGEM</div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 20, fontWeight: 700, color: manifRes.r2 > manifRes.r1 ? C.alma : C.muted }}>{manifRes.r2}</div>
              </div>
            </div>
            {/* Detalhes dos dados */}
            <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
              {manifRes.bestRolls.map((d, i) => (
                <div key={i} style={{ width: 30, height: 30, borderRadius: 5, background: `${C.alma}22`, border: `1px solid ${C.alma}44`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: C.alma, fontSize: 13 }}>{d}</div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
              <div>
                <div style={{ fontSize: 10, color: C.muted }}>DANO BASE</div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 30, fontWeight: 700, color: C.alma, lineHeight: 1 }}>{manifRes.best}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{manifRes.tierUsed} · {manifRes.formula} · amp +{manifRes.ampUsed}</div>
              </div>
              {progEf !== 0 && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: C.muted }}>+ PROG. EF.</div>
                  <div style={{ fontFamily: "Georgia,serif", fontSize: 30, fontWeight: 700, color: C.gold, lineHeight: 1 }}>{manifRes.withProg}</div>
                  <div style={{ fontSize: 10, color: C.gold }}>com +{progEf}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabela de referência rápida */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontFamily: "Georgia,serif", fontSize: 10, color: C.muted, letterSpacing: 2, marginBottom: 6 }}>ESCALA RÁPIDA — {selTier.toUpperCase()}</div>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {(tierMap[selTier] || tierMap["Leigo"]).map((v, i) => (
              <div key={i} onClick={() => setAmp(AMP_BANDS[i])} style={{ flex: 1, minWidth: 44, padding: "5px 4px", background: ampBand.idx === i ? `${C.alma}22` : C.bg3, border: `1px solid ${ampBand.idx === i ? C.alma : C.border}`, borderRadius: 5, textAlign: "center", cursor: "pointer", transition: "all 0.1s" }}>
                <div style={{ fontSize: 9, color: C.muted, marginBottom: 2 }}>{AMP_LABELS[i]}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: ampBand.idx === i ? C.alma : C.text }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>Toque nas colunas para selecionar amplificação.</div>
        </div>
      </Sect>
    </div>
  );
}

// ── ARSENAL ──────────────────────────────────────────────────────────────────

function TabArsenal() {
  const [filter, setFilter] = useState("");
  const [cat, setCat] = useState("cacl");
  const cats = [
    { id: "cacl", label: "CaC Leve"   },
    { id: "cacm", label: "CaC Média"  },
    { id: "cacp", label: "CaC Pesada" },
    { id: "dist", label: "Distância"  },
    { id: "armor",label: "Armaduras"  },
  ];
  const wlist = cat === "armor" ? ARMORS : WEAPONS.filter(w => w.cat === cat);
  const shown = wlist.filter(w => w.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div>
      <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Buscar..." style={{ marginBottom: 10 }} />
      <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 8, marginBottom: 6 }}>
        {cats.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)} style={{ padding: "5px 12px", borderRadius: 20, whiteSpace: "nowrap", background: cat === c.id ? `${C.corpo}22` : C.bg2, border: `1px solid ${cat === c.id ? C.corpo : C.border}`, color: cat === c.id ? C.corpo : C.muted, fontSize: 12, transition: "all 0.15s" }}>
            {c.label}
          </button>
        ))}
      </div>

      {cat === "armor" ? shown.map(a => (
        <div key={a.name} style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{a.name}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{a.type} · {a.pen}</div>
          </div>
          <div style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 700, color: C.corpo }}>RD {a.rd}</div>
        </div>
      )) : shown.map(w => (
        <div key={w.name} style={{ ...card, marginBottom: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 1 }}>{w.name}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{w.type}{w.range ? ` · ${w.range}` : ""}{w.emp ? ` · ${w.emp}` : ""}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 10 }}>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 19, fontWeight: 700, color: C.corpo }}>{w.dmg}</div>
              <div style={{ fontSize: 10, color: C.muted }}>{w.act}</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "#FACC15" }}>⚡ Crítico: {w.crit}</div>
          {w.pen && <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Penalidade: {w.pen}</div>}
        </div>
      ))}

      {shown.length === 0 && <div style={{ textAlign: "center", color: C.muted, padding: 20 }}>Nenhum resultado para "{filter}"</div>}
    </div>
  );
}

// ── SISTEMA ──────────────────────────────────────────────────────────────────

function TabSistema() {
  const [sec, setSec] = useState("dt");
  const secs = [
    { id: "dt",      label: "DTs"          },
    { id: "conds",   label: "Condições"    },
    { id: "manif",   label: "Manifestações"},
    { id: "acoes",   label: "Ações"        },
    { id: "builder", label: "Builder"      },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 8, marginBottom: 8 }}>
        {secs.map(s => (
          <button key={s.id} onClick={() => setSec(s.id)} style={{ padding: "5px 12px", borderRadius: 20, whiteSpace: "nowrap", background: sec === s.id ? `${C.gold}22` : C.bg2, border: `1px solid ${sec === s.id ? C.gold : C.border}`, color: sec === s.id ? C.gold : C.muted, fontSize: 12, transition: "all 0.15s" }}>
            {s.label}
          </button>
        ))}
      </div>

      {sec === "dt" && (
        <Sect title="Classes de Dificuldade">
          {DT_TABLE.map(d => (
            <div key={d.dt} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 700, color: C.mente, width: 28, flexShrink: 0 }}>{d.dt}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{d.grau}</div></div>
              <div style={{ fontSize: 11, color: C.green, textAlign: "right", flexShrink: 0 }}>auto: {d.auto}</div>
            </div>
          ))}
          <div style={{ marginTop: 10, padding: "8px 10px", background: C.bg3, borderRadius: 6, fontSize: 11, color: C.muted }}>
            <strong style={{ color: C.gold }}>Crítico:</strong> melhor dado = 6 → Ameaça (confirma rolando novamente vs DT original).<br />
            <strong style={{ color: "#EF4444" }}>Falha Crítica:</strong> melhor dado = 1 + falha → complicação narrativa.<br />
            <strong style={{ color: C.mente }}>Vantagem/Desvantagem:</strong> rola 1 dado extra, descarta o pior/melhor.
          </div>
        </Sect>
      )}

      {sec === "conds" && (
        <Sect title="Condições — Catálogo">
          {CONDS.map(c => (
            <div key={c.id} style={{ padding: "8px", marginBottom: 6, background: c.color + "11", borderRadius: 6, borderLeft: `3px solid ${c.color}` }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: c.color, marginBottom: 2 }}>{c.label}</div>
              <div style={{ fontSize: 12, color: C.text }}>{c.desc}</div>
            </div>
          ))}
          <div style={{ padding: 8, background: "#6B728011", borderRadius: 6, borderLeft: "3px solid #6B7280", marginBottom: 6 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: C.muted, marginBottom: 2 }}>Exaustão 1–4</div>
            <div style={{ fontSize: 12, color: C.text }}>1: −1 · 2: −2, PE máx. −25% · 3: −3, mov ÷2, HP bloqueado · 4: Inconsciente, PE zero</div>
          </div>
          <div style={{ padding: 8, background: `${C.alma}11`, borderRadius: 6, borderLeft: `3px solid ${C.alma}` }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: C.alma, marginBottom: 2 }}>Assombro (Paranormal) 1–3</div>
            <div style={{ fontSize: 12, color: C.text }}>1: atacante recupera 10% dano como HP · 2: +1d4 sombra/turno · 3: +2d6 sombra, sem cura mágica</div>
          </div>
        </Sect>
      )}

      {sec === "manif" && (
        <div>
          <Sect title="Tipos por PE Total">
            {[{ t: "Simples", pe: "1–3 PE", act: "m — Ação Menor" }, { t: "Avançada", pe: "4–7 PE", act: "Mv — Movimento" }, { t: "Completa", pe: "8–14 PE", act: "M — Ação Maior" }, { t: "Extrema", pe: "15+ PE", act: "C — Ação Completa" }].map(x => (
              <div key={x.t} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: C.alma }}>{x.t}</span>
                <span style={{ color: C.muted }}>{x.pe}</span>
                <span style={{ color: C.text, fontSize: 11 }}>{x.act}</span>
              </div>
            ))}
          </Sect>
          <Sect title="Escala de Dano (Amplificação PE)">
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, minWidth: 300 }}>
                <thead><tr>
                  <th style={{ textAlign: "left", padding: "4px 5px", color: C.muted, borderBottom: `1px solid ${C.border}`, fontSize: 10 }}>Tier</th>
                  {DMG_COLS.map(c => <th key={c} style={{ padding: "4px 3px", color: C.muted, borderBottom: `1px solid ${C.border}`, fontSize: 10, textAlign: "center" }}>{c}</th>)}
                </tr></thead>
                <tbody>{DMG_ROWS.map((r, ri) => (
                  <tr key={r.tier} style={{ background: ri % 2 === 0 ? C.bg3 : "transparent" }}>
                    <td style={{ padding: "5px 5px", fontWeight: 600, color: C.alma, fontSize: 11 }}>{r.tier}</td>
                    {r.vals.map((v, i) => (
                      <td key={i} style={{ padding: "5px 3px", textAlign: "center", color: i === r.vals.length - 1 ? C.gold : i === 0 ? C.muted : C.text, fontWeight: i === r.vals.length - 1 ? 700 : 400, fontSize: 11 }}>{v}</td>
                    ))}
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 8 }}>Progresso Interno/Efetivo (+0 a +3) soma ao resultado final dos dados.</div>
          </Sect>
          <Sect title="Vetor Indireto">
            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>
              Manifestações NÃO agem diretamente sobre seres com Vontade. Cura direta de HP exige efeito indireto (ex: <em>Regenerante</em>, <em>Totem</em>). Funciona em inconscientes sem resistência ativa.
            </div>
          </Sect>
        </div>
      )}

      {sec === "acoes" && (
        <Sect title="Ações de Turno">
          {ACOES.map(a => (
            <div key={a.sym} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontFamily: "Georgia,serif", width: 30, height: 30, background: `${C.gold}22`, border: `1px solid ${C.gold}44`, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.gold, flexShrink: 0 }}>{a.sym}</div>
              <div><div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{a.name}</div><div style={{ fontSize: 11, color: C.muted }}>{a.desc}</div></div>
            </div>
          ))}
          <div style={{ marginTop: 10, padding: "8px 10px", background: C.bg3, borderRadius: 6, fontSize: 11, color: C.muted }}>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 10, color: C.gold, letterSpacing: 2, marginBottom: 6 }}>COMPOSIÇÕES COMUNS</div>
            {["M + m + Mv → Ataque + suporte + movimento", "M + m + m → Ataque + duas ações rápidas", "Mv + Mv + m → Reposicionamento duplo + 1 rápida"].map((c, i) => <div key={i} style={{ marginBottom: 3 }}>{c}</div>)}
          </div>
        </Sect>
      )}

      {sec === "builder" && <ManifBuilder />}
    </div>
  );
}

// ── MANIFESTATION BUILDER ────────────────────────────────────────────────────

function ManifBuilder() {
  const [el, setEl] = useState(null);
  const [forma, setForma] = useState(null);
  const [prop, setProp] = useState(null);
  const [amp, setAmp] = useState(0);

  const kw = (el?.pe || 0) + (forma?.pe || 0) + (prop?.pe || 0);
  const peT = kw + amp;
  const [actLabel, actColor] = peT <= 3
    ? ["m — Simples",   C.green]
    : peT <= 7
    ? ["Mv — Avançada", C.mente]
    : peT <= 14
    ? ["M — Completa",  C.gold]
    : ["C — Extrema",   "#EF4444"];

  return (
    <div>
      <div style={{ fontFamily: "Georgia,serif", fontSize: 11, color: C.gold, letterSpacing: 2, marginBottom: 12 }}>BUILDER DE MANIFESTAÇÃO</div>

      {[
        { label: "Elemento",               data: ELEMENTOS, sel: el,    setSel: setEl,    color: C.alma  },
        { label: "Forma",                  data: FORMAS,    sel: forma,  setSel: setForma, color: C.mente },
        { label: "Propriedade (opcional)", data: PROPS,     sel: prop,   setSel: setProp,  color: C.gold  },
      ].map(({ label, data, sel, setSel, color }) => (
        <div key={label} style={{ marginBottom: 12 }}>
          <Lbl>{label}</Lbl>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
            {data.map(x => (
              <button key={x.name} onClick={() => setSel(sel?.name === x.name ? null : x)} style={{ padding: "3px 8px", borderRadius: 5, fontSize: 11, background: sel?.name === x.name ? `${color}22` : C.bg3, border: `1px solid ${sel?.name === x.name ? color : C.border}`, color: sel?.name === x.name ? color : C.text, transition: "all 0.1s" }}>
                {x.name} <span style={{ color: C.gold, fontSize: 10 }}>{x.pe}PE</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <div style={{ marginBottom: 14 }}>
        <Lbl>Amplificação extra (PE)</Lbl>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <SmBtn onClick={() => setAmp(v => Math.max(0, v - 1))}>−</SmBtn>
          <span style={{ fontWeight: 700, color: C.gold, width: 24, textAlign: "center" }}>{amp}</span>
          <SmBtn onClick={() => setAmp(v => v + 1)}>+</SmBtn>
        </div>
      </div>

      <div style={{ ...card, borderColor: actColor, background: `${actColor}0D`, padding: 14 }}>
        <div style={{ display: "flex", gap: 14, marginBottom: 10 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>KW</div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 26, fontWeight: 700, color: C.alma, lineHeight: 1 }}>{kw}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>PE Total</div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 26, fontWeight: 700, color: C.gold, lineHeight: 1 }}>{peT}</div>
          </div>
          <div style={{ flex: 1, textAlign: "right", paddingTop: 4 }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>Tipo de Ação</div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 13, fontWeight: 700, color: actColor }}>{actLabel}</div>
          </div>
        </div>
        {(el || forma || prop) && (
          <div style={{ fontSize: 11, color: C.muted, borderTop: `1px solid ${C.border}`, paddingTop: 8, lineHeight: 1.7 }}>
            {[el, forma, prop].filter(Boolean).map(x => `${x.name} (${x.pe} PE)`).join(" + ")}{amp > 0 ? ` + ${amp} Amplif.` : ""}
          </div>
        )}
        {el    && <div style={{ fontSize: 11, color: C.text, marginTop: 4 }}>El: {el.desc}</div>}
        {forma && <div style={{ fontSize: 11, color: C.text }}>Forma: {forma.desc}</div>}
        {prop  && <div style={{ fontSize: 11, color: C.text }}>Prop: {prop.desc}</div>}
      </div>
    </div>
  );
}

// ── Mount ────────────────────────────────────────────────────────────────────

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
