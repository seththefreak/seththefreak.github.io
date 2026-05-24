/*
 * Audit refactor:
 * - Documented standalone action helpers for cacheable GitHub Pages deployments.
 * - Kept all action labels, costs, thresholds, and colors unchanged.
 * - Preserved the legacy CompanionSystems.Actions export.
 */
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
      notes: 'A Acao Maior pode virar duas Acoes Menores. Movimento pode ser dividido; Reacao exige perceber a acao.',
      slots: [
        { id: 'major', code: 'M', label: 'Maior', desc: 'Ataques, Manifestacoes Completas e interacoes complexas.', consumes: ['major'], color: '#B45309' },
        { id: 'utility', code: 'm', label: 'Menor', desc: 'Manifestacoes Simples (1-3 keywords), sacar arma ou usar item.', consumes: ['utility'], color: '#BFA14A' },
        { id: 'movement', code: 'Mv', label: 'Movimento', desc: 'Deslocamento base e Manifestacoes Avancadas (4-7 keywords).', consumes: ['movement'], color: '#2C7F94' },
        { id: 'complete', code: 'C', label: 'Completa', desc: 'Consome o turno inteiro. Manifestacoes Extremas (15+ keywords).', consumes: ['major', 'utility', 'movement'], color: '#DC2626', derived: true },
        { id: 'reaction', code: 'R', label: 'Reacao', desc: 'Esquiva, bloqueio ou contra-ataque se perceber a acao.', consumes: ['reaction'], color: '#a78bfa' },
      ],
    },
    verloren: {
      id: 'verloren',
      notes: 'Traços e efeitos podem alterar gasto de slots sem mudar a espinha dorsal do turno.',
    },
  };

  /**
   * Resolves a turn-action template, falling back to the unified defaults.
   * @param {string} templateId
   * @returns {{id: string, notes: string, order: string[], slots: object[]}}
   */
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

  /**
   * Looks up one action by id in a template.
   * @param {string} templateId
   * @param {string} actionId
   * @returns {object | null}
   */
  function getAction(templateId, actionId) {
    return resolveTemplate(templateId).slots.find(function (slot) {
      return slot.id === actionId;
    }) || null;
  }

  /**
   * Checks whether an action can be paid from the current turn state.
   * @param {string} templateId
   * @param {string} actionId
   * @param {object} turnState
   * @returns {boolean}
   */
  function isActionAvailable(templateId, actionId, turnState) {
    var state = turnState || {};
    var action = getAction(templateId, actionId);
    if (!action) return false;
    return action.consumes.every(function (slotId) { return !!state[slotId]; });
  }

  /**
   * Returns all actions in a template with availability flags.
   * @param {string} templateId
   * @param {object} turnState
   * @returns {object[]}
   */
  function getActionStatusList(templateId, turnState) {
    var template = resolveTemplate(templateId);
    return template.slots.map(function (slot) {
      return Object.assign({}, slot, {
        available: isActionAvailable(templateId, slot.id, turnState),
      });
    });
  }

  /**
   * Resolves the first threshold whose max is at least the provided value.
   * @param {number} value
   * @param {{max: number}[]} thresholds
   * @returns {object | null}
   */
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
