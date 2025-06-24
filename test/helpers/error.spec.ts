import { describe, it, expect } from 'vitest';
import { normalizeError } from '../../src/helpers/error';

describe('normalizeError', () => {
  it('returns native Error unchanged', () => {
    const err = new Error('native error');
    expect(normalizeError(err)).toBe(err);
  });

  it('wraps string in an Error', () => {
    const err = 'some error string';
    const result = normalizeError(err);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe(err);
  });

  it('wraps object with message string in an Error', () => {
    const err = { message: 'object message' };
    const result = normalizeError(err);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe(err.message);
  });

  it('stringifies generic objects in an Error message', () => {
    const err = { foo: 'bar', baz: 42 };
    const result = normalizeError(err);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe(JSON.stringify(err));
  });

  it('falls back to String(error) if JSON.stringify throws', () => {
    // Create a circular reference object that throws on JSON.stringify
    const circularObj: { self?: typeof circularObj } = {};
    circularObj.self = circularObj;

    const result = normalizeError(circularObj);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe(String(circularObj));
  });

  it('handles null input gracefully', () => {
    const result = normalizeError(null);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('null');
  });

  it('handles other primitives like numbers', () => {
    const err = 12345;
    const result = normalizeError(err);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('12345');
  });
});
