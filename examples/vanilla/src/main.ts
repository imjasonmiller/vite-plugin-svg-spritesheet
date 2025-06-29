import type { IconName } from './generated/icons';

function getSpriteElement(sprite: IconName) {
  const useEl = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  useEl.setAttribute('href', `/spritesheet.svg#${sprite}`);

  const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgEl.setAttribute('class', 'icon');
  svgEl.setAttribute('viewBox', '0 0 128 128');
  svgEl.appendChild(useEl);

  return svgEl;
}

function main() {
  const spritesEl = document.querySelector<HTMLDivElement>('.sprites');
  if (!spritesEl) return;

  const divEl = document.createElement('div');
  divEl.setAttribute('style', '--c: currentColor;');
  divEl.appendChild(getSpriteElement('icon-a'));

  spritesEl.appendChild(divEl);
  divEl.style.color = '#985DF7';

  const inputColorEl = document.querySelector<HTMLInputElement>('input');
  if (!inputColorEl) return;

  inputColorEl.addEventListener('input', (event: Event): void => {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }

    divEl.style.color = event.target.value;
  });

  const sprites: IconName[] = ['icon-b', 'icon-c', 'icon-d'];

  for (const sprite of sprites) {
    spritesEl.appendChild(getSpriteElement(sprite));
  }
}

main();
