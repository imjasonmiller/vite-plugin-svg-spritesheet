import { optimize as svgoOptimize } from 'svgo';
import { normalizeError } from '../error';

import type { SvgSpritesheetPluginContext } from '../../types';

/**
 * Optimize using SVGO if a configuration was provided
 */
export function optimizeSvg(
  context: SvgSpritesheetPluginContext,
  content: string,
  filePath: string
): string {
  const { svgoConfig } = context.options;
  if (!svgoConfig) {
    return content;
  }

  try {
    const optimized = svgoOptimize(content, { ...svgoConfig, path: filePath });

    if ('data' in optimized && optimized.data.length) {
      return optimized.data;
    } else {
      context.logger.warn(
        `SVGO optimize returned an invalid result for ${filePath}`
      );
    }
  } catch (err) {
    const normalizedError = normalizeError(err);
    context.logger.warn(
      `SVGO could not optimize the file "${filePath}": ${normalizedError.message}`
    );
  }

  return content;
}
