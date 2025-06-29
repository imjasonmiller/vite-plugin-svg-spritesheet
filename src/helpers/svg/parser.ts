import { normalizeError } from '../error';
import { ATTR_GROUP, ATTR_VIEWBOX, TAG_SVG } from './constants';

import type { SvgSpritesheetPluginContext } from '../../types';
import type { SVGValue } from './types';

/**
 * Parse SVG XML string and warns on missing required attributes. Returns a
 * `SVGValue` or `null` if invalid.
 */
export function parseSvg(
  context: SvgSpritesheetPluginContext,
  input: string,
  filePath: string
): SVGValue | null {
  try {
    const parsed = context.xmlParser.parse(input);

    // A valid SVG should only have one SVG root node, but the option
    // `preserveOrder` for `fast-xml-parser` will return it as a single-element
    // array instead for which we normalize.
    const normalizedRoot = Array.isArray(parsed) ? parsed?.[0] : parsed;

    if (!normalizedRoot?.[TAG_SVG]) {
      context.logger.warn(`Missing <svg> root in "${filePath}"`);
      return null;
    }

    if (!normalizedRoot?.[ATTR_GROUP]?.[ATTR_VIEWBOX]) {
      context.logger.warn(`Missing "viewBox" attribute in "${filePath}"`);
      return null;
    }

    return normalizedRoot;
  } catch (err) {
    const normalizedError = normalizeError(err);
    context.logger.warn(
      `Failed to parse SVG XML in "${filePath}": ${normalizedError.message}`
    );
    return null;
  }
}
