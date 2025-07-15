import os from 'os';
import path from 'path';
import fs from 'fs/promises';
import { build } from 'vite';
import { describe, expect, it, afterEach, beforeEach } from 'vitest';
import { svgSpritesheet } from '../src/index';

describe('svgSpritesheet plugin (integration)', () => {
  const fixturesDir = path.resolve(__dirname, 'fixtures');

  let tempDir: string;

  beforeEach(async () => {
    // Create a temporary directory that will contain the output
    tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), 'vite-plugin-svg-spritesheet-test')
    );
  });

  afterEach(async () => {
    // Remove temp directory and all contents recursively after test
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('ignores patterns listed in exclude', async () => {
    const spritePath = path.join(tempDir, 'spritesheet.svg');

    await build({
      build: {
        write: false,
      },
      plugins: [
        svgSpritesheet({
          include: fixturesDir,
          exclude: ['c.svg', 'nested/d.svg'],
          output: spritePath,
        }),
      ],
    });

    const exists = await fs
      .access(spritePath)
      .then(() => true)
      .catch(() => false);

    expect(exists).toBe(true);

    const content = await fs.readFile(spritePath, 'utf8');

    // Ensure the spritesheet output doesn't unexpectedly change
    expect(content).toMatchSnapshot();

    // Check that all icon names are in the sprite
    expect(content).toContain('id="icon-a"');
    expect(content).toContain('id="icon-b"');
    expect(content).not.toContain('id="icon-c"');
    expect(content).not.toContain('id="nested-icon-d"');
  });

  it('generates a spritesheet from fixture SVGs', async () => {
    const spritePath = path.join(tempDir, 'spritesheet.svg');

    await build({
      build: {
        write: false,
      },
      plugins: [
        svgSpritesheet({
          include: fixturesDir,
          output: spritePath,
        }),
      ],
    });

    const exists = await fs
      .access(spritePath)
      .then(() => true)
      .catch(() => false);

    expect(exists).toBe(true);

    const content = await fs.readFile(spritePath, 'utf8');

    // Ensure the spritesheet output doesn't unexpectedly change
    expect(content).toMatchSnapshot();

    // Check that all icon names are in the sprite
    expect(content).toContain('id="icon-a"');
    expect(content).toContain('id="icon-b"');
    expect(content).toContain('id="icon-c"');
    expect(content).toContain('id="icon-nested-d"');
  });
});
