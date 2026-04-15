// â”€â”€ FICHA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
    { id: "pericias",label: "PerÃ­cias"  },
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
                <Lbl>NÃ­vel</Lbl>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                  <SmBtn onClick={() => setLvl(Math.max(1, char.level - 1))}>âˆ’</SmBtn>
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
            {[{ k: "hp", label: "HP â€” Pontos de Vida", c: C.corpo }, { k: "sp", label: "SP â€” Sanidade", c: C.mente }, { k: "pe", label: "PE â€” EssÃªncia", c: C.alma }].map(({ k, label, c }) => {
              const mx = k === "sp" ? 100 : ld[k];
              const cur = char[k].cur;
              const pct = mx > 0 ? Math.max(0, Math.min(100, (cur / mx) * 100)) : 0;
              return (
                <div key={k} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontFamily: "Georgia,serif", fontSize: 11, color: c, letterSpacing: 1 }}>{label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <SmBtn onClick={() => setRes(k, cur - 5)} color={c}>âˆ’5</SmBtn>
                      <SmBtn onClick={() => setRes(k, cur - 1)} color={c}>âˆ’</SmBtn>
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
                    {k === "hp" ? "âš  Ãšltimos Pontos: âˆ’2 em tudo" : k === "sp" ? "âš  Quebrado: âˆ’3 em rolagens" : "âš  Sem ManifestaÃ§Ãµes atÃ© recuperaÃ§Ã£o"}
                  </div>}
                </div>
              );
            })}
            <div>
              <Lbl>ExaustÃ£o</Lbl>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 4 }}>
                {[0, 1, 2, 3, 4].map(i => (
                  <button key={i} onClick={() => upd({ exaustao: i === char.exaustao && i > 0 ? i - 1 : i })}
                    style={{ width: 30, height: 28, borderRadius: 4, background: char.exaustao >= i && i > 0 ? "#6B728033" : C.bg3, border: `1px solid ${char.exaustao >= i && i > 0 ? "#6B7280" : C.border}`, color: char.exaustao >= i && i > 0 ? C.text : C.muted, fontWeight: 700, fontSize: 12 }}>
                    {i}
                  </button>
                ))}
                {char.exaustao > 0 && <span style={{ fontSize: 11, color: C.muted }}>âˆ’{char.exaustao} rolagens{char.exaustao >= 3 ? " Â· movÃ·2" : ""}{char.exaustao >= 4 ? " Â· Inconsciente" : ""}</span>}
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
                    <SmBtn onClick={() => setPilar(pk, char.pilares[pk] - 1)}>âˆ’</SmBtn>
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
                        <div style={{ fontSize: 9, color: pv.color, letterSpacing: 1 }}>{TIERS[s.tier]}{tdt ? ` Â· auto DT${tdt}` : ""}</div>
                      </div>
                      <div style={{ display: "flex", gap: 3 }}>
                        {TIERS.map((_, i) => (
                          <button key={i} onClick={() => setSub(sk, "tier", i)} title={TIERS[i]}
                            style={{ width: 13, height: 13, borderRadius: 2, background: s.tier >= i ? pv.color : C.border, border: "none", cursor: "pointer", flexShrink: 0 }} />
                        ))}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 3, marginLeft: "auto" }}>
                        <SmBtn onClick={() => setSub(sk, "prog", Math.max(0, s.prog - 1))}>âˆ’</SmBtn>
                        <span style={{ fontSize: 14, fontWeight: 700, color: pv.color, width: 22, textAlign: "center" }}>+{s.prog}</span>
                        <SmBtn onClick={() => setSub(sk, "prog", Math.min(3, s.prog + 1))}>+</SmBtn>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </Sect>

          {/* CondiÃ§Ãµes */}
          <Sect title="CondiÃ§Ãµes Ativas">
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

          {/* DeterminaÃ§Ã£o */}
          <Sect title="DeterminaÃ§Ã£o">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <SmBtn onClick={() => upd({ determinacao: Math.max(0, char.determinacao - 1) })}>âˆ’</SmBtn>
              <div style={{ display: "flex", gap: 5 }}>
                {Array.from({ length: Math.max(5, char.determinacao + 1) }).map((_, i) => (
                  <div key={i} style={{ width: 18, height: 18, borderRadius: 3, background: i < char.determinacao ? C.gold : C.bg3, border: `1px solid ${i < char.determinacao ? C.gold : C.border}`, transition: "all 0.2s" }} />
                ))}
              </div>
              <SmBtn onClick={() => upd({ determinacao: char.determinacao + 1 })}>+</SmBtn>
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>Cicatriz que virou recurso. Ativa quando a cena confronta a DeclaraÃ§Ã£o. NÃ£o altera dados â€” ignora um obstÃ¡culo com consequÃªncia.</div>
          </Sect>
        </div>
      )}

      {fichaTab === "pericias" && (
        <PericiasTab char={char} setPericia={setPericia} />
      )}

      {fichaTab === "extras" && (
        <div>
          <Sect title="Habilidades & ManifestaÃ§Ãµes">
            {[
              { k: "habilidades",    label: "Habilidades",             ph: "Resistente, Atirador, Sensitivo, Exorcista..." },
              { k: "manifestacoesDef", label: "ManifestaÃ§Ãµes Definidas", ph: "Centelha: Pyro+Bola 2PE Â· Escudo: Cryo+CÃºpula 6PE..." },
              { k: "notas",          label: "Notas Livres",            ph: "AnotaÃ§Ãµes, Ã¢ncoras, declaraÃ§Ãµes de determinaÃ§Ã£o..." },
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

// â”€â”€ PERÃCIAS TAB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PericiasTab({ char, setPericia }) {
  const PILAR_COLOR = { corpo: C.corpo, mente: C.mente, alma: C.alma };
  const PILAR_LABEL = { corpo: "CORPO", mente: "MENTE", alma: "ALMA" };

  return (
    <div>
      <div style={{ padding: "8px 10px", background: C.bg3, borderRadius: 6, marginBottom: 10, fontSize: 11, color: C.muted }}>
        Tier avanÃ§a com 4 pts. Auto-sucesso: Treinado DT4 Â· Esp. DT5 Â· Mestre DT6 Â· Maestria DT7.
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
                    <div style={{ fontSize: 9, color: pc, letterSpacing: 1 }}>{TIERS[s.tier]} Â· {autoTxt}</div>
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
                    <SmBtn onClick={() => setPericia(p.id, "prog", Math.max(0, s.prog - 1))}>âˆ’</SmBtn>
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
