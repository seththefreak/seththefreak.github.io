function TabFicha({ char, upd }) {
  const [fichaTab, setFichaTab] = useState("base");
  const levelData = getCurrentLevelData(char.level);

  function setResource(resourceKey, nextValue) {
    const currentLevel = getCurrentLevelData(char.level);
    const maxValue = resourceKey === "sp" ? 100 : currentLevel[resourceKey];
    upd((currentChar) => ({
      ...currentChar,
      [resourceKey]: {
        ...currentChar[resourceKey],
        cur: clampNumber(nextValue, 0, maxValue),
      },
    }));
  }

  function setLevel(nextLevel) {
    const nextData = getCurrentLevelData(nextLevel);
    upd((currentChar) => ({
      ...currentChar,
      level: nextLevel,
      hp: {
        cur: clampNumber(currentChar.hp.cur, 0, nextData.hp),
        max: nextData.hp,
      },
      sp: { cur: 100, max: 100 },
      pe: {
        cur: clampNumber(currentChar.pe.cur, 0, nextData.pe),
        max: nextData.pe,
      },
    }));
  }

  function setSub(subId, field, value) {
    upd((currentChar) => ({
      ...currentChar,
      subs: {
        ...currentChar.subs,
        [subId]: {
          ...currentChar.subs[subId],
          [field]: value,
        },
      },
    }));
  }

  function setPilar(pilarId, value) {
    const minValue = pilarId === "alma" ? 0 : 1;
    upd((currentChar) => ({
      ...currentChar,
      pilares: {
        ...currentChar.pilares,
        [pilarId]: clampNumber(value, minValue, 5),
      },
    }));
  }

  function toggleCondition(conditionId) {
    upd((currentChar) => ({
      ...currentChar,
      condicoes: currentChar.condicoes.includes(conditionId)
        ? currentChar.condicoes.filter((id) => id !== conditionId)
        : [...currentChar.condicoes, conditionId],
    }));
  }

  function setPericia(periciaId, field, value) {
    upd((currentChar) => ({
      ...currentChar,
      pericias: {
        ...currentChar.pericias,
        [periciaId]: {
          ...(currentChar.pericias[periciaId] || { tier: 0, prog: 0 }),
          [field]: value,
        },
      },
    }));
  }

  function addEffect() {
    upd((currentChar) => ({
      ...currentChar,
      effects: [...currentChar.effects, createEmptyEffect()],
    }));
  }

  function updateEffect(effectId, field, value) {
    upd((currentChar) => ({
      ...currentChar,
      effects: currentChar.effects.map((effect) => (
        effect.id !== effectId
          ? effect
          : {
              ...effect,
              [field]: field === "name" || field === "notes" ? value : Number(value) || 0,
            }
      )),
    }));
  }

  function removeEffect(effectId) {
    upd((currentChar) => ({
      ...currentChar,
      effects: currentChar.effects.filter((effect) => effect.id !== effectId),
    }));
  }

  const fichaTabs = [
    { id: "base", label: "Base" },
    { id: "pericias", label: "Pericias" },
    { id: "extras", label: "Extras" },
  ];

  return (
    <div>
      <div className="chip-row" style={{ marginBottom: 10 }}>
        {fichaTabs.map((tabItem) => {
          const active = fichaTab === tabItem.id;
          return (
            <button
              key={tabItem.id}
              onClick={() => setFichaTab(tabItem.id)}
              style={{
                flex: 1,
                padding: "6px 4px",
                borderRadius: 6,
                background: active ? `${C.gold}22` : C.bg2,
                border: `1px solid ${active ? C.gold : C.border}`,
                color: active ? C.gold : C.muted,
                fontSize: 11,
                fontFamily: "Georgia,serif",
                letterSpacing: 1,
                transition: "all 0.15s",
              }}
            >
              {tabItem.label}
            </button>
          );
        })}
      </div>

      {fichaTab === "base" ? (
        <ResponsiveGrid>
          <Sect title="Identidade">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 88px", gap: 8, marginBottom: 8 }}>
              <div>
                <Lbl>Nome</Lbl>
                <input value={char.name} onChange={(event) => upd({ name: event.target.value })} />
              </div>
              <div>
                <Lbl>Nivel</Lbl>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                  <SmBtn onClick={() => setLevel(clampNumber(char.level - 1, 1, LEVELS.length))}>-</SmBtn>
                  <span style={{ fontFamily: "Georgia,serif", fontSize: 20, fontWeight: 700, color: C.gold, width: 28, textAlign: "center" }}>
                    {char.level}
                  </span>
                  <SmBtn onClick={() => setLevel(clampNumber(char.level + 1, 1, LEVELS.length))}>+</SmBtn>
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
              <div>
                <Lbl>Conceito</Lbl>
                <input value={char.concept} onChange={(event) => upd({ concept: event.target.value })} placeholder="Ex: Detetive paranormal" />
              </div>
              <div>
                <Lbl>Marca</Lbl>
                <input value={char.marca} onChange={(event) => upd({ marca: event.target.value })} placeholder="Ex: Veia pulsante" />
              </div>
            </div>
          </Sect>

          <Sect title="Recursos">
            {[
              { key: "hp", label: "HP - Pontos de Vida", color: C.corpo },
              { key: "sp", label: "SP - Sanidade", color: C.mente },
              { key: "pe", label: "PE - Essencia", color: C.alma },
            ].map(({ key, label, color }) => {
              const maxValue = key === "sp" ? 100 : levelData[key];
              const currentValue = char[key].cur;
              const percent = getMeterPercent(currentValue, maxValue);
              return (
                <div key={key} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: "Georgia,serif", fontSize: 11, color, letterSpacing: 1 }}>{label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <SmBtn onClick={() => setResource(key, currentValue - 5)} color={color}>-5</SmBtn>
                      <SmBtn onClick={() => setResource(key, currentValue - 1)} color={color}>-</SmBtn>
                      <span style={{ fontWeight: 700, fontSize: 15, color: percent < 25 ? C.danger : color, minWidth: 48, textAlign: "center" }}>
                        {currentValue}
                        <span style={{ color: C.muted, fontSize: 11, fontWeight: 400 }}>/ {maxValue}</span>
                      </span>
                      <SmBtn onClick={() => setResource(key, currentValue + 1)} color={color}>+</SmBtn>
                      <SmBtn onClick={() => setResource(key, currentValue + 5)} color={color}>+5</SmBtn>
                    </div>
                  </div>
                  <div style={{ height: 6, background: C.bg3, borderRadius: 3 }}>
                    <div style={{ height: 6, width: `${percent}%`, background: color, borderRadius: 3, transition: "width 0.3s" }} />
                  </div>
                  {percent < 25 ? (
                    <div style={{ fontSize: 10, color, marginTop: 2 }}>
                      {key === "hp" ? "Ultimos pontos - penalidade geral." : key === "sp" ? "Quebrado - pressao extra nas rolagens." : "Sem manifestacoes ate recuperar essencia."}
                    </div>
                  ) : null}
                </div>
              );
            })}

            <div>
              <Lbl>Exaustao</Lbl>
              <div className="chip-row" style={{ marginTop: 4 }}>
                {[0, 1, 2, 3, 4].map((value) => (
                  <button
                    key={value}
                    onClick={() => upd({ exaustao: value === char.exaustao && value > 0 ? value - 1 : value })}
                    style={{
                      width: 30,
                      height: 28,
                      borderRadius: 4,
                      background: char.exaustao >= value && value > 0 ? "#6B728033" : C.bg3,
                      border: `1px solid ${char.exaustao >= value && value > 0 ? "#6B7280" : C.border}`,
                      color: char.exaustao >= value && value > 0 ? C.text : C.muted,
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    {value}
                  </button>
                ))}
              </div>
              {char.exaustao > 0 ? (
                <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
                  {`-${char.exaustao} em rolagens`}
                  {char.exaustao >= 3 ? " - movimento reduzido" : ""}
                  {char.exaustao >= 4 ? " - inconsciente" : ""}
                </div>
              ) : null}
            </div>
          </Sect>

          <Sect title="Pilares">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
              {Object.entries(PILARS).map(([pillarId, pillar]) => (
                <div key={pillarId} style={{ ...card, borderColor: `${pillar.color}44`, textAlign: "center", padding: 10 }}>
                  <div style={{ fontFamily: "Georgia,serif", fontSize: 9, color: pillar.color, letterSpacing: 2, marginBottom: 4 }}>{pillar.label}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    <SmBtn onClick={() => setPilar(pillarId, char.pilares[pillarId] - 1)}>-</SmBtn>
                    <span style={{ fontFamily: "Georgia,serif", fontSize: 26, fontWeight: 700, color: pillar.color, lineHeight: 1 }}>
                      {char.pilares[pillarId]}
                    </span>
                    <SmBtn onClick={() => setPilar(pillarId, char.pilares[pillarId] + 1)}>+</SmBtn>
                  </div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{char.pilares[pillarId]}d6</div>
                </div>
              ))}
            </div>
          </Sect>

          <Sect title="Determinacao">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <SmBtn onClick={() => upd({ determinacao: Math.max(0, char.determinacao - 1) })}>-</SmBtn>
              <div className="chip-row">
                {Array.from({ length: Math.max(5, char.determinacao + 1) }).map((_, index) => (
                  <div
                    key={index}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 3,
                      background: index < char.determinacao ? C.gold : C.bg3,
                      border: `1px solid ${index < char.determinacao ? C.gold : C.border}`,
                    }}
                  />
                ))}
              </div>
              <SmBtn onClick={() => upd({ determinacao: char.determinacao + 1 })}>+</SmBtn>
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>
              Cicatriz que virou recurso. Use para marcar impacto narrativo ou superacao em cena.
            </div>
          </Sect>

          <Sect title="Subatributos" className="section-span-2">
            {Object.entries(PILARS).map(([pillarId, pillar]) => (
              <div key={pillarId} style={{ marginBottom: 12 }}>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 10, color: pillar.color, letterSpacing: 2, marginBottom: 6, paddingBottom: 4, borderBottom: `1px solid ${pillar.color}33` }}>
                  {pillar.label}
                </div>
                {pillar.subs.map((subId) => {
                  const subData = char.subs[subId] || { tier: 0, prog: 0 };
                  const autoDt = TIER_DT[subData.tier];
                  return (
                    <div key={subId} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, padding: "6px 8px", background: C.bg3, borderRadius: 6 }}>
                      <div style={{ width: 120, flexShrink: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{SUBS[subId].label}</div>
                        <div style={{ fontSize: 9, color: pillar.color, letterSpacing: 1 }}>
                          {TIERS[subData.tier]}
                          {autoDt ? ` - auto DT${autoDt}` : ""}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 3 }}>
                        {TIERS.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setSub(subId, "tier", index)}
                            title={TIERS[index]}
                            style={{
                              width: 13,
                              height: 13,
                              borderRadius: 2,
                              background: subData.tier >= index ? pillar.color : C.border,
                              border: "none",
                              cursor: "pointer",
                              flexShrink: 0,
                            }}
                          />
                        ))}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 3, marginLeft: "auto" }}>
                        <SmBtn onClick={() => setSub(subId, "prog", Math.max(0, subData.prog - 1))}>-</SmBtn>
                        <span style={{ fontSize: 14, fontWeight: 700, color: pillar.color, width: 24, textAlign: "center" }}>+{subData.prog}</span>
                        <SmBtn onClick={() => setSub(subId, "prog", Math.min(3, subData.prog + 1))}>+</SmBtn>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </Sect>

          <Sect title="Condicoes Ativas" className="section-span-2">
            <div className="chip-row" style={{ marginBottom: char.condicoes.length ? 8 : 0 }}>
              {CONDS.map((condition) => {
                const active = char.condicoes.includes(condition.id);
                return (
                  <button
                    key={condition.id}
                    onClick={() => toggleCondition(condition.id)}
                    style={{
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      background: active ? `${condition.color}22` : C.bg3,
                      color: active ? condition.color : C.muted,
                      border: `1px solid ${active ? condition.color : C.border}`,
                      transition: "all 0.15s",
                    }}
                  >
                    {condition.label}
                  </button>
                );
              })}
            </div>
            {char.condicoes.map((conditionId) => {
              const condition = getConditionById(conditionId);
              return condition ? (
                <div key={conditionId} style={{ fontSize: 11, color: condition.color, padding: "4px 8px", background: `${condition.color}11`, borderRadius: 4, borderLeft: `2px solid ${condition.color}`, marginBottom: 4 }}>
                  <strong>{condition.label}:</strong> {condition.desc}
                </div>
              ) : null;
            })}
          </Sect>
        </ResponsiveGrid>
      ) : null}

      {fichaTab === "pericias" ? <PericiasTab char={char} setPericia={setPericia} /> : null}

      {fichaTab === "extras" ? (
        <ResponsiveGrid>
          <Sect title="Habilidades e Manifestacoes">
            {[
              { key: "habilidades", label: "Habilidades", placeholder: "Resistente, Atirador, Sensitivo, Exorcista..." },
              { key: "manifestacoesDef", label: "Manifestacoes definidas", placeholder: "Centelha: Pyro+Bola 2PE | Escudo: Cryo+Cupula 6PE..." },
              { key: "notas", label: "Notas livres", placeholder: "Anotacoes, ancoras e declaracoes importantes..." },
            ].map((field) => (
              <div key={field.key} style={{ marginBottom: 8 }}>
                <Lbl>{field.label}</Lbl>
                <textarea
                  rows={field.key === "notas" ? 4 : 2}
                  value={char[field.key] || ""}
                  onChange={(event) => upd({ [field.key]: event.target.value })}
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </Sect>

          <Sect title="Habilidades com Efeito" className="section-span-2">
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>
              Cadastre habilidades ou buffs/debuffs que somam em rolagens, dano e iniciativa.
            </div>

            {char.effects.length ? (
              <ResponsiveGrid minWidth={260}>
                {char.effects.map((effect) => (
                  <div key={effect.id} style={{ ...card, background: C.bg3, borderColor: `${C.gold}22` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <Lbl>Nome</Lbl>
                        <input value={effect.name} onChange={(event) => updateEffect(effect.id, "name", event.target.value)} />
                      </div>
                      <button
                        onClick={() => removeEffect(effect.id)}
                        style={{ padding: "6px 8px", borderRadius: 6, background: C.bg2, border: `1px solid ${C.border}`, color: C.muted, alignSelf: "flex-end" }}
                      >
                        Remover
                      </button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))", gap: 8, marginBottom: 8 }}>
                      <div>
                        <Lbl>Rolagem</Lbl>
                        <input type="number" value={effect.roll} onChange={(event) => updateEffect(effect.id, "roll", event.target.value)} />
                      </div>
                      <div>
                        <Lbl>Dano</Lbl>
                        <input type="number" value={effect.damage} onChange={(event) => updateEffect(effect.id, "damage", event.target.value)} />
                      </div>
                      <div>
                        <Lbl>Iniciativa</Lbl>
                        <input type="number" value={effect.initiative} onChange={(event) => updateEffect(effect.id, "initiative", event.target.value)} />
                      </div>
                    </div>
                    <div>
                      <Lbl>Notas</Lbl>
                      <textarea rows={2} value={effect.notes} onChange={(event) => updateEffect(effect.id, "notes", event.target.value)} placeholder="Quando aplicar, restricoes ou observacoes..." />
                    </div>
                  </div>
                ))}
              </ResponsiveGrid>
            ) : (
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>Nenhuma habilidade com efeito cadastrada ainda.</div>
            )}

            <button
              onClick={addEffect}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                background: `${C.gold}22`,
                border: `1px solid ${C.gold}`,
                color: C.gold,
                fontFamily: "Georgia,serif",
                fontWeight: 700,
              }}
            >
              + Nova habilidade com efeito
            </button>
          </Sect>
        </ResponsiveGrid>
      ) : null}
    </div>
  );
}

