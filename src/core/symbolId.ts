import path from 'path';

import type { ParsedPath } from 'path';

/**
 * Generates a default `id` attribute value for an SVG `<symbol>` element
 * based on the parsed file path.
 *
 * The generated ID is composed of the file's directory parts and base name,
 * prefixed with `"icon"` and joined with dashes. This ensures uniqueness
 * across nested file structures while remaining readable and deterministic.
 *
 * @example
 * defaultSymbolId(path.parse('social/email.svg')); // "social-email"
 *
 * @param parsedPath - The parsed file path object
 * @returns The string to be used for the symbol's `id` attribute
 *
 * @remarks
 * This function does not perform sanitization
 */
export function defaultSymbolId(parsedPath: ParsedPath): string {
  const dirParts = parsedPath.dir.split(path.sep).filter(Boolean);

  return [...dirParts, parsedPath.name].join('-');
}

const leadingHyphen = /^-+/g;

export function getFullSymbolId({
  prefix,
  id,
}: {
  prefix: string;
  id: string;
}): string {
  return [prefix, id].filter(Boolean).join('-').replace(leadingHyphen, '');
}
