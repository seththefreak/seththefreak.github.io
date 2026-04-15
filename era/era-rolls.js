function TabDados({ char }) {
  const [mode, setMode] = useState("sub");
  const [selP, setSelP] = useState("corpo");
  const [selS, setSelS] = useState("forca");
  const [selPericia, setSelPericia] = useState("golpe");
  const [selPericiaBase, setSelPericiaBase] = useState(null);
  const [selectedEffects, setSelectedEffects] = useState([]);
  const [ef, setEf] = useState(0);
  const [dt, setDt] = useState(5);
  const [rolling, setRolling] = useState(false);
  const [res, setRes] = useState(null);
  const [hist, setHist] = useState([]);
  const [pendingThreat, setPendingThreat] = useState(null);
  const [threatCheck, setThreatCheck] = useState(null);

  useEffect(() => {
    setSelS(PILARS[selP].subs[0]);
  }, [selP]);

  useEffect(() => {
    const bases = getPericiaBases(getPericiaById(selPericia));
    setSelPericiaBase((currentBase) => (
      bases.some((base) => base.id === currentBase) ? currentBase : (bases[0] ? bases[0].id : null)
    ));
  }, [selPericia]);

  function toggleEffect(effectId) {
    setSelectedEffects((current) => (
      current.includes(effectId) ? current.filter((id) => id !== effectId) : [...current, effectId]
    ));
  }

  function buildRollConfig() {
    if (mode === "sub") {
      const subData = char.subs[selS] || { tier: 0, prog: 0 };
      return {
        nd: char.pilares[selP] || 1,
        prog: subData.prog,
        tier: subData.tier,
        label: SUBS[selS].label,
        pilarColor: PILARS[selP].color,
        pilarLabel: PILARS[selP].label,
        baseLabel: SUBS[selS].label,
      };
    }

    const pericia = getPericiaById(selPericia);
    const bases = getPericiaBases(pericia);
    const activeBase = bases.find((base) => base.id === selPericiaBase) || bases[0];
    const periciaData = char.pericias[pericia.id] || { tier: 0, prog: 0 };

    return {
      nd: char.pilares[activeBase.pillar] || 1,
      prog: periciaData.prog,
      tier: periciaData.tier,
      label: pericia.label,
      pilarColor: activeBase.color,
      pilarLabel: PILARS[activeBase.pillar].label,
      baseLabel: activeBase.label,
    };
  }

  function createRollResult(config, targetDt, modifiers = null) {
    const dice = rollN(config.nd, 6);
    const highestDie = best(dice);
    const exaustionMod = modifiers ? modifiers.exaustionMod : -char.exaustao;
    const effectBonus = modifiers ? modifiers.effectBonus : sumSelectedEffectValue(char.effects, selectedEffects, "roll");
    const effectiveEf = modifiers ? modifiers.ef : ef;
    const total = highestDie + config.prog + effectiveEf + effectBonus + exaustionMod;
    const autoDt = TIER_DT[config.tier];
    const auto = autoDt && targetDt <= autoDt;
    const success = auto || total >= targetDt;

    return {
      dice,
      highestDie,
      total,
      dt: targetDt,
      success,
      auto,
      threat: highestDie === 6 && !auto,
      critfail: highestDie === 1 && !success,
      label: config.label,
      pilarColor: config.pilarColor,
      tier: TIERS[config.tier],
      prog: config.prog,
      ef: effectiveEf,
      effectBonus,
      exaustionMod,
      baseLabel: config.baseLabel,
      t: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };
  }

  function roll() {
    setRolling(true);
    setTimeout(() => {
      const config = buildRollConfig();
      const result = createRollResult(config, dt);
      setRes(result);
      setHist((current) => [result, ...current].slice(0, 8));
      setPendingThreat(result.threat ? {
        config,
        originalResult: result,
        modifiers: {
          ef: result.ef,
          effectBonus: result.effectBonus,
          exaustionMod: result.exaustionMod,
        },
      } : null);
      setThreatCheck(null);
      setRolling(false);
    }, 350);
  }

  function confirmThreat() {
    if (!pendingThreat) return;

    setRolling(true);
    setTimeout(() => {
      const confirmation = createRollResult(pendingThreat.config, pendingThreat.originalResult.dt, pendingThreat.modifiers);
      const confirmed = confirmation.auto || confirmation.success;
      const threatResult = {
        originalResult: pendingThreat.originalResult,
        confirmation,
        confirmed,
      };

      setThreatCheck(threatResult);
      setHist((current) => [confirmation, ...current].slice(0, 8));
      setPendingThreat(null);
      setRolling(false);
    }, 350);
  }

  const cfg = buildRollConfig();
  const autoDt = TIER_DT[cfg.tier];
  const autoNow = autoDt && dt <= autoDt;
  const selectedPericia = getPericiaById(selPericia);
  const periciaBases = getPericiaBases(selectedPericia);
  const rollEffectBonus = sumSelectedEffectValue(char.effects, selectedEffects, "roll");

  return (
    <div className="desktop-split">
      <Sect title="Configurar Rolagem" color={C.gold}>
        <div className="chip-row" style={{ marginBottom: 12 }}>
          {[
            { id: "sub", label: "Subatributo" },
            { id: "pericia", label: "Pericia" },
          ].map((option) => {
            const active = mode === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setMode(option.id)}
                style={{
                  flex: 1,
                  padding: "6px 4px",
                  borderRadius: 6,
                  background: active ? `${C.gold}22` : C.bg3,
                  border: `1px solid ${active ? C.gold : C.border}`,
                  color: active ? C.gold : C.muted,
                  fontSize: 12,
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {mode === "sub" ? (
          <div>
            <Lbl>Pilar</Lbl>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))", gap: 6, marginBottom: 12 }}>
              {Object.entries(PILARS).map(([pillarId, pillar]) => {
                const active = selP === pillarId;
                return (
                  <button
                    key={pillarId}
                    onClick={() => setSelP(pillarId)}
                    style={{
                      padding: "8px 4px",
                      borderRadius: 6,
                      background: active ? `${pillar.color}22` : C.bg3,
                      border: `1px solid ${active ? pillar.color : C.border}`,
                      color: active ? pillar.color : C.muted,
                      fontFamily: FONT_DISPLAY,
                      fontSize: 11,
                      letterSpacing: 1,
                    }}
                  >
                    {pillar.label}
                    <br />
                    <span style={{ fontSize: 18, fontWeight: 700 }}>{char.pilares[pillarId]}</span>
                    <span style={{ fontSize: 10 }}>d6</span>
                  </button>
                );
              })}
            </div>

            <Lbl>Subatributo</Lbl>
            <div className="chip-row" style={{ marginBottom: 12 }}>
              {PILARS[selP].subs.map((subId) => {
                const active = selS === subId;
                const subColor = PILARS[selP].color;
                const subProg = (char.subs[subId] || { prog: 0 }).prog;
                return (
                  <button
                    key={subId}
                    onClick={() => setSelS(subId)}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 5,
                      background: active ? `${subColor}22` : C.bg3,
                      border: `1px solid ${active ? subColor : C.border}`,
                      color: active ? subColor : C.text,
                      fontSize: 12,
                    }}
                  >
                    {SUBS[subId].label}
                    <span style={{ color: subColor, fontWeight: 700, marginLeft: 6 }}>+{subProg}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <Lbl>Pericia</Lbl>
            <div className="chip-row" style={{ marginBottom: 12 }}>
              {PERICIAS_LIST.map((pericia) => {
                const periciaData = char.pericias[pericia.id] || { tier: 0, prog: 0 };
                const active = selPericia === pericia.id;
                const pillarColor = PILARS[pericia.groupPilar].color;
                return (
                  <button
                    key={pericia.id}
                    onClick={() => setSelPericia(pericia.id)}
                    style={{
                      padding: "5px 9px",
                      borderRadius: 6,
                      background: active ? `${pillarColor}22` : C.bg3,
                      border: `1px solid ${active ? pillarColor : C.border}`,
                      color: active ? pillarColor : C.text,
                      fontSize: 11,
                    }}
                  >
                    <div>{pericia.label}</div>
                    <div style={{ fontSize: 9, color: active ? pillarColor : C.muted }}>
                      {formatPericiaBaseList(pericia)}
                      {periciaData.prog ? ` | +${periciaData.prog}` : ""}
                    </div>
                  </button>
                );
              })}
            </div>

            {periciaBases.length > 1 ? (
              <div style={{ marginBottom: 12 }}>
                <Lbl>Base da Pericia</Lbl>
                <div className="chip-row">
                  {periciaBases.map((base) => {
                    const active = selPericiaBase === base.id;
                    return (
                      <button
                        key={base.id}
                        onClick={() => setSelPericiaBase(base.id)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 999,
                          background: active ? `${base.color}22` : C.bg3,
                          border: `1px solid ${active ? base.color : C.border}`,
                          color: active ? base.color : C.text,
                          fontSize: 11,
                        }}
                      >
                        {base.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 12 }}>
          <div>
            <Lbl>Prog. Efetivo</Lbl>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <SmBtn onClick={() => setEf((value) => value - 1)}>-</SmBtn>
              <span style={{ fontWeight: 700, fontSize: 16, color: C.gold, width: 32, textAlign: "center" }}>{formatSigned(ef)}</span>
              <SmBtn onClick={() => setEf((value) => value + 1)}>+</SmBtn>
            </div>
          </div>
          <div>
            <Lbl>DT Alvo</Lbl>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <SmBtn onClick={() => setDt((value) => clampNumber(value - 1, 1, 9))}>-</SmBtn>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 16, color: C.mente, width: 20, textAlign: "center" }}>{dt}</span>
              <SmBtn onClick={() => setDt((value) => clampNumber(value + 1, 1, 9))}>+</SmBtn>
            </div>
          </div>
        </div>

        <EffectToggleGroup
          effects={char.effects}
          selectedIds={selectedEffects}
          onToggle={toggleEffect}
          fields={["roll"]}
          title="Habilidades ativas para rolagem"
          color={C.gold}
        />

        <div style={{ padding: "8px 10px", background: C.bg3, borderRadius: 6, fontSize: 12, marginBottom: 10, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <span style={{ color: cfg.pilarColor }}>{cfg.nd}d6</span>
          <span style={{ color: C.muted }}>+</span>
          <span style={{ color: cfg.pilarColor }}>
            {cfg.prog} ({cfg.label})
          </span>
          <span style={{ color: C.muted }}>via</span>
          <span style={{ color: cfg.pilarColor }}>{cfg.baseLabel}</span>
          {ef !== 0 ? (
            <>
              <span style={{ color: C.muted }}>+</span>
              <span style={{ color: C.gold }}>{formatSigned(ef)} ef</span>
            </>
          ) : null}
          {rollEffectBonus !== 0 ? (
            <>
              <span style={{ color: C.muted }}>+</span>
              <span style={{ color: C.green }}>{formatSigned(rollEffectBonus)} efeitos</span>
            </>
          ) : null}
          {char.exaustao > 0 ? (
            <>
              <span style={{ color: C.muted }}>+</span>
              <span style={{ color: C.danger }}>{`-${char.exaustao}`} exaustao</span>
            </>
          ) : null}
          <span style={{ color: C.muted }}>vs</span>
          <span style={{ color: autoNow ? C.green : C.mente, fontWeight: 700 }}>
            DT {dt}
            {autoNow ? " auto" : ""}
          </span>
        </div>

        <button
          onClick={roll}
          disabled={rolling}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 8,
            background: rolling ? C.bg3 : `${C.gold}22`,
            border: `2px solid ${rolling ? C.border : C.gold}`,
            color: rolling ? C.muted : C.gold,
            fontFamily: FONT_DISPLAY,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          {rolling ? "..." : "ROLAR"}
        </button>
      </Sect>

      <div>
        <Sect title="Resultado" color={res ? (res.success ? C.green : C.danger) : C.muted}>
          {res ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, color: res.auto ? C.goldGlow : res.threat ? C.gold : res.success ? C.green : C.danger, fontWeight: 700, letterSpacing: 1 }}>
                  {res.auto ? "AUTO-SUCESSO" : res.threat ? "AMEACA" : res.success ? "SUCESSO" : res.critfail ? "FALHA CRITICA" : "FALHA"}
                </div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 700, color: res.success ? C.green : C.danger, lineHeight: 1 }}>
                  {res.total}
                </div>
              </div>

              <div className="chip-row" style={{ marginBottom: 8 }}>
                {res.dice.map((die, index) => (
                  <div
                    key={index}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 6,
                      background: die === res.highestDie ? `${C.gold}33` : C.bg3,
                      border: `1px solid ${die === res.highestDie ? C.gold : C.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      color: die === res.highestDie ? C.gold : C.muted,
                      fontSize: 15,
                      fontFamily: FONT_DISPLAY,
                    }}
                  >
                    {die}
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 11, color: C.muted }}>
                melhor: <strong style={{ color: C.text }}>{res.highestDie}</strong> + {res.label} <strong style={{ color: res.pilarColor }}>+{res.prog}</strong>
                {res.ef !== 0 ? <> ef <strong style={{ color: C.gold }}>{formatSigned(res.ef)}</strong></> : null}
                {res.effectBonus !== 0 ? <> efeitos <strong style={{ color: C.green }}>{formatSigned(res.effectBonus)}</strong></> : null}
                {res.exaustionMod !== 0 ? <> exaustao <strong style={{ color: C.danger }}>{res.exaustionMod}</strong></> : null}
                {" = "}
                <strong style={{ color: C.text, fontSize: 13 }}>{res.total}</strong>
                {` vs DT ${res.dt}`}
              </div>

              <div style={{ fontSize: 10, color: res.pilarColor, marginTop: 4 }}>Base usada: {res.baseLabel}</div>

              {res.threat ? (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: C.gold, marginBottom: 6, padding: "6px 8px", background: `${C.gold}11`, borderRadius: 4 }}>
                    Ameaca aberta: confirme com a mesma base contra DT {res.dt}.
                  </div>
                  <button
                    onClick={confirmThreat}
                    disabled={rolling || !pendingThreat}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: 8,
                      background: pendingThreat ? `${C.gold}20` : C.bg3,
                      border: `1px solid ${pendingThreat ? C.gold : C.border}`,
                      color: pendingThreat ? C.gold : C.muted,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: 1,
                    }}
                  >
                    {rolling && pendingThreat ? "..." : "CONFIRMAR AMEACA"}
                  </button>
                </div>
              ) : null}

              {res.critfail ? (
                <div style={{ fontSize: 11, color: C.danger, marginTop: 6, padding: "4px 8px", background: `${C.danger}11`, borderRadius: 4 }}>
                  Falha critica - o mestre pode introduzir uma complicacao proporcional.
                </div>
              ) : null}

              {threatCheck ? (
                <div style={{ marginTop: 10, padding: "10px", borderRadius: 8, background: `${threatCheck.confirmed ? C.gold : C.danger}12`, border: `1px solid ${threatCheck.confirmed ? C.gold : C.danger}44` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: threatCheck.confirmed ? C.gold : C.danger }}>
                      {threatCheck.confirmed ? "CRITICO CONFIRMADO" : "AMEACA NAO CONFIRMADA"}
                    </div>
                    <div style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 700, color: threatCheck.confirmed ? C.gold : C.text }}>
                      {threatCheck.confirmation.total}
                    </div>
                  </div>
                  <div className="chip-row" style={{ marginBottom: 6 }}>
                    {threatCheck.confirmation.dice.map((die, index) => (
                      <div
                        key={`${die}-${index}`}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          background: die === threatCheck.confirmation.highestDie ? `${C.gold}22` : C.bg3,
                          border: `1px solid ${die === threatCheck.confirmation.highestDie ? C.gold : C.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: die === threatCheck.confirmation.highestDie ? C.gold : C.muted,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {die}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>
                    Confirmacao: melhor <strong style={{ color: C.text }}>{threatCheck.confirmation.highestDie}</strong> com total <strong style={{ color: C.text }}>{threatCheck.confirmation.total}</strong> vs DT {threatCheck.confirmation.dt}.
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div style={{ fontSize: 11, color: C.muted }}>Configure a rolagem e clique em ROLAR para ver o resultado detalhado.</div>
          )}
        </Sect>

        {hist.length > 1 ? (
          <Sect title="Historico" color={C.muted}>
            {hist.slice(1).map((item, index) => (
              <div key={index} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                <span style={{ color: C.muted }}>{item.t} - {item.label}</span>
                <span style={{ color: item.success ? C.green : C.danger, fontWeight: 600 }}>
                  {item.total} vs {item.dt} {item.success ? "ok" : "falha"}
                </span>
              </div>
            ))}
          </Sect>
        ) : null}
      </div>
    </div>
  );
}

function TabCombate({ char }) {
  const [combatTab, setCombatTab] = useState("tracker");
  const [fighters, setFighters] = useState([
    { id: 1, name: char.name || "PC", init: 0, hp: char.hp.cur, maxHp: char.hp.max, isPC: true, conds: [] },
  ]);
  const [round, setRound] = useState(1);
  const [active, setActive] = useState(0);
  const [newName, setNewName] = useState("");
  const [selectedEffects, setSelectedEffects] = useState([]);
  const [turnFlow, setTurnFlow] = useState({
    major: true,
    minor: true,
    movement: true,
    reaction: true,
  });

  const initiativeBonus = sumSelectedEffectValue(char.effects, selectedEffects, "initiative");
  const damageBonus = sumSelectedEffectValue(char.effects, selectedEffects, "damage");

  function toggleEffect(effectId) {
    setSelectedEffects((current) => (
      current.includes(effectId) ? current.filter((id) => id !== effectId) : [...current, effectId]
    ));
  }

  function addF(isPC) {
    const name = newName.trim() || (isPC ? "Aliado" : "Inimigo");
    const hp = isPC ? char.hp.cur : 50;
    const maxHp = isPC ? char.hp.max : 50;
    setFighters((current) => [...current, { id: Date.now(), name, init: 0, hp, maxHp, isPC, conds: [] }]);
    setNewName("");
  }

  function sortByInitiative(list) {
    return [...list].sort((left, right) => right.init - left.init);
  }

  function rollInit(id) {
    setFighters((current) => sortByInitiative(current.map((fighter) => {
      if (fighter.id !== id) return fighter;
      const baseRoll = Math.floor(Math.random() * 6) + 1;
      return { ...fighter, init: fighter.isPC ? baseRoll + initiativeBonus : baseRoll };
    })));
  }

  function rollAllInit() {
    setFighters((current) => sortByInitiative(current.map((fighter) => {
      const baseRoll = Math.floor(Math.random() * 6) + 1;
      return { ...fighter, init: fighter.isPC ? baseRoll + initiativeBonus : baseRoll };
    })));
  }

  function nextTurn() {
    if (!fighters.length) return;
    const nextIndex = (active + 1) % fighters.length;
    if (nextIndex === 0) setRound((value) => value + 1);
    setActive(nextIndex);
    setTurnFlow({
      major: true,
      minor: true,
      movement: true,
      reaction: true,
    });
  }

  function changeHp(id, amount) {
    setFighters((current) => current.map((fighter) => (
      fighter.id === id ? { ...fighter, hp: clampNumber(fighter.hp + amount, 0, fighter.maxHp) } : fighter
    )));
  }

  function toggleCondition(id, conditionId) {
    setFighters((current) => current.map((fighter) => (
      fighter.id !== id
        ? fighter
        : {
            ...fighter,
            conds: fighter.conds.includes(conditionId)
              ? fighter.conds.filter((value) => value !== conditionId)
              : [...fighter.conds, conditionId],
          }
    )));
  }

  function removeFighter(id) {
    setFighters((current) => {
      const nextList = current.filter((fighter) => fighter.id !== id);
      setActive((currentActive) => (nextList.length ? clampNumber(currentActive, 0, nextList.length - 1) : 0));
      return nextList;
    });
  }

  const combatTabs = [
    { id: "tracker", label: "Tracker" },
    { id: "armas", label: "Armas" },
    { id: "manif", label: "Manif." },
  ];
  const turnFlowItems = [
    { id: "major", label: "Maior", color: C.corpo },
    { id: "minor", label: "Menor", color: C.gold },
    { id: "movement", label: "Mov.", color: C.mente },
    { id: "reaction", label: "Reacao", color: C.alma },
  ];

  return (
    <div>
      <div className="chip-row" style={{ marginBottom: 10 }}>
        {combatTabs.map((tabItem) => {
          const activeTab = combatTab === tabItem.id;
          return (
            <button
              key={tabItem.id}
              onClick={() => setCombatTab(tabItem.id)}
              style={{
                flex: 1,
                padding: "6px 4px",
                borderRadius: 6,
                background: activeTab ? `${C.corpo}22` : C.bg2,
                border: `1px solid ${activeTab ? C.corpo : C.border}`,
                color: activeTab ? C.corpo : C.muted,
                fontSize: 11,
                          fontFamily: FONT_DISPLAY,
                letterSpacing: 1,
              }}
            >
              {tabItem.label}
            </button>
          );
        })}
      </div>

      <EffectToggleGroup
        effects={char.effects}
        selectedIds={selectedEffects}
        onToggle={toggleEffect}
        fields={["initiative", "damage"]}
        title="Efeitos de combate ativos"
        color={C.corpo}
      />

      {combatTab === "tracker" ? (
        <div>
          <Sect title="Estrutura do Turno" color={C.gold}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>
              Marque o que ja foi gasto no turno atual do combatente ativo.
            </div>
            <div className="chip-row">
              {turnFlowItems.map((item) => {
                const available = turnFlow[item.id];
                return (
                  <button
                    key={item.id}
                    onClick={() => setTurnFlow((current) => ({ ...current, [item.id]: !current[item.id] }))}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: available ? `${item.color}18` : C.bg3,
                      border: `1px solid ${available ? item.color : C.border}`,
                      color: available ? item.color : C.muted,
                      fontSize: 11,
                    }}
                  >
                    {item.label} {available ? "disponivel" : "gasta"}
                  </button>
                );
              })}
              <button
                onClick={() => setTurnFlow({ major: true, minor: true, movement: true, reaction: true })}
                style={{ padding: "6px 10px", borderRadius: 999, background: C.bg3, border: `1px solid ${C.border}`, color: C.muted, fontSize: 11 }}
              >
                Resetar turno
              </button>
            </div>
          </Sect>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 8, flexWrap: "wrap" }}>
            <div style={{ fontFamily: "Georgia,serif" }}>
              <span style={{ fontSize: 10, color: C.gold, letterSpacing: 2, fontFamily: FONT_SYSTEM }}>RODADA </span>
              <span style={{ fontSize: 26, fontWeight: 700, color: C.gold, fontFamily: FONT_DISPLAY }}>{round}</span>
            </div>
            <div className="chip-row">
              <button onClick={rollAllInit} style={{ padding: "6px 10px", borderRadius: 6, background: C.bg3, border: `1px solid ${C.border}`, color: C.text, fontSize: 12 }}>
                Iniciativa
              </button>
              <button onClick={nextTurn} style={{ padding: "6px 14px", borderRadius: 6, background: `${C.gold}22`, border: `1px solid ${C.gold}`, color: C.gold, fontFamily: FONT_DISPLAY, fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
                Prox turno
              </button>
            </div>
          </div>

          {(initiativeBonus !== 0 || damageBonus !== 0) ? (
            <div style={{ padding: "8px 10px", background: C.bg3, borderRadius: 6, fontSize: 11, color: C.muted, marginBottom: 10 }}>
              {initiativeBonus !== 0 ? `Iniciativa ${formatSigned(initiativeBonus)} ` : ""}
              {damageBonus !== 0 ? `Dano ${formatSigned(damageBonus)}` : ""}
            </div>
          ) : null}

          <ResponsiveGrid minWidth={320}>
            {fighters.map((fighter, index) => {
              const isActive = index === active;
              const percent = getMeterPercent(fighter.hp, fighter.maxHp);
              const hpColor = percent > 50 ? C.green : percent > 25 ? C.warning : C.danger;
              return (
                <div key={fighter.id} style={{ ...card, borderColor: isActive ? C.gold : C.border, borderWidth: isActive ? 2 : 1, transition: "border 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div
                      onClick={() => rollInit(fighter.id)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        background: isActive ? C.gold : C.bg3,
                        color: isActive ? C.bg : C.muted,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: "pointer",
                        flexShrink: 0,
                        userSelect: "none",
                      }}
                      title="Clique para rolar iniciativa"
                    >
                      {fighter.init || "?"}
                    </div>
                    <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: isActive ? C.gold : C.text }}>{fighter.name}</span>
                    <span style={{ fontSize: 10, color: fighter.isPC ? C.mente : C.corpo, border: `1px solid ${fighter.isPC ? `${C.mente}44` : `${C.corpo}44`}`, borderRadius: 10, padding: "1px 6px" }}>
                      {fighter.isPC ? "PC" : "NPC"}
                    </span>
                    <button onClick={() => removeFighter(fighter.id)} style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: C.bg3, border: `1px solid ${C.border}`, color: C.muted }}>
                      x
                    </button>
                  </div>

                  <div style={{ marginBottom: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                      <span style={{ fontSize: 10, color: C.muted, letterSpacing: 1 }}>HP</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <SmBtn onClick={() => changeHp(fighter.id, -10)} color={C.danger} wide>-10</SmBtn>
                        <SmBtn onClick={() => changeHp(fighter.id, -5)} color={C.danger} wide>-5</SmBtn>
                        <SmBtn onClick={() => changeHp(fighter.id, -1)} color={C.danger}>-</SmBtn>
                        <span style={{ fontSize: 13, fontWeight: 700, color: hpColor, minWidth: 52, textAlign: "center" }}>{fighter.hp}/{fighter.maxHp}</span>
                        <SmBtn onClick={() => changeHp(fighter.id, 1)} color={C.green}>+</SmBtn>
                        <SmBtn onClick={() => changeHp(fighter.id, 5)} color={C.green} wide>+5</SmBtn>
                      </div>
                    </div>
                    <div style={{ height: 5, background: C.bg3, borderRadius: 3 }}>
                      <div style={{ height: 5, width: `${percent}%`, background: hpColor, borderRadius: 3, transition: "width 0.3s" }} />
                    </div>
                    {fighter.hp === 0 ? (
                      <div style={{ fontSize: 10, color: C.danger, marginTop: 2 }}>Inconsciente - teste de Constituicao DT 5 por turno.</div>
                    ) : null}
                  </div>

                  <div className="chip-row">
                    {CONDS.map((condition) => {
                      const activeCondition = fighter.conds.includes(condition.id);
                      return (
                        <button
                          key={condition.id}
                          onClick={() => toggleCondition(fighter.id, condition.id)}
                          style={{
                            fontSize: 10,
                            padding: "2px 7px",
                            borderRadius: 10,
                            background: activeCondition ? `${condition.color}22` : C.bg3,
                            border: `1px solid ${activeCondition ? condition.color : C.border}`,
                            color: activeCondition ? condition.color : C.muted,
                          }}
                        >
                          {condition.label}
                        </button>
                      );
                    })}
                  </div>

                  {fighter.conds.length ? (
                    <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
                      {fighter.conds.map((conditionId) => {
                        const condition = getConditionById(conditionId);
                        return condition ? (
                          <div key={conditionId} style={{ fontSize: 10, color: condition.color, borderLeft: `2px solid ${condition.color}`, paddingLeft: 5 }}>
                            {condition.desc}
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </ResponsiveGrid>

          <Sect title="Adicionar Combatente" color={C.gold}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Nome do combatente..." onKeyDown={(event) => event.key === "Enter" && addF(false)} style={{ flex: 1, minWidth: 220 }} />
              <button onClick={() => addF(true)} style={{ padding: "5px 8px", borderRadius: 5, background: `${C.mente}22`, border: `1px solid ${C.mente}`, color: C.mente, fontSize: 11, whiteSpace: "nowrap" }}>
                + Aliado
              </button>
              <button onClick={() => addF(false)} style={{ padding: "5px 8px", borderRadius: 5, background: `${C.corpo}22`, border: `1px solid ${C.corpo}`, color: C.corpo, fontSize: 11, whiteSpace: "nowrap" }}>
                + Inimigo
              </button>
            </div>
          </Sect>
        </div>
      ) : null}

      {combatTab === "armas" ? <ArmasDmgTab char={char} damageBonus={damageBonus} /> : null}
      {combatTab === "manif" ? <ManifDmgTab char={char} damageBonus={damageBonus} /> : null}
    </div>
  );
}

function ArmasDmgTab({ char, damageBonus }) {
  const [selWeapon, setSelWeapon] = useState(null);
  const [selectedGripId, setSelectedGripId] = useState(null);
  const [selectedCritId, setSelectedCritId] = useState(null);
  const [customFormula, setCustomFormula] = useState("1d8");
  const [useCustom, setUseCustom] = useState(false);
  const [dmgRes, setDmgRes] = useState(null);
  const [rd, setRd] = useState(0);
  const [catFilter, setCatFilter] = useState("cacl");

  const cats = [
    { id: "cacl", label: "Leve" },
    { id: "cacm", label: "Media" },
    { id: "cacp", label: "Pesada" },
    { id: "dist", label: "Dist." },
  ];

  const visibleWeapons = WEAPONS.filter((weapon) => weapon.cat === catFilter);
  const gripOptions = getWeaponGripOptions(selWeapon);
  const criticalOptions = getWeaponCriticalOptions(selWeapon);
  const activeGrip = gripOptions.find((option) => option.id === selectedGripId) || gripOptions[0] || null;
  const activeCrit = criticalOptions.find((option) => option.id === selectedCritId) || criticalOptions[0] || null;

  useEffect(() => {
    setSelectedGripId((currentGripId) => (
      gripOptions.some((option) => option.id === currentGripId) ? currentGripId : (gripOptions[0] ? gripOptions[0].id : null)
    ));
  }, [selWeapon]);

  useEffect(() => {
    setSelectedCritId((currentCritId) => (
      criticalOptions.some((option) => option.id === currentCritId) ? currentCritId : (criticalOptions[0] ? criticalOptions[0].id : null)
    ));
  }, [selWeapon]);

  function getFormula() {
    if (useCustom) return customFormula;
    return activeGrip ? activeGrip.formula : null;
  }

  function rollDmg() {
    const formula = getFormula();
    if (!formula) return;
    const firstRoll = rollDiceParts(formula);
    const secondRoll = rollDiceParts(formula);
    if (!firstRoll || !secondRoll) return;

    const bestRoll = firstRoll.total >= secondRoll.total ? firstRoll : secondRoll;
    const baseBest = Math.max(firstRoll.total, secondRoll.total);
    const withEffects = Math.max(0, baseBest + damageBonus);
    const afterRD = Math.max(0, withEffects - rd);

    setDmgRes({
      firstRoll: firstRoll.total,
      secondRoll: secondRoll.total,
      baseBest,
      withEffects,
      bestRolls: bestRoll.rolls,
      bestBonus: bestRoll.bonus,
      formula,
      afterRD,
      rd,
      damageBonus,
      weaponName: selWeapon ? selWeapon.name : "Formula livre",
      gripLabel: activeGrip ? activeGrip.gripLabel : null,
      criticalLabel: activeCrit ? activeCrit.label : null,
    });
  }

  const activeFormula = getFormula() || "-";

  return (
    <Sect title="Rolagem de Dano - Armas" color={C.corpo}>
      <div className="chip-row" style={{ marginBottom: 10 }}>
        <button
          onClick={() => setUseCustom(false)}
          style={{
            flex: 1,
            padding: "6px",
            borderRadius: 6,
            background: !useCustom ? `${C.corpo}22` : C.bg3,
            border: `1px solid ${!useCustom ? C.corpo : C.border}`,
            color: !useCustom ? C.corpo : C.muted,
            fontSize: 11,
          }}
        >
          Selecionar arma
        </button>
        <button
          onClick={() => setUseCustom(true)}
          style={{
            flex: 1,
            padding: "6px",
            borderRadius: 6,
            background: useCustom ? `${C.corpo}22` : C.bg3,
            border: `1px solid ${useCustom ? C.corpo : C.border}`,
            color: useCustom ? C.corpo : C.muted,
            fontSize: 11,
          }}
        >
          Formula livre
        </button>
      </div>

      {!useCustom ? (
        <div>
          <div className="chip-row" style={{ marginBottom: 8 }}>
            {cats.map((cat) => {
              const active = catFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCatFilter(cat.id);
                    setSelWeapon(null);
                    setDmgRes(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "4px 2px",
                    borderRadius: 5,
                    background: active ? `${C.corpo}22` : C.bg3,
                    border: `1px solid ${active ? C.corpo : C.border}`,
                    color: active ? C.corpo : C.muted,
                    fontSize: 11,
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="chip-row" style={{ marginBottom: 12 }}>
            {visibleWeapons.map((weapon) => {
              const active = selWeapon && selWeapon.name === weapon.name;
              return (
                <button
                  key={weapon.name}
                  onClick={() => {
                    setSelWeapon(weapon);
                    setDmgRes(null);
                  }}
                  style={{
                    padding: "4px 9px",
                    borderRadius: 5,
                    background: active ? `${C.corpo}22` : C.bg3,
                    border: `1px solid ${active ? C.corpo : C.border}`,
                    color: active ? C.corpo : C.text,
                    fontSize: 11,
                  }}
                >
                  {weapon.name}
                </button>
              );
            })}
          </div>

          {selWeapon ? (
            <div style={{ padding: "10px", background: C.bg3, borderRadius: 8, marginBottom: 12, fontSize: 11, border: `1px solid ${C.border}` }}>
              <div style={{ fontWeight: 700, color: C.corpo, marginBottom: 4 }}>{selWeapon.name}</div>
              <div style={{ color: C.muted, lineHeight: 1.6 }}>
                {selWeapon.type}
                {selWeapon.range ? ` - ${selWeapon.range}` : ""}
                {selWeapon.emp ? ` - ${selWeapon.emp}` : ""}
                {` - Acao: ${selWeapon.act}`}
              </div>
              {gripOptions.length > 1 ? (
                <div style={{ marginTop: 10 }}>
                  <Lbl>Empunhadura</Lbl>
                  <div className="chip-row" style={{ marginTop: 4 }}>
                    {gripOptions.map((option) => {
                      const active = activeGrip && activeGrip.id === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => {
                            setSelectedGripId(option.id);
                            setDmgRes(null);
                          }}
                          style={{
                            padding: "5px 9px",
                            borderRadius: 999,
                            background: active ? `${C.corpo}22` : C.bg2,
                            border: `1px solid ${active ? C.corpo : C.border}`,
                            color: active ? C.corpo : C.text,
                            fontSize: 11,
                          }}
                        >
                          {option.gripLabel}
                          <span style={{ color: active ? C.corpo : C.muted, marginLeft: 6 }}>{option.formula}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div style={{ marginTop: 10 }}>
                <Lbl>Critico</Lbl>
                {criticalOptions.length > 1 ? (
                  <div className="chip-row" style={{ marginTop: 4 }}>
                    {criticalOptions.map((option) => {
                      const active = activeCrit && activeCrit.id === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => setSelectedCritId(option.id)}
                          style={{
                            padding: "5px 9px",
                            borderRadius: 999,
                            background: active ? `${C.gold}18` : C.bg2,
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
                ) : (
                  <div style={{ color: C.gold, marginTop: 4 }}>{activeCrit ? activeCrit.label : selWeapon.crit}</div>
                )}
              </div>

              <div style={{ marginTop: 10, fontSize: 11, color: C.muted }}>
                Dano ativo: <strong style={{ color: C.corpo }}>{activeFormula}</strong>
                {selWeapon.pen ? <span>{` - Penalidade: ${selWeapon.pen}`}</span> : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div style={{ marginBottom: 12 }}>
          <Lbl>Formula de dano</Lbl>
          <input value={customFormula} onChange={(event) => setCustomFormula(event.target.value)} placeholder="1d8, 2d6+2, 1d12..." style={{ marginTop: 4 }} />
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <div>
          <Lbl>RD do alvo</Lbl>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            <SmBtn onClick={() => setRd((value) => Math.max(0, value - 1))}>-</SmBtn>
            <span style={{ fontWeight: 700, fontSize: 15, color: C.muted, width: 28, textAlign: "center" }}>{rd}</span>
            <SmBtn onClick={() => setRd((value) => value + 1)}>+</SmBtn>
            <SmBtn onClick={() => setRd(0)} color={C.muted}>0</SmBtn>
          </div>
        </div>
      </div>

      <div style={{ padding: "6px 10px", background: C.bg3, borderRadius: 6, marginBottom: 10, fontSize: 11, color: C.muted }}>
        Formula ativa: <strong style={{ color: C.corpo }}>{activeFormula}</strong> - rola 2x e usa o maior.
        {!useCustom && activeGrip ? <span>{` Empunhadura: ${activeGrip.gripLabel}.`}</span> : null}
        {!useCustom && activeCrit ? <span style={{ color: C.gold }}>{` Critico: ${activeCrit.label}.`}</span> : null}
        {damageBonus !== 0 ? <span style={{ color: C.green }}> Dano extra por efeito: {formatSigned(damageBonus)}</span> : null}
      </div>

      <button
        onClick={rollDmg}
        disabled={!getFormula()}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: 8,
          background: getFormula() ? `${C.corpo}22` : C.bg3,
          border: `2px solid ${getFormula() ? C.corpo : C.border}`,
          color: getFormula() ? C.corpo : C.muted,
                        fontFamily: FONT_DISPLAY,
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: 2,
        }}
      >
        ROLAR DANO
      </button>

      {dmgRes ? (
        <div style={{ marginTop: 12, padding: "12px", background: C.bg3, borderRadius: 8, border: `2px solid ${C.corpo}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 10, color: C.muted }}>{dmgRes.weaponName}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.corpo }}>
                {dmgRes.gripLabel ? `${dmgRes.gripLabel} - ${dmgRes.formula}` : dmgRes.formula}
              </div>
            </div>
            {dmgRes.criticalLabel ? (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: C.muted }}>Critico escolhido</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.gold }}>{dmgRes.criticalLabel}</div>
              </div>
            ) : null}
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>1a rolagem</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 700, color: dmgRes.firstRoll >= dmgRes.secondRoll ? C.corpo : C.muted }}>{dmgRes.firstRoll}</div>
            </div>
            <div style={{ color: C.muted, fontSize: 18 }}>vs</div>
            <div style={{ flex: 1, textAlign: "right" }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>2a rolagem</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 700, color: dmgRes.secondRoll > dmgRes.firstRoll ? C.corpo : C.muted }}>{dmgRes.secondRoll}</div>
            </div>
          </div>

          <div className="chip-row" style={{ marginBottom: 8 }}>
            {dmgRes.bestRolls.map((die, index) => (
              <div key={index} style={{ width: 30, height: 30, borderRadius: 5, background: `${C.corpo}22`, border: `1px solid ${C.corpo}44`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: C.corpo, fontSize: 13 }}>
                {die}
              </div>
            ))}
            {dmgRes.bestBonus !== 0 ? <div style={{ display: "flex", alignItems: "center", color: C.muted, fontSize: 12 }}>{formatSigned(dmgRes.bestBonus)}</div> : null}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${C.border}`, paddingTop: 8, gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 10, color: C.muted }}>Melhor resultado</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 32, fontWeight: 700, color: C.corpo, lineHeight: 1 }}>{dmgRes.baseBest}</div>
            </div>
            {dmgRes.damageBonus !== 0 ? (
              <div>
                <div style={{ fontSize: 10, color: C.muted }}>Com efeitos</div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 32, fontWeight: 700, color: C.green, lineHeight: 1 }}>{dmgRes.withEffects}</div>
              </div>
            ) : null}
            {dmgRes.rd > 0 ? (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: C.muted }}>Apos RD {dmgRes.rd}</div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 32, fontWeight: 700, color: dmgRes.afterRD > 0 ? C.warning : C.muted, lineHeight: 1 }}>{dmgRes.afterRD}</div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </Sect>
  );
}

function ManifDmgTab({ char, damageBonus }) {
  const tierAlma = char.subs.dominio
    ? ((TIERS[char.subs.dominio.tier] || "Leigo") === "Especialista" ? "Esp." : (TIERS[char.subs.dominio.tier] || "Leigo"))
    : "Leigo";
  const manifestTiers = ["Leigo", "Treinado", "Esp.", "Mestre", "Maestria"];
  const [selTier, setSelTier] = useState(tierAlma);
  const [keywordCount, setKeywordCount] = useState(2);
  const [kw, setKw] = useState(0);
  const [amp, setAmp] = useState(0);
  const [progEf, setProgEf] = useState(0);
  const [manifRes, setManifRes] = useState(null);

  const peTotal = getManifestationPeTotal(kw, amp);
  const formula = manifDmgFormula(selTier, amp);
  const actionMeta = getActionMeta(kw);
  const scaleBand = getScaleBand(amp);
  const damageTrack = getDamageTrackByTier(selTier);

  function rollManif() {
    const firstRoll = rollDiceParts(formula);
    const secondRoll = rollDiceParts(formula);
    if (!firstRoll || !secondRoll) return;

    const bestRoll = firstRoll.total >= secondRoll.total ? firstRoll : secondRoll;
    const baseBest = Math.max(firstRoll.total, secondRoll.total);
    const withMods = baseBest + progEf + damageBonus;
    setManifRes({
      firstRoll: firstRoll.total,
      secondRoll: secondRoll.total,
      baseBest,
      withMods,
      bestRolls: bestRoll.rolls,
      formula,
      tierUsed: selTier,
      keywordCount,
      kwUsed: kw,
      ampUsed: amp,
      peTotal,
    });
  }

  return (
    <Sect title="Rolagem de Dano - Manifestacao" color={C.alma}>
      <Lbl>Tier de dominio</Lbl>
      <div className="chip-row" style={{ marginBottom: 12 }}>
        {manifestTiers.map((tier) => {
          const active = selTier === tier;
          return (
            <button
              key={tier}
              onClick={() => setSelTier(tier)}
              style={{
                flex: 1,
                padding: "5px 2px",
                borderRadius: 5,
                background: active ? `${C.alma}33` : C.bg3,
                border: `1px solid ${active ? C.alma : C.border}`,
                color: active ? C.alma : C.muted,
                fontSize: 11,
              }}
            >
              {tier}
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 12 }}>
        <div>
          <Lbl>Keywords</Lbl>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <SmBtn onClick={() => setKeywordCount((value) => Math.max(1, value - 1))}>-</SmBtn>
            <span style={{ fontWeight: 700, fontSize: 18, color: C.mente, width: 32, textAlign: "center" }}>{keywordCount}</span>
            <SmBtn onClick={() => setKeywordCount((value) => value + 1)}>+</SmBtn>
          </div>
        </div>
        <div>
          <Lbl>KW base</Lbl>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <SmBtn onClick={() => setKw((value) => Math.max(0, value - 1))}>-</SmBtn>
            <span style={{ fontWeight: 700, fontSize: 18, color: C.alma, width: 32, textAlign: "center" }}>{kw}</span>
            <SmBtn onClick={() => setKw((value) => value + 1)}>+</SmBtn>
            <SmBtn onClick={() => setKw(0)} color={C.muted}>0</SmBtn>
          </div>
        </div>
        <div>
          <Lbl>Amplificacao PE extra</Lbl>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <SmBtn onClick={() => setAmp((value) => Math.max(0, value - 1))}>-</SmBtn>
            <span style={{ fontWeight: 700, fontSize: 18, color: C.gold, width: 32, textAlign: "center" }}>{amp}</span>
            <SmBtn onClick={() => setAmp((value) => value + 1)}>+</SmBtn>
            <SmBtn onClick={() => setAmp(0)} color={C.muted}>0</SmBtn>
          </div>
        </div>
        <div style={{ textAlign: "right", alignSelf: "end" }}>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>PE total: {peTotal}</div>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>Intensidade: {scaleBand.label}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: actionMeta.color }}>{actionMeta.label}</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <div>
          <Lbl>Prog. efetivo</Lbl>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            <SmBtn onClick={() => setProgEf((value) => value - 1)}>-</SmBtn>
            <span style={{ fontWeight: 700, fontSize: 15, color: C.gold, width: 32, textAlign: "center" }}>{formatSigned(progEf)}</span>
            <SmBtn onClick={() => setProgEf((value) => value + 1)}>+</SmBtn>
          </div>
        </div>
      </div>

      <div style={{ padding: "8px 10px", background: `${C.alma}11`, border: `1px solid ${C.alma}33`, borderRadius: 6, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 10, color: C.muted }}>Dado base</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: C.alma }}>{formula}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.muted }}>Tier</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.alma }}>{selTier}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.muted }}>Keywords / KW</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.gold }}>{keywordCount} / {kw}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: C.muted }}>Acao</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: actionMeta.color }}>{actionMeta.short}</div>
          </div>
        </div>
        {damageBonus !== 0 ? <div style={{ fontSize: 10, color: C.green, marginTop: 8 }}>Bonus de dano ativo: {formatSigned(damageBonus)}</div> : null}
      </div>

      <button
        onClick={rollManif}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: 8,
          background: `${C.alma}22`,
          border: `2px solid ${C.alma}`,
          color: C.alma,
          fontFamily: FONT_DISPLAY,
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: 2,
        }}
      >
        ROLAR MANIFESTACAO
      </button>

      {manifRes ? (
        <div style={{ marginTop: 12, padding: "12px", background: C.bg3, borderRadius: 8, border: `2px solid ${C.alma}` }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>1a rolagem</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, color: manifRes.firstRoll >= manifRes.secondRoll ? C.alma : C.muted }}>{manifRes.firstRoll}</div>
            </div>
            <div style={{ color: C.muted }}>vs</div>
            <div style={{ flex: 1, textAlign: "right" }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>2a rolagem</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, color: manifRes.secondRoll > manifRes.firstRoll ? C.alma : C.muted }}>{manifRes.secondRoll}</div>
            </div>
          </div>

          <div className="chip-row" style={{ marginBottom: 10 }}>
            {manifRes.bestRolls.map((die, index) => (
              <div key={index} style={{ width: 30, height: 30, borderRadius: 5, background: `${C.alma}22`, border: `1px solid ${C.alma}44`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: C.alma, fontSize: 13 }}>
                {die}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: `1px solid ${C.border}`, paddingTop: 8, gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 10, color: C.muted }}>Dano base</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 700, color: C.alma, lineHeight: 1 }}>{manifRes.baseBest}</div>
              <div style={{ fontSize: 10, color: C.muted }}>{manifRes.tierUsed} - {manifRes.formula} - {manifRes.keywordCount} keywords - KW {manifRes.kwUsed} - amp +{manifRes.ampUsed}</div>
            </div>
            {(progEf !== 0 || damageBonus !== 0) ? (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: C.muted }}>Com modificadores</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 700, color: C.gold, lineHeight: 1 }}>{manifRes.withMods}</div>
                <div style={{ fontSize: 10, color: C.gold }}>
                  {progEf !== 0 ? `Prog ${formatSigned(progEf)} ` : ""}
                  {damageBonus !== 0 ? `Dano ${formatSigned(damageBonus)}` : ""}
                </div>
              </div>
            ) : null}
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 8 }}>PE total usado: {manifRes.peTotal} - acao {getActionMeta(manifRes.kwUsed).label} - intensidade {getScaleBand(manifRes.ampUsed).label}</div>
        </div>
      ) : null}

      <div style={{ marginTop: 14 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 10, color: C.muted, letterSpacing: 2, marginBottom: 6 }}>Escala rapida por amplificacao - {selTier.toUpperCase()}</div>
        <div className="chip-row">
          {damageTrack.map((value, index) => (
            <div
              key={index}
              onClick={() => {
                setAmp(AMP_THRESHOLDS[index]);
              }}
              style={{
                flex: 1,
                minWidth: 52,
                padding: "5px 4px",
                background: scaleBand.index === index ? `${C.alma}22` : C.bg3,
                border: `1px solid ${scaleBand.index === index ? C.alma : C.border}`,
                borderRadius: 5,
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 9, color: C.muted, marginBottom: 2 }}>{AMP_LABELS[index]}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: scaleBand.index === index ? C.alma : C.text }}>{value}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>Toque nas colunas para aplicar a faixa de amplificacao. KW e keywords definem a complexidade; PE extra define a intensidade.</div>
      </div>
    </Sect>
  );
}
