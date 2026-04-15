// â”€â”€ DADOS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
          {[{ id: "sub", label: "Subatributo" }, { id: "pericia", label: "PerÃ­cia" }].map(m => (
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
            <Lbl>PerÃ­cia</Lbl>
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
              <SmBtn onClick={() => setEf(v => v - 1)}>âˆ’</SmBtn>
              <span style={{ fontWeight: 700, fontSize: 16, color: C.gold, width: 32, textAlign: "center" }}>{ef >= 0 ? "+" : ""}{ef}</span>
              <SmBtn onClick={() => setEf(v => v + 1)}>+</SmBtn>
            </div>
          </div>
          <div>
            <Lbl>DT Alvo</Lbl>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <SmBtn onClick={() => setDt(v => Math.max(1, v - 1))}>âˆ’</SmBtn>
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
          {char.exaustao > 0 && <><span style={{ color: C.muted }}>+</span><span style={{ color: "#EF4444" }}>âˆ’{char.exaustao} exaustÃ£o</span></>}
          <span style={{ color: C.muted }}>vs</span>
          <span style={{ color: autoNow ? C.green : C.mente, fontWeight: 700 }}>DT {dt}{autoNow ? " âš¡auto" : ""}</span>
        </div>

        <button onClick={roll} disabled={rolling} style={{ width: "100%", padding: "12px", borderRadius: 8, background: rolling ? C.bg3 : `${C.gold}22`, border: `2px solid ${rolling ? C.border : C.gold}`, color: rolling ? C.muted : C.gold, fontFamily: "Georgia,serif", fontSize: 16, fontWeight: 700, letterSpacing: 2, transition: "all 0.2s" }}>
          {rolling ? "Â·Â·Â·" : "ROLAR"}
        </button>
      </Sect>

      {res && (
        <div style={{ ...card, borderColor: res.suc ? C.green : res.threat ? C.gold : "#EF4444", borderWidth: 2, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 15, color: res.auto ? "#FDE68A" : res.threat ? C.gold : res.suc ? C.green : "#EF4444", fontWeight: 700, letterSpacing: 1 }}>
              {res.auto ? "âš¡ AUTO-SUCESSO" : res.threat ? "â—ˆ AMEAÃ‡A!" : res.suc ? "âœ“ SUCESSO" : res.critfail ? "âœ• FALHA CRÃTICA" : "âœ• FALHA"}
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
          {res.threat && <div style={{ fontSize: 11, color: C.gold, marginTop: 4, padding: "4px 8px", background: C.gold + "11", borderRadius: 4 }}>Role novamente vs DT {res.dt} para confirmar crÃ­tico â†’ Impacto Bruto ou Efeito CrÃ­tico</div>}
          {res.critfail && <div style={{ fontSize: 11, color: "#EF4444", marginTop: 4, padding: "4px 8px", background: "#EF444411", borderRadius: 4 }}>Falha CrÃ­tica â€” Mestre introduz complicaÃ§Ã£o narrativa proporcional</div>}
        </div>
      )}

      {hist.length > 1 && (
        <Sect title="HistÃ³rico" color={C.muted}>
          {hist.slice(1).map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
              <span style={{ color: C.muted }}>{r.t} Â· {r.label}</span>
              <span style={{ color: r.suc ? C.green : "#EF4444", fontWeight: 600 }}>{r.total} vs {r.dt} {r.suc ? "âœ“" : "âœ•"}</span>
            </div>
          ))}
        </Sect>
      )}
    </div>
  );
}

