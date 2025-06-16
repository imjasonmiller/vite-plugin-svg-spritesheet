# `vite-plugin-svg-spritesheet 👨🏽‍🎨`

A Vite plugin that enables you to generate SVG spritesheets along with SVGO
optimization and TypeScript type generation.

## Framework components

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
