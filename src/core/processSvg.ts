import fs from 'fs/promises';
import path from 'path';
import { computeHash } from '../hash';
import { isProcessingSkipped } from './isProcessingSkipped';
import { defaultSymbolId, getFullSymbolId } from './symbolId';
import { normalizeError } from '../helpers/error';
import { replaceColorAttrsWithCssVars } from '../helpers/svg/transform';
import { optimizeSvg } from '../helpers/svg/optimizer';
import { parseSvg } from '../helpers/svg/parser';
import { transformSvgToSymbol } from '../helpers/svg/transform';

import type { ProcessSvgParams } from '../types';

/**
 * Process a single SVG file: read, (optionally) optimize, parse, clean and add
 * to sprite map.
 *
 * @param params Parameters including context, file path, include info, and index
 * @returns
 */
export async function processSvg({
  context,
  filePath,
  include,
  layerIndex,
}: ProcessSvgParams): Promise<void> {
  try {
    const absoluteInclude = path.resolve(include);
    const absoluteFilePath = path.resolve(absoluteInclude, filePath);
    const relativeToInclude = path.relative(absoluteInclude, absoluteFilePath);
    const parsedRelativePath = path.parse(relativeToInclude);

    const file = await fs.readFile(absoluteFilePath, 'utf8');
    const hash = computeHash(file);

    const existingEntry = context.spriteMap.get(relativeToInclude);
    if (isProcessingSkipped(context, existingEntry, hash, layerIndex)) {
      return;
    }

    const symbolPrefix = context.options.symbolId?.prefix ?? 'icon';
    const symbolId = context.options.symbolId?.id
      ? context.options.symbolId.id(relativeToInclude, parsedRelativePath)
      : defaultSymbolId(parsedRelativePath);

    const baseSpriteId = { prefix: symbolPrefix, id: symbolId };
    const spriteId = {
      ...baseSpriteId,
      full: getFullSymbolId(baseSpriteId),
    };

    const svg = optimizeSvg(context, file, filePath);
    let svgObj = parseSvg(context, svg, filePath);
    if (!svgObj) {
      context.logger.warn(
        `Parsing SVG returned empty or invalid data for file: "${filePath}". Skipping.`
      );
      return;
    }

    if (context.options.replaceColorAttributes) {
      const replaced = replaceColorAttrsWithCssVars(svgObj);

      if (!replaced) {
        context.logger.warn(
          `Could not replace color attributes  data for file: "${filePath}". Skipping.`
        );
        return;
      }

      svgObj = replaced;
    }

    const spriteSymbol = transformSvgToSymbol(svgObj, spriteId.full);
    if (!spriteSymbol) {
      context.logger.warn(
        `Symbol conversion failed for file: "${filePath}". Skipping.`
      );
      return;
    }

    const spriteString = context.xmlBuilder.build(spriteSymbol);

    context.spriteMap.set(relativeToInclude, {
      spriteId,
      spriteString,
      layerIndex,
      hash,
    });
  } catch (error) {
    const normalizedError = normalizeError(error);
    context.logger.warn(
      `Failed to process SVG file "${filePath}": ${normalizedError.message}`
    );
  }
}
