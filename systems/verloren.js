(function (global) {
  var utils = global.CompanionUtils || {};
  var systems = global.CompanionSystems || (global.CompanionSystems = {});

  var VERLOREN_CONDITIONS = [
    { id: 'apreensivo', label: 'Apreensivo', color: '#BFA14A', desc: '-1 em todos os testes por poucos turnos.' },
    { id: 'apavorado', label: 'Apavorado', color: '#B45309', desc: '-4 em testes e tende a fugir ou se proteger.' },
    { id: 'imobilizado', label: 'Imobilizado', color: '#A55A6B', desc: 'Sem deslocamento e -2 em testes fisicos.' },
    { id: 'paralisado', label: 'Paralisado', color: '#2C7F94', desc: 'Nao executa acoes fisicas ate encerrar o efeito.' },
    { id: 'atordoado', label: 'Atordoado', color: '#C09C45', desc: 'Perde a proxima acao maior ou o proprio turno.' },
    { id: 'sangramento1', label: 'Sangramento 1', color: '#ef4444', desc: '1 dano por turno e leve queda de foco.' },
    { id: 'sangramento2', label: 'Sangramento 2', color: '#dc2626', desc: '2-4 dano por turno ate estancar.' },
    { id: 'hemorragia', label: 'Hemorragia', color: '#991b1b', desc: 'Dano severo por turno e risco real de queda.' },
    { id: 'vulneravel', label: 'Vulneravel', color: '#9A5C7E', desc: '+50% dano recebido e defesa reduzida.' },
    { id: 'estado-critico', label: 'Estado Critico', color: '#ffffff', desc: 'Letalidade elevada e necessidade de estabilizacao.' },
    { id: 'assombro1', label: 'Assombro 1', color: '#8b5cf6', desc: 'Recupera 10% do dano causado como vida.' },
    { id: 'assombro2', label: 'Assombro 2', color: '#7c3aed', desc: 'Recupera 20% e causa dano sombrio por turno.' },
    { id: 'assombro3', label: 'Assombro 3', color: '#6d28d9', desc: 'Sem cura magica e falhas automaticas de VON.' },
  ];

  var VERLOREN_ROLL_PRESETS = [
    { id: 'atk', label: 'Ataque', stat: 'ATK_TOTAL' },
    { id: 'pwr', label: 'Magia', stat: 'PWR' },
    { id: 'wil', label: 'Vontade', stat: 'WIL' },
    { id: 'per', label: 'Percepcao', stat: 'PER_TESTE' },
    { id: 'ini', label: 'Iniciativa', stat: 'INIC' },
  ];

  function getResolveAttribute(helpers) {
    return helpers && typeof helpers.resolveAttribute === 'function'
      ? helpers.resolveAttribute
      : function () { return 0; };
  }

  function ev(sheet, attr, helpers) {
    var value = getResolveAttribute(helpers)(sheet, attr);
    return value === -Infinity ? -3 : (value || 0);
  }

  function safe(value) {
    return value > 0 ? value : 0;
  }

  function pen(value) {
    return value < 0 ? value : 0;
  }

  function resolveWeapon(sheet, helpers) {
    var equipmentIndex = helpers && helpers.equipmentIndex;
    if (!sheet || !sheet.equipamento || !equipmentIndex) return null;
    var slots = ['maoDireita', 'maoEsquerda'];
    for (var index = 0; index < slots.length; index += 1) {
      var slot = slots[index];
      var weaponId = sheet.equipamento[slot];
      if (!weaponId || weaponId === '__locked_2h__') continue;
      var weapon = equipmentIndex.get(weaponId);
      if (weapon && weapon.tipo === 'arma') {
        return { slot: slot, weapon: weapon };
      }
    }
    return null;
  }

  function getEquipBonus(sheet, field, helpers) {
    var equipmentIndex = helpers && helpers.equipmentIndex;
    if (!sheet || !sheet.equipamento || !equipmentIndex) return 0;
    return Object.values(sheet.equipamento).reduce(function (sum, itemId) {
      if (!itemId || itemId === '__locked_2h__') return sum;
      var item = equipmentIndex.get(itemId);
      return sum + (item && item[field] ? item[field] : 0);
    }, 0);
  }

  function getWeaponFactors(sheet, helpers) {
    var activeWeapon = resolveWeapon(sheet, helpers);
    if (!activeWeapon) return { w: 0.5, p: 0.5, weapon: null };
    var weapon = activeWeapon.weapon;
    var weight = utils.toNumber(weapon.peso, 1.4);
    var normalizedWeight = utils.clampNumber((weight - 0.4) / (3.0 - 0.4), 0, 1);
    var damageType = String(weapon.tipoDano || '').toLowerCase();
    var powerBias = 0.5;
    if (damageType.includes('impacto')) powerBias = 0.85;
    else if (damageType.includes('perf')) powerBias = 0.35;
    else if (damageType.includes('corte')) powerBias = 0.55;
    else if (damageType.includes('lacer')) powerBias = 0.6;
    else if (damageType.includes('mag')) powerBias = 0.0;
    return { w: normalizedWeight, p: powerBias, weapon: weapon };
  }

  function getWeaponDamageFormula(sheet, helpers) {
    var activeWeapon = resolveWeapon(sheet, helpers);
    if (!activeWeapon) return '1d6';
    var weapon = activeWeapon.weapon;
    var rawFormula = String(weapon.dado || '1d6');
    if (!rawFormula.includes('/')) return rawFormula;
    var variants = rawFormula.split('/').map(function (value) { return value.trim(); });
    var gripState = sheet && sheet.empunhaduraAtiva ? sheet.empunhaduraAtiva[activeWeapon.slot] : null;
    var gripCode = gripState || String(weapon.empunhadura || '').split('/')[0];
    return gripCode === '2M' ? (variants[1] || variants[0]) : variants[0];
  }

  function calcHP(sheet, helpers) {
    var level = sheet.nivel || 1;
    var vida = ev(sheet, 'VIDA', helpers);
    var con = ev(sheet, 'CON', helpers);
    return Math.round(
      30
      + 0.7 * Math.pow(safe(vida), 2) + 2 * safe(vida) + 4 * pen(vida)
      + 0.5 * Math.pow(safe(con), 2) + 2 * safe(con) + 3 * pen(con)
      + (level - 1) * (2 * safe(con) + safe(vida))
    );
  }

  function calcSP(sheet, helpers) {
    var level = sheet.nivel || 1;
    var con = ev(sheet, 'CON', helpers);
    var agi = ev(sheet, 'AGI', helpers);
    return Math.round(
      20
      + 0.5 * Math.pow(safe(con), 2) + 2 * safe(con) + 3 * pen(con)
      + agi
      + (level - 1) * (safe(con) + agi)
    );
  }

  function calcMP(sheet, helpers) {
    var level = sheet.nivel || 1;
    var mag = ev(sheet, 'MAG', helpers);
    var intel = ev(sheet, 'INT', helpers);
    return Math.round(
      20
      + 0.6 * Math.pow(safe(mag), 2) + 2 * safe(mag) + 3 * pen(mag)
      + 0.4 * Math.pow(safe(intel), 2) + 2 * safe(intel) + 2 * pen(intel)
      + (level - 1) * (safe(mag) + safe(intel))
    );
  }

  function calcSAN(sheet, helpers) {
    var level = sheet.nivel || 1;
    var von = ev(sheet, 'VON', helpers);
    var sab = ev(sheet, 'SAB', helpers);
    return Math.round(
      25
      + 0.8 * Math.pow(safe(von), 2) + 2 * safe(von) + 3 * pen(von)
      + sab
      + (level - 1) * safe(von)
    );
  }

  function calcMV(sheet, helpers) {
    var level = sheet.nivel || 1;
    var agi = ev(sheet, 'AGI', helpers);
    return Math.floor(4 + agi + Math.floor(3 * Math.log(safe(agi) + 1) / Math.log(11)) + level / 6);
  }

  function calcEV(sheet, helpers) {
    var level = sheet.nivel || 1;
    var des = ev(sheet, 'DES', helpers);
    var agi = ev(sheet, 'AGI', helpers);
    return Math.floor(des + Math.floor(4 * Math.log(safe(agi) + 1) / Math.log(11)) + level / 6);
  }

  function calcBLK(sheet, helpers) {
    return Math.floor((ev(sheet, 'FOR', helpers) + ev(sheet, 'DES', helpers)) / 10);
  }

  function calcDEF_TOTAL(sheet, helpers) {
    var con = ev(sheet, 'CON', helpers);
    var forca = ev(sheet, 'FOR', helpers);
    var defBase = ev(sheet, 'DEF', helpers);
    return defBase + Math.floor((con + forca) / 6) + getEquipBonus(sheet, 'ca', helpers);
  }

  function calcMR_TOTAL(sheet, helpers) {
    var von = ev(sheet, 'VON', helpers);
    var con = ev(sheet, 'CON', helpers);
    var resmBase = ev(sheet, 'RESM', helpers);
    return resmBase + Math.floor((von + con) / 6) + getEquipBonus(sheet, 'rm', helpers);
  }

  function calcATK_TOTAL(sheet, helpers) {
    var atkBase = ev(sheet, 'ATQ', helpers);
    var des = ev(sheet, 'DES', helpers);
    var forca = ev(sheet, 'FOR', helpers);
    var factors = getWeaponFactors(sheet, helpers);
    var inner = safe((1 - factors.p) * des + factors.p * forca);
    return Math.round(atkBase + factors.w * Math.floor(5 * Math.log(inner + 1) / Math.log(11)));
  }

  function calcPWR(sheet, helpers) {
    var mag = ev(sheet, 'MAG', helpers);
    var intel = ev(sheet, 'INT', helpers);
    return mag + Math.floor(5 * Math.log(safe(mag + intel) + 1) / Math.log(11));
  }

  function calcWIL(sheet, helpers) {
    var level = sheet.nivel || 1;
    var von = ev(sheet, 'VON', helpers);
    var con = ev(sheet, 'CON', helpers);
    return Math.floor(von + Math.floor(3 * Math.log(safe(von + con) + 1) / Math.log(11)) + level / 6);
  }

  function calcPER_TESTE(sheet, helpers) {
    var per = ev(sheet, 'PER', helpers);
    var sab = ev(sheet, 'SAB', helpers);
    var agi = ev(sheet, 'AGI', helpers);
    return per + Math.floor(3 * Math.log(safe(sab + agi) + 1) / Math.log(11));
  }

  function calcLK(sheet, helpers) {
    return 10 + ev(sheet, 'CAR', helpers) + Math.floor(ev(sheet, 'SAB', helpers) / 2);
  }

  function calculateDerived(sheet, helpers) {
    return {
      HP: calcHP(sheet, helpers),
      SP: calcSP(sheet, helpers),
      MP: calcMP(sheet, helpers),
      SAN: calcSAN(sheet, helpers),
      MV: calcMV(sheet, helpers),
      EV: calcEV(sheet, helpers),
      BLK: calcBLK(sheet, helpers),
      DEF_TOTAL: calcDEF_TOTAL(sheet, helpers),
      MR_TOTAL: calcMR_TOTAL(sheet, helpers),
      ATK_TOTAL: calcATK_TOTAL(sheet, helpers),
      PWR: calcPWR(sheet, helpers),
      WIL: calcWIL(sheet, helpers),
      PER_TESTE: calcPER_TESTE(sheet, helpers),
      LK: calcLK(sheet, helpers),
    };
  }

  function resolveDamageModifier(attackValue) {
    var value = utils.toNumber(attackValue, 0);
    if (value <= -6) return { diceDelta: -2, stepDelta: 0 };
    if (value <= -3) return { diceDelta: -1, stepDelta: 0 };
    if (value <= -1) return { diceDelta: 0, stepDelta: -1 };
    if (value <= 2) return { diceDelta: 0, stepDelta: 0 };
    if (value <= 5) return { diceDelta: 1, stepDelta: 0 };
    if (value <= 8) return { diceDelta: 2, stepDelta: 0 };
    if (value <= 11) return { diceDelta: 3, stepDelta: 0 };
    return { diceDelta: 4, stepDelta: 0 };
  }

  function applyDamageModifier(formula, attackValue) {
    var parsed = systems.Dice.parseDiceFormula(formula);
    if (!parsed) return null;
    var modifier = resolveDamageModifier(attackValue);
    var count = parsed.count + modifier.diceDelta;
    var stepDelta = modifier.stepDelta;
    if (count < 1) {
      stepDelta += count - 1;
      count = 1;
    }
    var sides = stepDelta ? systems.Dice.shiftDiceSides(parsed.sides, stepDelta) : parsed.sides;
    return {
      baseFormula: parsed.formula,
      adjustedFormula: count + 'd' + sides + (parsed.bonus ? (parsed.bonus > 0 ? '+' + parsed.bonus : parsed.bonus) : ''),
      modifier: modifier,
    };
  }

  function rollCheck(config) {
    var settings = config || {};
    var bonus = utils.toNumber(settings.bonus, 0);
    var target = utils.toNumber(settings.target, 10);
    var roll = systems.Dice.rollWithAdvantage({
      sides: settings.sides || 20,
      advantage: settings.advantage || 0,
      bonus: bonus,
      rng: settings.rng,
    });
    var delta = roll.total - target;
    var successes = delta >= 5 || roll.keptRoll === roll.sides ? 2 : (delta >= 0 ? 1 : 0);
    return Object.assign({}, roll, {
      target: target,
      success: delta >= 0,
      successes: successes,
      critical: roll.keptRoll === roll.sides,
      criticalFailure: roll.keptRoll === 1,
      delta: delta,
    });
  }

  function getInitiativeBase(sheet, helpers) {
    return ev(sheet, 'PER', helpers) + ev(sheet, 'AGI', helpers);
  }

  function createSheetCombatant(sheet, helpers) {
    var derived = calculateDerived(sheet, helpers);
    var currentHp = sheet && sheet._recAtual && sheet._recAtual.HP !== undefined
      ? sheet._recAtual.HP
      : derived.HP;
    return systems.Combat.createCombatant({
      id: sheet && sheet.id ? 'sheet-' + sheet.id : utils.createId('ver-sheet'),
      name: (sheet && sheet.name) || 'Ficha ativa',
      hp: currentHp,
      maxHp: derived.HP,
      init: getInitiativeBase(sheet || {}, helpers),
      isPC: true,
      conds: [],
    });
  }

  systems.Verloren = Object.assign({}, systems.Verloren, {
    CONDITIONS: VERLOREN_CONDITIONS,
    ROLL_PRESETS: VERLOREN_ROLL_PRESETS,
    getEquipBonus: getEquipBonus,
    getWeaponFactors: getWeaponFactors,
    getWeaponDamageFormula: getWeaponDamageFormula,
    calcHP: calcHP,
    calcSP: calcSP,
    calcMP: calcMP,
    calcSAN: calcSAN,
    calcMV: calcMV,
    calcEV: calcEV,
    calcBLK: calcBLK,
    calcDEF_TOTAL: calcDEF_TOTAL,
    calcMR_TOTAL: calcMR_TOTAL,
    calcATK_TOTAL: calcATK_TOTAL,
    calcPWR: calcPWR,
    calcWIL: calcWIL,
    calcPER_TESTE: calcPER_TESTE,
    calcLK: calcLK,
    calculateDerived: calculateDerived,
    resolveDamageModifier: resolveDamageModifier,
    applyDamageModifier: applyDamageModifier,
    rollCheck: rollCheck,
    getInitiativeBase: getInitiativeBase,
    createSheetCombatant: createSheetCombatant,
  });
})(window);
