export const SPEED_INITIAL = 3200;
export const SPEED_MIN = 1600;
export const SPEED_STEP = 16;
export const BIRD_BASE_CHANCE = 0.2;
export const BIRD_MAX_CHANCE = 0.7;

export const JUMP_VELOCITY = 1120;
export const GRAVITY = 4200;

export const OBSTACLE_VARIANTS = {
  cactus: {
    className: 'cactus',
    width: 32,
    height: 50,
    bottom: [40, 40],
    label: 'Cactus',
  },
  bird: {
    className: 'bird',
    width: 48,
    height: 32,
    bottom: [110, 150],
    label: 'Pterodactyl',
  },
};
