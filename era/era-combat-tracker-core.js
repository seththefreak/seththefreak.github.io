/*
 * Responsibility: isolate tracker state helpers and condition config from the combat UI.
 * Exports: TRACKER_STAGED_CONDITIONS, TRACKER_BINARY_CONDITIONS, TRACKER_AIM_MODES,
 * TRACKER_ACTION_NOTES, cloneTrackerStages, buildTrackerState, getPressureBand,
 * getOverdraftState, getDefenseSnapshot.
 */

const TRACKER_STAGED_CONDITIONS = [
  { id: "sangrando", label: "Sangramento", maxLevel: 3, color: C.corpo, note: "N1: 1 HP/t | N2: 2-4 HP/t | N3: 3 HP/t e risco de hemorragia." },
  { id: "fragilizado", label: "Fragilizado", maxLevel: 3, color: C.goldDark, note: "Afeta a RD em -1 / -2 / -3. No nivel 3, considere quebra estrutural." },
  { id: "queimando", label: "Queimadura", maxLevel: 2, color: C.corpoDark, note: "Escala calor continuo, pressao e negacao de espaco seguro." },
  { id: "congelado", label: "Congelamento", maxLevel: 3, color: C.menteDark, note: "Escala perda de movimento e abre janela para dano fisico ampliado." },
  { id: "envenenado", label: "Envenenado", maxLevel: 3, color: "#7A8B63", note: "Escala desgaste corporal, testes piores e dano continuo." },
];

const TRACKER_BINARY_CONDITIONS = [
  { id: "atordoado", label: "Atordoado", color: C.goldWarm, note: "Perde a proxima Acao Maior." },
  { id: "derrubado", label: "Derrubado", color: "#8A6A52", note: "-2 Defesa. Levantar exige gasto de utilidade / menor." },
  { id: "imobilizado", label: "Imobilizado", color: C.muted, note: "Sem movimento e -2 Destreza ate sair do controle." },
];

const TRACKER_AIM_MODES = [
  { id: "none", label: "Sem mira", note: "Sem bonus acumulado." },
  { id: "quick", label: "Rapida (m)", note: "+1 acerto." },
  { id: "full", label: "Plena (M)", note: "+2 acerto e alvo especifico sem penalidade." },
  { id: "sustained", label: "Sustentada", note: "+1 acerto por turno acumulado e abre Abater melhorado." },
];

const TRACKER_ACTION_NOTES = [
  "M: ataque principal ou manifestacao completa.",
  "u/m: saque, item, recarga e manifestacao simples.",
  "mov: deslocamento base e manifestacao avancada.",
  "R: 1 reacao por rodada para esquiva, bloqueio ou interceptacao.",
  "C: fecha o turno com manifestacoes extremas e armas de preparacao longa.",
];

function cloneTrackerStages(stagesLike) {
  const nextStages = {};
  TRACKER_STAGED_CONDITIONS.forEach((condition) => {
    const current = stagesLike && stagesLike[condition.id] ? stagesLike[condition.id] : {};
    nextStages[condition.id] = {
      level: clampNumber(Number(current.level) || 0, 0, condition.maxLevel),
      duration: clampNumber(Number(current.duration) || 0, 0, 99),
    };
  });
  return nextStages;
}

function toTrackerNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function buildTrackerState(char, fighter, existing) {
  const current = existing || {};
  const isPC = !!(fighter && fighter.isPC);
  const activeConditions = fighter && Array.isArray(fighter.conds) ? fighter.conds : [];
  const maxOverdraft = isPC ? Math.max(0, (Number(char.pilares.alma) || 0) * 5) : Math.max(0, Number(current.maxOverdraft) || 0);
  const spMax = isPC ? Math.max(1, Number(char.sp.max) || 100) : Math.max(1, Number(current.spMax) || 100);
  const peMax = isPC ? Math.max(0, Number(char.pe.max) || 0) : Math.max(0, Number(current.peMax) || 0);
  const stages = cloneTrackerStages(current.stages);

  TRACKER_STAGED_CONDITIONS.forEach((condition) => {
    const stage = stages[condition.id];
    if (activeConditions.includes(condition.id)) {
      stages[condition.id] = {
        level: clampNumber(stage.level || 1, 1, condition.maxLevel),
        duration: clampNumber(stage.duration || 1, 0, 99),
      };
      return;
    }
    stages[condition.id] = { level: 0, duration: 0 };
  });

  const ammoMax = Math.max(0, Number(current.ammoMax) || 0);

  return {
    sp: clampNumber(current.sp != null ? Number(current.sp) : (isPC ? char.sp.cur : 100), 0, spMax),
    spMax,
    pe: clampNumber(current.pe != null ? Number(current.pe) : (isPC ? char.pe.cur : 0), -maxOverdraft, peMax),
    peMax,
    maxOverdraft,
    exhaustion: clampNumber(current.exhaustion != null ? Number(current.exhaustion) : (isPC ? char.exaustao : 0), 0, 4),
    defenseBase: toTrackerNumber(current.defenseBase, 0),
    rdCurrent: toTrackerNumber(current.rdCurrent, 0),
    weaponName: current.weaponName || "",
    ammoCurrent: clampNumber(Number(current.ammoCurrent) || 0, 0, ammoMax),
    ammoMax,
    aimMode: TRACKER_AIM_MODES.some((mode) => mode.id === current.aimMode) ? current.aimMode : "none",
    sustainedAim: clampNumber(Number(current.sustainedAim) || 0, 0, 9),
    channelTurns: clampNumber(Number(current.channelTurns) || 0, 0, 5),
    channelPe: Math.max(0, toTrackerNumber(current.channelPe, 0)),
    stages,
  };
}

function getPressureBand(current, max) {
  const percent = getMeterPercent(current, max);
  if (current <= 0) {
    return {
      id: "incapacitado",
      label: "Incapacitado",
      color: C.danger,
      defensePenalty: -2,
      damagePenalty: 2,
      durationBonus: 1,
      note: "Sem acao confiavel. Exige estabilizacao ou teste por rodada.",
    };
  }
  if (percent <= 33) {
    return {
      id: "critico",
      label: "Critico",
      color: C.danger,
      defensePenalty: -2,
      damagePenalty: 2,
      durationBonus: 1,
      note: "Vulneravel a execucao e colapso de defesa.",
    };
  }
  if (percent <= 66) {
    return {
      id: "ferido",
      label: "Ferido",
      color: C.warning,
      defensePenalty: -1,
      damagePenalty: 1,
      durationBonus: 1,
      note: "Pressao alta. Condicoes ficam mais punitivas.",
    };
  }
  return {
    id: "intacto",
    label: "Intacto",
    color: C.green,
    defensePenalty: 0,
    damagePenalty: 0,
    durationBonus: 0,
    note: "Combate normal e sem penalidades extras por vulnerabilidade.",
  };
}

function getOverdraftState(peValue) {
  const overdraft = peValue < 0 ? Math.abs(peValue) : 0;
  if (!overdraft) {
    return { amount: 0, label: "Estavel", color: C.muted, note: "Sem overdraft ativo." };
  }
  if (overdraft <= 5) {
    return { amount: overdraft, label: "Leve", color: C.goldDark, note: "Recuperacao longa cai para metade." };
  }
  if (overdraft <= 10) {
    return { amount: overdraft, label: "Moderado", color: C.warning, note: "Recuperacao longa cai para um quarto e gera +1 Exaustao ao acordar." };
  }
  return { amount: overdraft, label: "Severo", color: C.danger, note: "Sem recuperacao espontanea ate estabilizar a essencia." };
}

function getDefenseSnapshot(char, fighter, tracker, band) {
  const destrezaProg = fighter && fighter.isPC ? Number(char.subs.destreza.prog) || 0 : 0;
  const constituicaoProg = fighter && fighter.isPC ? Number(char.subs.constituicao.prog) || 0 : 0;
  const fragStage = tracker.stages.fragilizado.level;
  return {
    defenseCurrent: tracker.defenseBase + band.defensePenalty,
    rdFinal: tracker.rdCurrent - fragStage,
    fragStage,
    dodgeFormula: fighter && fighter.isPC ? `${Number(char.pilares.corpo) || 0} + Prog DES ${destrezaProg}` : "Defina manualmente para este alvo",
    blockFormula: fighter && fighter.isPC ? `1d6 + Prog CON ${constituicaoProg}` : "Defina manualmente para este alvo",
  };
}
