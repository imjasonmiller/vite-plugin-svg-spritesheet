import type { ParsedPath } from "path";
import { type Config as SvgoConfig } from "svgo";
import type { XMLParser, XMLBuilder } from "fast-xml-parser";
import type { Matcher } from "picomatch";

export interface Logger {
  warn: (...args: Array<any>) => any;
  error: (...args: Array<any>) => any;
  info: (...args: Array<any>) => any;
}

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
    "@_viewBox": string;
  };
}

/**
 * Attributes used for a `<symbol />` within the sprite sheet.
 * The keys use the `@_` prefix as per fast-xml-parser's attribute naming.
 */
export interface SvgSpriteSymbolAttrs {
  // The unique `id`
  "@_id": string;
  // The required dimensions
  "@_viewBox": string;
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

export interface SvgSpritesheetInclude {
  pattern: string | Array<string>;
  baseDir?: string;
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
  include: Array<SvgSpritesheetInclude>;
  output: string;
  /**
   * A custom `id` to be used as for each `<symbol />`.
   */
  customSymbolId?: (path: ParsedPath) => string;
  svgoConfig?: SvgoConfig;
  types?: SpritesheetTypesOptions;
  batchSize?: number;
}

export interface ProcessSvgParams {
  context: SvgSpritesheetPluginContext;
  include: SvgSpritesheetInclude;
  layerIndex: number;
  filePath: string;
}

export interface IncludeMatcher {
  matcher: Matcher;
  include: SvgSpritesheetInclude;
  layerIndex: number;
}
