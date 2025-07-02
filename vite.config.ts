/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { builtinModules } from 'module';
import fs from 'fs/promises';
import dts from 'unplugin-dts/vite';
import { dependencies } from './package.json';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'vitePluginSvgSpritesheet',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vite', ...Object.keys(dependencies), ...builtinModules],
      output: {
        globals: {
          vite: 'vite',
        },
      },
    },
  },
  plugins: [
    dts({
      bundleTypes: true,
      afterBuild: async () => {
        // To pass publint and have proper types for both ESM and CJS we have to
        // duplicate them and add the correct export in package.json's `exports`.
        //
        // See: https://github.com/qmhc/vite-plugin-dts/issues/267
        await fs.copyFile('dist/index.d.ts', 'dist/index.d.cts');
      },
    }),
  ],
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
    },
    testTimeout: 30_000,
  },
});