function PericiasTab({ char, setPericia }) {
  const pillarLabels = { corpo: "CORPO", mente: "MENTE", alma: "ALMA" };

  return (
    <div>
      <div style={{ padding: "8px 10px", background: C.bg3, borderRadius: 6, marginBottom: 10, fontSize: 11, color: C.muted }}>
        Tier avanca com 4 pontos. Cada pericia agora mostra a base sugerida para testes e combinacoes mistas.
      </div>

      <ResponsiveGrid>
        {["corpo", "mente", "alma"].map((pillarId) => {
          const pillarColor = PILARS[pillarId].color;
          const pericias = PERICIAS_LIST.filter((pericia) => pericia.groupPilar === pillarId);
          return (
            <Sect key={pillarId} title={pillarLabels[pillarId]} color={pillarColor}>
              {pericias.map((pericia) => {
                const data = char.pericias[pericia.id] || { tier: 0, prog: 0 };
                const autoDt = TIER_DT[data.tier];
                return (
                  <div key={pericia.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, padding: "6px 8px", background: C.bg3, borderRadius: 6 }}>
                    <div style={{ width: 132, flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{pericia.label}</div>
                      <div style={{ fontSize: 9, color: pillarColor, letterSpacing: 1 }}>
                        {formatPericiaBaseList(pericia)}
                        {autoDt ? ` - auto DT${autoDt}` : ""}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 3 }}>
                      {TIERS.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setPericia(pericia.id, "tier", index)}
                          title={TIERS[index]}
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 2,
                            background: data.tier >= index ? pillarColor : C.border,
                            border: "none",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        />
                      ))}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 3, marginLeft: "auto" }}>
                      <SmBtn onClick={() => setPericia(pericia.id, "prog", Math.max(0, data.prog - 1))}>-</SmBtn>
                      <span style={{ fontSize: 13, fontWeight: 700, color: pillarColor, width: 24, textAlign: "center" }}>+{data.prog}</span>
                      <SmBtn onClick={() => setPericia(pericia.id, "prog", Math.min(3, data.prog + 1))}>+</SmBtn>
                    </div>
                  </div>
                );
              })}
            </Sect>
          );
        })}
      </ResponsiveGrid>
    </div>
  );
}