// â”€â”€ COMBATE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
              <button onClick={rollAllInit} style={{ padding: "6px 10px", borderRadius: 6, background: C.bg3, border: `1px solid ${C.border}`, color: C.text, fontSize: 12 }}>â—‰ Iniciativa</button>
              <button onClick={next} style={{ padding: "6px 14px", borderRadius: 6, background: `${C.gold}22`, border: `1px solid ${C.gold}`, color: C.gold, fontFamily: "Georgia,serif", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>PRÃ“X â–¶</button>
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
                  <button onClick={() => remove(f.id)} style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: C.bg3, border: `1px solid ${C.border}`, color: C.muted }}>âœ•</button>
                </div>
                <div style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <span style={{ fontSize: 10, color: C.muted, letterSpacing: 1 }}>HP</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <SmBtn onClick={() => chHp(f.id, -10)} color="#EF4444" wide>âˆ’10</SmBtn>
                      <SmBtn onClick={() => chHp(f.id, -5)}  color="#EF4444" wide>âˆ’5</SmBtn>
                      <SmBtn onClick={() => chHp(f.id, -1)}  color="#EF4444">âˆ’</SmBtn>
                      <span style={{ fontSize: 13, fontWeight: 700, color: hc, minWidth: 48, textAlign: "center" }}>{f.hp}/{f.maxHp}</span>
                      <SmBtn onClick={() => chHp(f.id, 1)}   color={C.green}>+</SmBtn>
                      <SmBtn onClick={() => chHp(f.id, 5)}   color={C.green} wide>+5</SmBtn>
                    </div>
                  </div>
                  <div style={{ height: 5, background: C.bg3, borderRadius: 3 }}>
                    <div style={{ height: 5, width: `${pct}%`, background: hc, borderRadius: 3, transition: "width 0.3s" }} />
                  </div>
                  {pct === 0 && <div style={{ fontSize: 10, color: "#EF4444", marginTop: 2 }}>Inconsciente â€” Teste ConstituiÃ§Ã£o DT 5/turno ou morte</div>}
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

