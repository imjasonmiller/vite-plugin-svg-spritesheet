# `vite-plugin-svg-spritesheet 👨🏽‍🎨`

![npm version](https://img.shields.io/npm/v/vite-plugin-svg-spritesheet?style=flat) ![Build Status](https://img.shields.io/github/actions/workflow/status/imjasonmiller/vite-plugin-svg-spritesheet/ci.yml?style=flat)

**Fast, scalable, and type-safe SVG spritesheets for Vite**\
Bundle and optimize your SVG icons into a single spritesheet with live updates and TypeScript support.

## Features

- **Performance and efficiency:** Built entirely at build-time with no runtime dependencies, this plugin optimizes SVGs using SVGO, caches intelligently using content hashes, and scales effortlessly to thousands of icons with batch processing.

- **Developer experience:** Enjoy instant type-safe integration with generated TypeScript unions or enums, automatic live reload on file changes, and full control over SVGO config, symbol IDs, and type declarations.

- **Flexibility:** Icons can be layered from multiple folders (e.g. `base/`, `theme/`, `custom/`), with later folders overriding earlier ones. Symbol IDs reflect directory structure by default, but you can fully customize them using your own logic.

## Installation

```bash
npm install vite-plugin-svg-spritesheet --save-dev
```

## How to use

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import {
  generateTypeDeclaration,
  svgSpritesheet,
} from 'vite-plugin-svg-spritesheet';

export default defineConfig({
  plugins: [
    svgSpritesheet({
      include: ['src/assets/icons/base', 'src/assets/icons/theme'],
      output: 'public/spritesheet.svg',
      svgoConfig: {
        plugins: ['preset-default', 'prefixIds'],
      },
      types: {
        generateDeclaration: generateTypeDeclaration('IconName'),
        output: 'src/generated/icons.ts',
      },
    }),
  ],
});
```

## TypeScript integration

The plugin can generate icon names as a string literal union, an enum or generate something of your own by passing a function that receives a `Map` of all current sprites.

```typescript
export type IconName = 'icon-sm-add' | 'icon-md-delete' | 'icon-lg-change';

export enum IconName {
  ICON_SM_ADD = 'icon-sm-add',
  ICON_MD_DELETE = 'icon-md-delete',
  ICON_LG_CHANGE = 'icon-lg-change',
}
```

## Plugin Options

Below are the configuration options available for `svgSpritesheet`:

| Option                      | Type                           | Description                                                               |
| --------------------------- | ------------------------------ | ------------------------------------------------------------------------- |
| `include`                   | `string \| string[]`           | Ordered list of directories to include. Later ones override earlier ones. |
| `output`                    | `string`                       | Path to output SVG file.                                                  |
| `svgoConfig`                | `object`                       | Custom [SVGO](https://svgo.dev/) configuration.                           |
| `customSymbolId`            | `(path: ParsedPath) => string` | Custom function for the `id` attribute of the icon's `<symbol />`.        |
| `types.output`              | `string`                       | Path to output generated TypeScript types.                                |
| `types.generateDeclaration` | `(map: SpriteMap) => string`   | Function that generates a TS declaration from the sprite map.             |

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
import { computed } from 'vue';
// The spritesheet is copied to the desired folder and imported as a URL
import spritesheetUrl from './../assets/spritesheet.svg?url';

import type { IconName } from './../generated/icons';

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
