import { Temporal } from "@js-temporal/polyfill";
import { Accessor, createEffect, createSignal, onCleanup, untrack } from "solid-js";

export function createDebounce<T>(source: Accessor<T>, delay: number): Accessor<T> {
  const [debounced, setDebounced] = createSignal<T>(source());
  createEffect(() => {
    const value = source();
    const timer = setTimeout(() => {
      setDebounced(() => value);
    }, delay);

    onCleanup(() => clearTimeout(timer));
  });

  return debounced;
}

export function createThrottle<T>(source: Accessor<T>, limit: number): Accessor<T> {
  const [throttled, setThrottled] = createSignal<T>(source());
  let lastExecution: Temporal.Instant | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pendingValue: T = source();  
  
  createEffect(() => {
    const nextValue = source();
    const now = Temporal.Now.instant();

    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    if (!lastExecution) {
      untrack(() => setThrottled(() => nextValue));
      lastExecution = now;
      return;
    }

    const elapsed = lastExecution.until(now).total({ unit: 'millisecond' });

    if (elapsed >= limit) {
      untrack(() => setThrottled(() => nextValue));
      lastExecution = now;
    } else {
      const remaining = limit - elapsed;
      timer = setTimeout(() => {
        setThrottled(() => nextValue);
        lastExecution = Temporal.Now.instant();
        timer = null;
      }, remaining)
    }

    onCleanup(() => {
      if (timer) {
        clearTimeout(timer)
        timer = null;
      }
    })
  })

  return throttled;
}
