/*
 * Audit refactor:
 * - Documents tracker state helpers and condition config used by the combat UI.
 * - Updates HP pressure bands to the PDF combat expansion thresholds.
 * - Keeps the helper surface compatible with era-rolls-combate.js.
 */

const TRACKER_STAGED_CONDITIONS = [
  { id: "sangrando", label: "Sangramento", maxLevel: 3, color: C.corpo, note: "N1: 1 HP/t | N2: 2-4 HP/t | N3: 5-10% HP max/t e risco de morte sem tratamento." },
  { id: "fragilizado", label: "Fragilizado", maxLevel: 3, color: C.goldDark, note: "Dano recebido +25% / +50% / +75%; penalidades crescentes fisicas e mentais." },
  { id: "queimando", label: "Queimadura", maxLevel: 3, color: C.corpoDark, note: "Curas -50% / -75% / -90%; nivel 3 pode inutilizar membro ou carbonizar." },
  { id: "congelado", label: "Congelamento", maxLevel: 3, color: C.menteDark, note: "Escala perda de movimento, dano continuo e imobilizacao total." },
  { id: "envenenado", label: "Envenenado", maxLevel: 3, color: "#7A8B63", note: "Escala de 1-3, 4-6 e 7-10 dano por turno com penalidades fisicas/mentais." },
];

const TRACKER_BINARY_CONDITIONS = [
  { id: "atordoado", label: "Atordoado", color: C.goldWarm, note: "Inabilitado por pelo menos 1 turno; penalidade maxima fisica e mental." },
  { id: "caido", label: "Caido", color: "#8A6A52", note: "Defesa reduzida ate levantar. Levantar exige Acao Menor." },
  { id: "imobilizado", label: "Imobilizado", color: C.muted, note: "Nao pode se deslocar ou fugir; -2 em testes." },
  { id: "paralisado", label: "Paralisado", color: C.alma, note: "Incapaz de agir fisicamente; pode tentar resistencia mental para recuperar mobilidade." },
];

const TRACKER_AIM_MODES = [
  { id: "none", label: "Sem mira", note: "Sem bonus acumulado." },
  { id: "quick", label: "Rapida (m)", note: "+1 acerto." },
  { id: "full", label: "Plena (M)", note: "+2 acerto e alvo especifico sem penalidade." },
  { id: "sustained", label: "Sustentada", note: "+1 acerto por turno acumulado e abre Abater melhorado." },
];

const TRACKER_ACTION_NOTES = [
  "M: ataque principal ou Manifestacao Completa.",
  "m: saque, item, recarga, manobra simples e Manifestacao Simples (1-3 keywords).",
  "Mv: deslocamento base (4 + PGI DEX) e Manifestacao Avancada (4-7 keywords).",
  "R: reacao para esquiva, bloqueio ou contra-ataque se perceber a acao.",
  "C: consome o turno inteiro para Manifestacoes Extremas (15+ keywords).",
];

/**
 * Clones staged condition values into mutable tracker state.
 * @param {object} stagesLike
 * @returns {object}
 */
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

/**
 * Parses a tracker numeric value with fallback.
 * @param {*} value
 * @param {number} fallback
 * @returns {number}
 */
function toTrackerNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

/**
 * Builds the combat tracker state for one fighter.
 * @param {object} char
 * @param {object} fighter
 * @param {object=} existing
 * @returns {object}
 */
