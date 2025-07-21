import { type Config as SvgoConfig } from 'svgo';
import type { XMLParser, XMLBuilder } from 'fast-xml-parser';
import type { Matcher } from 'picomatch';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Logger {
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  info: (...args: any[]) => void;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface SvgSpritesheetPluginContext {
  logger: Logger;
  options: PluginOptions;
  spriteMap: SpriteMap;
  xmlParser: XMLParser;
  xmlBuilder: XMLBuilder;
}

/**
 * Represents an SVG parsed by `fast-xml-parser` with relevant attributes.
 */
export interface ParsedSvg {
  svg: {
    '@_viewBox': string;
  };
}

/**
 * Attributes used for a `<symbol />` within the sprite sheet.
 * The keys use the `@_` prefix as per fast-xml-parser's attribute naming.
 */
export interface SvgSpriteSymbolAttrs {
  // The unique `id`
  '@_id': string;
  // The required dimensions
  '@_viewBox': string;
  [key: string]: string;
}

export type FilePath = string;

export type SpriteMap = Map<FilePath, SpriteMapEntry>;

export interface SpriteMapEntry {
  spriteId: { prefix: string; id: string; full: string };
  spriteString: string;
  layerIndex: number;
  hash: string;
}

interface TypesOptions {
  output: string;
  /**
   * Generates TypeScript types by passing a callback receiving the
   * `SpriteMap`.
   *
   * The `generateEnum` and `generateStringUnion` helper functions
   * are exported, but a custom one can be passed as well.
   *
   * @example
   * // Generate a string union with name `SpriteName`
   * generateTypes: generateStringUnion("SpriteName")
   * // Generate an enum for all sprites with name `SpriteName`
   * generateTypes: generateEnum("SpriteName")
   */
  generateTypes?: (spriteMap: SpriteMap) => string;
}

export interface SymbolIdOptions {
  /**
   * Optional prefix prepended to all symbol IDs.
   *
   * Defaults to `"icon"`. Set to an empty string to omit the prefix.
   *
   * @example
   * // File: icons/16/edit.svg
   * prefix: "icon" // "icon-16-edit"
   * prefix: ""     // "16-edit"
   */
  prefix?: string;

  /**
   * Custom function to generate the base part of each symbol ID (excluding the prefix).
   *
   * By default, the ID is generated from the file’s relative path:
   * subdirectories + filename, joined by hyphens.
   *
   * @returns A string representing the base ID (e.g. "16-edit")
   */
  id?: (filePath: string) => string;
}

export interface PluginOptions {
  /**
   * Directory or directories to include. Accepts a single path or array of
   * paths.
   */
  readonly include: string | string[];
  /**
   * Files or directories to exclude
   */
  readonly exclude?: string | string[];
  /**
   * Path to which the generated spritesheet will be written.
   */
  readonly output: string;
  /**
   * Configure how `<symbol>` IDs are generated.
   *
   * These IDs are used as the `id` attribute in the SVG sprite and are
   * referenced via `<use xlink:href="#id" />`.
   *
   * If not customized, the default format is:
   *   `"icon-[subdir]-[filename]"`
   *
   * Use this to customize the `id` format for improved naming, consistency, or integration with design systems.
   */
  symbolId?: SymbolIdOptions;
  /**
   * Optional SVGO configuration object for optimization of SVGs.
   * @default undefined
   */
  svgoConfig?: SvgoConfig;
  /**
   * Optional TypeScript types generation settings.
   */
  types?: TypesOptions;
  /**
   * Number of files to process in parallel batches.
   * @default 20
   */
  batchSize?: number;
  /**
   * Replace all `fill` and `stroke` color attributes with CSS Variables that
   * allows for the use of `currentColor` with fallback to the original color.
   */
  replaceColorAttributes?: boolean;
}

export interface ProcessSvgParams {
  context: SvgSpritesheetPluginContext;
  include: string;
  layerIndex: number;
  filePath: string;
}

export interface IncludeMatcher {
  matcher: Matcher;
  excludeMatchers?: Matcher[];
  include: string;
  layerIndex: number;
}
