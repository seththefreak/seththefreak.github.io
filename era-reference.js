function TabArsenal() {
  const [filter, setFilter] = useState("");
  const [cat, setCat] = useState("cacl");
  const cats = [
    { id: "cacl", label: "CaC Leve" },
    { id: "cacm", label: "CaC Media" },
    { id: "cacp", label: "CaC Pesada" },
    { id: "dist", label: "Distancia" },
    { id: "armor", label: "Armaduras" },
  ];

  const filterValue = filter.toLowerCase();
  const weaponList = cat === "armor" ? ARMORS : WEAPONS.filter((weapon) => weapon.cat === cat);
  const shown = weaponList.filter((item) => item.name.toLowerCase().includes(filterValue));

  return (
    <div>
      <input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Buscar..." style={{ marginBottom: 10 }} />
      <div className="chip-row" style={{ marginBottom: 8 }}>
        {cats.map((item) => {
          const active = cat === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCat(item.id)}
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                whiteSpace: "nowrap",
                background: active ? `${C.corpo}22` : C.bg2,
                border: `1px solid ${active ? C.corpo : C.border}`,
                color: active ? C.corpo : C.muted,
                fontSize: 12,
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <ResponsiveGrid minWidth={280}>
        {cat === "armor"
          ? shown.map((armor) => (
              <div key={armor.name} style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{armor.name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{armor.type} - {armor.pen}</div>
                </div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 700, color: C.corpo }}>RD {armor.rd}</div>
              </div>
            ))
          : shown.map((weapon) => (
              <div key={weapon.name} style={{ ...card }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4, gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 1 }}>{weapon.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>
                      {weapon.type}
                      {weapon.range ? ` - ${weapon.range}` : ""}
                      {weapon.emp ? ` - ${weapon.emp}` : ""}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "Georgia,serif", fontSize: 19, fontWeight: 700, color: C.corpo }}>{weapon.dmg}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{weapon.act}</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "#FACC15" }}>Critico: {weapon.crit}</div>
                {weapon.pen ? <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Penalidade: {weapon.pen}</div> : null}
              </div>
            ))}
      </ResponsiveGrid>

      {shown.length === 0 ? <div style={{ textAlign: "center", color: C.muted, padding: 20 }}>Nenhum resultado para "{filter}"</div> : null}
    </div>
  );
}

