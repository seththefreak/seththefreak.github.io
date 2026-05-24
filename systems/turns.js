/*
 * Audit refactor:
 * - Documented standalone turn-state helpers for cached deployments.
 * - Kept slot names, availability defaults, and round progression unchanged.
 * - Preserved the legacy CompanionSystems.Turns export.
 */
(function (global) {
  var systems = global.CompanionSystems || (global.CompanionSystems = {});

  /**
   * Creates a full turn state, defaulting all slots to available.
   * @param {object=} initial
   * @returns {object}
   */
  function createTurnState(initial) {
    return Object.assign({
      major: true,
      utility: true,
      movement: true,
      reaction: true,
    }, initial || {});
  }

  /**
   * Resets turn slots while allowing caller overrides.
   * @param {object=} initial
   * @returns {object}
   */
  function resetTurnState(initial) {
    return createTurnState(initial);
  }

  /**
   * Toggles one known turn slot.
   * @param {object} turnState
   * @param {string} slotId
   * @returns {object}
   */
  function toggleTurnSlot(turnState, slotId) {
    var state = createTurnState(turnState);
    if (!(slotId in state)) return state;
    state[slotId] = !state[slotId];
    return state;
  }

  /**
   * Consumes all slots required by an action if currently available.
   * @param {object} turnState
   * @param {string} actionId
   * @param {string} templateId
   * @returns {object}
   */
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

  /**
   * Moves initiative to the next actor and advances the round after wraparound.
   * @param {number} activeIndex
   * @param {number} count
   * @param {number} round
   * @returns {{activeIndex: number, round: number}}
   */
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
