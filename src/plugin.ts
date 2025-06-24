import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';
import { glob } from 'tinyglobby';
import picomatch from 'picomatch';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import {
  parseSvg,
  optimizeSvg,
  cleanSymbolAttributes,
} from './helpers/parsing';
import { debounce } from './helpers/debounce';
import { writeSpritesheet } from './helpers/spritesheet';

import type { ParsedPath } from 'path';
import type { Plugin } from 'vite';
import type {
  ProcessSvgParams,
  SvgSpritesheetPluginOptions,
  SpriteMap,
  SpriteMapEntry,
  IncludeMatcher,
  SvgSpritesheetPluginContext,
} from './types';

import { LOG_PLUGIN_NAME, DEFAULT_BATCH_SIZE } from './constants';
import { normalizeError } from './helpers/error';
import { replaceColorAttributes } from './helpers/colorAttributes';

/**
 * Generate a default `id` attribute value for the `<symbol />` from path parts
 */
export function defaultSymbolId(parsedPath: ParsedPath): string {
  const dirParts = parsedPath.dir.split(path.sep).filter(Boolean);

  return ['icon', ...dirParts, parsedPath.name].join('-');
}

function isProcessingSkipped(
  context: SvgSpritesheetPluginContext,
  entry: SpriteMapEntry | undefined,
  currentHash: string,
  layerIndex: number
): boolean {
  if (!entry) {
    return false;
  }

  // Skip processing as it is overwritten by another layer
  if (entry.layerIndex > layerIndex) {
    context.logger.warn(
      `Skipping processing, as it is overwritten by another layer: ${entry.spriteId}`
    );
    return true;
  }

  // Skip processing as its contents are the same
  if (entry.hash === currentHash) {
    context.logger.warn(
      `Skipping processing, as its contents are the same: ${entry.spriteId}`
    );
    return true;
  }

  return false;
}

/**
 * Process a single SVG file: read, (optionally) optimize, parse, clean and add
 * to sprite map.
 *
 * @param params Parameters including context, file path, include info, and index
 * @returns
 */
