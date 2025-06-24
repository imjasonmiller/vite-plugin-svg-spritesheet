import type { ParsedPath } from 'path';
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
  options: SvgSpritesheetPluginOptions;
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
  spriteId: string;
  spriteString: string;
  layerIndex: number;
  hash: string;
}

interface SpritesheetTypesOptions {
  output: string;
  /**
   * Generate a custom declaration by passing a callback that receives a
   * `SpriteMap`.
   */
  generateDeclaration?: (spriteMap: SpriteMap) => string;
}

export interface SvgSpritesheetPluginOptions {
  /**
   * Directory or directories to include icons from.
   * Accepts a single path or array of paths.
   */
  include: string | string[];
  /**
   * Path to which the generated spritesheet will be written.
   */
  output: string;
  /**
   * A custom `id` attribute to be used as for each `<symbol />` tag.
   * Receives the parsed file path as input.
   */
  customSymbolId?: (path: ParsedPath) => string;
  /**
   * Optional SVGO configuration object for optimization of SVGs.
   * @default undefined
   */
  svgoConfig?: SvgoConfig;
  /**
   * Optional TypeScript types generation settings.
   */
  types?: SpritesheetTypesOptions;
  /**
   * Number of files to process in parallel batches.
   * @default 20
   */
  batchSize?: number;
}

export interface ProcessSvgParams {
  context: SvgSpritesheetPluginContext;
  include: string;
  layerIndex: number;
  filePath: string;
}

export interface IncludeMatcher {
  matcher: Matcher;
  include: string;
  layerIndex: number;
}
