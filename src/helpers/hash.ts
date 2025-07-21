import { createHash } from 'crypto';

/**
 * Computes a SHA-256 hash of the given string content.
 *
 * @param {string} content - The input string to hash.
 * @returns {string} The hexadecimal SHA-256 hash of the input.
 */
export function computeHash(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}
