/*
 * Audit refactor:
 * - Kept viewport/device hooks isolated from feature modules.
 * - Batched resize updates with requestAnimationFrame to avoid resize thrash.
 * - Added null-safe browser guards and JSDoc for the hook.
 */

/**
 * Tracks whether the viewport is below the configured mobile breakpoint.
 * @param {number} breakpoint
 * @returns {boolean}
 */
function useIsMobile(breakpoint = ERA_VIEWPORT.MOBILE_BREAKPOINT) {
  const getSnapshot = () => (typeof window !== "undefined" ? window.innerWidth < breakpoint : false);
  const [isMobile, setIsMobile] = useState(getSnapshot);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    let frameId = 0;
    let lastValue = getSnapshot();

    function commitResize() {
      frameId = 0;
      const nextValue = getSnapshot();
      if (nextValue === lastValue) return;
      lastValue = nextValue;
      setIsMobile(nextValue);
    }

    function handleResize() {
      if (frameId) return;
      frameId = window.requestAnimationFrame(commitResize);
    }

    setIsMobile(lastValue);
    window.addEventListener("resize", handleResize);
    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [breakpoint]);

  return isMobile;
}
