// â”€â”€ ARSENAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function TabArsenal() {
  const [filter, setFilter] = useState("");
  const [cat, setCat] = useState("cacl");
  const cats = [
    { id: "cacl", label: "CaC Leve"   },
    { id: "cacm", label: "CaC MÃ©dia"  },
    { id: "cacp", label: "CaC Pesada" },
    { id: "dist", label: "DistÃ¢ncia"  },
    { id: "armor",label: "Armaduras"  },
  ];
  const filterValue = filter.toLowerCase();
  const wlist = cat === "armor" ? ARMORS : WEAPONS.filter(w => w.cat === cat);
  const shown = wlist.filter(w => w.name.toLowerCase().includes(filterValue));

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
            <div style={{ fontSize: 11, color: C.muted }}>{a.type} Â· {a.pen}</div>
          </div>
          <div style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 700, color: C.corpo }}>RD {a.rd}</div>
        </div>
      )) : shown.map(w => (
        <div key={w.name} style={{ ...card, marginBottom: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 1 }}>{w.name}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{w.type}{w.range ? ` Â· ${w.range}` : ""}{w.emp ? ` Â· ${w.emp}` : ""}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 10 }}>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 19, fontWeight: 700, color: C.corpo }}>{w.dmg}</div>
              <div style={{ fontSize: 10, color: C.muted }}>{w.act}</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "#FACC15" }}>âš¡ CrÃ­tico: {w.crit}</div>
          {w.pen && <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Penalidade: {w.pen}</div>}
        </div>
      ))}

      {shown.length === 0 && <div style={{ textAlign: "center", color: C.muted, padding: 20 }}>Nenhum resultado para "{filter}"</div>}
    </div>
  );
}

