const HABILIDADES_ACERVO = [
  {
    cat: "Combate e Físico",
    color: "#EF4444",
    items: [
      { id: "resistente",      label: "Resistente",       desc: "Reduz em 2 pts todo dano físico recebido (mínimo 1)." },
      { id: "letal",           label: "Letal",            desc: "Margem de Ameaça expandida: resultado 5 ou 6 conta como Ameaça." },
      { id: "mestre_armas",    label: "Mestre das Armas", desc: "Proficiência com todas as armas. +1 Prog. Efetivo em testes de crítico." },
      { id: "guerreiro",       label: "Guerreiro",        desc: "Dado de dano extra em ataques CaC com armas pesadas (descarta o menor)." },
      { id: "duelista",        label: "Duelista",         desc: "Ao declarar alvo único por turno: +1 Prog. Efetivo em ataque e defesa contra ele." },
      { id: "atirador",        label: "Atirador",         desc: "+1 Prog. Efetivo em ataques à distância. Ignora cobertura leve." },
      { id: "guardiao",        label: "Guardião",         desc: "+1 Prog. Efetivo em defesa ao proteger aliados. Pode interceptar ataques como Reação." },
      { id: "assassino",       label: "Assassino",        desc: "+1 Prog. Efetivo em ataques surpresa e em Enganação/Disfarce." },
      { id: "combatente_dual", label: "Combatente Dual",  desc: "Reduz penalidade de duas armas para −1. +1 ataque extra com arma secundária." },
      { id: "evasivo",         label: "Evasivo",          desc: "+1 Prog. Efetivo em Esquiva. Nunca sofre dano de área se esquivar com sucesso." },
      { id: "golpe_vital",     label: "Golpe Vital",      desc: "+1 dado de dano em acertos que superam defesa por 2+. Em crítico: efeito adicional." },
    ],
  },
  {
    cat: "Estigma e Manifestação",
    color: "#A78BFA",
    items: [
      { id: "feiticeiro",       label: "Feiticeiro",          desc: "+1 Prog. Efetivo em Domínio. −1 PE em Manifestações Simples e Avançadas." },
      { id: "invocador",        label: "Invocador",           desc: "+1 Prog. Efetivo em Poder ao usar Formas de Invocação. +1 turno de duração." },
      { id: "barreira_mistica", label: "Barreira Mística",    desc: "Manifestações de barreira custam −1 PE. +1 Prog. Efetivo em Afinidade." },
      { id: "necromante",       label: "Necromante",          desc: "+1 Prog. Efetivo em Poder com Umbra/Noctis/Vita. Pode animar mortos (narrativo)." },
      { id: "mestre_chamas",    label: "Mestre das Chamas",   desc: "+1 Prog. Efetivo em ataques com Pyro e derivados. Resistência a fogo." },
      { id: "exorcista",        label: "Exorcista",           desc: "+1 Prog. Efetivo em Domínio e Afinidade vs. entidades. Resistência espiritual." },
      { id: "elementalista",    label: "Elementalista",       desc: "Escolhe 1 Elemento: −1 PE e +1 Prog. Efetivo. (Múltipla aquisição permitida)" },
      { id: "sensitivo",        label: "Sensitivo",           desc: "+1 Prog. Efetivo em detectar Névoa, Estigmas ativos e entidades próximas." },
      { id: "catalisador",      label: "Catalisador",         desc: "Pode emprestar até 5 PE por turno a aliado com Estigma em alcance." },
      { id: "rastreador_almas", label: "Rastreador de Almas", desc: "Detecta rastros de Essência em até 6u. +1 Prog. Efetivo em identificação." },
    ],
  },
  {
    cat: "Mental / Suporte / Utilidade",
    color: "#22D3EE",
    items: [
      { id: "resiliencia_mental",  label: "Resiliência Mental",   desc: "Reduz perda de sanidade em 1 (mínimo 0) por evento." },
      { id: "vontade_indomavel",   label: "Vontade Indomável",    desc: "1× por sessão: re-rola teste mental. Sucesso: recupera 1d4 SP." },
      { id: "sangue_frio",         label: "Sangue Frio",          desc: "+1 Prog. Efetivo em testes de sanidade durante combate ou tensão aguda." },
      { id: "curandeiro",          label: "Curandeiro",           desc: "Dobra a eficácia de cura via Medicina. +10 HP em primeiros socorros." },
      { id: "ladino",              label: "Ladino",               desc: "+1 Prog. Efetivo em Furtividade e Ladinagem simultaneamente." },
      { id: "analista",            label: "Analista",             desc: "+1 Prog. Efetivo em tech humana. Pré-requisito para projetos TEK operacional." },
      { id: "lider_tatico",        label: "Líder Tático",         desc: "Aliados em alcance 3u ganham +1 Prog. Efetivo em iniciativa." },
      { id: "sorte_estranha",      label: "Sorte Estranha",       desc: "1× por sessão: re-rola uma falha crítica." },
      { id: "momento_gloria",      label: "Momento de Glória",    desc: "1× por sessão: transforma uma falha comum em sucesso simples." },
    ],
  },
];

