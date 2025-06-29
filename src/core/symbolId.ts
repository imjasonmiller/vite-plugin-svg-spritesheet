import path from 'path';

import type { ParsedPath } from 'path';

/**
 * Generate a default `id` attribute value for the `<symbol />` from path parts
 */
export function defaultSymbolId(parsedPath: ParsedPath): string {
  const dirParts = parsedPath.dir.split(path.sep).filter(Boolean);

  return ['icon', ...dirParts, parsedPath.name].join('-');
}
