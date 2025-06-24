import type { ParsedSvg } from './../types';

/**
 * Recursively walk through the SVG object structure to replace every instance
 * of `fill` and `stroke` with the CSS Variable.
 */
export function replaceColorAttributes(obj: ParsedSvg): void {
  function replace(obj: ParsedSvg) {
    for (const val of Object.values(obj)) {
      if (val && typeof val === 'object') {
        // Replace a possible fill or stroke color with the variable to be
        // referenced in the component.
        if ('@_fill' in val) {
          val['@_fill'] = `var(--c,${val['@_fill']})`;
        }
        if ('@_stroke' in val) {
          val['@_stroke'] = `var(--c,${val['@_stroke']})`;
        }

        replace(val);
      }
    }

    return obj;
  }

  replace(obj);
}
