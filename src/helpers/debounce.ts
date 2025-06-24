interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
}

/**
 * Creates a debounced version of a function that delays execution until after
 * `wait` milliseconds have elapsed since the last invocation. Supports both
 * `leading` and `trailing` invocation.
 *
 * @param callback - The function to debounce
 * @param wait - The debounce time in milliseconds
 * @param options - Configuration for `leading` and/or `trailing` behavior
 * @returns A debounced version of the original function
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function debounce<T extends (...args: any[]) => any>(
  callback: T,
  wait = 0,
  { leading = true, trailing = true }: DebounceOptions = {}
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  // The latest arguments and `this` context used for the trailing call
  let lastArgs: Parameters<T> | null = null;
  let lastThis: unknown = null;

  // Tracks whether the debounced function was called again during the debouncing window
  let calledDuringWait = false;

  function debounced(this: unknown, ...args: Parameters<T>): void {
    const isLeadingEdge = leading && !timeoutId;

    // Preserve context for deferred calls
    lastArgs = args;
    /* eslint-disable-next-line @typescript-eslint/no-this-alias */
    lastThis = this;

    // Prevent previously created timeouts from completing
    if (timeoutId) {
      clearTimeout(timeoutId);
      calledDuringWait = true;
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;

      if (trailing && (!leading || calledDuringWait) && lastArgs) {
        callback.apply(lastThis, lastArgs);
      }

      calledDuringWait = false;
      lastArgs = null;
      lastThis = null;
    }, wait);

    // If this is the first call in the debounce window and leading is enabled,
    // invoke immediately
    if (isLeadingEdge) {
      callback.apply(this, args);
      calledDuringWait = false;
    }
  }

  return debounced;
}
