import { optimize } from 'svgo'
import type {
    SvgSpritesheetPluginContext,
    ParsedSvg,
    SvgSpriteSymbolAttrs,
} from './../types'

/**
 * Parse SVG XML string and warns on missing required attributes. Returns a
 * `ParsedSvg` or `null` if invalid.
 */
export function parseSvg(
    context: SvgSpritesheetPluginContext,
    input: string,
    filePath: string
): ParsedSvg | null {
    try {
        const result = context.xmlParser.parse(input)

        if (!result?.svg) {
            context.logger.warn(`Missing <svg> root in "${filePath}"`)
            return null
        }

        if (!result.svg['@_viewBox']) {
            context.logger.warn(`Missing "viewBox" attribute in "${filePath}"`)
            return null
        }

        return result
    } catch (err) {
        context.logger.warn(`Failed to parse SVG XML in "${filePath}": ${err}`)
        return null
    }
}

/**
 * Optimize using SVGO if a configuration was provided
 */
export function optimizeSvg(
    context: SvgSpritesheetPluginContext,
    content: string,
    filePath: string
): string {
    if (!context.options.svgoConfig) {
        return content
    }

    try {
        const optimized = optimize(content, context.options.svgoConfig)

        if ('data' in optimized && optimized.data.length) {
            return optimized.data
        } else {
            context.logger.warn(
                `SVGO optimize returned an invalid result for ${filePath}`
            )
        }
    } catch (err) {
        context.logger.warn(`SVGO could not optimize the file "${filePath}"`)
    }

    return content
}

export function cleanSymbolAttributes(
    svgObj: ParsedSvg,
    spriteId: string
): SvgSpriteSymbolAttrs {
    const result: SvgSpriteSymbolAttrs = {
        ...svgObj.svg,
        '@_id': spriteId,
        '@_viewBox': svgObj.svg['@_viewBox'],
    }

    // Remove unnecessary attributes for the `<symbol />`
    for (const attr of ['@_xmlns', '@_width', '@_height']) {
        delete result[attr]
    }

    return result
}
