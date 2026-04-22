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
