<template>
  <svg
    class="icon"
    viewBox="0 0 24 24"
    :style="{
      '--c': hasCurrentColor ? 'currentColor' : 'initial',
    }"
  >
    <use :href="`/spritesheet.svg#${name}`"></use>
  </svg>
</template>

<script setup lang="ts">
import type { IconName } from './../generated/icons';

interface IconProps {
  name: IconName;
  hasCurrentColor?: boolean;
}

const { name, hasCurrentColor } = defineProps<IconProps>();
</script>