function TabSistema() {
  const [sec, setSec] = useState("dt");
  const sections = [
    { id: "dt", label: "DTs" },
    { id: "conds", label: "Condicoes" },
    { id: "manif", label: "Manifestacoes" },
    { id: "acoes", label: "Acoes" },
    { id: "builder", label: "Builder" },
  ];

  return (
    <div>
      <div className="chip-row" style={{ marginBottom: 8 }}>
        {sections.map((section) => {
          const active = sec === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setSec(section.id)}
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                whiteSpace: "nowrap",
                background: active ? `${C.gold}22` : C.bg2,
                border: `1px solid ${active ? C.gold : C.border}`,
                color: active ? C.gold : C.muted,
                fontSize: 12,
              }}
            >
              {section.label}
            </button>
          );
        })}
      </div>

      {sec === "dt" ? (
        <Sect title="Classes de Dificuldade">
          {DT_TABLE.map((item) => (
            <div key={item.dt} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 700, color: C.mente, width: 28, flexShrink: 0 }}>{item.dt}</div>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{item.grau}</div>
              <div style={{ fontSize: 11, color: C.green, textAlign: "right", flexShrink: 0 }}>auto: {item.auto}</div>
            </div>
          ))}
          <div style={{ marginTop: 10, padding: "8px 10px", background: C.bg3, borderRadius: 6, fontSize: 11, color: C.muted }}>
            <strong style={{ color: C.gold }}>Critico:</strong> melhor dado = 6, confirma rolando novamente vs DT original.<br />
            <strong style={{ color: "#EF4444" }}>Falha critica:</strong> melhor dado = 1 e falha gera complicacao narrativa.<br />
            <strong style={{ color: C.mente }}>Vantagem/Desvantagem:</strong> rola 1 dado extra e descarta o pior ou o melhor.
          </div>
        </Sect>
      ) : null}

      {sec === "conds" ? (
        <ResponsiveGrid minWidth={260}>
          {CONDS.map((condition) => (
            <div key={condition.id} style={{ ...card, background: `${condition.color}11`, borderLeft: `3px solid ${condition.color}` }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: condition.color, marginBottom: 2 }}>{condition.label}</div>
              <div style={{ fontSize: 12, color: C.text }}>{condition.desc}</div>
            </div>
          ))}
          <div style={{ ...card, background: "#6B728011", borderLeft: "3px solid #6B7280" }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: C.muted, marginBottom: 2 }}>Exaustao 1-4</div>
            <div style={{ fontSize: 12, color: C.text }}>1: -1. 2: -2 e PE maximo reduzido. 3: -3 e movimento reduzido. 4: inconsciente, PE zero.</div>
          </div>
        </ResponsiveGrid>
      ) : null}

      {sec === "manif" ? (
        <ResponsiveGrid>
          <Sect title="Tipos por PE Total">
            {[
              { title: "Simples", pe: "1-3 PE", action: "m - Acao Menor" },
              { title: "Avancada", pe: "4-7 PE", action: "Mv - Movimento" },
              { title: "Completa", pe: "8-14 PE", action: "M - Acao Maior" },
              { title: "Extrema", pe: "15+ PE", action: "C - Acao Completa" },
            ].map((item) => (
              <div key={item.title} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: C.alma }}>{item.title}</span>
                <span style={{ color: C.muted }}>{item.pe}</span>
                <span style={{ color: C.text, fontSize: 11 }}>{item.action}</span>
              </div>
            ))}
          </Sect>

          <Sect title="Escala de Dano" className="section-span-2">
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, minWidth: 300 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "4px 5px", color: C.muted, borderBottom: `1px solid ${C.border}`, fontSize: 10 }}>Tier</th>
                    {DMG_COLS.map((column) => (
                      <th key={column} style={{ padding: "4px 3px", color: C.muted, borderBottom: `1px solid ${C.border}`, fontSize: 10, textAlign: "center" }}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DMG_ROWS.map((row, rowIndex) => (
                    <tr key={row.tier} style={{ background: rowIndex % 2 === 0 ? C.bg3 : "transparent" }}>
                      <td style={{ padding: "5px 5px", fontWeight: 600, color: C.alma, fontSize: 11 }}>{row.tier}</td>
                      {row.vals.map((value, valueIndex) => (
                        <td key={valueIndex} style={{ padding: "5px 3px", textAlign: "center", color: valueIndex === row.vals.length - 1 ? C.gold : valueIndex === 0 ? C.muted : C.text, fontWeight: valueIndex === row.vals.length - 1 ? 700 : 400, fontSize: 11 }}>
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 8 }}>Progresso efetivo soma ao resultado final. Amplificacao usa as faixas +0, +1-2, +3-5, +6-9, +10-14 e +15+.</div>
          </Sect>

          <Sect title="Vetor Indireto">
            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>
              Manifestacoes nao agem diretamente sobre seres com Vontade. Cura direta exige efeito indireto como Regenerante, Totem ou alvos sem resistencia ativa.
            </div>
          </Sect>
        </ResponsiveGrid>
      ) : null}

      {sec === "acoes" ? (
        <Sect title="Acoes de Turno">
          {ACOES.map((action) => (
            <div key={action.sym} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontFamily: "Georgia,serif", width: 30, height: 30, background: `${C.gold}22`, border: `1px solid ${C.gold}44`, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.gold, flexShrink: 0 }}>
                {action.sym}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{action.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{action.desc}</div>
              </div>
            </div>
          ))}
        </Sect>
      ) : null}

      {sec === "builder" ? <ManifBuilder /> : null}
    </div>
  );
}

function ManifBuilder() {
  const [selectedElements, setSelectedElements] = useState([]);
  const [selectedForms, setSelectedForms] = useState([]);
  const [selectedProps, setSelectedProps] = useState([]);
  const [amp, setAmp] = useState(0);

  function toggleSelection(setter, item) {
    setter((currentList) => {
      const exists = currentList.some((entry) => entry.name === item.name);
      return exists ? currentList.filter((entry) => entry.name !== item.name) : [...currentList, item];
    });
  }

  const kw = [...selectedElements, ...selectedForms, ...selectedProps].reduce((total, item) => total + item.pe, 0);
  const peTotal = kw + amp;
  const actionMeta = getActionMeta(peTotal);
  const selectedSummary = [...selectedElements, ...selectedForms, ...selectedProps];

  return (
    <Sect title="Builder de Manifestacao" color={C.gold}>
      {[
        { label: "Elementos", data: ELEMENTOS, selected: selectedElements, setSelected: setSelectedElements, color: C.alma },
        { label: "Formas", data: FORMAS, selected: selectedForms, setSelected: setSelectedForms, color: C.mente },
        { label: "Propriedades", data: PROPS, selected: selectedProps, setSelected: setSelectedProps, color: C.gold },
      ].map((group) => (
        <div key={group.label} style={{ marginBottom: 14 }}>
          <Lbl>{group.label}</Lbl>
          <div className="chip-row" style={{ marginTop: 4 }}>
            {group.data.map((item) => {
              const active = group.selected.some((entry) => entry.name === item.name);
              return (
                <button
                  key={item.name}
                  onClick={() => toggleSelection(group.setSelected, item)}
                  style={{
                    padding: "4px 9px",
                    borderRadius: 6,
                    fontSize: 11,
                    background: active ? `${group.color}22` : C.bg3,
                    border: `1px solid ${active ? group.color : C.border}`,
                    color: active ? group.color : C.text,
                  }}
                >
                  {item.name} <span style={{ color: C.gold }}>{item.pe} PE</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ marginBottom: 14 }}>
        <Lbl>Amplificacao extra</Lbl>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <SmBtn onClick={() => setAmp((value) => Math.max(0, value - 1))}>-</SmBtn>
          <span style={{ fontWeight: 700, color: C.gold, width: 24, textAlign: "center" }}>{amp}</span>
          <SmBtn onClick={() => setAmp((value) => value + 1)}>+</SmBtn>
        </div>
      </div>

      <div style={{ ...card, borderColor: actionMeta.color, background: `${actionMeta.color}0D`, padding: 14 }}>
        <div style={{ display: "flex", gap: 14, marginBottom: 10, flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>KW</div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 26, fontWeight: 700, color: C.alma, lineHeight: 1 }}>{kw}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>PE Total</div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 26, fontWeight: 700, color: C.gold, lineHeight: 1 }}>{peTotal}</div>
          </div>
          <div style={{ flex: 1, textAlign: "right", paddingTop: 4 }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>Tipo de Acao</div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 13, fontWeight: 700, color: actionMeta.color }}>{actionMeta.label}</div>
          </div>
        </div>

        {selectedSummary.length ? (
          <div style={{ fontSize: 11, color: C.muted, borderTop: `1px solid ${C.border}`, paddingTop: 8, lineHeight: 1.7 }}>
            {selectedSummary.map((item) => `${item.name} (${item.pe} PE)`).join(" + ")}
            {amp > 0 ? ` + ${amp} Amplif.` : ""}
          </div>
        ) : (
          <div style={{ fontSize: 11, color: C.muted, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>Selecione varios elementos, formas e propriedades para compor a manifestacao.</div>
        )}

        {selectedElements.length ? <div style={{ fontSize: 11, color: C.text, marginTop: 6 }}>Elementos: {selectedElements.map((item) => item.desc).join(" | ")}</div> : null}
        {selectedForms.length ? <div style={{ fontSize: 11, color: C.text, marginTop: 4 }}>Formas: {selectedForms.map((item) => item.desc).join(" | ")}</div> : null}
        {selectedProps.length ? <div style={{ fontSize: 11, color: C.text, marginTop: 4 }}>Props: {selectedProps.map((item) => item.desc).join(" | ")}</div> : null}
      </div>
    </Sect>
  );
}
