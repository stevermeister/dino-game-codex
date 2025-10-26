import { OBSTACLE_VARIANTS, BIRD_BASE_CHANCE, BIRD_MAX_CHANCE } from './constants.js';

function randomRange(min, max) {
  if (min === max) {
    return min;
  }
  return Math.round(Math.random() * (max - min)) + min;
}

export class ObstacleManager {
  constructor(element) {
    this.element = element;
    this.currentType = 'cactus';
  }

  getType() {
    return this.currentType;
  }

  getBoundingClientRect() {
    return this.element.getBoundingClientRect();
  }

  randomize(score = 0) {
    const type = this.chooseVariant(score);
    const variant = OBSTACLE_VARIANTS[type];
    this.currentType = type;

    this.element.dataset.type = type;
    this.element.classList.remove('cactus', 'bird');
    this.element.classList.add(variant.className);

    const bottom = randomRange(variant.bottom[0], variant.bottom[1]);
    this.element.style.setProperty('--obstacle-width', `${variant.width}px`);
    this.element.style.setProperty('--obstacle-height', `${variant.height}px`);
    this.element.style.setProperty('--obstacle-bottom', `${bottom}px`);
    this.element.setAttribute('aria-label', variant.label);
  }

  resetAnimation(score = 0) {
    this.randomize(score);
    this.element.style.animation = 'none';
    // force reflow to restart animation
    void this.element.offsetWidth; // eslint-disable-line no-unused-expressions
    this.element.style.animation = '';
  }

  chooseVariant(score) {
    const normalized = Math.min(Math.floor(score) / 500, 1);
    const birdChance = BIRD_BASE_CHANCE + normalized * (BIRD_MAX_CHANCE - BIRD_BASE_CHANCE);
    return Math.random() < birdChance ? 'bird' : 'cactus';
  }
}
