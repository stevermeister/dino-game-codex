import { AudioController } from './audio.js';
import { Game } from './game.js';
import { ObstacleManager } from './obstacle.js';
import { Scoreboard } from './scoreboard.js';
import { registerControls } from './controls.js';

const stage = document.querySelector('.stage');
const dino = document.getElementById('dino');
const obstacle = document.getElementById('obstacle');
const startButton = document.getElementById('start-button');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');

const scoreboard = new Scoreboard(scoreElement, highScoreElement);
const obstacleManager = new ObstacleManager(obstacle);
const audio = new AudioController();

const game = new Game({
  stage,
  dino,
  obstacleManager,
  startButton,
  scoreboard,
  audio,
});

registerControls({ game, stage, startButton });

document.addEventListener('visibilitychange', () => {
  game.handleVisibilityChange(document.hidden);
});

obstacle.addEventListener('animationiteration', (event) => {
  // Ignore iterations from nested animations (e.g. bird wing flaps)
  if (event.animationName !== 'move-obstacle') {
    return;
  }
  const obstacleRect = obstacle.getBoundingClientRect();
  const stageRect = stage.getBoundingClientRect();

  if (obstacleRect.right > stageRect.left) {
    return;
  }

  obstacleManager.randomize(scoreboard.score);
});

game.initialize();