// â”€â”€ ARMAS â€” ROLAGEM DE DANO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ArmasDmgTab({ char }) {
  const [selWeapon, setSelWeapon] = useState(null);
  const [customFormula, setCustomFormula] = useState("1d8");
  const [useCustom, setUseCustom] = useState(false);
  const [dmgRes, setDmgRes] = useState(null);
  const [rd, setRd] = useState(0);
  const [catFilter, setCatFilter] = useState("cacl");

  const cats = [
    { id: "cacl", label: "Leve"   },
    { id: "cacm", label: "MÃ©dia"  },
    { id: "cacp", label: "Pesada" },
    { id: "dist", label: "Dist."  },
  ];

  const visibleWeapons = WEAPONS.filter(w => w.cat === catFilter);

  function getFormula() {
    if (useCustom) return customFormula;
    if (!selWeapon) return null;
    // pega o primeiro dado (para armas versÃ¡teis, pega o 1M)
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

  // Extrai fÃ³rmula limpa pra mostrar no botÃ£o
  const activeFormula = getFormula() || "â€”";

  return (
    <div>
      {/* Tipo de ataque */}
      <Sect title="Rolagem de Dano â€” Armas" color={C.corpo}>
        <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
          <button onClick={() => setUseCustom(false)} style={{ flex: 1, padding: "6px", borderRadius: 6, background: !useCustom ? `${C.corpo}22` : C.bg3, border: `1px solid ${!useCustom ? C.corpo : C.border}`, color: !useCustom ? C.corpo : C.muted, fontSize: 11 }}>Selecionar Arma</button>
          <button onClick={() => setUseCustom(true)} style={{ flex: 1, padding: "6px", borderRadius: 6, background: useCustom ? `${C.corpo}22` : C.bg3, border: `1px solid ${useCustom ? C.corpo : C.border}`, color: useCustom ? C.corpo : C.muted, fontSize: 11 }}>FÃ³rmula Livre</button>
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
                <div style={{ color: C.muted }}>{selWeapon.type} Â· {selWeapon.emp}{selWeapon.range ? ` Â· ${selWeapon.range}` : ""} Â· AÃ§Ã£o: {selWeapon.act}</div>
                <div style={{ color: "#FACC15", marginTop: 2 }}>Dado: <strong>{selWeapon.dmg}</strong> Â· CrÃ­tico: {selWeapon.crit}</div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ marginBottom: 12 }}>
            <Lbl>FÃ³rmula de Dano</Lbl>
            <input value={customFormula} onChange={e => setCustomFormula(e.target.value)} placeholder="1d8, 2d6+2, 1d12..." style={{ marginTop: 4 }} />
          </div>
        )}

        {/* RD */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <Lbl>RD do Alvo</Lbl>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <SmBtn onClick={() => setRd(v => Math.max(0, v - 1))}>âˆ’</SmBtn>
            <span style={{ fontWeight: 700, fontSize: 15, color: C.muted, width: 28, textAlign: "center" }}>{rd}</span>
            <SmBtn onClick={() => setRd(v => v + 1)}>+</SmBtn>
            <SmBtn onClick={() => setRd(0)} color={C.muted}>0</SmBtn>
          </div>
        </div>

        <div style={{ padding: "6px 10px", background: C.bg3, borderRadius: 6, marginBottom: 10, fontSize: 11, color: C.muted }}>
          FÃ³rmula ativa: <strong style={{ color: C.corpo }}>{activeFormula}</strong> â€” rola 2Ã—, usa o maior. Progresso Interno <strong>nÃ£o</strong> soma no dano.
        </div>

        <button onClick={rollDmg} disabled={!getFormula()} style={{ width: "100%", padding: "12px", borderRadius: 8, background: getFormula() ? `${C.corpo}22` : C.bg3, border: `2px solid ${getFormula() ? C.corpo : C.border}`, color: getFormula() ? C.corpo : C.muted, fontFamily: "Georgia,serif", fontSize: 16, fontWeight: 700, letterSpacing: 2, transition: "all 0.2s" }}>
          ROLAR DANO
        </button>

        {dmgRes && (
          <div style={{ marginTop: 12, padding: "12px", background: C.bg3, borderRadius: 8, border: `2px solid ${C.corpo}` }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
              {/* Rolos individuais */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>1Âª ROLAGEM</div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 700, color: dmgRes.r1 >= dmgRes.r2 ? C.corpo : C.muted }}>{dmgRes.r1}</div>
              </div>
              <div style={{ color: C.muted, fontSize: 18 }}>vs</div>
              <div style={{ flex: 1, textAlign: "right" }}>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>2Âª ROLAGEM</div>
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
                  <div style={{ fontSize: 10, color: C.muted }}>APÃ“S RD {dmgRes.rd}</div>
                  <div style={{ fontFamily: "Georgia,serif", fontSize: 32, fontWeight: 700, color: dmgRes.afterRD > 0 ? "#FACC15" : C.muted, lineHeight: 1 }}>{dmgRes.afterRD}</div>
                </div>
              )}
            </div>
            {dmgRes.best === dmgRes.r1 && dmgRes.r1 !== dmgRes.r2 && <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>Usou a 1Âª rolagem</div>}
            {dmgRes.best === dmgRes.r2 && dmgRes.r1 !== dmgRes.r2 && <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>Usou a 2Âª rolagem</div>}
          </div>
        )}
      </Sect>
    </div>
  );
}

