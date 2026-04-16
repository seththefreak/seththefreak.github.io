(function (global) {
  var utils = global.CompanionUtils || {};
  var systems = global.CompanionSystems || (global.CompanionSystems = {});

  function createCombatant(data) {
    var source = data || {};
    var maxHp = Math.max(0, utils.toNumber(source.maxHp, utils.toNumber(source.hp, 0)));
    return {
      id: source.id || utils.createId('cmb'),
      name: source.name || 'Combatente',
      init: utils.toNumber(source.init, 0),
      hp: utils.clampNumber(utils.toNumber(source.hp, maxHp), 0, maxHp || Infinity),
      maxHp: maxHp,
      isPC: !!source.isPC,
      conds: utils.uniqueIds(source.conds || []),
    };
  }

  function sortCombatants(list) {
    return (Array.isArray(list) ? list : []).slice().sort(function (left, right) {
      if ((right.init || 0) !== (left.init || 0)) return (right.init || 0) - (left.init || 0);
      return String(left.name || '').localeCompare(String(right.name || ''), 'pt-BR');
    });
  }

  function createEncounter(config) {
    var source = config || {};
    var fighters = sortCombatants((source.fighters || []).map(createCombatant));
    return {
      fighters: fighters,
      activeId: source.activeId || (fighters[0] ? fighters[0].id : null),
      round: Math.max(1, utils.toNumber(source.round, 1)),
      flow: systems.Turns ? systems.Turns.createTurnState(source.flow) : source.flow,
    };
  }

  function normalizeEncounter(encounter) {
    var current = createEncounter(encounter);
    if (current.activeId && current.fighters.some(function (fighter) { return fighter.id === current.activeId; })) {
      return current;
    }
    return Object.assign({}, current, {
      activeId: current.fighters[0] ? current.fighters[0].id : null,
    });
  }

  function mapFighters(encounter, mapper) {
    var current = normalizeEncounter(encounter);
    return normalizeEncounter(Object.assign({}, current, {
      fighters: current.fighters.map(mapper),
    }));
  }

  function addCombatant(encounter, data) {
    var current = normalizeEncounter(encounter);
    var fighter = createCombatant(data);
    return normalizeEncounter(Object.assign({}, current, {
      fighters: current.fighters.concat(fighter),
      activeId: current.activeId || fighter.id,
    }));
  }

  function removeCombatant(encounter, id) {
    var current = normalizeEncounter(encounter);
    var fighters = current.fighters.filter(function (fighter) { return fighter.id !== id; });
    return normalizeEncounter(Object.assign({}, current, {
      fighters: fighters,
      activeId: current.activeId === id ? (fighters[0] ? fighters[0].id : null) : current.activeId,
    }));
  }

  function changeCombatantHp(encounter, id, delta) {
    return mapFighters(encounter, function (fighter) {
      if (fighter.id !== id) return fighter;
      return Object.assign({}, fighter, {
        hp: utils.clampNumber(fighter.hp + utils.toNumber(delta, 0), 0, fighter.maxHp),
      });
    });
  }

  function toggleCombatantCondition(encounter, id, conditionId) {
    return mapFighters(encounter, function (fighter) {
      if (fighter.id !== id) return fighter;
      var conds = fighter.conds.includes(conditionId)
        ? fighter.conds.filter(function (value) { return value !== conditionId; })
        : fighter.conds.concat(conditionId);
      return Object.assign({}, fighter, { conds: utils.uniqueIds(conds) });
    });
  }

  function rollInitiative(encounter, fighterId, bonusResolver, options) {
    var config = options || {};
    var sides = Math.max(2, utils.toNumber(config.sides, 6));
    return normalizeEncounter(Object.assign({}, normalizeEncounter(encounter), {
      fighters: sortCombatants(normalizeEncounter(encounter).fighters.map(function (fighter) {
        if (fighter.id !== fighterId) return fighter;
        var bonus = typeof bonusResolver === 'function' ? utils.toNumber(bonusResolver(fighter), 0) : utils.toNumber(bonusResolver, 0);
        var init = systems.Dice.rollDie(sides, config.rng) + bonus;
        return Object.assign({}, fighter, { init: init });
      })),
    }));
  }

  function rollAllInitiatives(encounter, bonusResolver, options) {
    var config = options || {};
    var sides = Math.max(2, utils.toNumber(config.sides, 6));
    return normalizeEncounter(Object.assign({}, normalizeEncounter(encounter), {
      fighters: sortCombatants(normalizeEncounter(encounter).fighters.map(function (fighter) {
        var bonus = typeof bonusResolver === 'function' ? utils.toNumber(bonusResolver(fighter), 0) : utils.toNumber(bonusResolver, 0);
        var init = systems.Dice.rollDie(sides, config.rng) + bonus;
        return Object.assign({}, fighter, { init: init });
      })),
    }));
  }

  function nextTurn(encounter) {
    var current = normalizeEncounter(encounter);
    if (!current.fighters.length) return current;
    var currentIndex = current.fighters.findIndex(function (fighter) { return fighter.id === current.activeId; });
    var next = systems.Turns.advanceTurn(currentIndex < 0 ? 0 : currentIndex, current.fighters.length, current.round);
    return normalizeEncounter(Object.assign({}, current, {
      activeId: current.fighters[next.activeIndex].id,
      round: next.round,
      flow: systems.Turns.createTurnState(),
    }));
  }

  systems.Combat = Object.assign({}, systems.Combat, {
    createCombatant: createCombatant,
    sortCombatants: sortCombatants,
    createEncounter: createEncounter,
    normalizeEncounter: normalizeEncounter,
    addCombatant: addCombatant,
    removeCombatant: removeCombatant,
    changeCombatantHp: changeCombatantHp,
    toggleCombatantCondition: toggleCombatantCondition,
    rollInitiative: rollInitiative,
    rollAllInitiatives: rollAllInitiatives,
    nextTurn: nextTurn,
  });
})(window);
