/*
 * Audit refactor:
 * - Documents the ERA character-sheet tab as the owner of pillar/attribute editing UI.
 * - Keeps all progression budgets, labels, and derived resource formulas unchanged.
 * - Uses shared touch-target fixes from era-shared.js/style.css.
 * - Adds loadout editing so weapons/styles are part of the companion workflow.
 */

/**
 * Renders and updates the ERA character sheet editor.
 * @param {{char: object, upd: Function}} props
 * @returns {React.ReactElement}
 */
function TabFicha({ char, upd }) {
  const [fichaTab, setFichaTab] = useState("base");
  const isMobile = useIsMobile();
  const portraitInputRef = useRef(null);
  const levelData = getCurrentLevelData(char.level);
  const pillarPointsAvailable = getPillarPointsAvailable(char.level);
  const pillarPointsUsed = getPillarPointsUsed(char.pilares);

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
      sp: { cur: clampNumber(currentChar.sp.cur, 0, nextData.sp), max: nextData.sp },
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

  function adjustSubProgress(subId, delta) {
    upd((currentChar) => ({
      ...currentChar,
      subs: {
        ...currentChar.subs,
        [subId]: shiftProgressEntry(currentChar.subs[subId], delta),
      },
    }));
  }

  function setPilar(pilarId, value) {
    upd((currentChar) => ({
      ...currentChar,
      pilares: (() => {
        const minValue = getPillarBaseValue(pilarId);
        const currentValue = Number(currentChar.pilares[pilarId]) || minValue;
        const nextValue = clampNumber(value, minValue, 5);
        const nextPillars = { ...currentChar.pilares, [pilarId]: nextValue };
        const overBudget = getPillarPointsUsed(nextPillars) > getPillarPointsAvailable(currentChar.level);
        return overBudget && nextValue > currentValue ? currentChar.pilares : nextPillars;
      })(),
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

  function adjustPericiaProgress(periciaId, delta) {
    upd((currentChar) => ({
      ...currentChar,
      pericias: {
        ...currentChar.pericias,
        [periciaId]: shiftProgressEntry(currentChar.pericias[periciaId], delta),
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

  function addEffectPreset(preset) {
    upd((currentChar) => ({
      ...currentChar,
      effects: [
        ...currentChar.effects,
        normalizeEffect({ ...preset, id: createId("fx") }),
      ],
    }));
  }

  function addManifestationExample(example) {
    const line = `${example.name}: ${example.summary} | ${example.keywords} keywords | KW ${example.kw} | amp +${example.amp}`;
    upd((currentChar) => ({
      ...currentChar,
      manifestacoesDef: currentChar.manifestacoesDef ? `${currentChar.manifestacoesDef}\n${line}` : line,
    }));
  }

  function setLoadout(nextPatch) {
    upd((currentChar) => ({
      ...currentChar,
      loadout: normalizeLoadout({
        ...(currentChar.loadout || {}),
        ...nextPatch,
      }),
    }));
  }

  function triggerPortraitPicker() {
    if (portraitInputRef.current) {
      portraitInputRef.current.click();
    }
  }

  function handlePortraitChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      upd({ avatar: String(reader.result || "") });
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  const fichaTabs = [
    { id: "base", label: "Base" },
    { id: "pericias", label: "Pericias" },
    { id: "arsenal", label: "Arsenal" },
    { id: "extras", label: "Extras" },
  ];

  return (
    <div style={{ width: "100%" }}>
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
                fontFamily: FONT_DISPLAY,
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
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 14 }}>
          <Sect title="Identidade">
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto", gap: 10, alignItems: "start", minWidth: 0 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 8, marginBottom: 8 }}>
                  <div>
                    <Lbl>Nome</Lbl>
                    <input value={char.name} onChange={(event) => upd({ name: event.target.value })} />
                  </div>
                  <div>
                    <Lbl>Nivel</Lbl>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                      <SmBtn onClick={() => setLevel(clampNumber(char.level - 1, 1, LEVELS.length))}>-</SmBtn>
                      <span style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, color: C.gold, width: 28, textAlign: "center" }}>
                        {char.level}
                      </span>
                      <SmBtn onClick={() => setLevel(clampNumber(char.level + 1, 1, LEVELS.length))}>+</SmBtn>
                    </div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
                  <div>
                    <Lbl>Conceito</Lbl>
                    <input value={char.concept} onChange={(event) => upd({ concept: event.target.value })} placeholder="Ex: Detetive paranormal" />
                  </div>
                  <div>
                    <Lbl>Marca</Lbl>
                    <input value={char.marca} onChange={(event) => upd({ marca: event.target.value })} placeholder="Ex: Veia pulsante" />
                  </div>
                </div>
              </div>

              <div style={{ ...card, padding: 8, background: `${C.alma}0D`, borderColor: `${C.alma}33`, textAlign: "center", width: isMobile ? "100%" : 128, flexShrink: 0 }}>
                <Lbl>Retrato</Lbl>
                <div
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: 14,
                    margin: "4px auto 8px",
                    overflow: "hidden",
                    border: `1px solid ${C.border}`,
                    background: char.avatar ? C.bg2 : `radial-gradient(circle at 30% 30%, ${C.alma}33, transparent 70%), ${C.bg3}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {char.avatar ? (
                    <img src={char.avatar} alt="Retrato do personagem" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 28, color: C.almaLight }}>{(char.name || "?").slice(0, 1).toUpperCase()}</div>
                  )}
                </div>
                <input ref={portraitInputRef} type="file" accept="image/*" onChange={handlePortraitChange} style={{ display: "none" }} />
                <div className="chip-row" style={{ justifyContent: "center" }}>
                  <button onClick={triggerPortraitPicker} style={{ padding: "6px 10px", borderRadius: 999, background: `${C.mente}18`, border: `1px solid ${C.mente}`, color: C.mente, fontSize: 11 }}>
                    Enviar imagem
                  </button>
                  {char.avatar ? (
                    <button onClick={() => upd({ avatar: "" })} style={{ padding: "6px 10px", borderRadius: 999, background: `${C.corpo}16`, border: `1px solid ${C.corpo}`, color: C.corpo, fontSize: 11 }}>
                      Remover
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </Sect>

          <Sect title="Recursos">
            {[
              { key: "hp", abbr: "HP", sublabel: "Pontos de Vida", color: C.corpo },
              { key: "sp", abbr: "SP", sublabel: "Sanidade",       color: C.mente },
              { key: "pe", abbr: "PE", sublabel: "Essencia",       color: C.alma  },
            ].map(({ key, abbr, sublabel, color }) => {
              const maxValue = levelData[key];
              const currentValue = char[key].cur;
              const percent = getMeterPercent(currentValue, maxValue);
              return (
                <div key={key} style={{ marginBottom: 10 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <div style={{ minWidth: 36 }}>
                      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 700, color, letterSpacing: 1, lineHeight: 1 }}>{abbr}</div>
                      <div style={{ fontSize: 9, color: C.muted, letterSpacing: 0.5, whiteSpace: "nowrap" }}>{sublabel}</div>
                    </div>
                    <div />
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <SmBtn onClick={() => setResource(key, currentValue - 5)} color={color}>-5</SmBtn>
                      <SmBtn onClick={() => setResource(key, currentValue - 1)} color={color}>-</SmBtn>
                      <span style={{ fontWeight: 700, fontSize: 15, color: percent < 25 ? C.danger : color, minWidth: 52, textAlign: "center" }}>
                        {currentValue}<span style={{ color: C.muted, fontSize: 10, fontWeight: 400 }}>/{maxValue}</span>
                      </span>
                      <SmBtn onClick={() => setResource(key, currentValue + 1)} color={color}>+</SmBtn>
                      <SmBtn onClick={() => setResource(key, currentValue + 5)} color={color}>+5</SmBtn>
                    </div>
                  </div>
                  <div style={{ height: 5, background: C.bg3, borderRadius: 3 }}>
                    <div style={{ height: 5, width: `${percent}%`, background: color, borderRadius: 3, transition: "width 0.3s" }} />
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

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Sect title="Pilares">
              <div style={{ fontSize: 11, color: pillarPointsUsed > pillarPointsAvailable ? C.danger : C.muted, marginBottom: 8 }}>
                Base PH 1 / MD 1 / SL 0. Pontos de Pilar: {pillarPointsUsed}/{pillarPointsAvailable}. Niveis impares apos o 1 concedem +1.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(3, 1fr)", gap: 8 }}>
                {Object.entries(PILARS).map(([pillarId, pillar]) => (
                  <div key={pillarId} style={{ ...card, borderColor: `${pillar.color}44`, textAlign: "center", padding: 8 }}>
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 9, color: pillar.color, letterSpacing: 2, marginBottom: 4 }}>{pillar.abbr} · {pillar.label}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                      <SmBtn onClick={() => setPilar(pillarId, char.pilares[pillarId] - 1)}>-</SmBtn>
                      <span style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: pillar.color, lineHeight: 1 }}>
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
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
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
          </div>

          <div className="desktop-split section-span-2" style={{ gridColumn: "1 / -1", marginTop: 2 }}>
            <Sect title="Atributos">
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>
                Cada nivel concede +2 pontos livres de Atributo. Cada ponto investido em um Pilar concede +3 pontos para a arvore daquele Pilar.
              </div>
              {Object.entries(PILARS).map(([pillarId, pillar]) => (
                <div key={pillarId} style={{ marginBottom: 10 }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 10, color: pillar.color, letterSpacing: 2, marginBottom: 5, paddingBottom: 3, borderBottom: `1px solid ${pillar.color}33` }}>
                    {pillar.label}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 4 }}>
                  {pillar.subs.map((subId) => {
                    const subData = char.subs[subId] || { tier: 0, prog: 0 };
                    return (
                      <div key={subId} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px", background: C.bg3, borderRadius: 6 }}>
                        <div style={{ width: 110, flexShrink: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{SUBS[subId].abbr} · {SUBS[subId].label}</div>
                          <div style={{ fontSize: 9, color: pillar.color, letterSpacing: 1 }}>
                            {formatApt(subData.tier, subData.prog)}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 3 }}>
                          {TIERS.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setSub(subId, "tier", index)}
                              title={`${APT_SYMBOLS[index]} ${TIERS[index]}`}
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
                          <SmBtn onClick={() => adjustSubProgress(subId, -1)}>-</SmBtn>
                          <span style={{ fontSize: 14, fontWeight: 700, color: pillar.color, width: 24, textAlign: "center" }}>+{subData.prog}</span>
                          <SmBtn onClick={() => adjustSubProgress(subId, 1)}>+</SmBtn>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>
              ))}
            </Sect>

            <Sect title="Condicoes Ativas">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 5, marginBottom: char.condicoes.length ? 8 : 0 }}>
                {CONDS.map((condition) => {
                  const active = char.condicoes.includes(condition.id);
                  return (
                    <button
                      key={condition.id}
                      onClick={() => toggleCondition(condition.id)}
                      style={{
                        padding: "5px 8px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        background: active ? `${condition.color}22` : C.bg3,
                        color: active ? condition.color : C.muted,
                        border: `1px solid ${active ? condition.color : C.border}`,
                        transition: "all 0.15s",
                        textAlign: "left",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {condition.label}
                    </button>
                  );
                })}
              </div>
              {char.condicoes.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {char.condicoes.map((conditionId) => {
                    const condition = getConditionById(conditionId);
                    return condition ? (
                      <div key={conditionId} style={{ fontSize: 10, color: condition.color, padding: "3px 8px", background: `${condition.color}11`, borderRadius: 4, borderLeft: `2px solid ${condition.color}` }}>
                        <strong>{condition.label}:</strong> {condition.desc}
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </Sect>
          </div>
        </div>
      ) : null}

      {fichaTab === "pericias" ? <PericiasTab char={char} setPericia={setPericia} adjustPericiaProgress={adjustPericiaProgress} /> : null}
      {fichaTab === "arsenal" ? <FichaLoadoutTab char={char} setLoadout={setLoadout} /> : null}

      {fichaTab === "extras" ? (
        <ResponsiveGrid>
          <Sect title="Habilidades">
            <HabilidadesAcervo char={char} upd={upd} />
          </Sect>

          <Sect title="Manifestacoes e Notas">
            {[
              { key: "manifestacoesDef", label: "Manifestacoes definidas", placeholder: "Centelha: Lux+Bola | 2 keywords | KW 2 | amp +0" },
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

          <Sect title="Presets e Exemplos">
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>
              Adicione habilidades pre-definidas como Progresso Efetivo ou injete exemplos de manifestacao na ficha atual.
            </div>

            <div style={{ marginBottom: 12 }}>
              <Lbl>Habilidades pre-definidas</Lbl>
              <div className="chip-row" style={{ marginTop: 4 }}>
                {EFFECT_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => addEffectPreset(preset)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: `${C.gold}18`,
                      border: `1px solid ${C.gold}55`,
                      color: C.goldGlow,
                      fontSize: 11,
                    }}
                  >
                    + {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Lbl>Exemplos de manifestacao</Lbl>
              <div className="chip-row" style={{ marginTop: 4 }}>
                {MANIFESTATION_EXAMPLES.map((example) => (
                  <button
                    key={example.name}
                    onClick={() => addManifestationExample(example)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: `${C.alma}18`,
                      border: `1px solid ${C.alma}55`,
                      color: C.almaLight,
                      fontSize: 11,
                    }}
                  >
                    + {example.name}
                  </button>
                ))}
              </div>
            </div>
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
                fontFamily: FONT_DISPLAY,
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

function FichaLoadoutTab({ char, setLoadout }) {
  const loadout = normalizeLoadout(char.loadout);
  const weapon = getWeaponByName(loadout.weaponName);
  const gripOptions = weapon ? getWeaponGripOptions(weapon) : [];
  const criticalOptions = weapon ? getWeaponCriticalOptions(weapon) : [];
  const styleNames = weapon ? getWeaponStyleNames(weapon.name) : [];
  const styleDetail = weapon ? getStyleDetail(weapon.name, loadout.styleName) : null;
  const weaponCats = [
    { id: "cacl", label: "CaC Leve" },
    { id: "cacm", label: "CaC Media" },
    { id: "cacp", label: "CaC Pesada" },
    { id: "dist", label: "Distancia" },
  ];

  function updateWeapon(weaponName) {
    setLoadout({ weaponName, gripId: "", styleName: "", criticalId: "" });
  }

  return (
    <div className="desktop-split">
      <Sect title="Arma Equipada" color={C.corpo}>
        <Lbl>Escolha da ficha</Lbl>
        <select value={loadout.weaponName} onChange={(event) => updateWeapon(event.target.value)} style={{ marginBottom: 10 }}>
          <option value="">Sem arma equipada</option>
          {weaponCats.map((cat) => (
            <optgroup key={cat.id} label={cat.label}>
              {WEAPONS.filter((item) => item.cat === cat.id).map((item) => (
                <option key={item.name} value={item.name}>{item.name} - {item.dmg}</option>
              ))}
            </optgroup>
          ))}
        </select>

        {weapon ? (
          <div style={{ ...card, background: `${C.corpo}0D`, borderColor: `${C.corpo}33` }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 10, color: C.muted }}>Dano base</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: C.corpo, fontWeight: 700 }}>{weapon.dmg}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.muted }}>Tipo</div>
                <div style={{ fontSize: 12, color: C.text }}>{weapon.type}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.muted }}>Acao</div>
                <div style={{ fontSize: 12, color: C.gold }}>{weapon.act}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.muted }}>Alcance</div>
                <div style={{ fontSize: 12, color: C.text }}>{weapon.range || "CaC"}</div>
              </div>
            </div>

            <Lbl>Empunhadura ativa</Lbl>
            <div className="chip-row" style={{ marginBottom: 10 }}>
              {gripOptions.map((option) => {
                const active = loadout.gripId === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setLoadout({ gripId: option.id })}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 999,
                      background: active ? `${C.corpo}22` : C.bg3,
                      border: `1px solid ${active ? C.corpo : C.border}`,
                      color: active ? C.corpo : C.text,
                      fontSize: 11,
                    }}
                  >
                    {option.gripLabel} <span style={{ color: active ? C.corpo : C.muted }}>{option.formula}</span>
                  </button>
                );
              })}
            </div>

            <Lbl>Critico ativo</Lbl>
            <div className="chip-row">
              {criticalOptions.map((option) => {
                const active = loadout.criticalId === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setLoadout({ criticalId: option.id })}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 999,
                      background: active ? `${C.gold}18` : C.bg3,
                      border: `1px solid ${active ? C.gold : C.border}`,
                      color: active ? C.gold : C.text,
                      fontSize: 11,
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 11, color: C.muted }}>Escolha uma arma para o companion usar no dano de combate.</div>
        )}
      </Sect>

      <Sect title="Estilo Ativo" color={C.gold}>
        {weapon && styleNames.length ? (
          <>
            <Lbl>Estilo da arma</Lbl>
            <div className="chip-row" style={{ marginBottom: 12 }}>
              {styleNames.map((styleName) => {
                const active = loadout.styleName === styleName;
                return (
                  <button
                    key={styleName}
                    onClick={() => setLoadout({ styleName })}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: active ? `${C.gold}20` : C.bg3,
                      border: `1px solid ${active ? C.gold : C.border}`,
                      color: active ? C.gold : C.text,
                      fontSize: 11,
                    }}
                  >
                    {styleName}
                  </button>
                );
              })}
            </div>

            {styleDetail ? (
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ ...card, background: `${C.gold}0D`, borderColor: `${C.gold}33` }}>
                  <div style={{ fontWeight: 700, color: C.gold, marginBottom: 4 }}>{styleDetail.style}</div>
                  <div style={{ fontSize: 11, color: C.text, lineHeight: 1.5 }}>{styleDetail.summary}</div>
                  {styleDetail.requirements ? <div style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>{styleDetail.requirements}</div> : null}
                </div>
                {styleDetail.levels.map((level) => (
                  <details key={level.tier} open={level.tier === 1} style={{ ...card, background: C.bg3 }}>
                    <summary style={{ cursor: "pointer", color: C.gold, fontWeight: 700, fontSize: 12 }}>Afinidade {level.tier}</summary>
                    <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                      {level.entries.map((entry) => (
                        <div key={`${level.tier}-${entry.name}`} style={{ borderLeft: `2px solid ${C.gold}`, paddingLeft: 8 }}>
                          <div style={{ fontSize: 11, color: C.text, fontWeight: 700 }}>{entry.name} <span style={{ color: C.muted }}>({entry.action})</span></div>
                          <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.45 }}>{entry.effect}</div>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 11, color: C.muted }}>Este estilo ainda nao tem tecnicas detalhadas no companion.</div>
            )}
          </>
        ) : (
          <div style={{ fontSize: 11, color: C.muted }}>Escolha uma arma com estilos mapeados para ativar tecnicas aqui.</div>
        )}
      </Sect>
    </div>
  );
}

function PericiasTab({ char, setPericia, adjustPericiaProgress }) {
  return (
    <div>
      <div style={{ padding: "8px 10px", background: C.bg3, borderRadius: 6, marginBottom: 10, fontSize: 11, color: C.muted }}>
        PGI vai de +0 a +3. Ao passar de +3, volta para +0 e sobe o APT. Nivel 1 concede 11 pontos de pericia; niveis seguintes concedem +3.
      </div>

      <ResponsiveGrid>
        {PERICIA_GROUPS.map((group) => {
          const pericias = PERICIAS_LIST.filter((pericia) => pericia.category === group.id);
          return (
            <Sect key={group.id} title={group.label} color={group.color}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 4 }}>
              {pericias.map((pericia) => {
                const data = char.pericias[pericia.id] || { tier: 0, prog: 0 };
                const pillarColor = PILARS[pericia.groupPilar].color;
                return (
                  <div key={pericia.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px", background: C.bg3, borderRadius: 6 }}>
                    <div style={{ width: 132, flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{pericia.label}</div>
                      <div style={{ fontSize: 9, color: pillarColor, letterSpacing: 1 }}>
                        {formatPericiaBaseList(pericia)}
                      </div>
                      <div style={{ fontSize: 9, color: group.color, letterSpacing: 1 }}>{formatApt(data.tier, data.prog)}</div>
                    </div>

                    <div style={{ display: "flex", gap: 3 }}>
                      {TIERS.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setPericia(pericia.id, "tier", index)}
                          title={`${APT_SYMBOLS[index]} ${TIERS[index]}`}
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 2,
                            background: data.tier >= index ? group.color : C.border,
                            border: "none",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        />
                      ))}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 3, marginLeft: "auto" }}>
                      <SmBtn onClick={() => adjustPericiaProgress(pericia.id, -1)}>-</SmBtn>
                      <span style={{ fontSize: 13, fontWeight: 700, color: group.color, width: 24, textAlign: "center" }}>+{data.prog}</span>
                      <SmBtn onClick={() => adjustPericiaProgress(pericia.id, 1)}>+</SmBtn>
                    </div>
                  </div>
                );
              })}
              </div>
            </Sect>
          );
        })}
      </ResponsiveGrid>
    </div>
  );
}