// â”€â”€ SISTEMA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function TabSistema() {
  const [sec, setSec] = useState("dt");
  const secs = [
    { id: "dt",      label: "DTs"          },
    { id: "conds",   label: "CondiÃ§Ãµes"    },
    { id: "manif",   label: "ManifestaÃ§Ãµes"},
    { id: "acoes",   label: "AÃ§Ãµes"        },
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
            <strong style={{ color: C.gold }}>CrÃ­tico:</strong> melhor dado = 6 â†’ AmeaÃ§a (confirma rolando novamente vs DT original).<br />
            <strong style={{ color: "#EF4444" }}>Falha CrÃ­tica:</strong> melhor dado = 1 + falha â†’ complicaÃ§Ã£o narrativa.<br />
            <strong style={{ color: C.mente }}>Vantagem/Desvantagem:</strong> rola 1 dado extra, descarta o pior/melhor.
          </div>
        </Sect>
      )}

      {sec === "conds" && (
        <Sect title="CondiÃ§Ãµes â€” CatÃ¡logo">
          {CONDS.map(c => (
            <div key={c.id} style={{ padding: "8px", marginBottom: 6, background: c.color + "11", borderRadius: 6, borderLeft: `3px solid ${c.color}` }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: c.color, marginBottom: 2 }}>{c.label}</div>
              <div style={{ fontSize: 12, color: C.text }}>{c.desc}</div>
            </div>
          ))}
          <div style={{ padding: 8, background: "#6B728011", borderRadius: 6, borderLeft: "3px solid #6B7280", marginBottom: 6 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: C.muted, marginBottom: 2 }}>ExaustÃ£o 1â€“4</div>
            <div style={{ fontSize: 12, color: C.text }}>1: âˆ’1 Â· 2: âˆ’2, PE mÃ¡x. âˆ’25% Â· 3: âˆ’3, mov Ã·2, HP bloqueado Â· 4: Inconsciente, PE zero</div>
          </div>
          <div style={{ padding: 8, background: `${C.alma}11`, borderRadius: 6, borderLeft: `3px solid ${C.alma}` }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: C.alma, marginBottom: 2 }}>Assombro (Paranormal) 1â€“3</div>
            <div style={{ fontSize: 12, color: C.text }}>1: atacante recupera 10% dano como HP Â· 2: +1d4 sombra/turno Â· 3: +2d6 sombra, sem cura mÃ¡gica</div>
          </div>
        </Sect>
      )}

      {sec === "manif" && (
        <div>
          <Sect title="Tipos por PE Total">
            {[{ t: "Simples", pe: "1â€“3 PE", act: "m â€” AÃ§Ã£o Menor" }, { t: "AvanÃ§ada", pe: "4â€“7 PE", act: "Mv â€” Movimento" }, { t: "Completa", pe: "8â€“14 PE", act: "M â€” AÃ§Ã£o Maior" }, { t: "Extrema", pe: "15+ PE", act: "C â€” AÃ§Ã£o Completa" }].map(x => (
              <div key={x.t} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: C.alma }}>{x.t}</span>
                <span style={{ color: C.muted }}>{x.pe}</span>
                <span style={{ color: C.text, fontSize: 11 }}>{x.act}</span>
              </div>
            ))}
          </Sect>
          <Sect title="Escala de Dano (AmplificaÃ§Ã£o PE)">
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
              ManifestaÃ§Ãµes NÃƒO agem diretamente sobre seres com Vontade. Cura direta de HP exige efeito indireto (ex: <em>Regenerante</em>, <em>Totem</em>). Funciona em inconscientes sem resistÃªncia ativa.
            </div>
          </Sect>
        </div>
      )}

      {sec === "acoes" && (
        <Sect title="AÃ§Ãµes de Turno">
          {ACOES.map(a => (
            <div key={a.sym} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontFamily: "Georgia,serif", width: 30, height: 30, background: `${C.gold}22`, border: `1px solid ${C.gold}44`, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.gold, flexShrink: 0 }}>{a.sym}</div>
              <div><div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{a.name}</div><div style={{ fontSize: 11, color: C.muted }}>{a.desc}</div></div>
            </div>
          ))}
          <div style={{ marginTop: 10, padding: "8px 10px", background: C.bg3, borderRadius: 6, fontSize: 11, color: C.muted }}>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 10, color: C.gold, letterSpacing: 2, marginBottom: 6 }}>COMPOSIÃ‡Ã•ES COMUNS</div>
            {["M + m + Mv â†’ Ataque + suporte + movimento", "M + m + m â†’ Ataque + duas aÃ§Ãµes rÃ¡pidas", "Mv + Mv + m â†’ Reposicionamento duplo + 1 rÃ¡pida"].map((c, i) => <div key={i} style={{ marginBottom: 3 }}>{c}</div>)}
          </div>
        </Sect>
      )}

      {sec === "builder" && <ManifBuilder />}
    </div>
  );
}

// â”€â”€ MANIFESTATION BUILDER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ManifBuilder() {
  const [el, setEl] = useState(null);
  const [forma, setForma] = useState(null);
  const [prop, setProp] = useState(null);
  const [amp, setAmp] = useState(0);

  const kw = (el?.pe || 0) + (forma?.pe || 0) + (prop?.pe || 0);
  const peT = kw + amp;
  const [actLabel, actColor] = peT <= 3
    ? ["m â€” Simples",   C.green]
    : peT <= 7
    ? ["Mv â€” AvanÃ§ada", C.mente]
    : peT <= 14
    ? ["M â€” Completa",  C.gold]
    : ["C â€” Extrema",   "#EF4444"];

  return (
    <div>
      <div style={{ fontFamily: "Georgia,serif", fontSize: 11, color: C.gold, letterSpacing: 2, marginBottom: 12 }}>BUILDER DE MANIFESTAÃ‡ÃƒO</div>

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
        <Lbl>AmplificaÃ§Ã£o extra (PE)</Lbl>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <SmBtn onClick={() => setAmp(v => Math.max(0, v - 1))}>âˆ’</SmBtn>
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
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>Tipo de AÃ§Ã£o</div>
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
