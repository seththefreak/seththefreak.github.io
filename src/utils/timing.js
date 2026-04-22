/*
 * Responsibility: centralize timeout creation and disposal for splash orchestration.
 * Exports: createTimerBag.
 */

export function createTimerBag() {
  const timers = new Set();

  function schedule(callback, delay) {
    const timerId = window.setTimeout(function runTimer() {
      timers.delete(timerId);
      callback();
    }, delay);
    timers.add(timerId);
    return timerId;
  }

  function cancel(timerId) {
    if (!timers.has(timerId)) return;
    window.clearTimeout(timerId);
    timers.delete(timerId);
  }

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