function HabilidadesAcervo({ char, upd }) {
  const [expandedId, setExpandedId] = useState(null);

  const learned = Array.isArray(char.habilidadesAprendidas) ? char.habilidadesAprendidas : [];

  function toggleLearn(id) {
    upd((prev) => {
      const current = Array.isArray(prev.habilidadesAprendidas) ? prev.habilidadesAprendidas : [];
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
      return { ...prev, habilidadesAprendidas: next };
    });
  }

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  const totalLearned = learned.length;

  return (
    <div>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 12, padding: "8px 10px", background: C.bg3, borderRadius: 6 }}>
        Clique em uma habilidade para ver sua descrição. Clique em{" "}
        <span style={{ color: C.gold }}>Aprender</span> para adicioná-la ao personagem.
        {totalLearned > 0 && (
          <span style={{ marginLeft: 8, color: C.gold, fontWeight: 700 }}>
            {totalLearned} {totalLearned === 1 ? "habilidade aprendida" : "habilidades aprendidas"}
          </span>
        )}
      </div>

      {HABILIDADES_ACERVO.map((group) => (
        <div key={group.cat} style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 10,
            fontFamily: FONT_DISPLAY,
            color: group.color,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 8,
            paddingBottom: 4,
            borderBottom: `1px solid ${group.color}33`,
          }}>
            {group.cat}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {group.items.map((item) => {
              const isLearned = learned.includes(item.id);
              const isExpanded = expandedId === item.id;

              return (
                <div key={item.id} style={{
                  borderRadius: 8,
                  border: `1px solid ${isLearned ? group.color + "66" : C.border}`,
                  background: isLearned ? `${group.color}0D` : C.bg3,
                  overflow: "hidden",
                  transition: "all 0.15s",
                }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      cursor: "pointer",
                    }}
                    onClick={() => toggleExpand(item.id)}
                  >
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: isLearned ? group.color : C.border,
                      boxShadow: isLearned ? `0 0 6px ${group.color}88` : "none",
                      transition: "all 0.2s",
                    }} />

                    <span style={{
                      flex: 1,
                      fontSize: 12,
                      fontWeight: isLearned ? 700 : 400,
                      color: isLearned ? group.color : C.text,
                      fontFamily: FONT_DISPLAY,
                    }}>
                      {item.label}
                    </span>

                    <span style={{
                      fontSize: 10,
                      color: C.muted,
                      fontFamily: FONT_SYSTEM,
                      marginRight: 4,
                    }}>
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>

                  {isExpanded && (
                    <div style={{
                      padding: "0 10px 10px 26px",
                      borderTop: `1px solid ${group.color}22`,
                    }}>
                      <div style={{
                        fontSize: 11,
                        color: C.text,
                        lineHeight: 1.6,
                        marginTop: 8,
                        marginBottom: 10,
                        fontFamily: FONT_TEXT,
                      }}>
                        {item.desc}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleLearn(item.id); }}
                        style={{
                          padding: "5px 14px",
                          borderRadius: 999,
                          border: `1px solid ${isLearned ? C.danger : group.color}`,
                          background: isLearned ? `${C.danger}18` : `${group.color}22`,
                          color: isLearned ? C.danger : group.color,
                          fontSize: 11,
                          fontFamily: FONT_DISPLAY,
                          fontWeight: 700,
                          cursor: "pointer",
                          letterSpacing: 0.5,
                        }}
                      >
                        {isLearned ? "Esquecer" : "Aprender"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function TabFicha({ char, upd }) {
  const [fichaTab, setFichaTab] = useState("base");
  const portraitInputRef = useRef(null);
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          <Sect title="Identidade">
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "start", minWidth: 0 }}>
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

              <div style={{ ...card, padding: 8, background: `${C.alma}0D`, borderColor: `${C.alma}33`, textAlign: "center", width: 128, flexShrink: 0 }}>
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
              const maxValue = key === "sp" ? 100 : levelData[key];
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

          <Sect title="Pilares">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8 }}>
              {Object.entries(PILARS).map(([pillarId, pillar]) => (
                <div key={pillarId} style={{ ...card, borderColor: `${pillar.color}44`, textAlign: "center", padding: 8 }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 9, color: pillar.color, letterSpacing: 2, marginBottom: 4 }}>{pillar.label}</div>
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

          <div className="desktop-split section-span-2" style={{ gridColumn: "1 / -1", marginTop: 2 }}>
            <Sect title="Subatributos">
              {Object.entries(PILARS).map(([pillarId, pillar]) => (
                <div key={pillarId} style={{ marginBottom: 10 }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 10, color: pillar.color, letterSpacing: 2, marginBottom: 5, paddingBottom: 3, borderBottom: `1px solid ${pillar.color}33` }}>
                    {pillar.label}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 4 }}>
                  {pillar.subs.map((subId) => {
                    const subData = char.subs[subId] || { tier: 0, prog: 0 };
                    const autoDt = TIER_DT[subData.tier];
                    return (
                      <div key={subId} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px", background: C.bg3, borderRadius: 6 }}>
                        <div style={{ width: 110, flexShrink: 0 }}>
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

      {fichaTab === "pericias" ? <PericiasTab char={char} setPericia={setPericia} /> : null}

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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 4 }}>
              {pericias.map((pericia) => {
                const data = char.pericias[pericia.id] || { tier: 0, prog: 0 };
                const autoDt = TIER_DT[data.tier];
                return (
                  <div key={pericia.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px", background: C.bg3, borderRadius: 6 }}>
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
              </div>
            </Sect>
          );
        })}
      </ResponsiveGrid>
    </div>
  );
}
