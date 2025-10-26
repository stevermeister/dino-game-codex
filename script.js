const stage = document.querySelector('.stage');
const dino = document.getElementById('dino');
const obstacle = document.getElementById('obstacle');
const startButton = document.getElementById('start-button');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');

let isJumping = false;
let isPlaying = false;
let isCrouching = false;
let score = 0;
let speedMs = 1500;
let frameId = null;
let lastTime = null;
let hitTimeoutId = null;
const SPEED_MIN = 700;
const SPEED_STEP = 40;
const BIRD_BASE_CHANCE = 0.2;
const BIRD_MAX_CHANCE = 0.7;

const OBSTACLE_VARIANTS = {
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

function loadHighScore() {
  try {
    const stored = localStorage.getItem('dino-high-score');
    const parsed = Number.parseInt(stored || '0', 10);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch (error) {
    console.warn('Unable to load high score:', error);
    return 0;
  }
}

function persistHighScore(value) {
  try {
    localStorage.setItem('dino-high-score', value.toString());
  } catch (error) {
    console.warn('Unable to save high score:', error);
  }
}

let highScore = loadHighScore();
updateScore(0);
updateHighScore(highScore);

function updateScore(value) {
  score = value;
  scoreEl.textContent = Math.floor(score).toString();
}

function updateHighScore(value) {
  highScore = value;
  highScoreEl.textContent = highScore.toString();
  persistHighScore(highScore);
}

function randomRange(min, max) {
  if (min === max) return min;
  return Math.round(Math.random() * (max - min)) + min;
}

function chooseObstacleVariant() {
  const normalized = Math.min(Math.floor(score) / 500, 1);
  const birdChance = BIRD_BASE_CHANCE + normalized * (BIRD_MAX_CHANCE - BIRD_BASE_CHANCE);
  return Math.random() < birdChance ? 'bird' : 'cactus';
}

function randomizeObstacle() {
  const variantKey = chooseObstacleVariant();
  const variant = OBSTACLE_VARIANTS[variantKey];
  obstacle.dataset.type = variantKey;
  obstacle.classList.remove('cactus', 'bird');
  obstacle.classList.add(variant.className);
  const bottom = randomRange(variant.bottom[0], variant.bottom[1]);
  obstacle.style.setProperty('--obstacle-width', `${variant.width}px`);
  obstacle.style.setProperty('--obstacle-height', `${variant.height}px`);
  obstacle.style.setProperty('--obstacle-bottom', `${bottom}px`);
  obstacle.setAttribute('aria-label', variant.label);
}

function startGame() {
  if (isPlaying) return;
  if (hitTimeoutId) {
    clearTimeout(hitTimeoutId);
    hitTimeoutId = null;
  }
  stopCrouch();
  updateScore(0);
  resetObstacle();
  stage.classList.remove('paused');
  stage.classList.remove('hit');
  startButton.classList.add('hidden');
  speedMs = 1500;
  stage.style.setProperty('--speed', `${speedMs}ms`);
  isPlaying = true;
  lastTime = null;
  frameId = requestAnimationFrame(loop);
}

function endGame() {
  if (!isPlaying) return;
  isPlaying = false;
  stage.classList.add('paused');
  startButton.textContent = 'Play Again';
  startButton.classList.remove('hidden');
  cancelAnimationFrame(frameId);
  stopCrouch();
  stage.classList.remove('hit');
  // force reflow to restart hit animation
  void stage.offsetWidth; // eslint-disable-line no-unused-expressions
  stage.classList.add('hit');
  hitTimeoutId = setTimeout(() => {
    stage.classList.remove('hit');
    hitTimeoutId = null;
  }, 400);
  if (Math.floor(score) > highScore) {
    updateHighScore(Math.floor(score));
  }
  lastTime = null;
}

function loop(timestamp) {
  if (!isPlaying) return;
  frameId = requestAnimationFrame(loop);
  if (document.hidden) {
    lastTime = timestamp;
    return;
  }
  if (lastTime === null) {
    lastTime = timestamp;
    return;
  }
  const delta = timestamp - lastTime;
  lastTime = timestamp;
  increaseDifficulty(delta);
  checkCollision();
  updateScore(score + delta / 100);
}

function increaseDifficulty(deltaMs) {
  if (speedMs <= SPEED_MIN) return;
  const decrement = (deltaMs / 1000) * SPEED_STEP;
  speedMs = Math.max(SPEED_MIN, speedMs - decrement);
  stage.style.setProperty('--speed', `${speedMs}ms`);
}

function checkCollision() {
  const dinoRect = dino.getBoundingClientRect();
  const obstacleRect = obstacle.getBoundingClientRect();

  const isHorizontalOverlap =
    dinoRect.right - 10 > obstacleRect.left && obstacleRect.right > dinoRect.left + 10;
  const isVerticalOverlap =
    dinoRect.bottom - 8 > obstacleRect.top && dinoRect.top + 8 < obstacleRect.bottom;

  if (isHorizontalOverlap && isVerticalOverlap) {
    if (obstacle.dataset.type === 'bird' && isCrouching) {
      const hasClearance = dinoRect.top + 12 >= obstacleRect.bottom;
      if (hasClearance) {
        return;
      }
    }
    endGame();
  }
}

function resetObstacle() {
  randomizeObstacle();
  obstacle.style.animation = 'none';
  // force reflow to restart animation
  void obstacle.offsetWidth; // eslint-disable-line no-unused-expressions
  obstacle.style.animation = '';
}

function jump() {
  if (isJumping || !isPlaying) return;
  if (isCrouching) {
    stopCrouch();
  }
  isJumping = true;
  dino.classList.add('jump');
  setTimeout(() => {
    dino.classList.remove('jump');
    isJumping = false;
  }, 600);
}

function startCrouch() {
  if (isCrouching || !isPlaying || isJumping) return;
  isCrouching = true;
  dino.classList.add('crouch');
}

function stopCrouch() {
  if (!isCrouching) return;
  isCrouching = false;
  dino.classList.remove('crouch');
}

function handleKeyDown(event) {
  if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') {
    event.preventDefault();
    if (!isPlaying) {
      startGame();
    }
    jump();
  } else if (event.code === 'ArrowDown' || event.code === 'KeyS') {
    event.preventDefault();
    if (!isPlaying) {
      startGame();
    }
    startCrouch();
  }
}

function handleKeyUp(event) {
  if (event.code === 'ArrowDown' || event.code === 'KeyS') {
    event.preventDefault();
    stopCrouch();
  }
}

function handlePointerDown(event) {
  if (!event.isPrimary || event.target.closest('#start-button')) {
    return;
  }
  event.preventDefault();
  if (!isPlaying) {
    startGame();
  }
  if (!isPlaying) {
    return;
  }
  const rect = stage.getBoundingClientRect();
  const isLowerHalf = event.clientY > rect.top + rect.height / 2;
  if (isLowerHalf) {
    startCrouch();
  } else {
    jump();
  }
}

function handlePointerUp(event) {
  if (!event.isPrimary) return;
  event.preventDefault();
  stopCrouch();
}

startButton.addEventListener('click', startGame);
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
stage.addEventListener('pointerdown', handlePointerDown);
stage.addEventListener('pointerup', handlePointerUp);
stage.addEventListener('pointerleave', handlePointerUp);
stage.addEventListener('pointercancel', handlePointerUp);
obstacle.addEventListener('animationiteration', randomizeObstacle);
window.addEventListener('blur', stopCrouch);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stage.classList.add('paused');
    stopCrouch();
  } else if (isPlaying) {
    stage.classList.remove('paused');
  }
});

stage.classList.add('paused');
startButton.classList.remove('hidden');
randomizeObstacle();
