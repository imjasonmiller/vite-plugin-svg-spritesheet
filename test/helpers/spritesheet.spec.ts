import { describe, it, expect, beforeEach } from 'vitest';
import { generateEnum, generateStringUnion } from '../../src';
import type { SpriteMap } from '../../src/types';

const spriteMapFixture: SpriteMap = new Map([
  [
    'a.svg',
    {
      spriteId: { id: 'a', prefix: 'icon', full: 'icon-a' },
      spriteString: '',
      layerIndex: 0,
      hash: '',
    },
  ],
  [
    'b.svg',
    {
      spriteId: { id: 'b', prefix: 'icon', full: 'icon-b' },
      spriteString: '',
      layerIndex: 0,
      hash: '',
    },
  ],
]);

describe('generates an enum spritesheet type', () => {
  let result: string;

  beforeEach(() => {
    result = generateEnum('IconName')(spriteMapFixture);
  });

  it('does not include the prefix in the enum member name', () => {
    expect(result).toContain('A = "icon-a"');
    expect(result).toContain('B = "icon-b"');
  });

  it('matches expected snapshot', () => {
    expect(result).toMatchSnapshot();
  });
});

describe('generates an string union spritesheet type', () => {
  let result: string;

  beforeEach(() => {
    result = generateStringUnion('IconName')(spriteMapFixture);
  });

  it('includes the prefix in the union member', () => {
    expect(result).toContain('"icon-a"');
    expect(result).toContain('"icon-b"');
  });

  it('matches expected snapshot', () => {
    expect(result).toMatchSnapshot();
  });
});
