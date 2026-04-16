(function (global) {
  var utils = global.CompanionUtils || {};
  var systems = global.CompanionSystems || (global.CompanionSystems = {});

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

  function rollDie(sides, rng) {
    var roller = typeof rng === 'function' ? rng : Math.random;
    return Math.floor(roller() * sides) + 1;
  }

  function rollPool(count, sides, rng) {
    var totalDice = Math.max(0, utils.toNumber(count, 0));
    return Array.from({ length: totalDice }, function () {
      return rollDie(Math.max(2, utils.toNumber(sides, 6)), rng);
    });
  }

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
