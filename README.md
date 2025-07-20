# `vite-plugin-svg-spritesheet`

![npm version](https://img.shields.io/npm/v/vite-plugin-svg-spritesheet?style=flat) ![Build Status](https://img.shields.io/github/actions/workflow/status/imjasonmiller/vite-plugin-svg-spritesheet/ci.yml?style=flat) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

<img src="https://raw.githubusercontent.com/imjasonmiller/vite-plugin-svg-spritesheet/main/images/logo.png" alt="A playful logo for vite-plugin-svg-spritesheet featuring an S, V and G shape surrounded by glass tiles" width="400"/>

**Type-safe, build-time SVG spritesheets for Vite projects**\
Generate a single optimized spritesheet with automatic TypeScript definitions, directory-based overrides, optional CSS variable theming — all with zero runtime overhead.

## Why this plugin?

This plugin was built to support needs that I couldn't find in existing solutions:

- **Layered directory overrides:** Use multiple directories with override priority, enabling clean layering (e.g. base icons overridden by custom sets).
- **Theming without duplication:** Replaces `fill` and `color` with CSS variables using [`initial`](https://drafts.csswg.org/css-variables/#guaranteed-invalid) fallbacks, allowing flexible theming (like `currentColor`) without duplicating icons.

## Key benefits

- **No runtime dependencies:** Output is generated during build, keeping bundles clean.
- **Automatic type generation:** Ensures type safety and editor autocomplete.
- **Directory-based overrides:** Supports clean layering of base and custom icons.
- **Theming support:** Replaces static `fill` and `stroke` with CSS variables and fallbacks.
- **Customizable symbol IDs:** Control naming with directory-aware defaults or custom functions.

## Quick start

```bash
npm install vite-plugin-svg-spritesheet --save-dev
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import {
  generateStringUnion,
  svgSpritesheet,
} from 'vite-plugin-svg-spritesheet';

export default defineConfig({
  plugins: [
    svgSpritesheet({
      include: ['src/assets/icons/base', 'src/assets/icons/theme'],
      output: 'public/spritesheet.svg',
      svgoConfig: {
        plugins: [
          // An issue when with Figma's exports might be that colors are applied
          // via the `style` attribute, making it impossible to override it with
          // the parent's `currentColor`.
          'convertStyleToAttrs',
          // To generate unique IDs for each <symbol> in case they are
          // internally referenced, e.g. a gradient in <defs>.
          'prefixIds',
        ],
      },
      types: {
        generateTypes: generateStringUnion('IconName'),
        output: 'src/generated/icons.ts',
      },
    }),
  ],
});
```

## TypeScript integration

The plugin supports automatic type generation, enabling editor autocomplete and safer, maintainable icon usage:

```typescript
export type IconName = 'icon-sm-add' | 'icon-md-delete' | 'icon-lg-change';

export enum IconName {
  ICON_SM_ADD = 'icon-sm-add',
  ICON_MD_DELETE = 'icon-md-delete',
  ICON_LG_CHANGE = 'icon-lg-change',
}
```

You can also pass a custom function to generateTypes to control the output format.

## Plugin Options

Below are the configuration options available for `svgSpritesheet`:

| Option                   | Type                                                   | Description                                                                                                                                                |
| ------------------------ | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `include`                | `string \| string[]`                                   | Ordered list of directories to include. Later ones override earlier ones.                                                                                  |
| `exclude`                | `string \| string[]`                                   | Glob patterns for files or directories to exclude.                                                                                                         |
| `output`                 | `string`                                               | Output path for the generated SVG spritesheet.                                                                                                             |
| `svgoConfig`             | `object`                                               | [SVGO](https://svgo.dev/) configuration for optimization.                                                                                                  |
| `symbolId.prefix`        | `string`                                               | Prefix prepended to all symbol IDs. Defaults to "icon".                                                                                                    |
| `symbolId.id`            | `(filePath: string, parsedPath: ParsedPath) => string` | Custom function for the `id` attribute of the `<symbol>`.                                                                                                  |
| `replaceColorAttributes` | `boolean`                                              | Replaces `fill` and `stroke` with a CSS variable for `currentColor` support. See the [examples](#available-examples) for this in action.                   |
| `types.output`           | `string`                                               | Path for the generated TypeScript types.                                                                                                                   |
| `types.generateTypes`    | `(map: SpriteMap) => string`                           | Function that receives the sprite map and can return TypeScript types. The exported `generateEnum` and `generateStringUnion` functions can be used as well |

## Framework integration

This repository includes usage examples for several frameworks in the /examples directory. These examples are self-contained and are not included in the published npm package.

### Available examples

| Framework | Directory                        | Live demo                          |
| --------- | -------------------------------- | ---------------------------------- |
| Vanilla   | [/examples/vanilla][vanilla-dir] | [Open in StackBlitz][vanilla-live] |
| Astro     | [/examples/astro][astro-dir]     | [Open in StackBlitz][astro-live]   |
| Vue       | [/examples/vue][vue-dir]         | [Open in StackBlitz][vue-live]     |

[vanilla-dir]: https://github.com/imjasonmiller/vite-plugin-svg-spritesheet/tree/main/examples/vanilla
[vanilla-live]: https://stackblitz.com/github/imjasonmiller/vite-plugin-svg-spritesheet/tree/main/examples/vanilla
[astro-dir]: https://github.com/imjasonmiller/vite-plugin-svg-spritesheet/tree/main/examples/astro
[astro-live]: https://stackblitz.com/github/imjasonmiller/vite-plugin-svg-spritesheet/tree/main/examples/astro
[vue-dir]: https://github.com/imjasonmiller/vite-plugin-svg-spritesheet/tree/main/examples/vue
[vue-live]: https://stackblitz.com/github/imjasonmiller/vite-plugin-svg-spritesheet/tree/main/examples/vue

### Running locally

To run any example locally:

```bash
cd examples/<framework>
npm install
npm run dev
```

Replace `<framework>` with one of the supported options (e.g. `vanilla`, `vue`, `astro`).
