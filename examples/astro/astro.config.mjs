// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import {
  svgSpritesheet,
  generateStringUnion,
} from 'vite-plugin-svg-spritesheet';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [
      svgSpritesheet({
        include: 'src/assets',
        output: 'public/spritesheet.svg',
        replaceColorAttributes: true,
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
  },
});
