# `vite-plugin-svg-spritesheet 👨🏽‍🎨`

![npm version](https://img.shields.io/npm/v/vite-plugin-svg-spritesheet?style=flat) ![Build Status](https://img.shields.io/github/actions/workflow/status/imjasonmiller/vite-plugin-svg-spritesheet/ci.yml?style=flat) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**Fast, scalable, and type-safe SVG spritesheets for Vite**\
Bundle and optimize your SVG icons into a single spritesheet with live updates and TypeScript support.

## Features

- **Performance and efficiency:** Built entirely at build-time with no runtime dependencies, this plugin optimizes SVGs using SVGO, caches intelligently using content hashes, and scales effortlessly to thousands of icons with batch processing.

- **Developer experience:** Enjoy instant type-safe integration with generated TypeScript unions or enums, automatic live reload on file changes, and full control over SVGO config, symbol IDs, and type declarations.

- **Flexibility:** Icons can be organized across multiple directories (e.g. `base/`, `theme/`, `custom/`). Later directories take precedence, allowing for clean overrides. Symbol IDs reflect directory structure by default, but can be customized.

## Installation

```bash
npm install vite-plugin-svg-spritesheet --save-dev
```

## Quick start

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
        plugins: ['preset-default', 'prefixIds'],
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

The plugin supports automatic type generation for safer, maintainable icon usage:

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

| Option                   | Type                           | Description                                                                |
| ------------------------ | ------------------------------ | -------------------------------------------------------------------------- |
| `include`                | `string \| string[]`           | Ordered list of directories to include. Later ones override earlier ones.  |
| `output`                 | `string`                       | Output path for the generated SVG spritesheet.                             |
| `svgoConfig`             | `object`                       | [SVGO](https://svgo.dev/) configuration for optimization.                  |
| `customSymbolId`         | `(path: ParsedPath) => string` | Custom function for the `id` attribute of the `<symbol>`.                  |
| `replaceColorAttributes` | `boolean`                      | Replaces `fill` and `stroke` with CSS variables for `currentColor` support |
| `types.output`           | `string`                       | Path for the generated TypeScript types.                                   |
| `types.generateTypes`    | `(map: SpriteMap) => string`   | Function that receives the sprite map and can return TypeScript types.     |

## Framework integration

This repository includes usage examples for several frameworks in the /examples directory. These examples are self-contained and are not included in the published npm package.

### Available examples

| Framework | Directory                                                                                                    | Live demo                                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Vanilla   | [/examples/vanilla](https://github.com/imjasonmiller/vite-plugin-svg-spritesheet/tree/main/examples/vanilla) | [Open in StackBlitz](https://stackblitz.com/github/imjasonmiller/vite-plugin-svg-spritesheet/tree/main/examples/vanilla) |

### Running locally

To run any example locally:

```bash
cd examples/<framework>
npm install
npm run dev
```

Replace `<framework>` with one of the supported options (e.g., `vue`, `react`).

<details>
  <summary>Vue</summary>

**Icon.vue**

```vue
<template>
  <div>
    <svg class="icon" viewBox="0 0 24 24">
      <use :href="spriteUrl"></use>
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
