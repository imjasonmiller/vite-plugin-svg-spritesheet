import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from '../../src/helpers/debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllTimers();
  });

  it('calls callback immediately if leading is true and trailing is false', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 100, {
      leading: true,
      trailing: false,
    });

    debounced('first');
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('first');

    debounced('second');
    debounced('third');

    // Callback should NOT be called again during wait period
    expect(callback).toHaveBeenCalledTimes(1);

    // Advance time past debounce wait
    vi.advanceTimersByTime(100);

    // Callback should still have been called only once (no trailing)
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('calls callback only after wait if leading is false and trailing is true', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 100, {
      leading: false,
      trailing: true,
    });

    debounced('first');
    expect(callback).toHaveBeenCalledTimes(0);

    debounced('second');
    debounced('third');

    // Still no calls during wait
    expect(callback).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(100);

    // Callback called once with latest arguments after wait
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('third');
  });

  it('calls callback both leading and trailing if both true', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 100, {
      leading: true,
      trailing: true,
    });

    debounced('first');
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('first');

    debounced('second');
    debounced('third');

    // Still only one call (leading)
    expect(callback).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);

    // Trailing call with latest args
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith('third');
  });

  it('does not call callback if neither leading nor trailing are true', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 100, {
      leading: false,
      trailing: false,
    });

    debounced('first');

    vi.advanceTimersByTime(100);

    expect(callback).not.toHaveBeenCalled();
  });

  it('passes the correct `this` context to the callback', () => {
    const context = { value: 42 };
    const callback = vi.fn(function (this: typeof context) {
      // `this` should be the context bound to debounced call
      expect(this).toBe(context);
    });

    const debounced = debounce(callback, 50);
    debounced.call(context);

    vi.advanceTimersByTime(50);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('handles multiple quick calls and calls only once after wait (trailing)', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 100, {
      leading: false,
      trailing: true,
    });

    debounced('first');
    vi.advanceTimersByTime(50);
    debounced('second');
    vi.advanceTimersByTime(50);
    debounced('third');

    // No calls during wait
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('third');
  });
});
