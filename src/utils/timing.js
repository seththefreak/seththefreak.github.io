/*
 * Audit refactor:
 * - Documented timeout bag lifecycle helpers.
 * - Kept timer cleanup centralized for the splash flow.
 * - Preserved existing timing behavior.
 */

/**
 * Creates a small disposable timeout registry.
 * @returns {{schedule: Function, cancel: Function, cancelAll: Function}}
 */
export function createTimerBag() {
  const timers = new Set();

  /**
   * Schedules a callback and removes it from the registry when fired.
   * @param {Function} callback
   * @param {number} delay
   * @returns {number}
   */
  function schedule(callback, delay) {
    const timerId = window.setTimeout(function runTimer() {
      timers.delete(timerId);
      callback();
    }, delay);
    timers.add(timerId);
    return timerId;
  }

  /**
   * Cancels one registered timer.
   * @param {number} timerId
   * @returns {void}
   */
  function cancel(timerId) {
    if (!timers.has(timerId)) return;
    window.clearTimeout(timerId);
    timers.delete(timerId);
  }

  /**
   * Cancels every registered timer.
   * @returns {void}
   */
  function cancelAll() {
    timers.forEach(function clearTimer(timerId) {
      window.clearTimeout(timerId);
    });
    timers.clear();
  }

  return {
    schedule,
    cancel,
    cancelAll,
  };
}
