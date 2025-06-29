import { createHash } from 'crypto';

/**
 * Computes an MD5 hash of the given string content.
 *
 * MD5 is selected for speed and low collision risk in this non-cryptographic context.
 *
 * This is **not** suitable for cryptographic purposes.
 *
 * @param {string} content - The input string to hash.
 * @returns {string} The hexadecimal MD5 hash of the input.
 */
export function computeHash(content: string): string {
  return createHash('md5').update(content).digest('hex');
}
