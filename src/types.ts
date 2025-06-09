import type { ParsedPath } from "path";
import type { PluginContext } from "rollup";
import { type Config as SvgoConfig } from "svgo";

export interface Context {
  entry: string;
  plugin: PluginContext;
}

export interface ParsedSvg {
  svg: {
    "@_viewBox": string;
  };
}

export interface SvgSpriteSymbolAttrs {
  "@_id": string;
  "@_viewBox": string;
  [key: string]: string;
}

export type SvgSpritesheetMap = Map<
  string,
  { spriteId: string; spriteString: string }
>;

export interface SvgSpritesheetInclude {
  pattern: string | Array<string>;
  baseDir?: string;
}

interface SpritesheetTypesOpts {
  output: string;
  /**
   * Generate a custom declaration by passing a callback that receives a
   * `SpritesheetMap`.
   */
  generateDeclaration?: (spritesheet: SvgSpritesheetMap) => string;
}

export interface SvgSpritesheetPluginOpts {
  include: Array<SvgSpritesheetInclude>;
  output: string;
  /**
   * A custom `id` to be used as for each `<symbol />`.
   */
  customSymbolId?: (path: ParsedPath) => string;
  svgoConfig?: SvgoConfig;
  types?: SpritesheetTypesOpts;
  batchSize?: number;
}
