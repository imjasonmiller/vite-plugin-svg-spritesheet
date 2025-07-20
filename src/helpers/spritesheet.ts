import fs from 'fs/promises';
import { toEnumKey, toEnumValue } from './naming';
import { GENERATED_FILE_HEADER } from '../constants';

import type { SpriteMap, SvgSpritesheetPluginContext } from '../types';
import { normalizeError } from './error';
import { assertWritablePath } from './fs';

/**
 * Generate a TypeScript union type for sprite names
 *
 * @param name - The type's name, defaults to `IconName`
 * @returns - String content of the type declaration
 */
export function generateStringUnion(
  name = 'IconName'
): (spriteMap: SpriteMap) => string {
  return (spriteMap: SpriteMap): string => {
    const members = Array.from(spriteMap.values(), ({ spriteId }) => {
      return `  | "${spriteId.full}"`;
    }).join('\n');

    return `${GENERATED_FILE_HEADER}\n\nexport type ${name} =\n${members};`;
  };
}

/**
 * Generate a TypeScript enum for sprite names
 *
 * @param name - The enum's name, defaults to `IconName`
 * @returns - String content of the enum declaration
 */
export function generateEnum(
  name = 'IconName'
): (spriteMap: SpriteMap) => string {
  return (spriteMap: SpriteMap): string => {
    const members = Array.from(spriteMap.values(), ({ spriteId }) => {
      const enumKey = toEnumKey(spriteId.id);
      const enumValue = toEnumValue(spriteId.full);
      return `  ${enumKey} = "${enumValue}"`;
    }).join(',\n');

    return `${GENERATED_FILE_HEADER}\n\nexport enum ${name} {\n${members},\n}`;
  };
}

export function buildSpritesheet(spriteMap: SpriteMap): string {
  const symbols = Array.from(
    spriteMap.values(),
    ({ spriteString }) => spriteString
  ).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg">${symbols}</svg>`;
}

/**
 * Sort a Map by keys and/or values, returning a new Map with sorted entries.
 *
 * @param map - The map to sort
 * @param compareFn - Optional comparator function receiving `[key, value]` tuples
 * @returns
 */
export function sortMap<K, V>(
  map: Map<K, V>,
  compareFn?: (a: [K, V], b: [K, V]) => number
): Map<K, V> {
  return new Map(Array.from(map.entries()).sort(compareFn));
}

export async function writeSpritesheet({
  spriteMap,
  options,
  logger,
}: SvgSpritesheetPluginContext): Promise<void> {
  // Sort map in order for the output to be deterministic
  const sortedSpriteMap = sortMap(spriteMap, ([, a], [, b]) => {
    return a.spriteId.full.localeCompare(b.spriteId.full);
  });

  const spritesheetSvg = buildSpritesheet(sortedSpriteMap);

  try {
    await fs.writeFile(options.output, spritesheetSvg, 'utf8');
  } catch (err) {
    const normalizedError = normalizeError(err);
    logger.error(
      `Failed to write spritesheet to "${options.output}": ${normalizedError.message}`
    );
  }

  // If defined, generate TypeScript types
  if (options.types) {
    // Clone to avoid the user from mutating the data structure
    const clonedSpriteMap = structuredClone(sortedSpriteMap);
    const declaration = options.types.generateTypes
      ? options.types.generateTypes(clonedSpriteMap)
      : generateStringUnion()(clonedSpriteMap);

    try {
      await assertWritablePath(options.types.output);
      await fs.writeFile(options.types.output, declaration, 'utf8');
    } catch (err) {
      const normalizedError = normalizeError(err);
      logger.warn(
        `Failed to write types to "${options.types.output}": ${normalizedError.message}`
      );
    }
  }
}
