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
    }, ERA_UI_TIMINGS.ROLL_REVEAL_MS);
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
    }, ERA_UI_TIMINGS.ROLL_REVEAL_MS);
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
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: threatCheck.confirmed ? C.gold : C.text }}>
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
