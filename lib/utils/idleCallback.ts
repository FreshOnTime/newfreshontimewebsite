export interface ScheduledIdleTask {
  cancel: () => void;
}

export function scheduleIdleTask(
  task: () => void,
  options: { timeout?: number; fallbackDelayMs?: number } = {}
): ScheduledIdleTask {
  const { timeout = 1500, fallbackDelayMs = 1200 } = options;

  if (typeof window === 'undefined') {
    task();
    return { cancel: () => {} };
  }

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let idleId: number | null = null;

  if (typeof window.requestIdleCallback === 'function') {
    idleId = window.requestIdleCallback(() => {
      task();
    }, { timeout });
  } else {
    timeoutId = setTimeout(() => {
      task();
    }, fallbackDelayMs);
  }

  return {
    cancel: () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (idleId !== null && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
    }
  };
}
