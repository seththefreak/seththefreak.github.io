(function (global) {
  var utils = global.CompanionUtils || {};
  var systems = global.CompanionSystems || {};
  var ui = global.CompanionUI || (global.CompanionUI = {});

  var state = {
    activeSheet: null,
    sheetId: null,
    testPreset: 'atk',
    target: 12,
    bonus: 0,
    advantage: 0,
    lastCheck: null,
    damageMode: 'weapon',
    customFormula: '1d8',
    damageBonus: 0,
    targetRd: 0,
    lastDamage: null,
    newCombatantName: '',
    encounter: null,
  };

  function getHelpers() {
    return {
      resolveAttribute: typeof global.getAtributoEfetivo === 'function' ? global.getAtributoEfetivo : function () { return 0; },
      equipmentIndex: typeof global.EQUIPAMENTOS_INDEX !== 'undefined' ? global.EQUIPAMENTOS_INDEX : null,
    };
  }

  function getActiveSheet(sheet) {
    if (sheet) {
      state.activeSheet = sheet;
      state.sheetId = sheet.id || null;
      return sheet;
    }
    if (typeof global.getSheet === 'function' && global.currentSheetId) {
      var byCurrentId = global.getSheet(global.currentSheetId);
      if (byCurrentId) {
        state.activeSheet = byCurrentId;
        state.sheetId = byCurrentId.id || null;
        return byCurrentId;
      }
    }
    if (state.sheetId && typeof global.getSheet === 'function') {
      var byStateId = global.getSheet(state.sheetId);
      if (byStateId) {
        state.activeSheet = byStateId;
        return byStateId;
      }
    }
    if (state.activeSheet && state.activeSheet.id && typeof global.getSheet === 'function') {
      var byCachedId = global.getSheet(state.activeSheet.id);
      if (byCachedId) {
        state.activeSheet = byCachedId;
        state.sheetId = byCachedId.id || null;
        return byCachedId;
      }
    }
    state.activeSheet = null;
    state.sheetId = null;
    return null;
  }

  function syncEncounter(sheet) {
    var helpers = getHelpers();
    var pc = systems.Verloren.createSheetCombatant(sheet || {}, helpers);
    if (!state.encounter) {
      state.encounter = systems.Combat.createEncounter({ fighters: [pc] });
      return;
    }
    var current = systems.Combat.normalizeEncounter(state.encounter);
    var hasPc = current.fighters.some(function (fighter) { return fighter.isPC; });
    if (!hasPc) {
      state.encounter = systems.Combat.addCombatant(current, pc);
      return;
    }
    state.encounter = systems.Combat.normalizeEncounter(Object.assign({}, current, {
      fighters: current.fighters.map(function (fighter) {
        return fighter.isPC ? Object.assign({}, fighter, pc, { id: fighter.id || pc.id, isPC: true }) : fighter;
      }),
    }));
  }

  function renderTagList(values, color) {
    return values.map(function (value) {
      return '<span class="vw-tag" style="border-color:' + color + '40;color:' + color + ';background:' + color + '14;">' + utils.escapeHtml(value) + '</span>';
    }).join('');
  }

  function buildTurnSection() {
    var template = systems.Actions.resolveTemplate('verloren');
    var statuses = systems.Actions.getActionStatusList('verloren', state.encounter.flow);
    var quickActions = statuses.filter(function (item) { return item.id !== 'complete'; });
    var complete = statuses.find(function (item) { return item.id === 'complete'; });

    return [
      '<section class="vw-panel">',
      '<div class="vw-panel-head"><div><span class="vw-kicker">Turnos</span><h3>Economia de acoes</h3></div><button class="vw-button ghost" data-action="reset-turn">Resetar</button></div>',
      '<div class="vw-action-grid">',
      quickActions.map(function (action) {
        return '<button class="vw-action-pill' + (action.available ? ' is-open' : ' is-spent') + '" data-action="consume-turn" data-slot="' + action.id + '">' +
          '<span class="vw-action-code">' + action.code + '</span>' +
          '<span>' + action.label + '</span>' +
          '</button>';
      }).join(''),
      '</div>',
      '<div class="vw-complete-row">' +
        '<button class="vw-button accent' + (complete.available ? '' : ' disabled') + '" data-action="consume-turn" data-slot="complete"' + (complete.available ? '' : ' disabled') + '>Consumir C</button>' +
        '<span class="vw-inline-note">' + utils.escapeHtml(template.notes) + '</span>' +
      '</div>',
      '</section>',
    ].join('');
  }

  function buildTestSection(sheet, derived) {
    var preset = systems.Verloren.ROLL_PRESETS.find(function (item) { return item.id === state.testPreset; }) || systems.Verloren.ROLL_PRESETS[0];
    var presetValue = derived[preset.stat] || 0;
    var effectiveBonus = presetValue + state.bonus;
    var result = state.lastCheck;

    return [
      '<section class="vw-panel">',
      '<div class="vw-panel-head"><div><span class="vw-kicker">Rolagens</span><h3>Teste tatico</h3></div><span class="vw-inline-note">1d20 com suporte a [A]</span></div>',
      '<div class="vw-control-grid">',
      '<label class="vw-field"><span>Preset</span><select data-field="testPreset">' +
        systems.Verloren.ROLL_PRESETS.map(function (item) {
          return '<option value="' + item.id + '"' + (item.id === state.testPreset ? ' selected' : '') + '>' + item.label + '</option>';
        }).join('') +
      '</select></label>',
      '<label class="vw-field"><span>DT / DEF</span><input type="number" data-field="target" value="' + state.target + '" /></label>',
      '<label class="vw-field"><span>Ajuste</span><input type="number" data-field="bonus" value="' + state.bonus + '" /></label>',
      '<label class="vw-field"><span>[A]</span><input type="number" data-field="advantage" value="' + state.advantage + '" /></label>',
      '</div>',
      '<div class="vw-stat-strip">' +
        '<span class="vw-tag">Base ' + utils.escapeHtml(preset.label) + ': <strong>' + presetValue + '</strong></span>' +
        '<span class="vw-tag">Bonus efetivo: <strong>' + utils.formatSigned(effectiveBonus) + '</strong></span>' +
      '</div>',
      '<div class="vw-action-row"><button class="vw-button primary" data-action="roll-check">Rolar teste</button></div>',
      result ? (
        '<div class="vw-result-card">' +
          '<div class="vw-result-main">' +
            '<div><span class="vw-kicker">Rolagem</span><strong>' + result.keptRoll + '</strong></div>' +
            '<div><span class="vw-kicker">Total</span><strong>' + result.total + '</strong></div>' +
            '<div><span class="vw-kicker">Sucessos</span><strong>' + result.successes + '</strong></div>' +
          '</div>' +
          '<div class="vw-result-tags">' +
            renderTagList([
              'Rolos: ' + result.rolls.join(', '),
              result.success ? 'Sucesso' : 'Falha',
              result.critical ? 'Critico' : (result.criticalFailure ? 'Falha critica' : 'Resolucao padrao'),
              'Delta ' + utils.formatSigned(result.delta),
            ], result.success ? '#6ee7b7' : '#fda4af') +
          '</div>' +
        '</div>'
      ) : '',
      '</section>',
    ].join('');
  }

  function buildDamageSection(sheet, derived) {
    var helpers = getHelpers();
    var weaponFormula = systems.Verloren.getWeaponDamageFormula(sheet || {}, helpers);
    var attackValue = state.damageMode === 'magic' ? derived.PWR : derived.ATK_TOTAL;
    var baseFormula = state.damageMode === 'custom' ? state.customFormula : weaponFormula;
    var formulaData = systems.Verloren.applyDamageModifier(baseFormula, attackValue + state.damageBonus);
    var adjustedFormula = formulaData ? formulaData.adjustedFormula : baseFormula;
    var result = state.lastDamage;

    return [
      '<section class="vw-panel">',
      '<div class="vw-panel-head"><div><span class="vw-kicker">Combate</span><h3>Dano aplicado</h3></div><span class="vw-inline-note">ATK e PWR modulam os dados finais</span></div>',
      '<div class="vw-control-grid">',
      '<label class="vw-field"><span>Modo</span><select data-field="damageMode">' +
        '<option value="weapon"' + (state.damageMode === 'weapon' ? ' selected' : '') + '>Arma equipada</option>' +
        '<option value="magic"' + (state.damageMode === 'magic' ? ' selected' : '') + '>Manifestacao</option>' +
        '<option value="custom"' + (state.damageMode === 'custom' ? ' selected' : '') + '>Formula livre</option>' +
      '</select></label>',
      '<label class="vw-field"><span>Formula</span><input type="text" data-field="customFormula" value="' + utils.escapeHtml(state.customFormula) + '"' + (state.damageMode === 'custom' ? '' : ' disabled') + ' /></label>',
      '<label class="vw-field"><span>Ajuste</span><input type="number" data-field="damageBonus" value="' + state.damageBonus + '" /></label>',
      '<label class="vw-field"><span>RD alvo</span><input type="number" data-field="targetRd" value="' + state.targetRd + '" min="0" /></label>',
      '</div>',
      '<div class="vw-stat-strip">' +
        '<span class="vw-tag">Base: <strong>' + utils.escapeHtml(baseFormula) + '</strong></span>' +
        '<span class="vw-tag">Final: <strong>' + utils.escapeHtml(adjustedFormula) + '</strong></span>' +
        '<span class="vw-tag">' + (state.damageMode === 'magic' ? 'PWR' : 'ATK') + ': <strong>' + (attackValue + state.damageBonus) + '</strong></span>' +
      '</div>',
      '<div class="vw-action-row"><button class="vw-button primary" data-action="roll-damage">Rolar dano</button></div>',
      result ? (
        '<div class="vw-result-card">' +
          '<div class="vw-result-main">' +
            '<div><span class="vw-kicker">Bruto</span><strong>' + result.total + '</strong></div>' +
            '<div><span class="vw-kicker">Apos RD</span><strong>' + result.afterRd + '</strong></div>' +
            '<div><span class="vw-kicker">Rolos</span><strong>' + result.rolls.join(', ') + '</strong></div>' +
          '</div>' +
          '<div class="vw-result-tags">' +
            renderTagList([
              'Formula ' + result.formula,
              'Bonus ' + utils.formatSigned(result.attackValue),
              'RD ' + result.rd,
            ], '#7dd3fc') +
          '</div>' +
        '</div>'
      ) : '',
      '</section>',
    ].join('');
  }

  function buildTrackerSection() {
    var encounter = systems.Combat.normalizeEncounter(state.encounter);
    var activeId = encounter.activeId;
    var fightersHtml = encounter.fighters.map(function (fighter) {
      var isActive = fighter.id === activeId;
      var hpPercent = fighter.maxHp ? Math.round((fighter.hp / fighter.maxHp) * 100) : 0;
      return [
        '<article class="vw-combatant' + (isActive ? ' active' : '') + '">',
        '<div class="vw-combatant-head">',
        '<button class="vw-init-roll" data-action="roll-init" data-id="' + fighter.id + '">' + (fighter.init || '?') + '</button>',
        '<div><strong>' + utils.escapeHtml(fighter.name) + '</strong><span>' + (fighter.isPC ? 'Ficha ativa' : 'Combatente auxiliar') + '</span></div>',
        '<button class="vw-button ghost small" data-action="remove-combatant" data-id="' + fighter.id + '"' + (fighter.isPC ? ' disabled' : '') + '>x</button>',
        '</div>',
        '<div class="vw-hp-row"><span>HP ' + fighter.hp + '/' + fighter.maxHp + '</span><div class="vw-hp-controls">' +
          '<button class="vw-mini" data-action="hp" data-id="' + fighter.id + '" data-delta="-5">-5</button>' +
          '<button class="vw-mini" data-action="hp" data-id="' + fighter.id + '" data-delta="-1">-1</button>' +
          '<button class="vw-mini" data-action="hp" data-id="' + fighter.id + '" data-delta="1">+1</button>' +
          '<button class="vw-mini" data-action="hp" data-id="' + fighter.id + '" data-delta="5">+5</button>' +
        '</div></div>',
        '<div class="vw-hp-bar"><div style="width:' + hpPercent + '%;"></div></div>',
        '<div class="vw-tag-row">' + systems.Verloren.CONDITIONS.map(function (condition) {
          var active = fighter.conds.includes(condition.id);
          return '<button class="vw-tag-button' + (active ? ' active' : '') + '" style="--tag-color:' + condition.color + ';" data-action="toggle-condition" data-id="' + fighter.id + '" data-cond="' + condition.id + '">' + utils.escapeHtml(condition.label) + '</button>';
        }).join('') + '</div>',
        '</article>',
      ].join('');
    }).join('');

    return [
      '<section class="vw-panel vw-panel-wide">',
      '<div class="vw-panel-head"><div><span class="vw-kicker">Tracker</span><h3>Ordem de combate</h3></div><div class="vw-inline-stack"><span class="vw-tag">Rodada <strong>' + encounter.round + '</strong></span><button class="vw-button accent" data-action="next-turn">Proximo turno</button></div></div>',
      '<div class="vw-action-row"><button class="vw-button ghost" data-action="roll-all-init">Rolar iniciativa</button></div>',
      '<div class="vw-add-row"><input type="text" data-field="newCombatantName" value="' + utils.escapeHtml(state.newCombatantName) + '" placeholder="Novo combatente" /><button class="vw-button ghost" data-action="add-combatant">Adicionar</button></div>',
      '<div class="vw-combatant-grid">' + fightersHtml + '</div>',
      '</section>',
    ].join('');
  }

  function render(sheet) {
    var container = global.document.getElementById('verlorenSystemWorkbench');
    if (!container) return;

    var activeSheet = getActiveSheet(sheet);
    var helpers = getHelpers();
    var initiativeBase = activeSheet ? systems.Verloren.getInitiativeBase(activeSheet, helpers) : 0;
    var derived = activeSheet ? systems.Verloren.calculateDerived(activeSheet, helpers) : {
      ATK_TOTAL: 0,
      PWR: 0,
      WIL: 0,
      PER_TESTE: 0,
      INIC: 0,
    };

    if (activeSheet && state.sheetId !== activeSheet.id) {
      state.sheetId = activeSheet.id;
      state.lastCheck = null;
      state.lastDamage = null;
    }
    state.activeSheet = activeSheet;
    syncEncounter(activeSheet);

    container.innerHTML = [
      '<div class="verloren-workbench">',
      '<div class="vw-banner">',
      '<div><span class="vw-kicker">Workbench</span><h2>Rolagem, turnos e combate</h2><p>Base compartilhada com o companion unificado, sem sair da referencia do sistema.</p></div>',
      '<div class="vw-banner-meta">' +
        '<span class="vw-tag">' + (activeSheet ? 'Ficha ativa: <strong>' + utils.escapeHtml(activeSheet.name || 'Sem nome') + '</strong>' : 'Sem ficha ativa') + '</span>' +
        (activeSheet ? '<span class="vw-tag">ATK <strong>' + derived.ATK_TOTAL + '</strong></span><span class="vw-tag">PWR <strong>' + derived.PWR + '</strong></span><span class="vw-tag">INIC <strong>' + initiativeBase + '</strong></span>' : '') +
      '</div>',
      '</div>',
      '<div class="vw-grid">',
      buildTestSection(activeSheet, Object.assign({ INIC: initiativeBase }, derived)),
      buildTurnSection(),
      buildDamageSection(activeSheet, Object.assign({ INIC: initiativeBase }, derived)),
      '</div>',
      buildTrackerSection(),
      '</div>',
    ].join('');
  }

  function rerender() {
    render(getActiveSheet());
  }

  function updateField(field, value) {
    if (field === 'target' || field === 'bonus' || field === 'advantage' || field === 'damageBonus' || field === 'targetRd') {
      state[field] = Number(value) || 0;
      return;
    }
    state[field] = value;
  }

  function handleAction(action, data) {
    var sheet = getActiveSheet();
    var helpers = getHelpers();

    if (action === 'roll-check') {
      var derived = sheet ? systems.Verloren.calculateDerived(sheet, helpers) : {};
      var preset = systems.Verloren.ROLL_PRESETS.find(function (item) { return item.id === state.testPreset; }) || systems.Verloren.ROLL_PRESETS[0];
      var baseBonus = preset.stat === 'INIC'
        ? (sheet ? systems.Verloren.getInitiativeBase(sheet, helpers) : 0)
        : (derived[preset.stat] || 0);
      state.lastCheck = systems.Verloren.rollCheck({
        bonus: baseBonus + state.bonus,
        target: state.target,
        advantage: state.advantage,
      });
    }

    if (action === 'reset-turn') {
      state.encounter = Object.assign({}, systems.Combat.normalizeEncounter(state.encounter), {
        flow: systems.Turns.createTurnState(),
      });
    }

    if (action === 'consume-turn' && data.slot) {
      state.encounter = Object.assign({}, systems.Combat.normalizeEncounter(state.encounter), {
        flow: systems.Turns.consumeTurnAction(state.encounter.flow, data.slot, 'verloren'),
      });
    }

    if (action === 'roll-damage') {
      var derivedDamage = sheet ? systems.Verloren.calculateDerived(sheet, helpers) : { ATK_TOTAL: 0, PWR: 0 };
      var formula = state.damageMode === 'custom' ? state.customFormula : systems.Verloren.getWeaponDamageFormula(sheet || {}, helpers);
      var attackValue = (state.damageMode === 'magic' ? derivedDamage.PWR : derivedDamage.ATK_TOTAL) + state.damageBonus;
      var adjusted = systems.Verloren.applyDamageModifier(formula, attackValue);
      var roll = systems.Dice.rollFormula(adjusted ? adjusted.adjustedFormula : formula);
      if (roll) {
        state.lastDamage = {
          formula: roll.formula,
          total: roll.total,
          rolls: roll.rolls,
          attackValue: attackValue,
          rd: state.targetRd,
          afterRd: Math.max(0, roll.total - state.targetRd),
        };
      }
    }

    if (action === 'add-combatant') {
      var name = String(state.newCombatantName || '').trim() || 'Inimigo';
      state.encounter = systems.Combat.addCombatant(state.encounter, {
        name: name,
        hp: 40,
        maxHp: 40,
        init: 0,
        isPC: false,
      });
      state.newCombatantName = '';
    }

    if (action === 'remove-combatant' && data.id) {
      state.encounter = systems.Combat.removeCombatant(state.encounter, data.id);
    }

    if (action === 'roll-init' && data.id) {
      state.encounter = systems.Combat.rollInitiative(state.encounter, data.id, function (fighter) {
        if (!fighter.isPC || !sheet) return fighter.init || 0;
        return systems.Verloren.getInitiativeBase(sheet, helpers);
      }, { sides: 6 });
    }

    if (action === 'roll-all-init') {
      state.encounter = systems.Combat.rollAllInitiatives(state.encounter, function (fighter) {
        if (!fighter.isPC || !sheet) return fighter.init || 0;
        return systems.Verloren.getInitiativeBase(sheet, helpers);
      }, { sides: 6 });
    }

    if (action === 'next-turn') {
      state.encounter = systems.Combat.nextTurn(state.encounter);
    }

    if (action === 'hp' && data.id) {
      state.encounter = systems.Combat.changeCombatantHp(state.encounter, data.id, Number(data.delta) || 0);
      if (sheet) {
        var updated = systems.Combat.normalizeEncounter(state.encounter).fighters.find(function (fighter) {
          return fighter.id === data.id;
        });
        if (updated && updated.isPC) {
          sheet._recAtual = sheet._recAtual || {};
          sheet._recAtual.HP = updated.hp;
          if (typeof global.debounceSave === 'function') global.debounceSave();
        }
      }
    }

    if (action === 'toggle-condition' && data.id && data.cond) {
      state.encounter = systems.Combat.toggleCombatantCondition(state.encounter, data.id, data.cond);
    }

    rerender();
  }

  function bindEvents() {
    var container = global.document.getElementById('verlorenSystemWorkbench');
    if (!container || container.dataset.bound === '1') return;
    container.dataset.bound = '1';

    container.addEventListener('input', function (event) {
      var field = event.target.getAttribute('data-field');
      if (!field) return;
      updateField(field, event.target.value);
      if (field !== 'newCombatantName') rerender();
    });

    container.addEventListener('change', function (event) {
      var field = event.target.getAttribute('data-field');
      if (!field) return;
      updateField(field, event.target.value);
      rerender();
    });

    container.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-action]');
      if (!trigger) return;
      event.preventDefault();
      if (trigger.hasAttribute('disabled')) return;
      handleAction(trigger.getAttribute('data-action'), {
        id: trigger.getAttribute('data-id'),
        cond: trigger.getAttribute('data-cond'),
        slot: trigger.getAttribute('data-slot'),
        delta: trigger.getAttribute('data-delta'),
      });
    });
  }

  ui.renderVerlorenSystemWorkbench = function renderVerlorenSystemWorkbench(sheet) {
    bindEvents();
    render(sheet);
  };
})(window);
