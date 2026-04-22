(function (global) {
  var systems = global.CompanionSystems || (global.CompanionSystems = {});

  var ACTION_PRESETS = {
    unified: {
      id: 'unified',
      notes: 'Falas curtas e microinteracoes continuam livres quando fizer sentido narrativo.',
      order: ['major', 'utility', 'movement', 'complete', 'reaction'],
      slots: [
        { id: 'major', code: 'M', label: 'Maior', desc: 'Golpes pesados, tecnicas amplas e interacoes complexas.', consumes: ['major'], color: '#B45309' },
        { id: 'utility', code: 'u', label: 'Utilidade', desc: 'Itens, saques, suporte rapido e manobras simples.', consumes: ['utility'], color: '#BFA14A' },
        { id: 'movement', code: 'mov', label: 'Movimento', desc: 'Deslocamento, reposicionamento e cobertura.', consumes: ['movement'], color: '#2C7F94' },
        { id: 'complete', code: 'C', label: 'Completa', desc: 'Consome M + u + mov no mesmo turno.', consumes: ['major', 'utility', 'movement'], color: '#DC2626', derived: true },
        { id: 'reaction', code: 'R', label: 'Reacao', desc: 'Esquiva, bloqueio, contra-medida ou interceptacao.', consumes: ['reaction'], color: '#a78bfa' },
      ],
    },
    era: {
      id: 'era',
      notes: 'Manifestacoes extremas fecham o turno e reacoes seguem 1 por rodada.',
    },
    verloren: {
      id: 'verloren',
      notes: 'TraÃ§os e efeitos podem alterar gasto de slots sem mudar a espinha dorsal do turno.',
    },
  };

  function resolveTemplate(templateId) {
    var preset = ACTION_PRESETS[templateId] || ACTION_PRESETS.unified;
    var unified = ACTION_PRESETS.unified;
    return {
      id: preset.id,
      notes: preset.notes || unified.notes,
      order: (preset.order || unified.order).slice(),
      slots: (preset.slots || unified.slots).map(function (slot) { return Object.assign({}, slot); }),
    };
  }

  function getAction(templateId, actionId) {
    return resolveTemplate(templateId).slots.find(function (slot) {
      return slot.id === actionId;
    }) || null;
  }

  function isActionAvailable(templateId, actionId, turnState) {
    var state = turnState || {};
    var action = getAction(templateId, actionId);
    if (!action) return false;
    return action.consumes.every(function (slotId) { return !!state[slotId]; });
  }

  function getActionStatusList(templateId, turnState) {
    var template = resolveTemplate(templateId);
    return template.slots.map(function (slot) {
      return Object.assign({}, slot, {
        available: isActionAvailable(templateId, slot.id, turnState),
      });
    });
  }

  function getThresholdAction(value, thresholds) {
    var total = Math.max(0, Number(value) || 0);
    return (Array.isArray(thresholds) ? thresholds : []).find(function (item) {
      return total <= item.max;
    }) || (thresholds && thresholds.length ? thresholds[thresholds.length - 1] : null);
  }

  systems.Actions = Object.assign({}, systems.Actions, {
    ACTION_PRESETS: ACTION_PRESETS,
    resolveTemplate: resolveTemplate,
    getAction: getAction,
    isActionAvailable: isActionAvailable,
    getActionStatusList: getActionStatusList,
    getThresholdAction: getThresholdAction,
  });
})(window);

(function (global) {
  var systems = global.CompanionSystems || (global.CompanionSystems = {});

  function createTurnState(initial) {
    return Object.assign({
      major: true,
      utility: true,
      movement: true,
      reaction: true,
    }, initial || {});
  }

  function resetTurnState(initial) {
    return createTurnState(initial);
  }

  function toggleTurnSlot(turnState, slotId) {
    var state = createTurnState(turnState);
    if (!(slotId in state)) return state;
    state[slotId] = !state[slotId];
    return state;
  }

  function consumeTurnAction(turnState, actionId, templateId) {
    var state = createTurnState(turnState);
    var action = systems.Actions && systems.Actions.getAction(templateId, actionId);
    if (!action) return state;
    if (!(systems.Actions && systems.Actions.isActionAvailable(templateId, actionId, state))) return state;
    action.consumes.forEach(function (slotId) {
      state[slotId] = false;
    });
    return state;
  }

  function advanceTurn(activeIndex, count, round) {
    var total = Math.max(0, Number(count) || 0);
    if (!total) return { activeIndex: 0, round: Math.max(1, Number(round) || 1) };
    var nextIndex = (Math.max(0, Number(activeIndex) || 0) + 1) % total;
    return {
      activeIndex: nextIndex,
      round: (Math.max(1, Number(round) || 1)) + (nextIndex === 0 ? 1 : 0),
    };
  }

  systems.Turns = Object.assign({}, systems.Turns, {
    createTurnState: createTurnState,
    resetTurnState: resetTurnState,
    toggleTurnSlot: toggleTurnSlot,
    consumeTurnAction: consumeTurnAction,
    advanceTurn: advanceTurn,
  });
})(window);
