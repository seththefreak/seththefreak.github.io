/*
 * Audit refactor:
 * - Added JSDoc for shared dice helpers used by ERA and legacy systems.
 * - Guarded custom RNG edge cases so a value of 1 cannot roll above die size.
 * - Kept Math.random distributions and formula behavior unchanged for normal play.
 */
(function (global) {
  var utils = global.CompanionUtils || {};
  var systems = global.CompanionSystems || (global.CompanionSystems = {});

  /**
   * Parses NdS+B style formulas into normalized dice data.
   * @param {string} formula
   * @returns {{count: number, sides: number, bonus: number, formula: string} | null}
   */
  function parseDiceFormula(formula) {
    var raw = String(formula || '').replace(/\s+/g, '').toLowerCase();
    var match = raw.match(/^(\d*)d(\d+)([+-]\d+)?$/);
    if (!match) return null;
    var count = Math.max(1, utils.toNumber(match[1] || 1, 1));
    var sides = Math.max(2, utils.toNumber(match[2], 6));
    var bonus = utils.toNumber(match[3] || 0, 0);
    var normalized = count + 'd' + sides + (bonus ? (bonus > 0 ? '+' + bonus : bonus) : '');
    return { count: count, sides: sides, bonus: bonus, formula: normalized };
  }

  /**
   * Rolls one die with an injectable RNG for deterministic tests.
   * @param {number} sides
   * @param {Function=} rng
   * @returns {number}
   */
  function rollDie(sides, rng) {
    var roller = typeof rng === 'function' ? rng : Math.random;
    var sample = Math.max(0, Math.min(Number(roller()) || 0, 0.9999999999999999));
    return Math.floor(sample * sides) + 1;
  }

  /**
   * Rolls a pool of dice.
   * @param {number} count
   * @param {number} sides
   * @param {Function=} rng
   * @returns {number[]}
   */
  function rollPool(count, sides, rng) {
    var totalDice = Math.max(0, utils.toNumber(count, 0));
    return Array.from({ length: totalDice }, function () {
      return rollDie(Math.max(2, utils.toNumber(sides, 6)), rng);
    });
  }

  /**
   * Rolls a pool and totals only the highest die plus modifier.
   * @param {number} count
   * @param {number} sides
   * @param {number} modifier
   * @param {Function=} rng
   * @returns {{dice: number[], highestDie: number, modifier: number, total: number}}
   */
  function rollPoolHighest(count, sides, modifier, rng) {
    var dice = rollPool(count, sides, rng);
    var highestDie = utils.best(dice);
    return {
      dice: dice,
      highestDie: highestDie,
      modifier: utils.toNumber(modifier, 0),
      total: highestDie + utils.toNumber(modifier, 0),
    };
  }

  /**
   * Rolls a parsed or string dice formula.
   * @param {string | {count: number, sides: number, bonus: number, formula: string}} formula
   * @param {Function=} rng
   * @returns {{formula: string, count: number, sides: number, bonus: number, rolls: number[], total: number} | null}
   */
  function rollFormula(formula, rng) {
    var parsed = typeof formula === 'string' ? parseDiceFormula(formula) : formula;
    if (!parsed) return null;
    var rolls = rollPool(parsed.count, parsed.sides, rng);
    var total = rolls.reduce(function (sum, value) { return sum + value; }, 0) + parsed.bonus;
    return {
      formula: parsed.formula,
      count: parsed.count,
      sides: parsed.sides,
      bonus: parsed.bonus,
      rolls: rolls,
      total: total,
    };
  }

  /**
   * Rolls a formula multiple times and returns the highest total.
   * @param {string | object} formula
   * @param {number} attempts
   * @param {Function=} rng
   * @returns {{formula: string, attempts: object[], best: object} | null}
   */
  function rollBestOf(formula, attempts, rng) {
    var totalAttempts = Math.max(1, utils.toNumber(attempts, 2));
    var results = Array.from({ length: totalAttempts }, function () {
      return rollFormula(formula, rng);
    }).filter(Boolean);
    if (!results.length) return null;
    var bestResult = results.reduce(function (best, current) {
      return !best || current.total > best.total ? current : best;
    }, null);
    return {
      formula: bestResult.formula,
      attempts: results,
      best: bestResult,
    };
  }

  /**
   * Rolls one die plus extra dice for advantage/disadvantage and keeps one result.
   * @param {{advantage?: number, sides?: number, rng?: Function, bonus?: number}} config
   * @returns {{sides: number, advantage: number, rolls: number[], keptRoll: number, total: number, bonus: number}}
   */
  function rollWithAdvantage(config) {
    var settings = config || {};
    var advantage = utils.toNumber(settings.advantage, 0);
    var sides = Math.max(2, utils.toNumber(settings.sides, 20));
    var poolSize = 1 + Math.abs(advantage);
    var rolls = rollPool(poolSize, sides, settings.rng);
    var keptRoll = advantage < 0 ? Math.min.apply(Math, rolls) : Math.max.apply(Math, rolls);
    return {
      sides: sides,
      advantage: advantage,
      rolls: rolls,
      keptRoll: keptRoll,
      total: keptRoll + utils.toNumber(settings.bonus, 0),
      bonus: utils.toNumber(settings.bonus, 0),
    };
  }

  /**
   * Moves a die size along the local d4-d12 ladder.
   * @param {number} sides
   * @param {number} delta
   * @returns {number}
   */
  function shiftDiceSides(sides, delta) {
    var ladder = [4, 6, 8, 10, 12];
    var currentIndex = ladder.indexOf(utils.toNumber(sides, 6));
    if (currentIndex === -1) currentIndex = 1;
    var nextIndex = utils.clampNumber(currentIndex + utils.toNumber(delta, 0), 0, ladder.length - 1);
    return ladder[nextIndex];
  }

  systems.Dice = Object.assign({}, systems.Dice, {
    parseDiceFormula: parseDiceFormula,
    rollDie: rollDie,
    rollPool: rollPool,
    rollPoolHighest: rollPoolHighest,
    rollFormula: rollFormula,
    rollBestOf: rollBestOf,
    rollWithAdvantage: rollWithAdvantage,
    shiftDiceSides: shiftDiceSides,
  });
})(window);
