/*
 * Audit refactor:
 * - Documents the ERA combat tab as UI over shared combat/turn helpers.
 * - Preserves damage, initiative, action, condition, and tracker behavior.
 * - Keeps all ERA mechanics and labels unchanged.
 */

/**
 * Renders the ERA combat roller/tracker surface.
 * @param {{char: object}} props
 * @returns {React.ReactElement}
 */
function TabCombate({ char }) {
  const initialPc = window.CompanionSystems.Combat.createCombatant({
    id: "era-pc",
    name: char.name || "PC",
    init: 0,
    hp: char.hp.cur,
    maxHp: char.hp.max,
    isPC: true,
    conds: [],
  });
  const [combatTab, setCombatTab] = useState("tracker");
  const [encounter, setEncounter] = useState(() => window.CompanionSystems.Combat.createEncounter({
    fighters: [initialPc],
  }));
  const [newName, setNewName] = useState("");
  const [selectedEffects, setSelectedEffects] = useState([]);
  const [focusedFighterId, setFocusedFighterId] = useState("era-pc");
  const [trackerState, setTrackerState] = useState(() => ({
    [initialPc.id]: buildTrackerState(char, initialPc),
  }));
  const actionTemplate = window.CompanionSystems.Actions.resolveTemplate("era");

  const initiativeBonus = sumSelectedEffectValue(char.effects, selectedEffects, "initiative");
  const damageBonus = sumSelectedEffectValue(char.effects, selectedEffects, "damage");
  const fighters = encounter.fighters;
  const round = encounter.round;
  const activeId = encounter.activeId;
  const actionStatuses = window.CompanionSystems.Actions.getActionStatusList("era", encounter.flow);
  const quickActions = actionStatuses.filter((action) => action.id !== "complete");
  const completeAction = actionStatuses.find((action) => action.id === "complete");
  const focusedFighter = fighters.find((fighter) => fighter.id === focusedFighterId) || fighters.find((fighter) => fighter.id === activeId) || fighters[0] || null;
  const focusedTracker = focusedFighter ? trackerState[focusedFighter.id] : null;
  const focusedBand = focusedFighter ? getPressureBand(focusedFighter.hp, focusedFighter.maxHp) : null;
  const focusedOverdraft = focusedTracker ? getOverdraftState(focusedTracker.pe, focusedTracker.peMax) : null;
  const focusedDefense = focusedFighter && focusedTracker && focusedBand ? getDefenseSnapshot(char, focusedFighter, focusedTracker, focusedBand) : null;
  const focusedAimMode = focusedTracker ? TRACKER_AIM_MODES.find((mode) => mode.id === focusedTracker.aimMode) || TRACKER_AIM_MODES[0] : TRACKER_AIM_MODES[0];

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

  useEffect(() => {
    setTrackerState((current) => {
      const next = {};
      fighters.forEach((fighter) => {
        next[fighter.id] = buildTrackerState(char, fighter, current[fighter.id]);
      });
      return next;
    });
  }, [
    fighters,
    char.sp.cur,
    char.sp.max,
    char.pe.cur,
    char.pe.max,
    char.exaustao,
    char.pilares.alma,
    char.subs.destreza.prog,
    char.subs.constituicao.prog,
  ]);

  useEffect(() => {
    setFocusedFighterId((current) => {
      if (current && fighters.some((fighter) => fighter.id === current)) return current;
      return activeId || (fighters[0] ? fighters[0].id : null);
    });
  }, [fighters, activeId]);

  function updateEncounter(updater) {
    setEncounter((current) => updater(window.CompanionSystems.Combat.normalizeEncounter(current)));
  }

  function updateTrackerFor(fighterId, updater) {
    setTrackerState((current) => {
      const fighter = fighters.find((item) => item.id === fighterId) || { id: fighterId, conds: [] };
      const baseState = buildTrackerState(char, fighter, current[fighterId]);
      const nextState = typeof updater === "function" ? updater(baseState) : { ...baseState, ...updater };
      return {
        ...current,
        [fighterId]: buildTrackerState(char, fighter, nextState),
      };
    });
  }

  function setEncounterCondition(id, conditionId, shouldBeActive) {
    updateEncounter((current) => {
      const fighter = current.fighters.find((item) => item.id === id);
      const isActive = fighter ? fighter.conds.includes(conditionId) : false;
      if (isActive === shouldBeActive) return current;
      return window.CompanionSystems.Combat.toggleCombatantCondition(current, id, conditionId);
    });
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
    const fighter = fighters.find((item) => item.id === id);
    const nextActive = !(fighter && fighter.conds.includes(conditionId));
    const stagedCondition = TRACKER_STAGED_CONDITIONS.find((condition) => condition.id === conditionId);

    if (stagedCondition) {
      updateTrackerFor(id, (current) => ({
        ...current,
        stages: {
          ...current.stages,
          [conditionId]: nextActive
            ? {
                level: Math.max(1, current.stages[conditionId].level || 1),
                duration: Math.max(1, current.stages[conditionId].duration || 1),
              }
            : { level: 0, duration: 0 },
        },
      }));
    }

    setEncounterCondition(id, conditionId, nextActive);
  }

  function setStageLevel(id, conditionId, nextLevel) {
    const stagedCondition = TRACKER_STAGED_CONDITIONS.find((condition) => condition.id === conditionId);
    if (!stagedCondition) return;
    const clampedLevel = clampNumber(nextLevel, 0, stagedCondition.maxLevel);

    updateTrackerFor(id, (current) => ({
      ...current,
      stages: {
        ...current.stages,
        [conditionId]: {
          level: clampedLevel,
          duration: clampedLevel === 0 ? 0 : Math.max(1, current.stages[conditionId].duration || 1),
        },
      },
    }));

    setEncounterCondition(id, conditionId, clampedLevel > 0);
  }

  function changeStageDuration(id, conditionId, delta) {
    updateTrackerFor(id, (current) => {
      const stage = current.stages[conditionId];
      return {
        ...current,
        stages: {
          ...current.stages,
          [conditionId]: {
            ...stage,
            duration: clampNumber((Number(stage.duration) || 0) + delta, 0, 99),
          },
        },
      };
    });
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
          <Sect title="Painel Tatico" color={C.gold}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: C.gold, letterSpacing: 2, fontFamily: FONT_SYSTEM, marginBottom: 2 }}>
                  RODADA {round}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700, color: C.gold }}>
                    {focusedFighter ? focusedFighter.name : "Sem alvo"}
                  </div>
                  {focusedFighter ? (
                    <>
                      <span style={{ fontSize: 10, color: focusedFighter.isPC ? C.mente : C.corpo, border: `1px solid ${focusedFighter.isPC ? `${C.mente}44` : `${C.corpo}44`}`, borderRadius: 999, padding: "3px 8px" }}>
                        {focusedFighter.isPC ? "PC" : "NPC"}
                      </span>
                      {focusedFighter.id === activeId ? (
                        <span style={{ fontSize: 10, color: C.gold, border: `1px solid ${C.gold}55`, borderRadius: 999, padding: "3px 8px" }}>
                          Combatente ativo
                        </span>
                      ) : null}
                    </>
                  ) : null}
                </div>
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

            <div className="chip-row" style={{ marginBottom: 10 }}>
              {fighters.map((fighter) => {
                const focused = focusedFighter && fighter.id === focusedFighter.id;
                const active = fighter.id === activeId;
                return (
                  <button
                    key={fighter.id}
                    onClick={() => setFocusedFighterId(fighter.id)}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 999,
                      background: focused ? `${active ? C.gold : C.corpo}22` : C.bg3,
                      border: `1px solid ${focused ? (active ? C.gold : C.corpo) : C.border}`,
                      color: focused ? (active ? C.gold : C.corpo) : C.text,
                      fontSize: 11,
                    }}
                  >
                    {fighter.name}
                  </button>
                );
              })}
            </div>

            {(initiativeBonus !== 0 || damageBonus !== 0) ? (
              <div style={{ padding: "8px 10px", background: C.bg3, borderRadius: 6, fontSize: 11, color: C.muted }}>
                {initiativeBonus !== 0 ? `Iniciativa ${formatSigned(initiativeBonus)} ` : ""}
                {damageBonus !== 0 ? `Dano ${formatSigned(damageBonus)}` : ""}
              </div>
            ) : null}
          </Sect>

          {focusedFighter && focusedTracker && focusedBand && focusedOverdraft && focusedDefense ? (
            <>
              <Sect title="Recursos e Pressao" color={C.corpo}>
                <div style={{ marginBottom: 12, padding: "10px 12px", background: `${focusedBand.color}12`, border: `1px solid ${focusedBand.color}44`, borderRadius: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>Estado atual</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: focusedBand.color, fontFamily: FONT_DISPLAY }}>{focusedBand.label}</div>
                    </div>
                    <div style={{ textAlign: "right", fontSize: 11, color: C.muted, maxWidth: 340 }}>
                      {focusedBand.note}
                      {focusedBand.damagePenalty > 0 ? ` Recebe +${focusedBand.damagePenalty} dado(s) de dano.` : ""}
                      {focusedBand.durationBonus > 0 ? ` Condicoes duram +${focusedBand.durationBonus} turno.` : ""}
                    </div>
                  </div>
                </div>

                <ResponsiveGrid minWidth={240}>
                  <div style={{ ...card, background: `${C.corpo}10`, borderColor: `${C.corpo}33` }}>
                    <Lbl>HP</Lbl>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                      <SmBtn onClick={() => changeHp(focusedFighter.id, -10)} color={C.danger} wide>-10</SmBtn>
                      <SmBtn onClick={() => changeHp(focusedFighter.id, -5)} color={C.danger} wide>-5</SmBtn>
                      <SmBtn onClick={() => changeHp(focusedFighter.id, -1)} color={C.danger}>-</SmBtn>
                      <span style={{ minWidth: 72, textAlign: "center", fontSize: 18, fontWeight: 700, color: focusedBand.color }}>
                        {focusedFighter.hp}/{focusedFighter.maxHp}
                      </span>
                      <SmBtn onClick={() => changeHp(focusedFighter.id, 1)} color={C.green}>+</SmBtn>
                      <SmBtn onClick={() => changeHp(focusedFighter.id, 5)} color={C.green} wide>+5</SmBtn>
                    </div>
                    <div style={{ height: 6, background: C.bg3, borderRadius: 999, marginBottom: 8 }}>
                      <div style={{ height: 6, width: `${getMeterPercent(focusedFighter.hp, focusedFighter.maxHp)}%`, background: focusedBand.color, borderRadius: 999, transition: "width 0.3s" }} />
                    </div>
                    <div style={{ fontSize: 10, color: C.muted }}>
                      Defesa {focusedBand.defensePenalty === 0 ? "normal" : formatSigned(focusedBand.defensePenalty)}. {focusedBand.damagePenalty > 0 ? `Dano recebido +${focusedBand.damagePenalty} dado(s).` : "Sem vulnerabilidade adicional por faixa."}
                    </div>
                  </div>

                  <div style={{ ...card, background: `${C.mente}10`, borderColor: `${C.mente}33` }}>
                    <Lbl>SP</Lbl>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                      <SmBtn onClick={() => updateTrackerFor(focusedFighter.id, (current) => ({ ...current, sp: current.sp - 10 }))} color={C.mente} wide>-10</SmBtn>
                      <SmBtn onClick={() => updateTrackerFor(focusedFighter.id, (current) => ({ ...current, sp: current.sp - 5 }))} color={C.mente} wide>-5</SmBtn>
                      <SmBtn onClick={() => updateTrackerFor(focusedFighter.id, (current) => ({ ...current, sp: current.sp - 1 }))} color={C.mente}>-</SmBtn>
                      <span style={{ minWidth: 72, textAlign: "center", fontSize: 18, fontWeight: 700, color: focusedTracker.sp === 0 ? C.danger : C.mente }}>
                        {focusedTracker.sp}/{focusedTracker.spMax}
                      </span>
                      <SmBtn onClick={() => updateTrackerFor(focusedFighter.id, (current) => ({ ...current, sp: current.sp + 1 }))} color={C.mente}>+</SmBtn>
                      <SmBtn onClick={() => updateTrackerFor(focusedFighter.id, (current) => ({ ...current, sp: current.sp + 5 }))} color={C.mente} wide>+5</SmBtn>
                    </div>
                    <div style={{ height: 6, background: C.bg3, borderRadius: 999, marginBottom: 8 }}>
                      <div style={{ height: 6, width: `${getMeterPercent(focusedTracker.sp, focusedTracker.spMax)}%`, background: focusedTracker.sp === 0 ? C.danger : C.mente, borderRadius: 999, transition: "width 0.3s" }} />
                    </div>
                    <div style={{ fontSize: 10, color: focusedTracker.sp === 0 ? C.danger : C.muted }}>
                      {focusedTracker.sp === 0 ? "Trauma psicologico acionado. Trate a quebra como gatilho narrativo e mecanico." : "Sanidade ainda sustentando a leitura do campo."}
                    </div>
                  </div>

                  <div style={{ ...card, background: `${C.alma}10`, borderColor: `${C.alma}33` }}>
                    <Lbl>PE</Lbl>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                      <SmBtn onClick={() => updateTrackerFor(focusedFighter.id, (current) => ({ ...current, pe: current.pe - 5 }))} color={C.alma} wide>-5</SmBtn>
                      <SmBtn onClick={() => updateTrackerFor(focusedFighter.id, (current) => ({ ...current, pe: current.pe - 1 }))} color={C.alma}>-</SmBtn>
                      <span style={{ minWidth: 86, textAlign: "center", fontSize: 18, fontWeight: 700, color: focusedTracker.pe < 0 ? focusedOverdraft.color : C.alma }}>
                        {focusedTracker.pe}/{focusedTracker.peMax}
                      </span>
                      <SmBtn onClick={() => updateTrackerFor(focusedFighter.id, (current) => ({ ...current, pe: current.pe + 1 }))} color={C.alma}>+</SmBtn>
                      <SmBtn onClick={() => updateTrackerFor(focusedFighter.id, (current) => ({ ...current, pe: current.pe + 5 }))} color={C.alma} wide>+5</SmBtn>
                    </div>
                    <div style={{ fontSize: 11, color: focusedOverdraft.color, marginBottom: 4 }}>
                      Overdraft: {focusedOverdraft.amount}/{focusedTracker.maxOverdraft} - {focusedOverdraft.label}
                    </div>
                    <div style={{ fontSize: 10, color: C.muted }}>{focusedOverdraft.note}</div>
                  </div>
                </ResponsiveGrid>

                <div style={{ marginTop: 10 }}>
                  <Lbl>Exaustao</Lbl>
                  <div className="chip-row">
                    {[0, 1, 2, 3, 4].map((value) => {
                      const active = focusedTracker.exhaustion === value;
                      return (
                        <button
                          key={value}
                          onClick={() => updateTrackerFor(focusedFighter.id, { exhaustion: value })}
                          style={{
                            width: 32,
                            height: 30,
                            borderRadius: 6,
                            background: active ? `${C.muted}33` : C.bg3,
                            border: `1px solid ${active ? C.muted : C.border}`,
                            color: active ? C.text : C.muted,
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>
                    {focusedTracker.exhaustion > 0 ? `-${focusedTracker.exhaustion} em rolagens; niveis altos tambem drenam mobilidade e recuperacao.` : "Sem exaustao adicional registrada."}
                  </div>
                </div>
              </Sect>

              <Sect title="Economia de Acoes" color={C.gold}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>
                  Marque o que ja foi gasto no turno do combatente ativo. O painel abaixo continua usando a economia consolidada do sistema para nao quebrar o fluxo atual.
                </div>
                <div className="chip-row" style={{ marginBottom: 8 }}>
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
                <ResponsiveGrid minWidth={220}>
                  {TRACKER_ACTION_NOTES.map((note) => (
                    <div key={note} style={{ ...card, background: C.bg3, padding: "10px", fontSize: 10, color: C.muted }}>
                      {note}
                    </div>
                  ))}
                </ResponsiveGrid>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 8 }}>{actionTemplate.notes}</div>
              </Sect>

              <Sect title="Defesa e Resistencias" color={C.mente}>
                <ResponsiveGrid minWidth={220}>
                  <div style={{ ...card, background: `${C.gold}10`, borderColor: `${C.gold}33` }}>
                    <Lbl>Defesa Base</Lbl>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <SmBtn onClick={() => updateTrackerFor(focusedFighter.id, (current) => ({ ...current, defenseBase: current.defenseBase - 1 }))}>-</SmBtn>
                      <span style={{ width: 42, textAlign: "center", fontSize: 20, fontWeight: 700, color: C.gold }}>{focusedTracker.defenseBase}</span>
                      <SmBtn onClick={() => updateTrackerFor(focusedFighter.id, (current) => ({ ...current, defenseBase: current.defenseBase + 1 }))}>+</SmBtn>
                    </div>
                    <div style={{ fontSize: 10, color: C.muted }}>Use este valor como ancora manual da mesa. O tracker aplica a penalidade da faixa de HP por cima.</div>
                  </div>

                  <div style={{ ...card, background: `${focusedBand.color}12`, borderColor: `${focusedBand.color}33` }}>
                    <Lbl>Defesa Atual</Lbl>
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 700, color: focusedBand.color, lineHeight: 1 }}>
                      {focusedDefense.defenseCurrent}
                    </div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>
                      Base {focusedTracker.defenseBase} {focusedBand.defensePenalty !== 0 ? `${formatSigned(focusedBand.defensePenalty)} pela faixa ${focusedBand.label}.` : "sem penalidade de faixa."}
                    </div>
                  </div>

                  <div style={{ ...card, background: `${C.corpo}10`, borderColor: `${C.corpo}33` }}>
                    <Lbl>RD Atual</Lbl>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <SmBtn onClick={() => updateTrackerFor(focusedFighter.id, (current) => ({ ...current, rdCurrent: current.rdCurrent - 1 }))}>-</SmBtn>
                      <span style={{ width: 42, textAlign: "center", fontSize: 20, fontWeight: 700, color: C.corpo }}>{focusedTracker.rdCurrent}</span>
                      <SmBtn onClick={() => updateTrackerFor(focusedFighter.id, (current) => ({ ...current, rdCurrent: current.rdCurrent + 1 }))}>+</SmBtn>
                    </div>
                    <div style={{ fontSize: 10, color: C.muted }}>
                      RD manual: {focusedDefense.rdFinal}
                      {focusedDefense.fragStage > 0 ? `; Fragilizado ${focusedDefense.fragStage} aumenta o dano recebido.` : "; sem fragilidade ativa."}
                    </div>
                  </div>

                  <div style={{ ...card, background: `${C.mente}10`, borderColor: `${C.mente}33` }}>
                    <Lbl>Resposta Defensiva</Lbl>
                    <div style={{ fontSize: 11, color: C.text, marginBottom: 6 }}>
                      <strong style={{ color: C.mente }}>Esquiva:</strong> {focusedDefense.dodgeFormula}
                    </div>
                    <div style={{ fontSize: 11, color: C.text }}>
                      <strong style={{ color: C.gold }}>Bloqueio:</strong> {focusedDefense.blockFormula}
                    </div>
                  </div>
                </ResponsiveGrid>
              </Sect>

              <Sect title="Condicoes Ativas" color={C.alma}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>
                  Ajuste niveis e duracoes aqui. Se o alvo estiver {focusedBand.label.toLowerCase()}, lembre que as condicoes tendem a ficar mais opressivas.
                </div>

                <div style={{ display: "grid", gap: 8, marginBottom: 10 }}>
                  {TRACKER_STAGED_CONDITIONS.map((condition) => {
                    const stage = focusedTracker.stages[condition.id];
                    return (
                      <div key={condition.id} style={{ ...card, padding: "10px", background: `${condition.color}10`, borderColor: `${condition.color}33` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 6 }}>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: condition.color }}>{condition.label}</div>
                            <div style={{ fontSize: 10, color: C.muted, maxWidth: 420 }}>{condition.note}</div>
                          </div>
                          <div className="chip-row">
                            {Array.from({ length: condition.maxLevel + 1 }, (_, value) => value).map((value) => {
                              const active = stage.level === value;
                              return (
                                <button
                                  key={value}
                                  onClick={() => setStageLevel(focusedFighter.id, condition.id, value)}
                                  style={{
                                    width: 30,
                                    height: 28,
                                    borderRadius: 6,
                                    background: active ? `${condition.color}22` : C.bg3,
                                    border: `1px solid ${active ? condition.color : C.border}`,
                                    color: active ? condition.color : C.muted,
                                    fontWeight: 700,
                                    fontSize: 11,
                                  }}
                                >
                                  {value}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                          <div style={{ fontSize: 10, color: stage.level > 0 ? condition.color : C.muted }}>
                            {stage.level > 0 ? `Ativa no nivel ${stage.level}.` : "Condicao inativa."}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 10, color: C.muted }}>Duracao</span>
                            <SmBtn onClick={() => changeStageDuration(focusedFighter.id, condition.id, -1)}>-</SmBtn>
                            <span style={{ minWidth: 24, textAlign: "center", fontSize: 12, fontWeight: 700, color: condition.color }}>{stage.duration}</span>
                            <SmBtn onClick={() => changeStageDuration(focusedFighter.id, condition.id, 1)}>+</SmBtn>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="chip-row" style={{ marginBottom: 8 }}>
                  {TRACKER_BINARY_CONDITIONS.map((condition) => {
                    const active = focusedFighter.conds.includes(condition.id);
                    return (
                      <button
                        key={condition.id}
                        onClick={() => toggleCondition(focusedFighter.id, condition.id)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 999,
                          background: active ? `${condition.color}22` : C.bg3,
                          border: `1px solid ${active ? condition.color : C.border}`,
                          color: active ? condition.color : C.muted,
                          fontSize: 11,
                        }}
                      >
                        {condition.label}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: "grid", gap: 4 }}>
                  {TRACKER_BINARY_CONDITIONS.filter((condition) => focusedFighter.conds.includes(condition.id)).map((condition) => (
                    <div key={condition.id} style={{ fontSize: 10, color: condition.color, borderLeft: `2px solid ${condition.color}`, paddingLeft: 6 }}>
                      {condition.note}
                    </div>
                  ))}
                  {focusedFighter.conds.filter((conditionId) => !TRACKER_BINARY_CONDITIONS.some((condition) => condition.id === conditionId)).map((conditionId) => {
                    const condition = getConditionById(conditionId);
                    return condition ? (
                      <div key={conditionId} style={{ fontSize: 10, color: condition.color, borderLeft: `2px solid ${condition.color}`, paddingLeft: 6 }}>
                        {condition.desc}
                      </div>
                    ) : null;
                  })}
                </div>
              </Sect>

              <Sect title="Arsenal, Mira e Canalizacao" color={C.mente}>
                <ResponsiveGrid minWidth={220}>
                  <div style={{ ...card, background: `${C.gold}10`, borderColor: `${C.gold}33` }}>
                    <Lbl>Arma atual</Lbl>
                    <input
                      value={focusedTracker.weaponName}
                      onChange={(event) => updateTrackerFor(focusedFighter.id, { weaponName: event.target.value })}
                      placeholder="Ex.: Rifle, lamina ritual, cajado..."
                    />
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>
                      Campo livre para acompanhar setup, stance e arma em uso na rodada.
                    </div>
                  </div>

                  <div style={{ ...card, background: `${C.corpo}10`, borderColor: `${C.corpo}33` }}>
                    <Lbl>Municao</Lbl>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>No pente</div>
                        <input
                          type="number"
                          value={focusedTracker.ammoCurrent}
                          onChange={(event) => updateTrackerFor(focusedFighter.id, { ammoCurrent: Number(event.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>Max</div>
                        <input
                          type="number"
                          value={focusedTracker.ammoMax}
                          onChange={(event) => updateTrackerFor(focusedFighter.id, { ammoMax: Number(event.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: C.muted }}>
                      Ideal para armas de fogo, cargas rituais e recursos que precisam de recarga por turno.
                    </div>
                  </div>

                  <div style={{ ...card, background: `${C.mente}10`, borderColor: `${C.mente}33` }}>
                    <Lbl>Mira ativa</Lbl>
                    <div className="chip-row" style={{ marginBottom: 8 }}>
                      {TRACKER_AIM_MODES.map((mode) => {
                        const active = focusedTracker.aimMode === mode.id;
                        return (
                          <button
                            key={mode.id}
                            onClick={() => updateTrackerFor(focusedFighter.id, { aimMode: mode.id })}
                            style={{
                              padding: "5px 9px",
                              borderRadius: 999,
                              background: active ? `${C.mente}22` : C.bg3,
                              border: `1px solid ${active ? C.mente : C.border}`,
                              color: active ? C.mente : C.text,
                              fontSize: 11,
                            }}
                          >
                            {mode.label}
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>{focusedAimMode.note}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 10, color: C.muted }}>Turnos sustentados</span>
                      <SmBtn onClick={() => updateTrackerFor(focusedFighter.id, (current) => ({ ...current, sustainedAim: current.sustainedAim - 1 }))}>-</SmBtn>
                      <span style={{ minWidth: 24, textAlign: "center", fontSize: 12, fontWeight: 700, color: C.mente }}>{focusedTracker.sustainedAim}</span>
                      <SmBtn onClick={() => updateTrackerFor(focusedFighter.id, (current) => ({ ...current, sustainedAim: current.sustainedAim + 1 }))}>+</SmBtn>
                    </div>
                  </div>

                  <div style={{ ...card, background: `${C.alma}10`, borderColor: `${C.alma}33` }}>
                    <Lbl>Canalizacao extrema</Lbl>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <span style={{ fontSize: 10, color: C.muted }}>Turnos</span>
                      <SmBtn onClick={() => updateTrackerFor(focusedFighter.id, (current) => ({ ...current, channelTurns: current.channelTurns - 1 }))}>-</SmBtn>
                      <span style={{ minWidth: 24, textAlign: "center", fontSize: 12, fontWeight: 700, color: C.alma }}>{focusedTracker.channelTurns}</span>
                      <SmBtn onClick={() => updateTrackerFor(focusedFighter.id, (current) => ({ ...current, channelTurns: current.channelTurns + 1 }))}>+</SmBtn>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <span style={{ fontSize: 10, color: C.muted }}>PE acumulado</span>
                      <SmBtn onClick={() => updateTrackerFor(focusedFighter.id, (current) => ({ ...current, channelPe: current.channelPe - 1 }))}>-</SmBtn>
                      <span style={{ minWidth: 24, textAlign: "center", fontSize: 12, fontWeight: 700, color: C.gold }}>{focusedTracker.channelPe}</span>
                      <SmBtn onClick={() => updateTrackerFor(focusedFighter.id, (current) => ({ ...current, channelPe: current.channelPe + 1 }))}>+</SmBtn>
                    </div>
                    <div style={{ fontSize: 10, color: C.muted }}>
                      Interrupcao: dano sofrido pede Vontade DT {5 + focusedTracker.channelTurns} para nao perder a canalizacao.
                    </div>
                  </div>
                </ResponsiveGrid>
              </Sect>
            </>
          ) : null}

          <Sect title="Visao Geral do Encontro" color={C.gold}>
            <ResponsiveGrid minWidth={320}>
              {fighters.map((fighter) => {
                const isActive = fighter.id === activeId;
                const isFocused = focusedFighter && fighter.id === focusedFighter.id;
                const fighterBand = getPressureBand(fighter.hp, fighter.maxHp);
                const percent = getMeterPercent(fighter.hp, fighter.maxHp);
                return (
                  <div
                    key={fighter.id}
                    onClick={() => setFocusedFighterId(fighter.id)}
                    style={{
                      ...card,
                      borderColor: isFocused ? C.corpo : isActive ? C.gold : C.border,
                      borderWidth: isFocused || isActive ? 2 : 1,
                      transition: "border 0.2s",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <div
                        onClick={(event) => {
                          event.stopPropagation();
                          rollInit(fighter.id);
                        }}
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
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          removeFighter(fighter.id);
                        }}
                        disabled={fighter.isPC}
                        style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: C.bg3, border: `1px solid ${C.border}`, color: fighter.isPC ? C.border : C.muted }}
                      >
                        x
                      </button>
                    </div>

                    <div style={{ marginBottom: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                        <span style={{ fontSize: 10, color: C.muted, letterSpacing: 1 }}>HP</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <SmBtn onClick={(event) => { event.stopPropagation(); changeHp(fighter.id, -10); }} color={C.danger} wide>-10</SmBtn>
                          <SmBtn onClick={(event) => { event.stopPropagation(); changeHp(fighter.id, -5); }} color={C.danger} wide>-5</SmBtn>
                          <SmBtn onClick={(event) => { event.stopPropagation(); changeHp(fighter.id, -1); }} color={C.danger}>-</SmBtn>
                          <span style={{ fontSize: 13, fontWeight: 700, color: fighterBand.color, minWidth: 52, textAlign: "center" }}>{fighter.hp}/{fighter.maxHp}</span>
                          <SmBtn onClick={(event) => { event.stopPropagation(); changeHp(fighter.id, 1); }} color={C.green}>+</SmBtn>
                          <SmBtn onClick={(event) => { event.stopPropagation(); changeHp(fighter.id, 5); }} color={C.green} wide>+5</SmBtn>
                        </div>
                      </div>
                      <div style={{ height: 5, background: C.bg3, borderRadius: 3, marginBottom: 4 }}>
                        <div style={{ height: 5, width: `${percent}%`, background: fighterBand.color, borderRadius: 3, transition: "width 0.3s" }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", fontSize: 10 }}>
                        <span style={{ color: fighterBand.color }}>{fighterBand.label}</span>
                        <span style={{ color: C.muted }}>{fighter.id === focusedFighterId ? "Painel em foco" : "Toque para focar"}</span>
                      </div>
                    </div>

                    <div className="chip-row">
                      {CONDS.map((condition) => {
                        const activeCondition = fighter.conds.includes(condition.id);
                        return (
                          <button
                            key={condition.id}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleCondition(fighter.id, condition.id);
                            }}
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
          </Sect>

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
    const withEffects = baseBest + damageBonus;
    const afterRD = withEffects - rd;

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
            <SmBtn onClick={() => setRd((value) => value - 1)}>-</SmBtn>
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
        {damageBonus !== 0 ? <span style={{ color: damageBonus > 0 ? C.green : C.menteDark }}> Ajuste de dano por efeito: {formatSigned(damageBonus)}</span> : null}
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
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 700, color: dmgRes.withEffects > dmgRes.baseBest ? C.green : C.menteDark, lineHeight: 1 }}>{dmgRes.withEffects}</div>
              </div>
            ) : null}
            {dmgRes.rd !== 0 ? (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: C.muted }}>Apos RD {dmgRes.rd}</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 700, color: dmgRes.afterRD < 0 ? C.menteDark : (dmgRes.afterRD > 0 ? C.warning : C.muted), lineHeight: 1 }}>{dmgRes.afterRD}</div>
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
    ? (TIERS[char.subs.dominio.tier] || "Leigo")
    : "Leigo";
  const manifestTiers = ["Leigo", "Treinado", "Especialista", "Mestre", "Lenda"];
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
        {damageBonus !== 0 ? <div style={{ fontSize: 10, color: damageBonus > 0 ? C.green : C.menteDark, marginTop: 8 }}>Ajuste de dano ativo: {formatSigned(damageBonus)}</div> : null}
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
