function TabCombate({ char }) {
  const [combatTab, setCombatTab] = useState("tracker");
  const [encounter, setEncounter] = useState(() => window.CompanionSystems.Combat.createEncounter({
    fighters: [
      window.CompanionSystems.Combat.createCombatant({
        id: "era-pc",
        name: char.name || "PC",
        init: 0,
        hp: char.hp.cur,
        maxHp: char.hp.max,
        isPC: true,
        conds: [],
      }),
    ],
  }));
  const [newName, setNewName] = useState("");
  const [selectedEffects, setSelectedEffects] = useState([]);
  const actionTemplate = window.CompanionSystems.Actions.resolveTemplate("era");

  const initiativeBonus = sumSelectedEffectValue(char.effects, selectedEffects, "initiative");
  const damageBonus = sumSelectedEffectValue(char.effects, selectedEffects, "damage");
  const fighters = encounter.fighters;
  const round = encounter.round;
  const activeId = encounter.activeId;
  const actionStatuses = window.CompanionSystems.Actions.getActionStatusList("era", encounter.flow);
  const quickActions = actionStatuses.filter((action) => action.id !== "complete");
  const completeAction = actionStatuses.find((action) => action.id === "complete");

  useEffect(() => {
    setEncounter((current) => {
      const normalized = window.CompanionSystems.Combat.normalizeEncounter(current);
      const hasPc = normalized.fighters.some((fighter) => fighter.isPC);
      if (!hasPc) {
        return window.CompanionSystems.Combat.addCombatant(normalized, {
          id: "era-pc",
          name: char.name || "PC",
          init: 0,
          hp: char.hp.cur,
          maxHp: char.hp.max,
          isPC: true,
          conds: [],
        });
      }
      return window.CompanionSystems.Combat.normalizeEncounter({
        ...normalized,
        fighters: normalized.fighters.map((fighter) => (
          fighter.isPC
            ? { ...fighter, name: char.name || "PC", hp: Math.min(fighter.hp, char.hp.max), maxHp: char.hp.max }
            : fighter
        )),
      });
    });
  }, [char.name, char.hp.cur, char.hp.max]);

  function updateEncounter(updater) {
    setEncounter((current) => updater(window.CompanionSystems.Combat.normalizeEncounter(current)));
  }

  function toggleEffect(effectId) {
    setSelectedEffects((current) => (
      current.includes(effectId) ? current.filter((id) => id !== effectId) : [...current, effectId]
    ));
  }

  function addF(isPC) {
    const name = newName.trim() || (isPC ? "Aliado" : "Inimigo");
    const hp = isPC ? char.hp.cur : 50;
    const maxHp = isPC ? char.hp.max : 50;
    updateEncounter((current) => window.CompanionSystems.Combat.addCombatant(current, {
      name,
      init: 0,
      hp,
      maxHp,
      isPC,
      conds: [],
    }));
    setNewName("");
  }

  function rollInit(id) {
    updateEncounter((current) => window.CompanionSystems.Combat.rollInitiative(
      current,
      id,
      (fighter) => (fighter.isPC ? initiativeBonus : 0),
      { sides: 6 },
    ));
  }

  function rollAllInit() {
    updateEncounter((current) => window.CompanionSystems.Combat.rollAllInitiatives(
      current,
      (fighter) => (fighter.isPC ? initiativeBonus : 0),
      { sides: 6 },
    ));
  }

  function nextTurn() {
    updateEncounter((current) => window.CompanionSystems.Combat.nextTurn(current));
  }

  function consumeAction(actionId) {
    updateEncounter((current) => ({
      ...current,
      flow: current.flow[actionId]
        ? window.CompanionSystems.Turns.consumeTurnAction(current.flow, actionId, "era")
        : window.CompanionSystems.Turns.toggleTurnSlot(current.flow, actionId),
    }));
  }

  function resetTurnFlow() {
    updateEncounter((current) => ({
      ...current,
      flow: window.CompanionSystems.Turns.createTurnState(),
    }));
  }

  function changeHp(id, amount) {
    updateEncounter((current) => window.CompanionSystems.Combat.changeCombatantHp(current, id, amount));
  }

  function toggleCondition(id, conditionId) {
    updateEncounter((current) => window.CompanionSystems.Combat.toggleCombatantCondition(current, id, conditionId));
  }

  function removeFighter(id) {
    updateEncounter((current) => window.CompanionSystems.Combat.removeCombatant(current, id));
  }

  const combatTabs = [
    { id: "tracker", label: "Tracker" },
    { id: "armas", label: "Armas" },
    { id: "manif", label: "Manif." },
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
              {quickActions.map((item) => {
                const available = item.available;
                return (
                  <button
                    key={item.id}
                    onClick={() => consumeAction(item.id)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: available ? `${item.color}18` : C.bg3,
                      border: `1px solid ${available ? item.color : C.border}`,
                      color: available ? item.color : C.muted,
                      fontSize: 11,
                    }}
                  >
                    {item.code} {item.label} {available ? "disponivel" : "gasta"}
                  </button>
                );
              })}
              <button
                onClick={() => completeAction && completeAction.available && consumeAction("complete")}
                disabled={!completeAction || !completeAction.available}
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: completeAction && completeAction.available ? `${C.corpo}22` : C.bg3,
                  border: `1px solid ${completeAction && completeAction.available ? C.corpo : C.border}`,
                  color: completeAction && completeAction.available ? C.corpo : C.muted,
                  fontSize: 11,
                }}
              >
                {completeAction ? `${completeAction.code} ${completeAction.label}` : "C"}
              </button>
              <button
                onClick={resetTurnFlow}
                style={{ padding: "6px 10px", borderRadius: 999, background: C.bg3, border: `1px solid ${C.border}`, color: C.muted, fontSize: 11 }}
              >
                Resetar turno
              </button>
            </div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 8 }}>{actionTemplate.notes}</div>
          </Sect>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 8, flexWrap: "wrap" }}>
            <div style={{ fontFamily: FONT_DISPLAY }}>
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
              const isActive = fighter.id === activeId;
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
                    <button onClick={() => removeFighter(fighter.id)} disabled={fighter.isPC} style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: C.bg3, border: `1px solid ${C.border}`, color: fighter.isPC ? C.border : C.muted }}>
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
    const bestOf = window.CompanionSystems.Dice.rollBestOf(formula, 2);
    if (!bestOf || bestOf.attempts.length < 2) return;

    const [firstRoll, secondRoll] = bestOf.attempts;
    const bestRoll = bestOf.best;
    const baseBest = bestRoll.total;
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
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: dmgRes.firstRoll >= dmgRes.secondRoll ? C.corpo : C.muted }}>{dmgRes.firstRoll}</div>
            </div>
            <div style={{ color: C.muted, fontSize: 18 }}>vs</div>
            <div style={{ flex: 1, textAlign: "right" }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>2a rolagem</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: dmgRes.secondRoll > dmgRes.firstRoll ? C.corpo : C.muted }}>{dmgRes.secondRoll}</div>
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
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 700, color: C.corpo, lineHeight: 1 }}>{dmgRes.baseBest}</div>
            </div>
            {dmgRes.damageBonus !== 0 ? (
              <div>
                <div style={{ fontSize: 10, color: C.muted }}>Com efeitos</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 700, color: C.green, lineHeight: 1 }}>{dmgRes.withEffects}</div>
              </div>
            ) : null}
            {dmgRes.rd > 0 ? (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: C.muted }}>Apos RD {dmgRes.rd}</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 700, color: dmgRes.afterRD > 0 ? C.warning : C.muted, lineHeight: 1 }}>{dmgRes.afterRD}</div>
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
    const bestOf = window.CompanionSystems.Dice.rollBestOf(formula, 2);
    if (!bestOf || bestOf.attempts.length < 2) return;

    const [firstRoll, secondRoll] = bestOf.attempts;
    const bestRoll = bestOf.best;
    const baseBest = bestRoll.total;
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