async function processSvg({
  context,
  filePath, // rename to `entry`
  include,
  layerIndex,
}: ProcessSvgParams): Promise<void> {
  try {
    const absoluteInclude = path.resolve(include);
    const absoluteFilePath = path.resolve(absoluteInclude, filePath);
    const relativeToInclude = path.relative(absoluteInclude, absoluteFilePath);
    const parsedRelativePath = path.parse(relativeToInclude);

    const file = await fs.readFile(absoluteFilePath, 'utf8');
    // Hash file contents for comparison. MD5 is chosen for speed and
    // sufficiently low collision risk in this context. It is not intended for
    // cryptographic security.
    const hash = createHash('md5').update(file).digest('hex');
    const spriteId = context.options.customSymbolId
      ? context.options.customSymbolId(parsedRelativePath)
      : defaultSymbolId(parsedRelativePath);

    const existingEntry = context.spriteMap.get(relativeToInclude);
    if (isProcessingSkipped(context, existingEntry, hash, layerIndex)) {
      return;
    }

    const svg = optimizeSvg(context, file, filePath);
    const svgObj = parseSvg(context, svg, filePath);
    if (!svgObj) {
      context.logger.warn(
        `Parsing SVG returned empty or invalid data for file: "${filePath}". Skipping.`
      );
      return;
    }

    if (context.options.replaceColorAttributes) {
      replaceColorAttributes(svgObj);
    }

    const symbolAttrs = cleanSymbolAttributes(svgObj, spriteId);
    const spriteString = context.xmlBuilder.build({ symbol: symbolAttrs });
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

const debouncedWriteSpriteSheet = debounce(
  async (args: SvgSpritesheetPluginContext) => {
    await writeSpritesheet(args);
  },
  1500,
  { leading: true, trailing: true }
);

async function handleFileEvent(
  context: SvgSpritesheetPluginContext,
  event: 'add' | 'change' | 'unlink',
  file: string,
  matchers: IncludeMatcher[]
): Promise<void> {
  for (const { matcher, include, layerIndex } of matchers) {
    if (matcher(file)) {
      switch (event) {
        case 'add':
        case 'change': {
          await processSvg({
            context,
            include,
            layerIndex,
            filePath: file,
          });
          break;
        }
        case 'unlink':
          context.spriteMap.delete(path.relative(include, file));
          break;
        default:
          context.logger.warn(
            `${LOG_PLUGIN_NAME} Unhandled event type: ${event}`
          );
          break;
      }

      debouncedWriteSpriteSheet(context);
    }
  }
}

/**
 * Vite plugin to generate SVG spritesheets from specified SVG files
 *
 * @param options - Configuration options for the plugin
 * @returns Vite plugin instance
 */
export function svgSpritesheet(options: SvgSpritesheetPluginOptions): Plugin {
  if (options.include.length === 0) {
    throw new Error('The `include` option must be a non-empty array');
  }

  const xmlOptions = {
    ignoreDeclaration: true,
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  };

  const batchSize = Math.max(1, options.batchSize ?? DEFAULT_BATCH_SIZE);

  const spriteMap: SpriteMap = new Map();
  const xmlParser = new XMLParser(xmlOptions);
  const xmlBuilder = new XMLBuilder(xmlOptions);
  const context: SvgSpritesheetPluginContext = {
    logger: console,
    options,
    spriteMap,
    xmlParser,
    xmlBuilder,
  };

  return {
    name: 'vite-plugin-svg-spritesheet',

    async buildStart() {
      context.logger = this;

      const normalizedIncludes = Array.isArray(options.include)
        ? options.include
        : [options.include];

      const resolvedInlcudes: string[] = [];

      for (const include of normalizedIncludes) {
        const resolved = path.resolve(include);

        const stats = await fs.stat(resolved).catch(() => null);
        if (!stats?.isDirectory()) {
          this.error(`The include "${include}" is not a valid directory`);
        }

        resolvedInlcudes.push(include);
      }

      for (const [layerIndex, include] of resolvedInlcudes.entries()) {
        let entries: string[] = [];
        try {
          entries = await glob('**/*.svg', {
            cwd: include,
          });
        } catch (error) {
          const normalizedError = normalizeError(error);
          this.error({
            message: `Failed to glob files for include "${include}": ${normalizedError.message}`,
          });
        }

        // Parallel processing of files in batches to avoid file exhaustion
        for (let i = 0; i < entries.length; i += batchSize) {
          const batch = entries.slice(i, i + batchSize);

          // Allow for partial failure of entries
          await Promise.allSettled(
            batch.map((entry) => {
              return processSvg({
                context,
                include,
                layerIndex,
                filePath: entry,
              });
            })
          );

          await writeSpritesheet(context);
        }
      }

      if (spriteMap.size === 0) {
        this.warn('No sprites were generated');
      } else {
        this.info(`${LOG_PLUGIN_NAME} Generated ${spriteMap.size} SVG sprites`);
      }
    },

    // NOTE: We do not use `server.watch.add` as the docs mention:
    //
    // > The Vite server watcher watches the root and skips the .git/,
    // > node_modules/, and Vite's cacheDir and build.outDir directories by
    // > default.
    //
    // Files in `src/` that match the inclusion pattern should be picked up
    //
    // See: https://vite.dev/config/server-options#server-watch
    configureServer(server) {
      // Precompile and cache all matchers
      const matchers = (
        Array.isArray(options.include) ? options.include : [options.include]
      ).map((include, index) => {
        const pattern = path.resolve(path.join(include, '**/*.svg'));

        return {
          matcher: picomatch(pattern),
          include,
          layerIndex: index,
        };
      });

      server.watcher
        .on('change', async (file) => {
          await handleFileEvent(context, 'change', file, matchers);
        })
        .on('add', async (file) => {
          await handleFileEvent(context, 'add', file, matchers);
        })
        .on('unlink', async (file) => {
          await handleFileEvent(context, 'unlink', file, matchers);
        });
    },
  };
}
