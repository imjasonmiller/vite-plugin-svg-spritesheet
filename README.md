# `vite-plugin-svg-spritesheet 👨🏽‍🎨`

**Fast, scalable, and fully typed SVG spritesheets for Vite.**

Bundles your SVG icons into a single optimized SVG.

Includes generated TypeScript types, layered overrides, live development updates, and smart file-based caching.

## Features
- **Build-time bundling** – No runtime dependencies or JavaScript injection.
- **Layered directory support** – Organize icons into folders like `base/`, `theme/`, and `custom/`, where later folders in the `include` array override earlier ones. This allows you to build up icon sets with custom theming or fallbacks.
- **SVGO optimization** – Minify and clean SVGs during build.
- **Type-safe integration** – Exports [TypeScript types](#typescript-integration) for icon names.
- **Live dev updates** – Automatically refreshes spritesheet on file change.
- **Content-based caching** – Only processes changed files, via hashing.
- **Directory-based namespacing** – Auto-generates IDs based on directory structure.
- **Custom symbol IDs** – Generate ID logic per file via `customSymbolId()`.
- **Batch processing** – Efficiently handles large-scale icon libraries.

## Installation
```bash
npm add vite-plugin-svg-spritesheet --save-dev
```

## How to use
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { generateTypeDeclaration, svgSpritesheet }  from 'vite-plugin-svg-spritesheet';

export default defineConfig({
  plugins: [
    svgSpritesheet({
      include: [
        "node_modules/amazing-icons/src/base",
        "src/assets/icons/theme",
      ],
      svgoConfig: {
        floatPrecision: 2,
        multipass: true,
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                removeViewBox: false,
              },
            },
          },
          "prefixIds",
        ],
      },
      output: "public/spritesheet.svg",
      types: {
        // Generate a string literal union with `IconName` as the exported
        // type name. For enums there is a similar `generateEnumDeclaration`
        // function.
        generateDeclaration: generateTypeDeclaration("IconName"),
        output: "src/generated/icons.ts",
      },
    })
  ],
});
```

## TypeScript integration
The plugin can generate icon names as a string literal union, an enum or generate something of your own by passing a function that receives a `Map` of all current sprites.

```typescript
// String literal union
export type IconName = 'icon-sm-a' | 'icon-md-b' | 'icon-lg-c';
// Enum
export enum IconName {
  ICON_SM_A = "icon-sm-a",
  ICON_MD_B = "icon-md-b",
  ICON_LG_C = "icon-lg-c",
}
````

 ## Plugin Options

 Below are the configuration options available for `svgSpritesheet`:

| Option              | Type                                 | Description                                                               |
|---------------------|--------------------------------------|---------------------------------------------------------------------------|
| `include`           | `string[]`                           | Ordered list of directories to include. Later ones override earlier ones. |
| `output`            | `string`                             | Path to output SVG file.                                                  |
| `svgoConfig`        | `object`                             | Custom [SVGO](https://svgo.dev/) configuration.                           |
| `customSymbolId`    | `(path: ParsedPath) => string`       | Custom function for the `id` attribute of the icon's `<symbol />`.        |
| `types.output`      | `string`                             | Path to output generated TypeScript types.                                |
| `types.generateDeclaration` | `(map: SpriteMap) => string` | Function that generates a TS declaration from the sprite map.             |

## Framework integration

<details>
  <summary>Vue</summary>

  **Icon.vue**

```vue
<template>
  <div>
    <svg class="icon" viewBox="0 0 24 24">
      <use :xlink:href="spriteUrl"></use>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
// The spritesheet is copied to the desired folder and imported as a URL
import spritesheetUrl from "./../assets/spritesheet.svg?url";

import type { IconName } from "./../generated/icons";

interface IconProps {
  name: IconName;
}

const { name } = defineProps<IconProps>();

const spriteUrl = computed(() => `${spritesheetUrl}#${name}`);
</script>
```
It can then be used like below:

```vue
<template>
  <Icon name="icon-md-general-edit" />
</template>
```
</details>
