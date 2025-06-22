/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { builtinModules } from 'module';
import dts from 'unplugin-dts/vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'vitePluginSvgSpritesheet',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vite', ...builtinModules],
      output: {
        globals: {
          vite: 'vite',
        },
      },
    },
  },
  plugins: [dts({ bundleTypes: true })],
  test: {
    coverage: {
      provider: 'v8',
    },
    testTimeout: 30_000,
  },
});