function buildTrackerState(char, fighter, existing) {
  const current = existing || {};
  const isPC = !!(fighter && fighter.isPC);
  const activeConditions = fighter && Array.isArray(fighter.conds) ? fighter.conds : [];
  const spMax = isPC ? Math.max(1, Number(char.sp.max) || 100) : Math.max(1, Number(current.spMax) || 100);
  const peMax = isPC ? Math.max(0, Number(char.pe.max) || 0) : Math.max(0, Number(current.peMax) || 0);
  const maxOverdraft = isPC ? Math.floor(peMax / 2) : Math.max(0, Number(current.maxOverdraft) || 0);
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
    weaponName: current.weaponName || (isPC && char.loadout ? char.loadout.weaponName : "") || "",
    ammoCurrent: clampNumber(Number(current.ammoCurrent) || 0, 0, ammoMax),
    ammoMax,
    aimMode: TRACKER_AIM_MODES.some((mode) => mode.id === current.aimMode) ? current.aimMode : "none",
    sustainedAim: clampNumber(Number(current.sustainedAim) || 0, 0, 9),
    channelTurns: clampNumber(Number(current.channelTurns) || 0, 0, 5),
    channelPe: Math.max(0, toTrackerNumber(current.channelPe, 0)),
    stages,
  };
}

/**
 * Resolves HP pressure band metadata from current and maximum HP.
 * @param {number} current
 * @param {number} max
 * @returns {object}
 */
function getPressureBand(current, max) {
  const percent = getMeterPercent(current, max);
  if (current <= 0) {
    return {
      id: "incapacitado",
      label: "Incapacitado",
      color: C.danger,
      defensePenalty: -3,
      damagePenalty: 0,
      durationBonus: 0,
      note: "Sem acao confiavel. Exige estabilizacao, cena medica ou decisao do mestre.",
    };
  }
  if (percent <= 33) {
    return {
      id: "critico",
      label: "Critico",
      color: C.danger,
      defensePenalty: -2,
      damagePenalty: 2,
      durationBonus: 0,
      note: "1-33% HP: -2 Defesa, +2 dados recebidos e vulneravel a Execucao.",
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
      note: "34-66% HP: -1 Defesa, +1 dado recebido e estados duram +1 turno.",
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

/**
 * Resolves PE overdraft grade from current and maximum PE.
 * @param {number} peValue
 * @param {number} peMax
 * @returns {object}
 */
function getOverdraftState(peValue, peMax) {
  const overdraft = peValue < 0 ? Math.abs(peValue) : 0;
  const max = Math.max(1, Number(peMax) || 1);
  if (!overdraft) {
    return { amount: 0, label: "Estavel", color: C.muted, note: "Sem overdraft ativo." };
  }
  if (overdraft <= max / 10) {
    return { amount: overdraft, label: "Leve", color: C.goldDark, note: "Limite 1/10 do PE total. Descanso Longo recupera apenas 1/2." };
  }
  if (overdraft <= max / 3) {
    return { amount: overdraft, label: "Moderado", color: C.warning, note: "Limite 1/3 do PE total. Descanso Longo normal, mas reduz Overdraft/Exaustao em 1." };
  }
  return { amount: overdraft, label: "Severo", color: C.danger, note: "Limite 1/2 do PE total. Sem recuperacao no Descanso Longo." };
}

/**
 * Builds a compact defense/readiness snapshot for combat UI.
 * @param {object} char
 * @param {object} fighter
 * @param {object} tracker
 * @param {object} band
 * @returns {object}
 */
function getDefenseSnapshot(char, fighter, tracker, band) {
  const destrezaProg = fighter && fighter.isPC ? Number(char.subs.destreza.prog) || 0 : 0;
  const constituicaoProg = fighter && fighter.isPC ? Number(char.subs.constituicao.prog) || 0 : 0;
  const fragStage = tracker.stages.fragilizado.level;
  return {
    defenseCurrent: tracker.defenseBase + band.defensePenalty,
    rdFinal: tracker.rdCurrent,
    fragStage,
    dodgeFormula: fighter && fighter.isPC ? `${Number(char.pilares.corpo) || 0}d6 + PGI DEX ${destrezaProg}` : "Defina manualmente para este alvo",
    blockFormula: fighter && fighter.isPC ? `${Number(char.pilares.corpo) || 0}d6 + PGI CON ${constituicaoProg} + item` : "Defina manualmente para este alvo",
  };
}
