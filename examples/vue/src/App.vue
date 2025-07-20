<template>
  <div id="app">
    <div class="current-color-controls">
      <input
        type="color"
        id="current-color"
        name="current-color"
        value="#985DF7"
        @input="handleColorInput"
      />
      <label for="current-color">Current color</label>
    </div>
    <div ref="spritesRef" class="sprites" :style="{ color: color }">
      <Icon name="icon-a" has-current-color />
      <Icon name="icon-b" />
      <Icon name="icon-c" />
      <Icon name="icon-d" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Icon from './components/Icon.vue';

const color = ref('initial');

function handleColorInput(event: Event) {
  if (!(event.target instanceof HTMLInputElement)) {
    return;
  }

  color.value = event.target.value;
}
</script>
