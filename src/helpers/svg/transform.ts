import {
  ATTR_XMLNS,
  ATTR_WIDTH,
  ATTR_HEIGHT,
  COLOR_ATTRS,
  TAG_SVG,
  ATTR_GROUP,
} from './constants';

import type { SVGNode, SVGValue } from './types';

/**
 * Transform the SVG data to a Symbol
 *
 * @param node
 * @param spriteId
 * @returns
 */
export function transformSvgToSymbol(
  node: SVGValue,
  spriteId: string
): SVGValue[] | null {
  if (typeof node !== 'object' || !(TAG_SVG in node) || !(ATTR_GROUP in node)) {
    return null;
  }

  const svgContent = node?.[TAG_SVG];
  const svgAttrs = node?.[ATTR_GROUP];

  if (!Array.isArray(svgContent)) {
    return null;
  }

  if (typeof svgAttrs !== 'object' || Array.isArray(svgAttrs)) {
    return null;
  }

  // Delete unnecessary attributes that will conflict in the spritesheet
  const newAttrs = { ...svgAttrs };
  delete newAttrs?.[ATTR_XMLNS];
  delete newAttrs?.[ATTR_WIDTH];
  delete newAttrs?.[ATTR_HEIGHT];

  const result: SVGValue[] = [
    {
      symbol: [...svgContent],
      ':@': {
        ...newAttrs,
        '@_id': spriteId,
      },
    },
  ];

  return result;
}

/**
 * Recursively replace '@_fill' and '@_stroke' colors in an SVGNode tree with a CSS variable.
 * Returns a new SVGNode tree (immutable), leaving input untouched.
 *
 * @param node - The SVG node to transform
 * @param cssVar - CSS variable name to inject (default of 'c' for better compression)
 * @returns A new SVGNode tree with replaced colors
 */
export function replaceColorAttrsWithCssVars(
  node: SVGValue,
  cssVar = 'c'
): SVGValue {
  // Return a primitive as-is
  if (typeof node === 'string') {
    return node;
  }

  // Recursively map arrays
  if (Array.isArray(node)) {
    return node.map((child) => replaceColorAttributesNode(child, cssVar));
  }

  // Recursively map object
  return replaceColorAttributesNode(node, cssVar);
}

/**
 * Recurse through a single node, replacing color attributes.
 */
export function replaceColorAttributesNode(
  node: SVGNode,
  cssVar: string
): SVGNode {
  const result: SVGNode = {};

  for (const [key, value] of Object.entries(node)) {
    if (COLOR_ATTRS.includes(key) && typeof value == 'string') {
      result[key] = `var(--${cssVar},${value})`;
    } else if (typeof value === 'object' && value !== null) {
      // Recurse objects or arrays
      result[key] = replaceColorAttrsWithCssVars(value, cssVar);
    } else {
      // Copy value as is, if it is not what we are looking for
      result[key] = value;
    }
  }

  return result;
}