// â”€â”€ MANIFESTAÃ‡Ã•ES â€” ROLAGEM DE DANO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ManifDmgTab({ char }) {
  const tierAlma = char.subs.dominio ? TIERS[char.subs.dominio.tier] : "Leigo";
  const MANIF_TIERS = ["Leigo", "Treinado", "Esp.", "Mestre", "Maestria"];
  const [selTier, setSelTier] = useState(tierAlma);
  const [amp, setAmp] = useState(0);
  const [progEf, setProgEf] = useState(0);
  const [manifRes, setManifRes] = useState(null);

  // Tipo de aÃ§Ã£o baseado em PE total
  function getActLabel(pe) {
    if (pe <= 3) return { label: "m â€” Simples", color: C.green };
    if (pe <= 7) return { label: "Mv â€” AvanÃ§ada", color: C.mente };
    if (pe <= 14) return { label: "M â€” Completa", color: C.gold };
    return { label: "C â€” Extrema", color: "#EF4444" };
  }

  // Pega limiar de amplificaÃ§Ã£o
  const AMP_BANDS = [0,1,3,6,10,15];
  const AMP_LABELS = ["+0","+1â€“2","+3â€“5","+6â€“9","+10â€“14","+15+"];

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

  // Tabela de escala rÃ¡pida
  const tierMap = {
    "Leigo":    ["1d6","1d8","2d6","2d8","3d8","4d8"],
    "Treinado": ["1d8","2d6","2d8","3d8","4d8","5d8"],
    "Esp.":     ["2d6","2d8","3d8","4d8","5d8","6d8"],
    "Mestre":   ["2d8","3d8","4d8","5d8","6d8","8d8"],
    "Maestria": ["3d8","4d8","5d8","6d8","8d8","10d8"],
  };

  return (
    <div>
      <Sect title="Rolagem de Dano â€” ManifestaÃ§Ã£o" color={C.alma}>

        {/* Tier de DomÃ­nio */}
        <Lbl>Tier de DomÃ­nio</Lbl>
        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          {MANIF_TIERS.map(t => (
            <button key={t} onClick={() => setSelTier(t)} style={{ flex: 1, padding: "5px 2px", borderRadius: 5, background: selTier === t ? `${C.alma}33` : C.bg3, border: `1px solid ${selTier === t ? C.alma : C.border}`, color: selTier === t ? C.alma : C.muted, fontSize: 11, transition: "all 0.1s" }}>{t}</button>
          ))}
        </div>

        {/* AmplificaÃ§Ã£o */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <Lbl>AmplificaÃ§Ã£o PE extra</Lbl>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <SmBtn onClick={() => setAmp(v => Math.max(0, v - 1))}>âˆ’</SmBtn>
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
            <SmBtn onClick={() => setProgEf(v => v - 1)}>âˆ’</SmBtn>
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
              <div style={{ fontSize: 10, color: C.muted }}>AÃ‡ÃƒO</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: act.color }}>{act.label.split("â€”")[0].trim()}</div>
            </div>
          </div>
        </div>

        <button onClick={rollManif} style={{ width: "100%", padding: "12px", borderRadius: 8, background: `${C.alma}22`, border: `2px solid ${C.alma}`, color: C.alma, fontFamily: "Georgia,serif", fontSize: 16, fontWeight: 700, letterSpacing: 2, transition: "all 0.2s" }}>
          ROLAR MANIFESTAÃ‡ÃƒO
        </button>

        {manifRes && (
          <div style={{ marginTop: 12, padding: "12px", background: C.bg3, borderRadius: 8, border: `2px solid ${C.alma}` }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>1Âª ROLAGEM</div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 20, fontWeight: 700, color: manifRes.r1 >= manifRes.r2 ? C.alma : C.muted }}>{manifRes.r1}</div>
              </div>
              <div style={{ color: C.muted }}>vs</div>
              <div style={{ flex: 1, textAlign: "right" }}>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>2Âª ROLAGEM</div>
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
                <div style={{ fontSize: 10, color: C.muted }}>{manifRes.tierUsed} Â· {manifRes.formula} Â· amp +{manifRes.ampUsed}</div>
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

        {/* Tabela de referÃªncia rÃ¡pida */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontFamily: "Georgia,serif", fontSize: 10, color: C.muted, letterSpacing: 2, marginBottom: 6 }}>ESCALA RÃPIDA â€” {selTier.toUpperCase()}</div>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {(tierMap[selTier] || tierMap["Leigo"]).map((v, i) => (
              <div key={i} onClick={() => setAmp(AMP_BANDS[i])} style={{ flex: 1, minWidth: 44, padding: "5px 4px", background: ampBand.idx === i ? `${C.alma}22` : C.bg3, border: `1px solid ${ampBand.idx === i ? C.alma : C.border}`, borderRadius: 5, textAlign: "center", cursor: "pointer", transition: "all 0.1s" }}>
                <div style={{ fontSize: 9, color: C.muted, marginBottom: 2 }}>{AMP_LABELS[i]}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: ampBand.idx === i ? C.alma : C.text }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>Toque nas colunas para selecionar amplificaÃ§Ã£o.</div>
        </div>
      </Sect>
    </div>
  );
}
