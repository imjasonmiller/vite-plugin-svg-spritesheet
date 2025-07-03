import path from 'path';
import { glob } from 'tinyglobby';
import picomatch from 'picomatch';
import { XMLParser, XMLBuilder, type X2jOptions } from 'fast-xml-parser';
import { debounce } from './helpers/debounce';
import { writeSpritesheet } from './helpers/spritesheet';
import { processSvg } from './core/processSvg';

import type { Plugin } from 'vite';
import type {
  PluginOptions,
  SpriteMap,
  IncludeMatcher,
  SvgSpritesheetPluginContext,
} from './types';

import { LOG_PLUGIN_NAME, DEFAULT_BATCH_SIZE, PLUGIN_NAME } from './constants';
import { normalizeError } from './helpers/error';
import { isDirectory, assertWritablePath } from './helpers/fs';
import { toArray } from './helpers/options';

const debouncedWriteSpriteSheet = debounce(
  async (args: SvgSpritesheetPluginContext) => {
    await writeSpritesheet(args);
  },
  500,
  { leading: true, trailing: true }
);

async function handleFileEvent(
  context: SvgSpritesheetPluginContext,
  event: 'add' | 'change' | 'unlink',
  file: string,
  matchers: IncludeMatcher[]
): Promise<void> {
  for (const { matcher, excludeMatchers, include, layerIndex } of matchers) {
    const isExcluded = excludeMatchers?.some((m) => m(file));
    if (isExcluded) {
      continue;
    }

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
export function svgSpritesheet(options: PluginOptions): Plugin {
  if (options.include.length === 0) {
    throw new Error('The `include` option must be a non-empty array');
  }

  const xmlOptions = {
    ignoreDeclaration: true,
    ignoreAttributes: false,
    preserveOrder: true,
    attributeNamePrefix: '@_',
  } satisfies X2jOptions;

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
    name: PLUGIN_NAME,

    async buildStart() {
      context.logger = this;

      const resolvedIncludes: string[] = [];

      for (const include of toArray(options.include)) {
        const resolved = path.resolve(include);

        if (!(await isDirectory(resolved))) {
          this.error(
            `${LOG_PLUGIN_NAME}: The include "${include}" is not a valid directory`
          );
        }

        resolvedIncludes.push(include);
      }

      try {
        await assertWritablePath(options.output);
      } catch (err) {
        const normalizedError = normalizeError(err);
        this.error(
          `${LOG_PLUGIN_NAME}: Output path "${options.output}" is invalid: ${normalizedError.message}`
        );
      }

      for (const [layerIndex, include] of resolvedIncludes.entries()) {
        let entries: string[] = [];
        try {
          entries = await glob('**/*.svg', {
            cwd: include,
            ignore: options.exclude,
            onlyFiles: true,
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
      let excludeMatchers: picomatch.Matcher[] | undefined;
      if (options.exclude) {
        excludeMatchers = toArray(options.exclude).map((p) => picomatch(p));
      }

      const matchers = toArray(options.include).map((include, index) => {
        const pattern = path.resolve(path.join(include, '**/*.svg'));

        return {
          matcher: picomatch(pattern),
          excludeMatchers,
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
