import path from 'path';

import type { ParsedPath } from 'node:path';
import type { SvgSpritesheetPluginContext } from './../types';

/**
 * Resolve base path relative to the the optional base directory if provided
 */
export function resolveBasePath(
  context: SvgSpritesheetPluginContext,
  entry: string,
  baseDir?: string
): ParsedPath {
  let resolved = path.resolve(entry);

  if (baseDir) {
    resolved = path.relative(path.resolve(baseDir), resolved);
  }

  return path.parse(resolved);
}
